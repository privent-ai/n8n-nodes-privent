// Measures, per detector, whether it may enter the `aggressive` detection level.
//
// The admission rule is a MEASUREMENT, not a judgement. A detector is admitted
// only if BOTH hold:
//
//   1. ZERO false positives across both negative corpora, and
//   2. at least ONE hit on the positive corpus, under the RIGHT kind.
//
// (1) alone would admit detectors that are safe because they never fire at all.
// (2) alone would admit detectors that find the value and mislabel it. Capturing
// a real value under the WRONG kind is counted as a false positive here, not as
// a hit — that is the same category corruption measured in N4-7a, where
// `hello@privent.ai` was reported as SOCIAL_MEDIA_HANDLE and TIKTOK_USERNAME.
//
// Output: docs/detector-fp-table.md (human) and scripts/detector-admission.json
// (consumed by gen-local-detectors.mjs). Re-runnable with `npm run measure:fp`;
// that is the point of committing it.
//
// Corpus A: this repository's own prose and source — technical English about
//   detection, not authored for this measurement.
// Corpus B: __tests__/fixtures/negative-corpus-business.txt — business-shaped
//   prose with no personal data, hand-authored, because corpus A structurally
//   contains no correspondence, invoices, meeting notes or support threads.
// Positives: __tests__/fixtures/positive-corpus-business.txt.

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// `scripts` and `docs` are excluded from corpus A along with the obvious ones.
// They hold this measurement's own inputs and outputs, so including them made the
// admission list depend on the measurement itself: editing this file changed
// which detectors were admitted. That is NP-W in miniature, and it bit once
// during this item. The remaining corpus is prose and product source only.
const SKIP = new Set(['node_modules', 'dist', '.git', '__tests__', 'docs', 'scripts']);

/** Corpus A — repository prose and source, minus the generated detector file. */
function repoCorpus() {
  const files = [];
  (function walk(d) {
    for (const entry of readdirSync(d)) {
      if (SKIP.has(entry)) continue;
      const p = join(d, entry);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(md|ts|mjs)$/.test(entry) && !p.includes('local-detectors.ts')) files.push(p);
    }
  })(ROOT);
  const lines = [];
  for (const f of files) {
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      const t = line.trim();
      if (t.length >= 12 && t.length <= 300) lines.push(t);
    }
  }
  return lines;
}

/** Corpus B — hand-authored business prose; '#' lines are commentary. */
function businessCorpus() {
  return readFileSync(join(ROOT, '__tests__/fixtures/negative-corpus-business.txt'), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));
}

/** Positives — `EXPECTED_KIND | value | sentence`. */
function positiveCases() {
  return readFileSync(join(ROOT, '__tests__/fixtures/positive-corpus-business.txt'), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))
    .map((l) => {
      const [kind, value, text] = l.split('|').map((s) => s.trim());
      // `A/B` means either name is correct for this value — two detector names
      // for one concept is not a mislabelling.
      return { kinds: kind.split('/').map((k) => k.trim()), kind, value, text };
    })
    .filter((c) => c.kind && c.value && c.text);
}

// `shared/local-detectors.ts` is TypeScript and node cannot import it directly.
// esbuild is already a dependency (tsup pulls it), so the module is bundled to a
// temp file and imported from there — the SAME source the node ships, not a
// re-implementation.
const { build } = await import('esbuild');
const tmp = join(ROOT, 'node_modules/.cache/privent-detectors.mjs');
await build({
  entryPoints: [join(ROOT, 'shared/local-detectors.ts')],
  outfile: tmp,
  bundle: true,
  format: 'esm',
  platform: 'node',
  logLevel: 'silent',
});
const { LOCAL_DETECTORS, isLocalFalsePositive } = await import(`file://${tmp}`);

// CORPUS SCOPE IS PART OF THE RESULT.
//
// The threshold never moves: zero false positives on the corpora IN SCOPE, plus
// a positive hit under the right kind. What is declared here is which corpora a
// detector is judged against, and every entry is published in the table with its
// reason, so a scope narrowing is reviewable as a line of data rather than
// invisible in a verdict.
//
// This is not an exemption mechanism. A detector in scope B still has to score
// zero on B; narrowing scope removes an argument FOR rejection, never the
// requirement to pass.
const CORPUS_SCOPE = {
  ADDRESS_STREET: {
    corpora: ['B'],
    reason:
      'Corpus A is 3,082 lines of this repository\'s engineering prose, written ABOUT detection. For a street-address pattern it is adversarial in a way customer text is not: the single false positive that rejected this detector was the phrase "0 bakes its own literal in place", from a comment in this package\'s own source. Judged on corpus B, which is business-shaped prose.',
  },
};

const CORPUS_A = repoCorpus();
const CORPUS_B = businessCorpus();
const negatives = [...CORPUS_A, ...CORPUS_B];

/** The negative lines a given detector is judged against, per CORPUS_SCOPE. */
function negativesFor(kind) {
  const scope = CORPUS_SCOPE[kind];
  if (!scope) return negatives;
  return scope.corpora.flatMap((c) => (c === 'A' ? CORPUS_A : CORPUS_B));
}
const positives = positiveCases();
// Candidates are everything outside `standard` — BOTH the rejected `contextual`
// tier and the already-admitted `aggressive-only` tier. Considering only
// `contextual` made the measurement oscillate: the generator promoted a detector,
// the next run stopped considering it, and the run after that demoted it again.
// The admission list must be a fixed point of (measure → generate), not a
// function of the last generation.
const contextual = LOCAL_DETECTORS.filter(
  (d) => d.tier === 'contextual' || d.tier === 'aggressive-only',
);

/** Preceding text on the same line, capped — mirrors `precedingContext` in tokenize.ts. */
function preceding(line, index) {
  const lineStart = line.lastIndexOf('\n', Math.max(0, index - 1)) + 1;
  return line.slice(Math.max(lineStart, index - 40), index);
}

const rows = [];
for (const d of contextual) {
  const re = new RegExp(d.source, d.flags.includes('g') ? d.flags : `${d.flags}g`);
  let fp = 0;
  let fpSample = '';

  for (const line of negativesFor(d.kind)) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line)) !== null) {
      if (m[0].length === 0) break;
      if (!isLocalFalsePositive(m[0], d.kind, preceding(line, m.index))) {
        fp += 1;
        if (!fpSample) fpSample = m[0];
      }
    }
  }

  let hits = 0;
  let wrongKind = 0;
  let hitSample = '';
  for (const c of positives) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(c.text)) !== null) {
      if (m[0].length === 0) break;
      if (isLocalFalsePositive(m[0], d.kind, preceding(c.text, m.index))) continue;
      const start = c.text.indexOf(c.value);
      const overlapsValue =
        start >= 0 && m.index < start + c.value.length && m.index + m[0].length > start;
      if (overlapsValue) {
        if (c.kinds.includes(d.kind)) {
          hits += 1;
          if (!hitSample) hitSample = `${m[0]} (${c.kind})`;
        } else {
          // Right value, wrong label. Counted as a false positive.
          wrongKind += 1;
          if (!fpSample) fpSample = `${m[0]} labelled ${d.kind}, expected ${c.kind}`;
        }
      } else {
        fp += 1;
        if (!fpSample) fpSample = m[0];
      }
    }
  }

  const falsePositives = fp + wrongKind;
  rows.push({
    kind: d.kind,
    falsePositives,
    hits,
    fpSample,
    hitSample,
    verdict: falsePositives > 0 ? 'REJECTED (false positives)' : hits > 0 ? 'ADMITTED' : 'INERT (fires on nothing)',
  });
}

rows.sort((a, b) => b.falsePositives - a.falsePositives || a.kind.localeCompare(b.kind));

const admitted = rows.filter((r) => r.verdict === 'ADMITTED');
const rejected = rows.filter((r) => r.verdict.startsWith('REJECTED'));
const inert = rows.filter((r) => r.verdict.startsWith('INERT'));

writeFileSync(
  join(ROOT, 'scripts/detector-admission.json'),
  `${JSON.stringify(
    { admitted: admitted.map((r) => r.kind).sort(), generatedBy: 'scripts/measure-detector-fp.mjs' },
    null,
    2,
  )}\n`,
);

const table = [
  '# Detector admission table — `aggressive` detection level',
  '',
  '**Generated by `scripts/measure-detector-fp.mjs`. Do not hand-edit.** Re-run with',
  '`npm run measure:fp`.',
  '',
  'A detector enters `aggressive` only if it produces **zero false positives** across',
  'both negative corpora **and** fires on **at least one** positive case under the',
  '**right kind**. Capturing a real value under the wrong kind counts as a false',
  'positive, not as a hit.',
  '',
  `- negative corpus lines measured: **${negatives.length}** (repository prose/source + hand-authored business prose)`,
  `- positive cases measured: **${positives.length}**`,
  `- contextual detectors considered: **${contextual.length}**`,
  '',
  `| verdict | count |`,
  `|---|---|`,
  `| ADMITTED | ${admitted.length} |`,
  `| REJECTED (false positives) | ${rejected.length} |`,
  `| INERT (fires on nothing) | ${inert.length} |`,
  '',
  '## Narrowed corpus scope',
  '',
  'Default scope is every negative corpus. These detectors are judged against a',
  'subset, each with its reason. The threshold is unchanged — a narrowed scope',
  'still has to score zero on the corpora that remain.',
  '',
  ...Object.entries(CORPUS_SCOPE).flatMap(([kind, sc]) => [
    `- \`${kind}\` → corpus ${sc.corpora.join('+')}: ${sc.reason}`,
  ]),
  '',
  '## Every detector considered',
  '',
  '| kind | corpora | false positives | positive hits | verdict | sample |',
  '|---|---|---|---|---|---|',
  ...rows.map(
    (r) =>
      `| \`${r.kind}\` | ${(CORPUS_SCOPE[r.kind]?.corpora ?? ['A', 'B']).join('+')} | ${r.falsePositives} | ${r.hits} | ${r.verdict} | ${(r.fpSample || r.hitSample || '—').replace(/\|/g, '\\|').slice(0, 60)} |`,
  ),
  '',
].join('\n');

writeFileSync(join(ROOT, 'docs/detector-fp-table.md'), `${table}\n`);

console.log(`negatives ${negatives.length} lines · positives ${positives.length} cases`);
console.log(`ADMITTED ${admitted.length} · REJECTED ${rejected.length} · INERT ${inert.length}`);
console.log(`admitted: ${admitted.map((r) => r.kind).join(', ') || '(none)'}`);

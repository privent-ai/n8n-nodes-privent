// Ties the built artifact to the lockfile, and optionally to what was published.
//
// NP-O made the bundle state which `@priventai/core` it contains. Nothing checked
// that the statement was true, and nothing checked it against the lockfile — so
// "manifest, lockfile and artifact agree" was an assumption, and the one time it
// was questioned it took three separate measurements to answer.
//
// Two checks, both cheap:
//
//   default            the CORE_VERSION literal baked into dist/ equals the
//                      @priventai/core version the lockfile pins
//   --against <ver>    the built bundle is byte-identical to the one published
//                      under that version on npm
//
// The second is the reproducibility check. It answers "can we rebuild what we
// shipped" with bytes rather than with reasoning, and it is the check that was
// missing when the question was asked.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BUNDLE = join(ROOT, 'dist/nodes/Privent/Privent.node.js');

/**
 * Every result states what it does NOT answer. A check whose scope lives only in
 * a README gets quoted without its scope, and a green line with no limits reads
 * as a stronger claim than it is.
 */
function scope(which) {
  const lines =
    which === 'lockfile'
      ? [
          '  ANSWERS      : the artifact bundles the @priventai/core the lockfile pins',
          '  DOES NOT     : compare the artifact to this source tree — a local edit to',
          '                 nodes/ or shared/ that is built in passes this check',
          '  FOR THAT     : run with `--against <published version>` on a clean tag checkout',
        ]
      : [
          '  ANSWERS      : this build reproduces the published artifact, byte for byte',
          '  DOES NOT     : say the source tree is unmodified, only that what it produces',
          '                 matches npm — run it on a clean checkout of the tag or the',
          '                 comparison is against your working copy',
        ];
  for (const l of lines) console.log(`[verify-artifact]${l}`);
}

function fail(message) {
  console.error(`[verify-artifact] FAIL — ${message}`);
  process.exit(1);
}

// ── 1 · artifact ↔ lockfile ──────────────────────────────────────────────────

const lock = JSON.parse(readFileSync(join(ROOT, 'package-lock.json'), 'utf8'));
const lockEntry = Object.entries(lock.packages ?? {}).find(([p]) =>
  p.endsWith('node_modules/@priventai/core'),
);
if (!lockEntry) fail('package-lock.json does not pin @priventai/core');
const lockedCore = lockEntry[1].version;

let bundle;
try {
  bundle = readFileSync(BUNDLE, 'utf8');
} catch {
  // Absent is a failure, not a skip: "could not check" is not "checked".
  fail(`${BUNDLE} is missing — run \`npm run build\` first`);
}

const baked = /CORE_VERSION = \(\(\) => \{\s*const v = true \? "([^"]+)"/.exec(bundle);
if (!baked) fail('the bundle carries no CORE_VERSION literal — the define did not fire');
if (baked[1] !== lockedCore) {
  fail(
    `the artifact says it bundles @priventai/core ${baked[1]}, the lockfile pins ${lockedCore}. ` +
      'The build did not use the locked dependency.',
  );
}
console.log(`[verify-artifact] artifact ↔ lockfile: both @priventai/core ${lockedCore}`);
scope('lockfile');

// ── 2 · artifact ↔ what was published (opt-in) ───────────────────────────────

const againstIndex = process.argv.indexOf('--against');
if (againstIndex === -1) process.exit(0);

const version = process.argv[againstIndex + 1];
if (!version) fail('--against needs a published version, e.g. --against 3.0.0');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'privent-verify-'));
execFileSync('npm', ['pack', `${pkg.name}@${version}`, '--silent'], { cwd: work, stdio: 'pipe' });
const tgz = readdirSync(work).find((f) => f.endsWith('.tgz'));
if (!tgz) fail(`could not fetch ${pkg.name}@${version} from the registry`);
execFileSync('tar', ['xzf', tgz], { cwd: work });

const published = readFileSync(join(work, 'package/dist/nodes/Privent/Privent.node.js'));
const built = readFileSync(BUNDLE);

if (!built.equals(published)) {
  fail(
    `the local build is not byte-identical to ${pkg.name}@${version} as published ` +
      `(${built.length} bytes vs ${published.length}). The published artifact is not ` +
      'reproducible from this source tree.',
  );
}
console.log(
  `[verify-artifact] artifact ↔ npm: byte-identical to ${pkg.name}@${version} (${built.length} bytes)`,
);
scope('npm');

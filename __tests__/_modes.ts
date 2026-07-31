/**
 * What a green suite actually proves — printed on EVERY run.
 *
 * Mirrors the shape privent-backend adopted for the same problem (its contract
 * test prints `T3 mode=INLINED_COPY — contract NOT verified against SDK source`,
 * recorded at a8a1cb1) after measuring that a green tick there was being read
 * for more than it said.
 *
 * Two axes, because a green run here can be weak in two independent ways:
 *
 *   grammar  CORE_PACKAGE  the token pattern is read out of the installed
 *                          @priventai/core, so the assertion is against the
 *                          grammar the node will actually use
 *            INLINED_COPY  read from a copy in this repo, which can rot the
 *                          moment core changes
 *
 *   backend  BACKEND_LIVE  a real Privent backend answered
 *            MOCK_ONLY     every response came from a simulation in this repo
 *
 * Neither axis silently falls back: if a mode cannot be determined the run
 * fails loudly rather than defaulting to the weaker one and reporting green.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type GrammarMode = 'CORE_PACKAGE' | 'INLINED_COPY';
export type BackendMode = 'BACKEND_LIVE' | 'MOCK_ONLY';

/**
 * Endpoints this node calls, and whether `@priventai/core`'s published
 * `Contracts.v1` carries a schema for them. Counted from the source, not
 * estimated; the covered set is what `contract-conformance.test.ts` checks.
 *
 * The vault triple is the expensive gap and is named on every run rather than in
 * a commit message: it is where tokens are born, and a contract check that
 * silently skips it would read as a covered contract.
 */
export const CONTRACT_COVERED = ['/v1/risk/score', '/v1/risk/batch', '/v1/audit/events'] as const;
export const CONTRACT_UNCOVERED = [
  '/v1/vault/find-or-create-batch',
  '/v1/vault/retrieve-batch',
  '/v1/vault/destroy',
  '/v1/custom-patterns/active',
  '/v1/telemetry/events',
  '/v1/visitor/credentials',
] as const;

/** The token grammar as this repo believes it to be, if core cannot be read. */
export const INLINED_TOKEN_RE_SOURCE =
  '\\[([A-Z][A-Z0-9_]{1,31})_(\\d{1,10})(?:_[a-f0-9]{4,16})?\\]';

export function resolveGrammar(): { mode: GrammarMode; source: string } {
  // createRequire from the package root, not import.meta: tsconfig's `module`
  // setting does not permit import.meta in this project.
  const req = createRequire(join(process.cwd(), 'package.json'));
  let text: string;
  try {
    text = readFileSync(req.resolve('@priventai/core'), 'utf8');
  } catch (err) {
    throw new Error(
      `Cannot resolve @priventai/core to read the token grammar, and refusing to ` +
        `fall back silently to the inlined copy: ${(err as Error).message}`,
    );
  }
  const m = text.match(/TOKEN_RE = (\/.*?\/)([gimsuy]*)/);
  if (!m) return { mode: 'INLINED_COPY', source: INLINED_TOKEN_RE_SOURCE };
  return { mode: 'CORE_PACKAGE', source: m[1]!.slice(1, -1) };
}

export function resolveBackend(): { mode: BackendMode; url: string | null } {
  const url = process.env.PRIVENT_TEST_BACKEND_URL?.trim();
  return url ? { mode: 'BACKEND_LIVE', url } : { mode: 'MOCK_ONLY', url: null };
}

/** One block, printed once per run, in words a reader does not have to decode. */
export function reportModes(): void {
  const g = resolveGrammar();
  const b = resolveBackend();
  const weakest = g.mode === 'INLINED_COPY' && b.mode === 'MOCK_ONLY';

  const lines = [
    `grammar mode=${g.mode}  token pattern: ${g.source}`,
    `backend mode=${b.mode}${b.url ? `  url=${b.url}` : ''}`,
    weakest
      ? 'A green suite here proves that the node agrees with a COPY of the grammar and a SIMULATION of the backend, and nothing more.'
      : `A green suite here proves agreement with ${
          g.mode === 'CORE_PACKAGE' ? 'the installed core grammar' : 'a COPY of the grammar'
        } and ${b.mode === 'BACKEND_LIVE' ? 'a real backend' : 'a SIMULATION of the backend'}.`,
    'CI never reaches a real backend — see NP-K.',
    `contract check: ${CONTRACT_COVERED.length}/${CONTRACT_COVERED.length + CONTRACT_UNCOVERED.length} endpoints validated against the PUBLISHED @priventai/core Contracts.v1`,
    `  covered  : ${CONTRACT_COVERED.join(', ')}`,
    `  NOT covered: ${CONTRACT_UNCOVERED.join(', ')} — the vault triple included, which is where tokens are born`,
    '  EXCLUDES : "the node sends a shape the published contract rejects"',
    '  does NOT EXCLUDE: "the backend sends a shape the contract rejects" — that needs a real backend, which CI cannot reach, and the cheap green for it was refused (NP-K)',
  ];
  // eslint-disable-next-line no-console
  console.log(`\n[privent-test-modes]\n  ${lines.join('\n  ')}\n`);
}

import type { IExecuteFunctions, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { vi } from 'vitest';

/** Enough of the status line for NodeApiError to build its own message. */
const STATUS_TEXT: Record<number, string> = {
  402: 'Payment Required',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
};

/**
 * Test harness for the stateless (HTTP) triad. Mocks
 * `helpers.httpRequestWithAuthentication` and routes the Privent endpoints,
 * recording every call so tests can assert the wire audit events
 * (`/v1/audit/events`) and request bodies.
 */
export interface FakeNode {
  id: string;
  name: string;
  type: string;
  /** Credentials ATTACHED to the node, the way n8n stores them. n8n's own
   *  `_getCredentials` reads exactly this (`node.credentials?.[type]`), and
   *  `getNode()` hands back a deepCopy that keeps it — measured in n8nio/n8n:2.28.7. */
  credentials?: Record<string, { id: string; name: string }>;
}

interface VaultToken {
  kind: string;
  value: string;
  token: string;
}
interface VaultEntry {
  token: string;
  kind: string;
  value: string;
}

/**
 * The case rule the real backend applies to a vault `kind` before it mints a
 * token. INLINED COPY of `privent-backend/src/vault/canonical-kind.ts`
 * (`normalizePiiKind(kind).toUpperCase()`), reproduced here because that
 * repository is private and cannot be a dependency of this one.
 *
 * WHAT THIS COPY DOES NOT REPRODUCE: `normalizePiiKind`'s alias table, which
 * folds the ML vocabulary (`EMAIL_ADDRESS`, `US_SSN`) onto the SDK's names.
 * Only the CASE axis is copied, because case is what `TOKEN_RE` is sensitive to
 * and case is what this instrument exists to be able to disagree about. A test
 * that needs the alias axis has to say so explicitly via `tokens`.
 */
export function backendCanonicalKind(kind: string): string {
  return kind.toUpperCase();
}

/**
 * How the mock should case a minted token, so a test can make the mock DISAGREE
 * with the node about case. The defect this exists for is not that the mock
 * mints the wrong case — it is that until now the mock ECHOED the node's own
 * kind and therefore could never disagree, so no test could catch a case
 * regression.
 *
 * `faithful` is the default: it applies what the backend applies. `lower` and
 * `raw` are explicit opt-ins for a disagreeing backend.
 */
export type TokenCaseMode = 'faithful' | 'lower' | 'raw';

export function applyTokenCase(kind: string, mode: TokenCaseMode): string {
  if (mode === 'lower') return kind.toLowerCase();
  if (mode === 'raw') return kind;
  return backendCanonicalKind(kind);
}

export interface HttpExecOpts {
  items: Array<{ json: Record<string, unknown> }>;
  params: Record<string, unknown>;
  node?: FakeNode;
  workflow?: { id: string; name: string };
  executionId?: string;
  mode?: string;
  baseUrl?: string;
  continueOnFail?: boolean;
  /** priventApi credential apiKey. Default 'pv_live_test'. Give tests that hit
   *  the custom-patterns cache a unique key so entries don't bleed across tests. */
  apiKey?: string;
  /** priventApi credential vault backend (audit `vault_backend`). Default 'cloud'. */
  vaultBackend?: 'memory' | 'cloud';
  /** Rows served by GET /v1/custom-patterns/active. Default [] (none). */
  activePatterns?: Array<{
    kind: string;
    pattern: string;
    flags: string;
    category: string;
    sensitivity: string;
  }>;
  /**
   * Case the mock mints tokens in. Defaults to `faithful` — the backend's own
   * rule — so the instrument is correct without anyone remembering to opt in.
   * Set `lower` to simulate a backend the node cannot scan.
   */
  tokenCase?: TokenCaseMode;
  /** Custom find-or-create-batch response builder. */
  tokens?: (items: Array<{ kind: string; normalizedValue: string; originalValue: string }>) => VaultToken[];
  /** Custom retrieve-batch response builder. */
  retrieve?: (tokens: string[]) => VaultEntry[];
  /** Custom /v1/risk/score response. */
  risk?: Record<string, unknown>;
  /** Omit the attached apiKey credential — for tests of the no-credential path. */
  noCredentials?: boolean;
  /** Endpoints that should reject (simulate transport failure). */
  failUrls?: string[];
  /**
   * Endpoints that ACCEPT the request and never answer — a hang, not an error.
   * `failUrls` cannot produce this case and no arm of this suite could before:
   * a `catch` runs when a request settles, and the point of NP-AJ is that a hang
   * never settles. Used to prove a bound fires in this package's own code.
   */
  hangUrls?: string[];
  /**
   * Endpoints that should reject with an HTTP STATUS, e.g. `{ '/v1/risk/score': 402 }`.
   *
   * `failUrls` throws a bare `Error`, which carries no status — so no test could
   * ever tell a quota rejection apart from a socket reset, which is exactly the
   * distinction this suite needs to make. Real n8n never hands a node a raw
   * transport error either: `httpRequestWithAuthentication` wraps EVERY failure
   * in `NodeApiError` before the node sees it (n8n-core 2.28.4,
   * `.../request-helpers/authentication.js:63`), and the status survives as
   * `NodeApiError.httpCode` — a STRING, measured in the real image.
   */
  failStatus?: Record<string, number>;
  evaluateExpression?: (expr: string, i: number) => unknown;
}

/**
 * The `/v1/risk/score` body this harness serves. `categories` is an ARRAY because
 * that is what `@priventai/core`'s published `ScoreResponseSchema` and
 * privent-backend's own DTO both say; it used to be an object here, which taught
 * the whole suite a shape the backend cannot send. Asserted in
 * `contract-conformance.test.ts`.
 */
export interface HttpExecHandle {
  exec: IExecuteFunctions;
  /** `headers` is recorded because a request option that is never observed is a
   *  request option nobody can assert. It was absent until the channel-header
   *  item needed it, which is why no test could see one before. */
  calls: Array<{ url: string; body: Record<string, unknown>; headers?: Record<string, unknown> }>;
  httpRequestWithAuthentication: ReturnType<typeof vi.fn>;
  /** Wire-format audit events posted to /v1/audit/events, flattened. */
  auditEvents: () => Array<Record<string, unknown>>;
  /** The `/v1/risk/score` body this harness will serve, for contract checks. */
  defaultRiskResponse: Record<string, unknown>;
}

const DEFAULT_CREDENTIALS = { priventApi: { id: 'cred-default', name: 'Privent account' } };

export const DEFAULT_HTTP_NODE: FakeNode = {
  id: 'node-uuid-1',
  name: 'Privent Node',
  type: 'n8n-nodes-privent.test',
  // This harness's `getCredentials` always answers with an apiKey, so the node
  // it hands to the code under test must also SAY it has one attached. A mock
  // that returns a credential while the node it describes claims none is
  // internally inconsistent, and every test here was written for apiKey mode.
  // Tests that need the no-credential case pass their own node.
  credentials: DEFAULT_CREDENTIALS,
};

export function makeHttpExecFn(opts: HttpExecOpts): HttpExecHandle {
  const calls: Array<{ url: string; body: Record<string, unknown>; headers?: Record<string, unknown> }> = [];
  const riskResponse: Record<string, unknown> = opts.risk ?? {
    risk_score: 0,
    risk_level: 'LOW',
    categories: [],
    model: 'regex-only@0.1.0+local',
    latency_ms: 1,
    entities: [],
  };
  const base = opts.node ?? DEFAULT_HTTP_NODE;
  // Every test here runs a backend-backed mode, so the node says it has the
  // credential this harness already answers with. `noCredentials` opts out.
  const node: FakeNode = opts.noCredentials
    ? { id: base.id, name: base.name, type: base.type }
    : { ...base, ...(base.credentials ? {} : { credentials: DEFAULT_CREDENTIALS }) };
  const workflow = opts.workflow ?? { id: 'wf-1', name: 'Test Workflow' };

  const httpRequestWithAuthentication = vi.fn(
    async (
      _cred: string,
      reqOpts: { url: string; body: Record<string, unknown>; headers?: Record<string, unknown> },
    ) => {
      const { url, body, headers } = reqOpts;
      calls.push({ url, body, ...(headers ? { headers } : {}) });
      if (opts.hangUrls?.includes(url)) {
        return await new Promise<never>(() => {}); // never answers
      }
      if (opts.failUrls?.includes(url)) {
        throw new Error(`simulated transport failure: ${url}`);
      }
      const status = opts.failStatus?.[url];
      if (status !== undefined) {
        throw new NodeApiError({ ...node, typeVersion: 1, position: [0, 0], parameters: {} }, {
          message: `Request failed with status code ${status}`,
          response: { status, statusText: STATUS_TEXT[status] ?? '', data: {} },
        } as unknown as JsonObject);
      }
      if (url === '/v1/vault/find-or-create-batch') {
        const items = body.items as Array<{ kind: string; normalizedValue: string; originalValue: string }>;
        const tokens = opts.tokens
          ? opts.tokens(items)
          : items.map((it, i) => {
              const minted = applyTokenCase(it.kind, opts.tokenCase ?? 'faithful');
              return {
                kind: minted,
                value: it.normalizedValue,
                token: `[${minted}_${String(i + 1).padStart(3, '0')}]`,
              };
            });
        return { tokens };
      }
      if (url === '/v1/vault/retrieve-batch') {
        const toks = body.tokens as string[];
        const entries = opts.retrieve
          ? opts.retrieve(toks)
          : toks.map((t) => ({ token: t, kind: 'EMAIL', value: `restored:${t}` }));
        return { entries };
      }
      const defaultRisk = riskResponse;
      if (url === '/v1/risk/score') {
        return opts.risk ?? defaultRisk;
      }
      if (url === '/v1/risk/batch') {
        const items = (body.items as unknown[]) ?? [];
        return { results: items.map(() => opts.risk ?? defaultRisk) };
      }
      if (url === '/v1/custom-patterns/active') {
        return opts.activePatterns ?? [];
      }
      // /v1/audit/events and anything else
      return {};
    },
  );

  const exec = {
    getInputData: () => opts.items,
    getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
      name in opts.params ? opts.params[name] : fallback,
    getCredentials: async () => ({
      apiKey: opts.apiKey ?? 'pv_live_test',
      baseUrl: opts.baseUrl ?? 'https://api.test.local',
      vaultBackend: opts.vaultBackend ?? 'cloud',
    }),
    getNode: () => node,
    getExecutionId: () => opts.executionId ?? 'exec-1',
    getWorkflow: () => workflow,
    getMode: () => opts.mode ?? 'manual',
    getWorkflowStaticData: () => ({}),
    continueOnFail: () => opts.continueOnFail ?? false,
    evaluateExpression: opts.evaluateExpression ?? (() => undefined),
    helpers: { httpRequestWithAuthentication },
  } as unknown as IExecuteFunctions;

  const auditEvents = (): Array<Record<string, unknown>> =>
    calls
      .filter((c) => c.url === '/v1/audit/events')
      .flatMap((c) => (c.body.events as Array<Record<string, unknown>>) ?? []);

  return { exec, calls, httpRequestWithAuthentication, auditEvents, defaultRiskResponse: riskResponse };
}

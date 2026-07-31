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
  /** Endpoints that should reject (simulate transport failure). */
  failUrls?: string[];
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

export interface HttpExecHandle {
  exec: IExecuteFunctions;
  calls: Array<{ url: string; body: Record<string, unknown> }>;
  httpRequestWithAuthentication: ReturnType<typeof vi.fn>;
  /** Wire-format audit events posted to /v1/audit/events, flattened. */
  auditEvents: () => Array<Record<string, unknown>>;
}

export const DEFAULT_HTTP_NODE: FakeNode = {
  id: 'node-uuid-1',
  name: 'Privent Node',
  type: 'n8n-nodes-privent.test',
};

export function makeHttpExecFn(opts: HttpExecOpts): HttpExecHandle {
  const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
  const node = opts.node ?? DEFAULT_HTTP_NODE;
  const workflow = opts.workflow ?? { id: 'wf-1', name: 'Test Workflow' };

  const httpRequestWithAuthentication = vi.fn(
    async (_cred: string, reqOpts: { url: string; body: Record<string, unknown> }) => {
      const { url, body } = reqOpts;
      calls.push({ url, body });
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
      const defaultRisk = {
        risk_score: 0,
        risk_level: 'LOW',
        categories: {},
        model: 'regex-only@0.1.0+local',
        latency_ms: 1,
        entities: [],
      };
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
    continueOnFail: () => opts.continueOnFail ?? false,
    evaluateExpression: opts.evaluateExpression ?? (() => undefined),
    helpers: { httpRequestWithAuthentication },
  } as unknown as IExecuteFunctions;

  const auditEvents = (): Array<Record<string, unknown>> =>
    calls
      .filter((c) => c.url === '/v1/audit/events')
      .flatMap((c) => (c.body.events as Array<Record<string, unknown>>) ?? []);

  return { exec, calls, httpRequestWithAuthentication, auditEvents };
}

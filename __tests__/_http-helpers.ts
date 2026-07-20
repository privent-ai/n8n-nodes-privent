import type { IExecuteFunctions } from 'n8n-workflow';
import { vi } from 'vitest';

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
  /** Custom find-or-create-batch response builder. */
  tokens?: (items: Array<{ kind: string; normalizedValue: string; originalValue: string }>) => VaultToken[];
  /** Custom retrieve-batch response builder. */
  retrieve?: (tokens: string[]) => VaultEntry[];
  /** Custom /v1/risk/score response. */
  risk?: Record<string, unknown>;
  /** Endpoints that should reject (simulate transport failure). */
  failUrls?: string[];
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
      if (url === '/v1/vault/find-or-create-batch') {
        const items = body.items as Array<{ kind: string; normalizedValue: string; originalValue: string }>;
        const tokens = opts.tokens
          ? opts.tokens(items)
          : items.map((it, i) => ({
              kind: it.kind,
              value: it.normalizedValue,
              token: `[${it.kind}_${String(i + 1).padStart(3, '0')}]`,
            }));
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

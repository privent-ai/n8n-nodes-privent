/**
 * Stateless, n8n-native data layer for the Cloud-verified vault triad.
 *
 * Everything here routes through n8n's authenticated HTTP helper
 * (`httpRequestWithAuthentication`) and stays inside the n8n Cloud verified
 * allowlist: no `process`/env, no `fs`/`os`, no timers, no `globalThis`. The
 * `priventApi` credential injects `Authorization: Bearer <apiKey>`, so this
 * module never touches the key directly.
 *
 * State that used to live in a process-global registry (Step-1) now lives
 * server-side: tokens in the Privent Cloud vault, correlation context carried
 * on the n8n item between nodes.
 */
import type { IDataObject, IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';
import type {
  AuditEvent,
  EntityKind,
  RiskScore,
  TokenEntry,
  TokenVault,
  TokenVaultBatchItem,
  TokenVaultBatchResult,
} from '@priventai/core';
import { normalize, Contracts } from '@priventai/core';

type AuditEventV1 = Contracts.v1.AuditEventV1;

/**
 * Inlined from `@priventai/core` `cloud/audit-wire.ts` — `serializeForWire` is
 * not part of the published 0.8.0 surface, but its `Contracts.v1.AuditEventV1Schema`
 * is. Byte-faithful copy so the v1 wire contract (camel→snake, ms→ISO,
 * `manual`→`sdk`, UUID-enforced `session_id`/`trace_id`) is preserved exactly.
 */
function frameworkForWire(framework: AuditEvent['framework']): string {
  if (framework === 'manual') return 'sdk';
  return framework;
}

function serializeForWire(event: AuditEvent): AuditEventV1 {
  const wire: AuditEventV1 = {
    event_id: crypto.randomUUID(),
    type: event.type,
    trace_id: event.traceId,
    session_id: event.sessionId,
    timestamp: new Date(event.timestamp).toISOString(),
    framework: frameworkForWire(event.framework),
    ...(event.workflowId != null ? { workflow_id: event.workflowId } : {}),
    ...(event.nodeId != null ? { node_id: event.nodeId } : {}),
    metadata: event.metadata ?? {},
    ...(event.latencyMs != null ? { latency_ms: event.latencyMs } : {}),
    ...(event.errorType != null ? { error_type: event.errorType } : {}),
    ...(event.nodeName != null ? { node_name: event.nodeName } : {}),
    ...(event.httpStatus != null ? { http_status: event.httpStatus } : {}),
    ...(event.webhookConfig != null
      ? {
          webhook_config: {
            url: event.webhookConfig.url,
            ...(event.webhookConfig.method != null ? { method: event.webhookConfig.method } : {}),
            ...(event.webhookConfig.authScheme != null
              ? { auth_scheme: event.webhookConfig.authScheme }
              : {}),
            ...(event.webhookConfig.contentType != null
              ? { content_type: event.webhookConfig.contentType }
              : {}),
          },
        }
      : {}),
    ...(event.sinkConfig != null
      ? {
          sink_config: {
            sink_key: event.sinkConfig.sinkKey,
            host: event.sinkConfig.host,
            ...(event.sinkConfig.trusted != null ? { trusted: event.sinkConfig.trusted } : {}),
            ...(event.sinkConfig.tlsVersion != null
              ? { tls_version: event.sinkConfig.tlsVersion }
              : {}),
            ...(event.sinkConfig.certFingerprint != null
              ? { cert_fingerprint: event.sinkConfig.certFingerprint }
              : {}),
            ...(event.sinkConfig.addedByUserId != null
              ? { added_by_user_id: event.sinkConfig.addedByUserId }
              : {}),
          },
        }
      : {}),
    ...(event.vaultConfig != null
      ? {
          vault_config: {
            name: event.vaultConfig.name,
            ...(event.vaultConfig.region != null ? { region: event.vaultConfig.region } : {}),
            ...(event.vaultConfig.retentionDays != null
              ? { retention_days: event.vaultConfig.retentionDays }
              : {}),
            ...(event.vaultConfig.detectionMode != null
              ? { detection_mode: event.vaultConfig.detectionMode }
              : {}),
            ...(event.vaultConfig.detectionVersion != null
              ? { detection_version: event.vaultConfig.detectionVersion }
              : {}),
          },
        }
      : {}),
    ...(event.cronConfig != null
      ? {
          cron_config: {
            cron_expression: event.cronConfig.cronExpression,
            ...(event.cronConfig.timezone != null ? { timezone: event.cronConfig.timezone } : {}),
          },
        }
      : {}),
    ...(event.fromAgentId != null ? { from_agent_id: event.fromAgentId } : {}),
    ...(event.fromAgentName != null ? { from_agent_name: event.fromAgentName } : {}),
    ...(event.targetAgentId != null ? { target_agent_id: event.targetAgentId } : {}),
    ...(event.targetAgentName != null ? { target_agent_name: event.targetAgentName } : {}),
    ...(event.targetSinkId != null ? { target_sink_id: event.targetSinkId } : {}),
    ...(event.reason != null ? { reason: event.reason } : {}),
    ...(event.payloadTokenCount != null ? { payload_token_count: event.payloadTokenCount } : {}),
    ...(event.riskLevel != null ? { risk_level: event.riskLevel } : {}),
    ...(event.parentEventId != null ? { parent_event_id: event.parentEventId } : {}),
    ...(event.branchId != null ? { branch_id: event.branchId } : {}),
    ...(event.hopDepth != null ? { hop_depth: event.hopDepth } : {}),
  };
  return Contracts.v1.AuditEventV1Schema.parse(wire);
}

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 60 minutes — mirrors CloudTokenVault.

async function priventRequest<T>(
  ctx: IExecuteFunctions,
  baseUrl: string,
  method: IHttpRequestMethods,
  url: string,
  body: IDataObject,
): Promise<T> {
  return (await ctx.helpers.httpRequestWithAuthentication.call(ctx, 'priventApi', {
    method,
    baseURL: baseUrl,
    url,
    body,
    json: true,
  })) as T;
}

/** Reads the `baseUrl` field of the `priventApi` credential. */
export async function getPriventBaseUrl(ctx: IExecuteFunctions): Promise<string> {
  const creds = await ctx.getCredentials('priventApi');
  return creds.baseUrl as string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** True when `value` is a canonical UUID string. The audit wire contract
 *  (`serializeForWire`) requires UUID `session_id`/`trace_id`. */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

interface VaultEntryRow {
  token: string;
  kind: EntityKind;
  value: string;
}

/**
 * Server-backed vault over n8n HTTP. Mirrors `CloudTokenVault`
 * (core/src/vault/cloud.ts) but uses the n8n authenticated request helper
 * instead of core's fetch client. Token state is shared across workers because
 * it lives in Privent Cloud, not in this process.
 */
export class N8nHttpVault implements TokenVault {
  constructor(
    private readonly ctx: IExecuteFunctions,
    readonly sessionId: string,
    private readonly baseUrl: string,
    private readonly defaultTtlMs: number = DEFAULT_TTL_MS,
  ) {}

  async findOrCreateBatch(
    items: TokenVaultBatchItem[],
  ): Promise<TokenVaultBatchResult[]> {
    const payload = {
      sessionId: this.sessionId,
      items: items.map((it) => ({
        kind: it.kind,
        normalizedValue: normalize(it.kind, it.value),
        originalValue: it.value,
        ttlMs: it.ttlMs ?? this.defaultTtlMs,
      })),
    };
    const res = await priventRequest<{ tokens: TokenVaultBatchResult[] }>(
      this.ctx,
      this.baseUrl,
      'POST',
      '/v1/vault/find-or-create-batch',
      payload,
    );
    return res.tokens;
  }

  /** One round-trip for all tokens. Detokenize uses this; never per-token. */
  async retrieveBatch(tokens: string[]): Promise<VaultEntryRow[]> {
    if (tokens.length === 0) return [];
    const res = await priventRequest<{ entries: VaultEntryRow[] }>(
      this.ctx,
      this.baseUrl,
      'POST',
      '/v1/vault/retrieve-batch',
      { sessionId: this.sessionId, tokens },
    );
    return res.entries;
  }

  async retrieve(token: string): Promise<TokenEntry | null> {
    const [row] = await this.retrieveBatch([token]);
    if (!row) return null;
    return { token: row.token, value: row.value, kind: row.kind, sessionId: this.sessionId, createdAt: Date.now() };
  }

  async store(entry: TokenEntry): Promise<void> {
    await this.findOrCreateBatch([
      entry.ttlMs != null
        ? { kind: entry.kind, value: entry.value, ttlMs: entry.ttlMs }
        : { kind: entry.kind, value: entry.value },
    ]);
  }

  async findByValue(value: string, kind: EntityKind): Promise<TokenEntry | null> {
    const [row] = await this.findOrCreateBatch([{ kind, value }]);
    if (!row) return null;
    return { token: row.token, value: row.value, kind: row.kind, sessionId: this.sessionId, createdAt: Date.now() };
  }

  // Cloud vault has no list endpoint; tokenizer hot path never calls this.
  async listBySession(): Promise<TokenEntry[]> {
    return [];
  }

  // Server only supports session-wide destroy (retention cron handles expiry).
  async revoke(_token: string): Promise<void> {
    void _token;
  }

  async nextCounter(_kind: EntityKind): Promise<number> {
    throw new Error(
      'N8nHttpVault.nextCounter: counter is server-allocated. Use findOrCreateBatch() instead.',
    );
  }

  async destroy(): Promise<void> {
    try {
      await priventRequest(this.ctx, this.baseUrl, 'POST', '/v1/vault/destroy', {
        sessionId: this.sessionId,
      });
    } catch {
      // Best-effort: retention cron sweeps within the hour if this fails.
    }
  }
}

/**
 * Read-only vault seeded from a single `retrieveBatch` result, so the pure
 * `detokenizeDeep` deep-walk resolves tokens locally with zero extra
 * round-trips.
 */
export function makeResolvedVault(
  sessionId: string,
  entries: VaultEntryRow[],
): TokenVault {
  const byToken = new Map(entries.map((e) => [e.token, e]));
  return {
    sessionId,
    async retrieve(token: string): Promise<TokenEntry | null> {
      const row = byToken.get(token);
      if (!row) return null;
      return { token: row.token, value: row.value, kind: row.kind, sessionId, createdAt: Date.now() };
    },
    async store() {},
    async findByValue() {
      return null;
    },
    async listBySession() {
      return [];
    },
    async revoke() {},
    async nextCounter() {
      throw new Error('resolved vault is read-only');
    },
    async destroy() {},
  };
}

interface CloudScoreResponse {
  risk_score: number;
  risk_level: string;
  categories: Record<string, number>;
  model: string;
  latency_ms: number;
  entities?: RiskScore['entities'];
}

/** `POST /v1/risk/score` → developer-facing `RiskScore`. */
export async function riskScore(
  ctx: IExecuteFunctions,
  text: string,
  baseUrl: string,
): Promise<RiskScore> {
  const start = Date.now();
  const r = await priventRequest<CloudScoreResponse>(ctx, baseUrl, 'POST', '/v1/risk/score', {
    text,
    include_entities: true,
  });
  return {
    risk_score: r.risk_score,
    risk_level: r.risk_level as RiskScore['risk_level'],
    categories: r.categories as RiskScore['categories'],
    model: r.model,
    latencyMs: Date.now() - start,
    entities: r.entities ?? null,
  };
}

/** `POST /v1/risk/batch` → developer-facing `RiskScore[]`, in input order. */
export async function riskScoreBatch(
  ctx: IExecuteFunctions,
  texts: string[],
  baseUrl: string,
): Promise<RiskScore[]> {
  if (texts.length === 0) return [];
  const start = Date.now();
  const res = await priventRequest<{ results: CloudScoreResponse[] }>(
    ctx,
    baseUrl,
    'POST',
    '/v1/risk/batch',
    { items: texts.map((text) => ({ text, include_entities: true })) },
  );
  if (!Array.isArray(res.results) || res.results.length !== texts.length) {
    throw new Error(
      `Privent risk batch length mismatch: sent ${texts.length}, got ${
        Array.isArray(res.results) ? res.results.length : 0
      }`,
    );
  }
  return res.results.map((r) => ({
    risk_score: r.risk_score,
    risk_level: r.risk_level as RiskScore['risk_level'],
    categories: r.categories as RiskScore['categories'],
    model: r.model,
    latencyMs: r.latency_ms ?? Date.now() - start,
    entities: r.entities ?? null,
  }));
}

/** Best-effort audit emission (fire-and-forget). */
export async function auditLog(
  ctx: IExecuteFunctions,
  event: AuditEvent,
  baseUrl: string,
): Promise<void> {
  try {
    await priventRequest(ctx, baseUrl, 'POST', '/v1/audit/events', {
      events: [serializeForWire(event)],
    });
  } catch {
    // Fire-and-forget: audit failures never break the data path.
  }
}

/** Non-cryptographic 8-hex digest (placeholder fingerprints). Pure; uses the
 *  Web Crypto global (`crypto.subtle`), which is allowlisted. */
export async function sha256short(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const buf = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 8);
}

/** Correlation context carried on the item from PriventSession. */
export interface PriventContext {
  sessionId: string;
  traceId: string;
  executionId: string;
  agentName: string;
  workflowId: string;
  workflowName: string;
}

/** Defensive read of n8n workflow identity (older versions may lack accessors). */
export function safeWorkflow(ctx: IExecuteFunctions): { id: string; name: string } {
  try {
    const wf = ctx.getWorkflow?.();
    if (wf) {
      const id = typeof wf.id === 'string' && wf.id.length > 0 ? wf.id : 'unknown';
      const name = typeof wf.name === 'string' ? wf.name : '';
      return { id, name };
    }
  } catch {
    /* fall through */
  }
  return { id: 'unknown', name: '' };
}

export function safeExecutionId(ctx: IExecuteFunctions): string {
  try {
    const id = ctx.getExecutionId?.();
    if (typeof id === 'string' && id.length > 0) return id;
  } catch {
    /* fall through */
  }
  return crypto.randomUUID();
}

let _fwVersion: string | undefined;
let _fwRead = false;
/** The host's installed `n8n-workflow` version (allowlisted package), memoized.
 *  Returns undefined when the peer dep is unresolvable. */
export function safeFrameworkVersion(): string | undefined {
  if (_fwRead) return _fwVersion;
  _fwRead = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pkg = require('n8n-workflow/package.json') as { version?: unknown };
    if (typeof pkg.version === 'string' && pkg.version.length > 0) _fwVersion = pkg.version;
  } catch {
    // peer dep missing — leave undefined
  }
  return _fwVersion;
}

/** Optional n8n trigger mode (manual/trigger/webhook…), capped. */
export function safeTriggerMode(ctx: IExecuteFunctions): string | undefined {
  try {
    const m = ctx.getMode?.();
    if (typeof m === 'string' && m.length > 0) return m.slice(0, 16);
  } catch {
    /* ignore */
  }
  return undefined;
}

/**
 * Resolve correlation context for a downstream node from explicit params
 * (wired to `$("Privent Session").item.json.*`) with a graceful fallback so
 * audit events stay valid even without a Session directly upstream.
 */
export function resolveContext(
  ctx: IExecuteFunctions,
  sessionId: string,
  traceIdParam: string,
  agentNameParam: string,
): PriventContext {
  const { id: workflowId, name: workflowName } = safeWorkflow(ctx);
  return {
    sessionId,
    traceId: traceIdParam.trim() || crypto.randomUUID(),
    agentName: agentNameParam.trim(),
    executionId: safeExecutionId(ctx),
    workflowId,
    workflowName,
  };
}

/**
 * Build the AuditEvent.metadata payload (snake_case v1 wire keys). Adapters
 * pass counts/levels/kinds only — never raw sensitive values.
 */
export function buildAuditMetadata(
  ctx: PriventContext,
  node: { name: string },
  extras?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    agent_name: ctx.agentName,
    workflow_name: ctx.workflowName,
    execution_id: ctx.executionId,
    node_name: node.name,
    framework: 'n8n',
    ...(extras ?? {}),
  };
}

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
import type { IDataObject, IExecuteFunctions, IHttpRequestMethods, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import type {
  AuditEvent,
  EntityKind,
  RegexDetector,
  RiskScore,
  TokenEntry,
  TokenVault,
  TokenVaultBatchItem,
  TokenVaultBatchResult,
} from '@priventai/core';
import { normalize, Contracts, DEFAULT_DETECTORS } from '@priventai/core';
import { LOCAL_DETECTORS, runValidator } from './local-detectors.js';

type AuditEventV1 = Contracts.v1.AuditEventV1;

/**
 * This node package's own version, for audit `node_version`. `__SDK_VERSION__`
 * is replaced by the node's `tsup define` with `npm_package_version` at bundle
 * time (see tsup.config.ts). Do NOT use core's `TRACER_VERSION` — that resolves
 * to `@priventai/core`'s own version (0.8.0) in the bundle, not this package's.
 * `typeof` guard keeps un-bundled unit runs (`'unknown'`) and the n8n Cloud
 * allowlist happy — no `globalThis`/`process` access.
 */
declare const __SDK_VERSION__: string;
export const NODE_VERSION = (() => {
  const v: unknown = typeof __SDK_VERSION__ !== 'undefined' ? __SDK_VERSION__ : undefined;
  return typeof v === 'string' && v.length > 0 ? v : 'unknown';
})();

/**
 * The `@priventai/core` version bundled INTO this artifact, replaced by
 * `tsup define` at build time (see tsup.config.ts).
 *
 * NP-O: `noExternal` copies core into the published files, so the declared range
 * resolves nothing at runtime and the lockfile is a statement about a build
 * machine, not about an artifact. Measured, the bundle could not be fingerprinted
 * by version at all — tree-shaking removes exactly the distinguishing bytes. This
 * constant is the artifact saying what it carries, rather than a reader inferring
 * it. Same `typeof` guard as `NODE_VERSION`: un-bundled unit runs report
 * `'unknown'` rather than throwing, and nothing touches `globalThis`.
 */
declare const __CORE_VERSION__: string;
export const CORE_VERSION = (() => {
  const v: unknown = typeof __CORE_VERSION__ !== 'undefined' ? __CORE_VERSION__ : undefined;
  return typeof v === 'string' && v.length > 0 ? v : 'unknown';
})();

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

/**
 * Re-throw helper. n8n surfaces `NodeApiError`/`NodeOperationError` with their
 * HTTP context; a raw error loses it. Every HTTP failure in the operations is
 * already wrapped at the call site, so this must NOT wrap twice — an
 * already-wrapped error is passed through untouched, and only a genuinely raw
 * one (a bug, a core throw) gets wrapped. Measured: the operator-visible
 * message for a backend 400 is unchanged by this helper.
 */
export function wrapNodeError(ctx: IExecuteFunctions, err: unknown): Error {
  if (err instanceof NodeApiError || err instanceof NodeOperationError) return err;
  return new NodeApiError(ctx.getNode(), err as JsonObject);
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
    // Auto/cloud Tokenize scores the original text via /v1/risk/score, whose
    // backend ML budget is 180s (cold start). Must exceed n8n's ~120s default so
    // the backend wins — otherwise auto silently degrades to regex-only (PHI
    // leak) and cloud errors. Blanket is fine: vault/audit calls are fast.
    timeout: 200_000,
  })) as T;
}

/** Shown on the item when the mode was INFERRED rather than chosen. */
export const AUTH_INFERRED_WARNING =
  'Authentication was never set explicitly on this node, and no Privent credential is attached, so the run fell back to Local (No Backend): detection is regex-only, and the cloud vault, ML scoring and audit trail are inactive. Pick a mode in the Authentication dropdown to make this deliberate.';

/**
 * Node-level auth mode, plus whether it was CHOSEN or INFERRED.
 *
 * A stored node with no `authentication` key is ambiguous by construction: n8n
 * does not persist a parameter equal to its default, and this package flipped
 * that default from `apiKey` to `local` in 2.2.1 without bumping `version`. So
 * pre-2.1.0 nodes, 2.1.0–2.2.0 nodes left on `apiKey`, and 2.2.1+ nodes left on
 * `local` are byte-identical on disk at `typeVersion: 1`. typeVersion cannot
 * separate them; credential PRESENCE can.
 *
 * The presence probe is `getNode().credentials`, which is what n8n itself reads
 * (`node.credentials?.[type]`) and which `getNode()` returns intact. It is NOT
 * `getCredentials()`: that throws `Credentials not found` when displayOptions
 * hides the credential, so a try/catch around it would return the wrong answer
 * confidently — measured, not assumed.
 *
 * `getNodeParameter(..., '')` distinguishes absent from set because n8n resolves
 * it as `get(node.parameters, name, fallback)` against the STORED parameters,
 * with no default-filling in the execution path.
 */
export function resolveAuthMode(ctx: IExecuteFunctions): {
  mode: 'apiKey' | 'tokenless' | 'local';
  inferred: boolean;
} {
  const stored = ctx.getNodeParameter('authentication', 0, '') as string;
  if (stored === 'apiKey' || stored === 'tokenless' || stored === 'local') {
    return { mode: stored, inferred: false };
  }
  const hasApiKeyCredential = Boolean(ctx.getNode().credentials?.priventApi);
  return { mode: hasApiKeyCredential ? 'apiKey' : 'local', inferred: true };
}

/** Node-level auth mode. See `resolveAuthMode` for how an absent value resolves. */
export function getAuthMode(ctx: IExecuteFunctions): 'apiKey' | 'tokenless' | 'local' {
  return resolveAuthMode(ctx).mode;
}

/** The warning to surface when the mode was inferred as local, else undefined. */
export function authWarning(ctx: IExecuteFunctions): string | undefined {
  const { mode, inferred } = resolveAuthMode(ctx);
  return inferred && mode === 'local' ? AUTH_INFERRED_WARNING : undefined;
}

/** Reads the backend `baseUrl` for the active auth mode. apiKey →
 *  `priventApi.baseUrl` (unchanged); tokenless → `priventVisitorApi.baseUrl`. */
export async function getPriventBaseUrl(ctx: IExecuteFunctions): Promise<string> {
  const credName = getAuthMode(ctx) === 'tokenless' ? 'priventVisitorApi' : 'priventApi';
  const creds = await ctx.getCredentials(credName);
  return creds.baseUrl as string;
}

/** The apiKey credential's configured vault backend (audit `vault_backend`).
 *  Read once per execution — never in a per-item loop. apiKey mode only. */
export async function getVaultBackend(ctx: IExecuteFunctions): Promise<'memory' | 'cloud'> {
  const creds = await ctx.getCredentials('priventApi');
  return creds.vaultBackend as 'memory' | 'cloud';
}

/** Ensure a regex carries the global flag (required for `matchAll`), reusing the
 *  source + any original flags. */
function withGlobal(re: RegExp): RegExp {
  return re.flags.includes('g') ? re : new RegExp(re.source, re.flags + 'g');
}

const _localDetectorCache = new Map<string, RegexDetector[]>();

/**
 * Detector set for `local` (no-backend) tokenization: core `DEFAULT_DETECTORS`
 * (the 10 structured-PII detectors) ∪ the generated `LOCAL_DETECTORS`, tier-gated
 * by the Detection Level. Every regex is pre-built with the global flag baked in
 * so `detectMatches({preserveFlags:true})` reuses them without recompiling 575
 * patterns per item. Memoized per level (the inputs are static). No network, no
 * openredaction at runtime.
 */
export function buildLocalDetectors(level: 'standard' | 'aggressive'): RegexDetector[] {
  const cached = _localDetectorCache.get(level);
  if (cached) return cached;

  const core: RegexDetector[] = DEFAULT_DETECTORS.map((d) => ({ ...d, regex: withGlobal(d.regex) }));
  // `standard` = high + medium. `aggressive` = those plus the `aggressive-only`
  // tier, which is the MEASURED admission list: zero false positives across both
  // negative corpora and at least one positive hit under the right kind
  // (docs/detector-fp-table.md, regenerated by `npm run measure:fp`).
  //
  // `contextual` is now in NEITHER level. `aggressive` used to mean "all 468 of
  // these at once", with no context ever supplied to the false-positive filter,
  // which is how `reach` became a gamertag and an email address stopped being an
  // email address. A level that masks every word is not a sensitivity setting.
  const extra: RegexDetector[] = LOCAL_DETECTORS.filter((d) =>
    level === 'aggressive'
      ? d.tier !== 'contextual'
      : d.tier !== 'contextual' && d.tier !== 'aggressive-only',
  ).map((d) => {
    const validatorName = d.validatorName;
    return {
      kind: d.kind,
      regex: withGlobal(new RegExp(d.source, d.flags)),
      confidence: d.confidence,
      normalize: (v: string) => v,
      ...(validatorName ? { validate: (raw: string) => runValidator(validatorName, raw) } : {}),
    };
  });

  const detectors = [...core, ...extra];
  _localDetectorCache.set(level, detectors);
  return detectors;
}

/** One active org custom pattern as served by `GET /v1/custom-patterns/active`. */
interface ActiveCustomPattern {
  kind: EntityKind;
  pattern: string;
  flags: string;
  category: string;
  sensitivity: string;
}

/**
 * A compiled custom (org) detector. `authoritative` marks it as always-wins in
 * overlap resolution; `category`/`sensitivity` are threaded onto the emitted
 * entity. Node-local type, a superset of `RegexDetector` so it runs anywhere a
 * detector does.
 *
 * `category`/`sensitivity` are OMITTED from the inherited shape on purpose.
 * core 0.10.0 added them to `RegexDetector` and typed sensitivity as
 * `EntitySensitivity | null` — a closed set of four strings. What this node
 * actually receives is whatever `GET /v1/custom-patterns/active` returns for the
 * org, an open string this package does not validate. Inheriting the narrower
 * type would be claiming a guarantee nobody enforces on the wire.
 */
export interface CustomDetector extends Omit<RegexDetector, 'category' | 'sensitivity'> {
  readonly authoritative: true;
  readonly category: string;
  readonly sensitivity: string;
}

interface CustomDetectorCacheEntry {
  detectors: CustomDetector[];
  expiresAt: number; // unix seconds
}

const _customDetectorCache = new Map<string, CustomDetectorCacheEntry>();
const CUSTOM_DETECTOR_TTL_SEC = 300;

function compileCustomDetectors(rows: ActiveCustomPattern[]): CustomDetector[] {
  const out: CustomDetector[] = [];
  for (const row of rows) {
    let regex: RegExp;
    try {
      // Native RegExp, flags preserved (i/m/s/u) + global for matchAll. Safe:
      // the backend gates ReDoS at save time (recheck) before serving.
      regex = withGlobal(new RegExp(row.pattern, row.flags ?? ''));
    } catch {
      continue; // skip an uncompilable stored pattern (save-time validation makes this rare)
    }
    out.push({
      kind: row.kind,
      regex,
      confidence: 1,
      normalize: (v: string) => v,
      authoritative: true,
      category: row.category,
      sensitivity: row.sensitivity,
    });
  }
  return out;
}

/**
 * Fetch the org's active custom patterns (`GET /v1/custom-patterns/active`,
 * AGENT_SDK-authed) and compile them to authoritative native-RegExp detectors,
 * so org custom masking applies in the local tokenizer path (auto/cloud/local
 * detection, even when ML is unreachable).
 *
 * apiKey mode ONLY — the serve endpoint requires an AGENT_SDK key; tokenless
 * visitors and local mode have none, so they get built-ins only. FAIL-OPEN: any
 * error → `[]` (never break tokenize on a patterns-fetch failure). Cached per
 * credential (keyed by the apiKey hash — never the raw key) for
 * ${CUSTOM_DETECTOR_TTL_SEC}s; patterns change rarely and this isn't latency-critical.
 */
export async function fetchActiveCustomDetectors(
  ctx: IExecuteFunctions,
  baseUrl: string,
): Promise<CustomDetector[]> {
  if (getAuthMode(ctx) !== 'apiKey') return [];

  let keyHash: string;
  try {
    const creds = await ctx.getCredentials('priventApi');
    keyHash = await sha256short(String(creds.apiKey ?? ''));
  } catch {
    return [];
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const cached = _customDetectorCache.get(keyHash);
  if (cached && cached.expiresAt > nowSec) return cached.detectors;

  let rows: unknown;
  try {
    rows = await ctx.helpers.httpRequestWithAuthentication.call(ctx, 'priventApi', {
      method: 'GET',
      baseURL: baseUrl,
      url: '/v1/custom-patterns/active',
      json: true,
    });
  } catch {
    return []; // fail-open
  }
  if (!Array.isArray(rows)) return [];

  const detectors = compileCustomDetectors(rows as ActiveCustomPattern[]);
  _customDetectorCache.set(keyHash, {
    detectors,
    expiresAt: nowSec + CUSTOM_DETECTOR_TTL_SEC,
  });
  return detectors;
}

interface VisitorCacheEntry {
  visitorId: string;
  expiresAt: number; // unix seconds
}

/** Pulls an HTTP status off whatever shape the n8n/axios helper threw. */
function httpErrorStatus(err: unknown): number | undefined {
  const e = err as {
    httpCode?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  const raw = e.httpCode ?? e.statusCode ?? e.response?.status;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Mint (or reuse) an anonymous signed visitor id for the tokenless path.
 * Cached per-baseUrl in workflow static data; reused while >5 min from expiry.
 * Minting uses the UNauthenticated helper — `/v1/visitor/credentials` is public.
 */
export async function resolveVisitorId(ctx: IExecuteFunctions, baseUrl: string): Promise<string> {
  const staticData = ctx.getWorkflowStaticData('global');
  const cache = (staticData.priventVisitor ??= {}) as Record<string, VisitorCacheEntry>;

  const nowSec = Math.floor(Date.now() / 1000);
  const cached = cache[baseUrl];
  if (cached && cached.expiresAt - nowSec > 300) {
    return cached.visitorId;
  }

  let res: { visitor_id?: unknown; expires_at?: unknown };
  try {
    res = (await ctx.helpers.httpRequest({
      method: 'POST',
      baseURL: baseUrl,
      url: '/v1/visitor/credentials',
      body: {},
      json: true,
    })) as { visitor_id?: unknown; expires_at?: unknown };
  } catch (err) {
    const status = httpErrorStatus(err);
    if (status === 404) {
      throw new NodeOperationError(
        ctx.getNode(),
        "Tokenless mode isn't enabled on this Privent backend — switch Authentication to API Key, or enable visitor auth on the backend.",
      );
    }
    if (status === 429) {
      throw new NodeOperationError(
        ctx.getNode(),
        'Rate limited minting a visitor credential; retry shortly.',
      );
    }
    throw new NodeOperationError(
      ctx.getNode(),
      `Failed to mint a Privent visitor credential${status != null ? ` (HTTP ${status})` : ''}: ${
        (err as Error).message
      }`,
    );
  }

  const visitorId = res.visitor_id;
  const expiresAt = res.expires_at;
  if (typeof visitorId !== 'string' || typeof expiresAt !== 'number') {
    throw new NodeOperationError(
      ctx.getNode(),
      'Privent visitor credential response was malformed (missing visitor_id/expires_at).',
    );
  }

  cache[baseUrl] = { visitorId, expiresAt };
  return visitorId;
}

/**
 * Tokenless request: attaches `X-Visitor-Id` (no Bearer, no credential auth).
 * On a 401 the cached id is treated as stale — clear it, re-mint once, retry once.
 */
export async function priventVisitorRequest<T>(
  ctx: IExecuteFunctions,
  baseUrl: string,
  method: IHttpRequestMethods,
  url: string,
  body: IDataObject,
): Promise<T> {
  const send = async (visitorId: string): Promise<T> =>
    (await ctx.helpers.httpRequest({
      method,
      baseURL: baseUrl,
      url,
      body,
      json: true,
      timeout: 200_000,
      headers: { 'X-Visitor-Id': visitorId },
    })) as T;

  const visitorId = await resolveVisitorId(ctx, baseUrl);
  try {
    return await send(visitorId);
  } catch (err) {
    if (httpErrorStatus(err) !== 401) throw wrapNodeError(ctx, err);
    // Stale visitor id — drop the cache entry, mint fresh, retry exactly once.
    const cache = (ctx.getWorkflowStaticData('global').priventVisitor ?? {}) as Record<
      string,
      VisitorCacheEntry
    >;
    delete cache[baseUrl];
    return send(await resolveVisitorId(ctx, baseUrl));
  }
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
 * The vault surface the Tokenize/Detokenize operations actually use. Both
 * `N8nHttpVault` (cloud, apiKey) and `WorkflowStaticDataVault` (tokenless)
 * satisfy it, so the ops select between them by auth mode without caring which.
 */
export interface SessionVault {
  readonly sessionId: string;
  findOrCreateBatch(items: TokenVaultBatchItem[]): Promise<TokenVaultBatchResult[]>;
  retrieveBatch(tokens: string[]): Promise<VaultEntryRow[]>;
  destroy(): Promise<void>;
}

interface VaultSessionState {
  byKey: Record<string, string>; // `${kind}|${normalized}` → token
  byToken: Record<string, { kind: EntityKind; value: string }>; // token → original
  counters: Record<string, number>; // kind → last per-kind counter
}

interface VaultRoot {
  sessions: Record<string, VaultSessionState>;
  order: string[]; // sessionId insertion order, for bounded eviction
}

const MAX_VAULT_SESSIONS = 50;

/**
 * Tokenless vault: the token↔value map lives in n8n workflow static data
 * (`getWorkflowStaticData('global')`), keyed by sessionId — no backend, no API
 * key. Emits core-format `[KIND_NNN]` tokens (per-kind counter) so the round-trip
 * stays byte-compatible with `scanForTokens`/`detokenizeDeep`. State is bounded to
 * the most-recent ${MAX_VAULT_SESSIONS} sessions (oldest insertion evicted).
 */
export class WorkflowStaticDataVault implements SessionVault {
  constructor(
    private readonly ctx: IExecuteFunctions,
    readonly sessionId: string,
  ) {}

  private root(): VaultRoot {
    const sd = this.ctx.getWorkflowStaticData('global');
    return (sd.priventVault ??= { sessions: {}, order: [] }) as VaultRoot;
  }

  private session(): VaultSessionState {
    const root = this.root();
    let s = root.sessions[this.sessionId];
    if (!s) {
      s = { byKey: {}, byToken: {}, counters: {} };
      root.sessions[this.sessionId] = s;
      root.order.push(this.sessionId);
      while (root.order.length > MAX_VAULT_SESSIONS) {
        const evicted = root.order.shift();
        if (evicted != null) delete root.sessions[evicted];
      }
    }
    return s;
  }

  async findOrCreateBatch(items: TokenVaultBatchItem[]): Promise<TokenVaultBatchResult[]> {
    const s = this.session();
    return items.map((it) => {
      const normalized = normalize(it.kind, it.value);
      const key = `${it.kind}|${normalized}`;
      let token = s.byKey[key];
      if (token == null) {
        const n = (s.counters[it.kind] = (s.counters[it.kind] ?? 0) + 1);
        token = `[${it.kind}_${String(n).padStart(3, '0')}]`;
        s.byKey[key] = token;
        s.byToken[token] = { kind: it.kind, value: it.value };
      }
      return { kind: it.kind, value: normalized, token };
    });
  }

  async retrieveBatch(tokens: string[]): Promise<VaultEntryRow[]> {
    if (tokens.length === 0) return [];
    const s = this.session();
    const out: VaultEntryRow[] = [];
    for (const token of tokens) {
      const entry = s.byToken[token];
      if (entry) out.push({ token, kind: entry.kind, value: entry.value });
    }
    return out;
  }

  async destroy(): Promise<void> {
    const root = this.root();
    delete root.sessions[this.sessionId];
    const idx = root.order.indexOf(this.sessionId);
    if (idx >= 0) root.order.splice(idx, 1);
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
  /**
   * An ARRAY on the wire. This said `Record<string, number>` and was cast
   * through, which matched core's DEVELOPER-facing `RiskScore` type
   * (`Partial<Record<EntityKind, number>>`) and contradicted core's own PUBLISHED
   * contract (`ScoreResponseSchema`, an array) and privent-backend's DTO
   * (`string[]`). The divergence originates in core, which declares both shapes;
   * the wire one is the contract, so it is the one this type states.
   *
   * Nothing in this package reads the value — measured, both shapes pass through
   * to the item and the audit event untouched, no iteration, no key access — so
   * the correction is a type correction with no behaviour change. What it fixes
   * is the shape a customer is handed under a name that promised another. See
   * NP-AC.
   */
  categories: string[];
  model: string;
  latency_ms: number;
  entities?: RiskScore['entities'];
}

/** Entity rows returned by (or seeded into) `/v1/risk/score`. */
type EntityItem = NonNullable<RiskScore['entities']>[number];

/** `POST /v1/risk/score` → developer-facing `RiskScore`.
 *  `opts.lang` sets the detection language hint; `opts.bootstrapEntities`
 *  seeds the server with caller-side regex hits (capped at the schema's 256). */
export async function riskScore(
  ctx: IExecuteFunctions,
  text: string,
  baseUrl: string,
  opts?: { lang?: string; bootstrapEntities?: EntityItem[] },
): Promise<RiskScore> {
  const start = Date.now();
  const bootstrap = opts?.bootstrapEntities?.slice(0, 256);
  const send = getAuthMode(ctx) === 'tokenless' ? priventVisitorRequest : priventRequest;
  const r = await send<CloudScoreResponse>(ctx, baseUrl, 'POST', '/v1/risk/score', {
    text,
    include_entities: true,
    ...(opts?.lang != null ? { lang: opts.lang } : {}),
    ...(bootstrap != null && bootstrap.length > 0 ? { bootstrap_entities: bootstrap } : {}),
  });
  return {
    risk_score: r.risk_score,
    risk_level: r.risk_level as RiskScore['risk_level'],
    // Crosses core's own disagreement between its wire schema (array) and its
    // developer type (object). The value is passed through unchanged; the cast
    // is named rather than silent. NP-AC.
    categories: r.categories as unknown as RiskScore['categories'],
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
  const send = getAuthMode(ctx) === 'tokenless' ? priventVisitorRequest : priventRequest;
  const res = await send<{ results: CloudScoreResponse[] }>(
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
    // Crosses core's own disagreement between its wire schema (array) and its
    // developer type (object). The value is passed through unchanged; the cast
    // is named rather than silent. NP-AC.
    categories: r.categories as unknown as RiskScore['categories'],
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
  // Audit is org-scoped and backend-bound — anonymous visitors have no org and
  // local mode has no backend at all, so skip entirely for any non-apiKey mode
  // (don't rely on the swallow / waste a round-trip).
  if (getAuthMode(ctx) !== 'apiKey') return;
  try {
    await priventRequest(ctx, baseUrl, 'POST', '/v1/audit/events', {
      events: [serializeForWire(event)],
    });
  } catch {
    // Fire-and-forget: audit failures never break the data path.
  }
}

/**
 * Anonymous, always-on telemetry — **tokenless mode only**. apiKey already
 * reports via the audit stream (no double-report); local mode stays fully
 * offline (returns before any I/O). Fire-and-forget: a failure never breaks the
 * op. The only identifier is a random per-install UUID cached in workflow static
 * data (no org, no key, no PII) — mirrors the `resolveVisitorId` cache pattern.
 * Posts UNauthenticated (no Bearer, no `X-Visitor-Id`) to the tokenless backend.
 *
 * PAYLOAD ALLOWLIST — send only the keys below. `error_type` is the error class
 * name only (never a message/stack). No raw text, tokens, entity kinds/values,
 * org, key, sink, ip, or workflow/node names.
 */
export async function telemetryPing(
  ctx: IExecuteFunctions,
  p: {
    operation: string;
    item_count: number;
    status: 'success' | 'error';
    error_type?: string | undefined;
    timestamp: string;
  },
): Promise<void> {
  if (getAuthMode(ctx) !== 'tokenless') return; // apiKey audits; local silent
  try {
    const baseUrl = await getPriventBaseUrl(ctx);
    const store = (ctx.getWorkflowStaticData('global').priventTelemetry ??= {}) as {
      installId?: string;
    };
    const installId = (store.installId ??= crypto.randomUUID());
    await ctx.helpers.httpRequest({
      method: 'POST',
      baseURL: baseUrl,
      url: '/v1/telemetry/events',
      json: true,
      timeout: 5000,
      body: {
        events: [
          {
            install_id: installId,
            event: 'node_execution',
            operation: p.operation,
            auth_mode: 'tokenless',
            node_version: NODE_VERSION,
            n8n_version: safeFrameworkVersion() ?? undefined,
            item_count: p.item_count,
            status: p.status,
            ...(p.error_type ? { error_type: p.error_type } : {}),
            timestamp: p.timestamp,
          },
        ],
      },
    });
  } catch {
    // Fire-and-forget: telemetry failures never break the data path.
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
  /** apiKey vault backend, for audit `vault_backend`. Undefined for tokenless/local. */
  vaultBackend?: 'memory' | 'cloud' | undefined;
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
    // Dynamic require, not a static import: `n8n-workflow` is a PEER the host
    // supplies at runtime, and its `package.json` is not in that package's
    // `exports` map, so a static import cannot resolve it. The try/catch is
    // the contract — an unresolvable peer leaves the version undefined.
    //
    // The eslint-disable that used to sit here named
    // `@typescript-eslint/no-require-imports`, a rule this config does not
    // register: a directive protecting against nothing, which ESLint itself
    // reported as an error once shared/ entered lint scope. If that plugin is
    // ever registered, this line needs a real answer — recorded as F-G, not
    // left as a TODO in the code.
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
  vaultBackend?: 'memory' | 'cloud',
): PriventContext {
  const { id: workflowId, name: workflowName } = safeWorkflow(ctx);
  return {
    sessionId,
    traceId: traceIdParam.trim() || crypto.randomUUID(),
    agentName: agentNameParam.trim(),
    executionId: safeExecutionId(ctx),
    workflowId,
    workflowName,
    vaultBackend,
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
    node_version: NODE_VERSION,
    core_version: CORE_VERSION,
    ...(ctx.vaultBackend ? { vault_backend: ctx.vaultBackend } : {}),
    ...(extras ?? {}),
  };
}

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/nodes/PriventDetokenize/PriventDetokenize.node.ts
var PriventDetokenize_node_exports = {};
__export(PriventDetokenize_node_exports, {
  PriventDetokenize: () => PriventDetokenize,
  deriveSinkId: () => deriveSinkId,
  deriveSinkUrlHost: () => deriveSinkUrlHost
});
module.exports = __toCommonJS(PriventDetokenize_node_exports);
var import_node_crypto = require("crypto");
var import_n8n_workflow = require("n8n-workflow");

// node_modules/@priventai/core/dist/chunk-NSBPE2FW.js
var __defProp2 = Object.defineProperty;
var __export2 = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
};

// node_modules/@priventai/core/dist/chunk-LMWPI6HU.js
var import_zod = require("zod");
var contracts_exports = {};
__export2(contracts_exports, {
  v1: () => v1_exports
});
var v1_exports = {};
__export2(v1_exports, {
  AuditBatchRequestSchema: () => AuditBatchRequestSchema,
  AuditBatchResponseSchema: () => AuditBatchResponseSchema,
  AuditEventV1Schema: () => AuditEventV1Schema,
  BatchRequestSchema: () => BatchRequestSchema,
  BatchResponseSchema: () => BatchResponseSchema,
  CircuitStateEnum: () => CircuitStateEnum,
  EntityItemSchema: () => EntityItemSchema,
  EntitySourceEnum: () => EntitySourceEnum,
  FrameworkEnum: () => FrameworkEnum,
  HandoffReasonEnum: () => HandoffReasonEnum,
  HealthResponseSchema: () => HealthResponseSchema,
  RiskLevelEnum: () => RiskLevelEnum,
  ScoreRequestSchema: () => ScoreRequestSchema,
  ScoreResponseSchema: () => ScoreResponseSchema,
  ServiceStatusEnum: () => ServiceStatusEnum
});
var EntitySourceEnum = import_zod.z.enum(["regex", "model", "hint"]);
var EntitySensitivityEnum = import_zod.z.enum(["low", "medium", "high", "critical"]);
var EntityItemSchema = import_zod.z.object({
  kind: import_zod.z.string().min(1).max(64),
  value: import_zod.z.string(),
  span: import_zod.z.tuple([import_zod.z.number().int().nonnegative(), import_zod.z.number().int().nonnegative()]).refine(([s, e]) => e > s, {
    message: "span end must be strictly greater than span start"
  }),
  confidence: import_zod.z.number().min(0).max(1),
  source: EntitySourceEnum,
  label: import_zod.z.string().min(1).max(128).nullable().optional(),
  category: import_zod.z.string().min(1).max(64).nullable().optional(),
  sensitivity: EntitySensitivityEnum.nullable().optional(),
  risk_reason: import_zod.z.string().min(1).max(512).nullable().optional(),
  validated_by: import_zod.z.array(import_zod.z.string().min(1).max(64)).max(16).nullable().optional()
}).strict();
var RiskLevelEnum = import_zod.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
var UuidV4 = import_zod.z.string().uuid();
var LangTag = import_zod.z.string().regex(/^(auto|[a-z]{2}(-[A-Z]{2})?)$/, {
  message: 'lang must be "auto" or ISO-639-1 (optional ISO-3166-1 region)'
});
var ScoreRequestSchema = import_zod.z.object({
  text: import_zod.z.string().min(1).max(1e4),
  lang: LangTag.optional(),
  include_entities: import_zod.z.boolean().default(false),
  bootstrap_entities: import_zod.z.array(EntityItemSchema).max(256).optional(),
  session_id: UuidV4.optional(),
  trace_id: UuidV4.optional()
}).strict();
var ModelIdentifier = import_zod.z.string().regex(/^[a-zA-Z][a-zA-Z0-9._-]*@\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?\+[A-Za-z0-9._-]+$/, {
  message: 'model must be "<name>@<semver>+<build>"'
});
var ExtractionMetaSchema = import_zod.z.object({
  engine: import_zod.z.string().min(1).max(128),
  latency_ms: import_zod.z.number().nonnegative(),
  build_signature: import_zod.z.string().min(1).max(64)
}).strict();
var ScoreResponseSchema = import_zod.z.object({
  risk_score: import_zod.z.number().min(0).max(1),
  risk_level: RiskLevelEnum,
  categories: import_zod.z.array(import_zod.z.string().min(1).max(64)),
  entities: import_zod.z.array(EntityItemSchema).nullable(),
  model: ModelIdentifier,
  latency_ms: import_zod.z.number().int().nonnegative(),
  document_lang: import_zod.z.string().min(1).max(32).nullable().optional(),
  extraction_meta: ExtractionMetaSchema.nullable().optional()
}).strict();
var BatchRequestSchema = import_zod.z.object({
  items: import_zod.z.array(ScoreRequestSchema).min(1).max(64)
}).strict();
var BatchResponseSchema = import_zod.z.object({
  results: import_zod.z.array(ScoreResponseSchema)
}).strict();
var UuidV42 = import_zod.z.string().uuid();
var Iso8601 = import_zod.z.string().datetime({ offset: true });
var FrameworkEnum = import_zod.z.string().min(1).max(30);
var HandoffReasonEnum = import_zod.z.enum([
  "delegation",
  "subgraph_call",
  "tool_invocation",
  "webhook_trigger",
  "other"
]);
var RiskLevelEnum2 = import_zod.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
var Metadata = import_zod.z.record(import_zod.z.string(), import_zod.z.unknown());
var WebhookConfigSchema = import_zod.z.object({
  url: import_zod.z.string().min(1).max(2048),
  method: import_zod.z.string().max(10).optional(),
  auth_scheme: import_zod.z.string().max(64).optional(),
  content_type: import_zod.z.string().max(120).optional()
}).strict();
var SinkConfigSchema = import_zod.z.object({
  sink_key: import_zod.z.string().min(1).max(500),
  host: import_zod.z.string().min(1).max(255),
  trusted: import_zod.z.boolean().optional(),
  tls_version: import_zod.z.string().max(16).optional(),
  cert_fingerprint: import_zod.z.string().max(128).optional(),
  added_by_user_id: import_zod.z.string().uuid().optional()
}).strict();
var VaultConfigSchema = import_zod.z.object({
  name: import_zod.z.string().min(1).max(255),
  region: import_zod.z.string().max(64).optional(),
  retention_days: import_zod.z.number().int().nonnegative().optional(),
  detection_mode: import_zod.z.string().max(64).optional(),
  detection_version: import_zod.z.string().max(64).optional()
}).strict();
var CronConfigSchema = import_zod.z.object({
  cron_expression: import_zod.z.string().min(1).max(120),
  timezone: import_zod.z.string().max(64).optional()
}).strict();
var AuditEventV1Schema = import_zod.z.object({
  event_id: UuidV42,
  type: import_zod.z.string().min(1).max(64),
  trace_id: UuidV42,
  session_id: UuidV42,
  timestamp: Iso8601,
  framework: FrameworkEnum,
  workflow_id: import_zod.z.string().max(128).optional(),
  node_id: import_zod.z.string().max(128).optional(),
  metadata: Metadata,
  latency_ms: import_zod.z.number().int().nonnegative().optional(),
  error_type: import_zod.z.string().max(64).optional(),
  node_name: import_zod.z.string().max(255).optional(),
  http_status: import_zod.z.number().int().optional(),
  webhook_config: WebhookConfigSchema.optional(),
  sink_config: SinkConfigSchema.optional(),
  vault_config: VaultConfigSchema.optional(),
  cron_config: CronConfigSchema.optional(),
  // ── Trust Map / agent_handoff fields (all optional; see
  //    docs/trust-map-event-shape.md in privent-frontend) ──
  from_agent_id: import_zod.z.string().max(64).optional(),
  from_agent_name: import_zod.z.string().max(255).optional(),
  target_agent_id: import_zod.z.string().max(64).optional(),
  target_agent_name: import_zod.z.string().max(255).optional(),
  target_sink_id: import_zod.z.string().max(500).optional(),
  reason: HandoffReasonEnum.optional(),
  payload_token_count: import_zod.z.number().int().nonnegative().optional(),
  /**
   * 4-tier severity (LOW/MEDIUM/HIGH/CRITICAL). Replaces the legacy
   * `policy_decision` (BLOCK/WARN/ALLOW) wire field — backend
   * `audit-ingest` now persists `risk_level` exclusively for AGENT_SDK
   * callers and dashboards aggregate severity directly.
   */
  risk_level: RiskLevelEnum2.optional(),
  parent_event_id: UuidV42.optional(),
  branch_id: import_zod.z.string().max(64).optional(),
  hop_depth: import_zod.z.number().int().positive().optional()
}).strict();
var AuditBatchRequestSchema = import_zod.z.object({
  events: import_zod.z.array(AuditEventV1Schema).min(1).max(200)
}).strict();
var AuditBatchResponseSchema = import_zod.z.object({
  accepted: import_zod.z.number().int().nonnegative()
}).strict();
var ServiceStatusEnum = import_zod.z.enum(["ok", "degraded", "down"]);
var CircuitStateEnum = import_zod.z.enum(["CLOSED", "OPEN", "HALF_OPEN"]);
var HealthResponseSchema = import_zod.z.object({
  status: ServiceStatusEnum,
  version: import_zod.z.string().min(1),
  uptime_ms: import_zod.z.number().int().nonnegative(),
  ml_status: CircuitStateEnum.optional()
}).strict();

// node_modules/@priventai/core/dist/chunk-UODQGMR6.js
function normalize(kind, value) {
  switch (kind) {
    case "EMAIL":
      return value.trim().toLowerCase();
    case "PHONE":
    case "CREDIT_CARD":
    case "IBAN":
      return value.replace(/\D+/g, "");
    default:
      return value.trim();
  }
}

// node_modules/@priventai/core/dist/index.js
var TRACER_VERSION = (() => {
  const v = "1.1.1";
  return typeof v === "string" && v.length > 0 ? v : "0.1.0";
})();
var DEFAULT_TTL_MS = 60 * 60 * 1e3;
var TOKEN_RE = /\[([A-Z][A-Z0-9_]{1,31})_(\d{1,10})(?:_[a-f0-9]{4,16})?\]/g;
function* scanForTokens(value, seen = /* @__PURE__ */ new WeakSet(), depth = 0) {
  if (depth > 64 || value == null) return;
  if (typeof value === "string") {
    if (value.indexOf("[") === -1) return;
    for (const match of value.matchAll(new RegExp(TOKEN_RE.source, "g"))) {
      yield match[0];
    }
    return;
  }
  if (typeof value !== "object" || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    return;
  }
  if (seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      yield* scanForTokens(item, seen, depth + 1);
    }
    return;
  }
  for (const v of Object.values(value)) {
    yield* scanForTokens(v, seen, depth + 1);
  }
}
async function detokenizeDeep(value, vault) {
  const allTokens = new Set(scanForTokens(value));
  if (allTokens.size === 0) return value;
  const resolved = /* @__PURE__ */ new Map();
  await Promise.all(
    [...allTokens].map(async (token) => {
      const entry = await vault.retrieve(token);
      if (entry != null) resolved.set(token, entry.value);
    })
  );
  return replaceIn(value, resolved, /* @__PURE__ */ new WeakSet(), 0);
}
function replaceIn(value, resolved, seen, depth) {
  if (depth > 64 || value == null) return value;
  if (typeof value === "string") {
    if (value.indexOf("[") === -1) return value;
    return value.replace(
      new RegExp(TOKEN_RE.source, "g"),
      (match) => resolved.get(match) ?? match
    );
  }
  if (typeof value !== "object" || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    return value;
  }
  if (seen.has(value)) return value;
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((item) => replaceIn(item, resolved, seen, depth + 1));
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = replaceIn(v, resolved, seen, depth + 1);
  }
  return out;
}
var CACHE_TTL_MS = 5 * 60 * 1e3;
var SPOOL_FILE_BYTES = 10 * 1024 * 1024;
var SPOOL_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1e3;
var SPOOL_CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1e3;

// src/shared/privent-http.ts
function frameworkForWire(framework) {
  if (framework === "manual") return "sdk";
  return framework;
}
function serializeForWire(event) {
  const wire = {
    event_id: crypto.randomUUID(),
    type: event.type,
    trace_id: event.traceId,
    session_id: event.sessionId,
    timestamp: new Date(event.timestamp).toISOString(),
    framework: frameworkForWire(event.framework),
    ...event.workflowId != null ? { workflow_id: event.workflowId } : {},
    ...event.nodeId != null ? { node_id: event.nodeId } : {},
    metadata: event.metadata ?? {},
    ...event.latencyMs != null ? { latency_ms: event.latencyMs } : {},
    ...event.errorType != null ? { error_type: event.errorType } : {},
    ...event.nodeName != null ? { node_name: event.nodeName } : {},
    ...event.httpStatus != null ? { http_status: event.httpStatus } : {},
    ...event.webhookConfig != null ? {
      webhook_config: {
        url: event.webhookConfig.url,
        ...event.webhookConfig.method != null ? { method: event.webhookConfig.method } : {},
        ...event.webhookConfig.authScheme != null ? { auth_scheme: event.webhookConfig.authScheme } : {},
        ...event.webhookConfig.contentType != null ? { content_type: event.webhookConfig.contentType } : {}
      }
    } : {},
    ...event.sinkConfig != null ? {
      sink_config: {
        sink_key: event.sinkConfig.sinkKey,
        host: event.sinkConfig.host,
        ...event.sinkConfig.trusted != null ? { trusted: event.sinkConfig.trusted } : {},
        ...event.sinkConfig.tlsVersion != null ? { tls_version: event.sinkConfig.tlsVersion } : {},
        ...event.sinkConfig.certFingerprint != null ? { cert_fingerprint: event.sinkConfig.certFingerprint } : {},
        ...event.sinkConfig.addedByUserId != null ? { added_by_user_id: event.sinkConfig.addedByUserId } : {}
      }
    } : {},
    ...event.vaultConfig != null ? {
      vault_config: {
        name: event.vaultConfig.name,
        ...event.vaultConfig.region != null ? { region: event.vaultConfig.region } : {},
        ...event.vaultConfig.retentionDays != null ? { retention_days: event.vaultConfig.retentionDays } : {},
        ...event.vaultConfig.detectionMode != null ? { detection_mode: event.vaultConfig.detectionMode } : {},
        ...event.vaultConfig.detectionVersion != null ? { detection_version: event.vaultConfig.detectionVersion } : {}
      }
    } : {},
    ...event.cronConfig != null ? {
      cron_config: {
        cron_expression: event.cronConfig.cronExpression,
        ...event.cronConfig.timezone != null ? { timezone: event.cronConfig.timezone } : {}
      }
    } : {},
    ...event.fromAgentId != null ? { from_agent_id: event.fromAgentId } : {},
    ...event.fromAgentName != null ? { from_agent_name: event.fromAgentName } : {},
    ...event.targetAgentId != null ? { target_agent_id: event.targetAgentId } : {},
    ...event.targetAgentName != null ? { target_agent_name: event.targetAgentName } : {},
    ...event.targetSinkId != null ? { target_sink_id: event.targetSinkId } : {},
    ...event.reason != null ? { reason: event.reason } : {},
    ...event.payloadTokenCount != null ? { payload_token_count: event.payloadTokenCount } : {},
    ...event.riskLevel != null ? { risk_level: event.riskLevel } : {},
    ...event.parentEventId != null ? { parent_event_id: event.parentEventId } : {},
    ...event.branchId != null ? { branch_id: event.branchId } : {},
    ...event.hopDepth != null ? { hop_depth: event.hopDepth } : {}
  };
  return contracts_exports.v1.AuditEventV1Schema.parse(wire);
}
var DEFAULT_TTL_MS2 = 60 * 60 * 1e3;
async function priventRequest(ctx, baseUrl, method, url, body) {
  return await ctx.helpers.httpRequestWithAuthentication.call(ctx, "priventApi", {
    method,
    baseURL: baseUrl,
    url,
    body,
    json: true,
    // Auto/cloud Tokenize scores the original text via /v1/risk/score, whose
    // backend ML budget is 180s (cold start). Must exceed n8n's ~120s default so
    // the backend wins — otherwise auto silently degrades to regex-only (PHI
    // leak) and cloud errors. Blanket is fine: vault/audit calls are fast.
    timeout: 2e5
  });
}
async function getPriventBaseUrl(ctx) {
  const creds = await ctx.getCredentials("priventApi");
  return creds.baseUrl;
}
var N8nHttpVault = class {
  constructor(ctx, sessionId, baseUrl, defaultTtlMs = DEFAULT_TTL_MS2) {
    this.ctx = ctx;
    this.sessionId = sessionId;
    this.baseUrl = baseUrl;
    this.defaultTtlMs = defaultTtlMs;
  }
  ctx;
  sessionId;
  baseUrl;
  defaultTtlMs;
  async findOrCreateBatch(items) {
    const payload = {
      sessionId: this.sessionId,
      items: items.map((it) => ({
        kind: it.kind,
        normalizedValue: normalize(it.kind, it.value),
        originalValue: it.value,
        ttlMs: it.ttlMs ?? this.defaultTtlMs
      }))
    };
    const res = await priventRequest(
      this.ctx,
      this.baseUrl,
      "POST",
      "/v1/vault/find-or-create-batch",
      payload
    );
    return res.tokens;
  }
  /** One round-trip for all tokens. Detokenize uses this; never per-token. */
  async retrieveBatch(tokens) {
    if (tokens.length === 0) return [];
    const res = await priventRequest(
      this.ctx,
      this.baseUrl,
      "POST",
      "/v1/vault/retrieve-batch",
      { sessionId: this.sessionId, tokens }
    );
    return res.entries;
  }
  async retrieve(token) {
    const [row] = await this.retrieveBatch([token]);
    if (!row) return null;
    return { token: row.token, value: row.value, kind: row.kind, sessionId: this.sessionId, createdAt: Date.now() };
  }
  async store(entry) {
    await this.findOrCreateBatch([
      entry.ttlMs != null ? { kind: entry.kind, value: entry.value, ttlMs: entry.ttlMs } : { kind: entry.kind, value: entry.value }
    ]);
  }
  async findByValue(value, kind) {
    const [row] = await this.findOrCreateBatch([{ kind, value }]);
    if (!row) return null;
    return { token: row.token, value: row.value, kind: row.kind, sessionId: this.sessionId, createdAt: Date.now() };
  }
  // Cloud vault has no list endpoint; tokenizer hot path never calls this.
  async listBySession() {
    return [];
  }
  // Server only supports session-wide destroy (retention cron handles expiry).
  async revoke(_token) {
    void _token;
  }
  async nextCounter(_kind) {
    throw new Error(
      "N8nHttpVault.nextCounter: counter is server-allocated. Use findOrCreateBatch() instead."
    );
  }
  async destroy() {
    try {
      await priventRequest(this.ctx, this.baseUrl, "POST", "/v1/vault/destroy", {
        sessionId: this.sessionId
      });
    } catch {
    }
  }
};
function makeResolvedVault(sessionId, entries) {
  const byToken = new Map(entries.map((e) => [e.token, e]));
  return {
    sessionId,
    async retrieve(token) {
      const row = byToken.get(token);
      if (!row) return null;
      return { token: row.token, value: row.value, kind: row.kind, sessionId, createdAt: Date.now() };
    },
    async store() {
    },
    async findByValue() {
      return null;
    },
    async listBySession() {
      return [];
    },
    async revoke() {
    },
    async nextCounter() {
      throw new Error("resolved vault is read-only");
    },
    async destroy() {
    }
  };
}
async function auditLog(ctx, event, baseUrl) {
  try {
    await priventRequest(ctx, baseUrl, "POST", "/v1/audit/events", {
      events: [serializeForWire(event)]
    });
  } catch {
  }
}
async function sha256short(value) {
  const encoded = new TextEncoder().encode(value);
  const buf = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 8);
}
function safeWorkflow(ctx) {
  try {
    const wf = ctx.getWorkflow?.();
    if (wf) {
      const id = typeof wf.id === "string" && wf.id.length > 0 ? wf.id : "unknown";
      const name = typeof wf.name === "string" ? wf.name : "";
      return { id, name };
    }
  } catch {
  }
  return { id: "unknown", name: "" };
}
function safeExecutionId(ctx) {
  try {
    const id = ctx.getExecutionId?.();
    if (typeof id === "string" && id.length > 0) return id;
  } catch {
  }
  return crypto.randomUUID();
}
function safeTriggerMode(ctx) {
  try {
    const m = ctx.getMode?.();
    if (typeof m === "string" && m.length > 0) return m.slice(0, 16);
  } catch {
  }
  return void 0;
}
function resolveContext(ctx, sessionId, traceIdParam, agentNameParam) {
  const { id: workflowId, name: workflowName } = safeWorkflow(ctx);
  return {
    sessionId,
    traceId: traceIdParam.trim() || crypto.randomUUID(),
    agentName: agentNameParam.trim(),
    executionId: safeExecutionId(ctx),
    workflowId,
    workflowName
  };
}
function buildAuditMetadata(ctx, node, extras) {
  return {
    agent_name: ctx.agentName,
    workflow_name: ctx.workflowName,
    execution_id: ctx.executionId,
    node_name: node.name,
    framework: "n8n",
    ...extras ?? {}
  };
}

// src/nodes/PriventDetokenize/PriventDetokenize.node.ts
function matchesTrustedSink(url, trusted) {
  if (trusted.length === 0) return true;
  return trusted.some((prefix) => url.startsWith(prefix.trim()));
}
function deriveSinkId(sinkUrl) {
  if (!sinkUrl) return null;
  return (0, import_node_crypto.createHash)("sha256").update(sinkUrl).digest("hex").slice(0, 16);
}
function deriveSinkUrlHost(sinkUrl) {
  if (!sinkUrl) return null;
  try {
    return new URL(sinkUrl).host;
  } catch {
    return sinkUrl.slice(0, 64);
  }
}
var PriventDetokenize = class {
  description = {
    displayName: "Privent Detokenize",
    name: "priventDetokenize",
    icon: "file:privent.png",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["targetField"]}}',
    description: "Resolves [KIND_NNN] placeholders back to their original values before data leaves the workflow (e.g. before an HTTP Request or database write). Place this node just before any trusted egress sink.",
    defaults: { name: "Privent Detokenize" },
    inputs: [import_n8n_workflow.NodeConnectionTypes.Main],
    outputs: [import_n8n_workflow.NodeConnectionTypes.Main],
    credentials: [{ name: "priventApi", required: true }],
    properties: [
      {
        displayName: "Session ID",
        name: "sessionId",
        type: "string",
        default: '={{$("Privent Session").item.json.sessionId}}',
        required: true,
        description: "Must match the session ID used by the Privent Tokenize node upstream"
      },
      {
        displayName: "Trace ID",
        name: "traceId",
        type: "string",
        default: '={{ $("Privent Session").item.json.traceId }}',
        description: "Correlation ID from the upstream Privent Session node. Links this event to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream."
      },
      {
        displayName: "Agent Name",
        name: "agentName",
        type: "string",
        default: '={{ $("Privent Session").item.json.agentName }}',
        description: "Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional."
      },
      {
        displayName: "Target Field",
        name: "targetField",
        type: "string",
        default: "*",
        description: 'Field to detokenize. Use * (default) to deep-walk and resolve tokens in the entire item JSON. Or specify a single field name (e.g. "body").',
        hint: "The * wildcard scans every nested string in the item for tokens."
      },
      {
        displayName: "Strict Mode",
        name: "strict",
        type: "boolean",
        default: false,
        description: "When enabled, detokenization is blocked unless the destination URL matches the Trusted Sinks list. Tokens are left in place and an audit event is written. Use this to prevent accidental PII egress to untrusted systems."
      },
      {
        displayName: "Destination URL",
        name: "sinkUrl",
        type: "string",
        default: "",
        description: "URL of the downstream sink (e.g. the HTTP Request node URL). Used to enforce the trusted sinks list in strict mode.",
        displayOptions: { show: { strict: [true] } },
        hint: "Supports URL prefixes \u2014 e.g. https://api.internal.corp/"
      },
      {
        displayName: "Trusted Sinks",
        name: "trustedSinks",
        type: "string",
        default: "",
        description: "Comma-separated list of URL prefixes allowed to receive detokenized data (e.g. https://api.internal.corp/,https://db.internal/). Only evaluated in strict mode.",
        displayOptions: { show: { strict: [true] } }
      },
      {
        displayName: "Target Agent Name (Trust Map)",
        name: "targetAgentName",
        type: "string",
        default: "",
        description: "Optional. Canonical agent name of the downstream consumer \u2014 when set, the backend Trust Map aggregator materialises this detokenize as an A\u2192B AgentInteraction edge instead of an A\u2192sink edge. Leave empty for true external sinks (the InternalAgentEndpoint registry will auto-resolve in a future release).",
        hint: "Use only when the destination URL belongs to another Privent-aware agent in the same organization."
      }
    ]
  };
  async execute() {
    const items = this.getInputData();
    const baseUrl = await getPriventBaseUrl(this);
    const triggerMode = safeTriggerMode(this);
    const out = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const sessionId = this.getNodeParameter("sessionId", i);
        const targetField = this.getNodeParameter("targetField", i);
        const strict = this.getNodeParameter("strict", i);
        const traceIdParam = this.getNodeParameter("traceId", i, "");
        const agentNameParam = this.getNodeParameter("agentName", i, "");
        let sinkUrl = "";
        let isTrusted = true;
        if (strict) {
          sinkUrl = this.getNodeParameter("sinkUrl", i);
          const trustedRaw = this.getNodeParameter("trustedSinks", i);
          const trusted = trustedRaw.split(",").map((s) => s.trim()).filter(Boolean);
          isTrusted = matchesTrustedSink(sinkUrl, trusted);
        }
        const sinkId = deriveSinkId(sinkUrl);
        const sinkUrlHost = deriveSinkUrlHost(sinkUrl);
        const targetAgentName = (this.getNodeParameter("targetAgentName", i, "") ?? "").trim();
        const ctx = resolveContext(this, sessionId, traceIdParam, agentNameParam);
        const node = this.getNode();
        if (!isTrusted) {
          const blockedEvent = {
            type: "detokenize",
            traceId: ctx.traceId,
            sessionId,
            timestamp: Date.now(),
            framework: "n8n",
            workflowId: ctx.workflowId,
            nodeId: node.id,
            ...targetAgentName ? { targetAgentName } : {},
            metadata: buildAuditMetadata(ctx, node, {
              sink_id: sinkId,
              sink_url_host: sinkUrlHost,
              sink_trusted: false,
              strict: true,
              tokens_redeemed: 0,
              reason: "strict-mode-block",
              ...triggerMode !== void 0 ? { trigger_mode: triggerMode } : {}
            })
          };
          void auditLog(this, blockedEvent, baseUrl);
          out.push({
            json: {
              ...item.json,
              privent: {
                sessionId,
                detokenized: false,
                reason: "strict-mode: destination URL not in trusted sinks list"
              }
            },
            pairedItem: { item: i }
          });
          continue;
        }
        const vault = new N8nHttpVault(this, sessionId, baseUrl);
        const scanTarget = targetField === "*" ? item.json : item.json[targetField];
        const placeholders = [...scanForTokens(scanTarget)];
        const tokensRedeemed = placeholders.length;
        const uniqPlaceholders = [...new Set(placeholders)].sort();
        const valueFingerprint = uniqPlaceholders.length > 0 ? await sha256short(uniqPlaceholders.join(" ")) : null;
        const valueFingerprints = await Promise.all(
          uniqPlaceholders.map((p) => sha256short(p))
        );
        const entries = await vault.retrieveBatch([...new Set(placeholders)]);
        const resolvedVault = makeResolvedVault(sessionId, entries);
        let json;
        if (targetField === "*") {
          json = await detokenizeDeep(item.json, resolvedVault);
        } else {
          const fieldValue = item.json[targetField];
          const resolved = await detokenizeDeep(fieldValue, resolvedVault);
          json = { ...item.json, [targetField]: resolved };
        }
        const event = {
          type: "detokenize",
          traceId: ctx.traceId,
          sessionId,
          timestamp: Date.now(),
          framework: "n8n",
          workflowId: ctx.workflowId,
          nodeId: node.id,
          ...targetAgentName ? { targetAgentName } : {},
          metadata: buildAuditMetadata(ctx, node, {
            sink_id: sinkId,
            sink_url_host: sinkUrlHost,
            sink_trusted: isTrusted,
            strict,
            tokens_redeemed: tokensRedeemed,
            value_fingerprint: valueFingerprint,
            value_fingerprints: valueFingerprints,
            ...triggerMode !== void 0 ? { trigger_mode: triggerMode } : {}
          })
        };
        void auditLog(this, event, baseUrl);
        out.push({
          json: {
            ...json,
            privent: { sessionId, detokenized: true }
          },
          pairedItem: { item: i }
        });
      } catch (err) {
        if (this.continueOnFail()) {
          out.push({ json: { error: err.message }, pairedItem: { item: i } });
          continue;
        }
        if (err instanceof import_n8n_workflow.NodeOperationError) throw err;
        throw new import_n8n_workflow.NodeOperationError(this.getNode(), err, { itemIndex: i });
      }
    }
    return [out];
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PriventDetokenize,
  deriveSinkId,
  deriveSinkUrlHost
});
//# sourceMappingURL=PriventDetokenize.node.js.map
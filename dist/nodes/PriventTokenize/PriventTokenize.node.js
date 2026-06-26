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

// src/nodes/PriventTokenize/PriventTokenize.node.ts
var PriventTokenize_node_exports = {};
__export(PriventTokenize_node_exports, {
  PriventTokenize: () => PriventTokenize
});
module.exports = __toCommonJS(PriventTokenize_node_exports);
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
function luhn(digits) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    const ch = digits[i];
    if (ch === void 0) continue;
    let d = parseInt(ch, 10);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}
function validateIban(value) {
  const s = value.replace(/[\s\-]/g, "").toUpperCase();
  if (s.length < 15 || s.length > 34) return false;
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(s)) return false;
  const rearranged = s.slice(4) + s.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    let chunk;
    if (code >= 48 && code <= 57) {
      chunk = ch;
    } else if (code >= 65 && code <= 90) {
      chunk = String(code - 55);
    } else {
      return false;
    }
    for (const d of chunk) {
      remainder = (remainder * 10 + (d.charCodeAt(0) - 48)) % 97;
    }
  }
  return remainder === 1;
}
var EMAIL = {
  kind: "EMAIL",
  // RFC 5321-ish; intentionally pragmatic over spec-perfect.
  regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
  normalize: (v) => v.trim().toLowerCase(),
  confidence: 0.95
};
var PHONE = {
  kind: "PHONE",
  // Matches E.164 (+12125551234), grouped US (212-555-1234), Turkish (0532 123 45 67), etc.
  regex: /(?<!\w)(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}(?!\d)/g,
  normalize: (v) => v.replace(/\D+/g, ""),
  confidence: 0.8
};
var CREDIT_CARD = {
  kind: "CREDIT_CARD",
  // 16-digit cards (Visa/MC/Discover) and 15-digit Amex, with optional separators.
  regex: /\b(?:\d[ \-]?){13,15}\d\b/g,
  normalize: (v) => v.replace(/\D+/g, ""),
  confidence: 0.98,
  validate(raw) {
    const digits = raw.replace(/\D+/g, "");
    if (digits.length < 13 || digits.length > 19) return false;
    return luhn(digits);
  }
};
var IBAN = {
  kind: "IBAN",
  // ISO 13616: 2-letter country, 2-digit check, 4-30 alphanum chars.
  regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/g,
  normalize: (v) => v.replace(/[\s\-]/g, "").toUpperCase(),
  confidence: 0.97,
  validate: (raw) => validateIban(raw)
};
var SSN = {
  kind: "SSN",
  // US Social Security Number: 000/666/900+ are invalid area codes.
  regex: /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g,
  normalize: (v) => v.replace(/\D+/g, ""),
  confidence: 0.9
};
var API_KEY = {
  kind: "API_KEY",
  // Covers: sk-*, pk-*, ghp_/ghs_ (GitHub), xoxb-/xoxp- (Slack), rk_live_ (Stripe).
  regex: /\b(?:sk|pk|rk_live|rk_test)[-_][a-zA-Z0-9]{16,}|ghp_[A-Za-z0-9_]{36}|ghs_[A-Za-z0-9_]{36}|xox[baprs]-[0-9a-zA-Z\-]{10,}/g,
  normalize: (v) => v.trim(),
  confidence: 0.88
};
var JWT = {
  kind: "JWT",
  // All JWTs start with eyJ (base64url of `{"`) in header and payload.
  regex: /\beyJ[A-Za-z0-9_\-]+\.eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g,
  normalize: (v) => v.trim(),
  confidence: 0.98
};
var AWS_KEY = {
  kind: "AWS_KEY",
  // AWS access key IDs are always AKIA + 16 uppercase alphanums.
  regex: /\bAKIA[0-9A-Z]{16}\b/g,
  normalize: (v) => v.trim(),
  confidence: 0.99
};
var IP_ADDRESS = {
  kind: "IP_ADDRESS",
  regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
  normalize: (v) => v.trim(),
  confidence: 0.85
};
var URL2 = {
  kind: "URL",
  regex: /https?:\/\/[^\s<>"{}|\\^`[\]]+/g,
  normalize: (v) => v.trim(),
  confidence: 0.9
};
var DEFAULT_DETECTORS = [
  AWS_KEY,
  JWT,
  CREDIT_CARD,
  IBAN,
  SSN,
  API_KEY,
  EMAIL,
  PHONE,
  IP_ADDRESS,
  URL2
];
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
async function riskScore(ctx, text, baseUrl, opts) {
  const start = Date.now();
  const bootstrap = opts?.bootstrapEntities?.slice(0, 256);
  const r = await priventRequest(ctx, baseUrl, "POST", "/v1/risk/score", {
    text,
    include_entities: true,
    ...opts?.lang != null ? { lang: opts.lang } : {},
    ...bootstrap != null && bootstrap.length > 0 ? { bootstrap_entities: bootstrap } : {}
  });
  return {
    risk_score: r.risk_score,
    risk_level: r.risk_level,
    categories: r.categories,
    model: r.model,
    latencyMs: Date.now() - start,
    entities: r.entities ?? null
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

// src/nodes/PriventTokenize/PriventTokenize.node.ts
var SOURCE_RANK = { model: 0, hint: 1, regex: 2 };
function removeOverlaps(spans) {
  const sorted = [...spans].sort(
    (a, b) => a.index - b.index || b.length - a.length || SOURCE_RANK[a.source] - SOURCE_RANK[b.source] || a.kind.localeCompare(b.kind) || a.value.localeCompare(b.value)
  );
  const kept = [];
  let lastEnd = -1;
  for (const s of sorted) {
    if (s.index >= lastEnd) {
      kept.push(s);
      lastEnd = s.index + s.length;
    }
  }
  return kept;
}
function detectMatches(text, detectors) {
  const matches = [];
  for (const detector of detectors) {
    const re = new RegExp(detector.regex.source, "g");
    for (const m of text.matchAll(re)) {
      if (m.index == null) continue;
      const raw = m[0];
      if (detector.validate && !detector.validate(raw)) continue;
      matches.push({
        kind: detector.kind,
        value: raw,
        index: m.index,
        length: raw.length,
        confidence: detector.confidence,
        source: "regex"
      });
    }
  }
  return removeOverlaps(matches);
}
var PriventTokenize = class {
  description = {
    displayName: "Privent Tokenize",
    name: "priventTokenize",
    icon: "file:privent.png",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["detectionMode"]}}',
    description: "Replaces sensitive values with reversible [KIND_NNN] placeholders before the text reaches an LLM or external service. Auto/Cloud modes also mask ML-detected names, dates of birth and addresses; Local mode is regex-only (structured PII).",
    defaults: { name: "Privent Tokenize" },
    inputs: [import_n8n_workflow.NodeConnectionTypes.Main],
    outputs: [import_n8n_workflow.NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [{ name: "priventApi", required: true }],
    properties: [
      {
        displayName: "Session ID",
        name: "sessionId",
        type: "string",
        default: '={{$("Privent Session").item.json.sessionId}}',
        required: true,
        description: "Session ID from the Privent Session node upstream in this workflow. Tokens are scoped to this session \u2014 Detokenize must use the same ID.",
        hint: "Add a Privent Session node at the start of your workflow to generate this value."
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
        displayName: "Text Field",
        name: "textField",
        type: "string",
        default: "text",
        required: true,
        description: "Name of the input item property that contains the text to tokenize"
      },
      {
        displayName: "Detection Mode",
        name: "detectionMode",
        type: "options",
        options: [
          {
            name: "Auto (Regex + ML Fallback)",
            value: "auto",
            description: "Uses local regex patterns + Privent Cloud ML when available. Falls back to regex-only if cloud is unreachable."
          },
          {
            name: "Local Only (Regex)",
            value: "local",
            description: "Regex-only detection (structured PII: emails, phones, SSN, cards, \u2026). No network calls, no risk scoring \u2014 deterministic and fast. Does NOT mask names, dates of birth or addresses; use Auto or Cloud for full PHI coverage."
          },
          {
            name: "Cloud (Regex + ML)",
            value: "cloud",
            description: "Forces the ML extraction pass. Fails if Privent Cloud is unreachable."
          }
        ],
        default: "auto",
        description: "Controls entity extraction strategy and whether to call Privent Cloud ML"
      },
      {
        displayName: "Flag for Review Above Risk Score",
        name: "reviewThreshold",
        type: "number",
        typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
        default: 0.9,
        description: "When Privent Cloud returns a risk score at or above this value, the item is flagged with privent.flaggedForReview = true. The workflow continues \u2014 use an IF or Switch node to route flagged items.",
        displayOptions: { hide: { detectionMode: ["local"] } }
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
        const textField = this.getNodeParameter("textField", i);
        const detectionMode = this.getNodeParameter("detectionMode", i);
        const reviewThreshold = detectionMode !== "local" ? this.getNodeParameter("reviewThreshold", i) : 1;
        const traceIdParam = this.getNodeParameter("traceId", i, "");
        const agentNameParam = this.getNodeParameter("agentName", i, "");
        const text = item.json[textField];
        if (typeof text !== "string") {
          throw new import_n8n_workflow.NodeOperationError(
            this.getNode(),
            `Field "${textField}" is not a string. Got: ${typeof text}`,
            {
              itemIndex: i,
              description: 'Check the "Text Field" parameter \u2014 it should match the property name in your input data.'
            }
          );
        }
        const vault = new N8nHttpVault(this, sessionId, baseUrl);
        const localSpans = detectMatches(text, DEFAULT_DETECTORS);
        let risk = null;
        let flaggedForReview = false;
        const backendSpans = [];
        if (detectionMode !== "local") {
          try {
            const scored = await riskScore(this, text, baseUrl, {
              lang: "auto",
              bootstrapEntities: localSpans.map((s) => ({
                kind: s.kind,
                value: s.value,
                span: [s.index, s.index + s.length],
                confidence: s.confidence,
                source: "regex"
              }))
            });
            risk = scored;
            for (const e of scored.entities ?? []) {
              backendSpans.push({
                kind: e.kind,
                value: e.value,
                index: e.span[0],
                length: e.span[1] - e.span[0],
                confidence: e.confidence,
                source: e.source
              });
            }
            if (risk.risk_score >= reviewThreshold) flaggedForReview = true;
          } catch (err) {
            if (detectionMode === "cloud") throw err;
          }
        }
        const merged = removeOverlaps([...localSpans, ...backendSpans]).filter((s) => s.length > 0 && s.index >= 0 && s.index + s.length <= text.length).map((s) => ({ ...s, value: text.slice(s.index, s.index + s.length) }));
        let tokenizedText = text;
        const entities = [];
        if (merged.length > 0) {
          const batched = await vault.findOrCreateBatch(
            merged.map((s) => ({ kind: s.kind, value: s.value }))
          );
          const withTokens = merged.map((s, idx) => ({ ...s, token: batched[idx]?.token }));
          for (const s of [...withTokens].sort((a, b) => b.index - a.index)) {
            if (s.token == null) continue;
            tokenizedText = tokenizedText.slice(0, s.index) + s.token + tokenizedText.slice(s.index + s.length);
          }
          for (const s of withTokens) {
            if (s.token == null) continue;
            entities.push({ token: s.token, kind: s.kind, confidence: s.confidence, source: s.source, span: [s.index, s.index + s.length] });
          }
          entities.sort((a, b) => a.span[0] - b.span[0]);
        }
        const ctx = resolveContext(this, sessionId, traceIdParam, agentNameParam);
        const node = this.getNode();
        const tokenizeEvent = {
          type: "tokenize",
          traceId: ctx.traceId,
          sessionId,
          timestamp: Date.now(),
          framework: "n8n",
          workflowId: ctx.workflowId,
          nodeId: node.id,
          metadata: buildAuditMetadata(ctx, node, {
            entity_kinds: [...new Set(entities.map((e) => e.kind))],
            entity_count: entities.length,
            risk_score: risk?.risk_score ?? null,
            risk_level: risk?.risk_level ?? null,
            flagged_for_review: flaggedForReview,
            detection_mode: detectionMode,
            ...triggerMode !== void 0 ? { trigger_mode: triggerMode } : {}
          })
        };
        void auditLog(this, tokenizeEvent, baseUrl);
        out.push({
          json: {
            ...item.json,
            [textField]: tokenizedText,
            privent: {
              sessionId,
              entities: entities.map((e) => ({
                token: e.token,
                kind: e.kind,
                confidence: e.confidence,
                source: e.source
              })),
              risk,
              flaggedForReview
            }
          },
          pairedItem: { item: i }
        });
      } catch (err) {
        if (this.continueOnFail()) {
          out.push({ json: { error: err.message }, pairedItem: { item: i } });
          continue;
        }
        throw err;
      }
    }
    return [out];
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PriventTokenize
});
//# sourceMappingURL=PriventTokenize.node.js.map
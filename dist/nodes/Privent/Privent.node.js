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

// nodes/Privent/Privent.node.ts
var Privent_node_exports = {};
__export(Privent_node_exports, {
  Privent: () => Privent
});
module.exports = __toCommonJS(Privent_node_exports);
var import_n8n_workflow8 = require("n8n-workflow");

// shared/privent-http.ts
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
  const v = "2.1.0";
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

// shared/privent-http.ts
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
function getAuthMode(ctx) {
  return ctx.getNodeParameter("authentication", 0, "apiKey");
}
async function getPriventBaseUrl(ctx) {
  const credName = getAuthMode(ctx) === "tokenless" ? "priventVisitorApi" : "priventApi";
  const creds = await ctx.getCredentials(credName);
  return creds.baseUrl;
}
function httpErrorStatus(err) {
  const e = err;
  const raw = e.httpCode ?? e.statusCode ?? e.response?.status;
  const n = Number(raw);
  return Number.isFinite(n) ? n : void 0;
}
async function resolveVisitorId(ctx, baseUrl) {
  const staticData = ctx.getWorkflowStaticData("global");
  const cache = staticData.priventVisitor ??= {};
  const nowSec = Math.floor(Date.now() / 1e3);
  const cached = cache[baseUrl];
  if (cached && cached.expiresAt - nowSec > 300) {
    return cached.visitorId;
  }
  let res;
  try {
    res = await ctx.helpers.httpRequest({
      method: "POST",
      baseURL: baseUrl,
      url: "/v1/visitor/credentials",
      body: {},
      json: true
    });
  } catch (err) {
    const status = httpErrorStatus(err);
    if (status === 404) {
      throw new import_n8n_workflow.NodeOperationError(
        ctx.getNode(),
        "Tokenless mode isn't enabled on this Privent backend \u2014 switch Authentication to API Key, or enable visitor auth on the backend."
      );
    }
    if (status === 429) {
      throw new import_n8n_workflow.NodeOperationError(
        ctx.getNode(),
        "Rate limited minting a visitor credential; retry shortly."
      );
    }
    throw new import_n8n_workflow.NodeOperationError(
      ctx.getNode(),
      `Failed to mint a Privent visitor credential${status != null ? ` (HTTP ${status})` : ""}: ${err.message}`
    );
  }
  const visitorId = res.visitor_id;
  const expiresAt = res.expires_at;
  if (typeof visitorId !== "string" || typeof expiresAt !== "number") {
    throw new import_n8n_workflow.NodeOperationError(
      ctx.getNode(),
      "Privent visitor credential response was malformed (missing visitor_id/expires_at)."
    );
  }
  cache[baseUrl] = { visitorId, expiresAt };
  return visitorId;
}
async function priventVisitorRequest(ctx, baseUrl, method, url, body) {
  const send = async (visitorId2) => await ctx.helpers.httpRequest({
    method,
    baseURL: baseUrl,
    url,
    body,
    json: true,
    timeout: 2e5,
    headers: { "X-Visitor-Id": visitorId2 }
  });
  const visitorId = await resolveVisitorId(ctx, baseUrl);
  try {
    return await send(visitorId);
  } catch (err) {
    if (httpErrorStatus(err) !== 401) throw err;
    const cache = ctx.getWorkflowStaticData("global").priventVisitor ?? {};
    delete cache[baseUrl];
    return send(await resolveVisitorId(ctx, baseUrl));
  }
}
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(value) {
  return UUID_RE.test(value);
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
var MAX_VAULT_SESSIONS = 50;
var WorkflowStaticDataVault = class {
  constructor(ctx, sessionId) {
    this.ctx = ctx;
    this.sessionId = sessionId;
  }
  ctx;
  sessionId;
  root() {
    const sd = this.ctx.getWorkflowStaticData("global");
    return sd.priventVault ??= { sessions: {}, order: [] };
  }
  session() {
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
  async findOrCreateBatch(items) {
    const s = this.session();
    return items.map((it) => {
      const normalized = normalize(it.kind, it.value);
      const key = `${it.kind}|${normalized}`;
      let token = s.byKey[key];
      if (token == null) {
        const n = s.counters[it.kind] = (s.counters[it.kind] ?? 0) + 1;
        token = `[${it.kind}_${String(n).padStart(3, "0")}]`;
        s.byKey[key] = token;
        s.byToken[token] = { kind: it.kind, value: it.value };
      }
      return { kind: it.kind, value: normalized, token };
    });
  }
  async retrieveBatch(tokens) {
    if (tokens.length === 0) return [];
    const s = this.session();
    const out = [];
    for (const token of tokens) {
      const entry = s.byToken[token];
      if (entry) out.push({ token, kind: entry.kind, value: entry.value });
    }
    return out;
  }
  async destroy() {
    const root = this.root();
    delete root.sessions[this.sessionId];
    const idx = root.order.indexOf(this.sessionId);
    if (idx >= 0) root.order.splice(idx, 1);
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
async function riskScore(ctx, text, baseUrl, opts) {
  const start = Date.now();
  const bootstrap = opts?.bootstrapEntities?.slice(0, 256);
  const send = getAuthMode(ctx) === "tokenless" ? priventVisitorRequest : priventRequest;
  const r = await send(ctx, baseUrl, "POST", "/v1/risk/score", {
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
async function riskScoreBatch(ctx, texts, baseUrl) {
  if (texts.length === 0) return [];
  const start = Date.now();
  const send = getAuthMode(ctx) === "tokenless" ? priventVisitorRequest : priventRequest;
  const res = await send(
    ctx,
    baseUrl,
    "POST",
    "/v1/risk/batch",
    { items: texts.map((text) => ({ text, include_entities: true })) }
  );
  if (!Array.isArray(res.results) || res.results.length !== texts.length) {
    throw new Error(
      `Privent risk batch length mismatch: sent ${texts.length}, got ${Array.isArray(res.results) ? res.results.length : 0}`
    );
  }
  return res.results.map((r) => ({
    risk_score: r.risk_score,
    risk_level: r.risk_level,
    categories: r.categories,
    model: r.model,
    latencyMs: r.latency_ms ?? Date.now() - start,
    entities: r.entities ?? null
  }));
}
async function auditLog(ctx, event, baseUrl) {
  if (getAuthMode(ctx) === "tokenless") return;
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
var _fwVersion;
var _fwRead = false;
function safeFrameworkVersion() {
  if (_fwRead) return _fwVersion;
  _fwRead = true;
  try {
    const pkg = require("n8n-workflow/package.json");
    if (typeof pkg.version === "string" && pkg.version.length > 0) _fwVersion = pkg.version;
  } catch {
  }
  return _fwVersion;
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

// nodes/Privent/operations/session.ts
var import_n8n_workflow2 = require("n8n-workflow");
async function handleSession(ctx, i, baseUrl) {
  const item = ctx.getInputData()[i];
  const framework = ctx.getNodeParameter("framework", i, "n8n") === "manual" ? "manual" : "n8n";
  const triggerMode = safeTriggerMode(ctx);
  const { id: workflowId, name: workflowName } = safeWorkflow(ctx);
  const executionId = safeExecutionId(ctx);
  const mode = ctx.getNodeParameter("sessionIdMode", i);
  const sessionId = mode === "manual" ? ctx.getNodeParameter("sessionId", i).trim() : crypto.randomUUID();
  if (!sessionId) {
    throw new import_n8n_workflow2.NodeOperationError(ctx.getNode(), "Session ID cannot be empty in manual mode", {
      itemIndex: i
    });
  }
  if (mode === "manual" && !isUuid(sessionId)) {
    throw new import_n8n_workflow2.NodeOperationError(
      ctx.getNode(),
      "Manual Session ID must be a UUID \u2014 auto mode generates one",
      { itemIndex: i }
    );
  }
  const traceId = crypto.randomUUID();
  const agentNameParam = ctx.getNodeParameter("agentName", i, "").trim();
  const agentName = agentNameParam || workflowName || "";
  const startedAt = Date.now();
  let triggerPrincipalIp;
  let triggerPrincipalUserAgent;
  const webhookNodeName = ctx.getNodeParameter("webhookNodeName", i, "Webhook").trim();
  if (webhookNodeName) {
    try {
      const headersExpr = `={{$("${webhookNodeName}").first().json.headers}}`;
      const headers = ctx.evaluateExpression(headersExpr, i);
      if (headers && typeof headers === "object") {
        const lower = {};
        for (const [k, v] of Object.entries(headers)) {
          if (typeof v === "string") lower[k.toLowerCase()] = v;
        }
        const ipChain = ["x-forwarded-for", "cf-connecting-ip", "x-real-ip", "x-client-ip"];
        for (const h of ipChain) {
          const raw = lower[h];
          if (raw) {
            const first = raw.split(",")[0]?.trim();
            if (first) {
              triggerPrincipalIp = first;
              break;
            }
          }
        }
        if (lower["user-agent"]) {
          triggerPrincipalUserAgent = lower["user-agent"].slice(0, 500);
        }
      }
    } catch {
    }
  }
  const node = ctx.getNode();
  const auditCtx = {
    sessionId,
    traceId,
    executionId,
    agentName,
    workflowId,
    workflowName
  };
  const sessionOpen = {
    type: "session_open",
    traceId,
    sessionId,
    timestamp: startedAt,
    framework,
    workflowId,
    nodeId: node.id,
    metadata: buildAuditMetadata(auditCtx, node, {
      session_id_mode: mode,
      framework_version: safeFrameworkVersion() ?? TRACER_VERSION,
      ...triggerMode !== void 0 ? { trigger_mode: triggerMode } : {},
      ...triggerPrincipalIp !== void 0 ? { trigger_principal_ip: triggerPrincipalIp } : {},
      ...triggerPrincipalUserAgent !== void 0 ? { trigger_principal_user_agent: triggerPrincipalUserAgent } : {}
    })
  };
  void auditLog(ctx, sessionOpen, baseUrl);
  return {
    ...item.json,
    sessionId,
    traceId,
    startedAt,
    executionId,
    agentName
  };
}

// nodes/Privent/operations/tokenize.ts
var import_n8n_workflow3 = require("n8n-workflow");
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
async function handleTokenize(ctx, i, baseUrl) {
  const item = ctx.getInputData()[i];
  const triggerMode = safeTriggerMode(ctx);
  const sessionId = ctx.getNodeParameter("sessionId", i);
  const textField = ctx.getNodeParameter("textField", i);
  const detectionMode = ctx.getNodeParameter("detectionMode", i);
  const reviewThreshold = detectionMode !== "local" ? ctx.getNodeParameter("reviewThreshold", i) : 1;
  const traceIdParam = ctx.getNodeParameter("traceId", i, "");
  const agentNameParam = ctx.getNodeParameter("agentName", i, "");
  const text = item.json[textField];
  if (typeof text !== "string") {
    throw new import_n8n_workflow3.NodeOperationError(
      ctx.getNode(),
      `Field "${textField}" is not a string. Got: ${typeof text}`,
      {
        itemIndex: i,
        description: 'Check the "Text Field" parameter \u2014 it should match the property name in your input data.'
      }
    );
  }
  const vault = getAuthMode(ctx) === "tokenless" ? new WorkflowStaticDataVault(ctx, sessionId) : new N8nHttpVault(ctx, sessionId, baseUrl);
  const localSpans = detectMatches(text, DEFAULT_DETECTORS);
  let risk = null;
  let flaggedForReview = false;
  const backendSpans = [];
  if (detectionMode !== "local") {
    try {
      const scored = await riskScore(ctx, text, baseUrl, {
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
      if (detectionMode === "cloud") {
        throw new import_n8n_workflow3.NodeApiError(ctx.getNode(), err, { itemIndex: i });
      }
    }
  }
  const merged = removeOverlaps([...localSpans, ...backendSpans]).filter((s) => s.length > 0 && s.index >= 0 && s.index + s.length <= text.length).map((s) => ({ ...s, value: text.slice(s.index, s.index + s.length) }));
  let tokenizedText = text;
  const entities = [];
  if (merged.length > 0) {
    let batched;
    try {
      batched = await vault.findOrCreateBatch(merged.map((s) => ({ kind: s.kind, value: s.value })));
    } catch (err) {
      throw new import_n8n_workflow3.NodeApiError(ctx.getNode(), err, { itemIndex: i });
    }
    const withTokens = merged.map((s, idx) => ({ ...s, token: batched[idx]?.token }));
    for (const s of [...withTokens].sort((a, b) => b.index - a.index)) {
      if (s.token == null) continue;
      tokenizedText = tokenizedText.slice(0, s.index) + s.token + tokenizedText.slice(s.index + s.length);
    }
    for (const s of withTokens) {
      if (s.token == null) continue;
      entities.push({
        token: s.token,
        kind: s.kind,
        confidence: s.confidence,
        source: s.source,
        span: [s.index, s.index + s.length]
      });
    }
    entities.sort((a, b) => a.span[0] - b.span[0]);
  }
  const ctxAudit = resolveContext(ctx, sessionId, traceIdParam, agentNameParam);
  const node = ctx.getNode();
  const tokenizeEvent = {
    type: "tokenize",
    traceId: ctxAudit.traceId,
    sessionId,
    timestamp: Date.now(),
    framework: "n8n",
    workflowId: ctxAudit.workflowId,
    nodeId: node.id,
    metadata: buildAuditMetadata(ctxAudit, node, {
      entity_kinds: [...new Set(entities.map((e) => e.kind))],
      entity_count: entities.length,
      risk_score: risk?.risk_score ?? null,
      risk_level: risk?.risk_level ?? null,
      flagged_for_review: flaggedForReview,
      detection_mode: detectionMode,
      ...triggerMode !== void 0 ? { trigger_mode: triggerMode } : {}
    })
  };
  void auditLog(ctx, tokenizeEvent, baseUrl);
  return {
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
  };
}

// nodes/Privent/operations/detokenize.ts
var import_node_crypto = require("crypto");
var import_n8n_workflow4 = require("n8n-workflow");
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
async function handleDetokenize(ctx, i, baseUrl) {
  const item = ctx.getInputData()[i];
  const triggerMode = safeTriggerMode(ctx);
  const sessionId = ctx.getNodeParameter("sessionId", i);
  const targetField = ctx.getNodeParameter("targetField", i);
  const strict = ctx.getNodeParameter("strict", i);
  const traceIdParam = ctx.getNodeParameter("traceId", i, "");
  const agentNameParam = ctx.getNodeParameter("agentName", i, "");
  let sinkUrl = "";
  let isTrusted = true;
  if (strict) {
    sinkUrl = ctx.getNodeParameter("sinkUrl", i);
    const trustedRaw = ctx.getNodeParameter("trustedSinks", i);
    const trusted = trustedRaw.split(",").map((s) => s.trim()).filter(Boolean);
    isTrusted = matchesTrustedSink(sinkUrl, trusted);
  }
  const sinkId = deriveSinkId(sinkUrl);
  const sinkUrlHost = deriveSinkUrlHost(sinkUrl);
  const targetAgentName = (ctx.getNodeParameter("targetAgentName", i, "") ?? "").trim();
  const ctxAudit = resolveContext(ctx, sessionId, traceIdParam, agentNameParam);
  const node = ctx.getNode();
  if (!isTrusted) {
    const blockedEvent = {
      type: "detokenize",
      traceId: ctxAudit.traceId,
      sessionId,
      timestamp: Date.now(),
      framework: "n8n",
      workflowId: ctxAudit.workflowId,
      nodeId: node.id,
      ...targetAgentName ? { targetAgentName } : {},
      metadata: buildAuditMetadata(ctxAudit, node, {
        sink_id: sinkId,
        sink_url_host: sinkUrlHost,
        sink_trusted: false,
        strict: true,
        tokens_redeemed: 0,
        reason: "strict-mode-block",
        ...triggerMode !== void 0 ? { trigger_mode: triggerMode } : {}
      })
    };
    void auditLog(ctx, blockedEvent, baseUrl);
    return {
      ...item.json,
      privent: {
        sessionId,
        detokenized: false,
        reason: "strict-mode: destination URL not in trusted sinks list"
      }
    };
  }
  const vault = getAuthMode(ctx) === "tokenless" ? new WorkflowStaticDataVault(ctx, sessionId) : new N8nHttpVault(ctx, sessionId, baseUrl);
  const scanTarget = targetField === "*" ? item.json : item.json[targetField];
  const placeholders = [...scanForTokens(scanTarget)];
  const tokensRedeemed = placeholders.length;
  const uniqPlaceholders = [...new Set(placeholders)].sort();
  const valueFingerprint = uniqPlaceholders.length > 0 ? await sha256short(uniqPlaceholders.join(" ")) : null;
  const valueFingerprints = await Promise.all(uniqPlaceholders.map((p) => sha256short(p)));
  let entries;
  try {
    entries = await vault.retrieveBatch([...new Set(placeholders)]);
  } catch (err) {
    throw new import_n8n_workflow4.NodeApiError(ctx.getNode(), err, { itemIndex: i });
  }
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
    traceId: ctxAudit.traceId,
    sessionId,
    timestamp: Date.now(),
    framework: "n8n",
    workflowId: ctxAudit.workflowId,
    nodeId: node.id,
    ...targetAgentName ? { targetAgentName } : {},
    metadata: buildAuditMetadata(ctxAudit, node, {
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
  void auditLog(ctx, event, baseUrl);
  return {
    ...json,
    privent: { sessionId, detokenized: true }
  };
}

// nodes/Privent/operations/riskCheck.ts
var import_n8n_workflow5 = require("n8n-workflow");
function isBatchLengthMismatch(err) {
  return err instanceof Error && err.message.startsWith("Privent risk batch length mismatch");
}
async function executeRiskCheck(ctx) {
  const items = ctx.getInputData();
  const baseUrl = await getPriventBaseUrl(ctx);
  const triggerMode = safeTriggerMode(ctx);
  const texts = [];
  const errors = /* @__PURE__ */ new Map();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const textField = ctx.getNodeParameter("textField", i);
      const raw = item.json[textField];
      if (typeof raw !== "string") {
        throw new import_n8n_workflow5.NodeOperationError(
          ctx.getNode(),
          `Field "${textField}" is not a string. Got: ${typeof raw}`,
          {
            itemIndex: i,
            description: 'Check the "Text Field" parameter \u2014 it should match a string property in your input data.'
          }
        );
      }
      texts.push({ text: raw, itemIndex: i });
    } catch (err) {
      if (ctx.continueOnFail()) {
        errors.set(i, err);
      } else {
        throw err;
      }
    }
  }
  let scores;
  try {
    scores = texts.length > 0 ? await riskScoreBatch(ctx, texts.map((t) => t.text), baseUrl) : [];
  } catch (err) {
    if (ctx.continueOnFail()) {
      const out2 = [];
      for (let i = 0; i < items.length; i++) {
        const message = errors.has(i) ? errors.get(i).message : err.message;
        out2.push({ json: { error: message }, pairedItem: { item: i } });
      }
      return [out2];
    }
    if (isBatchLengthMismatch(err)) {
      throw new import_n8n_workflow5.NodeOperationError(ctx.getNode(), err);
    }
    throw new import_n8n_workflow5.NodeApiError(ctx.getNode(), err);
  }
  const out = [];
  const node = ctx.getNode();
  let scoreIdx = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (errors.has(i)) {
      out.push({ json: { error: errors.get(i).message }, pairedItem: { item: i } });
      continue;
    }
    const traceIdParam = ctx.getNodeParameter("traceId", i, "");
    const agentNameParam = ctx.getNodeParameter("agentName", i, "");
    const auditCtx = resolveContext(ctx, "", traceIdParam, agentNameParam);
    const risk = scores[scoreIdx++];
    const event = {
      type: "risk_check",
      traceId: auditCtx.traceId,
      sessionId: auditCtx.traceId,
      timestamp: Date.now(),
      framework: "n8n",
      workflowId: auditCtx.workflowId,
      nodeId: node.id,
      metadata: buildAuditMetadata(auditCtx, node, {
        risk_score: risk.risk_score,
        risk_level: risk.risk_level,
        categories: risk.categories ?? null,
        model: risk.model,
        latency_ms: risk.latencyMs,
        batch_size: texts.length,
        ...triggerMode !== void 0 ? { trigger_mode: triggerMode } : {}
      })
    };
    void auditLog(ctx, event, baseUrl);
    out.push({
      json: {
        ...item.json,
        privent: {
          risk_score: risk.risk_score,
          risk_level: risk.risk_level,
          categories: risk.categories,
          model: risk.model,
          latencyMs: risk.latencyMs
        }
      },
      pairedItem: { item: i }
    });
  }
  return [out];
}

// nodes/Privent/operations/audit.ts
var import_n8n_workflow6 = require("n8n-workflow");
async function handleAudit(ctx, i, baseUrl) {
  const item = ctx.getInputData()[i];
  const triggerMode = safeTriggerMode(ctx);
  const frameworkVersion = safeFrameworkVersion();
  const sessionId = ctx.getNodeParameter("sessionId", i).trim();
  if (!sessionId) {
    throw new import_n8n_workflow6.NodeOperationError(ctx.getNode(), "Session ID is required", { itemIndex: i });
  }
  const traceIdParam = ctx.getNodeParameter("traceId", i, "");
  const agentNameParam = ctx.getNodeParameter("agentName", i, "");
  const eventType = ctx.getNodeParameter("eventType", i);
  const extraRaw = ctx.getNodeParameter("extraMetadata", i, "{}");
  let extraMetadata = {};
  if (typeof extraRaw === "string") {
    try {
      const parsed = JSON.parse(extraRaw || "{}");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        extraMetadata = parsed;
      }
    } catch {
    }
  } else if (extraRaw && typeof extraRaw === "object" && !Array.isArray(extraRaw)) {
    extraMetadata = extraRaw;
  }
  const metadata = { ...extraMetadata };
  if (eventType === "llm_call") {
    const selected = ctx.getNodeParameter("model", i, "", { extractValue: true }).trim();
    const sep = selected.indexOf("|");
    const provider = sep >= 0 ? selected.slice(0, sep).trim().toLowerCase() : "";
    const model = sep >= 0 ? selected.slice(sep + 1).trim() : selected;
    const promptTokensRaw = ctx.getNodeParameter("promptTokens", i);
    const completionTokensRaw = ctx.getNodeParameter("completionTokens", i);
    const promptTokens = Number(promptTokensRaw);
    const completionTokens = Number(completionTokensRaw);
    if (provider) metadata.provider = provider;
    if (model) metadata.model = model;
    metadata.prompt_tokens = Number.isFinite(promptTokens) && promptTokens > 0 ? Math.trunc(promptTokens) : 0;
    metadata.completion_tokens = Number.isFinite(completionTokens) && completionTokens > 0 ? Math.trunc(completionTokens) : 0;
  }
  const auditCtx = resolveContext(ctx, sessionId, traceIdParam, agentNameParam);
  const node = ctx.getNode();
  if (triggerMode !== void 0) metadata.trigger_mode = triggerMode;
  if (frameworkVersion !== void 0) metadata.framework_version = frameworkVersion;
  const event = {
    type: eventType,
    traceId: auditCtx.traceId,
    sessionId,
    timestamp: Date.now(),
    framework: "n8n",
    workflowId: auditCtx.workflowId,
    nodeId: node.id,
    metadata: buildAuditMetadata(auditCtx, node, metadata)
  };
  void auditLog(ctx, event, baseUrl);
  return {
    ...item.json,
    privent: {
      sessionId,
      auditEventEmitted: true,
      eventType
    }
  };
}

// nodes/Privent/operations/handoff.ts
var import_n8n_workflow7 = require("n8n-workflow");
async function handleHandoff(ctx, i, baseUrl) {
  const item = ctx.getInputData()[i];
  const triggerMode = safeTriggerMode(ctx);
  const targetKind = ctx.getNodeParameter("targetKind", i, "agent");
  const reason = ctx.getNodeParameter("reason", i, "delegation");
  const payloadTokenCount = Number(ctx.getNodeParameter("payloadTokenCount", i, 0) ?? 0);
  const sessionIdParam = ctx.getNodeParameter("sessionId", i, "").trim();
  const traceIdParam = ctx.getNodeParameter("traceId", i, "");
  const agentNameParam = ctx.getNodeParameter("agentName", i, "");
  const ctxAudit = resolveContext(ctx, sessionIdParam, traceIdParam, agentNameParam);
  const node = ctx.getNode();
  if (!ctxAudit.sessionId) {
    throw new import_n8n_workflow7.NodeOperationError(
      ctx.getNode(),
      "Privent Handoff requires an upstream Privent Session node \u2014 sessionId is missing.",
      { itemIndex: i }
    );
  }
  if (!ctxAudit.agentName) {
    throw new import_n8n_workflow7.NodeOperationError(
      ctx.getNode(),
      "Privent Handoff requires the upstream Privent Session to have an Agent Name set.",
      { itemIndex: i }
    );
  }
  let toAgentName;
  let toSinkId;
  if (targetKind === "agent") {
    toAgentName = ctx.getNodeParameter("toAgentName", i, "").trim();
    if (!toAgentName) {
      throw new import_n8n_workflow7.NodeOperationError(
        ctx.getNode(),
        "Target Agent Name is required when Target Kind = Agent",
        { itemIndex: i }
      );
    }
  } else {
    toSinkId = ctx.getNodeParameter("toSinkId", i, "").trim();
    if (!toSinkId) {
      throw new import_n8n_workflow7.NodeOperationError(
        ctx.getNode(),
        "External Sink ID is required when Target Kind = External Sink",
        { itemIndex: i }
      );
    }
  }
  const handoffEvent = {
    type: "agent_handoff",
    traceId: ctxAudit.traceId,
    sessionId: ctxAudit.sessionId,
    timestamp: Date.now(),
    framework: "n8n",
    workflowId: ctxAudit.workflowId,
    nodeId: node.id,
    nodeName: node.name,
    fromAgentName: ctxAudit.agentName,
    ...toAgentName != null ? { targetAgentName: toAgentName } : {},
    ...toSinkId != null ? { targetSinkId: toSinkId } : {},
    reason,
    ...Number.isFinite(payloadTokenCount) && payloadTokenCount > 0 ? { payloadTokenCount } : {},
    // v1 (n8n linear flows) always 1. LangGraph/CrewAI adapters will fill
    // parent_event_id/branch_id/hop_depth for non-linear topologies.
    hopDepth: 1,
    metadata: buildAuditMetadata(ctxAudit, node, {
      ...triggerMode !== void 0 ? { trigger_mode: triggerMode } : {}
    })
  };
  void auditLog(ctx, handoffEvent, baseUrl);
  return {
    ...item.json,
    privent: {
      handoff: true,
      fromAgentName: ctxAudit.agentName,
      toAgentName: toAgentName ?? null,
      toSinkId: toSinkId ?? null,
      reason
    }
  };
}

// nodes/Privent/Privent.node.ts
var PER_ITEM_HANDLERS = {
  session: handleSession,
  tokenize: handleTokenize,
  detokenize: handleDetokenize,
  audit: handleAudit,
  handoff: handleHandoff
};
var Privent = class {
  description = {
    displayName: "Privent",
    name: "privent",
    icon: "file:privent.png",
    group: ["transform"],
    version: 1,
    usableAsTool: true,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: "Privent DLP: session-scoped tokenization, detokenization, risk scoring, audit events and agent handoffs for AI agent workflows.",
    defaults: { name: "Privent" },
    inputs: [import_n8n_workflow8.NodeConnectionTypes.Main],
    outputs: [import_n8n_workflow8.NodeConnectionTypes.Main],
    credentials: [
      { name: "priventApi", required: true, displayOptions: { show: { authentication: ["apiKey"] } } },
      { name: "priventVisitorApi", required: true, displayOptions: { show: { authentication: ["tokenless"] } } }
    ],
    properties: [
      {
        displayName: "Authentication",
        name: "authentication",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "API Key",
            value: "apiKey",
            description: "Full Privent: vault tokenization, audit, handoff and risk scoring. Requires a Privent API key."
          },
          {
            name: "Tokenless (Visitor)",
            value: "tokenless",
            description: "No API key \u2014 in-memory tokenization + risk scoring via an anonymous visitor id. The backend must have visitor auth enabled."
          }
        ],
        default: "apiKey"
      },
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { authentication: ["apiKey"] } },
        options: [
          { name: "Session", value: "session" },
          { name: "Tokenize", value: "tokenize" },
          { name: "Detokenize", value: "detokenize" },
          { name: "Risk Check", value: "riskCheck" },
          { name: "Audit", value: "audit" },
          { name: "Handoff", value: "handoff" }
        ],
        default: "tokenize"
      },
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { authentication: ["tokenless"] } },
        options: [
          { name: "Session", value: "session" },
          { name: "Tokenize", value: "tokenize" },
          { name: "Detokenize", value: "detokenize" },
          { name: "Risk Check", value: "riskCheck" }
        ],
        default: "tokenize"
      },
      // ── Operations (one per resource) ───────────────────────────────────
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["session"] } },
        options: [
          {
            name: "Open",
            value: "open",
            action: "Open a session",
            description: "Opens a Privent session vault at the start of your workflow. Place this node before any Tokenize operations. The sessionId output must be passed to all downstream Privent nodes."
          }
        ],
        default: "open"
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["tokenize"] } },
        options: [
          {
            name: "Tokenize",
            value: "tokenize",
            action: "Tokenize sensitive text",
            description: "Replaces sensitive values with reversible [KIND_NNN] placeholders before the text reaches an LLM or external service"
          }
        ],
        default: "tokenize"
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["detokenize"] } },
        options: [
          {
            name: "Detokenize",
            value: "detokenize",
            action: "Detokenize text",
            description: "\u26A0 Agent-reachable as a tool: an agent could un-mask data with this operation. Use Strict Mode + Trusted Sinks to control egress. Resolves [KIND_NNN] placeholders back to their original values before data leaves the workflow."
          }
        ],
        default: "detokenize"
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["riskCheck"] } },
        options: [
          {
            name: "Score",
            value: "score",
            action: "Score text risk",
            description: "Scores text for data-leak risk using Privent ML. Returns risk_score (0\u20131), risk_level, and per-category probabilities."
          }
        ],
        default: "score"
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { authentication: ["apiKey"], resource: ["audit"] } },
        options: [
          {
            name: "Emit",
            value: "emit",
            action: "Emit an audit event",
            description: "Emits a Privent audit event for non-tokenization steps (LLM call cost tracking, policy decisions, egress, errors)"
          }
        ],
        default: "emit"
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { authentication: ["apiKey"], resource: ["handoff"] } },
        options: [
          {
            name: "Record",
            value: "record",
            action: "Record an agent handoff",
            description: "Marks an explicit agent \u2192 agent (or agent \u2192 external sink) handoff for the Trust Map"
          }
        ],
        default: "record"
      },
      // ── session ─────────────────────────────────────────────────────────
      {
        displayName: "Session ID Mode",
        name: "sessionIdMode",
        type: "options",
        options: [
          {
            name: "Auto-Generate (Recommended)",
            value: "auto",
            description: "A new UUID is generated for each workflow execution"
          },
          {
            name: "Manual",
            value: "manual",
            description: "Supply your own session ID (useful for resuming a session)"
          }
        ],
        default: "auto",
        displayOptions: { show: { resource: ["session"], operation: ["open"] } }
      },
      {
        displayName: "Session ID",
        name: "sessionId",
        type: "string",
        default: "",
        required: true,
        description: "A stable string that identifies this session",
        displayOptions: {
          show: { resource: ["session"], operation: ["open"], sessionIdMode: ["manual"] }
        }
      },
      {
        displayName: "Agent Name",
        name: "agentName",
        type: "string",
        default: "",
        description: "Logical agent identifier written to the output item and forwarded to downstream Privent nodes (via their Agent Name expression default). Appears in every audit event as metadata.agent_name.",
        hint: 'Optional. Example: "support-bot", "billing-agent". Leave empty if not modeling distinct agents.',
        displayOptions: { show: { resource: ["session"], operation: ["open"] } }
      },
      {
        displayName: "Framework",
        name: "framework",
        type: "options",
        options: [
          { name: "n8n", value: "n8n" },
          { name: "Manual / Custom", value: "manual" }
        ],
        default: "n8n",
        description: "Identifies the orchestration framework in audit logs",
        displayOptions: { show: { resource: ["session"], operation: ["open"] } }
      },
      {
        displayName: "Webhook Node Name",
        name: "webhookNodeName",
        type: "string",
        default: "Webhook",
        description: "Optional. Name of an upstream Webhook trigger node. When set, the SDK auto-extracts client IP and User-Agent from its headers and writes them to agent_sessions (trigger_principal_ip, trigger_principal_user_agent).",
        hint: "Leave default if your workflow does not start with a Webhook trigger; parse failures are silent.",
        displayOptions: { show: { resource: ["session"], operation: ["open"] } }
      },
      // ── tokenize ────────────────────────────────────────────────────────
      {
        displayName: "Session ID",
        name: "sessionId",
        type: "string",
        default: '={{$("Privent Session").item.json.sessionId}}',
        required: true,
        description: "Session ID from the Privent Session node upstream in this workflow. Tokens are scoped to this session \u2014 Detokenize must use the same ID.",
        hint: "Add a Privent Session node at the start of your workflow to generate this value.",
        displayOptions: { show: { resource: ["tokenize"], operation: ["tokenize"] } }
      },
      {
        displayName: "Trace ID",
        name: "traceId",
        type: "string",
        default: '={{ $("Privent Session").item.json.traceId }}',
        description: "Correlation ID from the upstream Privent Session node. Links this event to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.",
        displayOptions: { show: { resource: ["tokenize"], operation: ["tokenize"] } }
      },
      {
        displayName: "Agent Name",
        name: "agentName",
        type: "string",
        default: '={{ $("Privent Session").item.json.agentName }}',
        description: "Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.",
        displayOptions: { show: { resource: ["tokenize"], operation: ["tokenize"] } }
      },
      {
        displayName: "Text Field",
        name: "textField",
        type: "string",
        default: "text",
        required: true,
        description: "Name of the input item property that contains the text to tokenize",
        displayOptions: { show: { resource: ["tokenize"], operation: ["tokenize"] } }
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
        description: "Controls entity extraction strategy and whether to call Privent Cloud ML",
        displayOptions: { show: { resource: ["tokenize"], operation: ["tokenize"] } }
      },
      {
        displayName: "Flag for Review Above Risk Score",
        name: "reviewThreshold",
        type: "number",
        typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
        default: 0.9,
        description: "When Privent Cloud returns a risk score at or above this value, the item is flagged with privent.flaggedForReview = true. The workflow continues \u2014 use an IF or Switch node to route flagged items.",
        displayOptions: {
          show: { resource: ["tokenize"], operation: ["tokenize"] },
          hide: { detectionMode: ["local"] }
        }
      },
      // ── detokenize ──────────────────────────────────────────────────────
      {
        displayName: "Session ID",
        name: "sessionId",
        type: "string",
        default: '={{$("Privent Session").item.json.sessionId}}',
        required: true,
        description: "Must match the session ID used by the Privent Tokenize node upstream",
        displayOptions: { show: { resource: ["detokenize"], operation: ["detokenize"] } }
      },
      {
        displayName: "Trace ID",
        name: "traceId",
        type: "string",
        default: '={{ $("Privent Session").item.json.traceId }}',
        description: "Correlation ID from the upstream Privent Session node. Links this event to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.",
        displayOptions: { show: { resource: ["detokenize"], operation: ["detokenize"] } }
      },
      {
        displayName: "Agent Name",
        name: "agentName",
        type: "string",
        default: '={{ $("Privent Session").item.json.agentName }}',
        description: "Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.",
        displayOptions: { show: { resource: ["detokenize"], operation: ["detokenize"] } }
      },
      {
        displayName: "Target Field",
        name: "targetField",
        type: "string",
        default: "*",
        description: 'Field to detokenize. Use * (default) to deep-walk and resolve tokens in the entire item JSON. Or specify a single field name (e.g. "body").',
        hint: "The * wildcard scans every nested string in the item for tokens.",
        displayOptions: { show: { resource: ["detokenize"], operation: ["detokenize"] } }
      },
      {
        displayName: "Strict Mode",
        name: "strict",
        type: "boolean",
        default: false,
        description: "When enabled, detokenization is blocked unless the destination URL matches the Trusted Sinks list. Tokens are left in place and an audit event is written. Use this to prevent accidental PII egress to untrusted systems.",
        displayOptions: { show: { resource: ["detokenize"], operation: ["detokenize"] } }
      },
      {
        displayName: "Destination URL",
        name: "sinkUrl",
        type: "string",
        default: "",
        description: "URL of the downstream sink (e.g. the HTTP Request node URL). Used to enforce the trusted sinks list in strict mode.",
        displayOptions: {
          show: { resource: ["detokenize"], operation: ["detokenize"], strict: [true] }
        },
        hint: "Supports URL prefixes \u2014 e.g. https://api.internal.corp/"
      },
      {
        displayName: "Trusted Sinks",
        name: "trustedSinks",
        type: "string",
        default: "",
        description: "Comma-separated list of URL prefixes allowed to receive detokenized data (e.g. https://api.internal.corp/,https://db.internal/). Only evaluated in strict mode.",
        displayOptions: {
          show: { resource: ["detokenize"], operation: ["detokenize"], strict: [true] }
        }
      },
      {
        displayName: "Target Agent Name (Trust Map)",
        name: "targetAgentName",
        type: "string",
        default: "",
        description: "Optional. Canonical agent name of the downstream consumer \u2014 when set, the backend Trust Map aggregator materialises this detokenize as an A\u2192B AgentInteraction edge instead of an A\u2192sink edge. Leave empty for true external sinks (the InternalAgentEndpoint registry will auto-resolve in a future release).",
        hint: "Use only when the destination URL belongs to another Privent-aware agent in the same organization.",
        displayOptions: { show: { resource: ["detokenize"], operation: ["detokenize"] } }
      },
      // ── riskCheck ───────────────────────────────────────────────────────
      {
        displayName: "Text Field",
        name: "textField",
        type: "string",
        default: "text",
        required: true,
        description: "Name of the input item property containing the text to score",
        displayOptions: { show: { resource: ["riskCheck"], operation: ["score"] } }
      },
      {
        displayName: "Trace ID",
        name: "traceId",
        type: "string",
        default: '={{ $("Privent Session").item.json.traceId }}',
        description: "Correlation ID from the upstream Privent Session node. Links this risk check to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.",
        displayOptions: { show: { resource: ["riskCheck"], operation: ["score"] } }
      },
      {
        displayName: "Agent Name",
        name: "agentName",
        type: "string",
        default: '={{ $("Privent Session").item.json.agentName }}',
        description: "Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.",
        displayOptions: { show: { resource: ["riskCheck"], operation: ["score"] } }
      },
      // ── audit ───────────────────────────────────────────────────────────
      {
        displayName: "Session ID",
        name: "sessionId",
        type: "string",
        default: '={{$("Privent Session").item.json.sessionId}}',
        required: true,
        description: "Session ID from the upstream Privent Session node",
        displayOptions: { show: { authentication: ["apiKey"], resource: ["audit"], operation: ["emit"] } }
      },
      {
        displayName: "Trace ID",
        name: "traceId",
        type: "string",
        default: '={{ $("Privent Session").item.json.traceId }}',
        description: "Correlation ID from the upstream Privent Session node. Links this event to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.",
        displayOptions: { show: { authentication: ["apiKey"], resource: ["audit"], operation: ["emit"] } }
      },
      {
        displayName: "Agent Name",
        name: "agentName",
        type: "string",
        default: '={{ $("Privent Session").item.json.agentName }}',
        description: "Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.",
        displayOptions: { show: { authentication: ["apiKey"], resource: ["audit"], operation: ["emit"] } }
      },
      {
        displayName: "Event Type",
        name: "eventType",
        type: "options",
        options: [
          { name: "LLM Call", value: "llm_call" },
          { name: "Policy Decision", value: "policy_decision" },
          { name: "Egress", value: "egress" },
          { name: "Error", value: "error" }
        ],
        default: "llm_call",
        description: "Audit event type. LLM Call triggers backend cost calculation from ModelPricing.",
        displayOptions: { show: { authentication: ["apiKey"], resource: ["audit"], operation: ["emit"] } }
      },
      {
        displayName: "LLM Model",
        name: "model",
        type: "resourceLocator",
        default: { mode: "list", value: "" },
        required: true,
        description: "Model used for this LLM call. Pick from your org's priced models (popular first) or enter a custom one as provider|model. The provider is taken from the selection.",
        displayOptions: { show: { authentication: ["apiKey"], resource: ["audit"], operation: ["emit"], eventType: ["llm_call"] } },
        modes: [
          {
            displayName: "From List",
            name: "list",
            type: "list",
            typeOptions: { searchListMethod: "searchModels", searchable: true }
          },
          {
            displayName: "By ID",
            name: "id",
            type: "string",
            placeholder: "openai|gpt-4o-mini",
            hint: "Format: provider|model"
          }
        ]
      },
      {
        displayName: "Prompt Tokens",
        name: "promptTokens",
        type: "string",
        default: "={{$json.usage.prompt_tokens}}",
        description: "n8n expression resolving to the prompt token count. Default reads OpenAI-style {usage:{prompt_tokens}} from the previous node.",
        displayOptions: { show: { authentication: ["apiKey"], resource: ["audit"], operation: ["emit"], eventType: ["llm_call"] } }
      },
      {
        displayName: "Completion Tokens",
        name: "completionTokens",
        type: "string",
        default: "={{$json.usage.completion_tokens}}",
        description: "n8n expression resolving to the completion token count",
        displayOptions: { show: { authentication: ["apiKey"], resource: ["audit"], operation: ["emit"], eventType: ["llm_call"] } }
      },
      {
        displayName: "Extra Metadata (JSON)",
        name: "extraMetadata",
        type: "json",
        default: "{}",
        description: "Optional. Merged into the audit event metadata. For event types other than LLM Call, use this to attach event-specific fields (e.g. policy decision rationale).",
        displayOptions: { show: { authentication: ["apiKey"], resource: ["audit"], operation: ["emit"] } }
      },
      // ── handoff ─────────────────────────────────────────────────────────
      {
        displayName: "Session ID",
        name: "sessionId",
        type: "string",
        default: '={{ $("Privent Session").item.json.sessionId }}',
        required: true,
        description: 'Session ID from the upstream Privent Session node \u2014 the "from" side of the handoff edge.',
        displayOptions: { show: { authentication: ["apiKey"], resource: ["handoff"], operation: ["record"] } }
      },
      {
        displayName: "Trace ID",
        name: "traceId",
        type: "string",
        default: '={{ $("Privent Session").item.json.traceId }}',
        description: "Correlation ID from the upstream Privent Session node. Leave as-is; a fresh ID is generated if no Session is upstream.",
        displayOptions: { show: { authentication: ["apiKey"], resource: ["handoff"], operation: ["record"] } }
      },
      {
        displayName: "From Agent Name",
        name: "agentName",
        type: "string",
        default: '={{ $("Privent Session").item.json.agentName }}',
        required: true,
        description: 'Canonical name of the source agent, from the upstream Privent Session node. Required \u2014 identifies the "from" side of the handoff edge.',
        displayOptions: { show: { authentication: ["apiKey"], resource: ["handoff"], operation: ["record"] } }
      },
      {
        displayName: "Target Kind",
        name: "targetKind",
        type: "options",
        options: [
          {
            name: "Agent (in-org)",
            value: "agent",
            description: "Hand off to another Privent-aware agent in the same organization"
          },
          {
            name: "External Sink",
            value: "sink",
            description: "Hand off to an external destination outside the in-org agent fleet"
          }
        ],
        default: "agent",
        displayOptions: { show: { authentication: ["apiKey"], resource: ["handoff"], operation: ["record"] } }
      },
      {
        displayName: "Target Agent Name",
        name: "toAgentName",
        type: "string",
        default: "",
        required: true,
        description: "Canonical agent name of the downstream agent. Must match the agentName the downstream PriventSession will emit.",
        hint: 'Example: "Translator", "billing-agent". Resolves to Agent.id post-ingest.',
        displayOptions: {
          show: { authentication: ["apiKey"], resource: ["handoff"], operation: ["record"], targetKind: ["agent"] }
        }
      },
      {
        displayName: "External Sink ID",
        name: "toSinkId",
        type: "string",
        default: "",
        required: true,
        description: "Opaque identifier for an external sink (e.g. webhook URL hash, partner ID).",
        displayOptions: {
          show: { authentication: ["apiKey"], resource: ["handoff"], operation: ["record"], targetKind: ["sink"] }
        }
      },
      {
        displayName: "Reason",
        name: "reason",
        type: "options",
        options: [
          { name: "Delegation", value: "delegation" },
          { name: "Subgraph Call", value: "subgraph_call" },
          { name: "Tool Invocation", value: "tool_invocation" },
          { name: "Webhook Trigger", value: "webhook_trigger" },
          { name: "Other", value: "other" }
        ],
        default: "delegation",
        description: "Categorises the handoff for the Trust Map graph filters",
        displayOptions: { show: { authentication: ["apiKey"], resource: ["handoff"], operation: ["record"] } }
      },
      {
        displayName: "Payload Token Count",
        name: "payloadTokenCount",
        type: "number",
        default: 0,
        description: "Optional. Token volume hint for blast-radius math in the Trust Map (set 0 to omit).",
        typeOptions: { minValue: 0 },
        displayOptions: { show: { authentication: ["apiKey"], resource: ["handoff"], operation: ["record"] } }
      }
    ]
  };
  methods = {
    listSearch: {
      // Powers the searchable model combobox. Hits the same backend + Bearer key
      // as audit ingest; degrades to manual `By ID` entry if the call fails.
      async searchModels(filter) {
        try {
          const { baseUrl } = await this.getCredentials("priventApi");
          const resp = await this.helpers.httpRequestWithAuthentication.call(
            this,
            "priventApi",
            {
              method: "GET",
              baseURL: baseUrl,
              url: "/v1/pricing/models",
              qs: { search: filter ?? "" },
              json: true
            }
          );
          const results = (resp.models ?? []).map((m) => ({
            name: `${m.model} (${m.provider})`,
            value: `${m.provider}|${m.model}`
          }));
          return { results };
        } catch {
          return { results: [] };
        }
      }
    }
  };
  async execute() {
    const resource = this.getNodeParameter("resource", 0);
    if (resource === "riskCheck") {
      return executeRiskCheck(this);
    }
    const handler = PER_ITEM_HANDLERS[resource];
    if (!handler) {
      return [[]];
    }
    const items = this.getInputData();
    const baseUrl = await getPriventBaseUrl(this);
    const out = [];
    for (let i = 0; i < items.length; i++) {
      try {
        const json = await handler(this, i, baseUrl);
        out.push({ json, pairedItem: { item: i } });
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
  Privent
});
//# sourceMappingURL=Privent.node.js.map
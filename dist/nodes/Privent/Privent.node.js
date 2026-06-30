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
  const v = "2.2.0";
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

// shared/local-detectors.ts
var LOCAL_DETECTORS = [
  { kind: "ADDRESS_PO_BOX", source: "\\b(P\\.?O\\.?\\s?Box\\s\\d+)\\b", flags: "gi", confidence: 0.607, category: "contact", tier: "contextual" },
  { kind: "ADDRESS_STREET", source: "\\b\\d{1,5}\\s+[A-Za-z0-9][A-Za-z0-9'\u2019.\\-]*(?:\\s+[A-Za-z0-9][A-Za-z0-9'\u2019.\\-]*){0,4}\\s+(?:Street|St\\.?|Road|Rd\\.?|Avenue|Ave\\.?|Lane|Ln\\.?|Drive|Dr\\.?|Court|Ct\\.?|Boulevard|Blvd\\.?|Way|Terrace|Ter\\.?|Place|Pl\\.?|Trail|Trl\\.?|Parkway|Pkwy\\.?|Highway|Hwy\\.)(?:\\s+(?:Apt|Unit|Suite|Ste)\\s*\\d+)?\\b", flags: "gi", confidence: 0.607, category: "contact", tier: "contextual" },
  { kind: "ADJUSTER_ID", source: "\\b(?:ADJUSTER|ADJ)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "insurance", tier: "contextual" },
  { kind: "AIR_QUALITY_PERMIT", source: "\\b(?:AIR|EMISSION)[-\\s]?PERMIT[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "AIR_WAYBILL_NUMBER", source: "\\b(?:AWB|AIR\\s?WAYBILL)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{3}[-\\s]?\\d{8})\\b", flags: "gi", confidence: 0.608, category: "logistics", tier: "contextual" },
  { kind: "AIRBNB_RESERVATION_ID", source: "\\bAIRBNB[-\\s]?(?:RESERVATION|BOOKING|CONF(?:IRMATION)?)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{9,16})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "AIRCRAFT_MODE_S", source: "\\b(?:MODE\\s?S|ICAO\\s?ADDRESS)[-\\s]?[:#]?\\s*([A-F0-9]{6})\\b", flags: "gi", confidence: 0.608, category: "aviation", tier: "contextual" },
  { kind: "AIRCRAFT_REGISTRATION", source: "\\b(?:REGISTRATION|REG|TAIL)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{1,2}-[A-Z0-9]{3,5})\\b", flags: "gi", confidence: 0.608, category: "aviation", tier: "contextual" },
  { kind: "AIRCRAFT_TAIL_NUMBER", source: "\\b(N[1-9][0-9]{0,4}[A-Z]{0,2})\\b", flags: "g", confidence: 0.608, category: "aviation", tier: "contextual" },
  { kind: "AIRLINE_BOOKING_REFERENCE", source: "\\b(?:BOOKING|RESERVATION|LOCATOR|REFERENCE)[-\\s]?(?:CODE|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6})\\b", flags: "gi", confidence: 0.608, category: "aviation", tier: "contextual" },
  { kind: "AIRLINE_PNR", source: "\\b(?:PNR|BOOKING|CONFIRMATION)[-\\s]?(?:NO|NUM|NUMBER|CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{6})\\b", flags: "gi", confidence: 0.608, category: "hospitality", tier: "contextual" },
  { kind: "ALABAMA_LICENSE_PLATE", source: "\\b(\\d{2}[A-Z]{2}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "ALASKA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "ALGORAND_ADDRESS", source: "\\b([A-Z2-7]{58})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "ALLERGY_INFO", source: "\\b(?:allergic\\s+to|allergy)[:\\s]+([A-Za-z\\s,]+(?:penicillin|peanuts|latex|aspirin|shellfish|eggs|dairy|soy|wheat))", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "ALUMNI_ID", source: "\\b(?:ALUMNI|ALUMNUS|ALUMNA)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "medium" },
  { kind: "AMAZON_TRACKING", source: "\\b(TBA\\d{12})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "AMBULANCE_CALL_ID", source: "\\b(?:AMBULANCE|AMB|EMS|PARAMEDIC)[-\\s]?(?:CALL|ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "APEX_PLAYER_ID", source: "\\b(?:APEX|EA)[-\\s]?(?:ID|PLAYER)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,16})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "APPLICATION_ID", source: "\\b(?:APPLICATION|ADMISSION|APPLICANT)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "contextual" },
  { kind: "APPOINTMENT_REF", source: "\\b(?:APT|APPT|APPOINTMENT)[-\\s]?(?:REF|ID|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,10})\\b", flags: "gi", confidence: 0.607, category: "healthcare", tier: "medium" },
  { kind: "APPRAISAL_REFERENCE", source: "\\b(?:APPRAISAL|APPR)[-\\s]?(?:NO|NUM|NUMBER|REF|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "real-estate", tier: "contextual" },
  { kind: "ARAMEX_TRACKING", source: "\\b(?:ARAMEX[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{11,12})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "ARGENTINA_CUIT", source: "\\b(\\d{2}-\\d{8}-\\d{1})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ARGENTINA_DNI", source: "\\b(\\d{7,8})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ARIZONA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "ARKANSAS_LICENSE_PLATE", source: "\\b(\\d{3}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "ARTICLE_ID", source: "\\b(?:ARTICLE|STORY)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.407, category: "media", tier: "contextual" },
  { kind: "AUSTRALIA_POST_TRACKING", source: "\\b(?:AUSTRALIA\\s?POST[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}\\d{9}AU)\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "AUSTRALIAN_LICENSE_PLATE", source: "\\b([A-Z]{2,3}[-\\s]?\\d{2,4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "AUSTRALIAN_MEDICARE", source: "\\b([2-6]\\d{3}\\s?\\d{5}\\s?\\d)\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "AUSTRALIAN_TFN", source: "\\b(\\d{3}\\s?\\d{3}\\s?\\d{3})\\b", flags: "g", confidence: 0.859, category: "government", tier: "high", validatorName: "validateAustralianTFN" },
  { kind: "AVALANCHE_ADDRESS", source: "\\b([XPC][-\\s\\u00A0]?(?:avax)?[a-z0-9]{38,43})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "AWS_ACCESS_KEY", source: "\\b(AKIA[0-9A-Z]{16})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "AWS_ARN", source: "\\b(arn:aws:[a-z0-9\\-]+:[a-z0-9\\-]*:[0-9]{12}:[a-zA-Z0-9\\/\\-_:]+)\\b", flags: "g", confidence: 0.607, category: "technology", tier: "contextual" },
  { kind: "AWS_CERTIFICATION", source: "\\bAWS[-\\s]?(?:CERT(?:IFICATION)?|ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.408, category: "professional-certifications", tier: "contextual" },
  { kind: "AWS_SECRET_KEY", source: "(?:aws.{0,20})?(?:secret.{0,20})?([a-zA-Z0-9/+=]{40})", flags: "gi", confidence: 0.86, category: "technology", tier: "contextual" },
  { kind: "AZURE_RESOURCE_ID", source: "\\/subscriptions\\/[a-f0-9\\-]{36}\\/resourceGroups\\/[a-zA-Z0-9\\-_]+\\/providers\\/[a-zA-Z0-9\\.\\-_\\/]+", flags: "gi", confidence: 0.607, category: "technology", tier: "contextual" },
  { kind: "AZURE_STORAGE_KEY", source: "\\b(?:DefaultEndpointsProtocol|AccountKey)=([a-zA-Z0-9+/=]{88})", flags: "g", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "BACKGROUND_CHECK_ID", source: "\\b(?:BACKGROUND[-\\s]?CHECK|BGC|SCREENING)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "medium" },
  { kind: "BAHRAIN_CPR", source: "\\b(\\d{9})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "BANK_ACCOUNT_UK", source: "\\b(?:account|acc|a\\/c)[:\\s#-]*((?:\\d{4}[\\s\\u00A0-]?\\d{4})|(?:\\d{2}[\\s\\u00A0-]?\\d{2}[\\s\\u00A0-]?\\d{4}))\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "BANKRUPTCY_CASE", source: "\\b(?:BK|BANKRUPTCY)[-\\s]?(?:NO|NUM(?:BER)?|CASE)?[-\\s]?[:#]?\\s*(\\d{2}[-]?\\d{5}[-]?[A-Z]{0,3})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "BAR_NUMBER", source: "\\b(?:BAR|ATTORNEY|LAWYER)[-\\s]?(?:NO|NUM(?:BER)?|REG(?:ISTRATION)?|LIC(?:ENSE)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{5,12})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "BATCH_LOT_NUMBER", source: "\\b(?:BATCH|LOT)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.607, category: "manufacturing", tier: "contextual" },
  { kind: "BATTLETAG", source: "\\b([a-zA-Z][a-zA-Z0-9]{2,11}#\\d{4,5})\\b", flags: "g", confidence: 0.608, category: "gaming", tier: "contextual" },
  { kind: "BEARER_TOKEN", source: "\\bBearer\\s+([a-zA-Z0-9_\\-\\.]{20,})", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "BENEFICIARY_ID", source: "\\b(?:BENEFICIARY|BENEF|BEN|B)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.859, category: "charitable", tier: "contextual" },
  { kind: "BENEFITS_PLAN_NUMBER", source: "\\b(?:BENEFITS?|INSURANCE|HEALTH[-\\s\\u00A0]?PLAN)[-\\s\\u00A0]*(?:PLAN)?[-\\s\\u00A0]*(?:NO|NUM(?:BER)?|ID)?[-\\s\\u00A0.:#]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0./-]?){5,15}[A-Z0-9])\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "BILL_OF_LADING", source: "\\b(?:BOL|B\\/L|BILL\\s?OF\\s?LADING)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.608, category: "logistics", tier: "contextual" },
  { kind: "BINANCE_CHAIN_ADDRESS", source: "\\b(0x[a-fA-F0-9]{40})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "BIOBANK_SAMPLE_ID", source: "\\b(?:BIOBANK|SAMPLE|SPECIMEN)[-\\s]?(?:ID|NO)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,15})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "BIOMETRIC_ID", source: "\\b(?:FINGERPRINT|RETINAL?[-\\s\\u00A0]?SCAN|IRIS[-\\s\\u00A0]?SCAN|VOICE[-\\s\\u00A0]?PRINT|FACIAL[-\\s\\u00A0]?RECOGNITION|BIOMETRIC)[-\\s\\u00A0]?(?:ID|DATA|TEMPLATE|HASH)?[-\\s\\u00A0.:#]*([A-Z0-9][A-Z0-9._-]{7,39})\\b", flags: "gi", confidence: 0.859, category: "healthcare", tier: "contextual" },
  { kind: "BITCOIN_ADDRESS", source: "\\b([13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "BLANKET_ORDER", source: "\\b(?:BLANKET|BO|Blanket\\s+Order)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "medium" },
  { kind: "BLOOD_TYPE", source: "\\b(?:blood\\s+type|blood\\s+group)[:\\s]+(A|B|AB|O)[+-]?\\b", flags: "gi", confidence: 0.608, category: "healthcare", tier: "medium" },
  { kind: "BOM_NUMBER", source: "\\bBOM[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "manufacturing", tier: "contextual" },
  { kind: "BOOKING_NUMBER", source: "\\b(?:BOOKING|RESERVATION|RES)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "transportation", tier: "contextual" },
  { kind: "BORDER_CROSSING_CARD", source: "\\b(?:BCC|BORDER\\s+CROSSING)[:\\s#-]*([A-Z0-9](?:[A-Z0-9\\s\\u00A0.-]?){8,13}[A-Z0-9])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "BRAZILIAN_CNPJ", source: "\\b(\\d{2}\\.?\\d{3}\\.?\\d{3}\\/?\\d{4}-?\\d{2})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "BRAZILIAN_CPF", source: "\\b(\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "BROADBAND_SERVICE_ID", source: "\\b(?:BROADBAND|INTERNET|ISP)[-\\s]?(?:SERVICE)?[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.858, category: "telecoms", tier: "contextual" },
  { kind: "BSB_AU", source: "\\b(?:BSB)[:\\s\\u00A0]*(\\d{3}[\\s\\u00A0-]?\\d{3})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "BULGARIAN_PERSONAL_NUMBER", source: "\\b(\\d{10})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "CALIFORNIA_LICENSE_PLATE", source: "\\b(\\d[A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "CAMPAIGN_CODE", source: "\\b(?:CAMPAIGN|CAMP|FC)[-_]?[A-Z0-9]{4,12}\\b", flags: "gi", confidence: 0.406, category: "charitable", tier: "medium" },
  { kind: "CANADA_POST_TRACKING", source: "\\b(?:CANADA\\s?POST[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{16})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "CANADIAN_LICENSE_PLATE", source: "\\b([A-Z]{3,4}[-\\s]?\\d{3,4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "CANADIAN_SIN", source: "\\b(\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{3})\\b", flags: "g", confidence: 0.859, category: "government", tier: "high", validatorName: "validateCanadianSIN" },
  { kind: "CARD_AUTH_CODE", source: "\\b(?:AUTH(?:ORIZATION)?|APPROVAL)[-\\s]?(?:CODE|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "CARD_EXPIRY", source: "\\b(?:EXP(?:IRY|IRATION)?|VALID\\s+THRU)[:\\s]+(\\d{2}[\\/\\-]\\d{2,4}|\\d{4})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "CARD_TRACK1_DATA", source: "%B\\d{13,19}\\^[^^]+\\^\\d{4}\\d{3}[^?]+\\?", flags: "g", confidence: 0.859, category: "financial", tier: "medium" },
  { kind: "CARD_TRACK2_DATA", source: ";\\d{13,19}=\\d{4}\\d{3}[^?]+\\?", flags: "g", confidence: 0.859, category: "financial", tier: "medium" },
  { kind: "CARDANO_ADDRESS", source: "\\b(addr1[a-z0-9]{58,104})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "CART_SESSION_ID", source: "\\b(?:CART|SESSION)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([a-f0-9]{32,64})\\b", flags: "gi", confidence: 0.407, category: "retail", tier: "contextual" },
  { kind: "CASE_NUMBER", source: "\\b(?:CASE|DOCKET|FILE)[-\\s]?(?:NO|NUM(?:BER)?|REF)?[-\\s]?[:#]?\\s*([A-Z]{1,3}[-]?\\d{2,4}[-]?[A-Z]{0,3}[-]?\\d{4,8})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "CATALOG_NUMBER", source: "\\b(?:CATALOG|CAT|PART|PN)[-#]?[A-Z0-9]{6,15}\\b", flags: "gi", confidence: 0.406, category: "procurement", tier: "contextual" },
  { kind: "CHEQUE_NUMBER", source: "\\b(?:CHE(?:QUE|CK))[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{6,10})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "contextual" },
  { kind: "CHI_NUMBER", source: "\\b(?:CHI|community health index)[-\\s]?(?:number|no)?[-\\s]?[:#]?\\s*(\\d{6}[-\\s]?\\d{4})\\b", flags: "gi", confidence: 0.859, category: "healthcare", tier: "contextual" },
  { kind: "CHILE_RUT", source: "\\b(\\d{1,2}\\.\\d{3}\\.\\d{3}-[\\dKk])\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "CHINA_POST_TRACKING", source: "\\b(?:CHINA\\s?POST[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([RC][A-Z]\\d{9}CN)\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "CISCO_CERTIFICATION", source: "\\b(?:CISCO|CSCO)[-\\s]?(?:CERT(?:IFICATION)?|ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.408, category: "professional-certifications", tier: "contextual" },
  { kind: "CLABE", source: "\\b\\d{18}\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "CLAIM_ID", source: "\\bCLAIM[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{8,12})\\b", flags: "gi", confidence: 0.859, category: "insurance", tier: "contextual" },
  { kind: "CLIENT_ID", source: "\\b(?:CLIENT)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.859, category: "legal", tier: "contextual" },
  { kind: "COD_PLAYER_ID", source: "\\b([a-zA-Z0-9_]{3,16})#(\\d{7})\\b", flags: "g", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "COLOMBIA_CEDULA", source: "\\b(?:CC|C\xC9DULA|CEDULA)[-\\s]?(?:NO|NUM)?[-\\s]?[:#]?\\s*(\\d{6,10})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "COLOMBIA_NIT", source: "\\bNIT[-\\s]?(?:NO|NUM)?[-\\s]?[:#]?\\s*(\\d{9}-\\d{1})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "COLORADO_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "COMPANY_NUMBER_UK", source: "\\b(?:company number|reg(?:\\.|istration)?\\s+no(?:\\.)?)[:\\s#]*([A-Z]{2}\\d{6}|\\d{8})\\b", flags: "gi", confidence: 0.409, category: "government", tier: "contextual" },
  { kind: "COMPTIA_CERTIFICATION", source: "\\bCOMPTIA[-\\s]?(?:CERT(?:IFICATION)?|ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.408, category: "professional-certifications", tier: "contextual" },
  { kind: "CONNECTICUT_LICENSE_PLATE", source: "\\b(\\d{3}[A-Z]{3}|[A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "CONTAINER_NUMBER", source: "\\b(?:CONTAINER|CNTR)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{4}\\d{7})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "contextual" },
  { kind: "CONTRACT_REFERENCE", source: "\\bCNTR[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{8})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "CONTRACT_REFERENCE_2", source: "\\b(?:CONTRACT|CON|C)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.608, category: "procurement", tier: "contextual" },
  { kind: "CONTRIBUTOR_ID", source: "\\b(?:CONTRIBUTOR|FREELANCER|WRITER)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "media", tier: "contextual" },
  { kind: "COOKIE_SESSION", source: "\\b(?:set-cookie|cookie):\\s*(?:session|sessid|sid|auth)=([a-zA-Z0-9_\\-\\.]{20,})", flags: "gi", confidence: 0.608, category: "technology", tier: "medium" },
  { kind: "COPYRIGHT_REG", source: "\\b(?:COPYRIGHT|\xA9)[-\\s]?(?:REG(?:ISTRATION)?)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{2,3}\\d{6,10})\\b", flags: "gi", confidence: 0.607, category: "media", tier: "contextual" },
  { kind: "COSMOS_ADDRESS", source: "\\b(cosmos1[a-z0-9]{38,44})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "COURSE_CODE", source: "\\b([A-Z]{2,4}\\s?\\d{3,4}[A-Z]?)\\b", flags: "g", confidence: 0.406, category: "education", tier: "contextual" },
  { kind: "COURT_REPORTER_LICENSE", source: "\\b(?:COURT[-\\s]?REPORTER|CSR|RPR)[-\\s]?(?:LIC(?:ENSE)?|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{2,3}[-]?\\d{4,8})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "medium" },
  { kind: "CPA_LICENSE", source: "\\bCPA[-\\s]?(?:LICENSE|LIC|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{5,10})\\b", flags: "gi", confidence: 0.608, category: "professional-certifications", tier: "contextual" },
  { kind: "CPT_CODE", source: "\\b(?:CPT[-\\s]?(?:CODE)?[-\\s]?[:#]?\\s*)?([0-9]{5})\\b", flags: "g", confidence: 0.607, category: "healthcare", tier: "contextual" },
  { kind: "CRUISE_BOOKING_NUMBER", source: "\\b(?:CRUISE|BOOKING|RESERVATION)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hospitality", tier: "contextual" },
  { kind: "CRYPTO_TX_HASH", source: "\\b(?:TX|TXID|TRANSACTION[-\\s]?HASH)[:\\s]+([a-fA-F0-9]{64})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "CSGO_FRIEND_CODE", source: "\\b(?:CS:?GO|COUNTER[- ]?STRIKE)[-\\s]?(?:FRIEND[- ]?CODE|CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{5}-[A-Z0-9]{5})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "CUSIP", source: "\\b[A-Z0-9]{9}\\b", flags: "g", confidence: 0.608, category: "financial", tier: "contextual" },
  { kind: "CUSTOMER_ID", source: "\\b(?:CUSTOMER|CUST)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "retail", tier: "contextual" },
  { kind: "CVV", source: "\\b(?:CVV|CVC|CSC|CVN)[:\\s\\u00A0]*(\\d{3,4})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "CVV_CODE", source: "\\b(?:CVV|CVC|CVV2|CID|CSC)[:\\s]+(\\d{3,4})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "CZECH_NATIONAL_ID", source: "\\b(\\d{6}\\/\\d{4})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "DATABASE_CONNECTION", source: "(?:postgres|mysql|mongodb|redis|sqlite):\\/\\/[^\\s:]+:[^\\s@]+@[^\\s]+", flags: "gi", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "DATE", source: "\\b((?:\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{2,4})|(?:\\d{1,2}\\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\s+\\d{2,4}))\\b", flags: "gi", confidence: 0.606, category: "personal", tier: "contextual" },
  { kind: "DATE_OF_BIRTH", source: "\\b(?:DOB|date of birth|birth ?date)[:\\s-]*((?:\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{2,4})|(?:\\d{1,2}\\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\s+\\d{2,4}))\\b", flags: "gi", confidence: 0.859, category: "personal", tier: "contextual" },
  { kind: "DD_MANDATE", source: "\\b(?:DD|DIRECT[-\\s]?DEBIT)[-\\s]?(?:MANDATE|REF(?:ERENCE)?|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,18})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "medium" },
  { kind: "DEA_NUMBER", source: "\\b(?:DEA[-\\s\\u00A0]*(?:NO|NUM(?:BER)?)?[-\\s\\u00A0.:#]*)?([A-Z]{2}(?:[\\s\\u00A0.-]?\\d){7})\\b", flags: "gi", confidence: 0.859, category: "healthcare", tier: "contextual" },
  { kind: "DEGREE_NUMBER", source: "\\b(?:DEGREE|DIPLOMA|CERTIFICATE)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "contextual" },
  { kind: "DELAWARE_LICENSE_PLATE", source: "\\b(\\d{6})\\b", flags: "g", confidence: 0.607, category: "vehicles", tier: "contextual" },
  { kind: "DEPARTMENT_CODE", source: "\\b(?:DEPT|DEPARTMENT)[-\\s]?(?:CODE)?[-\\s]?[:#]?\\s*([A-Z]{3,6})\\b", flags: "g", confidence: 0.406, category: "education", tier: "contextual" },
  { kind: "DEPOSITION_REF", source: "\\b(?:DEPOSITION|DEPO|DEP)[-\\s]?(?:NO|NUM(?:BER)?|REF|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "contextual" },
  { kind: "DEVICE_ID_TAG", source: "\\bDEVID:([A-F0-9]{16})\\b", flags: "gi", confidence: 0.607, category: "retail", tier: "medium" },
  { kind: "DEVICE_UUID", source: "\\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\\b", flags: "gi", confidence: 0.607, category: "network", tier: "contextual" },
  { kind: "DHL_TRACKING", source: "\\b(?:DHL[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{10,11})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "DIRECT_DEPOSIT_REF", source: "\\b(?:DIRECT[-\\s]?DEPOSIT|DD|ROUTING)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*(\\d{9})\\b", flags: "g", confidence: 0.859, category: "hr", tier: "contextual" },
  { kind: "DISASTER_VICTIM_ID", source: "\\b(?:DVI|VICTIM)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*(\\d{4}[-\\s]?\\d{4,8})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "DISCIPLINARY_ACTION_ID", source: "\\b(?:DISCIPLINARY|INCIDENT|WARNING|VIOLATION)[-\\s\\u00A0]*(?:ACTION)?[-\\s\\u00A0]*(?:NO|NUM(?:BER)?|ID)?[-\\s\\u00A0.:#]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0./-]?){5,15}[A-Z0-9])\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "DISCORD_USER_ID", source: "\\b(\\d{17,19})\\b", flags: "g", confidence: 0.608, category: "gaming", tier: "contextual" },
  { kind: "DISCOVERY_NUMBER", source: "\\b(?:DISCOVERY|INTERROGATORY|REQUEST|RFP|RFA)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{1,4}[-]?\\d{1,4})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "medium" },
  { kind: "DISPATCHER_ID", source: "\\b(?:DISPATCHER|DISP)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{3,8})\\b", flags: "gi", confidence: 0.608, category: "emergency", tier: "contextual" },
  { kind: "DNA_SEQUENCE", source: "\\b([ATCG]{20,})\\b", flags: "g", confidence: 0.859, category: "healthcare", tier: "contextual" },
  { kind: "DOCKER_AUTH", source: '\\{[^}]*"auth"\\s*:\\s*"([A-Za-z0-9+/=]{20,})"[^}]*\\}', flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "DONATION_REFERENCE", source: "\\b(?:DONATION|DN|GIFT|CONTRIB)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.608, category: "charitable", tier: "medium" },
  { kind: "DONOR_ID", source: "\\b(?:DONOR|DON|D)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.858, category: "charitable", tier: "contextual" },
  { kind: "DOORDASH_ORDER_ID", source: "\\b(?:DOORDASH|DD)[-\\s]?(?:ORDER|DELIVERY)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "DOTA_FRIEND_ID", source: "\\bDOTA[-\\s]?(?:ID|FRIEND)?[-\\s]?[:#]?\\s*(\\d{9,10})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "DRIVER_ID", source: "\\bDRIVER[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "transportation", tier: "contextual" },
  { kind: "DRIVING_LICENSE_UK", source: "\\b(?:DL|DRIVING|DRIVER(?:'S)?|LICEN[SC]E)?[\\s\\u00A0#:-]*(?:NO|NUM(?:BER)?|ID)?[\\s\\u00A0#:-]*([A-Z]{5}[\\s\\u00A0.-]?\\d{2}[\\s\\u00A0.-]?\\d{2}[\\s\\u00A0.-]?\\d{2}[\\s\\u00A0.-]?[A-Z]{2}[\\s\\u00A0.-]?\\d[\\s\\u00A0.-]?[A-Z]{2})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "DRIVING_LICENSE_US", source: "\\b(?:DL|driver(?:'s)?\\slicense)[:\\s\\u00A0#-]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0.-]?){3,18}[A-Z0-9])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "DRUG_DOSAGE", source: "\\b([A-Z][a-z]+(?:ine|ol|azole|mycin|cillin|pril|olol|mab|pam|tab|pine|done|ide|tide|ase|statin))\\s+(\\d+(?:\\.\\d+)?)\\s?(mg|mcg|g|ml|units?|IU)\\b", flags: "gi", confidence: 0.607, category: "healthcare", tier: "contextual" },
  { kind: "DRUG_TEST_ID", source: "\\b(?:DRUG[-\\s]?TEST|SCREENING|URINALYSIS)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "DUTCH_BSN", source: "\\b(\\d{9})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ECUADOR_CEDULA", source: "\\b(\\d{10})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "EDITORIAL_TICKET", source: "\\b(?:EDITORIAL|EDIT)[-\\s]?(?:TICKET|TASK)?[-\\s]?(?:ID|NO)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.407, category: "media", tier: "contextual" },
  { kind: "EGYPT_NATIONAL_ID", source: "\\b([12]\\d{13})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "EHIC_NUMBER", source: "\\b(?:EHIC|european health insurance|health card)[-\\s]?(?:number|no)?[-\\s]?[:#]?\\s*([A-Z]{2}\\s?\\d{12,16})\\b", flags: "gi", confidence: 0.859, category: "healthcare", tier: "contextual" },
  { kind: "EMERGENCY_CALL_REF", source: "\\b(?:EMERGENCY|INCIDENT|CALL|CAD|DISPATCH|EVENT)[-\\s]?(?:REF|NO|NUM|NUMBER|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "EMERGENCY_CONTACT", source: "(?:emergency\\s+contact|next\\s+of\\s+kin|ice|in\\s+case\\s+of\\s+emergency)[:\\s]+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,3})", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "EMERGENCY_CONTACT_REF", source: "\\b(?:EMERGENCY[-\\s]?CONTACT|ICE)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "EMERGENCY_MEDICAL_INCIDENT", source: "\\b(?:MEDICAL|MED|MI)[-\\s]?(?:INCIDENT|INC|EMERGENCY|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "EMERGENCY_SHELTER_ID", source: "\\b(?:SHELTER|EVACUATION|REFUGE)[-\\s]?(?:REG|ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{5,12})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "EMPLOYEE_ID", source: "\\b(?:EMP|EMPL|EMPLOYEE)[_\\s-]?(?:ID|NUM(?:BER)?)?[:\\s-]*([A-Z0-9]{4,10})\\b", flags: "gi", confidence: 0.609, category: "personal", tier: "medium" },
  { kind: "EMPLOYEE_ID_2", source: "\\b(?:EMPLOYEE|EMP|STAFF|PERSONNEL|WORKER)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{0,2}\\d{4,10})\\b", flags: "gi", confidence: 0.859, category: "hr", tier: "medium" },
  { kind: "ENROLLMENT_NUMBER", source: "\\b(?:ENROLLMENT|REGISTRATION)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "medium" },
  { kind: "ENVIRONMENTAL_CERTIFICATE", source: "\\bENVIRONMENTAL[-\\s]?(?:CERT(?:IFICATE)?|COMPLIANCE)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "EPA_ID_NUMBER", source: "\\bEPA[-\\s]?(?:ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}[A-Z0-9]{9})\\b", flags: "gi", confidence: 0.608, category: "environmental", tier: "contextual" },
  { kind: "EPIC_GAMES_ID", source: "\\b([a-f0-9]{32})\\b", flags: "gi", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "EQUIPMENT_SERIAL", source: "\\b(?:EQUIPMENT|DEVICE|ROUTER|MODEM)[-\\s]?(?:SERIAL)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,16})\\b", flags: "gi", confidence: 0.607, category: "telecoms", tier: "contextual" },
  { kind: "ESCROW_NUMBER", source: "\\bESCROW[-\\s]?(?:NO|NUM|NUMBER|ACCOUNT|ACCT|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "real-estate", tier: "contextual" },
  { kind: "ESPORTS_PLAYER_ID", source: "\\b(?:PLAYER|COMPETITOR|PARTICIPANT)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "ETHEREUM_ADDRESS", source: "\\b(0x[a-fA-F0-9]{40})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "EXAM_ID", source: "\\b(?:EXAM|TEST|QUIZ|ASSESSMENT)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "contextual" },
  { kind: "EXAM_REGISTRATION_NUMBER", source: "\\bEXAM[-\\s]?(\\d{4}[-]\\d{4})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "medium" },
  { kind: "EXHIBIT_NUMBER", source: "\\bEXHIBIT[-\\s]?([A-Z]{1,2}[-]?\\d{1,4})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "contextual" },
  { kind: "EXIT_INTERVIEW_ID", source: "\\b(?:EXIT|TERMINATION|SEPARATION)[-\\s]?(?:INTERVIEW)?[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "EXPENSE_REPORT_NUMBER", source: "\\b(?:EXPENSE|REIMBURSEMENT)[-\\s]?(?:REPORT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "contextual" },
  { kind: "FAA_AIRMAN_CERTIFICATE", source: "\\b(?:FAA|AIRMAN|PILOT)[-\\s]?(?:CERT(?:IFICATE)?|LICENSE)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{7,8})\\b", flags: "gi", confidence: 0.608, category: "aviation", tier: "contextual" },
  { kind: "FACEBOOK_ID", source: "\\b(\\d{15,17})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "FACILITY_ID", source: "\\bFACILITY[-\\s]?ID[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "FACULTY_ID", source: "\\b(?:FACULTY|TEACHER|INSTRUCTOR|PROFESSOR|STAFF)[-\\s]?(?:ID|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{1,2}\\d{6,10})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "contextual" },
  { kind: "FEDEX_TRACKING", source: "\\b(?:FEDEX|FDX)[-\\s]?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{12}|\\d{15}|\\d{20})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "FIJI_NATIONAL_ID", source: "\\b(?:FIJI|FJ)[-\\s]?(?:ID|NATIONAL\\s?ID)[-\\s]?[:#]?\\s*([A-Z0-9]{8,10})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "FINANCIAL_AID_ID", source: "\\b(?:FINANCIAL[-\\s]?AID|FAFSA|AID[-\\s]?APPLICATION)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.859, category: "education", tier: "medium" },
  { kind: "FINRA_LICENSE", source: "\\b(?:CRD|SERIES|FINRA)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{6,8})\\b", flags: "gi", confidence: 0.858, category: "professional-certifications", tier: "contextual" },
  { kind: "FIRE_INCIDENT_NUMBER", source: "\\b(?:FIRE|FI|FD)[-\\s\\u00A0]*(?:INCIDENT|INC|NO|NUM|NUMBER|ID)?[-\\s\\u00A0.:#]*((?:[A-Z]{2,4}[\\s\\u00A0./-]?\\d{2,4}[\\s\\u00A0./-]?\\d{4,10})|\\d{4}[\\s\\u00A0./-]?\\d{4,8})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "FIREBASE_API_KEY", source: "\\b(AIza[0-9A-Za-z\\-_]{35})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "FIREFIGHTER_BADGE", source: "\\b(?:BADGE|FF|FIREFIGHTER)[-\\s]?(?:NO|NUM|NUMBER|ID)?[-\\s]?[:#]?\\s*(\\d{3,6})\\b", flags: "gi", confidence: 0.608, category: "emergency", tier: "contextual" },
  { kind: "FIVERR_ORDER_ID", source: "\\bFIVERR[-\\s]?(?:ORDER|GIG)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.607, category: "gig-economy", tier: "contextual" },
  { kind: "FLEET_VEHICLE_ID", source: "\\b(?:FLEET|VEHICLE)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "transportation", tier: "contextual" },
  { kind: "FLIGHT_NUMBER", source: "\\b(?:FLIGHT|FLT)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2,3}\\s?\\d{1,4})\\b", flags: "gi", confidence: 0.408, category: "aviation", tier: "contextual" },
  { kind: "FLORIDA_LICENSE_PLATE", source: "\\b([A-Z]{3,4}\\s[A-Z]?\\d{2})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "FORTNITE_ACCOUNT_ID", source: "\\b(?:FORTNITE|FN)[-\\s]?(?:ACCOUNT|USER|ID)?[-\\s]?[:#]?\\s*([a-f0-9]{32})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "FRAMEWORK_AGREEMENT", source: "\\b(?:FRAMEWORK|FWK|FA)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "contextual" },
  { kind: "FRENCH_LICENSE_PLATE", source: "\\b([A-Z]{2}-\\d{3}-[A-Z]{2})\\b", flags: "gi", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "FRENCH_SOCIAL_SECURITY", source: "\\b([12]\\s?\\d{2}\\s?\\d{2}\\s?\\d{2}\\s?\\d{3}\\s?\\d{3}\\s?\\d{2})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "FREQUENT_FLYER_NUMBER", source: "\\b(?:FREQUENT[- ]?FLYER|FF|MILEAGE|LOYALTY)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hospitality", tier: "contextual" },
  { kind: "GCP_SERVICE_ACCOUNT", source: '\\{[^}]*"type"\\s*:\\s*"service_account"[^}]*"private_key_id"\\s*:\\s*"([a-z0-9]{40})"[^}]*\\}', flags: "gi", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "GENERIC_API_KEY", source: "\\b(?:api.{0,5}key|apikey|api.token)[:\\s=]+([a-zA-Z0-9_\\-]{20,})\\b", flags: "gi", confidence: 0.858, category: "technology", tier: "contextual" },
  { kind: "GENERIC_SECRET", source: "\\b(?:password|passwd|pwd|secret)[:\\s=]+([a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>?]{8,})\\b", flags: "gi", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "GENERIC_TRACKING_NUMBER", source: "\\b(?:TRACK(?:ING)?|SHIPMENT|PACKAGE)[-\\s]?(?:ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,25})\\b", flags: "gi", confidence: 0.407, category: "logistics", tier: "contextual" },
  { kind: "GENETIC_MARKER", source: "\\b(rs\\d{6,10})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "GEORGIA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "GERMAN_LICENSE_PLATE", source: "\\b([A-Z\xC4\xD6\xDC]{1,3}[-\\s][A-Z\xC4\xD6\xDC]{1,2}\\s?\\d{1,4})\\b", flags: "gi", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "GERMAN_TAX_ID", source: "\\b(\\d{11})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "GHANA_CARD", source: "\\b(GHA-\\d{9}-\\d)\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "GIFT_AID_REFERENCE", source: "\\b(?:GIFT\\s*AID|GA)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.608, category: "charitable", tier: "contextual" },
  { kind: "GIFT_CARD_NUMBER", source: "\\b(?:GIFT[-\\s]?CARD|GC)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{12,19})\\b", flags: "gi", confidence: 0.858, category: "retail", tier: "contextual" },
  { kind: "GIG_PLATFORM_ORDER_ID", source: "\\b(?:ORDER|TRIP|DELIVERY|BOOKING)[-\\s]?[:#]\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.606, category: "gig-economy", tier: "contextual" },
  { kind: "GIG_PLATFORM_USER_ID", source: "\\b(?:DRIVER|DASHER|SHOPPER|TASKER|COURIER|RIDER)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.607, category: "gig-economy", tier: "contextual" },
  { kind: "GITHUB_TOKEN", source: "\\b(gh[pousr]_[A-Za-z0-9]{36,})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "GLOBAL_ENTRY_NUMBER", source: "\\b(?:GLOBAL[- ]?ENTRY|PASS[- ]?ID)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{9})\\b", flags: "gi", confidence: 0.608, category: "hospitality", tier: "contextual" },
  { kind: "GLS_TRACKING", source: "\\b(?:GLS[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{11,13})\\b", flags: "gi", confidence: 0.408, category: "logistics", tier: "contextual" },
  { kind: "GOODS_RECEIPT", source: "\\b(?:GRN|Goods\\s+Receipt)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.407, category: "procurement", tier: "medium" },
  { kind: "GOOGLE_API_KEY", source: "\\b(AIza[0-9A-Za-z\\-_]{35})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "GRADE_REFERENCE", source: "\\b(?:GPA|GRADE[-\\s]?POINT[-\\s]?AVERAGE)[-\\s]?[:#]?\\s*((?:[0-4]\\.\\d{1,2})|(?:\\d\\.\\d{2}))\\b", flags: "gi", confidence: 0.858, category: "education", tier: "medium" },
  { kind: "GRADUATION_YEAR", source: "\\b(?:CLASS[-\\s]?OF|GRADUATING[-\\s]?CLASS|GRAD(?:UATION)?[-\\s]?YEAR)[-\\s]?[:#]?\\s*(['']?\\d{2}|[12]\\d{3})\\b", flags: "gi", confidence: 0.407, category: "education", tier: "medium" },
  { kind: "GRANT_REFERENCE", source: "\\b(?:GRANT|GR|G)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.607, category: "charitable", tier: "contextual" },
  { kind: "GRUBHUB_ORDER_ID", source: "\\bGRUBHUB[-\\s]?(?:ORDER)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "HAWAII_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "HAZARDOUS_WASTE_MANIFEST", source: "\\b(?:MANIFEST|WASTE)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{9})\\b", flags: "gi", confidence: 0.608, category: "environmental", tier: "contextual" },
  { kind: "HAZMAT_INCIDENT", source: "\\b(?:HAZMAT|HM)[-\\s]?(?:INCIDENT|INC|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "HEALTH_INSURANCE_CLAIM", source: "\\b(?:CLAIM|CLM)[-\\s]?(?:NO|NUM(?:BER)?|REF|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "HEALTH_PLAN_NUMBER", source: "\\b(?:HEALTH[-\\s]?PLAN|BENEFICIARY|MEMBER)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,15})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "HEROKU_API_KEY", source: "\\b([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\\b", flags: "g", confidence: 0.858, category: "technology", tier: "contextual" },
  { kind: "HOA_ACCOUNT_NUMBER", source: "\\bHOA[-\\s]?(?:ACCOUNT|ACCT|NO|NUMBER|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "real-estate", tier: "contextual" },
  { kind: "HOSPITAL_ACCOUNT", source: "\\b(?:HOSPITAL|H|HAR)[-\\s]?(?:ACCOUNT|ACCT|A\\/C)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "HOTEL_LOYALTY_NUMBER", source: "\\b(?:MEMBER|LOYALTY|REWARDS)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hospitality", tier: "contextual" },
  { kind: "HOTEL_RESERVATION", source: "\\b(?:HOTEL|RESERVATION|CONF(?:IRMATION)?|BOOKING)[-\\s]?(?:NO|NUM|NUMBER|CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.608, category: "hospitality", tier: "contextual" },
  { kind: "HOUSING_ASSIGNMENT", source: "\\b(?:DORM|ROOM|HOUSING)[-\\s]?(?:NO|NUM(?:BER)?|ASSIGNMENT)?[-\\s]?[:#]?\\s*([A-Z0-9]{4,10})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "contextual" },
  { kind: "HUNGARIAN_PERSONAL_ID", source: "\\b(\\d{6}[A-Z]{2})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "HUNGARIAN_TAX_ID", source: "\\b(\\d{10})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "IATA_AIRLINE_CODE", source: "\\b(?:AIRLINE|CARRIER)[-\\s]?(?:CODE|IATA)?[-\\s]?[:#]?\\s*([A-Z]{2})\\b", flags: "gi", confidence: 0.407, category: "aviation", tier: "contextual" },
  { kind: "IATA_AIRPORT_CODE", source: "\\b(?:AIRPORT|FROM|TO|VIA|IATA)[-\\s]?(?:CODE)?[-\\s]?[:#]?\\s*([A-Z]{3})\\b", flags: "gi", confidence: 0.408, category: "aviation", tier: "contextual" },
  { kind: "ICAO_AIRCRAFT_TYPE", source: "\\b(?:AIRCRAFT|TYPE|ICAO)[-\\s]?(?:CODE|DESIGNATOR)?[-\\s]?[:#]?\\s*([A-Z][0-9][A-Z0-9]{1,2})\\b", flags: "gi", confidence: 0.407, category: "aviation", tier: "contextual" },
  { kind: "ICD10_CODE", source: "\\b([A-Z]\\d{2}(?:\\.\\d{1,2})?)\\b", flags: "g", confidence: 0.607, category: "healthcare", tier: "contextual" },
  { kind: "IDAHO_LICENSE_PLATE", source: "\\b(\\d[A-Z]\\d{5})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "IFSC", source: "\\b([A-Z]{4})[-\\s\\u00A0.]?0[-\\s\\u00A0.]?([A-Z0-9]{6})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "ILLINOIS_LICENSE_PLATE", source: "\\b([A-Z]{2}\\d{5})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "IMEI_NUMBER", source: "\\bIMEI[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{15})\\b", flags: "gi", confidence: 0.859, category: "telecoms", tier: "medium" },
  { kind: "IMMIGRATION_NUMBER", source: "\\b(?:IMMIGRATION|ALIEN|A-NUMBER|A#)[:\\s#-]*([A-Z]?(?:\\d[\\s\\u00A0.-]?){7,9})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "medium" },
  { kind: "IMO_NUMBER", source: "\\bIMO[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{7})\\b", flags: "gi", confidence: 0.609, category: "maritime", tier: "contextual" },
  { kind: "IMSI_NUMBER", source: "\\bIMSI[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{15})\\b", flags: "gi", confidence: 0.859, category: "telecoms", tier: "medium" },
  { kind: "INCIDENT_REPORT_NUMBER", source: "\\b(?:INCIDENT|ACCIDENT)[-\\s]?(?:REPORT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.858, category: "insurance", tier: "contextual" },
  { kind: "INDIAN_AADHAAR", source: "\\b(\\d{4}\\s?\\d{4}\\s?\\d{4})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "INDIANA_LICENSE_PLATE", source: "\\b(\\d{3}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "INDONESIA_NIK", source: "\\b(\\d{16})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "INDONESIA_NPWP", source: "\\b(\\d{2}\\.?\\d{3}\\.?\\d{3}\\.?\\d[-\\.]?\\d{3}\\.?\\d{3})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "INSPECTION_CERTIFICATE", source: "\\b(?:INSPECTION|INSP)[-\\s]?(?:CERT(?:IFICATE)?)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.607, category: "transportation", tier: "contextual" },
  { kind: "INSTACART_ORDER_ID", source: "\\bINSTACART[-\\s]?(?:ORDER|DELIVERY)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "INSTAGRAM_USERNAME", source: "\\b([a-zA-Z0-9._]{3,30})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "INSTALLATION_REF", source: "\\b(?:INSTALLATION|INSTALL)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.607, category: "telecoms", tier: "contextual" },
  { kind: "INSURANCE_CERTIFICATE", source: "\\b(?:CERTIFICATE|CERT)[-\\s]?(?:OF[-\\s]?INSURANCE)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.858, category: "insurance", tier: "contextual" },
  { kind: "INTERNATIONAL_LICENSE_PLATE", source: "\\b(?:PLATE|REGISTRATION|TAG)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{4,10})\\b", flags: "gi", confidence: 0.607, category: "vehicles", tier: "contextual" },
  { kind: "INTERVIEWEE_ID", source: "\\bINTV[-\\s]?([A-Z]{1}\\d{5})\\b", flags: "gi", confidence: 0.858, category: "media", tier: "medium" },
  { kind: "INVESTMENT_ACCOUNT", source: "\\b(?:ISA|SIPP|INV(?:ESTMENT)?|PENSION|401K|IRA)[-\\s\\u00A0]*(?:ACCOUNT|ACCT|A\\/C)?[-\\s\\u00A0]*(?:NO|NUM(?:BER)?)?[-\\s\\u00A0.:#]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0./-]?){5,18}[A-Z0-9])\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "INVOICE_NUMBER", source: "\\b(?:INVOICE|INV)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.608, category: "retail", tier: "contextual" },
  { kind: "IOT_SERIAL_NUMBER", source: "\\bSN:([A-Z0-9]{12})\\b", flags: "gi", confidence: 0.608, category: "network", tier: "medium" },
  { kind: "IOWA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "IPV4", source: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b", flags: "g", confidence: 0.608, category: "network", tier: "contextual" },
  { kind: "IPV6", source: "\\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\\b", flags: "g", confidence: 0.608, category: "network", tier: "contextual" },
  { kind: "ISBN", source: "\\bISBN[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{3}[-\\s]?\\d{1,5}[-\\s]?\\d{1,7}[-\\s]?\\d{1,7}[-\\s]?\\d{1})\\b", flags: "gi", confidence: 0.407, category: "media", tier: "medium" },
  { kind: "ISIN", source: "\\b[A-Z]{2}[A-Z0-9]{9}\\d\\b", flags: "g", confidence: 0.608, category: "financial", tier: "contextual" },
  { kind: "ISRAEL_ID", source: "\\b(\\d{9})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ITALIAN_FISCAL_CODE", source: "\\b([A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ITIN", source: "\\b(?:ITIN|individual taxpayer)[:\\s#]*(9\\d{2}[-\\s]?[7-8]\\d[-\\s]?\\d{4})\\b", flags: "gi", confidence: 0.86, category: "government", tier: "contextual" },
  { kind: "JAPAN_POST_TRACKING", source: "\\b(?:JAPAN\\s?POST[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}\\d{9}JP)\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "JAPANESE_LICENSE_PLATE", source: "\\b([\u3042-\u3093]{1}\\s?\\d{2}-\\d{2}|\\d{2,3}\\s?[\u3042-\u3093]\\s?\\d{2}-\\d{2})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "JAPANESE_MY_NUMBER", source: "\\b(\\d{4}\\s?\\d{4}\\s?\\d{4})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "JOB_APPLICATION_ID", source: "\\b(?:APPLICATION|CANDIDATE|APPLICANT)[-\\s]?(?:ID|NO|NUM(?:BER)?|REF)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "JORDAN_NATIONAL_ID", source: "\\b(\\d{10})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "JUDGMENT_NUMBER", source: "\\b(?:JUDGMENT|ORDER|DECREE)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "contextual" },
  { kind: "JWT_TOKEN", source: "\\b(eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+)\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "KANSAS_LICENSE_PLATE", source: "\\b(\\d{3}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "KAZAKHSTAN_IIN", source: "\\bIIN[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{12})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "KENTUCKY_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "KENYA_KRA_PIN", source: "\\b(A\\d{9}[A-Z])\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "KENYA_NATIONAL_ID", source: "\\b(\\d{7,8})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "KUBERNETES_SECRET", source: "\\b(?:kind:\\s*Secret|apiVersion:\\s*v1)\\s[\\s\\S]{0,500}?data:\\s*\\n\\s+[a-zA-Z0-9\\-_]+:\\s*([A-Za-z0-9+/=]{20,})", flags: "g", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "KUWAIT_CIVIL_ID", source: "\\b(\\d{12})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "KYRGYZSTAN_PIN", source: "\\bPIN[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{14})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "LAB_TEST_ID", source: "\\b(?:LAB|TEST|SAMPLE)[-\\s]?(?:ID|NUM(?:BER)?|REF)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "healthcare", tier: "contextual" },
  { kind: "LEASE_AGREEMENT_NUMBER", source: "\\b(?:LEASE|RENTAL)[-\\s]?(?:AGREEMENT|CONTRACT|NO|NUM|NUMBER|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "real-estate", tier: "contextual" },
  { kind: "LEAVE_REQUEST_ID", source: "\\b(?:PTO|LEAVE|VACATION|TIME[-\\s]?OFF)[-\\s]?(?:REQUEST)?[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "contextual" },
  { kind: "LEBANON_NATIONAL_ID", source: "\\b(\\d{7,8})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "LEGACY_REFERENCE", source: "\\b(?:LEGACY|LEG|BEQUEST|BEQ)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.858, category: "charitable", tier: "contextual" },
  { kind: "LEI", source: "\\b[A-Z0-9]{20}\\b", flags: "g", confidence: 0.607, category: "financial", tier: "contextual" },
  { kind: "LIBRARY_CARD", source: "\\b(?:LIBRARY)[-\\s]?(?:CARD|ID|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "medium" },
  { kind: "LICENSE_PLATE", source: "\\b(?:LICENSE|PLATE|REG(?:ISTRATION)?)[-\\s]?(?:NO|NUM(?:BER)?|PLATE)?[-\\s]?[:#]?\\s*([A-Z0-9]{2,8})\\b", flags: "gi", confidence: 0.858, category: "transportation", tier: "contextual" },
  { kind: "LINKEDIN_PROFILE", source: "\\/in\\/([a-zA-Z0-9-]{3,100})\\/?", flags: "g", confidence: 0.608, category: "gaming", tier: "contextual" },
  { kind: "LITECOIN_ADDRESS", source: "\\b([LM][a-km-zA-HJ-NP-Z1-9]{26,33}|ltc1[a-z0-9]{39,59})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "LLOYDS_REGISTER_NUMBER", source: "\\b(?:LLOYD'?S?|LR)[-\\s]?(?:REG(?:ISTER)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{7})\\b", flags: "gi", confidence: 0.409, category: "maritime", tier: "contextual" },
  { kind: "LOAN_ACCOUNT", source: "\\b(?:LOAN|MORTGAGE|CREDIT)[-\\s]?(?:ACCOUNT|ACCT|A\\/C)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "medium" },
  { kind: "LOUISIANA_LICENSE_PLATE", source: "\\b(\\d{3}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "LOYALTY_CARD_NUMBER", source: "\\bLOYALTY[-\\s]?(?:CARD)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{10,16})\\b", flags: "gi", confidence: 0.608, category: "retail", tier: "contextual" },
  { kind: "LYFT_RIDE_ID", source: "\\bLYFT[-\\s]?(?:RIDE|TRIP)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,24})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "MAC_ADDRESS", source: "\\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\\b", flags: "g", confidence: 0.408, category: "network", tier: "contextual" },
  { kind: "MAILGUN_API_KEY", source: "\\b(key-[a-z0-9]{32})\\b", flags: "g", confidence: 0.858, category: "technology", tier: "contextual" },
  { kind: "MAINE_LICENSE_PLATE", source: "\\b(\\d{4}[A-Z]{2})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MALAYSIA_MYKAD", source: "\\b(\\d{6}[-\\s]?\\d{2}[-\\s]?\\d{4})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "MANUFACTURING_SERIAL", source: "\\b(?:SERIAL|SN)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "contextual" },
  { kind: "MANUSCRIPT_ID", source: "\\b(?:MANUSCRIPT|MS)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "media", tier: "contextual" },
  { kind: "MARITIME_CALLSIGN", source: "\\b(?:CALLSIGN|CALL\\s?SIGN)[-\\s]?[:#]?\\s*([A-Z0-9]{3,7})\\b", flags: "gi", confidence: 0.409, category: "maritime", tier: "contextual" },
  { kind: "MARYLAND_LICENSE_PLATE", source: "\\b(\\d[A-Z]{2}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MASSACHUSETTS_LICENSE_PLATE", source: "\\b(\\d[A-Z]{3}\\d{2})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MASTER_AIRWAY_BILL", source: "\\bMAWB[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{3}[-\\s]?\\d{8})\\b", flags: "gi", confidence: 0.608, category: "logistics", tier: "contextual" },
  { kind: "MATTER_NUMBER", source: "\\b(?:MATTER|ENGAGEMENT|CLIENT[-\\s]?MATTER)[-\\s]?(?:NO|NUM(?:BER)?|REF|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "contextual" },
  { kind: "MEAL_PLAN_ID", source: "\\b(?:MEAL[-\\s]?PLAN|DINING)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "medium" },
  { kind: "MEDICAL_DEVICE_SERIAL", source: "\\b(?:DEVICE|IMPLANT|PACEMAKER|DEFIBRILLATOR)[-\\s]?(?:SERIAL|SN|S\\/N)[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.857, category: "healthcare", tier: "medium" },
  { kind: "MEDICAL_IMAGE_REF", source: "\\b(?:X[-\\s\\u00A0]?RAY|MRI|CT[-\\s\\u00A0]?SCAN|PET[-\\s\\u00A0]?SCAN|ULTRASOUND|MAMMOGRAM)[-\\s\\u00A0]?(?:IMAGE|FILE|ID)?[-\\s\\u00A0.:#]*([A-Z0-9][A-Z0-9_.-]{5,23})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "MEDICAL_RECORD_NUMBER", source: "\\b(?:MR[N]?[-\\s]?|MEDICAL[-\\s]?REC(?:ORD)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*)([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "MEMBERSHIP_NUMBER", source: "\\b(?:MEMBER(?:SHIP)?|MEM|M)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.607, category: "charitable", tier: "contextual" },
  { kind: "MERCHANT_ID", source: "\\b(?:MERCHANT|MID)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "contextual" },
  { kind: "METER_SERIAL_NUMBER", source: "\\bMTR[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{8,12})\\b", flags: "gi", confidence: 0.858, category: "telecoms", tier: "medium" },
  { kind: "MEXICAN_CURP", source: "\\b([A-Z]{4}\\d{6}[HM][A-Z]{5}[0-9A-Z]\\d)\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "MEXICAN_RFC", source: "\\b([A-Z&\xD1]{3,4}\\d{6}[A-Z0-9]{2,3})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "MICHIGAN_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MICROSOFT_CERTIFICATION", source: "\\b(?:MICROSOFT|MCID|MS)[-\\s]?(?:CERT(?:IFICATION)?|ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.408, category: "professional-certifications", tier: "contextual" },
  { kind: "MINECRAFT_UUID", source: "\\b([0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12})\\b", flags: "gi", confidence: 0.608, category: "other", tier: "contextual" },
  { kind: "MINNESOTA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MISSING_PERSON_CASE", source: "\\b(?:MISSING|MP|AMBER)[-\\s]?(?:PERSON|CASE|ALERT)?[-\\s]?(?:NO|NUMBER|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "MISSISSIPPI_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MISSOURI_LICENSE_PLATE", source: "\\b([A-Z]{2}\\d[A-Z]\\d[A-Z])\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MLS_LISTING_NUMBER", source: "\\bMLS[-\\s]?(?:NO|NUM|NUMBER|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "real-estate", tier: "contextual" },
  { kind: "MMSI_NUMBER", source: "\\bMMSI[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{9})\\b", flags: "gi", confidence: 0.609, category: "maritime", tier: "contextual" },
  { kind: "MONERO_ADDRESS", source: "\\b([48][a-km-zA-HJ-NP-Z1-9]{94})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "MONTANA_LICENSE_PLATE", source: "\\b(\\d-\\d{5}[A-Z])\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "MOROCCO_NATIONAL_ID", source: "\\b(?:CNIE|ID)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{1,2}\\d{6,8}|\\d{8})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "MORTGAGE_LOAN_NUMBER", source: "\\b(?:MORTGAGE|LOAN|MTG)[-\\s]?(?:NO|NUM|NUMBER|ID|ACCOUNT)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.859, category: "real-estate", tier: "contextual" },
  { kind: "MYANMAR_NRC", source: "\\b(\\d{1,2}\\/[A-Z][a-z]+\\([NC]\\)\\d{6})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "NAME", source: "\\b(?:(?:Mr|Mrs|Ms|Miss|Dr|Prof|Professor|Sir|Madam|Lady|Lord|Rev|Father|Sister|Brother)\\.?\\s+)?((?:[A-Z][a-z'\u2019.\\-]+|[A-Z]{2,})(?:\\s+(?:[A-Z][a-z'\u2019.\\-]+|[A-Z]{2,}|[a-z][a-z'\u2019.\\-]+)){1,3})(?:\\s+(?:Jr|Sr|II|III|IV|PhD|MD|Esq|DDS|DVM|MBA|CPA)\\.?)?\\b", flags: "g", confidence: 0.855, category: "personal", tier: "contextual" },
  { kind: "NATIONAL_INSURANCE_UK", source: "\\b(?:NI\\b|NINO|national\\s+insurance)[:\\s\\u00A0#-]*([A-CEGHJ-PR-TW-Z]{2}(?:[\\s\\u00A0.-]?\\d{2}){3}[\\s\\u00A0.-]?[A-D])\\b", flags: "gi", confidence: 0.86, category: "government", tier: "high", validatorName: "validateNINO" },
  { kind: "NDA_ID", source: "\\b(?:NDA|CONFIDENTIALITY|NON[-\\s]?DISCLOSURE)[-\\s]?(?:AGREEMENT)?[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.857, category: "legal", tier: "medium" },
  { kind: "NEAR_ADDRESS", source: "\\b([a-z0-9_-]{2,64}\\.near)\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "NEBRASKA_LICENSE_PLATE", source: "\\b([A-Z]\\d{5})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEVADA_LICENSE_PLATE", source: "\\b(\\d{2}[A-Z]\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEW_HAMPSHIRE_LICENSE_PLATE", source: "\\b(\\d{3,4}[A-Z]{2})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEW_JERSEY_LICENSE_PLATE", source: "\\b([A-Z]\\d{2}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEW_MEXICO_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEW_YORK_LICENSE_PLATE", source: "\\b([A-Z]{3}-?\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NEW_ZEALAND_DRIVER_LICENSE", source: "\\b([A-Z]{2}\\d{6})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "NEW_ZEALAND_IRD", source: "\\bIRD[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{8,9})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "NEW_ZEALAND_PASSPORT", source: "\\b([A-Z]{2}\\d{6})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "NHS_NUMBER", source: "\\b(?:NHS|nhs number)[:\\s\\u00A0#-]*((?:\\d{3}[\\s\\u00A0.-]?){2}\\d{4})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "high", validatorName: "validateNHS" },
  { kind: "NIGERIA_BVN", source: "\\bBVN[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{11})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "NIGERIA_NIN", source: "\\b(\\d{11})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "NINTENDO_FRIEND_CODE", source: "\\bSW[-\\s]?(\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4})\\b", flags: "gi", confidence: 0.609, category: "gaming", tier: "contextual" },
  { kind: "NORTH_CAROLINA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NORTH_DAKOTA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "NOTARY_LICENSE", source: "\\b(?:NOTARY|NOTARIAL)[-\\s]?(?:LIC(?:ENSE)?|COMMISSION|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "medium" },
  { kind: "NPDES_PERMIT", source: "\\bNPDES[-\\s]?(?:PERMIT|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}[A-Z0-9]{7,9})\\b", flags: "gi", confidence: 0.608, category: "environmental", tier: "contextual" },
  { kind: "NPI_NUMBER", source: "\\b(?:NPI[-\\s\\u00A0]*(?:NO|NUM(?:BER)?)?[-\\s\\u00A0.:#]*)?((?:\\d[\\s\\u00A0.-]?){10})\\b", flags: "g", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "NPM_TOKEN", source: "\\b(npm_[A-Za-z0-9]{36})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "NURSING_LICENSE", source: "\\b(?:RN|LPN|NP|NURSING)[-\\s]?(?:LICENSE|LIC|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "professional-certifications", tier: "contextual" },
  { kind: "OAUTH_CLIENT_SECRET", source: "\\b(?:client.?secret|consumer.?secret)[:=\\s]+([a-zA-Z0-9_\\-]{20,})", flags: "gi", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "OAUTH_TOKEN", source: "\\b(?:oauth.?token|access.?token)[:=\\s]+([a-zA-Z0-9_\\-\\.]{20,})", flags: "gi", confidence: 0.858, category: "technology", tier: "contextual" },
  { kind: "ODOMETER_READING_REF", source: "\\b(?:ODOMETER|MILEAGE)[-\\s]?[:#]?\\s*(\\d{1,7})\\s*(?:KM|MILES|MI)\\b", flags: "gi", confidence: 0.407, category: "transportation", tier: "contextual" },
  { kind: "OFFICIAL_SHIP_NUMBER", source: "\\b(?:OFFICIAL|SHIP)[-\\s]?(?:NO|NUM|NUMBER)[-\\s]?[:#]?\\s*([A-Z0-9]{5,12})\\b", flags: "gi", confidence: 0.608, category: "maritime", tier: "contextual" },
  { kind: "OHIO_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "OKLAHOMA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "OMAN_CIVIL_ID", source: "\\b(\\d{8})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "ONTRAC_TRACKING", source: "\\b(?:ONTRAC|ON\\s?TRAC|LASERSHIP)[-\\s]?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(C\\d{14})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "OPENAI_API_KEY", source: "\\b(sk-proj-[A-Za-z0-9_-]{100,200}|sk-[A-Za-z0-9_-]{48,52})\\b", flags: "g", confidence: 0.86, category: "technology", tier: "medium" },
  { kind: "ORDER_NUMBER", source: "\\b(?:ORD(?:ER)?[-\\s](?:NO|NUM(?:BER)?)?[-\\s:#]?\\s*|ORDER\\s+(?:NO|NUM(?:BER)?)?[:\\s]+)([A-Z0-9-]{8,14})\\b", flags: "gi", confidence: 0.609, category: "retail", tier: "contextual" },
  { kind: "OREGON_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "OVERWATCH_BATTLETAG", source: "\\b([a-zA-Z][a-zA-Z0-9]{2,11})#(\\d{4,5})\\b", flags: "g", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "PALLET_ID", source: "\\bPALLET[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.407, category: "manufacturing", tier: "contextual" },
  { kind: "PARAMEDIC_CERTIFICATION", source: "\\b(?:NREMT|EMT|PARAMEDIC)[-\\s]?(?:P|B|A|I)?[-\\s]?(?:CERT|LICENSE|LIC)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "emergency", tier: "contextual" },
  { kind: "PARKING_PERMIT", source: "\\b(?:PARKING)[-\\s]?(?:PERMIT|PASS|DECAL)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.407, category: "education", tier: "medium" },
  { kind: "PART_NUMBER", source: "\\bP(?:ART)?N[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([0-9A-Z]{6,12})\\b", flags: "gi", confidence: 0.407, category: "manufacturing", tier: "contextual" },
  { kind: "PASSPORT_MRZ_TD1", source: "[A-Z]{1}[A-Z<][A-Z]{3}[A-Z0-9<]{9}[0-9][A-Z0-9<]{15}\\r?\\n[0-9]{6}[0-9][MF<][0-9]{6}[0-9][A-Z]{3}[A-Z0-9<]{11}[0-9]\\r?\\n[A-Z<]{30}", flags: "g", confidence: 0.86, category: "government", tier: "medium" },
  { kind: "PASSPORT_MRZ_TD3", source: "P<[A-Z]{3}[A-Z<]{39}\\r?\\n[A-Z0-9<]{9}[0-9][A-Z]{3}[0-9]{6}[0-9][MF<][0-9]{6}[0-9][A-Z0-9<]{14}[0-9]", flags: "g", confidence: 0.86, category: "government", tier: "medium" },
  { kind: "PASSPORT_UK", source: "\\b(?:passport|pass)[:\\s\\u00A0#-]*((?:\\d{3}[\\s\\u00A0.-]?){2}\\d{3})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "high", validatorName: "validateUKPassport" },
  { kind: "PASSPORT_US", source: "\\b(?:passport|pass)[:\\s\\u00A0#-]*(([A-Z0-9][\\s\\u00A0.-]?){5,8}[A-Z0-9])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "PATENT_NUMBER", source: "\\b(?:(?:US|EP|WO|PCT)[-\\s]?)?(?:PATENT|PAT)[-\\s]?(?:NO|NUM(?:BER)?|APPL(?:ICATION)?)?[-\\s]?[:#]?\\s*([A-Z]{0,2}\\d{6,10}[A-Z0-9]{0,3})\\b", flags: "gi", confidence: 0.607, category: "legal", tier: "medium" },
  { kind: "PATIENT_ID", source: "\\b(?:PATIENT[-\\s]?(?:ID|NUM(?:BER)?|REF(?:ERENCE)?)[-\\s]?[:#]?\\s*)([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "PAYMENT_CUSTOMER_ID", source: "\\b(cus_[a-zA-Z0-9]{14,})", flags: "g", confidence: 0.858, category: "financial", tier: "medium" },
  { kind: "PAYMENT_REFERENCE", source: "\\b(?:PAYMENT|PAY)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "medium" },
  { kind: "PAYMENT_TOKEN", source: "\\b(?:tok|card|pm|src)_[a-zA-Z0-9]{24,}", flags: "g", confidence: 0.859, category: "financial", tier: "medium" },
  { kind: "PAYROLL_NUMBER", source: "\\b(?:PAYROLL|PAY)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.859, category: "hr", tier: "contextual" },
  { kind: "PCARD_REFERENCE", source: "\\b(?:P[-\\s]?Card|Procurement\\s+Card).*?(?:ending|last\\s+4|XXXX)[-\\s]?(\\d{4})\\b", flags: "gi", confidence: 0.859, category: "procurement", tier: "medium" },
  { kind: "PE_LICENSE", source: "\\bPE[-\\s]?(?:LICENSE|LIC|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{5,10})\\b", flags: "gi", confidence: 0.608, category: "professional-certifications", tier: "contextual" },
  { kind: "PENNSYLVANIA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "PERFORMANCE_REVIEW_ID", source: "\\b(?:PERFORMANCE|REVIEW|APPRAISAL|EVALUATION)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "PERU_DNI", source: "\\b(\\d{8})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "PERU_RUC", source: "\\bRUC[-\\s]?(?:NO|NUM)?[-\\s]?[:#]?\\s*(\\d{11})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "PHILIPPINES_UMID", source: "\\b(\\d{4}[-\\s]?\\d{7}[-\\s]?\\d)\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "PHONE_INTERNATIONAL", source: "\\b\\+(?:\\d[\\s\\u00A0.\\-()]?){6,14}\\d(?:\\s?(?:ext\\.?|x)\\s?\\d{1,6})?\\b", flags: "g", confidence: 0.608, category: "contact", tier: "contextual" },
  { kind: "PHONE_LINE_NUMBER", source: "\\b(?:LINE|NUMBER)[-\\s]?(?:NO)?[-\\s]?[:#]?\\s*(\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{4})\\b", flags: "g", confidence: 0.859, category: "telecoms", tier: "contextual" },
  { kind: "PHONE_UK", source: "\\b(?:\\+?44[\\s\\u00A0.-]?(?:0)?\\s*)?(?:\\(?0?[1-9]\\d{1,3}\\)?[\\s\\u00A0.-]?\\d{3,4}[\\s\\u00A0.-]?\\d{3,4})(?:\\s?(?:ext\\.?|x)\\s?\\d{1,5})?\\b", flags: "g", confidence: 0.608, category: "contact", tier: "contextual" },
  { kind: "PHONE_UK_MOBILE", source: "\\b(?:\\+?44[\\s\\u00A0.-]?7\\d{3}|0?7\\d{3})[\\s\\u00A0.-]?\\d{3}[\\s\\u00A0.-]?\\d{3}\\b", flags: "g", confidence: 0.609, category: "contact", tier: "contextual" },
  { kind: "PHONE_US", source: "\\b(?:\\+1[\\s\\u00A0.-]?)?(?:\\(\\d{3}\\)|\\d{3})[\\s\\u00A0.-]?\\d{3}[\\s\\u00A0.-]?\\d{4}(?:\\s?(?:ext\\.?|x)\\s?\\d{1,6})?\\b", flags: "g", confidence: 0.608, category: "contact", tier: "contextual" },
  { kind: "PMP_CERTIFICATION", source: "\\bPMP[-\\s]?(?:ID|NO|NUM|NUMBER|CERT(?:IFICATION)?)?[-\\s]?[:#]?\\s*(\\d{7,9})\\b", flags: "gi", confidence: 0.608, category: "professional-certifications", tier: "contextual" },
  { kind: "PNG_NATIONAL_ID", source: "\\b(?:PNG|PAPUA)[-\\s]?(?:ID|NATIONAL\\s?ID)[-\\s]?[:#]?\\s*([A-Z0-9]{8,12})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "POLICE_BADGE", source: "\\b(?:BADGE|SHIELD|OFFICER)[-\\s]?(?:NO|NUM|NUMBER|ID)?[-\\s]?[:#]?\\s*(\\d{3,6})\\b", flags: "gi", confidence: 0.608, category: "emergency", tier: "contextual" },
  { kind: "POLICE_REPORT_NUMBER", source: "\\b(?:POLICE|PR|RPT|REPORT|CASE)[-\\s\\u00A0]*(?:NO|NUM|NUMBER|ID)?[-\\s\\u00A0.:#]*((?:[A-Z]{2,4}[\\s\\u00A0./-]?\\d{2,4}[\\s\\u00A0./-]?\\d{4,10})|\\d{4}[\\s\\u00A0./-]?\\d{5,10})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "POLICY_HOLDER_ID", source: "\\b(?:POLICY[-\\s]?HOLDER|INSURED|POLICYHOLDER)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9-]{8,14})\\b", flags: "gi", confidence: 0.858, category: "insurance", tier: "medium" },
  { kind: "POLICY_NUMBER", source: "\\bPOLICY[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{2,4}\\d{6,10})\\b", flags: "gi", confidence: 0.859, category: "insurance", tier: "medium" },
  { kind: "POLISH_PESEL", source: "\\b(\\d{11})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "POLKADOT_ADDRESS", source: "\\b(1[1-9A-HJ-NP-Za-km-z]{46,47})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "POLYGON_ADDRESS", source: "\\b(0x[a-fA-F0-9]{40})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "POSTCODE_UK", source: "\\b([A-Z]{1,2}\\d{1,2}[A-Z]?[\\s\\u00A0.-]?\\d[A-Z]{2})\\b", flags: "g", confidence: 0.408, category: "contact", tier: "contextual" },
  { kind: "POSTMATES_DELIVERY_ID", source: "\\bPOSTMATES[-\\s]?(?:DELIVERY|ORDER)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.607, category: "gig-economy", tier: "contextual" },
  { kind: "PREMIUM_PAYMENT_REF", source: "\\b(?:PREMIUM)[-\\s]?(?:PAYMENT)?[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.608, category: "insurance", tier: "medium" },
  { kind: "PRESCRIPTION_NUMBER", source: "\\b(?:RX|PRESC(?:RIPTION)?|SCRIPT)[-\\s]?(?:NO|NUM(?:BER)?|REF|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "PRESS_PASS_ID", source: "\\b(?:PRESS[-\\s]?PASS|MEDIA[-\\s]?CREDENTIAL)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "media", tier: "contextual" },
  { kind: "PRIVATE_KEY", source: "-----BEGIN (?:RSA |EC )?PRIVATE KEY-----[\\s\\S]{20,}?-----END (?:RSA |EC )?PRIVATE KEY-----", flags: "g", confidence: 0.86, category: "technology", tier: "medium" },
  { kind: "PRO_NUMBER", source: "\\bPRO[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{9,10})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "PROBATE_CASE", source: "\\b(?:PROBATE|ESTATE)[-\\s]?(?:NO|NUM(?:BER)?|CASE)?[-\\s]?[:#]?\\s*([A-Z]{1,2}\\d{6,10})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "contextual" },
  { kind: "PRODUCT_SKU", source: "\\bSKU[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.406, category: "retail", tier: "medium" },
  { kind: "PRODUCTION_ID", source: "\\b(?:PRODUCTION|PROD)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.407, category: "media", tier: "contextual" },
  { kind: "PROJECT_CODE", source: "\\b(?:PROJECT|PROJ)[-\\s]+(?:CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{4,10})\\b", flags: "gi", confidence: 0.407, category: "manufacturing", tier: "contextual" },
  { kind: "PROMO_CODE", source: "\\b(?:PROMO|COUPON|DISCOUNT)[-\\s]?(?:CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.407, category: "retail", tier: "contextual" },
  { kind: "PROPERTY_PARCEL_NUMBER", source: "\\b(?:APN|PARCEL|ASSESSOR)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{3}(?:[-\\s]?\\d{1,3})?)\\b", flags: "gi", confidence: 0.858, category: "real-estate", tier: "contextual" },
  { kind: "PROPERTY_TAX_ACCOUNT", source: "\\b(?:PROPERTY[- ]?TAX|TAX|MUNICIPAL)[-\\s]?(?:ACCOUNT|ACCT|NO|NUMBER|ID)?[-\\s]?[:#]?\\s*(\\d{6,12})\\b", flags: "gi", confidence: 0.858, category: "real-estate", tier: "contextual" },
  { kind: "PROTOCOL_NUMBER", source: "\\b(?:PROTOCOL|STUDY)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.607, category: "healthcare", tier: "contextual" },
  { kind: "PROVIDER_LICENSE", source: "\\b(?:MEDICAL|PHYSICIAN|DOCTOR|NURSE|PROVIDER)[-\\s\\u00A0]*(?:LICENSE|LICENCE|LIC)[-\\s\\u00A0]*(?:NO|NUM(?:BER)?)?[-\\s\\u00A0.:#]*((?:[A-Z0-9]{2,6}[\\s\\u00A0./-]?){1,3}[A-Z0-9]{2,6})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "PSC_INSPECTION_ID", source: "\\b(?:PSC|INSPECTION)[-\\s]?(?:ID|NO|NUM|NUMBER)[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.408, category: "maritime", tier: "contextual" },
  { kind: "PSN_ID", source: "\\b([a-zA-Z][a-zA-Z0-9_-]{2,15})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "PUBLISHING_CONTRACT", source: "\\b(?:PUBLISHING|PUB)[-\\s]?(?:CONTRACT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.858, category: "media", tier: "contextual" },
  { kind: "PURCHASE_ORDER", source: "\\b(?:PO|Purchase\\s+Order)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "contextual" },
  { kind: "PURCHASE_ORDER_NUMBER", source: "\\bP(?:URCHASE[-\\s]?)?O(?:RDER)?[-\\s]+(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "medium" },
  { kind: "PUROLATOR_TRACKING", source: "\\b(?:PUROLATOR[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER|PIN)?[-\\s]?[:#]?\\s*(\\d{12}|P\\d{10})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "PYPI_TOKEN", source: "\\b(pypi-[A-Za-z0-9_\\-]{100,})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "QATAR_ID", source: "\\b(\\d{11})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "QC_CERTIFICATE_NUMBER", source: "\\b(?:QC|QUALITY)[-\\s]?(?:CERT(?:IFICATE)?)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "contextual" },
  { kind: "QUOTATION_REFERENCE", source: "\\b(?:QUOTATION|QUOTE|QUO|Q)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "contextual" },
  { kind: "QUOTE_REFERENCE", source: "\\b(?:QUOTE|QTE)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.607, category: "insurance", tier: "contextual" },
  { kind: "REAL_ESTATE_LICENSE", source: "\\b(?:REAL[- ]?ESTATE|RE|BROKER)[-\\s]?(?:LICENSE|LIC)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "real-estate", tier: "contextual" },
  { kind: "RECRUITER_REF", source: "\\b(?:RECRUITER|AGENCY)[-\\s]?(?:REF|ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "contextual" },
  { kind: "REDDIT_USERNAME", source: "u\\/([a-zA-Z0-9_-]{3,20})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "REINSURANCE_TREATY", source: "\\b(?:REINSURANCE|TREATY)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.607, category: "insurance", tier: "contextual" },
  { kind: "REMEDIATION_SITE_ID", source: "\\b(?:REMEDIATION|CLEANUP)[-\\s]?SITE[-\\s]?(?:ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "RENTAL_CAR_CONFIRMATION", source: "\\b(?:RENTAL|CAR|VEHICLE)[-\\s]?(?:CONF(?:IRMATION)?|RESERVATION|BOOKING)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hospitality", tier: "contextual" },
  { kind: "REQUISITION_NUMBER", source: "\\b(?:REQ|REQUISITION|PR|Purchase\\s+Requisition)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "medium" },
  { kind: "RESEARCH_GRANT", source: "\\b(?:GRANT|RESEARCH|FUNDING)[-\\s]?(?:NO|NUM(?:BER)?|ID|REF)?[-\\s]?[:#]?\\s*([A-Z]{2,4}[-]?\\d{6,10})\\b", flags: "gi", confidence: 0.607, category: "education", tier: "contextual" },
  { kind: "RESUME_ID", source: "\\b(?:RESUME|CV|CURRICULUM[-\\s]?VITAE)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "medium" },
  { kind: "RETAINER_NUMBER", source: "\\b(?:RETAINER)[-\\s]?(?:NO|NUM(?:BER)?|AGREEMENT)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "RETIREMENT_ACCOUNT", source: "\\b(?:401K|403B|IRA|RETIREMENT|PENSION)[-\\s]?(?:ACCOUNT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.859, category: "hr", tier: "contextual" },
  { kind: "RFP_NUMBER", source: "\\b(?:RFP|Request\\s+for\\s+Proposal)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "medium" },
  { kind: "RFQ_NUMBER", source: "\\bRFQ[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "manufacturing", tier: "contextual" },
  { kind: "RFQ_NUMBER_2", source: "\\b(?:RFQ|Request\\s+for\\s+Quotation)[-#\\s]?(\\d{6,12})\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "medium" },
  { kind: "RHODE_ISLAND_LICENSE_PLATE", source: "\\b(\\d{6})\\b", flags: "g", confidence: 0.607, category: "vehicles", tier: "contextual" },
  { kind: "RIOT_ID", source: "\\b([a-zA-Z0-9_]{3,16})#([a-zA-Z0-9]{3,5})\\b", flags: "g", confidence: 0.608, category: "other", tier: "contextual" },
  { kind: "RIPPLE_ADDRESS", source: "\\b(r[a-km-zA-HJ-NP-Z1-9]{24,34})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "RMA_NUMBER", source: "\\b(?:RMA|RETURN)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.608, category: "retail", tier: "contextual" },
  { kind: "ROBLOX_USER_ID", source: "\\bROBLOX[-\\s]?(?:USER|ID)?[-\\s]?[:#]?\\s*(\\d{1,12})\\b", flags: "gi", confidence: 0.608, category: "other", tier: "contextual" },
  { kind: "ROMANIAN_CNP", source: "\\bCNP[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{13})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "ROUTING_NUMBER_MFG", source: "\\bROUTING[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "manufacturing", tier: "contextual" },
  { kind: "ROUTING_NUMBER_US", source: "\\b(?:routing|RTN|ABA)[-\\s\\u00A0]*(?:number|no|num)?[-\\s\\u00A0.:#]*((?:\\d[\\s\\u00A0.-]?){9})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "high", validatorName: "validateRoutingNumber" },
  { kind: "ROYAL_MAIL_TRACKING", source: "\\b(?:ROYAL\\s?MAIL[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}\\d{9}GB)\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "RUSSIAN_PASSPORT", source: "\\b(\\d{4}\\s?\\d{6})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "RUSSIAN_SNILS", source: "\\b(\\d{3}-\\d{3}-\\d{3}\\s?\\d{2})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SALARY_AMOUNT", source: "\\b(?:SALARY|COMPENSATION|PAY|WAGE|EARNING)[-\\s]?[:#]?\\s*(?:[$\xA3\u20AC\xA5]\\s?)?(\\d{1,3}(?:[,\\s]\\d{3})*(?:\\.\\d{2})?)\\b", flags: "gi", confidence: 0.858, category: "hr", tier: "contextual" },
  { kind: "SAMOA_NATIONAL_ID", source: "\\b(?:SAMOA|WS)[-\\s]?(?:ID|NATIONAL\\s?ID)[-\\s]?[:#]?\\s*(\\d{8,10})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "SAUDI_NATIONAL_ID", source: "\\b([12]\\d{9})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SCHOLARSHIP_ID", source: "\\b(?:SCHOLARSHIP|GRANT|AWARD)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "contextual" },
  { kind: "SEAFARER_ID", source: "\\b(?:SEAFARER|MARINER|SID)[-\\s]?(?:ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2,3}[A-Z0-9]{9})\\b", flags: "gi", confidence: 0.858, category: "maritime", tier: "contextual" },
  { kind: "SEARCH_RESCUE_MISSION_ID", source: "\\b(?:SAR|SEARCH|RESCUE|MISSION)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.859, category: "emergency", tier: "contextual" },
  { kind: "SECURITY_CLEARANCE", source: "\\b(?:CLEARANCE|SECURITY[-\\s]?LEVEL)[-\\s]?[:#]?\\s*(TOP[-\\s]?SECRET|SECRET|CONFIDENTIAL|[A-Z]{2,3}\\/SCI)\\b", flags: "gi", confidence: 0.859, category: "hr", tier: "medium" },
  { kind: "SEDOL", source: "\\b[B-DF-HJ-NP-TV-Z0-9]{6}\\d\\b", flags: "g", confidence: 0.608, category: "financial", tier: "contextual" },
  { kind: "SENDGRID_API_KEY", source: "\\b(SG\\.[a-zA-Z0-9_\\-]{22}\\.[a-zA-Z0-9_\\-]{43})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "SERBIAN_JMBG", source: "\\b(\\d{13})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SERVICE_REQUEST_NUMBER", source: "\\b(?:SERVICE|SR)[-\\s]?(?:REQUEST)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,14})\\b", flags: "gi", confidence: 0.608, category: "telecoms", tier: "contextual" },
  { kind: "SESSION_ID", source: "\\b(?:session|sess|sid)[:\\s=]+([a-f0-9]{32,})\\b", flags: "gi", confidence: 0.608, category: "technology", tier: "contextual" },
  { kind: "SETTLEMENT_ID", source: "\\b(?:SETTLEMENT|AGREEMENT)[-\\s]?(?:ID|NO|NUM(?:BER)?|REF)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "contextual" },
  { kind: "SHIPMENT_TRACKING", source: "\\b(?:SHIPMENT|TRACKING)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,30})\\b", flags: "gi", confidence: 0.607, category: "transportation", tier: "contextual" },
  { kind: "SHIPPING_CONTAINER_NUMBER", source: "\\b([A-Z]{4}\\d{7})\\b", flags: "g", confidence: 0.608, category: "logistics", tier: "contextual" },
  { kind: "SHIPPING_TRACKING", source: "\\b(?:TRACKING|TRACK)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,30})\\b", flags: "gi", confidence: 0.607, category: "retail", tier: "contextual" },
  { kind: "SIM_CARD_NUMBER", source: "\\bSIM[-\\s]?(?:CARD)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{19,20})\\b", flags: "gi", confidence: 0.858, category: "telecoms", tier: "contextual" },
  { kind: "SIN_CA", source: "\\b(?:SIN|social insurance)[:\\s#]*(\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{3})\\b", flags: "gi", confidence: 0.86, category: "government", tier: "high", validatorName: "validateCanadianSIN" },
  { kind: "SINGAPORE_NRIC", source: "\\b([STFGM]\\d{7}[A-Z])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SLACK_TOKEN", source: "\\b(xox[baprs]-[0-9a-zA-Z\\-]{10,})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "SLACK_WEBHOOK", source: "https:\\/\\/hooks\\.slack\\.com\\/services\\/[A-Z0-9]+\\/[A-Z0-9]+\\/[A-Za-z0-9]+", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "SMART_METER_ID", source: "\\b(?:SMART[-\\s]?METER)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,16})\\b", flags: "gi", confidence: 0.858, category: "telecoms", tier: "contextual" },
  { kind: "SOCIAL_MEDIA_HANDLE", source: "@([a-zA-Z0-9_]{3,30})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "SOLANA_ADDRESS", source: "\\b([1-9A-HJ-NP-Za-km-z]{32,44})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "SORT_CODE_UK", source: "\\b(?:sort[\\s\\u00A0-]*code|SC)[:\\s\\u00A0.-]*((?:\\d{2}[\\s\\u00A0.-]?){2}\\d{2})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "high", validatorName: "validateSortCode" },
  { kind: "SOURCE_ID", source: "\\bSOURCE[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.859, category: "media", tier: "contextual" },
  { kind: "SOUTH_AFRICA_ID", source: "\\b(\\d{13})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SOUTH_CAROLINA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "SOUTH_DAKOTA_LICENSE_PLATE", source: "\\b(\\d{2}[A-Z]\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "SOUTH_KOREAN_RRN", source: "\\b(\\d{6}[-\\s]?[1-4]\\d{6})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SPANISH_DNI", source: "\\b([0-9]{8}[-\\s]?[A-Z]|[XYZ][-\\s]?[0-9]{7}[-\\s]?[A-Z])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "SPILL_REPORT_NUMBER", source: "\\bSPILL[-\\s]?(?:REPORT|NO|NUM|NUMBER)[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.608, category: "environmental", tier: "contextual" },
  { kind: "SSH_PRIVATE_KEY", source: "-----BEGIN OPENSSH PRIVATE KEY-----[\\s\\S]{20,}?-----END OPENSSH PRIVATE KEY-----", flags: "g", confidence: 0.86, category: "technology", tier: "medium" },
  { kind: "STANDING_ORDER_REF", source: "\\b(?:STANDING[-\\s]?ORDER|SO)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "medium" },
  { kind: "STATEMENT_REF", source: "\\b(?:STATEMENT|STMT)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "medium" },
  { kind: "STEAM_ID64", source: "\\b(765\\d{14})\\b", flags: "g", confidence: 0.608, category: "gaming", tier: "contextual" },
  { kind: "STOCK_TRADE", source: "\\b([A-Z]{1,5})\\s+(?:BUY|SELL|SOLD|BOUGHT)\\s+(\\d+(?:,\\d{3})*(?:\\.\\d{2})?)\\s+(?:@|at)\\s+\\$?(\\d+(?:\\.\\d{2,4})?)\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "STORM_WATER_PERMIT", source: "\\bSTORM\\s?WATER[-\\s]?PERMIT[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z]{2}[A-Z0-9]{6,10})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "STRIPE_API_KEY", source: "\\b((sk|pk)_(live|test)_[0-9a-zA-Z]{24,})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "medium" },
  { kind: "STUDENT_ID", source: "\\b(?:STUDENT|PUPIL|SCHOLAR)[-\\s]?(?:ID|NUM(?:BER)?|NO)?[-\\s]?[:#]?\\s*([A-Z]{0,2}\\d{6,10})\\b", flags: "gi", confidence: 0.859, category: "education", tier: "medium" },
  { kind: "SUBPOENA_NUMBER", source: "\\b(?:SUBPOENA|SUMMONS)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.858, category: "legal", tier: "medium" },
  { kind: "SUBSCRIBER_ID", source: "\\bSUBSCRIBER[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.858, category: "media", tier: "contextual" },
  { kind: "SUBSCRIPTION_ID", source: "\\b(sub_[a-zA-Z0-9]{14,})", flags: "g", confidence: 0.608, category: "financial", tier: "medium" },
  { kind: "SUPPLIER_ID", source: "\\bSUPP(?:LIER)?[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{2}\\d{5,8})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "medium" },
  { kind: "SUPPLIER_ID_2", source: "\\b(?:SUPPLIER|SUP|VENDOR|VEN)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "contextual" },
  { kind: "SWIFT_BIC", source: "\\b([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)\\b", flags: "g", confidence: 0.858, category: "financial", tier: "high", validatorName: "validateSWIFTBIC" },
  { kind: "TAJIKISTAN_NATIONAL_ID", source: "\\b(?:TAJIK|TJ)[-\\s]?(?:ID|NATIONAL\\s?ID)[-\\s]?[:#]?\\s*(\\d{9,10})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "TASKRABBIT_TASK_ID", source: "\\b(?:TASKRABBIT|TR)[-\\s]?(?:TASK|JOB)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.607, category: "gig-economy", tier: "contextual" },
  { kind: "TAX_ID", source: "\\b(?:TIN|tax id|EIN)[:\\s\\u00A0#-]*(\\d{2}(?:[\\s\\u00A0.-]?\\d){7})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "TEACHING_LICENSE", source: "\\b(?:TEACHING|TEACHER|EDUCATOR)[-\\s]?(?:LICENSE|LIC|CERT(?:IFICATE)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "professional-certifications", tier: "contextual" },
  { kind: "TELECOMS_ACCOUNT_NUMBER", source: "\\bACC(?:OUNT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{8,12})\\b", flags: "gi", confidence: 0.859, category: "telecoms", tier: "contextual" },
  { kind: "TELEGRAM_USER_ID", source: "\\b(\\d{6,10})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "TELEMATICS_DEVICE_ID", source: "\\b(?:TELEMATICS|GPS[-\\s]?DEVICE)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{10,16})\\b", flags: "gi", confidence: 0.608, category: "transportation", tier: "contextual" },
  { kind: "TENDER_REFERENCE", source: "\\b(?:TENDER|TN|T)[-_]?\\d{6,12}\\b", flags: "gi", confidence: 0.607, category: "procurement", tier: "contextual" },
  { kind: "TENNESSEE_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "TERMINAL_ID", source: "\\b(?:TERMINAL|TID|POS)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,16})\\b", flags: "gi", confidence: 0.607, category: "financial", tier: "contextual" },
  { kind: "TEXAS_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4}|[A-Z]{2}\\d-[A-Z]\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "TEZOS_ADDRESS", source: "\\b(tz[123][1-9A-HJ-NP-Za-km-z]{33})\\b", flags: "g", confidence: 0.858, category: "financial", tier: "contextual" },
  { kind: "THAILAND_NATIONAL_ID", source: "\\b(\\d{13})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "THEME_PARK_TICKET", source: "\\b(?:TICKET|PASS|ADMISSION)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.407, category: "hospitality", tier: "contextual" },
  { kind: "TIKTOK_USERNAME", source: "@([a-zA-Z0-9._]{2,24})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "TIMESHEET_NUMBER", source: "\\b(?:TIMESHEET|TIMECARD|TIME[-\\s]?ENTRY)[-\\s]?(?:NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "medium" },
  { kind: "TITLE_DEED_NUMBER", source: "\\b(?:TITLE|DEED)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "real-estate", tier: "contextual" },
  { kind: "TNT_TRACKING", source: "\\b(?:TNT[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{9}|[A-Z0-9]{13})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "TOLL_TAG_ID", source: "\\b(?:TOLL[-\\s]?TAG|E[-]?ZPASS|TRANSPONDER)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.608, category: "transportation", tier: "contextual" },
  { kind: "TONGA_NATIONAL_ID", source: "\\b(?:TONGA|TO)[-\\s]?(?:ID|NATIONAL\\s?ID)[-\\s]?[:#]?\\s*([A-Z0-9]{8,10})\\b", flags: "gi", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "TOURNAMENT_REGISTRATION_ID", source: "\\b(?:TOURNAMENT|BRACKET|REGISTRATION|REG)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "TRADING_ACCOUNT", source: "\\b(?:TRADING|BROKERAGE|STOCK)[-\\s]?(?:ACCOUNT|ACCT|A\\/C)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,14})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "medium" },
  { kind: "TRAINING_CERT_ID", source: "\\b(?:TRAINING|CERTIFICATION|CERT)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hr", tier: "contextual" },
  { kind: "TRANSACTION_ID", source: "\\b(?:TXN|TX|TRANS(?:ACTION)?)[-\\s]?(?:ID|NO|NUM(?:BER)?|REF)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.608, category: "financial", tier: "medium" },
  { kind: "TRANSCRIPT_ID", source: "\\b(?:TRANSCRIPT)[-\\s]?(?:ID|NUM(?:BER)?|NO|REF)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.858, category: "education", tier: "medium" },
  { kind: "TRAVEL_AGENCY_BOOKING", source: "\\b(?:TRAVEL|AGENCY|BOOKING|TRIP)[-\\s]?(?:REF|REFERENCE|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "hospitality", tier: "contextual" },
  { kind: "TRAVEL_DOCUMENT_NUMBER", source: "\\b(?:TRAVEL\\s+DOC(?:UMENT)?|TD)[:\\s#-]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0.-]?){4,13}[A-Z0-9])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "TRI_FACILITY_ID", source: "\\bTRI[-\\s]?(?:FACILITY|ID)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{11})\\b", flags: "gi", confidence: 0.409, category: "environmental", tier: "contextual" },
  { kind: "TRIAL_PARTICIPANT_ID", source: "\\b(?:PARTICIPANT|SUBJECT|TRIAL)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{1,2}[-]?\\d{4,6})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "medium" },
  { kind: "TRIP_ID", source: "\\b(?:TRIP|RIDE)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.608, category: "transportation", tier: "contextual" },
  { kind: "TSA_PRECHECK_NUMBER", source: "\\b(?:TSA|PRECHECK|KTN|KNOWN[- ]?TRAVELER)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{9,10})\\b", flags: "gi", confidence: 0.608, category: "hospitality", tier: "contextual" },
  { kind: "TURKEY_ID", source: "\\b([1-9]\\d{10})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "TURKMENISTAN_PASSPORT", source: "\\b([A-Z]\\d{7})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "TWILIO_API_KEY", source: "\\b(SK[a-z0-9]{32})\\b", flags: "g", confidence: 0.859, category: "technology", tier: "contextual" },
  { kind: "TWITCH_USERNAME", source: "\\bTWITCH[-\\s]?(?:USER|NAME|ID)?[-\\s]?[:#]?\\s*([a-zA-Z0-9_]{4,25})\\b", flags: "gi", confidence: 0.607, category: "other", tier: "contextual" },
  { kind: "TWITTER_USER_ID", source: "\\b(\\d{5,19})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "UAE_EMIRATES_ID", source: "\\b(784[-\\s]?\\d{4}[-\\s]?\\d{7}[-\\s]?\\d)\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "UBER_TRIP_ID", source: "\\bUBER[-\\s]?(?:TRIP|RIDE)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,24})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "UBEREATS_ORDER_ID", source: "\\bUBER[-\\s]?EATS[-\\s]?(?:ORDER|DELIVERY)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,20})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "UK_BANK_ACCOUNT_IBAN", source: "\\b(GB\\d{2}[\\s\\u00A0.-]?[A-Z]{4}[\\s\\u00A0.-]?\\d{14})\\b", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "UK_CHARITY_NUMBER", source: "\\b(?:Charity\\s+(?:No|Number|Registration|Reg)\\.?\\s*:?\\s*)?(\\d{6,7}(?:-\\d)?)\\b", flags: "gi", confidence: 0.408, category: "charitable", tier: "contextual" },
  { kind: "UK_LICENSE_PLATE", source: "\\b([A-Z]{2}\\d{2}\\s?[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "UK_SORT_CODE_ACCOUNT", source: "\\b(\\d{2}[\\s\\u00A0-]?\\d{2}[\\s\\u00A0-]?\\d{2}[\\s\\u00A0]?\\d{8})\\b", flags: "g", confidence: 0.859, category: "financial", tier: "high", validatorName: "validateSortCode" },
  { kind: "UKRAINIAN_INN", source: "\\bINN[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{10})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "UKRAINIAN_PASSPORT", source: "\\b([A-Z]{2}\\d{6})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "UNDERWRITER_ID", source: "\\b(?:UNDERWRITER|UW)[-\\s]?(?:ID|NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.607, category: "insurance", tier: "contextual" },
  { kind: "UNIVERSITY_ID", source: "\\b(?:UNIVERSITY|COLLEGE|UNI)[-\\s]?(?:ID|NUM(?:BER)?|NO)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.859, category: "education", tier: "contextual" },
  { kind: "UPS_TRACKING", source: "\\b(?:UPS[-\\s]?)?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(1Z[A-Z0-9]{16})\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "UPWORK_JOB_ID", source: "\\bUPWORK[-\\s]?(?:JOB|CONTRACT|PROJECT)[-\\s]?(?:ID|NO|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.608, category: "gig-economy", tier: "contextual" },
  { kind: "URL_WITH_AUTH", source: "\\b(?:https?|ftp):\\/\\/[a-zA-Z0-9._-]+:[a-zA-Z0-9._-]+@[^\\s]+\\b", flags: "g", confidence: 0.859, category: "network", tier: "medium" },
  { kind: "URUGUAY_CEDULA", source: "\\b(\\d{1}\\.\\d{3}\\.\\d{3}-\\d{1})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "US_EIN", source: "\\b(?:EIN|Tax\\s+ID|Federal\\s+Tax\\s+ID)\\.?\\s*:?\\s*(\\d{2}-\\d{7})\\b", flags: "gi", confidence: 0.859, category: "charitable", tier: "contextual" },
  { kind: "US_LICENSE_PLATE", source: "\\b(?:PLATE|LICENSE|TAG)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{3,8})\\b", flags: "gi", confidence: 0.607, category: "vehicles", tier: "contextual" },
  { kind: "USERNAME", source: "\\b(?:user(?:name)?|login)[:\\s]+([a-zA-Z0-9_-]{3,20})\\b", flags: "gi", confidence: 0.608, category: "personal", tier: "contextual" },
  { kind: "USPS_TRACKING", source: "\\b(?:USPS|US\\s?MAIL)[-\\s]?(?:TRACK(?:ING)?|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{20,22}|[A-Z]{2}\\d{9}US)\\b", flags: "gi", confidence: 0.409, category: "logistics", tier: "contextual" },
  { kind: "UST_ID", source: "\\bUST[-\\s]?(?:ID|NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "environmental", tier: "contextual" },
  { kind: "UTAH_LICENSE_PLATE", source: "\\b([A-Z]\\d{2}[A-Z]{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "UTILITY_BILL_ACCOUNT", source: "\\b(?:BILL|BILLING)[-\\s]?(?:ACCOUNT)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*(\\d{8,14})\\b", flags: "gi", confidence: 0.858, category: "telecoms", tier: "contextual" },
  { kind: "UTR_UK", source: "\\b(?:UTR|unique taxpayer reference)[:\\s#-]*((?:\\d[\\s\\u00A0.-]?){10})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "UZBEKISTAN_PASSPORT", source: "\\b([A-Z]{2}\\d{7})\\b", flags: "g", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "UZBEKISTAN_STIR", source: "\\bSTIR[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*(\\d{9})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "VACCINATION_ID", source: "\\b(?:VACCINE|VACCINATION|IMMUNIZATION)[-\\s]?(?:ID|RECORD|NO)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,15})\\b", flags: "gi", confidence: 0.858, category: "healthcare", tier: "contextual" },
  { kind: "VAT_NUMBER", source: "\\b(?:VAT|vat number)[:\\s#-]*([A-Z]{2}(?:[\\s\\u00A0.-]?[A-Z0-9]){7,12})\\b", flags: "gi", confidence: 0.609, category: "government", tier: "contextual" },
  { kind: "VEHICLE_INSURANCE_POLICY", source: "\\b(?:AUTO|VEHICLE|CAR)[-\\s]?(?:INSURANCE)?[-\\s]?(?:POLICY)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z]{2,4}\\d{6,10})\\b", flags: "gi", confidence: 0.858, category: "transportation", tier: "contextual" },
  { kind: "VENDOR_CODE", source: "\\bVEND(?:OR)?[-\\s]?(?:CODE)?[-\\s]?[:#]?\\s*([A-Z0-9]{4,10})\\b", flags: "gi", confidence: 0.607, category: "manufacturing", tier: "contextual" },
  { kind: "VENEZUELA_CEDULA", source: "\\b([VE]-\\d{1,8})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "VENEZUELA_RIF", source: "\\b([VEJG]-\\d{8,9}-\\d{1})\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "VERMONT_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "VIETNAM_CCCD", source: "\\b(\\d{12})\\b", flags: "g", confidence: 0.858, category: "government", tier: "contextual" },
  { kind: "VIN", source: "\\bVIN[-\\s]?[:#]?\\s*([A-HJ-NPR-Z0-9]{17})\\b", flags: "gi", confidence: 0.859, category: "transportation", tier: "contextual" },
  { kind: "VIN_NUMBER", source: "\\bVIN[-\\s\\u00A0]?(?:NO|NUM|NUMBER)?[-\\s\\u00A0]?[:#]?\\s*([A-HJ-NPR-Z0-9]{17})\\b", flags: "gi", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "VIRGINIA_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "VISA_MRZ", source: "V<[A-Z]{3}[A-Z<]{39}\\r?\\n[A-Z0-9<]{9}[0-9][A-Z]{3}[0-9]{6}[0-9][MF<][0-9]{6}[0-9][A-Z0-9<]{14}[0-9]", flags: "g", confidence: 0.86, category: "government", tier: "medium" },
  { kind: "VISA_NUMBER", source: "\\b(?:VISA)[:\\s#-]*([A-Z0-9](?:[A-Z0-9][\\s\\u00A0.-]?){6,10}[A-Z0-9])\\b", flags: "gi", confidence: 0.859, category: "government", tier: "contextual" },
  { kind: "VOLUNTEER_ID", source: "\\b(?:VOLUNTEER|VOL|V)[-_]?\\d{6,10}\\b", flags: "gi", confidence: 0.607, category: "charitable", tier: "contextual" },
  { kind: "WASHINGTON_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "WATER_QUALITY_CERTIFICATE", source: "\\bWATER[-\\s]?(?:QUALITY|CERT(?:IFICATE)?)[-\\s]?(?:NO|NUM|NUMBER)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.408, category: "environmental", tier: "contextual" },
  { kind: "WEST_VIRGINIA_LICENSE_PLATE", source: "\\b(\\d[A-Z]{2}\\d{3})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "WIRE_TRANSFER_DETAILS", source: "\\b(?:WIRE\\s+TO|TRANSFER\\s+TO|BENEFICIARY)[:\\s]+([A-Z0-9\\s,.-]{20,100})", flags: "gi", confidence: 0.859, category: "financial", tier: "contextual" },
  { kind: "WIRE_TRANSFER_REF", source: "\\b(?:WIRE|TRANSFER|REMITTANCE)[-\\s]?(?:REF(?:ERENCE)?|NO|NUM(?:BER)?|ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,20})\\b", flags: "gi", confidence: 0.858, category: "financial", tier: "medium" },
  { kind: "WISCONSIN_LICENSE_PLATE", source: "\\b([A-Z]{3}\\d{4})\\b", flags: "g", confidence: 0.608, category: "vehicles", tier: "contextual" },
  { kind: "WISHLIST_ID", source: "\\b(?:WISHLIST|WISH[-\\s]?LIST)[-\\s]?(?:ID)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,16})\\b", flags: "gi", confidence: 0.407, category: "retail", tier: "contextual" },
  { kind: "WORK_ORDER_NUMBER", source: "\\bW(?:ORK[-\\s]?)?O(?:RDER)?[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{6,12})\\b", flags: "gi", confidence: 0.608, category: "manufacturing", tier: "contextual" },
  { kind: "WORK_PERMIT", source: "\\b(?:WORK[-\\s]?PERMIT|VISA|H1B|GREEN[-\\s]?CARD|EAD)[-\\s]?(?:NO|NUM(?:BER)?)?[-\\s]?[:#]?\\s*([A-Z0-9]{8,15})\\b", flags: "gi", confidence: 0.859, category: "hr", tier: "medium" },
  { kind: "WYOMING_LICENSE_PLATE", source: "\\b(\\d{5})\\b", flags: "g", confidence: 0.607, category: "vehicles", tier: "contextual" },
  { kind: "XBOX_GAMERTAG", source: "\\b([a-zA-Z][a-zA-Z0-9 ]{2,14})\\b", flags: "g", confidence: 0.607, category: "gaming", tier: "contextual" },
  { kind: "YOUTUBE_CHANNEL_ID", source: "\\b(UC[a-zA-Z0-9_-]{22})\\b", flags: "g", confidence: 0.408, category: "gaming", tier: "contextual" },
  { kind: "ZIP_CODE_US", source: "\\b(\\d{5}(?:[\\s\\u00A0.-]\\d{4})?)\\b", flags: "g", confidence: 0.407, category: "contact", tier: "contextual" }
];
function luhnDigits(digits) {
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (Number.isNaN(d)) return false;
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}
function mod97(s) {
  let remainder = 0;
  for (let i = 0; i < s.length; i++) remainder = (remainder * 10 + parseInt(s[i], 10)) % 97;
  return remainder;
}
var VALIDATORS = {
  validateLuhn(raw) {
    const c = raw.replace(/[\s-]/g, "");
    return /^\d{13,19}$/.test(c) && luhnDigits(c);
  },
  validateIBAN(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, "").toUpperCase();
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(c)) return false;
    const lengths = {
      AD: 24,
      AE: 23,
      AL: 28,
      AT: 20,
      AZ: 28,
      BA: 20,
      BE: 16,
      BG: 22,
      BH: 22,
      BR: 29,
      CH: 21,
      CR: 21,
      CY: 28,
      CZ: 24,
      DE: 22,
      DK: 18,
      DO: 28,
      EE: 20,
      ES: 24,
      FI: 18,
      FO: 18,
      FR: 27,
      GB: 22,
      GE: 22,
      GI: 23,
      GL: 18,
      GR: 27,
      GT: 28,
      HR: 21,
      HU: 28,
      IE: 22,
      IL: 23,
      IS: 26,
      IT: 27,
      JO: 30,
      KW: 30,
      KZ: 20,
      LB: 28,
      LI: 21,
      LT: 20,
      LU: 20,
      LV: 21,
      MC: 27,
      MD: 24,
      ME: 22,
      MK: 19,
      MR: 27,
      MT: 31,
      MU: 30,
      NL: 18,
      NO: 15,
      PK: 24,
      PL: 28,
      PS: 29,
      PT: 25,
      QA: 29,
      RO: 24,
      RS: 22,
      SA: 24,
      SE: 24,
      SI: 19,
      SK: 24,
      SM: 27,
      TN: 24,
      TR: 26,
      UA: 29,
      VA: 22,
      VG: 24,
      XK: 20
    };
    const len = lengths[c.substring(0, 2)];
    if (!len || c.length !== len) return false;
    const rearranged = c.substring(4) + c.substring(0, 4);
    const numeric = rearranged.replace(/[A-Z]/g, (ch) => (ch.charCodeAt(0) - 55).toString());
    return mod97(numeric) === 1;
  },
  validateNINO(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, "").toUpperCase();
    if (!/^[A-CEGHJ-PR-TW-Z]{2}[0-9]{6}[A-D]$/.test(c)) return false;
    return !["BG", "GB", "NK", "KN", "TN", "NT", "ZZ"].includes(c.substring(0, 2));
  },
  validateNHS(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, "");
    if (!/^\d{10}$/.test(c)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(c[i], 10) * (10 - i);
    const check = 11 - sum % 11;
    const expected = check === 11 ? 0 : check;
    return expected === parseInt(c[9], 10) && check !== 10;
  },
  validateUKPassport(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, "").toUpperCase();
    return /^\d{9}$/.test(c);
  },
  validateSSN(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, "");
    if (!/^\d{9}$/.test(c)) return false;
    const area = c.substring(0, 3), group = c.substring(3, 5), serial = c.substring(5, 9);
    if (area === "000" || area === "666" || parseInt(area, 10) >= 900) return false;
    if (group === "00" || serial === "0000") return false;
    return !["111111111", "222222222", "333333333", "444444444", "555555555", "666666666", "777777777", "888888888", "999999999"].includes(c);
  },
  validateSortCode(raw) {
    return /^\d{6}$/.test(raw.replace(/[\s-]/g, ""));
  },
  validateRoutingNumber(raw) {
    const c = raw.replace(/[\s\u00A0.-]/g, "");
    if (!/^\d{9}$/.test(c)) return false;
    const d = c.split("").map(Number);
    return (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8])) % 10 === 0;
  },
  validateSWIFTBIC(raw) {
    const c = raw.replace(/\s/g, "").toUpperCase();
    return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(c);
  },
  validateCanadianSIN(raw) {
    const c = raw.replace(/[\s-]/g, "");
    if (!/^\d{9}$/.test(c) || c === "000000000") return false;
    return luhnDigits(c);
  },
  validateAustralianTFN(raw) {
    const c = raw.replace(/\s/g, "");
    if (!/^\d{8}$/.test(c) && !/^\d{9}$/.test(c)) return false;
    const weights = c.length === 8 ? [1, 4, 3, 7, 5, 8, 6, 9] : [1, 4, 3, 7, 5, 8, 6, 9, 10];
    let sum = 0;
    for (let i = 0; i < c.length; i++) sum += parseInt(c[i], 10) * weights[i];
    return sum % 11 === 0;
  }
};
function runValidator(name, raw) {
  const fn = VALIDATORS[name];
  return fn ? fn(raw) : true;
}
var FALSE_POSITIVE_RULES = [
  { patternType: ["PHONE", "PHONE_UK", "PHONE_US"], matcher: (value, context) => {
    if (/\b(version|v|ver|release|build)\s*[:\s]*/i.test(context)) return true;
    if (/^\d{1,2}\.\d{1,2}\.\d{1,4}$/.test(value.replace(/[\s()-]/g, ""))) return true;
    return false;
  } },
  { patternType: ["PHONE", "PHONE_UK", "PHONE_US"], matcher: (value, context) => {
    if (/\b(date|born|birth|dob|created|updated|on|since|until|before|after)\s*[:\s]*/i.test(context)) return true;
    const datePatterns = [
      /^\d{2}[-/]\d{2}[-/]\d{4}$/,
      /^\d{4}[-/]\d{2}[-/]\d{2}$/,
      /^\d{2}[-/]\d{2}[-/]\d{2}$/
    ];
    const cleaned = value.replace(/[\s()]/g, "");
    return datePatterns.some((pattern) => pattern.test(cleaned));
  } },
  { patternType: ["PHONE", "ACCOUNT", "ID"], matcher: (value, context) => {
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) return true;
    return /\b(ip|address|server|host|network|subnet)\s*[:\s]*/i.test(context);
  } },
  { patternType: ["PHONE", "NUMBER"], matcher: (value, context) => {
    return /\b(cm|mm|km|m|ft|in|inch|meter|mile|kg|lb|oz|gram|litre|liter|ml|gb|mb|kb)\s*$/i.test(context + " " + value) || /\b(size|width|height|length|weight|distance|volume|capacity|dimension)\s*[:\s]*/i.test(context);
  } },
  { patternType: ["PHONE", "ID", "NUMBER"], matcher: (value) => {
    const yearPattern = /^(19|20)\d{2}$/;
    const cleaned = value.replace(/[\s()-]/g, "");
    return yearPattern.test(cleaned);
  } },
  { patternType: ["PHONE", "ACCOUNT", "NUMBER"], matcher: (value, context) => {
    if (/\b(price|cost|amount|total|subtotal|fee|charge|payment|\$|£|€|¥|USD|GBP|EUR)\s*[:\s]*/i.test(context)) return true;
    return /^\d{1,6}\.\d{2}$/.test(value.replace(/[\s,]/g, ""));
  } },
  { patternType: ["PHONE", "ID", "NUMBER"], matcher: (value, context) => {
    return /\bport[:\s]*$/i.test(context) && /^([1-9]\d{0,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/.test(value);
  } },
  { patternType: ["PHONE", "NUMBER"], matcher: (value, context) => {
    const fullContext = context + " " + value;
    return /\d+(\.\d+)?\s*(percent|percentage|%)/i.test(fullContext);
  } },
  { patternType: ["NAME", "EMAIL"], matcher: (value, context) => {
    if (/\b(foo|bar|baz|qux|example|test|demo|sample|placeholder|dummy|mock)\b/i.test(value.toLowerCase())) return true;
    return /(\/\/|\/\*|\*|#|--|<!--|;)/.test(context);
  } },
  { patternType: ["EMAIL", "NAME", "PHONE", "ADDRESS"], matcher: (value) => {
    return [
      /test\d*@/i,
      /example\.com$/i,
      /foo@/i,
      /bar@/i,
      /johndoe/i,
      /janedoe/i,
      /^xxx+$/i,
      /^000[-\s]*000[-\s]*000/i
    ].some((pattern) => pattern.test(value));
  } },
  { patternType: ["NAME"], matcher: (_value, context) => {
    return /\b(the|a|an)\s*$/i.test(context);
  } },
  { patternType: ["INSTAGRAM_USERNAME", "TIKTOK_USERNAME"], matcher: (value, _context) => {
    return (/* @__PURE__ */ new Set([
      "its",
      "and",
      "the",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "has",
      "him",
      "his",
      "how",
      "man",
      "new",
      "now",
      "old",
      "see",
      "way",
      "who",
      "boy",
      "did",
      "get",
      "let",
      "put",
      "say",
      "she",
      "too",
      "use",
      "latest",
      "design",
      "deliver",
      "flexible",
      "personalized",
      "entertainment",
      "experience",
      "powered",
      "portable",
      "projector",
      "designed",
      "announced",
      "launch",
      "global",
      "range",
      "spaces",
      "more",
      "cross",
      "wide"
    ])).has(value.toLowerCase());
  } },
  { patternType: ["NAME"], matcher: (value, context) => {
    const keywords = [
      "function",
      "const",
      "let",
      "var",
      "class",
      "interface",
      "type",
      "enum",
      "public",
      "private",
      "protected",
      "static",
      "async",
      "await",
      "return",
      "import",
      "export",
      "from",
      "default",
      "extends",
      "implements"
    ];
    const valueLower = value.toLowerCase();
    if (keywords.includes(valueLower)) return true;
    return /\b(def|fn|func|method|prop|attr)\s*[:\s]*/i.test(context);
  } },
  { patternType: ["EMAIL"], matcher: (value) => {
    const commonDomains = [
      "localhost",
      "example.com",
      "example.org",
      "example.net",
      "test.com",
      "demo.com",
      "sample.com",
      "invalid.com",
      "domain.com"
    ];
    const domain = value.split("@")[1]?.toLowerCase();
    return commonDomains.includes(domain);
  } },
  { patternType: ["ACCOUNT", "CARD"], matcher: (value, _context) => {
    if (/^0+$/.test(value.replace(/[\s-]/g, ""))) return true;
    const cleaned = value.replace(/[\s-]/g, "");
    if (/^(\d)\1+$/.test(cleaned)) return true;
    if (/^(0123456789|1234567890|9876543210)/.test(cleaned)) return true;
    return false;
  } },
  { patternType: ["PHONE", "ID", "NUMBER"], matcher: (_value, context) => {
    return /\b(timestamp|time|epoch|unix|millis|seconds|created.at|updated.at)\s*[:\s]*/i.test(context);
  } }
];
function isLocalFalsePositive(value, type) {
  for (const r of FALSE_POSITIVE_RULES) {
    if (!r.patternType.includes(type)) continue;
    try {
      if (r.matcher(value, "")) return true;
    } catch {
    }
  }
  return false;
}

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
function withGlobal(re) {
  return re.flags.includes("g") ? re : new RegExp(re.source, re.flags + "g");
}
var _localDetectorCache = /* @__PURE__ */ new Map();
function buildLocalDetectors(level) {
  const cached = _localDetectorCache.get(level);
  if (cached) return cached;
  const core = DEFAULT_DETECTORS.map((d) => ({ ...d, regex: withGlobal(d.regex) }));
  const extra = LOCAL_DETECTORS.filter(
    (d) => level === "aggressive" || d.tier !== "contextual"
  ).map((d) => {
    const validatorName = d.validatorName;
    return {
      kind: d.kind,
      regex: withGlobal(new RegExp(d.source, d.flags)),
      confidence: d.confidence,
      normalize: (v) => v,
      ...validatorName ? { validate: (raw) => runValidator(validatorName, raw) } : {}
    };
  });
  const detectors = [...core, ...extra];
  _localDetectorCache.set(level, detectors);
  return detectors;
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
  if (getAuthMode(ctx) !== "apiKey") return;
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
function detectMatches(text, detectors, opts = {}) {
  const matches = [];
  for (const detector of detectors) {
    const re = opts.preserveFlags ? detector.regex : new RegExp(detector.regex.source, "g");
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
async function handleTokenizeLocal(ctx, i) {
  const item = ctx.getInputData()[i];
  const textField = ctx.getNodeParameter("textField", i);
  const level = ctx.getNodeParameter("detectionLevel", i, "standard");
  const sessionIdParam = ctx.getNodeParameter("sessionId", i, "").trim();
  const sessionId = sessionIdParam || crypto.randomUUID();
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
  const detectors = buildLocalDetectors(level);
  const spans = removeOverlaps(
    detectMatches(text, detectors, { preserveFlags: true }).filter(
      (s) => !isLocalFalsePositive(s.value, s.kind)
    )
  ).filter((s) => s.length > 0 && s.index >= 0 && s.index + s.length <= text.length).map((s) => ({ ...s, value: text.slice(s.index, s.index + s.length) }));
  const vault = new WorkflowStaticDataVault(ctx, sessionId);
  let tokenizedText = text;
  const entities = [];
  if (spans.length > 0) {
    const batched = await vault.findOrCreateBatch(spans.map((s) => ({ kind: s.kind, value: s.value })));
    const withTokens = spans.map((s, idx) => ({ ...s, token: batched[idx]?.token }));
    for (const s of [...withTokens].sort((a, b) => b.index - a.index)) {
      if (s.token == null) continue;
      tokenizedText = tokenizedText.slice(0, s.index) + s.token + tokenizedText.slice(s.index + s.length);
    }
    for (const s of withTokens) {
      if (s.token == null) continue;
      entities.push({ token: s.token, kind: s.kind, confidence: s.confidence, source: s.source });
    }
    entities.sort((a, b) => a.token.localeCompare(b.token));
  }
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
      risk: null,
      flaggedForReview: false
    }
  };
}
async function handleTokenize(ctx, i, baseUrl) {
  if (getAuthMode(ctx) === "local") return handleTokenizeLocal(ctx, i);
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
  const authMode = getAuthMode(ctx);
  let sessionId = ctx.getNodeParameter("sessionId", i, "").trim();
  if (authMode === "local" && !sessionId) {
    const upstream = item.json.privent;
    sessionId = typeof upstream?.sessionId === "string" ? upstream.sessionId : "";
    if (!sessionId) {
      throw new import_n8n_workflow4.NodeOperationError(
        ctx.getNode(),
        "No session id \u2014 add a Privent Tokenize node upstream, or set Session ID.",
        { itemIndex: i }
      );
    }
  }
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
  const vault = authMode !== "apiKey" ? new WorkflowStaticDataVault(ctx, sessionId) : new N8nHttpVault(ctx, sessionId, baseUrl);
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
          },
          {
            name: "Local (No Backend)",
            value: "local",
            description: "No API key. Tokenize and Detokenize run entirely inside n8n with local regex detection \u2014 your data never leaves your n8n instance."
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
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { authentication: ["local"] } },
        options: [
          { name: "Tokenize", value: "tokenize" },
          { name: "Detokenize", value: "detokenize" }
        ],
        default: "tokenize"
      },
      // ── Operations (one per resource) ───────────────────────────────────
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["session"] } },
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
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["riskCheck"] } },
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
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["session"], operation: ["open"] } }
      },
      {
        displayName: "Session ID",
        name: "sessionId",
        type: "string",
        default: "",
        required: true,
        description: "A stable string that identifies this session",
        displayOptions: {
          show: { authentication: ["apiKey", "tokenless"], resource: ["session"], operation: ["open"], sessionIdMode: ["manual"] }
        }
      },
      {
        displayName: "Agent Name",
        name: "agentName",
        type: "string",
        default: "",
        description: "Logical agent identifier written to the output item and forwarded to downstream Privent nodes (via their Agent Name expression default). Appears in every audit event as metadata.agent_name.",
        hint: 'Optional. Example: "support-bot", "billing-agent". Leave empty if not modeling distinct agents.',
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["session"], operation: ["open"] } }
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
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["session"], operation: ["open"] } }
      },
      {
        displayName: "Webhook Node Name",
        name: "webhookNodeName",
        type: "string",
        default: "Webhook",
        description: "Optional. Name of an upstream Webhook trigger node. When set, the SDK auto-extracts client IP and User-Agent from its headers and writes them to agent_sessions (trigger_principal_ip, trigger_principal_user_agent).",
        hint: "Leave default if your workflow does not start with a Webhook trigger; parse failures are silent.",
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["session"], operation: ["open"] } }
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
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["tokenize"], operation: ["tokenize"] } }
      },
      {
        displayName: "Session ID",
        name: "sessionId",
        type: "string",
        default: "",
        description: "Optional. Scopes tokens so Detokenize can reverse them. In local mode no Privent Session node is needed.",
        hint: "Leave empty to auto-manage the session \u2014 a fresh ID is generated and written to the output item.",
        displayOptions: { show: { authentication: ["local"], resource: ["tokenize"], operation: ["tokenize"] } }
      },
      {
        displayName: "Detection Level",
        name: "detectionLevel",
        type: "options",
        options: [
          {
            name: "Standard (Recommended)",
            value: "standard",
            description: "Structured PII with high precision: emails, phones, financial, government IDs with checksums, secrets, crypto. Low false positives."
          },
          {
            name: "Aggressive",
            value: "aggressive",
            description: "Also masks names, addresses and bare-number IDs. More false positives \u2014 review the output before sending it downstream."
          }
        ],
        default: "standard",
        description: "How broadly local regex detection masks values. Local mode runs entirely inside n8n \u2014 no network.",
        displayOptions: { show: { authentication: ["local"], resource: ["tokenize"], operation: ["tokenize"] } }
      },
      {
        displayName: "Trace ID",
        name: "traceId",
        type: "string",
        default: '={{ $("Privent Session").item.json.traceId }}',
        description: "Correlation ID from the upstream Privent Session node. Links this event to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.",
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["tokenize"], operation: ["tokenize"] } }
      },
      {
        displayName: "Agent Name",
        name: "agentName",
        type: "string",
        default: '={{ $("Privent Session").item.json.agentName }}',
        description: "Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.",
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["tokenize"], operation: ["tokenize"] } }
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
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["tokenize"], operation: ["tokenize"] } }
      },
      {
        displayName: "Flag for Review Above Risk Score",
        name: "reviewThreshold",
        type: "number",
        typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
        default: 0.9,
        description: "When Privent Cloud returns a risk score at or above this value, the item is flagged with privent.flaggedForReview = true. The workflow continues \u2014 use an IF or Switch node to route flagged items.",
        displayOptions: {
          show: { authentication: ["apiKey", "tokenless"], resource: ["tokenize"], operation: ["tokenize"] },
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
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["detokenize"], operation: ["detokenize"] } }
      },
      {
        displayName: "Session ID",
        name: "sessionId",
        type: "string",
        default: "",
        description: "Optional. Must match the session used by the upstream local Tokenize. Leave empty to read it from the item the Tokenize node produced.",
        hint: "Leave empty when the local Tokenize node is directly upstream \u2014 its session ID rides on the item.",
        displayOptions: { show: { authentication: ["local"], resource: ["detokenize"], operation: ["detokenize"] } }
      },
      {
        displayName: "Trace ID",
        name: "traceId",
        type: "string",
        default: '={{ $("Privent Session").item.json.traceId }}',
        description: "Correlation ID from the upstream Privent Session node. Links this event to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.",
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["detokenize"], operation: ["detokenize"] } }
      },
      {
        displayName: "Agent Name",
        name: "agentName",
        type: "string",
        default: '={{ $("Privent Session").item.json.agentName }}',
        description: "Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.",
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["detokenize"], operation: ["detokenize"] } }
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
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["detokenize"], operation: ["detokenize"] } }
      },
      // ── riskCheck ───────────────────────────────────────────────────────
      {
        displayName: "Text Field",
        name: "textField",
        type: "string",
        default: "text",
        required: true,
        description: "Name of the input item property containing the text to score",
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["riskCheck"], operation: ["score"] } }
      },
      {
        displayName: "Trace ID",
        name: "traceId",
        type: "string",
        default: '={{ $("Privent Session").item.json.traceId }}',
        description: "Correlation ID from the upstream Privent Session node. Links this risk check to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.",
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["riskCheck"], operation: ["score"] } }
      },
      {
        displayName: "Agent Name",
        name: "agentName",
        type: "string",
        default: '={{ $("Privent Session").item.json.agentName }}',
        description: "Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.",
        displayOptions: { show: { authentication: ["apiKey", "tokenless"], resource: ["riskCheck"], operation: ["score"] } }
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
    const baseUrl = getAuthMode(this) === "local" ? "" : await getPriventBaseUrl(this);
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
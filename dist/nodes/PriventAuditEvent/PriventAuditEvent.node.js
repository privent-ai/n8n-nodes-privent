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

// src/nodes/PriventAuditEvent/PriventAuditEvent.node.ts
var PriventAuditEvent_node_exports = {};
__export(PriventAuditEvent_node_exports, {
  PriventAuditEvent: () => PriventAuditEvent
});
module.exports = __toCommonJS(PriventAuditEvent_node_exports);
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

// node_modules/@priventai/core/dist/index.js
var TRACER_VERSION = (() => {
  const v = "1.1.1";
  return typeof v === "string" && v.length > 0 ? v : "0.1.0";
})();
var DEFAULT_TTL_MS = 60 * 60 * 1e3;
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

// src/nodes/PriventAuditEvent/PriventAuditEvent.node.ts
var PriventAuditEvent = class {
  description = {
    displayName: "Privent Audit Event",
    name: "priventAuditEvent",
    icon: "file:privent.png",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["eventType"]}}',
    description: "Emits a Privent audit event for non-tokenization steps (LLM call cost tracking, policy decisions, egress, errors). Place after an HTTP Request to an LLM provider to record provider/model/token usage; the backend computes USD cost from your org's ModelPricing table.",
    defaults: { name: "Privent Audit Event" },
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
        description: "Session ID from the upstream Privent Session node"
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
        description: "Audit event type. LLM Call triggers backend cost calculation from ModelPricing."
      },
      {
        displayName: "LLM Model",
        name: "model",
        type: "resourceLocator",
        default: { mode: "list", value: "" },
        required: true,
        description: "Model used for this LLM call. Pick from your org's priced models (popular first) or enter a custom one as provider|model. The provider is taken from the selection.",
        displayOptions: { show: { eventType: ["llm_call"] } },
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
        displayOptions: { show: { eventType: ["llm_call"] } }
      },
      {
        displayName: "Completion Tokens",
        name: "completionTokens",
        type: "string",
        default: "={{$json.usage.completion_tokens}}",
        description: "n8n expression resolving to the completion token count",
        displayOptions: { show: { eventType: ["llm_call"] } }
      },
      {
        displayName: "Extra Metadata (JSON)",
        name: "extraMetadata",
        type: "json",
        default: "{}",
        description: "Optional. Merged into the audit event metadata. For event types other than LLM Call, use this to attach event-specific fields (e.g. policy decision rationale)."
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
    const items = this.getInputData();
    const baseUrl = await getPriventBaseUrl(this);
    const triggerMode = safeTriggerMode(this);
    const frameworkVersion = safeFrameworkVersion();
    const out = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const sessionId = this.getNodeParameter("sessionId", i).trim();
        if (!sessionId) {
          throw new import_n8n_workflow.NodeOperationError(this.getNode(), "Session ID is required", {
            itemIndex: i
          });
        }
        const traceIdParam = this.getNodeParameter("traceId", i, "");
        const agentNameParam = this.getNodeParameter("agentName", i, "");
        const eventType = this.getNodeParameter("eventType", i);
        const extraRaw = this.getNodeParameter("extraMetadata", i, "{}");
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
          const selected = this.getNodeParameter("model", i, "", { extractValue: true }).trim();
          const sep = selected.indexOf("|");
          const provider = sep >= 0 ? selected.slice(0, sep).trim().toLowerCase() : "";
          const model = sep >= 0 ? selected.slice(sep + 1).trim() : selected;
          const promptTokensRaw = this.getNodeParameter("promptTokens", i);
          const completionTokensRaw = this.getNodeParameter("completionTokens", i);
          const promptTokens = Number(promptTokensRaw);
          const completionTokens = Number(completionTokensRaw);
          if (provider) metadata.provider = provider;
          if (model) metadata.model = model;
          metadata.prompt_tokens = Number.isFinite(promptTokens) && promptTokens > 0 ? Math.trunc(promptTokens) : 0;
          metadata.completion_tokens = Number.isFinite(completionTokens) && completionTokens > 0 ? Math.trunc(completionTokens) : 0;
        }
        const ctx = resolveContext(this, sessionId, traceIdParam, agentNameParam);
        const node = this.getNode();
        if (triggerMode !== void 0) metadata.trigger_mode = triggerMode;
        if (frameworkVersion !== void 0) metadata.framework_version = frameworkVersion;
        const event = {
          type: eventType,
          traceId: ctx.traceId,
          sessionId,
          timestamp: Date.now(),
          framework: "n8n",
          workflowId: ctx.workflowId,
          nodeId: node.id,
          metadata: buildAuditMetadata(ctx, node, metadata)
        };
        void auditLog(this, event, baseUrl);
        out.push({
          json: {
            ...item.json,
            privent: {
              sessionId,
              auditEventEmitted: true,
              eventType
            }
          },
          pairedItem: { item: i }
        });
      } catch (err) {
        if (this.continueOnFail()) {
          out.push({
            json: { error: err.message },
            pairedItem: { item: i }
          });
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
  PriventAuditEvent
});
//# sourceMappingURL=PriventAuditEvent.node.js.map
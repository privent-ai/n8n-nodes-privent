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

// nodes/PriventHandoff/PriventHandoff.node.ts
var PriventHandoff_node_exports = {};
__export(PriventHandoff_node_exports, {
  PriventHandoff: () => PriventHandoff
});
module.exports = __toCommonJS(PriventHandoff_node_exports);
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
  const v = "1.1.4";
  return typeof v === "string" && v.length > 0 ? v : "0.1.0";
})();
var DEFAULT_TTL_MS = 60 * 60 * 1e3;
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

// nodes/PriventHandoff/PriventHandoff.node.ts
var PriventHandoff = class {
  description = {
    displayName: "Privent Handoff",
    name: "priventHandoff",
    icon: "file:privent.png",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["targetKind"]}}',
    description: "Marks an explicit agent \u2192 agent (or agent \u2192 external sink) handoff. Backend Trust Map aggregator turns each event into an AgentInteraction edge.",
    defaults: { name: "Privent Handoff" },
    inputs: [import_n8n_workflow.NodeConnectionTypes.Main],
    outputs: [import_n8n_workflow.NodeConnectionTypes.Main],
    credentials: [{ name: "priventApi", required: true }],
    properties: [
      {
        displayName: "Session ID",
        name: "sessionId",
        type: "string",
        default: '={{ $("Privent Session").item.json.sessionId }}',
        required: true,
        description: 'Session ID from the upstream Privent Session node \u2014 the "from" side of the handoff edge.'
      },
      {
        displayName: "Trace ID",
        name: "traceId",
        type: "string",
        default: '={{ $("Privent Session").item.json.traceId }}',
        description: "Correlation ID from the upstream Privent Session node. Leave as-is; a fresh ID is generated if no Session is upstream."
      },
      {
        displayName: "From Agent Name",
        name: "agentName",
        type: "string",
        default: '={{ $("Privent Session").item.json.agentName }}',
        required: true,
        description: 'Canonical name of the source agent, from the upstream Privent Session node. Required \u2014 identifies the "from" side of the handoff edge.'
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
        default: "agent"
      },
      {
        displayName: "Target Agent Name",
        name: "toAgentName",
        type: "string",
        default: "",
        required: true,
        description: "Canonical agent name of the downstream agent. Must match the agentName the downstream PriventSession will emit.",
        hint: 'Example: "Translator", "billing-agent". Resolves to Agent.id post-ingest.',
        displayOptions: { show: { targetKind: ["agent"] } }
      },
      {
        displayName: "External Sink ID",
        name: "toSinkId",
        type: "string",
        default: "",
        required: true,
        description: "Opaque identifier for an external sink (e.g. webhook URL hash, partner ID).",
        displayOptions: { show: { targetKind: ["sink"] } }
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
        description: "Categorises the handoff for the Trust Map graph filters"
      },
      {
        displayName: "Payload Token Count",
        name: "payloadTokenCount",
        type: "number",
        default: 0,
        description: "Optional. Token volume hint for blast-radius math in the Trust Map (set 0 to omit).",
        typeOptions: { minValue: 0 }
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
        const targetKind = this.getNodeParameter("targetKind", i, "agent");
        const reason = this.getNodeParameter("reason", i, "delegation");
        const payloadTokenCount = Number(
          this.getNodeParameter("payloadTokenCount", i, 0) ?? 0
        );
        const sessionIdParam = this.getNodeParameter("sessionId", i, "").trim();
        const traceIdParam = this.getNodeParameter("traceId", i, "");
        const agentNameParam = this.getNodeParameter("agentName", i, "");
        const ctx = resolveContext(this, sessionIdParam, traceIdParam, agentNameParam);
        const node = this.getNode();
        if (!ctx.sessionId) {
          throw new import_n8n_workflow.NodeOperationError(
            this.getNode(),
            "Privent Handoff requires an upstream Privent Session node \u2014 sessionId is missing.",
            { itemIndex: i }
          );
        }
        if (!ctx.agentName) {
          throw new import_n8n_workflow.NodeOperationError(
            this.getNode(),
            "Privent Handoff requires the upstream Privent Session to have an Agent Name set.",
            { itemIndex: i }
          );
        }
        let toAgentName;
        let toSinkId;
        if (targetKind === "agent") {
          toAgentName = this.getNodeParameter("toAgentName", i, "").trim();
          if (!toAgentName) {
            throw new import_n8n_workflow.NodeOperationError(
              this.getNode(),
              "Target Agent Name is required when Target Kind = Agent",
              { itemIndex: i }
            );
          }
        } else {
          toSinkId = this.getNodeParameter("toSinkId", i, "").trim();
          if (!toSinkId) {
            throw new import_n8n_workflow.NodeOperationError(
              this.getNode(),
              "External Sink ID is required when Target Kind = External Sink",
              { itemIndex: i }
            );
          }
        }
        const handoffEvent = {
          type: "agent_handoff",
          traceId: ctx.traceId,
          sessionId: ctx.sessionId,
          timestamp: Date.now(),
          framework: "n8n",
          workflowId: ctx.workflowId,
          nodeId: node.id,
          nodeName: node.name,
          fromAgentName: ctx.agentName,
          ...toAgentName != null ? { targetAgentName: toAgentName } : {},
          ...toSinkId != null ? { targetSinkId: toSinkId } : {},
          reason,
          ...Number.isFinite(payloadTokenCount) && payloadTokenCount > 0 ? { payloadTokenCount } : {},
          // v1 (n8n linear flows) always 1. LangGraph/CrewAI adapters will fill
          // parent_event_id/branch_id/hop_depth for non-linear topologies.
          hopDepth: 1,
          metadata: buildAuditMetadata(ctx, node, {
            ...triggerMode !== void 0 ? { trigger_mode: triggerMode } : {}
          })
        };
        void auditLog(this, handoffEvent, baseUrl);
        out.push({
          json: {
            ...item.json,
            privent: {
              handoff: true,
              fromAgentName: ctx.agentName,
              toAgentName: toAgentName ?? null,
              toSinkId: toSinkId ?? null,
              reason
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
        throw err;
      }
    }
    return [out];
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PriventHandoff
});
//# sourceMappingURL=PriventHandoff.node.js.map
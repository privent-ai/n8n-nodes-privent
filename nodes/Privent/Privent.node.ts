import type {
  IDataObject,
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeListSearchResult,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { getPriventBaseUrl } from '../../shared/privent-http.js';
import { handleSession } from './operations/session.js';
import { handleTokenize } from './operations/tokenize.js';
import { handleDetokenize } from './operations/detokenize.js';
import { executeRiskCheck } from './operations/riskCheck.js';
import { handleAudit } from './operations/audit.js';
import { handleHandoff } from './operations/handoff.js';

type PerItemHandler = (
  ctx: IExecuteFunctions,
  i: number,
  baseUrl: string,
) => Promise<IDataObject>;

const PER_ITEM_HANDLERS: Record<string, PerItemHandler> = {
  session: handleSession,
  tokenize: handleTokenize,
  detokenize: handleDetokenize,
  audit: handleAudit,
  handoff: handleHandoff,
};

/**
 * Single Privent node (resource → operation). Each resource is one of the
 * former standalone nodes (Session/Tokenize/Detokenize/Risk Check/Audit/Handoff);
 * the per-item logic lives in `./operations/<resource>.ts`. One regular node per
 * package is what n8n Cloud verification expects.
 */
export class Privent implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Privent',
    name: 'privent',
    icon: 'file:privent.png',
    group: ['transform'],
    version: 1,
    usableAsTool: true,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      'Privent DLP: session-scoped tokenization, detokenization, risk scoring, audit events and agent handoffs for AI agent workflows.',
    defaults: { name: 'Privent' },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      { name: 'priventApi', required: true, displayOptions: { show: { authentication: ['apiKey'] } } },
      { name: 'priventVisitorApi', required: true, displayOptions: { show: { authentication: ['tokenless'] } } },
    ],
    properties: [
      {
        displayName: 'Authentication',
        name: 'authentication',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'API Key',
            value: 'apiKey',
            description:
              'Full Privent: vault tokenization, audit, handoff and risk scoring. Requires a Privent API key.',
          },
          {
            name: 'Tokenless (Visitor)',
            value: 'tokenless',
            description:
              'No API key — in-memory tokenization + risk scoring via an anonymous visitor id. The backend must have visitor auth enabled.',
          },
        ],
        default: 'apiKey',
      },
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { authentication: ['apiKey'] } },
        options: [
          { name: 'Session', value: 'session' },
          { name: 'Tokenize', value: 'tokenize' },
          { name: 'Detokenize', value: 'detokenize' },
          { name: 'Risk Check', value: 'riskCheck' },
          { name: 'Audit', value: 'audit' },
          { name: 'Handoff', value: 'handoff' },
        ],
        default: 'tokenize',
      },
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { authentication: ['tokenless'] } },
        options: [
          { name: 'Session', value: 'session' },
          { name: 'Tokenize', value: 'tokenize' },
          { name: 'Detokenize', value: 'detokenize' },
          { name: 'Risk Check', value: 'riskCheck' },
        ],
        default: 'tokenize',
      },

      // ── Operations (one per resource) ───────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['session'] } },
        options: [
          {
            name: 'Open',
            value: 'open',
            action: 'Open a session',
            description:
              'Opens a Privent session vault at the start of your workflow. Place this node before any Tokenize operations. The sessionId output must be passed to all downstream Privent nodes.',
          },
        ],
        default: 'open',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['tokenize'] } },
        options: [
          {
            name: 'Tokenize',
            value: 'tokenize',
            action: 'Tokenize sensitive text',
            description:
              'Replaces sensitive values with reversible [KIND_NNN] placeholders before the text reaches an LLM or external service',
          },
        ],
        default: 'tokenize',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['detokenize'] } },
        options: [
          {
            name: 'Detokenize',
            value: 'detokenize',
            action: 'Detokenize text',
            description:
              '⚠ Agent-reachable as a tool: an agent could un-mask data with this operation. Use Strict Mode + Trusted Sinks to control egress. Resolves [KIND_NNN] placeholders back to their original values before data leaves the workflow.',
          },
        ],
        default: 'detokenize',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['riskCheck'] } },
        options: [
          {
            name: 'Score',
            value: 'score',
            action: 'Score text risk',
            description:
              'Scores text for data-leak risk using Privent ML. Returns risk_score (0–1), risk_level, and per-category probabilities.',
          },
        ],
        default: 'score',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { authentication: ['apiKey'], resource: ['audit'] } },
        options: [
          {
            name: 'Emit',
            value: 'emit',
            action: 'Emit an audit event',
            description:
              'Emits a Privent audit event for non-tokenization steps (LLM call cost tracking, policy decisions, egress, errors)',
          },
        ],
        default: 'emit',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { authentication: ['apiKey'], resource: ['handoff'] } },
        options: [
          {
            name: 'Record',
            value: 'record',
            action: 'Record an agent handoff',
            description:
              'Marks an explicit agent → agent (or agent → external sink) handoff for the Trust Map',
          },
        ],
        default: 'record',
      },

      // ── session ─────────────────────────────────────────────────────────
      {
        displayName: 'Session ID Mode',
        name: 'sessionIdMode',
        type: 'options',
        options: [
          {
            name: 'Auto-Generate (Recommended)',
            value: 'auto',
            description: 'A new UUID is generated for each workflow execution',
          },
          {
            name: 'Manual',
            value: 'manual',
            description: 'Supply your own session ID (useful for resuming a session)',
          },
        ],
        default: 'auto',
        displayOptions: { show: { resource: ['session'], operation: ['open'] } },
      },
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        default: '',
        required: true,
        description: 'A stable string that identifies this session',
        displayOptions: {
          show: { resource: ['session'], operation: ['open'], sessionIdMode: ['manual'] },
        },
      },
      {
        displayName: 'Agent Name',
        name: 'agentName',
        type: 'string',
        default: '',
        description:
          'Logical agent identifier written to the output item and forwarded to downstream Privent nodes (via their Agent Name expression default). Appears in every audit event as metadata.agent_name.',
        hint: 'Optional. Example: "support-bot", "billing-agent". Leave empty if not modeling distinct agents.',
        displayOptions: { show: { resource: ['session'], operation: ['open'] } },
      },
      {
        displayName: 'Framework',
        name: 'framework',
        type: 'options',
        options: [
          { name: 'n8n', value: 'n8n' },
          { name: 'Manual / Custom', value: 'manual' },
        ],
        default: 'n8n',
        description: 'Identifies the orchestration framework in audit logs',
        displayOptions: { show: { resource: ['session'], operation: ['open'] } },
      },
      {
        displayName: 'Webhook Node Name',
        name: 'webhookNodeName',
        type: 'string',
        default: 'Webhook',
        description:
          'Optional. Name of an upstream Webhook trigger node. When set, the SDK auto-extracts client IP and User-Agent from its headers and writes them to agent_sessions (trigger_principal_ip, trigger_principal_user_agent).',
        hint: 'Leave default if your workflow does not start with a Webhook trigger; parse failures are silent.',
        displayOptions: { show: { resource: ['session'], operation: ['open'] } },
      },

      // ── tokenize ────────────────────────────────────────────────────────
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        default: '={{$("Privent Session").item.json.sessionId}}',
        required: true,
        description:
          'Session ID from the Privent Session node upstream in this workflow. Tokens are scoped to this session — Detokenize must use the same ID.',
        hint: 'Add a Privent Session node at the start of your workflow to generate this value.',
        displayOptions: { show: { resource: ['tokenize'], operation: ['tokenize'] } },
      },
      {
        displayName: 'Trace ID',
        name: 'traceId',
        type: 'string',
        default: '={{ $("Privent Session").item.json.traceId }}',
        description:
          'Correlation ID from the upstream Privent Session node. Links this event to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.',
        displayOptions: { show: { resource: ['tokenize'], operation: ['tokenize'] } },
      },
      {
        displayName: 'Agent Name',
        name: 'agentName',
        type: 'string',
        default: '={{ $("Privent Session").item.json.agentName }}',
        description:
          'Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.',
        displayOptions: { show: { resource: ['tokenize'], operation: ['tokenize'] } },
      },
      {
        displayName: 'Text Field',
        name: 'textField',
        type: 'string',
        default: 'text',
        required: true,
        description: 'Name of the input item property that contains the text to tokenize',
        displayOptions: { show: { resource: ['tokenize'], operation: ['tokenize'] } },
      },
      {
        displayName: 'Detection Mode',
        name: 'detectionMode',
        type: 'options',
        options: [
          {
            name: 'Auto (Regex + ML Fallback)',
            value: 'auto',
            description:
              'Uses local regex patterns + Privent Cloud ML when available. Falls back to regex-only if cloud is unreachable.',
          },
          {
            name: 'Local Only (Regex)',
            value: 'local',
            description:
              'Regex-only detection (structured PII: emails, phones, SSN, cards, …). No network calls, no risk scoring — deterministic and fast. Does NOT mask names, dates of birth or addresses; use Auto or Cloud for full PHI coverage.',
          },
          {
            name: 'Cloud (Regex + ML)',
            value: 'cloud',
            description: 'Forces the ML extraction pass. Fails if Privent Cloud is unreachable.',
          },
        ],
        default: 'auto',
        description: 'Controls entity extraction strategy and whether to call Privent Cloud ML',
        displayOptions: { show: { resource: ['tokenize'], operation: ['tokenize'] } },
      },
      {
        displayName: 'Flag for Review Above Risk Score',
        name: 'reviewThreshold',
        type: 'number',
        typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
        default: 0.9,
        description:
          'When Privent Cloud returns a risk score at or above this value, the item is flagged with privent.flaggedForReview = true. The workflow continues — use an IF or Switch node to route flagged items.',
        displayOptions: {
          show: { resource: ['tokenize'], operation: ['tokenize'] },
          hide: { detectionMode: ['local'] },
        },
      },

      // ── detokenize ──────────────────────────────────────────────────────
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        default: '={{$("Privent Session").item.json.sessionId}}',
        required: true,
        description: 'Must match the session ID used by the Privent Tokenize node upstream',
        displayOptions: { show: { resource: ['detokenize'], operation: ['detokenize'] } },
      },
      {
        displayName: 'Trace ID',
        name: 'traceId',
        type: 'string',
        default: '={{ $("Privent Session").item.json.traceId }}',
        description:
          'Correlation ID from the upstream Privent Session node. Links this event to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.',
        displayOptions: { show: { resource: ['detokenize'], operation: ['detokenize'] } },
      },
      {
        displayName: 'Agent Name',
        name: 'agentName',
        type: 'string',
        default: '={{ $("Privent Session").item.json.agentName }}',
        description:
          'Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.',
        displayOptions: { show: { resource: ['detokenize'], operation: ['detokenize'] } },
      },
      {
        displayName: 'Target Field',
        name: 'targetField',
        type: 'string',
        default: '*',
        description:
          'Field to detokenize. Use * (default) to deep-walk and resolve tokens in the entire item JSON. Or specify a single field name (e.g. "body").',
        hint: 'The * wildcard scans every nested string in the item for tokens.',
        displayOptions: { show: { resource: ['detokenize'], operation: ['detokenize'] } },
      },
      {
        displayName: 'Strict Mode',
        name: 'strict',
        type: 'boolean',
        default: false,
        description:
          'When enabled, detokenization is blocked unless the destination URL matches the Trusted Sinks list. Tokens are left in place and an audit event is written. Use this to prevent accidental PII egress to untrusted systems.',
        displayOptions: { show: { resource: ['detokenize'], operation: ['detokenize'] } },
      },
      {
        displayName: 'Destination URL',
        name: 'sinkUrl',
        type: 'string',
        default: '',
        description:
          'URL of the downstream sink (e.g. the HTTP Request node URL). Used to enforce the trusted sinks list in strict mode.',
        displayOptions: {
          show: { resource: ['detokenize'], operation: ['detokenize'], strict: [true] },
        },
        hint: 'Supports URL prefixes — e.g. https://api.internal.corp/',
      },
      {
        displayName: 'Trusted Sinks',
        name: 'trustedSinks',
        type: 'string',
        default: '',
        description:
          'Comma-separated list of URL prefixes allowed to receive detokenized data (e.g. https://api.internal.corp/,https://db.internal/). Only evaluated in strict mode.',
        displayOptions: {
          show: { resource: ['detokenize'], operation: ['detokenize'], strict: [true] },
        },
      },
      {
        displayName: 'Target Agent Name (Trust Map)',
        name: 'targetAgentName',
        type: 'string',
        default: '',
        description:
          'Optional. Canonical agent name of the downstream consumer — when set, the backend Trust Map aggregator materialises this detokenize as an A→B AgentInteraction edge instead of an A→sink edge. Leave empty for true external sinks (the InternalAgentEndpoint registry will auto-resolve in a future release).',
        hint: 'Use only when the destination URL belongs to another Privent-aware agent in the same organization.',
        displayOptions: { show: { resource: ['detokenize'], operation: ['detokenize'] } },
      },

      // ── riskCheck ───────────────────────────────────────────────────────
      {
        displayName: 'Text Field',
        name: 'textField',
        type: 'string',
        default: 'text',
        required: true,
        description: 'Name of the input item property containing the text to score',
        displayOptions: { show: { resource: ['riskCheck'], operation: ['score'] } },
      },
      {
        displayName: 'Trace ID',
        name: 'traceId',
        type: 'string',
        default: '={{ $("Privent Session").item.json.traceId }}',
        description:
          'Correlation ID from the upstream Privent Session node. Links this risk check to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.',
        displayOptions: { show: { resource: ['riskCheck'], operation: ['score'] } },
      },
      {
        displayName: 'Agent Name',
        name: 'agentName',
        type: 'string',
        default: '={{ $("Privent Session").item.json.agentName }}',
        description:
          'Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.',
        displayOptions: { show: { resource: ['riskCheck'], operation: ['score'] } },
      },

      // ── audit ───────────────────────────────────────────────────────────
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        default: '={{$("Privent Session").item.json.sessionId}}',
        required: true,
        description: 'Session ID from the upstream Privent Session node',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['audit'], operation: ['emit'] } },
      },
      {
        displayName: 'Trace ID',
        name: 'traceId',
        type: 'string',
        default: '={{ $("Privent Session").item.json.traceId }}',
        description:
          'Correlation ID from the upstream Privent Session node. Links this event to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['audit'], operation: ['emit'] } },
      },
      {
        displayName: 'Agent Name',
        name: 'agentName',
        type: 'string',
        default: '={{ $("Privent Session").item.json.agentName }}',
        description:
          'Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['audit'], operation: ['emit'] } },
      },
      {
        displayName: 'Event Type',
        name: 'eventType',
        type: 'options',
        options: [
          { name: 'LLM Call', value: 'llm_call' },
          { name: 'Policy Decision', value: 'policy_decision' },
          { name: 'Egress', value: 'egress' },
          { name: 'Error', value: 'error' },
        ],
        default: 'llm_call',
        description: 'Audit event type. LLM Call triggers backend cost calculation from ModelPricing.',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['audit'], operation: ['emit'] } },
      },
      {
        displayName: 'LLM Model',
        name: 'model',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        description:
          'Model used for this LLM call. Pick from your org\'s priced models (popular first) or enter a custom one as provider|model. The provider is taken from the selection.',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['audit'], operation: ['emit'], eventType: ['llm_call'] } },
        modes: [
          {
            displayName: 'From List',
            name: 'list',
            type: 'list',
            typeOptions: { searchListMethod: 'searchModels', searchable: true },
          },
          {
            displayName: 'By ID',
            name: 'id',
            type: 'string',
            placeholder: 'openai|gpt-4o-mini',
            hint: 'Format: provider|model',
          },
        ],
      },
      {
        displayName: 'Prompt Tokens',
        name: 'promptTokens',
        type: 'string',
        default: '={{$json.usage.prompt_tokens}}',
        description:
          'n8n expression resolving to the prompt token count. Default reads OpenAI-style {usage:{prompt_tokens}} from the previous node.',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['audit'], operation: ['emit'], eventType: ['llm_call'] } },
      },
      {
        displayName: 'Completion Tokens',
        name: 'completionTokens',
        type: 'string',
        default: '={{$json.usage.completion_tokens}}',
        description: 'n8n expression resolving to the completion token count',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['audit'], operation: ['emit'], eventType: ['llm_call'] } },
      },
      {
        displayName: 'Extra Metadata (JSON)',
        name: 'extraMetadata',
        type: 'json',
        default: '{}',
        description:
          'Optional. Merged into the audit event metadata. For event types other than LLM Call, use this to attach event-specific fields (e.g. policy decision rationale).',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['audit'], operation: ['emit'] } },
      },

      // ── handoff ─────────────────────────────────────────────────────────
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        default: '={{ $("Privent Session").item.json.sessionId }}',
        required: true,
        description:
          'Session ID from the upstream Privent Session node — the "from" side of the handoff edge.',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['handoff'], operation: ['record'] } },
      },
      {
        displayName: 'Trace ID',
        name: 'traceId',
        type: 'string',
        default: '={{ $("Privent Session").item.json.traceId }}',
        description:
          'Correlation ID from the upstream Privent Session node. Leave as-is; a fresh ID is generated if no Session is upstream.',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['handoff'], operation: ['record'] } },
      },
      {
        displayName: 'From Agent Name',
        name: 'agentName',
        type: 'string',
        default: '={{ $("Privent Session").item.json.agentName }}',
        required: true,
        description:
          'Canonical name of the source agent, from the upstream Privent Session node. Required — identifies the "from" side of the handoff edge.',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['handoff'], operation: ['record'] } },
      },
      {
        displayName: 'Target Kind',
        name: 'targetKind',
        type: 'options',
        options: [
          {
            name: 'Agent (in-org)',
            value: 'agent',
            description: 'Hand off to another Privent-aware agent in the same organization',
          },
          {
            name: 'External Sink',
            value: 'sink',
            description: 'Hand off to an external destination outside the in-org agent fleet',
          },
        ],
        default: 'agent',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['handoff'], operation: ['record'] } },
      },
      {
        displayName: 'Target Agent Name',
        name: 'toAgentName',
        type: 'string',
        default: '',
        required: true,
        description:
          'Canonical agent name of the downstream agent. Must match the agentName the downstream PriventSession will emit.',
        hint: 'Example: "Translator", "billing-agent". Resolves to Agent.id post-ingest.',
        displayOptions: {
          show: { authentication: ['apiKey'], resource: ['handoff'], operation: ['record'], targetKind: ['agent'] },
        },
      },
      {
        displayName: 'External Sink ID',
        name: 'toSinkId',
        type: 'string',
        default: '',
        required: true,
        description: 'Opaque identifier for an external sink (e.g. webhook URL hash, partner ID).',
        displayOptions: {
          show: { authentication: ['apiKey'], resource: ['handoff'], operation: ['record'], targetKind: ['sink'] },
        },
      },
      {
        displayName: 'Reason',
        name: 'reason',
        type: 'options',
        options: [
          { name: 'Delegation', value: 'delegation' },
          { name: 'Subgraph Call', value: 'subgraph_call' },
          { name: 'Tool Invocation', value: 'tool_invocation' },
          { name: 'Webhook Trigger', value: 'webhook_trigger' },
          { name: 'Other', value: 'other' },
        ],
        default: 'delegation',
        description: 'Categorises the handoff for the Trust Map graph filters',
        displayOptions: { show: { authentication: ['apiKey'], resource: ['handoff'], operation: ['record'] } },
      },
      {
        displayName: 'Payload Token Count',
        name: 'payloadTokenCount',
        type: 'number',
        default: 0,
        description:
          'Optional. Token volume hint for blast-radius math in the Trust Map (set 0 to omit).',
        typeOptions: { minValue: 0 },
        displayOptions: { show: { authentication: ['apiKey'], resource: ['handoff'], operation: ['record'] } },
      },
    ],
  };

  methods = {
    listSearch: {
      // Powers the searchable model combobox. Hits the same backend + Bearer key
      // as audit ingest; degrades to manual `By ID` entry if the call fails.
      async searchModels(
        this: ILoadOptionsFunctions,
        filter?: string,
      ): Promise<INodeListSearchResult> {
        try {
          const { baseUrl } = await this.getCredentials('priventApi');
          const resp = (await this.helpers.httpRequestWithAuthentication.call(
            this,
            'priventApi',
            {
              method: 'GET',
              baseURL: baseUrl as string,
              url: '/v1/pricing/models',
              qs: { search: filter ?? '' },
              json: true,
            },
          )) as { models?: Array<{ provider: string; model: string }> };
          const results = (resp.models ?? []).map((m) => ({
            name: `${m.model} (${m.provider})`,
            value: `${m.provider}|${m.model}`,
          }));
          return { results };
        } catch {
          return { results: [] };
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const resource = this.getNodeParameter('resource', 0) as string;

    // Risk Check is batched (one /v1/risk/batch call for all items) — it owns
    // its own loop and error handling, so branch before the per-item dispatch.
    if (resource === 'riskCheck') {
      return executeRiskCheck(this);
    }

    const handler = PER_ITEM_HANDLERS[resource];
    if (!handler) {
      // Unknown resource should be unreachable (options-only param).
      return [[]];
    }

    const items = this.getInputData();
    const baseUrl = await getPriventBaseUrl(this);
    const out: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const json = await handler(this, i, baseUrl);
        out.push({ json, pairedItem: { item: i } });
      } catch (err) {
        if (this.continueOnFail()) {
          out.push({ json: { error: (err as Error).message }, pairedItem: { item: i } });
          continue;
        }
        throw err;
      }
    }

    return [out];
  }
}

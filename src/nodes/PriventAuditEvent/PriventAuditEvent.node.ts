import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeListSearchResult,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import type { AuditEvent, AuditEventType } from '@priventai/core';
import {
  auditLog,
  buildAuditMetadata,
  getPriventBaseUrl,
  resolveContext,
  safeFrameworkVersion,
  safeTriggerMode,
} from '../../shared/privent-http.js';

/**
 * Generic audit event emitter. Place after any step whose outcome needs to be
 * recorded outside of the built-in tokenize/detokenize/risk_check pipeline —
 * LLM calls, policy decisions, egress sinks, errors. The backend persists each
 * event into `token_audit_events`; LLM-call events also feed `cost_usd` /
 * `token_count` via server-side `ModelPricing` lookup.
 */
export class PriventAuditEvent implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Privent Audit Event',
    name: 'priventAuditEvent',
    icon: 'file:privent.png',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["eventType"]}}',
    description:
      'Emits a Privent audit event for non-tokenization steps (LLM call cost tracking, policy decisions, egress, errors). Place after an HTTP Request to an LLM provider to record provider/model/token usage; the backend computes USD cost from your org\'s ModelPricing table.',
    defaults: { name: 'Privent Audit Event' },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [{ name: 'priventApi', required: true }],
    properties: [
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        default: '={{$("Privent Session").item.json.sessionId}}',
        required: true,
        description: 'Session ID from the upstream Privent Session node',
      },
      {
        displayName: 'Trace ID',
        name: 'traceId',
        type: 'string',
        default: '={{ $("Privent Session").item.json.traceId }}',
        description:
          'Correlation ID from the upstream Privent Session node. Links this event to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.',
      },
      {
        displayName: 'Agent Name',
        name: 'agentName',
        type: 'string',
        default: '={{ $("Privent Session").item.json.agentName }}',
        description:
          'Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.',
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
      },
      {
        displayName: 'LLM Model',
        name: 'model',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        description:
          'Model used for this LLM call. Pick from your org\'s priced models (popular first) or enter a custom one as provider|model. The provider is taken from the selection.',
        displayOptions: { show: { eventType: ['llm_call'] } },
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
        displayOptions: { show: { eventType: ['llm_call'] } },
      },
      {
        displayName: 'Completion Tokens',
        name: 'completionTokens',
        type: 'string',
        default: '={{$json.usage.completion_tokens}}',
        description: 'n8n expression resolving to the completion token count',
        displayOptions: { show: { eventType: ['llm_call'] } },
      },
      {
        displayName: 'Extra Metadata (JSON)',
        name: 'extraMetadata',
        type: 'json',
        default: '{}',
        description:
          'Optional. Merged into the audit event metadata. For event types other than LLM Call, use this to attach event-specific fields (e.g. policy decision rationale).',
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
    const items = this.getInputData();
    const baseUrl = await getPriventBaseUrl(this);
    const triggerMode = safeTriggerMode(this);
    const frameworkVersion = safeFrameworkVersion();

    const out: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      try {
        const sessionId = (this.getNodeParameter('sessionId', i) as string).trim();
        if (!sessionId) {
          throw new NodeOperationError(this.getNode(), 'Session ID is required', {
            itemIndex: i,
          });
        }
        const traceIdParam = this.getNodeParameter('traceId', i, '') as string;
        const agentNameParam = this.getNodeParameter('agentName', i, '') as string;
        const eventType = this.getNodeParameter('eventType', i) as AuditEventType;
        const extraRaw = this.getNodeParameter('extraMetadata', i, '{}') as
          | string
          | Record<string, unknown>;

        // n8n's "json" param can resolve to either a string (raw JSON expression)
        // or an already-parsed object depending on whether the expression engine
        // ran first. Accept both; ignore invalid JSON silently to keep the
        // workflow alive (the audit event still gets emitted with the base
        // fields).
        let extraMetadata: Record<string, unknown> = {};
        if (typeof extraRaw === 'string') {
          try {
            const parsed = JSON.parse(extraRaw || '{}');
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              extraMetadata = parsed as Record<string, unknown>;
            }
          } catch {
            // invalid JSON — ignore
          }
        } else if (extraRaw && typeof extraRaw === 'object' && !Array.isArray(extraRaw)) {
          extraMetadata = extraRaw;
        }

        const metadata: Record<string, unknown> = { ...extraMetadata };

        if (eventType === 'llm_call') {
          // resourceLocator value is "provider|model" from the picker, or a raw
          // string in manual mode. Split on the first "|"; a bare value is taken
          // as the model with provider omitted (backend logs a pricing miss).
          const selected = (
            this.getNodeParameter('model', i, '', { extractValue: true }) as string
          ).trim();
          const sep = selected.indexOf('|');
          const provider = sep >= 0 ? selected.slice(0, sep).trim().toLowerCase() : '';
          const model = sep >= 0 ? selected.slice(sep + 1).trim() : selected;
          const promptTokensRaw = this.getNodeParameter('promptTokens', i);
          const completionTokensRaw = this.getNodeParameter('completionTokens', i);
          const promptTokens = Number(promptTokensRaw);
          const completionTokens = Number(completionTokensRaw);
          if (provider) metadata.provider = provider;
          if (model) metadata.model = model;
          metadata.prompt_tokens = Number.isFinite(promptTokens) && promptTokens > 0
            ? Math.trunc(promptTokens)
            : 0;
          metadata.completion_tokens =
            Number.isFinite(completionTokens) && completionTokens > 0
              ? Math.trunc(completionTokens)
              : 0;
        }

        const ctx = resolveContext(this, sessionId, traceIdParam, agentNameParam);
        const node = this.getNode();
        if (triggerMode !== undefined) metadata.trigger_mode = triggerMode;
        if (frameworkVersion !== undefined) metadata.framework_version = frameworkVersion;

        const event: AuditEvent = {
          type: eventType,
          traceId: ctx.traceId,
          sessionId,
          timestamp: Date.now(),
          framework: 'n8n',
          workflowId: ctx.workflowId,
          nodeId: node.id,
          metadata: buildAuditMetadata(ctx, node, metadata),
        };
        void auditLog(this, event, baseUrl);

        out.push({
          json: {
            ...item.json,
            privent: {
              sessionId,
              auditEventEmitted: true,
              eventType,
            },
          },
          pairedItem: { item: i },
        });
      } catch (err) {
        if (this.continueOnFail()) {
          out.push({
            json: { error: (err as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        if (err instanceof NodeOperationError) throw err;
        throw new NodeOperationError(this.getNode(), err as Error, { itemIndex: i });
      }
    }

    return [out];
  }
}

import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import type { AuditEvent, HandoffReason } from '@priventai/core';
import {
  auditLog,
  buildAuditMetadata,
  getPriventBaseUrl,
  resolveContext,
  safeTriggerMode,
} from '../../shared/privent-http.js';

/**
 * Trust Map v1 — explicit agent handoff marker. Place this node anywhere a
 * workflow hands control / data to another in-scope agent (sub-graph dispatch,
 * supervisor → worker, webhook-trigger of a downstream workflow). Emits an
 * `agent_handoff` audit event via `client.handoff()` so the backend aggregator
 * can materialise an AgentInteraction edge.
 *
 * The "from" side resolves from the upstream PriventSession context (no UI
 * field). The "to" side is supplied by the operator — either as a known agent
 * name string (preferred, when the target has its own PriventSession) or as
 * an external sink ID (e.g. an opaque webhook URL) when handing off outside
 * the in-org agent fleet.
 *
 * v1 (n8n) always emits `parent_event_id = null`, `branch_id = null`,
 * `hop_depth = 1`. LangGraph / CrewAI adapters will fill those when the
 * topology is non-linear (supervisor / parallel branches).
 */
export class PriventHandoff implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Privent Handoff',
    name: 'priventHandoff',
    icon: 'file:privent.png',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["targetKind"]}}',
    description:
      'Marks an explicit agent → agent (or agent → external sink) handoff. Backend Trust Map aggregator turns each event into an AgentInteraction edge.',
    defaults: { name: 'Privent Handoff' },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: 'priventApi', required: true }],
    properties: [
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        default: '={{ $("Privent Session").item.json.sessionId }}',
        required: true,
        description:
          'Session ID from the upstream Privent Session node — the "from" side of the handoff edge.',
      },
      {
        displayName: 'Trace ID',
        name: 'traceId',
        type: 'string',
        default: '={{ $("Privent Session").item.json.traceId }}',
        description:
          'Correlation ID from the upstream Privent Session node. Leave as-is; a fresh ID is generated if no Session is upstream.',
      },
      {
        displayName: 'From Agent Name',
        name: 'agentName',
        type: 'string',
        default: '={{ $("Privent Session").item.json.agentName }}',
        required: true,
        description:
          'Canonical name of the source agent, from the upstream Privent Session node. Required — identifies the "from" side of the handoff edge.',
      },
      {
        displayName: 'Target Kind',
        name: 'targetKind',
        type: 'options',
        options: [
          {
            name: 'Agent (in-org)',
            value: 'agent',
            description:
              'Hand off to another Privent-aware agent in the same organization',
          },
          {
            name: 'External Sink',
            value: 'sink',
            description:
              'Hand off to an external destination outside the in-org agent fleet',
          },
        ],
        default: 'agent',
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
        displayOptions: { show: { targetKind: ['agent'] } },
      },
      {
        displayName: 'External Sink ID',
        name: 'toSinkId',
        type: 'string',
        default: '',
        required: true,
        description:
          'Opaque identifier for an external sink (e.g. webhook URL hash, partner ID).',
        displayOptions: { show: { targetKind: ['sink'] } },
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
      },
      {
        displayName: 'Payload Token Count',
        name: 'payloadTokenCount',
        type: 'number',
        default: 0,
        description:
          'Optional. Token volume hint for blast-radius math in the Trust Map (set 0 to omit).',
        typeOptions: { minValue: 0 },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const baseUrl = await getPriventBaseUrl(this);
    const triggerMode = safeTriggerMode(this);

    const out: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      try {
        const targetKind = this.getNodeParameter('targetKind', i, 'agent') as
          | 'agent'
          | 'sink';
        const reason = this.getNodeParameter('reason', i, 'delegation') as HandoffReason;
        const payloadTokenCount = Number(
          this.getNodeParameter('payloadTokenCount', i, 0) ?? 0,
        );
        const sessionIdParam = (this.getNodeParameter('sessionId', i, '') as string).trim();
        const traceIdParam = this.getNodeParameter('traceId', i, '') as string;
        const agentNameParam = this.getNodeParameter('agentName', i, '') as string;

        const ctx = resolveContext(this, sessionIdParam, traceIdParam, agentNameParam);
        const node = this.getNode();

        if (!ctx.sessionId) {
          throw new NodeOperationError(
            this.getNode(),
            'Privent Handoff requires an upstream Privent Session node — sessionId is missing.',
            { itemIndex: i },
          );
        }
        if (!ctx.agentName) {
          throw new NodeOperationError(
            this.getNode(),
            'Privent Handoff requires the upstream Privent Session to have an Agent Name set.',
            { itemIndex: i },
          );
        }

        let toAgentName: string | undefined;
        let toSinkId: string | undefined;
        if (targetKind === 'agent') {
          toAgentName = (
            this.getNodeParameter('toAgentName', i, '') as string
          ).trim();
          if (!toAgentName) {
            throw new NodeOperationError(
              this.getNode(),
              'Target Agent Name is required when Target Kind = Agent',
              { itemIndex: i },
            );
          }
        } else {
          toSinkId = (this.getNodeParameter('toSinkId', i, '') as string).trim();
          if (!toSinkId) {
            throw new NodeOperationError(
              this.getNode(),
              'External Sink ID is required when Target Kind = External Sink',
              { itemIndex: i },
            );
          }
        }

        // Build the same `agent_handoff` event shape that core's
        // `client.handoff()` produced, then emit via the stateless audit path.
        // fail-open per SDK convention — auditLog swallows transport errors.
        const handoffEvent: AuditEvent = {
          type: 'agent_handoff',
          traceId: ctx.traceId,
          sessionId: ctx.sessionId,
          timestamp: Date.now(),
          framework: 'n8n',
          workflowId: ctx.workflowId,
          nodeId: node.id,
          nodeName: node.name,
          fromAgentName: ctx.agentName,
          ...(toAgentName != null ? { targetAgentName: toAgentName } : {}),
          ...(toSinkId != null ? { targetSinkId: toSinkId } : {}),
          reason,
          ...(Number.isFinite(payloadTokenCount) && payloadTokenCount > 0
            ? { payloadTokenCount }
            : {}),
          // v1 (n8n linear flows) always 1. LangGraph/CrewAI adapters will fill
          // parent_event_id/branch_id/hop_depth for non-linear topologies.
          hopDepth: 1,
          metadata: buildAuditMetadata(ctx, node, {
            ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
          }),
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
              reason,
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
        throw err;
      }
    }

    return [out];
  }
}

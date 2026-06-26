import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import type { AuditEvent } from '@priventai/core';
import {
  auditLog,
  buildAuditMetadata,
  getPriventBaseUrl,
  resolveContext,
  riskScoreBatch,
  safeTriggerMode,
} from '../../shared/privent-http.js';

export class PriventRiskCheck implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Privent Risk Check',
    name: 'priventRiskCheck',
    icon: 'file:privent.png',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["textField"]}}',
    description:
      'Scores text for data-leak risk using Privent ML. Returns risk_score (0–1), risk_level, and per-category probabilities. Connect the output to a Switch node to route high-risk items to a human-review workflow.',
    defaults: { name: 'Privent Risk Check' },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [{ name: 'priventApi', required: true }],
    properties: [
      {
        displayName: 'Text Field',
        name: 'textField',
        type: 'string',
        default: 'text',
        required: true,
        description: 'Name of the input item property containing the text to score',
      },
      {
        displayName: 'Trace ID',
        name: 'traceId',
        type: 'string',
        default: '={{ $("Privent Session").item.json.traceId }}',
        description:
          'Correlation ID from the upstream Privent Session node. Links this risk check to the session trace. Leave as-is; a fresh ID is generated if no Session is upstream.',
      },
      {
        displayName: 'Agent Name',
        name: 'agentName',
        type: 'string',
        default: '={{ $("Privent Session").item.json.agentName }}',
        description:
          'Logical agent identifier from the upstream Privent Session node, recorded on the audit event. Optional.',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const baseUrl = await getPriventBaseUrl(this);
    const triggerMode = safeTriggerMode(this);

    // Auto-batch: collect texts from all items and call riskScoreBatch() once.
    // This is more efficient than one score() call per item and avoids N
    // sequential round-trips to Privent Cloud.
    const texts: Array<{ text: string; itemIndex: number }> = [];
    const errors: Map<number, Error> = new Map();

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      try {
        const textField = this.getNodeParameter('textField', i) as string;
        const raw = (item.json as Record<string, unknown>)[textField];

        if (typeof raw !== 'string') {
          throw new NodeOperationError(
            this.getNode(),
            `Field "${textField}" is not a string. Got: ${typeof raw}`,
            {
              itemIndex: i,
              description: 'Check the "Text Field" parameter — it should match a string property in your input data.',
            },
          );
        }

        texts.push({ text: raw, itemIndex: i });
      } catch (err) {
        if (this.continueOnFail()) {
          errors.set(i, err as Error);
        } else {
          throw err;
        }
      }
    }

    // Single batched call — handles up to 64 items per call.
    const scores =
      texts.length > 0 ? await riskScoreBatch(this, texts.map((t) => t.text), baseUrl) : [];

    const out: INodeExecutionData[] = [];
    const node = this.getNode();

    let scoreIdx = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      if (errors.has(i)) {
        out.push({ json: { error: errors.get(i)!.message }, pairedItem: { item: i } });
        continue;
      }

      const traceIdParam = this.getNodeParameter('traceId', i, '') as string;
      const agentNameParam = this.getNodeParameter('agentName', i, '') as string;
      // Sessionless node: the audit session_id is the (UUID) traceId.
      const ctx = resolveContext(this, '', traceIdParam, agentNameParam);
      const risk = scores[scoreIdx++]!;

      const event: AuditEvent = {
        type: 'risk_check',
        traceId: ctx.traceId,
        sessionId: ctx.traceId,
        timestamp: Date.now(),
        framework: 'n8n',
        workflowId: ctx.workflowId,
        nodeId: node.id,
        metadata: buildAuditMetadata(ctx, node, {
          risk_score: risk.risk_score,
          risk_level: risk.risk_level,
          categories: risk.categories ?? null,
          model: risk.model,
          latency_ms: risk.latencyMs,
          batch_size: texts.length,
          ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
        }),
      };
      void auditLog(this, event, baseUrl);

      out.push({
        json: {
          ...item.json,
          privent: {
            risk_score: risk.risk_score,
            risk_level: risk.risk_level,
            categories: risk.categories,
            model: risk.model,
            latencyMs: risk.latencyMs,
          },
        },
        pairedItem: { item: i },
      });
    }

    return [out];
  }
}

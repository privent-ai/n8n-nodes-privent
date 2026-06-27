import type { IExecuteFunctions, INodeExecutionData, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import type { AuditEvent } from '@priventai/core';
import {
  auditLog,
  buildAuditMetadata,
  getPriventBaseUrl,
  resolveContext,
  riskScoreBatch,
  safeTriggerMode,
} from '../../../shared/privent-http.js';

/** The length-mismatch guard inside `riskScoreBatch` is a logical (not HTTP)
 *  failure — surfaced as a NodeOperationError rather than a NodeApiError. */
function isBatchLengthMismatch(err: unknown): boolean {
  return err instanceof Error && err.message.startsWith('Privent risk batch length mismatch');
}

/**
 * `riskCheck` resource → `score` operation. Migrated from PriventRiskCheck.
 * BATCHED: a single `riskScoreBatch` call for all valid items (not per-item HTTP).
 */
export async function executeRiskCheck(ctx: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = ctx.getInputData();
  const baseUrl = await getPriventBaseUrl(ctx);
  const triggerMode = safeTriggerMode(ctx);

  // Auto-batch: collect texts from all items and call riskScoreBatch() once.
  // This is more efficient than one score() call per item and avoids N
  // sequential round-trips to Privent Cloud.
  const texts: Array<{ text: string; itemIndex: number }> = [];
  const errors: Map<number, Error> = new Map();

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    try {
      const textField = ctx.getNodeParameter('textField', i) as string;
      const raw = (item.json as Record<string, unknown>)[textField];

      if (typeof raw !== 'string') {
        throw new NodeOperationError(
          ctx.getNode(),
          `Field "${textField}" is not a string. Got: ${typeof raw}`,
          {
            itemIndex: i,
            description:
              'Check the "Text Field" parameter — it should match a string property in your input data.',
          },
        );
      }

      texts.push({ text: raw, itemIndex: i });
    } catch (err) {
      if (ctx.continueOnFail()) {
        errors.set(i, err as Error);
      } else {
        throw err;
      }
    }
  }

  // Single batched call — handles up to 64 items per call. HTTP failure here is
  // surfaced as a NodeApiError (status + body); a length-mismatch (logical) as
  // a NodeOperationError. When continuing, every batched item gets an error row.
  let scores;
  try {
    scores =
      texts.length > 0 ? await riskScoreBatch(ctx, texts.map((t) => t.text), baseUrl) : [];
  } catch (err) {
    if (ctx.continueOnFail()) {
      const out: INodeExecutionData[] = [];
      for (let i = 0; i < items.length; i++) {
        const message = errors.has(i) ? errors.get(i)!.message : (err as Error).message;
        out.push({ json: { error: message }, pairedItem: { item: i } });
      }
      return [out];
    }
    if (isBatchLengthMismatch(err)) {
      throw new NodeOperationError(ctx.getNode(), err as Error);
    }
    throw new NodeApiError(ctx.getNode(), err as JsonObject);
  }

  const out: INodeExecutionData[] = [];
  const node = ctx.getNode();

  let scoreIdx = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    if (errors.has(i)) {
      out.push({ json: { error: errors.get(i)!.message }, pairedItem: { item: i } });
      continue;
    }

    const traceIdParam = ctx.getNodeParameter('traceId', i, '') as string;
    const agentNameParam = ctx.getNodeParameter('agentName', i, '') as string;
    // Sessionless node: the audit session_id is the (UUID) traceId.
    const auditCtx = resolveContext(ctx, '', traceIdParam, agentNameParam);
    const risk = scores[scoreIdx++]!;

    const event: AuditEvent = {
      type: 'risk_check',
      traceId: auditCtx.traceId,
      sessionId: auditCtx.traceId,
      timestamp: Date.now(),
      framework: 'n8n',
      workflowId: auditCtx.workflowId,
      nodeId: node.id,
      metadata: buildAuditMetadata(auditCtx, node, {
        risk_score: risk.risk_score,
        risk_level: risk.risk_level,
        categories: risk.categories ?? null,
        model: risk.model,
        latency_ms: risk.latencyMs,
        batch_size: texts.length,
        ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
      }),
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
          latencyMs: risk.latencyMs,
        },
      },
      pairedItem: { item: i },
    });
  }

  return [out];
}

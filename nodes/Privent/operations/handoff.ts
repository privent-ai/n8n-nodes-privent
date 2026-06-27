import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { AuditEvent, HandoffReason } from '@priventai/core';
import {
  auditLog,
  buildAuditMetadata,
  resolveContext,
  safeTriggerMode,
} from '../../../shared/privent-http.js';

/** `handoff` resource → `record` operation. Migrated from PriventHandoff. */
export async function handleHandoff(
  ctx: IExecuteFunctions,
  i: number,
  baseUrl: string,
): Promise<IDataObject> {
  const item = ctx.getInputData()[i]!;
  const triggerMode = safeTriggerMode(ctx);

  const targetKind = ctx.getNodeParameter('targetKind', i, 'agent') as 'agent' | 'sink';
  const reason = ctx.getNodeParameter('reason', i, 'delegation') as HandoffReason;
  const payloadTokenCount = Number(ctx.getNodeParameter('payloadTokenCount', i, 0) ?? 0);
  const sessionIdParam = (ctx.getNodeParameter('sessionId', i, '') as string).trim();
  const traceIdParam = ctx.getNodeParameter('traceId', i, '') as string;
  const agentNameParam = ctx.getNodeParameter('agentName', i, '') as string;

  const ctxAudit = resolveContext(ctx, sessionIdParam, traceIdParam, agentNameParam);
  const node = ctx.getNode();

  if (!ctxAudit.sessionId) {
    throw new NodeOperationError(
      ctx.getNode(),
      'Privent Handoff requires an upstream Privent Session node — sessionId is missing.',
      { itemIndex: i },
    );
  }
  if (!ctxAudit.agentName) {
    throw new NodeOperationError(
      ctx.getNode(),
      'Privent Handoff requires the upstream Privent Session to have an Agent Name set.',
      { itemIndex: i },
    );
  }

  let toAgentName: string | undefined;
  let toSinkId: string | undefined;
  if (targetKind === 'agent') {
    toAgentName = (ctx.getNodeParameter('toAgentName', i, '') as string).trim();
    if (!toAgentName) {
      throw new NodeOperationError(
        ctx.getNode(),
        'Target Agent Name is required when Target Kind = Agent',
        { itemIndex: i },
      );
    }
  } else {
    toSinkId = (ctx.getNodeParameter('toSinkId', i, '') as string).trim();
    if (!toSinkId) {
      throw new NodeOperationError(
        ctx.getNode(),
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
    traceId: ctxAudit.traceId,
    sessionId: ctxAudit.sessionId,
    timestamp: Date.now(),
    framework: 'n8n',
    workflowId: ctxAudit.workflowId,
    nodeId: node.id,
    nodeName: node.name,
    fromAgentName: ctxAudit.agentName,
    ...(toAgentName != null ? { targetAgentName: toAgentName } : {}),
    ...(toSinkId != null ? { targetSinkId: toSinkId } : {}),
    reason,
    ...(Number.isFinite(payloadTokenCount) && payloadTokenCount > 0
      ? { payloadTokenCount }
      : {}),
    // v1 (n8n linear flows) always 1. LangGraph/CrewAI adapters will fill
    // parent_event_id/branch_id/hop_depth for non-linear topologies.
    hopDepth: 1,
    metadata: buildAuditMetadata(ctxAudit, node, {
      ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
    }),
  };
  void auditLog(ctx, handoffEvent, baseUrl);

  return {
    ...item.json,
    privent: {
      handoff: true,
      fromAgentName: ctxAudit.agentName,
      toAgentName: toAgentName ?? null,
      toSinkId: toSinkId ?? null,
      reason,
    },
  };
}

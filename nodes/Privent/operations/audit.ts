import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { AuditEvent, AuditEventType } from '@priventai/core';
import {
  auditLog,
  buildAuditMetadata,
  resolveContext,
  safeFrameworkVersion,
  safeTriggerMode,
} from '../../../shared/privent-http.js';

/** `audit` resource → `emit` operation. Migrated from PriventAuditEvent. */
export async function handleAudit(
  ctx: IExecuteFunctions,
  i: number,
  baseUrl: string,
): Promise<IDataObject> {
  const item = ctx.getInputData()[i]!;
  const triggerMode = safeTriggerMode(ctx);
  const frameworkVersion = safeFrameworkVersion();

  const sessionId = (ctx.getNodeParameter('sessionId', i) as string).trim();
  if (!sessionId) {
    throw new NodeOperationError(ctx.getNode(), 'Session ID is required', { itemIndex: i });
  }
  const traceIdParam = ctx.getNodeParameter('traceId', i, '') as string;
  const agentNameParam = ctx.getNodeParameter('agentName', i, '') as string;
  const eventType = ctx.getNodeParameter('eventType', i) as AuditEventType;
  const extraRaw = ctx.getNodeParameter('extraMetadata', i, '{}') as
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
      ctx.getNodeParameter('model', i, '', { extractValue: true }) as string
    ).trim();
    const sep = selected.indexOf('|');
    const provider = sep >= 0 ? selected.slice(0, sep).trim().toLowerCase() : '';
    const model = sep >= 0 ? selected.slice(sep + 1).trim() : selected;
    const promptTokensRaw = ctx.getNodeParameter('promptTokens', i);
    const completionTokensRaw = ctx.getNodeParameter('completionTokens', i);
    const promptTokens = Number(promptTokensRaw);
    const completionTokens = Number(completionTokensRaw);
    if (provider) metadata.provider = provider;
    if (model) metadata.model = model;
    metadata.prompt_tokens =
      Number.isFinite(promptTokens) && promptTokens > 0 ? Math.trunc(promptTokens) : 0;
    metadata.completion_tokens =
      Number.isFinite(completionTokens) && completionTokens > 0
        ? Math.trunc(completionTokens)
        : 0;
  }

  const auditCtx = resolveContext(ctx, sessionId, traceIdParam, agentNameParam);
  const node = ctx.getNode();
  if (triggerMode !== undefined) metadata.trigger_mode = triggerMode;
  if (frameworkVersion !== undefined) metadata.framework_version = frameworkVersion;

  const event: AuditEvent = {
    type: eventType,
    traceId: auditCtx.traceId,
    sessionId,
    timestamp: Date.now(),
    framework: 'n8n',
    workflowId: auditCtx.workflowId,
    nodeId: node.id,
    metadata: buildAuditMetadata(auditCtx, node, metadata),
  };
  void auditLog(ctx, event, baseUrl);

  return {
    ...item.json,
    privent: {
      sessionId,
      auditEventEmitted: true,
      eventType,
    },
  };
}

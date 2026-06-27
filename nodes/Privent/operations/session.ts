import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { AuditEvent } from '@priventai/core';
import { TRACER_VERSION } from '@priventai/core';
import {
  auditLog,
  buildAuditMetadata,
  isUuid,
  safeExecutionId,
  safeFrameworkVersion,
  safeTriggerMode,
  safeWorkflow,
} from '../../../shared/privent-http.js';

/** `session` resource → `open` operation. Migrated verbatim from PriventSession. */
export async function handleSession(
  ctx: IExecuteFunctions,
  i: number,
  baseUrl: string,
): Promise<IDataObject> {
  const item = ctx.getInputData()[i]!;
  const framework =
    (ctx.getNodeParameter('framework', i, 'n8n') as string) === 'manual' ? 'manual' : 'n8n';
  const triggerMode = safeTriggerMode(ctx);
  const { id: workflowId, name: workflowName } = safeWorkflow(ctx);
  const executionId = safeExecutionId(ctx);

  const mode = ctx.getNodeParameter('sessionIdMode', i) as 'auto' | 'manual';
  const sessionId =
    mode === 'manual'
      ? (ctx.getNodeParameter('sessionId', i) as string).trim()
      : crypto.randomUUID();

  if (!sessionId) {
    throw new NodeOperationError(ctx.getNode(), 'Session ID cannot be empty in manual mode', {
      itemIndex: i,
    });
  }
  if (mode === 'manual' && !isUuid(sessionId)) {
    throw new NodeOperationError(
      ctx.getNode(),
      'Manual Session ID must be a UUID — auto mode generates one',
      { itemIndex: i },
    );
  }

  const traceId = crypto.randomUUID();
  const agentNameParam = (ctx.getNodeParameter('agentName', i, '') as string).trim();
  const agentName = agentNameParam || workflowName || '';
  const startedAt = Date.now();

  // Cloud vault is lazy — no pre-warm needed. Correlation context travels
  // on the output item (below) instead of a process-global registry.

  // C-2: pull client IP / User-Agent from an upstream Webhook trigger.
  // Best-effort: missing node, missing headers, or expression errors all
  // collapse to undefined so the workflow never breaks on parse failure.
  let triggerPrincipalIp: string | undefined;
  let triggerPrincipalUserAgent: string | undefined;
  const webhookNodeName = (
    ctx.getNodeParameter('webhookNodeName', i, 'Webhook') as string
  ).trim();
  if (webhookNodeName) {
    try {
      const headersExpr = `={{$("${webhookNodeName}").first().json.headers}}`;
      const headers = ctx.evaluateExpression(headersExpr, i) as
        | Record<string, unknown>
        | undefined;
      if (headers && typeof headers === 'object') {
        const lower: Record<string, string> = {};
        for (const [k, v] of Object.entries(headers)) {
          if (typeof v === 'string') lower[k.toLowerCase()] = v;
        }
        // Fallback chain ordered from most to least specific. First
        // populated header wins — `x-forwarded-for` may carry a list
        // (proxy chain); the original client is the leftmost entry.
        const ipChain = ['x-forwarded-for', 'cf-connecting-ip', 'x-real-ip', 'x-client-ip'];
        for (const h of ipChain) {
          const raw = lower[h];
          if (raw) {
            const first = raw.split(',')[0]?.trim();
            if (first) {
              triggerPrincipalIp = first;
              break;
            }
          }
        }
        if (lower['user-agent']) {
          triggerPrincipalUserAgent = lower['user-agent'].slice(0, 500);
        }
      }
    } catch {
      // No upstream Webhook node, or the expression failed — skip silently.
    }
  }

  const node = ctx.getNode();
  const auditCtx = {
    sessionId,
    traceId,
    executionId,
    agentName,
    workflowId,
    workflowName,
  };
  const sessionOpen: AuditEvent = {
    type: 'session_open',
    traceId,
    sessionId,
    timestamp: startedAt,
    framework,
    workflowId,
    nodeId: node.id,
    metadata: buildAuditMetadata(auditCtx, node, {
      session_id_mode: mode,
      framework_version: safeFrameworkVersion() ?? TRACER_VERSION,
      ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
      ...(triggerPrincipalIp !== undefined ? { trigger_principal_ip: triggerPrincipalIp } : {}),
      ...(triggerPrincipalUserAgent !== undefined
        ? { trigger_principal_user_agent: triggerPrincipalUserAgent }
        : {}),
    }),
  };
  void auditLog(ctx, sessionOpen, baseUrl);

  return {
    ...item.json,
    sessionId,
    traceId,
    startedAt,
    executionId,
    agentName,
  };
}

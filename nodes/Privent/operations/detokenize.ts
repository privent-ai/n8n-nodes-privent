import { createHash } from 'node:crypto';
import type { IDataObject, IExecuteFunctions, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { AuditEvent } from '@priventai/core';
import { scanForTokens, detokenizeDeep } from '@priventai/core';
import {
  N8nHttpVault,
  auditLog,
  buildAuditMetadata,
  makeResolvedVault,
  resolveContext,
  safeTriggerMode,
  sha256short,
} from '../../../shared/privent-http.js';

/**
 * Returns true if `url` starts with any of the given prefixes.
 * Used for trusted-sink enforcement in strict mode.
 */
function matchesTrustedSink(url: string, trusted: string[]): boolean {
  if (trusted.length === 0) return true;
  return trusted.some((prefix) => url.startsWith(prefix.trim()));
}

/**
 * Opaque, path-sensitive fingerprint of the destination URL — first 16 hex
 * chars of SHA-256(sinkUrl).  Two calls to the same URL yield the same
 * fingerprint (groupable); two paths on the same host yield different
 * fingerprints (path-level visibility for the sink catalog).  Truncation is
 * safe: the value is a non-cryptographic group key, never an auth token.
 */
export function deriveSinkId(sinkUrl: string): string | null {
  if (!sinkUrl) return null;
  return createHash('sha256').update(sinkUrl).digest('hex').slice(0, 16);
}

/**
 * Human-readable host of the destination URL (e.g. `api.salesforce.com`),
 * intended for display in the sink catalog.  Falls back to a 64-char
 * truncation so malformed URLs still surface something renderable.
 */
export function deriveSinkUrlHost(sinkUrl: string): string | null {
  if (!sinkUrl) return null;
  try {
    return new URL(sinkUrl).host;
  } catch {
    return sinkUrl.slice(0, 64);
  }
}

/** `detokenize` resource → `detokenize` operation. Migrated from PriventDetokenize. */
export async function handleDetokenize(
  ctx: IExecuteFunctions,
  i: number,
  baseUrl: string,
): Promise<IDataObject> {
  const item = ctx.getInputData()[i]!;
  const triggerMode = safeTriggerMode(ctx);

  const sessionId = ctx.getNodeParameter('sessionId', i) as string;
  const targetField = ctx.getNodeParameter('targetField', i) as string;
  const strict = ctx.getNodeParameter('strict', i) as boolean;
  const traceIdParam = ctx.getNodeParameter('traceId', i, '') as string;
  const agentNameParam = ctx.getNodeParameter('agentName', i, '') as string;

  let sinkUrl = '';
  let isTrusted = true;
  if (strict) {
    sinkUrl = ctx.getNodeParameter('sinkUrl', i) as string;
    const trustedRaw = ctx.getNodeParameter('trustedSinks', i) as string;
    const trusted = trustedRaw.split(',').map((s) => s.trim()).filter(Boolean);
    isTrusted = matchesTrustedSink(sinkUrl, trusted);
  }

  const sinkId = deriveSinkId(sinkUrl);
  const sinkUrlHost = deriveSinkUrlHost(sinkUrl);
  const targetAgentName = (
    (ctx.getNodeParameter('targetAgentName', i, '') as string) ?? ''
  ).trim();
  const ctxAudit = resolveContext(ctx, sessionId, traceIdParam, agentNameParam);
  const node = ctx.getNode();

  if (!isTrusted) {
    // Strict mode: sink not trusted — pass the item through unchanged and
    // mark it so the caller knows detokenization was skipped.
    const blockedEvent: AuditEvent = {
      type: 'detokenize',
      traceId: ctxAudit.traceId,
      sessionId,
      timestamp: Date.now(),
      framework: 'n8n',
      workflowId: ctxAudit.workflowId,
      nodeId: node.id,
      ...(targetAgentName ? { targetAgentName } : {}),
      metadata: buildAuditMetadata(ctxAudit, node, {
        sink_id: sinkId,
        sink_url_host: sinkUrlHost,
        sink_trusted: false,
        strict: true,
        tokens_redeemed: 0,
        reason: 'strict-mode-block',
        ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
      }),
    };
    void auditLog(ctx, blockedEvent, baseUrl);

    return {
      ...item.json,
      privent: {
        sessionId,
        detokenized: false,
        reason: 'strict-mode: destination URL not in trusted sinks list',
      },
    };
  }

  const vault = new N8nHttpVault(ctx, sessionId, baseUrl);

  const scanTarget =
    targetField === '*' ? item.json : (item.json as Record<string, unknown>)[targetField];
  const placeholders = [...scanForTokens(scanTarget)];
  const tokensRedeemed = placeholders.length;

  // Placeholder fingerprint: hashes the token placeholder strings (e.g.
  // "[EMAIL_001]|[PHONE_002]"), NOT the underlying PII values. Raw values
  // never enter the hash input — `vault.retrieve` is intentionally not
  // called for fingerprinting. See plan §B for the security rationale.
  const uniqPlaceholders = [...new Set(placeholders)].sort();
  const valueFingerprint =
    uniqPlaceholders.length > 0 ? await sha256short(uniqPlaceholders.join(' ')) : null;
  const valueFingerprints = await Promise.all(uniqPlaceholders.map((p) => sha256short(p)));

  // One batch retrieve for all scanned tokens, then resolve locally so the
  // deep-walk costs zero extra round-trips.
  let entries;
  try {
    entries = await vault.retrieveBatch([...new Set(placeholders)]);
  } catch (err) {
    throw new NodeApiError(ctx.getNode(), err as JsonObject, { itemIndex: i });
  }
  const resolvedVault = makeResolvedVault(sessionId, entries);

  let json: IDataObject;
  if (targetField === '*') {
    json = (await detokenizeDeep(item.json, resolvedVault)) as IDataObject;
  } else {
    const fieldValue = (item.json as Record<string, unknown>)[targetField];
    const resolved = await detokenizeDeep(fieldValue, resolvedVault);
    json = { ...item.json, [targetField]: resolved } as IDataObject;
  }

  const event: AuditEvent = {
    type: 'detokenize',
    traceId: ctxAudit.traceId,
    sessionId,
    timestamp: Date.now(),
    framework: 'n8n',
    workflowId: ctxAudit.workflowId,
    nodeId: node.id,
    ...(targetAgentName ? { targetAgentName } : {}),
    metadata: buildAuditMetadata(ctxAudit, node, {
      sink_id: sinkId,
      sink_url_host: sinkUrlHost,
      sink_trusted: isTrusted,
      strict,
      tokens_redeemed: tokensRedeemed,
      value_fingerprint: valueFingerprint,
      value_fingerprints: valueFingerprints,
      ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
    }),
  };
  void auditLog(ctx, event, baseUrl);

  return {
    ...json,
    privent: { sessionId, detokenized: true },
  };
}

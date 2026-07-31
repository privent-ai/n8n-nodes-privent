import { createHash } from 'node:crypto';
import type { IDataObject, IExecuteFunctions, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import type { AuditEvent } from '@priventai/core';
import { scanForTokens, detokenizeDeep } from '@priventai/core';
import {
  N8nHttpVault,
  WorkflowStaticDataVault,
  auditLog,
  buildAuditMetadata,
  authWarning,
  getAuthMode,
  makeResolvedVault,
  resolveContext,
  safeTriggerMode,
  sha256short,
  type SessionVault,
} from '../../../shared/privent-http.js';

/**
 * Returns true if `url` starts with any of the given prefixes.
 * Used for trusted-sink enforcement in strict mode — reached ONLY from the
 * `if (strict)` branch below, so a non-strict run never consults it.
 *
 * An empty list means nothing is trusted, not everything. Reading an empty
 * configuration as permission is what made Strict Mode a no-op for anyone who
 * turned it on without filling the list in.
 */
function matchesTrustedSink(url: string, trusted: string[]): boolean {
  if (trusted.length === 0) return false;
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
  vaultBackend?: 'memory' | 'cloud',
): Promise<IDataObject> {
  const t0 = Date.now(); // op wall-clock → audit latency_ms
  const item = ctx.getInputData()[i]!;
  const triggerMode = safeTriggerMode(ctx);

  const authMode = getAuthMode(ctx);
  let sessionId = (ctx.getNodeParameter('sessionId', i, '') as string).trim();
  if (authMode === 'local' && !sessionId) {
    // Session is optional in local mode: fall back to the id the upstream local
    // Tokenize emitted on the item.
    const upstream = (item.json as { privent?: { sessionId?: unknown } }).privent;
    sessionId = typeof upstream?.sessionId === 'string' ? upstream.sessionId : '';
    if (!sessionId) {
      throw new NodeOperationError(
        ctx.getNode(),
        'No session id — add a Privent Tokenize node upstream, or set Session ID.',
        { itemIndex: i },
      );
    }
  }
  const targetField = ctx.getNodeParameter('targetField', i) as string;
  const strict = ctx.getNodeParameter('strict', i) as boolean;
  const traceIdParam = ctx.getNodeParameter('traceId', i, '') as string;
  const agentNameParam = ctx.getNodeParameter('agentName', i, '') as string;

  let sinkUrl = '';
  let isTrusted = true;
  let noTrustedSinks = false;
  if (strict) {
    sinkUrl = ctx.getNodeParameter('sinkUrl', i) as string;
    const trustedRaw = ctx.getNodeParameter('trustedSinks', i) as string;
    const trusted = trustedRaw.split(',').map((s) => s.trim()).filter(Boolean);
    noTrustedSinks = trusted.length === 0;
    isTrusted = matchesTrustedSink(sinkUrl, trusted);
  }

  const sinkId = deriveSinkId(sinkUrl);
  const sinkUrlHost = deriveSinkUrlHost(sinkUrl);
  const targetAgentName = (
    (ctx.getNodeParameter('targetAgentName', i, '') as string) ?? ''
  ).trim();
  const ctxAudit = resolveContext(ctx, sessionId, traceIdParam, agentNameParam, vaultBackend);
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
      latencyMs: Date.now() - t0,
      ...(targetAgentName ? { targetAgentName } : {}),
      metadata: buildAuditMetadata(ctxAudit, node, {
        sink_id: sinkId,
        sink_url_host: sinkUrlHost,
        sink_trusted: false,
        strict: true,
        tokens_redeemed: 0,
        reason: noTrustedSinks ? 'strict-mode-no-trusted-sinks' : 'strict-mode-block',
        ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
      }),
    };
    void auditLog(ctx, blockedEvent, baseUrl);

    return {
      ...item.json,
      privent: {
        ...(authWarning(ctx) ? { authWarning: authWarning(ctx) } : {}),
        sessionId,
        detokenized: false,
        reason: noTrustedSinks
          ? 'Strict Mode is on but no Trusted Sinks are configured, so the original values were not restored — add the destination URL to Trusted Sinks, or turn Strict Mode off.'
          : 'Strict Mode blocked restoring the original values because the destination URL is not in Trusted Sinks — add it to the list, or turn Strict Mode off.',
      },
    };
  }

  const vault: SessionVault =
    authMode !== 'apiKey'
      ? new WorkflowStaticDataVault(ctx, sessionId)
      : new N8nHttpVault(ctx, sessionId, baseUrl);

  const scanTarget =
    targetField === '*' ? item.json : (item.json as Record<string, unknown>)[targetField];
  const placeholders = [...scanForTokens(scanTarget)];

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

  // Tokens FOUND and tokens REDEEMED are two different numbers, and this node
  // used to report the first one under the second one's name. A placeholder the
  // scanner can see but the vault cannot resolve — expired, minted in another
  // session, or minted in a case this grammar refuses (see NP-M) — left the text
  // unchanged while `detokenized: true` and a non-zero `tokens_redeemed` said
  // otherwise. The gap between the two numbers IS the signal that tokens were
  // present and unresolvable, so both are reported and success is derived from
  // the second, never the first.
  const tokensRedeemed = new Set(entries.map((e) => e.token)).size;
  const detokenized = uniqPlaceholders.length > 0 && tokensRedeemed === uniqPlaceholders.length;
  const reason =
    uniqPlaceholders.length === 0
      ? 'No Privent tokens were found, so nothing was restored — check that Target Field points at the text that holds the [KIND_NNN] placeholders.'
      : `Only ${tokensRedeemed} of the ${uniqPlaceholders.length} Privent tokens found could be restored — the rest are unknown to the vault under this Session ID, so their placeholders were left in place.`;

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
    latencyMs: Date.now() - t0,
    ...(targetAgentName ? { targetAgentName } : {}),
    metadata: buildAuditMetadata(ctxAudit, node, {
      sink_id: sinkId,
      sink_url_host: sinkUrlHost,
      sink_trusted: isTrusted,
      strict,
      tokens_found: uniqPlaceholders.length,
      tokens_redeemed: tokensRedeemed,
      detokenized,
      value_fingerprint: valueFingerprint,
      value_fingerprints: valueFingerprints,
      ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
    }),
  };
  void auditLog(ctx, event, baseUrl);

  return {
    ...json,
    privent: {
      ...(authWarning(ctx) ? { authWarning: authWarning(ctx) } : {}),
      sessionId,
      detokenized,
      ...(detokenized ? {} : { reason }),
    },
  };
}

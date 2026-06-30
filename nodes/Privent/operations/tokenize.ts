import type { IDataObject, IExecuteFunctions, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import type { AuditEvent, EntityKind, RegexDetector } from '@priventai/core';
import { DEFAULT_DETECTORS } from '@priventai/core';
import {
  N8nHttpVault,
  WorkflowStaticDataVault,
  auditLog,
  buildAuditMetadata,
  buildLocalDetectors,
  getAuthMode,
  resolveContext,
  riskScore,
  safeTriggerMode,
  type SessionVault,
} from '../../../shared/privent-http.js';
import { isLocalFalsePositive } from '../../../shared/local-detectors.js';

/** A detected span in the source text (regex or backend ML), detection order. */
interface Span {
  kind: EntityKind;
  value: string;
  index: number;
  length: number;
  confidence: number;
  source: 'regex' | 'model' | 'hint';
}

// On an exact-span tie, the more-specific source wins (ML over a generic hint
// over a regex). For regex-only (local) detection all sources are 'regex', so
// this rank is a no-op and ordering matches the previous behavior exactly.
const SOURCE_RANK: Record<Span['source'], number> = { model: 0, hint: 1, regex: 2 };

/**
 * Longest span wins on overlap; total ordering for determinism. Mirrors core's
 * `removeOverlaps` (tokenizer/hybrid.ts) so the regex pass stays byte-identical;
 * also used to merge regex + backend-ML spans into one non-overlapping set.
 */
function removeOverlaps(spans: Span[]): Span[] {
  const sorted = [...spans].sort(
    (a, b) =>
      a.index - b.index ||
      b.length - a.length ||
      SOURCE_RANK[a.source] - SOURCE_RANK[b.source] ||
      a.kind.localeCompare(b.kind) ||
      a.value.localeCompare(b.value),
  );
  const kept: Span[] = [];
  let lastEnd = -1;
  for (const s of sorted) {
    if (s.index >= lastEnd) {
      kept.push(s);
      lastEnd = s.index + s.length;
    }
  }
  return kept;
}

/**
 * Pure regex detection — mirrors the regex pass in core's `HybridTokenizer`
 * (tokenizer/hybrid.ts). Reimplemented here (rather than importing the class)
 * because `hybrid.ts` statically pulls the ML extractor + http client, which
 * would drag `process`/fetch into this Cloud-verified bundle.
 *
 * NOTE: regex only finds structured PII (email/phone/SSN/card/…). Person names,
 * dates of birth and street addresses are NOT detectable by regex — those come
 * from the backend ML pass (auto/cloud modes only).
 */
function detectMatches(
  text: string,
  detectors: readonly RegexDetector[],
  opts: { preserveFlags?: boolean } = {},
): Span[] {
  const matches: Span[] = [];
  for (const detector of detectors) {
    // Default: rebuild with `g` only (drops other flags) — keeps the apiKey/
    // tokenless core path byte-identical. Local passes preserveFlags so the
    // pre-built global regex (with its original i/s/m flags) is reused as-is;
    // matchAll clones it internally, so sharing the object across calls is safe.
    const re = opts.preserveFlags ? detector.regex : new RegExp(detector.regex.source, 'g');
    for (const m of text.matchAll(re)) {
      if (m.index == null) continue;
      const raw = m[0];
      if (detector.validate && !detector.validate(raw)) continue;
      matches.push({
        kind: detector.kind,
        value: raw,
        index: m.index,
        length: raw.length,
        confidence: detector.confidence,
        source: 'regex',
      });
    }
  }
  return removeOverlaps(matches);
}

/**
 * `tokenize` in `local` (no-backend) mode: regex-only detection over the
 * Detection-Level-gated detector set, an in-memory vault, and ZERO network
 * (no riskScore, no audit). Session id is optional — auto-generated and emitted
 * on the item so a downstream local Detokenize can pick it up.
 */
async function handleTokenizeLocal(ctx: IExecuteFunctions, i: number): Promise<IDataObject> {
  const item = ctx.getInputData()[i]!;
  const textField = ctx.getNodeParameter('textField', i) as string;
  const level = ctx.getNodeParameter('detectionLevel', i, 'standard') as 'standard' | 'aggressive';
  const sessionIdParam = (ctx.getNodeParameter('sessionId', i, '') as string).trim();
  const sessionId = sessionIdParam || crypto.randomUUID();

  const text = (item.json as Record<string, unknown>)[textField];
  if (typeof text !== 'string') {
    throw new NodeOperationError(
      ctx.getNode(),
      `Field "${textField}" is not a string. Got: ${typeof text}`,
      {
        itemIndex: i,
        description:
          'Check the "Text Field" parameter — it should match the property name in your input data.',
      },
    );
  }

  const detectors = buildLocalDetectors(level);
  const spans = removeOverlaps(
    detectMatches(text, detectors, { preserveFlags: true }).filter(
      (s) => !isLocalFalsePositive(s.value, s.kind),
    ),
  )
    .filter((s) => s.length > 0 && s.index >= 0 && s.index + s.length <= text.length)
    .map((s) => ({ ...s, value: text.slice(s.index, s.index + s.length) }));

  const vault = new WorkflowStaticDataVault(ctx, sessionId);
  let tokenizedText = text;
  const entities: Array<{
    token: string;
    kind: EntityKind;
    confidence: number;
    source: Span['source'];
  }> = [];
  if (spans.length > 0) {
    const batched = await vault.findOrCreateBatch(spans.map((s) => ({ kind: s.kind, value: s.value })));
    const withTokens = spans.map((s, idx) => ({ ...s, token: batched[idx]?.token }));
    for (const s of [...withTokens].sort((a, b) => b.index - a.index)) {
      if (s.token == null) continue;
      tokenizedText =
        tokenizedText.slice(0, s.index) + s.token + tokenizedText.slice(s.index + s.length);
    }
    for (const s of withTokens) {
      if (s.token == null) continue;
      entities.push({ token: s.token, kind: s.kind, confidence: s.confidence, source: s.source });
    }
    entities.sort((a, b) => a.token.localeCompare(b.token));
  }

  return {
    ...item.json,
    [textField]: tokenizedText,
    privent: {
      sessionId,
      entities: entities.map((e) => ({
        token: e.token,
        kind: e.kind,
        confidence: e.confidence,
        source: e.source,
      })),
      risk: null,
      flaggedForReview: false,
    },
  };
}

/** `tokenize` resource → `tokenize` operation. Migrated from PriventTokenize. */
export async function handleTokenize(
  ctx: IExecuteFunctions,
  i: number,
  baseUrl: string,
): Promise<IDataObject> {
  // Local (no-backend) mode runs an entirely separate regex-only path; the
  // apiKey/tokenless body below is left untouched.
  if (getAuthMode(ctx) === 'local') return handleTokenizeLocal(ctx, i);

  const item = ctx.getInputData()[i]!;
  const triggerMode = safeTriggerMode(ctx);

  const sessionId = ctx.getNodeParameter('sessionId', i) as string;
  const textField = ctx.getNodeParameter('textField', i) as string;
  const detectionMode = ctx.getNodeParameter('detectionMode', i) as 'auto' | 'local' | 'cloud';
  const reviewThreshold =
    detectionMode !== 'local' ? (ctx.getNodeParameter('reviewThreshold', i) as number) : 1;
  const traceIdParam = ctx.getNodeParameter('traceId', i, '') as string;
  const agentNameParam = ctx.getNodeParameter('agentName', i, '') as string;

  const text = (item.json as Record<string, unknown>)[textField];
  if (typeof text !== 'string') {
    throw new NodeOperationError(
      ctx.getNode(),
      `Field "${textField}" is not a string. Got: ${typeof text}`,
      {
        itemIndex: i,
        description:
          'Check the "Text Field" parameter — it should match the property name in your input data.',
      },
    );
  }

  const vault: SessionVault =
    getAuthMode(ctx) === 'tokenless'
      ? new WorkflowStaticDataVault(ctx, sessionId)
      : new N8nHttpVault(ctx, sessionId, baseUrl);

  // 1. Local regex detection — structured PII only (no names/DOB/address).
  const localSpans = detectMatches(text, DEFAULT_DETECTORS);

  // 2. auto/cloud: ONE /v1/risk/score on the ORIGINAL text — returns the
  //    ML entities (names/DOB/address + structured) AND the risk score in
  //    a single call. Privacy: the original text reaches Privent's TRUSTED
  //    detector only; the external LLM still receives just the tokenized
  //    text produced below, so raw PHI never reaches the untrusted model.
  let risk = null;
  let flaggedForReview = false;
  const backendSpans: Span[] = [];
  if (detectionMode !== 'local') {
    try {
      const scored = await riskScore(ctx, text, baseUrl, {
        lang: 'auto',
        bootstrapEntities: localSpans.map((s) => ({
          kind: s.kind,
          value: s.value,
          span: [s.index, s.index + s.length] as [number, number],
          confidence: s.confidence,
          source: 'regex' as const,
        })),
      });
      risk = scored;
      for (const e of scored.entities ?? []) {
        backendSpans.push({
          kind: e.kind,
          value: e.value,
          index: e.span[0],
          length: e.span[1] - e.span[0],
          confidence: e.confidence,
          source: e.source,
        });
      }
      if (risk.risk_score >= reviewThreshold) flaggedForReview = true;
    } catch (err) {
      // cloud: ML is required — surface the failure as a NodeApiError so the
      // HTTP status + response body reach the n8n UI. auto: degrade to
      // regex-only masking (risk stays null) so the data path never breaks.
      if (detectionMode === 'cloud') {
        throw new NodeApiError(ctx.getNode(), err as JsonObject, { itemIndex: i });
      }
    }
  }

  // 3. Merge regex + ML spans → one ordered, non-overlapping set. Guard
  //    malformed spans; canonicalize the value to the exact substring so
  //    the vault stores what we replace (detokenize round-trip fidelity).
  const merged = removeOverlaps([...localSpans, ...backendSpans])
    .filter((s) => s.length > 0 && s.index >= 0 && s.index + s.length <= text.length)
    .map((s) => ({ ...s, value: text.slice(s.index, s.index + s.length) }));

  // 4. One find-or-create-batch → right-to-left replace (indices stay valid).
  let tokenizedText = text;
  const entities: Array<{
    token: string;
    kind: EntityKind;
    confidence: number;
    source: Span['source'];
    span: [number, number];
  }> = [];
  if (merged.length > 0) {
    let batched;
    try {
      batched = await vault.findOrCreateBatch(merged.map((s) => ({ kind: s.kind, value: s.value })));
    } catch (err) {
      throw new NodeApiError(ctx.getNode(), err as JsonObject, { itemIndex: i });
    }
    const withTokens = merged.map((s, idx) => ({ ...s, token: batched[idx]?.token }));
    for (const s of [...withTokens].sort((a, b) => b.index - a.index)) {
      if (s.token == null) continue;
      tokenizedText =
        tokenizedText.slice(0, s.index) + s.token + tokenizedText.slice(s.index + s.length);
    }
    for (const s of withTokens) {
      if (s.token == null) continue;
      entities.push({
        token: s.token,
        kind: s.kind,
        confidence: s.confidence,
        source: s.source,
        span: [s.index, s.index + s.length],
      });
    }
    entities.sort((a, b) => a.span[0] - b.span[0]);
  }

  const ctxAudit = resolveContext(ctx, sessionId, traceIdParam, agentNameParam);
  const node = ctx.getNode();
  const tokenizeEvent: AuditEvent = {
    type: 'tokenize',
    traceId: ctxAudit.traceId,
    sessionId,
    timestamp: Date.now(),
    framework: 'n8n',
    workflowId: ctxAudit.workflowId,
    nodeId: node.id,
    metadata: buildAuditMetadata(ctxAudit, node, {
      entity_kinds: [...new Set(entities.map((e) => e.kind))],
      entity_count: entities.length,
      risk_score: risk?.risk_score ?? null,
      risk_level: risk?.risk_level ?? null,
      flagged_for_review: flaggedForReview,
      detection_mode: detectionMode,
      ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
    }),
  };
  void auditLog(ctx, tokenizeEvent, baseUrl);

  return {
    ...item.json,
    [textField]: tokenizedText,
    privent: {
      sessionId,
      entities: entities.map((e) => ({
        token: e.token,
        kind: e.kind,
        confidence: e.confidence,
        source: e.source,
      })),
      risk,
      flaggedForReview,
    },
  };
}

import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import type { AuditEvent, EntityKind, RegexDetector } from '@priventai/core';
import { DEFAULT_DETECTORS } from '@priventai/core';
import {
  N8nHttpVault,
  auditLog,
  buildAuditMetadata,
  getPriventBaseUrl,
  resolveContext,
  riskScore,
  safeTriggerMode,
} from '../../shared/privent-http.js';

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
): Span[] {
  const matches: Span[] = [];
  for (const detector of detectors) {
    const re = new RegExp(detector.regex.source, 'g');
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

export class PriventTokenize implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Privent Tokenize',
    name: 'priventTokenize',
    icon: 'file:privent.png',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["detectionMode"]}}',
    description:
      'Replaces sensitive values with reversible [KIND_NNN] placeholders before the text reaches an LLM or external service. Auto/Cloud modes also mask ML-detected names, dates of birth and addresses; Local mode is regex-only (structured PII).',
    defaults: { name: 'Privent Tokenize' },
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
        description:
          'Session ID from the Privent Session node upstream in this workflow. Tokens are scoped to this session — Detokenize must use the same ID.',
        hint: 'Add a Privent Session node at the start of your workflow to generate this value.',
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
        displayName: 'Text Field',
        name: 'textField',
        type: 'string',
        default: 'text',
        required: true,
        description: 'Name of the input item property that contains the text to tokenize',
      },
      {
        displayName: 'Detection Mode',
        name: 'detectionMode',
        type: 'options',
        options: [
          {
            name: 'Auto (Regex + ML Fallback)',
            value: 'auto',
            description:
              'Uses local regex patterns + Privent Cloud ML when available. Falls back to regex-only if cloud is unreachable.',
          },
          {
            name: 'Local Only (Regex)',
            value: 'local',
            description:
              'Regex-only detection (structured PII: emails, phones, SSN, cards, …). No network calls, no risk scoring — deterministic and fast. Does NOT mask names, dates of birth or addresses; use Auto or Cloud for full PHI coverage.',
          },
          {
            name: 'Cloud (Regex + ML)',
            value: 'cloud',
            description:
              'Forces the ML extraction pass. Fails if Privent Cloud is unreachable.',
          },
        ],
        default: 'auto',
        description: 'Controls entity extraction strategy and whether to call Privent Cloud ML',
      },
      {
        displayName: 'Flag for Review Above Risk Score',
        name: 'reviewThreshold',
        type: 'number',
        typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
        default: 0.9,
        description:
          'When Privent Cloud returns a risk score at or above this value, the item is flagged with privent.flaggedForReview = true. The workflow continues — use an IF or Switch node to route flagged items.',
        displayOptions: { hide: { detectionMode: ['local'] } },
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
        const sessionId = this.getNodeParameter('sessionId', i) as string;
        const textField = this.getNodeParameter('textField', i) as string;
        const detectionMode = this.getNodeParameter('detectionMode', i) as 'auto' | 'local' | 'cloud';
        const reviewThreshold = detectionMode !== 'local'
          ? (this.getNodeParameter('reviewThreshold', i) as number)
          : 1;
        const traceIdParam = this.getNodeParameter('traceId', i, '') as string;
        const agentNameParam = this.getNodeParameter('agentName', i, '') as string;

        const text = (item.json as Record<string, unknown>)[textField];
        if (typeof text !== 'string') {
          throw new NodeOperationError(
            this.getNode(),
            `Field "${textField}" is not a string. Got: ${typeof text}`,
            {
              itemIndex: i,
              description: 'Check the "Text Field" parameter — it should match the property name in your input data.',
            },
          );
        }

        const vault = new N8nHttpVault(this, sessionId, baseUrl);

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
            const scored = await riskScore(this, text, baseUrl, {
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
            // cloud: ML is required — surface the failure. auto: degrade to
            // regex-only masking (risk stays null) so the data path never breaks.
            if (detectionMode === 'cloud') throw err;
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
          const batched = await vault.findOrCreateBatch(
            merged.map((s) => ({ kind: s.kind, value: s.value })),
          );
          const withTokens = merged.map((s, idx) => ({ ...s, token: batched[idx]?.token }));
          for (const s of [...withTokens].sort((a, b) => b.index - a.index)) {
            if (s.token == null) continue;
            tokenizedText = tokenizedText.slice(0, s.index) + s.token + tokenizedText.slice(s.index + s.length);
          }
          for (const s of withTokens) {
            if (s.token == null) continue;
            entities.push({ token: s.token, kind: s.kind, confidence: s.confidence, source: s.source, span: [s.index, s.index + s.length] });
          }
          entities.sort((a, b) => a.span[0] - b.span[0]);
        }

        const ctx = resolveContext(this, sessionId, traceIdParam, agentNameParam);
        const node = this.getNode();
        const tokenizeEvent: AuditEvent = {
          type: 'tokenize',
          traceId: ctx.traceId,
          sessionId,
          timestamp: Date.now(),
          framework: 'n8n',
          workflowId: ctx.workflowId,
          nodeId: node.id,
          metadata: buildAuditMetadata(ctx, node, {
            entity_kinds: [...new Set(entities.map((e) => e.kind))],
            entity_count: entities.length,
            risk_score: risk?.risk_score ?? null,
            risk_level: risk?.risk_level ?? null,
            flagged_for_review: flaggedForReview,
            detection_mode: detectionMode,
            ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
          }),
        };
        void auditLog(this, tokenizeEvent, baseUrl);

        out.push({
          json: {
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
          },
          pairedItem: { item: i },
        });
      } catch (err) {
        if (this.continueOnFail()) {
          out.push({ json: { error: (err as Error).message }, pairedItem: { item: i } });
          continue;
        }
        throw err;
      }
    }

    return [out];
  }
}

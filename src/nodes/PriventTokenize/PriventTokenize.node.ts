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

/** A regex hit in the source text, in detection order. */
interface DetectionMatch {
  kind: EntityKind;
  raw: string;
  index: number;
  length: number;
  confidence: number;
}

/**
 * Pure regex detection — mirrors the regex pass + overlap removal in core's
 * `HybridTokenizer` (tokenizer/hybrid.ts). Reimplemented here (rather than
 * importing the class) because `hybrid.ts` statically pulls the ML extractor +
 * http client, which would drag `process`/fetch into this Cloud-verified
 * bundle. Keep in sync with core's `removeOverlaps` ordering.
 */
function detectMatches(
  text: string,
  detectors: readonly RegexDetector[],
): DetectionMatch[] {
  const matches: DetectionMatch[] = [];
  for (const detector of detectors) {
    const re = new RegExp(detector.regex.source, 'g');
    for (const m of text.matchAll(re)) {
      if (m.index == null) continue;
      const raw = m[0];
      if (detector.validate && !detector.validate(raw)) continue;
      matches.push({
        kind: detector.kind,
        raw,
        index: m.index,
        length: raw.length,
        confidence: detector.confidence,
      });
    }
  }
  // Longest span wins on overlap; total ordering for determinism.
  matches.sort(
    (a, b) =>
      a.index - b.index ||
      b.length - a.length ||
      a.kind.localeCompare(b.kind) ||
      a.raw.localeCompare(b.raw),
  );
  const kept: DetectionMatch[] = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.index >= lastEnd) {
      kept.push(m);
      lastEnd = m.index + m.length;
    }
  }
  return kept;
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
      'Replaces sensitive values (emails, phones, API keys, etc.) with reversible [KIND_NNN] placeholders before the text reaches an LLM or external service.',
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
              'Regex-only detection. No network calls. No risk scoring. Deterministic and fast.',
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

        // Pure regex detection → one find-or-create-batch → right-to-left replace.
        const matches = detectMatches(text, DEFAULT_DETECTORS);
        const vault = new N8nHttpVault(this, sessionId, baseUrl);

        let tokenizedText = text;
        const entities: Array<{ token: string; kind: EntityKind; confidence: number; span: [number, number] }> = [];
        if (matches.length > 0) {
          const batched = await vault.findOrCreateBatch(
            matches.map((m) => ({ kind: m.kind, value: m.raw })),
          );
          const withTokens = matches.map((m, idx) => ({ ...m, token: batched[idx]?.token }));
          // Replace right-to-left so earlier span indices stay valid.
          for (const m of [...withTokens].sort((a, b) => b.index - a.index)) {
            if (m.token == null) continue;
            tokenizedText = tokenizedText.slice(0, m.index) + m.token + tokenizedText.slice(m.index + m.length);
          }
          for (const m of withTokens) {
            if (m.token == null) continue;
            entities.push({ token: m.token, kind: m.kind, confidence: m.confidence, span: [m.index, m.index + m.length] });
          }
          entities.sort((a, b) => a.span[0] - b.span[0]);
        }

        let risk = null;
        let flaggedForReview = false;

        if (detectionMode !== 'local') {
          risk = await riskScore(this, tokenizedText, baseUrl);
          if (risk.risk_score >= reviewThreshold) {
            flaggedForReview = true;
          }
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

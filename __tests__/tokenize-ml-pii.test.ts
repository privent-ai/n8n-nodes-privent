import { describe, expect, it, vi } from 'vitest';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PriventTokenize } from '../nodes/PriventTokenize/PriventTokenize.node.js';
import { PriventDetokenize } from '../nodes/PriventDetokenize/PriventDetokenize.node.js';

const SESSION_ID = '123e4567-e89b-42d3-a456-426614174abc';

// A healthcare-style line: regex finds the email; only the backend ML pass can
// find the person name, date of birth and street address.
const TEXT = 'Jane Doe (DOB 1985-03-12) at 123 Main St, email jane@example.com';
const NAME = 'Jane Doe';
const DOB = '1985-03-12';
const ADDRESS = '123 Main St';
const EMAIL = 'jane@example.com';

function span(value: string): [number, number] {
  const start = TEXT.indexOf(value);
  return [start, start + value.length];
}

/**
 * Stand-in for Privent Cloud: the vault (find-or-create / retrieve, kind-aware)
 * plus /v1/risk/score returning ML model entities (names/DOB/address) on the
 * ORIGINAL text. Shared across Tokenize + Detokenize execs.
 */
function makeServer() {
  const tokenByKey = new Map<string, string>();
  const rowByToken = new Map<string, { kind: string; value: string }>();
  let counter = 0;
  const calls: Array<{ url: string; body: Record<string, unknown> }> = [];

  const handler = vi.fn(
    async (_cred: string, opts: { url: string; body: Record<string, unknown> }) => {
      const { url, body } = opts;
      calls.push({ url, body });

      if (url === '/v1/vault/find-or-create-batch') {
        const items = body.items as Array<{ kind: string; normalizedValue: string; originalValue: string }>;
        const tokens = items.map((it) => {
          const key = `${it.kind}:${it.normalizedValue}`;
          let token = tokenByKey.get(key);
          if (token == null) {
            counter += 1;
            token = `[${it.kind}_${String(counter).padStart(3, '0')}]`;
            tokenByKey.set(key, token);
            rowByToken.set(token, { kind: it.kind, value: it.originalValue });
          }
          return { kind: it.kind, value: it.normalizedValue, token };
        });
        return { tokens };
      }

      if (url === '/v1/vault/retrieve-batch') {
        const toks = body.tokens as string[];
        const entries = toks
          .filter((t) => rowByToken.has(t))
          .map((t) => ({ token: t, kind: rowByToken.get(t)!.kind, value: rowByToken.get(t)!.value }));
        return { entries };
      }

      if (url === '/v1/risk/score') {
        return {
          risk_score: 0.95,
          risk_level: 'CRITICAL',
          categories: { 'PII / customer data': 0.95 },
          model: 'nuextract-2pass',
          latency_ms: 120,
          entities: [
            { kind: 'PERSON', value: NAME, span: span(NAME), confidence: 0.99, source: 'model' },
            { kind: 'DATE_OF_BIRTH', value: DOB, span: span(DOB), confidence: 0.97, source: 'model' },
            { kind: 'ADDRESS', value: ADDRESS, span: span(ADDRESS), confidence: 0.96, source: 'model' },
          ],
        };
      }

      return {};
    },
  );

  return { handler, calls };
}

function makeExec(
  node: { id: string; name: string; type: string },
  params: Record<string, unknown>,
  items: INodeExecutionData[],
  handler: ReturnType<typeof vi.fn>,
): IExecuteFunctions {
  return {
    getInputData: () => items,
    getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
      name in params ? params[name] : fallback,
    getCredentials: async () => ({ apiKey: 'k', baseUrl: 'https://api.test.local', vaultBackend: 'cloud' }),
    getNode: () => node,
    getExecutionId: () => 'exec-ml',
    getWorkflow: () => ({ id: 'wf-ml', name: 'ml-pii' }),
    getMode: () => 'manual',
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: { httpRequestWithAuthentication: handler },
  } as unknown as IExecuteFunctions;
}

describe('PriventTokenize — ML PII masking (auto mode)', () => {
  it('masks name/DOB/address (ML) + email (regex), one risk call, round-trips', async () => {
    const { handler, calls } = makeServer();

    const tokOut = await new PriventTokenize().execute.call(
      makeExec(
        { id: 'n-tok', name: 'Privent Tokenize', type: 'n8n-nodes-privent.priventTokenize' },
        { sessionId: SESSION_ID, textField: 'text', detectionMode: 'auto', reviewThreshold: 0.9 },
        [{ json: { text: TEXT } }],
        handler,
      ),
    );
    const tokJson = tokOut[0]![0]!.json as Record<string, unknown>;
    const tokenizedText = tokJson.text as string;

    // No plaintext PHI remains.
    for (const secret of [NAME, DOB, ADDRESS, EMAIL]) {
      expect(tokenizedText).not.toContain(secret);
    }

    // entities list ML kinds + the regex email.
    const privent = tokJson.privent as {
      entities: Array<{ kind: string; source: string }>;
      risk: { risk_score: number } | null;
      flaggedForReview: boolean;
    };
    const kinds = privent.entities.map((e) => e.kind).sort();
    expect(kinds).toEqual(['ADDRESS', 'DATE_OF_BIRTH', 'EMAIL', 'PERSON']);
    expect(privent.entities.find((e) => e.kind === 'PERSON')!.source).toBe('model');
    expect(privent.entities.find((e) => e.kind === 'EMAIL')!.source).toBe('regex');

    // Risk comes from the same call; flagged above threshold.
    expect(privent.risk!.risk_score).toBe(0.95);
    expect(privent.flaggedForReview).toBe(true);

    // EXACTLY one /v1/risk/score call (detection + risk combined).
    expect(calls.filter((c) => c.url === '/v1/risk/score')).toHaveLength(1);

    // Detokenize restores the original (incl. PERSON/DATE_OF_BIRTH/ADDRESS via TOKEN_RE).
    const detOut = await new PriventDetokenize().execute.call(
      makeExec(
        { id: 'n-det', name: 'Privent Detokenize', type: 'n8n-nodes-privent.priventDetokenize' },
        { sessionId: SESSION_ID, targetField: 'text', strict: false },
        [{ json: { text: tokenizedText } }],
        handler,
      ),
    );
    const restored = (detOut[0]![0]!.json as Record<string, unknown>).text as string;
    expect(restored).toBe(TEXT);
  });
});

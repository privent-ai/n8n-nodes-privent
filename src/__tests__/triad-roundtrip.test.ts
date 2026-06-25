import { describe, expect, it, vi } from 'vitest';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PriventSession } from '../nodes/PriventSession/PriventSession.node.js';
import { PriventTokenize } from '../nodes/PriventTokenize/PriventTokenize.node.js';
import { PriventDetokenize } from '../nodes/PriventDetokenize/PriventDetokenize.node.js';

const SESSION_ID = '123e4567-e89b-42d3-a456-426614174999';
const EMAIL = 'john@example.com';

/**
 * Stateful in-test stand-in for the Privent Cloud vault, shared across all
 * three node executions — proves the triad is stateless in-process: token
 * sharing happens entirely over HTTP with a common sessionId, no process-global
 * registry.
 */
function makeServer() {
  const tokenByNorm = new Map<string, string>();
  const origByToken = new Map<string, string>();
  let counter = 0;
  const calls: Array<{ url: string; body: Record<string, unknown> }> = [];

  const handler = vi.fn(async (_cred: string, opts: { url: string; body: Record<string, unknown> }) => {
    const { url, body } = opts;
    calls.push({ url, body });
    if (url === '/v1/vault/find-or-create-batch') {
      const items = body.items as Array<{ kind: string; normalizedValue: string; originalValue: string }>;
      const tokens = items.map((it) => {
        const key = `${it.kind}:${it.normalizedValue}`;
        let token = tokenByNorm.get(key);
        if (token == null) {
          counter += 1;
          token = `[${it.kind}_${String(counter).padStart(3, '0')}]`;
          tokenByNorm.set(key, token);
          origByToken.set(token, it.originalValue);
        }
        return { kind: it.kind, value: it.normalizedValue, token };
      });
      return { tokens };
    }
    if (url === '/v1/vault/retrieve-batch') {
      const toks = body.tokens as string[];
      const entries = toks
        .filter((t) => origByToken.has(t))
        .map((t) => ({ token: t, kind: 'EMAIL', value: origByToken.get(t)! }));
      return { entries };
    }
    return {};
  });

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
    getExecutionId: () => 'exec-rt',
    getWorkflow: () => ({ id: 'wf-rt', name: 'roundtrip' }),
    getMode: () => 'manual',
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: { httpRequestWithAuthentication: handler },
  } as unknown as IExecuteFunctions;
}

describe('stateless triad roundtrip (Session → Tokenize → Detokenize)', () => {
  it('restores the original PII via a shared cloud vault over HTTP', async () => {
    const { handler, calls } = makeServer();

    // 1. Session seeds correlation context onto the item.
    const sessionOut = await new PriventSession().execute.call(
      makeExec(
        { id: 'n-session', name: 'Privent Session', type: 'n8n-nodes-privent.priventSession' },
        { sessionIdMode: 'manual', sessionId: SESSION_ID, agentName: 'bot', framework: 'n8n', webhookNodeName: '' },
        [{ json: {} }],
        handler,
      ),
    );
    const sessionItem = sessionOut[0]![0]!.json as Record<string, unknown>;
    expect(sessionItem.sessionId).toBe(SESSION_ID);

    // 2. Tokenize (separate exec) — one PII → token via find-or-create-batch.
    const tokOut = await new PriventTokenize().execute.call(
      makeExec(
        { id: 'n-tok', name: 'Privent Tokenize', type: 'n8n-nodes-privent.priventTokenize' },
        { sessionId: SESSION_ID, textField: 'text', detectionMode: 'local', reviewThreshold: 1, traceId: sessionItem.traceId, agentName: sessionItem.agentName },
        [{ json: { text: `email me at ${EMAIL}` } }],
        handler,
      ),
    );
    const tokJson = tokOut[0]![0]!.json as Record<string, unknown>;
    const tokenizedText = tokJson.text as string;
    expect(tokenizedText).not.toContain(EMAIL);
    expect(tokenizedText).toMatch(/\[EMAIL_\d+\]/);

    // 3. Detokenize (separate exec) — restores via retrieve-batch.
    const detOut = await new PriventDetokenize().execute.call(
      makeExec(
        { id: 'n-det', name: 'Privent Detokenize', type: 'n8n-nodes-privent.priventDetokenize' },
        { sessionId: SESSION_ID, targetField: '*', strict: false, traceId: sessionItem.traceId, agentName: sessionItem.agentName },
        [{ json: { text: tokenizedText } }],
        handler,
      ),
    );
    const restored = (detOut[0]![0]!.json as Record<string, unknown>).text as string;
    expect(restored).toContain(EMAIL);

    // Endpoints fired against the shared sessionId.
    const foc = calls.find((c) => c.url === '/v1/vault/find-or-create-batch');
    const ret = calls.find((c) => c.url === '/v1/vault/retrieve-batch');
    expect(foc?.body.sessionId).toBe(SESSION_ID);
    expect(ret?.body.sessionId).toBe(SESSION_ID);
    expect((ret?.body.tokens as string[]).some((t) => /\[EMAIL_\d+\]/.test(t))).toBe(true);
  });
});

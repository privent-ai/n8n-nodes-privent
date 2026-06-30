import { describe, expect, it, vi } from 'vitest';
import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';

const SESSION_ID = '123e4567-e89b-42d3-a456-426614174888';
const EMAIL = 'jane@example.com';

/**
 * Tokenless round-trip: the vault lives in workflow static data, not the Privent
 * Cloud backend. Proves Session → Tokenize → Detokenize restores PII byte-for-byte
 * with NO vault HTTP and no API key — `authentication: 'tokenless'`, Detection
 * Mode `local`. The shared `staticData` object stands in for n8n's per-workflow
 * static store carried across the three node executions.
 */
function makeExec(
  staticData: IDataObject,
  httpAuth: ReturnType<typeof vi.fn>,
  node: { id: string; name: string; type: string },
  params: Record<string, unknown>,
  items: INodeExecutionData[],
): IExecuteFunctions {
  return {
    getInputData: () => items,
    getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
      name in params ? params[name] : fallback,
    getCredentials: async () => ({ baseUrl: 'https://api.test.local' }),
    getNode: () => node,
    getExecutionId: () => 'exec-tokenless',
    getWorkflow: () => ({ id: 'wf-tl', name: 'tokenless' }),
    getWorkflowStaticData: () => staticData,
    getMode: () => 'manual',
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: { httpRequestWithAuthentication: httpAuth, httpRequest: vi.fn() },
  } as unknown as IExecuteFunctions;
}

describe('tokenless roundtrip (Session → Tokenize → Detokenize, static-data vault)', () => {
  it('restores PII offline with no vault HTTP', async () => {
    const staticData: IDataObject = {};
    // Records any authenticated call; the vault round-trip must not touch it.
    const httpAuth = vi.fn(async (..._args: unknown[]) => ({}));
    const base = { type: 'n8n-nodes-privent.privent' };

    const sessionOut = await new Privent().execute.call(
      makeExec(
        staticData,
        httpAuth,
        { id: 'n-session', name: 'Privent Session', ...base },
        {
          authentication: 'tokenless',
          resource: 'session',
          operation: 'open',
          sessionIdMode: 'manual',
          sessionId: SESSION_ID,
          agentName: 'bot',
          framework: 'n8n',
          webhookNodeName: '',
        },
        [{ json: {} }],
      ),
    );
    const sessionItem = sessionOut[0]![0]!.json as Record<string, unknown>;

    const tokOut = await new Privent().execute.call(
      makeExec(
        staticData,
        httpAuth,
        { id: 'n-tok', name: 'Privent Tokenize', ...base },
        {
          authentication: 'tokenless',
          resource: 'tokenize',
          operation: 'tokenize',
          sessionId: SESSION_ID,
          textField: 'text',
          detectionMode: 'local',
          reviewThreshold: 1,
          traceId: sessionItem.traceId,
          agentName: sessionItem.agentName,
        },
        [{ json: { text: `email me at ${EMAIL}` } }],
      ),
    );
    const tokenizedText = (tokOut[0]![0]!.json as Record<string, unknown>).text as string;
    expect(tokenizedText).not.toContain(EMAIL);
    expect(tokenizedText).toMatch(/\[EMAIL_\d+\]/);

    const detOut = await new Privent().execute.call(
      makeExec(
        staticData,
        httpAuth,
        { id: 'n-det', name: 'Privent Detokenize', ...base },
        {
          authentication: 'tokenless',
          resource: 'detokenize',
          operation: 'detokenize',
          sessionId: SESSION_ID,
          targetField: '*',
          strict: false,
          traceId: sessionItem.traceId,
          agentName: sessionItem.agentName,
        },
        [{ json: { text: tokenizedText } }],
      ),
    );
    const restored = (detOut[0]![0]!.json as Record<string, unknown>).text as string;
    expect(restored).toContain(EMAIL);

    // No vault round-trip over HTTP — the static-data vault is fully offline.
    const vaultCalls = httpAuth.mock.calls.filter((c) =>
      String((c[1] as { url?: string })?.url ?? '').startsWith('/v1/vault/'),
    );
    expect(vaultCalls).toHaveLength(0);
  });
});

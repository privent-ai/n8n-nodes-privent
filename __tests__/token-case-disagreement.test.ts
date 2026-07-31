import { describe, expect, it, vi } from 'vitest';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { applyTokenCase, type TokenCaseMode } from './_http-helpers.js';

/**
 * THE INSTRUMENT MUST BE ABLE TO DISAGREE.
 *
 * Until NP-K's sibling work, the vault mock echoed back whatever `kind` the node
 * had sent, so a minted token could never be in a case the node's own
 * `TOKEN_RE` refuses. That is not "the mock mints the wrong case" — it is that
 * NO TEST COULD EVER CATCH A CASE REGRESSION, which is why the real one
 * (privent-backend bcb3910..adf6e1f, 34 commits) shipped to `dev` and reached
 * this suite green.
 *
 * These two tests drive the mock into disagreement on purpose and assert the
 * CONTRACT, not today's behaviour:
 *
 *   1. a round trip survives a backend that cases tokens differently;
 *   2. when nothing is redeemed, the node does not report success.
 *
 * BOTH ARE RED ON PURPOSE AND STAY RED UNTIL N4-4. `@priventai/core`'s
 * `TOKEN_RE` has no `i` flag (privent-sdk/packages/core/src/tokenizer/detokenize.ts:7),
 * so `scanForTokens` yields nothing, `detokenizeDeep` returns the text
 * unchanged, and `detokenize` reports `detokenized: true` having redeemed zero
 * tokens. N4-4 adds the `i` flag and a distinct zero-match outcome; these going
 * green is N4-4's acceptance evidence, not this item's.
 */

const SESSION_ID = '123e4567-e89b-42d3-a456-4266141749aa';
const EMAIL = 'ayse.kaya@kurumsal.tr';

/** Stateful vault stand-in whose minted case is a parameter, not an echo. */
function makeCaseSkewedVault(tokenCase: TokenCaseMode) {
  const origByToken = new Map<string, string>();
  let counter = 0;

  const handler = vi.fn(
    async (_cred: string, opts: { url: string; body: Record<string, unknown> }) => {
      const { url, body } = opts;
      if (url === '/v1/vault/find-or-create-batch') {
        const items = body.items as Array<{ kind: string; normalizedValue: string; originalValue: string }>;
        return {
          tokens: items.map((it) => {
            counter += 1;
            const minted = applyTokenCase(it.kind, tokenCase);
            const token = `[${minted}_${String(counter).padStart(3, '0')}]`;
            origByToken.set(token, it.originalValue);
            return { kind: minted, value: it.normalizedValue, token };
          }),
        };
      }
      if (url === '/v1/vault/retrieve-batch') {
        const toks = body.tokens as string[];
        return {
          entries: toks
            .filter((t) => origByToken.has(t))
            .map((t) => ({ token: t, kind: 'EMAIL', value: origByToken.get(t)! })),
        };
      }
      return {};
    },
  );

  return { handler, mintedTokens: () => [...origByToken.keys()] };
}

function makeExec(
  params: Record<string, unknown>,
  items: INodeExecutionData[],
  handler: ReturnType<typeof vi.fn>,
): IExecuteFunctions {
  return {
    getInputData: () => items,
    getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
      name in params ? params[name] : fallback,
    getNode: () => ({ id: 'n1', name: 'Privent', type: 'n8n-nodes-privent.privent' }),
    getCredentials: async () => ({ baseUrl: 'https://api.privent.test', vaultBackend: 'cloud' }),
    getWorkflow: () => ({ id: 'wf-1', name: 'case-skew' }),
    getExecutionId: () => 'exec-1',
    getMode: () => 'manual',
    getWorkflowStaticData: () => ({}),
    continueOnFail: () => false,
    helpers: { httpRequestWithAuthentication: handler, httpRequest: vi.fn(async () => ({})) },
  } as unknown as IExecuteFunctions;
}

async function tokenizeThenDetokenize(tokenCase: TokenCaseMode) {
  const { handler, mintedTokens } = makeCaseSkewedVault(tokenCase);
  const node = new Privent();

  const tokOut = await node.execute.call(
    makeExec(
      {
        authentication: 'apiKey',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: SESSION_ID,
        textField: 'text',
        detectionMode: 'local',
        reviewThreshold: 0.9,
        traceId: '',
        agentName: '',
      },
      [{ json: { text: `reach ${EMAIL} now` } }],
      handler,
    ),
  );
  const tokenized = tokOut[0]![0]!.json;

  const detOut = await node.execute.call(
    makeExec(
      {
        authentication: 'apiKey',
        resource: 'detokenize',
        operation: 'detokenize',
        sessionId: SESSION_ID,
        targetField: '*',
        strict: false,
        traceId: '',
        agentName: '',
        targetAgentName: '',
      },
      [{ json: tokenized }],
      handler,
    ),
  );
  return {
    tokenizedText: tokenized.text as string,
    restored: detOut[0]![0]!.json as { text: string; privent: Record<string, unknown> },
    mintedTokens: mintedTokens(),
  };
}

describe('token case disagreement between the node and the vault', () => {
  it('the instrument can disagree at all — a lower-cased mint is not what the node sent', async () => {
    const { tokenizedText, mintedTokens } = await tokenizeThenDetokenize('lower');
    // The node sends EMAIL; a disagreeing backend mints [email_001].
    expect(mintedTokens.some((t) => t === t.toLowerCase())).toBe(true);
    expect(tokenizedText).toContain('[email_001]');
    // And the faithful default does NOT disagree — same input, backend's own rule.
    const faithful = await tokenizeThenDetokenize('faithful');
    expect(faithful.tokenizedText).toContain('[EMAIL_001]');
  });

  it('RED UNTIL N4-4 — a round trip survives a backend that cases tokens differently', async () => {
    const { restored } = await tokenizeThenDetokenize('lower');
    expect(restored.text).toBe(`reach ${EMAIL} now`);
  });

  it('RED UNTIL N4-4 — redeeming nothing is not reported as success', async () => {
    const { restored } = await tokenizeThenDetokenize('lower');
    expect(restored.privent.detokenized).not.toBe(true);
  });
});

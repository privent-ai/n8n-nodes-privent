import { describe, expect, it, vi } from 'vitest';
import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';

/**
 * WHERE THE NODE SENDS, ASSERTED ON THE RESOLVED URL — NOTHING IS SENT.
 *
 * Both credentials default `baseUrl` to `https://api.privent.ai`
 * (`PriventApi.credentials.ts:30`, `PriventVisitorApi.credentials.ts:24`). The
 * default stays: measured, nothing this package ships sets the field for an
 * operator, and the Cloud path — install, paste a key, it works — depends on it.
 *
 * The defect is the third state. n8n resolves credentials through
 * `NodeHelpers.getNodeParameters(props, stored, returnDefaults = true, …)`
 * (`n8n/dist/credentials-helper.js:258`, image `n8nio/n8n:2.28.7`), so defaults
 * are filled at read time and five stored states collapse to three resolved
 * ones:
 *
 *   never touched            -> "https://api.privent.ai"
 *   explicitly set to Privent-> "https://api.privent.ai"   (indistinguishable)
 *   cleared to empty string  -> ""                          (distinguishable)
 *   self-hosted              -> the value
 *   nothing stored at all    -> "https://api.privent.ai"
 *
 * An empty string survives — n8n does not overwrite it with the default — and it
 * is exactly what an operator leaves behind when they mean *not Privent* and do
 * not finish. Before this item the node issued its requests against that empty
 * base and reported nothing.
 *
 * Empty is not a value. It is a field someone cleared on purpose.
 */

const CREDS = (baseUrl: string) => ({ apiKey: 'pv_live_x', baseUrl, vaultBackend: 'memory' });

function ctxWith(baseUrl: string, authentication = 'apiKey') {
  const seen: Array<Record<string, unknown>> = [];
  const ctx = {
    getInputData: () => [{ json: { text: 'reach ayse@fixture.invalid now' } }],
    getNodeParameter: (n: string, _i: number, fb?: unknown) =>
      ({
        authentication,
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174111',
        textField: 'text',
        detectionMode: 'local',
        reviewThreshold: 0.9,
      })[n] ?? fb,
    getCredentials: async () => CREDS(baseUrl),
    getNode: () => ({
      id: 'n1',
      name: 'Privent',
      type: 'n8n-nodes-privent.privent',
      credentials: { priventApi: { id: 'c1', name: 'Privent account' } },
    }),
    getExecutionId: () => 'exec-1',
    getWorkflow: () => ({ id: 'wf-1', name: 'wf' }),
    getMode: () => 'manual',
    getWorkflowStaticData: () => ({}),
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: {
      // Records where the node WOULD have sent. Never performs a request.
      httpRequestWithAuthentication: vi.fn(async (_c: string, o: Record<string, unknown>) => {
        seen.push(o);
        if (o.url === '/v1/vault/find-or-create-batch') {
          const items =
            ((o.body as Record<string, unknown>).items as Array<{
              kind: string;
              normalizedValue: string;
            }>) ?? [];
          return {
            tokens: items.map((it, i) => ({
              kind: it.kind,
              value: it.normalizedValue,
              token: `[${it.kind}_00${i + 1}]`,
            })),
          };
        }
        return {};
      }),
      httpRequest: vi.fn(async (o: Record<string, unknown>) => {
        seen.push(o);
        return {};
      }),
    },
  } as unknown as IExecuteFunctions;
  return { ctx, seen };
}

describe('the resolved base URL, asserted without sending', () => {
  it('untouched credential resolves to Privent Cloud — the default is kept, deliberately', async () => {
    const { ctx, seen } = ctxWith('https://api.privent.ai');
    await new Privent().execute.call(ctx);
    expect(seen.length).toBeGreaterThan(0);
    expect(seen[0]!.baseURL).toBe('https://api.privent.ai');
  });

  it('a self-hosted base URL is used as given', async () => {
    const { ctx, seen } = ctxWith('https://privent.internal');
    await new Privent().execute.call(ctx);
    expect(seen[0]!.baseURL).toBe('https://privent.internal');
  });
});

describe('an empty base URL is refused, not sent to', () => {
  it('apiKey mode: cleared field throws instead of issuing requests', async () => {
    const { ctx, seen } = ctxWith('');
    await expect(new Privent().execute.call(ctx)).rejects.toBeInstanceOf(NodeOperationError);
    expect(seen, 'nothing may be sent when the destination is unknown').toHaveLength(0);
  });

  it('whitespace is empty too', async () => {
    const { ctx, seen } = ctxWith('   ');
    await expect(new Privent().execute.call(ctx)).rejects.toBeInstanceOf(NodeOperationError);
    expect(seen).toHaveLength(0);
  });

  it('the error names the credential and the field, so the operator can act', async () => {
    const { ctx } = ctxWith('');
    const err = await new Privent().execute.call(ctx).catch((e: Error) => e);
    const message = String((err as Error).message);
    expect(message).toContain('Base URL');
    expect(message).toContain('Privent API');
  });

  it('tokenless mode is refused on the same rule — both credentials carry the default', async () => {
    const { ctx, seen } = ctxWith('', 'tokenless');
    await expect(new Privent().execute.call(ctx)).rejects.toBeInstanceOf(NodeOperationError);
    expect(seen).toHaveLength(0);
  });
});

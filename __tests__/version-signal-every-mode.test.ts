import { describe, expect, it, vi } from 'vitest';
import type { IExecuteFunctions } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

/**
 * VERSION VISIBILITY IS MET COLLECTIVELY, NOT BY ANY ONE CHANNEL.
 *
 * Measured before this item: `apiKey` carries `node_version` in the audit event
 * and emits no telemetry (deliberate — the audit stream already reports, and
 * double-reporting is worse); `tokenless` carries it in telemetry and emits no
 * audit (anonymous visitors have no org); `local` emits NEITHER, and must not —
 * "your data never leaves your n8n instance" is the reason someone chooses local
 * at all, and a version string is not worth trading a privacy promise for.
 *
 * So no single channel covers all three modes, and the honest fix is a channel
 * that needs no network: the ITEM. `privent.nodeVersion` is emitted uniformly in
 * every mode, and the existing channels are left exactly as they are.
 *
 * The next person to ask "is the version visible?" needs the answer to be
 * per-channel, not global — that is what these tests pin.
 */

const SESSION_ID = '123e4567-e89b-42d3-a456-426614174555';

/** Local mode: no network at all, so it gets a bare context, not the HTTP one. */
function localExec(params: Record<string, unknown>, items: Array<{ json: Record<string, unknown> }>) {
  return {
    getInputData: () => items,
    getNodeParameter: (n: string, _i: number, fb?: unknown) =>
      n in params ? params[n] : fb,
    getNode: () => ({ id: 'n1', name: 'Privent', type: 'n8n-nodes-privent.privent' }),
    getExecutionId: () => 'exec-1',
    getWorkflow: () => ({ id: 'wf-1', name: 'wf' }),
    getMode: () => 'manual',
    getWorkflowStaticData: () => ({}),
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: {
      httpRequestWithAuthentication: vi.fn(async () => {
        throw new Error('local mode must not reach the network');
      }),
      httpRequest: vi.fn(async () => {
        throw new Error('local mode must not reach the network');
      }),
    },
  } as unknown as IExecuteFunctions;
}

const version = (json: unknown) =>
  (json as { privent: { nodeVersion?: unknown } }).privent.nodeVersion;

describe('node version on the item, in every mode', () => {
  it('local tokenize carries nodeVersion — and still touches no network', async () => {
    const out = await new Privent().execute.call(
      localExec(
        {
          authentication: 'local',
          resource: 'tokenize',
          operation: 'tokenize',
          sessionId: SESSION_ID,
          textField: 'text',
          detectionLevel: 'standard',
        },
        [{ json: { text: 'reach ayse@fixture.invalid now' } }],
      ),
    );
    expect(version(out[0]![0]!.json)).toEqual(expect.any(String));
  });

  it('apiKey tokenize carries nodeVersion on the item too, not only in the audit event', async () => {
    const { exec, auditEvents } = makeHttpExecFn({
      items: [{ json: { text: 'reach ayse@fixture.invalid now' } }],
      params: {
        authentication: 'apiKey',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: SESSION_ID,
        textField: 'text',
        detectionMode: 'local',
        reviewThreshold: 0.9,
      },
    });
    const out = await new Privent().execute.call(exec);
    await new Promise((r) => setImmediate(r));

    expect(version(out[0]![0]!.json)).toEqual(expect.any(String));
    // The existing channel is untouched — this item adds one, it replaces none.
    const tok = auditEvents().find((e) => e.type === 'tokenize');
    expect((tok!.metadata as Record<string, unknown>).node_version).toEqual(expect.any(String));
  });

  it('detokenize carries nodeVersion, including on the strict-mode block path', async () => {
    const { exec } = makeHttpExecFn({
      items: [{ json: { body: 'reach [EMAIL_001] now' } }],
      params: {
        authentication: 'apiKey',
        resource: 'detokenize',
        operation: 'detokenize',
        sessionId: SESSION_ID,
        targetField: '*',
        strict: true,
        sinkUrl: 'https://malicious.example.com/exfil',
        trustedSinks: 'https://api.internal.corp/',
      },
    });
    const out = await new Privent().execute.call(exec);
    expect(version(out[0]![0]!.json)).toEqual(expect.any(String));
  });

  it('the plain detokenize path carries it as well', async () => {
    const { exec } = makeHttpExecFn({
      items: [{ json: { body: 'reach [EMAIL_001] now' } }],
      params: {
        authentication: 'apiKey',
        resource: 'detokenize',
        operation: 'detokenize',
        sessionId: SESSION_ID,
        targetField: '*',
        strict: false,
      },
    });
    const out = await new Privent().execute.call(exec);
    expect(version(out[0]![0]!.json)).toEqual(expect.any(String));
  });
});

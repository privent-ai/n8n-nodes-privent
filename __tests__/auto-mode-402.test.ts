import { describe, expect, it } from 'vitest';
import { NodeApiError } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

/**
 * AUTO MODE SWALLOWED HTTP 402.
 *
 * `auto` is documented to degrade to regex-only when the ML backend is
 * unreachable, so the data path never breaks. That is right for a timeout and
 * wrong for a 402: Payment Required is a plan/quota decision that will not
 * self-heal on the next item, and `cloud` fails the run on exactly the same
 * response. The two modes disagreed in silence — the item looked identical to
 * one scored by the backend, and the audit event recorded `detection_mode:
 * auto` with no hint that no ML ran at all.
 *
 * Nothing here changes the data path. `auto` still degrades. It just stops
 * pretending it didn't.
 *
 * Instrument first: `failUrls` throws a bare `Error`, so before this item NO
 * TEST COULD EXPRESS A 402 — the suite could not tell a quota rejection from a
 * socket reset, which is the very distinction under test. Real n8n wraps every
 * transport failure in `NodeApiError` (measured in n8nio/n8n:2.28.7,
 * digest sha256:74f1ef0ec73cd1b85c3b55926732c9dfaa544a66d6bb2872fd57718c557954a4),
 * and the status arrives as `httpCode`, a STRING.
 */

const SESSION_ID = '123e4567-e89b-42d3-a456-426614174222';

function tokenizeExec(detectionMode: 'auto' | 'cloud', failStatus?: Record<string, number>) {
  return makeHttpExecFn({
    items: [{ json: { text: 'reach ayse@fixture.invalid now' } }],
    params: {
      authentication: 'apiKey',
      resource: 'tokenize',
      operation: 'tokenize',
      sessionId: SESSION_ID,
      textField: 'text',
      detectionMode,
      reviewThreshold: 0.9,
    },
    ...(failStatus ? { failStatus } : {}),
  });
}

describe('auto mode and HTTP 402', () => {
  it('the instrument can express a status at all — 402 arrives as NodeApiError.httpCode', async () => {
    const { exec } = tokenizeExec('cloud', { '/v1/risk/score': 402 });
    const err = await new Privent().execute.call(exec).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(NodeApiError);
    expect((err as NodeApiError).httpCode).toBe('402');
  });

  it('cloud fails the run on 402 — the behaviour auto silently diverged from', async () => {
    const { exec } = tokenizeExec('cloud', { '/v1/risk/score': 402 });
    await expect(new Privent().execute.call(exec)).rejects.toBeInstanceOf(NodeApiError);
  });

  it('auto surfaces the degradation on the item, with the status', async () => {
    const { exec } = tokenizeExec('auto', { '/v1/risk/score': 402 });
    const out = await new Privent().execute.call(exec);
    const privent = (out[0]![0]!.json as { privent: Record<string, unknown> }).privent;

    expect(privent.risk).toBeNull();
    expect(privent.mlDegraded).toMatchObject({ status: '402' });
    expect(String((privent.mlDegraded as { reason: string }).reason)).toContain('402');
  });

  it('auto records the degradation in the audit event, not just on the item', async () => {
    const { exec, auditEvents } = tokenizeExec('auto', { '/v1/risk/score': 402 });
    await new Privent().execute.call(exec);
    await new Promise((r) => setImmediate(r));

    const tok = auditEvents().find((e) => e.type === 'tokenize');
    expect(tok).toBeDefined();
    expect(tok!.metadata).toMatchObject({
      detection_mode: 'auto',
      ml_degraded: true,
      ml_degraded_status: '402',
    });
  });

  it('a healthy auto run says nothing about degradation', async () => {
    const { exec, auditEvents } = tokenizeExec('auto');
    const out = await new Privent().execute.call(exec);
    await new Promise((r) => setImmediate(r));

    const privent = (out[0]![0]!.json as { privent: Record<string, unknown> }).privent;
    expect(privent.mlDegraded).toBeUndefined();
    const tok = auditEvents().find((e) => e.type === 'tokenize');
    expect((tok!.metadata as Record<string, unknown>).ml_degraded).toBeUndefined();
  });
});

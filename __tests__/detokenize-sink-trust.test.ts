import { describe, it, expect } from 'vitest';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { deriveSinkId } from '../nodes/Privent/operations/detokenize.js';
import { makeHttpExecFn } from './_http-helpers.js';

async function flushPromises() {
  await new Promise((r) => setImmediate(r));
}

const DETOK_NODE = {
  id: 'node-uuid-1',
  name: 'Detokenize',
  type: 'n8n-nodes-privent.privent',
};

function detokExec(params: Record<string, unknown>, items: Array<{ json: Record<string, unknown> }>) {
  return makeHttpExecFn({
    items,
    params: { resource: 'detokenize', operation: 'detokenize', ...params },
    node: DETOK_NODE,
  });
}

function firstMeta(events: Array<Record<string, unknown>>): Record<string, unknown> {
  expect(events.length).toBeGreaterThan(0);
  return events[0]!.metadata as Record<string, unknown>;
}

describe('PriventDetokenize sink trust matrix', () => {
  it('strict + trusted sink → emits sink_trusted=true with parsed sink_id', async () => {
    const { exec, auditEvents } = detokExec(
      {
        sessionId: '123e4567-e89b-42d3-a456-426614174005',
        targetField: '*',
        strict: true,
        sinkUrl: 'https://api.internal.corp/v1/send',
        trustedSinks: 'https://api.internal.corp/',
      },
      [{ json: { body: 'plain' } }],
    );

    const out = await new Privent().execute.call(exec);
    await flushPromises();

    expect(firstMeta(auditEvents())).toMatchObject({
      sink_trusted: true,
      sink_id: deriveSinkId('https://api.internal.corp/v1/send'),
      sink_url_host: 'api.internal.corp',
      strict: true,
    });
    // This item carries no placeholders at all, so nothing was restored. The
    // assertion used to read `detokenized: true` — the old contract, where the
    // flag meant "the operation ran" rather than "values came back". Its intent
    // here is the sink-trust metadata above; the outcome field is updated to the
    // truth rather than the test being loosened.
    expect(out[0]![0]!.json).toMatchObject({
      privent: { detokenized: false, reason: expect.stringContaining('No Privent tokens') },
    });
  });

  it('strict + untrusted sink → blocked path with sink_trusted=false and reason', async () => {
    const { exec, auditEvents } = detokExec(
      {
        sessionId: '123e4567-e89b-42d3-a456-426614174005',
        targetField: '*',
        strict: true,
        sinkUrl: 'https://malicious.example.com/exfil',
        trustedSinks: 'https://api.internal.corp/',
      },
      [{ json: { body: 'plain' } }],
    );

    const out = await new Privent().execute.call(exec);
    await flushPromises();

    const events = auditEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.metadata).toMatchObject({
      sink_trusted: false,
      sink_id: deriveSinkId('https://malicious.example.com/exfil'),
      sink_url_host: 'malicious.example.com',
      strict: true,
      tokens_redeemed: 0,
      reason: 'strict-mode-block',
    });
    expect(out[0]![0]!.json).toMatchObject({ privent: { detokenized: false } });
  });

  // An empty Trusted Sinks list used to be read as "everything is trusted", so
  // Strict Mode was a no-op for anyone who switched it on without filling the
  // list in. No test covered that decision: the two other tests that pass an
  // empty list only assert sink_id / sink_url_host derivation, which the block
  // path emits too, so they stayed green through the whole defect. These two
  // lock the decision itself — item AND audit, because the original finding was
  // that the audit recorded sink_trusted: true while the data flowed.
  it('strict + EMPTY trusted list → blocked, sink_trusted=false, distinct reason', async () => {
    const { exec, auditEvents } = detokExec(
      {
        sessionId: '123e4567-e89b-42d3-a456-426614174006',
        targetField: '*',
        strict: true,
        sinkUrl: 'https://anywhere.invalid/x',
        trustedSinks: '',
      },
      [{ json: { body: 'reach [EMAIL_001] now' } }],
    );

    const out = await new Privent().execute.call(exec);
    await flushPromises();

    const json = out[0]![0]!.json as { body: string; privent: Record<string, unknown> };
    expect(json.body).toBe('reach [EMAIL_001] now');
    expect(json.privent.detokenized).toBe(false);
    expect(String(json.privent.reason)).toContain('no Trusted Sinks are configured');

    const meta = firstMeta(auditEvents());
    expect(meta.sink_trusted).toBe(false);
    expect(meta.reason).toBe('strict-mode-no-trusted-sinks');
    expect(meta.tokens_redeemed).toBe(0);
  });

  it('strict + WHITESPACE-only trusted list → same block, same reason', async () => {
    const { exec, auditEvents } = detokExec(
      {
        sessionId: '123e4567-e89b-42d3-a456-426614174007',
        targetField: '*',
        strict: true,
        sinkUrl: 'https://anywhere.invalid/x',
        trustedSinks: '   ',
      },
      [{ json: { body: 'reach [EMAIL_001] now' } }],
    );

    await new Privent().execute.call(exec);
    await flushPromises();

    const meta = firstMeta(auditEvents());
    expect(meta.sink_trusted).toBe(false);
    expect(meta.reason).toBe('strict-mode-no-trusted-sinks');
  });

  it('non-strict + sinkUrl absent → sink_id=null, sink_trusted=true', async () => {
    const { exec, auditEvents } = detokExec(
      { sessionId: '123e4567-e89b-42d3-a456-426614174005', targetField: '*', strict: false },
      [{ json: { body: 'plain' } }],
    );

    await new Privent().execute.call(exec);
    await flushPromises();

    expect(firstMeta(auditEvents())).toMatchObject({
      sink_trusted: true,
      sink_id: null,
      sink_url_host: null,
      strict: false,
    });
  });

  it('falls back to a truncated literal when sinkUrl fails URL parse', async () => {
    const garbage = 'not a url ' + 'x'.repeat(100);
    const { exec, auditEvents } = detokExec(
      {
        sessionId: '123e4567-e89b-42d3-a456-426614174005',
        targetField: '*',
        strict: true,
        sinkUrl: garbage,
        trustedSinks: '',
      },
      [{ json: { body: 'plain' } }],
    );

    await new Privent().execute.call(exec);
    await flushPromises();

    const meta = firstMeta(auditEvents());
    expect(meta.sink_id as string).toMatch(/^[0-9a-f]{16}$/);
    expect(typeof meta.sink_url_host).toBe('string');
    expect((meta.sink_url_host as string).length).toBeLessThanOrEqual(64);
    expect(meta.sink_id).not.toBe(meta.sink_url_host);
  });
});

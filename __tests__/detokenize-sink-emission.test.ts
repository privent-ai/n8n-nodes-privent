import { describe, expect, it } from 'vitest';
import {
  PriventDetokenize,
  deriveSinkId,
  deriveSinkUrlHost,
} from '../nodes/PriventDetokenize/PriventDetokenize.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

const URL_A = 'https://api.salesforce.com/v1/leads';
const URL_B = 'https://api.salesforce.com/v1/contacts';

async function flushPromises() {
  await new Promise((r) => setImmediate(r));
}

const DETOK_NODE = {
  id: 'node-123',
  name: 'Privent Detokenize',
  type: 'n8n-nodes-privent.priventDetokenize',
};

// ─── Helper-level cases ───────────────────────────────────────────────────────

describe('deriveSinkId', () => {
  it('returns null for empty input', () => {
    expect(deriveSinkId('')).toBeNull();
  });

  it('is deterministic for the same URL', () => {
    expect(deriveSinkId(URL_A)).toBe(deriveSinkId(URL_A));
  });

  it('is path-sensitive — different paths on the same host yield different fingerprints', () => {
    expect(deriveSinkId(URL_A)).not.toBe(deriveSinkId(URL_B));
  });

  it('emits exactly 16 lowercase hex chars', () => {
    expect(deriveSinkId(URL_A)).toMatch(/^[0-9a-f]{16}$/);
  });

  it('still produces a valid fingerprint for malformed input', () => {
    expect(deriveSinkId('not a url')).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe('deriveSinkUrlHost', () => {
  it('returns null for empty input', () => {
    expect(deriveSinkUrlHost('')).toBeNull();
  });

  it('extracts the URL host', () => {
    expect(deriveSinkUrlHost(URL_A)).toBe('api.salesforce.com');
  });

  it('is path-insensitive — both paths share the same host', () => {
    expect(deriveSinkUrlHost(URL_A)).toBe(deriveSinkUrlHost(URL_B));
  });

  it('falls back to a 64-char literal when parsing fails', () => {
    const malformed = 'definitely-not-a-url-but-some-arbitrary-string-here-as-a-fallback-check';
    const result = deriveSinkUrlHost(malformed);
    expect(result).not.toBeNull();
    expect(result!.length).toBeLessThanOrEqual(64);
  });
});

// ─── Node-level cases (stateless / HTTP) ──────────────────────────────────────

function detokExec(
  params: Record<string, unknown>,
  items: Array<{ json: Record<string, unknown> }>,
  extra: { failUrls?: string[] } = {},
) {
  return makeHttpExecFn({
    items,
    params,
    node: DETOK_NODE,
    workflow: { id: 'wf-42', name: 'demo' },
    ...extra,
  });
}

function lastAuditEvent(events: Array<Record<string, unknown>>): Record<string, unknown> {
  expect(events.length).toBeGreaterThan(0);
  return events[events.length - 1]!;
}

describe('PriventDetokenize.execute audit emission', () => {
  it('trusted-egress: emits one detokenize event with distinct sink_id and sink_url_host', async () => {
    const { exec, auditEvents } = detokExec(
      {
        sessionId: '123e4567-e89b-42d3-a456-426614174003',
        targetField: '*',
        strict: true,
        sinkUrl: URL_A,
        trustedSinks: 'https://api.salesforce.com/',
      },
      [{ json: { body: 'hello [EMAIL_001] world [PHONE_001]' } }],
    );

    const result = await new PriventDetokenize().execute.call(exec);
    await flushPromises();

    const event = lastAuditEvent(auditEvents());
    expect(event.type).toBe('detokenize');
    expect(event.framework).toBe('n8n');
    expect(event.session_id).toBe('123e4567-e89b-42d3-a456-426614174003');
    expect(event.node_id).toBe('node-123');
    expect(event.workflow_id).toBe('wf-42');
    expect(event.trace_id as string).toMatch(/^[0-9a-f-]{36}$/);

    const meta = event.metadata as Record<string, unknown>;
    expect(meta.sink_id).toBe(deriveSinkId(URL_A));
    expect(meta.sink_url_host).toBe('api.salesforce.com');
    expect(meta.sink_id).not.toBe(meta.sink_url_host);
    expect(meta.sink_trusted).toBe(true);
    expect(meta.strict).toBe(true);
    expect(meta.tokens_redeemed).toBe(2);

    expect(result[0]?.[0]?.json).toMatchObject({
      privent: { sessionId: '123e4567-e89b-42d3-a456-426614174003', detokenized: true },
    });
  });

  it('host-equal / path-different URLs across runs share sink_url_host but not sink_id', async () => {
    const a = detokExec(
      { sessionId: '123e4567-e89b-42d3-a456-426614174004', targetField: '*', strict: true, sinkUrl: URL_A, trustedSinks: '' },
      [{ json: {} }],
    );
    await new PriventDetokenize().execute.call(a.exec);
    const b = detokExec(
      { sessionId: '123e4567-e89b-42d3-a456-426614174004', targetField: '*', strict: true, sinkUrl: URL_B, trustedSinks: '' },
      [{ json: {} }],
    );
    await new PriventDetokenize().execute.call(b.exec);
    await flushPromises();

    const evA = lastAuditEvent(a.auditEvents()).metadata as Record<string, unknown>;
    const evB = lastAuditEvent(b.auditEvents()).metadata as Record<string, unknown>;
    expect(evA.sink_url_host).toBe(evB.sink_url_host);
    expect(evA.sink_id).not.toBe(evB.sink_id);
  });

  it('strict-block: emits a blocked event and leaves the item untouched', async () => {
    const { exec, auditEvents, calls } = detokExec(
      {
        sessionId: '123e4567-e89b-42d3-a456-426614174003',
        targetField: '*',
        strict: true,
        sinkUrl: 'https://untrusted.example.com/leak',
        trustedSinks: 'https://api.internal.corp/',
      },
      [{ json: { body: '[EMAIL_001]' } }],
    );

    const result = await new PriventDetokenize().execute.call(exec);
    await flushPromises();

    // No vault retrieve happened — detokenization was blocked.
    expect(calls.some((c) => c.url === '/v1/vault/retrieve-batch')).toBe(false);

    const meta = lastAuditEvent(auditEvents()).metadata as Record<string, unknown>;
    expect(meta.sink_trusted).toBe(false);
    expect(meta.reason).toBe('strict-mode-block');
    expect(meta.tokens_redeemed).toBe(0);
    expect(meta.sink_url_host).toBe('untrusted.example.com');
    expect(meta.sink_id as string).toMatch(/^[0-9a-f]{16}$/);

    expect(result[0]?.[0]?.json).toMatchObject({
      body: '[EMAIL_001]',
      privent: { sessionId: '123e4567-e89b-42d3-a456-426614174003', detokenized: false },
    });
  });

  it('swallows audit POST rejections without failing the data path', async () => {
    const { exec } = detokExec(
      { sessionId: '123e4567-e89b-42d3-a456-426614174003', targetField: '*', strict: false },
      [{ json: { body: '[EMAIL_001]' } }],
      { failUrls: ['/v1/audit/events'] },
    );

    const result = await new PriventDetokenize().execute.call(exec);
    await flushPromises();

    expect(result[0]?.[0]?.json).toMatchObject({
      privent: { sessionId: '123e4567-e89b-42d3-a456-426614174003', detokenized: true },
    });
  });

  it('non-strict mode without sinkUrl emits null sink_id and null sink_url_host', async () => {
    const { exec, auditEvents } = detokExec(
      { sessionId: '123e4567-e89b-42d3-a456-426614174003', targetField: '*', strict: false },
      [{ json: {} }],
    );

    await new PriventDetokenize().execute.call(exec);
    await flushPromises();

    const meta = lastAuditEvent(auditEvents()).metadata as Record<string, unknown>;
    expect(meta.sink_id).toBeNull();
    expect(meta.sink_url_host).toBeNull();
    expect(meta.sink_trusted).toBe(true);
    expect(meta.strict).toBe(false);
  });

  // ─── value_fingerprint (placeholder hash, NOT raw PII value) ──────────────

  it('value_fingerprint: 8-hex digest + per-placeholder list when tokens present', async () => {
    const { exec, auditEvents } = detokExec(
      { sessionId: '123e4567-e89b-42d3-a456-426614174003', targetField: '*', strict: false },
      [{ json: { body: '[EMAIL_001] and [PHONE_002] and [EMAIL_001] again' } }],
    );

    await new PriventDetokenize().execute.call(exec);
    await flushPromises();

    const meta = lastAuditEvent(auditEvents()).metadata as Record<string, unknown>;
    expect(meta.value_fingerprint as string).toMatch(/^[0-9a-f]{8}$/);
    expect(meta.value_fingerprints as string[]).toHaveLength(2);
    for (const fp of meta.value_fingerprints as string[]) {
      expect(fp).toMatch(/^[0-9a-f]{8}$/);
    }
  });

  it('value_fingerprint: null when no tokens present', async () => {
    const { exec, auditEvents } = detokExec(
      { sessionId: '123e4567-e89b-42d3-a456-426614174003', targetField: '*', strict: false },
      [{ json: { body: 'no tokens here' } }],
    );

    await new PriventDetokenize().execute.call(exec);
    await flushPromises();

    const meta = lastAuditEvent(auditEvents()).metadata as Record<string, unknown>;
    expect(meta.value_fingerprint).toBeNull();
    expect(meta.value_fingerprints).toEqual([]);
  });

  it('value_fingerprint: strict-block path does NOT emit fingerprint', async () => {
    const { exec, auditEvents } = detokExec(
      {
        sessionId: '123e4567-e89b-42d3-a456-426614174003',
        targetField: '*',
        strict: true,
        sinkUrl: 'https://untrusted.example.com/leak',
        trustedSinks: 'https://api.internal.corp/',
      },
      [{ json: { body: '[EMAIL_001]' } }],
    );

    await new PriventDetokenize().execute.call(exec);
    await flushPromises();

    const meta = lastAuditEvent(auditEvents()).metadata as Record<string, unknown>;
    expect(meta.reason).toBe('strict-mode-block');
    expect(meta).not.toHaveProperty('value_fingerprint');
    expect(meta).not.toHaveProperty('value_fingerprints');
  });

  it('value_fingerprint: deterministic — same placeholders → same digest across runs', async () => {
    const body = '[CARD_007] [IBAN_003]';
    const a = detokExec({ sessionId: '123e4567-e89b-42d3-a456-426614174004', targetField: '*', strict: false }, [{ json: { body } }]);
    await new PriventDetokenize().execute.call(a.exec);
    const b = detokExec({ sessionId: '123e4567-e89b-42d3-a456-426614174004', targetField: '*', strict: false }, [{ json: { body } }]);
    await new PriventDetokenize().execute.call(b.exec);
    await flushPromises();

    const fpA = (lastAuditEvent(a.auditEvents()).metadata as Record<string, unknown>).value_fingerprint;
    const fpB = (lastAuditEvent(b.auditEvents()).metadata as Record<string, unknown>).value_fingerprint;
    expect(fpA).toBe(fpB);
  });
});

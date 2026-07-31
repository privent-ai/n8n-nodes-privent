import { describe, expect, it } from 'vitest';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn, type HttpExecOpts } from './_http-helpers.js';

const SESSION = '123e4567-e89b-42d3-a456-426614174abc';

function tokenizeParams(extra: Record<string, unknown> = {}) {
  return {
    resource: 'tokenize',
    operation: 'tokenize',
    sessionId: SESSION,
    textField: 'text',
    detectionMode: 'local', // skip the ML/risk call unless a test overrides
    reviewThreshold: 1,
    ...extra,
  };
}

async function runTokenize(opts: HttpExecOpts) {
  const { exec, calls } = makeHttpExecFn(opts);
  const out = await new Privent().execute.call(exec);
  const json = out[0]![0]!.json as Record<string, unknown>;
  const entities = (json.privent as { entities: Array<Record<string, unknown>> }).entities;
  return { text: json.text as string, entities, calls };
}

describe('PriventTokenize — org custom patterns', () => {
  it('masks a matching custom value to [KIND_NNN] with category/sensitivity', async () => {
    // detectionMode 'local' → no ML/risk call, proving custom masking applies
    // even when the risk path is skipped/unreachable.
    const { text, entities } = await runTokenize({
      apiKey: 'k-custom-basic',
      items: [{ json: { text: 'ticket ACME-42 open' } }],
      params: tokenizeParams(),
      activePatterns: [
        { kind: 'TICKET', pattern: 'ACME-\\d+', flags: '', category: 'strategic', sensitivity: 'high' },
      ],
    });
    expect(text).not.toContain('ACME-42');
    expect(text).toMatch(/\[TICKET_\d+\]/);
    const t = entities.find((e) => e.kind === 'TICKET');
    expect(t).toBeDefined();
    expect(t!.source).toBe('custom');
    expect(t!.category).toBe('strategic');
    expect(t!.sensitivity).toBe('high');
  });

  it('custom pattern wins over a longer overlapping built-in span', async () => {
    // EMAIL would match the whole address; the custom pattern matches the
    // codename inside it and must evict the longer built-in span.
    const { text, entities } = await runTokenize({
      apiKey: 'k-custom-builtin',
      items: [{ json: { text: 'ping alice.fixture@acme.invalid' } }],
      params: tokenizeParams(),
      activePatterns: [
        { kind: 'CODENAME', pattern: 'acme', flags: '', category: 'strategic', sensitivity: 'high' },
      ],
    });
    const kinds = entities.map((e) => e.kind);
    expect(kinds).toContain('CODENAME');
    expect(kinds).not.toContain('EMAIL');
    expect(text).not.toContain('acme');
    expect(text).toContain('alice.fixture@'); // EMAIL evicted → the address is left untouched
  });

  it('custom pattern wins over an overlapping backend/ML span', async () => {
    const { text, entities, calls } = await runTokenize({
      apiKey: 'k-custom-ml',
      items: [{ json: { text: 'ticket ACME-42 filed' } }],
      params: tokenizeParams({ detectionMode: 'auto', reviewThreshold: 0.9 }),
      activePatterns: [
        { kind: 'TICKET', pattern: 'ACME-\\d+', flags: '', category: 'strategic', sensitivity: 'high' },
      ],
      risk: {
        risk_score: 0.95,
        risk_level: 'CRITICAL',
        categories: {},
        model: 'ml',
        latency_ms: 1,
        entities: [{ kind: 'PRODUCT', value: 'ACME-42', span: [7, 14], confidence: 0.99, source: 'model' }],
      },
    });
    const kinds = entities.map((e) => e.kind);
    expect(text).not.toContain('ACME-42');
    expect(kinds).toContain('TICKET');
    expect(kinds).not.toContain('PRODUCT'); // ML span overlapping the custom match dropped
    expect(calls.filter((c) => c.url === '/v1/risk/score')).toHaveLength(1);
  });

  it('fail-open: a patterns-fetch failure still tokenizes on built-ins', async () => {
    const { text, entities } = await runTokenize({
      apiKey: 'k-custom-failopen',
      items: [{ json: { text: 'mail bob@fixture.invalid' } }],
      params: tokenizeParams(),
      failUrls: ['/v1/custom-patterns/active'],
    });
    const kinds = entities.map((e) => e.kind);
    expect(text).not.toContain('bob@fixture.invalid');
    expect(text).toMatch(/\[EMAIL_\d+\]/);
    expect(kinds).toContain('EMAIL');
  });
});

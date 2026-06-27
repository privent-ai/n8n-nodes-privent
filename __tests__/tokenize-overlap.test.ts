import { describe, expect, it } from 'vitest';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

const SID = '123e4567-e89b-42d3-a456-426614174777';

/**
 * Locks parity with core `hybrid.ts`'s regex pass: overlap removal
 * (longest span wins) + right-to-left replacement (span indices stay valid).
 * The reimplemented loop lives in PriventTokenize.node.ts (`detectMatches`).
 */
function tokExec(text: string) {
  return makeHttpExecFn({
    items: [{ json: { text } }],
    params: { resource: 'tokenize', operation: 'tokenize', sessionId: SID, textField: 'text', detectionMode: 'local', reviewThreshold: 1 },
    node: { id: 'n', name: 'Tokenize', type: 'n8n-nodes-privent.privent' },
  });
}

async function run(text: string) {
  const { exec } = tokExec(text);
  const out = await new Privent().execute.call(exec);
  const json = out[0]![0]!.json as Record<string, unknown>;
  const entities = (json.privent as { entities: Array<{ token: string; kind: string }> }).entities;
  return { text: json.text as string, entities };
}

describe('PriventTokenize detection — overlap / adjacency parity', () => {
  it('two back-to-back emails → two tokens, both originals removed, order preserved', async () => {
    const { text, entities } = await run('a@b.com,c@d.com');
    expect(entities).toHaveLength(2);
    expect(text).toBe('[EMAIL_001],[EMAIL_002]');
    expect(text).not.toContain('@');
  });

  it('nested: an IP inside a URL → longest span (URL) wins, IP not double-tokenized', async () => {
    const { text, entities } = await run('go to http://192.168.1.1/p now');
    expect(entities).toHaveLength(1);
    expect(entities[0]!.kind).toBe('URL');
    expect(text).not.toContain('192.168.1.1');
    expect(text).toMatch(/\[URL_001\]/);
  });

  it('nested: an email inside a URL → URL wins, email not separately tokenized', async () => {
    const { entities } = await run('visit http://user@host.com/x');
    expect(entities).toHaveLength(1);
    expect(entities[0]!.kind).toBe('URL');
  });

  it('adjacent distinct PII (IP then URL) → both tokenized, no raw leaks', async () => {
    const { text, entities } = await run('8.8.8.8 then http://x.com/a');
    expect(entities).toHaveLength(2);
    expect(entities.map((e) => e.kind).sort()).toEqual(['IP_ADDRESS', 'URL']);
    expect(text).not.toContain('8.8.8.8');
    expect(text).not.toContain('http://x.com/a');
  });

  it('clean text → no entities, text unchanged', async () => {
    const { text, entities } = await run('nothing sensitive here');
    expect(entities).toHaveLength(0);
    expect(text).toBe('nothing sensitive here');
  });
});

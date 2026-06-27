import { describe, it, expect } from 'vitest';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

const SID = '123e4567-e89b-42d3-a456-4266141740ff';
const FAIL = { failUrls: ['/v1/audit/events'] };

async function flushPromises() {
  await new Promise((r) => setImmediate(r));
}

function exec(node: { id: string; name: string; type: string }, params: Record<string, unknown>, items: Array<{ json: Record<string, unknown> }>) {
  return makeHttpExecFn({ items, params, node, ...FAIL }).exec;
}

describe('audit emission failures never break node execution', () => {
  it('PriventSession still produces output when the audit POST rejects', async () => {
    const out = await new Privent().execute.call(
      exec({ id: 'n', name: 'S', type: 't' }, { resource: 'session', operation: 'open', sessionIdMode: 'auto', agentName: '', webhookNodeName: '' }, [{ json: {} }]),
    );
    await flushPromises();
    expect(out[0]).toHaveLength(1);
  });

  it('PriventTokenize still produces output when the audit POST rejects', async () => {
    const out = await new Privent().execute.call(
      exec({ id: 'n', name: 'T', type: 't' }, { resource: 'tokenize', operation: 'tokenize', sessionId: SID, textField: 'text', detectionMode: 'local', reviewThreshold: 1 }, [{ json: { text: 'hi' } }]),
    );
    await flushPromises();
    expect(out[0]).toHaveLength(1);
  });

  it('PriventDetokenize still produces output when the audit POST rejects (both branches)', async () => {
    const trusted = await new Privent().execute.call(
      exec({ id: 'n', name: 'D', type: 't' }, { resource: 'detokenize', operation: 'detokenize', sessionId: SID, targetField: '*', strict: false }, [{ json: { body: 'plain' } }]),
    );
    expect(trusted[0]).toHaveLength(1);

    const blocked = await new Privent().execute.call(
      exec({ id: 'n', name: 'D', type: 't' }, { resource: 'detokenize', operation: 'detokenize', sessionId: SID, targetField: '*', strict: true, sinkUrl: 'https://untrusted/', trustedSinks: 'https://api.internal.corp/' }, [{ json: { body: 'plain' } }]),
    );
    await flushPromises();
    expect(blocked[0]).toHaveLength(1);
    expect(blocked[0]![0]!.json).toMatchObject({ privent: { detokenized: false } });
  });

  it('PriventRiskCheck still produces output when the audit POST rejects', async () => {
    const out = await new Privent().execute.call(
      exec({ id: 'n', name: 'R', type: 't' }, { resource: 'riskCheck', operation: 'score', textField: 'text', traceId: '', agentName: '' }, [{ json: { text: 'one' } }]),
    );
    await flushPromises();
    expect(out[0]).toHaveLength(1);
  });

  it('PriventAuditEvent still produces output when the audit POST rejects', async () => {
    const out = await new Privent().execute.call(
      exec({ id: 'n', name: 'A', type: 't' }, { resource: 'audit', operation: 'emit', sessionId: SID, traceId: '', agentName: '', eventType: 'error', extraMetadata: '{}' }, [{ json: {} }]),
    );
    await flushPromises();
    expect(out[0]).toHaveLength(1);
  });

  it('PriventHandoff still produces output when the audit POST rejects', async () => {
    const out = await new Privent().execute.call(
      exec({ id: 'n', name: 'H', type: 't' }, { resource: 'handoff', operation: 'record', sessionId: SID, traceId: '', agentName: 'src-agent', targetKind: 'agent', toAgentName: 'dst-agent', reason: 'delegation', payloadTokenCount: 0 }, [{ json: {} }]),
    );
    await flushPromises();
    expect(out[0]).toHaveLength(1);
    expect(out[0]![0]!.json).toMatchObject({ privent: { handoff: true } });
  });
});

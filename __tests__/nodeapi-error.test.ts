import { describe, expect, it } from 'vitest';
import { NodeApiError } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

const SID = '123e4567-e89b-42d3-a456-426614174e01';
const NODE = { id: 'n', name: 'Privent', type: 'n8n-nodes-privent.privent' };

async function flushPromises() {
  await new Promise((r) => setImmediate(r));
}

// Reviewer issue #2: HTTP-origin failures must surface as NodeApiError (status +
// body reach the UI), not raw/uncaught errors. The two previously-flagged sites:
//   1. Tokenize (cloud mode) — /v1/risk/score
//   2. Risk Check (batched) — /v1/risk/batch

describe('Tokenize cloud mode surfaces a NodeApiError on /v1/risk/score failure', () => {
  it('throws NodeApiError when the ML scoring call fails and not continuing', async () => {
    const { exec } = makeHttpExecFn({
      items: [{ json: { text: 'reach me at alice@example.com' } }],
      params: {
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: SID,
        textField: 'text',
        detectionMode: 'cloud',
        reviewThreshold: 0.9,
      },
      node: NODE,
      failUrls: ['/v1/risk/score'],
    });

    await expect(new Privent().execute.call(exec)).rejects.toBeInstanceOf(NodeApiError);
  });
});

describe('Risk Check surfaces a NodeApiError on /v1/risk/batch failure', () => {
  it('throws NodeApiError when the batch call fails and not continuing', async () => {
    const { exec } = makeHttpExecFn({
      items: [{ json: { text: 'one' } }, { json: { text: 'two' } }],
      params: { resource: 'riskCheck', operation: 'score', textField: 'text', traceId: '', agentName: '' },
      node: NODE,
      failUrls: ['/v1/risk/batch'],
    });

    await expect(new Privent().execute.call(exec)).rejects.toBeInstanceOf(NodeApiError);
  });

  it('emits a per-item error output for every batched item when continuing on fail', async () => {
    const { exec } = makeHttpExecFn({
      items: [{ json: { text: 'one' } }, { json: { text: 'two' } }],
      params: { resource: 'riskCheck', operation: 'score', textField: 'text', traceId: '', agentName: '' },
      node: NODE,
      continueOnFail: true,
      failUrls: ['/v1/risk/batch'],
    });

    const out = await new Privent().execute.call(exec);
    await flushPromises();

    expect(out[0]).toHaveLength(2);
    for (const row of out[0]!) {
      expect(row.json).toHaveProperty('error');
      expect(typeof (row.json as Record<string, unknown>).error).toBe('string');
    }
  });
});

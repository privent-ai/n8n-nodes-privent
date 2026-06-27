import { describe, expect, it } from 'vitest';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

const SESSION_NODE = { id: 'n', name: 'Privent Session', type: 'n8n-nodes-privent.privent' };

function sessionExec(params: Record<string, unknown>) {
  return makeHttpExecFn({
    items: [{ json: {} }],
    params: { resource: 'session', operation: 'open', framework: 'n8n', webhookNodeName: '', ...params },
    node: SESSION_NODE,
  }).exec;
}

describe('PriventSession manual sessionId UUID guard (Option A)', () => {
  it('throws a clear NodeOperationError when manual sessionId is not a UUID', async () => {
    const exec = sessionExec({ sessionIdMode: 'manual', sessionId: 'not-a-uuid' });
    await expect(new Privent().execute.call(exec)).rejects.toThrow(
      /Manual Session ID must be a UUID/,
    );
  });

  it('accepts a valid UUID in manual mode', async () => {
    const exec = sessionExec({
      sessionIdMode: 'manual',
      sessionId: '123e4567-e89b-42d3-a456-426614174000',
    });
    const out = await new Privent().execute.call(exec);
    expect((out[0]![0]!.json as Record<string, unknown>).sessionId).toBe(
      '123e4567-e89b-42d3-a456-426614174000',
    );
  });

  it('auto mode generates a UUID sessionId', async () => {
    const exec = sessionExec({ sessionIdMode: 'auto' });
    const out = await new Privent().execute.call(exec);
    expect((out[0]![0]!.json as Record<string, unknown>).sessionId as string).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});

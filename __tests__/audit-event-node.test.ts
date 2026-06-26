import { describe, expect, it } from 'vitest';
import { PriventAuditEvent } from '../nodes/PriventAuditEvent/PriventAuditEvent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

const SID = '123e4567-e89b-42d3-a456-426614174abc';
const AUDIT_NODE = { id: 'node-audit-1', name: 'Privent Audit Event', type: 'n8n-nodes-privent.priventAuditEvent' };

async function flushPromises() {
  await new Promise((r) => setImmediate(r));
}

function auditExec(params: Record<string, unknown>) {
  return makeHttpExecFn({
    items: [{ json: {} }],
    params: { traceId: '', agentName: 'cost-tracked-flow', ...params },
    node: AUDIT_NODE,
    workflow: { id: 'wf-99', name: 'cost-tracked-flow' },
    executionId: '42',
    mode: 'manual',
  });
}

function lastEvent(events: Array<Record<string, unknown>>): Record<string, unknown> {
  expect(events.length).toBeGreaterThan(0);
  return events[events.length - 1]!;
}

describe('PriventAuditEvent.execute', () => {
  it('emits an llm_call event with provider, model, and token counts', async () => {
    const { exec, auditEvents } = auditExec({
      sessionId: SID,
      eventType: 'llm_call',
      model: 'openai|gpt-4o-mini',
      promptTokens: 123,
      completionTokens: 456,
      extraMetadata: '{}',
    });

    const result = await new PriventAuditEvent().execute.call(exec);
    await flushPromises();

    const event = lastEvent(auditEvents());
    expect(event.type).toBe('llm_call');
    expect(event.session_id).toBe(SID);
    expect(event.framework).toBe('n8n');
    expect(event.workflow_id).toBe('wf-99');
    expect(event.node_id).toBe('node-audit-1');
    const meta = event.metadata as Record<string, unknown>;
    expect(meta.provider).toBe('openai');
    expect(meta.model).toBe('gpt-4o-mini');
    expect(meta.prompt_tokens).toBe(123);
    expect(meta.completion_tokens).toBe(456);
    expect(meta.execution_id).toBe('42');
    expect(meta.trigger_mode).toBe('manual');
    expect(meta.agent_name).toBe('cost-tracked-flow');
    expect(typeof meta.framework_version).toBe('string');

    expect(result[0]?.[0]?.json).toMatchObject({
      privent: { sessionId: SID, auditEventEmitted: true, eventType: 'llm_call' },
    });
  });

  it('treats non-numeric or negative token counts as 0', async () => {
    const { exec, auditEvents } = auditExec({
      sessionId: SID,
      eventType: 'llm_call',
      model: 'openai|gpt-4o',
      promptTokens: 'not-a-number',
      completionTokens: -5,
      extraMetadata: '{}',
    });

    await new PriventAuditEvent().execute.call(exec);
    await flushPromises();

    const meta = lastEvent(auditEvents()).metadata as Record<string, unknown>;
    expect(meta.prompt_tokens).toBe(0);
    expect(meta.completion_tokens).toBe(0);
  });

  it('treats a bare model value (no provider|) as model-only', async () => {
    const { exec, auditEvents } = auditExec({
      sessionId: SID,
      eventType: 'llm_call',
      model: 'gpt-4o-mini',
      promptTokens: 1,
      completionTokens: 1,
      extraMetadata: '{}',
    });

    await new PriventAuditEvent().execute.call(exec);
    await flushPromises();

    const meta = lastEvent(auditEvents()).metadata as Record<string, unknown>;
    expect(meta.model).toBe('gpt-4o-mini');
    expect(meta).not.toHaveProperty('provider');
  });

  it('emits policy_decision and merges extraMetadata JSON', async () => {
    const { exec, auditEvents } = auditExec({
      sessionId: SID,
      eventType: 'policy_decision',
      extraMetadata: '{"decision":"BLOCK","reason":"PII over threshold"}',
    });

    await new PriventAuditEvent().execute.call(exec);
    await flushPromises();

    const event = lastEvent(auditEvents());
    expect(event.type).toBe('policy_decision');
    const meta = event.metadata as Record<string, unknown>;
    expect(meta.decision).toBe('BLOCK');
    expect(meta.reason).toBe('PII over threshold');
    expect(meta).not.toHaveProperty('provider');
    expect(meta).not.toHaveProperty('prompt_tokens');
  });

  it('ignores invalid extraMetadata JSON without breaking the workflow', async () => {
    const { exec, auditEvents } = auditExec({
      sessionId: SID,
      eventType: 'error',
      extraMetadata: '{not valid json',
    });

    await new PriventAuditEvent().execute.call(exec);
    await flushPromises();

    const event = lastEvent(auditEvents());
    expect(event.type).toBe('error');
    expect((event.metadata as Record<string, unknown>).execution_id).toBe('42');
  });

  it('accepts a pre-parsed object from the json expression engine', async () => {
    const { exec, auditEvents } = auditExec({
      sessionId: SID,
      eventType: 'egress',
      extraMetadata: { sink_id: 'opaque-id', sink_trusted: true },
    });

    await new PriventAuditEvent().execute.call(exec);
    await flushPromises();

    const meta = lastEvent(auditEvents()).metadata as Record<string, unknown>;
    expect(meta.sink_id).toBe('opaque-id');
    expect(meta.sink_trusted).toBe(true);
  });
});

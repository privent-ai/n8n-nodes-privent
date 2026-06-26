import { describe, it, expect } from 'vitest';
import { PriventSession } from '../nodes/PriventSession/PriventSession.node.js';
import { PriventTokenize } from '../nodes/PriventTokenize/PriventTokenize.node.js';
import { PriventDetokenize } from '../nodes/PriventDetokenize/PriventDetokenize.node.js';
import { PriventRiskCheck } from '../nodes/PriventRiskCheck/PriventRiskCheck.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

const EXEC_ID = 'exec-emit-1';

async function flushPromises() {
  await new Promise((r) => setImmediate(r));
}

// ─── Triad (stateless / HTTP) — audit events asserted off the wire payload ────

describe('PriventSession audit emission', () => {
  it('emits a session_open event with snake_case metadata', async () => {
    const { exec, auditEvents } = makeHttpExecFn({
      items: [{ json: { foo: 'bar' } }],
      params: { sessionIdMode: 'auto', agentName: 'router-bot', framework: 'n8n', webhookNodeName: '' },
      executionId: EXEC_ID,
      node: { id: 'node-uuid-1', name: 'Session', type: 'n8n-nodes-privent.priventSession' },
    });

    const result = await new PriventSession().execute.call(exec);
    await flushPromises();

    expect(result[0]).toHaveLength(1);
    const events = auditEvents();
    expect(events).toHaveLength(1);
    const event = events[0]!;
    expect(event.type).toBe('session_open');
    expect(event.framework).toBe('n8n');
    expect(event.workflow_id).toBe('wf-1');
    expect(event.node_id).toBe('node-uuid-1');
    expect(event.metadata).toMatchObject({
      agent_name: 'router-bot',
      workflow_name: 'Test Workflow',
      execution_id: EXEC_ID,
      node_name: 'Session',
      session_id_mode: 'auto',
      framework: 'n8n',
    });
    const meta = event.metadata as Record<string, unknown>;
    expect(typeof meta.framework_version).toBe('string');
    expect((meta.framework_version as string).length).toBeGreaterThan(0);

    // sessionId + traceId are written to the output item for downstream nodes.
    const json = result[0]![0]!.json as Record<string, unknown>;
    expect(json.sessionId).toBe(event.session_id);
    expect(json.traceId).toBe(event.trace_id);
    expect(json.agentName).toBe('router-bot');
  });
});

describe('PriventTokenize audit emission', () => {
  it('emits a tokenize event whose metadata excludes raw text/tokens', async () => {
    const { exec, auditEvents } = makeHttpExecFn({
      items: [{ json: { text: 'Reach me at alice@example.com' } }],
      params: { sessionId: '123e4567-e89b-42d3-a456-426614174001', textField: 'text', detectionMode: 'local', reviewThreshold: 1 },
      executionId: EXEC_ID,
      node: { id: 'node-uuid-1', name: 'Tokenize', type: 'n8n-nodes-privent.priventTokenize' },
    });

    const out = await new PriventTokenize().execute.call(exec);
    await flushPromises();

    expect(out[0]).toHaveLength(1);
    const events = auditEvents();
    expect(events).toHaveLength(1);
    const event = events[0]!;
    expect(event.type).toBe('tokenize');
    expect(event.session_id).toBe('123e4567-e89b-42d3-a456-426614174001');
    const meta = event.metadata as Record<string, unknown>;
    expect(meta).toMatchObject({
      agent_name: '',
      execution_id: EXEC_ID,
      node_name: 'Tokenize',
      detection_mode: 'local',
    });
    expect(meta.entity_count as number).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(meta.entity_kinds)).toBe(true);
    expect(meta.flagged_for_review).toBe(false);
    // Local mode: risk score skipped → null on the wire.
    expect(meta.risk_score).toBeNull();
    expect(meta.risk_level).toBeNull();
    // No raw or sensitive payload escapes into metadata.
    expect(meta).not.toHaveProperty('text');
    expect(meta).not.toHaveProperty('tokenizedText');
    expect(meta).not.toHaveProperty('token');
  });
});

describe('PriventDetokenize audit emission', () => {
  it('emits a detokenize event on the happy path with sink trust = true', async () => {
    const { exec, auditEvents } = makeHttpExecFn({
      items: [{ json: { body: 'no tokens here' } }],
      params: { sessionId: '123e4567-e89b-42d3-a456-426614174002', targetField: '*', strict: false },
      executionId: EXEC_ID,
      node: { id: 'node-uuid-1', name: 'Detokenize', type: 'n8n-nodes-privent.priventDetokenize' },
    });

    const out = await new PriventDetokenize().execute.call(exec);
    await flushPromises();

    expect(out[0]).toHaveLength(1);
    const events = auditEvents();
    expect(events).toHaveLength(1);
    const event = events[0]!;
    expect(event.type).toBe('detokenize');
    expect(event.metadata).toMatchObject({
      sink_trusted: true,
      sink_id: null,
      sink_url_host: null,
      strict: false,
    });
    expect(event.metadata).toHaveProperty('tokens_redeemed');
  });
});

describe('PriventRiskCheck audit emission', () => {
  it('emits one risk_check event per item and never includes raw text', async () => {
    const { exec, auditEvents } = makeHttpExecFn({
      items: [{ json: { text: 'one' } }, { json: { text: 'two' } }],
      params: { textField: 'text', traceId: '', agentName: '' },
      executionId: EXEC_ID,
      node: { id: 'node-uuid-1', name: 'RiskCheck', type: 'n8n-nodes-privent.priventRiskCheck' },
    });

    const out = await new PriventRiskCheck().execute.call(exec);
    await flushPromises();

    expect(out[0]).toHaveLength(2);
    const events = auditEvents();
    expect(events).toHaveLength(2);
    for (const event of events) {
      expect(event.type).toBe('risk_check');
      // Sessionless node → session_id is the (UUID) traceId.
      expect(event.session_id as string).toMatch(/^[0-9a-f-]{36}$/);
      expect(event.session_id).toBe(event.trace_id);
      const meta = event.metadata as Record<string, unknown>;
      expect(meta).toMatchObject({ node_name: 'RiskCheck', batch_size: 2 });
      expect(meta).toHaveProperty('risk_level');
      expect(meta).toHaveProperty('risk_score');
      expect(meta).toHaveProperty('latency_ms');
      expect(meta).toHaveProperty('categories');
      expect(meta).not.toHaveProperty('text');
    }
  });
});

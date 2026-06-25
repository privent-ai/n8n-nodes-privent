import { describe, expect, it, vi } from 'vitest';
import { PriventSession } from '../nodes/PriventSession/PriventSession.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

async function flushPromises() {
  await new Promise((r) => setImmediate(r));
}

const SESSION_NODE = {
  id: 'node-session-1',
  name: 'Privent Session',
  type: 'n8n-nodes-privent.priventSession',
};

function sessionExec(
  params: Record<string, unknown>,
  evaluateExpression?: (expr: string, i: number) => unknown,
) {
  return makeHttpExecFn({
    items: [{ json: {} }],
    params,
    node: SESSION_NODE,
    workflow: { id: 'wf-99', name: 'webhook-flow' },
    mode: 'webhook',
    evaluateExpression:
      evaluateExpression ??
      (() => {
        throw new Error('no upstream Webhook node');
      }),
  });
}

function lastMeta(events: Array<Record<string, unknown>>): Record<string, unknown> {
  expect(events.length).toBeGreaterThan(0);
  return events[events.length - 1]!.metadata as Record<string, unknown>;
}

describe('PriventSession trigger context auto-parse', () => {
  it('parses x-forwarded-for (first hop) and user-agent into trigger principal fields', async () => {
    const { exec, auditEvents } = sessionExec(
      { sessionIdMode: 'auto', framework: 'n8n', webhookNodeName: 'Webhook' },
      (expr: string) => {
        expect(expr).toContain('$("Webhook")');
        return {
          host: 'n8n.example.com',
          'x-forwarded-for': '203.0.113.42, 10.0.0.5',
          'user-agent': 'curl/8.4.0',
          'content-type': 'application/json',
        };
      },
    );

    await new PriventSession().execute.call(exec);
    await flushPromises();

    const events = auditEvents();
    expect(events[events.length - 1]!.type).toBe('session_open');
    const meta = lastMeta(events);
    expect(meta.trigger_principal_ip).toBe('203.0.113.42');
    expect(meta.trigger_principal_user_agent).toBe('curl/8.4.0');
    expect(typeof meta.framework_version).toBe('string');
    expect((meta.framework_version as string).length).toBeGreaterThan(0);
    expect(meta.trigger_mode).toBe('webhook');
    expect(meta.agent_name).toBe('webhook-flow');
    expect(meta.session_id_mode).toBe('auto');
  });

  it('falls back to cf-connecting-ip when x-forwarded-for is absent', async () => {
    const { exec, auditEvents } = sessionExec(
      { sessionIdMode: 'auto', framework: 'n8n', webhookNodeName: 'Webhook' },
      () => ({
        'CF-Connecting-IP': '198.51.100.7', // mixed case to assert lower-casing
        'user-agent': 'Cloudflare/1.0',
      }),
    );

    await new PriventSession().execute.call(exec);
    await flushPromises();

    const meta = lastMeta(auditEvents());
    expect(meta.trigger_principal_ip).toBe('198.51.100.7');
    expect(meta.trigger_principal_user_agent).toBe('Cloudflare/1.0');
  });

  it('omits trigger_principal_* when upstream Webhook node throws', async () => {
    const { exec, auditEvents } = sessionExec(
      { sessionIdMode: 'auto', framework: 'n8n', webhookNodeName: 'Webhook' },
      () => {
        throw new Error('node "Webhook" not found');
      },
    );

    await new PriventSession().execute.call(exec);
    await flushPromises();

    const events = auditEvents();
    expect(events[events.length - 1]!.type).toBe('session_open');
    const meta = lastMeta(events);
    expect(meta).not.toHaveProperty('trigger_principal_ip');
    expect(meta).not.toHaveProperty('trigger_principal_user_agent');
    expect(typeof meta.framework_version).toBe('string');
  });

  it('omits trigger_principal_* when webhookNodeName is empty', async () => {
    const evaluateExpression = vi.fn();
    const { exec, auditEvents } = sessionExec(
      { sessionIdMode: 'auto', framework: 'n8n', webhookNodeName: '' },
      evaluateExpression,
    );

    await new PriventSession().execute.call(exec);
    await flushPromises();

    expect(evaluateExpression).not.toHaveBeenCalled();
    expect(lastMeta(auditEvents())).not.toHaveProperty('trigger_principal_ip');
  });

  it('truncates oversized user-agent to 500 chars', async () => {
    const ua = 'A'.repeat(700);
    const { exec, auditEvents } = sessionExec(
      { sessionIdMode: 'auto', framework: 'n8n', webhookNodeName: 'Webhook' },
      () => ({ 'user-agent': ua }),
    );

    await new PriventSession().execute.call(exec);
    await flushPromises();

    expect((lastMeta(auditEvents()).trigger_principal_user_agent as string).length).toBe(500);
  });
});

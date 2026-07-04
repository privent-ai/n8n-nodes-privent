import { describe, it, expect, vi } from 'vitest';
import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

const EXEC_ID = 'exec-enrich-1';

async function flushPromises() {
  await new Promise((r) => setImmediate(r));
}

// ─── apiKey: node_version + vault_backend now ride the audit metadata ──────────

describe('apiKey audit metadata enrichment', () => {
  it('adds node_version (non-empty string) and vault_backend=cloud', async () => {
    const { exec, auditEvents } = makeHttpExecFn({
      items: [{ json: { foo: 'bar' } }],
      params: { authentication: 'apiKey', resource: 'session', operation: 'open', sessionIdMode: 'auto', agentName: 'bot', framework: 'n8n', webhookNodeName: '' },
      executionId: EXEC_ID,
      vaultBackend: 'cloud',
    });

    await new Privent().execute.call(exec);
    await flushPromises();

    const meta = auditEvents()[0]!.metadata as Record<string, unknown>;
    // Un-bundled unit run: the tsup __SDK_VERSION__ define never ran → 'unknown'.
    // Assert only that it is a non-empty string (real version is checked in dist).
    expect(typeof meta.node_version).toBe('string');
    expect((meta.node_version as string).length).toBeGreaterThan(0);
    expect(meta.vault_backend).toBe('cloud');
  });

  it('reflects vault_backend=memory from the credential', async () => {
    const { exec, auditEvents } = makeHttpExecFn({
      items: [{ json: { text: 'Reach me at alice@example.com' } }],
      params: { authentication: 'apiKey', resource: 'tokenize', operation: 'tokenize', sessionId: '123e4567-e89b-42d3-a456-426614174001', textField: 'text', detectionMode: 'local', reviewThreshold: 1 },
      executionId: EXEC_ID,
      vaultBackend: 'memory',
    });

    await new Privent().execute.call(exec);
    await flushPromises();

    const meta = auditEvents()[0]!.metadata as Record<string, unknown>;
    expect(meta.vault_backend).toBe('memory');
  });
});

// ─── tokenless + local emit NO audit, so no enrichment leaks there ─────────────

function makeStaticExec(
  params: Record<string, unknown>,
  items: INodeExecutionData[],
  httpAuth: ReturnType<typeof vi.fn>,
  httpRequest: ReturnType<typeof vi.fn>,
): IExecuteFunctions {
  const staticData: IDataObject = {};
  return {
    getInputData: () => items,
    getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
      name in params ? params[name] : fallback,
    getCredentials: async () => ({ baseUrl: 'https://api.test.local' }),
    getNode: () => ({ id: 'n1', name: 'Privent', type: 'n8n-nodes-privent.privent' }),
    getExecutionId: () => 'exec-no-audit',
    getWorkflow: () => ({ id: 'wf', name: 'wf' }),
    getWorkflowStaticData: () => staticData,
    getMode: () => 'manual',
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: { httpRequestWithAuthentication: httpAuth, httpRequest },
  } as unknown as IExecuteFunctions;
}

function auditCallCount(fn: ReturnType<typeof vi.fn>): number {
  return fn.mock.calls.filter(
    (c) => String((c[1] as { url?: string } | undefined)?.url ?? '') === '/v1/audit/events',
  ).length;
}

describe('tokenless/local emit no audit event (unaffected by enrichment)', () => {
  it('tokenless tokenize posts no /v1/audit/events', async () => {
    const httpAuth = vi.fn(async () => ({}));
    const httpRequest = vi.fn(async () => ({}));
    const exec = makeStaticExec(
      { authentication: 'tokenless', resource: 'tokenize', operation: 'tokenize', sessionId: '123e4567-e89b-42d3-a456-426614174002', textField: 'text', detectionMode: 'local', reviewThreshold: 1 },
      [{ json: { text: 'email me at jane@northwind.com' } }],
      httpAuth,
      httpRequest,
    );

    await new Privent().execute.call(exec);
    await flushPromises();

    expect(auditCallCount(httpAuth)).toBe(0);
    expect(auditCallCount(httpRequest)).toBe(0);
  });

  it('local tokenize posts no /v1/audit/events (zero network)', async () => {
    const throwOnHttp = vi.fn(async () => {
      throw new Error('local mode must not perform any HTTP');
    });
    const exec = makeStaticExec(
      { authentication: 'local', resource: 'tokenize', operation: 'tokenize', sessionId: '', textField: 'text', detectionLevel: 'standard' },
      [{ json: { text: 'email me at jane@northwind.com' } }],
      throwOnHttp,
      throwOnHttp,
    );

    await new Privent().execute.call(exec);
    await flushPromises();

    expect(throwOnHttp).not.toHaveBeenCalled();
  });
});

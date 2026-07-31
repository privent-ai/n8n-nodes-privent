import { describe, expect, it, vi } from 'vitest';
import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

const TELEMETRY_URL = '/v1/telemetry/events';
const ALLOWLIST = new Set([
  'install_id',
  'event',
  'operation',
  'auth_mode',
  'node_version',
  'n8n_version',
  'item_count',
  'status',
  'error_type',
  'timestamp',
]);

async function flushPromises() {
  await new Promise((r) => setImmediate(r));
}

/** Minimal exec with workflow static data + separate http mocks, for the
 *  tokenless/local paths (which use the in-memory vault, not the HTTP triad). */
function makeExec(
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
    getExecutionId: () => 'exec-telemetry',
    getWorkflow: () => ({ id: 'wf', name: 'wf' }),
    getWorkflowStaticData: () => staticData,
    getMode: () => 'manual',
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: { httpRequestWithAuthentication: httpAuth, httpRequest },
  } as unknown as IExecuteFunctions;
}

/** Telemetry POST bodies captured off an httpRequest mock. */
function telemetryCalls(fn: ReturnType<typeof vi.fn>): Array<{ url: string; headers?: Record<string, unknown>; body: { events: Array<Record<string, unknown>> } }> {
  return fn.mock.calls
    .map((c) => c[0] as { url?: string; headers?: Record<string, unknown>; body?: { events?: Array<Record<string, unknown>> } })
    .filter((o) => o?.url === TELEMETRY_URL) as never;
}

const TOKENIZE_PARAMS = {
  resource: 'tokenize',
  operation: 'tokenize',
  sessionId: '123e4567-e89b-42d3-a456-426614174777',
  textField: 'text',
  detectionMode: 'local',
  reviewThreshold: 1,
  traceId: '',
  agentName: '',
};

describe('tokenless telemetry', () => {
  it('sends exactly one anonymous, allowlisted, unauthenticated ping', async () => {
    const httpAuth = vi.fn(async () => ({}));
    const httpRequest = vi.fn(async () => ({}));
    const exec = makeExec(
      { authentication: 'tokenless', ...TOKENIZE_PARAMS },
      [{ json: { text: 'email me at jane.nw@fixture.invalid' } }],
      httpAuth,
      httpRequest,
    );

    const out = await new Privent().execute.call(exec);
    await flushPromises();

    const pings = telemetryCalls(httpRequest);
    expect(pings).toHaveLength(1);

    const call = pings[0]!;
    // Unauthenticated: no Bearer / Authorization header on the telemetry request.
    expect(call.headers?.Authorization).toBeUndefined();

    const event = call.body.events[0]!;
    // Payload keys are a subset of the allowlist — nothing else leaks.
    for (const k of Object.keys(event)) expect(ALLOWLIST.has(k)).toBe(true);
    expect(event).toMatchObject({
      event: 'node_execution',
      operation: 'tokenize',
      auth_mode: 'tokenless',
      status: 'success',
      item_count: 1,
    });
    expect(typeof event.install_id).toBe('string');
    expect((event.install_id as string).length).toBeGreaterThan(0);
    // No sensitive payload escapes.
    expect(JSON.stringify(event)).not.toContain('jane.nw@fixture.invalid');

    // The op still produced its tokenized item.
    expect(out[0]).toHaveLength(1);
  });

  it('reuses one install_id across executions (cached in static data)', async () => {
    const httpRequest = vi.fn(async () => ({}));
    const exec = makeExec(
      { authentication: 'tokenless', ...TOKENIZE_PARAMS },
      [{ json: { text: 'plain text, no pii' } }],
      vi.fn(async () => ({})),
      httpRequest,
    );

    await new Privent().execute.call(exec);
    await new Privent().execute.call(exec);
    await flushPromises();

    const ids = telemetryCalls(httpRequest).map((c) => c.body.events[0]!.install_id);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(ids[1]);
  });

  it('a telemetry HTTP failure does not fail the op', async () => {
    const httpRequest = vi.fn(async (o: { url?: string }) => {
      if (o.url === TELEMETRY_URL) throw new Error('telemetry backend down');
      return {};
    });
    const exec = makeExec(
      { authentication: 'tokenless', ...TOKENIZE_PARAMS },
      [{ json: { text: 'email me at jane.nw@fixture.invalid' } }],
      vi.fn(async () => ({})),
      httpRequest,
    );

    const out = await new Privent().execute.call(exec);
    await flushPromises();

    // Item still returned, tokenized — the rejected telemetry ping was swallowed.
    expect(out[0]).toHaveLength(1);
    const text = (out[0]![0]!.json as Record<string, unknown>).text as string;
    expect(text).toMatch(/\[EMAIL_\d+\]/);
  });
});

describe('apiKey / local emit no telemetry', () => {
  it('apiKey run posts nothing to /v1/telemetry/events', async () => {
    const { exec, calls } = makeHttpExecFn({
      items: [{ json: { text: 'Reach me at alice@fixture.invalid' } }],
      params: { authentication: 'apiKey', resource: 'tokenize', operation: 'tokenize', sessionId: '123e4567-e89b-42d3-a456-426614174001', textField: 'text', detectionMode: 'local', reviewThreshold: 1 },
    });

    await new Privent().execute.call(exec);
    await flushPromises();

    expect(calls.some((c) => c.url === TELEMETRY_URL)).toBe(false);
  });

  it('local run performs zero network (no telemetry)', async () => {
    const throwOnHttp = vi.fn(async () => {
      throw new Error('local mode must not perform any HTTP');
    });
    const exec = makeExec(
      { authentication: 'local', resource: 'tokenize', operation: 'tokenize', sessionId: '', textField: 'text', detectionLevel: 'standard' },
      [{ json: { text: 'email me at jane.nw@fixture.invalid' } }],
      throwOnHttp,
      throwOnHttp,
    );

    const out = await new Privent().execute.call(exec);
    await flushPromises();

    expect(throwOnHttp).not.toHaveBeenCalled();
    expect(out[0]).toHaveLength(1);
  });
});

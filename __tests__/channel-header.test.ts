/**
 * `X-Privent-Client` must be on EVERY outbound backend call, on both transports.
 *
 * WHAT THIS FILE IS AND IS NOT. It is a regression guard: it asserts against a
 * simulation of the backend, so a green run here says the node put the header
 * into the request options it handed the host — not that the header left the
 * process. The evidence that it leaves is a recorder outside this repository,
 * observing a real `n8nio/n8n` container; this file cannot produce it and does
 * not claim to (METHOD §9 — a simulation with no comparator teaches whatever it
 * says).
 *
 * The reason it is still worth having: the recorder runs by hand, and this runs
 * on every commit. It is what notices a seventh call site added later without
 * the header — the failure mode where the backend attributes one path to the
 * in-engine interceptor because it is the only one that says nothing.
 *
 * BOTH TRANSPORTS, DELIBERATELY. `priventRequest` authenticates through
 * `httpRequestWithAuthentication`; the tokenless path sends a bare
 * `httpRequest`. They are separate objects with separate header maps, and an
 * apiKey-only assertion would leave the tokenless one uncovered — which is
 * NP-AK's shape, on a header instead of a timeout.
 */
import { describe, expect, it, vi } from 'vitest';
import type { IDataObject, IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { PriventApi } from '../credentials/PriventApi.credentials.js';
import { PriventVisitorApi } from '../credentials/PriventVisitorApi.credentials.js';
import { PRIVENT_CLIENT_HEADERS } from '../shared/privent-client.js';
import { makeHttpExecFn } from './_http-helpers.js';

const HEADER = 'X-Privent-Client';
const VALUE = PRIVENT_CLIENT_HEADERS[HEADER];

async function flushPromises() {
  await new Promise((r) => setImmediate(r));
}

/** Case-insensitive read: a header map is not a case-sensitive dictionary on the
 *  wire, and asserting one exact casing would pass or fail for the wrong reason. */
function headerOf(headers: Record<string, unknown> | undefined): unknown {
  if (!headers) return undefined;
  const hit = Object.entries(headers).find(([k]) => k.toLowerCase() === HEADER.toLowerCase());
  return hit?.[1];
}

describe('X-Privent-Client — apiKey transport (httpRequestWithAuthentication)', () => {
  it('is on every recorded call across session, tokenize and audit', async () => {
    const { exec, calls } = makeHttpExecFn({
      items: [{ json: { text: 'reach alice@fixture.invalid' } }],
      params: {
        authentication: 'apiKey',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174001',
        textField: 'text',
        detectionMode: 'auto',
        reviewThreshold: 1,
        traceId: '',
        agentName: '',
      },
      node: { id: 'node-uuid-1', name: 'Tokenize', type: 'n8n-nodes-privent.privent' },
    });

    await new Privent().execute.call(exec);
    await flushPromises();

    // The assertion is worthless if nothing was sent — say so rather than passing
    // on an empty array, which is the shape a broken harness produces.
    expect(calls.length).toBeGreaterThan(0);
    const naked = calls.filter((c) => headerOf(c.headers) !== VALUE).map((c) => c.url);
    expect(naked).toEqual([]);
  });

  it('covers the prerequisite fetch, which uses the helper directly rather than priventRequest', async () => {
    const { exec, calls } = makeHttpExecFn({
      items: [{ json: { text: 'reach alice@fixture.invalid' } }],
      params: {
        authentication: 'apiKey',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174009',
        textField: 'text',
        detectionMode: 'auto',
        reviewThreshold: 1,
        traceId: '',
        agentName: '',
      },
      apiKey: 'pv_live_channel_header_probe',
      activePatterns: [],
      node: { id: 'node-uuid-1', name: 'Tokenize', type: 'n8n-nodes-privent.privent' },
    });

    await new Privent().execute.call(exec);
    await flushPromises();

    const patterns = calls.find((c) => c.url === '/v1/custom-patterns/active');
    expect(patterns).toBeDefined();
    expect(headerOf(patterns!.headers)).toBe(VALUE);
  });
});

// ─── tokenless: bare httpRequest, a different header map ─────────────────────

interface HttpOpts {
  method?: string;
  url?: string;
  headers?: Record<string, unknown>;
  body?: Record<string, unknown>;
}

function makeTokenlessExec(items: INodeExecutionData[], params: Record<string, unknown>) {
  const calls: HttpOpts[] = [];
  const httpRequest = vi.fn(async (opts: HttpOpts) => {
    calls.push(opts);
    const url = opts.url ?? '';
    if (url === '/v1/visitor/credentials') {
      return { visitor_id: 'vid-hdr', expires_at: Math.floor(Date.now() / 1000) + 3600 };
    }
    if (url === '/v1/risk/batch') {
      const n = ((opts.body?.items as unknown[]) ?? []).length;
      return {
        results: Array.from({ length: n }, () => ({
          risk_score: 0.1,
          risk_level: 'LOW',
          categories: [],
          model: 'visitor-lite',
          latency_ms: 1,
          entities: [],
        })),
      };
    }
    return {};
  });
  const staticData: IDataObject = {};
  const exec = {
    getInputData: () => items,
    getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
      name in params ? params[name] : fallback,
    getCredentials: async () => ({ baseUrl: 'https://api.test.local' }),
    getNode: () => ({ id: 'n', name: 'Privent', type: 'n8n-nodes-privent.privent' }),
    getExecutionId: () => 'exec-hdr',
    getWorkflow: () => ({ id: 'wf-hdr', name: 'hdr' }),
    getWorkflowStaticData: () => staticData,
    getMode: () => 'manual',
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: { httpRequest, httpRequestWithAuthentication: vi.fn(async () => ({})) },
  } as unknown as IExecuteFunctions;
  return { exec, calls };
}

describe('X-Privent-Client — tokenless transport (bare httpRequest)', () => {
  it('is on the visitor mint, the scoring call and the telemetry ping', async () => {
    const { exec, calls } = makeTokenlessExec([{ json: { text: 'score this' } }], {
      authentication: 'tokenless',
      resource: 'riskCheck',
      operation: 'score',
      textField: 'text',
      traceId: '',
      agentName: '',
    });

    await new Privent().execute.call(exec);
    await flushPromises();

    const urls = calls.map((c) => c.url);
    // Named individually rather than asserted in bulk: each is a separate call
    // site in `privent-http.ts`, and a bulk assertion over whatever happened to
    // be called cannot tell a covered site from an unreached one.
    expect(urls).toContain('/v1/visitor/credentials');
    expect(urls).toContain('/v1/risk/batch');
    expect(urls).toContain('/v1/telemetry/events');

    const naked = calls.filter((c) => headerOf(c.headers) !== VALUE).map((c) => c.url);
    expect(naked).toEqual([]);
  });

  it('does not displace X-Visitor-Id on the transport that carries both', async () => {
    const { exec, calls } = makeTokenlessExec([{ json: { text: 'score this' } }], {
      authentication: 'tokenless',
      resource: 'riskCheck',
      operation: 'score',
      textField: 'text',
      traceId: '',
      agentName: '',
    });

    await new Privent().execute.call(exec);
    await flushPromises();

    const batch = calls.find((c) => c.url === '/v1/risk/batch');
    expect(batch).toBeDefined();
    expect(headerOf(batch!.headers)).toBe(VALUE);
    expect(batch!.headers?.['X-Visitor-Id']).toBe('vid-hdr');
  });
});

// ─── editor-time surfaces: the node's model search and both credential tests ──

describe('X-Privent-Client — editor-time backend calls', () => {
  it('is on the model-search loadOptions request', async () => {
    const httpRequestWithAuthentication = vi.fn(async (_cred: string, _opts: HttpOpts) => ({
      models: [],
    }));
    const ctx = {
      getCredentials: async () => ({ baseUrl: 'https://api.test.local' }),
      helpers: { httpRequestWithAuthentication },
    } as unknown as ILoadOptionsFunctions;

    await new Privent().methods.listSearch.searchModels.call(ctx, '');

    expect(httpRequestWithAuthentication).toHaveBeenCalledTimes(1);
    const opts = httpRequestWithAuthentication.mock.calls[0]![1];
    expect(headerOf(opts.headers)).toBe(VALUE);
  });

  it('is on both credentials’ declarative test request', () => {
    expect(headerOf(new PriventApi().test.request.headers as Record<string, unknown>)).toBe(VALUE);
    expect(
      headerOf(new PriventVisitorApi().test.request.headers as Record<string, unknown>),
    ).toBe(VALUE);
  });
});

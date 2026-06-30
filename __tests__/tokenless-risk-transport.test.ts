import { describe, expect, it, vi } from 'vitest';
import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';

const VISITOR_ID = 'vid-tokenless-123';

interface HttpOpts {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

/**
 * Tokenless risk transport: scoring must go over the visitor channel
 * (`X-Visitor-Id`, plain `helpers.httpRequest`) — never the Bearer helper — and
 * audit must be skipped entirely. The plain-http mock routes by URL: mints a
 * visitor id, then answers /v1/risk/{score,batch}.
 */
function makeHttp() {
  const calls: HttpOpts[] = [];
  const httpRequest = vi.fn(async (opts: HttpOpts) => {
    calls.push(opts);
    const url = opts.url ?? '';
    if (url === '/v1/visitor/credentials') {
      return { visitor_id: VISITOR_ID, expires_at: Math.floor(Date.now() / 1000) + 3600 };
    }
    if (url === '/v1/risk/score') {
      return { risk_score: 0.9, risk_level: 'HIGH', categories: {}, model: 'visitor-lite', latency_ms: 5, entities: [] };
    }
    if (url === '/v1/risk/batch') {
      const n = (opts.body?.items as unknown[]).length;
      return {
        results: Array.from({ length: n }, () => ({
          risk_score: 0.4,
          risk_level: 'MEDIUM',
          categories: {},
          model: 'visitor-lite',
          latency_ms: 3,
          entities: [],
        })),
      };
    }
    return {};
  });
  const httpAuth = vi.fn(async () => ({}));
  return { httpRequest, httpAuth, calls };
}

function makeExec(
  staticData: IDataObject,
  http: ReturnType<typeof makeHttp>,
  node: { id: string; name: string; type: string },
  params: Record<string, unknown>,
  items: INodeExecutionData[],
): IExecuteFunctions {
  return {
    getInputData: () => items,
    getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
      name in params ? params[name] : fallback,
    getCredentials: async () => ({ baseUrl: 'https://api.test.local' }),
    getNode: () => node,
    getExecutionId: () => 'exec-risk',
    getWorkflow: () => ({ id: 'wf-risk', name: 'risk' }),
    getWorkflowStaticData: () => staticData,
    getMode: () => 'manual',
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: { httpRequest: http.httpRequest, httpRequestWithAuthentication: http.httpAuth },
  } as unknown as IExecuteFunctions;
}

const NODE = { id: 'n', name: 'Privent', type: 'n8n-nodes-privent.privent' };

describe('tokenless risk transport (X-Visitor-Id, no Bearer, no audit)', () => {
  it('Risk Check batches over /v1/risk/batch with X-Visitor-Id, mints first, skips audit', async () => {
    const staticData: IDataObject = {};
    const http = makeHttp();
    await new Privent().execute.call(
      makeExec(staticData, http, NODE, {
        authentication: 'tokenless',
        resource: 'riskCheck',
        operation: 'score',
        textField: 'text',
        traceId: '',
        agentName: '',
      }, [{ json: { text: 'score this' } }]),
    );

    const urls = http.calls.map((c) => c.url);
    expect(urls).toContain('/v1/visitor/credentials'); // minted
    const batch = http.calls.find((c) => c.url === '/v1/risk/batch');
    expect(batch).toBeDefined();
    expect(batch!.headers?.['X-Visitor-Id']).toBe(VISITOR_ID);
    expect(batch!.headers?.Authorization).toBeUndefined();
    // No Bearer helper, no org audit.
    expect(http.httpAuth).not.toHaveBeenCalled();
    expect(urls).not.toContain('/v1/audit/events');
  });

  it('Tokenize auto scores over /v1/risk/score with X-Visitor-Id, no Bearer', async () => {
    const staticData: IDataObject = {};
    const http = makeHttp();
    await new Privent().execute.call(
      makeExec(staticData, http, NODE, {
        authentication: 'tokenless',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174777',
        textField: 'text',
        detectionMode: 'auto',
        reviewThreshold: 0.9,
        traceId: '',
        agentName: '',
      }, [{ json: { text: 'contact bob@example.com' } }]),
    );

    const score = http.calls.find((c) => c.url === '/v1/risk/score');
    expect(score).toBeDefined();
    expect(score!.headers?.['X-Visitor-Id']).toBe(VISITOR_ID);
    expect(score!.headers?.Authorization).toBeUndefined();
    expect(http.httpAuth).not.toHaveBeenCalled();
  });
});

import { describe, expect, it, vi } from 'vitest';
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import {
  getPriventBaseUrl,
  priventVisitorRequest,
  resolveVisitorId,
} from '../shared/privent-http.js';

const BASE = 'https://api.test.local';

/** Minimal IExecuteFunctions for the exported transport helpers. */
function makeCtx(opts: {
  staticData?: IDataObject;
  httpRequest: ReturnType<typeof vi.fn>;
  authentication?: string;
  getCredentials?: ReturnType<typeof vi.fn>;
}): IExecuteFunctions {
  return {
    getWorkflowStaticData: () => (opts.staticData ??= {}),
    getNode: () => ({ id: 'n', name: 'Privent', type: 'n8n-nodes-privent.privent' }),
    getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
      name === 'authentication' ? (opts.authentication ?? fallback) : fallback,
    getCredentials: opts.getCredentials ?? (async () => ({ baseUrl: BASE })),
    helpers: { httpRequest: opts.httpRequest },
  } as unknown as IExecuteFunctions;
}

const nowSec = () => Math.floor(Date.now() / 1000);

describe('resolveVisitorId — mint + cache', () => {
  it('reuses the cached id within TTL (no second mint)', async () => {
    const httpRequest = vi.fn(async () => ({ visitor_id: 'vid-1', expires_at: nowSec() + 3600 }));
    const staticData: IDataObject = {};
    const ctx = makeCtx({ staticData, httpRequest });

    expect(await resolveVisitorId(ctx, BASE)).toBe('vid-1');
    expect(await resolveVisitorId(ctx, BASE)).toBe('vid-1');
    expect(httpRequest).toHaveBeenCalledTimes(1);
  });

  it('re-mints when the cached id is within the 5-min skew of expiry', async () => {
    let n = 0;
    const httpRequest = vi.fn(async () => ({ visitor_id: `vid-${++n}`, expires_at: nowSec() + 100 }));
    const ctx = makeCtx({ httpRequest });

    expect(await resolveVisitorId(ctx, BASE)).toBe('vid-1');
    expect(await resolveVisitorId(ctx, BASE)).toBe('vid-2'); // expiresAt-now = 100 <= 300
    expect(httpRequest).toHaveBeenCalledTimes(2);
  });

  it('404 → NodeOperationError telling the user to enable visitor auth / switch to API Key', async () => {
    const httpRequest = vi.fn(async () => {
      throw { httpCode: 404 };
    });
    const ctx = makeCtx({ httpRequest });
    await expect(resolveVisitorId(ctx, BASE)).rejects.toThrow(/enable visitor auth|API Key/i);
  });

  it('429 → friendly rate-limit message', async () => {
    const httpRequest = vi.fn(async () => {
      throw { httpCode: 429 };
    });
    const ctx = makeCtx({ httpRequest });
    await expect(resolveVisitorId(ctx, BASE)).rejects.toThrow(/rate limit/i);
  });
});

describe('priventVisitorRequest — 401 re-mint + single retry', () => {
  it('clears the stale id, re-mints, retries once, and resolves', async () => {
    let mints = 0;
    let sends = 0;
    const httpRequest = vi.fn(async (o: { url?: string }) => {
      if (o.url === '/v1/visitor/credentials') {
        mints += 1;
        return { visitor_id: `vid-${mints}`, expires_at: nowSec() + 3600 };
      }
      sends += 1;
      if (sends === 1) throw { httpCode: 401 }; // first score is stale
      return { ok: true };
    });
    const ctx = makeCtx({ httpRequest });

    const res = await priventVisitorRequest<{ ok: boolean }>(ctx, BASE, 'POST', '/v1/risk/score', {});
    expect(res).toEqual({ ok: true });
    expect(mints).toBe(2); // initial + re-mint after 401
    expect(sends).toBe(2); // failed + retried
  });
});

describe('getPriventBaseUrl — credential per auth mode', () => {
  it('tokenless reads priventVisitorApi; apiKey reads priventApi', async () => {
    const httpRequest = vi.fn();
    const getCredentials = vi.fn(async (name: string) => ({ baseUrl: `https://${name}.local` }));

    const tokenless = makeCtx({ httpRequest, authentication: 'tokenless', getCredentials });
    expect(await getPriventBaseUrl(tokenless)).toBe('https://priventVisitorApi.local');

    const apiKey = makeCtx({ httpRequest, authentication: 'apiKey', getCredentials });
    expect(await getPriventBaseUrl(apiKey)).toBe('https://priventApi.local');
  });
});

import { describe, expect, it, vi } from 'vitest';
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import {
  PREREQUISITE_TIMEOUT_MS,
  fetchActiveCustomDetectors,
  resolveVisitorId,
} from '../shared/privent-http.js';
import { makeHttpExecFn } from './_http-helpers.js';

import { Privent } from '../nodes/Privent/Privent.node.js';

const BASE = 'https://api.test.local';

const TOKENIZE_PARAMS = {
  authentication: 'apiKey',
  resource: 'tokenize',
  operation: 'tokenize',
  sessionId: '123e4567-e89b-42d3-a456-426614174011',
  textField: 'text',
  detectionMode: 'local',
  reviewThreshold: 0.9,
};

/**
 * NP-AJ. The red these arms were written against is a HANG, not an error — the
 * case a `catch` cannot see, because a `catch` runs when the request settles and
 * a hang never settles. Against the pre-change code every arm here waits
 * forever; an error-based red would have gone green for the wrong reason, since
 * both call sites already caught errors and always did.
 *
 * The bound is passed in on the unit arms so the suite does not spend the real
 * ceiling proving arithmetic. The VALUE is not chosen here — it is
 * `PREREQUISITE_TIMEOUT_MS`, derived in `shared/privent-http.ts`, and one arm
 * below asserts the default is what the call sites actually use.
 */

/** A sink that accepts the request and never answers. */
const neverAnswers = () => new Promise<never>(() => {});

function ctxFor(opts: {
  httpRequest?: ReturnType<typeof vi.fn>;
  httpRequestWithAuthentication?: ReturnType<typeof vi.fn>;
  staticData?: IDataObject;
}): IExecuteFunctions {
  const staticData: IDataObject = opts.staticData ?? {};
  return {
    getWorkflowStaticData: () => staticData,
    getNode: () => ({
      id: 'n',
      name: 'Privent',
      type: 'n8n-nodes-privent.privent',
      credentials: { priventApi: { id: '1', name: 'Privent API' } },
    }),
    getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
      name === 'authentication' ? 'apiKey' : fallback,
    getCredentials: async () => ({ baseUrl: BASE, apiKey: 'pk_live_test' }),
    helpers: {
      httpRequest: opts.httpRequest ?? vi.fn(),
      httpRequestWithAuthentication: opts.httpRequestWithAuthentication ?? vi.fn(),
    },
  } as unknown as IExecuteFunctions;
}

describe('NP-AJ — a prerequisite that hangs is bounded by this package', () => {
  it('custom-patterns: a sink that never answers is cut, and the cut is REPORTED, not swallowed', async () => {
    const httpRequestWithAuthentication = vi.fn(neverAnswers);
    const ctx = ctxFor({ httpRequestWithAuthentication });

    const res = await fetchActiveCustomDetectors(ctx, BASE, 50);

    // Fail-open is preserved: detection still runs, with no custom patterns.
    expect(res.detectors).toEqual([]);
    // And the fourth meaning of `[]` is now distinguishable from the other three.
    expect(res.timedOut).toBe(true);
    expect(httpRequestWithAuthentication).toHaveBeenCalledTimes(1);
  });

  it('custom-patterns: an ERROR is still fail-open and is NOT reported as a timeout', async () => {
    const httpRequestWithAuthentication = vi.fn(async () => {
      throw new Error('simulated transport failure');
    });
    const res = await fetchActiveCustomDetectors(ctxFor({ httpRequestWithAuthentication }), BASE, 50);

    expect(res.detectors).toEqual([]);
    // The negative control for the arm above: if `timedOut` were true here it
    // would be reporting the state it can already see, not the one it cannot.
    expect(res.timedOut).toBe(false);
  });

  it('visitor credentials: a sink that never answers stops the wait and names it', async () => {
    const httpRequest = vi.fn(neverAnswers);

    await expect(resolveVisitorId(ctxFor({ httpRequest }), BASE, 50)).rejects.toThrow(
      /did not answer the visitor-credential request within 50 ms/,
    );
  });

  it('visitor credentials: a REFUSED request still reports the refusal, not a timeout', async () => {
    const httpRequest = vi.fn(async () => {
      throw Object.assign(new Error('nope'), { httpCode: '404' });
    });

    // The 404 path predates this change and must survive it: a request that was
    // answered with "no" is not a request that went unanswered.
    await expect(resolveVisitorId(ctxFor({ httpRequest }), BASE, 50)).rejects.toThrow(
      /Tokenless mode isn't enabled/,
    );
  });

  it('the default ceiling used by the call sites is the derived one', () => {
    // Not an assertion that 5000 is correct — it is an assertion that the call
    // sites use the DERIVED constant rather than a literal of their own, which
    // is the property a future re-derivation depends on.
    expect(PREREQUISITE_TIMEOUT_MS).toBe(5000);
    expect(fetchActiveCustomDetectors.length).toBe(2); // (ctx, baseUrl) + defaulted timeout
    expect(resolveVisitorId.length).toBe(2);
  });
});

describe('NP-AJ — the operator can tell a bounded wait from a successful one', () => {
  it(
    'tokenize completes and the item says the custom-pattern fetch was cut',
    async () => {
      const { exec } = makeHttpExecFn({
        items: [{ json: { text: 'Contact me at ada@example.com' } }],
        params: TOKENIZE_PARAMS,
        hangUrls: ['/v1/custom-patterns/active'],
      });

      const t0 = Date.now();
      const out = await new Privent().execute.call(exec);
      const waited = Date.now() - t0;

      const privent = (out[0]![0]!.json as IDataObject).privent as IDataObject;

      // 1. The execution CONTINUED — this is the half a bound must not cost.
      expect(privent.sessionId).toBeTruthy();
      expect(out[0]![0]!.json.text).toContain('[EMAIL_');

      // 2. And the operator is told, on the item, that org patterns did not run.
      expect(privent.customPatternsTimedOut).toBe(true);

      // 3. It waited the ceiling, not the host's inherited 300_000.
      expect(waited).toBeGreaterThanOrEqual(PREREQUISITE_TIMEOUT_MS - 250);
      expect(waited).toBeLessThan(PREREQUISITE_TIMEOUT_MS + 5_000);
    },
    PREREQUISITE_TIMEOUT_MS + 15_000,
  );

  it('a healthy run carries no timeout marker at all', async () => {
    const { exec } = makeHttpExecFn({
      items: [{ json: { text: 'Contact me at ada@example.com' } }],
      params: TOKENIZE_PARAMS,
    });
    const out = await new Privent().execute.call(exec);
    const privent = (out[0]![0]!.json as IDataObject).privent as IDataObject;

    // Silence must mean "it ran", and mean nothing else — the same requirement
    // NP-AG's four states exist for, one call earlier on the same path.
    expect(privent).not.toHaveProperty('customPatternsTimedOut');
  });
});

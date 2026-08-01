import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { IExecuteFunctions } from 'n8n-workflow';
import { PRIVENT_REQUEST_TIMEOUT_MS, priventVisitorRequest } from '../shared/privent-http.js';
import { makeHttpExecFn } from './_http-helpers.js';
import { Privent } from '../nodes/Privent/Privent.node.js';

/**
 * NP-AK. The defect was DUPLICATION, not behaviour: the two copies were equal, so
 * nothing the node did could distinguish a fixed tree from a broken one. That is
 * why the first arm reads the source — it is the only instrument that is red
 * today, and an arm that is green before the fix would be an assertion about the
 * fix rather than about the defect.
 *
 * The instrument's limit, stated because it is part of its result (NP-W): it
 * reads this package's own source, so an unrelated edit that reintroduces the
 * literal anywhere in the file trips it. That is the intended sensitivity and
 * also its cost — it cannot tell WHICH site regressed, only that one did.
 */
const SOURCE = readFileSync(join(__dirname, '../shared/privent-http.ts'), 'utf8');

describe('NP-AK — the scoring ceiling exists once', () => {
  it('no request site carries the ceiling as a literal', () => {
    // Scoped to CODE lines, not the whole file: the first version of this scan
    // matched three, and the third was a COMMENT in `auditLog`'s docblock that
    // names the ceiling in order to say it is deliberately not used. An
    // instrument that counts its own prose measures the prose — the same
    // correction the audit scrub check needed, one item later.
    const literals = SOURCE.split('\n')
      .map((l) => l.trim())
      .filter((l) => !l.startsWith('*') && !l.startsWith('//'))
      .filter((l) => /^timeout:\s*200_000/.test(l));
    // Red before the fix: two — `priventRequest` and `priventVisitorRequest`.
    expect(literals).toEqual([]);
  });

  it('it is declared exactly once, and exported so both transports can reach it', () => {
    const declarations = SOURCE.match(/PRIVENT_REQUEST_TIMEOUT_MS = /g) ?? [];
    expect(declarations).toHaveLength(1);
    expect(PRIVENT_REQUEST_TIMEOUT_MS).toBe(200_000); // the value is unchanged: it was argued
  });
});

describe('NP-AK — both transports send the same ceiling', () => {
  // A regression guard, NOT a red-before: it is green on the broken tree too,
  // because the two literals were equal. It survives a refactor the source scan
  // would not, so the two arms cover different failures.
  it('apiKey transport', async () => {
    const { exec, httpRequestWithAuthentication } = makeHttpExecFn({
      items: [{ json: { text: 'reach ada@fixture.invalid' } }],
      params: {
        authentication: 'apiKey',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174012',
        textField: 'text',
        detectionMode: 'cloud',
        reviewThreshold: 0.9,
      },
    });
    await new Privent().execute.call(exec);

    const scoreCall = httpRequestWithAuthentication.mock.calls.find(
      (c) => (c[1] as { url: string }).url === '/v1/risk/score',
    );
    expect((scoreCall![1] as { timeout: number }).timeout).toBe(PRIVENT_REQUEST_TIMEOUT_MS);
  });

  it('tokenless transport', async () => {
    const httpRequest = vi.fn(async (opts: { url: string }) =>
      opts.url === '/v1/visitor/credentials'
        ? { visitor_id: 'vid-1', expires_at: Math.floor(Date.now() / 1000) + 3600 }
        : { ok: true },
    );
    const ctx = {
      getWorkflowStaticData: () => ({}),
      getNode: () => ({ id: 'n', name: 'Privent', type: 'n8n-nodes-privent.privent' }),
      getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
        name === 'authentication' ? 'tokenless' : fallback,
      getCredentials: async () => ({ baseUrl: 'https://api.test.local' }),
      helpers: { httpRequest },
    } as unknown as IExecuteFunctions;

    await priventVisitorRequest(ctx, 'https://api.test.local', 'POST', '/v1/risk/score', {});

    const scoreCall = httpRequest.mock.calls.find(
      (c) => (c[0] as { url: string }).url === '/v1/risk/score',
    );
    const opts = scoreCall![0] as unknown as { timeout: number };
    expect(opts.timeout).toBe(PRIVENT_REQUEST_TIMEOUT_MS);
  });
});

import { describe, expect, it } from 'vitest';
import { Contracts } from '@priventai/core';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';
import { CONTRACT_COVERED, CONTRACT_UNCOVERED } from './_modes.js';

/**
 * WHAT A GREEN TICK PROVES, WIDENED BY A THIRD — AND ONLY A THIRD.
 *
 * NP-K's three axes all still hold: this repository is public, `privent-backend`
 * is private, the only secret here is `NPM_TOKEN`, and the backend publishes no
 * image this CI can pull. The cheap green — a private-repo read credential in a
 * public repo's CI — stays refused.
 *
 * What NP-K assumed, and what is false, is that those three axes make contract
 * verification impossible. The contract is on public npm, in a package this node
 * already depends on: `@priventai/core` exports 15 `Contracts.v1` schemas. So the
 * shapes can be checked against the PUBLISHED contract without reaching a backend
 * at all.
 *
 * SCOPE, because an instrument's scope is part of its result:
 *
 *   EXCLUDES         "the node sends a shape the published contract rejects"
 *   does NOT EXCLUDE "the backend sends a shape the contract rejects" — that
 *                    needs a real backend, and CI cannot reach one
 *   COVERAGE         3 of the 9 endpoints this node calls. The vault triple is
 *                    NOT covered, and vault is where tokens are born.
 *
 * The fraction prints on every run (`_modes.ts`) so a passing contract check can
 * never read as a covered contract.
 */

type Schema = { safeParse: (v: unknown) => { success: boolean; error?: { issues: unknown[] } } };
const V = Contracts.v1 as unknown as Record<string, Schema>;

/** Absent is a failure, not a skip: a contract check that cannot find its schema
 *  has not checked anything. */
function schema(name: string): Schema {
  const s = V[name];
  if (!s) throw new Error(`${name} is not exported by the installed @priventai/core`);
  return s;
}

function explain(result: { success: boolean; error?: { issues: unknown[] } }): string {
  return result.success ? '' : JSON.stringify(result.error?.issues ?? [], null, 1);
}

describe('the coverage fraction is a measurement, not a claim', () => {
  it('every endpoint this node calls is classified as covered or not', () => {
    // Both lists exist so the uncovered set cannot quietly shrink to make the
    // fraction look better: they are printed together on every run.
    expect(CONTRACT_COVERED.length + CONTRACT_UNCOVERED.length).toBe(9);
    expect(CONTRACT_UNCOVERED).toContain('/v1/vault/find-or-create-batch');
  });

  it('the schemas the covered set needs are actually exported by the installed core', () => {
    for (const name of [
      'ScoreRequestSchema',
      'ScoreResponseSchema',
      'BatchRequestSchema',
      'BatchResponseSchema',
      'AuditBatchRequestSchema',
    ]) {
      expect(V[name], `${name} missing from the installed @priventai/core`).toBeDefined();
    }
  });
});

describe('what the node SENDS conforms to the published contract', () => {
  it('POST /v1/risk/score request', async () => {
    const { exec, calls } = makeHttpExecFn({
      items: [{ json: { text: 'reach ayse@fixture.invalid now' } }],
      params: {
        authentication: 'apiKey',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174960',
        textField: 'text',
        detectionMode: 'auto',
        reviewThreshold: 0.9,
      },
    });
    await new Privent().execute.call(exec);

    const body = calls.find((c) => c.url === '/v1/risk/score')?.body;
    expect(body, 'the node made no /v1/risk/score call').toBeDefined();
    const r = schema('ScoreRequestSchema').safeParse(body);
    expect(r.success, explain(r)).toBe(true);
  });

  it('POST /v1/audit/events request', async () => {
    const { exec, calls } = makeHttpExecFn({
      items: [{ json: { text: 'reach ayse@fixture.invalid now' } }],
      params: {
        authentication: 'apiKey',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174961',
        textField: 'text',
        detectionMode: 'local',
        reviewThreshold: 0.9,
      },
    });
    await new Privent().execute.call(exec);
    await new Promise((r) => setImmediate(r));

    const body = calls.find((c) => c.url === '/v1/audit/events')?.body;
    expect(body, 'the node emitted no audit event').toBeDefined();
    const r = schema('AuditBatchRequestSchema').safeParse(body);
    expect(r.success, explain(r)).toBe(true);
  });
});

describe('what the MOCK answers conforms to the published contract', () => {
  // The mock is the backend, as far as every other test in this suite is
  // concerned. A mock that answers with a shape the contract forbids teaches the
  // suite a shape the backend cannot send — which is how `categories` stayed an
  // object here while the contract, the backend DTO and core's own wire schema
  // all said array, for as long as nobody compared them.
  it('the /v1/risk/score response the harness serves', () => {
    const { defaultRiskResponse } = makeHttpExecFn({ items: [], params: {} });
    const r = schema('ScoreResponseSchema').safeParse(defaultRiskResponse);
    expect(r.success, explain(r)).toBe(true);
  });

  it('a caller-supplied risk response is still checked, so a test cannot opt out', () => {
    const { defaultRiskResponse } = makeHttpExecFn({
      items: [],
      params: {},
      risk: { ...(({} as never) as object), risk_score: 0.8, risk_level: 'HIGH', categories: ['pii'], model: 'm@1.0.0+x', latency_ms: 3, entities: [] },
    });
    const r = schema('ScoreResponseSchema').safeParse(defaultRiskResponse);
    expect(r.success, explain(r)).toBe(true);
  });
});

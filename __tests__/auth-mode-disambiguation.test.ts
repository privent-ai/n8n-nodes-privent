import { describe, expect, it } from 'vitest';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

/**
 * WHAT DOES A STORED NODE WITH NO `authentication` MEAN?
 *
 * Three cohorts wrote the same bytes to disk, and none of them wrote the key:
 *
 *   1. added before 2.1.0  — the parameter did not exist yet          → meant apiKey
 *   2. added 2.1.0–2.2.0   — left on the then-default 'apiKey'        → meant apiKey
 *   3. added 2.2.1–2.4.0   — left on the current default 'local'      → meant local
 *
 * n8n does not persist a parameter whose value equals its default (measured in
 * n8nio/n8n:2.28.7 — picking 'local' saves nothing, picking 'apiKey' saves
 * "apiKey"), and `version` was never bumped when the default flipped in 2.2.1,
 * so `typeVersion` is 1 for all three. typeVersion CANNOT tell them apart.
 *
 * At runtime the stored value is what counts: n8n's `_getNodeParameter` reads
 * `get(node.parameters, name, fallbackValue)` directly (n8n-core 2.28.4,
 * `node-execution-context.js:271`) and nothing in the execution engine fills
 * description defaults first. So the absent key falls through to THIS package's
 * fallback — which was `'apiKey'`. Cohort 3, every evaluator without a Privent
 * account, therefore ran in apiKey mode and hit "Node does not have any
 * credentials set" on the first execution.
 *
 * The disambiguator is credential PRESENCE, read from `getNode().credentials` —
 * never from `getCredentials()`, which throws "Credentials not found" when
 * displayOptions hides the credential, so a try/catch would return the wrong
 * answer confidently.
 */

const SESSION_ID = '123e4567-e89b-42d3-a456-426614174666';
const ATTACHED = { priventApi: { id: 'cred-1', name: 'Privent account' } };

/** Params a stored node actually holds — note: no `authentication` key. */
const STORED_WITHOUT_AUTH = {
  resource: 'tokenize',
  operation: 'tokenize',
  sessionId: SESSION_ID,
  textField: 'text',
  detectionMode: 'local',
  detectionLevel: 'standard',
  reviewThreshold: 0.9,
};

function exec(params: Record<string, unknown>, credentials?: typeof ATTACHED) {
  return makeHttpExecFn({
    items: [{ json: { text: 'reach ayse@fixture.invalid now' } }],
    params,
    node: { id: 'n1', name: 'Privent', type: 'n8n-nodes-privent.privent' },
    ...(credentials ? { } : { noCredentials: true }),
  });
}

describe('authentication absent from stored parameters', () => {
  it('credential ATTACHED → apiKey: cohorts 1 and 2 keep the behaviour they had', async () => {
    const { exec: ctx, calls } = exec(STORED_WITHOUT_AUTH, ATTACHED);
    await new Privent().execute.call(ctx);
    // apiKey mode is the one that talks to the vault over HTTP.
    expect(calls.some((c) => c.url === '/v1/vault/find-or-create-batch')).toBe(true);
  });

  it('NO credential → local: cohort 3 stops demanding a key it never had', async () => {
    const { exec: ctx, calls } = exec(STORED_WITHOUT_AUTH);
    const out = await new Privent().execute.call(ctx);
    expect(calls).toHaveLength(0); // local mode touches nothing
    expect((out[0]![0]!.json as { privent: { sessionId: string } }).privent.sessionId).toBe(
      SESSION_ID,
    );
  });

  it('inferred local is LOUD — the item says the mode was never set explicitly', async () => {
    const { exec: ctx } = exec(STORED_WITHOUT_AUTH);
    const out = await new Privent().execute.call(ctx);
    const warning = String(
      (out[0]![0]!.json as { privent: { authWarning?: unknown } }).privent.authWarning,
    );
    expect(warning).toContain('never set explicitly');
    expect(warning).toContain('regex-only');
  });

  it('an EXPLICIT choice is never second-guessed, in either direction', async () => {
    const { exec: withCred, calls: c1 } = exec(
      { ...STORED_WITHOUT_AUTH, authentication: 'local' },
      ATTACHED,
    );
    const out = await new Privent().execute.call(withCred);
    expect(c1).toHaveLength(0); // explicit local wins over an attached credential
    expect(
      (out[0]![0]!.json as { privent: { authWarning?: unknown } }).privent.authWarning,
    ).toBeUndefined(); // nothing was inferred, so there is nothing to warn about

    const { exec: noCred, calls: c2 } = exec({ ...STORED_WITHOUT_AUTH, authentication: 'apiKey' });
    await new Privent().execute.call(noCred);
    expect(c2.some((c) => c.url === '/v1/vault/find-or-create-batch')).toBe(true);
  });
});

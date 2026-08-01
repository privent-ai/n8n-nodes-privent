import { describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { IExecuteFunctions } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';

/**
 * THE SERVER IS SILENT TO ITS OPERATOR AND THE CLIENT IS DEAF TO THE SERVER.
 *
 * `POST /v1/audit/events` answers with `{ accepted, rejected, errors[] }`
 * (`privent-backend origin/dev 3187d28`, `audit-ingest.service.ts:33-37`), and
 * four rejection sites fill `errors[].reason` — `:70` and `:94`
 * `VALIDATION_FAILED:…`, `:78` `INVALID_TIMESTAMP`, `:116`
 * `SESSION_ORG_MISMATCH`. None of them logs, so the server tells its own operator
 * nothing. This node then discarded the response and swallowed the throw, so it
 * told its operator nothing either — while the body had carried the counts and
 * the reason the whole time.
 *
 * WHAT THE FIX MUST PRESERVE. Fire-and-forget is correct for the DATA PATH: an
 * audit failure must not break tokenization. What was wrong is that
 * fire-and-forget was implemented as **discard-and-forget**. Surfacing a
 * rejection does not require failing the node — keep the guarantee, lose the
 * deafness.
 *
 * THREE STATES, and two of them collapsing is the finding rather than a detail:
 *
 *   nothing sent       non-apiKey mode; `auditLog` returns before any request
 *   sent and accepted  `rejected === 0` — silence is correct here and only here
 *   sent and rejected   `rejected > 0` — surfaced, with `reason` verbatim
 *
 * `reason` is passed through UNTOUCHED. The server already truncates it at 400
 * characters with no marker and no count of what was dropped (N8N-U,
 * `audit-ingest.service.ts:768`); a second truncation on top of an unmarked one
 * would make the operator's copy wrong in a way neither side reports. It is a
 * string with structure, not an enum, so nothing here matches on its content —
 * `rejected` and `errors` are asserted by name.
 *
 * THE FIXTURE IS A RECORDED REAL RESPONSE, not a mock. privent-n8n captured it
 * against an isolated stack — `privent-backend:cloud`, fresh postgres, org and
 * AGENT_SDK key minted through the product's own path on a disposable database,
 * torn down after. A body this repository wrote would only prove that the mock
 * agrees with the assertion; a recorded one comes from outside and cannot be made
 * to say what this repository wants (METHOD §9).
 *
 * Absence of the fixture FAILS. It does not skip: "could not check" is not
 * "checked", and a silently skipped contract test is the defect this file exists
 * to remove, wearing green.
 */

const FIXTURE = join(__dirname, 'fixtures/audit-ingest-rejected.json');

type IngestResponse = {
  accepted: number;
  rejected: number;
  errors: Array<{ event_id: string; reason: string }>;
};

function recordedRejection(): IngestResponse {
  if (!existsSync(FIXTURE)) {
    throw new Error(
      `The recorded rejection fixture is missing: ${FIXTURE}\n` +
        'It is a real response body captured by privent-n8n against an isolated ' +
        'backend, committed with its capture conditions. This test does not ' +
        'synthesise one — a body written here would prove only that the mock ' +
        'agrees with the assertion.',
    );
  }
  return JSON.parse(readFileSync(FIXTURE, 'utf8')) as IngestResponse;
}

function ctx(auditAnswer: unknown, authentication = 'apiKey') {
  const calls: Array<{ url: string }> = [];
  const exec = {
    getInputData: () => [{ json: { text: 'reach ayse@fixture.invalid now' } }],
    getNodeParameter: (n: string, _i: number, fb?: unknown) =>
      ({
        authentication,
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174222',
        textField: 'text',
        detectionMode: 'local',
        detectionLevel: 'standard',
        reviewThreshold: 0.9,
      })[n] ?? fb,
    getCredentials: async () => ({
      apiKey: 'pv_live_x',
      baseUrl: 'https://api.test.local',
      vaultBackend: 'memory',
    }),
    getNode: () => ({
      id: 'n1',
      name: 'Privent',
      type: 'n8n-nodes-privent.privent',
      credentials: { priventApi: { id: 'c1', name: 'Privent account' } },
    }),
    getExecutionId: () => 'exec-1',
    getWorkflow: () => ({ id: 'wf-1', name: 'wf' }),
    getMode: () => 'manual',
    getWorkflowStaticData: () => ({}),
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: {
      httpRequestWithAuthentication: vi.fn(async (_c: string, o: { url: string; body?: unknown }) => {
        calls.push({ url: o.url });
        if (o.url === '/v1/audit/events') return auditAnswer;
        if (o.url === '/v1/vault/find-or-create-batch') {
          const items =
            ((o.body as Record<string, unknown>).items as Array<{
              kind: string;
              normalizedValue: string;
            }>) ?? [];
          return {
            tokens: items.map((it, i) => ({
              kind: it.kind,
              value: it.normalizedValue,
              token: `[${it.kind}_00${i + 1}]`,
            })),
          };
        }
        return {};
      }),
      httpRequest: vi.fn(async () => ({})),
    },
  } as unknown as IExecuteFunctions;
  return { exec, calls };
}

async function run(auditAnswer: unknown, authentication = 'apiKey') {
  const { exec, calls } = ctx(auditAnswer, authentication);
  const out = await new Privent().execute.call(exec);
  await new Promise((r) => setImmediate(r));
  const privent = (out[0]![0]!.json as { privent: Record<string, unknown> }).privent;
  return { privent, calls };
}

describe('the recorded rejection is a real captured body', () => {
  it('has the shape the backend declares, by field name', () => {
    const body = recordedRejection();
    expect(typeof body.accepted).toBe('number');
    expect(typeof body.rejected).toBe('number');
    expect(Array.isArray(body.errors)).toBe(true);
    expect(body.rejected).toBeGreaterThan(0);
    expect(typeof body.errors[0]?.reason).toBe('string');
  });

  it('carries no value, only names and counts', () => {
    // The fixture is committed in a PUBLIC repository. This asserts the scrub
    // rather than trusting it.
    const raw = readFileSync(FIXTURE, 'utf8');
    for (const forbidden of ['pv_live_', 'visitor_id', 'install_id', 'organizationId', 'org_id']) {
      expect(raw, `fixture must not carry ${forbidden}`).not.toContain(forbidden);
    }
  });
});

describe('sent and rejected — the state that was invisible', () => {
  it('surfaces the rejection on the item', async () => {
    const { privent } = await run(recordedRejection());
    expect(privent.auditRejected).toBe(true);
  });

  it('carries the reason through verbatim, neither interpreted nor truncated', async () => {
    const body = recordedRejection();
    const { privent } = await run(body);
    expect(privent.auditRejectedReason).toBe(body.errors[0]!.reason);
  });

  it('does not break the data path — the guarantee the old comment got right', async () => {
    const { privent } = await run(recordedRejection());
    expect(privent.sessionId).toBe('123e4567-e89b-42d3-a456-426614174222');
    expect(Array.isArray(privent.entities)).toBe(true);
  });
});

describe('the fourth state — sent, outcome not known at item construction', () => {
  // A bounded await is only honest if the deadline expiring has a name. Without
  // it, a slow ingest folds into "accepted", which is the exact collapse this
  // item was opened to prevent — and it is the arm that would rot silently,
  // because nothing else in the suite would notice it disappearing.
  //
  // The deadline VALUE is not chosen here. It is passed in, because it must be
  // derived from a measurement of what the audit POST actually costs against a
  // reachable backend, and no such measurement exists yet — privent-n8n's
  // ingest probe captured bodies but no timing.
  it('a sink that never answers within the deadline is reported as unknown, not accepted', async () => {
    const { exec } = ctx(new Promise(() => {}) /* never resolves */);
    const out = await new Privent().execute.call(exec);
    await new Promise((r) => setImmediate(r));
    const privent = (out[0]![0]!.json as { privent: Record<string, unknown> }).privent;

    expect(privent.auditAttempted).toBe(true);
    expect(privent.auditOutcomeKnown).toBe(false);
    // The failure this arm exists to catch: a stalled POST reported as success.
    expect(privent.auditRejected).toBeUndefined();
  });

  it('the data path is not stalled by a sink that never answers', async () => {
    const started = Date.now();
    const { exec } = ctx(new Promise(() => {}));
    const out = await new Privent().execute.call(exec);
    const elapsed = Date.now() - started;
    const privent = (out[0]![0]!.json as { privent: Record<string, unknown> }).privent;

    expect(privent.sessionId).toBe('123e4567-e89b-42d3-a456-426614174222');
    // Bounded: the item is produced without waiting for a sink that never
    // answers. The bound itself is asserted loosely here because its value is
    // derived elsewhere; what this pins is that a bound exists at all.
    expect(elapsed).toBeLessThan(30_000);
  });
});

describe('the other two states stay distinguishable', () => {
  it('sent and accepted says nothing — silence is correct here and only here', async () => {
    const { privent, calls } = await run({ accepted: 1, rejected: 0, errors: [] });
    expect(calls.some((c) => c.url === '/v1/audit/events')).toBe(true);
    expect(privent.auditRejected).toBeUndefined();
    expect(privent.auditRejectedReason).toBeUndefined();
  });

  it('nothing sent is not the same observation as sent and accepted', async () => {
    const { privent, calls } = await run({ accepted: 1, rejected: 0, errors: [] }, 'local');
    expect(calls.some((c) => c.url === '/v1/audit/events')).toBe(false);
    // Distinguishable from the accepted case by a field of its own, not by the
    // absence of the rejection field — that absence is what both states share.
    expect(privent.auditAttempted).toBe(false);
  });

  it('apiKey mode records that an audit event was attempted', async () => {
    const { privent } = await run({ accepted: 1, rejected: 0, errors: [] });
    expect(privent.auditAttempted).toBe(true);
  });
});

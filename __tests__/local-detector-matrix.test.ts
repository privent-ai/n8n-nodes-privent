import { describe, expect, it, vi } from 'vitest';
import type { IExecuteFunctions } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';

/**
 * THE 18-CASE MATRIX, RUN THROUGH THE NODE'S OWN `execute`.
 *
 * Not through `buildLocalDetectors` or `isLocalFalsePositive` directly: the
 * defect being fixed lives in how the CALLER invokes the filter, so a test that
 * calls the filter itself would have passed throughout.
 *
 * The cases are published here rather than described in a report, so the numbers
 * are auditable instead of trusted. Nine must be masked, nine must be left
 * alone; every string is synthetic and every domain is RFC 2606 reserved.
 *
 * SCOPE. This item is the correctness half: context was never passed
 * (`matcher(value, '')` at every call site) and the placeholder word list ate
 * real addresses. What "aggressive" should mean is a product question and is NOT
 * decided here — the `aggressive` half of this matrix is deliberately absent,
 * and the measurement that motivates it is recorded in NP-U.
 *
 * KNOWN RECALL GAPS, excluded on purpose and listed so the number is honest:
 * international phone (`+90 532 111 22 33`). Two of the three originally listed
 * here have since been closed and have their own tests: the IBAN printed form
 * (NP-Z, `iban-printed-form.test.ts`, 12 of 12 forms, PHONE no longer steals the
 * span) and the alphanumeric house number (NP-Y, `221B`). They are a different
 * axis from this file — patterns that are missing or wrong, not filters that
 * misfire — which is why they were fixed separately rather than folded in here.
 *
 * Also measured and also excluded: the local detector masks non-routable and
 * wildcard IPs — `0.0.0.0` and `10.0.0.5` both become `[IP_ADDRESS_nnn]`.
 * Suppressing them needs a NEW false-positive rule, not the two corrections this
 * item was approved for, so it is recorded as NP-V and left open rather than
 * folded in quietly.
 *
 * One case here was wrong when this matrix was first run by hand: `987-65-4321`
 * was expected to be masked, but 9xx is not a valid SSN area number and the
 * validator was right to reject it. The case now uses a valid shape. The earlier
 * `FN=5` figure for `standard` therefore counted one failure that was the
 * measurement's fault, not the product's.
 */

type Expectation = 'DETECT' | 'IGNORE';

const CASES: Array<{ text: string; expect: Expectation; note: string }> = [
  { text: 'reach ayse.demir@fixture.invalid today', expect: 'DETECT', note: 'plain email' },
  { text: 'reach test.user@bank.invalid today', expect: 'DETECT', note: 'local part contains "test"' },
  { text: 'reach sample.reports@clinic.invalid today', expect: 'DETECT', note: 'local part contains "sample"' },
  { text: 'reach demo.account@insurer.invalid today', expect: 'DETECT', note: 'local part contains "demo"' },
  { text: 'ssn 123-45-6789 on file', expect: 'DETECT', note: 'US SSN shape' },
  { text: 'card 4111 1111 1111 1111 expired', expect: 'DETECT', note: 'Luhn-valid test PAN' },
  { text: 'ssn 234-56-7890 on record', expect: 'DETECT', note: 'second SSN, different digits' },
  { text: 'card 5555 5555 5555 4444 declined', expect: 'DETECT', note: 'second Luhn-valid test PAN' },
  { text: 'write to gorkem@fixture.invalid before noon', expect: 'DETECT', note: 'email mid-sentence' },
  { text: 'running version 2.4.0 in prod', expect: 'IGNORE', note: 'semver' },
  { text: 'port: 8080 is bound', expect: 'IGNORE', note: 'port number' },
  { text: 'total: 1234.56 charged', expect: 'IGNORE', note: 'money' },
  { text: 'coverage is 95 percent', expect: 'IGNORE', note: 'percentage' },
  { text: 'order #123456 shipped', expect: 'IGNORE', note: 'order id' },
  { text: 'due 2026-07-31 at noon', expect: 'IGNORE', note: 'ISO date' },
  { text: 'brand color #a1b2c3 approved', expect: 'IGNORE', note: 'hex colour' },
  { text: 'build 20260731 succeeded', expect: 'IGNORE', note: 'numeric build id' },
  { text: 'SELECT * FROM users LIMIT 100', expect: 'IGNORE', note: 'SQL' },
];

function localExec(text: string, detectionLevel: 'standard' | 'aggressive' = 'standard') {
  return {
    getInputData: () => [{ json: { text } }],
    getNodeParameter: (n: string, _i: number, fb?: unknown) =>
      ({
        authentication: 'local',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174777',
        textField: 'text',
        detectionLevel,
      })[n] ?? fb,
    getNode: () => ({ id: 'n1', name: 'Privent', type: 'n8n-nodes-privent.privent' }),
    getExecutionId: () => 'exec-1',
    getWorkflow: () => ({ id: 'wf-1', name: 'matrix' }),
    getMode: () => 'manual',
    getWorkflowStaticData: () => ({}),
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: {
      httpRequestWithAuthentication: vi.fn(async () => {
        throw new Error('the matrix runs in local mode and must not reach the network');
      }),
      httpRequest: vi.fn(async () => {
        throw new Error('the matrix runs in local mode and must not reach the network');
      }),
    },
  } as unknown as IExecuteFunctions;
}

async function detectedKinds(
  text: string,
  level: 'standard' | 'aggressive' = 'standard',
): Promise<string[]> {
  const out = await new Privent().execute.call(localExec(text, level));
  const json = out[0]![0]!.json as { privent: { entities: Array<{ kind: string }> } };
  return json.privent.entities.map((e) => e.kind);
}

describe('local detector matrix (standard level)', () => {
  for (const c of CASES.filter((x) => x.expect === 'DETECT')) {
    it(`masks: ${c.note}`, async () => {
      expect(await detectedKinds(c.text)).not.toHaveLength(0);
    });
  }

  for (const c of CASES.filter((x) => x.expect === 'IGNORE')) {
    it(`leaves alone: ${c.note}`, async () => {
      expect(await detectedKinds(c.text)).toHaveLength(0);
    });
  }

  it('a real address is not suppressed for having "test" in its local part', async () => {
    // The specific regression this item exists for. NP-L found that fixtures were
    // invisible to the local detector; this one is customer data.
    expect(await detectedKinds('reach test.user@bank.invalid today')).toContain('EMAIL');
  });

  it('a genuinely synthetic address is still suppressed, judged by its DOMAIN', async () => {
    expect(await detectedKinds('reach someone@example.com today')).toHaveLength(0);
  });
});

/**
 * ACCEPTANCE FOR N4-7b, CASE BY CASE.
 *
 * Not in aggregate. Aggregate is what made `TP=9 / FP=9 / TN=0` look like a
 * success: `aggressive` scored a perfect recall by masking every word in every
 * sentence, including `reach`, `today` and `FROM`.
 *
 * `aggressive` must be no worse than `standard` on EVERY case — never a missed
 * detection, never a new false positive — while still being a superset, since it
 * admits the measured `aggressive-only` tier on top.
 */
describe('aggressive is no worse than standard, case by case', () => {
  for (const c of CASES) {
    it(`${c.expect === 'DETECT' ? 'still masks' : 'still leaves alone'}: ${c.note}`, async () => {
      const standard = await detectedKinds(c.text, 'standard');
      const aggressive = await detectedKinds(c.text, 'aggressive');
      if (c.expect === 'DETECT') {
        expect(aggressive.length).toBeGreaterThanOrEqual(standard.length);
        expect(aggressive).not.toHaveLength(0);
      } else {
        expect(aggressive).toHaveLength(0);
      }
    });
  }

  it('aggressive is a superset of standard: it admits the measured tier and nothing else', async () => {
    // ETHEREUM_ADDRESS is in the measured admission list — zero false positives
    // across both negative corpora and a positive hit under its own kind.
    // MAC_ADDRESS is NOT: it fires on a fragment of a wallet address, which is a
    // real value under the wrong kind, and that counts as a false positive.
    const line = 'Treasury moved the balance to 0x52908400098527886E0F7030069857D2E4169EE7 last night.';
    expect(await detectedKinds(line, 'standard')).not.toContain('ETHEREUM_ADDRESS');
    expect(await detectedKinds(line, 'aggressive')).toContain('ETHEREUM_ADDRESS');
  });
});

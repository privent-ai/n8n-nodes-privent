import { describe, expect, it, vi } from 'vitest';
import type { IExecuteFunctions } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';

/**
 * AN IBAN WRITTEN THE WAY IT IS PRINTED.
 *
 * ISO 13616 defines a printed form — groups of four, separated — and that is how
 * an IBAN appears on an invoice and in an email. `@priventai/core`'s detector is
 * `\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b`: no separators, no `i` flag. Measured
 * through this package's own local path, it found **2 of the 12 forms below**.
 *
 * The miss was not the worst part. In 9 of the 12 forms the PHONE detector took
 * the digit run in the middle, so
 *
 *     "pay GB29 NWBK 6016 1331 9268 19 now"
 *   → "pay GB29 NWBK [PHONE_001] 19 now"
 *
 * — a wrong kind, with the country and bank codes left in cleartext. Two
 * failures in one span: a miss and a misclassification.
 *
 * This matters most where it is least visible: every surface that detects
 * LOCALLY misses the printed form, and local mode is what a customer chooses for
 * data minimisation. The backend catches it; the mode chosen by people who will
 * not send data to a backend does not.
 *
 * The grammar belongs in core (SDK-H). This package carries a local override
 * with the same kind, so the compact form deduplicates against core's match and
 * the printed forms win the span back from PHONE by being longer.
 *
 * The values are the published ISO 13616 examples. `validateIBAN` — MOD-97 plus
 * the per-country length table, already in this package — is what keeps the
 * wider regex honest: measured over 72.6 MB it produced 443 raw regex hits and
 * ZERO survivors.
 */

const NBSP = ' ';
const IBAN_FORMS: Array<[string, string]> = [
  ['compact, upper case', 'pay GB29NWBK60161331926819 now'],
  ['printed groups of four', 'pay GB29 NWBK 6016 1331 9268 19 now'],
  ['hyphenated', 'pay GB29-NWBK-6016-1331-9268-19 now'],
  ['mixed separators', 'pay GB29 NWBK-6016 1331-9268 19 now'],
  ['non-breaking spaces', `pay GB29${NBSP}NWBK${NBSP}6016${NBSP}1331${NBSP}9268${NBSP}19 now`],
  ['lower case, compact', 'pay gb29nwbk60161331926819 now'],
  ['lower case, printed', 'pay gb29 nwbk 6016 1331 9268 19 now'],
  ['mixed case, printed', 'pay Gb29 Nwbk 6016 1331 9268 19 now'],
  ['trailing sentence punctuation', 'settle to GB29 NWBK 6016 1331 9268 19.'],
  ['parenthesised', 'account (GB29NWBK60161331926819) is closed'],
  ['at the start of a sentence', 'GB29 NWBK 6016 1331 9268 19 is the account.'],
  ['non-GB country, printed', 'pay DE89 3704 0044 0532 0130 00 now'],
];

function localExec(text: string, detectionLevel: 'standard' | 'aggressive' = 'standard') {
  return {
    getInputData: () => [{ json: { text } }],
    getNodeParameter: (n: string, _i: number, fb?: unknown) =>
      ({
        authentication: 'local',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174321',
        textField: 'text',
        detectionLevel,
      })[n] ?? fb,
    getNode: () => ({ id: 'n1', name: 'Privent', type: 'n8n-nodes-privent.privent' }),
    getExecutionId: () => 'exec-1',
    getWorkflow: () => ({ id: 'wf-1', name: 'iban' }),
    getMode: () => 'manual',
    getWorkflowStaticData: () => ({}),
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: {
      httpRequestWithAuthentication: vi.fn(async () => {
        throw new Error('local mode must not reach the network');
      }),
      httpRequest: vi.fn(async () => {
        throw new Error('local mode must not reach the network');
      }),
    },
  } as unknown as IExecuteFunctions;
}

async function run(text: string, level: 'standard' | 'aggressive' = 'standard') {
  const out = await new Privent().execute.call(localExec(text, level));
  const json = out[0]![0]!.json as {
    text: string;
    privent: { entities: Array<{ kind: string }> };
  };
  return { text: json.text, kinds: json.privent.entities.map((e) => e.kind) };
}

describe('IBAN, all twelve written forms', () => {
  for (const [name, text] of IBAN_FORMS) {
    it(`detects it as IBAN: ${name}`, async () => {
      const { kinds } = await run(text);
      expect(kinds).toContain('IBAN');
    });
  }

  it('PHONE no longer steals the span — the failure was a wrong kind, not only a miss', async () => {
    const { text, kinds } = await run('pay GB29 NWBK 6016 1331 9268 19 now');
    expect(kinds).not.toContain('PHONE');
    expect(text).not.toContain('6016');
    expect(text).not.toContain('GB29'); // the country code used to survive in cleartext
  });

  it('standard carries it — this is not an aggressive-only capability', async () => {
    const std = await run('pay GB29 NWBK 6016 1331 9268 19 now', 'standard');
    const agg = await run('pay GB29 NWBK 6016 1331 9268 19 now', 'aggressive');
    expect(std.kinds).toContain('IBAN');
    expect(agg.kinds).toContain('IBAN');
  });

  it('the validator is what keeps the wider regex honest', async () => {
    // Right shape, wrong check digits: the regex matches, MOD-97 rejects it.
    const { kinds, text } = await run('ref GB00 NWBK 6016 1331 9268 19 now');
    expect(kinds).not.toContain('IBAN');
    expect(text).toContain('GB00');
  });
});

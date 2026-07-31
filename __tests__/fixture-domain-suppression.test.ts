import { describe, expect, it, vi } from 'vitest';
import type { IExecuteFunctions } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';

/**
 * THE FIXTURE-DOMAIN SUPPRESSION, MADE EXACT.
 *
 * NP-L: the false-positive filter dropped any address whose value contained
 * `example`, `test`, `demo`, `sample`, … N4-7a narrowed that to the domain,
 * which fixed the local-part half — `test.user@bank.invalid` and friends, 3 of 3
 * — and left the domain half matching those words as SUBSTRINGS.
 *
 * Measured on `main` before this item, and this is the part that mattered:
 *
 *     ayse@demo.acme.com    → suppressed
 *     it@test.bank.co.uk    → suppressed
 *     ops@sample.acme.io    → suppressed
 *
 * `demo.`, `test.`, `staging.` and `sample.` are ordinary corporate subdomains.
 * A customer whose staff use them had nothing masked — silently, on real data
 * rather than on our fixtures, which is what made this the highest-value item
 * left.
 *
 * RFC 2606 reserves EXACT names, so the check is exact: `example.com`/`.net`/
 * `.org` and any subdomain of them, and the reserved TLDs `.test`, `.example`,
 * `.localhost`.
 *
 * `.invalid` is deliberately absent. RFC 2606 §2 reserves it for names that are
 * obviously non-existent rather than for documentation, and this repository's own
 * fixtures depend on it staying detectable — a fixture at a suppressed domain
 * tests nothing, which is the original NP-L finding.
 */

const MUST_DETECT: Array<[string, string]> = [
  ['local part contains "test"', 'mail test.user@bank.co.uk today'],
  ['local part contains "demo"', 'mail demo.account@insurer.co.uk today'],
  ['local part contains "sample"', 'mail sample.reports@clinic.co.uk today'],
  ['real subdomain "demo."', 'mail ayse@demo.acme.com today'],
  ['real subdomain "test."', 'mail it@test.bank.co.uk today'],
  ['real subdomain "sample."', 'mail ops@sample.acme.io today'],
  ['real subdomain "staging."', 'mail ci@staging.acme.com today'],
  ['domain merely contains "test"', 'mail ayse@testlab.io today'],
  ['domain merely contains "demo"', 'mail ayse@demolition.co today'],
  ['domain merely contains "example"', 'mail ayse@examples.dev today'],
  ['reserved-for-nonexistence .invalid', 'mail ayse@fixture.invalid today'],
];

const MUST_SUPPRESS: Array<[string, string]> = [
  ['RFC 2606 example.com', 'mail someone@example.com today'],
  ['RFC 2606 example.net', 'mail someone@example.net today'],
  ['RFC 2606 example.org', 'mail someone@example.org today'],
  ['subdomain of example.com', 'mail someone@mail.example.com today'],
  ['reserved TLD .test', 'mail ayse@corp.test today'],
  ['reserved TLD .example', 'mail ayse@corp.example today'],
];

function localExec(text: string) {
  return {
    getInputData: () => [{ json: { text } }],
    getNodeParameter: (n: string, _i: number, fb?: unknown) =>
      ({
        authentication: 'local',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174040',
        textField: 'text',
        detectionLevel: 'standard',
      })[n] ?? fb,
    getNode: () => ({ id: 'n1', name: 'Privent', type: 'n8n-nodes-privent.privent' }),
    getExecutionId: () => 'exec-1',
    getWorkflow: () => ({ id: 'wf-1', name: 'npl' }),
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

async function kinds(text: string): Promise<string[]> {
  const out = await new Privent().execute.call(localExec(text));
  const json = out[0]![0]!.json as { privent: { entities: Array<{ kind: string }> } };
  return json.privent.entities.map((e) => e.kind);
}

describe('a real address at a real domain is masked', () => {
  for (const [name, text] of MUST_DETECT) {
    it(`masks it: ${name}`, async () => {
      expect(await kinds(text)).toContain('EMAIL');
    });
  }
});

describe('RFC 2606 names are suppressed, matched exactly', () => {
  for (const [name, text] of MUST_SUPPRESS) {
    it(`suppresses it: ${name}`, async () => {
      expect(await kinds(text)).not.toContain('EMAIL');
    });
  }
});

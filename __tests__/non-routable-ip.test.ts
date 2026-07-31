import { describe, expect, it, vi } from 'vitest';
import type { IExecuteFunctions } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';

/**
 * NON-ROUTABLE ADDRESSES ARE NOT PERSONAL DATA.
 *
 * A private address identifies a device only inside a network the reader is
 * already on. To an external sink — the thing this product protects — `10.0.0.5`
 * carries no information about a person: a recipient who cannot obtain the
 * additional information required cannot link it to an individual. Public IPs
 * are personal data; these are not.
 *
 * And masking them costs more than it protects. A config snippet with `0.0.0.0`
 * masked is text the downstream agent can no longer act on — N4-7's aggressive
 * failure in miniature, where masking everything scored perfect recall and
 * destroyed the document.
 *
 * The suppression must be proven not to have eaten the addresses that DO matter,
 * which is why both halves are asserted here rather than only the new one.
 *
 * Not built, and recorded rather than left implied: internal-IP masking as a
 * customer requirement is **infrastructure secrecy, not PII**. It is a feature
 * request with a different justification, not a default this product carries.
 * See NP-V.
 */

const SUPPRESSED: Array<[string, string]> = [
  ['wildcard', 'bind 0.0.0.0 for local dev'],
  ['loopback', 'the service answers on 127.0.0.1 only'],
  ['private 10/8', 'the node reported in from 10.0.0.5 this morning'],
  ['private 172.16/12', 'the gateway sits at 172.16.4.1 in that rack'],
  ['private 192.168/16', 'the printer is still on 192.168.1.50'],
  ['link-local', 'DHCP failed and it self-assigned 169.254.10.2'],
  ['broadcast', 'the sweep targets 255.255.255.255 by design'],
  ['multicast', 'the group address is 239.255.255.250 for discovery'],
  ['TEST-NET-1', 'docs use 192.0.2.1 as the example host'],
  ['TEST-NET-2', 'docs use 198.51.100.7 as the second example'],
  ['TEST-NET-3', 'docs use 203.0.113.42 as the third example'],
];

const STILL_MASKED: Array<[string, string]> = [
  ['public, routable', 'traffic from 93.184.216.34 tripped the rate limiter'],
  ['public resolver', 'the resolver was pinned to 8.8.8.8 during the incident'],
  ['public, another block', 'the request originated at 51.15.20.7 last night'],
];

function localExec(text: string) {
  return {
    getInputData: () => [{ json: { text } }],
    getNodeParameter: (n: string, _i: number, fb?: unknown) =>
      ({
        authentication: 'local',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174020',
        textField: 'text',
        detectionLevel: 'aggressive',
      })[n] ?? fb,
    getNode: () => ({ id: 'n1', name: 'Privent', type: 'n8n-nodes-privent.privent' }),
    getExecutionId: () => 'exec-1',
    getWorkflow: () => ({ id: 'wf-1', name: 'ip' }),
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

async function masked(text: string): Promise<{ out: string; kinds: string[] }> {
  const res = await new Privent().execute.call(localExec(text));
  const json = res[0]![0]!.json as { text: string; privent: { entities: Array<{ kind: string }> } };
  return { out: json.text, kinds: json.privent.entities.map((e) => e.kind) };
}

describe('non-routable addresses are left alone', () => {
  for (const [name, text] of SUPPRESSED) {
    it(`leaves it readable: ${name}`, async () => {
      const { out } = await masked(text);
      expect(out).toBe(text);
    });
  }
});

describe('the suppression did not eat the addresses that matter', () => {
  for (const [name, text] of STILL_MASKED) {
    it(`still masks it: ${name}`, async () => {
      const { out, kinds } = await masked(text);
      expect(out).not.toBe(text);
      expect(kinds.some((k) => k.includes('IP'))).toBe(true);
    });
  }
});

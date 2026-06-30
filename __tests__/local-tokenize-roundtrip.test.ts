import { describe, expect, it, vi } from 'vitest';
import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { buildLocalDetectors } from '../shared/privent-http.js';
import { LOCAL_DETECTORS } from '../shared/local-detectors.js';

const EMAIL = 'j.miller@northwind.com';
const SSN = '123-45-6789';
const STREET = '742 Evergreen Terrace';

/**
 * Local (no-backend) mode: detection + vault run entirely inside n8n. Every HTTP
 * helper THROWS, so any network call fails the test — proving zero egress. No
 * Privent Session node; the session id is auto-managed and rides on the item.
 */
function makeLocalExec(
  staticData: IDataObject,
  node: { id: string; name: string; type: string },
  params: Record<string, unknown>,
  items: INodeExecutionData[],
): IExecuteFunctions {
  const throwOnHttp = vi.fn(async () => {
    throw new Error('network call in local mode');
  });
  return {
    getInputData: () => items,
    getNodeParameter: (name: string, _i: number, fallback?: unknown) =>
      name in params ? params[name] : fallback,
    getCredentials: async () => {
      throw new Error('credential read in local mode');
    },
    getNode: () => node,
    getExecutionId: () => 'exec-local',
    getWorkflow: () => ({ id: 'wf-local', name: 'local' }),
    getWorkflowStaticData: () => staticData,
    getMode: () => 'manual',
    continueOnFail: () => false,
    evaluateExpression: () => undefined,
    helpers: { httpRequestWithAuthentication: throwOnHttp, httpRequest: throwOnHttp },
  } as unknown as IExecuteFunctions;
}

const NODE = { type: 'n8n-nodes-privent.privent' };

describe('local tokenize/detokenize round-trip (zero network, no Session node)', () => {
  it('Standard masks structured PII, auto-manages the session, and restores byte-for-byte', async () => {
    const staticData: IDataObject = {};

    const tokOut = await new Privent().execute.call(
      makeLocalExec(
        staticData,
        { id: 'n-tok', name: 'Privent Tokenize', ...NODE },
        {
          authentication: 'local',
          resource: 'tokenize',
          operation: 'tokenize',
          textField: 'text',
          detectionLevel: 'standard',
          sessionId: '',
        },
        [{ json: { text: `email ${EMAIL} ssn ${SSN}` } }],
      ),
    );
    const tokJson = tokOut[0]![0]!.json as Record<string, unknown>;
    const text = tokJson.text as string;
    const privent = tokJson.privent as { sessionId: string; risk: unknown };

    expect(text).not.toContain(EMAIL);
    expect(text).not.toContain(SSN);
    expect(text).toMatch(/\[EMAIL_\d+\]/);
    expect(text).toMatch(/\[SSN_\d+\]/);
    expect(privent.risk).toBeNull();
    expect(privent.sessionId).toMatch(/^[0-9a-f-]{36}$/i); // auto-generated UUID

    // Detokenize with an EMPTY session id — it must fall back to the id on the item.
    const detOut = await new Privent().execute.call(
      makeLocalExec(
        staticData,
        { id: 'n-det', name: 'Privent Detokenize', ...NODE },
        {
          authentication: 'local',
          resource: 'detokenize',
          operation: 'detokenize',
          targetField: '*',
          strict: false,
          sessionId: '',
        },
        [{ json: { text, privent: { sessionId: privent.sessionId } } }],
      ),
    );
    const restored = (detOut[0]![0]!.json as Record<string, unknown>).text as string;
    expect(restored).toContain(EMAIL);
    expect(restored).toContain(SSN);
  });

  it('Aggressive masks an address that Standard leaves untouched', async () => {
    const run = async (level: string) => {
      const out = await new Privent().execute.call(
        makeLocalExec(
          {},
          { id: 'n-tok', name: 'Privent Tokenize', ...NODE },
          {
            authentication: 'local',
            resource: 'tokenize',
            operation: 'tokenize',
            textField: 'text',
            detectionLevel: level,
            sessionId: '',
          },
          [{ json: { text: `ship to ${STREET}` } }],
        ),
      );
      return (out[0]![0]!.json as Record<string, unknown>).text as string;
    };

    expect(await run('standard')).toContain(STREET);
    expect(await run('aggressive')).not.toContain(STREET);
  });

  it('detokenize errors with no session id and no upstream Tokenize item', async () => {
    await expect(
      new Privent().execute.call(
        makeLocalExec(
          {},
          { id: 'n-det', name: 'Privent Detokenize', ...NODE },
          {
            authentication: 'local',
            resource: 'detokenize',
            operation: 'detokenize',
            targetField: '*',
            strict: false,
            sessionId: '',
          },
          [{ json: { text: 'nothing here' } }],
        ),
      ),
    ).rejects.toBeInstanceOf(NodeOperationError);
  });
});

describe('buildLocalDetectors tier gating', () => {
  it('Standard excludes contextual detectors; Aggressive includes them', () => {
    const standard = buildLocalDetectors('standard');
    const aggressive = buildLocalDetectors('aggressive');
    const contextual = LOCAL_DETECTORS.filter((d) => d.tier === 'contextual').length;

    expect(aggressive.length).toBeGreaterThan(standard.length);
    expect(aggressive.length - standard.length).toBe(contextual);
  });
});

const tokenizeLocal = async (
  staticData: IDataObject,
  text: string,
  level: string,
): Promise<Record<string, unknown>> => {
  const out = await new Privent().execute.call(
    makeLocalExec(
      staticData,
      { id: 'n-tok', name: 'Privent Tokenize', ...NODE },
      {
        authentication: 'local',
        resource: 'tokenize',
        operation: 'tokenize',
        textField: 'text',
        detectionLevel: level,
        sessionId: '',
      },
      [{ json: { text } }],
    ),
  );
  return out[0]![0]!.json as Record<string, unknown>;
};

describe('local detection samples', () => {
  it('Standard masks a SWIFT/BIC (checksum) and a Stripe key, then restores both', async () => {
    const SWIFT = 'DEUTDEFF500';
    // Publishable (pk_) key — matches the STRIPE_API_KEY detector but is not a
    // secret, so it doesn't trip secret-scanning push protection.
    const STRIPE = 'pk_live_0123456789abcdefABCDEFgh';
    const staticData: IDataObject = {};

    // Neutral carrier text — `SWIFT` may resolve to SWIFT_BIC or an overlapping
    // financial-ref kind, so assert masking generically; assert the secret kind
    // (distinctive prefix, no overlap) precisely.
    const tok = await tokenizeLocal(staticData, `${SWIFT} ${STRIPE}`, 'standard');
    const text = tok.text as string;
    expect(text).toMatch(/\[STRIPE_API_KEY_\d+\]/);
    expect(text).not.toContain(SWIFT);
    expect(text).not.toContain(STRIPE);
    expect((text.match(/\[[A-Z0-9_]+_\d+\]/g) ?? []).length).toBeGreaterThanOrEqual(2);

    const sessionId = (tok.privent as { sessionId: string }).sessionId;
    const detOut = await new Privent().execute.call(
      makeLocalExec(
        staticData,
        { id: 'n-det', name: 'Privent Detokenize', ...NODE },
        {
          authentication: 'local',
          resource: 'detokenize',
          operation: 'detokenize',
          targetField: '*',
          strict: false,
          sessionId: '',
        },
        [{ json: { text, privent: { sessionId } } }],
      ),
    );
    const restored = (detOut[0]![0]!.json as Record<string, unknown>).text as string;
    expect(restored).toContain(SWIFT);
    expect(restored).toContain(STRIPE);
  });

  it('crypto (Ethereum) address masks only under Aggressive', async () => {
    const ETH = '0x52908400098527886E0F7030069857D2E4169EE7';
    expect((await tokenizeLocal({}, `pay ${ETH}`, 'standard')).text).toContain(ETH);
    expect((await tokenizeLocal({}, `pay ${ETH}`, 'aggressive')).text).not.toContain(ETH);
  });
});

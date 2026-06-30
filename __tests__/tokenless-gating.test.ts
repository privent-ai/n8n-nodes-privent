import { describe, expect, it } from 'vitest';
import type { INodeProperties } from 'n8n-workflow';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { PriventVisitorApi } from '../credentials/PriventVisitorApi.credentials.js';

const props = new Privent().description.properties;

/** Reads the `displayOptions.show` of a property as a loose record. */
function show(p: INodeProperties): Record<string, unknown[]> {
  return (p.displayOptions?.show ?? {}) as Record<string, unknown[]>;
}

describe('tokenless resource gating', () => {
  it('the tokenless Resource lists exactly Session/Tokenize/Detokenize/Risk Check', () => {
    const tokenlessResource = props.find(
      (p) => p.name === 'resource' && show(p).authentication?.[0] === 'tokenless',
    );
    expect(tokenlessResource).toBeDefined();
    const values = (tokenlessResource!.options as Array<{ value: string }>).map((o) => o.value);
    expect(values).toEqual(['session', 'tokenize', 'detokenize', 'riskCheck']);
  });

  it('every Audit/Handoff property is gated to authentication apiKey', () => {
    const auditHandoff = props.filter((p) => {
      const res = show(p).resource as string[] | undefined;
      return res?.[0] === 'audit' || res?.[0] === 'handoff';
    });
    expect(auditHandoff.length).toBeGreaterThan(0);
    for (const p of auditHandoff) {
      expect(show(p).authentication).toEqual(['apiKey']);
    }
  });
});

describe('PriventVisitorApi credential', () => {
  it('tests against POST /v1/visitor/credentials', () => {
    const cred = new PriventVisitorApi();
    expect(cred.name).toBe('priventVisitorApi');
    expect(cred.test.request.url).toBe('/v1/visitor/credentials');
    expect(cred.test.request.method).toBe('POST');
  });
});

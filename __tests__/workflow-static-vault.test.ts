import { describe, expect, it } from 'vitest';
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { WorkflowStaticDataVault } from '../shared/privent-http.js';

/** A ctx whose static data is a single shared object (as n8n persists per workflow). */
function makeCtx(staticData: IDataObject): IExecuteFunctions {
  return {
    getWorkflowStaticData: () => staticData,
  } as unknown as IExecuteFunctions;
}

describe('WorkflowStaticDataVault', () => {
  it('dedups same kind+value → same token, increments per-kind counters', async () => {
    const sd: IDataObject = {};
    const vault = new WorkflowStaticDataVault(makeCtx(sd), 'sess-1');

    const r1 = await vault.findOrCreateBatch([
      { kind: 'EMAIL', value: 'a@x.com' },
      { kind: 'EMAIL', value: 'b@x.com' },
      { kind: 'SSN', value: '123-45-6789' },
    ]);
    expect(r1.map((r) => r.token)).toEqual(['[EMAIL_001]', '[EMAIL_002]', '[SSN_001]']);

    // Same values again → identical tokens, no new counters.
    const r2 = await vault.findOrCreateBatch([
      { kind: 'EMAIL', value: 'a@x.com' },
      { kind: 'SSN', value: '123-45-6789' },
    ]);
    expect(r2.map((r) => r.token)).toEqual(['[EMAIL_001]', '[SSN_001]']);
  });

  it('retrieveBatch returns originals and skips unknown tokens', async () => {
    const sd: IDataObject = {};
    const vault = new WorkflowStaticDataVault(makeCtx(sd), 'sess-2');
    await vault.findOrCreateBatch([{ kind: 'EMAIL', value: 'a@x.com' }]);

    const rows = await vault.retrieveBatch(['[EMAIL_001]', '[EMAIL_999]']);
    expect(rows).toEqual([{ token: '[EMAIL_001]', kind: 'EMAIL', value: 'a@x.com' }]);
    expect(await vault.retrieveBatch([])).toEqual([]);
  });

  it('bounds growth: >50 sessions evicts the oldest insertion', async () => {
    const sd: IDataObject = {};
    for (let i = 0; i < 51; i++) {
      const v = new WorkflowStaticDataVault(makeCtx(sd), `s-${i}`);
      await v.findOrCreateBatch([{ kind: 'EMAIL', value: `e${i}@x.com` }]);
    }
    const root = (sd.priventVault as { sessions: Record<string, unknown>; order: string[] });
    expect(root.order).toHaveLength(50);
    expect(root.sessions['s-0']).toBeUndefined(); // oldest evicted
    expect(root.sessions['s-50']).toBeDefined();
  });

  it('destroy clears just that session', async () => {
    const sd: IDataObject = {};
    const a = new WorkflowStaticDataVault(makeCtx(sd), 'keep');
    const b = new WorkflowStaticDataVault(makeCtx(sd), 'drop');
    await a.findOrCreateBatch([{ kind: 'EMAIL', value: 'a@x.com' }]);
    await b.findOrCreateBatch([{ kind: 'EMAIL', value: 'b@x.com' }]);

    await b.destroy();
    const root = sd.priventVault as { sessions: Record<string, unknown>; order: string[] };
    expect(root.sessions.drop).toBeUndefined();
    expect(root.order).toEqual(['keep']);
    expect(root.sessions.keep).toBeDefined();
  });
});

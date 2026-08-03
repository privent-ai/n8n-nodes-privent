/**
 * `framework` names the ORCHESTRATION ENGINE, and this node only ever runs
 * inside one. So it reports `n8n`, unconditionally.
 *
 * WHAT THIS REPLACES. A `Framework` dropdown offered `Manual / Custom`, and
 * `frameworkForWire` translated that choice to the wire value `sdk` — so an
 * event that originated in an n8n workflow arrived claiming to be from the SDK,
 * and could not be identified as n8n at all. `sdk` is a CHANNEL value now,
 * carried by `X-Privent-Client`; it was never a framework value.
 *
 * THE CASE THAT MATTERS IS THE STORED ONE. Removing a node property does not
 * remove it from workflows already saved with it — n8n keeps unknown stored
 * parameters and hands them to the node at execution. So the assertion that
 * decides whether an upgraded customer is fixed is not "a fresh node sends n8n",
 * it is "a node still carrying `framework: 'manual'` in its stored parameters
 * sends n8n". Both are here; the second is the one that would regress silently.
 */
import { describe, expect, it } from 'vitest';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

async function flushPromises() {
  await new Promise((r) => setImmediate(r));
}

function sessionParams(extra: Record<string, unknown> = {}) {
  return {
    authentication: 'apiKey',
    resource: 'session',
    operation: 'open',
    sessionIdMode: 'auto',
    agentName: 'probe',
    webhookNodeName: '',
    ...extra,
  };
}

describe('wire `framework` is always n8n', () => {
  it('a STORED workflow still carrying framework=manual sends n8n, not sdk', async () => {
    const { exec, auditEvents } = makeHttpExecFn({
      items: [{ json: {} }],
      // Exactly what n8n hands a node upgraded past the property's removal.
      params: sessionParams({ framework: 'manual' }),
      node: { id: 'node-uuid-1', name: 'Session', type: 'n8n-nodes-privent.privent' },
    });

    await new Privent().execute.call(exec);
    await flushPromises();

    const events = auditEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.framework).toBe('n8n');
    // Named separately from the positive assertion: `sdk` is the value this item
    // exists to stop, and a future mapping to some other wrong value should not
    // be able to pass by merely not being `sdk`.
    expect(events[0]!.framework).not.toBe('sdk');
  });

  it('the two fields that disagreed now agree', async () => {
    const { exec, auditEvents } = makeHttpExecFn({
      items: [{ json: {} }],
      params: sessionParams({ framework: 'manual' }),
      node: { id: 'node-uuid-1', name: 'Session', type: 'n8n-nodes-privent.privent' },
    });

    await new Privent().execute.call(exec);
    await flushPromises();

    const event = auditEvents()[0]!;
    const meta = event.metadata as Record<string, unknown>;
    // `metadata.framework` was hardcoded 'n8n' the whole time, so a manual-mode
    // event shipped `framework: "sdk"` and `metadata.framework: "n8n"` in one
    // payload. Asserting they agree is asserting the contradiction is gone.
    expect(event.framework).toBe(meta.framework);
  });

  it('an unset framework parameter is unchanged at n8n', async () => {
    const { exec, auditEvents } = makeHttpExecFn({
      items: [{ json: {} }],
      params: sessionParams(),
      node: { id: 'node-uuid-1', name: 'Session', type: 'n8n-nodes-privent.privent' },
    });

    await new Privent().execute.call(exec);
    await flushPromises();

    expect(auditEvents()[0]!.framework).toBe('n8n');
  });
});

describe('the Framework control is removed, not merely ignored', () => {
  it('no `framework` property remains in the node description', () => {
    const props = new Privent().description.properties;
    expect(props.find((p) => p.name === 'framework')).toBeUndefined();
  });

  it('sessionIdMode is untouched — it was a different property all along', () => {
    const props = new Privent().description.properties;
    const mode = props.find((p) => p.name === 'sessionIdMode');
    expect(mode).toBeDefined();
    expect((mode!.options ?? []).map((o) => (o as { value: unknown }).value)).toEqual(
      expect.arrayContaining(['auto', 'manual']),
    );
  });
});

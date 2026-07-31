import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Privent } from '../nodes/Privent/Privent.node.js';
import { makeHttpExecFn } from './_http-helpers.js';

/**
 * THE ARTIFACT MUST SAY WHICH CORE IT CARRIES.
 *
 * `tsup` bundles `@priventai/core` via `noExternal`, so the range in
 * package.json resolves nothing at runtime and the only thing an installed user
 * runs is `dist/`. NP-O measured that the bundle could not be fingerprinted by
 * version at all: 0 of 4 blocks unique to 0.8.0 and 0 of 12 unique to 0.9.0
 * survived into `dist/`, because tree-shaking removes exactly the bytes that
 * distinguish them. The lockfile was the only evidence, and a lockfile describes
 * a build machine, not an artifact.
 *
 * Two assertions, deliberately at different layers: the bundle contains the
 * version as a literal, and a running node reports it. The first is what someone
 * inspecting a published tarball can check without executing anything.
 */

const DIST = join(__dirname, '../dist/nodes/Privent/Privent.node.js');
const installedCore = (
  JSON.parse(
    readFileSync(join(__dirname, '../node_modules/@priventai/core/package.json'), 'utf8'),
  ) as { version: string }
).version;

describe('the published artifact identifies its bundled core', () => {
  it('the bundle carries the version as a literal, readable without running it', () => {
    // Not skipped when dist is missing: "could not check" is not "checked".
    expect(existsSync(DIST), `${DIST} missing — run \`npm run build\` first`).toBe(true);
    const bundle = readFileSync(DIST, 'utf8');
    const declaration = /CORE_VERSION = \(\(\) => \{\s*const v = true \? "([^"]+)"/.exec(bundle);
    expect(declaration, 'CORE_VERSION literal not found in dist').not.toBeNull();
    expect(declaration![1]).toBe(installedCore);
  });

  it('a running node reports it in the audit event, beside node_version', async () => {
    const { exec, auditEvents } = makeHttpExecFn({
      items: [{ json: { text: 'reach ayse@fixture.invalid now' } }],
      params: {
        authentication: 'apiKey',
        resource: 'tokenize',
        operation: 'tokenize',
        sessionId: '123e4567-e89b-42d3-a456-426614174010',
        textField: 'text',
        detectionMode: 'local',
        reviewThreshold: 0.9,
      },
    });
    await new Privent().execute.call(exec);
    await new Promise((r) => setImmediate(r));

    const meta = auditEvents().find((e) => e.type === 'tokenize')!.metadata as Record<
      string,
      unknown
    >;
    // Unit runs are not bundled, so the define never fires and the guard answers
    // 'unknown'. That is the honest value here — the assertion is that the key
    // exists and is a string, and the bundle test above pins the real one.
    expect(typeof meta.core_version).toBe('string');
    expect(meta.node_version).toBeDefined();
  });
});

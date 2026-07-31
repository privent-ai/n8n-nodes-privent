import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

/**
 * n8n loads community nodes via require() from specific paths listed in the
 * package.json "n8n" field.  All node files must be CommonJS.
 *
 * We compile WITH bundling (bundle: true) and inline @priventai/core's pure bits
 * so the published package ships ZERO runtime dependencies. Each node file is a
 * self-contained CJS bundle. n8n-workflow + zod stay external (n8n provides them
 * at runtime); @opentelemetry/api stays external (optional, guarded require in
 * core/otel.ts).
 *
 * `__SDK_VERSION__` is defined two ways: the bare token (used by builds that
 * inline a define-aware core) and the `globalThis.__SDK_VERSION__` member form
 * that published @priventai/core@0.8.0's TRACER_VERSION reads — replacing the
 * latter at bundle time removes the only `globalThis` reference from the dist.
 */
const SDK_VERSION = JSON.stringify(process.env['npm_package_version'] ?? '1.0.0');

/**
 * The version of `@priventai/core` this artifact CONTAINS, resolved at bundle
 * time from the installed package.
 *
 * `noExternal` copies core into the published files, so the range in
 * package.json resolves nothing at runtime and the lockfile describes a build
 * machine rather than an artifact. Measured in NP-O: 0 of 4 blocks unique to
 * 0.8.0 and 0 of 12 unique to 0.9.0 survived into `dist/` — tree-shaking removes
 * exactly the bytes that would distinguish them, so the artifact could not say
 * what it carried. Baking the version in is the smallest thing that makes it
 * self-identifying, and it costs one string.
 */
const CORE_VERSION = JSON.stringify(
  (
    JSON.parse(
      readFileSync(new URL('./node_modules/@priventai/core/package.json', import.meta.url), 'utf8'),
    ) as { version?: string }
  ).version ?? 'unknown',
);

export default defineConfig({
  entry: [
    'nodes/**/*.node.ts',
    'credentials/**/*.credentials.ts',
    'index.ts',
  ],
  format: ['cjs'],
  bundle: true,
  noExternal: ['@priventai/core'],
  // `zod` is BUNDLED, not external. It was external and undeclared, which worked
  // only because n8n ships its own copy — a requirement met by an accident of
  // packaging is not met, and anything loading this node outside such an n8n
  // failed on install with `Cannot find module 'zod'` (NP-AA).
  //
  // Declaring it was tried first and is not permitted: this package's own gate,
  // `@n8n/eslint-plugin-community-nodes`, rejects `zod` in `peerDependencies`
  // ("only n8n-workflow and @n8n/ai-node-sdk are permitted") and rejects any
  // `dependencies` at all ("runtime dependencies get bundled into the n8n
  // instance and can conflict with other nodes or the n8n runtime itself").
  // The rule's own text names the remaining option: bundle it.
  //
  // Measured cost: the node bundle goes from 221 KB to 343 KB, +121 KB.
  external: ['n8n-workflow', '@opentelemetry/api'],
  dts: false,
  sourcemap: true,
  clean: true,
  target: 'node20',
  define: {
    __SDK_VERSION__: SDK_VERSION,
    'globalThis.__SDK_VERSION__': SDK_VERSION,
    __CORE_VERSION__: CORE_VERSION,
  },
});

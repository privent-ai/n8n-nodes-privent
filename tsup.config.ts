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

export default defineConfig({
  entry: [
    'nodes/**/*.node.ts',
    'credentials/**/*.credentials.ts',
    'index.ts',
  ],
  format: ['cjs'],
  bundle: true,
  noExternal: ['@priventai/core'],
  external: ['n8n-workflow', '@opentelemetry/api', 'zod'],
  dts: false,
  sourcemap: true,
  clean: true,
  target: 'node20',
  define: {
    __SDK_VERSION__: SDK_VERSION,
    'globalThis.__SDK_VERSION__': SDK_VERSION,
  },
});

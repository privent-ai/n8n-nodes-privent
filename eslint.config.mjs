import { defineConfig } from 'eslint/config';
import { n8nCommunityNodesPlugin } from '@n8n/eslint-plugin-community-nodes';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import n8nNodesPlugin from 'eslint-plugin-n8n-nodes-base';

// Mirrors `@n8n/scan-community-package@0.30.0`'s own `buildScanConfig()`
// (scanner/scanner.mjs:229-291) rule for rule, so a green run here reproduces
// the official scanner's finding set instead of a subset of it. Measured
// 2026-07-31: the scanner reports 24 unique problems across 13 rules for this
// package (it prints 25 because it lints package.json twice, once per leg);
// this config reproduces those 24 exactly, and adds shared/ (below).
//
// WHAT STILL DIFFERS FROM THE OFFICIAL SCANNER — none of it fixed here:
//   · eslint 9.39.4 here vs the plugins' peer pin 9.29.0. A rule can behave
//     differently across minors, so our green and the scanner's green are not
//     the same measurement.
//   · n8n-workflow 1.120.19 vs the plugins' `>=2` peer, carried by
//     .npmrc legacy-peer-deps.
//   · The scanner ALSO fetches the provenance-attested git source and lints
//     that; --provenance is therefore an input to the audit, not only origin
//     proof. We lint the working tree instead.
//   · The scanner's SOURCE_FILE_PATTERNS (scanner.mjs:222) is
//     ['package.json', '{nodes,credentials}/**/*.{js,ts,json}'] — it never sees
//     shared/. We lint it anyway, so our gate is strictly WIDER than the
//     scanner in that one direction. See F-F.
//
// SURFACES, and why both: the .ts globs carry the n8n convention/API rules
// (the scanner's own comment notes these no-op or false-positive on compiled
// output). dist/**/*.js carries the Cloud-allowlist rules over the BUNDLED
// @priventai/core code, which no source glob can see — measured: injecting
// `process.env` + `console.log` into the bundle fires no-restricted-globals
// and no-console only via the dist glob. So N4-1's "dist is the surface"
// conclusion is REFINED, not reversed: n8n scans both and weights the source.
//
// The globs must stay QUOTED in package.json: npm runs scripts through `sh`,
// which has no globstar, so an unquoted `**` collapses to one directory level.
export default defineConfig(
  n8nCommunityNodesPlugin.configs.recommended,
  { rules: { 'no-console': 'error' } },
  { plugins: { 'n8n-nodes-base': n8nNodesPlugin } },
  {
    files: ['package.json'],
    rules: { ...n8nNodesPlugin.configs.community.rules },
  },
  {
    files: ['**/credentials/**/*.ts'],
    rules: {
      ...n8nNodesPlugin.configs.credentials.rules,
      // Not valid for community nodes.
      'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
      // @n8n/eslint-plugin-community-nodes' credential-password-field is more accurate.
      'n8n-nodes-base/cred-class-field-type-options-password-missing': 'off',
    },
  },
  {
    files: ['**/nodes/**/*.ts'],
    rules: {
      ...n8nNodesPlugin.configs.nodes.rules,
      // Inputs/outputs are enums here, not the string "main".
      'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
      'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
      // A third-party API can legitimately have a maximum limit.
      'n8n-nodes-base/node-param-type-options-max-value-present': 'off',
    },
  },
  // tsup keeps source comments, so the line-scoped eslint-disable directives in
  // nodes/**/*.ts reappear inside the bundle — where the rules they name are
  // .ts-scoped and never run, making ESLint report every one of them as an
  // unused directive. The directives are meaningful at their source lines and
  // meaningless here, so the report is switched off for compiled output only.
  { files: ['dist/**/*.js'], linterOptions: { reportUnusedDisableDirectives: 'off' } },
  // JSON (notably package.json) needs the TS parser: the package.json-based
  // rules walk a TSESTree ObjectExpression.
  { files: ['**/*.json'], languageOptions: { parser: tsParser } },
  // The nodes/credentials rulesets walk a TSESTree AST too.
  { files: ['**/*.ts'], languageOptions: { parser: tsParser } },
  // ONE rule from @typescript-eslint, registered deliberately, over source only.
  //
  // A line in shared/ once carried `eslint-disable-next-line
  // @typescript-eslint/no-require-imports`. The rule was never registered here,
  // so the directive protected against nothing and ESLint reported it as unused;
  // 49e0c18 removed the directive. Measured after the fact: registering the rule
  // makes it fire, once, on that same line. So removing a suppression without
  // registering the rule it suppressed did not fix the diagnostic — it hid that
  // there had been one, and the line has been unreported rather than clean since.
  //
  // This WIDENS the gate past `@n8n/scan-community-package`, which does not run
  // this plugin. That is a decision, and it is the second one of its kind: F-F
  // records the first, where shared/ was brought into lint scope even though the
  // scanner's SOURCE_FILE_PATTERNS never sees it. A third widening now has to
  // argue against two precedents rather than one.
  //
  // Scoped to source: dist/ is excluded because the bundled @priventai/core
  // carries requires this package does not own.
  {
    files: ['shared/**/*.ts', 'nodes/**/*.ts', 'credentials/**/*.ts'],
    plugins: { '@typescript-eslint': tsPlugin },
    rules: { '@typescript-eslint/no-require-imports': 'error' },
  },
);

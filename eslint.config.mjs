import { defineConfig } from 'eslint/config';
import { n8nCommunityNodesPlugin } from '@n8n/eslint-plugin-community-nodes';
import tsParser from '@typescript-eslint/parser';
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
      // DELIBERATELY ONE RULE LOOSER THAN THE OFFICIAL SCANNER — error -> warn,
      // not off. There is no vector brand asset anywhere in the product: the
      // node's icon and privent-frontend/public/og/privent-main-logo.png are
      // byte-identical, the frontend's own logo component renders a PNG
      // (components/custom/logo.tsx:12), and no light/dark variant of the mark
      // has ever existed. That is a brand-asset gap this lint rule happened to
      // be the first thing to notice — recorded as F-I — and the decision is
      // that the PNG stays. Tracing the PNG was measured and rejected: potrace
      // output is a single black path covering the full canvas with the mark as
      // negative space, monochrome from an RGB source, i.e. a black square in
      // the node list.
      //
      // It stays a WARNING rather than off so every lint run still reports it
      // and the gate does not quietly claim a clean bill. It is not an error
      // because a check that can never go green trains everyone to ignore it
      // (F-H). The official scanner still counts it as an error, so the package
      // continues to FAIL @n8n/scan-community-package until a real vector asset
      // exists — F-C stays open on exactly this one point.
      'n8n-nodes-base/node-class-description-icon-not-svg': 'warn',
      // SECOND deliberate divergence, same shape: error -> warn, not off.
      // The rule matches on `paramName.toLowerCase().includes('token')`
      // (node-param-type-options-password-missing.js:32), so it fires on
      // `promptTokens` and `completionTokens` — which hold a token COUNT
      // expression (`={{$json.usage.prompt_tokens}}`), not a secret. n8n's own
      // exception list already carries this exact class:
      // FALSE_POSITIVE_NODE_SENSITIVE_PARAM_NAMES = ["maxTokens",
      // "password_needs_reset"] (constants.js:125). Ours is maxTokens under a
      // different name.
      //
      // Satisfying it would mask two operator-visible expression fields in the
      // editor to please an instrument that matched a substring — the
      // instrument corrupting what it measures, applied to the product. Renaming
      // the parameters would break stored workflows, and inline disables are
      // ignored by the scanner (allowInlineConfig: false), so a warning is the
      // honest position. The real fix is upstream: these names belong in n8n's
      // exception list, or the rule should match more narrowly than
      // includes('token'). Recorded as F-J; no upstream issue filed yet.
      //
      // The scanner still counts these as errors, so they add to the source-leg
      // failure alongside the icon.
      'n8n-nodes-base/node-param-type-options-password-missing': 'warn',
    },
  },
  // JSON (notably package.json) needs the TS parser: the package.json-based
  // rules walk a TSESTree ObjectExpression.
  { files: ['**/*.json'], languageOptions: { parser: tsParser } },
  // The nodes/credentials rulesets walk a TSESTree AST too.
  { files: ['**/*.ts'], languageOptions: { parser: tsParser } },
);

import { n8nCommunityNodesPlugin } from '@n8n/eslint-plugin-community-nodes';
import tsParser from '@typescript-eslint/parser';

// Mirrors the official `@n8n/scan-community-package` analysis: the
// `recommended` config + `no-console:error`, run over the published dist JS
// and `package.json`. JSON files need the TS parser because the
// package.json-based rules walk a TSESTree ObjectExpression.
export default [
  n8nCommunityNodesPlugin.configs.recommended,
  {
    rules: { 'no-console': 'error' },
  },
  {
    files: ['**/*.json'],
    languageOptions: { parser: tsParser },
  },
];

import { n8nCommunityNodesPlugin } from '@n8n/eslint-plugin-community-nodes';
import tsParser from '@typescript-eslint/parser';

// CORRELATED with n8n Cloud verification — NOT equivalent to it. Measured
// 2026-07-31: `@n8n/scan-community-package@0.30.0`, the closest thing to an
// official checker, requires TWO linters — `eslint-plugin-n8n-nodes-base@^1.16.7`
// and `@n8n/eslint-plugin-community-nodes@0.27.0` (exact pin). We run only the
// second, at 0.21.0 (six releases behind), and do not have the first at all.
// Whether that scanner is what n8n Cloud actually runs at verification time is
// UNKNOWN. So a green run here means "none of the rules this one plugin version
// knows about are violated" — it is not a shipping guarantee. Tracked as F-C.
//
// The glob must stay QUOTED: npm runs scripts through `sh`, which has no
// globstar, so an unquoted `dist/**/*.js` collapses to one directory level and
// silently skips the node bundle. Quoted, ESLint does its own globbing.
//
// JSON files need the TS parser because the package.json-based rules walk a
// TSESTree ObjectExpression.
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

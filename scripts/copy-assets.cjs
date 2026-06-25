/**
 * Post-build asset copy.
 * n8n resolves a node's `icon: 'file:privent.png'` relative to the compiled
 * .node.js file, and reads the codex `*.node.json` beside it. tsup only emits
 * .js/.js.map — it does not copy non-TypeScript assets. This script fills that
 * gap: PNG icon + codex JSON into each node dir, and the PNG into the
 * credential dir (the credential also declares `icon: 'file:privent.png'`).
 */

const { cpSync, mkdirSync } = require('fs');
const { resolve } = require('path');

const root = resolve(__dirname, '..');
const pngSrc = resolve(root, 'src/nodes/privent.png');

const NODES = [
  'PriventSession',
  'PriventTokenize',
  'PriventDetokenize',
  'PriventRiskCheck',
  'PriventAuditEvent',
  'PriventHandoff',
];

for (const name of NODES) {
  const destDir = resolve(root, 'dist/nodes', name);
  mkdirSync(destDir, { recursive: true });
  cpSync(pngSrc, resolve(destDir, 'privent.png'));
  cpSync(
    resolve(root, 'src/nodes', name, `${name}.node.json`),
    resolve(destDir, `${name}.node.json`),
  );
}

// Credential icon.
const credDir = resolve(root, 'dist/credentials');
mkdirSync(credDir, { recursive: true });
cpSync(pngSrc, resolve(credDir, 'privent.png'));

console.log('✓ PNG icons + codex JSON copied to dist node/credential directories');

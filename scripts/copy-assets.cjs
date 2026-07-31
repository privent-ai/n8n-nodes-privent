/**
 * Post-build asset copy.
 *
 * tsup emits only .js/.js.map, so the icon and the codex JSON have to be placed
 * beside the compiled output by hand.
 *
 * ONE icon file, not three. n8n resolves `icon: 'file:…'` with
 * `path.join(path.dirname(compiledFile), iconPath)` and then rejects anything
 * that escapes the package directory (n8n-core directory-loader.js:315-320), so
 * a `../` reference resolves normally and a wrong one throws at load time
 * rather than failing quietly. Both the node and the credentials therefore point
 * at a single `dist/nodes/privent.png`:
 *
 *   dist/nodes/Privent/Privent.node.js  + file:../privent.png       -> dist/nodes/privent.png
 *   dist/credentials/*.credentials.js   + file:../nodes/privent.png -> dist/nodes/privent.png
 *
 * The source tree keeps the same single file at nodes/privent.png, which is
 * also where `@n8n/community-nodes/icon-validation` resolves it from. Copying a
 * brand file into every directory that references it would leave three copies
 * that can drift — F-I in miniature.
 */

const { cpSync, mkdirSync } = require('fs');
const { resolve } = require('path');

const root = resolve(__dirname, '..');
const pngSrc = resolve(root, 'nodes/privent.png');

const NODES = ['Privent'];

// The single icon that both the node and the credentials resolve to.
mkdirSync(resolve(root, 'dist/nodes'), { recursive: true });
cpSync(pngSrc, resolve(root, 'dist/nodes/privent.png'));

for (const name of NODES) {
  const destDir = resolve(root, 'dist/nodes', name);
  mkdirSync(destDir, { recursive: true });
  cpSync(
    resolve(root, 'nodes', name, `${name}.node.json`),
    resolve(destDir, `${name}.node.json`),
  );
}

console.log('✓ PNG icon (single copy) + codex JSON copied to dist');

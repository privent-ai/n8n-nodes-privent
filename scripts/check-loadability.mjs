/**
 * Loadability check (automatable proxy for a real n8n install).
 *
 * Packs the package and installs the tarball in a clean temp dir with the REAL
 * `zod` present (the de-risk target: zod is an undeclared, n8n-provided
 * allowlisted external — this proves `require("zod")` resolves). `n8n-workflow`
 * is host-provided at runtime and pulls a native `isolated-vm` build, so it is
 * stubbed here with the handful of runtime exports the nodes reference; we are
 * not testing n8n-workflow itself. Then require()s + instantiates every node +
 * credential — any unresolved import throws.
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();

const tmp = mkdtempSync(join(tmpdir(), 'privent-load-'));
try {
  console.log('• Packing…');
  const tgz = sh(`npm pack --silent --pack-destination ${tmp}`, pkgRoot).split('\n').pop();

  console.log('• Installing tarball + real zod (n8n-workflow stubbed)…');
  writeFileSync(join(tmp, 'package.json'), JSON.stringify({ name: 'load-test', private: true }) + '\n');
  // --legacy-peer-deps: don't auto-install the n8n-workflow peer (native build).
  sh(`npm install --silent --no-audit --no-fund --legacy-peer-deps "${join(tmp, tgz)}" zod`, tmp);

  // Stub n8n-workflow with the runtime values the node descriptions reference.
  const nwDir = join(tmp, 'node_modules', 'n8n-workflow');
  mkdirSync(nwDir, { recursive: true });
  writeFileSync(join(nwDir, 'package.json'), JSON.stringify({ name: 'n8n-workflow', version: '1.120.10', main: 'index.js' }) + '\n');
  writeFileSync(
    join(nwDir, 'index.js'),
    `class NodeOperationError extends Error {}\n` +
      `class NodeApiError extends Error {}\n` +
      `const NodeConnectionTypes = { Main: 'main', AiTool: 'ai_tool' };\n` +
      `module.exports = { NodeOperationError, NodeApiError, NodeConnectionTypes };\n`,
  );

  const base = join(tmp, 'node_modules', 'n8n-nodes-privent', 'dist');
  const require = createRequire(join(tmp, 'package.json'));

  const targets = readdirSync(join(base, 'nodes')).map((d) => join(base, 'nodes', d, `${d}.node.js`));
  targets.push(join(base, 'credentials', 'PriventApi.credentials.js'));

  let zodSeen = false;
  let instantiated = 0;
  for (const file of targets) {
    const mod = require(file);
    for (const [name, exp] of Object.entries(mod)) {
      // Node/credential classes are PascalCase `Privent*` / `PriventApi`;
      // skip exported helper functions (deriveSinkId, …).
      if (typeof exp === 'function' && /^Privent/.test(name)) {
        const inst = new exp();
        if (!inst.description && !inst.name) {
          throw new Error(`${file}: ${name} is neither a node nor a credential`);
        }
        instantiated++;
      }
    }
  }
  // Explicit zod-resolution probe from the installed package context.
  try {
    require.resolve('zod');
    zodSeen = true;
  } catch {
    zodSeen = false;
  }
  if (!zodSeen) throw new Error('zod did not resolve — peer/external assumption is wrong; bundle zod instead.');

  console.log(`✓ Loadability OK — ${targets.length} modules required, ${instantiated} classes instantiated, zod resolved.`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

import { readdir, readFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]));
  return nested.flat();
}
const failures = [];
for (const path of await files('src')) {
  if (!/\.(js|jsx|ts|tsx)$/.test(path)) continue;
  const text = await readFile(path, 'utf8');
  if (/https?:\/\/(?:[^\s/'"]+\.)?base44\.(?:com|app)/i.test(text)
      || /https?:\/\/media\.platform\.com/i.test(text)
      || /(?:from|import\s*\()\s*['"][^'"]*(?:@base44|base44Client)/.test(text)
      || /import\.meta\.env\.VITE_BASE44/.test(text)) failures.push(path);
}
assert.equal(failures.length, 0, `External platform dependencies found: ${failures.join(', ')}`);
assert.equal(await stat('base44').then(() => true, () => false), false, 'Old backend scaffold must not be deployed');
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
assert.ok(!Object.keys(pkg.dependencies || {}).some(name => name.startsWith('@base44/')));
console.log('Independent source imports, media references, and configuration verified.');

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const baseline = JSON.parse(await readFile('calculation-source-parity.json', 'utf8'));
for (const [path, expected] of Object.entries(baseline.files)) {
  const actual = createHash('sha256').update(await readFile(path)).digest('hex');
  assert.equal(actual, expected, `Original calculation or source-data file changed: ${path}`);
}
console.log(`Original main calculation/support source verified (${Object.keys(baseline.files).length} byte-identical files).`);

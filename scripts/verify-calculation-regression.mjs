import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const fixture = JSON.parse(await readFile('calculation-regression.lock.json', 'utf8'));
const output = await build({
  entryPoints: ['scripts/calculation-regression-cases.mjs'],
  bundle: true, write: false, format: 'esm', platform: 'node',
  alias: { '@': resolve('src') },
});
const module = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
const actual = module.regressionResults();
const hash = createHash('sha256').update(JSON.stringify(actual)).digest('hex');
assert.equal(hash, fixture.sha256, 'Calculation results differ from the original source snapshot');
assert.equal(actual.results.find(row => row.text === 'الله').kebir.total, 66);
assert.equal(actual.results.find(row => row.text === 'بسم الله الرحمن الرحيم').kebir.total, 786);
console.log(`Source calculation regression verified: ${actual.results.length} text inputs and ${actual.hours.length} day/night hour cases.`);

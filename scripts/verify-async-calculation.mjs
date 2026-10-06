import assert from 'node:assert/strict';
import { build } from 'esbuild';

const bundled = await build({ entryPoints: ['src/lib/asyncProcessor.js'], bundle: true, write: false, platform: 'node', format: 'esm' });
const module = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
assert.equal((await module.processTextAsync('الله')).total, 66);
assert.equal((await module.processTextAsync('بسم الله الرحمن الرحيم')).total, 786);
assert.equal((await module.processTextAsync('اللَّهُ')).total, 66);
assert.equal((await module.processTextAsync('ا'.repeat(1100))).total, 1100);
assert.equal((await module.processTextAsync('')).total, 0);
console.log('Async calculation imports, Arabic diacritics and chunk processing verified.');

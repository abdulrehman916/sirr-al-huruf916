import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/data/birhatiahOnlineNumericalComparison.json', import.meta.url), 'utf8'));
const sum = items => items.reduce((n, value) => n + value, 0);
assert.match(data.source_url, /^https:\/\//);
assert.equal(data.entries.length, 28, 'Exactly 28 names required');
assert.equal(new Set(data.entries.map(e => e.name_id)).size, 28, 'IDs must not repeat');
for (let i = 0; i < 28; i++) {
  const entry = data.entries[i];
  assert.equal(entry.name_id, `HNK-MHC-${String(i + 1).padStart(3, '0')}`);
  assert.ok(entry.arabic_original && /[\u0600-\u06ff]/.test(entry.arabic_original));
  assert.equal(Number.isInteger(entry.abjad_reported), true);
  assert.equal(entry.count_kind, 'abjad', 'Do not confuse Abjad with recitation count');
  assert.equal(entry.has_printed_harakat, false, 'Do not invent vowels absent in web source');
  const perName = new URL(`../content/source-checked/${entry.name_id}.json`, import.meta.url);
  assert.equal(existsSync(perName), true, `Missing existing source-checked card ${entry.name_id}`);
  assert.equal(JSON.parse(readFileSync(perName, 'utf8')).name_id, entry.name_id);
}
assert.equal(sum(data.entries.map(e => e.abjad_reported)), 18636, 'Preserve source-listed Abjad values');
assert.equal(data.collective.reported_sum, 18587, 'Preserve source claimed total separately');
for (const [label, grid, width] of [
  ['triangle', data.collective.triangle, 3],
  ['square', data.collective.square, 4],
]) {
  assert.equal(grid.length, width, label);
  for (const row of grid) assert.equal(row.length, width, label);
}
assert.equal(data.collective.triangle[1][2], 6139, 'Preserve original forum typo for attribution');
const printedRows = data.collective.triangle.map(sum);
assert.notEqual(printedRows[1], printedRows[0], 'Warn when forum grid is not mathematically consistent');
const outer = data.collective.square.map(sum);
assert.notEqual(outer[0], outer[1], 'Warn on 4x4 source discrepancy');
console.log('PASS: 28 name variants, source cards, Abjad-only labels and both uncorrected printed grids.');

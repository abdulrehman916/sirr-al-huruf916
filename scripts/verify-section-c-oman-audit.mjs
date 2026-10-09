import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = JSON.parse(readFileSync('src/data/birhatiahOmanBook2026.json', 'utf8'));
assert.equal(source.notes.length, 4);
assert.deepEqual(source.notes.map(n => n.pdf_page), [40,87,91,94]);
assert.deepEqual(source.notes.map(n => n.printed_page), [36,83,87,90]);
assert.equal(source.notes[2].continuation_pdf_page, 92);
assert.equal(source.indexed_pending_visual_review.length, 4);
console.log('PASS: Section C Oman record inventory checked');

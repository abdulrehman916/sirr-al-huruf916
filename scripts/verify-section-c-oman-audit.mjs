import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = JSON.parse(readFileSync('src/data/birhatiahOmanBook2026.json', 'utf8'));
assert.equal(source.notes.length, 4);
assert.equal(source.indexed_pending_visual_review.length, 4);
console.log('PASS: Section C Oman record inventory checked');

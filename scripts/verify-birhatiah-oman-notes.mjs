import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const load = path => readFileSync(new URL(path, root), 'utf8');
const data = JSON.parse(load('src/data/birhatiahOmanBook2026.json'));
const card = load('src/components/holynameknowledge/BirhatiahCollectiveCard.jsx');
const viewer = load('src/components/holynameknowledge/BirhatiahOmanBookNotes.jsx');
assert.match(card, /import BirhatiahOmanBookNotes from/);
assert.match(card, /<BirhatiahOmanBookNotes\s*\/>/);
assert.match(viewer, /data-testid="birhatiah-oman-book-notes"/);
assert.equal(data.notes.filter(n=>n.id==='oman-p83')[0].counts[0].kind,'qalnahud_recitation');
assert.equal(data.notes.filter(n=>n.id==='oman-p83')[0].counts[0].value,195);
const session=data.notes.find(n=>n.id==='oman-p87-88');
assert.deepEqual(session.counts.map(x=>[x.kind,x.value]),[['collective_recitation',21],['khutir_name_recitation',11],['quran_ten_verses_reading',11],['session_repetition',3]]);
assert.equal(data.notes.find(n=>n.id==='oman-p36').counts[0].value,1);
assert.equal(data.notes.find(n=>n.id==='oman-p90').counts.length,0);
assert.equal(new Set(data.notes.map(n=>n.id)).size,data.notes.length);
for(const note of data.notes){assert.ok(note.title.ml && note.title.en && note.meaning.ml && note.meaning.en);assert.ok(note.printed_page && note.pdf_page);}
console.log('Oman notes: Card 29 integration and typed counts verified');

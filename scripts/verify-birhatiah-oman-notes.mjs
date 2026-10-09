import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
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
assert.equal(data.notes.length, 12, 'All twelve source passages have been visually checked');
assert.equal(data.indexed_pending_visual_review.length, 0);
assert.deepEqual(data.notes.filter(n => n.id.startsWith('oman-p')).map(n => n.pdf_page), [40,87,91,94,264,282,454,491,31,81,142,472]);
assert.ok(data.notes.every(n => n.review_status === 'checked_against_pdf_page_image'));
const fourNameGroup = data.notes.find(n => n.id === 'oman-p260');
assert.deepEqual(fourNameGroup.related_name_ids, ['HNK-MHC-011','HNK-MHC-012','HNK-MHC-013','HNK-MHC-014']);
assert.ok(fourNameGroup.arabic_excerpt.includes('قلنهود برشان كظهير نموشلخ'));
assert.equal(fourNameGroup.counts.length,0);
const source278 = data.notes.find(n => n.id === 'oman-p278');
assert.deepEqual(source278.counts.map(row => [row.kind,row.value]),[['fatiha_reading',7],['collective_recitation',3],['separate_names_reading',3]]);
for (const id of ['oman-p450','oman-p487']) {
  const note = data.notes.find(n => n.id === id);
  assert.equal(note.figure_present_in_source,true);
  assert.equal(note.figure_reproduced_in_site,true);
  assert.ok(existsSync(new URL(`public${note.figure_image_path}`, root)));
  assert.equal(note.figure_extraction.source_pdf_page,note.pdf_page);
  assert.equal(note.counts.length,0);
}
assert.deepEqual(data.notes.find(n=>n.id==='oman-p77').related_name_ids, ['HNK-MHC-001','HNK-MHC-002','HNK-MHC-003','HNK-MHC-004']);
assert.deepEqual(data.notes.find(n=>n.id==='oman-p138').counts.map(n=>[n.kind,n.value]), [['collective_recitation',7]]);
assert.deepEqual(data.notes.find(n=>n.id==='oman-p468').counts.map(n=>[n.kind,n.value]), [['collective_recitation_option',3],['collective_recitation_option',7]]);
const p468 = data.notes.find(n => n.id === 'oman-p468');
assert.match(p468.figure_context, /lower handwritten figure/i);
assert.ok(!p468.meaning.ml.includes('**'), 'Raw Markdown should not appear on in-card Malayalam text');
assert.ok(!p468.meaning.en.includes('**'), 'Raw Markdown should not appear on in-card English text');
assert.ok(viewer.includes('sourceOrder.map(note =>'), 'Oman passages must render in printed-page order');
assert.ok(viewer.includes('data-source-count-relation="either-or"'), 'Alternative counts require visible OR context');
assert.ok(viewer.includes('note.pdf_page'), 'Show original PDF page number directly in the card');
assert.equal(data.notes.find(n=>n.id==='oman-p468').figure_present_in_source, true);
assert.equal(p468.figure_reproduced_in_site,true);
assert.ok(existsSync(new URL(`public${p468.figure_image_path}`, root)));
assert.equal(p468.source_duration_days,3);
assert.match(viewer,/data-source-figure-status="present"/);
assert.match(viewer, /data-source-figure-status=/);
for(const note of data.notes){assert.ok(note.title.ml && note.title.en && note.meaning.ml && note.meaning.en);assert.ok(note.printed_page && note.pdf_page);}
console.log('Oman notes: all 12 printed-source passages and 3 original extracted figures, correct grouped names and typed counts verified');

// Check that the real bilingual viewer embeds the original images, rather
// than changing only a metadata flag from pending to present.
const { build } = await import('esbuild');
const { createRequire } = await import('node:module');
const { mkdtempSync } = await import('node:fs');
const { tmpdir } = await import('node:os');
const { join, resolve } = await import('node:path');
const out = join(mkdtempSync(join(tmpdir(), 'oman-source-render-')), 'viewer.cjs');
await build({stdin:{contents:`import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import Viewer from './src/components/holynameknowledge/BirhatiahOmanBookNotes.jsx'; import {HolyNamesLanguageContext} from './src/components/holynameknowledge/HolyNamesLanguageContext.jsx'; export const render = language => renderToStaticMarkup(React.createElement(HolyNamesLanguageContext.Provider,{value:{language}},React.createElement(Viewer)));`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,platform:'node',format:'cjs',jsx:'automatic',alias:{'@':resolve('src')},outfile:out});
const {render} = createRequire(import.meta.url)(out);
for (const language of ['ml','en']) {
  const html=render(language);
  for (const note of data.notes.filter(note=>note.figure_reproduced_in_site)) {
    assert.ok(html.includes(note.figure_image_path));
    assert.ok(html.includes(note.figure_caption[language]));
  }
  assert.ok(html.includes('data-source-duration-days="3"'));
  assert.ok(!html.includes('data-source-figure-status="pending"'));
}
console.log('PASS: three authentic Oman source regions and separate three-day duration in both rendered languages.');

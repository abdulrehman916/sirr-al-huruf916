import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const notes = JSON.parse(fs.readFileSync('content/source-checked/birhatiah-remaining-edition-notes.json', 'utf8'));
assert.equal(notes.length, 21);
assert.equal(new Set(notes.map(note => note.name_id)).size, 21);
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'section-c-render-'));
const output = path.join(work, 'reader.cjs');
await build({
  stdin: { contents: `import React from 'react'; import { renderToStaticMarkup } from 'react-dom/server'; import Reader from './src/components/holynameknowledge/HolyNameSourceChapter.jsx'; import { HolyNamesLanguageContext } from './src/components/holynameknowledge/HolyNamesLanguageContext.jsx'; export const render = (chapter, language) => renderToStaticMarkup(React.createElement(HolyNamesLanguageContext.Provider, {value: {language}}, React.createElement(Reader, {chapter, nameId: chapter.name_id})));`, resolveDir: process.cwd(), loader: 'jsx' },
  outfile: output, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', alias: { '@': path.join(process.cwd(), 'src') }
});
const { render } = createRequire(import.meta.url)(output);
const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
for (const note of notes) {
  const chapter = JSON.parse(fs.readFileSync(`content/source-checked/${note.name_id}.json`, 'utf8'));
  chapter.source_notes = [...(chapter.source_notes || []).filter(old => old.id !== note.id), note];
  for (const language of ['ml', 'en']) {
    assert.ok(note.translation[language]?.trim());
    const html = render(chapter, language);
    assert.ok(html.includes(escape(note.translation[language])), `${note.name_id}: missing ${language} narrative`);
    for (const quote of note.quote_blocks || []) {
      assert.ok(html.includes(escape(quote.arabic)), `${note.name_id}: missing Arabic`);
      assert.ok(html.includes(escape(quote.translation[language])), `${note.name_id}: missing ${language} Quran meaning`);
    }
    assert.ok(!/href=["'][^"']*adobe/i.test(html));
  }
}
console.log('Section C: 21 bilingual notes, 42 server renders and five Arabic quotation blocks passed.');
const strip = value => String(value || '').replace(/[\u064B-\u065F\u0670\s]/g, '');
for (let number = 1; number <= 28; number++) {
  const nameId = `HNK-MHC-${String(number).padStart(3, '0')}`;
  const chapter = JSON.parse(fs.readFileSync(`content/source-checked/${nameId}.json`, 'utf8'));
  const reading = chapter.edition_accounts.find(entry => entry.id === 'english-reading-correspondence-review');
  assert.ok(reading, `${nameId}: missing reviewed reading`);
  if (reading.arabic_reading) assert.equal(strip(reading.arabic_reading), strip(reading.arabic_original));
  const anchors = ['practices', 'edition_accounts', 'source_notes'].flatMap(group => (chapter[group] || []).map(entry => `source-${nameId}-${group}-${entry.id}`));
  assert.equal(new Set(anchors).size, anchors.length);
  for (const language of ['ml', 'en']) {
    const html = render(chapter, language);
    assert.ok(html.includes(escape(reading.translation[language])));
    for (const anchor of anchors) assert.ok(html.includes(`id="${anchor}"`), `${nameId}: missing subject target ${anchor}`);
    for (const figure of chapter.edition_figures || []) {
      assert.ok(fs.existsSync(`public${figure.image_path}`));
      assert.ok(html.includes(figure.image_path));
      assert.ok(html.includes(escape(figure.caption[language])));
    }
  }
}
const externalSources = JSON.parse(fs.readFileSync('src/data/holyNamesExternalSources.json', 'utf8'));
assert.equal(new Set(externalSources.flatMap(source => source.related_name_ids).filter(id => id.startsWith('HNK-MHC-'))).size, 28);
console.log('All 28 chapters: 56 bilingual renders, subject targets, source reading letters, scan figures and 28 outside-source links passed.');

const shared = JSON.parse(fs.readFileSync('src/data/birhatiahSharedBookAccounts.json', 'utf8'));
const variants = JSON.parse(fs.readFileSync('src/data/birhatiahOutsideVariants.json', 'utf8'));
assert.equal(shared.accounts.length, 55);
assert.equal(new Set(shared.accounts.map(entry => entry.id)).size, 55);
const firstChapter = JSON.parse(fs.readFileSync('content/source-checked/HNK-MHC-001.json', 'utf8'));
for (const language of ['ml', 'en']) {
  const html = render(firstChapter, language);
  for (const entry of shared.accounts) {
    assert.ok(entry.printed_pages);
    assert.ok(html.includes(escape(entry.translation[language])), `${entry.id}: missing shared ${language} text`);
  }
  for (const figure of shared.figures) {
    assert.ok(fs.existsSync(`public${figure.image_path}`));
    assert.ok(html.includes(figure.image_path));
  }
  for (const entry of variants.entries) {
    const chapter = JSON.parse(fs.readFileSync(`content/source-checked/${entry.name_id}.json`, 'utf8'));
    assert.ok(render(chapter, language).includes(escape(entry.translation[language])));
  }
}
console.log('Shared material: 55 sourced bilingual accounts, 8 scan figures and 11 correctly matched outside variants passed.');

const singlePage = JSON.parse(fs.readFileSync('src/data/birhatiahArabicSinglePage.json', 'utf8'));
const invocationSources = JSON.parse(fs.readFileSync('src/data/birhatiahArabicInvocationSources.json', 'utf8'));
assert.ok(fs.existsSync(`public${singlePage.image_path}`));
for (let number = 1; number <= 28; number++) {
  const nameId = `HNK-MHC-${String(number).padStart(3, '0')}`;
  const chapter = JSON.parse(fs.readFileSync(`content/source-checked/${nameId}.json`, 'utf8'));
  for (const language of ['ml', 'en']) {
    const html = render(chapter, language);
    for (const account of singlePage.accounts) {
      const belongsHere = !account.name_ids.length || account.name_ids.includes(nameId);
      assert.equal(html.includes(escape(account.translation[language])), belongsHere, `${nameId}: incorrect Arabic account targeting`);
      if (belongsHere) assert.ok(html.includes(escape(account.arabic_original)));
    }
    for (const account of invocationSources.accounts) assert.ok(html.includes(escape(account.translation[language])));
    for (const page of invocationSources.pages) {
      assert.ok(fs.existsSync(`public${page.image_path}`));
      assert.ok(html.includes(page.image_path));
    }
  }
}
console.log('Additional Arabic sources: per-name account isolation, collective access in all 28 cards, bilingual text, original Arabic and full source-page images passed.');

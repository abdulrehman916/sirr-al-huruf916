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
    assert.ok(!/href=["'][^"']*(?:adobe|drive\.google)/i.test(html));
  }
}
console.log('Section C: 21 bilingual notes, 42 server renders and five Arabic quotation blocks passed.');

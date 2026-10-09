import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const chapters = JSON.parse(fs.readFileSync('src/data/holyNamesTilimsaniChapters.json', 'utf8'));
const research = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBResearch.json', 'utf8'));
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'section-b-reader-'));
try {
  const output = path.join(work, 'reader.cjs');
  await build({ stdin: { contents: `import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server';
    import Reader from './src/components/holynameknowledge/HolyNameSectionBReader.jsx';
    import {HolyNamesLanguageContext as Context} from './src/components/holynameknowledge/HolyNamesLanguageContext.jsx';
    export const render=(chapter,nameId,language)=>renderToStaticMarkup(React.createElement(Context.Provider,{value:{language}},React.createElement(Reader,{chapter,nameId})));`, resolveDir: process.cwd(), loader: 'jsx' }, outfile: output, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', alias: { '@': path.resolve('src') } });
  const { render } = createRequire(import.meta.url)(output);
  const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  for (const [id, chapter] of Object.entries(chapters)) {
    for (const language of ['ml', 'en']) {
      const html = render(chapter, id, language);
      assert.ok(html.includes('data-testid="section-b-reader"'));
      for (const entry of chapter.practices) {
        assert.ok(html.includes(escape(entry.arabic_original)), `${id}: missing original ${entry.id}`);
        assert.ok(html.includes(escape(entry.translation[language])), `${id}: missing translation ${entry.id}`);
      }
      assert.ok(html.includes(escape(chapter.scope_note[language])));
      assert.ok(html.includes(escape(chapter.edition_note[language])));
      assert.ok(!html.includes('birhatiah-reader-guide'));
      if (research[id]) {
        const profile = research[id];
        for (const group of ['evidence', 'scholarly', 'topics']) for (const entry of profile[group]) {
          assert.ok(html.includes(escape(entry.translation[language])));
          assert.ok(html.includes(entry.source_url));
          assert.equal(entry.review_status, 'checked_against_digital_text');
        }
        assert.ok(html.indexOf('data-section-b-group="scholarly"') < html.indexOf('data-section-b-group="topics"'));
        assert.ok(html.indexOf('data-section-b-group="topics"') < html.indexOf('data-section-b-group="book"'));
        assert.equal(profile.topics[0].count, null);
        assert.ok(!html.includes(profile.coverage[language === 'ml' ? 'en' : 'ml']));
      }
    }
  }
  assert.equal(render(chapters['PDF-HN-001'], 'PDF-HN-999', 'ml'), '');
  const unsafe = structuredClone(chapters['PDF-HN-002']);
  unsafe.practices[0].arabic_original = '<script>alert(1)</script>';
  assert.ok(!render(unsafe, unsafe.name_id, 'ml').includes('<script>'));
  const page = fs.readFileSync('src/pages/HolyOneDetailPage.jsx', 'utf8');
  assert.ok(page.includes('<HolyNameSectionBReader') && !page.includes('<HolyNameSourceChapter'));
  assert.ok(page.includes('sequence !== loadSequence.current'));
} finally { fs.rmSync(work, { recursive: true, force: true }); }
console.log('PASS: every Section B chapter paragraph in both languages, separate Quran/scholar/topic/book sections, name isolation, no invented count, source attribution and escaped text.');

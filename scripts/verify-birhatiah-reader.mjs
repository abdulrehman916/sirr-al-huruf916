import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const guides = JSON.parse(fs.readFileSync('src/data/birhatiahReaderGuide.json', 'utf8'));
assert.equal(Object.keys(guides).length, 28);
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'birhatiah-guide-'));
const output = path.join(work, 'reader.cjs');
await build({ stdin: { contents: `import React from 'react'; import { renderToStaticMarkup } from 'react-dom/server'; import Reader from './src/components/holynameknowledge/HolyNameSourceChapter.jsx'; import Collective from './src/components/holynameknowledge/BirhatiahCollectiveVersion.jsx'; import { HolyNamesLanguageContext } from './src/components/holynameknowledge/HolyNamesLanguageContext.jsx'; export const render = (chapter, language) => renderToStaticMarkup(React.createElement(HolyNamesLanguageContext.Provider, { value: {language} }, chapter ? React.createElement(Reader, { chapter, nameId: chapter.name_id }) : React.createElement(Collective)));`, resolveDir: process.cwd(), loader: 'jsx' }, outfile: output, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', alias: {'@': path.join(process.cwd(), 'src')} });
const {render} = createRequire(import.meta.url)(output);
for (const [id, guide] of Object.entries(guides)) {
  const chapter = JSON.parse(fs.readFileSync(`content/source-checked/${id}.json`, 'utf8'));
  assert.ok(['practices', 'source_notes', 'edition_accounts'].flatMap(key => chapter[key] || []).some(entry => entry.id === guide.source_entry), `${id}: unlinked method`);
  for (const language of ['ml', 'en']) {
    for (const method of guide.other_methods || []) {
      const sourceChapter = JSON.parse(fs.readFileSync(`content/source-checked/${method.source_name_id || id}.json`, 'utf8'));
      assert.ok(['practices', 'source_notes', 'edition_accounts'].flatMap(key => sourceChapter[key] || []).some(entry => entry.id === method.source_entry), `${id}: additional method lacks source`);
      assert.ok(method.steps[language]?.length && method.title[language] && method.benefit[language]);
      if (method.figure) assert.ok(fs.existsSync(`public${method.figure.image_path}`));
    }
    assert.ok(guide.steps[language].length && guide.title[language] && guide.benefit[language]);
    const html = render(chapter, language);
    const split = html.indexOf('<details class="rounded-xl border border-white/15 p-4 space-y-4" data-reader-section="references"');
    assert.ok(split > 0, `${id}: references must be collapsed`);
    const primary = html.slice(0, split);
    assert.ok(primary.indexOf('data-reader-section="formula"') < primary.indexOf('data-reader-section="method"'));
    assert.ok(!primary.includes('data-reader-section="references"'));
    assert.ok(!primary.includes('28 പേരുകൾക്കുള്ള സംയുക്തവും അനുബന്ധവുമായ ഗ്രന്ഥവിവരങ്ങൾ'));
    assert.ok(!primary.includes('SourceSubjects'));
    for (const method of guide.other_methods || []) assert.ok(primary.includes(`data-source-entry="${method.source_entry}"`));
    if (guide.spoken_request) assert.ok(primary.includes(guide.spoken_request.arabic));
    if (id === 'HNK-MHC-017') assert.ok(primary.includes('/figures/qazmaz-english-p129.png'));
    if (id === 'HNK-MHC-004') assert.ok(primary.includes('59:21') && primary.includes('59:24'));
    if (id === 'HNK-MHC-010') assert.ok(primary.includes('86:1') && primary.includes('86:17'));
    if (id === 'HNK-MHC-027') assert.ok(primary.includes('1:1') && primary.includes('1:7'));
    assert.ok(!primary.includes('mundhiri-collective-241-242'));
    if (id === 'HNK-MHC-021') {
      assert.ok(primary.includes('20:69') && primary.includes('10:81'));
      assert.ok(primary.includes('/figures/kaydahula-manba-p72.svg'));
      assert.ok(primary.includes(language === 'ml' ? 'ഇത് എഴുത്തിന്റെ എണ്ണമാണ്' : 'This counts inscriptions'));
    }
    if (id === 'HNK-MHC-028') assert.ok(primary.includes(language === 'ml' ? 'ഈ പേര് ഒറ്റയ്ക്ക് ചൊല്ലാനുള്ള എണ്ണമല്ല' : 'not a count for this name alone'));
  }
}
for (const language of ['ml', 'en']) {
  const html = render(null, language);
  assert.ok(html.indexOf('data-reader-section="formula"') < html.indexOf('data-reader-section="yasin-method"'));
  assert.ok(html.indexOf('data-reader-section="yasin-method"') < html.indexOf('data-reader-section="seven-day-method"'));
  assert.ok(html.indexOf('data-reader-section="extended-prayer"') < html.indexOf('data-reader-section="references"'));
  assert.ok(!/<details[^>]+data-reader-section="references"[^>]*\bopen/.test(html));
}
const version = JSON.parse(fs.readFileSync('src/data/birhatiahCollectiveVersion.json', 'utf8'));
assert.equal(version.arabic_short_continuation_source.printed_page, 75);
assert.ok(render(null, 'ml').includes(version.arabic_short_continuation));
const collectiveCard = fs.readFileSync('src/components/holynameknowledge/BirhatiahCollectiveCard.jsx', 'utf8');
assert.ok(collectiveCard.includes('data-order-index="29"') && collectiveCard.includes('birhatiah-mantra-029'));
const verses = JSON.parse(fs.readFileSync('src/data/birhatiahMethodVerses.json', 'utf8'));
for (const [id, count] of [['1:1-7', 7], ['86:1-17', 17], ['59:21-24', 4]]) {
  assert.equal(verses[id].verses.length, count);
  assert.equal(new Set(verses[id].verses.map(verse => verse.reference)).size, count);
  assert.ok(verses[id].verses.every(verse => verse.arabic && verse.translation.ml && verse.translation.en));
}
console.log('Reader guide: 28 source-linked methods, 56 bilingual renders, collapsed references, inscription/recitation separation and collective method ordering passed.');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const guides = JSON.parse(fs.readFileSync('src/data/birhatiahReaderGuide.json', 'utf8'));
assert.equal(Object.keys(guides).length, 28);
const blogGlosses = JSON.parse(fs.readFileSync('src/data/birhatiahOutsideGlosses2012.json', 'utf8'));
assert.equal(blogGlosses.entries.length, 28, 'The outside blog glosses must cover all 28 names');
assert.equal(new Set(blogGlosses.entries.map(entry => entry.name_id)).size, 28);
assert.equal(blogGlosses.verification_status, 'unverified_linguistic_meaning');
const verseGroups = JSON.parse(fs.readFileSync('src/data/birhatiahMethodVerses.json', 'utf8'));
for (const [group, surah, count] of [['36:1-83', 36, 83], ['105:1-5', 105, 5]]) {
  assert.equal(verseGroups[group].verses.length, count);
  verseGroups[group].verses.forEach((verse, i) => {
    assert.equal(verse.reference, `${surah}:${i + 1}`);
    assert.ok(verse.arabic && verse.translation.ml && verse.translation.en);
  });
}
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
      assert.ok(method.external_source?.url?.startsWith('https://') && method.external_source.checked_on || ['practices', 'source_notes', 'edition_accounts'].flatMap(key => sourceChapter[key] || []).some(entry => entry.id === method.source_entry), `${id}: additional method lacks source`);
      assert.ok(method.steps[language]?.length && method.title[language] && method.benefit[language]);
      if (method.figure) assert.ok(fs.existsSync(`public${method.figure.image_path}`));
    }
    assert.ok(guide.steps[language].length && guide.title[language] && guide.benefit[language]);
    const html = render(chapter, language);
    const split = html.indexOf('data-reader-section="references"');
    assert.ok(split > 0, `${id}: source references must appear inside the card`);
    assert.ok(html.includes('data-reader-layout="inline"'), `${id}: source references are not inline`);
    assert.ok(html.includes('data-reader-content="inline-source-material"'), `${id}: source content unavailable`);
    assert.ok(html.includes('data-testid="birhatiah-inline-book-pages"'), `${id}: original pages missing from the card`);
    assert.ok(!html.includes('<details'), `${id}: nested sections still conceal source material`);
    const linkedPages = JSON.parse(fs.readFileSync('src/data/birhatiahFullSourceChapter.json', 'utf8')).name_pages[id] || [];
    for (const printedPage of linkedPages) {
      assert.ok(html.includes(`data-source-page="${printedPage}"`), `${id}: source page ${printedPage} not inline`);
      assert.ok(html.includes(`/figures/birhatiah-manba-p${printedPage}.png`));
    }
    const primary = html.slice(0, split);
    assert.ok(primary.indexOf('data-reader-section="formula"') < primary.indexOf('data-reader-section="method"'));
    assert.ok(!primary.includes('data-reader-section="references"'));
    assert.ok(!primary.includes('28 പേരുകൾക്കുള്ള സംയുക്തവും അനുബന്ധവുമായ ഗ്രന്ഥവിവരങ്ങൾ'));
    assert.ok(!primary.includes('SourceSubjects'));
    assert.ok(!primary.includes('ബന്ധപ്പെട്ട ദുആകളും അർഥവുമായി ബന്ധപ്പെട്ട വചനങ്ങളും'));
    assert.ok(!primary.includes('data-reader-section="duas"'));
    assert.ok(primary.includes('data-reader-section="name-details"'));
    if (id === 'HNK-MHC-010') {
      assert.ok(html.includes('data-source-note="oman-p87-88"'), 'C10: Oman collective Khutir reference absent');
      assert.ok(!html.includes('data-source-note="oman-p83"'), 'C10: Qalnahud passage must not be assigned to Khutir');
    }
    if (id === 'HNK-MHC-011') {
      assert.ok(html.includes('data-source-note="oman-p83"'), 'C11: Oman Qalnahud 195 passage absent');
      assert.ok(!html.includes('data-source-note="oman-p87-88"'), 'C11: Khutir 11 passage must not be assigned to Qalnahud');
    }
    if (!['HNK-MHC-010', 'HNK-MHC-011'].includes(id)) {
      assert.ok(!html.includes('data-testid="birhatiah-oman-name-references"'), `${id}: unrelated Oman name-specific claim`);
    }
    assert.ok(primary.includes('data-testid="birhatiah-session-tools"'), `${id}: personal session tool missing`);
    assert.ok(primary.includes('data-timer-kind="personal-session"'), `${id}: personal and source times conflated`);
    const externalGloss = blogGlosses.entries.find(entry => entry.name_id === id);
    assert.ok(externalGloss && primary.includes('data-reader-section="external-gloss-2012"'), `${id}: attributed blog gloss missing`);
    assert.ok(primary.includes(externalGloss.translation[language]), `${id}: translated outside gloss missing`);
    assert.ok(primary.includes('heshammamdouh.blogspot.com/2012/01/28.html'));
    const allMethods = [guide, ...(guide.other_methods || [])];
    assert.equal(new Set(allMethods.map(method => method.method_id)).size, allMethods.length);
    for (const method of allMethods) assert.ok(primary.includes(`id="${id}-${method.method_id}"`), `${id}: full method must be embedded in the card`);
    for (const method of guide.other_methods || []) assert.ok(primary.includes(`data-source-entry="${method.source_entry}"`));
    if (guide.spoken_request) assert.ok(primary.includes(guide.spoken_request.arabic));
    for (const method of allMethods) {
      if (method.spoken_request?.arabic_reading) {
        const strip = text => text.replace(/[\u064B-\u065F\u0670\u0640\s]/g, '');
        assert.equal(strip(method.spoken_request.arabic_reading), strip(method.spoken_request.arabic));
      }
      if (method.source_pages) for (const page of method.source_pages) assert.ok(fs.existsSync(`public/figures/birhatiah-manba-p${page}.png`));
    }
    if (id === 'HNK-MHC-017') assert.ok(primary.includes('/figures/qazmaz-english-p129.png'));
    if (id === 'HNK-MHC-004') assert.ok(primary.includes('59:21') && primary.includes('59:24'));
    if (id === 'HNK-MHC-004') {
      assert.ok(guide.steps.ml.some(step => step.includes('ഏഴ് ഹംസ')));
      assert.ok(guide.other_methods.some(method => method.steps.ml.some(step => step.includes('അഞ്ച് ഹംസ'))));
      assert.ok(chapter.practices.find(entry => entry.id === 'protection-five').arabic_original.includes('وسبع همزات'));
    }
    if (id === 'HNK-MHC-010') assert.ok(primary.includes('86:1') && primary.includes('86:17'));
    if (id === 'HNK-MHC-027') assert.ok(primary.includes('1:1') && primary.includes('1:7'));
    assert.ok(!primary.includes('mundhiri-collective-241-242'));
    if (id === 'HNK-MHC-021') {
      assert.ok(primary.includes('data-reader-section="tijan-text"'));
      assert.ok(primary.includes('/figures/birhatiah-manba-p88.png') && primary.includes('/figures/birhatiah-manba-p89.png'));
      assert.ok(!primary.includes('വേറിട്ട പരാമർശമാണിത്') && !primary.includes('A separate account describes'));
      assert.ok(primary.includes('20:69') && primary.includes('10:81'));
      assert.ok(primary.includes('/figures/kaydahula-manba-p72.svg'));
      assert.ok(primary.includes(language === 'ml' ? 'ഇത് എഴുത്തിന്റെ എണ്ണമാണ്' : 'This counts inscriptions'));
    }
    if (id === 'HNK-MHC-028') {
      assert.ok(primary.includes(language === 'ml' ? 'ഈ പേര് ഒറ്റയ്ക്ക് ചൊല്ലാനുള്ള എണ്ണമല്ല' : 'not a count for this name alone'));
      assert.ok(primary.includes('36:1') && primary.includes('36:83'));
      assert.ok(primary.includes('data-reader-section="all-names-text"'));
    }
    if (id === 'HNK-MHC-017') assert.ok(primary.includes('data-reader-section="inline-collective-formula"'));
    if (id === 'HNK-MHC-018') assert.ok(primary.includes('105:1') && primary.includes('105:5'));
  }
}
for (const language of ['ml', 'en']) {
  const html = render(null, language);
  assert.ok(html.indexOf('data-reader-section="formula"') < html.indexOf('data-reader-section="yasin-method"'));
  assert.ok(html.indexOf('data-reader-section="yasin-method"') < html.indexOf('data-reader-section="seven-day-method"'));
  assert.ok(html.indexOf('data-reader-section="extended-prayer"') < html.indexOf('data-reader-section="references"'));
  assert.ok(!/<details/.test(html), 'Collective reader must show material inline');
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
console.log(`Reader guide: ${Object.values(guides).reduce((count, guide) => count + 1 + (guide.other_methods?.length || 0), 0)} purpose blocks in 28 cards, 56 bilingual renders, linked sources, scoped verses, inscription/recitation separation and collective ordering passed.`);

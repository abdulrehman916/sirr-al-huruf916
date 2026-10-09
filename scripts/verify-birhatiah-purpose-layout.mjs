import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { transform } from 'esbuild';

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const index = read('src/data/birhatiahOutsideMethods2023.json');
const guide = read('src/data/birhatiahReaderGuide.json');
const stripVowels = value => String(value || '').replace(/[\u064B-\u065F\u0670\u0640]/g, '');
const allIds = new Set(Object.keys(guide));
assert.equal(allIds.size, 28);
assert.match(index.source_url, /^https:\/\//);
assert.equal(index.methods.length, 3);

const methodIds = new Set();
for (const method of index.methods) {
  assert.ok(!methodIds.has(method.method_id), 'No two independent methods can overwrite one another');
  methodIds.add(method.method_id);
  assert.ok(method.related_name_ids.length >= 2);
  for (const id of method.related_name_ids) {
    assert.ok(allIds.has(id), `Invalid related Birhatiah name: ${id}`);
  }
  assert.equal(stripVowels(method.formula_arabic).replace(/\s+/g, ''), method.source_form_arabic.replace(/\s+/g, ''), `Source letters must match the reading form: ${method.method_id}`);
  assert.equal(Number.isInteger(method.count), true);
  assert.ok(method.steps.ml.length && method.steps.en.length);
  assert.ok(method.title.ml && method.title.en && method.benefit.ml && method.benefit.en);
  assert.ok(method.timing.ml && method.timing.en);
  assert.equal(method.external_source.url, index.source_url);
  assert.ok(method.external_source.checked_on);
}
assert.equal(index.methods.filter(x => x.related_name_ids.includes('HNK-MHC-001')).length, 1);
assert.equal(index.methods.filter(x => x.related_name_ids.includes('HNK-MHC-002')).length, 2);
assert.equal(index.methods.filter(x => x.related_name_ids.includes('HNK-MHC-023')).length, 1);
assert.equal(index.methods.filter(x => x.related_name_ids.includes('HNK-MHC-024')).length, 1);

const modulePath = pathToFileURL(path.join(root, 'src/lib/birhatiahSharedContent.js')).href;
const { collectSectionCShared, sectionCEntriesForCard } = await import(modulePath);
const cards = Array.from({length:28}, (_, i) => ({name_id:`HNK-MHC-${String(i+1).padStart(3,'0')}`,amal:[{text:'عَرَبِي',source_reference:'Book A',source_page:'1'}, {text:'عَرَبِي',source_reference:'Book B',source_page:'2'}]}));
const output = collectSectionCShared(cards);
assert.equal(output.byField.amal.length,2,'Different editions must stay separate');
assert.equal(output.keys.size,2,'Truly shared entries show in one collective position');
assert.equal(sectionCEntriesForCard(cards[0].amal,'amal',output.keys).length,0,'Shared entries must not repeat in 28 cards');
cards[27].amal[0].text='other text';
const subset=collectSectionCShared(cards);
assert.equal(subset.byField.amal.length,1,'28-card invariant for shared source');
assert.equal(sectionCEntriesForCard(cards[0].amal,'amal',subset.keys).length,1,'Nonshared entries remain on individual cards');
assert.equal(sectionCEntriesForCard([...cards[0].amal,...cards[0].amal],'amal',new Set()).length,2,'Exact imported duplicate dedup, no source conflation');

const source2020 = read('src/data/birhatiahOutsideMethods2020.json');
const source2023 = read('src/data/birhatiahOutsideMethods2023.json');
assert.equal(source2020.methods.length, 2, 'Two separate 2020 accounts are sourced');
assert.match(source2020.source_url, /^https:\/\//);
assert.equal(new Set([...source2020.methods, ...source2023.methods].map(item => item.method_id)).size, 5, 'Do not duplicate outside accounts');
const expected2020 = {'outside-2020-birhatya-request-622':['HNK-MHC-001',622], 'outside-2020-karir-distress-340':['HNK-MHC-002',340]};
for (const method of source2020.methods) {
  const [expectedName, expectedCount] = expected2020[method.method_id] || [];
  assert.deepEqual(method.related_name_ids, [expectedName]);
  assert.equal(method.count, expectedCount);
  assert.equal(method.count_kind, 'recitation');
  assert.equal(method.external_source.url, source2020.source_url);
  assert.ok(method.spoken_request?.arabic && method.spoken_request?.translation.ml && method.spoken_request?.translation.en);
  for (const language of ['ml','en']) {
    assert.ok(method.title[language] && method.benefit[language] && method.steps[language]?.length && method.timing[language]);
  }
  assert.equal(stripVowels(method.formula_arabic).replace(/\s+/g,''), method.source_form_arabic.replace(/\s+/g,''),
    'Do not change printed Arabic consonantal spelling while adding source-reviewed reading forms');
}
const omanBook = read('src/data/birhatiahOmanBook2026.json');
assert.equal(omanBook.notes.length, 8, 'Eight distinct Oman-book passages must remain separate');
assert.deepEqual(omanBook.notes.map(entry => entry.pdf_page), [40, 87, 91, 94, 264, 282, 454, 491]);
assert.ok(omanBook.notes.every(entry => entry.review_status === 'checked_against_pdf_page_image'));
assert.equal(omanBook.indexed_pending_visual_review.length, 0, 'All four indexed candidates have now had a visual source review');
assert.deepEqual(omanBook.notes.find(note => note.id === 'oman-p260').related_name_ids, ['HNK-MHC-011','HNK-MHC-012','HNK-MHC-013','HNK-MHC-014']);
assert.deepEqual(omanBook.notes.find(note => note.id === 'oman-p278').counts.map(c => [c.kind,c.value]), [['fatiha_reading',7],['collective_recitation',3],['separate_names_reading',3]]);
assert.ok(omanBook.notes.filter(note => note.figure_present_in_source).every(note => note.figure_reproduced_in_site === false));
const omanQalnahud = omanBook.notes.find(note => note.id === 'oman-p83');
assert.equal(omanQalnahud.counts[0].name_id, 'HNK-MHC-011');
assert.equal(omanQalnahud.counts[0].value, 195);
assert.ok(omanQalnahud.arabic_excerpt.includes('قلنهود') && omanQalnahud.arabic_excerpt.includes('195'));
const omanCollective = omanBook.notes.find(note => note.id === 'oman-p87-88');
assert.deepEqual(omanCollective.counts.map(entry => entry.value), [21, 11, 11, 3]);
assert.equal(omanCollective.counts.find(entry => entry.name_id)?.name_id, 'HNK-MHC-010');
assert.ok(omanCollective.source_scope.startsWith('collective_'), 'Embedded name count is not standalone');
const collectiveNotes = fs.readFileSync('src/components/holynameknowledge/BirhatiahCollectiveCard.jsx', 'utf8');
assert.ok(collectiveNotes.includes('<BirhatiahOmanBookNotes />'));
const referenceUI = fs.readFileSync('src/components/holynameknowledge/BirhatiahConciseReferences.jsx', 'utf8');
assert.ok(referenceUI.includes('<BirhatiahOmanNameReferences nameId={nameId} />'));
const omanNoteUI = fs.readFileSync('src/components/holynameknowledge/BirhatiahOmanBookNotes.jsx', 'utf8');
assert.ok(omanNoteUI.includes('data-source-index-status="needs-image-review"'));
await transform(omanNoteUI, {loader:'jsx',target:'es2022'});
await transform(fs.readFileSync('src/components/holynameknowledge/BirhatiahOmanNameReferences.jsx','utf8'), {loader:'jsx',target:'es2022'});

const oman = read('src/data/birhatiahOmanSquareP561.json');
assert.equal(oman.scope, 'collective_28_names', 'Source square belongs only in collective Section C');
assert.equal(oman.printed_page, 561);
assert.equal(oman.pdf_page, 565);
assert.equal(oman.numbers.length, 4);
assert.equal(oman.printed_minor_positions.length, 4);
assert.equal(new Set(oman.printed_minor_positions.flat()).size, 16);
assert.deepEqual([...oman.printed_minor_positions.flat()].sort((a,b)=>a-b), Array.from({length:16},(_,i)=>i+1));
const squareSum = values => values.reduce((a,b)=>a+b,0);
const squareLines = [
 ...oman.numbers.map(squareSum),
 ...oman.numbers[0].map((_, column) => squareSum(oman.numbers.map(row=>row[column]))),
 squareSum(oman.numbers.map((row,i)=>row[i])),
 squareSum(oman.numbers.map((row,i)=>row[row.length-i-1]))
];
assert.deepEqual(squareLines, Array(10).fill(18587), 'Printed Oman source square must retain a full valid row/column/diagonal constant');
const collectiveUI = fs.readFileSync(path.join(root,'src/components/holynameknowledge/BirhatiahCollectiveCard.jsx'),'utf8');
assert.ok(collectiveUI.includes('<BirhatiahOmanSquare />'), 'Store genuine printed square in collective card 29');
const omanComponent = fs.readFileSync(path.join(root,'src/components/holynameknowledge/BirhatiahOmanSquare.jsx'),'utf8');
await transform(omanComponent, {loader:'jsx',sourcefile:'BirhatiahOmanSquare.jsx',target:'es2022'});
const sourceChapter = fs.readFileSync(path.join(root,'src/components/holynameknowledge/HolyNameSourceChapter.jsx'),'utf8');
assert.ok(sourceChapter.includes('data-reader-section="topics"'));
assert.ok(sourceChapter.includes('additionalOutsideMethods.methods.filter(method => method.related_name_ids.includes(nameId))'));
assert.ok(sourceChapter.includes('newlyCheckedOutsideMethods.methods.filter(method => method.related_name_ids.includes(nameId))'));
assert.ok(sourceChapter.includes('<BirhatiahConciseReferences chapter={chapter} nameId={nameId} />'));
assert.ok(sourceChapter.includes('const [topicQuery, setTopicQuery] = useState'));
assert.ok(!sourceChapter.includes('We cast enmity and hatred between them'), 'Do not inject a fixed verse/translation for unrelated methods');
const langSelector=fs.readFileSync(path.join(root,'src/components/holynameknowledge/HolyNamesLanguageContext.jsx'),'utf8');
assert.ok(langSelector.includes('{ id: "ml", label: "മലയാളം" }'));
assert.ok(langSelector.includes('{ id: "en", label: "English" }'));
assert.ok(!langSelector.includes('{ id: "tr"'), 'Turkish must not appear in the language controls');
for (const file of [
  'src/components/holynameknowledge/SectionCNames.jsx',
  'src/components/holynameknowledge/HolyNameSourceChapter.jsx',
  'src/components/holynameknowledge/HolyNameEsotericResearchProfile.jsx',
  'src/components/holynameknowledge/BirhatiahConciseReferences.jsx',
  'src/components/holynameknowledge/BirhatiahSharedImportedMaterial.jsx',
  'src/components/holynameknowledge/BirhatiahOutsideVariants.jsx',
  'src/components/holynameknowledge/BirhatiahOnlineNumericalComparison.jsx',
  'src/components/holynameknowledge/BirhatiahCollectiveCard.jsx',
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  await transform(source, { loader: 'jsx', sourcefile: file, target: 'es2022' });
}
console.log('PASS: 28-card bilingual topics and source fidelity, variant-safe deduplication, concise references and JSX parsing.');

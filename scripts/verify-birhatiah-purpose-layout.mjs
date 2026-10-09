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

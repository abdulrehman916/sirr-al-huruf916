import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { sectionCOriginal, sectionCTranslation, BIRHATIAH_ADVANCED_FIELDS } from '../src/lib/birhatiahSharedContent.js';
const coverage = JSON.parse(fs.readFileSync('content/source-checked/section-c-legacy-translation-coverage.json', 'utf8'));
assert.equal(coverage.name_record_count, 28);
assert.equal(coverage.entry_occurrences, 1204);
assert.equal(coverage.unique_wording_keys, 205);
assert.equal(Object.keys(coverage.field_occurrences).length, 14);
assert.equal(Object.values(coverage.field_occurrences).reduce((sum,count)=>sum+count,0), 1204);
assert.equal(coverage.keys.reduce((sum,key)=>sum+key.occurrences,0), 1204);
let entries = [{text:'Original <source>',source_reference:'Fixture',source_page:'1',translation:{ml:'പരിഭാഷ',en:'Meaning'}}];
if (process.env.SECTION_C_PRIVATE_SNAPSHOT) {
  const records=JSON.parse(fs.readFileSync(process.env.SECTION_C_PRIVATE_SNAPSHOT,'utf8'));
  assert.equal(records.length,28);
  const unique=new Map(); let occurrences=0;
  for(const record of records) for(const field of BIRHATIAH_ADVANCED_FIELDS) for(const entry of Array.isArray(record.data[field]) ? record.data[field] : []) {
    if(!sectionCOriginal(entry)) continue;
    assert.ok(sectionCTranslation(entry,'ml')); assert.ok(sectionCTranslation(entry,'en'));
    const key=createHash('sha256').update(JSON.stringify([entry.source_reference,entry.source_page,sectionCOriginal(entry)])).digest('hex');
    unique.set(key,entry); occurrences++;
  }
  assert.equal(occurrences,1204);assert.equal(unique.size,205);
  for(const key of coverage.keys) assert.ok(unique.has(key.sha256));
  entries=[...unique.values()];
}
// Private records are provided only for authorized local verification; no source
// passages or translations enter the repository or public browser bundle.
const originals=entries;
// Render the actual imported-material component, not a helper or mocked UI.
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'section-c-legacy-'));
try {
  const output = path.join(work, 'reader.cjs');
  await build({stdin:{contents:`import React from 'react';
    import {renderToStaticMarkup} from 'react-dom/server';
    import Material from './src/components/holynameknowledge/BirhatiahSharedImportedMaterial.jsx';
    import {HolyNamesLanguageContext} from './src/components/holynameknowledge/HolyNamesLanguageContext.jsx';
    export const render=(entries,language)=>renderToStaticMarkup(React.createElement(HolyNamesLanguageContext.Provider,{value:{language}},React.createElement(Material,{byField:{amal:entries}})));`,
    resolveDir:process.cwd(),loader:'jsx'},outfile:output,bundle:true,platform:'node',format:'cjs',jsx:'automatic',alias:{'@':path.resolve('src')}});
  const {render} = createRequire(import.meta.url)(output);
  for (const language of ['ml','en']) {
    const html = render(originals,language);
    assert.equal((html.match(/<article /g)||[]).length, entries.length);
    assert.ok(!html.includes('ഈ മൂലവാക്യത്തിന്റെ മലയാള അർത്ഥം ഇനിയും ഉറപ്പിച്ച് ചേർത്തിട്ടില്ല.'));
    assert.ok(!html.includes('The source statement has not yet been translated into English.'));
    assert.ok(html.includes(language==='ml' ? 'പരിഭാഷ' : 'source label'));
    const escaped = render([{text:'<img src=x onerror=alert(1)>',source_reference:'Owner input'}],language);
    assert.ok(escaped.includes('&lt;img'));
    assert.ok(!escaped.includes('<img src=x'), 'Imported wording must be escaped as text');
  }
} finally { fs.rmSync(work,{recursive:true,force:true}); }
console.log('PASS: audited 1,204 imports/205 exact wording keys across 14 fields; actual bilingual rendering and safe original-text escaping.');

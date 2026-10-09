import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';
import legacy from '../src/data/birhatiahLegacyAmalTranslations.js';
import { build } from 'esbuild';
import { matchesSectionCSearch, sectionCMeaning } from '../src/lib/sectionCReaderState.js';
import { collectSectionCShared, sectionCEntriesForCard, sectionCOriginal, sectionCTranslation } from '../src/lib/birhatiahSharedContent.js';
assert.equal(legacy.entries.length, 40);
const legacyKeys = new Set();
for (const entry of legacy.entries) {
  const key = JSON.stringify([entry.source_reference, entry.source_page, entry.text]);
  assert.ok(!legacyKeys.has(key), 'Duplicate translation key');
  legacyKeys.add(key);
  const imported = {...entry}; delete imported.translation;
  assert.equal(sectionCTranslation(imported, 'ml'), entry.translation.ml);
  assert.equal(sectionCTranslation(imported, 'en'), entry.translation.en);
  assert.equal(sectionCTranslation({...imported, source_page:'wrong-page'}, 'en'), '', 'Never attach translation to a different page');
  assert.equal(sectionCTranslation({...imported, source_reference:'different-source'}, 'en'), '', 'Never attach translation to another book');
  assert.equal(sectionCTranslation({...imported, translation:{en:'Owner corrected translation'}}, 'en'), 'Owner corrected translation');
  assert.equal(sectionCOriginal(imported), entry.text, 'Never modify the imported original');
}
console.log('PASS: all 40 imported-wording translations in both languages, exact source/page matching, owner preference and original preservation.');
const card = { id: 'one', name_id: 'HNK-MHC-001', canonical_arabic_name: 'بَرْهَتِيَّة', exact_meaning_ml: 'അർത്ഥം', exact_meaning_en: 'Compassion', malayalam_transliteration: 'ബർഹത്തിയ്യ' };
for (const query of ['برهتية', 'COMPASSION', 'ബർഹത്തിയ്യ', 'hnk-mhc-001']) assert.ok(matchesSectionCSearch(card, query));
assert.ok(!matchesSectionCSearch(card, 'unrelated'));
assert.equal(sectionCMeaning(card, 'ml'), 'അർത്ഥം');
assert.equal(sectionCMeaning(card, 'en'), 'Compassion');
assert.equal(sectionCMeaning({ exact_meaning: 'Türkçe' }, 'en'), '');
const translated = { translation: { ml: 'അർത്ഥം', en: 'Meaning' }, source_reference: 'Book', source_page: '1' };
assert.equal(sectionCEntriesForCard([translated], 'amal').length, 1);
assert.equal(sectionCTranslation(translated, 'en'), 'Meaning');
assert.equal(sectionCOriginal({text: 'أَجِبْ (niyet)'}), 'أَجِبْ (niyet)');
const original = { arabic_original: 'برهتية', source_reference: 'Book', source_page: '1' };
assert.equal(sectionCEntriesForCard([original, {...original}], 'amal').length, 1);
assert.equal(sectionCEntriesForCard([original, {...original, source_page: '2'}, {...original, translation:{en:'Alternative'}}], 'amal').length, 3);
const cards = Array.from({length:28}, (_, i) => ({name_id:`n${i}`, amal:[translated]}));
const shared = collectSectionCShared(cards);
assert.equal(shared.byField.amal.length, 1);
assert.equal(sectionCEntriesForCard([translated], 'amal', shared.keys).length, 0);
assert.equal(collectSectionCShared(cards.slice(1)).keys.size, 0);

// Run the actual list's hooks with asynchronous records and saved UI state.
const bundle = await build({ entryPoints:['src/components/holynameknowledge/SectionCNames.jsx'], bundle:true, write:false, format:'iife', globalName:'List', jsx:'automatic', alias:{'@':path.resolve('src')}, plugins:[{name:'ui-harness', setup(b) {
  b.onResolve({filter:/^(react(?:\/jsx-runtime)?|framer-motion|lucide-react)$|platformClient|PageStateContext|HolyNameEsotericResearchProfile|HolyNameVerifiedKnowledge|BirhatiahCollectiveCard|HolyNamesLanguageContext/}, a => ({path:a.path, namespace:'harness'}));
  b.onLoad({filter:/.*/,namespace:'harness'}, a => ({contents:
    a.path === 'react' ? `export const useState = value => globalThis.hooks.state(value); export const useEffect = (fn,deps) => globalThis.hooks.effect(fn,deps); export const useMemo = fn => fn();` :
    a.path === 'react/jsx-runtime' ? `export const jsx=(type,props)=>({type,props}); export const jsxs=jsx;` :
    a.path === 'framer-motion' ? `export const motion={div:'motion.div'}; export const AnimatePresence='presence';` :
    a.path === 'lucide-react' ? `export const Search='search', X='x', ChevronDown='chevron', Loader2='loader', ShieldAlert='alert';` :
    a.path.includes('platformClient') ? `export const platform={entities:{HolyNameEsotericKnowledge:{list:()=>globalThis.request()}}};` :
    a.path.includes('PageStateContext') ? `export const usePageState=()=>globalThis.pageState;` :
    a.path.includes('LanguageContext') ? `export const useHolyNamesLanguage=()=>({language:'en'});` : `export default '${a.path}';`
  }));
}}] });
let states=[], effects=[], index=0, resolve, reject, requestCount=0;
let saved={query:'compassion', openId:'one', collectiveOpen:true};
const getPageState=()=>saved, setPageState=(_, value)=>{ saved={...saved,...value}; };
const hooks={state(value) {const i=index++; if(!(i in states)) states[i]=typeof value==='function'?value():value; return [states[i], next=>{states[i]=typeof next==='function'?next(states[i]):next;}];}, effect(fn,deps) {const i=index++; const old=effects[i]; if(!old || deps.some((d,j)=>!Object.is(d,old.deps[j]))) {old?.cleanup?.(); effects[i]={fn,deps,pending:true};}}};
const ctx={hooks,pageState:{getPageState,setPageState},request:()=>{requestCount++; return new Promise((yes,no)=>{resolve=yes;reject=no;});}};
vm.createContext(ctx); vm.runInContext(bundle.outputFiles[0].text,ctx);
const render=()=>{ index=0; const tree=ctx.List.default(); for(const e of effects) if(e?.pending){e.pending=false;e.cleanup=e.fn();} return tree; };
const flatten=t=>!t||typeof t!=='object'?[]:[t,...[t.props?.children].flat(Infinity).flatMap(flatten)];
render(); assert.equal(requestCount,1); resolve([card]); await new Promise(setImmediate);
let tree=render(); let nodes=flatten(tree);
assert.equal(nodes.find(n=>n.type==='input').props.value,'compassion');
assert.equal(nodes.find(n=>n.props?.['aria-controls']==='section-c-detail-HNK-MHC-001').props['aria-expanded'],true);
assert.equal(nodes.find(n=>String(n.type).includes('BirhatiahCollectiveCard')).props.open,true);
nodes.find(n=>n.props?.['aria-controls']==='section-c-detail-HNK-MHC-001').props.onClick(); render(); assert.equal(saved.openId,null);
// Remount uses persisted filters and collective expansion, rather than resetting.
for(const e of effects) e?.cleanup?.(); states=[];effects=[];render(); resolve([card]);await new Promise(setImmediate);tree=render();assert.equal(flatten(tree).find(n=>n.type==='input').props.value,'compassion');
flatten(tree).find(n=>n.type==='input').props.onChange({target:{value:'no-match'}});tree=render();assert.ok(!flatten(tree).some(n=>n.props?.['aria-controls']==='section-c-detail-HNK-MHC-001'));
// A failed request offers retry; another request can recover.
for(const e of effects) e?.cleanup?.();states=[];effects=[];render();reject(new Error('offline'));await new Promise(setImmediate);tree=render();let retry=flatten(tree).find(n=>n.props?.['data-testid']==='section-c-retry');assert.ok(retry);retry.props.onClick();render();resolve([card]);await new Promise(setImmediate);tree=render();assert.ok(flatten(tree).find(n=>n.type==='input'));
console.log('PASS: actual Section C search, saved card/collective state, remount, no results, API failure/retry, original text preservation and source-safe deduplication.');

// A successful Vite build alone does not catch out-of-scope variables such as
// the production TABS ReferenceError. Check the parent page before every build.
const { ESLint } = await import('eslint');
const lint = await new ESLint().lintFiles(['src/pages/MagicalHolyNamesPage.jsx']);
assert.equal(lint.flatMap(result => result.messages).filter(message => message.ruleId === 'no-undef').length, 0, 'Holy Names page has an undefined runtime reference');
console.log('PASS: Holy Names parent-page variable scope (including section selection).');

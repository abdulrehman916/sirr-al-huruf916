import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build, transform } from 'esbuild';
import vm from 'node:vm';
import {
  clampSessionMinutes, remainingSeconds, formatSessionSeconds,
  sourceCountLabel, sourceRecitationGoal,
} from '../src/lib/birhatiahSessionUtils.js';

assert.equal(clampSessionMinutes(0), 1);
assert.equal(clampSessionMinutes(301), 180);
assert.equal(clampSessionMinutes(10.6), 11);
assert.equal(clampSessionMinutes(NaN), 5);
assert.equal(remainingSeconds(12000, 10000), 2);
assert.equal(remainingSeconds(10000, 10100), 0);
assert.equal(remainingSeconds(null, 0), 0);
assert.equal(formatSessionSeconds(0), '00:00');
assert.equal(formatSessionSeconds(61), '01:01');
assert.equal(formatSessionSeconds(3661), '01:01:01');
assert.equal(sourceRecitationGoal(622, 'recitation'), 622);
assert.equal(sourceRecitationGoal(0, 'recitation'), null);
assert.equal(sourceRecitationGoal(622, 'abjad'), null);
assert.equal(sourceRecitationGoal(7, 'inscription'), null);
assert.equal(sourceRecitationGoal(100, undefined), null);
assert.match(sourceCountLabel('abjad', 'ml'), /പാരായണസംഖ്യയല്ല/);
assert.match(sourceCountLabel('inscription', 'en'), /inscription/);
assert.match(sourceCountLabel(null, 'ml'), /സ്ഥിരീകരിച്ചിട്ടില്ല/);

const component = readFileSync('src/components/holynameknowledge/BirhatiahSessionTools.jsx', 'utf8');
const reader = readFileSync('src/components/holynameknowledge/HolyNameSourceChapter.jsx', 'utf8');
const profile = readFileSync('src/components/holynameknowledge/HolyNameEsotericResearchProfile.jsx', 'utf8');
assert.ok(component.includes('data-timer-kind="personal-session"'));
assert.ok(component.includes('setInterval') && component.includes('clearInterval'));
assert.ok(component.includes('Date.now()') && component.includes('remainingSeconds(deadline.current)'));
assert.ok(component.includes('sourceRecitationGoal(sourceCount, sourceCountKind)'));
assert.ok(reader.includes('<BirhatiahSessionTools sourceCount={sourceCount} sourceCountKind={sourceCountKind} sessionKey={method.method_id} />'));
assert.ok(reader.includes('sourceCountLabel(sourceCountKind, language)'));
assert.ok(profile.includes('Abjad Value Squared (not a magic square)'));
assert.ok(profile.includes('അബ്ജദ് മൂല്യത്തിന്റെ വർഗം (വെഫ്ക് അല്ല)'));
assert.ok(!profile.includes('isOwner && Array.isArray(rec.sources)'), 'Bibliography must be public in Section C');
assert.ok(profile.includes('<Field label="Source Reference"'), 'Source citations must be visible');
assert.ok(profile.includes('isOwner && <Field label="Source Notes"'), 'Private owner notes must remain restricted');
assert.ok(component.includes('birhatiah-session-count:'), 'Manual reading count must be local and per-method');
await transform(component, {loader: 'jsx', target: 'es2022'});
console.log('PASS: personal timer math, manual counter guard, source count types, JSX parsing, and Abjad square separation.');

// Exercise the actual component with a controlled clock and storage. Helper
// arithmetic alone cannot verify start/pause effects or controlled input edits.
const bundle = await build({
  stdin: {contents: component, resolveDir: process.cwd(), loader: 'jsx'},
  bundle: true, write: false, format: 'iife', globalName: 'Session', jsx: 'automatic',
  plugins: [{name: 'session-harness', setup(builder) {
    builder.onResolve({filter: /^react(?:\/jsx-runtime)?$|HolyNamesLanguageContext|birhatiahSessionUtils/}, args => ({path: args.path, namespace: 'harness'}));
    builder.onLoad({filter: /.*/, namespace: 'harness'}, args => ({contents:
      args.path === 'react' ? `export const useState=v=>globalThis.hooks.state(v); export const useEffect=(f,d)=>globalThis.hooks.effect(f,d); export const useRef=v=>globalThis.hooks.ref(v);` :
      args.path === 'react/jsx-runtime' ? `export const jsx=(type,props)=>({type,props}); export const jsxs=jsx;` :
      args.path.includes('LanguageContext') ? `export const useHolyNamesLanguage=()=>({language:globalThis.language});` :
      readFileSync('src/lib/birhatiahSessionUtils.js', 'utf8')
    }));
  }}]
});
let states = [], effects = [], index = 0, now = 0, nextInterval = 0;
const intervals = new Map(), storage = new Map();
const hooks = {
  state(value) {const i=index++; if (!(i in states)) states[i]=typeof value==='function'?value():value; return [states[i], next=>{states[i]=typeof next==='function'?next(states[i]):next;}];},
  ref(value) {const i=index++; return states[i] ||= {current:value};},
  effect(fn,deps) {const i=index++; const old=effects[i]; if (!old || deps.some((d,j)=>!Object.is(d,old.deps[j]))) {old?.cleanup?.(); effects[i]={fn,deps,pending:true};}}
};
const context = {hooks, language:'en', Date:{now:()=>now},
  localStorage:{getItem:key=>storage.get(key) ?? null, setItem:(key,value)=>storage.set(key,value)},
  setInterval:fn=>{const id=++nextInterval;intervals.set(id,fn);return id;}, clearInterval:id=>intervals.delete(id)
};
vm.createContext(context); vm.runInContext(bundle.outputFiles[0].text,context);
const flatten = tree => !tree || typeof tree!=='object' ? [] : [tree,...[tree.props?.children].flat(Infinity).flatMap(flatten)];
const render = () => {index=0;const tree=context.Session.default({sessionKey:'method-one',sourceCount:7,sourceCountKind:'inscription'});for(const effect of effects) if(effect?.pending){effect.pending=false;effect.cleanup=effect.fn();}return flatten(tree);};
let nodes = render();
const button = label => nodes.find(node=>node.type==='button' && node.props.children===label);
const timer = () => nodes.find(node=>node.props?.role==='timer').props.children;
const input = () => nodes.find(node=>node.type==='input');
const tick = milliseconds => {now+=milliseconds;for(const fn of [...intervals.values()]) fn();nodes=render();};
assert.equal(timer(),'05:00');
assert.ok(!JSON.stringify(nodes).includes('Sourced reading target'), 'Inscription counts cannot become reading targets');
button('+1').props.onClick(); nodes=render();
assert.equal(storage.get('birhatiah-session-count:method-one'),'1');
button('−1').props.onClick(); nodes=render();
button('−1').props.onClick(); nodes=render();
assert.equal(storage.get('birhatiah-session-count:method-one'),'0');
input().props.onChange({target:{value:''}}); nodes=render();assert.equal(input().props.value,'');
input().props.onChange({target:{value:'12'}});nodes=render();input().props.onBlur();nodes=render();
assert.equal(timer(),'12:00');assert.equal(input().props.value,'12');
button('Start').props.onClick();nodes=render();assert.equal(intervals.size,1);assert.equal(input().props.disabled,true);
tick(3500);assert.equal(timer(),'11:57');
button('Pause').props.onClick();nodes=render();assert.equal(intervals.size,0);
tick(20000);assert.equal(timer(),'11:57');
input().props.onBlur();nodes=render();assert.equal(timer(),'11:57', 'Unchanged input blur must preserve paused time');
button('Start').props.onClick();nodes=render();tick(1000);assert.equal(timer(),'11:56');
button('Reset timer').props.onClick();nodes=render();assert.equal(intervals.size,0);assert.equal(timer(),'12:00');
input().props.onChange({target:{value:'999'}});nodes=render();input().props.onBlur();nodes=render();assert.equal(input().props.value,'180');
input().props.onChange({target:{value:'1'}});nodes=render();button('Start').props.onClick();nodes=render();
// Simulate a background tab without interval ticks; elapsed wall time wins.
tick(65000);assert.equal(timer(),'00:00');assert.equal(intervals.size,0);
assert.ok(nodes.some(node=>node.props?.role==='status' && node.props.children==='Personal timer finished'));
context.language='ml';nodes=render();assert.ok(nodes.some(node=>node.props?.role==='status' && node.props.children==='തിരഞ്ഞെടുത്ത സമയം പൂർത്തിയായി'));
button('ആരംഭിക്കുക').props.onClick();nodes=render();assert.equal(timer(),'01:00');assert.equal(intervals.size,1);
for(const effect of effects) effect?.cleanup?.();assert.equal(intervals.size,0, 'Unmount must cancel timer updates');
states=[];effects=[];nodes=render();assert.equal(timer(),'05:00', 'Timer resets on reopening');
assert.equal(storage.get('birhatiah-session-count:method-one'),'0');
console.log('PASS: actual counter storage, editable duration, limits, start/pause/resume/reset, background expiry, bilingual completion and interval cleanup.');

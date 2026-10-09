import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transform } from 'esbuild';
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
await transform(component, {loader: 'jsx', target: 'es2022'});
console.log('PASS: personal timer math, manual counter guard, source count types, JSX parsing, and Abjad square separation.');

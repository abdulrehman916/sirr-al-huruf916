import assert from 'node:assert/strict';
import { calculateAbjad } from '../src/lib/abjadValues.js';
import { HOLY_NAMES } from '../src/lib/magicalHolyNamesData.js';
import { getHolyNameAbjad } from '../src/lib/holyNameAbjad.js';

// The vowels between alif and lam used to stop removal of the article.
for (const [heading, withArticle, withoutArticle] of [
  ['الملك', 121, 90], ['اَلْمَلِكُ', 121, 90],
  ['اَلرَّحْمٰنُ', 329, 298], ['اَلرَّحِيْمُ', 289, 258],
  ['اسمه الله تبارك وتعالى', 66, 66], ['اللَّهُ', 66, 66],
  ['المحيط تبارك وتعالى', 98, 67], ['الْأَحْكَم', 100, 69],
  ['مالك الملك جل سلطانه', 91, 91],
]) {
  const value = getHolyNameAbjad(heading);
  assert.equal(value.withALValue, withArticle, heading);
  assert.equal(value.withoutALValue, withoutArticle, heading);
  assert.equal(value.withALSquare, withArticle ** 2, heading);
  assert.equal(value.withoutALSquare, withoutArticle ** 2, heading);
}
assert.equal(getHolyNameAbjad('   '), null);
assert.equal(getHolyNameAbjad(null), null);
assert.equal(getHolyNameAbjad('اَلْمَلِكُ').withAL, 'اَلْمَلِكُ');
assert.equal(getHolyNameAbjad('اَلْمَلِكُ').withoutAL, 'مَلِكُ');
console.log('Holy Name Abjad article, chapter-marker and display checks passed.');

assert.equal(calculateAbjad(HOLY_NAMES.find(name => name.id === 1).arabicName), 17);
assert.equal(calculateAbjad(HOLY_NAMES.find(name => name.id === 2).arabicName), 517);
assert.equal(calculateAbjad(HOLY_NAMES.find(name => name.id === 5).arabicName), 346);
assert.equal(calculateAbjad('ءأإآ'), 4);
assert.equal(calculateAbjad('ؤئ'), 16);
console.log('Section A sample names and shared Hamza values verified.');

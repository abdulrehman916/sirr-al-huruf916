import { calculateAbjad, getAbjadValue } from './abjadValues.js';

// Use the same displayed spelling for both metrics. Vowels, tatweel,
// punctuation and digits are not letters in the shared Abjad alphabet.
export function getHolyNameCardMetrics(name, knowledge) {
  const spelling = knowledge?.canonical_arabic || knowledge?.fully_vowelized_name || name.arabicName;
  return {
    abjadValue: calculateAbjad(spelling),
    letterCount: Array.from(spelling).filter(letter => getAbjadValue(letter) > 0).length,
  };
}

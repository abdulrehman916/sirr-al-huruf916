/**
 * Abjad Kabir (Greater Abjad) Values
 * Standard Qamari alphabet numerical values
 */

// Hamza forms are resolved dynamically via ABJAD_NORM (inherit carrier letter's value)
export const ABJAD_VALUES = {
  'ا': 1,
  'ب': 2,
  'ج': 3,
  'د': 4,
  'ه': 5, 'ة': 5,
  'و': 6,
  'ز': 7,
  'ح': 8,
  'ط': 9,
  'ي': 10, 'ى': 10,
  'ك': 20,
  'ل': 30,
  'م': 40,
  'ن': 50,
  'س': 60,
  'ع': 70,
  'ف': 80,
  'ص': 90,
  'ق': 100,
  'ر': 200,
  'ش': 300,
  'ت': 400,
  'ث': 500,
  'خ': 600,
  'ذ': 700,
  'ض': 800,
  'ظ': 900,
  'غ': 1000,
};

/**
 * Calculate Abjad value for a single letter
 */
const ABJAD_NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ؤ':'و','ئ':'ي' };
export function getAbjadValue(letter) {
  const t = letter.trim();
  const normalized = ABJAD_NORM[t] || t;
  return ABJAD_VALUES[normalized] || 0;
}

/**
 * Calculate total Abjad value for text
 */
export function calculateAbjad(text) {
  const arabicLetters = text.match(/[\u0600-\u06FF]/g) || [];
  return arabicLetters.reduce((sum, letter) => sum + getAbjadValue(letter), 0);
}

/**
 * Get letter-by-letter breakdown
 */
export function getAbjadBreakdown(text) {
  const arabicLetters = text.match(/[\u0600-\u06FF]/g) || [];
  return arabicLetters.map(letter => ({
    letter,
    value: getAbjadValue(letter)
  }));
}
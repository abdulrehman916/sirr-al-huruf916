/**
 * Hadim Engine - Ottoman-Style Name Construction
 * Calculates ceremonial names based on Abjad values
 */

import { calculateAbjad, getAbjadBreakdown } from './abjadValues';

/**
 * Extract letters for Hadim construction
 * Uses positional values: units, tens, hundreds, thousands
 */
function extractPositionalLetters(value) {
  const units = value % 10;
  const tens = Math.floor(value / 10) % 10;
  const hundreds = Math.floor(value / 100) % 10;
  const thousands = Math.floor(value / 1000);

  // Abjad mapping for positions
  const unitLetters = ['', 'ا', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح', 'ي'];
  const tenLetters = ['', 'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق'];
  const hundredLetters = ['', 'ر', 'ش', 'ت', 'ث', 'خ', 'ذ', 'ض', 'ظ', 'غ'];
  const thousandLetters = ['', 'أ'];

  const letters = [];
  if (thousands > 0 && thousandLetters[thousands]) letters.push({ letter: thousandLetters[thousands], value: thousands * 1000, position: 'thousands' });
  if (hundreds > 0 && hundredLetters[hundreds]) letters.push({ letter: hundredLetters[hundreds], value: hundreds * 100, position: 'hundreds' });
  if (tens > 0 && tenLetters[tens]) letters.push({ letter: tenLetters[tens], value: tens * 10, position: 'tens' });
  if (units > 0 && unitLetters[units]) letters.push({ letter: unitLetters[units], value: units, position: 'units' });

  return letters;
}

/**
 * Calculate Hadim ceremonial name - GitHub Original Formula
 * RESTORED: SUFLI = -41, SHERLI = special calculation
 */
export function calculateHadim(talib, matloob = '', ism = '', mode = 'ulvi') {
  const talibValue = calculateAbjad(talib);
  const matloobValue = matloob ? calculateAbjad(matloob) : 0;
  const ismValue = ism ? calculateAbjad(ism) : 0;
  const totalValue = talibValue + matloobValue + ismValue;

  // Extract letters for ceremonial construction
  const talibLetters = extractPositionalLetters(talibValue);
  const matloobLetters = matloobValue ? extractPositionalLetters(matloobValue) : [];
  const ismLetters = ismValue ? extractPositionalLetters(ismValue) : [];
  const allLetters = [...talibLetters, ...matloobLetters, ...ismLetters];

  // Construct ceremonial name (reverse order for Ottoman style)
  const ceremonialName = allLetters.reverse().map(l => l.letter).join('');

  // Calculate grand total with CORRECT mode adjustments (GitHub Original)
  let grandTotal = totalValue;
  if (mode === 'sufli') {
    grandTotal = totalValue - 41; // SUFLI: -41 (GitHub Original Formula)
  } else if (mode === 'sherli') {
    grandTotal = totalValue; // SHERLI: No adjustment, uses special calculation
  }

  // Determine Hadim type based on mode
  let hadimType = mode;

  // Calculate zikr count (traditional formula)
  const zikrCount = grandTotal * 3;

  // Generate kasem (oath) string
  const kasem = generateKasem(ceremonialName, grandTotal, mode);

  return {
    talib,
    matloob,
    ism,
    talibValue,
    matloobValue,
    ismValue,
    totalValue,
    ceremonialName,
    grandTotal,
    hadimType,
    mode,
    zikrCount,
    kasem,
    letterBreakdown: allLetters,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate kasem (oath) formula - GitHub Original
 */
function generateKasem(ceremonialName, total, mode) {
  const prefixes = {
    ulvi: 'بسم الله الرحمن الرحيم، يا قوي يا متين',
    sufli: 'يا قادر يا قدير',
    sherli: 'يا حي يا قيوم'
  };

  return `${prefixes[mode] || prefixes.ulvi} — ${ceremonialName} (${total})`;
}

/**
 * Async version with progress tracking
 */
export async function calculateHadimAsync(name, ism, mode, onProgress) {
  onProgress?.(20);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const result = calculateHadim(name, ism, mode);
  
  onProgress?.(100);
  return result;
}
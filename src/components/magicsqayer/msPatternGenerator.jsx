// ═══════════════════════════════════════════════════════════════
//  ORIGINAL HIERARCHY NAME GENERATOR
//  Book formula: tier value → subtract suffix → extract letters via Abjad
// ═══════════════════════════════════════════════════════════════

import { ARABIC_ABJAD, HEBREW_GEMATRIA } from './msEngine';
import { buildAngelName, buildJinnName, buildHebrewAngelName, buildHebrewJinnName } from './msHarakat';

// Book suffix values
const SUFFIXES = {
  'heb-angel': 31,   // אל
  'ar-angel': 41,    // إيل
  'heb-jinn': 329,   // תקש
  'ar-jinn': 319,    // طيش
};

// ── Arabic positional digit-cycle letter mappings ──
const AR_UNITS    = {1:'ا', 2:'ب', 3:'ج', 4:'د', 5:'ه', 6:'و', 7:'ز', 8:'ح', 9:'ط'};
const AR_TENS     = {10:'ي', 20:'ك', 30:'ل', 40:'م', 50:'ن', 60:'س', 70:'ع', 80:'ف', 90:'ص'};
const AR_HUNDREDS = {100:'ق', 200:'ر', 300:'ش', 400:'ت', 500:'ث', 600:'خ', 700:'ذ', 800:'ض', 900:'ظ'};
const AR_THOUSAND = 'غ';

// ── Hebrew positional digit-cycle letter mappings (Gematria order) ──
const HE_UNITS    = {1:'א', 2:'ב', 3:'ג', 4:'ד', 5:'ה', 6:'ו', 7:'ז', 8:'ח', 9:'ט'};
const HE_TENS     = {10:'י', 20:'כ', 30:'ל', 40:'מ', 50:'נ', 60:'ס', 70:'ע', 80:'פ', 90:'צ'};
const HE_HUNDREDS = {100:'ק', 200:'ר', 300:'ש', 400:'ת', 500:'ך', 600:'ם', 700:'ן', 800:'ף', 900:'ץ'};
const HE_THOUSAND = 'א'; // Aleph as thousand marker

/**
 * extractLettersFromValue(value, isHebrew)
 * Positional digit-cycle method — same algorithm for both scripts.
 * Uses Arabic tables by default; Hebrew Gematria tables when isHebrew=true.
 */
function extractLettersFromValue(value, isHebrew = false) {
  if (!value || value <= 0) return [];

  const UNITS    = isHebrew ? HE_UNITS    : AR_UNITS;
  const TENS     = isHebrew ? HE_TENS     : AR_TENS;
  const HUNDREDS = isHebrew ? HE_HUNDREDS : AR_HUNDREDS;
  const THOUSAND = isHebrew ? HE_THOUSAND : AR_THOUSAND;

  const letters = [];
  let n = Math.floor(value);
  const digits = [];
  while (n > 0) { digits.push(n % 10); n = Math.floor(n / 10); }

  let slot = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = digits[i];
    if (slot === 0) {
      if (d !== 0 && UNITS[d]) letters.push(UNITS[d]);
      slot = 1;
    } else if (slot === 1) {
      const v = d * 10;
      if (d !== 0 && TENS[v]) letters.push(TENS[v]);
      slot = 2;
    } else if (slot === 2) {
      const v = d * 100;
      if (d !== 0 && HUNDREDS[v]) letters.push(HUNDREDS[v]);
      slot = 3;
    } else {
      letters.push(THOUSAND);
      if (d !== 0 && d !== 1 && UNITS[d]) letters.push(UNITS[d]);
      slot = 1;
    }
  }
  return letters;
}

/**
 * generateNameForHierarchyValue(value, suffixType)
 * BAST-2 EXTRACTION RULE:
 * 1. Value is already the final adjusted extraction value (DO NOT subtract suffix again)
 * 2. Extract letters directly from value using Abjad decomposition (greedy, largest → smallest)
 * 3. For Angel modes: add suffix letters (إيل for Arabic, אל for Hebrew) AFTER extraction
 * 4. For Jinn modes: no suffix letters added
 * 5. Apply tashkeel ONLY (never change letters)
 * 
 * CRITICAL: BAST-2 CONSONANT ORDER IS IMMUTABLE
 * - Extracted consonants are concatenated in EXACT extraction order
 * - NO reversal, NO reordering, NO letter insertion, NO letter removal
 * - Example: 337 = 300 + 30 + 7 = ش + ل + ز = شلز (NOT زلش)
 * 
 * CRITICAL: The input value is already the result of Ulvi adjustment.
 * Example: 18 → 18 + 360 - 41 = 337 (adjustment happens BEFORE this function is called)
 * This function receives 337 and extracts: 337 = 300 + 30 + 7 = ش ل ز
 */
export function generateNameForHierarchyValue(value, suffixType = 'ar-angel') {
  const suffix = SUFFIXES[suffixType];
  if (!suffix) {
    return { success: false, error: 'Invalid suffix type' };
  }
  
  const isAngel = suffixType.includes('angel');
  const isHebrew = suffixType.includes('heb');
  const isArabic = !isHebrew;
  
  // BAST-2 RULE: value is already adjusted, extract directly
  // DO NOT subtract suffix again - it was already applied during Ulvi adjustment
  const extractionValue = value;
  
  // POSITIONAL DIGIT-CYCLE EXTRACTION: Read right-to-left, cycling Unit → Tens → Hundreds → Thousand Marker
  const consonants = extractLettersFromValue(extractionValue, isHebrew);
  
  if (consonants.length === 0) {
    return { success: false, error: 'Could not extract letters' };
  }
  
  // FINAL NAME: mirror order (reverse of breakdown)
  const rawConsonantSequence = consonants.join('');
  const reversedConsonants = [...consonants].reverse();
  
  // Apply harakat/suffix — four systems fully separate
  const fullName = isHebrew
    ? (isAngel ? buildHebrewAngelName(reversedConsonants) : buildHebrewJinnName(reversedConsonants))
    : (isAngel ? buildAngelName(reversedConsonants)       : buildJinnName(reversedConsonants));
  
  return {
    success: true,
    value,
    suffixType,
    extractionValue,
    consonants,
    rawConsonantSequence,
    reversedConsonants,
    fullName,
    isAngel,
    isHebrew,
  };
}

/**
 * Legacy export for compatibility
 */
export function getNameForHierarchyValue(value, suffixType) {
  return generateNameForHierarchyValue(value, suffixType);
}

export function getPatternInfo() {
  return {
    id: 'book-formula',
    template: 'tier-minus-suffix',
    category: 'traditional',
    syllables: 'variable',
    difficulty: 1,
    example: 'Adjuster(136) - 41 = 95 → Abjad letters → vocalized name'
  };
}
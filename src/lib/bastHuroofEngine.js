// ═══════════════════════════════════════════════════════════════
// BAST HUROOF ENGINE — Bast Page Exclusive
// ═══════════════════════════════════════════════════════════════
// Source: Manuscript "ANASIRA GÖRE BASTI ADEDİ CEDVELİ" (Pages 52-53)
// This engine is exclusively for the Bast page (/basthul-huroof-2)
// Uses BASTUL_HURUF_2_TABLE from lib/abjadModes.js (verified against screenshot)
// ═══════════════════════════════════════════════════════════════

import { BASTUL_HURUF_2_TABLE } from './abjadModes.js';

// ── Bast Level Definitions ─────────────────────────────────────
export const BAST_LEVELS = [
  { key: 1, label: 'BASTI EVVEL',   arabic: 'بسط الأول' },
  { key: 2, label: 'BASTI SANİ',    arabic: 'بسط الثاني' },
  { key: 3, label: 'BASTI SALİS',   arabic: 'بسط الثالث' },
  { key: 4, label: 'BASTI RABİ',    arabic: 'بسط الرابع' },
  { key: 5, label: 'BASTI HAMİS',   arabic: 'بسط الخامس' },
];

// ── Abjad Letter Normalization (same as abjadModes.js) ─────────
const NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ئ':'ي','ؤ':'و','ة':'ه' };
export function normalize(ch) { return NORM[ch] || ch; }

// ── Extract Arabic Letters from Text ───────────────────────────
function stripDiacritics(text) {
  return text
    .replace(/[\u064B-\u065F]/g, '')    // tashkeel/harakat
    .replace(/\u0640/g, '')             // tatweel
    .replace(/\u0670/g, '')             // superscript alef
    .replace(/[\u0600-\u060F]/g, '')    // number/poetic signs
    .replace(/[\u0610-\u061A]/g, '')    // sign marks
    .replace(/[\u200B-\u200F]/g, '')    // zero-width/embedding
    .replace(/[\u202A-\u202E]/g, '')    // LTR/RTL embedding
    .replace(/[\uFE70-\uFEFF]/g, '')    // presentation forms
    .replace(/\s+/g, '');               // spaces
}

function extractLetters(text) {
  const clean = stripDiacritics(text);
  const arabicLetterRegex = /[\u0621-\u063A\u0641-\u064A]/g;
  const matches = clean.match(arabicLetterRegex);
  
  if (!matches) return [];
  
  return matches.map(ch => {
    const norm = normalize(ch);
    return { original: ch, normalized: norm };
  }).filter(item => item.normalized in BASTUL_HURUF_2_TABLE);
}

// ── Main Bast Calculation Function ─────────────────────────────
/**
 * Calculate Bast values for all 5 levels
 * @param {string} text - Arabic text input
 * @param {number} specificLevel - Optional: calculate only one level (1-5)
 * @returns {object} Result with entries, total, and level info
 */
export function calcBastHuroof(text, specificLevel = null) {
  const rawLetters = extractLetters(text);
  
  if (specificLevel) {
    // Single level calculation (for number input mode)
    const entries = rawLetters.map(l => {
      const bastValue = BASTUL_HURUF_2_TABLE[l.normalized]?.[specificLevel] ?? 0;
      return {
        original: l.original,
        normalized: l.normalized,
        value: bastValue,
      };
    });
    const total = entries.reduce((s, e) => s + e.value, 0);
    
    return {
      entries,
      total,
      letterCount: entries.length,
      isPending: false,
    };
  }
  
  // All levels calculation (for text input mode) - returns object keyed by level
  const results = {};
  
  BAST_LEVELS.forEach(level => {
    const entries = rawLetters.map(l => {
      const bastValue = BASTUL_HURUF_2_TABLE[l.normalized]?.[level.key] ?? 0;
      return {
        original: l.original,
        normalized: l.normalized,
        value: bastValue,
      };
    });
    const total = entries.reduce((s, e) => s + e.value, 0);
    
    results[level.key] = {
      entries,
      total,
      letterCount: entries.length,
      isPending: false,
    };
  });
  
  return results;
}

// ── Letter-by-Letter Breakdown (for BreakdownTable) ────────────
export function getBastBreakdown(text, level) {
  const rawLetters = extractLetters(text);
  const entries = rawLetters.map(l => ({
    original: l.original,
    normalized: l.normalized,
    value: BASTUL_HURUF_2_TABLE[l.normalized]?.[level] ?? null,
  }));
  
  return entries;
}

// ── Validation Function (for audit) ────────────────────────────
export function validateBastData() {
  const expectedLetters = 28;
  const expectedLevels = 5;
  const actualLetters = Object.keys(BASTUL_HURUF_2_TABLE).length;
  
  const validation = {
    totalLetters: actualLetters,
    totalValues: actualLetters * expectedLevels,
    missingLetters: [],
    extraLetters: [],
    invalidValues: [],
    isValid: true,
  };
  
  // Check for missing letters
  const requiredLetters = ['ا','ب','ج','د','ه','و','ز','ح','ط','ي','ك','ل','م','ن','س','ع','ف','ص','ق','ر','ش','ت','ث','خ','ذ','ض','ظ','غ'];
  requiredLetters.forEach(letter => {
    if (!BASTUL_HURUF_2_TABLE[letter]) {
      validation.missingLetters.push(letter);
      validation.isValid = false;
    } else {
      // Check all 5 levels exist
      for (let i = 1; i <= 5; i++) {
        if (typeof BASTUL_HURUF_2_TABLE[letter][i] !== 'number') {
          validation.invalidValues.push({ letter, level: i, value: BASTUL_HURUF_2_TABLE[letter][i] });
          validation.isValid = false;
        }
      }
    }
  });
  
  // Check for extra letters
  Object.keys(BASTUL_HURUF_2_TABLE).forEach(letter => {
    if (!requiredLetters.includes(letter)) {
      validation.extraLetters.push(letter);
    }
  });
  
  return validation;
}
// ═══════════════════════════════════════════════════════════════
// ARABIC HARAKAT (TASHKEEL) UTILITIES — DISPLAY LAYER ONLY
// ═══════════════════════════════════════════════════════════════
// Purpose: Detect whether Arabic text has sufficient Harakat
// (diacritics) for Quran-style display, and cache AI-generated
// Harakat versions in localStorage so each text is processed once.
//
// IMPORTANT: This is a DISPLAY LAYER only. The original manuscript
// text stored in data files is NEVER modified. Harakat-enhanced
// text is cached in localStorage and used only for rendering.
// ═══════════════════════════════════════════════════════════════

// Unicode ranges for Arabic Harakat (tashkeel/diacritics)
const HARAKAT_RANGES = [
  [0x0618, 0x061A], // supra diacritic non-letters
  [0x064B, 0x065F], // main Harakat: tanwin, fatha, damma, kasra, shadda, sukun, etc.
  [0x0670, 0x0670], // superscript alef
  [0x06D6, 0x06DC], // Quranic annotation signs
  [0x06DF, 0x06E8], // Quranic annotation signs extended
  [0x06EA, 0x06ED], // Quranic end of ayah, etc.
];

// Unicode ranges for Arabic LETTERS (consonants)
const ARABIC_LETTER_RANGES = [
  [0x0621, 0x064A], // basic Arabic letters (hamza to yeh)
  [0x066E, 0x066F], // peh, tcheh
  [0x0671, 0x06D3], // Arabic extended letters
  [0x06D5, 0x06D5], // ae
];

function isInRange(code, ranges) {
  return ranges.some(([start, end]) => code >= start && code <= end);
}

/**
 * Determines whether the given Arabic text has sufficient Harakat
 * (diacritics) for Quran-style display.
 *
 * Fully voweled Arabic typically has a Harakat-to-letter ratio near 1.0
 * (every consonant carries a vowel mark or sukun). We consider text
 * "sufficient" if at least 30% of Arabic letters carry diacritics.
 *
 * @param {string} text — Arabic text to check
 * @returns {boolean} — true if Harakat is sufficient, false if enhancement needed
 */
export function hasSufficientHarakat(text) {
  if (!text || typeof text !== "string") return true;

  let letterCount = 0;
  let harakatCount = 0;

  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (isInRange(code, ARABIC_LETTER_RANGES)) letterCount++;
    if (isInRange(code, HARAKAT_RANGES)) harakatCount++;
  }

  if (letterCount === 0) return true;
  return (harakatCount / letterCount) >= 0.3;
}

/**
 * Simple deterministic hash for cache key generation.
 * @param {string} text
 * @returns {string} — base-36 hash string
 */
export function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Minimum AI confidence (0-100) required to apply AI-generated Harakat.
// Below this threshold, the original text is displayed without AI Harakat.
export const HARAKAT_CONFIDENCE_THRESHOLD = 70;

const CACHE_PREFIX = "sirr_harakat_";

/**
 * Retrieves a cached Harakat-enhanced version of the text from localStorage.
 * @param {string} text — original Arabic text
 * @returns {string|null} — cached voweled text, or null if not cached
 */
export function getCachedHarakat(text) {
  try {
    const key = CACHE_PREFIX + hashText(text);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Stores a Harakat-enhanced version of the text in localStorage.
 * @param {string} text — original Arabic text
 * @param {string} voweled — AI-generated fully voweled text
 */
export function setCachedHarakat(text, voweled) {
  try {
    const key = CACHE_PREFIX + hashText(text);
    localStorage.setItem(key, voweled);
  } catch {
    // localStorage full or unavailable — non-critical, skip caching
  }
}
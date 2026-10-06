// ═══════════════════════════════════════════════════════════════
// ARABIC HARAKAT — AUTHENTICATED SOURCE REGISTRY
// ═══════════════════════════════════════════════════════════════
// Purpose: Before AI generates Harakat, check whether the Arabic
// text (or phrases within it) already exists in authenticated
// sources: Quran, authentic Hadith, Asma al-Husna, well-known
// adhkar, or previously integrated manuscripts.
//
// If an authenticated version exists → use that EXACT Harakat.
// Only if NO authenticated version exists → AI may generate.
//
// This is a DISPLAY LAYER only. Original manuscript text is never
// modified. Authenticated Harakat is applied only for rendering.
// ═══════════════════════════════════════════════════════════════

// ── Unicode ranges (self-contained per module independence) ──
const ARABIC_LETTER_RANGES = [
  [0x0621, 0x064A],
  [0x066E, 0x066F],
  [0x0671, 0x06D3],
  [0x06D5, 0x06D5],
];

const HARAKAT_RANGES = [
  [0x0618, 0x061A],
  [0x064B, 0x065F],
  [0x0670, 0x0670],
  [0x06D6, 0x06DC],
  [0x06DF, 0x06E8],
  [0x06EA, 0x06ED],
];

function isInRange(code, ranges) {
  return ranges.some(([s, e]) => code >= s && code <= e);
}

// Alef variants to normalize for matching:
// أ (0623) إ (0625) آ (0622) ٱ (0671) → ا (0627)
const ALEF_VARIANTS = new Set([0x0623, 0x0625, 0x0622, 0x0671]);
const PLAIN_ALEF = "\u0627";

/**
 * Extracts only Arabic letters from text, stripping all Harakat,
 * spaces, punctuation, and tatweel. Normalizes all alef variants
 * to plain alef (ا) so that "إله" and "اله" and "أله" all match.
 *
 * @param {string} text
 * @returns {string} — normalized letter-only sequence
 */
export function normalizeArabic(text) {
  if (!text || typeof text !== "string") return "";
  let result = "";
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (isInRange(code, ARABIC_LETTER_RANGES)) {
      result += ALEF_VARIANTS.has(code) ? PLAIN_ALEF : ch;
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// FIXED REPLACEMENTS — Phrases whose Harakat is ALWAYS the same
// regardless of grammatical context (full Quranic verses, fixed
// adhkar, salawat, vocative phrases). These are blindly replaced
// when found in any Arabic text.
// ═══════════════════════════════════════════════════════════════

const _FIXED = [
  // ── Bismillah ──
  { id: "bismillah", category: "quran", voweled: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },

  // ── Surah al-Fatiha (verses used in the Seven Aqsam) ──
  { id: "fatiha_2", category: "quran", voweled: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
  { id: "fatiha_4", category: "quran", voweled: "مَالِكِ يَوْمِ الدِّينِ" },
  { id: "fatiha_5", category: "quran", voweled: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
  { id: "fatiha_6", category: "quran", voweled: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
  { id: "fatiha_7a", category: "quran", voweled: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ" },
  { id: "fatiha_7b", category: "quran", voweled: "غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ" },

  // ── Surah Luqman 31:27 (in the universal supplication) ──
  { id: "luqman_31_27", category: "quran", voweled: "وَلَوْ أَنَّمَا فِي الْأَرْضِ مِن شَجَرَةٍ أَقْلَامٌ وَالْبَحْرُ يَمُدُّهُ مِن بَعْدِهِ سَبْعَةُ أَبْحُرٍ مَّا نَفِدَتْ كَلِمَاتُ اللَّهِ إِنَّ اللَّهَ عَزِيزٌ حَكِيمٌ" },

  // ── Common dhikr (fixed forms — vocative / statement) ──
  { id: "dhikr_la_ilaha", category: "dhikr", voweled: "لَا إِلَهَ إِلَّا اللَّهُ" },
  { id: "dhikr_ya_hayy", category: "dhikr", voweled: "يَا حَيُّ يَا قَيُّومُ" },
  { id: "dua_ya_arham", category: "dua", voweled: "يَا أَرْحَمَ الرَّاحِمِينَ" },
  { id: "allahumma", category: "dua", voweled: "اللَّهُمَّ" },

  // ── Salawat (always fixed) ──
  { id: "salawat_short", category: "salawat", voweled: "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ" },
  { id: "salawat_full", category: "salawat", voweled: "وَصَلَّى اللَّهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ" },

  // ── Quranic phrases (fixed internal grammar) ──
  { id: "quran_innallaha", category: "quran", voweled: "إِنَّ اللَّهَ عَزِيزٌ حَكِيمٌ" },
  { id: "quran_subuh_qudus", category: "dhikr", voweled: "سُبُّوحٌ قُدُّوسٌ رَبُّ الْمَلَائِكَةِ وَالرُّوحِ" },
];

// Pre-compute normalized forms
export const FIXED_REPLACEMENTS = _FIXED.map(e => ({
  ...e,
  normalized: normalizeArabic(e.voweled),
})).filter(e => e.normalized.length >= 5); // minimum 5 letters to avoid false matches

// ═══════════════════════════════════════════════════════════════
// CONTEXT HINTS — Phrases whose Harakat depends on grammatical
// context (individual names, non-vocative phrases). These are NOT
// blindly replaced. Instead, they are passed to the AI as reference
// so the AI can apply the correct Harakat with proper i'rab.
// ═══════════════════════════════════════════════════════════════

const _HINTS = [
  // ── Asma al-Husna (standard nominative form — AI adjusts i'rab) ──
  { id: "asma_arr Rahman", category: "asma", voweled: "الرَّحْمَٰنُ الرَّحِيمُ" },
  { id: "asma_latif_azim", category: "asma", voweled: "اللَّطِيفُ الْعَظِيمُ" },
  { id: "asma_razzaq", category: "asma", voweled: "الرَّزَّاقُ" },
  { id: "asma_ghafur", category: "asma", voweled: "الْغَفُورُ" },
  { id: "asma_mumin", category: "asma", voweled: "الْمُؤْمِنُ" },
  { id: "asma_muhaymin", category: "asma", voweled: "الْمُهَيْمِنُ" },
  { id: "asma_mumit", category: "asma", voweled: "الْمُمِيتُ" },
  { id: "asma_majib", category: "asma", voweled: "الْمَجِيبُ" },
  { id: "asma_qarib", category: "asma", voweled: "الْقَرِيبُ" },
  { id: "asma_sari", category: "asma", voweled: "السَّرِيعُ" },
  { id: "asma_karim", category: "asma", voweled: "الْكَرِيمُ" },
  { id: "asma_dhul_jalal", category: "asma", voweled: "ذُو الْجَلَالِ وَالْإِكْرَامِ" },
  { id: "asma_dhul_tawl", category: "asma", voweled: "ذُو الطَّوْلِ" },
  { id: "asma_manan", category: "asma", voweled: "الْمَنَّانُ" },
  { id: "asma_jalil", category: "asma", voweled: "الْجَلِيلُ" },

  // ── Quranic phrases (context-dependent i'rab) ──
  { id: "quran_hayy_qayyum", category: "quran", voweled: "الْحَيُّ الْقَيُّومُ" },
  { id: "quran_la_ilaha_illa_huwa", category: "quran", voweled: "لَا إِلَهَ إِلَّا هُوَ" },
  { id: "quran_sirat_mustaqim", category: "quran", voweled: "الصِّرَاطَ الْمُسْتَقِيمَ" },

  // ── Common dua openings (standard form — AI adjusts i'rab) ──
  { id: "dua_allahumma_inni_asal", category: "dua", voweled: "اللَّهُمَّ إِنِّي أَسْأَلُكَ" },
  { id: "dua_allahumma_inni_astakhir", category: "dua_hadith", voweled: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ" },
  { id: "dua_ilahi_man", category: "dua", voweled: "إِلَهِي مَنْ ذَا الَّذِي دَعَاكَ فَلَمْ تُجِبْهُ" },
];

export const CONTEXT_HINTS = _HINTS.map(e => ({
  ...e,
  normalized: normalizeArabic(e.voweled),
})).filter(e => e.normalized.length >= 6);

// ═══════════════════════════════════════════════════════════════
// MATCHING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Applies all fixed authenticated replacements to the text.
 * Finds each authenticated phrase (by normalized letter sequence)
 * and replaces it with the exact voweled version.
 *
 * @param {string} text — original Arabic text
 * @returns {{ text: string, hadReplacements: boolean, matched: string[] }}
 */
export function applyFixedReplacements(text) {
  if (!text) return { text, hadReplacements: false, matched: [] };

  // Build letter position map: normalized index → original text index
  const letterPositions = [];
  let normalized = "";
  for (let i = 0; i < text.length; i++) {
    const code = text[i].codePointAt(0);
    if (isInRange(code, ARABIC_LETTER_RANGES)) {
      const letter = ALEF_VARIANTS.has(code) ? PLAIN_ALEF : text[i];
      letterPositions.push(i);
      normalized += letter;
    }
  }

  // Find all replacement spans
  const spans = [];
  const matched = [];
  for (const entry of FIXED_REPLACEMENTS) {
    let searchFrom = 0;
    while (searchFrom < normalized.length) {
      const idx = normalized.indexOf(entry.normalized, searchFrom);
      if (idx < 0) break;
      const startOrig = letterPositions[idx];
      const endOrig = letterPositions[idx + entry.normalized.length - 1] + 1;
      spans.push({ start: startOrig, end: endOrig, voweled: entry.voweled });
      if (!matched.includes(entry.id)) matched.push(entry.id);
      searchFrom = idx + entry.normalized.length;
    }
  }

  if (spans.length === 0) return { text, hadReplacements: false, matched: [] };

  // Sort by start position; for overlaps, prefer longer matches
  spans.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  // Build result, skipping overlapping spans
  let result = "";
  let pos = 0;
  for (const span of spans) {
    if (span.start < pos) continue;
    result += text.slice(pos, span.start);
    result += span.voweled;
    pos = span.end;
  }
  result += text.slice(pos);

  return { text: result, hadReplacements: true, matched };
}

/**
 * Finds context hints (non-fixed authenticated phrases) in the text.
 * Returns their voweled forms for the AI to use as reference.
 *
 * @param {string} text
 * @returns {Array<{ id: string, voweled: string }>}
 */
export function getAIContextHints(text) {
  if (!text) return [];
  const normalized = normalizeArabic(text);
  const hints = [];
  for (const entry of CONTEXT_HINTS) {
    if (normalized.includes(entry.normalized)) {
      hints.push({ id: entry.id, voweled: entry.voweled });
    }
  }
  return hints;
}

/**
 * Checks if the text matches any authenticated source (fixed or hint).
 * Used to determine whether AI generation is needed at all.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function hasAuthenticatedMatch(text) {
  if (!text) return false;
  const normalized = normalizeArabic(text);
  if (FIXED_REPLACEMENTS.some(e => normalized.includes(e.normalized))) return true;
  if (CONTEXT_HINTS.some(e => normalized.includes(e.normalized))) return true;
  return false;
}
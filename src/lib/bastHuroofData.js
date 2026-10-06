// ═══════════════════════════════════════════════════════════════
// BASTI ADEDİ CEDVELİ — DEDICATED BAST DATA TABLE
// Source: "Harflerin Bastı Cetveli" — Bastların Usulü Vefklerin Sırrı ve Havassı, p.93
// Used ONLY by: lib/bastHuroofEngine.js → pages/BastHuroofPage.jsx
// ---------------------------------------------------------------
// DO NOT import this file into any other engine or page.
// DO NOT derive values from Abjad, Mizan, or any other system.
// All values entered directly from the manuscript source table.
// ═══════════════════════════════════════════════════════════════

/**
 * BAST_DATA — One row per Arabic base letter (28 letters).
 *
 * Column mapping from manuscript:
 *   Birinci Bast  → bastEvvel  (Level 1)
 *   İkinci Bast   → bastSani   (Level 2)
 *   Üçüncü Bast   → bastSalis  (Level 3)
 *   Dördüncü Bast → bastRabi   (Level 4)
 *   Beşinci Bast  → bastHamis  (Level 5)
 *
 * Letter order follows Ebced-i Kebir (Abjad numerals), as in source.
 */
export const BAST_DATA = [
  // ── Ebced 1 ──
  { letter: 'ا', name: 'ألف',  bastEvvel:   16, bastSani:   991, bastSalis:  6137, bastRabi:  31296, bastHamis: 156119 },
  // ── Ebced 2 ──
  { letter: 'ب', name: 'باء',  bastEvvel:  616, bastSani:  2888, bastSalis: 11915, bastRabi:  58713, bastHamis: 292178 },
  // ── Ebced 3 ──
  { letter: 'ج', name: 'جيم',  bastEvvel: 1041, bastSani:  3348, bastSalis: 13044, bastRabi:  63051, bastHamis: 316523 },
  // ── Ebced 4 ──
  { letter: 'د', name: 'دال',  bastEvvel:  283, bastSani:  2055, bastSalis: 11189, bastRabi:  54921, bastHamis: 271164 },
  // ── Ebced 5 ──
  { letter: 'ه', name: 'هاء',  bastEvvel:  709, bastSani:  2094, bastSalis:  9493, bastRabi:  47683, bastHamis: 238889 },
  // ── Ebced 6 ──
  { letter: 'و', name: 'واو',  bastEvvel:  468, bastSani:  1570, bastSalis:  7288, bastRabi:  37242, bastHamis: 186822 },
  // ── Ebced 7 ──
  { letter: 'ز', name: 'زاي',  bastEvvel:  141, bastSani:  2046, bastSalis:  9868, bastRabi:  44870, bastHamis: 218158 },
  // ── Ebced 8 ──
  { letter: 'ح', name: 'حاء',  bastEvvel:  612, bastSani:  3171, bastSalis: 13970, bastRabi:  69902, bastHamis: 347099 },
  // ── Ebced 9 ──
  { letter: 'ط', name: 'طاء',  bastEvvel:  539, bastSani:  1767, bastSalis:  9969, bastRabi:  50263, bastHamis: 246517 },
  // ── Ebced 10 ──
  { letter: 'ي', name: 'ياء',  bastEvvel:  579, bastSani:  2518, bastSalis: 11672, bastRabi:  56032, bastHamis: 276357 },
  // ── Ebced 20 ──
  { letter: 'ك', name: 'كاف',  bastEvvel:  635, bastSani:  3153, bastSalis: 14825, bastRabi:  70857, bastHamis: 347214 },
  // ── Ebced 30 ──
  { letter: 'ل', name: 'لام',  bastEvvel: 1097, bastSani:  3983, bastSalis: 16197, bastRabi:  77876, bastHamis: 387380 },
  // ── Ebced 40 ──
  { letter: 'م', name: 'ميم',  bastEvvel:  339, bastSani:  2690, bastSalis: 14342, bastRabi:  69746, bastHamis: 342021 },
  // ── Ebced 50 ──
  { letter: 'ن', name: 'نون',  bastEvvel:  765, bastSani:  2729, bastSalis: 12646, bastRabi:  62508, bastHamis: 309746 },
  // ── Ebced 60 ──
  { letter: 'س', name: 'سين',  bastEvvel:  524, bastSani:  2205, bastSalis: 10441, bastRabi:  52067, bastHamis: 257679 },
  // ── Ebced 70 ──
  { letter: 'ع', name: 'عين',  bastEvvel:  197, bastSani:  2681, bastSalis: 13021, bastRabi:  59695, bastHamis: 289015 },
  // ── Ebced 80 ──
  { letter: 'ف', name: 'فاء',  bastEvvel:  657, bastSani:  3227, bastSalis: 14605, bastRabi:  73055, bastHamis: 361924 },
  // ── Ebced 90 ──
  { letter: 'ص', name: 'صاد',  bastEvvel:  594, bastSani:  2402, bastSalis: 13122, bastRabi:  65088, bastHamis: 317374 },
  // ── Ebced 100 ──
  { letter: 'ق', name: 'قاف',  bastEvvel:   60, bastSani:  1643, bastSalis:  8213, bastRabi:  41644, bastHamis: 204757 },
  // ── Ebced 200 ──
  { letter: 'ر', name: 'راء',  bastEvvel:  517, bastSani:  2615, bastSalis: 14355, bastRabi:  73777, bastHamis: 362686 },
  // ── Ebced 300 ──
  { letter: 'ش', name: 'شين',  bastEvvel: 1095, bastSani:  4282, bastSalis: 19163, bastRabi:  95202, bastHamis: 473597 },
  // ── Ebced 400 ──
  { letter: 'ت', name: 'تاء',  bastEvvel:  337, bastSani:  2989, bastSalis: 17308, bastRabi:  87072, bastHamis: 428238 },
  // ── Ebced 500 ──
  { letter: 'ث', name: 'ثاء',  bastEvvel:  763, bastSani:  3028, bastSalis: 15612, bastRabi:  79834, bastHamis: 395963 },
  // ── Ebced 600 ──
  { letter: 'خ', name: 'خاء',  bastEvvel:  522, bastSani:  2504, bastSalis: 13407, bastRabi:  63993, bastHamis: 343896 },
  // ── Ebced 700 ──
  { letter: 'ذ', name: 'ذال',  bastEvvel:  195, bastSani:  2980, bastSalis: 15987, bastRabi:  77021, bastHamis: 375232 },
  // ── Ebced 800 ──
  { letter: 'ض', name: 'ضاد',  bastEvvel:  655, bastSani:  3526, bastSalis: 17521, bastRabi:  90381, bastHamis: 448141 },
  // ── Ebced 900 ──
  { letter: 'ظ', name: 'ظاء',  bastEvvel:  593, bastSani:  2701, bastSalis: 16088, bastRabi:  82414, bastHamis: 403591 },
  // ── Ebced 1000 ──
  { letter: 'غ', name: 'غين',  bastEvvel:  114, bastSani:  1770, bastSalis:  8121, bastRabi:  36939, bastHamis: 182227 },
];

// ── Field → Level key mapping (used by engine) ────────────────
export const BAST_FIELD_MAP = {
  1: 'bastEvvel',
  2: 'bastSani',
  3: 'bastSalis',
  4: 'bastRabi',
  5: 'bastHamis',
};

// ── Lookup map: letter → row (built once at import time) ───────
export const BAST_LOOKUP = Object.fromEntries(
  BAST_DATA.map(row => [row.letter, row])
);
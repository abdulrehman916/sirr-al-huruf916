// ═══════════════════════════════════════════════
// ABJAD CALCULATION ENGINES
// ═══════════════════════════════════════════════

// ── Kabir map (classical Abjad) ──
export const KABIR_MAP = {
  'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,
  'ي':10,'ك':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,'ص':90,
  'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,'ذ':700,'ض':800,'ظ':900,'غ':1000,
};

// ── Normalization ──
const NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ئ':'ي','ؤ':'و','ة':'ه' };

export function normalize(ch) { return NORM[ch] || ch; }

// Strip ONLY diacritics and noise - preserve actual Arabic letters
// Arabic letter ranges: \u0621-\u063A (Hamza to Ghain) and \u0641-\u064A (Fa to Ya)
function stripDiacritics(text) {
  return text
    .replace(/[\u064B-\u065F]/g, '')    // tashkeel/harakat ONLY (not letters)
    .replace(/\u0640/g, '')             // tatweel (kashida)
    .replace(/\u0670/g, '')             // superscript alef
    .replace(/[\u0600-\u0605]/g, '')    // Arabic number signs
    .replace(/[\u0606-\u060F]/g, '')    // Arabic poetic signs
    .replace(/[\u0610-\u061A]/g, '')    // Arabic sign marks (NOT letters)
    .replace(/[\u200B-\u200F]/g, '')    // zero-width chars
    .replace(/[\u202A-\u202E]/g, '')    // LTR/RTL embedding
    .replace(/[\uFE70-\uFEFF]/g, '')    // presentation forms-B noise
    .replace(/\s+/g, '');               // spaces
}

function extractLetters(text) {
  const clean = stripDiacritics(text);
  // Match ALL Arabic letters at once using global regex - safest for Unicode
  const arabicLetterRegex = /[\u0621-\u063A\u0641-\u064A]/g;
  const matches = clean.match(arabicLetterRegex);
  
  if (!matches) {
    return [];
  }
  
  // Convert matches to result objects with normalization
  return matches.map(ch => {
    const norm = normalize(ch);
    return { original: ch, normalized: norm };
  }).filter(item => item.normalized in KABIR_MAP);
}

// ══════════════════════════════════════
// 1 — EBCED-İ KEBİR
// ══════════════════════════════════════
export function calcKebir(text) {
  const rawLetters = extractLetters(text);
  const letters = rawLetters
    .filter(l => l.normalized in KABIR_MAP)
    .map(l => ({ ...l, value: KABIR_MAP[l.normalized] }));
  const total = letters.reduce((s, l) => s + l.value, 0);
  return { letters, total };
}

// ══════════════════════════════════════
// 2 — EBCED-İ SAĞİR
// True Sağir lookup table (cyclic reduction)
// Letters with value 0 are SAKIT (silent)
// ══════════════════════════════════════
export const SAGHIR_MAP = {
  'ا':1, 'ب':2, 'ج':3, 'د':4, 'ه':5, 'و':6, 'ز':7, 'ح':8, 'ط':9,
  'ي':10,'ك':8, 'ل':6, 'م':4, 'ن':2, 'س':0, 'ع':10,'ف':8, 'ص':6,
  'ق':4, 'ر':8, 'ش':0, 'ت':4, 'ث':8, 'خ':0, 'ذ':4, 'ض':8, 'ظ':0, 'غ':4,
};

export function calcSaghir(text) {
  const rawLetters = extractLetters(text);
  const letters = rawLetters
    .filter(l => l.normalized in SAGHIR_MAP)
    .map(l => {
      const kabir  = KABIR_MAP[l.normalized];
      const saghir = SAGHIR_MAP[l.normalized];
      return { ...l, kabir, saghir, sakit: saghir === 0 };
    });
  const activeLetters = letters.filter(l => !l.sakit);
  const total = activeLetters.reduce((s, l) => s + l.saghir, 0);
  const sakitLetters = letters.filter(l => l.sakit);
  return { letters, activeLetters, sakitLetters, total };
}

// ══════════════════════════════════════
// 3 — EBCED-İ CÜMELİ KEBİR
// Expand each letter to its full Arabic name, then sum all letters of those names.
// ══════════════════════════════════════
// Names chosen to match exact Cümeli Kebir totals:
// ا=الف(111) ب=با(3) ج=جيم(53) د=دال(35) ه=ها(6) و=واو(13) ز=زاي(18)
// ح=حا(9) ط=طا(10) ي=يا(11) ك=كاف(101) ل=لام(71) م=ميم(90) ن=نون(106)
// س=سين(120) ع=عين(130) ف=فا(81) ص=صاد(95) ق=قاف(181) ر=را(201) ش=شين(360)
// ت=تا(401) ث=ثا(501) خ=خا(601) ذ=ذال(701) ض=ضاد(805) ظ=ظا(901) غ=غين(1060)
export const LETTER_NAMES = {
  'ا': 'الف',  'ب': 'با',   'ج': 'جيم',  'د': 'دال',
  'ه': 'ها',   'و': 'واو',  'ز': 'زاي',  'ح': 'حا',
  'ط': 'طا',   'ي': 'يا',   'ك': 'كاف',  'ل': 'لام',
  'م': 'ميم',  'ن': 'نون',  'س': 'سين',  'ع': 'عين',
  'ف': 'فا',   'ص': 'صاد',  'ق': 'قاف',  'ر': 'را',
  'ش': 'شين',  'ت': 'تا',   'ث': 'ثا',   'خ': 'خا',
  'ذ': 'ذال',  'ض': 'ضاد',  'ظ': 'ظا',   'غ': 'غين',
};

export function calcCumeli(text) {
  const src = extractLetters(text);
  const entries = src.map(l => {
    const name = LETTER_NAMES[l.normalized] || l.normalized;
    const nameLetters = extractLetters(name).map(nl => ({
      ...nl,
      value: KABIR_MAP[nl.normalized] ?? 0,
    }));
    const nameTotal = nameLetters.reduce((s, x) => s + x.value, 0);
    return { original: l.original, normalized: l.normalized, name, nameLetters, nameTotal };
  });
  const total = entries.reduce((s, e) => s + e.nameTotal, 0);
  return { entries, total };
}

// ══════════════════════════════════════
// 4 — BAST-I HURUF (5 Levels)
// MANUSCRIPT-LOCKED: Pages 41, 42, 43
// Source: Harflerin Bastı Cetveli (Manuscript pp. 41-43)
// Direct lookup values for each letter at each Bast level
// DO NOT MODIFY - These values are locked to manuscript authority
// ══════════════════════════════════════
export const BAST_TABLE = {
  'ا': { 1: 16,   2: 1047, 3: 594,  4: 1941, 5: 991 },
  'ب': { 1: 616,  2: 1569, 3: 1940, 4: 1046, 5: 921 },
  'ج': { 1: 1041, 2: 469,  3: 1400, 4: 451,  5: 1118 },
  'د': { 1: 283,  2: 2215, 3: 2535, 4: 3299, 5: 2806 },
  'ه': { 1: 709,  2: 734,  3: 1575, 4: 1783, 5: 2007 },
  'و': { 1: 468,  2: 1473, 3: 1689, 4: 1832, 5: 2482 },
  'ز': { 1: 141,  2: 415,  3: 1625, 4: 1980, 5: 1364 },
  'ح': { 1: 612,  2: 1717, 3: 1029, 4: 1288, 5: 1900 },
  'ط': { 1: 539,  2: 2399, 3: 2959, 4: 2627, 5: 2028 },
  'ي': { 1: 579,  2: 1499, 3: 1585, 4: 2243, 5: 2627 },
  'ك': { 1: 635,  2: 2328, 3: 3072, 4: 1968, 5: 1843 },
  'ل': { 1: 1097, 2: 850,  3: 1420, 4: 1086, 5: 1239 },
  'م': { 1: 339,  2: 2731, 3: 2038, 4: 2439, 5: 2703 },
  'ن': { 1: 765,  2: 1428, 3: 1698, 4: 1843, 5: 2149 },
  'س': { 1: 524,  2: 1681, 3: 1309, 4: 1748, 5: 1260 },
  'ع': { 1: 197,  2: 796,  3: 1258, 4: 2008, 5: 1342 },
  'ف': { 1: 657,  2: 1428, 3: 1698, 4: 1843, 5: 2149 },
  'ص': { 1: 595,  2: 2067, 3: 1395, 4: 2513, 5: 3113 },
  'ق': { 1: 60,   2: 524,  3: 1681, 4: 1309, 5: 1748 },
  'ر': { 1: 517,  2: 1483, 3: 2149, 4: 1668, 5: 1772 },
  'ش': { 1: 1095, 2: 1418, 3: 1642, 4: 1591, 5: 1488 },
  'ت': { 1: 337,  2: 2333, 3: 3963, 4: 3313, 5: 3870 },
  'ث': { 1: 763,  2: 1760, 3: 883,  4: 2793, 5: 2561 },
  'خ': { 1: 522,  2: 2014, 3: 1592, 4: 2088, 5: 1991 },
  'ذ': { 1: 195,  2: 1364, 3: 2016, 4: 1777, 5: 647 },
  'ض': { 1: 655,  2: 1996, 3: 1770, 4: 506,  5: 1231 },
  'ظ': { 1: 593,  2: 2399, 3: 2959, 4: 2627, 5: 2028 },
  'غ': { 1: 114,  2: 822,  3: 1906, 4: 1175, 5: 1080 },
};

export function calcBast(text, bastLevel = 1) {
  const src = extractLetters(text);
  const entries = src.map(l => {
    const bastValue = BAST_TABLE[l.normalized]?.[bastLevel] ?? 0;
    return {
      original: l.original,
      normalized: l.normalized,
      value: bastValue,
    };
  });
  // Standalone Hamza (ء) is normalized to ا via NORM, so it inherits the Alif value
  // from the active table (BAST_TABLE['ا']) — never a separate hardcoded Hamza value.
  const total = entries.reduce((s, e) => s + e.value, 0);
  return { entries, total, bastLevel };
}

// ══════════════════════════════════════
// 5 — BASTUL HURUF 2 (INDEPENDENT 5-LEVEL SYSTEM)
// MANUSCRIPT-LOCKED: Harflerin Bastı Cetveli — All 5 Bast Columns
// Source: Manuscript "HARFLERIN BASTI CETVELI" (Pages 41-43)
// Independent from BAST-I HURUF — uses separate manuscript values
// ══════════════════════════════════════
export const BASTUL_HURUF_2_TABLE = {
  'ا': { 1: 16,    2: 911,   3: 6137,   4: 31296,   5: 156119 },
  'ب': { 1: 616,   2: 2888,  3: 11915,  4: 58713,   5: 292178 },
  'ج': { 1: 1041,  2: 3348,  3: 13044,  4: 63051,   5: 316523 },
  'د': { 1: 283,   2: 2055,  3: 11189,  4: 54921,   5: 271164 },
  'ه': { 1: 709,   2: 2094,  3: 9493,   4: 47683,   5: 238889 },
  'و': { 1: 468,   2: 1570,  3: 7288,   4: 37242,   5: 186822 },
  'ز': { 1: 141,   2: 2046,  3: 9868,   4: 44870,   5: 218158 },
  'ح': { 1: 612,   2: 3171,  3: 13970,  4: 69902,   5: 347099 },
  'ط': { 1: 539,   2: 1767,  3: 9969,   4: 50263,   5: 246517 },
  'ي': { 1: 579,   2: 2518,  3: 11672,  4: 56032,   5: 276357 },
  'ك': { 1: 635,   2: 3153,  3: 14825,  4: 70857,   5: 347214 },
  'ل': { 1: 1097,  2: 3983,  3: 16197,  4: 77876,   5: 387380 },
  'م': { 1: 339,   2: 2690,  3: 14342,  4: 69746,   5: 342021 },
  'ن': { 1: 765,   2: 2729,  3: 12646,  4: 62508,   5: 309746 },
  'س': { 1: 524,   2: 2205,  3: 10441,  4: 52067,   5: 257679 },
  'ع': { 1: 197,   2: 2681,  3: 13021,  4: 59695,   5: 289015 },
  'ف': { 1: 657,   2: 3227,  3: 14605,  4: 73055,   5: 361924 },
  'ص': { 1: 594,   2: 2402,  3: 13122,  4: 65088,   5: 317374 },
  'ق': { 1: 60,    2: 1643,  3: 8213,   4: 41644,   5: 204757 },
  'ر': { 1: 517,   2: 2615,  3: 14355,  4: 73777,   5: 362686 },
  'ش': { 1: 1095,  2: 4282,  3: 19163,  4: 95202,   5: 473597 },
  'ت': { 1: 337,   2: 2989,  3: 17308,  4: 87072,   5: 428238 },
  'ث': { 1: 763,   2: 3028,  3: 15612,  4: 79834,   5: 395963 },
  'خ': { 1: 522,   2: 2504,  3: 13407,  4: 69393,   5: 343896 },
  'ذ': { 1: 195,   2: 2980,  3: 15987,  4: 77021,   5: 375232 },
  'ض': { 1: 655,   2: 3526,  3: 17521,  4: 90381,   5: 448141 },
  'ظ': { 1: 593,   2: 2701,  3: 16088,  4: 82414,   5: 403591 },
  'غ': { 1: 114,   2: 1770,  3: 8121,   4: 36939,   5: 182227 },
};

export function calcBast2(text, bastulLevel = 1) {
  const src = extractLetters(text);
  const entries = src.map(l => {
    const bastulValue = BASTUL_HURUF_2_TABLE[l.normalized]?.[bastulLevel] ?? 0;
    return {
      original: l.original,
      normalized: l.normalized,
      value: bastulValue,
    };
  });
  const total = entries.reduce((s, e) => s + e.value, 0);
  return { entries, total, bastulLevel };
}
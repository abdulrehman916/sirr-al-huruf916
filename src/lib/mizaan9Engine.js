// ═══════════════════════════════════════════════════════════════
// MIZAAN 9 ENGINE — COMPLETELY ISOLATED
// Used ONLY by Mizaan9Page. Zero shared code with any other module.
// ═══════════════════════════════════════════════════════════════

// ── MIZAN PERMANENT LOCK IMPORT ──
// This import activates immutable protection for all MIZAN datasets
// Validation runs on module load — failures block execution
import { MIZAN_LOCK_STATUS, validateMizanDatasets } from './mizanCanonicalLock.js';

// ── Own Bast-ul Aval (Birinci Bast) table ──
// MANUSCRIPT-LOCKED: Pages 42-43 (HARFLERİN BASTI CETVELİ)
// These values are the exclusive authority for Mizan letter-to-number conversion.
// FROZEN: Immutable — modification attempts will fail validation
const MIZAAN_BAST1 = Object.freeze({
  'ا': 16,   'ب': 616,  'ج': 1041, 'د': 283,  'ه': 709,
  'و': 468,  'ز': 141,  'ح': 612,  'ط': 539,  'ي': 579,
  'ك': 635,  'ل': 1097, 'م': 339,  'ن': 765,  'س': 524,
  'ع': 197,  'ف': 657,  'ص': 595,  'ق': 60,   'ر': 517,
  'ش': 1095, 'ت': 337,  'ث': 763,  'خ': 522,  'ذ': 195,
  'ض': 655,  'ظ': 593,  'غ': 114,
});

// ═══════════════════════════════════════════════════════════════
// MIZAN PERMANENT ISOLATION LOCK — ENFORCED
// ═══════════════════════════════════════════════════════════════
// This engine is EXCLUSIVELY for Mizan-9 page calculations.
// NO cross-page data sharing. NO imports from other engines.
// All Mizan datasets are frozen and immutable.
// 
// AUTHORITY: MIZAN MANUSCRIPT (Verified & Validated)
// STATUS: PERMANENTLY LOCKED
// ENFORCEMENT: MANDATORY
// ═══════════════════════════════════════════════════════════════

// ── Element map — letters in Mertebe rank order ──
// BAST-1 CALCULATED VALUES from manuscript pages 42-43
// FROZEN: No modifications allowed
const MIZAAN_ELEMENTS_RAW = {
  fire:  { key: 'fire',  labelTR: 'Ateş',   arabic: 'النار',  icon: '🔥', letters: ['ا','ه','ط','م','ف','ش','ذ'], bast2: 3550 },  // Manuscript Anasir First Bast: Fire = 3550
  earth: { key: 'earth', labelTR: 'Toprak', arabic: 'التراب', icon: '🪨', letters: ['ب','و','ي','ن','ص','ت','ض'], bast2: 4015 },  // Manuscript Anasir First Bast: Earth = 4015
  air:   { key: 'air',   labelTR: 'Hava',   arabic: 'الهواء', icon: '🌪', letters: ['ج','ز','ك','س','ق','ث','ظ'], bast2: 3757 },  // Manuscript Anasir First Bast: Air = 3757
  water: { key: 'water', labelTR: 'Su',     arabic: 'الماء',  icon: '💧', letters: ['د','ح','ل','ع','ر','خ','غ'], bast2: 3342 },  // Manuscript Anasir First Bast: Water = 3342
};
export const MIZAAN_ELEMENTS = Object.freeze(MIZAAN_ELEMENTS_RAW);

export const MIZAAN_RANK_NAMES = Object.freeze(['Mertebe','Derece','Dakika','Saniye','Salise','Rabia','Hamise']);

// ── Second Mizan Bast values ──
// FROZEN: No modifications allowed
export const MIZAAN_BAST2 = Object.freeze({
  fire: 3550, earth: 4015, air: 3757, water: 3342,
});

// ── Planet table ──
// FROZEN: No modifications allowed
export const MIZAAN_PLANETS = Object.freeze({
  fire:  { name: 'Merih',   arabic: 'المريخ',  symbol: '♂', bast: 3124, color: '#FF4444' },
  earth: { name: 'Zühal',   arabic: 'زحل',     symbol: '♄', bast: 3886, color: '#9B7FD4' },
  air:   { name: 'Müşteri', arabic: 'المشتري', symbol: '♃', bast: 3757, color: '#74C0FC' },
  water: { name: 'Zühre',   arabic: 'الزهرة',  symbol: '♀', bast: 3342, color: '#F9A8D4' },
});

// ── Day/Night table ──
// FROZEN: No modifications allowed
export const MIZAAN_DAYNIGHT = Object.freeze({
  fire:  { mode: 'Gündüz', arabic: 'النهار', icon: '☀️', bast: 3886, desc: 'Solar radiance — peak daytime energy' },
  earth: { mode: 'Gündüz', arabic: 'النهار', icon: '☀️', bast: 3886, desc: 'Stable daytime grounding force' },
  air:   { mode: 'Gece',   arabic: 'الليل',  icon: '🌙', bast: 3120, desc: 'Nocturnal mental clarity' },
  water: { mode: 'Gece',   arabic: 'الليل',  icon: '🌙', bast: 3120, desc: 'Lunar depths — night reflection' },
});

// ── Mizan suitability table ──
// FROZEN: No modifications allowed
export const MIZAAN_SUITABILITY = Object.freeze({
  fire:  { name: 'Celb',   arabic: 'الجلب',  bast: 3124, desc: 'Attraction & drawing force — powerful magnetism' },
  earth: { name: 'Tard',   arabic: 'الطرد',  bast: 4015, desc: 'Repulsion & banishment — removing obstacles' },
  air:   { name: 'Sıhhat', arabic: 'الصحة',  bast: 3757, desc: 'Health & restoration — healing energy' },
  water: { name: 'Sakam',  arabic: 'السقام', bast: 3342, desc: 'Spiritual remedy — transformative depth' },
});

// ── Mystical interpretation table ──
const MIZAAN_INTERP = {
  fire: [
    'Güçlü çekim enerjisi — fiery attraction dominates',
    'Ruhani ateş aktif — spiritual fire ignited',
    'Celb ve cazibe — magnetic pull is strong',
    'Yüksek irade gücü — solar willpower ascending',
  ],
  earth: [
    'Toprak sabitleyici güç — grounding force is supreme',
    'Tard enerjisi baskın — obstacles dissolve before you',
    'Maddi düzlem güçlü — material world aligned',
    'Sabır ve kalıcılık — enduring Saturnine power',
  ],
  air: [
    'Zihin hâkimiyeti — mental dominance achieved',
    'Sıhhat ve berraklık — clarity and healing arise',
    'Gezegen Müşteri bağlı — Jovian expansion active',
    'Gece enerjisi saf — nocturnal wisdom flows',
  ],
  water: [
    'Duygusal derinlik — lunar emotional depth',
    'Sakam dönüşümü — transformative healing active',
    'Zühre etkisi — Venusian harmony present',
    'Gizli uyum — hidden harmonic resonance',
  ],
};

export function getMizaanInterpretation(dominant, letterCount, bast1Total) {
  if (!dominant) return [];
  const base   = MIZAAN_INTERP[dominant] || [];
  const extras = [];
  if (letterCount > 50)   extras.push('Uzun metin — güçlü birleşik enerji alanı oluştu');
  if (letterCount < 5)    extras.push('Kısa metin — yoğun odaklanmış enerji');
  if (bast1Total > 10000) extras.push('Yüksek bast değeri — güçlü manevi yük taşıyor');
  return [...base, ...extras];
}

// ── Own normalization ──
const MIZAAN_NORM = {
  'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ٱ':'ا',
  'ى':'ي','ئ':'ي',
  'ؤ':'و',
  'ة':'ه',
};

function mNorm(ch) { return MIZAAN_NORM[ch] || ch; }

// ── Own text cleaner ──
function mClean(text) {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[^\u0600-\u06FF]/g, '');
}

// ── Internal lookup tables (built at module load) ──
const M_LETTER_TO_ELEMENT = {};
const M_LETTER_TO_RANK    = {};

for (const [key, el] of Object.entries(MIZAAN_ELEMENTS)) {
  el.letters.forEach((letter, idx) => {
    M_LETTER_TO_ELEMENT[letter] = key;
    M_LETTER_TO_RANK[letter]    = { elementKey: key, rankIndex: idx };
  });
}

// ── Tie-break by Mertebe rank ──
function mResolveTie(tiedKeys, letterDetails) {
  const best = {};
  for (const k of tiedKeys) best[k] = Infinity;

  for (const { norm, element } of letterDetails) {
    if (!tiedKeys.includes(element)) continue;
    const ri = M_LETTER_TO_RANK[norm];
    if (ri && ri.elementKey === element && ri.rankIndex < best[element]) {
      best[element] = ri.rankIndex;
    }
  }

  const sorted = [...tiedKeys].sort((a, b) => best[a] - best[b]);
  const winner = sorted[0];
  if (best[winner] === Infinity) return { winner: tiedKeys[0], rankName: null, rankIndex: null };
  return {
    winner,
    rankIndex: best[winner],
    rankName:  MIZAAN_RANK_NAMES[best[winner]] ?? `Rank ${best[winner] + 1}`,
  };
}

// ── Result builder (shared by sync + async paths) ──
// bast1TotalAccum is an optional pre-accumulated sum — when provided (by the
// scan loops below), it avoids a second O(n) pass over the letters array,
// enabling efficient handling of very large Arabic inputs (full Surahs).
function mBuildResult(text, letters, counts, bast1TotalAccum) {
  const letterCount  = letters.length;
  const bast1Total   = (typeof bast1TotalAccum === 'number') ? bast1TotalAccum : letters.reduce((s, l) => s + l.bast1, 0);

  const elementTotal = Object.values(counts).reduce((a, b) => a + b, 0);
  const percentages  = {};
  for (const k of Object.keys(counts)) {
    percentages[k] = elementTotal > 0 ? Math.round((counts[k] / elementTotal) * 100) : 0;
  }

  let dominant = null;
  let tiebreak = null;

  if (elementTotal > 0) {
    const maxCount = Math.max(...Object.values(counts));
    const topKeys  = Object.keys(counts).filter(k => counts[k] === maxCount);
    if (topKeys.length === 1) {
      dominant = topKeys[0];
    } else {
      const res = mResolveTie(topKeys, letters);
      dominant  = res.winner;
      tiebreak  = { tiedElements: topKeys, rankName: res.rankName, rankIndex: res.rankIndex };
    }
  }

  const bast2Value  = dominant ? (MIZAAN_ELEMENTS[dominant]?.bast2 ?? null) : null;
  const planet      = dominant ? (MIZAAN_PLANETS[dominant] ?? null) : null;
  const daynight    = dominant ? (MIZAAN_DAYNIGHT[dominant] ?? null) : null;
  const suitability = dominant ? (MIZAAN_SUITABILITY[dominant] ?? null) : null;

  return { text, letters, letterCount, bast1Total, counts, percentages, dominant, tiebreak, bast2Value, planet, daynight, suitability };
}

// ── Synchronous analysis ──
export function mizaanAnalyze(text) {
  const clean   = mClean(text);
  const counts  = { fire: 0, water: 0, air: 0, earth: 0 };
  const letters = [];
  let bast1Total = 0;

  for (const ch of clean) {
    const norm    = mNorm(ch);
    const bast1   = MIZAAN_BAST1[norm] ?? 0;
    const element = M_LETTER_TO_ELEMENT[norm] ?? null;
    if (norm in MIZAAN_BAST1) {
      letters.push({ original: ch, norm, bast1, element });
      bast1Total += bast1;
      if (element) counts[element]++;
    }
  }

  return mBuildResult(text, letters, counts, bast1Total);
}

// ── Mizan's own Bast calculation (isolated from Abjad modules) ──
export function mizaanCalcBast(text, bastLevel = 1) {
  const clean = mClean(text);
  const entries = [];
  let total = 0;
  
  for (const ch of clean) {
    const norm = mNorm(ch);
    const bastValue = MIZAAN_BAST1[norm] ?? 0;
    if (norm in MIZAAN_BAST1) {
      entries.push({ original: ch, normalized: norm, value: bastValue });
      total += bastValue;
    }
  }
  
  return { entries, total, bastLevel };
}

// ── Async chunked analysis (non-blocking for long Quranic texts) ──
// Chunk size scales with input length: small inputs process in a single pass,
// very large inputs (full Surahs) use larger chunks to minimise setTimeout
// overhead while still yielding to keep the UI responsive.
function getChunkSize(len) {
  if (len <= 2000) return len;           // small: single pass
  if (len <= 20000) return 2000;         // medium: 2K chunks
  return 5000;                            // large (full Surahs): 5K chunks
}

export async function mizaanAnalyzeAsync(text, onProgress) {
  const clean     = mClean(text);
  const counts    = { fire: 0, water: 0, air: 0, earth: 0 };
  const letters   = [];
  let bast1Total  = 0;
  const CHUNK     = getChunkSize(clean.length);

  for (let i = 0; i < clean.length; i += CHUNK) {
    const chunk = clean.slice(i, i + CHUNK);
    for (const ch of chunk) {
      const norm    = mNorm(ch);
      const bast1   = MIZAAN_BAST1[norm] ?? 0;
      const element = M_LETTER_TO_ELEMENT[norm] ?? null;
      if (norm in MIZAAN_BAST1) {
        letters.push({ original: ch, norm, bast1, element });
        bast1Total += bast1;
        if (element) counts[element]++;
      }
    }
    onProgress?.(Math.min(99, Math.round(((i + CHUNK) / clean.length) * 100)));
    await new Promise(r => setTimeout(r, 0));
  }

  onProgress?.(100);
  return mBuildResult(text, letters, counts, bast1Total);
}
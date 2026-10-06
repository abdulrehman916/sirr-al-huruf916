// ═══════════════════════════════════════════════════════════════
// MIZAAN 9 — SECTION 2 DATA (Placeholder)
// ─────────────────────────────────────────────────────────────
// DO NOT copy Section 1 values here.
// DO NOT assume any values.
// All bast values are 0 (TODO) — fill ONLY from screenshots when provided.
// Each Mizan keeps its own rules. No cross-Mizan borrowing.
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// SECTION 2 — FULL 5-LEVEL BAST TABLE (pp.52–53)
// "ANASIRA GÖRE BASTI ADEDİ CETVELİ"
// Bast1 = IDENTICAL to Section 1 (shared, never changes)
// Bast2–Bast5 = Section 2 values from manuscript screenshots pp.52–53
// DO NOT modify BAST_TABLE in mizaanPostEngine.js (that is Section 1)
// ═══════════════════════════════════════════════════════════════
// [letter]: [bast1, bast2, bast3, bast4, bast5]
export const BAST_TABLE_B = {
  'ا': [16,    911,  6137,  31296,  156119],
  'ه': [709,  2094,  9493,  47683,  238889],
  'ط': [539,  1767,  9969,  50263,  246517],
  'م': [339,  2690, 14342,  69746,  342021],
  'ف': [657,  3227, 14605,  73055,  361924],
  'ش': [1095, 4282, 19163,  95202,  473597],
  'ذ': [195,  2980, 15987,  77021,  375232],
  'ب': [616,  2888, 11915,  58713,  292178],
  'و': [468,  1570,  7288,  37242,  186822],
  'ى': [579,  2518, 11672,  56032,  276357],
  'ي': [579,  2518, 11672,  56032,  276357],  // same as ى
  'ن': [765,  2729, 12646,  62508,  309746],
  'ص': [595,  2402, 13122,  65088,  317374],
  'ت': [337,  2989, 17308,  87072,  428238],
  'ض': [655,  3526, 17521,  90381,  448141],
  'ج': [1041, 3348, 13044,  63051,  316523],
  'ز': [141,  2046,  9868,  44870,  218158],
  'ك': [635,  3153, 14825,  70857,  347214],
  'س': [524,  2205, 10441,  52067,  257679],
  'ق': [60,   1643,  8213,  41644,  204757],
  'ث': [763,  3028, 15612,  79834,  395963],
  'ظ': [593,  2701, 16088,  82414,  403591],
  'د': [283,  2055, 11189,  54921,  271164],
  'ح': [612,  3171, 13970,  69902,  347099],
  'ل': [1097, 3983, 16197,  77876,  387380],
  'ع': [197,  2681, 13021,  59695,  289015],
  'ر': [517,  2615, 14355,  73777,  362686],
  'خ': [522,  2504, 13407,  69393,  343896],
  'غ': [114,  1770,  8121,  36939,  182227],
  // Non-Hamza variant (Hamza forms resolved dynamically via bNorm)
  'ة': [709,  2094,  9493,  47683,  238889],
};

const B_NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ؤ':'و','ئ':'ي' };
function bNorm(ch) { return B_NORM[ch] || ch; }

// Helper: get Bast level N for a letter from Section 2 table
export function getBastLevelB(letter, level) {
  const n = bNorm(letter);
  const row = BAST_TABLE_B[n];
  if (!row) return BAST_TABLE_B['ا']?.[level - 1] || 0;
  return row[level - 1] || 0;
}

// ── M2: Element Letter Group First Bast (Section 2) ──
// Source: Harflerin Bastı Cetveli, pp.93-94 — Birinci Bast column
// Fire  (ا ه ط م ف ش ذ): 16+709+539+339+657+1095+195 = 3550
// Earth (ب و ى ن ص ت ض): 616+468+579+765+594+337+655 = 4014
// Air   (ج ز ك س ق ث ظ): 1041+141+635+524+60+763+593 = 3757
// Water (د ح ل ع ر خ غ): 283+612+1097+197+517+522+114 = 3342
export const MIZAAN_ELEMENTS_B = {
  fire:  { key: 'fire',  labelTR: 'Ateş',   arabic: 'النار',  icon: '🔥', letters: ['ا','ه','ط','م','ف','ش','ذ'], bast2: 3550 },
  earth: { key: 'earth', labelTR: 'Toprak', arabic: 'التراب', icon: '🪨', letters: ['ب','و','ي','ن','ص','ت','ض'], bast2: 4014 },
  air:   { key: 'air',   labelTR: 'Hava',   arabic: 'الهواء', icon: '🌪', letters: ['ج','ز','ك','س','ق','ث','ظ'], bast2: 3757 },
  water: { key: 'water', labelTR: 'Su',     arabic: 'الماء',  icon: '💧', letters: ['د','ح','ل','ع','ر','خ','غ'], bast2: 3342 },
};

export const MIZAAN_BAST2_B = { fire: 3550, earth: 4014, air: 3757, water: 3342 };

// ── M3: Day / Night First Bast (Section 2) ──
export const MIZAAN_DAYNIGHT_B = {
  gunduz: {
    label: 'Gündüz', arabic: 'النهار', icon: '☀️', bast: 0,  // TODO
    desc: 'Solar force', elements: ['fire', 'earth'],
    color: '#FBBF24', glow: 'rgba(251,191,36,0.35)', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.40)',
  },
  gece: {
    label: 'Gece', arabic: 'الليل', icon: '🌙', bast: 0,  // TODO
    desc: 'Lunar force', elements: ['air', 'water'],
    color: '#818CF8', glow: 'rgba(129,140,248,0.35)', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.40)',
  },
};

// ── M4: Hours First Bast (Section 2) ──
export const MIZAAN_HOURS_B = [
  { hour: 1,  arabic: 'الساعة الأولى',         bast: 0 },  // TODO
  { hour: 2,  arabic: 'الساعة الثانية',        bast: 0 },
  { hour: 3,  arabic: 'الساعة الثالثة',        bast: 0 },
  { hour: 4,  arabic: 'الساعة الرابعة',        bast: 0 },
  { hour: 5,  arabic: 'الساعة الخامسة',        bast: 0 },
  { hour: 6,  arabic: 'الساعة السادسة',        bast: 0 },
  { hour: 7,  arabic: 'الساعة السابعة',        bast: 0 },
  { hour: 8,  arabic: 'الساعة الثامنة',        bast: 0 },
  { hour: 9,  arabic: 'الساعة التاسعة',        bast: 0 },
  { hour: 10, arabic: 'الساعة العاشرة',        bast: 0 },
  { hour: 11, arabic: 'الساعة الحادية عشرة',   bast: 0 },
  { hour: 12, arabic: 'الساعة الثانية عشرة',   bast: 0 },
];

// ── M5: Days First Bast (Section 2) ──
export const MIZAAN_DAYS_B = [
  { key: 'sun', arabic: 'الأحد',     icon: '☀️', bast: 0, color: '#FBBF24' },  // TODO
  { key: 'mon', arabic: 'الإثنين',   icon: '🌙', bast: 0, color: '#818CF8' },
  { key: 'tue', arabic: 'الثلاثاء',  icon: '🔥', bast: 0, color: '#F87171' },
  { key: 'wed', arabic: 'الأربعاء',  icon: '🌿', bast: 0, color: '#34D399' },
  { key: 'thu', arabic: 'الخميس',    icon: '⭐', bast: 0, color: '#74C0FC' },
  { key: 'fri', arabic: 'الجمعة',    icon: '🕌', bast: 0, color: '#F9A8D4' },
  { key: 'sat', arabic: 'السبت',     icon: '🪐', bast: 0, color: '#9B7FD4' },
];

// ── M6: Planets First Bast (Section 2) ──
export const MIZAAN_PLANETS_B = [
  { key: 'zuhal',   arabic: 'الزحل',    icon: '🪐', color: '#9B7FD4', bast: 0 },  // TODO
  { key: 'mustari', arabic: 'المشتري',  icon: '✨', color: '#74C0FC', bast: 0 },
  { key: 'merih',   arabic: 'المريخ',   icon: '🔥', color: '#FF4444', bast: 0 },
  { key: 'sems',    arabic: 'الشمس',    icon: '☀️', color: '#FBBF24', bast: 0 },
  { key: 'zuhre',   arabic: 'الزهرة',   icon: '💖', color: '#F9A8D4', bast: 0 },
  { key: 'utarid',  arabic: 'العطارد',  icon: '🧠', color: '#34D399', bast: 0 },
  { key: 'kamer',   arabic: 'القمر',    icon: '🌙', color: '#818CF8', bast: 0 },
];

// ── M7: Purposes First Bast (Section 2) ──
export const MIZAAN_PURPOSES_B = [
  { key: 'celb',   arabic: 'جلب',          icon: '💖', color: '#FF6B6B', bast: 0 },  // TODO
  { key: 'tard',   arabic: 'طرد',          icon: '🚫', color: '#A5C880', bast: 0 },
  { key: 'sihhat', arabic: 'الصحة',        icon: '🩺', color: '#4FC3F7', bast: 0 },
  { key: 'sekam',  arabic: 'السقم',        icon: '☠️', color: '#9B7FD4', bast: 0 },
  { key: 'tarfet', arabic: 'طرفة العين',   icon: '🧿', color: '#D4AF37', bast: 0 },
];

// ── M8: Khayr / Sharr First Bast (Section 2) ──
export const KHAYR_SHARR8_B = {
  khayr: { arabic: 'الخير', icon: '✨', bast: 0, color: '#4ADE80' },  // TODO
  sharr: { arabic: 'الشر',  icon: '⚡', bast: 0, color: '#F87171' },
};

// ── M9: Element Degrees First Bast (Section 2) ──
export const MIZAAN_ELEMENT_DEGREES_B = {
  fire: {
    key: 'fire', arabic: 'درجات النار', icon: '🔥', color: '#FF6B35',
    glow: 'rgba(255,107,53,0.40)', bg: 'rgba(255,107,53,0.10)', border: 'rgba(255,107,53,0.50)',
    degrees: [
      { key: 'f1', arabic: 'النار المستعمل',               bast: 0 },  // TODO
      { key: 'f2', arabic: 'النار تأكل وتشرب',             bast: 0 },
      { key: 'f3', arabic: 'النار لا تأكل ولا تشرب',       bast: 0 },
      { key: 'f4', arabic: 'النار باردة',                   bast: 0 },
    ],
  },
  earth: {
    key: 'earth', arabic: 'درجات التراب', icon: '🌍', color: '#A5C880',
    glow: 'rgba(165,200,128,0.40)', bg: 'rgba(165,200,128,0.10)', border: 'rgba(165,200,128,0.50)',
    degrees: [
      { key: 'e1', arabic: 'التراب القابل يهيج الزرع',                    bast: 0 },
      { key: 'e2', arabic: 'التراب جميع المعادن',                         bast: 0 },
      { key: 'e3', arabic: 'التراب المستعمل للعمارة',                     bast: 0 },
      { key: 'e4', arabic: 'التراب المسن الذي لا يطلع ريح نبات',         bast: 0 },
    ],
  },
  air: {
    key: 'air', arabic: 'درجات الهواء', icon: '🌪', color: '#B2EBF2',
    glow: 'rgba(178,235,242,0.40)', bg: 'rgba(178,235,242,0.10)', border: 'rgba(178,235,242,0.50)',
    degrees: [
      { key: 'a1', arabic: 'الهواء يهب بما ينفع الناس',   bast: 0 },
      { key: 'a2', arabic: 'الهواء عشق ومحبة',             bast: 0 },
      { key: 'a3', arabic: 'الهواء لجميع الطيور',          bast: 0 },
      { key: 'a4', arabic: 'الهواء البارد المفسد',          bast: 0 },
    ],
  },
  water: {
    key: 'water', arabic: 'درجات الماء', icon: '💧', color: '#4FC3F7',
    glow: 'rgba(79,195,247,0.40)', bg: 'rgba(79,195,247,0.10)', border: 'rgba(79,195,247,0.50)',
    degrees: [
      { key: 'w1', arabic: 'الماء الحلو العذب الفرات',              bast: 0 },
      { key: 'w2', arabic: 'الماء المر المنتن',                     bast: 0 },
      { key: 'w3', arabic: 'الماء الزعاق المالح',                   bast: 0 },
      { key: 'w4', arabic: 'الماء الراكد الذي لا طعم له',           bast: 0 },
      { key: 'w5', arabic: 'الماء النقي على الإنسان',               bast: 0 },
    ],
  },
};
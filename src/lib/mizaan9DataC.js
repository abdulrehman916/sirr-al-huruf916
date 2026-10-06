// ═══════════════════════════════════════════════════════════════
// MIZAAN 9 — SECTION 3 DATA (Ebcedi Kebir / Abjad Kabir)
// ─────────────────────────────────────────────────────────────
// Source: Traditional Abjad Kabir (Ebcedi Kebir) letter values
// ا=1 ب=2 ج=3 د=4 ه=5 و=6 ز=7 ح=8 ط=9 ى/ي=10
// ك=20 ل=30 م=40 ن=50 س=60 ع=70 ف=80 ص=90 ق=100
// ر=200 ش=300 ت=400 ث=500 خ=600 ذ=700 ض=800 ظ=900 غ=1000
// ═══════════════════════════════════════════════════════════════

// ── Abjad Kebir (Ebcedi Kebir) letter values ──────────────────
export const ABJAD_KEBIR = {
  'ا': 1,
  'ب': 2,
  'ج': 3,
  'د': 4,
  'ه': 5,   'ة': 5,   'هـ': 5,
  'و': 6,
  'ز': 7,
  'ح': 8,
  'ط': 9,
  'ي': 10,  'ى': 10,
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

// Helper: sum Abjad Kebir values of an Arabic string
function abjadSum(str) {
  if (!str) return 0;
  const cleaned = str
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '') // strip harakat
    .replace(/\u0640/g, ''); // strip tatweel
  let total = 0;
  for (const ch of cleaned) {
    total += ABJAD_KEBIR[ch] || 0;
  }
  return total;
}

// ── Element totals using Abjad Kebir ──────────────────────────
// Fire  (ا ه ط م ف ش ذ): 1+5+9+40+80+300+700 = 1135
// Earth (ب و ي ن ص ت ض): 2+6+10+50+90+400+800 = 1358
// Air   (ج ز ك س ق ث ظ): 3+7+20+60+100+500+900 = 1590
// Water (د ح ل ع ر خ غ): 4+8+30+70+200+600+1000 = 1912

export const MIZAAN_ELEMENTS_C = {
  fire:  { key: 'fire',  labelTR: 'Ateş',   arabic: 'النار',  icon: '🔥', letters: ['ا','ه','ط','م','ف','ش','ذ'], bast2: 1135 },
  earth: { key: 'earth', labelTR: 'Toprak', arabic: 'التراب', icon: '🪨', letters: ['ب','و','ي','ن','ص','ت','ض'], bast2: 1358 },
  air:   { key: 'air',   labelTR: 'Hava',   arabic: 'الهواء', icon: '🌪', letters: ['ج','ز','ك','س','ق','ث','ظ'], bast2: 1590 },
  water: { key: 'water', labelTR: 'Su',     arabic: 'الماء',  icon: '💧', letters: ['د','ح','ل','ع','ر','خ','غ'], bast2: 1912 },
};

export const MIZAAN_BAST2_C = { fire: 1135, earth: 1358, air: 1590, water: 1912 };

// ── M3: Day / Night — Abjad Kebir ─────────────────────────────
// النهار: ا(1)+ل(30)+ن(50)+ه(5)+ا(1)+ر(200) = 287
// الليل:  ا(1)+ل(30)+ل(30)+ي(10)+ل(30) = 101
export const MIZAAN_DAYNIGHT_C = {
  gunduz: {
    label: 'Gündüz', arabic: 'النهار', icon: '☀️', bast: 287,
    desc: 'Solar force', elements: ['fire', 'earth'],
    color: '#FBBF24', glow: 'rgba(251,191,36,0.35)', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.40)',
  },
  gece: {
    label: 'Gece', arabic: 'الليل', icon: '🌙', bast: 101,
    desc: 'Lunar force', elements: ['air', 'water'],
    color: '#818CF8', glow: 'rgba(129,140,248,0.35)', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.40)',
  },
};

// ── M4: Hours — Abjad Kebir ────────────────────────────────────
// Each hour name calculated with abjadSum()
// الساعة الأولى:  ا(1)+ل(30)+س(60)+ا(1)+ع(70)+ة(5)+ا(1)+ل(30)+أ(1)+و(6)+ل(30)+ى(10) = 245
// الساعة الثانية: ا(1)+ل(30)+س(60)+ا(1)+ع(70)+ة(5)+ا(1)+ل(30)+ث(500)+ا(1)+ن(50)+ي(10)+ة(5) = 764
// الساعة الثالثة: ا(1)+ل(30)+س(60)+ا(1)+ع(70)+ة(5)+ا(1)+ل(30)+ث(500)+ا(1)+ل(30)+ث(500)+ة(5) = 1234
// الساعة الرابعة: ا(1)+ل(30)+س(60)+ا(1)+ع(70)+ة(5)+ا(1)+ل(30)+ر(200)+ا(1)+ب(2)+ع(70)+ة(5) = 476
// الساعة الخامسة: ا(1)+ل(30)+س(60)+ا(1)+ع(70)+ة(5)+ا(1)+ل(30)+خ(600)+ا(1)+م(40)+س(60)+ة(5) = 904
// الساعة السادسة: ا(1)+ل(30)+س(60)+ا(1)+ع(70)+ة(5)+ا(1)+ل(30)+س(60)+ا(1)+د(4)+س(60)+ة(5) = 328
// الساعة السابعة: ا(1)+ل(30)+س(60)+ا(1)+ع(70)+ة(5)+ا(1)+ل(30)+س(60)+ا(1)+ب(2)+ع(70)+ة(5) = 336
// الساعة الثامنة: ا(1)+ل(30)+س(60)+ا(1)+ع(70)+ة(5)+ا(1)+ل(30)+ث(500)+ا(1)+م(40)+ن(50)+ة(5) = 794
// الساعة التاسعة: ا(1)+ل(30)+س(60)+ا(1)+ع(70)+ة(5)+ا(1)+ل(30)+ت(400)+ا(1)+س(60)+ع(70)+ة(5) = 734
// الساعة العاشرة: ا(1)+ل(30)+س(60)+ا(1)+ع(70)+ة(5)+ا(1)+ل(30)+ع(70)+ا(1)+ش(300)+ر(200)+ة(5) = 774
// الساعة الحادية عشرة: base(168)+ح(8)+ا(1)+د(4)+ي(10)+ة(5)+ع(70)+ش(300)+ر(200)+ة(5) = 603+168=771 → computed below
// الساعة الثانية عشرة: base(168)+ث(500)+ا(1)+ن(50)+ي(10)+ة(5)+ع(70)+ش(300)+ر(200)+ة(5) = 1141+168=1309 → computed below
export const MIZAAN_HOURS_C = [
  { hour: 1,  arabic: 'الساعة الأولى',         bast: abjadSum('الساعة الأولى') },
  { hour: 2,  arabic: 'الساعة الثانية',        bast: abjadSum('الساعة الثانية') },
  { hour: 3,  arabic: 'الساعة الثالثة',        bast: abjadSum('الساعة الثالثة') },
  { hour: 4,  arabic: 'الساعة الرابعة',        bast: abjadSum('الساعة الرابعة') },
  { hour: 5,  arabic: 'الساعة الخامسة',        bast: abjadSum('الساعة الخامسة') },
  { hour: 6,  arabic: 'الساعة السادسة',        bast: abjadSum('الساعة السادسة') },
  { hour: 7,  arabic: 'الساعة السابعة',        bast: abjadSum('الساعة السابعة') },
  { hour: 8,  arabic: 'الساعة الثامنة',        bast: abjadSum('الساعة الثامنة') },
  { hour: 9,  arabic: 'الساعة التاسعة',        bast: abjadSum('الساعة التاسعة') },
  { hour: 10, arabic: 'الساعة العاشرة',        bast: abjadSum('الساعة العاشرة') },
  { hour: 11, arabic: 'الساعة الحادية عشرة',   bast: abjadSum('الساعة الحادية عشرة') },
  { hour: 12, arabic: 'الساعة الثانية عشرة',   bast: abjadSum('الساعة الثانية عشرة') },
];

// ── M5: Days — Abjad Kebir ─────────────────────────────────────
export const MIZAAN_DAYS_C = [
  { key: 'sun', arabic: 'الأحد',     icon: '☀️', bast: abjadSum('الأحد'),     color: '#FBBF24' },
  { key: 'mon', arabic: 'الإثنين',   icon: '🌙', bast: abjadSum('الإثنين'),   color: '#818CF8' },
  { key: 'tue', arabic: 'الثلاثاء',  icon: '🔥', bast: abjadSum('الثلاثاء'),  color: '#F87171' },
  { key: 'wed', arabic: 'الأربعاء',  icon: '🌿', bast: abjadSum('الأربعاء'),  color: '#34D399' },
  { key: 'thu', arabic: 'الخميس',    icon: '⭐', bast: abjadSum('الخميس'),    color: '#74C0FC' },
  { key: 'fri', arabic: 'الجمعة',    icon: '🕌', bast: abjadSum('الجمعة'),    color: '#F9A8D4' },
  { key: 'sat', arabic: 'السبت',     icon: '🪐', bast: abjadSum('السبت'),     color: '#9B7FD4' },
];

// ── M6: Planets — Abjad Kebir ─────────────────────────────────
export const MIZAAN_PLANETS_C = [
  { key: 'zuhal',   arabic: 'الزحل',    icon: '🪐', color: '#9B7FD4', bast: abjadSum('الزحل') },
  { key: 'mustari', arabic: 'المشتري',  icon: '✨', color: '#74C0FC', bast: abjadSum('المشتري') },
  { key: 'merih',   arabic: 'المريخ',   icon: '🔥', color: '#FF4444', bast: abjadSum('المريخ') },
  { key: 'sems',    arabic: 'الشمس',    icon: '☀️', color: '#FBBF24', bast: abjadSum('الشمس') },
  { key: 'zuhre',   arabic: 'الزهرة',   icon: '💖', color: '#F9A8D4', bast: abjadSum('الزهرة') },
  { key: 'utarid',  arabic: 'العطارد',  icon: '🧠', color: '#34D399', bast: abjadSum('العطارد') },
  { key: 'kamer',   arabic: 'القمر',    icon: '🌙', color: '#818CF8', bast: abjadSum('القمر') },
];

// ── M7: Purposes — Abjad Kebir ─────────────────────────────────
export const MIZAAN_PURPOSES_C = [
  { key: 'celb',   arabic: 'جلب',          icon: '💖', color: '#FF6B6B', bast: abjadSum('جلب') },
  { key: 'tard',   arabic: 'طرد',          icon: '🚫', color: '#A5C880', bast: abjadSum('طرد') },
  { key: 'sihhat', arabic: 'الصحة',        icon: '🩺', color: '#4FC3F7', bast: abjadSum('الصحة') },
  { key: 'sekam',  arabic: 'السقم',        icon: '☠️', color: '#9B7FD4', bast: abjadSum('السقم') },
  { key: 'tarfet', arabic: 'طرفة العين',   icon: '🧿', color: '#D4AF37', bast: abjadSum('طرفة العين') },
];

// ── M8: Khayr / Sharr — Abjad Kebir ───────────────────────────
export const KHAYR_SHARR8_C = {
  khayr: { arabic: 'الخير', icon: '✨', bast: abjadSum('الخير'), color: '#4ADE80' },
  sharr: { arabic: 'الشر',  icon: '⚡', bast: abjadSum('الشر'),  color: '#F87171' },
};

// ── M9: Element Degrees — Abjad Kebir ─────────────────────────
export const MIZAAN_ELEMENT_DEGREES_C = {
  fire: {
    key: 'fire', arabic: 'درجات النار', icon: '🔥', color: '#FF6B35',
    glow: 'rgba(255,107,53,0.40)', bg: 'rgba(255,107,53,0.10)', border: 'rgba(255,107,53,0.50)',
    degrees: [
      { key: 'f1', arabic: 'النار المستعمل',               bast: abjadSum('النار المستعمل') },
      { key: 'f2', arabic: 'النار تأكل وتشرب',             bast: abjadSum('النار تأكل وتشرب') },
      { key: 'f3', arabic: 'النار لا تأكل ولا تشرب',       bast: abjadSum('النار لا تأكل ولا تشرب') },
      { key: 'f4', arabic: 'النار باردة',                   bast: abjadSum('النار باردة') },
    ],
  },
  earth: {
    key: 'earth', arabic: 'درجات التراب', icon: '🌍', color: '#A5C880',
    glow: 'rgba(165,200,128,0.40)', bg: 'rgba(165,200,128,0.10)', border: 'rgba(165,200,128,0.50)',
    degrees: [
      { key: 'e1', arabic: 'التراب القابل يهيج الزرع',                    bast: abjadSum('التراب القابل يهيج الزرع') },
      { key: 'e2', arabic: 'التراب جميع المعادن',                         bast: abjadSum('التراب جميع المعادن') },
      { key: 'e3', arabic: 'التراب المستعمل للعمارة',                     bast: abjadSum('التراب المستعمل للعمارة') },
      { key: 'e4', arabic: 'التراب المسن الذي لا يطلع ريح نبات',         bast: abjadSum('التراب المسن الذي لا يطلع ريح نبات') },
    ],
  },
  air: {
    key: 'air', arabic: 'درجات الهواء', icon: '🌪', color: '#B2EBF2',
    glow: 'rgba(178,235,242,0.40)', bg: 'rgba(178,235,242,0.10)', border: 'rgba(178,235,242,0.50)',
    degrees: [
      { key: 'a1', arabic: 'الهواء يهب بما ينفع الناس',   bast: abjadSum('الهواء يهب بما ينفع الناس') },
      { key: 'a2', arabic: 'الهواء عشق ومحبة',             bast: abjadSum('الهواء عشق ومحبة') },
      { key: 'a3', arabic: 'الهواء لجميع الطيور',          bast: abjadSum('الهواء لجميع الطيور') },
      { key: 'a4', arabic: 'الهواء البارد المفسد',          bast: abjadSum('الهواء البارد المفسد') },
    ],
  },
  water: {
    key: 'water', arabic: 'درجات الماء', icon: '💧', color: '#4FC3F7',
    glow: 'rgba(79,195,247,0.40)', bg: 'rgba(79,195,247,0.10)', border: 'rgba(79,195,247,0.50)',
    degrees: [
      { key: 'w1', arabic: 'الماء الحلو العذب الفرات',              bast: abjadSum('الماء الحلو العذب الفرات') },
      { key: 'w2', arabic: 'الماء المر المنتن',                     bast: abjadSum('الماء المر المنتن') },
      { key: 'w3', arabic: 'الماء الزعاق المالح',                   bast: abjadSum('الماء الزعاق المالح') },
      { key: 'w4', arabic: 'الماء الراكد الذي لا طعم له',           bast: abjadSum('الماء الراكد الذي لا طعم له') },
      { key: 'w5', arabic: 'الماء النقي على الإنسان',               bast: abjadSum('الماء النقي على الإنسان') },
    ],
  },
};

// ── Element letter groups (same as Section 1) ─────────────────
const ELEMENT_LETTERS_C = {
  fire:  ['ا','ه','ط','م','ف','ش','ذ'],
  earth: ['ب','و','ي','ن','ص','ت','ض'],
  air:   ['ج','ز','ك','س','ق','ث','ظ'],
  water: ['د','ح','ل','ع','ر','خ','غ'],
};

const LETTER_TO_ELEMENT_C = {};
for (const [el, letters] of Object.entries(ELEMENT_LETTERS_C)) {
  for (const l of letters) LETTER_TO_ELEMENT_C[l] = el;
}

// Normalize Arabic variants (same as mizaan9Engine)
const C_NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ئ':'ي','ؤ':'و','ة':'ه' };
function cNorm(ch) { return C_NORM[ch] || ch; }
function cClean(text) {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[^\u0600-\u06FF]/g, '');
}

/**
 * mizaanAnalyzeAbjad(text)
 * Same analysis as mizaanAnalyze but uses Abjad Kebir values instead of Bast1.
 */
export function mizaanAnalyzeAbjad(text) {
  const clean = cClean(text);
  const counts = { fire: 0, water: 0, air: 0, earth: 0 };
  const letters = [];

  for (const ch of clean) {
    const norm = cNorm(ch);
    const bast1 = ABJAD_KEBIR[norm] ?? 0;
    const element = LETTER_TO_ELEMENT_C[norm] ?? null;
    if (norm in ABJAD_KEBIR) {
      letters.push({ original: ch, norm, bast1, element });
      if (element) counts[element]++;
    }
  }

  const letterCount = letters.length;
  const bast1Total  = letters.reduce((s, l) => s + l.bast1, 0);
  const elementTotal = Object.values(counts).reduce((a, b) => a + b, 0);
  const percentages = {};
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
      dominant = topKeys[0];
      tiebreak = { tiedElements: topKeys, rankName: null, rankIndex: null };
    }
  }

  const bast2Value  = dominant ? (MIZAAN_BAST2_C[dominant] ?? null) : null;
  return { text, letters, letterCount, bast1Total, counts, percentages, dominant, tiebreak, bast2Value, planet: null, daynight: null, suitability: null };
}
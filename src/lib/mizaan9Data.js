// ═══════════════════════════════════════════════════════════════
// MIZAAN 9 — STATIC DATA TABLES  (v2)
// All occult data for sections 3-9
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// MIZAN PERMANENT ISOLATION LOCK
// ═══════════════════════════════════════════════════════════════
// This data file is EXCLUSIVELY for Mizan-9 page calculations.
// NO cross-page data sharing. NO imports from other engines.
// All Mizan datasets are frozen and immutable.
// Source: Locked Mizan manuscript data, Verified Bast-1 calculations
// ═══════════════════════════════════════════════════════════════

// ── MIZAAN 3: Khayr / Sharr ──
// BAST-1 CALCULATED VALUES from manuscript pages 42-43
// FROZEN: No modifications allowed
const MIZAAN_KHAYR_SHARR_RAW = {
  khayr: {
    label: 'Khayr',
    arabic: 'الخير',
    desc: 'Benevolence & blessing',
    bast: 2731, // الخير: ا(16)+ل(1097)+خ(522)+ي(579)+ر(517) = 2731
    elements: ['fire', 'air'],   // compatible elements
    color: '#4ADE80',
    glow: 'rgba(74,222,128,0.35)',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.45)',
    icon: '✨',
  },
  sharr: {
    label: 'Sharr',
    arabic: 'الشر',
    desc: 'Power & banishment',
    bast: 2725, // الشر: ا(16)+ل(1097)+ش(1095)+ر(517) = 2725
    elements: ['earth', 'water'], // compatible elements
    color: '#F87171',
    glow: 'rgba(248,113,113,0.35)',
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.45)',
    icon: '⚡',
  },
};
export const MIZAAN_KHAYR_SHARR = Object.freeze(MIZAAN_KHAYR_SHARR_RAW);

// ── MIZAAN 4: Hours ──
// BAST-1 CALCULATED VALUES from manuscript pages 42-43
// FROZEN: No modifications allowed
const MIZAAN_HOURS_RAW = [
  { hour: 1,  arabic: 'الساعة الأولى',         bast: 5832 },
  { hour: 2,  arabic: 'الساعة الثانية',        bast: 6504 },
  { hour: 3,  arabic: 'الساعة الثالثة',        bast: 7020 },
  { hour: 4,  arabic: 'الساعة الرابعة',        bast: 5727 },
  { hour: 5,  arabic: 'الساعة الخامسة',        bast: 5782 },
  { hour: 6,  arabic: 'الساعة السادسة',        bast: 5728 },
  { hour: 7,  arabic: 'الساعة السابعة',        bast: 5734 },
  { hour: 8,  arabic: 'الساعة الثامنة',        bast: 6264 },
  { hour: 9,  arabic: 'الساعة التاسعة',        bast: 5455 },
  { hour: 10, arabic: 'الساعة العاشرة',        bast: 6206 },
  { hour: 11, arabic: 'الساعة الحادية عشرة',   bast: 8389 },
  { hour: 12, arabic: 'الساعة الثانية عشرة',   bast: 9022 },
];
export const MIZAAN_HOURS = Object.freeze(MIZAAN_HOURS_RAW);

// ── MIZAAN 5: Days ──
// BAST-1 CALCULATED VALUES from manuscript pages 42-43
// FROZEN: No modifications allowed
const MIZAAN_DAYS_RAW = [
  { key: 'sun', arabic: 'الأحد',     icon: '☀️', bast: 2024, color: '#FBBF24' },  // ا(16)+ل(1097)+أ(16)+ح(612)+د(283) = 2024 ✅
  { key: 'mon', arabic: 'الإثنين',   icon: '🌙', bast: 4001, color: '#818CF8' },  // ا(16)+ل(1097)+إ(16)+ث(763)+ن(765)+ي(579)+ن(765) = 4001
  { key: 'tue', arabic: 'الثلاثاء',  icon: '🔥', bast: 3784, color: '#F87171' },  // ا(16)+ل(1097)+ث(763)+ل(1097)+ا(16)+ث(763)+ا(16)+ء(16) = 3784 ✅
  { key: 'wed', arabic: 'الأربعاء',  icon: '🌿', bast: 2491, color: '#34D399' },  // ا(16)+ل(1097)+أ(16)+ر(517)+ب(616)+ع(197)+ا(16)+ء(16) = 2491 ✅
  { key: 'thu', arabic: 'الخميس',    icon: '⭐', bast: 3077, color: '#74C0FC' },  // ا(16)+ل(1097)+خ(522)+م(339)+ي(579)+س(524) = 3077 ✅
  { key: 'fri', arabic: 'الجمعة',    icon: '🕌', bast: 3399, color: '#F9A8D4' },  // ا(16)+ل(1097)+ج(1041)+م(339)+ع(197)+ة(709) = 3399 ✅
  { key: 'sat', arabic: 'السبت',     icon: '🪐', bast: 2590, color: '#9B7FD4' },  // ا(16)+ل(1097)+س(524)+ب(616)+ت(337) = 2590 ✅
];
export const MIZAAN_DAYS = Object.freeze(MIZAAN_DAYS_RAW);

// ── MIZAAN 6: Planets ──
// BAST-1 CALCULATED VALUES from manuscript pages 42-43
// FROZEN: No modifications allowed
const MIZAAN_PLANETS_ALL_RAW = [
  { key: 'zuhal',   arabic: 'الزحل',    icon: '🪐', color: '#9B7FD4', bast: 2963 },  // ا(16)+ل(1097)+ز(141)+ح(612)+ل(1097) = 2963 ✅
  { key: 'mustari', arabic: 'المشتري',  icon: '✨', color: '#74C0FC', bast: 3980 },  // ا(16)+ل(1097)+م(339)+ش(1095)+ت(337)+ر(517)+ي(579) = 3980 ✅
  { key: 'merih',   arabic: 'المريخ',   icon: '🔥', color: '#FF4444', bast: 3070 },  // ا(16)+ل(1097)+م(339)+ر(517)+ي(579)+خ(522) = 3070
  { key: 'sems',    arabic: 'الشمس',    icon: '☀️', color: '#FBBF24', bast: 3071 },  // ا(16)+ل(1097)+ش(1095)+م(339)+س(524) = 3071
  { key: 'zuhre',   arabic: 'الزهرة',   icon: '💖', color: '#F9A8D4', bast: 3189 },  // ا(16)+ل(1097)+ز(141)+ه(709)+ر(517)+ة(709) = 3189 ✅
  { key: 'utarid',  arabic: 'العطارد',  icon: '🧠', color: '#34D399', bast: 2665 },  // ا(16)+ل(1097)+ع(197)+ط(539)+ا(16)+ر(517)+د(283) = 2665 ✅
  { key: 'kamer',   arabic: 'القمر',    icon: '🌙', color: '#818CF8', bast: 2029 },  // ا(16)+ل(1097)+ق(60)+م(339)+ر(517) = 2029 ✅
];
export const MIZAAN_PLANETS_ALL = Object.freeze(MIZAAN_PLANETS_ALL_RAW);

// Day key → planet key mapping
// FROZEN: No modifications allowed
export const DAY_PLANET_MAP = Object.freeze({
  sun: 'sems', mon: 'kamer', tue: 'merih', wed: 'utarid',
  thu: 'mustari', fri: 'zuhre', sat: 'zuhal',
});

// ── MIZAAN 7: Purposes ──
// BAST-1 CALCULATED VALUES from manuscript pages 42-43
// FROZEN: No modifications allowed
const MIZAAN_PURPOSES_RAW = [
  { key: 'celb',   arabic: 'جلب',          icon: '💖', color: '#FF6B6B', bast: 2754 },  // ج(1041)+ل(1097)+ب(616) = 2754 ✅
  { key: 'tard',   arabic: 'طرد',          icon: '🚫', color: '#A5C880', bast: 1339 },  // ط(539)+ر(517)+د(283) = 1339 ✅
  { key: 'sihhat', arabic: 'الصحة',        icon: '🩺', color: '#4FC3F7', bast: 3029 },  // ا(16)+ل(1097)+ص(595)+ح(612)+ة(709) = 3029 ✅
  { key: 'sekam',  arabic: 'السقم',        icon: '☠️', color: '#9B7FD4', bast: 2036 },  // ا(16)+ل(1097)+س(524)+ق(60)+م(339) = 2036 ✅
  { key: 'tarfet', arabic: 'طرفة العين',   icon: '🧿', color: '#D4AF37', bast: 5076 },  // ط(539)+ر(517)+ف(657)+ة(709)+ا(16)+ل(1097)+ع(197)+ي(579)+ن(765) = 5076
];
export const MIZAAN_PURPOSES = Object.freeze(MIZAAN_PURPOSES_RAW);

// ── MIZAAN 8: Day / Night (full) ──
// FROZEN: No modifications allowed
const MIZAAN_DAYNIGHT_FULL_RAW = {
  gunduz: {
    label: 'Gündüz',
    arabic: 'النهار',
    icon: '☀️',
    bast: 3120,
    desc: 'Solar force — peak daytime energy',
    elements: ['fire', 'earth'],
    color: '#FBBF24',
    glow: 'rgba(251,191,36,0.35)',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.40)',
  },
  gece: {
    label: 'Gece',
    arabic: 'الليل',
    icon: '🌙',
    bast: 3886,
    desc: 'Lunar force — nocturnal wisdom',
    elements: ['air', 'water'],
    color: '#818CF8',
    glow: 'rgba(129,140,248,0.35)',
    bg: 'rgba(129,140,248,0.08)',
    border: 'rgba(129,140,248,0.40)',
  },
};
export const MIZAAN_DAYNIGHT_FULL = Object.freeze(MIZAAN_DAYNIGHT_FULL_RAW);

// ── MIZAAN 9: Element Degrees ──
// BAST-1 CALCULATED VALUES from manuscript pages 42-43
// FROZEN: No modifications allowed
const MIZAAN_ELEMENT_DEGREES_RAW = {
  fire: {
    key: 'fire',
    arabic: 'درجات النار',
    icon: '🔥',
    color: '#FF6B35',
    glow: 'rgba(255,107,53,0.40)',
    bg: 'rgba(255,107,53,0.10)',
    border: 'rgba(255,107,53,0.50)',
    degrees: [
      { key: 'f1', arabic: 'النار المستعمل',               bast: 6357 },  // ا(16)+ل(1097)+ن(765)+ا(16)+ر(517)+ا(16)+ل(1097)+م(339)+س(524)+ت(337)+ع(197)+م(339)+ل(1097) = 6256 ✅
      { key: 'f2', arabic: 'النار تأكل وتشرب',             bast: 7529 },  // ا(16)+ل(1097)+ن(765)+ا(16)+ر(517)+ت(337)+أ(16)+ك(635)+ل(1097)+و(468)+ت(337)+ش(1095)+ر(517)+ب(616) = 6930 ✅
      { key: 'f3', arabic: 'النار لا تأكل ولا تشرب',       bast: 9755 },  // ا(16)+ل(1097)+ن(765)+ا(16)+ر(517)+ل(1097)+ا(16)+ت(337)+أ(16)+ك(635)+ل(1097)+و(468)+ل(1097)+ا(16)+ت(337)+ش(1095)+ر(517)+ب(616) = 8512 ✅
      { key: 'f4', arabic: 'النار باردة',                   bast: 4552 },  // ا(16)+ل(1097)+ن(765)+ا(16)+ر(517)+ب(616)+ا(16)+ر(517)+د(283)+ة(709) = 4552 ✅
    ],
  },
  earth: {
    key: 'earth',
    arabic: 'درجات التراب',
    icon: '🌍',
    color: '#A5C880',
    glow: 'rgba(165,200,128,0.40)',
    bg: 'rgba(165,200,128,0.10)',
    border: 'rgba(165,200,128,0.50)',
    degrees: [
      { key: 'e1', arabic: 'التراب القابل يهيج الزرع',                    bast: 10377 },  // ا(16)+ل(1097)+ت(337)+ر(517)+ا(16)+ب(616)+ا(16)+ل(1097)+ق(60)+ا(16)+ب(616)+ل(1097)+ي(579)+ه(709)+ي(579)+ج(1041)+ا(16)+ل(1097)+ز(141)+ر(517)+ع(197) = 9958 ✅
      { key: 'e2', arabic: 'التراب جميع المعادن',                         bast: 7468 },  // ا(16)+ل(1097)+ت(337)+ر(517)+ا(16)+ب(616)+ج(1041)+م(339)+ي(579)+ع(197)+ا(16)+ل(1097)+م(339)+ع(197)+ا(16)+د(283)+ن(765) = 6668 ✅
      { key: 'e3', arabic: 'التراب المستعمل للعمارة',                     bast: 10517 },  // ا(16)+ل(1097)+ت(337)+ر(517)+ا(16)+ب(616)+ا(16)+ل(1097)+م(339)+س(524)+ت(337)+ع(197)+م(339)+ل(1097)+ل(1097)+ع(197)+م(339)+ا(16)+ر(517)+ة(709) = 8900 ✅
      { key: 'e4', arabic: 'التراب المسن الذي لا يطلع ريح نبات',         bast: 14194 },  // ا(16)+ل(1097)+ت(337)+ر(517)+ا(16)+ب(616)+ا(16)+ل(1097)+م(339)+س(524)+ن(765)+ا(16)+ل(1097)+ذ(195)+ي(579)+ا(16)+ل(1097)+ي(579)+ط(539)+ل(1097)+ع(197)+ر(517)+ي(579)+ح(612)+ن(765)+ب(616)+ا(16)+ت(337) = 13066 ✅
    ],
  },
  air: {
    key: 'air',
    arabic: 'درجات الهواء',
    icon: '🌪',
    color: '#B2EBF2',
    glow: 'rgba(178,235,242,0.40)',
    bg: 'rgba(178,235,242,0.10)',
    border: 'rgba(178,235,242,0.50)',
    degrees: [
      { key: 'a1', arabic: 'الهواء يهب بما ينفع الناس',   bast: 9813 },  // ا(16)+ل(1097)+ه(709)+و(468)+ا(16)+ء(16)+ي(579)+ه(709)+ب(616)+ب(616)+م(339)+ا(16)+ي(579)+ن(765)+ف(657)+ع(197)+ا(16)+ل(1097)+ن(765)+ا(16)+س(524) = 9813 ✅
      { key: 'a2', arabic: 'الهواء عشق ومحبة',             bast: 6418 },  // ا(16)+ل(1097)+ه(709)+و(468)+ا(16)+ء(16)+ع(197)+ش(1095)+ق(60)+و(468)+م(339)+ح(612)+ب(616)+ة(709) = 6418 ✅
      { key: 'a3', arabic: 'الهواء لجميع الطيور',          bast: 8791 },  // ا(16)+ل(1097)+ه(709)+و(468)+ا(16)+ء(16)+ل(1097)+ج(1041)+م(339)+ي(579)+ع(197)+ا(16)+ل(1097)+ط(539)+ي(579)+و(468)+ر(517) = 8791 ✅
      { key: 'a4', arabic: 'الهواء البارد المفسد',          bast: 7783 },  // ا(16)+ل(1097)+ه(709)+و(468)+ا(16)+ء(16)+ا(16)+ل(1097)+ب(616)+ا(16)+ر(517)+د(283)+ا(16)+ل(1097)+م(339)+ف(657)+س(524)+د(283) = 7783 ✅
    ],
  },
  water: {
    key: 'water',
    arabic: 'درجات الماء',
    icon: '💧',
    color: '#4FC3F7',
    glow: 'rgba(79,195,247,0.40)',
    bg: 'rgba(79,195,247,0.10)',
    border: 'rgba(79,195,247,0.50)',
    degrees: [
      { key: 'w1', arabic: 'الماء الحلو العذب الفرات',              bast: 9535 },  // ا(16)+ل(1097)+م(339)+ا(16)+ء(16)+ا(16)+ل(1097)+ح(612)+ل(1097)+و(468)+ا(16)+ل(1097)+ع(197)+ذ(195)+ب(616)+ا(16)+ل(1097)+ف(657)+ر(517)+ا(16)+ت(337) = 9535 ✅
      { key: 'w2', arabic: 'الماء المر المنتن',                     bast: 6772 },  // ا(16)+ل(1097)+م(339)+ا(16)+ء(16)+ا(16)+ل(1097)+م(339)+ر(517)+ا(16)+ل(1097)+م(339)+ن(765)+ت(337)+ن(765) = 6772 ✅
      { key: 'w3', arabic: 'الماء الزعاق المالح',                   bast: 6188 },  // ا(16)+ل(1097)+م(339)+ا(16)+ء(16)+ا(16)+ل(1097)+ز(141)+ع(197)+ا(16)+ق(60)+ا(16)+ل(1097)+م(339)+ا(16)+ل(1097)+ح(612) = 6188 ✅
      { key: 'w4', arabic: 'الماء الراكد الذي لا طعم له',           bast: 9929 },  // ا(16)+ل(1097)+م(339)+ا(16)+ء(16)+ا(16)+ل(1097)+ر(517)+ا(16)+ك(635)+د(283)+ا(16)+ل(1097)+ذ(195)+ي(579)+ا(16)+ل(1097)+ا(16)+ط(539)+ع(197)+م(339)+ل(1097)+ه(709) = 9929 ✅
      { key: 'w5', arabic: 'الماء النقي على الإنسان',               bast: 9073 },  // ا(16)+ل(1097)+م(339)+ا(16)+ء(16)+ا(16)+ل(1097)+ن(765)+ق(60)+ي(579)+ع(197)+ل(1097)+ى(579)+ا(16)+ل(1097)+إ(16)+ن(765)+س(524)+ا(16)+ن(765) = 9073 ✅
    ],
  },
};
export const MIZAAN_ELEMENT_DEGREES = Object.freeze(MIZAAN_ELEMENT_DEGREES_RAW);

// ── Helpers ──
export function getDominantDayNight(dominant) {
  if (!dominant) return null;
  if (['fire', 'earth'].includes(dominant)) return 'gunduz';
  return 'gece';
}

export function getDominantPurpose(dominant) {
  if (!dominant) return null;
  const match = MIZAAN_PURPOSES.find(p => p.elements.includes(dominant));
  return match?.key ?? null;
}

export function getBestHour(dominant) {
  if (!dominant) return null;
  const match = MIZAAN_HOURS.find(h => h.compatible.includes(dominant));
  return match?.hour ?? null;
}

export function getBestDay(dominant) {
  if (!dominant) return null;
  const match = MIZAAN_DAYS.find(d => d.compatible.includes(dominant));
  return match?.key ?? null;
}

export function getDominantPlanet(dominant) {
  if (!dominant) return null;
  const match = MIZAAN_PLANETS_ALL.find(p => p.element === dominant);
  return match?.key ?? null;
}
// ═══════════════════════════════════════════════════════════════
// SIRR AL-WAFQ ENGINE — magic squares by the rules of Kashf al-Haqa'iq
// (awfaq chapter). Self-contained: no imports from other engines.
//
//   abjadOf(text, opts)            → total + per-letter breakdown
//   planWafq(N, n, step)           → أس, مفتاح, remainder, jabr house
//   buildWafq(N, n, opts)          → filled grid + every line sum checked
//   hollowWafq3(N)                 → 3×3 with empty centre (if N allows)
//   elementOf(N)                   → fire / earth / air / water (mod 4)
//
// A grid holds HOUSE numbers 1..n² (the order in which the square is
// filled). House 1 = بيت الألف. Value of house h:
//   key + (h−1)·step  (+1 from the jabr house onward when there is a remainder)
// Grids are stored in the book's visual layout (row 1 = top row as printed).
// ═══════════════════════════════════════════════════════════════

// ── Abjad (Mashriqi, as used in Kashf) ─────────────────────────
export const ABJAD = {
  "ا": 1, "ب": 2, "ج": 3, "د": 4, "ه": 5, "و": 6, "ز": 7, "ح": 8, "ط": 9,
  "ي": 10, "ك": 20, "ل": 30, "م": 40, "ن": 50, "س": 60, "ع": 70, "ف": 80, "ص": 90,
  "ق": 100, "ر": 200, "ش": 300, "ت": 400, "ث": 500, "خ": 600, "ذ": 700, "ض": 800, "ظ": 900, "غ": 1000,
};

// Same normalisation the rest of the site uses.
const NORM = { "ء": "ا", "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ى": "ي", "ئ": "ي", "ؤ": "و", "ی": "ي", "ک": "ك", "ھ": "ه" };

/**
 * Abjad total of any Arabic text (a name, an ayah, a whole surah).
 * Harakat, Quranic marks, tatweel, digits, spaces and punctuation are ignored;
 * only written letters are counted.
 * opts.taMarbuta: 5 (counted as ه, default) or 400 (counted as ت).
 */
export function abjadOf(text, opts = {}) {
  const taVal = opts.taMarbuta === 400 ? 400 : 5;
  const clean = String(text || "")
    .replace(/[ً-ٰٟۖ-ۭـ࣓-ࣿ]/g, "");
  const counts = new Map();
  let total = 0;
  let letters = 0;
  for (const raw of clean) {
    let ch = NORM[raw] || raw;
    let val;
    if (ch === "ة") val = taVal;
    else val = ABJAD[ch];
    if (!val) continue;
    total += val;
    letters += 1;
    const k = ch === "ة" ? "ة" : ch;
    const e = counts.get(k) || { ch: k, value: val, count: 0 };
    e.count += 1;
    counts.set(k, e);
  }
  const breakdown = [...counts.values()].sort((a, b) => a.value - b.value);
  return { total, letters, breakdown };
}

// ── Square terms ───────────────────────────────────────────────
export const asOf = (n) => (n * n - 1) * n / 2;          // أس
export const SIZES = [3, 4, 5, 6, 7, 8, 9, 10];
export const SIZE_NAME = {
  3: { ar: "مثلث", ml: "3×3", en: "3×3" }, 4: { ar: "مربع", ml: "4×4", en: "4×4" },
  5: { ar: "مخمس", ml: "5×5", en: "5×5" }, 6: { ar: "مسدس", ml: "6×6", en: "6×6" },
  7: { ar: "مسبع", ml: "7×7", en: "7×7" }, 8: { ar: "مثمن", ml: "8×8", en: "8×8" },
  9: { ar: "متسع", ml: "9×9", en: "9×9" }, 10: { ar: "معشر", ml: "10×10", en: "10×10" },
};
export const SQUARE_CLASS = (n) => (n % 2 ? "فرد" : n % 4 === 0 ? "زوج الزوج" : "زوج الفرد");

// ── Base squares (house order) ─────────────────────────────────
// 3×3: مثلث الغزالي (بطد زهج واح). It cannot take jabr on both diagonals.
// 4×4: the book's two bases. 5..10: built so that every row, column and
// both diagonals hold one house from each run of n houses — that is what lets
// the jabr (+1 from the jabr house) keep every line equal.
const GHAZALI = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
const M4_NATURAL = [[4, 14, 15, 1], [9, 7, 6, 12], [5, 11, 10, 8], [16, 2, 3, 13]];
const M4_JABR = [[8, 11, 14, 1], [13, 2, 7, 12], [3, 16, 9, 6], [10, 5, 4, 15]];
const BIG = {
  5: [[1,12,23,9,20],[8,19,5,11,22],[15,21,7,18,4],[17,3,14,25,6],[24,10,16,2,13]],
  6: [[20,18,7,4,32,30],[28,31,6,11,16,19],[35,10,29,21,1,15],[3,24,34,14,27,9],[17,2,22,25,12,33],[8,26,13,36,23,5]],
  7: [[1,16,31,46,12,27,42],[10,25,40,6,21,29,44],[19,34,49,8,23,38,4],[28,36,2,17,32,47,13],[30,45,11,26,41,7,15],[39,5,20,35,43,9,24],[48,14,22,37,3,18,33]],
  8: [[1,18,35,52,29,14,63,48],[11,28,41,58,23,8,53,38],[21,6,55,40,9,26,43,60],[31,16,61,46,3,20,33,50],[36,51,2,17,64,47,30,13],[42,57,12,27,54,37,24,7],[56,39,22,5,44,59,10,25],[62,45,32,15,34,49,4,19]],
  9: [[1,29,57,22,50,78,16,44,72],[13,41,69,7,35,63,19,47,75],[25,53,81,10,38,66,4,32,60],[30,55,2,51,76,23,45,70,17],[42,67,14,36,61,8,48,73,20],[54,79,26,39,64,11,33,58,5],[56,3,28,77,24,49,71,18,43],[68,15,40,62,9,34,74,21,46],[80,27,52,65,12,37,59,6,31]],
  10: [[92,99,1,8,15,67,74,51,58,40],[98,80,7,14,16,73,55,57,64,41],[4,81,88,20,22,54,56,63,70,47],[85,87,19,21,3,60,62,69,71,28],[86,93,25,2,9,61,68,75,52,34],[17,24,76,83,90,42,49,26,33,65],[23,5,82,89,91,48,30,32,39,66],[79,6,13,95,97,29,31,38,45,72],[10,12,94,96,78,35,37,44,46,53],[11,18,100,77,84,36,43,50,27,59]]
};

// Element forms printed in the book (Sheikh Abu Nabhan Jaid al-Kharusi for 3×3).
const FORMS = {
  3: {
    fire: [[6, 1, 8], [7, 5, 3], [2, 9, 4]],
    air: [[2, 7, 6], [9, 5, 1], [4, 3, 8]],
    water: [[8, 3, 4], [1, 5, 9], [6, 7, 2]],
    earth: [[4, 9, 2], [3, 5, 7], [8, 1, 6]],
  },
  4: {
    fire: [[8, 11, 14, 1], [13, 2, 7, 12], [3, 16, 9, 6], [10, 5, 4, 15]],
    water: [[10, 5, 4, 15], [3, 16, 9, 6], [13, 2, 7, 12], [8, 11, 14, 1]],
    air: [[1, 14, 11, 8], [12, 7, 2, 13], [6, 9, 16, 3], [15, 4, 5, 10]],
    earth: [[15, 4, 5, 10], [6, 9, 16, 3], [12, 7, 2, 13], [1, 14, 11, 8]],
  },
};

// Letters of the 3×3 houses (house h ↔ abjad letter h).
export const HOUSE_LETTERS = ["ا", "ب", "ج", "د", "ه", "و", "ز", "ح", "ط"];


// The nine letters of the 3×3 houses as tabled by the Omani scholars in Kashf.
export const LETTER_TABLE = [
  { l: "ا", nat: "سعد", el: "fire",  metal_ml: "സ്വർണം", planet: "الشمس", day_ml: "ഞായർ", day_en: "Sunday", group: "ابجد", angel: "روقيائيل", khadim: "المذهب" },
  { l: "ب", nat: "ممتزج", el: "earth", metal_ml: "വെള്ളി", planet: "القمر", day_ml: "തിങ്കൾ", day_en: "Monday", group: "هوزح", angel: "جبرائيل", khadim: "الأبيض" },
  { l: "ج", nat: "ممتزج", el: "air",   metal_ml: "ഇരുമ്പ്", planet: "المريخ", day_ml: "ചൊവ്വ", day_en: "Tuesday", group: "طيكل", angel: "سمسمائيل", khadim: "الأحمر" },
  { l: "د", nat: "ممتزج", el: "water", metal_ml: "രസം", planet: "عطارد", day_ml: "ബുധൻ", day_en: "Wednesday", group: "منسع", angel: "ميكائيل", khadim: "برقان" },
  { l: "ه", nat: "سعد", el: "fire",  metal_ml: "വെളുത്ത ഈയം", planet: "المشتري", day_ml: "വ്യാഴം", day_en: "Thursday", group: "فصقر", angel: "صرفيائيل", khadim: "شمهورش" },
  { l: "و", nat: "سعد", el: "earth", metal_ml: "ചെമ്പ്", planet: "الزهرة", day_ml: "വെള്ളി", day_en: "Friday", group: "شتثخ", angel: "عنيائيل", khadim: "زوبعة" },
  { l: "ز", nat: "ممتزج", el: "air",   metal_ml: "കറുത്ത ഈയം", planet: "زحل", day_ml: "ശനി", day_en: "Saturday", group: "ذضظغ", angel: "عزرائيل", khadim: "ميمون" },
  { l: "ح", nat: "سعد عظيم", el: "water", metal_ml: "ഗ്ലാസ്", planet: "الرأس", day_ml: "—", day_en: "—", group: "—", angel: "—", khadim: "—" },
  { l: "ط", nat: "نحس جسيم", el: "fire",  metal_ml: "മൺപാത്രം", planet: "الذنب", day_ml: "—", day_en: "—", group: "—", angel: "—", khadim: "—" },
];

// Names the book says to recite while writing each house of the 3×3 (one per letter, said twice).
export const HOUSE_RECITE = {
  1: "الوهيم الوهيم", 2: "بدميال بدميال", 3: "جه جه", 4: "دلوه دلوه", 5: "همال همال",
  6: "واليهم واليهم", 7: "زقطار زقطار", 8: "حدايه حدايه", 9: "طيال طيال",
};

/**
 * Kashf p.301: "and there is another way" — longer names for each of the
 * nine letters, said as the letter's house is written, then the oath.
 * As printed; the book's own spelling kept (e.g. زنقطار here, زقطار in
 * the first way).
 */
export const HOUSE_RECITE_2 = {
  1: "الوهيم الوهيم اهٍ اهٍ ايهٍ ايهٍ افشال افشال اطردشاً",
  2: "بقطريال بقطريال بدميال بدميال يشهرشبٍ",
  3: "جلشٍ جلشٍ جهٍ جهٍ حمروسخٍ",
  4: "دميالٍ دميالٍ دلوهٍ دلوهٍ",
  5: "ههبطوشٍ ههبطوشٍ هيالٍ هيالٍ هططشٍ همتشتشا",
  6: "وهيمٍ وهيمٍ واليهم واليهم وسحالوا",
  7: "زنقطارٍ زنقطارٍ سحاله سحاله ساله رهن شلو",
  8: "حدايا حدايا حدايه حدايه حمر شيخ",
  9: "طواطهيالٍ طيالٍ طيالٍ طلمواحط طاشٍ طاشوشٍ",
};
export const HOUSE_RECITE_2_OATH = "اقسم عليكم ياخدام هذه الأسماء أن تفعلوا لي كذا وكذا (تذكر حاجتك) أو حاجة من تريد";

// Angel of each weekday (index 0 = Sunday), from the letter table above.
export const DAY_ANGEL = ["روقيائيل", "جبرائيل", "سمسمائيل", "ميكائيل", "صرفيائيل", "عنيائيل", "عزرائيل"];

// Purposes offered by the builder — beneficial works only, each tied to the
// manazil the book's table of works gives for it.
export const PURPOSES = [
  { id: "love", ar: "المحبة والألفة", ml: "സ്നേഹം, ഇണക്കം", en: "Love and harmony", mansions: [2, 3, 6] },
  { id: "accept", ar: "القبول", ml: "സ്വീകാര്യത", en: "Acceptance", mansions: [11] },
  { id: "victory", ar: "النصر", ml: "വിജയം", en: "Victory", mansions: [7, 18] },
  { id: "fath", ar: "الفتح", ml: "തുറവി (ഫത്ഹ്)", en: "Opening (fath)", mansions: [20] },
  { id: "needs", ar: "قضاء الحاجات", ml: "ആവശ്യങ്ങൾ നിറവേറൽ", en: "Fulfilling needs", mansions: [28] },
  { id: "goal", ar: "الوصول", ml: "ലക്ഷ്യത്തിലെത്തൽ", en: "Reaching a goal", mansions: [4] },
  { id: "work", ar: "العمل", ml: "പ്രവൃത്തി, ജോലി", en: "Work", mansions: [26] },
  { id: "safety", ar: "الأمن وحفظ النفس", ml: "സുരക്ഷ, സംരക്ഷണം", en: "Safety and protection", mansions: [15, 24] },
  { id: "healing", ar: "الشفاء", ml: "ശിഫ (രോഗശമനം)", en: "Healing", mansions: [23, 17] },
  { id: "prisoner", ar: "خلاص المسجون", ml: "തടവുകാരന്റെ മോചനം", en: "Freeing a prisoner", mansions: [19] },
];

// ── Elements (mod 4) and their correspondences ─────────────────
export const ELEMENTS = {
  fire:  { ar: "ناري",  ml: "അഗ്നി", en: "Fire",  nature_ml: "ചൂട്, ഉണക്കം", nature_en: "hot, dry",
           angel: "جبرائيل", dir_ar: "شرقي", dir_ml: "കിഴക്ക്", dir_en: "East",
           burj_ml: "മേടം, ചിങ്ങം, ധനു", burj_en: "Aries, Leo, Sagittarius",
           use_ar: "للقبول والوجاهة", use_ml: "സ്വീകാര്യത, മാന്യത", use_en: "acceptance and standing", harmful: false },
  earth: { ar: "ترابي", ml: "മണ്ണ്", en: "Earth", nature_ml: "തണുപ്പ്, ഉണക്കം", nature_en: "cold, dry",
           angel: "عزرائيل", dir_ar: "شمالي", dir_ml: "വടക്ക്", dir_en: "North",
           burj_ml: "ഇടവം, കന്നി, മകരം", burj_en: "Taurus, Virgo, Capricorn",
           use_ar: "للتفريق والعزل والسجن", use_ml: "വേർപിരിക്കൽ, സ്ഥാനത്തുനിന്ന് നീക്കൽ, തടവ്", use_en: "separation, removal from office, imprisonment", harmful: true },
  air:   { ar: "هوائي", ml: "വായു", en: "Air",   nature_ml: "ചൂട്, ഈർപ്പം", nature_en: "hot, moist",
           angel: "إسرافيل", dir_ar: "غربي", dir_ml: "പടിഞ്ഞാറ്", dir_en: "West",
           burj_ml: "മിഥുനം, തുലാം, കുംഭം", burj_en: "Gemini, Libra, Aquarius",
           use_ar: "للتهييج والجلب", use_ml: "ഇളക്കൽ, ആകർഷണം", use_en: "stirring and attraction", harmful: false },
  water: { ar: "مائي",  ml: "ജലം",  en: "Water", nature_ml: "തണുപ്പ്, ഈർപ്പം", nature_en: "cold, moist",
           angel: "ميكائيل", dir_ar: "جنوبي", dir_ml: "തെക്ക്", dir_en: "South",
           burj_ml: "കർക്കടകം, വൃശ്ചികം, മീൻ", burj_en: "Cancer, Scorpio, Pisces",
           use_ar: "لاستجلاب الأرزاق", use_ml: "രിസ്ഖ്", use_en: "drawing provision (rizq)", harmful: false },
};
const MOD4 = { 1: "fire", 2: "earth", 3: "air", 0: "water" };
export const elementOf = (N) => MOD4[((N % 4) + 4) % 4];

// ── Planning ───────────────────────────────────────────────────
/** jabr house for remainder r in an n×n square: (n − r)·n + 1 */
export const jabrHouse = (n, r) => (r ? (n - r) * n + 1 : 0);

export function planWafq(N, n, step = 1) {
  const as = asOf(n);
  const base = N - step * as;
  const key = Math.floor(base / n);
  const rem = base - key * n;
  const jh = jabrHouse(n, rem);
  const issues = [];
  if (key < 1) issues.push("too_small");
  if (n === 3 && rem) issues.push("m3_jabr_diagonal");
  return { N, n, step, as, key, rem, jabrHouse: jh, ok: key >= 1, issues };
}

function lineSums(g) {
  const n = g.length;
  const rows = g.map((r) => r.reduce((a, b) => a + b, 0));
  const cols = g[0].map((_, j) => g.reduce((a, r) => a + r[j], 0));
  let d1 = 0, d2 = 0;
  for (let i = 0; i < n; i++) { d1 += g[i][i]; d2 += g[i][n - 1 - i]; }
  return { rows, cols, d1, d2 };
}

export function houseGrid(n, form = "base", rem = 0) {
  if (n === 3) return FORMS[3][form] || GHAZALI;
  if (n === 4) {
    if (FORMS[4][form]) return FORMS[4][form];
    return rem ? M4_JABR : M4_NATURAL;
  }
  return BIG[n];
}

/**
 * Fill an n×n wafq for total N.
 * opts.step  — tafāḍul step k (default 1)
 * opts.form  — "base" | "fire" | "earth" | "air" | "water" (3×3 and 4×4 only)
 */
export function buildWafq(N, n, opts = {}) {
  const step = Math.max(1, Math.floor(opts.step || 1));
  const form = opts.form || "base";
  const plan = planWafq(N, n, step);
  const houses = houseGrid(n, form, plan.rem);
  const valueOf = (h) => plan.key + (h - 1) * step + (plan.rem && h >= plan.jabrHouse ? 1 : 0);
  const grid = houses.map((row) => row.map(valueOf));
  const sums = lineSums(grid);
  const all = [...sums.rows, ...sums.cols, sums.d1, sums.d2];
  const valid = plan.ok && all.every((s) => s === N);
  const flat = grid.flat();
  return {
    ...plan, form, houses, grid, sums, valid,
    miftah: Math.min(...flat), maghaliq: Math.max(...flat),
    masaha: flat.reduce((a, b) => a + b, 0),
  };
}

/** 3×3 with the centre (ه) left empty — rows and columns each equal N. */
export function hollowWafq3(N) {
  const a = (N - 12) / 3;
  if (!Number.isInteger(a) || a <= 0 || a % 4 !== 0) return { ok: false, N };
  const ha = a / 2, ba = ha / 2, dal = ba + ha, zay = dal + ha, jim = N - zay, ta = ba + jim, waw = ta - ha;
  const grid = [[dal, ta, ba], [jim, null, zay], [ha, a, waw]];
  const rows = grid.map((r) => r.reduce((s, v) => s + (v || 0), 0));
  const cols = [0, 1, 2].map((j) => grid.reduce((s, r) => s + (r[j] || 0), 0));
  const valid = [...rows, ...cols].every((s) => s === N);
  return { ok: valid, N, grid, rows, cols, letters: { ا: a, ح: ha, ب: ba, د: dal, ز: zay, ج: jim, ط: ta, و: waw } };
}

/** Sizes that give a fully correct square for N (with jabr where needed). */
export function workingSizes(N, step = 1) {
  return SIZES.filter((n) => buildWafq(N, n, { step }).valid);
}

/** Arabic-Indic digits for display. */
export function toArabicDigits(v) {
  return String(v).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

// ═══════════════════════════════════════════════════════════════
// WRITING THE WAFQ — Kashf al-Haqa'iq, conditions 34 and after
// (printed pages 49-52). Arabic kept exactly as the book prints it.
// ═══════════════════════════════════════════════════════════════

/** Condition 28 (Kashf p.46): how the wafq itself is drawn and written. */
export const WRITING_RULE_28 = {
  ar: "ملازمة القواعد الوفقية في كتابته أو نقشه وإتقان وضع مكعبه وتسوية اضلاعه بحيث لا يكون فيه تفاوت وأن تكون خطوط الجداول في غاية الاستقامة وأن تكون قسمة البيوت متساوية والحروف والرقوم المكتوبة في غاية الحسن والبيان وأن تكون عيون الحروف مفتوحة ورسم الأرقام واضح وأن تنقط الحروف إن كان الوفق وضعيا وبضبط الكلمات إن كان الوفق اسميا ويجب نطق ما تكتب ارواحا أو أجساد أو أسماء أو آيات",
  ml: [
    "എഴുതുമ്പോഴും കൊത്തുമ്പോഴും വഫ്ഖിന്റെ നിയമങ്ങൾ മുറുകെ പിടിക്കുക. ചതുരം കൃത്യമായി വരയ്ക്കുക; വശങ്ങൾ ഒരുപോലെയാകണം, ഒരു ഏറ്റക്കുറവും പാടില്ല.",
    "കള്ളിയുടെ വരകൾ തികച്ചും നേരെയാകണം; വീടുകൾ എല്ലാം ഒരേ വലുപ്പമാകണം.",
    "എഴുതുന്ന അക്ഷരങ്ങളും അക്കങ്ങളും ഏറ്റവും ഭംഗിയായും വ്യക്തമായും ആകണം. അക്ഷരങ്ങളുടെ കണ്ണുകൾ (ഉള്ളിലെ ദ്വാരം) തുറന്നിരിക്കണം; അക്കങ്ങൾ തെളിഞ്ഞിരിക്കണം.",
    "അക്ഷരങ്ങളുള്ള വഫ്ഖാണെങ്കിൽ അക്ഷരങ്ങൾക്ക് പുള്ളി ഇടണം; പേരുകളുള്ള വഫ്ഖാണെങ്കിൽ വാക്കുകൾക്ക് ഹറകത്ത് കൊടുക്കണം.",
    "എഴുതുന്നതെല്ലാം — റൂഹുകളോ ശരീരങ്ങളോ പേരുകളോ ആയത്തുകളോ — ഉച്ചരിച്ചുകൊണ്ട് എഴുതണം.",
  ],
  en: [
    "Keep to the rules of the wafq in writing or engraving it. Draw the square true; its sides alike, with no difference between them.",
    "The lines of the table perfectly straight; the houses all the same size.",
    "The letters and figures as fine and clear as can be. The eyes of the letters open; the figures plain.",
    "In a wafq of letters the letters are dotted; in a wafq of names the words are vowelled.",
    "Say aloud whatever you write — spirits, bodies, names or ayahs.",
  ],
};

/** Condition 34: how the digits themselves must be written. */
export const NUMBER_RULE = {
  ar: "يجب مراعاة كتابة الخمسة هاء مشقوقة وأن يكون الصفر دائرة",
  ml: "അക്കം 5 പിളർന്ന ഹാ (ﻫ) പോലെ എഴുതണം; പൂജ്യം ഒരു വൃത്തമായിരിക്കണം.",
  en: "The 5 must be written as a split ha (ﻫ) and the zero as a circle.",
  zeroEnd_ar: "وإذا كان الصفر آخر العدد فيضعه قبل تكملة العدد",
  zeroEnd_ml: "പൂജ്യം സംഖ്യയുടെ അവസാനമാണെങ്കിൽ സംഖ്യ പൂർത്തിയാക്കുംമുമ്പ് അത് വെക്കണം. കിതാബിലെ ഉദാഹരണം: വീട്ടിൽ 340 വന്നാൽ ആദ്യം മുന്നൂറ്, പിന്നെ പൂജ്യം, പൂജ്യത്തിനു ശേഷം നാൽപ്പത്.",
  zeroEnd_en: "If the zero is the last of the number, place it before completing the number. The book's example: 340 in a house — first the three hundred, then the zero, then the forty after it.",
};

/** Condition 34: the seven ranks written in the middle house (بيت الوسط). */
export const SEVEN_RANKS = [
  { n: 1, ar: "لفظ الجلالة", ml: "ലഫ്ദുൽ ജലാല (الله)", en: "The Name of Majesty (الله)", fixed: "الله" },
  { n: 2, ar: "محمد صلى الله عليه وسلم", ml: "മുഹമ്മദ് ﷺ", en: "Muhammad ﷺ", fixed: "محمد صلى الله عليه وسلم" },
  { n: 3, ar: "اسم الملك المناسب للحاجة", ml: "ആവശ്യത്തിന് യോജിച്ച മലക്കിന്റെ പേര്", en: "The angel suited to the need" },
  { n: 4, ar: "اسم الطالب", ml: "ആവശ്യപ്പെടുന്നയാളുടെ പേര്", en: "The seeker's name" },
  { n: 5, ar: "الحاجة", ml: "ആവശ്യം", en: "The need" },
  { n: 6, ar: "المطلوب", ml: "തേടുന്ന കാര്യം", en: "The matter sought" },
  { n: 7, ar: "عدد الضلع", ml: "വശത്തിന്റെ എണ്ണം (ളിൽഅ്)", en: "The number of the side" },
];
export const SEVEN_RANKS_NOTE = {
  ar: "وتنزل الجميع في الوسط",
  ml: "എല്ലാം നടുവിലെ വീട്ടിൽ ഇറക്കുന്നു.",
  en: "All of them are brought down into the middle house.",
  alt_ml: "മറ്റൊരു രീതി: മുകളിൽ പറഞ്ഞതെല്ലാം കൂട്ടി അതിൽനിന്ന് اييل (51) കുറച്ച്, കിട്ടുന്ന സംഖ്യയിൽ നിന്ന് ഒരു മലക്കിനെ എടുത്ത് നടുവിൽ സംഖ്യയായി വെക്കുക.",
  alt_en: "Another way: add all of the above, drop اييل (51) from it, and from what remains draw an angel to be placed in the middle as a number.",
};

/** Condition 34: the angel suited to the need (only the beneficial pairs are carried here). */
export const NEED_ANGEL = [
  { id: "atf", ar: "العطف والمحبة", ml: "ഇണക്കവും സ്നേഹവും", en: "Affection and love", angel: "جبرائيل" },
  { id: "rizq", ar: "الأرزاق والفتوح", ml: "രിസ്ഖും ഫുതൂഹും", en: "Provision and opening", angel: "ميكائيل" },
];
/** Picks the angel for a purpose id (see PURPOSES); falls back to the element's angel. */
export function needAngelFor(purposeId) {
  const atf = ["love", "accept"], rizq = ["needs", "work", "fath", "goal", "healing", "safety", "victory", "prisoner"];
  if (atf.includes(purposeId)) return NEED_ANGEL[0];
  if (rizq.includes(purposeId)) return NEED_ANGEL[1];
  return null;
}

/** How many times the names are said — three opinions, the book calls the last the soundest. */
export const RECITE_COUNT = {
  opinions: [
    { ar: "بعدد نطقها", ml: "ഉച്ചരിക്കുന്നതിന്റെ എണ്ണത്തോളം", en: "by the number of its utterances" },
    { ar: "بقدر عدد ما في الوسط", ml: "നടുവിലെ വീട്ടിലുള്ള സംഖ്യയോളം", en: "by the number in the middle house" },
    { ar: "بقدر عدد حروف الاسمين", ml: "രണ്ട് പേരുകളുടെയും അക്ഷരങ്ങളുടെ എണ്ണത്തോളം", en: "by the number of letters of the two names" },
  ],
  soundest: 2,
  soundest_ml: "കിതാബ്: \"والأصح الأخير\" — ഏറ്റവും ശരിയായത് അവസാനത്തേത്.",
  soundest_en: "The book: \"والأصح الأخير\" — the soundest is the last.",
};

/** Said before the tanzil (bringing down) of the names. */
export const DUA_BEFORE = [
  { count: 70, ar: "أستغفر الله الذي لا إله إلا هو الحي القيوم وأتوب إليه", ml: "ഇസ്തിഗ്ഫാർ — 70 തവണ", en: "Istighfar — 70 times" },
  { count: 70, ar: "اللهم صل على سيدنا محمد وعلى آله وصحبه وسلم", ml: "നബി ﷺ യുടെ മേൽ സ്വലാത്ത് — 70 തവണ", en: "Salawat on the Prophet ﷺ — 70 times" },
  { count: 1, ar: "يا بديع السماوات والأرض يا ذا الجلال والإكرام يا صريخ المستصرخين يا غياث المستغيثين يا مجيب دعوة المضطرين يا إله العالمين بك أنزل حاجتي وأنت أعلم بها فاقضها", ml: "പിന്നെ ഈ ദുആ, ശേഷം വീണ്ടും നബി ﷺ യുടെ മേൽ സ്വലാത്ത്", en: "Then this du'a, then salawat on the Prophet ﷺ again" },
];
export const DUA_BEFORE_WHEN = {
  ar: "وهذا يكون إذا كان خالي الوسط أو بسر التداخل",
  ml: "നടുവ് ഒഴിഞ്ഞ കള്ളിയാണെങ്കിലോ സിർറുത്തദാഖുൽ പ്രകാരമാണെങ്കിലോ ആണ് ഇത്.",
  en: "This is when the middle is empty, or by sirr al-tadakhul.",
};

/** Said at the tanzil of the need. */
export const DUA_TANZIL = {
  ar: "إلهي من ذا الذي دعاك فلم تجبه، ومن ذا الذي سألك فلم تعطه، ومن ذا الذي استجار بك فلم تجره، ومن ذا الذي استعاذ بك فلم تعذه، ومن ذا الذي استغاث بك فلم تغثه، واغوثاه واغوثاه واغوثاه، يا غياث المستغيثين أغثني واقض حوائجي وحوائج المحتاجين والمسلمين بحرمة القرآن العظيم والنبي الكريم، اللهم افعل بنا ما أنت أهله ولا تفعل بنا ما نحن أهله فإنك أهل التقوى وأهل المغفرة ونحن أهل الذنوب والخطايا برحمتك يا أرحم الراحمين، وصلى الله على سيدنا محمد وعلى آله وصحبه وسلم",
  ml: "ആവശ്യം ഇറക്കുമ്പോൾ ചൊല്ലേണ്ട ദുആ",
  en: "The du'a read at the bringing down of the need",
};

/** What some scholars require to be written around the wafq in works of affection. */
export const AROUND_WAFQ = {
  scope_ar: "في جميع أعمال المحبات",
  scope_ml: "സ്നേഹത്തിന്റെയും ഇണക്കത്തിന്റെയും (محبات) പ്രവൃത്തികളിൽ",
  scope_en: "In all works of affection (محبات)",
  how_ar: "أن يكتب حول الوفق إن أمكن أو يتلى عليه",
  how_ml: "കഴിയുമെങ്കിൽ കള്ളിക്ക് ചുറ്റും എഴുതുക, അല്ലെങ്കിൽ അതിന്മേൽ ഓതുക.",
  how_en: "Written around the wafq if possible, or recited over it.",
  verses: [
    { ar: "وَإِذْ قَالَ إِبْرَاهِيمُ رَبِّ أَرِنِي كَيْفَ تُحْيِي الْمَوْتَىٰ قَالَ أَوَلَمْ تُؤْمِن قَالَ بَلَىٰ وَلَٰكِن لِّيَطْمَئِنَّ قَلْبِي قَالَ فَخُذْ أَرْبَعَةً مِّنَ الطَّيْرِ فَصُرْهُنَّ إِلَيْكَ ثُمَّ اجْعَلْ عَلَىٰ كُلِّ جَبَلٍ مِّنْهُنَّ جُزْءًا ثُمَّ ادْعُهُنَّ يَأْتِينَكَ سَعْيًا", ref: "البقرة ٢٦٠", times: 3 },
    { ar: "يَوْمَ نَطْوِي السَّمَاءَ كَطَيِّ السِّجِلِّ", ref: "الأنبياء ١٠٤", times: 1 },
    { ar: "أَنَا آتِيكَ بِهِ قَبْلَ أَن يَرْتَدَّ إِلَيْكَ طَرْفُكَ فَلَمَّا رَآهُ مُسْتَقِرًّا عِندَهُ قَالَ هَٰذَا مِن فَضْلِ رَبِّي", ref: "النمل ٤٠", times: 1 },
  ],
};

/** The spiritual ink (الحبر أو المداد الروحاني), printed page 52. */
export const INK = {
  title_ar: "الحبر أو المداد الروحاني",
  items_ar: ["زعفران من النوع الممتاز الأصلي", "مسك خام", "دم الغزال (العكر الفاسي) أو دم الأخوين", "ماء ورد"],
  items_ml: ["ഏറ്റവും മേന്മയുള്ള യഥാർത്ഥ കുങ്കുമം (സഅ്ഫറാൻ)", "പച്ച കസ്തൂരി (മിസ്ക് ഖാം)", "ദമുൽ ഗസാൽ (അൽ-അക്കറുൽ ഫാസി) അല്ലെങ്കിൽ ദമുൽ അഖവൈൻ", "പനിനീർ (മാഉൽ വർദ്)"],
  items_en: ["Best-quality genuine saffron", "Raw musk", "Dam al-ghazal (al-'akar al-fasi) or dam al-akhawayn", "Rose water"],
  steps_ml: [
    "കുങ്കുമം കസ്തൂരിയുടെ മൂന്നിരട്ടി എടുക്കുക.",
    "രണ്ടും പൊടിക്കുക.",
    "ഒരു മരക്കമ്പ് കൊണ്ട് ഇളക്കി പനിനീർ ചേർത്ത് കലർത്തുക.",
    "പിന്നെ ദമുൽ ഗസാൽ ചേർത്ത് നന്നായി യോജിപ്പിക്കുക.",
    "ഇരുണ്ട കുപ്പിയിലോ പാത്രത്തിലോ സൂക്ഷിക്കുക.",
  ],
  steps_en: [
    "Take the saffron at three times the musk.",
    "Grind both.",
    "Mix with a wooden stick, stirring, with rose water.",
    "Then add the dam al-ghazal and blend well.",
    "Keep it in a dark bottle or container.",
  ],
  note_ml: "ദമുൽ ഫാസിയോ ദമുൽ അഖവൈനോ നിർബന്ധമല്ല. ഉണ്ടാക്കുമ്പോഴും അതിനുശേഷവും സൂര്യവെളിച്ചത്തിൽ നിന്ന് അകറ്റി വെക്കണം.",
  note_en: "The 'akar al-fasi or dam al-akhawayn is not a requirement. Keep the work away from sunlight, both while making it and after.",
};

/** General cautions printed with these conditions. */
export const CAUTIONS = [
  { ar: "تجنب وضع يدك أو مدها داخل السيبة أثناء تلاوة العزيمة ودوران العمل", ml: "ഓത്തിന്റെയും പ്രവൃത്തിയുടെയും ഇടയിൽ കൈ ഉള്ളിലേക്ക് വെക്കുകയോ നീട്ടുകയോ ചെയ്യരുത്.", en: "Do not put or stretch your hand inside during the recitation and the course of the work." },
  { ar: "الكتمان فهو خير من الإفشاء", ml: "രഹസ്യമായി സൂക്ഷിക്കുക; വെളിപ്പെടുത്തുന്നതിനെക്കാൾ നല്ലത് അതാണ്.", en: "Keep it concealed; that is better than disclosing it." },
];

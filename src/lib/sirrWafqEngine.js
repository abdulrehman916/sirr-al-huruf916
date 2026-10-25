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

function houseGrid(n, form, rem) {
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

// ═══════════════════════════════════════════════════════════════
// WAFQ METHODS — one entry per way of building a square, each with
// the rules as its book gives them and a builder that follows them.
// Sources: Kashf al-Haqa'iq (awfaq chapter) and Hâvâss'ın
// Derinlikleri I, "Vefkler Kitabı" (Bülent Kısa).
// Every method states what its lines are expected to add up to, and
// the page checks the built square against that.
// ═══════════════════════════════════════════════════════════════
import { ABJAD, asOf, jabrHouse, buildWafq, hollowWafq3, HOUSE_LETTERS, toArabicDigits, houseGrid } from "./sirrWafqEngine.js";

export const SOURCES = {
  kashf: { ml: "കശ്ഫുൽ ഹഖാഇഖ്", en: "Kashf al-Haqa'iq", ar: "كشف الحقائق" },
  havass: { ml: "ഹവാസ്സിന്റെ ആഴങ്ങൾ I", en: "Hâvâss'ın Derinlikleri I", ar: "" },
};

// Houses of the 3×3 (buduh / Muthallath al-Ghazali) in the book's layout.
const GH = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
// Houses of the 4×4 as the book draws it at p. 226, read from its
// own worked example of the Jami' square (each value there is 20 + h).
const HARF_M4 = [[8, 11, 14, 1], [13, 2, 7, 12], [3, 16, 9, 6], [10, 5, 4, 15]];
const fill = (houses, val) => houses.map((r) => r.map((h) => val(h)));

function lineSums(g) {
  const n = g.length;
  const rows = g.map((r) => r.reduce((a, b) => a + (Number(b) || 0), 0));
  const cols = g[0].map((_, j) => g.reduce((a, r) => a + (Number(r[j]) || 0), 0));
  let d1 = 0, d2 = 0;
  for (let i = 0; i < n; i++) { d1 += Number(g[i][i]) || 0; d2 += Number(g[i][n - 1 - i]) || 0; }
  return { rows, cols, d1, d2, all: [...rows, ...cols, d1, d2] };
}
const checkAll = (g, expected) => {
  const s = lineSums(g);
  return { sums: s, valid: s.all.every((v) => v === expected), expected };
};

/** Abjad total of a short Arabic string, letter by letter (for the letter methods). */
export function lettersOf(text) {
  const NORM = { "ء": "ا", "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ى": "ي", "ئ": "ي", "ؤ": "و", "ة": "ه" };
  const out = [];
  for (const raw of String(text || "").replace(/[ً-ٰٟۖ-ۭـ]/g, "")) {
    const ch = NORM[raw] || raw;
    if (ABJAD[ch]) out.push({ ch, v: ABJAD[ch] });
  }
  return out;
}

// ── The methods ────────────────────────────────────────────────
export const METHODS = [
  {
    id: "std",
    src: "kashf",
    also: "havass",
    sizes: [3, 4, 5, 6, 7, 8, 9, 10],
    ml: "അടിസ്ഥാന രീതി", en: "The standard method", ar: "التعمير",
    ref_ml: "കശ്ഫ് പേജ് 289 · ഹവാസ്സ് I ഊച്‌ലൂ ഉസൂൽ 1, ദോർത്‌ലൂ ഉസൂൽ 2",
    ref_en: "Kashf p.289 · Hâvâss I, Üçlü 1. Usûl and Dörtlü 2. Usûl",
    rules_ml: [
      "ആകെ തുകയിൽ നിന്ന് ആ കള്ളിയുടെ أس കുറയ്ക്കുക (3×3-ന് 12, 4×4-ന് 30).",
      "ബാക്കിയെ വശത്തിന്റെ എണ്ണം കൊണ്ട് ഹരിക്കുക. ഭിന്നമില്ലാതെ കിട്ടുന്ന പൂർണ്ണസംഖ്യയാണ് മിഫ്താഹ്.",
      "മിഫ്താഹ് അലിഫിന്റെ വീട്ടിൽ എഴുതുക; പിന്നെ അബ്ജദ് വീട് ക്രമത്തിൽ ഓരോന്നിലും ഒന്നു വീതം കൂട്ടുക.",
      "ഓരോ വീടും എഴുതുമ്പോൾ പേന കടലാസിൽ നിന്ന് ഉയർത്താതെ ഒരു ബിസ്മി ചൊല്ലണം (ഹവാസ്സ്).",
    ],
    rules_en: [
      "Subtract the square's أس from the total (12 for 3×3, 30 for 4×4).",
      "Divide the remainder by the number of the side. The whole number, without fractions, is the key (miftah).",
      "Write the key in the house of alif, then add one in each house in abjad house order.",
      "While writing each house, say one basmala without lifting the pen from the paper (Hâvâss).",
    ],
    expects_ml: "എല്ലാ വരിയും നിരയും രണ്ടു കോണും = ആകെ തുക",
    expects_en: "Every row, column and both diagonals = the total",
    build(N, { n = 3, step = 1 } = {}) {
      const r = buildWafq(N, n, { step });
      return { grid: r.grid, houses: r.houses, ...checkAll(r.grid, N), key: r.key, rem: r.rem, jabr: r.jabrHouse };
    },
  },
  {
    id: "jabr",
    src: "kashf",
    also: "havass",
    sizes: [4, 5, 6, 7, 8, 9, 10],
    ml: "ജബ്ർ — ബാക്കി വന്നാൽ", en: "Jabr — when a remainder is left", ar: "الجبر",
    ref_ml: "കശ്ഫ് · ഹവാസ്സ് I പേജ് 223 (\"artık sayı\")",
    ref_en: "Kashf · Hâvâss I p.223 (\"artık sayı\")",
    rules_ml: [
      "ഹരിച്ചിട്ട് ബാക്കി വന്നാൽ ഒരു നിശ്ചിത വീട് മുതൽ ഓരോന്നിലും ഒന്ന് അധികം ചേർക്കുന്നു.",
      "ജബ്ർ വീട് = (വശം − ബാക്കി) × വശം + 1.",
      "4×4-ന്: ബാക്കി 1 → വീട് 13, ബാക്കി 2 → വീട് 9, ബാക്കി 3 → വീട് 5. രണ്ട് ഗ്രന്ഥത്തിലും ഒരേ പട്ടിക.",
      "⚠ 3×3-ഉം മറ്റ് ഒറ്റക്കള്ളികളും ബാക്കി സ്വീകരിക്കില്ല: വരികളും നിരകളും ഒരു കോണും ശരിയാകും, പക്ഷേ മറ്റേ കോൺ തെറ്റും. അപ്പോൾ ഹാലി വസത്ത് രീതി ഉപയോഗിക്കുക.",
    ],
    rules_en: [
      "When the division leaves a remainder, one extra is added from a fixed house onward.",
      "Jabr house = (side − remainder) × side + 1.",
      "For 4×4: remainder 1 → house 13, 2 → house 9, 3 → house 5. The same table in both books.",
      "⚠ The 3×3 and the other odd squares do not accept a remainder: the rows, columns and one diagonal come out right, but the other diagonal is wrong. Use the hâli vasat method instead.",
    ],
    expects_ml: "എല്ലാ വരിയും നിരയും രണ്ടു കോണും = ആകെ തുക",
    expects_en: "Every row, column and both diagonals = the total",
    build(N, { n = 4, step = 1 } = {}) {
      const r = buildWafq(N, n, { step });
      return { grid: r.grid, houses: r.houses, ...checkAll(r.grid, N), key: r.key, rem: r.rem, jabr: r.jabrHouse };
    },
  },
  {
    id: "tafadul",
    src: "kashf",
    also: "havass",
    sizes: [3, 4, 5, 6, 7, 8, 9, 10],
    ml: "തഫാദുൽ — സൂര്യ-ചന്ദ്ര കോൺ", en: "Tafāḍul — the Sun–Moon angle", ar: "التفاضل",
    ref_ml: "കശ്ഫ് (تفاضل) · ഹവാസ്സ് I പേജ് 207, 223",
    ref_en: "Kashf (تفاضل) · Hâvâss I pp.207, 223",
    rules_ml: [
      "ഓരോ വീട്ടിലും ഒന്നിനു പകരം k വീതം കൂട്ടുന്ന രീതി. കുറയ്ക്കേണ്ട സംഖ്യയും k മടങ്ങാകും: ഫള്ൽ = k × أس.",
      "ഹവാസ്സ് പ്രകാരം k തിരഞ്ഞെടുക്കുന്നത് സൂര്യനും ചന്ദ്രനും തമ്മിലുള്ള കോൺ നോക്കിയാണ്: 30° → 1, 60° → 2, 90° → 3, 120° → 4, 150° → 5, 180° → 6.",
      "3×3-ന് കുറയ്ക്കേണ്ടത് 12, 24, 36, 48, 60, 72. 4×4-ന് 30, 60, 90, 120, 150, 180.",
      "ഹവാസ്സ്: ആണിനുള്ള കള്ളി 30°, 90°, 150°-ലും പെണ്ണിനുള്ളത് 60°, 120°-ലും. സൂര്യനും ചന്ദ്രനും ഒരേ ബുർജിലോ നേർ എതിർവശത്തോ ആകുമ്പോൾ കള്ളി ഉണ്ടാക്കരുത്.",
    ],
    rules_en: [
      "Each house rises by k instead of 1; the number subtracted also becomes k-fold: faḍl = k × أس.",
      "In Hâvâss, k is chosen by the angle between the Sun and the Moon: 30° → 1, 60° → 2, 90° → 3, 120° → 4, 150° → 5, 180° → 6.",
      "For 3×3 subtract 12, 24, 36, 48, 60, 72; for 4×4 subtract 30, 60, 90, 120, 150, 180.",
      "Hâvâss: a man's square at 30°, 90°, 150°; a woman's at 60°, 120°. Do not make a square while the Sun and Moon are in the same sign or directly opposite.",
    ],
    expects_ml: "എല്ലാ വരിയും നിരയും രണ്ടു കോണും = ആകെ തുക",
    expects_en: "Every row, column and both diagonals = the total",
    needsStep: true,
    build(N, { n = 4, step = 2 } = {}) {
      const r = buildWafq(N, n, { step });
      return { grid: r.grid, houses: r.houses, ...checkAll(r.grid, N), key: r.key, rem: r.rem, jabr: r.jabrHouse };
    },
  },
  {
    id: "halivasat",
    src: "havass",
    sizes: [3],
    ml: "ഹാലി വസത്ത് — ഉസൂൽ 2", en: "Hâli vasat — 2nd Usûl", ar: "",
    ref_ml: "ഹവാസ്സ് I പേജ് 213–216 (ഊച്‌ലൂ വഫ്ഖ് 2. ഉസൂൽ)",
    ref_en: "Hâvâss I pp.213–216 (Üçlü Vefk, 2. Usûl)",
    rules_ml: [
      "ബാക്കി വരുന്ന തുകകൾക്കുള്ള രീതി. എല്ലാ ഒറ്റക്കള്ളികൾക്കും (3, 5, 7…) ബാധകം.",
      "ആകെ തുക നടുവിലെ വീട്ടിൽ എഴുതുക — അക്ഷരമായോ സംഖ്യയായോ. നടുവിലെ വീട്: 3×3-ന് 5, 5×5-ന് 13, 7×7-ന് 25.",
      "നടുവിൽ നിന്ന് ഒന്നാം വീട് വരെ ഇറങ്ങുമ്പോൾ ഓരോ ചുവടിലും k കുറയ്ക്കുക.",
      "പിന്നെ നടുവിലേക്ക് തിരിച്ചുവന്ന്, അവസാന വീട് വരെ അതേ k വീതം കൂട്ടുക.",
      "k-യും സൂര്യ-ചന്ദ്ര കോൺ അനുസരിച്ചാണ്: 30° → 1, 60° → 2, 90° → 3, 120° → 4.",
    ],
    rules_en: [
      "The method for totals that leave a remainder. It holds for every odd square (3, 5, 7…).",
      "Write the total in the middle house, as letters or as a number. Middle house: 5 for 3×3, 13 for 5×5, 25 for 7×7.",
      "Going down from the middle to the first house, subtract k at each step.",
      "Then return to the middle and go up to the last house, adding the same k.",
      "k too follows the Sun–Moon angle: 30° → 1, 60° → 2, 90° → 3, 120° → 4.",
    ],
    expects_ml: "എല്ലാ വരിയും നിരയും കോണും = ആകെ തുകയുടെ മൂന്നിരട്ടി. ദിക്‌റിന്റെ എണ്ണവും മൂന്നിരട്ടിയാകണം.",
    expects_en: "Every row, column and diagonal = three times the total. The dhikr count must be trebled too.",
    needsStep: true,
    build(N, { step = 1 } = {}) {
      const grid = fill(GH, (h) => N + (h - 5) * step);
      return { grid, houses: GH, ...checkAll(grid, 3 * N), middle: N };
    },
  },
  {
    id: "misli",
    src: "havass",
    sizes: [3],
    ml: "ഗുണിത രീതി — ഉസൂൽ 3", en: "The multiples method — 3rd Usûl", ar: "",
    ref_ml: "ഹവാസ്സ് I പേജ് 216–217 (ഊച്‌ലൂ വഫ്ഖ് 3. ഉസൂൽ)",
    ref_en: "Hâvâss I pp.216–217 (Üçlü Vefk, 3. Usûl)",
    rules_ml: [
      "ആയത്തോ ഇസ്മോ ഒന്നാം വീട്ടിൽ — അക്ഷരമായോ സംഖ്യയായോ — എഴുതുക.",
      "പിന്നെ ഓരോ വീട്ടിലും ഒരു മടങ്ങ് വീതം കൂട്ടി അവസാന വീട് വരെ പോകുക. അതായത് വീട് h-ൽ h × തുക.",
      "ഈ രീതി വളരെ ഫലപ്രദമാണെന്ന് പറയപ്പെടുന്നു.",
      "സംഖ്യയ്ക്ക് പകരം അവയുടെ അക്ഷരങ്ങൾ എഴുതുന്ന രൂപവുമുണ്ട്.",
      "ശ്രദ്ധിക്കുക: വലിയ തുകകൾക്ക് സംഖ്യകൾ ഓതാൻ കഴിയാത്തത്ര വലുതാകും. അതിനാൽ ചെറിയ തുകകൾക്കാണ് ഇത് ഉചിതം.",
    ],
    rules_en: [
      "Write the ayah or name in the first house, as letters or as a number.",
      "Then go up to the last house adding one multiple at each house: house h holds h × the total.",
      "This method is said to be very effective.",
      "There is also a form in which the letters are written instead of the numbers.",
      "Note: with large totals the numbers become too large to recite, so this suits small totals.",
    ],
    expects_ml: "എല്ലാ വരിയും നിരയും കോണും = ആകെ തുകയുടെ പതിനഞ്ചിരട്ടി. ഓത്തിന്റെ എണ്ണത്തിൽ ഇത് കണക്കിലെടുക്കണം.",
    expects_en: "Every row, column and diagonal = fifteen times the total. The recitation count must allow for this.",
    build(N) {
      const grid = fill(GH, (h) => h * N);
      return { grid, houses: GH, ...checkAll(grid, 15 * N) };
    },
  },
  {
    id: "firstrow",
    src: "havass",
    sizes: [3],
    ml: "ഒന്നാം വരി രീതി — ഉസൂൽ 4", en: "The first-row method — 4th Usûl", ar: "",
    ref_ml: "ഹവാസ്സ് I പേജ് 217–219 (ഊച്‌ലൂ വഫ്ഖ് 4. ഉസൂൽ)",
    ref_en: "Hâvâss I pp.217–219 (Üçlü Vefk, 4. Usûl)",
    rules_ml: [
      "ആയത്തോ ഇസ്മോ കള്ളിയുടെ ഒന്നാം വരിയിൽ നീളത്തിൽ എഴുതുക.",
      "മൂന്നക്ഷരമാണെങ്കിൽ ഓരോ വീട്ടിലും ഒരക്ഷരം. കൂടുതലുണ്ടെങ്കിൽ ഇഷ്ടപ്രകാരം വീതിക്കാം — ചില വീട്ടിൽ രണ്ടോ മൂന്നോ അക്ഷരം വരാം.",
      "പിന്നെ ഓരോ ചുറ്റിലും (ദേവിർ) ആ വീട്ടിലെ അക്ഷരങ്ങളുടെ അബ്ജദ് തുകയിൽ നിന്ന് കൂട്ടിയോ കുറച്ചോ മുന്നോട്ട് പോകുക.",
      "കള്ളി എത്രയാണോ അത്രയും ചുറ്റുകളുണ്ട്. കൂട്ടുന്നതോ കുറയ്ക്കുന്നതോ ഒന്നായിരിക്കണമെന്നില്ല — രണ്ടോ മൂന്നോ അതിലധികമോ ആകാം.",
      "⚠ ഗ്രന്ഥകാരൻ തന്നെ പറയുന്നു: ചിലപ്പോൾ ഒരു കോൺ ഒത്തുവരില്ല. പ്രത്യേക ഉദ്ദേശ്യങ്ങൾക്ക് അത് വിട്ടുകളയാമെന്നും പറയുന്നു.",
    ],
    rules_en: [
      "Write the ayah or name across the first row of the square.",
      "If it is three letters, one letter per house. If longer, spread the letters as you wish — some houses may take two or three.",
      "Then for each round (devir) go on by adding to, or subtracting from, the abjad total of the letters in that house.",
      "There are as many rounds as the order of the square. The amount added or taken need not be one — it may be two, three or more.",
      "⚠ The author says plainly that one diagonal sometimes fails to come out. For special purposes he allows leaving the check aside.",
    ],
    expects_ml: "ഗ്രന്ഥകാരൻ: മിക്കപ്പോഴും ഒരു കോൺ ഒത്തുവരില്ല",
    expects_en: "The author: one diagonal often does not come out",
    needsText: true,
    build(N, { text = "", step = 3 } = {}) {
      const ls = lettersOf(text);
      if (ls.length < 1) return null;
      // The text is spread across the top row. Arabic runs right to left, so the
      // first letters fall in the rightmost house: houses 2, 9, 4 in that order.
      const seats = [2, 9, 4];
      // "the letters are spread over the first row as you wish" — the extra
      // letters go to the first (rightmost) houses, as in the book's example.
      const base = Math.floor(ls.length / 3), extra = ls.length % 3;
      const groups = []; let at = 0;
      for (let i = 0; i < 3; i++) { const take = base + (i < extra ? 1 : 0); groups.push(ls.slice(at, at + take)); at += take; }
      const seedVal = {}, seedTxt = {};
      seats.forEach((h, i) => {
        seedVal[h] = groups[i].reduce((a, b) => a + b.v, 0);
        seedTxt[h] = groups[i].map((b) => b.ch).join("");
      });
      // Each round of three houses {1,2,3} {4,5,6} {7,8,9} has one seeded house;
      // the other two step by ±k from it, in house order.
      const v = {};
      for (let h = 1; h <= 9; h++) {
        const round = Math.floor((h - 1) / 3);
        const seat = seats.find((s) => Math.floor((s - 1) / 3) === round);
        v[h] = seedVal[seat] + (h - seat) * step;
      }
      const grid = fill(GH, (h) => v[h]);
      const s = lineSums(grid);
      return { grid, houses: GH, sums: s, expected: s.rows[0], valid: s.all.every((x) => x === s.rows[0]), seedTxt, seedVal };
    },
  },
  {
    id: "nameayah",
    src: "havass",
    sizes: [3],
    ml: "പേരും ആയത്തും — ഉസൂൽ 5", en: "Name and ayah — 5th Usûl", ar: "",
    ref_ml: "ഹവാസ്സ് I പേജ് 219–220 (ഊച്‌ലൂ വഫ്ഖ് 5. ഉസൂൽ)",
    ref_en: "Hâvâss I pp.219–220 (Üçlü Vefk, 5. Usûl)",
    rules_ml: [
      "ഒന്നാം വീട്ടിൽ, കള്ളി ആർക്കുവേണ്ടിയാണോ അയാളുടെ പേര് എഴുതുക.",
      "ആ പേരിന്റെ അബ്ജദ് തുക ഓരോന്ന് കൂട്ടി രണ്ടാമത്തെയും മൂന്നാമത്തെയും വീട്ടിൽ.",
      "ഉദ്ദേശ്യത്തിന് യോജിച്ച ആയത്തോ ഇസ്മോ തിരഞ്ഞെടുക്കുക. അതിന്റെ തുകയിൽ നിന്ന് 3 കുറച്ച് 3 കൊണ്ട് ഹരിക്കുക. കിട്ടുന്നത് നാലാം വീട്ടിൽ, ഓരോന്ന് കൂട്ടി അഞ്ചിലും ആറിലും.",
      "അഞ്ചാമത്തെയും ആറാമത്തെയും വീട്ടിലെ സംഖ്യകൾ കൂട്ടി, ആ തുക ആയത്തിന്റെ തുകയിൽ നിന്ന് കുറയ്ക്കുക. ബാക്കി ഏഴാം വീട്ടിൽ, ഓരോന്ന് കൂട്ടി എട്ടിലും ഒമ്പതിലും.",
      "3 കൊണ്ട് ഹരിച്ചപ്പോൾ ബാക്കി 1 ആണെങ്കിൽ ഏഴാം വീട്ടിലെ സംഖ്യയിൽ 1 കൂട്ടുക; ബാക്കി 2 ആണെങ്കിൽ 2 കൂട്ടുക.",
      "⚠ ഇതും പൂർണ്ണമായി ഒത്തുവരാത്ത കള്ളികളിൽ പെട്ടതാണെന്ന് ഗ്രന്ഥകാരൻ പറയുന്നു.",
    ],
    rules_en: [
      "In the first house write the name of the one the square is being made for.",
      "That name's abjad total, raised by one each time, goes into the second and third houses.",
      "Choose an ayah or name suited to the purpose. Subtract 3 from its total and divide by 3. The result goes into the fourth house, raised by one into the fifth and sixth.",
      "Add the numbers in the fifth and sixth houses and subtract that from the ayah's total. The remainder goes into the seventh house, raised by one into the eighth and ninth.",
      "If dividing by 3 left 1, add 1 to the number in the seventh house; if it left 2, add 2.",
      "⚠ The author counts this among the squares that do not fully come out.",
    ],
    expects_ml: "ഗ്രന്ഥകാരൻ: പൂർണ്ണമായി ഒത്തുവരില്ല",
    expects_en: "The author: it does not fully come out",
    needsTwo: true,
    build(N, { nameTotal = 0, ayahTotal = 0 } = {}) {
      if (!nameTotal || !ayahTotal) return null;
      const v = {};
      for (let i = 0; i < 3; i++) v[1 + i] = nameTotal + i;
      const q = Math.floor((ayahTotal - 3) / 3), r = (ayahTotal - 3) % 3;
      for (let i = 0; i < 3; i++) v[4 + i] = q + i;
      const rest = ayahTotal - (v[5] + v[6]);
      for (let i = 0; i < 3; i++) v[7 + i] = rest + i;
      if (r) v[7] += r;
      const grid = fill(GH, (h) => v[h]);
      return { grid, houses: GH, ...checkAll(grid, ayahTotal), rem: r };
    },
  },
  {
    id: "hurufi",
    src: "havass",
    sizes: [3, 4, 5, 6, 7, 8, 9, 10],
    ml: "ഹുറൂഫി — ഉസൂൽ 6", en: "Hurufî — 6th Usûl", ar: "الوفق الحرفي",
    ref_ml: "ഹവാസ്സ് I പേജ് 220 (ഊച്‌ലൂ 6. ഉസൂൽ) · പേജ് 225 (ദോർത്‌ലൂ ഹുറൂഫി വഫ്ഖ്) · കശ്ഫ്: الوفق الحرفي",
    ref_en: "Hâvâss I p.220 (Üçlü, 6. Usûl) · p.225 (Dörtlü Hurufî Vefk) · Kashf: al-wafq al-ḥarfī",
    rules_ml: [
      "സംഖ്യയ്ക്ക് പകരം അക്ഷരങ്ങൾ കൊണ്ട് ഉണ്ടാക്കുന്ന കള്ളി.",
      "3×3-ന് സാധാരണ മൂന്നക്ഷര ഇസ്മുകൾ കൊണ്ടാണ് ചെയ്യുക. ഒരു വീട്ടിൽ ഒന്നിലധികം അക്ഷരവും ആകാം.",
      "ഒന്നാം അക്ഷരം ഒന്നാം വീട്ടിൽ, രണ്ടാമത്തേത് രണ്ടാം വീട്ടിൽ, മൂന്നാമത്തേത് മൂന്നാം വീട്ടിൽ.",
      "നാലാം വീട്ടിലെത്തുമ്പോൾ വീണ്ടും ഒന്നാം അക്ഷരത്തിൽ നിന്ന് തുടങ്ങുക. അങ്ങനെ കള്ളി പൂർത്തിയാക്കുക.",
    ],
    rules_en: [
      "A square made of letters instead of numbers.",
      "For the 3×3 it is usually done with three-letter names. More than one letter in a house is also allowed.",
      "The first letter in the first house, the second in the second, the third in the third.",
      "On reaching the fourth house, begin again from the first letter, and so complete the square.",
    ],
    expects_ml: "അക്ഷരക്കള്ളിയായതിനാൽ സംഖ്യാ പരിശോധന ബാധകമല്ല",
    expects_en: "Being a letter square, the numeric check does not apply",
    needsText: true,
    letters: true,
    build(N, { n = 3, text = "" } = {}) {
      const ls = lettersOf(text);
      if (!ls.length) return null;
      const H = houseGrid(n);
      const grid = fill(H, (h) => ls[(h - 1) % ls.length].ch);
      const num = fill(H, (h) => ls[(h - 1) % ls.length].v);
      return { grid, houses: H, numeric: num, sums: lineSums(num), valid: null, expected: null };
    },
  },
  {
    id: "hurufi2num",
    src: "havass",
    sizes: [3, 4, 5, 6, 7, 8, 9, 10],
    ml: "ഹുറൂഫി → സംഖ്യ — ഉസൂൽ 7", en: "Hurufî turned numeric — 7th Usûl", ar: "",
    ref_ml: "ഹവാസ്സ് I പേജ് 221 (ഊച്‌ലൂ വഫ്ഖ് 7. ഉസൂൽ)",
    ref_en: "Hâvâss I p.221 (Üçlü Vefk, 7. Usûl)",
    rules_ml: [
      "ഹുറൂഫി കള്ളിയിലെ ഓരോ അക്ഷരത്തിനും പകരം അതിന്റെ അബ്ജദ് മൂല്യം എഴുതുക. അത്രമാത്രം.",
      "ഉദാഹരണം: മീമിന്റെ സ്ഥാനത്ത് 40, ലാമിന്റെയും ത്വായുടെയും സ്ഥാനത്ത് 9.",
      "ഇതിന് മുകളിൽ പറഞ്ഞ കൂട്ടിക്കുറയ്ക്കലുകളുമായോ പരിശോധന ഒത്തുവരുന്നതുമായോ ബന്ധമില്ല.",
    ],
    rules_en: [
      "Replace every letter of the hurufî square with its abjad value. That is all.",
      "For example, 40 in place of mim, and 9 in place of lam and ṭā.",
      "It has nothing to do with the additions described above, nor with the check coming out.",
    ],
    expects_ml: "പരിശോധന ബാധകമല്ല — അക്ഷരത്തിന്റെ മൂല്യം എഴുതുക മാത്രം",
    expects_en: "No check applies — it is only writing the letter's value",
    needsText: true,
    build(N, { n = 3, text = "" } = {}) {
      const ls = lettersOf(text);
      if (!ls.length) return null;
      const H = houseGrid(n);
      const grid = fill(H, (h) => ls[(h - 1) % ls.length].v);
      return { grid, houses: H, sums: lineSums(grid), valid: null, expected: null };
    },
  },
  {
    id: "hollow",
    src: "kashf",
    sizes: [3],
    ml: "നടുവ് ഒഴിഞ്ഞ 3×3", en: "Hollow-centre 3×3", ar: "مثلث خالي الوسط",
    ref_ml: "കശ്ഫ് — مثلث خالي الوسط",
    ref_en: "Kashf — muthallath khālī al-wasaṭ",
    rules_ml: [
      "നടുവിലെ ه വീട് ഒഴിച്ചിട്ട്, ബാക്കി എട്ട് വീടുകൾ കൊണ്ട് വരികളും നിരകളും ആകെ തുകയാകുന്ന രീതി.",
      "ا = (തുക − 12) ÷ 3 · ح = ا ÷ 2 · ب = ح ÷ 2 · د = ب + ح · ز = د + ح · ج = തുക − ز · ط = ب + ج · و = ط − ح.",
      "തുക 12-ൽ കൂടുതലും, (തുക − 12) ÷ 3 നാലിന്റെ ഗുണിതവും ആയാലേ ഇത് ശരിയാകൂ.",
    ],
    rules_en: [
      "The middle house (ه) is left empty, and the remaining eight make every row and column equal the total.",
      "ا = (total − 12) ÷ 3 · ح = ا ÷ 2 · ب = ح ÷ 2 · د = ب + ح · ز = د + ح · ج = total − ز · ط = ب + ج · و = ط − ح.",
      "It only works when the total is above 12 and (total − 12) ÷ 3 is a multiple of four.",
    ],
    expects_ml: "മൂന്നു വരിയും മൂന്നു നിരയും = ആകെ തുക (കോണുകൾ ബാധകമല്ല)",
    expects_en: "The three rows and three columns = the total (the diagonals do not apply)",
    build(N) {
      const h = hollowWafq3(N);
      if (!h.ok) return null;
      const s = lineSums(h.grid);
      return { grid: h.grid, houses: GH, sums: s, valid: [...s.rows, ...s.cols].every((v) => v === N), expected: N, hollow: true };
    },
  },
  {
    id: "harfadad",
    src: "havass",
    sizes: [4],
    ml: "അക്ഷരവും സംഖ്യയും ഒന്നിച്ച്", en: "Letters and numbers together", ar: "",
    ref_ml: "ഹവാസ്സ് I പേജ് 226-228 (DİĞER BİR TARZ)",
    ref_en: "Hâvâss I pp.226-228 (DİĞER BİR TARZ)",
    rules_ml: [
      "നാലക്ഷരമുള്ള ഒരു ഇസ്മോ അല്ലാഹുവിന്റെ ഒരു സിഫത്തോ കള്ളിയിലേക്ക് എടുക്കുമ്പോൾ, വീടുകളിൽ എഴുതുന്ന സംഖ്യകളോടൊപ്പം ഇസ്മിന്റെ അക്ഷരങ്ങളും ഹുറൂഫി വഫ്ഖ് പോലെ ക്രമത്തിൽ എഴുതുന്നു.",
      "എഴുതുന്ന ഇസ്മ് ഉപയോഗിക്കുന്ന എസ്മ തന്നെയാകണമെന്നില്ല. ഉദാഹരണത്തിന് ജാമിഅ് എന്ന സിഫത്ത് ഒരാളുമായി ചേരാൻ വേണ്ടിയാണെങ്കിൽ, ആ ആളുടെ പേരുകൂടി ചേർത്താണ് കണക്കാക്കുന്നതെങ്കിൽ, നടുവിൽ എഴുതുന്ന പേര് ആ ആളുടേതുമാകാം.",
      "നാലക്ഷരം തന്നെ വേണമെന്നില്ല — നീണ്ട ഒരു ഇസ്മോ ആയത്തോ നാലായി മുറിച്ച് ഒരു വീട്ടിൽ ഒന്നിലധികം അക്ഷരവും എഴുതാം.",
      "⚠ ശ്രദ്ധിക്കേണ്ട കാര്യം: അക്ഷരങ്ങൾ കൂടി എഴുതിയാൽ കള്ളിയുടെ പരിശോധനാ തുക മാറും. ഓരോ വീട്ടിലെയും സംഖ്യയ്ക്ക് പുറമെ ആ അക്ഷരത്തിന്റെ അബ്ജദ് മൂല്യവും കൂട്ടണം.",
      "കിതാബിന്റെ ഉദാഹരണം: ജാമിഅ് എന്നതിന്റെ അബ്ജദ് 114. സംഖ്യകൾ മാത്രം കൂട്ടിയാൽ ഓരോ വരിയും 114. പക്ഷേ അക്ഷരങ്ങളും കൂടി (ج3 + ا1 + م40 + ع70 = 114) ചേർത്താൽ ഓരോ വരിയിലും 228 ഉണ്ട്. ചൊല്ലേണ്ടതും പ്രവർത്തിക്കേണ്ടതും ആ സംഖ്യ വെച്ചാണ്.",
      "പൊതുവായ നിയമം: കള്ളിയുടെ വീടുകളിൽ എഴുതുന്ന ഓരോന്നും ആ കള്ളിയിൽ ചെയ്യുന്ന കർമ്മവുമായി ബന്ധപ്പെട്ടതാണ്. ചൊല്ലലിൽ ഉപയോഗിക്കാത്ത ഒന്നും കള്ളിയിൽ വെക്കാൻ പാടില്ല; കള്ളിയിലുള്ള എല്ലാം അതിന്റെ എണ്ണപ്രകാരം ചൊല്ലണം. അക്ഷരങ്ങളെ അലങ്കാരമായി കണ്ട് അവയുടെ എണ്ണം ചൊല്ലലിൽ ചേർക്കാതിരിക്കാൻ പറ്റില്ല.",
    ],
    rules_en: [
      "When a four-letter name, or an attribute of Allah, is taken into a square, the letters of the name are written into the houses in order alongside the numbers, as though a hurufî vefk were being made.",
      "The name written need not be the esma being used. If, say, the attribute Jami' is for coming together with someone and is reckoned together with that person's name, the name written inside may be that person's.",
      "Nor need it be four letters — a long name or an ayah can be divided into four, with more than one letter in a house.",
      "⚠ The thing to watch: once the letters are written in too, the square's check total changes. To each house's number the abjad of its letter or letters must be added.",
      "The book's example: Jami' is 114 in abjad. Adding the numbers alone, every row comes to 114. But the letters must be added as well (ج3 + ا1 + م40 + ع70 = 114), so every row and column holds 228, and the work done on the square must go by that number.",
      "The general rule: everything written into a square's houses belongs to the work done on it. Nothing may be put in that will not be used in the recitation, and everything in it must be recited by its count. The letters cannot be treated as ornament and left out of the reckoning.",
    ],
    expects_ml: "⚠ സംഖ്യകളും അക്ഷരങ്ങളും കൂട്ടിയ തുകയാണ് ശരിയായ തുക",
    expects_en: "⚠ The true total is the numbers and the letters added together",
    needsText: true,
    build(N, { n = 4, step = 1, text = "" } = {}) {
      const ls = lettersOf(text);
      if (!ls.length) return null;
      const r = buildWafq(N, n, { step });
      if (!r?.grid) return null;
      // The book's own form for this one (p. 226). It matters: the
      // letters run round the houses in order, so every row AND
      // column carries each letter once only when no column repeats
      // a house number modulo the letter count. The form the rest of
      // the page uses does repeat, and then the columns do not come
      // out at the doubled total the book states.
      const H = n === 4 ? HARF_M4 : houseGrid(n);
      // Both the numbers and the letters are laid on that same form,
      // so the two agree house for house.
      const valueOf = (h) => r.key + (h - 1) * step + (r.rem && h >= r.jabr ? 1 : 0);
      const nums = fill(H, valueOf);
      const letters = fill(H, (h) => ls[(h - 1) % ls.length].ch);
      const lvals = fill(H, (h) => ls[(h - 1) % ls.length].v);
      const combined = nums.map((row, i) => row.map((v, j) => v + lvals[i][j]));
      const s = lineSums(combined);
      const rowTotal = s.rows[0];
      return {
        grid: nums, houses: H, letters, lvals,
        sums: s, expected: rowTotal,
        // The book states the doubled total for every row and column.
        // It does not claim it for the diagonals, so neither do we.
        valid: [...s.rows, ...s.cols].every((v) => v === rowTotal),
        numberTotal: N, letterTotal: lineSums(lvals).rows[0], withLetters: true,
      };
    },
  },
  {
    id: "capraz",
    src: "havass",
    sizes: [4, 5, 6, 7, 8, 9, 10],
    capraz: true,
    ml: "ചാപ്രാസ് — കോർത്ത കള്ളി", en: "Çapraz — the crossed vefk", ar: "",
    ref_ml: "ഹവാസ്സ് I പേജ് 320-324 (ÇAPRAZ VEFKLER)",
    ref_en: "Hâvâss I pp.320-324 (ÇAPRAZ VEFKLER)",
    rules_ml: [
      "ചാപ്രാസ് വഫ്ഖ് ഉണ്ടാകുന്നത് ഒന്നിൽ ഒന്ന് കോർത്ത രണ്ട് വഫ്ഖുകളിൽ നിന്നാണ് — ഒന്ന് ഒറ്റയും മറ്റേത് ഇരട്ടയും.",
      "വീടുകൾ 45 ഡിഗ്രി ചരിഞ്ഞുനിൽക്കുന്നു എന്നതല്ലാതെ ഇത് നമുക്കറിയാവുന്ന വഫ്ഖിൽ നിന്ന് വ്യത്യസ്തമല്ല.",
      "എഴുതുമ്പോൾ ആദ്യം ഉള്ളിലെ വഫ്ഖ് നിറയ്ക്കണം.",
      "രണ്ടിനെയും സ്വതന്ത്രമായ രണ്ട് വഫ്ഖുകളായി കരുതണം. രണ്ടും ഒരേ ഇസ്മിന്റേതാകാം, വെവ്വേറെ ഇസ്മുകളുടേതുമാകാം — പക്ഷേ രണ്ടും ഒരേ ഉദ്ദേശ്യത്തിനുള്ളതായിരിക്കണം.",
      "ചാപ്രാസ് വഫ്ഖിന്റെ രണ്ട് ഭാഗങ്ങൾ വെവ്വേറെ കാര്യങ്ങൾക്ക് ഉപയോഗിക്കാൻ പാടില്ല.",
      "വഫ്ഖുകൾ തീർന്ന ശേഷമുള്ള പണികൾ — ഹാദിമുകളെ നിശ്ചയിക്കലും നയിക്കലും — രണ്ട് വഫ്ഖിനും വെവ്വേറെ ചെയ്യണം.",
      "ഇതല്ലാതെ വഫ്ഖ് നിർമ്മാണത്തിന്റെ എല്ലാ നിയമങ്ങളും ചാപ്രാസിനും അതേപടി ബാധകം: സൂര്യ-ചന്ദ്ര കോണുകൾ, ആൺ-പെൺ വഫ്ഖുകൾ, സാഅത്തുകൾ, എല്ലാം.",
      "ഒന്ന് ഹുറൂഫിയും മറ്റേത് സംഖ്യയുമാകാം; ഒന്ന് ഹാലി വസത്തും മറ്റേത് സാധാരണ സംഖ്യാ വഫ്ഖുമാകാം. ചിന്തിക്കാവുന്ന ഏത് വകഭേദവും ഉപയോഗിക്കാം.",
      "ഇങ്ങനെ ഉണ്ടാക്കുന്ന വഫ്ഖിന്റെ ചുറ്റിലും മലക്കുകളുടെ പേരുകളോ ബിസ്മിയോ ആയത്തുകളോ എഴുതാം.",
    ],
    rules_en: [
      "A çapraz vefk is made of two vefks fitted one into the other — one odd, the other even.",
      "Apart from the houses standing turned through 45 degrees, it is no different from the vefk we know.",
      "In the writing, the inner vefk must be filled first.",
      "The two are to be thought of as two independent vefks. Both may belong to the same name, or to different names — but both must be made for the same purpose.",
      "The two parts of a çapraz vefk may not be used for different works.",
      "What follows the vefks — determining the hâdims and directing them — must be done separately for each of the two.",
      "Beyond this, every rule of vefk-making applies to the çapraz unchanged: the Sun and Moon angles, male and female vefks, the hours, all of it.",
      "One may be hurufî and the other numeric; or one hâli vasat and the other an ordinary numeric vefk. Any variation that comes to mind may be used.",
      "Around a vefk prepared in this way the angels' names, the besmele or some ayat may likewise be written.",
    ],
    expects_ml: "രണ്ട് കള്ളിയും അതതിന്റെ തുകയിൽ ഒത്തുവരണം — വെവ്വേറെ പരിശോധിക്കുന്നു",
    expects_en: "Each square must come out at its own total — they are checked separately",
    needsTwo: true,
    build(N, { n = 4, step = 1, ayahTotal = 0 } = {}) {
      // The outer square is the one the size control names; the inner
      // is one smaller, and it is the one written first.
      const inN = n - 1;
      if (inN < 3) return null;
      const innerTotal = ayahTotal > 0 ? ayahTotal : N;
      const out = buildWafq(N, n, { step });
      const inn = buildWafq(innerTotal, inN, { step });
      if (!out?.grid || !inn?.grid) return null;
      return {
        grid: out.grid, houses: out.houses,
        ...checkAll(out.grid, N),
        capraz: {
          outer: { grid: out.grid, total: N, n, ...checkAll(out.grid, N) },
          inner: { grid: inn.grid, total: innerTotal, n: inN, ...checkAll(inn.grid, innerTotal) },
        },
      };
    },
  },
  {
    id: "tedahul",
    src: "havass",
    sizes: [3, 4, 5, 6, 7, 8, 9, 10],
    sizeFromText: true,
    ml: "സിർരി തദാഹുൽ", en: "Sırrı Tedahül", ar: "سر التداخل",
    ref_ml: "ഹവാസ്സ് I പേജ് 328-329 (SIRRI TEDAHÜL USÜLÜ)",
    ref_en: "Hâvâss I pp.328-329 (SIRRI TEDAHÜL USÜLÜ)",
    rules_ml: [
      "ഇസ്മ് ഏറ്റവും മുകളിലെ വരിയിൽ അക്ഷരം അക്ഷരമായി നേരെ എഴുതുക. പല ഇസ്മുകളാണെങ്കിൽ ഇസ്മ് ഇസ്മായി; നീണ്ട ആയത്താണെങ്കിൽ അക്ഷരങ്ങൾ വിഭജിച്ച്; സൂറത്താണെങ്കിൽ ആയത്ത് ആയത്തായി.",
      "ഒരു വരിയിലെ വീടുകളുടെ എണ്ണം എഴുതാനുള്ള ഏകകങ്ങളുടെ എണ്ണത്തോളം — അതായത് അക്ഷരം എത്രയോ അത്ര വരിയും നിരയും.",
      "രണ്ടാം വരിയുടെ തുടക്കത്തിൽ ഒന്നാം വരിയുടെ രണ്ടാമത്തെ അക്ഷരം എഴുതുക. പിന്നെ പദം അതേപടി തുടരുക, വരിയുടെ അവസാനം ഒന്നാമത്തെ അക്ഷരം എഴുതുക.",
      "അതേ രീതി മൂന്നാം വരിക്കും; പദം വീണ്ടും അതേപടി വരുന്നതിന് തൊട്ടുമുമ്പ് വരെ തുടരുക.",
      "കിതാബിന്റെ കുറിപ്പ്: ഇത് വഫ്ഖ് എന്നതിനെക്കാൾ തക്സീർ വിഭാഗത്തിൽ പെടുന്നു; പല ഹവാസ്സ് രേഖകളിലും വഫ്ഖ് എന്ന പേരിൽ കാണുന്നതുകൊണ്ടാണ് വഫ്ഖുകളുടെ ഭാഗത്ത് ചേർത്തത്.",
    ],
    rules_en: [
      "The name is written across the topmost row, letter by letter. If several names, name by name; if a long ayah, its letters divided; if a surah, ayah by ayah.",
      "The number of houses in a row is the number of units to be written — as many rows and columns as there are letters.",
      "At the head of the second row goes the second letter of the first row. The word then continues as it is, and the first letter is written at the end of the row.",
      "The same for the third row, and so on until just before the word comes out as itself again.",
      "The book's own note: this belongs to the teksir class rather than to the vefks; it is placed among the vefks because many Hâvâss documents show it under that name.",
    ],
    expects_ml: "അക്ഷരക്കള്ളിയായതിനാൽ സംഖ്യാ പരിശോധന ബാധകമല്ല",
    expects_en: "Being a letter square, the numeric check does not apply",
    needsText: true,
    letters: true,
    build(N, { text = "" } = {}) {
      const ls = lettersOf(text);
      const k = ls.length;
      if (k < 2) return null;
      // Each row is the letters carried one step to the left, the one
      // that falls off the head coming back round to the tail. The last
      // row is the step before the name reads as itself again.
      const grid = Array.from({ length: k }, (_, r) =>
        Array.from({ length: k }, (_, c) => ls[(r + c) % k].ch)
      );
      const numeric = Array.from({ length: k }, (_, r) =>
        Array.from({ length: k }, (_, c) => ls[(r + c) % k].v)
      );
      return {
        grid, houses: null, numeric, sums: lineSums(numeric),
        valid: null, expected: null, n: k,
      };
    },
  },
];

export const methodsFor = (n) => METHODS.filter((m) => m.sizes.includes(n));
export const methodById = (id) => METHODS.find((m) => m.id === id) || null;

/** The Sun–Moon angle that matches a step, for showing beside the step control. */
export const ANGLE_FOR_STEP = { 1: 30, 2: 60, 3: 90, 4: 120, 5: 150, 6: 180 };
export const STEP_FOR_ANGLE = { 30: 1, 60: 2, 90: 3, 120: 4, 150: 5, 180: 6 };
export const ANGLE_SEX = {
  30: { ml: "ആൺ", en: "male" }, 90: { ml: "ആൺ", en: "male" }, 150: { ml: "ആൺ", en: "male" },
  60: { ml: "പെൺ", en: "female" }, 120: { ml: "പെൺ", en: "female" },
  180: { ml: "⚠ ഒഴിവാക്കുക", en: "⚠ avoid" },
};

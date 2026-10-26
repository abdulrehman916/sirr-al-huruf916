// ═══════════════════════════════════════════════════════════════
// Finding a vefk's hâdims — Hâvâss I pp. 196-198,
// "BİR VEFKİN HÂDİMLERİNİ BULMA USÜLÜ".
//
// The book: one of the reasons for making a vefk is to direct the
// hâdims of the name or ayah it was made from toward the work
// wanted, and if they are not directed the result may not come.
//
// Every vefk has eight ulvî, eight suflî and eight şerli hâdims.
// Each name is taken from one of eight points of the square, and
// from the reckonings between them.
// ═══════════════════════════════════════════════════════════════

import { ABJAD } from "./sirrWafqEngine.js";

export const HADIM_SOURCE = { book: "Hâvâss'ın Derinlikleri I", pages: "196-198" };

/** Letters by value, largest first — for turning a number back into letters. */
const BY_VALUE = Object.entries(ABJAD)
  .map(([ch, v]) => ({ ch, v }))
  .sort((a, b) => b.v - a.v);

/**
 * Nutk: a number spoken as letters. The number is broken into abjad
 * values, largest first, and those letters are what is pronounced —
 * the book's own example is 69 → 60 (س) + 9 (ط), read "Set".
 */
export function nutk(n) {
  let rest = Math.max(0, Math.round(n));
  const parts = [];
  for (const { ch, v } of BY_VALUE) {
    while (rest >= v) { parts.push({ ch, v }); rest -= v; }
  }
  return parts;
}

export const nutkLetters = (n) => nutk(n).map((p) => p.ch).join("");

/** The suffix each class of hâdim takes, and the number it is worth. */
export const HADIM_CLASS = {
  ulvi:  { sub: 41,  suffix: "ائيل",  tr: "Âil",    ml: "ഉൽവി — ഉന്നതർ",    en: "Ulvî — the high" },
  sufli: { sub: 316, suffix: "يوشين", tr: "Yuşin",  ml: "സുഫ്‌ലി — താഴെയുള്ളവർ", en: "Suflî — the low" },
  sher:  { sub: 319, suffix: "طيشين", tr: "Tayşin", ml: "⚠ ശർ — ദോഷകാരികൾ", en: "⚠ Şer — the harmful", harm: true },
};

/** 19², the letter count of the besmele squared (p. 198). */
export const DEVRI_FELAK = 361;

/**
 * The eight points of a square — the book's own list, p. 196.
 * `grid` is the finished square, `key` the miftah it was begun from.
 */
export function eightPoints(grid, key) {
  const n = grid.length;
  const flat = grid.flat();
  const mebde = Math.min(...flat);          // the vefk's first house
  const kutup = Math.max(...flat);          // the vefk's last house
  const vefk = grid[0].reduce((a, b) => a + b, 0);   // one row or column
  const mesahe = vefk * n;                  // all the rows together
  const zabit = vefk + mesahe;
  const gaye = zabit * 2;
  const asil = gaye * kutup;
  const miftah = key != null ? key : mebde;
  return [
    { id: "mebde",  v: mebde,            ar: "مبدأ",  tr: "Mebde",  ml: "മബ്ദഅ് — ഒന്നാം വീട്",            en: "Mebde — the first house" },
    { id: "kutup",  v: kutup,            ar: "قطب",   tr: "Kutup",  ml: "ഖുത്വ്ബ് — അവസാന വീട്",           en: "Kutup — the last house" },
    { id: "adil",   v: miftah + kutup,   ar: "عادل",  tr: "Adil",   ml: "ആദിൽ — മിഫ്താഹും ഖുത്വ്ബും കൂട്ടിയത്", en: "Adil — miftah plus kutup" },
    { id: "vefk",   v: vefk,             ar: "وفق",   tr: "Vefk",   ml: "വഫ്ഖ് — ഒരു വരിയുടെ തുക",         en: "Vefk — the sum of one row" },
    { id: "mesahe", v: mesahe,           ar: "مساحة", tr: "Mesahe", ml: "മിസാഹ — എല്ലാ വരികളുടെയും തുക",   en: "Mesahe — all the rows together" },
    { id: "zabit",  v: zabit,            ar: "ضابط",  tr: "Zabit",  ml: "ദ്വാബിത് — വഫ്ഖും മിസാഹയും",      en: "Zabit — vefk plus mesahe" },
    { id: "gaye",   v: gaye,             ar: "غاية",  tr: "Gaye",   ml: "ഗായ — ദ്വാബിതിന്റെ ഇരട്ടി",       en: "Gaye — twice zabit" },
    { id: "asil",   v: asil,             ar: "أصل",   tr: "Asıl",   ml: "അസ്വ്ൽ — ഗായയും ഖുത്വ്ബും ഗുണിച്ചത്", en: "Asıl — gaye times kutup" },
  ];
}

/** Mebde plus müntaha (p. 196). For the 5's natural order, 1 + 25 = 26. */
export function kiran(grid) {
  const flat = grid.flat();
  return Math.min(...flat) + Math.max(...flat);
}

/**
 * One hâdim name from one point.
 *
 * The book: subtract the class's number; if it cannot be subtracted,
 * add the devri felak first. And — the point it is careful about —
 * once the devri felak has been added for any one class, it is added
 * for the others too, even where the subtraction would have worked
 * without it. So `forceDevri` carries that decision across the three.
 */
export function hadimFrom(value, cls, forceDevri = false) {
  const { sub, suffix } = HADIM_CLASS[cls];
  let v = value;
  let devri = false;
  if (forceDevri || v < sub) { v += DEVRI_FELAK; devri = true; }
  const rest = v - sub;
  return { value, used: v, rest, devri, letters: nutkLetters(rest),
           name: nutkLetters(rest) + suffix, parts: nutk(rest) };
}

/**
 * All twenty-four hâdims of a square: eight points by three classes.
 * The devri felak is settled once for each point, across its three
 * names, exactly as p. 198 requires.
 */
export function hadimsOf(grid, key) {
  const pts = eightPoints(grid, key);
  return pts.map((p) => {
    const need = ["ulvi", "sufli", "sher"].some((c) => p.v < HADIM_CLASS[c].sub);
    return {
      point: p,
      ulvi:  hadimFrom(p.v, "ulvi",  need),
      sufli: hadimFrom(p.v, "sufli", need),
      sher:  hadimFrom(p.v, "sher",  need),
      devri: need,
    };
  });
}

/**
 * Esmaül Avan (p. 197): every house of the square spoken in the
 * natural order, each with "Tatil" after it. There are as many as
 * the square has houses — nine for the 3, sixteen for the 4,
 * twenty-five for the 5.
 */
export const AVAN_SUFFIX = "طائيل";

export function esmaulAvan(grid) {
  return grid.flat()
    .slice()
    .sort((a, b) => a - b)
    .map((v) => ({ v, letters: nutkLetters(v), name: nutkLetters(v) + AVAN_SUFFIX }));
}

export const HADIM_NOTE = {
  ml: "വഫ്ഖ് ഉണ്ടാക്കുന്നതിന്റെ ഒരു ഉദ്ദേശ്യം, ഏത് ഇസ്മിന്റെയോ ആയത്തിന്റെയോ വഫ്ഖാണോ ഉണ്ടാക്കിയത് അതിന്റെ ഹാദിമുകളെ ഉദ്ദേശിച്ച കാര്യത്തിലേക്ക് തിരിച്ചുവിടുക എന്നതാണ്. വഫ്ഖ് ഉണ്ടാക്കിയ ശേഷം അതിന്റെ ഉൽവി-സുഫ്‌ലി ഹാദിമുകളെ തിരിച്ചുവിട്ടില്ലെങ്കിൽ ഉദ്ദേശിച്ച ഫലം ഉണ്ടാകണമെന്നില്ല.",
  en: "One of the reasons for making a vefk is to direct the hâdims of the name or ayah it was made from toward the work wanted. If, after a vefk is made, its ulvî and suflî hâdims are not directed to that work, the result wanted may not come about.",
  page: "196",
};

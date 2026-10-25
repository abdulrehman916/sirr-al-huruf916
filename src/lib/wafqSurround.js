// ═══════════════════════════════════════════════════════════════
// What is written around the square.
//
// Sources:
//   Hâvâss'ın Derinlikleri I, "Vefklerin Çevreleri", pp. 187–192
//   — the seven ways of surrounding a square, the four archangels
//     and which work each belongs to, the besmele split four ways,
//     and the corner verse.
//   Same book p. 200 — each day's ulvî (angel) and suflî (jinn).
//   Same book pp. 207, 222, 281 … — each size's ruling planet.
// ═══════════════════════════════════════════════════════════════

/**
 * Each planet's ulvî (angel) and suflî (jinn).
 *
 * The book prints this per weekday, but every weekday is ruled by a
 * planet, so one row serves both lookups: the DAY's pair comes from
 * the planet ruling the day, the HOUR's pair from the planet ruling
 * that planetary hour.
 */
export const PLANET_HADIM = {
  zuhal:    { ar: "زحل",    ml: "ശനി",      day: 6, ulvi: "كسفيائيل", ulvi_ml: "കസ്ഫിയാഈൽ",  sufli: "ميمون",  sufli_ml: "മൈമൂൻ" },
  mushtari: { ar: "المشتري", ml: "വ്യാഴം",   day: 4, ulvi: "صرفيائيل", ulvi_ml: "സ്വർഫിയാഈൽ", sufli: "شمهورش", sufli_ml: "ശംഹൂറശ്" },
  mirrikh:  { ar: "المريخ",  ml: "ചൊവ്വ",    day: 2, ulvi: "سمسمائيل", ulvi_ml: "സംസമാഈൽ",    sufli: "احمر",   sufli_ml: "അഹ്മർ" },
  shams:    { ar: "الشمس",   ml: "സൂര്യൻ",   day: 0, ulvi: "روقيائيل", ulvi_ml: "റൂഖിയാഈൽ",   sufli: "مذحب",   sufli_ml: "മദ്ഹബ്" },
  zuhra:    { ar: "الزهرة",  ml: "ശുക്രൻ",   day: 5, ulvi: "عينيائيل", ulvi_ml: "ഐനിയാഈൽ",    sufli: "ذوباع",  sufli_ml: "ദൂബാഅ്" },
  utarid:   { ar: "عطارد",   ml: "ബുധൻ",     day: 3, ulvi: "ميكائيل",  ulvi_ml: "മീകാഈൽ",     sufli: "برقان",  sufli_ml: "ബുർഖാൻ" },
  qamar:    { ar: "القمر",   ml: "ചന്ദ്രൻ",  day: 1, ulvi: "جبرائيل",  ulvi_ml: "ജിബ്രാഈൽ",   sufli: "ابياد",  sufli_ml: "അബ്യദ്" },
};

/** Weekday 0=Sunday … 6=Saturday → the planet that rules it. */
export const DAY_PLANET = ["shams", "qamar", "mirrikh", "utarid", "mushtari", "zuhra", "zuhal"];

/**
 * The days' Arabic names (p. 200).
 *
 * PRINTING ERROR in the book: its table pairs Cuma (Friday) with
 * السبت and Cumartesi (Saturday) with الجمع — the two are crossed.
 * السبت is Saturday and الجمعة is Friday; corrected here.
 */
export const DAY_NAME_AR = [
  "يوم الواحد", "يوم الثاني", "يوم الثالث", "يوم الرابع",
  "يوم الخامس", "الجمعة", "السبت",
];
export const DAY_NAME_AR_ALT = { 0: "يوم الأحد" };

/**
 * The four archangels and the work each belongs to (pp. 187–188).
 *
 * Written in the order Cebrâil, İsrâfil, Mikâil, Azrâil because
 * their initials ج ا م ع spell جامع. Each name is followed by ع م
 * (عليه السلام).
 *
 * `harm` marks the two the book assigns to destructive work. They
 * are recorded because the book records them; the site does not
 * build workings aimed at a named person.
 */
export const ARCHANGELS = [
  {
    id: "jibril", ar: "جبرائيل", ml: "ജിബ്രാഈൽ", side: "top",
    // both books agree here
    kashf_ml: "ഇണക്കവും സ്നേഹവും (العطف والمحبة)",
    havass_ml: "സ്നേഹം, സ്വീകാര്യത, വിവാഹം, അപേക്ഷ സ്വീകരിക്കൽ, ഉദ്ദേശം നടക്കൽ, സമ്പാദ്യം, ജോലിയിൽ ഉയർച്ച",
    kashf_en: "Affection and love",
    havass_en: "Love, acceptance, marriage, requests granted, earnings, advancement",
  },
  {
    id: "mikail", ar: "ميكائيل", ml: "മീകാഈൽ", side: "right",
    // both books agree here too
    kashf_ml: "രിസ്ഖും ഫത്ഹും (الأرزاق والفتوح)",
    havass_ml: "സമൃദ്ധി, രിസ്ഖ്, ബറകത്ത്",
    kashf_en: "Provision and openings",
    havass_en: "Abundance, provision, blessing",
  },
  {
    id: "israfil", ar: "اسرافيل", ml: "ഇസ്റാഫീൽ", side: "left", harm: true,
    // the two books part company on this one
    kashf_ml: "⚠ പീഡയും രോഗവും (العذاب والأسقام)",
    havass_ml: "⚠ ഭിന്നത, വേർപിരിയൽ, ജോലിയിൽനിന്ന് പുറത്താക്കൽ",
    kashf_en: "⚠ Torment and sickness",
    havass_en: "⚠ Discord, separation, dismissal",
  },
  {
    id: "azrail", ar: "عزرائيل", ml: "അസ്റാഈൽ", side: "bottom", harm: true,
    kashf_ml: "⚠ നാശവും മരണവും (الهلاك والموت)",
    havass_ml: "⚠ നാശം, തകർച്ച, മരണം",
    kashf_en: "⚠ Destruction and death",
    havass_en: "⚠ Destruction, ruin, death",
  },
];

/**
 * Written round the square from the top: Jibrāʾīl, Mīkāʾīl, Isrāfīl,
 * ʿAzrāʾīl — the `side` fields above.
 *
 * Hâvâss I p.188 gives a different round: Cebrâil, İsrâfil, Mikâil,
 * Azrâil, so that the initials ج ا م ع spell جامع. Kept here for the
 * record, and switchable.
 */
// Placement as the book draws it (pp. 190, 289): top, left, right,
// bottom — the order of ج ا م ع, the letters of Allah's attribute
// "Jami'", which is why the book gives this sequence.
export const ANGEL_ROUND = ["jibril", "israfil", "mikail", "azrail"];
export const ANGEL_ROUND_JAMI = ["jibril", "israfil", "mikail", "azrail"];

export const ANGEL_SUFFIX = "ع م";

/** The besmele as the book splits it for the four corners (p. 190). */
export const BASMALA_FOUR = ["بسم", "الله", "الرحمن", "الرحيم"];

/** The verse usually chosen for the corners (p. 191). */
export const CORNER_VERSE = "قوله الحق وله الملك";

/** The abjad total of the basmala, written at the head of the sheet. */
export const BASMALA_NUMBER = 786;

/**
 * The corners, clockwise from the top right — the order the book's
 * own example runs in (بسم at the top right, الرحيم at the top left).
 */
export const CORNER_ORDER = ["tr", "br", "bl", "tl"];

/**
 * Splits a text into exactly four corner pieces, on word boundaries
 * only. Four words give one word per corner. More words are gathered
 * into four runs of as near equal length as the words allow, never
 * breaking a word. Fewer than four words cannot be split, so this
 * returns null and the caller says so rather than forcing it.
 */
export function splitFour(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (words.length < 4) return null;
  if (words.length === 4) return words.slice();

  const len = (w) => [...w].length;
  const totals = words.map(len);
  const target = totals.reduce((a, b) => a + b, 0) / 4;

  // walk the words, closing a group once it is nearer to the target
  // with this word than without it, keeping four groups non-empty
  const groups = [[]];
  let run = 0;
  words.forEach((w, i) => {
    const left = words.length - i;          // words still to place
    const need = 4 - groups.length;         // groups still to open
    const mustClose = left === need;
    const better = run > 0 && Math.abs(run + totals[i] - target) > Math.abs(run - target);
    if (groups.length < 4 && (mustClose || better)) {
      groups.push([]);
      run = 0;
    }
    groups[groups.length - 1].push(w);
    run += totals[i];
  });
  while (groups.length < 4) groups.push([]);
  if (groups.some((g) => g.length === 0)) return null;
  return groups.map((g) => g.join(" "));
}

/** Where each corner piece sits, and which way its baseline runs. */
export const CORNER_GEOM = {
  tr: { sx:  1, sy: -1, rot:  -45 },
  br: { sx:  1, sy:  1, rot:   45 },
  bl: { sx: -1, sy:  1, rot:  -45 },
  tl: { sx: -1, sy: -1, rot:   45 },
};

/** The seven ways the book gives for surrounding a square (pp.187–192). */
export const SURROUND_MODES = [
  { id: "bare",      ml: "ചുറ്റും ഒന്നുമില്ല",                      page: 189 },
  { id: "circle",    ml: "ബിസ്മി വൃത്തമാക്കി, ഉള്ളിൽ കളം",          page: 191 },
  { id: "four",      ml: "നാല് വശത്തും നാല് മലക്കുകൾ",             page: 189 },
  { id: "one",       ml: "നാല് വശത്തും ഒരേ മലക്ക്",                 page: 188 },
  { id: "corners",   ml: "നാല് മൂലയിൽ ആയത്ത് നാലായി",              page: 191 },
  { id: "besmele",   ml: "പുറംവരകൾ ബിസ്മി നാലായി",                 page: 190 },
  { id: "verseline", ml: "പുറംവരകൾ ആയത്ത് കൊണ്ട്",                  page: 192 },
];

// ═══════════════════════════════════════════════════════════════
// How the writing is laid out around the square.
//
// Confirmed against Hâvâss I p.192 ("the final example, with
// everything written") and corrected line by line with the reader.
// ═══════════════════════════════════════════════════════════════

/** Which side each besmele piece is written on. 0=top 90=right 180=bottom 270=left */
export const BASMALA_SIDE = [0, 270, 90, 180];   // بسم top · الله left · الرحمن right · الرحيم bottom

/** Which corner each verse piece sits on, قوله first at the besmele's gap. */
export const VERSE_CORNER = ["tr", "tl", "bl", "br"];

/** The two lower corners are written the other way round, as the bottom side is. */
export const CORNER_FLIP = { tr: 0, tl: 0, bl: 180, br: 180 };

/** How far the writing overhangs the square's corners, as a fraction of the side. */
export const OVERHANG = 0.5;

/**
 * Where a word breaks: the letters before this index stand outside the
 * starting corner, the letter at it is drawn out to form the side, and
 * the rest ends past the far corner.
 *
 * One or two letters are left for the far end — بس|م, الل|ه, الرح|من,
 * الرح|يم — and the index is then snapped back to a letter that can
 * actually be stretched.
 */
export function splitIndexFor(part, slots) {
  const len = [...part].length;
  const want = len <= 4 ? len - 2 : len - 3;
  const ok = slots.filter((i) => i <= Math.max(0, want));
  return ok.length ? ok[ok.length - 1] : (slots[0] ?? 0);
}

// ═══════════════════════════════════════════════════════════════
// Kashf al-Haqa'iq, printed p.253 — "the table of the days' upper
// kings, the lower kings, their servants and their stars".
//
// This is the table Section A follows, being Kashf's own. It is
// fuller than Hâvâss's: besides the upper angel and the lower king
// it names a KHADIM for each day, and gives the day's planet, its
// sign, its name of God and letter, its incense and its metal.
//
// Where the two books differ is recorded in `havass`:
//   Saturday  Kashf عزرائيل   ·  Hâvâss كسفيائيل
// The lower kings agree exactly in both books.
// ═══════════════════════════════════════════════════════════════

export const KASHF_DAY = [
  { ml: "ഞായർ",  ar: "الأحد",    ulvi: "روقيائيل", sufli: "المذهب", khadim: "دعول",  planet: "الشمس",   burj: "الأسد",    sex: "ذكر",    name: "فرد",   letter: "ف", incense: "السندروس",                 metal: "ذهب" },
  { ml: "തിങ്കൾ", ar: "الأثنين",  ulvi: "جبرائيل",  sufli: "الأبيض", khadim: "حندش",  planet: "القمر",   burj: "السرطان",  sex: "انثى",   name: "جبار",  letter: "ج", incense: "اللبان الذكر",              metal: "فضة" },
  { ml: "ചൊവ്വ",  ar: "الثلاثاء", ulvi: "سمسيائيل", sufli: "الأحمر", khadim: "حنغر",  planet: "المريخ",  burj: "العقرب",   sex: "ذكر",    name: "شهيد",  letter: "ش", incense: "القسط وقشر المحلب",         metal: "حديد" },
  { ml: "ബുധൻ",   ar: "الأربعاء", ulvi: "ميكائيل",  sufli: "برقان",  khadim: "هميطل", planet: "عطارد",   burj: "الجوزاء",  sex: "ممتزج",  name: "وارث",  letter: "ث", incense: "المقل الأزرق والعنبر",      metal: "زئبق" },
  { ml: "വ്യാഴം", ar: "الخميس",   ulvi: "صرفيائيل", sufli: "شمهورش", khadim: "شمرول", planet: "المشتري", burj: "القوس",    sex: "ذكر",    name: "ظاهر",  letter: "ظ", incense: "العود والكافور",            metal: "قصدير" },
  { ml: "വെള്ളി", ar: "الجمعة",   ulvi: "عنيائيل",  sufli: "زوبعة",  khadim: "بطراق", planet: "الزهرة",  burj: "الثور",    sex: "انثى",   name: "خبير",  letter: "خ", incense: "المصطكي",                   metal: "نحاس" },
  { ml: "ശനി",    ar: "السبت",    ulvi: "عزرائيل",  sufli: "ميمون",  khadim: "شمعون", planet: "زحل",     burj: "الدلو",    sex: "ذكر",    name: "زكي",   letter: "ز", incense: "الشمع الأصفر والمايعة",     metal: "رصاص",
    havass: { ulvi: "كسفيائيل" } },
];

/**
 * Kashf p.54, "the hours of working and of needs, by the Moon's sign".
 * Whatever the day, aim for your need in the hour of this planet.
 * Index is the sign, 0 = Aries.
 */
export const HOUR_BY_MOON_SIGN = [
  "mirrikh",  // الحمل      → ساعة المريخ
  "zuhra",    // الثور      → ساعة الزهرة
  "utarid",   // الجوزاء    → ساعة عطارد
  "qamar",    // السرطان    → ساعة القمر
  "shams",    // الأسد      → ساعة الشمس
  "utarid",   // العذراء    → ساعة عطارد
  "zuhra",    // الميزان    → ساعة الزهرة
  "mirrikh",  // العقرب     → ساعة المريخ
  "mushtari", // القوس      → ساعة المشتري
  "zuhal",    // الجدي      → ساعة زحل
  "zuhal",    // الدلو      → ساعة زحل
  "mushtari", // الحوت      → ساعة المشتري
];

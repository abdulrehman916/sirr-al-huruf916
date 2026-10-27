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
    id: "jibril", kashf_ar: "العطف والمحبة", short_ml: "ഇണക്കം, സ്നേഹം", ar: "جبرائيل", ml: "ജിബ്രാഈൽ", side: "top",
    // both books agree here
    kashf_ml: "ഇണക്കവും സ്നേഹവും (العطف والمحبة)",
    havass_ml: "സ്നേഹം, സ്വീകാര്യത, വിവാഹം, അപേക്ഷ സ്വീകരിക്കൽ, ഉദ്ദേശം നടക്കൽ, സമ്പാദ്യം, ജോലിയിൽ ഉയർച്ച",
    kashf_en: "Affection and love",
    havass_en: "Love, acceptance, marriage, requests granted, earnings, advancement",
  },
  {
    id: "mikail", kashf_ar: "الأرزاق والفتوح", short_ml: "രിസ്ഖ്, ഫത്ഹ്", ar: "ميكائيل", ml: "മീകാഈൽ", side: "right",
    // both books agree here too
    kashf_ml: "രിസ്ഖും ഫത്ഹും (الأرزاق والفتوح)",
    havass_ml: "സമൃദ്ധി, രിസ്ഖ്, ബറകത്ത്",
    kashf_en: "Provision and openings",
    havass_en: "Abundance, provision, blessing",
  },
  {
    id: "israfil", kashf_ar: "العذاب والأسقام", short_ml: "പീഡ, രോഗം", ar: "اسرافيل", ml: "ഇസ്റാഫീൽ", side: "left", harm: true,
    // the two books part company on this one
    kashf_ml: "⚠ പീഡയും രോഗവും (العذاب والأسقام)",
    havass_ml: "⚠ ഭിന്നത, വേർപിരിയൽ, ജോലിയിൽനിന്ന് പുറത്താക്കൽ",
    kashf_en: "⚠ Torment and sickness",
    havass_en: "⚠ Discord, separation, dismissal",
  },
  {
    id: "azrail", kashf_ar: "الهلاك والموت", short_ml: "നാശം, മരണം", ar: "عزرائيل", ml: "അസ്റാഈൽ", side: "bottom", harm: true,
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
 * breaking a word. Fewer than four words are split by their letters
 * (splitLetters); only a text of fewer than four letters returns null.
 */
export function splitFour(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (words.length < 4) return splitLetters(words.join(" "));
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

/**
 * Fewer than four words: the owner's rule is that any word, however
 * short the text, is still written in four pieces. The letters are
 * shared out four ways as evenly as they go, a harakah staying with
 * its letter and a space never starting or ending a piece. Fewer than
 * four letters cannot make four pieces, so that alone returns null.
 */
function splitLetters(text) {
  // each word as letter units, a harakah kept with its letter
  const words = text.split(/\s+/).filter(Boolean).map((w) => {
    const u = [];
    for (const ch of [...w]) {
      if (/[\u064B-\u065F\u0670\u06D6-\u06ED]/.test(ch) && u.length) u[u.length - 1] += ch;
      else u.push(ch);
    }
    return u;
  });
  const total = words.reduce((n, w) => n + w.length, 0);
  if (total < 4) return null;
  // one piece per word to begin with; the cuts still wanted go to the
  // word with the most letters per piece, so the pieces stay even and
  // a word is cut only where the four cannot be had at the spaces
  const count = words.map(() => 1);
  for (let left = 4 - words.length; left > 0; left--) {
    let best = -1;
    words.forEach((w, i) => {
      const r = w.length / count[i], rb = best < 0 ? -1 : words[best].length / count[best];
      if (count[i] < w.length && (r > rb || (r === rb && w.length > words[best].length))) best = i;
    });
    if (best < 0) return null;
    count[best]++;
  }
  const out = [];
  words.forEach((w, i) => {
    for (let k = 0; k < count[i]; k++) {
      out.push(w.slice(Math.round((w.length * k) / count[i]), Math.round((w.length * (k + 1)) / count[i])).join(""));
    }
  });
  return out.length === 4 && out.every(Boolean) ? out : null;
}

/** Where each corner piece sits, and which way its baseline runs. */
export const CORNER_GEOM = {
  tr: { sx:  1, sy: -1, rot:  -45 },
  br: { sx:  1, sy:  1, rot:   45 },
  bl: { sx: -1, sy:  1, rot:  -45 },
  tl: { sx: -1, sy: -1, rot:   45 },
};

/**
 * The seven ways the book gives for surrounding a square (pp.187–192).
 *
 * The book does NOT tie a surround to a method of building. It says
 * plainly, closing the chapter on p.187:
 *
 *   "Özet olarak veklerin çevre yazıları da vefkin amacına ve yapan
 *    kişinin görüşüne göre değişir."
 *   — in short, what is written round a vefk changes with the vefk's
 *     purpose and with the view of the one making it.
 *
 * So the surround is chosen, not decided by the square. Each way below
 * carries the shape the book draws for it, which is what the sheet is
 * given: `angels` whether anything is written on the four sides,
 * `four` all four archangels in the ج ا م ع order or the one chosen,
 * `besmele` the outer lines made of the besmele split four ways,
 * `verse` the short ayah lying across the corners, `ring` the besmele
 * (or the reader's own words) carried right round outside everything.
 */
export const SURROUND_MODES = [
  { id: "bare",      ml: "ചുറ്റും ഒന്നുമില്ല",                      en: "Nothing around it",
    page: 189, angels: false, four: false, besmele: false, verse: false, ring: false,
    note_ml: "കിതാബിന്റെ ആദ്യ വഴി. \"പല അവസ്ഥകളിലും വഫ്ഖുകൾ ഈ രൂപത്തിൽ മാത്രമാണ് ഉപയോഗിക്കുന്നത്, അവയുടെ ചുറ്റ് ഇവിടെ കാണുന്നതുപോലെ ഒഴിഞ്ഞതാണ്.\"",
    note_en: "The book's first way: \"in many cases vefks are used in this plain form alone, and their surrounds are empty, as here.\"" },

  { id: "four",      ml: "നാല് വശത്തും നാല് മലക്കുകൾ",             en: "The four archangels on the four sides",
    page: 189, angels: true, four: true, besmele: false, verse: false, ring: false,
    note_ml: "ജിബ്രാഈൽ · ഇസ്റാഫീൽ · മീകാഈൽ · അസ്റാഈൽ എന്ന ക്രമത്തിൽ — അവരുടെ ആദ്യാക്ഷരങ്ങൾ ജ ا م ع ചേർന്ന് അല്ലാഹുവിന്റെ \"ജാമിഅ്\" എന്ന വിശേഷണമാകുന്നു. ഇത് പൊതുവെയുള്ള രീതിയാണ്.",
    note_en: "In the order Cebrâil · İsrâfil · Mikâil · Azrâil — their initials ج ا م ع spelling God's attribute Jâmi', the one who gathers what He wills, when and where He wills. This is the general tendency." },

  { id: "one",       ml: "നാല് വശത്തും ഒരേ മലക്ക് — കാര്യത്തിന് യോജിച്ചത്", en: "One archangel, the one the work belongs to, on all four sides",
    page: 188, angels: true, four: false, besmele: false, verse: false, ring: false,
    note_ml: "\"ഈ മലക്കുകളിൽ ഒരാളുടെ പേര് മാത്രം, ചെയ്യുന്ന കാര്യത്തോട് ബന്ധപ്പെട്ടത് തിരഞ്ഞെടുത്ത്, നാല് വശത്തും അവന്റെ പേര് എഴുതാം.\" ഏത് കാര്യം ഏത് മലക്കിന്റേതാണെന്ന് കിതാബ് പറയുന്നു — താഴെ കാണുക.",
    note_en: "\"Only one of these angels' names, the one related to the work in hand, may be chosen and written on all four sides.\" Which work belongs to which angel the book sets out — shown below." },

  { id: "besmele",   ml: "പുറംവരകൾ ബിസ്മി നാലായി",                 en: "The outer lines made of the besmele, split four ways",
    page: 190, angels: false, four: false, besmele: true, verse: false, ring: false,
    note_ml: "ചതുരക്കളത്തിന്റെ പുറംവരകൾ \"ബിസ്മില്ലാഹിർറഹ്മാനിർറഹീം\" നാലായി പിരിച്ച് — ബിസ്മ് · ഇല്ലാഹി · അർറഹ്മാൻ · അർറഹീം — ഉണ്ടാക്കുന്നു. \"ചില വഫ്ഖുകൾ ഈ രൂപത്തിൽ മാത്രമാണ്; ചുറ്റ് വേറൊന്നും എഴുതില്ല.\"",
    note_en: "The square's outer lines are made from \"Bismillâhirrahmânirrahîm\" divided in four — Bism · illâhi · errahmân · errahîm. \"Some vefks are made only in this way: nothing else is written around them.\"" },

  { id: "besmelefour", ml: "പുറംവരകൾ ബിസ്മി + നാല് വശത്ത് മലക്കുകൾ", en: "Besmele outer lines with the angels on the four edges",
    page: 191, angels: true, four: true, besmele: true, verse: false, ring: false,
    note_ml: "\"ചിലതിൽ, ഇവിടെയുള്ളതുപോലെ, വശവരകൾ ബിസ്മിയാൽ ഉണ്ടാകുന്നു, നാല് വശത്ത് മലക്കുകളുടെ പേരുകളും എഴുതുന്നു.\"",
    note_en: "\"In some, as here, the side lines are formed of the besmele and the angels' names are written on the four edges.\"" },

  { id: "corners",   ml: "നാല് മൂലയിൽ ആയത്ത് നാലായി",              en: "A short ayah divided across the four corners",
    page: 191, angels: true, four: true, besmele: false, verse: true, ring: false,
    note_ml: "\"വഫ്ഖുകളുടെ മൂലകളിൽ ചില ആയത്തുകൾ എഴുതുന്ന പതിവുണ്ട്. ഇതിന് സാധാരണ قوله الحق وله الملك എന്ന ആയത്താണ് തിരഞ്ഞെടുക്കുന്നത്.\" കാര്യത്തിന് യോജിച്ച ചെറിയ ആയത്ത് നാലായി പിരിച്ച് ഓരോ മൂലയിലും ഒരു ഭാഗം.",
    note_en: "\"There is a tradition of writing certain ayahs at a vefk's corners; for this, قوله الحق وله الملك is generally chosen.\" A short ayah suited to the work, divided in four, a piece to each corner." },

  { id: "circle",    ml: "ബിസ്മി വൃത്തമാക്കി, ഉള്ളിൽ കളം",          en: "The besmele written as a circle, the square set inside it",
    page: 191, angels: true, four: true, besmele: false, verse: false, ring: true,
    note_ml: "\"ബിസ്മിയെ വൃത്തരൂപത്തിൽ എഴുതി വഫ്ഖിനെ അതിന്റെ ഉള്ളിൽ ഇരുത്തുന്ന പ്രയോഗങ്ങളും ഉണ്ട്.\" വൃത്തത്തിൽ എഴുതേണ്ടത് താഴെ സ്വയം മാറ്റാം.",
    note_en: "\"There are also applications that write the besmele in the shape of a circle and seat the vefk inside it.\" What goes round the circle can be changed below." },

  { id: "verseline", ml: "പുറംവരകൾ ആയത്ത് കൊണ്ട് — ബിസ്മിക്ക് പകരം", en: "The ayah as the outer lines, in the besmele's place",
    page: 192, angels: false, four: false, besmele: false, verse: false, ring: false, verseAsLine: true,
    note_ml: "\"അതേ ആയത്തിനെ ബിസ്മിക്ക് പകരം വഫ്ഖിന്റെ വശവരയായി ഉപയോഗിക്കുന്ന ഒരു ഉദാഹരണം.\" ബിസ്മിയെപ്പോലെ ആയത്തും നാലായി പിരിഞ്ഞ് നാല് പുറംവരകളാകുന്നു.",
    note_en: "\"An example using that same ayah as the vefk's edge line, in the besmele's place.\" The ayah is split four ways and makes the four outer lines, just as the besmele does." },

  { id: "all",       ml: "എല്ലാം ചേർന്നത് — ബിസ്മി, മലക്കുകൾ, മൂലയിൽ ആയത്ത്", en: "Everything together — besmele, angels and the corner ayah",
    page: 192, angels: true, four: true, besmele: true, verse: true, ring: false,
    note_ml: "കിതാബിന്റെ അവസാന ഉദാഹരണം — \"ഈ ആയത്ത് മൂലകളിൽ ഉപയോഗിച്ച്, ഇവിടെ പറഞ്ഞതെല്ലാം എഴുതിയ അവസാന ഉദാഹരണം.\"",
    note_en: "The book's last example — \"the final example, with that ayah at the corners and everything described here written in.\"" },
];

/**
 * The book's warning against reading these as stages (p. 193):
 * every one of the forms above is a real form used in its own right.
 * They are not pieces of one vefk shown step by step.
 */
export const SURROUND_NOT_STAGES = {
  tr: "Yukarda görülen örneklerin hepsi de ayrı ayrı gerçek şekiller olarak kullanılmaktadırlar. Yani burada bir vefkin yapım aşamasına örnek olarak parça parça göstermek için verilmiş değildirler.",
  ml: "മേൽ കണ്ട ഉദാഹരണങ്ങളെല്ലാം വേറെ വേറെ യഥാർത്ഥ രൂപങ്ങളായി ഉപയോഗിക്കുന്നവയാണ്. ഒരു വഫ്ഖിന്റെ നിർമ്മാണഘട്ടങ്ങൾ ഭാഗം ഭാഗമായി കാണിക്കാൻ തന്നതല്ല. അതിനാൽ ഒന്ന് തിരഞ്ഞെടുക്കുക — എല്ലാം കൂടി ചെയ്യേണ്ടതില്ല.",
  en: "Every one of the forms above is used as a real form in its own right. They are not given as the stages of making one vefk, shown piece by piece. So one is chosen — they are not all to be done together.",
  page: 193,
};

/** The corner ayah: the usual one, and the book's leave to choose another (p. 193). */
export const CORNER_VERSE_RULE = {
  ml: "മൂലകളിൽ സാധാരണ മേൽപറഞ്ഞ ആയത്താണ് ഉപയോഗിക്കുന്നതെങ്കിലും, ചെയ്യാനുള്ള കാര്യത്തിനനുസരിച്ച് തിരഞ്ഞെടുക്കുന്ന ഏത് ആയത്തും ഉപയോഗിക്കാം.",
  en: "Though the ayah given above is generally used at the corners, any ayah chosen according to the work in hand may be used.",
  page: 193,
};

/** The besmele whole, for the ring that is written round the outside (p.191). */
export const BASMALA_FULL = "بسم الله الرحمن الرحيم";

/** The book's own closing word on the whole chapter (p.187). */
export const SURROUND_RULE = {
  tr: "Özet olarak veklerin çevre yazıları da vefkin amacına ve yapan kişinin görüşüne göre değişir.",
  ml: "ചുരുക്കത്തിൽ, വഫ്ഖിന്റെ ചുറ്റ് എഴുതുന്നതും വഫ്ഖിന്റെ ഉദ്ദേശ്യത്തിനും ചെയ്യുന്നവന്റെ അഭിപ്രായത്തിനും അനുസരിച്ച് മാറുന്നു.",
  en: "In short, what is written round a vefk changes with the vefk's purpose and with the view of the one making it.",
  page: 187,
};

// ═══════════════════════════════════════════════════════════════
// How the writing is laid out around the square.
//
// Confirmed against Hâvâss I p.192 ("the final example, with
// everything written") and corrected line by line with the reader.
// ═══════════════════════════════════════════════════════════════

/** Which side each besmele piece is written on. 0=top 90=right 180=bottom 270=left */
// Hâvâss I p.191 (the first figure): بسم along the top from the right,
// الله down the left, الرحمن along the bottom, الرحيم up the right — the
// four words going round the square one after the other, as the owner
// pointed out (27 Oct 2026). الرحمن and الرحيم had been the wrong way round.
export const BASMALA_SIDE = [0, 270, 180, 90];   // بسم top · الله left · الرحمن bottom · الرحيم right

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


/**
 * Kashf p.51, at the end of the conditions: some scholars made it a
 * condition in every work of love that the ayah of Ibrahim (al-Baqara
 * 260) be written round the wafq if possible, or recited over it, three
 * times, with the verses that follow. Printed as the book prints it.
 */
export const LOVE_SURROUND = {
  intro_ar: "واعلم أن بعض العلماء والمشايخ اشترط في جميع اعمال المحبات ان يكتب حول الوفق إن امكن أو يتلى عليه قوله تعالى",
  ayah: "وإذ قال إبراهيم رب أرني كيف تحيي الموتى قال أولم تؤمن قال بلى ولكن ليطمئن قلبي قال فخذ أربعة من الطير فصرهن إليك ثم اجعل على كل جبل منهن جزءا ثم ادعهن يأتينك سعيا",
  rest_ar: "ثلاث مرات « يوم نطوي السماء كطي السجل » « أنا آتيك به قبل أن يرتد إليك طرفك فلما رآه مستقرا عنده قال هذا من فضل ربي » توكلوا يا خدام هذه الآيات بتهييج فلان بن فلانة بحق تسبيح الملائكة وصلاة الشهداء فسوف يأتي الله بقوم يحبهم ويحبونه وألقيت عليك محبة مني واذكروا نعمة الله عليكم إلى قلوبكم ونزعنا ما في صدورهم من غل",
  ml: "ചില ഉലമാക്കളും മശാഇഖുമാർ സ്നേഹത്തിന്റെ (മഹബ്ബ) എല്ലാ കർമ്മങ്ങളിലും ഇത് ശർത്താക്കിയിട്ടുണ്ട്: സാധിക്കുമെങ്കിൽ ഇബ്റാഹീം നബിയുടെ ഈ ആയത്ത് (അൽ-ബഖറ 260) വഫ്ഖിന് ചുറ്റും എഴുതുക, അല്ലെങ്കിൽ വഫ്ഖിന്മേൽ മൂന്ന് തവണ ഓതുക. പിന്നെ താഴെയുള്ള ആയത്തുകളും ഖിദ്മത്തിന്റെ വാക്കുകളും.",
  en: "Some scholars and shaykhs made it a condition in every work of love that this ayah of Ibrahim (al-Baqara 260) be written round the wafq if possible, or recited over it three times, followed by the verses and words below.",
};

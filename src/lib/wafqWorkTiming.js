// ═══════════════════════════════════════════════════════════════
// When to write a square for the work in hand.
//
// Two sources, and neither is stretched.
//
// 1. Kashf al-Haqa'iq pp. 12-13 names, work by work, the day and the
//    hour. That table is in kashfPurposes.js as WORK_TIMES.
//
// 2. Hâvâss'ın Derinlikleri I pp. 107-108 gives, for a kahır working,
//    a list of timing conditions ORDERED BY IMPORTANCE, and then says
//    plainly what to do when they cannot all be met:
//
//      1) Tuesday, or the night joining Wednesday to Thursday, in the
//         first or the eighth hour of the day or of the night.
//      2) The Moon in its waning phase. (The book's own footnote: the
//         waning is the days between the full moon and the new moon.)
//      3) The Moon in a manzil belonging to Mars, or in an evil manzil.
//      4) Mars and the Moon in the sign of the enemy whose kahır is
//         sought — or one of them; both conjunct is the ideal.
//      5) If that is not possible soon, them being in a sign at a hard
//         angle to it, 90° or 180°.
//
//    "Görüldüğü gibi bütün bu faktörlerin aynı anda bir arada olmaları
//     imkansız gibi birşeydir… Hatta hepsinin aynı anda olması için 20
//     ile 50 yıl arasında bir zaman geçmesi bile gerekebilir. Bu
//     nedenle sadece ilk iki şartın sağlanabilmesi yeterlidir."
//
//    — all of them together is next to impossible; it could take twenty
//      to fifty years; therefore the first two conditions being met is
//      enough.
//
// Conditions 4 and 5 are reckoned from the sign of a named person. They
// are carried here as the book's own words, to be read, and they are
// not computed: this file takes no person and no birth sign, and the
// reckoning below never includes them. The book itself says the first
// two suffice, so nothing of its practice is lost by that.
//
// The percentage is a COUNT, not a weighting: of the conditions the
// book actually states and that can be reckoned from a calendar, how
// many are met at that moment. Nothing is weighed against anything
// else, because the book does not weigh them — it orders them, and the
// order is kept.
// ═══════════════════════════════════════════════════════════════

export const KAHIR_TIMING_SOURCE = { book: "Hâvâss'ın Derinlikleri I", pages: "107-108" };

/** The book's ordered conditions, as it gives them. */
export const KAHIR_CONDITIONS = [
  { n: 1, id: "day", computed: true,
    ml: "ചൊവ്വാഴ്ച, അല്ലെങ്കിൽ ബുധനെ വ്യാഴത്തോട് ചേർക്കുന്ന രാത്രി. പകലിന്റെയോ രാത്രിയുടെയോ ഒന്നാം അല്ലെങ്കിൽ എട്ടാം സാഅത്തിൽ.",
    en: "Tuesday, or the night joining Wednesday to Thursday; in the first or the eighth hour of the day or of the night." },
  { n: 2, id: "waning", computed: true,
    ml: "ചന്ദ്രൻ ക്ഷയിക്കുന്ന ഘട്ടത്തിലായിരിക്കുക. (കിതാബിന്റെ അടിക്കുറിപ്പ്: ചന്ദ്രന്റെ ക്ഷയം എന്നത് പൗർണ്ണമിക്കും അമാവാസിക്കും ഇടയിലുള്ള ദിവസങ്ങളാണ്.)",
    en: "The Moon in its waning phase. (The book's footnote: the waning is the days between the full moon and the new moon.)" },
  { n: 3, id: "manzil", computed: true,
    ml: "ചന്ദ്രൻ ചൊവ്വയുടെ ഒരു മൻസിലിൽ, അല്ലെങ്കിൽ ശർറുള്ള ഒരു മൻസിലിൽ.",
    en: "The Moon in a manzil belonging to Mars, or in an evil manzil." },
  { n: 4, id: "sign", computed: false,
    ml: "ചൊവ്വയും ചന്ദ്രനും ലക്ഷ്യമിടുന്ന ശത്രുവിന്റെ ബുർജിൽ നിൽക്കുക — അല്ലെങ്കിൽ അവയിൽ ഒന്ന് മാത്രം. രണ്ടും ചേർന്നുനിൽക്കുന്നതാണ് ഏറ്റവും ഉത്തമം.",
    en: "Mars and the Moon standing in the sign of the enemy whose kahır is sought — or only one of them. Both in conjunction is the ideal." },
  { n: 5, id: "aspect", computed: false,
    ml: "ചൊവ്വയും ചന്ദ്രനും ആ ബുർജിൽ വരിക അടുത്ത കാലത്ത് സാധ്യമല്ലെങ്കിൽ, ആ ബുർജിനോട് 90° അല്ലെങ്കിൽ 180° പോലുള്ള കഠിനകോണിലുള്ള ഒരു ബുർജിൽ നിൽക്കുക.",
    en: "If Mars and the Moon cannot be in that sign soon, their being in a sign at a hard angle to it, such as 90° or 180°." },
];

/** The book's own word on what to do when they cannot all be met. */
export const KAHIR_ENOUGH = {
  tr: "Bu nedenle sadece ilk iki şartın sağlanabilmesi yeterlidir.",
  ml: "ഈ നിബന്ധനകളെല്ലാം ഒരുമിച്ച് വരിക അസാധ്യമാണെന്ന് കിതാബ് തന്നെ പറയുന്നു — എല്ലാം ഒത്തുവരാൻ 20 മുതൽ 50 വർഷം വരെ വേണ്ടിവന്നേക്കാം. അതുകൊണ്ട് ആദ്യത്തെ രണ്ട് നിബന്ധന ഒത്തുവന്നാൽ മതി.",
  en: "The book itself says all of these falling together is next to impossible — it could take twenty to fifty years. Therefore the first two conditions being met is enough.",
};

export const KAHIR_EASIER = {
  ml: "കിതാബ്: ചന്ദ്രൻ ശർറുള്ള ഒരു മൻസിലിൽ നിൽക്കുന്ന സമയം നോക്കിയിരിക്കുന്നതാണ് എളുപ്പവും യുക്തവും. അതിനും വളരെ കാത്തിരിക്കേണ്ടി വരുമെങ്കിൽ, ദിവസമോ രാത്രിയോ നോക്കി ചന്ദ്രൻ ക്ഷയിക്കുന്ന നേരത്ത് ചെയ്താൽ മതി.",
  en: "The book: watching for the time the Moon stands in an evil manzil is the easier and more sensible course. And if even that would mean waiting very long, it is enough to keep to the day or the night and work while the Moon is waning.",
};

/** The two conditions the book says are enough on their own. */
export const KAHIR_SUFFICIENT = ["day", "waning"];

/**
 * Which conditions are met at one moment.
 *
 * `at` carries what the caller has already worked out for that moment:
 *   weekday     0 Sunday … 6 Saturday
 *   hourIndex   1-based hour of the day or of the night (1…12)
 *   isNight     whether that hour belongs to the night
 *   waning      the Moon between full and new
 *   manzilEvil  the manzil the Moon is in is an evil one, or Mars's
 *
 * Only the three the book states and a calendar can settle are counted.
 * The returned `of` is three, never five, so the reading never claims
 * to have weighed what it did not reckon.
 */
export function kahirFit(at = {}) {
  const { weekday, hourIndex, isNight, waning, manzilEvil } = at;
  // Tuesday, or the night that joins Wednesday to Thursday. The night
  // after sunset belongs to the next day, so that night is Thursday's
  // (weekday 4) — the Saat engine hands its night hours the weekday of
  // the day they lead into, and this follows it.
  const rightDay = weekday === 2 || (isNight && weekday === 4);
  const rightHour = hourIndex === 1 || hourIndex === 8;
  const met = {
    day: !!(rightDay && rightHour),
    waning: !!waning,
    manzil: !!manzilEvil,
  };
  const count = Object.values(met).filter(Boolean).length;
  return {
    met,
    count,
    of: 3,
    percent: Math.round((count / 3) * 100),
    enough: met.day && met.waning,   // the book's own floor
    rightDay, rightHour,
  };
}

/**
 * The same reading for a work the book gives a day and an hour for
 * (Kashf pp. 12-13). Here the book names the two outright, so the
 * reckoning is out of two, plus the Moon where the work is a nahs one
 * and the Hâvâss conditions above apply to it.
 */
export function workFit(work, at = {}) {
  if (!work) return null;
  const met = {
    day: at.weekday === work.day,
    hour: at.hourPlanet === work.hour,
  };
  const of_ = 2;
  const count = Object.values(met).filter(Boolean).length;
  return { met, count, of: of_, percent: Math.round((count / of_) * 100) };
}

// ═══════════════════════════════════════════════════════════════
// The other side: a GOOD work.
//
// Four conditions, each one the books state outright.
//
//   1-2) The day and the hour the book gives for that very work —
//        Kashf al-Haqa'iq pp. 12-13, the table of a work with its day
//        and its hour.
//     3) The Moon's manzil being one the book names as good for that
//        work — Kashf pp. 114-136, each manzil's own chapter.
//     4) The Moon clear of fall, detriment and combustion. Kashf p. 79
//        requires of an hour, in the book's own words:
//          "والساعة واليوم مسعودان لا مدخل فيهما من نحوس الشهر
//           والاحتراق والهبوط والوبال"
//        — the hour and the day both fortunate, with nothing of the
//        month's nahs, combustion, fall or detriment entering them.
//        The table those terms are read from is Kashf pp. 243-244.
//
// THE WAXING MOON IS NOT COUNTED HERE. The waning is stated, for a
// kahır working, at Hâvâss p. 107. That a waxing Moon is wanted for a
// good work is the natural converse, but a converse is not a sentence
// in the book, so it is not reckoned — it is reported, and marked as
// the converse, and left out of the count.
// ═══════════════════════════════════════════════════════════════

export const GOOD_TIMING_SOURCE = {
  dayHour: { book: "Kashf al-Haqa'iq", pages: "12-13" },
  manzil:  { book: "Kashf al-Haqa'iq", pages: "114-136" },
  moon:    { book: "Kashf al-Haqa'iq", pages: "79, 243-244" },
};

export const GOOD_CONDITIONS = [
  { n: 1, id: "day", computed: true, page: "12-13",
    ml: "കിതാബ് ആ കർമ്മത്തിന് പറയുന്ന ദിവസം.",
    en: "The day the book gives for that work." },
  { n: 2, id: "hour", computed: true, page: "12-13",
    ml: "കിതാബ് ആ കർമ്മത്തിന് പറയുന്ന സാഅത്ത്.",
    en: "The hour the book gives for that work." },
  { n: 3, id: "manzil", computed: true, page: "114-136",
    ml: "ചന്ദ്രൻ ആ കർമ്മത്തിന് കിതാബ് നല്ലതെന്ന് പറയുന്ന മൻസിലിൽ.",
    en: "The Moon in a manzil the book names as good for that work." },
  { n: 4, id: "moonClear", computed: true, page: "79",
    ml: "ചന്ദ്രൻ ഹുബൂത്വിലോ വബാലിലോ ഇഹ്തിറാഖിലോ അല്ലാതിരിക്കുക — \"സാഅത്തും ദിവസവും സഅ്ദായിരിക്കണം; മാസത്തിന്റെ നഹ്സോ ഇഹ്തിറാഖോ ഹുബൂത്വോ വബാലോ അതിൽ കടക്കരുത്.\"",
    en: "The Moon clear of fall, detriment and combustion — \"the hour and the day both fortunate, with nothing of the month's nahs, combustion, fall or detriment entering them.\"" },
];

export const GOOD_WAXING_NOTE = {
  ml: "ചന്ദ്രന്റെ വളർച്ച: കിതാബ് ക്ഷയത്തെക്കുറിച്ച് നഹ്സ് കർമ്മത്തിന്റെ കൂടെ പറയുന്നുണ്ട് (ഹവാസ്സ് പേ.107). നല്ല കർമ്മത്തിന് വളർച്ച വേണമെന്നത് അതിന്റെ മറുവശമാണ്, പക്ഷേ കിതാബിന്റെ ഒരു വാചകമല്ല. അതുകൊണ്ട് ഇത് അറിയിക്കുന്നു, എണ്ണത്തിൽ കൂട്ടുന്നില്ല.",
  en: "The waxing Moon: the book states the waning for a kahır working (Hâvâss p.107). That a good work wants a waxing Moon is its converse, but a converse is not a sentence of the book. So it is reported and not counted.",
};

/**
 * How far a moment answers to a good work.
 *
 * `at` carries what the caller worked out for that moment:
 *   weekday, hourPlanet, manzilGood (the manzil is among the ones the
 *   book names as good for this work), moonClear (the Moon is in none
 *   of fall, detriment or combustion), waxing (reported, not counted).
 *
 * A condition the caller could not settle is passed as null and drops
 * out of the count — the denominator falls with it, so the reading is
 * always "of what could be checked, how many were met", never a
 * percentage padded with unknowns.
 */
export function goodFit(work, at = {}) {
  const raw = {
    day: work ? at.weekday === work.day : null,
    hour: work ? at.hourPlanet === work.hour : null,
    manzil: at.manzilGood ?? null,
    moonClear: at.moonClear ?? null,
  };
  const met = {};
  let count = 0, of_ = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (v === null) continue;
    met[k] = v; of_ += 1; if (v) count += 1;
  }
  return {
    met, unknown: Object.keys(raw).filter((k) => raw[k] === null),
    count, of: of_,
    percent: of_ ? Math.round((count / of_) * 100) : null,
    waxing: at.waxing ?? null,          // reported only
    perfect: of_ > 0 && count === of_,
  };
}

/**
 * The ladder the books put the reader on when the best is out of reach.
 * Hâvâss pp. 107-108 sets it out for a kahır working and it is kept in
 * the book's own order; the same shape serves a good work, with the
 * conditions above in place of those.
 */
export const TIMING_LADDER = [
  { rung: 1, ml: "എല്ലാം ഒത്തുവരുന്നു — ദിവസം, സാഅത്ത്, ചന്ദ്രന്റെ മൻസിൽ, ചന്ദ്രന്റെ അവസ്ഥ. ഏറ്റവും ഉത്തമം.",
    en: "Everything meets — the day, the hour, the Moon's manzil and the Moon's state. The best there is." },
  { rung: 2, ml: "ദിവസവും സാഅത്തും ഒത്തുവരുന്നു, ചന്ദ്രൻ അനുകൂലമല്ല. കിതാബ് ഇത് മതിയാകുമെന്ന് പറയുന്നു.",
    en: "The day and the hour meet; the Moon is not favourable. The book says this will do." },
  { rung: 3, ml: "ദിവസം ഒത്തുവരുന്നു, സാഅത്ത് ഒത്തുവരുന്നില്ല. ആ ദിവസത്തിലെ ഏറ്റവും നല്ല നേരം നോക്കുക.",
    en: "The day meets but the hour does not. Take the best hour that day offers." },
  { rung: 4, ml: "ഒന്നും ഒത്തുവരുന്നില്ല. കാത്തിരിക്കാൻ പറ്റുമെങ്കിൽ കാത്തിരിക്കുക — കിതാബ് തന്നെ പറയുന്നു, എല്ലാം ഒത്തുവരാൻ വർഷങ്ങൾ വേണ്ടിവന്നേക്കാം, അതുകൊണ്ട് കാത്തിരിക്കാൻ പറ്റാത്ത കാര്യത്തിന് ഏറ്റവും അടുത്തുവരുന്നത് എടുക്കുക.",
    en: "Nothing meets. Wait if the matter can wait — the book itself says all of them together may take years, so for a matter that cannot wait, take the nearest thing to it." },
];

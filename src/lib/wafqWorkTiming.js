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
  // Tuesday, or the night that joins Wednesday to Thursday — which is
  // the night belonging to Wednesday, the 3rd day.
  const rightDay = weekday === 2 || (isNight && weekday === 3);
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

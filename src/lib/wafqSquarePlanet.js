// ═══════════════════════════════════════════════════════════════
// Which square belongs to which planet — and so to which day.
//
// This is the rule behind "every day has its own squares". A square
// of a given side is dedicated to a planet; that planet rules a day;
// and the work must be matched to the square, not only to the hour.
//
// Hâvâss'ın Derinlikleri I, pp. 172-173, is blunt about it. It says
// people take whatever example they find — nearly always a 4×4 — and
// use it for everything, and then complain that their work does not
// come about:
//
//   "üçlü vefk Satürn (Zuhal) vefkidir ve Satürn aşk ya da cinsellikle
//    ilgili değil, aksine bu konularda kısıtlayıcıdır."
//   — the 3×3 is Saturn's vefk, and Saturn has nothing to do with love;
//     in those matters he restricts.
//
//   "yapılacak işe göre vefk seçmeye de dikkat etmek gerekir."
//   — one must take care to choose the vefk according to the work.
//
// Kashf al-Haqa'iq p. 286 states the same principle among the
// foundations of the art: "علاقة الوفق بالكوكب الحاكم ووقته المناسب" —
// the relation of the vefk to its ruling planet and its fitting time.
//
// WHAT IS STATED AND WHAT IS NOT. On pp. 172-173 the book names four
// of the seven outright: the 3 is Saturn's, the 5 is Mars's (Kahhâr),
// the 6 is the Sun's (Salâm), the 9 is the Moon's (Musawwir). Those
// four carry `stated: true` and are quoted. The other three sit in the
// descending planetary series that those four fall in exactly — 3
// Saturn, 4 Jupiter, 5 Mars, 6 Sun, 7 Venus, 8 Mercury, 9 Moon — and
// are marked `stated: false`, because the series is not the same thing
// as the book's own sentence. The page says which is which; nothing is
// passed off as the book's word that is not.
// ═══════════════════════════════════════════════════════════════

export const SQUARE_PLANET_SOURCE = {
  havass: "172-173",
  kashf: "286",
};

/** 0 = Sunday … 6 = Saturday, as the rest of the page counts days. */
export const SQUARE_PLANET = {
  3: {
    planet: "zuhal", ar: "زحل", ml: "ശനി", en: "Saturn", day: 6, stated: true,
    note_ml: "കിതാബ്: \"മൂന്നിന്റെ കള്ളി ശനിയുടെ വഫ്ഖാണ്; ശനിക്ക് സ്നേഹവുമായോ ഇണചേരലുമായോ ബന്ധമില്ല — മറിച്ച് ആ കാര്യങ്ങളിൽ അവൻ തടയുന്നവനാണ്.\" അതുകൊണ്ട് സ്നേഹത്തിന് മൂന്നിന്റെ കള്ളി എടുക്കരുത്.",
    note_en: "The book: \"the 3×3 is Saturn's vefk, and Saturn has nothing to do with love or union — in those matters he restricts.\" So the 3 is not the square for love.",
  },
  4: {
    planet: "mushtari", ar: "المشتري", ml: "വ്യാഴം", en: "Jupiter", day: 4, stated: false,
    note_ml: "കിതാബ് നാലിന്റെ കള്ളിയുടെ ഗ്രഹം ഈ പേജുകളിൽ പേരെടുത്ത് പറയുന്നില്ല. പറഞ്ഞ നാലെണ്ണം നിൽക്കുന്ന ഗ്രഹക്രമത്തിൽ ഇത് വ്യാഴമാണ്. കിതാബിന്റെ പരാതി ഇതാണ്: \"നാലിന്റെ കള്ളി കൊണ്ട് ചെയ്യാത്ത കാര്യമില്ല\" — എല്ലാത്തിനും നാലിന്റെ കള്ളി എടുക്കുന്നത് തെറ്റാണ്.",
    note_en: "The book does not name the 4's planet on these pages. In the planetary series its four named squares fall in, this is Jupiter. The book's own complaint: \"there is nothing that is not done with a 4×4\" — using the 4 for everything is the error.",
  },
  5: {
    planet: "mirrikh", ar: "المريخ", ml: "ചൊവ്വ", en: "Mars", day: 2, stated: true,
    note_ml: "കിതാബ്: ഖഹ്ഹാർ (القهار) എന്ന സിഫത്ത് ചൊവ്വയുടേതാണ്, അതുകൊണ്ട് ആ സിഫത്ത് ഉപയോഗിക്കുന്ന കാര്യത്തിന്റെ വഫ്ഖ് അഞ്ചിന്റെ കള്ളിയായിരിക്കണം. കശ്ഫ് പേ.286: അഞ്ചിന്റെ കള്ളി സ്വാധീനത്തിന്റെയും (تأثير) സംരക്ഷണത്തിന്റെയും (تحصين) കർമ്മങ്ങൾക്ക്.",
    note_en: "The book: the attribute al-Qahhâr belongs to Mars, so a vefk for a work using that attribute must be a 5×5. Kashf p.286: the 5×5 is used for works of influence (ta'thir) and fortification (tahsin).",
  },
  6: {
    planet: "shams", ar: "الشمس", ml: "സൂര്യൻ", en: "Sun", day: 0, stated: true,
    note_ml: "കിതാബ്: സലാം (السلام) എന്ന സിഫത്ത് സൂര്യന്റേതാണ്, അത് ആറിന്റെ കള്ളിയിൽ ഉപയോഗിക്കണം.",
    note_en: "The book: the attribute as-Salâm belongs to the Sun, and must be used with a 6×6.",
  },
  7: {
    planet: "zuhra", ar: "الزهرة", ml: "ശുക്രൻ", en: "Venus", day: 5, stated: false,
    note_ml: "കിതാബ് ഏഴിന്റെ കള്ളിയുടെ ഗ്രഹം ഈ പേജുകളിൽ പേരെടുത്ത് പറയുന്നില്ല. പറഞ്ഞ നാലെണ്ണം നിൽക്കുന്ന ഗ്രഹക്രമത്തിൽ ഇത് ശുക്രനാണ്.",
    note_en: "The book does not name the 7's planet on these pages. In the series its four named squares fall in, this is Venus.",
  },
  8: {
    planet: "utarid", ar: "عطارد", ml: "ബുധൻ", en: "Mercury", day: 3, stated: false,
    note_ml: "കിതാബ് എട്ടിന്റെ കള്ളിയുടെ ഗ്രഹം ഈ പേജുകളിൽ പേരെടുത്ത് പറയുന്നില്ല. പറഞ്ഞ നാലെണ്ണം നിൽക്കുന്ന ഗ്രഹക്രമത്തിൽ ഇത് ബുധനാണ്.",
    note_en: "The book does not name the 8's planet on these pages. In the series its four named squares fall in, this is Mercury.",
  },
  9: {
    planet: "qamar", ar: "القمر", ml: "ചന്ദ്രൻ", en: "Moon", day: 1, stated: true,
    note_ml: "കിതാബ്: മുസ്വവ്വിർ (المصور) എന്ന സിഫത്ത് ചന്ദ്രന്റെ സ്വഭാവമുള്ളതാണ്, അതുകൊണ്ട് അതിന്റെ വഫ്ഖ് ഒമ്പതിന്റെ കള്ളിയായിരിക്കണം.",
    note_en: "The book: the attribute al-Musawwir is of the Moon's character, so its vefk must be a 9×9.",
  },
};

/** The book's own warning, for the page to print where the size is chosen. */
export const SQUARE_PLANET_RULE = {
  tr: "yapılacak işe göre vefk seçmeye de dikkat etmek gerekir.",
  ml: "ചെയ്യാനുള്ള കാര്യത്തിനനുസരിച്ച് കള്ളി തിരഞ്ഞെടുക്കാനും ശ്രദ്ധിക്കണം.",
  en: "One must take care to choose the vefk according to the work to be done.",
  page: "173",
};

export const SQUARE_PLANET_WARNING = {
  ml: "കിതാബ് പറയുന്നു: മിക്കവരും കയ്യിൽ കിട്ടിയ ഒരു ഉദാഹരണം — മിക്കവാറും നാലിന്റെ കള്ളി — എല്ലാ കാര്യത്തിനും എടുക്കുന്നു, എന്നിട്ട് \"ഞാൻ വഫ്ഖ് ഉണ്ടാക്കുന്നു, ഉണ്ടാക്കുന്നു, ഫലം കിട്ടുന്നില്ല\" എന്ന് പരാതി പറയുന്നു. സാഅത്ത് നോക്കാൻ ശ്രദ്ധിക്കുന്നവർ കള്ളിയുടെ ഗ്രഹം നോക്കാൻ ശ്രദ്ധിക്കാത്തത് വലിയ പൊരുത്തക്കേടാണ്.",
  en: "The book: most people take whatever example came to hand — nearly always a 4×4 — and use it for every work, then complain, \"I keep making vefks and nothing comes of it.\" To be careful about the planetary hour while ignoring the square's own planet is a great inconsistency.",
  page: "172-173",
};

/** Sizes dedicated to a given planet key (there is one each). */
export const sizeForPlanet = (planet) =>
  Object.keys(SQUARE_PLANET).map(Number).find((n) => SQUARE_PLANET[n].planet === planet) || null;

/** The size whose planet rules a given weekday. */
export const sizeForDay = (wd) =>
  Object.keys(SQUARE_PLANET).map(Number).find((n) => SQUARE_PLANET[n].day === wd) || null;

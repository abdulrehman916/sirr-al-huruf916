// ═══════════════════════════════════════════════════════════════
// What each manzil is good for, and what it is not —
// Kashf al-Haqa'iq, the twenty-eight manzil chapters (pp. 114-136).
//
// The book devotes a paragraph to every manzil, naming the works the
// Moon's standing there suits and the works it spoils. Those
// paragraphs are the widest purpose list the book gives: far more
// than the ten the hour tables grade. They are transcribed here in
// the book's own Arabic, and the works each paragraph names are
// listed as `good` and `avoid`.
//
// Nothing is inferred. A purpose appears under a manzil only where
// that manzil's paragraph names it, and `avoid` is only ever the
// book's own negation — "ولا تسافر", "وغير صالحة لـ".
// ═══════════════════════════════════════════════════════════════

export const PURPOSE_SOURCE = { book: "كشف الحقائق لمن جهل الطرائق", pages: "114-136" };

/**
 * Every work the twenty-eight chapters name. `harm` marks the ones
 * the book itself frames as breaking a person or a bond; they are
 * here because the book has them, and marked because of what they are.
 */
export const PURPOSES = {
  mahabba:    { ar: "المحبة والمودة",            ml: "സ്നേഹവും ഇണക്കവും",              en: "Love and affection" },
  atf:        { ar: "العطف وعطف القلوب",         ml: "ഹൃദയങ്ങൾ ചായ്ക്കൽ",               en: "Turning hearts" },
  tahyij:     { ar: "التهييج",                   ml: "ഇളക്കിവിടൽ",                      en: "Stirring up", harm: true },
  adawa:      { ar: "العداوة والبغضاء",          ml: "ശത്രുതയും വെറുപ്പും",              en: "Enmity and hatred", harm: true },
  qatia:      { ar: "القطيعة",                   ml: "ബന്ധം മുറിക്കൽ",                   en: "Cutting off", harm: true },
  tafriq:     { ar: "التفريق بين الاثنين",       ml: "രണ്ടുപേരെ പിരിക്കൽ",               en: "Separating two", harm: true },
  talaq:      { ar: "طلاق الرجل عن المرأة",      ml: "വിവാഹമോചനം",                      en: "Divorcing a man from a woman", harm: true },
  aqd_shahwa: { ar: "عقد الشهوة",                ml: "ശഹ്‌വത്ത് കെട്ടൽ",                 en: "Binding desire", harm: true },
  hall_aqd:   { ar: "حل العقد وإطلاق المأخوذ",   ml: "കെട്ട് അഴിക്കൽ, ബന്ധിക്കപ്പെട്ടവനെ വിടുവിക്കൽ", en: "Loosing a binding, releasing one who is bound" },
  sumum_hall: { ar: "حل السموم القاتلة",         ml: "മാരക വിഷം ഇറക്കൽ",                 en: "Dissolving deadly poisons" },
  sumum_aqd:  { ar: "عقد السموم القاتلة",        ml: "മാരക വിഷം കെട്ടൽ",                 en: "Binding deadly poisons", harm: true },
  talasim:    { ar: "عمل الطلسمات",              ml: "ത്വിലസ്മുകൾ ഉണ്ടാക്കൽ",             en: "Making talismans" },
  nayranjat:  { ar: "عمل النيرنجيات",            ml: "നീറഞ്ചാത്ത് ഉണ്ടാക്കൽ",             en: "Making nīranjāt" },
  daawat:     { ar: "دعوة الدعوات",              ml: "ദഅ്‌വത്ത് ചൊല്ലൽ",                  en: "Calling the da'wat" },
  ruhani:     { ar: "علاج الروحانيات ومعالجة الأرواح", ml: "റൂഹാനി ചികിത്സ — ജിന്ന്, ബാധ ഒഴിപ്പിക്കൽ", en: "Treating the spirits — jinn and possession" },
  sanaa:      { ar: "تدبير الصنعة",              ml: "കൈത്തൊഴിൽ നടത്തിപ്പ്",             en: "Managing a craft" },
  istiftah:   { ar: "استفتاح الأعمال",           ml: "കാര്യങ്ങൾ തുടങ്ങൽ",                en: "Opening works" },
  muluk:      { ar: "الدخول على الملوك والسعي في حوائجهم", ml: "അധികാരികളെ കാണൽ, ആവശ്യങ്ങൾക്ക് ചെല്ലൽ", en: "Entering upon rulers, seeking needs of them" },
  ikhwan:     { ar: "الاتصال بالإخوان والأشراف", ml: "സുഹൃത്തുക്കളുമായും മാന്യന്മാരുമായും ബന്ധം", en: "Joining with brethren and notables" },
  zawaj:      { ar: "الزواج والتزويج",           ml: "വിവാഹം",                           en: "Marriage" },
  raqiq:      { ar: "شراء الرقيق",               ml: "ജോലിക്കാരെ എടുക്കൽ",                en: "Taking servants" },
  dawabb:     { ar: "شراء الدواب",               ml: "മൃഗങ്ങളെ വാങ്ങൽ",                  en: "Buying beasts" },
  tijara:     { ar: "التجارة",                   ml: "കച്ചവടം",                          en: "Trade" },
  salaf:      { ar: "السلف",                     ml: "കടം കൊടുക്കലും വാങ്ങലും",           en: "Lending" },
  zar:        { ar: "الزرع والغرس",              ml: "കൃഷിയും നടീലും",                   en: "Sowing and planting" },
  hasad:      { ar: "الحصاد",                    ml: "കൊയ്ത്ത്",                         en: "Harvest" },
  iktiyal:    { ar: "اكتيال الغلة",              ml: "വിള അളക്കൽ",                       en: "Measuring the crop" },
  bina:       { ar: "البناء",                    ml: "കെട്ടിടം",                         en: "Building" },
  safar:      { ar: "السفر",                     ml: "യാത്ര",                            en: "Travel" },
  libas:      { ar: "لبس الجديد",                ml: "പുതുവസ്ത്രം ധരിക്കൽ",               en: "Wearing new clothes" },
  harb:       { ar: "تدبير الحرب ومخالطة الأعداء", ml: "യുദ്ധവും ശത്രുക്കളോട് ഇടപെടലും",  en: "War, and dealing with enemies" },
  ilaj:       { ar: "العلاج وشرب الأدوية",       ml: "ചികിത്സയും മരുന്നു കഴിക്കലും",      en: "Treatment, and taking medicine" },
  dua:        { ar: "الدعاء",                    ml: "ദുആ",                              en: "Supplication" },
  iktihal:    { ar: "الاكتحال",                  ml: "സുറുമ ഇടൽ",                        en: "Applying kohl" },
  dukhan:     { ar: "الدخن بالأدخنة",            ml: "പുകയിടൽ",                          en: "Fumigation" },
};

/** The works each manzil's own paragraph names, good and not good. */
export const MANZIL_PURPOSES = {
  1:  { good: ["tahyij", "zawaj", "dawabb", "zar", "bina"],
        avoid: ["libas", "muluk", "ikhwan", "tijara", "safar", "iktiyal", "talasim", "sanaa"] },
  2:  { good: ["nayranjat", "atf", "daawat", "muluk", "ikhwan", "sanaa"],
        avoid: ["zawaj", "dawabb", "tijara", "libas", "zar", "iktiyal"] },
  3:  { good: ["mahabba", "hall_aqd", "sumum_hall", "talasim", "daawat", "safar", "muluk",
               "ikhwan", "zawaj", "tijara", "bina", "zar", "hasad", "iktiyal", "libas"], avoid: [] },
  4:  { good: ["adawa"],
        avoid: ["muluk", "ikhwan", "sanaa", "talasim", "daawat", "ruhani", "zar", "iktiyal", "ilaj", "safar"] },
  5:  { good: ["nayranjat", "sumum_aqd", "talasim", "ruhani", "muluk", "ikhwan", "raqiq", "dawabb", "libas", "safar"],
        avoid: ["daawat", "sanaa", "zar", "bina", "zawaj"] },
  6:  { good: ["mahabba", "atf", "talasim", "sanaa", "daawat", "muluk", "ikhwan", "istiftah",
               "zawaj", "raqiq", "zar", "bina", "iktiyal", "safar"], avoid: [] },
  7:  { good: ["mahabba", "istiftah", "sanaa", "talasim", "muluk", "ikhwan", "zar", "hasad",
               "zawaj", "raqiq", "dawabb", "libas", "safar"], avoid: [] },
  8:  { good: ["nayranjat", "qatia", "adawa", "talasim", "daawat", "safar", "muluk", "ikhwan",
               "zar", "hasad", "iktihal"],
        avoid: ["sanaa", "ruhani", "libas", "iktiyal", "zawaj", "raqiq", "dawabb", "tijara"] },
  9:  { good: ["adawa", "qatia", "aqd_shahwa", "harb"],
        avoid: ["talasim", "libas", "muluk", "ikhwan", "zawaj", "raqiq", "dawabb", "zar", "hasad", "iktiyal", "safar"] },
  10: { good: ["hall_aqd", "sumum_hall", "nayranjat", "talasim", "sanaa", "muluk", "ikhwan",
               "zar", "hasad", "zawaj", "raqiq", "dawabb", "safar", "harb"],
        avoid: ["daawat", "ruhani", "iktiyal"] },
  11: { good: ["atf", "talasim", "muluk", "ikhwan", "zar", "hasad", "iktiyal", "zawaj",
               "raqiq", "dawabb", "libas", "safar", "harb", "istiftah"], avoid: [] },
  12: { good: ["adawa", "qatia", "tafriq", "dukhan", "talasim", "harb", "safar"],
        avoid: ["sanaa", "daawat", "ruhani", "zar", "iktiyal", "istiftah", "muluk", "ikhwan",
                "zawaj", "raqiq", "dawabb", "libas"] },
  13: { good: ["mahabba", "ikhwan", "talasim", "daawat", "ruhani", "zar", "hasad", "muluk",
               "libas", "zawaj", "raqiq", "dawabb", "safar"],
        avoid: ["iktiyal", "sanaa", "harb"] },
  14: { good: ["adawa", "qatia", "tafriq", "sumum_aqd"],
        avoid: ["talasim", "sanaa", "istiftah", "zar", "hasad", "bina", "iktiyal", "muluk",
                "ikhwan", "harb", "zawaj", "raqiq", "dawabb", "safar"] },
  15: { good: ["mahabba", "atf", "sumum_hall", "sanaa", "daawat", "ruhani", "safar", "zawaj",
               "raqiq", "dawabb", "zar", "hasad", "iktiyal", "libas", "istiftah"], avoid: [] },
  16: { good: ["aqd_shahwa", "hall_aqd", "sumum_hall", "talasim", "daawat", "zar", "hasad",
               "muluk", "ikhwan", "zawaj", "raqiq", "dawabb", "harb"],
        avoid: ["ruhani", "sanaa", "iktiyal", "safar", "libas"] },
  17: { good: ["adawa", "qatia", "tafriq", "sumum_aqd"],
        avoid: ["sanaa", "talasim", "daawat", "ruhani", "muluk", "ikhwan", "hasad", "iktiyal",
                "safar", "libas", "zawaj", "raqiq", "dawabb", "istiftah", "tijara", "harb"] },
  18: { good: ["mahabba", "sumum_hall", "sanaa", "talasim", "daawat", "ruhani", "iktiyal",
               "muluk", "ikhwan", "safar", "zar", "hasad", "istiftah", "zawaj", "raqiq",
               "dawabb", "libas"], avoid: [] },
  19: { good: ["aqd_shahwa", "sumum_hall", "talasim", "zar", "hasad"],
        avoid: ["sanaa", "daawat", "ruhani", "safar", "iktiyal", "muluk", "zawaj", "raqiq",
                "libas", "istiftah"] },
  20: { good: ["mahabba", "atf", "sumum_hall", "talasim", "sanaa", "daawat", "ruhani",
               "istiftah", "muluk", "ikhwan", "zar", "hasad", "zawaj", "raqiq", "dawabb",
               "bina", "harb", "libas"], avoid: [] },
  21: { good: ["qatia", "adawa", "tafriq", "sumum_aqd"],
        avoid: ["talasim", "sanaa", "daawat", "ruhani", "zar", "zawaj", "raqiq", "dawabb", "libas"] },
  22: { good: ["aqd_shahwa", "sumum_aqd", "talasim", "zar"],
        avoid: ["sanaa", "ruhani", "daawat", "muluk", "ikhwan", "iktiyal", "safar", "libas"] },
  23: { good: ["qatia", "adawa", "sumum_aqd", "aqd_shahwa", "hall_aqd", "talasim", "sanaa",
               "ruhani", "safar", "muluk", "ikhwan", "zar", "iktiyal", "libas"],
        avoid: ["daawat", "zawaj", "raqiq", "dawabb"] },
  24: { good: ["mahabba", "atf", "sumum_hall", "talasim", "sanaa", "istiftah", "daawat",
               "ruhani", "muluk", "ikhwan", "zar", "iktiyal", "libas", "safar", "raqiq", "dawabb"],
        avoid: [] },
  25: { good: ["adawa", "qatia", "tafriq", "sumum_aqd"],
        avoid: ["sanaa", "talasim", "daawat", "ruhani", "safar", "zar", "iktiyal", "ikhwan",
                "muluk", "libas", "zawaj", "raqiq", "dawabb"] },
  26: { good: ["mahabba", "atf", "sumum_hall", "istiftah", "talasim", "sanaa", "daawat",
               "ruhani", "iktiyal", "zar", "muluk", "ikhwan", "safar", "harb", "libas"], avoid: [] },
  27: { good: ["adawa", "qatia", "aqd_shahwa", "sumum_aqd", "talasim", "muluk", "ikhwan",
               "harb", "safar", "libas", "zar"],
        avoid: ["daawat", "zawaj", "raqiq", "dawabb", "iktiyal"] },
  28: { good: ["mahabba", "atf", "sanaa", "talaq", "zar", "hasad", "safar", "muluk", "istiftah",
               "tijara", "salaf", "ilaj", "dua", "zawaj", "talasim", "daawat", "ruhani",
               "iktiyal", "ikhwan", "raqiq", "dawabb", "libas"], avoid: [] },
};

/** Which manzils the book names for a purpose, and which it warns off. */
export function manzilsFor(purposeId) {
  const good = [], avoid = [];
  for (let n = 1; n <= 28; n++) {
    const p = MANZIL_PURPOSES[n];
    if (!p) continue;
    if (p.good.includes(purposeId)) good.push(n);
    if (p.avoid.includes(purposeId)) avoid.push(n);
  }
  return { good, avoid };
}

/**
 * Finds the purposes whose name, in any of the three languages,
 * contains what was typed. This is a plain text match against the
 * book's own vocabulary — it never guesses at a purpose the book
 * does not name.
 */
export function findPurposes(query) {
  const q = (query || "").trim().toLowerCase();
  if (q.length < 2) return [];
  return Object.entries(PURPOSES)
    .filter(([, p]) =>
      p.ar.includes(q) || p.ml.includes(q) || p.en.toLowerCase().includes(q))
    .map(([id, p]) => ({ id, ...p }));
}

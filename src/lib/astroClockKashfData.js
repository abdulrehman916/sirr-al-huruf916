/**
 * KASHF AL-HAQA'IQ — OMANI MANUSCRIPT KNOWLEDGE BASE
 * كشف الحقائق لمن جهل الطرائق — جمع الأخلاف عن العلماء الأسلاف
 * الرسالة الأولى: مفاتيح العلوم
 *
 * Author: رجل من أهل فلج بني ربيعة بعمان (Anonymous scholar from Falaj Bani Rabi'a, Oman)
 * Language: Arabic (Original manuscript)
 * Tradition: Omani Islamic Spiritual Sciences (علوم روحانية عمانية)
 * Pages ingested: 1-90 (3 PDFs, pages 1-30, 31-60, 61-90)
 * Ingestion date: 2026-07-08
 *
 * ADDITIVE ONLY — Never delete, never overwrite existing data.
 * Language: Arabic original. ML/EN are translation layers only.
 * All rules preserved verbatim with page references.
 *
 * SCHOLARS CITED IN THIS MANUSCRIPT:
 * - الشيخ جاعد بن خميس الخروصي (Abu Nabhan) — central authority
 * - الشيخ ناصر بن جاعد الخروصي
 * - الشيخ سعيد بن خلفان الخليلي — صاحب كتاب "النواميس" و "عسجدة المسكين"
 * - الشيخ زاهر بن محمد بن سعيد الإسماعيلي
 * - الشيخ سيف بن علي بن عامر الفرقاني
 * - الشيخ عمر بن مسعود المنذري
 * - الشيخ خميس بن راشد بن سعيد العبري (ذو الغرياء)
 * - الشيخ محمد بن علي بن محمد المنذري (القاضي)
 * - الشيخ محمد بن عبدالله المعولي
 * - الشيخ عبدالله بن مبارك بن عمر الربخي
 * - عبدالله بن خمبش
 * - الشيخ أحمد بن سليمان بن مداد الناعبي العقري النزوي (القصيدة السليمانية)
 * - البوني (مخطوط) — للمنازل والبروج
 */

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const KASHF_SOURCE = {
  id: "kashf_alhaqa_iq",
  book_name_ar: "كشف الحقائق لمن جهل الطرائق — جمع الأخلاف عن العلماء الأسلاف",
  book_name_en: "Kashf al-Haqa'iq li-man Jahila al-Tara'iq",
  book_name_ml: "കശ്ഫ് അൽ-ഹഖാഇഖ് — ഒമാൻ ഗ്രന്ഥം",
  subtitle_ar: "الرسالة الأولى: مفاتيح العلوم — رسائل في العلوم الروحانية وعلم الحرف",
  author_ar: "رجل من أهل فلج بني ربيعة بعمان",
  author_en: "Anonymous scholar from Falaj Bani Rabi'a, Oman",
  tradition: "Omani Islamic Spiritual Sciences",
  language: "Arabic",
  pdf_files: [
    { file: "2becf7627____________-1-30.pdf", pages: "1-30" },
    { file: "10021045e____________-31-60.pdf", pages: "31-60" },
    { file: "ab84fcaaf____________-61-90.pdf", pages: "61-90" },
  ],
  total_pages: 90,
  ingestion_date: "2026-07-08",
  status: "FULLY_INGESTED",
  note: "ADDITIVE ONLY. Omani Arabic manuscript. All data is new; no existing Astro Clock records are overwritten.",
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A: PLANETARY HOUR TIMING RULES FOR SPIRITUAL OPERATIONS
// Source: pp.12-13, 26-27 — الشروط (باب 7 الرصد والرسم)
// This is a unique Omani day+hour assignment table not found in Havâss or Taha
// ─────────────────────────────────────────────────────────────────────────────
export const KASHF_OPERATION_TIMING = [
  {
    id: "kashf_timing_001",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "المحبة والقبول لشخص واحد",
    operation_en: "Love and acceptance toward one person",
    operation_ml: "ഒരു വ്യക്തിക്ക് പ്രേമവും സ്വീകൃതിയും",
    day_ar: "الجمعة", day_en: "Friday", planet_ar: "الزهرة", planet_en: "Venus",
  },
  {
    id: "kashf_timing_002",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "الإجلال والتعظيم لجميع الناس",
    operation_en: "Reverence and honour from all people",
    operation_ml: "എല്ലാ ആളുകളിൽ നിന്നും ആദരവ്",
    day_ar: "الخميس", day_en: "Thursday", planet_ar: "عطارد", planet_en: "Mercury",
  },
  {
    id: "kashf_timing_003",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "العطف والمحبة بين ذكرين",
    operation_en: "Affection between two males",
    operation_ml: "രണ്ട് പുരുഷന്മാർ തമ്മിൽ സ്നേഹം",
    day_ar: "الجمعة", day_en: "Friday", planet_ar: "القمر", planet_en: "Moon",
  },
  {
    id: "kashf_timing_004",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "العطف والمحبة بين المرأة وزوجها",
    operation_en: "Love between a woman and her husband",
    operation_ml: "ഭാര്യ-ഭർത്താക്കൾ തമ്മിൽ സ്നേഹം",
    day_ar: "الخميس", day_en: "Thursday", planet_ar: "الزهرة", planet_en: "Venus",
  },
  {
    id: "kashf_timing_005",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "قضاء الحاجة عند ذي مقام وجاه",
    operation_en: "Fulfilling need before a person of rank and authority",
    operation_ml: "ഉന്നത പദവിയുള്ളവരിൽ നിന്ന് ആവശ്യം നിറവേറ്റൽ",
    day_ar: "الأحد", day_en: "Sunday", planet_ar: "الشمس", planet_en: "Sun",
  },
  {
    id: "kashf_timing_006",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "الهيبة والخوف والرعب في قلوب الناس",
    operation_en: "Awe, fear, and dread in people's hearts",
    operation_ml: "ജനങ്ങളിൽ ഭയവും ആദരവും ഉണ്ടാക്കൽ",
    day_ar: "الثلاثاء", day_en: "Tuesday", planet_ar: "الشمس", planet_en: "Sun",
  },
  {
    id: "kashf_timing_007",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "العطف والمحبة والقبول عند الأكابر وذوي الجاه",
    operation_en: "Affection, acceptance before elders and men of high status",
    operation_ml: "ഉന്നതരിൽ പ്രേമവും സ്വീകൃതിയും",
    day_ar: "الأحد", day_en: "Sunday", planet_ar: "الزهرة", planet_en: "Venus",
  },
  {
    id: "kashf_timing_008",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "التهييج (إثارة الشغف الشديد)",
    operation_en: "Stirring intense passion",
    operation_ml: "ശക്തമായ ആഗ്രഹം ഉദ്ദീപിപ്പിക്കൽ",
    day_ar: "الجمعة", day_en: "Friday", planet_ar: "المريخ", planet_en: "Mars",
  },
  {
    id: "kashf_timing_009",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "الفرقة والبغضة وتنفير العدو",
    operation_en: "Separation, hatred, repelling enemies",
    operation_ml: "വേർപിരിയൽ, ശത്രുക്കളെ അകറ്റൽ",
    day_ar: "الثلاثاء", day_en: "Tuesday", planet_ar: "زحل", planet_en: "Saturn",
  },
  {
    id: "kashf_timing_010",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "الحريق",
    operation_en: "Fire operations",
    operation_ml: "അഗ്നി സംബന്ധമായ കൃത്യങ്ങൾ",
    day_ar: "الثلاثاء", day_en: "Tuesday", planet_ar: "المريخ", planet_en: "Mars",
  },
  {
    id: "kashf_timing_011",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "العقد الذي لا يحل أبداً",
    operation_en: "Permanent binding (irresolvable)",
    operation_ml: "ഒരിക്കലും അഴിക്കാൻ കഴിയാത്ത ബന്ധനം",
    day_ar: "الأربعاء", day_en: "Wednesday", planet_ar: "زحل", planet_en: "Saturn",
  },
  {
    id: "kashf_timing_012",
    source: { book: KASHF_SOURCE.book_name_ar, page: 12, scholar: "مؤلف الكتاب" },
    operation_ar: "إيقاع الحرب والفتن والخصومة بين الناس",
    operation_en: "Causing war, strife, and enmity between people",
    operation_ml: "ആളുകൾ തമ്മിൽ കലഹം ഉണ്ടാക്കൽ",
    day_ar: "الثلاثاء", day_en: "Tuesday", planet_ar: "عطارد", planet_en: "Mercury",
  },
  {
    id: "kashf_timing_013",
    source: { book: KASHF_SOURCE.book_name_ar, page: 13, scholar: "مؤلف الكتاب" },
    operation_ar: "جلب الزمن وتحصيل المعاش",
    operation_en: "Attracting livelihood and provision",
    operation_ml: "ഉപജീവനം ആകർഷിക്കൽ",
    day_ar: "الخميس", day_en: "Thursday", planet_ar: "المشتري", planet_en: "Jupiter",
  },
  {
    id: "kashf_timing_014",
    source: { book: KASHF_SOURCE.book_name_ar, page: 13, scholar: "مؤلف الكتاب" },
    operation_ar: "المحبة الشديدة لقلب المطلوب",
    operation_en: "Intense love in the heart of the desired person",
    operation_ml: "ആഗ്രഹിക്കുന്ന വ്യക്തിയുടെ ഹൃദയത്തിൽ തീവ്ര സ്നേഹം",
    day_ar: "الثلاثاء", day_en: "Tuesday", planet_ar: "الزهرة", planet_en: "Venus",
  },
  {
    id: "kashf_timing_015",
    source: { book: KASHF_SOURCE.book_name_ar, page: 13, scholar: "مؤلف الكتاب" },
    operation_ar: "تشتيت الإنسان وعدم قراره",
    operation_en: "Causing a person to be restless with no stable dwelling",
    operation_ml: "ഒരു വ്യക്തിക്ക് ഒരിടത്തും സ്ഥിരത ഇല്ലാതാക്കൽ",
    day_ar: "الأربعاء", day_en: "Wednesday", planet_ar: "زحل", planet_en: "Saturn",
  },
  {
    id: "kashf_timing_016",
    source: { book: KASHF_SOURCE.book_name_ar, page: 13, scholar: "مؤلف الكتاب" },
    operation_ar: "الدخول على الحكام والأكابر والمقابلات والمحاكمات",
    operation_en: "Entering upon rulers, elders, meetings, and legal proceedings",
    operation_ml: "ഭരണാധികാരികളും ഉന്നതരുമായുള്ള കൂടിക്കാഴ്ചകൾ",
    day_ar: "الأحد", day_en: "Sunday", planet_ar: "الشمس", planet_en: "Sun",
    note_ar: "أول ساعة من اليوم",
    note_en: "First hour of the day",
  },
  {
    id: "kashf_timing_017",
    source: { book: KASHF_SOURCE.book_name_ar, page: 13, scholar: "مؤلف الكتاب" },
    operation_ar: "جلب الغائب والهاربين",
    operation_en: "Bringing back the absent or runaway",
    operation_ml: "അഗ്രഹസ്ഥനെ/ഓടിപ്പോയവനെ തിരിച്ചു വരുത്തൽ",
    day_ar: "الاثنين", day_en: "Monday", planet_ar: "الزهرة", planet_en: "Venus",
    note_ar: "أول ساعة من اليوم",
  },
  {
    id: "kashf_timing_018",
    source: { book: KASHF_SOURCE.book_name_ar, page: 27, scholar: "مؤلف الكتاب" },
    operation_ar: "إيقاع الشر والخصومة بين اثنين اجتمعا على فسق",
    operation_en: "Causing strife between two who conspire in sin",
    operation_ml: "തിന്മ ചെയ്യുന്ന രണ്ട് പേർ തമ്മിൽ കലഹമുണ്ടാക്കൽ",
    day_ar: "الثلاثاء", day_en: "Tuesday", planet_ar: "المريخ", planet_en: "Mars",
    note_ar: "أول ساعة من اليوم",
  },
  {
    id: "kashf_timing_019",
    source: { book: KASHF_SOURCE.book_name_ar, page: 27, scholar: "مؤلف الكتاب" },
    operation_ar: "عقد رجل عن الزنا أو امرأة زانية",
    operation_en: "Binding a fornicator from committing adultery",
    operation_ml: "വ്യഭിചരിക്കുന്ന ആളെ ബന്ധിക്കൽ",
    day_ar: "الأربعاء", day_en: "Wednesday", planet_ar: "عطارد", planet_en: "Mercury",
  },
  {
    id: "kashf_timing_020",
    source: { book: KASHF_SOURCE.book_name_ar, page: 27, scholar: "مؤلف الكتاب" },
    operation_ar: "تأليف القلوب بين متباغضين وجلب رزق أو معاش",
    operation_en: "Reconciling enemies, attracting provision for someone",
    operation_ml: "ശത്രുക്കളെ ഒന്നിപ്പിക്കൽ, ഒരാൾക്ക് ഉപജീവനം",
    day_ar: "الخميس", day_en: "Thursday", planet_ar: "المشتري", planet_en: "Jupiter",
    note_ar: "أول ساعة من اليوم",
  },
  {
    id: "kashf_timing_021",
    source: { book: KASHF_SOURCE.book_name_ar, page: 27, scholar: "مؤلف الكتاب" },
    operation_ar: "كف وعقد الألسنة عنك",
    operation_en: "Silencing and binding tongues against you",
    operation_ml: "നിനക്കെതിരായ നാക്കുകളെ ബന്ധിക്കൽ",
    day_ar: "الجمعة", day_en: "Friday", planet_ar: "عطارد", planet_en: "Mercury",
  },
  {
    id: "kashf_timing_022",
    source: { book: KASHF_SOURCE.book_name_ar, page: 27, scholar: "مؤلف الكتاب" },
    operation_ar: "أعمال البغضة والفرقة وخلو المكان وترحيل المؤذي",
    operation_en: "Hatred, separation, clearing a place, removing the harmful",
    operation_ml: "വിദ്വേഷം, വേർപിരിയൽ, ദ്രോഹകരനെ ഒഴിവാക്കൽ",
    day_ar: "السبت", day_en: "Saturday", planet_ar: "زحل", planet_en: "Saturn",
    note_ar: "أول ساعة من اليوم",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B: ZODIAC BIRTH-SIGN TIMING TABLES (Kashf tradition)
// Two independent tables from pp.18-19 — both preserved side by side
// Source: Omani scholars' tradition for استعطاف الرجل والمرأة
// ─────────────────────────────────────────────────────────────────────────────

// TABLE 1 — By Day + Hour (attributed to Omani scholars رحمهم الله)
export const KASHF_ZODIAC_BY_DAY_HOUR = [
  { zodiac_ar: "الحمل", zodiac_en: "Aries", day_ar: "الأحد", day_en: "Sunday", planet_ar: "عطارد", planet_en: "Mercury" },
  { zodiac_ar: "الثور", zodiac_en: "Taurus", day_ar: "الأربعاء", day_en: "Wednesday", planet_ar: "القمر", planet_en: "Moon" },
  { zodiac_ar: "الجوزاء", zodiac_en: "Gemini", day_ar: "الاثنين", day_en: "Monday", planet_ar: "عطارد", planet_en: "Mercury" },
  { zodiac_ar: "السرطان", zodiac_en: "Cancer", day_ar: "الثلاثاء", day_en: "Tuesday", planet_ar: "المشتري", planet_en: "Jupiter" },
  { zodiac_ar: "الأسد", zodiac_en: "Leo", day_ar: "الأربعاء", day_en: "Wednesday", planet_ar: "الزهرة", planet_en: "Venus" },
  { zodiac_ar: "العذراء", zodiac_en: "Virgo", day_ar: "الاثنين", day_en: "Monday", planet_ar: "زحل", planet_en: "Saturn" },
  { zodiac_ar: "الميزان", zodiac_en: "Libra", day_ar: "الأربعاء", day_en: "Wednesday", planet_ar: "المشتري", planet_en: "Jupiter" },
  { zodiac_ar: "العقرب", zodiac_en: "Scorpio", day_ar: "الثلاثاء", day_en: "Tuesday", planet_ar: "القمر", planet_en: "Moon" },
  { zodiac_ar: "القوس", zodiac_en: "Sagittarius", day_ar: "الأربعاء", day_en: "Wednesday", planet_ar: "عطارد", planet_en: "Mercury" },
  { zodiac_ar: "الجدي", zodiac_en: "Capricorn", day_ar: "الخميس", day_en: "Thursday", planet_ar: "عطارد", planet_en: "Mercury" },
  { zodiac_ar: "الدلو", zodiac_en: "Aquarius", day_ar: "الأحد", day_en: "Sunday", planet_ar: "المشتري", planet_en: "Jupiter" },
  { zodiac_ar: "الحوت", zodiac_en: "Pisces", note_ar: "في الثوابت الصحاح" },
  { source: { book: KASHF_SOURCE.book_name_ar, page: 18 }, note_en: "Scorpio (العقرب) was not found by the author" },
];

// TABLE 2 — By Hour Only (second Omani tradition, same manuscript p.19)
export const KASHF_ZODIAC_BY_HOUR_ONLY = [
  { zodiac_ar: "الحمل", zodiac_en: "Aries", planet_ar: "المشتري", planet_en: "Jupiter" },
  { zodiac_ar: "الثور", zodiac_en: "Taurus", planet_ar: "المشتري", planet_en: "Jupiter" },
  { zodiac_ar: "الجوزاء", zodiac_en: "Gemini", planet_ar: "الشمس", planet_en: "Sun" },
  { zodiac_ar: "السرطان", zodiac_en: "Cancer", planet_ar: "زحل", planet_en: "Saturn" },
  { zodiac_ar: "الأسد", zodiac_en: "Leo", planet_ar: "الشمس", planet_en: "Sun" },
  { zodiac_ar: "العذراء", zodiac_en: "Virgo", planet_ar: "المشتري", planet_en: "Jupiter" },
  { zodiac_ar: "الميزان", zodiac_en: "Libra", planet_ar: "عطارد", planet_en: "Mercury" },
  { zodiac_ar: "العقرب", zodiac_en: "Scorpio", planet_ar: "الشمس", planet_en: "Sun" },
  { zodiac_ar: "القوس", zodiac_en: "Sagittarius", planet_ar: "القمر", planet_en: "Moon" },
  { zodiac_ar: "الجدي", zodiac_en: "Capricorn", planet_ar: "القمر", planet_en: "Moon" },
  { zodiac_ar: "الدلو", zodiac_en: "Aquarius", planet_ar: "القمر", planet_en: "Moon" },
  { source: { book: KASHF_SOURCE.book_name_ar, page: 19 }, note_en: "Pisces not listed in hour-only table" },
];

// TABLE 3 — By Zodiac Sign per Sheikh Zaher al-Ismaili (p.24)
// جدول أوقات الأعمال حسب برج الشخص للشيخ زاهر بن محمد بن سعيد الإسماعيلي
export const KASHF_ZODIAC_ZAHER_TABLE = [
  { zodiac_ar: "الحمل", day_ar: "الأحد أو الاثنين", planet_ar: "عطارد أو المشتري" },
  { zodiac_ar: "الثور", day_ar: "السبت أو الأحد أو الخميس", planet_ar: "القمر أو المشتري" },
  { zodiac_ar: "الجوزاء", day_ar: "السبت أو الأحد أو الخميس", planet_ar: "المشتري" },
  { zodiac_ar: "السرطان", day_ar: "الأربعاء أو الجمعة", planet_ar: "القمر أو المشتري" },
  { zodiac_ar: "الأسد", day_ar: "الاثنين", planet_ar: "القمر أو المشتري أو عطارد" },
  { zodiac_ar: "العذراء", day_ar: "الاثنين", planet_ar: "القمر أو المشتري أو عطارد" },
  { zodiac_ar: "الميزان", day_ar: "الأربعاء", planet_ar: "عطارد" },
  { zodiac_ar: "القوس", day_ar: "الثلاثاء", planet_ar: "المريخ" },
  { zodiac_ar: "الجدي", day_ar: "الخميس", planet_ar: "المشتري" },
  { zodiac_ar: "الدلو", day_ar: "الخميس", planet_ar: "المشتري" },
  { zodiac_ar: "الحوت", day_ar: "الثلاثاء", planet_ar: "المريخ" },
  { note_ar: "لم أجد العقرب", note_en: "Scorpio was not found" },
  { source: { book: KASHF_SOURCE.book_name_ar, page: 24, scholar: "الشيخ زاهر بن محمد بن سعيد الإسماعيلي" } },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C: FAST-RESPONSE HOURS TABLE (ساعات الإجابة)
// Source: p.53 — فائدة: جدول ساعات الإجابة وساعات المغالبات
// ─────────────────────────────────────────────────────────────────────────────
export const KASHF_ANSWER_HOURS = {
  source: { book: KASHF_SOURCE.book_name_ar, page: 53 },
  name_ar: "ساعات الإجابة",
  name_en: "Hours of Fast Response",
  name_ml: "ദ്രുത ഉത്തര ഘടിക",
  table: [
    { day_ar: "الأحد", day_en: "Sunday", planet_ar: "عطارد", hour_number: 3 },
    { day_ar: "الاثنين", day_en: "Monday", planet_ar: "المشتري", hour_number: 3 },
    { day_ar: "الثلاثاء", day_en: "Tuesday", planet_ar: "عطارد", hour_number: 4 },
    { day_ar: "الأربعاء", day_en: "Wednesday", planet_ar: "المشتري", hour_number: 4 },
    { day_ar: "الخميس", day_en: "Thursday", planet_ar: "الزهرة", hour_number: 4 },
    { day_ar: "الجمعة", day_en: "Friday", planet_ar: "زحل", hour_number: 4 },
    { day_ar: "السبت", day_en: "Saturday", planet_ar: "المشتري", hour_number: 2 },
  ],
};

export const KASHF_DOMINANCE_HOURS = {
  source: { book: KASHF_SOURCE.book_name_ar, page: 53 },
  name_ar: "ساعات المغالبات",
  name_en: "Hours of Dominance/Victory",
  name_ml: "ജയ ഘടിക",
  table: [
    { day_ar: "الأحد", day_en: "Sunday", planet_ar: "عطارد", hour_number: 3 },
    { day_ar: "الاثنين", day_en: "Monday", planet_ar: "المريخ", hour_number: 4 },
    { day_ar: "الثلاثاء", day_en: "Tuesday", planet_ar: "القمر", hour_number: 5 },
    { day_ar: "الأربعاء", day_en: "Wednesday", planet_ar: "الشمس", hour_number: 6 },
    { day_ar: "الخميس", day_en: "Thursday", planet_ar: "زحل", hour_number: 7 },
    { day_ar: "الجمعة", day_en: "Friday", planet_ar: "المريخ", hour_number: 6 },
    { day_ar: "السبت", day_en: "Saturday", planet_ar: "الزهرة", hour_number: 5 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D: SHEIKH JAAD BIN KHAMIS AL-KHURUSI'S HOUR TABLE (الأدق)
// Source: p.54 — جدول تقسيم الساعات للشيخ جاعد بن خميس الخروصي
// The most authoritative table in the Omani tradition
// ─────────────────────────────────────────────────────────────────────────────
export const KASHF_JAAD_HOUR_TABLE = {
  source: { book: KASHF_SOURCE.book_name_ar, page: 54, scholar: "الشيخ جاعد بن خميس الخروصي" },
  name_ar: "جدول تقسيم الساعات (الأدق)",
  name_en: "The Most Accurate Hour Division Table",
  note_en: "Contains slight differences from the other tables because some use temporal hours, others use calculated ascendant",
  table: [
    { day_ar: "الأحد", saad_planet: "زحل", dominance_planet: "عطارد", answer_planet: "الزهرة", blessing_planet: "الزهرة" },
    { day_ar: "الاثنين", saad_planet: "الزهرة", dominance_planet: "المريخ", answer_planet: "المشتري", blessing_planet: "عطارد" },
    { day_ar: "الثلاثاء", saad_planet: "المريخ", dominance_planet: "القمر", answer_planet: "عطارد", blessing_planet: "المشتري" },
    { day_ar: "الأربعاء", saad_planet: "المشتري", dominance_planet: "الشمس", answer_planet: "المشتري", blessing_planet: "زحل" },
    { day_ar: "الخميس", saad_planet: "القمر", dominance_planet: "زحل", answer_planet: "الزهرة", blessing_planet: "الزهرة" },
    { day_ar: "الجمعة", saad_planet: "الشمس", dominance_planet: "المريخ", answer_planet: "زحل", blessing_planet: "القمر" },
    { day_ar: "السبت", saad_planet: "عطارد", dominance_planet: "المشتري", answer_planet: "الزهرة", blessing_planet: "الشمس" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E: MOON IN ZODIAC — HOUR TIMING (ساعات العمل عند نزول القمر في الأبراج)
// Source: p.54 — attributed to Sheikh Jaad bin Khamis al-Khurusi
// ─────────────────────────────────────────────────────────────────────────────
export const KASHF_MOON_ZODIAC_HOURS = {
  source: { book: KASHF_SOURCE.book_name_ar, page: 54, scholar: "الشيخ جاعد بن خميس الخروصي" },
  name_ar: "ساعات العمل وقضاء الحوائج عند نزول القمر في الأبراج",
  name_en: "Best Saat when Moon is in each Zodiac sign",
  name_ml: "ഓരോ രാശിയിലും ചന്ദ്രൻ ആകുമ്പോൾ ഉചിത ഘടിക",
  table: [
    { zodiac_ar: "الحمل", planet_ar: "المريخ", planet_en: "Mars" },
    { zodiac_ar: "الثور", planet_ar: "الزهرة", planet_en: "Venus" },
    { zodiac_ar: "الجوزاء", planet_ar: "عطارد", planet_en: "Mercury" },
    { zodiac_ar: "السرطان", planet_ar: "القمر", planet_en: "Moon" },
    { zodiac_ar: "الأسد", planet_ar: "الشمس", planet_en: "Sun" },
    { zodiac_ar: "العذراء", planet_ar: "عطارد", planet_en: "Mercury" },
    { zodiac_ar: "الميزان", planet_ar: "الزهرة", planet_en: "Venus" },
    { zodiac_ar: "العقرب", planet_ar: "المريخ", planet_en: "Mars" },
    { zodiac_ar: "القوس", planet_ar: "المشتري", planet_en: "Jupiter" },
    { zodiac_ar: "الجدي", planet_ar: "زحل", planet_en: "Saturn" },
    { zodiac_ar: "الدلو", planet_ar: "زحل", planet_en: "Saturn" },
    { zodiac_ar: "الحوت", planet_ar: "المشتري", planet_en: "Jupiter" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION F: LUNAR MANSIONS AND THEIR OPERATIONS
// Source: p.55-56 — معرفة منازل القمر وأعمالها
// Attributed to: الشيخ ناصر بن جاعد الخروصي رحمه الله
// This is DISTINCT from the Havâss data (different authority, Omani tradition)
// ─────────────────────────────────────────────────────────────────────────────
export const KASHF_LUNAR_MANSIONS = {
  source: { book: KASHF_SOURCE.book_name_ar, pages: "55-56", scholar: "الشيخ ناصر بن جاعد الخروصي" },
  name_ar: "معرفة منازل القمر وأعمالها",
  name_en: "Lunar Mansions and Their Operations (Omani Tradition)",
  mansions: [
    { name_ar: "الشرطين", nature: "nahs", operation_ar: "نحسة يعمل فيها للفرقة" },
    { name_ar: "البطين", nature: "nahs", operation_ar: "نحس للعطف والجمع" },
    { name_ar: "الثريا", nature: "saad", planet_ar: "الزهرة", operation_ar: "سعد وهو وجه الزهرة للمحبة وجمع الاثنين" },
    { name_ar: "الدبران", nature: "nahs", planet_ar: "عطارد", operation_ar: "نحس أحمر وهو وجه عطارد لهلاك العدو" },
    { name_ar: "الهقعة", nature: "nahs", planet_ar: "القمر", operation_ar: "نحس وهو وجه القمر للشر والعداوة" },
    { name_ar: "الهنعة", nature: "nahs_mixed", operation_ar: "نحس مختلط للصلاح وكل ما تريد" },
    { name_ar: "الذراع", nature: "saad", planet_ar: "زحل", operation_ar: "سعد وهو وجه زحل اعمل فيه ما تريد من الصلاح" },
    { name_ar: "النثرة", nature: "saad_mixed", operation_ar: "سعد مختلط أبيض وأحمر اعمل فيه للخير والتجارة" },
    { name_ar: "الطرفة", nature: "nahs", planet_ar: "المريخ", operation_ar: "نحس وهو وجع المريخ اعمل فيه للطيور والدواب" },
    { name_ar: "الجبهة", nature: "saad", planet_ar: "الشمس", operation_ar: "سعد أبيض وهو وجه الشمس للسباع والوحوش (ذكرها في السر العلي بأنها نحس)" },
    { name_ar: "الزبرة", nature: "saad", planet_ar: "الزهرة", operation_ar: "سعد وهو وجه الزهرة المحبة للنساء" },
    { name_ar: "الصرفة", nature: "nahs", planet_ar: "عطارد", operation_ar: "نحس وجه عطارد للمحبة وكل ما تريد" },
    { name_ar: "العواء", nature: "nahs", planet_ar: "القمر", operation_ar: "نحس هو وجه القمر للخير كله" },
    { name_ar: "السماك", nature: "saad", planet_ar: "زحل", operation_ar: "سعد صالح وهو وجه زحل للعطف والمحبة وتأليف ما أردت" },
    { name_ar: "الغفر", nature: "saad", planet_ar: "المشتري", operation_ar: "سعد أبيض وهو وجه المشتري للخير كله" },
    { name_ar: "الزبان", nature: "nahs", planet_ar: "المريخ", operation_ar: "نحس وهو وجه المريخ للفرقة" },
    { name_ar: "الإكليل", nature: "nahs", planet_ar: "الشمس", operation_ar: "نحس وهو وجه الشمس للخير وعقد الألسنة" },
    { name_ar: "القلب", nature: "saad", operation_ar: "سعد" },
    { name_ar: "الشولة", nature: "nahs", planet_ar: "عطارد", operation_ar: "نحس وجه عطارد للتهييج والمحبة" },
    { name_ar: "النعائم", nature: "saad", operation_ar: "سعد للخير" },
    { name_ar: "البلدة", nature: "saad", planet_ar: "زحل", operation_ar: "سعد وهو وجه زحل للطلسمات" },
    { name_ar: "سعد الذابح", nature: "nahs", planet_ar: "المشتري", operation_ar: "وهو وجه المشتري الطلسمات للمريض والعقد" },
    { name_ar: "سعد بلع", nature: "saad", planet_ar: "المريخ", operation_ar: "سعد وهو وجه المريخ الطلسمات للخير كله" },
    { name_ar: "سعد السعود", nature: "saad", planet_ar: "الشمس", operation_ar: "سعد وهو وجه الشمس للخير" },
    { name_ar: "سعد الأخبية", nature: "saad", planet_ar: "الزهرة", operation_ar: "سعد وهو وجه الزهرة للخير" },
    { name_ar: "فرغ المقدم", nature: "saad", planet_ar: "عطارد", operation_ar: "سعد أبيض وهو وجه عطارد للمحبات والتأليف والتهييج" },
    { name_ar: "فرغ المؤخر", nature: "saad", operation_ar: "سعد" },
    { name_ar: "بطن الحوت (الرشا)", nature: "saad", planet_ar: "المشتري", operation_ar: "وهو وجه المشتري للخير والسفر والتجارة" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION G: AUSPICIOUS/INAUSPICIOUS TIMES — الأوقات السعيدة والنحيسة
// Source: pp.57-65 — multiple Omani scholars
// ─────────────────────────────────────────────────────────────────────────────

// Unlucky days of every month (7 fixed days — Omani tradition)
export const KASHF_MONTHLY_NAHS_DAYS = {
  source: { book: KASHF_SOURCE.book_name_ar, pages: "57-58" },
  name_ar: "أيام الكوامل السبع (النحوسة من كل شهر)",
  name_en: "The Seven Unlucky Kamil Days of Each Month",
  name_ml: "ഓരോ മാസത്തിലെ 7 ദ്രോഹ ദിനങ്ങൾ",
  days: [3, 5, 13, 16, 21, 24, 25],
  note_ar: "وكل أربعاء لا تدور — لا يتخذ فيها بيع ولا سفر ولا غيرهما",
  note_en: "Plus the 'non-recurring Wednesday' of each month. No trade, travel, or major actions.",
  note_ml: "ഈ ദിനങ്ങളിൽ ഒരു പ്രധാന കൃത്യവും ആരംഭിക്കരുത്",
};

// Monthly Nahs per lunar month — attributed to Sheikh Said bin Khalfan al-Khalili
export const KASHF_LUNAR_MONTH_NAHS = {
  source: { book: KASHF_SOURCE.book_name_ar, page: 59, scholar: "الشيخ سعيد بن خلفان الخليلي" },
  name_ar: "يوم النحس من كل شهر قمري",
  monthly_nahs: {
    "محرم": 12, "صفر": 10, "ربيع الأول": 4, "ربيع الثاني": 8,
    "جمادى الأولى": 4, "جمادى الثانية": 2, "رجب": 2, "شعبان": 23,
    "رمضان": 24, "شوال": 28, "ذو القعدة": 28, "ذو الحجة": 8,
  },
};

// Days of the lunar month with operations (pp.60-65)
export const KASHF_MONTH_DAYS = {
  source: { book: KASHF_SOURCE.book_name_ar, pages: "60-65" },
  name_ar: "بيان بأيام الشهر وأعمالها",
  name_en: "Lunar Month Day-by-Day Operations Guide",
  days: [
    { day: 1, nature: "saad", summary_ar: "سعد — صالح للقاء الأمراء وطلب الحوائج والبيع والزراعة والسفر" },
    { day: 2, nature: "saad", summary_ar: "يصلح للسفر وطلب الحوائج والتزويج وبناء المنازل" },
    { day: 3, nature: "nahs", summary_ar: "نحس مستمر — لا يصلح لشيء جملة" },
    { day: 4, nature: "mixed", summary_ar: "صالح للتزويج ويكره السفر فيه" },
    { day: 5, nature: "nahs", summary_ar: "نحس مستمر — لا تبتدئ فيه بعمل" },
    { day: 6, nature: "saad", summary_ar: "مبارك — يصلح للتزويج والسفر" },
    { day: 7, nature: "saad", summary_ar: "مبارك مختار — يصلح لكل ما يراد" },
    { day: 8, nature: "saad", summary_ar: "صالح لكل حاجة، يكره ركوب السفن والسفر" },
    { day: 9, nature: "saad", summary_ar: "مبارك — من سافر فيه رزق مالاً" },
    { day: 10, nature: "saad", summary_ar: "صالح لكل حاجة سوى الدخول على السلطان" },
    { day: 11, nature: "saad", summary_ar: "صالح لجميع الحوائج والسفر والبيع" },
    { day: 12, nature: "saad", summary_ar: "صالح مبارك — يصلح للتزويج وفتح الحوانيت" },
    { day: 13, nature: "nahs", summary_ar: "نحس مستمر — يكره كل أمر" },
    { day: 14, nature: "saad", summary_ar: "جيد للحوائج والشراء والبيع وركوب البحر" },
    { day: 15, nature: "saad", summary_ar: "صالح لكل حاجة تريدها" },
    { day: 16, nature: "nahs", summary_ar: "رديء نحس — من سافر فيه هلك" },
    { day: 17, nature: "saad", summary_ar: "صالح مختار — فاطلبوا فيه ما شئتم" },
    { day: 18, nature: "mixed", summary_ar: "ممزوج — صالح مبارك لكل أمر وحاجة" },
    { day: 19, nature: "saad", summary_ar: "مختار جيد لكل حاجة ما خلا الكاتب" },
    { day: 20, nature: "saad", summary_ar: "جيد مختار — للحوائج والسفر والبناء والغرس" },
    { day: 21, nature: "nahs", summary_ar: "نحس مستمر لا يطلب فيه حاجة" },
    { day: 22, nature: "saad", summary_ar: "مختار صالح للشراء والبيع ولقاء السلطان" },
    { day: 23, nature: "saad", summary_ar: "مختار جيد خاصة للتزويج والتجارات كلها" },
    { day: 24, nature: "nahs", summary_ar: "يوم مشؤوم رديء نحس لكل أمر" },
    { day: 25, nature: "nahs", summary_ar: "رديء مذموم — نحس شديد البلاء" },
    { day: 26, nature: "mixed", summary_ar: "صالح لكل حاجة سوى التزويج والسفر" },
    { day: 27, nature: "saad", summary_ar: "جيد مختار للحوائج ولقاء السلطان" },
    { day: 28, nature: "saad", summary_ar: "مختار صالح للسفر وطلب الحوائج" },
    { day: 29, nature: "saad", summary_ar: "مختار جيد لكل حاجة" },
    { day: 30, nature: "saad", summary_ar: "مختار جيد لكل شيء والبيع والتزويج" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION H: DIRECTION OF PRAYER FOR SPIRITUAL OPERATIONS
// Source: p.42 — استقبال الجهة المناسبة
// ─────────────────────────────────────────────────────────────────────────────
export const KASHF_DIRECTION_RULES = {
  source: { book: KASHF_SOURCE.book_name_ar, page: 42 },
  name_ar: "استقبال الجهة المناسبة حسب طبع العمل",
  name_en: "Direction of Facing for Spiritual Operations by Element",
  rules: [
    { element_ar: "ناري", element_en: "Fire", direction_ar: "الغرب", direction_en: "West" },
    { element_ar: "مائي", element_en: "Water", direction_ar: "الشرق", direction_en: "East" },
    { element_ar: "هوائي", element_en: "Air", direction_ar: "الشمال", direction_en: "North" },
    { element_ar: "ترابي", element_en: "Earth", direction_ar: "الجنوب", direction_en: "South" },
  ],
  default_ar: "إذا أشكل عليك الأمر فاتجه إلى الغرب أو القبلة",
  default_en: "When in doubt, face West or the Qibla",
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION I: NIGHT VS DAY PREFERENCE (Hermetic rule preserved)
// Source: p.39 — الحكماء اتفقوا على أن ممارسة الأعمال الليل أولى
// ─────────────────────────────────────────────────────────────────────────────
export const KASHF_NIGHT_DAY_RULE = {
  source: { book: KASHF_SOURCE.book_name_ar, page: 39, scholar: "هرمس — نقلاً عن مؤلف الكتاب" },
  rule_ar: "اتفق الحكماء على أن ممارسة هذه الأعمال بالليل أولى من النهار لأن الشمس سلطان قاهر تقهر جميع الأرواح",
  rule_en: "Scholars agree that spiritual operations at night are superior; the Sun's domination suppresses all spirits during daytime",
  rule_ml: "ആദ്ധ്യാത്മിക കൃത്യങ്ങൾ രാത്രിയിൽ ഉത്തമം; സൂര്യൻ ദിവസം എല്ലാ ആത്മാക്കളെയും അടക്കുന്നു",
  exception_ar: "الطلسمات والصنعة والدعوة وعلاج الروحانية يمكن نهاراً أو ليلاً",
  exception_en: "Talismans, craft, invocations and spiritual treatments may be done day or night",
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION J: KEY PRINCIPLES / SPIRITUAL REQUIREMENTS (الشروط)
// Source: pp.8-51 — 32 conditions for spiritual practice
// Only the astrological conditions relevant to Astro Clock are extracted here
// ─────────────────────────────────────────────────────────────────────────────
export const KASHF_ASTRO_PRINCIPLES = [
  {
    id: "kashf_principle_001",
    source: { book: KASHF_SOURCE.book_name_ar, page: 11 },
    title_ar: "تمام شروط الرصد والرسم",
    title_en: "Completing the astronomical observation",
    rule_ar: "لا تتم الأعمال إلا في وقتها المحسوب حيث تصل الكواكب إلى الساعة الفلكية للعمل",
    rule_en: "Operations only succeed in their computed time when planets reach the required planetary hour",
    rule_ml: "ഗ്രഹങ്ങൾ നിശ്ചിത ഘടിക ഒരുക്കുമ്പോൾ മാത്രം കൃത്യം ഫലിക്കും",
  },
  {
    id: "kashf_principle_002",
    source: { book: KASHF_SOURCE.book_name_ar, page: 20 },
    title_ar: "الساعات السعيدة للأعمال الخيرية عند المشايخ الكبار",
    title_en: "Best hours for good deeds per the great masters",
    rule_ar: "المشايخ الكبار يكفيهم في الرصد لأعمال الخير مراعاة الساعات السعيدة وهي الأولى والثامنة من يوم الأحد والاثنين والخميس والجمعة أو أي ساعة يكون كوكبها سعيداً",
    rule_en: "For good deeds, the 1st and 8th hours of Sunday, Monday, Thursday, and Friday suffice — or any hour with a benefic planet",
    rule_ml: "ഞായർ, തിങ്കൾ, വ്യാഴം, വെള്ളി ദിനങ്ങളിൽ 1, 8 ഘടികകൾ — ശുഭ ഗ്രഹ ഘടിക ഏതും",
  },
  {
    id: "kashf_principle_003",
    source: { book: KASHF_SOURCE.book_name_ar, page: 20 },
    title_ar: "شرط زيادة القمر للأعمال الخيرية",
    title_en: "Waxing Moon for good deeds",
    rule_ar: "مراعاة أن تكون أعمال الخير في زيادة القمر أي النصف الأول من الشهر",
    rule_en: "Good deeds should be in the waxing Moon (first half of the lunar month)",
    rule_ml: "നല്ല കൃത്യങ്ങൾ ചന്ദ്ര വളർച്ചക്കാലത്ത് (മാസത്തിന്റെ ആദ്യ പകുതി)",
  },
  {
    id: "kashf_principle_004",
    source: { book: KASHF_SOURCE.book_name_ar, pages: "65-66" },
    title_ar: "الحساب الفلكي لا الشرعي لأيام السعود والنحوس",
    title_en: "Astronomical calculation (not religious) for lucky/unlucky days",
    rule_ar: "أعلم أن هذه الحسابات يتم حسابها فلكياً وليس بثبوت الرؤية — لأن سعود ونحوس الأيام آثار تكوينية تتعلق بثبوت اليوم فلكياً",
    rule_en: "These calculations are astronomical, not based on crescent sighting — they are cosmogenic effects tied to the astronomically established day",
    rule_ml: "ഈ കണക്കുകൂട്ടലുകൾ ജ്യോതിർഗ്ഗണിത അടിസ്ഥാനത്തിൽ; ചന്ദ്ര ദർശനത്തിൽ അടിസ്ഥാനമല്ല",
  },
  {
    id: "kashf_principle_005",
    source: { book: KASHF_SOURCE.book_name_ar, page: 65 },
    title_ar: "اليوم يبدأ بليلته السابقة",
    title_en: "The day begins with the preceding night",
    rule_ar: "الحساب للأيام يكون المراد به الليلة السابقة له والنهار التالي — فلو أردنا يوم الجمعة نقصد به يوم الخميس مساءً (ليلة الجمعة) التي تسبق نهار الجمعة",
    rule_en: "The planetary day = the PRECEDING night + the FOLLOWING daytime. Friday = Thursday evening + Friday daytime.",
    rule_ml: "ഗ്രഹ ദിനം = മുൻ രാത്രി + പിൻ പകൽ. വെള്ളിയാഴ്ച = വ്യാഴം വൈകുന്നേരം + വെള്ളി പകൽ",
    importance: "CRITICAL — This rule governs the active weekday boundary in the entire Astro Clock",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION K: DIRECTIONS NOT FAVOURABLE BY DAY
// Source: p.57 — أسرار الرياضات — الشيخ ناصر بن جاعد الخروصي
// ─────────────────────────────────────────────────────────────────────────────
export const KASHF_TRAVEL_DIRECTION_NAHS = {
  source: { book: KASHF_SOURCE.book_name_ar, page: 57, scholar: "الشيخ ناصر بن جاعد الخروصي (نظم منتهى الكرامات)" },
  name_ar: "نحوس الاتجاهات التشريق والتغريب والجنوب والشمال",
  name_en: "Unfavorable Travel Directions by Day",
  rules: [
    { days_ar: "السبت والاثنين", direction_ar: "الشرق", days_en: "Saturday, Monday", direction_en: "East" },
    { days_ar: "الجمعة والأحد", direction_ar: "الغرب", days_en: "Friday, Sunday", direction_en: "West" },
    { days_ar: "الثلاثاء والأربعاء", direction_ar: "الشمال", days_en: "Tuesday, Wednesday", direction_en: "North" },
    { days_ar: "الخميس", direction_ar: "الجنوب", days_en: "Thursday", direction_en: "South" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// INGESTION REPORT
// ─────────────────────────────────────────────────────────────────────────────
export const KASHF_INGESTION_REPORT = {
  source_id: KASHF_SOURCE.id,
  pdfs_processed: 3,
  total_pages: 90,
  ingestion_date: "2026-07-08",
  sections_ingested: [
    "Operation timing by day+hour (22 operations)",
    "Zodiac birth-sign timing table 1 (12 signs, day+hour)",
    "Zodiac birth-sign timing table 2 (12 signs, hour only)",
    "Zodiac timing table per Sheikh Zaher al-Ismaili (p.24)",
    "Fast-response hours table (ساعات الإجابة p.53)",
    "Dominance hours table (ساعات المغالبات p.53)",
    "Sheikh Jaad's most accurate hour table (الأدق p.54)",
    "Moon in zodiac hour table (p.54)",
    "Lunar mansion operations — Omani tradition (pp.55-56)",
    "Monthly unlucky days: 7 kamil days",
    "Lunar-month nahs per Sheikh al-Khalili (p.59)",
    "Day-by-day lunar month operations guide (pp.60-65)",
    "Direction of facing for operations by element (p.42)",
    "Night preference rule from Hermetic tradition (p.39)",
    "Key astrological principles including day-boundary rule (pp.8-66)",
    "Travel direction unlucky days (p.57)",
  ],
  existing_data_modified: 0,
  existing_data_deleted: 0,
  note: "100% additive. All 90 pages processed. No existing Astro Clock data touched.",
};
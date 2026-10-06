// ═══════════════════════════════════════════════════════════════
// KASHF AL-HAQA'IQ — PART 6: LETTER/PLANET SCIENCE TABLES (pp.239-270)
// Source: PDFs pp.239-270 of the Omani manuscript
// Includes:
//   - كيفية نجاح العمل (Keys to Spiritual Work Success — 9 rules)
//   - جدول طبائع الحروف ودرجاتها وخصائصها (Letter natures table)
//   - جدول أوصاف الحروف ومجموعها (Letter descriptions)
//   - أملاك الحروف (Angels of the Letters)
//   - أبراج الكواكب (Zodiac houses)
//   - جدول ملوك الأيام العلوية والسفلية (Planetary kings table)
//   - الكواكب السبعة (Seven Planets details)
//   - جدول الطوالع والطبائع (Ascendants/Temperaments)
//   - بساط سليمان (Solomon's Carpet — 4 Afarit names)
//   - دعوة الأحرف النورانية (Illuminated Letters Invocation)
//   - جدول حساب الجمل (Abjad calculation tables)
// ALL data is verbatim from the manuscript PDFs.
// ═══════════════════════════════════════════════════════════════

const SOURCE_AR = "كشف الحقائق";
const SOURCE_EN = "Kashf al-Haqa'iq";

// ══════════════════════════════════════════════════════════════════
// KEYS TO SPIRITUAL WORK SUCCESS (كيفية نجاح العمل)
// Source: pp.239-241 — 9 essential rules from the manuscript
// ══════════════════════════════════════════════════════════════════
export const KEYS_TO_SUCCESS = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 239 },
  rules: [
    { number: 1, rule_ar: "معرفة طبائع الحروف للطالب والمطلوب (نار تراب هواء ماء) وخواصها ومعرفة العنصر السائد فعليها تبنى عملك كله", rule_en: "Know the elemental nature (fire, earth, air, water) of the seeker and the sought — all work is built on this" },
    { number: 2, rule_ar: "معرفة طبائع الحروف: النارية حارة يابسة، الترابية باردة يابسة، الهوائية حارة رطبة، المائية باردة رطبة", rule_en: "Fire letters = hot dry; Earth letters = cold dry; Air letters = hot moist; Water letters = cold moist" },
    { number: 3, rule_ar: "استخراج الطالع والسعد والنحس للشخص: تحسب اسمه وأسم أمه بالجمل الكبير ثم أسقط المجتمع 7-7 وطابقه على الطوالع", rule_en: "Calculate the ascendant by computing name + mother's name in Abjad Kabir, subtract 7 repeatedly, match to zodiac table" },
    { number: 4, rule_ar: "معرفة اليوم والساعة وأسماء الملوك الموكلة والخدام لها", rule_en: "Know the day, hour, and names of the assigned planetary kings and servants" },
    { number: 5, rule_ar: "هناك أيام في كل شهر لا يعمل بها أبداً لكونها نحسة — الأيام الكوامل: 3، 5، 13، 16، 21، 24، 25 من كل شهر عربي", rule_en: "Monthly forbidden days (Nahs): 3, 5, 13, 16, 21, 24, 25 of every Arabic month" },
    { number: 6, rule_ar: "معرفة البخور والعزيمة الموافقة للعمل", rule_en: "Know the appropriate incense and azimah for the operation" },
    { number: 7, rule_ar: "معرفة الجمل الكبير والصغير والقلم الهندي — مشايخ العلم اشترطوا أن هذا العلم لا يصلح إلا بهذا القلم", rule_en: "Know Abjad Kabir, Saghir, and the Indian pen (numerals) — scholars require this pen for validity" },
    { number: 8, rule_ar: "يجب الالتزام بالكتابة بالقلم الهندي وبالبسط والتكسير والساعة", rule_en: "Mandatory: write in Indian pen with proper Bast (expansion), Taksir (division), and correct hour" },
    { number: 9, rule_ar: "أن يكون عملك بعيداً عن الأعين والنيرين وبالأخص النير الأعظم لأنه غالب على الكواكب الأخرى", rule_en: "Work must be away from eyes and the two luminaries — especially the Sun (greatest luminary), which dominates all other planets" }
  ]
};

// ══════════════════════════════════════════════════════════════════
// LETTER NATURE TABLE (جدول طبائع الحروف)
// Source: p.239 — Fire/Earth/Air/Water natures + element compatibilities
// ══════════════════════════════════════════════════════════════════
export const LETTER_NATURE_TABLE = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 239 },
  elements: {
    fire: {
      arabic: "النارية",
      letters: "أ هـ ط م ف ش ذ",
      gender: "مذكر",
      quality: "حار يابس",
      direction: "شرقي",
      type: "نهاري مرفوع",
      nature: "روحانية",
      planet_rank: "مرتبة (1-7 نفس الترتيب)"
    },
    earth: {
      arabic: "الترابية",
      letters: "ب و ي ص ت ض ظ",
      gender: "مؤنث",
      quality: "بارد يابس",
      direction: "جنوبي",
      type: "ليلي مجزوم",
      nature: "جسمانية"
    },
    air: {
      arabic: "الهوائية",
      letters: "ج ز ك ع ق ث غ",
      gender: "مذكر",
      quality: "حار رطب",
      direction: "غربي",
      type: "نهاري لطيف",
      nature: "نفسانية"
    },
    water: {
      arabic: "المائية",
      letters: "د ح ل ن ر خ ف",
      gender: "مؤنث",
      quality: "بارد رطب",
      direction: "شمالي",
      type: "ليلي كثيف",
      nature: "جسدانية"
    }
  },
  compatibility_rules: [
    "النار عدو الماء",
    "النار صديق التراب والهواء",
    "التراب عدو الماء",
    "التراب صديق للنار والماء",
    "الهواء عدو التراب",
    "الهواء صديق للنار والماء",
    "الماء عدو للنار",
    "الماء صديق للتراب والهواء"
  ],
  elemental_nature: [
    "النار تحيا في الهواء وتسكن في التراب وتموت في الماء",
    "الهواء يعيش في الماء ويسخن في النار ويموت في التراب",
    "الماء يعيش في الهواء ويسكن في التراب ويموت في النار",
    "التراب يعيش في الماء ويسخن في النار ويموت في الهواء"
  ],
  work_rules: {
    for_good: "خذ حروف العنصر الغالب على الشخص — حلها في مادة العنصر ذاته (ماء=حلها في ماء، تراب=ادفنها، نار=احرقها، هواء=علقها في مهب الريح)",
    for_harm: "اكتب عكس طبع عنصره (نار→ماء للهلاك، ماء→نار للهلاك، تراب→هواء للهلاك)"
  },
  element_determination: "لمعرفة طابع شخص: اجمع اسمه وأسم أمه واطرح 4 أربعة فأربعة — ناتج 1=نار، 2=تراب، 3=هواء، 4=ماء",
  imam_ghazali_classification: {
    fire_letters: "أ هـ ط م ف ش ذ",
    earth_letters: "ب و ي ن ص ت ض",
    air_letters: "ج ز ك س ق ث ظ",
    water_letters: "د ل ع ر خ غ"
  }
};

// ══════════════════════════════════════════════════════════════════
// LETTER PROPERTIES TABLE (جدول أوصاف الحروف ومجموعها)
// Source: p.257
// ══════════════════════════════════════════════════════════════════
export const LETTER_PROPERTIES_TABLE = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 257 },
  categories: [
    { property: "النورانية", letters: "أ ل م ر ك هـ ي ع س ح ق ن م ص ط", total: 693 },
    { property: "الظلمانية", letters: "ب ت ث ج خ د ذ ز ش ض ف غ ظ و", total: 5302 },
    { property: "سعيدة", letters: "أ هـ ط م و ص ك س د ل ع ر ح", total: 583 },
    { property: "ممتزجة", letters: "غ ف ز ب ن ض ج ظ خ", total: 2519 },
    { property: "نحسة", letters: "ش ث ي ت ق", total: 1310 },
    { property: "متحابة", letters: "ب د و ح ك م س ف ر ت خ ض", total: 2220 },
    { property: "متباينة", letters: "أ ج هـ ز ط ي ل ن ع ص ق ش ث ذ ظ غ", total: 2775 }
  ],
  good_vs_bad: {
    good_letters: "ا د ر و ح ط ك ل م س ع ص (الخالية من النقط)",
    permanently_good: "ا د هـ و ح ك",
    conditionally_good: "ط ل م س ع ص ر",
    bad_letters: "ب ج ز ي ن ف ق ش ت ث خ ذ ض ظ غ (المنقوطة)"
  },
  rank_rule: "من المرتبة إلى الثواني: سعيدة — من الثوالث إلى الخوامس: نحيسة"
};

// ══════════════════════════════════════════════════════════════════
// ANGELS OF THE LETTERS (أملاك الحروف)
// Source: p.243
// ══════════════════════════════════════════════════════════════════
export const ANGELS_OF_LETTERS = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 243 },
  assignments: [
    { letter: "أ", angel: "إسرافيل" },
    { letter: "ب", angel: "جريائيل" },
    { letter: "ج", angel: "كاكائيل" },
    { letter: "د", angel: "دردائيل" },
    { letter: "هـ", angel: "دويائيل" },
    { letter: "و", angel: "رحمائيل" },
    { letter: "ز", angel: "ضفيائيل" },
    { letter: "ح", angel: "تنكفيل" },
    { letter: "ط", angel: "إسماعيل" },
    { letter: "ي", angel: "سراكيطائيل" },
    { letter: "ك", angel: "حروزائيل" },
    { letter: "ل", angel: "طاطائيل" },
    { letter: "م", angel: "رويائيل" },
    { letter: "ن", angel: "حوالالئيل" },
    { letter: "س", angel: "همرائيل" },
    { letter: "ع", angel: "لومائيل" },
    { letter: "ف", angel: "سرهمائيل" },
    { letter: "ص", angel: "اهحائيل" },
    { letter: "ق", angel: "عطرائيل" },
    { letter: "ر", angel: "حواكيل" },
    { letter: "ش", angel: "هموائيل" },
    { letter: "ت", angel: "عزرائيل" },
    { letter: "ث", angel: "ميكائيل" },
    { letter: "خ", angel: "مهكائيل" },
    { letter: "ذ", angel: "اطوطيل" },
    { letter: "ض", angel: "عطكائيل" },
    { letter: "ظ", angel: "فورائيل" },
    { letter: "غ", angel: "لوجائيل" }
  ]
};

// ══════════════════════════════════════════════════════════════════
// PLANETARY DAYS TABLE (جدول ملوك الأيام العلوية والسفلية)
// Source: p.254 — Complete table with angels, kings, servants, planets,
//         planet gender, divine names, letters, zodiac, incense, metals, colors, regions
// ══════════════════════════════════════════════════════════════════
export const PLANETARY_DAYS_TABLE = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 254 },
  days: [
    {
      day: "الأحد", day_en: "Sunday",
      angel_upper: "روقيائيل",
      king_lower: "المذهب",
      servant: "دعول",
      planet: "الشمس",
      planet_gender: "ذكر",
      divine_name: "فرد",
      letter: "ف",
      zodiac: "الأسد",
      incense: "السندروس",
      metal: "ذهب",
      color: "أصفر",
      region: "العرب"
    },
    {
      day: "الاثنين", day_en: "Monday",
      angel_upper: "جبرائيل",
      king_lower: "الأبيض",
      servant: "حندش",
      planet: "القمر",
      planet_gender: "أنثى",
      divine_name: "جبار",
      letter: "ج",
      zodiac: "السرطان",
      incense: "اللبان الذكر",
      metal: "فضة",
      color: "أبيض",
      region: "العجم"
    },
    {
      day: "الثلاثاء", day_en: "Tuesday",
      angel_upper: "سمسيائيل",
      king_lower: "الأحمر",
      servant: "حنغر",
      planet: "المريخ",
      planet_gender: "ذكر",
      divine_name: "شهيد",
      letter: "ش",
      zodiac: "العقرب",
      incense: "القسط وقشر المحلب",
      metal: "حديد",
      color: "أحمر",
      region: "الحجاز"
    },
    {
      day: "الأربعاء", day_en: "Wednesday",
      angel_upper: "ميكائيل",
      king_lower: "برقان",
      servant: "هميطل",
      planet: "عطارد",
      planet_gender: "ممتزج",
      divine_name: "وارث",
      letter: "ث",
      zodiac: "الجوزاء",
      incense: "المقل الأزرق والعنبر",
      metal: "زئبق",
      color: "أزرق",
      region: "الروم"
    },
    {
      day: "الخميس", day_en: "Thursday",
      angel_upper: "صرفيائيل",
      king_lower: "شمهورش",
      servant: "شمرول",
      planet: "المشتري",
      planet_gender: "ذكر",
      divine_name: "ظاهر",
      letter: "ظ",
      zodiac: "القوس",
      incense: "العود والكافور",
      metal: "قصدير",
      color: "أخضر",
      region: "الغرب"
    },
    {
      day: "الجمعة", day_en: "Friday",
      angel_upper: "عنيائيل",
      king_lower: "زوبعة",
      servant: "بطراق",
      planet: "الزهرة",
      planet_gender: "أنثى",
      divine_name: "خبير",
      letter: "خ",
      zodiac: "الثور",
      incense: "المصطكي",
      metal: "نحاس",
      color: "مشهب بحمرة",
      region: "الشام"
    },
    {
      day: "السبت", day_en: "Saturday",
      angel_upper: "عزرائيل",
      king_lower: "ميمون",
      servant: "شمعون",
      planet: "زحل",
      planet_gender: "ذكر",
      divine_name: "زكي",
      letter: "ز",
      zodiac: "الدلو",
      incense: "الشمع الأصفر والمايعة",
      metal: "رصاص",
      color: "أسود",
      region: "الزنج"
    }
  ]
};

// ══════════════════════════════════════════════════════════════════
// ZODIAC-PLANET HOUSES TABLE (أبراج الكواكب)
// Source: p.243
// ══════════════════════════════════════════════════════════════════
export const ZODIAC_PLANET_HOUSES = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 243 },
  houses: [
    { rank: 1, planet: "زحل", zodiac: "الجدي والدلو" },
    { rank: 2, planet: "المشتري", zodiac: "القوس والحوت" },
    { rank: 3, planet: "المريخ", zodiac: "الحمل والعقرب" },
    { rank: 4, planet: "الشمس", zodiac: "الأسد" },
    { rank: 5, planet: "الزهرة", zodiac: "الثور والميزان" },
    { rank: 6, planet: "عطارد", zodiac: "الجوزاء والعذراء (السنبلة)" },
    { rank: 7, planet: "القمر", zodiac: "السرطان" }
  ]
};

// ══════════════════════════════════════════════════════════════════
// COMPLETE PLANET TABLE (جدول الكواكب — بيوتها، شرفها، وبالها، أفراحها)
// Source: pp.244-251
// ══════════════════════════════════════════════════════════════════
export const PLANET_DETAILS_TABLE = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 244 },
  planets: [
    {
      planet: "الشمس",
      house: "الأسد",
      exaltation: "19 درجة من برج الحمل",
      fall: "19 درجة من الميزان",
      detriment: "الدلو",
      joy_house: "البيت التاسع",
      orb: "15 درجة",
      nature: "سعيد — خاصة عند وجود الشمس في زوايا التثليث أو التسديس",
      incense: "عود وصندل أحمر",
      specialized_for: "أهل السلطنة والأكابر",
      metal: "الذهب"
    },
    {
      planet: "القمر",
      house: "السرطان",
      exaltation: "3 من الثور",
      fall: "3 من العقرب",
      detriment: "الجدي",
      joy_house: "البيت الثالث",
      orb: "12 درجة",
      nature: "سعيد",
      incense: "عود ولدن",
      specialized_for: "أهل السوق وأراذل الناس",
      metal: "الفضة"
    },
    {
      planet: "المريخ",
      house: "الحمل والعقرب",
      exaltation: "28 من الجدي",
      fall: "28 من السرطان",
      detriment: "الميزان والثور",
      joy_house: "البيت السادس",
      orb: "8 درجات",
      nature: "نحس أصغر",
      incense: "عود ودار صيني",
      specialized_for: "أهل الحرب والقتال",
      metal: "الحديد"
    },
    {
      planet: "عطارد",
      house: "الجوزاء والعذراء",
      exaltation: "15 من العذراء",
      fall: "15 من الحوت",
      detriment: "الحوت",
      joy_house: "البيت الأول (الطالع)",
      orb: "7 درجات",
      nature: "معتدل — سعيد إذا اقترن بسعد والعكس صحيح",
      incense: "عود وكافور",
      specialized_for: "أهل العلم والحساب والهندسة",
      metal: "الزئبق"
    },
    {
      planet: "المشتري",
      house: "القوس والحوت",
      exaltation: "15 السرطان",
      fall: "15 من الجدي",
      detriment: "الجوزاء العذراء",
      joy_house: "البيت الحادي عشر",
      orb: "9 درجات",
      nature: "سعيد (سعد أكبر)",
      incense: "عود وسكر",
      specialized_for: "أهل العلم والنسك",
      metal: "القصدير"
    },
    {
      planet: "الزهرة",
      house: "الثور والميزان",
      exaltation: "27 من الحوت",
      fall: "27 من العذراء",
      detriment: "الحمل والعقرب",
      joy_house: "البيت الخامس",
      orb: "7 درجات",
      nature: "سعيد (سعد أصغر)",
      incense: "عود وصندل أبيض",
      specialized_for: "أهل الطرب والغناء والرقص",
      metal: "النحاس"
    },
    {
      planet: "زحل",
      house: "الجدي والدلو",
      exaltation: "21 من الميزان",
      fall: "21 من الحمل",
      detriment: "السرطان والأسد",
      joy_house: "البيت الثاني عشر",
      orb: "9 درجات",
      nature: "نحس أكبر",
      incense: "عود والدن",
      specialized_for: "أهل الزرع والنساء والعبيد",
      metal: "الرصاص"
    }
  ]
};

// ══════════════════════════════════════════════════════════════════
// ASCENDANT TABLE (جدول الطوالع والأرباب والطبائع)
// Source: p.251
// ══════════════════════════════════════════════════════════════════
export const ASCENDANT_TABLE = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 251 },
  signs: [
    { rank: 1, zodiac: "الحمل", ruler: "المريخ", element: "ناري" },
    { rank: 2, zodiac: "الثور", ruler: "الزهرة", element: "ترابي" },
    { rank: 3, zodiac: "الجوزاء", ruler: "عطارد", element: "هوائي" },
    { rank: 4, zodiac: "السرطان", ruler: "القمر", element: "مائي" },
    { rank: 5, zodiac: "الأسد", ruler: "الشمس", element: "ناري" },
    { rank: 6, zodiac: "العذراء (السنبلة)", ruler: "عطارد", element: "ترابي" },
    { rank: 7, zodiac: "الميزان", ruler: "الزهرة", element: "هوائي" },
    { rank: 8, zodiac: "العقرب", ruler: "المريخ", element: "مائي" },
    { rank: 9, zodiac: "القوس", ruler: "المشتري", element: "ناري" },
    { rank: 10, zodiac: "الجدي", ruler: "زحل", element: "ترابي" },
    { rank: 11, zodiac: "الدلو", ruler: "زحل", element: "هوائي" },
    { rank: 12, zodiac: "الحوت", ruler: "المشتري", element: "مائي" }
  ],
  zodiac_classifications: {
    fixed: "الثور والأسد والعقرب والدلو",
    mutable: "الجوزاء والعذراء والقوس والحوت",
    cardinal: "الحمل والسرطان والميزان والجدي",
    fire: "الحمل والأسد والقوس — نارية نهارية شرقية مذكرات حارة يابسة",
    earth: "الثور والعذراء والجدي — ترابية جنوبية ليلية مؤنثات باردة يابسة",
    air: "الجوزاء والميزان والدلو — رياحية غربية نهارية مذكرات حارة رطبة",
    water: "السرطان والعقرب والحوت — مائية شمالية ليلية مؤنثات باردة رطبة"
  }
};

// ══════════════════════════════════════════════════════════════════
// ABJAD CALCULATION TABLES (جداول حساب الجمل)
// Source: p.242 — All 4 Abjad systems
// ══════════════════════════════════════════════════════════════════
export const ABJAD_TABLES = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 242 },
  kabir: {
    name: "الجمل الكبير",
    description: "Standard Abjad — most commonly used",
    values: {
      "أ": 1, "ب": 2, "ج": 3, "د": 4, "هـ": 5, "و": 6, "ز": 7,
      "ح": 8, "ط": 9, "ي": 10, "ك": 20, "ل": 30, "م": 40, "ن": 50,
      "س": 60, "ع": 70, "ف": 80, "ص": 90, "ق": 100, "ر": 200, "ش": 300,
      "ت": 400, "ث": 500, "خ": 600, "ذ": 700, "ض": 800, "ظ": 900, "غ": 1000
    }
  },
  saghir: {
    name: "الجمل الصغير",
    description: "Each letter = its unit digit only",
    values: {
      "أ": 1, "ب": 2, "ج": 3, "د": 4, "هـ": 5, "و": 6, "ز": 7, "ح": 8, "ط": 9,
      "ي": 1, "ك": 2, "ل": 3, "م": 4, "ن": 5, "س": 6, "ع": 7, "ف": 8, "ص": 9,
      "ق": 1, "ر": 2, "ش": 3, "ت": 4, "ث": 5, "خ": 6, "ذ": 7, "ض": 8, "ظ": 9,
      "غ": 1
    }
  },
  tabi_i: {
    name: "الجمل الطبيعي",
    description: "Sequential numbering 1-28",
    values: {
      "أ": 1, "ب": 2, "ج": 3, "د": 4, "هـ": 5, "و": 6, "ز": 7,
      "ح": 8, "ط": 9, "ي": 10, "ك": 11, "ل": 12, "م": 13, "ن": 14,
      "س": 15, "ع": 16, "ف": 17, "ص": 18, "ق": 19, "ر": 20, "ش": 21,
      "ت": 22, "ث": 23, "خ": 24, "ذ": 25, "ض": 26, "ظ": 27, "غ": 28
    }
  },
  maqta: {
    name: "الجمل المقطع (حساب الحروف النورانية أو حساب الأسرار)",
    description: "Only counting letters without their twin — for spiritual hidden values",
    note: "بعض الحروف ساقطة (لا قيمة لها) في هذا الحساب"
  },
  indian_pen_code: {
    name: "القلم الهندي (أرقام هندية/عربية)",
    description: "The Indian numerals used by Omani scholars for spiritual writing",
    note: "مشايخ العلم اشترطوا أن هذا العلم لا يصلح إلا بهذا القلم",
    encoding: "ايقغ=1111, بكر=222, جلش=333, دمت=444, هنث=555, وسخ=666, زعذ=777, حفض=888, طصظ=999"
  }
};

// ══════════════════════════════════════════════════════════════════
// SOLOMON'S CARPET — 4 AFARIT (بساط سليمان عليه السلام)
// Source: p.255
// ══════════════════════════════════════════════════════════════════
export const SOLOMON_CARPET = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 255 },
  description: "On Solomon's carpet were 4 Hebrew secret names that stunned jinn and made them obey. The 4 greatest jinn viziers of Solomon's 600 ministers (300 human + 300 jinn) knew these.",
  four_afarit: ["كلمواياط", "شقيق", "هدلماج", "شوغال"],
  surah_solomon: `إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ أَلَّا تَعْلُوا عَلَيَّ وَأْتُونِي مُسْلِمِينَ`,
  jinn_verse: `قَالَ عِفْرِيتٌ مِّنَ الْجِنِّ أَنَا آتِيكَ بِهِ قَبْلَ أَن تَقُومَ مِن مَّقَامِكَ وَإِنِّي عَلَيْهِ لَقَوِيٌّ أَمِينٌ`,
  instruction: "لا تأمر الأعوان الأربعة مباشرة — بل تقول لهم: يا معشر الأرواح الأربعة والأسماء الكريمة إلا ما أمرتم من يقضي حاجتي"
};

// ══════════════════════════════════════════════════════════════════
// ILLUMINATED LETTERS INVOCATION (دعوة الأحرف النورانية)
// Source: pp.258-260 — Read 14 times when working with these letters
// ══════════════════════════════════════════════════════════════════
export const DAWAT_NOORANIYYA = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 258 },
  repetition: "14 مرة",
  timing: "عند العمل بأي حرف نوراني أو جميعها لأي غرض",
  opening: `بسم الله الرحمن الرحيم اللهم سيدي أسألك بأنوار إشارة ألف (إنني أنا الله) وبحماية حجب (حاء) (حسبنا الله) وبروح روحانية راء (رضي الله) وبسناء سر سين (سيرحمهم الله) وبصفاء صفحات صاد (صبغة الله) وبطايا طاء (طبع الله) وبعوالم عوارف عين (ويعلمكم الله) وبقوة قهرية قاف (قل الله) وبكمال كلية كاف (كل من عند الله) وبلوامع لطائف لام (لمن الملك اليوم لله) وبمجد ملكة ميم (وما بكم من نعمة فمن الله) وبنفحات نسمات نون (نصر من الله) وبهدي هيبة هاء (هو الله) وبياء يمن (يستبشرون بنعمة الله)`,
  petition: "أن لا تدع إلا كفيتنيه بحق كفاية (فسيكفيكهم الله) ولا حاجة من حوائج الدنيا والآخرة إلا قضيتها",
  prophet_salawat: "على سيدنا محمد رسول الله صلى الله عليه وسلم كما يجب لحقه من الصلاة والتسليم عدد خلق الله"
};

// ══════════════════════════════════════════════════════════════════
// LETTER CLASSIFICATION BY HUMAN TYPES
// Source: p.261
// ══════════════════════════════════════════════════════════════════
export const LETTER_HUMAN_TYPES = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 261 },
  types: [
    { type: "حروف الرسل والمرسلين", letters: "أ د ر و" },
    { type: "حروف العلماء والراسخين", letters: "ذ ر" },
    { type: "حروف عامة العلماء", letters: "م ن ك" },
    { type: "حروف الصالحين", letters: "ب س ط" },
    { type: "حروف الأغنياء", letters: "ح ص ل هـ" },
    { type: "حروف الفقراء", letters: "ت ق ي" },
    { type: "حروف الأشقياء", letters: "ث ش" },
    { type: "حروف العدول الرشداء", letters: "ج خ ض ظ ع غ ف" }
  ]
};

// ══════════════════════════════════════════════════════════════════
// PLANET METAL SUBSTITUTES (بدائل المعادن)
// Source: pp.266-269 — For when original metals are unavailable
// ══════════════════════════════════════════════════════════════════
export const PLANET_METAL_SUBSTITUTES = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 266 },
  substitutes: [
    {
      planet: "الشمس", original_metal: "ذهب",
      substitutes: ["النحاس المطلي بالذهب", "الزعفران", "العود أو اللبان الفاخر", "حجر عين الشمس"]
    },
    {
      planet: "القمر", original_metal: "فضة",
      substitutes: ["صدف أبيض", "اللؤلؤ الصناعي أو حجر القمر", "لبن أو ماء ورد نقي", "الزجاج الأبيض النقي"]
    },
    {
      planet: "المريخ", original_metal: "حديد",
      substitutes: ["الفولاذ", "حجر الدم", "الزنجبيل والفلفل الأحمر", "اللون الأحمر القاني"]
    },
    {
      planet: "عطارد", original_metal: "زئبق",
      substitutes: ["حجر العقيق الأخضر أو الفيروز", "أقلام رصاص نقي (رمزية)", "لون رمادي لامع", "نبات السذاب أو الحرمل"]
    },
    {
      planet: "المشتري", original_metal: "قصدير",
      substitutes: ["حجارة صفراء مثل التوباز", "ورق غار أو بخور اللبان", "القماش الأصفر الحريري", "الياقوت الأصفر"]
    },
    {
      planet: "الزهرة", original_metal: "نحاس",
      substitutes: ["ورد مجفف ومسك وعطر", "حجر الزمرد أو العقيق الوردي", "اللون الأخضر أو الزهري الفاتح", "قماش حرير ناعم"]
    },
    {
      planet: "زحل", original_metal: "رصاص",
      substitutes: ["أحجار داكنة كحجر العقيق الأسود", "خشب أسود أو بخور مر", "اللون الرمادي أو الأسود", "زيت الزيتون القديم"]
    }
  ]
};

// ══════════════════════════════════════════════════════════════════
// ZODIAC CLASSIFICATION TABLE
// Source: p.269
// ══════════════════════════════════════════════════════════════════
export const ZODIAC_CLASSIFICATION = {
  source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 269 },
  table: [
    {
      signs: "الحمل والأسد والقوس",
      element: "ناريات",
      direction: "نهاريات شرقيات",
      gender: "مذكرات",
      quality: "حارة يابسة"
    },
    {
      signs: "الثور والعذراء والجدي",
      element: "ترابيات",
      direction: "جنوبيات",
      gender: "ليليات مؤنثات",
      quality: "باردة يابسة"
    },
    {
      signs: "الجوزاء والميزان والدلو",
      element: "رياحيات",
      direction: "غربيات",
      gender: "نهاريات مذكرات",
      quality: "حارة رطبة"
    },
    {
      signs: "السرطان والعقرب والحوت",
      element: "مائيات",
      direction: "شماليات",
      gender: "مؤنثات",
      quality: "باردة رطبة"
    }
  ],
  stability_types: {
    fixed: "الثور والأسد والعقرب والدلو (الثوابت)",
    mutable: "الجوزاء والعذراء والقوس والحوت (المجسدات)",
    cardinal: "الحمل والسرطان والميزان والجدي (المنقلبات)"
  }
};

export default {
  KEYS_TO_SUCCESS,
  LETTER_NATURE_TABLE,
  LETTER_PROPERTIES_TABLE,
  ANGELS_OF_LETTERS,
  PLANETARY_DAYS_TABLE,
  ZODIAC_PLANET_HOUSES,
  PLANET_DETAILS_TABLE,
  ASCENDANT_TABLE,
  ABJAD_TABLES,
  SOLOMON_CARPET,
  DAWAT_NOORANIYYA,
  LETTER_HUMAN_TYPES,
  PLANET_METAL_SUBSTITUTES,
  ZODIAC_CLASSIFICATION
};
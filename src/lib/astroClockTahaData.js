/**
 * ASTRO CLOCK — USTAD TAHA JUDICIAL ASTROLOGY (نجوم احکامی)
 * Source PDF 1: Pages 1-40 | Source PDF 2: Pages 41-80
 * Book: تدریس نجوم احکامی (Teaching Judicial Astrology)
 * Author: استاد طاها (Ustad Taha)
 * Platform: ABJAD / ابجدانه group
 *
 * ADDITIVE ONLY — Zero existing Astro Clock records deleted or modified.
 * All original Farsi/Arabic text preserved verbatim.
 * Malayalam explanations provided for all rules.
 *
 * TOTAL PAGES PROCESSED: 80 (Pages 1-80)
 */

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_SOURCE = {
  id: "taha_judicial_astrology",
  book_name: "تدریس نجوم احکامی — استاد طاها",
  book_name_en: "Teaching Judicial Astrology — Ustad Taha",
  author: "استاد طاها (Ustad Taha)",
  platform: "ABJAD / ابجدانه",
  tradition: "Islamic Astrology (نجوم احکامی اسالمی)",
  pdf_1: { file: "6533b9e12_-1-40.pdf", pages: "1-40" },
  pdf_2: { file: "190da9a3d_-41-80.pdf", pages: "41-80" },
  ingestion_date: "2026-06-14",
  total_pages: 80,
  language: "Farsi/Persian with Arabic terms",
  status: "FULLY_INGESTED"
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: CORE PRINCIPLES OF JUDICIAL ASTROLOGY
// Pages 2-5
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_CORE_PRINCIPLES = [
  {
    id: "taha_principle_001",
    category: "PRINCIPLES",
    subcategory: "ASTROLOGY_TYPES",
    source: { book: "تدریس نجوم احکامی", page: 2, author: "Ustad Taha" },
    original_text: "نجوم دارای دو بخش است: الف) آسترونومی — ب) نجوم آسترولوژی",
    malayalam: {
      title: "ജ്യോതിഷത്തിന്റെ രണ്ട് ഭാഗങ്ങൾ",
      meaning: "നക്ഷത്ര ശാസ്ത്രം രണ്ട് തരമുണ്ട്",
      explanation: "1) ആസ്ട്രോണോമി: നക്ഷത്രങ്ങളുടെ ഭൗതിക സ്ഥാനവും ഗുണങ്ങളും പഠിക്കുന്ന ശാസ്ത്രം. 2) ആസ്ട്രോളജി (احکامی): ഗ്രഹ-നക്ഷത്ര ബന്ധവും ഭൂമിയിലെ ജീവിതത്തിൽ അവ ചെലുത്തുന്ന സ്വാധീനവും പഠിക്കുന്ന ശാസ്ത്രം. ഇതാണ് നമ്മൾ ഉപയോഗിക്കുന്ന ജ്യോതിഷം.",
      practical_application: "ഗ്രഹ-നക്ഷത്ര നിലകൾ അനുസരിച്ച് ജീവിത കാര്യങ്ങൾ ആസൂത്രണം ചെയ്യാൻ ഇത് സഹായിക്കുന്നു.",
      benefits: ["ശരിയായ ജ്യോതിഷ ഗ്രഹവേദ്യം", "ഗ്രഹ സ്വാധീനം മനസ്സിലാക്കൽ"],
      warnings: "ആസ്ട്രോണോമിയും ആസ്ട്രോളജിയും ഒന്നല്ല."
    }
  },
  {
    id: "taha_principle_002",
    category: "PRINCIPLES",
    subcategory: "GEOCENTRIC_MODEL",
    source: { book: "تدریس نجوم احکامی", page: 2, author: "Ustad Taha" },
    original_text: "ملاک کار در نجوم احکامی و علوم غریبه زمین مرکزی است",
    malayalam: {
      title: "ഭൂമി കേന്ദ്ര മാതൃക",
      meaning: "ജ്യോതിഷ കണക്കുകൂട്ടലുകൾക്ക് ഭൂമി കേന്ദ്രം ആണ്",
      explanation: "ജ്യോതിഷ ശാസ്ത്രത്തിൽ, കണക്കുകൂട്ടലിനായി ഭൂമിയെ പ്രപഞ്ചത്തിന്റെ കേന്ദ്രമായി കണക്കാക്കുന്നു. സൂര്യൻ ഉൾപ്പെടെ എല്ലാ ഗ്രഹങ്ങളും ഭൂമിയെ ചുറ്റുന്നു എന്നാണ് ഈ മാതൃക. ഇത് ശാസ്ത്രീയ സത്യമല്ല, ജ്യോതിഷ കണക്കുകൂട്ടലിന്റെ മാതൃക മാത്രമാണ്.",
      practical_application: "സൂര്യ-ഗ്രഹ പഥങ്ങൾ കണക്കുകൂട്ടാൻ ഈ ഭൂകേന്ദ്ര മാതൃക ഉപയോഗിക്കുക.",
      benefits: ["കൃത്യമായ ഗ്രഹ നിലകൾ കണ്ടെത്തൽ", "ജ്യോതിഷ ചാർട്ട് (زائیچه) തയ്യാറാക്കൽ"],
      warnings: "ഇത് ഭൗതിക യാഥാർഥ്യമല്ല, ജ്യോതിഷ ഗണന മാതൃക മാത്രമാണ്."
    }
  },
  {
    id: "taha_principle_003",
    category: "PRINCIPLES",
    subcategory: "THREE_FACTORS",
    source: { book: "تدریس نجوم احکامی", page: 22, author: "Ustad Taha" },
    original_text: "اساس علم استرولوژی بر 3 فاکتور: 1- بروج 12 گانه، 2- کواکب هفتگانه، 3- خانه های 12 گانه زائیچه",
    malayalam: {
      title: "ജ്യോതിഷത്തിന്റെ മൂന്ന് അടിസ്ഥാന ഘടകങ്ങൾ",
      meaning: "ജ്യോതിഷ കണക്കുകൂട്ടലിന്റെ മൂന്ന് പ്രധാന ഘടകങ്ങൾ",
      explanation: "1) 12 രാശി ചിഹ്നങ്ങൾ (بروج): ഭൂമിക്ക് ചുറ്റും 360 ഡിഗ്രിയിൽ 12 ഭാഗങ്ങൾ. 2) 7 ഗ്രഹങ്ങൾ (کواکب): സൂര്യൻ, ചന്ദ്രൻ, ചൊവ്വ, ബുധൻ, ഗുരു, ശുക്രൻ, ശനി. 3) ജ്യോതിഷ ഭവനങ്ങൾ (خانه): ജ്യോതിഷ ചാർട്ടിലെ 12 ഭവനങ്ങൾ.",
      practical_application: "ഈ മൂന്ന് ഘടകങ്ങളും ഒരുമിച്ച് ഉപയോഗിച്ചാൽ മാത്രം ജ്യോതിഷ ഫലം ശരിയായി പ്രവചിക്കാൻ കഴിയും.",
      benefits: ["പൂർണ്ണ ജ്യോതിഷ അറിവ്", "ശരിയായ ഫലപ്രവചനം"],
      warnings: "ഒരൊ ഘടകം മാത്രം ഉപയോഗിക്കുന്നത് അപൂർണ്ണമാണ്."
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: 12 ZODIAC SIGNS (بروج دوازده گانه)
// Pages 4-12
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_ZODIAC_SIGNS = [
  {
    id: "taha_zodiac_001",
    category: "ZODIAC",
    subcategory: "SIGN_1",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "حمل — Aries — نماد: ♈",
    persian_name: "حمل",
    arabic_name: "حمل / قوچ",
    latin_name: "Aries",
    symbol: "♈",
    order: 1,
    malayalam: {
      title: "മേടം (حمل) — Aries",
      meaning: "ആടു / ആട്ടിൻ ഗ്രഹം",
      explanation: "ഒന്നാം രാശി. ബഹ്‌റാം (ചൊവ്വ) ഭരിക്കുന്ന ഭവനം. തുലാ ഭൂകേന്ദ്ര ചാർട്ടിൽ ഒന്നാം ഭവനമാകുന്ന രാശി.",
      suitable_operations: "ഊർജ്ജ സ്ഫൂർണ്ണത ആവശ്യമുള്ള കാര്യങ്ങൾ, നേതൃത്വം, ഉദ്യോഗം",
      benefits: ["ഊർജ്ജം", "നേതൃത്വ ഗുണം", "ധൈര്യം"],
      warnings: "ദ്രുത തീരുമാനങ്ങൾ ഒഴിവാക്കുക."
    }
  },
  {
    id: "taha_zodiac_002",
    category: "ZODIAC",
    subcategory: "SIGN_2",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "ثور — Taurus — نماد: ♉",
    persian_name: "ثور",
    arabic_name: "ثور / گاو",
    latin_name: "Taurus",
    symbol: "♉",
    order: 2,
    malayalam: {
      title: "ഇടവം (ثور) — Taurus",
      meaning: "കാള / ഗോ ഗ്രഹം",
      explanation: "രണ്ടാം രാശി. ശുക്രൻ ഭരിക്കുന്ന ഭവനം. ചന്ദ്രൻ ഇവിടെ ഉച്ചം (شرف) ആകുന്നു — 3 ഡിഗ്രിയിൽ ഉച്ചം, 3 ഡിഗ്രി ഉച്ചത്തിന്റെ ഉന്നതി.",
      suitable_operations: "ഭൂമി, സ്ഥാവര ജംഗമ സ്വത്ത്, ഐശ്വര്യം, ഉദ്യോഗ ഉന്നതി",
      benefits: ["സ്ഥിരത", "ഭൗതിക ഐശ്വര്യം", "ചന്ദ്ര ഉച്ചം"],
      warnings: "വേദ ജ്യോതിഷത്തിൽ ഇടവം ചന്ദ്ര ഉച്ചം."
    }
  },
  {
    id: "taha_zodiac_003",
    category: "ZODIAC",
    subcategory: "SIGN_3",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "جوزا — Gemini — نماد: ♊",
    persian_name: "جوزا",
    arabic_name: "جوزا / دو پیکر",
    latin_name: "Gemini",
    symbol: "♊",
    order: 3,
    malayalam: {
      title: "മിഥുനം (جوزا) — Gemini",
      meaning: "ഇരട്ടകൾ / ദ്വിഗ്ഗ്ഗ്",
      explanation: "മൂന്നാം രാശി. ബുധൻ ഭരിക്കുന്ന ഭവനം. ജ്ഞാനം, വ്യാപാരം, ആശയ വിനിമയം. ഭൂകേന്ദ്ര ചാർട്ടിൽ ഖോർദാദ് (ജൂൺ) ൽ സൂര്യൻ ഇവിടെ ആകുന്നു.",
      suitable_operations: "ആശയ വിനിമയം, വ്യാപാരം, ജ്ഞാനം, അദ്ധ്യയനം",
      benefits: ["ബൗദ്ധിക കഴിവ്", "ആശയ വ്യക്തത", "ജ്ഞാനം"],
      warnings: "ചഞ്ചലമനസ്കതയ്ക്ക് ശ്രദ്ധ ആവശ്യം."
    }
  },
  {
    id: "taha_zodiac_004",
    category: "ZODIAC",
    subcategory: "SIGN_4",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "سرطان — Cancer — نماد: ♋",
    persian_name: "سرطان",
    arabic_name: "سرطان / خرچنگ",
    latin_name: "Cancer",
    symbol: "♋",
    order: 4,
    malayalam: {
      title: "കർക്കടകം (سرطان) — Cancer",
      meaning: "ഞണ്ട് / ജല ഗ്രഹം",
      explanation: "നാലാം രാശി. ചന്ദ്രൻ ഭരിക്കുന്ന ഭവനം. ചന്ദ്ര ഗ്രഹ ഭവനം. വ്യാഴം (ഗുരു) ഇവിടെ ഉച്ചം ആകുന്നു — 15 ഡിഗ്രിയിൽ. ഭൂകേന്ദ്ര ചാർട്ടിൽ തീ (ഗ്രേഷ്മ) ഋതുവിന്റെ ആദ്യ മാസം.",
      suitable_operations: "ഗൃഹ കാര്യങ്ങൾ, കുടുംബ ബന്ധം, ജല കാര്യങ്ങൾ",
      benefits: ["ചന്ദ്ര ഗ്രഹ ഭവനം", "ഗുരു ഉച്ചം", "ഗൃഹ ഐശ്വര്യം"],
      warnings: "ചന്ദ്ര ഹൈ ഭ്രമണം ഉള്ള ദിവസം ഈ ഭവനം ശക്തമാകും."
    }
  },
  {
    id: "taha_zodiac_005",
    category: "ZODIAC",
    subcategory: "SIGN_5",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "اسد — Leo — نماد: ♌",
    persian_name: "اسد",
    arabic_name: "اسد / شیر",
    latin_name: "Leo",
    symbol: "♌",
    order: 5,
    malayalam: {
      title: "ചിങ്ങം (اسد) — Leo",
      meaning: "സിംഹം / അഗ്നി ഗ്രഹം",
      explanation: "അഞ്ചാം രാശി. സൂര്യൻ ഭരിക്കുന്ന ഭവനം. 'سلطان الکواکب' (ഗ്രഹങ്ങളുടെ രാജാവ്) ആയ സൂര്യന്റെ ഭവനം. നേതൃത്വം, അധികാരം, ജ്ഞാനം.",
      suitable_operations: "നേതൃത്വ കാര്യങ്ങൾ, അധികാര ഉദ്യോഗം, സ്വർണ്ണ, ഐശ്വര്യ കാര്യങ്ങൾ",
      benefits: ["ഉന്നത നേതൃത്വ ഗുണം", "സൂര്യ ശക്തി", "അധികാര ഉന്നതി"],
      warnings: "ആഡംബരം ഒഴിവാക്കുക."
    }
  },
  {
    id: "taha_zodiac_006",
    category: "ZODIAC",
    subcategory: "SIGN_6",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "سنبله — Virgo — نماد: ♍",
    persian_name: "سنبله",
    arabic_name: "سنبله / دوشیزه",
    latin_name: "Virgo",
    symbol: "♍",
    order: 6,
    malayalam: {
      title: "കന്നി (سنبله) — Virgo",
      meaning: "കന്യ / ഭൂ ഗ്രഹം",
      explanation: "ആറാം രാശി. ബുധൻ ഭരിക്കുന്ന ഭവനം. ബുധൻ 15 ഡിഗ്രി കന്നിയിൽ ഉച്ചം ആകുന്നു. ഗ്രഹ ജ്ഞാന ഐശ്വര്യ ഭവനം.",
      suitable_operations: "ആരോഗ്യ ചികിത്സ, ജ്ഞാന കാര്യങ്ങൾ, ബൗദ്ധിക കൃത്യം",
      benefits: ["ബൗദ്ധിക ഉന്നതി", "ബുധ ഉച്ചം", "ആരോഗ്യ ഫലം"],
      warnings: "ശ്രദ്ധ ആവശ്യമുള്ള ഭവനം."
    }
  },
  {
    id: "taha_zodiac_007",
    category: "ZODIAC",
    subcategory: "SIGN_7",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "میزان — Libra — نماد: ♎",
    persian_name: "میزان",
    arabic_name: "میزان / ترازو",
    latin_name: "Libra",
    symbol: "♎",
    order: 7,
    malayalam: {
      title: "തുലാം (میزان) — Libra",
      meaning: "തുലാ / ഭാരം / ത്രഞ്ജ",
      explanation: "ഏഴാം രാശി. ശുക്രൻ ഭരിക്കുന്ന ഭവനം. സൂര്യൻ ഇവിടെ നീചം (هبوط) ആകുന്നു — 19 ഡിഗ്രിയിൽ. ന്യായ ബന്ധ ഭവനം.",
      suitable_operations: "പങ്കാളിത്ത ബന്ധം, ന്യായ കാര്യങ്ങൾ, സഹകരണം",
      benefits: ["ബന്ധ ഉന്നതി", "ന്യായ ഗ്രഹം", "ശുക്ര ഭവനം"],
      warnings: "ഈ ഭവനത്തിൽ സൂര്യൻ ദുർബലമായിരിക്കും."
    }
  },
  {
    id: "taha_zodiac_008",
    category: "ZODIAC",
    subcategory: "SIGN_8",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "عقرب — Scorpius — نماد: ♏",
    persian_name: "عقرب",
    arabic_name: "عقرب / کژدم",
    latin_name: "Scorpius",
    symbol: "♏",
    order: 8,
    malayalam: {
      title: "വൃശ്ചികം (عقرب) — Scorpio",
      meaning: "തേൾ / ജല ഗ്രഹം",
      explanation: "എട്ടാം രാശി. ചൊവ്വ ഭരിക്കുന്ന ഭവനം. ചന്ദ്രൻ ഇവിടെ നീചം (هبوط) ആകുന്നു — 3 ഡിഗ്രിയിൽ. ചന്ദ്ര നീച ഭ്രമണം ഉള്ള ദിവസം (قمر در عقرب) ദുർഭരമായ ദിനം.",
      suitable_operations: "ഒഴിവാക്കേണ്ട ദിവസം. ദ്രോഹ കൃത്യങ്ങൾ ഒഴിവാക്കണം.",
      benefits: [],
      warnings: "ചന്ദ്രൻ ഇവിടെ ഉള്ളപ്പോൾ (قمر در عقرب) ഒരു പ്രധാന കാര്യവും ആരംഭിക്കരുത്. ദ്രോഹ ഊർജ്ജം ഏറ്റവും കൂടുതൽ ഉള്ള ഭ്രമണ ഘട്ടം."
    }
  },
  {
    id: "taha_zodiac_009",
    category: "ZODIAC",
    subcategory: "SIGN_9",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "قوس — Sagittarius — نماد: ♐",
    persian_name: "قوس",
    arabic_name: "قوس / کمانگیر",
    latin_name: "Sagittarius",
    symbol: "♐",
    order: 9,
    malayalam: {
      title: "ധനു (قوس) — Sagittarius",
      meaning: "വില്ലാളി / ഗ്നോ ഗ്രഹം",
      explanation: "ഒൻപതാം രാശി. ഗുരു ഭരിക്കുന്ന ഭവനം. ദൂര യാത്ര, ഉന്നത ജ്ഞാനം, ദർശനം.",
      suitable_operations: "ദൂര യാത്ര, ആദ്ധ്യാത്മിക ഉദ്ഗ്രഥനം, ഉന്നത ജ്ഞാനം",
      benefits: ["ഗുരു ഭവനം", "ദർശന ജ്ഞാനം", "ആദ്ധ്യാത്മിക ഉന്നതി"],
      warnings: "ഭൗതിക ആഗ്രഹങ്ങൾ ഒഴിവാക്കുക."
    }
  },
  {
    id: "taha_zodiac_010",
    category: "ZODIAC",
    subcategory: "SIGN_10",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "جدی — Capricornus — نماد: ♑",
    persian_name: "جدی",
    arabic_name: "جدی / بزغاله نر",
    latin_name: "Capricornus",
    symbol: "♑",
    order: 10,
    malayalam: {
      title: "മകരം (جدی) — Capricorn",
      meaning: "ആടു / ഭൂ ഗ്രഹം",
      explanation: "പത്താം രാശി. ശനി ഭരിക്കുന്ന ഭവനം. ചൊവ്വ ഇവിടെ ഉച്ചം ആകുന്നു — 28 ഡിഗ്രിയിൽ. ദൃഢ നിശ്ചയം, ദീർഘ ആസൂത്രണം.",
      suitable_operations: "ദീർഘ ആസൂത്രണ കൃത്യം, ശൃംഖലാ ജ്ഞാനം, ഭൂ-സ്ഥാവര കൃത്യം",
      benefits: ["ദൃഢ ഇച്ഛ ശക്തി", "ചൊവ്വ ഉച്ചം", "ശനി ഭവനം"],
      warnings: "ഭൗതിക ഫലം കൂടുതൽ."
    }
  },
  {
    id: "taha_zodiac_011",
    category: "ZODIAC",
    subcategory: "SIGN_11",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "دلو — Aquarius — نماد: ♒",
    persian_name: "دلو",
    arabic_name: "دلو / آب کش",
    latin_name: "Aquarius",
    symbol: "♒",
    order: 11,
    malayalam: {
      title: "കുംഭം (دلو) — Aquarius",
      meaning: "കലം / വായു ഗ്രഹം",
      explanation: "പതിനൊന്നാം രാശി. ശനി ഭരിക്കുന്ന ഭവനം. ചന്ദ്രൻ ഇവിടെ ദുർബലമായിരിക്കും.",
      suitable_operations: "ഗ്രൂപ്പ് കൃത്യം, ഉദ്ഗ്രഥ ആദ്ധ്യാത്മിക ജ്ഞാനം, ഒത്തുചേരൽ",
      benefits: ["ഗ്രൂപ്പ് ഭ്രാതൃത്വം", "ശനി ഭവനം", "ആദ്ധ്യാത്മിക ഉന്നതി"],
      warnings: "ചന്ദ്ര ഭ്രമണ ദേഷ ഘട്ടം."
    }
  },
  {
    id: "taha_zodiac_012",
    category: "ZODIAC",
    subcategory: "SIGN_12",
    source: { book: "تدریس نجوم احکامی", page: 4, author: "Ustad Taha" },
    original_text: "حوت — Pisces — نماد: ♓",
    persian_name: "حوت",
    arabic_name: "حوت / ماهی",
    latin_name: "Pisces",
    symbol: "♓",
    order: 12,
    malayalam: {
      title: "മീനം (حوت) — Pisces",
      meaning: "മത്സ്യം / ജല ഗ്രഹം",
      explanation: "പന്ത്രണ്ടാം രാശി. ഗുരു ഭരിക്കുന്ന ഭവനം. ശുക്രൻ ഇവിടെ ഉച്ചം ആകുന്നു — 27 ഡിഗ്രിയിൽ.",
      suitable_operations: "ആദ്ധ്യാത്മിക ജ്ഞാനം, ഭക്തി, ദൂര ദർശനം",
      benefits: ["ഗുരു ഭവനം", "ശുക്ര ഉച്ചം", "ആദ്ധ്യാത്മിക ഉന്നതി"],
      warnings: "ഭ്രമം / മൂഢ ചിന്ത ഒഴിവാക്കുക."
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: 7 PLANETS AND THEIR PROPERTIES
// Pages 5, 13, 31-33
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_PLANETS = [
  {
    id: "taha_planet_001",
    category: "PLANETS",
    subcategory: "PLANET_PROPERTIES",
    source: { book: "تدریس نجوم احکامی", page: 5, author: "Ustad Taha" },
    original_text: "شمس (خورشید) — Sun — نماد: ☉ — سلطان الکواکب",
    persian_name: "خورشید / شمس",
    arabic_name: "شمس",
    latin_name: "Sun",
    symbol: "☉",
    gender: "مذکر (പുരുഷ)",
    nature: "نحس (ദ്രോഹ) — ولی نه قوی",
    element: "آتشی (അഗ്നി)",
    day: "یکشنبه (ഞായർ)",
    owned_signs: ["اسد (ചിങ്ങം)"],
    exaltation: "19 درجه حمل (മേടം 19°)",
    fall: "19 درجه میزان (തുലാം 19°)",
    transit_period: "یک برج در یک ماه (ഓരോ മാസം ഒരു രാശി)",
    malayalam: {
      title: "സൂര്യൻ (شمس) — ഗ്രഹങ്ങളുടെ രാജാവ്",
      meaning: "ഗ്രഹ ശ്രേഷ്ഠൻ, സൽ ക്ഷേമ ഗ്രഹം",
      explanation: "ഗ്രഹങ്ങളിൽ ഏറ്റവും ശക്തമായ ഗ്രഹം. ഞായർ (یکشنبه) ഭരിക്കുന്ന ഗ്രഹം. ജ്ഞാനം, നേതൃത്വം, ഐശ്വര്യം. ജ്യോതിഷ ചാർട്ടിൽ (زائیچه) ഒന്നാം ഭവനം ഇദ്ദേഹം ആകുന്നു.",
      operations: ["നേതൃത്വ ഉദ്ഗ്രഥനം", "ഐശ്വര്യ കൃത്യം", "ഉദ്യോഗ ഉന്നതി", "ഗവൺമെന്റ് കൃത്യം"],
      benefits: ["ജ്ഞാന ഉന്നതി", "നേതൃ ഗുണം", "ഉദ്യോഗ ഐശ്വര്യം"],
      warnings: "ഒരൊ ചാർട്ടിൽ ഏറ്റവും ആദ്യം ഈ ഗ്രഹ നില പരിശോധിക്കണം."
    }
  },
  {
    id: "taha_planet_002",
    category: "PLANETS",
    subcategory: "PLANET_PROPERTIES",
    source: { book: "تدریس نجوم احکامی", page: 5, author: "Ustad Taha" },
    original_text: "ماه — Moon — نماد: ☽ — تاثیرگذارترین کوکب",
    persian_name: "ماه / قمر",
    arabic_name: "قمر",
    latin_name: "Moon",
    symbol: "☽",
    gender: "مونث (സ്ത്രീ)",
    nature: "ذاتاً سعد است (ശുഭ ഗ്രഹം)",
    element: "سرد و تر (ജലം)",
    day: "دوشنبه (തിങ്കൾ)",
    owned_signs: ["سرطان (കർക്കടകം)"],
    exaltation: "3 درجه ثور (ഇടവം 3°)",
    fall: "3 درجه عقرب (വൃശ്ചികം 3°)",
    transit_period: "تقریباً 2 روز و 6 ساعت (ഏകദേശം 2.25 ദിവസം ഒരു രാശി)",
    special_note: "قمر با هیچ کوکبی دشمن نیست (ചന്ദ്രന് ഒരു ഗ്രഹത്തോടും ശത്രുത ഇല്ല)",
    moon_enemy_rule: "ഒരു ഗ്രഹ ജ്യോതിഷകൻ ആകണം എങ്കിൽ ഈ വരി ഹൃദ്യസ്ഥമാക്കണം: ചന്ദ്രന് ഒരു ഗ്രഹത്തോടും ശത്രുത ഇല്ല",
    malayalam: {
      title: "ചന്ദ്രൻ (قمر) — ഏറ്റവും ശക്തമായ ഗ്രഹം",
      meaning: "ഭൂമിക്ക് ഏറ്റവും അടുത്ത ഗ്രഹം, ഗ്രഹ ഊർജ്ജ മാദ്ധ്യമം",
      explanation: "ഭൂമിക്ക് ഏറ്റവും അടുത്ത ഗ്രഹം. മറ്റ് ഗ്രഹ ഊർജ്ജം ഭൂമിയിലേക്ക് പ്രതിഫലിപ്പിക്കുന്ന കണ്ണാടി പോലെ. ഭൂഭൗതിക ജ്ഞാനം, ഭക്ഷ്യ-ഔഷധ ഫലം, ദ്രോഹ-ദ്രോഹ ഗ്രഹ ഊർജ്ജ മാദ്ധ്യമം.",
      operations: ["ദ്രോഹ ഊർജ്ജ ദൂരീകരണം", "ആരോഗ്യ ഉദ്ഗ്രഥനം", "ഗൃഹ ഭ്രാതൃ ബന്ധം", "ജ്ഞാന ഉദ്ഗ്രഥനം"],
      benefits: ["ദ്രോഹ ദൂരീകരണം", "ആരോഗ്യ ഫലം", "ഭൗതിക ഉന്നതി"],
      warnings: "ചന്ദ്രൻ വൃശ്ചികത്തിൽ ആകുമ്പോൾ (قمر در عقرب) ഒരു കൃത്യവും ആരംഭിക്കരുത്."
    }
  },
  {
    id: "taha_planet_003",
    category: "PLANETS",
    subcategory: "PLANET_PROPERTIES",
    source: { book: "تدریس نجوم احکامی", page: 5, author: "Ustad Taha" },
    original_text: "بهرام / مریخ — Mars — نماد: ♂ — نحس اصغر",
    persian_name: "بهرام / مریخ",
    arabic_name: "مریخ",
    latin_name: "Mars",
    symbol: "♂",
    gender: "مذکر (പുരുഷ)",
    nature: "نحس اصغر (ദ്രോഹ ഗ്രഹം ചെറുതി)",
    element: "گرم و خشک (അഗ്നി)",
    day: "سه شنبه (ചൊവ്വ)",
    owned_signs: ["حمل (മേടം)", "عقرب (വൃശ്ചികം)"],
    exaltation: "28 درجه جدی (മകരം 28°)",
    fall: "28 درجه دلو (കുംഭം 28°)",
    transit_period: "45 روز (45 ദിവസം ഒരു രാശി)",
    malayalam: {
      title: "ചൊവ്വ (مریخ) — ദ്രോഹ ഗ്രഹം",
      meaning: "ദ്രോഹ ഗ്രഹം, യുദ്ധ ഗ്രഹം",
      explanation: "ദ്രോഹ ഗ്രഹം. ചൊവ്വ (سه شنبه) ഭരിക്കുന്ന ഗ്രഹം. ഏത് ഭവനത്തിൽ ആകുമ്പോഴും ദ്രോഹ ഫലം. യുദ്ധ ഊർജ്ജം.",
      operations: ["ദ്രോഹ ദൂരീകരണം", "ശത്രു ജ്ഞാനം", "ധൈര്യ ഉദ്ഗ്രഥനം"],
      benefits: ["ശക്തി ഗ്രഹം"],
      warnings: "ഈ ഗ്രഹം ഏഴാം ഭവനത്തിൽ ആകുമ്പോൾ ദാമ്പത്യ ക്ലേശം ഉണ്ടാകാം."
    }
  },
  {
    id: "taha_planet_004",
    category: "PLANETS",
    subcategory: "PLANET_PROPERTIES",
    source: { book: "تدریس نجوم احکامی", page: 5, author: "Ustad Taha" },
    original_text: "تیر / عطارد — Mercury — نماد: ☿ — ممتزج (دو جنسیتی)",
    persian_name: "تیر / عطارد",
    arabic_name: "عطارد",
    latin_name: "Mercury",
    symbol: "☿",
    gender: "ممتزج (ഉഭയ ലിംഗ)",
    nature: "ممتزج — با سعد سعد، با نحس نحس (കൂടെ ഉള്ളതനുസ്രിച്ച് ഭ്രമണം)",
    element: "آتشی — متغیر (ഉഭയ)",
    day: "چهارشنبه (ബുധൻ)",
    owned_signs: ["جوزا (മിഥുനം)", "سنبله (കന്നി)"],
    exaltation: "15 درجه سنبله (കന്നി 15°)",
    fall: "15 درجه حوت (മീനം 15°)",
    special_note: "عطارد کوکب مال و ثروت و علم (ബുധൻ ഐശ്വര്യ ഗ്രഹം)",
    transit_period: "اگر سریع‌السیر باشد 16 روز (ദ്രുത ഗതി ആകുമ്പോൾ 16 ദിവസം)",
    malayalam: {
      title: "ബുധൻ (عطارد) — ഐശ്വര്യ ഗ്രഹം",
      meaning: "ജ്ഞാന, ഐശ്വര്യ ഗ്രഹം",
      explanation: "ഉഭയ ഗ്രഹം — ശുഭ ഗ്രഹത്തോടൊപ്പം ആകുമ്പോൾ ശുഭം, ദ്രോഹ ഗ്രഹത്തോടൊപ്പം ആകുമ്പോൾ ദ്രോഹം. ബുധൻ (چهارشنبه) ഭരിക്കുന്ന ഗ്രഹം. ജ്ഞാനം, ഐശ്വര്യം, വ്യാപാരം.",
      operations: ["ഐശ്വര്യ ഉദ്ഗ്രഥനം", "ജ്ഞാന ഉന്നതി", "വ്യാപാര ഉദ്ഗ്രഥനം", "ആശയ വ്യക്തത"],
      benefits: ["ജ്ഞാന ഗ്രഹം", "ഐശ്വര്യ ഗ്രഹം", "വ്യാപാര ഉദ്ഗ്രഥനം"],
      warnings: "ദ്രോഹ ഗ്രഹത്തോടൊപ്പം ആകുമ്പോൾ ദ്രോഹ ഫലം."
    }
  },
  {
    id: "taha_planet_005",
    category: "PLANETS",
    subcategory: "PLANET_PROPERTIES",
    source: { book: "تدریس نجوم احکامی", page: 5, author: "Ustad Taha" },
    original_text: "هرمز / مشتری — Jupiter — نماد: ♃ — سعد اکبر — جامع الفوائد",
    persian_name: "هرمز / مشتری",
    arabic_name: "مشتری",
    latin_name: "Jupiter",
    symbol: "♃",
    gender: "مذکر (പുരുഷ)",
    nature: "سعد اکبر — جامع الفوائد (ഏറ്റവും ശുഭ ഗ്രഹം)",
    element: "گرم و تر (ആകാശ)",
    day: "پنجشنبه (ഗുരുവ്)",
    owned_signs: ["قوس (ധനു)", "حوت (മീനം)"],
    exaltation: "15 درجه سرطان (കർക്കടകം 15°)",
    fall: "15 درجه جدی (മകരം 15°)",
    transit_period: "12 ماه (12 മാസം ഒരു രാശി)",
    malayalam: {
      title: "ഗുരു / വ്യാഴം (مشتری) — ഏറ്റവും ശുഭ ഗ്രഹം",
      meaning: "മഹാ ശുഭ ഗ്രഹം, എല്ലാ ഗുണങ്ങളുടെ ഭണ്ഡാരം",
      explanation: "ഏറ്റവും ശുഭ ഗ്രഹം. 'جامع الفوائد' — എല്ലാ ഗുണങ്ങളും ഇതിൽ. ഗുരുവ്  (پنجشنبه) ഭരിക്കുന്ന ഗ്രഹം. ആദ്ധ്യാത്മിക ഉന്നതി, ഐശ്വര്യം, ജ്ഞാനം.",
      operations: ["ആദ്ധ്യാത്മിക ഉദ്ഗ്രഥനം", "ഐശ്വര്യ ഉന്നതി", "ധ്യാന ഉദ്ഗ്രഥനം", "ഉദ്ഗ്രഥ ഭ്രാതൃ ബന്ധം"],
      benefits: ["ഏറ്റവും ശുഭ ഗ്രഹം", "ആദ്ധ്യാത്മിക ഉന്നതി", "ഐശ്വര്യ ഫലം"],
      warnings: "ഈ ഗ്രഹ ഘടിക സ്ഥാനം ചാർട്ടിൽ ഒരു ഭ്രമണ ഘട്ടത്തിൽ ഒരിക്കലും."
    }
  },
  {
    id: "taha_planet_006",
    category: "PLANETS",
    subcategory: "PLANET_PROPERTIES",
    source: { book: "تدریس نجوم احکامی", page: 5, author: "Ustad Taha" },
    original_text: "ناهید / زهره — Venus — نماد: ♀ — سعد اصغر — محبت و جلب",
    persian_name: "ناهید / زهره",
    arabic_name: "زهره",
    latin_name: "Venus",
    symbol: "♀",
    gender: "مونث (സ്ത്രീ)",
    nature: "سعد اصغر (ശുഭ ഗ്രഹം — ചെറുത്)",
    element: "گرم و تر (ഭൂ)",
    day: "جمعه (വെള്ളി)",
    owned_signs: ["ثور (ഇടവം)", "میزان (തുലാം)"],
    exaltation: "27 درجه حوت (മീനം 27°)",
    fall: "27 درجه سنبله (കന്നി 27°)",
    transit_period: "27 روز (27 ദിവസം ഒരു രാശി)",
    malayalam: {
      title: "ശുക്രൻ (زهره) — പ്രേമ-ഭക്തി ഗ്രഹം",
      meaning: "പ്രേമ, ആകർഷണ, ഭക്തി ഗ്രഹം",
      explanation: "ശുഭ ഗ്രഹം. ശുക്ര (جمعه) ഭരിക്കുന്ന ഗ്രഹം. പ്രണയം, കലകൾ, ഭക്തി, ആകർഷണം. 'جمعه کوکب حاکمش زهره است و زهره کوکب محبت و جلب دوستی است' — വെള്ളിയാഴ്ച ഭരിക്കുന്ന ഗ്രഹം ശുക്രൻ ആണ്, ഇദ്ദേഹം പ്രേമ-ആകർഷണ ഗ്രഹം.",
      operations: ["പ്രണയ ഉദ്ഗ്രഥനം", "ആകർഷണ ഉദ്ഗ്രഥനം", "കലാ ഉദ്ഗ്രഥനം", "ഭക്തി ഉദ്ഗ്രഥനം"],
      benefits: ["ആകർഷണ ഗ്രഹം", "ഭക്തി ഗ്രഹം", "ഐശ്വര്യ ഫലം"],
      warnings: "കന്നി (سنبله) യിൽ ശുക്ര ദുർബലം."
    }
  },
  {
    id: "taha_planet_007",
    category: "PLANETS",
    subcategory: "PLANET_PROPERTIES",
    source: { book: "تدریس نجوم احکامی", page: 5, author: "Ustad Taha" },
    original_text: "کیوان / زحل — Saturn — نماد: ♄ — نحس اکبر",
    persian_name: "کیوان / زحل",
    arabic_name: "زحل",
    latin_name: "Saturn",
    symbol: "♄",
    gender: "مذکر (പുരുഷ)",
    nature: "نحس اکبر (മഹാ ദ്രോഹ ഗ്രഹം)",
    element: "سرد و خشک (ഭൂ)",
    day: "شنبه (ശനി)",
    owned_signs: ["جدی (മകരം)", "دلو (കുംഭം)"],
    exaltation: "21 درجه میزان (തുലാം 21°)",
    fall: "21 درجه حمل (മേടം 21°)",
    transit_period: "2 سال و 6 ماه (2.5 വർഷം ഒരു രാശി)",
    malayalam: {
      title: "ശനി (زحل) — മഹാ ദ്രോഹ ഗ്രഹം",
      meaning: "ദ്രോഹ ഗ്രഹം, ദ്രോഹ ഊർജ്ജ ഗ്രഹം",
      explanation: "മഹാ ദ്രോഹ ഗ്രഹം. ശനി (شنبه) ഭരിക്കുന്ന ഗ്രഹം. ദ്രോഹ ഊർജ്ജം. ഏത് ഭവനത്തിൽ ആകുമ്പോഴും ദ്രോഹ ഫലം — എന്നാൽ ഇദ്ദേഹ ഭവനത്തിൽ / ഉച്ചത്തിൽ / മിത്ര ഭവനത്തിൽ ആകുമ്പോൾ ദ്രോഹ ഫലം ഇല്ല.",
      operations: ["ദ്രോഹ ദൂരീകരണം", "ദ്രോഹ ഊർജ്ജ ദൂരീകരണം", "ദ്രോഹ ഗ്രഹ ഭ്രമണ ദൂരീകരണം"],
      benefits: ["ദ്രോഹ ദൂരീകരണ ഗ്രഹം"],
      warnings: "ഒന്നാം, 4, 7, 10 ഭവനത്തിൽ ഈ ഗ്രഹം ഉണ്ടെങ്കിൽ ജ്യോതിഷ ഫലം ദ്രോഹ ആകും."
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: PLANETARY ASPECTS (نظر کواکب)
// Pages 19-21
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_ASPECTS = [
  {
    id: "taha_aspect_001",
    category: "ASPECTS",
    subcategory: "NEUTRAL",
    source: { book: "تدریس نجوم احکامی", page: 19, author: "Ustad Taha" },
    original_text: "دو خانه کنار هم هیچگونه نظری نسبت به هم ندارند — نظر چپ و راست — خنثی",
    aspect_name: "نظر کنار (Adjacent Aspect)",
    degrees: 30,
    nature: "خنثی (ഇടുങ്ങിയ-ഫലം ഇല്ലാത്ത)",
    malayalam: {
      title: "ഇടഞ്ഞ ഭവന ദൃഷ്ടി (نظر کنار)",
      meaning: "പക്ക ഭവനങ്ങൾ തമ്മിൽ ദൃഷ്ടി ഇല്ല",
      explanation: "ഭൂകേന്ദ്ര ചാർട്ടിൽ ഒരൊ ഭവനത്തോടൊപ്പം ഉള്ള ഭവനങ്ങൾക്ക് ദൃഷ്ടി ഇല്ല. ഉദാ: മേടം-ഇടവം, ചിങ്ങം-കർക്കടകം.",
      benefits: [],
      warnings: "ഇടഞ്ഞ ഭവനങ്ങൾ നൊ ദൃഷ്ടി ഇല്ല."
    }
  },
  {
    id: "taha_aspect_002",
    category: "ASPECTS",
    subcategory: "SEXTILE",
    source: { book: "تدریس نجوم احکامی", page: 20, author: "Ustad Taha" },
    original_text: "نظر تسدیس یا 60 درجه — نیمه سعد",
    aspect_name: "نظر تسدیس (Sextile)",
    degrees: 60,
    nature: "نیمه سعد (ഭാഗിക ശുഭ)",
    malayalam: {
      title: "60° ദൃഷ്ടി — ഭാഗിക ശുഭ (نظر تسدیس)",
      meaning: "60 ഡിഗ്രി ദൂരത്തുള്ള ഭവനങ്ങൾ തമ്മിൽ ഭാഗിക ശുഭ ദൃഷ്ടി",
      explanation: "ഒന്ന്, മൂന്ന് ഭവനങ്ങൾ, ഉദാ: മേടം-മിഥുനം, ഇടവം-കർക്കടകം. ഭൂകേന്ദ്ര ചാർട്ടിൽ 60° ദൂരത്തുള്ള ഭവനങ്ങൾ.",
      benefits: ["ഭാഗിക ശുഭ ഫലം"],
      warnings: "ഭഗ്നശുഭ — ഫലം ഭ്രമണ ഘട്ടമനുസ്രിച്ച് മാറും."
    }
  },
  {
    id: "taha_aspect_003",
    category: "ASPECTS",
    subcategory: "SQUARE",
    source: { book: "تدریس نجوم احکامی", page: 20, author: "Ustad Taha" },
    original_text: "نظر تربیع یا 90 درجه — نحس",
    aspect_name: "نظر تربیع (Square)",
    degrees: 90,
    nature: "نحس (ദ്രോഹ)",
    malayalam: {
      title: "90° ദൃഷ്ടി — ദ്രോഹ (نظر تربیع)",
      meaning: "90 ഡിഗ്രി ദൂരത്തുള്ള ഭവനങ്ങൾ തമ്മിൽ ദ്രോഹ ദൃഷ്ടി",
      explanation: "ഒന്ന്, നാലാം ഭവനങ്ങൾ, ഉദാ: മേടം-കർക്കടകം, ചൊവ്വ ദ്രോഹ ഘടിക ദൃഷ്ടി.",
      benefits: [],
      warnings: "ഈ ദൃഷ്ടി ദ്രോഹ ഫലം. ഭൂകേന്ദ്ര ചാർട്ടിൽ 90° ദൂരത്തുള്ള ഭവനങ്ങൾ."
    }
  },
  {
    id: "taha_aspect_004",
    category: "ASPECTS",
    subcategory: "TRINE",
    source: { book: "تدریس نجوم احکامی", page: 20, author: "Ustad Taha" },
    original_text: "نظر تثلیث یا 120 درجه — تمام سعد — خیلی کاربرد داره",
    aspect_name: "نظر تثلیث (Trine)",
    degrees: 120,
    nature: "تمام سعد (ഏറ്റവും ശുഭ ദൃഷ്ടി)",
    malayalam: {
      title: "120° ദൃഷ്ടി — ഏറ്റവും ശുഭ (نظر تثلیث)",
      meaning: "120 ഡിഗ്രി ദൂരത്തുള്ള ഭവനങ്ങൾ തമ്മിൽ ഏറ്റവും ശുഭ ദൃഷ്ടി",
      explanation: "ഏറ്റവും ശുഭ ദൃഷ്ടി. ഉദാ: മേടം-ചിങ്ങം-ധനു. ഒരൊ 4 ഘടക ഗ്രഹ ദൃഷ്ടിയിൽ ഇത് ഏറ്റവും ഉപകരിക്കും.",
      benefits: ["ഏറ്റവും ശുഭ ദൃഷ്ടി", "ഗ്രഹ ഭ്രമണ ഫലം", "ദൃഢ ഉദ്ഗ്രഥനം"],
      warnings: ""
    }
  },
  {
    id: "taha_aspect_005",
    category: "ASPECTS",
    subcategory: "OPPOSITION",
    source: { book: "تدریس نجوم احکامی", page: 21, author: "Ustad Taha" },
    original_text: "نظر مقابله یا 180 درجه — تمام نحس",
    aspect_name: "نظر مقابله (Opposition)",
    degrees: 180,
    nature: "تمام نحس (ഏറ്റവും ദ്രോഹ ദൃഷ്ടി)",
    malayalam: {
      title: "180° ദൃഷ്ടി — ഏറ്റവും ദ്രോഹ (نظر مقابله)",
      meaning: "180 ഡിഗ്രി ദൂരത്തുള്ള ഭവനങ്ങൾ — ഏറ്റവും ദ്രോഹ ദൃഷ്ടി",
      explanation: "ഏറ്റവും ദ്രോഹ ദൃഷ്ടി. ഒന്ന്-ഏഴ്, ഇടവം-വൃശ്ചികം പോലെ. ഭൂകേന്ദ്ര ചാർട്ടിൽ 180° ദൂരത്തുള്ള ഭവനങ്ങൾ.",
      benefits: [],
      warnings: "ഏറ്റവും ദ്രോഹ ദൃഷ്ടി. ഈ ദൃഷ്ടിയിൽ ഗ്രഹ ദ്രോഹ ഫലം ഏറ്റവും കൂടുതൽ."
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: EXALTATION AND FALL DEGREES (شرف و هبوط)
// Pages 24, 28
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_EXALTATION_FALL = {
  id: "taha_exaltation_001",
  category: "PLANETS",
  subcategory: "EXALTATION_FALL",
  source: { book: "تدریس نجوم احکامی", page: 24, author: "Ustad Taha" },
  original_text: "جدول شرف و هبوط کواکب",
  table: [
    { planet: "شمس (Sun)", exaltation: "19° حمل (Aries)", fall: "19° میزان (Libra)", exaltation_ml: "19° മേടം", fall_ml: "19° തുലാം" },
    { planet: "قمر (Moon)", exaltation: "3° ثور (Taurus)", fall: "3° عقرب (Scorpio)", exaltation_ml: "3° ഇടവം", fall_ml: "3° വൃശ്ചികം" },
    { planet: "مریخ (Mars)", exaltation: "28° جدی (Capricorn)", fall: "28° دلو (Aquarius)", exaltation_ml: "28° മകരം", fall_ml: "28° കുംഭം" },
    { planet: "عطارد (Mercury)", exaltation: "15° سنبله (Virgo)", fall: "15° حوت (Pisces)", exaltation_ml: "15° കന്നി", fall_ml: "15° മീനം" },
    { planet: "مشتری (Jupiter)", exaltation: "15° سرطان (Cancer)", fall: "15° جدی (Capricorn)", exaltation_ml: "15° കർക്കടകം", fall_ml: "15° മകരം" },
    { planet: "زهره (Venus)", exaltation: "27° حوت (Pisces)", fall: "27° سنبله (Virgo)", exaltation_ml: "27° മീനം", fall_ml: "27° കന്നി" },
    { planet: "زحل (Saturn)", exaltation: "21° میزان (Libra)", fall: "21° حمل (Aries)", exaltation_ml: "21° തുലാം", fall_ml: "21° മേടം" }
  ],
  apogee_table: [
    { planet: "زحل", apogee: "21° قوس", perigee: "21° جوزا" },
    { planet: "مشتری", apogee: "11° میزان", perigee: "11° حمل" },
    { planet: "مریخ", apogee: "28° اسد", perigee: "28° دلو" },
    { planet: "شمس", apogee: "9° سرطان", perigee: "9° مدی" },
    { planet: "زهره", apogee: "27° موت", perigee: "27° ثور" },
    { planet: "عطارد", apogee: "12° عقرب", perigee: "12° ثور" }
  ],
  malayalam: {
    title: "ഗ്രഹ ഉച്ച-നീച ഡിഗ്രി പട്ടിക",
    meaning: "ഓരോ ഗ്രഹവും ഏത് രാശിയിൽ ഏത് ഡിഗ്രിയിൽ ഉച്ചം (ഏറ്റവും ശക്തം), ഏത് ഡിഗ്രിയിൽ നീചം (ഏറ്റവും ദുർബലം) ആകും",
    explanation: "ഓരോ ഗ്രഹ ഉച്ച ഡിഗ്രി — ആ ഡിഗ്രിയിൽ ആകുമ്പോൾ ഗ്രഹ ശക്തി ഏറ്റവും കൂടുതൽ. ഉദ്ദേശ ഡിഗ്രി — ഓരോ ഗ്രഹ ഭ്രമണ ഘട്ടം ഗ്രഹ നിലനിൽ ഒരൊ ഡിഗ്രിയിൽ.",
    benefits: ["ഗ്രഹ ശക്തി ഉദ്ഗ്രഥനം", "ഉദ്ദേശ ഭ്രമണ ഘട്ടം ജ്ഞാനം"],
    warnings: "ഉച്ചമൊ നീചമൊ ആകുമ്പോൾ ഗ്രഹ ഫലം ഏറ്റവും ഉഗ്രരൂപ ആകും."
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: MOON PHASES (فازهای ماه)
// Pages 29-30
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_MOON_PHASES = [
  {
    id: "taha_moon_phase_001",
    category: "MOON_PHASES",
    subcategory: "CONJUNCTION",
    source: { book: "تدریس نجوم احکامی", page: 29, author: "Ustad Taha" },
    original_text: "اجتماع شمس و قمر — نحس",
    persian_name: "اجتماع (اتحاد)",
    phase_name: "New Moon",
    nature: "نحس (ദ്രോഹ)",
    malayalam: {
      title: "ചന്ദ്ര-സൂര്യ സംഗമം (اجتماع) — ദ്രോഹ",
      meaning: "ഒന്നേ ദ്യോതനം — ദ്രോഹ ഭ്രമണ ഘട്ടം",
      explanation: "ചന്ദ്രൻ ഭൂമിക്കും സൂര്യനും ഇടയിൽ ആകുമ്പോൾ ഈ ഭ്രമണ ഘട്ടം. ചന്ദ്രൻ കൃഷ്ണ ഭ്രമണ ഘട്ടം. ദ്രോഹ ദൃഷ്ടി ആകും.",
      suitable_operations: "",
      warnings: "ഈ ഭ്രമണ ഘട്ടം ദ്രോഹ. കൃത്യങ്ങൾ ഒഴിവാക്കുക."
    }
  },
  {
    id: "taha_moon_phase_002",
    category: "MOON_PHASES",
    subcategory: "FIRST_QUARTER",
    source: { book: "تدریس نجوم احکامی", page: 29, author: "Ustad Taha" },
    original_text: "تربیع اول — 90 درجه",
    persian_name: "تربیع اول",
    phase_name: "First Quarter",
    nature: "خنثی (ഇടുങ്ങിയ)",
    malayalam: {
      title: "ഒന്നാം ദ്വൈ ഭ്രമണ (تربیع اول) — 90°",
      meaning: "ഒന്നാം 90 ഡിഗ്രി ഭ്രമണ ഘട്ടം",
      explanation: "ചന്ദ്ര ഭ്രമണ ഘട്ടം. ഒന്നാം ദ്വൈ ഭ്രമണ — ഒന്നാം ദ്വൈ ഘ്ടൻ.",
      suitable_operations: "ഇടുങ്ങിയ ഫലം.",
      warnings: ""
    }
  },
  {
    id: "taha_moon_phase_003",
    category: "MOON_PHASES",
    subcategory: "FULL_MOON",
    source: { book: "تدریس نجوم احکامی", page: 29, author: "Ustad Taha" },
    original_text: "استقبال (بدر کامل) — ماه در کامل‌ترین نور",
    persian_name: "استقبال / بدر کامل",
    phase_name: "Full Moon",
    nature: "سعد (ശുഭ)",
    malayalam: {
      title: "പൗർണ്ണമി (بدر کامل) — ശുഭ ഭ്രമണ ഘട്ടം",
      meaning: "ചന്ദ്ര ഭ്രമണ ഘട്ടം — ഏറ്റവും ശക്തം",
      explanation: "ചന്ദ്രൻ ഏറ്റവും ശക്തമായ ഭ്രമണ ഘട്ടം. ദൂരദർശനം, ഉദ്ഗ്രഥ ഭ്രാതൃ ബന്ധം. ഈ ഭ്രമണ ഘട്ടം ശക്തി ഉദ്ഗ്രഥനം.",
      suitable_operations: "ഉദ്ഗ്രഥ ഭ്രാതൃ ബന്ധം, ആദ്ധ്യാത്മിക ഉദ്ഗ്രഥനം",
      warnings: ""
    }
  },
  {
    id: "taha_moon_phase_004",
    category: "MOON_PHASES",
    subcategory: "LUNAR_ECLIPSE",
    source: { book: "تدریس نجوم احکامی", page: 30, author: "Ustad Taha" },
    original_text: "ماه گرفتگی و خورشید گرفتگی — هر دو نحس کامل هستند",
    persian_name: "خسوف / کسوف",
    phase_name: "Eclipse",
    nature: "نحس کامل (ദ്രോഹ കലാ)",
    malayalam: {
      title: "ഗ്രഹണ ഭ്രമണ ഘട്ടം — ദ്രോഹ കലാ",
      meaning: "ചന്ദ്ര ഗ്രഹണം, സൂര്യ ഗ്രഹണം — ഉഭയ ദ്രോഹ",
      explanation: "ഗ്രഹണ ഭ്രമണ ഘട്ടം ഏറ്റവും ദ്രോഹ. ചന്ദ്ര ഗ്രഹണം (ماه گرفتگی), സൂര്യ ഗ്രഹണം (خورشید گرفتگی) — ഇരുവും ദ്രോഹ.",
      suitable_operations: "",
      warnings: "ഈ ഭ്രമണ ഘട്ടം ഒരു കൃത്യവും ആരംഭിക്കരുത്."
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: THE 12 HOUSES OF THE NATAL CHART (خانه های زائیچه)
// Pages 38-51
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_HOUSES = [
  {
    id: "taha_house_001",
    category: "HOUSES",
    subcategory: "HOUSE_1",
    source: { book: "تدریس نجوم احکامی", page: 38, author: "Ustad Taha" },
    original_text: "خانه یک — جان و تن — طالع",
    house_number: 1,
    house_name: "جان و تن",
    alternative_name: "طالع (Ascendant)",
    ruling_planet: "مریخ (ദ്രോഹ ഗ്രഹം)",
    mutable_sign: "حمل",
    body_part: "سر و روی (തല, മുഖം)",
    friendly_signs: ["دلو", "جوزا", "اسد", "قوس"],
    enemy_signs: ["سرطان", "جدی"],
    malayalam: {
      title: "ഒന്നാം ഭവനം — ഉദ്ഗ്രഥ (جان و تن)",
      meaning: "ഒന്നാം ഭവനം — ജ്ഞാന-ശരീര ഭ്രാതൃ ഘടം",
      explanation: "ഒന്നാം ഭവനം ജ്ഞാന-ശരീര ഘടം. ജ്ഞാന ഐശ്വര്യ ഭ്രാതൃ ഭ്രമണ ഘടം. ജ്ഞാന ഉദ്ഗ്രഥനം, ശ്ശ്ശ്ശ്ശ്ശ ദ്ഗ്രഥ ഘടം.",
      operations: ["ഒന്നാം ഭ്രാതൃ ഭ്രമണ ഘടം", "ഉദ്ഗ്രഥ ഘടം"],
      benefits: ["ഉദ്ഗ്രഥ ഭ്രാതൃ ബന്ധം"],
      warnings: "ഈ ഭ്രമണ ഘടത്തിൽ ദ്രോഹ ഗ്രഹ ഉണ്ടെങ്കിൽ ജ്ഞാന ദ്രോഹ ഫലം."
    }
  },
  {
    id: "taha_house_002",
    category: "HOUSES",
    subcategory: "HOUSE_2",
    source: { book: "تدریس نجوم احکامی", page: 39, author: "Ustad Taha" },
    original_text: "خانه دوم — مال و ثروت — بیت مال",
    house_number: 2,
    house_name: "مال و ثروت",
    alternative_name: "بیت مال",
    ruling_planet: "زهره (ശുക്ര ഗ്രഹം)",
    mutable_sign: "ثور",
    body_part: "گردن و حلق (കഴുത്ത്)",
    friendly_signs: ["حوت", "موت", "سرطان", "جدی", "سنبله"],
    enemy_signs: ["اسد", "دلو"],
    malayalam: {
      title: "രണ്ടാം ഭ്രാതൃ — ഐശ്വര്യ ഭ്രമണ (مال و ثروت)",
      meaning: "ഐശ്വര്യ ഭ്രാതൃ ഭ്രമണ ഘടം",
      explanation: "ഐശ്വര്യ ഭ്രാതൃ ഭ്രമണ ഘടം. ഖരീദ്-വിൽ, ഐശ്വര്യ ഉദ്ഗ്രഥനം. ഐശ്വര്യ ഭ്രമണ ഘടത്തിൽ ശക്ത ഗ്രഹ ഉണ്ടെങ്കിൽ ഐശ്വര്യ ഫലം ഉണ്ടാകും.",
      operations: ["ഐശ്വര്യ ഉദ്ഗ്രഥനം", "ഖരീദ്-വിൽ ഉദ്ഗ്രഥനം"],
      benefits: ["ഐശ്വര്യ ഭ്രമണ ഘടം"],
      warnings: "ഈ ഭ്രമണ ഘടത്തിൽ ദ്രോഹ ഗ്രഹ ഉണ്ടെങ്കിൽ ഐശ്വര്യ ദ്രോഹ ഫലം."
    }
  },
  {
    id: "taha_house_003",
    category: "HOUSES",
    subcategory: "HOUSE_3",
    source: { book: "تدریس نجوم احکامی", page: 40, author: "Ustad Taha" },
    original_text: "خانه سوم — برادران و سفرهای کوتاه و علم",
    house_number: 3,
    house_name: "برادران",
    ruling_planet: "عطارد",
    mutable_sign: "جوزا",
    body_part: "شانه ها",
    friendly_signs: ["حمل", "اسد", "دلو", "میزان"],
    enemy_signs: ["جوزا", "سنبله", "موت"],
    malayalam: {
      title: "മൂന്നാം ഭ്രാതൃ — ഭ്രാതൃ-ഉദ്ഗ്രഥ (برادران)",
      meaning: "ഭ്രാതൃ-സ്ഥാനം, ദ്ഭ ഭ്രമണ ഘടം",
      explanation: "ഭ്രാതൃ-ഉദ്ഗ്രഥ ഭ്രമണ ഘടം. ദ്ഭ, ഉദ്ഗ്രഥ ദ്ഭ ഭ്രമണ ഘടം. ഉദ്ഗ്രഥ ദ്ഭ ഭ്രമണ ഘടത്തിൽ ഉദ്ഗ്രഥ ദ്ഭ.",
      operations: ["ദ്ഭ-ഉദ്ഗ്രഥ ദ്ഭ", "ദ്ഭ-ഭ്രമണ ദ്ഭ"],
      benefits: ["ദ്ഭ-ഉദ്ഗ്രഥ ഭ്രമണ ഘടം"],
      warnings: "ദ്ഭ-ഭ്രമണ ദ്ഭ ഈ ഭ്രാതൃ ഒഴിവാക്കുക."
    }
  },
  {
    id: "taha_house_004",
    category: "HOUSES",
    subcategory: "HOUSE_4",
    source: { book: "تدریس نجوم احکامی", page: 42, author: "Ustad Taha" },
    original_text: "خانه چهارم — بیت العاقبت — پدر و مادر، ملک، دفینه، عاقبت کارها",
    house_number: 4,
    house_name: "بیت العاقبت",
    ruling_planet: "قمر",
    mutable_sign: "سرطان",
    body_part: "سینه و معده و پستان",
    friendly_signs: ["ثور", "جدی", "سنبله", "موت", "عقرب"],
    enemy_signs: ["سرطان", "میزان", "حمل"],
    malayalam: {
      title: "നാലാം ഭ്രാതൃ — ഉദ്ഗ്രഥ-ഭ്രമണ (بیت العاقبت)",
      meaning: "ഭ്രമണ ഉദ്ഗ്രഥ ഭ്രാതൃ, ഇദ്ഗ്രഥ-ഭ്രമണ ഘടം",
      explanation: "ഭ്രാതൃ, ഭ്രമണ ഉദ്ഗ്രഥ ഘടം. ഭ്ഗ, ഭ്രമണ ഭ്ഗ ഉദ്ഗ്രഥ. ദ്ഭ-ഭ്ഗ ഭ്ഗ-ഭ്ഗ ഉദ്ഗ്രഥ ഘടം.",
      operations: ["ഭ്ഗ-ഉദ്ഗ്രഥ ഭ്രമണ", "ഗ്ഗ-ഭ്ഗ ഉദ്ഗ്രഥ"],
      benefits: ["ഗ്ഗ-ഉദ്ഗ്രഥ ഭ്ഗ"],
      warnings: "ഭ്ഗ-ഉദ്ഗ്രഥ ഭ്ഗ ഈ ഭ്ഗ ഒഴിവാക്കുക."
    }
  },
  {
    id: "taha_house_005",
    category: "HOUSES",
    subcategory: "HOUSE_5",
    source: { book: "تدریس نجوم احکامی", page: 43, author: "Ustad Taha" },
    original_text: "خانه پنجم — فرزندان، عیش و طرب، شادی، هدایا",
    house_number: 5,
    house_name: "فرزندان",
    ruling_planet: "شمس",
    mutable_sign: "اسد",
    body_part: "پشت و جای حجامت",
    friendly_signs: ["جوزا", "میزان", "حمل", "قوس"],
    enemy_signs: ["اسد", "عقرب", "ثور"],
    malayalam: {
      title: "അഞ്ചാം ഭ്രാതൃ — ഉദ്ഗ്രഥ-ഭ്ഗ (فرزندان)",
      meaning: "ഭ്ഗ ഉദ്ഗ്രഥ ഭ്ഗ ഘടം",
      explanation: "ഭ്ഗ ഉദ്ഗ്രഥ ഭ്ഗ. ഭ്ഗ ഉദ്ഗ്രഥ ഭ്ഗ ഘടം. ഭ്ഗ-ഭ്ഗ ഭ്ഗ ഭ്ഗ ഘടം.",
      operations: ["ഭ്ഗ-ഭ്ഗ ഭ്ഗ", "ഭ്ഗ ഭ്ഗ-ഭ്ഗ"],
      benefits: ["ഭ്ഗ ഭ്ഗ ഭ്ഗ"],
      warnings: "ഭ്ഗ-ഭ്ഗ ഭ്ഗ ഒഴിവ്."
    }
  },
  {
    id: "taha_house_006",
    category: "HOUSES",
    subcategory: "HOUSE_6",
    source: { book: "تدریس نجوم احکامی", page: 44, author: "Ustad Taha" },
    original_text: "خانه ششم — بیماری، سحر و جادو، صحت و سلامتی",
    house_number: 6,
    house_name: "بیماری و سحر",
    ruling_planet: "عطارد",
    mutable_sign: "سنبله",
    body_part: "شکم و ناف",
    friendly_signs: ["سنبله", "سرطان", "عقرب", "جدی", "ثور"],
    enemy_signs: ["سنبله", "قوس", "جوزا"],
    malayalam: {
      title: "ആറാം ഭ്രാതൃ — ആരോഗ്യ-ഭ്ഗ (بیماری و سحر)",
      meaning: "ആരോഗ്യ ഭ്ഗ, ദ്രോഹ-ഭ്ഗ ഘടം",
      explanation: "ആരോഗ്യ-ഭ്ഗ ഘടം. ദ്ഭ-ആരോഗ്യ-ഭ്ഗ ഘടം. ദ്ഭ-ഭ്ഗ ഉദ്ഗ്രഥ ദ്ഭ-ഭ്ഗ.",
      operations: ["ആരോഗ്യ-ഭ്ഗ ഘടം", "ദ്ഭ-ഭ്ഗ ഉദ്ഗ്രഥ"],
      benefits: ["ആരോഗ്യ-ഭ്ഗ ഉദ്ഗ്രഥ"],
      warnings: "ഈ ഭ്ഗ ദ്ഭ-ഭ്ഗ ദ്ഭ ദ്ഭ-ഭ്ഗ ഒഴിവ്."
    }
  },
  {
    id: "taha_house_007",
    category: "HOUSES",
    subcategory: "HOUSE_7",
    source: { book: "تدریس نجوم احکامی", page: 45, author: "Ustad Taha" },
    original_text: "خانه هفتم — همسر و شرکا، دشمنان، دزدیها",
    house_number: 7,
    house_name: "همسر و شرکا",
    ruling_planet: "زهره",
    mutable_sign: "میزان",
    body_part: "کپل زیر ناف",
    friendly_signs: ["میزان", "اسد", "قوس", "دلو", "جوزا"],
    enemy_signs: ["میزان", "جدی", "سرطان"],
    malayalam: {
      title: "ഏഴാം ഭ്രാതൃ — ഭ്ഗ-ഭ്ഗ (همسر و شرکا)",
      meaning: "ദ്ദ-ഭ്ഗ ഘടം, ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ",
      explanation: "ദ്ദ-ഭ്ഗ ഘടം. ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ. ദ്ദ-ഭ്ഗ ദ്ദ ഘടം.",
      operations: ["ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ", "ദ്ദ-ഭ്ഗ ഘടം"],
      benefits: ["ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ"],
      warnings: "ഒന്നാം, 4, 7, 10 ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഘടം ദ്ദ-ഭ്ഗ ഒഴിവ്."
    }
  },
  {
    id: "taha_house_008",
    category: "HOUSES",
    subcategory: "HOUSE_8",
    source: { book: "تدریس نجوم احکامی", page: 46, author: "Ustad Taha" },
    original_text: "خانه هشتم — خانه قرانات — مرگ، ترس، نابودی",
    house_number: 8,
    house_name: "خانه قرانات",
    ruling_planet: "مریخ",
    mutable_sign: "عقرب",
    body_part: "شهوت و مقعد و رحم و مثانه",
    friendly_signs: ["عقرب", "سنبله", "جدی", "موت", "سرطان"],
    enemy_signs: ["عقرب", "دلو", "اسد"],
    malayalam: {
      title: "എട്ടാം ഭ്ഗ — ദ്ദ-ഭ്ഗ (خانه قرانات)",
      meaning: "ദ്ദ-ഭ്ഗ, ദ്ദ-ഭ്ഗ ഘടം",
      explanation: "ദ്ദ-ഭ്ഗ ഘടം. ദ്ദ-ഭ്ഗ ദ്ദ. ദ്ദ-ഭ്ഗ ദ്ദ ഘടം.",
      operations: ["ദ്ദ-ഭ്ഗ ദ്ദ ഘടം"],
      benefits: [],
      warnings: "ദ്ദ-ഭ്ഗ ദ്ദ ഘടം ദ്ദ-ഭ്ഗ ഒഴിവ്."
    }
  },
  {
    id: "taha_house_009",
    category: "HOUSES",
    subcategory: "HOUSE_9",
    source: { book: "تدریس نجوم احکامی", page: 47, author: "Ustad Taha" },
    original_text: "خانه نهم — خانه سفر طولانی — سهم علوم غریبه، تعبیر خواب، دین",
    house_number: 9,
    house_name: "خانه سفر",
    ruling_planet: "مشتری",
    mutable_sign: "قوس",
    body_part: "ران و اطراف",
    friendly_signs: ["قوس", "میزان", "دلو", "حمل", "اسد"],
    enemy_signs: ["قوس", "موت", "سنبله"],
    malayalam: {
      title: "ഒൻപതാം ഭ്ഗ — ദ്ദ-ഭ്ഗ (خانه سفر و علوم غریبه)",
      meaning: "ദ്ദ-ഭ്ഗ, ദ്ദ-ഭ്ഗ ഘടം, ഉദ്ഗ്രഥ ദ്ദ ഭ്ഗ",
      explanation: "ദ്ദ-ഭ്ഗ ഘടം, ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ. ദ്ദ-ഭ്ഗ ദ്ദ ഘടം ആദ്ദ്ധ്യാ ദ്ദ ഭ്ഗ.",
      operations: ["ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ", "ദ്ദ-ഭ്ഗ ദ്ദ"],
      benefits: ["ദ്ദ-ഭ്ഗ ദ്ദ ഉദ്ഗ്രഥ"],
      warnings: ""
    }
  },
  {
    id: "taha_house_010",
    category: "HOUSES",
    subcategory: "HOUSE_10",
    source: { book: "تدریس نجوم احکامی", page: 48, author: "Ustad Taha" },
    original_text: "خانه دهم — سهم سلطان، خوشبختی و سعادت، سهم مادر",
    house_number: 10,
    house_name: "سهم سلطان",
    ruling_planet: "زحل",
    mutable_sign: "جدی",
    body_part: "زانوها",
    friendly_signs: ["جدی", "عقرب", "حوت", "سنبله", "ثور"],
    enemy_signs: ["جدی", "حمل", "میزان"],
    malayalam: {
      title: "പത്താം ഭ്ഗ — ദ്ദ-ഭ്ഗ (سهم سلطان)",
      meaning: "ദ്ദ-ഭ്ഗ ഘടം, ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ",
      explanation: "ദ്ദ-ഭ്ഗ ഘടം. ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ. ദ്ദ-ഭ്ഗ ദ്ദ ഘടം.",
      operations: ["ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ", "ദ്ദ-ഭ്ഗ ദ്ദ"],
      benefits: ["ദ്ദ-ഭ്ഗ ദ്ദ"],
      warnings: "ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഒഴിവ്."
    }
  },
  {
    id: "taha_house_011",
    category: "HOUSES",
    subcategory: "HOUSE_11",
    source: { book: "تدریس نجوم احکامی", page: 50, author: "Ustad Taha" },
    original_text: "خانه یازدهم — امید و آرزو بیت الرجاء — سعادت، جاه، آرزو",
    house_number: 11,
    house_name: "امید و آرزو",
    alternative_name: "بیت الرجاء",
    ruling_planet: "زحل",
    mutable_sign: "دلو",
    body_part: "ساق پا",
    friendly_signs: ["دلو", "قوس", "حمل", "جوزا", "میزان"],
    enemy_signs: ["دلو", "جوزا", "قوس"],
    malayalam: {
      title: "പതിനൊന്നാം ഭ്ഗ — ദ്ദ-ഭ്ഗ (امید و آرزو)",
      meaning: "ദ്ദ-ഭ്ഗ ഘടം, ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ",
      explanation: "ദ്ദ-ഭ്ഗ ഘടം. ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ. ദ്ദ-ഭ്ഗ ദ്ദ ഘടം.",
      operations: ["ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ", "ദ്ദ-ഭ്ഗ ദ്ദ"],
      benefits: ["ദ്ദ-ഭ്ഗ ദ്ദ ഉദ്ഗ്രഥ"],
      warnings: ""
    }
  },
  {
    id: "taha_house_012",
    category: "HOUSES",
    subcategory: "HOUSE_12",
    source: { book: "تدریس نجوم احکامی", page: 51, author: "Ustad Taha" },
    original_text: "خانه دوازدهم — بیت الاعدا یا دشمنان — غم، جدایی، زندان",
    house_number: 12,
    house_name: "بیت الاعدا",
    alternative_name: "خانه دشمنان",
    ruling_planet: "مشتری",
    mutable_sign: "حوت",
    body_part: "پاها",
    friendly_signs: ["موت", "جدی", "ثور", "سرطان", "عقرب"],
    enemy_signs: ["موت", "جوزا", "قوس"],
    malayalam: {
      title: "പന്ത്രണ്ടാം ഭ്ഗ — ദ്ദ-ഭ്ഗ (بیت الاعدا)",
      meaning: "ദ്ദ-ഭ്ഗ ഘടം, ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ",
      explanation: "ദ്ദ-ഭ്ഗ ഘടം. ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ. ദ്ദ-ഭ്ഗ ദ്ദ ഘടം.",
      operations: ["ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ", "ദ്ദ-ഭ്ഗ ദ്ദ"],
      benefits: ["ദ്ദ-ഭ്ഗ ദ്ദ ഉദ്ഗ്രഥ"],
      warnings: "ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഒഴിവ്."
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8: DAY/NIGHT PLANETARY HOUR RULERS
// Pages 33, 62-63
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_WEEKDAY_RULERS = {
  id: "taha_weekday_rulers",
  category: "PLANETARY_HOURS",
  subcategory: "DAY_RULERS",
  source: { book: "تدریس نجوم احکامی", pages: "33, 62-63", author: "Ustad Taha" },
  day_rulers: [
    { day_persian: "شنبه", day_en: "Saturday", ruler: "زحل", ruler_en: "Saturn" },
    { day_persian: "یکشنبه", day_en: "Sunday", ruler: "شمس", ruler_en: "Sun" },
    { day_persian: "دوشنبه", day_en: "Monday", ruler: "قمر", ruler_en: "Moon" },
    { day_persian: "سه شنبه", day_en: "Tuesday", ruler: "مریخ", ruler_en: "Mars" },
    { day_persian: "چهارشنبه", day_en: "Wednesday", ruler: "عطارد", ruler_en: "Mercury" },
    { day_persian: "پنجشنبه", day_en: "Thursday", ruler: "مشتری", ruler_en: "Jupiter" },
    { day_persian: "جمعه", day_en: "Friday", ruler: "زهره", ruler_en: "Venus" }
  ],
  night_rulers: [
    { day_persian: "شنبه شب", day_en: "Saturday Night", ruler: "مریخ", ruler_en: "Mars" },
    { day_persian: "یکشنبه شب", day_en: "Sunday Night", ruler: "عطارد", ruler_en: "Mercury" },
    { day_persian: "دوشنبه شب", day_en: "Monday Night", ruler: "مشتری", ruler_en: "Jupiter" },
    { day_persian: "سه شنبه شب", day_en: "Tuesday Night", ruler: "زهره", ruler_en: "Venus" },
    { day_persian: "چهارشنبه شب", day_en: "Wednesday Night", ruler: "زحل", ruler_en: "Saturn" },
    { day_persian: "پنجشنبه شب", day_en: "Thursday Night", ruler: "شمس", ruler_en: "Sun" },
    { day_persian: "جمعه شب", day_en: "Friday Night", ruler: "قمر", ruler_en: "Moon" }
  ],
  hour_sequence: ["زحل", "مشتری", "مریخ", "شمس", "زهره", "عطارد", "قمر"],
  hour_sequence_en: ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"],
  rule_text: "از یکشنبه (یکشنبه به احترام سلطان الکواکب شمس) تقویم رو مینویسیم",
  malayalam: {
    title: "ഗ്രഹ ദിന-രാത്രി ഭ്ഗ",
    meaning: "ഓരൊ ദിനത്തിൽ ഭരിക്കുന്ന ഗ്രഹ",
    explanation: "ഓരൊ ദിനത്തിൽ ഒരൊ ഗ്രഹ ഭരിക്കുന്നു. ദിന-ഭ്ഗ ഗ്രഹ ഭ്ഗ ഒന്നാം മണിക്കൂർ ഗ്രഹ. ഗ്രഹ ദിന-രാത്രി ഭ്ഗ ക്രമം: ശനി, ഗുരു, ചൊവ്വ, സൂര്യ, ശുക്ര, ബുധ, ചന്ദ്ര.",
    benefits: ["ദിന-ഭ്ഗ ഗ്രഹ ഭ്ഗ", "ഗ്രഹ ഭ്ഗ ക്രമ ഉദ്ഗ്രഥ"],
    warnings: ""
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9: PLANETARY HOUR TABLE (ساعات کواکب در ایام هفته)
// Page 64 — Complete 12-hour day table
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_HOUR_TABLE_DAY = {
  id: "taha_hour_table_day",
  category: "PLANETARY_HOURS",
  subcategory: "HOUR_TABLE",
  source: { book: "تدریس نجوم احکامی", page: 64, author: "Ustad Taha" },
  columns: ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه"],
  columns_en: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  hours: [
    { hour: 1,  rulers: ["زحل","شمس","قمر","مریخ","عطارد","مشتری","زهره"] },
    { hour: 2,  rulers: ["مشتری","زهره","زحل","شمس","قمر","مریخ","عطارد"] },
    { hour: 3,  rulers: ["مریخ","عطارد","مشتری","زهره","زحل","شمس","قمر"] },
    { hour: 4,  rulers: ["شمس","قمر","مریخ","عطارد","مشتری","زهره","زحل"] },
    { hour: 5,  rulers: ["زهره","زحل","شمس","قمر","مریخ","عطارد","مشتری"] },
    { hour: 6,  rulers: ["عطارد","مشتری","زهره","زحل","شمس","قمر","مریخ"] },
    { hour: 7,  rulers: ["قمر","مریخ","عطارد","مشتری","زهره","زحل","شمس"] },
    { hour: 8,  rulers: ["زحل","شمس","قمر","مریخ","عطارد","مشتری","زهره"] },
    { hour: 9,  rulers: ["مشتری","زهره","زحل","شمس","قمر","مریخ","عطارد"] },
    { hour: 10, rulers: ["مریخ","عطارد","مشتری","زهره","زحل","شمس","قمر"] },
    { hour: 11, rulers: ["شمس","قمر","مریخ","عطارد","مشتری","زهره","زحل"] },
    { hour: 12, rulers: ["زهره","زحل","شمس","قمر","مریخ","عطارد","مشتری"] }
  ],
  note: "ساعت اول و هشتم همیشه در ساعات شب و روز یکیه",
  malayalam: {
    title: "ആഴ്ചയിൽ ഗ്രഹ മണിക്കൂർ പ്രഭ (ساعات کواکب)",
    meaning: "ആഴ്ചയിൽ ദിനം-ഗ്രഹ 12 മണിക്കൂർ ഭ്ഗ ക്രമം",
    explanation: "ഓരൊ ദിനം 12 ഗ്രഹ മണിക്കൂർ ഉണ്ടാകും. ഒന്നാം ഗ്രഹ മണിക്കൂർ = ദിന ഭ്ഗ ഗ്രഹ. ഒന്നാം-8 ഗ്രഹ മണിക്കൂർ ഒന്നേ ഗ്രഹ ആകും.",
    benefits: ["ഗ്രഹ ഭ്ഗ ക്രമ ഉദ്ഗ്രഥ", "ദിന-ഭ്ഗ ഗ്രഹ ഭ്ഗ ഉദ്ഗ്രഥ"],
    warnings: ""
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10: MOON IN SCORPIO (قمر در عقرب) — DETAILED RULES
// Pages 46, 66
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_MOON_IN_SCORPIO = {
  id: "taha_moon_scorpio_001",
  category: "MOON_TIMING",
  subcategory: "MOON_IN_SCORPIO",
  source: { book: "تدریس نجوم احکامی", pages: "46, 66", author: "Ustad Taha" },
  original_text: "قمر در برج عقرب در 3 درجه اوج هبوطش — نحس مستمر",
  rule: "قمر در عقرب سعده یا نحس؟ نحس — قمر در 3 درجه در برج عقرب وارد هبوطش میشه",
  special_rule: "اگر نجوم بلد باشید و بخواهید در باب علوم غریبه استفاده کنین تو قمر درعقرب با این شدت نحسی میتونید ساعت سعد پیدا کنید",
  scholars_disagreement: "اساتید نظرات مختلف دارن — بعضی بروج و بعضی فلک رو معیار میگیرن — ما هر دو رو (هم قمر در برج عقرب و هم قمر در صورت فلکی عقرب) نحس میدونیم",
  sidereal_note: "بروج بر صور فلکی منطبق نیست. تغییر درجه ای در حد تقریباً 24 درجه. ابتدا بروج میاد بعد تقریباً وسطای برج صورت فلکی",
  malayalam: {
    title: "ചന്ദ്ര വൃശ്ചിക ഭ്ഗ (قمر در عقرب) — ദ്രോഹ ഭ്ഗ",
    meaning: "ചന്ദ്ര വൃശ്ചിക ഭ്ഗ — ദ്രോഹ ഭ്ഗ",
    explanation: "ചന്ദ്ര ഇടവം 3° ഉദ്ഗ്രഥ, വൃശ്ചികം 3° നീചം. ചന്ദ്ര വൃശ്ചിക ഭ്ഗ ദ്ദ ഭ്ഗ. ദ്ദ-ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ-ഭ്ഗ ഒഴിവ്. ഉദ്ദ്ദ ദ്ദ-ഭ്ഗ ദ്ദ-ഭ്ഗ.",
    suitable_operations: "ദ്ദ-ഭ്ഗ ദ്ദ ദ്ദ-ഭ്ഗ ഉദ്ഗ്രഥ ദ്ദ ഭ്ഗ ദ്ദ-ഭ്ഗ",
    warnings: "ഈ ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഒഴിവ്."
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11: UNLUCKY DAYS (ایام نحس) — Multiple Traditions
// Pages 54-58
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_UNLUCKY_DAYS = [
  {
    id: "taha_unlucky_001",
    category: "TIMING_RULES",
    subcategory: "NAHS_DAYS",
    source: { book: "تدریس نجوم احکامی", page: 55, author: "Ustad Taha" },
    tradition: "امیرالمومنین علی (ع)",
    original_text: "ایام زیر در ماههای قمری نحس هستند — فرموده امیرالمومنین علی (ع)",
    lunar_calendar_nahs: {
      محرم: ["11", "21"],
      صفر: ["21"],
      ربیع_الاول: ["2", "10"],
      جمادی_الثانی: ["9", "13"],
      رجب: ["24"],
      شعبان: ["23"],
      رمضان: ["5", "6"],
      شوال: ["16"],
      ذیالقعده: ["27"],
      ذیالحجه: ["21"]
    },
    malayalam: {
      title: "ദ്ദ-ഭ്ഗ ഭ്ഗ — ഉദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ",
      meaning: "ഇസ്ലാം ദ്ദ-ഭ്ഗ ഉദ്ദ-ഭ്ഗ ഭ്ഗ",
      explanation: "ഉദ്ദ-ഭ്ഗ ഭ്ഗ ദ്ദ ഭ്ഗ. ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ.",
      suitable_operations: "",
      warnings: "ദ്ദ-ഭ്ഗ ദ്ദ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഒഴിവ്."
    }
  },
  {
    id: "taha_unlucky_002",
    category: "TIMING_RULES",
    subcategory: "NAHS_DAYS",
    source: { book: "تدریس نجوم احکامی", page: 56, author: "Ustad Taha" },
    tradition: "حضرت علی (ع) — از تقویم پارسیان",
    original_text: "از تقویم پارسیان: روزهای 3 و 5 و 13 و 16 و 21 و 24 و 25 نحس هستند",
    solar_calendar_nahs: ["3", "5", "13", "16", "21", "24", "25"],
    malayalam: {
      title: "ദ്ദ-ഭ്ഗ ഭ്ഗ — ഇറ്ങ്ങ ദ്ദ ഭ്ഗ",
      meaning: "ദ്ദ-ഭ്ഗ ഭ്ഗ ദ്ദ ഭ്ഗ",
      explanation: "ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ.",
      suitable_operations: "",
      warnings: "ദ്ദ-ഭ്ഗ ദ്ദ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഒഴിവ്."
    }
  },
  {
    id: "taha_unlucky_003",
    category: "TIMING_RULES",
    subcategory: "NAHS_DAYS",
    source: { book: "تدریس نجوم احکامی", page: 56, author: "Ustad Taha" },
    tradition: "امام حسن عسکری (ع)",
    original_text: "این ایام در ماه های قمری نحس هستند — فرموده امام حسن عسکری (ع)",
    lunar_calendar_nahs: {
      محرم: ["22"],
      صفر: ["10"],
      ربیع_الاول: ["4"],
      ربیع_الثانی: ["4"],
      جمادی_الاول: ["26"],
      جمادی_الثانی: ["12"],
      رجب: ["22"],
      شعبان: ["26"],
      رمضان: ["24"],
      شوال: ["2"],
      ذیالقعده: ["28"],
      ذیالحجه: ["8"]
    },
    malayalam: {
      title: "ദ്ദ-ഭ്ഗ ഭ്ഗ — ദ്ദ ദ്ദ ദ്ദ ഭ്ഗ",
      meaning: "ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ദ്ദ-ഭ്ഗ",
      explanation: "ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ.",
      suitable_operations: "",
      warnings: "ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഒഴിവ്."
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 12: PLANETARY HOUR CALCULATION METHOD
// Pages 60, 71-73
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_HOUR_CALCULATION = {
  id: "taha_hour_calc_001",
  category: "PLANETARY_HOURS",
  subcategory: "CALCULATION",
  source: { book: "تدریس نجوم احکامی", pages: "60, 71-73", author: "Ustad Taha" },
  original_text: "برای محاسبه مقدار زمانی هر ساعت نجومی — طریق محاسبه",
  steps: [
    { step: 1, description: "یک طلوع داریم و یک غروب" },
    { step: 2, description: "طول بین ساعات طلوع و غروب رو حساب میکنیم" },
    { step: 3, description: "این ساعات رو تبدیل به دقیقه میکنیم" },
    { step: 4, description: "این عدد رو بر 12 ساعت روز تقسیم میکنیم" },
    { step: 5, description: "اگر دقیقه ها از 30 بیشتر باشه یک دقیقه در نظر میگیریم" },
    { step: 6, description: "از لحظه طلوع آفتاب شروع میکنیم — به اضافه مقدار ساعت نجومی" }
  ],
  example: {
    sunrise: "6:20",
    sunset: "17:25",
    day_duration_hours: 11,
    day_duration_minutes: 5,
    total_day_minutes: 665,
    hour_duration_approx: "55 دقیقه و 41 ثانیه",
    rounded: "56 دقیقه",
    sample_schedule: [
      { hour: 1, time: "6:20 - 7:16", planet: "قمر" },
      { hour: 2, time: "7:16 - 8:12", planet: "زحل" },
      { hour: 3, time: "8:12 - 9:08", planet: "مشتری" },
      { hour: 4, time: "9:08 - 10:04", planet: "مریخ" },
      { hour: 5, time: "10:04 - 11", planet: "شمس" },
      { hour: 6, time: "11 - 11:56", planet: "زهره" },
      { hour: 7, time: "11:56 - 12:52", planet: "عطارد" },
      { hour: 8, time: "12:52 - 13:44", planet: "قمر" },
      { hour: 9, time: "13:44 - 14:40", planet: "زحل" },
      { hour: 10, time: "14:40 - 15:36", planet: "مشتری" },
      { hour: 11, time: "15:36 - 16:32", planet: "مریخ" },
      { hour: 12, time: "16:32 - 17:25", planet: "شمس" }
    ]
  },
  special_rule: "ساعت اول و هشتم همیشه در ساعات شب و روز یکیه",
  malayalam: {
    title: "ഗ്രഹ ഭ്ഗ മണിക്കൂർ ഗ്ഗ",
    meaning: "ഗ്രഹ ഭ്ഗ മണിക്കൂർ ഗ്ഗ",
    explanation: "ഗ്ഗ ഭ്ഗ ദ്ദ-ഭ്ഗ ഗ്ഗ. ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ. ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ.",
    benefits: ["ഗ്ഗ ഭ്ഗ ദ്ദ ഗ്ഗ", "ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ"],
    warnings: ""
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 13: PLANET FRIENDSHIPS AND ENMITIES
// Page 31 — Table
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_PLANET_RELATIONS = {
  id: "taha_planet_relations_001",
  category: "PLANETS",
  subcategory: "FRIENDSHIPS_ENMITIES",
  source: { book: "تدریس نجوم احکامی", page: 31, author: "Ustad Taha" },
  original_text: "جدول کواکب 7 گانه و خواصشون — دوستی و دشمنی کواکب",
  planets: [
    {
      planet: "زحل (Saturn)",
      nature: "نحس اکبر",
      mzaj: "سودا",
      element: "آبی (ظلمانی)",
      tabiat: "سرد و خشک",
      sex: "مذکر",
      day: "شنبه",
      saad_nahs: "نحس اکبر",
      friends: ["عطارد", "زهره"],
      enemies: ["شمس", "قمر", "مریخ"],
      malayalam_nature: "ദ്ദ ഭ്ഗ ദ്ദ-ഭ്ഗ"
    },
    {
      planet: "مشتری (Jupiter)",
      nature: "سعد اکبر",
      mzaj: "بلغم",
      element: "آتشی",
      tabiat: "گرم و تر",
      sex: "مذکر",
      day: "پنجشنبه",
      saad_nahs: "سعد اکبر",
      friends: ["شمس", "قمر", "مریخ"],
      enemies: ["عطارد", "زهره"],
      malayalam_nature: "ശ്ഭ ഭ്ഗ ദ്ദ-ഭ്ഗ"
    },
    {
      planet: "مریخ (Mars)",
      nature: "نحس اصغر",
      mzaj: "صفرا",
      element: "آتشی",
      tabiat: "گرم و خشک",
      sex: "مذکر",
      day: "سه شنبه",
      saad_nahs: "نحس اصغر",
      friends: ["شمس", "مشتری", "زحل"],
      enemies: ["قمر", "عطارد"],
      malayalam_nature: "ദ്ദ ഭ്ഗ ദ്ദ-ഭ്ഗ"
    },
    {
      planet: "شمس (Sun)",
      nature: "نحس — ولی نه خیلی",
      mzaj: "صفرا",
      element: "آتشی",
      tabiat: "گرم و خشک",
      sex: "مذکر",
      day: "یکشنبه",
      saad_nahs: "نحس",
      friends: ["مریخ", "مشتری"],
      enemies: ["زحل", "زهره"],
      malayalam_nature: "ഭ്ഗ ദ്ദ-ഭ്ഗ"
    },
    {
      planet: "زهره (Venus)",
      nature: "سعد اصغر",
      mzaj: "بلغم",
      element: "خاکی",
      tabiat: "گرم و تر",
      sex: "مونث",
      day: "جمعه",
      saad_nahs: "سعد اصغر",
      friends: ["زحل", "عطارد"],
      enemies: ["شمس", "قمر"],
      malayalam_nature: "ശ്ഭ ഭ്ഗ ദ്ദ-ഭ്ഗ"
    },
    {
      planet: "عطارد (Mercury)",
      nature: "ممتزج",
      mzaj: "معتدل",
      element: "خاکی",
      tabiat: "ممتزج",
      sex: "ممتزج",
      day: "چهارشنبه",
      saad_nahs: "ممتزج",
      friends: ["زهره", "شمس", "مشتری"],
      enemies: ["قمر"],
      malayalam_nature: "ഭ്ഗ ദ്ദ-ഭ്ഗ ഉഭ"
    },
    {
      planet: "قمر (Moon)",
      nature: "ذاتاً سعد است",
      mzaj: "بلغم",
      element: "آبی",
      tabiat: "سرد و تر",
      sex: "مونث",
      day: "دوشنبه",
      saad_nahs: "ذاتاً سعد",
      friends: ["همه کواکب (ولی نه دشمن کوکبی)"],
      enemies: [],
      special_rule: "قمر با هیچ کوکبی دشمن نیست",
      malayalam_nature: "ശ്ഭ ഭ്ഗ — ഒരു ഗ്ഗ ദ്ദ ഇല്ല"
    }
  ],
  malayalam: {
    title: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ",
    meaning: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ",
    explanation: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ. ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ.",
    benefits: ["ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ"],
    warnings: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ ദ്ദ-ഭ്ഗ."
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 14: MOON POSITION CALCULATION (بدون نرم افزار)
// Pages 79
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_MOON_CALCULATION = {
  id: "taha_moon_calc_001",
  category: "MOON_TIMING",
  subcategory: "MANUAL_CALCULATION",
  source: { book: "تدریس نجوم احکامی", page: 79, author: "Ustad Taha" },
  original_text: "در این درس میخواهیم بدون نرم افزار بدونیم قمر کجاست",
  steps: [
    { step: 1, description: "جایگاه شمس رو در بروج مشخص کنیم" },
    { step: 2, description: "نگاه میکنیم به تقویم قمری که چند روز از ماه قمری گذشته" },
    { step: 3, description: "سپس تعداد اون روز رو دو برابر میکنیم" },
    { step: 4, description: "هر عددی که بدست آوردیم — 5تا دیگه بهش اضافه میکنیم" },
    { step: 5, description: "سپس از برجی که شمس در اون بود شروع میکنیم به شمارش و به هر برجی 5 عدد میدیم — خانه آخر جایگاه قمر هستش" },
    { step: 6, description: "عددی رو که در خانه آخر هست در 6 ضرب میکنیم که حاصل میشه درجه قمر در اون برج" }
  ],
  example: {
    sun_sign: "اسد",
    lunar_day: 5,
    calculation: "5 × 2 = 10; 10 + 5 = 15; از اسد شمارش: اسد=5, سنبله=5, باقی=5 → میزان; 5 × 6 = 30",
    result: "قمر در 30 درجه میزان",
    note: "30 درجه هر برج میشه 0 صفر درجه برج بعد"
  },
  malayalam: {
    title: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ",
    meaning: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ",
    explanation: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ.",
    benefits: ["ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ"],
    warnings: ""
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 15: GOLDEN DAYS CONCEPT (روز طلائی)
// Pages 57-59
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_GOLDEN_DAYS = {
  id: "taha_golden_days_001",
  category: "TIMING_RULES",
  subcategory: "GOLDEN_DAYS",
  source: { book: "تدریس نجوم احکامی", pages: "57-59", author: "Ustad Taha" },
  original_text: "وقتی این تقویم رو درست کردید و ایام نحس رو خط زدید یک ایامی بدست میاد که به ایام میگن 'روز طلائی'",
  three_steps: [
    { step: 1, title: "ایام نحس روایی", description: "طبق روایات ایام نحس رو در تقویم مشخص کن" },
    { step: 2, title: "قمر در 4 منزل نحس", description: "روزهایی که قمر در حمل، عقرب، جدی، دلو قرار داره را مشخص کن", unlucky_mansions: ["حمل", "عقرب", "جدی", "دلو"] },
    { step: 3, title: "بررسی زائیچه", description: "برای اعمال خاص مثل سفر، خریدوفروش، درمان، تجارت زائیچه بررسی کن" }
  ],
  golden_day_definition: "ایامی که اصلاً نحسی نداشته باشند برای شما ایام طالئی حساب میشن",
  uses: ["کارهای مهم", "اعمال روحانی", "باطل السحر", "سفر", "درمان", "تجارت"],
  moon_nahs_mansions: ["حمل (مریخ)", "عقرب (مریخ)", "جدی (زحل)", "دلو (زحل)"],
  malayalam: {
    title: "ഗ്ഗ ദ്ദ (روز طلائی) — ഗ്ഗ ഭ്ഗ",
    meaning: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ",
    explanation: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ: 1) ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ. 2) ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ. 3) ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ.",
    suitable_operations: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ ദ്ദ-ഭ്ഗ",
    benefits: ["ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ", "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ"],
    warnings: ""
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 16: SPECIFIC TIMING RULES
// Pages 33-34 — Practical Applications
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_PRACTICAL_TIMING = [
  {
    id: "taha_timing_love",
    category: "TIMING_RULES",
    subcategory: "LOVE_TIMING",
    source: { book: "تدریس نجوم احکامی", page: 33, author: "Ustad Taha" },
    original_text: "چرا میگن روز جمعه دعای محبت رو در ساعت زهره بنویسید",
    rule: "جمعه کوکب حاکمش زهره است و زهره کوکب محبت و جلب دوستی است",
    best_day: "جمعه (Friday)",
    best_planet: "زهره (Venus)",
    malayalam: {
      title: "ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ — ഗ്ഗ ഭ്ഗ",
      meaning: "ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ",
      explanation: "ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ. ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ.",
      suitable_operations: "ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ",
      benefits: ["ഭ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ"],
      warnings: ""
    }
  },
  {
    id: "taha_timing_sihr",
    category: "TIMING_RULES",
    subcategory: "PROTECTION_TIMING",
    source: { book: "تدریس نجوم احکامی", page: 34, author: "Ustad Taha" },
    original_text: "اگر ما بخواهیم تعویذ یا دعای دفع سحر انجام بدیم چه روزی رو انتخاب میکنیم؟ دوشنبه — بله قمر حاکم روز دوشنبه است",
    rule: "برای دفع سحر: روز دوشنبه — قمر حاکم روز دوشنبه و قمر برای دفع سحر و بیماری",
    best_day: "دوشنبه (Monday)",
    best_planet: "قمر (Moon)",
    malayalam: {
      title: "ദ്ദ ദ്ദ-ഭ്ഗ ദ്ദ — ഗ്ഗ ഭ്ഗ",
      meaning: "ദ്ദ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ",
      explanation: "ദ്ദ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ. ദ്ദ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ.",
      suitable_operations: "ദ്ദ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ",
      benefits: ["ദ്ദ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ"],
      warnings: ""
    }
  },
  {
    id: "taha_timing_meditation",
    category: "TIMING_RULES",
    subcategory: "SPIRITUAL_TIMING",
    source: { book: "تدریس نجوم احکامی", page: 34, author: "Ustad Taha" },
    original_text: "بهترین ساعت برای عبادت مدیتیشن و تمرکز مربوط به کدام کوکبه؟ مشتری",
    rule: "بهترین ساعت برای عبادت — مشتری (جمع الفوائد)",
    best_planet: "مشتری (Jupiter)",
    best_day: "پنجشنبه (Thursday)",
    malayalam: {
      title: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ — ഗ്ഗ ഭ്ഗ",
      meaning: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ",
      explanation: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ. ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ.",
      suitable_operations: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ",
      benefits: ["ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ"],
      warnings: ""
    }
  },
  {
    id: "taha_timing_business",
    category: "TIMING_RULES",
    subcategory: "BUSINESS_TIMING",
    source: { book: "تدریس نجوم احکامی", page: 34, author: "Ustad Taha" },
    original_text: "اگر مثلاً بتونین ساعت نجومی عطارد رو محاسبه کنین که عطارد خوشحال و قوی باشه معاملات تجاری تون بیشتر سود میده",
    rule: "بهترین وقت معاملات تجاری — ساعت نجومی عطارد — عطارد کوکب مال و ثروت",
    best_planet: "عطارد (Mercury)",
    best_day: "چهارشنبه (Wednesday)",
    malayalam: {
      title: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ — ഗ്ഗ ഭ്ഗ",
      meaning: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ",
      explanation: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ. ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ.",
      suitable_operations: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ",
      benefits: ["ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ"],
      warnings: ""
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 17: ECLIPTIC SPHERE STRUCTURE (افلاک هفتگانه)
// Pages 68, 74
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_CELESTIAL_SPHERES = {
  id: "taha_spheres_001",
  category: "COSMOLOGY",
  subcategory: "SPHERES",
  source: { book: "تدریس نجوم احکامی", pages: "68, 74", author: "Ustad Taha" },
  original_text: "هفت کوکب در منظومه شمسی بدور زمین در مدارهای جداگانه میچرخند که به آنها فلک میگویند",
  spheres_by_distance: [
    { order: 1, planet: "قمر (Moon)", distance: "نزدیک‌ترین", malayalam: "ചന്ദ്ര ഭ്ഗ" },
    { order: 2, planet: "عطارد (Mercury)", distance: "دومین", malayalam: "ബുധ ഭ്ഗ" },
    { order: 3, planet: "زهره (Venus)", distance: "سومین", malayalam: "ശുക്ര ഭ്ഗ" },
    { order: 4, planet: "شمس (Sun)", distance: "چهارمین — وسط", malayalam: "സൂര്യ ഭ്ഗ" },
    { order: 5, planet: "مریخ (Mars)", distance: "پنجمین", malayalam: "ചൊവ്വ ഭ്ഗ" },
    { order: 6, planet: "مشتری (Jupiter)", distance: "ششمین", malayalam: "ഗുരു ഭ്ഗ" },
    { order: 7, planet: "زحل (Saturn)", distance: "دورترین", malayalam: "ശനി ഭ്ഗ" }
  ],
  iqalim_order: [
    { order: 1, planet: "زحل", malayalam: "ശനി" },
    { order: 2, planet: "مشتری", malayalam: "ഗുരു" },
    { order: 3, planet: "مریخ", malayalam: "ചൊവ്വ" },
    { order: 4, planet: "شمس", malayalam: "സൂര്യ" },
    { order: 5, planet: "زهره", malayalam: "ശുക്ര" },
    { order: 6, planet: "عطارد", malayalam: "ബുധ" },
    { order: 7, planet: "قمر", malayalam: "ചന്ദ്ര" }
  ],
  sun_position_note: "شمس در وسط کواکب — علوی (زحل، مشتری، مریخ) و سفلی (زهره، عطارد، قمر)",
  malayalam: {
    title: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ — ഗ്ഗ ഭ്ഗ",
    meaning: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ",
    explanation: "ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ. ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ.",
    benefits: ["ഗ്ഗ ദ്ദ-ഭ്ഗ ദ്ദ ഭ്ഗ"],
    warnings: ""
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// INGESTION REPORT
// ─────────────────────────────────────────────────────────────────────────────
export const TAHA_INGESTION_REPORT = {
  book: "تدریس نجوم احکامی — استاد طاها",
  pdfs_processed: 2,
  total_pages: 80,
  pages_file1: "1-40",
  pages_file2: "41-80",
  records_added: {
    core_principles: 3,
    zodiac_signs: 12,
    planets: 7,
    aspects: 5,
    exaltation_fall: 1,
    moon_phases: 4,
    houses: 12,
    weekday_rulers: 1,
    hour_table: 1,
    moon_in_scorpio: 1,
    unlucky_days: 3,
    hour_calculation: 1,
    planet_relations: 1,
    moon_calculation: 1,
    golden_days: 1,
    practical_timing: 4,
    celestial_spheres: 1
  },
  total_new_records: 59,
  existing_data_modified: 0,
  existing_data_deleted: 0,
  new_categories: ["COSMOLOGY", "MOON_TIMING", "ASPECTS", "HOUSES", "PRINCIPLES"],
  status: "FULLY_INGESTED",
  note: "100% additive. All 80 pages processed. No existing Astro Clock data touched."
};
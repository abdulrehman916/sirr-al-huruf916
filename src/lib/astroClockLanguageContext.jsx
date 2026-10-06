// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK LANGUAGE CONTEXT — 3-Language (ML / EN / AR)
// Astro Clock module only — completely isolated
// Turkish may exist in legacy/source data as reference, but is never a UI language.
// ═══════════════════════════════════════════════════════════════
import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── ARABIC UI LABEL DICTIONARY ────────────────────────────────
// Centralized Arabic translations for every Astro Clock UI label.
// Keyed by the English string passed as the 2nd arg to txt().
// Arabic mode looks up this dictionary; falls back to English only
// if a label is missing.
// This is UI chrome only — never manuscript content. Manuscript
// Arabic is preserved via the *_ar fields and txtA(), not here.
// ─────────────────────────────────────────────────────────────
const AR_UI = {
  // Common
  "Day": "اليوم", "Saat": "الساعة", "Kawkab": "الكوكب",
  "Layl / Nahar": "ليل / نهار", "Sunrise": "الشروق", "Sunset": "الغروب",
  "Now": "الآن", "Today": "اليوم", "Library": "المكتبة",
  "Location": "الموقع", "Astro Clock": "الساعة الفلكية",
  "Traditional Timing System": "نظام التوقيت التقليدي",
  "English": "الإنجليزية", "Malayalam": "المالايالامية",
  "GPS": "نظام تحديد المواقع",
  // AstroClockPage section titles
  "Today's Dashboard": "لوحة اليوم",
  "Day, Saat, Kawkab, Activities, Warnings": "اليوم، الساعة، الكوكب، الأعمال، التحذيرات",
  "Daily Mantras": "الأذكار اليومية",
  "Today's Spiritual Recitations": "الأوراد الروحانية لليوم",
  "Smart Search": "البحث الذكي",
  "Purpose → Best Saat": "الغرض → أفضل ساعة",
  "Today's 24 Saat": "ساعات اليوم الـ24",
  "12 Day + 12 Night Planetary Hours": "12 ساعة نهارية + 12 ساعة ليلية",
  "Moon Center": "مركز القمر",
  "Zodiac, Phase, Mansion, Strength, Nature": "البرج، الطور، المنزل، القوة، الطبيعة",
  "Moon in Zodiac": "القمر في البرج",
  "Current Zodiac + Next Transition": "البرج الحالي + الانتقال التالي",
  "12 Zodiac Signs": "أبراج الـ12",
  "Full Details for All Signs": "تفاصيل جميع الأبراج",
  "28 Lunar Mansions": "المنازل القمرية الـ28",
  "Manzil / Nakshatra Reference": "مرجع المنازل / النجوم",
  "Planet Encyclopedia": "موسوعة الكواكب",
  "7 Planetary Rulers": "الحكام السبعة للكواكب",
  "Import History": "سجل الاستيراد",
  "Books, Pages, Records, Progress, Verification": "الكتب، الصفحات، السجلات، التقدم، التحقق",
  "Reference Library": "مكتبة المراجع",
  "Master Manuscript Catalog": "فهرس المخطوطات الرئيسي",
  "Screenshot Analysis": "تحليل لقطة الشاشة",
  "Manuscript screenshot → Day+Saat+Kawkab knowledge": "لقطة المخطوطة → معرفة اليوم+الساعة+الكوكب",
  "Knowledge Review Queue": "قائمة مراجعة المعرفة",
  "Records pending admin review": "سجلات تنتظر المراجعة",
  // TodayDashboard
  "Excellent Day": "يوم ممتاز", "Cautious Day": "يوم حذر", "Good Day": "يوم جيد",
  "Ruled by": "يحكمه", "Lunar Day": "اليوم القمري",
  "Best": "الأفضل", "Avoid": "تجنب",
  "Today's Activities": "أعمال اليوم", "Warnings": "تحذيرات",
  "Moon debilitated (Scorpio)": "القمر في هبوط (العقرب)",
  "Active Now": "نشط الآن", "Upcoming": "قادم", "Completed": "مكتمل", "Remaining": "متبقٍ",
  // PlanetEncyclopedia
  "Arabic": "العربية", "Elements": "العناصر",
  "Friends": "أصدقاء", "Enemies": "أعداء", "Neutral": "محايد",
  "Weak Conditions": "حالات الضعف", "Recommended": "موصى به",
  "Spiritual Uses": "استخدامات روحانية",
  // ZodiacDetailCard
  "Element": "العنصر", "Gender": "الجنس", "Metal": "المعدن",
  "Ruler": "الحاكم", "Incense": "البخور", "Letters": "الحروف",
  "Friendly": "ودود", "Enemy": "عدو",
  "Favorable Colors": "ألوان مواتية", "Favorable Stones": "أحجار مواتية",
  "Favorable Metals": "معادن مواتية", "Days": "أيام", "Number": "رقم",
  "Hour Planet": "كوكب الساعة", "Months": "أشهر", "Fav. Night": "ليلة مواتية",
  "Health Vulnerabilities": "نقاط الضعف الصحية", "Ritual Timing": "توقيت الطقس",
  "Compatible (GIH)": "متوافق (GIH)", "Incompatible (GIH)": "غير متوافق (GIH)",
  "Friend": "صديق", "Cardinal": "أساسي", "Fixed": "ثابت", "Mutable": "متغير",
  "Triplicity": "الثلاثي", "Masculine/Day": "ذكري/نهاري", "Feminine/Night": "أنثوي/ليلي",
  "Northern": "شمالي", "Southern": "جنوبي", "Horizon Duration": "مدة الأفق",
  "Elem. Friend": "صديق العنصر", "Elem. Enemy": "عدو العنصر",
  "12th House Rulership": "حكم البيت الـ12", "House": "البيت", "Planet": "الكوكب",
  "Ritual Incense": "بخور الطقس", "Timing": "التوقيت",
  // MansionsReference
  "All 28": "الكل 28", "Current": "الحالي", "Favorable": "مواتي", "Unfavorable": "غير مواتي",
  "Boundary": "الحد", "Zodiac": "البرج", "Letter": "حرف", "Ruling": "الحكم",
  "Manuscript": "المخطوطة", "Kashf al-Haqa'iq (Omani)": "كشف الحقائق (عُماني)",
  // SaatGrid
  "Best Suited": "الأكثر ملاءمة", "Suitable": "ملائم", "Caution": "حذر",
  "Less Suitable": "أقل ملاءمة", "Spiritual": "روحاني",
  "Daytime 12 Saat": "12 ساعة نهارية", "Nighttime 12 Saat": "12 ساعة ليلية",
  // EntityKnowledgePanel
  "Manuscript Knowledge (Unified Pipeline)": "معرفة المخطوطة (الخط الموحد)",
  "sources": "مصادر",
  // Moon / dashboard chrome
  "Moon data unavailable": "بيانات القمر غير متاحة",
  "Zodiac data unavailable": "بيانات البرج غير متاحة",
  "Waxing": "متزايد", "Waning": "متضائل", "illumination": "إضاءة",
  "Lunar Day": "اليوم القمري", "Longitude": "خط الطول",
  "Mansion": "المنزل", "Nature": "الطبيعة", "Strength": "القوة",
  "Friendly Signs": "علامات صديقة", "Enemy Signs": "علامات عدو",
  "General Recommendations": "توصيات عامة",
  "Very Strong": "قوي جداً", "Strong": "قوي", "Moderate": "متوسط", "Weak": "ضعيف",
  "Normal": "عادي", "Home": "البيت", "Exalted": "مرفوع", "Debilitated": "سقوط", "Fall": "هبوط",
  "Next Zodiac Transition": "الانتقال القمري التالي", "Transition": "الانتقال",
  "Fire": "نار", "Earth": "تراب", "Air": "هواء", "Water": "ماء",
  "Ruling": "الحكم",
  "Magical Period": "المدة السحرية",
  "No manuscript data available.": "لا توجد بيانات مخطوطة.",
  // Weekdays (DailyMantras / labels)
  "Sunday": "الأحد", "Monday": "الإثنين", "Tuesday": "الثلاثاء",
  "Wednesday": "الأربعاء", "Thursday": "الخميس", "Friday": "الجمعة", "Saturday": "السبت",
  "recitations": "أوراد", "Search": "بحث", "New Search": "بحث جديد",
  "Result": "النتيجة", "Suitable": "مناسب", "Not Ideal": "غير مثالي",
  "Related Actions": "أفعال ذات صلة", "Best Time": "أفضل وقت",
  "Alternative Time": "وقت بديل", "Avoid Time": "وقت التجنب",
  "Supporting Rules": "قواعد داعمة", "Blocking Rules": "قواعد مانعة",
  "Conditional Rules": "قواعد مشروطة", "Exceptions": "استثناءات",
  "Indirect Rules": "قواعد غير مباشرة", "Manuscript References": "مراجع المخطوطة",
  "Blocking Reasons": "أسباب المنع", "Recommended Actions": "الأفعال الموصى بها",
  "Forbidden Actions": "الأفعال المحظورة",
  // Reference / Import
  "books": "كتب", "pages": "صفحات", "records": "سجلات", "Loading...": "جارٍ التحميل...",
  "Loading catalog...": "جارٍ تحميل الفهرس...", "No manuscripts found": "لا مخطوطات",
  "Search books...": "ابحث عن الكتب...",
  "Book Title": "عنوان الكتاب", "Original Title": "العنوان الأصلي", "Author": "المؤلف",
  "Language": "اللغة", "Total Pages": "إجمالي الصفحات", "Import Date": "تاريخ الاستيراد",
  "Import Status": "حالة الاستيراد", "Source": "المصدر", "Available": "متاح", "Missing": "مفقود",
  "Last Updated": "آخر تحديث", "Planets": "الكواكب", "Weekdays": "أيام الأسبوع",
  "Zodiac Signs": "الأبراج", "Mansions": "المنازل",
  "pg": "ص", "rec": "سج", "p": "ص", "Page": "الصفحة",
  "actions": "أفعال", "Forbidden": "محظور",
};

const LanguageContext = createContext();
const SUPPORTED_LANGUAGES = new Set(["ml", "en", "ar"]);

export function AstroClockLanguageProvider({ children }) {
  const [language, setLang] = useState(() => {
    const saved = localStorage.getItem("astroClockLanguage");
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("astroClockLanguage", language);
  }, [language]);

  const isMalayalam = language === "ml";
  const isEnglish = language === "en";
  const isArabic = language === "ar";

  const setLanguage = useCallback((lang) => {
    setLang(SUPPORTED_LANGUAGES.has(lang) ? lang : "en");
  }, []);

  // Custom date override — persisted to localStorage so Historical Date Mode survives reloads.
  const [customDate, setCustomDate] = useState(() => {
    try { const saved = localStorage.getItem("astroClockCustomDate"); return saved ? new Date(saved) : null; } catch { return null; }
  });
  const setCustomDatePersisted = useCallback((date) => {
    setCustomDate(date);
    try { if (date) localStorage.setItem("astroClockCustomDate", date.toISOString()); else localStorage.removeItem("astroClockCustomDate"); } catch {}
  }, []);
  const clearCustomDate = useCallback(() => {
    setCustomDate(null);
    try { localStorage.removeItem("astroClockCustomDate"); } catch {}
  }, []);
  const toggleLanguage = useCallback(() => {
    setLang(prev => prev === "ml" ? "en" : "ml");
  }, []);

  // txt: Malayalam / English / Arabic. Arabic mode looks up the English label.
  // Any legacy third argument passed by old components is ignored by JavaScript.
  const txt = useCallback((ml, en) => {
    if (language === "ml") return ml;
    if (language === "ar") return (AR_UI[en] || en);
    return en;
  }, [language]);

  // txtA: use when an explicit Arabic translation is available.
  const txtA = useCallback((ml, en, ar) => {
    if (language === "ml") return ml;
    if (language === "ar") return ar || en;
    return en;
  }, [language]);

  // Legacy t object (kept for backward compatibility with old components).
  const t = {
    current: txt("മലയാളം", "English"),
    toggle: txt("English", "മലയാളം"),
    day: txt("ദിവസം", "Day"),
    planetRuler: txt("ഗ്രഹാധിപൻ", "Planet Ruler"),
    qualities: txt("ഗുണങ്ങൾ", "Qualities"),
    warnings: txt("മുന്നറിയിപ്പുകൾ", "Warnings"),
    suitableActions: txt("അനുയോജ്യമായ പ്രവർത്തനങ്ങൾ", "Suitable Actions"),
    note: txt("കുറിപ്പ്", "Note"),
    source: txt("സ്രോതസ്സ്", "Source"),
    daytimeHours: txt("പകൽ 12 ഗ്രഹ മണിക്കൂറുകൾ", "Daytime 12 Planetary Hours"),
    nighttimeHours: txt("രാത്രി 12 ഗ്രഹ മണിക്കൂറുകൾ", "Nighttime 12 Planetary Hours"),
    hour: txt("മണിക്കൂർ", "Hour"),
    time: txt("സമയം", "Time"),
    planet: txt("ഗ്രഹം", "Planet"),
    sunrise: txt("സൂര്യോദയം", "Sunrise"),
    sunset: txt("സൂര്യാസ്തമയം", "Sunset"),
    moonPosition: txt("ചന്ദ്രന്റെ സ്ഥാനം", "Moon Position"),
    currentMansion: txt("നിലവിലെ ചാന്ദ്ര മൻസിൽ", "Current Mansion"),
    zodiacSign: txt("രാശി", "Zodiac Sign"),
    degree: txt("ഡിഗ്രി", "Degree"),
    lunarMansions: txt("ചന്ദ്ര മൻസിലുകൾ", "Lunar Mansions"),
    mansion: txt("മൻസിൽ", "Mansion"),
    zodiac: txt("രാശികൾ", "Zodiac"),
    suitable: txt("അനുയോജ്യമായ പ്രവർത്തനങ്ങൾ", "Suitable Operations"),
    planets: txt("ഗ്രഹങ്ങൾ", "Planets"),
    nature: txt("സ്വഭാവം", "Nature"),
    benefits: txt("ഗുണങ്ങൾ", "Benefits"),
    spiritualOperations: txt("ആത്മീയ പ്രവർത്തനങ്ങൾ", "Spiritual Operations"),
    element: txt("മൂലകം", "Element"),
    gender: txt("ലിംഗം", "Gender"),
    metal: txt("ലോഹം", "Metal"),
    incense: txt("ധൂപം / സുഗന്ധദ്രവ്യം", "Incense"),
    friendlySigns: txt("സൗഹൃദ രാശികൾ", "Friendly Signs"),
    enemySigns: txt("വിരുദ്ധ രാശികൾ", "Enemy Signs"),
    spiritualMeaning: txt("ആത്മീയ അർത്ഥം", "Spiritual Meaning"),
    favorable: txt("അനുകൂലം", "Favorable"),
    neutral: txt("നിഷ്പക്ഷം", "Neutral"),
    unfavorable: txt("പ്രതികൂലം", "Unfavorable"),
    ready: txt("തയ്യാറാണ്", "Ready"),
    traditionalSystem: txt("പാരമ്പര്യ വ്യവസ്ഥ", "Traditional System"),
  };

  return (
    <LanguageContext.Provider value={{ language, isMalayalam, isEnglish, isArabic, t, txt, txtA, toggleLanguage, setLanguage, customDate, setCustomDate: setCustomDatePersisted, clearCustomDate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useAstroClockLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useAstroClockLanguage must be used within AstroClockLanguageProvider");
  return ctx;
}

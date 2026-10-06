// Language support for the Holy Name research profile.
// Arabic (ar) section titles for Arabic display mode; helpers to pick the
// title/secondary by active language. Malayalam titles already live on each
// Section/TriField as titleML / labelML, so only Arabic titles need a map.

const AR_TITLES = {
  "Scholarly Research Profile": "الملف البحثي العلمي",
  "1 · Verified Arabic Spelling & Harakat": "١ · التهجئة العربية الموثقة والشكل",
  "2 · Alternative Accepted Harakat & Readings": "٢ · الشكل والقراءات البديلة المقبولة",
  "Alternative Spellings": "التهجئات البديلة",
  "3–6 · Pronunciation, Origin, Original Word & Etymology": "٣–٦ · النطق والأصل والكلمة الأصلية والاشتقاق",
  "7–8 · Historical Background & Earliest Occurrence": "٧–٨ · الخلفية التاريخية وأقدم ذكر",
  "9–17 · Meanings": "٩–١٧ · المعاني",
  "18 · Relationship with the 99 Beautiful Names of Allah": "١٨ · العلاقة مع الأسماء الحسنى التسعة والتسعين",
  "19–21 · Qur'an, Hadith & Tafsir References": "١٩–٢١ · مراجع القرآن والحديث والتفسير",
  "22–24 · Classical, Academic & Manuscript References": "٢٢–٢٤ · المراجع الكلاسيكية والأكاديمية والمخطوطات",
  "25–26 · Related Names & Related Root Words": "٢٥–٢٦ · الأسماء والجذور المرتبطة",
  "27–28 · Authentic Islamic & Traditional Benefits": "٢٧–٢٨ · الفوائد الإسلامية الموثقة والتقليدية",
  "Traditional / Occult References": "المراجع التقليدية / الباطنية",
  "Invocations / Wazifa / Dhikr / Manuscript Practices": "الأوراد والوظائف والذكر وممارسات المخطوطات",
  "Source PDFs": "مصادر PDF",
  "29–31 · Verification Status, Confidence & Sources": "٢٩–٣١ · حالة التحقق والثقة والمصادر",
};

export function arTitle(en) {
  if (!en) return "";
  // Invocations/Source PDFs titles carry a dynamic count suffix; match the base.
  const base = String(en).replace(/\s*\(\d+\)\s*$/, "").trim();
  return AR_TITLES[base] || AR_TITLES[en] || "";
}

export function pickTitle(lang, en, ml, ar) {
  if (lang === "ml") return ml || en;
  if (lang === "ar") return ar || en;
  return en;
}

export function pickSecondary(lang, en, ml, ar) {
  if (lang === "ml") return ar || null;
  if (lang === "ar") return ml || null;
  return ml || null;
}

export const LANG_OPTIONS = [
  { id: "en", short: "EN", title: "English", titleML: "ഇംഗ്ലീഷ്", titleAR: "الإنجليزية" },
  { id: "ml", short: "ML", title: "Malayalam", titleML: "മലയാളം", titleAR: "المالايالامية" },
  { id: "ar", short: "AR", title: "Arabic", titleML: "അറബിക്", titleAR: "العربية" },
];
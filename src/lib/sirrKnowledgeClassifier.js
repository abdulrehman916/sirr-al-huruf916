// ═══════════════════════════════════════════════════════════════
// SIRR KNOWLEDGE CLASSIFIER — 7-SECTION ARCHITECTURE
// ═══════════════════════════════════════════════════════════════
// Maps ALL existing manuscript data into the 7 Sirr sections.
// Every manuscript remains independent — methods are grouped by
// topic, then by book. Never merges methods from different books.
//
// SECTIONS:
//   1 — Diseases & Healing
//   2 — Jinn, Ruqyah & Spiritual Affairs
//   3 — Mahabbah & Relationships
//   4 — Wafq, Taweez, Seals & Sacred Diagrams
//   5 — Duas, Quran Verses & Divine Names
//   6 — Herbs, Medicines, Incense & Natural Remedies
//   7 — Planetary Knowledge, Sacred Times & Spiritual Laws
// ═══════════════════════════════════════════════════════════════
import { KASHF_FULL_MANTRAS, KASHF_MANSIONS_28, KASHF_TAHSEEN_15,
  KASHF_SARF_AMMAR, KASHF_AZIMAH_SHAJARA, KASHF_AZIMAH_IDRIS } from "@/lib/manuscriptRitualGuideFullData";
import { KASHF_AZAYIM_BY_DAY, KASHF_AQSAM_BY_DAY, KASHF_UNIVERSAL_SUPPLICATIONS,
  KASHF_ISTIKHARA_DUAS, KASHF_QURAN_RECITATIONS, KASHF_OPENING_SECRETS_DUAS,
  KASHF_TANZIL_DUAS, KASHF_DIVINE_NAMES, KASHF_TAWKEEL } from "@/lib/astroClockDailyMantrasData";
import { ALL_NEW_AZAYIM, TAHWIRAT, NAQADAT } from "@/lib/kashfManuscriptRegistration";

const BOOK_EN = "Kashf al-Haqa'iq";
const BOOK_AR = "كشف الحقائق";

// ── SIRR SECTION DEFINITIONS ──
export const SIRR_SECTIONS = [
  { id: 1, title_en: "Diseases & Healing", title_ml: "രോഗങ്ങളും ചികിത്സകളും", title_ar: "الأمراض والشفاء", icon: "Stethoscope", accent: "#4ADE80" },
  { id: 2, title_en: "Jinn, Ruqyah & Spiritual Affairs", title_ml: "ജിന്ന്, റുഖ്യ & ആത്മീയ കാര്യങ്ങൾ", title_ar: "الجن والرقية", icon: "Ghost", accent: "#F87171" },
  { id: 3, title_en: "Mahabbah & Relationships", title_ml: "മുഹബ്ബത്ത് & ബന്ധങ്ങൾ", title_ar: "المحبة والعلاقات", icon: "Heart", accent: "#FBBF24" },
  { id: 4, title_en: "Wafq, Taweez, Seals & Sacred Diagrams", title_ml: "വഫ്പ്, താവീസ്, മുദ്രകൾ & വിശുദ്ധ രേഖാചിത്രങ്ങൾ", title_ar: "الوفق والتمائم", icon: "Square", accent: "#60A5FA" },
  { id: 5, title_en: "Duas, Quran Verses & Divine Names", title_ml: "ദുആകൾ, ഖുർആൻ വചനങ്ങൾ & ദൈവനാമങ്ങൾ", title_ar: "الأدعية والآيات", icon: "BookOpen", accent: "#A78BFA" },
  { id: 6, title_en: "Herbs, Medicines, Incense & Natural Remedies", title_ml: "ഔഷധങ്ങൾ, മരുന്നുകൾ, ധൂപങ്ങൾ & പ്രകൃതിദത്ത ചികിത്സകൾ", title_ar: "الأعشاب والبخور", icon: "Leaf", accent: "#34D399" },
  { id: 7, title_en: "Planetary Knowledge, Sacred Times & Spiritual Laws", title_ml: "ഗ്രഹജ്ഞാനം, വിശുദ്ധ സമയങ്ങൾ & ആത്മീയ നിയമങ്ങൾ", title_ar: "الكواكب والأوقات", icon: "Sparkles", accent: "#D4AF37" },
];

// ── SOURCE LIBRARY (static — all imported manuscripts) ──
export const SOURCE_LIBRARY = [
  { book_id: "kashf_alhaqa_iq", book_name: "Kashf al-Haqa'iq", book_name_ar: "كشف الحقائق",
    author: "Anonymous Omani scholar", tradition: "Omani occult tradition",
    pages_ingested: "1-270", language: "Arabic", pdf_count: 6,
    categories: ["Lunar Mansions", "Tahseen", "Sarf", "Azayim", "Tahwirat", "Naqadat", "Tables"] },
  { book_id: "havass_derinlikleri", book_name: "Havâss'ın Derinlikleri", book_name_ar: "خواص",
    author: "Bülent Kısa", tradition: "Turkish occult",
    pages_ingested: "1-100", language: "Turkish", pdf_count: 1,
    categories: ["Planetary", "Hour systems", "Moon mansions"] },
  { book_id: "taha_judicial_astrology", book_name: "Tadrīs Nujūm Aḥkāmī", book_name_ar: "تدریس نجوم احکامی",
    author: "Ustad Taha", tradition: "Persian judicial astrology",
    pages_ingested: "1-80", language: "Persian", pdf_count: 1,
    categories: ["Zodiac", "Planets", "Aspects", "Houses"] },
];

// ── HELPER: Build normalized method object ──
function buildMethod(id, type, bookName, bookNameAr, page, fields) {
  return { id, type, book_name: bookName, book_name_ar: bookNameAr, page_number: page, ...fields };
}

// ── HELPER: Classify item into Sirr section (1-7) ──
function classifySection(item) {
  const type = item.type;
  const purposeEn = (item.purpose_en || "").toLowerCase();
  const purposeMl = item.purpose_ml || "";

  // Content-based overrides (check before type)
  if (type === "timing" && (purposeEn.includes("love") || purposeEn.includes("compassion"))) return 3;
  if (type === "quran_recitation" && purposeEn.includes("love")) return 3;
  if (type === "tawkeel" && !purposeEn.includes("stolen") && !purposeEn.includes("theft")) return 3;
  if (type === "protection" && (purposeEn.includes("jinn") || purposeEn.includes("spirit") || purposeEn.includes("expell"))) return 2;
  if (type === "protection" && !purposeEn.includes("jinn") && !purposeEn.includes("spirit")) return 4;
  if (type === "dua" && purposeEn.includes("knowledge")) return 7;

  // Type-based classification
  switch (type) {
    case "jinn_related":
    case "exorcism":
      return 2;
    case "incense":
    case "materials":
    case "naqadat":
      return 6;
    case "lunar_mansion":
    case "lunar_day":
    case "nahs_days":
    case "timing":
    case "fasting":
    case "conditions":
    case "warnings":
    case "azimah":
    case "qasam":
    case "tahwirat":
      return 7;
    case "tawkeel":
      return 7; // TAHWIRAT (stolen property recovery) → spiritual operations
    case "universal_supplication":
    case "prayer":
    case "quran_recitation":
    case "istighfar":
    case "ism":
    case "dua":
    case "poetry":
      return 5;
    default:
      return 5;
  }
}

// ── HELPER: Extract topic from item ──
function extractTopic(item) {
  if (item.name_en) return { key: item.name_en, en: item.name_en, ar: item.name_ar || "", ml: item.purpose_ml || item.name_en };
  if (item.title) return { key: item.title, en: item.purpose_en || item.title, ar: item.title, ml: item.purpose_ml || item.purpose_en || "" };
  if (item.title_en) return { key: item.title_en, en: item.title_en, ar: item.title_ar || "", ml: item.purpose_ml || item.title_en };
  const en = item.purpose_en || "Unknown";
  return { key: en, en, ar: "", ml: item.purpose_ml || en };
}

// ── COLLECT ALL ITEMS FROM ALL DATA SOURCES ──
function collectAllItems() {
  const items = [];
  const detailedIds = new Set([
    ...KASHF_MANSIONS_28.map((m) => m.id),
    ...KASHF_TAHSEEN_15.map((t) => t.id),
    ...KASHF_SARF_AMMAR.map((s) => s.id),
    KASHF_AZIMAH_SHAJARA.id,
    KASHF_AZIMAH_IDRIS.id,
  ]);

  // 1. Basic mantras (exclude items in detailed arrays)
  KASHF_FULL_MANTRAS.filter((m) => !detailedIds.has(m.id)).forEach((m) => {
    items.push(buildMethod(m.id, m.type, m.source?.book_en || BOOK_EN, m.source?.book || BOOK_AR,
      m.source?.page, {
        purpose_ml: m.purpose_ml, purpose_en: m.purpose_en, arabic_text: m.arabic_text,
        day_index: m.day_index,
      }));
  });

  // 2. 28 Lunar Mansions (detailed)
  KASHF_MANSIONS_28.forEach((m) => {
    items.push(buildMethod(m.id, "lunar_mansion", BOOK_EN, BOOK_AR, m.page, {
      purpose_ml: m.purpose_ml, purpose_en: `Lunar Mansion: ${m.name_en}`,
      arabic_text: m.arabic_text, name_ar: m.name_ar, name_en: m.name_en,
      suitable: m.suitable, forbidden: m.forbidden, marriage_rule: m.marriage_rule,
      travel_rule: m.travel_rule, clothing_rule: m.clothing_rule, farming_rule: m.farming_rule,
      best_saat: m.best_saat, nature: m.nature,
    }));
  });

  // 3. 15 Tahseen Amulets (detailed)
  KASHF_TAHSEEN_15.forEach((t) => {
    items.push(buildMethod(t.id, "protection", BOOK_EN, BOOK_AR, t.page, {
      purpose_ml: t.purpose_ml, purpose_en: t.purpose_en, arabic_text: t.arabic_text,
      title: t.title, source_scholar: t.source, repetition: t.repetition, timing: t.timing,
    }));
  });

  // 4. 5 Sarf al-Ammar formulas (detailed)
  KASHF_SARF_AMMAR.forEach((s) => {
    items.push(buildMethod(s.id, "jinn_related", BOOK_EN, BOOK_AR, s.page, {
      purpose_ml: s.purpose_ml, purpose_en: s.purpose_en, arabic_text: s.arabic_text,
      title: s.title, repetition: s.repetition, incense: s.incense,
    }));
  });

  // 5. Exorcism rites (detailed)
  [KASHF_AZIMAH_SHAJARA, KASHF_AZIMAH_IDRIS].forEach((e) => {
    items.push(buildMethod(e.id, "exorcism", BOOK_EN, BOOK_AR, e.page, {
      purpose_ml: e.purpose_ml, purpose_en: e.purpose_en, arabic_text: e.arabic_text,
      title: e.title, source_scholar: e.source, usage: e.usage, readings: e.readings,
      opening_salawat: e.opening_salawat,
    }));
  });

  // 6. Daily Azayim & Aqsam
  [...KASHF_AZAYIM_BY_DAY, ...KASHF_AQSAM_BY_DAY].forEach((m) => {
    items.push(buildMethod(m.id, m.type, m.source?.book_en || BOOK_EN, m.source?.book || BOOK_AR,
      m.source?.page, {
        purpose_ml: m.purpose_ml, purpose_en: m.purpose_en, arabic_text: m.arabic_text,
        repetition: m.repetition, day_index: m.day_index,
        king: m.king, king_en: m.king_en, servant: m.servant, servant_en: m.servant_en,
      }));
  });

  // 7. Universal supplications, Istikhara, Quran verses, Opening secrets, Tanzil, Divine names, Tawkeel
  [...KASHF_UNIVERSAL_SUPPLICATIONS, ...KASHF_ISTIKHARA_DUAS, ...KASHF_QURAN_RECITATIONS,
    ...KASHF_OPENING_SECRETS_DUAS, ...KASHF_TANZIL_DUAS, ...KASHF_DIVINE_NAMES, ...KASHF_TAWKEEL
  ].forEach((m) => {
    items.push(buildMethod(m.id, m.type, m.source?.book_en || BOOK_EN, m.source?.book || BOOK_AR,
      m.source?.page, {
        purpose_ml: m.purpose_ml, purpose_en: m.purpose_en, arabic_text: m.arabic_text,
        repetition: m.repetition, day_index: m.day_index,
      }));
  });

  // 8. New Azayim (Part 4)
  ALL_NEW_AZAYIM.forEach((a) => {
    items.push(buildMethod(a.id, "azimah", BOOK_EN, BOOK_AR, a.page, {
      purpose_ml: a.purpose_ml, purpose_en: a.purpose_en, arabic_text: a.arabic_text,
      title_ar: a.title_ar, title_en: a.title_en, repetition: a.repetition,
      source_scholar: a.scholar, materials: a.materials, incense: a.incense,
      timing: a.timing, warnings: a.warning,
    }));
  });

  // 9. Tahwirat (Part 5 — stolen property recovery)
  TAHWIRAT.forEach((t) => {
    items.push(buildMethod(t.id, "tahwirat", BOOK_EN, BOOK_AR, t.page, {
      purpose_ml: t.purpose_ml, purpose_en: t.purpose_en, arabic_text: t.arabic_text,
      title_ar: t.title_ar, title_en: t.title_en, materials: t.materials, warnings: t.warning,
    }));
  });

  // 10. Naqadat (Part 5 — herbal incense recipes)
  NAQADAT.forEach((n) => {
    items.push(buildMethod(n.id, "naqadat", BOOK_EN, BOOK_AR, n.page, {
      purpose_ml: n.purpose_ml, purpose_en: n.purpose_en, arabic_text: n.arabic_text,
      title_ar: n.title_ar, title_en: n.title_en, ingredients: n.ingredients,
      preparation: n.preparation, benefits: n.benefits,
    }));
  });

  return items;
}

// ── MAIN: Build complete Sirr knowledge structure ──
export function getSirrKnowledgeStructure() {
  const allItems = collectAllItems();

  // Classify and group: section → topic → methods (by book)
  const sectionsMap = {};

  allItems.forEach((item) => {
    const sectionId = classifySection(item);
    const topic = extractTopic(item);

    if (!sectionsMap[sectionId]) sectionsMap[sectionId] = {};
    if (!sectionsMap[sectionId][topic.key]) {
      sectionsMap[sectionId][topic.key] = { topic, methods: [] };
    }
    sectionsMap[sectionId][topic.key].methods.push(item);
  });

  // Build final structure
  const sections = SIRR_SECTIONS.map((sec) => {
    const topicsMap = sectionsMap[sec.id] || {};
    const topics = Object.entries(topicsMap).map(([key, data]) => ({
      id: `sirr${sec.id}_${key.replace(/\s+/g, "_").toLowerCase()}`,
      topic_key: key,
      topic_en: data.topic.en,
      topic_ml: data.topic.ml,
      topic_ar: data.topic.ar,
      methods: data.methods,
    })).sort((a, b) => a.topic_en.localeCompare(b.topic_en));

    return { ...sec, topics, topic_count: topics.length, method_count: topics.reduce((s, t) => s + t.methods.length, 0) };
  });

  return { sections, sourceLibrary: SOURCE_LIBRARY };
}
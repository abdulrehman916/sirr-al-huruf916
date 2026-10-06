import { base44 } from "@/api/base44Client";

// ═══════════════════════════════════════════════════════════════
// PREPARATION LIBRARY SYNC
// ═══════════════════════════════════════════════════════════════
// Fetches Preparation records from the database.
// Designed for enterprise scale: indexed queries, lazy loading.
// ═══════════════════════════════════════════════════════════════

export async function fetchPreparations() {
  try {
    return await base44.entities.Preparation.list("-created_date", 500);
  } catch {
    return [];
  }
}

export async function fetchPreparationsByType(type) {
  try {
    return await base44.entities.Preparation.filter(
      { preparation_type: type },
      "-created_date",
      200
    );
  } catch {
    return [];
  }
}

export async function fetchPreparationDetail(id) {
  try {
    return await base44.entities.Preparation.get(id);
  } catch {
    return null;
  }
}

export async function fetchRelatedPreparations(methodId, methodIdAlt) {
  try {
    const all = await base44.entities.Preparation.list("-created_date", 500);
    return all.filter((p) => {
      const usedBy = p.used_by_methods || [];
      return usedBy.some(
        (m) =>
          m.method_id === methodId ||
          m.entry_id === methodId ||
          m.method_id === methodIdAlt ||
          m.entry_id === methodIdAlt
      );
    });
  } catch {
    return [];
  }
}

// ── Preparation Type Definitions ──
export const PREPARATION_TYPES = [
  { key: "herb", label_en: "Herbs", label_ml: "ഔഷധസസ്യങ്ങൾ", label_ar: "الأعشاب", icon: "Leaf" },
  { key: "natural_medicine", label_en: "Natural Medicines", label_ml: "പ്രകൃതിദത്ത മരുന്നുകൾ", label_ar: "الأدوية الطبيعية", icon: "FlaskConical" },
  { key: "oil", label_en: "Oils", label_ml: "എണ്ണകൾ", label_ar: "الزيوت", icon: "Droplet" },
  { key: "powder", label_en: "Powders", label_ml: "പൊടികൾ", label_ar: "المساحيق", icon: "Circle" },
  { key: "mixture", label_en: "Mixtures", label_ml: "മിശ്രിതങ്ങൾ", label_ar: "الخلطات", icon: "FlaskConical" },
  { key: "incense", label_en: "Incense (Bukhoor)", label_ml: "ധൂപം (ബുഖൂർ)", label_ar: "البخور", icon: "Wind" },
  { key: "perfume", label_en: "Perfumes", label_ml: "സുഗന്ധങ്ങൾ", label_ar: "العطور", icon: "Flower2" },
  { key: "ink", label_en: "Ink Preparation", label_ml: "മഷി തയ്യാറാക്കൽ", label_ar: "الحبر", icon: "PenTool" },
  { key: "wafq_material", label_en: "Wafq Writing Materials", label_ml: "വഫ്പ് എഴുത്ത് വസ്തുക്കൾ", label_ar: "مواد الوفق", icon: "Square" },
  { key: "recipe", label_en: "Preparation Recipes", label_ml: "തയ്യാറാക്കൽ പാചകക്രമങ്ങൾ", label_ar: "الوصفات", icon: "BookOpen" },
  { key: "storage_method", label_en: "Storage Methods", label_ml: "സംഭരണ രീതികൾ", label_ar: "التخزين", icon: "Archive" },
  { key: "usage_instruction", label_en: "Usage Instructions", label_ml: "ഉപയോഗ നിർദ്ദേശങ്ങൾ", label_ar: "الاستخدام", icon: "Info" },
  { key: "ingredient", label_en: "Traditional Ingredients", label_ml: "പരമ്പരാഗത ചേരുവകൾ", label_ar: "المكونات", icon: "Package" },
  { key: "measurement", label_en: "Measurements", label_ml: "അളവുകൾ", label_ar: "المقاييس", icon: "Ruler" },
  { key: "tool", label_en: "Preparation Tools", label_ml: "തയ്യാറാക്കൽ ഉപകരണങ്ങൾ", label_ar: "الأدوات", icon: "Wrench" },
  { key: "safety_note", label_en: "Safety Notes", label_ml: "സുരക്ഷാ കുറിപ്പുകൾ", label_ar: "التحذيرات", icon: "AlertTriangle" },
];

export function getPreparationTypeLabel(typeKey, language) {
  const found = PREPARATION_TYPES.find((t) => t.key === typeKey);
  if (!found) return typeKey;
  return language === "ml" ? found.label_ml : found.label_en;
}

export function getPreparationTypeAr(typeKey) {
  const found = PREPARATION_TYPES.find((t) => t.key === typeKey);
  return found ? found.label_ar : "";
}
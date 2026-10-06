/**
 * ASTRO CLOCK LABEL MAP — source-label to Arabic/Malayalam display mapping
 * Display-only utility. Does NOT modify any engine, calculation, or data file.
 * Legacy Turkish strings may still exist in manuscript-derived source data;
 * this utility converts them to user-facing Arabic/English/Malayalam labels.
 */

export function natureToArabic(genelHukum) {
  if (!genelHukum) return "—";
  const lower = genelHukum.toLowerCase();
  if (lower.includes("nahs") || lower.includes("uğursuz")) return "نحس";
  if (lower.includes("saad") || lower.includes("sa'd") || lower.includes("uğurlu")) return "سعد";
  if (lower.includes("karışık")) return "مختلط";
  return "—";
}

export function isNahsNature(genelHukum) {
  if (!genelHukum) return false;
  const lower = genelHukum.toLowerCase();
  return lower.includes("nahs") || lower.includes("uğursuz");
}

const ZODIAC_TR_TO_AR = {
  "koç": "الحمل", "boğa": "الثور", "ikizler": "الجوزاء",
  "yengeç": "السرطان", "aslan": "الأسد", "başak": "العذراء",
  "terazi": "الميزان", "akrep": "العقرب", "yay": "القوس",
  "oğlak": "الجدي", "kova": "الدلو", "balık": "الحوت",
};

export function zodiacToArabic(zodiacSign) {
  if (!zodiacSign) return "—";
  return ZODIAC_TR_TO_AR[zodiacSign.toLowerCase()] || "—";
}

export function extractDegree(baslamaSiniri) {
  if (!baslamaSiniri) return "";
  const match = baslamaSiniri.match(/(\d+)/);
  return match ? match[1] : "";
}

// ── Malayalam zodiac names (standard Kerala rashi names) ──
const ZODIAC_TR_TO_ML = {
  "koç": "മേടം", "boğa": "ഇടവം", "ikizler": "മിഥുനം",
  "yengeç": "കർക്കടകം", "aslan": "ചിങ്ങം", "başak": "കന്നി",
  "terazi": "തുലാം", "akrep": "വൃശ്ചികം", "yay": "ധനു",
  "oğlak": "മകരം", "kova": "കുംഭം", "balık": "മീനം",
};

const ZODIAC_EN_TO_ML = {
  "aries": "മേടം", "taurus": "ഇടവം", "gemini": "മിഥുനം",
  "cancer": "കർക്കടകം", "leo": "ചിങ്ങം", "virgo": "കന്നി",
  "libra": "തുലാം", "scorpio": "വൃശ്ചികം", "sagittarius": "ധനു",
  "capricorn": "മകരം", "aquarius": "കുംഭം", "pisces": "മീനം",
};

const ELEMENT_EN_TO_ML = {
  "Fire": "അഗ്നി", "Earth": "ഭൂമി", "Air": "വായു", "Water": "ജലം",
};

export function zodiacToML(zodiacSign) {
  if (!zodiacSign) return "—";
  const lower = zodiacSign.toLowerCase();
  return ZODIAC_TR_TO_ML[lower] || ZODIAC_EN_TO_ML[lower] || "—";
}

export function zodiacEnToML(nameEn) {
  if (!nameEn) return "—";
  return ZODIAC_EN_TO_ML[nameEn.toLowerCase()] || "—";
}

export function natureToML(genelHukum) {
  if (!genelHukum) return "—";
  const lower = genelHukum.toLowerCase();
  if (lower.includes("nahs") || lower.includes("uğursuz")) return "പ്രതികൂലം";
  if (lower.includes("saad") || lower.includes("sa'd") || lower.includes("uğurlu") || lower.includes("uygun")) return "അനുകൂലം";
  if (lower.includes("karışık")) return "മിശ്രം";
  return "—";
}

export function natureToEN(genelHukum) {
  if (!genelHukum) return "—";
  const lower = genelHukum.toLowerCase();
  if (lower.includes("nahs") || lower.includes("uğursuz")) return "Inauspicious";
  if (lower.includes("saad") || lower.includes("sa'd") || lower.includes("uğurlu") || lower.includes("uygun")) return "Auspicious";
  if (lower.includes("karışık")) return "Mixed";
  return "—";
}

const ZODIAC_TR_TO_EN = {
  "koç": "Aries", "boğa": "Taurus", "ikizler": "Gemini",
  "yengeç": "Cancer", "aslan": "Leo", "başak": "Virgo",
  "terazi": "Libra", "akrep": "Scorpio", "yay": "Sagittarius",
  "oğlak": "Capricorn", "kova": "Aquarius", "balık": "Pisces",
};

export function zodiacToEN(zodiacSign) {
  if (!zodiacSign) return "—";
  return ZODIAC_TR_TO_EN[zodiacSign.toLowerCase()] || "—";
}

export function signsToML(signs) {
  if (!signs || !signs.length) return [];
  return signs.map(s => ZODIAC_EN_TO_ML[s.toLowerCase()] || s);
}

export function elementToML(element) {
  if (!element) return "—";
  return ELEMENT_EN_TO_ML[element] || element;
}

// ── Planet Arabic + Malayalam meaning display ──
// Arabic term preserved in Arabic script; Malayalam provides meaning only (no transliteration)
export const PLANET_AR_ML = {
  sun:     { ar: "الشمس",    ml: "സൂര്യൻ" },
  moon:    { ar: "القمر",    ml: "ചന്ദ്രൻ" },
  mars:    { ar: "المريخ",   ml: "ചൊവ്വാഗ്രഹം" },
  mercury: { ar: "عطارد",    ml: "ബുധഗ്രഹം" },
  jupiter: { ar: "المشتري",  ml: "വ്യാഴഗ്രഹം" },
  venus:   { ar: "الزهرة",   ml: "ശുക്രഗ്രഹം" },
  saturn:  { ar: "زحل",      ml: "ശനിഗ്രഹം" },
};

export function planetArabicMLDisplay(planetKey) {
  const parts = PLANET_AR_ML[planetKey];
  if (!parts) return null;
  return parts.ml;
}

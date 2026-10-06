/**
 * ASTRO CLOCK — MANUSCRIPT MERGER
 * Unified lookup layer that aggregates manuscript data from ALL sources.
 * ADDITIVE ONLY — never removes or overwrites existing data.
 *
 * Sources:
 * 1. Havâss'ın Derinlikleri (Bülent Kısa) — Turkish, existing
 * 2. Taha Judicial Astrology — Farsi/Arabic, existing
 * 3. Kashf al-Haqa'iq (Omani) — Arabic, newly ingested
 *
 * Future PDFs will be added as new source entries here.
 * Each function returns data grouped by source for unified display.
 */

import {
  KASHF_OPERATION_TIMING,
  KASHF_ANSWER_HOURS,
  KASHF_DOMINANCE_HOURS,
  KASHF_JAAD_HOUR_TABLE,
  KASHF_MOON_ZODIAC_HOURS,
  KASHF_LUNAR_MANSIONS,
  KASHF_ZODIAC_BY_DAY_HOUR,
  KASHF_ZODIAC_BY_HOUR_ONLY,
  KASHF_ZODIAC_ZAHER_TABLE,
  KASHF_MONTH_DAYS,
  KASHF_MONTHLY_NAHS_DAYS,
  KASHF_LUNAR_MONTH_NAHS,
  KASHF_NIGHT_DAY_RULE,
  KASHF_DIRECTION_RULES,
  KASHF_ASTRO_PRINCIPLES,
  KASHF_TRAVEL_DIRECTION_NAHS,
  KASHF_SOURCE,
} from "./astroClockKashfData";

// ── TR translations for Kashf operations ──
const OP_TR = {
  "Love and acceptance toward one person": "Tek kişiye sevgi ve kabul",
  "Reverence and honour from all people": "Herkesten saygı ve hürmet",
  "Affection between two males": "İki erkek arasında sevgi",
  "Love between a woman and her husband": "Kadın ve kocası arasında sevgi",
  "Fulfilling need before a person of rank and authority": "Makam sahibinden ihtiyaç giderme",
  "Awe, fear, and dread in people's hearts": "İnsanlarda heybet, korku ve dehşet",
  "Affection, acceptance before elders and men of high status": "Büyükler ve makam sahiplerinde sevgi ve kabul",
  "Stirring intense passion": "Şiddetli tutku uyandırma",
  "Separation, hatred, repelling enemies": "Ayrılık, nefret, düşmanı uzaklaştırma",
  "Fire operations": "Ateş işlemleri",
  "Permanent binding (irresolvable)": "Kalıcı bağ (çözülemez)",
  "Causing war, strife, and enmity between people": "İnsanlar arasında savaş, fitne ve düşmanlık",
  "Attracting livelihood and provision": "Rızık ve geçim çekme",
  "Intense love in the heart of the desired person": "Arzulanan kişinin kalbinde şiddetli sevgi",
  "Causing a person to be restless with no stable dwelling": "Kişiyi huzursuz ve kararsız kılma",
  "Entering upon rulers, elders, meetings, and legal proceedings": "Yöneticiler, büyükler ve toplantılara giriş",
  "Bringing back the absent or runaway": "Gâip ve kaçanı geri getirme",
  "Causing strife between two who conspire in sin": "Günah birleşen iki kişi arasında anlaşmazlık",
  "Binding a fornicator from committing adultery": "Zina eden kişiyi bağlama",
  "Reconciling enemies, attracting provision for someone": "Düşmanları barıştırma, rızık çekme",
  "Silencing and binding tongues against you": "Aleyhine dilleri bağlama ve susturma",
  "Hatred, separation, clearing a place, removing the harmful": "Nefret, ayrılık, mekanı boşaltma, zararlıyı uzaklaştırma",
};

const DAY_TR_MAP = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const DAY_AR_MAP = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const DAY_EN_MAP = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Purpose keyword mapping for SmartSearch
const PURPOSE_KEYWORDS = {
  love: ["love", "affection", "acceptance", "passion", "reconciling"],
  marriage: ["husband", "wife", "woman"],
  business: ["livelihood", "provision", "trade"],
  travel: ["absent", "runaway", "restless"],
  healing: [],
  knowledge: [],
  protection: ["binding", "silencing", "separation", "hatred", "repelling", "clearing"],
  wealth: ["livelihood", "provision"],
  courage: ["awe", "fear", "dread"],
  spiritual: ["elders", "rulers", "meetings"],
  // ── New canonical categories (deterministic fallback support) ──
  // Additive only — manuscript operations from Kashf al-Haqa'iq pp.12-27.
  separation: ["separation", "hatred", "repelling", "clearing", "removing"],
  enemy: ["war", "strife", "enmity", "awe", "fear", "dread"],
  binding: ["binding", "silencing", "irresolvable"],
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. SMART SEARCH — Kashf operations for a purpose
// ─────────────────────────────────────────────────────────────────────────────
export function getKashfOperationsForPurpose(purposeKey) {
  const keywords = PURPOSE_KEYWORDS[purposeKey] || [];
  if (keywords.length === 0) return [];
  return KASHF_OPERATION_TIMING
    .filter(op => keywords.some(kw => op.operation_en.toLowerCase().includes(kw)))
    .map(op => ({
      ar: op.operation_ar,
      en: op.operation_en,
      ml: op.operation_ml || op.operation_en,
      tr: OP_TR[op.operation_en] || op.operation_en,
      day_en: op.day_en,
      day_ar: op.day_ar,
      planet_en: op.planet_en,
      planet_ar: op.planet_ar,
      note_en: op.note_en || "",
      source: `Kashf al-Haqa'iq, p.${op.source.page}`,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SAAT GRID — Kashf hour attributes for a specific day+hour
// ─────────────────────────────────────────────────────────────────────────────
export function getKashfHourAttributes(dayIndex, displayHourNum, period) {
  const results = [];
  const dayName = DAY_EN_MAP[dayIndex];

  // Answer hours (ساعات الإجابة)
  const answerEntry = KASHF_ANSWER_HOURS.table.find(t => t.day_en === dayName && t.hour_number === displayHourNum);
  if (answerEntry) {
    results.push({
      type: "answer",
      ar: "ساعة الإجابة",
      en: `Answer Hour (fast response) — ${answerEntry.planet_ar}`,
      ml: `ഉത്തര ഘടിക (ദ്രുത ഫലം) — ${answerEntry.planet_ar}`,
      tr: `İcabet Saati (hızlı karşılık) — ${answerEntry.planet_ar}`,
      source: `Kashf al-Haqa'iq, p.53`,
    });
  }

  // Dominance hours (ساعات المغالبات)
  const dominanceEntry = KASHF_DOMINANCE_HOURS.table.find(t => t.day_en === dayName && t.hour_number === displayHourNum);
  if (dominanceEntry) {
    results.push({
      type: "dominance",
      ar: "ساعة المغالبة",
      en: `Dominance Hour (victory) — ${dominanceEntry.planet_ar}`,
      ml: `ജയ ഘടിക — ${dominanceEntry.planet_ar}`,
      tr: `Gâlip Saati (zafer) — ${dominanceEntry.planet_ar}`,
      source: `Kashf al-Haqa'iq, p.53`,
    });
  }

  // Sheikh Jaad's table — saad/dominance/answer/blessing planets for this day
  const jaadEntry = KASHF_JAAD_HOUR_TABLE.table.find(t => {
    const tDayIndex = DAY_EN_MAP.indexOf(t.day_ar === "الأحد" ? "Sunday" : t.day_ar === "الاثنين" ? "Monday" : t.day_ar === "الثلاثاء" ? "Tuesday" : t.day_ar === "الأربعاء" ? "Wednesday" : t.day_ar === "الخميس" ? "Thursday" : t.day_ar === "الجمعة" ? "Friday" : "Saturday");
    return tDayIndex === dayIndex;
  });
  if (jaadEntry) {
    results.push({
      type: "jaad",
      ar: `جدول الشيخ جاعد: سعد=${jaadEntry.saad_planet}، إجابة=${jaadEntry.answer_planet}، غالبة=${jaadEntry.dominance_planet}، بركة=${jaadEntry.blessing_planet}`,
      en: `Sheikh Jaad's table for ${dayName}: Sa'd=${jaadEntry.saad_planet}, Answer=${jaadEntry.answer_planet}, Dominance=${jaadEntry.dominance_planet}, Blessing=${jaadEntry.blessing_planet}`,
      ml: `${dayName} ദിനത്തിലെ ശൈഖ് ജാദ് പട്ടിക`,
      tr: `${DAY_TR_MAP[dayIndex]} için Şeyh Caad tablosu`,
      source: `Kashf al-Haqa'iq, p.54 (الأدق)`,
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PLANET ENCYCLOPEDIA — Kashf operations using a specific planet
// ─────────────────────────────────────────────────────────────────────────────
export function getKashfOperationsForPlanet(planetKey) {
  return KASHF_OPERATION_TIMING
    .filter(op => op.planet_en.toLowerCase() === planetKey)
    .map(op => ({
      ar: op.operation_ar,
      en: `${op.operation_en} → ${op.day_en}`,
      ml: `${op.operation_ml || op.operation_en} → ${op.day_en}`,
      tr: `${OP_TR[op.operation_en] || op.operation_en} → ${DAY_TR_MAP[DAY_EN_MAP.indexOf(op.day_en)]}`,
      source: `Kashf al-Haqa'iq, p.${op.source.page}`,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. LUNAR MANSIONS — Kashf Omani tradition data by mansion number (1-28)
// ─────────────────────────────────────────────────────────────────────────────
export function getKashfMansionByNo(no) {
  if (!no || no < 1 || no > 28) return null;
  const m = KASHF_LUNAR_MANSIONS.mansions[no - 1];
  if (!m) return null;
  const natureMap = {
    saad: { en: "Auspicious (Sa'd)", ml: "ശുഭം (സഅദ്)", tr: "Uğurlu (Sa'd)" },
    nahs: { en: "Inauspicious (Nahs)", ml: "അശുഭം (നഹ്സ്)", tr: "Uğursuz (Nahs)" },
    saad_mixed: { en: "Mixed auspicious", ml: "മിശ്രിത ശുഭം", tr: "Karışık uğurlu" },
    nahs_mixed: { en: "Mixed inauspicious", ml: "മിശ്രിത അശുഭം", tr: "Karışık uğursuz" },
  };
  const nature = natureMap[m.nature] || natureMap.saad;
  return {
    name_ar: m.name_ar,
    nature_en: nature.en,
    nature_ml: nature.ml,
    nature_tr: nature.tr,
    operation_ar: m.operation_ar,
    planet_ar: m.planet_ar || "",
    source: `Kashf al-Haqa'iq, pp.55-56 (الشيخ ناصر بن جاعد الخروصي)`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MOON IN ZODIAC — Kashf zodiac timing tables for a zodiac sign
// ─────────────────────────────────────────────────────────────────────────────
export function getKashfZodiacTiming(zodiacEn) {
  const zKey = zodiacEn.toLowerCase();
  const results = [];

  // Table 1: Day + Hour
  const t1 = KASHF_ZODIAC_BY_DAY_HOUR.find(z => z.zodiac_en?.toLowerCase() === zKey);
  if (t1 && t1.day_en) {
    results.push({
      ar: `جدول اليوم والساعة: ${t1.zodiac_ar} — يوم ${t1.day_ar}، كوكب ${t1.planet_ar}`,
      en: `Day+Hour table: ${t1.zodiac_en} — Day: ${t1.day_en}, Planet: ${t1.planet_en}`,
      ml: `ദിന+ഘടിക പട്ടിക: ${t1.zodiac_en} — ദിവസം: ${t1.day_en}, ഗ്രഹം: ${t1.planet_en}`,
      tr: `Gün+Saat tablosu: ${t1.zodiac_en} — Gün: ${t1.day_en}, Gezegen: ${t1.planet_en}`,
      source: `Kashf al-Haqa'iq, p.18`,
    });
  }

  // Table 2: Hour only
  const t2 = KASHF_ZODIAC_BY_HOUR_ONLY.find(z => z.zodiac_en?.toLowerCase() === zKey);
  if (t2 && t2.planet_en) {
    results.push({
      ar: `جدول الساعة فقط: ${t2.zodiac_ar} — كوكب ${t2.planet_ar}`,
      en: `Hour-only table: ${t2.zodiac_en} — Planet: ${t2.planet_en}`,
      ml: `ഘടിക മാത്രം പട്ടിക: ${t2.zodiac_en} — ഗ്രഹം: ${t2.planet_en}`,
      tr: `Saat tablosu: ${t2.zodiac_en} — Gezegen: ${t2.planet_en}`,
      source: `Kashf al-Haqa'iq, p.19`,
    });
  }

  // Table 3: Sheikh Zaher al-Ismaili
  const t3 = KASHF_ZODIAC_ZAHER_TABLE.find(z => z.zodiac_ar && !z.note_ar);
  // This table uses Arabic zodiac names — match by position
  const zodiacArMap = ["الحمل", "الثور", "الجوزاء", "السرطان", "الأسد", "العذراء", "الميزان", "العقرب", "القوس", "الجدي", "الدلو", "الحوت"];
  const zodiacEnMap = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const arIdx = zodiacEnMap.indexOf(zodiacEn);
  if (arIdx >= 0) {
    const zaher = KASHF_ZODIAC_ZAHER_TABLE.find(z => z.zodiac_ar === zodiacArMap[arIdx]);
    if (zaher) {
      results.push({
        ar: `جدول الشيخ زاهر الإسماعيلي: ${zaher.zodiac_ar} — يوم ${zaher.day_ar}، كوكب ${zaher.planet_ar}`,
        en: `Sheikh Zaher al-Ismaili table: ${zodiacEn} — ${zaher.day_ar}, ${zaher.planet_ar}`,
        ml: `ശൈഖ് സാഹർ പട്ടിക: ${zodiacEn}`,
        tr: `Şeyh Zahir İsmaili tablosu: ${zodiacEn}`,
        source: `Kashf al-Haqa'iq, p.24`,
      });
    }
  }

  // Moon in zodiac best saat
  const moonHour = KASHF_MOON_ZODIAC_HOURS.table.find(t => {
    const tZodiacEn = t.planet_en; // Not used here
    return false;
  });
  // Actually KASHF_MOON_ZODIAC_HOURS maps zodiac → planet, let's find by zodiac
  const moonZodiacEntry = KASHF_MOON_ZODIAC_HOURS.table.find(t => {
    const zIdx = KASHF_MOON_ZODIAC_HOURS.table.indexOf(t);
    return zodiacEnMap[zIdx] === zodiacEn;
  });
  if (moonZodiacEntry) {
    results.push({
      ar: `أفضل ساعة عند نزول القمر في ${moonZodiacEntry.zodiac_ar}: كوكب ${moonZodiacEntry.planet_ar}`,
      en: `Best Saat when Moon is in ${zodiacEn}: ${moonZodiacEntry.planet_en}`,
      ml: `${zodiacEn} രാശിയിൽ ചന്ദ്രൻ ആകുമ്പോൾ മികച്ച ഘടിക: ${moonZodiacEntry.planet_en}`,
      tr: `${zodiacEn} burcunda Ay iken en iyi saat: ${moonZodiacEntry.planet_en}`,
      source: `Kashf al-Haqa'iq, p.54 (الشيخ جاعد الخروصي)`,
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MOON CENTER / TODAY — Kashf lunar day info (1-30)
// ─────────────────────────────────────────────────────────────────────────────
export function getKashfLunarDayInfo(lunarDay) {
  if (!lunarDay || lunarDay < 1 || lunarDay > 30) return null;
  const dayInfo = KASHF_MONTH_DAYS.days.find(d => d.day === lunarDay);
  if (!dayInfo) return null;
  const natureMap = {
    saad: { en: "Auspicious", ml: "ശുഭം", tr: "Uğurlu" },
    nahs: { en: "Inauspicious", ml: "അശുഭം", tr: "Uğursuz" },
    mixed: { en: "Mixed", ml: "മിശ്രിതം", tr: "Karışık" },
  };
  const nature = natureMap[dayInfo.nature] || natureMap.saad;
  return {
    day: lunarDay,
    nature_en: nature.en,
    nature_ml: nature.ml,
    nature_tr: nature.tr,
    summary_ar: dayInfo.summary_ar,
    source: `Kashf al-Haqa'iq, pp.60-65`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TODAY — Kashf nahs status for a lunar day
// ─────────────────────────────────────────────────────────────────────────────
export function getKashfNahsStatus(lunarDay) {
  if (!lunarDay) return null;
  const isKamilNahs = KASHF_MONTHLY_NAHS_DAYS.days.includes(lunarDay);
  if (isKamilNahs) {
    return {
      isNahs: true,
      en: `Day ${lunarDay} is one of the Seven Kamil Unlucky Days — avoid starting any major action`,
      ml: `${lunarDay} ചാന്ദ്ര ദിവസം 7 കാമിൽ ദ്രോഹ ദിനങ്ങളിൽ ഒന്നാണ് — പ്രധാന കൃത്യങ്ങൾ ഒഴിവാക്കുക`,
      tr: `${lunarDay}. gün Kamil uğursuz günlerinden — önemli işlerden kaçının`,
      source: `Kashf al-Haqa'iq, pp.57-58`,
    };
  }
  const dayInfo = KASHF_MONTH_DAYS.days.find(d => d.day === lunarDay);
  if (dayInfo && dayInfo.nature === "nahs") {
    return {
      isNahs: true,
      en: `Day ${lunarDay}: ${dayInfo.summary_ar}`,
      ml: `${lunarDay} ദിവസം: അശുഭം`,
      tr: `${lunarDay}. gün: Uğursuz`,
      source: `Kashf al-Haqa'iq, pp.60-65`,
    };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. MOON CENTER — Kashf night/day preference rule
// ─────────────────────────────────────────────────────────────────────────────
export function getKashfNightDayRule() {
  return {
    ar: KASHF_NIGHT_DAY_RULE.rule_ar,
    en: KASHF_NIGHT_DAY_RULE.rule_en,
    ml: KASHF_NIGHT_DAY_RULE.rule_ml,
    tr: "Bilginler, bu işlerin gece yapılmasının gündüzden daha uygun olduğunda ittifak ettiler; çünkü Güneş tüm ruhları bastıran güçlü bir hükümdardır",
    exception_en: KASHF_NIGHT_DAY_RULE.exception_en,
    source: `Kashf al-Haqa'iq, p.39 (هرمس)`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. PLANET ENCYCLOPEDIA — Kashf direction rules by element
// ─────────────────────────────────────────────────────────────────────────────
export function getKashfDirectionForElement(elementEn) {
  const rule = KASHF_DIRECTION_RULES.rules.find(r => r.element_en.toLowerCase() === elementEn?.toLowerCase());
  if (!rule) return null;
  return {
    ar: `${rule.element_ar}: ${rule.direction_ar}`,
    en: `${rule.element_en}: face ${rule.direction_en}`,
    ml: `${rule.element_en}: ${rule.direction_en} ദിശയിൽ തിരിയുക`,
    tr: `${rule.element_en}: ${rule.direction_en} yönüne dön`,
    source: `Kashf al-Haqa'iq, p.42`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. REFERENCE LIBRARY — All Kashf references
// ─────────────────────────────────────────────────────────────────────────────
export function getAllKashfReferences() {
  const refs = [];
  const addRef = (page, topic) => refs.push({ book: "Kashf al-Haqa'iq", page: String(page), topic });

  addRef("12-13", "Operation Timing (22 operations)");
  addRef("18", "Zodiac Day+Hour Table");
  addRef("19", "Zodiac Hour-Only Table");
  addRef("24", "Sheikh Zaher Zodiac Table");
  addRef("26-27", "Additional Operation Timing");
  addRef("39", "Night/Day Preference (Hermetic)");
  addRef("42", "Direction Rules by Element");
  addRef("53", "Answer Hours (ساعات الإجابة)");
  addRef("53", "Dominance Hours (ساعات المغالبات)");
  addRef("54", "Sheikh Jaad Hour Table (الأدق)");
  addRef("54", "Moon in Zodiac Best Hour");
  addRef("55-56", "28 Lunar Mansions (Omani Tradition)");
  addRef("57-58", "Seven Kamil Unlucky Days");
  addRef("57", "Travel Direction Unlucky Days");
  addRef("59", "Lunar Month Nahs Days (al-Khalili)");
  addRef("60-65", "Day-by-Day Lunar Month Guide");
  addRef("65", "Day Boundary Rule (Night precedes Day)");
  addRef("65-66", "Astronomical vs Religious Calculation");

  return refs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. ALL SOURCES METADATA — for unified display
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_MANUSCRIPT_SOURCES = [
  {
    id: "havass",
    name_en: "Havâss'ın Derinlikleri",
    name_ml: "ഹാവാസ്സ് ദേരിൻലിക്ലേരി",
    name_tr: "Havâss'ın Derinlikleri",
    author: "Bülent Kısa",
    language: "Turkish",
    pages: "1-100",
  },
  {
    id: "taha",
    name_en: "Taha Judicial Astrology",
    name_ml: "താഹ ന്യായ ജ്യോതിഷം",
    name_tr: "Taha Kaza Astrolojisi",
    author: "Ustad Taha",
    language: "Farsi/Arabic",
    pages: "1-80",
  },
  {
    id: "kashf",
    name_en: "Kashf al-Haqa'iq",
    name_ml: "കശ്ഫ് അൽ-ഹഖാഇഖ്",
    name_tr: "Kashf al-Haqa'iq",
    author: "Omani Scholar (Falaj Bani Rabi'a)",
    language: "Arabic",
    pages: "1-90",
  },
];
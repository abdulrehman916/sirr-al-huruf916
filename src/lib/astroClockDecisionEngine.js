/**
 * ASTRO CLOCK — LIVE DECISION ENGINE
 * ─────────────────────────────────────────────────────────────────────────
 * Pure synthesis layer. Combines EVERY available manuscript layer into ONE
 * live decision object for the Today's Dashboard.
 *
 * MANUSCRIPT RULE (enforced):
 *   - Never invents manuscript information.
 *   - Never replaces or merges conflicting manuscript rulings.
 *   - Every recommendation is traceable to a source (Havâss / Kashf).
 *   - When a layer has no manuscript data (e.g. Moon zodiac dignity was
 *     removed per audit), it is reported as information-only, never scored.
 *
 * FIXED layers (day-level):  Planetary Day, Lunar Day, Moon Mansion,
 *   Moon Phase, Daily restrictions, Daily directions, Daily operations.
 * LIVE layers (hour-level):  Current Planetary Hour, hour rulings,
 *   hour compatibility, hour-specific Kashf operations.
 *
 * The engine only READS existing data structures; it does not duplicate
 * any calculation engine.
 */
import { PLANETARY_HOUR_RULES } from "./astroClockPlanetaryHourRules";
import { PLANET_FRIENDSHIPS } from "./astroClockPlanetFriendships";
import {
  getKashfLunarDayInfo,
  getKashfNahsStatus,
  getKashfMansionByNo,
  getKashfHourAttributes,
  getKashfDirectionForElement,
  getKashfNightDayRule,
} from "./astroClockManuscriptMerger";
import {
  KASHF_OPERATION_TIMING,
  KASHF_TRAVEL_DIRECTION_NAHS,
  KASHF_ANSWER_HOURS,
  KASHF_DOMINANCE_HOURS,
  KASHF_JAAD_HOUR_TABLE,
  KASHF_MOON_ZODIAC_HOURS,
  KASHF_ASTRO_PRINCIPLES,
} from "./astroClockKashfData";

const DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ZODIAC_EN_MAP = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

// ── Strength labels (3 languages) ──
const STRENGTH = {
  very_strong: { en: "Very Strong", ml: "വളരെ ശക്തം", ar: "قوي جداً", color: "#4ADE80" },
  strong:      { en: "Strong", ml: "ശക്തം", ar: "قوي", color: "#86EFAC" },
  moderate:    { en: "Moderate", ml: "മിതം", ar: "معتدل", color: "#FBBF24" },
  weak:        { en: "Weak", ml: "ദുർബലം", ar: "ضعيف", color: "#FB923C" },
  avoid:       { en: "Avoid Normal Operations", ml: "സാധാരണ പ്രവൃത്തികൾ ഒഴിവാക്കുക", ar: "تجنب الأعمال العادية", color: "#F87171" },
  special:     { en: "Special Purpose", ml: "വിശേഷ ഉദ്ദേശ്യം", ar: "غرض خاص", color: "#C084FC" },
  info:        { en: "Information only", ml: "വിവരം മാത്രം", ar: "للإعلام فقط", color: "rgba(255,255,255,0.50)" },
};

const FRIEND_LABEL = {
  friend:  { en: "Compatible", ml: "അനുയോജ്യം", ar: "متوافق", key: "strong" },
  neutral: { en: "Neutral", ml: "നിഷ്പക്ഷം", ar: "محايد", key: "moderate" },
  enemy:   { en: "Conflicting", ml: "പൊരുത്തമില്ലാത്തത്", ar: "متضارب", key: "weak" },
};

// Operations considered "specialised" (manuscript-attested categories the user
// listed). Detected by keyword against manuscript operation text (never invented).
const SPECIAL_KW = [
  "enemy", "enemies", "binding", "bind", "protection", "protect", "shield",
  "defense", "defence", "separation", "separate", "divorce", "dismissal",
  "dismiss", "domination", "dominate", "dominance", "hatred", "repelling",
  "repel", "silencing", "silence", "fire", "strife", "war", "conflict",
  "fighting", "breaking", "break", "restrict", "curse", "revenge", "awe",
  "fear", "dread", "terror", "restless", "fornicator", "adultery", "tongues",
];

function isSpecial(text) {
  const s = String(text || "").toLowerCase();
  return SPECIAL_KW.some(kw => s.includes(kw));
}

// ── Per-layer scores (manuscript-derived only) ──
function dayHourScore(planetKey) {
  const r = PLANETARY_HOUR_RULES[planetKey];
  if (!r) return 0;
  const n = r.nature || "";
  if (/sa'd/i.test(n) && /akbar/i.test(n)) return 2;
  if (/sa'd/i.test(n) && /asghar/i.test(n)) return 1;
  if (/nahs/i.test(n) && /asghar/i.test(n)) return -1;
  if (/nahs/i.test(n) && /akbar/i.test(n)) return -2;
  return 0;
}

function kashfNatureScore(natureEn) {
  if (!natureEn) return 0;
  const s = String(natureEn).toLowerCase();
  if (s.includes("inauspicious")) return s.includes("mixed") ? -1 : -2;
  if (s.includes("auspicious")) return s.includes("mixed") ? 1 : 2;
  if (s.includes("mixed")) return 0;
  return 0;
}

function friendship(hourPlanet, dayRuler) {
  const fr = PLANET_FRIENDSHIPS[hourPlanet];
  if (!fr) return "neutral";
  if (fr.friends.includes(dayRuler)) return "friend";
  if (fr.enemies.includes(dayRuler)) return "enemy";
  return "neutral";
}

function dedupOps(arr) {
  const seen = new Set();
  const out = [];
  for (const op of arr) {
    const key = String(op.en || "").toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(op);
  }
  return out;
}

/**
 * Compute the live decision from the shared astro data hook output.
 * @param {object} d - value returned by useAstroData()
 * @returns {object} decision
 */
export function computeAstroDecision(d) {
  if (!d || !d.currentHour || !d.dayRuler) return null;

  const dayRulerKey = d.dayRuler.planet;
  const hourPlanetKey = d.currentHour.planet;
  const dayName = DAY_EN[d.activeDayIndex] || "";

  const dayRule = PLANETARY_HOUR_RULES[dayRulerKey] || null;
  const hourRule = PLANETARY_HOUR_RULES[hourPlanetKey] || null;

  // ── Fixed layers (day) ──
  const lunarDayInfo = d.lunarDay ? getKashfLunarDayInfo(d.lunarDay) : null;
  const nahsStatus = d.lunarDay ? getKashfNahsStatus(d.lunarDay) : null;
  const mansionInfo = d.currentMansion?.no ? getKashfMansionByNo(d.currentMansion.no) : null;
  const dayDirection = dayRule?.element ? getKashfDirectionForElement(dayRule.element) : null;

  // Travel-direction nahs for today (Kashf p.57)
  const travelNahs = KASHF_TRAVEL_DIRECTION_NAHS.rules.find(r =>
    r.days_en?.toLowerCase().includes(dayName.toLowerCase())
  ) || null;

  // ── Live layers (hour) ──
  const friend = friendship(hourPlanetKey, dayRulerKey);
  const hourAttrs = getKashfHourAttributes(d.activeDayIndex, d.currentHour.hourNumber, d.isNight ? "night" : "day");

  // ── Kashf operations active today (day match) and/or this hour (planet match) ──
  const kashfToday = KASHF_OPERATION_TIMING.filter(op => op.day_en === dayName);
  const kashfThisHour = kashfToday.filter(op => op.planet_en.toLowerCase() === hourPlanetKey);

  // ── Scores ──
  const sDay = dayHourScore(dayRulerKey);
  const sLunar = kashfNatureScore(lunarDayInfo?.nature_en);
  const sMansion = kashfNatureScore(mansionInfo?.nature_en);
  const sHour = dayHourScore(hourPlanetKey);
  const sFriend = friend === "friend" ? 1 : friend === "enemy" ? -1 : 0;
  const total = sDay + sLunar + sMansion + sHour + sFriend;

  // ── Best operations (live: driven by the current hour, gated by compatibility) ──
  const best = [];
  if (hourRule?.suitableActions?.en) {
    hourRule.suitableActions.en.forEach((a, i) => best.push({
      en: a, ml: hourRule.suitableActions.ml?.[i] || a,
      source: `Havâss'ın Derinlikleri, ${hourRule.pdf_pages}`,
    }));
  }
  // Day-ruler actions only count when the hour is compatible/neutral with the day
  if (friend !== "enemy" && dayRule?.suitableActions?.en) {
    dayRule.suitableActions.en.forEach((a, i) => best.push({
      en: a, ml: dayRule.suitableActions.ml?.[i] || a,
      source: `Havâss'ın Derinlikleri, ${dayRule.pdf_pages}`,
    }));
  }
  // Kashf operations prescribed for this exact day + hour planet
  kashfThisHour.forEach(op => best.push({
    en: op.operation_en, ml: op.operation_ml || op.operation_en, ar: op.operation_ar,
    source: `Kashf al-Haqa'iq, p.${op.source.page}`,
  }));

  // ── Operations to avoid (live) ──
  const avoid = [];
  if (hourRule?.unsuitableActions?.en) {
    hourRule.unsuitableActions.en.forEach((a, i) => avoid.push({
      en: a, ml: hourRule.unsuitableActions.ml?.[i] || a,
      source: `Havâss'ın Derinlikleri, ${hourRule.pdf_pages}`,
    }));
  }
  if (friend === "enemy" && dayRule?.unsuitableActions?.en) {
    dayRule.unsuitableActions.en.forEach((a, i) => avoid.push({
      en: a, ml: dayRule.unsuitableActions.ml?.[i] || a,
      source: `Havâss'ın Derinlikleri, ${dayRule.pdf_pages} (day ruler, conflicting hour)`,
    }));
  }
  if (nahsStatus) {
    avoid.push({ en: nahsStatus.en, ml: nahsStatus.ml, source: nahsStatus.source });
  }
  if (travelNahs) {
    avoid.push({
      en: `Avoid travel toward ${travelNahs.direction_en} on ${dayName}`,
      ml: `${dayName} ദിവസം ${travelNahs.direction_en} ദിശയിലേക്കുള്ള യാത്ര ഒഴിവാക്കുക`,
      source: `Kashf al-Haqa'iq, p.57`,
    });
  }

  // ── Special operations (manuscript-attested specialised works) ──
  const special = [];
  // From the current hour's strengthened actions (Havâss)
  if (hourRule?.strengthenedActions?.en) {
    hourRule.strengthenedActions.en.forEach((a, i) => {
      if (isSpecial(a)) special.push({
        en: a, ml: hourRule.strengthenedActions.ml?.[i] || a,
        source: `Havâss'ın Derinlikleri, ${hourRule.pdf_pages} (strengthened this hour)`,
      });
    });
  }
  // From Kashf operations prescribed for THIS DAY + THIS HOUR (planet) that
  // match special categories. Reuses kashfThisHour (same hour-gating as Best
  // Operations) — a manuscript operation is only valid in its prescribed
  // weekday AND planetary hour, so it must not persist across other hours.
  kashfThisHour.forEach(op => {
    if (isSpecial(op.operation_en)) special.push({
      en: op.operation_en, ml: op.operation_ml || op.operation_en, ar: op.operation_ar,
      source: `Kashf al-Haqa'iq, p.${op.source.page}`,
    });
  });
  // Mansion-supported operation (if the current mansion's manuscript op is special)
  if (mansionInfo?.operation_ar && isSpecial(mansionInfo.operation_ar)) {
    special.push({
      en: `Mansion ${d.currentMansion?.no} operation: ${mansionInfo.operation_ar}`,
      ml: mansionInfo.operation_ar, ar: mansionInfo.operation_ar,
      source: mansionInfo.source,
    });
  }

  // ── Overall status ──
  let statusKey;
  if (total >= 7) statusKey = "very_strong";
  else if (total >= 3) statusKey = "strong";
  else if (total >= -2) statusKey = "moderate";
  else if (total >= -5) statusKey = "weak";
  else statusKey = "avoid";

  // Special-purpose override: a weak/avoid period that is nonetheless powerful
  // for manuscript-attested specialised operations.
  if ((statusKey === "weak" || statusKey === "avoid") && special.length > 0) {
    statusKey = "special";
  }

  // ── Compatibility summary ──
  const compat = [
    {
      layer: { en: "Planetary Day", ml: "ഗ്രഹ ദിനം", ar: "يوم الكوكب" },
      score: sDay, detail: dayRule ? `${dayRule.name_en} — ${dayRule.nature}` : "—",
      source: dayRule ? `Havâss'ın Derinlikleri, ${dayRule.pdf_pages}` : null,
    },
    {
      layer: { en: "Lunar Day", ml: "ചാന്ദ്ര ദിനം", ar: "يوم القمر" },
      score: sLunar, detail: lunarDayInfo ? `${d.lunarDay} — ${lunarDayInfo.nature_en}` : "—",
      source: lunarDayInfo?.source || null,
    },
    {
      layer: { en: "Moon Mansion", ml: "ചാന്ദ്ര നക്ഷത്രം", ar: "منزل القمر" },
      score: sMansion, detail: mansionInfo ? `${mansionInfo.name_ar} — ${mansionInfo.nature_en}` : "—",
      source: mansionInfo?.source || null,
    },
    {
      layer: { en: "Moon Zodiac", ml: "ചന്ദ്ര രാശി", ar: "برج القمر" },
      score: null, detail: d.moonZodiacFull?.name_en || "—",
      // No manuscript dignity data (removed per audit 2026-07-28) — information only, never scored.
      source: "Not scored — dignity not in manuscripts",
      infoOnly: true,
    },
    {
      layer: { en: "Moon Phase", ml: "ചന്ദ്ര ഘട്ടം", ar: "طور القمر" },
      score: 0, infoOnly: true,
      detail: d.moonPhaseDesc
        ? `${d.moonPhaseDesc.en || ""} (${d.moonPosition ? parseFloat(d.moonPosition.phase).toFixed(0) : 0}%) — ${d.moonPosition?.isWaxing ? "Waxing (positive works)" : "Waning (negative/special works)"}`
        : "—",
      source: "Havâss'ın Derinlikleri, p.63 (phase rule)",
    },
    {
      layer: { en: "Current Planetary Hour", ml: "നിലവിലെ ഗ്രഹ മണിക്കൂർ", ar: "ساعة الكوكب الحالية" },
      score: sHour, detail: hourRule ? `${hourRule.name_en} — ${hourRule.nature}` : "—",
      source: hourRule ? `Havâss'ın Derinlikleri, ${hourRule.pdf_pages}` : null,
    },
    {
      layer: { en: "Hour Compatibility", ml: "ഘടിക അനുയോജ്യത", ar: "توافق الساعة" },
      score: sFriend, detail: `${hourRule?.name_en || hourPlanetKey} ${FRIEND_LABEL[friend].en} ${dayRule?.name_en || dayRulerKey}`,
      source: PLANET_FRIENDSHIPS[hourPlanetKey]?.source || null,
    },
  ];

  // ── Manuscript sources used ──
  const sources = [
    { book: "Havâss'ın Derinlikleri", author: "Bülent Kısa", topic: "Planetary day/hour nature, suitable/unsuitable actions, friendships" },
  ];
  if (lunarDayInfo || nahsStatus || mansionInfo || kashfToday.length || travelNahs) {
    sources.push({ book: "Kashf al-Haqa'iq", author: "Omani Scholar (Falaj Bani Rabi'a)", topic: "Lunar day, mansion, daily operations, restrictions, directions" });
  }

  // ── Per-layer detail (for inline dashboard sections) ──
  const practiceRule = getKashfNightDayRule();
  const answerHour = KASHF_ANSWER_HOURS.table.find(t => t.day_en === dayName) || null;
  const dominanceHour = KASHF_DOMINANCE_HOURS.table.find(t => t.day_en === dayName) || null;
  const jaadEntry = KASHF_JAAD_HOUR_TABLE.table[d.activeDayIndex] || null;
  const moonZodiacEn = d.moonPosition?.zodiacSign?.name_en || null;
  const zIdx = ZODIAC_EN_MAP.indexOf(moonZodiacEn);
  const moonZodiacHour = zIdx >= 0 ? KASHF_MOON_ZODIAC_HOURS.table[zIdx] : null;
  const principle18 = KASHF_ASTRO_PRINCIPLES.find(p => p.id === "kashf_principle_002") || null;

  const isAnswerNow = answerHour && d.currentHour?.hourNumber === answerHour.hour_number && d.currentHour?.isDay;
  const isDomNow = dominanceHour && d.currentHour?.hourNumber === dominanceHour.hour_number && d.currentHour?.isDay;

  const layers = {
    planetaryDay: dayRule ? {
      planet: dayRulerKey, name_en: dayRule.name_en, name_ml: dayRule.name_ml, name_ar: dayRule.name_ar,
      nature: dayRule.nature, nature_ml: dayRule.nature_ml, element: dayRule.element,
      suitable: dayRule.suitableActions || { en: [], ml: [] },
      unsuitable: dayRule.unsuitableActions || { en: [], ml: [] },
      source: `Havâss'ın Derinlikleri, ${dayRule.pdf_pages}`,
    } : null,
    lunarDay: lunarDayInfo ? {
      day: d.lunarDay, nature_en: lunarDayInfo.nature_en, nature_ml: lunarDayInfo.nature_ml,
      summary_ar: lunarDayInfo.summary_ar, nahsStatus, source: lunarDayInfo.source,
    } : null,
    moonMansion: mansionInfo ? {
      no: d.currentMansion?.no, name_ar: mansionInfo.name_ar,
      nature_en: mansionInfo.nature_en, nature_ml: mansionInfo.nature_ml,
      operation_ar: mansionInfo.operation_ar, planet_ar: mansionInfo.planet_ar,
      source: mansionInfo.source,
    } : null,
    moonZodiac: {
      name_en: d.moonZodiacFull?.name_en || null,
      name_ar: d.moonZodiacFull?.name_ar || null,
      longitude: d.moonPosition ? parseFloat(d.moonPosition.longitude).toFixed(1) : null,
      bestSaatPlanet: moonZodiacHour ? moonZodiacHour.planet_en : null,
      bestSaatPlanetAr: moonZodiacHour ? moonZodiacHour.planet_ar : null,
      source: moonZodiacHour ? `Kashf al-Haqa'iq, p.54` : null,
      // No dignity data in manuscripts (audit 2026-07-28) — information only.
      dignityNote: "Not in manuscripts",
    },
    moonPhase: d.moonPhaseDesc ? {
      en: d.moonPhaseDesc.en, ml: d.moonPhaseDesc.ml,
      pct: d.moonPosition ? parseFloat(d.moonPosition.phase).toFixed(0) : 0,
      isWaxing: !!d.moonPosition?.isWaxing,
      source: "Havâss'ın Derinlikleri, p.63",
    } : null,
    dayNight: {
      isNight: d.isNight,
      laylNahar: d.laylNahar,
      source: "Kashf al-Haqa'iq, p.65 (day-boundary rule)",
    },
    currentHour: hourRule ? {
      hourNumber: d.currentHour.hourNumber, planet: hourPlanetKey,
      name_en: hourRule.name_en, name_ml: hourRule.name_ml, name_ar: hourRule.name_ar,
      nature: hourRule.nature, nature_ml: hourRule.nature_ml,
      hourStart: d.currentHour.hourStart, hourEnd: d.currentHour.hourEnd,
      remainingTime: d.currentHour.remainingTime, isDay: d.currentHour.isDay,
      suitable: hourRule.suitableActions || { en: [], ml: [] },
      unsuitable: hourRule.unsuitableActions || { en: [], ml: [] },
      friendVsDay: friend,
      source: `Havâss'ın Derinlikleri, ${hourRule.pdf_pages}`,
    } : null,
    direction: {
      facing: dayDirection,
      travelNahs: travelNahs ? { direction_en: travelNahs.direction_en, days_en: travelNahs.days_en } : null,
      source: "Kashf al-Haqa'iq, p.42 (facing) · p.57 (travel)",
    },
    practiceRule: {
      ar: practiceRule.ar, en: practiceRule.en, ml: practiceRule.ml,
      exception_en: practiceRule.exception_en,
      source: practiceRule.source,
    },
    kashfHour: {
      answerHour: answerHour ? { planet_ar: answerHour.planet_ar, hour_number: answerHour.hour_number, isNow: isAnswerNow } : null,
      dominanceHour: dominanceHour ? { planet_ar: dominanceHour.planet_ar, hour_number: dominanceHour.hour_number, isNow: isDomNow } : null,
      jaad: jaadEntry ? {
        saad: jaadEntry.saad_planet, dominance: jaadEntry.dominance_planet,
        answer: jaadEntry.answer_planet, blessing: jaadEntry.blessing_planet,
      } : null,
      principle: principle18 ? { ar: principle18.rule_ar, en: principle18.rule_en, ml: principle18.rule_ml } : null,
      source: "Kashf al-Haqa'iq, p.53 (answer/dominance) · p.54 (Jaad) · p.20 (1st/8th rule)",
    },
    dayOperations: kashfToday.map(op => ({
      en: op.operation_en, ml: op.operation_ml || op.operation_en, ar: op.operation_ar,
      planet_en: op.planet_en, planet_ar: op.planet_ar,
      source: `Kashf al-Haqa'iq, p.${op.source.page}`,
    })),
  };

  return {
    status: STRENGTH[statusKey],
    totalScore: total,
    bestOperations: dedupOps(best),
    avoidOperations: dedupOps(avoid),
    specialOperations: dedupOps(special),
    compatibility: compat,
    hourAttrs,
    dayDirection,
    layers,
    nextChange: {
      hourEnd: d.currentHour.hourEnd,
      remainingTime: d.currentHour.remainingTime,
      nextPlanet: d.currentHour.nextPlanet,
    },
    sources,
    friend,
  };
}
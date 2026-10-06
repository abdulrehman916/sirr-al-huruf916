// ═══════════════════════════════════════════════════════════════
// RITUAL TIMING ENGINE V3 — ASTROLOGY CLOCK INTERPRETER (READ-ONLY)
// ═══════════════════════════════════════════════════════════════
// ARCHITECTURE: This is NOT a rule engine. It is an INTERPRETER for
// the Astrology Clock data already stored in the system.
//
// FLOW:
//   1. Purpose is identified first (from Purpose Dictionary).
//   2. The engine reads the Astrology Clock data (AstroClockKnowledge)
//      for the selected Day + Saat + Layl/Nahar + Kawkab context.
//   3. It displays the ORIGINAL Astrology Clock explanation — never
//      generates, summarizes, or invents its own text.
//   4. If the context is not optimal for the Purpose, it recommends
//      ONLY: Better Day, Better Saat, Better Layl/Nahar.
//      NEVER recommends Kawkab (auto-derived from Saat).
//
// The Astrology Clock is the ONLY authority.
// This works identically across every Mizan Method and Section.
// ═══════════════════════════════════════════════════════════════

import { getCurrentPlanetaryHour, getDayRuler, getActiveWeekday, PLANET_SEQUENCE, PLANET_INFO, getAllPlanetaryHours } from "./astroClockLiveEngine.js";
import { calculateSunriseSunset, getUserLocation } from "./astroClockSunriseSunset.js";
import { calculateMoonPosition } from "./astroClockMoonPosition.js";
import { AY_MANAZILLERI } from "./astroClockData.js";
import { BENEFIC_PLANETS as BENEFIC, MALEFIC_PLANETS as MALEFIC } from "./manuscriptRuleEngine.js";

// ── PLANNING OVERRIDE (optional — Ritual Planning Mode) ──
// Module-level: when set, getTodayAllHours() uses this location instead of
// getUserLocation(), and analyzeRitualTiming uses this date instead of new Date().
// Set by analyzeRitualTiming entry when planningContext is provided.
// Null = default behavior (current location + current date).
// Does NOT modify any calculation logic — only swaps the astronomical source.
let _planningOverride = null;

// ── DYNAMIC PURPOSE KEYWORDS (Rule Database) ──
// When set by analyzeRitualTiming (from the DB-loaded usePurposeActionKeywords
// hook), purposeMatchesAction reads keywords from here instead of the legacy
// hardcoded PURPOSE_KEYWORDS constant. Null = use the legacy constant as a
// guaranteed-safe fallback, preserving outputs for any unwired caller.
// No recommendation, reason, or decision is derived from hardcoded ritual
// knowledge once the DB map is provided.
let _purposeKeywordsOverride = null;

// ── Moon Mansion & Zodiac lists (for Plan-by-Moon dropdowns) ──
export const MOON_MANSIONS = (AY_MANAZILLERI || []).map(m => ({
  no: m.no, name: m.name, harfi: m.harfi,
}));
export const ZODIAC_SIGNS = [
  { name_en: "Aries", name_ml: "മേഷം", symbol: "♈" },
  { name_en: "Taurus", name_ml: "ഇടവം", symbol: "♉" },
  { name_en: "Gemini", name_ml: "മിഥുനം", symbol: "♊" },
  { name_en: "Cancer", name_ml: "കർക്കിടകം", symbol: "♋" },
  { name_en: "Leo", name_ml: "ചിങ്ങം", symbol: "♌" },
  { name_en: "Virgo", name_ml: "കന്നി", symbol: "♍" },
  { name_en: "Libra", name_ml: "തുലാം", symbol: "♎" },
  { name_en: "Scorpio", name_ml: "വൃശ്ചികം", symbol: "♏" },
  { name_en: "Sagittarius", name_ml: "ധനു", symbol: "♐" },
  { name_en: "Capricorn", name_ml: "മകരം", symbol: "♑" },
  { name_en: "Aquarius", name_ml: "കുംഭം", symbol: "♒" },
  { name_en: "Pisces", name_ml: "മീനം", symbol: "♓" },
];

// ── Maps ──
const MIZAN_TO_EN_PLANET = {
  zuhal: "Saturn", mustari: "Jupiter", merih: "Mars", sems: "Sun",
  zuhre: "Venus", utarid: "Mercury", kamer: "Moon",
};
const MIZAN_DAY_TO_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
const MIZAN_DAY_NAMES = {
  sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday",
  thu: "Thursday", fri: "Friday", sat: "Saturday",
};
const DAY_KEY_BY_INDEX = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// BENEFIC / MALEFIC now imported from the shared manuscript rule engine
// (manuscriptRuleEngine.js) — derived from Sa'd/Nahs nature.

// ═══════════════════════════════════════════════════════════════
// ASTROLOGY CLOCK PURPOSE MATCHING
// Maps a ritualKey (from Purpose Dictionary) to keywords that appear
// in the AstroClockKnowledge recommended_actions / forbidden_actions
// text. Used to determine if a context is suitable for the Purpose.
// The matching is keyword-based — the DISPLAY is always the original
// Astro Clock text, never a generated summary.
// ═══════════════════════════════════════════════════════════════
// LEGACY HARDCODED MAP — retained ONLY as a guaranteed-safe fallback and as the
// bootstrap seed source for seedPurposeActionClassifier. The runtime
// recommendation path reads from the PurposeActionClassifier Rule Database via
// usePurposeActionKeywords; this constant is used only when no DB map is
// provided (e.g. while loading, or unwired callers) so outputs never change.
const PURPOSE_KEYWORDS = {
  love: ["love", "attraction", "marriage", "romance", "affection", "courtship", "engagement", "reconciliation"],
  separation: ["separation", "dispersing", "conflict", "punish", "binding", "revenge"],
  healing: ["health", "healing", "medicine", "sick", "cure", "remedy"],
  enemy: ["punishment", "binding", "malicious", "harm", "revenge", "enemy", "malice"],
  protection: ["protection", "good deeds", "good works", "talisman", "recitation", "guard", "shield"],
  wealth: ["money", "financial", "business", "trade", "commercial", "profit", "riches", "wealth", "transaction"],
  knowledge: ["reading", "occult", "havas", "searching", "finding", "exposure", "manifestation", "knowledge"],
  travel: ["travel", "journey", "voyage", "trip"],
  planetary: ["honor", "dignitar", "royalt", "sultan", "acceptance", "king", "display", "exhibition", "favor"],
  spiritual: ["spiritual", "worship", "devotion", "prayer", "dhikr"],
  general: [],
};

// Check if a ritual purpose keyword appears in an action text (case-insensitive)
function purposeMatchesAction(ritualKey, actionText) {
  if (!actionText) return false;
  // DB-first: use the dynamic PurposeActionClassifier map when available;
  // fall back to the legacy constant only when no DB map was provided.
  const keywords = (_purposeKeywordsOverride && _purposeKeywordsOverride[ritualKey])
    || PURPOSE_KEYWORDS[ritualKey]
    || [];
  if (keywords.length === 0) return false;
  const text = String(actionText).toLowerCase();
  return keywords.some(k => text.includes(k));
}

// Check if any of the record's recommended_actions match the purpose
function purposeInRecommended(record, ritualKey) {
  if (!record?.recommended_actions) return false;
  return record.recommended_actions.some(a => purposeMatchesAction(ritualKey, a.en));
}

// Check if any of the record's forbidden_actions match the purpose
function purposeInForbidden(record, ritualKey) {
  if (!record?.forbidden_actions) return false;
  return record.forbidden_actions.some(a => purposeMatchesAction(ritualKey, a.en));
}

// Check if any of the record's friendship_actions match the purpose
function purposeInFriendship(record, ritualKey) {
  if (!record?.friendship_actions) return false;
  return record.friendship_actions.some(a => purposeMatchesAction(ritualKey, a.en));
}

// Check if the ritual_suitability text indicates an evil/malefic/forbidden context
function isEvilContext(record) {
  const s = (record?.ritual_suitability || "").toLowerCase();
  return /evil|malefic|harmful|bad|unsuitable|unfavor|forbidden|dangerous/.test(s);
}

// Check if the ritual_suitability text indicates a good/benefic/suitable context
function isGoodContext(record) {
  const s = (record?.ritual_suitability || "").toLowerCase();
  return /good|benefic|auspicious|suitable|favorable|very good|excellent/.test(s);
}

// Lookup AstroClockKnowledge record(s) matching the exact selected context
// full_context_key = "weekday|period|saat_number|kawkab|nakshatra"
function lookupContextRecord(astroClockKnowledge, weekday, period, saatNumber, kawkab) {
  if (!astroClockKnowledge || astroClockKnowledge.length === 0) return [];
  const kawkabLC = String(kawkab || "").toLowerCase();
  return astroClockKnowledge.filter(r => {
    if (r.weekday !== weekday) return false;
    if (r.period !== period) return false;
    if (r.saat_number !== saatNumber) return false;
    if (String(r.planet || "").toLowerCase() !== kawkabLC) return false;
    return true;
  });
};

// ═══════════════════════════════════════════════════════════════
// ASTROLOGY CLOCK INTERPRETER — GATHER CONTEXT
// Replaces the old ManuscriptRule gatherRules. Reads the Astrology
// Clock data and builds the req / moonReq structure for downstream
// compatibility (moon analysis still uses req).
//
// The req is derived from the Astrology Clock:
//   req.days  → weekdays where the purpose appears in recommended_actions
//   req.hours → kawkabs where the purpose appears in recommended_actions
//   req.worstDays  → weekdays where the purpose appears in forbidden_actions
//   req.worstHours → kawkabs where the purpose appears in forbidden_actions
//   req.enemyPlanets → kawkabs where the purpose appears in enemy_actions
//   req.nightRequired → true if the purpose only appears in night records
// ═══════════════════════════════════════════════════════════════
function gatherRulesFromAstroClock(ritualKey, astroClockKnowledge) {
  const req = {
    days: null, hours: null, worstDays: null, worstHours: null,
    planet: null, direction: null, incense: null, element: null,
    nightRequired: null, enemyPlanets: [],
  };
  const moonReq = { moon: null, zodiac: null, suitableMansions: null };
  const citations = [];
  const moonCitations = [];
  const matchingRules = [];
  const conflictingRules = [];

  if (!astroClockKnowledge || astroClockKnowledge.length === 0) {
    return { req, moonReq, citations, moonCitations, dbRuleCount: 0, matchingRules, conflictingRules };
  }

  const goodDays = new Set();
  const goodHours = new Set();
  const badDays = new Set();
  const badHours = new Set();
  const enemyPlanets = new Set();
  let nightOnly = true;
  let hasDayRecord = false;
  let hasNightRecord = false;

  for (const r of astroClockKnowledge) {
    const weekday = r.weekday;
    const period = r.period;
    const planet = String(r.planet || "").toLowerCase();
    const dayKey = DAY_KEY_BY_INDEX[weekday];
    if (!dayKey) continue;

    if (period === "day") hasDayRecord = true;
    if (period === "night") hasNightRecord = true;

    const inRec = purposeInRecommended(r, ritualKey);
    const inForb = purposeInForbidden(r, ritualKey);
    const inFriend = purposeInFriendship(r, ritualKey);
    const inEnemy = r.enemy_actions?.some(a => purposeMatchesAction(ritualKey, a.en)) || false;

    // Friendship actions are positive recommendations — same as recommended_actions.
    // They MUST contribute to goodDays/goodHours so the context is marked compatible.
    if (inRec || inFriend) {
      goodDays.add(dayKey);
      goodHours.add(planet);
      if (period === "day") nightOnly = false;
    }
    if (inForb) {
      badDays.add(dayKey);
      badHours.add(planet);
    }
    if (inEnemy) {
      enemyPlanets.add(planet);
      badHours.add(planet);
    }

    // Collect citations from matching records
    if (inRec || inForb || inFriend || inEnemy) {
      const source = r.source_book_title || "Astrology Clock";
      citations.push({
        rule_id: r.knowledge_id,
        source,
        summary: r.ritual_suitability || r.knowledge_text_en?.substring(0, 120) || "",
        category: "ASTRO_CLOCK",
        field: inRec ? "recommended" : inForb ? "forbidden" : inFriend ? "friendship" : "enemy",
      });
    }
    // ── DECISION ENGINE: Collect individual rule references ──
    if (inRec) {
      const recActions = (r.recommended_actions || []).filter(a => purposeMatchesAction(ritualKey, a.en));
      matchingRules.push({
        rule_id: r.knowledge_id, source: r.source_book_title || "Astrology Clock", page: r.source_page_number || "", title: (r.knowledge_text_en || "").split(/\n/)[0].slice(0, 120),
        field: "recommended_actions",
        text_en: recActions.map(a => a.en).join("; "),
        text_ml: recActions.map(a => a.ml).filter(Boolean).join("; "),
        weekday, period, saat_number: r.saat_number, planet: r.planet,
      });
    }
    if (inForb) {
      const forbActions = (r.forbidden_actions || []).filter(a => purposeMatchesAction(ritualKey, a.en));
      conflictingRules.push({
        rule_id: r.knowledge_id, source: r.source_book_title || "Astrology Clock", page: r.source_page_number || "", title: (r.knowledge_text_en || "").split(/\n/)[0].slice(0, 120),
        field: "forbidden_actions",
        text_en: forbActions.map(a => a.en).join("; "),
        text_ml: forbActions.map(a => a.ml).filter(Boolean).join("; "),
        weekday, period, saat_number: r.saat_number, planet: r.planet,
      });
    }
    if (inEnemy) {
      const enemyActions = (r.enemy_actions || []).filter(a => purposeMatchesAction(ritualKey, a.en));
      conflictingRules.push({
        rule_id: r.knowledge_id, source: r.source_book_title || "Astrology Clock", page: r.source_page_number || "", title: (r.knowledge_text_en || "").split(/\n/)[0].slice(0, 120),
        field: "enemy_actions",
        text_en: enemyActions.map(a => a.en).join("; "),
        text_ml: enemyActions.map(a => a.ml).filter(Boolean).join("; "),
        weekday, period, saat_number: r.saat_number, planet: r.planet,
      });
    }
    if (inFriend) {
      const friendActions = (r.friendship_actions || []).filter(a => purposeMatchesAction(ritualKey, a.en));
      matchingRules.push({
        rule_id: r.knowledge_id, source: r.source_book_title || "Astrology Clock", page: r.source_page_number || "", title: (r.knowledge_text_en || "").split(/\n/)[0].slice(0, 120),
        field: "friendship_actions",
        text_en: friendActions.map(a => a.en).join("; "),
        text_ml: friendActions.map(a => a.ml).filter(Boolean).join("; "),
        weekday, period, saat_number: r.saat_number, planet: r.planet,
      });
    }
    if (r.warnings_list?.some(a => purposeMatchesAction(ritualKey, a.en))) {
      const warnActions = (r.warnings_list || []).filter(a => purposeMatchesAction(ritualKey, a.en));
      conflictingRules.push({
        rule_id: r.knowledge_id, source: r.source_book_title || "Astrology Clock", page: r.source_page_number || "", title: (r.knowledge_text_en || "").split(/\n/)[0].slice(0, 120),
        field: "warnings_list",
        text_en: warnActions.map(a => a.en).join("; "),
        text_ml: warnActions.map(a => a.ml).filter(Boolean).join("; "),
        weekday, period, saat_number: r.saat_number, planet: r.planet,
      });
    }
  }

  if (goodDays.size > 0) req.days = Array.from(goodDays);
  if (goodHours.size > 0) req.hours = Array.from(goodHours).map(p => capitalPlanet(p));
  if (badDays.size > 0) req.worstDays = Array.from(badDays);
  if (badHours.size > 0) req.worstHours = Array.from(badHours).map(p => capitalPlanet(p));
  if (enemyPlanets.size > 0) req.enemyPlanets = Array.from(enemyPlanets).map(p => capitalPlanet(p));
  if (nightOnly && hasNightRecord && !hasDayRecord && goodDays.size > 0) req.nightRequired = true;

  return { req, moonReq, citations, moonCitations, dbRuleCount: citations.length, matchingRules, conflictingRules };
}

// ═══════════════════════════════════════════════════════════════
// STEP 1 — Identify the ritual from user's Mizan selections + custom purpose
// Priority: Purpose Dictionary (confirmed) → Mizan purpose keys.
// NO keyword fallback. NO heuristic inference. NO ManuscriptRule category guess.
// Pipeline: Dictionary → AI → User Confirmation → Save → Reuse.
// Until a confirmed dictionary entry exists, no ritual category is assigned.
// ═══════════════════════════════════════════════════════════════
function identifyRitual({ selections, customPurpose, manuscriptRules, purposeLookup }) {
  const purposes = selections?.purposes || [];
  const custom = (customPurpose || "").trim();

  // Mizan purpose keys → ritual category
  const mizanPurposeMap = {
    celb: "love", tard: "separation", sihhat: "healing", sekam: "enemy",
    tarfet: "protection", rizq: "wealth", knowledge: "knowledge",
    travel: "travel", sultan: "planetary", haybah: "planetary",
  };

  // ── PRIORITY 1: Purpose Dictionary (authoritative) ──
  // If the dictionary matched, use the normalized_purpose_key to map to
  // the ritual category. Never guess, never use literal translation.
  // The dictionary stores the semantic meaning used for display.
  if (purposeLookup?.matched && purposeLookup.ritualIntent) {
    const ritualKey = mizanPurposeMap[purposeLookup.ritualIntent];
    if (ritualKey) {
      return {
        ritualKey,
        matchedOn: `Purpose Dictionary: "${purposeLookup.matchedPhrase}" → ${purposeLookup.ritualIntent}`,
        semanticMeaningEn: purposeLookup.english_meaning || "",
        semanticMeaningMl: purposeLookup.malayalam_meaning || "",
        resolvedPhraseEn: purposeLookup.interpretation_en || purposeLookup.english_meaning || "",
        resolvedPhraseMl: purposeLookup.interpretation_ml || purposeLookup.malayalam_meaning || "",
        dictionarySource: purposeLookup.source || null,
      };
    }
  }

  // No purpose selected and no custom purpose → do NOT assume any category
  if (purposes.length === 0 && !custom) {
    return { ritualKey: null, matchedOn: "no purpose selected" };
  }

  // ── PRIORITY 2: Mizan purpose keys (from selections.purposes) ──
  for (const p of purposes) {
    if (mizanPurposeMap[p]) return { ritualKey: mizanPurposeMap[p], matchedOn: `Mizan purpose "${p}"` };
  }

  // ── NO KEYWORD FALLBACK ──
  // If the Purpose Dictionary did not match and no Mizan purpose key was
  // selected, the ritual purpose is UNIDENTIFIED. Never infer from
  // hardcoded keywords, never guess from ManuscriptRule categories.
  // Pipeline: Dictionary → AI → User Confirmation → Save → Reuse.
  // Until a confirmed dictionary entry exists, no ritual category is assigned.
  return {
    ritualKey: null,
    matchedOn: "no confirmed dictionary match — purpose identification requires confirmed entry",
    semanticMeaningEn: "",
    semanticMeaningMl: "",
  };
}

// ── Manuscript-defined rule priority ──
// Priority comes ONLY from the manuscript rule's priority field (top-level or
// data_json). It is NOT hardcoded by field type — priority changes per ritual
// purpose. For one purpose Saat may be critical; for another, Day may be critical.
// The manuscript is the sole authority for both the rule and its importance.
// If a rule has no priority field, it is treated as informational — shown to the
// user but never affecting the verdict. No default or fallback priority is assumed.

// ═══════════════════════════════════════════════════════════════
// STEP 2 — Gather context from the Astrology Clock.
// The Astrology Clock is the ONLY authority. No ManuscriptRule, no
// JS fallback, no invented logic. See gatherRulesFromAstroClock above.
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// Astronomy helpers (pure math, read-only)
// ═══════════════════════════════════════════════════════════════
// ── LIVE MOON ENGINE ──
// Connects to the Astro Clock moon position calculator for real astronomical
// data: Moon Sign (zodiac), Moon Mansion (Manzil), Moon Phase, Waxing/Waning.
// Used in every manuscript timing evaluation that requires moon dimensions.
function getMoonPhase(date) {
  // Lunar day from known new moon (backward compatibility with moonSatisfied)
  const knownNewMoon = new Date("2000-01-06T18:14:00Z").getTime();
  const lunarCycleMs = 29.53059 * 24 * 60 * 60 * 1000;
  const cycles = (date.getTime() - knownNewMoon) / lunarCycleMs;
  const frac = cycles - Math.floor(cycles);
  const lunarDay = Math.floor(frac * 29.53) + 1;

  // ── LIVE MOON POSITION from Astro Clock engine (read-only) ──
  // Returns: longitude, zodiacSign {name_en, name_ml, symbol},
  // mansion {name_en, harfi, no, ...}, phase (illumination %), nakshatra
  let liveMoon = null;
  try {
    liveMoon = calculateMoonPosition(date);
  } catch (_e) {
    liveMoon = null;
  }

  const moonSign = liveMoon?.zodiacSign || null;
  const moonMansion = liveMoon?.mansion || null;
  const illumination = liveMoon ? parseFloat(liveMoon.phase) : 0;

  // ── Waxing/waning from the Astro Clock's mean elongation (D in 0..360),
  // NOT from the lunar-day number. The Astro Clock (calculateMoonPosition)
  // is the single source of truth: waxing = 0 < D < 180, waning = 180 < D < 360.
  // Using lunarDay <= 14 diverges from the Astro Clock near quarter phases.
  const isWaxing = liveMoon ? liveMoon.isWaxing === true : (lunarDay <= 14);
  return {
    lunarDay,
    isWaxing,
    isWaning: !isWaxing,
    isNewMoon: lunarDay >= 27 || lunarDay <= 1,
    isFullMoon: lunarDay >= 13 && lunarDay <= 16,
    phaseName: isWaxing ? "Waxing" : "Waning",
    // ── LIVE DATA from Astro Clock Moon Engine ──
    moonSign: moonSign ? moonSign.name_en : null,
    moonSignMl: moonSign ? moonSign.name_ml : null,
    moonSignSymbol: moonSign ? moonSign.symbol : null,
    moonMansion: moonMansion ? (moonMansion.name_en || moonMansion.name) : null,
    moonMansionArabic: moonMansion ? (moonMansion.harfi || moonMansion.arabic || "") : null,
    moonMansionNumber: moonMansion ? (moonMansion.no || null) : null,
    moonLongitude: liveMoon ? parseFloat(liveMoon.longitude) : null,
    moonIllumination: illumination,
  };
}

// Shift a Date instant to the location's local timezone so getHours()/getDay()
// return values matching the location-local sunrise/sunset. Matches the Astro
// Clock page (useAstroData) and mizaanSaatCalculator. Without this, a browser in
// a non-location timezone would read the wrong hour/day against location-local
// sunrise/sunset in the forward-search loops.
function toLocationDate(date) {
  const loc = _planningOverride?.location || getUserLocation();
  const tzDiffMs = (loc.timezone * 60 + date.getTimezoneOffset()) * 60 * 1000;
  return new Date(date.getTime() + tzDiffMs);
}
function toLocationDateStr(date) {
  const d = toLocationDate(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getTodayAllHours(date) {
  // ── LIVE SUNRISE/SUNSET — single shared source of truth ──
  // Uses the SAME calculateSunriseSunset + getUserLocation that the
  // Astrology Clock page (useAstroData) uses — NOAA astronomical
  // algorithm based on real lat/lng/timezone. No hardcoded seasonal
  // values. Identical fallback (6.5 / 18.25) as useAstroData + liveNow.
  const loc = _planningOverride?.location || getUserLocation();
  const sun = calculateSunriseSunset(date, loc.lat, loc.lng, loc.timezone);
  const sunrise = (sun.sunrise != null) ? sun.sunrise : 6.5;
  const sunset = (sun.sunset != null) ? sun.sunset : 18.25;
  return { hours: getAllPlanetaryHours(date, sunrise, sunset), sunrise, sunset };
}

function findHoursByPlanet(allHours, planetEn) {
  const t = (planetEn || "").toLowerCase();
  return allHours.filter((h) => h.planet === t);
}

function capitalPlanet(p) {
  if (!p) return p;
  const s = String(p);
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function dayKeyFromName(name) {
  const n = String(name).toLowerCase();
  const map = { sunday: "sun", monday: "mon", tuesday: "tue", wednesday: "wed", thursday: "thu", friday: "fri", saturday: "sat" };
  return map[n] || n.slice(0, 3);
}

function scoreToStars(s) {
  if (s >= 85) return 5; if (s >= 70) return 4; if (s >= 50) return 3; if (s >= 30) return 2; if (s >= 15) return 1; return 0;
}
function starsToString(n) { return "★".repeat(n) + "☆".repeat(5 - n); }

function moonSatisfied(moonReq, lunarDay) {
  if (!moonReq) return true;
  if (moonReq === "waxing") return lunarDay <= 14;
  if (moonReq === "waning") return lunarDay > 14;
  if (moonReq === "new") return lunarDay >= 27 || lunarDay <= 1;
  if (moonReq === "full") return lunarDay >= 13 && lunarDay <= 16;
  return true;
}

// ═══════════════════════════════════════════════════════════════
// STEP 5 — Find the EARLIEST valid time across up to 14 days.
// Searches: today remaining hours → tonight → next days → next valid day.
// ═══════════════════════════════════════════════════════════════
function findEarliestValidTime(req, fromDate) {
  // NO-DATA GUARD: If no restrictions exist at all (no data for this purpose),
  // return null — never fabricate a "valid" time from the absence of rules.
  const hasAnyRestriction = req.days || req.hours || req.worstDays || req.worstHours ||
    (req.enemyPlanets && req.enemyPlanets.length > 0) || req.nightRequired === true;
  if (!hasAnyRestriction) return null;

  const SEARCH_DAYS = 14;
  for (let d = 0; d < SEARCH_DAYS; d++) {
    const date = new Date(fromDate.getTime() + d * 24 * 60 * 60 * 1000);
    const localDate = toLocationDate(date);
    const { hours, sunrise, sunset } = getTodayAllHours(localDate);
    const dayKey = DAY_KEY_BY_INDEX[getActiveWeekday(localDate, sunrise, sunset)];

    // Day rule check only — Moon is handled separately in analyzeMoonCompatibility
    if (req.days && !req.days.includes(dayKey)) continue;
    // Nahas day check — skip forbidden days per manuscript
    if (req.worstDays && req.worstDays.includes(dayKey)) continue;

    for (const h of hours) {
      // Skip past hours today
      if (d === 0 && h.status === "past") continue;
      // Hour rule
      if (req.hours && !req.hours.map((p) => p.toLowerCase()).includes(h.planet)) continue;
      // Night rule
      if (req.nightRequired === true && h.period !== "night") continue;
      // Avoid worst hours
      if (req.worstHours && req.worstHours.map((p) => p.toLowerCase()).includes(h.planet)) continue;
      // Avoid enemy planets
      if (req.enemyPlanets && req.enemyPlanets.map((p) => p.toLowerCase()).includes(h.planet)) continue;

      return {
        dayKey,
        dayName: MIZAN_DAY_NAMES[dayKey],
        date: toLocationDateStr(date),
        hour: h.hourNumber,
        planet: capitalPlanet(h.planet),
        startTime: h.startTime,
        endTime: h.endTime,
        period: h.period,
        isToday: d === 0,
        daysAhead: d,
      };
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// TIMELINE COLLECTOR — collects ALL fully-valid future opportunities
// (today remaining + up to maxDays ahead) using the EXACT same req
// checks as findEarliestValidTime. Purely additive — does NOT modify
// findEarliestValidTime, compatibility, or any calculation. Used by
// the chronological Decision Timeline UI.
// ═══════════════════════════════════════════════════════════════
export function collectAllValidTimes(req, fromDate, maxDays = 14) {
  const hasAnyRestriction = req.days || req.hours || req.worstDays || req.worstHours ||
    (req.enemyPlanets && req.enemyPlanets.length > 0) || req.nightRequired === true;
  if (!hasAnyRestriction) return [];

  const results = [];
  for (let d = 0; d < maxDays; d++) {
    const date = new Date(fromDate.getTime() + d * 24 * 60 * 60 * 1000);
    const localDate = toLocationDate(date);
    const { hours, sunrise, sunset } = getTodayAllHours(localDate);
    const dayKey = DAY_KEY_BY_INDEX[getActiveWeekday(localDate, sunrise, sunset)];

    if (req.days && !req.days.includes(dayKey)) continue;
    if (req.worstDays && req.worstDays.includes(dayKey)) continue;

    for (const h of hours) {
      if (d === 0 && h.status === "past") continue;
      if (req.hours && !req.hours.map((p) => p.toLowerCase()).includes(h.planet)) continue;
      if (req.nightRequired === true && h.period !== "night") continue;
      if (req.worstHours && req.worstHours.map((p) => p.toLowerCase()).includes(h.planet)) continue;
      if (req.enemyPlanets && req.enemyPlanets.map((p) => p.toLowerCase()).includes(h.planet)) continue;

      results.push({
        dayKey,
        dayName: MIZAN_DAY_NAMES[dayKey],
        date: toLocationDateStr(date),
        hour: h.hourNumber,
        planet: capitalPlanet(h.planet),
        startTime: h.startTime,
        endTime: h.endTime,
        period: h.period,
        isToday: d === 0,
        daysAhead: d,
      });
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// TWO-LEVEL PER-HOUR ANALYSIS (Day → Hour)
// Every planetary hour inside every weekday is evaluated independently by its
// EXACT context record (weekday + period + saat_number + planet). A weekday is
// NEVER blanket-forbidden — only the specific hours the book rules forbid are
// forbidden; only the specific hours the book rules recommend are allowed.
// Neutral = no book rule for this exact hour (neither recommended nor forbidden).
// Additive — does not modify collectAllValidTimes / findEarliestValidTime.
// ═══════════════════════════════════════════════════════════════
function buildContextIndex(astroClockKnowledge) {
  const map = new Map();
  for (const r of astroClockKnowledge || []) {
    if (r.weekday == null || !r.period || r.saat_number == null) continue;
    const key = `${r.weekday}|${r.period}|${r.saat_number}|${String(r.planet || "").toLowerCase()}`;
    if (!map.has(key)) map.set(key, r);
  }
  return map;
}

function evaluateHourContextByIndex(idx, ritualKey, weekday, period, saatNumber, planet) {
  const record = idx.get(`${weekday}|${period}|${saatNumber}|${String(planet || "").toLowerCase()}`) || null;
  const purposeRec = purposeInRecommended(record, ritualKey);
  const purposeForb = purposeInForbidden(record, ritualKey);
  const purposeFriend = purposeInFriendship(record, ritualKey);
  const evil = isEvilContext(record);
  const forbidden = purposeForb || (evil && !purposeRec);
  const allowed = purposeRec || purposeFriend;
  const rules = [];
  if (record) {
    const src = record.source_book_title || "Astrology Clock";
    const page = record.source_page_number || "";
    if (purposeRec) {
      const acts = (record.recommended_actions || []).filter(a => purposeMatchesAction(ritualKey, a.en));
      rules.push({ source: src, page, text_en: acts.map(a => a.en).join("; "), text_ml: acts.map(a => a.ml).filter(Boolean).join("; "), field: "recommended" });
    }
    if (purposeFriend && !purposeRec) {
      const acts = (record.friendship_actions || []).filter(a => purposeMatchesAction(ritualKey, a.en));
      rules.push({ source: src, page, text_en: acts.map(a => a.en).join("; "), text_ml: acts.map(a => a.ml).filter(Boolean).join("; "), field: "friendship" });
    }
    if (purposeForb) {
      const acts = (record.forbidden_actions || []).filter(a => purposeMatchesAction(ritualKey, a.en));
      rules.push({ source: src, page, text_en: acts.map(a => a.en).join("; "), text_ml: acts.map(a => a.ml).filter(Boolean).join("; "), field: "forbidden" });
    }
    const enemyActs = (record.enemy_actions || []).filter(a => purposeMatchesAction(ritualKey, a.en));
    if (enemyActs.length) {
      rules.push({ source: src, page, text_en: enemyActs.map(a => a.en).join("; "), text_ml: enemyActs.map(a => a.ml).filter(Boolean).join("; "), field: "enemy" });
    }
  }
  let status = "neutral";
  if (forbidden) status = "forbidden";
  else if (allowed) status = "allowed";
  const reasonEn = rules.map(r => r.text_en).filter(Boolean).join(" · ") || (record ? (record.ritual_suitability || "") : "");
  const reasonMl = rules.map(r => r.text_ml).filter(Boolean).join(" · ") || (record ? (record.knowledge_text_ml || "") : "");
  return { status, reasonEn, reasonMl, rules, hasRecord: !!record };
}

// All 24 planetary hours of a given date, each evaluated by its exact context.
function buildDayHourBreakdown(astroClockKnowledge, ritualKey, date) {
  const idx = buildContextIndex(astroClockKnowledge);
  const localDate = toLocationDate(date);
  const { hours, sunrise, sunset } = getTodayAllHours(localDate);
  const weekday = getActiveWeekday(localDate, sunrise, sunset);
  const dayKey = DAY_KEY_BY_INDEX[weekday];
  const dayName = MIZAN_DAY_NAMES[dayKey];
  return hours.map(h => {
    const ev = evaluateHourContextByIndex(idx, ritualKey, weekday, h.period, h.hourNumber, h.planet);
    return {
      hourNumber: h.hourNumber,
      saatNum: saatDisplayNumEngine(h.hourNumber, h.period),
      period: h.period,
      planet: capitalPlanet(h.planet),
      startTime: h.startTime,
      endTime: h.endTime,
      past: h.status === "past",
      weekday, dayKey, dayName,
      status: ev.status,
      reasonEn: ev.reasonEn,
      reasonMl: ev.reasonMl,
      rules: ev.rules,
    };
  });
}

// All 7 weekdays × 24 hours, each hour evaluated independently by its exact
// imported-book-rule context. Used by Card 3 (Forbidden Times) to list the
// completely-forbidden weekdays and the per-weekday forbidden/allowed hours.
// Additive — does not modify any existing calculation.
function buildWeekBreakdown(astroClockKnowledge, ritualKey, fromDate) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
    const localDate = toLocationDate(date);
    const { sunrise, sunset } = getTodayAllHours(localDate);
    const weekday = getActiveWeekday(localDate, sunrise, sunset);
    const dayKey = DAY_KEY_BY_INDEX[weekday];
    days.push({
      weekday, dayKey, dayName: MIZAN_DAY_NAMES[dayKey],
      hours: buildDayHourBreakdown(astroClockKnowledge, ritualKey, date),
    });
  }
  return days;
}

// Chronological list of ALLOWED hours across up to maxDays — never skips a whole
// weekday. Each hour evaluated by its exact context record (book rules only).
function collectAllowedTimeline(astroClockKnowledge, ritualKey, fromDate, maxDays) {
  const idx = buildContextIndex(astroClockKnowledge);
  const results = [];
  for (let d = 0; d < maxDays; d++) {
    const date = new Date(fromDate.getTime() + d * 24 * 60 * 60 * 1000);
    const localDate = toLocationDate(date);
    const { hours, sunrise, sunset } = getTodayAllHours(localDate);
    const weekday = getActiveWeekday(localDate, sunrise, sunset);
    const dayKey = DAY_KEY_BY_INDEX[weekday];
    for (const h of hours) {
      if (d === 0 && h.status === "past") continue;
      const ev = evaluateHourContextByIndex(idx, ritualKey, weekday, h.period, h.hourNumber, h.planet);
      if (ev.status !== "allowed") continue;
      results.push({
        date: toLocationDateStr(date),
        dayName: MIZAN_DAY_NAMES[dayKey],
        dayKey, weekday,
        hour: h.hourNumber,
        saatNum: saatDisplayNumEngine(h.hourNumber, h.period),
        period: h.period,
        planet: capitalPlanet(h.planet),
        startTime: h.startTime,
        endTime: h.endTime,
        status: ev.status,
        reasonEn: ev.reasonEn,
        reasonMl: ev.reasonMl,
        rules: ev.rules,
        isToday: d === 0,
        daysAhead: d,
      });
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT DAY RESOLVER — LIVE (sunset-aware) or MANUAL (selected day)
// ═══════════════════════════════════════════════════════════════
// LIVE mode (no selectedDay): active day = getActiveWeekday(now) — changes at sunset.
// MANUAL mode (selectedDay set): the selected day IS the manuscript day.
//   Night of Day X = previous civil day's sunset → X's sunrise (target = X-1).
//   Day of Day X   = X's sunrise → X's sunset (target = X).
// Returns { activeDayIndex, referenceDate } for downstream hour-table lookup.
function resolveManuscriptDay(selectedDay, dayNight, now, sunrise, sunset) {
  if (!selectedDay) {
    return { activeDayIndex: getActiveWeekday(now, sunrise, sunset), referenceDate: now };
  }
  const activeDayIndex = MIZAN_DAY_TO_INDEX[selectedDay];
  const targetCivilIndex = dayNight === 'gece'
    ? (activeDayIndex - 1 + 7) % 7
    : activeDayIndex;
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    if (checkDate.getDay() === targetCivilIndex) {
      const referenceDate = new Date(checkDate);
      if (dayNight === 'gece') {
        referenceDate.setHours(Math.floor(sunset) + 1, 0, 0, 0);
      } else if (dayNight === 'gunduz') {
        referenceDate.setHours(Math.floor(sunrise) + 2, 0, 0, 0);
      }
      return { activeDayIndex, referenceDate };
    }
  }
  return { activeDayIndex, referenceDate: now };
}

// ═══════════════════════════════════════════════════════════════
// ASTROLOGY CLOCK INTERPRETER — Dimension-by-dimension display of
// the ORIGINAL Astrology Clock explanation for the selected context.
//
// Every dimension shows the Astro Clock's own text:
//   - ritual_suitability (the Astro Clock's own assessment)
//   - recommended_actions (the Astro Clock's own recommendations)
//   - forbidden_actions (the Astro Clock's own warnings)
//   - knowledge_text_en / knowledge_text_ml (the original explanation)
//
// The engine NEVER generates its own explanations. It displays the
// original Astro Clock text that belongs to the selected context.
// ═══════════════════════════════════════════════════════════════
function buildSelectionAnalysis({ selections, req, astroClockKnowledge, ritualKey, noPurposeSelected, earliest, todayHours, dayNight, selectedDay, selectedHour, selectedPlanet, currentHourInfo, weekday, period, saatNumber, kawkab }) {
  if (noPurposeSelected) {
    return {
      suitable: false,
      purposeRequired: true,
      summary: "Purpose not selected — ritual-specific recommendations cannot be generated.",
      decisionBreakdown: [],
      bestAlternative: null,
    };
  }

  // ── Look up the Astro Clock record for the EXACT selected context ──
  const contextRecords = lookupContextRecord(astroClockKnowledge, weekday, period, saatNumber, kawkab);
  const contextRecord = contextRecords[0] || null;

  // ── Original Astro Clock text for this context ──
  const originalSuitability = contextRecord?.ritual_suitability || "";
  const originalRecommended = contextRecord?.recommended_actions || [];
  const originalForbidden = contextRecord?.forbidden_actions || [];
  const originalEnemy = contextRecord?.enemy_actions || [];
  const originalWarnings = contextRecord?.warnings_list || [];
  const originalExplanation = contextRecord?.knowledge_text_en || "";
  const originalExplanationMl = contextRecord?.knowledge_text_ml || "";
  const sourceLabel = contextRecord?.source_book_title || "Astrology Clock";

  // ── Determine if this context is suitable for the Purpose ──
  const purposeRec = purposeInRecommended(contextRecord, ritualKey);
  const purposeForb = purposeInForbidden(contextRecord, ritualKey);
  const evilCtx = isEvilContext(contextRecord);

  const breakdown = [];
  let allPass = true;

  // 1. Weekday — display the Astro Clock's assessment for this Day
  {
    const dayName = selectedDay ? MIZAN_DAY_NAMES[selectedDay] : "Not selected";
    const dayOk = !req.days || (selectedDay && req.days.includes(selectedDay));
    if (selectedDay && !dayOk && req.days) allPass = false;
    const dayContextRecords = astroClockKnowledge?.filter(r => r.weekday === weekday && (purposeInRecommended(r, ritualKey) || purposeInFriendship(r, ritualKey))) || [];
    breakdown.push({
      dimension: "weekday", label: "Weekday",
      currentValue: dayName,
      status: !selectedDay ? "neutral" : dayOk ? "pass" : (purposeForb && !purposeRec) ? "fail" : "neutral",
      reason: originalSuitability
        ? `${originalSuitability.split(/\n---\n/)[0] || originalSuitability}`
        : "",
      reasonMl: originalExplanationMl || "",
      source: sourceLabel,
      recommended: dayOk ? null : (req.days?.map(d => MIZAN_DAY_NAMES[d]).join(" or ") || null),
    });
  }

  // 2. Saat (Planetary Hour) — display the Astro Clock's assessment for this Saat + Kawkab
  {
    const hourPlanet = selectedHour ? capitalPlanet(currentHourInfo?.planet || kawkab) : null;
    const hourOk = !req.hours || (selectedHour && req.hours.map(p => p.toLowerCase()).includes(String(currentHourInfo?.planet || kawkab || "").toLowerCase()));
    if (selectedHour && !hourOk && req.hours) allPass = false;
    breakdown.push({
      dimension: "hour", label: "Planetary Hour (Saat)",
      currentValue: selectedHour ? `Saat #${selectedHour} (${hourPlanet})` : "Not selected",
      status: !selectedHour ? "neutral" : hourOk ? "pass" : "fail",
      reason: originalExplanation
        ? originalExplanation.split(/\n---\n/)[0] || originalExplanation
        : "",
      reasonMl: originalExplanationMl || "",
      source: sourceLabel,
      recommended: hourOk ? null : (req.hours?.join(" or ") || null),
    });
  }

  // 3. Layl/Nahar (Day/Night) — display the Astro Clock's assessment
  {
    const dnOk = req.nightRequired !== true || dayNight === "gece";
    if (dayNight && !dnOk && req.nightRequired) allPass = false;
    const periodText = period === "night" ? "Night (Layl)" : "Day (Nahar)";
    breakdown.push({
      dimension: "dayNight", label: "Layl / Nahar",
      currentValue: dayNight === "gunduz" ? "Day (Nahar)" : dayNight === "gece" ? "Night (Layl)" : "Not selected",
      status: !dayNight ? "neutral" : dnOk ? "pass" : "fail",
      reason: req.nightRequired === true
        ? `The Astrology Clock requires this work at Night (Layl). ${originalSuitability ? originalSuitability.split(/\n---\n/)[0] : ""}`
        : (originalSuitability ? `${periodText}. ${originalSuitability.split(/\n---\n/)[0]}` : ""),
      reasonMl: originalExplanationMl || "",
      source: sourceLabel,
      recommended: dnOk ? null : "Night (Layl)",
    });
  }

  // 4. Enemy relationship — display the Astro Clock's enemy explanation
  if (originalEnemy.length > 0 || (req.enemyPlanets && req.enemyPlanets.length > 0)) {
    const selectedPlanetEn = MIZAN_TO_EN_PLANET[selectedPlanet] || capitalPlanet(kawkab);
    const isEnemy = req.enemyPlanets?.includes(selectedPlanetEn) || originalEnemy.some(a => purposeMatchesAction(ritualKey, a.en));
    if (isEnemy) allPass = false;
    const enemyText = originalEnemy.map(a => a.en).join("; ");
    breakdown.push({
      dimension: "enemyPlanet", label: "Enemy Relationship",
      currentValue: selectedPlanetEn || "Not selected",
      status: isEnemy ? "fail" : "pass",
      reason: enemyText
        ? `Astrology Clock: ${enemyText}`
        : "",
      reasonMl: originalEnemy.map(a => a.ml).filter(Boolean).join("; "),
      source: sourceLabel,
      recommended: isEnemy ? (req.hours?.[0] || "See recommended Saat") : null,
    });
  }

  // 5. Forbidden context check — display the Astro Clock's forbidden explanation
  // SINGLE SOURCE OF TRUTH: reject only when the purpose is explicitly forbidden,
  // OR the context is evil AND the purpose is NOT recommended here.
  // An evil context is allowed when the Astro Clock explicitly recommends
  // the current ritual purpose for this exact Day+Saat+Kawkab.
  const isContextForbidden = purposeForb || (evilCtx && !purposeRec);
  if (isContextForbidden) {
    allPass = false;
    const forbiddenText = originalForbidden.map(a => a.en).join("; ");
    breakdown.push({
      dimension: "forbidden", label: "Forbidden Timing",
      currentValue: "This context",
      status: "fail",
      reason: forbiddenText
        ? `Astrology Clock: ${forbiddenText}`
        : (originalSuitability || ""),
      reasonMl: originalForbidden.map(a => a.ml).filter(Boolean).join("; "),
      source: sourceLabel,
      recommended: req.days?.map(d => MIZAN_DAY_NAMES[d]).join(" or ") || "See recommended timing",
    });
  }

  // ── RECOMMENDATION — only the fields that need changing ──
  // NEVER recommend Kawkab (auto-derived from Saat).
  const bestAlt = {};
  const dayFailed = (!!req.days && (!selectedDay || !req.days.includes(selectedDay))) ||
                    (!!req.worstDays && selectedDay && req.worstDays.includes(selectedDay));
  const saatFailed = !!req.hours && !!selectedHour && !req.hours.map(p => p.toLowerCase()).includes(String(currentHourInfo?.planet || kawkab || "").toLowerCase());
  const laylNaharFailed = req.nightRequired === true && dayNight !== "gece";

  // SINGLE SOURCE OF TRUTH: forbidden = isContextForbidden.
  // Reject ONLY when: purpose explicitly forbidden, OR context is evil
  // AND purpose is NOT recommended here. An evil context where the purpose
  // IS recommended is allowed. Dimension mismatches (day/hour not in
  // recommended lists) do NOT cause rejection — they only produce
  // bestAlternative suggestions.
  const forbidden = isContextForbidden;

  if (!forbidden) {
    bestAlt.complete = false;
  } else {
    bestAlt.changes = [];
    bestAlt.reason = "";

    if (dayFailed) {
      bestAlt.day = req.days?.length > 0
        ? req.days.map(d => MIZAN_DAY_NAMES[d]).join(" or ")
        : "Any day except forbidden";
      bestAlt.dayValue = earliest?.dayKey || req.days?.[0] || null;
      bestAlt.changes.push("Day");
      bestAlt.reason += `Better Day: ${bestAlt.day}. `;
    }

    if (laylNaharFailed) {
      bestAlt.dayNight = "Night (Layl)";
      bestAlt.dayNightValue = "gece";
      bestAlt.changes.push("Layl/Nahar");
      bestAlt.reason += "Better Layl/Nahar: Night (Layl). ";
    }

    if (saatFailed) {
      let saatRecommended = false;
      if (!dayFailed) {
        const validSaats = (todayHours || [])
          .filter(h => {
            if (req.hours && !req.hours.map(p => p.toLowerCase()).includes(h.planet)) return false;
            if (req.worstHours && req.worstHours.map(p => p.toLowerCase()).includes(h.planet)) return false;
            if (req.enemyPlanets && req.enemyPlanets.map(p => p.toLowerCase()).includes(h.planet)) return false;
            if (req.nightRequired === true && h.period !== "night") return false;
            return true;
          })
          .sort((a, b) => a.hourNumber - b.hourNumber);

        if (validSaats.length > 0) {
          const bestSaat = validSaats[0];
          const saatNum = bestSaat.period === 'night' ? bestSaat.hourNumber - 12 : bestSaat.hourNumber;
          bestAlt.hour = `#${saatNum} (${capitalPlanet(bestSaat.planet)})`;
          bestAlt.hourValue = saatNum;
          bestAlt.planet = capitalPlanet(bestSaat.planet);
          bestAlt.timeWindow = `${bestSaat.startTime} – ${bestSaat.endTime}`;
          bestAlt.dayName = selectedDay ? MIZAN_DAY_NAMES[selectedDay] : "Today";
          bestAlt.isToday = true;
          bestAlt.changes.push("Saat");
          bestAlt.reason += `Better Saat: #${saatNum} (${capitalPlanet(bestSaat.planet)}). `;
          saatRecommended = true;
        }
      }
      if (!saatRecommended && earliest) {
        const earliestSaatNum = earliest.period === 'night' ? earliest.hour - 12 : earliest.hour;
        bestAlt.hour = `#${earliestSaatNum} (${earliest.planet})`;
        bestAlt.hourValue = earliestSaatNum;
        bestAlt.dayValue = bestAlt.dayValue || earliest.dayKey;
        bestAlt.planet = earliest.planet;
        bestAlt.timeWindow = `${earliest.startTime} – ${earliest.endTime}`;
        bestAlt.dayName = earliest.dayName;
        bestAlt.date = earliest.date;
        bestAlt.isToday = earliest.isToday;
        bestAlt.daysAhead = earliest.daysAhead;
        bestAlt.changes.push("Saat");
        bestAlt.reason += `Better Saat: #${earliestSaatNum} (${earliest.planet})${dayFailed ? ` on ${earliest.dayName}` : ""}. `;
        saatRecommended = true;
      }
      if (!saatRecommended) {
        bestAlt.hour = req.hours.join(" or ");
        bestAlt.changes.push("Saat");
        bestAlt.reason += `Better Saat: one ruled by ${req.hours.join(", ")}. `;
      }
    }

    bestAlt.complete = bestAlt.changes.length > 0;
    if (!bestAlt.complete) {
      bestAlt.reason = "See the Astrology Clock recommendations below.";
    }
  }

  return {
    suitable: !forbidden,
    forbidden,
    purposeRequired: false,
    summary: !forbidden
      ? "Your current configuration is suitable — the Astrology Clock confirms this timing for your purpose."
      : `Your current configuration has ${breakdown.filter(b => b.status === "fail").length} issue(s). Adjust the recommended fields.`,
    decisionBreakdown: breakdown,
    bestAlternative: bestAlt.complete ? bestAlt : null,
    // ── Original Astro Clock text for the selected context ──
    contextRecord,
    originalSuitability,
    originalRecommended,
    originalForbidden,
    originalWarnings,
    originalExplanation,
    originalExplanationMl,
  };
}

// ═══════════════════════════════════════════════════════════════
// DECISION ENGINE — Analyzes ALL rules and produces a structured
// decision with explicit rule references for every conclusion.
//
// OUTPUT:
//   currentSaatAnalysis: { suitable, rejectionReasons, acceptanceReasons }
//   betterAlternatives: { betterSaats, nextLayl, nextDay, firstValidOpportunity }
//
// Every rejection/acceptance reason references the specific database
// rule that caused it. Never invents reasons. Never displays raw
// text without analysis.
// ═══════════════════════════════════════════════════════════════
function saatDisplayNumEngine(hourNumber, period) {
  return period === "night" ? hourNumber - 12 : hourNumber;
}

function gatherManuscriptRulesForPurpose(ritualKey, manuscriptRules) {
  const matching = [];
  const conflicting = [];
  if (!manuscriptRules || manuscriptRules.length === 0) return { matching, conflicting };
  const keywords = (_purposeKeywordsOverride && _purposeKeywordsOverride[ritualKey]) || PURPOSE_KEYWORDS[ritualKey] || [];
  if (keywords.length === 0) return { matching, conflicting };
  for (const rule of manuscriptRules) {
    const text = ((rule.rule_summary || "") + " " + (rule.original_text || "")).toLowerCase();
    if (!keywords.some(k => text.includes(k))) continue;
    const isForbidden = /forbid|prohibit|avoid|dangerous|harmful|evil|nahas|worst|bad/.test(text);
    const ruleRef = {
      rule_id: rule.rule_id,
      source: rule.book_name || "Manuscript",
      page: rule.page_number || "",
      title: (rule.rule_summary || rule.original_text || "").split(/\n/)[0].slice(0, 120),
      field: isForbidden ? "forbidden" : "recommended",
      text_en: rule.rule_summary || rule.original_text || "",
      text_ml: rule.rule_summary_ml || "",
      weekday: null, period: null, saat_number: null, planet: null,
      category: rule.category,
      priority: rule.priority,
    };
    if (isForbidden) conflicting.push(ruleRef);
    else matching.push(ruleRef);
  }
  return { matching, conflicting };
}

function isContextFullyCompatible(req, dayKey, planetLC, periodVal) {
  // ── COMBINED COMPATIBILITY — all dimensions evaluated as ONE unit ──
  const dayOk = !req.days || req.days.includes(dayKey);
  const hourOk = !req.hours || req.hours.map(p => p.toLowerCase()).includes(planetLC);
  const nightOk = req.nightRequired !== true || periodVal === "night";
  const notEnemy = !req.enemyPlanets || !req.enemyPlanets.map(p => p.toLowerCase()).includes(planetLC);
  const notWorstHour = !req.worstHours || !req.worstHours.map(p => p.toLowerCase()).includes(planetLC);
  const notWorstDay = !req.worstDays || !req.worstDays.includes(dayKey);
  return dayOk && hourOk && nightOk && notEnemy && notWorstHour && notWorstDay;
}

function buildDecisionAnalysis({
  ritualKey, req, matchingRules, conflictingRules,
  selectedDay, selectedHour, dayNight, selectedPlanet,
  currentHourInfo, weekday, period, saatNumber, kawkab,
  todayHours, earliest, isContextForbidden,
}) {
  // ═══════════════════════════════════════════════════════════════
  // ONE COMBINED COMPATIBILITY ANALYSIS
  // Never evaluate Day, Saat, Planet, Layl/Nahar independently.
  // The COMPLETE context (Day + Layl/Nahar + Saat + Planet) is evaluated
  // as a single unit. The verdict is based on the combined compatibility
  // of ALL dimensions together — never on individual dimensions.
  // ═══════════════════════════════════════════════════════════════

  const currentPlanet = String(currentHourInfo?.planet || kawkab || "").toLowerCase();
  const currentDayKey = DAY_KEY_BY_INDEX[weekday];

  // ── NO-DATA RULE ──
  // If no AstroClockKnowledge or ManuscriptRule records matched this purpose,
  // the context is NOT compatible — never "Suitable" without supporting data.
  const hasData = (matchingRules?.length > 0) || (conflictingRules?.length > 0);

  // ── Combined compatibility — ALL dimensions together ──
  // SINGLE SOURCE OF TRUTH: same condition as buildSelectionAnalysis.
  // Suitable when there is data AND the context is NOT forbidden.
  // isContextForbidden = purpose explicitly forbidden, OR context is evil
  // AND purpose NOT recommended. Dimension mismatches (day/hour not in
  // recommended lists) do NOT affect the verdict — only forbidden does.
  const isFullyCompatible = hasData && !isContextForbidden;

  // ── FILTER: only records for the EXACT current context ──
  // Decision → Filter → UI. Never dump all matching records.
  // Only records that DIRECTLY support/reject the CURRENT context
  // (same weekday + period + saat_number) are shown.
  // Manuscript rules (weekday=null, saat_number=null) are excluded —
  // they are raw manuscript text, not context-specific decisions.
  const contextMatchingRules = matchingRules.filter(r =>
    r.weekday === weekday && r.period === period && r.saat_number === saatNumber
  );
  const contextConflictingRules = conflictingRules.filter(r =>
    r.weekday === weekday && r.period === period && r.saat_number === saatNumber
  );

  // Only ONE short reason and ONE short rejection reason — never lists
  const rejectionReasons = [];
  const acceptanceReasons = [];

  // Show ALL context-specific rejection reasons — never just the first.
  for (const rule of contextConflictingRules) {
    if (rule.text_en || rule.text_ml) {
      rejectionReasons.push({
        text_en: rule.text_en, text_ml: rule.text_ml,
      });
    }
  }
  // Show ALL context-specific acceptance reasons — never just the first.
  for (const rule of contextMatchingRules) {
    if (rule.text_en || rule.text_ml) {
      acceptanceReasons.push({
        text_en: rule.text_en, text_ml: rule.text_ml,
      });
    }
  }

  // ── SYNCHRONIZATION GUARD ──
  // If the context is forbidden (evil without recommendation, or explicitly
  // forbidden) but no context-specific conflicting rule was collected
  // (e.g. forbidden_actions did not contain a purpose keyword), produce a
  // rejection reason from the context record's own ritual_suitability text.
  // This guarantees: every rejected verdict has at least one rejection reason.
  if (isContextForbidden && rejectionReasons.length === 0) {
    const ctxRecord = matchingRules.find(r =>
      r.weekday === weekday && r.period === period && r.saat_number === saatNumber
    ) || conflictingRules.find(r =>
      r.weekday === weekday && r.period === period && r.saat_number === saatNumber
    );
    if (ctxRecord && (ctxRecord.text_en || ctxRecord.text_ml)) {
      rejectionReasons.push({
        text_en: ctxRecord.text_en,
        text_ml: ctxRecord.text_ml,
      });
    }
  }

  // ═══ SEARCH FOR BETTER OPPORTUNITY ═══
  // Only if the current context is NOT fully compatible.
  // Priority: 1. Remaining Saat today → 2. Remaining Layl/Nahar today
  //           → 3. First future valid opportunity (from findEarliestValidTime)
  // Stop IMMEDIATELY after finding the first FULLY COMPATIBLE opportunity.
  // NEVER recommend unless the ENTIRE context is compatible.

  const betterSaats = [];
  let nextLayl = null;
  let nextDay = null;

  if (!isFullyCompatible && hasData) {
    // 1. Remaining Saat today — check ENTIRE context compatibility
    for (const h of todayHours) {
      if (h.status === "past") continue;
      const planetLC = h.planet;
      if (isContextFullyCompatible(req, currentDayKey, planetLC, h.period)) {
        // ENTIRE context is compatible — collect supporting database rules
        const whyBetter = [];
        const supportingRules = matchingRules.filter(
          r => r.saat_number === h.hourNumber && r.period === h.period
        );
        for (const rule of supportingRules) {
          if (rule.text_en || rule.text_ml) {
            whyBetter.push({ text_en: rule.text_en, text_ml: rule.text_ml });
          }
        }
        betterSaats.push({
          saatNum: saatDisplayNumEngine(h.hourNumber, h.period),
          planet: capitalPlanet(h.planet),
          startTime: h.startTime, endTime: h.endTime, period: h.period,
          whyBetter,
        });
        break; // Stop immediately — first fully compatible opportunity found
      }
    }

    // 2. Next Layl/Nahar — only if no fully compatible saat found today
    //    earliest comes from findEarliestValidTime which does a combined check
    //    across all dimensions (Day + Saat + Night requirement).
    if (betterSaats.length === 0 && earliest) {
      nextLayl = {
        dayName: earliest.dayName, period: earliest.period,
        startTime: earliest.startTime, endTime: earliest.endTime,
        planet: earliest.planet,
        saatNum: saatDisplayNumEngine(earliest.hour, earliest.period),
        daysAhead: earliest.daysAhead, isToday: earliest.isToday,
      };
    }

    // 3. No nextDay fallback — the engine NEVER recommends an alternative
    //    that is not fully compatible across ALL dimensions. A day-only
    //    check is insufficient. If no fully compatible opportunity exists
    //    within 14 days, the engine reports "no suitable opportunity."
  }

  return {
    currentSaatAnalysis: {
      suitable: isFullyCompatible,
      rejectionReasons,
      acceptanceReasons,
    },
    betterAlternatives: {
      betterSaats,
      nextLayl,
      nextDay,
      firstValidOpportunity: earliest || null,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN — analyzeRitualTiming (same return shape as V2)
// ═══════════════════════════════════════════════════════════════
export function analyzeRitualTiming({ result, selections, customPurpose, activeMethod, astroClockKnowledge, manuscriptRules, purposeLookup, planningContext, purposeKeywords }) {
  _planningOverride = planningContext || null;
  _purposeKeywordsOverride = purposeKeywords || null;
  const reasoning = [];
  const warnings = [];
  const bookNotes = [];
  const conflicts = [];
  const rulesApplied = [];

  // ── Mizan state ──
  const dominant = result?.dominant || (selections?.elements?.[0] || null);
  const khayrSharrSelected = selections?.khayrSharr8 || null;
  const selectedDay = selections?.days || null;
  const selectedHour = selections?.hour || null;
  const selectedPlanet = selections?.planet || null;
  const dayNight = selections?.dayNight || null;
  const purposes = selections?.purposes || [];

  // ── STEP 1: identify ritual from user selections ──
  const identified = identifyRitual({ selections, customPurpose, astroClockKnowledge, purposeLookup });
  const ritualKey = identified.ritualKey;
  const matchedOn = identified.matchedOn;
  // No purpose selected → continue with a "general" context so the full report
  // still renders. Purpose-specific fields will be marked as unavailable.
  const noPurposeSelected = !ritualKey;
  const effectiveRitualKey = ritualKey || "general";
  reasoning.push(`Ritual identified as "${effectiveRitualKey}" via ${matchedOn}.`);
  rulesApplied.push({
    id: "IDENTIFY",
    desc: `Ritual classified as ${effectiveRitualKey} (${matchedOn})`,
    source: "Purpose Dictionary",
  });

  // ── STEP 2: gather context from the Astrology Clock ──
  const { req, moonReq, citations, moonCitations, dbRuleCount, matchingRules, conflictingRules } = gatherRulesFromAstroClock(effectiveRitualKey, astroClockKnowledge);
  const msRules = gatherManuscriptRulesForPurpose(effectiveRitualKey, manuscriptRules);
  const allMatchingRules = [...matchingRules, ...msRules.matching];
  const allConflictingRules = [...conflictingRules, ...msRules.conflicting];
  reasoning.push(`Astrology Clock: ${dbRuleCount} matching context record(s) for this purpose.`);
  for (const c of citations) {
    rulesApplied.push({ id: c.rule_id, desc: c.summary || `Astro Clock context`, source: c.source });
    bookNotes.push({ source: c.source, text: c.summary || "Astrology Clock" });
  }

  // ── Polarity (only if explicitly selected; never invent) ──
  const khayrSharr = khayrSharrSelected || null;

  // ── STEP 3+4: EFFECTIVE CONTEXT — SELECTIONS ARE THE SINGLE SOURCE OF TRUTH ──
  // The engine NEVER reads from the CURRENT badge. It ALWAYS reads from the
  // SELECTED Mizan cards (selections object), which are auto-initialized to
  // current/planning values by buildDefaultSelections and updated by user clicks.
  // Planning Mode provides the astronomical reference (sunrise/sunset/hours table)
  // but does NOT override the Mizan selections.
  const now = planningContext?.date || new Date();
  const nowData = getTodayAllHours(now);
  const sunrise = nowData.sunrise;
  const sunset = nowData.sunset;

  // Timezone-corrected now — used ONLY for weekday resolution in resolveManuscriptDay
  // (to find the next occurrence of the selected weekday on the civil calendar).
  // NEVER used for current-hour detection — the engine does not compute the
  // "current Saat" independently. It reads ONLY from selections.
  const liveLoc = _planningOverride?.location || getUserLocation();
  const liveTzDiffMs = (liveLoc.timezone * 60 + now.getTimezoneOffset()) * 60 * 1000;
  const liveNowDate = new Date(now.getTime() + liveTzDiffMs);

  // ── Effective Day (from selections.days — ALWAYS set by buildDefaultSelections) ──
  const { activeDayIndex, referenceDate } = resolveManuscriptDay(selectedDay, dayNight, liveNowDate, sunrise, sunset);
  const refData = getTodayAllHours(referenceDate);
  const todayHours = refData.hours;

  // ── Effective Saat + Kawkab (from selections.hour + selections.dayNight) ──
  // Saat number and period come DIRECTLY from the selected cards — NEVER from
  // live current-hour detection. getAllPlanetaryHours numbers night hours 13-24,
  // so for night Saats (1-12 from Mizaan4) we add 12 to match the table index.
  const effectivePeriod = dayNight === "gece" ? "night" : "day";
  const effectiveSaatNum = selectedHour || 1;
  const effectiveHourNumber = effectivePeriod === 'night' ? effectiveSaatNum + 12 : effectiveSaatNum;
  const foundSaat = todayHours.find(h => h.hourNumber === effectiveHourNumber && h.period === effectivePeriod)
    || todayHours.find(h => h.hourNumber === effectiveHourNumber)
    || todayHours[0];

  // ── Kawkab from manuscript Planetary Hours table (NOT from Day ruler) ──
  // selections.planet is synced by Mizaan9Page via getKawkabForSaat(saat, day, dayNight),
  // which reads DIRECTLY from the manuscript Day/Night Saat tables. This override
  // ensures the Kawkab is ALWAYS the planetary ruler of the selected Saat — never
  // the planetary ruler of the selected Day.
  // Example: Tuesday + Day Saat 11 → Mercury (from table), NOT Mars (Day ruler).
  // hourNumber is also overridden to show the Mizaan4 Saat number (1-12), not the
  // internal getAllPlanetaryHours number (13-24 for night).
  const manuscriptKawkab = selectedPlanet ? (MIZAN_TO_EN_PLANET[selectedPlanet] || "").toLowerCase() : null;
  const currentHourInfo = foundSaat
    ? { ...foundSaat, planet: manuscriptKawkab || foundSaat.planet, hourNumber: effectiveSaatNum }
    : foundSaat;

  const dayRuler = getDayRuler(activeDayIndex);
  const moonPhase = getMoonPhase(referenceDate);
  const currentDayKey = DAY_KEY_BY_INDEX[activeDayIndex];
  const isNightTime = effectivePeriod === 'night';

  reasoning.push(`Current: ${MIZAN_DAY_NAMES[currentDayKey]}, hour #${currentHourInfo.hourNumber} (${currentHourInfo.planet}), ${isNightTime ? "night" : "day"}.`);

  // ── SINGLE SOURCE OF TRUTH: context forbidden evaluation ──
  // Computed ONCE here, used by canPerformToday, buildSelectionAnalysis,
  // and buildDecisionAnalysis. Reject ONLY when: purpose explicitly
  // forbidden, OR context is evil AND purpose NOT recommended.
  const _earlyWeekday = activeDayIndex;
  const _earlyPeriod = effectivePeriod;
  const _earlySaatNumber = effectiveHourNumber;
  const _earlyKawkab = manuscriptKawkab || (foundSaat ? foundSaat.planet : null);
  const _earlyContextRecords = lookupContextRecord(astroClockKnowledge, _earlyWeekday, _earlyPeriod, _earlySaatNumber, _earlyKawkab);
  const _earlyContextRecord = _earlyContextRecords[0] || null;
  const _earlyPurposeRec = purposeInRecommended(_earlyContextRecord, effectiveRitualKey);
  const _earlyPurposeForb = purposeInForbidden(_earlyContextRecord, effectiveRitualKey);
  const _earlyEvilCtx = isEvilContext(_earlyContextRecord);
  const isContextForbidden = _earlyPurposeForb || (_earlyEvilCtx && !_earlyPurposeRec);

  // ── Can perform today? ──
  // NO-DATA RULE: If no AstroClockKnowledge records matched this purpose,
  // canPerformToday is "No" — never "Yes" or "Limited".
  // SINGLE SOURCE OF TRUTH: uses isContextForbidden, same as verdict.
  let canPerformToday = "No";
  if (dbRuleCount === 0 && msRules.matching.length === 0 && msRules.conflicting.length === 0) {
    canPerformToday = "No";
  }
  else if (!isContextForbidden) canPerformToday = "Yes";
  else {
    // search remaining today for a non-forbidden saat
    const todayRemaining = todayHours.filter((h) => h.status !== "past");
    const anyOk = todayRemaining.some((h) => {
      const altRecords = lookupContextRecord(astroClockKnowledge, _earlyWeekday, h.period, h.hourNumber, h.planet);
      const altRec = altRecords[0] || null;
      const altPurposeRec = purposeInRecommended(altRec, effectiveRitualKey);
      const altPurposeForb = purposeInForbidden(altRec, effectiveRitualKey);
      const altEvil = isEvilContext(altRec);
      const altForbidden = altPurposeForb || (altEvil && !altPurposeRec);
      return !altForbidden;
    });
    if (anyOk) canPerformToday = "Limited";
  }

  // currentMomentSuitable retained for report compatibility — same source of truth
  const currentMomentSuitable = !isContextForbidden;

  // ── Today's windows (rule-matched, star-rated) ──
  // NO-DATA GUARD: Only populate windows if the Astro Clock has data for this purpose.
  const hasTimingData = !!(req.hours || req.worstHours || req.worstDays || req.enemyPlanets?.length || req.days || req.nightRequired);
  const bestWindowsToday = [];
  const avoidWindowsToday = [];
  const passedWindowsToday = [];
  for (const h of todayHours) {
    const planetLC = h.planet;
    const isBest = hasTimingData && (!req.hours || req.hours.map((p) => p.toLowerCase()).includes(planetLC));
    const isWorst = (req.worstHours && req.worstHours.map((p) => p.toLowerCase()).includes(planetLC)) ||
                    (req.enemyPlanets && req.enemyPlanets.map((p) => p.toLowerCase()).includes(planetLC));
    if (h.status === "past") {
      // Collect suitable windows that have already passed today
      if (isBest && !isWorst) {
        passedWindowsToday.push({
          startTime: h.startTime, endTime: h.endTime, planet: capitalPlanet(planetLC),
          hourNumber: h.hourNumber, period: h.period,
          reason: "hour matches manuscript prescription",
        });
      }
      continue;
    }
    if (isBest && !isWorst) {
      let s = 50;
      const r = [];
      if (req.hours && req.hours.map((p) => p.toLowerCase()).includes(planetLC)) { s += 25; r.push("hour matches manuscript prescription"); }
      if (req.nightRequired === true && h.period === "night") { s += 12; r.push("night hour as required"); }
      bestWindowsToday.push({
        startTime: h.startTime, endTime: h.endTime, planet: capitalPlanet(planetLC),
        hourNumber: h.hourNumber, period: h.period,
        score: Math.min(100, s), stars: scoreToStars(Math.min(100, s)),
        reason: r.join("; ") || "available hour",
      });
    }
    if (isWorst) {
      avoidWindowsToday.push({ startTime: h.startTime, endTime: h.endTime, planet: capitalPlanet(planetLC), hourNumber: h.hourNumber, period: h.period, reason: "enemy/worst planet per manuscript" });
    }
  }

  // ── STEP 5: earliest valid time ──
  const earliest = findEarliestValidTime(req, now);

  // ── TWO-LEVEL PER-HOUR ANALYSIS (Day → Hour) ──
  // Every planetary hour inside the selected weekday is evaluated independently
  // by its exact context record (Day + Period + Saat + Planet). A weekday is
  // never blanket-forbidden — only the specific hours the book rules forbid are
  // forbidden; only the specific hours the book rules recommend are allowed.
  const dayHourBreakdown = buildDayHourBreakdown(astroClockKnowledge, effectiveRitualKey, referenceDate);
  const allowedTimeline = collectAllowedTimeline(astroClockKnowledge, effectiveRitualKey, now, 29);
  const weekBreakdown = buildWeekBreakdown(astroClockKnowledge, effectiveRitualKey, now);

  // ── SELECTION ANALYSIS: Astro Clock interpreter for the selected context ──
  const astroWeekday = activeDayIndex;
  const astroPeriod = effectivePeriod;
  const astroSaatNumber = effectiveHourNumber;
  const astroKawkab = manuscriptKawkab || (foundSaat ? foundSaat.planet : null);

  const selectionAnalysis = buildSelectionAnalysis({
    selections, req, astroClockKnowledge, ritualKey: effectiveRitualKey, noPurposeSelected,
    earliest, todayHours,
    dayNight, selectedDay, selectedHour, selectedPlanet,
    currentHourInfo,
    weekday: astroWeekday, period: astroPeriod,
    saatNumber: astroSaatNumber, kawkab: astroKawkab,
  });

  // ── VERDICT FROM ASTROLOGY CLOCK — original text only ──
  // The verdict uses the Astro Clock's own ritual_suitability assessment.
  // Forbidden: the Astro Clock marks this context as evil/malefic or the
  //   purpose appears in forbidden_actions.
  // Suitable: the purpose appears in recommended_actions or the Astro Clock
  //   marks this context as good/benefic.
  // Not Suitable: otherwise.
  // The verdictReason is the ORIGINAL Astro Clock text — never generated.
  const saBreakdown = selectionAnalysis?.decisionBreakdown || [];
  const failedItems = saBreakdown.filter(b => b.status === "fail");
  const passedItems = saBreakdown.filter(b => b.status === "pass");

  let verdict, verdictColor, verdictReason;
  // Only THREE verdicts: Suitable, Partially Suitable, Not Suitable.
  // "Forbidden" is mapped to "Not Suitable" — no other verdicts exist.
  // NO-DATA RULE: If no AstroClockKnowledge records matched this purpose
  // (dbRuleCount === 0), the verdict is "Not Suitable" — never "Suitable."
  // The engine must never approve a context when no data supports it.
  const noDataForPurpose = dbRuleCount === 0 && (msRules.matching.length === 0 && msRules.conflicting.length === 0);
  if (noDataForPurpose) {
    verdict = "Not Suitable"; verdictColor = "#F87171";
    verdictReason = "No timing data found for this purpose in the Astrology Clock.";
  }
  else if (selectionAnalysis?.forbidden) {
    verdict = "Not Suitable"; verdictColor = "#F87171";
    verdictReason = selectionAnalysis.originalSuitability
      || (failedItems.find(b => b.dimension === "forbidden")?.reason)
      || "";
  }
  else if (selectionAnalysis?.suitable) {
    verdict = "Suitable"; verdictColor = "#4ADE80";
    verdictReason = selectionAnalysis.originalSuitability
      || (passedItems.length > 0 ? passedItems.map(p => p.reason).join(" ") : "")
      || "";
  }
  else {
    verdict = "Not Suitable"; verdictColor = "#F87171";
    verdictReason = selectionAnalysis.originalSuitability
      || (failedItems.length > 0 ? failedItems.map(f => f.reason).join(" ") : "")
      || "";
  }

  // ── Warnings from the Astrology Clock's warnings_list (original text) ──
  if (selectionAnalysis.originalWarnings && selectionAnalysis.originalWarnings.length > 0) {
    for (const w of selectionAnalysis.originalWarnings) {
      warnings.push(w.en || "");
    }
  }
  if (req.days && !req.days.includes(currentDayKey)) warnings.push(`${MIZAN_DAY_NAMES[currentDayKey]} is not recommended. Astrology Clock recommends: ${req.days.map((d) => MIZAN_DAY_NAMES[d]).join(", ")}.`);
  if (req.nightRequired === true && !isNightTime) warnings.push("The Astrology Clock requires this work at Night (Layl).");

  // ── Astro Clock status ──
  const astroClockStatus = {
    day: MIZAN_DAY_NAMES[currentDayKey], activeWeekday: activeDayIndex, dayRuler: dayRuler.planet,
    currentHour: { number: currentHourInfo.hourNumber, planet: capitalPlanet(currentHourInfo.planet), symbol: PLANET_INFO[currentHourInfo.planet]?.symbol || "" },
    isDaytime: !isNightTime, hourRemaining: currentHourInfo.remainingTime,
    nextPlanet: PLANET_SEQUENCE[(PLANET_SEQUENCE.indexOf(currentHourInfo.planet) + 1) % 7] || "",
    summary: `Today is ${MIZAN_DAY_NAMES[currentDayKey]} (ruled by ${dayRuler.planet}). Current hour #${currentHourInfo.hourNumber} (${currentHourInfo.planet}), ${isNightTime ? "night" : "day"}, ${currentHourInfo.remainingTime} left.`,
  };

  // ── LIVE NOW — effective context display (single source of truth) ──
  // Always uses the effective values: manual selection when selected, live
  // auto-detection when not. No separate live calculation — the effective
  // context IS the display context. Summary text distinguishes selected vs live.
  const hasManualSelection = !!(selectedDay || selectedHour);
  const liveNow = {
    day: MIZAN_DAY_NAMES[currentDayKey],
    dayRuler: dayRuler.planet,
    laylNahar: isNightTime ? "Layl" : "Nahar",
    saat: currentHourInfo.hourNumber,
    kawkab: capitalPlanet(currentHourInfo.planet),
    planetaryHour: capitalPlanet(currentHourInfo.planet),
    currentHour: { number: currentHourInfo.hourNumber, planet: capitalPlanet(currentHourInfo.planet), symbol: PLANET_INFO[currentHourInfo.planet]?.symbol || "" },
    isDaytime: !isNightTime,
    hourRemaining: currentHourInfo.remainingTime || "",
    summary: hasManualSelection
      ? `Selected: ${MIZAN_DAY_NAMES[currentDayKey]} (ruled by ${dayRuler.planet}), ${isNightTime ? "Layl (night)" : "Nahar (day)"}. Saat #${currentHourInfo.hourNumber} (${capitalPlanet(currentHourInfo.planet)}).`
      : `Now is ${MIZAN_DAY_NAMES[currentDayKey]} (ruled by ${dayRuler.planet}), ${isNightTime ? "Layl (night)" : "Nahar (day)"}. Saat #${currentHourInfo.hourNumber} (${capitalPlanet(currentHourInfo.planet)}).`,
  };

  // ═══════════════════════════════════════════════════════════════
  // BUILD 10-SECTION REPORT (same shape as V2)
  // ═══════════════════════════════════════════════════════════════
  const report = [];
  // Canonical display label: full resolved phrase (Action + Purpose + Modifier),
  // never the isolated dictionary keyword. Falls back to ritual-key label only
  // when no dictionary match produced a resolved phrase.
  const ritualTypeLabel = identified.resolvedPhraseEn
    || (effectiveRitualKey.charAt(0).toUpperCase() + effectiveRitualKey.slice(1) + " Work");

  report.push({
    section: "TODAY ANALYSIS", icon: "calendar", status: canPerformToday,
    body: canPerformToday === "Yes" ? `Yes — the Astrology Clock confirms this timing for your purpose. You may proceed now.`
      : canPerformToday === "Limited" ? `Partially suitable — some valid hours remain today, but the current moment is not ideal.`
      : `No — the Astrology Clock does not recommend today for this purpose. ${req.days ? `Recommended day(s): ${req.days.map((d) => MIZAN_DAY_NAMES[d]).join(", ")}.` : ""}`,
    citation: citations.map((c) => c.source).join("; ") || "Astrology Clock",
    consequence: "Proceeding against the Astrology Clock weakens or reverses the ritual.",
  });

  report.push({
    section: "CURRENT MOMENT", icon: "clock", status: currentMomentSuitable ? "Suitable" : "Not suitable",
    body: currentMomentSuitable
      ? `The current moment satisfies the Astrology Clock: Saat ${capitalPlanet(currentHourInfo.planet)}, ${isNightTime ? "Layl (night)" : "Nahar (day)"}. Act now.`
      : `The current moment does NOT satisfy the Astrology Clock. Saat: ${capitalPlanet(currentHourInfo.planet)}. ${req.hours ? `Recommended Saat(s): ${req.hours.join(", ")}.` : ""} ${req.nightRequired === true ? "Layl (night) required." : ""} ${earliest ? `Next valid opportunity: ${earliest.dayName}${earliest.isToday ? " (today)" : ""} at ${earliest.startTime}–${earliest.endTime} (${earliest.planet}).` : ""}`,
    citation: citations.map((c) => c.source).join("; ") || "Astrology Clock",
    consequence: "Acting outside the Astrology Clock window wastes the ritual.",
    waitTime: earliest ? (earliest.isToday ? "later today" : `${earliest.daysAhead}d`) : null,
  });

  report.push({
    section: "TODAY'S WINDOWS", icon: "windows", status: `${bestWindowsToday.length} available`,
    windows: bestWindowsToday.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((w) => ({
      time: `${w.startTime}–${w.endTime}`, stars: starsToString(w.stars), planet: w.planet, hourNumber: w.hourNumber, period: w.period,
      reason: w.reason, strengthReason: `${starsToString(w.stars)} — ${w.reason}`,
    })),
    body: bestWindowsToday.length > 0 ? `Astrology Clock windows today, aligned with your purpose.` : `No Astrology Clock windows remain today.`,
    citation: citations.map((c) => c.source).join("; ") || "Astrology Clock",
    consequence: "These are your power windows per the Astrology Clock.",
  });

  const ranked = [...bestWindowsToday].sort((a, b) => b.score - a.score).slice(0, 3).map((w, i) => ({ ...w, rank: i + 1 }));
  report.push({
    section: "BEST TIME", icon: "star", status: `${ranked.length} ranked`,
    ranked: ranked.map((w) => ({
      rank: w.rank, time: `${w.startTime}–${w.endTime}`, stars: starsToString(w.stars), planet: w.planet,
      reason: w.rank === 1 ? `Best window today. ${w.reason}.` : `Rank ${w.rank} fallback. ${w.reason}.`,
    })),
    body: ranked.length > 0 ? `Top hours today per the Astrology Clock.` : `No ranked windows today — see next opportunity.`,
    citation: citations.map((c) => c.source).join("; ") || "Astrology Clock",
    consequence: "Starting at the wrong hour means the ruling planet does not govern the request.",
  });

  report.push({
    section: "BAD TIMES", icon: "alert", status: `${avoidWindowsToday.length} to avoid`,
    avoid: avoidWindowsToday.map((w) => ({ time: `${w.startTime}–${w.endTime}`, planet: w.planet, reason: w.reason })),
    enemyAnalysis: {
      enemyHours: req.worstHours || req.enemyPlanets || [],
      enemyDays: req.worstDays || [],
      enemyMoonPhases: [],
      enemyRulers: req.enemyPlanets || [],
      note: req.enemyPlanets?.length ? `Astrology Clock identifies ${req.enemyPlanets.join(", ")} as enemy planets for this work.` : `No enemy planets for this purpose in the Astrology Clock.`,
    },
    body: avoidWindowsToday.length > 0 ? `Avoid these hours today per the Astrology Clock: ${avoidWindowsToday.map((w) => `${w.startTime}–${w.endTime} (${w.planet})`).join("; ")}.` : `No specifically dangerous hours found today.`,
    citation: citations.map((c) => c.source).join("; ") || "Astrology Clock",
    consequence: "Performing in an enemy hour can cause the ritual to rebound.",
  });

  report.push({
    section: "IF TODAY IS NOT GOOD", icon: "calendar-clock", status: earliest ? `Next: ${earliest.dayName}` : "No window in 14 days",
    nextHour: earliest ? { day: earliest.dayName, time: `${earliest.startTime}–${earliest.endTime}`, planet: earliest.planet, isToday: earliest.isToday, daysAhead: earliest.daysAhead } : null,
    nextMoonPhase: null,
    body: earliest
      ? `Next valid opportunity: ${earliest.dayName}${earliest.isToday ? " (today)" : ` (${earliest.daysAhead} day(s) ahead)`}, ${earliest.startTime}–${earliest.endTime} (${earliest.planet} Saat, Saat #${earliest.hour}). This is the first time all Day + Saat conditions are satisfied per the Astrology Clock within the next 14 days.`
      : `No valid opportunity found within 14 days per the Astrology Clock.`,
    citation: citations.map((c) => c.source).join("; ") || "Astrology Clock",
    consequence: "Waiting for the valid time ensures full ritual power.",
  });

  report.push({
    section: "ASTRO ANALYSIS", icon: "globe", status: `${astroClockStatus.day} / ${astroClockStatus.currentHour.planet}`,
    body: `${MIZAN_DAY_NAMES[currentDayKey]} (ruled by ${dayRuler.planet}). Saat #${currentHourInfo.hourNumber} (${currentHourInfo.planet}), ${isNightTime ? "Layl (night)" : "Nahar (day)"}, ${currentHourInfo.remainingTime} left. ${verdictReason}`,
    citation: "Astrology Clock (read-only)",
    consequence: "Composite of all Astrology Clock conditions.",
    details: { dayRuler: dayRuler.planet, currentHour: currentHourInfo, moonPhase, verdict },
  });

  report.push({
    section: "MANUSCRIPT EXPLANATION", icon: "book", status: `${rulesApplied.length} context records`,
    rules: rulesApplied,
    body: selectionAnalysis.originalExplanation
      || `Every recommendation is grounded in the Astrology Clock. ${citations.length} context record(s) found for this purpose.`,
    citation: "Astrology Clock (sole authority)",
    consequence: "Each explanation comes directly from the Astrology Clock data.",
  });

  report.push({
    section: "WARNING SECTION", icon: "alert-triangle", status: warnings.length > 0 ? `${warnings.length} warnings` : "No warnings",
    warnings, conflicts,
    body: warnings.length > 0 ? warnings.map((w) => `⚠ ${w}`).join(" ") : `No warnings — the Astrology Clock conditions are satisfied.`,
    citation: "Astrology Clock",
    consequence: "Each warning comes from the Astrology Clock.",
  });

  report.push({
    section: "FINAL DECISION", icon: "sparkles", status: verdict, color: verdictColor,
    body: `${verdict}. ${verdictReason} ${canPerformToday === "Yes" ? "You may proceed now." : canPerformToday === "Limited" ? "Some valid hours remain today — proceed with caution or wait for the valid time." : "Postpone to the valid opportunity."}`,
    citation: "Astrology Clock",
    consequence: selectionAnalysis?.suitable ? "The Astrology Clock confirms this timing." : selectionAnalysis?.forbidden ? "Forbidden by the Astrology Clock — do not proceed." : "Adjust the recommended fields per the Astrology Clock.",
  });

  // ── Expert narrative (from the Astrology Clock) ──
  const expertNarrative = [];
  expertNarrative.push(`This ritual has been identified as "${ritualTypeLabel}" from your Mizan results and custom purpose (${matchedOn}).`);
  if (dbRuleCount > 0) expertNarrative.push(`${dbRuleCount} Astrology Clock context record(s) found for this purpose. All recommendations come from the Astrology Clock.`);
  else expertNarrative.push(`No matching context found in the Astrology Clock for this purpose — timing is guided by general planetary conditions only.`);
  if (req.days) expertNarrative.push(`The Astrology Clock recommends day(s): ${req.days.map((d) => MIZAN_DAY_NAMES[d]).join(", ")}.`);
  if (req.hours) expertNarrative.push(`The Astrology Clock recommends Saat(s) ruled by: ${req.hours.join(", ")}.`);
  if (req.nightRequired === true) expertNarrative.push(`The Astrology Clock requires this work at Night (Layl).`);
  if (earliest) expertNarrative.push(`The next valid opportunity is ${earliest.dayName}${earliest.isToday ? " (today)" : ` (${earliest.daysAhead} day(s) away)`} at ${earliest.startTime}–${earliest.endTime}.`);
  if (!req.days && !req.hours) expertNarrative.push(`No specific day or Saat restriction was found in the Astrology Clock for this ritual — timing is guided by general planetary conditions only.`);

  const decisionAnalysis = buildDecisionAnalysis({
    ritualKey: effectiveRitualKey, req, matchingRules: allMatchingRules, conflictingRules: allConflictingRules,
    selectedDay, selectedHour, dayNight, selectedPlanet,
    currentHourInfo, weekday: astroWeekday, period: astroPeriod,
    saatNumber: astroSaatNumber, kawkab: astroKawkab,
    todayHours, earliest,
    isContextForbidden,
  });

  // ── REJECTION REASON GUARANTEE ──
  // Every rejected verdict must include at least one rejection reason.
  // Case 1: No timing data exists for this purpose → no-data reason.
  // Case 2: Context is forbidden (evil without recommendation) but no
  //         context-specific rule text was collected → use the context
  //         record's own ritual_suitability text as the rejection reason.
  // This guarantees: suitable=false ALWAYS has rejectionReasons.length > 0.
  if (decisionAnalysis.currentSaatAnalysis.rejectionReasons.length === 0) {
    if (noDataForPurpose) {
      decisionAnalysis.currentSaatAnalysis.rejectionReasons.push({
        text_en: "No timing data found for this purpose in the Astrology Clock.",
        text_ml: "",
      });
    } else if (isContextForbidden && _earlyContextRecord) {
      decisionAnalysis.currentSaatAnalysis.rejectionReasons.push({
        text_en: _earlyContextRecord.ritual_suitability || _earlyContextRecord.knowledge_text_en || "This timing is not suitable for the selected purpose per the Astrology Clock.",
        text_ml: _earlyContextRecord.knowledge_text_ml || "",
      });
    }
  }

  return {
    report, consultation: report,
    noPurposeSelected,
    verdict, verdictColor, verdictReason,
    ritualType: ritualTypeLabel, ritualTypeDescription: "", ritualCategory: ritualTypeLabel, ritualIntent: ritualTypeLabel,
    ritualSemanticMl: identified.resolvedPhraseMl || null,
    khayrSharr: khayrSharr || "Not selected", khayrSharrInferred: false,
    khayrSharrMeaning: khayrSharr === "khayr" ? "Benevolence" : khayrSharr === "sharr" ? "Power/Banishment" : "Not determined",
    canPerformToday,
    currentMomentSuitable,
    waitTime: earliest ? (earliest.isToday ? "later today" : `${earliest.daysAhead}d`) : null,
    bestWindowsToday, rankedWindows: ranked, topThree: ranked, avoidWindowsToday, passedWindowsToday,
    enemyAnalysis: { enemyHours: req.worstHours || req.enemyPlanets || [], enemyDays: req.worstDays || [], enemyMoonPhases: [], enemyRulers: req.enemyPlanets || [], note: "" },
    nextOpportunity: earliest, nextMoonPhase: null,
    moonPhase: {
      lunarDay: moonPhase.lunarDay, phaseName: moonPhase.phaseName,
      isWaxing: moonPhase.isWaxing, isNewMoon: moonPhase.isNewMoon, isFullMoon: moonPhase.isFullMoon,
      moonSign: moonPhase.moonSign, moonSignMl: moonPhase.moonSignMl, moonSignSymbol: moonPhase.moonSignSymbol,
      moonMansion: moonPhase.moonMansion, moonMansionArabic: moonPhase.moonMansionArabic, moonMansionNumber: moonPhase.moonMansionNumber,
      moonLongitude: moonPhase.moonLongitude, moonIllumination: moonPhase.moonIllumination,
    },
    moonReq,
    moonCitations,
    req,
    dayHourBreakdown,
    weekBreakdown,
    allowedTimeline,
    bestPlanetaryHour: req.hours?.[0] || null, bestRulingPlanet: req.planet?.[0] || req.hours?.[0] || null,
    bestDay: req.days?.[0] ? MIZAN_DAY_NAMES[req.days[0]] : null,
    bestDayReason: req.days ? `Astrology Clock recommends ${req.days.map((d) => MIZAN_DAY_NAMES[d]).join(", ")}` : "No day restriction in the Astrology Clock",
    bestHourReason: req.hours ? `Astrology Clock recommends ${req.hours.join(", ")} Saat(s)` : "No Saat restriction in the Astrology Clock",
    altDay: req.days?.[1] ? MIZAN_DAY_NAMES[req.days[1]] : null, altHour: req.hours?.[1] || null,
    dayNightSuitability: {
      status: req.nightRequired === true ? (isNightTime ? "optimal" : "forbidden") : "neutral",
      reason: req.nightRequired === true ? (isNightTime ? "Night, as required." : "Day, but night required.") : "No night restriction in the Astrology Clock.",
      citation: "Astrology Clock",
    },
    zodiacSuitability: { assessed: false, note: "Zodiac analysis is optional — use the Moon Analysis card." },
    elementCompatibility: { assessed: false, status: "neutral", reason: "Element analysis is not part of the Astrology Clock interpreter." },
    elementDirection: null,
    elementPlacement: null,
    astroClockStatus,
    liveNow,
    recommendedStart: ranked[0]?.startTime || earliest?.startTime || null,
    recommendedEnd: ranked[0]?.endTime || earliest?.endTime || null,
    recommendedIncense: null,
    selectionAnalysis,
    rulesApplied, warnings, bookNotes, conflicts, expertNarrative, reasoning,
    matchingRules: allMatchingRules,
    conflictingRules: allConflictingRules,
    currentSaatAnalysis: decisionAnalysis.currentSaatAnalysis,
    betterAlternatives: decisionAnalysis.betterAlternatives,
  };
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION ADVISOR — compares current Mizan vs manuscript ideal.
// Same return shape as V2.
// ═══════════════════════════════════════════════════════════════
export function analyzeConfigurationAdvice({ result, selections, customPurpose, activeMethod, astroClockKnowledge, purposeLookup, planningContext, purposeKeywords }) {
  const base = analyzeRitualTiming({ result, selections, customPurpose, activeMethod, astroClockKnowledge, purposeLookup, planningContext, purposeKeywords });
  const noPurposeSelected = !!base?.noPurposeSelected;
  const { ritualKey } = identifyRitual({ selections, customPurpose, astroClockKnowledge, purposeLookup });
  const effectiveRitualKey = ritualKey || "general";
  const { req, citations } = gatherRulesFromAstroClock(effectiveRitualKey, astroClockKnowledge);

  const selectedDay = selections?.days || null;
  const selectedHour = selections?.hour || null;
  const dayNight = selections?.dayNight || null;
  const now = planningContext?.date || new Date();
  const nowDataAdv = getTodayAllHours(now);
  const { referenceDate: cfgRefDate } = resolveManuscriptDay(selectedDay, dayNight, now, nowDataAdv.sunrise, nowDataAdv.sunset);
  const bestWindow = base.bestWindowsToday?.[0];

  const recommendations = [];
  let allOptimal = true;

  const purposeLabel = base?.ritualType || (effectiveRitualKey.charAt(0).toUpperCase() + effectiveRitualKey.slice(1) + " Work");
  const identifiedAdv = identifyRitual({ selections, customPurpose, astroClockKnowledge, purposeLookup });

  // 1. Ritual Purpose — identified first
  recommendations.push({
    field: "Ritual Purpose", icon: "target",
    current: noPurposeSelected ? "No Purpose Selected" : purposeLabel,
    recommended: noPurposeSelected ? "Select a Purpose in Mizan 7" : purposeLabel,
    isOptimal: !noPurposeSelected,
    reason: noPurposeSelected
      ? "No purpose selected. Purpose-specific recommendations are unavailable. Select a purpose to receive targeted Astrology Clock advice."
      : `Ritual identified as ${effectiveRitualKey} from Purpose Dictionary (${identifiedAdv.matchedOn}). This is the basis for all Astrology Clock lookups.`,
  });

  // 2. Better Day — only if the Astro Clock recommends specific days
  const dayOptimal = !req.days || (selectedDay && req.days.includes(selectedDay));
  if (req.days && !dayOptimal) allOptimal = false;
  recommendations.push({
    field: "Selected Weekday (Mizan 5)", icon: "calendar",
    current: selectedDay ? MIZAN_DAY_NAMES[selectedDay] : "Not selected",
    recommended: req.days ? req.days.map((d) => MIZAN_DAY_NAMES[d]).join(" or ") : "No day restriction in the Astrology Clock",
    isOptimal: dayOptimal,
    reason: !req.days ? "The Astrology Clock does not prescribe a specific day for this purpose."
      : !selectedDay ? `The Astrology Clock recommends ${req.days.map((d) => MIZAN_DAY_NAMES[d]).join(", ")}. Select one of these days.`
      : dayOptimal ? `Your selected day matches the Astrology Clock.`
      : `Your day is ${MIZAN_DAY_NAMES[selectedDay]}, but the Astrology Clock recommends ${req.days.map((d) => MIZAN_DAY_NAMES[d]).join(", ")}.`,
  });

  // 3. Better Saat — only if the Astro Clock recommends specific Saats
  // Kawkab is NEVER recommended separately — it is auto-derived from the Saat.
  const { hours: todayHours } = getTodayAllHours(cfgRefDate);
  const recommendedHourNumbers = req.hours ? findHoursByPlanet(todayHours, req.hours[0]).map((h) => h.hourNumber) : [];
  const hourOptimal = !req.hours || (selectedHour && recommendedHourNumbers.includes(selectedHour));
  if (req.hours && !hourOptimal) allOptimal = false;
  recommendations.push({
    field: "Selected Saat (Mizan 4)", icon: "clock",
    current: selectedHour ? `Saat #${selectedHour}` : "Not selected",
    recommended: recommendedHourNumbers.length > 0 ? `Saat #${recommendedHourNumbers.join(" or #")}` : (req.hours ? `${req.hours.join(" Saat")}` : "No Saat restriction in the Astrology Clock"),
    isOptimal: hourOptimal,
    reason: !req.hours ? "The Astrology Clock does not prescribe a specific Saat for this purpose."
      : !selectedHour ? `The Astrology Clock recommends ${req.hours.join(", ")} Saat(s). Available today: ${base.bestWindowsToday?.map((w) => `${w.startTime}–${w.endTime}`).join(", ") || "none remain"}.`
      : hourOptimal ? `Your Saat matches the Astrology Clock.`
      : `Your Saat is #${selectedHour}, but the Astrology Clock recommends ${req.hours.join(", ")}.`,
  });

  // 4. Better Layl/Nahar — only if the Astro Clock requires night
  recommendations.push({
    field: "Layl / Nahar (Mizan 3)", icon: "sunset",
    current: dayNight ? (dayNight === "gunduz" ? "Nahar (Day)" : "Layl (Night)") : "Not selected",
    recommended: req.nightRequired === true ? "Layl (Night)" : "No night restriction in the Astrology Clock",
    isOptimal: req.nightRequired !== true || dayNight === "gece",
    reason: req.nightRequired === true
      ? (dayNight === "gece" ? "You selected Layl (Night), as required by the Astrology Clock." : "The Astrology Clock requires Layl (Night) for this purpose.")
      : "The Astrology Clock does not require a specific Layl/Nahar for this purpose.",
  });
  if (req.nightRequired === true && dayNight !== "gece") allOptimal = false;

  // 5. Next available suitable timing
  const _advLoc = getUserLocation();
  const currentClock = now.toLocaleTimeString("en-US", { timeZone: _advLoc.tz || undefined, hour: "2-digit", minute: "2-digit" });
  recommendations.push({
    field: "Next Available Suitable Timing", icon: "timer",
    current: `Now: ${currentClock}`,
    recommended: bestWindow ? `${bestWindow.startTime}–${bestWindow.endTime}` : (base.nextOpportunity ? `${base.nextOpportunity.startTime}–${base.nextOpportunity.endTime} (${base.nextOpportunity.dayName})` : "No valid time in 14 days"),
    isOptimal: bestWindow && base.currentMomentSuitable,
    reason: !bestWindow
      ? `No valid window today. Next opportunity: ${base.nextOpportunity ? `${base.nextOpportunity.dayName} ${base.nextOpportunity.startTime}` : "none in 14 days"}.`
      : base.currentMomentSuitable
        ? `Current moment is within a suitable window (${bestWindow.startTime}–${bestWindow.endTime}).`
        : `Wait until ${bestWindow.startTime}–${bestWindow.endTime} (${bestWindow.planet} Saat) per the Astrology Clock.`,
  });
  if (bestWindow && !base.currentMomentSuitable) allOptimal = false;

  return { recommendations, allOptimal, base, noPurposeSelected };
}

// ═══════════════════════════════════════════════════════════════
// MOON COMPATIBILITY ANALYSIS — Optional, user-initiated
// ═══════════════════════════════════════════════════════════════
// Called by MoonAnalysisCard ONLY when the user presses "Analyze Moon
// Compatibility". Loads ONLY Moon rules (moonReq) for the current ritual.
// If no Moon rule exists in the manuscript, returns hasMoonRules: false —
// the ritual is NOT affected by Moon in any way.
// Never hardcodes Moon logic. Never generalizes Moon importance.
// Never reduces the main compatibility score.
// ═══════════════════════════════════════════════════════════════
export function analyzeMoonCompatibility({ moonReq, moonPhase, moonCitations }) {
  const hasMoonRules = !!(moonReq?.moon || moonReq?.zodiac || moonReq?.suitableMansions);

  if (!hasMoonRules) {
    return {
      hasMoonRules: false,
      message: "According to the manuscript, Moon conditions are NOT required for this ritual. Current Moon information is shown only as additional reference.",
      currentMoon: moonPhase ? { ...moonPhase } : null,
      checks: [],
      compatible: true,
      conclusion: "No Moon restriction — ritual timing is based on Day + Saat + Kawkab only.",
    };
  }

  const checks = [];
  let allPass = true;

  // 1. Moon Phase check (waxing / waning / new / full)
  if (moonReq.moon) {
    const ok = moonSatisfied(moonReq.moon, moonPhase.lunarDay);
    if (!ok) allPass = false;
    checks.push({
      dimension: "phase", label: "Moon Phase",
      currentValue: `Day ${moonPhase.lunarDay} (${moonPhase.phaseName})`,
      required: moonReq.moon,
      status: ok ? "pass" : "fail",
      reason: ok
        ? `Manuscript requires ${moonReq.moon} moon. Current moon satisfies this.`
        : `Manuscript requires ${moonReq.moon} moon. Current moon does NOT satisfy this.`,
    });
  }

  // 2. Moon Zodiac Sign check
  if (moonReq.zodiac && moonPhase.moonSign) {
    const ok = moonReq.zodiac.includes(moonPhase.moonSign.toLowerCase());
    if (!ok) allPass = false;
    checks.push({
      dimension: "sign", label: "Moon Zodiac Sign",
      currentValue: `${moonPhase.moonSignSymbol || ""} ${moonPhase.moonSign}`,
      required: moonReq.zodiac.join(", "),
      status: ok ? "pass" : "fail",
      reason: ok
        ? `Manuscript prescribes zodiac ${moonReq.zodiac.join(", ")}. Current moon sign matches.`
        : `Manuscript prescribes zodiac ${moonReq.zodiac.join(", ")}. Current moon sign is ${moonPhase.moonSign}.`,
    });
  } else if (moonReq.zodiac && !moonPhase.moonSign) {
    checks.push({
      dimension: "sign", label: "Moon Zodiac Sign",
      currentValue: "Unavailable",
      required: moonReq.zodiac.join(", "),
      status: "neutral",
      reason: "Live moon sign data unavailable from Astro Clock.",
    });
  }

  // 3. Moon Mansion (Manzil) check
  if (moonReq.suitableMansions && moonPhase.moonMansion) {
    const ok = moonReq.suitableMansions.some(m =>
      String(m).toLowerCase() === String(moonPhase.moonMansion).toLowerCase() ||
      String(m) === String(moonPhase.moonMansionNumber)
    );
    if (!ok) allPass = false;
    checks.push({
      dimension: "mansion", label: "Moon Mansion (Manzil)",
      currentValue: moonPhase.moonMansionArabic
        ? `${moonPhase.moonMansionArabic} (${moonPhase.moonMansion})`
        : moonPhase.moonMansion,
      required: moonReq.suitableMansions.join(", "),
      status: ok ? "pass" : "fail",
      reason: ok
        ? `Manuscript prescribes mansions ${moonReq.suitableMansions.join(", ")}. Current mansion matches.`
        : `Manuscript prescribes mansions ${moonReq.suitableMansions.join(", ")}. Current mansion is ${moonPhase.moonMansion}.`,
    });
  } else if (moonReq.suitableMansions && !moonPhase.moonMansion) {
    checks.push({
      dimension: "mansion", label: "Moon Mansion (Manzil)",
      currentValue: "Unavailable",
      required: moonReq.suitableMansions.join(", "),
      status: "neutral",
      reason: "Live moon mansion data unavailable from Astro Clock.",
    });
  }

  return {
    hasMoonRules: true,
    currentMoon: moonPhase ? { ...moonPhase } : null,
    checks,
    compatible: allPass,
    citations: moonCitations || [],
    conclusion: allPass
      ? "Moon conditions are compatible with this ritual."
      : "Moon conditions are NOT compatible with this ritual.",
  };
}

// ═══════════════════════════════════════════════════════════════
// FIND NEXT SUITABLE MOON TIME — Optional, user-initiated
// ═══════════════════════════════════════════════════════════════
// Searches up to 30 days for the next date where ALL Moon conditions
// (from moonReq) are satisfied. Also finds the best Day + Saat on that
// date using the main req. Returns null if no suitable date found.
// Never called automatically — only by MoonAnalysisCard toggle.
// ═══════════════════════════════════════════════════════════════
export function findNextSuitableMoonTime({ req, moonReq, fromDate, filters }) {
  const effectiveMoonReq = { ...moonReq, ...(filters || {}) };
  const hasMoonRules = !!(effectiveMoonReq.moon || effectiveMoonReq.zodiac || effectiveMoonReq.suitableMansions);
  if (!hasMoonRules) return null;

  const SEARCH_DAYS = 30;
  for (let d = 1; d < SEARCH_DAYS; d++) {
    const date = new Date(fromDate.getTime() + d * 24 * 60 * 60 * 1000);
    const moon = getMoonPhase(date);

    // Check all Moon conditions
    let moonOk = true;
    if (effectiveMoonReq.moon && !moonSatisfied(effectiveMoonReq.moon, moon.lunarDay)) moonOk = false;
    if (effectiveMoonReq.zodiac && moon.moonSign && !effectiveMoonReq.zodiac.includes(moon.moonSign.toLowerCase())) moonOk = false;
    if (effectiveMoonReq.suitableMansions && moon.moonMansion) {
      const mansionOk = effectiveMoonReq.suitableMansions.some(m =>
        String(m).toLowerCase() === String(moon.moonMansion).toLowerCase() ||
        String(m) === String(moon.moonMansionNumber)
      );
      if (!mansionOk) moonOk = false;
    }
    if (!moonOk) continue;

    // Moon conditions satisfied — find best Day + Saat on this date
    const localDate = toLocationDate(date);
    const { hours, sunrise, sunset } = getTodayAllHours(localDate);
    const dayKey = DAY_KEY_BY_INDEX[getActiveWeekday(localDate, sunrise, sunset)];
    const dayOk = !req?.days || req.days.includes(dayKey);
    if (!dayOk) continue;

    let bestHour = null;
    for (const h of hours) {
      if (req?.hours && !req.hours.map((p) => p.toLowerCase()).includes(h.planet)) continue;
      if (req?.nightRequired === true && h.period !== "night") continue;
      if (req?.worstHours && req.worstHours.map((p) => p.toLowerCase()).includes(h.planet)) continue;
      if (req?.enemyPlanets && req.enemyPlanets.map((p) => p.toLowerCase()).includes(h.planet)) continue;
      bestHour = h;
      break;
    }

    if (bestHour) {
      return {
        date: toLocationDateStr(date),
        daysAhead: d,
        dayName: MIZAN_DAY_NAMES[dayKey],
        moonPhaseName: moon.phaseName,
        lunarDay: moon.lunarDay,
        moonSign: moon.moonSign,
        moonSignSymbol: moon.moonSignSymbol,
        moonMansion: moon.moonMansion,
        moonMansionArabic: moon.moonMansionArabic,
        moonIllumination: moon.moonIllumination,
        bestHour: bestHour.hourNumber,
        bestHourPlanet: capitalPlanet(bestHour.planet),
        bestHourStart: bestHour.startTime,
        bestHourEnd: bestHour.endTime,
        confidence: 85,
      };
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// PLAN RITUAL BY MOON — User-controlled future Moon planning
// ═══════════════════════════════════════════════════════════════
// Called by MoonAnalysisCard ONLY when the user selects "Plan Ritual
// by Moon" and chooses desired Moon conditions (Mansion/Zodiac/Phase).
//
// Searches up to 60 days (~2 Moon cycles) for when the Moon enters
// the user's desired condition. At each matching day, evaluates ALL
// manuscript conditions simultaneously:
//   ✓ Day (req.days)
//   ✓ Saat (req.hours, avoiding worstHours)
//   ✓ Kawkab (planetary ruler of the Saat)
//   ✓ Moon (satisfied by definition — user selected it)
//   ✓ Nahas (worstDays, worstHours, enemyPlanets)
//   ✓ Manuscript Moon rules (moonReq, if they exist)
//
// Returns:
//   { found: true, firstMatch, recommendedTime, searchedDays }
//   — firstMatch: the first time Moon enters the desired condition (with full ✓/✗ evaluation)
//   — recommendedTime: the first time ALL conditions are simultaneously satisfied
//   — If no fully compatible time found in 60 days, found=false and recommendedTime=null
//
// Moon alone NEVER approves a ritual. A future time is valid ONLY when
// ALL required manuscript conditions are simultaneously satisfied.
// ═══════════════════════════════════════════════════════════════
export function planRitualByMoon({ req, moonReq, desiredMansion, desiredZodiac, desiredPhase, fromDate }) {
  // ═══════════════════════════════════════════════════════════════
  // PRIORITY-BASED SEARCH
  //   1. Mandatory manuscript rules (req + moonReq) — MUST pass
  //   2. User-selected Moon filters — PREFERRED (optional)
  //   3. General enhancements — non-blocking
  //
  // Returns TWO times:
  //   recommendedTime  = earliest time ALL mandatory manuscript rules pass
  //   moonPerfectTime  = earliest time mandatory rules + ALL user Moon prefs pass
  //
  // If Moon prefs pass at recommendedTime, moonPerfectTime is null (same time).
  // If Moon prefs fail at recommendedTime but pass later, moonPerfectTime is later.
  // If Moon prefs never pass, moonPerfectTime is null.
  // ═══════════════════════════════════════════════════════════════
  const MAX_SEARCH_DAYS = 365;
  const hasMoonPrefs = !!(desiredMansion || desiredZodiac || desiredPhase);
  const hasMsMoonRules = !!(moonReq?.moon || moonReq?.zodiac || moonReq?.suitableMansions);

  let firstManuscriptValid = null;
  let firstMoonPerfect = null;
  let firstPerfectMatch = null;
  let firstMoonMatch = null;
  let rejectionTimeline = [];
  let todayResult = null;
  let todayMoonMatches = false;
  let todayManuscriptPass = false;

  for (let d = 0; d <= MAX_SEARCH_DAYS; d++) {
    const date = new Date(fromDate.getTime() + d * 24 * 60 * 60 * 1000);
    const localDate = toLocationDate(date);
    const moon = getMoonPhase(date);
    const { hours, sunrise, sunset } = getTodayAllHours(localDate);
    const dayIndex = getActiveWeekday(localDate, sunrise, sunset);
    const dayKey = DAY_KEY_BY_INDEX[dayIndex];
    const dayRuler = getDayRuler(dayIndex);

    // ═══ 1. MANDATORY MANUSCRIPT CONDITIONS ═══
    const mandatoryChecks = [];
    let mandatoryPass = true;

    if (req?.days) {
      const dayOk = req.days.includes(dayKey);
      if (!dayOk) mandatoryPass = false;
      mandatoryChecks.push({
        dimension: "day", label: "Day",
        status: dayOk ? "pass" : "fail",
        current: MIZAN_DAY_NAMES[dayKey],
        required: req.days.map(dd => MIZAN_DAY_NAMES[dd]).join(", "),
        reason: dayOk ? "Day is prescribed by manuscript." : "Day is not prescribed by manuscript.",
      });
    }

    if (req?.worstDays?.length) {
      const isWorstDay = req.worstDays.includes(dayKey);
      if (isWorstDay) mandatoryPass = false;
      mandatoryChecks.push({
        dimension: "nahas_day", label: "Nahas (Day)",
        status: isWorstDay ? "fail" : "pass",
        current: MIZAN_DAY_NAMES[dayKey],
        required: "Avoid: " + req.worstDays.map(dd => MIZAN_DAY_NAMES[dd]).join(", "),
        reason: isWorstDay ? "Nahas restriction exists." : "No Nahas on this day.",
      });
    }

    let bestHour = null;
    for (const h of hours) {
      if (req?.hours && !req.hours.map(p => p.toLowerCase()).includes(h.planet)) continue;
      if (req?.nightRequired === true && h.period !== "night") continue;
      if (req?.worstHours && req.worstHours.map(p => p.toLowerCase()).includes(h.planet)) continue;
      if (req?.enemyPlanets && req.enemyPlanets.map(p => p.toLowerCase()).includes(h.planet)) continue;
      bestHour = h;
      break;
    }

    const saatOk = !!bestHour;
    if (!saatOk) mandatoryPass = false;
    mandatoryChecks.push({
      dimension: "saat", label: "Saat",
      status: saatOk ? "pass" : "fail",
      current: bestHour ? `#${bestHour.hourNumber} (${capitalPlanet(bestHour.planet)})` : "None available",
      required: req?.hours ? req.hours.join(", ") : "Any",
      reason: saatOk ? "Saat is prescribed by manuscript." : "No suitable Saat found on this day.",
    });

    if (bestHour) {
      const kawkabOk = !req?.hours || req.hours.map(p => p.toLowerCase()).includes(bestHour.planet);
      if (!kawkabOk) mandatoryPass = false;
      mandatoryChecks.push({
        dimension: "kawkab", label: "Kawkab",
        status: kawkabOk ? "pass" : "fail",
        current: capitalPlanet(bestHour.planet),
        required: req?.hours ? req.hours.join(", ") : "Any",
        reason: kawkabOk ? "Kawkab matches manuscript prescription." : "Kawkab does not match prescription.",
      });

      const hasNahasHour = (req?.worstHours?.length) || (req?.enemyPlanets?.length);
      if (hasNahasHour) {
        const isWorstHour = (req?.worstHours && req.worstHours.map(p => p.toLowerCase()).includes(bestHour.planet)) ||
                            (req?.enemyPlanets && req.enemyPlanets.map(p => p.toLowerCase()).includes(bestHour.planet));
        if (isWorstHour) mandatoryPass = false;
        mandatoryChecks.push({
          dimension: "nahas_hour", label: "Nahas (Hour)",
          status: isWorstHour ? "fail" : "pass",
          current: capitalPlanet(bestHour.planet),
          required: "Avoid enemy/worst planets",
          reason: isWorstHour ? "Nahas restriction exists on this hour." : "No Nahas on this hour.",
        });
      }
    }

    if (req?.nightRequired === true) {
      const nightOk = bestHour && bestHour.period === "night";
      if (!nightOk) mandatoryPass = false;
      mandatoryChecks.push({
        dimension: "night", label: "Day / Night",
        status: nightOk ? "pass" : "fail",
        current: bestHour ? (bestHour.period === "night" ? "Night" : "Day") : "—",
        required: "Night",
        reason: nightOk ? "Night, as required by manuscript." : "Manuscript requires night but no night Saat available.",
      });
    }

    if (hasMsMoonRules) {
      if (moonReq.moon) {
        const mrOk = moonSatisfied(moonReq.moon, moon.lunarDay);
        if (!mrOk) mandatoryPass = false;
        mandatoryChecks.push({
          dimension: "ms_moon_phase", label: "Manuscript Moon Phase",
          status: mrOk ? "pass" : "fail",
          current: `Day ${moon.lunarDay} (${moon.phaseName})`,
          required: moonReq.moon,
          reason: mrOk ? "Manuscript Moon phase satisfied." : "Manuscript Moon phase NOT satisfied.",
        });
      }
      if (moonReq.zodiac && moon.moonSign) {
        const mzOk = moonReq.zodiac.includes(moon.moonSign.toLowerCase());
        if (!mzOk) mandatoryPass = false;
        mandatoryChecks.push({
          dimension: "ms_moon_zodiac", label: "Manuscript Moon Zodiac",
          status: mzOk ? "pass" : "fail",
          current: `${moon.moonSignSymbol || ""} ${moon.moonSign}`,
          required: moonReq.zodiac.join(", "),
          reason: mzOk ? "Manuscript Moon zodiac satisfied." : "Manuscript Moon zodiac NOT satisfied.",
        });
      }
      if (moonReq.suitableMansions && moon.moonMansion) {
        const mmOk = moonReq.suitableMansions.some(m =>
          String(m).toLowerCase() === String(moon.moonMansion).toLowerCase() ||
          String(m) === String(moon.moonMansionNumber)
        );
        if (!mmOk) mandatoryPass = false;
        mandatoryChecks.push({
          dimension: "ms_moon_mansion", label: "Manuscript Moon Mansion",
          status: mmOk ? "pass" : "fail",
          current: moon.moonMansionArabic ? `${moon.moonMansionArabic} (${moon.moonMansion})` : moon.moonMansion,
          required: moonReq.suitableMansions.join(", "),
          reason: mmOk ? "Manuscript Moon mansion satisfied." : "Manuscript Moon mansion NOT satisfied.",
        });
      }
    }

    // ═══ 2. USER-SELECTED MOON PREFERENCES (optional) ═══
    const moonPrefChecks = [];
    let moonPrefPass = true;

    if (desiredPhase) {
      const phaseOk = (desiredPhase === "waxing" && moon.isWaxing) || (desiredPhase === "waning" && moon.isWaning);
      if (!phaseOk) moonPrefPass = false;
      moonPrefChecks.push({
        dimension: "pref_phase", label: "Moon Phase",
        status: phaseOk ? "pass" : "fail",
        current: moon.phaseName,
        required: desiredPhase,
        reason: phaseOk ? "Selected Moon phase matched." : "Selected Moon phase NOT matched.",
      });
    }
    if (desiredZodiac && moon.moonSign) {
      const zodOk = desiredZodiac.toLowerCase() === moon.moonSign.toLowerCase();
      if (!zodOk) moonPrefPass = false;
      moonPrefChecks.push({
        dimension: "pref_zodiac", label: "Moon Zodiac",
        status: zodOk ? "pass" : "fail",
        current: `${moon.moonSignSymbol || ""} ${moon.moonSign}`,
        required: desiredZodiac,
        reason: zodOk ? "Selected Moon zodiac matched." : "Selected Moon zodiac NOT matched.",
      });
    }
    if (desiredMansion) {
      const manOk = String(desiredMansion) === String(moon.moonMansionNumber) ||
                    String(desiredMansion).toLowerCase() === String(moon.moonMansion).toLowerCase();
      if (!manOk) moonPrefPass = false;
      moonPrefChecks.push({
        dimension: "pref_mansion", label: "Moon Mansion",
        status: manOk ? "pass" : "fail",
        current: moon.moonMansionArabic ? `${moon.moonMansionArabic} (${moon.moonMansion})` : (moon.moonMansion || "—"),
        required: desiredMansion,
        reason: manOk ? "Selected Moon mansion matched." : "Selected Moon mansion NOT matched.",
      });
    }

    // ═══ 3. GENERAL ENHANCEMENTS (optional, non-blocking) ═══
    const enhancementChecks = [];

    const isBeneficDay = BENEFIC.includes(dayRuler.planet);
    enhancementChecks.push({
      dimension: "enh_benefic_day", label: "Benefic Day Ruler",
      status: isBeneficDay ? "pass" : "neutral",
      current: dayRuler.planet,
      required: "Jupiter / Venus / Sun / Moon (preferred)",
      reason: isBeneficDay ? `${dayRuler.planet} is a benefic planet — favorable enhancement.` : `${dayRuler.planet} is not benefic — neutral.`,
    });

    const illumPct = moon.moonIllumination != null ? parseFloat(moon.moonIllumination) : 0;
    const goodIllum = illumPct >= 50;
    enhancementChecks.push({
      dimension: "enh_moon_illum", label: "Moon Illumination",
      status: goodIllum ? "pass" : "neutral",
      current: `${illumPct.toFixed(1)}%`,
      required: "≥ 50% (preferred)",
      reason: goodIllum ? "Moon is well-illuminated — favorable enhancement." : "Moon illumination is low — neutral.",
    });

    // ── Build result for this day ──
    const monthName = date.toLocaleString("en-US", { month: "long" });
    const nahasActive = (req?.worstDays && req.worstDays.includes(dayKey)) ||
      (bestHour && req?.worstHours && req.worstHours.map(p => p.toLowerCase()).includes(bestHour.planet)) ||
      (bestHour && req?.enemyPlanets && req.enemyPlanets.map(p => p.toLowerCase()).includes(bestHour.planet));
    const nahasStatus = nahasActive
      ? "Nahas restriction exists — this time is blocked."
      : "No Nahas restriction found.";

    const matchResult = {
      date: toLocationDateStr(date),
      dateObj: date,
      daysAhead: d,
      dayName: MIZAN_DAY_NAMES[dayKey],
      monthName,
      dayNumber: date.getDate(),
      year: date.getFullYear(),
      timeStr: bestHour ? bestHour.startTime : "—",
      timeEnd: bestHour ? bestHour.endTime : null,
      hourNumber: bestHour?.hourNumber || null,
      hourPlanet: bestHour ? capitalPlanet(bestHour.planet) : null,
      moon: { ...moon },
      mandatoryChecks,
      mandatoryPass,
      moonPrefChecks,
      moonPrefPass,
      enhancementChecks,
      bestHour,
      nahasStatus,
    };

    // Track today's data (d=0)
    if (d === 0) {
      todayResult = matchResult;
      todayMoonMatches = hasMoonPrefs ? moonPrefPass : true;
      todayManuscriptPass = mandatoryPass;
    }

    // Track first Moon match (regardless of manuscript)
    if (!firstMoonMatch && hasMoonPrefs && moonPrefPass) {
      firstMoonMatch = matchResult;
    }

    if (!firstManuscriptValid && mandatoryPass) {
      firstManuscriptValid = matchResult;
    }
    if (!firstMoonPerfect && mandatoryPass && moonPrefPass) {
      firstMoonPerfect = matchResult;
    }
    const allEnhancementsPass = enhancementChecks.every(c => c.status === "pass");
    if (!firstPerfectMatch && mandatoryPass && (hasMoonPrefs ? moonPrefPass : true) && allEnhancementsPass) {
      firstPerfectMatch = matchResult;
    }

    // Track rejection: Moon matched but manuscript failed
    if (hasMoonPrefs && moonPrefPass && !mandatoryPass) {
      const failedChecks = mandatoryChecks.filter(c => c.status === "fail");
      rejectionTimeline.push({
        date: matchResult.date,
        dayName: matchResult.dayName,
        dayNumber: matchResult.dayNumber,
        monthName: matchResult.monthName,
        year: matchResult.year,
        moonMatched: true,
        failedChecks: failedChecks.map(c => ({ label: c.label, reason: c.reason, dimension: c.dimension })),
        allMandatoryChecks: mandatoryChecks,
        moonData: { ...moon },
        bestHour: bestHour ? { hourNumber: bestHour.hourNumber, planet: capitalPlanet(bestHour.planet), startTime: bestHour.startTime, endTime: bestHour.endTime, period: bestHour.period } : null,
        daysAhead: d,
      });
    }

    if (firstPerfectMatch) break;
  }

  // ═══ BUILD RESULT ═══
  if (!hasMoonPrefs) {
    return {
      found: !!firstManuscriptValid,
      firstManuscriptValid,
      firstMoonPerfect: firstManuscriptValid,
      firstPerfectMatch,
      recommendedTime: firstManuscriptValid,
      moonPerfectTime: null,
      moonPrefsSatisfied: true,
      hasMoonPrefs: false,
      todayMoonMatches: false,
      todayManuscriptPass,
      todayResult,
      firstMoonMatch: null,
      rejectionTimeline: [],
      searchedDays: MAX_SEARCH_DAYS,
    };
  }

  if (firstMoonPerfect) {
    const sameTime = firstManuscriptValid === firstMoonPerfect;
    return {
      found: true,
      firstManuscriptValid,
      firstMoonPerfect,
      firstPerfectMatch,
      recommendedTime: firstManuscriptValid,
      moonPerfectTime: sameTime ? null : firstMoonPerfect,
      moonPrefsSatisfied: sameTime,
      hasMoonPrefs: true,
      todayMoonMatches,
      todayManuscriptPass,
      todayResult,
      firstMoonMatch,
      rejectionTimeline,
      searchedDays: MAX_SEARCH_DAYS,
    };
  }

  if (firstManuscriptValid) {
    return {
      found: true,
      firstManuscriptValid,
      firstMoonPerfect: null,
      firstPerfectMatch,
      recommendedTime: firstManuscriptValid,
      moonPerfectTime: null,
      moonPrefsSatisfied: false,
      hasMoonPrefs: true,
      todayMoonMatches,
      todayManuscriptPass,
      todayResult,
      firstMoonMatch,
      rejectionTimeline,
      searchedDays: MAX_SEARCH_DAYS,
    };
  }

  return {
    found: false,
    firstManuscriptValid: null,
    firstMoonPerfect: null,
    firstPerfectMatch: null,
    recommendedTime: null,
    moonPerfectTime: null,
    moonPrefsSatisfied: false,
    hasMoonPrefs: true,
    todayMoonMatches,
    todayManuscriptPass,
    todayResult,
    firstMoonMatch,
    rejectionTimeline,
    searchedDays: MAX_SEARCH_DAYS,
  };
}
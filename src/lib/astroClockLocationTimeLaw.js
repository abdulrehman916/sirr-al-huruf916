// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK LOCATION & TIME LAW — ENFORCEMENT MODULE
// ═══════════════════════════════════════════════════════════════
//
// PRIORITY: CRITICAL — EQUAL HIGHEST PRIORITY IN CODEBASE
// STATUS: IMMUTABLE — CANNOT BE DISABLED BY FUTURE UPDATES
// LIFETIME: PERMANENT — FOR THE LIFETIME OF THE PROJECT
//
// This module codifies the 8 location & time rules from
// LOCATION_TIME_LAW.md as JS constants and validation functions.
//
// KEY PRINCIPLE:
//   The Astro Clock always uses the user's REAL physical location.
//   No fixed times. No assumed country. No hardcoded sunrise/sunset.
//   Manuscript knowledge is constant worldwide.
//   Only live calculations change by location.
//
// This module is defensive — it logs violations but never crashes.
// ═══════════════════════════════════════════════════════════════

// ── THE 8 LOCATION & TIME RULES ──
export const LOCATION_TIME_RULES = {
  RULE_1: "Every calculation uses real location: GPS, timezone, lat/long, sunrise, sunset.",
  RULE_2: "All results auto-change by country and city — Saat, Layl/Nahar, Moon, recommendations.",
  RULE_3: "Never use fixed times, never assume one country, never hardcode sunrise/sunset.",
  RULE_4: "Travel auto-updates all calculations — timezone, sunrise, sunset, day/night length, local date.",
  RULE_5: "Manuscript knowledge is identical worldwide — only live calculations change by location.",
  RULE_6: "Location denied: manual city selection with that city's coordinates.",
  RULE_7: "Language never affects calculations — language changes only displayed text.",
  RULE_8: "Permanent, no bypass — no feature may skip the location-based engine.",
};

// ── REQUIRED LOCATION INPUTS (Rule 1) ──
export const REQUIRED_LOCATION_INPUTS = [
  "latitude",
  "longitude",
  "timezone",
  "sunrise",
  "sunset",
];

// ── LOCATION-DEPENDENT RESULTS (Rule 2) ──
export const LOCATION_DEPENDENT_RESULTS = [
  "currentHour",      // Planetary Saat
  "allHours",         // All 24 planetary hours
  "dayRuler",         // Today's ruling planet
  "moonPosition",     // Live Moon position
  "moonZodiacSign",   // Moon's zodiac sign
  "moonMansion",      // Moon's lunar mansion
  "isNight",          // Layl/Nahar status
  "laylNahar",        // Night/Day label
  "sunrise",          // Local sunrise
  "sunset",           // Local sunset
  "activeDayIndex",   // Sunset-aware weekday
  "lunarDay",         // Current lunar day
  "bestTime",         // Best time recommendation
  "avoidTime",        // Avoid time recommendation
  "nahasDays",        // Forbidden periods
  "goldenDays",       // Auspicious periods
  "purposeSearch",    // Purpose-based search results
];

// ── PROTECTED CALCULATION ENGINE (Rule 8 — single source of truth) ──
export const LOCATION_ENGINE_HOOK = "useAstroData";

// ── FORBIDDEN PATTERNS (Rule 3) ──
export const FORBIDDEN_PATTERNS = {
  hardcodedSunrise: "Hardcoded sunrise time (e.g., '06:00') used for calculation.",
  hardcodedSunset: "Hardcoded sunset time (e.g., '18:00') used for calculation.",
  fixedTimezone: "Fixed timezone offset (e.g., '+4') used instead of device timezone.",
  assumedCountry: "Assumed country/region without location detection.",
  cachedAcrossLocations: "Calculation cached across location changes without recalculation.",
};

// ── Validate location inputs are present (Rule 1) ──
export function validateLocationInputs(inputs) {
  const violations = [];
  if (!inputs) {
    violations.push("Location inputs are null/undefined — calculations cannot proceed (Rule 1).");
    return { valid: false, violations };
  }
  for (const field of REQUIRED_LOCATION_INPUTS) {
    if (inputs[field] === undefined || inputs[field] === null) {
      violations.push(`Missing required location input: ${field} (Rule 1).`);
    }
  }
  // Validate latitude range
  if (inputs.latitude !== undefined && (inputs.latitude < -90 || inputs.latitude > 90)) {
    violations.push(`Invalid latitude: ${inputs.latitude} (must be -90 to 90).`);
  }
  // Validate longitude range
  if (inputs.longitude !== undefined && (inputs.longitude < -180 || inputs.longitude > 180)) {
    violations.push(`Invalid longitude: ${inputs.longitude} (must be -180 to 180).`);
  }
  return { valid: violations.length === 0, violations };
}

// ── Validate a result is location-dependent, not hardcoded (Rule 2/3) ──
export function validateResultIsDynamic(result, previousResult, locationChanged) {
  if (!locationChanged) return { valid: true, violations: [] };
  const violations = [];
  // If location changed but the result didn't, it may be hardcoded
  if (previousResult && JSON.stringify(result) === JSON.stringify(previousResult)) {
    violations.push("Result did not change when location changed — possible hardcoded value (Rule 2/3).");
  }
  return { valid: violations.length === 0, violations };
}

// ─<arg_value> Validate language does not affect calculations (Rule 7) ──
export function validateLanguageIndependence(calcWithLangA, calcWithLangB) {
  // The calculation results should be identical regardless of language
  if (JSON.stringify(calcWithLangA) === JSON.stringify(calcWithLangB)) {
    return { valid: true, violations: [] };
  }
  return {
    valid: false,
    violations: ["Calculation changed when language changed — language leaked into engine (Rule 7)."],
  };
}

// ── Check if a sunrise/sunset value is hardcoded (Rule 3) ──
export function isHardcodedTime(value) {
  if (typeof value === "string" && /^\d{1,2}:\d{2}$/.test(value)) {
    // A raw time string like "06:00" without location context is suspicious
    // This is a heuristic — the calculation engine should always derive times
    return true;
  }
  if (typeof value === "number" && value >= 0 && value <= 24 && Number.isInteger(value * 10)) {
    // A simple integer/decimal hour like 6 or 6.0 without calculation context
    return true;
  }
  return false;
}

// ── Defensive violation logger (never crashes) ──
export function logLocationTimeViolation(ruleKey, details) {
  const rule = LOCATION_TIME_RULES[ruleKey];
  if (!rule) {
    console.warn(`[LocationTimeLaw] Unknown rule key: ${ruleKey}`);
    return;
  }
  console.error(`[LocationTimeLaw] CRITICAL VIOLATION — ${ruleKey}: ${rule}`);
  if (details) console.error(`[LocationTimeLaw] Details:`, details);
  console.error(`[LocationTimeLaw] See LOCATION_TIME_LAW.md — hardcoded values are a critical bug.`);
}

// ── Law metadata ──
export const LOCATION_TIME_LAW_METADATA = {
  established: "2026-07-08",
  status: "IMMUTABLE",
  priority: "CRITICAL",
  lifetime: "PERMANENT",
  document: "src/docs/LOCATION_TIME_LAW.md",
  rules_count: 8,
  can_be_disabled: false,
  engine_hook: LOCATION_ENGINE_HOOK,
  core_principle: "Real location always. No fixed times. Manuscript knowledge constant worldwide.",
};
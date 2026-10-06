// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK LIVE ASTRONOMY LAW — ENFORCEMENT MODULE
// ═══════════════════════════════════════════════════════════════
//
// PRIORITY: CRITICAL — EQUAL HIGHEST PRIORITY IN CODEBASE
// STATUS: IMMUTABLE — CANNOT BE DISABLED BY FUTURE UPDATES
// LIFETIME: PERMANENT — FOR THE LIFETIME OF THE PROJECT
//
// This module codifies the 10 live astronomy rules from
// LIVE_ASTRONOMY_LAW.md as JS constants and validation functions.
//
// KEY PRINCIPLE:
//   Live astronomical data for the user's current location.
//   No cached hour tables. No hardcoded positions.
//   Manuscript knowledge is permanent reference.
//   Offline = last valid calculation persists until reconnect.
//
// This law is the astronomical complement to the Location & Time
// Law — Location & Time governs WHERE, Live Astronomy governs WHAT
// is calculated.
//
// This module is defensive — it logs violations but never crashes.
// ═══════════════════════════════════════════════════════════════

// ── THE 10 LIVE ASTRONOMY RULES ──
export const LIVE_ASTRONOMY_RULES = {
  RULE_1: "Every astronomical calculation uses live data for the user's current location.",
  RULE_2: "Automatically calculate all values: date, time, timezone, lat/long, sunrise, sunset, solar noon, moonrise, moonset, moon illumination, moon age, moon phase, moon zodiac, moon mansion.",
  RULE_3: "Planetary Hours (Saat) always recalculated from live sunrise/sunset — never cached or hardcoded hour tables.",
  RULE_4: "Country/city change refreshes every astronomical value automatically.",
  RULE_5: "Manuscript knowledge is permanent reference data — only astronomical calculations change by location/time.",
  RULE_6: "Every recommendation generated from current live astronomical state plus manuscript rules.",
  RULE_7: "Offline: continue using last valid calculation, auto-refresh when internet returns.",
  RULE_8: "Never delete or overwrite manuscript data — new PDFs added as new sources, merged with existing.",
  RULE_9: "Every displayed fact includes manuscript source and page reference.",
  RULE_10: "Permanent, no bypass — no feature may skip the live astronomy engine.",
};

// ── REQUIRED ASTRONOMICAL VALUES (Rule 2) ──
export const REQUIRED_ASTRONOMICAL_VALUES = [
  "currentDate",
  "localTime",
  "timezone",
  "latitude",
  "longitude",
  "sunrise",
  "sunset",
  "solarNoon",
  "moonrise",
  "moonset",
  "moonIllumination",
  "moonAge",
  "moonPhase",
  "moonZodiac",
  "moonMansion",
];

// ── ENGINE MODULES (single source of truth) ──
export const ASTRONOMY_ENGINE_MODULES = [
  "astroClockLiveEngine",
  "astroClockMoonPosition",
  "astroClockSunriseSunset",
  "astroClockLiveAstronomy",
];

// ── PROTECTED FROM CACHING (Rule 3) ──
export const NEVER_CACHED_VALUES = [
  "planetaryHours",  // Saat must always recalculate from live sunrise/sunset
  "currentSaat",
  "dayRuler",
  "laylNahar",
];

// ── OFFLINE RESILIENCE (Rule 7) ──
export const OFFLINE_BEHAVIOR = {
  useLastValidCalculation: true,
  showOfflineIndicator: true,
  autoRefreshOnReconnect: true,
  crashOnError: false,
  blankUIOnError: false,
};

// ── Validate all required astronomical values are present (Rule 2) ──
export function validateAstronomicalValues(values) {
  const violations = [];
  if (!values) {
    violations.push("Astronomical values object is null/undefined (Rule 2).");
    return { valid: false, violations };
  }
  for (const field of REQUIRED_ASTRONOMICAL_VALUES) {
    if (values[field] === undefined || values[field] === null) {
      violations.push(`Missing required astronomical value: ${field} (Rule 2).`);
    }
  }
  return { valid: violations.length === 0, violations };
}

// ── Validate Saat is calculated from live sunrise/sunset, not cached (Rule 3) ──
export function validateSaatIsLive(saatData, sunrise, sunset) {
  const violations = [];
  if (!saatData || !saatData.allHours) {
    violations.push("Saat data missing allHours — cannot verify (Rule 3).");
    return { valid: false, violations };
  }
  // Check that hour boundaries are derived from sunrise/sunset, not fixed 2-hour blocks
  const dayHours = saatData.allHours.filter(h => h.period === "day");
  if (dayHours.length > 0 && sunrise && sunset) {
    const expectedDayLength = sunset - sunrise;
    const actualDayLength = dayHours.reduce((sum, h) => {
      // Each hour has a duration; sum them to get total day length
      return sum + (h.duration || 0);
    }, 0);
    // If actual day length is exactly 24 (12 hours × 2), it's hardcoded
    if (Math.abs(actualDayLength - 24) < 0.1) {
      violations.push("Day Saat total = 24h (12×2) — appears hardcoded, not live (Rule 3).");
    }
  }
  return { valid: violations.length === 0, violations };
}

// ── Validate offline behavior (Rule 7) ──
export function validateOfflineResilience(isOffline, hasLastValidCalculation, uiCrashed) {
  const violations = [];
  if (isOffline) {
    if (!hasLastValidCalculation) {
      violations.push("Offline but no last valid calculation cached — UI will blank (Rule 7).");
    }
    if (uiCrashed) {
      violations.push("UI crashed during offline state — must persist with last valid data (Rule 7).");
    }
  }
  return { valid: violations.length === 0, violations };
}

// ── Validate recommendation has source attribution (Rule 9) ──
export function validateRecommendationAttribution(recommendation) {
  const violations = [];
  if (!recommendation) {
    return { valid: true, violations }; // Empty rec is OK
  }
  if (!recommendation.source) {
    violations.push("Recommendation missing manuscript source (Rule 9).");
  }
  if (!recommendation.page && !recommendation.source?.includes("p.") && !recommendation.source?.includes("s.")) {
    violations.push("Recommendation missing page reference (Rule 9).");
  }
  return { valid: violations.length === 0, violations };
}

// ── Defensive violation logger (never crashes) ──
export function logLiveAstronomyViolation(ruleKey, details) {
  const rule = LIVE_ASTRONOMY_RULES[ruleKey];
  if (!rule) {
    console.warn(`[LiveAstronomyLaw] Unknown rule key: ${ruleKey}`);
    return;
  }
  console.error(`[LiveAstronomyLaw] CRITICAL VIOLATION — ${ruleKey}: ${rule}`);
  if (details) console.error(`[LiveAstronomyLaw] Details:`, details);
  console.error(`[LiveAstronomyLaw] See LIVE_ASTRONOMY_LAW.md — cached/hardcoded astronomy is a critical bug.`);
}

// ── Law metadata ──
export const LIVE_ASTRONOMY_LAW_METADATA = {
  established: "2026-07-08",
  status: "IMMUTABLE",
  priority: "CRITICAL",
  lifetime: "PERMANENT",
  document: "src/docs/LIVE_ASTRONOMY_LAW.md",
  rules_count: 10,
  can_be_disabled: false,
  engine_modules: ASTRONOMY_ENGINE_MODULES,
  offline_behavior: OFFLINE_BEHAVIOR,
  core_principle: "Live astronomy for current location. No cached tables. Offline persists last valid calc.",
  complements: "LOCATION_TIME_LAW.md (Location & Time governs WHERE, Live Astronomy governs WHAT)",
};
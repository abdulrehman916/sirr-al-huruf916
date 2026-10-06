/**
 * MANUSCRIPT RULE ENGINE — SINGLE SHARED INTERPRETATION LAYER
 * ─────────────────────────────────────────────────────────────────────────
 * The ONE and ONLY manuscript-based interpretation source for BOTH the
 * Astro Clock module and the Ritual Timing module.
 *
 * Source manuscripts:
 *   - Havâss'ın Derinlikleri (PLANETARY_HOUR_RULES) — Sa'd/Nahs, planetary
 *     nature, suitable/unsuitable actions, planetary hour rules.
 *   - PLANET_FRIENDSHIPS — manuscript planet friend/enemy relationships.
 *
 * RULES:
 *   - No Western, no modern, no AI-generated, no generic astrology.
 *   - If a manuscript rule is not yet implemented, callers return
 *     "NOT YET IMPLEMENTED" instead of inventing content.
 *   - Astronomical calculations are NEVER touched here — this layer only
 *     interprets astronomical results with manuscript text.
 *
 * Consumed by:
 *   - Astro Clock  → applyManuscriptPlanetOverrides / applyManuscriptWeekdayOverrides
 *     (planet nature, Sa'd/Nahs, suitable/unsuitable actions, weekday friendships).
 *   - Ritual Timing V2 → SHARED_ACTION_RULES (per-purpose manuscript rules),
 *     via astroClockActionTimingAdvisor.ACTION_RULES re-export.
 *   - Ritual Timing V3 → already reads AstroClockKnowledge DB (manuscript).
 *
 * Both Astro Clock and Ritual Timing therefore display IDENTICAL
 * manuscript-derived Sa'd/Nahs, planetary nature, suitable/unsuitable
 * actions, planetary hour rules, weekday rules, and lunar mansion rules.
 */
import { PLANETARY_HOUR_RULES } from './astroClockPlanetaryHourRules.js';
import { PLANET_FRIENDSHIPS } from './astroClockPlanetFriendships.js';

export const NOT_YET_IMPLEMENTED = "NOT YET IMPLEMENTED";

const DAY_PLANET_KEY = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s; }

/**
 * Manuscript display data for a planet key (name + symbol, all languages).
 */
export function getManuscriptPlanetDisplay(planetKey) {
  const r = PLANETARY_HOUR_RULES[planetKey];
  if (!r) return { name_en: cap(planetKey), name_ml: '', name_ar: '', symbol: '' };
  return { name_en: r.name_en, name_ml: r.name_ml, name_ar: r.name_ar, symbol: r.symbol };
}

/**
 * Apply manuscript Sa'd/Nahs nature + suitable/unsuitable actions to a
 * PLANET_INFO object (mutates in place). Removes generated benefits/warnings/
 * spiritualOperations that are NOT in the manuscripts.
 *
 * Used by Astro Clock (astroClockLiveEngine.PLANET_INFO) so its planet cards
 * show the SAME manuscript data the Ritual Timing engine uses.
 */
export function applyManuscriptPlanetOverrides(PLANET_INFO) {
  Object.entries(PLANET_INFO).forEach(([key, info]) => {
    const r = PLANETARY_HOUR_RULES[key];
    if (!r) return;
    info.nature_en = r.nature;                                   // manuscript Sa'd/Nahs
    info.nature_ml = r.nature_ml;
    info.goodActions_en = (r.suitableActions && r.suitableActions.en) || [];
    info.goodActions_ml = (r.suitableActions && r.suitableActions.ml) || [];
    info.badActions_en = (r.unsuitableActions && r.unsuitableActions.en) || [];
    info.badActions_ml = (r.unsuitableActions && r.unsuitableActions.ml) || [];
    info.benefits_en = [];        // generated → removed (NOT YET IMPLEMENTED)
    info.benefits_ml = [];
    info.warnings_en = [];        // Western dignity → removed (NOT YET IMPLEMENTED)
    info.warnings_ml = [];
    info.spiritualOperations_en = [];  // mantras/deities/karmic NOT in manuscripts
    info.spiritualOperations_ml = [];
  });
}

/**
 * Apply manuscript friendships + suitable/unsuitable actions to a
 * WEEKDAY_ANALYSIS object (mutates in place). Clears generated per-action
 * advice (business/love/marriage/travel/healing/spiritual/malayalam) that
 * was AI-generated, not in the manuscripts.
 *
 * Used by Astro Clock (astroClockLiveEngine.WEEKDAY_ANALYSIS).
 */
export function applyManuscriptWeekdayOverrides(WEEKDAY_ANALYSIS) {
  Object.entries(WEEKDAY_ANALYSIS).forEach(([idxStr, w]) => {
    const idx = Number(idxStr);
    const rulerKey = DAY_PLANET_KEY[idx];
    const fr = PLANET_FRIENDSHIPS[rulerKey];
    if (fr) {
      w.friendlyDays = DAY_NAMES.filter((_, d) => fr.friends.includes(DAY_PLANET_KEY[d]));
      w.enemyDays = DAY_NAMES.filter((_, d) => fr.enemies.includes(DAY_PLANET_KEY[d]));
    }
    const r = PLANETARY_HOUR_RULES[rulerKey];
    if (r) {
      w.goodWorks = (r.suitableActions && r.suitableActions.en) || [];
      w.badWorks = (r.unsuitableActions && r.unsuitableActions.en) || [];
    }
    w.business = "";   // NOT YET IMPLEMENTED (not in manuscripts)
    w.love = "";
    w.marriage = "";
    w.travel = "";
    w.healing = "";
    w.spiritual = "";
    w.malayalam = "";
  });
}

/**
 * Purpose → ruling planet key (manuscript prescription).
 * Derived from Havâss'ın Derinlikleri planetary hour rules: each purpose is
 * governed by the planet whose Sa'd nature and suitableActions cover it.
 * Only purposes whose ruling planet is attested in the manuscripts are mapped;
 * every other purpose returns NOT YET IMPLEMENTED.
 */
const PURPOSE_RULING_PLANET = {
  marriage: 'venus',
  love: 'venus',
  business: 'mercury',
  job: 'sun',
  study: 'mercury',
  travel: 'moon',
  healing: 'jupiter',
  spiritual: 'jupiter',
};

/**
 * The SINGLE shared manuscript-based ACTION_RULES map.
 * Each purpose inherits the Sa'd/Nahs nature, suitable/unsuitable actions,
 * and enemy planets of its manuscript-attested ruling planet.
 * Purposes without a manuscript ruling planet are NOT YET IMPLEMENTED.
 *
 * Both Astro Clock (via astroClockActionTimingAdvisor) and Ritual Timing V2
 * (via ritualTimingRuleEngine.mapToActionRule) read from THIS map.
 */
export const SHARED_ACTION_RULES = Object.fromEntries(
  Object.entries(PURPOSE_RULING_PLANET).map(([purpose, planet]) => {
    const r = PLANETARY_HOUR_RULES[planet];
    const fr = PLANET_FRIENDSHIPS[planet];
    if (!r) return [purpose, { notImplemented: true, category: purpose }];
    return [purpose, {
      category: purpose.charAt(0).toUpperCase() + purpose.slice(1),
      rulingPlanet: r.name_en,
      rulingPlanetKey: planet,
      nature: r.nature,
      nature_ml: r.nature_ml,
      suitableActions: r.suitableActions || { en: [], ml: [] },
      unsuitableActions: r.unsuitableActions || { en: [], ml: [] },
      suitablePlanets: [r.name_en],
      enemyPlanets: (fr?.enemies || []).map(cap),
      sources: [{ book: "Havâss'ın Derinlikleri", page: r.pdf_pages || '', author: 'Bülent Kısa' }],
      manuscript_verified: true,
    }];
  })
);

export function getSharedActionRule(purposeKey) {
  return SHARED_ACTION_RULES[purposeKey] || null;
}

// ── Benefic / Malefic classification — derived from manuscript Sa'd/Nahs ──
// SINGLE source for benefic/malefic planet lists across Astro Clock and every
// Ritual Timing module. Derived from PLANETARY_HOUR_RULES.nature (Havâss).
// Benefic = nature contains "Sa'd"; Malefic = nature contains "Nahs".
// Mercury is Sa'd Asghar → Benefic (per manuscript), even where legacy code
// omitted it. Every module reads THIS list — no local duplicates.
function capPlanetName(nameEn) {
  return nameEn ? nameEn.charAt(0).toUpperCase() + nameEn.slice(1).toLowerCase() : nameEn;
}
export const BENEFIC_PLANETS = Object.values(PLANETARY_HOUR_RULES)
  .filter(r => r.nature && /sa'd|saad/i.test(r.nature))
  .map(r => capPlanetName(r.name_en));
export const MALEFIC_PLANETS = Object.values(PLANETARY_HOUR_RULES)
  .filter(r => r.nature && /nahs/i.test(r.nature))
  .map(r => capPlanetName(r.name_en));
export function isPlanetBenefic(planetName) {
  const n = String(planetName || "").toLowerCase();
  return BENEFIC_PLANETS.some(p => p.toLowerCase() === n);
}
export function isPlanetMalefic(planetName) {
  const n = String(planetName || "").toLowerCase();
  return MALEFIC_PLANETS.some(p => p.toLowerCase() === n);
}

export { PLANETARY_HOUR_RULES, PLANET_FRIENDSHIPS };
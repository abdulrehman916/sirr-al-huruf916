// ═══════════════════════════════════════════════════════════════
// MIZAAN 4 — SAAT (HOUR) "NOW" DETECTION
// ─────────────────────────────────────────────────────────────
// Manuscript rule:
//   • Day Saat 1 begins at Sunrise; Day Saat 12 ends at Sunset.
//   • Night Saat 1 begins at Sunset; Night Saat 12 ends at next Sunrise.
//
// This delegates to the EXISTING Astro Clock `getCurrentPlanetaryHour`
// calculation — it already divides the daytime period (Sunrise→Sunset)
// and nighttime period (Sunset→next Sunrise) into 12 Saat each and
// returns the hourNumber (1–12) whose interval contains the current time.
//
// No Saat is calculated from the raw clock hour. The current time is
// compared directly against the Astro Clock's Sunrise/Sunset-based Saat
// intervals. Manual Saat selection is untouched.
//
// The `dayNight` argument is accepted for interface compatibility but
// intentionally NOT used: "NOW" reflects the actual Saat containing the
// current moment, per the Astro Clock, regardless of the Mizaan3 selection.
// ═══════════════════════════════════════════════════════════════
import { getCurrentPlanetaryHour, getDayRuler, getActiveWeekday, PLANET_SEQUENCE } from "./astroClockLiveEngine";
import { calculateSunriseSunset, getUserLocation } from "./astroClockSunriseSunset";

// ── Planning Mode support ──
// When set, getCurrentSaat / getCurrentKawkab / getCurrentLaylNahar /
// getCurrentWeekdayKey use this location + date instead of live time.
// Set by RitualDecisionEngine via setSaatPlanningContext(). Mizan cards
// subscribe via subscribeSaatPlanningContext() to re-render immediately.
let _planningContext = null;
const _planningListeners = new Set();

export function setSaatPlanningContext(ctx) {
  _planningContext = ctx;
  _planningListeners.forEach((fn) => fn());
}

export function subscribeSaatPlanningContext(fn) {
  _planningListeners.add(fn);
  return () => { _planningListeners.delete(fn); };
}

/**
 * Returns the current Saat (1–12) — the Astro Clock Saat interval that
 * contains the current time.
 *
 * @param {*} _dayNight — accepted for interface compatibility; intentionally unused.
 * @returns {number} 1–12
 */
export function getCurrentSaat(_dayNight = null) {
  const now = _planningContext?.date || new Date();
  const loc = _planningContext?.location || getUserLocation();
  const { sunrise, sunset } = calculateSunriseSunset(now, loc.lat, loc.lng, loc.timezone);

  // Polar edge-case fallback (never occurs in the default Dubai location) —
  // preserves a safe 1–12 value so the UI never breaks.
  if (sunrise === null || sunset === null) {
    return (Math.floor(now.getHours() / 2) % 12) + 1;
  }

  // Shift now to the location's timezone so getHours()/getDay() return local
  // time matching the sunrise/sunset values from calculateSunriseSunset.
  // Without this, a browser in a non-Dubai timezone would read the wrong hour
  // and default to Sahat 1 instead of the actual current Sahat.
  const tzDiffMs = (loc.timezone * 60 + now.getTimezoneOffset()) * 60 * 1000;
  const localNow = new Date(now.getTime() + tzDiffMs);

  // Use the EXACT Astro Clock Saat interval calculation. This returns the
  // hourNumber whose [hourStart, hourEnd) interval contains the current time.
  const hour = getCurrentPlanetaryHour(localNow, sunrise, sunset);
  return hour.hourNumber;
}

// ─────────────────────────────────────────────────────────────────
// MIZAAN 6 — KAWKAB (PLANET) "NOW" DETECTION
// ─────────────────────────────────────────────────────────────────
// Reuses the EXACT same Astro Clock `getCurrentPlanetaryHour` call as the
// Saat detection above — the planetary-hour (Kawkab) algorithm is NOT
// duplicated. The Astro Clock's returned planet name is mapped to the
// corresponding Mizan planet key only; no calculation is reinvented.
//
// Astro Clock planet names (PLANET_SEQUENCE) → Mizan planet keys:
const ASTRO_TO_MIZAN_PLANET = Object.freeze({
  saturn:  'zuhal',
  jupiter: 'mustari',
  mars:    'merih',
  sun:     'sems',
  venus:   'zuhre',
  mercury: 'utarid',
  moon:    'kamer',
});

/**
 * Returns the Mizan planet key for the current planetary hour (Kawkab),
 * exactly as identified by the Astro Clock. Returns null if the Astro
 * Clock cannot determine sunrise/sunset (polar edge case).
 * @returns {string|null} one of: zuhal, mustari, merih, sems, zuhre, utarid, kamer
 */
export function getCurrentKawkab() {
  const now = _planningContext?.date || new Date();
  const loc = _planningContext?.location || getUserLocation();
  const { sunrise, sunset } = calculateSunriseSunset(now, loc.lat, loc.lng, loc.timezone);
  if (sunrise === null || sunset === null) return null;
  // Shift now to the location's timezone — same correction as getCurrentSaat.
  const tzDiffMs = (loc.timezone * 60 + now.getTimezoneOffset()) * 60 * 1000;
  const localNow = new Date(now.getTime() + tzDiffMs);
  const hour = getCurrentPlanetaryHour(localNow, sunrise, sunset);
  return ASTRO_TO_MIZAN_PLANET[hour.planet] || null;
}

// ─────────────────────────────────────────────────────────────────
// LIVE Layl / Nahar (Mizaan 3) — real current day-or-night state
// ─────────────────────────────────────────────────────────────────
// Returns 'gunduz' (day) or 'gece' (night) based on whether the current
// local time falls between sunrise and sunset. Visual reference only —
// never overwrites manual selections.
const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat'];

export function getCurrentLaylNahar() {
  const now = _planningContext?.date || new Date();
  const loc = _planningContext?.location || getUserLocation();
  const { sunrise, sunset } = calculateSunriseSunset(now, loc.lat, loc.lng, loc.timezone);
  if (sunrise === null || sunset === null) return null;
  const tzDiffMs = (loc.timezone * 60 + now.getTimezoneOffset()) * 60 * 1000;
  const localNow = new Date(now.getTime() + tzDiffMs);
  const h = localNow.getHours() + localNow.getMinutes() / 60;
  return h >= sunrise && h < sunset ? 'gunduz' : 'gece';
}

// ─────────────────────────────────────────────────────────────────
// LIVE Weekday (Mizaan 5) — sunset-aware manuscript weekday
// ─────────────────────────────────────────────────────────────────
// Uses getActiveWeekday (sunset boundary, not civil midnight) with real
// local sunrise/sunset. Returns one of: sun, mon, tue, wed, thu, fri, sat.
export function getCurrentWeekdayKey() {
  const now = _planningContext?.date || new Date();
  const loc = _planningContext?.location || getUserLocation();
  const { sunrise, sunset } = calculateSunriseSunset(now, loc.lat, loc.lng, loc.timezone);
  const sr = (sunrise != null) ? sunrise : 6.5;
  const ss = (sunset != null) ? sunset : 18.25;
  const tzDiffMs = (loc.timezone * 60 + now.getTimezoneOffset()) * 60 * 1000;
  const localNow = new Date(now.getTime() + tzDiffMs);
  return DAY_KEYS[getActiveWeekday(localNow, sr, ss)];
}

// ─────────────────────────────────────────────────────────────────
// KAWKAB FOR A SPECIFIC SAAT (Selected Saat → Kawkab sync)
// ─────────────────────────────────────────────────────────────────
// Reads DIRECTLY from the manuscript Day/Night planetary-hour tables
// (GÜNDÜZ / GECE SAATLERİ TABLOSU). No sequence inference — each cell is
// the exact manuscript value for the (Day, Day/Night, Saat) triple.
//
// Cell values use Astro Clock planet names and are mapped to Mizan keys via
// ASTRO_TO_MIZAN_PLANET. The NOW Kawkab (getCurrentKawkab above) still
// reuses the Astro Clock engine; this lookup serves the SELECTED triple.

// GÜNDÜZ SAATLERİ TABLOSU — Day table (Saat 1–12 × 7 weekdays)
const MANUSCRIPT_DAY_TABLE = Object.freeze({
  sun: ['sun','venus','mercury','moon','saturn','jupiter','mars','sun','venus','mercury','moon','saturn'],
  mon: ['moon','saturn','jupiter','mars','sun','venus','mercury','moon','saturn','jupiter','mars','sun'],
  tue: ['mars','sun','venus','mercury','moon','saturn','jupiter','mars','sun','venus','mercury','moon'],
  wed: ['mercury','moon','saturn','jupiter','mars','sun','venus','mercury','moon','saturn','jupiter','mars'],
  thu: ['jupiter','mars','sun','venus','mercury','moon','saturn','jupiter','mars','sun','venus','mercury'],
  fri: ['venus','mercury','moon','saturn','jupiter','mars','sun','venus','mercury','moon','saturn','jupiter'],
  sat: ['saturn','jupiter','mars','sun','venus','mercury','moon','saturn','jupiter','mars','sun','venus'],
});

// GECE SAATLERİ TABLOSU — Night table (Saat 1–12 × 7 weekdays)
const MANUSCRIPT_NIGHT_TABLE = Object.freeze({
  sun: ['mercury','moon','saturn','jupiter','mars','sun','venus','mercury','moon','saturn','jupiter','mars'],
  mon: ['jupiter','mars','sun','venus','mercury','moon','saturn','jupiter','mars','sun','venus','mercury'],
  tue: ['venus','mercury','moon','saturn','jupiter','mars','sun','venus','mercury','moon','saturn','jupiter'],
  wed: ['saturn','jupiter','mars','sun','venus','mercury','moon','saturn','jupiter','mars','sun','venus'],
  thu: ['sun','venus','mercury','moon','saturn','jupiter','mars','sun','venus','mercury','moon','saturn'],
  fri: ['moon','saturn','jupiter','mars','sun','venus','mercury','moon','saturn','jupiter','mars','sun'],
  sat: ['mars','sun','venus','mercury','moon','saturn','jupiter','mars','sun','venus','mercury','moon'],
});

/**
 * Returns the Mizan planet key for a specific (Day, Day/Night, Saat) triple,
 * read directly from the manuscript Day or Night table — no inference.
 *
 * @param {number} saatNumber 1–12
 * @param {string} dayKey     one of: sun, mon, tue, wed, thu, fri, sat
 * @param {string|null} dayNight  'gunduz' (day) | 'gece' (night) | null (treated as day)
 * @returns {string|null}     one of: zuhal, mustari, merih, sems, zuhre, utarid, kamer
 */
export function getKawkabForSaat(saatNumber, dayKey, dayNight = null) {
  if (!saatNumber || saatNumber < 1 || saatNumber > 12) return null;
  const table = dayNight === 'gece' ? MANUSCRIPT_NIGHT_TABLE : MANUSCRIPT_DAY_TABLE;
  const row = table[dayKey];
  if (!row) return null;
  const astroPlanet = row[saatNumber - 1];
  return ASTRO_TO_MIZAN_PLANET[astroPlanet] || null;
}
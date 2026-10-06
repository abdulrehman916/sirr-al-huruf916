/**
 * ASTRO CLOCK — NASA JPL HORIZONS API INTEGRATION
 * Real-time astronomical data from NASA JPL Solar System Dynamics
 * Astro Clock module only — completely isolated
 *
 * PRECISION PATH (audit 2026-07-29, Phase 2.2): the browser cannot fetch JPL
 * Horizons directly (CORS), so the primary path invokes the backend function
 * `getLiveMoonPosition` (server-side Deno fetch, no CORS). The direct browser
 * fetch here is kept as a secondary fallback (correct params/parser, but
 * usually CORS-blocked), and the local simplified formula is the tertiary
 * fallback. The `source` field is always transparent — never silently downgraded.
 */

import { base44 } from '@/api/base44Client';

// ─────────────────────────────────────────────────────────────────────────────
// NASA JPL HORIZONS API CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const JPL_HORIZONS_API = 'https://ssd.jpl.nasa.gov/api/horizons.api';

/**
 * Build JPL Horizons API URL for geocentric apparent ecliptic longitude.
 * JPL requires the ISO 'T' date separator (a space produces "Too many
 * constants"). Validated against the live API 2026-07-29.
 */
function buildHorizonsUrl(target, date, _lat = 0, _lng = 0) {
  const pad = (n) => String(n).padStart(2, '0');
  const isoT = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  const startTime = isoT(date);
  const stopTime = isoT(new Date(date.getTime() + 60000));

  // JPL Horizons body IDs
  const bodyIds = {
    'sun': '0',
    'moon': '301',
    'mercury': '199',
    'venus': '299',
    'mars': '499',
    'jupiter': '599',
    'saturn': '699',
    'uranus': '799',
    'neptune': '899'
  };

  const targetId = bodyIds[target.toLowerCase()] || target;

  // Geocentric apparent ecliptic longitude/latitude (QUANTITIES=31),
  // Earth center (CENTER=399) — manuscript engine uses geocentric tropical
  // ecliptic longitude. No observer coords needed (was 'coord@399').
  const params = new URLSearchParams({
    format: 'json',
    COMMAND: String(targetId),
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'OBSERVER',
    CENTER: '399',
    START_TIME: startTime,
    STOP_TIME: stopTime,
    STEP_SIZE: '1m',
    QUANTITIES: '31'
  });

  return `${JPL_HORIZONS_API}?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH PLANETARY DATA FROM NASA JPL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch planetary ephemeris data from NASA JPL Horizons
 * @param {string} target - Target body
 * @param {Date} date - Date/time
 * @param {Object} location - Observer location {lat, lng}
 * @returns {Promise<Object>} Planetary data
 */
export async function fetchFromJPLHorizons(target, date, location = { lat: 0, lng: 0 }) {
  try {
    const url = buildHorizonsUrl(target, date, location.lat, location.lng);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`JPL API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Parse JPL Horizons response
    return parseJPLResponse(data, target);
    
  } catch (error) {
    console.error(`Failed to fetch ${target} from JPL Horizons:`, error);
    // Return null to indicate fallback to local calculation
    return null;
  }
}

/**
 * Parse JPL Horizons API response.
 * JPL (format=json) returns the ephemeris as a TEXT block inside the
 * `result` string delimited by $$SOE ... $$EOE — NOT structured JSON with
 * RA/DEC/AZ keys. The previous parser read `jplData.data.ephemeris.data[0]`
 * which never exists, so it ALWAYS returned null → always fell back (audit
 * finding 1.4). This parser extracts the SOE line and reads the apparent
 * ecliptic longitude / latitude columns (QUANTITIES=31).
 */
function parseJPLResponse(jplData, target) {
  try {
    const result = typeof jplData === 'string' ? jplData : (jplData.result || '');
    if (!result) return null;
    const soe = result.indexOf('$$SOE');
    const eoe = result.indexOf('$$EOE');
    if (soe < 0 || eoe <= soe) return null;
    const lines = result.slice(soe + 5, eoe).trim().split('\n');
    if (!lines.length) return null;
    // SOE line: "<date> <time> [flag] <ecl-lon> <ecl-lat> ..." — take the
    // first two pure-numeric tokens (ecliptic longitude, then latitude).
    const tokens = lines[0].trim().split(/\s+/);
    const nums = tokens.filter((t) => /^-?\d+(\.\d+)?$/.test(t));
    if (nums.length < 1) return null;
    return {
      target,
      timestamp: new Date().toISOString(),
      source: 'NASA JPL Horizons',
      accuracy: 'arcsecond',
      eclipticLongitude: parseFloat(nums[0]),
      eclipticLatitude: nums.length > 1 ? parseFloat(nums[1]) : 0,
    };
  } catch (error) {
    console.error('Failed to parse JPL response:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED MOON POSITION (JPL + LOCAL FALLBACK)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get moon position with JPL Horizons data.
 *
 * PRECISION PATH (Phase 2.2): the browser cannot fetch JPL Horizons directly
 * (CORS), so the PRIMARY path invokes the backend function
 * `getLiveMoonPosition` (server-side Deno fetch). The direct browser fetch
 * is the SECONDARY path (usually CORS-blocked but kept for correctness).
 * The local simplified formula is the TERTIARY fallback. The `source` field
 * always reflects which path produced the data — never silently downgraded.
 * @param {Date} date - Date to calculate for
 * @param {Object} location - Observer location {lat, lng}
 * @returns {Promise<Object>} Moon position data
 */
export async function getEnhancedMoonPosition(date, location = { lat: 0, lng: 0 }) {
  const { findLunarMansion, getZodiacSign } = await import('./astroClockMoonPosition.js');

  // PRIMARY — backend function (server-side JPL fetch, no CORS).
  try {
    const resp = await base44.functions.invoke('getLiveMoonPosition', {
      lat: location.lat,
      lng: location.lng,
      date: date.toISOString(),
    });
    // The SDK returns an axios envelope; the function body is at resp.data.
    const body = resp && resp.data && resp.data.success !== undefined ? resp.data : resp;
    if (body && body.success && body.data && body.data.eclipticLongitude !== undefined) {
      const longitude = body.data.eclipticLongitude;
      return {
        longitude: longitude.toFixed(4), // arcsecond precision
        latitude: (body.data.eclipticLatitude || 0).toFixed(4),
        distance: 'N/A',
        phase: calculateMoonPhase(date),
        mansion: findLunarMansion(longitude),
        zodiacSign: getZodiacSign(longitude),
        nakshatra: findLunarMansion(longitude)?.name_en || 'Unknown',
        calculatedFor: date.toISOString(),
        source: body.source || 'NASA JPL Horizons',
        accuracy: body.accuracy || 'arcsecond',
        rawJPL: body.data,
      };
    }
  } catch (e) {
    console.warn('Backend JPL path failed, trying direct fetch:', e.message);
  }

  // SECONDARY — direct browser fetch (usually CORS-blocked, kept for completeness).
  const jplData = await fetchFromJPLHorizons('moon', date, location);
  if (jplData && jplData.eclipticLongitude !== undefined) {
    const longitude = jplData.eclipticLongitude;
    return {
      longitude: longitude.toFixed(4),
      latitude: (jplData.eclipticLatitude || 0).toFixed(4),
      distance: 'N/A',
      phase: calculateMoonPhase(date),
      mansion: findLunarMansion(longitude),
      zodiacSign: getZodiacSign(longitude),
      nakshatra: findLunarMansion(longitude)?.name_en || 'Unknown',
      calculatedFor: date.toISOString(),
      source: 'NASA JPL Horizons (direct)',
      accuracy: 'arcsecond',
      rawJPL: jplData,
    };
  }

  // TERTIARY — local simplified formula (transparent source).
  const { calculateMoonPosition } = await import('./astroClockMoonPosition.js');
  const localData = calculateMoonPosition(date);
  return {
    ...localData,
    source: 'Local Calculation (Simplified)',
    accuracy: 'approximate',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANETARY POSITIONS FROM JPL
// ─────────────────────────────────────────────────────────────────────────────

const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

/**
 * Get all planetary positions from JPL Horizons
 * @param {Date} date - Date to calculate for
 * @param {Object} location - Observer location
 * @returns {Promise<Object>} All planetary positions
 */
export async function getAllPlanetaryPositions(date, location = { lat: 0, lng: 0 }) {
  const positions = {};

  // Fetch all planets in parallel. Direct browser fetch is usually
  // CORS-blocked, so planets that fail are transparently marked — never
  // silently labelled as JPL/arcsecond (audit finding 1.4).
  const promises = PLANETS.map(async (planet) => {
    const data = await fetchFromJPLHorizons(planet, date, location);
    positions[planet] = data || {
      source: 'Not available (browser CORS / JPL unreachable)',
      accuracy: 'N/A',
    };
  });

  await Promise.all(promises);

  return positions;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate moon phase (illumination fraction)
 * @param {Date} date - Date
 * @returns {string} Phase percentage
 */
function calculateMoonPhase(date) {
  // Simplified phase calculation for fallback
  const J2000 = 2451545.0;
  const JD = getJulianDate(date);
  const T = (JD - J2000) / 36525;
  
  // Mean elongation
  let D = 297.8501921 + 445267.1114034 * T;
  D = D % 360;
  if (D < 0) D += 360;
  
  const phase = (1 - Math.cos(D * Math.PI / 180)) / 2;
  return (phase * 100).toFixed(1);
}

/**
 * Get Julian Date
 * @param {Date} date
 * @returns {number} Julian Date
 */
function getJulianDate(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
  
  let Y = year;
  let M = month;
  
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + day + B - 1524.5 + hour / 24;
}

// ─────────────────────────────────────────────────────────────────────────────
// API STATUS
// ─────────────────────────────────────────────────────────────────────────────

export const JPL_INTEGRATION_STATUS = {
  version: '1.0.0',
  initialized: true,
  source: 'NASA JPL Horizons API',
  accuracy: 'arcsecond',
  features: [
    'Real-time moon position from NASA',
    'Planetary ephemeris data',
    'Automatic fallback to local calculation',
    'Arcsecond precision',
    'Geocentric coordinates'
  ],
  note: 'JPL Horizons integration ready — provides high-precision astronomical data'
};
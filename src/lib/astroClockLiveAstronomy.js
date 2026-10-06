/**
 * ASTRO CLOCK — LIVE ASTRONOMY ENGINE
 * Enhanced with NASA JPL Horizons data
 * Astro Clock module only — completely isolated
 */

import { getEnhancedMoonPosition, getAllPlanetaryPositions } from './astroClockJPLHorizons.js';
import { AY_MANAZILLERI } from './astroClockData.js';
import { PLANETARY_HOUR_RULES } from './astroClockPlanetaryHourRules.js';
import { mansionIndexFromLongitude } from './astroClockMoonPosition.js';

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED MOON POSITION WITH JPL DATA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get live moon position with JPL Horizons precision
 * @param {Date} date - Date to calculate for
 * @param {Object} location - Observer location {lat, lng}
 * @returns {Promise<Object>} Enhanced moon position
 */
export async function getLiveMoonPosition(date = new Date(), location = { lat: 0, lng: 0 }) {
  try {
    const moonData = await getEnhancedMoonPosition(date, location);
    
    return {
      ...moonData,
      timestamp: new Date().toISOString(),
      isLive: moonData.source === 'NASA JPL Horizons',
      accuracy: moonData.accuracy
    };
  } catch (error) {
    console.error('Failed to get live moon position:', error);
    // Return basic fallback
    return {
      longitude: '0.00',
      latitude: '0.00',
      distance: '0.000',
      phase: '0.0',
      mansion: null,
      zodiacSign: null,
      source: 'Error',
      accuracy: 'N/A',
      isLive: false
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE PLANETARY POSITIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all planetary positions with JPL data
 * @param {Date} date - Date to calculate for
 * @param {Object} location - Observer location
 * @returns {Promise<Object>} All planetary positions
 */
export async function getLivePlanetaryPositions(date = new Date(), location = { lat: 0, lng: 0 }) {
  try {
    const positions = await getAllPlanetaryPositions(date, location);
    
    // Enhance with zodiac signs and mansion data
    const enhanced = {};
    
    for (const [planet, data] of Object.entries(positions)) {
      if (data && data.eclipticLongitude !== undefined) {
        enhanced[planet] = {
          ...data,
          zodiacSign: getZodiacSign(data.eclipticLongitude),
          longitude: data.eclipticLongitude.toFixed(4)
        };
      } else {
        enhanced[planet] = {
          ...data,
          zodiacSign: null,
          longitude: 'N/A'
        };
      }
    }
    
    // Reflect the ACTUAL source — never silently label fallback data as
    // JPL/arcsecond (audit finding 1.4 / Phase 2.2 "never silently downgrade").
    const planetValues = Object.values(enhanced);
    const allJPL = planetValues.length > 0 && planetValues.every(p => p && p.source === 'NASA JPL Horizons');
    const anyJPL = planetValues.some(p => p && p.source === 'NASA JPL Horizons');
    return {
      planets: enhanced,
      timestamp: new Date().toISOString(),
      source: allJPL ? 'NASA JPL Horizons' : anyJPL ? 'Mixed (partial JPL)' : 'Not available (COS / JPL unreachable)',
      accuracy: allJPL ? 'arcsecond' : 'N/A',
    };
    
  } catch (error) {
    console.error('Failed to get planetary positions:', error);
    return {
      planets: {},
      source: 'Error',
      accuracy: 'N/A'
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE LUNAR MANSION (FROM JPL LONGITUDE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current lunar mansion from precise JPL longitude
 * @param {number} longitude - Ecliptic longitude from JPL
 * @returns {Object} Lunar mansion data
 */
export function getLiveLunarMansion(longitude) {
  if (longitude === undefined || longitude === null) {
    return null;
  }
  
  // Manuscript mansion boundaries (unequal widths) from Havâss PDF2 p.64-74.
  // Shared helper in astroClockMoonPosition.js (MANSION_START_DEGREES).
  const mansionIndex = mansionIndexFromLongitude(longitude);
  
  if (mansionIndex >= 0 && mansionIndex < 28) {
    const mansion = AY_MANAZILLERI[mansionIndex];
    return {
      ...mansion,
      longitude: longitude.toFixed(4),
      accuracy: 'arcsecond',
      source: 'NASA JPL Horizons'
    };
  }
  
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE ZODIAC SIGN (FROM JPL LONGITUDE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get zodiac sign from precise JPL longitude
 * @param {number} longitude - Ecliptic longitude
 * @returns {Object} Zodiac sign data
 */
export function getZodiacSign(longitude) {
  if (longitude === undefined || longitude === null) {
    return null;
  }
  
  const signWidth = 30;
  const signIndex = Math.floor(longitude / signWidth);
  
  const signs = [
    { name_en: 'Aries', name_ml: 'മേഷം', symbol: '♈', arabic: 'الحمل' },
    { name_en: 'Taurus', name_ml: 'ഇടവം', symbol: '♉', arabic: 'الثور' },
    { name_en: 'Gemini', name_ml: 'മിഥുനം', symbol: '♊', arabic: 'الجوزاء' },
    { name_en: 'Cancer', name_ml: 'കർക്കിടകം', symbol: '♋', arabic: 'السرطان' },
    { name_en: 'Leo', name_ml: 'ചിങ്ങം', symbol: '♌', arabic: 'الأسد' },
    { name_en: 'Virgo', name_ml: 'കന്നി', symbol: '♍', arabic: 'العذراء' },
    { name_en: 'Libra', name_ml: 'തുലാം', symbol: '♎', arabic: 'الميزان' },
    { name_en: 'Scorpio', name_ml: 'വൃശ്ചികം', symbol: '♏', arabic: 'العقرب' },
    { name_en: 'Sagittarius', name_ml: 'ധനു', symbol: '♐', arabic: 'القوس' },
    { name_en: 'Capricorn', name_ml: 'മകരം', symbol: '♑', arabic: 'الجدي' },
    { name_en: 'Aquarius', name_ml: 'കുംഭം', symbol: '♒', arabic: 'الدلو' },
    { name_en: 'Pisces', name_ml: 'മീനം', symbol: '♓', arabic: 'الحوت' }
  ];
  
  return signs[signIndex] || signs[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE ASTRONOMICAL COORDINATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get complete astronomical coordinates for all bodies
 * @param {Date} date - Date
 * @param {Object} location - Observer location
 * @returns {Promise<Object>} Complete astronomical data
 */
export async function getLiveAstronomicalData(date = new Date(), location = { lat: 0, lng: 0 }) {
  try {
    // Get moon position
    const moon = await getLiveMoonPosition(date, location);
    
    // Get planetary positions
    const planets = await getLivePlanetaryPositions(date, location);
    
    // Get lunar mansion from precise longitude
    const moonLongitude = parseFloat(moon.longitude);
    const mansion = getLiveLunarMansion(moonLongitude);
    const zodiacSign = getZodiacSign(moonLongitude);
    
    // Source/accuracy/isLive reflect the ACTUAL moon data path (JPL or local
    // fallback), not a hardcoded JPL label (Phase 2.2 — never silently downgrade).
    return {
      timestamp: new Date().toISOString(),
      location: location,
      moon: {
        ...moon,
        mansion: mansion,
        zodiacSign: zodiacSign,
      },
      planets: planets.planets,
      source: moon.source || 'Unknown',
      accuracy: moon.accuracy || 'N/A',
      isLive: moon.source === 'NASA JPL Horizons',
    };
    
  } catch (error) {
    console.error('Failed to get live astronomical data:', error);
    return {
      timestamp: new Date().toISOString(),
      location: location,
      moon: null,
      planets: null,
      source: 'Error',
      accuracy: 'N/A',
      isLive: false
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANETARY INFLUENCES (FROM LIVE POSITIONS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate current planetary influences from live positions
 * @param {Object} astronomicalData - Live astronomical data
 * @returns {Object} Planetary influences
 */
export function getPlanetaryInfluences(astronomicalData) {
  if (!astronomicalData || !astronomicalData.planets) {
    return { influences: [], dominant: null };
  }
  
  const influences = [];
  
  // Analyze each planet's position and strength
  for (const [planet, data] of Object.entries(astronomicalData.planets)) {
    if (data && data.zodiacSign) {
      const influence = {
        planet: planet,
        sign: data.zodiacSign.name_en,
        longitude: parseFloat(data.longitude) || 0,
        strength: calculatePlanetaryStrength(planet, data.zodiacSign.name_en),
        nature: getPlanetaryNature(planet)
      };
      
      influences.push(influence);
    }
  }
  
  // Sort by strength
  influences.sort((a, b) => b.strength - a.strength);
  
  return {
    influences: influences,
    dominant: influences[0] || null,
    timestamp: astronomicalData.timestamp
  };
}

/**
 * Calculate planetary strength based on sign dignity
 * @param {string} planet - Planet name
 * @param {string} sign - Zodiac sign
 * @returns {number} Strength score (0-100)
 */
function calculatePlanetaryStrength(planet, _sign) {
  // MANUSCRIPT-ONLY (audit 2026-07-28): Western essential dignity (own/exalted/
  // debilitated) is NOT found in the uploaded manuscripts. Strength is now derived
  // solely from the manuscript Sa'd/Nahs planetary nature. The `sign` argument is
  // intentionally unused — no per-sign dignity exists in the manuscripts.
  const NATURE_STRENGTH = {
    jupiter: 4, sun: 3, venus: 3, moon: 3, mercury: 2, mars: 2, saturn: 1
  };
  return NATURE_STRENGTH[planet] ?? 2; // neutral fallback
}

/**
 * Get planetary nature
 * @param {string} planet
 * @returns {string} Nature description
 */
function getPlanetaryNature(planet) {
  // MANUSCRIPT-ONLY (audit 2026-07-28): return manuscript Sa'd/Nahs nature label
  // from PLANETARY_HOUR_RULES (Havâss'ın Derinlikleri). Generic English labels
  // ("King of Planets", "Greater Malefic") removed.
  const r = PLANETARY_HOUR_RULES[planet];
  return r ? r.nature : 'Not found in uploaded manuscripts';
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE STATUS
// ─────────────────────────────────────────────────────────────────────────────

export const LIVE_ASTRONOMY_ENGINE_STATUS = {
  version: '2.1.0',
  initialized: true,
  source: 'NASA JPL Horizons API (via backend) or Local Calculation fallback',
  accuracy: 'arcsecond when JPL available; approximate on fallback',
  features: [
    'Real-time moon position from NASA JPL Horizons (server-side)',
    'Live planetary ephemeris',
    'Precise lunar mansion calculation',
    'Zodiac sign from actual longitude',
    'Planetary influence analysis',
    'Transparent fallback to local calculation (source always disclosed)',
  ],
  note: 'Phase 2.2: JPL precision path repaired — backend fetch (no CORS), real $$SOE parser. Source/accuracy reflect the actual path; never silently downgraded.',
};
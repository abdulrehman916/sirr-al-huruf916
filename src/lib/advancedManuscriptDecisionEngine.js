/**
 * ADVANCED MANUSCRIPT DECISION ENGINE - ACTION TYPE AWARE
 * FINAL MANUSCRIPT RULE: Only uploaded PDF manuscripts as knowledge source
 * 
 * ACTION CLASSIFICATION:
 * - Beneficial Actions: Marriage, Muhabbah, Rizq, Healing, Knowledge, Worship, Prosperity
 *   → Use Sa'd Akbar, Sa'd Asghar, suitable mansions, suitable planetary hours
 * - Harmful Actions: Fear, Enemy work, Separation, Conflict, Repulsion, Destruction
 *   → Use Nahs Asghar, Nahs Akbar, harmful mansions, harmful planetary hours
 * 
 * NEVER recommend Sa'd periods for harmful actions.
 * NEVER recommend Nahs periods for beneficial actions.
 * Classification determined ONLY from uploaded manuscripts.
 */

import { AY_MANAZILLERI } from './astroClockData.js';
import { PLANETARY_HOUR_RULES } from './manuscriptRuleEngine.js';
import { getRulesForTopic } from './astroClockKnowledgeBaseFramework.js';
import { classifyActionType } from './actionTypeClassification.js';
import { getCurrentPlanetaryHour, getActiveWeekday } from './astroClockLiveEngine.js';
import { calculateSunriseSunset, getUserLocation } from './astroClockSunriseSunset.js';
import { calculateMoonPosition } from './astroClockMoonPosition.js';

/**
 * Search manuscripts for action-related rules with classification
 * @param {string} action - User action (marriage, business, travel, etc.)
 * @returns {object} Manuscript search results with classification
 */
export function searchManuscriptsForAction(action) {
  const actionKey = action.toLowerCase().replace(/\s+/g, '_');
  
  // Get rules from PDF knowledge base
  const rules = getRulesForTopic(actionKey);
  
  if (!rules || rules.length === 0) {
    return {
      found: false,
      action,
      message: "No matching manuscript rule found",
      message_ml: "ഹസ്തലിഖിതത്തിൽ യോജിക്കുന്ന നിയമമില്ല",
      rulesByManuscript: {},
      totalRules: 0
    };
  }
  
  // Classify action type
  const classification = classifyActionType(actionKey);
  
  // Group by manuscript source
  const rulesByManuscript = {};
  rules.forEach(rule => {
    const bookName = rule.book || "Havâss'ın Derinlikleri";
    if (!rulesByManuscript[bookName]) {
      rulesByManuscript[bookName] = [];
    }
    rulesByManuscript[bookName].push(rule);
  });
  
  return {
    found: true,
    action,
    classification,
    rulesByManuscript,
    totalRules: rules.length,
    manuscriptNames: Object.keys(rulesByManuscript)
  };
}

/**
 * Get current live astrological conditions
 * @param {Date} timestamp - Time to evaluate
 * @param {number} sunrise - Sunrise decimal hour
 * @param {number} sunset - Sunset decimal hour
 * @returns {object} Current conditions
 */
export function getCurrentLiveConditions(timestamp, sunrise = 6.5, sunset = 18.25) {
  const now = timestamp || new Date();
  // ── Astro Clock is the single source of truth ──
  // Real sunrise/sunset (NOAA + GPS/IANA tz), real lunar mansion from the
  // Moon's ecliptic longitude, sunset-aware weekday, and the Astro Clock's
  // planetary-hour engine. No crude day-of-month mansion, no civil weekday,
  // no fixed 6.5/18.25 when a location is available.
  const loc = getUserLocation();
  const sun = calculateSunriseSunset(now, loc.lat, loc.lng, loc.timezone);
  const sr = (sun.sunrise != null) ? sun.sunrise : sunrise;
  const ss = (sun.sunset != null) ? sun.sunset : sunset;
  // Shift now to the location's local time so getHours()/getDay() match the
  // location-local sunrise/sunset (same correction as useAstroData).
  const tzDiffMs = (loc.timezone * 60 + now.getTimezoneOffset()) * 60 * 1000;
  const localNow = new Date(now.getTime() + tzDiffMs);
  const dayIndex = getActiveWeekday(localNow, sr, ss);
  const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayKey = dayKeys[dayIndex];

  // Lunar mansion from the Astro Clock's Moon longitude (single source of truth).
  let liveMoon = null;
  try { liveMoon = calculateMoonPosition(now); } catch (_) { liveMoon = null; }
  const mansionNumber = liveMoon?.mansion?.no || (((Math.floor((parseFloat(liveMoon?.longitude) || 0) / (360 / 28))) % 28) + 1) || 1;
  const mansion = AY_MANAZILLERI.find(m => m.no === mansionNumber) || liveMoon?.mansion;

  const planetHour = getCurrentPlanetaryHour(localNow, sr, ss);
  const hour = localNow.getHours() + localNow.getMinutes() / 60;
  const isDaytime = hour >= sr && hour < ss;

  return {
    timestamp: now,
    lunarMansion: {
      number: mansionNumber,
      name_en: mansion?.name || mansion?.name_en || `Mansion ${mansionNumber}`,
      name_ml: mansion?.name_ml || `മൻസിൽ ${mansionNumber}`,
      name_ar: mansion?.name_arabic || mansion?.harfi || `منزل ${mansionNumber}`,
      nature: mansion?.nature || ''
    },
    planetaryHour: {
      planet: planetHour.planet,
      name_en: planetHour.planetInfo?.name_en || planetHour.planet,
      name_ml: planetHour.planetInfo?.name_ml_equivalent || planetHour.planet,
      nature: planetHour.planetInfo?.nature_en || planetHour.planetInfo?.nature || '',
      isDaytime
    },
    dayRuler: {
      name_en: dayKeys[dayIndex],
      name_ml: dayKeys[dayIndex]
    },
    isDaytime,
    isNighttime: !isDaytime
  };
}

/**
 * Compare manuscript rules against current conditions
 * ACTION TYPE AWARE: Apply Sa'd/Nahs criteria based on action classification
 * @param {array} manuscriptRules - Rules from manuscripts
 * @param {object} currentConditions - Live conditions
 * @param {object} actionClassification - Action type classification
 * @returns {object} Comparison results
 */
export function compareRulesAgainstConditions(manuscriptRules, currentConditions, actionClassification = null) {
  let score = 0;
  const matchingFactors = [];
  const conflictingFactors = [];
  
  // Get timing criteria from classification
  const timingCriteria = actionClassification?.timingCriteria || {
    preferred: [],
    avoid: [],
    mansionType: 'any',
    planetType: 'any'
  };
  
  // Check current planetary hour nature (Sa'd vs Nahs)
  const currentPlanetNature = currentConditions.planetaryHour.nature || '';
  const isCurrentSaad = currentPlanetNature.includes('Sa\'d') || currentPlanetNature.includes('beneficial');
  const isCurrentNahs = currentPlanetNature.includes('Nahs') || currentPlanetNature.includes('harmful');
  
  // ACTION TYPE ENFORCEMENT
  let actionTypePenalty = 0;
  if (actionClassification?.actionType === 'beneficial' && isCurrentNahs) {
    conflictingFactors.push({
      type: 'action_type_conflict',
      reason: 'Beneficial action during Nahs (harmful) planetary hour',
      severity: 'major'
    });
    actionTypePenalty = -5;
  } else if (actionClassification?.actionType === 'harmful' && isCurrentSaad) {
    conflictingFactors.push({
      type: 'action_type_conflict',
      reason: 'Harmful action during Sa\'d (beneficial) planetary hour',
      severity: 'major'
    });
    actionTypePenalty = -5;
  }
  
  manuscriptRules.forEach(rule => {
    const suitableMansions = extractMansionNumbers(rule.ruleText);
    const suitablePlanets = extractPlanets(rule.ruleText);
    const suitableDays = extractDays(rule.ruleText);
    const dayOrNight = extractDayOrNight(rule.ruleText);
    
    // Check mansion match with action type awareness
    if (suitableMansions.includes(currentConditions.lunarMansion.number)) {
      const mansion = AY_MANAZILLERI.find(m => m.no === currentConditions.lunarMansion.number);
      const mansionNature = mansion?.nature || '';
      
      let mansionScore = 3;
      
      if (actionClassification?.actionType === 'beneficial' && (mansionNature.includes('harmful') || mansionNature.includes('Nahs'))) {
        mansionScore = -2;
      } else if (actionClassification?.actionType === 'harmful' && (mansionNature.includes('beneficial') || mansionNature.includes('Sa\'d'))) {
        mansionScore = -2;
      }
      
      score += mansionScore;
      
      if (mansionScore > 0) {
        matchingFactors.push({
          type: "mansion_match",
          value: currentConditions.lunarMansion.number,
          name: currentConditions.lunarMansion.name_en,
          ruleText: rule.ruleText,
          book: rule.book || "Havâss'ın Derinlikleri",
          pages: rule.pages || "PDF2",
          original_text: rule.ruleText,
          malayalam_translation: rule.malayalamTranslation || null,
          why_applies: `Current mansion (${currentConditions.lunarMansion.number}) matches manuscript rule`
        });
      }
    }
    
    // Check planet match with action type awareness
    if (suitablePlanets.includes(currentConditions.planetaryHour.planet)) {
      const planetNature = currentConditions.planetaryHour.nature || '';
      
      let planetScore = 2;
      
      if (actionClassification?.actionType === 'beneficial' && (planetNature.includes('Nahs') || planetNature.includes('harmful'))) {
        planetScore = -2;
      } else if (actionClassification?.actionType === 'harmful' && (planetNature.includes('Sa\'d') || planetNature.includes('beneficial'))) {
        planetScore = -2;
      }
      
      score += planetScore;
      
      if (planetScore > 0) {
        matchingFactors.push({
          type: "planet_match",
          value: currentConditions.planetaryHour.planet,
          name: currentConditions.planetaryHour.name_en,
          ruleText: rule.ruleText,
          book: rule.book || "Havâss'ın Derinlikleri",
          pages: rule.pages || "PDF2",
          original_text: rule.ruleText,
          malayalam_translation: rule.malayalamTranslation || null,
          why_applies: `Current ${currentConditions.planetaryHour.name_en} hour matches manuscript rule`
        });
      }
    }
    
    // Check day match
    if (suitableDays.includes(currentConditions.dayRuler.name_en)) {
      score += 2;
      matchingFactors.push({
        type: "day_match",
        value: currentConditions.dayRuler.name_en,
        ruleText: rule.ruleText,
        book: rule.book || "Havâss'ın Derinlikleri",
        pages: rule.pages || "PDF2",
        original_text: rule.ruleText,
        malayalam_translation: rule.malayalamTranslation || null,
        why_applies: `Current day (${currentConditions.dayRuler.name_en}) matches manuscript rule`
      });
    }
    
    // Check day/night
    if (dayOrNight === "night" && currentConditions.isNighttime) {
      score += 1;
      matchingFactors.push({
        type: "time_match",
        value: "night",
        ruleText: rule.ruleText,
        book: rule.book || "Havâss'ın Derinlikleri",
        pages: rule.pages || "PDF2",
        original_text: rule.ruleText,
        malayalam_translation: rule.malayalamTranslation || null,
        why_applies: `Nighttime matches manuscript requirement`
      });
    } else if (dayOrNight === "day" && currentConditions.isDaytime) {
      score += 1;
      matchingFactors.push({
        type: "time_match",
        value: "day",
        ruleText: rule.ruleText,
        book: rule.book || "Havâss'ın Derinlikleri",
        pages: rule.pages || "PDF2",
        original_text: rule.ruleText,
        malayalam_translation: rule.malayalamTranslation || null,
        why_applies: `Daytime matches manuscript requirement`
      });
    }
  });
  
  score += actionTypePenalty;
  
  const hasMatchingRules = matchingFactors.length > 0;
  const hasConflicts = conflictingFactors.length > 0;
  
  let isSuitableNow = false;
  let isWait = false;
  
  if (hasConflicts) {
    isSuitableNow = false;
    isWait = false;
  } else {
    isSuitableNow = score >= 3 && hasMatchingRules;
    isWait = score >= 1 && score < 3 && hasMatchingRules;
  }
  
  const isUnsuitable = !hasMatchingRules || score === 0 || hasConflicts;
  
  return {
    score,
    isSuitableNow,
    isWait,
    isUnsuitable,
    hasMatchingRules,
    hasConflicts,
    matchingFactors,
    conflictingFactors,
    actionTypePenalty,
    totalRulesEvaluated: manuscriptRules.length,
    no_manuscript_match: !hasMatchingRules
  };
}

/**
 * Calculate next suitable time
 * @param {array} manuscriptRules - Rules from manuscripts
 * @param {Date} now - Current time
 * @param {number} sunrise - Sunrise decimal
 * @param {number} sunset - Sunset decimal
 * @returns {object} Next suitable time info
 */
export function calculateNextSuitableTime(manuscriptRules, now, sunrise = 6.5, sunset = 18.25) {
  for (let h = now.getHours() + 1; h < now.getHours() + 24; h++) {
    const future = new Date(now);
    future.setHours(h, 0, 0, 0);
    
    const conditions = getCurrentLiveConditions(future, sunrise, sunset);
    const comparison = compareRulesAgainstConditions(manuscriptRules, conditions);
    
    if (comparison.isSuitableNow) {
      const hoursUntil = h - now.getHours();
      return {
        found: true,
        time: future,
        formattedTime: formatTime(future),
        hoursUntil,
        countdown: formatCountdown(hoursUntil)
      };
    }
  }
  
  return {
    found: false,
    message: "No suitable time in next 24 hours",
    message_ml: "അടുത്ത 24 മണിക്കൂറിനുള്ളിൽ ഉചിത സമയമില്ല"
  };
}

// Helper functions
// (Removed local calculatePlanetaryHour — it duplicated the Astro Clock engine.
//  getCurrentLiveConditions above already uses the shared getCurrentPlanetaryHour
//  from astroClockLiveEngine.js, the single source of truth for planetary hours.)

function extractMansionNumbers(text) {
  const matches = text.match(/\d+/g);
  if (!matches) return [];
  return matches.map(n => parseInt(n)).filter(n => n >= 1 && n <= 28);
}

function extractPlanets(text) {
  const planets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];
  const found = [];
  planets.forEach(p => {
    if (text.toLowerCase().includes(p)) found.push(p);
  });
  return found;
}

function extractDays(text) {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const found = [];
  days.forEach(d => {
    if (text.toLowerCase().includes(d)) found.push(d);
  });
  return found;
}

function extractDayOrNight(text) {
  if (text.toLowerCase().includes("night")) return "night";
  if (text.toLowerCase().includes("day")) return "day";
  return null;
}

function formatTime(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const hours = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hours}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatCountdown(hours) {
  if (hours >= 24) return `${Math.floor(hours / 24)} day(s)`;
  if (hours >= 1) return `${hours} hour(s)`;
  return `${hours * 60} minute(s)`;
}

// Default export
export default {
  searchManuscriptsForAction,
  getCurrentLiveConditions,
  compareRulesAgainstConditions,
  calculateNextSuitableTime,
  classifyActionType
};
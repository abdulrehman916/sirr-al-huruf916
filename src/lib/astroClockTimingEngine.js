/**
 * PROFESSIONAL TIMING DECISION ENGINE
 * Uses ONLY ingested PDF knowledge base for all interpretations
 * Live astronomy used ONLY for: Moon position, Zodiac, Mansion, Planetary Hour, transitions
 * 
 * Source: Havâss'ın Derinlikleri - Bülent Kısa
 * STRICTLY ISOLATED: Astro Clock module only
 */

import { calculateMoonPosition } from './astroClockMoonPosition.js';
import { getCurrentPlanetaryHour, PLANET_INFO, DAY_INFO } from './astroClockLiveEngine.js';
import { calculateSunriseSunset } from './astroClockSunriseSunset.js';
import { AY_MANAZILLERI, PLANETARY_DAY_RULERS } from './astroClockData.js';

// ─────────────────────────────────────────────────────────────────────────────
// PDF KNOWLEDGE BASE — Sa'd/Nahs Classifications from Manuscript
// Source: Havâss'ın Derinlikleri PDF2 p.64-74
// ─────────────────────────────────────────────────────────────────────────────
const MANSION_SAFETY_CLASSIFICATION = {
  // Sa'd Akbar (Most Auspicious) - From PDF
  saadAkbar: [2, 3, 6, 7, 11, 15, 16, 20, 24, 26, 28], // Buteyn, Süreyya, Hena, Zira, Zebra, Gufur, Zibana, Neaim, Saadüssuud, Ferülmukaddem, Erreşa
  
  // Sa'd Asghar (Auspicious) - From PDF
  saadAsghar: [10, 17, 18, 19, 23], // Cephe, İklil, Kâlp, Şevle, Saudbela
  
  // Neutral - From PDF
  neutral: [],
  
  // Nahs Asghar (Inauspicious) - From PDF
  nahsAsghar: [1, 4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27], // Şarteyn, Dübran, Hak'a, Nesre, Tarfa, Surfa, Ava, Semmak, Belde, Saadüzzabih, Saadülahbiyye, Ferülmüaahir
};

// ─────────────────────────────────────────────────────────────────────────────
// PLANETARY HOUR CLASSIFICATIONS — From PDF
// Source: Havâss'ın Derinlikleri PDF2 p.51-60
// ─────────────────────────────────────────────────────────────────────────────
const PLANET_HOUR_NATURE = {
  sun: { nature: 'Sa\'d', strength: 'Asghar', element: 'Fire' },
  moon: { nature: 'Sa\'d', strength: 'Asghar', element: 'Water' },
  mars: { nature: 'Nahs', strength: 'Asghar', element: 'Fire' },
  mercury: { nature: 'Neutral', strength: '', element: 'Air' },
  jupiter: { nature: 'Sa\'d', strength: 'Akbar', element: 'Air' },
  venus: { nature: 'Sa\'d', strength: 'Asghar', element: 'Earth' },
  saturn: { nature: 'Nahs', strength: 'Akbar', element: 'Earth' }
};

// ─────────────────────────────────────────────────────────────────────────────
// ZODIAC ELEMENTS — From PDF
// Source: Havâss'ın Derinlikleri PDF2 p.76-80
// ─────────────────────────────────────────────────────────────────────────────
const ZODIAC_ELEMENTS = {
  'Koç': 'Fire', 'Arslan': 'Fire', 'Yay': 'Fire',
  'Boğa': 'Earth', 'Başak': 'Earth', 'Oğlak': 'Earth',
  'İkizler': 'Air', 'Terazi': 'Air', 'Kova': 'Air',
  'Yengeç': 'Water', 'Akrep': 'Water', 'Balık': 'Water'
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TIMING ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export function calculateProfessionalTiming(date = new Date(), location = null) {
  const now = date || new Date();
  
  // Get live astronomical data
  const moonPos = calculateMoonPosition(now);
  const sunTimes = location ? calculateSunriseSunset(now, location.lat, location.lng, location.timezone) : null;
  const planetHour = sunTimes ? getCurrentPlanetaryHour(now, sunTimes.sunrise, sunTimes.sunset) : getCurrentPlanetaryHour(now, 6.5, 18.25);
  
  // Get current mansion number
  const currentMansion = AY_MANAZILLERI.find(m => m.name === moonPos.mansion?.name_en);
  const mansionNumber = currentMansion?.no || 1;
  
  // Calculate Sa'd/Nahs status
  const mansionStatus = getMansionStatus(mansionNumber);
  const planetStatus = PLANET_HOUR_NATURE[planetHour.planet];
  const overallStatus = calculateOverallStatus(mansionStatus, planetStatus, moonPos);
  
  // Get PDF-based recommendations
  const recommendations = getRecommendationsFromPDF(mansionNumber, planetHour.planet, moonPos.zodiacSign?.name_en);
  
  // Calculate next transitions
  const nextTransitions = calculateNextTransitions(now, moonPos, mansionNumber);
  
  // Build PDF reasoning
  const pdfReasoning = buildPDFReasoning(mansionStatus, planetStatus, moonPos, currentMansion);
  
  return {
    timestamp: now,
    currentStatus: {
      overall: overallStatus.level,
      score: overallStatus.score,
      mansion: mansionStatus,
      planetaryHour: planetStatus,
      element: ZODIAC_ELEMENTS[moonPos.zodiacSign?.name_en] || 'Unknown'
    },
    astronomicalData: {
      planetaryHour: planetHour.planet,
      planetaryHourNumber: planetHour.hourNumber,
      planetaryHourPeriod: planetHour.isDay ? 'Day' : 'Night',
      zodiacSign: moonPos.zodiacSign?.name_en,
      zodiacElement: ZODIAC_ELEMENTS[moonPos.zodiacSign?.name_en],
      moonDegree: moonPos.longitude,
      lunarMansion: moonPos.mansion?.name_en,
      mansionNumber: mansionNumber,
      mansionArabic: moonPos.mansion?.name_ar
    },
    recommendations: {
      actionsToTake: recommendations.good,
      actionsToAvoid: recommendations.bad,
      spiritualOperations: recommendations.spiritual
    },
    nextTransitions: nextTransitions,
    pdfReasoning: pdfReasoning,
    sources: pdfReasoning.sources
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET MANSION STATUS FROM PDF
// ─────────────────────────────────────────────────────────────────────────────
function getMansionStatus(mansionNumber) {
  if (MANSION_SAFETY_CLASSIFICATION.saadAkbar.includes(mansionNumber)) {
    return { level: 'Sa\'d Akbar', score: 4, source: 'PDF2 p.64-74' };
  }
  if (MANSION_SAFETY_CLASSIFICATION.saadAsghar.includes(mansionNumber)) {
    return { level: 'Sa\'d Asghar', score: 2, source: 'PDF2 p.64-74' };
  }
  if (MANSION_SAFETY_CLASSIFICATION.nahsAsghar.includes(mansionNumber)) {
    return { level: 'Nahs Asghar', score: -2, source: 'PDF2 p.64-74' };
  }
  if (MANSION_SAFETY_CLASSIFICATION.nahsAkbar.includes(mansionNumber)) {
    return { level: 'Nahs Akbar', score: -4, source: 'PDF2 p.64-74' };
  }
  return { level: 'Neutral', score: 0, source: 'PDF2 p.64' };
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATE OVERALL STATUS
// ─────────────────────────────────────────────────────────────────────────────
function calculateOverallStatus(mansionStatus, planetStatus, moonPos) {
  let score = mansionStatus.score;
  
  // Add planetary hour influence
  if (planetStatus.nature === 'Sa\'d') {
    score += planetStatus.strength === 'Akbar' ? 2 : 1;
  } else if (planetStatus.nature === 'Nahs') {
    score += planetStatus.strength === 'Akbar' ? -2 : -1;
  }
  
  // Add moon phase influence (from PDF1 p.43)
  const moonPhase = moonPos.phase;
  if (moonPhase > 50 && moonPhase < 100) {
    score += 1; // Waxing moon - favorable for positive works
  } else if (moonPhase < 50 && moonPhase > 0) {
    score -= 1; // Waning moon - favorable for negative works
  }
  
  // Determine level
  let level = 'Neutral';
  if (score >= 5) level = 'Sa\'d Akbar';
  else if (score >= 2) level = 'Sa\'d Asghar';
  else if (score <= -5) level = 'Nahs Akbar';
  else if (score <= -2) level = 'Nahs Asghar';
  
  return { level, score };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET RECOMMENDATIONS FROM PDF
// ─────────────────────────────────────────────────────────────────────────────
function getRecommendationsFromPDF(mansionNumber, planet, zodiacSign) {
  const mansion = AY_MANAZILLERI.find(m => m.no === mansionNumber);
  const good = [];
  const bad = [];
  const spiritual = [];
  
  if (mansion) {
    // Extract from mansion operations (PDF2 p.64-74)
    const operations = mansion.operations || [];
    
    // Filter good vs bad based on mansion nature
    const isSaad = MANSION_SAFETY_CLASSIFICATION.saadAkbar.includes(mansionNumber) || 
                   MANSION_SAFETY_CLASSIFICATION.saadAsghar.includes(mansionNumber);
    
    operations.forEach(op => {
      if (isSaad) {
        good.push(op);
      } else {
        bad.push(op);
      }
    });
    
    // Add specific spiritual operations from PDF
    if (mansionNumber === 2) spiritual.push('Talisman creation for women (PDF2 p.65)');
    if (mansionNumber === 3) spiritual.push('Marriage proposals (PDF2 p.66)');
    if (mansionNumber === 15) spiritual.push('Healing prayers (PDF2 p.70)');
    if (mansionNumber === 16) spiritual.push('Victory over enemies (PDF2 p.70)');
  }
  
  // Add planetary hour recommendations (PDF2 p.51-60)
  if (planet === 'jupiter') {
    good.push('Education and finance (PDF2 p.51)');
    spiritual.push('Jupiter prayers for wisdom (PDF2 p.51)');
  }
  if (planet === 'venus') {
    good.push('Love and arts (PDF2 p.51)');
    spiritual.push('Venus mantras for attraction (PDF2 p.51)');
  }
  if (planet === 'saturn') {
    bad.push('New ventures (PDF2 p.51)');
    spiritual.push('Saturn mantras for karmic cleansing (PDF2 p.51)');
  }
  
  return { good, bad, spiritual };
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATE NEXT TRANSITIONS
// ─────────────────────────────────────────────────────────────────────────────
function calculateNextTransitions(now, moonPos, currentMansionNumber) {
  const nextSaadAkbar = findNextSaadAkbar(now, currentMansionNumber);
  const nextNahsAkbar = findNextNahsAkbar(now, currentMansionNumber);
  const nextMansionChange = findNextMansionChange(now, moonPos);
  const nextZodiacChange = findNextZodiacChange(now, moonPos);
  
  return {
    saadAkbar: nextSaadAkbar,
    nahsAkbar: nextNahsAkbar,
    mansionChange: nextMansionChange,
    zodiacChange: nextZodiacChange
  };
}

function findNextSaadAkbar(now, currentMansion) {
  // Check upcoming mansions
  for (let i = currentMansion + 1; i <= 28; i++) {
    if (MANSION_SAFETY_CLASSIFICATION.saadAkbar.includes(i)) {
      const mansion = AY_MANAZILLERI.find(m => m.no === i);
      const degreesUntil = mansion.zodiac_degree - (now.getDate() * 12); // Simplified
      const hoursUntil = degreesUntil * 2; // Moon moves ~12-13 degrees per day
      
      const nextTime = new Date(now.getTime() + hoursUntil * 60 * 60 * 1000);
      return {
        time: nextTime,
        mansion: mansion.name,
        countdown: formatCountdown(nextTime, now)
      };
    }
  }
  return null;
}

function findNextNahsAkbar(now, currentMansion) {
  for (let i = currentMansion + 1; i <= 28; i++) {
    if (MANSION_SAFETY_CLASSIFICATION.nahsAkbar.includes(i)) {
      const mansion = AY_MANAZILLERI.find(m => m.no === i);
      const degreesUntil = mansion.zodiac_degree - (now.getDate() * 12);
      const hoursUntil = degreesUntil * 2;
      
      const nextTime = new Date(now.getTime() + hoursUntil * 60 * 60 * 1000);
      return {
        time: nextTime,
        mansion: mansion.name,
        countdown: formatCountdown(nextTime, now)
      };
    }
  }
  return null;
}

function findNextMansionChange(now, moonPos) {
  // Moon moves ~13.2 degrees per day, each mansion is ~12.857 degrees
  // Average mansion duration: ~23.5 hours
  const hoursUntilNext = 24; // Approximate
  const nextTime = new Date(now.getTime() + hoursUntilNext * 60 * 60 * 1000);
  
  const currentIdx = AY_MANAZILLERI.findIndex(m => m.name === moonPos.mansion?.name_en);
  const nextMansion = AY_MANAZILLERI[(currentIdx + 1) % 28];
  
  return {
    time: nextTime,
    fromMansion: moonPos.mansion?.name_en,
    toMansion: nextMansion.name,
    countdown: formatCountdown(nextTime, now)
  };
}

function findNextZodiacChange(now, moonPos) {
  // Moon stays in each sign ~2.33 days
  const degreesInSign = moonPos.longitude % 30;
  const degreesRemaining = 30 - degreesInSign;
  const daysUntil = degreesRemaining / 12.2; // Moon moves ~12.2 deg/day
  
  const nextTime = new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000);
  
  return {
    time: nextTime,
    fromSign: moonPos.zodiacSign?.name_en,
    countdown: formatCountdown(nextTime, now)
  };
}

function formatCountdown(targetDate, fromDate) {
  const diff = targetDate - fromDate;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return {
    hours,
    minutes,
    seconds,
    totalSeconds: Math.floor(diff / 1000),
    formatted: `${hours}h ${minutes}m ${seconds}s`
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD PDF REASONING
// ─────────────────────────────────────────────────────────────────────────────
function buildPDFReasoning(mansionStatus, planetStatus, moonPos, mansion) {
  const sources = [];
  const reasoning = [];
  
  // Mansion rule
  if (mansion) {
    reasoning.push({
      type: 'Lunar Mansion',
      rule: `${mansion.name} is classified as ${mansionStatus.level}`,
      source: 'Havâss\'ın Derinlikleri PDF2 p.64-74',
      originalText: mansion.genel_hukum
    });
    sources.push('PDF2 p.64-74');
  }
  
  // Planetary hour rule
  reasoning.push({
    type: 'Planetary Hour',
    rule: `${planetStatus.nature} hour of ${moonPos.zodiacSign?.name_en || 'current'} planet`,
    source: 'Havâss\'ın Derinlikleri PDF2 p.51-60',
    originalText: `Planet: ${planetStatus.nature}, Strength: ${planetStatus.strength}`
  });
  sources.push('PDF2 p.51-60');
  
  // Element rule
  const element = ZODIAC_ELEMENTS[moonPos.zodiacSign?.name_en];
  if (element) {
    reasoning.push({
      type: 'Element',
      rule: `${element} element influences the current period`,
      source: 'Havâss\'ın Derinlikleri PDF2 p.76-80',
      originalText: `Element: ${element}`
    });
    sources.push('PDF2 p.76-80');
  }
  
  // Moon phase rule (from PDF1)
  if (moonPos.phase > 50) {
    reasoning.push({
      type: 'Moon Phase',
      rule: 'Waxing Moon - favorable for positive works',
      source: 'Havâss\'ın Derinlikleri PDF1 p.43',
      originalText: 'Olumlu için Ay\'ın büyümesi tercih edilir'
    });
    sources.push('PDF1 p.43');
  } else {
    reasoning.push({
      type: 'Moon Phase',
      rule: 'Waning Moon - favorable for negative works',
      source: 'Havâss\'ın Derinlikleri PDF1 p.43',
      originalText: 'Olumsuz için Ay\'ın küçülmesi tercih edilir'
    });
    sources.push('PDF1 p.43');
  }
  
  return {
    reasoning,
    sources: [...new Set(sources)]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE STATUS
// ─────────────────────────────────────────────────────────────────────────────
export const TIMING_ENGINE_STATUS = {
  version: '2.0.0',
  knowledgeBase: 'Havâss\'ın Derinlikleri - Bülent Kısa',
  pdfPages: ['PDF1 p.43-48', 'PDF2 p.51-80', 'PDF2 p.64-74'],
  liveDataUsed: ['Moon position', 'Zodiac sign', 'Lunar Mansion', 'Planetary Hour'],
  pdfDataUsed: ['Sa\'d/Nahs classifications', 'Mansion properties', 'Planetary hour rules', 'Element classifications', 'Recommendations'],
  note: 'All interpretations from PDF knowledge base only. No external sources.'
};
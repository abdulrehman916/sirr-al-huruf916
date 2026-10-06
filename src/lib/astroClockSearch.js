/**
 * ASTRO CLOCK KNOWLEDGE SEARCH SYSTEM
 * Search across all imported PDF knowledge
 * Astro Clock only — no other modules modified
 */

import {
  KNOWLEDGE_DAYS_ML,
  KNOWLEDGE_HOURS_ML,
  KNOWLEDGE_LUNAR_MANSIONS_ML,
  KNOWLEDGE_TIMING_RULES_ML
} from './astroClockKnowledgeBaseML.js';
import {
  ASTEROID_TIMING_RULES,
  ASTEROID_HOUSE_RULES,
  ASTEROID_ASPECT_RULES
} from './astroClockAsteroidData.js';
import {
  ALL_ASTEROID_KNOWLEDGE,
  CERES_KNOWLEDGE,
  PALLAS_KNOWLEDGE,
  JUNO_KNOWLEDGE,
  VESTA_KNOWLEDGE,
  CHIRON_KNOWLEDGE
} from './astroClockAsteroidDataComprehensive.js';

// Combine all knowledge sources
const ALL_KNOWLEDGE = [
  ...KNOWLEDGE_DAYS_ML,
  ...KNOWLEDGE_HOURS_ML,
  ...KNOWLEDGE_LUNAR_MANSIONS_ML,
  ...KNOWLEDGE_TIMING_RULES_ML,
  // Asteroid knowledge (additive only — no overwrites)
  ...ASTEROID_TIMING_RULES,
  ...ASTEROID_HOUSE_RULES,
  ...ASTEROID_ASPECT_RULES,
  // Comprehensive asteroid knowledge (Pages 1-60)
  ...ALL_ASTEROID_KNOWLEDGE
];

/**
 * Search knowledge base by multiple criteria
 * @param {Object} params - Search parameters
 * @param {string} params.query - Free text search (searches Turkish, Malayalam, Arabic)
 * @param {string} params.day - Filter by day (e.g., "ഞായറാഴ്ച", "Sunday", "Pazar")
 * @param {string} params.hour - Filter by hour number (1-12)
 * @param {string} params.planet - Filter by planet (e.g., "സൂര്യൻ", "Sun", "Güneş")
 * @param {string} params.mansion - Filter by lunar mansion (e.g., "ശർത്തെയ്ൻ", "Şarteyn")
 * @param {string} params.zodiac - Filter by zodiac sign (e.g., "മെഷം", "Koç", "Aries")
 * @param {string} params.action - Filter by action/type (e.g., "ധനം", "പ്രണയം", "Para")
 * @param {string} params.arabic - Search Arabic text (e.g., "ا", "ب")
 * @param {string} params.category - Filter by category (DAYS, HOURS, LUNAR_MANSIONS, etc.)
 * @returns {Array} Matching rules with full data
 */
export function searchAstroClockKnowledge(params = {}) {
  const {
    query,
    day,
    hour,
    planet,
    mansion,
    zodiac,
    action,
    arabic,
    category
  } = params;

  if (!query && !day && !hour && !planet && !mansion && !zodiac && !action && !arabic && !category) {
    return ALL_KNOWLEDGE; // Return all if no filters
  }

  return ALL_KNOWLEDGE.filter(rule => {
    let matches = true;

    // Free text search (Turkish, Malayalam, Arabic)
    if (query) {
      const queryLower = query.toLowerCase();
      const searchText = [
        rule.original_text?.tr || '',
        rule.original_text?.rule || '',
        rule.malayalam?.title || '',
        rule.malayalam?.meaning || '',
        rule.malayalam?.explanation || '',
        JSON.stringify(rule.malayalam?.benefits || []),
        JSON.stringify(rule.original_text?.operations || [])
      ].join(' ').toLowerCase();
      
      matches = matches && searchText.includes(queryLower);
    }

    // Day filter
    if (day && matches) {
      const dayText = [
        rule.malayalam?.title || '',
        rule.original_text?.tr || ''
      ].join(' ').toLowerCase();
      const dayLower = day.toLowerCase();
      matches = matches && (dayText.includes(dayLower) || dayText.includes('ഞായറാഴ്ച') || dayText.includes('തിങ്കളാഴ്ച'));
    }

    // Hour filter
    if (hour && matches) {
      matches = matches && rule.id?.includes('hour');
    }

    // Planet filter
    if (planet && matches) {
      const planetText = [
        rule.malayalam?.title || '',
        rule.malayalam?.meaning || '',
        rule.original_text?.tr || ''
      ].join(' ').toLowerCase();
      const planetLower = planet.toLowerCase();
      matches = matches && planetText.includes(planetLower);
    }

    // Lunar mansion filter
    if (mansion && matches) {
      const mansionText = [
        rule.malayalam?.title || '',
        rule.original_text?.tr || ''
      ].join(' ').toLowerCase();
      const mansionLower = mansion.toLowerCase();
      matches = matches && mansionText.includes(mansionLower);
    }

    // Zodiac filter
    if (zodiac && matches) {
      const zodiacText = [
        rule.malayalam?.meaning || '',
        rule.original_text?.tr || ''
      ].join(' ').toLowerCase();
      const zodiacLower = zodiac.toLowerCase();
      matches = matches && zodiacText.includes(zodiacLower);
    }

    // Action filter
    if (action && matches) {
      const actionText = [
        JSON.stringify(rule.malayalam?.suitable_actions || ''),
        JSON.stringify(rule.malayalam?.benefits || []),
        JSON.stringify(rule.original_text?.operations || [])
      ].join(' ').toLowerCase();
      const actionLower = action.toLowerCase();
      matches = matches && actionText.includes(actionLower);
    }

    // Arabic text filter
    if (arabic && matches) {
      const arabicText = rule.original_text?.letter?.arabic || rule.original_text?.letter_arabic || '';
      matches = matches && arabicText.includes(arabic);
    }

    // Category filter
    if (category && matches) {
      matches = matches && rule.category === category;
    }

    return matches;
  });
}

/**
 * Get knowledge by ID
 * @param {string} id - Rule ID
 * @returns {Object|null} Matching rule or null
 */
export function getKnowledgeById(id) {
  return ALL_KNOWLEDGE.find(rule => rule.id === id) || null;
}

/**
 * Get all rules for a specific category
 * @param {string} category - Category name (DAYS, HOURS, LUNAR_MANSIONS, etc.)
 * @returns {Array} Rules in that category
 */
export function getKnowledgeByCategory(category) {
  return ALL_KNOWLEDGE.filter(rule => rule.category === category);
}

/**
 * Get all rules for a specific planet
 * @param {string} planet - Planet name (Turkish, English, or Malayalam)
 * @returns {Array} Rules related to that planet
 */
export function getKnowledgeByPlanet(planet) {
  const planetLower = planet.toLowerCase();
  return ALL_KNOWLEDGE.filter(rule => {
    const planetText = [
      rule.malayalam?.title || '',
      rule.malayalam?.meaning || '',
      rule.original_text?.tr || ''
    ].join(' ').toLowerCase();
    return planetText.includes(planetLower);
  });
}

/**
 * Get all rules for a specific day
 * @param {string} day - Day name (Turkish, English, or Malayalam)
 * @returns {Array} Rules for that day
 */
export function getKnowledgeByDay(day) {
  const dayLower = day.toLowerCase();
  return ALL_KNOWLEDGE.filter(rule => {
    const dayText = [
      rule.malayalam?.title || '',
      rule.original_text?.tr || ''
    ].join(' ').toLowerCase();
    return dayText.includes(dayLower);
  });
}

/**
 * Search by Arabic letter
 * @param {string} arabicLetter - Arabic letter (e.g., "ا", "ب")
 * @returns {Array} Rules containing that letter
 */
export function searchByArabicLetter(arabicLetter) {
  return ALL_KNOWLEDGE.filter(rule => {
    const arabicText = rule.original_text?.letter?.arabic || 
                       rule.original_text?.letter_arabic || 
                       rule.malayalam?.meaning || '';
    return arabicText.includes(arabicLetter);
  });
}

/**
 * Get searchable categories
 * @returns {Array} List of available categories
 */
export function getSearchableCategories() {
  const categories = new Set(ALL_KNOWLEDGE.map(rule => rule.category));
  return Array.from(categories);
}

/**
 * Get search statistics
 * @returns {Object} Statistics about the knowledge base
 */
export function getSearchStats() {
  return {
    totalRules: ALL_KNOWLEDGE.length,
    categories: getSearchableCategories(),
    daysCount: KNOWLEDGE_DAYS_ML.length,
    hoursCount: KNOWLEDGE_HOURS_ML.length,
    mansionsCount: KNOWLEDGE_LUNAR_MANSIONS_ML.length,
    timingRulesCount: KNOWLEDGE_TIMING_RULES_ML.length,
    asteroidRulesCount: ASTEROID_TIMING_RULES.length + ASTEROID_HOUSE_RULES.length + ASTEROID_ASPECT_RULES.length,
    knowledgeBaseGrowth: {
      original: KNOWLEDGE_DAYS_ML.length + KNOWLEDGE_HOURS_ML.length + KNOWLEDGE_LUNAR_MANSIONS_ML.length + KNOWLEDGE_TIMING_RULES_ML.length,
      asteroidAddition: ASTEROID_TIMING_RULES.length + ASTEROID_HOUSE_RULES.length + ASTEROID_ASPECT_RULES.length,
      total: ALL_KNOWLEDGE.length
    }
  };
}

/**
 * Advanced search with multiple filters
 * @param {Object} filters - Multiple filter criteria
 * @returns {Array} Filtered results
 */
export function advancedSearch(filters) {
  return searchAstroClockKnowledge(filters);
}
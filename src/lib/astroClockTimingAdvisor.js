// ═══════════════════════════════════════════════════
// ASTRO CLOCK TIMING ADVISOR ENGINE
// Provides timing advice based on stored knowledge
// Completely independent. No shared logic.
// ═══════════════════════════════════════════════════

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

// Combine all knowledge sources with safe fallbacks
const ALL_KNOWLEDGE = [
  ...(Array.isArray(KNOWLEDGE_DAYS_ML) ? KNOWLEDGE_DAYS_ML : []),
  ...(Array.isArray(KNOWLEDGE_HOURS_ML) ? KNOWLEDGE_HOURS_ML : []),
  ...(Array.isArray(KNOWLEDGE_LUNAR_MANSIONS_ML) ? KNOWLEDGE_LUNAR_MANSIONS_ML : []),
  ...(Array.isArray(KNOWLEDGE_TIMING_RULES_ML) ? KNOWLEDGE_TIMING_RULES_ML : []),
  ...(Array.isArray(ASTEROID_TIMING_RULES) ? ASTEROID_TIMING_RULES : []),
  ...(Array.isArray(ASTEROID_HOUSE_RULES) ? ASTEROID_HOUSE_RULES : []),
  ...(Array.isArray(ASTEROID_ASPECT_RULES) ? ASTEROID_ASPECT_RULES : [])
];

/**
 * Get timing advice for a specific action
 * @param {string} action - The action to get timing for
 * @returns {Object} Timing advice object
 */
export function getTimingAdvice(action) {
  if (!action || !action.trim()) {
    return {
      found: false,
      message: "Please enter an action to analyze",
      suggestions: null
    };
  }

  const actionLower = action.toLowerCase();
  
  // Search for matching rules
  const matchingRules = ALL_KNOWLEDGE.filter(rule => {
    const searchText = [
      rule.original_text?.tr || '',
      rule.original_text?.rule || '',
      rule.malayalam?.title || '',
      rule.malayalam?.meaning || '',
      rule.malayalam?.explanation || '',
      JSON.stringify(rule.malayalam?.benefits || []),
      JSON.stringify(rule.original_text?.operations || [])
    ].join(' ').toLowerCase();
    
    return searchText.includes(actionLower);
  });

  if (matchingRules.length === 0) {
    return {
      found: false,
      message: `No specific timing rules found for "${action}"`,
      suggestions: getGeneralSuggestions(action),
      totalRulesFound: 0
    };
  }

  // Analyze the matching rules
  const analysis = analyzeRules(matchingRules, action);
  
  return {
    found: true,
    action: action,
    totalRulesFound: matchingRules.length,
    ...analysis
  };
}

/**
 * Analyze rules and extract timing recommendations
 */
function analyzeRules(rules, action) {
  const bestDays = [];
  const bestPlanets = [];
  const bestHours = [];
  const bestMansions = [];
  const suitableConditions = [];
  const unsuitableConditions = [];
  const enemyDays = [];
  const enemyHours = [];
  const sources = [];
  const disagreements = [];

  (rules || []).forEach(rule => {
    // Extract day information
    if (rule.category === 'DAYS' && rule.malayalam?.suitable_actions?.toLowerCase().includes(action.toLowerCase())) {
      const dayName = rule.malayalam?.title || rule.original_text?.tr;
      if (dayName && !bestDays.find(d => d.name === dayName)) {
        bestDays.push({
          name: dayName,
          planet: rule.original_text?.ruling_planet,
          malayalamExplanation: rule.malayalam?.explanation,
          source: rule.source
        });
      }
    }

    // Extract planet information
    if (rule.category === 'HOURS' || rule.original_text?.ruling_planet) {
      const planet = rule.original_text?.ruling_planet || rule.malayalam?.title;
      if (planet && !bestPlanets.find(p => p.name === planet)) {
        bestPlanets.push({
          name: planet,
          malayalamExplanation: rule.malayalam?.explanation,
          source: rule.source
        });
      }
    }

    // Extract hour information
    if (rule.id?.includes('hour')) {
      const hour = rule.original_text?.hour || rule.malayalam?.title;
      if (hour && !bestHours.find(h => h.hour === hour)) {
        bestHours.push({
          hour: hour,
          planet: rule.original_text?.ruling_planet,
          malayalamExplanation: rule.malayalam?.explanation,
          source: rule.source
        });
      }
    }

    // Extract mansion information
    if (rule.category === 'LUNAR_MANSIONS') {
      const mansion = rule.original_text?.tr || rule.malayalam?.title;
      if (mansion && !bestMansions.find(m => m.name === mansion)) {
        bestMansions.push({
          name: mansion,
          malayalamExplanation: rule.malayalam?.explanation,
          source: rule.source
        });
      }
    }

    // Extract conditions
    if (rule.malayalam?.suitable_actions) {
      suitableConditions.push({
        condition: rule.malayalam.suitable_actions,
        source: rule.source
      });
    }

    if (rule.malayalam?.warnings) {
      unsuitableConditions.push({
        condition: rule.malayalam.warnings,
        source: rule.source
      });
    }

    // Collect sources
    if (rule.source && !sources.find(s => s.book === rule.source.book && s.page === rule.source.page)) {
      sources.push({
        book: rule.source.book,
        page: rule.source.page,
        originalText: rule.original_text?.tr || rule.original_text?.rule,
        malayalamTitle: rule.malayalam?.title,
        malayalamExplanation: rule.malayalam?.explanation
      });
    }
  });

  return {
    bestDays: bestDays.slice(0, 3),
    bestPlanets: bestPlanets.slice(0, 3),
    bestHours: bestHours.slice(0, 3),
    bestMansions: bestMansions.slice(0, 3),
    suitableConditions: suitableConditions.slice(0, 5),
    unsuitableConditions: unsuitableConditions.slice(0, 5),
    enemyDays: enemyDays,
    enemyHours: enemyHours,
    sources: sources,
    disagreements: disagreements
  };
}

/**
 * Get general suggestions when no specific rules found
 */
function getGeneralSuggestions(action) {
  return {
    suggestions: [
      {
        category: "General Advice",
        advice: "Consider consulting traditional astrological manuscripts for specific timing guidance.",
        source: "Traditional Wisdom"
      },
      {
        category: "Alternative Approach",
        advice: "Try searching for related actions or broader categories.",
        source: "Astro Clock Framework"
      }
    ]
  };
}

/**
 * Find similar actions for autocomplete
 */
export function findSimilarActions(partialAction) {
  if (!partialAction || partialAction.length < 2) return [];
  
  const actionLower = partialAction.toLowerCase();
  const allActions = new Set();
  
  (ALL_KNOWLEDGE || []).forEach(rule => {
    if (rule?.malayalam?.suitable_actions) {
      (rule.malayalam.suitable_actions || '').split(/[,,]/).forEach(action => {
        const trimmed = (action || '').trim().toLowerCase();
        if (trimmed && trimmed.includes(actionLower)) {
          allActions.add(action.trim());
        }
      });
    }
    
    if (rule?.original_text?.operations) {
      (rule.original_text.operations || []).forEach(op => {
        if (op && op.toLowerCase().includes(actionLower)) {
          allActions.add(op);
        }
      });
    }
  });
  
  return Array.from(allActions).slice(0, 10);
}

export const ASTRO_CLOCK_TIMING_ADVISOR_STATUS = {
  version: "1.0.0",
  initialized: true,
  knowledgeBaseSize: ALL_KNOWLEDGE.length,
  note: "Timing advisor engine ready - searching across all astrological knowledge"
};
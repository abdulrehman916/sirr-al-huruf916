/**
 * ASTRO CLOCK ACTION TIMING ADVISOR — MANUSCRIPT-ONLY (UNIFIED)
 * ─────────────────────────────────────────────────────────────────────────
 * SINGLE SHARED MANUSCRIPT RULE SOURCE. Both Astro Clock and Ritual Timing
 * import ACTION_RULES from here → backed by manuscriptRuleEngine.js
 * (Havâss'ın Derinlikleri). No Western, no AI-generated, no generic astrology.
 *
 * Fields NOT attested in the manuscripts (per-purpose bestDays, suitableMansions,
 * benefits, warnings) return empty arrays → UI shows "No data available" /
 * "NOT YET IMPLEMENTED" instead of invented content.
 */
import {
  SHARED_ACTION_RULES,
  NOT_YET_IMPLEMENTED,
  getManuscriptPlanetDisplay,
} from './manuscriptRuleEngine.js';

export const ACTION_RULES = SHARED_ACTION_RULES;

// ── Keyword → purpose category (for free-text action matching) ──
const PURPOSE_KEYWORDS = {
  marriage: ['marriage', 'wedding', 'engagement', 'proposal', 'വിവാഹം', 'നിശ്ചയം'],
  business: ['business', 'trade', 'commerce', 'buying', 'selling', 'വ്യാപാരം', 'കച്ചവടം'],
  travel: ['travel', 'journey', 'trip', 'voyage', 'യാത്ര'],
  healing: ['healing', 'health', 'treatment', 'cure', 'ആരോഗ്യം', 'ചികിത്സ'],
  job: ['job', 'career', 'employment', 'work', 'ഉദ്യോഗം', 'ജോലി'],
  love: ['love', 'romance', 'attraction', 'relationship', 'പ്രണയം', 'ആകർഷണം'],
  spiritual: ['spiritual', 'prayer', 'meditation', 'worship', 'ആദ്ധ്യാത്മിക', 'പ്രാർത്ഥന'],
  study: ['study', 'learning', 'education', 'പഠനം', 'വിദ്യാഭ്യാസം'],
};

function findMatchingCategory(actionLower) {
  for (const [category, words] of Object.entries(PURPOSE_KEYWORDS)) {
    if (words.some(w => actionLower.includes(w.toLowerCase()))) return category;
  }
  return null;
}

function planetDisplay(nameEn) {
  const d = getManuscriptPlanetDisplay(String(nameEn || '').toLowerCase());
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ACTION TIMING ADVICE — manuscript-only result
// Returns manuscript-derived suitable/unsuitable actions, Sa'd/Nahs nature,
// suitable & enemy planets, and source citations. Fields not attested in the
// manuscripts (bestDays, suitableMansions, benefits, warnings) are empty.
// ─────────────────────────────────────────────────────────────────────────────
export function getActionTimingAdvice(action, language = 'en') {
  if (!action || !action.trim()) {
    return {
      found: false,
      message: language === 'ml' ? "ദയവായി ഒരു പ്രവൃത്തി നൽകുക" : "Please enter an action to analyze",
    };
  }

  const actionLower = action.toLowerCase().trim();

  // Direct category match first
  let matchedCategory = null;
  for (const [category] of Object.entries(ACTION_RULES)) {
    if (actionLower.includes(category.toLowerCase())) { matchedCategory = category; break; }
  }
  // Keyword fallback
  if (!matchedCategory) matchedCategory = findMatchingCategory(actionLower);

  if (!matchedCategory) {
    return {
      found: false,
      message: NOT_YET_IMPLEMENTED,
      suggestions: { suggestions: [] },
    };
  }

  const r = ACTION_RULES[matchedCategory];
  if (!r || r.notImplemented) {
    return {
      found: false,
      message: NOT_YET_IMPLEMENTED,
      suggestions: { suggestions: [] },
    };
  }

  const lang = language === 'ml' ? 'ml' : 'en';
  const suitableDisplay = r.suitablePlanets.map(p => {
    const d = planetDisplay(p);
    return { name: lang === 'ml' ? d.name_ml : d.name_en, symbol: d.symbol };
  });
  const enemyDisplay = r.enemyPlanets.map(p => {
    const d = planetDisplay(p);
    return { name: lang === 'ml' ? d.name_ml : d.name_en, symbol: d.symbol };
  });
  const dayLabel = lang === 'ml' ? "ഇന്ന്" : "Today";

  return {
    found: true,
    action: r.category,
    category: matchedCategory,
    totalRulesFound: (r.sources || []).length,

    // ── Manuscript-derived ──
    rulingPlanet: r.rulingPlanet,
    nature: r.nature,
    nature_ml: r.nature_ml,
    suitableActions: (r.suitableActions && r.suitableActions[lang]) || [],
    unsuitableActions: (r.unsuitableActions && r.unsuitableActions[lang]) || [],
    suitablePlanets: suitableDisplay,
    enemyPlanets: enemyDisplay,
    // bestHours/worstHours derived from the manuscript suitable/enemy planets
    bestHours: suitableDisplay.map(p => ({ planet: p.name, symbol: p.symbol, day: dayLabel })),
    worstHours: enemyDisplay.map(p => ({ planet: p.name, symbol: p.symbol, day: dayLabel })),
    sources: r.sources || [],

    // ── NOT attested in the manuscripts per-purpose → NOT YET IMPLEMENTED ──
    bestDays: [],
    worstDays: [],
    suitableMansions: [],
    worstMansions: [],
    benefits: [],
    warnings: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FIND SIMILAR ACTIONS — autocomplete from manuscript categories
// ─────────────────────────────────────────────────────────────────────────────
export function findSimilarActions(partialAction, isMalayalam = false) {
  if (!partialAction || partialAction.length < 2) return [];
  const actionLower = partialAction.toLowerCase();
  const suggestions = [];
  for (const [category, r] of Object.entries(ACTION_RULES)) {
    const name = r.category || category;
    if (name.toLowerCase().includes(actionLower)) {
      suggestions.push({ category: name, keywords: [name], match: true });
    }
  }
  return suggestions.slice(0, 8);
}
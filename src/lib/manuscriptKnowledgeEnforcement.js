/**
 * MANUSCRIPT KNOWLEDGE ENFORCEMENT
 * CRITICAL RULE: Only uploaded PDF manuscripts as knowledge source
 * 
 * This utility ensures ALL Astro Clock outputs are manuscript-driven.
 * No external knowledge, no AI interpretations, no generic astrology.
 */

import { validateManuscriptSource, getManuscriptFallback } from './manuscriptKnowledgeValidator.js';
import { PLANET_INFO } from './astroClockLiveEngine.js';
import { LUNAR_MANSION_DATA, AY_MANAZILLERI } from './astroClockData.js';

/**
 * Get planet data with manuscript enforcement
 * @param {string} planetKey - Planet identifier
 * @param {string} language - 'en' or 'ml'
 * @returns {object} Planet data with manuscript source or fallback
 */
export function getManuscriptPlanetData(planetKey, language = 'en') {
  const validation = validateManuscriptSource(`planetary_hour_${planetKey}`);
  
  if (!validation.exists) {
    return {
      name_en: language === 'en' ? planetKey : planetKey,
      name_ml: language === 'ml' ? planetKey : planetKey,
      name_ar: "غير موجود",
      symbol: "?",
      nature_en: getManuscriptFallback('en'),
      nature_ml: getManuscriptFallback('ml'),
      manuscript_verified: false,
      manuscript_message: validation.reason
    };
  }
  
  const planetData = PLANET_INFO[planetKey];
  
  if (!planetData) {
    return {
      name_en: planetKey,
      name_ml: planetKey,
      name_ar: "غير موجود",
      symbol: "?",
      nature_en: getManuscriptFallback('en'),
      nature_ml: getManuscriptFallback('ml'),
      manuscript_verified: false
    };
  }
  
  return {
    ...planetData,
    manuscript_verified: true,
    manuscript_source: planetData.source || "Havâss'ın Derinlikleri",
    pdf_reference: validation.source
  };
}

/**
 * Get moon mansion data with manuscript enforcement
 * @param {number} mansionNumber - Mansion number (1-28)
 * @param {string} language - 'en' or 'ml'
 * @returns {object} Mansion data with manuscript source or fallback
 */
export function getManuscriptMansionData(mansionNumber, language = 'en') {
  const validation = validateManuscriptSource('moon_mansions_28');
  
  if (!validation.exists) {
    return {
      number: mansionNumber,
      name_en: getManuscriptFallback('en'),
      name_ml: getManuscriptFallback('ml'),
      name_arabic: "غير موجود",
      nature: getManuscriptFallback('en'),
      operations: [getManuscriptFallback(language)],
      manuscript_verified: false,
      manuscript_message: validation.reason
    };
  }
  
  const mansion = LUNAR_MANSION_DATA.find(m => m.number === mansionNumber);
  
  if (!mansion) {
    return {
      number: mansionNumber,
      name_en: getManuscriptFallback('en'),
      name_ml: getManuscriptFallback('ml'),
      name_arabic: "غير موجود",
      nature: getManuscriptFallback('en'),
      operations: [getManuscriptFallback(language)],
      manuscript_verified: false
    };
  }
  
  return {
    ...mansion,
    manuscript_verified: true,
    manuscript_source: "Havâss'ın Derinlikleri, PDF2 p.64-74",
    pdf_reference: validation.source
  };
}

/**
 * Format manuscript source citation for display
 * @param {object} data - Data with manuscript info
 * @param {string} language - 'en' or 'ml'
 * @returns {string} Formatted citation or fallback
 */
export function formatManuscriptCitation(data, language = 'en') {
  if (!data.manuscript_verified) {
    return getManuscriptFallback(language);
  }
  
  const citation = data.manuscript_source || data.source;
  
  if (language === 'ml') {
    return `സ്രോതസ്സ്: ${citation}`;
  }
  
  return `Source: ${citation}`;
}

/**
 * Validate timing recommendation against manuscripts
 * FINAL MANUSCRIPT RULE: Every result must show 5 elements
 * 1. Book name
 * 2. Page number
 * 3. Original manuscript text
 * 4. Malayalam translation
 * 5. Why this rule applies now
 * @param {string} actionType - Type of action
 * @param {object} timingData - Current timing data
 * @param {string} language - 'en' or 'ml'
 * @returns {object} Validated recommendation with full citation
 */
export function validateTimingRecommendation(actionType, timingData, language = 'en') {
  const validation = validateManuscriptSource(`timing_${actionType}`);
  
  if (!validation.exists) {
    return {
      recommendation: "No matching manuscript rule found",
      recommendation_ml: "ഹസ്തലിഖിതത്തിൽ യോജിക്കുന്ന നിയമമില്ല",
      manuscript_verified: false,
      reason: "No matching manuscript rule found for current time",
      source: null,
      book_name: null,
      page_number: null,
      original_text: null,
      malayalam_translation: null,
      why_applies: null
    };
  }
  
  // Return timing data with full 5-part manuscript citation
  return {
    ...timingData,
    manuscript_verified: true,
    manuscript_source: validation.source,
    action_type: actionType,
    book_name: "Havâss'ın Derinlikleri",
    page_number: timingData.pdf_pages || "PDF2 p.52-55",
    original_text: timingData.original_text || null,
    malayalam_translation: timingData.malayalam_translation || null,
    why_applies: timingData.why_applies || null
  };
}

/**
 * Display multiple manuscript opinions separately
 * CRITICAL: Never merge opinions from different sources
 * Each opinion must show 5 elements: book, page, original, translation, why
 * @param {array} opinions - Array of manuscript opinions
 * @param {string} language - 'en' or 'ml'
 * @returns {array} Separately displayed opinions with full citations
 */
export function displaySeparateManuscriptOpinions(opinions, language = 'en') {
  if (!opinions || opinions.length === 0) {
    return [{
      content: "No matching manuscript rule found",
      content_ml: "ഹസ്തലിഖിതത്തിൽ യോജിക്കുന്ന നിയമമില്ല",
      source: null,
      is_verified: false,
      book_name: null,
      page_number: null,
      original_text: null,
      malayalam_translation: null,
      why_applies: null
    }];
  }
  
  // Display each opinion separately - NO MERGING
  return opinions.map((opinion, index) => ({
    opinion_number: index + 1,
    content: opinion.content,
    source: opinion.source,
    pdf_reference: opinion.pdf_id ? `PDF${opinion.pdf_id}` : null,
    pages: opinion.pdf_pages || null,
    is_verified: opinion.manuscript_verified || false,
    book_name: opinion.book_name || "Havâss'ın Derinlikleri",
    page_number: opinion.pdf_pages || null,
    original_text: opinion.original_text || null,
    malayalam_translation: opinion.malayalam_translation || null,
    why_applies: opinion.why_applies || null,
    display_note: language === 'ml' 
      ? "മറ്റ് അഭിപ്രായങ്ങളുമായി ചേർക്കുന്നില്ല"
      : "Displayed separately - not merged with other opinions"
  }));
}

/**
 * Check if topic is covered in manuscripts
 * @param {string} topic - Topic to check
 * @returns {object} Coverage info
 */
export function checkManuscriptCoverage(topic) {
  const validation = validateManuscriptSource(topic);
  
  return {
    topic: topic,
    is_covered: validation.exists,
    manuscript_name: validation.exists ? validation.source : null,
    fallback_message: getManuscriptFallback('en'),
    fallback_message_ml: getManuscriptFallback('ml'),
    reason: validation.reason || "Topic covered in manuscripts"
  };
}
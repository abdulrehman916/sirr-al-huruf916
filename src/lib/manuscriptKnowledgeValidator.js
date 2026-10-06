/**
 * MANUSCRIPT KNOWLEDGE VALIDATOR
 * Enforces CRITICAL RULE: Only uploaded PDF manuscripts as knowledge source
 * 
 * DO NOT USE:
 * - Generic astrology
 * - Western astrology  
 * - Vedic astrology
 * - Internet sources
 * - AI-generated interpretations
 * - External databases
 * 
 * For every output, must include:
 * - PDF name
 * - Page number
 * - Exact source reference
 * 
 * If not found in PDFs: Display "Not found in uploaded manuscripts"
 */

// Imports
import { PLANETARY_HOUR_RULES } from './astroClockPlanetaryHourRules.js';
import { AY_MANAZILLERI } from './astroClockData.js';

// Manuscript metadata
export const MANUSCRIPT_SOURCES = {
  primary: {
    name: "Havâss'ın Derinlikleri",
    author: "Bülent Kısa",
    kitap_no: "I. Kitap",
    written: "1974-2004, Istanbul",
    pdf_files: [
      { 
        name: "53f63f71d_36657425-Bulent-Ksa-Havassin-Derinlikleri-1-50.pdf",
        pages: "1-50",
        id: "PDF1"
      },
      { 
        name: "46d55e7d9_36657425-Bulent-Ksa-Havassin-Derinlikleri-51-100.pdf",
        pages: "51-100",
        id: "PDF2"
      }
    ]
  }
};

// Knowledge categories explicitly covered in manuscripts
export const MANUSCRIPT_COVERAGE = {
  covered: [
    "planetary_day_rulers",
    "planetary_hour_sequence",
    "planetary_hour_calculation",
    "moon_mansions_28",
    "moon_mansion_operations",
    "moon_mansion_letters",
    "letter_element_classification",
    "letter_nature_classification",
    "ebced_tables",
    "bast_methods",
    "istintak_methods",
    "mecz_method",
    "teksir_method",
    "harf_dereceleri",
    "havass_preparation_rules",
    "day_ruler_operations",
    "planetary_hour_suitable_actions",
    "planetary_hour_unsuitable_actions"
  ],
  not_covered: [
    "western_zodiac_interpretations",
    "vedic_nakshatra_rulers",
    "modern_psychological_astrology",
    "compatibility_synastry",
    "transit_interpretations",
    "progression_methods",
    "solar_return_analysis",
    "generalized_horoscope_predictions"
  ]
};

/**
 * Validate if knowledge exists in manuscripts
 * @param {string} topic - Topic to check
 * @returns {object} - { exists: boolean, source?: string, page?: string }
 */
export function validateManuscriptSource(topic) {
  const topicKey = topic.toLowerCase().replace(/\s+/g, '_');
  
  // Check if topic is in covered list
  const isCovered = MANUSCRIPT_COVERAGE.covered.some(
    covered => covered.includes(topicKey) || topicKey.includes(covered)
  );
  
  // Check if topic is in not-covered list
  const isExcluded = MANUSCRIPT_COVERAGE.not_covered.some(
    excluded => excluded.includes(topicKey) || topicKey.includes(excluded)
  );
  
  if (isExcluded) {
    return {
      exists: false,
      message: "Not found in uploaded manuscripts",
      reason: "This topic is not covered in the uploaded PDF sources"
    };
  }
  
  if (isCovered) {
    return {
      exists: true,
      source: MANUSCRIPT_SOURCES.primary.name,
      author: MANUSCRIPT_SOURCES.primary.author,
      pdf_reference: MANUSCRIPT_SOURCES.primary.pdf_files
    };
  }
  
  // Unknown topic - require explicit verification
  return {
    exists: false,
    message: "Not found in uploaded manuscripts",
    reason: "Topic requires explicit manuscript source verification"
  };
}

/**
 * Format source citation for display
 * @param {string} pdf_id - PDF1 or PDF2
 * @param {string} pages - Page range
 * @param {string} topic - Topic name
 * @returns {string} Formatted citation
 */
export function formatSourceCitation(pdf_id, pages, topic) {
  const pdf = MANUSCRIPT_SOURCES.primary.pdf_files.find(f => f.id === pdf_id);
  
  if (!pdf) {
    return `Source: ${MANUSCRIPT_SOURCES.primary.name} — Pages ${pages}`;
  }
  
  return `Source: ${MANUSCRIPT_SOURCES.primary.name} (${pdf.name}), ${MANUSCRIPT_SOURCES.primary.author}, ${MANUSCRIPT_SOURCES.primary.kitap_no}, Pages ${pages}`;
}

/**
 * Get manuscript fallback message
 * @param {string} language - 'en' or 'ml'
 * @returns {string} Fallback message
 */
export function getManuscriptFallback(language = 'en') {
  if (language === 'ml') {
    return "അപ്‌ലോഡ് ചെയ്ത ഹസ്തലിഖിതങ്ങളിൽ കാണുന്നില്ല";
  }
  return "Not found in uploaded manuscripts";
}

/**
 * Validate and format knowledge output
 * @param {object} data - Knowledge data to validate
 * @param {string} source_pdf - PDF identifier
 * @param {string} source_pages - Page range
 * @param {string} language - 'en' or 'ml'
 * @returns {object} Validated output with source citation
 */
export function validateKnowledgeOutput(data, source_pdf, source_pages, language = 'en') {
  const validation = validateManuscriptSource(data.topic || 'unknown');
  
  if (!validation.exists) {
    return {
      content: getManuscriptFallback(language),
      source: null,
      is_manuscript_verified: false,
      validation_message: validation.reason
    };
  }
  
  return {
    content: data.content,
    source: formatSourceCitation(source_pdf, source_pages, data.topic),
    pdf_id: source_pdf,
    pages: source_pages,
    is_manuscript_verified: true,
    manuscript_name: MANUSCRIPT_SOURCES.primary.name,
    author: MANUSCRIPT_SOURCES.primary.author
  };
}

/**
 * Check if multiple manuscript opinions exist for a topic
 * @param {string} topic - Topic to check
 * @returns {boolean} True if multiple sources exist
 */
export function hasMultipleManuscriptOpinions(topic) {
  // Currently only one primary manuscript source
  // Future: Add logic to check if multiple PDFs cover same topic
  return false;
}

/**
 * Display all manuscript opinions separately (no merging)
 * @param {array} opinions - Array of manuscript opinions
 * @param {string} language - 'en' or 'ml'
 * @returns {array} Formatted opinions with sources
 */
export function displayMultipleOpinions(opinions, language = 'en') {
  if (!opinions || opinions.length === 0) {
    return [{
      content: getManuscriptFallback(language),
      source: null
    }];
  }
  
  // Display each opinion separately - DO NOT MERGE
  return opinions.map(opinion => ({
    content: opinion.content,
    source: opinion.source,
    pdf_id: opinion.pdf_id,
    pages: opinion.pages,
    manuscript_name: MANUSCRIPT_SOURCES.primary.name
  }));
}

/**
 * Enforce manuscript-only rule for planetary hour data
 * @param {string} planet - Planet name
 * @param {string} data_type - 'nature', 'suitableActions', 'unsuitableActions', etc.
 * @returns {object} Validated data with source
 */
export function getPlanetaryHourData(planet, data_type, language = 'en') {
  const planetData = PLANETARY_HOUR_RULES[planet.toLowerCase()];
  
  if (!planetData) {
    return {
      content: getManuscriptFallback(language),
      is_manuscript_verified: false
    };
  }
  
  const data = planetData[data_type];
  
  if (!data) {
    return {
      content: getManuscriptFallback(language),
      is_manuscript_verified: false
    };
  }
  
  return {
    content: data,
    source: planetData.source,
    pdf_notes: planetData.pdfNotes,
    is_manuscript_verified: true,
    manuscript_name: MANUSCRIPT_SOURCES.primary.name,
    author: MANUSCRIPT_SOURCES.primary.author
  };
}

/**
 * Enforce manuscript-only rule for moon mansion data
 * @param {number} mansion_number - 1-28
 * @param {string} data_type - 'operations', 'nature', 'letter', etc.
 * @returns {object} Validated data with source
 */
export function getMoonMansionData(mansion_number, data_type, language = 'en') {
  const mansion = AY_MANAZILLERI.find(m => m.no === mansion_number);
  
  if (!mansion) {
    return {
      content: getManuscriptFallback(language),
      is_manuscript_verified: false
    };
  }
  
  const data = mansion[data_type];
  
  if (!data) {
    return {
      content: getManuscriptFallback(language),
      is_manuscript_verified: false
    };
  }
  
  return {
    content: data,
    source: "Havâss'ın Derinlikleri, PDF2 p.64-74",
    is_manuscript_verified: true,
    manuscript_name: MANUSCRIPT_SOURCES.primary.name,
    author: MANUSCRIPT_SOURCES.primary.author,
    mansion_name: mansion.name,
    mansion_number: mansion.no
  };
}

// Default export
export default {
  validateManuscriptSource,
  formatSourceCitation,
  getManuscriptFallback,
  validateKnowledgeOutput,
  hasMultipleManuscriptOpinions,
  displayMultipleOpinions,
  getPlanetaryHourData,
  getMoonMansionData,
  MANUSCRIPT_SOURCES,
  MANUSCRIPT_COVERAGE
};
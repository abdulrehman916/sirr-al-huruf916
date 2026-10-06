// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK — BIRTH PROFILE CALCULATIONS
// Calculate zodiac sign, element, gender, and planetary rulers from birth data
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { ZODIAC_SIGNS, getZodiacByDate } from './astroClockZodiacData.js';
import { PLANET_INFO } from './astroClockLiveEngine.js';

// ─────────────────────────────────────────────────────────────────────────────
// ZODIAC ELEMENT PROPERTIES
// ─────────────────────────────────────────────────────────────────────────────
export const ELEMENT_PROPERTIES = {
  Fire: {
    name_en: "Fire",
    name_ml: "അഗ്നി",
    name_ar: "نار",
    qualities: ["Passionate", "Dynamic", "Energetic", "Impulsive"],
    qualities_ml: ["ഉത്സാഹമുള്ള", "ചുറുചുറുക്കുള്ള", "ഊർജ്ജസ്വലൻ", "പെട്ടെന്ന് പ്രവർത്തിക്കുന്ന"],
    direction: "South",
    direction_ml: "തെക്ക്",
    direction_ar: "جنوب",
    compatible_elements: ["Fire", "Air"],
    incompatible_elements: ["Water", "Earth"]
  },
  Earth: {
    name_en: "Earth",
    name_ml: "ഭൂമി",
    name_ar: "أرض",
    qualities: ["Practical", "Stable", "Reliable", "Patient"],
    qualities_ml: ["പ്രായോഗിക", "സ്ഥിരതയുള്ള", "വിശ്വസ്ത", "ക്ഷമയുള്ള"],
    direction: "North",
    direction_ml: "വടക്ക്",
    direction_ar: "شمال",
    compatible_elements: ["Earth", "Water"],
    incompatible_elements: ["Air", "Fire"]
  },
  Air: {
    name_en: "Air",
    name_ml: "വായു",
    name_ar: "هواء",
    qualities: ["Intellectual", "Communicative", "Social", "Adaptable"],
    qualities_ml: ["ബൗദ്ധിക", "ആശയവിനിമയം നടത്തുന്ന", "സാമൂഹിക", "പൊരുത്തപ്പെടുന്ന"],
    direction: "East",
    direction_ml: "കിഴക്ക്",
    direction_ar: "شرق",
    compatible_elements: ["Air", "Fire"],
    incompatible_elements: ["Earth", "Water"]
  },
  Water: {
    name_en: "Water",
    name_ml: "വെള്ളം",
    name_ar: "ماء",
    qualities: ["Emotional", "Intuitive", "Sensitive", "Nurturing"],
    qualities_ml: ["വികാരപര", "അന്തർജ്ഞാനമുള്ള", "സംവേദനക്ഷമ", "പോഷണം നൽകുന്ന"],
    direction: "West",
    direction_ml: "പടിഞ്ഞാറ്",
    direction_ar: "غرب",
    compatible_elements: ["Water", "Earth"],
    incompatible_elements: ["Fire", "Air"]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PLANET RELATIONSHIPS
// ─────────────────────────────────────────────────────────────────────────────
export const PLANET_RELATIONSHIPS = {
  sun: {
    friendly: ["moon", "mars", "jupiter"],
    enemy: ["saturn", "venus"],
    neutral: ["mercury"]
  },
  moon: {
    friendly: ["sun", "mercury", "venus"],
    enemy: ["saturn"],
    neutral: ["mars", "jupiter"]
  },
  mars: {
    friendly: ["sun", "moon", "jupiter"],
    enemy: ["mercury"],
    neutral: ["venus", "saturn"]
  },
  mercury: {
    friendly: ["sun", "venus", "moon"],
    enemy: ["mars", "jupiter"],
    neutral: ["saturn"]
  },
  jupiter: {
    friendly: ["sun", "moon", "mars"],
    enemy: ["mercury", "venus"],
    neutral: ["saturn"]
  },
  venus: {
    friendly: ["mercury", "moon", "saturn"],
    enemy: ["sun", "jupiter"],
    neutral: ["mars"]
  },
  saturn: {
    friendly: ["mercury", "venus"],
    enemy: ["sun", "moon", "mars"],
    neutral: ["jupiter"]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATE BIRTH PROFILE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Calculate complete birth profile from birth data
 * @param {Date} birthDate - Date of birth
 * @param {string} birthTime - Time of birth (HH:MM format, optional)
 * @param {string} birthPlace - City/country of birth
 * @returns {Object} Complete birth profile
 */
export function calculateBirthProfile(birthDate, birthTime = null, birthPlace = "Unknown") {
  const date = new Date(birthDate);
  const zodiacSign = getZodiacByDate(date);
  
  if (!zodiacSign) {
    return null;
  }

  const rulingPlanet = PLANET_INFO[zodiacSign.ruling_planet.toLowerCase()] || null;
  const elementData = ELEMENT_PROPERTIES[zodiacSign.element] || null;

  return {
    zodiacSign: {
      key: zodiacSign.key,
      name_en: zodiacSign.name_en,
      name_ml: zodiacSign.name_ml,
      name_ar: zodiacSign.name_ar,
      symbol: zodiacSign.symbol,
      dateRange: zodiacSign.date_range,
      dateRangeMl: zodiacSign.date_range_ml
    },
    rulingPlanet: rulingPlanet ? {
      key: zodiacSign.ruling_planet.toLowerCase(),
      name_en: rulingPlanet.name_en,
      name_ml: rulingPlanet.name_ml,
      symbol: rulingPlanet.symbol,
      nature_en: rulingPlanet.nature_en,
      nature_ml: rulingPlanet.nature_ml,
      benefits_en: rulingPlanet.benefits_en,
      benefits_ml: rulingPlanet.benefits_ml,
      spiritualOperations_en: rulingPlanet.spiritualOperations_en,
      spiritualOperations_ml: rulingPlanet.spiritualOperations_ml
    } : null,
    element: elementData ? {
      name_en: elementData.name_en,
      name_ml: elementData.name_ml,
      name_ar: elementData.name_ar,
      qualities_en: elementData.qualities,
      qualities_ml: elementData.qualities_ml,
      direction_en: elementData.direction,
      direction_ml: elementData.direction_ml,
      direction_ar: elementData.direction_ar,
      compatible_en: elementData.compatible_elements,
      compatible_ml: elementData.compatible_elements.map(e => ELEMENT_PROPERTIES[e]?.name_ml || e),
      incompatible_en: elementData.incompatible_elements,
      incompatible_ml: elementData.incompatible_elements.map(e => ELEMENT_PROPERTIES[e]?.name_ml || e)
    } : null,
    gender: {
      en: zodiacSign.gender,
      ml: zodiacSign.gender_ml,
      ar: zodiacSign.gender_ar
    },
    metal: {
      en: zodiacSign.metal,
      ml: zodiacSign.metal_ml,
      ar: zodiacSign.metal_ar
    },
    incense: {
      en: zodiacSign.incense,
      ml: zodiacSign.incense_ml,
      ar: zodiacSign.incense_ar
    },
    relationships: {
      friendlySigns_en: zodiacSign.friendly_signs,
      friendlySigns_ml: zodiacSign.friendly_signs.map(s => {
        const sign = ZODIAC_SIGNS[s.toLowerCase()];
        return sign ? sign.name_ml : s;
      }),
      enemySigns_en: zodiacSign.enemy_signs,
      enemySigns_ml: zodiacSign.enemy_signs.map(s => {
        const sign = ZODIAC_SIGNS[s.toLowerCase()];
        return sign ? sign.name_ml : s;
      }),
      friendlyPlanets_en: getFriendlyPlanets(zodiacSign.ruling_planet.toLowerCase()),
      friendlyPlanets_ml: getFriendlyPlanets(zodiacSign.ruling_planet.toLowerCase()).map(p => {
        const planet = PLANET_INFO[p.toLowerCase()];
        return planet ? planet.name_ml : p;
      }),
      enemyPlanets_en: getEnemyPlanets(zodiacSign.ruling_planet.toLowerCase()),
      enemyPlanets_ml: getEnemyPlanets(zodiacSign.ruling_planet.toLowerCase()).map(p => {
        const planet = PLANET_INFO[p.toLowerCase()];
        return planet ? planet.name_ml : p;
      })
    },
    spiritualMeaning: {
      en: zodiacSign.spiritual_meaning_en,
      ml: zodiacSign.spiritual_meaning_ml
    },
    birthData: {
      date: birthDate,
      time: birthTime,
      place: birthPlace
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET FRIENDLY PLANETS
// ─────────────────────────────────────────────────────────────────────────────
export function getFriendlyPlanets(planetKey) {
  const relationships = PLANET_RELATIONSHIPS[planetKey.toLowerCase()];
  if (!relationships) return [];
  return relationships.friendly || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ENEMY PLANETS
// ─────────────────────────────────────────────────────────────────────────────
export function getEnemyPlanets(planetKey) {
  const relationships = PLANET_RELATIONSHIPS[planetKey.toLowerCase()];
  if (!relationships) return [];
  return relationships.enemy || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPATIBILITY ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Compare birth sign with current planetary hour
 * @param {Object} birthProfile - Calculated birth profile
 * @param {Object} currentHour - Current planetary hour data
 * @returns {Object} Compatibility analysis
 */
export function analyzeCompatibility(birthProfile, currentHour) {
  if (!birthProfile || !currentHour) {
    return { status: "unknown", score: 0, analysis_en: "Unable to calculate", analysis_ml: "കണക്കാക്കാൻ കഴിഞ്ഞില്ല" };
  }

  const birthPlanet = birthProfile.rulingPlanet?.key;
  const currentPlanet = currentHour.planet;
  const birthElement = birthProfile.element?.name_en;

  let score = 50; // Neutral baseline
  let status = "neutral";
  let reasons_en = [];
  let reasons_ml = [];

  // Check planetary friendship
  if (birthPlanet && currentPlanet) {
    const friendlyPlanets = getFriendlyPlanets(birthPlanet);
    const enemyPlanets = getEnemyPlanets(birthPlanet);

    if (friendlyPlanets.includes(currentPlanet)) {
      score += 25;
      reasons_en.push("Current hour ruler is friendly to your birth planet");
      reasons_ml.push("നിലവിലെ മണിക്കൂർ നാഥൻ നിങ്ങളുടെ ജനന ഗ്രഹത്തിന് അനുയോജ്യമാണ്");
    } else if (enemyPlanets.includes(currentPlanet)) {
      score -= 25;
      reasons_en.push("Current hour ruler is enemy to your birth planet");
      reasons_ml.push("നിലവിലെ മണിക്കൂർ നാഥൻ നിങ്ങളുടെ ജനന ഗ്രഹത്തിന് എതിരാണ്");
    }
  }

  // Check if current hour matches birth planet
  if (birthPlanet && currentPlanet === birthPlanet) {
    score += 20;
    reasons_en.push("This is your birth planet's hour - highly favorable");
    reasons_ml.push("ഇത് നിങ്ങളുടെ ജനന ഗ്രഹത്തിന്റെ മണിക്കൂറാണ് - വളരെ അനുയോജ്യം");
  }

  // Determine status
  if (score >= 70) {
    status = "favorable";
  } else if (score <= 40) {
    status = "unfavorable";
  }

  return {
    status,
    score,
    reasons_en,
    reasons_ml,
    recommendation_en: getStatusRecommendation(status, "en"),
    recommendation_ml: getStatusRecommendation(status, "ml")
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET STATUS RECOMMENDATION
// ─────────────────────────────────────────────────────────────────────────────
function getStatusRecommendation(status, lang) {
  const recommendations = {
    favorable: {
      en: "Excellent time for important activities. Proceed with confidence.",
      ml: "പ്രധാന പ്രവർത്തനങ്ങൾക്ക് മികച്ച സമയം. ആത്മവിശ്വാസത്തോടെ മുന്നോട്ട് പോകുക."
    },
    neutral: {
      en: "Moderate time. Suitable for routine activities. Avoid major decisions.",
      ml: "സാധാരണ സമയം. ദിനചര്യ പ്രവർത്തനങ്ങൾക്ക് അനുയോജ്യം. പ്രധാന തീരുമാനങ്ങൾ ഒഴിവാക്കുക."
    },
    unfavorable: {
      en: "Challenging time. Focus on spiritual practices and patience. Avoid new ventures.",
      ml: "വെല്ലുവിളി നിറഞ്ഞ സമയം. ആത്മിക പ്രവർത്തനങ്ങളിലും ക്ഷമയിലും ശ്രദ്ധ കേന്ദ്രീകരിക്കുക. പുതിയ സംരംഭങ്ങൾ ഒഴിവാക്കുക."
    }
  };

  return recommendations[status]?.[lang] || recommendations.neutral[lang];
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE STATUS
// ─────────────────────────────────────────────────────────────────────────────
export const BIRTH_PROFILE_STATUS = {
  version: "1.0.0",
  initialized: true,
  features: [
    "Zodiac sign calculation from birth date",
    "Element and gender analysis",
    "Planetary ruler identification",
    "Friendly/enemy sign relationships",
    "Friendly/enemy planet relationships",
    "Incense recommendations",
    "Metal associations",
    "Compatibility analysis with current time",
    "Bilingual support (Malayalam/English)"
  ],
  note: "Birth Profile Analyzer ready — calculates complete astrological profile from birth data"
};
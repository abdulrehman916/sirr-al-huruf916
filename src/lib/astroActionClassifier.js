// ═══════════════════════════════════════════════════════════════
// ASTRO ACTION CLASSIFIER
// Canonical action categories for semantic search.
//
// Maps user input (any language) to a canonical category.
// Customers never see this mapping — they only see the final
// recommendation. Admin can extend by adding entries below.
//
// ISOLATED — does NOT modify PURPOSE_MAP, timing engine, OCR,
// ingestion, schema, routing, or any existing module.
// ═══════════════════════════════════════════════════════════════
import { NEW_CONCEPT_CATEGORIES, resolveConcept } from "./semanticConceptResolver";

// ── Canonical Action Categories (extensible) ──
export const ACTION_CATEGORIES = {
  construction: {
    label: { ml: "നിർമ്മാണം", en: "Construction", ar: "بناء" },
    synonyms: {
      ml: ["കുട്ടിയടിക്കൽ", "തറയിടൽ", "വീട് പണിയൽ", "വീടിന് തറയിടൽ", "നിർമ്മാണം", "കെട്ടിടം", "കെട്ടിടനിർമ്മാണം", "അസ്തിത്വം"],
      en: ["construction", "building", "foundation", "house construction", "laying foundation", "building house", "masonry"],
      ar: ["بناء", "أساس", "بناء دار", "بناء بيت"],
    },
    preferredPlanets: ["saturn"],
    preferredDays: ["sat"],
    avoidPlanets: ["mars"],
  },
  travel: {
    label: { ml: "യാത്ര", en: "Travel", ar: "سفر" },
    synonyms: {
      ml: ["യാത്ര", "വിദേശ യാത്ര", "കടൽ യാത്ര", "വിമാന യാത്ര", "പ്രയാണം", "പ്രയാണം ചെയ്യൽ"],
      en: ["travel", "journey", "trip", "voyage", "flight", "sea travel", "travel abroad", "departure"],
      ar: ["سفر", "رحلة", "سفر بحري", "سفر جوي"],
    },
    preferredPlanets: ["moon", "mercury"],
    preferredDays: ["mon", "wed"],
    avoidPlanets: ["saturn"],
  },
  marriage: {
    label: { ml: "വിവാഹം", en: "Marriage", ar: "زواج" },
    synonyms: {
      ml: ["വിവാഹം", "നിക്കാഹ്", "കല്യാണം", "ദാമ്പത്യം", "വിവാഹ", "വിവാഹബന്ധം"],
      en: ["marriage", "wedding", "union", "matrimony", "nikah", "nuptial"],
      ar: ["زواج", "نكاح", "عرس"],
    },
    preferredPlanets: ["jupiter", "venus"],
    preferredDays: ["thu", "fri"],
    avoidPlanets: ["saturn", "mars"],
  },
  business: {
    label: { ml: "വ്യാപാരം", en: "Business", ar: "تجارة" },
    synonyms: {
      ml: ["കച്ചവടം", "കട തുടങ്ങൽ", "വ്യാപാരം", "വാണിജ്യം", "പണം", "വ്യാപാരത്തിന്"],
      en: ["business", "trade", "commerce", "shop", "partnership", "start business", "merchant", "deal"],
      ar: ["تجارة", "بيع", "شراء", "متجر"],
    },
    preferredPlanets: ["mercury", "jupiter"],
    preferredDays: ["wed", "thu"],
    avoidPlanets: ["saturn"],
  },
  agriculture: {
    label: { ml: "കൃഷി", en: "Agriculture", ar: "زراعة" },
    synonyms: {
      ml: ["വിത്തിടൽ", "കൃഷി", "നടീൽ", "വിള", "കൃഷിഭൂമി", "കൃഷിചെയ്യൽ", "കാർഷികം"],
      en: ["agriculture", "farming", "planting", "sowing", "harvest", "cultivation", "crops", "gardening"],
      ar: ["زراعة", "بذر", "حرث", "حصاد"],
    },
    preferredPlanets: ["moon", "venus"],
    preferredDays: ["mon", "fri"],
    avoidPlanets: ["mars", "saturn"],
  },
  medical: {
    label: { ml: "ചികിത്സ", en: "Medical", ar: "علاج" },
    synonyms: {
      ml: ["ശസ്ത്രക്രിയ", "ചികിത്സ", "മരുന്ന് തുടങ്ങൽ", "വൈദ്യം", "ആരോഗ്യം", "രോഗശമനം", "ചികിത്സ തുടങ്ങൽ"],
      en: ["surgery", "treatment", "medicine", "healing", "health", "cure", "medical", "remedy", "physician"],
      ar: ["علاج", "طب", "شفا", "دواء", "طبابة"],
    },
    preferredPlanets: ["sun", "moon"],
    preferredDays: ["sun", "mon"],
    avoidPlanets: ["saturn", "mars"],
  },
  love: {
    label: { ml: "പ്രണയം", en: "Love", ar: "محبة" },
    synonyms: {
      ml: ["പ്രണയം", "പ്രേമം", "ആകർഷണം", "മഹബ്ബ", "അനുരാഗം", "പ്രീതി"],
      en: ["love", "romance", "attraction", "affection", "muhabbah", "charm"],
      ar: ["محبة", "حب", "جذب", "ود"],
    },
    preferredPlanets: ["venus"],
    preferredDays: ["fri"],
    avoidPlanets: ["saturn"],
  },
  protection: {
    label: { ml: "സംരക്ഷണം", en: "Protection", ar: "حماية" },
    synonyms: {
      ml: ["സംരക്ഷണം", "പ്രതിരോധം", "കാവൽ", "രക്ഷ", "സുരക്ഷ", "കാക്കൽ"],
      en: ["protection", "defense", "shield", "guard", "safety", "ward off evil", "amulet"],
      ar: ["حماية", "وقاية", "دفع", "حرس"],
    },
    preferredPlanets: ["mars", "saturn"],
    preferredDays: ["tue", "sat"],
    avoidPlanets: ["venus"],
  },
  wealth: {
    label: { ml: "ഐശ്വര്യം", en: "Wealth", ar: "ثراء" },
    synonyms: {
      ml: ["ഐശ്വര്യം", "സമ്പത്ത്", "റിസ്ഖ്", "ധനം", "ലാഭം", "സമ്പത്തി"],
      en: ["wealth", "prosperity", "abundance", "rizq", "profit", "riches", "fortune", "livelihood"],
      ar: ["رزق", "مال", "غنى", "ثروة"],
    },
    preferredPlanets: ["jupiter", "sun"],
    preferredDays: ["thu", "sun"],
    avoidPlanets: ["saturn"],
  },
  knowledge: {
    label: { ml: "ജ്ഞാനം", en: "Knowledge", ar: "علم" },
    synonyms: {
      ml: ["ജ്ഞാനം", "പഠനം", "വിദ്യ", "വിജ്ഞാനം", "വിദ്യാഭ്യാസം", "അറിവ്"],
      en: ["knowledge", "learning", "study", "wisdom", "education", "scholarship", "teaching"],
      ar: ["علم", "معرفة", "دراسة", "تعليم"],
    },
    preferredPlanets: ["mercury", "jupiter"],
    preferredDays: ["wed", "thu"],
    avoidPlanets: ["mars"],
  },
  spiritual: {
    label: { ml: "ആത്മികം", en: "Spiritual", ar: "روحاني" },
    synonyms: {
      ml: ["ആത്മികം", "പ്രാർത്ഥന", "ധ്യാനം", "ആരാധന", "ആത്മീയം", "ഭക്തി"],
      en: ["spiritual", "prayer", "meditation", "divine", "worship", "devotion", "contemplation"],
      ar: ["روحاني", "دعاء", "عبادة", "تأمل"],
    },
    preferredPlanets: ["jupiter", "saturn"],
    preferredDays: ["thu", "sat"],
    avoidPlanets: ["mars"],
  },
  courage: {
    label: { ml: "ധൈര്യം", en: "Courage", ar: "شجاعة" },
    synonyms: {
      ml: ["ധൈര്യം", "ശക്തി", "വിജയം", "ധീരത", "ശൗര്യം", "ധീരം"],
      en: ["courage", "strength", "victory", "bravery", "enemy", "overcome", "conquer"],
      ar: ["شجاعة", "قوة", "نصر", "غلبة"],
    },
    preferredPlanets: ["mars"],
    preferredDays: ["tue"],
    avoidPlanets: ["venus"],
  },

  // ── New concept categories (semantic concept resolver) ──
  // separation, enemy, binding, magic — manuscript-aligned (Kashf pp.12-27, Havâss p.49-51)
  ...NEW_CONCEPT_CATEGORIES,
};

/**
 * Classify user query to a canonical action category.
 * @param {string} query - User input (any language)
 * @returns {{ category: string, confidence: number, label: object } | null}
 */
export function classifyAction(query) {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const [key, cat] of Object.entries(ACTION_CATEGORIES)) {
    let score = 0;
    for (const lang of ['ml', 'en', 'ar']) {
      for (const syn of (cat.synonyms[lang] || [])) {
        const synLC = syn.toLowerCase();
        if (q === synLC) { score = Math.max(score, 100); break; }
        if (q.includes(synLC)) { score = Math.max(score, 85); }
        else if (synLC.includes(q) && q.length >= 3) { score = Math.max(score, 65); }
      }
      if (score >= 100) break;
    }
    if (q === key) score = Math.max(score, 100);
    else if (q.includes(key) && key.length >= 4) score = Math.max(score, 80);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }

  if (!bestMatch || bestScore < 30) {
    // Fallback: semantic concept resolver (multilingual concept words → canonical).
    // Lets users search by meaning ("banish", "expel", "imprison", "destroy"…) without
    // an exact synonym match and without an LLM call (zero integration credits).
    const concept = resolveConcept(q);
    if (concept && ACTION_CATEGORIES[concept.category]) {
      return {
        category: concept.category,
        confidence: concept.confidence,
        label: ACTION_CATEGORIES[concept.category].label,
      };
    }
    return null;
  }

  return {
    category: bestMatch,
    confidence: bestScore,
    label: ACTION_CATEGORIES[bestMatch].label,
  };
}

/**
 * Check if a text matches any synonym of the given category.
 * Used for dynamic knowledge matching — works on any text, any language.
 * @param {string} text - Text to check
 * @param {string} categoryKey - Canonical category key
 * @returns {boolean}
 */
export function textMatchesCategory(text, categoryKey) {
  if (!text || !categoryKey) return false;
  const cat = ACTION_CATEGORIES[categoryKey];
  if (!cat) return false;
  const textLC = text.toLowerCase();
  const allSynonyms = [
    ...(cat.synonyms.en || []),
    ...(cat.synonyms.ml || []),
    ...(cat.synonyms.ar || []),
  ].map(s => s.toLowerCase());
  return allSynonyms.some(syn => textLC.includes(syn));
}

export default { ACTION_CATEGORIES, classifyAction, textMatchesCategory };
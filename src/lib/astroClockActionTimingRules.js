/**
 * ACTION TIMING KNOWLEDGE BASE
 * Extracted from uploaded PDF books only
 * STRICTLY ISOLATED: Astro Clock module only
 * 
 * This contains ONLY rules explicitly found in the PDF knowledge base.
 * No external astrology, no generic interpretations.
 */

// Action categories with their Malayalam and English terms
export const ACTION_CATEGORIES = {
  // Marriage & Relationships
  MARRIAGE: {
    ml: ["വിവാഹം", "കല്യാണം", "വിവാഹ ആലോചന"],
    en: ["marriage", "wedding", "marriage proposal", "engagement"],
    arabic: "النكاح"
  },
  LOVE: {
    ml: ["പ്രണയം", "സ്നേഹം", "ആകർഷണം"],
    en: ["love", "romance", "attraction", "affection"],
    arabic: "المحبة"
  },
  SEPARATION: {
    ml: ["വേർപിരിയൽ", "പിരിയൽ", "വിവാഹ മോചനം"],
    en: ["separation", "divorce", "breakup", "parting"],
    arabic: "الفرقة"
  },
  
  // Business & Finance
  BUSINESS: {
    ml: ["വ്യാപാരം", "ബിസിനസ്സ്", "കച്ചവടം"],
    en: ["business", "trade", "commerce"],
    arabic: "التجارة"
  },
  TRAVEL: {
    ml: ["യാത്ര", "യാത്ര ചെയ്യൽ"],
    en: ["travel", "journey", "trip"],
    arabic: "السفر"
  },
  PURCHASE: {
    ml: ["വാങ്ങൽ", "ഭൂമി വാങ്ങൽ", "വീട് വാങ്ങൽ"],
    en: ["purchase", "buying", "acquisition", "land purchase", "house purchase"],
    arabic: "الشراء"
  },
  CONSTRUCTION: {
    ml: ["വീട് നിർമ്മാണം", "നിർമ്മാണം", "പണി"],
    en: ["construction", "building", "house construction"],
    arabic: "البناء"
  },
  
  // Education & Career
  EDUCATION: {
    ml: ["പഠനം", "വിദ്യാഭ്യാസം", "പരിശീലനം"],
    en: ["education", "study", "learning", "training"],
    arabic: "التعلم"
  },
  JOB: {
    ml: ["ജോലി", "തൊഴിൽ", "ഉദ്യോഗം"],
    en: ["job", "employment", "career", "work"],
    arabic: "العمل"
  },
  
  // Health & Healing
  HEALING: {
    ml: ["ചികിത്സ", "രോഗശാന്തി", "ആരോഗ്യം"],
    en: ["healing", "treatment", "health", "recovery", "medical treatment"],
    arabic: "الشفاء"
  },
  PREGNANCY: {
    ml: ["ഗർഭധാരണം", "ഗർഭം", "പ്രസവം"],
    en: ["pregnancy", "conception", "childbirth"],
    arabic: "الحمل"
  },
  
  // Spiritual & Esoteric
  SPIRITUAL: {
    ml: ["ആത്മീയ അമൽ", "ആദ്ധ്യാത്മിക പ്രവർത്തനങ്ങൾ", "ഇബാദത്ത്"],
    en: ["spiritual work", "worship", "prayer", "devotion"],
    arabic: "العمل الروحي"
  },
  ENEMY_WORK: {
    ml: ["ശത്രു പ്രവർത്തനം", "ശത്രുത", "വിദ്വേഷം"],
    en: ["enemy work", "hostility", "hatred", "harm"],
    arabic: "العداوة"
  },
  
  // Legal & Conflict
  LEGAL: {
    ml: ["കോടതിക്കേസ്", "കേസ്", "നിയമ പോരാട്ടം"],
    en: ["court case", "legal matter", "lawsuit", "trial"],
    arabic: "القضاء"
  },
  CONFLICT: {
    ml: ["തർക്കം", "കലഹം", "ശത്രുത"],
    en: ["conflict", "dispute", "fight", "quarrel"],
    arabic: "النزاع"
  }
};

// PDF-Sourced timing rules for each action category
// Source: Havâss'ın Derinlikleri and other uploaded PDFs
export const ACTION_TIMING_RULES = {
  MARRIAGE: {
    suitableMansions: [2, 3, 6, 7, 11, 15, 20, 24, 26, 28],
    unsuitableMansions: [1, 4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27],
    suitablePlanets: ["venus", "jupiter", "moon"],
    unsuitablePlanets: ["saturn", "mars"],
    suitableDays: ["friday", "monday", "thursday"],
    unsuitableDays: ["tuesday", "saturday"],
    elementPreference: ["water", "earth"],
    dayOrNight: "both",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.50-51, 120-125",
    notes: {
      ml: "സുരയ്യ (മൻസിൽ 3), ഹനാ (മൻസിൽ 6), സുബ്ര (മൻസിൽ 11) എന്നിവ വിവാഹത്തിന് ഏറ്റവും ഉത്തമം",
      en: "Süreyya (mansion 3), Hena (mansion 6), Zebra (mansion 11) are most excellent for marriage"
    }
  },
  
  LOVE: {
    suitableMansions: [2, 3, 6, 11, 15, 20, 24, 26],
    unsuitableMansions: [4, 5, 8, 9, 13, 14, 21, 22, 25, 27],
    suitablePlanets: ["venus", "moon", "jupiter"],
    unsuitablePlanets: ["saturn", "mars"],
    suitableDays: ["friday", "monday"],
    unsuitableDays: ["tuesday", "saturday"],
    elementPreference: ["water", "fire"],
    dayOrNight: "night",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.52-55, 126-130",
    notes: {
      ml: "രാത്രി സമയം, ശുക്രൻ അല്ലെങ്കിൽ ചന്ദ്രൻ മണിക്കൂറിൽ ചെയ്യുക",
      en: "Perform at night, during Venus or Moon hour"
    }
  },
  
  SEPARATION: {
    suitableMansions: [4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27],
    unsuitableMansions: [2, 3, 6, 7, 11, 15, 20, 24, 26, 28],
    suitablePlanets: ["mars", "saturn"],
    unsuitablePlanets: ["venus", "jupiter", "moon"],
    suitableDays: ["tuesday", "saturday"],
    unsuitableDays: ["friday", "monday", "thursday"],
    elementPreference: ["fire", "earth"],
    dayOrNight: "night",
    saadRequired: false,
    nahsRequired: true,
    source: "Havâss'ın Derinlikleri p.56-58, 131-135",
    notes: {
      ml: "ദുബ്രാൻ (മൻസിൽ 4), ഹഖ്അ (മൻസിൽ 5), നസ്റ (മൻസിൽ 8) എന്നിവ വേർപിരിയലിന് അനുയോജ്യം",
      en: "Dübran (mansion 4), Hak'a (mansion 5), Nesre (mansion 8) are suitable for separation"
    }
  },
  
  BUSINESS: {
    suitableMansions: [3, 6, 7, 11, 15, 16, 20, 24, 26, 28],
    unsuitableMansions: [1, 4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27],
    suitablePlanets: ["jupiter", "sun", "venus"],
    unsuitablePlanets: ["saturn", "mars"],
    suitableDays: ["thursday", "sunday", "friday"],
    unsuitableDays: ["tuesday", "saturday"],
    elementPreference: ["fire", "air"],
    dayOrNight: "day",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.59-62, 136-142",
    notes: {
      ml: "പകൽ സമയം, വ്യാഴക്കിഴമ അല്ലെങ്കിൽ ഞായർ, സുരയ്യ അല്ലെങ്കിൽ സിറാ മൻസിൽ",
      en: "Daytime, Jupiter or Sunday, Süreyya or Zira mansion"
    }
  },
  
  TRAVEL: {
    suitableMansions: [6, 7, 11, 15, 16, 20, 24, 26, 28],
    unsuitableMansions: [1, 4, 5, 8, 9, 12, 13, 14, 17, 18, 19, 21, 22, 25, 27],
    suitablePlanets: ["moon", "jupiter", "venus"],
    unsuitablePlanets: ["saturn", "mars"],
    suitableDays: ["monday", "thursday", "friday"],
    unsuitableDays: ["tuesday", "saturday"],
    elementPreference: ["air", "water"],
    dayOrNight: "day",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.63-65, 143-148",
    notes: {
      ml: "ചന്ദ്രൻ വളരുമ്പോൾ യാത്ര ചെയ്യുക, 28-ാം മൻസിൽ (അൽറിഷ) ഏറ്റവും ഉത്തമം",
      en: "Travel when Moon is waxing, 28th mansion (Erreşa) is most excellent"
    }
  },
  
  PURCHASE: {
    suitableMansions: [5, 6, 7, 11, 15, 20, 24, 26, 28],
    unsuitableMansions: [1, 4, 8, 9, 12, 13, 14, 21, 22, 25, 27],
    suitablePlanets: ["venus", "moon", "jupiter"],
    unsuitablePlanets: ["saturn", "mars"],
    suitableDays: ["friday", "monday", "thursday"],
    unsuitableDays: ["tuesday", "saturday"],
    elementPreference: ["earth", "water"],
    dayOrNight: "day",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.66-68, 149-155",
    notes: {
      ml: "ഭൂമി വാങ്ങാൻ ഹഖ്അ (മൻസിൽ 5) അനുയോജ്യം, പൊതുവെ വാങ്ങലിന് സഅദ് മൻസിലുകൾ",
      en: "Hak'a (mansion 5) suitable for land purchase, generally Sa'd mansions for buying"
    }
  },
  
  CONSTRUCTION: {
    suitableMansions: [4, 5, 6, 7, 11, 15, 20, 24, 26],
    unsuitableMansions: [1, 8, 9, 12, 13, 14, 17, 18, 19, 21, 22, 25, 27],
    suitablePlanets: ["saturn", "venus", "moon"],
    unsuitablePlanets: ["mars"],
    suitableDays: ["saturday", "friday", "monday"],
    unsuitableDays: ["tuesday"],
    elementPreference: ["earth"],
    dayOrNight: "day",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.69-71, 156-162",
    notes: {
      ml: "ശനിയാഴ്ച, ഭൂമി മൂലകം, സഅദ് മൻസിലുകൾ - വീട് നിർമ്മാണത്തിന് ഏറ്റവും ഉത്തമം",
      en: "Saturday, Earth element, Sa'd mansions - most excellent for house construction"
    }
  },
  
  EDUCATION: {
    suitableMansions: [7, 11, 15, 16, 20, 24, 26, 28],
    unsuitableMansions: [1, 4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27],
    suitablePlanets: ["jupiter", "mercury", "moon"],
    unsuitablePlanets: ["saturn", "mars"],
    suitableDays: ["thursday", "wednesday", "monday"],
    unsuitableDays: ["tuesday", "saturday"],
    elementPreference: ["air", "water"],
    dayOrNight: "day",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.72-74, 163-168",
    notes: {
      ml: "സിറാ (മൻസിൽ 7) വിദ്യാഭ്യാസത്തിന് ഏറ്റവും ഉത്തമം, വ്യാഴക്കിഴമ",
      en: "Zira (mansion 7) most excellent for education, Thursday"
    }
  },
  
  JOB: {
    suitableMansions: [6, 7, 11, 15, 16, 20, 24, 26, 28],
    unsuitableMansions: [1, 4, 5, 8, 9, 12, 13, 14, 17, 18, 19, 21, 22, 25, 27],
    suitablePlanets: ["sun", "jupiter", "venus"],
    unsuitablePlanets: ["saturn", "mars"],
    suitableDays: ["sunday", "thursday", "friday"],
    unsuitableDays: ["tuesday", "saturday"],
    elementPreference: ["fire", "air"],
    dayOrNight: "day",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.75-77, 169-175",
    notes: {
      ml: "ഞായർ അല്ലെങ്കിൽ വ്യാഴക്കിഴമ, സൂര്യൻ അല്ലെങ്കിൽ വ്യാഴം മണിക്കൂർ",
      en: "Sunday or Thursday, Sun or Jupiter hour"
    }
  },
  
  HEALING: {
    suitableMansions: [2, 6, 11, 15, 16, 20, 24, 26],
    unsuitableMansions: [1, 4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27],
    suitablePlanets: ["moon", "jupiter", "sun"],
    unsuitablePlanets: ["saturn", "mars"],
    suitableDays: ["monday", "thursday", "sunday"],
    unsuitableDays: ["tuesday", "saturday"],
    elementPreference: ["water", "fire"],
    dayOrNight: "both",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.78-80, 176-182",
    notes: {
      ml: "ചന്ദ്രൻ, വ്യാഴം, സൂര്യൻ മണിക്കൂറുകൾ; സുബ്ര (മൻസിൽ 11), ഗുഫ്ർ (മൻസിൽ 15)",
      en: "Moon, Jupiter, Sun hours; Zebra (mansion 11), Gufur (mansion 15)"
    }
  },
  
  PREGNANCY: {
    suitableMansions: [2, 3, 6, 11, 15, 20, 24, 26],
    unsuitableMansions: [1, 4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27],
    suitablePlanets: ["moon", "venus", "jupiter"],
    unsuitablePlanets: ["saturn", "mars"],
    suitableDays: ["monday", "friday", "thursday"],
    unsuitableDays: ["tuesday", "saturday"],
    elementPreference: ["water", "earth"],
    dayOrNight: "night",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.81-83, 183-189",
    notes: {
      ml: "രാത്രി, ചന്ദ്രൻ അല്ലെങ്കിൽ ശുക്രൻ, ജല മൂലകം",
      en: "Night time, Moon or Venus, Water element"
    }
  },
  
  SPIRITUAL: {
    suitableMansions: [2, 3, 6, 7, 11, 15, 16, 20, 24, 26, 28],
    unsuitableMansions: [1, 4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27],
    suitablePlanets: ["jupiter", "moon", "sun"],
    unsuitablePlanets: ["saturn", "mars"],
    suitableDays: ["thursday", "monday", "sunday"],
    unsuitableDays: ["tuesday", "saturday"],
    elementPreference: ["fire", "water"],
    dayOrNight: "both",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.84-87, 190-198",
    notes: {
      ml: "വ്യാഴക്കിഴമ, സഅദ് മൻസിലുകൾ, പകൽ അല്ലെങ്കിൽ രാത്രി",
      en: "Thursday, Sa'd mansions, day or night"
    }
  },
  
  ENEMY_WORK: {
    suitableMansions: [1, 4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27],
    unsuitableMansions: [2, 3, 6, 7, 11, 15, 16, 20, 24, 26, 28],
    suitablePlanets: ["mars", "saturn"],
    unsuitablePlanets: ["venus", "jupiter", "moon"],
    suitableDays: ["tuesday", "saturday"],
    unsuitableDays: ["friday", "monday", "thursday"],
    elementPreference: ["fire", "earth"],
    dayOrNight: "night",
    saadRequired: false,
    nahsRequired: true,
    source: "Havâss'ın Derinlikleri p.88-92, 199-208",
    notes: {
      ml: "ചൊവ്വ അല്ലെങ്കിൽ ശനി, നഹ്സ് മൻസിലുകൾ, രാത്രി മാത്രം",
      en: "Mars or Saturn, Nahs mansions, night only"
    }
  },
  
  LEGAL: {
    suitableMansions: [6, 7, 11, 15, 16, 20, 24, 26],
    unsuitableMansions: [1, 4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27],
    suitablePlanets: ["jupiter", "sun", "mercury"],
    unsuitablePlanets: ["saturn", "mars"],
    suitableDays: ["thursday", "sunday", "wednesday"],
    unsuitableDays: ["tuesday", "saturday"],
    elementPreference: ["air", "fire"],
    dayOrNight: "day",
    saadRequired: true,
    source: "Havâss'ın Derinlikleri p.93-95, 209-215",
    notes: {
      ml: "വ്യാഴക്കിഴമ അല്ലെങ്കിൽ ഞായർ, പകൽ സമയം",
      en: "Thursday or Sunday, daytime"
    }
  },
  
  CONFLICT: {
    suitableMansions: [4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27],
    unsuitableMansions: [2, 3, 6, 7, 11, 15, 16, 20, 24, 26, 28],
    suitablePlanets: ["mars", "saturn"],
    unsuitablePlanets: ["venus", "jupiter", "moon"],
    suitableDays: ["tuesday", "saturday"],
    unsuitableDays: ["friday", "monday", "thursday"],
    elementPreference: ["fire", "earth"],
    dayOrNight: "night",
    saadRequired: false,
    nahsRequired: true,
    source: "Havâss'ın Derinlikleri p.96-98, 216-222",
    notes: {
      ml: "ചൊവ്വ അല്ലെങ്കിൽ ശനി, നഹ്സ് മൻസിലുകൾ, രാത്രി",
      en: "Mars or Saturn, Nahs mansions, night"
    }
  }
};

// Helper function to find matching action category
export function findActionCategory(input) {
  const normalizedInput = input.toLowerCase().trim();
  
  for (const [categoryKey, categoryData] of Object.entries(ACTION_CATEGORIES)) {
    // Check Malayalam terms
    if (categoryData.ml.some(term => normalizedInput.includes(term.toLowerCase()))) {
      return categoryKey;
    }
    // Check English terms
    if (categoryData.en.some(term => normalizedInput.includes(term.toLowerCase()))) {
      return categoryKey;
    }
    // Check Arabic term
    if (normalizedInput.includes(categoryData.arabic.toLowerCase())) {
      return categoryKey;
    }
  }
  
  return null;
}

// Helper function to get timing rules for an action
export function getTimingRulesForAction(actionCategory) {
  return ACTION_TIMING_RULES[actionCategory] || null;
}

// Helper function to evaluate current timing
export function evaluateCurrentTiming(actionCategory, currentAstroData) {
  const rules = getTimingRulesForAction(actionCategory);
  if (!rules) return null;
  
  const {
    mansion,
    zodiacSign,
    planetaryHour,
    dayOfWeek,
    isDaytime
  } = currentAstroData;
  
  let score = 0;
  let reasons = [];
  
  // Check mansion
  if (rules.suitableMansions.includes(mansion.number)) {
    score += 3;
    reasons.push({ type: "positive", text: `Mansion ${mansion.number} (${mansion.name_en}) is suitable` });
  } else if (rules.unsuitableMansions.includes(mansion.number)) {
    score -= 3;
    reasons.push({ type: "negative", text: `Mansion ${mansion.number} (${mansion.name_en}) is unsuitable` });
  }
  
  // Check planet
  if (rules.suitablePlanets.includes(planetaryHour.planet)) {
    score += 2;
    reasons.push({ type: "positive", text: `${planetaryHour.planetInfo?.name_en} hour is suitable` });
  } else if (rules.unsuitablePlanets.includes(planetaryHour.planet)) {
    score -= 2;
    reasons.push({ type: "negative", text: `${planetaryHour.planetInfo?.name_en} hour is unsuitable` });
  }
  
  // Check day
  if (rules.suitableDays.includes(dayOfWeek)) {
    score += 2;
    reasons.push({ type: "positive", text: `${dayOfWeek} is a suitable day` });
  } else if (rules.unsuitableDays.includes(dayOfWeek)) {
    score -= 2;
    reasons.push({ type: "negative", text: `${dayOfWeek} is an unsuitable day` });
  }
  
  // Check element
  if (rules.elementPreference.includes(zodiacSign.element)) {
    score += 1;
    reasons.push({ type: "positive", text: `${zodiacSign.element} element is favorable` });
  }
  
  // Check day/night
  if (rules.dayOrNight === "day" && !isDaytime) {
    score -= 1;
    reasons.push({ type: "negative", text: "Should be performed during daytime" });
  } else if (rules.dayOrNight === "night" && isDaytime) {
    score -= 1;
    reasons.push({ type: "negative", text: "Should be performed at night" });
  }
  
  // Check Sa'd/Nahs requirement
  const mansionNature = mansion.nature;
  if (rules.saadRequired && mansionNature !== "Saad") {
    score -= 2;
    reasons.push({ type: "negative", text: "Requires Sa'd (benefic) mansion" });
  }
  if (rules.nahsRequired && mansionNature !== "Nahs") {
    score -= 2;
    reasons.push({ type: "negative", text: "Requires Nahs (malefic) mansion" });
  }
  
  const isSuitable = score >= 3;
  const isUnsuitable = score <= -3;
  
  return {
    score,
    isSuitable,
    isUnsuitable,
    reasons,
    source: rules.source,
    notes: rules.notes
  };
}
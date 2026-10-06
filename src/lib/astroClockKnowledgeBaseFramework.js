// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK KNOWLEDGE BASE FRAMEWORK
// Additive, non-destructive architecture for PDF knowledge
// Source attribution for all rules
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

/**
 * SOURCE BOOK REGISTRY
 * Tracks all ingested PDF books with metadata
 * Additive only - never removes existing entries
 */
export const SOURCE_BOOKS = {
  PDF2: {
    id: "PDF2",
    title: "Havâss'ın Derinlikleri - Lunar Mansions",
    author: "Bülent Kısa",
    pages: "64-74",
    status: "ingested",
    ingestionDate: "2024-01-15"
  },
  HAVALSS: {
    id: "HAVALSS",
    title: "Havâss'ın Derinlikleri",
    author: "Bülent Kısa",
    pages: "50-51, 88-92, 100-105, 140-150, 170-180, 190-200, 200-210",
    status: "ingested",
    ingestionDate: "2024-01-10"
  },
  TAHA: {
    id: "TAHA",
    title: "Taha Manuscript",
    author: "Traditional",
    pages: "120-125, 140-150, 180-190, 200-210, 220-230",
    status: "ingested",
    ingestionDate: "2024-01-12"
  }
};

/**
 * KNOWLEDGE BASE MODE
 * Locked - prevents destructive updates
 */
export const KNOWLEDGE_BASE_MODE = "ADDITIVE_ONLY";
export const KNOWLEDGE_BASE_VERSION = "1.0.0";

/**
 * ACTION TIMING RULES
 * Organized by topic with full source attribution
 */
export const ACTION_TIMING_RULES = {
  marriage: [
    {
      id: "marriage_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 2, 3, 6, 7, 11, 15, 16, 20, 24, 26 are suitable for marriage",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "marriage"
    },
    {
      id: "marriage_002",
      book: "HAVALSS",
      chapter: "p.50-51",
      ruleText: "Monday, Wednesday, Thursday, Friday are favorable for marriage",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "marriage"
    }
  ],
  love: [
    {
      id: "love_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 2, 6, 7, 11, 15, 20, 24 are suitable for love operations",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "love"
    },
    {
      id: "love_002",
      book: "HAVALSS",
      chapter: "p.50-51",
      ruleText: "Friday and Monday are most favorable for muhabbah",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "love"
    }
  ],
  separation: [
    {
      id: "separation_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 4, 5, 8, 9, 12, 13, 21, 22, 25, 27 are suitable for separation",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "separation"
    },
    {
      id: "separation_002",
      book: "HAVALSS",
      chapter: "p.190-200",
      ruleText: "Tuesday and Saturday are favorable for tafriq operations",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "separation"
    }
  ],
  rizq: [
    {
      id: "rizq_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 3, 6, 10, 11, 15, 16, 20, 24 are suitable for rizq",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "rizq"
    },
    {
      id: "rizq_002",
      book: "TAHA",
      chapter: "p.120-125",
      ruleText: "Thursday and Wednesday bring barakah for provision",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "rizq"
    }
  ],
  healing: [
    {
      id: "healing_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 3, 6, 7, 11, 15, 16, 20 are suitable for healing",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "healing"
    },
    {
      id: "healing_002",
      book: "HAVALSS",
      chapter: "p.88-92",
      ruleText: "Wednesday, Thursday, Sunday are favorable for cure",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "healing"
    }
  ],
  spiritual: [
    {
      id: "spiritual_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 2, 3, 6, 7, 11, 15, 16, 20, 24, 26, 28 are suitable for spiritual work",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "spiritual"
    },
    {
      id: "spiritual_002",
      book: "TAHA",
      chapter: "p.200-210",
      ruleText: "Friday, Monday, Thursday are most favorable for spiritual operations",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "spiritual"
    }
  ],
  vefk: [
    {
      id: "vefk_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 1, 3, 6, 10, 11, 15, 16, 20, 24, 28 are suitable for vefk",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "vefk"
    },
    {
      id: "vefk_002",
      book: "HAVALSS",
      chapter: "p.150-160",
      ruleText: "Sunday, Thursday, Wednesday are favorable for vefk creation",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "vefk"
    }
  ],
  talisman: [
    {
      id: "talisman_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 4, 5, 8, 9, 12, 13, 21, 22, 25, 27 are suitable for talisman",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "talisman"
    },
    {
      id: "talisman_002",
      book: "TAHA",
      chapter: "p.180-190",
      ruleText: "Saturday, Tuesday, Thursday are favorable for talisman work",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "talisman"
    }
  ],
  hadim: [
    {
      id: "hadim_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 4, 5, 8, 9, 12, 13, 21, 22, 25, 27 are suitable for hadim",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "hadim"
    },
    {
      id: "hadim_002",
      book: "HAVALSS",
      chapter: "p.200-210",
      ruleText: "Tuesday, Saturday, Thursday are favorable for hadim operations",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "hadim"
    }
  ],
  ism: [
    {
      id: "ism_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 2, 3, 6, 7, 11, 15, 16, 20, 24, 26, 28 are suitable for divine names",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "ism"
    },
    {
      id: "ism_002",
      book: "TAHA",
      chapter: "p.220-230",
      ruleText: "Friday, Thursday, Sunday are most favorable for ism operations",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "ism"
    }
  ],
  travel: [
    {
      id: "travel_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 3, 6, 11, 15, 16, 20, 24 are suitable for travel",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "travel"
    },
    {
      id: "travel_002",
      book: "HAVALSS",
      chapter: "p.100-105",
      ruleText: "Wednesday, Thursday, Monday are favorable for travel",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "travel"
    }
  ],
  business: [
    {
      id: "business_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 3, 6, 10, 11, 15, 16, 20, 24 are suitable for business",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "business"
    },
    {
      id: "business_002",
      book: "TAHA",
      chapter: "p.140-150",
      ruleText: "Wednesday, Thursday, Friday are favorable for trade",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "business"
    }
  ],
  construction: [
    {
      id: "construction_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 3, 6, 10, 11, 15, 16, 20 are suitable for construction",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "construction"
    },
    {
      id: "construction_002",
      book: "HAVALSS",
      chapter: "p.170-180",
      ruleText: "Thursday, Tuesday, Sunday are favorable for building",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "construction"
    }
  ],
  purchase: [
    {
      id: "purchase_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 3, 6, 11, 15, 16, 20, 24 are suitable for purchase",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "purchase"
    },
    {
      id: "purchase_002",
      book: "TAHA",
      chapter: "p.140-150",
      ruleText: "Wednesday, Thursday, Friday are favorable for buying",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "purchase"
    }
  ],
  conflict: [
    {
      id: "conflict_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 4, 5, 8, 9, 12, 13, 21, 22, 25, 27 are suitable for conflict",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "conflict"
    },
    {
      id: "conflict_002",
      book: "HAVALSS",
      chapter: "p.190-200",
      ruleText: "Tuesday, Saturday are favorable for confrontation",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "conflict"
    }
  ]
};

/**
 * Get rules for a specific topic
 * @param {String} topic - Topic to query
 * @returns {Array} Rules with source attribution
 */
export function getRulesForTopic(topic) {
  return ACTION_TIMING_RULES[topic] || [];
}

/**
 * Get all topics
 * @returns {Array} Available topics
 */
export function getAllTopics() {
  return Object.keys(ACTION_TIMING_RULES);
}

/**
 * Get source attribution for display
 * @param {String} topic - Topic to display
 * @returns {Object} Source breakdown
 */
export function getSourceAttribution(topic) {
  const rules = getRulesForTopic(topic);
  const byBook = {};
  
  rules.forEach(rule => {
    if (!byBook[rule.book]) {
      byBook[rule.book] = [];
    }
    byBook[rule.book].push(rule);
  });
  
  return {
    topic,
    totalRules: rules.length,
    books: Object.keys(byBook),
    byBook
  };
}

/**
 * Validate knowledge base integrity
 * @returns {Object} Integrity report
 */
export function validateKnowledgeBase() {
  const issues = [];
  const stats = {
    totalTopics: Object.keys(ACTION_TIMING_RULES).length,
    totalRules: 0,
    rulesByConfidence: { high: 0, medium: 0, low: 0 }
  };
  
  Object.keys(ACTION_TIMING_RULES).forEach(topic => {
    const rules = ACTION_TIMING_RULES[topic];
    stats.totalRules += rules.length;
    
    rules.forEach(rule => {
      if (!rule.book) issues.push(`Rule ${rule.id} missing book`);
      if (!rule.chapter) issues.push(`Rule ${rule.id} missing chapter`);
      if (!rule.ruleText) issues.push(`Rule ${rule.id} missing rule text`);
      if (!rule.ruleType) issues.push(`Rule ${rule.id} missing rule type`);
      if (!rule.confidence) issues.push(`Rule ${rule.id} missing confidence`);
      
      if (stats.rulesByConfidence.hasOwnProperty(rule.confidence)) {
        stats.rulesByConfidence[rule.confidence]++;
      }
    });
  });
  
  return {
    valid: issues.length === 0,
    issues,
    stats,
    mode: KNOWLEDGE_BASE_MODE,
    version: KNOWLEDGE_BASE_VERSION
  };
}
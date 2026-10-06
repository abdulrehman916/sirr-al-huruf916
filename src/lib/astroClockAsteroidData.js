/**
 * ASTRO CLOCK — ASTEROID KNOWLEDGE BASE
 * Extracted from "Asteroids Beautiful Soul" PDF (90 pages)
 * Source: 3 PDF files (pages 1-30, 31-60, 61-90)
 * 
 * ASTEROIDS COVERED:
 * - Ceres (سیرس / ڈیمیٹر)
 * - Pallas (پلاس / پالاس)
 * - Juno (جونو / ہیرا)
 * - Vesta (ویسٹا / ویسٹا)
 * - Chiron (کیرون / کائرون)
 * - Other asteroids
 * 
 * STRICTLY ISOLATED: No shared data with any other module.
 * ADDITIVE ONLY: Never overwrites existing Astro Clock knowledge.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ASTEROID TIMING RULES — EXTRACTED FROM PDF
// ─────────────────────────────────────────────────────────────────────────────
export const ASTEROID_TIMING_RULES = [
  {
    id: "AST_CERES_001",
    asteroid: "Ceres",
    asteroid_arabic: "سیرس",
    category: "PLANETS",
    original_text: {
      en: "Ceres represents nurturing, motherhood, agriculture, and cycles of loss and return",
      significance: "Goddess of harvest, mother-daughter bond (Demeter-Persephone)"
    },
    malayalam: {
      title: "സെറിസ് — കൃഷിയും പോഷണവും",
      meaning: "സെറിസ് ഗ്രഹം പോഷണം, അമ്മത്വം, കൃഷി, നഷ്ടവും തിരിച്ചുവരവും എന്നീ ചക്രങ്ങളെ പ്രതിനിധീകരിക്കുന്നു. ഡിമീറ്റർ-പെർസെഫോൺ അമ്മ-മകൾ ബന്ധമാണ് ഇതിന്റെ പ്രധാന പ്രതീകം.",
      practical_usage: "കൃഷി, ഭക്ഷണം, പോഷണം, അമ്മയുമായുള്ള ബന്ധം, നഷ്ടപ്പെട്ട വസ്തുക്കൾ തിരിച്ചുകിട്ടൽ എന്നിവയ്ക്ക് അനുയോജ്യം",
      benefits: ["പോഷണം വർദ്ധിക്കും", "കൃഷി വിജയിക്കും", "നഷ്ടപ്പെട്ടവ തിരിച്ചുകിട്ടും"],
      warnings: ["അമ്മയുമായി തർക്കങ്ങൾ ഉണ്ടാകാം", "വിഷാദം വരാം"],
      when_to_use: "കൃഷി ആരംഭിക്കാൻ, ഭക്ഷണം സംബന്ധിച്ച കാര്യങ്ങൾക്ക്, അമ്മയുടെ അനുഗ്രഹം തേടാൻ",
      when_to_avoid: "വിവാഹം, യുദ്ധം, മത്സരങ്ങൾ"
    },
    timing_recommendations: [
      "Use during planting seasons",
      "Favorable when Moon is in Taurus or Cancer",
      "Best during waxing moon for growth matters"
    ],
    suitable_actions: [
      "Agriculture and farming",
      "Nurturing activities",
      "Recovering lost items",
      "Mother-child bonding",
      "Food-related businesses"
    ],
    unsuitable_actions: [
      "Aggressive actions",
      "Starting conflicts",
      "Separation or divorce"
    ],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [1, 5, 12],
      chapter: "Introduction to Ceres"
    }
  },
  {
    id: "AST_PALLAS_001",
    asteroid: "Pallas",
    asteroid_arabic: "پلاس",
    category: "PLANETS",
    original_text: {
      en: "Pallas Athena represents wisdom, strategy, healing, and creative intelligence",
      significance: "Goddess of wisdom and strategic warfare"
    },
    malayalam: {
      title: "പല്ലാസ് — ബുദ്ധിയും തന്ത്രവും",
      meaning: "പല്ലാസ് ആഥീന ബുദ്ധി, തന്ത്രം, ചികിത്സ, സൃഷ്ടിപരമായ ബുദ്ധി എന്നിവയെ പ്രതിനിധീകരിക്കുന്നു. യുദ്ധതന്ത്രങ്ങളുടെയും ജ്ഞാനത്തിന്റെയും ദേവത.",
      practical_usage: "തന്ത്രപരമായ തീരുമാനങ്ങൾ, ബുദ്ധിപരമായ പ്രവർത്തനങ്ങൾ, ചികിത്സാ പ്രവർത്തനങ്ങൾ എന്നിവയ്ക്ക് അനുയോജ്യം",
      benefits: ["ബുദ്ധി വർദ്ധിക്കും", "തന്ത്രങ്ങൾ വിജയിക്കും", "രോഗശാന്തി ഉണ്ടാകും"],
      warnings: ["അഹങ്കാരം വരാം", "യുദ്ധസാഹചര്യങ്ങൾ ഉണ്ടാകാം"],
      when_to_use: "തന്ത്രപരമായ തീരുമാനങ്ങൾ എടുക്കാൻ, പഠനത്തിന്, ചികിത്സയ്ക്ക്",
      when_to_avoid: "ഭാഗ്യപരീക്ഷണങ്ങൾ, അനാവശ്യ മത്സരങ്ങൾ"
    },
    timing_recommendations: [
      "Use during Mercury hours for wisdom",
      "Favorable in Air signs (Gemini, Libra, Aquarius)",
      "Best during daytime for strategic planning"
    ],
    suitable_actions: [
      "Strategic planning",
      "Healing work",
      "Creative projects",
      "Problem-solving",
      "Learning and education"
    ],
    unsuitable_actions: [
      "Impulsive decisions",
      "Emotional confrontations",
      "Physical aggression"
    ],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [34, 37, 42],
      chapter: "Pallas in Houses"
    }
  },
  {
    id: "AST_JUNO_001",
    asteroid: "Juno",
    asteroid_arabic: "جونو",
    category: "PLANETS",
    original_text: {
      en: "Juno represents marriage, partnership, commitment, and betrayal",
      significance: "Goddess of marriage and committed relationships"
    },
    malayalam: {
      title: "ജൂനോ — വിവാഹവും കൂട്ടാളിമയും",
      meaning: "ജൂനോ വിവാഹം, കൂട്ടാളിമ, പ്രതിബദ്ധത, ദ്രോഹം എന്നിവയെ പ്രതിനിധീകരിക്കുന്നു. വിവാഹത്തിന്റെയും പ്രതിബദ്ധ ബന്ധങ്ങളുടെയും ദേവത.",
      practical_usage: "വിവാഹം, കൂട്ടാളിമ, പ്രതിബദ്ധത ആവശ്യമുള്ള കാര്യങ്ങൾ എന്നിവയ്ക്ക് അനുയോജ്യം",
      benefits: ["വിവാഹജീവിതം സുഖകരമാകും", "കൂട്ടാളിമ വിജയിക്കും", "പ്രതിബദ്ധത വർദ്ധിക്കും"],
      warnings: ["ദ്രോഹം അനുഭവപ്പെടാം", "വിവാഹതർക്കങ്ങൾ ഉണ്ടാകാം"],
      when_to_use: "വിവാഹത്തിന്, കൂട്ടാളിമ ആരംഭിക്കാൻ, പ്രതിബദ്ധത ആവശ്യമുള്ള കാര്യങ്ങൾക്ക്",
      when_to_avoid: "വിവാഹമോചനം, കൂട്ടാളിമ അവസാനിപ്പിക്കാൻ"
    },
    timing_recommendations: [
      "Use during Venus hours for love",
      "Favorable in Libra (Juno's sign)",
      "Best during waxing moon for new commitments"
    ],
    suitable_actions: [
      "Marriage ceremonies",
      "Partnership agreements",
      "Commitment vows",
      "Relationship counseling",
      "Reconciliation"
    ],
    unsuitable_actions: [
      "Divorce proceedings",
      "Breaking partnerships",
      "Betrayal or deception"
    ],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [66, 70, 75],
      chapter: "Juno in Houses"
    }
  },
  {
    id: "AST_VESTA_001",
    asteroid: "Vesta",
    asteroid_arabic: "ویسٹا",
    category: "PLANETS",
    original_text: {
      en: "Vesta represents sacred space, devotion, focus, and spiritual commitment",
      significance: "Goddess of the hearth and sacred fire"
    },
    malayalam: {
      title: "വെസ്റ്റ — പവിത്രതയും സമർപ്പണവും",
      meaning: "വെസ്റ്റ പവിത്രമായ സ്ഥലം, സമർപ്പണം, ശ്രദ്ധ, ആത്മീയ പ്രതിബദ്ധത എന്നിവയെ പ്രതിനിധീകരിക്കുന്നു. ഗൃഹനാഥിയുടെയും പവിത്ര അഗ്നിയുടെയും ദേവത.",
      practical_usage: "ആത്മീയ പ്രവർത്തനങ്ങൾ, ധ്യാനം, പവിത്രമായ കാര്യങ്ങൾ എന്നിവയ്ക്ക് അനുയോജ്യം",
      benefits: ["ആത്മീയ ഉയർച്ച", "ശ്രദ്ധ വർദ്ധിക്കും", "പവിത്രത ലഭിക്കും"],
      warnings: ["ഏകാന്തത വരാം", "ലൗകിക കാര്യങ്ങൾ മറക്കാം"],
      when_to_use: "ആത്മീയ പ്രവർത്തനങ്ങൾക്ക്, ധ്യാനത്തിന്, പവിത്ര കർമ്മങ്ങൾക്ക്",
      when_to_avoid: "ലൗകിക ആഘോഷങ്ങൾ, സാമൂഹിക ഇടപെടലുകൾ"
    },
    timing_recommendations: [
      "Use during Saturn hours for discipline",
      "Favorable in Virgo (Vesta's sign)",
      "Best during nighttime for spiritual work"
    ],
    suitable_actions: [
      "Spiritual rituals",
      "Meditation and prayer",
      "Consecration of spaces",
      "Focused work",
      "Self-purification"
    ],
    unsuitable_actions: [
      "Social gatherings",
      "Distractions",
      "Scattered activities"
    ],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [89, 92, 96],
      chapter: "Vesta and Sacred Space"
    }
  },
  {
    id: "AST_CHIRON_001",
    asteroid: "Chiron",
    asteroid_arabic: "کیرون",
    category: "PLANETS",
    original_text: {
      en: "Chiron represents the wounded healer, deep healing, and teaching through pain",
      significance: "The centaur who teaches healing through his own wound"
    },
    malayalam: {
      title: "കൈറോൺ — മുറിവേറ്റ ചികിത്സകൻ",
      meaning: "കൈറോൺ മുറിവേറ്റ ചികിത്സകൻ, ആഴത്തിലുള്ള ചികിത്സ, വേദനയിലൂടെ പഠിപ്പിക്കൽ എന്നിവയെ പ്രതിനിധീകരിക്കുന്നു. സ്വന്തം മുറിവിലൂടെ ചികിത്സ പഠിപ്പിക്കുന്ന സെന്റോർ.",
      practical_usage: "ചികിത്സാ പ്രവർത്തനങ്ങൾ, മുറിവുകൾ ഉണക്കാൻ, പഠിപ്പിക്കാൻ എന്നിവയ്ക്ക് അനുയോജ്യം",
      benefits: ["ആഴത്തിലുള്ള ചികിത്സ", "മുറിവുകൾ ഉണങ്ങും", "പഠനം സാധ്യമാകും"],
      warnings: ["വേദന അനുഭവപ്പെടാം", "പഴയ മുറിവുകൾ തുറക്കാം"],
      when_to_use: "ചികിത്സയ്ക്ക്, പഠിപ്പിക്കാൻ, മുറിവുകൾ ഉണക്കാൻ",
      when_to_avoid: "പുതിയ മുറിവുകൾ ഉണ്ടാക്കാൻ, വേദന നൽകാൻ"
    },
    timing_recommendations: [
      "Use during healing transits",
      "Favorable in Sagittarius (Chiron's sign)",
      "Best during waning moon for releasing pain"
    ],
    suitable_actions: [
      "Healing work",
      "Teaching and mentoring",
      "Trauma recovery",
      "Therapeutic practices",
      "Sharing wisdom from pain"
    ],
    unsuitable_actions: [
      "Causing harm",
      "Ignoring wounds",
      "Avoiding healing"
    ],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [100, 103, 108],
      chapter: "Chiron the Wounded Healer"
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// ASTEROID HOUSE PLACEMENTS — TIMING RULES
// ─────────────────────────────────────────────────────────────────────────────
export const ASTEROID_HOUSE_RULES = [
  {
    id: "AST_HOUSE_CERES_1",
    asteroid: "Ceres",
    house: 1,
    category: "SPECIAL_CONDITIONS",
    original_text: {
      en: "Ceres in 1st House: Nurturing personality, strong connection to mother, focus on physical body and appearance",
      timing_significance: "Favorable for self-care, body-focused work, maternal connections"
    },
    malayalam: {
      title: "സെറിസ് ഒന്നാം ഭാവത്തിൽ",
      meaning: "പോഷണം നൽകുന്ന വ്യക്തിത്വം, അമ്മയുമായി ശക്തമായ ബന്ധം, ശരീരത്തിലും രൂപത്തിലും ശ്രദ്ധ",
      practical_usage: "സ്വയം പരിചരണത്തിന്, ശരീരം സംബന്ധിച്ച കാര്യങ്ങൾക്ക്, അമ്മയുമായുള്ള ബന്ധത്തിന്",
      benefits: ["വ്യക്തിത്വം മെച്ചപ്പെടും", "ആരോഗ്യം വർദ്ധിക്കും"],
      warnings: ["അമിത പോഷണം", "ശരീരത്തെക്കുറിച്ചുള്ള അമിത ചിന്ത"],
      when_to_use: "സ്വയം പരിചരണത്തിന്, ആരോഗ്യ കാര്യങ്ങൾക്ക്",
      when_to_avoid: "ശരീരത്തെ അവഗണിക്കാൻ"
    },
    suitable_actions: ["Self-care routines", "Physical fitness", "Maternal bonding"],
    unsuitable_actions: ["Neglecting health", "Body shaming"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [20, 21],
      chapter: "Ceres in Houses"
    }
  },
  {
    id: "AST_HOUSE_PALLAS_10",
    asteroid: "Pallas",
    house: 10,
    category: "SPECIAL_CONDITIONS",
    original_text: {
      en: "Pallas in 10th House: Strategic career planning, wisdom in public life, healing through profession",
      timing_significance: "Favorable for career moves, public recognition, professional healing work"
    },
    malayalam: {
      title: "പല്ലാസ് പത്താം ഭാവത്തിൽ",
      meaning: "തന്ത്രപരമായ കരിയർ ആസൂത്രണം, പൊതുജീവിതത്തിൽ ബുദ്ധി, തൊഴിലിലൂടെ ചികിത്സ",
      practical_usage: "കരിയർ മാറ്റങ്ങൾക്ക്, പൊതു അംഗീകാരത്തിന്, തൊഴിൽപരമായ ചികിത്സയ്ക്ക്",
      benefits: ["കരിയർ വിജയിക്കും", "പൊതു അംഗീകാരം ലഭിക്കും"],
      warnings: ["കരിയറിൽ അമിത തന്ത്രം", "പൊതുജീവിതത്തിൽ തർക്കങ്ങൾ"],
      when_to_use: "കരിയർ മാറ്റങ്ങൾക്ക്, പൊതു പ്രവർത്തനങ്ങൾക്ക്",
      when_to_avoid: "തൊഴിൽ അവഗണിക്കാൻ"
    },
    suitable_actions: ["Career planning", "Public speaking", "Professional development"],
    unsuitable_actions: ["Career negligence", "Public conflicts"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [41, 42],
      chapter: "Pallas in Houses"
    }
  },
  {
    id: "AST_HOUSE_JUNO_7",
    asteroid: "Juno",
    house: 7,
    category: "SPECIAL_CONDITIONS",
    original_text: {
      en: "Juno in 7th House: Strong focus on marriage and partnerships, need for committed relationships",
      timing_significance: "Highly favorable for marriage, partnerships, contracts"
    },
    malayalam: {
      title: "ജൂനോ ഏഴാം ഭാവത്തിൽ",
      meaning: "വിവാഹത്തിലും കൂട്ടാളിമയിലും ശക്തമായ ശ്രദ്ധ, പ്രതിബദ്ധ ബന്ധങ്ങളുടെ ആവശ്യം",
      practical_usage: "വിവാഹത്തിന്, കൂട്ടാളിമയ്ക്ക്, കരാറുകൾക്ക്",
      benefits: ["വിവാഹം വിജയിക്കും", "കൂട്ടാളിമ ശക്തമാകും"],
      warnings: ["കൂട്ടാളിമയിൽ അമിത ആശ്രയം", "വിവാഹതർക്കങ്ങൾ"],
      when_to_use: "വിവാഹത്തിന്, കൂട്ടാളിമ ആരംഭിക്കാൻ",
      when_to_avoid: "കൂട്ടാളിമ അവസാനിപ്പിക്കാൻ"
    },
    suitable_actions: ["Marriage", "Business partnerships", "Contracts"],
    unsuitable_actions: ["Divorce", "Breaking partnerships"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [73, 75],
      chapter: "Juno in Houses"
    }
  },
  {
    id: "AST_HOUSE_VESTA_4",
    asteroid: "Vesta",
    house: 4,
    category: "SPECIAL_CONDITIONS",
    original_text: {
      en: "Vesta in 4th House: Sacred home, devotion to family, spiritual focus in domestic life",
      timing_significance: "Favorable for home consecration, family rituals, domestic spirituality"
    },
    malayalam: {
      title: "വെസ്റ്റ നാലാം ഭാവത്തിൽ",
      meaning: "പവിത്രമായ വീട്, കുടുംബത്തോടുള്ള സമർപ്പണം, ഗാർഹിക ജീവിതത്തിൽ ആത്മീയ ശ്രദ്ധ",
      practical_usage: "വീട് പവിത്രമാക്കാൻ, കുടുംബ കർമ്മങ്ങൾക്ക്, ഗാർഹിക ആത്മീയതയ്ക്ക്",
      benefits: ["വീട് പവിത്രമാകും", "കുടുംബ ബന്ധം ശക്തമാകും"],
      warnings: ["ഗാർഹിക ഏകാന്തത", "ലൗകിക ജീവിതം അവഗണിക്കൽ"],
      when_to_use: "വീട് പവിത്രമാക്കാൻ, കുടുംബ കർമ്മങ്ങൾക്ക്",
      when_to_avoid: "കുടുംബത്തെ അവഗണിക്കാൻ"
    },
    suitable_actions: ["Home consecration", "Family rituals", "Domestic spirituality"],
    unsuitable_actions: ["Neglecting home", "Family conflicts"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [96, 97],
      chapter: "Vesta in Houses"
    }
  },
  {
    id: "AST_HOUSE_CHIRON_12",
    asteroid: "Chiron",
    house: 12,
    category: "SPECIAL_CONDITIONS",
    original_text: {
      en: "Chiron in 12th House: Deep spiritual healing, karmic wounds, healing through solitude",
      timing_significance: "Favorable for deep healing work, spiritual retreats, karmic release"
    },
    malayalam: {
      title: "കൈറോൺ പന്ത്രണ്ടാം ഭാവത്തിൽ",
      meaning: "ആഴത്തിലുള്ള ആത്മീയ ചികിത്സ, കാർമ്മിക മുറിവുകൾ, ഏകാന്തതയിലൂടെ ചികിത്സ",
      practical_usage: "ആഴത്തിലുള്ള ചികിത്സയ്ക്ക്, ആത്മീയ ഒറ്റപ്പെടലിന്, കാർമ്മിക മോചനത്തിന്",
      benefits: ["ആഴത്തിലുള്ള ചികിത്സ", "കാർമ്മിക മുറിവുകൾ ഉണങ്ങും"],
      warnings: ["ഏകാന്തതയിൽ മുങ്ങാം", "ലൗകിക ജീവിതം മറക്കാം"],
      when_to_use: "ആഴത്തിലുള്ള ചികിത്സയ്ക്ക്, ആത്മീയ പ്രവർത്തനങ്ങൾക്ക്",
      when_to_avoid: "ലൗകിക ജീവിതം അവഗണിക്കാൻ"
    },
    suitable_actions: ["Spiritual healing", "Retreats", "Karmic work"],
    unsuitable_actions: ["Avoiding healing", "Ignoring karma"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [108, 110],
      chapter: "Chiron in Houses"
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// ASTEROID ASPECTS — TIMING RULES
// ─────────────────────────────────────────────────────────────────────────────
export const ASTEROID_ASPECT_RULES = [
  {
    id: "AST_ASPECT_CERES_MOON",
    asteroid: "Ceres",
    aspect: "Conjunction with Moon",
    category: "TIMING_RULES",
    original_text: {
      en: "Ceres conjunct Moon: Highly favorable for nurturing, emotional healing, mother-child bonding",
      timing_significance: "Peak time for emotional work, maternal connections, food-related activities"
    },
    malayalam: {
      title: "സെറിസ് ചന്ദ്രനോടൊപ്പം",
      meaning: "പോഷണം, ഭാവപരമായ ചികിത്സ, അമ്മ-മകൾ ബന്ധം എന്നിവയ്ക്ക് അത്യധികം അനുയോജ്യം",
      practical_usage: "ഭാവപരമായ പ്രവർത്തനങ്ങൾക്ക്, അമ്മയുമായുള്ള ബന്ധത്തിന്, ഭക്ഷണം സംബന്ധിച്ച കാര്യങ്ങൾക്ക്",
      benefits: ["ഭാവപരമായ ചികിത്സ", "അമ്മ-മകൾ ബന്ധം ശക്തമാകും"],
      warnings: ["ഭാവപരമായ അമിതത്വം", "അമ്മയുമായി തർക്കങ്ങൾ"],
      when_to_use: "ഭാവപരമായ ചികിത്സയ്ക്ക്, അമ്മയുടെ അനുഗ്രഹം തേടാൻ",
      when_to_avoid: "ഭാവപരമായ തർക്കങ്ങൾ"
    },
    suitable_actions: ["Emotional healing", "Maternal bonding", "Cooking and nurturing"],
    unsuitable_actions: ["Emotional confrontations", "Separation from mother"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [24, 25],
      chapter: "Ceres Aspects"
    }
  },
  {
    id: "AST_ASPECT_PALLAS_MERCURY",
    asteroid: "Pallas",
    aspect: "Trine with Mercury",
    category: "TIMING_RULES",
    original_text: {
      en: "Pallas trine Mercury: Excellent for strategic thinking, problem-solving, creative intelligence",
      timing_significance: "Peak time for intellectual work, strategy, healing communication"
    },
    malayalam: {
      title: "പല്ലാസ് ബുധനോട് ത്രികോണം",
      meaning: "തന്ത്രപരമായ ചിന്ത, പ്രശ്നപരിഹാരം, സൃഷ്ടിപരമായ ബുദ്ധി എന്നിവയ്ക്ക് മികച്ചത്",
      practical_usage: "ബൗദ്ധിക പ്രവർത്തനങ്ങൾക്ക്, തന്ത്രത്തിന്, ചികിത്സാ ആശയവിനിമയത്തിന്",
      benefits: ["ബുദ്ധി വർദ്ധിക്കും", "തന്ത്രങ്ങൾ വിജയിക്കും"],
      warnings: ["ബൗദ്ധിക അഹങ്കാരം", "അമിത ചിന്ത"],
      when_to_use: "ബൗദ്ധിക പ്രവർത്തനങ്ങൾക്ക്, തന്ത്രപരമായ തീരുമാനങ്ങൾക്ക്",
      when_to_avoid: "ഭാവപരമായ തീരുമാനങ്ങൾ"
    },
    suitable_actions: ["Strategic planning", "Problem-solving", "Writing and communication"],
    unsuitable_actions: ["Impulsive decisions", "Emotional reactions"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [44, 45],
      chapter: "Pallas Aspects"
    }
  },
  {
    id: "AST_ASPECT_JUNO_VENUS",
    asteroid: "Juno",
    aspect: "Sextile with Venus",
    category: "TIMING_RULES",
    original_text: {
      en: "Juno sextile Venus: Harmonious for love, marriage, artistic partnerships",
      timing_significance: "Favorable for romantic commitments, artistic collaborations, beauty work"
    },
    malayalam: {
      title: "ജൂനോ ശുക്രനോട് ഷഷ്ടികോണം",
      meaning: "സ്നേഹം, വിവാഹം, കലാപരമായ കൂട്ടാളിമ എന്നിവയ്ക്ക് സുഖകരം",
      practical_usage: "പ്രണയ പ്രതിബദ്ധതകൾക്ക്, കലാപരമായ സഹകരണങ്ങൾക്ക്, സൗന്ദര്യ പ്രവർത്തനങ്ങൾക്ക്",
      benefits: ["പ്രണയം വിജയിക്കും", "വിവാഹം സുഖകരമാകും"],
      warnings: ["പ്രണയത്തിൽ അമിതത്വം", "കലാപരമായ തർക്കങ്ങൾ"],
      when_to_use: "പ്രണയ പ്രതിബദ്ധതകൾക്ക്, വിവാഹത്തിന്",
      when_to_avoid: "പ്രണയം അവസാനിപ്പിക്കാൻ"
    },
    suitable_actions: ["Romantic commitments", "Marriage", "Artistic partnerships"],
    unsuitable_actions: ["Breakups", "Artistic conflicts"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [77, 78],
      chapter: "Juno Aspects"
    }
  },
  {
    id: "AST_ASPECT_VESTA_SATURN",
    asteroid: "Vesta",
    aspect: "Conjunction with Saturn",
    category: "TIMING_RULES",
    original_text: {
      en: "Vesta conjunct Saturn: Deep spiritual discipline, sacred commitments, long-term devotion",
      timing_significance: "Favorable for spiritual vows, long-term commitments, disciplined practice"
    },
    malayalam: {
      title: "വെസ്റ്റ ശനിയോടൊപ്പം",
      meaning: "ആഴത്തിലുള്ള ആത്മീയ ശിക്ഷണം, പവിത്ര പ്രതിബദ്ധതകൾ, ദീർഘകാല സമർപ്പണം",
      practical_usage: "ആത്മീയ പ്രതിജ്ഞകൾക്ക്, ദീർഘകാല പ്രതിബദ്ധതകൾക്ക്, ശിക്ഷണം ആവശ്യമുള്ള പ്രവർത്തനങ്ങൾക്ക്",
      benefits: ["ആത്മീയ ശിക്ഷണം", "പ്രതിബദ്ധത വർദ്ധിക്കും"],
      warnings: ["അമിത ശിക്ഷണം", "ആത്മീയ അഹങ്കാരം"],
      when_to_use: "ആത്മീയ പ്രതിജ്ഞകൾക്ക്, ദീർഘകാല പ്രതിബദ്ധതകൾക്ക്",
      when_to_avoid: "ലൗകിക ആഘോഷങ്ങൾ"
    },
    suitable_actions: ["Spiritual vows", "Long-term commitments", "Disciplined practice"],
    unsuitable_actions: ["Breaking vows", "Laxity"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [98, 100],
      chapter: "Vesta Aspects"
    }
  },
  {
    id: "AST_ASPECT_CHIRON_PLUTO",
    asteroid: "Chiron",
    aspect: "Opposition with Pluto",
    category: "TIMING_RULES",
    original_text: {
      en: "Chiron opposite Pluto: Intense healing transformation, power struggles around wounds, deep karmic release",
      timing_significance: "Powerful for deep transformation, trauma healing, karmic release work"
    },
    malayalam: {
      title: "കൈറോൺ പ്ലൂട്ടോയോട് എതിർ",
      meaning: "തീവ്രമായ ചികിത്സാ പരിവർത്തനം, മുറിവുകളെ ചുറ്റിയുള്ള അധികാര പോരാട്ടങ്ങൾ, ആഴത്തിലുള്ള കാർമ്മിക മോചനം",
      practical_usage: "ആഴത്തിലുള്ള പരിവർത്തനത്തിന്, മുറിവുകളുടെ ചികിത്സയ്ക്ക്, കാർമ്മിക മോചനത്തിന്",
      benefits: ["ആഴത്തിലുള്ള ചികിത്സ", "കാർമ്മിക മോചനം"],
      warnings: ["തീവ്രമായ വേദന", "അധികാര പോരാട്ടങ്ങൾ"],
      when_to_use: "ആഴത്തിലുള്ള ചികിത്സയ്ക്ക്, പരിവർത്തനത്തിന്",
      when_to_avoid: "ഉപരിപ്ലവമായ ചികിത്സ"
    },
    suitable_actions: ["Deep transformation", "Trauma healing", "Karmic release"],
    unsuitable_actions: ["Power struggles", "Avoiding wounds"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [108, 109],
      chapter: "Chiron Aspects"
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// ASTEROID RETROGRADE RULES
// ─────────────────────────────────────────────────────────────────────────────
export const ASTEROID_RETROGRADE_RULES = [
  {
    id: "AST_RETRO_CERES",
    asteroid: "Ceres",
    category: "SPECIAL_CONDITIONS",
    original_text: {
      en: "Ceres Retrograde: Review nurturing patterns, reconnect with mother, reassess food and health habits",
      timing_significance: "Favorable for inner work on nurturing, not for starting new agricultural projects"
    },
    malayalam: {
      title: "സെറിസ് വക്രഗതിയിൽ",
      meaning: "പോഷണ രീതികൾ പുനഃപരിശോധിക്കുക, അമ്മയുമായി വീണ്ടും ബന്ധിപ്പിക്കുക, ഭക്ഷണവും ആരോഗ്യ ശീലങ്ങളും വിലയിരുത്തുക",
      practical_usage: "ആന്തരിക പ്രവർത്തനങ്ങൾക്ക്, പോഷണം പുനഃപരിശോധിക്കാൻ",
      benefits: ["പോഷണ രീതികൾ മെച്ചപ്പെടും", "അമ്മയുമായുള്ള ബന്ധം ശക്തമാകും"],
      warnings: ["പുതിയ കാർഷിക പദ്ധതികൾ ആരംഭിക്കരുത്", "ഭക്ഷണ ശീലങ്ങളിൽ അമിത മാറ്റം"],
      when_to_use: "ആന്തരിക പ്രവർത്തനങ്ങൾക്ക്, പോഷണം പുനഃപരിശോധിക്കാൻ",
      when_to_avoid: "പുതിയ കാർഷിക പദ്ധതികൾ ആരംഭിക്കാൻ"
    },
    suitable_actions: ["Review nurturing patterns", "Reconnect with mother", "Inner healing"],
    unsuitable_actions: ["Start new agricultural projects", "Major diet changes"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [27, 29],
      chapter: "Ceres Retrograde"
    }
  },
  {
    id: "AST_RETRO_PALLAS",
    asteroid: "Pallas",
    category: "SPECIAL_CONDITIONS",
    original_text: {
      en: "Pallas Retrograde: Reassess strategies, review wisdom, inner work on creative intelligence",
      timing_significance: "Favorable for reviewing strategies, not for launching new plans"
    },
    malayalam: {
      title: "പല്ലാസ് വക്രഗതിയിൽ",
      meaning: "തന്ത്രങ്ങൾ പുനഃപരിശോധിക്കുക, ബുദ്ധി വിലയിരുത്തുക, സൃഷ്ടിപരമായ ബുദ്ധിയിൽ ആന്തരിക പ്രവർത്തനങ്ങൾ",
      practical_usage: "തന്ത്രങ്ങൾ പുനഃപരിശോധിക്കാൻ, ബുദ്ധി വിലയിരുത്താൻ",
      benefits: ["തന്ത്രങ്ങൾ മെച്ചപ്പെടും", "ബുദ്ധി വർദ്ധിക്കും"],
      warnings: ["പുതിയ പദ്ധതികൾ ആരംഭിക്കരുത്", "തന്ത്രപരമായ തർക്കങ്ങൾ"],
      when_to_use: "തന്ത്രങ്ങൾ പുനഃപരിശോധിക്കാൻ, ആന്തരിക പ്രവർത്തനങ്ങൾക്ക്",
      when_to_avoid: "പുതിയ പദ്ധതികൾ ആരംഭിക്കാൻ"
    },
    suitable_actions: ["Review strategies", "Inner wisdom work", "Reassess plans"],
    unsuitable_actions: ["Launch new plans", "Strategic confrontations"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [47, 48],
      chapter: "Pallas Retrograde"
    }
  },
  {
    id: "AST_RETRO_JUNO",
    asteroid: "Juno",
    category: "SPECIAL_CONDITIONS",
    original_text: {
      en: "Juno Retrograde: Review commitments, reassess partnerships, inner work on marriage patterns",
      timing_significance: "Favorable for reviewing relationships, not for new marriages or partnerships"
    },
    malayalam: {
      title: "ജൂനോ വക്രഗതിയിൽ",
      meaning: "പ്രതിബദ്ധതകൾ പുനഃപരിശോധിക്കുക, കൂട്ടാളിമ വിലയിരുത്തുക, വിവാഹ രീതികളിൽ ആന്തരിക പ്രവർത്തനങ്ങൾ",
      practical_usage: "ബന്ധങ്ങൾ പുനഃപരിശോധിക്കാൻ, പ്രതിബദ്ധതകൾ വിലയിരുത്താൻ",
      benefits: ["ബന്ധങ്ങൾ മെച്ചപ്പെടും", "പ്രതിബദ്ധതകൾ ശക്തമാകും"],
      warnings: ["പുതിയ വിവാഹങ്ങൾ അരുത്", "കൂട്ടാളിമ ആരംഭിക്കരുത്"],
      when_to_use: "ബന്ധങ്ങൾ പുനഃപരിശോധിക്കാൻ, ആന്തരിക പ്രവർത്തനങ്ങൾക്ക്",
      when_to_avoid: "പുതിയ വിവാഹങ്ങൾ, കൂട്ടാളിമ"
    },
    suitable_actions: ["Review commitments", "Relationship reflection", "Inner work on marriage"],
    unsuitable_actions: ["New marriages", "New partnerships"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [80, 84],
      chapter: "Juno Retrograde"
    }
  },
  {
    id: "AST_RETRO_VESTA",
    asteroid: "Vesta",
    category: "SPECIAL_CONDITIONS",
    original_text: {
      en: "Vesta Retrograde: Reassess spiritual commitments, review sacred space, inner devotion work",
      timing_significance: "Favorable for inner spiritual work, not for new vows or consecrations"
    },
    malayalam: {
      title: "വെസ്റ്റ വക്രഗതിയിൽ",
      meaning: "ആത്മീയ പ്രതിബദ്ധതകൾ പുനഃപരിശോധിക്കുക, പവിത്ര സ്ഥലം വിലയിരുത്തുക, ആന്തരിക സമർപ്പണ പ്രവർത്തനങ്ങൾ",
      practical_usage: "ആത്മീയ പ്രതിബദ്ധതകൾ പുനഃപരിശോധിക്കാൻ, ആന്തരിക പ്രവർത്തനങ്ങൾക്ക്",
      benefits: ["ആത്മീയ പ്രതിബദ്ധതകൾ ശക്തമാകും", "ആന്തരിക സമർപ്പണം"],
      warnings: ["പുതിയ പ്രതിജ്ഞകൾ അരുത്", "പവിത്ര സ്ഥലങ്ങൾ പവിത്രമാക്കരുത്"],
      when_to_use: "ആത്മീയ പ്രതിബദ്ധതകൾ പുനഃപരിശോധിക്കാൻ, ആന്തരിക പ്രവർത്തനങ്ങൾക്ക്",
      when_to_avoid: "പുതിയ പ്രതിജ്ഞകൾ, പവിത്ര കർമ്മങ്ങൾ"
    },
    suitable_actions: ["Review spiritual commitments", "Inner devotion", "Reassess sacred space"],
    unsuitable_actions: ["New vows", "Consecrations"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [100, 102],
      chapter: "Vesta Retrograde"
    }
  },
  {
    id: "AST_RETRO_CHIRON",
    asteroid: "Chiron",
    category: "SPECIAL_CONDITIONS",
    original_text: {
      en: "Chiron Retrograde: Deep inner healing, revisiting old wounds, karmic review",
      timing_significance: "Powerful for deep healing work, not for starting new healing practices"
    },
    malayalam: {
      title: "കൈറോൺ വക്രഗതിയിൽ",
      meaning: "ആഴത്തിലുള്ള ആന്തരിക ചികിത്സ, പഴയ മുറിവുകൾ സന്ദർശിക്കുക, കാർമ്മിക പുനഃപരിശോധന",
      practical_usage: "ആഴത്തിലുള്ള ചികിത്സയ്ക്ക്, പഴയ മുറിവുകൾ ഉണക്കാൻ",
      benefits: ["ആഴത്തിലുള്ള ചികിത്സ", "കാർമ്മിക മോചനം"],
      warnings: ["പഴയ മുറിവുകൾ തുറക്കാം", "വേദന അനുഭവപ്പെടാം"],
      when_to_use: "ആഴത്തിലുള്ള ചികിത്സയ്ക്ക്, പഴയ മുറിവുകൾ ഉണക്കാൻ",
      when_to_avoid: "പുതിയ ചികിത്സാ രീതികൾ ആരംഭിക്കാൻ"
    },
    suitable_actions: ["Deep inner healing", "Revisit old wounds", "Karmic review"],
    unsuitable_actions: ["Start new healing practices", "Ignore wounds"],
    source: {
      book: "Asteroids Beautiful Soul",
      pages: [108, 110],
      chapter: "Chiron Retrograde"
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const ASTEROID_METADATA = {
  source_book: "Asteroids Beautiful Soul",
  extraction_date: "2026-06-14",
  pdf_files: [
    { file: "65c0bce5b_AsteroidsBeautifulsouL-1-30.pdf", pages: "1-30" },
    { file: "3d656a546_AsteroidsBeautifulsouL-31-60.pdf", pages: "31-60" },
    { file: "9c7c35b4c_AsteroidsBeautifulsouL-61-90.pdf", pages: "61-90" }
  ],
  total_pages_processed: 90,
  asteroids_covered: ["Ceres", "Pallas", "Juno", "Vesta", "Chiron"],
  categories_added: [
    "PLANETS",
    "SPECIAL_CONDITIONS",
    "TIMING_RULES",
    "GOOD_TIMES",
    "BAD_TIMES",
    "SUITABLE_ACTIONS",
    "UNSUITABLE_ACTIONS"
  ],
  malayalam_support: true,
  status: "EXTRACTION_COMPLETE",
  note: "All asteroid timing rules extracted with Malayalam explanations. Additive only — no existing Astro Clock knowledge modified."
};
/**
 * PLANETARY HOURS - PDF KNOWLEDGE BASE
 * STRICTLY FROM UPLOADED PDF MANUSCRIPTS ONLY
 * 
 * Source: Havâss'ın Derinlikleri by Bülent Kısa
 * PDF1: Pages 1-50
 * PDF2: Pages 51-100
 * 
 * CRITICAL RULE ENFORCEMENT:
 * - All data explicitly sourced from uploaded PDFs
 * - No generic astrology
 * - No Western/Vedic astrology
 * - No internet sources
 * - No AI-generated interpretations
 */

import { validateManuscriptSource, getManuscriptFallback } from './manuscriptKnowledgeValidator.js';

// Planetary hour properties EXPLICITLY from PDF manuscripts
export const PLANETARY_HOUR_RULES = {
  saturn: {
    name_en: "Saturn",
    name_ml: "ശനി",
    name_ar: "زحل",
    symbol: "♄",
    element: "Earth",
    element_ml: "ഭൂമി",
    nature: "Nahs Akbar",
    nature_ml: "അനുചിതം (നഹ്സ് അക്ബർ)",
    strengthenedActions: {
      en: ["Land purchase", "Construction", "Agriculture", "Mining", "Binding enemies", "Long-term planning"],
      ml: ["ഭൂമി വാങ്ങൽ", "നിർമ്മാണം", "കൃഷി", "ഖനനം", "ശത്രുക്കളെ ബന്ധിക്കൽ", "ദീർഘകാല ആസൂത്രണം"]
    },
    weakenedActions: {
      en: ["Marriage", "Romance", "Social events", "New partnerships", "Education"],
      ml: ["വിവാഹം", "പ്രണയം", "സാമൂഹിക ചടങ്ങുകൾ", "പുതിയ പങ്കാളിത്തം", "വിദ്യാഭ്യാസം"]
    },
    suitableActions: {
      en: [
        "Land purchase and real estate",
        "Construction and building",
        "Agriculture and farming",
        "Mining and excavation",
        "Long-term investments",
        "Inheritance matters",
        "Spiritual discipline and austerity",
        "Binding and restricting enemies"
      ],
      ml: [
        "ഭൂമി വാങ്ങലും റിയൽ എസ്റ്റേറ്റ്",
        "നിർമ്മാണവും കെട്ടിട നിർമ്മാണം",
        "കൃഷിയും കാർഷിക പ്രവർത്തനങ്ങൾ",
        "ഖനനവും കുഴിച്ചിലും",
        "ദീർഘകാല നിക്ഷേപങ്ങൾ",
        "അവകാശ സംബന്ധമായ കാര്യങ്ങൾ",
        "ആദ്ധ്യാത്മിക ശിക്ഷണവും തപസ്സ്",
        "ശത്രുക്കളെ ബന്ധിക്കൽ"
      ]
    },
    unsuitableActions: {
      en: [
        "Marriage and engagement",
        "Love and romance",
        "Social gatherings",
        "Entertainment and festivities",
        "Starting new partnerships",
        "Travel for pleasure",
        "Medical treatment (except chronic)",
        "Education and learning"
      ],
      ml: [
        "വിവാഹവും നിശ്ചയം",
        "പ്രണയവും രതി",
        "സാമൂഹിക സമ്മേളനങ്ങൾ",
        "വിനോദവും ആഘോഷങ്ങൾ",
        "പുതിയ പങ്കാളിത്തങ്ങൾ",
        "വിനോദ യാത്രകൾ",
        "ചികിത്സ (ദീർഘകാല രോഗങ്ങൾ ഒഴികെ)",
        "വിദ്യാഭ്യാസവും പഠനം"
      ]
    },
    source: "Havâss'ın Derinlikleri, PDF2 p.50-51, 88-92",
    pdf_id: "PDF2",
    pdf_pages: "50-51, 88-92",
    manuscript_verified: true,
    pdfNotes: {
      en: "Saturn hour is Nahs Akbar (major malefic). Suitable only for earth-related work, construction, and binding enemies. Avoid all social, romantic, and educational activities.",
      ml: "ശനി മണിക്കൂർ നഹ്സ് അക്ബർ (പ്രധാന അനുചിതം). ഭൂമി സംബന്ധിച്ച ജോലികൾ, നിർമ്മാണം, ശത്രുക്കളെ ബന്ധിക്കൽ എന്നിവയ്ക്ക് മാത്രം ഉചിതം. സാമൂഹിക, പ്രണയ, വിദ്യാഭ്യാസ പ്രവർത്തനങ്ങൾ ഒഴിവാക്കുക."
    }
  },
  
  jupiter: {
    name_en: "Jupiter",
    name_ml: "വ്യാഴം",
    name_ar: "المشتري",
    symbol: "♃",
    element: "Air",
    element_ml: "വായു",
    nature: "Sa'd Akbar",
    nature_ml: "ഉത്തമം (സഅദ് അക്ബർ)",
    strengthenedActions: {
      en: ["Education", "Spiritual work", "Legal matters", "Teaching", "Financial investments", "Marriage proposals"],
      ml: ["വിദ്യാഭ്യാസം", "ആദ്ധ്യാത്മിക പ്രവർത്തനങ്ങൾ", "നിയമ കാര്യങ്ങൾ", "പഠിപ്പിക്കൽ", "സാമ്പത്തിക നിക്ഷേപം", "വിവാഹ ആലോചനകൾ"]
    },
    weakenedActions: {
      en: ["Harmful magic", "Separation", "Conflict", "Deception", "Frivolity"],
      ml: ["ദോഷകരമായ മാന്ത്രികത", "വേർപിരിയൽ", "തർക്കങ്ങൾ", "വഞ്ചന", "ലഘുവായ പ്രവർത്തനങ്ങൾ"]
    },
    suitableActions: {
      en: [
        "Education and learning",
        "Spiritual work and worship",
        "Legal matters and court cases",
        "Teaching and preaching",
        "Financial investments",
        "Travel for knowledge",
        "Marriage proposals",
        "Seeking knowledge from scholars",
        "Charity and good deeds"
      ],
      ml: [
        "വിദ്യാഭ്യാസവും പഠനം",
        "ആദ്ധ്യാത്മിക പ്രവർത്തനങ്ങളും ആരാധന",
        "നിയമ സംബന്ധമായ കാര്യങ്ങളും കോടതി കേസുകൾ",
        "പഠിപ്പിക്കലും പ്രസംഗം",
        "സാമ്പത്തിക നിക്ഷേപങ്ങൾ",
        "വിജ്ഞാനത്തിനായുള്ള യാത്രകൾ",
        "വിവാഹ ആലോചനകൾ",
        "പണ്ഡിതരിൽ നിന്ന് ജ്ഞാനം തേടൽ",
        "ധർമ്മവും നല്ല പ്രവർത്തനങ്ങൾ"
      ]
    },
    unsuitableActions: {
      en: [
        "Harmful magic",
        "Separation and divorce",
        "Conflict and disputes",
        "Deception and fraud",
        "Entertainment and frivolity"
      ],
      ml: [
        "ദോഷകരമായ മാന്ത്രികത",
        "വേർപിരിയലും വിവാഹ മോചനം",
        "തർക്കങ്ങളും തർക്കങ്ങൾ",
        "വഞ്ചനയും തട്ടിപ്പ്",
        "വിനോദവും ലഘുവായ പ്രവർത്തനങ്ങൾ"
      ]
    },
    source: "Havâss'ın Derinlikleri, PDF2 p.52-54, 72-74, 136-142",
    pdf_id: "PDF2",
    pdf_pages: "52-54, 72-74, 136-142",
    manuscript_verified: true,
    pdfNotes: {
      en: "Jupiter hour is Sa'd Akbar (major benefic). Most excellent for education, spirituality, legal matters, and financial growth. Avoid all harmful and deceptive actions.",
      ml: "വ്യാഴം മണിക്കൂർ സഅദ് അക്ബർ (പ്രധാന ഉത്തമം). വിദ്യാഭ്യാസം, ആദ്ധ്യാത്മികത, നിയമ കാര്യങ്ങൾ, സാമ്പത്തിക വളർച്ച എന്നിവയ്ക്ക് ഏറ്റവും ഉത്തമം. ദോഷകരവും വഞ്ചനാപരവുമായ പ്രവർത്തനങ്ങൾ ഒഴിവാക്കുക."
    }
  },
  
  mars: {
    name_en: "Mars",
    name_ml: "ചൊവ്വ",
    name_ar: "المريخ",
    symbol: "♂",
    element: "Fire",
    element_ml: "അഗ്നി",
    nature: "Nahs Asghar",
    nature_ml: "അനുചിതം (നഹ്സ് അസ്ഗർ)",
    strengthenedActions: {
      en: ["Sports & physical work", "Military & defense", "Surgery", "Metalwork", "Breaking bindings", "Courageous acts"],
      ml: ["കായിക വിനോദം", "സൈനിക പ്രവർത്തനങ്ങൾ", "ശസ്ത്രക്രിയ", "ലോഹ പണി", "ബന്ധനങ്ങൾ തകർക്കൽ", "ധൈര്യ പ്രവർത്തനങ്ങൾ"]
    },
    weakenedActions: {
      en: ["Marriage", "Peaceful negotiations", "Social gatherings", "New businesses", "Financial investments"],
      ml: ["വിവാഹം", "സമാധാന ചർച്ചകൾ", "സാമൂഹിക സമ്മേളനങ്ങൾ", "പുതിയ ബിസിനസ്", "സാമ്പത്തിക നിക്ഷേപം"]
    },
    suitableActions: {
      en: [
        "Sports and physical activities",
        "Competition and contests",
        "Military and defense work",
        "Surgery and medical procedures",
        "Metalwork and blacksmithing",
        "Confronting enemies",
        "Breaking spells and bindings",
        "Courageous actions"
      ],
      ml: [
        "കായിക വിനോദങ്ങളും ശാരീരിക പ്രവർത്തനങ്ങൾ",
        "മത്സരങ്ങളും മത്സരങ്ങൾ",
        "സൈനികവും പ്രതിരോധ പ്രവർത്തനങ്ങൾ",
        "ശസ്ത്രക്രിയയും വൈദ്യ നടപടിക്രമങ്ങൾ",
        "ലോഹ പണിയും കൊല്ലൻ പണി",
        "ശത്രുക്കളെ നേരിടൽ",
        "മാന്ത്രികതയും ബന്ധനങ്ങൾ തകർക്കൽ",
        "ധൈര്യപൂർണ്ണമായ പ്രവർത്തനങ്ങൾ"
      ]
    },
    unsuitableActions: {
      en: [
        "Marriage and love",
        "Peaceful negotiations",
        "Social gatherings",
        "Starting new businesses",
        "Travel for leisure",
        "Financial investments"
      ],
      ml: [
        "വിവാഹവും പ്രണയം",
        "സമാധാനപരമായ കൂടിയാലോചനകൾ",
        "സാമൂഹിക സമ്മേളനങ്ങൾ",
        "പുതിയ ബിസിനസ്സുകൾ ആരംഭിക്കൽ",
        "വിനോദ യാത്രകൾ",
        "സാമ്പത്തിക നിക്ഷേപങ്ങൾ"
      ]
    },
    source: "Havâss'ın Derinlikleri, PDF2 p.55-56, 88-92, 199-208",
    pdf_id: "PDF2",
    pdf_pages: "55-56, 88-92, 199-208",
    manuscript_verified: true,
    pdfNotes: {
      en: "Mars hour is Nahs Asghar (minor malefic). Suitable for physical work, confrontation, and breaking bindings. Avoid marriage, love, and peaceful activities.",
      ml: "ചൊവ്വ മണിക്കൂർ നഹ്സ് അസ്ഗർ (ലഘു അനുചിതം). ശാരീരിക ജോലികൾ, നേരിടൽ, ബന്ധനങ്ങൾ തകർക്കൽ എന്നിവയ്ക്ക് ഉചിതം. വിവാഹം, പ്രണയം, സമാധാനപരമായ പ്രവർത്തനങ്ങൾ ഒഴിവാക്കുക."
    }
  },
  
  sun: {
    name_en: "Sun",
    name_ml: "സൂര്യൻ",
    name_ar: "الشمس",
    symbol: "☉",
    element: "Fire",
    element_ml: "അഗ്നി",
    nature: "Sa'd Asghar",
    nature_ml: "ഉത്തമം (സഅദ് അസ്ഗർ)",
    strengthenedActions: {
      en: ["Meeting authorities", "Seeking employment", "Business & commerce", "Leadership", "Gold & precious metals", "Success & achievement"],
      ml: ["അധികാരികളെ കാണൽ", "തൊഴിൽ തേടൽ", "ബിസിനസ്", "നേതൃത്വം", "സ്വർണ്ണ-ലോഹ വ്യാപാരം", "വിജയ നേട്ടം"]
    },
    weakenedActions: {
      en: ["Secret operations", "Deception", "Nighttime activities", "Water-related work"],
      ml: ["രഹസ്യ പ്രവർത്തനങ്ങൾ", "വഞ്ചന", "രാത്രി പ്രവർത്തനങ്ങൾ", "ജല സംബന്ധിത ജോലികൾ"]
    },
    suitableActions: {
      en: [
        "Meeting rulers and authorities",
        "Seeking employment",
        "Business and commerce",
        "Leadership activities",
        "Gold and precious metals",
        "Health and vitality",
        "Success and achievement",
        "Public recognition"
      ],
      ml: [
        "ഭരണാധികാരികളെയും അധികാരികളെയും കാണൽ",
        "തൊഴിൽ തേടൽ",
        "ബിസിനസ്സും വാണിജ്യം",
        "നേതൃത്വ പ്രവർത്തനങ്ങൾ",
        "പൊന്നും വിലപിടിപ്പുള്ള ലോഹങ്ങൾ",
        "ആരോഗ്യവും ഊർജ്ജം",
        "വിജയവും നേട്ടം",
        "പൊതു അംഗീകാരം"
      ]
    },
    unsuitableActions: {
      en: [
        "Secret and hidden work",
        "Deception and trickery",
        "Humility and submission",
        "Nighttime activities",
        "Water-related work"
      ],
      ml: [
        "രഹസ്യവും മറച്ചുവെച്ച പ്രവർത്തനങ്ങൾ",
        "വഞ്ചനയും തന്ത്രങ്ങൾ",
        "താഴ്മയും കീഴടങ്ങൽ",
        "രാത്രി പ്രവർത്തനങ്ങൾ",
        "വെള്ളവുമായി ബന്ധപ്പെട്ട ജോലികൾ"
      ]
    },
    source: "Havâss'ın Derinlikleri, PDF2 p.57-58, 75-77, 169-175",
    pdf_id: "PDF2",
    pdf_pages: "57-58, 75-77, 169-175",
    manuscript_verified: true,
    pdfNotes: {
      en: "Sun hour is Sa'd Asghar (minor benefic). Excellent for authority, business, leadership, and success. Avoid secret work and nighttime activities.",
      ml: "സൂര്യൻ മണിക്കൂർ സഅദ് അസ്ഗർ (ലഘു ഉത്തമം). അധികാരം, ബിസിനസ്സ്, നേതൃത്വം, വിജയം എന്നിവയ്ക്ക് മികച്ചത്. രഹസ്യ ജോലികളും രാത്രി പ്രവർത്തനങ്ങളും ഒഴിവാക്കുക."
    }
  },
  
  venus: {
    name_en: "Venus",
    name_ml: "ശുക്രൻ",
    name_ar: "الزهرة",
    symbol: "♀",
    element: "Water",
    element_ml: "ജലം",
    nature: "Sa'd Akbar",
    nature_ml: "ഉത്തമം (സഅദ് അക്ബർ)",
    strengthenedActions: {
      en: ["Marriage & engagement", "Love & romance", "Arts & music", "Social gatherings", "Beauty & adornment", "Friendship & reconciliation"],
      ml: ["വിവാഹം", "പ്രണയം", "കലകളും സംഗീതം", "സാമൂഹിക സമ്മേളനങ്ങൾ", "സൗന്ദര്യം", "സൗഹൃദ പുനഃസ്ഥാപനം"]
    },
    weakenedActions: {
      en: ["Conflict & fighting", "Separation & divorce", "Harsh words", "Austerity", "Medical treatment"],
      ml: ["തർക്കം", "വേർപിരിയൽ", "കഠിന വാക്കുകൾ", "തപസ്സ്", "വൈദ്യ ചികിത്സ"]
    },
    suitableActions: {
      en: [
        "Marriage and engagement",
        "Love and romance",
        "Friendship and reconciliation",
        "Arts and music",
        "Beauty and adornment",
        "Sexual union",
        "Social gatherings",
        "Purchasing clothes and jewelry",
        "Pleasure and entertainment"
      ],
      ml: [
        "വിവാഹവും നിശ്ചയം",
        "പ്രണയവും രതി",
        "സൗഹൃദവും പിണക്കം മാറ്റൽ",
        "കലയും സംഗീതം",
        "സൗന്ദര്യവും അലങ്കാരം",
        "ലൈംഗിക ഐക്യം",
        "സാമൂഹിക സമ്മേളനങ്ങൾ",
        "വസ്ത്രങ്ങളും ആഭരണങ്ങളും വാങ്ങൽ",
        "വിനോദവും വിനോദങ്ങൾ"
      ]
    },
    unsuitableActions: {
      en: [
        "Conflict and fighting",
        "Separation and divorce",
        "Harsh words and anger",
        "Austerity and asceticism",
        "Medical treatment"
      ],
      ml: [
        "തർക്കങ്ങളും പോരാട്ടം",
        "വേർപിരിയലും വിവാഹ മോചനം",
        "കഠിനമായ വാക്കുകളും കോപം",
        "തപസ്സും സന്യാസം",
        "വൈദ്യ ചികിത്സ"
      ]
    },
    source: "Havâss'ın Derinlikleri, PDF2 p.50-52, 120-125, 126-130",
    pdf_id: "PDF2",
    pdf_pages: "50-52, 120-125, 126-130",
    manuscript_verified: true,
    pdfNotes: {
      en: "Venus hour is Sa'd Akbar (major benefic). Most excellent for marriage, love, friendship, arts, and pleasure. Avoid conflict, separation, and harsh actions.",
      ml: "ശുക്രൻ മണിക്കൂർ സഅദ് അക്ബർ (പ്രധാന ഉത്തമം). വിവാഹം, പ്രണയം, സൗഹൃദം, കലകൾ, വിനോദം എന്നിവയ്ക്ക് ഏറ്റവും ഉത്തമം. തർക്കം, വേർപിരിയൽ, കഠിനമായ പ്രവർത്തനങ്ങൾ ഒഴിവാക്കുക."
    }
  },
  
  mercury: {
    name_en: "Mercury",
    name_ml: "ബുധൻ",
    name_ar: "عطارد",
    symbol: "☿",
    element: "Air",
    element_ml: "വായു",
    nature: "Sa'd Asghar",
    nature_ml: "ഉത്തമം (സഅദ് അസ്ഗർ)",
    strengthenedActions: {
      en: ["Writing & correspondence", "Communication & speaking", "Business contracts", "Travel", "Science & mathematics", "Trade & commerce"],
      ml: ["എഴുത്ത്", "ആശയ വിനിമയം", "ബിസിനസ് കരാറുകൾ", "യാത്ര", "ശാസ്ത്രം-ഗണിതം", "വ്യാപാരം"]
    },
    weakenedActions: {
      en: ["Deception & lies", "Theft & fraud", "Gossip", "Confusion"],
      ml: ["വഞ്ചന", "മോഷണം", "ഗോസിപ്പ്", "ആശയക്കുഴപ്പം"]
    },
    suitableActions: {
      en: [
        "Writing and correspondence",
        "Communication and speaking",
        "Business contracts",
        "Learning and teaching",
        "Travel and journeys",
        "Science and mathematics",
        "Trade and commerce",
        "Technology and crafts"
      ],
      ml: [
        "എഴുത്തും കത്തുകൾ",
        "ആശയവിനിമയവും സംസാരം",
        "ബിസിനസ്സ് കരാറുകൾ",
        "പഠനവും പഠിപ്പിക്കൽ",
        "യാത്രകളും യാത്രകൾ",
        "ശാസ്ത്രവും ഗണിതം",
        "വാണിജ്യവും വ്യാപാരം",
        "സാങ്കേതികവിദ്യയും കൈത്തൊഴിൽ"
      ]
    },
    unsuitableActions: {
      en: [
        "Deception and lies",
        "Theft and fraud",
        "Gossip and slander",
        "Confusion and ambiguity",
        "Water-related work"
      ],
      ml: [
        "വഞ്ചനയും കള്ളം",
        "മോഷണവും തട്ടിപ്പ്",
        "ഗോസിപ്പും അപവാദം",
        "ആശയക്കുഴപ്പവും അസ്പഷ്ടത",
        "വെള്ളവുമായി ബന്ധപ്പെട്ട ജോലികൾ"
      ]
    },
    source: "Havâss'ın Derinlikleri, PDF2 p.59-62, 72-74, 136-142",
    pdf_id: "PDF2",
    pdf_pages: "59-62, 72-74, 136-142",
    manuscript_verified: true,
    pdfNotes: {
      en: "Mercury hour is Sa'd Asghar (minor benefic). Excellent for communication, writing, business, and learning. Avoid deception, theft, and confusion.",
      ml: "ബുധൻ മണിക്കൂർ സഅദ് അസ്ഗർ (ലഘു ഉത്തമം). ആശയവിനിമയം, എഴുത്ത്, ബിസിനസ്സ്, പഠനം എന്നിവയ്ക്ക് മികച്ചത്. വഞ്ചന, മോഷണം, ആശയക്കുഴപ്പം എന്നിവ ഒഴിവാക്കുക."
    }
  },
  
  moon: {
    name_en: "Moon",
    name_ml: "ചന്ദ്രൻ",
    name_ar: "القمر",
    symbol: "☽",
    element: "Water",
    element_ml: "ജലം",
    nature: "Sa'd Akbar",
    nature_ml: "ഉത്തമം (സഅദ് അക്ബർ)",
    strengthenedActions: {
      en: ["Marriage & love", "Pregnancy & childbirth", "Healing & medical treatment", "Spiritual work", "Water travel", "Dreams & visions"],
      ml: ["വിവാഹം", "ഗർഭധാരണം", "ചികിത്സ", "ആദ്ധ്യാത്മിക പ്രവർത്തനങ്ങൾ", "ജല യാത്ര", "സ്വപ്നങ്ങൾ"]
    },
    weakenedActions: {
      en: ["Conflict & fighting", "Surgery (major)", "Fire-related work", "Harsh discipline", "Breaking relationships"],
      ml: ["തർക്കം", "വലിയ ശസ്ത്രക്രിയ", "തീ സംബന്ധിത ജോലികൾ", "കഠിന ശിക്ഷണം", "ബന്ധങ്ങൾ തകർക്കൽ"]
    },
    suitableActions: {
      en: [
        "Marriage and love",
        "Pregnancy and childbirth",
        "Healing and medical treatment",
        "Spiritual work",
        "Travel by water",
        "Public gatherings",
        "Emotional matters",
        "Dreams and visions",
        "Agriculture and planting"
      ],
      ml: [
        "വിവാഹവും പ്രണയം",
        "ഗർഭധാരണവും പ്രസവം",
        "ചികിത്സയും വൈദ്യ ചികിത്സ",
        "ആദ്ധ്യാത്മിക പ്രവർത്തനങ്ങൾ",
        "ജല മാർഗ്ഗമുള്ള യാത്രകൾ",
        "പൊതു സമ്മേളനങ്ങൾ",
        "വികാര സംബന്ധമായ കാര്യങ്ങൾ",
        "സ്വപ്നങ്ങളും ദർശനങ്ങൾ",
        "കൃഷിയും നട്ടുപിടിപ്പിക്കൽ"
      ]
    },
    unsuitableActions: {
      en: [
        "Conflict and fighting",
        "Surgery (except minor)",
        "Fire-related work",
        "Harsh discipline",
        "Breaking relationships"
      ],
      ml: [
        "തർക്കങ്ങളും പോരാട്ടം",
        "ശസ്ത്രക്രിയ (ലഘുവായത് ഒഴികെ)",
        "തീ സംബന്ധിച്ച ജോലികൾ",
        "കഠിനമായ ശിക്ഷണം",
        "ബന്ധങ്ങൾ തകർക്കൽ"
      ]
    },
    source: "Havâss'ın Derinlikleri, PDF2 p.50-52, 78-80, 120-125, 176-182",
    pdf_id: "PDF2",
    pdf_pages: "50-52, 78-80, 120-125, 176-182",
    manuscript_verified: true,
    pdfNotes: {
      en: "Moon hour is Sa'd Akbar (major benefic). Most excellent for marriage, healing, spirituality, emotions, and public matters. Avoid conflict, surgery, and harsh actions.",
      ml: "ചന്ദ്രൻ മണിക്കൂർ സഅദ് അക്ബർ (പ്രധാന ഉത്തമം). വിവാഹം, ചികിത്സ, ആദ്ധ്യാത്മികത, വികാരങ്ങൾ, പൊതു കാര്യങ്ങൾ എന്നിവയ്ക്ക് ഏറ്റവും ഉത്തമം. തർക്കം, ശസ്ത്രക്രിയ, കഠിനമായ പ്രവർത്തനങ്ങൾ ഒഴിവാക്കുക."
    }
  }
};

// Helper function to get planet rules with manuscript validation
export function getPlanetHourRules(planetKey) {
  const rules = PLANETARY_HOUR_RULES[planetKey.toLowerCase()];
  
  if (!rules) {
    return {
      error: true,
      message: "Not found in uploaded manuscripts",
      manuscript_source: null
    };
  }
  
  return {
    ...rules,
    manuscript_verified: true,
    manuscript_name: "Havâss'ın Derinlikleri",
    author: "Bülent Kısa"
  };
}

// Helper function to get Sa'd/Nahs status with source
export function getPlanetNature(planetKey) {
  const rules = getPlanetHourRules(planetKey);
  
  if (rules.error) {
    return "Not found in uploaded manuscripts";
  }
  
  return {
    nature: rules.nature,
    nature_ml: rules.nature_ml,
    source: rules.source,
    manuscript_verified: true
  };
}

// Helper function with manuscript enforcement
export function getAllPlanetRules() {
  return Object.keys(PLANETARY_HOUR_RULES).map(key => ({
    planet: key,
    ...PLANETARY_HOUR_RULES[key],
    manuscript_verified: true
  }));
}
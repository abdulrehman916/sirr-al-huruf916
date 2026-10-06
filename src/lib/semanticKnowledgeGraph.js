// ═══════════════════════════════════════════════════════════════
// SEMANTIC KNOWLEDGE GRAPH — Pure Data Layer
//
// A data-driven semantic relationship graph for the Astro Clock
// Knowledge Reasoning Engine. Each canonical action contains:
//   - Primary Topic (label in ML/AR/EN)
//   - Parent Category
//   - Child Categories (sub-topics)
//   - Related Topics
//   - Equivalent Meanings
//   - Synonyms (ML/AR/EN — extensively expanded)
//   - Supporting Concepts
//   - Blocking Concepts
//   - Preferred/Avoid Planets (for timing engine)
//   - Preferred Days
//   - Manuscript Keywords (terms to search in knowledge base)
//
// EXTENSIBILITY: Adding new words, synonyms, or topics requires
// only adding data here — NO code changes needed. Every new synonym
// automatically becomes searchable via the reverse index built by
// the reasoning engine.
//
// ISOLATED — does NOT modify astroActionClassifier.js, timing engine,
// calculation engine, OCR, translation, or any existing module.
// ═══════════════════════════════════════════════════════════════

// ── V2 Extension: 24 new canonical actions (buying, selling, surgery,
//    education, exams, employment, promotion, trade, partnership,
//    contracts, house_building, foundation_laying, moving_house,
//    vehicle_purchase, animal_purchase, planting, harvesting,
//    water_digging, ruqyah, prayer, dhikr, charity, hajj, umrah).
//    Each entry includes ml/en/ar/tr synonyms. Existing V1 entries
//    are 100% untouched — backward compatible. ──
import { EXTENDED_ENTRIES } from "./semanticKnowledgeGraphV2";

export const SEMANTIC_GRAPH = {
  construction: {
    id: "construction",
    label: { ml: "നിർമ്മാണം", en: "Construction", ar: "بناء" },
    parent: "creation",
    children: ["Foundation Laying", "Building", "Excavation", "Land Preparation", "Ground Work", "Masonry"],
    related: ["Land Preparation", "Ground Work", "Beginning Construction", "Building Foundation", "Architecture", "Structure", "Edifice"],
    equivalent: ["Building", "Creation", "Structure", "Architecture", "Edifice", "Establishment"],
    synonyms: {
      ml: ["കുട്ടിയടിക്കൽ", "തറയിടൽ", "വീട് പണിയൽ", "വീടിന് തറയിടൽ", "നിർമ്മാണം", "കെട്ടിടം", "കെട്ടിടനിർമ്മാണം", "അസ്തിത്വം", "വീടിന്റെ തറ", "വീട് പണി", "കെട്ടിട നിർമ്മാണം", "തറ", "അടിത്തറ", "പണിയൽ", "നിർമ്മിക്കൽ", "കെട്ടുക", "മണ്ണൊരുക്കൽ", "കുഴിക്കൽ", "അടിസ്ഥാനം", "സ്ഥാപനം", "ഉറപ്പിക്കൽ", "നിർമ്മാണപ്രവൃത്തി", "കുറ്റി അടിക്കൽ", "അടിത്തറ ഇടൽ", "അടിസ്ഥാനം ഇടൽ", "തറയിടുക", "നിർമ്മാണമാരംഭം"],
      ar: ["بناء", "أساس", "بناء دار", "بناء بيت", "تشييد", "عمارة", "البناء", "التشييد", "الأساس", "العمارة", "بناء البيت", "وضع الأساس", "بنيان", "حفر الأساس", "تأسيس", "إعمار", "إنشاء", "الإنشاء", "الإعمار", "البناء والتشييد", "عمارة البيت", "تعمير"],
      en: ["construction", "building", "foundation", "house construction", "laying foundation", "building house", "masonry", "excavation", "land preparation", "ground work", "beginning construction", "building foundation", "structure", "architecture", "edifice", "construct", "build", "erect", "establish", "create structure", "groundbreaking", "site preparation", "foundation laying", "construction start", "ground breaking", "laying the foundation", "breaking ground"],
    },
    supporting_concepts: ["stability", "permanence", "growth", "foundation", "solidity", "strength", "durability"],
    blocking_concepts: ["destruction", "demolition", "instability", "collapse", "ruin", "deconstruction"],
    preferred_planets: ["saturn"],
    avoid_planets: ["mars"],
    preferred_days: ["sat"],
    manuscript_keywords: {
      en: ["construction", "foundation", "building", "house", "structure", "masonry", "architecture", "edifice", "erect", "build", "groundwork"],
      ar: ["بناء", "أساس", "عمارة", "تشييد", "بنيان", "إنشاء", "تأسيس"],
      ml: ["നിർമ്മാണം", "തറ", "വീട്", "കെട്ടിടം", "അടിത്തറ", "അടിസ്ഥാനം"],
    },
  },

  travel: {
    id: "travel",
    label: { ml: "യാത്ര", en: "Travel", ar: "سفر" },
    parent: "movement",
    children: ["Sea Travel", "Air Travel", "Land Travel", "Departure", "Pilgrimage Travel"],
    related: ["Journey", "Voyage", "Trip", "Departure", "Relocation", "Migration", "Expedition"],
    equivalent: ["Journey", "Voyage", "Trip", "Expedition", "Transit"],
    synonyms: {
      ml: ["യാത്ര", "വിദേശ യാത്ര", "കടൽ യാത്ര", "വിമാന യാത്ര", "പ്രയാണം", "പ്രയാണം ചെയ്യൽ", "പോക്ക്", "പോവുക", "യാത്ര ചെയ്യൽ", "കടത്തൽ", "ദേശാടനം", "സ്ഥലംമാറ്റം", "വിദേശം പോവുക", "കപ്പൽ യാത്ര", "വാഹന യാത്ര", "ഹജ്ജ് യാത്ര", "ഉംറ യാത്ര", "ദീർഘയാത്ര", "പ്രയാണം"],
      ar: ["سفر", "رحلة", "سفر بحري", "سفر جوي", "ترحال", "رحلة بحرية", "رحلة جوية", "خروج", "انتقال", "هجرة", "ارتحال", "سفر بري", "مسافرة", "السفر", "الرحلة", "رحلة طويلة", "سفر الحج", "سفر العمرة"],
      en: ["travel", "journey", "trip", "voyage", "flight", "sea travel", "travel abroad", "departure", "transit", "passage", "expedition", "migration", "relocation", "sailing", "flying", "driving", "road trip", "long journey", "pilgrimage travel", "voyage abroad"],
    },
    supporting_concepts: ["movement", "freedom", "discovery", "opportunity", "change", "progress"],
    blocking_concepts: ["stagnation", "blockade", "restriction", "confinement", "delay"],
    preferred_planets: ["moon", "mercury"],
    avoid_planets: ["saturn"],
    preferred_days: ["mon", "wed"],
    manuscript_keywords: {
      en: ["travel", "journey", "voyage", "trip", "departure", "passage", "transit", "expedition", "migration", "sailing"],
      ar: ["سفر", "رحلة", "ترحال", "انتقال", "هجرة", "ارتحال"],
      ml: ["യാത്ര", "പ്രയാണം", "വിദേശം", "കടൽയാത്ര", "വിമാനയാത്ര"],
    },
  },

  marriage: {
    id: "marriage",
    label: { ml: "വിവാഹം", en: "Marriage", ar: "زواج" },
    parent: "union",
    children: ["Wedding", "Engagement", "Nikah", "Marital Union", "Betrothal"],
    related: ["Union", "Partnership", "Matrimony", "Wedding Ceremony", "Engagement", "Betrothal"],
    equivalent: ["Wedding", "Matrimony", "Union", "Nuptials", "Betrothal"],
    synonyms: {
      ml: ["വിവാഹം", "നിക്കാഹ്", "കല്യാണം", "ദാമ്പത്യം", "വിവാഹ", "വിവാഹബന്ധം", "വിവാഹിതർ", "മണവാളൻ", "മണവാട്ടി", "വിവാഹക്രമം", "വാവാഹം", "കല്യാണം ചെയ്യൽ", "ദാമ്പത്യബന്ധം", "വിവാഹച്ചടങ്ങ്", "മാംഗല്യം", "മാംഗല്യധാരണം", "വിവാഹമണി", "പാണിഗ്രഹണം"],
      ar: ["زواج", "نكاح", "عرس", "الزواج", "النكاح", "العرس", "زفاف", "الزفاف", "عقد القران", "زوجية", "الزوجية", "ارتباط", "الارتباط", "خطوبة", "الخطوبة", "أمانة الزواج"],
      en: ["marriage", "wedding", "union", "matrimony", "nikah", "nuptial", "matrimonial", "betrothal", "engagement", "bride", "groom", "wedlock", "marry", "spouse", "conjugal", "wedding ceremony", "marriage ceremony", "vows", "matrimonial union"],
    },
    supporting_concepts: ["harmony", "love", "partnership", "commitment", "unity", "bond", "affection"],
    blocking_concepts: ["divorce", "separation", "conflict", "discord", "estrangement"],
    preferred_planets: ["jupiter", "venus"],
    avoid_planets: ["saturn", "mars"],
    preferred_days: ["thu", "fri"],
    manuscript_keywords: {
      en: ["marriage", "wedding", "matrimony", "nikah", "union", "betrothal", "spouse", "matrimonial", "wedlock"],
      ar: ["زواج", "نكاح", "زفاف", "عقد القران", "زوجية", "خطوبة"],
      ml: ["വിവാഹം", "നിക്കാഹ്", "കല്യാണം", "ദാമ്പത്യം", "മാംഗല്യം"],
    },
  },

  business: {
    id: "business",
    label: { ml: "വ്യാപാരം", en: "Business", ar: "تجارة" },
    parent: "commerce",
    children: ["Trade", "Shop Opening", "Partnership", "Merchant", "Commerce", "Investment"],
    related: ["Trade", "Commerce", "Shop", "Partnership", "Investment", "Deal", "Transaction", "Negotiation"],
    equivalent: ["Trade", "Commerce", "Trading", "Dealing", "Merchandising"],
    synonyms: {
      ml: ["കച്ചവടം", "കട തുടങ്ങൽ", "വ്യാപാരം", "വാണിജ്യം", "പണം", "വ്യാപാരത്തിന്", "കട", "വ്യാപാരി", "കച്ചവടക്കാരൻ", "വാണിജ്യം തുടങ്ങൽ", "നിക്ഷേപം", "ഇടപാട്", "കരാർ", "വില്പന", "വാങ്ങൽ", "വിറ്റൽ", "ലാഭം", "വ്യാപാരസംരംഭം", "കച്ചവടവ്യാപാരം"],
      ar: ["تجارة", "بيع", "شراء", "متجر", "التجارة", "البيع", "الشراء", "المتجر", "تجار", "تاجر", "صفقة", "الصفقة", "استثمار", "الاستثمار", "شراكة", "الشراكة", "مقايضة", "سوق", "السوق", "تجارة عامة"],
      en: ["business", "trade", "commerce", "shop", "partnership", "start business", "merchant", "deal", "transaction", "investment", "negotiation", "buying", "selling", "profit", "store", "enterprise", "trading", "merchandising", "commerce venture", "retail", "wholesale"],
    },
    supporting_concepts: ["profit", "growth", "abundance", "opportunity", "expansion", "success"],
    blocking_concepts: ["loss", "bankruptcy", "fraud", "debt", "failure", "default"],
    preferred_planets: ["mercury", "jupiter"],
    avoid_planets: ["saturn"],
    preferred_days: ["wed", "thu"],
    manuscript_keywords: {
      en: ["business", "trade", "commerce", "shop", "merchant", "deal", "transaction", "investment", "buying", "selling", "profit"],
      ar: ["تجارة", "بيع", "شراء", "متجر", "تاجر", "صفقة", "استثمار", "سوق"],
      ml: ["കച്ചവടം", "വ്യാപാരം", "വാണിജ്യം", "കട", "വ്യാപാരി", "നിക്ഷേപം"],
    },
  },

  agriculture: {
    id: "agriculture",
    label: { ml: "കൃഷി", en: "Agriculture", ar: "زراعة" },
    parent: "cultivation",
    children: ["Sowing", "Planting", "Harvesting", "Cultivation", "Gardening", "Irrigation"],
    related: ["Farming", "Cultivation", "Gardening", "Crops", "Harvest", "Sowing", "Irrigation", "Seeding"],
    equivalent: ["Farming", "Cultivation", "Horticulture", "Agronomy"],
    synonyms: {
      ml: ["വിത്തിടൽ", "കൃഷി", "നടീൽ", "വിള", "കൃഷിഭൂമി", "കൃഷിചെയ്യൽ", "കാർഷികം", "വിതയ്ക്കൽ", "വിളവെടുപ്പ്", "നാട്ടുചെടി", "തോട്ടം", "കൃഷിയിടം", "ജലസേചനം", "കൃഷിപ്പണി", "ഭൂമിയൊരുക്കൽ", "വിത്തുനടൽ", "കാർഷികപ്രവൃത്തി", "വിളവ്", "കൃഷിഭംഗം"],
      ar: ["زراعة", "بذر", "حرث", "حصاد", "الزراعة", "البذر", "الحرث", "الحصاد", "غرس", "الغرس", "ري", "الري", "حقل", "الحقل", "بستان", "البستان", "مزرعة", "المزرعة", "زرع", "الزرع"],
      en: ["agriculture", "farming", "planting", "sowing", "harvest", "cultivation", "crops", "gardening", "irrigation", "seeding", "tilling", "plowing", "reaping", "horticulture", "agronomy", "harvesting", "growing crops", "field work", "crop cultivation", "farm work"],
    },
    supporting_concepts: ["growth", "fertility", "abundance", "nourishment", "life", "sustenance"],
    blocking_concepts: ["drought", "famine", "blight", "pest", "crop failure", "barrenness"],
    preferred_planets: ["moon", "venus"],
    avoid_planets: ["mars", "saturn"],
    preferred_days: ["mon", "fri"],
    manuscript_keywords: {
      en: ["agriculture", "farming", "planting", "sowing", "harvest", "cultivation", "crops", "gardening", "irrigation", "seeding"],
      ar: ["زراعة", "بذر", "حرث", "حصاد", "غرس", "ري", "حقل", "مزرعة"],
      ml: ["കൃഷി", "വിത്തിടൽ", "നടീൽ", "വിളവെടുപ്പ്", "കാർഷികം", "തോട്ടം"],
    },
  },

  medical: {
    id: "medical",
    label: { ml: "ചികിത്സ", en: "Medical", ar: "علاج" },
    parent: "healing",
    children: ["Surgery", "Treatment", "Medicine", "Healing", "Remedy", "Therapy"],
    related: ["Healing", "Cure", "Remedy", "Therapy", "Health", "Recovery", "Wellness", "Physician"],
    equivalent: ["Healing", "Treatment", "Cure", "Remedy", "Therapy", "Medicine"],
    synonyms: {
      ml: ["ശസ്ത്രക്രിയ", "ചികിത്സ", "മരുന്ന് തുടങ്ങൽ", "വൈദ്യം", "ആരോഗ്യം", "രോഗശമനം", "ചികിത്സ തുടങ്ങൽ", "മരുന്ന്", "വൈദ്യൻ", "രോഗം", "സുഖം", "സുഖപ്പെടുക", "ചികിത്സിക്കൽ", "ഔഷധം", "ഔഷധി", "പരിചരണം", "രോഗശാന്തി", "വാതം", "ചികിത്സാവിദ്യ", "ഹിതം"],
      ar: ["علاج", "طب", "شفا", "دواء", "طبابة", "العلاج", "الطب", "الشفا", "الدواء", "مداواة", "المداواة", "استشفاء", "الاستشفاء", "جراحة", "الجراحة", "علاج طبي", "شفاء", "الشفاء", "طبيب", "الطبيب", "مرهم"],
      en: ["surgery", "treatment", "medicine", "healing", "health", "cure", "medical", "remedy", "physician", "therapy", "recovery", "wellness", "medication", "operation", "surgical", "medical treatment", "healing practice", "cure disease", "medical care", "remedial", "healthcare"],
    },
    supporting_concepts: ["health", "recovery", "vitality", "strength", "restoration", "wellness"],
    blocking_concepts: ["disease", "illness", "infection", "complication", "relapse", "deterioration"],
    preferred_planets: ["sun", "moon"],
    avoid_planets: ["saturn", "mars"],
    preferred_days: ["sun", "mon"],
    manuscript_keywords: {
      en: ["medical", "treatment", "medicine", "healing", "cure", "physician", "therapy", "health", "surgery", "remedy"],
      ar: ["علاج", "طب", "شفا", "دواء", "مداواة", "جراحة", "شفاء", "طبيب"],
      ml: ["ചികിത്സ", "ശസ്ത്രക്രിയ", "മരുന്ന്", "വൈദ്യം", "ആരോഗ്യം", "ഔഷധം"],
    },
  },

  love: {
    id: "love",
    label: { ml: "പ്രണയം", en: "Love", ar: "محبة" },
    parent: "emotion",
    children: ["Romance", "Attraction", "Affection", "Muhabbah", "Charm", "Yearning"],
    related: ["Romance", "Attraction", "Affection", "Charm", "Yearning", "Adoration", "Fondness"],
    equivalent: ["Romance", "Affection", "Attraction", "Adoration", "Fondness"],
    synonyms: {
      ml: ["പ്രണയം", "പ്രേമം", "ആകർഷണം", "മഹബ്ബ", "അനുരാഗം", "പ്രീതി", "സ്നേഹം", "കാമം", "മോഹം", "ആസക്തി", "പ്രേമപ്പെരുക്കം", "അനുരാഗപ്പെരുക്കം", "ആകർഷണവിദ്യ", "മഹബ്ബത്ത്", "ഇഷ്ടം", "പ്രണയലേഖനം", "പ്രേമസന്ദേശം", "പ്രിയപ്പെട്ടവർ", "പ്രണയഭാവം"],
      ar: ["محبة", "حب", "جذب", "ود", "المحبة", "الحب", "الجذب", "الود", "عشق", "العشق", "غرام", "الغرام", "صبوة", "الصبوة", "هوى", "الهوى", "تعلق", "التعلق", "إلف", "الإلف", "ميل"],
      en: ["love", "romance", "attraction", "affection", "muhabbah", "charm", "fondness", "adoration", "yearning", "passion", "devotion", "infatuation", "attachment", "tenderness", "warmth", "enamor", "captivate", "allure", "endearment", "amorous", "romantic"],
    },
    supporting_concepts: ["affection", "harmony", "connection", "warmth", "unity", "attraction"],
    blocking_concepts: ["hatred", "aversion", "repulsion", "enmity", "discord", "estrangement"],
    preferred_planets: ["venus"],
    avoid_planets: ["saturn"],
    preferred_days: ["fri"],
    manuscript_keywords: {
      en: ["love", "romance", "attraction", "affection", "muhabbah", "charm", "passion", "devotion", "yearning"],
      ar: ["محبة", "حب", "جذب", "ود", "عشق", "غرام", "هوى"],
      ml: ["പ്രണയം", "പ്രേമം", "ആകർഷണം", "മഹബ്ബ", "അനുരാഗം", "സ്നേഹം"],
    },
  },

  protection: {
    id: "protection",
    label: { ml: "സംരക്ഷണം", en: "Protection", ar: "حماية" },
    parent: "defense",
    children: ["Shield", "Guard", "Ward", "Amulet", "Defense", "Sanctuary"],
    related: ["Defense", "Shield", "Guard", "Safety", "Ward Off Evil", "Amulet", "Sanctuary", "Fortress"],
    equivalent: ["Defense", "Shield", "Guard", "Ward", "Safeguard"],
    synonyms: {
      ml: ["സംരക്ഷണം", "പ്രതിരോധം", "കാവൽ", "രക്ഷ", "സുരക്ഷ", "കാക്കൽ", "പരിരക്ഷ", "സംരക്ഷ", "കാവൽപ്പുര", "അരികെ", "തടയൽ", "പ്രതിരോധിക്കൽ", "സുരക്ഷിതം", "രക്ഷിക്കൽ", "കാവാൻ", "സംരക്ഷണവിദ്യ", "പരിരക്ഷണം", "സുരക്ഷാകവചം", "പ്രതിബന്ധം", "തടസ്സം"],
      ar: ["حماية", "وقاية", "دفع", "حرس", "الحماية", "الوقاية", "الدفع", "الحرس", "حراسة", "الحراسة", "منع", "المنع", "صد", "الصد", "تحصين", "التحصين", "وقاية شر", "حارس", "الحارس", "ملاك", "حرز"],
      en: ["protection", "defense", "shield", "guard", "safety", "ward off evil", "amulet", "sanctuary", "fortress", "safeguard", "ward", "watch", "sentinel", "bulwark", "rampart", "defend", "secure", "preserve", "shelter", "asylum", "refuge"],
    },
    supporting_concepts: ["safety", "security", "strength", "fortress", "barrier", "preservation"],
    blocking_concepts: ["vulnerability", "attack", "invasion", "harm", "danger", "exposure"],
    preferred_planets: ["mars", "saturn"],
    avoid_planets: ["venus"],
    preferred_days: ["tue", "sat"],
    manuscript_keywords: {
      en: ["protection", "defense", "shield", "guard", "safety", "amulet", "sanctuary", "fortress", "safeguard", "ward"],
      ar: ["حماية", "وقاية", "دفع", "حرس", "حراسة", "تحصين", "حرز"],
      ml: ["സംരക്ഷണം", "പ്രതിരോധം", "കാവൽ", "രക്ഷ", "സുരക്ഷ", "പരിരക്ഷ"],
    },
  },

  wealth: {
    id: "wealth",
    label: { ml: "ഐശ്വര്യം", en: "Wealth", ar: "ثراء" },
    parent: "prosperity",
    children: ["Prosperity", "Abundance", "Rizq", "Profit", "Fortune", "Livelihood"],
    related: ["Prosperity", "Abundance", "Rizq", "Profit", "Fortune", "Livelihood", "Riches", "Treasure"],
    equivalent: ["Prosperity", "Abundance", "Fortune", "Riches", "Affluence"],
    synonyms: {
      ml: ["ഐശ്വര്യം", "സമ്പത്ത്", "റിസ്ഖ്", "ധനം", "ലാഭം", "സമ്പത്തി", "പണം", "ധനികൻ", "സമ്പത്സമൃദ്ധി", "വരുമാനം", "നിക്ഷേപം", "സമ്പത്തപരത", "ധനലാഭം", "സമ്പത്തെടുപ്പ്", "സമൃദ്ധി", "ഐശ്വര്യസമൃദ്ധി", "റിസ്ക്", "ഉപജീവനം", "വരുമാനമാർഗം", "സമ്പത്തുണ്ടാക്കൽ"],
      ar: ["رزق", "مال", "غنى", "ثروة", "الرزق", "المال", "الغنى", "الثروة", "يسر", "اليسر", "سعة", "السعة", "وفرة", "الوفرة", "إثراء", "الإثراء", "ثراء", "الثراء", "كسب", "الكسب", "ربح", "الربح"],
      en: ["wealth", "prosperity", "abundance", "rizq", "profit", "riches", "fortune", "livelihood", "affluence", "treasure", "abundance", "opulence", "affluence", "prosperous", "rich", "wealthy", "fortune", "bounty", "plenty", "gain", "acquire wealth"],
    },
    supporting_concepts: ["abundance", "growth", "opportunity", "expansion", "blessing", "success"],
    blocking_concepts: ["poverty", "loss", "debt", "bankruptcy", "scarcity", "lack"],
    preferred_planets: ["jupiter", "sun"],
    avoid_planets: ["saturn"],
    preferred_days: ["thu", "sun"],
    manuscript_keywords: {
      en: ["wealth", "prosperity", "abundance", "rizq", "profit", "riches", "fortune", "livelihood", "affluence", "treasure"],
      ar: ["رزق", "مال", "غنى", "ثروة", "يسر", "سعة", "وفرة", "كسب", "ربح"],
      ml: ["ഐശ്വര്യം", "സമ്പത്ത്", "റിസ്ഖ്", "ധനം", "ലാഭം", "സമൃദ്ധി"],
    },
  },

  knowledge: {
    id: "knowledge",
    label: { ml: "ജ്ഞാനം", en: "Knowledge", ar: "علم" },
    parent: "intellect",
    children: ["Learning", "Study", "Wisdom", "Education", "Scholarship", "Teaching"],
    related: ["Learning", "Study", "Wisdom", "Education", "Scholarship", "Teaching", "Research", "Understanding"],
    equivalent: ["Learning", "Wisdom", "Understanding", "Erudition", "Enlightenment"],
    synonyms: {
      ml: ["ജ്ഞാനം", "പഠനം", "വിദ്യ", "വിജ്ഞാനം", "വിദ്യാഭ്യാസം", "അറിവ്", "വിജ്ഞാനം", "പഠിക്കൽ", "പാഠം", "വിദ്യാഭ്യാസം", "ഗവേഷണം", "പ്രബന്ധം", "തത്വജ്ഞാനം", "വിജ്ഞാനം", "വിദ്യാർത്ഥി", "അധ്യാപകൻ", "വിദ്യാലയം", "പാഠ്യം", "ചിന്ത", "മനനം"],
      ar: ["علم", "معرفة", "دراسة", "تعليم", "العلم", "المعرفة", "الدراسة", "التعليم", "بحث", "البحث", "حكمة", "الحكمة", "ثقافة", "الثقافة", "فقه", "الفقه", "تفقه", "درس", "الدرس", "مدرسة", "المدرسة"],
      en: ["knowledge", "learning", "study", "wisdom", "education", "scholarship", "teaching", "research", "understanding", "erudition", "enlightenment", "intellect", "academic", "scholar", "study", "learn", "educate", "instruct", "comprehend", "wisdom", "learned"],
    },
    supporting_concepts: ["understanding", "wisdom", "clarity", "insight", "enlightenment", "growth"],
    blocking_concepts: ["ignorance", "confusion", "forgetfulness", "misunderstanding", "delusion"],
    preferred_planets: ["mercury", "jupiter"],
    avoid_planets: ["mars"],
    preferred_days: ["wed", "thu"],
    manuscript_keywords: {
      en: ["knowledge", "learning", "study", "wisdom", "education", "scholarship", "teaching", "research", "understanding"],
      ar: ["علم", "معرفة", "دراسة", "تعليم", "بحث", "حكمة", "ثقافة", "فقه"],
      ml: ["ജ്ഞാനം", "പഠനം", "വിദ്യ", "വിജ്ഞാനം", "വിദ്യാഭ്യാസം", "അറിവ്"],
    },
  },

  spiritual: {
    id: "spiritual",
    label: { ml: "ആത്മികം", en: "Spiritual", ar: "روحاني" },
    parent: "devotion",
    children: ["Prayer", "Meditation", "Worship", "Devotion", "Contemplation", "Dhikr"],
    related: ["Prayer", "Meditation", "Worship", "Devotion", "Contemplation", "Dhikr", "Remembrance", "Supplication"],
    equivalent: ["Prayer", "Devotion", "Worship", "Contemplation", "Meditation"],
    synonyms: {
      ml: ["ആത്മികം", "പ്രാർത്ഥന", "ധ്യാനം", "ആരാധന", "ആത്മീയം", "ഭക്തി", "പ്രാർത്ഥിക്കൽ", "ധ്യാനിക്കൽ", "ആരാധിക്കൽ", "സ്മരണ", "സ്തുതി", "വന്ദനം", "ഉപാസന", "തപസ്യ", "മോക്ഷം", "ആത്മാവ്", "പവിത്രം", "ധർമ്മം", "സാധന", "പൂജ"],
      ar: ["روحاني", "دعاء", "عبادة", "تأمل", "الروحاني", "الدعاء", "العبادة", "التأمل", "ذكر", "الذكر", "صلاة", "الصلاة", "تسبيح", "التسبيح", "استغفار", "الاستغفار", "خشوع", "الخشوع", "خلوة", "الخلوة", "تقوى"],
      en: ["spiritual", "prayer", "meditation", "divine", "worship", "devotion", "contemplation", "dhikr", "remembrance", "supplication", "sacred", "holy", "pious", "meditate", "pray", "worship", "contemplate", "devout", "sacred ritual", "spiritual practice", "divine connection"],
    },
    supporting_concepts: ["purity", "connection", "peace", "blessing", "elevation", "devotion"],
    blocking_concepts: ["worldly distraction", "negligence", "impurity", "disconnection", "heedlessness"],
    preferred_planets: ["jupiter", "saturn"],
    avoid_planets: ["mars"],
    preferred_days: ["thu", "sat"],
    manuscript_keywords: {
      en: ["spiritual", "prayer", "meditation", "worship", "devotion", "contemplation", "dhikr", "remembrance", "supplication"],
      ar: ["روحاني", "دعاء", "عبادة", "تأمل", "ذكر", "صلاة", "تسبيح", "استغفار", "خشوع"],
      ml: ["ആത്മികം", "പ്രാർത്ഥന", "ധ്യാനം", "ആരാധന", "ഭക്തി", "സ്മരണ"],
    },
  },

  courage: {
    id: "courage",
    label: { ml: "ധൈര്യം", en: "Courage", ar: "شجاعة" },
    parent: "valor",
    children: ["Bravery", "Strength", "Victory", "Conquest", "Overcoming", "Warfare"],
    related: ["Bravery", "Strength", "Victory", "Conquest", "Overcoming", "Warfare", "Battle", "Fight"],
    equivalent: ["Bravery", "Valor", "Fortitude", "Boldness", "Heroism"],
    synonyms: {
      ml: ["ധൈര്യം", "ശക്തി", "വിജയം", "ധീരത", "ശൗര്യം", "ധീരം", "ശൗര്യം", "വീര്യം", "ബാഹ്യം", "പോരാട്ടം", "പോരാടൽ", "വിജയിക്കൽ", "ശക്തിയുള്ള", "ധീരൻ", "വീരൻ", "ശൂരൻ", "പരാക്രമം", "ഉത്സാഹം", "ശക്തിപ്രയോഗം", "സമരം"],
      ar: ["شجاعة", "قوة", "نصر", "غلبة", "الشجاعة", "القوة", "النصر", "الغلبة", "بأس", "البأس", "بطولة", "البطولة", "إقدام", "الإقدام", "جرأة", "الجرأة", "حرب", "الحرب", "قتال", "القتال", "سطوة"],
      en: ["courage", "strength", "victory", "bravery", "enemy", "overcome", "conquer", "valor", "fortitude", "boldness", "heroism", "battle", "fight", "warfare", "triumph", "prevail", "defeat", "assail", "assault", "combat", "vanquish"],
    },
    supporting_concepts: ["victory", "strength", "dominance", "triumph", "power", "conquest"],
    blocking_concepts: ["defeat", "weakness", "surrender", "cowardice", "submission", "retreat"],
    preferred_planets: ["mars"],
    avoid_planets: ["venus"],
    preferred_days: ["tue"],
    manuscript_keywords: {
      en: ["courage", "strength", "victory", "bravery", "conquer", "valor", "fortitude", "battle", "fight", "triumph"],
      ar: ["شجاعة", "قوة", "نصر", "غلبة", "بأس", "بطولة", "إقدام", "جرأة", "حرب", "قتال"],
      ml: ["ധൈര്യം", "ശക്തി", "വിജയം", "ധീരത", "ശൗര്യം", "പോരാട്ടം"],
    },
  },

  // ── V2 Extension entries (merged from semanticKnowledgeGraphV2.js) ──
  // 24 new canonical actions: buying, selling, surgery, education, exams,
  // employment, promotion, trade, partnership, contracts, house_building,
  // foundation_laying, moving_house, vehicle_purchase, animal_purchase,
  // planting, harvesting, water_digging, ruqyah, prayer, dhikr, charity,
  // hajj, umrah. Each has ml/en/ar/tr synonyms. V1 entries untouched.
  ...EXTENDED_ENTRIES,
};

// ── Parent categories (for hierarchical navigation) ──
export const PARENT_CATEGORIES = {
  creation: { label: { ml: "സൃഷ്ടി", en: "Creation", ar: "خلق" } },
  movement: { label: { ml: "ചലനം", en: "Movement", ar: "حركة" } },
  union: { label: { ml: "ഐക്യം", en: "Union", ar: "اتحاد" } },
  commerce: { label: { ml: "വാണിജ്യം", en: "Commerce", ar: "تجارة" } },
  cultivation: { label: { ml: "കൃഷി", en: "Cultivation", ar: "زراعة" } },
  healing: { label: { ml: "രോഗശമനം", en: "Healing", ar: "شفاء" } },
  emotion: { label: { ml: "വികാരം", en: "Emotion", ar: "عاطفة" } },
  defense: { label: { ml: "പ്രതിരോധം", en: "Defense", ar: "دفاع" } },
  prosperity: { label: { ml: "സമൃദ്ധി", en: "Prosperity", ar: "رخاء" } },
  intellect: { label: { ml: "ബുദ്ധി", en: "Intellect", ar: "عقل" } },
  devotion: { label: { ml: "ഭക്തി", en: "Devotion", ar: "عبادة" } },
  valor: { label: { ml: "പരാക്രമം", en: "Valor", ar: "شجاعة" } },
};

export default { SEMANTIC_GRAPH, PARENT_CATEGORIES };
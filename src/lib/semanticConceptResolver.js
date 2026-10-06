// ═══════════════════════════════════════════════════════════════
// SEMANTIC CONCEPT RESOLVER — multilingual concept → canonical action
//
// TRUE semantic search: users search by MEANING, not by exact synonym.
// "banish", "expel", "deport", "punish", "destroy", "capture", "bind",
// "imprison", "war", "attack", "fear", "magic" do NOT appear verbatim
// in the manuscript synonym lists — but they map to manuscript-supported
// operations (Kashf al-Haqa'iq operations, Havâss mansion rules).
//
// This resolver maps a concept word (EN/AR/ML/TR) to a canonical action
// key. It is consulted as a FALLBACK by classifyAction when literal
// synonym matching fails, so the existing engine works for concept words
// WITHOUT an LLM call (zero integration credits).
//
// Four new canonical categories are introduced (separation, enemy, binding,
// magic) — manuscript-aligned preferred/avoid planets & days from the
// Kashf operation table (pp.12-27) and Havâss planetary rulers. Existing
// categories (heal→medical, marriage, wealth, business, travel, protection,
// love, knowledge, courage, spiritual) get the user's concept words added.
//
// ISOLATED — additive only. Does NOT modify the timing engine, calculation
// engine, OCR, ingestion, or any existing category. New categories are
// merged into ACTION_CATEGORIES by astroActionClassifier.js.
// ═══════════════════════════════════════════════════════════════

// ── New canonical categories (manuscript-aligned) ──
// preferred/avoid planets & days sourced from:
//  • Kashf al-Haqa'iq operation timing (pp.12-27): destructive operations
//    run under Mars/Saturn; binding under Saturn; magic/talismans under
//    Jupiter/Saturn; separation under Mars/Saturn.
//  • Havâss planetary day rulers (PDF2 p.49-51): Mars→Tue, Saturn→Sat.
export const NEW_CONCEPT_CATEGORIES = {
  separation: {
    label: { ml: "വേർപിരിവ്", en: "Separation", ar: "فرقة" },
    synonyms: {
      en: ["separation", "banish", "expel", "deport", "separate", "divorce", "repel", "drive away", "remove", "oust", "exile", "dispel", "alienate", "estrange"],
      ar: ["فرقة", "طرد", "نفي", "إبعاد", "تفريق", "طلاق", "صد", "إخراج", "تغريب"],
      ml: ["വേർപിരിവ്", "നാടുകടത്തൽ", "പിരിച്ചുവിടൽ", "അകറ്റൽ", "നീക്കംചെയ്യൽ", "വിവാഹമോചനം", "ആട്ടിയോടിക്കൽ"],
      tr: ["ayrılık", "sürgün", "kovma", "uzaklaştırma", "ayrıştırma", "boşanma"],
    },
    preferredPlanets: ["mars", "saturn"],
    preferredDays: ["tue", "sat"],
    avoidPlanets: ["venus", "jupiter"],
  },
  enemy: {
    label: { ml: "ശത്രു", en: "Enemy", ar: "عداوة" },
    synonyms: {
      en: ["enemy", "punish", "destroy", "attack", "war", "fight", "hostility", "assail", "assault", "combat", "vanquish", "defeat", "overcome", "conquer", "wrath", "vengeance", "retaliation", "fear", "dread", "terror", "awe"],
      ar: ["عداوة", "عقاب", "هلاك", "حرب", "قتال", "عدو", " تخريب", "إهلاك", "رعب", "خوف", "هيبة", "داهية"],
      ml: ["ശത്രു", "ശിക്ഷ", "നാശം", "യുദ്ധം", "ആക്രമണം", "പോരാട്ടം", "ഭയം", "ഭീതി", "അതികാരം", "പ്രതികാരം"],
      tr: ["düşman", "savaş", "yok etme", "saldırı", "cezalandırma", "korku", "dehşet", "öç"],
    },
    preferredPlanets: ["mars"],
    preferredDays: ["tue"],
    avoidPlanets: ["venus"],
  },
  binding: {
    label: { ml: "ബന്ധനം", en: "Binding", ar: "ربط" },
    synonyms: {
      en: ["binding", "bind", "capture", "imprison", "tie", "restrain", "captivate", "tie down", "fetter", "shackle", "confine", "lock", "silence", "bind tongue", "repress"],
      ar: ["ربط", "تقييد", "سجن", "أسر", "حبس", "كبت", "إسكات", "قيد", "وثاق"],
      ml: ["ബന്ധനം", "ബന്ധിക്കൽ", "പിടിക്കൽ", "തടവ്", "ബന്ധനിടൽ", "മിണിയടക്കൽ", "തടയൽ", "പൂട്ടൽ"],
      tr: ["bağlama", "hapsetme", "tutmak", "bağlamak", "zincire vurmak", "susma"],
    },
    preferredPlanets: ["saturn"],
    preferredDays: ["sat"],
    avoidPlanets: ["sun", "jupiter"],
  },
  magic: {
    label: { ml: "മാന്ത്രികം", en: "Magic", ar: "سحر" },
    synonyms: {
      en: ["magic", "spell", "talisman", "charm", "enchantment", "amulet", "talismanic", "sorcery", "incantation", "occult"],
      ar: ["سحر", "طلسم", "تعويذ", "رقي", "عزيمة", "طلسمات", "سحرية"],
      ml: ["മാന്ത്രികം", "തായ്ത്സം", "മന്ത്രം", "വശീകരണം", "മന്ത്രവാദം", "രക്ഷ"],
      tr: ["büyü", "tılsım", "muska", "sihir", "büyülü"],
    },
    preferredPlanets: ["jupiter", "saturn"],
    preferredDays: ["thu", "sat"],
    avoidPlanets: ["mars"],
  },
};

// ── Concept-word extensions for EXISTING categories ──
// The user's example words that map to categories already in ACTION_CATEGORIES
// but missing those exact synonyms. These are merged into the resolver's
// reverse index; existing synonym lists are NOT modified.
export const CONCEPT_WORD_EXTENSIONS = {
  medical: {
    en: ["heal", "healing", "cure", "remedy", "recover", "recovery", "wellness", "sickness", "illness", "disease"],
    ar: ["شفاء", "علاج", "تعافي", "مرض"],
    ml: ["സുഖപ്പെടുത്തൽ", "സുഖം", "രോഗശമനം", "ചികിത്സിക്കൽ"],
    tr: ["şifa", "iyileşme", "hastalık"],
  },
  protection: {
    en: ["protection", "protect", "guard", "ward", "defend", "safe", "safety", "shield", "preserve", "shelter", "refuge", "asylum"],
    ar: ["حماية", "وقاية", "حرس", "تحصين", "حرز", "حماية من"],
    ml: ["സംരക്ഷണം", "സുരക്ഷ", "കാവൽ", "രക്ഷ", "പരിരക്ഷ", "അഭയം"],
    tr: ["koruma", "korumak", "güvenlik", "kalkan", "sığınak"],
  },
  marriage: {
    en: ["marriage", "marry", "wedding", "matrimony", "nikah", "nuptial", "union", "betrothal", "engagement"],
    ar: ["زواج", "نكاح", "زفاف", "خطوبة", "ارتباط"],
    ml: ["വിവാഹം", "വിവാഹം ചെയ്യൽ", "നിക്കാഹ്", "കല്യാണം", "മാംഗല്യം"],
    tr: ["evlilik", "evlenmek", "nikah", "düğün", "nişan"],
  },
  wealth: {
    en: ["wealth", "rich", "riches", "prosperity", "abundance", "rizq", "livelihood", "fortune", "money", "profit", "gain"],
    ar: ["رزق", "مال", "غنى", "ثروة", "يسر", "سعة", "كسب", "ربح"],
    ml: ["ഐശ്വര്യം", "സമ്പത്ത്", "റിസ്ഖ്", "ധനം", "ലാഭം", "പണം", "സമൃദ്ധി"],
    tr: ["zenginlik", "servet", "bolluk", "rızk", "kazanç", "para"],
  },
  business: {
    en: ["business", "trade", "commerce", "shop", "merchant", "deal", "transaction", "investment", "buying", "selling", "store", "enterprise", "trade venture"],
    ar: ["تجارة", "بيع", "شراء", "متجر", "تاجر", "صفقة", "استثمار", "سوق"],
    ml: ["കച്ചവടം", "വ്യാപാരം", "വാണിജ്യം", "കട", "വ്യാപാരി", "നിക്ഷേപം", "വില്പന", "വാങ്ങൽ"],
    tr: ["ticaret", "iş", "dükkân", "alım satım", "yatırım", "tüccar"],
  },
  travel: {
    en: ["travel", "journey", "trip", "voyage", "flight", "departure", "transit", "passage", "expedition", "migration", "relocation", "sailing", "flying"],
    ar: ["سفر", "رحلة", "ترحال", "انتقال", "هجرة", "ارتحال", "مسافرة"],
    ml: ["യാത്ര", "പ്രയാണം", "വിദേശം", "കടൽയാത്ര", "വിമാനയാത്ര", "സ്ഥലംമാറ്റം"],
    tr: ["seyahat", "yolculuk", "gezi", "göç", "uçuş"],
  },
  love: {
    en: ["love", "romance", "attraction", "affection", "muhabbah", "charm", "passion", "devotion", "yearning", "captivate", "allure", "enamor"],
    ar: ["محبة", "حب", "جذب", "ود", "عشق", "غرام", "هوى", "تعلق", "إلف"],
    ml: ["പ്രണയം", "പ്രേമം", "ആകർഷണം", "മഹബ്ബ", "അനുരാഗം", "സ്നേഹം"],
    tr: ["aşk", "sevgi", "çekim", "tutku"],
  },
  knowledge: {
    en: ["knowledge", "learning", "study", "wisdom", "education", "scholarship", "teaching", "research", "understanding", "intellect"],
    ar: ["علم", "معرفة", "دراسة", "تعليم", "بحث", "حكمة", "ثقافة", "فقه"],
    ml: ["ജ്ഞാനം", "പഠനം", "വിദ്യ", "വിജ്ഞാനം", "അറിവ്", "വിദ്യാഭ്യാസം"],
    tr: ["bilgi", "ilim", "öğrenim", "bilgelik", "eğitim"],
  },
  courage: {
    en: ["courage", "bravery", "valor", "boldness", "heroism", "strength", "victory", "triumph", "prevail", "fortitude"],
    ar: ["شجاعة", "قوة", "نصر", "غلبة", "بأس", "بطولة", "جرأة", "إقدام"],
    ml: ["ധൈര്യം", "ശക്തി", "വിജയം", "ധീരത", "ശൗര്യം", "പോരാട്ടം"],
    tr: ["cesaret", "güç", "zafer", "kahramanlık"],
  },
  spiritual: {
    en: ["spiritual", "prayer", "meditation", "worship", "devotion", "contemplation", "dhikr", "remembrance", "supplication", "sacred", "holy", "pious"],
    ar: ["روحاني", "دعاء", "عبادة", "تأمل", "ذكر", "صلاة", "تسبيح", "استغفار", "خشوع"],
    ml: ["ആത്മികം", "പ്രാർത്ഥന", "ധ്യാനം", "ആരാധന", "ഭക്തി", "സ്മരണ"],
    tr: ["manevi", "dua", "ibadet", "tefekkür", "zikir"],
  },
};

// ── Build reverse index: term → canonicalKey (lowercased) ──
const REVERSE = new Map();
function indexTerms(canonicalKey, langMap) {
  for (const lang of Object.keys(langMap)) {
    for (const term of langMap[lang] || []) {
      const lc = term.toLowerCase().trim();
      if (lc && !REVERSE.has(lc)) REVERSE.set(lc, { key: canonicalKey, lang });
    }
  }
}
for (const [k, v] of Object.entries(NEW_CONCEPT_CATEGORIES)) indexTerms(k, v.synonyms);
for (const [k, v] of Object.entries(CONCEPT_WORD_EXTENSIONS)) indexTerms(k, v);

// Arabic harakat stripping for matching (so مَحبَة matches محبة)
const HARAKAT = /[\u064B-\u0652\u0670\u0640]/g;
function normalizeAr(s) { return s.replace(HARAKAT, '').toLowerCase().trim(); }

/**
 * Resolve a concept word (any of EN/AR/ML/TR) to a canonical action key.
 * @param {string} query
 * @returns {{ category: string, confidence: number, matchedTerm: string, lang: string } | null}
 */
export function resolveConcept(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();
  if (!q) return null;

  // 1) exact / substring match in reverse index
  let best = null;
  let bestScore = 0;
  for (const [term, { key, lang }] of REVERSE) {
    let score = 0;
    if (q === term) score = 100;
    else if (q.includes(term) && term.length >= 3) score = 85;
    else if (term.includes(q) && q.length >= 3) score = 70;
    if (score > bestScore) { bestScore = score; best = { category: key, confidence: score, matchedTerm: term, lang }; }
  }
  // 2) Arabic harakat-insensitive retry if no strong match
  if (bestScore < 80 && /[\u0600-\u06FF]/.test(query)) {
    const qn = normalizeAr(query);
    for (const [term, { key, lang }] of REVERSE) {
      if (!/[\u0600-\u06FF]/.test(term)) continue;
      const tn = normalizeAr(term);
      let score = 0;
      if (qn === tn) score = 98;
      else if (qn.includes(tn) && tn.length >= 3) score = 88;
      else if (tn.includes(qn) && qn.length >= 3) score = 72;
      if (score > bestScore) { bestScore = score; best = { category: key, confidence: score, matchedTerm: term, lang }; }
    }
  }
  if (!best || bestScore < 30) return null;
  return best;
}

export default { resolveConcept, NEW_CONCEPT_CATEGORIES, CONCEPT_WORD_EXTENSIONS };
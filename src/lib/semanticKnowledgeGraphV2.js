// ═══════════════════════════════════════════════════════════════
// SEMANTIC KNOWLEDGE GRAPH — V2 EXTENSION
//
// Comprehensive multilingual expansion of the Knowledge Graph.
// Adds 24 new canonical actions covering every major operation
// supported by Sirr al-Huruf, including:
//   Buying, Selling, Surgery, Education, Exams, Employment,
//   Promotion, Trade, Partnership, Contracts, House Building,
//   Foundation Laying, Moving House, Vehicle Purchase, Animal
//   Purchase, Planting, Harvesting, Water Digging, Ruqyah,
//   Prayer, Dhikr, Charity, Hajj, Umrah
//
// Each entry includes Malayalam (ml), Arabic (ar), English (en),
// and Turkish (tr) synonyms for comprehensive multilingual search.
//
// BACKWARD COMPATIBLE:
//   - Does NOT modify any existing V1 entry in semanticKnowledgeGraph.js
//   - Does NOT modify the reasoning engine, classifier, timing engine,
//     OCR, translation, schema, or any UI
//   - Uses only existing parent categories (no new hierarchy)
//   - The `tr` language key is additive — the current engine iterates
//     ["ml","en","ar"] and will not crash on `tr`; when the engine is
//     later extended to include "tr", all Turkish synonyms become
//     automatically searchable with zero data changes
//
// STRUCTURE: Each entry matches the exact V1 schema:
//   id, label{ml,en,ar}, parent, children, related, equivalent,
//   synonyms{ml,ar,en,tr}, supporting_concepts, blocking_concepts,
//   preferred_planets, avoid_planets, preferred_days,
//   manuscript_keywords{en,ar,ml,tr}
// ═══════════════════════════════════════════════════════════════

export const EXTENDED_ENTRIES = {

  // ── 1. BUYING ──────────────────────────────────────────────
  buying: {
    id: "buying",
    label: { ml: "വാങ്ങൽ", en: "Buying", ar: "شراء" },
    parent: "commerce",
    children: ["Purchase", "Acquisition", "Procurement", "Buying Goods", "Shopping"],
    related: ["Purchase", "Acquisition", "Procurement", "Shopping", "Commerce", "Transaction"],
    equivalent: ["Purchase", "Acquisition", "Procurement", "Obtaining"],
    synonyms: {
      ml: ["വാങ്ങൽ", "വാങ്ങുക", "ഖരീദ്", "വാങ്ങിയെടുക്കൽ", "സ്വന്തമാക്കൽ", "വിലയ്ക്കുവാങ്ങൽ", "എടുക്കൽ", "വാങ്ങി", "വാങ്ങാൻ", "വാങ്ങിക്കൊള്ളൽ", "കിന്ന്", "വിലയ്ക്കെടുക്കൽ"],
      ar: ["شراء", "ابتياع", "اقتناء", "حصول", "اشترى", "تبضع", "شراء سلع", "شراء بضائع", "الشراء", "الابتياع", "الاقتناء"],
      en: ["buying", "purchase", "acquisition", "procurement", "shopping", "buy", "acquire", "obtain", "procure", "purchase goods", "buying goods", "acquiring", "obtaining", "shop", "make a purchase"],
      tr: ["satın alma", "satın almak", "alış", "alışveriş", "mülk edinme", "temin", "temin etme", "mal alma", "eşya alma", "almak", "alış yapma"],
    },
    supporting_concepts: ["acquisition", "ownership", "gain", "possession", "investment", "procurement"],
    blocking_concepts: ["loss", "fraud", "deception", "waste", "overpayment", "defect"],
    preferred_planets: ["mercury", "jupiter"],
    avoid_planets: ["saturn"],
    preferred_days: ["wed", "thu"],
    manuscript_keywords: {
      en: ["buying", "purchase", "acquisition", "procurement", "shopping", "acquire", "obtain"],
      ar: ["شراء", "ابتياع", "اقتناء", "حصول", "اشترى"],
      ml: ["വാങ്ങൽ", "ഖരീദ്", "വാങ്ങിയെടുക്കൽ", "സ്വന്തമാക്കൽ"],
      tr: ["satın alma", "alış", "alışveriş", "temin", "mal alma"],
    },
  },

  // ── 2. SELLING ─────────────────────────────────────────────
  selling: {
    id: "selling",
    label: { ml: "വിറ്റൽ", en: "Selling", ar: "بيع" },
    parent: "commerce",
    children: ["Sale", "Vending", "Marketing", "Liquidation", "Retail Sale"],
    related: ["Sale", "Vending", "Marketing", "Commerce", "Trade", "Transaction", "Retail"],
    equivalent: ["Sale", "Vending", "Marketing", "Disposal"],
    synonyms: {
      ml: ["വിറ്റൽ", "വില്ക്കൽ", "വില്പന", "ഫറോഖ്", "വിറ്റുക", "വില്ക്കുക", "വിപണി", "വിറ്റഴിക്കൽ", "വിലയ്ക്കുവിറ്റൽ", "ചന്ത", "വിറ്റ്"],
      ar: ["بيع", "تصريف", "تسويق", "البيع", "التصريف", "التسويق", "بيع سلع", "تصريف بضائع", "بيع وتسويق", "تاجر"],
      en: ["selling", "sale", "vending", "marketing", "sell", "vend", "market", "liquidate", "retail", "wholesale", "dispose", "put up for sale", "offer for sale", "sell off"],
      tr: ["satış", "satmak", "satma", "pazarlama", "satış yapma", "elden çıkarma", "müşteriye satma", "satışı", "pazarda satma"],
    },
    supporting_concepts: ["profit", "transaction", "exchange", "commerce", "income", "revenue"],
    blocking_concepts: ["loss", "stagnation", "defect", "fraud", "underpricing", "unsold"],
    preferred_planets: ["mercury", "jupiter"],
    avoid_planets: ["saturn"],
    preferred_days: ["wed", "thu"],
    manuscript_keywords: {
      en: ["selling", "sale", "vending", "marketing", "sell", "vend", "retail", "wholesale"],
      ar: ["بيع", "تصريف", "تسويق", "بيع سلع"],
      ml: ["വിറ്റൽ", "വില്ക്കൽ", "വില്പന", "ഫറോഖ്"],
      tr: ["satış", "satmak", "pazarlama", "elden çıkarma"],
    },
  },

  // ── 3. SURGERY ─────────────────────────────────────────────
  surgery: {
    id: "surgery",
    label: { ml: "ശസ്ത്രക്രിയ", en: "Surgery", ar: "جراحة" },
    parent: "healing",
    children: ["Operation", "Surgical Procedure", "Incision", "Excision", "Amputation"],
    related: ["Operation", "Procedure", "Medical Treatment", "Incision", "Healing", "Recovery", "Physician"],
    equivalent: ["Operation", "Surgical Procedure", "Medical Procedure"],
    synonyms: {
      ml: ["ശസ്ത്രക്രിയ", "ഓപ്പറേഷൻ", "ശസ്ത്രക്രിയചെയ്യൽ", "മുറിവേൽപ്പ്", "ചികിത്സാശസ്ത്രം", "ഓപ്പറേറ്റ്", "മുറിച്ചുമാറ്റൽ", "ശസ്ത്രം", "ചികിത്സാവിദ്യ", "ഓപ്പറേഷൻചെയ്യൽ"],
      ar: ["جراحة", "عمل جراحي", "الجراحة", "العمل الجراحي", "عملية", "العملية", "استئصال", "بتر", "تدخل جراحي", "عمل جراح"],
      en: ["surgery", "operation", "surgical", "procedure", "incision", "excision", "amputation", "surgical procedure", "medical operation", "operate", "surgical intervention"],
      tr: ["ameliyat", "cerrahi", "ameliyat etme", "cerrahi müdahale", "operasyon", "ameliyat yapma", "bıçaklama", "cerrahi işlem", "ameliyatı"],
    },
    supporting_concepts: ["healing", "recovery", "precision", "skill", "restoration", "medicine"],
    blocking_concepts: ["bleeding", "infection", "complication", "mortality", "relapse", "error"],
    preferred_planets: ["sun", "moon"],
    avoid_planets: ["mars"],
    preferred_days: ["sun", "mon"],
    manuscript_keywords: {
      en: ["surgery", "operation", "surgical", "procedure", "incision", "amputation", "medical operation"],
      ar: ["جراحة", "عمل جراحي", "عملية", "استئصال", "بتر", "تدخل جراحي"],
      ml: ["ശസ്ത്രക്രിയ", "ഓപ്പറേഷൻ", "മുറിവേൽപ്പ്", "ശസ്ത്രം"],
      tr: ["ameliyat", "cerrahi", "operasyon", "cerrahi müdahale"],
    },
  },

  // ── 4. EDUCATION ───────────────────────────────────────────
  education: {
    id: "education",
    label: { ml: "വിദ്യാഭ്യാസം", en: "Education", ar: "تعليم" },
    parent: "intellect",
    children: ["Schooling", "Instruction", "Tutelage", "Academy", "Curriculum"],
    related: ["Learning", "Study", "Teaching", "Instruction", "School", "Academy", "Knowledge", "Wisdom"],
    equivalent: ["Schooling", "Instruction", "Tutelage", "Pedagogy"],
    synonyms: {
      ml: ["വിദ്യാഭ്യാസം", "പഠനം", "സ്കൂൾ", "വിദ്യാലയം", "പഠിപ്പിക്കൽ", "അദ്ധ്യാപനം", "വിദ്യ", "പാഠം", "ക്ലാസ്സ്", "വിദ്യാഭ്യാസസ്ഥാപനം", "അധ്യായനം", "പാഠ്യം"],
      ar: ["تعليم", "دراسة", "مدرسة", "التعليم", "الدراسة", "المدرسة", "تربية", "التربية", "تلقين", "درس", "مدرسة", "تعليم أساسي"],
      en: ["education", "schooling", "study", "learning", "teaching", "instruction", "tutelage", "pedagogy", "curriculum", "academy", "school", "educate", "instruct"],
      tr: ["eğitim", "öğretim", "okul", "eğitim alma", "öğrenim", "talim", "ders", "okula gitme", "eğitim kurumu", "okutma", "öğretim kurumu"],
    },
    supporting_concepts: ["understanding", "wisdom", "growth", "enlightenment", "development", "knowledge"],
    blocking_concepts: ["ignorance", "confusion", "forgetfulness", "distraction", "negligence", "misunderstanding"],
    preferred_planets: ["mercury", "jupiter"],
    avoid_planets: ["mars"],
    preferred_days: ["wed", "thu"],
    manuscript_keywords: {
      en: ["education", "schooling", "study", "learning", "teaching", "instruction", "school"],
      ar: ["تعليم", "دراسة", "مدرسة", "تربية", "تلقين", "درس"],
      ml: ["വിദ്യാഭ്യാസം", "പഠനം", "സ്കൂൾ", "വിദ്യാലയം", "അദ്ധ്യാപനം"],
      tr: ["eğitim", "öğretim", "okul", "öğrenim", "talim", "ders"],
    },
  },

  // ── 5. EXAMS ───────────────────────────────────────────────
  exams: {
    id: "exams",
    label: { ml: "പരീക്ഷ", en: "Exams", ar: "امتحان" },
    parent: "intellect",
    children: ["Test", "Assessment", "Quiz", "Evaluation", "Final Exam"],
    related: ["Test", "Assessment", "Evaluation", "Study", "Education", "Examination", "Quiz"],
    equivalent: ["Test", "Assessment", "Evaluation", "Examination"],
    synonyms: {
      ml: ["പരീക്ഷ", "പരീക്ഷയെഴുതൽ", "ഇംതിഹാൻ", "ടെസ്റ്റ്", "വിദ്യാപരീക്ഷ", "മൂല്യനിർണ്ണയം", "പരീക്ഷണം", "പരീക്ഷാഫലം", "വിലയിരുത്തൽ", "പരീക്ഷെഴുതി"],
      ar: ["امتحان", "اختبار", "الامتحان", "الاختبار", "امتحانات", "اختبارات", "مذاكرة", "مراجعة", "تقييم", "اختبار كتابي"],
      en: ["exams", "examination", "test", "assessment", "quiz", "evaluation", "final exam", "entrance exam", "written exam", "oral exam", "exam", "examination"],
      tr: ["sınav", "imtihan", "sınav olma", "test", "sınav girme", "yazılı sınav", "sözlü sınav", "final", "ara sınav", "değerlendirme", "sınavı"],
    },
    supporting_concepts: ["knowledge", "preparation", "competence", "understanding", "achievement", "success"],
    blocking_concepts: ["failure", "forgetfulness", "anxiety", "confusion", "distraction", "ignorance"],
    preferred_planets: ["mercury", "jupiter"],
    avoid_planets: ["mars"],
    preferred_days: ["wed", "thu"],
    manuscript_keywords: {
      en: ["exams", "examination", "test", "assessment", "quiz", "evaluation", "final exam"],
      ar: ["امتحان", "اختبار", "مذاكرة", "مراجعة", "تقييم"],
      ml: ["പരീക്ഷ", "ഇംതിഹാൻ", "ടെസ്റ്റ്", "വിദ്യാപരീക്ഷ"],
      tr: ["sınav", "imtihan", "test", "final", "değerlendirme"],
    },
  },

  // ── 6. EMPLOYMENT ──────────────────────────────────────────
  employment: {
    id: "employment",
    label: { ml: "തൊഴിൽ", en: "Employment", ar: "عمل" },
    parent: "prosperity",
    children: ["Job", "Work", "Hiring", "Recruitment", "Appointment"],
    related: ["Job", "Work", "Career", "Position", "Occupation", "Service", "Profession", "Livelihood"],
    equivalent: ["Job", "Work", "Occupation", "Service", "Profession"],
    synonyms: {
      ml: ["ജോലി", "തൊഴിൽ", "ജോലിയെടുക്കൽ", "നിയമനം", "തൊഴിലിടം", "തൊഴിലെടുക്കൽ", "ഔദ്യോഗികം", "സർക്കാർജോലി", "തൊഴി", "കയ്യടി", "വേല", "തൊഴിൽലഭിക്കൽ"],
      ar: ["عمل", "توظيف", "وظيفة", "العمل", "التوظيف", "الوظيفة", "خدمة", "الخدمة", "رزق", "وظيفة", "مهنة", "المهنة"],
      en: ["employment", "job", "work", "hiring", "recruitment", "appointment", "position", "occupation", "service", "career", "profession", "employ", "get a job"],
      tr: ["iş", "çalışma", "istihdam", "iş bulma", "işe girme", "işe alma", "görev", "meslek", "memuriyet", "iş, hizmet", "çalışma hayatı"],
    },
    supporting_concepts: ["livelihood", "stability", "income", "growth", "opportunity", "career"],
    blocking_concepts: ["unemployment", "dismissal", "stagnation", "debt", "conflict", "failure"],
    preferred_planets: ["sun", "jupiter"],
    avoid_planets: ["saturn"],
    preferred_days: ["sun", "thu"],
    manuscript_keywords: {
      en: ["employment", "job", "work", "hiring", "recruitment", "appointment", "position", "occupation"],
      ar: ["عمل", "توظيف", "وظيفة", "خدمة", "رزق", "مهنة"],
      ml: ["ജോലി", "തൊഴിൽ", "നിയമനം", "ഔദ്യോഗികം"],
      tr: ["iş", "istihdam", "iş bulma", "görev", "meslek", "memuriyet"],
    },
  },

  // ── 7. PROMOTION ───────────────────────────────────────────
  promotion: {
    id: "promotion",
    label: { ml: "സ്ഥാനക്കയറ്റം", en: "Promotion", ar: "ترقية" },
    parent: "prosperity",
    children: ["Advancement", "Elevation", "Upgrade", "Raise", "Career Growth"],
    related: ["Advancement", "Elevation", "Upgrade", "Career Growth", "Success", "Recognition", "Authority"],
    equivalent: ["Advancement", "Elevation", "Upgrade", "Ascension"],
    synonyms: {
      ml: ["പദോൽപ്പാനം", "സ്ഥാനക്കയറ്റം", "പദോന്നതി", "ഉന്നതി", "ജോലിക്കയറ്റം", "സ്ഥാനലാഭം", "വളർച്ച", "ഉയർച്ച", "അഭിന്നതൻ", "സ്ഥാനവർദ്ധി", "പദവിയേറ്റം"],
      ar: ["ترقية", "الترقية", "ترقية", "ارتقاء", "الارتقاء", "رتبة", "الرتبة", "رفعة", "الرفعة", "تقدم", "التقدم"],
      en: ["promotion", "advancement", "elevation", "upgrade", "raise", "career growth", "career advancement", "step up", "move up", "progress", "ascension", "advancement"],
      tr: ["terfi", "yükselme", "promotion", "ilerleme", "derece artışı", "rütbe yükselme", "yükseğe çıkma", "maaş artışı", "kariyer ilerlemesi", "yükseliş"],
    },
    supporting_concepts: ["success", "recognition", "authority", "growth", "achievement", "elevation"],
    blocking_concepts: ["demotion", "stagnation", "dismissal", "failure", "decline", "disgrace"],
    preferred_planets: ["sun", "jupiter"],
    avoid_planets: ["saturn"],
    preferred_days: ["sun", "thu"],
    manuscript_keywords: {
      en: ["promotion", "advancement", "elevation", "upgrade", "raise", "career growth"],
      ar: ["ترقية", "ارتقاء", "رتبة", "رفعة", "تقدم"],
      ml: ["സ്ഥാനക്കയറ്റം", "പദോന്നതി", "ഉന്നതി", "ജോലിക്കയറ്റം"],
      tr: ["terfi", "yükselme", "ilerleme", "derece artışı", "rütbe yükselme"],
    },
  },

  // ── 8. TRADE ───────────────────────────────────────────────
  trade: {
    id: "trade",
    label: { ml: "വ്യാപാരം", en: "Trade", ar: "تجارة" },
    parent: "commerce",
    children: ["Mercantile", "Exchange", "Barter", "Traffic", "Dealings"],
    related: ["Commerce", "Exchange", "Barter", "Business", "Transaction", "Merchandising", "Deal"],
    equivalent: ["Commerce", "Exchange", "Merchandising", "Commercial"],
    synonyms: {
      ml: ["വ്യാപാരം", "കച്ചവടം", "വിപണി", "വാണിജ്യം", "ട്രേഡ്", "മാർക്കറ്റ്", "വിനിമയം", "കൈമാറ്റം", "വ്യാപാരസംരംഭം", "വാണിജ്യപ്രവൃത്തി"],
      ar: ["تجارة", "متاجرة", "التجارة", "المتاجرة", "بيع وشراء", "تجارة عامة", "تجارة بضائع", "تجار", "مقايضة", "المقايضة"],
      en: ["trade", "trading", "commerce", "merchandising", "exchange", "barter", "traffic", "dealings", "mercantile", "commercial", "trading goods"],
      tr: ["ticaret", "alışveriş", "ticaret yapma", "piyasacılık", "alım satım", "ticari işlem", "esnaflık", "tüccarlık", "pazarlık", "ticareti"],
    },
    supporting_concepts: ["profit", "exchange", "growth", "opportunity", "commerce", "abundance"],
    blocking_concepts: ["loss", "bankruptcy", "fraud", "debt", "stagnation", "default"],
    preferred_planets: ["mercury", "jupiter"],
    avoid_planets: ["saturn"],
    preferred_days: ["wed", "thu"],
    manuscript_keywords: {
      en: ["trade", "trading", "commerce", "merchandising", "exchange", "barter", "mercantile"],
      ar: ["تجارة", "متاجرة", "بيع وشراء", "تجارة عامة", "مقايضة"],
      ml: ["വ്യാപാരം", "കച്ചവടം", "വിപണി", "വാണിജ്യം", "വിനിമയം"],
      tr: ["ticaret", "alışveriş", "alım satım", "ticari işlem", "esnaflık"],
    },
  },

  // ── 9. PARTNERSHIP ─────────────────────────────────────────
  partnership: {
    id: "partnership",
    label: { ml: "പങ്കാളിത്തം", en: "Partnership", ar: "شراكة" },
    parent: "union",
    children: ["Joint Venture", "Collaboration", "Alliance", "Coalition", "Cooperation"],
    related: ["Collaboration", "Alliance", "Cooperation", "Joint Venture", "Coalition", "Union", "Business"],
    equivalent: ["Collaboration", "Alliance", "Cooperation", "Joint Venture"],
    synonyms: {
      ml: ["പങ്കാളിത്തം", "കൂട്ടുകാര്യം", "ഷിര്കത്", "പങ്കാളി", "സഹകരണം", "സംയുക്തസംരംഭം", "വ്യാപാരപങ്കാളിത്തം", "കൂട്ടുത്തരം", "സഖ്യം", "കൂട്ടായ്മ"],
      ar: ["شراكة", "شركة", "الشراكة", "الشركة", "مشاركة", "المشاركة", "تحالف", "التحالف", "تعاون", "التعاون", "شراكة تجارية"],
      en: ["partnership", "collaboration", "alliance", "cooperation", "joint venture", "coalition", "union", "affiliation", "consortium", "business partner", "partner"],
      tr: ["ortaklık", "şirket", "işbirliği", "ortak girişim", "koalisyon", "ittifak", "birlik", "iştirak", "beraberlik", "partnerlik"],
    },
    supporting_concepts: ["harmony", "cooperation", "unity", "trust", "growth", "mutual benefit"],
    blocking_concepts: ["betrayal", "conflict", "dissolution", "dispute", "fraud", "separation"],
    preferred_planets: ["jupiter", "venus"],
    avoid_planets: ["saturn", "mars"],
    preferred_days: ["thu", "fri"],
    manuscript_keywords: {
      en: ["partnership", "collaboration", "alliance", "cooperation", "joint venture", "coalition"],
      ar: ["شراكة", "شركة", "مشاركة", "تحالف", "تعاون"],
      ml: ["പങ്കാളിത്തം", "ഷിര്കത്", "സഹകരണം", "സംയുക്തസംരംഭം", "സഖ്യം"],
      tr: ["ortaklık", "şirket", "işbirliği", "ortak girişim", "ittifak"],
    },
  },

  // ── 10. CONTRACTS ──────────────────────────────────────────
  contracts: {
    id: "contracts",
    label: { ml: "കരാർ", en: "Contracts", ar: "عقد" },
    parent: "commerce",
    children: ["Agreement", "Treaty", "Pact", "Covenant", "Undertaking"],
    related: ["Agreement", "Treaty", "Pact", "Deal", "Arrangement", "Covenant", "Commitment", "Signing"],
    equivalent: ["Agreement", "Treaty", "Pact", "Covenant", "Bond"],
    synonyms: {
      ml: ["കരാർ", "കരാറെഴുത്ത്", "ഉടമ്പടി", "അഖ്ദ്", "കരാറിടൽ", "കരാറുചെയ്യൽ", "ഏൽപ്പിടി", "സന്ധി", "വാഗ്ദാനം", "ഉടമ്പടിചെയ്യൽ", "അനുബന്ധം"],
      ar: ["عقد", "اتفاق", "العقد", "الاتفاق", "ميثاق", "الميثاق", "معاهدة", "المعاهدة", "تعاقد", "التعاقد", "عقد اتفاق"],
      en: ["contracts", "contract", "agreement", "treaty", "pact", "deal", "arrangement", "covenant", "commitment", "undertaking", "bond", "signing", "agreement"],
      tr: ["sözleşme", "kontrat", "anlaşma", "akdetme", "sözleşme imzalama", "mukavele", "antlaşma", "anlaşma yapma", "taahhüt", "sözleşmeleri"],
    },
    supporting_concepts: ["agreement", "commitment", "trust", "binding", "obligation", "formalization"],
    blocking_concepts: ["breach", "dispute", "fraud", "annulment", "violation", "dissolution"],
    preferred_planets: ["mercury", "jupiter"],
    avoid_planets: ["mars"],
    preferred_days: ["wed", "thu"],
    manuscript_keywords: {
      en: ["contracts", "contract", "agreement", "treaty", "pact", "covenant", "commitment", "signing"],
      ar: ["عقد", "اتفاق", "ميثاق", "معاهدة", "تعاقد"],
      ml: ["കരാർ", "കരാറെഴുത്ത്", "ഉടമ്പടി", "അഖ്ദ്", "സന്ധി"],
      tr: ["sözleşme", "kontrat", "anlaşma", "mukavele", "taahhüt"],
    },
  },

  // ── 11. HOUSE_BUILDING ─────────────────────────────────────
  house_building: {
    id: "house_building",
    label: { ml: "വീട് പണിയൽ", en: "House Building", ar: "بناء دار" },
    parent: "creation",
    children: ["Home Construction", "Residential Building", "Dwelling Construction", "Home Building"],
    related: ["Construction", "Building", "Foundation", "Masonry", "Architecture", "Structure"],
    equivalent: ["Home Construction", "Residential Building", "House Construction", "Dwelling Construction"],
    synonyms: {
      ml: ["വീട് പണിയൽ", "വീടുനിർമ്മാണം", "ഭവനനിർമ്മാണം", "വീടുപണി", "ഗൃഹനിർമ്മാണം", "വീട്", "ഭവനം", "ഗൃഹം", "വീടുവെക്കൽ", "വീടുകെട്ടൽ", "ഗൃഹനിർമ്മിക്കൽ"],
      ar: ["بناء دار", "بناء بيت", "بناء منزل", "بناء البيت", "تشييد منزل", "بناء المسكن", "إنشاء بيت", "بناء سكن", "إقامة دار", "بناء مسكن"],
      en: ["house building", "home construction", "residential building", "house construction", "building a house", "building a home", "residential construction", "home building", "dwelling construction", "house erection"],
      tr: ["ev yapma", "ev inşa", "bina inşa etme", "konut yapımı", "ev inşası", "mesken yapımı", "ev yapımı", "konut inşası", "ev yapımı", "bina etme"],
    },
    supporting_concepts: ["stability", "shelter", "permanence", "family", "growth", "foundation"],
    blocking_concepts: ["collapse", "destruction", "defect", "delay", "dispute", "structural failure"],
    preferred_planets: ["saturn", "sun"],
    avoid_planets: ["mars"],
    preferred_days: ["sat", "sun"],
    manuscript_keywords: {
      en: ["house building", "home construction", "residential building", "house construction", "building a house"],
      ar: ["بناء دار", "بناء بيت", "بناء منزل", "تشييد منزل", "بناء المسكن"],
      ml: ["വീട് പണിയൽ", "വീടുനിർമ്മാണം", "ഭവനനിർമ്മാണം", "ഗൃഹനിർമ്മാണം"],
      tr: ["ev yapma", "ev inşa", "konut yapımı", "ev inşası", "mesken yapımı"],
    },
  },

  // ── 12. FOUNDATION_LAYING ──────────────────────────────────
  foundation_laying: {
    id: "foundation_laying",
    label: { ml: "തറയിടൽ", en: "Foundation Laying", ar: "وضع الأساس" },
    parent: "creation",
    children: ["Groundwork", "Cornerstone", "Foundation Ceremony", "Ground Breaking"],
    related: ["Construction", "Foundation", "Groundwork", "Building", "Excavation", "Masonry"],
    equivalent: ["Groundwork", "Cornerstone", "Foundation Ceremony", "Ground Breaking"],
    synonyms: {
      ml: ["തറയിടൽ", "അടിത്തറയിടൽ", "അടിസ്ഥാനം ഇടൽ", "കുറ്റിയടിക്കൽ", "തറയിടുക", "അടിത്തറ", "തറ", "അടിസ്ഥാനം", "മൂലസ്ഥാപനം", "തറഇടൽ", "അടിത്തറഇടൽ"],
      ar: ["وضع الأساس", "تأسيس", "التأسيس", "وضع الأساسات", "أساس", "الأساس", "أساس البناء", "أرض البناء", "حجر الأساس", "أرسى", "إرساء"],
      en: ["foundation laying", "laying foundation", "groundwork", "foundation", "cornerstone", "foundation ceremony", "breaking ground", "laying the foundation", "foundation construction", "ground breaking", "laying groundwork"],
      tr: ["temel atma", "temel atışı", "temel kurma", "temel oturtma", "temel atma töreni", "temel serme", "harç dökme", "ilk taşı koyma", "temel atma"],
    },
    supporting_concepts: ["stability", "permanence", "strength", "solidity", "durability", "groundwork"],
    blocking_concepts: ["instability", "collapse", "weakness", "destruction", "foundation failure", "subsidence"],
    preferred_planets: ["saturn"],
    avoid_planets: ["mars"],
    preferred_days: ["sat"],
    manuscript_keywords: {
      en: ["foundation laying", "laying foundation", "groundwork", "cornerstone", "foundation ceremony", "ground breaking"],
      ar: ["وضع الأساس", "تأسيس", "أساس", "حجر الأساس", "أرسى"],
      ml: ["തറയിടൽ", "അടിത്തറയിടൽ", "അടിസ്ഥാനം ഇടൽ", "കുറ്റിയടിക്കൽ"],
      tr: ["temel atma", "temel atışı", "temel kurma", "temel oturtma"],
    },
  },

  // ── 13. MOVING_HOUSE ───────────────────────────────────────
  moving_house: {
    id: "moving_house",
    label: { ml: "വീടുമാറ്റം", en: "Moving House", ar: "انتقال" },
    parent: "movement",
    children: ["Relocation", "Residential Move", "Household Move", "Moving Out"],
    related: ["Travel", "Relocation", "Migration", "Journey", "Departure", "Change"],
    equivalent: ["Relocation", "Residential Move", "Household Move", "Moving"],
    synonyms: {
      ml: ["വീടുമാറ്റം", "സ്ഥലംമാറ്റം", "പ്രയാണം", "മാറിത്താമസിക്കൽ", "വീടുമാറൽ", "നീക്കം", "താമസംമാറ്റം", "ഗൃഹംമാറ്റം", "മാറിപ്പാർക്കൽ", "സ്ഥലംമാറൽ"],
      ar: ["انتقال", "نقل", "الانتقال", "النقل", "نقل عفش", "نقل أثاث", "تغيير مسكن", "تغيير سكن", "هجرة", "مغادرة"],
      en: ["moving house", "relocation", "moving", "moving home", "changing residence", "household move", "residential move", "move", "moving out", "relocating", "moving to a new house"],
      tr: ["taşınma", "nakliye", "ev taşıma", "taşınmak", "göç", "göç etme", "yer değiştirme", "taşınma işi", "ev değiştirme", " taşınış"],
    },
    supporting_concepts: ["change", "movement", "fresh start", "opportunity", "transition", "relocation"],
    blocking_concepts: ["disruption", "loss", "conflict", "delay", "damage", "obstruction"],
    preferred_planets: ["moon", "mercury"],
    avoid_planets: ["saturn"],
    preferred_days: ["mon", "wed"],
    manuscript_keywords: {
      en: ["moving house", "relocation", "moving", "moving home", "changing residence", "household move"],
      ar: ["انتقال", "نقل", "نقل عفش", "تغيير مسكن", "هجرة"],
      ml: ["വീടുമാറ്റം", "സ്ഥലംമാറ്റം", "മാറിത്താമസിക്കൽ", "താമസംമാറ്റം"],
      tr: ["taşınma", "nakliye", "ev taşıma", "göç", "yer değiştirme"],
    },
  },

  // ── 14. VEHICLE_PURCHASE ───────────────────────────────────
  vehicle_purchase: {
    id: "vehicle_purchase",
    label: { ml: "വാഹനം വാങ്ങൽ", en: "Vehicle Purchase", ar: "شراء سيارة" },
    parent: "commerce",
    children: ["Car Purchase", "Auto Purchase", "Vehicle Acquisition", "Buying a Car"],
    related: ["Buying", "Purchase", "Acquisition", "Vehicle", "Automobile", "Transport"],
    equivalent: ["Car Purchase", "Auto Purchase", "Vehicle Acquisition", "Automobile Purchase"],
    synonyms: {
      ml: ["വാഹനം വാങ്ങൽ", "കാർ വാങ്ങൽ", "വാഹനസ്വന്തമാക്കൽ", "വണ്ടിവാങ്ങൽ", "യന്ത്രവാഹനം", "ഓട്ടോമൊബൈൽ", "വാഹനം", "മോട്ടോർ", "കാർ", "വണ്ടിയെടുക്കൽ", "വാഹനവാങ്ങൽ"],
      ar: ["شراء سيارة", "شراء مركبة", "شراء عربة", "اقتناء سيارة", "اقتناء مركبة", "شراء سيارات", "شراء عربة", "شراء مركبات"],
      en: ["vehicle purchase", "buying a car", "buying a vehicle", "car purchase", "auto purchase", "automobile purchase", "vehicle acquisition", "buying an automobile", "purchasing a car", "buying a motor"],
      tr: ["araç satın alma", "araba alma", "taşıt satın alma", "motorlu taşıt alma", "otomobil alma", "vasıta alımı", "araç alışı", "araba satın almak"],
    },
    supporting_concepts: ["mobility", "ownership", "investment", "convenience", "transport", "acquisition"],
    blocking_concepts: ["accident", "defect", "debt", "theft", "breakdown", "loss"],
    preferred_planets: ["mercury", "venus"],
    avoid_planets: ["saturn"],
    preferred_days: ["wed", "fri"],
    manuscript_keywords: {
      en: ["vehicle purchase", "car purchase", "auto purchase", "vehicle acquisition", "buying a car", "buying a vehicle"],
      ar: ["شراء سيارة", "شراء مركبة", "اقتناء سيارة"],
      ml: ["വാഹനം വാങ്ങൽ", "കാർ വാങ്ങൽ", "വണ്ടിവാങ്ങൽ", "വാഹനസ്വന്തമാക്കൽ"],
      tr: ["araç satın alma", "araba alma", "taşıt satın alma", "otomobil alma"],
    },
  },

  // ── 15. ANIMAL_PURCHASE ────────────────────────────────────
  animal_purchase: {
    id: "animal_purchase",
    label: { ml: "മൃഗം വാങ്ങൽ", en: "Animal Purchase", ar: "شراء حيوان" },
    parent: "commerce",
    children: ["Livestock Purchase", "Cattle Buying", "Buying Animals", "Beast Acquisition"],
    related: ["Buying", "Purchase", "Livestock", "Cattle", "Agriculture", "Farm"],
    equivalent: ["Livestock Purchase", "Cattle Buying", "Animal Acquisition"],
    synonyms: {
      ml: ["മൃഗം വാങ്ങൽ", "മൃഗസ്വന്തമാക്കൽ", "മൃഗങ്ങളെവാങ്ങൽ", "കന്നുകാലി", "മൃഗവാങ്ങൽ", "മൃഗക്കച്ചവടം", "പശുവാങ്ങൽ", "ആടുവാങ്ങൽ", "കന്നുകാലിവാങ്ങൽ", "മൃഗങ്ങൾ"],
      ar: ["شراء حيوان", "شراء بهيمة", "شراء دابة", "شراء مواشي", "اقتناء حيوان", "شراء حيوانات", "شراء الأنعام", "شراء ماشية", "شراء خيل"],
      en: ["animal purchase", "buying animals", "buying livestock", "buying cattle", "purchasing animals", "animal acquisition", "buying beasts", "livestock purchase", "buying sheep", "buying cattle"],
      tr: ["hayvan satın alma", "hayvan alış", "canlı satın alma", "davar alma", "büyükbaş alma", "küçükbaş alma", "hayvan alımı", "mandıra alımı", "ahır hayvanı alma"],
    },
    supporting_concepts: ["ownership", "livelihood", "investment", "agriculture", "provision", "breeding"],
    blocking_concepts: ["disease", "loss", "death", "defect", "theft", "waste"],
    preferred_planets: ["moon", "venus"],
    avoid_planets: ["mars"],
    preferred_days: ["mon", "fri"],
    manuscript_keywords: {
      en: ["animal purchase", "buying animals", "buying livestock", "buying cattle", "livestock purchase"],
      ar: ["شراء حيوان", "شراء بهيمة", "شراء مواشي", "شراء الأنعام"],
      ml: ["മൃഗം വാങ്ങൽ", "കന്നുകാലി", "മൃഗവാങ്ങൽ", "പശുവാങ്ങൽ"],
      tr: ["hayvan satın alma", "hayvan alış", "davar alma", "büyükbaş alma"],
    },
  },

  // ── 16. PLANTING ───────────────────────────────────────────
  planting: {
    id: "planting",
    label: { ml: "വിത്തിടൽ", en: "Planting", ar: "زرع" },
    parent: "cultivation",
    children: ["Sowing", "Seeding", "Cultivation", "Crop Planting", "Seed Planting"],
    related: ["Agriculture", "Sowing", "Cultivation", "Crops", "Farming", "Gardening", "Growing"],
    equivalent: ["Sowing", "Seeding", "Cultivation", "Crop Planting"],
    synonyms: {
      ml: ["വിത്തിടൽ", "നടീൽ", "വിതയ്ക്കൽ", "നടുക", "വിത്ത്നടൽ", "കൃഷിയിടൽ", "നാട്ടുക", "വിതൽ", "നടുവാൻ", "വിത്തുവിതയ്ക്കൽ", "നട്ടുപിടിപ്പിക്കൽ"],
      ar: ["زرع", "غرس", "بذر", "الزرع", "الغرس", "البذر", "حرث", "الحرث", "زراعة", "الزراعة", "تخريش", "غرس شجر"],
      en: ["planting", "sowing", "seeding", "cultivation", "growing", "sowing seeds", "planting seeds", "crop planting", "seed planting", "seeding", "sowing crops", "plant"],
      tr: ["ekim", "dikim", "ekme", "dikme", "tohum ekme", "fidan dikme", "tarla ekme", "bitki dikme", "ekim yapma", "dikim yapma"],
    },
    supporting_concepts: ["growth", "fertility", "life", "nourishment", "abundance", "sustenance"],
    blocking_concepts: ["drought", "blight", "pest", "crop failure", "barrenness", "frost"],
    preferred_planets: ["moon", "venus"],
    avoid_planets: ["mars", "saturn"],
    preferred_days: ["mon", "fri"],
    manuscript_keywords: {
      en: ["planting", "sowing", "seeding", "cultivation", "sowing seeds", "planting seeds", "crop planting"],
      ar: ["زرع", "غرس", "بذر", "حرث", "زراعة"],
      ml: ["വിത്തിടൽ", "നടീൽ", "വിതയ്ക്കൽ", "വിത്ത്നടൽ", "നടുക"],
      tr: ["ekim", "dikim", "ekme", "dikme", "tohum ekme", "fidan dikme"],
    },
  },

  // ── 17. HARVESTING ─────────────────────────────────────────
  harvesting: {
    id: "harvesting",
    label: { ml: "വിളവെടുപ്പ്", en: "Harvesting", ar: "حصاد" },
    parent: "cultivation",
    children: ["Reaping", "Gathering", "Picking", "Crop Harvesting", "Harvest Season"],
    related: ["Agriculture", "Harvest", "Crops", "Reaping", "Gathering", "Farming", "Yield"],
    equivalent: ["Reaping", "Gathering", "Picking", "Crop Gathering"],
    synonyms: {
      ml: ["വിളവെടുപ്പ്", "അറുവട", "വിളവെടുക്കൽ", "അറുവെടുപ്പ്", "കൊയ്യൽ", "കൊയ്ത്ത്", "വിളവ്", "അറുവടയെടുക്കൽ", "കൊയ്ത്തെടുക്കൽ", "വിളവെടു", "ശേഖരണം"],
      ar: ["حصاد", "قطاف", "الحصاد", "القطاف", "جز", "الجز", "حصد", "الحصد", "قطف", "القطف", "جنى", "الجنى", "جمع المحصول"],
      en: ["harvesting", "reaping", "gathering", "picking", "crop harvesting", "harvesting crops", "reaping", "gathering crops", "picking crops", "harvest season", "harvest"],
      tr: ["hasat", "biçerdöver", "hasat etme", "biçme", "ürün toplama", "devşirme", "mahsul toplama", "biçin", "hasat zamanı", "derleme"],
    },
    supporting_concepts: ["abundance", "yield", "prosperity", "completion", "reward", "fruition"],
    blocking_concepts: ["crop failure", "loss", "spoilage", "blight", "waste", "drought"],
    preferred_planets: ["sun", "mercury"],
    avoid_planets: ["saturn"],
    preferred_days: ["sun", "wed"],
    manuscript_keywords: {
      en: ["harvesting", "reaping", "gathering", "picking", "crop harvesting", "harvest season"],
      ar: ["حصاد", "قطاف", "جز", "حصد", "قطف", "جنى"],
      ml: ["വിളവെടുപ്പ്", "അറുവട", "കൊയ്യൽ", "കൊയ്ത്ത്", "വിളവ്"],
      tr: ["hasat", "biçme", "ürün toplama", "mahsul toplama", "biçin"],
    },
  },

  // ── 18. WATER_DIGGING ──────────────────────────────────────
  water_digging: {
    id: "water_digging",
    label: { ml: "കിണർ കുഴിക്കൽ", en: "Water Digging", ar: "حفر بئر" },
    parent: "creation",
    children: ["Well Digging", "Well Construction", "Borehole", "Water Source", "Excavation"],
    related: ["Excavation", "Digging", "Water", "Well", "Construction", "Foundation", "Earth"],
    equivalent: ["Well Digging", "Well Construction", "Borehole", "Water Excavation"],
    synonyms: {
      ml: ["കിണർ കുഴിക്കൽ", "ജലഖനനം", "കിണറുകുഴിക്കൽ", "വെള്ളംകുഴിക്കൽ", "കിണർ", "ജലസ്രോതസ്സ്", "കുഴിക്കൽ", "കിണറുനിർമ്മാണം", "കിണറുവെക്കൽ", "നീർകുഴി", "ജലക്കിണർ"],
      ar: ["حفر بئر", "حفر", "الحفر", "حفر بئر ماء", "حفر فراغ", "استخراج ماء", "حفر الآبار", "حفر صهريج", "حفر نقب", "حفر عين"],
      en: ["water digging", "well digging", "digging a well", "well construction", "water source", "excavating well", "borehole", "well sinking", "water excavation", "digging", "well boring"],
      tr: ["kuyu kazma", "su kuyusu açma", "kuyu açma", "su çıkarma", "yer altı suyu", "kuyu kazımı", "su kuyusu", "artezyen", "sondaj", "kuyu"],
    },
    supporting_concepts: ["water", "sustenance", "life", "resource", "provision", "depth"],
    blocking_concepts: ["cave-in", "flooding", "dry well", "collapse", "contamination", "obstruction"],
    preferred_planets: ["saturn", "moon"],
    avoid_planets: ["mars"],
    preferred_days: ["sat", "mon"],
    manuscript_keywords: {
      en: ["water digging", "well digging", "digging a well", "well construction", "borehole", "water source"],
      ar: ["حفر بئر", "حفر", "حفر بئر ماء", "حفر الآبار", "استخراج ماء"],
      ml: ["കിണർ കുഴിക്കൽ", "ജലഖനനം", "കിണറുകുഴിക്കൽ", "വെള്ളംകുഴിക്കൽ"],
      tr: ["kuyu kazma", "su kuyusu açma", "kuyu açma", "su çıkarma", "sondaj"],
    },
  },

  // ── 19. RUQYAH ─────────────────────────────────────────────
  ruqyah: {
    id: "ruqyah",
    label: { ml: "റുഖ്യ", en: "Ruqyah", ar: "رقية" },
    parent: "healing",
    children: ["Spiritual Healing", "Exorcism", "Jinn Removal", "Evil Eye Removal"],
    related: ["Healing", "Protection", "Prayer", "Spiritual", "Exorcism", "Divine Healing"],
    equivalent: ["Spiritual Healing", "Exorcism", "Divine Healing", "Spiritual Treatment"],
    synonyms: {
      ml: ["റുഖ്യ", "റുഖ്യചെയ്യൽ", "ആത്മികചികിത്സ", "ജിൻവിമുക്തി", "പിശാച്ചികിത്സ", "റുക്യ", "കഴുക്കി", "മന്ത്രം", "ഫാതിഹ", "റുഖ്യശരീഫ്", "സിഹ്റ്"],
      ar: ["رقية", "رقية شرعية", "الرقية", "الرقية الشرعية", "تعويذ", "تعاويذ", "استشفاء", "إخراج جن", "علاج روحي", "رقية بالقرآن", "استرخاء"],
      en: ["ruqyah", "ruqia", "spiritual healing", "exorcism", "jinn removal", "evil eye removal", "spiritual treatment", "divine healing", "ruqyah shar'iyyah", "protection prayer", "ruqya"],
      tr: ["rukye", "rukye yapma", "rukye okuma", "manevi şifa", "cin çıkarma", "nazar değmesi", "büyü bozma", "tılsım", "dualı şifa", "rukye okunuşu"],
    },
    supporting_concepts: ["healing", "protection", "divine", "purity", "faith", "restoration"],
    blocking_concepts: ["jinn", "evil eye", "sorcery", "affliction", "impurity", "negligence"],
    preferred_planets: ["sun", "jupiter"],
    avoid_planets: ["saturn"],
    preferred_days: ["sun", "thu"],
    manuscript_keywords: {
      en: ["ruqyah", "ruqia", "spiritual healing", "exorcism", "jinn removal", "evil eye removal", "divine healing"],
      ar: ["رقية", "رقية شرعية", "استشفاء", "إخراج جن", "علاج روحي"],
      ml: ["റുഖ്യ", "ആത്മികചികിത്സ", "ജിൻവിമുക്തി", "പിശാച്ചികിത്സ"],
      tr: ["rukye", "manevi şifa", "cin çıkarma", "nazar değmesi", "büyü bozma"],
    },
  },

  // ── 20. PRAYER ─────────────────────────────────────────────
  prayer: {
    id: "prayer",
    label: { ml: "പ്രാർത്ഥന", en: "Prayer", ar: "صلاة" },
    parent: "devotion",
    children: ["Supplication", "Worship", "Invocation", "Devotion", "Orison"],
    related: ["Worship", "Devotion", "Supplication", "Spiritual", "Dhikr", "Contemplation", "Sacred"],
    equivalent: ["Supplication", "Worship", "Invocation", "Devotion", "Orison"],
    synonyms: {
      ml: ["പ്രാർത്ഥന", "നമസ്കാരം", "ദുആ", "പ്രാർത്ഥിക്കൽ", "വന്ദനം", "സുറിയ", "സ്തോത്രം", "അപേക്ഷ", "മൊഴി", "മോനം", "പ്രാർത്ഥനചെയ്യൽ", "അപേക്ഷിക്കൽ"],
      ar: ["صلاة", "دعاء", "الصلاة", "الدعاء", "عبادة", "العبادة", "مناجاة", "المناجاة", "تسبيح", "ابتهال", "الابتهال", "صلاة"],
      en: ["prayer", "dua", "supplication", "worship", "devotion", "invocation", "liturgy", "service", "praying", "du'a", "orison", "devotional", "intercession"],
      tr: ["dua", "namaz", "ibadet", "dua etme", "namaz kılma", "ibadet etme", "niyaz", "yakarış", "ayin", "ibadet hizmeti", "namazı"],
    },
    supporting_concepts: ["devotion", "purity", "connection", "peace", "blessing", "elevation"],
    blocking_concepts: ["worldly distraction", "negligence", "impurity", "heedlessness", "disconnection", "sin"],
    preferred_planets: ["jupiter", "saturn"],
    avoid_planets: ["mars"],
    preferred_days: ["thu", "sat"],
    manuscript_keywords: {
      en: ["prayer", "dua", "supplication", "worship", "devotion", "invocation", "liturgy"],
      ar: ["صلاة", "دعاء", "عبادة", "مناجاة", "تسبيح", "ابتهال"],
      ml: ["പ്രാർത്ഥന", "നമസ്കാരം", "ദുആ", "വന്ദനം", "സ്തോത്രം"],
      tr: ["dua", "namaz", "ibadet", "niyaz", "yakarış", "ayin"],
    },
  },

  // ── 21. DHIKR ──────────────────────────────────────────────
  dhikr: {
    id: "dhikr",
    label: { ml: "ദിക്റ്", en: "Dhikr", ar: "ذكر" },
    parent: "devotion",
    children: ["Remembrance", "Recitation", "Chanting", "Devotional Recitation", "Invocation"],
    related: ["Prayer", "Worship", "Devotion", "Spiritual", "Recitation", "Remembrance", "Contemplation"],
    equivalent: ["Remembrance", "Recitation", "Chanting", "Devotional Recitation"],
    synonyms: {
      ml: ["ദിക്റ്", "സ്മരണ", "സ്മരിക്കൽ", "അല്ലാഹുവിനെസ്മരിക്കൽ", "ജപം", "സ്തുതി", "ദികിർ", "സ്മരണം", "ആവർത്തനം", "കീർത്തനം", "ദിക്റ്ചെയ്യൽ"],
      ar: ["ذكر", "تسبيح", "الذكر", "التسبيح", "استغفار", "الاستغفار", "تهليل", "التهليل", "تقديس", "تسبيح", "بُكاء", "ورد"],
      en: ["dhikr", "zikr", "remembrance", "recitation", "chanting", "devotional recitation", "zikr", "invocation", "reciting names", "divine remembrance", "litany"],
      tr: ["zikir", "zikretme", "tespih", "zikir çekme", "Allah'ı anma", "anma", "tekrar", "zikir etme", "zikirullah", "evrad"],
    },
    supporting_concepts: ["devotion", "purity", "connection", "peace", "elevation", "remembrance"],
    blocking_concepts: ["forgetfulness", "distraction", "negligence", "heedlessness", "worldly attachment", "impurity"],
    preferred_planets: ["jupiter", "saturn"],
    avoid_planets: ["mars"],
    preferred_days: ["thu", "sat"],
    manuscript_keywords: {
      en: ["dhikr", "zikr", "remembrance", "recitation", "chanting", "devotional recitation", "divine remembrance"],
      ar: ["ذكر", "تسبيح", "استغفار", "تهليل", "تقديس", "ورد"],
      ml: ["ദിക്റ്", "സ്മരണ", "സ്മരിക്കൽ", "ജപം", "സ്തുതി"],
      tr: ["zikir", "zikretme", "tespih", "zikir çekme", "Allah'ı anma"],
    },
  },

  // ── 22. CHARITY ────────────────────────────────────────────
  charity: {
    id: "charity",
    label: { ml: "ദാനം", en: "Charity", ar: "صدقة" },
    parent: "devotion",
    children: ["Sadaqah", "Donation", "Alms", "Philanthropy", "Benevolence"],
    related: ["Generosity", "Giving", "Benevolence", "Wealth", "Devotion", "Kindness", "Blessing"],
    equivalent: ["Sadaqah", "Donation", "Alms", "Philanthropy", "Benevolence"],
    synonyms: {
      ml: ["ദാനം", "സദഖ", "ധർമ്മം", "ദാനധർമ്മം", "സഹായം", "കൊടുക്കൽ", "വഴിയൻ", "ദാനംചെയ്യൽ", "ഉപകാരം", "കാരുണ്യം", "സദഖ", "നൽകൽ", "ഇൻഫാഖ്"],
      ar: ["صدقة", "إحسان", "الصدقة", "الإحسان", "بر", "البر", "تبرع", "التبرع", "عطاء", "العطاء", "سخاء", "السخاء", "إنفاق"],
      en: ["charity", "sadaqah", "donation", "alms", "giving", "philanthropy", "contribution", "benevolence", "generosity", "charitable giving", "almsgiving", "donate"],
      tr: ["sadaka", "bağış", "hayır", "sadaka verme", "bağış yapma", "iyilik", "yardım", "infak", "zekat", "cömertlik", "hayır yapma"],
    },
    supporting_concepts: ["generosity", "blessing", "compassion", "kindness", "purification", "abundance"],
    blocking_concepts: ["miserliness", "greed", "withholding", "selfishness", "ingratitude", "stinginess"],
    preferred_planets: ["jupiter", "sun"],
    avoid_planets: ["saturn"],
    preferred_days: ["thu", "sun"],
    manuscript_keywords: {
      en: ["charity", "sadaqah", "donation", "alms", "philanthropy", "benevolence", "generosity", "charitable giving"],
      ar: ["صدقة", "إحسان", "بر", "تبرع", "عطاء", "سخاء", "إنفاق"],
      ml: ["ദാനം", "സദഖ", "ധർമ്മം", "സഹായം", "ഇൻഫാഖ്"],
      tr: ["sadaka", "bağış", "hayır", "yardım", "infak", "zekat"],
    },
  },

  // ── 23. HAJJ ───────────────────────────────────────────────
  hajj: {
    id: "hajj",
    label: { ml: "ഹജ്ജ്", en: "Hajj", ar: "حج" },
    parent: "devotion",
    children: ["Pilgrimage", "Mecca Pilgrimage", "Holy Pilgrimage", "Annual Pilgrimage"],
    related: ["Pilgrimage", "Travel", "Devotion", "Worship", "Prayer", "Umrah", "Mecca", "Kaaba"],
    equivalent: ["Pilgrimage", "Mecca Pilgrimage", "Holy Pilgrimage"],
    synonyms: {
      ml: ["ഹജ്ജ്", "ഹജ്", "തീർത്ഥാടനം", "മക്കയാത്ര", "ഹജ്ജ്യാത്ര", "തീർത്ഥം", "ഹജ്ജ്കർമ്മം", "അറഫാ", "കഅ്ബ", "ഹജ്ജിലേക്ക്", "ഹജ്ജ്വരം"],
      ar: ["حج", "حجة", "الحج", "الحجة", "حج بيت الله", "حج مكة", "حج البيت الحرام", "أداء فريضة الحج", "موسم الحج", "الحجاج"],
      en: ["hajj", "haj", "pilgrimage", "hajj pilgrimage", "mecca pilgrimage", "holy pilgrimage", "annual pilgrimage", "hajji", "pilgrimage to Mecca", "hajj journey"],
      tr: ["hac", "hacc", "hacca gitme", "hac ziyareti", "mukaddes ziyaret", "Kabe ziyareti", "hac görevi", "hac farizası", "hac mevsimi", "hacı"],
    },
    supporting_concepts: ["devotion", "pilgrimage", "unity", "submission", "blessing", "spiritual journey"],
    blocking_concepts: ["obstruction", "illness", "delay", "hardship", "impurity", "disruption"],
    preferred_planets: ["jupiter", "sun"],
    avoid_planets: ["saturn"],
    preferred_days: ["thu", "sun"],
    manuscript_keywords: {
      en: ["hajj", "haj", "pilgrimage", "mecca pilgrimage", "holy pilgrimage", "annual pilgrimage", "pilgrimage to Mecca"],
      ar: ["حج", "حجة", "حج بيت الله", "حج مكة", "حج البيت الحرام", "موسم الحج"],
      ml: ["ഹജ്ജ്", "തീർത്ഥാടനം", "മക്കയാത്ര", "ഹജ്ജ്യാത്ര", "തീർത്ഥം"],
      tr: ["hac", "hacc", "hacca gitme", "hac ziyareti", "Kabe ziyareti", "hac görevi"],
    },
  },

  // ── 24. UMRAH ──────────────────────────────────────────────
  umrah: {
    id: "umrah",
    label: { ml: "ഉംറ", en: "Umrah", ar: "عمرة" },
    parent: "devotion",
    children: ["Lesser Pilgrimage", "Minor Pilgrimage", "Voluntary Pilgrimage", "Umrah Pilgrimage"],
    related: ["Pilgrimage", "Travel", "Devotion", "Worship", "Prayer", "Hajj", "Mecca", "Kaaba"],
    equivalent: ["Lesser Pilgrimage", "Minor Pilgrimage", "Voluntary Pilgrimage"],
    synonyms: {
      ml: ["ഉംറ", "ഉംറഹ്", "ചെറിയഹജ്ജ്", "ഉംറയാത്ര", "തീർത്ഥയാത്ര", "മക്കസന്ദർശനം", "കഅ്ബസന്ദർശനം", "ഉംറകർമ്മം", "ഉംറനിർവ്വഹണം"],
      ar: ["عمرة", "العمرة", "اعتمار", "الاعتمار", "عمرة البيت", "زيارة البيت الحرام", "عمرة مكة", "العمرة الصغرى"],
      en: ["umrah", "umra", "minor pilgrimage", "lesser pilgrimage", "umroh", "pilgrimage to Mecca", "voluntary pilgrimage", "umrah pilgrimage", "umra pilgrimage"],
      tr: ["umre", "umre yapma", "umre ziyareti", "küçük hac", "umre ibadeti", "umre görevi", "Kabe ziyareti", "umre farizası", "umretullah"],
    },
    supporting_concepts: ["devotion", "pilgrimage", "voluntary worship", "blessing", "spiritual journey", "submission"],
    blocking_concepts: ["obstruction", "illness", "delay", "hardship", "impurity", "disruption"],
    preferred_planets: ["mercury", "jupiter"],
    avoid_planets: ["saturn"],
    preferred_days: ["wed", "thu"],
    manuscript_keywords: {
      en: ["umrah", "umra", "minor pilgrimage", "lesser pilgrimage", "voluntary pilgrimage", "umrah pilgrimage"],
      ar: ["عمرة", "اعتمار", "عمرة البيت", "زيارة البيت الحرام", "العمرة الصغرى"],
      ml: ["ഉംറ", "ചെറിയഹജ്ജ്", "ഉംറയാത്ര", "മക്കസന്ദർശനം"],
      tr: ["umre", "umre yapma", "küçük hac", "umre ibadeti", "Kabe ziyareti"],
    },
  },

};

export default { EXTENDED_ENTRIES };
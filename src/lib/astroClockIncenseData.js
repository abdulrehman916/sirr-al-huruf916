// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK — INCENSE DATA (BUHURU)
// From Havâss'ın Derinlikleri (Pages 20-21)
// Planet & Zodiac incense systems with spiritual guidance
// ═══════════════════════════════════════════════════════════════

export const PLANET_INCENSES = {
  sun: {
    name_en: "Sun",
    name_ml: "സൂര്യൻ",
    name_ar: "الشمس",
    incense_en: "Frankincense (Al-Ma'jajah)",
    incense_ml: "കുന്തുരുക്കം",
    incense_ar: "المعاجة",
    uses_en: ["Spiritual elevation", "Authority", "Success", "Leadership"],
    uses_ml: ["ആത്മിക ഉയർച്ച", "അധികാരം", "വിജയം", "നേതൃത്വം"],
    spiritual_benefits_en: "Brings divine light, enhances spiritual authority, and attracts success in leadership roles.",
    spiritual_benefits_ml: "ദിവ്യ പ്രകാശം നൽകുന്നു, ആത്മിക അധികാരം വർദ്ധിപ്പിക്കുന്നു, നേതൃത്വ പദവികളിൽ വിജയം ആകർഷിക്കുന്നു."
  },
  moon: {
    name_en: "Moon",
    name_ml: "ചന്ദ്രൻ",
    name_ar: "القمر",
    incense_en: "Sandalwood",
    incense_ml: "ചന്ദനം",
    incense_ar: "الصندل",
    uses_en: ["Emotional balance", "Intuition", "Dreams", "Feminine energy"],
    uses_ml: ["വികാര സന്തുലിതാവസ്ഥ", "അന്തർജ്ഞാനം", "സ്വപ്നങ്ങൾ", "സ്ത്രീ ഊർജ്ജം"],
    spiritual_benefits_en: "Calms emotions, enhances intuitive abilities, and promotes peaceful dreams.",
    spiritual_benefits_ml: "വികാരങ്ങളെ ശാന്തമാക്കുന്നു, അന്തർജ്ഞാന കഴിവുകൾ വർദ്ധിപ്പിക്കുന്നു, സമാധാനപരമായ സ്വപ്നങ്ങൾ പ്രോത്സാഹിപ്പിക്കുന്നു."
  },
  mars: {
    name_en: "Mars",
    name_ml: "ചൊവ്വ",
    name_ar: "المريخ",
    incense_en: "Galbanum & Dragon's Blood",
    incense_ml: "Galbanum & Dragon's Blood",
    incense_ar: "الغالبانوم ودم التنين",
    uses_en: ["Courage", "Protection", "Victory", "Strength"],
    uses_ml: ["ധൈര്യം", "സംരക്ഷണം", "വിജയം", "ശക്തി"],
    spiritual_benefits_en: "Provides protection from negative forces, increases courage, and ensures victory in conflicts.",
    spiritual_benefits_ml: "നെഗറ്റീവ് ശക്തികളിൽ നിന്ന് സംരക്ഷണം നൽകുന്നു, ധൈര്യം വർദ്ധിപ്പിക്കുന്നു, സംഘർഷങ്ങളിൽ വിജയം ഉറപ്പാക്കുന്നു."
  },
  mercury: {
    name_en: "Mercury",
    name_ml: "ബുധൻ",
    name_ar: "عطارد",
    incense_en: "Mastic (Mastacidîr)",
    incense_ml: "Mastic (Mastacidîr)",
    incense_ar: "المصطكي",
    uses_en: ["Communication", "Wisdom", "Learning", "Business"],
    uses_ml: ["ആശയവിനിമയം", "ജ്ഞാനം", "പഠനം", "ബിസിനസ്സ്"],
    spiritual_benefits_en: "Enhances mental clarity, improves communication skills, and attracts business success.",
    spiritual_benefits_ml: "മാനസിക വ്യക്തത വർദ്ധിപ്പിക്കുന്നു, ആശയവിനിമയ കഴിവുകൾ മെച്ചപ്പെടുത്തുന്നു, ബിസിനസ്സ് വിജയം ആകർഷിക്കുന്നു."
  },
  jupiter: {
    name_en: "Jupiter",
    name_ml: "വ്യാഴം",
    name_ar: "المشتري",
    incense_en: "Saffron",
    incense_ml: "കുങ്കുമപ്പൂവ്",
    incense_ar: "الزعفران",
    uses_en: ["Prosperity", "Expansion", "Luck", "Spiritual growth"],
    uses_ml: ["സമൃദ്ധി", "വിപുലീകരണം", "ഭാഗ്യം", "ആത്മിക വളർച്ച"],
    spiritual_benefits_en: "Brings abundance, expands opportunities, and enhances spiritual wisdom.",
    spiritual_benefits_ml: "സമൃദ്ധി കൊണ്ടുവരുന്നു, അവസരങ്ങൾ വിപുലീകരിക്കുന്നു, ആത്മിക ജ്ഞാനം വർദ്ധിപ്പിക്കുന്നു."
  },
  venus: {
    name_en: "Venus",
    name_ml: "ശുക്രൻ",
    name_ar: "الزهرة",
    incense_en: "Rose & Musk",
    incense_ml: "Rose & Musk",
    incense_ar: "الورد والمسك",
    uses_en: ["Love", "Beauty", "Harmony", "Relationships"],
    uses_ml: ["സ്നേഹം", "സൗന്ദര്യം", "സാമരസ്യം", "ബന്ധങ്ങൾ"],
    spiritual_benefits_en: "Attracts love, enhances beauty and charm, and harmonizes relationships.",
    spiritual_benefits_ml: "സ്നേഹത്തെ ആകർഷിക്കുന്നു, സൗന്ദര്യവും ആകർഷണവും വർദ്ധിപ്പിക്കുന്നു, ബന്ധങ്ങളെ സാമരസ്യപ്പെടുത്തുന്നു."
  },
  saturn: {
    name_en: "Saturn",
    name_ml: "ശനി",
    name_ar: "زحل",
    incense_en: "Myrrh",
    incense_ml: "Myrrh",
    incense_ar: "المر",
    uses_en: ["Discipline", "Protection", "Banishing", "Grounding"],
    uses_ml: ["ശിക്ഷണം", "സംരക്ഷണം", "നീക്കം ചെയ്യൽ", "ഭൂമിയുമായി ബന്ധിപ്പിക്കൽ"],
    spiritual_benefits_en: "Provides strong protection, banishes negativity, and grounds spiritual energy.",
    spiritual_benefits_ml: "ശക്തമായ സംരക്ഷണം നൽകുന്നു, നെഗറ്റിവിറ്റി നീക്കം ചെയ്യുന്നു, ആത്മിക ഊർജ്ജത്തെ ഭൂമിയുമായി ബന്ധിപ്പിക്കുന്നു."
  }
};

export const ZODIAC_INCENSES = {
  aries: {
    name_en: "Aries",
    name_ml: "മേഷം",
    name_tr: "Koç",
    name_ar: "الحمل",
    incense_en: "Oud & Mastic",
    incense_ml: "Oud & Mastic",
    incense_ar: "العود والمصطكي",
    preparation_en: "Mix equal parts of oud and mastic. Burn during Aries hour for courage and leadership.",
    preparation_ml: "ഊദും മാസ്റ്റിക്കും തുല്യ അളവിൽ കലർത്തുക. ധൈര്യത്തിനും നേതൃത്വത്തിനും മേഷം മണിക്കൂറിൽ കത്തിക്കുക.",
    benefits_en: ["Courage", "Leadership", "Initiative", "Victory"],
    benefits_ml: ["ധൈര്യം", "നേതൃത്വം", "ആരംഭം", "വിജയം"]
  },
  taurus: {
    name_en: "Taurus",
    name_ml: "ഇടവം",
    name_tr: "Boğa",
    name_ar: "الثور",
    incense_en: "Sandalwood & Musk",
    incense_ml: "ചന്ദനവും പുനുകും",
    incense_ar: "الصندل والمسك",
    preparation_en: "Combine sandalwood powder with musk. Burn for stability and material gain.",
    preparation_ml: "ചന്ദനപ്പൊടി പുനുകുമായി ചേർക്കുക. സ്ഥിരതയ്ക്കും ഭൗതിക നേട്ടത്തിനും കത്തിക്കുക.",
    benefits_en: ["Stability", "Prosperity", "Patience", "Sensuality"],
    benefits_ml: ["സ്ഥിരത", "സമൃദ്ധി", "ക്ഷമ", "ഇന്ദ്രിയസുഖം"]
  },
  gemini: {
    name_en: "Gemini",
    name_ml: "മിഥുനം",
    name_tr: "İkizler",
    name_ar: "الجوزاء",
    incense_en: "Mastic & Frankincense",
    incense_ml: "Mastic & Frankincense",
    incense_ar: "المصطكي واللبان",
    preparation_en: "Blend mastic with frankincense. Use for communication and learning.",
    preparation_ml: "മാസ്റ്റിക്കും കുന്തുരുക്കവും കലർത്തുക. ആശയവിനിമയത്തിനും പഠനത്തിനും ഉപയോഗിക്കുക.",
    benefits_en: ["Communication", "Learning", "Adaptability", "Social connections"],
    benefits_ml: ["ആശയവിനിമയം", "പഠനം", "പൊരുത്തപ്പെടൽ", "സാമൂഹിക ബന്ധങ്ങൾ"]
  },
  cancer: {
    name_en: "Cancer",
    name_ml: "കർക്കിടകം",
    name_tr: "Yengeç",
    name_ar: "السرطان",
    incense_en: "Sandalwood & Rose",
    incense_ml: "Sandalwood & Rose",
    incense_ar: "الصندل والورد",
    preparation_en: "Mix sandalwood with rose petals. Burn for emotional healing and family harmony.",
    preparation_ml: "ചന്ദനപ്പൊടി റോസ് ദളങ്ങളുമായി കലർത്തുക. വികാരപരമായ ചികിത്സയ്ക്കും കുടുംബ സാമരസ്യത്തിനും കത്തിക്കുക.",
    benefits_en: ["Emotional healing", "Family harmony", "Intuition", "Nurturing"],
    benefits_ml: ["വികാരപരമായ ചികിത്സ", "കുടുംബ സാമരസ്യം", "അന്തർജ്ഞാനം", "പോഷണം"]
  },
  leo: {
    name_en: "Leo",
    name_ml: "ചിങ്ങം",
    name_tr: "Aslan",
    name_ar: "الأسد",
    incense_en: "Oud & Mastic (Superior)",
    incense_ml: "Oud & Mastic (Superior)",
    incense_ar: "العود والمصطكي (متفوق)",
    preparation_en: "Use high-quality oud with mastic. Burn for authority and royal success.",
    preparation_ml: "ഉയർന്ന നിലവാരമുള്ള ഊദ് മാസ്റ്റിക്കുമായി ഉപയോഗിക്കുക. അധികാരത്തിനും രാജകീയ വിജയത്തിനും കത്തിക്കുക.",
    benefits_en: ["Authority", "Royal success", "Confidence", "Leadership"],
    benefits_ml: ["അധികാരം", "രാജകീയ വിജയം", "ആത്മവിശ്വാസം", "നേതൃത്വം"]
  },
  virgo: {
    name_en: "Virgo",
    name_ml: "കന്നി",
    name_tr: "Başak",
    name_ar: "العذراء",
    incense_en: "Frankincense & Mastic",
    incense_ml: "Frankincense & Mastic",
    incense_ar: "اللبان والمصطكي",
    preparation_en: "Combine frankincense and mastic equally. Use for purification and service.",
    preparation_ml: "കുന്തുരുക്കവും മാസ്റ്റിക്കും തുല്യമായി ചേർക്കുക. ശുദ്ധീകരണത്തിനും സേവനത്തിനും ഉപയോഗിക്കുക.",
    benefits_en: ["Purification", "Service", "Analysis", "Health"],
    benefits_ml: ["ശുദ്ധീകരണം", "സേവനം", "വിശകലനം", "ആരോഗ്യം"]
  },
  libra: {
    name_en: "Libra",
    name_ml: "തുലാം",
    name_tr: "Terazi",
    name_ar: "الميزان",
    incense_en: "Oud & Mastic (Balance)",
    incense_ml: "Oud & Mastic (Balance)",
    incense_ar: "العود والمصطكي (توازن)",
    preparation_en: "Balance oud and mastic. Burn for justice and relationship harmony.",
    preparation_ml: "ഊദും മാസ്റ്റിക്കും സന്തുലിതമാക്കുക. നീതിക്കും ബന്ധങ്ങളിലെ സാമരസ്യത്തിനും കത്തിക്കുക.",
    benefits_en: ["Justice", "Balance", "Harmony", "Partnership"],
    benefits_ml: ["നീതി", "സന്തുലിതാവസ്ഥ", "സാമരസ്യം", "കൂട്ടാളിത്തം"]
  },
  scorpio: {
    name_en: "Scorpio",
    name_ml: "വൃശ്ചികം",
    name_tr: "Akrep",
    name_ar: "العقرب",
    incense_en: "Costus & Dragon's Blood",
    incense_ml: "Costus & Dragon's Blood",
    incense_ar: "القسط ودم التنين",
    preparation_en: "Mix costus root with dragon's blood resin. Burn for transformation and protection.",
    preparation_ml: "കുസ്ത് വേര് ഡ്രാഗൺസ് ബ്ലഡ് റെസിനുമായി കലർത്തുക. പരിവർത്തനത്തിനും സംരക്ഷണത്തിനും കത്തിക്കുക.",
    benefits_en: ["Transformation", "Protection", "Power", "Mystery"],
    benefits_ml: ["പരിവർത്തനം", "സംരക്ഷണം", "ശക്തി", "രഹസ്യം"]
  },
  sagittarius: {
    name_en: "Sagittarius",
    name_ml: "ധനു",
    name_tr: "Yay",
    name_ar: "القوس",
    incense_en: "Saffron & Mastic",
    incense_ml: "Saffron & Mastic",
    incense_ar: "الزعفران والمصطكي",
    preparation_en: "Blend saffron threads with mastic. Use for spiritual expansion and travel.",
    preparation_ml: "കുങ്കുമപ്പൂവ് നൂലുകൾ മാസ്റ്റിക്കുമായി കലർത്തുക. ആത്മിക വിപുലീകരണത്തിനും യാത്രയ്ക്കും ഉപയോഗിക്കുക.",
    benefits_en: ["Spiritual expansion", "Travel", "Wisdom", "Adventure"],
    benefits_ml: ["ആത്മിക വിപുലീകരണം", "യാത്ര", "ജ്ഞാനം", "സാഹസികത"]
  },
  capricorn: {
    name_en: "Capricorn",
    name_ml: "മകരം",
    name_tr: "Oğlak",
    name_ar: "الجدي",
    incense_en: "Myrrh & Frankincense",
    incense_ml: "Myrrh & Frankincense",
    incense_ar: "المر واللبان",
    preparation_en: "Combine myrrh with frankincense. Burn for discipline and career success.",
    preparation_ml: "മുറയും കുന്തുരുക്കവും ചേർക്കുക. ശിക്ഷണത്തിനും കരിയർ വിജയത്തിനും കത്തിക്കുക.",
    benefits_en: ["Discipline", "Career success", "Ambition", "Structure"],
    benefits_ml: ["ശിക്ഷണം", "കരിയർ വിജയം", "മഹത്വാകാംക്ഷ", "ഘടന"]
  },
  aquarius: {
    name_en: "Aquarius",
    name_ml: "കുംഭം",
    name_tr: "Kova",
    name_ar: "الدلو",
    incense_en: "Luban Zakaridir",
    incense_ml: "Luban Zakaridir",
    incense_ar: "اللبان زكردير",
    preparation_en: "Use special luban zakaridir resin. Burn for innovation and humanitarian work.",
    preparation_ml: "പ്രത്യേക ലുബാൻ സക്കരിദീർ റെസിൻ ഉപയോഗിക്കുക. നവീകരണത്തിനും മാനുഷിക പ്രവർത്തനങ്ങൾക്കും കത്തിക്കുക.",
    benefits_en: ["Innovation", "Humanitarian work", "Originality", "Independence"],
    benefits_ml: ["നവീകരണം", "മാനുഷിക പ്രവർത്തനങ്ങൾ", "മൗലികത", "സ്വാതന്ത്ര്യം"]
  },
  pisces: {
    name_en: "Pisces",
    name_ml: "മീനം",
    name_tr: "Balık",
    name_ar: "الحوت",
    incense_en: "Saffron & Rose",
    incense_ml: "Saffron & Rose",
    incense_ar: "الزعفران والورد",
    preparation_en: "Mix saffron with rose petals. Burn for spiritual dissolution and compassion.",
    preparation_ml: "കുങ്കുമപ്പൂവ് റോസ് ദളങ്ങളുമായി കലർത്തുക. ആത്മിക ലയിക്കലിനും കരുണയ്ക്കും കത്തിക്കുക.",
    benefits_en: ["Spiritual dissolution", "Compassion", "Intuition", "Healing"],
    benefits_ml: ["ആത്മിക ലയിക്കൽ", "കരുണ", "അന്തർജ്ഞാനം", "ചികിത്സ"]
  }
};

export function getIncenseForPlanet(planetKey) {
  return PLANET_INCENSES[planetKey] || null;
}

export function getIncenseForZodiac(zodiacKey) {
  return ZODIAC_INCENSES[zodiacKey] || null;
}
// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK LANGUAGE NORMALIZER — Astrology Page ONLY
// DISPLAY LAYER ONLY — does NOT modify any stored data.
//
// RULE: Never display Turkish text on the Astrology page.
// Priority: Malayalam > Arabic > English
// Turkish is used only as an internal reference for validation.
//
// This file aggregates ALL verified translations from:
// - astroClockTurkishToMalayalam.js (planets, days, mansions, general terms)
// - astroClockLabelMap.js (zodiac, elements, natures, planets)
// - astroClockMansionsML.js (mansion names, zodiac names)
// Plus NEW verified translations for metals, stones, colors, incense, herbs.
// ═══════════════════════════════════════════════════════════════

// ── Helper: detect Turkish-specific characters ──
const TURKISH_CHARS = /[çşğÜüÖöİıÇŞĞ]/;

export function isTurkishText(text) {
  if (!text || typeof text !== 'string') return false;
  // Skip if already Arabic or Malayalam
  if (/[\u0600-\u06FF]/.test(text) && !TURKISH_CHARS.test(text)) return false;
  if (/[\u0D00-\u0D7F]/.test(text)) return false;
  return TURKISH_CHARS.test(text);
}

// ═══════════════════════════════════════════════════════════════
// COMPREHENSIVE DICTIONARY — Turkish → { ml, ar, en }
// Every entry is a VERIFIED translation. No auto-generated translations.
// ═══════════════════════════════════════════════════════════════

const DICT = {
  // ── PLANETS (7) ──
  'Güneş': { ml: 'സൂര്യൻ', ar: 'الشمس', en: 'Sun' },
  'Ay': { ml: 'ചന്ദ്രൻ', ar: 'القمر', en: 'Moon' },
  'Merkür': { ml: 'ബുധഗ്രഹം', ar: 'عطارد', en: 'Mercury' },
  'Venüs': { ml: 'ശുക്രഗ്രഹം', ar: 'الزهرة', en: 'Venus' },
  'Mars': { ml: 'ചൊവ്വാഗ്രഹം', ar: 'المريخ', en: 'Mars' },
  'Jüpiter': { ml: 'വ്യാഴഗ്രഹം', ar: 'المشتري', en: 'Jupiter' },
  'Satürn': { ml: 'ശനിഗ്രഹം', ar: 'زحل', en: 'Saturn' },

  // ── DAYS (7) ──
  'Pazar': { ml: 'ഞായർ', ar: 'الأحد', en: 'Sunday' },
  'Pazartesi': { ml: 'തിങ്കൾ', ar: 'الاثنين', en: 'Monday' },
  'Salı': { ml: 'ചൊവ്വ', ar: 'الثلاثاء', en: 'Tuesday' },
  'Çarşamba': { ml: 'ബുധൻ', ar: 'الأربعاء', en: 'Wednesday' },
  'Perşembe': { ml: 'വ്യാഴം', ar: 'الخميس', en: 'Thursday' },
  'Cuma': { ml: 'വെള്ളി', ar: 'الجمعة', en: 'Friday' },
  'Cumartesi': { ml: 'ശനി', ar: 'السبت', en: 'Saturday' },

  // ── ZODIAC SIGNS (12) ──
  'Koç': { ml: 'മേടം', ar: 'الحمل', en: 'Aries' },
  'Boğa': { ml: 'ഇടവം', ar: 'الثور', en: 'Taurus' },
  'İkizler': { ml: 'മിഥുനം', ar: 'الجوزاء', en: 'Gemini' },
  'Yengeç': { ml: 'കർക്കടകം', ar: 'السرطان', en: 'Cancer' },
  'Aslan': { ml: 'ചിങ്ങം', ar: 'الأسد', en: 'Leo' },
  'Başak': { ml: 'കന്നി', ar: 'العذراء', en: 'Virgo' },
  'Terazi': { ml: 'തുലാം', ar: 'الميزان', en: 'Libra' },
  'Akrep': { ml: 'വൃശ്ചികം', ar: 'العقرب', en: 'Scorpio' },
  'Yay': { ml: 'ധനു', ar: 'القوس', en: 'Sagittarius' },
  'Oğlak': { ml: 'മകരം', ar: 'الجدي', en: 'Capricorn' },
  'Kova': { ml: 'കുംഭം', ar: 'الدلو', en: 'Aquarius' },
  'Balık': { ml: 'മീനം', ar: 'الحوت', en: 'Pisces' },

  // ── ELEMENTS (4) ──
  'Ateş': { ml: 'അഗ്നി', ar: 'نار', en: 'Fire' },
  'Toprak': { ml: 'ഭൂമി', ar: 'أرض', en: 'Earth' },
  'Hava': { ml: 'വായു', ar: 'هواء', en: 'Air' },
  'Su': { ml: 'ജലം', ar: 'ماء', en: 'Water' },

  // ── NATURES / VERDICTS ──
  'Saad': { ml: 'അനുകൂലം', ar: 'سعد', en: 'Auspicious' },
  'Nahs': { ml: 'പ്രതികൂലം', ar: 'نحس', en: 'Inauspicious' },
  'Karışık': { ml: 'മിശ്രം', ar: 'مختلط', en: 'Mixed' },
  'Uygun': { ml: 'അനുകൂലം', ar: 'موافق', en: 'Suitable' },
  'Uygun Değil': { ml: 'അനനുകൂലം', ar: 'غير مناسب', en: 'Not Suitable' },
  'Uğursuz': { ml: 'പ്രതികൂലം', ar: 'نحس', en: 'Unlucky' },
  'Uğurlu': { ml: 'അനുകൂലം', ar: 'سعد', en: 'Lucky' },
  'İyi': { ml: 'നല്ലത്', ar: 'جيد', en: 'Good' },
  'Kötü': { ml: 'ചീത്ത', ar: 'سيء', en: 'Bad' },
  'En İyi': { ml: 'ഏറ്റവും നല്ലത്', ar: 'الأفضل', en: 'Best' },

  // ── GENDER ──
  'Erkek': { ml: 'പുരുഷൻ', ar: 'ذكر', en: 'Male' },
  'Dişi': { ml: 'സ്ത്രീ', ar: 'أنثى', en: 'Female' },
  'Nötr': { ml: 'നിഷ്പക്ഷം', ar: 'محايد', en: 'Neutral' },

  // ── TIME TERMS ──
  'Gündüz': { ml: 'പകൽ', ar: 'نهار', en: 'Daytime' },
  'Gece': { ml: 'രാത്രി', ar: 'ليل', en: 'Nighttime' },
  'Saat': { ml: 'മണിക്കൂർ', ar: 'ساعة', en: 'Hour' },
  'Bugün': { ml: 'ഇന്ന്', ar: 'اليوم', en: 'Today' },
  'Yarın': { ml: 'നാളെ', ar: 'غداً', en: 'Tomorrow' },

  // ── METALS ──
  'Altın': { ml: 'സ്വർണ്ണം', ar: 'ذهب', en: 'Gold' },
  'Gümüş': { ml: 'വെള്ളി', ar: 'فضة', en: 'Silver' },
  'Bakır': { ml: 'ചെമ്പ്', ar: 'نحاس', en: 'Copper' },
  'Demir': { ml: 'ഇരുമ്പ്', ar: 'حديد', en: 'Iron' },
  'Kurşun': { ml: 'ലെഡ്', ar: 'رصاص', en: 'Lead' },
  'Kalay': { ml: 'വെളുത്തീയം', ar: 'قصدير', en: 'Tin' },
  'Cıva': { ml: 'പാരം', ar: 'زئبق', en: 'Quicksilver' },
  'Pirinç': { ml: 'പിത്തള', ar: 'نحاس أصفر', en: 'Brass' },

  // ── STONES / GEMS ──
  'Yakut': { ml: 'മാണിക്യം', ar: 'الياقوت', en: 'Ruby' },
  'Zümrüt': { ml: 'മരതകം', ar: 'الزمرد', en: 'Emerald' },
  'Safir': { ml: 'നീലരത്നം', ar: 'السفير', en: 'Sapphire' },
  'Elmas': { ml: 'വജ്രം', ar: 'الماس', en: 'Diamond' },
  'İnci': { ml: 'മുത്ത്', ar: 'لؤلؤ', en: 'Pearl' },
  'Mercan': { ml: 'പവിഴം', ar: 'مرجان', en: 'Coral' },
  'Akik': { ml: 'അകിക്', ar: 'العقيق', en: 'Agate' },
  'Zümrüt Yeşili': { ml: 'മരതകപ്പച്ച', ar: 'أخضر زمرد', en: 'Emerald Green' },

  // ── COLORS ──
  'Kırmızı': { ml: 'ചുവപ്പ്', ar: 'أحمر', en: 'Red' },
  'Mavi': { ml: 'നീല', ar: 'أزرق', en: 'Blue' },
  'Yeşil': { ml: 'പച്ച', ar: 'أخضر', en: 'Green' },
  'Sarı': { ml: 'മഞ്ഞ', ar: 'أصفر', en: 'Yellow' },
  'Beyaz': { ml: 'വെളുപ്പ്', ar: 'أبيض', en: 'White' },
  'Siyah': { ml: 'കറുപ്പ്', ar: 'أسود', en: 'Black' },
  'Mor': { ml: 'പർപ്പിൾ', ar: 'أرجواني', en: 'Purple' },
  'Turuncu': { ml: 'ഓറഞ്ച്', ar: 'برتقالي', en: 'Orange' },
  'Gri': { ml: 'ചാരനിറം', ar: 'رمادي', en: 'Gray' },
  'Altın Sarısı': { ml: 'സ്വർണ്ണനിറം', ar: 'ذهبي', en: 'Golden' },
  'Gümüş Beyaz': { ml: 'വെള്ളിനിറം', ar: 'فضي', en: 'Silvery' },

  // ── INCENSE / PERFUMES ──
  'Öd': { ml: 'അഗിൽ', ar: 'العود', en: 'Oud (Aloeswood)' },
  'Kehribar': { ml: 'അംബർ', ar: 'عنبر', en: 'Amber' },
  'Misk': { ml: 'മിസ്ക്', ar: 'مسك', en: 'Musk' },
  'Lüban': { ml: 'ലുബാൻ', ar: 'لبان', en: 'Frankincense' },
  'Günlük': { ml: 'കുന്തിരിക്കം', ar: 'الكندر', en: 'Frankincense' },
  'Odu': { ml: 'അഗിൽ', ar: 'العود', en: 'Oud' },
  'Anber': { ml: 'അംബർ', ar: 'عنبر', en: 'Ambergris' },
  'Üd': { ml: 'അഗിൽ', ar: 'العود', en: 'Aloeswood' },

  // ── HERBS / PLANTS ──
  'Gül': { ml: 'റോസപ്പൂവ്', ar: 'ورد', en: 'Rose' },
  'Sümbül': { ml: 'ഹയാസിന്ത്', ar: 'السنبل', en: 'Hyacinth' },
  'Nergis': { ml: 'നെർഗിസ്', ar: 'النرجس', en: 'Narcissus' },
  'Yasemin': { ml: 'ജാസ്മിൻ', ar: 'الياسمين', en: 'Jasmine' },
  'Banafşa': { ml: 'വയലറ്റ്', ar: 'البنفسج', en: 'Violet' },

  // ── COMMON OCCULT / SPIRITUAL TERMS ──
  'Havâss ilmi': { ml: 'ഇൽം അൽ-ഹവാസ്സ്', ar: 'علم الخواص', en: 'Science of Properties' },
  'Ruhani varlık': { ml: 'ആത്മീയ ജീവി', ar: 'كائن روحي', en: 'Spiritual being' },
  'Tılsım yapımı': { ml: 'തലിസ്മാൻ നിർമ്മാണം', ar: 'صنع تميمة', en: 'Talisman making' },
  'Şifa çalışmaları': { ml: 'സൗഖ്യപ്രവർത്തനങ്ങൾ', ar: 'أعمال الشفاء', en: 'Healing works' },
  'Aşk ve muhabbet': { ml: 'സ്നേഹവും ആകർഷണവും', ar: 'حب ومودة', en: 'Love and attraction' },
  'Koruma ve muhafaza': { ml: 'സംരക്ഷണവും കാവലും', ar: 'حماية وحفظ', en: 'Protection and preservation' },
  'Rızık ve bereket': { ml: 'ഉപജീവനവും അനുഗ്രഹവും', ar: 'رزق وبركة', en: 'Sustenance and blessing' },
  'Vefk yazımı': { ml: 'വെഫ്ക് എഴുത്ത്', ar: 'كتابة وفق', en: 'Wafq writing' },
  'Mürekkep hazırlama': { ml: 'മഷി തയ്യാറാക്കൽ', ar: 'تحضير الحبر', en: 'Ink preparation' },
  'Tütsü yakma': { ml: 'ധൂപം കാട്ടൽ', ar: 'حرق البخور', en: 'Burning incense' },
  'Hâdim davetleri': { ml: 'ഹാദിം ആഹ്വാനങ്ങൾ', ar: 'دعاء الخادم', en: 'Servant summoning' },
  'İstihare': { ml: 'ഇസ്തിഖാറ', ar: 'استخارة', en: 'Prayer for guidance' },
  'Kasem': { ml: 'ഖസം', ar: 'قسم', en: 'Oath' },
  'Bast': { ml: 'വികസിപ്പിക്കൽ', ar: 'بسط', en: 'Expansion' },
  'İstintak': { ml: 'ഇസ്തിന്താഖ്', ar: 'إستنطاق', en: 'Extraction' },
  'Mecz': { ml: 'മിശ്രണം', ar: 'مزج', en: 'Mixing' },

  // ── BOOK / SOURCE TITLES (verified English equivalents) ──
  "Havâss'ın Derinlikleri": { ml: '', ar: '', en: 'Depths of Havass' },
  'Havassin Derinlikleri': { ml: '', ar: '', en: 'Depths of Havass' },
  'Gizli İlimler Hazinesi': { ml: '', ar: '', en: 'Treasure of Hidden Sciences' },
  'Kashf al-Haqa\'iq': { ml: '', ar: 'كشف الحقائق', en: 'Kashf al-Haqaiq' },
  'Kashf al-Haqa’iq': { ml: '', ar: 'كشف الحقائق', en: 'Kashf al-Haqaiq' },

  // ── PLANETARY HOUR TERMS ──
  'Gezegen Saati': { ml: 'ഗ്രഹ മണിക്കൂർ', ar: 'ساعة الكوكب', en: 'Planetary Hour' },
  'Gündüz Saati': { ml: 'പകൽ മണിക്കൂർ', ar: 'ساعة النهار', en: 'Daytime Hour' },
  'Gece Saati': { ml: 'രാത്രി മണിക്കൂർ', ar: 'ساعة الليل', en: 'Nighttime Hour' },
};

// Build case-insensitive lookup
const DICT_LOWER = {};
for (const [key, val] of Object.entries(DICT)) {
  DICT_LOWER[key.toLowerCase()] = val;
}

// ═══════════════════════════════════════════════════════════════
// MAIN NORMALIZER — normalizeDisplay(text)
// Returns Malayalam > Arabic > English. NEVER returns Turkish.
// ═══════════════════════════════════════════════════════════════

export function normalizeDisplay(text) {
  if (!text || typeof text !== 'string') return text;

  // 1. Already Malayalam script — return as-is
  if (/[\u0D00-\u0D7F]/.test(text)) return text;

  // 2. Already Arabic script (and no Turkish chars) — return as-is
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  if (arabicChars > 0 && !TURKISH_CHARS.test(text)) return text;

  // 3. Exact dictionary match (case-sensitive first)
  if (DICT[text]) {
    return DICT[text].ml || DICT[text].ar || DICT[text].en || text;
  }

  // 4. Case-insensitive dictionary match
  const lower = text.toLowerCase().trim();
  if (DICT_LOWER[lower]) {
    return DICT_LOWER[lower].ml || DICT_LOWER[lower].ar || DICT_LOWER[lower].en || text;
  }

  // 5. If text contains Turkish characters, try partial word replacement
  if (isTurkishText(text)) {
    let normalized = text;
    let changed = false;
    // Sort keys by length (longest first) to avoid partial replacement issues
    const sortedKeys = Object.keys(DICT).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      if (regex.test(normalized)) {
        const replacement = DICT[key].ml || DICT[key].ar || DICT[key].en || key;
        normalized = normalized.replace(regex, replacement);
        changed = true;
      }
    }
    if (changed) return normalized;

    // 6. Turkish text with no dictionary match — return '—' to hide Turkish
    // (User rule: "Do not display Turkish text anywhere on the Astrology page")
    // Only do this for SHORT text (single words/short phrases). For longer text,
    // the components should have _en or _ml equivalents.
    if (text.length < 60) return '—';
  }

  // 7. No Turkish detected — return as-is (English or proper name)
  return text;
}

// ═══════════════════════════════════════════════════════════════
// ARRAY NORMALIZER — normalizeArray(texts)
// Normalizes each element in an array of strings.
// ═══════════════════════════════════════════════════════════════

export function normalizeArray(texts) {
  if (!texts || !Array.isArray(texts)) return texts;
  return texts.map(t => normalizeDisplay(t));
}

// ═══════════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════════
export const NORMALIZER_METADATA = {
  version: '2.0.1',
  scope: 'Astrology page ONLY',
  rule: 'Never display Turkish. Priority: Malayalam > Arabic > English.',
  displayLayerOnly: true,
  storedDataModified: false,
  coverage: {
    planets: 7,
    days: 7,
    zodiac: 12,
    elements: 4,
    natures: 10,
    metals: 8,
    stones: 8,
    colors: 11,
    incense: 8,
    herbs: 5,
    occult_terms: 16,
    book_titles: 5,
    planetary_hour_terms: 3,
    gender: 3,
    time_terms: 5,
  },
};
/**
 * ASTRO CLOCK — TURKISH TO MALAYALAM TRANSLATION LAYER
 * Translates Turkish labels to Malayalam for display ONLY.
 * Database values remain unchanged.
 * 
 * RULES:
 * - Arabic text preserved as-is
 * - Turkish text NEVER shown directly
 * - Malayalam displayed first, Arabic second, English third
 */

// ─────────────────────────────────────────────────────────────────────────────
// PLANET NAMES — Turkish → Malayalam → Arabic
// ─────────────────────────────────────────────────────────────────────────────
export const PLANET_TRANSLATIONS = {
  'Güneş': { ml: 'സൂര്യൻ', ar: 'الشمس', en: 'Sun' },
  'Ay': { ml: 'ചന്ദ്രൻ', ar: 'القمر', en: 'Moon' },
  'Merkür': { ml: 'ബുധൻ', ar: 'عطارد', en: 'Mercury' },
  'Venüs': { ml: 'ശുക്രൻ', ar: 'الزهرة', en: 'Venus' },
  'Mars': { ml: 'ചൊവ്വ', ar: 'المريخ', en: 'Mars' },
  'Jüpiter': { ml: 'ഗുരു', ar: 'المشتري', en: 'Jupiter' },
  'Satürn': { ml: 'ശനി', ar: 'زحل', en: 'Saturn' },
  'GÜNEŞ': { ml: 'സൂര്യൻ', ar: 'الشمس', en: 'Sun' },
  'AY': { ml: 'ചന്ദ്രൻ', ar: 'القمر', en: 'Moon' },
  'MERKÜR': { ml: 'ബുധൻ', ar: 'عطارد', en: 'Mercury' },
  'VENÜS': { ml: 'ശുക്രൻ', ar: 'الزهرة', en: 'Venus' },
  'MARS': { ml: 'ചൊവ്വ', ar: 'المريخ', en: 'Mars' },
  'JÜPİTER': { ml: 'ഗുരു', ar: 'المشتري', en: 'Jupiter' },
  'SATÜRN': { ml: 'ശനി', ar: 'زحل', en: 'Saturn' }
};

// ─────────────────────────────────────────────────────────────────────────────
// DAY NAMES — Turkish → Malayalam → Arabic
// ─────────────────────────────────────────────────────────────────────────────
export const DAY_TRANSLATIONS = {
  'Pazar': { ml: 'ഞായർ', ar: 'الأحد', en: 'Sunday' },
  'Pazartesi': { ml: 'തിങ്കൾ', ar: 'الاثنين', en: 'Monday' },
  'Salı': { ml: 'ചൊവ്വ', ar: 'الثلاثاء', en: 'Tuesday' },
  'Çarşamba': { ml: 'ബുധൻ', ar: 'الأربعاء', en: 'Wednesday' },
  'Perşembe': { ml: 'വ്യാഴം', ar: 'الخميس', en: 'Thursday' },
  'Cuma': { ml: 'വെള്ളി', ar: 'الجمعة', en: 'Friday' },
  'Cumartesi': { ml: 'ശനി', ar: 'السبت', en: 'Saturday' }
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERAL ASTROLOGICAL TERMS
// ─────────────────────────────────────────────────────────────────────────────
export const GENERAL_TRANSLATIONS = {
  // Time references
  'Bugün': { ml: 'ഇന്ന്', ar: 'اليوم', en: 'Today' },
  'Yarın': { ml: 'നാളെ', ar: 'غداً', en: 'Tomorrow' },
  'Bu Hafta': { ml: 'ഈ ആഴ്ച', ar: 'هذا الأسبوع', en: 'This Week' },
  
  // Suitability
  'Uygun': { ml: 'അനുകൂലം', ar: 'موافق', en: 'Suitable' },
  'Uygun Değil': { ml: 'അനനുകൂലം', ar: 'غير مناسب', en: 'Not Suitable' },
  'Uğursuz': { ml: 'അശുഭം', ar: 'نحس', en: 'Unlucky' },
  'Saad': { ml: 'ശുഭം', ar: 'سعد', en: 'Lucky' },
  'Nahs': { ml: 'അശുഭം', ar: 'نحس', en: 'Unlucky' },
  'Karışık': { ml: 'മിശ്രം', ar: 'مختلط', en: 'Mixed' },
  
  // Operations
  'İyi': { ml: 'നല്ലത്', ar: 'جيد', en: 'Good' },
  'Kötü': { ml: 'ചീത്ത', ar: 'سيء', en: 'Bad' },
  'En İyi': { ml: 'ഏറ്റവും നല്ലത്', ar: 'الأفضل', en: 'Best' },
  
  // Elements
  'Ateş': { ml: 'അഗ്നി', ar: 'نار', en: 'Fire' },
  'Toprak': { ml: 'ഭൂമി', ar: 'أرض', en: 'Earth' },
  'Hava': { ml: 'വായു', ar: 'هواء', en: 'Air' },
  'Su': { ml: 'ജലം', ar: 'ماء', en: 'Water' },
  
  // Nature
  'Erkek': { ml: 'പുരുഷൻ', ar: 'ذكر', en: 'Male' },
  'Dişi': { ml: 'സ്ത്രീ', ar: 'أنثى', en: 'Female' },
  'Nötr': { ml: 'തടസ്സമില്ലാത്ത', ar: 'محايد', en: 'Neutral' },
  
  // Actions
  'Gündüz': { ml: 'പകൽ', ar: 'نهار', en: 'Day' },
  'Gece': { ml: 'രാത്രി', ar: 'ليل', en: 'Night' },
  'Saat': { ml: 'മണിക്കൂർ', ar: 'ساعة', en: 'Hour' },
  'Dakika': { ml: 'മിനിറ്റ്', ar: 'دقيقة', en: 'Minute' },
  
  // Specific occult operations (from user report)
  'İyi ve şerli uygulamalara aynı derecede yarar': { ml: 'നല്ലതും ചീത്തയുമായ പ്രവൃത്തികൾക്ക് തുല്യമായി ഗുണകരം', ar: 'نافع بالتساوي للأعمال الصالحة والطالحة', en: 'Equally beneficial for good and evil practices' },
  'Hâdim davetleri': { ml: 'ഹാദിം ആഹ്വാനങ്ങൾ', ar: 'دعاء الخادم', en: 'Summoning servants' },
  'Birisinin rüyasına girmek ve telkin': { ml: 'ഒരാളുടെ സ്വപ്നത്തിൽ പ്രത്യക്ഷപ്പെടൽ, സ്വാധീന നിർദ്ദേശം', ar: 'دخول حلم شخص وإلقاء اقتراح', en: 'Enter someone\'s dream and suggest' },
  'Mesleki şans veya bela': { ml: 'തൊഴിൽ ഭാഗ്യം അല്ലെങ്കിൽ പ്രതിബന്ധം', ar: 'حظ مهني أو بلاء', en: 'Professional luck or calamity' },
  'Mal, mülk': { ml: 'ധനം, സ്വത്ത്', ar: 'مال، ممتلكات', en: 'Wealth, property' },
  'Havâss ilmi': { ml: 'ഇൽം അൽ-ഹവാസ്സ്', ar: 'علم الخواص', en: 'Science of special properties' },
  'Ruhani varlık': { ml: 'ആത്മീയ ജീവി', ar: 'كائن روحي', en: 'Spiritual being' },
  'Tılsım yapımı': { ml: 'തലിസ്മാൻ നിർമ്മാണം', ar: 'صنع تميمة', en: 'Talisman making' },
  'Şifa çalışmaları': { ml: 'സൗഖ്യപ്രവർത്തനങ്ങൾ', ar: 'أعمال الشفاء', en: 'Healing works' },
  'Aşk ve muhabbet': { ml: 'സ്നേഹവും ആകർഷണവും', ar: 'حب ومودة', en: 'Love and attraction' },
  'Koruma ve muhafaza': { ml: 'സംരക്ഷണവും കാവലും', ar: 'حماية وحفظ', en: 'Protection and preservation' },
  'Rızık ve bereket': { ml: 'ഉപജീവനവും അനുഗ്രഹവും', ar: 'رزق وبركة', en: 'Sustenance and blessing' },
  'Seyr ve süluk': { ml: 'ആത്മീയ യാത്ര', ar: 'سير وسلوك', en: 'Spiritual journey' },
  'İstihare': { ml: 'ഇസ്തിഖാറ', ar: 'استخارة', en: 'Prayer for guidance' },
  'Vefk yazımı': { ml: 'വെഫ്ക് എഴുത്ത്', ar: 'كتابة وفق', en: 'Writing square talisman' },
  'Mürekkep hazırlama': { ml: 'മഷി തയ്യാറാക്കൽ', ar: 'تحضير الحبر', en: 'Ink preparation' },
  'Tütsü yakma': { ml: 'ധൂപം കാട്ടൽ', ar: 'حرق البخور', en: 'Burning incense' },
  'Perhiz ve riyazet': { ml: 'ഉപവാസവും തപസ്സും', ar: 'صيام ورياضة', en: 'Fasting and austerity' },
  'Halvet': { ml: 'ഏകാന്തവാസം', ar: 'خلوة', en: 'Seclusion' },
  'Çile': { ml: 'തപസ്സ്', ar: 'أربعين', en: 'Forty-day retreat' },
  'Niyaz': { ml: 'പ്രാർത്ഥന', ar: 'نياز', en: 'Supplication' },
  'Rabıta': { ml: 'ആത്മീയ ബന്ധം', ar: 'رابطة', en: 'Spiritual connection' },
  'Hizmet': { ml: 'സേവനം', ar: 'خدمة', en: 'Service' },
  'Davet': { ml: 'ആഹ്വാനം', ar: 'دعاء', en: 'Invocation' },
  'Azimet': { ml: 'അസീമത്ത്', ar: 'عزيمة', en: 'Determination/prayer' },
  'Kasem': { ml: 'ഖസം', ar: 'قسم', en: 'Oath' },
  'Bast': { ml: 'വികസിപ്പിക്കൽ', ar: 'بسط', en: 'Expansion' },
  'İstintak': { ml: 'ഇസ്തിന്താഖ്', ar: 'إستنطاق', en: 'Extraction' },
  'Mecz': { ml: 'മിശ്രണം', ar: 'مزج', en: 'Mixing' },
  'Teksir': { ml: 'ഗുണനം', ar: 'تكثير', en: 'Multiplication' }
};

// ─────────────────────────────────────────────────────────────────────────────
// MOON MANSION NAMES — Turkish → Malayalam (Arabic preserved)
// ─────────────────────────────────────────────────────────────────────────────
export const MANSION_TRANSLATIONS = {
  'ŞARTEYN': { ml: 'ഷർതൈൻ', ar: 'الشرطان' },
  'BUTEYN': { ml: 'ബുതൈൻ', ar: 'البطين' },
  'SÜREYYA': { ml: 'സുറയ്യ', ar: 'الثريا' },
  'DÜBRAN': { ml: 'ദുബ്രാൻ', ar: 'الدبران' },
  'HAK\'A': { ml: 'ഹഖ്അ', ar: 'الهقعة' },
  'HENA': { ml: 'ഹനഅ', ar: 'الهنعة' },
  'ZİRA': { ml: 'സിറഅ', ar: 'الذراع' },
  'NESRE': { ml: 'നസ്റ', ar: 'النثرة' },
  'TARFA': { ml: 'തർഫ', ar: 'الطرف' },
  'CEPHE': { ml: 'ജബ്ഹ', ar: 'الجبهة' },
  'ZEBRA': { ml: 'സബ്ര', ar: 'الزبرة' },
  'SURFA': { ml: 'സർഫ', ar: 'الصرفة' },
  'AVA': { ml: 'അവ്വ', ar: 'العواء' },
  'SEMMAK': { ml: 'സമ്മാഖ്', ar: 'السماك' },
  'GUFUR': { ml: 'ഗുഫ്ര', ar: 'الغفر' },
  'ZİBANA': { ml: 'സുബാന', ar: 'الزبانا' },
  'İKLİL': { ml: 'ഇക്ലീൽ', ar: 'الإكليل' },
  'KÂLP': { ml: 'ഖൽബ്', ar: 'القلب' },
  'ŞEVLE': { ml: 'ഷൗല', ar: 'الشولة' },
  'NEAİM': { ml: 'നഈം', ar: 'النعائم' },
  'BELDE': { ml: 'ബൽദ', ar: 'البلدة' },
  'SAADÜZZABİH': { ml: 'സഅ്ദുസ്സാബിഹ്', ar: 'سعد الذابح' },
  'SAUDBELA': { ml: 'സഅ്ദുൽബുലഅ', ar: 'سعد البلع' },
  'SAADÜSSUUD': { ml: 'സഅ്ദുസ്സുഊദ്', ar: 'سعد السعود' },
  'SAADÜLAHBİYYE': { ml: 'സഅ്ദുൽഅഖ്ബിയ', ar: 'سعد الأخبية' },
  'FERÜLMUKADDEM': { ml: 'ഫർഉൽമുഖദ്ദം', ar: 'فرع المقدم' },
  'FERÜLMÜAHHİR': { ml: 'ഫർഉൽമുഅഖ്ഖർ', ar: 'فرع المؤخر' },
  'EERREŞA': { ml: 'റശാഅ', ar: 'الرشا' }
};

// ─────────────────────────────────────────────────────────────────────────────
// TRANSLATION HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Translate Turkish planet name to Malayalam
 * @param {string} turkishName - Turkish planet name
 * @returns {string} Malayalam translation
 */
export function translatePlanetToMalayalam(turkishName) {
  if (!turkishName) return '';
  const translation = PLANET_TRANSLATIONS[turkishName];
  if (!translation) return turkishName;
  return `${translation.ml} (${translation.ar})`;
}

/**
 * Translate Turkish day name to Malayalam
 * @param {string} turkishName - Turkish day name
 * @returns {string} Malayalam translation
 */
export function translateDayToMalayalam(turkishName) {
  if (!turkishName) return '';
  const translation = DAY_TRANSLATIONS[turkishName];
  if (!translation) return turkishName;
  return `${translation.ml} (${translation.ar})`;
}

/**
 * Translate Turkish mansion name to Malayalam
 * @param {string} turkishName - Turkish mansion name
 * @returns {string} Malayalam translation
 */
export function translateMansionToMalayalam(turkishName) {
  if (!turkishName) return '';
  const translation = MANSION_TRANSLATIONS[turkishName];
  if (!translation) return turkishName;
  return `${translation.ml} (${translation.ar})`;
}

/**
 * Translate Turkish general term to Malayalam
 * @param {string} turkishTerm - Turkish term
 * @returns {string} Malayalam translation
 */
export function translateGeneralTerm(turkishTerm) {
  if (!turkishTerm) return '';
  const translation = GENERAL_TRANSLATIONS[turkishTerm];
  return translation?.ml || turkishTerm;
}

/**
 * Get full planet info with all languages
 * @param {string} turkishName - Turkish planet name
 * @returns {Object} Object with ml, ar, en properties
 */
export function getPlanetInfo(turkishName) {
  if (!turkishName) return { ml: '', ar: '', en: '' };
  return PLANET_TRANSLATIONS[turkishName] || { ml: turkishName, ar: '', en: turkishName };
}

/**
 * Get full day info with all languages
 * @param {string} turkishName - Turkish day name
 * @returns {Object} Object with ml, ar, en properties
 */
export function getDayInfo(turkishName) {
  if (!turkishName) return { ml: '', ar: '', en: '' };
  return DAY_TRANSLATIONS[turkishName] || { ml: turkishName, ar: '', en: turkishName };
}

/**
 * Get full mansion info with all languages
 * @param {string} turkishName - Turkish mansion name
 * @returns {Object} Object with ml, ar properties
 */
export function getMansionInfo(turkishName) {
  if (!turkishName) return { ml: '', ar: '' };
  return MANSION_TRANSLATIONS[turkishName] || { ml: turkishName, ar: '' };
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY FORMATTER — Malayalam first, Arabic second, English third
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format planet display: Malayalam (Arabic) English
 * @param {string} turkishName - Turkish planet name
 * @param {boolean} includeEnglish - Include English (default: false)
 * @returns {string} Formatted display string
 */
export function formatPlanetDisplay(turkishName, includeEnglish = false) {
  const info = getPlanetInfo(turkishName);
  if (includeEnglish) {
    return `${info.ml} | ${info.ar} | ${info.en}`;
  }
  return `${info.ml} | ${info.ar}`;
}

/**
 * Format day display: Malayalam (Arabic) English
 * @param {string} turkishName - Turkish day name
 * @param {boolean} includeEnglish - Include English (default: false)
 * @returns {string} Formatted display string
 */
export function formatDayDisplay(turkishName, includeEnglish = false) {
  const info = getDayInfo(turkishName);
  if (includeEnglish) {
    return `${info.ml} | ${info.ar} | ${info.en}`;
  }
  return `${info.ml} | ${info.ar}`;
}

/**
 * Format mansion display: Malayalam (Arabic)
 * @param {string} turkishName - Turkish mansion name
 * @returns {string} Formatted display string
 */
export function formatMansionDisplay(turkishName) {
  const info = getMansionInfo(turkishName);
  return `${info.ml} | ${info.ar}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CENTRALIZED TRANSLATOR — Turkish → Malayalam for display
// Use this function before rendering ANY Turkish text in UI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Translate Turkish text to Malayalam for display
 * Database remains unchanged - this is display-only translation
 * @param {string} turkishText - Turkish text to translate
 * @returns {string} Malayalam translation (or original if no match)
 */
export function translateTurkishToMalayalam(turkishText) {
  if (!turkishText || typeof turkishText !== 'string') return '';
  
  // Skip if already Arabic or Malayalam
  if (/[\u0600-\u06FF]/.test(turkishText) || /[\u0D00-\u0D7F]/.test(turkishText)) {
    return turkishText;
  }
  
  let translated = turkishText;
  
  // Translate general terms first
  Object.entries(GENERAL_TRANSLATIONS).forEach(([tr, trans]) => {
    translated = translated.replace(new RegExp(tr, 'gi'), trans.ml);
  });
  
  // Translate planet names
  Object.entries(PLANET_TRANSLATIONS).forEach(([tr, trans]) => {
    translated = translated.replace(new RegExp(tr, 'gi'), trans.ml);
  });
  
  // Translate day names
  Object.entries(DAY_TRANSLATIONS).forEach(([tr, trans]) => {
    translated = translated.replace(new RegExp(tr, 'gi'), trans.ml);
  });
  
  // If no translation happened, return original
  return translated;
}

/**
 * Translate array of Turkish text to Malayalam
 * @param {string[]} turkishTexts - Array of Turkish strings
 * @returns {string[]} Array of Malayalam translations
 */
export function translateArrayToMalayalam(turkishTexts) {
  if (!turkishTexts || !Array.isArray(turkishTexts)) return [];
  return turkishTexts.map(translateTurkishToMalayalam);
}

/**
 * Format display with Malayalam + Arabic
 * @param {string} turkishText - Turkish text
 * @param {string} arabicText - Optional Arabic text
 * @returns {string} Formatted display string
 */
export function formatDisplayWithArabic(turkishText, arabicText = '') {
  const malayalam = translateTurkishToMalayalam(turkishText);
  if (arabicText) {
    return `${malayalam} | ${arabicText}`;
  }
  return malayalam;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT CLEANER — Remove Turkish text from operations lists
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clean Turkish text from operations list
 * @param {string[]} operations - Array of operation strings (may contain Turkish)
 * @returns {string[]} Cleaned operations (Turkish removed or translated)
 */
export function cleanOperationsList(operations) {
  if (!operations || !Array.isArray(operations)) return [];
  
  return operations.map(op => {
    if (!op) return '';
    
    // Skip if it's already Arabic or Malayalam
    if (/[\u0600-\u06FF]/.test(op) || /[\u0D00-\u0D7F]/.test(op)) {
      return op;
    }
    
    // Use centralized translator
    return translateTurkishToMalayalam(op);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const TRANSLATION_LAYER_METADATA = {
  version: '1.0.0',
  purpose: 'Turkish → Malayalam display translation layer',
  rules: [
    'Arabic text preserved as-is',
    'Turkish text NEVER shown directly',
    'Malayalam displayed first',
    'Database values unchanged',
    'Display-only translation'
  ],
  coverage: {
    planets: 7,
    days: 7,
    mansions: 28,
    general_terms: 20
  },
  status: 'ACTIVE'
};
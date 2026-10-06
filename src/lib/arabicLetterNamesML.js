/**
 * ARABIC LETTER NAMES IN MALAYALAM
 * Replaces Turkish-style transliterations (Ba, Cim, Dal, etc.) with Malayalam names
 * 
 * Display format:
 * - Arabic Letter: ج
 * - Malayalam Name: ജീം
 * - Original Arabic name preserved
 */

export const ARABIC_LETTER_NAMES = {
  // 28 Arabic letters with Malayalam names
  'ا': {
    malayalam: 'അലിഫ്',
    arabic_name: 'ألف',
    transliteration: 'Alif'
  },
  'ب': {
    malayalam: 'ബാ',
    arabic_name: 'باء',
    transliteration: 'Ba'
  },
  'ت': {
    malayalam: 'ത്വാ',
    arabic_name: 'تاء',
    transliteration: 'Ta'
  },
  'ث': {
    malayalam: 'സാ',
    arabic_name: 'ثاء',
    transliteration: 'Sa'
  },
  'ج': {
    malayalam: 'ജീം',
    arabic_name: 'جيم',
    transliteration: 'Jeem'
  },
  'ح': {
    malayalam: 'ഹാ',
    arabic_name: 'حاء',
    transliteration: 'Ha'
  },
  'خ': {
    malayalam: 'ഖാ',
    arabic_name: 'خاء',
    transliteration: 'Kha'
  },
  'د': {
    malayalam: 'ദാൽ',
    arabic_name: 'دال',
    transliteration: 'Dal'
  },
  'ذ': {
    malayalam: 'സാൽ',
    arabic_name: 'ذال',
    transliteration: 'Dhal'
  },
  'ر': {
    malayalam: 'റാ',
    arabic_name: 'راء',
    transliteration: 'Ra'
  },
  'ز': {
    malayalam: 'സായി',
    arabic_name: 'زاي',
    transliteration: 'Zay'
  },
  'س': {
    malayalam: 'സീൻ',
    arabic_name: 'سين',
    transliteration: 'Seen'
  },
  'ش': {
    malayalam: 'ഷീൻ',
    arabic_name: 'شين',
    transliteration: 'Sheen'
  },
  'ص': {
    malayalam: 'സ്വാദ്',
    arabic_name: 'صاد',
    transliteration: 'Saad'
  },
  'ض': {
    malayalam: 'ദ്വാദ്',
    arabic_name: 'ضاد',
    transliteration: 'Dhaad'
  },
  'ط': {
    malayalam: 'ത്വാ',
    arabic_name: 'طاء',
    transliteration: 'Taa'
  },
  'ظ': {
    malayalam: 'സ്വാ',
    arabic_name: 'ظاء',
    transliteration: 'Dhaa'
  },
  'ع': {
    malayalam: 'ഐൻ',
    arabic_name: 'عين',
    transliteration: 'Ayn'
  },
  'غ': {
    malayalam: 'ഗൈൻ',
    arabic_name: 'غين',
    transliteration: 'Ghayn'
  },
  'ف': {
    malayalam: 'ഫാ',
    arabic_name: 'فاء',
    transliteration: 'Fa'
  },
  'ق': {
    malayalam: 'ഖാഫ്',
    arabic_name: 'قاف',
    transliteration: 'Qaaf'
  },
  'ك': {
    malayalam: 'കാഫ്',
    arabic_name: 'كاف',
    transliteration: 'Kaaf'
  },
  'ل': {
    malayalam: 'ലാം',
    arabic_name: 'لام',
    transliteration: 'Laam'
  },
  'م': {
    malayalam: 'മീം',
    arabic_name: 'ميم',
    transliteration: 'Meem'
  },
  'ن': {
    malayalam: 'നൂൻ',
    arabic_name: 'نون',
    transliteration: 'Noon'
  },
  'ه': {
    malayalam: 'ഹാ',
    arabic_name: 'هاء',
    transliteration: 'Ha'
  },
  'و': {
    malayalam: 'വാവ്',
    arabic_name: 'واو',
    transliteration: 'Waw'
  },
  'ي': {
    malayalam: 'യാ',
    arabic_name: 'ياء',
    transliteration: 'Ya'
  }
};

/**
 * Get Malayalam name for an Arabic letter
 * @param {string} arabicLetter - Arabic letter (e.g., 'ج')
 * @returns {string} Malayalam name (e.g., 'ജീം')
 */
export function getMalayalamName(arabicLetter) {
  return ARABIC_LETTER_NAMES[arabicLetter]?.malayalam || arabicLetter;
}

/**
 * Get full letter info with Malayalam, Arabic, and transliteration
 * @param {string} arabicLetter - Arabic letter
 * @returns {object} Letter info with malayalam, arabic_name, transliteration
 */
export function getLetterInfo(arabicLetter) {
  return ARABIC_LETTER_NAMES[arabicLetter] || {
    malayalam: arabicLetter,
    arabic_name: arabicLetter,
    transliteration: arabicLetter
  };
}

/**
 * Replace Turkish-style transliteration with Malayalam name
 * @param {string} turkishName - Turkish transliteration (e.g., 'Cim', 'Dal')
 * @returns {string} Malayalam name (e.g., 'ജീം', 'ദാൽ')
 */
export function turkishToMalayalam(turkishName) {
  const mapping = {
    'Ba': 'ബാ',
    'Cim': 'ജീം',
    'Dal': 'ദാൽ',
    'He': 'ഹാ',
    'Vav': 'വാവ്',
    'Zel': 'സായി',
    'Ha': 'ഹാ',
    'Ti': 'ത്വാ',
    'Ye': 'യാ',
    'Kef': 'കാഫ്',
    'Lam': 'ലാം',
    'Mim': 'മീം',
    'Nun': 'നൂൻ',
    'Sin': 'സീൻ',
    'Ayin': 'ഐൻ',
    'Fe': 'ഫാ',
    'Sad': 'സ്വാദ്',
    'Kaf': 'ഖാഫ്',
    'Ra': 'റാ',
    'Sin': 'ഷീൻ',
    'Elif': 'അലിഫ്',
    'Tı': 'ത്വാ',
    'Se': 'സാ',
    'Hı': 'ഖാ',
    'Zal': 'സാൽ',
    'Dad': 'ദ്വാദ്',
    'Zı': 'സ്വാ',
    'Gayın': 'ഗൈൻ',
    'Kef': 'കാഫ്'
  };
  return mapping[turkishName] || turkishName;
}
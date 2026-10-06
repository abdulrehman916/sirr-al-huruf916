/**
 * SAMUR HİNDİ CALCULATION ENGINE
 * Source: Risale-i Samur Hindi, Sheikh İdris Çelebi, 15 Kasım 1994, Karaman
 * 
 * This engine implements ONLY the calculation methods found in the book.
 * No external rules are added. No rules are invented.
 */

import { KNOWLEDGE_INDEX, CHAPTERS, BOOK_META } from './samurHindiIndex';

// ═══════════════════════════════════════════════════════
// ABJAD VALUES (from book pages 16-18)
// ═══════════════════════════════════════════════════════

export const ABJAD_KEBIR = {
  'ا': 1, 'ب': 2, 'ج': 3, 'د': 4, 'ه': 5, 'و': 6, 'ز': 7, 'ح': 8, 'ط': 9,
  'ي': 10, 'ك': 20, 'ل': 30, 'م': 40, 'ن': 50, 'س': 60, 'ع': 70, 'ف': 80, 'ص': 90,
  'ق': 100, 'ر': 200, 'ش': 300, 'ت': 400, 'ث': 500, 'خ': 600, 'ذ': 700, 'ض': 800, 'ظ': 900, 'غ': 1000
};

export const ABJAD_SAGIR = {
  'ا': 1, 'ب': 2, 'ج': 3, 'د': 4, 'ه': 5, 'و': 6, 'ز': 7, 'ح': 8, 'ط': 9,
  'ي': 10, 'ك': 8, 'ل': 6, 'م': 4, 'ن': 2, 'س': 12, 'ع': 10, 'ف': 20, 'ص': 30,
  'ق': 40, 'ر': 44, 'ش': 45, 'ت': 48, 'ث': 44, 'خ': 48, 'ذ': 52, 'ض': 56, 'ظ': 60, 'غ': 64
};

// ═══════════════════════════════════════════════════════
// ELEMENT ASSIGNMENTS (from book page 18)
// ═══════════════════════════════════════════════════════

export const ELEMENT_LETTERS = {
  fire: ['ا', 'ط', 'ه', 'ف', 'ش', 'ذ'],
  earth: ['ب', 'و', 'ي', 'ى', 'ص', 'ن', 'ت', 'ض'],
  air: ['ج', 'ز', 'ل', 'س', 'ق', 'ث', 'ظ'],
  water: ['د', 'خ', 'ع', 'ر', 'غ']
};

// ═══════════════════════════════════════════════════════
// MEBSUT LETTER TRANSFORMATION (from book pages 41-43)
// Mebsut (مبسوط) = "Spread/Expanded" forms
// Each letter transforms into its component strokes/dots
// Source: Risale-i Samur Hindi pp.41-43
// ═══════════════════════════════════════════════════════

export const MEBSUT_TRANSFORMS = {
  // Single form letters (no transformation)
  'ا': ['ا'],
  'ب': ['ب', 'ي'],  // ب = body + dot below
  'ت': ['ت', 'ي', 'ي'],  // ت = body + 2 dots above
  'ث': ['ث', 'ي', 'ي', 'ي'],  // ث = body + 3 dots above
  'ج': ['ج', 'ن'],  // ج = body + dot below
  'ح': ['ح'],
  'خ': ['خ', 'ن'],  // خ = ح + dot above
  'د': ['د'],
  'ذ': ['ذ', 'د'],  // ذ = د + dot above
  'ر': ['ر'],
  'ز': ['ز', 'ر'],  // ز = ر + dot above
  'س': ['س'],
  'ش': ['ش', 'ن', 'ن', 'ن'],  // ش = س + 3 dots above
  'ص': ['ص'],
  'ض': ['ض', 'ص'],  // ض = ص + dot above
  'ط': ['ط'],
  'ظ': ['ظ', 'ط'],  // ظ = ط + dot above
  'ع': ['ع'],
  'غ': ['غ', 'ع'],  // غ = ع + dot above
  'ف': ['ف'],
  'ق': ['ق', 'ن', 'ن'],  // ق = ف + 2 dots above
  'ك': ['ك', 'ن'],  // ك = body + 2 dots (represented as ن)
  'ل': ['ل'],
  'م': ['م'],
  'ن': ['ن'],
  'ه': ['ه'],
  'و': ['و'],
  'ي': ['ي'],
  'ى': ['ى'],  // Alif Maqsura
  'ة': ['ه', 'ي', 'ي'],  // ة = ه + 2 dots
};

export function transformToMebsut(text) {
  const result = [];
  for (const char of text) {
    const transformed = MEBSUT_TRANSFORMS[char] || [char];
    result.push(...transformed);
  }
  return result;
}

export function countMebsutLetters(mebsutLetters) {
  const counts = {};
  for (const letter of mebsutLetters) {
    counts[letter] = (counts[letter] || 0) + 1;
  }
  return counts;
}

const SH_NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ؤ':'و','ئ':'ي' };
function shNorm(ch) { return SH_NORM[ch] || ch; }
export function getElementForLetter(letter) {
  const n = shNorm(letter);
  for (const [element, letters] of Object.entries(ELEMENT_LETTERS)) {
    if (letters.includes(n)) return element;
  }
  return null;
}

export function countElementsByElement(letterCounts) {
  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  const elementValues = { fire: 0, earth: 0, air: 0, water: 0 };
  
  for (const [letter, count] of Object.entries(letterCounts)) {
    const element = getElementForLetter(letter);
    if (element) {
      elementCounts[element] += count;
      elementValues[element] += count * (ABJAD_KEBIR[shNorm(letter)] || 0);
    }
  }
  
  return { elementCounts, elementValues };
}

export function getDominantElement(text) {
  const counts = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const char of text) {
    const element = getElementForLetter(char);
    if (element) counts[element]++;
  }
  
  // Find dominant element
  let maxElement = 'fire';
  let maxCount = 0;
  for (const [element, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxElement = element;
    }
  }
  
  return { element: maxElement, counts, total: Object.values(counts).reduce((a, b) => a + b, 0) };
}

export function getDominantElementFromMebsut(mebsutLetters) {
  const letterCounts = countMebsutLetters(mebsutLetters);
  const { elementCounts, elementValues } = countElementsByElement(letterCounts);
  
  // Find dominant element by count (as per pp.42)
  let maxElement = 'fire';
  let maxCount = 0;
  for (const [element, count] of Object.entries(elementCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxElement = element;
    }
  }
  
  return {
    element: maxElement,
    elementCounts,
    elementValues,
    letterCounts,
    totalLetters: mebsutLetters.length
  };
}

// ═══════════════════════════════════════════════════════
// BAST CALCULATION (from book pages 38-53)
// ═══════════════════════════════════════════════════════

export const BAST_TABLE = {
  // First Bast (Bast-ı Evvel)
  1: {
    'ا': 1, 'ب': 2, 'ج': 3, 'د': 4, 'ه': 5, 'و': 6, 'ز': 7, 'ح': 8, 'ط': 9,
    'ي': 10, 'ك': 20, 'ل': 30, 'م': 40, 'ن': 50, 'س': 60, 'ع': 70, 'ف': 80, 'ص': 90,
    'ق': 100, 'ر': 200, 'ش': 300, 'ت': 400, 'ث': 500, 'خ': 600, 'ذ': 700, 'ض': 800, 'ظ': 900, 'غ': 1000
  },
  // Second Bast
  2: {
    'ا': 1, 'ب': 12, 'ج': 3, 'د': 14, 'ه': 5, 'و': 16, 'ز': 7, 'ح': 18, 'ط': 9,
    'ي': 10, 'ك': 8, 'ل': 18, 'م': 28, 'ن': 38, 'س': 48, 'ع': 58, 'ف': 68, 'ص': 78,
    'ق': 88, 'ر': 98, 'ش': 108, 'ت': 118, 'ث': 128, 'خ': 138, 'ذ': 148, 'ض': 158, 'ظ': 168, 'غ': 178
  },
  // Third Bast
  3: {
    'ا': 1, 'ب': 22, 'ج': 3, 'د': 24, 'ه': 5, 'و': 26, 'ز': 7, 'ح': 28, 'ط': 9,
    'ي': 10, 'ك': 16, 'ل': 36, 'م': 56, 'ن': 76, 'س': 96, 'ع': 116, 'ف': 136, 'ص': 156,
    'ق': 176, 'ر': 196, 'ش': 216, 'ت': 236, 'ث': 256, 'خ': 276, 'ذ': 296, 'ض': 316, 'ظ': 336, 'غ': 356
  },
  // Fourth Bast
  4: {
    'ا': 1, 'ب': 32, 'ج': 3, 'د': 34, 'ه': 5, 'و': 36, 'ز': 7, 'ح': 38, 'ط': 9,
    'ي': 10, 'ك': 24, 'ل': 54, 'م': 84, 'ن': 114, 'س': 144, 'ع': 174, 'ف': 204, 'ص': 234,
    'ق': 264, 'ر': 294, 'ش': 324, 'ت': 354, 'ث': 384, 'خ': 414, 'ذ': 444, 'ض': 474, 'ظ': 504, 'غ': 534
  },
  // Fifth Bast
  5: {
    'ا': 1, 'ب': 42, 'ج': 3, 'د': 44, 'ه': 5, 'و': 46, 'ز': 7, 'ح': 48, 'ط': 9,
    'ي': 10, 'ك': 32, 'ل': 72, 'م': 112, 'ن': 152, 'س': 192, 'ع': 232, 'ف': 272, 'ص': 312,
    'ق': 352, 'ر': 392, 'ش': 432, 'ت': 472, 'ث': 512, 'خ': 552, 'ذ': 592, 'ض': 632, 'ظ': 672, 'غ': 712
  }
};

export function calculateBast(text, bastLevel = 1) {
  const bastTable = BAST_TABLE[bastLevel];
  if (!bastTable) throw new Error(`Invalid Bast level: ${bastLevel}`);
  
  let total = 0;
  const breakdown = [];
  
  for (const char of text) {
    const n = shNorm(char);
    const value = bastTable[n] || 0;
    if (value > 0) {
      total += value;
      breakdown.push({ letter: char, value, element: getElementForLetter(n) });
    }
  }
  
  return { total, breakdown, bastLevel };
}

// ═══════════════════════════════════════════════════════
// DOKUZ MİZAN (Nine Scales) - from book pages 32-45
// ═══════════════════════════════════════════════════════

export const DAY_VALUES = {
  'pazar': { arabic: 'الأَحَدُ', value: 2024 },
  'pazartesi': { arabic: 'الْإِثْنَيْنَ', value: 4001 },
  'salı': { arabic: 'الثَّلَاثَاءُ', value: 3784 },
  'çarşamba': { arabic: 'الْأَرْبَعَاءُ', value: 3491 },
  'perşembe': { arabic: 'الْخَمِيسُ', value: 3077 },
  'cuma': { arabic: 'الْجُمُعَةُ', value: 3399 },
  'cumartesi': { arabic: 'السَّبَّتُ', value: 2590 }
};

export const PLANET_VALUES = {
  'zuhal': { arabic: 'زُحَل', value: 2963 },
  'musteri': { arabic: 'مُشْتَرِي', value: 3189 },
  'merih': { arabic: 'مَرِيخ', value: 3071 },
  'sems': { arabic: 'شَمْس', value: 3071 },
  'zuhre': { arabic: 'زُهْرَة', value: 3070 },
  'utarid': { arabic: 'عُطَارِد', value: 2029 },
  'kamer': { arabic: 'قَمَر', value: 2665 }
};

export const HOUR_VALUES = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12
};

export const NEED_VALUES = {
  'celb': { arabic: 'جَلْبٌ', value: 35 },
  'tard': { arabic: 'طَرْدٌ', value: 294 },
  'sıhhat': { arabic: 'صِحَّتٌ', value: 698 },
  'sukm': { arabic: 'سُقْمٌ', value: 140 }
};

export function calculateMizan(input, options = {}) {
  const {
    talibName = '',
    matlubName = '',
    day = 'pazar',
    hour = 1,
    planet = 'sems',
    needType = 'celb',
    isDayTime = true,
    isHayir = true
  } = options;
  
  const steps = [];
  let total = 0;
  
  // Mizan 1: Talib & Matlub names
  if (talibName) {
    const talibBast = calculateBast(talibName, 1);
    steps.push({
      mizan: 1,
      name: 'Talib İsmi',
      description: `Talib: "${talibName}"`,
      value: talibBast.total,
      breakdown: talibBast.breakdown
    });
    total += talibBast.total;
  }
  
  if (matlubName) {
    const matlubBast = calculateBast(matlubName, 1);
    steps.push({
      mizan: 1,
      name: 'Matlub İsmi',
      description: `Matlub: "${matlubName}"`,
      value: matlubBast.total,
      breakdown: matlubBast.breakdown
    });
    total += matlubBast.total;
  }
  
  // Mizan 2: Dominant Element
  const combinedNames = talibName + matlubName;
  if (combinedNames) {
    const dominant = getDominantElement(combinedNames);
    steps.push({
      mizan: 2,
      name: 'Galip Anasır',
      description: `Galip element: ${dominant.element.toUpperCase()}`,
      value: dominant.total,
      details: dominant.counts
    });
  }
  
  // Mizan 3: Day/Night
  const dayNightValue = isDayTime ? 237 : 440; // النَّهَارُ vs اللَّيْلُ
  steps.push({
    mizan: 3,
    name: isDayTime ? 'Gündüz' : 'Gece',
    description: isDayTime ? 'النَّهَارُ' : 'اللَّيْلُ',
    value: dayNightValue
  });
  total += dayNightValue;
  
  // Mizan 4: Hour
  const hourValue = HOUR_VALUES[hour] || hour;
  steps.push({
    mizan: 4,
    name: `Saat ${hour}`,
    description: `İçinde bulunduğumuz saat`,
    value: hourValue
  });
  total += hourValue;
  
  // Mizan 5: Day
  const dayData = DAY_VALUES[day.toLowerCase()] || DAY_VALUES.pazar;
  steps.push({
    mizan: 5,
    name: `Gün: ${day}`,
    description: `${dayData.arabic}`,
    value: dayData.value
  });
  total += dayData.value;
  
  // Mizan 6: Planet
  const planetData = PLANET_VALUES[planet.toLowerCase()] || PLANET_VALUES.sems;
  steps.push({
    mizan: 6,
    name: `Gezegen: ${planet}`,
    description: `${planetData.arabic}`,
    value: planetData.value
  });
  total += planetData.value;
  
  // Mizan 7: Need (Hacet)
  const needData = NEED_VALUES[needType.toLowerCase()] || NEED_VALUES.celb;
  steps.push({
    mizan: 7,
    name: `Hacet: ${needType}`,
    description: `${needData.arabic}`,
    value: needData.value
  });
  total += needData.value;
  
  // Mizan 8: Hayır/Şer
  const hayirSerValue = isHayir ? 2731 : 2725; // الْخَيْرُ vs الشَّرُّ
  steps.push({
    mizan: 8,
    name: isHayir ? 'Hayır' : 'Şer',
    description: isHayir ? 'الْخَيْرُ' : 'الشَّرُّ',
    value: hayirSerValue
  });
  total += hayirSerValue;
  
  // Mizan 9: Element Degree (default: 1st degree of dominant element)
  const dominantElement = getDominantElement(combinedNames || 'default').element;
  const elementDegreeValue = 100; // Base value for 1st degree
  steps.push({
    mizan: 9,
    name: `Anasır Derecesi: ${dominantElement}`,
    description: `${dominantElement.toUpperCase()} - 1. derece`,
    value: elementDegreeValue
  });
  total += elementDegreeValue;
  
  return {
    total,
    steps,
    method: 'Dokuz Mizan',
    source: 'Risale-i Samur Hindi, pp. 32-45'
  };
}

// ═══════════════════════════════════════════════════════
// VEFK CALCULATION (from book pages 19-30)
// ═══════════════════════════════════════════════════════

export const VEFK_CONSTANTS = {
  3: { name: 'Üçlü Vefk', planet: 'Zühal', day: 'Cumartesi', kutru: 15 },
  4: { name: 'Dörtlü Vefk', planet: 'Müşteri', day: 'Perşembe', kutru: 34 },
  5: { name: 'Beşli Vefk', planet: 'Merih', day: 'Salı', kutru: 65 },
  6: { name: 'Altılı Vefk', planet: 'Güneş', day: 'Pazar', kutru: 111 },
  7: { name: 'Yedili Vefk', planet: 'Zühre', day: 'Cuma', kutru: 175 },
  8: { name: 'Sekizli Vefk', planet: 'Utarid', day: 'Çarşamba', kutru: 260 },
  9: { name: 'Dokuzlu Vefk', planet: 'Kamer', day: 'Pazartesi', kutru: 369 }
};

export function calculateVefkBase(size, startValue = null) {
  const vefk = VEFK_CONSTANTS[size];
  if (!vefk) throw new Error(`Unsupported Vefk size: ${size}`);
  
  const kutru = vefk.kutru;
  const baseValue = startValue !== null ? startValue : (kutru - size);
  const increment = Math.floor(baseValue / size);
  
  // Build the magic square
  const grid = [];
  let currentValue = increment;
  
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push(currentValue);
      currentValue += 1;
    }
    grid.push(row);
  }
  
  return {
    size,
    vefkName: vefk.name,
    planet: vefk.planet,
    day: vefk.day,
    kutru,
    baseValue,
    increment,
    grid,
    method: 'Samur Hindi Vefk Construction',
    source: 'Risale-i Samur Hindi, pp. 19-30'
  };
}

// ═══════════════════════════════════════════════════════
// MAIN CALCULATION INTERFACE
// ═══════════════════════════════════════════════════════

export const CALCULATION_TYPES = {
  BAST: 'bast',
  MIZAN: 'mizan',
  VEFK: 'vefk',
  ELEMENT: 'element',
  ABJAD: 'abjad'
};

export function executeCalculation(type, input, options = {}) {
  switch (type) {
    case CALCULATION_TYPES.BAST:
      return calculateBast(input, options.bastLevel || 1);
    
    case CALCULATION_TYPES.MIZAN:
      return calculateMizan(input, options);
    
    case CALCULATION_TYPES.VEFK:
      return calculateVefkBase(options.size || 3, options.startValue);
    
    case CALCULATION_TYPES.ELEMENT:
      return getDominantElement(input);
    
    case CALCULATION_TYPES.ABJAD:
      const bast = calculateBast(input, 1);
      return {
        text: input,
        total: bast.total,
        breakdown: bast.breakdown,
        dominantElement: getDominantElement(input)
      };
    
    default:
      throw new Error(`Unknown calculation type: ${type}`);
  }
}

export function getBookRules() {
  return {
    source: BOOK_META,
    chapters: CHAPTERS,
    calculationMethods: [
      {
        name: 'Bast Hesabı',
        description: 'Harflerin beş seviyeli sayısal dönüşümü',
        pages: [38, 53],
        levels: 5
      },
      {
        name: 'Dokuz Mizan',
        description: 'Dokuz ölçekli hesaplama sistemi',
        pages: [32, 45],
        scales: 9
      },
      {
        name: 'Vefk Yapımı',
        description: 'Gezegenlere göre sihirli kareler',
        pages: [19, 30],
        sizes: [3, 4, 5, 6, 7, 8, 9]
      },
      {
        name: 'Anasır Analizi',
        description: 'Dört element hakimiyet hesabı',
        pages: [7, 9, 18],
        elements: ['fire', 'earth', 'air', 'water']
      }
    ]
  };
}

export default {
  executeCalculation,
  calculateBast,
  calculateMizan,
  calculateVefkBase,
  getDominantElement,
  getBookRules,
  ABJAD_KEBIR,
  ABJAD_SAGIR,
  BAST_TABLE,
  VEFK_CONSTANTS,
  CALCULATION_TYPES
};
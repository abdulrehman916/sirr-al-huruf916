// ═══════════════════════════════════════════════════════════════
//  ARABIC PHONOLOGY ENGINE — علم الأصوات العربية
//  Authentic phonetic rules for name generation
// ═══════════════════════════════════════════════════════════════

// Vowel marks
export const VOWELS = {
  FATHA: '\u064E',    // َ
  KASRA: '\u0650',    // ِ
  DAMMA: '\u064F',    // ُ
  SUKUN: '\u0652',    // ْ
  SHADDA: '\u0651',   // ّ
  MADDA: '\u0653',    // ّ
};

// Consonant classes by articulation point (مخارج الحروف)
const CONSONANT_CLASSES = {
  // حروف حلقي (throat)
  HALQI: ['ء', 'ه', 'ع', 'ح', 'غ', 'خ'],
  // حروف لهوي (tongue tip)
  LAHAWI: ['ق', 'ك', 'ج', 'ش', 'ض', 'ي', 'ل', 'ن', 'ر', 'ت', 'د', 'ط', 'ث', 'ظ', 'ذ', 'ز', 'س', 'ص', 'ش'],
  // حروف شفوي (lips)
  SHATAWI: ['ب', 'م', 'و', 'ف'],
  // حروف أسناني (dental)
  ASINANI: ['ت', 'د', 'ط', 'ث', 'ظ', 'ذ', 'ن', 'ر', 'ز', 'س', 'ش', 'ص', 'ض'],
};

// Forbidden consonant clusters (unnatural in Arabic)
const FORBIDDEN_CLUSTERS = [
  'غك', 'قغ', 'ظغ', 'غظ', 'كغ', 'غق', 'كش', 'نش', 'سش', 'غش',
  'طغ', 'ظط', 'غط', 'قك', 'كق', 'صك', 'كص', 'ضك', 'كض', 'غج', 'قج',
  'هق', 'هك', 'عق', 'عك', 'حك', 'حق', 'خك', 'خق',
];

// Syllable templates (البنية المقطعية)
const SYLLABLE_PATTERNS = [
  { type: 'CV',  pattern: 'Cv',    name: 'مفتوحة قصيرة' },     // CV (consonant + short vowel)
  { type: 'CVV', pattern: 'CV',    name: 'مفتوحة طويلة' },     // CVV (consonant + long vowel)
  { type: 'CVC', pattern: 'Cvc',   name: 'مقفلة' },            // CVC (consonant + vowel + consonant)
  { type: 'CVVC', pattern: 'CVC',  name: 'مقفلة طويلة' },      // CVVC (consonant + long vowel + consonant)
];

/**
 * getConsonantClass(consonant)
 * Returns the articulation class of a consonant
 */
export function getConsonantClass(consonant) {
  for (const [className, consonants] of Object.entries(CONSONANT_CLASSES)) {
    if (consonants.includes(consonant)) {
      return className;
    }
  }
  return 'UNKNOWN';
}

/**
 * isVowel(char)
 * Checks if character is a vowel mark
 */
export function isVowel(char) {
  return Object.values(VOWELS).includes(char);
}

/**
 * isConsonant(char)
 * Checks if character is a consonant letter
 */
export function isConsonant(char) {
  const consonants = [
    'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش',
    'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي',
    'ا', 'أ', 'إ', 'آ', 'ى', 'ؤ', 'ئ', 'ء'
  ];
  return consonants.includes(char);
}

/**
 * isLongVowel(char)
 * Checks if character is a long vowel (مد)
 */
export function isLongVowel(char) {
  return ['ا', 'و', 'ي', 'ى', 'آ', 'أ', 'إ'].includes(char);
}

/**
 * extractBareConsonants(text)
 * Extract consonants without vowel marks
 */
export function extractBareConsonants(text) {
  if (!text) return [];
  const vowelMarks = Object.values(VOWELS).join('');
  return text.replace(new RegExp(`[${vowelMarks}]`, 'g'), '').split('').filter(c => isConsonant(c));
}

/**
 * validateSyllableStructure(consonants, vowels)
 * Validates Arabic syllable structure (CV, CVV, CVC, CVVC)
 */
export function validateSyllableStructure(consonants, vowels) {
  if (!consonants || consonants.length === 0) {
    return { valid: false, reason: 'No consonants' };
  }
  
  // Arabic words cannot start with Sukun
  if (vowels && vowels[0] === VOWELS.SUKUN) {
    return { valid: false, reason: 'Cannot start with Sukun (التقاء الساكنين)' };
  }
  
  // Check for forbidden clusters (3+ consecutive consonants)
  let consecutiveConsonants = 0;
  for (let i = 0; i < consonants.length; i++) {
    if (isConsonant(consonants[i])) {
      consecutiveConsonants++;
      if (consecutiveConsonants >= 3) {
        return { valid: false, reason: 'Forbidden consonant cluster (3+ consonants)' };
      }
    } else {
      consecutiveConsonants = 0;
    }
  }
  
  // Validate syllable count (Arabic words typically 2-4 syllables)
  const syllableCount = vowels ? vowels.filter(v => v !== VOWELS.SUKUN).length : consonants.length;
  if (syllableCount < 2 || syllableCount > 5) {
    return { valid: false, reason: `Invalid syllable count: ${syllableCount} (expected 2-4)` };
  }
  
  return { valid: true, syllableCount, reason: 'Valid syllable structure' };
}

/**
 * applyPhoneticRules(consonants, context)
 * Apply authentic Arabic phonetic rules for vowel assignment
 */
export function applyPhoneticRules(consonants, context = {}) {
  if (!consonants || consonants.length === 0) return null;
  
  const vowels = [];
  const rules = [];
  
  for (let i = 0; i < consonants.length; i++) {
    const c = consonants[i];
    const prevC = i > 0 ? consonants[i - 1] : null;
    const nextC = i < consonants.length - 1 ? consonants[i + 1] : null;
    
    let vowel = null;
    let rule = '';
    
    // Rule 1: First consonant cannot have Sukun
    if (i === 0) {
      vowel = VOWELS.FATHA; // Default to Fatha for initial consonant
      rule = 'Initial consonant takes Fatha';
    }
    // Rule 2: Check for forbidden cluster with next consonant
    else if (nextC && FORBIDDEN_CLUSTERS.includes(c + nextC)) {
      // Insert Kasra to break cluster
      vowel = VOWELS.KASRA;
      rule = `Kasra to break forbidden cluster ${c}${nextC}`;
    }
    // Rule 3: Throat letters (حلقية) prefer Fatha
    else if (CONSONANT_CLASSES.HALQI.includes(c)) {
      vowel = VOWELS.FATHA;
      rule = 'Throat letter takes Fatha';
    }
    // Rule 4: Letters ي, و prefer Kasra/Damma respectively
    else if (c === 'ي') {
      vowel = VOWELS.KASRA;
      rule = 'Ya takes Kasra';
    } else if (c === 'و') {
      vowel = VOWELS.DAMMA;
      rule = 'Waw takes Damma';
    }
    // Rule 5: Before إيل ending, use appropriate vowel
    else if (nextC === 'ي' && consonants[i + 2] === 'ل') {
      // Pre-īl consonant: use Kasra for smooth transition
      vowel = VOWELS.KASRA;
      rule = 'Pre-īl position takes Kasra';
    }
    // Rule 6: Final consonant before suffix
    else if (i === consonants.length - 1 && !context.isFinal) {
      vowel = VOWELS.SUKUN;
      rule = 'Non-final consonant takes Sukun';
    }
    // Default: Fatha
    else {
      vowel = VOWELS.FATHA;
      rule = 'Default Fatha';
    }
    
    vowels.push(vowel);
    rules.push(rule);
  }
  
  return { vowels, rules };
}

/**
 * buildSyllable(consonant, vowel, isLong)
 * Construct a syllable with proper vowel placement
 */
export function buildSyllable(consonant, vowel, isLong = false) {
  if (!consonant || !isConsonant(consonant)) return null;
  
  let syllable = consonant;
  
  if (vowel) {
    syllable += vowel;
  }
  
  if (isLong) {
    // Add long vowel marker
    if (vowel === VOWELS.FATHA) {
      syllable += 'ا';
    } else if (vowel === VOWELS.KASRA) {
      syllable += 'ي';
    } else if (vowel === VOWELS.DAMMA) {
      syllable += 'و';
    }
  }
  
  return syllable;
}

/**
 * vocalizeWord(consonants, vowels)
 * Apply vowels to consonants to form complete word
 */
export function vocalizeWord(consonants, vowels) {
  if (!consonants || consonants.length === 0) return null;
  if (!vowels || vowels.length !== consonants.length) return null;
  
  let word = '';
  
  for (let i = 0; i < consonants.length; i++) {
    word += consonants[i];
    word += vowels[i];
  }
  
  return word;
}

/**
 * checkPronounceability(word)
 * Comprehensive pronounceability check
 */
export function checkPronounceability(word) {
  if (!word) return { pronounceable: false, reason: 'Empty word' };
  
  const bareConsonants = extractBareConsonants(word);
  
  // Check 1: No forbidden clusters
  for (let i = 0; i < bareConsonants.length - 1; i++) {
    const cluster = bareConsonants[i] + bareConsonants[i + 1];
    if (FORBIDDEN_CLUSTERS.includes(cluster)) {
      return { pronounceable: false, reason: `Forbidden cluster: ${cluster}` };
    }
  }
  
  // Check 2: No initial Sukun
  const firstVowel = word.match(/[\u064E\u0650\u064F\u0652]/);
  if (firstVowel && firstVowel[0] === VOWELS.SUKUN) {
    return { pronounceable: false, reason: 'Initial Sukun violation' };
  }
  
  // Check 3: Vowel density (must have sufficient vowels)
  const vowelCount = (word.match(/[\u064E\u0650\u064F]/g) || []).length;
  const consonantCount = bareConsonants.length;
  const vowelRatio = vowelCount / consonantCount;
  
  if (vowelRatio < 0.4) {
    return { pronounceable: false, reason: `Insufficient vowels: ${vowelRatio.toFixed(2)} (min 0.4)` };
  }
  
  // Check 4: Sukun density (max 25%)
  const sukunCount = (word.match(new RegExp(VOWELS.SUKUN, 'g')) || []).length;
  const sukunRatio = sukunCount / consonantCount;
  
  if (sukunRatio > 0.25) {
    return { pronounceable: false, reason: `Excessive Sukun: ${sukunRatio.toFixed(2)} (max 0.25)` };
  }
  
  return {
    pronounceable: true,
    reason: 'Pronounceable',
    metrics: {
      vowelRatio: vowelRatio.toFixed(2),
      sukunRatio: sukunRatio.toFixed(2),
      syllableCount: vowelCount
    }
  };
}

/**
 * generatePhonologicallyValidName(consonants, options)
 * Generate name with full phonological validation
 */
export function generatePhonologicallyValidName(consonants, options = {}) {
  const { isAngel = true, addIlEnding = true } = options;
  
  if (!consonants || consonants.length === 0) {
    return { success: false, error: 'No consonants provided' };
  }
  
  // Apply phonetic rules
  const phoneticResult = applyPhoneticRules(consonants, { isFinal: !addIlEnding });
  if (!phoneticResult) {
    return { success: false, error: 'Failed to apply phonetic rules' };
  }
  
  // Build vocalized word
  let vocalized = vocalizeWord(consonants, phoneticResult.vowels);
  if (!vocalized) {
    return { success: false, error: 'Failed to vocalize word' };
  }
  
  // Add إيل ending if requested
  if (addIlEnding && isAngel) {
    // Remove final vowel if exists
    vocalized = vocalized.replace(/[\u064E\u0650\u064F\u0652]$/, '');
    // Add إيل with proper vowels
    vocalized += VOWELS.KASRA + 'ي' + VOWELS.FATHA + 'ل';
  }
  
  // Validate syllable structure
  const syllableValidation = validateSyllableStructure(
    extractBareConsonants(vocalized),
    vocalized.match(/[\u064E\u0650\u064F\u0652]/g) || []
  );
  
  if (!syllableValidation.valid) {
    return {
      success: false,
      error: syllableValidation.reason,
      word: vocalized
    };
  }
  
  // Check pronounceability
  const pronounceability = checkPronounceability(vocalized);
  
  if (!pronounceability.pronounceable) {
    return {
      success: false,
      error: pronounceability.reason,
      word: vocalized,
      metrics: pronounceability.metrics
    };
  }
  
  return {
    success: true,
    word: vocalized,
    consonants,
    vowels: phoneticResult.vowels,
    rules: phoneticResult.rules,
    syllableCount: syllableValidation.syllableCount,
    metrics: pronounceability.metrics
  };
}
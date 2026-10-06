// ═══════════════════════════════════════════════════════════════
//  ARABIC MORPHOLOGICAL ENGINE — علم الصرف
//  Validates roots, patterns, and derivational structure
// ═══════════════════════════════════════════════════════════════

// Authentic Arabic trilateral roots
const AUTHENTIC_ROOTS = [
  // Angelic/theological roots
  ['ج', 'ب', 'ر'], // J-B-R (restoration)
  ['ع', 'ل', 'م'], // ʿ-L-M (knowledge)
  ['ر', 'ح', 'م'], // R-Ḥ-M (mercy)
  ['ق', 'د', 'س'], // Q-D-S (holiness)
  ['ن', 'و', 'ر'], // N-W-R (light)
  ['ح', 'ق', 'ق'], // Ḥ-Q-Q (truth)
  ['ص', 'د', 'ق'], // Ṣ-D-Q (truthfulness)
  ['أ', 'م', 'ن'], // ʾ-M-N (security)
  ['س', 'ل', 'م'], // S-L-M (peace)
  ['ب', 'ر', 'ك'], // B-R-K (blessing)
  ['ف', 'ض', 'ل'], // F-Ḍ-L (grace)
  ['ع', 'ز', 'ز'], // ʿ-Z-Z (might)
  ['ك', 'ب', 'ر'], // K-B-R (greatness)
  ['ح', 'م', 'د'], // Ḥ-M-D (praise)
  ['ش', 'ك', 'ر'], // Sh-K-R (gratitude)
  ['ط', 'ه', 'ر'], // Ṭ-H-R (purity)
  ['و', 'ل', 'ي'], // W-L-Y (guardianship)
  ['ن', 'ص', 'ر'], // N-Ṣ-R (victory)
  ['ف', 'ت', 'ح'], // F-T-Ḥ (opening)
  ['غ', 'ف', 'ر'], // Gh-F-R (forgiveness)
  ['ت', 'و', 'ب'], // T-W-B (repentance)
  ['ه', 'د', 'ي'], // H-D-Y (guidance)
  ['ر', 'ش', 'د'], // R-Sh-D (right guidance)
  ['ع', 'د', 'ل'], // ʿ-D-L (justice)
  ['ح', 'ك', 'م'], // Ḥ-K-M (wisdom)
  ['ف', 'ه', 'م'], // F-H-M (understanding)
  ['ل', 'ط', 'ف'], // L-Ṭ-F (kindness)
  ['ر', 'أ', 'ف'], // R-ʾ-F (compassion)
  ['ب', 'ش', 'ر'], // B-Sh-R (good news)
  ['خ', 'ل', 'ق'], // Kh-L-Q (creation)
  ['ص', 'و', 'ر'], // Ṣ-W-R (formation)
  ['ر', 'ز', 'ق'], // R-Z-Q (provision)
  ['و', 'ه', 'ب'], // W-H-B (bestowal)
  ['ق', 'د', 'ر'], // Q-D-R (power)
  ['أ', 'م', 'ر'], // ʾ-M-R (command)
  ['م', 'ل', 'ك'], // M-L-K (kingship)
  ['ع', 'ظ', 'م'], // ʿ-Ẓ-M (greatness)
  ['ج', 'ل', 'ل'], // J-L-L (majesty)
  ['ك', 'ر', 'م'], // K-R-M (nobility)
  ['ش', 'ر', 'ف'], // Sh-R-F (honor)
  ['ف', 'خ', 'ر'], // F-Kh-R (pride)
  ['ع', 'ز', 'م'], // ʿ-Z-M (determination)
  ['ص', 'ب', 'ر'], // Ṣ-B-R (patience)
  ['ش', 'ج', 'ع'], // Sh-J-ʿ (courage)
  ['ب', 'س', 'ل'], // B-S-L (bravery)
  ['ن', 'ج', 'ح'], // N-J-Ḥ (success)
  ['ف', 'ل', 'ح'], // F-L-Ḥ (success)
  ['ظ', 'ف', 'ر'], // Ẓ-F-R (triumph)
  ['غ', 'ل', 'ب'], // Gh-L-B (victory)
  ['ق', 'ه', 'ر'], // Q-H-R (dominance)
];

// Morphological patterns (أوزان) for angelic names
const ANGELIC_PATTERNS = [
  { pattern: 'فَعِيل', template: 'CCīC', name: 'Faʿīl', example: 'جَبْريل' },
  { pattern: 'فَعَائِل', template: 'CaCāʾiC', name: 'Faʿāʾil', example: 'إِسْرَافِيل' },
  { pattern: 'فِعِّيل', template: 'CiʿʿīC', name: 'Fiʿʿīl', example: 'مِيكَائِيل' },
  { pattern: 'فَاعِل', template: 'CāCiC', name: 'Fāʿil', example: 'حَافِظ' },
  { pattern: 'فَعُول', template: 'CaCūC', name: 'Faʿūl', example: 'غَفُور' },
  { pattern: 'فَعِيل', template: 'CaCīC', name: 'Faʿīl', example: 'عَلِيم' },
  { pattern: 'مَفْعُول', template: 'maCCūC', name: 'Mafʿūl', example: 'مَحْمُود' },
  { pattern: 'فَعَّال', template: 'CaCCāC', name: 'Faʿʿāl', example: 'رَحَّام' },
  { pattern: 'أَفْعَل', template: 'ʾaCCaC', name: 'ʾAfʿal', example: 'أَكْرَم' },
  { pattern: 'فُعَيْل', template: 'CuCayC', name: 'Fuʿayl', example: 'رُشَيْد' },
];

// Forbidden root combinations
const FORBIDDEN_CLUSTERS = [
  'غك', 'قغ', 'ظغ', 'غظ', 'كغ', 'غق', 'كش', 'نش', 'سش', 'غش',
  'طغ', 'ظط', 'غط', 'قك', 'كق', 'صك', 'كص', 'ضك', 'كض'
];

/**
 * getAuthenticRootForValue(value)
 * Select authentic root based on numeric value
 */
export function getAuthenticRootForValue(value) {
  const n = Math.abs(value);
  const idx = n % AUTHENTIC_ROOTS.length;
  return AUTHENTIC_ROOTS[idx];
}

/**
 * isValidRoot(letters)
 * Validate if letters form authentic Arabic root
 */
export function isValidRoot(letters) {
  if (!letters || letters.length < 3 || letters.length > 4) return false;
  
  const rootStr = letters.join('');
  
  // Check against known roots
  const isKnown = AUTHENTIC_ROOTS.some(r => r.join('') === rootStr);
  if (isKnown) return true;
  
  // Check for forbidden clusters
  for (let i = 0; i < letters.length - 1; i++) {
    if (FORBIDDEN_CLUSTERS.includes(letters[i] + letters[i + 1])) {
      return false;
    }
  }
  
  // Check for weak letters in invalid positions
  const weakLetters = ['ا', 'و', 'ي'];
  if (weakLetters.includes(letters[0]) && weakLetters.includes(letters[letters.length - 1])) {
    return false;
  }
  
  return true;
}

/**
 * generateNameFromRoot(root, category)
 * Generate name from root using morphological pattern
 */
export function generateNameFromRoot(root, category = 'angel') {
  if (!root || root.length < 3) return null;
  
  // Select pattern based on root hash
  const patterns = category === 'angel' ? ANGELIC_PATTERNS : ANGELIC_PATTERNS;
  const patternIdx = root.reduce((sum, c) => sum + c.charCodeAt(0), 0) % patterns.length;
  const pattern = patterns[patternIdx];
  
  // Apply pattern to root
  const name = applyPatternToRoot(root, pattern);
  
  return {
    name,
    pattern: pattern.pattern,
    template: pattern.template,
    root: root.join('')
  };
}

/**
 * applyPatternToRoot(root, pattern)
 * Apply morphological pattern to root
 */
function applyPatternToRoot(root, pattern) {
  const [c1, c2, c3] = root;
  
  // Pattern templates
  const templates = {
    'فَعِيل': `${c1}${c2}ي${c3}ل`,           // Jibrīl
    'فَعَائِل': `إِسْ${c2}ا${c3}ي${c3}ل`,    // Isrāfīl
    'فِعِّيل': `مِي${c2}َا${c3}ي${c3}ل`,     // Mīkāʾīl
    'فَاعِل': `${c1}ا${c2}${c3}`,            // Ḥāfiẓ
    'فَعُول': `${c1}${c2}و${c3}`,            // Ghafūr
    'فَعِيل': `${c1}${c2}ي${c3}`,            // ʿAlīm
    'مَفْعُول': `مَ${c1}${c2}و${c3}`,        // Maḥmūd
    'فَعَّال': `${c1}${c2}${c2}ا${c3}`,      // Raḥḥām
    'أَفْعَل': `أَ${c1}${c2}${c3}`,          // ʾAkram
    'فُعَيْل': `${c1}ُ${c2}ي${c3}`,          // Rushayd
  };
  
  return templates[pattern.template] || `${c1}${c2}ي${c3}ل`;
}

/**
 * validateMorphologicalStructure(name)
 * Validate name has proper morphological structure
 */
export function validateMorphologicalStructure(name) {
  if (!name) return { valid: false, score: 0, reason: 'Empty name' };
  
  // Check minimum length
  if (name.length < 5) {
    return { valid: false, score: 20, reason: 'Too short for Arabic name' };
  }
  
  // Check for valid pattern match
  const matchedPattern = ANGELIC_PATTERNS.some(p => {
    const example = p.example;
    // Simple pattern matching - check if name follows similar structure
    return name.endsWith('يل') || name.length >= 5;
  });
  
  if (!matchedPattern && !name.endsWith('يل')) {
    return { valid: false, score: 30, reason: 'Invalid morphological pattern' };
  }
  
  // Extract potential root
  const consonants = name.replace(/[\u064E\u0650\u064F\u0652اوي]/g, '').split('');
  if (consonants.length < 3) {
    return { valid: false, score: 25, reason: 'Insufficient root consonants' };
  }
  
  // Validate root
  const rootValid = isValidRoot(consonants.slice(0, 3));
  
  return {
    valid: rootValid,
    score: rootValid ? 90 : 40,
    reason: rootValid ? 'Valid morphology' : 'Invalid root structure',
    root: consonants.slice(0, 3).join('')
  };
}

/**
 * checkPronounceability(word)
 * Check if word is pronounceable
 */
export function checkPronounceability(word) {
  if (!word) return { pronounceable: false, reason: 'Empty word', score: 0 };
  
  const vowelMarks = word.match(/[\u064E\u0650\u064F\u0652]/g) || [];
  const vowelCount = vowelMarks.filter(v => v !== '\u0652').length;
  const sukunCount = vowelMarks.filter(v => v === '\u0652').length;
  const bareConsonants = word.replace(/[\u064E\u0650\u064F\u0652]/g, '').split('');
  const consonantCount = bareConsonants.length;
  
  // Check forbidden clusters
  for (let i = 0; i < bareConsonants.length - 1; i++) {
    if (FORBIDDEN_CLUSTERS.includes(bareConsonants[i] + bareConsonants[i + 1])) {
      return { pronounceable: false, reason: `Forbidden cluster`, score: 10 };
    }
  }
  
  // Check initial Sukun
  if (vowelMarks[0] === '\u0652') {
    return { pronounceable: false, reason: 'Initial Sukun', score: 0 };
  }
  
  // Calculate score
  const vowelRatio = vowelCount / consonantCount;
  const sukunRatio = sukunCount / consonantCount;
  
  let score = 100;
  if (vowelRatio < 0.4) score -= 30;
  if (sukunRatio > 0.25) score -= 25;
  if (consonantCount < 3 || consonantCount > 6) score -= 20;
  
  return {
    pronounceable: score >= 70,
    score: Math.max(0, score),
    vowelRatio: vowelRatio.toFixed(2),
    sukunRatio: sukunRatio.toFixed(2),
    reason: score >= 70 ? 'Pronounceable' : 'Phonetic violation'
  };
}

/**
 * applyPhoneticRules(consonants, number)
 * Apply phonetic rules for vowel assignment
 */
export function applyPhoneticRules(consonants, number) {
  const vowels = [];
  const rules = [];
  const VOWELS = {
    FATHA: '\u064E',
    KASRA: '\u0650',
    DAMMA: '\u064F',
    SUKUN: '\u0652',
  };
  
  for (let i = 0; i < consonants.length; i++) {
    const c = consonants[i];
    let vowel = VOWELS.FATHA;
    let rule = 'Default Fatha';
    
    if (i === 0) {
      vowel = VOWELS.FATHA;
      rule = 'Initial Fatha';
    } else {
      const vowelType = (Math.abs(number) + i) % 3;
      if (vowelType === 0) { vowel = VOWELS.FATHA; rule = 'Fatha'; }
      else if (vowelType === 1) { vowel = VOWELS.KASRA; rule = 'Kasra'; }
      else { vowel = VOWELS.DAMMA; rule = 'Damma'; }
    }
    
    vowels.push(vowel);
    rules.push(rule);
  }
  
  return { vowels, rules };
}

/**
 * extractBareConsonants(text)
 */
export function extractBareConsonants(text) {
  if (!text) return [];
  const vowelMarks = '\u064E\u0650\u064F\u0652';
  return text.replace(new RegExp(`[${vowelMarks}]`, 'g'), '').split('').filter(c => 
    ['ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش',
     'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'].includes(c)
  );
}

// VOWELS constant for export
export const VOWELS = {
  FATHA: '\u064E',
  KASRA: '\u0650',
  DAMMA: '\u064F',
  SUKUN: '\u0652',
};
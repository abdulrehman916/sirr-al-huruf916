// ═══════════════════════════════════════════════════════════════
//  ARABIC NAME VALIDATION ENGINE — LINGUISTIC AUTHENTICITY
//  Validates names against actual Arabic phonology and morphology
// ═══════════════════════════════════════════════════════════════

const FATHA = '\u064E';
const KASRA = '\u0650';
const DAMMA = '\u064F';
const SUKUN = '\u0652';
const SHADDA = '\u0651';

// Forbidden consonant sequences (unnatural in Arabic)
const IMPOSSIBLE_SEQUENCES = [
  'غك', 'قغ', 'ظغ', 'غظ', 'كغ', 'غق', 'كش', 'نش', 'سش', 'غش',
  'طغ', 'ظط', 'غط', 'قك', 'كق', 'صك', 'كص', 'ضك', 'كض'
];

/**
 * extractConsonants(name)
 * Extract bare consonants from vocalized name
 */
function extractConsonants(name) {
  return name.replace(/[\u064E\u0650\u064F\u0652\u0651]/g, '').split('');
}

/**
 * validateRootStructure(name)
 * Validates if name has valid Arabic root structure (3-5 consonants)
 */
function validateRootStructure(name) {
  const consonants = extractConsonants(name);
  const len = consonants.length;
  
  // Arabic roots are typically 3-5 consonants
  if (len < 3 || len > 5) {
    return {
      valid: false,
      score: 20,
      reason: `Invalid root length: ${len} consonants (expected 3-5)`
    };
  }
  
  // Check for repetitive patterns
  const uniqueRatio = new Set(consonants).size / len;
  if (uniqueRatio < 0.4 && len > 4) {
    return {
      valid: false,
      score: 30,
      reason: 'Excessive consonant repetition (non-Arabic pattern)'
    };
  }
  
  // Check for forbidden sequences
  const consonantStr = consonants.join('');
  for (const seq of IMPOSSIBLE_SEQUENCES) {
    if (consonantStr.includes(seq)) {
      return {
        valid: false,
        score: 10,
        reason: `Unnatural consonant sequence: ${seq}`
      };
    }
  }
  
  return {
    valid: true,
    score: 85,
    reason: 'Valid root structure'
  };
}

/**
 * validateSyllablePattern(name)
 * Validates syllable structure
 */
function validateSyllablePattern(name) {
  const bare = name.replace(/[\u064E\u0650\u064F\u0652\u0651]/g, '');
  
  // Check for forbidden clusters (3+ consecutive consonants without vowels)
  const clusterPattern = /[^اويآأإئؤ]{3,}/;
  if (clusterPattern.test(bare)) {
    return {
      valid: false,
      score: 15,
      reason: 'Forbidden consonant cluster (3+ consonants)'
    };
  }
  
  // Count syllables
  const syllableCount = (bare.match(/[اوي]/g) || []).length + 1;
  if (syllableCount > 4) {
    return {
      valid: false,
      score: 40,
      reason: `Too many syllables: ${syllableCount} (max 4 for Arabic names)`
    };
  }
  
  return {
    valid: true,
    score: 80,
    reason: 'Valid syllable pattern'
  };
}

/**
 * validateMorphologicalPattern(name, isAngel)
 * Validates against known Arabic name patterns
 */
function validateMorphologicalPattern(name, isAngel) {
  const bare = name.replace(/[\u064E\u0650\u064F\u0652\u0651]/g, '');
  const len = bare.length;
  
  if (isAngel) {
    // Angel names should end with إيل
    if (!name.endsWith('إيل') && !name.endsWith('ائيل') && 
        !name.endsWith('ييل') && !name.endsWith('ؤيل')) {
      return {
        valid: false,
        score: 25,
        reason: 'Angel name missing proper -īl ending'
      };
    }
    
    // Ideal length for angel names: 5-7 letters (including إيل)
    if (len < 5 || len > 8) {
      return {
        valid: false,
        score: 35,
        reason: `Invalid length for angel name: ${len} letters (expected 5-8)`
      };
    }
  } else {
    // Jinn names should end with طيش
    if (!name.endsWith('طيش')) {
      return {
        valid: false,
        score: 25,
        reason: 'Jinn name missing proper -ṭaysh ending'
      };
    }
    
    // Ideal length for jinn names: 6-9 letters (including طيش)
    if (len < 6 || len > 10) {
      return {
        valid: false,
        score: 35,
        reason: `Invalid length for jinn name: ${len} letters (expected 6-10)`
      };
    }
  }
  
  return {
    valid: true,
    score: 90,
    reason: 'Valid morphological pattern'
  };
}

/**
 * validatePronounceability(name)
 * Checks if name is actually pronounceable
 */
function validatePronounceability(name) {
  const bare = name.replace(/[\u064E\u0650\u064F\u0652\u0651]/g, '');
  
  // Check for impossible sequences
  for (const impossible of IMPOSSIBLE_SEQUENCES) {
    if (bare.includes(impossible)) {
      return {
        valid: false,
        score: 10,
        reason: `Impossible consonant sequence: ${impossible}`
      };
    }
  }
  
  // Check vowel distribution
  const fathaCount = (name.match(new RegExp(FATHA, 'g')) || []).length;
  const kasraCount = (name.match(new RegExp(KASRA, 'g')) || []).length;
  const dammaCount = (name.match(new RegExp(DAMMA, 'g')) || []).length;
  
  const totalVowels = fathaCount + kasraCount + dammaCount;
  if (totalVowels === 0) {
    return {
      valid: false,
      score: 0,
      reason: 'No vowels detected'
    };
  }
  
  // Check for vowel balance
  const maxVowel = Math.max(fathaCount, kasraCount, dammaCount);
  if (maxVowel / totalVowels > 0.85) {
    return {
      valid: false,
      score: 50,
      reason: 'Unbalanced vowel distribution'
    };
  }
  
  return {
    valid: true,
    score: 90,
    reason: 'Pronounceable'
  };
}

/**
 * validateTashkeel(name)
 * Validates proper use of harakat marks
 */
function validateTashkeel(name) {
  const harakatPattern = /[\u064E\u0650\u064F\u0652\u0651]/g;
  const harakat = name.match(harakatPattern) || [];
  const consonants = extractConsonants(name);
  const harakatRatio = harakat.length / consonants.length;
  
  if (harakatRatio < 0.5) {
    return {
      valid: false,
      score: 40,
      reason: 'Insufficient tashkeel (vowel marks)'
    };
  }
  
  const sukunCount = (name.match(new RegExp(SUKUN, 'g')) || []).length;
  if (sukunCount > 2) {
    return {
      valid: false,
      score: 50,
      reason: 'Excessive Sukun marks'
    };
  }
  
  return {
    valid: true,
    score: 95,
    reason: 'Proper tashkeel'
  };
}

/**
 * validateName(name, isAngel)
 * Comprehensive validation with scoring
 */
export function validateName(name, isAngel) {
  const validations = [
    { name: 'Root Structure', fn: validateRootStructure, weight: 0.25 },
    { name: 'Syllable Pattern', fn: validateSyllablePattern, weight: 0.20 },
    { name: 'Morphology', fn: validateMorphologicalPattern, weight: 0.25 },
    { name: 'Pronounceability', fn: validatePronounceability, weight: 0.20 },
    { name: 'Tashkeel', fn: validateTashkeel, weight: 0.10 },
  ];
  
  const results = [];
  let totalScore = 0;
  let totalWeight = 0;
  let failed = false;
  let failureReason = '';
  
  for (const validation of validations) {
    const result = validation.fn(name, isAngel);
    results.push({
      name: validation.name,
      score: result.score,
      reason: result.reason,
      passed: result.valid
    });
    
    if (!result.valid) {
      failed = true;
      failureReason = result.reason;
    }
    
    totalScore += result.score * validation.weight;
    totalWeight += validation.weight;
  }
  
  const finalScore = Math.round(totalScore / totalWeight);
  
  return {
    name,
    isAngel,
    score: finalScore,
    passed: !failed && finalScore >= 70,
    failureReason: failed ? failureReason : null,
    validations: results,
    recommendation: finalScore >= 85 ? 'Excellent' : 
                    finalScore >= 70 ? 'Acceptable' : 
                    finalScore >= 50 ? 'Needs Revision' : 'Reject'
  };
}
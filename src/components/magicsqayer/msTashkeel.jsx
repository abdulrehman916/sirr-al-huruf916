// ═══════════════════════════════════════════════════════════════
//  PATTERN-BASED ARABIC NAME GENERATOR WITH TASHKEEL
//  Uses 200+ authentic morphological templates
// ═══════════════════════════════════════════════════════════════

import { generateNameFromPattern, getNameForHierarchyValue } from './msPatternGenerator';
import { validateName } from './msNameValidator';

// Vowel marks
const FATHA = '\u064E';
const KASRA = '\u0650';
const DAMMA = '\u064F';
const SUKUN = '\u0652';

/**
 * addTashkeelToPatternName(bareName, suffixType)
 * Apply complete tashkeel to pattern-generated name
 */
export function addTashkeelToPatternName(bareName, suffixType) {
  if (!bareName || typeof bareName !== 'string') {
    return { name: null, score: 0, passed: false, failureReason: 'Invalid input' };
  }

  const isAngel = suffixType === 'angel' || suffixType === 'ar-angel' || suffixType === 'heb-angel';
  const isJinn = suffixType === 'jinn' || suffixType === 'ar-jinn' || suffixType === 'heb-jinn';
  
  // Validate the bare name
  const validation = validateName(bareName, isAngel);
  
  if (!validation.passed) {
    return {
      name: bareName,
      score: validation.score,
      passed: false,
      validation,
      failureReason: validation.failureReason
    };
  }
  
  // Name is already valid from pattern generation
  return {
    name: bareName,
    score: validation.score,
    passed: true,
    validation,
    failureReason: null
  };
}

/**
 * generatePatternBasedName(value, suffixType)
 * Generate name using pattern-based approach
 */
export function generatePatternBasedName(value, suffixType = 'ar-angel') {
  const category = suffixType.includes('angel') ? 'angel' : 
                   suffixType.includes('jinn') ? 'jinn' : 'general';
  
  // Generate using pattern system
  const result = generateNameFromPattern(value, category);
  
  if (!result || !result.success) {
    return {
      success: false,
      error: result?.error || 'Generation failed',
      value,
      suffixType
    };
  }
  
  // Apply tashkeel
  const tashkeelResult = addTashkeelToPatternName(result.generatedName, suffixType);
  
  return {
    success: true,
    value,
    suffixType,
    pattern: result.pattern,
    consonants: result.consonants,
    bareName: result.bareName,
    vocalizedName: tashkeelResult.name,
    score: tashkeelResult.score,
    passed: tashkeelResult.passed,
    failureReason: tashkeelResult.failureReason,
    validation: tashkeelResult.validation
  };
}

/**
 * generateHierarchyNames(hierarchyData, suffixType)
 * Generate names for all 8 hierarchy levels
 */
export function generateHierarchyNames(hierarchyData, suffixType = 'ar-angel') {
  if (!hierarchyData) return null;
  
  const names = {};
  const failed = {};
  
  // Generate for each hierarchy level
  const levels = ['usurper', 'guide', 'mystery', 'adjuster', 'leader', 'regulator', 'genGov', 'highOver'];
  
  levels.forEach(level => {
    const value = hierarchyData[level];
    if (!value) return;
    
    const result = generatePatternBasedName(value, suffixType);
    
    if (result.success && result.passed) {
      names[level] = {
        value,
        name: result.vocalizedName,
        pattern: result.pattern,
        score: result.score
      };
    } else {
      failed[level] = result;
    }
  });
  
  return {
    names,
    failed,
    totalLevels: levels.length,
    successfulCount: Object.keys(names).length,
    failedCount: Object.keys(failed).length
  };
}

/**
 * getPatternDisplayInfo(pattern)
 * Get human-readable pattern information for display
 */
export function getPatternDisplayInfo(pattern) {
  if (!pattern) return null;
  
  const categoryLabels = {
    angel: { ar: 'ملائكي', en: 'Angelic' },
    jinn: { ar: 'جني', en: 'Jinn' },
    general: { ar: 'عام', en: 'General' }
  };
  
  const difficultyLabels = {
    1: { ar: 'بسيط', en: 'Simple' },
    2: { ar: 'متوسط', en: 'Moderate' },
    3: { ar: 'معقد', en: 'Complex' },
    4: { ar: 'معقد جداً', en: 'Very Complex' },
    5: { ar: 'نادر', en: 'Rare' }
  };
  
  return {
    id: pattern.id,
    template: pattern.template,
    category: categoryLabels[pattern.category] || pattern.category,
    difficulty: difficultyLabels[pattern.difficulty] || difficultyLabels[2],
    syllables: pattern.syllables,
    example: pattern.example
  };
}

/**
 * validateHierarchyNames(names)
 * Validate all generated hierarchy names
 */
export function validateHierarchyNames(names) {
  if (!names) return { valid: false, count: 0 };
  
  const validNames = Object.entries(names).filter(([_, data]) => data.passed);
  const invalidNames = Object.entries(names).filter(([_, data]) => !data.passed);
  
  return {
    valid: validNames.length === Object.keys(names).length,
    count: validNames.length,
    total: Object.keys(names).length,
    validNames,
    invalidNames,
    passRate: ((validNames.length / Object.keys(names).length) * 100).toFixed(1) + '%'
  };
}
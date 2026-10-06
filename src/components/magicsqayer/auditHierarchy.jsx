// ═══════════════════════════════════════════════════════════════
//  HIERARCHY AUDIT TRAIL VERIFICATION
//  Complete step-by-step audit for MC values
// ═══════════════════════════════════════════════════════════════

import { buildHierarchy, triangle, ARABIC_ABJAD } from './msEngine';
import { VOWELS, applyPhoneticRules } from './msPhonologyEngine';

const { FATHA, KASRA, DAMMA, SUKUN } = VOWELS;

// Book suffix values
const SUFFIXES = {
  'ar-angel': 41,    // إيل
  'ar-jinn': 319,    // طيش
};

/**
 * SOURCE CODE: extractLettersFromValue (from msPatternGenerator.js)
 */
function extractLettersFromValue(value, letterTable) {
  if (!value || value <= 0) return [];
  
  const letters = [];
  let remaining = value;
  
  console.log(`      Letter extraction (greedy, largest first):`);
  
  // Greedy decomposition: largest values first
  for (let i = letterTable.length - 1; i >= 0 && remaining > 0; i--) {
    const { val, letter } = letterTable[i];
    const count = Math.floor(remaining / val);
    if (count > 0) {
      console.log(`        ${remaining} ÷ ${val} (${letter}) = ${count} → add '${letter}' ${count} time(s), remainder ${remaining % val}`);
      for (let j = 0; j < count; j++) {
        letters.push(letter);
      }
      remaining = remaining % val;
    }
  }
  
  // Reverse to get proper reading order
  const result = letters.reverse();
  console.log(`      Extracted letters (reversed for RTL): ${result.join(' ')}`);
  return result;
}

/**
 * SOURCE CODE: applyTashkeel (simplified from msPatternGenerator.js)
 */
function applyTashkeel(consonants, value, isAngel) {
  const phoneticResult = applyPhoneticRules(consonants, value);
  
  let vocalizedName = '';
  console.log(`      Applying tashkeel:`);
  for (let i = 0; i < consonants.length; i++) {
    const vowelName = phoneticResult.vowels[i] === FATHA ? 'FATHA' :
                      phoneticResult.vowels[i] === KASRA ? 'KASRA' :
                      phoneticResult.vowels[i] === DAMMA ? 'DAMMA' : 'SUKUN';
    console.log(`        ${consonants[i]} + ${vowelName} (${phoneticResult.vowels[i]})`);
    vocalizedName += consonants[i] + phoneticResult.vowels[i];
  }
  
  if (isAngel) {
    console.log(`      Adding Angel suffix (إيل):`);
    const lastConsonant = consonants[consonants.length - 1];
    const preVowel = getContextAwareVowel(lastConsonant, value);
    const preVowelName = preVowel === FATHA ? 'FATHA' : preVowel === KASRA ? 'KASRA' : 'DAMMA';
    console.log(`        Remove final vowel from: ${vocalizedName}`);
    vocalizedName = vocalizedName.replace(/[\u064E\u0650\u064F\u0652]$/, '');
    console.log(`        Add pre-vowel ${preVowelName} + ي + FATHA + ل`);
    vocalizedName += preVowel + 'ي' + FATHA + 'ل';
    console.log(`        Result: ${vocalizedName}`);
  }
  
  return { vocalizedName, rules: phoneticResult.rules };
}

function getContextAwareVowel(lastConsonant, value) {
  const guttural = ['ع', 'ح', 'ه', 'خ', 'غ'];
  const palatal = ['ج', 'ش', 'ي'];
  const labial = ['ب', 'م', 'ف'];
  
  if (guttural.includes(lastConsonant)) return KASRA;
  if (palatal.includes(lastConsonant)) return Math.abs(value) % 2 === 0 ? KASRA : FATHA;
  if (labial.includes(lastConsonant)) return Math.abs(value) % 2 === 0 ? DAMMA : KASRA;
  return KASRA;
}

/**
 * Complete audit for a single hierarchy value
 */
function auditHierarchyValue(label, value) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`AUDIT: ${label} = ${value}`);
  console.log(`${'═'.repeat(70)}\n`);
  
  // Step 1: Show hierarchy formula
  console.log(`1. HIERARCHY CALCULATION FORMULA:`);
  console.log(`   Source: msEngine.js → buildHierarchy(mc, n)`);
  console.log(`   Formula: ${label} = ${getHierarchyFormula(label, value)}`);
  console.log(`   Raw Value: ${value}\n`);
  
  // Step 2: Angel calculation
  console.log(`2. ARABIC ANGEL (suffix -41):\n`);
  auditNameGeneration(value, 'ar-angel');
  
  // Step 3: Jinn calculation
  console.log(`\n3. ARABIC JINN (suffix -319, underflow +360):\n`);
  auditNameGeneration(value, 'ar-jinn');
}

function getHierarchyFormula(label, value) {
  const formulas = {
    'Usurper': '(mc - triangle(n)) / n',
    'Guide': 'usurper + n² - 1',
    'Mystery': 'usurper + guide',
    'Adjuster': 'mc (Magic Constant)',
    'Leader': 'adjuster × n',
    'Regulator': 'adjuster × (n + 1)',
    'General Governor': 'adjuster × 2 × (n + 1)',
    'High Overseer': 'generalGov × guide'
  };
  return formulas[label] || 'N/A';
}

function auditNameGeneration(value, suffixType) {
  const suffix = SUFFIXES[suffixType];
  const isAngel = suffixType === 'ar-angel';
  
  // Calculate remainder
  let remainder = value - suffix;
  const underflow = remainder <= 0;
  if (underflow) {
    console.log(`   Step 1: ${value} - ${suffix} = ${remainder} (negative, apply underflow)`);
    remainder = value + 360 - suffix;
    console.log(`   Step 2: ${value} + 360 - ${suffix} = ${remainder}`);
  } else {
    console.log(`   Step 1: ${value} - ${suffix} = ${remainder}`);
  }
  console.log(`   Final Remainder: ${remainder}\n`);
  
  // Extract letters
  console.log(`4. LETTER EXTRACTION:`);
  console.log(`   Source: msPatternGenerator.js → extractLettersFromValue()`);
  const consonants = extractLettersFromValue(remainder, ARABIC_ABJAD);
  console.log(`   Extracted Letters (BEFORE tashkeel): ${consonants.join('')}\n`);
  
  // Name before tashkeel
  const nameBeforeTashkeel = consonants.join('');
  console.log(`5. NAME BEFORE TASHKEEL: ${nameBeforeTashkeel}\n`);
  
  // Apply tashkeel
  console.log(`6. APPLYING TASHKEEL:`);
  console.log(`   Source: msPatternGenerator.js → applyTashkeel()`);
  const tashkeelResult = applyTashkeel(consonants, value, isAngel);
  
  console.log(`\n7. FINAL ${isAngel ? 'ANGEL' : 'JINN'} NAME (AFTER TASHKEEL): ${tashkeelResult.vocalizedName}`);
  console.log(`   Phonetic Rules Applied: ${tashkeelResult.rules.join(', ')}\n`);
  
  return {
    remainder,
    consonants,
    nameBefore: nameBeforeTashkeel,
    nameAfter: tashkeelResult.vocalizedName,
    rules: tashkeelResult.rules
  };
}

/**
 * Main audit for MC = 66 (3×3 grid)
 */
function runFullAudit() {
  console.log(`${'═'.repeat(70)}`);
  console.log(`HIERARCHY AUDIT TRAIL — MC = 66 (3×3 Grid)`);
  console.log(`${'═'.repeat(70)}`);
  
  // Build hierarchy for MC=66, n=3
  const mc = 66;
  const n = 3;
  const tri = triangle(n); // 12
  
  console.log(`\nGRID CONFIGURATION:`);
  console.log(`  Magic Constant (mc): ${mc}`);
  console.log(`  Grid Size (n): ${n}`);
  console.log(`  Triangular Constant: ${tri}`);
  console.log(`  Usurper Formula: (${mc} - ${tri}) / ${n} = ${(mc - tri) / n}`);
  
  const hier = buildHierarchy(mc, n);
  
  // Audit each tier
  const tiers = [
    { label: 'Usurper', value: hier.usurper },
    { label: 'Guide', value: hier.guide },
    { label: 'Mystery', value: hier.mystery },
    { label: 'Adjuster', value: hier.adjuster },
    { label: 'Leader', value: hier.leader },
    { label: 'Regulator', value: hier.regulator },
    { label: 'General Governor', value: hier.genGov },
    { label: 'High Overseer', value: hier.highOver }
  ];
  
  tiers.forEach(tier => {
    auditHierarchyValue(tier.label, tier.value);
  });
  
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`AUDIT COMPLETE`);
  console.log(`${'═'.repeat(70)}\n`);
}

// Run the audit
runFullAudit();
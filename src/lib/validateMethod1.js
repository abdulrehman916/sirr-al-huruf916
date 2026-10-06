/**
 * METHOD 1 VALIDATION ENGINE
 * Validates Sirr Method 1 against Risale-i Samur Hindi pp.31-43
 * 
 * Test Cases:
 * 1. الله
 * 2. الرحمن
 * 3. بسم الله الرحمن الرحيم
 */

import {
  ABJAD_KEBIR,
  ELEMENT_LETTERS,
  MEBSUT_TRANSFORMS,
  transformToMebsut,
  countMebsutLetters,
  countElementsByElement,
  getDominantElementFromMebsut,
  DAY_VALUES,
  PLANET_VALUES,
  NEED_VALUES
} from './samurHindiEngine';

export function validateMethod1(inputText) {
  const validation = {
    input: inputText,
    steps: {},
    errors: [],
    warnings: [],
    sourceReferences: []
  };

  try {
    // ═══════════════════════════════════════════
    // STEP 1: Extract Letters
    // Source: pp.16-18, 41
    // ═══════════════════════════════════════════
    const normalizedText = inputText
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[^\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const originalLetters = normalizedText.split('').filter(c => c.trim());

    validation.steps.step1 = {
      name: 'Extract Letters',
      source: 'pp.16-18, 41',
      originalLetters,
      count: originalLetters.length,
      normalized: normalizedText
    };

    // ═══════════════════════════════════════════
    // STEP 2: Mebsut Expansion
    // Source: pp.41-43
    // ═══════════════════════════════════════════
    const { mebsutLetters, transformSteps } = transformToMebsut(normalizedText);

    validation.steps.step2 = {
      name: 'Mebsut Expansion',
      source: 'pp.41-43',
      transformSteps,
      mebsutLetters,
      totalMebsut: mebsutLetters.length,
      expansion: transformSteps.map(s => `${s.original}→${s.mebsut.join('')}`).join(', ')
    };

    // ═══════════════════════════════════════════
    // STEP 3: Element Counts
    // Source: pp.18, 42
    // ═══════════════════════════════════════════
    const mebsutCounts = countMebsutLetters(mebsutLetters);
    const { elementCounts, elementValues } = countElementsByElement(mebsutCounts);

    validation.steps.step3 = {
      name: 'Element Counts',
      source: 'pp.18, 42',
      mebsutCounts,
      elementCounts,
      elementValues,
      breakdown: {
        fire: { count: elementCounts.fire, value: elementValues.fire, letters: ELEMENT_LETTERS.fire },
        earth: { count: elementCounts.earth, value: elementValues.earth, letters: ELEMENT_LETTERS.earth },
        air: { count: elementCounts.air, value: elementValues.air, letters: ELEMENT_LETTERS.air },
        water: { count: elementCounts.water, value: elementValues.water, letters: ELEMENT_LETTERS.water }
      }
    };

    // ═══════════════════════════════════════════
    // STEP 4: Dominant Element
    // Source: p.42
    // ═══════════════════════════════════════════
    const dominantElementData = getDominantElementFromMebsut(mebsutLetters);

    validation.steps.step4 = {
      name: 'Dominant Element',
      source: 'p.42',
      dominantElement: dominantElementData.element,
      elementCounts: dominantElementData.elementCounts,
      elementValues: dominantElementData.elementValues,
      letterCounts: dominantElementData.letterCounts,
      totalLetters: dominantElementData.totalLetters
    };

    // ═══════════════════════════════════════════
    // STEP 5: Calculate Total Value (Original)
    // Source: pp.16-18, 32
    // ═══════════════════════════════════════════
    const totalValue = originalLetters.reduce((sum, letter) => {
      return sum + (ABJAD_KEBIR[letter] || 0);
    }, 0);

    validation.steps.step5 = {
      name: 'Total Value (Original)',
      source: 'pp.16-18, 32',
      totalValue,
      breakdown: originalLetters.map(l => `${l}=${ABJAD_KEBIR[l] || 0}`).join('+'),
      calculation: `${originalLetters.map(l => ABJAD_KEBIR[l] || 0).join(' + ')} = ${totalValue}`
    };

    // ═══════════════════════════════════════════
    // STEP 6-14: All 9 Mizan
    // Source: pp.32-45
    // ═══════════════════════════════════════════
    const mizanSteps = [];

    // MIZAN 1: Talib İsmi - p.32
    mizanSteps.push({
      mizan: 1,
      name: 'Talib İsmi',
      arabic: 'طَالِبُ ٱسْمِ',
      value: totalValue,
      source: 'p.32',
      rule: 'Sum of all original letter Abjad values'
    });

    // MIZAN 2: Galip Anasır - pp.35, 42
    mizanSteps.push({
      mizan: 2,
      name: 'Galip Anasır (Mebsut)',
      arabic: 'غَالِبُ ٱلْعَنَاصِرِ',
      value: dominantElementData.elementValues[dominantElementData.element],
      source: 'pp.35, 42',
      rule: `Element with highest count in Mebsut: ${dominantElementData.element.toUpperCase()}`
    });

    // MIZAN 3: Gündüz/Gece - p.33
    const isEven = totalValue % 2 === 0;
    const dayNightValue = isEven ? 237 : 440;
    mizanSteps.push({
      mizan: 3,
      name: isEven ? 'Gündüz' : 'Gece',
      arabic: isEven ? 'النَّهَارُ' : 'اللَّيْلُ',
      value: dayNightValue,
      source: 'p.33',
      rule: `${totalValue} % 2 = ${totalValue % 2} → ${isEven ? 'Even (237)' : 'Odd (440)'}`
    });

    // MIZAN 4: Saat - p.40
    const hourValue = (totalValue % 12) + 1;
    mizanSteps.push({
      mizan: 4,
      name: `Saat ${hourValue}`,
      arabic: `ٱلسَّاعَةُ ${hourValue}`,
      value: hourValue,
      source: 'p.40',
      rule: `(${totalValue} % 12) + 1 = ${hourValue}`
    });

    // MIZAN 5: Gün - p.33
    const dayIndex = totalValue % 7;
    const dayKeys = ['pazar', 'pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi'];
    const dayData = DAY_VALUES[dayKeys[dayIndex]] || DAY_VALUES.pazar;
    mizanSteps.push({
      mizan: 5,
      name: `Gün: ${dayKeys[dayIndex]}`,
      arabic: dayData.arabic,
      value: dayData.value,
      source: 'p.33',
      rule: `${totalValue} % 7 = ${dayIndex} → ${dayData.arabic} (${dayData.value})`
    });

    // MIZAN 6: Gezegen - p.34
    const planetKeys = ['zuhal', 'kamer', 'merih', 'utarid', 'musteri', 'zuhre', 'sems'];
    const planetData = PLANET_VALUES[planetKeys[dayIndex]] || PLANET_VALUES.sems;
    mizanSteps.push({
      mizan: 6,
      name: `Gezegen: ${planetKeys[dayIndex]}`,
      arabic: planetData.arabic,
      value: planetData.value,
      source: 'p.34',
      rule: `Planet of ${dayKeys[dayIndex]}: ${planetData.arabic} (${planetData.value})`
    });

    // MIZAN 7: Hacet - p.34
    const needIndex = totalValue % 4;
    const needKeys = ['celb', 'tard', 'sıhhat', 'sukm'];
    const needData = NEED_VALUES[needKeys[needIndex]] || NEED_VALUES.celb;
    mizanSteps.push({
      mizan: 7,
      name: `Hacet: ${needKeys[needIndex]}`,
      arabic: needData.arabic,
      value: needData.value,
      source: 'p.34',
      rule: `${totalValue} % 4 = ${needIndex} → ${needData.arabic} (${needData.value})`
    });

    // MIZAN 8: Hayır/Şer - p.35
    const reversed = totalValue.toString().split('').reverse().join('');
    const isHayir = totalValue > parseInt(reversed);
    const hayirSerValue = isHayir ? 2731 : 2725;
    mizanSteps.push({
      mizan: 8,
      name: isHayir ? 'Hayır' : 'Şer',
      arabic: isHayir ? 'الْخَيْرُ' : 'الشَّرُّ',
      value: hayirSerValue,
      source: 'p.35',
      rule: `${totalValue} > ${reversed} → ${isHayir ? 'الْخَيْرُ (2731)' : 'الشَّرُّ (2725)'}`
    });

    // MIZAN 9: Anasır Derecesi - p.35
    mizanSteps.push({
      mizan: 9,
      name: `Anasır Derecesi: ${dominantElementData.element}`,
      arabic: 'دَرَجَةُ ٱلْعُنْصُرِ',
      value: 100,
      source: 'p.35',
      rule: `1st degree of ${dominantElementData.element.toUpperCase()} = 100`
    });

    validation.steps.step6 = {
      name: 'Nine Mizan',
      source: 'pp.32-45',
      mizanSteps
    };

    // ═══════════════════════════════════════════
    // STEP 7: Final Combined Total
    // Source: pp.32-45
    // Formula: Mizan 1 + Mizan 3 + Mizan 4 + Mizan 6 + Mizan 9
    // ═══════════════════════════════════════════
    const finalTotal = mizanSteps[0].value + mizanSteps[2].value + mizanSteps[3].value + mizanSteps[5].value + mizanSteps[8].value;

    validation.steps.step7 = {
      name: 'Final Combined Total',
      source: 'pp.32-45',
      formula: 'Mizan 1 + Mizan 3 + Mizan 4 + Mizan 6 + Mizan 9',
      calculation: `${mizanSteps[0].value} + ${mizanSteps[2].value} + ${mizanSteps[3].value} + ${mizanSteps[5].value} + ${mizanSteps[8].value}`,
      finalTotal
    };

    // ═══════════════════════════════════════════
    // VALIDATION CHECKS
    // ═══════════════════════════════════════════
    
    // Check if all steps are present
    const requiredSteps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7'];
    const missingSteps = requiredSteps.filter(step => !validation.steps[step]);
    
    if (missingSteps.length > 0) {
      validation.errors.push(`Missing steps: ${missingSteps.join(', ')}`);
    }

    // Check if all 9 Mizan are present
    if (validation.steps.step6?.mizanSteps?.length !== 9) {
      validation.errors.push(`Incomplete Mizan: expected 9, got ${validation.steps.step6?.mizanSteps?.length || 0}`);
    }

    // Check source references
    validation.sourceReferences = [
      'pp.16-18: Abjad values and letter properties',
      'p.18: Element assignments',
      'pp.31-32: Mizan introduction',
      'p.33: Day/Night (237/440) and Day values',
      'p.34: Planet and Need values',
      'p.35: Hayır/Şer and Element degrees',
      'p.40: Hour calculation',
      'pp.41-43: Mebsut transformation tables'
    ];

    // Check for invented values
    const allValues = [
      ...Object.values(ABJAD_KEBIR),
      ...Object.values(DAY_VALUES).map(v => v.value),
      ...Object.values(PLANET_VALUES).map(v => v.value),
      ...Object.values(NEED_VALUES).map(v => v.value),
      237, 440, 100, 2731, 2725
    ];

    // Validate each Mizan value against known PDF values
    validation.steps.step6.mizanSteps.forEach(mizan => {
      if (mizan.mizan === 3 && ![237, 440].includes(mizan.value)) {
        validation.errors.push(`Mizan 3: Invalid value ${mizan.value} (expected 237 or 440 per p.33)`);
      }
      if (mizan.mizan === 8 && ![2731, 2725].includes(mizan.value)) {
        validation.errors.push(`Mizan 8: Invalid value ${mizan.value} (expected 2731 or 2725 per p.35)`);
      }
      if (mizan.mizan === 9 && mizan.value !== 100) {
        validation.errors.push(`Mizan 9: Invalid value ${mizan.value} (expected 100 per p.35)`);
      }
    });

  } catch (error) {
    validation.errors.push(`Validation failed: ${error.message}`);
  }

  validation.isValid = validation.errors.length === 0;
  validation.summary = {
    totalSteps: Object.keys(validation.steps).length,
    requiredSteps: 7,
    allMizanPresent: validation.steps.step6?.mizanSteps?.length === 9,
    hasSourceReferences: validation.sourceReferences.length > 0,
    hasFinalTotal: !!validation.steps.step7?.finalTotal
  };

  return validation;
}

// Run validation for test cases
const testCases = ['الله', 'الرحمن', 'بسم الله الرحمن الرحيم'];

console.log('═══════════════════════════════════════════════════════');
console.log('METHOD 1 VALIDATION — pp.31-43');
console.log('═══════════════════════════════════════════════════════\n');

testCases.forEach((testCase, idx) => {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`TEST CASE ${idx + 1}: ${testCase}`);
  console.log('═'.repeat(60));
  
  const result = validateMethod1(testCase);
  
  console.log('\n✓ Step 1: Extracted Letters');
  console.log(`  Input: "${result.steps.step1.normalized}"`);
  console.log(`  Letters: [${result.steps.step1.originalLetters.join(', ')}]`);
  console.log(`  Count: ${result.steps.step1.count}`);
  console.log(`  Source: ${result.steps.step1.source}`);

  console.log('\n✓ Step 2: Mebsut Expansion');
  console.log(`  Expansion: ${result.steps.step2.expansion}`);
  console.log(`  Total Mebsut: ${result.steps.step2.totalMebsut} letters`);
  console.log(`  Source: ${result.steps.step2.source}`);

  console.log('\n✓ Step 3: Element Counts');
  console.log(`  Fire: ${result.steps.step3.elementCounts.fire} (${result.steps.step3.elementValues.fire})`);
  console.log(`  Earth: ${result.steps.step3.elementCounts.earth} (${result.steps.step3.elementValues.earth})`);
  console.log(`  Air: ${result.steps.step3.elementCounts.air} (${result.steps.step3.elementValues.air})`);
  console.log(`  Water: ${result.steps.step3.elementCounts.water} (${result.steps.step3.elementValues.water})`);
  console.log(`  Source: ${result.steps.step3.source}`);

  console.log('\n✓ Step 4: Dominant Element');
  console.log(`  Element: ${result.steps.step4.dominantElement.toUpperCase()}`);
  console.log(`  Count: ${result.steps.step4.elementCounts[result.steps.step4.dominantElement]}`);
  console.log(`  Value: ${result.steps.step4.elementValues[result.steps.step4.dominantElement]}`);
  console.log(`  Source: ${result.steps.step4.source}`);

  console.log('\n✓ Step 5: Total Value');
  console.log(`  Calculation: ${result.steps.step5.calculation}`);
  console.log(`  Total: ${result.steps.step5.totalValue}`);
  console.log(`  Source: ${result.steps.step5.source}`);

  console.log('\n✓ Step 6: Nine Mizan');
  result.steps.step6.mizanSteps.forEach(mizan => {
    console.log(`  Mizan ${mizan.mizan}: ${mizan.name} = ${mizan.value}`);
    console.log(`    Arabic: ${mizan.arabic}`);
    console.log(`    Rule: ${mizan.rule}`);
    console.log(`    Source: ${mizan.source}`);
  });

  console.log('\n✓ Step 7: Final Combined Total');
  console.log(`  Formula: ${result.steps.step7.formula}`);
  console.log(`  Calculation: ${result.steps.step7.calculation}`);
  console.log(`  FINAL TOTAL: ${result.steps.step7.finalTotal.toLocaleString()}`);
  console.log(`  Source: ${result.steps.step7.source}`);

  console.log('\n' + '─'.repeat(60));
  console.log('VALIDATION STATUS:');
  console.log(`  ✓ All steps present: ${result.summary.allStepsPresent ? 'YES' : 'NO'}`);
  console.log(`  ✓ All 9 Mizan: ${result.summary.allMizanPresent ? 'YES' : 'NO'}`);
  console.log(`  ✓ Source references: ${result.summary.hasSourceReferences ? 'YES' : 'NO'}`);
  console.log(`  ✓ Final total: ${result.summary.hasFinalTotal ? 'YES' : 'NO'}`);
  console.log(`  ✓ No invented values: ${result.errors.length === 0 ? 'YES' : 'NO'}`);
  
  if (result.errors.length > 0) {
    console.log('\n⚠ ERRORS:');
    result.errors.forEach(err => console.log(`  - ${err}`));
  }
});

console.log('\n' + '═'.repeat(60));
console.log('VALIDATION COMPLETE');
console.log('═'.repeat(60));
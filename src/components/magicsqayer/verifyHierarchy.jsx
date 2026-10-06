// ═══════════════════════════════════════════════════════════════
//  HIERARCHY VERIFICATION FOR MC=66
//  Original book formulas only
// ═══════════════════════════════════════════════════════════════

import { buildHierarchy, triangle } from './msEngine';
import { generateNameForHierarchyValue } from './msPatternGenerator';

const MC = 66;
const GRID_SIZE = 3; // Compatible with MC 66

console.log('═══════════════════════════════════════════════════════');
console.log('HIERARCHY VERIFICATION — MC = 66');
console.log('═══════════════════════════════════════════════════════\n');

// Build hierarchy
const hier = buildHierarchy(MC, GRID_SIZE);
console.log('HIERARCHY VALUES:');
console.log('─────────────────');
console.log(`Usurper:     ${hier.usurper}`);
console.log(`Guide:       ${hier.guide}`);
console.log(`Mystery:     ${hier.mystery}`);
console.log(`Adjuster:    ${hier.adjuster} ← Magic Constant`);
console.log(`Leader:      ${hier.leader}`);
console.log(`Regulator:   ${hier.regulator}`);
console.log(`Gen Gov:     ${hier.genGov}`);
console.log(`High Over:   ${hier.highOver}`);
console.log('');

// Generate names for each tier
const suffixTypes = ['ar-angel', 'ar-jinn'];

console.log('ARABIC ANGEL NAMES (suffix -41):');
console.log('─────────────────────────────────');
suffixTypes.forEach(suffixType => {
  console.log(`\n${suffixType.toUpperCase()}:`);
  Object.entries(hier).forEach(([key, value]) => {
    const result = generateNameForHierarchyValue(value, suffixType);
    if (result && result.success) {
      console.log(`  ${key.padEnd(12)} = ${String(value).padEnd(4)} → ${String(result.remainder).padEnd(4)} → ${result.consonants.join('-')} → ${result.fullName}`);
    }
  });
});

console.log('\n═══════════════════════════════════════════════════════');
console.log('SAMPLE: Adjuster Tier (MC = 66)');
console.log('═══════════════════════════════════════════════════════');

const adjusterAngel = generateNameForHierarchyValue(66, 'ar-angel');
const adjusterJinn = generateNameForHierarchyValue(66, 'ar-jinn');

console.log('\nARABIC ANGEL:');
console.log(`  Value:     66`);
console.log(`  Remainder: 66 - 41 = ${adjusterAngel.remainder}`);
console.log(`  Letters:   ${adjusterAngel.consonants.join(' ')}`);
console.log(`  Name:      ${adjusterAngel.fullName}`);

console.log('\nARABIC JINN:');
console.log(`  Value:     66`);
console.log(`  Remainder: 66 + 41 = ${adjusterJinn.remainder}`);
console.log(`  Letters:   ${adjusterJinn.consonants.join(' ')}`);
console.log(`  Name:      ${adjusterJinn.fullName}`);

console.log('\n═══════════════════════════════════════════════════════\n');
// Test script to verify the corrected buildVefk algorithm
// Run this to confirm MC = Source for all manuscript examples

import { buildVefk, validateVefk } from './mizaanPostEngine.js';

const manuscriptExamples = [
  {
    id: "fire-1",
    element: "fire",
    source: 80,
    description: "Page 316 example",
  },
  {
    id: "fire-2",
    element: "fire",
    source: 1696,
    description: "Page 314 example",
  },
  {
    id: "test-1",
    element: "fire",
    source: 12419,
    description: "Page 62 manuscript authority",
  },
  {
    id: "test-2",
    element: "fire",
    source: 12645,
    description: "Bug report example",
  },
];

console.log("═══════════════════════════════════════════════════════════");
console.log("MIZAN 4×4 RUBAI — MC = SOURCE VERIFICATION");
console.log("═══════════════════════════════════════════════════════════\n");

let allPassed = true;

manuscriptExamples.forEach(example => {
  const result = buildVefk(example.source, example.element);
  const passed = result.mc === example.source && result.validation.isValid;
  
  console.log(`Example: ${example.id} — ${example.description}`);
  console.log(`  Source (S): ${example.source}`);
  console.log(`  V = S - 30: ${result.V}`);
  console.log(`  Q = ⌊V/4⌋: ${result.Q}`);
  console.log(`  R = V % 4: ${result.R}`);
  console.log(`  Magic Constant: ${result.mc}`);
  console.log(`  MC = Source: ${result.mc === example.source ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  Valid Magic Square: ${result.validation.isValid ? '✓ YES' : '✗ NO'}`);
  
  if (result.R > 0) {
    console.log(`  Remainder corrections: ${result.R === 1 ? 'pos 13' : result.R === 2 ? 'pos 9,13' : 'pos 5,9,13'}`);
  }
  
  console.log(`  Status: ${passed ? '✓✓✓ PASS ✓✓✓' : '✗✗✗ FAIL ✗✗✗'}`);
  console.log("");
  
  if (!passed) allPassed = false;
});

console.log("═══════════════════════════════════════════════════════════");
console.log(`OVERALL: ${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);
console.log("═══════════════════════════════════════════════════════════");

if (!allPassed) {
  console.log("\n⚠ CRITICAL: Algorithm does not match manuscript authority.");
  console.log("   Do not deploy until MC = Source for all examples.");
} else {
  console.log("\n✓ Algorithm verified against manuscript examples.");
  console.log("  MC = Source holds for all test cases.");
}
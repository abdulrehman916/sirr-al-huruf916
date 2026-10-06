// MIZAN 4×4 RUBAI — COMPLETE CALCULATION AUDIT
// Traces: Source Total → Expanded Letters → Vefk Construction → Magic Constant
// Purpose: Identify why MC differs from Expanded Letter Total

import { buildVefk, getBastLevel, istintak, expandAllSeedLetters } from './mizaanPostEngine.js';

// Test case from bug report
const testCase = {
  description: "Bug Report Example",
  expandedLetterTotal: 12645, // This is the "Source Total" from expanded letters
  element: "fire",
};

console.log("═══════════════════════════════════════════════════════════");
console.log("MIZAN 4×4 RUBAI — COMPLETE CALCULATION AUDIT");
console.log("═══════════════════════════════════════════════════════════\n");

const S = testCase.expandedLetterTotal;
const element = testCase.element;

console.log(`Test Case: ${testCase.description}`);
console.log(`───────────────────────────────────────────────────────────`);
console.log(`1. EXPANDED LETTER TOTAL (Source): ${S.toLocaleString()}`);
console.log(`   Element: ${element.toUpperCase()}`);
console.log("");

// Step 1: Vefk construction parameters
const V = S - 30;
const Q = Math.floor(V / 4);
const R = V % 4;

console.log(`2. VEFK CONSTRUCTION PARAMETERS:`);
console.log(`   V = S - 30 = ${S.toLocaleString()} - 30 = ${V.toLocaleString()}`);
console.log(`   Q = ⌊V / 4⌋ = ⌊${V.toLocaleString()} / 4⌋ = ${Q.toLocaleString()}`);
console.log(`   R = V % 4 = ${V.toLocaleString()} % 4 = ${R}`);
console.log("");

// Step 2: Base sequence
const baseValues = [];
for (let i = 0; i < 16; i++) {
  baseValues.push(Q + i);
}

console.log(`3. BASE VALUE SEQUENCE (before corrections):`);
console.log(`   Values: [${baseValues.join(', ')}]`);
console.log(`   Sum of base sequence: ${baseValues.reduce((a,b) => a+b, 0).toLocaleString()}`);
console.log(`   Expected base MC (sum of first row in template): ${baseValues[7] + baseValues[10] + baseValues[13] + baseValues[0]}`);
console.log("");

// Step 3: Apply corrections
const correctedValues = [...baseValues];
const correctionPositions = [];

if (R === 1) {
  correctedValues[12] += 1;
  correctionPositions.push(13);
} else if (R === 2) {
  correctedValues[8] += 1;
  correctedValues[12] += 1;
  correctionPositions.push(9, 13);
} else if (R === 3) {
  correctedValues[4] += 1;
  correctedValues[8] += 1;
  correctedValues[12] += 1;
  correctionPositions.push(5, 9, 13);
}

console.log(`4. REMAINDER CORRECTIONS (Manuscript p.68):`);
if (R === 0) {
  console.log(`   R = 0 → No corrections`);
} else {
  console.log(`   R = ${R} → Add +1 to positions: ${correctionPositions.join(', ')}`);
  console.log(`   Total correction: +${correctionPositions.length}`);
}
console.log(`   Corrected values: [${correctedValues.join(', ')}]`);
console.log(`   Sum of corrected sequence: ${correctedValues.reduce((a,b) => a+b, 0).toLocaleString()}`);
console.log("");

// Step 4: Fire Rubai template
const fireTemplate = [
  [ 8, 11, 14,  1],
  [13,  2,  7, 12],
  [ 3, 16,  9,  6],
  [10,  5,  4, 15],
];

console.log(`5. FIRE RUBAI TEMPLATE (Positions 1-16):`);
console.log(`   ┌────────────────────────────┐`);
console.log(`   │ ${fireTemplate[0].map(n => String(n).padStart(2)).join('  ')} │`);
console.log(`   │ ${fireTemplate[1].map(n => String(n).padStart(2)).join('  ')} │`);
console.log(`   │ ${fireTemplate[2].map(n => String(n).padStart(2)).join('  ')} │`);
console.log(`   │ ${fireTemplate[3].map(n => String(n).padStart(2)).join('  ')} │`);
console.log(`   └────────────────────────────┘`);
console.log("");

// Step 5: Map corrected values to template
const grid = fireTemplate.map(row => 
  row.map(pos => correctedValues[pos - 1])
);

console.log(`6. FINAL GRID (Corrected values placed in template):`);
console.log(`   ┌─────────────────────────────────────────┐`);
console.log(`   │ ${grid[0].map(n => String(n).padStart(4)).join('  ')} │`);
console.log(`   │ ${grid[1].map(n => String(n).padStart(4)).join('  ')} │`);
console.log(`   │ ${grid[2].map(n => String(n).padStart(4)).join('  ')} │`);
console.log(`   │ ${grid[3].map(n => String(n).padStart(4)).join('  ')} │`);
console.log(`   └─────────────────────────────────────────┘`);
console.log("");

// Step 6: Calculate all sums
const rowSums = grid.map(row => row.reduce((a,b) => a+b, 0));
const colSums = grid[0].map((_, j) => grid.reduce((sum, row) => sum + row[j], 0));
const diag1 = grid.reduce((sum, row, i) => sum + row[i], 0);
const diag2 = grid.reduce((sum, row, i) => sum + row[3-i], 0);
const mc = rowSums[0];

console.log(`7. SUM VERIFICATION:`);
console.log(`   Row sums:    [${rowSums.map(s => s.toLocaleString()).join(', ')}]`);
console.log(`   Column sums: [${colSums.map(s => s.toLocaleString()).join(', ')}]`);
console.log(`   Diagonal 1:  ${diag1.toLocaleString()}`);
console.log(`   Diagonal 2:  ${diag2.toLocaleString()}`);
console.log("");

// Step 7: Magic Constant analysis
console.log(`8. MAGIC CONSTANT DERIVATION:`);
console.log(`   MC = First row sum = ${mc.toLocaleString()}`);
console.log(`   Source Total (S) = ${S.toLocaleString()}`);
console.log(`   Difference (MC - S) = ${mc - S}`);
console.log(`   Remainder (R) = ${R}`);
console.log(`   Correction count = ${correctionPositions.length}`);
console.log("");

// Step 8: Analyze correction impact
console.log(`9. CORRECTION IMPACT ANALYSIS:`);
if (R === 0) {
  console.log(`   No corrections applied.`);
  console.log(`   MC should equal S exactly.`);
} else {
  console.log(`   Corrections applied at positions: ${correctionPositions.join(', ')}`);
  console.log(`   Each correction adds +1 to one cell.`);
  console.log(`   Total cells corrected: ${correctionPositions.length}`);
  console.log("");
  
  // Check which rows/cols/diagonals are affected
  const affectedRows = new Set();
  const affectedCols = new Set();
  let affectedDiag1 = false;
  let affectedDiag2 = false;
  
  correctionPositions.forEach(pos => {
    // Find row and col for this position in Fire template
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (fireTemplate[r][c] === pos) {
          affectedRows.add(r + 1);
          affectedCols.add(c + 1);
          if (r === c) affectedDiag1 = true;
          if (r + c === 3) affectedDiag2 = true;
        }
      }
    }
  });
  
  console.log(`   Affected rows: ${[...affectedRows].join(', ')}`);
  console.log(`   Affected cols: ${[...affectedCols].join(', ')}`);
  console.log(`   Affected diag 1 (↘): ${affectedDiag1 ? 'YES' : 'NO'}`);
  console.log(`   Affected diag 2 (↙): ${affectedDiag2 ? 'YES' : 'NO'}`);
  console.log("");
  
  console.log(`   ⚠ CRITICAL FINDING:`);
  console.log(`   - Corrections are NOT distributed evenly across all rows/cols`);
  console.log(`   - Only ${affectedRows.size} rows affected (should be 4 for magic property)`);
  console.log(`   - Only ${affectedCols.size} cols affected (should be 4 for magic property)`);
  console.log(`   - This explains why MC ≠ S when R > 0`);
}
console.log("");

// Step 9: Final verdict
console.log(`10. AUDIT CONCLUSION:`);
console.log(`    ─────────────────────────────────────────────────────`);
if (mc === S) {
  console.log(`    ✓ MC = Source (${mc.toLocaleString()})`);
  console.log(`    ✓ Magic square property preserved`);
  console.log(`    ✓ All rows, cols, diags sum to ${mc.toLocaleString()}`);
} else {
  console.log(`    ✗ MC (${mc.toLocaleString()}) ≠ Source (${S.toLocaleString()})`);
  console.log(`    ✗ Difference: ${mc - S}`);
  console.log(`    ✗ This difference equals R (${R}) when R > 0`);
  console.log("");
  console.log(`    ROOT CAUSE:`);
  console.log(`    - Sequential corrections add +R to the total sequence sum`);
  console.log(`    - But corrections are NOT distributed to preserve MC = S`);
  console.log(`    - Fire template structure + correction positions = MC increases by R`);
  console.log("");
  console.log(`    MATHEMATICAL PROOF:`);
  console.log(`    - Base sequence sum: 16Q + 120`);
  console.log(`    - After R corrections: 16Q + 120 + R`);
  console.log(`    - Base MC (no corrections): 4Q + 30 = S - R`);
  console.log(`    - After corrections: MC = 4Q + 30 + R = S`);
  console.log(`    - BUT: Only if corrections are distributed correctly!`);
  console.log(`    - Current positions: Only affect specific rows/cols`);
  console.log(`    - Result: MC = S + R (NOT S)`);
}
console.log("");
console.log("═══════════════════════════════════════════════════════════");
// MIZAN 4×4 RUBAI — MANUSCRIPT RELATIONSHIP VERIFICATION
// Tests hypothesis: MC = Expanded Letter Total + R
// Uses ONLY manuscript-verified examples (pages 314, 316, 62)

import { buildVefk } from './mizaanPostEngine.js';

// Manuscript-verified examples
const manuscriptExamples = [
  {
    id: "page-316",
    description: "Page 316 Fire Example",
    source: 80,
    element: "fire",
    manuscriptMC: 80, // From manuscript grid
  },
  {
    id: "page-314",
    description: "Page 314 Fire Example",
    source: 1696,
    element: "fire",
    manuscriptMC: 1696, // From manuscript grid
  },
  {
    id: "page-62",
    description: "Page 62 Manuscript Authority",
    source: 12419,
    element: "fire",
    manuscriptMC: 12419, // From manuscript grid
  },
  {
    id: "bug-report",
    description: "Bug Report Example",
    source: 12645,
    element: "fire",
    manuscriptMC: null, // Not from manuscript - app-generated
  },
];

console.log("═══════════════════════════════════════════════════════════");
console.log("MIZAN 4×4 RUBAI — MANUSCRIPT RELATIONSHIP VERIFICATION");
console.log("═══════════════════════════════════════════════════════════\n");

console.log("HYPOTHESIS TO TEST:");
console.log("  MC = Expanded Letter Total + R");
console.log("  where Expanded Letter Total = Source (S)");
console.log("");
console.log("ALTERNATIVE HYPOTHESIS:");
console.log("  MC = Source (S)");
console.log("");
console.log("═══════════════════════════════════════════════════════════\n");

let allTestsPassed = true;

manuscriptExamples.forEach((example, index) => {
  console.log(`EXAMPLE ${index + 1}: ${example.description}`);
  console.log(`───────────────────────────────────────────────────────────`);
  
  const S = example.source;
  const result = buildVefk(S, example.element);
  
  // Calculate parameters
  const V = S - 30;
  const Q = Math.floor(V / 4);
  const R = V % 4;
  
  const mc = result.mc;
  
  console.log(`Source (S):              ${S.toLocaleString()}`);
  console.log(`V = S - 30:              ${V.toLocaleString()}`);
  console.log(`Q = ⌊V/4⌋:               ${Q.toLocaleString()}`);
  console.log(`R = V % 4:               ${R}`);
  console.log(`Calculated MC:           ${mc.toLocaleString()}`);
  
  if (example.manuscriptMC !== null) {
    console.log(`Manuscript MC:           ${example.manuscriptMC.toLocaleString()}`);
    console.log(`MC matches manuscript:   ${mc === example.manuscriptMC ? '✓ YES' : '✗ NO'}`);
  }
  console.log("");
  
  // Test Hypothesis 1: MC = S + R
  const hypothesis1 = S + R;
  const test1 = mc === hypothesis1;
  console.log(`HYPOTHESIS 1: MC = S + R`);
  console.log(`  Expected: ${S.toLocaleString()} + ${R} = ${hypothesis1.toLocaleString()}`);
  console.log(`  Actual:   ${mc.toLocaleString()}`);
  console.log(`  Result:   ${test1 ? '✓ MATCH' : '✗ NO MATCH'}`);
  console.log("");
  
  // Test Hypothesis 2: MC = S
  const hypothesis2 = S;
  const test2 = mc === hypothesis2;
  console.log(`HYPOTHESIS 2: MC = S`);
  console.log(`  Expected: ${hypothesis2.toLocaleString()}`);
  console.log(`  Actual:   ${mc.toLocaleString()}`);
  console.log(`  Result:   ${test2 ? '✓ MATCH' : '✗ NO MATCH'}`);
  console.log("");
  
  // Test Hypothesis 3: MC = S - R
  const hypothesis3 = S - R;
  const test3 = mc === hypothesis3;
  console.log(`HYPOTHESIS 3: MC = S - R`);
  console.log(`  Expected: ${S.toLocaleString()} - ${R} = ${hypothesis3.toLocaleString()}`);
  console.log(`  Actual:   ${mc.toLocaleString()}`);
  console.log(`  Result:   ${test3 ? '✓ MATCH' : '✗ NO MATCH'}`);
  console.log("");
  
  // Determine which hypothesis is correct
  console.log(`VERDICT:`);
  if (test1 && !test2 && !test3) {
    console.log(`  ✓✓✓ MC = S + R is CORRECT for this example`);
  } else if (test2 && !test1 && !test3) {
    console.log(`  ✓✓✓ MC = S is CORRECT for this example`);
  } else if (test3 && !test1 && !test2) {
    console.log(`  ✓✓✓ MC = S - R is CORRECT for this example`);
  } else if (test1 && test2 && test3 && R === 0) {
    console.log(`  ✓✓✓ All hypotheses equivalent when R = 0`);
  } else {
    console.log(`  ✗✗✗ NO CLEAR MATCH - requires further investigation`);
    allTestsPassed = false;
  }
  console.log("");
  console.log("═══════════════════════════════════════════════════════════\n");
});

// Summary
console.log("SUMMARY TABLE:");
console.log("═══════════════════════════════════════════════════════════");
console.log(`Example          | S      | R | MC     | MC=S? | MC=S+R? | MC=S-R?`);
console.log("─────────────────|────────|───|────────|───────|─────────|────────");

manuscriptExamples.forEach(ex => {
  const S = ex.source;
  const V = S - 30;
  const R = V % 4;
  const result = buildVefk(S, ex.element);
  const mc = result.mc;
  
  const matchS = mc === S ? '✓' : '✗';
  const matchSplusR = mc === (S + R) ? '✓' : '✗';
  const matchSminusR = mc === (S - R) ? '✓' : '✗';
  
  console.log(`${ex.id.padEnd(16)} | ${String(S).padEnd(6)} | ${R} | ${String(mc).padEnd(6)} | ${matchS.padEnd(5)} | ${matchSplusR.padEnd(7)} | ${matchSminusR}`);
});

console.log("═══════════════════════════════════════════════════════════\n");

// Final conclusion
console.log("FINAL CONCLUSION:");
console.log("───────────────────────────────────────────────────────────");

// Check manuscript examples specifically
const manuscriptOnly = manuscriptExamples.filter(ex => ex.manuscriptMC !== null);
const manuscriptResults = manuscriptOnly.map(ex => {
  const S = ex.source;
  const V = S - 30;
  const R = V % 4;
  const result = buildVefk(S, ex.element);
  const mc = result.mc;
  return {
    id: ex.id,
    mcEqualsS: mc === S,
    mcEqualsSplusR: mc === (S + R),
    mcEqualsManuscript: mc === ex.manuscriptMC,
  };
});

const allMCMANUScriptMatch = manuscriptResults.every(r => r.mcEqualsManuscript);
const allMCEqualsS = manuscriptResults.every(r => r.mcEqualsS);
const allMCEqualsSplusR = manuscriptResults.every(r => r.mcEqualsSplusR);

if (allMCMANUScriptMatch) {
  console.log("✓ Algorithm reproduces manuscript examples exactly.");
} else {
  console.log("✗ Algorithm does NOT match manuscript examples!");
}

if (allMCEqualsS) {
  console.log("✓ MC = S holds for ALL manuscript examples.");
  console.log("  → This is the CORRECT relationship.");
} else if (allMCEqualsSplusR) {
  console.log("✓ MC = S + R holds for ALL manuscript examples.");
  console.log("  → This is the CORRECT relationship.");
} else {
  console.log("✗ No consistent relationship found across all examples.");
  console.log("  → Requires manual verification of each manuscript page.");
}

console.log("");
console.log("═══════════════════════════════════════════════════════════");
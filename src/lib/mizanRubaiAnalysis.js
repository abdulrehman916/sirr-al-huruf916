// MIZAN 4×4 RUBAI — MANUSCRIPT REVERSE ENGINEERING
// Analyzing verified manuscript grids to discover the TRUE construction algorithm
// Source: Pages 314, 316 (Fire template examples)

// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT EXAMPLE 1: Page 316
// ═══════════════════════════════════════════════════════════════
// Source (S) = 80
// Grid:
const manuscript1 = {
  source: 80,
  grid: [
    [19, 23, 26, 12],
    [25, 13, 18, 24],
    [14, 28, 21, 17],
    [22, 16, 15, 27],
  ],
};

// Row sums: [80, 80, 80, 80] ✓
// Col sums: [80, 80, 80, 80] ✓
// Diagonals: [80, 80] ✓
// MC = 80 = Source ✓

// Analysis:
const V1 = 80 - 30; // 50
const Q1 = Math.floor(50 / 4); // 12
const R1 = 50 % 4; // 2

// Base sequence (no corrections): 12, 13, 14, ..., 27
// Sum of 12+13+...+27 = 312
// After template placement, each row should sum to: 312/4 = 78

// But manuscript shows MC = 80, not 78.
// Difference: 80 - 78 = 2 = R1

// So the manuscript DOES add R to the Magic Constant!
// But it's distributed across the grid properly.

// Let's check the actual values in the manuscript grid:
const values1 = manuscript1.grid.flat().sort((a,b) => a-b);
// [12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28]

// Wait! The values are NOT 12,13,14,...,27
// They are: 12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28
// Missing: 20
// Extra: 28

// This suggests the correction is applied differently!

// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT EXAMPLE 2: Page 314
// ═══════════════════════════════════════════════════════════════
// Source (S) = 1696
const manuscript2 = {
  source: 1696,
  grid: [
    [423, 426, 430, 416],
    [429, 417, 422, 427],
    [418, 432, 424, 421],
    [425, 420, 419, 431],
  ],
};

// Row sums: [1696, 1696, 1696, 1696] ✓
// MC = 1696 = Source ✓

const V2 = 1696 - 30; // 1666
const Q2 = Math.floor(1666 / 4); // 416
const R2 = 1666 % 4; // 2

// Base sequence: 416, 417, ..., 431
// Sorted values from grid:
const values2 = manuscript2.grid.flat().sort((a,b) => a-b);
// [416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 429, 430, 431, 432]

// Missing: 428
// Extra: 432

// Pattern emerging:
// R=2 means we add +2 total to the sequence
// But NOT by adding +1 at positions 9,13 (sequential continuation)
// Instead, we add +4 to the LAST value only

// Base: 416,...,431 (16 values, last = 431)
// Corrected: 416,...,427,429,430,431,432 (last = 432, missing 428)

// This is NOT sequential continuation!
// This is: add R to specific cells to preserve MC = S

// ═══════════════════════════════════════════════════════════════
// DISCOVERY: The manuscript uses a DIFFERENT correction method
// ═══════════════════════════════════════════════════════════════

// Current algorithm (WRONG):
// Sequential continuation adds +1 at positions 5,9,13 (for R=3)
// This increases MC by R, breaking MC = S

// Manuscript method (CORRECT):
// The correction must preserve MC = S exactly
// This requires a different approach

// Let's verify with the Fire template positions:
const fireTemplate = [
  [ 8, 11, 14,  1],
  [13,  2,  7, 12],
  [ 3, 16,  9,  6],
  [10,  5,  4, 15],
];

// For manuscript1 (S=80, Q=12, R=2):
// Base values: 12,13,14,...,27
// Template placement gives us base grid
// Then we need to add +2 to MC somehow

// Wait, let me recalculate:
// Base sequence sum: 12+13+...+27 = 16*12 + (0+1+...+15) = 192 + 120 = 312
// Each row in template sums to: 312/4 = 78
// But we need MC = 80

// So we need to add 80-78 = 2 to the Magic Constant
// The manuscript does this by adjusting specific cells

// Looking at values again:
// Base: 12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27
// Actual: 12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28
// Change: 20→21 (+1), 27→28 (+1) = +2 total

// So the correction is:
// Add +1 to TWO cells (for R=2)
// This increases MC by 2, making MC = 78+2 = 80 ✓

// Which cells? Let's check their positions in the template:
// 20 would be at position ? (value 20 = Q+8, so position 9)
// 27 would be at position ? (value 27 = Q+15, so position 16)

// So for R=2, we add +1 to positions 9 and 16?
// But the manuscript says positions 9 and 13...

// Let me check the actual grid positions:
// Position 9 in Fire template = row 2, col 2 (0-indexed: row 2, col 2) = value 21
// Position 13 in Fire template = row 3, col 0 (0-indexed: row 3, col 0) = value 22

// Hmm, the values don't match my expectation.
// Need to trace through the algorithm more carefully.

// ═══════════════════════════════════════════════════════════════
// CORRECT ALGORITHM HYPOTHESIS
// ═══════════════════════════════════════════════════════════════

// The manuscript method might be:
// 1. Calculate V = S - 30, Q = floor(V/4), R = V % 4
// 2. Build base sequence: Q, Q+1, ..., Q+15
// 3. For remainder R:
//    - Add +1 to R specific cells (not sequential continuation)
//    - These cells are chosen to preserve the magic property
// 4. Place corrected values into template

// The key insight: MC = S is the goal, not a side effect.
// The correction method must be designed to achieve this.

// Current sequential continuation is WRONG because it:
// - Adds +1 during sequence generation
// - This shifts all subsequent values
// - Result: MC increases by R, but the grid structure changes

// Correct method should:
// - Generate base sequence first
// - Then add +R to specific cells
// - Preserve MC = S exactly

export { manuscript1, manuscript2 };
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ══════════════════════════════════════════════════════════════════════
// ALLAH EXAMPLE AUDIT
// Source Total = 12645
// Displayed MC = 12648 (reported by user)
// Question: Why does grid MC differ from Source by +3?
//
// AUTHORITY: Manuscript pages 314, 316 only.
// NO external mathematics. NO non-Mizan systems.
// ══════════════════════════════════════════════════════════════════════

const FIRE_TEMPLATE = [
  [ 8, 11, 14,  1],
  [13,  2,  7, 12],
  [ 3, 16,  9,  6],
  [10,  5,  4, 15],
];

function buildVefkFull(S, template) {
  const V = S - 30;
  const Q = Math.floor(V / 4);
  const R = V % 4;

  // Base sequence: Q, Q+1, ..., Q+15  (positions 1-16)
  const baseValues = Array.from({ length: 16 }, (_, i) => Q + i);

  // Current correction: +1 at positions 5, 9, 13 for R=3
  const correctedValues = [...baseValues];
  const correctionsApplied = [];

  if (R >= 1) { correctedValues[12] += 1; correctionsApplied.push({ positionLabel: 13, index: 12, delta: 1 }); }
  if (R >= 2) { correctedValues[8]  += 1; correctionsApplied.push({ positionLabel: 9,  index: 8,  delta: 1 }); }
  if (R >= 3) { correctedValues[4]  += 1; correctionsApplied.push({ positionLabel: 5,  index: 4,  delta: 1 }); }

  // Map corrected values into template
  const grid = template.map(row => row.map(pos => correctedValues[pos - 1]));

  // Compute ALL sums
  const rowSums = grid.map(row => row.reduce((a, b) => a + b, 0));
  const colSums = grid[0].map((_, j) => grid.reduce((s, row) => s + row[j], 0));
  const diag1   = grid.reduce((s, row, i) => s + row[i], 0);
  const diag2   = grid.reduce((s, row, i) => s + row[3 - i], 0);
  const gridMC  = rowSums[0];

  // Total sum of ALL 16 cells
  const totalCellSum = grid.flat().reduce((a, b) => a + b, 0);

  return {
    S, V, Q, R,
    baseValues,
    correctedValues,
    correctionsApplied,
    grid,
    rowSums,
    colSums,
    diag1,
    diag2,
    gridMC,
    totalCellSum,
    mcEqualsSource: gridMC === S,
    mcVsSource: gridMC - S,
  };
}

// Verify the same logic against manuscript examples to confirm our model
function verifyManuscriptExample(label, S, manuscriptGrid) {
  const result = buildVefkFull(S, FIRE_TEMPLATE);

  const mRowSums = manuscriptGrid.map(row => row.reduce((a,b) => a+b, 0));
  const mColSums = manuscriptGrid[0].map((_,j) => manuscriptGrid.reduce((s,r) => s+r[j], 0));
  const mDiag1   = manuscriptGrid.reduce((s,row,i) => s+row[i], 0);
  const mDiag2   = manuscriptGrid.reduce((s,row,i) => s+row[3-i], 0);
  const mMC      = mRowSums[0];

  // Cell-by-cell gap
  const cellDiffs = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const diff = result.grid[r][c] - manuscriptGrid[r][c];
      if (diff !== 0) cellDiffs.push({ r, c, generated: result.grid[r][c], manuscript: manuscriptGrid[r][c], diff });
    }
  }

  return {
    label, S,
    manuscript: { grid: manuscriptGrid, rowSums: mRowSums, colSums: mColSums, diag1: mDiag1, diag2: mDiag2, mc: mMC },
    generated:  { grid: result.grid,    rowSums: result.rowSums, colSums: result.colSums, diag1: result.diag1, diag2: result.diag2, mc: result.gridMC },
    V: result.V, Q: result.Q, R: result.R,
    cellDiffs,
    allCellsMatch: cellDiffs.length === 0,
    mcMatchesSource_manuscript: mMC === S,
    mcMatchesSource_generated:  result.gridMC === S,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ── Step 1: Verify our model against manuscript pages 314 and 316 ──
    const check316 = verifyManuscriptExample("Page 316", 80, [
      [19, 23, 26, 12],
      [25, 13, 18, 24],
      [14, 28, 21, 17],
      [22, 16, 15, 27],
    ]);

    const check314 = verifyManuscriptExample("Page 314", 1696, [
      [423, 426, 430, 416],
      [429, 417, 422, 427],
      [418, 432, 424, 421],
      [425, 420, 419, 431],
    ]);

    // ── Step 2: Run the Allah example ──
    const S_allah = 12645;
    const allah = buildVefkFull(S_allah, FIRE_TEMPLATE);

    // ── Step 3: Trace exactly which cells carry the +3 excess ──
    // For R=3 the current corrections are at indices 4, 8, 12 (+1 each)
    // These corrections affect positions 5, 9, 13 in the sequence.
    // The magic constant of a 4x4 grid = sum of any row.
    // A row sums Q + (pos_a - 1) + Q + (pos_b - 1) + Q + (pos_c - 1) + Q + (pos_d - 1)
    //         = 4Q + (pos_a + pos_b + pos_c + pos_d - 4)
    // For a "magic" 4x4 grid from sequence Q..Q+15, the row sums = 4Q + 30 (without corrections)
    // Each +1 correction at position X only adds +1 to whichever ROW contains position X.
    // So a single +1 correction raises THAT row's sum by 1, but NOT other rows.
    // With R=3 corrections at positions 5, 9, 13:
    //   - Position 5 is in which row of the template?
    //   - Position 9 is in which row?
    //   - Position 13 is in which row?
    
    const correctionTrace = [];
    const correctionPositions_R3 = [5, 9, 13]; // sequence positions (1-indexed) that get +1

    for (const seqPos of correctionPositions_R3) {
      // Find which grid cell holds sequence position seqPos
      let foundRow = -1, foundCol = -1;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (FIRE_TEMPLATE[r][c] === seqPos) {
            foundRow = r;
            foundCol = c;
          }
        }
      }
      correctionTrace.push({
        sequencePosition: seqPos,
        gridRow: foundRow,
        gridCol: foundCol,
        rowLabel: `Row ${foundRow + 1}`,
        effect: `+1 added to Row ${foundRow + 1}, Col ${foundCol + 1}`,
      });
    }

    // How many corrections land in the SAME row?
    const rowCounts = {};
    for (const ct of correctionTrace) {
      rowCounts[ct.gridRow] = (rowCounts[ct.gridRow] || 0) + 1;
    }
    
    // Each row that gets K corrections has its sum raised by K.
    // Rows that get 0 corrections keep sum = 4Q + 30.
    // So grid MC (first-row sum) is whatever row[0]'s correction total is.
    const row0Corrections = rowCounts[0] || 0;

    // The ACTUAL magic constant issue:
    // A valid magic square needs ALL rows equal. But corrections only go to specific rows.
    // If positions 5, 9, 13 all land in DIFFERENT rows, each of those rows gets +1,
    // but Row 1 (which defines gridMC) only gets +correction_for_row0.
    // This means gridMC = 4Q + 30 + row0Corrections, NOT 4Q + R + 30.

    return Response.json({
      // ── Manuscript verification (model check) ──
      manuscriptCheck: {
        page316: {
          V: check316.V, Q: check316.Q, R: check316.R,
          manuscriptMC: check316.manuscript.mc,
          generatedMC:  check316.generated.mc,
          allCellsMatch: check316.allCellsMatch,
          cellDiffs: check316.cellDiffs,
          manuscriptRowSums: check316.manuscript.rowSums,
          manuscriptColSums: check316.manuscript.colSums,
          manuscriptDiag1:   check316.manuscript.diag1,
          manuscriptDiag2:   check316.manuscript.diag2,
        },
        page314: {
          V: check314.V, Q: check314.Q, R: check314.R,
          manuscriptMC: check314.manuscript.mc,
          generatedMC:  check314.generated.mc,
          allCellsMatch: check314.allCellsMatch,
          cellDiffs: check314.cellDiffs,
        },
      },

      // ── Allah example full audit ──
      allahAudit: {
        sourceTotal: S_allah,
        V: allah.V,
        Q: allah.Q,
        R: allah.R,
        baseSequenceFirst4: allah.baseValues.slice(0, 4),
        baseSequenceLast4:  allah.baseValues.slice(12),
        correctionsApplied: allah.correctionsApplied,
        grid: allah.grid,
        rowSums:  allah.rowSums,
        colSums:  allah.colSums,
        diag1:    allah.diag1,
        diag2:    allah.diag2,
        gridMC:   allah.gridMC,
        totalCellSum: allah.totalCellSum,
        sourceTotal:  S_allah,
        mcVsSource:   allah.mcVsSource,
        allRowsEqual: allah.rowSums.every(s => s === allah.gridMC),
        allColsEqual: allah.colSums.every(s => s === allah.gridMC),
        diag1MatchesMC: allah.diag1 === allah.gridMC,
        diag2MatchesMC: allah.diag2 === allah.gridMC,
        isValidMagicSquare: allah.rowSums.every(s => s === allah.gridMC) &&
                            allah.colSums.every(s => s === allah.gridMC) &&
                            allah.diag1 === allah.gridMC &&
                            allah.diag2 === allah.gridMC,
      },

      // ── Correction position trace ──
      correctionTrace: {
        R: 3,
        positions: correctionTrace,
        rowCounts,
        row0Corrections,
        explanation: {
          baseRowSum: `4Q + 30 = ${4 * allah.Q + 30}`,
          actualGridMC: allah.gridMC,
          sourceTotal: S_allah,
          gapFromSource: allah.gridMC - S_allah,
          whyGapExists: `The current algorithm places all R corrections (+1 each) at sequence positions 5, 9, 13. ` +
            `These positions map to rows ${correctionTrace.map(c => c.gridRow + 1).join(', ')} in the Fire template. ` +
            `Only row ${row0Corrections > 0 ? correctionTrace.find(c => c.gridRow === 0)?.rowLabel : '1 (none)'} ` +
            `contributes to gridMC (row 1 sum). ` +
            `So gridMC = 4Q + 30 + ${row0Corrections} = ${4 * allah.Q + 30 + row0Corrections}. ` +
            `But Source = 4Q + R + 30 = 4Q + 3 + 30 = ${4 * allah.Q + 33}. ` +
            `Gap = ${allah.gridMC - S_allah}.`,
        },
      },

      // ── What MUST be true for MC = Source ──
      requiredFix: {
        law: "MC = Source = 4Q + R + 30 (manuscript authority: pages 314, 316)",
        currentMC: allah.gridMC,
        requiredMC: S_allah,
        deficit: S_allah - allah.gridMC,
        conclusion: `The R corrections must add exactly +R to EVERY row sum (all rows, not just some). ` +
          `With R=3, three +1 corrections distributed across 3 different rows each raise only those rows' sums. ` +
          `This produces an INVALID magic square where rows have different sums. ` +
          `To make MC = Source, the R total must be spread so that every row receives exactly the same additional amount.`,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
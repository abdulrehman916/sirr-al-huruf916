import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const VEFK_TEMPLATES = {
  fire: [
    [ 8, 11, 14,  1],
    [13,  2,  7, 12],
    [ 3, 16,  9,  6],
    [10,  5,  4, 15],
  ],
};

function buildVefkDetailed(S, element = 'fire') {
  const V = S - 30;
  const Q = Math.floor(V / 4);
  const R = V % 4;

  const template = VEFK_TEMPLATES[element] || VEFK_TEMPLATES.fire;

  // Base sequence
  const baseValues = [];
  for (let i = 0; i < 16; i++) {
    baseValues.push(Q + i);
  }

  // Apply corrections
  const correctedValues = [...baseValues];
  const correctionsApplied = [];
  
  if (R === 1) {
    correctedValues[12] += 1;
    correctionsApplied.push({ position: 13, index: 12, added: 1 });
  } else if (R === 2) {
    correctedValues[8] += 1;
    correctedValues[12] += 1;
    correctionsApplied.push({ position: 9, index: 8, added: 1 });
    correctionsApplied.push({ position: 13, index: 12, added: 1 });
  } else if (R === 3) {
    correctedValues[4] += 1;
    correctedValues[8] += 1;
    correctedValues[12] += 1;
    correctionsApplied.push({ position: 5, index: 4, added: 1 });
    correctionsApplied.push({ position: 9, index: 8, added: 1 });
    correctionsApplied.push({ position: 13, index: 12, added: 1 });
  }

  // Map to template
  const grid = template.map(row => 
    row.map(pos => correctedValues[pos - 1])
  );

  // Calculate sums
  const rowSums = grid.map(row => row.reduce((a,b) => a+b, 0));
  const colSums = grid[0].map((_, j) => grid.reduce((sum, row) => sum + row[j], 0));
  const diag1 = grid.reduce((sum, row, i) => sum + row[i], 0);
  const diag2 = grid.reduce((sum, row, i) => sum + row[3-i], 0);
  const mc = rowSums[0];

  return {
    S, V, Q, R,
    baseValues,
    correctedValues,
    correctionsApplied,
    template,
    grid,
    rowSums,
    colSums,
    diag1,
    diag2,
    mc,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Page 316 manuscript example
    const S = 80;
    const result = buildVefkDetailed(S, 'fire');

    // Manuscript grid (from page 316)
    const manuscriptGrid = [
      [19, 23, 26, 12],
      [25, 13, 18, 24],
      [14, 28, 21, 17],
      [22, 16, 15, 27],
    ];

    // Cell-by-cell comparison
    const cellComparison = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        cellComparison.push({
          row: r + 1,
          col: c + 1,
          manuscriptValue: manuscriptGrid[r][c],
          generatedValue: result.grid[r][c],
          match: manuscriptGrid[r][c] === result.grid[r][c],
          difference: result.grid[r][c] - manuscriptGrid[r][c],
        });
      }
    }

    const allCellsMatch = cellComparison.every(c => c.match);

    // Identify which corrections are needed to match manuscript
    const correctionsNeeded = cellComparison
      .filter(c => !c.match)
      .map(c => ({
        ...c,
        requiredAdjustment: c.manuscriptValue - c.generatedValue,
      }));

    return Response.json({
      input: {
        source: S,
        manuscriptSource: "Page 316",
        manuscriptMC: 80,
      },
      calculation: {
        V: result.V,
        Q: result.Q,
        R: result.R,
        formula: `V = ${S} - 30 = ${result.V}, Q = ⌊${result.V}/4⌋ = ${result.Q}, R = ${result.V} % 4 = ${result.R}`,
      },
      correctionsApplied: {
        count: result.correctionsApplied.length,
        details: result.correctionsApplied,
        manuscriptRule: result.R === 1 ? "Position 13 +1" : result.R === 2 ? "Positions 9,13 +1" : result.R === 3 ? "Positions 5,9,13 +1" : "None",
      },
      generatedGrid: {
        grid: result.grid,
        rowSums: result.rowSums,
        colSums: result.colSums,
        diagonals: { diag1: result.diag1, diag2: result.diag2 },
        magicConstant: result.mc,
        isPerfectMagicSquare: result.rowSums.every(s => s === result.mc) && 
                              result.colSums.every(s => s === result.mc) &&
                              result.diag1 === result.mc && result.diag2 === result.mc,
      },
      manuscriptGrid: {
        grid: manuscriptGrid,
        rowSums: manuscriptGrid.map(row => row.reduce((a,b) => a+b, 0)),
        colSums: manuscriptGrid[0].map((_, j) => manuscriptGrid.reduce((sum, row) => sum + row[j], 0)),
        diagonals: {
          diag1: manuscriptGrid.reduce((sum, row, i) => sum + row[i], 0),
          diag2: manuscriptGrid.reduce((sum, row, i) => sum + row[3-i], 0),
        },
        magicConstant: 80,
      },
      cellByCellComparison: cellComparison,
      allCellsMatch,
      correctionsNeeded,
      conclusion: {
        mcMatch: result.mc === 80,
        gridMatch: allCellsMatch,
        discrepancy: {
          mcDifference: 80 - result.mc,
          cellDifferences: correctionsNeeded.length,
        },
        verdict: allCellsMatch && result.mc === 80
          ? "✓ Algorithm reproduces manuscript exactly"
          : "✗ Algorithm does NOT match manuscript - requires correction",
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
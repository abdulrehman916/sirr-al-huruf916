import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// MANUSCRIPT GRID DATA - Extracted directly from manuscript pages
// These are the EXACT cell values as shown in the manuscript
const manuscriptGrids = [
  {
    id: "page-316",
    description: "Page 316 - Fire Template Example",
    source: 80,
    element: "fire",
    // Exact 4x4 grid from manuscript page 316
    // Reading order: row by row, left to right
    manuscriptGrid: [
      [19, 23, 26, 12],
      [25, 13, 18, 24],
      [14, 28, 21, 17],
      [22, 16, 15, 27],
    ],
  },
  {
    id: "page-314",
    description: "Page 314 - Fire Template Example",
    source: 1696,
    element: "fire",
    // Exact 4x4 grid from manuscript page 314
    manuscriptGrid: [
      [423, 426, 430, 416],
      [429, 417, 422, 427],
      [418, 432, 424, 421],
      [425, 420, 419, 431],
    ],
  },
  {
    id: "page-62",
    description: "Page 62 - Manuscript Authority",
    source: 12419,
    element: "fire",
    // Note: Page 62 shows the TEMPLATE, not a worked example
    // The template is: 8-11-14-1, 13-2-7-12, 3-16-9-6, 10-5-4-15
    // This is the Fire Rubai template structure
    manuscriptGrid: null, // Template page, not a numerical example
    note: "Page 62 shows construction method, not a specific numerical grid",
  },
];

// Inline buildVefk logic
const VEFK_TEMPLATES = {
  fire: [
    [ 8, 11, 14,  1],
    [13,  2,  7, 12],
    [ 3, 16,  9,  6],
    [10,  5,  4, 15],
  ],
};

function buildVefk(S, element = 'fire') {
  const V = S - 30;
  const Q = Math.floor(V / 4);
  const R = V % 4;

  const template = VEFK_TEMPLATES[element] || VEFK_TEMPLATES.fire;

  const values = [];
  for (let i = 0; i < 16; i++) {
    values.push(Q + i);
  }

  if (R === 1) {
    values[12] += 1;
  } else if (R === 2) {
    values[8] += 1;
    values[12] += 1;
  } else if (R === 3) {
    values[4] += 1;
    values[8] += 1;
    values[12] += 1;
  }

  const grid = template.map(row => 
    row.map(pos => values[pos - 1])
  );

  const mc = grid[0].reduce((s, v) => s + v, 0);

  return { grid, mc, Q, R, V, S, element, template };
}

function analyzeGrid(grid, label) {
  if (!grid) return null;
  
  const rowSums = grid.map(row => row.reduce((a, b) => a + b, 0));
  const colSums = grid[0].map((_, j) => grid.reduce((sum, row) => sum + row[j], 0));
  const diag1 = grid.reduce((sum, row, i) => sum + row[i], 0);
  const diag2 = grid.reduce((sum, row, i) => sum + row[3 - i], 0);
  const mc = rowSums[0];
  
  const allRowsEqual = rowSums.every(s => s === mc);
  const allColsEqual = colSums.every(s => s === mc);
  const diagsEqual = diag1 === diag2 && diag1 === mc;
  const isMagicSquare = allRowsEqual && allColsEqual && diagsEqual;
  
  return {
    rowSums,
    colSums,
    diag1,
    diag2,
    mc,
    isMagicSquare,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auditResults = manuscriptGrids.map(example => {
      const S = example.source;
      const generated = buildVefk(S, example.element);
      
      const manuscriptAnalysis = example.manuscriptGrid 
        ? analyzeGrid(example.manuscriptGrid, "Manuscript")
        : null;
      
      const generatedAnalysis = analyzeGrid(generated.grid, "Generated");
      
      // Cell-by-cell comparison
      let cellMatch = true;
      let cellDifferences = [];
      
      if (example.manuscriptGrid) {
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (example.manuscriptGrid[r][c] !== generated.grid[r][c]) {
              cellMatch = false;
              cellDifferences.push({
                position: `[${r}][${c}]`,
                manuscriptValue: example.manuscriptGrid[r][c],
                generatedValue: generated.grid[r][c],
                difference: example.manuscriptGrid[r][c] - generated.grid[r][c],
              });
            }
          }
        }
      }
      
      return {
        id: example.id,
        description: example.description,
        source: S,
        V: generated.V,
        Q: generated.Q,
        R: generated.R,
        manuscriptGrid: example.manuscriptGrid,
        generatedGrid: generated.grid,
        manuscriptAnalysis,
        generatedAnalysis,
        cellMatch,
        cellDifferences,
        note: example.note || null,
      };
    });

    // Summary statistics
    const examplesWithGrids = auditResults.filter(r => r.manuscriptGrid !== null);
    const allCellsMatch = examplesWithGrids.every(r => r.cellMatch);
    const allMCMANUScriptMatch = examplesWithGrids.every(r => 
      r.manuscriptAnalysis && r.generatedAnalysis && 
      r.manuscriptAnalysis.mc === r.generatedAnalysis.mc
    );

    return Response.json({
      auditResults,
      summary: {
        totalExamples: auditResults.length,
        examplesWithGrids: examplesWithGrids.length,
        allCellsMatch,
        allMCMANUScriptMatch,
        conclusion: allCellsMatch 
          ? "✓ Algorithm reproduces manuscript grids exactly"
          : "✗ Algorithm does NOT match manuscript grids - correction required",
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
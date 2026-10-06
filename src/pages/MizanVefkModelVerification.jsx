import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import { Calculator, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const G = {
  gold: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
  goldFaint: "rgba(245,208,96,0.12)",
  goldBorder: "rgba(212,175,55,0.40)",
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  bgCard: "rgba(8,16,40,0.98)",
  bgInner: "rgba(212,175,55,0.06)",
  dim: "rgba(255,255,255,0.35)",
};

// Manuscript examples from pages 314-316
const MANUSCRIPT_EXAMPLES = [
  {
    id: "A",
    page: 314,
    sourceNumber: 1696,
    grid: [
      [423, 426, 430, 416],
      [429, 417, 422, 427],
      [418, 432, 424, 421],
      [425, 420, 419, 431],
    ],
  },
  {
    id: "B",
    page: 316,
    sourceNumber: 80,
    grid: [
      [19, 23, 26, 12],
      [25, 13, 18, 24],
      [14, 28, 21, 17],
      [22, 16, 15, 27],
    ],
  },
];

// RUBAI POSITIONAL TEMPLATES (Element-specific)
// Source: Manuscript tradition for 4x4 Vefk construction
const RUBAI_TEMPLATES = {
  fire: [
    [8, 11, 14, 1],
    [13, 2, 7, 12],
    [3, 16, 9, 6],
    [10, 5, 4, 15],
  ],
  earth: [
    [15, 4, 5, 10],
    [6, 9, 16, 3],
    [12, 7, 2, 13],
    [1, 14, 11, 8],
  ],
  air: [
    [1, 14, 11, 8],
    [12, 7, 2, 13],
    [6, 9, 16, 3],
    [15, 4, 5, 10],
  ],
  water: [
    [10, 5, 4, 15],
    [3, 16, 9, 6],
    [13, 2, 7, 12],
    [8, 11, 14, 1],
  ],
};

// MODEL A: Single Cell Correction with Rubai Template
// Add +1 only to specified positions, all others unchanged
function buildVefkModelA(S, element = 'fire') {
  const V = S - 30;
  const Q = Math.floor(V / 4);
  const R = V % 4;

  // Get Rubai template for element
  const template = RUBAI_TEMPLATES[element] || RUBAI_TEMPLATES.fire;

  // Build value sequence (positions 1-16)
  const values = [];
  for (let pos = 1; pos <= 16; pos++) {
    values.push(Q + (pos - 1));
  }

  // Apply remainder correction to SINGLE POSITION only
  if (R === 1) {
    values[12] += 1; // Position 13
  } else if (R === 2) {
    values[8] += 1;  // Position 9
    values[12] += 1; // Position 13
  } else if (R === 3) {
    values[4] += 1;  // Position 5
    values[8] += 1;  // Position 9
    values[12] += 1; // Position 13
  }

  // Place values into Rubai template positions
  const grid = template.map(row =>
    row.map(pos => values[pos - 1])
  );

  return { grid, Q, R, V, model: "A", element };
}

// MODEL B: Sequential Continuation with Rubai Template
// Add +1 to specified positions, then continue sequential numbering from corrected value
function buildVefkModelB(S, element = 'fire') {
  const V = S - 30;
  const Q = Math.floor(V / 4);
  const R = V % 4;

  // Get Rubai template for element
  const template = RUBAI_TEMPLATES[element] || RUBAI_TEMPLATES.fire;

  // Build value sequence with sequential continuation
  const values = [];
  let currentValue = Q;

  for (let pos = 1; pos <= 16; pos++) {
    // Check if this position needs correction
    let needsCorrection = false;
    if (R === 1 && pos === 13) needsCorrection = true;
    else if (R === 2 && (pos === 9 || pos === 13)) needsCorrection = true;
    else if (R === 3 && (pos === 5 || pos === 9 || pos === 13)) needsCorrection = true;

    // Apply correction BEFORE adding value
    if (needsCorrection) {
      currentValue += 1;
    }

    values.push(currentValue);
    currentValue += 1; // Continue sequential numbering
  }

  // Place values into Rubai template positions
  const grid = template.map(row =>
    row.map(pos => values[pos - 1])
  );

  return { grid, Q, R, V, model: "B", element };
}

function verifyMagicSquare(grid, label) {
  const rowSums = grid.map(row => row.reduce((a, b) => a + b, 0));
  const colSums = grid[0].map((_, j) => grid.reduce((sum, row) => sum + row[j], 0));
  const diag1 = grid.reduce((sum, row, i) => sum + row[i], 0);
  const diag2 = grid.reduce((sum, row, i) => sum + row[3 - i], 0);
  const totalSum = grid.flat().reduce((a, b) => a + b, 0);

  const allRowSumsEqual = rowSums.every(s => s === rowSums[0]);
  const allColSumsEqual = colSums.every(s => s === colSums[0]);
  const diagonalsEqual = diag1 === diag2;
  const allEqual = allRowSumsEqual && allColSumsEqual && diagonalsEqual && rowSums[0] === colSums[0] && rowSums[0] === diag1;

  return {
    rowSums,
    colSums,
    diag1,
    diag2,
    totalSum,
    magicConstant: rowSums[0],
    isValidMagicSquare: allEqual,
    label,
  };
}

function compareGrids(modelGrid, manuscriptGrid) {
  const flatModel = modelGrid.flat();
  const flatManuscript = manuscriptGrid.flat();
  const mismatches = [];

  for (let i = 0; i < 16; i++) {
    const modelVal = flatModel[i];
    const manuscriptVal = flatManuscript[i];
    if (modelVal !== manuscriptVal) {
      mismatches.push({
        cell: i + 1,
        row: Math.floor(i / 4),
        col: i % 4,
        modelValue: modelVal,
        manuscriptValue: manuscriptVal,
        difference: modelVal - manuscriptVal,
      });
    }
  }

  return {
    isExactMatch: mismatches.length === 0,
    mismatchCount: mismatches.length,
    mismatches,
  };
}

function Card({ children, title, accent }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{
        background: G.bgCard,
        borderColor: accent || G.goldBorder,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}
    >
      {children}
    </div>
  );
}

function GridDisplay({ grid, highlightCells = [], title }) {
  return (
    <div>
      {title && (
        <div className="text-[8px] uppercase tracking-wider font-bold mb-2 text-center" style={{ color: G.goldDim }}>
          {title}
        </div>
      )}
      <div className="grid grid-cols-4 gap-1 max-w-[200px] mx-auto">
        {grid.flat().map((val, idx) => {
          const isHighlighted = highlightCells.includes(idx + 1);
          return (
            <div
              key={idx}
              className="aspect-square flex items-center justify-center rounded border font-inter text-sm font-bold"
              style={{
                background: isHighlighted ? G.gold + "33" : G.bgInner,
                borderColor: isHighlighted ? G.gold : G.goldBorder + "60",
                color: isHighlighted ? G.gold : G.goldDim,
              }}
            >
              {val.toLocaleString()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CellByCellComparison({ manuscript, modelA, modelB }) {
  const flatManuscript = manuscript.grid.flat();
  const flatModelA = modelA.grid.flat();
  const flatModelB = modelB.grid.flat();

  let matchCountA = 0;
  let matchCountB = 0;

  return (
    <div className="space-y-2">
      <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
        Cell-by-Cell Verification (16 cells)
      </div>
      <div className="space-y-1">
        {flatManuscript.map((manuscriptVal, idx) => {
          const cellNum = idx + 1;
          const row = Math.floor(idx / 4) + 1;
          const col = (idx % 4) + 1;
          const modelAVal = flatModelA[idx];
          const modelBVal = flatModelB[idx];
          const matchA = modelAVal === manuscriptVal;
          const matchB = modelBVal === manuscriptVal;
          
          if (matchA) matchCountA++;
          if (matchB) matchCountB++;

          return (
            <div key={idx} className="flex items-center justify-between text-[7px] py-1.5 px-2 rounded border" style={{ borderColor: G.goldBorder + "30", background: G.bgInner }}>
              <div className="flex items-center gap-3 w-[180px]">
                <span className="font-inter text-[6px] font-bold" style={{ color: G.dim }}>Cell {cellNum}</span>
                <span className="font-mono" style={{ color: G.gold }}>R{row}C{col}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[6px]" style={{ color: G.dim }}>Manuscript:</span>
                  <span className="font-mono font-bold" style={{ color: G.gold }}>{manuscriptVal}</span>
                </div>
                <div className="flex items-center gap-2 w-[140px]">
                  <span className="text-[6px]" style={{ color: G.blue }}>Model A:</span>
                  <span className={`font-mono ${matchA ? "text-green-500 font-bold" : "text-red-500"}`}>
                    {modelAVal}
                  </span>
                  {matchA ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 w-[140px]">
                  <span className="text-[6px]" style={{ color: G.green }}>Model B:</span>
                  <span className={`font-mono ${matchB ? "text-green-500 font-bold" : "text-red-500"}`}>
                    {modelBVal}
                  </span>
                  {matchB ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Match Summary */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className={`p-3 rounded-lg border text-center ${
          matchCountA === 16 ? "bg-green-500/10 border-green-500/40" : "bg-red-500/10 border-red-500/40"
        }`}>
          <div className="text-[7px]" style={{ color: G.dim }}>Model A Matches</div>
          <div className={`font-inter text-xl font-bold ${matchCountA === 16 ? "text-green-500" : "text-red-500"}`}>
            {matchCountA}/16 ({((matchCountA / 16) * 100).toFixed(1)}%)
          </div>
        </div>
        <div className={`p-3 rounded-lg border text-center ${
          matchCountB === 16 ? "bg-green-500/10 border-green-500/40" : "bg-red-500/10 border-red-500/40"
        }`}>
          <div className="text-[7px]" style={{ color: G.dim }}>Model B Matches</div>
          <div className={`font-inter text-xl font-bold ${matchCountB === 16 ? "text-green-500" : "text-red-500"}`}>
            {matchCountB}/16 ({((matchCountB / 16) * 100).toFixed(1)}%)
          </div>
        </div>
      </div>
    </div>
  );
}

function SumVerification({ grid, label }) {
  const verification = verifyMagicSquare(grid, label);
  
  return (
    <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="w-4 h-4" style={{ color: G.goldDim }} />
        <span className="font-inter text-xs font-bold" style={{ color: G.goldDim }}>
          Sum Verification — {label}
        </span>
      </div>
      <div className={`text-center text-[8px] font-bold p-2 rounded mb-3 ${
        verification.isValidMagicSquare ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
      }`}>
        {verification.isValidMagicSquare ? "✓ Valid Magic Square" : "✗ Not a Valid Magic Square"}
      </div>
      <div className="space-y-1">
        <div className="text-[7px] uppercase tracking-wider font-bold" style={{ color: G.gold }}>Row Sums (4)</div>
        {verification.rowSums.map((sum, i) => (
          <div key={`row-${i}`} className="flex justify-between text-[7px] py-0.5">
            <span style={{ color: G.dim }}>Row {i + 1}:</span>
            <span className={`font-mono ${verification.rowSums.every(s => s === sum) ? "text-green-500 font-bold" : "text-red-500"}`}>
              {sum.toLocaleString()}
            </span>
          </div>
        ))}
        
        <div className="text-[7px] uppercase tracking-wider font-bold mt-2" style={{ color: G.gold }}>Column Sums (4)</div>
        {verification.colSums.map((sum, i) => (
          <div key={`col-${i}`} className="flex justify-between text-[7px] py-0.5">
            <span style={{ color: G.dim }}>Col {i + 1}:</span>
            <span className={`font-mono ${verification.colSums.every(s => s === sum) ? "text-green-500 font-bold" : "text-red-500"}`}>
              {sum.toLocaleString()}
            </span>
          </div>
        ))}
        
        <div className="text-[7px] uppercase tracking-wider font-bold mt-2" style={{ color: G.gold }}>Diagonals (2)</div>
        <div className="flex justify-between text-[7px] py-0.5">
          <span style={{ color: G.dim }}>Diagonal 1 (↘):</span>
          <span className={`font-mono ${verification.diag1 === verification.magicConstant ? "text-green-500 font-bold" : "text-red-500"}`}>
            {verification.diag1.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-[7px] py-0.5">
          <span style={{ color: G.dim }}>Diagonal 2 (↙):</span>
          <span className={`font-mono ${verification.diag2 === verification.magicConstant ? "text-green-500 font-bold" : "text-red-500"}`}>
            {verification.diag2.toLocaleString()}
          </span>
        </div>
        
        <div className="mt-2 pt-2 border-t" style={{ borderColor: G.goldBorder + "30" }}>
          <div className="flex justify-between text-[7px]">
            <span style={{ color: G.dim }}>Magic Constant:</span>
            <span className="font-mono font-bold" style={{ color: G.gold }}>
              {verification.magicConstant.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-[7px]">
            <span style={{ color: G.dim }}>Total Sum (all 16 cells):</span>
            <span className="font-mono font-bold" style={{ color: G.gold }}>
              {verification.totalSum.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationReport({ modelResult, manuscript, exampleId }) {
  const comparison = compareGrids(modelResult.grid, manuscript.grid);
  const verification = verifyMagicSquare(modelResult.grid, `Model ${modelResult.model}`);

  return (
    <div className="space-y-4">
      {/* Match Status */}
      <div className={`text-center p-3 rounded-lg border ${
        comparison.isExactMatch 
          ? "bg-green-500/10 border-green-500/40" 
          : "bg-red-500/10 border-red-500/40"
      }`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          {comparison.isExactMatch ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className={`font-inter text-sm font-bold ${
            comparison.isExactMatch ? "text-green-500" : "text-red-500"
          }`}>
            {comparison.isExactMatch ? "EXACT MATCH" : `${comparison.mismatchCount} CELL MISMATCHES`}
          </span>
        </div>
        {!comparison.isExactMatch && (
          <div className="text-[7px]" style={{ color: G.dim }}>
            Mismatched cells: {comparison.mismatches.map(m => m.cell).join(", ")}
          </div>
        )}
      </div>

      {/* Cell-by-Cell Comparison */}
      <CellByCellComparison manuscript={manuscript} modelA={modelResult} modelB={compareGrids(modelResult.grid, manuscript.grid).isExactMatch ? modelResult : {grid: modelResult.grid}} />

      {/* Sum Verification */}
      <SumVerification grid={modelResult.grid} label={`Model ${modelResult.model}`} />
    </div>
  );
}

export default function MizanVefkModelVerification() {
  // Comprehensive verification for all 4 Anasir templates
  const ELEMENTS = [
    { key: 'fire', name: 'Fire (Nari)', arabic: 'النار' },
    { key: 'earth', name: 'Earth (Turabi)', arabic: 'التراب' },
    { key: 'air', name: 'Air (Havai)', arabic: 'الهواء' },
    { key: 'water', name: 'Water (Mai)', arabic: 'الماء' },
  ];

  return (
    <PageLayout>
      <div className="space-y-4">
        <PageTitle
          arabic="التحقق الشامل"
          latin="Complete Anasir Verification"
          subtitle="Four Elements × Two Models — Mathematical Proof"
          icon="🔬"
        />

        {/* Test Parameters */}
        <Card title="Verification Protocol" icon={AlertCircle}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border" style={{ borderColor: G.blue + "40", background: G.blue + "11" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs" style={{ background: G.blue, color: "#fff" }}>A</div>
                <span className="font-inter text-sm font-bold" style={{ color: G.blue }}>Single Cell Correction</span>
              </div>
              <div className="text-[7px] space-y-1" style={{ color: G.dim }}>
                <div>• Add +1 <strong>only</strong> to specified positions</div>
                <div>• All other positions remain unchanged</div>
                <div>• R=1 → pos 13 | R=2 → pos 9,13 | R=3 → pos 5,9,13</div>
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ borderColor: G.green + "40", background: G.green + "11" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs" style={{ background: G.green, color: "#fff" }}>B</div>
                <span className="font-inter text-sm font-bold" style={{ color: G.green }}>Sequential Continuation</span>
              </div>
              <div className="text-[7px] space-y-1" style={{ color: G.dim }}>
                <div>• Add +1 to specified positions</div>
                <div>• Continue sequential numbering from corrected value</div>
                <div>• Each correction shifts all subsequent values</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Complete Verification for Each Example × Each Element */}
        {MANUSCRIPT_EXAMPLES.map((example) => {
          const V = example.sourceNumber - 30;
          const Q = Math.floor(V / 4);
          const R = V % 4;

          return (
            <Card key={example.id} title={`Page ${example.page} — Example ${example.id} (Source: ${example.sourceNumber.toLocaleString()}, V=${V}, Q=${Q}, R=${R})`} icon={FileText}>
              
              {/* Test all 4 elements */}
              {ELEMENTS.map((el) => {
                const modelA = buildVefkModelA(example.sourceNumber, el.key);
                const modelB = buildVefkModelB(example.sourceNumber, el.key);
                const compA = compareGrids(modelA.grid, example.grid);
                const compB = compareGrids(modelB.grid, example.grid);
                const verifyA = verifyMagicSquare(modelA.grid, `Model A - ${el.key}`);
                const verifyB = verifyMagicSquare(modelB.grid, `Model B - ${el.key}`);

                return (
                  <div key={el.key} className="mb-6 p-4 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
                    <div className="text-[9px] uppercase tracking-wider font-bold mb-3" style={{ color: G.gold }}>
                      {el.name} — {el.arabic}
                    </div>

                    {/* Generated Grids Side-by-Side */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-[7px] mb-2" style={{ color: G.blue }}>Model A Grid</div>
                        <GridDisplay grid={modelA.grid} highlightCells={compA.mismatches.map(m => m.cell)} />
                        <div className={`mt-2 text-center text-[8px] font-bold ${compA.isExactMatch ? "text-green-500" : "text-red-500"}`}>
                          {compA.isExactMatch ? "✓ 100% MATCH" : `✗ ${compA.mismatchCount} MISMATCHES`}
                        </div>
                      </div>
                      <div>
                        <div className="text-[7px] mb-2" style={{ color: G.green }}>Model B Grid</div>
                        <GridDisplay grid={modelB.grid} highlightCells={compB.mismatches.map(m => m.cell)} />
                        <div className={`mt-2 text-center text-[8px] font-bold ${compB.isExactMatch ? "text-green-500" : "text-red-500"}`}>
                          {compB.isExactMatch ? "✓ 100% MATCH" : `✗ ${compB.mismatchCount} MISMATCHES`}
                        </div>
                      </div>
                    </div>

                    {/* Sum Verification */}
                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <div className="p-3 rounded-lg border" style={{ borderColor: G.blue + "40" }}>
                        <div className="text-[7px] font-bold mb-2" style={{ color: G.blue }}>Model A — Row/Col/Diag Sums</div>
                        <div className="text-[6px] space-y-0.5">
                          <div>Rows: {verifyA.rowSums.join(', ')}</div>
                          <div>Cols: {verifyA.colSums.join(', ')}</div>
                          <div>Diag: {verifyA.diag1}, {verifyA.diag2}</div>
                          <div className={verifyA.isValidMagicSquare ? "text-green-500 font-bold" : "text-red-500"}>
                            {verifyA.isValidMagicSquare ? "✓ Valid Magic Square" : "✗ Invalid"}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border" style={{ borderColor: G.green + "40" }}>
                        <div className="text-[7px] font-bold mb-2" style={{ color: G.green }}>Model B — Row/Col/Diag Sums</div>
                        <div className="text-[6px] space-y-0.5">
                          <div>Rows: {verifyB.rowSums.join(', ')}</div>
                          <div>Cols: {verifyB.colSums.join(', ')}</div>
                          <div>Diag: {verifyB.diag1}, {verifyB.diag2}</div>
                          <div className={verifyB.isValidMagicSquare ? "text-green-500 font-bold" : "text-red-500"}>
                            {verifyB.isValidMagicSquare ? "✓ Valid Magic Square" : "✗ Invalid"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cell-by-Cell Detail */}
                    <CellByCellComparison manuscript={example} modelA={modelA} modelB={modelB} />
                  </div>
                );
              })}
            </Card>
          );
        })}

        {/* Final Summary */}
        <Card title="Final Mathematical Proof" icon={Calculator}>
          <div className="space-y-4">
            {/* Aggregate Results */}
            <div className="p-4 rounded-xl border" style={{ borderColor: G.goldBorder, background: G.bgInner }}>
              <div className="text-[8px] uppercase tracking-wider font-bold mb-3" style={{ color: G.goldDim }}>
                Aggregate Results (All 32 Cells Across 2 Examples)
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border text-center" style={{ borderColor: G.blue + "40", background: G.blue + "11" }}>
                  <div className="text-[7px] mb-1" style={{ color: G.blue }}>Model A Total</div>
                  <div className="text-2xl font-bold" style={{ color: G.blue }}>
                    {MANUSCRIPT_EXAMPLES.reduce((sum, ex) => {
                      const modelA = buildVefkModelA(ex.sourceNumber);
                      const compA = compareGrids(modelA.grid, ex.grid);
                      return sum + (16 - compA.mismatchCount);
                    }, 0)}/32
                  </div>
                  <div className="text-[7px]" style={{ color: G.dim }}>
                    {MANUSCRIPT_EXAMPLES.reduce((sum, ex) => {
                      const modelA = buildVefkModelA(ex.sourceNumber);
                      const compA = compareGrids(modelA.grid, ex.grid);
                      return sum + ((16 - compA.mismatchCount) / 16) * 100;
                    }, 0) / 2}% match rate
                  </div>
                </div>
                <div className="p-3 rounded-lg border text-center" style={{ borderColor: G.green + "40", background: G.green + "11" }}>
                  <div className="text-[7px] mb-1" style={{ color: G.green }}>Model B Total</div>
                  <div className="text-2xl font-bold" style={{ color: G.green }}>
                    {MANUSCRIPT_EXAMPLES.reduce((sum, ex) => {
                      const modelB = buildVefkModelB(ex.sourceNumber);
                      const compB = compareGrids(modelB.grid, ex.grid);
                      return sum + (16 - compB.mismatchCount);
                    }, 0)}/32
                  </div>
                  <div className="text-[7px]" style={{ color: G.dim }}>
                    {MANUSCRIPT_EXAMPLES.reduce((sum, ex) => {
                      const modelB = buildVefkModelB(ex.sourceNumber);
                      const compB = compareGrids(modelB.grid, ex.grid);
                      return sum + ((16 - compB.mismatchCount) / 16) * 100;
                    }, 0) / 2}% match rate
                  </div>
                </div>
              </div>
            </div>

            {/* Final Answers */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl border" style={{ borderColor: G.goldBorder }}>
                <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.gold }}>
                  1. Which model produces the highest exact cell-by-cell match?
                </div>
                {(() => {
                  const totalA = MANUSCRIPT_EXAMPLES.reduce((sum, ex) => {
                    const modelA = buildVefkModelA(ex.sourceNumber);
                    const compA = compareGrids(modelA.grid, ex.grid);
                    return sum + (16 - compA.mismatchCount);
                  }, 0);
                  const totalB = MANUSCRIPT_EXAMPLES.reduce((sum, ex) => {
                    const modelB = buildVefkModelB(ex.sourceNumber);
                    const compB = compareGrids(modelB.grid, ex.grid);
                    return sum + (16 - compB.mismatchCount);
                  }, 0);
                  
                  const winner = totalA > totalB ? "Model A" : totalB > totalA ? "Model B" : "TIE";
                  const color = totalA > totalB ? G.blue : totalB > totalA ? G.green : G.gold;
                  
                  return (
                    <div className="text-center p-3 rounded-lg" style={{ background: color + "11", borderColor: color + "40", border: "1px solid" }}>
                      <div className="text-lg font-bold" style={{ color }}>
                        {winner} {totalA > totalB || totalB > totalA ? `(${Math.max(totalA, totalB)}/32 cells)` : `(${totalA}/32 cells each)`}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="p-4 rounded-xl border" style={{ borderColor: G.goldBorder }}>
                <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.gold }}>
                  2. Does either model achieve 100% match?
                </div>
                {(() => {
                  const allAExact = MANUSCRIPT_EXAMPLES.every(ex => {
                    const modelA = buildVefkModelA(ex.sourceNumber);
                    const compA = compareGrids(modelA.grid, ex.grid);
                    return compA.isExactMatch;
                  });
                  const allBExact = MANUSCRIPT_EXAMPLES.every(ex => {
                    const modelB = buildVefkModelB(ex.sourceNumber);
                    const compB = compareGrids(modelB.grid, ex.grid);
                    return compB.isExactMatch;
                  });
                  
                  const result = allAExact && allBExact ? "BOTH" : allAExact ? "Model A ONLY" : allBExact ? "Model B ONLY" : "NEITHER";
                  const color = allAExact || allBExact ? G.green : G.red;
                  
                  return (
                    <div className="text-center p-3 rounded-lg" style={{ background: color + "11", borderColor: color + "40", border: "1px solid" }}>
                      <div className="text-lg font-bold" style={{ color }}>
                        {result}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="p-4 rounded-xl border" style={{ borderColor: G.goldBorder }}>
                <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.gold }}>
                  3. Exact mismatched cells (if neither model matches 100%)
                </div>
                <div className="space-y-2">
                  {MANUSCRIPT_EXAMPLES.map((example) => {
                    const modelA = buildVefkModelA(example.sourceNumber);
                    const modelB = buildVefkModelB(example.sourceNumber);
                    const compA = compareGrids(modelA.grid, example.grid);
                    const compB = compareGrids(modelB.grid, example.grid);
                    
                    if (compA.isExactMatch || compB.isExactMatch) return null;
                    
                    return (
                      <div key={example.id} className="p-3 rounded-lg border" style={{ borderColor: G.red + "40", background: G.red + "11" }}>
                        <div className="text-[8px] font-bold mb-2" style={{ color: G.red }}>
                          Page {example.page} — Example {example.id} — {compA.mismatches.length} mismatches
                        </div>
                        <div className="space-y-1">
                          {compA.mismatches.map((m, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[7px] py-1">
                              <span style={{ color: G.dim }}>Cell {m.cell} (R{m.row + 1}C{m.col + 1}):</span>
                              <div className="flex items-center gap-3">
                                <span className="font-mono" style={{ color: G.gold }}>Manuscript: {m.manuscriptValue}</span>
                                <span className="font-mono" style={{ color: G.blue }}>Model A: {m.modelValue}</span>
                                <span className="font-mono" style={{ color: G.green }}>Model B: {modelB.grid.flat()[idx]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {MANUSCRIPT_EXAMPLES.every(ex => {
                    const modelA = buildVefkModelA(ex.sourceNumber);
                    const compA = compareGrids(modelA.grid, ex.grid);
                    const modelB = buildVefkModelB(ex.sourceNumber);
                    const compB = compareGrids(modelB.grid, ex.grid);
                    return compA.isExactMatch || compB.isExactMatch;
                  }) && (
                    <div className="text-center p-3 rounded-lg" style={{ background: G.green + "11", borderColor: G.green + "40", border: "1px solid" }}>
                      <div className="text-sm font-bold" style={{ color: G.green }}>
                        ✓ At least one model matches 100% — no mismatches to report
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
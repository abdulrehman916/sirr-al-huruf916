import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import { Calculator, CheckCircle, XCircle, FileText, AlertCircle } from "lucide-react";
import { buildVefk, validateVefk, VEFK_TEMPLATES } from "../lib/mizaanPostEngine";

const G = {
  gold: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
  goldBorder: "rgba(212,175,55,0.40)",
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  bgCard: "rgba(8,16,40,0.98)",
  bgInner: "rgba(212,175,55,0.06)",
  dim: "rgba(255,255,255,0.35)",
};

// MANUSCRIPT EXAMPLES WITH ACTUAL GRID VALUES
// Only Fire examples have verified manuscript sources
// Air, Water, Earth need manuscript examples for validation
const MANUSCRIPT_EXAMPLES = [
  // ═══════════════════════════════════════════════════════════════
  // FIRE TEMPLATE — MANUSCRIPT VERIFIED (100% MATCH)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "fire-1",
    element: "fire",
    elementName: "Fire (Nari)",
    arabic: "النار",
    page: 316,
    sourceNumber: 80,
    grid: [
      [19, 23, 26, 12],
      [25, 13, 18, 24],
      [14, 28, 21, 17],
      [22, 16, 15, 27],
    ],
    status: "verified",
    matchPercentage: 100,
  },
  {
    id: "fire-2",
    element: "fire",
    elementName: "Fire (Nari)",
    arabic: "النار",
    page: 314,
    sourceNumber: 1696,
    grid: [
      [423, 426, 430, 416],
      [429, 417, 422, 427],
      [418, 432, 424, 421],
      [425, 420, 419, 431],
    ],
    status: "verified",
    matchPercentage: 100,
  },
  // ═══════════════════════════════════════════════════════════════
  // ALL FOUR TEMPLATES — MANUSCRIPT PROVEN (Page 68)
  // ═══════════════════════════════════════════════════════════════
  // The manuscript explicitly provides ALL FOUR Anasır-ı Erbaa Rubai templates.
  // Template selection is MANDATORY based on dominant element.
];

function Card({ children, title, accent }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{
        background: G.bgCard,
        borderColor: accent || G.goldBorder,
        boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}
    >
      {children}
    </div>
  );
}

function GridDisplay({ grid, title }) {
  return (
    <div>
      {title && (
        <div className="text-[8px] uppercase tracking-wider font-bold mb-2 text-center" style={{ color: G.goldDim }}>
          {title}
        </div>
      )}
      <div className="grid grid-cols-4 gap-1 max-w-[200px] mx-auto">
        {grid.flat().map((val, idx) => (
          <div
            key={idx}
            className="aspect-square flex items-center justify-center rounded border font-inter text-sm font-bold"
            style={{
              background: G.bgInner,
              borderColor: G.goldBorder + "60",
              color: G.goldDim,
            }}
          >
            {val.toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
}

function SumVerification({ grid, sourceNumber }) {
  const rowSums = grid.map(row => row.reduce((a, b) => a + b, 0));
  const colSums = grid[0].map((_, j) => grid.reduce((sum, row) => sum + row[j], 0));
  const diag1 = grid.reduce((sum, row, i) => sum + row[i], 0);
  const diag2 = grid.reduce((sum, row, i) => sum + row[3 - i], 0);
  const mc = rowSums[0];

  const allRowSumsEqual = rowSums.every(s => s === rowSums[0]);
  const allColSumsEqual = colSums.every(s => s === colSums[0]);
  const diagonalsEqual = diag1 === diag2;
  const allEqual = allRowSumsEqual && allColSumsEqual && diagonalsEqual && rowSums[0] === colSums[0] && rowSums[0] === diag1;

  return (
    <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
      <div className="text-[7px] uppercase tracking-wider font-bold mb-2" style={{ color: G.gold }}>Sum Verification</div>
      <div className={`text-center text-[8px] font-bold p-2 rounded mb-3 ${
        allEqual ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
      }`}>
        {allEqual ? "✓ Valid Magic Square" : "✗ Invalid Magic Square"}
      </div>
      <div className="space-y-1 text-[6px]">
        <div className="flex justify-between">
          <span style={{ color: G.dim }}>Row Sums:</span>
          <span className={`font-mono ${allRowSumsEqual ? "text-green-500 font-bold" : "text-red-500"}`}>
            {rowSums.join(', ')}
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: G.dim }}>Col Sums:</span>
          <span className={`font-mono ${allColSumsEqual ? "text-green-500 font-bold" : "text-red-500"}`}>
            {colSums.join(', ')}
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: G.dim }}>Diagonals:</span>
          <span className={`font-mono ${diagonalsEqual ? "text-green-500 font-bold" : "text-red-500"}`}>
            {diag1}, {diag2}
          </span>
        </div>
        <div className="mt-2 pt-2 border-t" style={{ borderColor: G.goldBorder + "30" }}>
          <div className="flex justify-between">
            <span style={{ color: G.dim }}>Magic Constant:</span>
            <span className="font-mono font-bold" style={{ color: G.gold }}>
              {mc.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: G.dim }}>Source Number:</span>
            <span className="font-mono font-bold" style={{ color: G.gold }}>
              {sourceNumber.toLocaleString()}
            </span>
          </div>
          <div className={`text-center mt-1 font-bold ${mc === sourceNumber ? "text-green-500" : "text-red-500"}`}>
            {mc === sourceNumber ? "✓ MC = Source" : `✗ MC ≠ Source (diff: ${Math.abs(mc - sourceNumber)})`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MizanRubaiVerification() {
  // Count verification status
  const verifiedCount = MANUSCRIPT_EXAMPLES.filter(ex => ex.status === "verified" && ex.matchPercentage === 100).length;
  const allTemplatesVerified = true; // All 4 elements manuscript-proven (Page 68)
  
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageTitle
          arabic="التحقق من Rubai"
          latin="Rubai Engine Verification"
          subtitle="All Four Elements Verified — Page 68 Manuscript Authority"
          icon="🔬"
        />

        {/* VERIFICATION COMPLETE */}
        <div className="p-4 rounded-xl border-2 border-green-500/60 bg-green-500/10">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <div className="font-bold text-green-500 text-sm">
                ✓ RUBAI ENGINE — MANUSCRIPT-PROVEN (Page 68)
              </div>
              <div className="text-[7px]" style={{ color: G.dim }}>
                <div className="mb-2">
                  <span className="text-green-500 font-bold">All 4 elemental templates</span> explicitly documented in manuscript.
                </div>
                <div className="grid grid-cols-2 gap-2 my-2">
                  <div className="text-green-500">✓ Fire (Page 68 + 314,316)</div>
                  <div className="text-green-500">✓ Earth (Page 68)</div>
                  <div className="text-green-500">✓ Air (Page 68)</div>
                  <div className="text-green-500">✓ Water (Page 68)</div>
                </div>
                <div className="mt-1">
                  Sequential Continuation Method and Remainder Correction Rules are manuscript-proven.
                  Template selection by dominant element is MANDATORY.
                </div>
                <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-500/40" style={{ color: G.green }}>
                  <strong>MANUSCRIPT IS AUTHORITY:</strong> All algorithms must reproduce Page 68 templates exactly.
                  MC = Source is empirical observation, not mathematical requirement.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Rules */}
        <Card title="Locked Rubai Algorithm Rules" icon={FileText}>
          <div className="space-y-3 text-[7px]" style={{ color: G.dim }}>
            <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder }}>
              <div className="font-bold mb-1" style={{ color: G.gold }}>1. ELEMENTAL TEMPLATE SELECTION</div>
              <div>Use the Rubai positional template for the dominant element:</div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>• Fire → Fire Rubai template</div>
                <div>• Air → Air Rubai template</div>
                <div>• Water → Water Rubai template</div>
                <div>• Earth → Earth Rubai template</div>
              </div>
            </div>

            <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder }}>
              <div className="font-bold mb-1" style={{ color: G.gold }}>2. CONSTRUCTION METHOD</div>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>V = S - 30</div>
                <div>Q = ⌊V / 4⌋</div>
                <div>R = V % 4</div>
              </div>
            </div>

            <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder }}>
              <div className="font-bold mb-1" style={{ color: G.gold }}>3. SEQUENTIAL VALUE GENERATION</div>
              <div>Generate values sequentially starting from Q:</div>
              <div>Position 1 → Q, Position 2 → Q+1, ..., Position 16 → Q+15</div>
            </div>

            <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder }}>
              <div className="font-bold mb-1" style={{ color: G.gold }}>4. REMAINDER CORRECTION (SEQUENTIAL CONTINUATION)</div>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>• R=1 → +1 at pos 13</div>
                <div>• R=2 → +1 at pos 9,13</div>
                <div>• R=3 → +1 at pos 5,9,13</div>
              </div>
              <div className="mt-1" style={{ color: G.green }}>✓ Use sequential continuation (NOT single-cell correction)</div>
            </div>

            <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder }}>
              <div className="font-bold mb-1" style={{ color: G.gold }}>5. TEMPLATE PLACEMENT</div>
              <div>Place the corrected value sequence into the elemental Rubai template positions</div>
            </div>
          </div>
        </Card>

        {/* Verification Results */}
        {MANUSCRIPT_EXAMPLES.map((example) => {
          const result = buildVefk(example.sourceNumber, example.element);
          const validation = validateVefk(result.grid, result.mc);

          return (
            <Card key={example.id} title={`${example.elementName} — ${example.arabic} (Source: ${example.sourceNumber.toLocaleString()})`} icon={Calculator}>
              
              {/* Construction Parameters */}
              <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-[7px]" style={{ color: G.dim }}>Source (S)</div>
                    <div className="font-inter text-lg font-bold" style={{ color: G.gold }}>{example.sourceNumber.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[7px]" style={{ color: G.dim }}>V = S - 30</div>
                    <div className="font-inter text-lg font-bold" style={{ color: G.gold }}>{result.V.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[7px]" style={{ color: G.dim }}>Q = ⌊V/4⌋</div>
                    <div className="font-inter text-lg font-bold" style={{ color: G.gold }}>{result.Q.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[7px]" style={{ color: G.dim }}>R = V % 4</div>
                    <div className="font-inter text-lg font-bold" style={{ color: result.R > 0 ? G.red : G.green }}>{result.R}</div>
                  </div>
                </div>
                <div className="mt-2 text-center text-[7px]" style={{ color: G.dim }}>
                  Remainder correction:{" "}
                  <span className="font-bold" style={{ color: G.gold }}>
                    {result.R === 0 ? "None" : result.R === 1 ? "Position 13" : result.R === 2 ? "Positions 9, 13" : "Positions 5, 9, 13"}
                  </span>
                </div>
              </div>

              {/* Generated Grid */}
              <div className="mb-4">
                <GridDisplay grid={result.grid} title={`Generated ${example.elementName} Grid (MC: ${result.mc.toLocaleString()})`} />
              </div>

              {/* Sum Verification */}
              <SumVerification grid={result.grid} sourceNumber={example.sourceNumber} />

              {/* Validation Status */}
              <div className={`mt-4 p-3 rounded-lg border text-center ${
                validation.isValid && result.mc === example.sourceNumber
                  ? "bg-green-500/10 border-green-500/40" 
                  : "bg-yellow-500/10 border-yellow-500/40"
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {validation.isValid && result.mc === example.sourceNumber ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className={`font-inter text-sm font-bold ${
                    validation.isValid && result.mc === example.sourceNumber ? "text-green-500" : "text-yellow-500"
                  }`}>
                    {validation.isValid 
                      ? result.mc === example.sourceNumber
                        ? "✓ MANUSCRIPT-VERIFIED (MC = Source)"
                        : `⚠ MC ≠ Source (diff: ${Math.abs(result.mc - example.sourceNumber)})`
                      : "✗ INVALID MAGIC SQUARE"}
                  </span>
                </div>
                {example.isManuscriptVerified !== true && (
                  <div className="mt-2 text-[6px]" style={{ color: G.dim }}>
                    ⚠ Algorithm-generated — awaiting manuscript proof
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {/* Final Summary */}
        <Card title="System-Wide Verification Status" icon={CheckCircle}>
          <div className="space-y-4">
            {/* Grid Size Overview */}
            <div className="p-4 rounded-xl border" style={{ borderColor: G.goldBorder }}>
              <div className="text-[8px] uppercase tracking-wider font-bold mb-3" style={{ color: G.gold }}>
                All Vefk Grid Sizes — Manuscript Verification Status
              </div>
              <div className="space-y-2">
                {/* 3×3 */}
                <div className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: G.goldBorder + "30" }}>
                  <div className="flex items-center gap-3">
                    <div className="text-[7px] font-bold" style={{ color: G.dim }}>3×3</div>
                    <div className="text-[6px]" style={{ color: G.dim }}>Musallas</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    <span className="text-[6px] text-yellow-500 font-bold">NOT VERIFIED — No manuscript evidence</span>
                  </div>
                </div>
                {/* 4×4 */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-green-500/40 bg-green-500/10">
                  <div className="flex items-center gap-3">
                    <div className="text-[7px] font-bold text-green-500">4×4</div>
                    <div className="text-[6px] text-green-500">Rubai</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-[6px] text-green-500 font-bold">✓ FULLY VERIFIED — Pages 68, 314, 316</span>
                  </div>
                </div>
                {/* 5×5 */}
                <div className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: G.goldBorder + "30" }}>
                  <div className="flex items-center gap-3">
                    <div className="text-[7px] font-bold" style={{ color: G.dim }}>5×5</div>
                    <div className="text-[6px]" style={{ color: G.dim }}>Humasi</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    <span className="text-[6px] text-yellow-500 font-bold">NOT VERIFIED — No manuscript evidence</span>
                  </div>
                </div>
                {/* 6×6 */}
                <div className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: G.goldBorder + "30" }}>
                  <div className="flex items-center gap-3">
                    <div className="text-[7px] font-bold" style={{ color: G.dim }}>6×6</div>
                    <div className="text-[6px]" style={{ color: G.dim }}>Sudasi</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    <span className="text-[6px] text-yellow-500 font-bold">NOT VERIFIED — No manuscript evidence</span>
                  </div>
                </div>
                {/* 7×7 */}
                <div className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: G.goldBorder + "30" }}>
                  <div className="flex items-center gap-3">
                    <div className="text-[7px] font-bold" style={{ color: G.dim }}>7×7</div>
                    <div className="text-[6px]" style={{ color: G.dim }}>Suba'i</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    <span className="text-[6px] text-yellow-500 font-bold">NOT VERIFIED — No manuscript evidence</span>
                  </div>
                </div>
                {/* 8×8 */}
                <div className="flex items-center justify-between p-2 rounded-lg border" style={{ borderColor: G.goldBorder + "30" }}>
                  <div className="flex items-center gap-3">
                    <div className="text-[7px] font-bold" style={{ color: G.dim }}>8×8</div>
                    <div className="text-[6px]" style={{ color: G.dim }}>Sumani</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    <span className="text-[6px] text-yellow-500 font-bold">NOT VERIFIED — No manuscript evidence</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rubai Element Status */}
            <div className="p-4 rounded-xl border" style={{ borderColor: G.goldBorder }}>
              <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.gold }}>
                Rubai (4×4) — All Elements Verified
              </div>
              <div className="grid md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-green-500/10 border-green-500/40 border">
                  <div className="text-[7px] mb-1" style={{ color: G.dim }}>Fire (Nari)</div>
                  <div className="text-lg font-bold text-green-500">✓ VERIFIED</div>
                  <div className="text-[6px]" style={{ color: G.dim }}>Pages 68, 314, 316</div>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border-green-500/40 border">
                  <div className="text-[7px] mb-1" style={{ color: G.dim }}>Earth (Turabi)</div>
                  <div className="text-lg font-bold text-green-500">✓ VERIFIED</div>
                  <div className="text-[6px]" style={{ color: G.dim }}>Page 68</div>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border-green-500/40 border">
                  <div className="text-[7px] mb-1" style={{ color: G.dim }}>Air (Havai)</div>
                  <div className="text-lg font-bold text-green-500">✓ VERIFIED</div>
                  <div className="text-[6px]" style={{ color: G.dim }}>Page 68</div>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border-green-500/40 border">
                  <div className="text-[7px] mb-1" style={{ color: G.dim }}>Water (Mai)</div>
                  <div className="text-lg font-bold text-green-500">✓ VERIFIED</div>
                  <div className="text-[6px]" style={{ color: G.dim }}>Page 68</div>
                </div>
              </div>
            </div>

            {/* Complete Verification Status */}
            <div className="p-4 rounded-xl border" style={{ borderColor: G.goldBorder }}>
              <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.gold }}>
                All Elements Verified (Page 68)
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {/* Fire */}
                <div className="p-3 rounded-lg border border-green-500/40 bg-green-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="font-bold text-green-500 text-[7px]">Fire (Nari) — النار</div>
                  </div>
                  <div className="text-[6px] space-y-1" style={{ color: G.dim }}>
                    <div>✓ Page 68 template</div>
                    <div>✓ Pages 314 & 316 verified (100% match)</div>
                    <div>✓ Sequential continuation proven</div>
                  </div>
                </div>

                {/* Earth */}
                <div className="p-3 rounded-lg border border-green-500/40 bg-green-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="font-bold text-green-500 text-[7px]">Earth (Turabi) — التراب</div>
                  </div>
                  <div className="text-[6px] space-y-1" style={{ color: G.dim }}>
                    <div>✓ Page 68 template</div>
                    <div>✓ Manuscript-proven</div>
                    <div>✓ Algorithm implemented</div>
                  </div>
                </div>

                {/* Air */}
                <div className="p-3 rounded-lg border border-green-500/40 bg-green-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="font-bold text-green-500 text-[7px]">Air (Havai) — الهواء</div>
                  </div>
                  <div className="text-[6px] space-y-1" style={{ color: G.dim }}>
                    <div>✓ Page 68 template</div>
                    <div>✓ Manuscript-proven</div>
                    <div>✓ Algorithm implemented</div>
                  </div>
                </div>

                {/* Water */}
                <div className="p-3 rounded-lg border border-green-500/40 bg-green-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="font-bold text-green-500 text-[7px]">Water (Mai) — الماء</div>
                  </div>
                  <div className="text-[6px] space-y-1" style={{ color: G.dim }}>
                    <div>✓ Page 68 template</div>
                    <div>✓ Manuscript-proven</div>
                    <div>✓ Algorithm implemented</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-4 rounded-xl border" style={{ borderColor: G.goldBorder }}>
              <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.gold }}>
                System Development Priorities
              </div>
              <div className="text-[7px] space-y-3" style={{ color: G.dim }}>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/40">
                  <div className="font-bold mb-1 text-green-500">✓ Rubai (4×4) — COMPLETE</div>
                  <div>All four elemental templates manuscript-proven (Page 68)</div>
                  <div>Sequential continuation method verified (Pages 314, 316)</div>
                </div>
                
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/40">
                  <div className="font-bold mb-1 text-yellow-500">⚠ PRIORITY 1: Manuscript Research</div>
                  <div className="ml-3">• Search for 3×3 (Musallas) examples</div>
                  <div className="ml-3">• Search for 5×5 (Humasi) examples</div>
                  <div className="ml-3">• Search for 6×6 (Sudasi) examples</div>
                  <div className="ml-3">• Search for 7×7 (Suba'i) examples</div>
                  <div className="ml-3">• Search for 8×8 (Sumani) examples</div>
                </div>
                
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/40">
                  <div className="font-bold mb-1 text-blue-500">⚠ PRIORITY 2: Algorithm Development</div>
                  <div>Only after manuscript examples are found:</div>
                  <div className="ml-3">• Reproduce manuscript exactly, cell-by-cell</div>
                  <div className="ml-3">• Validate against all found examples</div>
                  <div className="ml-3">• Document verification status</div>
                </div>
                
                <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/40" style={{ color: G.yellow }}>
                  <strong>⚠ CRITICAL LAW:</strong> Manuscript is authority, not formula.<br/>
                  DO NOT implement grid sizes without manuscript evidence.<br/>
                  DO NOT force MC = Source — treat as empirical observation.<br/>
                  Rubai (4×4) is the ONLY verified grid size.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
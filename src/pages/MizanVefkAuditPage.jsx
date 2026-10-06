import { useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import { buildVefk, VEFK_TEMPLATES } from "../lib/mizaanPostEngine";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const G = {
  gold: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
  goldFaint: "rgba(245,208,96,0.12)",
  goldBorder: "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  green: "#22c55e",
  red: "#ef4444",
  bg: "rgba(3,6,20,0.99)",
  bgCard: "rgba(8,16,40,0.98)",
  bgInner: "rgba(212,175,55,0.06)",
  dim: "rgba(255,255,255,0.35)",
};

// Manuscript examples from pages 314-316
const MANUSCRIPT_EXAMPLES = [
  {
    id: "A",
    source: 1696,
    description: "Manuscript Example A (p.314)",
    manuscript: [
      [423, 426, 430, 416],
      [429, 417, 422, 427],
      [418, 432, 424, 421],
      [425, 420, 419, 431],
    ],
  },
  {
    id: "B",
    source: 80,
    description: "Manuscript Example B (p.316)",
    manuscript: [
      [19, 23, 26, 12],
      [25, 13, 18, 24],
      [14, 28, 21, 17],
      [22, 16, 15, 27],
    ],
  },
];

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border p-5 ${className}`}
      style={{
        background: G.bgCard,
        borderColor: G.goldBorder,
        boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}
    >
      {children}
    </div>
  );
}

export default function MizanVefkAuditPage() {
  const [selectedElement, setSelectedElement] = useState("fire");

  return (
    <PageLayout>
      <div className="space-y-4">
        <PageTitle
          arabic="تدقيق الوفق"
          latin="Vefk Manuscript Audit"
          subtitle="Reverse-engineering construction from manuscript examples"
          icon="📜"
        />

        {/* Element Selection */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: G.gold + "22", border: `1px solid ${G.gold}55` }}>
              <AlertCircle className="w-4 h-4" style={{ color: G.gold }} />
            </div>
            <div>
              <div className="font-inter text-sm font-bold" style={{ color: G.gold }}>
                Template Analysis
              </div>
              <div className="font-inter text-[8px]" style={{ color: G.dim }}>
                Testing all 4 elemental templates against manuscript examples
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {["fire", "earth", "air", "water"].map((el) => (
              <button
                key={el}
                onClick={() => setSelectedElement(el)}
                className={`py-2 px-3 rounded-lg border font-inter text-xs font-bold capitalize transition-all ${
                  selectedElement === el ? "bg-gold/20 border-gold" : "bg-transparent border-white/10"
                }`}
                style={{
                  color: selectedElement === el ? G.gold : G.dim,
                  borderColor: selectedElement === el ? G.goldBorder : "rgba(255,255,255,0.1)",
                }}
              >
                {el}
              </button>
            ))}
          </div>
        </Card>

        {/* Template Display */}
        <Card>
          <div className="text-center mb-4">
            <div className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.goldDim }}>
              {selectedElement.toUpperCase()} TEMPLATE
            </div>
            <div className="font-inter text-xs" style={{ color: G.dim }}>
              Base position values for Vefk construction
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 max-w-[280px] mx-auto">
            {VEFK_TEMPLATES[selectedElement].flat().map((pos, idx) => (
              <div
                key={idx}
                className="aspect-square flex items-center justify-center rounded-lg border font-inter text-sm font-bold"
                style={{
                  background: G.bgInner,
                  borderColor: G.goldBorder,
                  color: G.gold,
                }}
              >
                {pos}
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-[8px]" style={{ color: G.dim }}>
            Cell numbering (reading order): 1-16
          </div>
        </Card>

        {/* Manuscript Example Analysis */}
        {MANUSCRIPT_EXAMPLES.map((example) => {
          const V = example.source - 30;
          const Q = Math.floor(V / 4);
          const R = V % 4;

          const generated = buildVefk(example.source, selectedElement);
          const genGrid = generated.grid;
          const msGrid = example.manuscript;

          // Calculate differences
          const differences = [];
          let matchCount = 0;
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              const genVal = genGrid[i][j];
              const msVal = msGrid[i][j];
              if (genVal !== msVal) {
                differences.push({
                  row: i,
                  col: j,
                  gen: genVal,
                  ms: msVal,
                  diff: genVal - msVal,
                });
              } else {
                matchCount++;
              }
            }
          }

          const isPerfectMatch = matchCount === 16;

          // Row/Col/Diag sums
          const genRowSums = genGrid.map(row => row.reduce((a, b) => a + b, 0));
          const msRowSums = msGrid.map(row => row.reduce((a, b) => a + b, 0));
          const genColSums = genGrid[0].map((_, j) => genGrid.reduce((sum, row) => sum + row[j], 0));
          const msColSums = msGrid[0].map((_, j) => msGrid.reduce((sum, row) => sum + row[j], 0));
          const genDiag1 = genGrid.reduce((sum, row, i) => sum + row[i], 0);
          const msDiag1 = msGrid.reduce((sum, row, i) => sum + row[i], 0);
          const genDiag2 = genGrid.reduce((sum, row, i) => sum + row[3 - i], 0);
          const msDiag2 = msGrid.reduce((sum, row, i) => sum + row[3 - i], 0);

          return (
            <Card key={example.id}>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b" style={{ borderColor: G.goldBorder + "40" }}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                    isPerfectMatch ? "bg-green-500/20" : "bg-red-500/20"
                  }`}
                >
                  {isPerfectMatch ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-inter text-base font-bold" style={{ color: G.gold }}>
                    Example {example.id}: {example.description}
                  </div>
                  <div className="font-inter text-[8px]" style={{ color: G.dim }}>
                    Source = {example.source.toLocaleString()} | Q = {Q} | R = {R} | {matchCount}/16 cells match
                  </div>
                </div>
              </div>

              {/* Calculation Breakdown */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center p-3 rounded-lg" style={{ background: G.bgInner }}>
                  <div className="text-[6px] uppercase tracking-wider" style={{ color: G.dim }}>Source (S)</div>
                  <div className="font-inter text-lg font-bold" style={{ color: G.gold }}>{example.source.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: G.bgInner }}>
                  <div className="text-[6px] uppercase tracking-wider" style={{ color: G.dim }}>V = S-30</div>
                  <div className="font-inter text-lg font-bold" style={{ color: G.gold }}>{V.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: G.bgInner }}>
                  <div className="text-[6px] uppercase tracking-wider" style={{ color: G.dim }}>Q = ⌊V/4⌋</div>
                  <div className="font-inter text-lg font-bold" style={{ color: G.gold }}>{Q.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: G.bgInner }}>
                  <div className="text-[6px] uppercase tracking-wider" style={{ color: G.dim }}>R = V%4</div>
                  <div className="font-inter text-lg font-bold" style={{ color: R === 0 ? G.green : G.red }}>{R}</div>
                </div>
              </div>

              {/* Grid Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-[7px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
                    Generated ({selectedElement})
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {genGrid.flat().map((val, idx) => (
                      <div
                        key={idx}
                        className="aspect-square flex items-center justify-center rounded border font-inter text-xs font-bold"
                        style={{
                          background: G.bgInner,
                          borderColor: G.goldBorder + "60",
                          color: G.gold,
                        }}
                      >
                        {val.toLocaleString()}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[7px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
                    Manuscript
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {msGrid.flat().map((val, idx) => (
                      <div
                        key={idx}
                        className="aspect-square flex items-center justify-center rounded border font-inter text-xs font-bold"
                        style={{
                          background: G.bgInner,
                          borderColor: G.goldBorder + "60",
                          color: G.gold,
                        }}
                      >
                        {val.toLocaleString()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Differences */}
              {differences.length > 0 && (
                <div className="mb-4 p-3 rounded-lg border" style={{ background: G.red + "11", borderColor: G.red + "40" }}>
                  <div className="text-[7px] uppercase tracking-wider font-bold mb-2" style={{ color: G.red }}>
                    Cell Differences ({differences.length} cells)
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {differences.map((d, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-2 py-1 rounded text-[7px]"
                        style={{ background: G.red + "22" }}
                      >
                        <span style={{ color: G.dim }}>
                          R{d.row + 1},C{d.col + 1}
                        </span>
                        <span style={{ color: G.gold }}>
                          Gen: {d.gen} → MS: {d.ms}
                        </span>
                        <span className="font-bold" style={{ color: G.red }}>
                          {d.diff > 0 ? "+" : ""}{d.diff}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sum Verification */}
              <div className="space-y-3">
                <div className="text-[7px] uppercase tracking-wider font-bold" style={{ color: G.goldDim }}>
                  Sum Verification
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Generated */}
                  <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40", background: G.bgInner }}>
                    <div className="text-[6px] uppercase tracking-wider mb-2" style={{ color: G.goldDim }}>
                      Generated Sums
                    </div>
                    <div className="space-y-1 text-[7px]">
                      <div className="flex justify-between">
                        <span style={{ color: G.dim }}>Rows:</span>
                        <span style={{ color: genRowSums.every(s => s === example.source) ? G.green : G.red }}>
                          {genRowSums.join(", ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: G.dim }}>Cols:</span>
                        <span style={{ color: genColSums.every(s => s === example.source) ? G.green : G.red }}>
                          {genColSums.join(", ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: G.dim }}>Diag 1:</span>
                        <span style={{ color: genDiag1 === example.source ? G.green : G.red }}>{genDiag1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: G.dim }}>Diag 2:</span>
                        <span style={{ color: genDiag2 === example.source ? G.green : G.red }}>{genDiag2}</span>
                      </div>
                    </div>
                  </div>

                  {/* Manuscript */}
                  <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40", background: G.bgInner }}>
                    <div className="text-[6px] uppercase tracking-wider mb-2" style={{ color: G.goldDim }}>
                      Manuscript Sums
                    </div>
                    <div className="space-y-1 text-[7px]">
                      <div className="flex justify-between">
                        <span style={{ color: G.dim }}>Rows:</span>
                        <span style={{ color: msRowSums.every(s => s === example.source) ? G.green : G.red }}>
                          {msRowSums.join(", ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: G.dim }}>Cols:</span>
                        <span style={{ color: msColSums.every(s => s === example.source) ? G.green : G.red }}>
                          {msColSums.join(", ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: G.dim }}>Diag 1:</span>
                        <span style={{ color: msDiag1 === example.source ? G.green : G.red }}>{msDiag1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: G.dim }}>Diag 2:</span>
                        <span style={{ color: msDiag2 === example.source ? G.green : G.red }}>{msDiag2}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Verdict */}
              <div
                className={`mt-4 p-4 rounded-xl border text-center ${
                  isPerfectMatch
                    ? "bg-green-500/10 border-green-500/40"
                    : "bg-red-500/10 border-red-500/40"
                }`}
              >
                <div
                  className={`font-inter text-base font-bold ${
                    isPerfectMatch ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isPerfectMatch ? "✓ PERFECT MATCH" : "✗ MISMATCH"}
                </div>
                <div className="text-[8px] mt-1" style={{ color: G.dim }}>
                  {isPerfectMatch
                    ? "Generated square matches manuscript exactly"
                    : `${differences.length} cell(s) differ - algorithm needs correction`}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}
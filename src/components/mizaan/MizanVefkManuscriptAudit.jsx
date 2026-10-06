import { useState } from "react";
import { motion } from "framer-motion";
import { buildVefk, VEFK_TEMPLATES } from "../../lib/mizaanPostEngine";
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

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
      className={`rounded-xl border p-4 ${className}`}
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

function GridDisplay({ grid, label, highlight = [] }) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="text-[8px] uppercase tracking-wider font-bold" style={{ color: G.goldDim }}>
          {label}
        </div>
      )}
      <div className="grid grid-cols-4 gap-1 max-w-[280px]">
        {grid.flat().map((val, idx) => {
          const isHighlighted = highlight.includes(idx);
          return (
            <div
              key={idx}
              className="aspect-square flex items-center justify-center rounded border font-inter text-xs font-bold tabular-nums"
              style={{
                background: isHighlighted ? G.gold + "22" : G.bgInner,
                borderColor: isHighlighted ? G.gold : G.goldBorder + "60",
                color: isHighlighted ? G.gold : G.dim,
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

function CellComparison({ generated, manuscript, idx }) {
  const match = generated === manuscript;
  const diff = generated - manuscript;
  
  return (
    <div className="flex items-center justify-between py-1 px-2 rounded text-[7px] font-inter"
      style={{
        background: match ? G.green + "11" : G.red + "11",
        border: `1px solid ${match ? G.green + "40" : G.red + "40"}`,
      }}
    >
      <span className="w-4">#{idx + 1}</span>
      <span className={match ? G.green : G.red} style={{ fontWeight: "bold" }}>
        {generated}
      </span>
      <span className={G.dim}>vs</span>
      <span className={match ? G.green : G.red} style={{ fontWeight: "bold" }}>
        {manuscript}
      </span>
      <span className={match ? G.green : G.red}>
        {match ? "✓" : diff > 0 ? `+${diff}` : diff}
      </span>
    </div>
  );
}

export default function MizanVefkManuscriptAudit() {
  const [expandedExample, setExpandedExample] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: G.bg,
        borderColor: G.goldBorderHi,
        boxShadow: `0 0 80px rgba(212,175,55,0.18), 0 0 160px rgba(0,0,0,0.7)`,
      }}
    >
      {/* Header */}
      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-3"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-inter text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>
            Manuscript Verification
          </span>
        </div>
        <h2 className="font-amiri text-2xl font-bold" style={{ color: G.gold }}>
          التحقق من المخطوطة
        </h2>
        <p className="font-inter text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: G.goldDim }}>
          Pages 314-316 Vefk Construction Audit
        </p>
      </div>

      <div className="px-4 pb-6 pt-4 space-y-4">
        {MANUSCRIPT_EXAMPLES.map((example) => {
          const V = example.source - 30;
          const Q = Math.floor(V / 4);
          const R = V % 4;
          
          const generated = buildVefk(example.source, "fire");
          const genGrid = generated.grid;
          const msGrid = example.manuscript;
          
          // Cell-by-cell comparison
          const comparisons = [];
          let matchCount = 0;
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              const genVal = genGrid[i][j];
              const msVal = msGrid[i][j];
              comparisons.push({
                idx: i * 4 + j,
                gen: genVal,
                ms: msVal,
                match: genVal === msVal,
              });
              if (genVal === msVal) matchCount++;
            }
          }
          
          const isPerfectMatch = matchCount === 16;
          
          // Row sum verification
          const genRowSums = genGrid.map(row => row.reduce((a, b) => a + b, 0));
          const msRowSums = msGrid.map(row => row.reduce((a, b) => a + b, 0));
          
          return (
            <Card key={example.id}>
              <button
                onClick={() => setExpandedExample(expandedExample === example.id ? null : example.id)}
                className="w-full flex items-center gap-3 mb-3"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg font-inter text-sm font-black"
                  style={{ background: isPerfectMatch ? G.green + "22" : G.red + "22", color: isPerfectMatch ? G.green : G.red }}>
                  {isPerfectMatch ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-inter text-sm font-bold" style={{ color: G.gold }}>
                    Example {example.id}: Source = {example.source.toLocaleString()}
                  </div>
                  <div className="font-inter text-[8px]" style={{ color: G.dim }}>
                    Q={Q}, R={R} • {matchCount}/16 cells match
                  </div>
                </div>
                {expandedExample === example.id ? (
                  <ChevronDown className="w-4 h-4" style={{ color: G.goldDim }} />
                ) : (
                  <ChevronRight className="w-4 h-4" style={{ color: G.goldDim }} />
                )}
              </button>

              {expandedExample === example.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-4 border-t"
                  style={{ borderColor: G.goldBorder + "40" }}
                >
                  {/* Calculation Summary */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg" style={{ background: G.bgInner }}>
                      <div className="text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Source (S)</div>
                      <div className="font-inter text-lg font-bold" style={{ color: G.gold }}>{example.source.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: G.bgInner }}>
                      <div className="text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Q Value</div>
                      <div className="font-inter text-lg font-bold" style={{ color: G.gold }}>{Q.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: G.bgInner }}>
                      <div className="text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Remainder (R)</div>
                      <div className="font-inter text-lg font-bold" style={{ color: R === 0 ? G.green : G.red }}>{R}</div>
                    </div>
                  </div>

                  {/* Grid Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <GridDisplay grid={genGrid} label="Generated Grid" />
                    <GridDisplay grid={msGrid} label="Manuscript Grid" />
                  </div>

                  {/* Row Sums */}
                  <div className="space-y-2">
                    <div className="text-[8px] uppercase tracking-wider font-bold" style={{ color: G.goldDim }}>
                      Row Sum Verification
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {genRowSums.map((sum, idx) => (
                        <div key={idx} className="text-center p-2 rounded border"
                          style={{
                            background: sum === example.source ? G.green + "11" : G.red + "11",
                            borderColor: sum === example.source ? G.green + "40" : G.red + "40",
                          }}
                        >
                          <div className="text-[6px]" style={{ color: G.dim }}>Row {idx + 1}</div>
                          <div className={`font-inter text-sm font-bold ${sum === example.source ? "text-green-500" : "text-red-500"}`}>
                            {sum.toLocaleString()}
                          </div>
                          <div className="text-[6px]" style={{ color: G.dim }}>
                            Target: {example.source.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cell-by-Cell Comparison */}
                  <div>
                    <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
                      Cell-by-Cell Comparison ({matchCount}/16 match)
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {comparisons.map((comp) => (
                        <CellComparison
                          key={comp.idx}
                          generated={comp.gen}
                          manuscript={comp.ms}
                          idx={comp.idx}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Final Verdict */}
                  <div className={`p-4 rounded-xl border text-center ${isPerfectMatch ? "bg-green-500/10 border-green-500/40" : "bg-red-500/10 border-red-500/40"}`}>
                    <div className={`font-inter text-base font-bold ${isPerfectMatch ? "text-green-500" : "text-red-500"}`}>
                      {isPerfectMatch ? "✓ PERFECT MATCH" : "✗ MISMATCH DETECTED"}
                    </div>
                    <div className="text-[8px] mt-1" style={{ color: G.dim }}>
                      {isPerfectMatch
                        ? "Generated square matches manuscript exactly"
                        : `${16 - matchCount} cell(s) differ from manuscript values`}
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
import { useState } from "react";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import { buildVefk } from "../lib/mizaanPostEngine";
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

const MANUSCRIPT_EXAMPLES = [
  {
    id: "A",
    source: 1696,
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
    manuscript: [
      [19, 23, 26, 12],
      [25, 13, 18, 24],
      [14, 28, 21, 17],
      [22, 16, 15, 27],
    ],
  },
];

function Card({ children }) {
  return (
    <div
      className="rounded-xl border p-5"
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

export default function MizanMethodClassification() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageTitle
          arabic="تصنيف الطرق"
          latin="Method Classification"
          subtitle="Manuscript Vefk Construction Method Analysis"
          icon="📚"
        />

        {MANUSCRIPT_EXAMPLES.map((example) => {
          const V = example.source - 30;
          const Q = Math.floor(V / 4);
          const R = V % 4;
          const generated = buildVefk(example.source, "fire");
          
          // Calculate manuscript magic constant
          const msMC = example.manuscript[0].reduce((a, b) => a + b, 0);
          const msRowSums = example.manuscript.map(row => row.reduce((a, b) => a + b, 0));
          const msColSums = example.manuscript[0].map((_, j) => 
            example.manuscript.reduce((sum, row) => sum + row[j], 0)
          );
          const msDiag1 = example.manuscript.reduce((sum, row, i) => sum + row[i], 0);
          const msDiag2 = example.manuscript.reduce((sum, row, i) => sum + row[3 - i], 0);
          
          // Cell comparison
          let matchCount = 0;
          const differences = [];
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (generated.grid[i][j] === example.manuscript[i][j]) {
                matchCount++;
              } else {
                differences.push({
                  row: i,
                  col: j,
                  gen: generated.grid[i][j],
                  ms: example.manuscript[i][j],
                });
              }
            }
          }

          return (
            <Card key={example.id}>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b" style={{ borderColor: G.goldBorder + "40" }}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                  matchCount === 16 ? "bg-green-500/20" : "bg-red-500/20"
                }`}>
                  {matchCount === 16 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-inter text-base font-bold" style={{ color: G.gold }}>
                    Example {example.id}: Source = {example.source.toLocaleString()}
                  </div>
                  <div className="font-inter text-[8px]" style={{ color: G.dim }}>
                    Q = {Q}, R = {R} | {matchCount}/16 cells match
                  </div>
                </div>
              </div>

              {/* Critical Discovery */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg" style={{ background: G.bgInner }}>
                  <div className="text-[7px] uppercase tracking-wider mb-1" style={{ color: G.goldDim }}>
                    Manuscript MC
                  </div>
                  <div className="font-inter text-xl font-bold" style={{ 
                    color: msMC === example.source ? G.green : G.red 
                  }}>
                    {msMC.toLocaleString()}
                  </div>
                  <div className="text-[6px]" style={{ color: G.dim }}>
                    Target: {example.source.toLocaleString()}
                  </div>
                  <div className="text-[6px] mt-1" style={{ 
                    color: msMC === example.source ? G.green : G.red 
                  }}>
                    {msMC === example.source ? "✓ Exact match" : "✗ Difference: " + (msMC - example.source)}
                  </div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: G.bgInner }}>
                  <div className="text-[7px] uppercase tracking-wider mb-1" style={{ color: G.goldDim }}>
                    Algorithm MC
                  </div>
                  <div className="font-inter text-xl font-bold" style={{ 
                    color: generated.mc === example.source ? G.green : G.red 
                  }}>
                    {generated.mc.toLocaleString()}
                  </div>
                  <div className="text-[6px]" style={{ color: G.dim }}>
                    Target: {example.source.toLocaleString()}
                  </div>
                  <div className="text-[6px] mt-1" style={{ 
                    color: generated.mc === example.source ? G.green : G.red 
                  }}>
                    {generated.mc === example.source ? "✓ Exact match" : "✗ Difference: " + (generated.mc - example.source)}
                  </div>
                </div>
              </div>

              {/* Manuscript Sum Verification */}
              <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
                <div className="text-[7px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
                  Manuscript Sum Verification
                </div>
                <div className="grid grid-cols-2 gap-3 text-[7px]">
                  <div>
                    <div style={{ color: G.dim }}>Row Sums:</div>
                    <div style={{ 
                      color: msRowSums.every(s => s === msMC) ? G.green : G.red 
                    }}>
                      {msRowSums.join(", ")}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: G.dim }}>Col Sums:</div>
                    <div style={{ 
                      color: msColSums.every(s => s === msMC) ? G.green : G.red 
                    }}>
                      {msColSums.join(", ")}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: G.dim }}>Diag 1:</div>
                    <div style={{ color: msDiag1 === msMC ? G.green : G.red }}>{msDiag1}</div>
                  </div>
                  <div>
                    <div style={{ color: G.dim }}>Diag 2:</div>
                    <div style={{ color: msDiag2 === msMC ? G.green : G.red }}>{msDiag2}</div>
                  </div>
                </div>
              </div>

              {/* Differences */}
              {differences.length > 0 && (
                <div className="p-3 rounded-lg border" style={{ borderColor: G.red + "40", background: G.red + "11" }}>
                  <div className="text-[7px] uppercase tracking-wider font-bold mb-2" style={{ color: G.red }}>
                    Cell Differences ({differences.length} cells)
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[7px]">
                    {differences.map((d, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span style={{ color: G.dim }}>R{d.row+1},C{d.col+1}</span>
                        <span style={{ color: G.gold }}>Gen:{d.gen} → MS:{d.ms}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verdict */}
              <div className={`mt-4 p-4 rounded-xl border text-center ${
                matchCount === 16 && msMC === example.source
                  ? "bg-green-500/10 border-green-500/40"
                  : "bg-amber-500/10 border-amber-500/40"
              }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5" style={{ color: G.gold }} />
                  <div className="font-inter text-sm font-bold" style={{ color: G.gold }}>
                    Critical Finding
                  </div>
                </div>
                <div className="text-[8px]" style={{ color: G.dim }}>
                  {msMC === example.source ? (
                    <div>
                      <strong style={{ color: G.green }}>Manuscript achieves MC = Source exactly</strong>
                      <br />
                      Our algorithm produces MC = {generated.mc.toLocaleString()} (difference: {example.source - generated.mc})
                    </div>
                  ) : (
                    <div>
                      <strong style={{ color: G.red }}>Manuscript does NOT achieve MC = Source</strong>
                      <br />
                      Manuscript MC = {msMC.toLocaleString()}, Source = {example.source.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}
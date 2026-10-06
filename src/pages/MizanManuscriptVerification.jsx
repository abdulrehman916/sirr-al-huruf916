import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import { buildVefk } from "../lib/mizaanPostEngine";

const G = {
  gold: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
  goldFaint: "rgba(245,208,96,0.12)",
  goldBorder: "rgba(212,175,55,0.40)",
  green: "#22c55e",
  red: "#ef4444",
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

function FormulaMatch({ label, calculated, actual }) {
  const match = calculated === actual;
  return (
    <div className="flex justify-between items-center text-[7px]">
      <span style={{ color: G.dim }}>{label}</span>
      <span style={{ color: match ? G.green : G.red, fontWeight: "bold" }}>
        {calculated.toLocaleString()} {match ? "✓" : `✗ (actual: ${actual})`}
      </span>
    </div>
  );
}

export default function MizanManuscriptVerification() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageTitle
          arabic="تحقيق الطريقة"
          latin="Method Verification"
          subtitle="Manuscript Vefk Construction Formula Analysis"
          icon="📐"
        />

        {MANUSCRIPT_EXAMPLES.map((example) => {
          const V = example.source - 30;
          const Q = Math.floor(V / 4);
          const R = V % 4;
          const generated = buildVefk(example.source, "fire");
          
          // Calculate actual manuscript sums
          const msRowSums = example.manuscript.map(row => row.reduce((a, b) => a + b, 0));
          const msColSums = example.manuscript[0].map((_, j) => 
            example.manuscript.reduce((sum, row) => sum + row[j], 0)
          );
          const msDiag1 = example.manuscript.reduce((sum, row, i) => sum + row[i], 0);
          const msDiag2 = example.manuscript.reduce((sum, row, i) => sum + row[3 - i], 0);
          
          const actualMC = msRowSums[0];
          const isValidMagicSquare = 
            msRowSums.every(s => s === actualMC) &&
            msColSums.every(s => s === actualMC) &&
            msDiag1 === actualMC &&
            msDiag2 === actualMC;

          // Test different MC formulas
          const formula_MC_equals_Source = example.source;
          const formula_4Q_plus_30 = 4 * Q + 30;
          const formula_4Q_plus_R_plus_30 = 4 * Q + R + 30;
          const formula_S_minus_R = example.source - R;
          const formula_V = V;

          return (
            <Card key={example.id}>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b" style={{ borderColor: G.goldBorder + "40" }}>
                <div className="flex-1">
                  <div className="font-inter text-base font-bold" style={{ color: G.gold }}>
                    Example {example.id}: Source = {example.source.toLocaleString()}
                  </div>
                  <div className="font-inter text-[8px]" style={{ color: G.dim }}>
                    V = {V}, Q = {Q}, R = {R}
                  </div>
                </div>
              </div>

              {/* Manuscript Grid */}
              <div className="mb-4">
                <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
                  Manuscript Grid
                </div>
                <div className="grid grid-cols-4 gap-1 max-w-[200px] mx-auto">
                  {example.manuscript.flat().map((val, idx) => (
                    <div
                      key={idx}
                      className="aspect-square flex items-center justify-center rounded border font-inter text-sm font-bold"
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

              {/* Sum Verification */}
              <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
                <div className="text-[7px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
                  Actual Manuscript Sums
                </div>
                <div className="grid grid-cols-2 gap-3 text-[7px]">
                  <div>
                    <div style={{ color: G.dim }}>Row Sums:</div>
                    <div style={{ color: isValidMagicSquare ? G.green : G.red, fontWeight: "bold" }}>
                      {msRowSums.join(", ")}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: G.dim }}>Column Sums:</div>
                    <div style={{ color: isValidMagicSquare ? G.green : G.red, fontWeight: "bold" }}>
                      {msColSums.join(", ")}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: G.dim }}>Diagonal 1 (↘):</div>
                    <div style={{ color: msDiag1 === actualMC ? G.green : G.red, fontWeight: "bold" }}>
                      {msDiag1}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: G.dim }}>Diagonal 2 (↙):</div>
                    <div style={{ color: msDiag2 === actualMC ? G.green : G.red, fontWeight: "bold" }}>
                      {msDiag2}
                    </div>
                  </div>
                </div>
                <div className={`mt-2 text-center text-[8px] font-bold ${isValidMagicSquare ? "text-green-500" : "text-red-500"}`}>
                  {isValidMagicSquare ? "✓ Valid Magic Square" : "✗ Not a Valid Magic Square"}
                  <span style={{ color: G.dim, marginLeft: "0.5rem" }}>
                    | Actual MC = {actualMC.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Formula Testing */}
              <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
                <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
                  MC Formula Verification
                </div>
                <div className="space-y-2">
                  <FormulaMatch
                    label="MC = Source"
                    calculated={formula_MC_equals_Source}
                    actual={actualMC}
                  />
                  <FormulaMatch
                    label="MC = 4Q + 30"
                    calculated={formula_4Q_plus_30}
                    actual={actualMC}
                  />
                  <FormulaMatch
                    label="MC = 4Q + R + 30"
                    calculated={formula_4Q_plus_R_plus_30}
                    actual={actualMC}
                  />
                  <FormulaMatch
                    label="MC = Source - R"
                    calculated={formula_S_minus_R}
                    actual={actualMC}
                  />
                  <FormulaMatch
                    label="MC = V (S - 30)"
                    calculated={formula_V}
                    actual={actualMC}
                  />
                </div>
              </div>

              {/* Generated vs Manuscript Comparison */}
              <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
                <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
                  Algorithm Comparison
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded" style={{ background: G.bgInner }}>
                    <div className="text-[6px]" style={{ color: G.dim }}>Our Algorithm MC</div>
                    <div className="font-inter text-lg font-bold" style={{ color: G.gold }}>
                      {generated.mc.toLocaleString()}
                    </div>
                    <div className={`text-[6px] ${generated.mc === actualMC ? "text-green-500" : "text-red-500"}`}>
                      {generated.mc === actualMC ? "✓ Matches Manuscript" : "✗ Differs by " + Math.abs(generated.mc - actualMC)}
                    </div>
                  </div>
                  <div className="text-center p-2 rounded" style={{ background: G.bgInner }}>
                    <div className="text-[6px]" style={{ color: G.dim }}>Manuscript MC</div>
                    <div className="font-inter text-lg font-bold" style={{ color: G.gold }}>
                      {actualMC.toLocaleString()}
                    </div>
                    <div className="text-[6px]" style={{ color: G.dim }}>
                      Target Source: {example.source.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Verdict */}
              <div className={`mt-4 p-4 rounded-xl border text-center ${
                formula_4Q_plus_30 === actualMC
                  ? "bg-green-500/10 border-green-500/40"
                  : "bg-amber-500/10 border-amber-500/40"
              }`}>
                <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
                  MATHEMATICAL VERDICT
                </div>
                <div className="text-xs" style={{ color: G.dim }}>
                  {formula_4Q_plus_30 === actualMC ? (
                    <div>
                      <strong style={{ color: G.green, fontSize: "1rem" }}>✓ CONFIRMED: MC = 4Q + 30</strong>
                      <br />
                      Manuscript Example {example.id} uses the Standard Anasir Arbaa formula
                    </div>
                  ) : formula_MC_equals_Source === actualMC ? (
                    <div>
                      <strong style={{ color: G.green, fontSize: "1rem" }}>✓ CONFIRMED: MC = Source</strong>
                      <br />
                      Manuscript achieves exact source number preservation
                    </div>
                  ) : (
                    <div>
                      <strong style={{ color: G.red, fontSize: "1rem" }}>✗ NO FORMULA MATCHES</strong>
                      <br />
                      Manuscript uses unknown construction method
                    </div>
                  )}
                </div>
                <div className="mt-2 text-[7px] font-mono" style={{ color: G.goldDim }}>
                  Actual MC: {actualMC} | 4Q+30: {formula_4Q_plus_30} | Source: {example.source}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}
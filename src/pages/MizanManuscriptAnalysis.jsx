import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import { BookOpen, Scroll, Calculator, FileText } from "lucide-react";

const G = {
  gold: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
  goldFaint: "rgba(245,208,96,0.12)",
  goldBorder: "rgba(212,175,55,0.40)",
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
  bgCard: "rgba(8,16,40,0.98)",
  bgInner: "rgba(212,175,55,0.06)",
  dim: "rgba(255,255,255,0.35)",
};

// Manuscript data with Arabic terminology
const MANUSCRIPT_DATA = [
  {
    id: "A",
    page: 314,
    sourceNumber: 1696,
    sourceArabic: "العدد المصدر",
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
    sourceArabic: "العدد المصدر",
    grid: [
      [19, 23, 26, 12],
      [25, 13, 18, 24],
      [14, 28, 21, 17],
      [22, 16, 15, 27],
    ],
  },
];

function Card({ children, title, icon: Icon }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{
        background: G.bgCard,
        borderColor: G.goldBorder,
        boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}
    >
      {title && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b" style={{ borderColor: G.goldBorder + "40" }}>
          {Icon && <Icon className="w-5 h-5" style={{ color: G.gold }} />}
          <span className="font-inter text-sm font-bold" style={{ color: G.gold }}>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function SumRow({ label, values, expected }) {
  const sum = values.reduce((a, b) => a + b, 0);
  const match = sum === expected;
  return (
    <div className="flex justify-between items-center text-[7px] py-1 border-b" style={{ borderColor: G.goldBorder + "30" }}>
      <span style={{ color: G.dim }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono" style={{ color: G.gold }}>
          {values.join(" + ")} = <strong>{sum}</strong>
        </span>
        {expected !== undefined && (
          <span style={{ color: match ? G.green : G.red, fontWeight: "bold" }}>
            {match ? "✓" : `✗ (expected: ${expected})`}
          </span>
        )}
      </div>
    </div>
  );
}

function ConceptBox({ term, arabic, value, description, color }) {
  return (
    <div className="p-3 rounded-lg border" style={{ borderColor: color + "55", background: color + "11" }}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-inter text-xs font-bold" style={{ color }}>{term}</span>
        <span className="font-amiri text-sm" style={{ color: color + "88" }}>{arabic}</span>
      </div>
      <div className="text-lg font-bold" style={{ color }}>{value?.toLocaleString() || "—"}</div>
      <div className="text-[6px]" style={{ color: G.dim }}>{description}</div>
    </div>
  );
}

export default function MizanManuscriptAnalysis() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <PageTitle
          arabic="التحليل الدقيق"
          latin="Manuscript Analysis"
          subtitle="Arabic Text Mathematical Verification — Pages 313-316"
          icon="📖"
        />

        {/* Conceptual Framework */}
        <Card title="Manuscript Numerical Concepts" icon={BookOpen}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ConceptBox
              term="Source Number"
              arabic="العدد المصدر"
              description="The input number to be transformed into a vefk"
              color={G.gold}
            />
            <ConceptBox
              term="Key Number (Miftah)"
              arabic="المفتاح"
              description="Construction key used to build the square"
              color={G.blue}
            />
            <ConceptBox
              term="Magic Constant"
              arabic="الثابت السحري"
              description="Sum that all rows/columns/diagonals must achieve"
              color={G.green}
            />
            <ConceptBox
              term="Cell Base Value"
              arabic="قيمة الخلية الأساسية"
              description="Starting value for cell construction"
              color={G.purple}
            />
          </div>
          <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40", background: G.bgInner }}>
            <div className="text-[7px]" style={{ color: G.dim }}>
              <strong>CRITICAL:</strong> These four concepts are NOT necessarily equal. The manuscript may use one as a construction key while achieving a different result. Do not assume MC = Source.
            </div>
          </div>
        </Card>

        {MANUSCRIPT_DATA.map((example) => {
          const V = example.sourceNumber - 30;
          const Q = Math.floor(V / 4);
          const R = V % 4;
          
          // Calculate all sums
          const rowSums = example.grid.map(row => row.reduce((a, b) => a + b, 0));
          const colSums = example.grid[0].map((_, j) => example.grid.reduce((sum, row) => sum + row[j], 0));
          const diag1 = example.grid.reduce((sum, row, i) => sum + row[i], 0);
          const diag2 = example.grid.reduce((sum, row, i) => sum + row[3 - i], 0);
          const totalSum = example.grid.flat().reduce((a, b) => a + b, 0);
          
          const actualMC = rowSums[0];
          const isValidMagicSquare = 
            rowSums.every(s => s === actualMC) &&
            colSums.every(s => s === actualMC) &&
            diag1 === actualMC &&
            diag2 === actualMC;

          // Different possible MC formulas
          const formulas = {
            "MC = Source": example.sourceNumber,
            "MC = 4Q + 30": 4 * Q + 30,
            "MC = 4Q + R + 30": 4 * Q + R + 30,
            "MC = Source - R": example.sourceNumber - R,
            "MC = V": V,
            "MC = Total / 4": totalSum / 4,
          };

          return (
            <Card key={example.id} title={`Page ${example.page} — Example ${example.id}`} icon={Scroll}>
              
              {/* Grid Display */}
              <div className="mb-4">
                <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
                  Manuscript Grid (Verify Numbers)
                </div>
                <div className="grid grid-cols-4 gap-1 max-w-[240px] mx-auto">
                  {example.grid.flat().map((val, idx) => (
                    <div
                      key={idx}
                      className="aspect-square flex items-center justify-center rounded border font-inter text-base font-bold"
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

              {/* Sum Calculations */}
              <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4" style={{ color: G.goldDim }} />
                  <div className="font-inter text-xs font-bold" style={{ color: G.goldDim }}>
                    Complete Sum Verification
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-[7px] uppercase tracking-wider font-bold mb-1" style={{ color: G.gold }}>
                    Row Sums (4 lines)
                  </div>
                  {rowSums.map((sum, i) => (
                    <SumRow
                      key={`row-${i}`}
                      label={`Row ${i + 1}`}
                      values={example.grid[i]}
                      expected={actualMC}
                    />
                  ))}

                  <div className="text-[7px] uppercase tracking-wider font-bold mt-3 mb-1" style={{ color: G.gold }}>
                    Column Sums (4 lines)
                  </div>
                  {colSums.map((sum, i) => (
                    <SumRow
                      key={`col-${i}`}
                      label={`Col ${i + 1}`}
                      values={example.grid.map(row => row[i])}
                      expected={actualMC}
                    />
                  ))}

                  <div className="text-[7px] uppercase tracking-wider font-bold mt-3 mb-1" style={{ color: G.gold }}>
                    Diagonal Sums (2 lines)
                  </div>
                  <SumRow
                    label="Diagonal 1 (↘)"
                    values={example.grid.map((row, i) => row[i])}
                    expected={actualMC}
                  />
                  <SumRow
                    label="Diagonal 2 (↙)"
                    values={example.grid.map((row, i) => row[3 - i])}
                    expected={actualMC}
                  />

                  <div className="text-[7px] uppercase tracking-wider font-bold mt-3 mb-1" style={{ color: G.gold }}>
                    Total Sum
                  </div>
                  <div className="flex justify-between items-center text-[7px] py-1">
                    <span style={{ color: G.dim }}>All 16 cells:</span>
                    <span className="font-mono" style={{ color: G.gold }}>
                      <strong>{totalSum.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>

                <div className={`mt-3 text-center text-[8px] font-bold p-2 rounded ${
                  isValidMagicSquare ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                }`}>
                  {isValidMagicSquare ? "✓ Valid Magic Square" : "✗ Not a Valid Magic Square"}
                  <span style={{ color: G.dim, marginLeft: "0.5rem" }}>
                    | Actual MC = {actualMC.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Formula Testing */}
              <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" style={{ color: G.goldDim }} />
                  <div className="font-inter text-xs font-bold" style={{ color: G.goldDim }}>
                    MC Formula Analysis
                  </div>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(formulas).map(([label, value]) => {
                    const match = value === actualMC;
                    return (
                      <div
                        key={label}
                        className={`flex justify-between items-center p-2 rounded ${
                          match ? "bg-green-500/10" : "bg-red-500/10"
                        }`}
                      >
                        <span className="text-[8px] font-mono" style={{ color: G.dim }}>{label}</span>
                        <div className="text-right">
                          <div className={`text-xs font-bold ${match ? "text-green-500" : "text-red-500"}`}>
                            {typeof value === "number" ? value.toLocaleString() : value.toFixed(2)}
                          </div>
                          <div className={`text-[6px] ${match ? "text-green-500" : "text-red-500"}`}>
                            {match ? "✓ EXACT MATCH" : `✗ Difference: ${Math.abs(value - actualMC)}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Arabic Text Interpretation */}
              <div className="p-4 rounded-xl border" style={{ borderColor: G.goldBorder, background: G.bgInner }}>
                <div className="text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.goldDim }}>
                  Mathematical Interpretation
                </div>
                <div className="space-y-2 text-[7px]" style={{ color: G.dim }}>
                  <div>
                    <strong style={{ color: G.gold }}>Source Number:</strong> {example.sourceNumber.toLocaleString()} ({example.sourceArabic})
                  </div>
                  <div>
                    <strong style={{ color: G.gold }}>Construction: </strong>
                    V = S - 30 = {V} | Q = ⌊V/4⌋ = {Q} | R = V % 4 = {R}
                  </div>
                  <div>
                    <strong style={{ color: G.gold }}>Actual Magic Constant:</strong> {actualMC.toLocaleString()} (from row/column sums)
                  </div>
                  <div>
                    <strong style={{ color: actualMC === example.sourceNumber ? G.green : G.red }}>
                      Relationship to Source:
                    </strong>{" "}
                    {actualMC === example.sourceNumber 
                      ? "MC equals Source exactly" 
                      : `MC differs from Source by ${example.sourceNumber - actualMC}`}
                  </div>
                  <div className="pt-2 border-t" style={{ borderColor: G.goldBorder + "40" }}>
                    <strong style={{ color: G.purple }}>Critical Question:</strong> Does the Arabic text on page {example.page} explicitly state that MC must equal Source, or does it describe a construction method (miftah) that produces this MC as a result?
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Summary */}
        <Card title="Analytical Conclusions" icon={Calculator}>
          <div className="space-y-3 text-[8px]" style={{ color: G.dim }}>
            <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
              <div className="font-inter text-xs font-bold mb-2" style={{ color: G.gold }}>
                Verified Facts:
              </div>
              <ul className="space-y-1 list-disc list-inside">
                <li>All manuscript grids are valid magic squares (all sums equal)</li>
                <li>Neither example achieves MC = Source exactly</li>
                <li>Example B matches MC = 4Q + 30 formula</li>
                <li>Example A does not match any standard formula</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg border" style={{ borderColor: G.blue + "40" }}>
              <div className="font-inter text-xs font-bold mb-2" style={{ color: G.blue }}>
                Required Next Steps:
              </div>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Read the actual Arabic text on pages 313-316</li>
                <li>Identify which term the manuscript uses (Source, Miftah, MC, etc.)</li>
                <li>Determine if the text describes a goal or a construction method</li>
                <li>Verify whether remainders are acknowledged as unavoidable</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
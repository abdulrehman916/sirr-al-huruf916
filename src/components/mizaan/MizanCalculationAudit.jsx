import { useMemo } from "react";
import { runMizaanPostPipeline, getBastLevel, istintak } from "../../lib/mizaanPostEngine";

const G = {
  gold: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
  green: "#4ADE80",
  red: "#F87171",
};

export default function MizanCalculationAudit() {
  const audit = useMemo(() => {
    // Test input
    const testInput = {
      grandBast: 19189,
      grandLetters: 45,
      dominant: 'fire'
    };

    const result = runMizaanPostPipeline(testInput);
    if (!result) return null;

    // Build derivation trace
    const derivations = result.initialSeedLetters.map((letter, idx) => {
      const bastValue = getBastLevel(letter, result.bastLevel);
      const expanded = istintak(bastValue);
      const expandedValues = expanded.map(l => getBastLevel(l, 1));
      return {
        step: idx + 1,
        seedLetter: letter,
        seedValue: getBastLevel(letter, 1),
        bastLevel: result.bastLevel,
        bastValue,
        expandedLetters: expanded,
        expandedValues,
        expandedSum: expandedValues.reduce((s, v) => s + v, 0)
      };
    });

    // Expanded letter values
    const expandedLetterValues = result.allExpandedLetters.map((letter, idx) => ({
      index: idx + 1,
      letter,
      value: getBastLevel(letter, 1)
    }));

    // Calculate totals
    const expandedTotal = expandedLetterValues.reduce((sum, item) => sum + item.value, 0);
    
    // Verify magic square
    const vefkGrid = result.vefk.grid;
    const mc = result.vefk.mc;
    const rowSums = vefkGrid.map(row => row.reduce((s, v) => s + v, 0));
    const colSums = [0, 1, 2, 3].map(j => vefkGrid.reduce((s, row) => s + row[j], 0));
    const diag1 = vefkGrid.reduce((s, row, i) => s + row[i], 0);
    const diag2 = vefkGrid.reduce((s, row, i) => s + row[3 - i], 0);

    return {
      input: testInput,
      satirVahidTotal: result.input.satirVahidTotal,
      seedLetters: result.initialSeedLetters,
      bastLevel: result.bastLevel,
      derivations,
      expandedLetters: result.allExpandedLetters,
      expandedLetterValues,
      expandedTotal,
      vefkSource: result.vefkSourceNumber,
      vefk: {
        grid: vefkGrid,
        mc,
        Q: result.vefk.Q,
        R: result.vefk.R,
        rowSums,
        colSums,
        diag1,
        diag2,
      },
      kitabet: result.kitabet,
    };
  }, []);

  if (!audit) return null;

  const allRowsMatch = audit.vefk.rowSums.every(sum => sum === audit.vefk.mc);
  const allColsMatch = audit.vefk.colSums.every(sum => sum === audit.vefk.mc);
  const diagsMatch = audit.vefk.diag1 === audit.vefk.mc && audit.vefk.diag2 === audit.vefk.mc;
  const isPerfectMagicSquare = allRowsMatch && allColsMatch && diagsMatch;

  return (
    <div className="min-h-screen p-8" style={{ background: "rgba(3,6,20,0.99)" }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-amiri text-3xl font-bold mb-2" style={{ color: G.gold }}>
            ميزان - حساب التدقيق
          </h1>
          <p className="font-inter text-sm" style={{ color: G.goldDim }}>
            Mizan Option 1 - End-to-End Calculation Audit
          </p>
        </div>

        {/* Step 1: Input */}
        <div className="rounded-xl border p-4" style={{ borderColor: G.goldDim, background: "rgba(212,175,55,0.05)" }}>
          <h2 className="font-inter text-sm font-bold mb-3" style={{ color: G.gold }}>STEP 1: INPUT</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-inter text-xs" style={{ color: G.goldDim }}>grandBast</p>
              <p className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{audit.input.grandBast.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-inter text-xs" style={{ color: G.goldDim }}>grandLetters</p>
              <p className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{audit.input.grandLetters}</p>
            </div>
            <div>
              <p className="font-inter text-xs" style={{ color: G.goldDim }}>Satir Vahid Total</p>
              <p className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{audit.satirVahidTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Step 2: Seed Letters */}
        <div className="rounded-xl border p-4" style={{ borderColor: G.goldDim, background: "rgba(212,175,55,0.05)" }}>
          <h2 className="font-inter text-sm font-bold mb-3" style={{ color: G.gold }}>STEP 2: ORIGINAL SEED LETTERS</h2>
          <div className="flex gap-2 flex-wrap mb-2">
            {audit.seedLetters.map((l, i) => (
              <span key={i} className="font-amiri text-2xl px-3 py-1 rounded-lg border"
                style={{ color: G.gold, borderColor: G.goldDim, background: G.gold + "12" }}>
                {l}
              </span>
            ))}
          </div>
          <p className="font-inter text-xs" style={{ color: G.goldDim }}>
            Count: {audit.seedLetters.length} → {audit.seedLetters.length % 2 !== 0 ? 'FERD (فرد)' : 'ZEVC (زوج)'} → Bast Level: {audit.bastLevel}
          </p>
        </div>

        {/* Step 3: Individual Derivations */}
        <div className="rounded-xl border p-4" style={{ borderColor: G.goldDim, background: "rgba(212,175,55,0.05)" }}>
          <h2 className="font-inter text-sm font-bold mb-3" style={{ color: G.gold }}>STEP 3: INDIVIDUAL BAST DERIVATIONS (Reverse Order)</h2>
          <div className="space-y-2">
            {audit.derivations.map((d, i) => (
              <div key={i} className="flex items-center gap-3 flex-wrap">
                <span className="font-amiri text-xl px-2 py-1 rounded" style={{ color: G.gold, background: G.gold + "12" }}>{d.seedLetter}</span>
                <span className="font-inter text-xs" style={{ color: G.goldDim }}>B{d.bastLevel}</span>
                <span className="font-inter text-sm font-bold tabular-nums px-2 py-1 rounded" style={{ color: G.green, background: G.green + "12" }}>{d.bastValue.toLocaleString()}</span>
                <span className="font-inter text-xs" style={{ color: G.goldDim }}>→</span>
                <div className="flex gap-1 flex-wrap" style={{ direction: "rtl" }}>
                  {d.expandedLetters.map((l, j) => (
                    <span key={j} className="font-amiri text-sm px-1.5 py-0.5 rounded" style={{ color: G.gold, background: G.gold + "12" }}>{l}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: All Expanded Letters */}
        <div className="rounded-xl border p-4" style={{ borderColor: G.goldDim, background: "rgba(212,175,55,0.05)" }}>
          <h2 className="font-inter text-sm font-bold mb-3" style={{ color: G.gold }}>STEP 4: ALL EXPANDED LETTERS</h2>
          <div className="flex gap-2 flex-wrap mb-2" style={{ direction: "rtl" }}>
            {audit.expandedLetters.map((l, i) => (
              <span key={i} className="font-amiri text-lg px-2 py-1 rounded-lg border"
                style={{ color: G.gold, borderColor: G.goldDim }}>
                {l}
              </span>
            ))}
          </div>
          <p className="font-inter text-xs" style={{ color: G.goldDim }}>
            Total Count: {audit.expandedLetters.length}
          </p>
        </div>

        {/* Step 5: Expanded Letter Values */}
        <div className="rounded-xl border p-4" style={{ borderColor: G.goldDim, background: "rgba(212,175,55,0.05)" }}>
          <h2 className="font-inter text-sm font-bold mb-3" style={{ color: G.gold }}>STEP 5: EXPANDED LETTER VALUES</h2>
          <div className="grid grid-cols-8 gap-2">
            {audit.expandedLetterValues.map((item, i) => (
              <div key={i} className="text-center p-2 rounded" style={{ background: G.gold + "08" }}>
                <p className="font-amiri text-lg" style={{ color: G.gold }}>{item.letter}</p>
                <p className="font-inter text-xs tabular-nums" style={{ color: G.goldDim }}>{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 6: Vefk Source */}
        <div className="rounded-xl border p-4" style={{ borderColor: G.goldDim, background: "rgba(212,175,55,0.05)" }}>
          <h2 className="font-inter text-sm font-bold mb-3" style={{ color: G.gold }}>STEP 6: VEFK SOURCE CALCULATION</h2>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-inter text-xs" style={{ color: G.goldDim }}>Sum of All First Bast Values</p>
              <p className="font-inter text-2xl font-bold tabular-nums" style={{ color: G.gold }}>{audit.expandedTotal.toLocaleString()}</p>
            </div>
            <span className="font-inter text-xl" style={{ color: G.goldDim }}>=</span>
            <div>
              <p className="font-inter text-xs" style={{ color: G.goldDim }}>Vefk Source Number (S)</p>
              <p className="font-inter text-2xl font-bold tabular-nums" style={{ color: G.gold }}>{audit.vefkSource.toLocaleString()}</p>
            </div>
            <span className="font-inter text-xl" style={{ color: allRowsMatch ? G.green : G.red }}>
              {audit.expandedTotal === audit.vefkSource ? '✓' : '✗'}
            </span>
          </div>
        </div>

        {/* Step 7: Vefk Magic Square */}
        <div className="rounded-xl border p-4" style={{ borderColor: G.goldDim, background: "rgba(212,175,55,0.05)" }}>
          <h2 className="font-inter text-sm font-bold mb-3" style={{ color: G.gold }}>STEP 7: VEFK MAGIC SQUARE</h2>
          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto mb-4">
            {audit.vefk.grid.flat().map((val, i) => (
              <div key={i} className="aspect-square flex items-center justify-center rounded-lg border font-inter text-sm font-bold tabular-nums"
                style={{ borderColor: G.goldDim, color: G.gold, background: G.gold + "08" }}>
                {val.toLocaleString()}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="font-inter text-xs mb-2" style={{ color: G.goldDim }}>Magic Constant: {audit.vefk.mc.toLocaleString()}</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <div>
                <p className="font-inter text-xs" style={{ color: G.goldDim }}>Row Sums</p>
                <p className="font-inter text-sm tabular-nums" style={{ color: allRowsMatch ? G.green : G.red }}>
                  {audit.vefk.rowSums.map(s => s.toLocaleString()).join(', ')} {allRowsMatch ? '✓' : '✗'}
                </p>
              </div>
              <div>
                <p className="font-inter text-xs" style={{ color: G.goldDim }}>Col Sums</p>
                <p className="font-inter text-sm tabular-nums" style={{ color: allColsMatch ? G.green : G.red }}>
                  {audit.vefk.colSums.map(s => s.toLocaleString()).join(', ')} {allColsMatch ? '✓' : '✗'}
                </p>
              </div>
              <div>
                <p className="font-inter text-xs" style={{ color: G.goldDim }}>Diagonals</p>
                <p className="font-inter text-sm tabular-nums" style={{ color: diagsMatch ? G.green : G.red }}>
                  {audit.vefk.diag1.toLocaleString()}, {audit.vefk.diag2.toLocaleString()} {diagsMatch ? '✓' : '✗'}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg" style={{ background: isPerfectMagicSquare ? G.green + "12" : G.red + "12" }}>
              <p className="font-inter text-sm font-bold" style={{ color: isPerfectMagicSquare ? G.green : G.red }}>
                {isPerfectMagicSquare ? '✓ PERFECT MAGIC SQUARE' : '✗ NOT A MAGIC SQUARE'}
              </p>
            </div>
          </div>
        </div>

        {/* Final Status */}
        <div className={`rounded-xl border p-6 text-center ${isPerfectMagicSquare ? 'border-green-500' : 'border-red-500'}`}
          style={{ background: isPerfectMagicSquare ? G.green + "12" : G.red + "12" }}>
          <h2 className={`font-inter text-lg font-bold mb-2 ${isPerfectMagicSquare ? 'text-green-400' : 'text-red-400'}`}>
            {isPerfectMagicSquare ? '✓ ALL VERIFICATIONS PASSED' : '✗ VERIFICATION FAILED'}
          </h2>
          <p className="font-inter text-sm" style={{ color: G.goldDim }}>
            {isPerfectMagicSquare 
              ? 'All rows, columns, and diagonals sum to the Magic Constant'
              : 'Magic square validation failed - check Vefk construction formula'}
          </p>
        </div>

      </div>
    </div>
  );
}
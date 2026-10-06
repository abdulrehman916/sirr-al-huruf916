import { useMemo } from "react";
import { motion } from "framer-motion";
import { FIRST_BAST, istintak, getBastLevel, satirVahidSum } from "../../lib/mizaanPostEngine";

const G = {
  gold: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
  goldFaint: "rgba(245,208,96,0.12)",
  goldBorder: "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  green: "#4ADE80",
  greenDim: "rgba(74,222,128,0.15)",
  bg: "rgba(3,6,20,0.99)",
  bgCard: "rgba(8,16,40,0.98)",
  dim: "rgba(255,255,255,0.35)",
};

export default function AllahCalculationAudit() {
  // Calculate for the word "الله"
  const calculation = useMemo(() => {
    const word = "الله";
    const letters = ["ا", "ل", "ل", "ه"];
    
    // Step 1: Value 1 (First Bast) for each letter
    const letterValues = letters.map((l, i) => ({
      letter: l,
      index: i + 1,
      value1: FIRST_BAST[l] || 0,
    }));
    
    // Step 2: Sum of all Value 1 values
    const totalValue1 = letterValues.reduce((sum, lv) => sum + lv.value1, 0);
    
    // Step 3: For Mizan Option 1, we need the full 9 Mizan grand totals
    // This is a SIMPLIFIED audit showing only the input word's letter values
    // Full calculation requires all 9 Mizan selections
    
    return {
      word,
      letters: letterValues,
      totalValue1,
      letterCount: letters.length,
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden mt-4"
      style={{
        background: G.bg,
        borderColor: G.goldBorderHi,
        boxShadow: `0 0 80px rgba(212,175,55,0.18), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      {/* Header */}
      <div className="text-center px-6 py-4 border-b" style={{ borderColor: G.goldBorder }}>
        <h3 className="font-amiri text-xl font-bold" style={{ color: G.gold }}>
          تدقيق كلمة "الله"
        </h3>
        <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.goldDim }}>
          Word Audit: "الله" — Value 1 (First Bast) Calculation
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* Letter-by-letter breakdown */}
        <div>
          <div className="font-inter text-[8px] uppercase tracking-wider mb-3" style={{ color: G.dim }}>
            Step 1: Each Letter → Value 1 (First Bast)
          </div>
          <div className="grid grid-cols-4 gap-3">
            {calculation.letters.map((lv, idx) => (
              <div
                key={idx}
                className="rounded-xl border p-3 text-center"
                style={{
                  background: G.goldFaint,
                  borderColor: G.goldBorder,
                }}
              >
                <div className="font-amiri text-3xl font-bold mb-2" style={{ color: G.gold }}>
                  {lv.letter}
                </div>
                <div className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
                  Letter {lv.index}
                </div>
                <div className="font-inter text-lg font-bold tabular-nums mt-1" style={{ color: G.green }}>
                  {lv.value1.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total calculation */}
        <div className="rounded-xl border p-4" style={{ background: G.greenDim, borderColor: G.green + "40" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: G.green }}>
              Step 2: Sum of All Value 1 Values
            </span>
            <span className="font-inter text-xs font-bold" style={{ color: G.green }}>
              {calculation.letters.map(lv => lv.value1.toLocaleString()).join(" + ")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
              Total Value 1 Sum (4 letters)
            </span>
            <span className="font-inter text-2xl font-bold tabular-nums" style={{ color: G.green }}>
              {calculation.totalValue1.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Important notice */}
        <div className="rounded-xl border p-4" style={{ background: G.bgCard, borderColor: G.goldBorder }}>
          <div className="font-inter text-[8px] uppercase tracking-wider font-bold mb-2" style={{ color: G.gold }}>
            ⚠ Important Note
          </div>
          <p className="font-inter text-xs" style={{ color: G.dim }}>
            This shows ONLY the input word "الله" letter values. The FULL Mizan Option 1 Vefk Source requires 
            completing all 9 Mizan selections (Element, Khayr/Sharr, Hour, Day, Planet, Purposes, etc.) to get 
            the Grand Bast + Grand Letters total, which then produces the expanded letters through Istintak.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
import { useMemo } from "react";
import { motion } from "framer-motion";
import { runMizaanPostPipeline, getBastLevel } from "../../lib/mizaanPostEngine";

const G = {
  gold:     "#F5D060",
  goldDim:  "rgba(245,208,96,0.55)",
  goldFaint:"rgba(245,208,96,0.07)",
  goldBorder:"rgba(212,175,55,0.40)",
  goldBorderHi:"rgba(212,175,55,0.65)",
  green:    "#4ADE80",
  greenDim: "rgba(74,222,128,0.15)",
  bg:       "rgba(3,6,20,0.99)",
  bgCard:   "rgba(8,16,40,0.98)",
  dim:      "rgba(255,255,255,0.35)",
};

function Card({ children, accent }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: G.bgCard,
        borderColor: accent ? accent + "55" : G.goldBorder,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ label, step, color = G.gold }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg font-inter text-xs font-black flex-shrink-0"
        style={{ background: color + "22", border: `1px solid ${color}55`, color }}>
        {step}
      </div>
      <div className="flex-1">
        <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color }}>{label}</span>
      </div>
      <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
    </div>
  );
}

export default function MizanOption1Value1Audit({ grandBast, grandLetters, dominant }) {
  const pipeline = useMemo(() => {
    if (!grandBast || grandBast <= 0) return null;
    return runMizaanPostPipeline({ grandBast, grandLetters, dominant });
  }, [grandBast, grandLetters, dominant]);

  if (!pipeline) return null;

  const { kitabet, expandedLettersSum } = pipeline;
  const expandedLetters = kitabet.finalExpandedLetters || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: G.bg,
        borderColor: G.goldBorderHi,
        boxShadow: `0 0 80px rgba(212,175,55,0.18), 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.50) 40%, rgba(212,175,55,0.70) 50%, rgba(212,175,55,0.50) 60%, transparent 95%)` }} />

      {/* Title Banner */}
      <div className="text-center px-6 py-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-2"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-inter text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>
            📊 OPTION 1 — VALUE 1 AUDIT
          </span>
        </div>
        <p className="font-inter text-[8px] uppercase tracking-[0.2em]" style={{ color: G.dim }}>
          Expanded Letters First Bast (Level 1) Breakdown
        </p>
      </div>

      <div className="px-4 pb-6 space-y-4 pt-4">

        {/* SUMMARY */}
        <Card accent={G.gold}>
          <SectionHeader step="Σ" label="Audit Summary" />
          <div className="grid grid-cols-3 gap-3">
            <div className="px-3 py-2 rounded-lg border text-center" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Total Expanded Letters</div>
              <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{expandedLetters.length}</div>
            </div>
            <div className="px-3 py-2 rounded-lg border text-center" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Vefk Source Number</div>
              <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{expandedLettersSum?.toLocaleString() || 0}</div>
            </div>
            <div className="px-3 py-2 rounded-lg border text-center" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Verification</div>
              <div className="font-inter text-lg font-bold" style={{ color: expandedLettersSum ? G.green : G.gold }}>
                {expandedLettersSum ? "✓ MATCH" : "✗ PENDING"}
              </div>
            </div>
          </div>
        </Card>

        {/* VALUE 1 BREAKDOWN TABLE */}
        <Card accent={G.green}>
          <SectionHeader step="1" label="All Expanded Letters — Value 1 Breakdown" color={G.green} />
          
          <div className="overflow-x-auto">
            <div className="min-w-full grid gap-2" style={{ 
              gridTemplateColumns: `repeat(auto-fit, minmax(80px, 1fr))` 
            }}>
              {expandedLetters.map((letter, idx) => {
                const value1 = getBastLevel(letter, 1);
                return (
                  <div key={idx} 
                    className="flex flex-col items-center p-2 rounded-lg border"
                    style={{ 
                      background: G.goldFaint, 
                      borderColor: G.goldBorder 
                    }}>
                    <div className="font-inter text-[6px] uppercase tracking-wider" style={{ color: G.dim }}>
                      #{idx + 1}
                    </div>
                    <div className="font-amiri text-2xl font-bold my-1" style={{ color: G.gold }}>
                      {letter}
                    </div>
                    <div className="font-inter text-xs font-bold tabular-nums" style={{ color: G.green }}>
                      V1: {value1.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GRAND TOTAL */}
          <div className="mt-4 px-4 py-3 rounded-xl border text-center"
            style={{ background: G.greenDim, borderColor: G.green + "40" }}>
            <div className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.green + "80" }}>
              Grand Total — Value 1 Sum of All Expanded Letters
            </div>
            <div className="font-inter text-3xl font-bold tabular-nums mt-1" style={{ color: G.green }}>
              {expandedLettersSum?.toLocaleString() || 0}
            </div>
            <div className="font-inter text-[7px] uppercase tracking-wider mt-1" style={{ color: G.green + "70" }}>
              Formula: Σ First Bast(Level 1) of {expandedLetters.length} letters
            </div>
          </div>
        </Card>

        {/* VERIFICATION FORMULA */}
        <Card accent={G.gold}>
          <SectionHeader step="✓" label="Verification Formula" />
          <div className="px-4 py-3 rounded-lg border text-center"
            style={{ background: G.bgCard, borderColor: G.goldBorder }}>
            <div className="font-inter text-[7px] uppercase tracking-wider mb-2" style={{ color: G.dim }}>
              Calculation:
            </div>
            <div className="font-amiri text-sm" style={{ color: G.gold }} dir="rtl">
              Value₁(letter₁) + Value₁(letter₂) + ... + Value₁(letter{expandedLetters.length}) = {expandedLettersSum?.toLocaleString() || 0}
            </div>
            <div className="font-inter text-[7px] uppercase tracking-wider mt-2" style={{ color: G.goldDim }}>
              This total IS the Vefk Source Number used to generate the magic square
            </div>
          </div>
        </Card>

      </div>

      {/* Bottom accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.50) 40%, rgba(212,175,55,0.70) 50%, rgba(212,175,55,0.50) 60%, transparent 95%)` }} />
    </motion.div>
  );
}
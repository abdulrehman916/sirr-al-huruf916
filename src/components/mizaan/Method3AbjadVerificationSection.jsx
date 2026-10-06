// ═══════════════════════════════════════════════════════════════
// METHOD 3 — FINAL VERIFICATION STEP (Abjad Kabir)
// ─────────────────────────────────────────────────────────────
// NOT a new pipeline. NOT another Esma section. NO Bast derivation.
// Flow: Final Total → Istintak (number → letters) → Letters →
//       Abjad Kabir calculation → Final Abjad Kabir Total
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { motion } from "framer-motion";
import { istintak } from "../../lib/mizaanPostEngine";
import { calculateAbjad, getAbjadValue } from "../../lib/abjadValues";

const G = {
  gold:         "#F5D060",
  goldDim:      "rgba(245,208,96,0.55)",
  goldFaint:    "rgba(212,175,55,0.07)",
  goldBorder:   "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  glow:         "rgba(212,175,55,0.18)",
  bg:           "rgba(3,6,20,0.99)",
  bgInner:      "rgba(212,175,55,0.06)",
  dim:          "rgba(255,255,255,0.35)",
};

export default function Method3AbjadVerificationSection({ finalTotal, elementColor = G.gold, onAbjadTotalReady }) {
  const safeFinalTotal = finalTotal || 0;

  // Same deterministic functions used for the Divine Name lookup — computed here ONCE
  // and reported upward so the lookup section uses this exact same value (no recomputation drift).
  const letters    = safeFinalTotal ? istintak(safeFinalTotal) : [];
  const lettersStr  = Array.isArray(letters) ? letters.join('') : '';
  const abjadTotal  = safeFinalTotal ? calculateAbjad(lettersStr) : 0;

  // Report this exact value upward so the Divine Name lookup uses this same computed
  // value — not a separately recomputed one — guaranteeing the two never drift apart.
  useEffect(() => {
    if (onAbjadTotalReady) onAbjadTotalReady(abjadTotal);
  }, [abjadTotal, onAbjadTotalReady]);

  if (!safeFinalTotal) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:  G.bg,
        borderColor: G.goldBorderHi,
        boxShadow:   `0 0 80px ${G.glow}, 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />

      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-3"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
          <span className="font-inter text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Final Verification — Abjad Kabir</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
        <p className="font-inter text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: G.goldDim }}>Final Total → Letters → Abjad Kabir</p>
      </div>

      <div className="px-4 pb-6 space-y-4 pt-2">

        <div className="rounded-xl border p-4 space-y-4"
          style={{
            background: "rgba(6,14,36,0.98)",
            borderColor: elementColor + "55",
            borderLeft: `3px solid ${elementColor}`,
            boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
          }}>

          {/* Step 1: Final Total */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg border"
            style={{ background: G.bgInner, borderColor: G.goldBorder + "55" }}>
            <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Final Total</span>
            <span className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{safeFinalTotal.toLocaleString()}</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className="h-4 w-px" style={{ background: G.goldBorder }} />
            <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>Istintak</span>
            <span className="font-inter text-base" style={{ color: G.goldDim }}>↓</span>
          </div>

          {/* Step 2: Letters */}
          <div className="space-y-2">
            <div className="font-inter text-[8px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>
              Letters (Istintak of {safeFinalTotal.toLocaleString()})
            </div>
            <div className="flex flex-wrap gap-3 justify-center" style={{ direction: "rtl" }}>
              {letters.map((l, i) => (
                <span key={i}
                  className="font-amiri font-bold rounded-lg border px-4 py-3 text-3xl leading-relaxed"
                  style={{ color: elementColor, borderColor: elementColor + "55", background: elementColor + "12", lineHeight: 1.8 }}>
                  {l}
                </span>
              ))}
            </div>
            <div className="text-center font-inter text-[8px]" style={{ color: G.dim }}>
              Letter Count: <span style={{ color: G.gold, fontWeight: "bold" }}>{letters.length}</span> — Order: <span style={{ color: G.gold }} dir="rtl">{lettersStr}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className="h-4 w-px" style={{ background: G.goldBorder }} />
            <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>Abjad Kabir — letter by letter</span>
            <span className="font-inter text-base" style={{ color: G.goldDim }}>↓</span>
          </div>

          {/* Step 3: Per-letter Abjad Kabir values — full line-by-line calculation */}
          <div className="space-y-1.5">
            <div className="font-inter text-[8px] uppercase tracking-widest font-bold text-center" style={{ color: G.dim }}>
              Line-by-Line Calculation
            </div>
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: G.goldBorder + "40" }}>
              {letters.map((l, i) => {
                const val = getAbjadValue(l);
                const runningSum = letters.slice(0, i + 1).reduce((s, ltr) => s + getAbjadValue(ltr), 0);
                return (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5"
                    style={{ background: i % 2 === 0 ? G.bgInner : "transparent", borderBottom: i < letters.length - 1 ? `1px solid ${G.goldBorder}25` : "none" }}>
                    <span className="font-inter text-[9px]" style={{ color: G.dim }}>
                      Letter {i + 1} of {letters.length}
                    </span>
                    <span className="font-amiri text-lg" dir="rtl" style={{ color: elementColor }}>{l}</span>
                    <span className="font-inter text-[10px] tabular-nums" style={{ color: G.gold }}>= {val.toLocaleString()}</span>
                    <span className="font-inter text-[9px] tabular-nums" style={{ color: G.dim }}>
                      running total: <span style={{ color: G.gold, fontWeight: "bold" }}>{runningSum.toLocaleString()}</span>
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-center font-inter text-[8px]" style={{ color: G.dim }}>
              Formula: {letters.map(l => getAbjadValue(l)).join(' + ')} = {abjadTotal.toLocaleString()}
            </div>
          </div>

          {/* Step 4: Final Abjad Kabir Total */}
          <div className="text-center pt-1 border-t" style={{ borderColor: G.goldBorder + "30" }}>
            <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Final Abjad Kabir Total</span>
            <div className="font-inter text-lg font-black tabular-nums" style={{ color: G.gold }}>{abjadTotal.toLocaleString()}</div>
          </div>

        </div>

      </div>

      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
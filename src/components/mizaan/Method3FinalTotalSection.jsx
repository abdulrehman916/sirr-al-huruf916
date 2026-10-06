// ═══════════════════════════════════════════════════════════════
// METHOD 3 — SECTION 4: FINAL TOTAL DERIVATION
// ─────────────────────────────────────────────────────────────
// Pure summary box — same Formula Box design as Sections 1–3.
// Final Total = Nine Mizan Total + Esma-i Kitabet Total + Esma-i Kasem Total
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";

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

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${G.goldBorder})` }} />
      <span style={{ color: G.goldDim, fontSize: 10 }}>✦</span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${G.goldBorder})` }} />
    </div>
  );
}

export default function Method3FinalTotalSection({ nineMizanTotal, kitabetInputTotal, kasemInputTotal, elementColor = G.gold }) {
  const safeNineMizan = nineMizanTotal || 0;
  const safeKitabet   = kitabetInputTotal || 0;
  const safeKasem     = kasemInputTotal || 0;
  const finalTotal    = safeNineMizan + safeKitabet + safeKasem;

  if (!finalTotal) return null;

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
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />

      {/* Title Banner */}
      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-3"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
          <span className="font-inter text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Section 4 — Final Total Derivation</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
        <p className="font-inter text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: G.goldDim }}>Summary Derivation</p>
      </div>

      <OrnamentalDivider />

      <div className="px-4 pb-6 space-y-5 pt-4">

        {/* ── Formula Box — identical design to Sections 1–3 ── */}
        <div className="rounded-xl border p-4 space-y-4"
          style={{
            background: "rgba(6,14,36,0.98)",
            borderColor: elementColor + "55",
            borderLeft: `3px solid ${elementColor}`,
            boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
          }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg font-inter text-xs font-black flex-shrink-0"
              style={{ background: elementColor + "22", border: `1px solid ${elementColor}55`, color: elementColor }}>S</div>
            <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: elementColor }}>
              Method 3 Source — Final Total Derivation
            </span>
          </div>

          <div className="rounded-xl border p-3 space-y-3" style={{ background: G.bgInner, borderColor: G.goldBorder + "40" }}>
            <div className="font-inter text-[8px] uppercase tracking-widest font-bold text-center" style={{ color: G.dim }}>Formula</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="space-y-1">
                <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Nine Mizan Total</div>
                <div className="font-inter text-sm font-bold tabular-nums" style={{ color: elementColor }}>{safeNineMizan.toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Esma-i Kitabet Total</div>
                <div className="font-inter text-sm font-bold tabular-nums" style={{ color: G.gold }}>{safeKitabet.toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Esma-i Kasem Total</div>
                <div className="font-inter text-sm font-bold tabular-nums" style={{ color: G.gold }}>{safeKasem.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-center pt-1 border-t" style={{ borderColor: G.goldBorder + "30" }}>
              <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Final Total</span>
              <div className="font-inter text-lg font-black tabular-nums" style={{ color: G.gold }}>{finalTotal.toLocaleString()}</div>
              </div>
              </div>

              </div>

      </div>

      {/* Bottom accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
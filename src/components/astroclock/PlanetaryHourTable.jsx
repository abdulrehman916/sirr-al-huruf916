// ═══════════════════════════════════════════════════
// PLANETARY HOUR TABLE COMPONENT
// Completely independent. No shared logic.
// ═══════════════════════════════════════════════════

import { motion } from "framer-motion";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
};

export default function PlanetaryHourTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: 0.1 }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      <p className="font-inter text-[9px] uppercase tracking-[0.26em] text-center mb-4" style={{ color: G.dim }}>
        ✦ Planetary Hours Table
      </p>

      <div className="rounded-xl border p-6 text-center"
        style={{ background: G.bg, borderColor: G.faint }}>
        <p className="font-inter text-[10px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
          Framework Placeholder
        </p>
        <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
          Planetary hour calculations will be added from PDF manuscript sources.
        </p>
        <p className="font-inter text-xs mt-2" style={{ color: "rgba(255,255,255,0.30)" }}>
          Table structure ready for implementation.
        </p>
      </div>
    </motion.div>
  );
}
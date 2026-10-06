// ═══════════════════════════════════════════════════
// ASTRO CLOCK CARD COMPONENT
// Completely independent. No shared logic.
// ═══════════════════════════════════════════════════

import { motion } from "framer-motion";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
};

export default function AstroClockCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 40px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.40), transparent)` }} />

      {title && (
        <p className="font-inter text-[9px] uppercase tracking-[0.22em] text-center mb-3" style={{ color: G.dim }}>
          {title}
        </p>
      )}

      <div className="h-px w-full mb-3"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent)` }} />

      {children}
    </motion.div>
  );
}
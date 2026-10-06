// ═══════════════════════════════════════════════════
// ASTRO CLOCK DISPLAY COMPONENT
// Completely independent. No shared logic.
// ═══════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
};

export default function AstroClockDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38 }}
      className="rounded-2xl border p-6 text-center relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      <p className="font-inter text-[9px] uppercase tracking-[0.26em] text-center mb-4" style={{ color: G.dim }}>
        ✦ Astro Clock Framework
      </p>

      <div className="space-y-4">
        <div className="py-8">
          <p className="font-inter text-[10px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            Current Time
          </p>
          <p className="font-inter font-bold text-4xl" style={{ color: G.text }}>
            {currentTime.toLocaleTimeString()}
          </p>
        </div>

        <div className="rounded-xl border p-4"
          style={{ background: G.dim, borderColor: G.border }}>
          <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.30)" }}>
            Framework Status
          </p>
          <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.60)" }}>
            Astro Clock module initialized. PDF-based calculations and rules will be added from manuscript sources.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
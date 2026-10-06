import { useMemo } from "react";
import { motion } from "framer-motion";
import { runMizaanPostPipeline } from "../../lib/mizaanPostEngine";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  bg:       "rgba(212,175,55,0.07)",
  border:   "rgba(212,175,55,0.40)",
};

export default function MizaanPostResults({ grandBast, grandLetters, dominant }) {
  const pipeline = useMemo(() => {
    if (!grandBast || grandBast <= 0) return null;
    return runMizaanPostPipeline({ grandBast, grandLetters, dominant });
  }, [grandBast, grandLetters, dominant]);

  if (!pipeline) return null;

  const { input, initialSeedLetters } = pipeline;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: "rgba(3,6,20,0.99)", borderColor: G.borderHi, boxShadow: `0 0 60px ${G.glow}, 0 0 120px rgba(0,0,0,0.6)` }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="font-amiri text-2xl font-bold" style={{ color: G.text }}>Pipeline Input</h2>
        <div className="h-px w-24 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${G.borderHi}, transparent)` }} />
      </div>

      {/* Pipeline values */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl border"
          style={{ background: G.bg, borderColor: G.border }}>
          <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Grand Bast (Σ 9 Mizans)</span>
          <span className="font-inter text-lg font-bold tabular-nums" style={{ color: G.text }}>{input.grandBast.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between px-4 py-3 rounded-xl border"
          style={{ background: G.bg, borderColor: G.border }}>
          <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Grand Letters (Σ 9 Mizans)</span>
          <span className="font-inter text-lg font-bold tabular-nums" style={{ color: G.text }}>{input.grandLetters}</span>
        </div>
        
        <div className="flex items-center justify-between px-4 py-3 rounded-xl border"
          style={{ background: G.bg, borderColor: G.border }}>
          <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Satır Vahid Total</span>
          <span className="font-inter text-lg font-bold tabular-nums" style={{ color: G.text }}>{input.satirVahidTotal.toLocaleString()}</span>
        </div>
        
        <div className="px-4 py-3 rounded-xl border"
          style={{ background: G.bg, borderColor: G.border }}>
          <span className="font-inter text-[8px] uppercase tracking-widest block mb-2" style={{ color: G.dim }}>Initial Seed Letters</span>
          <div className="flex flex-wrap gap-1 justify-center" dir="ltr">
            {[...initialSeedLetters].reverse().map((l, i) => (
              <span key={i} className="font-amiri text-xl px-3 py-1.5 rounded-lg border"
                style={{ color: G.text, borderColor: G.border, background: "rgba(212,175,55,0.04)" }}
                dir="rtl">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
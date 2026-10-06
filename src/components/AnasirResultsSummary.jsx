import { motion } from "framer-motion";
import { Hash } from "lucide-react";

const ELEMENT_CONFIG = {
  fire:  { label: "Fire",  color: "#f97316", glow: "rgba(249,115,22,0.22)",  border: "rgba(249,115,22,0.28)",  bg: "rgba(249,115,22,0.07)",  icon: "🔥" },
  air:   { label: "Air",   color: "#7dd3fc", glow: "rgba(125,211,252,0.2)",  border: "rgba(125,211,252,0.25)", bg: "rgba(125,211,252,0.06)", icon: "💨" },
  water: { label: "Water", color: "#60a5fa", glow: "rgba(96,165,250,0.22)",  border: "rgba(96,165,250,0.28)",  bg: "rgba(96,165,250,0.07)",  icon: "💧" },
  earth: { label: "Earth", color: "#4ade80", glow: "rgba(74,222,128,0.2)",   border: "rgba(74,222,128,0.25)", bg: "rgba(74,222,128,0.06)",  icon: "🌍" },
};

export default function AnasirResultsSummary({ counts, total, dominant }) {
  if (!total) return null;

  return (
    <div className="space-y-4">
      {/* Total Letters card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.35 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-2 shadow-xl cursor-default hover:border-white/20 transition-colors duration-200"
      >
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Hash className="w-5 h-5 text-white/60" />
        </div>
        <span className="font-inter text-xs text-white/40 uppercase tracking-widest">Total Letters</span>
        <span className="font-amiri text-4xl font-bold text-white">{total}</span>
      </motion.div>

      {/* 4 Element cards */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(ELEMENT_CONFIG).map(([key, el], i) => {
          const isDominant = dominant === key;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, boxShadow: `0 8px 32px ${el.glow}` }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="rounded-2xl p-5 flex flex-col items-center gap-2 border cursor-default transition-colors duration-200"
              style={{
                background: isDominant ? el.bg : "rgba(255,255,255,0.03)",
                borderColor: isDominant ? el.border : "rgba(255,255,255,0.08)",
                boxShadow: isDominant ? `0 4px 28px ${el.glow}` : "none",
              }}
            >
              <span className="text-2xl">{el.icon}</span>
              <span className="font-inter text-xs uppercase tracking-widest" style={{ color: isDominant ? el.color : "rgba(255,255,255,0.35)" }}>
                {el.label}
              </span>
              <span className="font-amiri text-4xl font-bold" style={{ color: isDominant ? el.color : "rgba(255,255,255,0.75)" }}>
                {counts[key]}
              </span>
              {isDominant && (
                <span
                  className="font-inter text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-semibold"
                  style={{ color: el.color, borderColor: el.border, background: el.bg }}
                >
                  Dominant
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
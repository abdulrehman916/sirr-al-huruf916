import { motion } from "framer-motion";
import MizaanHeader from "./MizaanHeader";
import { MIZAAN_ELEMENTS } from "../../lib/mizaan9Engine";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)", glowHi: "rgba(212,175,55,0.55)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)",
};

const EL = {
  fire:  { color: "#FF6B35", glow: "rgba(255,107,53,0.35)",  bg: "rgba(255,107,53,0.10)",  border: "rgba(255,107,53,0.40)" },
  earth: { color: "#A5C880", glow: "rgba(165,200,128,0.35)", bg: "rgba(165,200,128,0.08)", border: "rgba(165,200,128,0.40)" },
  air:   { color: "#B2EBF2", glow: "rgba(178,235,242,0.30)", bg: "rgba(178,235,242,0.06)", border: "rgba(178,235,242,0.35)" },
  water: { color: "#4FC3F7", glow: "rgba(79,195,247,0.35)",  bg: "rgba(79,195,247,0.10)",  border: "rgba(79,195,247,0.40)" },
};

export default function Mizaan1({ result, inputMode = "text" }) {
  const { bast1Total, letterCount, counts, percentages, dominant } = result;
  const isDirectNumber = inputMode === "number";
  const sorted = Object.entries(MIZAAN_ELEMENTS)
    .map(([k, el]) => ({ k, el, pct: percentages[k] ?? 0, cnt: counts[k] ?? 0 }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: "rgba(6,14,36,0.98)", borderColor: G.borderHi, boxShadow: `0 0 40px ${G.glow}` }}>
      <MizaanHeader number="١" titleAR="الميزان الأول — بسط الأول" titleTR="First Mizan · Bast-ul Aval" />

      {/* Totals row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4 text-center"
          style={{ background: "rgba(4,10,28,0.95)", borderColor: G.borderHi, boxShadow: `0 0 24px ${G.glow}` }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>Bast-ul Aval</p>
          <motion.p className="font-inter font-bold tabular-nums"
            style={{ fontSize: "clamp(1.8rem,8vw,2.8rem)", color: G.text }}
            animate={{ textShadow: [`0 0 14px ${G.glow}`, `0 0 36px ${G.glowHi}`, `0 0 14px ${G.glow}`] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            {bast1Total.toLocaleString()}
          </motion.p>
        </div>
        <div className="rounded-xl border p-4 text-center"
          style={{ background: "rgba(4,10,28,0.95)", borderColor: G.border }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>Harf Sayısı</p>
          {isDirectNumber ? (
            <p className="font-inter font-bold" style={{ fontSize: "clamp(1.2rem,5vw,1.8rem)", color: G.dim }}>N/A</p>
          ) : (
            <p className="font-inter font-bold text-white tabular-nums"
              style={{ fontSize: "clamp(1.8rem,8vw,2.8rem)" }}>{letterCount}</p>
          )}
        </div>
      </div>

      {/* Anasir percentage bars */}
      <div className="space-y-2">
        {sorted.map(({ k, el, pct, cnt }, i) => {
          const s = EL[k];
          const isDom = k === dominant;
          return (
            <motion.div key={k}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i }}
              className="rounded-xl border px-4 py-2.5"
              style={{
                background: isDom ? s.bg : "rgba(255,255,255,0.02)",
                borderColor: isDom ? s.border : "rgba(255,255,255,0.07)",
                opacity: pct === 0 ? 0.3 : 1,
              }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: isDom ? "1.2rem" : "0.9rem" }}>{el.icon}</span>
                  <span className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: isDom ? s.color : `${s.color}88` }}>{el.labelTR}</span>
                  <span className="font-amiri text-sm" style={{ color: isDom ? s.color : `${s.color}55` }}>{el.arabic}</span>
                  {isDom && <span className="font-inter text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border" style={{ color: s.color, borderColor: s.border, background: s.bg }}>Galip</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-inter text-xs font-bold tabular-nums" style={{ color: isDom ? s.color : `${s.color}77` }}>{cnt}</span>
                  <span className="font-inter font-bold tabular-nums" style={{ fontSize: isDom ? "0.95rem" : "0.7rem", color: isDom ? s.color : `${s.color}66` }}>{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 + i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ background: s.color, boxShadow: isDom ? `0 0 8px ${s.glow}` : "none" }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
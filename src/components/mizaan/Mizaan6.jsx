import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MizaanHeader from "./MizaanHeader";
import { MIZAAN_PLANETS_ALL } from "../../lib/mizaan9Data";
import { getCurrentKawkab, subscribeSaatPlanningContext } from "../../lib/mizaanSaatCalculator";

const G = { borderHi: "rgba(212,175,55,0.65)", glow: "rgba(212,175,55,0.22)", text: "#F5D060", dim: "rgba(212,175,55,0.55)" };

export default function Mizaan6({ selectedDay, selected, onChange, planetsData }) {
  // Auto "NOW" Kawkab = the Astro Clock's current planetary-hour ruler.
  // Reuses the exact Astro Clock engine (getCurrentPlanetaryHour) via
  // getCurrentKawkab() — no duplicate algorithm, no DAY_PLANET_MAP.
  // Re-evaluated every 60s so the Kawkab follows the Saat as it changes.
  // Manual selection (selected / onChange) is unchanged.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15000);
    const unsub = subscribeSaatPlanningContext(() => setTick((t) => t + 1));
    return () => { clearInterval(id); unsub(); };
  }, []);
  const autoKey = getCurrentKawkab();
  const toggle  = (key) => onChange(selected === key ? null : key);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: "rgba(6,14,36,0.98)", borderColor: G.borderHi, boxShadow: `0 0 40px ${G.glow}` }}>
      <MizaanHeader number="٦" titleAR="الميزان السادس — الكواكب" titleTR="Sixth Mizan · Planets" />
      <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
        Detected from day · tap to change
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {(planetsData ?? MIZAAN_PLANETS_ALL).map((p, i) => {
          const isAuto     = p.key === autoKey;
          const isSelected = selected === p.key;
          const col        = p.color;
          return (
            <motion.button key={p.key}
              onClick={() => toggle(p.key)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: isSelected || isAuto ? 1 : 0.28,
                boxShadow: isSelected
                  ? [`0 0 20px ${col}55`, `0 0 40px ${col}99`, `0 0 20px ${col}55`]
                  : "none",
              }}
              transition={{
                opacity:   { duration: 0.35, delay: i * 0.04 },
                boxShadow: isSelected ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
              }}
              whileTap={{ scale: 0.92 }}
              className="rounded-xl border p-3 flex flex-col items-center gap-1.5 text-center cursor-pointer"
              style={{
                background:  isSelected ? `${col}18` : isAuto ? `${col}08` : "rgba(255,255,255,0.02)",
                borderColor: isSelected ? `${col}99` : isAuto ? `${col}44` : "rgba(255,255,255,0.06)",
                borderWidth: isSelected ? 2 : 1,
              }}>
              <motion.span
                style={{ fontSize: isSelected ? "2rem" : "1.5rem", lineHeight: 1 }}
                animate={isSelected ? {
                  filter: [`drop-shadow(0 0 6px ${col}88)`, `drop-shadow(0 0 18px ${col})`, `drop-shadow(0 0 6px ${col}88)`]
                } : { filter: "none" }}
                transition={isSelected ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}>
                {p.icon}
              </motion.span>
              <p className="font-amiri text-sm leading-tight"
                style={{ color: isSelected ? col : isAuto ? `${col}99` : `${col}44` }}>
                {p.arabic}
              </p>
              <p className="font-inter text-[9px] font-bold tabular-nums"
                style={{ color: isSelected ? col : "rgba(255,255,255,0.18)" }}>
                {p.bast.toLocaleString()}
              </p>
              {isAuto && (
                <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: col, opacity: 0.75 }}>Current ◉</span>
              )}
              {isSelected && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="font-inter text-[7px] uppercase tracking-widest"
                  style={{ color: col }}>
                  ✓ Selected
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MizaanHeader from "./MizaanHeader";
import { MIZAAN_DAYS } from "../../lib/mizaan9Data";
import { getCurrentWeekdayKey, subscribeSaatPlanningContext } from "../../lib/mizaanSaatCalculator";

const G = { borderHi: "rgba(212,175,55,0.65)", glow: "rgba(212,175,55,0.22)", text: "#F5D060", dim: "rgba(212,175,55,0.55)" };

export default function Mizaan5({ selected, onChange, daysData }) {
  // Periodic re-render so "Today ◉" tracks the sunset-aware manuscript day.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15000);
    const unsub = subscribeSaatPlanningContext(() => setTick((t) => t + 1));
    return () => { clearInterval(id); unsub(); };
  }, []);
  const autoDay = getCurrentWeekdayKey();
  const toggle  = (key) => onChange(selected === key ? null : key);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: "rgba(6,14,36,0.98)", borderColor: G.borderHi, boxShadow: `0 0 40px ${G.glow}` }}>
      <MizaanHeader number="٥" titleAR="الميزان الخامس — الأيام" titleTR="Fifth Mizan · Days" />
      <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
        Auto-detected · tap to change
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {(daysData ?? MIZAAN_DAYS).map((d, i) => {
          const isAuto     = d.key === autoDay;
          const isSelected = selected === d.key;
          const col        = d.color;
          return (
            <motion.button key={d.key}
              onClick={() => toggle(d.key)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: isSelected || isAuto ? 1 : 0.28,
                boxShadow: isSelected
                  ? [`0 0 18px ${col}55`, `0 0 36px ${col}99`, `0 0 18px ${col}55`]
                  : "none",
              }}
              transition={{
                opacity:   { duration: 0.3, delay: i * 0.04 },
                boxShadow: isSelected ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
              }}
              whileTap={{ scale: 0.92 }}
              className="rounded-xl border p-3 flex flex-col items-center gap-1.5 text-center cursor-pointer"
              style={{
                background:  isSelected ? `${col}14` : isAuto ? `${col}08` : "rgba(255,255,255,0.02)",
                borderColor: isSelected ? `${col}99` : isAuto ? `${col}44` : "rgba(255,255,255,0.06)",
                borderWidth: isSelected ? 2 : 1,
              }}>
              <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{d.icon}</span>
              <span className="font-amiri text-sm leading-tight"
                style={{ color: isSelected ? col : isAuto ? `${col}99` : `${col}44` }}>
                {d.arabic}
              </span>
              <span className="font-inter text-[9px] font-bold tabular-nums"
                style={{ color: isSelected ? col : "rgba(255,255,255,0.18)" }}>
                {d.bast.toLocaleString()}
              </span>
              {isAuto && !isSelected && (
                <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: col, opacity: 0.75 }}>Today ◉</span>
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
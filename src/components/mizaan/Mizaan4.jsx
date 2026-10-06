import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MizaanHeader from "./MizaanHeader";
import { MIZAAN_HOURS } from "../../lib/mizaan9Data";
import { getCurrentSaat, subscribeSaatPlanningContext } from "../../lib/mizaanSaatCalculator";

const G = { borderHi: "rgba(212,175,55,0.65)", glow: "rgba(212,175,55,0.22)", glowHi: "rgba(212,175,55,0.45)", text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.20)" };

export default function Mizaan4({ selected, onChange, hoursData, dayNight }) {
  // Periodic re-render so the "Now ◉" marker tracks the real current Sahat
  // as time progresses — without this, autoHour is frozen at mount time.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15000);
    const unsub = subscribeSaatPlanningContext(() => setTick((t) => t + 1));
    return () => { clearInterval(id); unsub(); };
  }, []);
  const autoHour = getCurrentSaat(dayNight);
  const toggle = (hour) => onChange(selected === hour ? null : hour);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: "rgba(6,14,36,0.98)", borderColor: G.borderHi, boxShadow: `0 0 40px ${G.glow}` }}>
      <MizaanHeader number="٤" titleAR="الميزان الرابع — الساعات" titleTR="Fourth Mizan · Hours" />
      <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
        Auto-detected · tap to change
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {(hoursData ?? MIZAAN_HOURS).map((h, i) => {
          const isAuto     = h.hour === autoHour;
          const isSelected = selected === h.hour;
          return (
            <motion.button key={h.hour}
              onClick={() => toggle(h.hour)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: isSelected || isAuto ? 1 : 0.28,
                boxShadow: isSelected
                  ? [`0 0 18px ${G.glow}`, `0 0 36px ${G.glowHi}`, `0 0 18px ${G.glow}`]
                  : "none",
              }}
              transition={{
                opacity:   { duration: 0.35, delay: i * 0.025 },
                boxShadow: isSelected ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
              }}
              whileTap={{ scale: 0.93 }}
              className="rounded-xl border p-3 flex flex-col items-center gap-1.5 text-center cursor-pointer"
              style={{
                background:   isSelected ? "rgba(212,175,55,0.13)" : isAuto ? "rgba(212,175,55,0.05)" : "rgba(255,255,255,0.02)",
                borderColor:  isSelected ? G.borderHi : isAuto ? G.faint : "rgba(255,255,255,0.06)",
                borderWidth:  isSelected ? 2 : 1,
              }}>
              <span className="font-inter text-[10px] font-bold tabular-nums"
                style={{ color: isSelected ? G.text : isAuto ? G.dim : "rgba(255,255,255,0.25)" }}>
                {h.hour}
              </span>
              <span className="font-amiri text-sm leading-tight text-center"
                style={{ color: isSelected ? G.text : isAuto ? `${G.text}99` : "rgba(255,255,255,0.22)" }}>
                {h.arabic}
              </span>
              <span className="font-inter text-[9px] font-bold tabular-nums"
                style={{ color: isSelected ? G.dim : "rgba(255,255,255,0.18)" }}>
                {h.bast.toLocaleString()}
              </span>
              {isAuto && !isSelected && (
                <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim, opacity: 0.75 }}>Now ◉</span>
              )}
              {isSelected && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="font-inter text-[7px] uppercase tracking-widest"
                  style={{ color: G.text }}>
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
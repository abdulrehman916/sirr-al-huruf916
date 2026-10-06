import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MizaanHeader from "./MizaanHeader";
import { MIZAAN_DAYNIGHT_FULL } from "../../lib/mizaan9Data";
import { getCurrentLaylNahar, subscribeSaatPlanningContext } from "../../lib/mizaanSaatCalculator";

const G = { borderHi: "rgba(212,175,55,0.65)", glow: "rgba(212,175,55,0.22)", text: "#F5D060", dim: "rgba(212,175,55,0.55)" };

export default function Mizaan3({ dominant, selected, onChange, dayNightData }) {
  // Periodic re-render so "Current ◉" tracks the real day/night boundary.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15000);
    const unsub = subscribeSaatPlanningContext(() => setTick((t) => t + 1));
    return () => { clearInterval(id); unsub(); };
  }, []);
  const currentDN = getCurrentLaylNahar();
  const toggle = (key) => onChange(selected === key ? null : key);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: "rgba(6,14,36,0.98)", borderColor: G.borderHi, boxShadow: `0 0 40px ${G.glow}` }}>
      <MizaanHeader number="٣" titleAR="الميزان الثالث — النهار والليل" titleTR="Third Mizan · Day & Night" />
      <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
        Tap to select
      </p>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(dayNightData ?? MIZAAN_DAYNIGHT_FULL).map(([key, item], i) => {
          const isSuggested = item.elements.includes(dominant);
          const isSelected  = selected === key;
          return (
            <motion.button key={key}
              onClick={() => toggle(key)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: isSelected || isSuggested ? 1 : 0.35,
                boxShadow: isSelected
                  ? [`0 0 20px ${item.glow}`, `0 0 40px ${item.glow}`, `0 0 20px ${item.glow}`]
                  : "none",
              }}
              transition={{
                opacity: { duration: 0.4, delay: 0.08 * i },
                boxShadow: isSelected ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
              }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl border p-5 flex flex-col items-center gap-2 text-center cursor-pointer"
              style={{
                background: isSelected ? item.bg : "rgba(255,255,255,0.02)",
                borderColor: isSelected ? item.border : isSuggested ? `${item.border}55` : "rgba(255,255,255,0.07)",
                borderWidth: isSelected ? 2 : 1,
              }}>
              <span style={{ fontSize: "2rem" }}>{item.icon}</span>
              <p className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: isSelected ? item.color : `${item.color}44` }}>{item.label}</p>
              <p className="font-amiri text-2xl font-bold" style={{ color: isSelected ? item.color : `${item.color}44` }}>{item.arabic}</p>
              <p className="font-inter text-sm font-bold tabular-nums" style={{ color: isSelected ? item.color : `${item.color}44` }}>{item.bast.toLocaleString()}</p>
              <p className="font-inter text-[9px] italic" style={{ color: isSelected ? item.color : `${item.color}33`, opacity: 0.8 }}>{item.desc}</p>
              {key === currentDN && !isSelected && (
                <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: item.color, opacity: 0.75 }}>Current ◉</span>
              )}
              {isSuggested && !isSelected && (
                <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: item.color, opacity: 0.7 }}>Suggested</span>
              )}
              {isSelected && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="font-inter text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
                  style={{ color: item.color, borderColor: item.border, background: item.bg }}>
                  Selected ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
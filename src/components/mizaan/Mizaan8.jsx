import { useEffect } from "react";
import { motion } from "framer-motion";
import MizaanHeader from "./MizaanHeader";

const G = { borderHi: "rgba(212,175,55,0.65)", glow: "rgba(212,175,55,0.22)", text: "#F5D060", dim: "rgba(212,175,55,0.55)" };

const KHAYR_SHARR = [
  {
    key: 'khayr',
    arabic: 'الخير',
    icon: '✨',
    bast: 2731, // ا(16)+ل(1097)+خ(522)+ي(579)+ر(517) = 2731
    color: '#4ADE80',
    glow: 'rgba(74,222,128,0.40)',
    bg: 'rgba(74,222,128,0.10)',
    border: 'rgba(74,222,128,0.50)',
  },
  {
    key: 'sharr',
    arabic: 'الشر',
    icon: '⚡',
    bast: 2725, // ا(16)+ل(1097)+ش(1095)+ر(517) = 2725
    color: '#F87171',
    glow: 'rgba(248,113,113,0.40)',
    bg: 'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.50)',
  },
];

// Purpose keys that map to Khayr
const KHAYR_PURPOSES = ['celb', 'sihhat', 'tarfet'];
// Purpose keys that map to Sharr
const SHARR_PURPOSES = ['tard', 'sekam'];

export default function Mizaan8({ selected, onChange, selectedPurpose, khayrSharr8Data }) {
  // Auto-select based on Mizaan 7 purposes (array)
  useEffect(() => {
    const arr = Array.isArray(selectedPurpose) ? selectedPurpose : (selectedPurpose ? [selectedPurpose] : []);
    if (!arr.length) return;
    const hasKhayr = arr.some(k => KHAYR_PURPOSES.includes(k));
    const hasSharr = arr.some(k => SHARR_PURPOSES.includes(k));
    if (hasKhayr && !hasSharr) onChange('khayr');
    else if (hasSharr && !hasKhayr) onChange('sharr');
    // mixed — leave unchanged
  }, [selectedPurpose]);

  const toggle = (key) => onChange(selected === key ? null : key);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: "rgba(6,14,36,0.98)", borderColor: G.borderHi, boxShadow: `0 0 40px ${G.glow}` }}>
      <MizaanHeader number="٨" titleAR="الميزان الثامن — الخير والشر" titleTR="Eighth Mizan · Khayr & Sharr" />
      <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
        Auto-detected · tap to change
      </p>

      <div className="grid grid-cols-2 gap-4">
        {KHAYR_SHARR.map((item, i) => {
          const isSelected = selected === item.key;
          const col = item.color;
          return (
            <motion.button key={item.key}
              onClick={() => toggle(item.key)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: isSelected ? 1 : 0.3,
                boxShadow: isSelected
                  ? [`0 0 22px ${item.glow}`, `0 0 44px ${item.glow}`, `0 0 22px ${item.glow}`]
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
                borderColor: isSelected ? item.border : "rgba(255,255,255,0.07)",
                borderWidth: isSelected ? 2 : 1,
              }}>
              <motion.span
                style={{ fontSize: "2.8rem", lineHeight: 1 }}
                animate={isSelected ? {
                  filter: [`drop-shadow(0 0 6px ${item.glow})`, `drop-shadow(0 0 20px ${col})`, `drop-shadow(0 0 6px ${item.glow})`]
                } : { filter: "none" }}
                transition={isSelected ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : {}}>
                {item.icon}
              </motion.span>
              <p className="font-amiri text-2xl font-bold" style={{ color: isSelected ? col : `${col}44` }}>{item.arabic}</p>
              <p className="font-inter text-sm font-bold tabular-nums" style={{ color: isSelected ? col : `${col}44` }}>
                {(khayrSharr8Data?.[item.key]?.bast ?? item.bast).toLocaleString()}
              </p>
              {isSelected && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="font-inter text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
                  style={{ color: col, borderColor: item.border, background: item.bg }}>
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
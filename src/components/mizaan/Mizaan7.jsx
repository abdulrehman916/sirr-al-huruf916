import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import MizaanHeader from "./MizaanHeader";
import { MIZAAN_PURPOSES } from "../../lib/mizaan9Data";
import { calcBast } from "../../lib/abjadModes";
import PurposeInterpretationCard from "./PurposeInterpretationCard";

function CustomPurposePanel({ customPurpose, onCustomPurpose }) {
  const stats = useMemo(() => {
    const trimmed = customPurpose.trim();
    if (!trimmed) return null;
    // Bast-ul Aval AND Letter Count must come from the SAME calculation
    // source. calcBast()->entries is exactly the array of base Arabic
    // letters (harakat/tatweel stripped by extractLetters) that the Bast
    // total was summed from — so entries.length is guaranteed to match.
    const { total, entries } = calcBast(trimmed, 1);
    return { bast: total, letters: entries.length };
  }, [customPurpose]);

  const active = stats !== null;

  return (
    <div className="space-y-2 pt-1">
      <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
        ✨ Custom Purpose — النية الخاصة
      </p>
      <textarea
        dir="rtl"
        value={customPurpose}
        onChange={e => onCustomPurpose(e.target.value)}
        placeholder="اكتب نيتك أو مقصدك الخاص هنا..."
        rows={2}
        className="w-full rounded-xl px-4 py-2.5 font-amiri text-base text-white leading-relaxed resize-none focus:outline-none caret-white placeholder:text-white/25"
        style={{ background: "rgba(4,12,34,0.97)", border: `1px solid ${active ? G.borderHi : G.border}`, fontSize: "16px" }}
      />
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-3 grid grid-cols-3 gap-2 text-center"
          style={{ background: "rgba(212,175,55,0.06)", borderColor: G.borderHi }}>
          <div>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-0.5" style={{ color: G.dim }}>Bast-ul Aval</p>
            <p className="font-amiri text-lg font-bold tabular-nums" style={{ color: G.text }}>{stats.bast.toLocaleString()}</p>
          </div>
          <div>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-0.5" style={{ color: G.dim }}>Letter Count</p>
            <p className="font-amiri text-lg font-bold tabular-nums" style={{ color: G.text }}>{stats.letters}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="font-inter text-[8px] uppercase tracking-widest mb-0.5" style={{ color: G.dim }}>Selected</p>
            <motion.span
              animate={{ boxShadow: [`0 0 6px rgba(212,175,55,0.4)`, `0 0 18px rgba(212,175,55,0.8)`, `0 0 6px rgba(212,175,55,0.4)`] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="font-inter text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{ color: G.text, borderColor: G.borderHi, background: G.bg }}>
              ✅ Active
            </motion.span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

const G = { borderHi: "rgba(212,175,55,0.65)", glow: "rgba(212,175,55,0.22)", text: "#F5D060", dim: "rgba(212,175,55,0.55)", border: "rgba(212,175,55,0.40)", bg: "rgba(212,175,55,0.07)" };

export default function Mizaan7({ selected, onChange, customPurpose, onCustomPurpose, purposesData, onPurposeResolved }) {
  // selected is now an array
  const selectedArr = Array.isArray(selected) ? selected : (selected ? [selected] : []);
  // Stabilize selections object — a new literal every render causes
  // PurposeInterpretationCard's useMemo/useEffect deps to change infinitely.
  const selectionsProp = useMemo(() => ({ purposes: selectedArr }), [selectedArr]);
  const toggle = useCallback((key) => {
    if (selectedArr.includes(key)) {
      onChange(selectedArr.filter(k => k !== key));
    } else {
      onChange([...selectedArr, key]);
    }
  }, [selectedArr, onChange]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: "rgba(6,14,36,0.98)", borderColor: G.borderHi, boxShadow: `0 0 40px ${G.glow}` }}>
      <MizaanHeader number="٧" titleAR="الميزان السابع — المقصد" titleTR="Seventh Mizan · Purpose" />
      <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
        Select your purpose
      </p>

      {/* 5 Purpose Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(purposesData ?? MIZAAN_PURPOSES).map((p, i) => {
          const isSelected = selectedArr.includes(p.key);
          const col        = p.color;
          return (
            <motion.button key={p.key}
              onClick={() => toggle(p.key)}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{
                opacity: isSelected ? 1 : 0.32,
                boxShadow: isSelected
                  ? [`0 0 18px ${col}55`, `0 0 36px ${col}88`, `0 0 18px ${col}55`]
                  : "none",
              }}
              transition={{
                opacity:   { duration: 0.3, delay: i * 0.05 },
                boxShadow: isSelected ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
              }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl border p-4 flex items-center gap-3 text-right cursor-pointer"
              style={{
                background:  isSelected ? `${col}14` : "rgba(255,255,255,0.02)",
                borderColor: isSelected ? `${col}88` : "rgba(255,255,255,0.07)",
                borderWidth: isSelected ? 2 : 1,
              }}>
              <motion.span
                style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0 }}
                animate={isSelected ? {
                  filter: [`drop-shadow(0 0 6px ${col}88)`, `drop-shadow(0 0 18px ${col})`, `drop-shadow(0 0 6px ${col}88)`]
                } : { filter: "none" }}
                transition={isSelected ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}>
                {p.icon}
              </motion.span>
              <div className="flex-1 flex flex-col items-start gap-0.5">
                <p className="font-amiri text-lg font-bold leading-none"
                  style={{ color: isSelected ? col : `${col}66` }}>
                  {p.arabic}
                </p>
                <p className="font-inter text-[9px] font-bold tabular-nums"
                  style={{ color: isSelected ? G.dim : "rgba(255,255,255,0.20)" }}>
                  Bast: {p.bast.toLocaleString()}
                </p>
              </div>
              {isSelected && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="font-inter text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full border ml-auto"
                  style={{ color: col, borderColor: `${col}88`, background: `${col}14`, flexShrink: 0 }}>
                  ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Custom Purpose Input */}
      <CustomPurposePanel customPurpose={customPurpose} onCustomPurpose={onCustomPurpose} />

      {/* Purpose Interpretation Card — Master purpose resolver for Ritual Timing */}
      <PurposeInterpretationCard customPurpose={customPurpose} selections={selectionsProp} onPurposeResolved={onPurposeResolved} />
    </motion.div>
  );
}
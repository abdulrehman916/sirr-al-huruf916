/**
 * HadimZikr — Zikr / Repetition Count Section
 * Shows per-individual and grand Zikr counts for all 3 types.
 */
import { motion } from "framer-motion";

const ACCENTS = {
  ULVI:   { border: "rgba(212,175,55,0.35)", text: "#F5D060",   dim: "rgba(212,175,55,0.50)",   bg: "rgba(212,175,55,0.06)"   },
  SUFLI:  { border: "rgba(220,38,38,0.35)",  text: "#FCA5A5",   dim: "rgba(220,38,38,0.55)",    bg: "rgba(220,38,38,0.06)"    },
  SHERLI: { border: "rgba(168,85,247,0.35)", text: "#D8B4FE",   dim: "rgba(168,85,247,0.50)",   bg: "rgba(168,85,247,0.06)"   },
};

const TYPE_KEYS = ['ulvi', 'sufli', 'sherli'];
const TYPE_LABELS = { ulvi: 'ULVI', sufli: 'SUFLI', sherli: 'SHERLI' };

export default function HadimZikr({ hadimMode, individuals, grandTypes }) {
  const accent = ACCENTS[hadimMode] || ACCENTS.ULVI;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      className="rounded-2xl border p-4 space-y-4"
      style={{
        background: "rgba(4,8,22,0.98)",
        borderColor: accent.border,
        boxShadow: `0 0 32px ${accent.bg}, 0 4px 20px rgba(0,0,0,0.50)`,
      }}
    >
      <div className="text-center">
        <p className="font-inter text-[8px] uppercase tracking-[0.3em]" style={{ color: accent.dim }}>
          Zikr Counts
        </p>
        <p className="font-amiri text-lg font-bold" style={{ color: accent.text }} dir="rtl">
          عدد الأذكار
        </p>
      </div>

      {/* Per individual */}
      {individuals.map((item, idx) => (
        <div key={idx} className="space-y-1.5">
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: accent.dim }}>
            {item.label}
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {[hadimMode.toLowerCase()].map(key => {
              const a = ACCENTS[key.toUpperCase()] || ACCENTS.ULVI;
              return (
                <div key={key} className="rounded-lg p-2 text-center"
                  style={{ background: a.bg, border: `1px solid ${a.border}` }}>
                  <span className="font-inter text-[7px] uppercase tracking-wider block mb-0.5" style={{ color: a.dim }}>{TYPE_LABELS[key]}</span>
                  <span className="font-amiri text-lg font-bold" style={{ color: a.text }}>
                    {item.types[key].reduced}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Grand total */}
      <div className="space-y-1.5">
        <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: accent.dim }}>
          Grand Zikr
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {[hadimMode.toLowerCase()].map(key => {
            const a = ACCENTS[key.toUpperCase()] || ACCENTS.ULVI;
            return (
              <div key={key} className="rounded-lg p-2.5 text-center"
                style={{ background: a.bg, border: `1px solid ${a.border}`, boxShadow: `0 0 12px ${a.bg}` }}>
                <span className="font-inter text-[7px] uppercase tracking-wider block mb-0.5" style={{ color: a.dim }}>{TYPE_LABELS[key]}</span>
                <span className="font-amiri text-xl font-bold" style={{ color: a.text }}>
                  {grandTypes[key].reduced}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
import { motion } from "framer-motion";
import { ABJAD_MAP } from "../lib/abjadValues";

export default function LetterAnalysis({ letters }) {
  if (!letters || !letters.length) return null;

  // Build frequency map keyed by normalized letter
  const freq = {};
  for (const l of letters) {
    const key = l.normalized ?? l.original;
    if (!key || !(key in ABJAD_MAP)) continue;
    freq[key] = (freq[key] || 0) + 1;
  }

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const maxCount = sorted[0]?.[1] || 1;
  const mostRepeated = sorted[0] ?? null;
  const highestAbjad = [...sorted].sort((a, b) => (ABJAD_MAP[b[0]] || 0) - (ABJAD_MAP[a[0]] || 0))[0] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border p-5"
      style={{ background: "rgba(15,45,75,0.85)", borderColor: "rgba(255,255,255,0.18)", boxShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
    >
      <p className="font-inter text-xs text-white/40 uppercase tracking-widest mb-4">Letter Analysis</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl border border-white/20 px-4 py-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <p className="font-inter text-[10px] text-white/60 uppercase tracking-widest mb-1">Most Repeated</p>
          <div className="flex items-center gap-2">
            <span className="font-amiri text-2xl text-white">{mostRepeated?.[0]}</span>
            <span className="font-inter text-xs text-white/50">×{mostRepeated?.[1]}</span>
          </div>
        </div>
        <div className="rounded-xl border border-white/20 px-4 py-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <p className="font-inter text-[10px] text-white/60 uppercase tracking-widest mb-1">Highest Abjad</p>
          <div className="flex items-center gap-2">
            <span className="font-amiri text-2xl text-white">{highestAbjad?.[0]}</span>
            <span className="font-inter text-xs text-yellow-400/70">{ABJAD_MAP[highestAbjad?.[0]]}</span>
          </div>
        </div>
      </div>

      {/* Frequency bars */}
      <p className="font-inter text-[10px] text-white/60 uppercase tracking-widest mb-3">Letter Frequency</p>
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {sorted.map(([letter, count]) => (
          <div key={letter} className="flex items-center gap-3">
            <span className="font-amiri text-base text-white w-6 text-center flex-shrink-0">{letter}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(count / maxCount) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-yellow-500/70 to-yellow-400/50"
              />
            </div>
            <span className="font-inter text-[10px] text-white/60 w-4 text-right flex-shrink-0">{count}</span>
            <span className="font-inter text-[10px] text-white/40 w-6 text-right flex-shrink-0">{ABJAD_MAP[letter] || '—'}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
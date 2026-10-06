import { useMemo } from "react";
import { motion } from "framer-motion";
import { FIRST_BAST } from "../../lib/mizaanPostEngine";

const G = {
  gold:     "#F5D060",
  goldDim:  "rgba(245,208,96,0.55)",
  goldFaint:"rgba(245,208,96,0.12)",
  goldBorder:"rgba(212,175,55,0.40)",
  goldBorderHi:"rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.18)",
  bg:       "rgba(3,6,20,0.99)",
  bgCard:   "rgba(8,16,40,0.98)",
  bgInner:  "rgba(212,175,55,0.06)",
  dim:      "rgba(255,255,255,0.35)",
};

// Extract and sort letter data from FIRST_BAST
const letterData = Object.entries(FIRST_BAST)
  .filter(([letter]) => !['ه', 'ي', 'أ', 'إ', 'آ', 'ء', 'ة', 'ؤ', 'ئ'].includes(letter)) // Remove duplicates/variants
  .sort((a, b) => a[0].localeCompare(b[0], 'ar'));

function SectionHeader({ label, arabic, color = G.gold }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color }}>{label}</span>
          {arabic && <span className="font-amiri text-sm" style={{ color: G.goldDim }}>{arabic}</span>}
        </div>
      </div>
      <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
    </div>
  );
}

function Card({ children, accent, className = "" }) {
  return (
    <div
      className={`rounded-xl border p-4 ${className}`}
      style={{
        background: G.bgCard,
        borderColor: accent ? accent + "55" : G.goldBorder,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}
    >
      {children}
    </div>
  );
}

export default function MizanLetterReference() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: G.bg,
        borderColor: G.goldBorderHi,
        boxShadow: `0 0 80px ${G.glow}, 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />

      {/* Title Banner */}
      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-3"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
          <span className="font-inter text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Mizan Letter Value Reference</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
        <h2 className="font-amiri text-2xl font-bold" style={{ color: G.gold }}>قيم حروف الميزان</h2>
        <p className="font-inter text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: G.goldDim }}>Master Reference Table — First Bast Values</p>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-2 py-1">
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${G.goldBorder})` }} />
        <span style={{ color: G.goldDim, fontSize: 10 }}>✦</span>
        <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${G.goldBorder})` }} />
      </div>

      <div className="px-4 pb-6 pt-4">
        <Card accent={G.gold}>
          <SectionHeader label="Letter Values" arabic="قيم الحروف" color={G.gold} />
          
          {/* Grid of letter-value pairs */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {letterData.map(([letter, value], idx) => (
              <motion.div
                key={letter}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border"
                style={{
                  background: G.bgInner,
                  borderColor: G.goldBorder + "60",
                }}
              >
                <span className="font-amiri text-2xl font-bold" style={{ color: G.gold }}>{letter}</span>
                <span className="font-inter text-xs font-bold tabular-nums" style={{ color: G.dim }}>{value.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>

          {/* Info note */}
          <div className="mt-4 p-3 rounded-lg border" style={{ background: G.goldFaint, borderColor: G.goldBorder + "40" }}>
            <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
              These values are from the First Bast (البسط الأول) table used across all Mizan calculations. 
              Values are sourced from the manuscript's canonical letter-value mappings.
            </p>
          </div>
        </Card>
      </div>

      {/* Bottom accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
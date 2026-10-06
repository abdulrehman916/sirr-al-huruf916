import { motion } from "framer-motion";
import { MIZAAN_ELEMENTS, getMizaanInterpretation } from "../lib/mizaan9Engine";

// ── Shared palette ──
const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
};

const EL_STYLE = {
  fire:  { color: "#FF6B35", glow: "rgba(255,107,53,0.40)",  bg: "rgba(255,107,53,0.10)",  border: "rgba(255,107,53,0.45)" },
  water: { color: "#4FC3F7", glow: "rgba(79,195,247,0.40)",  bg: "rgba(79,195,247,0.10)",  border: "rgba(79,195,247,0.45)" },
  air:   { color: "#B2EBF2", glow: "rgba(178,235,242,0.35)", bg: "rgba(178,235,242,0.08)", border: "rgba(178,235,242,0.40)" },
  earth: { color: "#A5C880", glow: "rgba(165,200,128,0.35)", bg: "rgba(165,200,128,0.08)", border: "rgba(165,200,128,0.40)" },
};

function SectionLabel({ children }) {
  return (
    <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
      {children}
    </p>
  );
}

function GlowNumber({ value, size = "clamp(2.2rem,9vw,3rem)" }) {
  return (
    <motion.p
      className="font-inter font-bold tabular-nums text-center"
      style={{ fontSize: size, color: G.text }}
      animate={{ textShadow: [`0 0 18px ${G.glow}`, `0 0 48px ${G.glowHi}`, `0 0 18px ${G.glow}`] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
      {value.toLocaleString()}
    </motion.p>
  );
}

// ── 1. Bast-ul Aval ──
export function BastTotalCard({ total }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border p-6 text-center space-y-1"
      style={{ background: "rgba(6,14,36,0.98)", borderColor: G.borderHi, boxShadow: `0 0 48px ${G.glow}, 0 4px 24px rgba(0,0,0,0.55)` }}>
      <SectionLabel>بسط الأول — Bast-ul Aval</SectionLabel>
      <GlowNumber value={total} size="clamp(2.6rem,12vw,4rem)" />
    </motion.div>
  );
}

// ── 2. Letter Count ──
export function LetterCountCard({ count }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-4 text-center"
      style={{ background: "rgba(8,18,44,0.96)", borderColor: G.border }}>
      <SectionLabel>عدد الحروف — Letter Count</SectionLabel>
      <p className="font-inter font-bold text-white tabular-nums mt-1" style={{ fontSize: "clamp(1.8rem,8vw,2.6rem)" }}>{count}</p>
    </motion.div>
  );
}

// ── 3. Anasir Breakdown — DYNAMIC CARD SYSTEM ──
export function AnasirBreakdownCard({ counts, percentages }) {
  // Sort entries by percentage descending to determine rank
  const sorted = Object.entries(MIZAAN_ELEMENTS)
    .map(([key, el]) => ({ key, el, pct: percentages[key] ?? 0, cnt: counts[key] ?? 0 }))
    .sort((a, b) => b.pct - a.pct);

  const maxPct = sorted[0]?.pct ?? 0;

  // Determine visual tier for each element
  const getTier = (key, pct) => {
    if (pct === maxPct && pct > 0) return 'dominant';
    if (pct >= maxPct * 0.5 && pct > 0) return 'strong';
    if (pct > 0) return 'weak';
    return 'inactive';
  };

  const TIER_STYLE = {
    dominant: { opacity: 1,    scale: 1,    borderWidth: 2,  glowMult: 1.0  },
    strong:   { opacity: 0.80, scale: 1,    borderWidth: 1,  glowMult: 0.5  },
    weak:     { opacity: 0.50, scale: 1,    borderWidth: 1,  glowMult: 0.2  },
    inactive: { opacity: 0.20, scale: 1,    borderWidth: 1,  glowMult: 0.0  },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      className="rounded-2xl border p-4 space-y-3"
      style={{ background: "rgba(8,18,44,0.96)", borderColor: G.border }}>
      <SectionLabel>عناصر — Anasir Breakdown</SectionLabel>
      <div className="space-y-2">
        {sorted.map(({ key, el, pct, cnt }, idx) => {
          const s    = EL_STYLE[key];
          const tier = getTier(key, pct);
          const ts   = TIER_STYLE[tier];
          const isDominant = tier === 'dominant';

          return (
            <motion.div key={key}
              initial={{ opacity: 0, x: 10 }}
              animate={{
                opacity: ts.opacity,
                x: 0,
                boxShadow: isDominant
                  ? [`0 0 18px ${s.glow}`, `0 0 36px ${s.glow}`, `0 0 18px ${s.glow}`]
                  : `0 0 0px transparent`,
              }}
              transition={{
                opacity:    { duration: 0.4, delay: 0.06 * idx },
                x:          { duration: 0.4, delay: 0.06 * idx },
                boxShadow:  isDominant ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
              }}
              className="rounded-xl border px-4 py-3"
              style={{
                background:  isDominant
                  ? `linear-gradient(135deg, ${s.bg}, rgba(0,0,0,0.4))`
                  : "rgba(255,255,255,0.02)",
                borderColor: isDominant ? s.border : `${s.border.replace(/[\d.]+\)$/, "0.15)")}`,
                borderWidth:  ts.borderWidth,
              }}>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {/* Icon — larger + glowing for dominant */}
                  <motion.span
                    style={{ fontSize: isDominant ? "1.6rem" : "1.1rem", lineHeight: 1 }}
                    animate={isDominant ? {
                      filter: [`drop-shadow(0 0 4px ${s.glow})`, `drop-shadow(0 0 14px ${s.color})`, `drop-shadow(0 0 4px ${s.glow})`],
                    } : { filter: "drop-shadow(0 0 0px transparent)" }}
                    transition={isDominant ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}>
                    {el.icon}
                  </motion.span>

                  <div>
                    <p className="font-inter text-xs font-bold uppercase tracking-wider leading-none"
                      style={{ color: isDominant ? s.color : `${s.color}99` }}>
                      {el.labelTR}
                    </p>
                    <p className="font-amiri text-sm leading-none mt-0.5"
                      style={{ color: isDominant ? s.color : `${s.color}66` }}>
                      {el.arabic}
                    </p>
                  </div>

                  {isDominant && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="font-inter text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-bold"
                      style={{ color: s.color, borderColor: s.border, background: s.bg }}>
                      Dominant
                    </motion.span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-0.5">
                  {/* Bast value */}
                  <span className="font-inter text-sm font-bold tabular-nums"
                    style={{ color: isDominant ? s.color : `${s.color}88` }}>
                    {el.bast2?.toLocaleString()}
                  </span>
                  {/* Percentage — big for dominant */}
                  <span className="font-inter font-bold tabular-nums"
                    style={{
                      fontSize: isDominant ? "1.1rem" : "0.75rem",
                      color: isDominant ? s.color : `${s.color}77`,
                    }}>
                    {pct}%
                  </span>
                  <span className="font-inter text-[9px] tabular-nums"
                    style={{ color: `${s.color}55` }}>
                    {cnt} letters
                  </span>
                </div>
              </div>

              {/* Energy bar */}
              <div className="h-2 w-full rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 + idx * 0.05 }}
                  className="h-full rounded-full"
                  style={{
                    background: isDominant
                      ? `linear-gradient(90deg, ${s.color}cc, ${s.color})`
                      : s.color,
                    boxShadow: isDominant ? `0 0 10px ${s.glow}` : "none",
                    opacity: ts.opacity,
                  }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── 4. Dominant Element ──
export function DominantCard({ dominant, tiebreak }) {
  if (!dominant) return null;
  const el = MIZAAN_ELEMENTS[dominant];
  const s  = EL_STYLE[dominant];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
      className="rounded-2xl border p-5 text-center space-y-2"
      style={{ background: s.bg, borderColor: s.border, boxShadow: `0 0 40px ${s.glow}` }}>
      <SectionLabel>العنصر الغالب — Dominant Anasir</SectionLabel>
      <motion.div style={{ fontSize: "3.5rem", lineHeight: 1 }}
        animate={{ filter: [`drop-shadow(0 0 8px ${s.glow})`, `drop-shadow(0 0 22px ${s.color})`, `drop-shadow(0 0 8px ${s.glow})`] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
        {el.icon}
      </motion.div>
      <p className="font-inter text-2xl font-bold uppercase tracking-widest" style={{ color: s.color }}>{el.labelTR}</p>
      <p className="font-amiri text-xl" style={{ color: s.color, opacity: 0.8 }}>{el.arabic}</p>
      {tiebreak?.rankName && (
        <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: s.color, opacity: 0.55 }}>
          Resolved by {tiebreak.rankName}
        </p>
      )}
    </motion.div>
  );
}

// ── 5. Second Mizan ──
export function SecondMizaanCard({ dominant, bast2Value, tiebreak }) {
  if (!dominant || bast2Value == null) return null;
  const el = MIZAAN_ELEMENTS[dominant];
  const s  = EL_STYLE[dominant];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
      className="rounded-2xl border p-5 space-y-3"
      style={{ background: "rgba(6,14,36,0.98)", borderColor: G.borderHi, boxShadow: `0 0 36px ${G.glow}` }}>
      <SectionLabel>الميزان الثاني — Second Mizan (Bast-ı Sani)</SectionLabel>
      <div className="flex items-center justify-center gap-2 mb-1">
        <span style={{ fontSize: "1.3rem" }}>{el.icon}</span>
        <span className="font-inter text-sm font-bold uppercase tracking-widest" style={{ color: s.color }}>{el.labelTR}</span>
        <span className="font-amiri text-base" style={{ color: s.color, opacity: 0.7 }}>{el.arabic}</span>
      </div>
      <GlowNumber value={bast2Value} />
      <div className="flex flex-wrap gap-1.5 justify-center pt-1">
        {el.letters.map((letter, i) => (
          <span key={i} className="font-amiri text-xl rounded-lg border px-2.5 py-1"
            style={{ color: s.color, background: s.bg, borderColor: s.border }}>
            {letter}
          </span>
        ))}
      </div>
      {tiebreak?.rankName && (
        <p className="font-inter text-[10px] uppercase tracking-widest text-center" style={{ color: G.dim, opacity: 0.6 }}>
          Resolved by {tiebreak.rankName}
        </p>
      )}
    </motion.div>
  );
}

// ── 6. Day / Night ──
export function DayNightCard({ daynight }) {
  if (!daynight) return null;
  const isDay = daynight.mode === 'Gündüz';
  const col   = isDay ? "#FBBF24" : "#818CF8";
  const glow  = isDay ? "rgba(251,191,36,0.35)"  : "rgba(129,140,248,0.35)";
  const bg    = isDay ? "rgba(251,191,36,0.08)"  : "rgba(129,140,248,0.08)";
  const brd   = isDay ? "rgba(251,191,36,0.40)"  : "rgba(129,140,248,0.40)";
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
      className="rounded-2xl border p-5 space-y-2"
      style={{ background: bg, borderColor: brd, boxShadow: `0 0 32px ${glow}` }}>
      <SectionLabel>القوة الزمنية — Day / Night Force</SectionLabel>
      <div className="flex items-center justify-center gap-3">
        <span style={{ fontSize: "2rem" }}>{daynight.icon}</span>
        <div className="text-center">
          <p className="font-inter text-xl font-bold uppercase tracking-widest" style={{ color: col }}>{daynight.mode}</p>
          <p className="font-amiri text-base" style={{ color: col, opacity: 0.75 }}>{daynight.arabic}</p>
        </div>
      </div>
      <GlowNumber value={daynight.bast} />
      <p className="font-inter text-[11px] text-center italic" style={{ color: col, opacity: 0.65 }}>{daynight.desc}</p>
    </motion.div>
  );
}

// ── 7. Planetary Match ──
export function PlanetCard({ planet }) {
  if (!planet) return null;
  const col  = planet.color;
  const glow = `${col}55`;
  const bg   = `${col}14`;
  const brd  = `${col}55`;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
      className="rounded-2xl border p-5 space-y-2"
      style={{ background: bg, borderColor: brd, boxShadow: `0 0 32px ${glow}` }}>
      <SectionLabel>الكوكب — Planetary Resonance</SectionLabel>
      <div className="flex items-center justify-center gap-3">
        <span className="font-inter text-3xl" style={{ color: col }}>{planet.symbol}</span>
        <div className="text-center">
          <p className="font-inter text-xl font-bold uppercase tracking-widest" style={{ color: col }}>{planet.name}</p>
          <p className="font-amiri text-base" style={{ color: col, opacity: 0.75 }}>{planet.arabic}</p>
        </div>
      </div>
      <GlowNumber value={planet.bast} />
    </motion.div>
  );
}

// ── 8. Mizan Suitability ──
export function SuitabilityCard({ suitability }) {
  if (!suitability) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
      className="rounded-2xl border p-5 space-y-2"
      style={{ background: G.bgHi, borderColor: G.borderHi, boxShadow: `0 0 36px ${G.glow}` }}>
      <SectionLabel>الميزان المناسب — Best Mizan Suitability</SectionLabel>
      <div className="flex items-center justify-center gap-2">
        <p className="font-inter text-xl font-bold uppercase tracking-widest" style={{ color: G.text }}>{suitability.name}</p>
        <p className="font-amiri text-xl" style={{ color: G.dim }}>{suitability.arabic}</p>
      </div>
      <GlowNumber value={suitability.bast} />
      <p className="font-inter text-[11px] text-center italic" style={{ color: G.dim }}>{suitability.desc}</p>
    </motion.div>
  );
}

// ── 9. Mystical Interpretation ──
export function InterpretationCard({ dominant, letterCount, bast1Total }) {
  if (!dominant) return null;
  const lines = getMizaanInterpretation(dominant, letterCount, bast1Total);
  const s     = EL_STYLE[dominant];
  const el    = MIZAAN_ELEMENTS[dominant];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }}
      className="rounded-2xl border p-5 space-y-3"
      style={{ background: "rgba(6,14,36,0.98)", borderColor: G.border }}>
      <SectionLabel>التفسير الروحاني — Mystical Interpretation</SectionLabel>
      <div className="flex items-center justify-center gap-2 mb-1">
        <span style={{ fontSize: "1.2rem" }}>{el.icon}</span>
        <span className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: s.color }}>{el.labelTR} Energy</span>
      </div>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32 + i * 0.06 }}
            className="flex items-start gap-2.5 rounded-xl border px-3 py-2"
            style={{ background: s.bg, borderColor: s.border }}>
            <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow: `0 0 6px ${s.glow}`, marginTop: 6 }} />
            <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{line}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
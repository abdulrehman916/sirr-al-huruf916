// ═══════════════════════════════════════════════════════════════
// SECONDARY AKRAM — Letter-by-Letter Transformation
// Takes each Akram letter from the primary conversion, looks up its
// value in the selected BAST level, and converts back to Akram letters.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { toAkramPieces } from "./AkramCard";
import { BAST_LOOKUP, BAST_FIELD_MAP } from "../lib/bastHuroofData";

// ── Palette ───────────────────────────────────────────────────
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

// ── Normalize hamza variants ───────────────────────────────────
const NORM_MAP = {
  'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ء': 'ا',
  'ى': 'ي', 'ئ': 'ي',
  'ؤ': 'و',
  'ة': 'ه',
};
function normalize(ch) { return NORM_MAP[ch] || ch; }

// ── Core transformation ────────────────────────────────────────
/**
 * For each primary Akram letter:
 * 1. Normalize the letter
 * 2. Look up its value in the selected BAST level
 * 3. Convert that value to Akram pieces
 */
export function transformAkramLetters(akramLetters, bastLevel) {
  if (!akramLetters || !bastLevel) return [];
  
  const field = BAST_FIELD_MAP[bastLevel];
  
  return akramLetters.split('').map((letter, idx) => {
    const norm = normalize(letter);
    const row = BAST_LOOKUP[norm];
    const value = row ? row[field] : null;
    
    let pieces = [];
    if (value !== null && value > 0) {
      pieces = toAkramPieces(value);
    }
    
    return {
      index: idx,
      original: letter,
      normalized: norm,
      bastValue: value,
      pieces,
      secondaryLetters: pieces.map(p => p.letter).join(''),
    };
  });
}

// ── Component ─────────────────────────────────────────────────
export default function SecondaryAkram({ akramLetters, bastLevel }) {
  const [selectedLevel, setSelectedLevel] = useState(bastLevel || 1);
  
  // Sync with parent level when it changes
  useEffect(() => {
    if (bastLevel && bastLevel !== selectedLevel) {
      setSelectedLevel(bastLevel);
    }
  }, [bastLevel]);
  
  const transformed = useMemo(() => {
    if (!akramLetters) return [];
    return transformAkramLetters(akramLetters, selectedLevel);
  }, [akramLetters, selectedLevel]);
  
  const hasData = transformed.some(t => t.bastValue !== null);
  
  if (!akramLetters) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className="rounded-2xl border p-5 space-y-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)" }} />
      
      {/* Title and Level Selector */}
      <div className="space-y-3">
        <p className="font-inter text-[9px] uppercase tracking-[0.26em] text-center" style={{ color: G.dim }}>
          ✦ Secondary Akram — Level Selector
        </p>
        
        {/* Level buttons */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const isActive = selectedLevel === lvl;
            const lvlInfo = { 1: 'Evvel', 2: 'Sani', 3: 'Salis', 4: 'Rabi', 5: 'Hamis' };
            return (
              <motion.button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                whileTap={{ scale: 0.92 }}
                className="w-10 h-10 rounded-xl border font-inter text-sm font-bold flex items-center justify-center"
                style={{
                  background: isActive ? G.bgHi : "rgba(255,255,255,0.02)",
                  borderColor: isActive ? G.borderHi : G.faint,
                  color: isActive ? G.text : "rgba(255,255,255,0.35)",
                  boxShadow: isActive ? `0 0 16px ${G.glow}` : "none",
                }}
              >
                {lvl}
              </motion.button>
            );
          })}
        </div>
        
        <p className="font-inter text-[9px] text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
          Using Bast-{['I Evvel','I Sani','I Salis','I Rabi','I Hamis'][selectedLevel-1]}
        </p>
      </div>
      
      <div className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent)" }} />
      
      {/* Description */}
      <p className="font-inter text-[9px] text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
        Each primary Akram letter → Bast value → Secondary Akram letters
      </p>
      
      {!hasData ? (
        <div className="py-4 text-center">
          <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.40)" }}>
            ⏳ Awaiting Bast Table
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Primary → Secondary mapping */}
          {transformed.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.25 }}
              className="rounded-xl border p-3"
              style={{
                background: t.bastValue !== null ? G.bg : "rgba(255,255,255,0.01)",
                borderColor: t.bastValue !== null ? G.faint : "rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Primary letter */}
                <div className="flex flex-col items-center gap-1 min-w-[48px]">
                  <span className="font-amiri text-2xl font-bold" style={{ color: G.text }}>
                    {t.original}
                  </span>
                  <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
                    Primary
                  </span>
                </div>
                
                {/* Arrow */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-px w-8" style={{ background: `linear-gradient(90deg, ${G.faint}, ${G.borderHi})` }} />
                  <span className="font-amiri text-lg mx-2" style={{ color: G.dim }}>→</span>
                  <div className="h-px w-8" style={{ background: `linear-gradient(90deg, ${G.borderHi}, ${G.faint})` }} />
                </div>
                
                {/* Bast value */}
                <div className="flex flex-col items-center gap-1 min-w-[64px]">
                  <span className="font-inter text-sm font-bold tabular-nums" style={{ color: G.text }}>
                    {t.bastValue !== null ? t.bastValue.toLocaleString() : "—"}
                  </span>
                  <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
                    Bast
                  </span>
                </div>
                
                {/* Arrow */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-px w-8" style={{ background: `linear-gradient(90deg, ${G.faint}, ${G.borderHi})` }} />
                  <span className="font-amiri text-lg mx-2" style={{ color: G.dim }}>→</span>
                  <div className="h-px w-8" style={{ background: `linear-gradient(90deg, ${G.borderHi}, ${G.faint})` }} />
                </div>
                
                {/* Secondary letters */}
                <div className="flex flex-col items-center gap-1 min-w-[80px]">
                  {t.pieces.length > 0 ? (
                    <>
                      <span className="font-amiri text-xl font-bold" style={{ color: G.text, letterSpacing: 0 }}>
                        {t.secondaryLetters}
                      </span>
                      <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
                        Secondary ({t.pieces.length})
                      </span>
                    </>
                  ) : (
                    <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                      —
                    </span>
                  )}
                </div>
              </div>
              
              {/* Secondary breakdown (if has pieces) */}
              {t.pieces.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: idx * 0.03 + 0.1, duration: 0.25 }}
                  className="mt-2 pt-2 border-t"
                  style={{ borderColor: G.faint }}
                >
                  <div className="flex flex-wrap gap-1 justify-center">
                    {[...t.pieces].reverse().map((p, pIdx) => {
                      const originalIndex = t.pieces.length - 1 - pIdx;
                      return (
                        <div
                          key={originalIndex}
                          className="flex flex-col items-center rounded-lg px-2 py-1"
                          style={{
                            background: G.bg,
                            borderColor: G.faint,
                            border: "1px solid",
                          }}
                        >
                          <span className="font-amiri text-base font-bold" style={{ color: G.text }}>
                            {p.letter}
                          </span>
                          <span className="font-inter text-[8px] tabular-nums" style={{ color: G.dim }}>
                            {p.value.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
          
          {/* Combined secondary letters */}
          <div className="pt-3 border-t" style={{ borderColor: G.border }}>
            <p className="font-inter text-[9px] uppercase tracking-widest text-center mb-3" style={{ color: G.dim }}>
              Combined Secondary Akram Letters
            </p>
            
            {/* Letter chips grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap justify-center gap-2 mb-4"
              dir="rtl"
            >
              {transformed.map(t => t.secondaryLetters).join('').split('').map((letter, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02, duration: 0.2 }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border"
                  style={{
                    background: G.bg,
                    borderColor: G.faint,
                    boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                  }}
                >
                  <span
                    className="font-amiri font-bold"
                    style={{ fontSize: "clamp(1.2rem, 4vw, 1.6rem)", color: G.text }}
                  >
                    {letter}
                  </span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
                  Total Letters
                </p>
                <p className="font-inter font-bold tabular-nums text-lg" style={{ color: G.text }}>
                  {transformed.reduce((sum, t) => sum + t.pieces.length, 0).toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-px" style={{ background: G.faint }} />
              <div className="text-center">
                <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
                  Total Value
                </p>
                <p className="font-inter font-bold tabular-nums text-lg" style={{ color: G.text }}>
                  {transformed.reduce((sum, t) => sum + (t.bastValue || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
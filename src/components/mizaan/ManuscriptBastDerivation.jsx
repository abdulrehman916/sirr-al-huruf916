/**
 * ManuscriptBastDerivation — Displays the complete bast derivation chain
 * Shows seed letters, ferd/zevc, processing order, and individual bast derivations
 */
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBastLevel, istintak } from "../../lib/mizaanPostEngine";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.60)",
  bg: "rgba(212,175,55,0.06)",
  green: "#4ADE80",
  red: "#F87171",
  purple: "#C4B5FD",
};

const AR = {
  fontFamily: "'Noto Naskh Arabic','Amiri','Scheherazade New',serif",
};

// Letter chip component
function LetterChip({ letter, bastValue, color, size = "1.4rem", showBast = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "2px" }}>
      <span 
        dir="rtl" 
        lang="ar"
        style={{ 
          fontFamily: AR.fontFamily,
          fontSize: size, 
          color: color, 
          fontWeight: "600",
          padding: "6px 10px",
          borderRadius: "6px",
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: "inline-block",
          minWidth: "2.5rem",
          textAlign: "center"
        }}
      >
        {letter}
      </span>
      {showBast && bastValue && (
        <span style={{ fontSize: "0.65rem", color: G.dim, marginTop: "4px", fontFamily: "'Inter', sans-serif" }}>
          {bastValue.toLocaleString()}
        </span>
      )}
    </div>
  );
}

// Processing arrow
function ProcessingArrow({ direction = "right" }) {
  return (
    <span style={{ fontSize: "1.5rem", color: G.dim, margin: "0 4px" }}>
      {direction === "right" ? "→" : "←"}
    </span>
  );
}

export default function ManuscriptBastDerivation({ 
  seedLetters, 
  bastLevel, 
  isZevc,
  expandedLetters,
  isExpandedZevc,
  color = "#F5D060",
  title = "Manuscript Bast Derivation",
  titleAr = "اشتقاق البسط المخطوط"
}) {
  // Calculate all derivations
  const derivations = useMemo(() => {
    return seedLetters.map((letter, idx) => {
      const bastValue = getBastLevel(letter, bastLevel);
      const expansionLetters = istintak(bastValue);
      return {
        originalIndex: idx,
        letter,
        bastValue,
        expansionLetters,
      };
    });
  }, [seedLetters, bastLevel]);

  // All expansion letters concatenated
  const allExpansionLetters = useMemo(() => {
    return derivations.flatMap(d => d.expansionLetters);
  }, [derivations]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{ 
        background: "rgba(3,6,20,0.99)", 
        borderColor: color, 
        boxShadow: `0 0 40px ${color}20, inset 0 1px 0 ${color}10` 
      }}
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="font-inter text-[9px] uppercase tracking-[0.25em]" style={{ color: G.dim }}>
          ✦ {title} ✦
        </p>
        <h3 className="font-amiri text-xl font-bold" style={{ color }}>
          {titleAr}
        </h3>
        <div className="h-px w-20 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STEP 1: SEED LETTER COUNT
          ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border p-3" style={{ background: `${color}05`, borderColor: `${color}30` }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Seed Letter Count</span>
          <span className="font-inter text-sm font-bold tabular-nums" style={{ color: G.text }}>{seedLetters.length}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-1" style={{ direction: "ltr" }}>
          {seedLetters.map((l, i) => (
            <LetterChip key={i} letter={l} color={color} size="1.2rem" />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STEP 2: FERD/ZEVC CLASSIFICATION
          ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border p-3" style={{ background: `${color}05`, borderColor: `${color}30` }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Classification</span>
          <div style={{ 
            fontSize: "0.9rem", 
            fontWeight: "bold", 
            color: isZevc ? G.green : G.red,
            padding: "4px 12px",
            borderRadius: "4px",
            background: isZevc ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"
          }}>
            {isZevc ? '✓ ZEVC (زوج) - EVEN' : '✓ FERD (فرد) - ODD'}
          </div>
        </div>
        <div className="text-xs" style={{ color: G.dim, marginTop: "6px" }}>
          Manuscript rule: <strong style={{ color: G.text }}>Zevc → 4th Bast</strong> | <strong style={{ color: G.text }}>Ferd → 5th Bast</strong>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STEP 3: SELECTED BAST LEVEL
          ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border p-3" style={{ background: `${color}05`, borderColor: `${color}30` }}>
        <div className="flex items-center justify-between">
          <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Selected Bast Level</span>
          <div style={{ 
            fontSize: "1.1rem", 
            fontWeight: "bold", 
            color: G.green,
            padding: "6px 14px",
            borderRadius: "6px",
            background: `${G.green}15`,
            border: `1px solid ${G.green}30`
          }}>
            {bastLevel}{bastLevel === 4 ? ' (رابع)' : bastLevel === 5 ? ' (خامس)' : ''} Bast
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STEP 4: PROCESSING ORDER
          ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border p-4" style={{ background: `${color}05`, borderColor: `${color}30` }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
            ✓ Processing Order
          </span>
          <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.green, background: `${G.green}20`, padding: "2px 8px", borderRadius: "4px" }}>
            FIRST → LAST
          </span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-1 py-3" style={{ direction: "ltr" }}>
          {seedLetters.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              {i === 0 && (
                <span style={{ fontSize: "0.6rem", color: G.green, fontWeight: "bold", marginRight: "6px", background: `${G.green}15`, padding: "2px 6px", borderRadius: "3px" }}>
                  START
                </span>
              )}
              <LetterChip letter={l} color={color} size="1.3rem" />
              {i < seedLetters.length - 1 && <ProcessingArrow direction="right" />}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-2">
          <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>
            Sequence: {seedLetters.join(' ')}
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STEP 5: INDIVIDUAL BAST DERIVATIONS
          ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border p-4" style={{ background: `${color}05`, borderColor: `${color}30` }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
            Individual Bast Derivations
          </span>
          <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: color, background: `${color}20`, padding: "2px 8px", borderRadius: "4px" }}>
            {derivations.length} letters
          </span>
        </div>

        <div className="space-y-3">
          {derivations.map((derivation, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              className="rounded-lg border p-3"
              style={{ 
                background: `${G.purple}05`, 
                borderColor: `${G.purple}30`,
                borderLeft: `3px solid ${color}`
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ 
                  background: color, 
                  color: "#000", 
                  padding: "2px 8px", 
                  borderRadius: "4px", 
                  fontWeight: "bold", 
                  fontSize: "0.65rem" 
                }}>
                  {idx + 1}
                </span>
                <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>
                  Processing order: {idx === 0 ? 'START (first letter)' : idx === derivations.length - 1 ? 'END (last letter)' : `step ${idx + 1}`}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Original letter */}
                <LetterChip letter={derivation.letter} color={G.purple} size="1.5rem" showBast={false} />
                
                <span style={{ fontSize: "1.5rem", color: G.dim }}>→</span>
                
                {/* Bast level */}
                <div style={{ 
                  fontSize: "0.75rem", 
                  color: G.text,
                  padding: "6px 10px",
                  borderRadius: "6px",
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  textAlign: "center"
                }}>
                  <div style={{ color: G.dim, fontSize: "0.6rem", marginBottom: "2px" }}>{bastLevel}th Bast</div>
                  <div style={{ fontWeight: "bold" }}>{derivation.bastValue.toLocaleString()}</div>
                </div>
                
                <span style={{ fontSize: "1.5rem", color: G.dim }}>→</span>
                
                {/* Expansion letters */}
                <div className="flex flex-wrap gap-1" style={{ direction: "ltr" }}>
                  {derivation.expansionLetters.map((l, i) => (
                    <LetterChip key={i} letter={l} color={G.green} size="1.1rem" />
                  ))}
                </div>
              </div>

              <div className="text-xs mt-2" style={{ color: G.dim }}>
                Expansion: <strong style={{ color: G.text }}>{derivation.expansionLetters.length} letters</strong>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STEP 6: ASSEMBLED SATR-I VAHID
          ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border p-4" style={{ background: `${color}05`, borderColor: `${color}30` }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
            Assembled Satr-i Vahid
          </span>
          <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.green, background: `${G.green}15`, padding: "2px 8px", borderRadius: "4px" }}>
            {allExpansionLetters.length} total letters
          </span>
        </div>

        <div className="p-4 rounded-lg" style={{ background: `${color}10`, border: `2px solid ${color}40` }}>
          <div className="flex flex-wrap justify-center gap-2 mb-3" style={{ direction: "ltr" }}>
            {allExpansionLetters.map((l, i) => (
              <LetterChip 
                key={i} 
                letter={l} 
                color={color} 
                size="1.4rem" 
              />
            ))}
          </div>
          
          <div className="text-center pt-3 border-t" style={{ borderColor: `${color}30` }}>
            <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>
              All expansion letters concatenated in sequence order
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STEP 7: FINAL EXPANDED LETTERS FROM PIPELINE (if available)
          ═══════════════════════════════════════════════════════════════ */}
      {expandedLetters && expandedLetters.length > 0 && (
        <div className="rounded-xl border p-4" style={{ background: `${color}05`, borderColor: `${color}30` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
              ✦ Final Expanded Letters (Post-Bast Pipeline)
            </span>
            <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: isExpandedZevc ? G.green : G.red, background: isExpandedZevc ? `${G.green}15` : `${G.red}15`, padding: "2px 8px", borderRadius: "4px" }}>
              {expandedLetters.length} letters → {isExpandedZevc ? 'ZEVC' : 'FERD'} → Groups of {isExpandedZevc ? 4 : 5}
            </span>
          </div>

          <div className="p-4 rounded-lg" style={{ background: `${color}10`, border: `2px solid ${color}40` }}>
            <div className="flex flex-wrap justify-center gap-2 mb-3" style={{ direction: "ltr" }}>
              {expandedLetters.map((l, i) => (
                <LetterChip 
                  key={i} 
                  letter={l} 
                  color={G.green} 
                  size="1.4rem" 
                />
              ))}
            </div>
            
            <div className="text-center pt-3 border-t" style={{ borderColor: `${color}30` }}>
              <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>
                These letters are used for Esma-i Kitabet name generation
              </span>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
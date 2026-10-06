// ═══════════════════════════════════════════════════════════════
// SECTION 3: ESMA-I KASEM — FULLY ISOLATED PIPELINE
// ─────────────────────────────────────────────────────────────
// INPUT (read-only): Section 2's allExpandedLetters
//
// FORMULA:
//   kasemBastTotal   = sum of FirstBast(letter) for each Section 2 expanded letter
//   kasemLetterCount = Section 2 expanded letters count
//   kasemSourceTotal = kasemBastTotal + kasemLetterCount
//   seedLetters      = istintak(kasemSourceTotal)
//
// THEN: Full pipeline — Bast derivations → expanded letters → groups → names
// STOPS AT NAMES. No Vefk. No Magic Square. No MC.
//
// ISOLATION:
//   - Reads Section 2 expanded letters as a read-only prop.
//   - All state, calculations, groups, names are local to this component.
//   - Nothing writes back to Section 1 or Section 2.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getBastLevel as getBastLevelA, istintak, GALIB_ANASIR_VALUES, buildVefk } from "../../lib/mizaanPostEngine";

// ── Design tokens ────────────────────────────────────────────────
const G = {
  gold:         "#F5D060",
  goldDim:      "rgba(245,208,96,0.55)",
  goldFaint:    "rgba(245,208,96,0.12)",
  goldBorder:   "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  glow:         "rgba(212,175,55,0.18)",
  bg:           "rgba(3,6,20,0.99)",
  bgCard:       "rgba(8,16,40,0.98)",
  bgInner:      "rgba(212,175,55,0.06)",
  green:        "#4ADE80",
  greenDim:     "rgba(74,222,128,0.15)",
  red:          "#F87171",
  dim:          "rgba(255,255,255,0.35)",
};

// ── Sub-components ───────────────────────────────────────────────

function SectionHeader({ step, label, arabic, color = G.gold }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg font-inter text-xs font-black flex-shrink-0"
        style={{ background: color + "22", border: `1px solid ${color}55`, color }}>
        {step}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color }}>{label}</span>
          {arabic && <span className="font-amiri text-base" style={{ color: G.goldDim, lineHeight: 1.8, textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased" }}>{arabic}</span>}
        </div>
      </div>
      <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
    </div>
  );
}

function LetterCell({ letter, index, color = G.gold, size = "lg", showIndex = false }) {
  const sizes = { sm: "text-xl px-2.5 py-1.5", lg: "text-3xl px-4 py-2.5", xl: "text-4xl px-5 py-3" };
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`font-amiri font-bold rounded-lg border ${sizes[size]}`}
        style={{
          color,
          borderColor: color + "55",
          background: color + "12",
          lineHeight: 1.8,
          display: "inline-block",
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
        }}>
        {letter}
      </span>
      {showIndex && (
        <span className="font-inter text-[8px] tabular-nums" style={{ color: G.dim }}>{index + 1}</span>
      )}
    </div>
  );
}

function LetterRow({ letters, color = G.gold, size = "lg", showIndex = false, rtl = false }) {
  if (!letters || letters.length === 0) return (
    <span className="font-inter text-xs italic" style={{ color: G.dim }}>—</span>
  );
  return (
    <div className="flex flex-wrap gap-2.5 items-center" style={{ direction: rtl ? "rtl" : "ltr" }}>
      {letters.map((l, i) => (
        <LetterCell key={i} letter={l} index={i} color={color} size={size} showIndex={showIndex} />
      ))}
    </div>
  );
}

function Arrow({ label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
      <span className="font-inter text-base" style={{ color: G.goldDim }}>→</span>
      {label && <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>{label}</span>}
    </div>
  );
}

function Card({ children, accent }) {
  return (
    <div className="rounded-xl border p-4"
      style={{
        background: G.bgCard,
        borderColor: accent ? accent + "55" : G.goldBorder,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}>
      {children}
    </div>
  );
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${G.goldBorder})` }} />
      <span style={{ color: G.goldDim, fontSize: 10 }}>✦</span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${G.goldBorder})` }} />
    </div>
  );
}

// Collapsible expanded letter values — same pattern as Method 1 (Kasem's Vefk source uses the FERD/ZEVC bast level)
function ExpandedLetterValues({ letters, elementColor, getBastLevelFn, bastLevel }) {
  const [isOpen, setIsOpen] = useState(false);
  const safe = Array.isArray(letters) ? letters : [];
  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: G.goldBorder + "40" }}>
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-1.5 text-[7px] uppercase tracking-wider font-bold hover:opacity-70 transition-opacity"
        style={{ color: G.dim }}>
        {isOpen ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
        Expanded Letter Values
      </button>
      {isOpen && (
        <div className="mt-2 space-y-1">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[6px] font-inter">
            {safe.map((letter, idx) => {
              const bast = getBastLevelFn(letter, bastLevel) || 0;
              return (
                <div key={idx} className="contents">
                  <span className="text-right font-amiri" style={{ color: elementColor }}>{letter}</span>
                  <span className="tabular-nums" style={{ color: G.dim }}>{bast.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          {safe.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t text-center" style={{ borderColor: G.goldBorder + "30" }}>
              <span className="text-[6px]" style={{ color: G.dim }}>Total: </span>
              <span className="text-[8px] font-bold tabular-nums" style={{ color: elementColor }}>
                {safe.reduce((s, l) => s + (getBastLevelFn(l, bastLevel) || 0), 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Collapsible source section showing the Kasem derivation
function KasemDerivationSource({ kasemBastTotal, kasemLetterCount, kasemSourceTotal, vefkSourceTotal, elementColor, sourceBreakdown, bastLevel }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: G.goldBorder + "40" }}>
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-1.5 text-[7px] uppercase tracking-wider font-bold hover:opacity-70 transition-opacity"
        style={{ color: G.dim }}>
        {isOpen ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
        Source
      </button>
      {isOpen && (
        <div className="mt-2 text-center space-y-1.5">
          <div className="text-[7px]" style={{ color: G.dim }}>Kasem Pipeline</div>
          {sourceBreakdown ? (
            <>
              <div className="text-[6px] px-2" style={{ color: G.dim }}>Last A'van Name Bast = {(sourceBreakdown.lastNameBast || 0).toLocaleString()}</div>
              <div className="text-[6px]" style={{ color: G.dim }}>+</div>
              <div className="text-[6px] px-2" style={{ color: G.dim }}>Galib Anasir Bast = {(sourceBreakdown.galibAnasirBast || 0).toLocaleString()}</div>
              <div className="text-[6px]" style={{ color: G.dim }}>+</div>
              <div className="text-[6px] px-2" style={{ color: G.dim }}>Previous A'van Input Total = {(sourceBreakdown.previousAvanInputTotal || 0).toLocaleString()}</div>
            </>
          ) : (
            <>
              <div className="text-[6px] px-2" style={{ color: G.dim }}>A'van Expanded Letters Bast Total = {(kasemBastTotal || 0).toLocaleString()}</div>
              <div className="text-[6px]" style={{ color: G.dim }}>+</div>
              <div className="text-[6px] px-2" style={{ color: G.dim }}>A'van Expanded Letters Count = {kasemLetterCount || 0}</div>
            </>
          )}
          <div className="text-[6px]" style={{ color: G.dim }}>↓</div>
          <div className="text-[7px] px-2 py-1.5 rounded font-bold" style={{ background: G.bgInner, color: elementColor }}>
            Kasem Source Total = {(kasemSourceTotal || 0).toLocaleString()}
          </div>
          <div className="text-[6px]" style={{ color: G.dim }}>→ Istintak → Seed Letters → Full Pipeline</div>
          <div className="text-[6px]" style={{ color: G.dim }}>↓</div>
          <div className="text-[7px] px-2 py-1.5 rounded font-bold" style={{ background: G.bgInner, color: elementColor }}>
            Vefk Source (B{bastLevel} Expanded Total) = {(vefkSourceTotal || 0).toLocaleString()}
          </div>
          <div className="text-[6px] px-2" style={{ color: G.dim }}>
            Sum of all Kasem expanded letters' B{bastLevel} values ({bastLevel === 5 ? "FERD" : "ZEVC"})
          </div>
        </div>
      )}
    </div>
  );
}

// ── Source derivation block (display only) ───────────────────────
function KasemSourceDerivation({ section2Letters, bastTotal, letterCount, sourceTotal, seedLetters, elementColor }) {
  const safe = Array.isArray(section2Letters) ? section2Letters : [];

  return (
    <div className="rounded-xl border p-4 space-y-4"
      style={{
        background: "rgba(6,14,36,0.98)",
        borderColor: elementColor + "55",
        borderLeft: `3px solid ${elementColor}`,
        boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg font-inter text-xs font-black flex-shrink-0"
          style={{ background: elementColor + "22", border: `1px solid ${elementColor}55`, color: elementColor }}>
          S
        </div>
        <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: elementColor }}>
          Section 2 Source — Kasem Input Derivation
        </span>
      </div>

      {/* Section 2 Expanded Letters */}
      <div className="space-y-2">
        <div className="font-inter text-[8px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>
          Section 2 — All Expanded Letters
        </div>
        <div className="flex flex-wrap gap-2.5" style={{ direction: "rtl" }}>
          {safe.map((l, i) => (
            <span key={i}
              className="font-amiri font-bold rounded-lg border px-3 py-2 text-2xl leading-relaxed"
              style={{
                color: elementColor,
                borderColor: elementColor + "40",
                background: elementColor + "12",
                lineHeight: 1.8,
                textRendering: "optimizeLegibility",
                WebkitFontSmoothing: "antialiased",
              }}>
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Letter Count */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg border"
        style={{ background: G.bgInner, borderColor: G.goldBorder + "55" }}>
        <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
          Section 2 Expanded Letters Count
        </span>
        <span className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>
          {letterCount}
        </span>
      </div>

      {/* Formula */}
      <div className="rounded-xl border p-3 space-y-2"
        style={{ background: G.bgInner, borderColor: G.goldBorder + "40" }}>
        <div className="font-inter text-[8px] uppercase tracking-widest font-bold text-center" style={{ color: G.dim }}>
          Formula
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
          <div className="space-y-1">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Bast Total</div>
            <div className="font-inter text-sm font-bold tabular-nums" style={{ color: elementColor }}>{bastTotal.toLocaleString()}</div>
          </div>
          <span className="font-inter text-base font-bold" style={{ color: G.goldDim }}>+</span>
          <div className="space-y-1">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Letter Count</div>
            <div className="font-inter text-sm font-bold tabular-nums" style={{ color: G.gold }}>{letterCount}</div>
          </div>
          <span className="font-inter text-base font-bold" style={{ color: G.goldDim }}>=</span>
          <div className="space-y-1">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Result</div>
            <div className="font-inter text-lg font-black tabular-nums" style={{ color: G.gold }}>{sourceTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="h-4 w-px" style={{ background: G.goldBorder }} />
        <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>Istintak</span>
        <span className="font-inter text-base" style={{ color: G.goldDim }}>↓</span>
      </div>

      {/* Seed Letters */}
      <div className="space-y-2">
        <div className="font-inter text-[8px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>
          Istintak Result → Seed Letters for Section 3
        </div>
        <div className="flex flex-wrap gap-3 justify-center" style={{ direction: "rtl" }}>
          {(Array.isArray(seedLetters) ? seedLetters : []).map((l, i) => (
            <span key={i}
              className="font-amiri font-bold rounded-lg border px-4 py-3 text-3xl leading-relaxed"
              style={{
                color: G.gold,
                borderColor: G.goldBorderHi,
                background: G.goldFaint,
                lineHeight: 1.8,
                textRendering: "optimizeLegibility",
                WebkitFontSmoothing: "antialiased",
              }}>
              {l}
            </span>
          ))}
        </div>
        <div className="text-center font-inter text-[8px]" style={{ color: G.dim }}>
          Count: <span style={{ color: G.gold, fontWeight: "bold" }}>{seedLetters?.length || 0}</span>
        </div>
      </div>
    </div>
  );
}

// ── Method 3 Kasem source derivation display — sourceBreakdown-driven (no calc here) ──
function Method3KasemSourceDerivation({ breakdown, sourceTotal, seedLetters, elementColor }) {
  const { lastName, lastNameBast, galibAnasirBast, previousAvanInputTotal } = breakdown;
  return (
    <div className="rounded-xl border p-4 space-y-4"
      style={{
        background: "rgba(6,14,36,0.98)",
        borderColor: elementColor + "55",
        borderLeft: `3px solid ${elementColor}`,
        boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg font-inter text-xs font-black flex-shrink-0"
          style={{ background: elementColor + "22", border: `1px solid ${elementColor}55`, color: elementColor }}>S</div>
        <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: elementColor }}>
          Method 3 Source — Kasem Input Derivation
        </span>
      </div>

      <div className="rounded-xl border p-3 space-y-3" style={{ background: G.bgInner, borderColor: G.goldBorder + "40" }}>
        <div className="font-inter text-[8px] uppercase tracking-widest font-bold text-center" style={{ color: G.dim }}>Formula</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Last A'van Name — Bast</div>
            <div className="font-amiri text-sm" style={{ color: elementColor }} dir="rtl">{lastName}</div>
            <div className="font-inter text-sm font-bold tabular-nums" style={{ color: elementColor }}>{lastNameBast.toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Galib Anasir Bast</div>
            <div className="font-inter text-sm font-bold tabular-nums" style={{ color: G.gold }}>{galibAnasirBast.toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Previous A'van Input Total</div>
            <div className="font-inter text-sm font-bold tabular-nums" style={{ color: G.gold }}>{previousAvanInputTotal.toLocaleString()}</div>
          </div>
        </div>
        <div className="text-center pt-1 border-t" style={{ borderColor: G.goldBorder + "30" }}>
          <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Result</span>
          <div className="font-inter text-lg font-black tabular-nums" style={{ color: G.gold }}>{sourceTotal.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <div className="h-4 w-px" style={{ background: G.goldBorder }} />
        <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>Istintak</span>
        <span className="font-inter text-base" style={{ color: G.goldDim }}>↓</span>
      </div>

      <div className="space-y-2">
        <div className="font-inter text-[8px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>
          Istintak Result → Seed Letters for Method 3 Kasem
        </div>
        <div className="flex flex-wrap gap-3 justify-center" style={{ direction: "rtl" }}>
          {(Array.isArray(seedLetters) ? seedLetters : []).map((l, i) => (
            <span key={i} className="font-amiri font-bold rounded-lg border px-4 py-3 text-3xl leading-relaxed"
              style={{ color: G.gold, borderColor: G.goldBorderHi, background: G.goldFaint, lineHeight: 1.8 }}>
              {l}
            </span>
          ))}
        </div>
        <div className="text-center font-inter text-[8px]" style={{ color: G.dim }}>
          Count: <span style={{ color: G.gold, fontWeight: "bold" }}>{seedLetters?.length || 0}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main exported component ──────────────────────────────────────
// Props:
//   section2ExpandedLetters — Section 2's allExpandedLetters (read-only)
//   dominant                — Galib Anasir key
export default function EsmaKasemSection({ section2ExpandedLetters, dominant, onVefkReady, getBastLevelFn = getBastLevelA, sourceOverride = null, sourceBreakdown = null }) {
  const safe2 = Array.isArray(section2ExpandedLetters) ? section2ExpandedLetters : [];

  // ── STEP 0: Derive Section 3 source from Section 2 expanded letters ──
  const kasemBastTotal   = useMemo(() => (Array.isArray(safe2) ? safe2 : []).reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0), [safe2, getBastLevelFn]);
  const kasemLetterCount = safe2.length;
  const kasemSourceTotal = (sourceOverride != null && sourceOverride > 0) ? sourceOverride : (kasemBastTotal + kasemLetterCount);

  // ── STEP 1: Istintak → Seed Letters ──
  const seedLetters = useMemo(() => istintak(kasemSourceTotal), [kasemSourceTotal]);

  // ── STEP 2: Zevc/Ferd + Bast Level ──
  // RULE: odd final number (kasemSourceTotal) → 5th Bast; even → 4th Bast
  const isSeedFerd = kasemSourceTotal % 2 !== 0;
  const bastLevel  = isSeedFerd ? 5 : 4;
  const bastLabelAr = bastLevel === 5 ? "البسط الخامس" : "البسط الرابع";

  // ── STEP 3: Individual Bast Derivations (reverse order: last → first) ──
  const { derivations, allExpandedLetters } = useMemo(() => {
    const derivs = [];
    let allExpanded = [];
    for (let i = seedLetters.length - 1; i >= 0; i--) {
      const letter    = seedLetters[i];
      const bastValue = getBastLevelFn(letter, bastLevel);
      const expanded  = istintak(bastValue);
      allExpanded = [...allExpanded, ...expanded];
      derivs.push({
        stepNumber:      derivs.length + 1,
        originalLetter:  letter,
        bastValue,
        expandedLetters: expanded,
        seedIndex:       i,
      });
    }
    return { derivations: derivs, allExpandedLetters: allExpanded };
  }, [seedLetters, bastLevel, getBastLevelFn]);

  // ── STEP 4: Group Formation with KASEM completion rule (self-recycle, NOT Galib Anasir)
  // REMAINDER RULE: Recycle from BEGINNING of Kasem's own expanded sequence (NOT Galib Anasir)
  const groupFormation = useMemo(() => {
    const totalExpanded = allExpandedLetters.length;
    const isFerd        = totalExpanded % 2 !== 0;
    const gSize         = isFerd ? 5 : 4;
    const rem           = totalExpanded % gSize;
    let seq  = [...allExpandedLetters];
    let supp = [];

    if (rem > 0) {
      // KASEM RULE: Recycle from BEGINNING of own expanded sequence (NOT Galib Anasir)
      const needed = gSize - rem;
      supp = allExpandedLetters.slice(0, needed);
      seq  = [...allExpandedLetters, ...supp];
    }

    const grps = [];
    for (let i = 0; i < seq.length; i += gSize) {
      const g = seq.slice(i, i + gSize);
      grps.push({ letters: g, name: g.join(""), groupNumber: Math.floor(i / gSize) + 1 });
    }

    return { groups: grps, supplement: supp, remainder: rem, groupSize: gSize, isFerd, totalExpanded };
  }, [allExpandedLetters]);

  const elementColors = { fire: "#FF6B35", earth: "#A5C880", air: "#B2EBF2", water: "#4FC3F7" };
  const elementColor  = elementColors[dominant] || elementColors.fire;

  // ── SECTION 3 VEFK SOURCE: Sum using the Bast level chosen from the FINAL Esma-i Kasem letter count ──
  // RULE: FERD (odd) final Kasem letter count → 5th Bast; ZEVC (even) → 4th Bast
  const vefkBastLevel = groupFormation.isFerd ? 5 : 4;
  const s3VefkSourceNumber = useMemo(
    () => (Array.isArray(allExpandedLetters) ? allExpandedLetters : []).reduce((s, l) => s + (getBastLevelFn(l, vefkBastLevel) || 0), 0),
    [allExpandedLetters, getBastLevelFn, vefkBastLevel]
  );

  const s3Vefk = useMemo(() => {
    if (!s3VefkSourceNumber || s3VefkSourceNumber <= 0) return null;
    return buildVefk(s3VefkSourceNumber, dominant || "fire");
  }, [s3VefkSourceNumber, dominant]);

  // ── SECTION 3 VEFK BORDER: derived from B5 sum of allExpandedLetters → istintak ──
  const s3BorderLetters = useMemo(() => {
    if (!s3VefkSourceNumber) return "";
    return istintak(s3VefkSourceNumber).join("");
  }, [s3VefkSourceNumber]);

  // Derive names from groupFormation groups
  const names = useMemo(() => groupFormation.groups.map(g => g.name), [groupFormation]);

  // Notify parent of the computed vefk data (display-only, no recalc)
  const lastVefkKeyRef = useRef("");
  useEffect(() => {
    if (onVefkReady && s3Vefk) {
      const key = s3VefkSourceNumber + "|" + s3BorderLetters + "|" + names.join(",");
      if (key !== lastVefkKeyRef.current) {
        lastVefkKeyRef.current = key;
        onVefkReady({ vefk: s3Vefk, source: s3VefkSourceNumber, borderLetters: s3BorderLetters, names });
      }
    }
  }, [s3Vefk, s3VefkSourceNumber, s3BorderLetters, names, onVefkReady]);

  if (safe2.length === 0 && !(sourceOverride > 0)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:   G.bg,
        borderColor:  G.goldBorderHi,
        boxShadow:    `0 0 80px ${G.glow}, 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />

      {/* Title Banner */}
      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-3"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
          <span className="font-inter text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Section 3 — Esma-i Kasem</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
        <h2 className="font-amiri text-xl font-bold" style={{ color: G.gold, lineHeight: 1.7, textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased" }}>أسماء القسم</h2>
        <p className="font-inter text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: G.goldDim }}>Manuscript Derivation → Names</p>
      </div>

      <OrnamentalDivider />

      <div className="px-4 pb-6 space-y-5 pt-4">

        {/* ── STEP 0: Source Derivation ── */}
        {sourceBreakdown ? (
          <Method3KasemSourceDerivation
            breakdown={sourceBreakdown}
            sourceTotal={kasemSourceTotal}
            seedLetters={seedLetters}
            elementColor={elementColor}
          />
        ) : (
          <KasemSourceDerivation
            section2Letters={safe2}
            bastTotal={kasemBastTotal}
            letterCount={kasemLetterCount}
            sourceTotal={kasemSourceTotal}
            seedLetters={seedLetters}
            elementColor={elementColor}
          />
        )}

        {/* ── STEP 1: Seed Letters ── */}
        <Card accent={G.gold}>
          <SectionHeader step="1" label="Seed Letters (Istintak)" arabic="الحروف البذرية" color={G.gold} />
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            <LetterRow letters={seedLetters} color={G.gold} size="xl" showIndex rtl />
          </div>
          <div className="text-sm font-inter" style={{ color: G.dim }}>
            Count: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1rem" }}>{seedLetters.length}</span>
            <span style={{ color: G.dim, margin: "0 0.5rem" }}>•</span>
            <span style={{ color: isSeedFerd ? G.red : G.green, fontWeight: "bold", fontSize: "0.95rem" }}>
              {isSeedFerd ? "FERD (فرد)" : "ZEVC (زوج)"}
            </span>
            <span style={{ color: G.dim, margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>
              Bast Level: <span style={{ color: G.gold }}>{bastLabelAr}</span>
            </span>
          </div>
        </Card>

        {/* ── STEP 2: Individual Bast Derivations ── */}
        <Card accent={G.green}>
          <SectionHeader step="2" label="Individual Bast Derivations" arabic="اشتقاق البسط" color={G.green} />
          <div className="space-y-3">
            {derivations.map((d, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border p-3"
                style={{ background: G.bgInner, borderColor: G.goldBorder + "60" }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <LetterCell letter={d.originalLetter} color={G.gold} size="lg" />
                  <Arrow label={`B${bastLevel}`} />
                  <div className="px-3 py-1.5 rounded-lg border flex-shrink-0"
                    style={{ background: G.greenDim, borderColor: G.green + "40" }}>
                    <span className="font-inter text-xs font-bold tabular-nums" style={{ color: G.green }}>
                      {d.bastValue.toLocaleString()}
                    </span>
                  </div>
                  <Arrow label="→" />
                  <div className="flex items-center gap-1 flex-wrap" style={{ direction: "rtl" }}>
                    {d.expandedLetters.map((l, i) => (
                      <LetterCell key={i} letter={l} color={G.green} size="sm" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* ── STEP 3: All Expanded Letters ── */}
        <Card accent={G.gold}>
          <SectionHeader step="3" label="All Expanded Letters" arabic="الحروف الموسعة" color={G.gold} />
          <div className="mb-3">
            <LetterRow letters={allExpandedLetters} color={G.gold} size="lg" showIndex rtl />
          </div>
          <div className="text-sm font-inter" style={{ color: G.dim }}>
            Total Expanded: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1rem" }}>{allExpandedLetters.length}</span>
            <span style={{ color: G.dim, margin: "0 0.5rem" }}>•</span>
            <span style={{ color: groupFormation.isFerd ? G.red : G.green, fontWeight: "bold", fontSize: "0.95rem" }}>
              {groupFormation.isFerd ? "FERD (فرد)" : "ZEVC (زوج)"}
            </span>
            <span style={{ color: G.dim, margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>
              Group Size: <span style={{ color: G.gold }}>{groupFormation.groupSize}</span>
            </span>
          </div>
        </Card>

        {/* ── STEP 4: Group Formation ── */}
        <Card accent={G.gold}>
          <SectionHeader step="4" label="Group Formation" arabic="تكوين المجموعات" color={G.gold} />
          <div className="space-y-3">
            {groupFormation.groups.map((group, gi) => (
              <motion.div key={gi}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.06 }}
                className="rounded-xl border p-3"
                style={{ background: G.bgInner, borderColor: G.goldBorder + "60" }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <LetterRow letters={group.letters} color={G.gold} size="lg" rtl />
                  <Arrow label="→" />
                  <span className="font-amiri text-3xl font-bold px-5 py-3 rounded-xl border"
                    style={{
                      color: G.gold,
                      borderColor: G.goldBorder + "55",
                      background: G.goldFaint,
                      lineHeight: 1.8,
                      textRendering: "optimizeLegibility",
                      WebkitFontSmoothing: "antialiased",
                    }}
                    dir="rtl">
                    {group.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* ── FINAL: Esma-i Kasem Names ── */}
        <Card accent={G.gold}>
          <SectionHeader step="F" label="Final Esma-i Kasem Names" arabic="أسماء القسم النهائية" color={G.gold} />
          <div className="flex flex-col gap-2 py-2">
            {groupFormation.groups.map((group, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
                style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
                <div className="flex items-center justify-center w-7 h-7 rounded-lg font-inter text-sm font-black flex-shrink-0"
                  style={{ background: G.bgInner, color: G.gold, border: `1px solid ${G.goldBorder}` }}>
                  {idx + 1}
                </div>
                <span className="font-amiri text-3xl font-bold flex-1" style={{
                  color: G.gold,
                  lineHeight: 1.8,
                  textRendering: "optimizeLegibility",
                  WebkitFontSmoothing: "antialiased",
                }} dir="rtl">
                  {group.name}
                </span>
              </motion.div>
            ))}
          </div>
          {groupFormation.groups.length > 0 && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border"
                style={{ background: G.bgInner, borderColor: G.goldBorder }}>
                <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>Total Names</span>
                <span className="font-inter text-xl font-bold tabular-nums" style={{ color: G.gold }}>{groupFormation.groups.length}</span>
              </div>
            </div>
          )}
        </Card>

        {/* ── SECTION 3 VEFK MAGIC SQUARE ── */}
        {s3Vefk && (() => {
          const g  = s3Vefk.grid;
          const mc = g[0].reduce((s, v) => s + v, 0);
          const rowSums = g.map(r => r.reduce((a, b) => a + b, 0));
          const colSums = g[0].map((_, j) => g.reduce((s, r) => s + r[j], 0));
          const d1 = g.reduce((s, r, i) => s + r[i], 0);
          const d2 = g.reduce((s, r, i) => s + r[3 - i], 0);
          const allOk = rowSums.every(x => x === mc) && colSums.every(x => x === mc) && d1 === mc && d2 === mc;
          return (
            <>
              <OrnamentalDivider />
              <Card accent={elementColor}>
                <SectionHeader step="V" label="Section 3 Vefk Magic Square" arabic="وفق القسم" color={elementColor} />

                {/* Source value */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border mb-4"
                  style={{ background: G.bgInner, borderColor: G.goldBorder + "55" }}>
                  <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
                    Square Source (B{vefkBastLevel} Expanded Total)
                  </span>
                  <span className="font-inter text-base font-bold tabular-nums" style={{ color: elementColor }}>
                    {s3VefkSourceNumber.toLocaleString()}
                  </span>
                </div>

                {/* Manuscript-style framed grid */}
                {(() => {
                  const borderLetters = [...s3BorderLetters];
                  return (
                    <div className="flex flex-col items-center gap-1 mb-4">
                      <div className="font-amiri text-xl font-bold tracking-widest text-center" dir="rtl"
                        style={{ color: elementColor, textShadow: `0 0 12px ${elementColor}55` }}>
                        {s3BorderLetters}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          {borderLetters.map((l, i) => (
                            <span key={i} className="font-amiri font-bold leading-tight"
                              style={{ color: elementColor, fontSize: "1rem", textShadow: `0 0 8px ${elementColor}55` }}>
                              {l}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {g.flat().map((val, idx) => (
                            <div key={idx}
                              className="aspect-square flex items-center justify-center rounded-lg border font-inter text-sm font-bold tabular-nums"
                              style={{
                                background: idx % 2 === 0 ? G.goldFaint : G.bgInner,
                                borderColor: elementColor + "55",
                                color: elementColor,
                                minWidth: "2.5rem",
                              }}>
                              {val.toLocaleString()}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          {borderLetters.map((l, i) => (
                            <span key={i} className="font-amiri font-bold leading-tight"
                              style={{ color: elementColor, fontSize: "1rem", textShadow: `0 0 8px ${elementColor}55` }}>
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="font-amiri text-xl font-bold tracking-widest text-center" dir="rtl"
                        style={{ color: elementColor, textShadow: `0 0 12px ${elementColor}55` }}>
                        {s3BorderLetters}
                      </div>
                    </div>
                  );
                })()}

                {/* MC + Validation */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border"
                    style={{ background: G.goldFaint, borderColor: elementColor + "40" }}>
                    <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Magic Constant (MC)</span>
                    <span className="font-inter text-sm font-bold tabular-nums" style={{ color: elementColor }}>{mc.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[6px]">
                    {rowSums.map((s, i) => (
                      <div key={i} className="flex justify-between px-2 py-1 rounded"
                        style={{ background: s === mc ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${s === mc ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}` }}>
                        <span style={{ color: G.dim }}>Row {i + 1}</span>
                        <span style={{ color: s === mc ? G.green : G.red, fontWeight: "bold" }}>{s.toLocaleString()} {s === mc ? "✓" : "✗"}</span>
                      </div>
                    ))}
                    {colSums.map((s, i) => (
                      <div key={i} className="flex justify-between px-2 py-1 rounded"
                        style={{ background: s === mc ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${s === mc ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}` }}>
                        <span style={{ color: G.dim }}>Col {i + 1}</span>
                        <span style={{ color: s === mc ? G.green : G.red, fontWeight: "bold" }}>{s.toLocaleString()} {s === mc ? "✓" : "✗"}</span>
                      </div>
                    ))}
                    {[["Diag ↘", d1], ["Diag ↙", d2]].map(([lbl, s]) => (
                      <div key={lbl} className="flex justify-between px-2 py-1 rounded"
                        style={{ background: s === mc ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${s === mc ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}` }}>
                        <span style={{ color: G.dim }}>{lbl}</span>
                        <span style={{ color: s === mc ? G.green : G.red, fontWeight: "bold" }}>{s.toLocaleString()} {s === mc ? "✓" : "✗"}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[6px] font-bold text-center px-2 py-1 rounded"
                    style={{ background: allOk ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", color: allOk ? G.green : G.red }}>
                    {allOk ? "✓ Valid Magic Square — all lines equal MC" : "✗ Invalid Magic Square"}
                  </div>

                  {/* Collapsible: Expanded Letter Values */}
                  <ExpandedLetterValues letters={allExpandedLetters} elementColor={elementColor} getBastLevelFn={getBastLevelFn} bastLevel={vefkBastLevel} />

                  {/* Collapsible: Source derivation */}
                  <KasemDerivationSource
                    kasemBastTotal={kasemBastTotal}
                    kasemLetterCount={kasemLetterCount}
                    kasemSourceTotal={kasemSourceTotal}
                    vefkSourceTotal={s3VefkSourceNumber}
                    elementColor={elementColor}
                    sourceBreakdown={sourceBreakdown}
                    bastLevel={vefkBastLevel}
                  />
                </div>
              </Card>
            </>
          );
        })()}

      </div>

      {/* Bottom accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
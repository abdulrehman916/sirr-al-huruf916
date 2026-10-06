// ═══════════════════════════════════════════════════════════════
// SECTION 2: ESMA-I A'VAN — FULLY ISOLATED PIPELINE
// ─────────────────────────────────────────────────────────────
// INPUT (read-only): Section 1's allExpandedLetters
//
// FORMULA:
//   avanBastTotal   = sum of FirstBast(letter) for each letter
//   avanLetterCount = allExpandedLetters.length
//   avanSourceTotal = avanBastTotal + avanLetterCount
//   seedLetters     = istintak(avanSourceTotal)
//
// THEN: exact same Option 1 pipeline (SatrVahidGrouping + Vefk)
//
// ISOLATION: Nothing feeds back into Section 1.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { runMizaanPostPipeline, getBastLevel as getBastLevelA, istintak, GALIB_ANASIR_VALUES } from "../../lib/mizaanPostEngine";
import SatrVahidGrouping from "./SatrVahidGrouping";
import { ChevronDown, ChevronRight } from "lucide-react";

// ── Same design tokens as MizaanPipelineFull ────────────────────
const G = {
  gold:        "#F5D060",
  goldDim:     "rgba(245,208,96,0.55)",
  goldFaint:   "rgba(212,175,55,0.07)",
  goldBorder:  "rgba(212,175,55,0.40)",
  goldBorderHi:"rgba(212,175,55,0.65)",
  glow:        "rgba(212,175,55,0.18)",
  bg:          "rgba(3,6,20,0.99)",
  bgCard:      "rgba(8,16,40,0.98)",
  bgInner:     "rgba(212,175,55,0.06)",
  dim:         "rgba(255,255,255,0.35)",
};

const ELEMENT_META = {
  fire:  { arabic: "النار",  icon: "🔥", color: "#FF6B35" },
  earth: { arabic: "التراب", icon: "🌍", color: "#A5C880" },
  air:   { arabic: "الهواء", icon: "🌪",  color: "#B2EBF2" },
  water: { arabic: "الماء",  icon: "💧", color: "#4FC3F7" },
};

// ── Sub-components (identical to MizaanPipelineFull) ────────────

function SectionHeader({ step, label, arabic, color = G.gold }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg font-inter text-sm font-black flex-shrink-0"
        style={{ background: color + "22", border: `1px solid ${color}55`, color }}>
        {step}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color }}>{label}</span>
          {arabic && <span className="font-amiri text-base" style={{ color: G.goldDim, lineHeight: 1.8, textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased" }}>{arabic}</span>}
        </div>
      </div>
      <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
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

// Collapsible expanded letter values — identical to Section 1
function ExpandedLetterValues({ letters, elementColor, getBastLevelFn = getBastLevelA }) {
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
              const bast = getBastLevelFn(letter, 1) || 0;
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
                {safe.reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Collapsible source section showing the A'van derivation
function SourceSection({ avanBastTotal, avanLetterCount, avanSourceTotal, vefkSourceTotal, elementColor }) {
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
          <div className="text-[7px]" style={{ color: G.dim }}>A'van Pipeline</div>
          <div className="text-[6px] px-2" style={{ color: G.dim }}>
            Section 1 Expanded Letters Bast Total = {avanBastTotal?.toLocaleString() || 0}
          </div>
          <div className="text-[6px]" style={{ color: G.dim }}>+</div>
          <div className="text-[6px] px-2" style={{ color: G.dim }}>
            Section 1 Expanded Letters Count = {avanLetterCount || 0}
          </div>
          <div className="text-[6px]" style={{ color: G.dim }}>↓</div>
          <div className="text-[7px] px-2 py-1.5 rounded font-bold" style={{ background: G.bgInner, color: elementColor }}>
            A'van Source Total = {avanSourceTotal?.toLocaleString() || 0}
          </div>
          <div className="text-[6px]" style={{ color: G.dim }}>→ Istintak → Seed Letters → Full Pipeline</div>
          <div className="text-[6px]" style={{ color: G.dim }}>↓</div>
          <div className="text-[7px] px-2 py-1.5 rounded font-bold" style={{ background: G.bgInner, color: elementColor }}>
            Vefk Source (Expanded Letters Total) = {vefkSourceTotal?.toLocaleString() || 0}
          </div>
          <div className="text-[6px] px-2" style={{ color: G.dim }}>
            Sum of all A'van expanded letters' First Bast values
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section 1 Source Derivation block — display only, no calc changes ──
function AvanSourceDerivation({ section1Letters, bastTotal, letterCount, sourceTotal, seedLetters, elementColor }) {
  const safe = Array.isArray(section1Letters) ? section1Letters : [];

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
          Section 1 Source — A'van Input Derivation
        </span>
      </div>

      {/* Step 1: Section 1 All Expanded Letters */}
      <div className="space-y-2">
        <div className="font-inter text-[8px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>
          Section 1 — All Expanded Letters
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

      {/* Step 2: Letter Count */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg border"
        style={{ background: G.bgInner, borderColor: G.goldBorder + "55" }}>
        <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
          Section 1 Expanded Letters Count
        </span>
        <span className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>
          {letterCount}
        </span>
      </div>

      {/* Step 3 & 4: Formula + Result */}
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

      {/* Step 5: Istintak Result = Seed Letters */}
      <div className="space-y-2">
        <div className="font-inter text-[8px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>
          Istintak Result → Seed Letters for Section 2
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

// ── Method 3 source derivation display — sourceBreakdown-driven (no calc here) ──
function Method3SourceDerivation({ breakdown, sourceTotal, seedLetters, elementColor }) {
  const { lastName, lastNameBast, galibAnasirBast, nineMizanTotal } = breakdown;
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
          Method 3 Source — A'van Input Derivation
        </span>
      </div>

      <div className="rounded-xl border p-3 space-y-3" style={{ background: G.bgInner, borderColor: G.goldBorder + "40" }}>
        <div className="font-inter text-[8px] uppercase tracking-widest font-bold text-center" style={{ color: G.dim }}>Formula</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Last Kitabet Name — Bast</div>
            <div className="font-amiri text-sm" style={{ color: elementColor }} dir="rtl">{lastName}</div>
            <div className="font-inter text-sm font-bold tabular-nums" style={{ color: elementColor }}>{lastNameBast.toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Galib Anasir Bast</div>
            <div className="font-inter text-sm font-bold tabular-nums" style={{ color: G.gold }}>{galibAnasirBast.toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Nine Mizan Total</div>
            <div className="font-inter text-sm font-bold tabular-nums" style={{ color: G.gold }}>{nineMizanTotal.toLocaleString()}</div>
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
          Istintak Result → Seed Letters for Method 3 A'van
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
//   allExpandedLetters — Section 1 output (read-only, never modified)
//   dominant           — Galib Anasir key from Section 1
export default function EsmaAvanSection({ allExpandedLetters, dominant, onVefkReady, getBastLevelFn = getBastLevelA, sourceOverride = null, sourceBreakdown = null }) {
  const pipeline = useMemo(() => {
    let grandBast, grandLetters;
    if (sourceOverride != null && sourceOverride > 0) {
      // Method 3: starting value already computed upstream — skip Section 1 letters basis
      grandBast = sourceOverride;
      grandLetters = 0;
    } else {
      if (!allExpandedLetters || allExpandedLetters.length === 0) return null;
      grandBast = allExpandedLetters.reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);
      grandLetters = allExpandedLetters.length;
    }
    if (grandBast <= 0) return null;
    // Re-use EXACTLY the same engine as Section 1 — only the input numbers differ
    const result = runMizaanPostPipeline({ grandBast, grandLetters, dominant, getBastLevelFn });
    if (!result) return null;
    return {
      ...result,
      avanBastTotal:   grandBast,
      avanLetterCount: grandLetters,
      avanSourceTotal: grandBast + grandLetters,
    };
  }, [allExpandedLetters, dominant, sourceOverride, getBastLevelFn]);

  // Derive names from group-formation with A'VAN completion rule (self-recycle, NOT Galib Anasir)
  const names = useMemo(() => {
    if (!pipeline?.initialSeedLetters?.length) return [];
    const seed = pipeline.initialSeedLetters;
    const isFerd = seed.length % 2 !== 0;
    const bastLevel = isFerd ? 5 : 4;
    let allExpanded = [];
    for (let i = seed.length - 1; i >= 0; i--) {
      allExpanded = [...allExpanded, ...istintak(getBastLevelFn(seed[i], bastLevel))];
    }
    const gSize = allExpanded.length % 2 !== 0 ? 5 : 4;
    const rem = allExpanded.length % gSize;
    let seq = [...allExpanded];
    if (rem > 0) {
      // A'VAN RULE: Recycle from BEGINNING of own expanded sequence (NOT Galib Anasir)
      const needed = gSize - rem;
      const supplement = allExpanded.slice(0, needed);
      seq = [...seq, ...supplement];
    }
    const groups = [];
    for (let i = 0; i < seq.length; i += gSize) {
      groups.push(seq.slice(i, i + gSize).join(""));
    }
    return groups;
  }, [pipeline, getBastLevelFn]);

  // Notify parent of vefk data for the Final Summary
  const lastVefkKeyRef = useRef("");
  useEffect(() => {
    if (onVefkReady && pipeline?.vefk) {
      const key = pipeline.vefkSourceNumber + "|" + names.join(",");
      if (key !== lastVefkKeyRef.current) {
        lastVefkKeyRef.current = key;
        onVefkReady({ vefk: pipeline.vefk, source: pipeline.vefkSourceNumber, names });
      }
    }
  }, [pipeline, names, onVefkReady]);

  if (!pipeline) return null;

  const {
    initialSeedLetters,
    vefk,
    allExpandedLetters: avanExpanded,
    avanBastTotal,
    avanLetterCount,
    avanSourceTotal,
    expandedLettersTotal,
  } = pipeline;

  const element     = dominant || "fire";
  const elementMeta = ELEMENT_META[element] || ELEMENT_META.fire;
  const vefkSource  = (Array.isArray(avanExpanded) ? avanExpanded : []).reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);

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
          <span className="font-inter text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Section 2 — Esma-i A'van</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
        <h2 className="font-amiri text-xl font-bold" style={{ color: G.gold, lineHeight: 1.7, textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased" }}>أسماء الأعوان</h2>
        <p className="font-inter text-[10px] uppercase tracking-[0.2em] mt-1.5" style={{ color: G.goldDim }}>Manuscript Derivation → Vefk</p>
      </div>

      <OrnamentalDivider />

      <div className="px-4 pb-6 space-y-5 pt-4">

        {/* ── STEP 0: A'VAN SOURCE DERIVATION ── */}
        {sourceBreakdown ? (
          <Method3SourceDerivation
            breakdown={sourceBreakdown}
            sourceTotal={avanSourceTotal}
            seedLetters={initialSeedLetters}
            elementColor={elementMeta.color}
          />
        ) : (
          <AvanSourceDerivation
            section1Letters={allExpandedLetters}
            bastTotal={avanBastTotal}
            letterCount={avanLetterCount}
            sourceTotal={avanSourceTotal}
            seedLetters={initialSeedLetters}
            elementColor={elementMeta.color}
          />
        )}

        {/* ── COMPLETE DERIVATION CHAIN (Steps 1–4 + Names) ── */}
        {/* SatrVahidGrouping contains:                         */}
        {/* Step 1: Original Seed Letters                       */}
        {/* Step 2: Individual Bast Derivations                 */}
        {/* Step 3: All Expanded Letters                        */}
        {/* Step 4: Group Formation                             */}
        {/* Step F: Final Names Array                           */}
        <SatrVahidGrouping
          satrVahidLetters={initialSeedLetters}
          dominant={dominant}
          sectionLabel="SECTION 2 — Esma-i A'van"
          sectionArabic="أسماء الأعوان"
          sectionSubtitle="A'van Derivation Workflow"
          getBastLevelFn={getBastLevelFn}
          completionRule="self-recycle"
        />

        {/* ── VEFK MAGIC SQUARE (Step 5) ── */}
        {vefk && (
          <Card accent={elementMeta.color}>
            <SectionHeader step="5" label="Vefk Magic Square" arabic="الوفق" color={elementMeta.color} />

            {/* Element Info */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{elementMeta.icon}</span>
              <div className="flex items-center gap-2">
                <span className="font-amiri text-lg" style={{ color: elementMeta.color }}>{elementMeta.arabic}</span>
                <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>({element})</span>
              </div>
            </div>

            {/* Manuscript-style framed Vefk — guardian letters on all 4 sides */}
            {(() => {
              const guardianName    = vefk.guardianName || "";
              const guardianLetters = [...guardianName];
              return (
                <div className="flex flex-col items-center gap-1 mb-4">
                  {/* TOP */}
                  <div className="font-amiri text-xl font-bold tracking-widest text-center" dir="rtl"
                    style={{
                      color: elementMeta.color,
                      textShadow: `0 0 12px ${elementMeta.color}55`,
                      lineHeight: 1.7,
                      textRendering: "optimizeLegibility",
                      WebkitFontSmoothing: "antialiased",
                    }}>
                    {guardianName}
                  </div>
                  {/* MIDDLE: Left | Grid | Right */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center gap-1">
                      {guardianLetters.map((l, i) => (
                        <span key={i} className="font-amiri font-bold"
                          style={{
                            color: elementMeta.color,
                            fontSize: "1.1rem",
                            lineHeight: 1.9,
                            textShadow: `0 0 8px ${elementMeta.color}55`,
                            textRendering: "optimizeLegibility",
                            WebkitFontSmoothing: "antialiased",
                          }}>
                          {l}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {vefk.grid.flat().map((val, idx) => (
                        <div key={idx}
                          className="aspect-square flex items-center justify-center rounded-lg border font-inter text-sm font-bold tabular-nums"
                          style={{
                            background: idx % 2 === 0 ? G.goldFaint : G.bgInner,
                            borderColor: elementMeta.color + "55",
                            color: elementMeta.color,
                            minWidth: "2.5rem",
                          }}>
                          {val.toLocaleString()}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                      {guardianLetters.map((l, i) => (
                        <span key={i} className="font-amiri font-bold"
                          style={{
                            color: elementMeta.color,
                            fontSize: "1.1rem",
                            lineHeight: 1.9,
                            textShadow: `0 0 8px ${elementMeta.color}55`,
                            textRendering: "optimizeLegibility",
                            WebkitFontSmoothing: "antialiased",
                          }}>
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* BOTTOM */}
                  <div className="font-amiri text-xl font-bold tracking-widest text-center" dir="rtl"
                    style={{
                      color: elementMeta.color,
                      textShadow: `0 0 12px ${elementMeta.color}55`,
                      lineHeight: 1.7,
                      textRendering: "optimizeLegibility",
                      WebkitFontSmoothing: "antialiased",
                    }}>
                    {guardianName}
                  </div>
                </div>
              );
            })()}

            {/* Magic Constant + Row/Col/Diag validation */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border"
                style={{ background: G.goldFaint, borderColor: elementMeta.color + "40" }}>
                <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Magic Constant (MC)</span>
                <span className="font-inter text-sm font-bold tabular-nums" style={{ color: elementMeta.color }}>
                  {vefk.grid[0].reduce((s, v) => s + v, 0).toLocaleString()}
                </span>
              </div>

              {(() => {
                const g       = vefk.grid;
                const mc      = g[0].reduce((s, v) => s + v, 0);
                const rowSums = g.map(r => r.reduce((a, b) => a + b, 0));
                const colSums = g[0].map((_, j) => g.reduce((s, r) => s + r[j], 0));
                const d1      = g.reduce((s, r, i) => s + r[i], 0);
                const d2      = g.reduce((s, r, i) => s + r[3 - i], 0);
                const allOk   = rowSums.every(x => x === mc) && colSums.every(x => x === mc) && d1 === mc && d2 === mc;
                return (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-1 text-[6px]">
                      {rowSums.map((s, i) => (
                        <div key={i} className="flex justify-between px-2 py-1 rounded"
                          style={{ background: s === mc ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${s === mc ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}` }}>
                          <span style={{ color: G.dim }}>Row {i + 1}</span>
                          <span style={{ color: s === mc ? "#4ADE80" : "#F87171", fontWeight: "bold" }}>{s.toLocaleString()} {s === mc ? "✓" : "✗"}</span>
                        </div>
                      ))}
                      {colSums.map((s, i) => (
                        <div key={i} className="flex justify-between px-2 py-1 rounded"
                          style={{ background: s === mc ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${s === mc ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}` }}>
                          <span style={{ color: G.dim }}>Col {i + 1}</span>
                          <span style={{ color: s === mc ? "#4ADE80" : "#F87171", fontWeight: "bold" }}>{s.toLocaleString()} {s === mc ? "✓" : "✗"}</span>
                        </div>
                      ))}
                      {[["Diag ↘", d1], ["Diag ↙", d2]].map(([lbl, s]) => (
                        <div key={lbl} className="flex justify-between px-2 py-1 rounded"
                          style={{ background: s === mc ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${s === mc ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}` }}>
                          <span style={{ color: G.dim }}>{lbl}</span>
                          <span style={{ color: s === mc ? "#4ADE80" : "#F87171", fontWeight: "bold" }}>{s.toLocaleString()} {s === mc ? "✓" : "✗"}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-[6px] font-bold text-center px-2 py-1 rounded"
                      style={{ background: allOk ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", color: allOk ? "#4ADE80" : "#F87171" }}>
                      {allOk ? "✓ Valid Magic Square — all lines equal MC" : "✗ Invalid Magic Square"}
                    </div>
                  </div>
                );
              })()}

              {/* Collapsible: Expanded Letter Values */}
              <ExpandedLetterValues letters={avanExpanded} elementColor={elementMeta.color} getBastLevelFn={getBastLevelFn} />

              {/* Collapsible: Source derivation */}
              <SourceSection
                avanBastTotal={avanBastTotal}
                avanLetterCount={avanLetterCount}
                avanSourceTotal={avanSourceTotal}
                vefkSourceTotal={vefkSource}
                elementColor={elementMeta.color}
              />
            </div>
          </Card>
        )}

      </div>

      {/* Bottom accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
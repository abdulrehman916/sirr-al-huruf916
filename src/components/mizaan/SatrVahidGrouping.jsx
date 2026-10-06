import { useMemo } from "react";
import { motion } from "framer-motion";
import { getBastLevel as getBastLevelA, istintak, GALIB_ANASIR_VALUES } from "../../lib/mizaanPostEngine";

// ── Design tokens ─────────────────────────────────────────────
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
  green:    "#4ADE80",
  greenDim: "rgba(74,222,128,0.15)",
  red:      "#F87171",
  redDim:   "rgba(248,113,113,0.15)",
  purple:   "#C4B5FD",
  purpleDim:"rgba(196,181,253,0.15)",
  blue:     "#93C5FD",
  blueDim:  "rgba(147,197,253,0.15)",
  white:    "rgba(255,255,255,0.85)",
  dim:      "rgba(255,255,255,0.35)",
};

// ── Shared sub-components ──────────────────────────────────────

function SectionHeader({ label, arabic, step, color = G.gold }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg font-inter text-sm font-black flex-shrink-0"
        style={{ background: color + "22", border: `1px solid ${color}55`, color }}>
        {step}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color }}>{label}</span>
          {arabic && <span className="font-amiri text-sm" style={{ color: G.goldDim, lineHeight: 1.7, textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased" }}>{arabic}</span>}
        </div>
      </div>
      <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
    </div>
  );
}

function LetterCell({ letter, index, color = G.gold, size = "lg", showIndex = false, bgColor }) {
  const sizes = { sm: "text-lg px-2.5 py-1.5", lg: "text-2xl px-4 py-2.5", xl: "text-3xl px-5 py-3" };
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`font-amiri font-bold rounded-lg border ${sizes[size]}`}
        style={{
          color,
          borderColor: color + "55",
          background: bgColor || color + "12",
          lineHeight: 1.8,
          display: "inline-block",
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {letter}
      </span>
      {showIndex && (
        <span className="font-inter text-[9px] tabular-nums" style={{ color: G.dim, lineHeight: 1.5 }}>{index + 1}</span>
      )}
    </div>
  );
}

function LetterRow({ letters, color = G.gold, size = "lg", showIndex = false, rtl = false }) {
  if (!letters || letters.length === 0) return (
    <span className="font-inter text-sm italic" style={{ color: G.dim }}>—</span>
  );
  return (
    <div className="flex flex-wrap gap-2.5 items-center" style={{ direction: rtl ? "rtl" : "ltr", unicodeBidi: rtl ? "normal" : "isolate" }}>
      {letters.map((l, i) => (
        <LetterCell key={i} letter={l} index={i} color={color} size={size} showIndex={showIndex} />
      ))}
    </div>
  );
}

function Arrow({ label }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <span className="font-inter text-lg" style={{ color: G.goldDim }}>→</span>
      {label && <span className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim, lineHeight: 1.5 }}>{label}</span>}
    </div>
  );
}

function Card({ children, accent, className = "" }) {
  return (
    <div
      className={`rounded-xl border p-5 ${className}`}
      style={{
        background: G.bgCard,
        borderColor: accent ? accent + "55" : G.goldBorder,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        boxShadow: `0 2px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}
    >
      {children}
    </div>
  );
}

function StatRow({ label, value, valueColor = G.gold }) {
  return (
    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: G.goldBorder + "55" }}>
      <span className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>{label}</span>
      <span className="font-inter text-lg font-bold tabular-nums" style={{ color: valueColor, lineHeight: 1.5 }}>{value}</span>
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

// ── Main component ─────────────────────────────────────────────
export default function SatrVahidGrouping({
  satrVahidLetters = [],
  dominant = "fire",
  sectionLabel = "OPTION 1 — Esma-i Kitabet",
  sectionArabic = "أسماء الكتابة",
  sectionSubtitle = "Complete Manuscript Workflow",
  getBastLevelFn = getBastLevelA,
  completionRule = "galib", // "galib" | "self-recycle"
}) {
  const safeSeed = Array.isArray(satrVahidLetters) ? satrVahidLetters : [];
  const totalSeed = safeSeed.length;
  const isSeedFerd = totalSeed % 2 !== 0;
  const bastLevel = isSeedFerd ? 5 : 4;
  const bastLabelAr = bastLevel === 5 ? "البسط الخامس" : "البسط الرابع";

  // ── STEP 1: Individual Bast Derivations (REVERSE ORDER: last → first) ──
  // CRITICAL: Process Bast derivations from LAST seed letter to FIRST
  // Original Seed Letters display remains unchanged (forward order)
  // But Bast processing: last seed → first seed
  const { derivations, allExpandedLetters } = useMemo(() => {
    const derivs = [];
    let allExpanded = [];
    
    // Process in REVERSE order: last index → first index
    for (let i = safeSeed.length - 1; i >= 0; i--) {
      const letter = safeSeed[i];
      const bastValue = getBastLevelFn(letter, bastLevel);
      const expanded = istintak(bastValue);
      
      // Concatenate expanded letters in reverse derivation order
      allExpanded = [...allExpanded, ...expanded];
      
      derivs.push({
        stepNumber: derivs.length + 1,
        originalLetter: letter,
        bastValue,
        expandedLetters: expanded,
        expandedCount: expanded.length,
        seedIndex: i,
      });
    }
    
    return {
      derivations: derivs,
      allExpandedLetters: allExpanded,
    };
  }, [safeSeed, bastLevel, getBastLevelFn]);

  // ── STEP 2: Group Formation from Expanded Letters ──
  const groupFormation = useMemo(() => {
    const totalExpanded = allExpandedLetters.length;
    const isFerd = totalExpanded % 2 !== 0;
    const gSize = isFerd ? 5 : 4;
    const rem = totalExpanded % gSize;
    let seq = [...allExpandedLetters];
    let supp = [];
    
    // COMPLETION RULE: Kitabet uses Galib Anasir; A'van/Kasem use self-recycle
    if (rem > 0) {
      const needed = gSize - rem;
      if (completionRule === "self-recycle") {
        // A'VAN/KASEM RULE: Recycle from BEGINNING of own expanded sequence
        supp = allExpandedLetters.slice(0, needed);
      } else {
        // KITABET RULE: Istintak of Galib Anasir's 1st Bast value
        const galibValue = GALIB_ANASIR_VALUES[dominant] || GALIB_ANASIR_VALUES.fire;
        const galibIstintakLetters = istintak(galibValue);
        supp = galibIstintakLetters.slice(0, needed);
      }
      seq = [...allExpandedLetters, ...supp];
    }
    
    const grps = [];
    for (let i = 0; i < seq.length; i += gSize) {
      const g = seq.slice(i, i + gSize);
      grps.push({
        letters: g,
        name: g.join(""),
        groupNumber: Math.floor(i / gSize) + 1,
        positions: `${i + 1}-${i + g.length}`,
      });
    }
    
    return {
      finalSequence: seq,
      supplement: supp,
      remainder: rem,
      groups: grps,
      groupSize: gSize,
      isFerd,
      totalExpanded,
    };
  }, [allExpandedLetters, dominant, completionRule]);

  const dominantLabel = { fire: "النار", earth: "التراب", air: "الهواء", water: "الماء" }[dominant] || dominant;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: G.bg,
        borderColor: G.goldBorderHi,
        boxShadow: `0 0 80px ${G.glow}, 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      {/* ══ Top accent line ══ */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />

      {/* ══ Title Banner ══ */}
      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-3"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
          <span className="font-inter text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>{sectionLabel}</span>
          <span className="font-amiri text-lg" style={{ color: G.goldDim }}>✦</span>
        </div>
        <h2 className="font-amiri text-xl font-bold" style={{ color: G.gold, lineHeight: 1.7, textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased" }}>{sectionArabic}</h2>
        <p className="font-inter text-[10px] uppercase tracking-[0.2em] mt-1.5" style={{ color: G.goldDim }}>{sectionSubtitle}</p>
      </div>

      <OrnamentalDivider />

      <div className="px-4 pb-6 space-y-5 pt-4">

        {/* ══ STEP 1: ORIGINAL SEED LETTERS ══ */}
        <Card accent={G.gold}>
          <SectionHeader step="1" label="Original Seed Letters (Istintak)" arabic="الحروف البذرية" color={G.gold} />
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            <LetterRow letters={safeSeed} color={G.gold} size="xl" showIndex rtl />
          </div>
          <div className="text-[15px] font-inter" style={{ color: G.dim, lineHeight: 1.6 }}>
            Count: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1.1rem" }}>{totalSeed}</span>
            <span style={{ color: G.dim, margin: "0 0.5rem" }}>•</span>
            <span style={{
              color: isSeedFerd ? G.red : G.green,
              fontWeight: "bold",
              fontSize: "0.95rem"
            }}>
              {isSeedFerd ? "FERD (فرد)" : "ZEVC (زوج)"}
            </span>
            <span style={{ color: G.dim, margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>
              Bast Level: <span style={{ color: G.gold }}>{bastLabelAr}</span>
            </span>
          </div>
        </Card>

        {/* ══ STEP 2: INDIVIDUAL BAST DERIVATIONS ══ */}
        <Card accent={G.green}>
          <SectionHeader step="2" label="Individual Bast Derivations" arabic="اشتقاق البسط" color={G.green} />
          <div className="space-y-3">
            {derivations.map((d, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border p-3"
                style={{
                  background: G.bgInner,
                  borderColor: G.goldBorder + "60",
                }}
              >
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

        {/* ══ STEP 3: ALL EXPANDED LETTERS ══ */}
        <Card accent={G.gold}>
          <SectionHeader step="3" label="All Expanded Letters" arabic="الحروف الموسعة" color={G.gold} />
          <div className="mb-3">
            <LetterRow letters={allExpandedLetters} color={G.gold} size="lg" showIndex rtl />
          </div>
          <div className="text-sm font-inter" style={{ color: G.dim }}>
            Total Expanded: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1rem" }}>{allExpandedLetters.length}</span>
            <span style={{ color: G.dim, margin: "0 0.5rem" }}>•</span>
            <span style={{
              color: groupFormation.isFerd ? G.red : G.green,
              fontWeight: "bold",
              fontSize: "0.95rem"
            }}>
              {groupFormation.isFerd ? "FERD (فرد)" : "ZEVC (زوج)"}
            </span>
            <span style={{ color: G.dim, margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>
              Group Size: <span style={{ color: G.gold }}>{groupFormation.groupSize}</span>
            </span>
          </div>
        </Card>

        {/* ══ STEP 4: GROUP FORMATION ══ */}
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
                  <span className="font-amiri text-2xl font-bold px-5 py-3 rounded-xl border"
                    style={{
                      color: G.gold,
                      borderColor: G.goldBorder + "55",
                      background: G.goldFaint,
                      lineHeight: 1.7,
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

        {/* ══ FINAL ESMA-I KITABET NAMES SUMMARY ══ */}
        <Card accent={G.gold}>
          <SectionHeader step="F" label={`Final ${sectionArabic} Names`} arabic="الأسماء النهائية" color={G.gold} />
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
                <span className="font-amiri text-2xl font-bold flex-1" style={{
                  color: G.gold,
                  lineHeight: 1.7,
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

      </div>

      {/* ══ Bottom accent line ══ */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
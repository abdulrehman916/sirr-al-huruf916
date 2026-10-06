import { useMemo } from "react";
import { motion } from "framer-motion";
import { istintak, getBastLevel, GALIB_ANASIR_VALUES } from "../../lib/mizaanPostEngine";

const G = {
  gold:     "#F5D060",
  goldDim:  "rgba(245,208,96,0.55)",
  goldFaint:"rgba(212,175,55,0.07)",
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
  dim:      "rgba(255,255,255,0.35)",
};

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
          {arabic && <span className="font-amiri text-sm" style={{ color: G.goldDim }}>{arabic}</span>}
        </div>
      </div>
      <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
    </div>
  );
}

function LetterCell({ letter, color = G.gold, size = "lg" }) {
  const sizes = { sm: "text-lg px-2 py-1", lg: "text-2xl px-3 py-2", xl: "text-3xl px-4 py-2.5" };
  return (
    <span
      className={`font-amiri font-bold rounded-lg border ${sizes[size]}`}
      style={{
        color,
        borderColor: color + "55",
        background: color + "12",
        lineHeight: 1.2,
        display: "inline-block",
      }}
    >
      {letter}
    </span>
  );
}

function Card({ children, accent }) {
  return (
    <div
      className="rounded-xl border p-4"
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

function Arrow({ label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
      <span className="font-inter text-base" style={{ color: G.goldDim }}>→</span>
      {label && <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>{label}</span>}
    </div>
  );
}

export default function Option1DerivationChain({ seedLetters, dominant }) {
  const safeSeed = Array.isArray(seedLetters) ? seedLetters : [];
  const totalSeed = safeSeed.length;
  
  // MANUSCRIPT RULE: Determine Bast level from Ferd/Zevc
  const isFerd = totalSeed % 2 !== 0;
  const bastLevel = isFerd ? 5 : 4;
  const bastLabelAr = bastLevel === 5 ? "البسط الخامس" : "البسط الرابع";
  const groupSize = isFerd ? 5 : 4;

  // ══ STEP 1: BAST EXPANSION FOR EACH SEED LETTER ═══════════════
  const { derivations, totalBastSum, allExpandedLetters } = useMemo(() => {
    const derivs = [];
    let runningBastSum = 0;
    let allExpanded = [];

    for (let i = 0; i < safeSeed.length; i++) {
      const letter = safeSeed[i];
      const bastValue = getBastLevel(letter, bastLevel);
      const expanded = istintak(bastValue);
      
      runningBastSum += bastValue;
      allExpanded = [...allExpanded, ...expanded];

      derivs.push({
        stepNumber: i + 1,
        originalLetter: letter,
        bastValue,
        expandedLetters: expanded,
        expandedCount: expanded.length,
        runningBastSum,
        bastLevel,
      });
    }

    return {
      derivations: derivs,
      totalBastSum: runningBastSum,
      allExpandedLetters: allExpanded,
    };
  }, [safeSeed, bastLevel]);

  // ══ STEP 2: COMBINED EXPANDED SEQUENCE ════════════════════════
  const combinedCount = allExpandedLetters.length;
  const combinedIsFerd = combinedCount % 2 !== 0;
  const combinedGroupSize = combinedIsFerd ? 5 : 4;

  // ══ STEP 3: GROUP FORMATION WITH REMAINDER ════════════════════
  const { finalSequence, supplementLetters, remainder, groups } = useMemo(() => {
    const rem = combinedCount % combinedGroupSize;
    let seq = [...allExpandedLetters];
    let supp = [];
    
    if (rem > 0) {
      const needed = combinedGroupSize - rem;
      const galibVal = GALIB_ANASIR_VALUES[dominant] || GALIB_ANASIR_VALUES.fire;
      supp = istintak(galibVal).slice(0, needed);
      seq = [...allExpandedLetters, ...supp];
    }

    const grps = [];
    for (let i = 0; i < seq.length; i += combinedGroupSize) {
      const groupLetters = seq.slice(i, i + combinedGroupSize);
      grps.push({
        groupNumber: Math.floor(i / combinedGroupSize) + 1,
        letters: groupLetters,
        name: groupLetters.join(""),
        positions: `${i + 1}-${i + groupLetters.length}`,
      });
    }

    return {
      finalSequence: seq,
      supplementLetters: supp,
      remainder: rem,
      groups: grps,
    };
  }, [allExpandedLetters, combinedGroupSize, dominant]);

  return (
    <Card accent={G.gold}>
      <SectionHeader step="C" label="Individual Bast Derivations" arabic="اشتقاق البسط" color={G.green} />

      {/* Individual Derivation Steps */}
      <div className="space-y-3 mb-4">
        {derivations.map((deriv, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border p-3"
            style={{
              background: idx === 0 ? G.green + "08" : G.bgInner,
              borderColor: idx === 0 ? G.green + "40" : G.goldBorder + "60",
            }}
          >
            {/* Step Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-6 h-6 rounded font-inter text-[9px] font-black flex-shrink-0"
                style={{
                  background: idx === 0 ? G.green : G.goldFaint,
                  color: idx === 0 ? "#000" : G.goldDim,
                  border: `1px solid ${idx === 0 ? G.green : G.goldBorder}`,
                }}>
                {deriv.stepNumber}
              </div>
              <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
                {idx === 0 ? "LAST letter (start)" : idx === derivations.length - 1 ? "FIRST letter (end)" : `Step ${deriv.stepNumber}`}
              </span>
            </div>

            {/* Derivation Chain */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Original Letter */}
              <LetterCell letter={deriv.originalLetter} color={G.gold} size="lg" />
              
              <Arrow label={`Bast ${deriv.bastLevel}`} />
              
              {/* Bast Value */}
              <div className="px-3 py-1.5 rounded-lg border flex-shrink-0"
                style={{ background: G.greenDim, borderColor: G.green + "40" }}>
                <span className="font-inter text-xs font-bold tabular-nums" style={{ color: G.green }}>
                  {deriv.bastValue.toLocaleString()}
                </span>
              </div>
              
              <Arrow label="Istintak" />
              
              {/* Expanded Letters */}
              <div className="flex items-center gap-1 flex-wrap" style={{ direction: "rtl" }}>
                {deriv.expandedLetters.map((l, i) => (
                  <LetterCell key={i} letter={l} color={G.green} size="sm" />
                ))}
                <span className="font-inter text-[8px] ml-1" style={{ color: G.dim }}>
                  ({deriv.expandedCount})
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="px-3 py-2 rounded-lg border text-center"
          style={{ background: G.bgInner, borderColor: G.goldBorder }}>
          <div className="font-inter text-[6px] uppercase tracking-wider" style={{ color: G.dim }}>Total Bast (Σ)</div>
          <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{totalBastSum.toLocaleString()}</div>
        </div>
        <div className="px-3 py-2 rounded-lg border text-center"
          style={{ background: G.bgInner, borderColor: G.goldBorder }}>
          <div className="font-inter text-[6px] uppercase tracking-wider" style={{ color: G.dim }}>Expanded Letters</div>
          <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{combinedCount}</div>
        </div>
      </div>

      {/* Combined Expanded Sequence */}
      <div className="mb-4 px-4 py-3 rounded-xl border"
        style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: G.goldDim }}>
            Combined Expanded Sequence (All Letters)
          </span>
          <span className="font-inter text-sm font-bold tabular-nums" style={{ color: G.gold }}>
            {combinedCount} letters
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center" style={{ direction: "rtl" }}>
          {allExpandedLetters.map((l, i) => (
            <LetterCell key={i} letter={l} color={G.gold} size="sm" showIndex />
          ))}
        </div>
      </div>

      {/* Group Formation */}
      {remainder > 0 && (
        <div className="mb-4 px-4 py-3 rounded-xl border"
          style={{ background: G.greenDim, borderColor: G.green + "40" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: G.green }}>
              Remainder Correction
            </span>
            <span className="font-inter text-xs font-bold tabular-nums" style={{ color: G.green }}>
              +{supplementLetters.length} letters
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[8px] mb-2">
            <div className="flex justify-between">
              <span style={{ color: G.dim }}>Group Size</span>
              <span style={{ color: G.gold }}>{combinedGroupSize}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: G.dim }}>Remainder</span>
              <span style={{ color: G.red }}>{remainder} → need {supplementLetters.length}</span>
            </div>
          </div>
          <div className="font-inter text-[7px] uppercase tracking-wider mb-1" style={{ color: G.dim }}>
            Supplement letters (from Galib Anasir):
          </div>
          <div className="flex flex-wrap gap-1" style={{ direction: "rtl" }}>
            {supplementLetters.map((l, i) => (
              <LetterCell key={i} letter={l} color={G.green} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Final Group Formation */}
      <div className="space-y-2">
        {groups.map((group, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="rounded-xl border p-3"
            style={{ background: G.bgInner, borderColor: G.goldBorder + "60" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded flex items-center justify-center font-inter text-[9px] font-black"
                  style={{ background: G.goldFaint, color: G.gold, border: `1px solid ${G.goldBorder}` }}>
                  {group.groupNumber}
                </div>
                <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
                  Group {group.groupNumber} — Positions {group.positions}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 flex-wrap" style={{ direction: "rtl" }}>
                {group.letters.map((l, i) => (
                  <LetterCell key={i} letter={l} color={G.gold} size="lg" />
                ))}
              </div>
              <Arrow label="→" />
              <span className="font-amiri text-2xl font-bold px-4 py-2 rounded-xl border"
                style={{ color: G.green, borderColor: G.green + "55", background: G.greenDim }}
                dir="rtl">
                {group.name}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Final Names Summary */}
      <div className="mt-4 px-4 py-3 rounded-xl border text-center"
        style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
        <div className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.goldDim }}>
          Total Esma-i Kitabet Names Generated
        </div>
        <div className="font-inter text-2xl font-bold tabular-nums" style={{ color: G.gold }}>
          {groups.length}
        </div>
      </div>
    </Card>
  );
}
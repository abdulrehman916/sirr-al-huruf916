// ═══════════════════════════════════════════════════════════════
// METHOD 4 — SHARED PIPELINE (identical to Methods 1, 2, 3)
// ─────────────────────────────────────────────────────────────
// Nine Mizan stage is shared/identical with Methods 1-3 (computed upstream).
// This component reuses the EXACT same steps as SatrVahidGrouping /
// MizaanPipelineFull, up to and including the Expanded Total:
//   1. Nine Mizan Total → Istintak → Seed Letters
//   2. Count seed letters → FERD (odd, 5th Bast) / ZEVC (even, 4th Bast)
//   3. Individual Bast Derivations (reverse order: last seed → first),
//      each seed letter's Bast value → istintak → expanded letters
//   4. All Expanded Letters (concatenation of every derivation)
//   5. Expanded Total = sum of First Bast (Bast 1) of all expanded letters
//      — identical to vefkSourceNumber/expandedLettersTotal in runMizaanPostPipeline
// STOPS HERE — Method 4 has not been defined past this point yet.
// No grouping into names, no Vefk, no Method-4-specific logic.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { istintak, getBastLevel as getBastLevelDefault, GALIB_ANASIR_VALUES, ELEMENT_LETTERS, buildVefk } from "../../lib/mizaanPostEngine";
import Method4FinalSummary from "./Method4FinalSummary";
import Method4VefkCard from "./Method4VefkCard";
import Method4AlternativeReading from "./Method4AlternativeReading";
import Method4BookMethodSection from "./Method4BookMethodSection";
import Method4FinalVefkSummary from "./Method4FinalVefkSummary";
import Method4Conclusion from "./Method4Conclusion";

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
          {arabic && <span className="font-amiri text-sm" style={{ color: G.goldDim, lineHeight: 1.7 }}>{arabic}</span>}
        </div>
      </div>
      <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
    </div>
  );
}

function Card({ children, accent }) {
  return (
    <div className="rounded-xl border p-5"
      style={{
        background: G.bgCard,
        borderColor: accent ? accent + "55" : G.goldBorder,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        boxShadow: `0 2px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}>
      {children}
    </div>
  );
}

function LetterCell({ letter, index, color = G.gold, size = "lg", showIndex = false }) {
  const sizes = { sm: "text-lg px-2.5 py-1.5", lg: "text-2xl px-4 py-2.5", xl: "text-3xl px-5 py-3" };
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`font-amiri font-bold rounded-lg border ${sizes[size]}`}
        style={{ color, borderColor: color + "55", background: color + "12", lineHeight: 1.8, display: "inline-block" }}>
        {letter}
      </span>
      {showIndex && <span className="font-inter text-[9px] tabular-nums" style={{ color: G.dim }}>{index + 1}</span>}
    </div>
  );
}

function LetterRow({ letters, color = G.gold, size = "lg", showIndex = false }) {
  if (!letters || letters.length === 0) return <span className="font-inter text-sm italic" style={{ color: G.dim }}>—</span>;
  return (
    <div className="flex flex-wrap gap-2.5 items-center" style={{ direction: "rtl" }}>
      {letters.map((l, i) => <LetterCell key={i} letter={l} index={i} color={color} size={size} showIndex={showIndex} />)}
    </div>
  );
}

function Arrow({ label }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <span className="font-inter text-lg" style={{ color: G.goldDim }}>→</span>
      {label && <span className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{label}</span>}
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

export default function Method4Step1Section({ nineMizanTotal, dominant = "fire", getBastLevelFn = getBastLevelDefault }) {
  const [bookMethodValues, setBookMethodValues] = useState(null);
  const pipeline = useMemo(() => {
    if (!nineMizanTotal || nineMizanTotal <= 0) return null;

    // Step 1: Nine Mizan Total → Istintak → Seed Letters
    const seedLetters = istintak(nineMizanTotal);
    const totalSeed = seedLetters.length;
    const isSeedFerd = totalSeed % 2 !== 0;
    const bastLevel = isSeedFerd ? 5 : 4;

    // Step 2: Individual Bast Derivations — REVERSE ORDER (last seed → first),
    // identical to SatrVahidGrouping / expandAllSeedLetters in mizaanPostEngine.js
    const derivations = [];
    let allExpandedLetters = [];
    for (let i = seedLetters.length - 1; i >= 0; i--) {
      const letter = seedLetters[i];
      const bastValue = getBastLevelFn(letter, bastLevel);
      const expanded = istintak(bastValue);
      allExpandedLetters = [...allExpandedLetters, ...expanded];
      derivations.push({ originalLetter: letter, bastValue, expandedLetters: expanded });
    }

    // Step 3: Expanded Total = sum of First Bast (Bast 1) of all expanded letters
    // — identical formula to vefkSourceNumber/expandedLettersTotal in runMizaanPostPipeline
    const expandedTotal = allExpandedLetters.reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);

    // Step 4 (Method 4 next stage): Next Number = Expanded Total + Expanded Letter Count
    const nextNumber = expandedTotal + allExpandedLetters.length;

    // Step 5: Istintak of the Next Number
    const nextLetters = istintak(nextNumber);

    // Step 6 (Method 4 next stage): Name Grouping — FERD (odd) → groups of 5, ZEVC (even) → groups of 4.
    // Remaining-letter completion reuses the EXACT same rule already used for Esma-i Kitabet
    // in Method 1 (see SatrVahidGrouping.jsx completionRule="galib"): supplement with the
    // Istintak letters of the Galib Anasir value, appended to the end.
    const nextLettersCount = nextLetters.length;
    const isNextFerd = nextLettersCount % 2 !== 0;
    const groupSize = isNextFerd ? 5 : 4;
    const remainder = nextLettersCount % groupSize;
    let supplementLetters = [];
    let finalSequence = [...nextLetters];
    if (remainder > 0) {
      const needed = groupSize - remainder;
      const galibValue = GALIB_ANASIR_VALUES[dominant] || GALIB_ANASIR_VALUES.fire;
      const galibIstintakLetters = istintak(galibValue);
      supplementLetters = galibIstintakLetters.slice(0, needed);
      finalSequence = [...nextLetters, ...supplementLetters];
    }
    const nameGroups = [];
    for (let i = 0; i < finalSequence.length; i += groupSize) {
      const g = finalSequence.slice(i, i + groupSize);
      nameGroups.push({ letters: g, name: g.join("") });
    }

    // Kitabet Wafq source: Bast-1 sum of the ORIGINAL Esma-i Kitabet letters (nextLetters), never the
    // internal pipeline expansion letters (allExpandedLetters) and never supplement letters.
    const kitabetVefkSourceTotal = nextLetters.reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);

    // Step 8 (Method 4 next stage): Carry-Forward Letters for the NEXT calculation.
    // ONE continuous sequence, in this order:
    //   1. The complete Esma-i Kitabet name letters (nextLetters) — or, if there was a
    //      remainder, only the leftover letters instead of a completed name.
    //   2. Immediately followed by the complete ORIGINAL Anasir letters of the dominant
    //      element (Page 44, from Mizan 2) — never the Istintak of the Galib Anasir value.
    const fullGroupsCount = Math.floor(nextLettersCount / groupSize);
    const originalRemainingLetters = remainder > 0 ? nextLetters.slice(fullGroupsCount * groupSize) : [];
    const kitabetInputLetters = remainder > 0 ? originalRemainingLetters : [...nextLetters];
    const anasirOriginalLetters = ELEMENT_LETTERS[dominant] || ELEMENT_LETTERS.fire;
    const carryLetters = [...kitabetInputLetters, ...anasirOriginalLetters];
    const carryCount = carryLetters.length;
    const carryIsFerd = carryCount % 2 !== 0;
    const carryBastLevel = carryIsFerd ? 5 : 4;

    // ── SECOND PIPELINE PASS — identical structure to Steps 1–6, seeded by carryLetters ──
    // (Same rules as Methods 1–3: reverse-order Bast derivation → expanded letters →
    // Expanded Total → + Expanded Letter Count → Next Number → Istintak.)
    const derivations2 = [];
    let allExpandedLetters2 = [];
    for (let i = carryLetters.length - 1; i >= 0; i--) {
      const letter = carryLetters[i];
      const bastValue = getBastLevelFn(letter, carryBastLevel);
      const expanded = istintak(bastValue);
      allExpandedLetters2 = [...allExpandedLetters2, ...expanded];
      derivations2.push({ originalLetter: letter, bastValue, expandedLetters: expanded });
    }
    const expandedTotal2 = allExpandedLetters2.reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);
    const nextNumber2 = expandedTotal2 + allExpandedLetters2.length;
    const nextLetters2 = istintak(nextNumber2);

    // ── STEP 14: Esma-i A'van Name Grouping — Step 13 letters ARE the A'van letters ──
    // Same rule as Methods 1/2 (A'VAN completion): FERD→groups of 5, ZEVC→groups of 4,
    // incomplete last name completed from the FRONT of its own sequence (display only).
    const avanLetters = nextLetters2;
    const avanCount = avanLetters.length;
    const avanIsFerd = avanCount % 2 !== 0;
    const avanGroupSize = avanIsFerd ? 5 : 4;
    const avanRemainder = avanCount % avanGroupSize;
    let avanSupplementLetters = [];
    let avanSeq = [...avanLetters];
    if (avanRemainder > 0) {
      const needed = avanGroupSize - avanRemainder;
      avanSupplementLetters = avanLetters.slice(0, needed);
      avanSeq = [...avanSeq, ...avanSupplementLetters];
    }
    const avanNameGroups = [];
    for (let i = 0; i < avanSeq.length; i += avanGroupSize) {
      const g = avanSeq.slice(i, i + avanGroupSize);
      avanNameGroups.push({ letters: g, name: g.join("") });
    }

    // A'van Wafq source: Bast-1 sum of the ORIGINAL Esma-i A'van letters (avanLetters), never the
    // internal pipeline expansion letters (allExpandedLetters2) and never supplement letters.
    const avanVefkSourceTotal = avanLetters.reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);

    // ── STEP 15: Carry-Forward for Next Calculation ──
    // Display-completion letters are NEVER carried. If genuine leftover letters exist, carry
    // ONLY those. If none (all letters formed complete names), carry the LAST complete name.
    const avanFullGroupsCount = Math.floor(avanCount / avanGroupSize);
    const avanLeftoverLetters = avanRemainder > 0 ? avanLetters.slice(avanFullGroupsCount * avanGroupSize) : [];
    const avanLastCompleteName = avanRemainder === 0 && avanNameGroups.length > 0
      ? avanNameGroups[avanNameGroups.length - 1].letters
      : [];
    const avanCarryBase = avanRemainder > 0 ? avanLeftoverLetters : avanLastCompleteName;
    const avanCarryLetters = [...avanCarryBase, ...anasirOriginalLetters];
    const avanCarryCount = avanCarryLetters.length;
    const avanCarryIsFerd = avanCarryCount % 2 !== 0;
    const avanCarryBastLevel = avanCarryIsFerd ? 5 : 4;

    // ── THIRD PIPELINE PASS — identical structure, seeded by avanCarryLetters ──
    const derivations3 = [];
    let allExpandedLetters3 = [];
    for (let i = avanCarryLetters.length - 1; i >= 0; i--) {
      const letter = avanCarryLetters[i];
      const bastValue = getBastLevelFn(letter, avanCarryBastLevel);
      const expanded = istintak(bastValue);
      allExpandedLetters3 = [...allExpandedLetters3, ...expanded];
      derivations3.push({ originalLetter: letter, bastValue, expandedLetters: expanded });
    }
    const expandedTotal3 = allExpandedLetters3.reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);
    const nextNumber3 = expandedTotal3 + allExpandedLetters3.length;
    const nextLetters3 = istintak(nextNumber3);

    // ── STEP 21: Esma-i Kasem Name Grouping — Step 20 letters ARE the Kasem letters ──
    // Same rule as Methods 1/2 (KASEM completion): FERD→groups of 5, ZEVC→groups of 4,
    // incomplete last name completed from the FRONT of its own sequence (display only, never carried).
    const kasemLetters = nextLetters3;
    const kasemCount = kasemLetters.length;
    const kasemIsFerd = kasemCount % 2 !== 0;
    const kasemGroupSize = kasemIsFerd ? 5 : 4;
    const kasemRemainder = kasemCount % kasemGroupSize;
    let kasemSupplementLetters = [];
    let kasemSeq = [...kasemLetters];
    if (kasemRemainder > 0) {
      const needed = kasemGroupSize - kasemRemainder;
      kasemSupplementLetters = kasemLetters.slice(0, needed);
      kasemSeq = [...kasemSeq, ...kasemSupplementLetters];
    }
    const kasemNameGroups = [];
    for (let i = 0; i < kasemSeq.length; i += kasemGroupSize) {
      const g = kasemSeq.slice(i, i + kasemGroupSize);
      kasemNameGroups.push({ letters: g, name: g.join("") });
    }

    return {
      seedLetters, totalSeed, isSeedFerd, bastLevel, derivations, allExpandedLetters, expandedTotal, nextNumber, nextLetters,
      isNextFerd, groupSize, remainder, supplementLetters, nameGroups,
      kitabetInputLetters, anasirOriginalLetters, carryLetters, carryCount, carryIsFerd, carryBastLevel,
      derivations2, allExpandedLetters2, expandedTotal2, nextNumber2, nextLetters2,
      avanLetters, avanCount, avanIsFerd, avanGroupSize, avanRemainder, avanSupplementLetters, avanNameGroups,
      avanLeftoverLetters, avanLastCompleteName, avanCarryBase, avanCarryLetters, avanCarryCount, avanCarryIsFerd, avanCarryBastLevel,
      derivations3, allExpandedLetters3, expandedTotal3, nextNumber3, nextLetters3,
      kasemLetters, kasemCount, kasemIsFerd, kasemGroupSize, kasemRemainder, kasemSupplementLetters, kasemNameGroups,
      kitabetNamesList: nameGroups.map(g => g.name),
      kitabetAdad: nameGroups.reduce((s, g) => s + g.letters.reduce((s2, l) => s2 + (getBastLevelFn(l, 1) || 0), 0), 0),
      avanNamesList: avanNameGroups.map(g => g.name),
      avanAdad: avanNameGroups.reduce((s, g) => s + g.letters.reduce((s2, l) => s2 + (getBastLevelFn(l, 1) || 0), 0), 0),
      kasemNamesList: kasemNameGroups.map(g => g.name),
      kasemAdad: kasemNameGroups.reduce((s, g) => s + g.letters.reduce((s2, l) => s2 + (getBastLevelFn(l, 1) || 0), 0), 0),
      // ── Wafq (Kalam) sources — same engine as Methods 1/2 ──
      // Kitabet Wafq: built ONLY from the original Esma-i Kitabet letters (nextLetters),
      // before any supplement/completion letters) — NOT the internal pipeline expansion letters.
      kitabetVefk: kitabetVefkSourceTotal > 0 ? buildVefk(kitabetVefkSourceTotal, dominant) : null,
      kitabetVefkSource: kitabetVefkSourceTotal,
      // A'van Wafq: built ONLY from the original Esma-i A'van letters (avanLetters = nextLetters2,
      // before any supplement/completion letters) — NOT the internal pipeline expansion letters.
      avanVefk: avanVefkSourceTotal > 0 ? buildVefk(avanVefkSourceTotal, dominant) : null,
      avanVefkSource: avanVefkSourceTotal,
      kasemVefkBastLevel: kasemIsFerd ? 5 : 4,
      kasemVefkSource: kasemLetters.reduce((s, l) => s + (getBastLevelFn(l, kasemIsFerd ? 5 : 4) || 0), 0),
      kasemVefk: (() => {
        const src = kasemLetters.reduce((s, l) => s + (getBastLevelFn(l, kasemIsFerd ? 5 : 4) || 0), 0);
        return src > 0 ? buildVefk(src, dominant) : null;
      })(),
      seedAdad: seedLetters.reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0),
    };
  }, [nineMizanTotal, dominant, getBastLevelFn]);

  if (!pipeline) return null;

  const {
    seedLetters, totalSeed, isSeedFerd, bastLevel, derivations, allExpandedLetters, expandedTotal, nextNumber, nextLetters,
    isNextFerd, groupSize, remainder, supplementLetters, nameGroups,
    kitabetInputLetters, anasirOriginalLetters, carryLetters, carryCount, carryIsFerd, carryBastLevel,
    derivations2, allExpandedLetters2, expandedTotal2, nextNumber2, nextLetters2,
    avanLetters, avanCount, avanIsFerd, avanGroupSize, avanRemainder, avanSupplementLetters, avanNameGroups,
    avanLeftoverLetters, avanLastCompleteName, avanCarryBase, avanCarryLetters, avanCarryCount, avanCarryIsFerd, avanCarryBastLevel,
    derivations3, allExpandedLetters3, expandedTotal3, nextNumber3, nextLetters3,
    kasemLetters, kasemCount, kasemIsFerd, kasemGroupSize, kasemRemainder, kasemSupplementLetters, kasemNameGroups,
    kitabetNamesList, kitabetAdad, avanNamesList, avanAdad, kasemNamesList, kasemAdad,
    kitabetVefk, kitabetVefkSource, avanVefk, avanVefkSource, kasemVefkBastLevel, kasemVefkSource, kasemVefk,
    seedAdad,
  } = pipeline;
  const bastLabelAr = bastLevel === 5 ? "البسط الخامس" : "البسط الرابع";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:  G.bg,
        borderColor: G.goldBorderHi,
        boxShadow:   `0 0 80px ${G.glow}, 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />

      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-3"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
          <span className="font-inter text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Method 4 — Shared Pipeline</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
        <p className="font-inter text-[10px] uppercase tracking-[0.2em] mt-1.5" style={{ color: G.goldDim }}>Nine Mizan Total → Bast Expansion (identical to Methods 1–3)</p>
      </div>

      <OrnamentalDivider />

      <div className="px-4 pb-6 space-y-5 pt-4">

        {/* STEP 1: Original Seed Letters */}
        <Card accent={G.gold}>
          <SectionHeader step="1" label="Original Seed Letters (Istintak)" arabic="الحروف البذرية" color={G.gold} />
          <div className="flex items-center justify-between px-3 py-2 rounded-lg border mb-3"
            style={{ background: G.bgInner, borderColor: G.goldBorder + "55" }}>
            <span className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>Nine Mizan Total</span>
            <span className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{nineMizanTotal.toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            <LetterRow letters={seedLetters} color={G.gold} size="xl" showIndex />
          </div>
          <div className="text-[15px] font-inter" style={{ color: G.dim }}>
            Count: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1.1rem" }}>{totalSeed}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: isSeedFerd ? G.red : G.green, fontWeight: "bold" }}>{isSeedFerd ? "FERD (فرد)" : "ZEVC (زوج)"}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>Bast Level: <span style={{ color: G.gold }}>{bastLabelAr}</span></span>
          </div>
        </Card>

        {/* STEP 2: Individual Bast Derivations */}
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
                    {d.expandedLetters.map((l, i) => <LetterCell key={i} letter={l} color={G.green} size="sm" />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* STEP 3: All Expanded Letters */}
        <Card accent={G.gold}>
          <SectionHeader step="3" label="All Expanded Letters" arabic="الحروف الموسعة" color={G.gold} />
          <div className="mb-3">
            <LetterRow letters={allExpandedLetters} color={G.gold} size="lg" showIndex />
          </div>
          <div className="text-sm font-inter" style={{ color: G.dim }}>
            Total Expanded: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1rem" }}>{allExpandedLetters.length}</span>
          </div>
        </Card>

        {/* STEP 4: Expanded Total */}
        <Card accent={G.gold}>
          <SectionHeader step="4" label="Expanded Total" arabic="المجموع الموسع" color={G.gold} />
          <div className="text-center px-3 py-3 rounded-lg border"
            style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
            <span className="font-inter text-2xl font-black tabular-nums" style={{ color: G.gold }}>{expandedTotal.toLocaleString()}</span>
          </div>
          <div className="text-[10px] font-inter text-center mt-2" style={{ color: G.dim }}>
            Sum of First Bast (Bast 1) values of all expanded letters
          </div>
        </Card>

        {/* STEP 5: Next Number = Expanded Total + Expanded Letter Count */}
        <Card accent={G.gold}>
          <SectionHeader step="5" label="Next Number" arabic="العدد التالي" color={G.gold} />
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center mb-3">
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Expanded Total</div>
              <div className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{expandedTotal.toLocaleString()}</div>
            </div>
            <span className="font-inter text-lg font-bold" style={{ color: G.goldDim }}>+</span>
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Expanded Letter Count</div>
              <div className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{allExpandedLetters.length}</div>
            </div>
            <span className="font-inter text-lg font-bold" style={{ color: G.goldDim }}>=</span>
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Next Number</div>
              <div className="font-inter text-xl font-black tabular-nums" style={{ color: G.gold }}>{nextNumber.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        {/* STEP 6: Istintak of Next Number */}
        <Card accent={G.gold}>
          <SectionHeader step="6" label="Istintak of Next Number" arabic="حروف الاستنطاق" color={G.gold} />
          <LetterRow letters={nextLetters} color={G.gold} size="xl" showIndex />
          <div className="text-sm font-inter mt-3" style={{ color: G.dim }}>
            Count: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1rem" }}>{nextLetters.length}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: isNextFerd ? G.red : G.green, fontWeight: "bold" }}>{isNextFerd ? "FERD (فرد)" : "ZEVC (زوج)"}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>Group Size: <span style={{ color: G.gold }}>{groupSize}</span></span>
          </div>
        </Card>

        {/* STEP 7: Name Grouping (Galib Anasir completion rule — same as Esma-i Kitabet) */}
        <Card accent={G.gold}>
          <SectionHeader step="7" label="Name Grouping" arabic="تكوين الأسماء" color={G.gold} />
          {remainder > 0 && (
            <div className="mb-3 px-3 py-2 rounded-lg border text-[10px] font-inter" style={{ background: G.bgInner, borderColor: G.goldBorder + "55", color: G.dim }}>
              Remainder: <span style={{ color: G.gold, fontWeight: "bold" }}>{remainder}</span> — completed with Galib Anasir Istintak letters:
              <span className="ml-2" dir="rtl" style={{ color: G.gold }}>{supplementLetters.join("")}</span>
            </div>
          )}
          <div className="space-y-3">
            {nameGroups.map((group, gi) => (
              <motion.div key={gi}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.06 }}
                className="rounded-xl border p-3"
                style={{ background: G.bgInner, borderColor: G.goldBorder + "60" }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <LetterRow letters={group.letters} color={G.gold} size="lg" />
                  <Arrow label="→" />
                  <span className="font-amiri text-2xl font-bold px-5 py-3 rounded-xl border"
                    style={{ color: G.gold, borderColor: G.goldBorder + "55", background: G.goldFaint, lineHeight: 1.7 }}
                    dir="rtl">
                    {group.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* ESMA-I KITABET WAFQ (KALAM) — same buildVefk engine as Methods 1/2 */}
        <Method4VefkCard step="7v" title="Esma-i Kitabet Wafq" sourceLabel="Vefk Source (Original Kitabet Letters B1 Total)" sourceNumber={kitabetVefkSource} vefk={kitabetVefk} dominant={dominant} sourceLetters={nextLetters} bastLevel={1} />

        {/* STEP 8: Carry-Forward Letters for Next Calculation (display-completion letters excluded) */}
        <Card accent={G.gold}>
          <SectionHeader step="8" label="Next Calculation Input" arabic="حروف الحساب التالي" color={G.gold} />
          <div className="text-[10px] font-inter mb-3" style={{ color: G.dim }}>
            One continuous sequence: the complete Esma-i Kitabet name{remainder > 0 ? "'s leftover letters" : ""}, immediately followed by the Original Dominant Anasir letters.
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>
                {remainder > 0 ? "Esma-i Kitabet — Leftover Letters" : "Esma-i Kitabet — Complete Name"}
              </div>
              <LetterRow letters={kitabetInputLetters} color={G.gold} size="sm" />
            </div>

            <div className="flex justify-center">
              <span className="font-inter text-base font-bold" style={{ color: G.goldDim }}>+</span>
            </div>

            <div>
              <div className="font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>Galib Anasir — Original Letters (Mizan 2)</div>
              <LetterRow letters={anasirOriginalLetters} color={G.green} size="sm" />
            </div>

            <div className="flex justify-center">
              <span className="font-inter text-base font-bold" style={{ color: G.goldDim }}>=</span>
            </div>

            <div>
              <div className="font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>Carry-Forward Letters</div>
              <LetterRow letters={carryLetters} color={G.gold} size="lg" showIndex />
            </div>
          </div>

          <div className="text-sm font-inter mt-3" style={{ color: G.dim }}>
            Count: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1rem" }}>{carryCount}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: carryIsFerd ? G.red : G.green, fontWeight: "bold" }}>{carryIsFerd ? "FERD (فرد)" : "ZEVC (زوج)"}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>Bast Level: <span style={{ color: G.gold }}>{carryBastLevel === 5 ? "البسط الخامس" : "البسط الرابع"}</span></span>
          </div>
        </Card>

        <OrnamentalDivider />

        {/* STEP 9: Individual Bast Derivations — Second Pipeline Pass (seeded by Carry-Forward Letters) */}
        <Card accent={G.green}>
          <SectionHeader step="9" label="Individual Bast Derivations (Next Pipeline)" arabic="اشتقاق البسط" color={G.green} />
          <div className="space-y-3">
            {derivations2.map((d, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border p-3"
                style={{ background: G.bgInner, borderColor: G.goldBorder + "60" }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <LetterCell letter={d.originalLetter} color={G.gold} size="lg" />
                  <Arrow label={`B${carryBastLevel}`} />
                  <div className="px-3 py-1.5 rounded-lg border flex-shrink-0"
                    style={{ background: G.greenDim, borderColor: G.green + "40" }}>
                    <span className="font-inter text-xs font-bold tabular-nums" style={{ color: G.green }}>
                      {d.bastValue.toLocaleString()}
                    </span>
                  </div>
                  <Arrow label="→" />
                  <div className="flex items-center gap-1 flex-wrap" style={{ direction: "rtl" }}>
                    {d.expandedLetters.map((l, i) => <LetterCell key={i} letter={l} color={G.green} size="sm" />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* STEP 10: All Expanded Letters (Next Pipeline) */}
        <Card accent={G.gold}>
          <SectionHeader step="10" label="All Expanded Letters (Next Pipeline)" arabic="الحروف الموسعة" color={G.gold} />
          <div className="mb-3">
            <LetterRow letters={allExpandedLetters2} color={G.gold} size="lg" showIndex />
          </div>
          <div className="text-sm font-inter" style={{ color: G.dim }}>
            Total Expanded: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1rem" }}>{allExpandedLetters2.length}</span>
          </div>
        </Card>

        {/* STEP 11: Expanded Total (Next Pipeline) */}
        <Card accent={G.gold}>
          <SectionHeader step="11" label="Expanded Total (Next Pipeline)" arabic="المجموع الموسع" color={G.gold} />
          <div className="text-center px-3 py-3 rounded-lg border"
            style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
            <span className="font-inter text-2xl font-black tabular-nums" style={{ color: G.gold }}>{expandedTotal2.toLocaleString()}</span>
          </div>
          <div className="text-[10px] font-inter text-center mt-2" style={{ color: G.dim }}>
            Sum of First Bast (Bast 1) values of all expanded letters
          </div>
        </Card>

        {/* STEP 12: Next Number (Next Pipeline) */}
        <Card accent={G.gold}>
          <SectionHeader step="12" label="Next Number (Next Pipeline)" arabic="العدد التالي" color={G.gold} />
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center mb-3">
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Expanded Total</div>
              <div className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{expandedTotal2.toLocaleString()}</div>
            </div>
            <span className="font-inter text-lg font-bold" style={{ color: G.goldDim }}>+</span>
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Expanded Letter Count</div>
              <div className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{allExpandedLetters2.length}</div>
            </div>
            <span className="font-inter text-lg font-bold" style={{ color: G.goldDim }}>=</span>
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Next Number</div>
              <div className="font-inter text-xl font-black tabular-nums" style={{ color: G.gold }}>{nextNumber2.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        {/* STEP 13: Istintak of Next Number (Next Pipeline) — these ARE the Esma-i A'van letters */}
        <Card accent={G.gold}>
          <SectionHeader step="13" label="Istintak of Next Number — Esma-i A'van Letters" arabic="حروف أسماء الأعوان" color={G.gold} />
          <LetterRow letters={nextLetters2} color={G.gold} size="xl" showIndex />
          <div className="text-sm font-inter mt-3" style={{ color: G.dim }}>
            Count: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1rem" }}>{nextLetters2.length}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: avanIsFerd ? G.red : G.green, fontWeight: "bold" }}>{avanIsFerd ? "FERD (فرد)" : "ZEVC (زوج)"}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>Group Size: <span style={{ color: G.gold }}>{avanGroupSize}</span></span>
          </div>
        </Card>

        {/* STEP 14: Esma-i A'van Name Grouping (same completion rule as Methods 1/2) */}
        <Card accent={G.gold}>
          <SectionHeader step="14" label="Esma-i A'van Name Grouping" arabic="تكوين أسماء الأعوان" color={G.gold} />
          {avanRemainder > 0 && (
            <div className="mb-3 px-3 py-2 rounded-lg border text-[10px] font-inter" style={{ background: G.bgInner, borderColor: G.goldBorder + "55", color: G.dim }}>
              Remainder: <span style={{ color: G.gold, fontWeight: "bold" }}>{avanRemainder}</span> — completed from the FRONT of the A'van sequence (display only):
              <span className="ml-2" dir="rtl" style={{ color: G.gold }}>{avanSupplementLetters.join("")}</span>
            </div>
          )}
          <div className="space-y-3">
            {avanNameGroups.map((group, gi) => (
              <motion.div key={gi}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.06 }}
                className="rounded-xl border p-3"
                style={{ background: G.bgInner, borderColor: G.goldBorder + "60" }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <LetterRow letters={group.letters} color={G.gold} size="lg" />
                  <Arrow label="→" />
                  <span className="font-amiri text-2xl font-bold px-5 py-3 rounded-xl border"
                    style={{ color: G.gold, borderColor: G.goldBorder + "55", background: G.goldFaint, lineHeight: 1.7 }}
                    dir="rtl">
                    {group.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* ESMA-I A'VAN WAFQ (KALAM) — same buildVefk engine as Methods 1/2 */}
        <Method4VefkCard step="14v" title="Esma-i A'van Wafq" sourceLabel="Vefk Source (Original A'van Letters B1 Total)" sourceNumber={avanVefkSource} vefk={avanVefk} dominant={dominant} sourceLetters={avanLetters} bastLevel={1} />

        {/* STEP 15: Carry-Forward for Next Calculation */}
        <Card accent={G.gold}>
          <SectionHeader step="15" label="Next Calculation Input" arabic="حروف الحساب التالي" color={G.gold} />
          <div className="text-[10px] font-inter mb-3" style={{ color: G.dim }}>
            {avanRemainder > 0
              ? "Genuine leftover A'van letters carry forward — display-completion letters excluded."
              : "No leftover letters — the LAST complete Esma-i A'van name carries forward."}
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>
                {avanRemainder > 0 ? "Leftover A'van Letters" : "Last Complete A'van Name"}
              </div>
              <LetterRow letters={avanCarryBase} color={G.gold} size="sm" />
            </div>

            <div className="flex justify-center">
              <span className="font-inter text-base font-bold" style={{ color: G.goldDim }}>+</span>
            </div>

            <div>
              <div className="font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>Galib Anasir — Original Letters (Mizan 2)</div>
              <LetterRow letters={anasirOriginalLetters} color={G.green} size="sm" />
            </div>

            <div className="flex justify-center">
              <span className="font-inter text-base font-bold" style={{ color: G.goldDim }}>=</span>
            </div>

            <div>
              <div className="font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>Carry-Forward Letters</div>
              <LetterRow letters={avanCarryLetters} color={G.gold} size="lg" showIndex />
            </div>
          </div>

          <div className="text-sm font-inter mt-3" style={{ color: G.dim }}>
            Count: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1rem" }}>{avanCarryCount}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: avanCarryIsFerd ? G.red : G.green, fontWeight: "bold" }}>{avanCarryIsFerd ? "FERD (فرد)" : "ZEVC (زوج)"}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>Bast Level: <span style={{ color: G.gold }}>{avanCarryBastLevel === 5 ? "البسط الخامس" : "البسط الرابع"}</span></span>
          </div>
        </Card>

        <OrnamentalDivider />

        {/* STEP 16: Individual Bast Derivations — Third Pipeline Pass (seeded by A'van Carry-Forward Letters) */}
        <Card accent={G.green}>
          <SectionHeader step="16" label="Individual Bast Derivations (A'van Pipeline)" arabic="اشتقاق البسط" color={G.green} />
          <div className="space-y-3">
            {derivations3.map((d, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border p-3"
                style={{ background: G.bgInner, borderColor: G.goldBorder + "60" }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <LetterCell letter={d.originalLetter} color={G.gold} size="lg" />
                  <Arrow label={`B${avanCarryBastLevel}`} />
                  <div className="px-3 py-1.5 rounded-lg border flex-shrink-0"
                    style={{ background: G.greenDim, borderColor: G.green + "40" }}>
                    <span className="font-inter text-xs font-bold tabular-nums" style={{ color: G.green }}>
                      {d.bastValue.toLocaleString()}
                    </span>
                  </div>
                  <Arrow label="→" />
                  <div className="flex items-center gap-1 flex-wrap" style={{ direction: "rtl" }}>
                    {d.expandedLetters.map((l, i) => <LetterCell key={i} letter={l} color={G.green} size="sm" />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* STEP 17: All Expanded Letters (A'van Pipeline) */}
        <Card accent={G.gold}>
          <SectionHeader step="17" label="All Expanded Letters (A'van Pipeline)" arabic="الحروف الموسعة" color={G.gold} />
          <div className="mb-3">
            <LetterRow letters={allExpandedLetters3} color={G.gold} size="lg" showIndex />
          </div>
          <div className="text-sm font-inter" style={{ color: G.dim }}>
            Total Expanded: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1rem" }}>{allExpandedLetters3.length}</span>
          </div>
        </Card>

        {/* STEP 18: Expanded Total (A'van Pipeline) */}
        <Card accent={G.gold}>
          <SectionHeader step="18" label="Expanded Total (A'van Pipeline)" arabic="المجموع الموسع" color={G.gold} />
          <div className="text-center px-3 py-3 rounded-lg border"
            style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
            <span className="font-inter text-2xl font-black tabular-nums" style={{ color: G.gold }}>{expandedTotal3.toLocaleString()}</span>
          </div>
          <div className="text-[10px] font-inter text-center mt-2" style={{ color: G.dim }}>
            Sum of First Bast (Bast 1) values of all expanded letters
          </div>
        </Card>

        {/* STEP 19: Next Number (A'van Pipeline) */}
        <Card accent={G.gold}>
          <SectionHeader step="19" label="Next Number (A'van Pipeline)" arabic="العدد التالي" color={G.gold} />
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center mb-3">
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Expanded Total</div>
              <div className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{expandedTotal3.toLocaleString()}</div>
            </div>
            <span className="font-inter text-lg font-bold" style={{ color: G.goldDim }}>+</span>
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Expanded Letter Count</div>
              <div className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{allExpandedLetters3.length}</div>
            </div>
            <span className="font-inter text-lg font-bold" style={{ color: G.goldDim }}>=</span>
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Next Number</div>
              <div className="font-inter text-xl font-black tabular-nums" style={{ color: G.gold }}>{nextNumber3.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        {/* STEP 20: Istintak of Next Number — these ARE the Esma-i Kasem letters */}
        <Card accent={G.gold}>
          <SectionHeader step="20" label="Istintak of Next Number — Esma-i Kasem Letters" arabic="حروف أسماء القسم" color={G.gold} />
          <LetterRow letters={nextLetters3} color={G.gold} size="xl" showIndex />
          <div className="text-sm font-inter mt-3" style={{ color: G.dim }}>
            Count: <span style={{ color: G.gold, fontWeight: "bold", fontSize: "1rem" }}>{nextLetters3.length}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: kasemIsFerd ? G.red : G.green, fontWeight: "bold" }}>{kasemIsFerd ? "FERD (فرد)" : "ZEVC (زوج)"}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>Group Size: <span style={{ color: G.gold }}>{kasemGroupSize}</span></span>
          </div>
        </Card>

        {/* STEP 21: Esma-i Kasem Name Grouping (same completion rule as Methods 1/2) */}
        <Card accent={G.gold}>
          <SectionHeader step="21" label="Esma-i Kasem Name Grouping" arabic="تكوين أسماء القسم" color={G.gold} />
          {kasemRemainder > 0 && (
            <div className="mb-3 px-3 py-2 rounded-lg border text-[10px] font-inter" style={{ background: G.bgInner, borderColor: G.goldBorder + "55", color: G.dim }}>
              Remainder: <span style={{ color: G.gold, fontWeight: "bold" }}>{kasemRemainder}</span> — completed from the FRONT of the Kasem sequence (display only, never carried):
              <span className="ml-2" dir="rtl" style={{ color: G.gold }}>{kasemSupplementLetters.join("")}</span>
            </div>
          )}
          <div className="space-y-3">
            {kasemNameGroups.map((group, gi) => (
              <motion.div key={gi}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.06 }}
                className="rounded-xl border p-3"
                style={{ background: G.bgInner, borderColor: G.goldBorder + "60" }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <LetterRow letters={group.letters} color={G.gold} size="lg" />
                  <Arrow label="→" />
                  <span className="font-amiri text-2xl font-bold px-5 py-3 rounded-xl border"
                    style={{ color: G.gold, borderColor: G.goldBorder + "55", background: G.goldFaint, lineHeight: 1.7 }}
                    dir="rtl">
                    {group.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* ESMA-I KASEM WAFQ (KALAM) — FERD→B5, ZEVC→B4 of the Kasem letters, same buildVefk engine */}
        <Method4VefkCard step="21v" title="Esma-i Kasem Wafq" sourceLabel={`Vefk Source (B${kasemVefkBastLevel} Total)`} sourceNumber={kasemVefkSource} vefk={kasemVefk} dominant={dominant} sourceLetters={kasemLetters} bastLevel={kasemVefkBastLevel} useMcBorder />

        <OrnamentalDivider />

        <Method4FinalSummary
          kitabetNames={kitabetNamesList}
          kitabetAdad={kitabetAdad}
          avanNames={avanNamesList}
          avanAdad={avanAdad}
          kasemNames={kasemNamesList}
          kasemAdad={kasemAdad}
        />

        <Method4AlternativeReading
          nineMizanTotal={nineMizanTotal}
          seedLetters={seedLetters}
          totalSeed={totalSeed}
          seedAdad={seedAdad}
        />

        <Method4BookMethodSection nextNumber={nextNumber} dominant={dominant} onDerived={setBookMethodValues} />

        <Method4FinalVefkSummary
          kitabetVefk={kitabetVefk}
          kitabetVefkSource={kitabetVefkSource}
          kitabetNames={kitabetNamesList}
          kitabetLetters={nextLetters}
          avanVefk={avanVefk}
          avanVefkSource={avanVefkSource}
          avanNames={avanNamesList}
          avanLetters={avanLetters}
          kasemVefk={kasemVefk}
          kasemVefkSource={kasemVefkSource}
          kasemNames={kasemNamesList}
          kasemLetters={kasemLetters}
          kasemBastLevel={kasemVefkBastLevel}
          dominant={dominant}
        />

        <Method4Conclusion
          avanName={bookMethodValues?.derivedName || ""}
          avanValue={bookMethodValues?.reducedNumber || 0}
          kasemName={bookMethodValues?.kasemName || ""}
          kasemValue={bookMethodValues?.reducedNumber2 || 0}
        />

      </div>

      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
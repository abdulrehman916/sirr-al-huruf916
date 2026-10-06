// ═══════════════════════════════════════════════════════════════
// METHOD 4 — ALTERNATIVE METHOD (BOOK METHOD) — FINAL INVOCATION
// ─────────────────────────────────────────────────────────────
// CORRECTED FINAL INVOCATION RULE:
//   1. Take the existing Next Number
//   2. Subtract 41 (NOT 51) → reduced number
//   3. Istintak(reduced number) → letters
//   4. Group letters (FERD/ZEVC + Galib Anasir completion — same
//      grouping rule as Esma-i Kitabet, unchanged)
//   5. Final invocation: يا + [derived name] + ئيل
//
// The ONLY source for the final invocation is the number obtained
// immediately after subtracting 41. No Kasem letters, no later
// pipeline letters, no other source.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { istintak, GALIB_ANASIR_VALUES } from "../../lib/mizaanPostEngine";

const SUBTRACT_VALUE = 41;
const YUSHIN_VALUE = 316;

const G = {
  gold:         "#F5D060",
  goldDim:      "rgba(245,208,96,0.55)",
  goldFaint:    "rgba(212,175,55,0.07)",
  goldBorder:   "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  glow:         "rgba(212,175,55,0.18)",
  bg:           "rgba(3,6,20,0.99)",
  bgCard:       "rgba(8,16,40,0.98)",
  bgInner:      "rgba(212,175,55,0.06)",
  green:        "#4ADE80",
  red:          "#F87171",
  dim:          "rgba(255,255,255,0.35)",
};

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${G.goldBorder})` }} />
      <span style={{ color: G.goldDim, fontSize: 10 }}>✦</span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${G.goldBorder})` }} />
    </div>
  );
}

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

function LetterRow({ letters, color = G.gold, size = "lg" }) {
  const sizes = { sm: "text-lg px-2.5 py-1.5", lg: "text-2xl px-4 py-2.5" };
  if (!letters || letters.length === 0) return <span className="font-inter text-sm italic" style={{ color: G.dim }}>—</span>;
  return (
    <div className="flex flex-wrap gap-2.5 items-center" style={{ direction: "rtl" }}>
      {letters.map((l, i) => (
        <span key={i} className={`font-amiri font-bold rounded-lg border ${sizes[size]}`}
          style={{ color, borderColor: color + "55", background: color + "12", lineHeight: 1.8, display: "inline-block" }}>
          {l}
        </span>
      ))}
    </div>
  );
}

// FERD/ZEVC grouping with Galib Anasir completion for the last (incomplete) group.
// Grouping rule UNCHANGED — same as Esma-i Kitabet completion.
function groupLetters(letters, completionSource) {
  const count = letters.length;
  const isFerd = count % 2 !== 0;
  const groupSize = isFerd ? 5 : 4;
  const remainder = count % groupSize;
  let supplement = [];
  let seq = [...letters];
  if (remainder > 0) {
    const needed = groupSize - remainder;
    supplement = completionSource.slice(0, needed);
    seq = [...letters, ...supplement];
  }
  const groups = [];
  for (let i = 0; i < seq.length; i += groupSize) {
    const g = seq.slice(i, i + groupSize);
    groups.push({ letters: g, name: g.join("") });
  }
  return { count, isFerd, groupSize, remainder, supplement, groups };
}

export default function Method4BookMethodSection({ nextNumber, dominant = "fire", onDerived }) {
  // Hooks must be called unconditionally at the top level — before any early return.
  const pipeline = useMemo(() => {
    if (!nextNumber || nextNumber <= 0) return null;

    // ── STEP 1: Next Number − 41 → reduced number ──
    const reducedNumber = nextNumber - SUBTRACT_VALUE;

    // ── STEP 2: Istintak(reduced number) → letters ──
    const reducedLetters = reducedNumber > 0 ? istintak(reducedNumber) : [];

    // ── STEP 3: Group letters (FERD/ZEVC + Galib Anasir completion — same rule) ──
    const galibValue = GALIB_ANASIR_VALUES[dominant] || GALIB_ANASIR_VALUES.fire;
    const galibIstintakLetters = istintak(galibValue);
    const grouping = groupLetters(reducedLetters, galibIstintakLetters);
    const derivedName = grouping.groups.length > 0 ? grouping.groups[grouping.groups.length - 1].name : "";

    // ── STEP 4: Final invocation: يا + [derived name] + ئيل ──
    // The ONLY source for this invocation is the number obtained after subtracting 41.
    const invocation = `يا${derivedName}ئيل`;

    // ── STEP 5: Subtract Yuşin (316) from the ORIGINAL Next Number (independent branch) ──
    const reducedNumber2 = nextNumber - YUSHIN_VALUE;

    // ── STEP 6: Istintak(reduced number 2) → Kasem letters ──
    const kasemLetters = reducedNumber2 > 0 ? istintak(reducedNumber2) : [];

    // ── STEP 7: Group Kasem letters (self-recycle from front — Esma-i Kasem completion rule) ──
    const kasemGrouping = groupLetters(kasemLetters, kasemLetters);
    const kasemName = kasemGrouping.groups.length > 0 ? kasemGrouping.groups[kasemGrouping.groups.length - 1].name : "";

    // ── STEP 7b: Kasem invocation: بحق + [kasem name] + يوش ──
    const invocationKasem = `بحق${kasemName}يوش`;

    return {
      reducedNumber, reducedLetters, grouping, derivedName, invocation,
      reducedNumber2, kasemLetters, kasemGrouping, kasemName, invocationKasem,
    };
  }, [nextNumber, dominant]);

  useEffect(() => {
    if (onDerived && pipeline) {
      onDerived({
        derivedName: pipeline.derivedName,
        kasemName: pipeline.kasemName,
        reducedNumber: pipeline.reducedNumber,
        reducedNumber2: pipeline.reducedNumber2,
      });
    }
  }, [pipeline, onDerived]);

  if (!pipeline) return null;

  const {
    reducedNumber, reducedLetters, grouping, derivedName, invocation,
    reducedNumber2, kasemLetters, kasemGrouping, kasemName, invocationKasem,
  } = pipeline;

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
          <span className="font-inter text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Alternative Method (Book Method)</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
        <p className="font-inter text-[10px] uppercase tracking-[0.2em] mt-1.5" style={{ color: G.goldDim }}>Based on the completed Nine Mizan calculation</p>
      </div>

      <OrnamentalDivider />

      <div className="px-4 pb-6 space-y-5 pt-4">

        {/* STEP 1: Next Number − 41 = Reduced Number */}
        <Card accent={G.gold}>
          <SectionHeader step="1" label="Next Number − 41" arabic="العدد المخفض" color={G.gold} />
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Next Number</div>
              <div className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{nextNumber.toLocaleString()}</div>
            </div>
            <span className="font-inter text-lg font-bold" style={{ color: G.goldDim }}>−</span>
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Subtract</div>
              <div className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{SUBTRACT_VALUE}</div>
            </div>
            <span className="font-inter text-lg font-bold" style={{ color: G.goldDim }}>=</span>
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Reduced Number</div>
              <div className="font-inter text-xl font-black tabular-nums" style={{ color: G.gold }}>{reducedNumber.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        {/* STEP 2: Istintak → Grouping → Derived Name */}
        <Card accent={G.green}>
          <SectionHeader step="2" label="Istintak → Name Grouping" arabic="حروف الاستنطاق" color={G.green} />
          <div className="mb-3">
            <LetterRow letters={reducedLetters} color={G.gold} size="lg" />
          </div>
          <div className="text-sm font-inter mb-3" style={{ color: G.dim }}>
            Count: <span style={{ color: G.gold, fontWeight: "bold" }}>{grouping.count}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: grouping.isFerd ? G.red : G.green, fontWeight: "bold" }}>{grouping.isFerd ? "FERD (فرد)" : "ZEVC (زوج)"}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>Group Size: <span style={{ color: G.gold }}>{grouping.groupSize}</span></span>
          </div>
          {grouping.remainder > 0 && (
            <div className="mb-3 px-3 py-2 rounded-lg border text-[10px] font-inter" style={{ background: G.bgInner, borderColor: G.goldBorder + "55", color: G.dim }}>
              Completed with Galib Anasir Istintak letters:
              <span className="ml-2" dir="rtl" style={{ color: G.gold }}>{grouping.supplement.join("")}</span>
            </div>
          )}
          <div className="space-y-3">
            {grouping.groups.map((group, gi) => (
              <div key={gi} className="rounded-xl border p-3" style={{ background: G.bgInner, borderColor: G.goldBorder + "60" }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <LetterRow letters={group.letters} color={G.gold} size="sm" />
                  <span className="font-inter text-lg" style={{ color: G.goldDim }}>→</span>
                  <span className="font-amiri text-2xl font-bold px-5 py-3 rounded-xl border"
                    style={{ color: G.gold, borderColor: G.goldBorder + "55", background: G.goldFaint, lineHeight: 1.7 }}
                    dir="rtl">
                    {group.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* STEP 3: ASMA-UL A'VAN — يا + [derived name] + ئيل */}
        <Card accent={G.gold}>
          <SectionHeader step="3" label="Asma-ul A'van" arabic="أسماء الأعوان" color={G.gold} />
          <div className="text-center px-3 py-4 rounded-lg border"
            style={{ background: G.bgInner, borderColor: G.goldBorderHi }}>
            <span className="font-amiri text-3xl font-bold" style={{ color: G.gold, lineHeight: 2 }} dir="rtl">{invocation}</span>
          </div>
          <div className="text-center mt-3">
            <span className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Value (Next Number − 41)</span>
            <div className="font-inter text-xl font-black tabular-nums" style={{ color: G.gold }}>{reducedNumber.toLocaleString()}</div>
          </div>
        </Card>

        <OrnamentalDivider />

        {/* STEP 5: Reduced Number − Yuşin (316) = Reduced Number 2 */}
        <Card accent={G.gold}>
          <SectionHeader step="4" label="Next Number − Value of Yuşin" arabic="العدد الناتج" color={G.gold} />
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Next Number</div>
              <div className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{nextNumber.toLocaleString()}</div>
            </div>
            <span className="font-inter text-lg font-bold" style={{ color: G.goldDim }}>−</span>
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Yuşin (يوش)</div>
              <div className="font-inter text-base font-bold tabular-nums" style={{ color: G.gold }}>{YUSHIN_VALUE}</div>
            </div>
            <span className="font-inter text-lg font-bold" style={{ color: G.goldDim }}>=</span>
            <div className="space-y-1">
              <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Result</div>
              <div className="font-inter text-xl font-black tabular-nums" style={{ color: G.gold }}>{reducedNumber2.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        {/* STEP 6: Istintak → Kasem Name Grouping */}
        <Card accent={G.green}>
          <SectionHeader step="5" label="Istintak → Kasem Name Grouping" arabic="حروف أسماء القسم" color={G.green} />
          <div className="mb-3">
            <LetterRow letters={kasemLetters} color={G.gold} size="lg" />
          </div>
          <div className="text-sm font-inter mb-3" style={{ color: G.dim }}>
            Count: <span style={{ color: G.gold, fontWeight: "bold" }}>{kasemGrouping.count}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: kasemGrouping.isFerd ? G.red : G.green, fontWeight: "bold" }}>{kasemGrouping.isFerd ? "FERD (فرد)" : "ZEVC (زوج)"}</span>
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <span style={{ color: G.goldDim }}>Group Size: <span style={{ color: G.gold }}>{kasemGrouping.groupSize}</span></span>
          </div>
          {kasemGrouping.remainder > 0 && (
            <div className="mb-3 px-3 py-2 rounded-lg border text-[10px] font-inter" style={{ background: G.bgInner, borderColor: G.goldBorder + "55", color: G.dim }}>
              Completed by self-recycling from the front of its own sequence:
              <span className="ml-2" dir="rtl" style={{ color: G.gold }}>{kasemGrouping.supplement.join("")}</span>
            </div>
          )}
          <div className="space-y-3">
            {kasemGrouping.groups.map((group, gi) => (
              <div key={gi} className="rounded-xl border p-3" style={{ background: G.bgInner, borderColor: G.goldBorder + "60" }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <LetterRow letters={group.letters} color={G.gold} size="sm" />
                  <span className="font-inter text-lg" style={{ color: G.goldDim }}>→</span>
                  <span className="font-amiri text-2xl font-bold px-5 py-3 rounded-xl border"
                    style={{ color: G.gold, borderColor: G.goldBorder + "55", background: G.goldFaint, lineHeight: 1.7 }}
                    dir="rtl">
                    {group.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* STEP 7: ASMA-UL KASEM — بحق + [kasem name] + يوش */}
        <Card accent={G.gold}>
          <SectionHeader step="6" label="Asma-ul Kasem" arabic="أسماء القسم" color={G.gold} />
          <div className="text-center px-3 py-4 rounded-lg border"
            style={{ background: G.bgInner, borderColor: G.goldBorderHi }}>
            <span className="font-amiri text-3xl font-bold" style={{ color: G.gold, lineHeight: 2 }} dir="rtl">{invocationKasem}</span>
          </div>
          <div className="text-center mt-3">
            <span className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Value (Next Number − 316)</span>
            <div className="font-inter text-xl font-black tabular-nums" style={{ color: G.gold }}>{reducedNumber2.toLocaleString()}</div>
          </div>
        </Card>

      </div>

      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
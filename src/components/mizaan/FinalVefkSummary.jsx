// ═══════════════════════════════════════════════════════════════
// FINAL VEFK SUMMARY — DISPLAY ONLY
// Collapsible panels for Section 1, 2, 3.
// Shows: Final Names, Vefk Source, MC, Vefk Grid.
// NO calculations. All data received as props.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, RotateCcw, ChevronRight } from "lucide-react";

const G = {
  gold:         "#F5D060",
  goldDim:      "rgba(245,208,96,0.55)",
  goldFaint:    "rgba(245,208,96,0.10)",
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

const ELEMENT_COLORS = {
  fire:  "#FF6B35",
  earth: "#A5C880",
  air:   "#B2EBF2",
  water: "#4FC3F7",
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

// ── Arabic-Indic numeral converter ──────────────────────────────
function toArabicIndic(n) {
  return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

// ── Vefk Writing Assistant ──────────────────────────────────────
// UI helper only. No calculations. Reveals cells in ascending numeric order.
function VefkWritingAssistant({ grid, color }) {
  const flat = useMemo(() => grid.flat(), [grid]);

  // Build sorted reveal order: [{cellIndex, value}] ascending by value
  const revealOrder = useMemo(() => {
    return flat
      .map((value, cellIndex) => ({ cellIndex, value }))
      .sort((a, b) => a.value - b.value);
  }, [flat]);

  const [step, setStep] = useState(0); // 0 = all hidden, N = N cells revealed

  const revealedSet = useMemo(() => {
    const s = new Set();
    for (let i = 0; i < step; i++) s.add(revealOrder[i].cellIndex);
    return s;
  }, [step, revealOrder]);

  const total = flat.length;
  const done  = step >= total;

  return (
    <div className="mt-3 rounded-xl border p-3 space-y-3"
      style={{ background: "rgba(0,0,0,0.25)", borderColor: color + "33" }}>

      {/* Header + Controls */}
      <div className="flex items-center justify-between">
        <span className="font-inter text-[8px] uppercase tracking-[0.2em] font-bold" style={{ color: color + "99" }}>
          Writing Assistant
        </span>
        <div className="flex items-center gap-2">
          {/* Step counter */}
          <span className="font-inter text-[8px] tabular-nums" style={{ color: "rgba(255,255,255,0.30)" }}>
            {step}/{total}
          </span>
          {/* Clear */}
          <button
            onClick={() => setStep(0)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-inter text-[8px] font-bold uppercase tracking-wider transition-opacity hover:opacity-70 active:opacity-50"
            style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.30)", color: "#F87171" }}
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Clear
          </button>
          {/* Next */}
          <button
            onClick={() => { if (!done) setStep(s => s + 1); }}
            disabled={done}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-inter text-[8px] font-bold uppercase tracking-wider transition-opacity hover:opacity-70 active:opacity-50 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: color + "22", border: `1px solid ${color}55`, color }}
          >
            <ChevronRight className="w-2.5 h-2.5" />
            Next
          </button>
        </div>
      </div>

      {/* Writable preview grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {flat.map((val, idx) => {
          const revealed = revealedSet.has(idx);
          return (
            <div key={idx}
              className="aspect-square flex items-center justify-center rounded-lg border font-inter text-sm font-bold tabular-nums transition-all duration-300"
              style={{
                minWidth:    "2.6rem",
                background:  revealed ? (idx % 2 === 0 ? "rgba(245,208,96,0.10)" : "rgba(212,175,55,0.06)") : "rgba(255,255,255,0.03)",
                borderColor: revealed ? color + "55" : "rgba(255,255,255,0.08)",
                color:       revealed ? color : "transparent",
                boxShadow:   revealed ? `0 0 8px ${color}22` : "none",
              }}>
              {toArabicIndic(val)}
            </div>
          );
        })}
      </div>

      {done && (
        <div className="text-center font-inter text-[8px] font-bold py-1 rounded"
          style={{ color: "#4ADE80", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.20)" }}>
          ✓ All cells revealed
        </div>
      )}
    </div>
  );
}

// ── Collapsible Section Panel ────────────────────────────────────
function SectionPanel({ label, arabic, subtitle, vefk, sourceNumber, borderLetters, names, elementColor }) {
  const [open, setOpen] = useState(false);

  const hasVefk = vefk && vefk.grid;
  const color = elementColor || G.gold;

  // MC + validation
  const g       = hasVefk ? vefk.grid : null;
  const mc      = g ? g[0].reduce((s, v) => s + v, 0) : null;
  const rowSums = g ? g.map(r => r.reduce((a, b) => a + b, 0)) : [];
  const colSums = g ? g[0].map((_, j) => g.reduce((s, r) => s + r[j], 0)) : [];
  const d1      = g ? g.reduce((s, r, i) => s + r[i], 0) : 0;
  const d2      = g ? g.reduce((s, r, i) => s + r[3 - i], 0) : 0;
  const allOk   = g ? rowSums.every(x => x === mc) && colSums.every(x => x === mc) && d1 === mc && d2 === mc : false;

  const borderChars = borderLetters ? [...borderLetters] : (vefk?.guardianName ? [...vefk.guardianName] : []);
  const borderStr   = borderChars.join("");

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{
        background:  G.bgCard,
        borderColor: color + "55",
        borderTop:   `3px solid ${color}`,
        boxShadow:   `0 0 32px ${color}14, 0 4px 20px rgba(0,0,0,0.45)`,
      }}>

      {/* ── Collapsible Header ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="flex flex-col">
            <span className="font-inter text-[9px] uppercase tracking-[0.25em] font-bold" style={{ color }}>{label}</span>
            <span className="font-amiri text-lg font-bold leading-tight" style={{ color: G.gold }} dir="rtl">{arabic}</span>
            {subtitle && <span className="font-inter text-[8px] uppercase tracking-wider mt-0.5" style={{ color: G.dim }}>{subtitle}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {mc !== null && (
            <span className="font-inter text-[8px] tabular-nums font-bold px-2 py-1 rounded border"
              style={{ color, borderColor: color + "44", background: color + "12" }}>
              MC {mc.toLocaleString()}
            </span>
          )}
          <div className="flex items-center justify-center w-6 h-6 rounded-lg"
            style={{ background: color + "22", border: `1px solid ${color}44` }}>
            {open
              ? <ChevronUp className="w-3.5 h-3.5" style={{ color }} />
              : <ChevronDown className="w-3.5 h-3.5" style={{ color }} />}
          </div>
        </div>
      </button>

      {/* ── Expandable Content ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <OrnamentalDivider />

            <div className="px-5 pb-5 space-y-4">

              {/* 1. Final Names */}
              {names && names.length > 0 && (
                <div className="space-y-2">
                  <div className="font-inter text-[8px] uppercase tracking-[0.2em] font-bold" style={{ color: G.dim }}>
                    Final Names
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {names.map((name, idx) => (
                      <div key={idx}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl border"
                        style={{ background: G.bgInner, borderColor: color + "44" }}>
                        <div className="flex items-center justify-center w-5 h-5 rounded-md font-inter text-[9px] font-black flex-shrink-0"
                          style={{ background: color + "22", color, border: `1px solid ${color}44` }}>
                          {idx + 1}
                        </div>
                        <span className="font-amiri text-xl font-bold" style={{ color: G.gold }} dir="rtl">
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Vefk Source */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border"
                style={{ background: G.bgInner, borderColor: G.goldBorder + "55" }}>
                <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>Vefk Source</span>
                <span className="font-inter text-sm font-bold tabular-nums" style={{ color }}>
                  {sourceNumber != null ? sourceNumber.toLocaleString() : "—"}
                </span>
              </div>

              {/* 3. MC */}
              {mc !== null && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border"
                  style={{ background: G.goldFaint, borderColor: color + "44" }}>
                  <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>Magic Constant (MC)</span>
                  <span className="font-inter text-sm font-bold tabular-nums" style={{ color }}>{mc.toLocaleString()}</span>
                </div>
              )}

              {/* 4. Vefk Grid */}
              {hasVefk && (
                <div className="space-y-2">
                  <div className="font-inter text-[8px] uppercase tracking-[0.2em] font-bold" style={{ color: G.dim }}>
                    Vefk Grid
                  </div>

                  {/* Framed grid */}
                  <div className="flex flex-col items-center gap-1">
                    {/* TOP border letters */}
                    {borderStr && (
                      <div className="font-amiri text-base font-bold tracking-widest text-center" dir="rtl"
                        style={{ color, textShadow: `0 0 10px ${color}44` }}>
                        {borderStr}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      {/* LEFT */}
                      {borderChars.length > 0 && (
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          {borderChars.map((l, i) => (
                            <span key={i} className="font-amiri font-bold leading-tight"
                              style={{ color, fontSize: "0.85rem", textShadow: `0 0 6px ${color}44` }}>
                              {l}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* GRID */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {g.flat().map((val, idx) => (
                          <div key={idx}
                            className="aspect-square flex items-center justify-center rounded-lg border font-inter text-sm font-bold tabular-nums"
                            style={{
                              background:  idx % 2 === 0 ? G.goldFaint : G.bgInner,
                              borderColor: color + "44",
                              color,
                              minWidth:    "2.6rem",
                            }}>
                            {val.toLocaleString()}
                          </div>
                        ))}
                      </div>
                      {/* RIGHT */}
                      {borderChars.length > 0 && (
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          {borderChars.map((l, i) => (
                            <span key={i} className="font-amiri font-bold leading-tight"
                              style={{ color, fontSize: "0.85rem", textShadow: `0 0 6px ${color}44` }}>
                              {l}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* BOTTOM border letters */}
                    {borderStr && (
                      <div className="font-amiri text-base font-bold tracking-widest text-center" dir="rtl"
                        style={{ color, textShadow: `0 0 10px ${color}44` }}>
                        {borderStr}
                      </div>
                    )}
                  </div>

                  {/* Row / Col / Diag validation */}
                  <div className="grid grid-cols-2 gap-1 text-[6px]">
                    {rowSums.map((s, i) => (
                      <div key={i} className="flex justify-between px-1.5 py-0.5 rounded"
                        style={{ background: s === mc ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${s === mc ? "rgba(74,222,128,0.20)" : "rgba(248,113,113,0.20)"}` }}>
                        <span style={{ color: G.dim }}>Row {i + 1}</span>
                        <span style={{ color: s === mc ? G.green : G.red, fontWeight: "bold" }}>{s === mc ? "✓" : "✗"}</span>
                      </div>
                    ))}
                    {colSums.map((s, i) => (
                      <div key={i} className="flex justify-between px-1.5 py-0.5 rounded"
                        style={{ background: s === mc ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${s === mc ? "rgba(74,222,128,0.20)" : "rgba(248,113,113,0.20)"}` }}>
                        <span style={{ color: G.dim }}>Col {i + 1}</span>
                        <span style={{ color: s === mc ? G.green : G.red, fontWeight: "bold" }}>{s === mc ? "✓" : "✗"}</span>
                      </div>
                    ))}
                    {[["Diag ↘", d1], ["Diag ↙", d2]].map(([lbl, s]) => (
                      <div key={lbl} className="flex justify-between px-1.5 py-0.5 rounded"
                        style={{ background: s === mc ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${s === mc ? "rgba(74,222,128,0.20)" : "rgba(248,113,113,0.20)"}` }}>
                        <span style={{ color: G.dim }}>{lbl}</span>
                        <span style={{ color: s === mc ? G.green : G.red, fontWeight: "bold" }}>{s === mc ? "✓" : "✗"}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[6px] font-bold text-center px-2 py-0.5 rounded"
                    style={{ background: allOk ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", color: allOk ? G.green : G.red }}>
                    {allOk ? "✓ Valid Magic Square" : "✗ Invalid Magic Square"}
                  </div>

                  {/* Writing Assistant — UI only, no calc changes */}
                  <VefkWritingAssistant grid={g} color={color} />
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────────
export default function FinalVefkSummary({
  s1Vefk, s1Source, s1Names,
  s2Vefk, s2Source, s2Names,
  s3Vefk, s3Source, s3Names,
  s3BorderLetters,
  dominant,
}) {
  if (!s1Vefk && !s2Vefk && !s3Vefk) return null;

  const elementColor = ELEMENT_COLORS[dominant] || ELEMENT_COLORS.fire;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:  G.bg,
        borderColor: G.goldBorderHi,
        boxShadow:   `0 0 80px ${G.glow}, 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      {/* Top accent */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />

      {/* Title */}
      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-3"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
          <span className="font-inter text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Final Summary — Three Sections</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
        <h2 className="font-amiri text-2xl font-bold" style={{ color: G.gold }}>ملخص الأوفاق الثلاثة</h2>
        <p className="font-inter text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: G.goldDim }}>
          Tap a section to expand • Read-only display
        </p>
      </div>

      <OrnamentalDivider />

      <div className="px-4 pb-6 pt-4 space-y-3">

        {/* Section 1 — Esma-i Vefk */}
        <SectionPanel
          label="Section 1 — Esma-i Vefk"
          arabic="أسماء الكتابة"
          subtitle="Esma-i Kitabet"
          vefk={s1Vefk}
          sourceNumber={s1Source}
          borderLetters={s1Vefk?.guardianName || ""}
          names={s1Names || []}
          elementColor={elementColor}
        />

        {/* Section 2 — Esma-i A'van */}
        <SectionPanel
          label="Section 2 — Esma-i A'van"
          arabic="أسماء الأعوان"
          subtitle="A'van Derivation"
          vefk={s2Vefk}
          sourceNumber={s2Source}
          borderLetters={s2Vefk?.guardianName || ""}
          names={s2Names || []}
          elementColor={elementColor}
        />

        {/* Section 3 — Esma-i Kasem */}
        <SectionPanel
          label="Section 3 — Esma-i Kasem"
          arabic="أسماء القسم"
          subtitle="Kasem Derivation"
          vefk={s3Vefk}
          sourceNumber={s3Source}
          borderLetters={s3BorderLetters || ""}
          names={s3Names || []}
          elementColor={elementColor}
        />

      </div>

      {/* Bottom accent */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
// ═══════════════════════════════════════════════════════════════
// METHOD 4 — FINAL VEFK SUMMARY (display-only)
// Same collapsible pattern as Methods 1/2/3 FinalVefkSummary.
// Reuses the Wafqs already generated earlier in Method 4 — no
// recalculation, no new Wafqs, no logic changes.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, RotateCcw, ChevronRight } from "lucide-react";
import { getBastLevel as getBastLevelDefault } from "../../lib/mizaanPostEngine";

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

const ELEMENT_COLORS = { fire: "#FF6B35", earth: "#A5C880", air: "#B2EBF2", water: "#4FC3F7" };

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${G.goldBorder})` }} />
      <span style={{ color: G.goldDim, fontSize: 10 }}>✦</span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${G.goldBorder})` }} />
    </div>
  );
}

function toArabicIndic(n) {
  return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

// ── Vefk Writing Assistant — identical pattern to Methods 1–3 ──
function VefkWritingAssistant({ grid, color }) {
  const flat = useMemo(() => grid.flat(), [grid]);
  const revealOrder = useMemo(() => flat.map((value, cellIndex) => ({ cellIndex, value })).sort((a, b) => a.value - b.value), [flat]);
  const [step, setStep] = useState(0);
  const revealedSet = useMemo(() => {
    const s = new Set();
    for (let i = 0; i < step; i++) s.add(revealOrder[i].cellIndex);
    return s;
  }, [step, revealOrder]);
  const total = flat.length;
  const done = step >= total;

  return (
    <div className="mt-3 rounded-xl border p-3 space-y-3" style={{ background: "rgba(0,0,0,0.25)", borderColor: color + "33" }}>
      <div className="flex items-center justify-between">
        <span className="font-inter text-[8px] uppercase tracking-[0.2em] font-bold" style={{ color: color + "99" }}>Writing Assistant</span>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[8px] tabular-nums" style={{ color: "rgba(255,255,255,0.30)" }}>{step}/{total}</span>
          <button onClick={() => setStep(0)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-inter text-[8px] font-bold uppercase tracking-wider transition-opacity hover:opacity-70 active:opacity-50"
            style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.30)", color: "#F87171" }}>
            <RotateCcw className="w-2.5 h-2.5" /> Clear
          </button>
          <button onClick={() => { if (!done) setStep(s => s + 1); }} disabled={done}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-inter text-[8px] font-bold uppercase tracking-wider transition-opacity hover:opacity-70 active:opacity-50 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: color + "22", border: `1px solid ${color}55`, color }}>
            <ChevronRight className="w-2.5 h-2.5" /> Next
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {flat.map((val, idx) => {
          const revealed = revealedSet.has(idx);
          return (
            <div key={idx} className="aspect-square flex items-center justify-center rounded-lg border font-inter text-sm font-bold tabular-nums transition-all duration-300"
              style={{
                minWidth: "2.6rem",
                background: revealed ? (idx % 2 === 0 ? "rgba(245,208,96,0.10)" : "rgba(212,175,55,0.06)") : "rgba(255,255,255,0.03)",
                borderColor: revealed ? color + "55" : "rgba(255,255,255,0.08)",
                color: revealed ? color : "transparent",
                boxShadow: revealed ? `0 0 8px ${color}22` : "none",
              }}>
              {toArabicIndic(val)}
            </div>
          );
        })}
      </div>
      {done && (
        <div className="text-center font-inter text-[8px] font-bold py-1 rounded" style={{ color: "#4ADE80", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.20)" }}>
          ✓ All cells revealed
        </div>
      )}
    </div>
  );
}

// ── Collapsible: Expanded Letter Values ──
function ExpandedLetterValues({ letters, elementColor, bastLevel }) {
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
              const bast = getBastLevelDefault(letter, bastLevel) || 0;
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
                {safe.reduce((s, l) => s + (getBastLevelDefault(l, bastLevel) || 0), 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Collapsible: Source ──
function SourceSection({ letters, sourceTotal, elementColor }) {
  const [isOpen, setIsOpen] = useState(false);
  const safe = Array.isArray(letters) ? letters : [];
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
          <div className="text-[7px]" style={{ color: G.dim }}>Source Letters</div>
          <div className="flex flex-wrap gap-1 justify-center" style={{ direction: "rtl" }}>
            {safe.map((l, i) => <span key={i} className="font-amiri" style={{ color: elementColor, fontSize: "0.7rem" }}>{l}</span>)}
          </div>
          <div className="text-[6px]" style={{ color: G.dim }}>↓</div>
          <div className="text-[7px] px-2 py-1.5 rounded font-bold" style={{ background: G.bgInner, color: elementColor }}>
            Source Total = {(sourceTotal || 0).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Collapsible Section Panel ──
function SectionPanel({ label, arabic, subtitle, vefk, sourceNumber, sourceLabel, names, elementColor, sourceLetters, bastLevel }) {
  const [open, setOpen] = useState(false);
  const hasVefk = vefk && vefk.grid;
  const color = elementColor || G.gold;

  const g = hasVefk ? vefk.grid : null;
  const mc = g ? g[0].reduce((s, v) => s + v, 0) : null;
  const rowSums = g ? g.map(r => r.reduce((a, b) => a + b, 0)) : [];
  const colSums = g ? g[0].map((_, j) => g.reduce((s, r) => s + r[j], 0)) : [];
  const d1 = g ? g.reduce((s, r, i) => s + r[i], 0) : 0;
  const d2 = g ? g.reduce((s, r, i) => s + r[3 - i], 0) : 0;
  const allOk = g ? rowSums.every(x => x === mc) && colSums.every(x => x === mc) && d1 === mc && d2 === mc : false;

  const guardianName = vefk?.guardianName || "";
  const guardianChars = [...guardianName];

  if (!hasVefk) return null;

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: G.bgCard, borderColor: color + "55", borderTop: `3px solid ${color}`, boxShadow: `0 0 32px ${color}14, 0 4px 20px rgba(0,0,0,0.45)` }}>

      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-3 text-left">
          <div className="flex flex-col">
            <span className="font-inter text-[9px] uppercase tracking-[0.25em] font-bold" style={{ color }}>{label}</span>
            <span className="font-amiri text-lg font-bold leading-tight" style={{ color: G.gold }} dir="rtl">{arabic}</span>
            {subtitle && <span className="font-inter text-[8px] uppercase tracking-wider mt-0.5" style={{ color: G.dim }}>{subtitle}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {mc !== null && (
            <span className="font-inter text-[8px] tabular-nums font-bold px-2 py-1 rounded border" style={{ color, borderColor: color + "44", background: color + "12" }}>
              MC {mc.toLocaleString()}
            </span>
          )}
          <div className="flex items-center justify-center w-6 h-6 rounded-lg" style={{ background: color + "22", border: `1px solid ${color}44` }}>
            {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color }} />}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
            <OrnamentalDivider />
            <div className="px-5 pb-5 space-y-4">

              {names && names.length > 0 && (
                <div className="space-y-2">
                  <div className="font-inter text-[8px] uppercase tracking-[0.2em] font-bold" style={{ color: G.dim }}>Final Names</div>
                  <div className="flex flex-col gap-1.5">
                    {names.map((name, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-4 py-2 rounded-xl border" style={{ background: G.bgInner, borderColor: color + "44" }}>
                        <div className="flex items-center justify-center w-5 h-5 rounded-md font-inter text-[9px] font-black flex-shrink-0"
                          style={{ background: color + "22", color, border: `1px solid ${color}44` }}>{idx + 1}</div>
                        <span className="font-amiri text-xl font-bold" style={{ color: G.gold }} dir="rtl">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ background: G.bgInner, borderColor: G.goldBorder + "55" }}>
                <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>{sourceLabel || "Vefk Source"}</span>
                <span className="font-inter text-sm font-bold tabular-nums" style={{ color }}>{sourceNumber != null ? sourceNumber.toLocaleString() : "—"}</span>
              </div>

              {mc !== null && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ background: G.goldFaint, borderColor: color + "44" }}>
                  <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: G.dim }}>Magic Constant (MC)</span>
                  <span className="font-inter text-sm font-bold tabular-nums" style={{ color }}>{mc.toLocaleString()}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="font-inter text-[8px] uppercase tracking-[0.2em] font-bold" style={{ color: G.dim }}>Vefk Grid</div>
                <div className="flex flex-col items-center gap-1">
                  {guardianName && (
                    <div className="font-amiri text-base font-bold tracking-widest text-center" dir="rtl" style={{ color, textShadow: `0 0 10px ${color}44` }}>{guardianName}</div>
                  )}
                  <div className="flex items-center gap-1.5">
                    {guardianChars.length > 0 && (
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        {guardianChars.map((l, i) => <span key={i} className="font-amiri font-bold leading-tight" style={{ color, fontSize: "0.85rem", textShadow: `0 0 6px ${color}44` }}>{l}</span>)}
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-1.5">
                      {g.flat().map((val, idx) => (
                        <div key={idx} className="aspect-square flex items-center justify-center rounded-lg border font-inter text-sm font-bold tabular-nums"
                          style={{ background: idx % 2 === 0 ? G.goldFaint : G.bgInner, borderColor: color + "44", color, minWidth: "2.6rem" }}>
                          {val.toLocaleString()}
                        </div>
                      ))}
                    </div>
                    {guardianChars.length > 0 && (
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        {guardianChars.map((l, i) => <span key={i} className="font-amiri font-bold leading-tight" style={{ color, fontSize: "0.85rem", textShadow: `0 0 6px ${color}44` }}>{l}</span>)}
                      </div>
                    )}
                  </div>
                  {guardianName && (
                    <div className="font-amiri text-base font-bold tracking-widest text-center" dir="rtl" style={{ color, textShadow: `0 0 10px ${color}44` }}>{guardianName}</div>
                  )}
                </div>

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
                <div className="text-[6px] font-bold text-center px-2 py-0.5 rounded" style={{ background: allOk ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", color: allOk ? G.green : G.red }}>
                  {allOk ? "✓ Valid Magic Square" : "✗ Invalid Magic Square"}
                </div>

                <VefkWritingAssistant grid={g} color={color} />
                <ExpandedLetterValues letters={sourceLetters} elementColor={color} bastLevel={bastLevel} />
                <SourceSection letters={sourceLetters} sourceTotal={sourceNumber} elementColor={color} />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Method4FinalVefkSummary({
  kitabetVefk, kitabetVefkSource, kitabetNames, kitabetLetters,
  avanVefk, avanVefkSource, avanNames, avanLetters,
  kasemVefk, kasemVefkSource, kasemNames, kasemLetters, kasemBastLevel,
  dominant,
}) {
  if (!kitabetVefk && !avanVefk && !kasemVefk) return null;
  const elementColor = ELEMENT_COLORS[dominant] || ELEMENT_COLORS.fire;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{ background: G.bg, borderColor: G.goldBorderHi, boxShadow: `0 0 80px ${G.glow}, 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)` }}
    >
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />

      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-3" style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
          <span className="font-inter text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Final Summary — Three Wafqs</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
        <h2 className="font-amiri text-2xl font-bold" style={{ color: G.gold }}>ملخص الأوفاق الثلاثة</h2>
        <p className="font-inter text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: G.goldDim }}>Tap a section to expand • Read-only display</p>
      </div>

      <OrnamentalDivider />

      <div className="px-4 pb-6 pt-4 space-y-3">
        <SectionPanel
          label="Esma-i Kitabet Wafq" arabic="وفق أسماء الكتابة" subtitle="Esma-i Kitabet"
          vefk={kitabetVefk} sourceNumber={kitabetVefkSource} sourceLabel="Vefk Source (Expanded Letters B1 Total)"
          names={kitabetNames || []} sourceLetters={kitabetLetters || []} bastLevel={1}
          elementColor={elementColor}
        />
        <SectionPanel
          label="Esma-i A'van Wafq" arabic="وفق أسماء الأعوان" subtitle="Esma-i A'van"
          vefk={avanVefk} sourceNumber={avanVefkSource} sourceLabel="Vefk Source (Expanded Letters B1 Total)"
          names={avanNames || []} sourceLetters={avanLetters || []} bastLevel={1}
          elementColor={elementColor}
        />
        <SectionPanel
          label="Esma-i Kasem Wafq" arabic="وفق أسماء القسم" subtitle="Esma-i Kasem"
          vefk={kasemVefk} sourceNumber={kasemVefkSource} sourceLabel={`Vefk Source (B${kasemBastLevel} Total)`}
          names={kasemNames || []} sourceLetters={kasemLetters || []} bastLevel={kasemBastLevel}
          elementColor={elementColor}
        />
      </div>

      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
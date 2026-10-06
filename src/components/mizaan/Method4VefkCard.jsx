// ═══════════════════════════════════════════════════════════════
// METHOD 4 — Shared Vefk (Kalam) Display Card
// Same manuscript-framed grid layout used in Method 1 / Method 2.
// Display-only — receives an already-built vefk object (from buildVefk).
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getBastLevel as getBastLevelDefault, istintak } from "../../lib/mizaanPostEngine";

const G = {
  gold:         "#F5D060",
  goldDim:      "rgba(245,208,96,0.55)",
  goldFaint:    "rgba(212,175,55,0.07)",
  goldBorder:   "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  bgCard:       "rgba(8,16,40,0.98)",
  bgInner:      "rgba(212,175,55,0.06)",
  dim:          "rgba(255,255,255,0.35)",
  green:        "#4ADE80",
  red:          "#F87171",
};

const ELEMENT_META = {
  fire:  { arabic: "النار",  icon: "🔥", color: "#FF6B35" },
  earth: { arabic: "التراب", icon: "🌍", color: "#A5C880" },
  air:   { arabic: "الهواء", icon: "🌪",  color: "#B2EBF2" },
  water: { arabic: "الماء",  icon: "💧", color: "#4FC3F7" },
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

// Collapsible expanded letter values — identical pattern to Methods 1–3
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

// Collapsible source section — identical pattern to Methods 1–3
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
            {safe.map((l, i) => (
              <span key={i} className="font-amiri" style={{ color: elementColor, fontSize: "0.7rem" }}>{l}</span>
            ))}
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

export default function Method4VefkCard({ step, title, sourceNumber, sourceLabel, vefk, dominant = "fire", sourceLetters = [], bastLevel = 1, useMcBorder = false }) {
  if (!vefk) return null;
  const elementMeta = ELEMENT_META[dominant] || ELEMENT_META.fire;
  const g = vefk.grid;
  const mc = g[0].reduce((s, v) => s + v, 0);
  const rowSums = g.map(r => r.reduce((a, b) => a + b, 0));
  const colSums = g[0].map((_, j) => g.reduce((s, r) => s + r[j], 0));
  const d1 = g.reduce((s, r, i) => s + r[i], 0);
  const d2 = g.reduce((s, r, i) => s + r[3 - i], 0);
  const allOk = rowSums.every(x => x === mc) && colSums.every(x => x === mc) && d1 === mc && d2 === mc;
  // Border letters: default = element-based guardian name (Kitabet/A'van unchanged).
  // When useMcBorder=true (Method 4 Asmaul Qasam only), derive from this square's own MC: istintak(MC).
  const guardianName = useMcBorder ? istintak(mc).join("") : (vefk.guardianName || "");
  const guardianLetters = [...guardianName];

  return (
    <div className="rounded-xl border p-5"
      style={{ background: G.bgCard, borderColor: elementMeta.color + "55", borderLeft: `3px solid ${elementMeta.color}`, boxShadow: `0 2px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(212,175,55,0.05)` }}>
      <SectionHeader step={step} label={title} arabic="الوفق" color={elementMeta.color} />

      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{elementMeta.icon}</span>
        <div className="flex items-center gap-2">
          <span className="font-amiri text-lg" style={{ color: elementMeta.color }}>{elementMeta.arabic}</span>
          <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>({dominant})</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 mb-4">
        <div className="font-amiri text-xl font-bold tracking-widest text-center" dir="rtl"
          style={{ color: elementMeta.color, textShadow: `0 0 12px ${elementMeta.color}55` }}>
          {guardianName}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center justify-center gap-0.5">
            {guardianLetters.map((l, i) => (
              <span key={i} className="font-amiri font-bold leading-tight"
                style={{ color: elementMeta.color, fontSize: "1rem", textShadow: `0 0 8px ${elementMeta.color}55` }}>{l}</span>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {g.flat().map((val, idx) => (
              <div key={idx}
                className="aspect-square flex items-center justify-center rounded-lg border font-inter text-sm font-bold tabular-nums"
                style={{ background: idx % 2 === 0 ? G.goldFaint : G.bgInner, borderColor: elementMeta.color + "55", color: elementMeta.color, minWidth: "2.5rem" }}>
                {val.toLocaleString()}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5">
            {guardianLetters.map((l, i) => (
              <span key={i} className="font-amiri font-bold leading-tight"
                style={{ color: elementMeta.color, fontSize: "1rem", textShadow: `0 0 8px ${elementMeta.color}55` }}>{l}</span>
            ))}
          </div>
        </div>
        <div className="font-amiri text-xl font-bold tracking-widest text-center" dir="rtl"
          style={{ color: elementMeta.color, textShadow: `0 0 12px ${elementMeta.color}55` }}>
          {guardianName}
        </div>
      </div>

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border"
          style={{ background: G.goldFaint, borderColor: elementMeta.color + "40" }}>
          <span className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Magic Constant (MC)</span>
          <span className="font-inter text-sm font-bold tabular-nums" style={{ color: elementMeta.color }}>{mc.toLocaleString()}</span>
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

        <div className="pt-2 border-t text-[7px]" style={{ borderColor: G.goldBorder + "30", color: G.dim }}>
          {sourceLabel}: <span className="font-bold tabular-nums" style={{ color: elementMeta.color }}>{sourceNumber?.toLocaleString()}</span>
        </div>

        <ExpandedLetterValues letters={sourceLetters} elementColor={elementMeta.color} bastLevel={bastLevel} />
        <SourceSection letters={sourceLetters} sourceTotal={sourceNumber} elementColor={elementMeta.color} />
      </div>
    </div>
  );
}
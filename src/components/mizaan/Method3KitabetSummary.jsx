// ═══════════════════════════════════════════════════════════════
// METHOD 3 — ESMA-I KITABET STAGE SUMMARY (display only)
// ─────────────────────────────────────────────────────────────
// Pure presentation: shows the completed Esma-i Kitabet output that
// becomes the input to Esma-i A'van — the final (original, non-
// supplemented) Kitabet name, the exact letters carried forward,
// and Method 3's own calculation values (Last Name Bast, Galib
// Anasir Bast, Nine Mizan Total, Result). No calculation logic here.
// ═══════════════════════════════════════════════════════════════

const G = {
  gold:        "#F5D060",
  goldDim:     "rgba(245,208,96,0.55)",
  goldBorder:  "rgba(212,175,55,0.40)",
  goldFaint:   "rgba(212,175,55,0.07)",
  bgInner:     "rgba(212,175,55,0.06)",
  dim:         "rgba(255,255,255,0.35)",
};

export default function Method3KitabetSummary({ kitabetName, lastNameBast, galibAnasirBast, nineMizanTotal, resultTotal, elementColor = G.gold }) {
  const letters = kitabetName ? [...kitabetName] : [];

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
          style={{ background: elementColor + "22", border: `1px solid ${elementColor}55`, color: elementColor }}>
          1
        </div>
        <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: elementColor }}>
          Esma-i Kitabet — Completed Output (Method 3)
        </span>
      </div>

      {/* Final Kitabet Name */}
      <div className="space-y-2">
        <div className="font-inter text-[8px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>
          Final Kitabet Name
        </div>
        <div className="text-center py-2">
          <span className="font-amiri text-3xl font-bold px-5 py-3 rounded-xl border inline-block"
            style={{ color: elementColor, borderColor: elementColor + "55", background: elementColor + "12", lineHeight: 1.8 }}
            dir="rtl">
            {kitabetName || "—"}
          </span>
        </div>
      </div>

      {/* Letters carried forward */}
      <div className="space-y-2">
        <div className="font-inter text-[8px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>
          Letters Passed to Esma-i A'van
        </div>
        <div className="flex flex-wrap gap-2.5 justify-center" style={{ direction: "rtl" }}>
          {letters.map((l, i) => (
            <span key={i} className="font-amiri font-bold rounded-lg border px-3 py-2 text-xl"
              style={{ color: elementColor, borderColor: elementColor + "40", background: elementColor + "12", lineHeight: 1.7 }}>
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Method 3 calculation values */}
      <div className="rounded-xl border p-3 space-y-3" style={{ background: G.bgInner, borderColor: G.goldBorder + "40" }}>
        <div className="font-inter text-[8px] uppercase tracking-widest font-bold text-center" style={{ color: G.dim }}>
          Method 3 Values
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Last Name Bast</div>
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
          <div className="font-inter text-lg font-black tabular-nums" style={{ color: G.gold }}>{resultTotal.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
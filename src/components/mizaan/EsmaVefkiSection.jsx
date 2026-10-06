import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getBastLevel, buildVefk } from "../../lib/mizaanPostEngine";

// ── Design tokens (matching SatrVahidGrouping) ──────────────────
const G = {
  gold:        "#F5D060",
  goldDim:     "rgba(245,208,96,0.55)",
  goldFaint:   "rgba(245,208,96,0.12)",
  goldBorder:  "rgba(212,175,55,0.40)",
  goldBorderHi:"rgba(212,175,55,0.65)",
  glow:        "rgba(212,175,55,0.18)",
  bg:          "rgba(3,6,20,0.99)",
  bgCard:      "rgba(8,16,40,0.98)",
  bgInner:     "rgba(212,175,55,0.06)",
  green:       "#4ADE80",
  greenDim:    "rgba(74,222,128,0.15)",
  blue:        "#93C5FD",
  blueDim:     "rgba(147,197,253,0.15)",
  dim:         "rgba(255,255,255,0.35)",
};

// Element display data
const ELEMENT_META = {
  fire:  { arabic: "النار",    english: "Fire",  color: "#F87171", icon: "🜂" },
  earth: { arabic: "التراب",   english: "Earth", color: "#86EFAC", icon: "🜃" },
  air:   { arabic: "الهواء",   english: "Air",   color: "#93C5FD", icon: "🜁" },
  water: { arabic: "الماء",    english: "Water", color: "#67E8F9", icon: "🜄" },
};


// ── Sub-components ───────────────────────────────────────────────

function SectionHeader({ label, arabic, step, color = G.gold }) {
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

function StatRow({ label, value, valueColor = G.gold }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: G.goldBorder + "55" }}>
      <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{label}</span>
      <span className="font-inter text-sm font-bold tabular-nums" style={{ color: valueColor }}>{value}</span>
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

// ── Vefk Grid display ────────────────────────────────────────────
function VefkGrid({ vefkResult }) {
  if (!vefkResult) return null;
  const { grid, element, guardianName } = vefkResult;
  // MC derived directly from the completed grid — never from a separate label or source value
  const mc = grid[0].reduce((s, v) => s + v, 0);
  const elMeta = ELEMENT_META[element] || ELEMENT_META.fire;

  // Split guardian name into individual letters for side display
  const guardianLetters = guardianName ? [...guardianName] : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-3 py-2 rounded-lg"
        style={{ background: G.bgInner, border: `1px solid ${G.goldBorder}` }}>
        <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Magic Constant (MC)</span>
        <span className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{mc.toLocaleString()}</span>
      </div>

      {/* Manuscript-style framed Vefk */}
      <div className="flex flex-col items-center gap-1">

        {/* TOP — full guardian name */}
        <div className="font-amiri text-xl font-bold tracking-widest text-center" dir="rtl"
          style={{ color: elMeta.color, textShadow: `0 0 12px ${elMeta.color}55` }}>
          {guardianName}
        </div>

        {/* MIDDLE ROW: Left letters | Grid | Right letters */}
        <div className="flex items-center gap-2">

          {/* LEFT — letters stacked vertically (top→bottom) */}
          <div className="flex flex-col items-center justify-center gap-0.5">
            {guardianLetters.map((l, i) => (
              <span key={i} className="font-amiri font-bold leading-tight"
                style={{ color: elMeta.color, fontSize: "1rem", textShadow: `0 0 8px ${elMeta.color}55` }}>
                {l}
              </span>
            ))}
          </div>

          {/* GRID */}
          <div className="rounded-xl border overflow-hidden"
            style={{ borderColor: elMeta.color + "44" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, padding: 6, background: "rgba(4,8,24,0.98)" }}>
              {grid.flat().map((num, idx) => (
                <div key={idx}
                  className="flex items-center justify-center font-amiri font-bold rounded"
                  style={{
                    aspectRatio: "1/1",
                    background: `linear-gradient(145deg, ${elMeta.color}18 0%, ${elMeta.color}08 100%)`,
                    border: `1px solid ${elMeta.color}35`,
                    color: G.gold,
                    fontSize: "1rem",
                    minWidth: "2.5rem",
                  }}>
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — letters stacked vertically (top→bottom) */}
          <div className="flex flex-col items-center justify-center gap-0.5">
            {guardianLetters.map((l, i) => (
              <span key={i} className="font-amiri font-bold leading-tight"
                style={{ color: elMeta.color, fontSize: "1rem", textShadow: `0 0 8px ${elMeta.color}55` }}>
                {l}
              </span>
            ))}
          </div>

        </div>

        {/* BOTTOM — full guardian name */}
        <div className="font-amiri text-xl font-bold tracking-widest text-center" dir="rtl"
          style={{ color: elMeta.color, textShadow: `0 0 12px ${elMeta.color}55` }}>
          {guardianName}
        </div>

      </div>

      {/* Row / Col / Diagonal verification */}
      {(() => {
        const actualMC = grid[0].reduce((s, v) => s + v, 0);
        const rowSums = grid.map(r => r.reduce((a, b) => a + b, 0));
        const colSums = grid[0].map((_, j) => grid.reduce((s, r) => s + r[j], 0));
        const d1 = grid.reduce((s, r, i) => s + r[i], 0);
        const d2 = grid.reduce((s, r, i) => s + r[3 - i], 0);
        const allOk = rowSums.every(x => x === actualMC) && colSums.every(x => x === actualMC) && d1 === actualMC && d2 === actualMC;
        const lines = [
          ...rowSums.map((s, i) => ({ label: `Row ${i + 1}`, sum: s })),
          ...colSums.map((s, i) => ({ label: `Col ${i + 1}`, sum: s })),
          { label: "Diag ↘", sum: d1 },
          { label: "Diag ↙", sum: d2 },
        ];
        return (
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1 text-[6px]">
              {lines.map(({ label, sum }) => (
                <div key={label} className="flex justify-between px-2 py-1 rounded"
                  style={{ background: sum === actualMC ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${sum === actualMC ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}` }}>
                  <span style={{ color: G.dim }}>{label}</span>
                  <span style={{ color: sum === actualMC ? G.green : "#F87171", fontWeight: "bold" }}>{sum.toLocaleString()} {sum === actualMC ? "✓" : "✗"}</span>
                </div>
              ))}
            </div>
            <div className="text-[6px] font-bold text-center px-2 py-1 rounded"
              style={{ background: allOk ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", color: allOk ? G.green : "#F87171" }}>
              {allOk ? "✓ Valid Magic Square — all 10 lines equal MC" : "✗ Invalid Magic Square"}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Main exported component ──────────────────────────────────────
// satrVahidLetters: Section D (Combined Sequence) — the sole source for MC.
// dominant: passed from SatrVahidGrouping — same Galib Anasir used for grouping.
export default function EsmaVefkiSection({ satrVahidLetters = [], groups, dominant = "fire" }) {
  const [showAudit, setShowAudit] = useState(false);
  const safeGroups = groups || [];
  const safeSatr = Array.isArray(satrVahidLetters) ? satrVahidLetters : [];

  // Build audit rows: each Section D letter + its Birinci Bast + running total
  const auditRows = useMemo(() => {
    let running = 0;
    return safeSatr.map((letter, i) => {
      const bast = getBastLevel(letter, 1) || 0;
      running += bast;
      return { index: i + 1, letter, bast, running };
    });
  }, [safeSatr]);

  const totalBast = auditRows.length > 0 ? auditRows[auditRows.length - 1].running : 0;
  const totalLetters = safeSatr.length;

  const elMeta = ELEMENT_META[dominant] || ELEMENT_META.fire;

  const vefkResult = useMemo(() => {
    if (!totalBast || totalBast < 30) return null;
    return buildVefk(totalBast, dominant);
  }, [totalBast, dominant]);

  if (safeGroups.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
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
          <span className="font-inter text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Section K</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
        <h2 className="font-amiri text-3xl font-bold" style={{ color: G.gold }}>وفق أسماء الكتابة</h2>
        <p className="font-inter text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: G.goldDim }}>Esma-i Kitabet Vefki</p>
      </div>

      <OrnamentalDivider />

      <div className="px-4 pb-6 space-y-5 pt-4">

        {/* K1 — Compact Summary with Collapsible Audit */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionHeader step="K1" label="Magic Constant" arabic="الثابت السحري" color={G.blue} />
            </div>

            {/* Summary stats */}
            {(() => {
              const mc = vefkResult ? vefkResult.grid[0].reduce((s, v) => s + v, 0) : null;
              const isValid = vefkResult ? (() => {
                const g = vefkResult.grid;
                const m = g[0].reduce((s, v) => s + v, 0);
                const rs = g.map(r => r.reduce((a, b) => a + b, 0));
                const cs = g[0].map((_, j) => g.reduce((s, r) => s + r[j], 0));
                const d1 = g.reduce((s, r, i) => s + r[i], 0);
                const d2 = g.reduce((s, r, i) => s + r[3 - i], 0);
                return rs.every(x => x === m) && cs.every(x => x === m) && d1 === m && d2 === m;
              })() : false;
              return (
                <div className="space-y-0">
                  <StatRow label="Section D Letter Count" value={totalLetters} valueColor={G.gold} />
                  <StatRow label="Vefk Source (Birinci Bast Total)" value={totalBast.toLocaleString()} valueColor={G.goldDim} />
                  {mc !== null && <StatRow label="Magic Constant (from grid)" value={mc.toLocaleString()} valueColor={G.gold} />}
                  <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: G.goldBorder + "55" }}>
                    <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Dominant Anasir</span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "0.9rem" }}>{elMeta.icon}</span>
                      <span className="font-amiri text-sm font-bold" style={{ color: elMeta.color }}>{elMeta.arabic}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Validation</span>
                    <span className="font-inter text-[8px] font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: isValid ? G.green + "22" : "#F87171" + "22", color: isValid ? G.green : "#F87171" }}>
                      {isValid ? "✓ Valid Magic Square" : "✗ Invalid"}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Collapsible Audit Button */}
            <button
              onClick={() => setShowAudit(!showAudit)}
              className="w-full mt-3 px-3 py-2 rounded-lg border font-inter text-[8px] uppercase tracking-widest font-semibold transition-all"
              style={{
                background: showAudit ? G.goldFaint : "transparent",
                borderColor: showAudit ? G.goldBorder + "80" : G.goldBorder + "40",
                color: G.gold,
              }}
            >
              {showAudit ? "Hide Audit Calculation" : "Show Audit Calculation"}
            </button>

            {/* Expanded Audit Table */}
            {showAudit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 pt-3 border-t overflow-x-auto"
                style={{ borderColor: G.goldBorder + "55" }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${G.goldBorder}` }}>
                      <th className="font-inter text-[7px] uppercase tracking-widest text-left py-1.5 px-2" style={{ color: G.dim }}>#</th>
                      <th className="font-inter text-[7px] uppercase tracking-widest text-center py-1.5 px-2" style={{ color: G.dim }}>Letter</th>
                      <th className="font-inter text-[7px] uppercase tracking-widest text-right py-1.5 px-2" style={{ color: G.dim }}>Birinci Bast</th>
                      <th className="font-inter text-[7px] uppercase tracking-widest text-right py-1.5 px-2" style={{ color: G.dim }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditRows.map((row, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${G.goldBorder}22`, background: i % 2 === 0 ? "transparent" : G.bgInner + "55" }}>
                        <td className="font-inter tabular-nums py-1 px-2" style={{ color: G.dim, fontSize: 9 }}>{row.index}</td>
                        <td className="text-center py-1 px-2">
                          <span className="font-amiri font-bold text-lg" style={{ color: G.gold }}>{row.letter}</span>
                        </td>
                        <td className="font-inter tabular-nums text-right py-1 px-2 font-semibold" style={{ color: G.blue, fontSize: 10 }}>{row.bast.toLocaleString()}</td>
                        <td className="font-inter tabular-nums text-right py-1 px-2 font-bold" style={{ color: G.goldDim, fontSize: 10 }}>{row.running.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: `2px solid ${G.goldBorder}` }}>
                      <td colSpan={2} className="font-inter uppercase tracking-widest py-1.5 px-2 font-bold" style={{ color: G.gold, fontSize: 8 }}>
                        Final MC
                      </td>
                      <td />
                      <td className="font-inter tabular-nums text-right py-1.5 px-2 font-black" style={{ color: G.gold, fontSize: 12 }}>{totalBast.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </motion.div>
            )}
          </div>
        </Card>

        <OrnamentalDivider />

        {/* K2 — Vefk */}
        <Card accent={elMeta.color}>
          <SectionHeader step="K2" label="Esma-i Kitabet Vefk" arabic="الوفق" color={elMeta.color} />
          {vefkResult ? (
            <VefkGrid vefkResult={vefkResult} />
          ) : (
            <p className="font-inter text-xs text-center py-4" style={{ color: G.dim }}>
              Total Bast value too small to construct a Vefk (minimum 30 required).
            </p>
          )}
        </Card>

      </div>

      {/* Bottom accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
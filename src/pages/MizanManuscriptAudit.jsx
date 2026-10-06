import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";

const G = {
  gold: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
  goldBorder: "rgba(212,175,55,0.40)",
  green: "#22c55e",
  red: "#ef4444",
  amber: "#f59e0b",
  bgCard: "rgba(8,16,40,0.98)",
  bgInner: "rgba(212,175,55,0.06)",
  dim: "rgba(255,255,255,0.35)",
  white: "rgba(255,255,255,0.85)",
};

// ══════════════════════════════════════════════════════════════════════
// MANUSCRIPT DATA — RAW CELL VALUES ONLY
// Source: Usûlül Bast fi Sirril Evfâk vel Havas — İdris Çelebi
// These values are taken directly from the manuscript pages.
// No transformation, no inference. Only what is written.
// ══════════════════════════════════════════════════════════════════════

const MANUSCRIPT = {
  page316: {
    label: "Page 316",
    sourceNumber: 80,
    // Exact 16 cells, row by row, as they appear on manuscript page 316
    grid: [
      [19, 23, 26, 12],
      [25, 13, 18, 24],
      [14, 28, 21, 17],
      [22, 16, 15, 27],
    ],
  },
  page314: {
    label: "Page 314",
    sourceNumber: 1696,
    // Exact 16 cells, row by row, as they appear on manuscript page 314
    grid: [
      [423, 426, 430, 416],
      [429, 417, 422, 427],
      [418, 432, 424, 421],
      [425, 420, 419, 431],
    ],
  },
};

// ══════════════════════════════════════════════════════════════════════
// RAW ARITHMETIC — computed only from the manuscript cells above
// No formula imposed. Just addition.
// ══════════════════════════════════════════════════════════════════════
function computeGridFacts(grid, sourceNumber) {
  const rows = grid.map(row => row.reduce((a, b) => a + b, 0));
  const cols = grid[0].map((_, j) => grid.reduce((s, row) => s + row[j], 0));
  const diag1 = grid.reduce((s, row, i) => s + row[i], 0);   // top-left → bottom-right
  const diag2 = grid.reduce((s, row, i) => s + row[3 - i], 0); // top-right → bottom-left

  const allRowsEqual = rows.every(r => r === rows[0]);
  const allColsEqual = cols.every(c => c === cols[0]);
  const rowsColsEqual = allRowsEqual && allColsEqual && rows[0] === cols[0];
  const diag1MatchesRows = diag1 === rows[0];
  const diag2MatchesRows = diag2 === rows[0];
  const mc = rows[0]; // Manuscript MC = first row sum (all rows identical)

  // Cell range
  const flat = grid.flat();
  const minCell = Math.min(...flat);
  const maxCell = Math.max(...flat);

  // Differences from Q (the "base" if we apply: V=S-30, Q=floor(V/4))
  const V = sourceNumber - 30;
  const Q = Math.floor(V / 4);
  const R = V % 4;

  // Map each cell's offset from Q
  const offsets = grid.map(row => row.map(v => v - Q));

  // What cell values appear if we try sequence Q, Q+1, ... Q+15?
  const baseSequence = Array.from({ length: 16 }, (_, i) => Q + i);

  // Which manuscript cell values appear in the base sequence (no corrections)?
  const manuscriptFlat = flat.sort((a, b) => a - b);
  const baseInManuscript = baseSequence.filter(v => flat.includes(v));
  const manuscriptNotInBase = flat.filter(v => !baseSequence.includes(v));

  return {
    rows, cols, diag1, diag2, mc,
    allRowsEqual, allColsEqual, rowsColsEqual,
    diag1MatchesRows, diag2MatchesRows,
    minCell, maxCell, cellRange: maxCell - minCell,
    V, Q, R,
    offsets,
    baseSequence,
    baseInManuscript,
    manuscriptNotInBase: manuscriptNotInBase.sort((a, b) => a - b),
    mcEqualsSource: mc === sourceNumber,
    mcEqualsSourceMinusR: mc === sourceNumber - R,
    mc4QPlus30: mc === 4 * Q + 30,
    mc4QRPlus30: mc === 4 * Q + R + 30,
  };
}

function GridCell({ value, highlight }) {
  return (
    <div
      className="aspect-square flex items-center justify-center rounded border font-inter text-xs font-bold"
      style={{
        background: highlight ? "rgba(245,208,96,0.18)" : G.bgInner,
        borderColor: highlight ? G.gold : G.goldBorder + "60",
        color: highlight ? G.gold : G.goldDim,
        minWidth: "2.5rem",
        minHeight: "2.5rem",
      }}
    >
      {value.toLocaleString()}
    </div>
  );
}

function GridWithSums({ grid, label }) {
  const rows = grid.map(row => row.reduce((a, b) => a + b, 0));
  const cols = grid[0].map((_, j) => grid.reduce((s, row) => s + row[j], 0));
  const diag1 = grid.reduce((s, row, i) => s + row[i], 0);
  const diag2 = grid.reduce((s, row, i) => s + row[3 - i], 0);
  const mc = rows[0];
  const allMatch = rows.every(r => r === mc) && cols.every(c => c === mc) && diag1 === mc && diag2 === mc;

  return (
    <div>
      <div className="text-[8px] uppercase tracking-wider font-bold mb-2 text-center" style={{ color: G.goldDim }}>
        {label}
      </div>
      {/* Grid + row sums */}
      <div className="flex items-start gap-2 justify-center">
        <div className="space-y-1">
          {grid.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map((val, ci) => (
                <GridCell key={ci} value={val} />
              ))}
              {/* Row sum */}
              <div
                className="flex items-center justify-center rounded border font-inter text-xs font-bold ml-1"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  borderColor: "rgba(34,197,94,0.35)",
                  color: G.green,
                  minWidth: "3rem",
                  minHeight: "2.5rem",
                  padding: "0 4px",
                }}
              >
                Σ{rows[ri].toLocaleString()}
              </div>
            </div>
          ))}
          {/* Col sums row */}
          <div className="flex gap-1 mt-1">
            {cols.map((cs, ci) => (
              <div
                key={ci}
                className="flex items-center justify-center rounded border font-inter text-xs font-bold"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  borderColor: "rgba(34,197,94,0.35)",
                  color: G.green,
                  minWidth: "2.5rem",
                  minHeight: "2rem",
                }}
              >
                {cs.toLocaleString()}
              </div>
            ))}
            <div
              className="flex items-center justify-center rounded border font-inter text-xs font-bold ml-1"
              style={{
                background: allMatch ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                borderColor: allMatch ? "rgba(34,197,94,0.50)" : "rgba(239,68,68,0.50)",
                color: allMatch ? G.green : G.red,
                minWidth: "3rem",
                minHeight: "2rem",
                padding: "0 4px",
                fontSize: "9px",
              }}
            >
              {allMatch ? "✓" : "✗"}
            </div>
          </div>
        </div>
      </div>
      {/* Diagonal sums */}
      <div className="flex gap-4 justify-center mt-2 text-[7px]">
        <div style={{ color: diag1 === mc ? G.green : G.red }}>
          ↘ Diag1 = {diag1.toLocaleString()} {diag1 === mc ? "✓" : "✗"}
        </div>
        <div style={{ color: diag2 === mc ? G.green : G.red }}>
          ↙ Diag2 = {diag2.toLocaleString()} {diag2 === mc ? "✓" : "✗"}
        </div>
      </div>
      <div className="text-center mt-1 font-bold text-[8px]" style={{ color: allMatch ? G.green : G.red }}>
        {allMatch ? `✓ All sums = ${mc.toLocaleString()}` : `✗ Sums do not all match`}
      </div>
    </div>
  );
}

function FactRow({ label, value, verdict, note }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b text-[7px]" style={{ borderColor: G.goldBorder + "25" }}>
      <span style={{ color: G.dim }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold" style={{ color: verdict === true ? G.green : verdict === false ? G.red : G.gold }}>
          {value}
        </span>
        {note && <span style={{ color: G.dim }}>({note})</span>}
      </div>
    </div>
  );
}

function ManuscriptExampleAudit({ data, facts }) {
  return (
    <div
      className="rounded-xl border p-5 space-y-5"
      style={{ background: G.bgCard, borderColor: G.goldBorder }}
    >
      {/* Header */}
      <div className="pb-3 border-b" style={{ borderColor: G.goldBorder + "40" }}>
        <div className="font-inter font-bold text-base" style={{ color: G.gold }}>
          {data.label} — Source = {data.sourceNumber.toLocaleString()}
        </div>
        <div className="text-[7px] mt-1 font-mono" style={{ color: G.dim }}>
          V = {facts.V} | Q = {facts.Q} | R = {facts.R}
        </div>
      </div>

      {/* SECTION 1: Exact cell values */}
      <div>
        <div className="text-[8px] uppercase tracking-wider font-bold mb-3" style={{ color: G.goldDim }}>
          § 1 — Exact Manuscript Cell Values (16 cells)
        </div>
        <div className="grid grid-cols-8 gap-1 text-[7px] font-mono" style={{ color: G.dim }}>
          {data.grid.flat().map((v, i) => (
            <div key={i} className="text-center p-1 rounded" style={{ background: G.bgInner, color: G.gold }}>
              {v}
            </div>
          ))}
        </div>
        <div className="mt-2 text-[7px]" style={{ color: G.dim }}>
          Cell range: {facts.minCell.toLocaleString()} – {facts.maxCell.toLocaleString()} (span = {facts.cellRange})
        </div>
      </div>

      {/* SECTION 2: Grid with all sums */}
      <div>
        <div className="text-[8px] uppercase tracking-wider font-bold mb-3" style={{ color: G.goldDim }}>
          § 2 — Row Sums, Column Sums, Diagonal Sums
        </div>
        <GridWithSums grid={data.grid} label="Manuscript Grid — All Sums" />
      </div>

      {/* SECTION 3: Manuscript constant facts */}
      <div>
        <div className="text-[8px] uppercase tracking-wider font-bold mb-3" style={{ color: G.goldDim }}>
          § 3 — Manuscript Constant (MC) — Raw Facts
        </div>
        <div className="rounded-lg border p-3 space-y-0.5" style={{ borderColor: G.goldBorder + "40" }}>
          <FactRow label="Row 1 sum" value={facts.rows[0].toLocaleString()} verdict={true} />
          <FactRow label="Row 2 sum" value={facts.rows[1].toLocaleString()} verdict={facts.rows[1] === facts.rows[0]} note={facts.rows[1] === facts.rows[0] ? "= Row 1" : "≠ Row 1"} />
          <FactRow label="Row 3 sum" value={facts.rows[2].toLocaleString()} verdict={facts.rows[2] === facts.rows[0]} note={facts.rows[2] === facts.rows[0] ? "= Row 1" : "≠ Row 1"} />
          <FactRow label="Row 4 sum" value={facts.rows[3].toLocaleString()} verdict={facts.rows[3] === facts.rows[0]} note={facts.rows[3] === facts.rows[0] ? "= Row 1" : "≠ Row 1"} />
          <FactRow label="Col 1 sum" value={facts.cols[0].toLocaleString()} verdict={facts.cols[0] === facts.mc} />
          <FactRow label="Col 2 sum" value={facts.cols[1].toLocaleString()} verdict={facts.cols[1] === facts.mc} />
          <FactRow label="Col 3 sum" value={facts.cols[2].toLocaleString()} verdict={facts.cols[2] === facts.mc} />
          <FactRow label="Col 4 sum" value={facts.cols[3].toLocaleString()} verdict={facts.cols[3] === facts.mc} />
          <FactRow label="Diagonal ↘" value={facts.diag1.toLocaleString()} verdict={facts.diag1 === facts.mc} />
          <FactRow label="Diagonal ↙" value={facts.diag2.toLocaleString()} verdict={facts.diag2 === facts.mc} />
          <div className="pt-2 mt-2 border-t text-[8px] font-bold text-center" style={{ borderColor: G.goldBorder + "40", color: facts.allRowsEqual && facts.allColsEqual && facts.diag1MatchesRows && facts.diag2MatchesRows ? G.green : G.red }}>
            Manuscript MC = {facts.mc.toLocaleString()}
            {facts.allRowsEqual && facts.allColsEqual && facts.diag1MatchesRows && facts.diag2MatchesRows
              ? " — All 10 sums identical ✓"
              : " — Sums NOT all identical ✗"}
          </div>
        </div>
      </div>

      {/* SECTION 4: Relationship between Source, R, MC */}
      <div>
        <div className="text-[8px] uppercase tracking-wider font-bold mb-3" style={{ color: G.goldDim }}>
          § 4 — Relationship: Source / R / Q / MC — Observed Only
        </div>
        <div className="rounded-lg border p-3 space-y-0.5" style={{ borderColor: G.goldBorder + "40" }}>
          <FactRow label="Source (S)" value={data.sourceNumber.toLocaleString()} />
          <FactRow label="V = S − 30" value={facts.V.toLocaleString()} />
          <FactRow label="Q = ⌊V ÷ 4⌋" value={facts.Q.toLocaleString()} />
          <FactRow label="R = V mod 4" value={facts.R.toLocaleString()} />
          <FactRow label="Manuscript MC" value={facts.mc.toLocaleString()} />
          <div className="pt-2 mt-1 border-t space-y-0.5" style={{ borderColor: G.goldBorder + "20" }}>
            <FactRow
              label="MC = Source?"
              value={facts.mcEqualsSource ? `YES — ${facts.mc} = ${data.sourceNumber}` : `NO — diff = ${Math.abs(facts.mc - data.sourceNumber)}`}
              verdict={facts.mcEqualsSource}
            />
            <FactRow
              label="MC = 4Q + 30?"
              value={facts.mc4QPlus30 ? `YES — ${facts.mc} = 4×${facts.Q}+30` : `NO — 4Q+30 = ${4 * facts.Q + 30}`}
              verdict={facts.mc4QPlus30}
            />
            <FactRow
              label="MC = 4Q + R + 30?"
              value={facts.mc4QRPlus30 ? `YES — ${facts.mc} = 4×${facts.Q}+${facts.R}+30` : `NO — 4Q+R+30 = ${4 * facts.Q + facts.R + 30}`}
              verdict={facts.mc4QRPlus30}
            />
            <FactRow
              label="MC = S − R?"
              value={facts.mcEqualsSourceMinusR ? `YES — ${facts.mc} = ${data.sourceNumber}−${facts.R}` : `NO — S−R = ${data.sourceNumber - facts.R}`}
              verdict={facts.mcEqualsSourceMinusR}
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: Cell offset analysis from Q */}
      <div>
        <div className="text-[8px] uppercase tracking-wider font-bold mb-3" style={{ color: G.goldDim }}>
          § 5 — Cell Offsets from Q ({facts.Q}) — What Values Exist vs Base Sequence
        </div>
        <div className="text-[7px] space-y-2" style={{ color: G.dim }}>
          <div>
            <span style={{ color: G.goldDim }}>Base sequence Q…Q+15: </span>
            <span className="font-mono">{facts.baseSequence.join(", ")}</span>
          </div>
          <div>
            <span style={{ color: G.goldDim }}>Manuscript cells sorted: </span>
            <span className="font-mono">{[...data.grid.flat()].sort((a,b) => a-b).join(", ")}</span>
          </div>
          <div>
            <span style={{ color: facts.baseInManuscript.length === 16 ? G.green : G.amber }}>
              Cells from base sequence found in manuscript: {facts.baseInManuscript.length}/16
            </span>
            {facts.baseInManuscript.length < 16 && (
              <div className="mt-1">
                <span style={{ color: G.amber }}>Values in manuscript but NOT in Q…Q+15: </span>
                <span className="font-mono text-amber-400">{facts.manuscriptNotInBase.join(", ")}</span>
              </div>
            )}
          </div>
          {/* Offset grid */}
          <div className="mt-2">
            <span style={{ color: G.goldDim }}>Each cell − Q (offset from base):</span>
            <div className="grid grid-cols-4 gap-1 mt-1 max-w-[200px]">
              {facts.offsets.flat().map((v, i) => (
                <div
                  key={i}
                  className="text-center p-1 rounded text-[7px] font-mono font-bold"
                  style={{
                    background: v > 15 || v < 0 ? "rgba(239,68,68,0.12)" : G.bgInner,
                    color: v > 15 || v < 0 ? G.red : v >= 0 && v <= 15 ? G.green : G.amber,
                    border: `1px solid ${v > 15 || v < 0 ? "rgba(239,68,68,0.30)" : G.goldBorder + "40"}`,
                  }}
                >
                  +{v}
                </div>
              ))}
            </div>
            <div className="mt-1 text-[6px]" style={{ color: G.dim }}>
              Green = offset 0–15 (within base sequence range). Red = outside range.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrossExampleComparison({ f316, f314 }) {
  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{ background: G.bgCard, borderColor: "rgba(239,68,68,0.40)" }}
    >
      <div className="font-inter font-bold text-sm" style={{ color: G.red }}>
        ⚠ CROSS-EXAMPLE AUDIT — Discrepancies Between Manuscript & Current Algorithm
      </div>

      {/* What the manuscript actually shows */}
      <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder + "40" }}>
        <div className="text-[8px] uppercase tracking-wider font-bold mb-3" style={{ color: G.goldDim }}>
          What the Manuscript Actually Shows (Empirical Facts Only)
        </div>
        <div className="space-y-2 text-[7px]" style={{ color: G.dim }}>
          <div className="grid grid-cols-3 gap-2 font-mono text-[6px]">
            <div style={{ color: G.gold }}>Property</div>
            <div style={{ color: G.gold }}>Page 316 (S=80)</div>
            <div style={{ color: G.gold }}>Page 314 (S=1696)</div>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[6px]">
            <div>R value</div>
            <div>{f316.R}</div>
            <div>{f314.R}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[6px]">
            <div>Q value</div>
            <div>{f316.Q}</div>
            <div>{f314.Q}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[6px]">
            <div>Manuscript MC</div>
            <div>{f316.mc}</div>
            <div>{f314.mc}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[6px]">
            <div>MC = Source?</div>
            <div style={{ color: f316.mcEqualsSource ? G.green : G.red }}>{f316.mcEqualsSource ? "YES ✓" : "NO ✗"}</div>
            <div style={{ color: f314.mcEqualsSource ? G.green : G.red }}>{f314.mcEqualsSource ? "YES ✓" : "NO ✗"}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[6px]">
            <div>MC = 4Q+30?</div>
            <div style={{ color: f316.mc4QPlus30 ? G.green : G.red }}>{f316.mc4QPlus30 ? "YES ✓" : `NO ✗ (${4*f316.Q+30})`}</div>
            <div style={{ color: f314.mc4QPlus30 ? G.green : G.red }}>{f314.mc4QPlus30 ? "YES ✓" : `NO ✗ (${4*f314.Q+30})`}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[6px]">
            <div>MC = 4Q+R+30?</div>
            <div style={{ color: f316.mc4QRPlus30 ? G.green : G.red }}>{f316.mc4QRPlus30 ? "YES ✓" : `NO ✗ (${4*f316.Q+f316.R+30})`}</div>
            <div style={{ color: f314.mc4QRPlus30 ? G.green : G.red }}>{f314.mc4QRPlus30 ? "YES ✓" : `NO ✗ (${4*f314.Q+f314.R+30})`}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[6px]">
            <div>MC = S−R?</div>
            <div style={{ color: f316.mcEqualsSourceMinusR ? G.green : G.red }}>{f316.mcEqualsSourceMinusR ? "YES ✓" : `NO ✗ (${MANUSCRIPT.page316.sourceNumber - f316.R})`}</div>
            <div style={{ color: f314.mcEqualsSourceMinusR ? G.green : G.red }}>{f314.mcEqualsSourceMinusR ? "YES ✓" : `NO ✗ (${MANUSCRIPT.page314.sourceNumber - f314.R})`}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[6px]">
            <div>Cells outside Q…Q+15</div>
            <div style={{ color: f316.manuscriptNotInBase.length === 0 ? G.green : G.amber }}>
              {f316.manuscriptNotInBase.length === 0 ? "None ✓" : f316.manuscriptNotInBase.join(",")}
            </div>
            <div style={{ color: f314.manuscriptNotInBase.length === 0 ? G.green : G.amber }}>
              {f314.manuscriptNotInBase.length === 0 ? "None ✓" : f314.manuscriptNotInBase.join(",")}
            </div>
          </div>
        </div>
      </div>

      {/* Current algorithm vs manuscript */}
      <div className="p-3 rounded-lg border" style={{ borderColor: "rgba(239,68,68,0.35)" }}>
        <div className="text-[8px] uppercase tracking-wider font-bold mb-3" style={{ color: G.red }}>
          Current Algorithm Output vs Manuscript — Cell-by-Cell Gap
        </div>
        <div className="space-y-3 text-[7px]" style={{ color: G.dim }}>
          <div style={{ color: G.amber }}>
            Current algorithm (positions 9,13 +1 for R=2) produces MC = {f316.Q * 4 + 30} for Page 316.
            Manuscript MC = {f316.mc}. Gap = {f316.mc - (f316.Q * 4 + 30)}.
          </div>
          <div style={{ color: G.amber }}>
            Current algorithm produces MC = {f314.Q * 4 + 30} for Page 314.
            Manuscript MC = {f314.mc}. Gap = {f314.mc - (f314.Q * 4 + 30)}.
          </div>
          <div className="p-2 rounded border mt-2" style={{ borderColor: "rgba(239,68,68,0.35)", color: G.red }}>
            <strong>FINDING:</strong> The current algorithm always produces MC = 4Q+30, 
            regardless of R. Manuscript shows MC = {f316.mcEqualsSource ? "Source" : f316.mc4QRPlus30 ? "4Q+R+30" : "UNKNOWN formula"}.
          </div>
        </div>
      </div>

      {/* Conclusions strictly from manuscript evidence */}
      <div className="p-3 rounded-lg border" style={{ borderColor: G.goldBorder }}>
        <div className="text-[8px] uppercase tracking-wider font-bold mb-3" style={{ color: G.gold }}>
          Conclusions — Manuscript Evidence Only (No External Theory)
        </div>
        <div className="space-y-2 text-[7px]" style={{ color: G.dim }}>
          {[
            {
              status: "confirmed",
              text: `Page 316 MC = ${f316.mc} — all 10 sums (4 rows + 4 cols + 2 diags) = ${f316.mc}`,
              cite: "Page 316",
            },
            {
              status: "confirmed",
              text: `Page 314 MC = ${f314.mc} — all 10 sums = ${f314.mc}`,
              cite: "Page 314",
            },
            {
              status: f316.mcEqualsSource && f314.mcEqualsSource ? "confirmed" : "refuted",
              text: `MC = Source: ${f316.mcEqualsSource && f314.mcEqualsSource ? "CONFIRMED in both examples" : "NOT confirmed — fails in at least one example"}`,
              cite: "Pages 314, 316",
            },
            {
              status: f316.mc4QRPlus30 && f314.mc4QRPlus30 ? "confirmed" : "refuted",
              text: `MC = 4Q+R+30: ${f316.mc4QRPlus30 && f314.mc4QRPlus30 ? "CONFIRMED in both examples" : "NOT confirmed"}`,
              cite: "Pages 314, 316",
            },
            {
              status: f316.mc4QPlus30 && f314.mc4QPlus30 ? "confirmed" : "refuted",
              text: `MC = 4Q+30 (current algorithm): ${f316.mc4QPlus30 && f314.mc4QPlus30 ? "CONFIRMED" : "REFUTED — does not match manuscript"}`,
              cite: "Pages 314, 316",
            },
            {
              status: (f316.manuscriptNotInBase.length === 0 && f314.manuscriptNotInBase.length === 0) ? "confirmed" : "unknown",
              text: `All 16 manuscript cells are within range Q to Q+15: ${f316.manuscriptNotInBase.length === 0 && f314.manuscriptNotInBase.length === 0 ? "YES — confirmed both pages" : "UNKNOWN — needs further check"}`,
              cite: "Pages 314, 316",
            },
          ].map((c, i) => (
            <div key={i} className="flex gap-2 items-start p-2 rounded" style={{
              background: c.status === "confirmed" ? "rgba(34,197,94,0.06)" : c.status === "refuted" ? "rgba(239,68,68,0.06)" : "rgba(245,208,96,0.06)",
              border: `1px solid ${c.status === "confirmed" ? "rgba(34,197,94,0.25)" : c.status === "refuted" ? "rgba(239,68,68,0.25)" : "rgba(245,208,96,0.25)"}`,
            }}>
              <span style={{ color: c.status === "confirmed" ? G.green : c.status === "refuted" ? G.red : G.amber, flexShrink: 0 }}>
                {c.status === "confirmed" ? "✓" : c.status === "refuted" ? "✗" : "?"}
              </span>
              <div>
                <span style={{ color: G.white }}>{c.text}</span>
                <span className="ml-1" style={{ color: G.dim }}>— Source: {c.cite}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unknown / requires more manuscript evidence */}
      <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/5">
        <div className="text-[8px] uppercase tracking-wider font-bold mb-2 text-amber-400">
          UNKNOWN — Requires Additional Manuscript Evidence
        </div>
        <div className="text-[7px] space-y-1" style={{ color: G.dim }}>
          <div>• The exact correction method that produces cells outside Q…Q+15 (if any)</div>
          <div>• Whether additional non-Fire element examples confirm the same MC formula</div>
          <div>• Whether Page 62 explicitly states MC = Source or MC = 4Q+R+30</div>
          <div>• Exact manuscript text describing the correction procedure for R ≠ 0</div>
        </div>
      </div>
    </div>
  );
}

export default function MizanManuscriptAudit() {
  const facts316 = computeGridFacts(MANUSCRIPT.page316.grid, MANUSCRIPT.page316.sourceNumber);
  const facts314 = computeGridFacts(MANUSCRIPT.page314.grid, MANUSCRIPT.page314.sourceNumber);

  return (
    <PageLayout>
      <div className="space-y-5">
        <PageTitle
          arabic="تدقيق المخطوط الميزان"
          latin="Mizan 4×4 Manuscript Audit"
          subtitle="Raw arithmetic from manuscript pages only — no external theory"
          icon="📜"
        />

        {/* Authority statement */}
        <div
          className="p-4 rounded-xl border-2 text-[7px] space-y-2"
          style={{ borderColor: "rgba(239,68,68,0.50)", background: "rgba(239,68,68,0.05)", color: G.dim }}
        >
          <div className="font-bold text-[9px]" style={{ color: G.red }}>
            MIZAN SYSTEM LOCK — MANUSCRIPT AUTHORITY ONLY
          </div>
          <div>• Only Pages 314 and 316 contain verified numerical Mizan 4×4 grids.</div>
          <div>• Page 62 contains construction rules — no computed numerical grid.</div>
          <div>• No cross-system reasoning. No mathematical magic square theory.</div>
          <div>• Every number below is derived by direct addition of manuscript cell values.</div>
          <div>• If the manuscript shows something, it is reproduced exactly. Nothing is assumed.</div>
        </div>

        <ManuscriptExampleAudit data={MANUSCRIPT.page316} facts={facts316} />
        <ManuscriptExampleAudit data={MANUSCRIPT.page314} facts={facts314} />
        <CrossExampleComparison f316={facts316} f314={facts314} />
      </div>
    </PageLayout>
  );
}
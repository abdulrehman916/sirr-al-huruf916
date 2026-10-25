// ═══════════════════════════════════════════════════════════════
// The crossed square — Hâvâss I pp. 320-324, "ÇAPRAZ VEFKLER".
//
// Two vefks lie one inside the other, one odd and one even. Nothing
// about the squares themselves changes: as the book puts it, the
// houses have simply turned through 45 degrees, so each house is a
// diamond and the two sets interleave like a chequerboard.
//
// An n×n outer and an (n−1)×(n−1) inner tile together when their
// centres sit on the same lattice, the inner offset by half a step in
// both directions. Each diamond's diagonal is one step, so a diamond
// of one square fills the gap left by four of the other.
// ═══════════════════════════════════════════════════════════════

const PAD = 14;

function Diamond({ cx, cy, u, value, dim }) {
  const h = u / 2;
  return (
    <g>
      <polygon
        points={`${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}`}
        fill="none" stroke="currentColor" strokeWidth={1.6}
        opacity={dim ? 0.35 : 1} />
      <text x={cx} y={cy} dy="0.34em" textAnchor="middle"
            opacity={dim ? 0.45 : 1}
            style={{ fontSize: `${Math.min(u * 0.3, 20)}px` }}>
        {value}
      </text>
    </g>
  );
}

/**
 * `outer` and `inner` are each { grid, n }. `show` picks what is drawn:
 * "both" (the finished vefk), "outer" or "inner" — the book shows each
 * alone first, because the two are read as two separate squares.
 */
export default function WafqCapraz({ outer, inner, show = "both", u = 86, className = "" }) {
  if (!outer?.grid || !inner?.grid) return null;
  const n = outer.grid.length;
  const w = (n - 1) * u + u + PAD * 2;

  const cells = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      cells.push(
        <Diamond key={`o${r}-${c}`} u={u}
                 cx={PAD + u / 2 + c * u} cy={PAD + u / 2 + r * u}
                 value={outer.grid[r][c]} dim={show === "inner"} />
      );

  const m = inner.grid.length;
  for (let r = 0; r < m; r++)
    for (let c = 0; c < m; c++)
      cells.push(
        <Diamond key={`i${r}-${c}`} u={u}
                 cx={PAD + u + c * u} cy={PAD + u + r * u}
                 value={inner.grid[r][c]} dim={show === "outer"} />
      );

  return (
    <svg viewBox={`0 0 ${w} ${w}`} className={className}
         xmlns="http://www.w3.org/2000/svg" role="img" aria-label="çapraz vefk">
      <style>{`
        .cz text { font-family: "Noto Naskh Arabic","Amiri",serif;
                   fill: currentColor; direction: ltr; }
      `}</style>
      <g className="cz">{cells}</g>
    </svg>
  );
}

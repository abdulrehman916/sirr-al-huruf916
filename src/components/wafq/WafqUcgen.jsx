// ═══════════════════════════════════════════════════════════════
// The triangular square — Hâvâss I pp. 325-327, "ÜÇGEN VEFKLER".
//
// A triangle of order k is cut into k rows of small triangles, each
// row one more than the last, pointing up and down in turn. The
// numbers are written into those cells.
//
// The book is openly unsure of this arrangement — see wafqUcgenData.js,
// where its own words are kept — and only the three sides come out at
// the total, not every row and column. So this draws the figures the
// book prints and nothing more: no arrangement is generated here,
// because the book states no rule for one.
// ═══════════════════════════════════════════════════════════════

const PAD = 16;

/**
 * `rows` is an array of rows, apex first. Each row is the cells in the
 * order they are read across it, a null standing for a house left
 * empty. `apex` is "up" or "down".
 */
export default function WafqUcgen({ rows, apex = "up", s = 72, className = "" }) {
  if (!rows?.length) return null;
  const k = rows.length;
  const h = (s * Math.sqrt(3)) / 2;
  const W = k * s + PAD * 2;
  const H = k * h + PAD * 2;

  const cells = [];
  rows.forEach((row, r) => {
    const y = PAD + r * h;
    // Where this row begins, and how its cells alternate, is the one
    // thing that differs between a triangle standing on its base and
    // one standing on its point.
    const x0 = apex === "up"
      ? PAD + ((k - 1 - r) * s) / 2
      : PAD + (r * s) / 2;

    row.forEach((v, i) => {
      let pts, cx, cy;
      if (apex === "up") {
        if (i % 2 === 0) {                     // pointing up
          const j = i / 2;
          const x = x0 + j * s;
          pts = `${x},${y + h} ${x + s},${y + h} ${x + s / 2},${y}`;
          cx = x + s / 2; cy = y + (2 * h) / 3;
        } else {                               // pointing down
          const j = (i - 1) / 2;
          const x = x0 + j * s + s / 2;
          pts = `${x},${y} ${x + s},${y} ${x + s / 2},${y + h}`;
          cx = x + s / 2; cy = y + h / 3;
        }
      } else {
        if (i % 2 === 0) {                     // pointing down
          const j = i / 2;
          const x = x0 + j * s;
          pts = `${x},${y} ${x + s},${y} ${x + s / 2},${y + h}`;
          cx = x + s / 2; cy = y + h / 3;
        } else {                               // pointing up
          const j = (i - 1) / 2;
          const x = x0 + j * s + s / 2;
          pts = `${x},${y + h} ${x + s},${y + h} ${x + s / 2},${y}`;
          cx = x + s / 2; cy = y + (2 * h) / 3;
        }
      }
      cells.push(
        <g key={`${r}-${i}`}>
          <polygon points={pts} fill="none" stroke="currentColor" strokeWidth={1.6} />
          {v != null && (
            <text x={cx} y={cy} dy="0.34em" textAnchor="middle"
                  style={{ fontSize: `${Math.min(s * 0.3, 19)}px` }}>{v}</text>
          )}
        </g>
      );
    });
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className}
         xmlns="http://www.w3.org/2000/svg" role="img" aria-label="üçgen vefk">
      <style>{`.ug text { font-family: "Noto Naskh Arabic","Amiri",serif;
                          fill: currentColor; direction: ltr; }`}</style>
      <g className="ug">{cells}</g>
    </svg>
  );
}

import { useLayoutEffect, useRef } from "react";
import {
  SEALS, BASMALA_NUMBER,
} from "../../lib/sevenSeals";
import {
  BASMALA_FOUR, BASMALA_SIDE, CORNER_VERSE, VERSE_CORNER, CORNER_FLIP,
  CORNER_GEOM, OVERHANG, ARCHANGELS, ANGEL_SUFFIX, PLANET_HADIM, DAY_PLANET,
  splitFour, splitIndexFor,
} from "../../lib/wafqSurround";
import { kashidaSlots, fitAt, fitFirst } from "../../lib/kashida";

// ═══════════════════════════════════════════════════════════════
// The finished sheet: the square with everything written around it.
//
//   ٧٨٦
//   the seven seals
//   the angel's name on each side, with the day's angel and its jinn
//   the besmele (or any four-part verse) forming the four sides
//   the corner verse lying across each corner
//
// Every Arabic word is one joined piece. A cluster of letters stands
// outside one corner, one letter is drawn out to make the side, and
// the rest ends past the far corner. Nothing is written inside the
// square. See lib/kashida.js for the stretching itself.
// ═══════════════════════════════════════════════════════════════

const VB = 1000;
const C = VB / 2;

export default function WafqSheet({
  grid,                       // number[][]
  size = 430,                 // the square's side, in viewBox units
  angel = "jibril",           // which archangel this working belongs to
  fourAngels = true,          // all four, in the ج ا م ع order, or just one
  weekday = 0,                // the day the work is written: 0 Sunday … 6 Saturday
                              // its ruling planet gives the angel and the jinn,
                              // never the hour's — the day is what holds authority
  besmele = true,
  verse = CORNER_VERSE,
  showSeals = true,
  title = "",
  className = "",
}) {
  const ref = useRef(null);
  const n = grid?.length || 3;
  const a = C - size / 2;
  const b = C + size / 2;
  const span = size * (1 + OVERHANG);

  const dy = PLANET_HADIM[DAY_PLANET[((weekday % 7) + 7) % 7]];
  const sideOf = { top: 0, right: 90, bottom: 180, left: 270 };
  const pick = ARCHANGELS.find((x) => x.id === angel) || ARCHANGELS[0];

  const verseParts = splitFour(verse);

  // ── stretch every word once the glyphs have been laid out ──
  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const measure = (el) => (t) => {
      el.textContent = t;
      return el.getComputedTextLength();
    };
    svg.querySelectorAll("[data-word]").forEach((el) => {
      const word = el.dataset.word;
      const target = Number(el.dataset.target);
      const how = el.dataset.how;
      const m = measure(el);
      if (how === "first") {
        el.textContent = fitFirst(word, target, m);
      } else {
        const slots = kashidaSlots(word);
        if (!slots.length) { el.textContent = word; return; }
        el.textContent = fitAt(word, splitIndexFor(word, slots), target, m);
      }
    });
  });

  // ── the seven seals, right to left ──
  let seals = null;
  if (showSeals) {
    const H = 50, gap = 13;
    const rtl = [...SEALS].reverse();
    const ws = rtl.map((s) => (H * s.w) / s.h);
    const total = ws.reduce((x, y) => x + y, 0) + gap * 6;
    let at = C - total / 2;
    seals = rtl.map((s, i) => {
      const g = (
        <g key={s.n}
           transform={`translate(${at.toFixed(1)} 0) scale(${(H / 100).toFixed(4)}) translate(${-(100 - s.w) / 2} 0)`}>
          <path d={s.d} fillRule="evenodd" />
        </g>
      );
      at += ws[i] + gap;
      return g;
    });
  }

  // ── the four sides ──
  const sides = [0, 90, 180, 270].map((deg) => {
    const an = fourAngels
      ? ARCHANGELS.find((x) => sideOf[x.side] === deg)
      : pick;
    return (
      <g key={deg} transform={`rotate(${deg} ${C} ${C})`}>
        {/* the chosen angel leads — then the day's angel, then its jinn,
            each one a step nearer the square */}
        <text x={C} y={a - 94} className="wf-angel">{an.ar} {ANGEL_SUFFIX}</text>
        <text x={C} y={a - 62} className="wf-day">{dy.ulvi}</text>
        <text x={C} y={a - 34} className="wf-jinn">{dy.sufli}</text>
      </g>
    );
  });

  // ── the besmele (or the four-part verse) making the four sides ──
  const around = besmele
    ? BASMALA_FOUR.map((w, i) => (
        <g key={w} transform={`rotate(${BASMALA_SIDE[i]} ${C} ${C})`}>
          <text x={C} y={a + 1} className="wf-bes"
                data-word={w} data-target={span} data-how="split">{w}</text>
        </g>
      ))
    : null;

  // ── the verse lying across each corner ──
  const corners = verseParts
    ? VERSE_CORNER.map((k, i) => {
        const g = CORNER_GEOM[k];
        const cx = g.sx > 0 ? b : a;
        const cy = g.sy > 0 ? b : a;
        const rot = -g.rot + CORNER_FLIP[k];
        return (
          <text key={k} x={cx} y={cy} className="wf-verse" dy="9"
                transform={`rotate(${rot} ${cx} ${cy})`} textAnchor="middle"
                data-word={verseParts[i]} data-target={size * 0.46} data-how="first">
            {verseParts[i]}
          </text>
        );
      })
    : null;

  // ── the square and its numbers ──
  const cell = size / n;
  const lines = [];
  for (let r = 1; r < n; r++)
    lines.push(<line key={`h${r}`} x1={a} y1={a + r * cell} x2={b} y2={a + r * cell} />);
  for (let c = 1; c < n; c++)
    lines.push(<line key={`v${c}`} x1={a + c * cell} y1={a} x2={a + c * cell} y2={b} />);

  const nums = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      nums.push(
        <text key={`${r}-${c}`} className="wf-cell"
              x={a + c * cell + cell / 2}
              y={a + r * cell + cell / 2 + cell * 0.13}
              style={{ fontSize: `${Math.min(46, cell * 0.42)}px` }}>
          {grid[r][c]}
        </text>
      );

  return (
    <svg ref={ref} className={className} viewBox={`0 0 ${VB} ${VB}`}
         xmlns="http://www.w3.org/2000/svg" role="img"
         aria-label={title || "wafq"}>
      <style>{`
        .wf text { font-family: "Noto Naskh Arabic","Amiri",serif;
                   text-anchor: middle; fill: currentColor; direction: rtl; }
        .wf-angel { font-size: 34px; font-weight: 700; }
        .wf-day   { font-size: 23px; }
        .wf-jinn  { font-size: 23px; opacity: .7; }
        .wf-bes   { font-size: 46px; }
        .wf-verse { font-size: 30px; }
        .wf-cell  { font-family: inherit; direction: ltr; }
        .wf-num   { font-size: 50px; font-family: inherit; }
        .wf line, .wf rect.sq { stroke: currentColor; fill: none; }
      `}</style>
      <g className="wf">
        <text x={C} y={48} className="wf-num">
          {String(BASMALA_NUMBER).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d])}
        </text>
        {seals && <g transform="translate(0 62)" fill="currentColor">{seals}</g>}
        {around}
        {corners}
        {sides}
        <rect className="sq" x={a} y={a} width={size} height={size} strokeWidth="3" />
        <g strokeWidth="2">{lines}</g>
        {nums}
      </g>
    </svg>
  );
}

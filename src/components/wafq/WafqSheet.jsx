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
  size: baseSize = 430,       // the square's side, in viewBox units
  angel = "jibril",           // which archangel this working belongs to
  fourAngels = true,          // all four, in the ج ا م ع order, or just one
  angels = true,              // false leaves the four sides bare — the book's
                              // first way, "çevresi tamamen boş" (p. 189)
  weekday = 0,                // the day the work is written: 0 Sunday … 6 Saturday
                              // its ruling planet gives the angel and the jinn,
                              // never the hour's — the day is what holds authority
  besmele = true,
  lineText = "",              // an ayah used as the four outer lines in the
                              // besmele's place (p. 192); ignored when besmele
  verse = CORNER_VERSE,
  showSeals = true,
  ringAround = "",          // the reader's own text, carried round the outside
  title = "",
  className = "",
}) {
  const ref = useRef(null);
  const n = grid?.length || 3;
  // Long numbers widen the square rather than shrink to nothing: each
  // house is made wide enough for its longest figure at a readable size,
  // and the whole drawing is then brought back in to keep its frame.
  const longest = Math.max(1, ...(grid || []).flat().filter((v) => v != null).map((v) => String(v).length));
  const size = Math.max(baseSize, Math.min(680, n * longest * 14));
  const grow = (baseSize + 260) / (size + 260);
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
      el.style.fontSize = "";
      if (how === "first") {
        el.textContent = fitFirst(word, target, m);
      } else {
        const slots = kashidaSlots(word);
        el.textContent = slots.length ? fitAt(word, splitIndexFor(word, slots), target, m) : word;
      }
      // A long piece — part of a long ayah or surah — is longer than its
      // side or corner even before any stretching. It is made smaller,
      // never cut, until it fits the room it was given.
      let fs = parseFloat(getComputedStyle(el).fontSize) || 30;
      for (let i = 0; i < 60 && el.getComputedTextLength() > target && fs > 6; i++) {
        fs -= 1;
        el.style.fontSize = `${fs}px`;
      }
    });

    // Every number sits inside its own house, in Arabic figures, however
    // long it is: the figure is made smaller until it fits the house.
    svg.querySelectorAll("[data-cellw]").forEach((el) => {
      const room = Number(el.dataset.cellw);
      let fs = parseFloat(el.style.fontSize) || 30;
      for (let i = 0; i < 80 && el.getComputedTextLength() > room && fs > 5; i++) {
        fs -= 1;
        el.style.fontSize = `${fs}px`;
      }
    });

    // The ring is sized rather than spaced. Stretching a textPath with
    // textLength opens gaps between the glyphs, which breaks the joins
    // and leaves the letters standing apart; shrinking the type keeps
    // every word in one piece, which is the thing that matters.
    // Every ring is shrunk until it fits, and then all of them are set
    // to the smallest size any one needed, so a long tawkeel running
    // round two or three rings reads in one hand throughout.
    const ringEls = [...svg.querySelectorAll("[data-ring]")];
    if (ringEls.length) {
      let low = 34;
      ringEls.forEach((el) => {
        const room = Number(el.dataset.ring);
        let fs = 34;
        el.style.fontSize = `${fs}px`;
        for (let i = 0; i < 60 && el.getComputedTextLength() > room && fs > 5; i++) {
          fs -= 1;
          el.style.fontSize = `${fs}px`;
        }
        low = Math.min(low, fs);
      });
      ringEls.forEach((el) => { el.style.fontSize = `${low}px`; });
    }
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
  const sides = !angels ? null : [0, 90, 180, 270].map((deg) => {
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

  // ── the besmele making the four sides, or, in its place, the ayah ──
  //
  // p.192: "an example using that same ayah as the vefk's edge line,
  // in the besmele's place" — so the four outer lines are either the
  // besmele split four ways or the ayah split the same way.
  const lineWords = lineText ? splitFour(lineText) : null;
  const sideWords = besmele ? BASMALA_FOUR : lineWords;
  const around = sideWords
    ? sideWords.map((w, i) => (
        <g key={`${i}-${w}`} transform={`rotate(${BASMALA_SIDE[i]} ${C} ${C})`}>
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

  // ── a text of the reader's own, carried right round the outside ──
  // It sits outside everything else: outside the angels' names, outside
  // the besmele making the sides. However long the ayah, the whole of
  // it goes round the ring once, the letters drawn to the circle so it
  // closes where it began.
  // The ring takes the outermost band of the sheet, and everything
  // already drawn — the number, the seals, the names, the square — is
  // drawn inward to leave it clear. Otherwise the ring runs straight
  // through the seals at the top.
  const ringText = (ringAround || "").trim();
  // A long text — a day's qasam with its tawkeel — goes round more than
  // once: up to four rings, outermost first, the words shared out by the
  // length of each circle. Everything inside is drawn smaller to leave
  // the rings clear.
  const RING_STEP = 38;
  const ringCount = ringText ? Math.min(4, Math.max(1, Math.ceil(ringText.length / 240))) : 0;
  const radii = Array.from({ length: ringCount }, (_, i) => 470 - i * RING_STEP);
  const ringLines = (() => {
    if (!ringCount) return [];
    if (ringCount === 1) return [ringText];
    const words = ringText.split(/\s+/);
    const totalLen = ringText.length;
    const sumR = radii.reduce((x, y) => x + y, 0);
    const out = [];
    let cur = [], curLen = 0, k = 0;
    for (const w of words) {
      const quota = (totalLen * radii[k]) / sumR;
      if (cur.length && curLen + w.length > quota && k < ringCount - 1) {
        out.push(cur.join(" ")); cur = []; curLen = 0; k += 1;
      }
      cur.push(w); curLen += w.length + 1;
    }
    out.push(cur.join(" "));
    return out;
  })();
  const innerScale = ringText ? 0.80 : 1;
  // the whole one-ring layout, drawn inward to sit inside the last ring
  const fit = ringCount > 1 ? radii[ringCount - 1] / 470 : 1;
  const ring = ringLines.length
    ? ringLines.map((line, i) => {
      const r = radii[i];
      return (
        <g key={i}>
          {/* The circle starts at the bottom, so the halfway point — where
              the text is centred — falls at the top. */}
          <path id={`wf-ring-${i}`} fill="none"
                d={`M ${C} ${C + r} A ${r} ${r} 0 1 1 ${C} ${C - r}`
                   + ` A ${r} ${r} 0 1 1 ${C} ${C + r}`} />
          <text className="wf-ring" data-ring={2 * Math.PI * r * 0.96}>
            <textPath href={`#wf-ring-${i}`} startOffset="50%" textAnchor="middle">
              {line}
            </textPath>
          </text>
        </g>
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
              data-cellw={cell * 0.86}
              style={{ fontSize: `${Math.min(46, cell * 0.42)}px` }}>
          {grid[r][c] == null ? "" : String(grid[r][c]).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d])}
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
        .wf-ring  { font-size: 30px; }
        .wf-cell  { font-family: inherit; direction: ltr; }
        .wf-num   { font-size: 50px; font-family: inherit; }
        .wf line, .wf rect.sq { stroke: currentColor; fill: none; }
      `}</style>
      <g className="wf">
        {ring}
        <g transform={`translate(${C} ${C}) scale(${fit}) translate(${-C} ${-C})`}>
        <g transform={`translate(0 ${ringText ? 86 : 0})`}>
          <text x={C} y={48} className="wf-num">
            {String(BASMALA_NUMBER).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d])}
          </text>
          {seals && <g transform="translate(0 62)" fill="currentColor">{seals}</g>}
        </g>
        <g transform={`translate(${C} ${C}) scale(${innerScale * grow}) translate(${-C} ${-C})`}>
          {around}
          {corners}
          {sides}
          <rect className="sq" x={a} y={a} width={size} height={size} strokeWidth="3" />
          <g strokeWidth="2">{lines}</g>
          {nums}
        </g>
        </g>
      </g>
    </svg>
  );
}

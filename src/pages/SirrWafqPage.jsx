// ═══════════════════════════════════════════════════════════════
// سر الوفق — build a wafq (magic square) from any Arabic text or name
// by the awfaq rules of Kashf al-Haqa'iq, with the right time taken
// from the Astro Clock (day first, then the hour, then the Qamar).
// Beneficial purposes only.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import {
  abjadOf, asOf, SIZES, SIZE_NAME, SQUARE_CLASS, buildWafq, hollowWafq3, workingSizes,
  elementOf, ELEMENTS, LETTER_TABLE, HOUSE_LETTERS, HOUSE_RECITE, DAY_ANGEL, PURPOSES,
  toArabicDigits, planWafq, NUMBER_RULE, SEVEN_RANKS, SEVEN_RANKS_NOTE, needAngelFor,
  RECITE_COUNT, DUA_BEFORE, DUA_BEFORE_WHEN, DUA_TANZIL, AROUND_WAFQ, INK, CAUTIONS,
} from "@/lib/sirrWafqEngine";
import * as K from "@/lib/kashfSaatData";
import { getUserLocation } from "@/lib/astroClockSunriseSunset";
import { getPlanetaryDay } from "@/lib/kashfSaatEngine";
import { moonSpan, nextPlanetHourIn, bestTimesFor, fmtSpan, fmtWhen } from "@/lib/kashfNextTimes";
import { METHODS, methodsFor, SOURCES, ANGLE_FOR_STEP, ANGLE_SEX, lettersOf } from "@/lib/wafqMethods";
import WafqSheet from "@/components/wafq/WafqSheet";
import WafqCapraz from "@/components/wafq/WafqCapraz";
import PurposePanel from "@/components/wafq/PurposePanel";
import HadimPanel from "@/components/wafq/HadimPanel";
import WafqTiming from "@/components/wafq/WafqTiming";
import { downloadSvgPng } from "@/lib/svgToPng";
import { ARCHANGELS } from "@/lib/wafqSurround";

const GOLD = "#F5D060";
const INK_C = "#f5ead4";
const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.22)" };
const WD_ML = ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"];
const WD_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Side each angel takes, as the book draws it (Hâvâss I, pp. 190 and
// 289): top, left, right, bottom — the order of ج ا م ع, the letters
// of Allah's attribute "Jami'", which is the reason the book gives.
const SIDE_ANGELS = [
  { pos: "top", ar: "جبرائيل", ml: "മുകളിൽ", en: "Top" },
  { pos: "right", ar: "ميكائيل", ml: "വലത്ത്", en: "Right" },
  { pos: "bottom", ar: "عزرائيل", ml: "താഴെ", en: "Bottom" },
  { pos: "left", ar: "اسرافيل", ml: "ഇടത്ത്", en: "Left" },
];

/** A line under a step's title saying, plainly, what to do here. */
const Intro = ({ children }) => (
  <p className="font-inter text-[11px] leading-relaxed"
     style={{ color: "rgba(245,234,212,0.72)" }}>{children}</p>
);

function Box({ step, title, children, tone, id }) {
  const border = tone === "ok" ? "rgba(74,222,128,0.35)" : tone === "warn" ? "rgba(248,113,113,0.45)" : "rgba(212,175,55,0.22)";
  return (
    <section id={id} className="rounded-2xl p-4 space-y-3" style={{ ...card, borderColor: border, scrollMarginTop: 72 }}>
      {title && (
        <h2 className="flex items-center gap-2 font-inter text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
          {step && <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px]" style={{ background: "rgba(212,175,55,0.18)" }}>{step}</span>}
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function Stat({ ar, label, value }) {
  return (
    <div className="rounded-xl px-2 py-2 text-center" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.18)" }}>
      <div className="font-amiri text-sm" style={{ color: "rgba(245,234,212,0.75)" }}>{ar}</div>
      <div className="font-inter text-base font-bold break-all" style={{ color: INK_C }}>{value}</div>
      {label && <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.40)" }}>{label}</div>}
    </div>
  );
}

const TAB_BTN = (active) => ({
  background: active ? "rgba(212,175,55,0.18)" : "transparent",
  color: active ? GOLD : "rgba(255,255,255,0.6)",
  border: `1px solid ${active ? "rgba(212,175,55,0.55)" : "rgba(212,175,55,0.22)"}`,
});
const Note = ({ children, color = "rgba(245,234,212,0.78)" }) => <p className="font-inter text-xs leading-relaxed" style={{ color }}>{children}</p>;
const Ar = ({ children, size = "text-base" }) => <span className={`font-amiri ${size}`} style={{ color: GOLD }}>{children}</span>;
const ArBlock = ({ children }) => (
  <p dir="rtl" className="font-amiri text-lg leading-loose rounded-xl p-3" style={{ color: INK_C, background: "rgba(0,0,0,0.22)", border: "1px solid rgba(212,175,55,0.18)" }}>{children}</p>
);
const pctColor = (v) => (v >= 65 ? "#4ADE80" : v >= 40 ? "#FBBF24" : "#F87171");

function Grid({ grid, arabic, active, done, cellNote }) {
  const n = grid.length;
  const fmt = (v) => (v == null ? "" : arabic ? toArabicDigits(v) : String(v));
  const longest = Math.max(1, ...grid.flat().filter((v) => v != null).map((v) => String(v).length));
  const fs = n <= 4 ? (longest > 6 ? 13 : 18) : n <= 6 ? (longest > 5 ? 11 : 14) : longest > 4 ? 9 : 11;
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-collapse" dir="ltr" style={{ fontSize: fs }}>
        <tbody>
          {grid.map((row, i) => (
            <tr key={i}>
              {row.map((v, j) => {
                const k = i * n + j;
                const isActive = active === k, isDone = done ? done.has(k) : true;
                return (
                  <td key={j} className={`text-center font-bold ${arabic ? "font-amiri" : "font-inter"}`}
                    style={{
                      border: "1px solid rgba(212,175,55,0.6)", padding: n <= 4 ? "10px 12px" : "6px 6px", minWidth: n <= 4 ? 54 : 34,
                      color: isActive ? "#0b0a12" : INK_C, background: isActive ? GOLD : v == null ? "rgba(255,255,255,0.02)" : "rgba(212,175,55,0.05)",
                      opacity: isDone || isActive ? 1 : 0.18, transition: "all .25s",
                    }}>
                    {fmt(v)}
                    {cellNote && cellNote[k] && <div className="font-amiri text-[11px]" style={{ color: isActive ? "#0b0a12" : "rgba(245,208,96,0.7)" }}>{cellNote[k]}</div>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SumsCheck({ result, txt }) {
  const { sums, N } = result;
  const item = (label, v) => (
    <span key={label} className="px-2 py-1 rounded-lg font-inter text-[10px] font-bold"
      style={{ background: v === N ? "rgba(74,222,128,0.10)" : "rgba(248,113,113,0.12)", color: v === N ? "#4ADE80" : "#FCA5A5" }}>
      {label} {v} {v === N ? "✓" : "✗"}
    </span>
  );
  return (
    <div className="flex flex-wrap gap-1.5">
      {sums.rows.map((v, i) => item(txt(`വരി ${i + 1}:`, `Row ${i + 1}:`), v))}
      {sums.cols.map((v, i) => item(txt(`നിര ${i + 1}:`, `Col ${i + 1}:`), v))}
      {item(txt("കോൺ ↘:", "Diag ↘:"), sums.d1)}
      {item(txt("കോൺ ↙:", "Diag ↙:"), sums.d2)}
    </div>
  );
}

// Manzil-based times for a purpose from the book's table of works.
function purposeTimes(purpose, nowMs, loc) {
  return purpose.mansions
    .map((m) => ({ m, span: moonSpan("mansion", m - 1, nowMs) }))
    .filter((x) => x.span?.start)
    .sort((a, b) => a.span.start - b.span.start)
    .slice(0, 3)
    .map(({ m, span }) => {
      const planets = K.MANSION_BEST_HOURS[m] || ["jupiter", "venus", "sun"];
      const hours = planets.map((pl) => {
        const h = nextPlanetHourIn(pl, span, loc, nowMs);
        if (!h) return null;
        const start = Math.max(h.start, span.start), end = span.end ? Math.min(h.end, span.end) : h.end;
        if (end <= start) return null;
        const pd = getPlanetaryDay(start + 60000, loc);
        return { ...h, start, end, current: nowMs >= start, planet: pl, wd: pd.pDay.wd, nahsDay: pd.day.isNahsDay };
      }).filter(Boolean).sort((a, b) => a.start - b.start);
      return { m, span, hours, best: !!K.MANSION_BEST_HOURS[m] };
    });
}

/** Draws the finished wafq, with what goes around it, onto a canvas. */
function drawWafq(cv, o) {
  const { grid, bismi, sideAngels, dayAngel, dayKhadim, ranks, title } = o;
  const n = grid.length;
  const cell = n <= 4 ? 110 : n <= 6 ? 84 : 64;
  const padX = sideAngels ? 170 : 70, lineH = 44;
  const top = (bismi ? 76 : 24) + 34 + (sideAngels ? 50 : 0);
  const below = (sideAngels ? 50 : 0) + (dayAngel ? 1 : 0) + (dayKhadim ? 1 : 0) + (ranks ? ranks.length : 0);
  const W = n * cell + padX * 2;
  const H = top + n * cell + 40 + (sideAngels ? 50 : 0) + ((dayAngel ? 1 : 0) + (dayKhadim ? 1 : 0) + (ranks ? ranks.length : 0)) * lineH + 40;
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d");
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#111111"; g.textAlign = "center"; g.textBaseline = "middle";
  const amiri = (px) => `${px}px Amiri, "Noto Naskh Arabic", serif`;
  let y = 44;
  if (bismi) { g.font = amiri(34); g.fillText("بسم الله الرحمن الرحيم", W / 2, y); y += 36; }
  if (title) { g.font = amiri(21); g.fillStyle = "#666"; g.fillText(title, W / 2, y); g.fillStyle = "#111"; }
  const x0 = padX, y0 = top;
  if (sideAngels) {
    g.font = amiri(28);
    g.fillText(SIDE_ANGELS[0].ar, x0 + (n * cell) / 2, y0 - 30);
    g.fillText(SIDE_ANGELS[2].ar, x0 + (n * cell) / 2, y0 + n * cell + 32);
    g.fillText(SIDE_ANGELS[1].ar, x0 + n * cell + padX / 2, y0 + (n * cell) / 2);
    g.fillText(SIDE_ANGELS[3].ar, x0 - padX / 2, y0 + (n * cell) / 2);
  }
  g.strokeStyle = "#111"; g.lineWidth = 2.5;
  const longest = Math.max(...grid.flat().filter((v) => v != null).map((v) => String(v).length));
  g.font = amiri(cell / (longest > 4 ? 3.4 : longest > 2 ? 2.6 : 2));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = x0 + j * cell, yy = y0 + i * cell;
      g.strokeRect(x, yy, cell, cell);
      const v = grid[i][j];
      if (v != null) g.fillText(toArabicDigits(v), x + cell / 2, yy + cell / 2);
    }
  }
  let ty = y0 + n * cell + (sideAngels ? 82 : 46);
  g.font = amiri(26); g.fillStyle = "#222";
  if (dayAngel) { g.fillText(dayAngel, W / 2, ty); ty += lineH; }
  if (dayKhadim) { g.fillText(dayKhadim, W / 2, ty); ty += lineH; }
  if (ranks && ranks.length) {
    g.strokeStyle = "#bbb"; g.lineWidth = 1;
    g.beginPath(); g.moveTo(W * 0.3, ty - 14); g.lineTo(W * 0.7, ty - 14); g.stroke();
    g.font = amiri(21); g.fillStyle = "#444";
    for (const r of ranks) { g.fillText(r, W / 2, ty + 8); ty += lineH; }
  }
}

/**
 * The crossed square. The book shows the two apart before it shows
 * them together, because they are read as two separate vefks, so the
 * same three views are offered here.
 */
function CaprazView({ cz, isEn, txt }) {
  const [show, setShow] = useState("both");
  const views = [
    ["both", txt("രണ്ടും ചേർന്ന്", "Both together")],
    ["inner", txt(`ഉള്ളിലേത് ${cz.inner.n}×${cz.inner.n}`, `Inner ${cz.inner.n}×${cz.inner.n}`)],
    ["outer", txt(`പുറത്തേത് ${cz.outer.n}×${cz.outer.n}`, `Outer ${cz.outer.n}×${cz.outer.n}`)],
  ];
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {views.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setShow(k)}
                  className="px-2.5 py-1 rounded-lg font-inter text-[10px] font-bold"
                  style={TAB_BTN(show === k)}>{l}</button>
        ))}
      </div>
      <div style={{ color: INK_C }}>
        <WafqCapraz outer={cz.outer} inner={cz.inner} show={show} className="w-full h-auto" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[[txt("ഉള്ളിലേത്", "Inner"), cz.inner], [txt("പുറത്തേത്", "Outer"), cz.outer]].map(([l, p]) => (
          <span key={l} className="px-2 py-1 rounded-lg font-inter text-[10px] font-bold"
                style={{ background: p.valid ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
                         color: p.valid ? "#4ADE80" : "#F87171" }}>
            {l} {p.n}×{p.n} · {p.total} {p.valid ? "✓" : "✗"}
          </span>
        ))}
      </div>
      <Note color="rgba(255,255,255,0.5)">
        {txt("ഉള്ളിലെ കള്ളിയാണ് ആദ്യം എഴുതേണ്ടത്. രണ്ടും ഒരേ ഉദ്ദേശ്യത്തിനായിരിക്കണം; ഹാദിമുകളുടെ പണി രണ്ടിനും വെവ്വേറെ ചെയ്യണം.",
             "The inner square is written first. Both must be for the same purpose, and the work with the hâdims is done separately for each.")}
      </Note>
    </div>
  );
}

function MethodSection({ m, idx, N, n, step, isEn, txt, mText, setMText, mAyah, setMAyah, fallbackText, onDraw }) {
  const [open, setOpen] = useState(idx === 0);
  const useText = mText || fallbackText || "";
  const built = useMemo(() => {
    try {
      return m.build(N, { n, step, text: useText, nameTotal: N, ayahTotal: parseInt(mAyah || "0", 10) });
    } catch (_) { return null; }
  }, [m, N, n, step, useText, mAyah]);
  const src = SOURCES[m.src];
  const tone = !built ? undefined : built.valid === null ? undefined : built.valid ? "ok" : "warn";
  const rules = isEn ? m.rules_en : m.rules_ml;
  return (
    <Box tone={tone}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-start gap-2 text-left">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full font-inter text-[10px] shrink-0 mt-0.5" style={{ background: "rgba(212,175,55,0.18)", color: GOLD }}>{idx + 1}</span>
        <span className="flex-1 min-w-0">
          <span className="font-inter text-[12px] font-bold" style={{ color: GOLD }}>{isEn ? m.en : m.ml}</span>
          {m.ar && <span className="font-amiri text-sm ml-2" style={{ color: "rgba(245,208,96,0.7)" }}>{m.ar}</span>}
          <span className="block font-inter text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
            {isEn ? src.en : src.ml}{m.also ? ` + ${isEn ? SOURCES[m.also].en : SOURCES[m.also].ml}` : ""}
          </span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <>
          <Note color="rgba(255,255,255,0.4)">{isEn ? m.ref_en : m.ref_ml}</Note>
          <ol className="list-decimal pl-5 space-y-1 font-inter text-xs" style={{ color: "rgba(245,234,212,0.85)" }}>
            {rules.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
          {(m.needsText || m.needsTwo) && (
            <div className="flex flex-wrap items-center gap-2">
              {m.needsText && (
                <input value={mText} onChange={(e) => setMText(e.target.value)} dir="rtl" placeholder={fallbackText || "الاسم أو الآية"}
                  className="flex-1 min-w-[140px] rounded-xl px-3 py-2 font-amiri text-base outline-none"
                  style={{ background: "rgba(0,0,0,0.25)", color: INK_C, border: "1px solid rgba(212,175,55,0.25)" }} />
              )}
              {m.needsTwo && (
                <input value={mAyah} onChange={(e) => setMAyah(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric"
                  placeholder={txt("ആയത്തിന്റെ തുക", "ayah total")}
                  className="w-36 rounded-xl px-3 py-2 font-inter text-xs outline-none"
                  style={{ background: "rgba(0,0,0,0.25)", color: INK_C, border: "1px solid rgba(212,175,55,0.25)" }} />
              )}
            </div>
          )}
          <Note color="rgba(147,197,253,0.85)">⇒ {isEn ? m.expects_en : m.expects_ml}</Note>
          {!built ? (
            <Note color="#FCA5A5">{m.id === "hollow"
              ? txt(`ഈ തുകയ്ക്ക് ഇത് ചെയ്യാനാകില്ല: (${N} − 12) ÷ 3 = ${((N - 12) / 3).toFixed(2)} — ഇത് നാലിന്റെ ഗുണിതമായ പൂർണ്ണസംഖ്യയാകണം.`,
                     `Not possible for this total: (${N} − 12) ÷ 3 = ${((N - 12) / 3).toFixed(2)} — it must be a whole multiple of four.`)
              : m.needsTwo
              ? txt("ആയത്തിന്റെ തുക കൂടി മുകളിൽ നൽകുക.", "Enter the ayah's total above as well.")
              : txt("അറബിയിൽ ഒരു പേരോ ആയത്തോ മുകളിൽ നൽകുക.", "Enter an Arabic name or ayah above.")}</Note>
          ) : (
            <>
              {m.sizeFromText && (
                <Note color="rgba(255,255,255,0.55)">
                  {txt(`കള്ളിയുടെ വലുപ്പം അക്ഷരങ്ങളുടെ എണ്ണത്തിൽ നിന്നാണ് വരുന്നത് — ${built.grid.length} അക്ഷരം, അതുകൊണ്ട് ${built.grid.length}×${built.grid.length}. മുകളിൽ തിരഞ്ഞെടുത്ത വലുപ്പം ഇതിന് ബാധകമല്ല.`,
                       `The size comes from the letter count — ${built.grid.length} letters, so ${built.grid.length}×${built.grid.length}. The size chosen above does not apply to this one.`)}
                </Note>
              )}
              {built.capraz ? (
                <CaprazView cz={built.capraz} isEn={isEn} txt={txt} />
              ) : (
                <Grid grid={built.grid} arabic={!m.letters}
                      cellNote={built.letters ? built.letters.flat() : null} />
              )}
              {built.linesOk && built.diagsOk === false && (
                <div className="rounded-xl p-2.5" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)" }}>
                  <p className="font-inter text-[11px]" style={{ color: "#FBBF24" }}>
                    {txt("എല്ലാ വരിയും നിരയും തുകയിൽ ഒത്തുവന്നു; ഒരു കോൺ ഒരു പടി കുറവാണ്. ഇത് ആപ്പിന്റെ പിഴവല്ല — ജബ്ർ വേണ്ടിവരുമ്പോൾ കിതാബിന്റെ രീതി തന്നെ ഇങ്ങനെയാണ് വരുന്നത്. (മുഅല്ലസിന്റെ കള്ളി ഗണിതപരമായി ഒന്നേയുള്ളൂ, അതുകൊണ്ട് ജബ്റിൽ രണ്ട് കോണും ഒത്തുവരിക സാധ്യമല്ല.) തുക ബാക്കി വരാതെ ഹരിക്കുന്ന ഒരു വാചകം തിരഞ്ഞെടുക്കുകയോ, നടുവ് ഒഴിഞ്ഞ മുഅല്ലസ് നോക്കുകയോ ചെയ്യാം.",
                         "Every row and column met the total; one diagonal falls a step short. This is not a slip in the app — it is what the book's own method gives when jabr is needed. (There is only one 3×3 square, so with jabr both diagonals cannot come out.) Either choose a text whose total divides without a remainder, or use the hollow-centre 3×3.")}
                  </p>
                  <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {txt("കശ്ഫ് പേ. 295 — ജബ്ർ വീടിന്റെ നിയമം: (വശത്തിന്റെ വീടുകൾ − ബാക്കി) × വശത്തിന്റെ വീടുകൾ + 1",
                         "Kashf p. 295 — the rule for the jabr house: (houses of the side − remainder) × houses of the side + 1")}
                  </p>
                </div>
              )}

              {built.withLetters && (
                <div className="rounded-xl p-2.5" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)" }}>
                  <p className="font-inter text-[11px]" style={{ color: "#FBBF24" }}>
                    ⚠ {txt(`അക്ഷരങ്ങൾ കൂടി എഴുതിയതുകൊണ്ട് ശരിയായ തുക ${built.expected} ആണ് — സംഖ്യകൾ ${built.numberTotal} + അക്ഷരങ്ങൾ ${built.letterTotal}. ചൊല്ലേണ്ടതും ഈ സംഖ്യ വെച്ചാണ്.`,
                         `Because the letters are written in too, the true total is ${built.expected} — the numbers ${built.numberTotal} plus the letters ${built.letterTotal}. The recitation goes by this number.`)}
                  </p>
                </div>
              )}

              {!built.capraz && built.expected != null && (
                <div className="flex flex-wrap gap-1.5">
                  {[...built.sums.rows.map((v, i) => [txt(`വരി ${i + 1}`, `Row ${i + 1}`), v]),
                    ...built.sums.cols.map((v, i) => [txt(`നിര ${i + 1}`, `Col ${i + 1}`), v]),
                    [txt("കോൺ ↘", "Diag ↘"), built.sums.d1], [txt("കോൺ ↙", "Diag ↙"), built.sums.d2]].map(([l, v]) => (
                    <span key={l} className="px-2 py-1 rounded-lg font-inter text-[10px] font-bold"
                      style={{ background: v === built.expected ? "rgba(74,222,128,0.10)" : "rgba(248,113,113,0.12)", color: v === built.expected ? "#4ADE80" : "#FCA5A5" }}>
                      {l} {v} {v === built.expected ? "✓" : "✗"}
                    </span>
                  ))}
                </div>
              )}
              {built.valid === true && <Note color="#4ADE80">{txt("ഗ്രന്ഥം പറയുന്നതുപോലെ തന്നെ ഒത്തുവന്നു.", "It comes out exactly as the book says.")}</Note>}
              {built.valid === false && <Note color="#FCA5A5">{txt("പൂർണ്ണമായി ഒത്തുവരുന്നില്ല — ഗ്രന്ഥകാരൻ തന്നെ ഇത് പറയുന്നുണ്ട്.", "It does not fully come out — the author says so himself.")}</Note>}
              <button type="button" onClick={() => onDraw(built.grid)} className="px-3 py-1.5 rounded-lg font-inter text-[10px] font-bold"
                style={{ background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(212,175,55,0.22)" }}>
                ⬇ {txt("ഈ കള്ളി ചിത്രമായി", "This square as an image")}
              </button>
            </>
          )}
        </>
      )}
    </Box>
  );
}

export default function SirrWafqPage() {
  const [lang, setLang] = useState("ml");
  const txt = (ml, en) => (lang === "en" ? en : ml);
  const isEn = lang === "en";
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [names, setNames] = useState({ self: "", mother: "", house: "" });
  const [useName, setUseName] = useState({ self: true, mother: true, house: false });
  const [ta, setTa] = useState(5);
  const [manual, setManual] = useState("");
  const [n, setN] = useState(3);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState("auto");
  const [tab, setTab] = useState("act");
  const [actId, setActId] = useState(null);
  const [purposeId, setPurposeId] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [bismi, setBismi] = useState(true);
  const [sideAngels, setSideAngels] = useState(false);
  const [angel, setAngel] = useState("jibril");
  const [ringAround, setRingAround] = useState("");
  const [seeker, setSeeker] = useState("");
  const [need, setNeed] = useState("");
  const [mText, setMText] = useState("");
  const [mAyah, setMAyah] = useState("");
  const [openM, setOpenM] = useState(null);
  const [sought, setSought] = useState("");
  const [result, setResult] = useState(null);
  const [writeIdx, setWriteIdx] = useState(-1);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);
  const sheetRef = useRef(null);
  const loc = getUserLocation();

  const textAbjad = useMemo(() => abjadOf(text, { taMarbuta: ta }), [text, ta]);
  const nameAbjad = useMemo(() => ({
    self: abjadOf(names.self, { taMarbuta: ta }), mother: abjadOf(names.mother, { taMarbuta: ta }), house: abjadOf(names.house, { taMarbuta: ta }),
  }), [names, ta]);
  const nameTotal = ["self", "mother", "house"].reduce((s, k) => s + (useName[k] ? nameAbjad[k].total : 0), 0);
  const manualN = /^\d+$/.test(manual.trim()) ? parseInt(manual.trim(), 10) : null;
  const N = manualN ?? (mode === "text" ? textAbjad.total : nameTotal);
  const el = N > 0 ? ELEMENTS[elementOf(N)] : null;
  const good = useMemo(() => (N > 0 ? workingSizes(N, step) : []), [N, step]);
  const plan = N > 0 ? planWafq(N, n, step) : null;

  const act = K.ACTIVITIES.find((a) => a.id === actId) || null;
  const purpose = PURPOSES.find((p) => p.id === purposeId) || null;
  const actTimes = useMemo(() => (actId ? bestTimesFor(actId, Date.now(), loc) : null), [actId]);
  const manzilTimes = useMemo(() => (purpose ? purposeTimes(purpose, Date.now(), loc) : []), [purposeId]);

  // Only what changes the numbers in the square sends the reader back to
  // build it again. The besmele and the four angels are written around
  // the square, not in it, so turning them on must not throw away a
  // square that is already made.
  useEffect(() => { setResult(null); setWriteIdx(-1); }, [N, n, step, form]);

  function generate() {
    if (!(N > 0)) return;
    const f = form === "auto" ? elementOf(N) : form;
    const r = buildWafq(N, n, { step, form: n <= 4 ? f : "base" });
    setResult({ ...r, hollow: n === 3 && step === 1 ? hollowWafq3(N) : null, element: elementOf(N) });
    setWriteIdx(-1); setCopied(false);
    setTimeout(() => document.getElementById("wafq-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }

  const order = useMemo(() => {
    if (!result) return [];
    return result.houses.flat().map((h, k) => [h, k]).sort((a, b) => a[0] - b[0]).map(([, k]) => k);
  }, [result]);
  const doneSet = useMemo(() => new Set(writeIdx < 0 ? [] : order.slice(0, writeIdx + 1)), [order, writeIdx]);

  const dayWd = chosen ? chosen.wd : getPlanetaryDay(Date.now(), loc).pDay.wd;
  const dayRow = LETTER_TABLE.find((r) => r.day_en === WD_EN[dayWd]) || null;
  const needAngel = needAngelFor(purposeId) || (actId ? needAngelFor(actId === "needs" || actId === "trade" ? "needs" : "love") : null);
  const seekerName = seeker || names.self || "";
  const rankValues = result ? [
    "الله", "محمد صلى الله عليه وسلم",
    needAngel ? needAngel.angel : (el ? el.angel : ""),
    seekerName || "—", need || "—",
    sought || (purpose ? purpose.ar : "—"),
    toArabicDigits(result.n),
  ] : [];
  const isLoveWork = purposeId === "love" || purposeId === "accept" || actId === "marriage";

  function copyText() {
    if (!result) return;
    const head = `سر الوفق — N=${result.N}, ${result.n}×${result.n}, مفتاح=${result.key}${result.rem ? `, جبر=${result.jabrHouse}` : ""}`;
    navigator.clipboard?.writeText(head + "\n" + result.grid.map((r) => r.join("\t")).join("\n")).then(() => setCopied(true)).catch(() => {});
  }
  function drawOpts() {
    return {
      grid: result.grid, bismi, sideAngels,
      dayAngel: dayRow && dayRow.angel !== "—" ? dayRow.angel : null,
      dayKhadim: dayRow && dayRow.khadim !== "—" ? dayRow.khadim : null,
      ranks: rankValues.filter((v) => v && v !== "—"),
      title: `${SIZE_NAME[result.n].ar} — ${toArabicDigits(result.N)}`,
    };
  }
  function downloadPng() {
    const cv = canvasRef.current; if (!cv || !result) return;
    drawWafq(cv, drawOpts());
    const a = document.createElement("a");
    a.download = `wafq-${result.n}x${result.n}-${result.N}.png`;
    a.href = cv.toDataURL("image/png"); a.click();
  }
  function printPdf() {
    const cv = canvasRef.current; if (!cv || !result) return;
    drawWafq(cv, drawOpts());
    const url = cv.toDataURL("image/png");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><title>wafq-${result.n}x${result.n}-${result.N}</title>
      <style>@page{margin:14mm}body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh}img{max-width:100%;max-height:100%}</style>
      <img src="${url}" onload="window.focus();window.print()">`);
    w.document.close();
  }

  const btn = (active) => ({
    background: active ? "rgba(212,175,55,0.18)" : "transparent",
    color: active ? GOLD : "rgba(255,255,255,0.6)",
    border: `1px solid ${active ? "rgba(212,175,55,0.55)" : "rgba(212,175,55,0.22)"}`,
  });
  const input = { background: "rgba(0,0,0,0.25)", color: INK_C, border: "1px solid rgba(212,175,55,0.25)" };

  const TimeRow = ({ h, star }) => {
    const on = chosen && chosen.start === h.start;
    return (
      <button type="button" onClick={() => setChosen(on ? null : h)} className="w-full text-left px-2.5 py-2 rounded-xl space-y-1" style={btn(on)}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-inter text-[11px] font-bold">{star ? "★ " : ""}{fmtSpan(h, loc, isEn)}</span>
          {h.total != null && <span className="font-inter text-xs font-bold" style={{ color: pctColor(h.total) }}>{h.total}%</span>}
        </div>
        <div className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
          {isEn ? WD_EN[h.wd] : WD_ML[h.wd]} · {isEn ? K.PLANETS[h.planet].tr_en : K.PLANETS[h.planet].tr_ml} <span className="font-amiri">{K.PLANETS[h.planet].ar}</span>
          {h.parts && <> · {txt("ദിവസം", "day")} <b style={{ color: pctColor(h.parts.day) }}>{h.parts.day}%</b> · {txt("സാഅത്ത്", "hour")} <b style={{ color: pctColor(h.parts.hour) }}>{h.parts.hour}%</b> · {txt("ഖമർ", "moon")} <b style={{ color: pctColor(h.parts.moon) }}>{h.parts.moon}%</b></>}
          {h.nahsDay && <span style={{ color: "#FCA5A5" }}> · ⚠ {txt("നഹ്സ് ദിവസം", "nahs day")}</span>}
        </div>
        {h.why?.length > 0 && <div className="font-inter text-[10px]" style={{ color: "rgba(74,222,128,0.75)" }}>{h.why.slice(0, 2).map((w) => (isEn ? w.en : w.ml)).join(" · ")}</div>}
      </button>
    );
  };

  return (
    <PageLayout>
      <div className="space-y-3 pb-10 max-w-3xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
          <PageTitle arabic="سر الوفق" latin={isEn ? "Sirr al-Wafq" : undefined}
            subtitle={txt("കശ്ഫുൽ ഹഖാഇഖിന്റെ നിയമപ്രകാരം വഫ്ഖ് നിർമ്മാണം", "Building a wafq by the rules of Kashf al-Haqa'iq")} icon="۞" />
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(212,175,55,0.30)" }}>
            {[["ml", "മലയാളം"], ["en", "English"]].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setLang(k)} className="px-3 py-2 font-inter text-[10px] font-bold uppercase tracking-wider"
                style={{ background: lang === k ? "rgba(212,175,55,0.15)" : "transparent", color: lang === k ? GOLD : "rgba(255,255,255,0.40)" }}>{l}</button>
            ))}
          </div>
        </div>

        <Box>
          <p className="font-amiri text-2xl text-center" style={{ color: GOLD }}>بسم الله الرحمن الرحيم</p>
          <Note>{txt(
            "ഓരോ വരിയുടെയും നിരയുടെയും രണ്ടു കോണുകളുടെയും തുക ഒന്നാകുന്ന വിധത്തിൽ സംഖ്യകൾ ക്രമീകരിച്ച സമചതുര കള്ളിയാണ് വഫ്ഖ് (وفق). ഒരു ആയത്തിന്റെയോ സൂറത്തിന്റെയോ പേരിന്റെയോ അബ്ജദ് തുകയിൽ നിന്നാണ് അത് നിറയ്ക്കുന്നത്.",
            "A wafq (وفق) is a square of houses filled so that every row, every column and both diagonals give the same total. It is filled from the abjad total of an ayah, a surah or a name.")}</Note>
          <Note>{txt(
            "ഈ പേജ് കശ്ഫുൽ ഹഖാഇഖിലെ നിയമങ്ങൾ അതേപടി പാലിക്കുന്നു: أس കുറച്ച് മിഫ്താഹ്, ബാക്കി വന്നാൽ ജബ്ർ, മൂലകമനുസരിച്ചുള്ള രൂപം, ചെറിയ സംഖ്യ മുതൽ എഴുതുന്ന ക്രമം, നിബന്ധന 34-ലെ ഏഴ് പടികൾ, ചൊല്ലേണ്ട ദുആകളും എണ്ണവും. സമയം ആസ്ട്രോ ക്ലോക്കിൽ നിന്ന്: ആദ്യം ദിവസം, പിന്നെ സാഅത്ത്, പിന്നെ ഖമർ.",
            "This page follows the rules of Kashf al-Haqa'iq as written: subtract the أس for the key, apply jabr on a remainder, the element's form, writing from the smallest number up, the seven ranks of condition 34, and the du'as with their counts. The time comes from the Astro Clock: the day first, then the hour, then the Qamar.")}</Note>
          <Note color="rgba(255,255,255,0.5)">{txt(
            "(1) വാചകമോ പേരോ → (2) കള്ളി → (3) ഉദ്ദേശ്യവും സമയവും → (4) ഉണ്ടാക്കുക → (5) ക്രമത്തിൽ എഴുതുക → (6) ഡൗൺലോഡ്.",
            "(1) text or name → (2) square → (3) purpose and time → (4) build → (5) write in order → (6) download.")}</Note>
          <div className="rounded-xl p-3.5 space-y-2"
               style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.3)" }}>
            <p className="font-inter text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: "#4ADE80" }}>
              {txt("ഒരു വാക്ക്", "A word first")}
            </p>
            <p className="font-inter text-[12px] leading-relaxed" style={{ color: "rgba(245,234,212,0.9)" }}>
              {txt("ഈ കർമ്മങ്ങൾ ആരെയും ഉപദ്രവിക്കാൻ ഉപയോഗിക്കരുത്. ഉപദ്രവത്തിന് ഉപയോഗിച്ചാൽ ആദ്യം മലിനമാകുന്നത് സ്വന്തം നഫ്സാണ്; പിന്നെ ആ ജീവിതത്തിൽ ഒരു ഉയർച്ചയും ഉണ്ടാകില്ല.",
                   "Do not use these workings to harm anyone. Used for harm, the first thing defiled is your own nafs; and after that no rise comes in that life.")}
            </p>
            <p className="font-inter text-[12px] leading-relaxed" style={{ color: "rgba(245,234,212,0.9)" }}>
              {txt("ഈ സംരംഭം തുടങ്ങിയത് സത്യത്തിന് വേണ്ടി മാത്രമാണ്, സത്യത്തെ നിലനിർത്താൻ മാത്രം. നിങ്ങൾ സത്യം കണ്ടെത്തുക. അതിന്റെ പ്രതിഫലം നിങ്ങൾക്കും നിങ്ങളുടെ കുടുംബത്തിനും, ഇതിനായി അധ്വാനിച്ച എനിക്കും ലഭിക്കട്ടെ.",
                   "This work was begun for the truth alone, and to keep the truth standing. Find the truth. May its reward reach you, and your family, and the one who laboured over this.")}
            </p>
          </div>

          <div className="rounded-xl p-3" style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.25)" }}>
            <Intro>{txt(
              "ആദ്യമായി വരുന്നെങ്കിൽ ഇത്രമാത്രം: മനസ്സിൽ ഒരു ഉദ്ദേശ്യമുണ്ടെങ്കിൽ അത് അറബിയിൽ താഴെ എഴുതുക — ഒരു ആയത്ത്, സൂറത്ത്, ഇസ്മ്, അല്ലെങ്കിൽ ആളുടെ പേരും ഉമ്മയുടെ പേരും. അതിന്റെ അബ്ജദ് തുകയിൽ നിന്ന് കള്ളി താനേ ഉണ്ടാകും. ഉദ്ദേശ്യം നിശ്ചയിച്ചിട്ടില്ല, പക്ഷേ നേരത്തെ കൂട്ടിവെച്ച ഒരു സംഖ്യയുണ്ട് എന്നാണെങ്കിൽ ആ സംഖ്യ മാത്രം കൊടുത്താലും മതി — അതിന് ചേരുന്ന കള്ളികൾ കിട്ടും. ബാക്കി ഓരോ പടിയും എന്താണ് ചെയ്യേണ്ടതെന്ന് അതാത് തലക്കെട്ടിന് താഴെ പറയുന്നുണ്ട്.",
              "If this is your first time, this much is enough: if you have a purpose in mind, write it below in Arabic — an ayah, a surah, a name of God, or a person\'s name with the mother\'s. The square builds itself from its abjad total. If the purpose is not settled but you already have a total worked out, enter that number alone and you will get the squares that fit it. What to do at each step after that is written under its own heading.")}</Intro>
          </div>
        </Box>

        {/* 1 */}
        <Box step="1" title={txt("വാചകം അല്ലെങ്കിൽ പേര്", "Text or name")}>
          <Intro>{txt("മനസ്സിൽ ഒരു ഉദ്ദേശ്യമുണ്ടെങ്കിൽ അത് അറബിയിൽ ഇവിടെ എഴുതുക — ഒരു ആയത്തോ സൂറത്തോ ഇസ്മോ, അല്ലെങ്കിൽ ആളുടെ പേരും ഉമ്മയുടെ പേരും. അതിന്റെ അബ്ജദ് തുകയിൽ നിന്നാണ് കള്ളി ഉണ്ടാകുന്നത്. ഉദ്ദേശ്യം നിശ്ചയിച്ചിട്ടില്ലെങ്കിൽ, നേരത്തെ കൂട്ടിവെച്ച ഒരു സംഖ്യ ഉണ്ടെങ്കിൽ അത് നേരിട്ട് കൊടുത്താലും മതി — ആ സംഖ്യയ്ക്ക് ചേരുന്ന കള്ളികൾ കിട്ടും.", "If you have a purpose in mind, write it here in Arabic — an ayah, a surah, a name of God, or a person\'s name with the mother\'s. The square is built from its abjad total. If the purpose is not settled, a total you have already worked out can be entered on its own, and you will get the squares that fit that number.")}</Intro>
          <div className="flex gap-1.5">
            {[["text", txt("ആയത്ത് / സൂറത്ത് / വാചകം", "Ayah / surah / text")], ["name", txt("പേര്", "Name")]].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setMode(k)} className="flex-1 py-2 rounded-xl font-inter text-[11px] font-bold" style={btn(mode === k)}>{l}</button>
            ))}
          </div>
          {mode === "text" ? (
            <>
              <textarea value={text} onChange={(e) => setText(e.target.value)} dir="rtl" rows={5}
                placeholder="بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
                className="w-full rounded-xl p-3 font-amiri text-xl leading-loose outline-none" style={input} />
              <Note color="rgba(255,255,255,0.45)">{txt("എത്ര വലിയ സൂറത്തും ഒട്ടിക്കാം. ഹറകത്തും ഖുർആനിലെ ചിഹ്നങ്ങളും തനിയെ ഒഴിവാക്കി എഴുതിയ അക്ഷരങ്ങൾ മാത്രം എണ്ണുന്നു.", "Paste a surah of any length. Harakat and Quranic marks are skipped; only written letters are counted.")}</Note>
            </>
          ) : (
            <div className="space-y-2">
              {[["self", txt("പേര്", "Name")], ["mother", txt("ഉമ്മയുടെ പേര്", "Mother's name")], ["house", txt("വീട്ടുപേര് (ഐച്ഛികം)", "House name (optional)")]].map(([k, l]) => (
                <div key={k} className="flex items-center gap-2">
                  <input type="checkbox" checked={useName[k]} onChange={(e) => setUseName({ ...useName, [k]: e.target.checked })} />
                  <input value={names[k]} onChange={(e) => setNames({ ...names, [k]: e.target.value })} dir="rtl" placeholder={l}
                    className="flex-1 rounded-xl px-3 py-2 font-amiri text-lg outline-none" style={input} />
                  <span className="w-16 text-right font-inter text-xs font-bold" style={{ color: useName[k] ? INK_C : "rgba(255,255,255,0.3)" }}>{nameAbjad[k].total || "—"}</span>
                </div>
              ))}
              <Note color="rgba(255,255,255,0.45)">{txt("ടിക്ക് ചെയ്ത പേരുകളുടെ തുകകൾ കൂട്ടിയാണ് ആകെ തുക.", "The total adds the ticked names.")}</Note>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 font-inter text-[10px]">
            <span style={{ color: "rgba(255,255,255,0.5)" }}>{txt("ة-ന്റെ മൂല്യം", "Value of ة")}:</span>
            {[5, 400].map((v) => (
              <button key={v} type="button" onClick={() => setTa(v)} className="px-2.5 py-1 rounded-lg font-bold" style={btn(ta === v)}>{v === 5 ? "ه = 5" : "ت = 400"}</button>
            ))}
            <span className="ml-auto" style={{ color: "rgba(255,255,255,0.5)" }}>{txt("അല്ലെങ്കിൽ സംഖ്യ", "or a number")}:</span>
            <input value={manual} onChange={(e) => setManual(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" className="w-24 rounded-lg px-2 py-1 font-inter text-xs" style={input} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat ar="المجموع" label={txt("ആകെ തുക", "Total")} value={N || "—"} />
            <Stat ar="الحروف" label={txt("അക്ഷരങ്ങൾ", "Letters")} value={manualN ? "—" : (mode === "text" ? textAbjad.letters : ["self", "mother", "house"].reduce((s, k) => s + (useName[k] ? nameAbjad[k].letters : 0), 0)) || "—"} />
            <Stat ar={el ? el.ar : "الطبع"} label={txt("മൂലകം", "Element")} value={el ? (isEn ? el.en : el.ml) : "—"} />
          </div>
          {el && <Note color="rgba(255,255,255,0.5)">{txt(`${N} ÷ 4 → ബാക്കി ${N % 4} → ${el.ml} (1 അഗ്നി, 2 മണ്ണ്, 3 വായു, 0 ജലം).`, `${N} ÷ 4 leaves ${N % 4} → ${el.en} (1 fire, 2 earth, 3 air, 0 water).`)}</Note>}
        </Box>

        {/* 2 */}
        <Box step="2" title={txt("കള്ളി തിരഞ്ഞെടുക്കുക", "Choose the square")}>
          <Intro>{txt("എത്ര വശമുള്ള കള്ളി വേണമെന്ന് തിരഞ്ഞെടുക്കുക. ✓ ഉള്ളവയാണ് നിങ്ങളുടെ തുകയ്ക്ക് ചെയ്യാൻ പറ്റുന്നത്; ✗ ഉള്ളവയ്ക്ക് തുക ഒത്തുവരില്ല. ഓരോ വലുപ്പത്തിനും കിതാബിൽ വെവ്വേറെ രീതികളുണ്ട്.", "Choose how many houses a side. The ones marked ✓ can be made from your total; the ✗ ones will not come out. Each size has its own methods in the book.")}</Intro>
          <div className="flex flex-wrap gap-1.5">
            {SIZES.map((s) => {
              const ok = good.includes(s);
              return (
                <button key={s} type="button" onClick={() => setN(s)} className="px-3 py-2 rounded-xl font-inter text-xs font-bold" style={btn(n === s)}>
                  <span className="font-amiri text-sm mr-1">{SIZE_NAME[s].ar}</span>{s}×{s}
                  {N > 0 && <span style={{ color: ok ? "#4ADE80" : "#FCA5A5" }}> {ok ? "✓" : "✗"}</span>}
                </button>
              );
            })}
          </div>
          {plan && (
            <div className="grid grid-cols-4 gap-2">
              <Stat ar="الأس" value={asOf(n) * step} />
              <Stat ar="المفتاح" value={plan.key} />
              <Stat ar="الباقي" value={plan.rem} />
              <Stat ar="بيت الجبر" value={plan.rem ? plan.jabrHouse : "—"} />
            </div>
          )}
          {plan && <Note color="rgba(255,255,255,0.5)">{txt(
            `മിഫ്താഹ് = (${N} − ${asOf(n) * step}) ÷ ${n} = ${plan.key}${plan.rem ? `, ബാക്കി ${plan.rem} → ജബ്ർ വീട് (${n} − ${plan.rem}) × ${n} + 1 = ${plan.jabrHouse}; ആ വീട് മുതൽ ഓരോന്നിലും ഒന്ന് അധികം` : ""}.`,
            `Key = (${N} − ${asOf(n) * step}) ÷ ${n} = ${plan.key}${plan.rem ? `, remainder ${plan.rem} → jabr house (${n} − ${plan.rem}) × ${n} + 1 = ${plan.jabrHouse}` : ""}.`)}</Note>}
          {plan?.issues.includes("too_small") && <Note color="#FCA5A5">{txt("ഈ കള്ളിക്ക് തുക വളരെ ചെറുതാണ്.", "The total is too small for this square.")}</Note>}
          {plan?.issues.includes("m3_jabr_diagonal") && <Note color="#FCA5A5">{txt(
            `3×3-ൽ ബാക്കി ${plan.rem} വരുന്നു; ജബ്ർ ചെയ്താലും ഒരു കോൺ ശരിയാകില്ല. ശരിയാകുന്നവ: ${good.map((s) => `${s}×${s}`).join(", ") || "—"}.`,
            `3×3 leaves remainder ${plan.rem}; even with jabr one diagonal stays off. Working: ${good.map((s) => `${s}×${s}`).join(", ") || "—"}.`)}</Note>}
        </Box>

        {/* 3 */}
        <Box step="3" title={txt("ഉദ്ദേശ്യവും സമയവും", "Purpose and time")}>
          <Intro>{txt("കള്ളി എപ്പോൾ എഴുതണമെന്ന് ഇവിടെ നോക്കാം. ആദ്യ ടാബിൽ ആസ്ട്രോ ക്ലോക്ക് ശതമാനത്തോടെ കണക്കാക്കുന്ന വിഷയങ്ങൾ; രണ്ടാമത്തേതിൽ കിതാബിന്റെ മൻസിൽ പട്ടിക; മൂന്നാമത്തേതിൽ നിങ്ങളുടെ ഉദ്ദേശ്യം — സമ്പത്ത്, ജിന്ന്, യാത്ര എന്നിങ്ങനെ — മലയാളത്തിലോ അറബിയിലോ എഴുതി കിതാബ് അതിനെ ഏത് മൻസിലിലും ദിവസത്തിലും സാഅത്തിലും വെക്കുന്നു എന്ന് കാണാം.", "Here is when to write the square. The first tab holds the subjects the Astro Clock grades with a percentage; the second, the book\'s manzil table; the third lets you type your own purpose — provision, jinn, travel — in Malayalam or Arabic, and shows which manzil, day and hour the book places it in.")}</Intro>
          <div className="flex gap-1.5">
            {[["act", txt("ആസ്ട്രോ ക്ലോക്കിലെ വിഷയങ്ങൾ", "Astro Clock subjects")], ["manzil", txt("കിതാബിലെ മൻസിൽ പട്ടിക", "The book's manzil table")], ["purpose", txt("ഉദ്ദേശ്യം തിരയുക", "Search a purpose")]].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setTab(k)} className="flex-1 py-2 rounded-xl font-inter text-[11px] font-bold" style={btn(tab === k)}>{l}</button>
            ))}
          </div>

          {tab === "purpose" && <PurposePanel ml={!isEn} />}

          {tab === "act" && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {K.ACTIVITIES.map((a) => (
                  <button key={a.id} type="button" onClick={() => { setActId(a.id === actId ? null : a.id); setPurposeId(null); setChosen(null); }}
                    className="px-2.5 py-1.5 rounded-xl font-inter text-[11px] font-bold" style={btn(actId === a.id)}>{a.icon} {isEn ? a.en : a.ml}</button>
                ))}
              </div>
              {!act && <Note color="rgba(255,255,255,0.45)">{txt("ഒരു വിഷയം അമർത്തിയാൽ അതിന് പറ്റിയ അടുത്ത സമയങ്ങൾ ശതമാനത്തോടെ താഴെ വരും.", "Tap a subject to see its next suitable times with percentages.")}</Note>}
              {act && actTimes && (
                <div className="space-y-2">
                  {actTimes.aligned.length > 0 && (
                    <div className="rounded-xl p-2.5 space-y-1.5" style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.35)" }}>
                      <Note color="#4ADE80"><b>★ {txt("ദിവസവും സാഅത്തും ഖമറും ഒരുമിച്ച് ചേരുന്ന സമയം", "Day, hour and Qamar all strong together")}</b></Note>
                      {actTimes.aligned.map((h) => <TimeRow key={h.start} h={h} star />)}
                    </div>
                  )}
                  <Note color="rgba(255,255,255,0.5)">{txt("ദിവസത്തിന് മുൻഗണന നൽകി ക്രമീകരിച്ചത്:", "Ranked with the day weighed first:")}</Note>
                  {actTimes.best.map((h) => <TimeRow key={h.start} h={h} />)}
                  {actTimes.best.length === 0 && actTimes.aligned.length === 0 && <Note color="#FCA5A5">{txt("വരുന്ന ദിവസങ്ങളിൽ പറ്റിയ സമയം കണ്ടെത്താനായില്ല.", "No suitable time found in the coming days.")}</Note>}
                  <Note color="rgba(255,255,255,0.4)">{txt("ശതമാനം: ദിവസം 45% + സാഅത്ത് 35% + ഖമർ 20% — ആസ്ട്രോ ക്ലോക്കിന്റെ അതേ കണക്ക്.", "Percent: day 45% + hour 35% + Qamar 20% — the same reckoning as the Astro Clock.")}</Note>
                </div>
              )}
            </>
          )}

          {tab === "manzil" && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {PURPOSES.map((p) => (
                  <button key={p.id} type="button" onClick={() => { setPurposeId(p.id === purposeId ? null : p.id); setActId(null); setChosen(null); }}
                    className="px-2.5 py-1.5 rounded-xl font-inter text-[11px] font-bold" style={btn(purposeId === p.id)}>
                    <span className="font-amiri text-sm mr-1">{p.ar}</span>{isEn ? p.en : p.ml}
                  </button>
                ))}
              </div>
              {purpose && manzilTimes.map((t) => {
                const mn = K.MANSIONS[t.m], tp = K.MANSION_PURPOSE[t.m];
                return (
                  <div key={t.m} className="rounded-xl p-2.5 space-y-1.5" style={{ background: "rgba(147,197,253,0.05)", border: "1px solid rgba(147,197,253,0.2)" }}>
                    <Note color={INK_C}>🌙 <b>{txt("ഖമർ", "Qamar in")} {isEn ? K.MANSIONS_EN[t.m].name : mn.ml}</b> <Ar>{mn.ar}</Ar> · {t.span.current ? txt(`ഇപ്പോൾ — ${fmtWhen(t.span.end, loc, false)} വരെ`, `now — until ${fmtWhen(t.span.end, loc, true)}`) : fmtSpan(t.span, loc, isEn)}</Note>
                    {tp && <Note color="#4ADE80">📋 {txt("കിതാബിലെ പ്രവൃത്തിപ്പട്ടിക", "Book's table of works")}: <Ar>{tp.ar}</Ar> — {isEn ? tp.en : tp.ml}</Note>}
                    <Note color="rgba(255,255,255,0.5)">{t.best ? txt("ഖലീലി പറഞ്ഞ ഏറ്റവും നല്ല സാഅത്തുകൾ:", "al-Khalili's best hours:") : txt("ഖലീലി സാഅത്ത് പറയാത്തതിനാൽ സഅ്ദ് ഗ്രഹങ്ങളുടെ സാഅത്തുകൾ:", "No hour named here, so the sa'd planets' hours:")}</Note>
                    {t.hours.map((h) => <TimeRow key={h.start} h={h} />)}
                  </div>
                );
              })}
            </>
          )}
          {chosen && <Note color={GOLD}>✓ {txt("തിരഞ്ഞെടുത്ത സമയം", "Chosen time")}: {fmtSpan(chosen, loc, isEn)} · {isEn ? WD_EN[chosen.wd] : WD_ML[chosen.wd]}</Note>}
        </Box>

        {/* 4 */}
        <Box step="4" title={txt("കള്ളി ഉണ്ടാക്കുക", "Build the wafq")}>
          <Intro>{txt("കിതാബിലെ ഓരോ രീതിയും ഇവിടെയുണ്ട്. ഒരു രീതിയുടെ പേരിൽ അമർത്തിയാൽ അതിന്റെ നിയമങ്ങൾ, ഏത് കിതാബിലെ ഏത് പേജ്, ഉണ്ടാക്കിയ കള്ളി, വരിയുടെയും നിരയുടെയും കോണിന്റെയും തുക ഒത്തുവന്നോ എന്ന പരിശോധന — എല്ലാം കാണാം.", "Every method in the books is here. Press a method\'s name to see its rules, which book and page they come from, the square it builds, and the check that every row, column and diagonal comes out at the total.")}</Intro>
          <div className="flex flex-wrap items-center gap-3 font-inter text-[10px]">
            {n <= 4 && (
              <div className="flex flex-wrap items-center gap-1">
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{txt("രൂപം", "Form")}:</span>
                {[["auto", txt(`തുകയുടെ മൂലകം${el ? ` (${el.ml})` : ""}`, `Total's element${el ? ` (${el.en})` : ""}`)], ["base", txt("അടിസ്ഥാനം", "Base")],
                  ["fire", isEn ? "Fire" : "അഗ്നി"], ["air", isEn ? "Air" : "വായു"], ["water", isEn ? "Water" : "ജലം"], ["earth", isEn ? "Earth" : "മണ്ണ്"]].map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setForm(k)} className="px-2 py-1 rounded-lg font-bold" style={btn(form === k)}>{l}</button>
                ))}
              </div>
            )}
            <label className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              {txt("ചുവട് (تفاضل)", "Step")}
              <input type="number" min={1} max={99} value={step} onChange={(e) => setStep(Math.max(1, Math.min(99, parseInt(e.target.value || "1", 10))))} className="w-14 rounded-lg px-2 py-1" style={input} />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={bismi} onChange={(e) => setBismi(e.target.checked)} /> {txt("മുകളിൽ ബിസ്മി", "Bismillah on top")}</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={sideAngels} onChange={(e) => setSideAngels(e.target.checked)} /> {txt("നാലു വശത്തും നാലു മലക്കുകൾ", "Four angels on the four sides")}</label>
          </div>
          <div className="space-y-2">
            <Note color="rgba(255,255,255,0.5)">{txt("നടുവിലെ വീട്ടിൽ എഴുതാൻ (നിബന്ധന 34) — അറബിയിൽ:", "For the middle house (condition 34) — in Arabic:")}</Note>
            {[["seeker", seeker, setSeeker, "اسم الطالب", txt("ആവശ്യപ്പെടുന്നയാളുടെ പേര്", "Seeker's name")],
              ["need", need, setNeed, "الحاجة", txt("ആവശ്യം", "The need")],
              ["sought", sought, setSought, "المطلوب", txt("തേടുന്ന കാര്യം", "The matter sought")]].map(([k, v, set, ph, l]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="w-28 font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>{l}</span>
                <input value={v} onChange={(e) => set(e.target.value)} dir="rtl" placeholder={ph}
                  className="flex-1 rounded-xl px-3 py-2 font-amiri text-base outline-none" style={input} />
              </div>
            ))}
          </div>
          <button type="button" onClick={generate} disabled={!(N > 0)} className="w-full py-3 rounded-xl font-inter text-sm font-bold uppercase tracking-[0.2em]"
            style={{ background: N > 0 ? "linear-gradient(135deg,rgba(212,175,55,0.35),rgba(212,175,55,0.15))" : "rgba(255,255,255,0.04)", color: N > 0 ? "#fff6d6" : "rgba(255,255,255,0.3)", border: "1px solid rgba(212,175,55,0.55)" }}>
            ۞ {txt("കള്ളി ഉണ്ടാക്കുക", "Build the wafq")}
          </button>
        </Box>

        {/* The method library — one section per way of building a square */}
        {N > 0 && (
          <>
            <Box title={txt(`${n}×${n} കള്ളി ഉണ്ടാക്കുന്ന രീതികൾ`, `Ways of building the ${n}×${n}`)}>
              <Note>{txt(
                `ഈ കള്ളിക്ക് രണ്ട് ഗ്രന്ഥങ്ങളിൽ നിന്നായി ${methodsFor(n).length} രീതികൾ. ഓരോന്നിന്റെയും നിയമങ്ങൾ ഗ്രന്ഥം പറയുന്നതുപോലെ, പിന്നെ ആ രീതിയിൽ ഉണ്ടാക്കിയ കള്ളി, പിന്നെ പരിശോധന.`,
                `${methodsFor(n).length} ways for this square, from the two books. For each: the rules as the book gives them, then the square built that way, then the check.`)}</Note>
              <Note color="rgba(255,255,255,0.5)">{txt(
                "ചുവട് (k) മാറ്റിയാൽ എല്ലാ രീതിയിലും മാറ്റം വരും. ഹവാസ്സ് പ്രകാരം k തിരഞ്ഞെടുക്കുന്നത് സൂര്യ-ചന്ദ്ര കോൺ നോക്കിയാണ്:",
                "Changing the step (k) changes every method. In Hâvâss, k is chosen by the Sun–Moon angle:")}</Note>
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((k) => {
                  const a = ANGLE_FOR_STEP[k], sx = ANGLE_SEX[a];
                  return (
                    <button key={k} type="button" onClick={() => setStep(k)} className="px-2.5 py-1.5 rounded-xl font-inter text-[10px] font-bold" style={btn(step === k)}>
                      {a}° <span style={{ color: "rgba(255,255,255,0.45)" }}>k={k}</span>
                      <span className="block text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>{isEn ? sx.en : sx.ml}</span>
                    </button>
                  );
                })}
              </div>
            </Box>
            {methodsFor(n).map((m, i) => (
              <MethodSection key={m.id} m={m} idx={i} N={N} n={n} step={step} isEn={isEn} txt={txt}
                mText={mText} setMText={setMText} mAyah={mAyah} setMAyah={setMAyah}
                fallbackText={mode === "text" ? text : names.self}
                onDraw={(g) => { const cv = canvasRef.current; if (!cv) return; drawWafq(cv, { grid: g, bismi, sideAngels, dayAngel: null, dayKhadim: null, ranks: null, title: null }); const a = document.createElement("a"); a.download = `wafq-${m.id}-${N}.png`; a.href = cv.toDataURL("image/png"); a.click(); }} />
            ))}
          </>
        )}

        {result && (
          <div id="wafq-result" className="space-y-3" style={{ scrollMarginTop: 72 }}>
            <Box title={`${SIZE_NAME[result.n].ar} · ${result.n}×${result.n} · N = ${result.N}`} tone={result.valid ? "ok" : "warn"}>
              <Grid grid={result.grid} />
              <SumsCheck result={result} txt={txt} />
              <Note color={result.valid ? "#4ADE80" : "#FCA5A5"}>{result.valid
                ? txt("എല്ലാ വരിയും നിരയും രണ്ടു കോണും ഒരേ തുക — കള്ളി ശരി.", "Every row, column and both diagonals agree — the wafq is correct.")
                : txt("ചില വരികൾ തുല്യമല്ല (✗). ✓ ഉള്ള മറ്റൊരു കള്ളി എടുക്കുക.", "Some lines differ (✗). Choose a square marked ✓.")}</Note>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <Stat ar="الوفق" value={result.N} /><Stat ar="المفتاح" value={result.miftah} /><Stat ar="المغالق" value={result.maghaliq} />
                <Stat ar="العدل" value={result.miftah + result.maghaliq} /><Stat ar="المساحة" value={result.masaha} /><Stat ar="الضابط" value={result.N + result.masaha} />
              </div>
              <Note color="rgba(255,255,255,0.45)">{txt("വിഭാഗം", "Class")}: <Ar size="text-sm">{SQUARE_CLASS(result.n)}</Ar>
                {result.step > 1 ? ` · ${txt("ചുവട്", "step")} ${result.step}` : ""}
                {result.rem ? ` · ${txt("ജബ്ർ വീട്", "jabr house")} ${result.jabrHouse}` : ""}
                {result.n <= 4 ? ` · ${txt("രൂപം", "form")}: ${result.form === "base" ? txt("അടിസ്ഥാനം", "base") : (isEn ? ELEMENTS[result.form].en : ELEMENTS[result.form].ml)}` : ""}</Note>
              <button type="button" onClick={copyText} className="px-3 py-1 rounded-lg font-inter text-[10px] font-bold" style={btn(copied)}>{copied ? txt("പകർത്തി ✓", "Copied ✓") : txt("സംഖ്യകൾ പകർത്തുക", "Copy numbers")}</button>
            </Box>

            {/* 5 writing */}
            <Box step="5" title={txt("എഴുതേണ്ട രൂപവും ക്രമവും", "How and in what order to write it")}>
          <Intro>{txt("ഇനി എഴുത്താണ്. ഏത് വീട്ടിൽ ഏത് സംഖ്യ ആദ്യം എന്ന ക്രമം, കള്ളിക്ക് ചുറ്റും ബിസ്മിയും മലക്കുകളുടെ പേരുകളും മൂലയിലെ ആയത്തും, ഈ കള്ളിയുടെ ഹാദിമുകൾ — എല്ലാം താഴെ.", "Now the writing. The order in which the houses are filled, the besmele and the angels\' names around the square with the verse across its corners, and this square\'s hâdims — all below.")}</Intro>
              {/* which angel the working belongs to — its name is what
                  goes on all four sides */}
              <div className="grid grid-cols-2 gap-2">
                {ARCHANGELS.map((a) => (
                  <button key={a.id} type="button" onClick={() => setAngel(a.id)}
                          className="rounded-xl p-2 text-right font-inter text-[10px] leading-relaxed"
                          style={btn(angel === a.id)}>
                    <span className="font-amiri text-lg block">{a.ar}</span>
                    <span style={{ opacity: 0.75 }}>{isEn ? a.kashf_en : a.kashf_ml}</span>
                  </button>
                ))}
              </div>

              {/* The reader's own text, carried right round the outside —
                  outside the angels' names and outside the besmele. */}
              <div className="rounded-2xl p-3 space-y-2" style={card}>
                <p className="font-inter text-[11px] font-bold" style={{ color: GOLD }}>
                  {txt("ചുറ്റും വട്ടത്തിൽ എഴുതാൻ (ഐച്ഛികം)", "Written round the outside (optional)")}
                </p>
                <textarea
                  dir="rtl"
                  rows={2}
                  value={ringAround}
                  onChange={(e) => setRingAround(e.target.value)}
                  placeholder={txt("ആയത്തോ പദമോ ഇവിടെ എഴുതുക", "An ayah or a phrase")}
                  className="w-full rounded-xl px-3 py-2 font-amiri text-lg"
                  style={{ background: "rgba(0,0,0,0.25)", color: INK_C,
                           border: "1px solid rgba(212,175,55,0.25)" }} />
                <p className="font-inter text-[10px]" style={{ color: "rgba(245,234,212,0.5)" }}>
                  {txt("എഴുതുന്നതെല്ലാം മലക്കുകളുടെ പേരുകൾക്കും ബിസ്മിക്കും പുറത്ത്, ഒരു വട്ടത്തിൽ മുഴുവനായി വരും. കള്ളിയുടെ ഉള്ളിൽ ഒന്നും കയറില്ല.",
                       "Whatever you write goes round once, outside the angels' names and the besmele. Nothing enters the square.")}
                </p>
              </div>

              <div ref={sheetRef} className="rounded-2xl p-2" style={{ background: "#FDFAF2", color: "#111" }}>
                <WafqSheet grid={result.grid} angel={angel} fourAngels={sideAngels}
                           weekday={dayWd} besmele={bismi} ringAround={ringAround}
                           className="w-full h-auto" />
              </div>

              <button type="button" className="w-full py-2 rounded-xl font-inter text-xs font-bold"
                      style={btn(true)}
                      onClick={() => {
                        const svg = sheetRef.current?.querySelector("svg");
                        if (svg) downloadSvgPng(svg, `wafq-${result.n}x${result.n}-${result.N}.png`);
                      }}>
                {txt("കള്ളി ചിത്രമായി സൂക്ഷിക്കുക (PNG)", "Save the sheet as a PNG")}
              </button>

              <WafqTiming angel={angel} weekday={dayWd} ml={!isEn} />

              <div className="rounded-2xl p-3 space-y-2" style={card}>
                <p className="font-inter text-[11px] font-bold" style={{ color: GOLD }}>
                  <span className="font-amiri">خدام الوفق</span>{" "}
                  {txt("ഈ കള്ളിയുടെ ഹാദിമുകൾ", "The hâdims of this square")}
                </p>
                <HadimPanel grid={result.grid} miftah={result.key} ml={!isEn} />
              </div>

              <Note>{txt("ഏറ്റവും ചെറിയ സംഖ്യ (മിഫ്താഹ്) ആദ്യം അലിഫിന്റെ വീട്ടിൽ; പിന്നെ ഓരോന്നായി കൂട്ടി ക്രമത്തിൽ, ഏറ്റവും വലിയ സംഖ്യ (മഗാലിഖ്) അവസാനം.", "The smallest number (the key) goes first, in the house of alif; then each next number in order, the largest (maghaliq) last.")}</Note>
              {writeIdx >= 0 && writeIdx < order.length && (() => {
                const k = order[writeIdx], h = result.houses.flat()[k], v = result.grid.flat()[k];
                const r = Math.floor(k / result.n) + 1, c = k % result.n + 1;
                return (
                  <div className="rounded-xl p-3 text-center space-y-1" style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.4)" }}>
                    <Note color={INK_C}>{txt(`വീട് ${h} / ${result.n * result.n}`, `House ${h} of ${result.n * result.n}`)} · {txt(`വരി ${r}, നിര ${c}`, `row ${r}, column ${c}`)}{result.n === 3 ? <> · <Ar>{HOUSE_LETTERS[h - 1]}</Ar></> : null}</Note>
                    <p className="font-amiri text-4xl" style={{ color: GOLD }}>{toArabicDigits(v)}</p>
                    {result.n === 3 && <Note>{txt("ഈ വീട് എഴുതുമ്പോൾ ചൊല്ലേണ്ടത് — രണ്ടു തവണ", "Recite while writing this house — twice")}: <Ar size="text-lg">{HOUSE_RECITE[h]}</Ar></Note>}
                  </div>
                );
              })()}
              <div className="flex gap-2">
                <button type="button" onClick={() => setWriteIdx((i) => Math.max(-1, i - 1))} disabled={writeIdx < 0} className="flex-1 py-2 rounded-xl font-inter text-xs font-bold" style={btn(false)}>← {txt("മുമ്പത്തേത്", "Back")}</button>
                <button type="button" onClick={() => setWriteIdx((i) => Math.min(order.length, i + 1))} className="flex-1 py-2 rounded-xl font-inter text-xs font-bold" style={btn(true)}>
                  {writeIdx < 0 ? txt("എഴുത്ത് തുടങ്ങുക", "Start writing") : writeIdx >= order.length - 1 ? txt("പൂർത്തിയായി ✓", "Done ✓") : `${txt("അടുത്തത്", "Next")} →`}
                </button>
              </div>
              <Note color="rgba(255,255,255,0.5)"><b>{txt("അക്കങ്ങൾ എഴുതുന്ന നിയമം (നിബന്ധന 34)", "How the digits are written (condition 34)")}:</b> <Ar size="text-sm">{NUMBER_RULE.ar}</Ar> — {isEn ? NUMBER_RULE.en : NUMBER_RULE.ml} {isEn ? NUMBER_RULE.zeroEnd_en : NUMBER_RULE.zeroEnd_ml}</Note>
              {(bismi || sideAngels) && <Note color="rgba(255,255,255,0.4)">{txt("മുകളിലെ ബിസ്മിയും നാലു വശത്തെ മലക്കുകളും അവ്ഫാഖ് അധ്യായത്തിലെ നിയമമല്ല; കിതാബ് ആവശ്യത്തിന് യോജിച്ച ഒരു മലക്കിനെ നടുവിലെ വീട്ടിലാണ് പറയുന്നത്.", "The Bismillah on top and the four side angels are not rules of the awfaq chapter; the book places the one angel suited to the need in the middle house.")}</Note>}
              {result.n !== 3 && <Note color="rgba(255,255,255,0.45)">{txt("ഓരോ വീട്ടിലും ചൊല്ലേണ്ട പേരുകൾ കിതാബ് നൽകുന്നത് 3×3-ന് മാത്രമാണ്.", "The book gives names to recite per house only for the 3×3.")}</Note>}
            </Box>

            {/* 6 middle house */}
            <Box step="6" title={txt("നടുവിലെ വീട്ടിൽ — ഏഴ് പടികൾ (നിബന്ധന 34)", "The middle house — seven ranks (condition 34)")}>
              <div className="space-y-1">
                {SEVEN_RANKS.map((r, i) => (
                  <div key={r.n} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: "rgba(212,175,55,0.05)" }}>
                    <span className="w-5 text-center font-inter text-[10px] font-bold" style={{ color: GOLD }}>{r.n}</span>
                    <span className="flex-1 font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>{isEn ? r.en : r.ml}</span>
                    <span className="font-amiri text-base text-right" style={{ color: INK_C }}>{rankValues[i] || <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>}</span>
                  </div>
                ))}
              </div>
              <Note color="rgba(255,255,255,0.5)"><Ar size="text-sm">{SEVEN_RANKS_NOTE.ar}</Ar> — {isEn ? SEVEN_RANKS_NOTE.en : SEVEN_RANKS_NOTE.ml}</Note>
              <Note color="rgba(255,255,255,0.45)">{isEn ? SEVEN_RANKS_NOTE.alt_en : SEVEN_RANKS_NOTE.alt_ml}</Note>
              {needAngel && <Note color="#4ADE80">{txt("ആവശ്യത്തിന് യോജിച്ച മലക്ക്", "The angel suited to the need")}: <Ar size="text-lg">{needAngel.angel}</Ar> — <Ar size="text-sm">{needAngel.ar}</Ar> ({isEn ? needAngel.en : needAngel.ml})</Note>}
              <Note color="rgba(255,255,255,0.5)"><b>{txt("എത്ര തവണ ചൊല്ലണം", "How many times to recite")}:</b> {RECITE_COUNT.opinions.map((o, i) => `${i + 1}. ${isEn ? o.en : o.ml}`).join(" · ")}. {isEn ? RECITE_COUNT.soundest_en : RECITE_COUNT.soundest_ml}</Note>
            </Box>

            {/* 7 angels */}
            <Box title={txt("മലക്കുകൾ", "Angels")}>
              <div className="grid grid-cols-2 gap-2">
                <Stat ar="ملك اليوم" label={txt(`ദിവസത്തിന്റെ മലക്ക് — ${WD_ML[dayWd]}`, `Angel of the day — ${WD_EN[dayWd]}`)} value={<span className="font-amiri text-lg">{dayRow?.angel || "—"}</span>} />
                <Stat ar="خادم اليوم" label={txt("ദിവസത്തിന്റെ ഖാദിം", "Khadim of the day")} value={<span className="font-amiri text-lg">{dayRow?.khadim || "—"}</span>} />
              </div>
              <Note color="rgba(255,255,255,0.5)">{txt(
                `ദിവസത്തിന്റെ മലക്കും ഖാദിമും ${chosen ? "തിരഞ്ഞെടുത്ത സമയത്തിന്റെ" : "ഇന്നത്തെ"} ദിവസം അനുസരിച്ചാണ്; സമയം മാറ്റിയാൽ ഇവയും മാറും. മൂലകത്തിന്റെ മലക്ക് തുകയുടെ മൂലകം അനുസരിച്ച് സ്ഥിരമാണ് — ${ELEMENTS[result.element].angel}.`,
                `The angel and khadim of the day follow ${chosen ? "the chosen time's" : "today's"} day and change with the time. The element's angel is fixed by the total's element — ${ELEMENTS[result.element].angel}.`)}</Note>
              {result.n === 3 && (
                <div className="overflow-x-auto">
                  <table className="w-full font-inter text-[10px]" style={{ color: "rgba(245,234,212,0.85)" }}>
                    <thead><tr style={{ color: GOLD }}>{[txt("വീട്", "House"), txt("സംഖ്യ", "No."), txt("ചൊല്ലേണ്ടത് (×2)", "Recite (×2)"), txt("ഗ്രഹം", "Planet"), txt("മലക്ക്", "Angel"), txt("ഖാദിം", "Khadim")].map((h) => <th key={h} className="p-1 text-left">{h}</th>)}</tr></thead>
                    <tbody>
                      {LETTER_TABLE.map((r, i) => (
                        <tr key={r.l} style={{ borderTop: "1px solid rgba(212,175,55,0.12)" }}>
                          <td className="p-1 font-amiri text-base">{i + 1} {r.l}</td>
                          <td className="p-1 font-bold">{result.grid.flat()[result.houses.flat().indexOf(i + 1)]}</td>
                          <td className="p-1 font-amiri text-sm">{HOUSE_RECITE[i + 1]}</td>
                          <td className="p-1 font-amiri text-sm">{r.planet}</td>
                          <td className="p-1 font-amiri text-sm">{r.angel}</td>
                          <td className="p-1 font-amiri text-sm">{r.khadim}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Box>

            {/* 8 duas */}
            <Box step="7" title={txt("ചൊല്ലേണ്ട ദുആകളും എണ്ണവും", "The du'as and their counts")}>
              <Note color="rgba(255,255,255,0.5)">{txt("പേരുകൾ ഇറക്കുംമുമ്പ്:", "Before the tanzil of the names:")}</Note>
              {DUA_BEFORE.map((d, i) => (
                <div key={i} className="space-y-1">
                  <Note color={GOLD}><b>{d.count > 1 ? `${d.count}×` : ""} {isEn ? d.en : d.ml}</b></Note>
                  <ArBlock>{d.ar}</ArBlock>
                </div>
              ))}
              <Note color="rgba(255,255,255,0.45)"><Ar size="text-sm">{DUA_BEFORE_WHEN.ar}</Ar> — {isEn ? DUA_BEFORE_WHEN.en : DUA_BEFORE_WHEN.ml}</Note>
              <Note color="rgba(255,255,255,0.5)">{txt("ആവശ്യം ഇറക്കുമ്പോൾ:", "At the tanzil of the need:")}</Note>
              <ArBlock>{DUA_TANZIL.ar}</ArBlock>
              {isLoveWork && (
                <>
                  <Note color="rgba(255,255,255,0.5)"><b>{txt("കള്ളിക്ക് ചുറ്റും", "Around the wafq")}</b> — <Ar size="text-sm">{AROUND_WAFQ.scope_ar}</Ar> ({isEn ? AROUND_WAFQ.scope_en : AROUND_WAFQ.scope_ml}): {isEn ? AROUND_WAFQ.how_en : AROUND_WAFQ.how_ml}</Note>
                  {AROUND_WAFQ.verses.map((v, i) => (
                    <div key={i} className="space-y-1">
                      <Note color="rgba(255,255,255,0.45)">{v.ref}{v.times > 1 ? ` · ${v.times}×` : ""}</Note>
                      <ArBlock>{v.ar}</ArBlock>
                    </div>
                  ))}
                </>
              )}
            </Box>

            {/* 9 download */}
            <Box step="8" title={txt("ഡൗൺലോഡും പ്രിൻ്റും", "Download and print")}>
          <Intro>{txt("തീർന്ന കള്ളി ചിത്രമായി സൂക്ഷിക്കാം, പ്രിന്റ് എടുക്കാം.", "Save the finished square as an image, or print it.")}</Intro>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={downloadPng} className="flex-1 py-2.5 rounded-xl font-inter text-xs font-bold" style={btn(true)}>⬇ {txt("ചിത്രമായി (PNG)", "Image (PNG)")}</button>
                <button type="button" onClick={printPdf} className="flex-1 py-2.5 rounded-xl font-inter text-xs font-bold" style={btn(true)}>🖨 {txt("PDF / പ്രിൻ്റ്", "PDF / print")}</button>
              </div>
              <Note color="rgba(255,255,255,0.45)">{txt("ബിസ്മി, നാലു വശത്തെ മലക്കുകൾ, ദിവസത്തിന്റെ മലക്കും ഖാദിമും, ഏഴ് പടികൾ — തിരഞ്ഞെടുത്തതെല്ലാം ചിത്രത്തിൽ വരും. പ്രിൻ്റ് ജാലകത്തിൽ \"Save as PDF\" തിരഞ്ഞെടുക്കാം.", "The Bismillah, the four side angels, the day's angel and khadim and the seven ranks — whatever is selected comes into the image. In the print window choose \"Save as PDF\".")}</Note>
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </Box>

            {result.hollow?.ok && (
              <Box title={txt("നടുവ് ഒഴിഞ്ഞ 3×3 (مثلث خالي الوسط)", "Hollow-centre 3×3")}>
                <Grid grid={result.hollow.grid} arabic />
                <Note color="rgba(255,255,255,0.5)">{txt(`നടുവിലെ ه ഒഴിച്ചിടുന്നു; ഓരോ വരിയും നിരയും ${result.N}.`, `Centre ه left empty; each row and column ${result.N}.`)}</Note>
              </Box>
            )}

            <Box title={txt("മൂലകം, ദിശ, ലോഹം", "Element, direction, metal")}>
              <div className="grid grid-cols-3 gap-2">
                <Stat ar={ELEMENTS[result.element].ar} label={txt("മൂലകം", "Element")} value={isEn ? ELEMENTS[result.element].en : ELEMENTS[result.element].ml} />
                <Stat ar="الجهة" label={txt("മുഖം തിരിക്കേണ്ട ദിശ", "Face towards")} value={isEn ? { fire: "East", air: "West", water: "North", earth: "South" }[result.element] : { fire: "കിഴക്ക്", air: "പടിഞ്ഞാറ്", water: "വടക്ക്", earth: "തെക്ക്" }[result.element]} />
                <Stat ar="البروج" label={txt("ബുർജുകൾ", "Signs")} value={<span className="text-[11px]">{isEn ? ELEMENTS[result.element].burj_en : ELEMENTS[result.element].burj_ml}</span>} />
              </div>
              <Note color="rgba(255,255,255,0.5)">{txt(
                `ദിശ നിബന്ധന 18 പ്രകാരം; സംശയമെങ്കിൽ പടിഞ്ഞാറോ ഖിബ്‌ലയോ. ലോഹത്തിൽ എഴുതുമ്പോൾ ഭാരം ${result.n} ഗ്രാം; അല്ലെങ്കിൽ കടലാസ്.`,
                `Direction per condition 18; if unsure, west or the qibla. On metal, weight ${result.n} g; otherwise paper.`)}</Note>
            </Box>

            <Box title={<span className="font-amiri text-sm">{INK.title_ar}</span>}>
              <div className="flex flex-wrap gap-1.5">
                {INK.items_ar.map((it, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg font-inter text-[10px]" style={{ background: "rgba(212,175,55,0.07)", color: INK_C }}>
                    <span className="font-amiri text-sm">{it}</span> — {(isEn ? INK.items_en : INK.items_ml)[i]}
                  </span>
                ))}
              </div>
              <ol className="list-decimal pl-5 space-y-1 font-inter text-xs" style={{ color: "rgba(245,234,212,0.85)" }}>
                {(isEn ? INK.steps_en : INK.steps_ml).map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <Note color="rgba(255,255,255,0.5)">{isEn ? INK.note_en : INK.note_ml}</Note>
            </Box>

            <Box title={txt("ഓർക്കേണ്ട നിബന്ധനകൾ", "Conditions to keep")}>
              <ul className="list-disc pl-5 space-y-1 font-inter text-xs" style={{ color: "rgba(245,234,212,0.85)" }}>
                <li>{txt("തുടങ്ങുംമുമ്പ് രണ്ട് റക്അത്ത്, ഇസ്തിഗ്ഫാർ, സ്വലാത്ത്; ആവശ്യമെങ്കിൽ ഇസ്തിഖാറ.", "Before starting: two rak'at, istighfar, salawat; istikhara if needed.")}</li>
                <li>{txt("വശങ്ങൾ സമം, വരകൾ നേരെ, വീടുകൾ ഒരേ വലിപ്പം; അക്ഷരവും അക്കവും ഭംഗിയായി, വ്യക്തമായി; എഴുതുന്നത് ഉച്ചരിക്കുക.", "Equal sides, straight lines, equal houses; clear beautiful letters and digits; say what you write.")}</li>
                <li>{txt("ഇരുണ്ട, ചെറിയ സ്ഥലം; ഭക്ഷണം കുറയ്ക്കുക; ശ്രദ്ധ വിടാതെ, തെറ്റില്ലാതെ.", "A dark, small place; eat little; stay present, without error.")}</li>
                <li>{txt("വഫ്ഖിന്മേൽ രണ്ട് റക്അത്ത്: الانشراح، القدر. സൂര്യന്റെയും ചന്ദ്രന്റെയും വെളിച്ചം തട്ടരുത്.", "Two rak'at over the wafq with الانشراح and القدر. Keep sun and moon light off it.")}</li>
                <li>{txt("തഖ്‌വ, ഹലാൽ, ഇഖ്‌ലാസ്; അനുവദനീയമായത് മാത്രം തേടുക; ക്ഷമ.", "Taqwa, halal, sincerity; seek only what is permitted; patience.")}</li>
                {CAUTIONS.map((c, i) => <li key={i}><Ar size="text-sm">{c.ar}</Ar> — {isEn ? c.en : c.ml}</li>)}
              </ul>
            </Box>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

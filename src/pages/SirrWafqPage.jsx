// ═══════════════════════════════════════════════════════════════
// سر الوفق — build a wafq (magic square) from any Arabic text or name,
// by the awfaq rules of Kashf al-Haqa'iq, with the right time from the
// Astro Clock (manazil table of works + al-Khalili's best hours).
// Beneficial purposes only.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import {
  abjadOf, asOf, SIZES, SIZE_NAME, SQUARE_CLASS, buildWafq, hollowWafq3, workingSizes,
  elementOf, ELEMENTS, LETTER_TABLE, HOUSE_LETTERS, HOUSE_RECITE, DAY_ANGEL, PURPOSES, toArabicDigits, planWafq,
} from "@/lib/sirrWafqEngine";
import * as K from "@/lib/kashfSaatData";
import { getUserLocation } from "@/lib/astroClockSunriseSunset";
import { getPlanetaryDay } from "@/lib/kashfSaatEngine";
import { moonSpan, nextPlanetHourIn, fmtSpan, fmtWhen } from "@/lib/kashfNextTimes";

const GOLD = "#F5D060";
const INK = "#f5ead4";
const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.22)" };
const WD_ML = ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"];
const WD_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Box({ step, title, children, tone }) {
  const border = tone === "ok" ? "rgba(74,222,128,0.35)" : tone === "warn" ? "rgba(248,113,113,0.45)" : "rgba(212,175,55,0.22)";
  return (
    <section className="rounded-2xl p-4 space-y-3" style={{ ...card, borderColor: border }}>
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
      <div className="font-inter text-base font-bold break-all" style={{ color: INK }}>{value}</div>
      {label && <div className="font-inter text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.40)" }}>{label}</div>}
    </div>
  );
}

const Note = ({ children, color = "rgba(245,234,212,0.78)" }) => <p className="font-inter text-xs leading-relaxed" style={{ color }}>{children}</p>;
const Ar = ({ children, size = "text-base" }) => <span className={`font-amiri ${size}`} style={{ color: GOLD }}>{children}</span>;

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
                      color: isActive ? "#0b0a12" : INK, background: isActive ? GOLD : v == null ? "rgba(255,255,255,0.02)" : "rgba(212,175,55,0.05)",
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

// Times for a purpose: the next stays of the Moon in the manazil the book's
// table gives for it, and inside each, al-Khalili's best hours (or the sa'd
// planets' hours when he names none). Hours on a nahs day are flagged.
function purposeTimes(purpose, nowMs, loc) {
  const spans = purpose.mansions
    .map((m) => ({ m, span: moonSpan("mansion", m - 1, nowMs) }))
    .filter((x) => x.span?.start)
    .sort((a, b) => a.span.start - b.span.start)
    .slice(0, 3);
  return spans.map(({ m, span }) => {
    const planets = K.MANSION_BEST_HOURS[m] || ["jupiter", "venus", "sun"];
    const hours = planets
      .map((pl) => {
        const h = nextPlanetHourIn(pl, span, loc, nowMs);
        if (!h) return null;
        // Only the part of the hour while the Moon is in the manzil counts.
        const start = Math.max(h.start, span.start), end = span.end ? Math.min(h.end, span.end) : h.end;
        const pd = getPlanetaryDay(start + 60000, loc);
        return { ...h, start, end, current: nowMs >= start, planet: pl, wd: pd.pDay.wd, nahsDay: pd.day.isNahsDay };
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);
    return { m, span, hours, best: !!K.MANSION_BEST_HOURS[m] };
  });
}

export default function SirrWafqPage() {
  const [lang, setLang] = useState("ml");
  const txt = (ml, en) => (lang === "en" ? en : ml);
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [names, setNames] = useState({ self: "", mother: "", house: "" });
  const [useName, setUseName] = useState({ self: true, mother: true, house: false });
  const [ta, setTa] = useState(5);
  const [manual, setManual] = useState("");
  const [n, setN] = useState(3);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState("auto");
  const [purposeId, setPurposeId] = useState(null);
  const [timeSel, setTimeSel] = useState(null);
  const [bismi, setBismi] = useState(true);
  const [result, setResult] = useState(null);
  const [writeIdx, setWriteIdx] = useState(-1);
  const [copied, setCopied] = useState(false);
  const loc = getUserLocation();

  // Totals
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
  const purpose = PURPOSES.find((p) => p.id === purposeId) || null;
  const times = useMemo(() => (purpose ? purposeTimes(purpose, Date.now(), loc) : []), [purposeId]);

  useEffect(() => { setResult(null); setWriteIdx(-1); }, [N, n, step, form, bismi]);

  function generate() {
    if (!(N > 0)) return;
    const f = form === "auto" ? elementOf(N) : form;
    const r = buildWafq(N, n, { step, form: n <= 4 ? f : "base" });
    const hollow = n === 3 && step === 1 ? hollowWafq3(N) : null;
    setResult({ ...r, hollow, element: elementOf(N) });
    setWriteIdx(-1);
    setCopied(false);
    setTimeout(() => document.getElementById("wafq-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }

  // Writing order: houses 1..n² — the smallest number first.
  const order = useMemo(() => {
    if (!result) return [];
    const flatH = result.houses.flat();
    return flatH.map((h, k) => [h, k]).sort((a, b) => a[0] - b[0]).map(([, k]) => k);
  }, [result]);
  const doneSet = useMemo(() => new Set(writeIdx < 0 ? [] : order.slice(0, writeIdx + 1)), [order, writeIdx]);

  function copyText() {
    if (!result) return;
    const lines = result.grid.map((r) => r.join("\t")).join("\n");
    const head = `سر الوفق — N=${result.N}, ${result.n}×${result.n}, مفتاح=${result.key}${result.rem ? `, جبر=${result.jabrHouse}` : ""}`;
    navigator.clipboard?.writeText(head + "\n" + lines).then(() => setCopied(true)).catch(() => {});
  }

  const btn = (active) => ({
    background: active ? "rgba(212,175,55,0.18)" : "transparent",
    color: active ? GOLD : "rgba(255,255,255,0.6)",
    border: `1px solid ${active ? "rgba(212,175,55,0.55)" : "rgba(212,175,55,0.22)"}`,
  });
  const input = { background: "rgba(0,0,0,0.25)", color: INK, border: "1px solid rgba(212,175,55,0.25)" };

  const selHour = timeSel ? times[timeSel[0]]?.hours[timeSel[1]] : null;
  const dayForAngel = selHour ? selHour.wd : getPlanetaryDay(Date.now(), loc).pDay.wd;

  return (
    <PageLayout>
      <div className="space-y-3 pb-10 max-w-3xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
          <PageTitle arabic="سر الوفق" latin={lang === "en" ? "Sirr al-Wafq" : undefined}
            subtitle={txt("കശ്ഫുൽ ഹഖാഇഖിന്റെ നിയമപ്രകാരം വഫ്ഖ് നിർമ്മാണം", "Building a wafq by the rules of Kashf al-Haqa'iq")} icon="۞" />
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(212,175,55,0.30)" }}>
            {[["ml", "മലയാളം"], ["en", "English"]].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setLang(k)} className="px-3 py-2 font-inter text-[10px] font-bold uppercase tracking-wider"
                style={{ background: lang === k ? "rgba(212,175,55,0.15)" : "transparent", color: lang === k ? GOLD : "rgba(255,255,255,0.40)" }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Intro */}
        <Box>
          <p className="font-amiri text-2xl text-center" style={{ color: GOLD }}>بسم الله الرحمن الرحيم</p>
          <Note>{txt(
            "ഓരോ വരിയുടെയും നിരയുടെയും രണ്ടു കോണുകളുടെയും തുക ഒന്നാകുന്ന വിധത്തിൽ സംഖ്യകൾ ക്രമീകരിച്ച സമചതുര കള്ളിയാണ് വഫ്ഖ് (وفق). ഒരു ആയത്തിന്റെയോ സൂറത്തിന്റെയോ പേരിന്റെയോ അബ്ജദ് തുകയിൽ നിന്നാണ് അത് നിറയ്ക്കുന്നത്.",
            "A wafq (وفق) is a square of houses filled so that every row, every column and both diagonals give the same total. It is filled from the abjad total of an ayah, a surah or a name.")}</Note>
          <Note>{txt(
            "ഈ പേജ് കശ്ഫുൽ ഹഖാഇഖിലെ അവ്ഫാഖ് അധ്യായത്തിലെ നിയമങ്ങൾ അതേപടി പാലിക്കുന്നു: أس കുറച്ച് മിഫ്താഹ് കണ്ടെത്തൽ, ബാക്കി വന്നാൽ ജബ്ർ, മൂലകമനുസരിച്ചുള്ള രൂപം, ചെറിയ സംഖ്യ മുതൽ എഴുതുന്ന ക്രമം. ശരിയായ സമയം ആസ്ട്രോ ക്ലോക്കിൽ നിന്നും എടുക്കുന്നു: മൻസിലുകളുടെ പ്രവൃത്തിപ്പട്ടികയും ഖലീലി പറഞ്ഞ ഏറ്റവും നല്ല സാഅത്തുകളും.",
            "This page follows the awfaq chapter of Kashf al-Haqa'iq as written: subtract the أس to find the key, apply jabr when there is a remainder, use the element's form, and write from the smallest number up. The right time comes from the Astro Clock: the book's table of works for the manazil and al-Khalili's best hours.")}</Note>
          <Note color="rgba(255,255,255,0.5)">{txt(
            "എങ്ങനെ ഉപയോഗിക്കാം: (1) വാചകമോ പേരോ നൽകുക → (2) കള്ളി തിരഞ്ഞെടുക്കുക → (3) ഉദ്ദേശ്യവും സമയവും → (4) കള്ളി ഉണ്ടാക്കുക → (5) ക്രമത്തിൽ എഴുതുക.",
            "How to use: (1) enter a text or name → (2) choose the square → (3) purpose and time → (4) build → (5) write it in order.")}</Note>
        </Box>

        {/* 1. Input */}
        <Box step="1" title={txt("വാചകം അല്ലെങ്കിൽ പേര്", "Text or name")}>
          <div className="flex gap-1.5">
            {[["text", txt("ആയത്ത് / സൂറത്ത് / വാചകം", "Ayah / surah / text")], ["name", txt("വ്യക്തിയുടെ പേര്", "A person's name")]].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setMode(k)} className="flex-1 py-2 rounded-xl font-inter text-[11px] font-bold" style={btn(mode === k)}>{l}</button>
            ))}
          </div>
          {mode === "text" ? (
            <>
              <textarea value={text} onChange={(e) => setText(e.target.value)} dir="rtl" rows={5}
                placeholder="بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
                className="w-full rounded-xl p-3 font-amiri text-xl leading-loose outline-none" style={input} />
              <Note color="rgba(255,255,255,0.45)">{txt("എത്ര വലിയ സൂറത്തും ഒട്ടിക്കാം. ഹറകത്തും ഖുർആനിലെ ചിഹ്നങ്ങളും തനിയെ ഒഴിവാക്കി, എഴുതിയ അക്ഷരങ്ങൾ മാത്രം എണ്ണുന്നു.", "Paste a surah of any length. Harakat and Quranic marks are skipped; only written letters are counted.")}</Note>
            </>
          ) : (
            <div className="space-y-2">
              {[["self", txt("പേര്", "Name")], ["mother", txt("ഉമ്മയുടെ പേര്", "Mother's name")], ["house", txt("വീട്ടുപേര് (ഐച്ഛികം)", "Family / house name (optional)")]].map(([k, l]) => (
                <div key={k} className="flex items-center gap-2">
                  <input type="checkbox" checked={useName[k]} onChange={(e) => setUseName({ ...useName, [k]: e.target.checked })} />
                  <input value={names[k]} onChange={(e) => setNames({ ...names, [k]: e.target.value })} dir="rtl" placeholder={l}
                    className="flex-1 rounded-xl px-3 py-2 font-amiri text-lg outline-none" style={input} />
                  <span className="w-16 text-right font-inter text-xs font-bold" style={{ color: useName[k] ? INK : "rgba(255,255,255,0.3)" }}>{nameAbjad[k].total || "—"}</span>
                </div>
              ))}
              <Note color="rgba(255,255,255,0.45)">{txt(
                "ടിക്ക് ചെയ്ത പേരുകളുടെ തുകകൾ കൂട്ടിയാണ് ആകെ തുക. കിതാബ് (നിബന്ധന 23) പേരും ഉമ്മയുടെ പേരും പറയുന്നത് ആളെ കൃത്യമായി തിരിച്ചറിയാനാണ്; അവ കൂട്ടണോ എന്നത് ഇവിടെ നിങ്ങൾക്ക് തീരുമാനിക്കാം.",
                "The total adds the ticked names. The book (condition 23) names the person and the mother to identify the person exactly; whether to add them is your choice here.")}</Note>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 font-inter text-[10px]">
            <span style={{ color: "rgba(255,255,255,0.5)" }}>{txt("ة-ന്റെ മൂല്യം", "Value of ة")}:</span>
            {[5, 400].map((v) => (
              <button key={v} type="button" onClick={() => setTa(v)} className="px-2.5 py-1 rounded-lg font-bold" style={btn(ta === v)}>{v === 5 ? "ه = 5" : "ت = 400"}</button>
            ))}
            <span className="ml-auto" style={{ color: "rgba(255,255,255,0.5)" }}>{txt("അല്ലെങ്കിൽ സംഖ്യ നേരിട്ട്", "or a number")}:</span>
            <input value={manual} onChange={(e) => setManual(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" className="w-24 rounded-lg px-2 py-1 font-inter text-xs" style={input} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat ar="المجموع" label={txt("ആകെ തുക", "Total")} value={N || "—"} />
            <Stat ar="الحروف" label={txt("അക്ഷരങ്ങൾ", "Letters")} value={manualN ? "—" : (mode === "text" ? textAbjad.letters : ["self", "mother", "house"].reduce((s, k) => s + (useName[k] ? nameAbjad[k].letters : 0), 0)) || "—"} />
            <Stat ar={el ? el.ar : "الطبع"} label={txt("മൂലകം", "Element")} value={el ? (lang === "en" ? el.en : el.ml) : "—"} />
          </div>
          {el && <Note color="rgba(255,255,255,0.5)">{txt(`മൂലകം: തുക ${N}-നെ 4 കൊണ്ട് ഹരിച്ചാൽ ബാക്കി ${N % 4} → ${el.ml} (1 അഗ്നി, 2 മണ്ണ്, 3 വായു, 0 ജലം).`, `Element: ${N} ÷ 4 leaves ${N % 4} → ${el.en} (1 fire, 2 earth, 3 air, 0 water).`)}</Note>}
        </Box>

        {/* 2. Square */}
        <Box step="2" title={txt("കള്ളി തിരഞ്ഞെടുക്കുക", "Choose the square")}>
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
            `Key = (${N} − ${asOf(n) * step}) ÷ ${n} = ${plan.key}${plan.rem ? `, remainder ${plan.rem} → jabr house (${n} − ${plan.rem}) × ${n} + 1 = ${plan.jabrHouse}; from it on, one extra in each house` : ""}.`)}</Note>}
          {plan?.issues.includes("too_small") && <Note color="#FCA5A5">{txt("ഈ കള്ളിക്ക് തുക വളരെ ചെറുതാണ്; ചെറിയ കള്ളി എടുക്കുക.", "The total is too small for this square; choose a smaller one.")}</Note>}
          {plan?.issues.includes("m3_jabr_diagonal") && <Note color="#FCA5A5">{txt(
            `3×3-ൽ ബാക്കി ${plan.rem} വരുന്നു. ജബ്ർ ചെയ്താലും ഒരു കോൺ ശരിയാകില്ല. ശരിയാകുന്ന കള്ളികൾ: ${good.map((s) => `${s}×${s}`).join(", ") || "—"}.`,
            `3×3 leaves remainder ${plan.rem}; even with jabr one diagonal stays off. Working squares: ${good.map((s) => `${s}×${s}`).join(", ") || "—"}.`)}</Note>}
          {!plan?.issues.length && N > 0 && !good.includes(n) && <Note color="#FCA5A5">{txt(`ഈ തുകയ്ക്ക് ${n}×${n} ശരിയാകില്ല. ശരിയാകുന്നവ: ${good.map((s) => `${s}×${s}`).join(", ")}.`, `${n}×${n} does not work for this total. Working: ${good.map((s) => `${s}×${s}`).join(", ")}.`)}</Note>}
        </Box>

        {/* 3. Purpose and time */}
        <Box step="3" title={txt("ഉദ്ദേശ്യവും സമയവും", "Purpose and time")}>
          <div className="flex flex-wrap gap-1.5">
            {PURPOSES.map((p) => (
              <button key={p.id} type="button" onClick={() => { setPurposeId(p.id === purposeId ? null : p.id); setTimeSel(null); }}
                className="px-2.5 py-1.5 rounded-xl font-inter text-[11px] font-bold" style={btn(purposeId === p.id)}>
                <span className="font-amiri text-sm mr-1">{p.ar}</span>{lang === "en" ? p.en : p.ml}
              </button>
            ))}
          </div>
          {!purpose && <Note color="rgba(255,255,255,0.45)">{txt("ഉദ്ദേശ്യം തിരഞ്ഞെടുത്താൽ അതിന് പറ്റിയ അടുത്ത സമയങ്ങൾ കാണിക്കും. സമയം തിരഞ്ഞെടുക്കാതെയും കള്ളി ഉണ്ടാക്കാം.", "Pick a purpose to see its next suitable times. You can also build without choosing a time.")}</Note>}
          {purpose && (
            <div className="space-y-2">
              {times.length === 0 && <Note>{txt("സമയം കണ്ടെത്താനായില്ല.", "No time found.")}</Note>}
              {times.map((t, ti) => {
                const mn = K.MANSIONS[t.m];
                const tp = K.MANSION_PURPOSE[t.m];
                return (
                  <div key={t.m} className="rounded-xl p-2.5 space-y-1" style={{ background: "rgba(147,197,253,0.05)", border: "1px solid rgba(147,197,253,0.2)" }}>
                    <Note color={INK}>🌙 <b>{txt("ഖമർ", "Qamar in")} {lang === "en" ? K.MANSIONS_EN[t.m].name : mn.ml}</b> <Ar>{mn.ar}</Ar>{txt(" മൻസിലിൽ", "")} · {t.span.current ? txt(`ഇപ്പോൾ — ${fmtWhen(t.span.end, loc, false)} വരെ`, `now — until ${fmtWhen(t.span.end, loc, true)}`) : fmtSpan(t.span, loc, lang === "en")}</Note>
                    {tp && <Note color="#4ADE80">📋 {txt("കിതാബിലെ പ്രവൃത്തിപ്പട്ടിക", "Book's table of works")}: <Ar>{tp.ar}</Ar> — {lang === "en" ? tp.en : tp.ml}</Note>}
                    <Note color="rgba(255,255,255,0.5)">{t.best ? txt("ഖലീലി പറഞ്ഞ ഏറ്റവും നല്ല സാഅത്തുകൾ:", "al-Khalili's best hours:") : txt("ഖലീലി സാഅത്ത് പറയാത്തതിനാൽ സഅ്ദ് ഗ്രഹങ്ങളുടെ (വ്യാഴം, ശുക്രൻ, സൂര്യൻ) സാഅത്തുകൾ:", "al-Khalili names no hour here, so the sa'd planets' hours (Jupiter, Venus, Sun):")}</Note>
                    <div className="flex flex-wrap gap-1.5">
                      {t.hours.map((h, hi) => {
                        const on = timeSel && timeSel[0] === ti && timeSel[1] === hi;
                        return (
                          <button key={hi} type="button" onClick={() => setTimeSel(on ? null : [ti, hi])} className="px-2 py-1.5 rounded-lg font-inter text-[10px] text-left" style={btn(on)}>
                            <b>{lang === "en" ? K.PLANETS[h.planet].tr_en : K.PLANETS[h.planet].tr_ml}</b> <span className="font-amiri">{K.PLANETS[h.planet].ar}</span><br />
                            {fmtSpan(h, loc, lang === "en")}
                            {h.nahsDay && <span style={{ color: "#FCA5A5" }}><br />⚠ {txt("നഹ്സ് ദിവസം", "nahs day")}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {selHour && <Note color={GOLD}>✓ {txt("തിരഞ്ഞെടുത്ത സമയം", "Chosen time")}: {fmtSpan(selHour, loc, lang === "en")} · {txt("ദിവസം", "day")}: {lang === "en" ? WD_EN[selHour.wd] : WD_ML[selHour.wd]}</Note>}
        </Box>

        {/* 4. Build */}
        <Box step="4" title={txt("കള്ളി ഉണ്ടാക്കുക", "Build the wafq")}>
          <div className="flex flex-wrap items-center gap-3 font-inter text-[10px]">
            {n <= 4 && (
              <div className="flex flex-wrap items-center gap-1">
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{txt("രൂപം", "Form")}:</span>
                {[["auto", txt(`നാമത്തിന്റെ മൂലകം${el ? ` (${el.ml})` : ""}`, `Total's element${el ? ` (${el.en})` : ""}`)], ["base", txt("അടിസ്ഥാനം", "Base")],
                  ["fire", lang === "en" ? "Fire" : "അഗ്നി"], ["air", lang === "en" ? "Air" : "വായു"], ["water", lang === "en" ? "Water" : "ജലം"], ["earth", lang === "en" ? "Earth" : "മണ്ണ്"]].map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setForm(k)} className="px-2 py-1 rounded-lg font-bold" style={btn(form === k)}>{l}</button>
                ))}
              </div>
            )}
            <label className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              {txt("ചുവട് (تفاضل)", "Step (tafāḍul)")}
              <input type="number" min={1} max={99} value={step} onChange={(e) => setStep(Math.max(1, Math.min(99, parseInt(e.target.value || "1", 10))))} className="w-14 rounded-lg px-2 py-1" style={input} />
            </label>
            <label className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              <input type="checkbox" checked={bismi} onChange={(e) => setBismi(e.target.checked)} /> {txt("മുകളിൽ ബിസ്മി", "Bismillah on top")}
            </label>
          </div>
          {n > 4 && <Note color="rgba(255,255,255,0.45)">{txt("കിതാബ് മൂലക രൂപങ്ങൾ നൽകുന്നത് 3×3, 4×4 കള്ളികൾക്കു മാത്രമാണ്; വലിയ കള്ളികൾ അടിസ്ഥാന രൂപത്തിലാണ്.", "The book gives element forms only for 3×3 and 4×4; larger squares use the base form.")}</Note>}
          <button type="button" onClick={generate} disabled={!(N > 0)} className="w-full py-3 rounded-xl font-inter text-sm font-bold uppercase tracking-[0.2em]"
            style={{ background: N > 0 ? "linear-gradient(135deg,rgba(212,175,55,0.35),rgba(212,175,55,0.15))" : "rgba(255,255,255,0.04)", color: N > 0 ? "#fff6d6" : "rgba(255,255,255,0.3)", border: "1px solid rgba(212,175,55,0.55)" }}>
            ۞ {txt("കള്ളി ഉണ്ടാക്കുക", "Build the wafq")}
          </button>
        </Box>

        {result && (
          <div id="wafq-result" className="space-y-3" style={{ scrollMarginTop: 72 }}>
            {/* Numbers */}
            <Box title={`${SIZE_NAME[result.n].ar} · ${result.n}×${result.n} · N = ${result.N}`} tone={result.valid ? "ok" : "warn"}>
              <Grid grid={result.grid} />
              <SumsCheck result={result} txt={txt} />
              <Note color={result.valid ? "#4ADE80" : "#FCA5A5"}>{result.valid
                ? txt("എല്ലാ വരിയും നിരയും രണ്ടു കോണും ഒരേ തുക — കള്ളി ശരി.", "Every row, column and both diagonals agree — the wafq is correct.")
                : txt("ചില വരികൾ തുല്യമല്ല (✗). മുകളിൽ ✓ ഉള്ള മറ്റൊരു കള്ളി എടുക്കുക.", "Some lines differ (✗). Choose a square marked ✓ above.")}</Note>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <Stat ar="الوفق" value={result.N} />
                <Stat ar="المفتاح" value={result.miftah} />
                <Stat ar="المغالق" value={result.maghaliq} />
                <Stat ar="العدل" value={result.miftah + result.maghaliq} />
                <Stat ar="المساحة" value={result.masaha} />
                <Stat ar="الضابط" value={result.N + result.masaha} />
              </div>
              <Note color="rgba(255,255,255,0.45)">{txt("വിഭാഗം", "Class")}: <Ar size="text-sm">{SQUARE_CLASS(result.n)}</Ar>
                {result.step > 1 ? ` · ${txt("ചുവട്", "step")} ${result.step}` : ""}
                {result.rem ? ` · ${txt("ജബ്ർ വീട്", "jabr house")} ${result.jabrHouse}` : ""}
                {result.n <= 4 ? ` · ${txt("രൂപം", "form")}: ${result.form === "base" ? txt("അടിസ്ഥാനം", "base") : (lang === "en" ? ELEMENTS[result.form].en : ELEMENTS[result.form].ml)}` : ""}</Note>
              <button type="button" onClick={copyText} className="px-3 py-1 rounded-lg font-inter text-[10px] font-bold" style={btn(copied)}>{copied ? txt("പകർത്തി ✓", "Copied ✓") : txt("സംഖ്യകൾ പകർത്തുക", "Copy numbers")}</button>
            </Box>

            {/* Writing */}
            <Box step="5" title={txt("എഴുതേണ്ട രൂപവും ക്രമവും", "How and in what order to write it")}>
              {bismi && <p className="font-amiri text-2xl text-center" style={{ color: INK }}>بسم الله الرحمن الرحيم</p>}
              <Grid grid={result.grid} arabic active={writeIdx >= 0 && writeIdx < order.length ? order[writeIdx] : null}
                done={writeIdx < 0 || writeIdx >= order.length ? null : doneSet}
                cellNote={result.n === 3 ? result.houses.flat().map((h) => HOUSE_LETTERS[h - 1]) : null} />
              {bismi && <Note color="rgba(255,255,255,0.4)">{txt("മുകളിലെ ബിസ്മി നിങ്ങളുടെ രീതിയാണ്; അവ്ഫാഖ് അധ്യായത്തിൽ അങ്ങനെ ഒരു നിയമം കിതാബ് പറയുന്നില്ല.", "The Bismillah on top is your practice; the awfaq chapter does not give it as a rule.")}</Note>}
              <Note>{txt(
                "ഏറ്റവും ചെറിയ സംഖ്യ (മിഫ്താഹ്) ആദ്യം അലിഫിന്റെ വീട്ടിൽ; പിന്നെ ഓരോന്നായി കൂട്ടി ക്രമത്തിൽ, ഏറ്റവും വലിയ സംഖ്യ (മഗാലിഖ്) അവസാനം.",
                "The smallest number (the key) goes first, in the house of alif; then each next number in order, the largest (maghaliq) last.")}</Note>
              {writeIdx >= 0 && writeIdx < order.length && (() => {
                const k = order[writeIdx], h = result.houses.flat()[k], v = result.grid.flat()[k];
                const r = Math.floor(k / result.n) + 1, c = k % result.n + 1;
                return (
                  <div className="rounded-xl p-3 text-center space-y-1" style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.4)" }}>
                    <Note color={INK}>{txt(`വീട് ${h} / ${result.n * result.n}`, `House ${h} of ${result.n * result.n}`)} · {txt(`വരി ${r}, നിര ${c}`, `row ${r}, column ${c}`)}{result.n === 3 ? <> · <Ar>{HOUSE_LETTERS[h - 1]}</Ar></> : null}</Note>
                    <p className="font-amiri text-4xl" style={{ color: GOLD }}>{toArabicDigits(v)}</p>
                    {result.n === 3 && <Note>{txt("ഈ വീട് എഴുതുമ്പോൾ ചൊല്ലേണ്ടത്", "Recite while writing this house")}: <Ar size="text-lg">{HOUSE_RECITE[h]}</Ar></Note>}
                  </div>
                );
              })()}
              <div className="flex gap-2">
                <button type="button" onClick={() => setWriteIdx((i) => Math.max(-1, i - 1))} disabled={writeIdx < 0} className="flex-1 py-2 rounded-xl font-inter text-xs font-bold" style={btn(false)}>← {txt("മുമ്പത്തേത്", "Back")}</button>
                <button type="button" onClick={() => setWriteIdx((i) => Math.min(order.length, i + 1))} className="flex-1 py-2 rounded-xl font-inter text-xs font-bold" style={btn(true)}>
                  {writeIdx < 0 ? txt("എഴുത്ത് തുടങ്ങുക", "Start writing") : writeIdx >= order.length - 1 ? txt("പൂർത്തിയായി ✓", "Done ✓") : `${txt("അടുത്തത്", "Next")} →`}
                </button>
              </div>
              {result.n !== 3 && <Note color="rgba(255,255,255,0.45)">{txt("ഓരോ വീട്ടിലും ചൊല്ലേണ്ട പേരുകൾ കിതാബ് നൽകുന്നത് 3×3-ന് മാത്രമാണ്.", "The book gives names to recite per house only for the 3×3.")}</Note>}
            </Box>

            {/* Angels */}
            {(() => {
              const e = ELEMENTS[result.element];
              return (
                <Box title={txt("മലക്കുകൾ", "Angels")}>
                  <div className="grid grid-cols-2 gap-2">
                    <Stat ar={DAY_ANGEL[dayForAngel]} label={txt(`ദിവസത്തിന്റെ മലക്ക് — ${WD_ML[dayForAngel]}`, `Angel of the day — ${WD_EN[dayForAngel]}`)} value={<span className="font-amiri text-lg">{DAY_ANGEL[dayForAngel]}</span>} />
                    <Stat ar={e.ar} label={txt(`മൂലകത്തിന്റെ മലക്ക് — ${e.ml}`, `Angel of the element — ${e.en}`)} value={<span className="font-amiri text-lg">{e.angel}</span>} />
                  </div>
                  <Note color="rgba(255,255,255,0.5)">{txt(
                    `ദിവസത്തിന്റെ മലക്ക് ${selHour ? "തിരഞ്ഞെടുത്ത സമയത്തിന്റെ" : "ഇന്നത്തെ"} ദിവസം അനുസരിച്ചാണ് (സമയം മാറ്റിയാൽ ഇതും മാറും). മൂലകത്തിന്റെ മലക്ക് തുകയുടെ മൂലകം അനുസരിച്ച് സ്ഥിരമാണ്.`,
                    `The angel of the day follows ${selHour ? "the chosen time's" : "today's"} day (it changes with the time). The element's angel is fixed by the total's element.`)}</Note>
                  {result.n === 3 && (
                    <div className="overflow-x-auto">
                      <table className="w-full font-inter text-[10px]" style={{ color: "rgba(245,234,212,0.85)" }}>
                        <thead><tr style={{ color: GOLD }}>
                          {[txt("വീട്", "House"), txt("സംഖ്യ", "Number"), txt("ചൊല്ലേണ്ടത്", "Recite"), txt("ഗ്രഹം", "Planet"), txt("മലക്ക്", "Angel")].map((h) => <th key={h} className="p-1 text-left">{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {LETTER_TABLE.map((r, i) => {
                            const pos = result.houses.flat().indexOf(i + 1);
                            return (
                              <tr key={r.l} style={{ borderTop: "1px solid rgba(212,175,55,0.12)" }}>
                                <td className="p-1 font-amiri text-base">{i + 1} {r.l}</td>
                                <td className="p-1 font-bold">{result.grid.flat()[pos]}</td>
                                <td className="p-1 font-amiri text-sm">{HOUSE_RECITE[i + 1]}</td>
                                <td className="p-1 font-amiri text-sm">{r.planet}</td>
                                <td className="p-1 font-amiri text-sm">{r.angel}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Box>
              );
            })()}

            {/* Element details */}
            {(() => {
              const e = ELEMENTS[result.element];
              return (
                <Box title={txt("മൂലകം, ദിശ, ലോഹം", "Element, direction, metal")}>
                  <div className="grid grid-cols-3 gap-2">
                    <Stat ar={e.ar} label={txt("മൂലകം", "Element")} value={lang === "en" ? e.en : e.ml} />
                    <Stat ar="الجهة" label={txt("മുഖം തിരിക്കേണ്ട ദിശ", "Face towards")} value={lang === "en" ? { fire: "East", air: "West", water: "North", earth: "South" }[result.element] : { fire: "കിഴക്ക്", air: "പടിഞ്ഞാറ്", water: "വടക്ക്", earth: "തെക്ക്" }[result.element]} />
                    <Stat ar="البروج" label={txt("ബുർജുകൾ", "Signs")} value={<span className="text-[11px]">{lang === "en" ? e.burj_en : e.burj_ml}</span>} />
                  </div>
                  {!e.harmful && <Note>{txt("ഈ മൂലക വഫ്ഖിന് കിതാബ് പറയുന്ന ഉപയോഗം", "Use the book gives for this element's wafq")}: <Ar>{e.use_ar}</Ar> — {lang === "en" ? e.use_en : e.use_ml}</Note>}
                  <Note color="rgba(255,255,255,0.5)">{txt(
                    `ദിശ നിബന്ധന 18 പ്രകാരം; സംശയമെങ്കിൽ പടിഞ്ഞാറോ ഖിബ്‌ലയോ. ലോഹത്തിൽ എഴുതുമ്പോൾ ഭാരം ${result.n} ഗ്രാം (കള്ളിയുടെ ക്രമം); അല്ലെങ്കിൽ കടലാസ്.`,
                    `Direction per condition 18; if unsure, west or the qibla. On metal, weight ${result.n} g (the square's order); otherwise paper.`)}</Note>
                </Box>
              );
            })()}

            {result.hollow?.ok && (
              <Box title={txt("നടുവ് ഒഴിഞ്ഞ 3×3 (مثلث خالي الوسط)", "Hollow-centre 3×3")}>
                <Grid grid={result.hollow.grid} arabic />
                <Note color="rgba(255,255,255,0.5)">{txt(`നടുവിലെ ه ഒഴിച്ചിടുന്നു; ഓരോ വരിയും നിരയും ${result.N}.`, `Centre ه left empty; each row and column ${result.N}.`)}</Note>
              </Box>
            )}

            <Box title={txt("എഴുതുമ്പോൾ ഓർക്കേണ്ടത് (കിതാബിലെ നിബന്ധനകൾ)", "While writing (the book's conditions)")}>
              <ul className="list-disc pl-5 space-y-1 font-inter text-xs" style={{ color: "rgba(245,234,212,0.85)" }}>
                <li>{txt("തുടങ്ങുംമുമ്പ് രണ്ട് റക്അത്ത്, ഇസ്തിഗ്ഫാർ, സ്വലാത്ത്; ആവശ്യമെങ്കിൽ ഇസ്തിഖാറ.", "Before starting: two rak'at, istighfar, salawat; istikhara if needed.")}</li>
                <li>{txt("വശങ്ങൾ സമം, വരകൾ നേരെ, വീടുകൾ ഒരേ വലിപ്പം; അക്ഷരവും അക്കവും ഭംഗിയായി, വ്യക്തമായി; എഴുതുന്നത് ഉച്ചരിക്കുക.", "Equal sides, straight lines, equal houses; clear, beautiful letters and digits; say what you write.")}</li>
                <li>{txt("ഇരുണ്ട, ചെറിയ സ്ഥലം; ഭക്ഷണം കുറയ്ക്കുക; ശ്രദ്ധ വിടാതെ, തെറ്റില്ലാതെ.", "A dark, small place; eat little; stay present, without error.")}</li>
                <li>{txt("വഫ്ഖിന്മേൽ രണ്ട് റക്അത്ത്: الانشراح، القدر. സൂര്യന്റെയും ചന്ദ്രന്റെയും വെളിച്ചം തട്ടരുത്.", "Two rak'at over the wafq with الانشراح and القدر. Keep sun and moon light off it.")}</li>
                <li>{txt("തഖ്‌വ, ഹലാൽ, ഇഖ്‌ലാസ്; അനുവദനീയമായത് മാത്രം തേടുക; ക്ഷമ.", "Taqwa, halal, sincerity; seek only what is permitted; patience.")}</li>
              </ul>
            </Box>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

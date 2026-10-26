import { useMemo, useState } from "react";
import * as P from "@/lib/kashfPurposes";
import { PLANETS, MANSIONS, MANSIONS_EN, WEEKDAYS } from "@/lib/kashfSaatData";
import { getPlanetaryDay } from "@/lib/kashfSaatEngine";
import { getUserLocation } from "@/lib/astroClockSunriseSunset";

// ═══════════════════════════════════════════════════════════════
// What the books say about one purpose, and how far this moment
// answers to it.
//
// Two of the book's own lists meet here: the works each manzil
// chapter names (Kashf pp. 114-136) and the table of a work with its
// day and its hour (pp. 12-13). A purpose is looked up in both.
//
// The reading at the top is a count, not a weighting: how many of
// the conditions the book actually states for this work are met now.
// Where the book states one condition, the count is out of one. No
// condition is invented to pad it, and none is weighed against
// another, because the book does not weigh them.
// ═══════════════════════════════════════════════════════════════

const GOLD = "#F5D060";

const pname = (k, isEn) => (isEn ? PLANETS[k].tr_en : PLANETS[k].tr_ml);
const dname = (d, isEn) => (isEn ? WEEKDAYS[d].en : WEEKDAYS[d].ml);
const mname = (n, isEn) => (isEn ? MANSIONS_EN[n].name : MANSIONS[n].ml);

function Chip({ children, tone = "n" }) {
  const c = tone === "y" ? "#4ADE80" : tone === "x" ? "#F87171" : "rgba(255,255,255,0.55)";
  return (
    <span className="px-2 py-0.5 rounded-lg font-inter text-[10px] font-bold"
          style={{ background: tone === "y" ? "rgba(74,222,128,0.12)"
                          : tone === "x" ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.06)",
                   color: c }}>
      {children}
    </span>
  );
}

export default function PurposePanel({ ml = true }) {
  const isEn = !ml;
  const txt = (m, e) => (isEn ? e : m);
  const [q, setQ] = useState("");
  const [pick, setPick] = useState(null);

  const now = useMemo(() => {
    const loc = getUserLocation();
    const pd = getPlanetaryDay(Date.now(), loc);
    return {
      weekday: pd.day.weekday,
      hourPlanet: pd.current?.planet || null,
      manzil: pd.current?.moon?.mansionNo || null,
    };
  }, []);

  const res = useMemo(() => P.searchAll(q), [q]);
  const all = useMemo(
    () => Object.entries(P.PURPOSES).map(([id, p]) => ({ id, ...p, ...P.manzilsFor(id) })),
    []
  );
  const list = q.trim().length >= 2 ? res.purposes : all;
  const times = q.trim().length >= 2 ? res.times : [];

  const sel = pick ? all.find((x) => x.id === pick) : null;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="font-inter text-[11px] font-bold" style={{ color: GOLD }}>
          {txt("ഉദ്ദേശ്യം — കിതാബിൽ തിരയുക", "The purpose — search the book")}
        </p>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPick(null); }}
          placeholder={txt("സമ്പത്ത്, ജിന്ന്, യാത്ര, ഉപദ്രവം…", "provision, jinn, travel, harm…")}
          className="w-full rounded-xl px-3 py-2 font-inter text-xs"
          style={{ background: "rgba(0,0,0,0.25)", color: "#f5ead4",
                   border: "1px solid rgba(212,175,55,0.25)" }} />
        <p className="font-inter text-[10px]" style={{ color: "rgba(245,234,212,0.5)" }}>
          {txt(`കിതാബ് പേരെടുത്തു പറയുന്ന ${all.length} കർമ്മങ്ങളിലും പേ. 12-13-ലെ സമയപ്പട്ടികയിലും തിരയുന്നു. കിതാബിൽ ഇല്ലാത്ത ഒന്നും ഇവിടെ വരില്ല.`,
               `Searches the ${all.length} works the book names and the day-and-hour table on pp. 12-13. Nothing the book does not name appears here.`)}
        </p>
      </div>

      {/* the day-and-hour table rows that match what was typed */}
      {times.length > 0 && (
        <div className="rounded-xl p-3 space-y-1.5"
             style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.22)" }}>
          <p className="font-inter text-[10px] font-bold" style={{ color: GOLD }}>
            {txt("കിതാബ് ദിവസവും സാഅത്തും പറയുന്നത്", "The book names a day and an hour")}{" "}
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
              ({txt("പേ.", "pp.")}{P.WORK_TIMES_SOURCE.page})
            </span>
          </p>
          {times.map((w) => {
            const dayOk = w.day === now.weekday;
            const hourOk = w.hour === now.hourPlanet;
            return (
              <div key={w.i} className="space-y-0.5">
                <p className="font-inter text-[11px]"
                   style={{ color: w.harm ? "#FCA5A5" : "rgba(255,255,255,0.85)" }}>
                  {isEn ? w.en : w.ml} <span className="font-amiri" style={{ color: GOLD }}>{w.ar}</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  <Chip tone={dayOk ? "y" : "n"}>
                    {dname(w.day, isEn)} {dayOk ? (isEn ? "— today" : "— ഇന്ന്") : ""}
                  </Chip>
                  <Chip tone={hourOk ? "y" : "n"}>
                    {pname(w.hour, isEn)} {txt("സാഅത്ത്", "hour")} {hourOk ? (isEn ? "— now" : "— ഇപ്പോൾ") : ""}
                  </Chip>
                  <Chip tone={dayOk && hourOk ? "y" : "n"}>
                    {dayOk + hourOk}/2 {txt("ഒത്തു", "met")}
                  </Chip>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* the works the manzil chapters name */}
      <div className="flex flex-wrap gap-1.5">
        {list.map((p) => (
          <button key={p.id} type="button"
                  onClick={() => setPick(pick === p.id ? null : p.id)}
                  className="px-2 py-1 rounded-lg font-inter text-[10px] font-bold text-left"
                  style={{
                    background: pick === p.id ? "rgba(212,175,55,0.18)" : "transparent",
                    color: p.harm ? "#FCA5A5" : pick === p.id ? GOLD : "rgba(255,255,255,0.65)",
                    border: `1px solid ${pick === p.id ? "rgba(212,175,55,0.55)" : "rgba(212,175,55,0.2)"}`,
                  }}>
            {p.harm ? "⚠ " : ""}{isEn ? p.en : p.ml}
          </button>
        ))}
        {list.length === 0 && times.length === 0 && (
          <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            {txt("കിതാബ് ഈ പേരിൽ ഒരു കർമ്മവും പറയുന്നില്ല. വേറൊരു വാക്കിൽ നോക്കുക.",
                 "The book names no work under that word. Try another.")}
          </p>
        )}
      </div>

      {list.length === 0 && times.length > 0 && (
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          {txt("ഈ കർമ്മത്തിന് ദിവസവും സാഅത്തും കിതാബ് പറയുന്നുണ്ട്; മൻസിലുകളുടെ ഖണ്ഡികകളിൽ ഈ പേരിൽ ഒന്നും വരുന്നില്ല.",
               "The book names a day and an hour for this work; the manzil chapters name nothing under that word.")}
        </p>
      )}

      {sel && <Selected p={sel} now={now} isEn={isEn} txt={txt} />}
    </div>
  );
}

function Selected({ p, now, isEn, txt }) {
  const inGood = now.manzil != null && p.good.includes(now.manzil);
  const inAvoid = now.manzil != null && p.avoid.includes(now.manzil);
  return (
    <div className="rounded-xl p-3 space-y-2"
         style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.22)" }}>
      <p className="font-inter text-xs font-bold"
         style={{ color: p.harm ? "#FCA5A5" : GOLD }}>
        {p.harm ? "⚠ " : ""}{isEn ? p.en : p.ml}{" "}
        <span className="font-amiri">{p.ar}</span>
      </p>

      <div>
        <p className="font-inter text-[10px] font-bold" style={{ color: "#4ADE80" }}>
          {txt("ഈ മൻസിലുകളിൽ നല്ലത്", "Good in these manzils")} ({p.good.length})
        </p>
        <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>
          {p.good.length
            ? p.good.map((n) => `${n} ${mname(n, isEn)}`).join(" · ")
            : txt("ഒന്നുമില്ല", "none")}
        </p>
      </div>

      {p.avoid.length > 0 && (
        <div>
          <p className="font-inter text-[10px] font-bold" style={{ color: "#F87171" }}>
            {txt("ഈ മൻസിലുകളിൽ പറ്റില്ല", "Not good in these manzils")} ({p.avoid.length})
          </p>
          <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>
            {p.avoid.map((n) => `${n} ${mname(n, isEn)}`).join(" · ")}
          </p>
        </div>
      )}

      <div className="pt-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="font-inter text-[11px] font-bold"
           style={{ color: inGood ? "#4ADE80" : inAvoid ? "#F87171" : "rgba(255,255,255,0.6)" }}>
          {now.manzil == null
            ? txt("ചന്ദ്രന്റെ സ്ഥാനം ഇപ്പോൾ അറിയില്ല", "The Moon's place is not known just now")
            : inGood
            ? txt(`ഇപ്പോൾ ചന്ദ്രൻ മൻസിൽ ${now.manzil} ${mname(now.manzil, isEn)}-ൽ — ഇതിന് നല്ലത് ✓`,
                  `The Moon is now in manzil ${now.manzil} ${mname(now.manzil, isEn)} — good for this ✓`)
            : inAvoid
            ? txt(`ഇപ്പോൾ ചന്ദ്രൻ മൻസിൽ ${now.manzil} ${mname(now.manzil, isEn)}-ൽ — ഇതിന് പറ്റില്ല ✗`,
                  `The Moon is now in manzil ${now.manzil} ${mname(now.manzil, isEn)} — not good for this ✗`)
            : txt(`ഇപ്പോൾ ചന്ദ്രൻ മൻസിൽ ${now.manzil} ${mname(now.manzil, isEn)}-ൽ — ഈ കർമ്മത്തെക്കുറിച്ച് ഈ മൻസിലിന്റെ ഖണ്ഡിക ഒന്നും പറയുന്നില്ല`,
                  `The Moon is now in manzil ${now.manzil} ${mname(now.manzil, isEn)} — that manzil's chapter says nothing about this work`)}
        </p>
        <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          {txt(`കശ്ഫ് പേ. ${P.PURPOSE_SOURCE.pages} — ഓരോ മൻസിലിന്റെയും ഖണ്ഡികയിൽ നിന്ന്`,
               `Kashf pp. ${P.PURPOSE_SOURCE.pages} — from each manzil's own chapter`)}
        </p>
      </div>
    </div>
  );
}

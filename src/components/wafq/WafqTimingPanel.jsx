import { useMemo, useState } from "react";
import { getUserLocation } from "@/lib/astroClockSunriseSunset";
import { fmtWhen } from "@/lib/kashfNextTimes";
import { PLANETS, MANSIONS, MANSIONS_EN, MANSION_WORK, SIGNS_TR_ML, SIGNS_TR_EN } from "@/lib/kashfSaatData";
import { WORK_TIMES } from "@/lib/kashfPurposes";
import { KAHIR_CONDITIONS, KAHIR_ENOUGH } from "@/lib/wafqWorkTiming";
import { isKahirWork, nextOpenings, readNow, readDay, msForDate, TIERS, byStrength, COMPANION_SOURCE, companionsOf, nextBookDay } from "@/lib/wafqTimingScan";

// ═══════════════════════════════════════════════════════════════
// The timing panel under the square — docs/sirr-al-wafq-timing.md §7,
// items 1, 2 and 3, in the owner's order:
//
//   the work's day and hour first; the strongest is that hour being
//   the day's own; then when that comes again; then, failing it, the
//   hours the book allows that kind of work (the "companion"). The
//   Moon only ever adds strength (✦) — it never closes a time.
//
// Every step names its book and page (TIERS in wafqTimingScan.js).
// ═══════════════════════════════════════════════════════════════

const GOLD = "#F5D060";
const DIM = "rgba(255,255,255,0.55)";
const WD_ML_FULL = ["ഞായറാഴ്ച", "തിങ്കളാഴ്ച", "ചൊവ്വാഴ്ച", "ബുധനാഴ്ച", "വ്യാഴാഴ്ച", "വെള്ളിയാഴ്ച", "ശനിയാഴ്ച"];
const WD_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIER_COLOR = { 1: "#4ADE80", 2: GOLD, 3: "#FDBA74", 4: "#93C5FD", 5: "rgba(255,255,255,0.75)" };

const box = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.22)" };

const t2 = (isEn, ml, en) => (isEn ? en : ml);

function Mark({ v }) {
  const c = v === true ? "#4ADE80" : v === false ? "#F87171" : DIM;
  return <span className="font-bold" style={{ color: c }}>{v === true ? "✓" : v === false ? "✗" : "—"}</span>;
}

/** One hour as a line: its step on the ladder, when, which hour, the Moon's ✦. */
function HourLine({ r, isEn, loc, open, onToggle }) {
  const p = PLANETS[r.planet];
  const per = r.period === "night" ? (isEn ? "night" : "രാത്രി") : (isEn ? "day" : "പകൽ");
  return (
    <li>
      <button type="button" onClick={onToggle}
              className="w-full text-left rounded-lg px-2 py-1.5 font-inter text-[11px]"
              style={{ background: open ? "rgba(212,175,55,0.10)" : "transparent",
                       border: `1px solid ${open ? "rgba(212,175,55,0.45)" : "rgba(212,175,55,0.15)"}` }}>
        <span className="font-bold" style={{ color: TIER_COLOR[r.tier] || DIM }}>
          {r.tier ? (isEn ? `Step ${r.tier}` : `പടി ${r.tier}`) : (isEn ? "Not on the ladder" : "പടിയിലില്ല")}
        </span>
        {r.boost.n > 0 && <span style={{ color: GOLD }}> {"✦".repeat(r.boost.n)}</span>}
        {r.light && (
          <span style={{ color: DIM }}>
            {" "}☾ {r.light.waxing ? t2(isEn, `വളർച്ച ${r.light.lit}%`, `waxing ${r.light.lit}%`) : t2(isEn, `ക്ഷയം ${r.light.waned}%`, `waning ${r.light.waned}%`)}
          </span>
        )}{" "}
        <span style={{ color: "rgba(255,255,255,0.85)" }}>{fmtWhen(r.start, loc, isEn)}</span>{" "}
        <span style={{ color: DIM }}>
          · {p.symbol} {isEn ? p.tr_en : p.tr_ml} · {per} {r.num}
          {r.current ? (isEn ? " · now" : " · ഇപ്പോൾ") : ""}
        </span>
      </button>
      {open && <WhatTheBookSays r={r} isEn={isEn} />}
    </li>
  );
}

/** Item 2: the moment opened — its step, the Moon, and the book's words. */
function WhatTheBookSays({ r, isEn }) {
  const t = (ml, en) => (isEn ? en : ml);
  const m = r.moon;
  const work = m ? MANSION_WORK[m.mansionNo] : null;
  const tier = r.tier ? TIERS[r.tier] : null;
  return (
    <div className="mt-1 ml-2 rounded-lg p-2 space-y-1.5 font-inter text-[11px]" style={box}>
      {tier ? (
        <p style={{ color: TIER_COLOR[r.tier] }}>
          {t(`പടി ${r.tier}`, `Step ${r.tier}`)}: {isEn ? tier.en : tier.ml}
        </p>
      ) : (
        <p style={{ color: DIM }}>
          {t("ഈ സാഅത്ത് ഈ കർമ്മത്തിന് കിതാബിന്റെ ഒരു പടിയിലും വരുന്നില്ല.", "This hour stands on none of the book's steps for this work.")}
        </p>
      )}

      {m && (
        <p style={{ color: "rgba(255,255,255,0.75)" }}>
          {t("ചന്ദ്രൻ", "Moon")}: {t("മൻസിൽ", "manzil")} {m.mansionNo}{" "}
          {isEn ? MANSIONS_EN[m.mansionNo]?.name : MANSIONS[m.mansionNo]?.ml}
          {work && <> — <span className="font-amiri">{work.nature}</span>, {isEn ? work.en : work.ml}</>}
          {" · "}{isEn ? SIGNS_TR_EN[m.sign] : SIGNS_TR_ML[m.sign]}
          {" · "}{m.waxing ? t("വളരുന്നു", "waxing") : t("ക്ഷയിക്കുന്നു", "waning")}
        </p>
      )}
      {r.light && (
        <p style={{ color: "rgba(255,255,255,0.75)" }}>
          ☾ {t(`ചന്ദ്രന്റെ പ്രകാശം ${r.light.lit}%`, `The Moon ${r.light.lit}% lit`)}
          {r.light.waxing
            ? t(" — വളരുന്നു", " — waxing")
            : t(` — ക്ഷയം ${r.light.waned}% (പൗർണ്ണമിയിൽ 0%, അമാവാസിയിൽ 100%)`,
                ` — waned ${r.light.waned}% (0% at full, 100% at new)`)}
        </p>
      )}
      {r.boost.manzil && (
        <p style={{ color: GOLD }}>
          ✦ {r.kind === "kahir"
            ? t("ചന്ദ്രൻ നഹ്സായ മൻസിലിലോ മിർരീഖിന്റെ മൻസിലിലോ — ഈ കർമ്മത്തിന് കൂടുതൽ ശക്തി",
                "The Moon in a nahs manzil or one of Mars — more strength for this work")
            : t("ചന്ദ്രൻ, തിരഞ്ഞെടുത്ത ഉദ്ദേശ്യത്തിന് കിതാബ് പറയുന്ന മൻസിലിൽ — കൂടുതൽ ശക്തി",
                "The Moon in a manzil the book names for the chosen purpose — more strength")}
        </p>
      )}
      {r.boost.phase && (
        <p style={{ color: GOLD }}>
          ✦ {r.kind === "kahir"
            ? t("ചന്ദ്രൻ ക്ഷയിക്കുന്നു — ഈ തരം കർമ്മത്തിന് യോജിച്ചത്", "The Moon wanes — as this kind of work wants")
            : t("ചന്ദ്രൻ വളരുന്നു — നല്ല കർമ്മത്തിന് യോജിച്ചത്", "The Moon waxes — as a good work wants")}
        </p>
      )}
      {r.sameSign && (
        <p style={{ color: "#FDBA74" }}>
          {t("ശംസും ഖമറും ഒരേ ബുർജിൽ. ഈ സമയത്ത് പൊതുവെ ഒരു വഫ്ഖും ഉണ്ടാക്കാറില്ല.",
             "The Sun and Moon share a sign. As a general rule no wafq is made at this time.")}
        </p>
      )}
      {r.fallDet && (
        <p style={{ color: DIM }}>
          {r.fallDet === "hubut" ? t("ചന്ദ്രൻ ഹുബൂത്വിൽ", "The Moon in its fall") : t("ചന്ദ്രൻ വബാലിൽ", "The Moon in its detriment")}
          {t(" — ജനനസമയത്തല്ലാതെ ഇത് പരിഗണിക്കേണ്ടതില്ല; അറിയിക്കുക മാത്രം.",
             " — this counts only at a birth; reported only.")}
        </p>
      )}

      {r.kind === "kahir" && (
        <div className="pt-1 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ color: DIM }}>{t("കിതാബിലെ നിബന്ധനകൾ:", "The book's conditions:")}</p>
          {KAHIR_CONDITIONS.map((c) => (
            <p key={c.id} style={{ color: c.computed ? "rgba(255,255,255,0.85)" : DIM }}>
              <Mark v={c.computed ? r.fit.met[c.id] : null} /> {c.n}. {isEn ? c.en : c.ml}
              {!c.computed && <span style={{ color: DIM }}> — {t("വായിക്കാൻ മാത്രം", "to be read only")}</span>}
            </p>
          ))}
          {r.fit.enough && <p style={{ color: GOLD }}>{isEn ? KAHIR_ENOUGH.en : KAHIR_ENOUGH.ml}</p>}
        </div>
      )}
    </div>
  );
}

export default function WafqTimingPanel({ initialWork = null, mansions = null, ml = true }) {
  const isEn = !ml;
  const t = (m, e) => (isEn ? e : m);
  const loc = getUserLocation();
  const [wi, setWi] = useState(initialWork);
  const [open, setOpen] = useState(null);
  const [date, setDate] = useState("");
  const work = wi != null ? WORK_TIMES[wi] : null;
  const kahir = isKahirWork(work);

  const now = useMemo(() => (work ? readNow(work, Date.now(), loc, mansions) : null), [wi, mansions]);
  const next = useMemo(
    () => (work ? nextOpenings(work, Date.now(), loc, { days: 14, perTier: 3, mansions }) : {}),
    [wi, mansions]
  );
  // With no date typed, the book's own next day for this work is shown.
  const onDate = useMemo(() => {
    if (!work) return null;
    if (!date) return nextBookDay(work, Date.now(), loc, mansions);
    const ms = msForDate(date, loc);
    return ms ? readDay(ms, loc, work, mansions) : null;
  }, [wi, date, mansions]);

  const toggle = (k) => setOpen(open === k ? null : k);

  return (
    <div className="rounded-2xl p-3 space-y-3" style={box}>
      <p className="font-inter text-[11px] font-bold" style={{ color: GOLD }}>
        {t("ഈ കർമ്മത്തിന്റെ സമയം", "When to write it")}
      </p>

      {/* the work, from the book's own table */}
      <div className="space-y-1">
        <p className="font-inter text-[10px]" style={{ color: DIM }}>
          {t("കിതാബിലെ കർമ്മം", "The work, as the book lists it")}
        </p>
        <select value={wi ?? ""} onChange={(e) => { setWi(e.target.value === "" ? null : +e.target.value); setOpen(null); }}
                className="w-full rounded-xl px-3 py-2 font-inter text-xs"
                style={{ background: "rgba(0,0,0,0.25)", color: "#f5ead4", border: "1px solid rgba(212,175,55,0.25)" }}>
          <option value="">{t("— തിരഞ്ഞെടുക്കുക —", "— choose —")}</option>
          {WORK_TIMES.map((w, i) => (
            <option key={i} value={i}>{isEn ? w.en : w.ml}</option>
          ))}
        </select>
        {work && (
          <p className="font-inter text-[11px]" style={{ color: work.harm ? "#FCA5A5" : "rgba(255,255,255,0.8)" }}>
            <span className="font-amiri">{work.ar}</span> —{" "}
            {isEn ? WD_EN[work.day] : WD_ML_FULL[work.day]}, {PLANETS[work.hour].symbol}{" "}
            {isEn ? `${PLANETS[work.hour].tr_en} hour` : `${PLANETS[work.hour].tr_ml} സാഅത്ത്`}
          </p>
        )}
        {kahir && (
          <p className="font-inter text-[10px]" style={{ color: "#FCA5A5" }}>
            {t("⚠ ഇത് ഉപദ്രവകരമായ കർമ്മമാണ്.", "⚠ This is a harmful work.")}
          </p>
        )}
      </div>

      {!work && (
        <p className="font-inter text-[11px]" style={{ color: DIM }}>
          {t("കിതാബ് ദിവസവും സാഅത്തും പറയുന്ന കർമ്മങ്ങളിൽ ഒന്ന് മുകളിൽ തിരഞ്ഞെടുക്കുക. അപ്പോൾ സമയം ഇവിടെ വരും.",
             "Choose one of the works the book gives a day and an hour for. The times will appear here.")}
        </p>
      )}

      {work && (
        <>
          {/* 1a. where this moment stands */}
          <div className="space-y-1">
            <p className="font-inter text-[10px] font-bold" style={{ color: GOLD }}>{t("ഇപ്പോൾ", "Now")}</p>
            {now ? (
              <ul><HourLine r={{ ...now, current: true }} isEn={isEn} loc={loc}
                            open={open === "now"} onToggle={() => toggle("now")} /></ul>
            ) : (
              <p className="font-inter text-[11px]" style={{ color: DIM }}>{t("ഇപ്പോഴത്തെ സാഅത്ത് കണക്കാക്കാനായില്ല.", "The present hour could not be worked out.")}</p>
            )}
          </div>

          {/* 1b. the next times, step by step */}
          <div className="space-y-2">
            <p className="font-inter text-[10px] font-bold" style={{ color: GOLD }}>
              {t("അടുത്ത സമയങ്ങൾ — 14 ദിവസത്തിനുള്ളിൽ, പടി പടിയായി", "The next times — within 14 days, step by step")}
            </p>
            {[1, 2, 3, 4, 5].map((k) => (
              <div key={k} className="space-y-1">
                <p className="font-inter text-[10px]" style={{ color: TIER_COLOR[k] }}>
                  {t(`പടി ${k}`, `Step ${k}`)} — {isEn ? TIERS[k].en : TIERS[k].ml}
                </p>
                {next[k]?.length ? (
                  <ul className="space-y-1">
                    {next[k].map((r) => (
                      <HourLine key={r.start} r={r} isEn={isEn} loc={loc}
                                open={open === r.start} onToggle={() => toggle(r.start)} />
                    ))}
                  </ul>
                ) : (
                  <p className="font-inter text-[10px] ml-2" style={{ color: DIM }}>
                    {t("14 ദിവസത്തിനുള്ളിൽ ഇല്ല.", "None within 14 days.")}
                  </p>
                )}
              </div>
            ))}
            <p className="font-inter text-[10px]" style={{ color: DIM }}>
              {t("✦ = ചന്ദ്രനും ഈ കർമ്മത്തിന് യോജിക്കുന്നു, ആ സമയം കൂടുതൽ ശക്തം. ചന്ദ്രൻ യോജിക്കാത്തത് ഒരു സമയവും തടയുന്നില്ല. ഓരോ സമയത്തിലും തൊട്ടാൽ കിതാബ് പറയുന്നത് കാണാം.",
                 "✦ = the Moon suits this work too, so the time is stronger. A Moon that does not suit closes no time. Tap a time to see what the book says.")}
            </p>
          </div>

          {/* 3. the date box */}
          <div className="space-y-1">
            <p className="font-inter text-[10px] font-bold" style={{ color: GOLD }}>
              {date
                ? t("ഈ ദിവസം ഈ കർമ്മം ചെയ്യാമോ, ഏത് സാഅത്തിൽ?", "Can this work be done on this day, and at what hour?")
                : t("കിതാബ് ഈ കർമ്മത്തിന് പറയുന്ന അടുത്ത ദിവസം — അതിലെ ഏറ്റവും യോജിച്ച സാഅത്തുകൾ", "The next day the book gives for this work — its best hours")}
            </p>
            <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setOpen(null); }}
                   className="rounded-xl px-3 py-1.5 font-inter text-xs"
                   style={{ background: "rgba(0,0,0,0.25)", color: "#f5ead4", border: "1px solid rgba(212,175,55,0.25)" }} />
            {onDate && <DateAnswer d={onDate} work={work} isEn={isEn} loc={loc} open={open} toggle={toggle} />}
          </div>

          {/* the companion rule in the book's words */}
          <div className="space-y-1 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="font-inter text-[10px] font-bold" style={{ color: GOLD }}>
              {t("കൂട്ടുകാരൻ", "The companion")}
            </p>
            <p className="font-amiri text-sm" dir="rtl" style={{ color: "rgba(255,255,255,0.8)" }}>{COMPANION_SOURCE.ar}</p>
            <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>{isEn ? COMPANION_SOURCE.en : COMPANION_SOURCE.ml}</p>
            <p className="font-inter text-[11px]" style={{ color: GOLD }}>
              {t("ഈ കർമ്മത്തിന്റെ കൂട്ടുകാർ: ", "This work's companions: ")}
              {companionsOf(work).map((k) => `${PLANETS[k].symbol} ${isEn ? PLANETS[k].tr_en : PLANETS[k].tr_ml}`).join(" · ")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/** Item 3's answer: the day judged, then its hours, the strongest first. */
function DateAnswer({ d, work, isEn, loc, open, toggle }) {
  const t = (m, e) => (isEn ? e : m);
  const wd = d.pDay.wd;
  const dayName = isEn ? WD_EN[wd] : WD_ML_FULL[wd];
  const best = d.hours.filter((h) => h.tier && h.end > Date.now()).sort(byStrength).slice(0, 5);
  const dayOk = wd === work.day;
  return (
    <div className="space-y-1">
      <p className="font-inter text-[11px]" style={{ color: dayOk ? "#4ADE80" : "#FDBA74" }}>
        {dayOk
          ? t(`${dayName} — കിതാബ് ഈ കർമ്മത്തിന് പറയുന്ന ദിവസം ✓`, `${dayName} — the day the book gives for this work ✓`)
          : t(`${dayName} — കിതാബിന്റെ ദിവസമല്ല (കിതാബ് പറയുന്നത് ${WD_ML_FULL[work.day]}). പടി 3, 5 മാത്രം.`,
              `${dayName} — not the book's day (the book gives ${WD_EN[work.day]}). Steps 3 and 5 only.`)}
      </p>
      {best.length ? (
        <ul className="space-y-1">
          {best.map((r) => (
            <HourLine key={r.start} r={r} isEn={isEn} loc={loc}
                      open={open === `d${r.start}`} onToggle={() => toggle(`d${r.start}`)} />
          ))}
        </ul>
      ) : (
        <p className="font-inter text-[11px]" style={{ color: DIM }}>
          {t("ഈ ദിവസം ഈ കർമ്മത്തിന് ഒരു സാഅത്തും കിതാബിന്റെ പടിയിൽ വരുന്നില്ല.", "No hour of this day stands on the book's steps for this work.")}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KASHF REFERENCE SECTIONS — one place per subject, Kashf al-Haqa'iq only
//   QamarSection   — the Moon now + 28 manazil + 12 buruj (moon rules)
//   KawakibSection — the 7 planets (nature p.266, hours, Jaad table p.54)
//   AyyamSection   — 7 weekdays + 30 lunar days + kawamil + Khalili nahs
// Arabic terms stay Arabic in both languages; the meaning follows in brackets.
// Data: src/lib/kashfSaatData.js (same source as the Saat cards)
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { calculateMoonPosition } from "@/lib/astroClockMoonPosition";
import * as K from "@/lib/kashfSaatData";
import * as O from "@/lib/kashfOtherSources";
import { useBackLayer } from "@/lib/useBackLayer";
import { getUserLocation } from "@/lib/astroClockSunriseSunset";
import { moonSpan, nextLunarDays, nextWeekdayHour, nextPlanetHourIn, fmtSpan, fmtWhen, fmtDate } from "@/lib/kashfNextTimes";

const GOLD = "#F5D060";
const NAT_COLOR = { saad: "#4ADE80", nahs: "#F87171", mixed: "#FBBF24", good: "#4ADE80", bad: "#F87171" };
const actName = (id, isEn) => { const a = K.ACTIVITIES.find((x) => x.id === id); return a ? `${a.icon} ${isEn ? a.en : a.ml}` : id; };
const actList = (ids, isEn) => (ids && ids.length ? (ids.length === K.ALL.length ? (isEn ? "everything" : "എല്ലാം") : ids.map((i) => actName(i, isEn)).join(", ")) : "—");

function useLang() {
  const { language, customDate } = useAstroClockLanguage();
  return { isEn: language === "en", customDate };
}

function Ar({ children }) {
  return <span className="font-amiri" style={{ color: GOLD }}>{children}</span>;
}
function P({ children, color = "rgba(255,255,255,0.75)" }) {
  return <p className="text-xs leading-relaxed" style={{ color }}>{children}</p>;
}
function Card({ title, children }) {
  return (
    <div className="rounded-xl p-3 space-y-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {title && <p className="font-inter text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(245,208,96,0.7)" }}>{title}</p>}
      {children}
    </div>
  );
}
function Row({ head, children, highlight, open, onToggle }) {
  const [el, setEl] = useState(null);
  useEffect(() => {
    if (!open || !el) return undefined;
    const t = setTimeout(() => { try { el.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (_) { /* ignore */ } }, 280);
    return () => clearTimeout(t);
  }, [open, el]);
  return (
    <div ref={setEl} className="rounded-xl overflow-hidden" style={{ scrollMarginTop: 72, background: highlight ? "rgba(245,208,96,0.10)" : "rgba(255,255,255,0.03)", border: `1px solid ${highlight ? "rgba(245,208,96,0.55)" : "rgba(255,255,255,0.08)"}` }}>
      <button type="button" onClick={onToggle} className="w-full flex items-center gap-2 p-2 text-left">{head}</button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
const natLabel = (n, isEn) => ({
  saad: isEn ? "Sa'd (benefic)" : "സഅ്ദ് (ശുഭം)",
  nahs: isEn ? "Nahs (malefic)" : "നഹ്സ് (അശുഭം)",
  mixed: isEn ? "Mumtazij (mixed)" : "മുംതസിജ് (കലർന്നത്)",
  good: isEn ? "Sa'd (good)" : "സഅ്ദ് (നല്ലത്)",
  bad: isEn ? "Nahs (bad)" : "നഹ്സ് (മോശം)",
}[n] || n);
// Other Islamic books — beside Kashf, never part of the % scores.
const NAT_C = { saad: "#4ADE80", nahs: "#F87171", mixed: "#FBBF24" };
function Others({ items, isEn }) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="mt-1.5 pt-1.5 space-y-0.5" style={{ borderTop: "1px dashed rgba(255,255,255,0.12)" }}>
      <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: "rgba(129,140,248,0.8)" }}>{isEn ? "Other books" : "മറ്റ് ഗ്രന്ഥങ്ങൾ"}</p>
      {list.map((o, i) => (
        <p key={i} className="text-[11px] leading-relaxed" style={{ color: o.color || "rgba(255,255,255,0.65)" }}>
          • <b style={{ color: "rgba(255,255,255,0.85)" }}>{isEn ? O.SOURCES[o.src].en : O.SOURCES[o.src].ml}</b>: {isEn ? o.en : o.ml}
        </p>
      ))}
    </div>
  );
}
const natWord = (n, isEn) => (n === "saad" ? (isEn ? "Sa'd" : "സഅ്ദ്") : n === "nahs" ? (isEn ? "Nahs" : "നഹ്സ്") : (isEn ? "Mixed" : "കലർന്നത്"));
const mansionOther = (no) => { const o = O.MANSION_OTHER[no]; return o ? { src: "havass", color: NAT_C[o.nature], ml: `${natWord(o.nature, false)} — ${o.ml}`, en: `${natWord(o.nature, true)} — ${o.en}` } : null; };
const Src = ({ children }) => <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>📖 <span className="font-amiri">{K.BOOK.ar}</span>{children ? <> · {children}</> : null}</p>;

// ── "When" lines: every rule says when it next happens ─────────
const nowOf = (customDate) => (customDate ? customDate.getTime() : Date.now());
function When({ label, span, isEn, color = "#93C5FD", loc }) {
  if (!span?.start) return null;
  const txt = span.current
    ? `${isEn ? "Now — until" : "ഇപ്പോൾ — വരെ"} ${fmtWhen(span.end, loc, isEn)}`
    : fmtSpan(span, loc, isEn);
  return <P color={color}>⏱ {label ? <b>{label}: </b> : null}{txt}</P>;
}
const pName = (k, isEn) => (isEn ? K.PLANETS[k].tr_en : K.PLANETS[k].tr_ml);

function MansionNext({ n, isEn, customDate }) {
  const loc = getUserLocation();
  const now = nowOf(customDate);
  const span = useMemo(() => moonSpan("mansion", n - 1, now), [n, now]);
  const best = K.MANSION_HOURS_WITHHELD.includes(n) ? null : K.MANSION_BEST_HOURS[n];
  const bestHours = useMemo(() => (best && span ? best.map((pl) => [pl, nextPlanetHourIn(pl, span, loc, now)]) : []), [best, span, now]);
  const purpose = K.MANSION_PURPOSE[n];
  const work = K.MANSION_WORK[n];
  return (
    <div className="pt-1 space-y-0.5" style={{ borderTop: "1px dashed rgba(147,197,253,0.25)" }}>
      <When label={isEn ? "Qamar in this manzil" : "ഖമർ ഈ മൻസിലിൽ"} span={span} isEn={isEn} loc={loc} />
      {purpose && <P color="#4ADE80">📋 {isEn ? "Book's table of works" : "കിതാബിലെ പ്രവൃത്തിപ്പട്ടിക"}: <Ar>{purpose.ar}</Ar> — {isEn ? purpose.en : purpose.ml}</P>}
      {work && (
        <P color={work.harm ? "#FCA5A5" : "#FBBF24"}>
          📜 {isEn ? "al-Kharusi's table" : "ഖറൂസ്വിയുടെ പട്ടിക"} (p.{K.MANSION_WORK_SOURCE.page}):{" "}
          <Ar>{work.nature}</Ar>
          {work.face && <> · <Ar>{isEn ? "face of " : "വജ്ഹ് "}{work.face}</Ar></>}
          {" — "}<Ar>{work.ar}</Ar> — {isEn ? work.en : work.ml}
        </P>
      )}
      {work?.note_ar && (
        <P color="rgba(255,255,255,0.45)"><Ar>{work.note_ar}</Ar> — {isEn ? work.note_en : work.note_ml}</P>
      )}
      {bestHours.map(([pl, h]) => (
        <P key={pl} color="#C4B5FD">⭐ {isEn ? "Best hour (al-Khalili)" : "ഏറ്റവും നല്ല സാഅത്ത് (ഖലീലി)"}: <b>{pName(pl, isEn)}</b> <Ar>{K.PLANETS[pl].ar}</Ar>{h ? ` → ${h.current ? (isEn ? "now, until " : "ഇപ്പോൾ, വരെ ") + fmtWhen(h.end, loc, isEn) : fmtSpan(h, loc, isEn)}` : ""}</P>
      ))}
    </div>
  );
}

/** The day's own fortune-planet and ascendant — Kashf p.56. */
function DaySaad({ wd, isEn }) {
  const sd = K.DAY_SAAD[wd], tl = K.DAY_TALI[wd];
  if (!sd && !tl) return null;
  return (
    <div className="pt-1 space-y-0.5" style={{ borderTop: "1px dashed rgba(147,197,253,0.25)" }}>
      <P color="#FBBF24">
        ✦ {isEn ? "Fortune of the day" : "ദിവസത്തിന്റെ സഅ്ദ്"} (p.{K.DAY_SAAD_SOURCE.page}):{" "}
        <b>{pName(sd, isEn)}</b> <Ar>{K.PLANETS[sd].ar}</Ar>
      </P>
      <P color="#C4B5FD">
        ↑ {isEn ? "Ascendant of the day" : "ദിവസത്തിന്റെ ത്വാലിഅ്"}:{" "}
        <b>{pName(tl, isEn)}</b> <Ar>{K.PLANETS[tl].ar}</Ar>
      </P>
    </div>
  );
}

function BurjNext({ i, isEn, customDate }) {
  const loc = getUserLocation();
  const now = nowOf(customDate);
  const span = useMemo(() => moonSpan("sign", i, now), [i, now]);
  const hp = K.MOON_SIGN_NEEDS_HOUR[i];
  const hour = useMemo(() => (span ? nextPlanetHourIn(hp, span, loc, now) : null), [span, hp, now]);
  return (
    <div className="pt-1 space-y-0.5" style={{ borderTop: "1px dashed rgba(147,197,253,0.25)" }}>
      <When label={isEn ? "Qamar in this burj" : "ഖമർ ഈ ബുർജിൽ"} span={span} isEn={isEn} loc={loc} />
      {hour && <When label={`${isEn ? "Needs — hour of" : "ആവശ്യങ്ങൾക്ക് — സാഅത്ത്"} ${pName(hp, isEn)}`} span={hour} isEn={isEn} loc={loc} color="#4ADE80" />}
      {i === 7 && span && <When label={isEn ? "No nikah during" : "നിക്കാഹ് ഒഴിവാക്കേണ്ട സമയം"} span={span} isEn={isEn} loc={loc} color="#F87171" />}
      {i === K.MAKRUH_AQD.moonInScorpio.sign && (
        <P color="#F87171">
          ⚠ {isEn ? "Contract disliked" : "അഖ്ദ് കറാഹത്ത്"} (p.{K.MAKRUH_AQD.moonInScorpio.page}):{" "}
          <Ar>{K.MAKRUH_AQD.moonInScorpio.ar}</Ar> —{" "}
          {isEn ? K.MAKRUH_AQD.moonInScorpio.en : K.MAKRUH_AQD.moonInScorpio.ml}
        </P>
      )}
    </div>
  );
}

function WeekNext({ wd, isEn, customDate }) {
  const loc = getUserLocation();
  const now = nowOf(customDate);
  const data = useMemo(() => ({
    ijaba: nextWeekdayHour(wd, K.IJABA_HOUR[wd], now, loc),
    ghalaba: nextWeekdayHour(wd, K.MUGHALABA_HOUR[wd], now, loc),
    h1: K.MASTERS_HOURS.days.includes(wd) ? nextWeekdayHour(wd, 1, now, loc) : null,
    h8: K.MASTERS_HOURS.days.includes(wd) ? nextWeekdayHour(wd, 8, now, loc) : null,
  }), [wd, now]);
  return (
    <div className="pt-1 space-y-0.5" style={{ borderTop: "1px dashed rgba(147,197,253,0.25)" }}>
      <When label={isEn ? "Ijaba hour (du'a)" : "ഇജാബത്തിന്റെ സാഅത്ത് (ദുആ)"} span={data.ijaba} isEn={isEn} loc={loc} color="#4ADE80" />
      <When label={isEn ? "Mughalaba hour (meeting officials)" : "മുഗാലബ സാഅത്ത് (അധികാരികളെ കാണാൻ)"} span={data.ghalaba} isEn={isEn} loc={loc} color="#4ADE80" />
      {data.h1 && <When label={isEn ? "Excellent day-hour 1" : "ശ്രേഷ്ഠമായ ഒന്നാം സാഅത്ത്"} span={data.h1} isEn={isEn} loc={loc} color="#C4B5FD" />}
      {data.h8 && <When label={isEn ? "Excellent day-hour 8" : "ശ്രേഷ്ഠമായ എട്ടാം സാഅത്ത്"} span={data.h8} isEn={isEn} loc={loc} color="#C4B5FD" />}
    </div>
  );
}

function LunarDayNext({ d, isEn, customDate, color }) {
  const loc = getUserLocation();
  const now = nowOf(customDate);
  const next = useMemo(() => nextLunarDays(({ hijri }) => hijri.day === d, now, loc, 1, 62)[0], [d, now]);
  if (!next) return null;
  return (
    <P color={color || "#93C5FD"}>⏱ <b>{isEn ? "Next" : "അടുത്തത്"}:</b> {fmtDate(next.civil, isEn)} ({next.hijri.day} {isEn ? K.HIJRI_MONTHS_EN[next.hijri.month - 1] : K.HIJRI_MONTHS_ML[next.hijri.month - 1]}) · {fmtSpan(next, loc, isEn)}
      <span style={{ color: "rgba(255,255,255,0.45)" }}> {isEn ? "(the day starts at the sunset before)" : "(ദിവസം തുടങ്ങുന്നത് തലേന്നത്തെ സൂര്യാസ്തമയത്തോടെ)"}</span></P>
  );
}

function NahsDates({ isEn, customDate }) {
  const loc = getUserLocation();
  const now = nowOf(customDate);
  const data = useMemo(() => ({
    kawamil: nextLunarDays(({ hijri }) => K.KAWAMIL.includes(hijri.day), now, loc, 7, 70),
    khalili: nextLunarDays(({ hijri }) => K.KHALILI_NAHS[hijri.month] === hijri.day, now, loc, 2, 400),
    lastWed: nextLunarDays(({ hijri, civil, next7 }) => civil.wd === 3 && next7()?.month !== hijri.month, now, loc, 2, 70),
  }), [now]);
  const line = (x) => (
    <P key={x.start} color="#FCA5A5">⛔ {fmtDate(x.civil, isEn)} · {x.hijri.day} {isEn ? K.HIJRI_MONTHS_EN[x.hijri.month - 1] : K.HIJRI_MONTHS_ML[x.hijri.month - 1]} · {fmtSpan(x, loc, isEn)}{x.current ? (isEn ? " — now" : " — ഇപ്പോൾ") : ""}</P>
  );
  return (
    <Card title={isEn ? "Coming nahs days — avoid (from sunset to sunset)" : "വരുന്ന നഹ്സ് ദിവസങ്ങൾ — ഒഴിവാക്കേണ്ടവ (സൂര്യാസ്തമയം മുതൽ സൂര്യാസ്തമയം വരെ)"}>
      <P color="rgba(255,255,255,0.55)">{isEn ? "Kawamil" : "കവാമിൽ"}:</P>
      {data.kawamil.map(line)}
      <P color="rgba(255,255,255,0.55)">{isEn ? "Al-Khalili's monthly nahs day" : "ഖലീലിയുടെ മാസ-നഹ്സ് ദിവസം"}:</P>
      {data.khalili.map(line)}
      <P color="rgba(255,255,255,0.55)">{isEn ? "Last Arbi'a (Wednesday) of the month" : "മാസത്തിലെ അവസാന അർബിആഅ് (ബുധൻ)"}:</P>
      {data.lastWed.map(line)}
    </Card>
  );
}

function MoonNowTimes({ moon, isEn, customDate }) {
  const loc = getUserLocation();
  const now = nowOf(customDate);
  const t = useMemo(() => ({
    m: moonSpan("mansion", moon.mansionNo - 1, now),
    b: moonSpan("sign", moon.sign, now),
    nextM: moonSpan("mansion", moon.mansionNo % 28, now),
  }), [moon.mansionNo, moon.sign, now]);
  const nm = moon.mansionNo % 28 + 1;
  return (
    <>
      {t.m?.end && <P color="#93C5FD">⏱ {isEn ? "In this manzil until" : "ഈ മൻസിലിൽ"} <b>{fmtWhen(t.m.end, loc, isEn)}</b>{isEn ? "" : " വരെ"} · {isEn ? "then" : "പിന്നെ"} {isEn ? K.MANSIONS_EN[nm].name : K.MANSIONS[nm].ml} <Ar>{K.MANSIONS[nm].ar}</Ar> ({natLabel(K.MANSIONS[nm].nature, isEn)})</P>}
      {t.b?.end && <P color="#93C5FD">⏱ {isEn ? "In this burj until" : "ഈ ബുർജിൽ"} <b>{fmtWhen(t.b.end, loc, isEn)}</b>{isEn ? "" : " വരെ"}</P>}
    </>
  );
}

// ── QAMAR ──────────────────────────────────────────────────────
export function QamarSection() {
  const { isEn, customDate } = useLang();
  const [open, setOpen] = useState(null);
  useBackLayer(open !== null, () => setOpen(null)); // Back closes the opened row
  const [tab, setTab] = useState("manazil");
  const moon = useMemo(() => {
    const mp = calculateMoonPosition(customDate || new Date());
    const lon = ((parseFloat(mp.longitude) % 360) + 360) % 360;
    return { lon, mansionNo: Math.floor(lon / (360 / 28)) + 1, sign: Math.floor(lon / 30), light: parseFloat(mp.phase), waxing: !!mp.isWaxing };
  }, [customDate]);
  const mn = K.MANSIONS[moon.mansionNo], mnEn = K.MANSIONS_EN[moon.mansionNo];
  const phase = moon.light >= 95 ? (isEn ? "Badr (full)" : "ബദ്ർ (പൗർണമി)")
    : moon.light < 5 ? (isEn ? "Muhaq (dark)" : "മുഹാഖ് (ഇരുട്ട്)")
    : moon.waxing ? (isEn ? "Ziyada — light increasing" : "സിയാദ — നൂർ കൂടുന്നു")
    : (isEn ? "Nuqsan — light decreasing" : "നുഖ്സാൻ — നൂർ കുറയുന്നു");

  return (
    <div className="space-y-3">
      <Card title={isEn ? "Qamar now" : "ഖമർ ഇപ്പോൾ"}>
        <P>{isEn ? "Manzil" : "മൻസിൽ"} {moon.mansionNo}: <b style={{ color: "#fff" }}>{isEn ? mnEn.name : mn.ml}</b> <Ar>{mn.ar}</Ar> · <span style={{ color: NAT_COLOR[mn.nature] }}>{isEn ? "Kharusi" : "ഖറൂസി"}: {natLabel(mn.nature, isEn)}</span></P>
        <P>{isEn ? "Burj" : "ബുർജ്"}: <b style={{ color: "#fff" }}>{isEn ? K.SIGNS_TR_EN[moon.sign] : K.SIGNS_TR_ML[moon.sign]}</b> <Ar>{K.SIGNS_AR[moon.sign]}</Ar> ({isEn ? K.SIGNS_EN[moon.sign] : K.SIGNS_ML[moon.sign]}) · {moon.lon.toFixed(1)}°</P>
        <MoonNowTimes moon={moon} isEn={isEn} customDate={customDate} />
        <P>{phase} · {moon.light.toFixed(0)}%</P>
        <P color="rgba(255,255,255,0.55)">{isEn ? "According to Hermes" : "ഹെർമിസ് പ്രകാരം"}:</P>
        <P>✓ {actList(mn.good, isEn)}</P>
        {mn.avoid.length > 0 && <P color="#F87171">✕ {actList(mn.avoid, isEn)}</P>}
        <P>🧳 {isEn ? "Nabhani — travel" : "നബ്ഹാനി — യാത്ര"}: {isEn ? mnEn.travel : mn.travel_ml}</P>
        <P>🤲 {isEn ? "For needs, use the hour of" : "ആവശ്യങ്ങൾക്ക് ഉചിതമായ സാഅത്ത്"}: <b style={{ color: "#fff" }}>{isEn ? K.PLANETS[K.MOON_SIGN_NEEDS_HOUR[moon.sign]].tr_en : K.PLANETS[K.MOON_SIGN_NEEDS_HOUR[moon.sign]].tr_ml}</b> <Ar>{K.PLANETS[K.MOON_SIGN_NEEDS_HOUR[moon.sign]].ar}</Ar></P>
        {moon.sign === 7 && <P color="#F87171">💍 {isEn ? "Qamar in Aqrab: no nikah" : "ഖമർ അഖ്റബിൽ: നിക്കാഹ് വേണ്ട"}</P>}
        <Others isEn={isEn} items={[mansionOther(moon.mansionNo), O.TAHA_NAHS_BURUJ.includes(moon.sign) ? { ...O.BURJ_OTHER_NOTE, color: "#F87171" } : null, moon.light < 5 ? O.MOON_OTHER.muhaq : moon.waxing ? O.MOON_OTHER.waxing : null]} />
        <Src>{isEn ? "28 equal manazil from 0° Hamal" : "0° ഹമൽ മുതൽ 28 തുല്യ മനാസിൽ"}</Src>
      </Card>

      <div className="flex gap-1.5">
        {[["manazil", isEn ? "28 Manazil" : "28 മനാസിൽ"], ["buruj", isEn ? "12 Buruj" : "12 ബുറൂജ്"]].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className="flex-1 rounded-xl py-2 text-xs font-bold"
            style={{ background: tab === k ? "rgba(245,208,96,0.15)" : "rgba(255,255,255,0.03)", color: tab === k ? GOLD : "rgba(255,255,255,0.5)", border: "1px solid rgba(245,208,96,0.25)" }}>{l}</button>
        ))}
      </div>

      {tab === "manazil" && (
        <div className="space-y-1.5">
          {K.MANSIONS.slice(1).map((m, i) => {
            const n = i + 1, en = K.MANSIONS_EN[n];
            return (
              <Row key={n} highlight={n === moon.mansionNo} open={open === `m${n}`} onToggle={() => setOpen(open === `m${n}` ? null : `m${n}`)}
                head={<>
                  <span className="font-inter text-[10px] font-bold w-6 text-center" style={{ color: "rgba(255,255,255,0.45)" }}>{n}</span>
                  <span className="flex-1 min-w-0 text-xs truncate"><b style={{ color: "#fff" }}>{isEn ? en.name : m.ml}</b> <Ar>{m.ar}</Ar></span>
                  <span className="text-[10px] font-bold" style={{ color: NAT_COLOR[m.nature] }}>{natLabel(m.nature, isEn)}</span>
                </>}>
                <P color="rgba(255,255,255,0.55)">{isEn ? "According to Hermes" : "ഹെർമിസ് പ്രകാരം"}:</P>
                <P>✓ {actList(m.good, isEn)}</P>
                {m.avoid.length > 0 && <P color="#F87171">✕ {actList(m.avoid, isEn)}</P>}
                <P>🧳 {isEn ? "Nabhani — travel" : "നബ്ഹാനി — യാത്ര"}: {isEn ? en.travel : m.travel_ml}{K.TRAVEL_GOOD_MANSIONS.includes(n) ? (isEn ? " · Dhu al-Ghabra: good for travel" : " · ദുൽ-ഗബ്റ: യാത്രയ്ക്ക് നല്ലത്") : ""}</P>
                {K.MARRIAGE_GOOD_MANSIONS.includes(n) && <P color="#4ADE80">💍 {isEn ? "Dhu al-Ghabra: good for nikah" : "ദുൽ-ഗബ്റ: നിക്കാഹിന് നല്ലത്"}</P>}
                {(isEn ? en.note : m.note_ml) && <P color="rgba(255,255,255,0.5)">{isEn ? en.note : m.note_ml}</P>}
                <MansionNext n={n} isEn={isEn} customDate={customDate} />
                <Others isEn={isEn} items={[mansionOther(n)]} />
                <P color="rgba(255,255,255,0.4)">{(n - 1) * (360 / 28) | 0}° – {(n * (360 / 28)) | 0}°</P>
              </Row>
            );
          })}
          <Src>{isEn ? "nature: Kharusi · travel: Nabhani · works: Hermes" : "സ്വഭാവം: ഖറൂസി · യാത്ര: നബ്ഹാനി · പ്രവൃത്തികൾ: ഹെർമിസ്"}</Src>
        </div>
      )}

      {tab === "buruj" && (
        <div className="space-y-1.5">
          {K.SIGNS_AR.map((ar, i) => {
            const hp = K.PLANETS[K.MOON_SIGN_NEEDS_HOUR[i]];
            return (
              <Row key={i} highlight={i === moon.sign} open={open === `b${i}`} onToggle={() => setOpen(open === `b${i}` ? null : `b${i}`)}
                head={<>
                  <span className="font-inter text-[10px] font-bold w-6 text-center" style={{ color: "rgba(255,255,255,0.45)" }}>{i + 1}</span>
                  <span className="flex-1 min-w-0 text-xs truncate"><b style={{ color: "#fff" }}>{isEn ? K.SIGNS_TR_EN[i] : K.SIGNS_TR_ML[i]}</b> <Ar>{ar}</Ar> <span style={{ color: "rgba(255,255,255,0.5)" }}>({isEn ? K.SIGNS_EN[i] : K.SIGNS_ML[i]})</span></span>
                  {i === moon.sign && <span className="text-[9px] font-bold" style={{ color: "#4ADE80" }}>{isEn ? "Qamar here" : "ഖമർ ഇവിടെ"}</span>}
                </>}>
                <P>🤲 {isEn ? "Qamar here → needs in the hour of" : "ഖമർ ഇവിടെ → ആവശ്യങ്ങൾക്ക്"} <b style={{ color: "#fff" }}>{isEn ? hp.tr_en : hp.tr_ml}</b> <Ar>{hp.ar}</Ar> ({isEn ? hp.en : hp.ml})</P>
                {i === 7 && <P color="#F87171">💍 {isEn ? "Qamar here: no nikah" : "ഖമർ ഇവിടെ: നിക്കാഹ് വേണ്ട"}</P>}
                <BurjNext i={i} isEn={isEn} customDate={customDate} />
                <Others isEn={isEn} items={[O.TAHA_NAHS_BURUJ.includes(i) ? { ...O.BURJ_OTHER_NOTE, color: "#F87171" } : null]} />
                <P color="rgba(255,255,255,0.4)">{i * 30}° – {i * 30 + 30}°</P>
              </Row>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── KAWAKIB ────────────────────────────────────────────────────
const RULES_DAY = { sun: 0, moon: 1, mars: 2, mercury: 3, jupiter: 4, venus: 5, saturn: 6 };
const JAAD_ROLE = { saad: ["സഅ്ദ്", "Sa'd"], ghalaba: ["ഗലബ", "Ghalaba"], ijaba: ["ഇജാബ", "Ijaba"], baraka: ["ബറക്ക", "Baraka"] };
const AFFINITY_NOTE = {
  sun: ["അധികാരികളെ കാണാൻ", "Meeting officials"],
  jupiter: ["ആവശ്യങ്ങൾ, റിസ്ഖ്, കച്ചവടം", "Needs, rizq, trade"],
  venus: ["നിക്കാഹ്, സ്നേഹം", "Nikah, affection"],
};

/**
 * Where a planet is strong and where it is harmed — Kashf p. 244.
 * بيت and شرف are its own ground; وبال and هبوط are where it is undone.
 */
function Dignity({ k, isEn }) {
  const d = K.PLANET_DIGNITY[k];
  if (!d) return null;
  const sign = (i) => (isEn ? K.SIGNS_TR_EN[i] : K.SIGNS_TR_ML[i]);
  const signs = (a) => a.map(sign).join(isEn ? " and " : ", ");
  const L = K.DIGNITY_LABEL;
  const at = (x) => `${x.deg}° ${sign(x.sign)}`;
  return (
    <>
      <P color="#4ADE80">
        ✦ {isEn ? L.bayt.en : L.bayt.ml} <Ar>{L.bayt.ar}</Ar>: <b style={{ color: "#fff" }}>{signs(d.bayt)}</b>
        {" · "}{isEn ? L.sharaf.en : L.sharaf.ml} <Ar>{L.sharaf.ar}</Ar>: <b style={{ color: "#fff" }}>{at(d.sharaf)}</b>
      </P>
      <P color="#FCA5A5">
        ⚠ {isEn ? L.wabal.en : L.wabal.ml} <Ar>{L.wabal.ar}</Ar>: <b>{signs(d.wabal)}</b>
        {" · "}{isEn ? L.hubut.en : L.hubut.ml} <Ar>{L.hubut.ar}</Ar>: <b>{at(d.hubut)}</b>
      </P>
      <P color="rgba(255,255,255,0.6)">
        {isEn ? L.farah.en : L.farah.ml} <Ar>{L.farah.ar}</Ar>: {d.farah}
        {" · "}{isEn ? L.jurm.en : L.jurm.ml} <Ar>{L.jurm.ar}</Ar>: {d.jurm}°
        {" · "}<Ar>{d.tabia_ar}</Ar>
      </P>
      {d.note_ml && (
        <P color="rgba(255,255,255,0.5)">{isEn ? d.note_en : d.note_ml} <Ar>{d.note_ar}</Ar></P>
      )}
    </>
  );
}

/**
 * The day and the hour taken together — Hâvâss I pp. 40-42.
 * The book works this through for Venus hours only; the other six are
 * left to the reader, and that gap is stated rather than filled.
 */
function DayHourCombo({ isEn }) {
  const [open, setOpen] = useState(false);
  const rule = K.HAVASS_DAY_HOUR_RULE, base = K.HAVASS_DAY_HOUR_BASE;
  return (
    <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <Row open={open} onToggle={() => setOpen(!open)}
        head={<>
          <span className="text-lg w-6 text-center" style={{ color: GOLD }}>⚭</span>
          <span className="flex-1 min-w-0 text-xs truncate">
            <b style={{ color: "#fff" }}>
              {isEn ? "The day and the hour together" : "ദിവസവും സാഅത്തും ചേർത്ത്"}
            </b>{" "}
            <span style={{ color: "rgba(255,255,255,0.5)" }}>
              {isEn ? "(Hâvâss pp. 40-42)" : "(ഹവാസ്സ് പേ. 40-42)"}
            </span>
          </span>
        </>}>
        <P>{isEn ? rule.en : rule.ml}</P>
        <P color="rgba(255,255,255,0.6)">⭐ {isEn ? base.en : base.ml}</P>
        <P color="#C4B5FD" >
          {isEn
            ? "The book's own worked examples, all of them Venus hours:"
            : "കിതാബ് തരുന്ന ഉദാഹരണങ്ങൾ — എല്ലാം സുഹ്റയുടെ സാഅത്തിന്:"}
        </P>
        {K.HAVASS_DAY_HOUR_VENUS.map((c, i) => {
          const d = K.PLANETS[c.day];
          return (
            <P key={i} color={c.harm ? "#FCA5A5" : "rgba(255,255,255,0.8)"}>
              <b style={{ color: c.harm ? "#FCA5A5" : "#fff" }}>
                {isEn ? d.tr_en : d.tr_ml}
              </b>{" "}
              <Ar>{d.ar}</Ar> — {isEn ? c.en : c.ml}{" "}
              <span style={{ color: "rgba(255,255,255,0.35)" }}>(p.{c.page})</span>
            </P>
          );
        })}
        <P color="rgba(255,255,255,0.5)">
          {isEn ? K.HAVASS_DAY_HOUR_GAP.en : K.HAVASS_DAY_HOUR_GAP.ml}
        </P>
        <P color="#FBBF24">
          ⚖ {isEn ? K.DIGNITY_IN_USE.en : K.DIGNITY_IN_USE.ml}{" "}
          <Ar>{K.DIGNITY_IN_USE.ar}</Ar>{" "}
          <span style={{ color: "rgba(255,255,255,0.35)" }}>
            ({isEn ? "Kashf p." : "കശ്ഫ് പേ."}{K.DIGNITY_IN_USE.page})
          </span>
        </P>
      </Row>
    </div>
  );
}

export function KawakibSection() {
  const { isEn } = useLang();
  const [open, setOpen] = useState(null);
  useBackLayer(open !== null, () => setOpen(null)); // Back closes the opened row
  return (
    <div className="space-y-1.5">
      <P color="rgba(255,255,255,0.55)">{isEn ? "Order of the hours: " : "സാഅത്തുകളുടെ ക്രമം: "}
        {K.PLANET_ORDER.map((k) => (isEn ? K.PLANETS[k].tr_en : K.PLANETS[k].tr_ml)).join(" → ")}</P>
      {K.PLANET_ORDER.map((k) => {
        const p = K.PLANETS[k], wd = K.WEEKDAYS[RULES_DAY[k]];
        const jaad = Object.entries(K.JAAD).flatMap(([d, r]) => Object.entries(r).filter(([, pl]) => pl === k).map(([role]) => [Number(d), role]));
        return (
          <Row key={k} open={open === k} onToggle={() => setOpen(open === k ? null : k)}
            head={<>
              <span className="text-lg w-6 text-center" style={{ color: GOLD }}>{p.symbol}</span>
              <span className="flex-1 min-w-0 text-xs truncate"><b style={{ color: "#fff" }}>{isEn ? p.tr_en : p.tr_ml}</b> <Ar>{p.ar}</Ar> <span style={{ color: "rgba(255,255,255,0.5)" }}>({isEn ? p.en : p.ml})</span></span>
              <span className="text-[10px] font-bold" style={{ color: p.base >= 75 ? "#4ADE80" : p.base >= 50 ? "#FBBF24" : "#F87171" }}>{(isEn ? K.NATURE_LABEL[p.nature].en : K.NATURE_LABEL[p.nature].ml).split(" — ")[0]}</span>
            </>}>
            <P>{isEn ? K.NATURE_LABEL[p.nature].en : K.NATURE_LABEL[p.nature].ml} <Ar>{K.NATURE_LABEL[p.nature].ar}</Ar></P>
            <P>📅 {isEn ? "Rules the day" : "ഭരിക്കുന്ന ദിവസം"}: <b style={{ color: "#fff" }}>{isEn ? `Yawm al-${wd.tr_en}` : `യൗമുൽ ${wd.tr_ml}`}</b> <Ar>{wd.ar}</Ar> ({isEn ? wd.en : wd.ml}) — {isEn ? "its 1st day-hour" : "പകലിലെ ഒന്നാം സാഅത്ത്"}</P>
            {AFFINITY_NOTE[k] && <P color="#4ADE80">✓ {isEn ? AFFINITY_NOTE[k][1] : AFFINITY_NOTE[k][0]}</P>}
            {jaad.length > 0 && <P>{isEn ? "Sheikh Jaad's table" : "ശൈഖ് ജാഇദിന്റെ പട്ടിക"}: {jaad.map(([d, role]) => `${isEn ? K.WEEKDAYS[d].tr_en : K.WEEKDAYS[d].tr_ml} — ${isEn ? JAAD_ROLE[role][1] : JAAD_ROLE[role][0]}`).join(" · ")}</P>}
            <Dignity k={k} isEn={isEn} />
            <P color="rgba(255,255,255,0.5)">{isEn ? "Metal" : "ലോഹം"}: {isEn ? p.metal_en : p.metal_ml}</P>
            {k === "venus" && (
              <P color="#C4B5FD">
                ⚭ {isEn
                  ? "Hâvâss pairs this planet's hours with other planets' days — see “The day and the hour together” below."
                  : "ഈ ഗ്രഹത്തിന്റെ സാഅത്ത് മറ്റു ഗ്രഹങ്ങളുടെ ദിവസങ്ങളുമായി ചേർക്കുന്നത് ഹവാസ്സ് വിശദമാക്കുന്നു — താഴെ “ദിവസവും സാഅത്തും ചേർത്ത്” നോക്കുക."}
              </P>
            )}
            <Others isEn={isEn} items={O.PLANET_OTHER[k]} />
          </Row>
        );
      })}
      <DayHourCombo isEn={isEn} />
      <Src />
    </div>
  );
}

// ── AYYAM ──────────────────────────────────────────────────────
export function AyyamSection() {
  const { isEn, customDate } = useLang();
  const [open, setOpen] = useState(null);
  useBackLayer(open !== null, () => setOpen(null)); // Back closes the opened row
  const [tab, setTab] = useState("week");
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {[["week", isEn ? "7 Ayyam" : "7 അയ്യാം"], ["month", isEn ? "30 lunar days" : "30 ചാന്ദ്രദിവസം"], ["nahs", isEn ? "Nahs days" : "നഹ്സ് ദിവസങ്ങൾ"]].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className="flex-1 rounded-xl py-2 text-[11px] font-bold"
            style={{ background: tab === k ? "rgba(245,208,96,0.15)" : "rgba(255,255,255,0.03)", color: tab === k ? GOLD : "rgba(255,255,255,0.5)", border: "1px solid rgba(245,208,96,0.25)" }}>{l}</button>
        ))}
      </div>

      {tab === "week" && (
        <div className="space-y-1.5">
          {K.WEEKDAYS.map((w, i) => {
            const p = K.PLANETS[w.planet];
            return (
              <Row key={i} open={open === `w${i}`} onToggle={() => setOpen(open === `w${i}` ? null : `w${i}`)}
                head={<>
                  <span className="text-lg w-6 text-center" style={{ color: GOLD }}>{p.symbol}</span>
                  <span className="flex-1 min-w-0 text-xs truncate"><b style={{ color: "#fff" }}>{isEn ? `Yawm al-${w.tr_en}` : `യൗമുൽ ${w.tr_ml}`}</b> <Ar>{w.ar}</Ar> <span style={{ color: "rgba(255,255,255,0.5)" }}>({isEn ? w.en : w.ml})</span></span>
                </>}>
                <P>{isEn ? "Planet" : "ഗ്രഹം"}: <b style={{ color: "#fff" }}>{isEn ? p.tr_en : p.tr_ml}</b> <Ar>{p.ar}</Ar></P>
                <P color="#4ADE80">✓ {actList(w.good, isEn)}</P>
                {(isEn ? w.note_en : w.note_ml) && <P>• {isEn ? w.note_en : w.note_ml}</P>}
                <P>👕 {isEn ? w.clothesNote_en : w.clothesNote_ml}</P>
                <P>🧭 {isEn ? "Avoid travelling towards" : "യാത്ര ഒഴിവാക്കേണ്ട ദിശ"}: <b style={{ color: "#F87171" }}>{isEn ? w.avoidDir_en : w.avoidDir_ml}</b></P>
                <P>🤲 {isEn ? "Ijaba hour" : "ഇജാബത്തിന്റെ സാഅത്ത്"}: {isEn ? "day-hour" : "പകലിലെ"} {K.IJABA_HOUR[i]} · 🏆 {isEn ? "Mughalaba hour" : "മുഗാലബ സാഅത്ത്"}: {isEn ? "day-hour" : "പകലിലെ"} {K.MUGHALABA_HOUR[i]}</P>
                {K.MASTERS_HOURS.days.includes(i) && <P>⭐ {isEn ? "Day-hours 1 and 8 are excellent" : "പകലിലെ 1, 8 സാഅത്തുകൾ ശ്രേഷ്ഠം"}</P>}
                <DaySaad wd={i} isEn={isEn} />
                <WeekNext wd={i} isEn={isEn} customDate={customDate} />
                <Others isEn={isEn} items={[O.WEEKDAY_OTHER[i]]} />
              </Row>
            );
          })}
        </div>
      )}

      {tab === "month" && (
        <div className="space-y-1.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
            const md = K.MONTH_DAYS[d], kamil = K.KAWAMIL.includes(d);
            const dark = d >= 28, noPalm = K.PLANTING_AVOID_DATES.dates.includes(d);
            const note = isEn ? K.MONTH_DAY_NOTE_EN[d] : md.note_ml;
            return (
              <Row key={d} open={open === `d${d}`} onToggle={() => setOpen(open === `d${d}` ? null : `d${d}`)}
                head={<>
                  <span className="font-inter text-[10px] font-bold w-6 text-center" style={{ color: "rgba(255,255,255,0.45)" }}>{d}</span>
                  <span className="flex-1 min-w-0 text-xs truncate" style={{ color: "rgba(255,255,255,0.8)" }}>{note || "—"}</span>
                  <span className="text-[10px] font-bold" style={{ color: NAT_COLOR[md.nature] }}>{kamil ? (isEn ? "Kawamil" : "കവാമിൽ") : natLabel(md.nature, isEn)}</span>
                </>}>
                <P color="#4ADE80">✓ {actList(md.good, isEn)}</P>
                {md.avoid.length > 0 && <P color="#F87171">✕ {actList(md.avoid, isEn)}</P>}
                {kamil && <P color="#F87171">⛔ {isEn ? "One of the seven kawamil days" : "ഏഴ് കവാമിൽ ദിവസങ്ങളിൽ ഒന്ന്"}</P>}
                {dark && (
                  <P color="#F87171">
                    ⚠ {isEn ? "Contract disliked" : "അഖ്ദ് കറാഹത്ത്"} (p.{K.MAKRUH_AQD.lastThreeDays.page}):{" "}
                    <Ar>{K.MAKRUH_AQD.lastThreeDays.ar}</Ar> —{" "}
                    {isEn ? K.MAKRUH_AQD.lastThreeDays.en : K.MAKRUH_AQD.lastThreeDays.ml}
                  </P>
                )}
                {noPalm && (
                  <P color="#FBBF24">
                    🌴 {isEn ? "Planting" : "നടീൽ"} (p.{K.PLANTING_AVOID_DATES.page}):{" "}
                    <Ar>{K.PLANTING_AVOID_DATES.ar}</Ar> —{" "}
                    {isEn ? K.PLANTING_AVOID_DATES.en : K.PLANTING_AVOID_DATES.ml}
                  </P>
                )}
                <LunarDayNext d={d} isEn={isEn} customDate={customDate} color={kamil || md.nature === "bad" ? "#FCA5A5" : undefined} />
              </Row>
            );
          })}
          <Src />
        </div>
      )}

      {tab === "nahs" && (
        <div className="space-y-3">
          <NahsDates isEn={isEn} customDate={customDate} />
          <Card title={isEn ? "Al-Kawamil — 7 days of every month" : "അൽ-കവാമിൽ — എല്ലാ മാസവും 7 ദിവസം"}>
            <P><b style={{ color: "#F87171" }}>{K.KAWAMIL.join(", ")}</b></P>
            <P>{isEn ? "Avoid" : "ഒഴിവാക്കുക"}: {actList(K.KAWAMIL_AVOID, isEn)}</P>
            <P>{isEn ? "Also the last Arbi'a (Wednesday) of each Hijri month" : "കൂടാതെ ഓരോ ഹിജ്റ മാസത്തിലെയും അവസാന അർബിആഅ് (ബുധൻ)"}</P>
            <Others isEn={isEn} items={[O.KAWAMIL_AGREEMENT]} />
          </Card>
          <Card title={isEn ? "Al-Khalili — one nahs day per month" : "അൽ-ഖലീലി — ഓരോ മാസവും ഒരു നഹ്സ് ദിവസം"}>
            <div className="grid grid-cols-2 gap-1">
              {K.HIJRI_MONTHS_AR.map((ar, i) => (
                <P key={i}><Ar>{ar}</Ar> {isEn ? K.HIJRI_MONTHS_EN[i] : K.HIJRI_MONTHS_ML[i]}: <b style={{ color: "#F87171" }}>{K.KHALILI_NAHS[i + 1]}</b></P>
              ))}
            </div>
          </Card>
          {O.TAHA_MONTH_NAHS.map((r, ri) => (
            <Card key={ri} title={`${isEn ? O.SOURCES.taha.en : O.SOURCES.taha.ml} — ${isEn ? r.en : r.ml}`}>
              <div className="grid grid-cols-2 gap-1">
                {K.HIJRI_MONTHS_AR.map((ar, i) => (r.days[i + 1] ? (
                  <P key={i}><Ar>{ar}</Ar> {isEn ? K.HIJRI_MONTHS_EN[i] : K.HIJRI_MONTHS_ML[i]}: <b style={{ color: "#F87171" }}>{r.days[i + 1].join(", ")}</b></P>
                ) : null))}
              </div>
              <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>{isEn ? "Other book — shown for reference; not used in the % scores" : "മറ്റ് ഗ്രന്ഥം — അറിവിനായി മാത്രം; ശതമാനത്തിൽ ഉൾപ്പെടുത്തിയിട്ടില്ല"}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

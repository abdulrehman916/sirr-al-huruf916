// ═══════════════════════════════════════════════════════════════
// SAAT CARDS — one planetary day = its NIGHT (12) + its DAY (12)
// Kashf al-Haqa'iq p.65: the night after a sunset belongs to the next day.
// Tap any card → animated sheet: what to do / avoid now, with % scores
// built from the day (45%), the hour planet (35%) and the moon (20%).
// Engine + data: src/lib/kashfSaatEngine.js, src/lib/kashfSaatData.js
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { getUserLocation } from "@/lib/astroClockSunriseSunset";
import { subscribeLocation } from "@/lib/astroClockGeolocation";
import { getPlanetaryDay, formatClock, timeSeverity } from "@/lib/kashfSaatEngine";
import { eclipsesIn, ECLIPSE_SOURCE } from "@/lib/eclipses";
import { useBackLayer } from "@/lib/useBackLayer";
import { moonSpan, fmtWhen } from "@/lib/kashfNextTimes";
import { SOURCES, PLANET_OTHER, MANSION_OTHER, WEEKDAY_OTHER, TAHA_NAHS_BURUJ, BURJ_OTHER_NOTE, tahaNahsFor } from "@/lib/kashfOtherSources";
import { PLANETS, NATURE_LABEL, SIGNS_ML, SIGNS_EN, SIGNS_TR_ML, SIGNS_TR_EN, SIGNS_AR, WEIGHTS, BOOK, MONTH_DAY_NOTE_EN, MANSIONS_EN, MANSION_WORK, MANSION_WORK_SOURCE } from "@/lib/kashfSaatData";

const GOLD = "#F5D060";
const VERDICT = {
  do:    { ml: "ചെയ്യാം",      en: "Do",        color: "#4ADE80" },
  care:  { ml: "ശ്രദ്ധയോടെ",    en: "With care", color: "#FBBF24" },
  avoid: { ml: "ഒഴിവാക്കുക",    en: "Avoid",     color: "#F87171" },
};
const scoreColor = (s) => (s >= 65 ? "#4ADE80" : s >= 40 ? "#FBBF24" : "#F87171");

function remaining(ms, isEn) {
  const m = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(m / 60), mm = m % 60;
  if (isEn) return h ? `${h}h ${mm}m` : `${mm}m`;
  return h ? `${h} മണി. ${mm} മിനി.` : `${mm} മിനിറ്റ്`;
}

// Arabic name first (in the reader's script), Arabic letters, then the local meaning.
function ArName({ tr, ar, meaning, strong = true }) {
  return (
    <>
      {strong ? <b style={{ color: "#fff" }}>{tr}</b> : <span>{tr}</span>}{" "}
      <span className="font-amiri" style={{ color: GOLD }}>{ar}</span>
      {meaning && <span style={{ color: "rgba(255,255,255,0.5)" }}> ({meaning})</span>}
    </>
  );
}
const planetName = (p, isEn) => <ArName tr={isEn ? p.tr_en : p.tr_ml} ar={p.ar} meaning={isEn ? p.en : p.ml} />;
const dayName = (w, isEn) => <ArName tr={isEn ? `Yawm al-${w.tr_en}` : `യൗമുൽ ${w.tr_ml}`} ar={w.ar} meaning={isEn ? w.en : w.ml} />;
const hijriText = (day, isEn) => (isEn ? day.hijriLabel_en : day.hijriLabel_ml);

function Ring({ value, size = 38 }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r, col = scoreColor(value);
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth="3" fill="none" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill={col}>{value}%</text>
    </svg>
  );
}

function HourChip({ h, tz, onOpen, isEn }) {
  const p = PLANETS[h.planet];
  const current = h.status === "current";
  return (
    <motion.button type="button" onClick={() => onOpen(h)} whileTap={{ scale: 0.96 }}
      animate={current ? { boxShadow: ["0 0 0px rgba(245,208,96,0)", "0 0 18px rgba(245,208,96,0.45)", "0 0 0px rgba(245,208,96,0)"] } : {}}
      transition={current ? { duration: 2.4, repeat: Infinity } : {}}
      className="w-full flex items-center gap-2 p-2 rounded-xl text-left"
      style={{
        background: current ? "rgba(245,208,96,0.10)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${current ? "rgba(245,208,96,0.6)" : "rgba(255,255,255,0.08)"}`,
        opacity: h.status === "past" ? 0.45 : 1,
      }}>
      <span className="font-inter text-[10px] font-bold w-5 text-center" style={{ color: "rgba(255,255,255,0.45)" }}>{h.num}</span>
      <span className="text-lg leading-none" style={{ color: GOLD }}>{p.symbol}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs truncate" style={{ color: "#fff" }}>{planetName(p, isEn)}</span>
        <span className="block font-inter text-[9px] tabular-nums" style={{ color: "rgba(255,255,255,0.45)" }}>{formatClock(h.start, tz)} – {formatClock(h.end, tz)}</span>
      </span>
      {current && <span className="font-inter text-[8px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.15)", color: "#4ADE80" }}>{isEn ? "Now" : "ഇപ്പോൾ"}</span>}
      <Ring value={h.score} />
    </motion.button>
  );
}

function Box({ title, children }) {
  return (
    <div className="rounded-xl p-3 space-y-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(245,208,96,0.7)" }}>{title}</p>
      {children}
    </div>
  );
}
const Line = ({ children, color = "rgba(255,255,255,0.75)" }) => <p className="text-xs leading-relaxed" style={{ color }}>{children}</p>;

// "Other scholars" lines — shown beside Kashf, never part of the % score.
const NAT_C = { saad: "#4ADE80", nahs: "#F87171", mixed: "#FBBF24" };
function Others({ items, isEn }) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="mt-1.5 pt-1.5 space-y-0.5" style={{ borderTop: "1px dashed rgba(255,255,255,0.12)" }}>
      <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: "rgba(129,140,248,0.8)" }}>{isEn ? "Other books" : "മറ്റ് ഗ്രന്ഥങ്ങൾ"}</p>
      {list.map((o, i) => (
        <p key={i} className="text-[11px] leading-relaxed" style={{ color: o.color || "rgba(255,255,255,0.65)" }}>
          • <b style={{ color: "rgba(255,255,255,0.85)" }}>{isEn ? SOURCES[o.src].en : SOURCES[o.src].ml}</b>: {isEn ? o.en : o.ml}
        </p>
      ))}
    </div>
  );
}
const natWord = (n, isEn) => (n === "saad" ? (isEn ? "Sa'd" : "സഅ്ദ്") : n === "nahs" ? (isEn ? "Nahs" : "നഹ്സ്") : (isEn ? "Mixed" : "കലർന്നത്"));
const mansionOther = (no, isEn) => { const o = MANSION_OTHER[no]; return o ? { src: "havass", color: NAT_C[o.nature], ml: `${natWord(o.nature, false)} — ${o.ml}`, en: `${natWord(o.nature, true)} — ${o.en}` } : null; };

function DayFlags({ day, isEn }) {
  const flags = [];
  if (day.isKamil) flags.push(isEn ? `Kawamil nahs day (${day.lunarDay})` : `കവാമിൽ നഹ്സ് ദിവസം (${day.lunarDay})`);
  if (day.isKhalili) flags.push(isEn ? "Al-Khalili's monthly nahs day" : "ഖലീലിയുടെ മാസ-നഹ്സ് ദിവസം");
  if (day.isLastWed) flags.push(isEn ? "Last Arbi'a (Wednesday) of the month" : "മാസത്തിലെ അവസാന അർബിആഅ് (ബുധൻ)");
  if (!flags.length && day.monthDay?.nature === "bad") flags.push(isEn ? "Nahs lunar day" : "നഹ്സ് ആയ ചാന്ദ്രദിവസം");
  if (!flags.length) return <Line color="#4ADE80">✓ {isEn ? "No nahs on this day" : "ഇന്ന് നഹ്സ് ഇല്ല"}</Line>;
  return flags.map((f) => <Line key={f} color="#F87171">⛔ {f}</Line>);
}

// Al-Siraji: no engagement, contract or wedding on an eclipse day. The
// day is the Kashf day, from the sunset before it to its own sunset.
function EclipseFlag({ span, isEn }) {
  const list = span ? eclipsesIn(span[0], span[1]) : [];
  return list.map((e) => (
    <Line key={e.at} color="#F87171">
      ⛔ {e.type === "solar"
        ? (isEn ? "Solar eclipse (كسوف الشمس) this day" : "ഇന്ന് സൂര്യഗ്രഹണം (كسوف الشمس)")
        : (isEn ? "Lunar eclipse (خسوف القمر) this day" : "ഇന്ന് ചന്ദ്രഗ്രഹണം (خسوف القمر)")}
      {" — "}{isEn ? `${ECLIPSE_SOURCE.scholar_en}: ${ECLIPSE_SOURCE.en}` : `${ECLIPSE_SOURCE.scholar_ml}: ${ECLIPSE_SOURCE.ml}`}
    </Line>
  ));
}

function DaySummary({ day, span, isEn }) {
  const w = day.wdInfo;
  return (
    <>
      <DayFlags day={day} isEn={isEn} />
      <EclipseFlag span={span} isEn={isEn} />
      <Line>{isEn ? "Lunar day" : "ചാന്ദ്രദിവസം"} {day.lunarDay ?? "—"}{(() => { const n = isEn ? MONTH_DAY_NOTE_EN[day.lunarDay] : day.monthDay?.note_ml; return n ? ` — ${n}` : ""; })()}</Line>
      {(isEn ? w.note_en : w.note_ml) && <Line>• {isEn ? w.note_en : w.note_ml}</Line>}
      <Line>• {isEn ? "Direction to avoid travelling" : "യാത്ര ഒഴിവാക്കേണ്ട ദിശ"}: <b style={{ color: "#F87171" }}>{isEn ? w.avoidDir_en : w.avoidDir_ml}</b></Line>
      <Line>• {isEn ? w.clothesNote_en : w.clothesNote_ml}</Line>
    </>
  );
}

const SEV_STYLE = {
  clear:  { bg: "rgba(74,222,128,0.10)",  bd: "rgba(74,222,128,0.35)",  fg: "#4ADE80", icon: "✓" },
  some:   { bg: "rgba(251,191,36,0.10)",  bd: "rgba(251,191,36,0.40)",  fg: "#FBBF24", icon: "⚠" },
  strong: { bg: "rgba(248,113,113,0.12)", bd: "rgba(248,113,113,0.45)", fg: "#F87171", icon: "⛔" },
  severe: { bg: "rgba(248,113,113,0.20)", bd: "rgba(248,113,113,0.70)", fg: "#FCA5A5", icon: "⛔" },
};

/**
 * How severe this hour is, by the books' own marks on the day, the
 * hour and the Moon together. Each mark is listed with the rule it
 * comes from, so the reader sees what is stacking and why — a waning
 * Moon alone reads differently from a waning Moon in a nahs burj on a
 * nahs day in a nahs hour.
 */
function Severity({ day, h, isEn }) {
  const sev = useMemo(() => timeSeverity(day, h), [day, h]);
  if (!sev || sev.count === 0) return null;
  const st = SEV_STYLE[sev.level.key] || SEV_STYLE.some;
  return (
    <div className="rounded-2xl p-3 space-y-1"
      style={{ background: st.bg, border: `1px solid ${st.bd}` }}>
      <p className="font-inter text-xs font-bold" style={{ color: st.fg }}>
        {st.icon} {isEn ? sev.level.en : sev.level.ml}
        <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
          {" "}· {sev.count} {isEn ? "marks" : "അടയാളം"}
          {sev.sides > 1 && (isEn ? `, across ${sev.sides} sides` : `, ${sev.sides} വശങ്ങളിൽ`)}
        </span>
      </p>
      {sev.marks.filter((m) => m.tag !== "work").map((m, i) => (
        <p key={i} className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>
          • {isEn ? m.en : m.ml}
        </p>
      ))}

      {/* What the book attaches to this time, in its own words. It is
          kept apart from the nahs marks above: those say why the time
          is nahs, this says what the book puts in it. */}
      {sev.marks.some((m) => m.tag === "work") && (
        <div className="pt-1.5 mt-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <p className="font-inter text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.55)" }}>
            {isEn
              ? `What the book attaches to this manzil (Kashf p.${MANSION_WORK_SOURCE.page})`
              : `ഈ മൻസിലിന് കിതാബ് ചേർത്തുപറയുന്നത് (കശ്ഫ് പേ.${MANSION_WORK_SOURCE.page})`}
          </p>
          {sev.marks.filter((m) => m.tag === "work").map((m, i) => (
            <p key={i} className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>
              📜 {isEn ? m.en : m.ml}
            </p>
          ))}
        </div>
      )}

      <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
        {isEn
          ? "These are the books' marks on this time, each from the rule named. What is done with a time is the reader's own affair."
          : "ഈ സമയത്തിന്മേൽ കിതാബുകൾ വെക്കുന്ന അടയാളങ്ങളാണിവ, ഓരോന്നും പറഞ്ഞ നിയമത്തിൽ നിന്ന്. ഈ സമയം എന്തിന് ഉപയോഗിക്കണമെന്നത് വായനക്കാരന്റെ കാര്യം."}
      </p>
    </div>
  );
}

function Sheet({ h, data, onClose, isEn }) {
  const [openAct, setOpenAct] = useState(null);
  if (!h) return null;
  const p = PLANETS[h.planet], day = data.day, tz = data.tz;
  const dos = h.activities.filter((a) => a.verdict === "do");
  const avoids = h.activities.filter((a) => a.verdict === "avoid");
  const moon = h.moon;
  const isIjaba = h.period === "day" && h.activities.some((a) => a.why.some((w) => w.tag === "ijaba"));
  const isGhalaba = h.period === "day" && h.activities.some((a) => a.why.some((w) => w.tag === "ghalaba"));
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, scale: 0.92, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 60, scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-4 space-y-3"
        style={{ background: "linear-gradient(180deg,#0B1530,#050B1A)", border: "1px solid rgba(245,208,96,0.35)" }}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-4xl" style={{ color: GOLD }}>{p.symbol}</span>
          <div className="flex-1 min-w-0">
            <p className="text-base" style={{ color: "#fff" }}>{planetName(p, isEn)}</p>
            <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              {h.period === "night" ? (isEn ? "Night" : "രാവ്") : (isEn ? "Day" : "പകൽ")} — {isEn ? "Sa'a" : "സാഅത്ത്"} {h.num} · {formatClock(h.start, tz)} – {formatClock(h.end, tz)}
              {h.status === "current" && <> · <span style={{ color: "#4ADE80" }}>{isEn ? "left" : "ബാക്കി"} {remaining(h.end - Date.now(), isEn)}</span></>}
            </p>
          </div>
          <Ring value={h.score} size={52} />
          <button type="button" onClick={onClose} className="text-xl px-2" style={{ color: "rgba(255,255,255,0.5)" }} aria-label="close">✕</button>
        </div>

        <Severity day={day} h={h} isEn={isEn} />

        {/* Quick answer */}
        <div className="grid grid-cols-2 gap-2">
          <Box title={isEn ? "Do now" : "ഇപ്പോൾ ചെയ്യാം"}>
            {dos.length ? dos.slice(0, 5).map((a) => <Line key={a.id} color="#4ADE80">{a.icon} {isEn ? a.en : a.ml} · {a.total}%</Line>) : <Line>—</Line>}
          </Box>
          <Box title={isEn ? "Avoid now" : "ഇപ്പോൾ ഒഴിവാക്കുക"}>
            {avoids.length ? avoids.slice(0, 5).map((a) => <Line key={a.id} color="#F87171">{a.icon} {isEn ? a.en : a.ml} · {a.total}%</Line>) : <Line>—</Line>}
          </Box>
        </div>

        <Box title={isEn ? "Today" : "ഇന്ന്"}>
          <Line>{dayName(day.wdInfo, isEn)} · {hijriText(day, isEn)} <span className="font-amiri" style={{ color: GOLD }}>{day.hijriMonth_ar}</span></Line>
          <DaySummary day={day} isEn={isEn} />
          <Others isEn={isEn} items={[
            ...(day.hijri ? tahaNahsFor(day.hijri.month, day.hijri.day).map((r) => ({ src: "taha", color: "#F87171", ml: `${r.ml} പ്രകാരം ഇന്ന് നഹ്സ്`, en: `Nahs today per the ${r.en.toLowerCase()}` })) : []),
            WEEKDAY_OTHER[day.weekday],
          ]} />
        </Box>

        <Box title={isEn ? "This sa'a" : "ഈ സാഅത്ത്"}>
          <Line>{isEn ? NATURE_LABEL[p.nature].en : NATURE_LABEL[p.nature].ml} <span className="font-amiri" style={{ color: GOLD }}>{NATURE_LABEL[p.nature].ar}</span></Line>
          {isIjaba && <Line color="#4ADE80">🤲 {isEn ? "Sa'at al-ijaba — du'a is answered" : "ഇജാബത്തിന്റെ സാഅത്ത് — ദുആ സ്വീകരിക്കപ്പെടും"}</Line>}
          {isGhalaba && <Line color="#60A5FA">🏆 {isEn ? "Sa'at al-mughalaba — hour of victory" : "മുഗാലബയുടെ സാഅത്ത് — ജയത്തിന്റെ സമയം"}</Line>}
          <Others isEn={isEn} items={PLANET_OTHER[h.planet]} />
        </Box>

        {moon?.mansion && (
          <Box title={isEn ? "Qamar (Moon)" : "ഖമർ (ചന്ദ്രൻ)"}>
            <Line>{isEn ? "Manzil" : "മൻസിൽ"} {moon.mansionNo}: <ArName tr={isEn ? MANSIONS_EN[moon.mansionNo].name : moon.mansion.ml} ar={moon.mansion.ar} /></Line>
            <Line>{isEn ? "Burj" : "ബുർജ്"}: <ArName tr={isEn ? SIGNS_TR_EN[moon.sign] : SIGNS_TR_ML[moon.sign]} ar={SIGNS_AR[moon.sign]} meaning={isEn ? SIGNS_EN[moon.sign] : SIGNS_ML[moon.sign]} strong={false} /></Line>
            <Line color={moon.mansion.nature === "saad" ? "#4ADE80" : moon.mansion.nature === "nahs" ? "#F87171" : "#FBBF24"}>
              {isEn ? "Kharusi" : "ഖറൂസി"}: {moon.mansion.nature === "saad" ? (isEn ? "Sa'd (benefic)" : "സഅ്ദ് (ശുഭം)") : moon.mansion.nature === "nahs" ? (isEn ? "Nahs (malefic)" : "നഹ്സ് (അശുഭം)") : (isEn ? "Mumtazij (mixed)" : "മുംതസിജ് (കലർന്നത്)")}
            </Line>
            {(() => {
              const mid = (h.start + h.end) / 2, loc = getUserLocation();
              const ms = moonSpan("mansion", moon.mansionNo - 1, mid), bs = moonSpan("sign", moon.sign, mid);
              return (
                <Line color="#93C5FD">⏱ {isEn ? "Manzil until" : "ഈ മൻസിൽ"} {ms?.end ? fmtWhen(ms.end, loc, isEn) : "—"}{isEn ? "" : " വരെ"} · {isEn ? "burj until" : "ഈ ബുർജ്"} {bs?.end ? fmtWhen(bs.end, loc, isEn) : "—"}{isEn ? "" : " വരെ"}</Line>
              );
            })()}
            <Line color={moon.waxing ? "#4ADE80" : "#FBBF24"}>
              {moon.waxing
                ? (isEn ? "Waxing — gaining light" : "വളരുന്നു — നൂർ കൂടുന്നു")
                : (isEn ? "Waning — losing light" : "ക്ഷയിക്കുന്നു — നൂർ കുറയുന്നു")}
              {day.isMuhaq && (isEn ? " · Muhaq, the month's last three days" : " · മുഹാഖ്, മാസാവസാനത്തെ മൂന്ന് ദിവസം")}
            </Line>
            {MANSION_WORK[moon.mansionNo] && (
              <Line color={MANSION_WORK[moon.mansionNo].harm ? "#FCA5A5" : "rgba(255,255,255,0.75)"}>
                📜 {isEn ? "Kharusi's table" : "ഖറൂസ്വിയുടെ പട്ടിക"}:{" "}
                {isEn ? MANSION_WORK[moon.mansionNo].en : MANSION_WORK[moon.mansionNo].ml}{" "}
                <span className="font-amiri" style={{ color: GOLD }}>{MANSION_WORK[moon.mansionNo].ar}</span>
              </Line>
            )}
            <Line>{isEn ? "Nabhani — travel" : "നബ്ഹാനി — യാത്ര"}: {isEn ? MANSIONS_EN[moon.mansionNo].travel : moon.mansion.travel_ml}</Line>
            {(isEn ? MANSIONS_EN[moon.mansionNo].note : moon.mansion.note_ml) && <Line color="rgba(255,255,255,0.5)">{isEn ? MANSIONS_EN[moon.mansionNo].note : moon.mansion.note_ml}</Line>}
            <Others isEn={isEn} items={[mansionOther(moon.mansionNo, isEn), TAHA_NAHS_BURUJ.includes(moon.sign) ? { ...BURJ_OTHER_NOTE, color: "#F87171" } : null]} />
          </Box>
        )}

        {/* All activities with % */}
        <Box title={isEn ? "All activities — tap for reasons" : "എല്ലാ കാര്യങ്ങളും — കാരണം കാണാൻ അമർത്തുക"}>
          <div className="space-y-1.5">
            {h.activities.map((a) => {
              const v = VERDICT[a.verdict];
              const open = openAct === a.id;
              return (
                <button key={a.id} type="button" onClick={() => setOpenAct(open ? null : a.id)} className="w-full text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-5">{a.icon}</span>
                    <span className="flex-1 text-xs" style={{ color: "#fff" }}>{isEn ? a.en : a.ml}</span>
                    <span className="text-[10px] font-bold px-1.5 rounded" style={{ color: v.color, background: v.color + "1A" }}>{isEn ? v.en : v.ml}</span>
                    <span className="w-9 text-right font-inter text-xs font-bold tabular-nums" style={{ color: v.color }}>{a.total}%</span>
                  </div>
                  <div className="h-1.5 rounded-full mt-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div className="h-1.5 rounded-full" style={{ background: v.color }} initial={{ width: 0 }} animate={{ width: `${a.total}%` }} transition={{ duration: 0.6 }} />
                  </div>
                  <AnimatePresence>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                          {isEn ? "Day" : "ദിവസം"} {a.parts.day}% · {isEn ? "Sa'a" : "സാഅത്ത്"} {a.parts.hour}% · {isEn ? "Qamar" : "ഖമർ"} {a.parts.moon}%
                        </p>
                        {a.why.map((w, i) => <p key={i} className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>• {isEn ? w.en : w.ml}</p>)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </Box>

        <p className="font-inter text-[9px] text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
          <span className="font-amiri">{BOOK.ar}</span> · {isEn ? "Day" : "ദിവസം"} {WEIGHTS.day * 100}% · {isEn ? "Sa'a" : "സാഅത്ത്"} {WEIGHTS.hour * 100}% · {isEn ? "Qamar" : "ഖമർ"} {WEIGHTS.moon * 100}%
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function SaatGrid() {
  const { language, customDate } = useAstroClockLanguage();
  const isEn = language === "en"; // Arabic UI falls back to Malayalam here
  const [tick, setTick] = useState(0);
  const [locTick, setLocTick] = useState(0);
  const [openKey, setOpenKey] = useState(null);
  useBackLayer(openKey !== null, () => setOpenKey(null)); // Back closes the card sheet

  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 30000); return () => clearInterval(id); }, []);
  useEffect(() => subscribeLocation(() => setLocTick((t) => t + 1)), []);

  const data = useMemo(() => {
    const now = customDate ? customDate.getTime() : Date.now();
    return getPlanetaryDay(now, getUserLocation());
  }, [tick, locTick, customDate]);

  const open = data.hours.find((h) => `${h.period}-${h.num}` === openKey) || null;
  const cur = data.current;
  const night = data.hours.filter((h) => h.period === "night");
  const dayH = data.hours.filter((h) => h.period === "day");
  const loc = getUserLocation();

  return (
    <div className="space-y-3">
      {/* Day banner */}
      <div className="rounded-2xl p-3" style={{ background: data.day.isNahsDay ? "rgba(248,113,113,0.08)" : "rgba(74,222,128,0.06)", border: `1px solid ${data.day.isNahsDay ? "rgba(248,113,113,0.35)" : "rgba(74,222,128,0.25)"}` }}>
        <p className="text-sm" style={{ color: "#fff" }}>{dayName(data.day.wdInfo, isEn)}</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>{hijriText(data.day, isEn)} <span className="font-amiri" style={{ color: GOLD }}>{data.day.hijriMonth_ar}</span></p>
        <p className="font-inter text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
          📍 {loc.name || `${loc.lat?.toFixed?.(2)}, ${loc.lng?.toFixed?.(2)}`} · ☀ {formatClock(data.sunrise, data.tz)} · 🌙 {formatClock(data.sunset, data.tz)}
        </p>
        <DaySummary day={data.day} span={[data.prevSunset, data.sunset]} isEn={isEn} />
      </div>

      {/* Current hour — the main card */}
      {cur && (
        <motion.button type="button" onClick={() => setOpenKey(`${cur.period}-${cur.num}`)} whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl p-4 text-left"
          style={{ background: "linear-gradient(135deg,rgba(245,208,96,0.14),rgba(245,208,96,0.03))", border: "1px solid rgba(245,208,96,0.55)" }}>
          <div className="flex items-center gap-3">
            <span className="text-4xl" style={{ color: GOLD }}>{PLANETS[cur.planet].symbol}</span>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: "#4ADE80" }}>● {isEn ? "Current sa'a" : "ഇപ്പോഴത്തെ സാഅത്ത്"} · {isEn ? "left" : "ബാക്കി"} {remaining(cur.end - Date.now(), isEn)}</p>
              <p className="text-base" style={{ color: "#fff" }}>{planetName(PLANETS[cur.planet], isEn)}</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                ✓ {cur.activities.filter((a) => a.verdict === "do").slice(0, 3).map((a) => (isEn ? a.en : a.ml)).join(", ") || "—"}
              </p>
              <p className="text-[11px]" style={{ color: "rgba(248,113,113,0.85)" }}>
                ✕ {cur.activities.filter((a) => a.verdict === "avoid").slice(0, 3).map((a) => (isEn ? a.en : a.ml)).join(", ") || "—"}
              </p>
            </div>
            <Ring value={cur.score} size={56} />
          </div>
          <p className="font-inter text-[9px] mt-2 text-center" style={{ color: "rgba(245,208,96,0.6)" }}>{isEn ? "Tap for full details" : "വിശദമായി കാണാൻ അമർത്തുക"}</p>
        </motion.button>
      )}

      {/* Night then day of this planetary day */}
      <div>
        <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "rgba(129,140,248,0.7)" }}>
          🌙 {isEn ? `Layl — night of ${data.day.wdInfo.tr_en} (${data.day.wdInfo.en}), from the previous sunset` : `ലൈൽ — ${data.day.wdInfo.tr_ml} (${data.day.wdInfo.ml}) രാവ്, തലേന്നത്തെ അസ്തമയം മുതൽ`}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {night.map((h) => <HourChip key={`n${h.num}`} h={h} tz={data.tz} isEn={isEn} onOpen={() => setOpenKey(`night-${h.num}`)} />)}
        </div>
      </div>
      <div>
        <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "rgba(245,208,96,0.7)" }}>
          ☀ {isEn ? `Nahar — day of ${data.day.wdInfo.tr_en} (${data.day.wdInfo.en})` : `നഹാർ — ${data.day.wdInfo.tr_ml} (${data.day.wdInfo.ml}) പകൽ`}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {dayH.map((h) => <HourChip key={`d${h.num}`} h={h} tz={data.tz} isEn={isEn} onOpen={() => setOpenKey(`day-${h.num}`)} />)}
        </div>
      </div>

      <AnimatePresence>{open && <Sheet key={openKey} h={open} data={data} isEn={isEn} onClose={() => setOpenKey(null)} />}</AnimatePresence>
    </div>
  );
}

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
import { getPlanetaryDay, formatClock } from "@/lib/kashfSaatEngine";
import { PLANETS, NATURE_LABEL, SIGNS_ML, WEIGHTS, BOOK } from "@/lib/kashfSaatData";

const GOLD = "#F5D060";
const VERDICT = {
  do:    { ml: "ചെയ്യാം",      en: "Do",        color: "#4ADE80" },
  care:  { ml: "ശ്രദ്ധയോടെ",    en: "With care", color: "#FBBF24" },
  avoid: { ml: "ഒഴിവാക്കുക",    en: "Avoid",     color: "#F87171" },
};
const scoreColor = (s) => (s >= 65 ? "#4ADE80" : s >= 40 ? "#FBBF24" : "#F87171");

function remaining(ms) {
  if (ms <= 0) return "0m";
  const m = Math.floor(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

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
        <span className="block font-bold text-xs truncate" style={{ color: "#fff" }}>{isEn ? p.en : p.ml} <span className="font-amiri" style={{ color: "rgba(245,208,96,0.6)" }}>{p.ar}</span></span>
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

function DayFlags({ day, isEn }) {
  const flags = [];
  if (day.isKamil) flags.push(isEn ? `Kawamil nahs day (${day.lunarDay})` : `കവാമിൽ നഹ്സ് ദിവസം (${day.lunarDay})`);
  if (day.isKhalili) flags.push(isEn ? "Monthly nahs day (al-Khalili)" : "ഖലീലിയുടെ മാസ-നഹ്സ് ദിവസം");
  if (day.isLastWed) flags.push(isEn ? "Last Wednesday of the month" : "മാസത്തിലെ അവസാന ബുധൻ");
  if (!flags.length && day.monthDay?.nature === "bad") flags.push(isEn ? "Nahs lunar day" : "നഹ്സ് ചാന്ദ്രദിവസം");
  if (!flags.length) return <Line color="#4ADE80">✓ {isEn ? "No nahs on this day" : "ഇന്ന് നഹ്സ് ഇല്ല"}</Line>;
  return flags.map((f) => <Line key={f} color="#F87171">⛔ {f}</Line>);
}

function DaySummary({ day, isEn }) {
  const w = day.wdInfo;
  return (
    <>
      <DayFlags day={day} isEn={isEn} />
      <Line>{isEn ? "Lunar day" : "ചാന്ദ്രദിവസം"} {day.lunarDay ?? "—"}{day.monthDay?.note_ml && !isEn ? ` — ${day.monthDay.note_ml}` : ""}</Line>
      {w.note_ml && !isEn && <Line>• {w.note_ml}</Line>}
      <Line>• {isEn ? "Avoid travelling" : "യാത്ര ഒഴിവാക്കേണ്ട ദിശ"}: <b style={{ color: "#F87171" }}>{w.avoidDir_ml}</b></Line>
      {!isEn && <Line>• {w.clothesNote_ml}</Line>}
    </>
  );
}

function Sheet({ h, data, onClose, isEn }) {
  const [openAct, setOpenAct] = useState(null);
  if (!h) return null;
  const p = PLANETS[h.planet], day = data.day, tz = data.tz;
  const dos = h.activities.filter((a) => a.verdict === "do");
  const avoids = h.activities.filter((a) => a.verdict === "avoid");
  const moon = h.moon;
  const isIjaba = h.period === "day" && h.activities.some((a) => a.why.some((w) => w.includes("ഇജാബ")));
  const isGhalaba = h.period === "day" && h.activities.some((a) => a.why.some((w) => w.includes("മുഗാലബ")));
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
            <p className="font-bold text-base" style={{ color: "#fff" }}>{isEn ? p.en : p.ml} <span className="font-amiri" style={{ color: GOLD }}>{p.ar}</span></p>
            <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              {h.period === "night" ? (isEn ? "Night" : "രാത്രി") : (isEn ? "Day" : "പകൽ")} #{h.num} · {formatClock(h.start, tz)} – {formatClock(h.end, tz)}
              {h.status === "current" && <> · <span style={{ color: "#4ADE80" }}>{isEn ? "left" : "ബാക്കി"} {remaining(h.end - Date.now())}</span></>}
            </p>
          </div>
          <Ring value={h.score} size={52} />
          <button type="button" onClick={onClose} className="text-xl px-2" style={{ color: "rgba(255,255,255,0.5)" }} aria-label="close">✕</button>
        </div>

        {/* Quick answer */}
        <div className="grid grid-cols-2 gap-2">
          <Box title={isEn ? "Do now" : "ഇപ്പോൾ ചെയ്യാം"}>
            {dos.length ? dos.slice(0, 5).map((a) => <Line key={a.id} color="#4ADE80">{a.icon} {isEn ? a.en : a.ml} · {a.total}%</Line>) : <Line>—</Line>}
          </Box>
          <Box title={isEn ? "Avoid now" : "ഇപ്പോൾ ഒഴിവാക്കുക"}>
            {avoids.length ? avoids.slice(0, 5).map((a) => <Line key={a.id} color="#F87171">{a.icon} {isEn ? a.en : a.ml} · {a.total}%</Line>) : <Line>—</Line>}
          </Box>
        </div>

        <Box title={`${isEn ? "Today" : "ഇന്ന്"} — ${isEn ? day.wdInfo.en : day.wdInfo.ml} · ${day.hijriLabel_ml}`}>
          <DaySummary day={day} isEn={isEn} />
        </Box>

        <Box title={isEn ? "This hour" : "ഈ മണിക്കൂർ"}>
          <Line>{isEn ? NATURE_LABEL[p.nature].en : NATURE_LABEL[p.nature].ml} (p.266)</Line>
          {isIjaba && <Line color="#4ADE80">🤲 {isEn ? "Hour of answered du'a (p.53)" : "ദുആ സ്വീകരിക്കപ്പെടുന്ന ഇജാബത്തിന്റെ മണിക്കൂർ (p.53)"}</Line>}
          {isGhalaba && <Line color="#60A5FA">🏆 {isEn ? "Hour of victory (p.53)" : "ജയത്തിന്റെ (മുഗാലബ) മണിക്കൂർ (p.53)"}</Line>}
        </Box>

        {moon?.mansion && (
          <Box title={isEn ? "Moon" : "ചന്ദ്രൻ"}>
            <Line>{isEn ? "Mansion" : "മൻസിൽ"} {moon.mansionNo}: <b>{moon.mansion.ml}</b> <span className="font-amiri" style={{ color: GOLD }}>{moon.mansion.ar}</span> · {SIGNS_ML[moon.sign]}</Line>
            <Line color={moon.mansion.nature === "saad" ? "#4ADE80" : moon.mansion.nature === "nahs" ? "#F87171" : "#FBBF24"}>
              {moon.mansion.nature === "saad" ? "ശുഭം" : moon.mansion.nature === "nahs" ? "അശുഭം" : "കലർന്നത്"} · {isEn ? "Travel" : "യാത്ര"}: {moon.mansion.travel_ml}
            </Line>
            {moon.mansion.note_ml && <Line color="rgba(255,255,255,0.5)">{moon.mansion.note_ml}</Line>}
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
                          {isEn ? "Day" : "ദിവസം"} {a.parts.day}% · {isEn ? "Hour" : "മണിക്കൂർ"} {a.parts.hour}% · {isEn ? "Moon" : "ചന്ദ്രൻ"} {a.parts.moon}%
                        </p>
                        {a.why.map((w, i) => <p key={i} className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>• {w}</p>)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </Box>

        <p className="font-inter text-[9px] text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
          {BOOK.ar} · {isEn ? "Day" : "ദിവസം"} {WEIGHTS.day * 100}% · {isEn ? "Hour" : "മണിക്കൂർ"} {WEIGHTS.hour * 100}% · {isEn ? "Moon" : "ചന്ദ്രൻ"} {WEIGHTS.moon * 100}%
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function SaatGrid() {
  const { txt, language, customDate } = useAstroClockLanguage();
  const isEn = language === "en";
  const [tick, setTick] = useState(0);
  const [locTick, setLocTick] = useState(0);
  const [openKey, setOpenKey] = useState(null);

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
        <p className="font-bold text-sm" style={{ color: "#fff" }}>
          {isEn ? data.day.wdInfo.en : data.day.wdInfo.ml} <span className="font-amiri" style={{ color: GOLD }}>{data.day.wdInfo.ar}</span> · {data.day.hijriLabel_ml}
        </p>
        <p className="font-inter text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
          📍 {loc.name || `${loc.lat?.toFixed?.(2)}, ${loc.lng?.toFixed?.(2)}`} · ☀ {formatClock(data.sunrise, data.tz)} · 🌙 {formatClock(data.sunset, data.tz)}
        </p>
        <DaySummary day={data.day} isEn={isEn} />
      </div>

      {/* Current hour — the main card */}
      {cur && (
        <motion.button type="button" onClick={() => setOpenKey(`${cur.period}-${cur.num}`)} whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl p-4 text-left"
          style={{ background: "linear-gradient(135deg,rgba(245,208,96,0.14),rgba(245,208,96,0.03))", border: "1px solid rgba(245,208,96,0.55)" }}>
          <div className="flex items-center gap-3">
            <span className="text-4xl" style={{ color: GOLD }}>{PLANETS[cur.planet].symbol}</span>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: "#4ADE80" }}>● {txt("ഇപ്പോഴത്തെ മണിക്കൂർ", "Current hour")} · {txt("ബാക്കി", "left")} {remaining(cur.end - Date.now())}</p>
              <p className="font-bold text-base" style={{ color: "#fff" }}>{isEn ? PLANETS[cur.planet].en : PLANETS[cur.planet].ml} <span className="font-amiri" style={{ color: GOLD }}>{PLANETS[cur.planet].ar}</span></p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                ✓ {cur.activities.filter((a) => a.verdict === "do").slice(0, 3).map((a) => (isEn ? a.en : a.ml)).join(", ") || "—"}
              </p>
              <p className="text-[11px]" style={{ color: "rgba(248,113,113,0.85)" }}>
                ✕ {cur.activities.filter((a) => a.verdict === "avoid").slice(0, 3).map((a) => (isEn ? a.en : a.ml)).join(", ") || "—"}
              </p>
            </div>
            <Ring value={cur.score} size={56} />
          </div>
          <p className="font-inter text-[9px] mt-2 text-center" style={{ color: "rgba(245,208,96,0.6)" }}>{txt("വിശദമായി കാണാൻ അമർത്തുക", "Tap for full details")}</p>
        </motion.button>
      )}

      {/* Night then day of this planetary day */}
      <div>
        <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "rgba(129,140,248,0.7)" }}>
          🌙 {txt(`${data.day.wdInfo.ml} രാവ് (തലേന്ന് അസ്തമയം മുതൽ)`, `Night of ${data.day.wdInfo.en} (from the previous sunset)`)}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {night.map((h) => <HourChip key={`n${h.num}`} h={h} tz={data.tz} isEn={isEn} onOpen={() => setOpenKey(`night-${h.num}`)} />)}
        </div>
      </div>
      <div>
        <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "rgba(245,208,96,0.7)" }}>
          ☀ {txt(`${data.day.wdInfo.ml} പകൽ`, `Day of ${data.day.wdInfo.en}`)}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {dayH.map((h) => <HourChip key={`d${h.num}`} h={h} tz={data.tz} isEn={isEn} onOpen={() => setOpenKey(`day-${h.num}`)} />)}
        </div>
      </div>

      <AnimatePresence>{open && <Sheet key={openKey} h={open} data={data} isEn={isEn} onClose={() => setOpenKey(null)} />}</AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KASHF REFERENCE SECTIONS — one place per subject, Kashf al-Haqa'iq only
//   QamarSection   — the Moon now + 28 manazil + 12 buruj (moon rules)
//   KawakibSection — the 7 planets (nature p.266, hours, Jaad table p.54)
//   AyyamSection   — 7 weekdays + 30 lunar days + kawamil + Khalili nahs
// Arabic terms stay Arabic in both languages; the meaning follows in brackets.
// Data: src/lib/kashfSaatData.js (same source as the Saat cards)
// ═══════════════════════════════════════════════════════════════
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { calculateMoonPosition } from "@/lib/astroClockMoonPosition";
import * as K from "@/lib/kashfSaatData";

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
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: highlight ? "rgba(245,208,96,0.10)" : "rgba(255,255,255,0.03)", border: `1px solid ${highlight ? "rgba(245,208,96,0.55)" : "rgba(255,255,255,0.08)"}` }}>
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
const Src = ({ children }) => <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>📖 <span className="font-amiri">{K.BOOK.ar}</span> · {children}</p>;

// ── QAMAR ──────────────────────────────────────────────────────
export function QamarSection() {
  const { isEn, customDate } = useLang();
  const [open, setOpen] = useState(null);
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
        <P>{isEn ? "Manzil" : "മൻസിൽ"} {moon.mansionNo}: <b style={{ color: "#fff" }}>{isEn ? mnEn.name : mn.ml}</b> <Ar>{mn.ar}</Ar> · <span style={{ color: NAT_COLOR[mn.nature] }}>{natLabel(mn.nature, isEn)}</span></P>
        <P>{isEn ? "Burj" : "ബുർജ്"}: <b style={{ color: "#fff" }}>{isEn ? K.SIGNS_TR_EN[moon.sign] : K.SIGNS_TR_ML[moon.sign]}</b> <Ar>{K.SIGNS_AR[moon.sign]}</Ar> ({isEn ? K.SIGNS_EN[moon.sign] : K.SIGNS_ML[moon.sign]}) · {moon.lon.toFixed(1)}°</P>
        <P>{phase} · {moon.light.toFixed(0)}%</P>
        <P>✓ {actList(mn.good, isEn)}</P>
        {mn.avoid.length > 0 && <P color="#F87171">✕ {actList(mn.avoid, isEn)}</P>}
        <P>🧳 {isEn ? "Travel" : "യാത്ര"}: {isEn ? mnEn.travel : mn.travel_ml}</P>
        <P>🤲 {isEn ? "For needs, use the hour of" : "ആവശ്യങ്ങൾക്ക് ഉചിതമായ സാഅത്ത്"}: <b style={{ color: "#fff" }}>{isEn ? K.PLANETS[K.MOON_SIGN_NEEDS_HOUR[moon.sign]].tr_en : K.PLANETS[K.MOON_SIGN_NEEDS_HOUR[moon.sign]].tr_ml}</b> <Ar>{K.PLANETS[K.MOON_SIGN_NEEDS_HOUR[moon.sign]].ar}</Ar></P>
        {moon.sign === 7 && <P color="#F87171">💍 {isEn ? "Qamar in Aqrab: no nikah (p.66)" : "ഖമർ അഖ്റബിൽ: നിക്കാഹ് വേണ്ട (p.66)"}</P>}
        <Src>{isEn ? "manazil divided equally from 0° Hamal (p.127)" : "0° ഹമൽ മുതൽ 28 തുല്യ ഭാഗം (p.127)"}</Src>
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
                <P>✓ {actList(m.good, isEn)}</P>
                {m.avoid.length > 0 && <P color="#F87171">✕ {actList(m.avoid, isEn)}</P>}
                <P>🧳 {isEn ? en.travel : m.travel_ml}{K.TRAVEL_GOOD_MANSIONS.includes(n) ? (isEn ? " · good for travel (p.75)" : " · യാത്രയ്ക്ക് നല്ലത് (p.75)") : ""}</P>
                {K.MARRIAGE_GOOD_MANSIONS.includes(n) && <P color="#4ADE80">💍 {isEn ? "Good for nikah (p.76-77)" : "നിക്കാഹിന് നല്ലത് (p.76-77)"}</P>}
                {(isEn ? en.note : m.note_ml) && <P color="rgba(255,255,255,0.5)">{isEn ? en.note : m.note_ml}</P>}
                <P color="rgba(255,255,255,0.4)">{(n - 1) * (360 / 28) | 0}° – {(n * (360 / 28)) | 0}°</P>
              </Row>
            );
          })}
          <Src>{isEn ? "nature p.55-56 · travel p.68-69 · works p.115-124" : "സ്വഭാവം p.55-56 · യാത്ര p.68-69 · പ്രവൃത്തികൾ p.115-124"}</Src>
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
                <P>🤲 {isEn ? "Qamar here → needs in the hour of" : "ഖമർ ഇവിടെ → ആവശ്യങ്ങൾക്ക്"} <b style={{ color: "#fff" }}>{isEn ? hp.tr_en : hp.tr_ml}</b> <Ar>{hp.ar}</Ar> ({isEn ? hp.en : hp.ml}) (p.54)</P>
                {i === 7 && <P color="#F87171">💍 {isEn ? "Qamar here: no nikah (p.66)" : "ഖമർ ഇവിടെ: നിക്കാഹ് വേണ്ട (p.66)"}</P>}
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
  sun: ["അധികാരികളെ കാണാൻ (p.26)", "Meeting officials (p.26)"],
  jupiter: ["ആവശ്യങ്ങൾ, റിസ്ഖ്, കച്ചവടം (p.27)", "Needs, rizq, trade (p.27)"],
  venus: ["നിക്കാഹ്, സ്നേഹം (p.13)", "Nikah, affection (p.13)"],
};

export function KawakibSection() {
  const { isEn } = useLang();
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-1.5">
      <P color="rgba(255,255,255,0.55)">{isEn ? "Order of the hours (p.14-15): " : "സാഅത്തുകളുടെ ക്രമം (p.14-15): "}
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
            <P>{isEn ? K.NATURE_LABEL[p.nature].en : K.NATURE_LABEL[p.nature].ml} <Ar>{K.NATURE_LABEL[p.nature].ar}</Ar> (p.266)</P>
            <P>📅 {isEn ? "Rules the day" : "ഭരിക്കുന്ന ദിവസം"}: <b style={{ color: "#fff" }}>{isEn ? `Yawm al-${wd.tr_en}` : `യൗമുൽ ${wd.tr_ml}`}</b> <Ar>{wd.ar}</Ar> ({isEn ? wd.en : wd.ml}) — {isEn ? "its 1st day-hour" : "പകലിലെ ഒന്നാം സാഅത്ത്"}</P>
            {AFFINITY_NOTE[k] && <P color="#4ADE80">✓ {isEn ? AFFINITY_NOTE[k][1] : AFFINITY_NOTE[k][0]}</P>}
            {jaad.length > 0 && <P>{isEn ? "Sheikh Jaad's table (p.54)" : "ശൈഖ് ജാഇദിന്റെ പട്ടിക (p.54)"}: {jaad.map(([d, role]) => `${isEn ? K.WEEKDAYS[d].tr_en : K.WEEKDAYS[d].tr_ml} — ${isEn ? JAAD_ROLE[role][1] : JAAD_ROLE[role][0]}`).join(" · ")}</P>}
            <P color="rgba(255,255,255,0.5)">{isEn ? "Metal" : "ലോഹം"}: {isEn ? p.metal_en : p.metal_ml}</P>
          </Row>
        );
      })}
      <Src>p.13-15, 26-27, 54, 266</Src>
    </div>
  );
}

// ── AYYAM ──────────────────────────────────────────────────────
export function AyyamSection() {
  const { isEn } = useLang();
  const [open, setOpen] = useState(null);
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
                <P color="#4ADE80">✓ {actList(w.good, isEn)} (p.59, 66)</P>
                {(isEn ? w.note_en : w.note_ml) && <P>• {isEn ? w.note_en : w.note_ml}</P>}
                <P>👕 {isEn ? w.clothesNote_en : w.clothesNote_ml} (p.67)</P>
                <P>🧭 {isEn ? "Avoid travelling towards" : "യാത്ര ഒഴിവാക്കേണ്ട ദിശ"}: <b style={{ color: "#F87171" }}>{isEn ? w.avoidDir_en : w.avoidDir_ml}</b> (p.57)</P>
                <P>🤲 {isEn ? "Ijaba hour" : "ഇജാബത്തിന്റെ സാഅത്ത്"}: {isEn ? "day-hour" : "പകലിലെ"} {K.IJABA_HOUR[i]} · 🏆 {isEn ? "Mughalaba hour" : "മുഗാലബ സാഅത്ത്"}: {isEn ? "day-hour" : "പകലിലെ"} {K.MUGHALABA_HOUR[i]} (p.53)</P>
                {K.MASTERS_HOURS.days.includes(i) && <P>⭐ {isEn ? "Day-hours 1 and 8 are excellent (p.13)" : "പകലിലെ 1, 8 സാഅത്തുകൾ ശ്രേഷ്ഠം (p.13)"}</P>}
              </Row>
            );
          })}
        </div>
      )}

      {tab === "month" && (
        <div className="space-y-1.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
            const md = K.MONTH_DAYS[d], kamil = K.KAWAMIL.includes(d);
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
                {kamil && <P color="#F87171">⛔ {isEn ? "One of the seven kawamil days (p.57-58)" : "ഏഴ് കവാമിൽ ദിവസങ്ങളിൽ ഒന്ന് (p.57-58)"}</P>}
              </Row>
            );
          })}
          <Src>p.60-65</Src>
        </div>
      )}

      {tab === "nahs" && (
        <div className="space-y-3">
          <Card title={isEn ? "Al-Kawamil — 7 days of every month (p.57-58)" : "അൽ-കവാമിൽ — എല്ലാ മാസവും 7 ദിവസം (p.57-58)"}>
            <P><b style={{ color: "#F87171" }}>{K.KAWAMIL.join(", ")}</b></P>
            <P>{isEn ? "Avoid" : "ഒഴിവാക്കുക"}: {actList(K.KAWAMIL_AVOID, isEn)}</P>
            <P>{isEn ? "Also the last Arbi'a (Wednesday) of each Hijri month (p.57)" : "കൂടാതെ ഓരോ ഹിജ്റ മാസത്തിലെയും അവസാന അർബിആഅ് (ബുധൻ) (p.57)"}</P>
          </Card>
          <Card title={isEn ? "Al-Khalili — one nahs day per month (p.59)" : "അൽ-ഖലീലി — ഓരോ മാസവും ഒരു നഹ്സ് ദിവസം (p.59)"}>
            <div className="grid grid-cols-2 gap-1">
              {K.HIJRI_MONTHS_AR.map((ar, i) => (
                <P key={i}><Ar>{ar}</Ar> {isEn ? K.HIJRI_MONTHS_EN[i] : K.HIJRI_MONTHS_ML[i]}: <b style={{ color: "#F87171" }}>{K.KHALILI_NAHS[i + 1]}</b></P>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

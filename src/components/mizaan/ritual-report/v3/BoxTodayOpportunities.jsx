import { Calendar, Clock } from "lucide-react";
import { G, T, Box, translatePlanet, saatDisplayNum, computeCompat, compatColor } from "./shared";

// BOX 4 — TODAY'S OPPORTUNITIES (conclusion-first)
// Conclusion: ⭐ Perform at Saat #X · Backup: #Y · Last: #Z.
// If none remain: "No suitable opportunity remains today."
// Then full time cards below as supporting details.
export default function BoxTodayOpportunities({ analysis, todayRemaining, lang }) {
  const windows = (todayRemaining || []).slice().sort((a, b) => (a.hour || 0) - (b.hour || 0));
  const matchingRules = analysis?.matchingRules || [];

  if (windows.length === 0) {
    return (
      <Box number={4} titleEn="Today's Opportunities" titleMl="ഇന്നത്തെ അവസരങ്ങൾ" icon={Calendar} lang={lang}>
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.40)" }}>
          <Clock className="w-5 h-5 flex-shrink-0" style={{ color: "#F87171" }} />
          <p className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#F87171" }}>
            {T("No suitable opportunity remains today.", "ഇന്ന് അനുയോജ്യ അവസരമൊന്നുമില്ല.", lang)}
          </p>
        </div>
        <p className={lang === "ml" ? "font-malayalam text-[10px] mt-2" : "font-inter text-[10px] mt-2"} style={{ color: "rgba(255,255,255,0.45)" }}>
          {T("Continuing to tomorrow — see Next Opportunity below.", "നാളെയ്ക്ക് തുടരുന്നു — താഴെ അടുത്ത അവസരം കാണുക.", lang)}
        </p>
      </Box>
    );
  }

  const first = windows[0];
  const last = windows[windows.length - 1];
  const firstC = computeCompat(analysis, { period: first.period, saatNumber: first.hour, planetLC: String(first.planet || "").toLowerCase() }).final;
  const firstColor = compatColor(firstC);
  const currentSuitable = analysis?.currentSaatAnalysis?.suitable;
  const liveNow = analysis?.liveNow || {};
  const curSaatNum = liveNow.saat;
  const curPlanet = liveNow.kawkab || liveNow.currentHour?.planet || "";

  return (
    <Box number={4} titleEn="Today's Opportunities" titleMl="ഇന്നത്തെ അവസരങ്ങൾ" icon={Calendar} lang={lang}>
      {/* CONCLUSION FIRST — the ⭐ summary line */}
      <div className="rounded-xl p-3 mb-3" style={{ background: `${firstColor}12`, border: `1px solid ${firstColor}50` }}>
        <p className="font-inter text-sm font-bold mb-1.5" style={{ color: firstColor }}>
          {currentSuitable
            ? `⭐ ${T("Perform during this Saat", "ഈ സഅാത്തിൽ ചെയ്യുക", lang)} #${curSaatNum} · ${translatePlanet(curPlanet, lang)}`
            : `⭐ ${T("Next Suitable Saat Today", "ഇന്നത്തെ അടുത്ത അനുയോജ്യ സഅാത്", lang)} #${saatDisplayNum(first.hour, first.period)} · ${translatePlanet(first.planet, lang)}`}
        </p>
        {windows.slice(1).map((w, i) => {
          const isLast = w === last;
          const label = isLast ? T("Last opportunity today", "ഇന്നത്തെ അവസാന അവസരം", lang) : T("Backup", "ബാക്കപ്പ്", lang);
          return (
            <p key={i} className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
              <span style={{ color: G.dim }}>⭐ </span>{label}: {T("Saat", "സഅാത്", lang)} #{saatDisplayNum(w.hour, w.period)} · {translatePlanet(w.planet, lang)}
            </p>
          );
        })}
      </div>

      {/* SUPPORTING DETAILS — full time cards */}
      <div className="space-y-2">
        {windows.map((w, i) => {
          const isBest = i === 0;
          const c = isBest ? firstC : computeCompat(analysis, { period: w.period, saatNumber: w.hour, planetLC: String(w.planet || "").toLowerCase() }).final;
          const cColor = compatColor(c);
          const rule = matchingRules.find(r => r.saat_number === w.hour && r.period === w.period);
          const reason = rule ? (lang === "ml" && rule.text_ml ? rule.text_ml : rule.text_en) : "";
          return (
            <div key={i} className="rounded-lg p-3" style={{ background: isBest ? `${cColor}10` : G.bg, border: `1px solid ${isBest ? `${cColor}55` : G.border}` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-inter text-sm font-bold" style={{ color: "#fff" }}>{T("Saat", "സഅാത്", lang)} #{saatDisplayNum(w.hour, w.period)}</span>
                <span className="font-inter text-[10px]" style={{ color: G.dim }}>·</span>
                <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{translatePlanet(w.planet, lang)}</span>
                {isBest && <span className="ml-auto font-inter text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: cColor, border: `1px solid ${cColor}60`, background: `${cColor}12` }}>★ {T("Best", "മികച്ചത്", lang)}</span>}
                {!isBest && <span className="ml-auto font-inter text-xs font-bold" style={{ color: cColor }}>{c}%</span>}
              </div>
              {w.startTime && w.endTime && <p className="font-inter text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.50)" }}>{w.startTime} – {w.endTime}</p>}
              {isBest && <p className="font-inter text-xs font-bold mb-1" style={{ color: cColor }}>{c}%</p>}
              {reason && <p className={lang === "ml" ? "font-malayalam text-[11px]" : "font-inter text-[11px]"} style={{ color: "rgba(255,255,255,0.65)" }}>{String(reason).split(/\n/)[0].slice(0, 80)}</p>}
              {rule && <p className="font-inter text-[9px] mt-0.5" style={{ color: G.dim }}>{rule.source}{rule.page ? ` · p.${rule.page}` : ""}</p>}
            </div>
          );
        })}
      </div>
      <p className={lang === "ml" ? "font-malayalam text-[10px] mt-3" : "font-inter text-[10px] mt-3"} style={{ color: "rgba(255,255,255,0.45)" }}>
        {T("When the current Saat passes, the next suitable Saat becomes the recommendation automatically.",
           "നിലവിലെ സഅാത് കഴിയുമ്പോൾ, അടുത്ത അനുയോജ്യ സഅാത് സ്വയമേവ ശുപാർശയാകും.", lang)}
      </p>
    </Box>
  );
}
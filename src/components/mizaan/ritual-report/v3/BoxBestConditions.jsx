import { useState } from "react";
import { Crown, ChevronDown } from "lucide-react";
import { G, T, Box, translatePlanet, translateDay, saatDisplayNum, computeCompat, compatColor, MIZAN_DAY_NAMES } from "./shared";

// BOX 8 — BEST POSSIBLE CONDITIONS (conclusion-first)
// ONE highest-ranked recommendation first. Then an expandable section to
// reveal alternative conditions.
export default function BoxBestConditions({ analysis, lang }) {
  const [showAlt, setShowAlt] = useState(false);
  const req = analysis?.req || {};
  const matchingRules = analysis?.matchingRules || [];

  const bestDayKey = req.days?.[0] || null;
  const bestDayName = bestDayKey ? MIZAN_DAY_NAMES[bestDayKey] : (analysis?.liveNow?.day || null);
  const bestPlanet = req.hours?.[0] || null;
  const planetLC = bestPlanet ? String(bestPlanet).toLowerCase() : null;
  const bestPeriod = req.nightRequired === true ? "night" : "day";
  const ruleWithPlanet = matchingRules.find(r => String(r.planet || "").toLowerCase() === planetLC);
  const bestSaatNum = ruleWithPlanet?.saat_number ? saatDisplayNum(ruleWithPlanet.saat_number, ruleWithPlanet.period) : null;
  const bestSaatPeriod = ruleWithPlanet?.period || bestPeriod;
  const c = computeCompat(analysis, { dayKey: bestDayKey || undefined, period: bestSaatPeriod, saatNumber: ruleWithPlanet?.saat_number || undefined, planetLC: planetLC || undefined }).final;
  const cColor = compatColor(c);
  const book = matchingRules[0] ? (matchingRules[0].page ? `${matchingRules[0].source} (p.${matchingRules[0].page})` : (matchingRules[0].source || "")) : "";

  const altDays = (req.days || []).slice(1);
  const altPlanets = (req.hours || []).slice(1);

  if (!bestDayName && !bestPlanet) {
    return (
      <Box number={8} titleEn="Best Possible Conditions" titleMl="ഏറ്റവും മികച്ച വ്യവസ്ഥകൾ" icon={Crown} lang={lang}>
        <p className={lang === "ml" ? "font-malayalam text-sm" : "font-inter text-sm"} style={{ color: "rgba(255,255,255,0.60)" }}>
          {T("The uploaded books do not prescribe a specific best combination for this purpose.",
             "അപ്‌ലോഡ് ചെയ്ത പുസ്തകങ്ങൾ ഈ ലക്ഷ്യത്തിന് പ്രത്യേക മികച്ച കൂട്ടായ്മ നിർദ്ദേശിക്കുന്നില്ല.", lang)}
        </p>
      </Box>
    );
  }

  const conclRows = [
    { k: T("Weekday", "ദിവസം", lang), v: bestDayName ? translateDay(bestDayName, lang) : "—" },
    { k: T("Saat", "സഅാത്", lang), v: bestSaatNum ? `#${bestSaatNum} · ${translatePlanet(bestPlanet, lang)}` : (bestPlanet ? translatePlanet(bestPlanet, lang) : "—") },
    { k: T("Day / Night", "പകൽ / രാത്രി", lang), v: bestPeriod === "night" ? T("Night", "രാത്രി", lang) : T("Day", "പകൽ", lang) },
  ];

  return (
    <Box number={8} titleEn="Best Possible Conditions" titleMl="ഏറ്റവും മികച്ച വ്യവസ്ഥകൾ" icon={Crown} lang={lang}>
      {/* CONCLUSION FIRST — single best */}
      <div className="rounded-xl p-3 mb-3" style={{ background: `${cColor}12`, border: `1px solid ${cColor}50` }}>
        <p className="font-inter text-sm font-bold mb-2" style={{ color: cColor }}>⭐ {T("Best combination", "മികച്ച കൂട്ടായ്മ", lang)}</p>
        <div className="space-y-1 mb-2">
          {conclRows.map((row, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{row.k}</span>
              <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{row.v}</span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Compatibility", "പൊരുത്തം", lang)}</span>
            <span className="font-inter text-sm font-bold" style={{ color: cColor }}>{c}%</span>
          </div>
        </div>
        {book && <p className="font-inter text-[9px]" style={{ color: G.dim }}>{T("Supporting Book", "പിന്തുണയ്ക്കുന്ന പുസ്തകം", lang)}: {book}</p>}
      </div>

      {/* Expandable alternatives */}
      {(altDays.length > 0 || altPlanets.length > 0) && (
        <>
          <button onClick={() => setShowAlt(s => !s)} className="w-full flex items-center gap-2 rounded-lg p-2.5" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{T("See alternative conditions", "ഇതര വ്യവസ്ഥകൾ കാണുക", lang)}</span>
            <ChevronDown className="w-4 h-4 ml-auto transition-transform" style={{ color: G.dim, transform: showAlt ? "rotate(180deg)" : "none" }} />
          </button>
          {showAlt && (
            <div className="mt-2 space-y-1.5">
              {altDays.map((d, i) => (
                <div key={`d${i}`} className="flex items-center gap-2 rounded-lg p-2" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                  <span className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Alt weekday", "ഇതര ദിവസം", lang)}</span>
                  <span className="font-inter text-xs font-bold ml-auto" style={{ color: "#fff" }}>{translateDay(MIZAN_DAY_NAMES[d], lang)}</span>
                </div>
              ))}
              {altPlanets.map((p, i) => (
                <div key={`p${i}`} className="flex items-center gap-2 rounded-lg p-2" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                  <span className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Alt planet", "ഇതര ഗ്രഹം", lang)}</span>
                  <span className="font-inter text-xs font-bold ml-auto" style={{ color: "#fff" }}>{translatePlanet(p, lang)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Box>
  );
}
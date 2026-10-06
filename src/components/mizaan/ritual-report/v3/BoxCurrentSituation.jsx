import { Activity } from "lucide-react";
import { G, T, Box, translatePlanet, translateDay, computeCompat, compatColor } from "./shared";

// BOX 2 — CURRENT SITUATION (conclusion-first)
// One clear verdict first: ✅ Suitable now / ❌ Not suitable now.
// Then supporting details: weekday, saat, planet, day/night, options, book rules.
export default function BoxCurrentSituation({ analysis, selections, lang }) {
  const live = analysis?.liveNow || {};
  const sel = analysis?.selectionAnalysis || {};
  const suitable = !!sel.suitable;
  const compat = computeCompat(analysis).final;
  const cColor = compatColor(compat);
  const bookRuleCount = (analysis?.matchingRules?.length || 0) + (analysis?.conflictingRules?.length || 0);

  const rows = [
    { labelEn: "Weekday", labelMl: "ആഴ്ച", value: translateDay(live.day, lang) },
    { labelEn: "Saat", labelMl: "സഅാത്", value: `#${live.saat} · ${translatePlanet(live.kawkab, lang)}` },
    { labelEn: "Planet", labelMl: "ഗ്രഹം", value: translatePlanet(live.kawkab, lang) },
    { labelEn: "Day / Night", labelMl: "പകൽ / രാത്രി", value: live.laylNahar === "Layl" ? T("Night (Layl)", "രാത്രി (ലൈൽ)", lang) : T("Day (Nahar)", "പകൽ (നഹർ)", lang) },
  ];

  const opts = [];
  if (selections?.elements?.length) opts.push(T("Element", "മൂലകം", lang) + ": " + selections.elements.join(", "));
  if (selections?.dayNight) opts.push(T("Period", "സമയം", lang) + ": " + (selections.dayNight === "gece" ? T("Night", "രാത്രി", lang) : T("Day", "പകൽ", lang)));
  if (selections?.khayrSharr8) opts.push(T("Khayr/Sharr", "ഖൈർ/ശർ", lang) + ": " + selections.khayrSharr8);

  return (
    <Box number={2} titleEn="Current Situation" titleMl="നിലവിലെ അവസ്ഥ" icon={Activity} lang={lang}>
      {/* CONCLUSION FIRST */}
      <div className="rounded-xl p-4 mb-3 flex items-center justify-between" style={{ background: `${cColor}12`, border: `1px solid ${cColor}50` }}>
        <div>
          <p className="font-inter text-lg font-bold" style={{ color: suitable ? "#4ADE80" : "#F87171" }}>
            {suitable ? "✅ " + T("Suitable now", "ഇപ്പോൾ അനുയോജ്യം", lang) : "❌ " + T("Not suitable now", "ഇപ്പോൾ അനുയോജ്യമല്ല", lang)}
          </p>
          <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>
            {suitable
              ? T("You can perform this ritual at the current moment.", "നിലവിലെ നിമിഷത്തിൽ ഈ കർമ്മം ചെയ്യാം.", lang)
              : T("Wait for a better moment — see below.", "മികച്ച നിമിഷത്തിനായി കാത്തിരിക്കുക — താഴെ കാണുക.", lang)}
          </p>
        </div>
        <div className="text-center flex-shrink-0 ml-3">
          <p className="font-inter text-3xl font-bold" style={{ color: cColor }}>{compat}%</p>
          <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Compatibility", "പൊരുത്തം", lang)}</p>
        </div>
      </div>

      {/* SUPPORTING DETAILS */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {rows.map((r, i) => (
          <div key={i} className="rounded-lg p-2.5" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[9px] uppercase tracking-wider mb-0.5" style={{ color: G.dim }}>{T(r.labelEn, r.labelMl, lang)}</p>
            <p className="font-inter text-sm font-bold" style={{ color: "#fff" }}>{r.value}</p>
          </div>
        ))}
      </div>
      {opts.length > 0 && (
        <div className="rounded-lg p-2.5 mb-2" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p className="font-inter text-[9px] uppercase tracking-wider mb-1" style={{ color: G.dim }}>{T("Selected Options", "തിരഞ്ഞെടുത്ത ഐച്ഛികങ്ങൾ", lang)}</p>
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>{opts.join(" · ")}</p>
        </div>
      )}
      <div className="rounded-lg p-2.5" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <p className="font-inter text-[9px] uppercase tracking-wider mb-0.5" style={{ color: G.dim }}>{T("Book Rules", "പുസ്തക നിയമങ്ങൾ", lang)}</p>
        <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
          {bookRuleCount} {T("matching rule(s) from uploaded books", "പൊരുത്തപ്പെടുന്ന നിയമങ്ങൾ അപ്‌ലോഡ് ചെയ്ത പുസ്തകങ്ങളിൽ നിന്ന്", lang)}
        </p>
      </div>
    </Box>
  );
}
import { Target } from "lucide-react";
import { G, T, Box, translatePlanet, translateDay, computeCompat, compatColor } from "../v3/shared";

// CARD 1 — PURPOSE SUMMARY
// Purpose always comes from Mizan (never selected here). Shows the selected
// purpose, ritual nature (Khair/Shar), and the current live context summary.
export default function CardPurposeSummary({ analysis, selections, lang }) {
  const purposeEn = analysis?.ritualType || T("General Work", "പൊതു കർമ്മം", lang);
  const purposeMl = analysis?.ritualSemanticMl || "";
  const showMl = lang === "ml" && purposeMl;
  const live = analysis?.liveNow || {};
  const ks = analysis?.khayrSharr;
  const isKhayr = ks === "khayr";
  const isSharr = ks === "sharr";
  const compat = computeCompat(analysis).final;
  const cColor = compatColor(compat);
  const suitable = !!analysis?.selectionAnalysis?.suitable;

  const rows = [
    { k: T("Selected Day", "തിരഞ്ഞെടുത്ത ദിവസം", lang), v: translateDay(live.day, lang) },
    { k: T("Day / Night", "പകൽ / രാത്രി", lang), v: live.laylNahar === "Layl" ? T("Night (Layl)", "രാത്രി (ലൈൽ)", lang) : T("Day (Nahar)", "പകൽ (നഹർ)", lang) },
    { k: T("Current Saat", "നിലവിലെ സഅാത്", lang), v: `#${live.saat} · ${translatePlanet(live.kawkab, lang)}` },
    { k: T("Current Situation", "നിലവിലെ അവസ്ഥ", lang), v: suitable ? T("Suitable", "അനുയോജ്യം", lang) : T("Not suitable", "അനുയോജ്യമല്ല", lang) },
  ];

  return (
    <Box number={1} titleEn="Purpose Summary" titleMl="ലക്ഷ്യ സംഗ്രഹം" icon={Target} lang={lang}>
      <div className="rounded-xl p-3 mb-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Selected Purpose", "തിരഞ്ഞെടുത്ത ലക്ഷ്യം", lang)}</p>
        <p className={showMl ? "font-malayalam text-lg font-bold leading-snug" : "font-inter text-lg font-bold leading-snug"} style={{ color: G.text }}>
          {showMl ? purposeMl : purposeEn}
        </p>
        {showMl && <p className="font-inter text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>{purposeEn}</p>}
      </div>

      <div className="flex items-stretch gap-2 mb-3">
        <div className="flex-1 rounded-xl p-3" style={{
          background: isKhayr ? "rgba(74,222,128,0.10)" : isSharr ? "rgba(248,113,113,0.10)" : G.bg,
          border: `1px solid ${isKhayr ? "rgba(74,222,128,0.45)" : isSharr ? "rgba(248,113,113,0.45)" : G.border}`,
        }}>
          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Ritual Nature", "കർമ്മ സ്വഭാവം", lang)}</p>
          <p className="font-inter text-sm font-bold" style={{ color: isKhayr ? "#4ADE80" : isSharr ? "#F87171" : "rgba(255,255,255,0.70)" }}>
            {isKhayr ? T("Good Ritual (Khair)", "നല്ല കർമ്മം (ഖൈർ)", lang)
              : isSharr ? T("Harmful Ritual (Shar)", "ഹാനികര കർമ്മം (ശർ)", lang)
              : T("Not determined", "നിർണ്ണയിക്കാത്തത്", lang)}
          </p>
        </div>
        <div className="rounded-xl p-3 text-center flex-shrink-0" style={{ background: `${cColor}12`, border: `1px solid ${cColor}50` }}>
          <p className="font-inter text-2xl font-bold" style={{ color: cColor }}>{compat}%</p>
          <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Compatibility", "പൊരുത്തം", lang)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {rows.map((r, i) => (
          <div key={i} className="rounded-lg p-2.5" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[9px] uppercase tracking-wider mb-0.5" style={{ color: G.dim }}>{r.k}</p>
            <p className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{r.v}</p>
          </div>
        ))}
      </div>
    </Box>
  );
}
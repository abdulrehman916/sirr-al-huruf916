import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { G, T, Box, translatePlanet, computeCompat, compatColor, PLANET_LIST } from "./shared";

// BOX 9 — PLANET DETAILS (optional, lazy, conclusion-first per planet)
// 7 expandable buttons. On tap: shows ONLY that planet's relationship with
// this ritual — conclusion (Supports / Forbidden / Neutral) + compat % first,
// then the supporting book rule. Moon shows a SEPARATE lunar module with only:
// Current Lunar Mansion, Relationship, Compatibility, Supporting Book.
export default function BoxPlanetDetails({ analysis, lang }) {
  const [open, setOpen] = useState(null);
  const req = analysis?.req || {};
  const matchingRules = analysis?.matchingRules || [];
  const conflictingRules = analysis?.conflictingRules || [];
  const moonPhase = analysis?.moonPhase || {};
  const moonReq = analysis?.moonReq || {};
  const moonCitations = analysis?.moonCitations || [];

  const statusOf = (planetKey) => {
    const cap = planetKey.charAt(0).toUpperCase() + planetKey.slice(1);
    if (req.worstHours?.includes(cap) || req.enemyPlanets?.includes(cap)) return "forbidden";
    if (req.hours?.some(p => p.toLowerCase() === planetKey)) return "recommended";
    return "neutral";
  };
  const rulesFor = (planetKey) => {
    const m = matchingRules.find(r => String(r.planet || "").toLowerCase() === planetKey);
    const c = conflictingRules.find(r => String(r.planet || "").toLowerCase() === planetKey);
    return { match: m, conflict: c };
  };

  const renderPlanet = (p) => {
    const isOpen = open === p.key;
    const isMoon = p.key === "moon";
    const status = statusOf(p.key);
    const statusColor = status === "recommended" ? "#4ADE80" : status === "forbidden" ? "#F87171" : G.dim;
    const statusLabel = status === "recommended" ? T("Supports this ritual", "ഈ കർമ്മത്തെ പിന്തുണയ്ക്കുന്നു", lang)
      : status === "forbidden" ? T("Forbidden for this ritual", "ഈ കർമ്മത്തിന് നിരോധിതം", lang)
      : T("Neutral for this ritual", "ഈ കർമ്മത്തിന് നിഷ്പക്ഷം", lang);

    return (
      <div key={p.key} className="rounded-lg overflow-hidden" style={{ background: G.bg, border: `1px solid ${isOpen ? G.borderHi : G.border}` }}>
        <button onClick={() => setOpen(isOpen ? null : p.key)} className="w-full flex items-center gap-3 p-3 text-left">
          <span className="text-xl" style={{ color: statusColor }}>{p.symbol}</span>
          <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{translatePlanet(p.en, lang)}</span>
          <ChevronDown className="w-4 h-4 ml-auto transition-transform" style={{ color: G.dim, transform: isOpen ? "rotate(180deg)" : "none" }} />
        </button>
        {isOpen && (
          <div className="px-3 pb-3 space-y-2">
            {isMoon ? (
              <MoonDetail lang={lang} moonPhase={moonPhase} moonReq={moonReq} moonCitations={moonCitations} />
            ) : (
              <PlanetDetail analysis={analysis} planetKey={p.key} status={status} statusLabel={statusLabel} statusColor={statusColor} rulesFor={rulesFor} lang={lang} />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Box number={9} titleEn="Planet Details (Optional)" titleMl="ഗ്രഹ വിവരങ്ങൾ (ഐച്ഛികം)" icon={Globe} lang={lang}>
      <p className={lang === "ml" ? "font-malayalam text-[10px] mb-3" : "font-inter text-[10px] mb-3"} style={{ color: "rgba(255,255,255,0.50)" }}>
        {T("Tap a planet to view its relationship with this ritual.", "ഈ കർമ്മവുമായുള്ള ബന്ധം കാണാൻ ഒരു ഗ്രഹത്തിൽ ടാപ്പ് ചെയ്യുക.", lang)}
      </p>
      <div className="space-y-2">{PLANET_LIST.map(p => renderPlanet(p))}</div>
    </Box>
  );
}

// Non-Moon planet: conclusion (status + compat) first, then the supporting book rule.
function PlanetDetail({ analysis, planetKey, status, statusLabel, statusColor, rulesFor, lang }) {
  const compat = computeCompat(analysis, { planetLC: planetKey }).final;
  const cColor = compatColor(compat);
  const { match, conflict } = rulesFor(planetKey);
  const reason = match ? (lang === "ml" && match.text_ml ? match.text_ml : match.text_en)
    : conflict ? (lang === "ml" && conflict.text_ml ? conflict.text_ml : conflict.text_en) : "";
  const book = match?.source || conflict?.source || "";

  return (
    <>
      <div className="flex items-center justify-between rounded-lg p-2.5" style={{ background: `${statusColor}10`, border: `1px solid ${statusColor}30` }}>
        <p className="font-inter text-[11px] font-bold" style={{ color: statusColor }}>{statusLabel}</p>
        <p className="font-inter text-lg font-bold" style={{ color: cColor }}>{compat}%</p>
      </div>
      {reason && <p className={lang === "ml" ? "font-malayalam text-xs leading-relaxed" : "font-inter text-xs leading-relaxed"} style={{ color: "rgba(255,255,255,0.72)" }}>{String(reason).split(/\n/)[0]}</p>}
      {book && <p className="font-inter text-[9px]" style={{ color: G.dim }}>{T("Supporting Book Rule", "പിന്തുണയ്ക്കുന്ന പുസ്തക നിയമം", lang)}: {book}</p>}
      {!reason && !book && <p className={lang === "ml" ? "font-malayalam text-[10px]" : "font-inter text-[10px]"} style={{ color: "rgba(255,255,255,0.45)" }}>{T("No specific rule for this planet in the uploaded books.", "അപ്‌ലോഡ് ചെയ്ത പുസ്തകങ്ങളിൽ ഈ ഗ്രഹത്തിന് പ്രത്യേക നിയമമില്ല.", lang)}</p>}
    </>
  );
}

// Moon module — ONLY: Current Lunar Mansion, Relationship, Compatibility, Supporting Book.
function MoonDetail({ lang, moonPhase, moonReq, moonCitations }) {
  const hasMoonRules = !!(moonReq?.moon || moonReq?.zodiac || moonReq?.suitableMansions);
  const mansion = moonPhase?.moonMansion || "—";
  const mansionAr = moonPhase?.moonMansionArabic || "";
  const mansionNum = moonPhase?.moonMansionNumber || "—";

  let compat = 50, relationshipEn, relationshipMl, statusColor;
  if (!hasMoonRules) {
    compat = 50; relationshipEn = "No Moon restriction for this ritual."; relationshipMl = "ഈ കർമ്മത്തിന് ചന്ദ്ര നിയന്ത്രണമില്ല."; statusColor = G.dim;
  } else {
    const mansionOk = moonReq.suitableMansions?.some(m =>
      String(m).toLowerCase() === String(mansion).toLowerCase() || String(m) === String(mansionNum));
    if (mansionOk) { compat = 100; relationshipEn = "Current mansion supports this ritual."; relationshipMl = "നിലവിലെ മൻസിൽ ഈ കർമ്മത്തെ പിന്തുണയ്ക്കുന്നു."; statusColor = "#4ADE80"; }
    else { compat = 25; relationshipEn = "Current mansion does not support this ritual."; relationshipMl = "നിലവിലെ മൻസിൽ ഈ കർമ്മത്തെ പിന്തുണയ്ക്കുന്നില്ല."; statusColor = "#F87171"; }
  }
  const cColor = compatColor(compat);

  return (
    <div className="rounded-lg p-2.5 space-y-2" style={{ background: `${cColor}08`, border: `1px solid ${cColor}30` }}>
      <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Moon Module", "ചന്ദ്ര മൊഡ്യൂൾ", lang)}</p>
      <div className="flex items-center justify-between">
        <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Current Lunar Mansion", "നിലവിലെ ചന്ദ്ര മൻസിൽ", lang)}</span>
        <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{mansionAr ? `${mansionAr} (${mansion})` : mansion} #{mansionNum}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Relationship", "ബന്ധം", lang)}</span>
        <span className={lang === "ml" ? "font-malayalam text-[11px] font-bold" : "font-inter text-[11px] font-bold"} style={{ color: statusColor }}>{lang === "ml" ? relationshipMl : relationshipEn}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Compatibility", "പൊരുത്തം", lang)}</span>
        <span className="font-inter text-base font-bold" style={{ color: cColor }}>{compat}%</span>
      </div>
      {moonCitations[0]?.source && (
        <div className="flex items-center justify-between">
          <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Supporting Book", "പിന്തുണയ്ക്കുന്ന പുസ്തകം", lang)}</span>
          <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{moonCitations[0].source}</span>
        </div>
      )}
    </div>
  );
}
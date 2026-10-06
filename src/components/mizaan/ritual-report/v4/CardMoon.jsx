import { Moon } from "lucide-react";
import { G, T, Box } from "../v3/shared";
import SourcesCollapse from "./SourcesCollapse";

// CARD 5 — MOON MODULE (optional)
// Opens only when the user taps "Open Moon Module". Shows ONLY the current
// Moon mansion, its relationship with the selected purpose (Compatible / Not
// Compatible / No Moon Rule), the reason, and the supporting book rule. No Saat
// info, no unrelated planets. If no Moon rule exists in the uploaded books,
// nothing is invented.
export default function CardMoon({ analysis, open, onToggle, lang }) {
  const mp = analysis?.moonPhase || {};
  const moonReq = analysis?.moonReq || {};
  const citations = analysis?.moonCitations || [];
  const mansion = mp.moonMansion || "";
  const mansionAr = mp.moonMansionArabic || "";
  const mansionNo = mp.moonMansionNumber || "";
  const hasRule = !!(moonReq.suitableMansions && moonReq.suitableMansions.length);

  let compatible = false, reasonEn = "", reasonMl = "";
  if (hasRule && mansion) {
    compatible = moonReq.suitableMansions.some(m =>
      String(m).toLowerCase() === String(mansion).toLowerCase() || String(m) === String(mansionNo)
    );
    reasonEn = compatible
      ? `Manuscript prescribes mansions ${moonReq.suitableMansions.join(", ")}; current mansion matches.`
      : `Manuscript prescribes mansions ${moonReq.suitableMansions.join(", ")}; current mansion is ${mansion}.`;
    reasonMl = compatible
      ? `പുസ്തകം നിർദ്ദേശിക്കുന്ന നക്ഷത്രങ്ങൾ ${moonReq.suitableMansions.join(", ")}; നിലവിലെ നക്ഷത്രം പൊരുത്തപ്പെടുന്നു.`
      : `പുസ്തകം നിർദ്ദേശിക്കുന്ന നക്ഷത്രങ്ങൾ ${moonReq.suitableMansions.join(", ")}; നിലവിലെ നക്ഷത്രം ${mansion} ആണ്.`;
  } else {
    reasonEn = "No Moon mansion rule found in the uploaded books for this purpose.";
    reasonMl = "ഈ ലക്ഷ്യത്തിനായി അപ്‌ലോഡ് ചെയ്ത പുസ്തകങ്ങളിൽ ചന്ദ്ര നക്ഷത്ര നിയമമൊന്നുമില്ല.";
  }

  return (
    <Box number={5} titleEn="Moon Module" titleMl="ചന്ദ്ര മൊഡ്യൂൾ" icon={Moon} lang={lang}>
      {!open ? (
        <button onClick={onToggle} className="w-full rounded-xl p-3 text-left" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p className="font-inter text-xs font-bold" style={{ color: G.text }}>{T("Open Moon Module", "ചന്ദ്ര മൊഡ്യൂൾ തുറക്കുക", lang)}</p>
        </button>
      ) : (
        <div className="space-y-2.5">
          <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <div>
              <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Current Moon Mansion", "നിലവിലെ ചന്ദ്ര നക്ഷത്രം", lang)}</p>
              <p className="font-amiri text-base font-bold" style={{ color: "#fff" }} dir="rtl">{mansionAr ? `${mansionAr} (${mansion})` : (mansion || "—")}</p>
            </div>
            {mansionNo && <span className="font-inter text-xs" style={{ color: G.dim }}>#{mansionNo}</span>}
          </div>

          <div className="rounded-xl p-3" style={{
            background: hasRule ? (compatible ? "rgba(74,222,128,0.10)" : "rgba(248,113,113,0.10)") : G.bg,
            border: `1px solid ${hasRule ? (compatible ? "rgba(74,222,128,0.45)" : "rgba(248,113,113,0.45)") : G.border}`,
          }}>
            <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Relationship with Purpose", "ലക്ഷ്യവുമായുള്ള ബന്ധം", lang)}</p>
            <p className="font-inter text-sm font-bold" style={{ color: hasRule ? (compatible ? "#4ADE80" : "#F87171") : "rgba(255,255,255,0.70)" }}>
              {hasRule ? (compatible ? T("Compatible", "അനുയോജ്യം", lang) : T("Not Compatible", "അനുയോജ്യമല്ല", lang)) : T("No Moon Rule", "ചന്ദ്ര നിയമമില്ല", lang)}
            </p>
            <p className={lang === "ml" ? "font-malayalam text-xs leading-relaxed mt-1" : "font-inter text-xs leading-relaxed mt-1"} style={{ color: "rgba(255,255,255,0.72)" }}>
              {lang === "ml" ? reasonMl : reasonEn}
            </p>
            <SourcesCollapse sources={citations} lang={lang} />
          </div>

          <button onClick={onToggle} className="font-inter text-[10px]" style={{ color: G.dim }}>{T("Close", "അടയ്ക്കുക", lang)}</button>
        </div>
      )}
    </Box>
  );
}
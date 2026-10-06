import { Target } from "lucide-react";
import { G, T, Box } from "./shared";

// BOX 1 — SELECTED PURPOSE
// Purpose comes automatically from Mizan 9 (resolved via Purpose Dictionary).
// The user never selects a purpose inside Ritual Time.
export default function BoxPurpose({ analysis, lang }) {
  const purposeEn = analysis?.ritualType || T("General Work", "പൊതു കർമ്മം", lang);
  const purposeMl = analysis?.ritualSemanticMl || "";
  const showMl = lang === "ml" && purposeMl;

  return (
    <Box number={1} titleEn="Selected Purpose" titleMl="തിരഞ്ഞെടുത്ത ലക്ഷ്യം" icon={Target} lang={lang}>
      <p className={showMl ? "font-malayalam text-lg font-bold leading-snug" : "font-inter text-lg font-bold leading-snug"}
        style={{ color: G.text }}>
        {showMl ? purposeMl : purposeEn}
      </p>
      {showMl && (
        <p className="font-inter text-xs mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>{purposeEn}</p>
      )}
      <p className={lang === "ml" ? "font-malayalam text-xs mt-3 leading-relaxed" : "font-inter text-xs mt-3 leading-relaxed"}
        style={{ color: "rgba(255,255,255,0.60)" }}>
        {T("This Ritual Time analysis is generated for the selected Mizan Purpose.",
          "തിരഞ്ഞെടുത്ത മിസാൻ ലക്ഷ്യത്തിനായാണ് ഈ ആചാര സമയ വിശകലനം തയ്യാറാക്കിയിരിക്കുന്നത്.", lang)}
      </p>
    </Box>
  );
}
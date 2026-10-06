// ═══════════════════════════════════════════════════════════════
// SECTION 3 — WHY THIS TIME IS SUITABLE
// Displays ALL matching reasons individually — every matched rule
// ═══════════════════════════════════════════════════════════════
import { CheckCircle2, ShieldCheck } from "lucide-react";
import ReportSection from "./ReportSection";
import { G, T } from "./shared";

export default function SectionWhySuitable({ analysis, lang }) {
  const acceptanceReasons = analysis?.currentSaatAnalysis?.acceptanceReasons || [];
  const matchingRules = analysis?.matchingRules || [];

  // Combine acceptance reasons and matching rules (dedup by text_en)
  const allReasons = [];
  const seen = new Set();
  for (const r of acceptanceReasons) {
    const key = r.text_en || r.text_ml || "";
    if (key && !seen.has(key)) { seen.add(key); allReasons.push(r); }
  }
  for (const r of matchingRules) {
    const key = r.text_en || "";
    if (key && !seen.has(key)) { seen.add(key); allReasons.push(r); }
  }

  return (
    <ReportSection
      number={3}
      title="Why This Time Is Suitable"
      titleMl="ഈ സമയം അനുയോജ്യമായതെന്തുകൊണ്ട്"
      icon={ShieldCheck}
      lang={lang}
      accent="#4ADE80"
    >
      {allReasons.length === 0 ? (
        <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p
            className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"}
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            {T(
              "No matching suitability rules found for the current context.",
              "നിലവിലെ സന്ദർഭത്തിന് അനുയോജ്യമായ നിയമങ്ങളൊന്നുമില്ല.",
              lang
            )}
          </p>
        </div>
      ) : (
        allReasons.map((reason, idx) => (
          <div
            key={`suit-${idx}`}
            className="rounded-lg p-3"
            style={{
              background: "rgba(74,222,128,0.06)",
              border: "1px solid rgba(74,222,128,0.25)",
            }}
          >
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#4ADE80" }} />
              <div className="flex-1">
                <p
                  className={
                    lang === "ml" && reason.text_ml
                      ? "font-malayalam text-xs leading-relaxed"
                      : "font-inter text-xs leading-relaxed"
                  }
                  style={{ color: "rgba(255,255,255,0.80)" }}
                >
                  {lang === "ml" && reason.text_ml ? reason.text_ml : reason.text_en}
                </p>

              </div>
            </div>
          </div>
        ))
      )}
    </ReportSection>
  );
}
// ═══════════════════════════════════════════════════════════════
// SECTION 4 — WHY THIS TIME IS NOT SUITABLE
// Displays EVERY failed rule separately
// ═══════════════════════════════════════════════════════════════
import { XCircle, Swords } from "lucide-react";
import ReportSection from "./ReportSection";
import { G, T } from "./shared";

export default function SectionWhyNotSuitable({ analysis, lang }) {
  const rejectionReasons = analysis?.currentSaatAnalysis?.rejectionReasons || [];
  const conflictingRules = analysis?.conflictingRules || [];

  // Combine rejection reasons and conflicting rules (dedup by text_en)
  const allReasons = [];
  const seen = new Set();
  for (const r of rejectionReasons) {
    const key = r.text_en || r.text_ml || "";
    if (key && !seen.has(key)) { seen.add(key); allReasons.push(r); }
  }
  for (const r of conflictingRules) {
    const key = r.text_en || "";
    if (key && !seen.has(key)) { seen.add(key); allReasons.push(r); }
  }

  return (
    <ReportSection
      number={4}
      title="Why This Time Is Not Suitable"
      titleMl="ഈ സമയം അനുയോജ്യമല്ലാത്തതെന്തുകൊണ്ട്"
      icon={Swords}
      lang={lang}
      accent="#F87171"
    >
      {allReasons.length === 0 ? (
        <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p
            className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"}
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            {T(
              "No rejection rules found — no conflicts detected.",
              "നിരസന നിയമങ്ങളൊന്നുമില്ല — പൊരുത്തരക്കേടുകളൊന്നുമില്ല.",
              lang
            )}
          </p>
        </div>
      ) : (
        allReasons.map((reason, idx) => (
          <div
            key={`notsuit-${idx}`}
            className="rounded-lg p-3"
            style={{
              background: "rgba(248,113,113,0.06)",
              border: "1px solid rgba(248,113,113,0.25)",
            }}
          >
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#F87171" }} />
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
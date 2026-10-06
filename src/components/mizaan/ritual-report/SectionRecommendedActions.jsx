// ═══════════════════════════════════════════════════════════════
// SECTION 8 — RECOMMENDED ACTIONS
// Displays ALL recommended actions from the ENTIRE database
// (from matchingRules across ALL contexts, not just the exact context)
// Sources: recommended_actions + friendship_actions
// ═══════════════════════════════════════════════════════════════
import { Sparkles, Heart, CheckCircle2 } from "lucide-react";
import ReportSection from "./ReportSection";
import { G, T } from "./shared";

export default function SectionRecommendedActions({ analysis, lang }) {
  // ALL recommended actions from matchingRules (across ALL contexts)
  const allMatching = analysis?.matchingRules || [];
  const recommendedRules = allMatching.filter(
    (r) => r.field === "recommended_actions" || r.field === "friendship_actions"
  );

  // Also get exact-context originalRecommended (priority display)
  const contextRecommended = analysis?.selectionAnalysis?.originalRecommended || [];

  // Combine, dedup by text
  const seen = new Set();
  const combined = [];

  // Exact-context actions first (priority)
  for (const a of contextRecommended) {
    const key = (a.en || a.ml || "").trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      combined.push({ en: a.en, ml: a.ml, source: a.source || "Astrology Clock (current context)", isContext: true });
    }
  }

  // Then ALL matching actions from the full database
  for (const r of recommendedRules) {
    const key = (r.text_en || r.text_ml || "").trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      combined.push({
        en: r.text_en,
        ml: r.text_ml,
        source: r.source || "Astrology Clock",
        isFriendship: r.field === "friendship_actions",
      });
    }
  }

  return (
    <ReportSection
      number={8}
      title="Recommended Actions"
      titleMl="ശുപാര്ശ പ്രവൃത്തികൾ"
      icon={Sparkles}
      lang={lang}
      accent="#4ADE80"
    >
      {combined.length === 0 ? (
        <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p
            className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"}
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            {T(
              "No recommended actions found in the database for this purpose.",
              "ഈ ലക്ഷ്യത്തിന് ഡാറ്റാബേസിൽ ശുപാര്ശ പ്രവൃത്തികളൊന്നുമില്ല.",
              lang
            )}
          </p>
        </div>
      ) : (
        <>
          {/* Count badge */}
          <div className="rounded-lg p-2 mb-2" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>
              {T(
                `${combined.length} matching recommendation(s) from the database`,
                `ഡാറ്റാബേസിൽ നിന്ന് ${combined.length} ശുപാര്ശ(ങ്ങൾ) മാനിക്കുന്നു`,
                lang
              )}
            </p>
          </div>

          {combined.map((action, idx) => {
            const Icon = action.isFriendship ? Heart : action.isContext ? CheckCircle2 : Sparkles;
            const accentColor = action.isFriendship ? "#F472B6" : "#4ADE80";
            return (
              <div
                key={`rec-${idx}`}
                className="rounded-lg p-3 mb-2"
                style={{
                  background: `${accentColor}0D`,
                  border: `1px solid ${accentColor}33`,
                }}
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                  <div className="flex-1">
                    <p
                      className={
                        lang === "ml" && action.ml
                          ? "font-malayalam text-xs leading-relaxed"
                          : "font-inter text-xs leading-relaxed"
                      }
                      style={{ color: "rgba(255,255,255,0.80)" }}
                    >
                      {lang === "ml" && action.ml ? action.ml : action.en}
                    </p>
                    {action.source && (
                      <p className="font-inter text-[9px] mt-1" style={{ color: G.dim }}>
                        {T("Source", "ഉറവിടം", lang)}: {action.source}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </ReportSection>
  );
}
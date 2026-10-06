// ═══════════════════════════════════════════════════════════════
// SECTION 10 — MANUSCRIPT REFERENCES
// Shows every matching manuscript rule used for the decision.
// Never hides them — all matching + conflicting rules displayed.
// ═══════════════════════════════════════════════════════════════
import { BookOpen } from "lucide-react";
import ReportSection from "./ReportSection";
import { G, T } from "./shared";

export default function SectionManuscriptRefs({ analysis, lang }) {
  const matchingRules = analysis?.matchingRules || [];
  const conflictingRules = analysis?.conflictingRules || [];
  const rulesApplied = analysis?.rulesApplied || [];
  const bookNotes = analysis?.bookNotes || [];

  // Combine all unique rules
  const allRules = [];
  const seen = new Set();
  for (const r of matchingRules) {
    const key = r.rule_id || r.text_en || "";
    if (key && !seen.has(key)) { seen.add(key); allRules.push({ ...r, type: "matching" }); }
  }
  for (const r of conflictingRules) {
    const key = r.rule_id || r.text_en || "";
    if (key && !seen.has(key)) { seen.add(key); allRules.push({ ...r, type: "conflicting" }); }
  }
  for (const r of rulesApplied) {
    const key = r.id || r.desc || "";
    if (key && !seen.has(key)) { seen.add(key); allRules.push({ ...r, type: "applied" }); }
  }

  return (
    <ReportSection
      number={10}
      title="Manuscript References"
      titleMl="കൈയെഴുത്ത് അവലംബങ്ങൾ"
      icon={BookOpen}
      lang={lang}
    >
      {allRules.length === 0 && bookNotes.length === 0 ? (
        <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p
            className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"}
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            {T(
              "No manuscript references found for this purpose.",
              "ഈ ലക്ഷ്യത്തിന് കൈയെഴുത്ത് അവലംബങ്ങളൊന്നുമില്ല.",
              lang
            )}
          </p>
        </div>
      ) : (
        <>
          {allRules.map((rule, idx) => {
            const isMatch = rule.type === "matching";
            const color = isMatch ? "#4ADE80" : "#F87171";
            return (
              <div
                key={`ref-${idx}`}
                className="rounded-lg p-3"
                style={{
                  background: `${color}06`,
                  border: `1px solid ${color}25`,
                }}
              >
                <div className="flex items-start gap-2">
                  <BookOpen className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
                  <div className="flex-1">
                    <p
                      className={
                        lang === "ml" && rule.text_ml
                          ? "font-malayalam text-[11px] leading-relaxed"
                          : "font-inter text-[11px] leading-relaxed"
                      }
                      style={{ color: "rgba(255,255,255,0.80)" }}
                    >
                      {lang === "ml" && rule.text_ml ? rule.text_ml : (rule.text_en || rule.desc || "")}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {rule.source && (
                        <span className="font-inter text-[9px]" style={{ color: G.dim }}>
                          {rule.source}
                        </span>
                      )}
                      {rule.field && (
                        <span className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: G.bg, color: G.dim }}>
                          {rule.field}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Book notes (additional sources) */}
          {bookNotes.length > 0 && (
            <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <p
                className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2"
                style={{ color: G.dim }}
              >
                {T("Additional Sources", "അധിക ഉറവിടങ്ങൾ", lang)}
              </p>
              {bookNotes.map((note, idx) => (
                <p key={`bn-${idx}`} className="font-inter text-[11px] mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {note.source}: {note.text}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </ReportSection>
  );
}
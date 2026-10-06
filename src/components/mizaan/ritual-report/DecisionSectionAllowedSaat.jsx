// ═══════════════════════════════════════════════════════════════
// SECTION 5 — ALLOWED SAAT
// Saat allowed for this purpose, grouped by book when books disagree.
// ═══════════════════════════════════════════════════════════════
import { CheckCircle2 } from "lucide-react";
import { G, T, translatePlanet, translateDay, MIZAN_DAY_NAMES, DAY_KEY_BY_INDEX, saatDisplayNum } from "./shared";

function cleanReason(text) {
  if (!text) return "";
  return String(text).replace(/Source\s*:.*?(\.|$)/gi, "").replace(/Astrology Clock\s*:/gi, "").split(/\n/)[0].trim();
}

export default function DecisionSectionAllowedSaat({ analysis, lang }) {
  const bestWindows = analysis?.bestWindowsToday || [];
  const matchingRules = analysis?.matchingRules || [];

  // Group matching rules by source (book)
  const byBook = {};
  for (const rule of matchingRules) {
    const book = rule.source || "Unknown";
    if (!byBook[book]) byBook[book] = [];
    byBook[book].push(rule);
  }
  const books = Object.keys(byBook);
  const hasMultipleBooks = books.length > 1;

  // Build today's recommended saats (flat list from bestWindows)
  const todayRecommended = bestWindows.map((w) => {
    const rules = matchingRules.filter((r) => r.saat_number === w.hourNumber && r.period === w.period);
    const reason = rules.map((r) => cleanReason(lang === "ml" && r.text_ml ? r.text_ml : r.text_en)).filter(Boolean).slice(0, 1).join(" ");
    return {
      saatNum: saatDisplayNum(w.hourNumber, w.period),
      planet: w.planet,
      startTime: w.startTime,
      endTime: w.endTime,
      reason: reason || T("Recommended for this purpose.", "ഈ ലക്ഷ്യത്തിനായി ശുപാർശ ചെയ്തു.", lang),
    };
  });

  if (todayRecommended.length === 0 && books.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: "#4ADE80" }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>5</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Allowed Saat", "അനുവദനീയ സഅാത്", lang)}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {/* Today's allowed saats */}
        {todayRecommended.length > 0 && (
          <div>
            <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#4ADE80" }}>
              {T("Today", "ഇന്ന്", lang)}
            </p>
            {todayRecommended.map((r, idx) => (
              <div key={`allowed-${idx}`} className="rounded-lg p-2.5 mb-2 last:mb-0" style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.20)" }}>
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>
                    {T("Saat", "സഅാത്", lang)} #{r.saatNum} ({translatePlanet(r.planet, lang)})
                  </span>
                  {r.startTime && <span className="font-inter text-[10px]" style={{ color: G.dim }}>{r.startTime}–{r.endTime}</span>}
                </div>
                <p className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed" : "font-inter text-[11px] leading-relaxed"} style={{ color: "rgba(255,255,255,0.65)" }}>{r.reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* Grouped by book when multiple books disagree */}
        {hasMultipleBooks && (
          <div>
            <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: G.dim }}>
              {T("By Book", "പുസ്തകം പ്രകാരം", lang)}
            </p>
            {books.map((book, bidx) => {
              const rules = byBook[book];
              const saats = rules
                .filter((r) => r.saat_number != null)
                .map((r) => ({
                  dayName: r.weekday != null ? MIZAN_DAY_NAMES[DAY_KEY_BY_INDEX[r.weekday]] : null,
                  saatNum: saatDisplayNum(r.saat_number, r.period),
                  planet: r.planet,
                  reason: cleanReason(lang === "ml" && r.text_ml ? r.text_ml : r.text_en) || T("Recommended.", "ശുപാർശ.", lang),
                }));

              return (
                <div key={`book-allowed-${bidx}`} className="rounded-lg p-3 mb-2 last:mb-0" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                  <p className={lang === "ml" ? "font-malayalam text-xs font-bold mb-1.5" : "font-inter text-xs font-bold mb-1.5"} style={{ color: G.text }}>{book}</p>
                  {saats.length > 0 ? saats.map((s, sidx) => (
                    <div key={`s-${sidx}`} className="flex items-center gap-2 py-1">
                      <span className="font-inter text-[11px] font-bold" style={{ color: "#fff" }}>
                        {s.dayName ? `${translateDay(s.dayName, lang)} ` : ""}{T("Saat", "സഅാത്", lang)} #{s.saatNum} ({translatePlanet(s.planet, lang)})
                      </span>
                    </div>
                  )) : (
                    <p className={lang === "ml" ? "font-malayalam text-[11px]" : "font-inter text-[11px]"} style={{ color: "rgba(255,255,255,0.60)" }}>
                      {T("No specific Saat prescribed.", "പ്രത്യേക സഅാത് നിർദ്ദേശിച്ചിട്ടില്ല.", lang)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {todayRecommended.length === 0 && !hasMultipleBooks && (
          <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.60)" }}>
            {T("No suitable Saat available today.", "ഇന്ന് അനുയോജ്യ സഅാതുകളൊന്നുമില്ല.", lang)}
          </p>
        )}
      </div>
    </div>
  );
}
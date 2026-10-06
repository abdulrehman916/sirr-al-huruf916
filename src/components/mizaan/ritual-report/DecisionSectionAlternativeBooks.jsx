// ═══════════════════════════════════════════════════════════════
// SECTION 7 — ALTERNATIVE BOOK RULES
// If different books recommend different timings, show them separately.
// Never merge rules from different books. Let the user compare.
// ═══════════════════════════════════════════════════════════════
import { Layers } from "lucide-react";
import { G, T, translatePlanet, translateDay, MIZAN_DAY_NAMES, DAY_KEY_BY_INDEX, saatDisplayNum } from "./shared";

function cleanReason(text) {
  if (!text) return "";
  return String(text).replace(/Source\s*:.*?(\.|$)/gi, "").replace(/Astrology Clock\s*:/gi, "").split(/\n/)[0].trim();
}

export default function DecisionSectionAlternativeBooks({ analysis, lang }) {
  const matchingRules = analysis?.matchingRules || [];

  // Group by source (book name) — only rules with specific timing (weekday + saat_number)
  const byBook = {};
  for (const rule of matchingRules) {
    if (rule.saat_number == null || rule.weekday == null) continue;
    const book = rule.source || "Unknown";
    if (!byBook[book]) byBook[book] = [];
    byBook[book].push(rule);
  }
  const books = Object.keys(byBook);

  if (books.length <= 1) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
          <Layers className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>7</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Alternative Book Rules", "ബദൽ പുസ്തക നിയമങ്ങൾ", lang)}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <p className={lang === "ml" ? "font-malayalam text-[11px] mb-2" : "font-inter text-[11px] mb-2"} style={{ color: "rgba(255,255,255,0.60)" }}>
          {T("Different books recommend different timings. Compare them below.", "വിവിധ പുസ്തകങ്ങൾ വിവിധ സമയങ്ങൾ ശുപാർശ ചെയ്യുന്നു. താഴെ താരതമ്യം ചെയ്യുക.", lang)}
        </p>
        {books.map((book, idx) => {
          const rules = byBook[book];
          // Unique day+saat combos
          const seen = new Set();
          const timings = rules.filter((r) => {
            const key = `${r.weekday}-${r.saat_number}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          }).map((r) => ({
            dayName: MIZAN_DAY_NAMES[DAY_KEY_BY_INDEX[r.weekday]],
            saatNum: saatDisplayNum(r.saat_number, r.period),
            planet: r.planet,
            reason: cleanReason(lang === "ml" && r.text_ml ? r.text_ml : r.text_en),
          }));

          return (
            <div key={`altbook-${idx}`} className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <p className={lang === "ml" ? "font-malayalam text-xs font-bold mb-2" : "font-inter text-xs font-bold mb-2"} style={{ color: G.text }}>{book}</p>
              {timings.map((t, tidx) => (
                <div key={`t-${tidx}`} className="py-1.5 border-b last:border-0" style={{ borderColor: G.border }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Recommended", "ശുപാർശ", lang)}:</span>
                    <span className="font-inter text-[11px] font-bold" style={{ color: "#fff" }}>
                      {translateDay(t.dayName, lang)} {T("Saat", "സഅാത്", lang)} #{t.saatNum} ({translatePlanet(t.planet, lang)})
                    </span>
                  </div>
                  {t.reason && (
                    <p className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed" : "font-inter text-[11px] leading-relaxed"} style={{ color: "rgba(255,255,255,0.65)" }}>{t.reason}</p>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
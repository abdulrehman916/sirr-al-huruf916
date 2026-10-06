import { Ban } from "lucide-react";
import { G, T, Box, translatePlanet, translateDay, MIZAN_DAY_NAMES } from "./shared";
import SourcesCollapse from "../v4/SourcesCollapse";

// BOX 6 — FORBIDDEN CONDITIONS (conclusion-first)
// Conclusion: "Do NOT perform this ritual during these conditions."
// Then supporting details: forbidden weekdays / saat / planet + book reasons.
export default function BoxForbidden({ analysis, lang }) {
  const req = analysis?.req || {};
  const conflictingRules = analysis?.conflictingRules || [];
  const forbiddenDays = (req.worstDays || []).map(d => MIZAN_DAY_NAMES[d] || d);
  const forbiddenHours = req.worstHours || [];
  const enemyPlanets = req.enemyPlanets || [];
  const reasons = conflictingRules.filter(r => r.text_en || r.text_ml).slice(0, 4).map(r => ({ text: lang === "ml" && r.text_ml ? r.text_ml : r.text_en, source: r.source, page: r.page }));
  const hasAny = forbiddenDays.length || forbiddenHours.length || enemyPlanets.length || reasons.length;

  if (!hasAny) {
    return (
      <Box number={6} titleEn="Forbidden Conditions" titleMl="നിരോധിത വ്യവസ്ഥകൾ" icon={Ban} lang={lang}>
        <div className="rounded-xl p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#4ADE80" }}>
            {T("No forbidden conditions for this ritual.", "ഈ കർമ്മത്തിന് നിരോധിത വ്യവസ്ഥകളൊന്നുമില്ല.", lang)}
          </p>
        </div>
      </Box>
    );
  }

  const chips = (items, kind) => items.map((it, i) => (
    <span key={i} className="font-inter text-[10px] px-2 py-0.5 rounded-full" style={{ color: "#F87171", border: "1px solid rgba(248,113,113,0.40)", background: "rgba(248,113,113,0.10)" }}>
      {kind === "day" ? translateDay(it, lang) : translatePlanet(it, lang)}
    </span>
  ));

  return (
    <Box number={6} titleEn="Forbidden Conditions" titleMl="നിരോധിത വ്യവസ്ഥകൾ" icon={Ban} lang={lang}>
      {/* CONCLUSION FIRST */}
      <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.45)" }}>
        <p className={lang === "ml" ? "font-malayalam text-sm font-bold leading-snug" : "font-inter text-sm font-bold leading-snug"} style={{ color: "#F87171" }}>
          {T("Do NOT perform this ritual during these conditions.", "ഈ വ്യവസ്ഥകളിൽ ഈ കർമ്മം ചെയ്യരുത്.", lang)}
        </p>
      </div>

      {/* SUPPORTING DETAILS — red warning cards */}
      <div className="space-y-2.5">
        {forbiddenDays.length > 0 && (
          <div className="rounded-xl p-3" style={{ background: "rgba(153,27,27,0.12)", border: "1px solid rgba(248,113,113,0.45)" }}>
            <p className="font-inter text-[9px] uppercase tracking-wider mb-1.5" style={{ color: "#F87171" }}>{T("Forbidden Weekdays", "നിരോധിത ദിവസങ്ങൾ", lang)}</p>
            <div className="flex flex-wrap gap-1.5">{chips(forbiddenDays, "day")}</div>
          </div>
        )}
        {(forbiddenHours.length > 0 || enemyPlanets.length > 0) && (
          <div className="rounded-xl p-3" style={{ background: "rgba(153,27,27,0.12)", border: "1px solid rgba(248,113,113,0.45)" }}>
            <p className="font-inter text-[9px] uppercase tracking-wider mb-1.5" style={{ color: "#F87171" }}>{T("Forbidden Saat / Planet", "നിരോധിത സഅാത് / ഗ്രഹം", lang)}</p>
            <div className="flex flex-wrap gap-1.5">{chips([...new Set([...forbiddenHours, ...enemyPlanets])], "planet")}</div>
          </div>
        )}
        {reasons.length > 0 && (
          <div className="rounded-xl p-3" style={{ background: "rgba(153,27,27,0.12)", border: "1px solid rgba(248,113,113,0.45)" }}>
            <p className="font-inter text-[9px] uppercase tracking-wider mb-1.5" style={{ color: "#F87171" }}>{T("Forbidden Combinations (Book Rules)", "നിരോധിത കൂട്ടായ്മകൾ (പുസ്തക നിയമങ്ങൾ)", lang)}</p>
            <SourcesCollapse sources={reasons} lang={lang} />
          </div>
        )}
      </div>
    </Box>
  );
}
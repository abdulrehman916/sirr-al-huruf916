// ═══════════════════════════════════════════════════════════════
// SECTION 5 — FORBIDDEN CONDITIONS (Warnings only — only if applicable)
// Displays: Forbidden Saat, Planet, Day, Enemy Days, Enemy Hours
// No database dumps, no source citations, no rule IDs.
// ═══════════════════════════════════════════════════════════════
import { Ban } from "lucide-react";
import ReportSection from "./ReportSection";
import { G, T, translatePlanet, translateDay, MIZAN_DAY_NAMES } from "./shared";

function ForbiddenRow({ label, value, lang }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(", ") : value;
  return (
    <div
      className="rounded-lg p-3 mb-2"
      style={{
        background: "rgba(248,113,113,0.05)",
        border: "1px solid rgba(248,113,113,0.20)",
      }}
    >
      <p
        className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1"
        style={{ color: "#F87171" }}
      >
        {label}
      </p>
      <p
        className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"}
        style={{ color: "#fff" }}
      >
        {display}
      </p>
    </div>
  );
}

export default function SectionForbidden({ analysis, lang }) {
  const req = analysis?.req || {};
  const enemyAnalysis = analysis?.enemyAnalysis || {};

  const worstDays = (req.worstDays || []).map((d) => translateDay(MIZAN_DAY_NAMES[d] || d, lang));
  const worstHours = (req.worstHours || []).map((p) => translatePlanet(p, lang));
  const enemyPlanets = (req.enemyPlanets || []).map((p) => translatePlanet(p, lang));
  const enemyDays = (enemyAnalysis.enemyDays || []).map((d) => translateDay(MIZAN_DAY_NAMES[d] || d, lang));
  const enemyHours = (enemyAnalysis.enemyHours || []).map((p) => translatePlanet(p, lang));

  const hasAny =
    worstDays.length > 0 ||
    worstHours.length > 0 ||
    enemyPlanets.length > 0 ||
    enemyDays.length > 0 ||
    enemyHours.length > 0 ||
    enemyAnalysis.note;

  if (!hasAny) return null;

  return (
    <ReportSection
      number={5}
      title="Warnings & Forbidden Conditions"
      titleMl="മുന്നറിയിപ്പുകളും നിരോധിത വ്യവസ്ഥകളും"
      icon={Ban}
      lang={lang}
      accent="#F87171"
    >
      <ForbiddenRow
        label={T("Forbidden Saat (Hours)", "നിരോധിത സഅാത്", lang)}
        value={worstHours}
        lang={lang}
      />
      <ForbiddenRow
        label={T("Forbidden Planets", "നിരോധിത ഗ്രഹങ്ങൾ", lang)}
        value={enemyPlanets}
        lang={lang}
      />
      <ForbiddenRow
        label={T("Forbidden Days", "നിരോധിത ദിവസങ്ങൾ", lang)}
        value={worstDays}
        lang={lang}
      />
      <ForbiddenRow
        label={T("Enemy Days", "ശത്രു ദിവസങ്ങൾ", lang)}
        value={enemyDays}
        lang={lang}
      />
      <ForbiddenRow
        label={T("Enemy Hours", "ശത്രു മണിക്കൂറുകൾ", lang)}
        value={enemyHours}
        lang={lang}
      />

      {enemyAnalysis.note && (
        <div className="rounded-lg p-3 mt-2" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p
            className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed" : "font-inter text-[11px] leading-relaxed"}
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            {enemyAnalysis.note}
          </p>
        </div>
      )}
    </ReportSection>
  );
}
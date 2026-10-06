import { Ban, XCircle } from "lucide-react";
import { G, T, translatePlanet, translateDay, MIZAN_DAY_NAMES } from "../shared";

function cleanReason(text) {
  if (!text) return "";
  return String(text).replace(/Source\s*:.*?(\.|$)/gi, "").replace(/Astrology Clock\s*:/gi, "").split(/\n/)[0].trim();
}

export default function SectionForbidden({ analysis, lang }) {
  const req = analysis?.req || {};
  const conflictingRules = analysis?.conflictingRules || [];
  const liveNow = analysis?.liveNow || {};

  // Only show forbidden conditions that the database explicitly defines
  const forbiddenDays = req.worstDays || [];
  const forbiddenHours = req.worstHours || [];
  const enemyPlanets = req.enemyPlanets || [];
  const nightRequired = req.nightRequired === true;

  // One short reason from the first conflicting rule
  const reason = conflictingRules.length > 0
    ? cleanReason(lang === "ml" && conflictingRules[0].text_ml ? conflictingRules[0].text_ml : conflictingRules[0].text_en)
    : "";

  // If nothing is forbidden, don't show the section
  const hasForbidden = forbiddenDays.length > 0 || forbiddenHours.length > 0 || enemyPlanets.length > 0 || nightRequired;
  if (!hasForbidden) return null;

  function ForbiddenRow({ label, value }) {
    if (!value) return null;
    return (
      <div className="flex items-center justify-between gap-2 py-1.5 border-b last:border-0" style={{ borderColor: "rgba(248,113,113,0.10)" }}>
        <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: "#F87171" }}>{label}</span>
        <span className={lang === "ml" ? "font-malayalam text-xs font-bold text-right" : "font-inter text-xs font-bold text-right"} style={{ color: "#fff" }}>{value}</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: "1px solid rgba(248,113,113,0.25)", boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid rgba(248,113,113,0.15)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.25)" }}>
          <Ban className="w-5 h-5" style={{ color: "#F87171" }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(248,113,113,0.10)", color: "#F87171", border: "1px solid rgba(248,113,113,0.25)" }}>4</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#F87171" }}>
            {T("When NOT to Perform", "എപ്പോൾ ഒഴിവാക്കണം", lang)}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="rounded-lg p-3" style={{ background: "rgba(248,113,113,0.03)", border: "1px solid rgba(248,113,113,0.12)" }}>
          {forbiddenDays.length > 0 && (
            <ForbiddenRow
              label={T("Forbidden Day", "വിലക്കപ്പെട്ട ദിവസം", lang)}
              value={forbiddenDays.map(d => translateDay(MIZAN_DAY_NAMES[d], lang)).join(", ")}
            />
          )}
          {forbiddenHours.length > 0 && (
            <ForbiddenRow
              label={T("Forbidden Saat", "വിലക്കപ്പെട്ട സഅാത്", lang)}
              value={forbiddenHours.map(p => translatePlanet(p, lang)).join(", ")}
            />
          )}
          {enemyPlanets.length > 0 && (
            <ForbiddenRow
              label={T("Forbidden Planet", "വിലക്കപ്പെട്ട ഗ്രഹം", lang)}
              value={enemyPlanets.map(p => translatePlanet(p, lang)).join(", ")}
            />
          )}
          {nightRequired && (
            <ForbiddenRow
              label={T("Day/Night Restriction", "പകൽ/രാത്രി നിയന്ത്രണം", lang)}
              value={T("Must be Night only", "രാത്രി മാത്രം", lang)}
            />
          )}
        </div>
        {reason && (
          <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: "rgba(248,113,113,0.03)", border: "1px solid rgba(248,113,113,0.12)" }}>
            <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#F87171" }} />
            <p className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed" : "font-inter text-[11px] leading-relaxed"} style={{ color: "rgba(255,255,255,0.70)" }}>
              {reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
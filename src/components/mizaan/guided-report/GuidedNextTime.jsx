// ═══ SECTION 5 — NEXT AVAILABLE TIME ═══
// If today has no suitable time, searches future days automatically.
import { CalendarClock } from "lucide-react";
import GuidedCard from "./GuidedCard";
import {
  G,
  T,
  translatePlanet,
  translateDay,
  saatDisplayNum,
} from "../ritual-report/shared";

export default function GuidedNextTime({ analysis, lang }) {
  const isSuitable = analysis?.verdict === "Suitable";
  const betterSaats = analysis?.betterAlternatives?.betterSaats || [];
  const nextOpportunity = analysis?.nextOpportunity;

  // Hide if current is suitable, or if there are better saats today (Section 4 handles that),
  // or if no next opportunity exists, or if the next opportunity is today
  if (isSuitable || betterSaats.length > 0 || !nextOpportunity || nextOpportunity.isToday)
    return null;

  const saatNum = saatDisplayNum(nextOpportunity.hour, nextOpportunity.period);
  const dayName = translateDay(nextOpportunity.dayName, lang);

  return (
    <GuidedCard accent="rgba(212,175,55,0.40)">
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock className="w-4 h-4" style={{ color: G.text }} />
        <h3
          className={
            lang === "ml"
              ? "font-malayalam text-sm font-bold"
              : "font-inter text-sm font-bold"
          }
          style={{ color: "#fff" }}
        >
          {T("Next Available Time", "അടുത്ത ലഭ്യമായ സമയം", lang)}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p
            className="font-inter text-[10px] uppercase tracking-wider"
            style={{ color: G.dim }}
          >
            {T("Next Best Day", "അടുത്ത മികച്ച ദിവസം", lang)}
          </p>
          <p
            className={
              lang === "ml"
                ? "font-malayalam text-sm font-bold"
                : "font-inter text-sm font-bold"
            }
            style={{ color: "#fff" }}
          >
            {dayName}
          </p>
        </div>
        <div>
          <p
            className="font-inter text-[10px] uppercase tracking-wider"
            style={{ color: G.dim }}
          >
            {T("Recommended Saat", "ശുപാര്ശ സഅാത്", lang)}
          </p>
          <p
            className={
              lang === "ml"
                ? "font-malayalam text-sm font-bold"
                : "font-inter text-sm font-bold"
            }
            style={{ color: "#fff" }}
          >
            #{saatNum} ({translatePlanet(nextOpportunity.planet, lang)})
          </p>
        </div>
        <div>
          <p
            className="font-inter text-[10px] uppercase tracking-wider"
            style={{ color: G.dim }}
          >
            {T("Recommended Time", "ശുപാര്ശ സമയം", lang)}
          </p>
          <p
            className="font-inter text-sm font-bold"
            style={{ color: "#fff" }}
          >
            {nextOpportunity.startTime} – {nextOpportunity.endTime}
          </p>
        </div>
        <div>
          <p
            className="font-inter text-[10px] uppercase tracking-wider"
            style={{ color: G.dim }}
          >
            {T("Days Ahead", "ദിവസങ്ങൾക്ക് ശേഷം", lang)}
          </p>
          <p
            className="font-inter text-sm font-bold"
            style={{ color: "#fff" }}
          >
            {nextOpportunity.daysAhead}
          </p>
        </div>
      </div>
      <p
        className={
          lang === "ml"
            ? "font-malayalam text-xs leading-relaxed"
            : "font-inter text-xs leading-relaxed"
        }
        style={{ color: "rgba(255,255,255,0.60)" }}
      >
        {T(
          "All conditions are satisfied at this time.",
          "ഈ സമയത്തിൽ എല്ലാ വ്യവസ്ഥകളും പാലിക്കപ്പെടുന്നു.",
          lang
        )}
      </p>
    </GuidedCard>
  );
}
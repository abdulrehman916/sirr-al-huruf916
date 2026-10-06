// ═══ SECTION 4 — CAN I DO THIS TODAY? ═══
// If current selection is NOT suitable, searches today's remaining hours.
// If a better time exists TODAY, displays it. Otherwise hides.
import { Clock, ArrowRight } from "lucide-react";
import GuidedCard from "./GuidedCard";
import {
  G,
  T,
  translatePlanet,
} from "../ritual-report/shared";

export default function GuidedTodayAlt({ analysis, lang }) {
  const isSuitable = analysis?.verdict === "Suitable";
  const betterSaats = analysis?.betterAlternatives?.betterSaats || [];

  // Hide if current is suitable or no better saats today
  if (isSuitable || betterSaats.length === 0) return null;

  const best = betterSaats[0];
  const reason =
    best.whyBetter?.length > 0
      ? lang === "ml" && best.whyBetter[0].text_ml
        ? best.whyBetter[0].text_ml
        : best.whyBetter[0].text_en
      : T(
          "All conditions are satisfied at this hour.",
          "ഈ മണിക്കൂറിൽ എല്ലാ വ്യവസ്ഥകളും പാലിക്കപ്പെടുന്നു.",
          lang
        );

  return (
    <GuidedCard accent="rgba(74,222,128,0.30)">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4" style={{ color: "#4ADE80" }} />
        <h3
          className={
            lang === "ml"
              ? "font-malayalam text-sm font-bold"
              : "font-inter text-sm font-bold"
          }
          style={{ color: "#fff" }}
        >
          {T("Better Time Today", "ഇന്ന് മികച്ച സമയം", lang)}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p
            className="font-inter text-[10px] uppercase tracking-wider"
            style={{ color: G.dim }}
          >
            {T("Recommended Hour", "ശുപാര്ശ മണിക്കൂർ", lang)}
          </p>
          <p
            className="font-inter text-sm font-bold"
            style={{ color: "#fff" }}
          >
            {best.startTime} – {best.endTime}
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
            #{best.saatNum} ({translatePlanet(best.planet, lang)})
          </p>
        </div>
      </div>
      <div
        className="rounded-lg p-2 flex items-start gap-2"
        style={{ background: "rgba(74,222,128,0.06)" }}
      >
        <ArrowRight
          className="w-3 h-3 flex-shrink-0 mt-0.5"
          style={{ color: "#4ADE80" }}
        />
        <p
          className={
            lang === "ml" && best.whyBetter?.[0]?.text_ml
              ? "font-malayalam text-xs leading-relaxed"
              : "font-inter text-xs leading-relaxed"
          }
          style={{ color: "rgba(255,255,255,0.70)" }}
        >
          {reason}
        </p>
      </div>
    </GuidedCard>
  );
}
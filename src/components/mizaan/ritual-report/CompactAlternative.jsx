// ═══════════════════════════════════════════════════════════════
// COMPACT ALTERNATIVE — Only shown if selected time is NOT suitable
// Shows: Today's best alternative OR Next suitable day+time
// Short card: Status, Time, Recommendation. Nothing more.
// ═══════════════════════════════════════════════════════════════
import { Sunset } from "lucide-react";
import { G, T, translatePlanet, translateDay, saatDisplayNum } from "./shared";

export default function CompactAlternative({ analysis, lang }) {
  const verdict = analysis?.verdict || "Not Suitable";
  const verdictSuitable = verdict === "Suitable";

  // Only show if NOT suitable
  if (verdictSuitable) return null;

  const betterSaats = analysis?.betterAlternatives?.betterSaats || [];
  const nextLayl = analysis?.betterAlternatives?.nextLayl || null;
  const nextOpp = analysis?.nextOpportunity || null;

  // Priority: 1. Today's better saat → 2. Next Layl/Nahar → 3. Next opportunity
  const todayAlt = betterSaats[0] || null;
  const alt = todayAlt || nextLayl || nextOpp || null;

  if (!alt) {
    return (
      <div
        className="rounded-2xl p-4"
        style={{
          background:
            "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
          border: `1px solid rgba(248,113,113,0.30)`,
        }}
      >
        <div className="flex items-center gap-3">
          <Sunset className="w-5 h-5 flex-shrink-0" style={{ color: "#F87171" }} />
          <div>
            <p
              className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"}
              style={{ color: "#fff" }}
            >
              {T("Alternative Recommendation", "ബദൽ ശുപാർശം", lang)}
            </p>
            <p
              className={lang === "ml" ? "font-malayalam text-xs mt-1" : "font-inter text-xs mt-1"}
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              {T(
                "No suitable time within 14 days.",
                "14 ദിവസത്തിനുള്ളിൽ അനുയോജ്യമായ സമയമില്ല.",
                lang
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Build display values
  const isToday = todayAlt ? true : (nextLayl?.isToday || nextOpp?.isToday);
  const dayName = alt.dayName || (nextOpp?.dayName);
  const saatNum = alt.saatNum || saatDisplayNum(alt.hour || alt.hourNumber, alt.period);
  const planet = alt.planet;
  const startTime = alt.startTime;
  const endTime = alt.endTime;
  const daysAhead = alt.daysAhead;

  const statusText = isToday
    ? T("Today's Best Alternative", "ഇന്നത്തെ മികച്ച ബദൽ", lang)
    : T("Next Suitable Time", "അടുത്ത അനുയോജ്യ സമയം", lang);

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background:
          "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid rgba(74,222,128,0.30)`,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <Sunset className="w-5 h-5 flex-shrink-0" style={{ color: "#4ADE80" }} />
        <p
          className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"}
          style={{ color: "#fff" }}
        >
          {T("Alternative Recommendation", "ബദൽ ശുപാർശം", lang)}
        </p>
      </div>

      <div
        className="rounded-lg p-3"
        style={{
          background: "rgba(74,222,128,0.06)",
          border: "1px solid rgba(74,222,128,0.20)",
        }}
      >
        <p
          className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2"
          style={{ color: "#4ADE80" }}
        >
          {statusText}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>
              {T("Day", "ദിവസം", lang)}
            </p>
            <p
              className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"}
              style={{ color: "#fff" }}
            >
              {translateDay(dayName, lang)}
              {!isToday && daysAhead > 0
                ? ` (${daysAhead} ${T("days away", "ദിവസം അകലെ", lang)})`
                : isToday
                ? ` (${T("Today", "ഇന്ന്", lang)})`
                : ""}
            </p>
          </div>
          <div>
            <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>
              {T("Saat", "സഅാത്", lang)}
            </p>
            <p className="font-inter text-xs font-bold" style={{ color: "#fff" }}>
              #{saatNum} ({translatePlanet(planet, lang)})
            </p>
          </div>
        </div>
        {startTime && endTime && (
          <div className="mt-2">
            <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>
              {T("Time Window", "സമയ ജാലകം", lang)}
            </p>
            <p className="font-inter text-xs font-bold" style={{ color: "#fff" }}>
              {startTime} – {endTime}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
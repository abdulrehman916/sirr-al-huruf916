// ═══════════════════════════════════════════════════════════════
// NEXT GOOD HOUR
// Book-based knowledge ONLY
// Turkish → Malayalam Translation Layer: Applied
// ═══════════════════════════════════════════════════════════════

import { Clock, ArrowRight, Star } from "lucide-react";
import { translateTurkishToMalayalam } from "@/lib/astroClockTurkishToMalayalam.js";

const G = {
  excellent: "rgba(34,197,94,0.15)",
  excellentBorder: "rgba(34,197,94,0.60)",
  excellentText: "#22c55e",
};

export default function NextGoodHour({ nextGoodHour, isMalayalam }) {
  if (!nextGoodHour) return null;

  const formatHour = (hour) => {
    const actualHour = hour >= 24 ? hour - 24 : hour;
    const period = actualHour >= 6 && actualHour < 18 ? "AM" : "PM";
    const displayHour = actualHour > 12 ? actualHour - 12 : actualHour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="rounded-xl border p-5" style={{ background: G.excellent, borderColor: G.excellentBorder }}>
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-6 h-6" style={{ color: G.excellentText }} />
        <div>
          <h3 className="font-malayalam-md font-bold" style={{ color: "#fff" }}>
            {isMalayalam ? "അടുത്ത ഉത്തമ സമയം" : "NEXT GOOD HOUR"}
          </h3>
          <p className="font-inter text-xs" style={{ color: G.excellentText }}>
            {isMalayalam ? "ഉടൻ വരുന്ന അനുകൂല സമയം" : "Next favorable timing"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-lg" style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.30)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-inter text-[9px] uppercase tracking-wider" style={{ color: "rgba(34,197,94,0.60)" }}>
              {isMalayalam ? "സമയം" : "TIME"}
            </span>
            <Star className="w-4 h-4" style={{ color: G.excellentText }} />
          </div>
          <p className="font-amiri text-2xl font-bold" style={{ color: "#86efac" }}>
            {formatHour(nextGoodHour.hour)}
          </p>
        </div>

        <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <p className="font-inter text-[9px] uppercase tracking-wider mb-1" style={{ color: "rgba(34,197,94,0.50)" }}>
            {isMalayalam ? "ഗ്രഹം" : "PLANET"}
          </p>
          <p className="font-inter text-sm font-bold" style={{ color: "#86efac" }}>
            {translateTurkishToMalayalam(nextGoodHour.planet)}
          </p>
        </div>

        <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <p className="font-inter text-[9px] uppercase tracking-wider mb-1" style={{ color: "rgba(34,197,94,0.50)" }}>
            {isMalayalam ? "കാരണം" : "REASON"}
          </p>
          <p className="font-inter text-sm" style={{ color: "#86efac" }}>
            {nextGoodHour.reason}
          </p>
        </div>

        <div className="pt-3 border-t" style={{ borderColor: "rgba(34,197,94,0.20)" }}>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-3 h-3" style={{ color: "rgba(34,197,94,0.50)" }} />
            <p className="font-inter text-xs" style={{ color: "rgba(34,197,94,0.60)" }}>
              {nextGoodHour.source} {nextGoodHour.page}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
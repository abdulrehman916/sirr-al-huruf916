// ═══════════════════════════════════════════════════════════════
// REPORT WINDOWS LIST — Star-rated time windows for Ritual Decision Engine
// Renders each suitable period with star rating + per-window strength reason.
// ═══════════════════════════════════════════════════════════════
import { Clock } from "lucide-react";
import { tStr } from "../../lib/ritualTimingI18n";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
};

// Star color by count (5=gold, 4=green, 3=amber, 2-1=dim)
function starColor(starsStr) {
  const count = (starsStr.match(/★/g) || []).length;
  if (count >= 5) return "#F5D060";
  if (count >= 4) return "#86EFAC";
  if (count >= 3) return "#FBBF24";
  if (count >= 2) return "#F59E0B";
  return "#F87171";
}

export default function ReportWindowsList({ windows, lang = "ml" }) {
  if (!windows || windows.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {windows.map((w, i) => {
        const color = starColor(w.stars);
        return (
          <div key={i} className="rounded-lg p-2.5" style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${w.stars.length > 9 ? "rgba(212,175,55,0.30)" : G.border}`,
          }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" style={{ color: G.dim }} />
                <span className="font-inter text-sm font-bold" style={{ color: "#fff" }}>{w.time}</span>
              </div>
              <span className="font-inter text-base font-bold tracking-wider" style={{ color }}>
                {w.stars}
              </span>
            </div>
            <p className="font-inter text-[11px] mb-0.5" style={{ color: "rgba(255,255,255,0.60)" }}>
              <span className="font-bold" style={{ color: G.text }}>{w.planet}</span> · {tStr("hour", lang)} #{w.hourNumber} · {w.period === 'day' ? tStr("daytime", lang) : tStr("nighttime", lang)}
            </p>
            <p className="font-inter text-[10px] leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>
              {w.strengthReason}
            </p>
          </div>
        );
      })}
    </div>
  );
}
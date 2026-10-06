// ═══════════════════════════════════════════════════════════════
// NEXT GOOD DAY
// Book-based knowledge ONLY
// Turkish → Malayalam Translation Layer: Applied
// ═══════════════════════════════════════════════════════════════

import { Sun, ArrowRight, Calendar } from "lucide-react";
import { translateTurkishToMalayalam } from "@/lib/astroClockTurkishToMalayalam.js";

const G = {
  excellent: "rgba(34,197,94,0.15)",
  excellentBorder: "rgba(34,197,94,0.60)",
  excellentText: "#22c55e",
};

export default function NextGoodDay({ nextGoodDay, isMalayalam }) {
  if (!nextGoodDay) return null;

  const dayNames = {
    Sunday: { ml: "ഞായർ", ar: "الأحد" },
    Monday: { ml: "തിങ്കൾ", ar: "الإثنين" },
    Tuesday: { ml: "ചൊവ്വ", ar: "الثلاثاء" },
    Wednesday: { ml: "ബുധൻ", ar: "الأربعاء" },
    Thursday: { ml: "വ്യാഴം", ar: "الخميس" },
    Friday: { ml: "വെള്ളി", ar: "الجمعة" },
    Saturday: { ml: "ശനി", ar: "السبت" }
  };

  const dayData = dayNames[nextGoodDay.day] || { ml: nextGoodDay.day, ar: nextGoodDay.day };

  return (
    <div className="rounded-xl border p-5" style={{ background: G.excellent, borderColor: G.excellentBorder }}>
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6" style={{ color: G.excellentText }} />
        <div>
          <h3 className="font-malayalam-md font-bold" style={{ color: "#fff" }}>
            {isMalayalam ? "അടുത്ത ഉത്തമ ദിവസം" : "NEXT GOOD DAY"}
          </h3>
          <p className="font-inter text-xs" style={{ color: G.excellentText }}>
            {isMalayalam ? "വരാനിരിക്കുന്ന അനുകൂല ദിവസം" : "Next favorable day"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-lg" style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.30)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-inter text-[9px] uppercase tracking-wider" style={{ color: "rgba(34,197,94,0.60)" }}>
              {isMalayalam ? "ദിവസം" : "DAY"}
            </span>
            <Sun className="w-4 h-4" style={{ color: G.excellentText }} />
          </div>
          <div className="flex items-baseline gap-3">
            <p className="font-amiri text-2xl font-bold" style={{ color: "#86efac" }}>
              {dayData.ar}
            </p>
            <p className="font-inter text-lg font-bold" style={{ color: "#86efac" }}>
              {isMalayalam ? dayData.ml : nextGoodDay.day}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <p className="font-inter text-[9px] uppercase tracking-wider mb-1" style={{ color: "rgba(34,197,94,0.50)" }}>
            {isMalayalam ? "ദിവസ നാഥൻ" : "DAY RULER"}
          </p>
          <p className="font-amiri text-lg font-bold" style={{ color: "#86efac" }}>
            {translateTurkishToMalayalam(nextGoodDay.ruler)}
          </p>
        </div>

        <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <p className="font-inter text-[9px] uppercase tracking-wider mb-1" style={{ color: "rgba(34,197,94,0.50)" }}>
            {isMalayalam ? "കാരണം" : "REASON"}
          </p>
          <p className="font-inter text-sm" style={{ color: "#86efac" }}>
            {nextGoodDay.reason}
          </p>
        </div>

        <div className="pt-3 border-t" style={{ borderColor: "rgba(34,197,94,0.20)" }}>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-3 h-3" style={{ color: "rgba(34,197,94,0.50)" }} />
            <p className="font-inter text-xs" style={{ color: "rgba(34,197,94,0.60)" }}>
              {nextGoodDay.source} {nextGoodDay.page}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
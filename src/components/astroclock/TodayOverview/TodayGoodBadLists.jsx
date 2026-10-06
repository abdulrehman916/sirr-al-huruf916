// ═══════════════════════════════════════════════════════════════
// TODAY GOOD FOR / BAD FOR LISTS
// Book-based knowledge ONLY
// Turkish → Malayalam Translation Layer: Applied
// ═══════════════════════════════════════════════════════════════

import { CheckCircle, AlertCircle } from "lucide-react";
import { translateTurkishToMalayalam } from "@/lib/astroClockTurkishToMalayalam.js";

const G = {
  excellent: "rgba(34,197,94,0.15)",
  excellentBorder: "rgba(34,197,94,0.60)",
  excellentText: "#22c55e",
  avoid: "rgba(239,68,68,0.15)",
  avoidBorder: "rgba(239,68,68,0.60)",
  avoidText: "#ef4444",
};

export default function TodayGoodBadLists({ goodFor, badFor, isMalayalam }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <GoodForToday goodFor={goodFor} isMalayalam={isMalayalam} />
      <BadForToday badFor={badFor} isMalayalam={isMalayalam} />
    </div>
  );
}

function GoodForToday({ goodFor, isMalayalam }) {
  if (!goodFor || goodFor.length === 0) return null;
  
  return (
    <div className="rounded-xl border p-5" style={{ background: G.excellent, borderColor: G.excellentBorder }}>
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5" style={{ color: G.excellentText }} />
        <h3 className="font-inter text-sm font-bold uppercase tracking-wider" style={{ color: G.excellentText }}>
          {isMalayalam ? "ഇന്ന് ഉത്തമം" : "GOOD FOR TODAY"}
        </h3>
      </div>
      <div className="space-y-2">
        {goodFor.slice(0, 6).map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.20)" }}>
            <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: G.excellentText }} />
            <div>
              <p className="font-inter text-xs font-medium" style={{ color: "#86efac" }}>
                {translateTurkishToMalayalam(item.text)}
              </p>
              <p className="font-inter text-[8px]" style={{ color: "rgba(34,197,94,0.50)" }}>{item.source} {item.page}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BadForToday({ badFor, isMalayalam }) {
  if (!badFor || badFor.length === 0) return null;
  
  return (
    <div className="rounded-xl border p-5" style={{ background: G.avoid, borderColor: G.avoidBorder }}>
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-5 h-5" style={{ color: G.avoidText }} />
        <h3 className="font-inter text-sm font-bold uppercase tracking-wider" style={{ color: G.avoidText }}>
          {isMalayalam ? "ഇന്ന് ഒഴിവാക്കുക" : "BAD FOR TODAY"}
        </h3>
      </div>
      <div className="space-y-2">
        {badFor.slice(0, 6).map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)" }}>
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: G.avoidText }} />
            <div>
              <p className="font-inter text-xs font-medium" style={{ color: "#fca5a5" }}>
                {translateTurkishToMalayalam(item.text)}
              </p>
              <p className="font-inter text-[8px]" style={{ color: "rgba(239,68,68,0.50)" }}>{item.source} {item.page}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
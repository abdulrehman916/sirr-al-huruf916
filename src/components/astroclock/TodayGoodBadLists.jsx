// ═══════════════════════════════════════════════════════════════
// TODAY GOOD FOR / BAD FOR LISTS
// Book-based knowledge ONLY
// ═══════════════════════════════════════════════════════════════

import { CheckCircle, AlertCircle } from "lucide-react";

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
      <GoodForList goodFor={goodFor} isMalayalam={isMalayalam} />
      <BadForList badFor={badFor} isMalayalam={isMalayalam} />
    </div>
  );
}

function GoodForList({ goodFor, isMalayalam }) {
  if (!goodFor || goodFor.length === 0) {
    return (
      <div className="rounded-xl border p-5 text-center" style={{ background: G.excellent, borderColor: G.excellentBorder }}>
        <p className="font-inter text-sm" style={{ color: G.excellentText }}>
          {isMalayalam ? "ഉത്തമ പ്രവർത്തനങ്ങൾ ലഭ്യമല്ല" : "No favorable operations found"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5" style={{ background: G.excellent, borderColor: G.excellentBorder }}>
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5" style={{ color: G.excellentText }} />
        <h3 className="font-inter text-sm font-bold uppercase tracking-wider" style={{ color: G.excellentText }}>
          {isMalayalam ? "ഇന്ന് ഉത്തമം" : "GOOD FOR TODAY"}
        </h3>
      </div>
      <div className="space-y-2">
        {goodFor.map((item, idx) => (
          <div key={idx} className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)" }}>
            <p className="font-inter text-sm font-medium mb-1" style={{ color: "#86efac" }}>{item.text}</p>
            <p className="font-inter text-[9px]" style={{ color: "rgba(34,197,94,0.50)" }}>
              {item.source} {item.page}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BadForList({ badFor, isMalayalam }) {
  if (!badFor || badFor.length === 0) {
    return (
      <div className="rounded-xl border p-5 text-center" style={{ background: G.avoid, borderColor: G.avoidBorder }}>
        <p className="font-inter text-sm" style={{ color: G.avoidText }}>
          {isMalayalam ? "ഒഴിവാക്കേണ്ട കാര്യങ്ങളില്ല" : "No specific warnings for today"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5" style={{ background: G.avoid, borderColor: G.avoidBorder }}>
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5" style={{ color: G.avoidText }} />
        <h3 className="font-inter text-sm font-bold uppercase tracking-wider" style={{ color: G.avoidText }}>
          {isMalayalam ? "ഇന്ന് ഒഴിവാക്കുക" : "BAD FOR TODAY"}
        </h3>
      </div>
      <div className="space-y-2">
        {badFor.map((item, idx) => (
          <div key={idx} className="p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <p className="font-inter text-sm font-medium mb-1" style={{ color: "#fca5a5" }}>{item.text}</p>
            <p className="font-inter text-[9px]" style={{ color: "rgba(239,68,68,0.50)" }}>
              {item.source} {item.page}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// CURRENT HOUR ANALYSIS
// Book-based knowledge ONLY
// ═══════════════════════════════════════════════════════════════

import { Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  excellent: "rgba(34,197,94,0.15)",
  excellentBorder: "rgba(34,197,94,0.60)",
  excellentText: "#22c55e",
  avoid: "rgba(239,68,68,0.15)",
  avoidBorder: "rgba(239,68,68,0.60)",
  avoidText: "#ef4444",
};

export default function CurrentHourAnalysis({ hourAnalysis, isMalayalam }) {
  if (!hourAnalysis) {
    return (
      <div className="rounded-xl border p-5 text-center" style={{ background: G.bg, borderColor: G.border }}>
        <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: G.dim }} />
        <p className="font-inter text-sm" style={{ color: G.dim }}>
          {isMalayalam ? "നിലവിലെ മണിക്കൂർ വിശകലനം ലഭ്യമല്ല" : "Current hour analysis not available"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5" style={{ background: G.bgHi, borderColor: G.borderHi }}>
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-6 h-6" style={{ color: G.text }} />
        <div>
          <h3 className="font-malayalam-md font-bold" style={{ color: "#fff" }}>
            {isMalayalam ? "നിലവിലെ മണിക്കൂർ" : "CURRENT HOUR ANALYSIS"}
          </h3>
          <p className="font-inter text-xs" style={{ color: G.dim }}>
            {hourAnalysis.planet} Hour • {isMalayalam ? "ഗ്രഹ സ്വാധീനം" : "Planetary Influence"}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* CAN DO NOW */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4" style={{ color: G.excellentText }} />
            <h4 className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: G.excellentText }}>
              {isMalayalam ? "ഇപ്പോൾ ചെയ്യാം" : "CAN DO NOW"}
            </h4>
          </div>
          {hourAnalysis.canDo && hourAnalysis.canDo.length > 0 ? (
            <div className="space-y-2">
              {hourAnalysis.canDo.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg" style={{ background: G.excellent, border: `1px solid ${G.excellentBorder}` }}>
                  <p className="font-inter text-sm font-medium mb-1" style={{ color: "#86efac" }}>{item.text}</p>
                  <p className="font-inter text-[9px]" style={{ color: "rgba(34,197,94,0.50)" }}>
                    {item.source} {item.page}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-inter text-sm text-center py-4" style={{ color: G.dim }}>
              {isMalayalam ? "നിർദ്ദിഷ്‌ട പ്രവർത്തനങ്ങളില്ല" : "No specific recommendations"}
            </p>
          )}
        </div>

        {/* AVOID NOW */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4" style={{ color: G.avoidText }} />
            <h4 className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: G.avoidText }}>
              {isMalayalam ? "ഇപ്പോൾ ഒഴിവാക്കുക" : "AVOID NOW"}
            </h4>
          </div>
          {hourAnalysis.avoid && hourAnalysis.avoid.length > 0 ? (
            <div className="space-y-2">
              {hourAnalysis.avoid.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg" style={{ background: G.avoid, border: `1px solid ${G.avoidBorder}` }}>
                  <p className="font-inter text-sm font-medium mb-1" style={{ color: "#fca5a5" }}>{item.text}</p>
                  <p className="font-inter text-[9px]" style={{ color: "rgba(239,68,68,0.50)" }}>
                    {item.source} {item.page}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-inter text-sm text-center py-4" style={{ color: G.dim }}>
              {isMalayalam ? "ഒഴിവാക്കേണ്ട കാര്യങ്ങളില്ല" : "No specific warnings"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// CURRENT HOUR ANALYSIS
// Book-based knowledge ONLY
// ═══════════════════════════════════════════════════════════════

import { Clock, AlertCircle, CheckCircle } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  excellent: "rgba(34,197,94,0.15)",
  excellentBorder: "rgba(34,197,94,0.60)",
  excellentText: "#22c55e",
  avoid: "rgba(239,68,68,0.15)",
  avoidBorder: "rgba(239,68,68,0.60)",
  avoidText: "#ef4444",
};

export default function CurrentHourAnalysis({ hourAnalysis, isMalayalam }) {
  if (!hourAnalysis) return null;
  
  return (
    <div className="rounded-xl border p-5" style={{ background: G.bg, borderColor: G.border }}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5" style={{ color: G.text }} />
        <h3 className="font-inter text-sm font-bold uppercase tracking-wider" style={{ color: G.text }}>
          {isMalayalam ? "നിലവിലെ മണിക്കൂർ" : "CURRENT HOUR ANALYSIS"}
        </h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Can Do Now */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4" style={{ color: G.excellentText }} />
            <h4 className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: G.excellentText }}>
              {isMalayalam ? "ചെയ്യാവുന്നത്" : "CAN DO NOW"}
            </h4>
          </div>
          {hourAnalysis.canDo && hourAnalysis.canDo.length > 0 ? (
            <div className="space-y-2">
              {hourAnalysis.canDo.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg" style={{ background: G.excellent, border: `1px solid ${G.excellentBorder}` }}>
                  <p className="font-inter text-sm font-medium mb-1" style={{ color: "#86efac" }}>{item.text}</p>
                  <p className="font-inter text-[8px]" style={{ color: "rgba(34,197,94,0.50)" }}>
                    {item.source} {item.page}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-inter text-sm text-center py-4" style={{ color: G.dim }}>
              {isMalayalam ? "പ്രത്യേക നിർദ്ദേശങ്ങളില്ല" : "No specific guidance"}
            </p>
          )}
        </div>
        
        {/* Avoid Now */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4" style={{ color: G.avoidText }} />
            <h4 className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: G.avoidText }}>
              {isMalayalam ? "ഒഴിവാക്കുക" : "AVOID NOW"}
            </h4>
          </div>
          {hourAnalysis.avoid && hourAnalysis.avoid.length > 0 ? (
            <div className="space-y-2">
              {hourAnalysis.avoid.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg" style={{ background: G.avoid, border: `1px solid ${G.avoidBorder}` }}>
                  <p className="font-inter text-sm font-medium mb-1" style={{ color: "#fca5a5" }}>{item.text}</p>
                  <p className="font-inter text-[8px]" style={{ color: "rgba(239,68,68,0.50)" }}>
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
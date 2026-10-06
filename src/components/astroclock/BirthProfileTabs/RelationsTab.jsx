// ═══════════════════════════════════════════════════════════════
// RELATIONS TAB COMPONENT — Birth Profile Analyzer
// Displays friendly and enemy relationships
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  success: "rgba(34,197,94,0.60)",
  warning: "rgba(255,193,7,0.60)",
  danger: "rgba(239,68,68,0.60)"
};

export default function RelationsTab({ profile, isMalayalam }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.05)" }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.success }}>
            {isMalayalam ? "സൌഹൃദ രാശികൾ" : "Friendly Signs"}
          </p>
          <div className="space-y-1">
            {(isMalayalam ? profile.relationships.friendlySigns_ml : profile.relationships.friendlySigns_en || []).map((sign, idx) => (
              <p key={idx} className="font-inter text-xs text-white/80">• {sign}</p>
            ))}
          </div>
        </div>
        
        <div className="p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.05)" }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.danger }}>
            {isMalayalam ? "ശത്രു രാശികൾ" : "Enemy Signs"}
          </p>
          <div className="space-y-1">
            {(isMalayalam ? profile.relationships.enemySigns_ml : profile.relationships.enemySigns_en || []).map((sign, idx) => (
              <p key={idx} className="font-inter text-xs text-white/80">• {sign}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.05)" }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.success }}>
            {isMalayalam ? "സൌഹൃദ ഗ്രഹങ്ങൾ" : "Friendly Planets"}
          </p>
          <div className="space-y-1">
            {(isMalayalam ? profile.relationships.friendlyPlanets_ml : profile.relationships.friendlyPlanets_en || []).map((planet, idx) => (
              <p key={idx} className="font-inter text-xs text-white/80">• {planet}</p>
            ))}
          </div>
        </div>
        
        <div className="p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.05)" }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.danger }}>
            {isMalayalam ? "ശത്രു ഗ്രഹങ്ങൾ" : "Enemy Planets"}
          </p>
          <div className="space-y-1">
            {(isMalayalam ? profile.relationships.enemyPlanets_ml : profile.relationships.enemyPlanets_en || []).map((planet, idx) => (
              <p key={idx} className="font-inter text-xs text-white/80">• {planet}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
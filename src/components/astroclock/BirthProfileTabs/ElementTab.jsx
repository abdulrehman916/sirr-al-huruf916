// ═══════════════════════════════════════════════════════════════
// ELEMENT TAB COMPONENT — Birth Profile Analyzer
// Displays elemental properties and associations
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

export default function ElementTab({ profile, isMalayalam }) {
  if (!profile.element) return null;

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="font-inter text-2xl font-bold text-white mb-1">
          {isMalayalam ? profile.element.name_ml : profile.element.name_en}
        </p>
        <p className="font-inter text-xs text-white/60">
          {isMalayalam ? profile.element.direction_ml : profile.element.direction_en} {isMalayalam ? "ദിശ" : "Direction"}
        </p>
      </div>

      <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
        <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
          {isMalayalam ? "ഗുണങ്ങൾ" : "Qualities"}
        </p>
        <div className="flex flex-wrap gap-2">
          {(isMalayalam ? profile.element.qualities_ml : profile.element.qualities_en || []).map((quality, idx) => (
            <span key={idx} className="px-2 py-1 rounded text-[10px]" style={{ background: G.bg, color: G.text }}>
              {quality}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.05)" }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.success }}>
            {isMalayalam ? "അനുയോജ്യ മൂലകങ്ങൾ" : "Compatible"}
          </p>
          <div className="space-y-1">
            {(isMalayalam ? profile.element.compatible_ml : profile.element.compatible_en || []).map((elem, idx) => (
              <p key={idx} className="font-inter text-xs text-white/80">• {elem}</p>
            ))}
          </div>
        </div>
        
        <div className="p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.05)" }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.danger }}>
            {isMalayalam ? "അനുയോജ്യമല്ലാത്ത മൂലകങ്ങൾ" : "Incompatible"}
          </p>
          <div className="space-y-1">
            {(isMalayalam ? profile.element.incompatible_ml : profile.element.incompatible_en || []).map((elem, idx) => (
              <p key={idx} className="font-inter text-xs text-white/80">• {elem}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
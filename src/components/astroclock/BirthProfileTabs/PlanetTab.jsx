// ═══════════════════════════════════════════════════════════════
// PLANET TAB COMPONENT — Birth Profile Analyzer
// Displays ruling planet information
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { Info } from "lucide-react";

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

export default function PlanetTab({ profile, isMalayalam }) {
  if (!profile.rulingPlanet) return null;

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-5xl mb-2">{profile.rulingPlanet.symbol}</p>
        <p className="font-amiri text-5xl md:text-6xl font-bold leading-relaxed mb-3" style={{ color: G.text, textShadow: "0 0 30px rgba(212,175,55,0.3)" }}>
          {profile.rulingPlanet.name_ar}
        </p>
        <div className="h-px w-20 mx-auto mb-3" style={{ background: `linear-gradient(90deg, transparent, ${G.border}, transparent)` }} />
        <p className="font-inter text-lg font-bold text-white">
          {isMalayalam ? profile.rulingPlanet.name_ml : profile.rulingPlanet.name_en}
        </p>
        <p className="font-inter text-xs text-white/60 mt-1">
          {isMalayalam ? profile.rulingPlanet.nature_ml : profile.rulingPlanet.nature_en}
        </p>
      </div>

      <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.05)" }}>
        <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.success }}>
          {isMalayalam ? "ഗുണങ്ങൾ" : "Benefits"}
        </p>
        <div className="space-y-1">
          {(isMalayalam ? profile.rulingPlanet.benefits_ml : profile.rulingPlanet.benefits_en || []).map((benefit, idx) => (
            <p key={idx} className="font-inter text-xs text-white/80">• {benefit}</p>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-lg" style={{ background: G.bg }}>
        <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
          {isMalayalam ? "ആത്മിക പ്രവർത്തനങ്ങൾ" : "Spiritual Operations"}
        </p>
        <p className="font-inter text-sm text-white/80">
          {isMalayalam ? profile.rulingPlanet.spiritualOperations_ml : profile.rulingPlanet.spiritualOperations_en}
        </p>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// INCENSE TAB COMPONENT — Birth Profile Analyzer
// Displays incense recommendations
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

export default function IncenseTab({ profile, isMalayalam }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="font-amiri text-5xl md:text-6xl font-bold leading-relaxed mb-3" style={{ color: G.text, textShadow: "0 0 30px rgba(212,175,55,0.3)" }}>
          {profile.incense.ar}
        </p>
        <div className="h-px w-20 mx-auto mb-3" style={{ background: `linear-gradient(90deg, transparent, ${G.border}, transparent)` }} />
        <p className="font-inter text-sm text-white/80">
          {isMalayalam ? profile.incense.ml : profile.incense.en}
        </p>
      </div>

      <div className="p-4 rounded-lg" style={{ background: "rgba(212,175,55,0.04)" }}>
        <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
          {isMalayalam ? "ഉപയോഗം" : "How to Use"}
        </p>
        <p className="font-inter text-xs text-white/70">
          {isMalayalam 
            ? "ഈ സുഗന്ധം നിങ്ങളുടെ ജന്മനക്ഷത്രത്തിന്റെ ഭരണ ഗ്രഹത്തിന് അനുയോജ്യമാണ്. പ്രത്യേക ആവശ്യങ്ങൾക്കായി ഉപയോഗിക്കുക."
            : "This incense is aligned with your zodiac sign's ruling planet. Use during planetary hours for enhanced effects."}
        </p>
      </div>
    </div>
  );
}
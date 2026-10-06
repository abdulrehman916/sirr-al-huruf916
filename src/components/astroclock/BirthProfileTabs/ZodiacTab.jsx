// ═══════════════════════════════════════════════════════════════
// ZODIAC TAB COMPONENT — Birth Profile Analyzer
// Displays zodiac sign information
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

export default function ZodiacTab({ profile, isMalayalam }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="font-amiri text-5xl md:text-6xl font-bold leading-relaxed mb-3" style={{ color: G.text, textShadow: "0 0 30px rgba(212,175,55,0.3)" }}>
          {profile.zodiacSign.name_ar}
        </p>
        <div className="h-px w-20 mx-auto mb-3" style={{ background: `linear-gradient(90deg, transparent, ${G.border}, transparent)` }} />
        <p className="font-inter text-xl font-bold text-white">
          {isMalayalam ? profile.zodiacSign.name_ml : profile.zodiacSign.name_en}
        </p>
        <p className="font-inter text-xs text-white/60 mt-1">
          {isMalayalam ? profile.zodiacSign.dateRangeMl : profile.zodiacSign.dateRange}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoCard
          label_en="Gender"
          label_ml="ലിംഗം"
          value={isMalayalam ? profile.gender.ml : profile.gender.en}
          isMalayalam={isMalayalam}
        />
        <InfoCard
          label_en="Metal"
          label_ml="ലോഹം"
          value={isMalayalam ? profile.metal.ml : profile.metal.en}
          isMalayalam={isMalayalam}
        />
      </div>

      <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
        <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
          {isMalayalam ? "ആത്മിക അർത്ഥം" : "Spiritual Meaning"}
        </p>
        <p className="font-inter text-sm text-white/80">
          {isMalayalam ? profile.spiritualMeaning.ml : profile.spiritualMeaning.en}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ label_en, label_ml, value, isMalayalam }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
        {isMalayalam ? label_ml : label_en}
      </p>
      <p className="font-inter text-sm font-bold text-white">{value}</p>
    </div>
  );
}
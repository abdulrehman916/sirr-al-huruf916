// ═══════════════════════════════════════════════════════════════
// CURRENT INFLUENCES GRID — 7 KEY INFLUENCES
// Book-based knowledge ONLY
// ═══════════════════════════════════════════════════════════════

import { Sun, Moon, Star, Clock, Sparkles, Droplets, Wind } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

export default function CurrentInfluencesGrid({ data, isMalayalam }) {
  if (!data) return null;

  const influences = [
    {
      icon: Clock,
      label: isMalayalam ? "ദിവസം" : "Day",
      value: data.dayKey,
      subvalue: data.date.toLocaleDateString(),
      color: "#F5D060",
      source: "p.49-50"
    },
    {
      icon: Sun,
      label: isMalayalam ? "ദിവസ നാഥൻ" : "Day Ruler",
      value: data.dayRuler?.planet_tr || "Unknown",
      subvalue: data.dayRuler?.day_name_en,
      color: "#F5D060",
      source: "p.49-50"
    },
    {
      icon: Star,
      label: isMalayalam ? "ഗ്രഹം" : "Planet",
      value: data.currentPlanetaryHour?.planet || "Unknown",
      subvalue: isMalayalam ? "നിലവിലെ മണിക്കൂർ" : "Current Hour",
      color: "#60a5fa",
      source: "p.51-52"
    },
    {
      icon: Moon,
      label: isMalayalam ? "ചന്ദ്ര മൻസിൽ" : "Lunar Mansion",
      value: `${data.currentMansion?.name || 'Unknown'}`,
      subvalue: `#${data.currentMansion?.no || ''}`,
      color: "#a855f7",
      source: "p.64-74"
    },
    {
      icon: Sparkles,
      label: isMalayalam ? "രാശി" : "Zodiac",
      value: data.zodiacSign,
      subvalue: isMalayalam ? "നിലവിലെ സ്ഥാനം" : "Current Position",
      color: "#c084fc",
      source: "p.64-74"
    },
    {
      icon: data.element?.name === "Water" ? Droplets : data.element?.name === "Air" ? Wind : Sparkles,
      label: isMalayalam ? "മൂലകം" : "Element",
      value: data.element?.name || "Unknown",
      subvalue: data.element?.name_ml || "",
      color: "#4ade80",
      source: "p.76-80"
    },
    {
      icon: Clock,
      label: isMalayalam ? "സമയം" : "Time",
      value: data.isDaytime ? "Daytime" : "Nighttime",
      subvalue: `${data.currentHour}:00`,
      color: "#fbbf24",
      source: "p.54"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {influences.map((item, idx) => (
        <InfluenceCard key={idx} {...item} />
      ))}
    </div>
  );
}

function InfluenceCard({ icon: Icon, label, value, subvalue, color, source }) {
  return (
    <div className="p-3 rounded-lg border backdrop-blur-sm" style={{ 
      background: "rgba(0,0,0,0.30)", 
      border: `1px solid ${color}40`,
      minHeight: "120px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
          <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: `${color}99` }}>
            {label}
          </span>
        </div>
        <p className="font-inter text-sm font-bold leading-tight mb-1" style={{ color: `${color}cc` }}>
          {value}
        </p>
        {subvalue && (
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            {subvalue}
          </p>
        )}
      </div>
      <p className="font-inter text-[7px] mt-2" style={{ color: "rgba(255,255,255,0.30)" }}>
        Havâss'ın Derinlikleri {source}
      </p>
    </div>
  );
}
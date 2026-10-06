// ═══════════════════════════════════════════════════════════════
// CURRENT INFLUENCES GRID — 7 KEY INFLUENCES
// Book-based knowledge ONLY
// Turkish → Malayalam Translation Layer: Applied
// ═══════════════════════════════════════════════════════════════

import { Sun, Moon, Star, Sparkles, Clock, Book } from "lucide-react";
import { translateTurkishToMalayalam } from "@/lib/astroClockTurkishToMalayalam.js";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
};

export default function CurrentInfluencesGrid({ todayData, isMalayalam }) {
  if (!todayData) return null;

  const unknown = isMalayalam ? "അജ്ഞാതം" : "Unknown";

  const influences = [
    {
      icon: Star,
      label: isMalayalam ? "ഗ്രഹം" : "Planet",
      value: translateTurkishToMalayalam(todayData.currentPlanetaryHour?.planet || unknown),
      color: "#60a5fa",
      source: "p.51-52"
    },
    {
      icon: Moon,
      label: isMalayalam ? "മൻസിൽ" : "Mansion",
      value: `${translateTurkishToMalayalam(todayData.currentMansion?.name || unknown)}`,
      subValue: todayData.currentMansion?.no ? `#${todayData.currentMansion.no}` : '',
      color: "#a855f7",
      source: "p.64-74"
    },
    {
      icon: Sparkles,
      label: isMalayalam ? "രാശി" : "Zodiac",
      value: translateTurkishToMalayalam(todayData.zodiacSign || unknown),
      color: "#c084fc",
      source: "p.64-74"
    },
    {
      icon: Sparkles,
      label: isMalayalam ? "മൂലകം" : "Element",
      value: todayData.element?.name_ml || todayData.element?.name || unknown,
      color: "#4ade80",
      source: "p.76-80"
    },
    {
      icon: Clock,
      label: isMalayalam ? "ദിനം" : "Period",
      value: todayData.isDaytime !== undefined
        ? (todayData.isDaytime ? (isMalayalam ? "പകൽ" : "Day") : (isMalayalam ? "രാത്രി" : "Night"))
        : unknown,
      subValue: todayData.currentHour !== undefined ? (isMalayalam ? `മണിക്കൂർ ${todayData.currentHour}` : `Hour ${todayData.currentHour}`) : '',
      color: "#fbbf24",
      source: "p.54"
    },
    {
      icon: Sun,
      label: isMalayalam ? "ദിവസ നാഥൻ" : "Day Ruler",
      value: translateTurkishToMalayalam(todayData.dayRuler?.planet_tr || unknown),
      color: "#fcd34d",
      source: "p.49-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {influences.map((item, idx) => (
        <InfluenceCard key={idx} {...item} />
      ))}
    </div>
  );
}

function InfluenceCard({ icon: Icon, label, value, subValue, color, source }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.30)", border: `1px solid ${color}40` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: `${color}99` }}>{label}</span>
      </div>
      <p className="font-inter text-sm font-bold truncate" style={{ color: `${color}cc` }}>{value}</p>
      {subValue && <p className="font-inter text-[10px]" style={{ color: `${color}80` }}>{subValue}</p>}
      <p className="font-inter text-[7px] mt-1" style={{ color: "rgba(255,255,255,0.30)" }}>
        Havâss'ın Derinlikleri {source}
      </p>
    </div>
  );
}
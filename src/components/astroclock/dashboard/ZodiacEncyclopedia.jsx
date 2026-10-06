// ═══════════════════════════════════════════════════════════════
// SECTION: ZODIAC ENCYCLOPEDIA — 12 SIGNS WITH FULL MANUSCRIPT DATA
// Combines Havâss data + GIH per-sign properties + GIH relationships
// Every stored manuscript field visible in expandable detail cards
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useAstroData } from "./useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import ZodiacDetailCard from "./ZodiacDetailCard";
import SourceBookPanel from "./SourceBookPanel";

const SIGN_ORDER = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
const ELEMENT_FILTERS = ["all", "Fire", "Earth", "Air", "Water"];

export default function ZodiacEncyclopedia() {
  const d = useAstroData();
  const { txt } = useAstroClockLanguage();
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");

  const zodiacSigns = d.zodiacSigns || {};
  const currentSign = d.moonPosition?.zodiacSign?.name_en?.toLowerCase();

  const filtered = SIGN_ORDER.filter(key => {
    if (filter === "all") return true;
    return zodiacSigns[key]?.element === filter;
  });

  const elementLabel = (value) => {
    if (value === "all") return txt("എല്ലാ 12 രാശികളും", "All 12");
    if (value === "Fire") return txt("അഗ്നി", "Fire");
    if (value === "Earth") return txt("ഭൂമി", "Earth");
    if (value === "Air") return txt("വായു", "Air");
    if (value === "Water") return txt("ജലം", "Water");
    return value;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {ELEMENT_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="font-inter text-[10px] px-2 py-1 rounded-lg transition-opacity hover:opacity-80"
            style={{
              background: filter === f ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${filter === f ? "rgba(212,175,55,0.40)" : "rgba(255,255,255,0.08)"}`,
              color: filter === f ? "#F5D060" : "rgba(255,255,255,0.50)",
            }}>{elementLabel(f)}</button>
        ))}
      </div>
      <div className="space-y-1.5 max-h-[600px] overflow-y-auto scrollbar-none">
        {filtered.map(key => (
          <ZodiacDetailCard
            key={key}
            signKey={key}
            zodiacData={zodiacSigns[key]}
            isCurrent={key === currentSign}
            isExpanded={expanded === key}
            onToggle={() => setExpanded(expanded === key ? null : key)}
          />
        ))}
      </div>

      {/* ── HIDDEN: Source Book zodiac poetry — pending Arabic verification ── */}
      {false && <SourceBookPanel topicId="zodiacQualitiesPoem" />}
    </div>
  );
}

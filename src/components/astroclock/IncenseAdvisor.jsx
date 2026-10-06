// ═══════════════════════════════════════════════════════════════
// INCENSE ADVISOR — Buhuru System
// From Havâss'ın Derinlikleri (Pages 20-21)
// Planet & zodiac incense recommendations with spiritual guidance
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Info } from "lucide-react";
import { PLANET_INCENSES, ZODIAC_INCENSES, getIncenseForPlanet, getIncenseForZodiac } from "@/lib/astroClockIncenseData.js";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)"
};

export default function IncenseAdvisor() {
  const { isMalayalam } = useAstroClockLanguage();
  const [activeTab, setActiveTab] = useState("planets");

  const planetArray = Object.entries(PLANET_INCENSES).map(([key, val]) => ({ key, ...val }));
  const zodiacArray = Object.entries(ZODIAC_INCENSES).map(([key, val]) => ({ key, ...val }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Flame className="w-6 h-6" style={{ color: G.text }} />
        <div>
          <h2 className="font-inter text-lg font-bold uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "സുഗന്ധം ഉപദേശം" : "Incense Advisor"}
          </h2>
          <p className="font-inter text-[9px]" style={{ color: G.dim }}>
            {isMalayalam ? "ബുഹുരു (സുഗന്ധ) വിവിധ ഉപയോഗങ്ങൾ" : "Buhuru (Incense) Recommendations"}
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab("planets")}
          className="px-4 py-2 rounded-lg border font-inter text-sm font-bold uppercase tracking-wider transition-all"
          style={{
            background: activeTab === "planets" ? G.bgHi : "transparent",
            borderColor: activeTab === "planets" ? G.border : "rgba(255,255,255,0.08)",
            color: activeTab === "planets" ? G.text : "rgba(255,255,255,0.60)"
          }}
        >
          {isMalayalam ? "ഗ്രഹ" : "Planets"}
        </button>
        <button
          onClick={() => setActiveTab("zodiac")}
          className="px-4 py-2 rounded-lg border font-inter text-sm font-bold uppercase tracking-wider transition-all"
          style={{
            background: activeTab === "zodiac" ? G.bgHi : "transparent",
            borderColor: activeTab === "zodiac" ? G.border : "rgba(255,255,255,0.08)",
            color: activeTab === "zodiac" ? G.text : "rgba(255,255,255,0.60)"
          }}
        >
          {isMalayalam ? "ബുർച്ചുകൾ" : "Zodiacs"}
        </button>
      </div>

      {/* Planet Incenses */}
      {activeTab === "planets" && (
        <div className="space-y-3">
          {(planetArray || []).map((planet) => (
            <motion.div
              key={planet.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl border"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: G.faint
              }}
            >
              {/* Planet Name & Symbol - Arabic Display */}
              <div className="text-center mb-4 pb-3 border-b" style={{ borderColor: G.faint }}>
                <p className="font-amiri text-5xl font-bold leading-relaxed mb-2" style={{ color: G.text, textShadow: "0 0 25px rgba(212,175,55,0.25)" }}>
                  {planet.name_ar}
                </p>
                <div className="h-px w-20 mx-auto mb-3" style={{ background: `linear-gradient(90deg, transparent, ${G.border}, transparent)` }} />
                <p className="font-inter text-lg font-bold text-white/95">
                  {planet[isMalayalam ? "name_ml" : "name_en"]}
                </p>
              </div>

              {/* Incense Name - Arabic Display */}
              <div className="text-center mb-4 p-4 rounded-lg bg-black/30 border" style={{ borderColor: G.faint }}>
                <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
                  {isMalayalam ? "സുഗന്ധം (Buhur)" : "Incense (Buhur)"}
                </p>
                <p className="font-amiri text-4xl md:text-5xl font-bold leading-relaxed mb-2" style={{ color: G.text, textShadow: "0 0 20px rgba(212,175,55,0.2)" }}>
                  {planet.incense_ar}
                </p>
                <p className="font-inter text-base font-semibold text-white/90">
                  {planet[isMalayalam ? "incense_ml" : "incense_en"]}
                </p>
              </div>

              {/* Uses */}
              <div className="mb-3">
                <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
                  {isMalayalam ? "ഉപയോഗങ്ങൾ" : "Uses"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(planet[isMalayalam ? "uses_ml" : "uses_en"] || []).map((use, idx) => (
                    <span key={idx} className="px-2 py-1 rounded text-[10px]" style={{ background: G.bg, color: G.text }}>
                      {use}
                    </span>
                  ))}
                </div>
              </div>

              {/* Spiritual Benefits */}
              <div className="p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
                <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                  {isMalayalam ? "ആത്മിക ഗുണങ്ങൾ" : "Spiritual Benefits"}
                </p>
                <p className="font-inter text-xs text-white/80">
                  {planet[isMalayalam ? "spiritual_benefits_ml" : "spiritual_benefits_en"]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Zodiac Incenses */}
      {activeTab === "zodiac" && (
        <div className="space-y-3">
          {(zodiacArray || []).map((zodiac) => (
            <motion.div
              key={zodiac.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl border"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: G.faint
              }}
            >
              {/* Zodiac Name - Arabic Display */}
              <div className="text-center mb-4 pb-3 border-b" style={{ borderColor: G.faint }}>
                <p className="font-inter text-lg font-bold text-white/95 mb-1">
                  {zodiac[isMalayalam ? "name_ml" : "name_en"]}
                </p>
                <p className="font-inter text-xs text-white/60">
                  ({zodiac.name_tr})
                </p>
              </div>

              {/* Incense - Arabic Display */}
              <div className="text-center mb-4 p-4 rounded-lg bg-black/30 border" style={{ borderColor: G.faint }}>
                <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
                  {isMalayalam ? "സുഗന്ധം (Buhur)" : "Incense (Buhur)"}
                </p>
                <p className="font-amiri text-4xl md:text-5xl font-bold leading-relaxed mb-2" style={{ color: G.text, textShadow: "0 0 20px rgba(212,175,55,0.2)" }}>
                  {zodiac.incense_ar}
                </p>
                <p className="font-inter text-base font-semibold text-white/90">
                  {zodiac[isMalayalam ? "incense_ml" : "incense_en"]}
                </p>
              </div>

              {/* Preparation */}
              <div className="mb-3 p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
                <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                  {isMalayalam ? "സമ്പ്രകരണം" : "Preparation"}
                </p>
                <p className="font-inter text-xs text-white/80">
                  {zodiac[isMalayalam ? "preparation_ml" : "preparation_en"]}
                </p>
              </div>

              {/* Benefits */}
              <div>
                <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
                  {isMalayalam ? "ഗുണങ്ങൾ" : "Benefits"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(zodiac[isMalayalam ? "benefits_ml" : "benefits_en"] || []).map((benefit, idx) => (
                    <span key={idx} className="px-2 py-1 rounded text-[10px]" style={{ background: G.bg, color: G.text }}>
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-5 p-4 rounded-xl" style={{ background: "rgba(212,175,55,0.04)", border: `1px solid ${G.faint}` }}>
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5" style={{ color: G.dim }} />
          <div>
            <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "ബുഹുരു കയറ്റാനുള്ള വിധി" : "How to Burn Incense"}
            </p>
            <ul className="font-inter text-xs text-white/70 space-y-1">
              <li>• {isMalayalam ? "കരിയോ പ്രത്യേക പേരിയോ വിരിച്ച് കത്തിക്കുക" : "Burn on charcoal or in a censer"}</li>
              <li>• {isMalayalam ? "ഉദ്ദേശ്യ മനസ്സിൽ വെച്ച് കത്തിക്കുക" : "State your intention while burning"}</li>
              <li>• {isMalayalam ? "സുഗന്ധം സ്വാഭാവികമായി അപ്പോ വരെ കത്തിച്ചിരിക്കുക" : "Let burn until scent dissipates naturally"}</li>
              <li>• {isMalayalam ? "നല്ല വായകൾ ഉണ്ടായിരിക്കുക" : "Ensure proper ventilation"}</li>
            </ul>
            <p className="font-inter text-[10px] text-white/40 mt-3">
              {isMalayalam ? "സ്രോതസ്സ്:" : "Source:"} Havâss'ın Derinlikleri, Pages 20-21
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
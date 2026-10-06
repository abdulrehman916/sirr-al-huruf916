// ═══════════════════════════════════════════════════════════════
// LIVE MOON STATUS — SECTION 4
// Current lunar mansion from ingested PDF knowledge
// Astro Clock module only — completely isolated
// NO APPROXIMATIONS — Reference data only
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Star, Info, BookOpen, AlertCircle } from "lucide-react";
import { AY_MANAZILLERI } from "@/lib/astroClockData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)"
};

export default function LiveMoonStatus() {
  const { isMalayalam } = useAstroClockLanguage();
  
  // Display all 28 mansions as reference (no real-time calculation)
  const mansions = AY_MANAZILLERI || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Moon className="w-6 h-6" style={{ color: G.text }} />
        <div>
          <h2 className="font-inter text-lg font-bold uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "28 ചാന്ദ്ര നക്ഷത്രങ്ങൾ" : "The 28 Lunar Mansions"}
          </h2>
          <p className="font-inter text-[9px]" style={{ color: G.dim }}>
            {isMalayalam ? "അൽ-മനാസിൽ അൽ-ഖമർ — ഗ്രന്ഥ ഡാറ്റ" : "Al-Manāzil al-Qamar — Reference Data"}
          </p>
        </div>
      </div>

      {/* Notice: No Real-Time Calculation */}
      <div className="mb-5 p-4 rounded-xl border" style={{ background: "rgba(255,193,7,0.05)", borderColor: "rgba(255,193,7,0.30)" }}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: "#ffc107" }} />
          <div>
            <p className="font-inter text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#ffc107" }}>
              {isMalayalam ? "ശ്രദ്ധിക്കുക" : "Important Notice"}
            </p>
            <p className="font-inter text-xs text-white/70 leading-relaxed">
              {isMalayalam 
                ? "കൃത്യമായ ചന്ദ്ര നിലപാട് കണക്കാക്കാൻ എഫെമറിസ് ഡാറ്റ ആവശ്യമാണ്. ഇവിടെ കാണിക്കുന്നത് ഗ്രന്ഥങ്ങളിൽ നിന്നുള്ള റഫറൻസ് ഡാറ്റ മാത്രമാണ്."
                : "Accurate moon position requires ephemeris data. This displays reference data from ingested manuscripts only."}
            </p>
          </div>
        </div>
      </div>

      {/* All 28 Mansions Reference Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: G.faint }}>
              <th className="text-left py-2 px-3 font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                #
              </th>
              <th className="text-left py-2 px-3 font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                {isMalayalam ? "നക്ഷത്രം" : "Mansion"}
              </th>
              <th className="text-left py-2 px-3 font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                {isMalayalam ? "അക്ഷരം" : "Letter"}
              </th>
              <th className="text-left py-2 px-3 font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                {isMalayalam ? "രാശി" : "Zodiac"}
              </th>
              <th className="text-left py-2 px-3 font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                {isMalayalam ? "സ്വഭാവം" : "Nature"}
              </th>
            </tr>
          </thead>
          <tbody>
            {(mansions || []).map((mansion) => (
              <tr key={mansion.no} className="border-b" style={{ borderColor: G.faint }}>
                <td className="py-3 px-3">
                  <span className="font-inter text-sm font-bold text-white">#{mansion.no}</span>
                </td>
                <td className="py-3 px-3">
                  <div>
                    <p className="font-amiri text-3xl font-bold mb-1" style={{ color: G.text }} dir="rtl">{mansion.name_arabic || mansion.name}</p>
                    <p className="font-inter text-xs text-white/60">#{mansion.no} • {mansion.harf}</p>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <p className="font-amiri text-2xl font-bold" style={{ color: G.text }} dir="rtl">{mansion.harf_arabic}</p>
                </td>
                <td className="py-3 px-3">
                  <p className="font-inter text-xs text-white/80">{mansion.zodiac_sign}</p>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    mansion.genel_hukum.includes('Saad') ? 'text-green-400' : 
                    mansion.genel_hukum.includes('Nahs') ? 'text-red-400' : 'text-yellow-400'
                  }`} style={{ background: "rgba(255,255,255,0.05)" }}>
                    {mansion.genel_hukum}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Source */}
      <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-3 h-3" style={{ color: G.dim }} />
          <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
            {isMalayalam ? "ഗ്രന്ഥം" : "Source"}
          </p>
        </div>
        <p className="font-inter text-xs text-white/60">
          Havâss'ın Derinlikleri — Pages 64-74
        </p>
      </div>
    </motion.div>
  );
}
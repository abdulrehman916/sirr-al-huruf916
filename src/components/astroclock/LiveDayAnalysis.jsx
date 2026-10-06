// ═══════════════════════════════════════════════════════════════
// LIVE DAY ANALYSIS — SECTION 1
// Real-time analysis of the current day's astrological profile
// Astro Clock module only — completely isolated
// Arabic Terminology Preservation Rule: Implemented
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sun } from 'lucide-react';
import { DAY_INFO, PLANET_INFO } from '@/lib/astroClockLiveEngine.js';
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  success: "rgba(34,197,94,0.60)",
  danger: "rgba(239,68,68,0.60)"
};

export default function LiveDayAnalysis() {
  const { isMalayalam } = useAstroClockLanguage();
  const [today, setToday] = useState(null);
  const [dayInfo, setDayInfo] = useState(null);
  const [planetInfo, setPlanetInfo] = useState(null);

  useEffect(() => {
    const date = new Date();
    const dayIndex = date.getDay();
    const info = DAY_INFO[dayIndex];
    setToday(info);
    setDayInfo(info);
    setPlanetInfo(PLANET_INFO[info.ruler]);
  }, []);

  if (!today || !dayInfo || !planetInfo) {
    return null; // or a loading skeleton
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, rgba(20,8,44,0.98) 0%, rgba(12,4,28,0.99) 100%)", borderColor: G.border }}
    >
      <div className="flex items-center gap-3 mb-5">
        <Calendar className="w-6 h-6" style={{ color: G.text }} />
        <div>
            <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
                {isMalayalam ? "ഇന്നത്തെ ദിവസ വിശകലനം" : "Live Day Analysis"}
            </h2>
            <p className="font-malayalam-sm" style={{ color: G.dim }}>
                {isMalayalam ? "ഇന്നത്തെ ഗ്രഹ സ്വാധീനങ്ങൾ" : "Planetary influences for today"}
            </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Left Panel: Day & Ruler */}
        <div className="space-y-4">
            <div className="p-5 rounded-lg" style={{background: G.bg}}>
                <p className="font-malayalam-sm uppercase tracking-widest mb-2" style={{ color: G.dim }}>{isMalayalam ? "ദിവസം" : "Day"}</p>
                <p className="font-malayalam-lg text-white">{isMalayalam ? dayInfo.name_ml : dayInfo.name_en}</p>
            </div>
             <div className="p-6 rounded-lg" style={{background: "rgba(0,0,0,0.3)", border: `1px solid ${G.faint}`}}>
                <p className="font-malayalam-sm uppercase tracking-widest mb-3" style={{ color: G.dim }}>{isMalayalam ? "ഭരണാധികാരി" : "Ruler"}</p>
                  <p className="font-amiri text-5xl md:text-6xl font-bold text-center leading-relaxed" style={{ color: G.text, textShadow: "0 0 30px rgba(212,175,55,0.3)" }}>{planetInfo.name_ar}</p>
                  <div className="h-px w-16 mx-auto my-3" style={{ background: `linear-gradient(90deg, transparent, ${G.border}, transparent)` }} />
                <p className="font-malayalam-md text-white/95 text-center">
                    {isMalayalam ? planetInfo.name_ml_equivalent : planetInfo.name_en}
                </p>
             </div>
        </div>

        {/* Right Panel: Benefits & Warnings */}
        <div className="space-y-4">
            <div className="p-5 rounded-lg" style={{background: 'rgba(34,197,94,0.05)', border: `1px solid ${G.success}`}}>
                <p className="font-malayalam-md font-bold uppercase tracking-widest" style={{ color: G.success }}>{isMalayalam ? "ഗുണങ്ങൾ" : "Benefits"}</p>
                <ul className="mt-3 space-y-2">
                    {(isMalayalam ? dayInfo.benefits_ml : dayInfo.benefits_en).map((item, i) => (
                        <li key={i} className="font-malayalam-sm text-white/80 flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: G.success }} />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
            {dayInfo.warnings_ml.length > 0 &&
                <div className="p-5 rounded-lg" style={{background: 'rgba(239,68,68,0.05)', border: `1px solid ${G.danger}`}}>
                    <p className="font-malayalam-md font-bold uppercase tracking-widest" style={{ color: G.danger }}>{isMalayalam ? "മുന്നറിയിപ്പുകൾ" : "Warnings"}</p>
                    <ul className="mt-3 space-y-2">
                        {(isMalayalam ? dayInfo.warnings_ml : dayInfo.warnings_en).map((item, i) => (
                            <li key={i} className="font-malayalam-sm text-white/80 flex items-start gap-2">
                                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: G.danger }} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            }
        </div>
      </div>
    </motion.div>
  );
}
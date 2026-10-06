// ═══════════════════════════════════════════════════════════════
// PLANET KNOWLEDGE PANELS — SECTION 6
// 7 Classical planets with properties, relationships, and actions
// Astro Clock module only — completely isolated
// Arabic Terminology Preservation Rule: Implemented
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, ChevronDown, BookOpen } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { PLANET_INFO, WEEKDAY_ANALYSIS } from "@/lib/astroClockLiveEngine.js";
import { base44 } from "@/api/base44Client";
import ManuscriptKnowledgeExplorer from "./ManuscriptKnowledgeExplorer";
import ManuscriptCorrespondences from "./ManuscriptCorrespondences";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  success: "rgba(34,197,94,0.60)",
  danger: "rgba(239,68,68,0.60)"
};

export default function PlanetKnowledgePanels() {
  const { isMalayalam } = useAstroClockLanguage();
  const planets = Object.values(PLANET_INFO);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [planetRecords, setPlanetRecords] = useState({});

  // Empty dep array — planets is stable (derived from a constant), run once only
  useEffect(() => {
    const planetList = Object.values(PLANET_INFO);
    planetList.forEach(async (planet) => {
      try {
        const result = await base44.functions.invoke('queryManuscriptLibrary', {
          entity_type: 'PLANET',
          entity_value: planet.name_ar
        });
        setPlanetRecords(prev => ({
          ...prev,
          [planet.name_en]: result.data?.rules || []
        }));
      } catch (err) {
        console.error("Failed to load manuscripts for planet", planet.name_en, err);
      }
    });
  }, []);

  function openExplorer(planet) {
    setSelectedEntity({
      entityType: 'PLANET',
      entityData: planet.name_ar,
      displayName: planet.name_en
    });
    setExplorerOpen(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(18,8,44,0.98) 0%, rgba(10,4,28,0.99) 100%)",
        borderColor: G.border,
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <Sun className="w-6 h-6" style={{ color: G.text }} />
        <div>
          <h2 className="font-inter text-lg font-bold uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "7 ഗ്രഹങ്ങൾ" : "The 7 Planets"}
          </h2>
          <p className="font-inter text-[9px]" style={{ color: G.dim }}>
            {isMalayalam ? "സ്വഭാവങ്ങളും പ്രവർത്തനങ്ങളും" : "Properties and Actions"}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(planets || []).map((planet) => (
          <PlanetCard 
            key={planet.name_en} 
            planet={planet} 
            isMalayalam={isMalayalam}
            openExplorer={openExplorer}
            planetRecords={planetRecords}
          />
        ))}
      </div>

      {/* Manuscript Knowledge Explorer Modal */}
      <AnimatePresence>
        {explorerOpen && selectedEntity && (
          <ManuscriptKnowledgeExplorer
            entityType={selectedEntity.entityType}
            entityData={selectedEntity.entityData}
            onClose={() => { setExplorerOpen(false); setSelectedEntity(null); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PlanetCard({ planet, isMalayalam, openExplorer, planetRecords }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border" style={{ background: G.bg, borderColor: G.faint }}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 p-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl flex-shrink-0">{planet.symbol}</span>
            <div className="flex-1">
              <p className="font-amiri text-5xl md:text-6xl font-bold leading-relaxed" style={{ color: G.text, textShadow: "0 0 25px rgba(212,175,55,0.25)" }} dir="rtl">
                {planet.name_ar}
              </p>
              <p className="font-malayalam-md font-bold text-white/90 mt-1">
                {isMalayalam ? planet.name_ml_equivalent : planet.name_en}
              </p>
            </div>
          </div>
          <ChevronDown
            className="w-5 h-5 transition-transform duration-300"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", color: G.dim }}
          />
        </button>
        <button
          onClick={() => openExplorer(planet)}
          className="p-3 m-2 rounded-lg hover:bg-white/10 transition-colors"
          title={isMalayalam ? "ഹസ്തലിഖിതങ്ങൾ കാണുക" : "View Manuscripts"}
        >
          <BookOpen className="w-5 h-5" style={{ color: G.text }} />
        </button>
      </div>

      {isOpen && (
        <div className="p-5 border-t space-y-4" style={{ borderColor: G.faint }}>
          <div className="p-4 rounded-lg bg-black/30">
            <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "സ്വഭാവം" : "Nature"}
            </p>
            <p className="font-inter text-base text-white/90 leading-relaxed">
              {isMalayalam ? planet.nature_ml : planet.nature_en}
            </p>
          </div>
          
          <div className="p-4 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: `1px solid ${G.success}` }}>
              <p className="font-inter text-[9px] uppercase tracking-widest mb-2 font-bold" style={{ color: G.success }}>
                  {isMalayalam ? "നല്ല പ്രവർത്തനങ്ങൾ" : "Good Actions"}
              </p>
              <div className="flex flex-wrap gap-2">
                  {(Array.isArray(isMalayalam ? planet.goodActions_ml : planet.goodActions_en) ? (isMalayalam ? planet.goodActions_ml : planet.goodActions_en) : []).map((action, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: "rgba(34,197,94,0.15)", color: "#86efac" }}>
                      {action}
                    </span>
                  ))}
              </div>
          </div>

          <div className="p-4 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: `1px solid ${G.danger}` }}>
              <p className="font-inter text-[9px] uppercase tracking-widest mb-2 font-bold" style={{ color: G.danger }}>
                  {isMalayalam ? "ചീത്ത പ്രവർത്തനങ്ങൾ" : "Bad Actions"}
              </p>
              <div className="flex flex-wrap gap-2">
                  {(Array.isArray(isMalayalam ? planet.badActions_ml : planet.badActions_en) ? (isMalayalam ? planet.badActions_ml : planet.badActions_en) : []).map((action, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5" }}>
                      {action}
                    </span>
                  ))}
              </div>
          </div>

          <div className="p-4 rounded-lg bg-black/30 border" style={{ borderColor: G.faint }}>
            <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
                {isMalayalam ? "ആത്മിക പ്രവർത്തനങ്ങൾ" : "Spiritual Operations"}
            </p>
            <div className="space-y-2">
                {(isMalayalam ? (planet.spiritualOperations_ml || []) : (planet.spiritualOperations_en || [])).map((op, idx) => (
                  <p key={idx} className="font-inter text-sm text-white/85 leading-relaxed">
                    <span className="text-gold mr-2">✦</span>{op}
                  </p>
                ))}
            </div>
          </div>

          {/* Manuscript Correspondences from Database */}
          {planetRecords[planet.name_en] && planetRecords[planet.name_en].length > 0 && (
            <ManuscriptCorrespondences records={planetRecords[planet.name_en]} isMalayalam={isMalayalam} />
          )}

        </div>
      )}
    </div>
  );
}
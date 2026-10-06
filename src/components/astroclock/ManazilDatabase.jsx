// ═══════════════════════════════════════════════════════════════
// MANAZIL DATABASE — SECTION 5
// 28 Lunar Mansions with properties, from Havâss'ın Derinlikleri
// Astro Clock module only — completely isolated
// Arabic Terminology Preservation Rule: Implemented
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, ChevronDown, BookOpen } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { LUNAR_MANSION_DATA } from "@/lib/astroClockLunarMansionML.js";
import { base44 } from "@/api/base44Client";
import ManuscriptKnowledgeExplorer from "./ManuscriptKnowledgeExplorer";
import ManuscriptCorrespondences from "./ManuscriptCorrespondences";
import { LunarMansionDisplay, ArabicLetterDisplay, PlanetDisplay, ZodiacSignDisplay, ElementDisplay, SaadNahsDisplay } from "./ArabicLetterDisplay";
import { useManuscriptExplorer } from "./useManuscriptExplorer";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  saad: "rgba(34,197,94,0.70)",
  nahs: "rgba(239,68,68,0.70)",
  mixed: "rgba(255,193,7,0.70)"
};



export default function ManazilDatabase() {
  const { isMalayalam } = useAstroClockLanguage();
  const [expandedManzil, setExpandedManzil] = useState(null);
  const [manzilRecords, setManzilRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const { explorerOpen, selectedEntity, openExplorer, closeExplorer } = useManuscriptExplorer();

  const getClassificationColor = (nature) => {
    if (nature === "Saad") return G.saad;
    if (nature === "Nahs") return G.nahs;
    return G.mixed;
  };

  // Load manuscript records for each mansion
  useEffect(() => {
    const loadManzilRecords = async () => {
      setLoading(true);
      const records = {};
      for (const manzil of (LUNAR_MANSION_DATA || [])) {
        try {
          const result = await base44.functions.invoke('queryManuscriptLibrary', {
            entity_type: 'LUNAR_MANSION',
            entity_value: manzil.name_arabic
          });
          records[manzil.number] = result.data?.rules || [];
        } catch (err) {
          console.error("Failed to load manuscripts for manzil", manzil.number, err);
          records[manzil.number] = [];
        }
      }
      setManzilRecords(records);
      setLoading(false);
    };
    loadManzilRecords();
  }, []);



  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 relative"
      style={{ background: "linear-gradient(145deg, rgba(10,20,50,0.98) 0%, rgba(5,10,30,0.99) 100%)", borderColor: G.border }}
    >
        <div className="flex items-center gap-3 mb-5">
            <Moon className="w-6 h-6" style={{ color: G.text }} />
            <div>
                <h2 className="font-inter text-lg font-bold uppercase tracking-widest" style={{ color: G.text }}>
                    {isMalayalam ? "28 ചാന്ദ്ര നക്ഷത്രങ്ങൾ" : "The 28 Lunar Mansions"}
                </h2>
                <p className="font-inter text-[9px]" style={{ color: G.dim }}>
                    {isMalayalam ? "അൽ-മനാസിൽ അൽ-ഖമർ" : "Al-Manāzil al-Qamar"}
                </p>
            </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-t-gold border-r-transparent border-b-gold border-l-transparent rounded-full animate-spin mx-auto" />
            <p className="font-inter text-xs mt-4" style={{ color: G.dim }}>
              {isMalayalam ? "ലോഡിംഗ്..." : "Loading manuscripts..."}
            </p>
          </div>
        ) : (
        <div className="space-y-2">
            {(LUNAR_MANSION_DATA || []).map((manzil) => (
                <div key={manzil.number} className="rounded-lg border" style={{borderColor: G.faint, background: G.bg}}>
                    <button 
                        onClick={() => setExpandedManzil(expandedManzil === manzil.number ? null : manzil.number)}
                        className="w-full p-4 flex items-center justify-between text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                                <span className="font-inter font-bold text-xs text-white/60 px-2 py-1 rounded" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
                                  {manzil.number}
                                </span>
                                <div style={{width: '3px', height: '24px', borderRadius: '2px', marginTop: '4px', background: getClassificationColor(manzil.nature)}}></div>
                            </div>
                            <div className="flex flex-col items-start">
                                <p className="font-amiri font-bold text-5xl md:text-6xl leading-relaxed" style={{color: G.text, textShadow: "0 0 30px rgba(212,175,55,0.3)"}} dir="rtl">{manzil.name_arabic}</p>
                                {manzil.letter_arabic && (
                                    <p className="font-amiri text-lg text-white/60 mt-1" dir="rtl">
                                      ({manzil.letter_arabic})
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); openExplorer('LUNAR_MANSION', manzil.name_arabic, manzil.name_ml); }}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title={isMalayalam ? "ഹസ്തലിഖിതങ്ങൾ കാണുക" : "View Manuscripts"}
                            >
                                <BookOpen className="w-5 h-5" style={{ color: G.text }} />
                            </button>
                            <ChevronDown 
                                className="w-6 h-6 text-gold transition-transform"
                                style={{transform: expandedManzil === manzil.number ? 'rotate(180deg)' : 'rotate(0deg)'}}
                            />
                        </div>
                    </button>

                    <AnimatePresence>
                    {expandedManzil === manzil.number && (
                        <motion.div
                            initial={{height: 0, opacity: 0}}
                            animate={{height: 'auto', opacity: 1}}
                            exit={{height: 0, opacity: 0}}
                            className="overflow-hidden"
                        >
                            <div className="p-4 border-t space-y-4" style={{borderColor: G.faint}}>
                                {/* Nature Badge */}
                                <div className="flex items-center gap-2">
                                    <div style={{width: '4px', height: '16px', borderRadius: '2px', background: getClassificationColor(manzil.nature)}}></div>
                                    <p className="font-inter text-xs font-bold uppercase tracking-wider" style={{color: getClassificationColor(manzil.nature)}}>
                                        {isMalayalam ? manzil.nature_ml : manzil.nature}
                                    </p>
                                </div>

                                {/* Arabic Mansion Name Display */}
                                <div className="p-5 rounded-lg text-center" style={{background: G.bgHi, border: `1px solid ${G.border}`}}>
                                    <p className="font-inter text-[8px] uppercase tracking-widest mb-3" style={{color: G.dim}}>
                                        {isMalayalam ? "ചന്ദ്ര നക്ഷത്രം" : "Lunar Mansion"}
                                    </p>
                                    <p className="font-amiri text-7xl font-bold" style={{color: G.text, textShadow: "0 0 35px rgba(212,175,55,0.35)"}} dir="rtl">{manzil.name_arabic}</p>
                                    {manzil.letter_arabic && (
                                        <div className="mt-3">
                                            <p className="font-inter text-[9px] uppercase tracking-widest" style={{color: G.dim}}>
                                                {isMalayalam ? "അക്ഷരം" : "Letter"}
                                            </p>
                                            <p className="font-amiri text-4xl font-bold mt-1" style={{color: G.text}} dir="rtl">
                                                ({manzil.letter_arabic})
                                            </p>
                                        </div>
                                    )}
                                    {manzil.name_ml && (
                                        <p className="font-malayalam-md text-white/80 mt-4">{manzil.name_ml}</p>
                                    )}
                                </div>

                                {/* Interactive Entity Cards - All Clickable */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Arabic Letter - Clickable */}
                                    <ArabicLetterDisplay
                                        letter={manzil.letter_arabic}
                                        malayalam={manzil.letter_malayalam}
                                        size="md"
                                        onClick={() => openExplorer('ARABIC_LETTER', manzil.letter_arabic, manzil.letter_malayalam)}
                                        showCount
                                        count={0}
                                    />
                                    
                                    {/* Zodiac Sign - Clickable */}
                                    <ZodiacSignDisplay
                                        arabic={manzil.zodiac_sign_arabic}
                                        name={manzil.zodiac_sign}
                                        malayalam={manzil.zodiac_sign_ml}
                                        onClick={() => openExplorer('ZODIAC', manzil.zodiac_sign, manzil.zodiac_sign_ml)}
                                        showCount
                                        count={0}
                                    />
                                </div>

                                {/* Planet & Nature - Clickable */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Planet - Clickable */}
                                    <PlanetDisplay
                                        arabic={manzil.planet_arabic}
                                        name={manzil.planet}
                                        malayalam={manzil.planet_ml}
                                        symbol={manzil.planet_symbol}
                                        onClick={() => openExplorer('PLANET', manzil.planet, manzil.planet_ml)}
                                        showCount
                                        count={0}
                                    />
                                    
                                    {/* Saad/Nahs - Clickable */}
                                    <SaadNahsDisplay
                                        nature={manzil.nature}
                                        onClick={() => openExplorer('SAAD_NAHS', manzil.nature)}
                                        showCount
                                        count={0}
                                    />
                                </div>
                                
                                {/* Operations */}
                                <div className="p-4 rounded-lg" style={{background: "rgba(34,197,94,0.08)", border: `1px solid rgba(34,197,94,0.40)`}}>
                                    <p className="font-inter text-[8px] uppercase tracking-widest mb-3 font-bold" style={{color: "#22c55e"}}>
                                        {isMalayalam ? "ഉചിതമായ പ്രവർത്തനങ്ങൾ" : "Suitable Operations"}
                                    </p>
                                    <div className="space-y-2">
                                        {(isMalayalam ? (manzil.operations_ml || manzil.operations || []) : (manzil.operations || [])).map((op, idx) => (
                                            <p key={idx} className="font-inter text-sm text-white/85 leading-relaxed">
                                                <span className="text-green-400 mr-2">✦</span>{op}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Manuscript Correspondences from Database */}
                                {manzilRecords[manzil.number] && manzilRecords[manzil.number].length > 0 && (
                                    <ManuscriptCorrespondences records={manzilRecords[manzil.number]} isMalayalam={isMalayalam} />
                                )}
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
        )}

        {/* Manuscript Knowledge Explorer Modal */}
        <AnimatePresence>
          {explorerOpen && selectedEntity && (
            <ManuscriptKnowledgeExplorer
              entityType={selectedEntity.entityType}
              entityData={selectedEntity.entityData}
              onClose={closeExplorer}
            />
          )}
        </AnimatePresence>
    </motion.div>
  );
}
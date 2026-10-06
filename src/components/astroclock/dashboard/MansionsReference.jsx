// ═══════════════════════════════════════════════════════════════
// SECTION 6 — 28 LUNAR MANSIONS (Manzil / Nakshatra)
// Complete reference — expandable cards, current mansion highlighted
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useAstroData } from "./useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import ManuscriptSourcePanel from "./ManuscriptSourcePanel";
import { getKashfMansionByNo } from "@/lib/astroClockManuscriptMerger";
import { natureToArabic, natureToML, natureToEN, isNahsNature, zodiacToArabic, zodiacToML, zodiacToEN, extractDegree } from "@/lib/astroClockLabelMap";
import { MANSION_ML_NAMES } from "@/lib/astroClockMansionsML";
import EntityKnowledgePanel from "./EntityKnowledgePanel";
import MagicalPeriodPanel from "./MagicalPeriodPanel";
import AstroClockCategoryVisuals from "@/components/astroclock/AstroClockCategoryVisuals";
import { useIsOwner } from "@/hooks/useIsOwner";
import SourceBookPanel from "./SourceBookPanel";
import { SourceBadge, MANUSCRIPT_SOURCES, ManuscriptTopic, DifferentOpinion, ConflictBadge } from "./manuscriptSource";
import { getMansionConflict } from "@/lib/manuscriptConflictEngine";

export default function MansionsReference() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  const isOwner = useIsOwner();
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all"); // all | current | favorable | unfavorable

  const manazil = d.manazil || [];
  const currentNo = d.currentMansion?.no;

  const filtered = manazil.filter(m => {
    if (filter === "current") return m.no === currentNo;
    if (filter === "favorable") return m.genel_hukum && !isNahsNature(m.genel_hukum);
    if (filter === "unfavorable") return m.genel_hukum && isNahsNature(m.genel_hukum);
    return true;
  });

  return (
    <div className="space-y-3">
      {/* ── Filter Tags ── */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: "all", label: txt("എല്ലാം", "All 28", "Tümü") },
          { key: "current", label: txt("നിലവിലെ", "Current", "Mevcut") },
          { key: "favorable", label: txt("അനുകൂലം", "Favorable", "Elverişli") },
          { key: "unfavorable", label: txt("പ്രതികൂലം", "Unfavorable", "Olumsuz") },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="font-inter text-[10px] px-2 py-1 rounded-lg transition-opacity hover:opacity-80"
            style={{
              background: filter === f.key ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${filter === f.key ? "rgba(212,175,55,0.40)" : "rgba(255,255,255,0.08)"}`,
              color: filter === f.key ? "#F5D060" : "rgba(255,255,255,0.50)",
            }}>{f.label}</button>
        ))}
      </div>

      {/* ── Mansion Cards ── */}
      <div className="space-y-1.5 max-h-[600px] overflow-y-auto scrollbar-none">
        {filtered.map(m => {
          const isCurrent = m.no === currentNo;
          const kashfMansion = getKashfMansionByNo(m.no);
          const mansionConflict = getMansionConflict(m.no);
          const isNahs = isNahsNature(m.genel_hukum);
          const isOpen = expanded === m.no;
          const color = isCurrent ? "#F5D060" : isNahs ? "#F87171" : "#4ADE80";
          const borderColor = isCurrent ? "rgba(212,175,55,0.40)" : isNahs ? "rgba(248,113,113,0.15)" : "rgba(74,222,128,0.12)";
          const zodiacDisplay = language === "ml" ? zodiacToML(m.zodiac_sign) : language === "ar" ? zodiacToArabic(m.zodiac_sign) : zodiacToEN(m.zodiac_sign);
          const natureDisplay = language === "ml" ? natureToML(m.genel_hukum) : language === "ar" ? natureToArabic(m.genel_hukum) : natureToEN(m.genel_hukum);
          const zodiacFontClass = language === "ar" ? "font-amiri" : "font-inter";

          return (
            <div key={m.no} className="rounded-lg overflow-hidden" style={{
              background: isCurrent ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${borderColor}`,
            }}>
              <button onClick={() => setExpanded(isOpen ? null : m.no)}
                className="w-full flex items-center gap-2 p-2.5 text-left">
                <span className="font-inter text-[10px] font-bold tabular-nums w-6 text-center" style={{ color }}>#{m.no}</span>
                <span className={`font-inter text-xs font-bold flex-1 truncate ${language === "ar" ? "font-amiri" : ""}`} style={{ color: "rgba(255,255,255,0.80)", ...(language === "ar" ? { direction: "rtl" } : {}) }}>{language === "ml" ? (MANSION_ML_NAMES[m.name] || m.name) : language === "ar" ? (m.name_arabic || m.name) : m.name}</span>
                {language === "ar" && <span className="font-amiri text-sm" style={{ color: "rgba(212,175,55,0.50)" }}>{m.name_arabic}</span>}
                {isCurrent && <span className="font-inter text-[7px] uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.15)", color: "#F5D060" }}>{txt("നിലവിലെ", "Now", "Şimdi")}</span>}
                <ChevronDown className="w-3.5 h-3.5 transition-transform flex-shrink-0" style={{ color: "rgba(212,175,55,0.40)", transform: isOpen ? "rotate(180deg)" : "none" }} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                    <div className="px-2.5 pb-2.5 space-y-1.5">
                      {/* ── TOPIC: Identity & Boundaries (Havâss) ── */}
                      <ManuscriptTopic title={txt("അതിരുകളും മൂലവും", "Identity & Boundaries", "Sınırlar & Kimlik")}>
                        <div className="flex items-center gap-1 mb-0.5"><SourceBadge source={MANUSCRIPT_SOURCES.HAVASS} page="316-904" language={language} isOwner={isOwner} /></div>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          <div><span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("അതിര്", "Boundary", "Sınır")}: </span><span className={zodiacFontClass} style={{ color: "rgba(255,255,255,0.65)" }}>{zodiacDisplay} {extractDegree(m.baslama_siniri)}°</span></div>
                          <div><span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("രാശി", "Zodiac", "Burç")}: </span><span className={zodiacFontClass} style={{ color: "rgba(255,255,255,0.65)" }}>{zodiacDisplay} ({m.zodiac_degree}°)</span></div>
                          <div><span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("അക്ഷരം", "Letter", "Harf")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{m.harfi} <span className="font-amiri">{m.harf_arabic}</span></span></div>
                        </div>
                      </ManuscriptTopic>

                      {/* ── TOPIC: Nature (Sa'd / Nahs) — each manuscript shown independently, not merged ── */}
                      <ManuscriptTopic title={txt("സ്വഭാവം (Sa'd / Nahs)", "Nature (Sa'd / Nahs)", "Doğa (Sa'd / Nahs)")}>
                        {mansionConflict ? (
                          <DifferentOpinion language={language}>
                            <div className="flex items-center gap-1.5 mb-1"><ConflictBadge language={language} /></div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <SourceBadge source={MANUSCRIPT_SOURCES.HAVASS} page={mansionConflict.havassOpinion.page} language={language} isOwner={isOwner} />
                              <span className={zodiacFontClass} style={{ color: "#F87171" }}>{mansionConflict.havassOpinion.label[language] || mansionConflict.havassOpinion.label.en}</span>
                              <span className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.40)" }}>— {mansionConflict.havassOpinion.source}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <SourceBadge source={MANUSCRIPT_SOURCES.KASHF} page={mansionConflict.kashfOpinion.page} language={language} isOwner={isOwner} />
                              <span className={zodiacFontClass} style={{ color: "#F87171" }}>{mansionConflict.kashfOpinion.label[language] || mansionConflict.kashfOpinion.label.en}</span>
                              <span className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.40)" }}>— {mansionConflict.kashfOpinion.source}</span>
                            </div>
                          </DifferentOpinion>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <SourceBadge source={MANUSCRIPT_SOURCES.HAVASS} page="316-904" language={language} isOwner={isOwner} />
                              <span className={zodiacFontClass} style={{ color: isNahs ? "#F87171" : "#4ADE80" }}>{natureDisplay}</span>
                            </div>
                            {kashfMansion && (kashfMansion.nature_ml || kashfMansion.nature_en) && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <SourceBadge source={MANUSCRIPT_SOURCES.KASHF} page={kashfMansion.source_page || ""} language={language} isOwner={isOwner} />
                                <span className={zodiacFontClass} style={{ color: "rgba(255,255,255,0.65)" }}>{language === "ml" ? kashfMansion.nature_ml : language === "ar" ? (kashfMansion.nature_ar || kashfMansion.nature_en) : kashfMansion.nature_en}</span>
                              </div>
                            )}
                          </>
                        )}
                      </ManuscriptTopic>

                      {/* Kashf Omani tradition */}
                      {kashfMansion && (
                        <ManuscriptSourcePanel
                          sources={[{
                            id: "kashf",
                            label: txt("കശ്ഫ് അൽ-ഹഖാഇഖ് (ഒമാൻ)", "Kashf al-Haqa'iq (Omani)", "Kashf al-Haqa'iq (Omani)"),
                            items: [{
                              ar: kashfMansion.operation_ar,
                              en: `${kashfMansion.nature_en} — ${kashfMansion.operation_ar}`,
                              ml: kashfMansion.nature_ml,
                              tr: kashfMansion.nature_tr,
                              type: kashfMansion.nature_en.includes("Auspi") ? "recommend" : "warning",
                              source: kashfMansion.source,
                            }]
                          }]}
                        />
                      )}

                      {/* Magical period from manuscript (if available) */}
                      <MagicalPeriodPanel entityType="mansion" entityKey={m.name} />

                      {/* Entity Knowledge from unified ingestion pipeline */}
                      <EntityKnowledgePanel entityType="mansion" entityKey={String(m.no)} />

                      {/* Source visuals (nakshatra list / mansion tables) attached to lunar mansion records */}
                      <AstroClockCategoryVisuals categories={['lunar mansion']} entityAliases={[]} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── HIDDEN: Source Book mansions actions — pending Arabic verification ── */}
      {false && <SourceBookPanel topicId="manazilActions" />}

      {/* ── HIDDEN: Source Book mansions marriage — pending Arabic verification ── */}
      {false && <SourceBookPanel topicId="manazilMarriage" />}
    </div>
  );
}
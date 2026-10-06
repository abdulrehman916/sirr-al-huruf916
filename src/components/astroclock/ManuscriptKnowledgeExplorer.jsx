// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT KNOWLEDGE EXPLORER — CROSS-REFERENCE SYSTEM
// Automatically collects and displays all related manuscript records
// for any astrological entity (Mansion, Planet, Zodiac, Letter, etc.)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, FileText, Search, X, ChevronDown, ChevronUp, Moon, Sun, Star, Sparkles, Scroll, Shield, Gem } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { ArabicLetterDisplay, LunarMansionDisplay, ZodiacSignDisplay, ArabicTextWithTranslation } from "./ArabicLetterDisplay";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  success: "rgba(34,197,94,0.15)",
  successBorder: "rgba(34,197,94,0.60)"
};

const ENTITY_TYPES = {
  LUNAR_MANSION: "LUNAR_MANSION",
  PLANET: "PLANET",
  ZODIAC: "ZODIAC",
  ARABIC_LETTER: "ARABIC_LETTER",
  ELEMENT: "ELEMENT",
  METAL: "METAL",
  STONE: "STONE",
  SAAD_NAHS: "SAAD_NAHS"
};

export default function ManuscriptKnowledgeExplorer({ entityType, entityData, onClose }) {
  const { isMalayalam } = useAstroClockLanguage();
  const [relatedRecords, setRelatedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (entityType && entityData) {
      loadRelatedRecords();
    }
  }, [entityType, entityData]);

  async function loadRelatedRecords() {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('queryManuscriptLibrary', {
        entity_type: entityType,
        entity_value: entityData
      });
      setRelatedRecords(result.data?.rules || []);
    } catch (err) {
      console.error("Failed to load related records:", err);
    }
    setLoading(false);
  }

  const filteredRecords = relatedRecords.filter(record => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      record.rule_summary?.toLowerCase().includes(searchLower) ||
      record.book_name?.toLowerCase().includes(searchLower) ||
      record.chapter?.toLowerCase().includes(searchLower)
    );
  });

  const groupedByCategory = filteredRecords.reduce((acc, record) => {
    const category = record.category || "OTHER";
    if (!acc[category]) acc[category] = [];
    acc[category].push(record);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border"
        style={{
          background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
          borderColor: G.borderHi,
          boxShadow: `0 0 60px ${G.glow}`
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: G.border }}>
          <div className="flex items-center gap-4">
            <Book className="w-8 h-8" style={{ color: G.text }} />
            <div>
              <h2 className="font-inter text-xl font-bold uppercase tracking-widest" style={{ color: G.text }}>
                {isMalayalam ? "ഹസ്തലിഖിത ജ്ഞാനം" : "Manuscript Knowledge"}
              </h2>
              {entityData && (
                <p className="font-amiri text-2xl font-bold mt-1" style={{ color: G.text }} dir="rtl">
                  {entityData}
                </p>
              )}
              <p className="font-inter text-xs" style={{ color: G.dim }}>
                {relatedRecords.length} {isMalayalam ? "രേഖകൾ കണ്ടെത്തി" : "records found"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-6 h-6" style={{ color: G.dim }} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b" style={{ borderColor: G.border }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: G.dim }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isMalayalam ? "തിരയുക..." : "Search records..."}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: G.bg, border: `1px solid ${G.border}` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-t-gold border-r-transparent border-b-gold border-l-transparent rounded-full animate-spin mx-auto" />
              <p className="font-inter text-sm mt-4" style={{ color: G.dim }}>
                {isMalayalam ? "ഹസ്തലിഖിതങ്ങൾ തിരയുന്നു..." : "Searching manuscripts..."}
              </p>
            </div>
          ) : relatedRecords.length === 0 ? (
            <div className="text-center py-12">
              <Book className="w-12 h-12 mx-auto mb-4" style={{ color: G.dim }} />
              <p className="font-inter text-sm" style={{ color: G.dim }}>
                {isMalayalam ? "ഹസ്തലിഖിതങ്ങളിൽ കണ്ടെത്തിയില്ല" : "No manuscript records found"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByCategory).map(([category, records]) => (
                <CategorySection
                  key={category}
                  category={category}
                  records={records}
                  expandedRecord={expandedRecord}
                  setExpandedRecord={setExpandedRecord}
                  isMalayalam={isMalayalam}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CategorySection({ category, records, expandedRecord, setExpandedRecord, isMalayalam }) {
  const [expanded, setExpanded] = useState(true);

  const CATEGORY_ICONS = {
    LUNAR_MANSIONS: Moon,
    ZODIAC: Star,
    PLANETS: Sun,
    LETTER_RULES: Sparkles,
    TIMING_RULES: Scroll,
    SAAD_NAHS: Shield,
    ELEMENT_RULES: Sparkles,
    SPIRITUAL_WORKS: Scroll,
    VEFK: Scroll,
    TALISMAN: Gem,
    OTHER: Book
  };

  const Icon = CATEGORY_ICONS[category] || Book;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: G.border }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
        style={{ background: G.bg }}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" style={{ color: G.text }} />
          <span className="font-inter font-bold text-white text-sm">
            {category.replace(/_/g, ' ')}
          </span>
          <span className="font-inter text-xs px-2 py-0.5 rounded-full" style={{ background: G.bgHi, color: G.text }}>
            {records.length}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" style={{ color: G.dim }} /> : <ChevronDown className="w-4 h-4" style={{ color: G.dim }} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="divide-y" style={{ borderColor: G.border }}
          >
            {records.map((record, idx) => (
              <RecordCard
                key={record.id || idx}
                record={record}
                expanded={expandedRecord === record.id}
                onToggle={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                isMalayalam={isMalayalam}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecordCard({ record, expanded, onToggle, isMalayalam }) {
  return (
    <div className="p-4" style={{ borderColor: G.border }}>
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <div className="flex-1">
          <p className="font-inter text-sm text-white mb-2">{record.rule_summary}</p>
          <div className="flex flex-wrap gap-2">
            <span className="font-inter text-[8px] px-2 py-0.5 rounded" style={{ background: G.bg, color: G.dim }}>
              📖 {record.book_name}
            </span>
            {record.page_number > 0 && (
              <span className="font-inter text-[8px] px-2 py-0.5 rounded" style={{ background: G.bg, color: G.dim }}>
                p.{record.page_number}
              </span>
            )}
            {record.chapter && (
              <span className="font-inter text-[8px] px-2 py-0.5 rounded" style={{ background: G.bg, color: G.dim }}>
                §{record.chapter}
              </span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" style={{ color: G.dim }} /> : <ChevronDown className="w-4 h-4" style={{ color: G.dim }} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pt-4 space-y-4"
          >
            {/* Original Arabic Text */}
            {record.original_text && (
              <div className="p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
                  {isMalayalam ? "യഥാർത്ഥ വാചകം" : "Original Text"}
                </p>
                <p className="font-amiri text-lg text-right leading-relaxed" style={{ color: G.text }} dir="rtl">
                  {record.original_text}
                </p>
              </div>
            )}

            {/* Malayalam Translation */}
            {record.rule_summary_ml && (
              <div className="p-4 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: `1px solid rgba(34,197,94,0.40)` }}>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
                  {isMalayalam ? "മലയാളം" : "Malayalam"}
                </p>
                <p className="font-malayalam-sm text-white/90">{record.rule_summary_ml}</p>
              </div>
            )}

            {/* Related Entities */}
            {record.data_json && (() => {
              try {
                const parsed = JSON.parse(record.data_json);
                return <RelatedEntities data={parsed} isMalayalam={isMalayalam} />;
              } catch (e) {
                return null;
              }
            })()}

            {/* Source Citation */}
            <div className="p-4 rounded-lg border-2" style={{ background: "rgba(212,175,55,0.1)", borderColor: G.border }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-3 font-bold" style={{ color: G.text }}>
                📖 {isMalayalam ? "സ്രോതസ്സ്" : "MANUSCRIPT SOURCE"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    ✍️ {isMalayalam ? "രചയിതാവ്" : "Author"}
                  </p>
                  <p className="font-inter text-sm font-bold text-white/90">{record.author}</p>
                </div>
                <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    📚 {isMalayalam ? "പുസ്തകം" : "Book"}
                  </p>
                  <p className="font-inter text-sm font-bold text-white/90">{record.book_name}</p>
                </div>
                <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    📄 {isMalayalam ? "പേജ്" : "Page"}
                  </p>
                  <p className="font-inter text-sm font-bold text-white/90">p. {record.page_number || 'N/A'}</p>
                </div>
              </div>
              {record.chapter && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: G.faint }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
                    📑 {isMalayalam ? "അധ്യായം" : "Chapter"}: <span className="text-white/80">{record.chapter}</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RelatedEntities({ data, isMalayalam }) {
  if (!data) return null;

  const hasData = (
    data.letter ||
    data.lunar_mansion ||
    data.zodiac ||
    data.planet ||
    data.element ||
    data.metal ||
    data.stone ||
    data.vefk ||
    data.talisman
  );

  if (!hasData) return null;

  return (
    <div className="p-4 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
        {isMalayalam ? "ബന്ധപ്പെട്ടവ" : "Related Entities"}
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Arabic Letter */}
        {data.letter && (
          <div className="text-center p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <ArabicLetterDisplay
              letter={data.letter}
              malayalam={data.letter_malayalam}
              size="md"
            />
          </div>
        )}

        {/* Lunar Mansion */}
        {data.lunar_mansion && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <LunarMansionDisplay
              arabic={data.lunar_mansion_arabic || data.lunar_mansion}
              name={data.lunar_mansion}
              malayalam={data.lunar_mansion_malayalam}
            />
          </div>
        )}

        {/* Zodiac Sign */}
        {data.zodiac && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <ZodiacSignDisplay
              arabic={data.zodiac_arabic || data.zodiac}
              name={data.zodiac}
              malayalam={data.zodiac_malayalam}
            />
          </div>
        )}

        {/* Planet */}
        {data.planet && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              {isMalayalam ? "ഗ്രഹം" : "Planet"}
            </p>
            <p className="font-amiri text-2xl font-bold" style={{ color: G.text }}>{data.planet_arabic}</p>
            <p className="font-inter text-sm text-white/80">{data.planet}</p>
            {data.planet_malayalam && (
              <p className="font-malayalam-sm text-white/60">{data.planet_malayalam}</p>
            )}
          </div>
        )}

        {/* Element */}
        {data.element && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              {isMalayalam ? "മൂലകം" : "Element"}
            </p>
            <p className="font-amiri text-2xl font-bold" style={{ color: G.text }}>{data.element_arabic}</p>
            <p className="font-inter text-sm text-white/80">{data.element}</p>
          </div>
        )}

        {/* Metal */}
        {data.metal && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              {isMalayalam ? "ലോഹം" : "Metal"}
            </p>
            <p className="font-amiri text-2xl font-bold" style={{ color: G.text }}>{data.metal_arabic}</p>
            <p className="font-inter text-sm text-white/80">{data.metal}</p>
          </div>
        )}

        {/* Stone */}
        {data.stone && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              {isMalayalam ? "രത്നം" : "Stone"}
            </p>
            <p className="font-amiri text-2xl font-bold" style={{ color: G.text }}>{data.stone_arabic}</p>
            <p className="font-inter text-sm text-white/80">{data.stone}</p>
          </div>
        )}

        {/* Vefk */}
        {data.vefk && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              {isMalayalam ? "വെഫ്ക്" : "Vefk"}
            </p>
            <p className="font-inter text-sm text-white/80">{data.vefk}</p>
          </div>
        )}

        {/* Talisman */}
        {data.talisman && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              {isMalayalam ? "തലിസ്മാൻ" : "Talisman"}
            </p>
            <p className="font-inter text-sm text-white/80">{data.talisman}</p>
          </div>
        )}
      </div>
    </div>
  );
}
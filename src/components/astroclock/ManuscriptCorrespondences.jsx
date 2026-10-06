// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT CORRESPONDENCES — DIRECT DATABASE DISPLAY
// Fetches and displays all manuscript records for any entity
// Shows Arabic primary, Malayalam secondary, with full citations
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, FileText, Scroll, Sparkles, Moon, Sun, Star, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { ArabicLetterDisplay, LunarMansionDisplay, ZodiacSignDisplay } from "./ArabicLetterDisplay";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)"
};

const CATEGORY_ICONS = {
  LUNAR_MANSIONS: Moon,
  ZODIAC: Star,
  PLANETS: Sun,
  LETTER_RULES: Sparkles,
  TIMING_RULES: Scroll,
  SAAD_NAHS: Sparkles,
  ELEMENT_RULES: Sparkles,
  OTHER: Book
};

export default function ManuscriptCorrespondences({ records, isMalayalam }) {
  const [expandedRecord, setExpandedRecord] = useState(null);

  if (!records || records.length === 0) return null;

  const groupedByCategory = records.reduce((acc, record) => {
    const category = record.category || "OTHER";
    if (!acc[category]) acc[category] = [];
    acc[category].push(record);
    return acc;
  }, {});

  return (
    <div className="space-y-4 mt-4">
      <p className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: G.text }}>
        📖 {isMalayalam ? "ഹസ്തലിഖിത രേഖകൾ" : "Manuscript Records"} ({records.length})
      </p>
      
      {Object.entries(groupedByCategory).map(([category, categoryRecords]) => (
        <CategorySection
          key={category}
          category={category}
          records={categoryRecords}
          expandedRecord={expandedRecord}
          setExpandedRecord={setExpandedRecord}
          isMalayalam={isMalayalam}
        />
      ))}
    </div>
  );
}

function CategorySection({ category, records, expandedRecord, setExpandedRecord, isMalayalam }) {
  const [expanded, setExpanded] = useState(true);
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
            {/* Original Arabic Text - PRIMARY DISPLAY */}
            {record.original_text && (
              <div className="p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
                  {isMalayalam ? "യഥാർത്ഥ അറബിക് വാചകം" : "Original Arabic Text"}
                </p>
                <p className="font-amiri text-2xl font-bold text-right leading-relaxed" style={{ color: G.text, textShadow: "0 0 20px rgba(212,175,55,0.2)" }} dir="rtl">
                  {record.original_text}
                </p>
              </div>
            )}

            {/* Malayalam Translation - SECONDARY */}
            {record.rule_summary_ml && (
              <div className="p-4 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: `1px solid rgba(34,197,94,0.40)` }}>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
                  {isMalayalam ? "മലയാളം അർത്ഥം" : "Malayalam Meaning"}
                </p>
                <p className="font-malayalam-sm text-white/90">{record.rule_summary_ml}</p>
              </div>
            )}

            {/* Related Entities from data_json */}
            {record.data_json && (
              <RelatedEntities data={JSON.parse(record.data_json)} isMalayalam={isMalayalam} />
            )}

            {/* Full Source Citation */}
            <div className="p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${G.faint}` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
                {isMalayalam ? "സ്രോതസ്സ്" : "Manuscript Source"}
              </p>
              <div className="space-y-1">
                <p className="font-inter text-sm text-white/90">
                  <strong style={{ color: G.text }}>{record.book_name}</strong>
                  {record.author && ` by ${record.author}`}
                </p>
                {record.page_number > 0 && (
                  <p className="font-inter text-xs text-white/70">
                    Page {record.page_number} · {record.chapter || record.category}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RelatedEntities({ data, isMalayalam }) {
  const hasData = data.letter || data.lunar_mansion || data.zodiac || data.planet || data.element || data.metal || data.stone;
  if (!hasData) return null;

  return (
    <div className="p-4 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
        {isMalayalam ? "ബന്ധപ്പെട്ടവ" : "Related Correspondences"}
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.letter && (
          <div className="text-center p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "അറബിക് അക്ഷരം" : "Arabic Letter"}
            </p>
            <ArabicLetterDisplay letter={data.letter} malayalam={data.letter_malayalam} size="md" />
            {data.abjad_value && <p className="font-inter text-xs mt-2" style={{ color: G.dim }}>Abjad: {data.abjad_value}</p>}
          </div>
        )}

        {data.lunar_mansion && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "ചാന്ദ്ര നക്ഷത്രം" : "Lunar Mansion"}
            </p>
            <LunarMansionDisplay arabic={data.lunar_mansion_arabic || data.lunar_mansion} name={data.lunar_mansion} malayalam={data.lunar_mansion_malayalam} />
            {data.nature && <p className="font-inter text-xs mt-2" style={{ color: data.nature === 'Saad' ? '#22c55e' : data.nature === 'Nahs' ? '#ef4444' : '#fbbf24' }}>{data.nature}</p>}
          </div>
        )}

        {data.zodiac && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "രാശി" : "Zodiac Sign"}
            </p>
            <ZodiacSignDisplay arabic={data.zodiac_arabic || data.zodiac} name={data.zodiac} malayalam={data.zodiac_malayalam} />
          </div>
        )}

        {data.planet && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "ഗ്രഹം" : "Planet"}
            </p>
            <p className="font-amiri text-2xl font-bold" style={{ color: G.text }} dir="rtl">{data.planet_arabic}</p>
            <p className="font-inter text-sm text-white/80">{data.planet}</p>
            {data.planet_malayalam && <p className="font-malayalam-sm text-white/60">{data.planet_malayalam}</p>}
          </div>
        )}

        {data.element && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "മൂലകം" : "Element"}
            </p>
            <p className="font-amiri text-2xl font-bold" style={{ color: G.text }} dir="rtl">{data.element_arabic}</p>
            <p className="font-inter text-sm text-white/80">{data.element}</p>
          </div>
        )}

        {data.metal && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "ലോഹം" : "Metal"}
            </p>
            <p className="font-amiri text-2xl font-bold" style={{ color: G.text }} dir="rtl">{data.metal_arabic}</p>
            <p className="font-inter text-sm text-white/80">{data.metal}</p>
          </div>
        )}

        {data.stone && (
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "രത്നം" : "Stone"}
            </p>
            <p className="font-amiri text-2xl font-bold" style={{ color: G.text }} dir="rtl">{data.stone_arabic}</p>
            <p className="font-inter text-sm text-white/80">{data.stone}</p>
          </div>
        )}
      </div>
    </div>
  );
}
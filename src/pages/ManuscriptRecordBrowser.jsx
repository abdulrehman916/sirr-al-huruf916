/**
 * MANUSCRIPT RECORD BROWSER
 * Browse and search all ingested manuscript records from the database
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, Search, Filter, Book, FileText, Hash, ChevronDown, ChevronUp, X } from "lucide-react";
import PageLayout from "../components/PageLayout";
import { base44 } from "@/api/base44Client";
import { ArabicLetterDisplay, LunarMansionDisplay, ZodiacSignDisplay, ArabicTextWithTranslation } from "../components/astroclock/ArabicLetterDisplay";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  success: "rgba(34,197,94,0.15)",
  successBorder: "rgba(34,197,94,0.60)"
};

const CATEGORIES = [
  "ALL", "PLANETARY_HOURS", "LUNAR_MANSIONS", "ZODIAC", "PLANETS",
  "FRIENDSHIP_RULES", "INCENSE_RULES", "LETTER_RULES", "TIMING_RULES",
  "DAY_RULERS", "SAAD_NAHS", "SPIRITUAL_WORKS", "PROTECTION_WORKS",
  "LOVE_WORKS", "WEALTH_WORKS", "TRAVEL_WORKS", "ELEMENT_RULES", "COSMOLOGY"
];

export default function ManuscriptRecordBrowser() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    category: "ALL",
    planet: "",
    zodiac: "",
    mansion: "",
    letter: "",
    page: "",
    manuscript: ""
  });
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadRecords();
    loadStats();
  }, []);

  async function loadRecords() {
    setLoading(true);
    try {
      const data = await base44.entities.ManuscriptRule.list('-created_date', 100);
      setRecords(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function loadStats() {
    try {
      // Load only what's needed — manuscripts list is small, rules should be sampled
      const [rules, manuscripts] = await Promise.all([
        base44.entities.ManuscriptRule.list('-created_date', 500),
        base44.entities.ManuscriptLibrary.list()
      ]);
      
      const categoryCount = {};
      rules.forEach(r => {
        categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
      });

      setStats({
        totalRules: rules.length,
        totalManuscripts: manuscripts.length,
        byCategory: categoryCount
      });
    } catch (e) {
      console.error(e);
    }
  }

  const filteredRecords = records.filter(r => {
    if (searchFilters.category !== "ALL" && r.category !== searchFilters.category) return false;
    if (searchFilters.planet && !r.data_json?.includes(searchFilters.planet)) return false;
    if (searchFilters.zodiac && !r.data_json?.includes(searchFilters.zodiac)) return false;
    if (searchFilters.mansion && !r.data_json?.includes(searchFilters.mansion)) return false;
    if (searchFilters.letter && !r.data_json?.includes(searchFilters.letter)) return false;
    if (searchFilters.page && r.page_number != searchFilters.page) return false;
    if (searchFilters.manuscript && !r.book_name?.toLowerCase().includes(searchFilters.manuscript.toLowerCase())) return false;
    return true;
  });

  return (
    <PageLayout>
      <div className="space-y-6 pb-10">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-amiri text-3xl mb-1" style={{ color: G.text }}>
              مستودع المخطوطات
            </h1>
            <p className="font-inter text-sm" style={{ color: G.dim }}>
              Manuscript Record Browser — View All Database Records
            </p>
          </div>
        </div>

        {/* Database Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Database} label="Total Rules" value={stats.totalRules.toLocaleString()} color={G.text} />
            <StatCard icon={Book} label="Manuscripts" value={stats.totalManuscripts} color={G.text} />
            <StatCard icon={FileText} label="Categories" value={Object.keys(stats.byCategory).length} color={G.text} />
            <StatCard icon={Hash} label="Showing" value={filteredRecords.length} color={G.text} />
          </div>
        )}

        {/* Search Filters */}
        <div className="rounded-2xl border p-6" style={{ background: "rgba(10,22,56,0.99)", borderColor: G.borderHi }}>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5" style={{ color: G.text }} />
            <h2 className="font-inter font-bold text-white">Search Records</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <FilterSelect
              label="Category"
              value={searchFilters.category}
              onChange={v => setSearchFilters(f => ({ ...f, category: v }))}
              options={CATEGORIES}
            />
            <FilterInput
              label="Planet (Arabic)"
              value={searchFilters.planet}
              onChange={v => setSearchFilters(f => ({ ...f, planet: v }))}
              placeholder="e.g. زحل, مشتری"
            />
            <FilterInput
              label="Zodiac (Arabic)"
              value={searchFilters.zodiac}
              onChange={v => setSearchFilters(f => ({ ...f, zodiac: v }))}
              placeholder="e.g. الحمل, الثور"
            />
            <FilterInput
              label="Mansion (Arabic)"
              value={searchFilters.mansion}
              onChange={v => setSearchFilters(f => ({ ...f, mansion: v }))}
              placeholder="e.g. الشرطين, البطين"
            />
            <FilterInput
              label="Arabic Letter"
              value={searchFilters.letter}
              onChange={v => setSearchFilters(f => ({ ...f, letter: v }))}
              placeholder="e.g. ا, ب, ت"
            />
            <FilterInput
              label="Page Number"
              type="number"
              value={searchFilters.page}
              onChange={v => setSearchFilters(f => ({ ...f, page: v }))}
              placeholder="e.g. 42"
            />
            <FilterInput
              label="Manuscript Name"
              value={searchFilters.manuscript}
              onChange={v => setSearchFilters(f => ({ ...f, manuscript: v }))}
              placeholder="e.g. Elbuni, Taha"
            />
          </div>

          <button
            onClick={() => setSearchFilters({ category: "ALL", planet: "", zodiac: "", mansion: "", letter: "", page: "", manuscript: "" })}
            className="px-4 py-2 rounded-xl font-bold text-sm"
            style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}
          >
            Clear Filters
          </button>
        </div>

        {/* Records List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-t-yellow-400 border-r-transparent border-b-yellow-400 border-l-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record, idx) => (
              <RecordCard
                key={record.id}
                record={record}
                expanded={expandedRecord === record.id}
                onToggle={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
              />
            ))}
          </div>
        )}

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="font-inter text-sm" style={{ color: G.dim }}>No records match your filters</p>
          </div>
        )}

      </div>
    </PageLayout>
  );
}

function StatCard({ icon: IconComponent, label, value, color }) {
  return (
    <div className="rounded-xl border p-4 text-center" style={{ background: G.bg, borderColor: G.border }}>
      <IconComponent className="w-5 h-5 mx-auto mb-2" style={{ color }} />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="font-inter text-[9px] uppercase tracking-widest mt-1" style={{ color: G.dim }}>{label}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="font-inter text-[9px] uppercase tracking-widest block mb-1" style={{ color: G.dim }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
        style={{ background: G.bg, border: `1px solid ${G.border}` }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function FilterInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="font-inter text-[9px] uppercase tracking-widest block mb-1" style={{ color: G.dim }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
        style={{ background: G.bg, border: `1px solid ${G.border}` }}
      />
    </div>
  );
}

function RecordCard({ record, expanded, onToggle }) {
  return (
    <motion.div
      className="rounded-xl border overflow-hidden"
      style={{ background: "rgba(10,22,56,0.98)", borderColor: expanded ? G.borderHi : G.border }}
    >
      <button
        className="w-full flex items-start justify-between p-5 text-left"
        onClick={onToggle}
      >
        <div className="flex items-start gap-4 flex-1">
          <FileText className="w-6 h-6 mt-0.5 flex-shrink-0" style={{ color: G.text }} />
          <div className="flex-1 text-left">
            <p className="font-inter text-sm text-white mb-1">{record.rule_summary}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 rounded text-[8px] uppercase" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                {record.category}
              </span>
              <span className="px-2 py-0.5 rounded text-[8px]" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                📖 {record.book_name}
              </span>
              {record.page_number > 0 && (
                <span className="px-2 py-0.5 rounded text-[8px]" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                  p.{record.page_number}
                </span>
              )}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 flex-shrink-0 ml-4" style={{ color: G.dim }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0 ml-4" style={{ color: G.dim }} />}
      </button>

      {expanded && (
        <div className="border-t p-5 space-y-4" style={{ borderColor: G.border }}>
          {/* Original Arabic Text */}
          {record.original_text && (
            <ArabicTextWithTranslation arabic={record.original_text} />
          )}

          {/* Data JSON Display */}
          {record.data_json && (
            <DataJsonDisplay dataJson={record.data_json} />
          )}

          {/* Metadata */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: G.faint }}>
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>Rule ID</p>
              <p className="font-inter text-xs text-white/80">{record.rule_id}</p>
            </div>
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>Manuscript ID</p>
              <p className="font-inter text-xs text-white/80">{record.manuscript_id}</p>
            </div>
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>Created</p>
              <p className="font-inter text-xs text-white/80">{new Date(record.created_date).toLocaleDateString()}</p>
            </div>
            {record.verified && (
              <div>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: "#22c55e" }}>Status</p>
                <p className="font-inter text-xs" style={{ color: "#22c55e" }}>✓ Verified</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function DataJsonDisplay({ dataJson }) {
  try {
    const data = typeof dataJson === 'string' ? JSON.parse(dataJson) : dataJson;
    
    return (
      <div className="space-y-3">
        {/* Arabic Letter */}
        {data.letter && (
          <div className="p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>Arabic Letter</p>
            <ArabicLetterDisplay letter={data.letter} malayalam={data.letter_malayalam} size="md" />
          </div>
        )}

        {/* Lunar Mansion */}
        {data.lunar_mansion_arabic && (
          <div className="p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>Lunar Mansion</p>
            <LunarMansionDisplay arabic={data.lunar_mansion_arabic} name={data.lunar_mansion} malayalam={data.lunar_mansion_malayalam} />
          </div>
        )}

        {/* Zodiac Sign */}
        {data.zodiac_arabic && (
          <div className="p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>Zodiac Sign</p>
            <ZodiacSignDisplay arabic={data.zodiac_arabic} name={data.zodiac} malayalam={data.zodiac_malayalam} />
          </div>
        )}

        {/* Planet */}
        {data.planet_arabic && (
          <div className="p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>Planet</p>
            <div className="flex items-center gap-3">
              <p className="font-amiri text-xl" style={{ color: G.text }}>{data.planet_arabic}</p>
              {data.planet && <p className="font-inter text-sm text-white/70">{data.planet}</p>}
              {data.planet_malayalam && <p className="font-inter text-xs" style={{ color: "#22c55e" }}>{data.planet_malayalam}</p>}
            </div>
          </div>
        )}

        {/* Other Data */}
        {Object.entries(data).filter(([k]) => 
          !['letter', 'letter_malayalam', 'lunar_mansion', 'lunar_mansion_arabic', 'lunar_mansion_malayalam', 
            'zodiac', 'zodiac_arabic', 'zodiac_malayalam', 'planet', 'planet_arabic', 'planet_malayalam',
            'page_number', 'manuscript_id'].includes(k)
        ).length > 0 && (
          <div className="p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>Additional Data</p>
            <pre className="font-inter text-xs text-white/70 overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  } catch {
    return null;
  }
}
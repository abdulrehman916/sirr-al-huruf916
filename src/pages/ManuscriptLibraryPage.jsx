// ═══════════════════════════════════════════════════════════════
// PERMANENT MANUSCRIPT LIBRARY PAGE
// Cumulative knowledge base — additive only, never destructive
// Upload new PDFs → auto-extract all rules → preserve all sources
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Upload, Search, Database, AlertTriangle, CheckCircle, Clock, FileText, Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import PageLayout from "../components/PageLayout";
import { base44 } from "@/api/base44Client";
import { ArabicLetterDisplay, LunarMansionDisplay, ZodiacSignDisplay, ArabicTextWithTranslation } from "../components/astroclock/ArabicLetterDisplay";
import { formatArabicLetter, getLetterInfo } from "@/lib/arabicLetterReference";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.60)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.12)",
  glow: "rgba(212,175,55,0.18)"
};

const CATEGORY_LABELS = {
  PLANETARY_HOURS: "Planetary Hours",
  LUNAR_MANSIONS: "Lunar Mansions",
  ZODIAC: "Zodiac Signs",
  PLANETS: "Planetary Properties",
  FRIENDSHIP_RULES: "Friendship Rules",
  INCENSE_RULES: "Incense / Buhur",
  LETTER_RULES: "Letter Rules (Abjad)",
  TIMING_RULES: "Timing Rules",
  DAY_RULERS: "Day Rulers",
  SAAD_NAHS: "Sa'd / Nahs",
  SPIRITUAL_WORKS: "Spiritual Works",
  PROTECTION_WORKS: "Protection Works",
  LOVE_WORKS: "Love Works",
  WEALTH_WORKS: "Wealth Works",
  TRAVEL_WORKS: "Travel Works",
  ELEMENT_RULES: "Element Rules",
  COSMOLOGY: "Cosmology",
  OTHER: "Other Rules"
};

const STATUS_COLORS = {
  FULLY_INGESTED: "#22c55e",
  PARTIAL: "#f59e0b",
  PROCESSING: "#3b82f6",
  PENDING: "rgba(212,175,55,0.55)"
};

export default function ManuscriptLibraryPage() {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [expandedBook, setExpandedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [queryResults, setQueryResults] = useState(null);
  const [querying, setQuerying] = useState(false);

  const [form, setForm] = useState({
    book_name: "", author: "", language: "", tradition: "", pages_ingested: "", notes: "", file: null
  });

  useEffect(() => {
    loadManuscripts();
  }, []);

  async function loadManuscripts() {
    setLoading(true);
    try {
      const data = await base44.entities.ManuscriptLibrary.list('-created_date');
      setManuscripts(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleUpload() {
    if (!form.book_name || !form.file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      // Upload PDF file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: form.file });

      // Ingest manuscript
      const result = await base44.functions.invoke('ingestManuscriptPDF', {
        pdf_url: file_url,
        book_name: form.book_name,
        author: form.author,
        language: form.language,
        tradition: form.tradition,
        pages_ingested: form.pages_ingested,
        notes: form.notes
      });

      setUploadResult(result.data);
      if (result.data?.success) {
        setUploadMode(false);
        setForm({ book_name: "", author: "", language: "", tradition: "", pages_ingested: "", notes: "", file: null });
        loadManuscripts();
      }
    } catch (e) {
      setUploadResult({ error: e.message || "Upload failed" });
    }
    setUploading(false);
  }

  async function handleQuery() {
    setQuerying(true);
    try {
      const result = await base44.functions.invoke('queryManuscriptLibrary', {
        category: selectedCategory !== "ALL" ? selectedCategory : undefined,
        search_term: searchTerm || undefined,
        include_conflicts: true
      });
      setQueryResults(result.data);
    } catch (e) {
      console.error(e);
    }
    setQuerying(false);
  }

  const totalRules = manuscripts.reduce((sum, m) => sum + (m.total_rules_extracted || 0), 0);

  return (
    <PageLayout>
      <div className="space-y-6 pb-10">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-amiri text-3xl mb-1" style={{ color: G.text }}>
              المكتبة الدائمة للمخطوطات
            </h1>
            <p className="font-inter text-sm" style={{ color: G.dim }}>
              Permanent Manuscript Library — Additive Only, Never Destructive
            </p>
          </div>
          <button
            onClick={() => setUploadMode(!uploadMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
            style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.borderHi}` }}
          >
            <Plus className="w-4 h-4" />
            Add Manuscript
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Manuscripts", value: manuscripts.length, Icon: Book },
            { label: "Total Rules Indexed", value: totalRules.toLocaleString(), Icon: Database },
            { label: "Fully Ingested", value: manuscripts.filter(m => m.ingestion_status === 'FULLY_INGESTED').length, Icon: CheckCircle }
          ].map(({ label, value, Icon }) => (
            <div key={label} className="rounded-xl border p-4 text-center" style={{ background: G.bg, borderColor: G.border }}>
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: G.text }} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="font-inter text-[9px] uppercase tracking-widest mt-1" style={{ color: G.dim }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Upload Form */}
        <AnimatePresence>
          {uploadMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border p-6"
              style={{ background: "rgba(10,22,56,0.99)", borderColor: G.borderHi }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-inter font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5" style={{ color: G.text }} />
                  Add New Manuscript to Library
                </h2>
                <button onClick={() => setUploadMode(false)}>
                  <X className="w-5 h-5" style={{ color: G.dim }} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {[
                  { key: "book_name", label: "Book Title *", placeholder: "Full manuscript title" },
                  { key: "author", label: "Author", placeholder: "Author name" },
                  { key: "language", label: "Language", placeholder: "Arabic, Turkish, Persian..." },
                  { key: "tradition", label: "Tradition", placeholder: "Islamic Occult Sciences..." },
                  { key: "pages_ingested", label: "Page Range", placeholder: "e.g. 1-100" }
                ].map(field => (
                  <div key={field.key}>
                    <label className="font-inter text-[9px] uppercase tracking-widest block mb-1" style={{ color: G.dim }}>
                      {field.label}
                    </label>
                    <input
                      value={form[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                      style={{ background: G.bg, border: `1px solid ${G.border}` }}
                    />
                  </div>
                ))}
                <div>
                  <label className="font-inter text-[9px] uppercase tracking-widest block mb-1" style={{ color: G.dim }}>
                    Notes
                  </label>
                  <input
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: G.bg, border: `1px solid ${G.border}` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="font-inter text-[9px] uppercase tracking-widest block mb-1" style={{ color: G.dim }}>
                  PDF File *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white"
                  style={{ background: G.bg, border: `1px solid ${G.border}` }}
                />
                {form.file && (
                  <p className="font-inter text-[10px] mt-1" style={{ color: "#22c55e" }}>
                    ✓ {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(1)} MB)
                  </p>
                )}
              </div>

              <div className="p-3 rounded-lg mb-4" style={{ background: "rgba(212,175,55,0.08)", border: `1px solid ${G.border}` }}>
                <p className="font-inter text-xs" style={{ color: G.dim }}>
                  <strong style={{ color: G.text }}>ADDITIVE RULE:</strong> This manuscript will be added to the library.
                  All existing manuscripts and their rules will be preserved. Conflicting rules from different books
                  will be stored separately with source attribution.
                </p>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || !form.book_name || !form.file}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                style={{ background: uploading ? G.bg : "linear-gradient(135deg, #f6d860 0%, #c9901d 100%)", color: "#0d1b2a" }}
              >
                {uploading ? "⏳ Extracting all rules from PDF..." : "📖 Ingest Manuscript & Extract All Rules"}
              </button>

              {uploadResult && (
                <div className="mt-4 p-4 rounded-xl" style={{
                  background: uploadResult.success ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
                  border: `1px solid ${uploadResult.success ? "rgba(34,197,94,0.40)" : "rgba(239,68,68,0.40)"}`
                }}>
                  {uploadResult.success ? (
                    <div>
                      <p className="font-bold text-white mb-1">✅ {uploadResult.message}</p>
                      <p className="font-inter text-xs" style={{ color: G.dim }}>
                        Rules stored: {uploadResult.extraction?.stored_rules} | 
                        Categories: {uploadResult.extraction?.categories_covered?.join(', ')} |
                        Conflicts detected: {uploadResult.extraction?.conflicts_detected}
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-400">{uploadResult.error || uploadResult.message}</p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Library — Manuscripts */}
        <div>
          <h2 className="font-inter text-xs uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: G.dim }}>
            <Book className="w-4 h-4" />
            Indexed Manuscripts ({manuscripts.length})
          </h2>

          {loading ? (
            <div className="text-center py-10">
              <div className="w-6 h-6 border-2 border-t-yellow-400 border-r-transparent border-b-yellow-400 border-l-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-3">
              {manuscripts.map(ms => (
                <ManuscriptCard
                  key={ms.id}
                  manuscript={ms}
                  expanded={expandedBook === ms.id}
                  onToggle={() => setExpandedBook(expandedBook === ms.id ? null : ms.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Rule Query Tool */}
        <div className="rounded-2xl border p-6" style={{ background: "rgba(10,22,56,0.99)", borderColor: G.border }}>
          <h2 className="font-inter font-bold text-white flex items-center gap-2 mb-4">
            <Search className="w-5 h-5" style={{ color: G.text }} />
            Query Manuscript Rules
          </h2>

          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <div className="md:col-span-2">
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search rules: 'sunrise', 'Moon mansion', 'incense', 'Mars hour'..."
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: G.bg, border: `1px solid ${G.border}` }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: G.bg, border: `1px solid ${G.border}` }}
            >
              <option value="ALL">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleQuery}
            disabled={querying}
            className="px-6 py-2 rounded-xl font-bold text-sm"
            style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.borderHi}` }}
          >
            {querying ? "Searching..." : "Search Library"}
          </button>

          {queryResults && (
            <QueryResults results={queryResults} />
          )}
        </div>

      </div>
    </PageLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUSCRIPT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ManuscriptCard({ manuscript: ms, expanded, onToggle }) {
  const statusColor = STATUS_COLORS[ms.ingestion_status] || G.dim;

  return (
    <motion.div
      className="rounded-xl border overflow-hidden"
      style={{ background: "rgba(10,22,56,0.98)", borderColor: expanded ? G.borderHi : G.border }}
    >
      <button
        className="w-full flex items-start justify-between p-5 text-left"
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          <Book className="w-6 h-6 mt-0.5 flex-shrink-0" style={{ color: G.text }} />
          <div>
            <p className="font-bold text-white text-sm">{ms.book_name}</p>
            <p className="font-inter text-xs mt-0.5" style={{ color: G.dim }}>
              {ms.author} · {ms.language} · Pages {ms.pages_ingested}
            </p>
            <p className="font-inter text-[10px] mt-1" style={{ color: G.dim }}>
              {ms.tradition}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <div className="text-right">
            <p className="font-bold text-white">{(ms.total_rules_extracted || 0).toLocaleString()}</p>
            <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>Rules</p>
          </div>
          <div>
            <span className="font-inter text-[9px] font-bold px-2 py-1 rounded-lg" style={{ color: statusColor, background: `${statusColor}22` }}>
              {ms.ingestion_status}
            </span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4" style={{ color: G.dim }} /> : <ChevronDown className="w-4 h-4" style={{ color: G.dim }} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t px-5 pb-5"
            style={{ borderColor: G.border }}
          >
            <div className="pt-4 grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>Ingestion Date</p>
                <p className="font-inter text-sm text-white">{ms.ingestion_date}</p>
              </div>
              <div>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>PDF File</p>
                <p className="font-inter text-xs text-white break-all">{ms.pdf_filename || 'N/A'}</p>
              </div>
              {ms.notes && (
                <div className="md:col-span-2">
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>Notes</p>
                  <p className="font-inter text-xs text-white/80">{ms.notes}</p>
                </div>
              )}
              {ms.categories_covered && ms.categories_covered.length > 0 && (
                <div className="md:col-span-2">
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>Categories Covered</p>
                  <div className="flex flex-wrap gap-2">
                    {ms.categories_covered.map(cat => (
                      <span key={cat} className="px-2 py-1 rounded-lg font-inter text-[9px]" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                        {CATEGORY_LABELS[cat] || cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARABIC DATA DISPLAY
// ─────────────────────────────────────────────────────────────────────────────
function ArabicDataDisplay({ rule }) {
  try {
    const data = typeof rule.data_json === 'string' ? JSON.parse(rule.data_json) : rule.data_json;
    
    return (
      <div className="mb-3 space-y-2">
        {/* Arabic Letter */}
        {data.letter && (
          <div className="flex items-center gap-3">
            <ArabicLetterDisplay 
              letter={data.letter}
              malayalam={data.letter_malayalam}
              size="md"
            />
            <span className="font-inter text-xs" style={{ color: G.dim }}>
              {data.planet && `Planet: ${data.planet}`}
            </span>
          </div>
        )}
        
        {/* Lunar Mansion */}
        {data.lunar_mansion && (
          <LunarMansionDisplay
            arabic={data.lunar_mansion_arabic || data.lunar_mansion}
            name={data.lunar_mansion}
            malayalam={data.lunar_mansion_malayalam}
          />
        )}
        
        {/* Zodiac Sign */}
        {data.zodiac && (
          <ZodiacSignDisplay
            arabic={data.zodiac_arabic || data.zodiac}
            name={data.zodiac}
            malayalam={data.zodiac_malayalam}
          />
        )}
      </div>
    );
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY RESULTS
// ─────────────────────────────────────────────────────────────────────────────
function QueryResults({ results }) {
  const [expandedCat, setExpandedCat] = useState(null);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-inter text-sm text-white">
          Found <strong style={{ color: G.text }}>{results.total_rules}</strong> rules across{" "}
          <strong style={{ color: G.text }}>{results.categories_present?.length}</strong> categories
        </p>
        {results.conflicts?.length > 0 && (
          <span className="font-inter text-[9px] px-2 py-1 rounded-lg" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
            ⚠ {results.conflicts.length} Conflicts
          </span>
        )}
      </div>

      <div className="space-y-3">
        {Object.entries(results.rules_by_category || {}).map(([cat, rules]) => (
          <div key={cat} className="rounded-xl border overflow-hidden" style={{ borderColor: G.border }}>
            <button
              className="w-full flex items-center justify-between p-4 text-left"
              style={{ background: G.bg }}
              onClick={() => setExpandedCat(expandedCat === cat ? null : cat)}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" style={{ color: G.text }} />
                <span className="font-inter font-bold text-white text-sm">
                  {CATEGORY_LABELS[cat] || cat}
                </span>
                <span className="font-inter text-xs px-2 py-0.5 rounded-full" style={{ background: G.bgHi, color: G.text }}>
                  {rules.length}
                </span>
              </div>
              {expandedCat === cat ? <ChevronUp className="w-4 h-4" style={{ color: G.dim }} /> : <ChevronDown className="w-4 h-4" style={{ color: G.dim }} />}
            </button>

            <AnimatePresence>
              {expandedCat === cat && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="divide-y" style={{ borderColor: G.border }}>
                    {rules.map(rule => (
                      <div key={rule.id} className="p-4" style={{ borderColor: G.border }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-inter text-sm text-white mb-2">{rule.rule_summary}</p>
                            
                            {/* Display Arabic letters/glyphs properly */}
                            <ArabicDataDisplay rule={rule} />
                            
                            {rule.original_text && (
                              <ArabicTextWithTranslation 
                                arabic={rule.original_text}
                                className="mb-3"
                              />
                            )}
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="font-inter text-[8px] px-2 py-0.5 rounded" style={{ background: G.bg, color: G.dim }}>
                                📖 {rule.book_name}
                              </span>
                              {rule.page_number > 0 && (
                                <span className="font-inter text-[8px] px-2 py-0.5 rounded" style={{ background: G.bg, color: G.dim }}>
                                  p.{rule.page_number}
                                </span>
                              )}
                              {rule.chapter && (
                                <span className="font-inter text-[8px] px-2 py-0.5 rounded" style={{ background: G.bg, color: G.dim }}>
                                  §{rule.chapter}
                                </span>
                              )}
                              {rule.conflict_with && (
                                <span className="font-inter text-[8px] px-2 py-0.5 rounded" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
                                  ⚠ Conflict
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
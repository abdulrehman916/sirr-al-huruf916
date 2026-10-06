import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Search, Book, Moon, Sun, Star, Sparkles, Shield, Gem, Scroll } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  success: "rgba(34,197,94,0.70)",
  warning: "rgba(255,193,7,0.70)",
  danger: "rgba(239,68,68,0.70)"
};

const SEARCH_CATEGORIES = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'arabic_text', label: 'Arabic Text', icon: Book },
  { id: 'letters', label: 'Letters', icon: Sparkles },
  { id: 'mansions', label: 'Mansions', icon: Moon },
  { id: 'planets', label: 'Planets', icon: Sun },
  { id: 'zodiacs', label: 'Zodiac', icon: Star },
  { id: 'elements', label: 'Elements', icon: Sparkles },
  { id: 'saad_nahs', label: 'Saad/Nahs', icon: Shield },
  { id: 'metals', label: 'Metals', icon: Gem },
  { id: 'book_name', label: 'Book', icon: Scroll }
];

export default function ManuscriptAdvancedSearch() {
  const { isMalayalam } = useAstroClockLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchIn, setSearchIn] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedResult, setExpandedResult] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else if (searchTerm.length === 0) {
        setResults([]);
        setSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, searchIn]);

  async function performSearch() {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('searchManuscriptRules', {
        query: searchTerm,
        searchIn: searchIn
      });
      setResults(response.data.results || []);
      setSearched(true);
    } catch (err) {
      console.error("Search failed:", err);
    }
    setLoading(false);
  }

  return (
    <PageLayout>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-inter text-3xl font-bold uppercase tracking-widest" style={{ color: G.text }}>
              {isMalayalam ? "വിപുലമായ തിരയൽ" : "Advanced Manuscript Search"}
            </h1>
            <p className="font-inter text-sm mt-2" style={{ color: G.dim }}>
              {isMalayalam ? "അറബിക്, മലയാളം, ഇംഗ്ലീഷ് ഭാഷകളിൽ തിരയുക" : "Search across Arabic, Malayalam, and English"}
            </p>
          </motion.div>

          {/* Search Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border p-6"
            style={{ background: G.bg, borderColor: G.border }}
          >
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: G.dim }} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={isMalayalam ? "അറബിക് അക്ഷരങ്ങൾ, ഗ്രഹങ്ങൾ, നക്ഷത്രങ്ങൾ..." : "Search Arabic letters, planets, mansions..."}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-white outline-none text-lg"
                style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${G.border}` }}
                dir="auto"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {SEARCH_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = searchIn === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSearchIn(cat.id)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                      isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      background: isActive ? G.text : G.bg,
                      color: isActive ? '#0d1b2a' : G.text,
                      border: `1px solid ${isActive ? G.text : G.border}`
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {isMalayalam ? cat.label : cat.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Results */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-t-gold border-r-transparent border-b-gold border-l-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-inter text-sm" style={{ color: G.dim }}>
                {isMalayalam ? "തിരയുന്നു..." : "Searching..."}
              </p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4" style={{ color: G.dim }} />
              <p className="font-inter text-sm" style={{ color: G.dim }}>
                {isMalayalam ? "ഫലങ്ങൾ കണ്ടെത്തിയില്ല" : "No results found"}
              </p>
            </div>
          )}

          {!loading && searched && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-inter text-sm" style={{ color: G.dim }}>
                  {results.length} {isMalayalam ? "ഫലങ്ങൾ" : "results found"}
                </p>
              </div>

              {results.map((result, idx) => (
                <SearchResultCard
                  key={result.rule_id || idx}
                  result={result}
                  expanded={expandedResult === result.rule_id}
                  onToggle={() => setExpandedResult(expandedResult === result.rule_id ? null : result.rule_id)}
                  isMalayalam={isMalayalam}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

function SearchResultCard({ result, expanded, onToggle, isMalayalam }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: G.border, background: G.bg }}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start justify-between gap-4 text-left"
      >
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <p className="font-inter text-white text-sm flex-1">{result.summary}</p>
            {expanded ? (
              <span className="font-inter text-xs px-2 py-1 rounded" style={{ background: G.text, color: '#0d1b2a' }}>
                {isMalayalam ? "അടയ്ക്കുക" : "Close"}
              </span>
            ) : (
              <span className="font-inter text-xs px-2 py-1 rounded" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                {isMalayalam ? "കാണുക" : "View"}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="font-inter text-[8px] px-2 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.3)", color: G.dim }}>
              📖 {result.manuscript}
            </span>
            {result.page > 0 && (
              <span className="font-inter text-[8px] px-2 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.3)", color: G.dim }}>
                p.{result.page}
              </span>
            )}
            <span className="font-inter text-[8px] px-2 py-0.5 rounded" style={{ background: G.bg, color: G.text }}>
              {result.category}
            </span>
          </div>

          {result.match_reason && (
            <p className="font-inter text-xs" style={{ color: G.success }}>
              ✓ {isMalayalam ? "പൊരുത്തം:" : "Match:"} {result.match_reason}
            </p>
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-4 border-t space-y-4" style={{ borderColor: G.border }}>
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
                <p className="font-inter text-sm font-bold text-white/90">{result.author}</p>
              </div>
              <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                  📚 {isMalayalam ? "പുസ്തകം" : "Book"}
                </p>
                <p className="font-inter text-sm font-bold text-white/90">{result.manuscript}</p>
              </div>
              <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                  📄 {isMalayalam ? "പേജ്" : "Page"}
                </p>
                <p className="font-inter text-sm font-bold text-white/90">p. {result.page || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Original Arabic */}
          {result.original_text && (
            <div className="p-4 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
                {isMalayalam ? "യഥാർത്ഥ വാചകം" : "Original Arabic"}
              </p>
              <p className="font-amiri text-lg text-right leading-relaxed" style={{ color: G.text }} dir="rtl">
                {result.original_text}
              </p>
            </div>
          )}

          {/* Associations */}
          {result.associations && Object.keys(result.associations).length > 0 && (
            <div className="p-4 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
                {isMalayalam ? "ബന്ധങ്ങൾ" : "Associations"}
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {result.associations.letters?.length > 0 && (
                  <div>
                    <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                      {isMalayalam ? "അക്ഷരങ്ങൾ" : "Letters"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.associations.letters.map((l, i) => (
                        <span key={i} className="font-inter text-xs px-2 py-1 rounded" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.associations.mansions?.length > 0 && (
                  <div>
                    <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                      {isMalayalam ? "നക്ഷത്രങ്ങൾ" : "Mansions"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.associations.mansions.map((m, i) => (
                        <span key={i} className="font-inter text-xs px-2 py-1 rounded" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.associations.planets?.length > 0 && (
                  <div>
                    <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                      {isMalayalam ? "ഗ്രഹങ്ങൾ" : "Planets"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.associations.planets.map((p, i) => (
                        <span key={i} className="font-inter text-xs px-2 py-1 rounded" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.associations.zodiacs?.length > 0 && (
                  <div>
                    <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                      {isMalayalam ? "രാശികൾ" : "Zodiac"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.associations.zodiacs.map((z, i) => (
                        <span key={i} className="font-inter text-xs px-2 py-1 rounded" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                          {z}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.associations.elements?.length > 0 && (
                  <div>
                    <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                      {isMalayalam ? "മൂലകങ്ങൾ" : "Elements"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.associations.elements.map((e, i) => (
                        <span key={i} className="font-inter text-xs px-2 py-1 rounded" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.associations.saad_nahs && (
                  <div>
                    <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                      {isMalayalam ? "സഅദ്/നഹ്സ്" : "Saad/Nahs"}
                    </p>
                    <span className="font-inter text-xs px-2 py-1 rounded" style={{ 
                      background: result.associations.saad_nahs === 'Saad' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                      color: result.associations.saad_nahs === 'Saad' ? '#22c55e' : '#ef4444',
                      border: `1px solid ${result.associations.saad_nahs === 'Saad' ? '#22c55e' : '#ef4444'}`
                    }}>
                      {result.associations.saad_nahs}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
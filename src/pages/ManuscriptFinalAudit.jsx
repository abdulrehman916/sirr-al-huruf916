import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Book, FileText, Layers, CheckCircle, AlertTriangle, XCircle, Database, Hash, FolderOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";

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
  successBorder: "rgba(34,197,94,0.60)",
  warning: "rgba(251,191,36,0.15)",
  warningBorder: "rgba(251,191,36,0.60)",
  error: "rgba(239,68,68,0.15)",
  errorBorder: "rgba(239,68,68,0.60)"
};

export default function ManuscriptFinalAudit() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    runAudit();
  }, []);

  async function runAudit() {
    try {
      setLoading(true);
      // Run verifyManuscriptDatabase
      const verifyRes = await base44.functions.invoke('verifyManuscriptDatabase', {});
      const verifyData = verifyRes.data.verification_audit;

      // Get manuscript library details
      const manuscripts = await base44.entities.ManuscriptLibrary.list();
      const rules = await base44.entities.ManuscriptRule.list();
      
      const categories = new Set(rules.map(r => r.category));
      const orphaned = rules.filter(r => !manuscripts.some(m => m.book_id === r.manuscript_id));
      
      // Calculate page coverage
      const allPages = rules.map(r => r.page_number).filter(p => p != null);
      const minPage = Math.min(...allPages);
      const maxPage = Math.max(...allPages);
      const uniquePages = new Set(allPages).size;
      const expectedPages = maxPage - minPage + 1;
      const coveragePct = Math.round((uniquePages / expectedPages) * 100);

      setAudit({
        total_manuscripts: manuscripts.length,
        manuscript_details: manuscripts.map(m => ({
          book_id: m.book_id,
          book_name: m.book_name,
          author: m.author,
          pages_ingested: m.pages_ingested,
          total_rules: m.total_rules_extracted,
          categories: m.categories_covered,
          status: m.ingestion_status
        })),
        total_rules: verifyData.total_manuscript_rules,
        total_categories: categories.size,
        category_list: Array.from(categories).sort(),
        category_breakdown: verifyData.category_breakdown,
        page_coverage: {
          min_page: minPage,
          max_page: maxPage,
          unique_pages: uniquePages,
          expected_pages: expectedPages,
          coverage_percentage: coveragePct,
          missing_pages: verifyData.pages_with_zero_rules_list
        },
        duplicates: {
          count: verifyData.duplicate_rule_ids.length,
          details: verifyData.duplicate_rule_ids_list.slice(0, 10)
        },
        orphaned: {
          count: orphaned.length,
          details: orphaned.slice(0, 10).map(r => ({ rule_id: r.rule_id, manuscript_id: r.manuscript_id }))
        },
        rules_missing_citation: verifyData.rules_missing_page_citation,
        integrity_status: verifyData.duplicate_rule_ids.length === 0 && orphaned.length === 0 && verifyData.rules_missing_page_citation === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-malayalam-md text-gold">Running Final Manuscript Audit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto p-6 rounded-xl border" style={{ background: G.error, borderColor: G.errorBorder }}>
          <h2 className="font-malayalam-lg text-red-400 mb-2">Audit Failed</h2>
          <p className="font-inter text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-malayalam-lg uppercase tracking-widest mb-2" style={{ color: G.text }}>
            Final Manuscript Audit Report
          </h1>
          <p className="font-inter text-sm" style={{ color: G.dim }}>
            Read-only database integrity verification
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={Database}
            label="Total Manuscripts"
            value={audit.total_manuscripts}
            color={G.text}
          />
          <SummaryCard
            icon={FileText}
            label="Total Rules"
            value={audit.total_rules}
            color={G.text}
          />
          <SummaryCard
            icon={Layers}
            label="Total Categories"
            value={audit.total_categories}
            color={G.text}
          />
          <SummaryCard
            icon={audit.integrity_status === 'HEALTHY' ? CheckCircle : AlertTriangle}
            label="Integrity Status"
            value={audit.integrity_status}
            color={audit.integrity_status === 'HEALTHY' ? '#22c55e' : '#fbbf24'}
          />
        </div>

        {/* Manuscript Details */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-xl border"
          style={{ background: G.bg, borderColor: G.border }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-6 h-6" style={{ color: G.text }} />
            <h2 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
              Manuscript Library
            </h2>
          </div>

          <div className="space-y-4">
            {audit.manuscript_details.map((m, idx) => (
              <div key={idx} className="p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>Book Name</p>
                    <p className="font-malayalam-sm font-bold text-white">{m.book_name}</p>
                    {m.author && <p className="font-inter text-xs" style={{ color: G.dim }}>{m.author}</p>}
                  </div>
                  <div>
                    <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>Pages Ingested</p>
                    <p className="font-malayalam-sm text-white">{m.pages_ingested}</p>
                    <p className="font-inter text-[9px]" style={{ color: m.status === 'FULLY_INGESTED' ? '#22c55e' : '#fbbf24' }}>
                      {m.status}
                    </p>
                  </div>
                  <div>
                    <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>Rules Extracted</p>
                    <p className="font-malayalam-sm font-bold text-white">{m.total_rules}</p>
                    <p className="font-inter text-[9px]" style={{ color: G.dim }}>
                      {m.categories?.length || 0} categories
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Page Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 p-6 rounded-xl border"
          style={{ background: G.bg, borderColor: G.border }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Hash className="w-6 h-6" style={{ color: G.text }} />
            <h2 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
              Page Coverage
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <CoverageStat label="Page Range" value={`p.${audit.page_coverage.min_page}–${audit.page_coverage.max_page}`} />
            <CoverageStat label="Unique Pages" value={audit.page_coverage.unique_pages} />
            <CoverageStat label="Coverage" value={`${audit.page_coverage.coverage_percentage}%`} />
            <CoverageStat 
              label="Missing Pages" 
              value={audit.page_coverage.missing_pages.length}
              highlight={audit.page_coverage.missing_pages.length > 0}
            />
          </div>

          {audit.page_coverage.missing_pages.length > 0 && (
            <div className="mt-4 p-3 rounded-lg" style={{ background: G.warning, border: `1px solid ${G.warningBorder}` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: '#fbbf24' }}>
                Pages with Zero Rules
              </p>
              <p className="font-malayalam-sm text-white">{audit.page_coverage.missing_pages.join(', ')}</p>
            </div>
          )}
        </motion.div>

        {/* Integrity Issues */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Duplicates */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border"
            style={{ background: audit.duplicates.count > 0 ? G.warning : G.success, borderColor: audit.duplicates.count > 0 ? G.warningBorder : G.successBorder }}
          >
            <div className="flex items-center gap-3 mb-3">
              {audit.duplicates.count > 0 ? <AlertTriangle className="w-5 h-5" style={{ color: '#fbbf24' }} /> : <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />}
              <h3 className="font-inter text-[9px] uppercase tracking-widest" style={{ color: audit.duplicates.count > 0 ? '#fbbf24' : '#22c55e' }}>
                Duplicate Rule IDs
              </h3>
            </div>
            <p className="font-malayalam-lg font-bold text-white mb-2">{audit.duplicates.count}</p>
            {audit.duplicates.count > 0 && (
              <p className="font-inter text-xs text-white/70">
                First 10 shown
              </p>
            )}
          </motion.div>

          {/* Orphaned */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-xl border"
            style={{ background: audit.orphaned.count > 0 ? G.error : G.success, borderColor: audit.orphaned.count > 0 ? G.errorBorder : G.successBorder }}
          >
            <div className="flex items-center gap-3 mb-3">
              {audit.orphaned.count > 0 ? <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} /> : <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />}
              <h3 className="font-inter text-[9px] uppercase tracking-widest" style={{ color: audit.orphaned.count > 0 ? '#ef4444' : '#22c55e' }}>
                Orphaned Records
              </h3>
            </div>
            <p className="font-malayalam-lg font-bold text-white mb-2">{audit.orphaned.count}</p>
            {audit.orphaned.count > 0 && (
              <p className="font-inter text-xs text-white/70">
                manuscript_id not in library
              </p>
            )}
          </motion.div>

          {/* Missing Citations */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl border"
            style={{ background: audit.rules_missing_citation > 0 ? G.error : G.success, borderColor: audit.rules_missing_citation > 0 ? G.errorBorder : G.successBorder }}
          >
            <div className="flex items-center gap-3 mb-3">
              {audit.rules_missing_citation > 0 ? <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} /> : <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />}
              <h3 className="font-inter text-[9px] uppercase tracking-widest" style={{ color: audit.rules_missing_citation > 0 ? '#ef4444' : '#22c55e' }}>
                Missing Page Citations
              </h3>
            </div>
            <p className="font-malayalam-lg font-bold text-white mb-2">{audit.rules_missing_citation}</p>
            {audit.rules_missing_citation > 0 && (
              <p className="font-inter text-xs text-white/70">
                Rules without page_number
              </p>
            )}
          </motion.div>
        </div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8 p-6 rounded-xl border"
          style={{ background: G.bg, borderColor: G.border }}
        >
          <div className="flex items-center gap-3 mb-4">
            <FolderOpen className="w-6 h-6" style={{ color: G.text }} />
            <h2 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
              Category Breakdown
            </h2>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(audit.category_breakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count], idx) => (
                <div key={cat} className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>{cat}</p>
                  <p className="font-malayalam-sm font-bold text-white">{count}</p>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl border text-center"
          style={{ background: G.bg, borderColor: G.border }}
        >
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            Audit Completed
          </p>
          <p className="font-malayalam-sm text-white/70">
            Database integrity verified. No modifications made.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-6 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-6 h-6" style={{ color }} />
        <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{label}</p>
      </div>
      <p className="font-malayalam-lg font-bold text-white">{value}</p>
    </div>
  );
}

function CoverageStat({ label, value, highlight }) {
  return (
    <div className="p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${highlight ? G.warningBorder : G.border}` }}>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>{label}</p>
      <p className={`font-malayalam-md font-bold ${highlight ? 'text-yellow-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}
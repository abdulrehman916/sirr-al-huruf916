import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Book, Filter, CheckCircle, XCircle, AlertTriangle, Layers, FileText, Hash, Database, TrendingUp, ShieldOff, Link } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  success: "rgba(34,197,94,0.15)",
  successBorder: "rgba(34,197,94,0.60)",
  warning: "rgba(251,191,36,0.15)",
  warningBorder: "rgba(251,191,36,0.60)",
  exclude: "rgba(239,68,68,0.15)",
  excludeBorder: "rgba(239,68,68,0.60)"
};

export default function AstrologyOnlyAudit() {
  const [approved, setApproved] = useState(false);
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    runAudit();
  }, []);

  async function runAudit() {
    try {
      setLoading(true);
      setError(null);
      
      // Call the backend audit function with PDF URLs
      const result = await base44.functions.invoke('auditAstrologyIngestion', {
        pdf_urls: [
          "https://media.base44.com/files/public/69f3dea51ce92ee2fde20be6/77e45391d_E95C54E0AD505E43-1-50.pdf",
          "https://media.base44.com/files/public/69f3dea51ce92ee2fde20be6/2af646637_E95C54E0AD505E43-51-100.pdf"
        ]
      });
      
      setAudit(result.data.broad_astrology_audit);
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
          <p className="font-malayalam-md text-gold">Running Broad Astrology Audit...</p>
          <p className="font-inter text-sm text-white/60 mt-2">Detecting all astrological correspondences</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto p-6 rounded-xl border" style={{ background: G.exclude, borderColor: G.excludeBorder }}>
          <h2 className="font-malayalam-lg text-red-400 mb-2">Audit Failed</h2>
          <p className="font-inter text-white/80 mb-4">{error}</p>
          <button
            onClick={runAudit}
            className="px-6 py-3 rounded-lg font-malayalam-sm text-white"
            style={{ background: G.border }}
          >
            Retry Audit
          </button>
        </div>
      </div>
    );
  }

  if (!audit) {
    return null;
  }

  const totalRules = audit.estimated_operations.records_to_create;
  const uniquePages = audit.estimated_operations.expected_page_coverage;

  if (approved) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl text-center p-8 rounded-xl border"
          style={{ background: G.success, borderColor: G.successBorder }}
        >
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#22c55e' }} />
          <h2 className="font-malayalam-lg text-white mb-2">Audit Approved</h2>
          <p className="font-inter text-white/80 mb-4">
            Ready for broad astrology ingestion. {totalRules} rules will be created.
          </p>
          <button
            onClick={() => setApproved(false)}
            className="px-6 py-3 rounded-lg font-malayalam-sm text-white"
            style={{ background: G.border }}
          >
            Back to Audit
          </button>
        </motion.div>
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
            Broad Astrology Correspondences Audit
          </h1>
          <p className="font-inter text-sm" style={{ color: G.dim }}>
            Detecting ALL content with astrological dependencies and celestial correspondences
          </p>
        </motion.div>

        {/* Manuscript Info */}
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
              Manuscript Information
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoStat label="Book" value={audit.manuscript_info.book_name} />
            <InfoStat label="Author" value={audit.manuscript_info.author} />
            <InfoStat label="PDFs" value={audit.extraction_results.pdfs_processed.toString()} />
            <InfoStat label="Proposed ID" value={audit.manuscript_info.proposed_id} />
          </div>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={FileText}
            label="Estimated Rules"
            value={totalRules}
            color="#22c55e"
            subtitle="To be created"
          />
          <SummaryCard
            icon={Hash}
            label="Pages with Astro Content"
            value={uniquePages}
            color={G.text}
            subtitle={`${audit.estimated_operations.coverage_percentage}% coverage`}
          />
          <SummaryCard
            icon={Layers}
            label="Categories Detected"
            value={audit.extraction_results.detected_categories.length}
            color={G.text}
            subtitle={`${audit.database_comparison.new_categories_to_add.length} new`}
          />
          <SummaryCard
            icon={Database}
            label="Current Database"
            value={audit.database_comparison.existing_rules}
            color={G.text}
            subtitle={`${audit.database_comparison.existing_manuscripts} manuscripts`}
          />
        </div>

        {/* Detection Scope */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 p-6 rounded-xl border"
          style={{ background: G.bg, borderColor: G.border }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-6 h-6" style={{ color: G.text }} />
            <h2 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
              Detection Scope — ALL Astrological Dependencies
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-3" style={{ color: '#22c55e' }}>
                INCLUDED — Celestial Correspondences
              </p>
              <ul className="space-y-2 font-inter text-sm text-white/80">
                {audit.detection_scope.includes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: '#22c55e' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
                Extraction Results
              </p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-inter text-xs" style={{ color: G.dim }}>Total Pages Scanned</span>
                  <span className="font-malayalam-sm text-white">{audit.extraction_results.total_pages_scanned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-inter text-xs" style={{ color: G.dim }}>High Astro Dependency</span>
                  <span className="font-malayalam-sm text-white">{audit.extraction_results.high_astro_dependency_pages} pages</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-inter text-xs" style={{ color: G.dim }}>Medium Astro Dependency</span>
                  <span className="font-malayalam-sm text-white">{audit.extraction_results.medium_astro_dependency_pages} pages</span>
                </div>
                <div className="pt-2 border-t" style={{ borderColor: G.faint }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
                    Detected Categories
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {audit.extraction_results.detected_categories.map((cat, idx) => (
                      <span key={idx} className="px-2 py-1 rounded text-[7px] uppercase" style={{ background: G.border, color: G.text }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Correspondence Links */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 rounded-xl border"
          style={{ background: G.bg, borderColor: G.border }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Link className="w-6 h-6" style={{ color: G.text }} />
            <h2 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
              Correspondence Links to Create
            </h2>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(audit.correspondence_links_to_create)
              .sort((a, b) => b[1] - a[1])
              .map(([link, count], idx) => (
                <div key={link} className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
                  <p className="font-inter text-[7px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    {link.replace(/_/g, ' ')}
                  </p>
                  <p className="font-malayalam-md font-bold text-white">{count}</p>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Estimated Operations */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8 p-6 rounded-xl border"
          style={{ background: G.bg, borderColor: G.border }}
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6" style={{ color: G.text }} />
            <h2 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
              Estimated Database Operations
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <OperationStat
              label="Records to Create"
              value={audit.estimated_operations.records_to_create}
              color="#22c55e"
              description="New astrology rules"
            />
            <OperationStat
              label="Records to Update"
              value={audit.estimated_operations.records_to_update}
              color={G.dim}
              description="No updates (additive only)"
            />
            <OperationStat
              label="Records to Delete"
              value={audit.estimated_operations.records_to_delete}
              color={G.dim}
              description="Never delete"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t" style={{ borderColor: G.faint }}>
            <OperationStat
              label="Alternate Source Entries"
              value={audit.estimated_operations.alternate_source_entries}
              color="#fbbf24"
              description="Overlaps with existing manuscripts"
            />
            <OperationStat
              label="Manuscript Disagreements"
              value={audit.estimated_operations.manuscript_disagreement_entries}
              color="#fbbf24"
              description="Conflicting astrological opinions"
            />
          </div>
        </motion.div>

        {/* Database Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 p-6 rounded-xl border"
          style={{ background: G.bg, borderColor: G.border }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6" style={{ color: G.text }} />
            <h2 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
              Database Comparison
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
                Existing Categories
              </p>
              <p className="font-malayalam-lg font-bold text-white mb-2">
                {audit.database_comparison.existing_categories.length}
              </p>
              <div className="flex flex-wrap gap-1">
                {audit.database_comparison.existing_categories.slice(0, 8).map((cat, idx) => (
                  <span key={idx} className="px-2 py-1 rounded text-[7px] uppercase" style={{ background: G.border, color: G.text }}>
                    {cat.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {audit.database_comparison.new_categories_to_add.length > 0 && (
              <div className="p-4 rounded-lg" style={{ background: G.success, border: `1px solid ${G.successBorder}` }}>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: '#22c55e' }}>
                  New Categories to Add
                </p>
                <p className="font-malayalam-lg font-bold text-white mb-2">
                  {audit.database_comparison.new_categories_to_add.length}
                </p>
                <div className="flex flex-wrap gap-1">
                  {audit.database_comparison.new_categories_to_add.map((cat, idx) => (
                    <span key={idx} className="px-2 py-1 rounded text-[7px] uppercase" style={{ background: '#22c55e', color: '#fff' }}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
                Categories Expanded
              </p>
              <p className="font-malayalam-lg font-bold text-white mb-2">
                {audit.database_comparison.categories_expanded.length}
              </p>
              <p className="font-inter text-[9px]" style={{ color: G.dim }}>
                Existing categories receiving new rules
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sample Content */}
        {audit.extraction_results.sample_content && audit.extraction_results.sample_content.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8 p-6 rounded-xl border"
            style={{ background: G.bg, borderColor: G.border }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6" style={{ color: G.text }} />
              <h2 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
                Sample Detected Content (First 10)
              </h2>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {audit.extraction_results.sample_content.slice(0, 10).map((sample, idx) => (
                <div key={idx} className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.text }}>
                      Page {sample.page}
                    </p>
                    {sample.astro_dependency && (
                      <span className={`px-2 py-0.5 rounded text-[7px] uppercase ${
                        sample.astro_dependency === 'HIGH' ? 'bg-green-900 text-green-300' :
                        sample.astro_dependency === 'MEDIUM' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {sample.astro_dependency}
                      </span>
                    )}
                  </div>
                  {sample.celestial_bodies && sample.celestial_bodies.length > 0 && (
                    <p className="font-inter text-xs text-white/70 mb-1">
                      <span style={{ color: G.dim }}>Celestial:</span> {sample.celestial_bodies.join(', ')}
                    </p>
                  )}
                  {sample.timing_refs && sample.timing_refs.length > 0 && (
                    <p className="font-inter text-xs text-white/70 mb-1">
                      <span style={{ color: G.dim }}>Timing:</span> {sample.timing_refs.join(', ')}
                    </p>
                  )}
                  {sample.raw_text && (
                    <p className="font-inter text-xs text-white/60 mt-2 italic">
                      "{sample.raw_text.substring(0, 150)}..."
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Approval Section */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-8 rounded-xl border text-center"
          style={{ background: G.bg, borderColor: G.border }}
        >
          <h3 className="font-malayalam-md uppercase tracking-widest mb-4" style={{ color: G.text }}>
            Ready for Ingestion?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 mb-6 max-w-3xl mx-auto">
            <div className="p-4 rounded-lg" style={{ background: G.success, border: `1px solid ${G.successBorder}` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: '#22c55e' }}>Total Rules</p>
              <p className="font-malayalam-lg font-bold text-white">{totalRules}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>Pages</p>
              <p className="font-malayalam-lg font-bold text-white">{uniquePages}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>Coverage</p>
              <p className="font-malayalam-lg font-bold text-white">{audit.estimated_operations.coverage_percentage}%</p>
            </div>
          </div>
          <button
            onClick={() => setApproved(true)}
            className="px-8 py-4 rounded-xl font-malayalam-md uppercase tracking-widest text-white font-bold"
            style={{
              background: "linear-gradient(135deg, #f6d860 0%, #c9901d 100%)",
              boxShadow: "0 0 24px rgba(212,175,55,0.45)"
            }}
          >
            Approve & Proceed to Ingestion
          </button>
          <p className="font-inter text-[9px] uppercase tracking-widest mt-4" style={{ color: G.dim }}>
            This will create {totalRules} astrology rules with extensive correspondence links. No deletions. No overwrites.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, subtitle }) {
  return (
    <div className="p-6 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-6 h-6" style={{ color }} />
        <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{label}</p>
      </div>
      <p className="font-malayalam-lg font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="font-inter text-[9px]" style={{ color: G.dim }}>{subtitle}</p>}
    </div>
  );
}

function InfoStat({ label, value }) {
  return (
    <div>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>{label}</p>
      <p className="font-malayalam-sm text-white">{value}</p>
    </div>
  );
}

function OperationStat({ label, value, color, description }) {
  return (
    <div>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>{label}</p>
      <p className="font-malayalam-lg font-bold mb-1" style={{ color }}>{value}</p>
      <p className="font-inter text-[9px]" style={{ color: G.dim }}>{description}</p>
    </div>
  );
}
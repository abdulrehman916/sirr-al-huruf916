import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Moon, CheckCircle, AlertCircle, Book, Star } from "lucide-react";
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

export default function ManazilQualityAudit() {
  const { isMalayalam } = useAstroClockLanguage();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMansion, setExpandedMansion] = useState(null);

  useEffect(() => {
    runAudit();
  }, []);

  async function runAudit() {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('auditManazilQuality', {});
      setAudit(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-inter text-white/70">{isMalayalam ? "പരിശോധിക്കുന്നു..." : "Running quality audit..."}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 rounded-xl border" style={{ borderColor: G.danger, background: "rgba(239,68,68,0.1)" }}>
            <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: G.danger }} />
            <p className="font-inter text-white/90">Audit failed: {error}</p>
            <button onClick={runAudit} className="mt-4 px-6 py-2 rounded-lg" style={{ background: G.danger, color: "#fff" }}>
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-inter text-3xl font-bold uppercase tracking-widest" style={{ color: G.text }}>
              {isMalayalam ? "28 ചാന്ദ്ര നക്ഷത്രങ്ങളുടെ ഗുണനിലവാര പരിശോധന" : "28 Lunar Mansions Quality Audit"}
            </h1>
            <p className="font-inter text-sm mt-2" style={{ color: G.dim }}>
              {isMalayalam ? "ഹസ്തലിഖിത ഡാറ്റാബേസ് പൂർണ്ണത" : "Manuscript Database Completeness"}
            </p>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard
              label={isMalayalam ? "ആകെ നക്ഷത്രങ്ങൾ" : "Total Mansions"}
              value={audit.summary.total_mansions}
              color={G.text}
            />
            <SummaryCard
              label={isMalayalam ? "റെക്കോർഡുകൾ ഉള്ളവ" : "With Records"}
              value={audit.summary.mansions_with_records}
              color={G.success}
            />
            <SummaryCard
              label={isMalayalam ? "പൂർണ്ണമായവ" : "Complete (100%)"}
              value={audit.summary.mansions_complete}
              color={G.success}
            />
            <SummaryCard
              label={isMalayalam ? "ഭാഗികമായവ" : "Partial"}
              value={audit.summary.mansions_partial}
              color={G.warning}
            />
            <SummaryCard
              label={isMalayalam ? "ശരാശരി" : "Avg Score"}
              value={`${audit.summary.average_completeness}%`}
              color={G.text}
            />
          </div>

          {/* Mansion Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border p-6"
            style={{ background: G.bg, borderColor: G.border }}
          >
            <h2 className="font-inter text-xl font-bold uppercase tracking-widest mb-6" style={{ color: G.text }}>
              {isMalayalam ? "ഓരോ നക്ഷത്രത്തിന്റെയും വിശദാംശങ്ങൾ" : "Mansion-by-Mansion Breakdown"}
            </h2>

            <div className="space-y-3">
              {audit.mansionData.map((mansion, idx) => (
                <MansionCard
                  key={idx}
                  mansion={mansion}
                  expanded={expandedMansion === idx}
                  onToggle={() => setExpandedMansion(expandedMansion === idx ? null : idx)}
                  isMalayalam={isMalayalam}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border p-4 text-center"
      style={{ background: "rgba(0,0,0,0.3)", borderColor: G.faint }}
    >
      <p className="font-inter text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="font-inter text-xs mt-1" style={{ color: G.dim }}>{label}</p>
    </motion.div>
  );
}

function MansionCard({ mansion, expanded, onToggle, isMalayalam }) {
  const completenessColor = 
    mansion.completeness_score === 100 ? G.success :
    mansion.completeness_score >= 50 ? G.warning : G.danger;

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: G.border }}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between"
        style={{ background: mansion.records.length > 0 ? G.bg : "rgba(0,0,0,0.2)" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="font-inter font-bold text-xs text-white/60 px-2 py-1 rounded" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${G.faint}` }}>
              {mansion.number}
            </span>
          </div>
          <div>
            <p className="font-amiri text-3xl font-bold" style={{ color: G.text }} dir="rtl">{mansion.arabic_name}</p>
            <p className="font-inter text-xs" style={{ color: G.dim }}>
              {mansion.records.length} {isMalayalam ? "രേഖകൾ" : "records"} · 
              <span style={{ color: completenessColor }}> {mansion.completeness_score}%</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {mansion.completeness_score === 100 && (
            <CheckCircle className="w-5 h-5" style={{ color: G.success }} />
          )}
          {mansion.missing_fields.length > 0 && (
            <AlertCircle className="w-5 h-5" style={{ color: G.warning }} />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-4 border-t space-y-4" style={{ borderColor: G.border }}>
          {/* Completeness Fields */}
          <div>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "പൂർണ്ണത" : "Field Completeness"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(mansion.fields).map(([field, hasValue]) => (
                <div
                  key={field}
                  className="p-2 rounded text-center text-xs"
                  style={{
                    background: hasValue ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    border: `1px solid ${hasValue ? G.success : G.danger}`,
                    color: hasValue ? G.success : G.danger
                  }}
                >
                  {hasValue ? '✓' : '✗'} {field.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>

          {/* Missing Fields */}
          {mansion.missing_fields.length > 0 && (
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.danger }}>
                {isMalayalam ? "കാണാത്തവ" : "Missing Fields"}
              </p>
              <div className="flex flex-wrap gap-2">
                {mansion.missing_fields.map((field, i) => (
                  <span
                    key={i}
                    className="font-inter text-xs px-2 py-1 rounded"
                    style={{ background: "rgba(239,68,68,0.2)", color: G.danger, border: `1px solid ${G.danger}` }}
                  >
                    {field.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Manuscript Sources */}
          {mansion.sources.length > 0 && (
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
                📖 {isMalayalam ? "സ്രോതസ്സുകൾ" : "Manuscript Sources"}
              </p>
              <div className="space-y-2">
                {mansion.sources.map((source, i) => (
                  <div
                    key={i}
                    className="p-3 rounded flex items-center gap-3"
                    style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${G.faint}` }}
                  >
                    <Book className="w-4 h-4" style={{ color: G.dim }} />
                    <div className="flex-1">
                      <p className="font-inter text-sm font-bold text-white/90">{source.book}</p>
                      <p className="font-inter text-xs text-white/60">
                        {source.author} · p. {source.page}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { FileText, CheckCircle, AlertCircle, Database, TrendingUp, Wand2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";

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

export default function ManuscriptRuleAudit() {
  const [audit, setAudit] = useState(null);
  const [prevAudit, setPrevAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(null);
  const [enrichmentDone, setEnrichmentDone] = useState(false);

  useEffect(() => {
    runAudit();
  }, []);

  async function runAudit() {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('auditManuscriptRuleCompleteness', {});
      setPrevAudit(audit);
      setAudit(response.data.audit);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runEnrichment() {
    try {
      setEnriching(true);
      setEnrichmentProgress({ processed: 0, enriched: 0, skipped: 0, total: 0 });
      
      let skip = 0;
      let totalEnriched = 0;
      let totalSkipped = 0;
      let done = false;

      while (!done && enriching) {
        const response = await base44.functions.invoke('enrichManuscriptRules', { skip, batchSize: 5 });
        
        if (response.data.error) {
          throw new Error(response.data.error);
        }

        skip = response.data.nextSkip || skip + 5;
        totalEnriched += response.data.enriched || 0;
        totalSkipped += response.data.skipped || 0;
        done = response.data.done;

        setEnrichmentProgress({
          processed: response.data.processed || skip,
          enriched: totalEnriched,
          skipped: totalSkipped,
          total: response.data.total || 962,
          percentage: Math.round(((response.data.processed || skip) / (response.data.total || 962)) * 100)
        });

        if (!done) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setEnrichmentDone(true);
      setEnriching(false);
      await runAudit();
    } catch (err) {
      setError('Enrichment failed: ' + err.message);
      setEnriching(false);
    }
  }

  function stopEnrichment() {
    setEnriching(false);
  }

  function getPercentageIncrease(prev, curr, total) {
    if (!prev || prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / total) * 100);
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-inter text-white/70">Running database audit...</p>
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
              ManuscriptRule Database Audit
            </h1>
            <p className="font-inter text-sm mt-2" style={{ color: G.dim }}>
              Completeness Report - {new Date().toLocaleDateString()}
            </p>
            
            {!enrichmentDone && !enriching && (
              <button
                onClick={runEnrichment}
                className="mt-4 px-6 py-3 rounded-lg flex items-center gap-2 mx-auto font-bold"
                style={{ background: G.text, color: '#0d1b2a' }}
              >
                <Wand2 className="w-5 h-5" />
                Auto-Enrich Associations
              </button>
            )}

            {enriching && enrichmentProgress && (
              <div className="mt-4 max-w-xl mx-auto">
                <div className="p-4 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                  <p className="font-inter text-sm font-bold mb-2" style={{ color: G.text }}>
                    Enrichment in Progress: {enrichmentProgress.percentage}%
                  </p>
                  <div className="h-3 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{ width: `${enrichmentProgress.percentage}%`, background: G.success }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div>
                      <p className="font-inter text-xs" style={{ color: G.dim }}>Processed</p>
                      <p className="font-inter text-lg font-bold" style={{ color: G.text }}>{enrichmentProgress.processed}</p>
                    </div>
                    <div>
                      <p className="font-inter text-xs" style={{ color: G.success }}>Enriched</p>
                      <p className="font-inter text-lg font-bold" style={{ color: G.success }}>{enrichmentProgress.enriched}</p>
                    </div>
                    <div>
                      <p className="font-inter text-xs" style={{ color: G.dim }}>Skipped</p>
                      <p className="font-inter text-lg font-bold" style={{ color: G.dim }}>{enrichmentProgress.skipped}</p>
                    </div>
                  </div>
                  <button
                    onClick={stopEnrichment}
                    className="mt-3 px-4 py-2 rounded-lg text-xs font-bold"
                    style={{ background: G.danger, color: "#fff" }}
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}

            {enrichmentDone && prevAudit && (
              <div className="mt-4 max-w-4xl mx-auto">
                <div className="p-6 rounded-lg" style={{ background: "rgba(34,197,94,0.15)", border: `1px solid ${G.success}` }}>
                  <h3 className="font-inter text-lg font-bold mb-4" style={{ color: G.success }}>
                    ✓ Enrichment Complete!
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <ImprovementCard label="Letters" prev={prevAudit.with_arabic_letter} curr={audit.with_arabic_letter} total={audit.total_records} />
                    <ImprovementCard label="Planets" prev={prevAudit.with_planet} curr={audit.with_planet} total={audit.total_records} />
                    <ImprovementCard label="Zodiac" prev={prevAudit.with_zodiac} curr={audit.with_zodiac} total={audit.total_records} />
                    <ImprovementCard label="Mansions" prev={prevAudit.with_lunar_mansion} curr={audit.with_lunar_mansion} total={audit.total_records} />
                    <ImprovementCard label="Elements" prev={prevAudit.with_element} curr={audit.with_element} total={audit.total_records} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <p className="font-inter text-xs" style={{ color: G.dim }}>Total Enriched</p>
                      <p className="font-inter text-2xl font-bold" style={{ color: G.success }}>{enrichmentProgress?.enriched || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <p className="font-inter text-xs" style={{ color: G.dim }}>Still Need Review</p>
                      <p className="font-inter text-2xl font-bold" style={{ color: G.warning }}>{audit.total_records - audit.with_arabic_letter - audit.with_planet}</p>
                    </div>
                    <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <p className="font-inter text-xs" style={{ color: G.dim }}>New Score</p>
                      <p className="font-inter text-2xl font-bold" style={{ color: G.text }}>{audit.completeness_score}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {enrichmentDone && !prevAudit && (
              <div className="mt-4 px-6 py-3 rounded-lg" style={{ background: "rgba(34,197,94,0.2)", color: "#86efac" }}>
                ✓ Enrichment complete! Run audit again to see comparison.
              </div>
            )}
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard
              icon={Database}
              label="Total Records"
              value={audit.total_records}
              color={G.text}
            />
            <SummaryCard
              icon={CheckCircle}
              label="Completeness Score"
              value={`${audit.completeness_score}%`}
              color={audit.completeness_score >= 70 ? G.success : audit.completeness_score >= 40 ? G.warning : G.danger}
            />
            <SummaryCard
              icon={FileText}
              label="With Arabic Text"
              value={audit.with_original_arabic}
              color={audit.with_original_arabic === audit.total_records ? G.success : G.text}
            />
            <SummaryCard
              icon={TrendingUp}
              label="Auto-Extracted"
              value={enrichmentProgress?.enriched || '-'}
              color={G.success}
            />
          </div>

          {/* Field Completeness */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border p-6"
            style={{ background: G.bg, borderColor: G.faint }}
          >
            <h2 className="font-inter text-xl font-bold uppercase tracking-widest mb-6" style={{ color: G.text }}>
              Field Completeness
            </h2>
            <div className="space-y-4">
              <FieldBar label="Original Arabic Text" count={audit.with_original_arabic} total={audit.total_records} color={G.success} />
              <FieldBar label="Malayalam Translation" count={audit.with_malayalam_translation} total={audit.total_records} color={G.text} />
              <FieldBar label="Arabic Letter Associations" count={audit.with_arabic_letter} total={audit.total_records} color={G.text} />
              <FieldBar label="Planetary Associations" count={audit.with_planet} total={audit.total_records} color={G.text} />
              <FieldBar label="Zodiac Associations" count={audit.with_zodiac} total={audit.total_records} color={G.text} />
              <FieldBar label="Lunar Mansion Associations" count={audit.with_lunar_mansion} total={audit.total_records} color={G.text} />
              <FieldBar label="Element Associations" count={audit.with_element} total={audit.total_records} color={G.text} />
              <FieldBar label="Saad/Nahs Classifications" count={audit.with_saad_nahs} total={audit.total_records} color={G.text} />
              <FieldBar label="Metal Associations" count={audit.with_metal} total={audit.total_records} color={G.text} />
              <FieldBar label="Color Associations" count={audit.with_color} total={audit.total_records} color={G.text} />
            </div>
          </motion.div>

          {/* By Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border p-6"
            style={{ background: G.bg, borderColor: G.faint }}
          >
            <h2 className="font-inter text-xl font-bold uppercase tracking-widest mb-6" style={{ color: G.text }}>
              Completeness by Category
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${G.faint}` }}>
                    <th className="text-left py-3 px-4 font-inter" style={{ color: G.dim }}>Category</th>
                    <th className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>Total</th>
                    <th className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>Arabic</th>
                    <th className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>Malayalam</th>
                    <th className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>Letters</th>
                    <th className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>Planets</th>
                    <th className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>Zodiac</th>
                    <th className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>Mansions</th>
                    <th className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>Elements</th>
                    <th className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>Saad/Nahs</th>
                    <th className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>Metals</th>
                    <th className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>Colors</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(audit.by_category).map(([category, stats]) => (
                    <tr key={category} style={{ borderBottom: `1px solid ${G.faint}` }}>
                      <td className="py-3 px-4 font-inter" style={{ color: G.text }}>{category}</td>
                      <td className="text-center py-3 px-4 font-inter" style={{ color: G.dim }}>{stats.total}</td>
                      <td className="text-center py-3 px-4 font-inter" style={{ color: stats.with_arabic === stats.total ? G.success : G.text }}>{stats.with_arabic}</td>
                      <td className="text-center py-3 px-4 font-inter" style={{ color: stats.with_malayalam === stats.total ? G.success : G.text }}>{stats.with_malayalam}</td>
                      <td className="text-center py-3 px-4 font-inter" style={{ color: stats.with_letter === stats.total ? G.success : G.text }}>{stats.with_letter}</td>
                      <td className="text-center py-3 px-4 font-inter" style={{ color: stats.with_planet === stats.total ? G.success : G.text }}>{stats.with_planet}</td>
                      <td className="text-center py-3 px-4 font-inter" style={{ color: stats.with_zodiac === stats.total ? G.success : G.text }}>{stats.with_zodiac}</td>
                      <td className="text-center py-3 px-4 font-inter" style={{ color: stats.with_mansion === stats.total ? G.success : G.text }}>{stats.with_mansion}</td>
                      <td className="text-center py-3 px-4 font-inter" style={{ color: stats.with_element === stats.total ? G.success : G.text }}>{stats.with_element}</td>
                      <td className="text-center py-3 px-4 font-inter" style={{ color: stats.with_saad_nahs === stats.total ? G.success : G.text }}>{stats.with_saad_nahs}</td>
                      <td className="text-center py-3 px-4 font-inter" style={{ color: stats.with_metal === stats.total ? G.success : G.text }}>{stats.with_metal}</td>
                      <td className="text-center py-3 px-4 font-inter" style={{ color: stats.with_color === stats.total ? G.success : G.text }}>{stats.with_color}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border p-4 text-center"
      style={{ background: G.bg, borderColor: G.faint }}
    >
      <Icon className="w-8 h-8 mx-auto mb-2" style={{ color }} />
      <p className="font-inter text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="font-inter text-xs mt-1" style={{ color: G.dim }}>{label}</p>
    </motion.div>
  );
}

function FieldBar({ label, count, total, color }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-inter text-sm" style={{ color: G.text }}>{label}</span>
        <span className="font-inter text-sm" style={{ color: G.dim }}>{count} / {total} ({percentage}%)</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
    </div>
  );
}

function ImprovementCard({ label, prev, curr, total }) {
  const increase = curr - prev;
  const percentageIncrease = prev > 0 ? Math.round((increase / total) * 100) : 0;
  
  return (
    <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
      <p className="font-inter text-xs mb-1" style={{ color: G.dim }}>{label}</p>
      <p className="font-inter text-lg font-bold" style={{ color: G.text }}>
        {prev} → {curr}
      </p>
      {increase > 0 && (
        <p className="font-inter text-xs font-bold" style={{ color: G.success }}>
          +{increase} (+{percentageIncrease}%)
        </p>
      )}
    </div>
  );
}
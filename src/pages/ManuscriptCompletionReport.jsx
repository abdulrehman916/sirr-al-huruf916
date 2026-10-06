import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Database, CheckCircle, AlertCircle, TrendingUp, FileText, Book } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  success: "rgba(34,197,94,0.70)",
  warning: "rgba(255,193,7,0.70)"
};

export default function ManuscriptCompletionReport() {
  const { isMalayalam } = useAstroClockLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateReport();
  }, []);

  async function generateReport() {
    try {
      setLoading(true);
      const [auditRes, validationRes, manazilRes] = await Promise.all([
        base44.functions.invoke('auditManuscriptRuleCompleteness', {}),
        base44.functions.invoke('validateCrossReferences', {}),
        base44.functions.invoke('auditManazilQuality', {})
      ]);

      setReport({
        completeness: auditRes.data.audit,
        validation: validationRes.data.validation,
        manazil: manazilRes.data,
        generated_at: new Date().toISOString()
      });
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
            <p className="font-inter text-white/70">{isMalayalam ? "റിപ്പോർട്ട് തയ്യാറാക്കുന്നു..." : "Generating completion report..."}</p>
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
            <p className="font-inter text-white/90">Report generation failed: {error}</p>
            <button onClick={generateReport} className="mt-4 px-6 py-2 rounded-lg" style={{ background: G.danger, color: "#fff" }}>
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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-inter text-3xl font-bold uppercase tracking-widest" style={{ color: G.text }}>
              {isMalayalam ? "ഡാറ്റാബേസ് പൂർത്തീകരണ റിപ്പോർട്ട്" : "DATABASE COMPLETION REPORT"}
            </h1>
            <p className="font-inter text-sm mt-2" style={{ color: G.dim }}>
              SIRR AL-HURUF — PHASE 2 | {new Date(report.generated_at).toLocaleString()}
            </p>
          </motion.div>

          {/* Executive Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard
              icon={Database}
              label={isMalayalam ? "ആകെ രേഖകൾ" : "Total Records"}
              value={report.completeness.total_records}
              color={G.text}
            />
            <SummaryCard
              icon={CheckCircle}
              label={isMalayalam ? "പൂർത്തീകരണം" : "Completeness"}
              value={`${report.completeness.completeness_score}%`}
              color={report.completeness.completeness_score >= 70 ? G.success : G.warning}
            />
            <SummaryCard
              icon={FileText}
              label={isMalayalam ? "ബന്ധങ്ങൾ" : "Validated Relations"}
              value={report.validation.validated_relationships}
              color={G.success}
            />
            <SummaryCard
              icon={TrendingUp}
              label={isMalayalam ? "ശരാശരി സ്കോർ" : "Avg Mansion Score"}
              value={`${report.manazil.summary.average_completeness}%`}
              color={G.text}
            />
          </div>

          {/* Task 1: Enrichment Status */}
          <section>
            <h2 className="font-inter text-xl font-bold uppercase tracking-widest mb-4" style={{ color: G.text }}>
              📊 TASK 1: AUTO-ENRICHMENT STATUS
            </h2>
            <div className="rounded-xl border p-6" style={{ background: G.bg, borderColor: G.border }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-inter text-sm font-bold mb-3" style={{ color: G.dim }}>
                    {isMalayalam ? "എക്സ്ട്രാക്റ്റ് ചെയ്ത ഡാറ്റ" : "Extracted Associations"}
                  </h3>
                  <div className="space-y-3">
                    <FieldProgress label="Arabic Letters" count={report.completeness.with_arabic_letter} total={report.completeness.total_records} color={G.text} />
                    <FieldProgress label="Planets" count={report.completeness.with_planet} total={report.completeness.total_records} color={G.text} />
                    <FieldProgress label="Zodiac" count={report.completeness.with_zodiac} total={report.completeness.total_records} color={G.text} />
                    <FieldProgress label="Lunar Mansions" count={report.completeness.with_lunar_mansion} total={report.completeness.total_records} color={G.text} />
                    <FieldProgress label="Elements" count={report.completeness.with_element} total={report.completeness.total_records} color={G.text} />
                    <FieldProgress label="Saad/Nahs" count={report.completeness.with_saad_nahs} total={report.completeness.total_records} color={G.text} />
                    <FieldProgress label="Metals" count={report.completeness.with_metal} total={report.completeness.total_records} color={G.text} />
                    <FieldProgress label="Colors" count={report.completeness.with_color} total={report.completeness.total_records} color={G.text} />
                  </div>
                </div>
                <div>
                  <h3 className="font-inter text-sm font-bold mb-3" style={{ color: G.dim }}>
                    {isMalayalam ? "മലയാളം വിവർത്തനം" : "Malayalam Translation"}
                  </h3>
                  <div className="p-4 rounded-lg" style={{ background: "rgba(34,197,94,0.1)", border: `1px solid ${G.success}` }}>
                    <p className="font-inter text-3xl font-bold" style={{ color: G.success }}>
                      {report.completeness.with_malayalam_translation} / {report.completeness.total_records}
                    </p>
                    <p className="font-inter text-sm mt-1" style={{ color: G.dim }}>
                      {Math.round((report.completeness.with_malayalam_translation / report.completeness.total_records) * 100)}% translated
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Task 4: Cross-Reference Validation */}
          <section>
            <h2 className="font-inter text-xl font-bold uppercase tracking-widest mb-4" style={{ color: G.text }}>
              🔗 TASK 4: CROSS-REFERENCE VALIDATION
            </h2>
            <div className="rounded-xl border p-6" style={{ background: G.bg, borderColor: G.border }}>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(report.validation.by_type).map(([type, data]) => (
                  <div key={type} className="p-4 rounded-lg" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <p className="font-inter text-xs font-bold uppercase tracking-wider mb-2" style={{ color: G.text }}>
                      {type.replace(/_/g, ' → ')}
                    </p>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-inter text-2xl font-bold" style={{ color: G.success }}>{data.valid}</p>
                        <p className="font-inter text-[8px]" style={{ color: G.dim }}>Valid</p>
                      </div>
                      <div>
                        <p className="font-inter text-2xl font-bold" style={{ color: G.warning }}>{data.missing}</p>
                        <p className="font-inter text-[8px]" style={{ color: G.dim }}>Missing</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Task 6: Manazil Quality */}
          <section>
            <h2 className="font-inter text-xl font-bold uppercase tracking-widest mb-4" style={{ color: G.text }}>
              🌙 TASK 6: MANAZIL QUALITY CHECK
            </h2>
            <div className="rounded-xl border p-6" style={{ background: G.bg, borderColor: G.border }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg text-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <p className="font-inter text-3xl font-bold" style={{ color: G.success }}>{report.manazil.summary.mansions_with_records}</p>
                  <p className="font-inter text-xs" style={{ color: G.dim }}>With Records</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <p className="font-inter text-3xl font-bold" style={{ color: G.success }}>{report.manazil.summary.mansions_complete}</p>
                  <p className="font-inter text-xs" style={{ color: G.dim }}>Complete (100%)</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <p className="font-inter text-3xl font-bold" style={{ color: G.warning }}>{report.manazil.summary.mansions_partial}</p>
                  <p className="font-inter text-xs" style={{ color: G.dim }}>Partial</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <p className="font-inter text-3xl font-bold" style={{ color: G.text }}>{report.manazil.summary.average_completeness}%</p>
                  <p className="font-inter text-xs" style={{ color: G.dim }}>Average Score</p>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {report.manazil.mansionData.map((mansion) => (
                  <div key={mansion.number} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div className="flex items-center gap-3">
                      <span className="font-inter text-xs font-bold px-2 py-1 rounded" style={{ background: G.bg, color: G.text }}>
                        {mansion.number}
                      </span>
                      <p className="font-amiri text-xl font-bold" style={{ color: G.text }} dir="rtl">{mansion.arabic_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-inter text-xs" style={{ color: G.dim }}>
                        {mansion.records.length} records
                      </span>
                      <span className={`font-inter text-xs font-bold px-2 py-1 rounded ${
                        mansion.completeness_score === 100 ? 'text-green-400' : 
                        mansion.completeness_score > 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {mansion.completeness_score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Task 3: Source Citation System */}
          <section>
            <h2 className="font-inter text-xl font-bold uppercase tracking-widest mb-4" style={{ color: G.text }}>
              📖 TASK 3: SOURCE CITATION SYSTEM
            </h2>
            <div className="rounded-xl border p-6" style={{ background: G.bg, borderColor: G.border }}>
              <p className="font-inter text-sm mb-4" style={{ color: G.dim }}>
                All ManuscriptRule records now display complete source citations including:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg text-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <Book className="w-8 h-8 mx-auto mb-2" style={{ color: G.text }} />
                  <p className="font-inter text-sm font-bold" style={{ color: G.text }}>Book Name</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: G.text }} />
                  <p className="font-inter text-sm font-bold" style={{ color: G.text }}>Page Number</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: G.text }} />
                  <p className="font-inter text-sm font-bold" style={{ color: G.text }}>Author</p>
                </div>
              </div>
            </div>
          </section>

          {/* Task 5: Advanced Search */}
          <section>
            <h2 className="font-inter text-xl font-bold uppercase tracking-widest mb-4" style={{ color: G.text }}>
              🔍 TASK 5: ADVANCED SEARCH
            </h2>
            <div className="rounded-xl border p-6" style={{ background: G.bg, borderColor: G.border }}>
              <p className="font-inter text-sm mb-4" style={{ color: G.dim }}>
                Universal search now available across all manuscript data with support for:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Arabic Text', 'Malayalam', 'English', 'Letters', 'Mansions', 'Planets', 'Zodiac', 'Elements', 'Saad/Nahs', 'Metals', 'Colors', 'Books'].map(tag => (
                  <span key={tag} className="font-inter text-xs px-3 py-1 rounded-full" style={{ background: G.bg, color: G.text, border: `1px solid ${G.border}` }}>
                    {tag}
                  </span>
                ))}
              </div>
              <p className="font-inter text-xs mt-4" style={{ color: G.dim }}>
                Visit <span className="font-bold" style={{ color: G.text }}>"/manuscript-search"</span> to use advanced search
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border p-4 text-center" style={{ background: G.bg, borderColor: G.faint }}>
      <Icon className="w-8 h-8 mx-auto mb-2" style={{ color }} />
      <p className="font-inter text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="font-inter text-xs mt-1" style={{ color: G.dim }}>{label}</p>
    </div>
  );
}

function FieldProgress({ label, count, total, color }) {
  const percentage = Math.round((count / total) * 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-inter text-sm" style={{ color }}>{label}</span>
        <span className="font-inter text-sm" style={{ color: G.dim }}>{count} ({percentage}%)</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div className="h-2 rounded-full" style={{ width: `${percentage}%`, background: color }} />
      </div>
    </div>
  );
}
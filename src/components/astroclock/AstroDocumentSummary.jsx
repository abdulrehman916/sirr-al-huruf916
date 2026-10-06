// ═══════════════════════════════════════════════════════════════
// ASTRO DOCUMENT SUMMARY — Final report for Document Context Mode
// Displays: document title, languages, pages, entities, chapters,
// knowledge created/updated, duplicates, OCR confidence, processing
// time, integrity checks, relationships, warnings.
// ═══════════════════════════════════════════════════════════════
import { CheckCircle2, AlertCircle, BookOpen, Globe, Layers, GitBranch, Clock, Shield } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";

const LANG_LABELS = { ar: 'العربية', ml: 'മലയാളം', en: 'English', tr: 'Türkçe' };

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-lg p-1.5" style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(212,175,55,0.10)",
    }}>
      <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.30)" }}>{label}</p>
      <p className="font-inter text-sm font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function IntegrityRow({ label, status }) {
  const color = status === 'PASS' ? 'rgba(74,222,128,0.70)' : status === 'PARTIAL' ? 'rgba(212,175,55,0.70)' : 'rgba(248,113,113,0.70)';
  const icon = status === 'PASS' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />;
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color }}>{icon}</span>
      <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.50)" }}>{label}</span>
      <span className="font-inter text-[9px] font-bold" style={{ color }}>{status}</span>
    </div>
  );
}

export default function AstroDocumentSummary({ summary, onReset }) {
  const { txt } = useAstroClockLanguage();

  const s = summary || {};
  const stats = [
    { label: txt("പേജുകൾ", "Pages", "صفحات"), value: s.number_of_pages || s.pages_processed || 0, color: "rgba(255,255,255,0.70)" },
    { label: txt("എന്റിറ്റികൾ", "Entities", "كيانات"), value: s.detected_entities || 0, color: "rgba(212,175,55,0.70)" },
    { label: txt("അധ്യായങ്ങൾ", "Chapters", "فصول"), value: s.detected_chapters || 0, color: "rgba(212,175,55,0.70)" },
    { label: txt("പുതിയത്", "Created", "جديد"), value: s.knowledge_records_created || 0, color: "rgba(74,222,128,0.70)" },
    { label: txt("അപ്ഡേറ്റ്", "Updated", "محدث"), value: s.knowledge_records_updated || 0, color: "rgba(74,222,128,0.70)" },
    { label: txt("തനിപ്പകർപ്പ്", "Dupes", "مكرر"), value: s.duplicates_merged || 0, color: "rgba(212,175,55,0.70)" },
    { label: txt("ബന്ധങ്ങൾ", "Relations", "علاقات"), value: s.relationships_created || 0, color: "rgba(212,175,55,0.70)" },
    { label: txt("OCR ശരാശരി", "OCR Avg", "OCR"), value: `${s.ocr_confidence_average || 0}%`, color: (s.ocr_confidence_average || 100) >= 70 ? "rgba(74,222,128,0.70)" : "rgba(248,113,113,0.70)" },
    { label: txt("സമയം", "Time", "وقت"), value: `${Math.round((s.processing_duration_ms || 0) / 1000)}s`, color: "rgba(255,255,255,0.50)" },
  ];

  return (
    <div className="space-y-2">
      {/* Success banner */}
      <div className="rounded-lg p-2 flex items-center gap-2" style={{
        background: "rgba(74,222,128,0.06)",
        border: "1px solid rgba(74,222,128,0.20)",
      }}>
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(74,222,128,0.70)" }} />
        <span className="font-inter text-[10px] font-bold" style={{ color: "rgba(74,222,128,0.70)" }}>
          {txt("പ്രമാണം പ്രോസസ് ചെയ്തു", "Document processed successfully", "تمت معالجة المستند")}
        </span>
      </div>

      {/* Document title + languages */}
      <div className="flex items-center gap-2 flex-wrap">
        {s.document_title && (
          <span className="font-inter text-[9px] flex items-center gap-1" style={{ color: "rgba(212,175,55,0.60)" }}>
            <BookOpen className="w-3 h-3" /> {s.document_title}
          </span>
        )}
        {Array.isArray(s.detected_languages) && s.detected_languages.length > 0 && (
          <span className="font-inter text-[9px] flex items-center gap-1" style={{ color: "rgba(255,255,255,0.40)" }}>
            <Globe className="w-3 h-3" />
            {s.detected_languages.map(l => LANG_LABELS[l] || l).join(' · ')}
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {stats.map((st, i) => (
          <StatCard key={i} {...st} />
        ))}
      </div>

      {/* Integrity checks */}
      <div className="rounded-lg p-2 space-y-1" style={{
        background: "rgba(212,175,55,0.04)",
        border: "1px solid rgba(212,175,55,0.12)",
      }}>
        <div className="flex items-center gap-1 mb-1">
          <Shield className="w-3 h-3" style={{ color: "rgba(212,175,55,0.60)" }} />
          <span className="font-inter text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.60)" }}>
            {txt("പൂർണ്ണത പരിശോധന", "Integrity Checks", "فحوصات السلامة")}
          </span>
        </div>
        <IntegrityRow label={txt("പ്രമാണ പൂർണ്ണത", "Document", "المستند")} status={s.document_integrity || 'PASS'} />
        <IntegrityRow label={txt("സ്രോതസ്സ് പൂർണ്ണത", "Source", "المصدر")} status={s.source_integrity || 'PASS'} />
        <IntegrityRow label={txt("അറബിക് പൂർണ്ണത", "Arabic", "العربية")} status={s.arabic_integrity || 'PASS'} />
        <IntegrityRow label={txt("വിവർത്തന പൂർണ്ണത", "Translation", "الترجمة")} status={s.translation_integrity || 'PASS'} />
        <IntegrityRow label={txt("പരിശോധന നില", "Verification", "التحقق")} status={s.verification_status || 'VERIFIED'} />
      </div>

      {/* Warnings */}
      {Array.isArray(s.warnings) && s.warnings.length > 0 && (
        <div className="rounded-lg p-2" style={{
          background: "rgba(212,175,55,0.06)",
          border: "1px solid rgba(212,175,55,0.20)",
        }}>
          <div className="flex items-center gap-1 mb-1">
            <AlertCircle className="w-3 h-3" style={{ color: "rgba(212,175,55,0.60)" }} />
            <span className="font-inter text-[9px] font-bold" style={{ color: "rgba(212,175,55,0.60)" }}>
              {txt("മുന്നറിയിപ്പുകൾ", "Warnings", "تحذيرات")} ({s.warnings.length})
            </span>
          </div>
          {s.warnings.map((w, i) => (
            <p key={i} className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.45)" }}>• {w}</p>
          ))}
        </div>
      )}

      {/* Upload more button */}
      <button
        onClick={onReset}
        className="w-full py-2 rounded-lg font-inter text-[10px] font-bold uppercase tracking-wider transition-opacity"
        style={{
          background: "rgba(212,175,55,0.08)",
          border: "1px solid rgba(212,175,55,0.25)",
          color: "#F5D060",
        }}
      >
        {txt("കൂടുതൽ അപ്ലോഡ് ചെയ്യുക", "Upload More", "رفع المزيد")}
      </button>
    </div>
  );
}
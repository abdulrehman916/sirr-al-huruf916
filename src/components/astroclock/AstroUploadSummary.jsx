// ═══════════════════════════════════════════════════════════════
// ASTRO UPLOAD SUMMARY — Final import statistics displayed after
// all pages have been processed through the ingestion pipeline.
// ═══════════════════════════════════════════════════════════════
import { CheckCircle2 } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";

export default function AstroUploadSummary({ summary, onReset }) {
  const { txt } = useAstroClockLanguage();

  const stats = [
    { label: txt("ആകെ പേജുകൾ", "Total pages", "إجمالي"), value: summary.total_pages, color: "rgba(255,255,255,0.70)" },
    { label: txt("പ്രോസസ് ചെയ്തു", "Processed", "تمت"), value: summary.processed, color: "rgba(74,222,128,0.70)" },
    { label: txt("നിരസിച്ചു", "Rejected", "مرفوض"), value: summary.rejected, color: "rgba(248,113,113,0.70)" },
    { label: txt("തനിപ്പകർപ്പ്", "Duplicates", "مكرر"), value: summary.duplicates, color: "rgba(212,175,55,0.70)" },
    { label: txt("പുതിയ എന്റിറ്റി", "New entities", "جديد"), value: summary.new_entities, color: "rgba(74,222,128,0.70)" },
    { label: txt("അപ്ഡേറ്റ്", "Updated", "محدث"), value: summary.updated_entities, color: "rgba(74,222,128,0.70)" },
    { label: txt("പുതിയ വിജ്ഞാനം", "New knowledge", "معرفة"), value: summary.new_knowledge, color: "rgba(74,222,128,0.70)" },
    { label: txt("പിശകുകൾ", "Errors", "أخطاء"), value: summary.errors, color: summary.errors > 0 ? "rgba(248,113,113,0.70)" : "rgba(255,255,255,0.40)" },
    { label: txt("സമയം", "Elapsed", "الوقت"), value: `${summary.elapsed_seconds}s`, color: "rgba(255,255,255,0.50)" },
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
          {txt("ഇറക്കുമതി പൂർത്തിയായി", "Import complete", "اكتمل الاستيراد")}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {stats.map((s, i) => (
          <div key={i} className="rounded-lg p-1.5" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(212,175,55,0.10)",
          }}>
            <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.30)" }}>{s.label}</p>
            <p className="font-inter text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

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
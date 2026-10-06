// ═══════════════════════════════════════════════════════════════
// ENTITY KNOWLEDGE REVIEW QUEUE — Admin Only
// Displays EntityKnowledge records with verification_status="pending_review".
// Admins can approve (set to "verified") or reject (delete) each record.
//
// ISOLATED — does NOT modify EntityKnowledge schema, unifiedIngestKnowledge,
// EntityKnowledgePanel, or any existing pipeline. Read-only query + admin
// update/delete on existing records only.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { normalizeDisplay } from "@/lib/astroClockLanguageNormalizer";

export default function EntityKnowledgeReviewQueue() {
  const { txt } = useAstroClockLanguage();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Astrology review queue now reads ONLY from AstroClockKnowledge
      // (categorized records pending verification).
      const data = await base44.entities.AstroClockKnowledge.filter({
        source_type: "categorized",
        is_marker: false,
        is_verified: false,
      }, "-created_date", 50);
      setRecords(data || []);
    } catch (err) {
      setError(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setActioning(id);
    try {
      await base44.entities.AstroClockKnowledge.update(id, { is_verified: true });
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err?.message || "Failed to approve");
    } finally {
      setActioning(null);
    }
  };

  const reject = async (id) => {
    setActioning(id);
    try {
      // Never delete ACK records — hide as marker instead (preserves provenance).
      await base44.entities.AstroClockKnowledge.update(id, { is_marker: true });
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err?.message || "Failed to reject");
    } finally {
      setActioning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#F5D060" }} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
          {records.length} {txt("രേഖകൾ കാത്തിരിക്കുന്നു", "records pending", "سجلات تنتظر")}
        </span>
        <button onClick={load} className="p-1.5 rounded-lg" style={{ background: "rgba(212,175,55,0.08)" }}>
          <RefreshCw className="w-3.5 h-3.5" style={{ color: "#F5D060" }} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg p-2 flex items-start gap-2" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.20)" }}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "rgba(248,113,113,0.60)" }} />
          <p className="font-inter text-[10px]" style={{ color: "rgba(248,113,113,0.70)" }}>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {records.length === 0 && !error && (
        <div className="text-center py-6">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-2" style={{ color: "rgba(74,222,128,0.50)" }} />
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
            {txt("അവലോകനം കാത്തിരിക്കുന്ന രേഖകളില്ല", "No records pending review", "لا سجلات تنتظر المراجعة")}
          </p>
        </div>
      )}

      {/* Records */}
      {records.map(rec => (
        <div key={rec.id} className="rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}>
          {/* Entity + category + confidence */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-inter text-[9px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.10)", color: "rgba(212,175,55,0.70)" }}>
              {rec.rule_category || rec.entity_type}/{rec.rule_entity || rec.entity_key}
            </span>
            {(rec.attributes?.knowledge_category || rec.knowledge_category) && (rec.attributes?.knowledge_category || rec.knowledge_category) !== 'general' && (
              <span className="font-inter text-[8px] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                {rec.attributes?.knowledge_category || rec.knowledge_category}
              </span>
            )}
            <span className="font-inter text-[8px] ml-auto" style={{ color: ((rec.ocr_confidence ?? rec.extraction_confidence) || 100) < 70 ? "rgba(248,113,113,0.60)" : "rgba(255,255,255,0.30)" }}>
              {(rec.ocr_confidence ?? rec.extraction_confidence) || 0}%
            </span>
          </div>

          {/* English text */}
          <p className="font-inter text-[10px] leading-snug mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>
            {(rec.knowledge_text_en || '').substring(0, 200)}
            {(rec.knowledge_text_en || '').length > 200 ? '...' : ''}
          </p>

          {/* Arabic text */}
          {rec.knowledge_text_ar && (
            <p className="font-amiri text-[11px] mb-1" style={{ color: "rgba(212,175,55,0.40)", direction: "rtl" }}>
              {rec.knowledge_text_ar.substring(0, 150)}
              {rec.knowledge_text_ar.length > 150 ? '...' : ''}
            </p>
          )}

          {/* Source */}
          <p className="font-inter text-[8px] mb-2" style={{ color: "rgba(255,255,255,0.30)" }}>
            📖 {normalizeDisplay(rec.source_book_title || 'Manuscript')}
            {rec.source_page_number ? ` p.${rec.source_page_number}` : ''}
            {rec.source_screenshot_url ? ' 📷' : ''}
          </p>

          {/* Actions */}
          <div className="flex gap-1.5">
            <button
              onClick={() => approve(rec.id)}
              disabled={actioning === rec.id}
              className="flex-1 py-1.5 rounded-lg font-inter text-[9px] font-bold uppercase flex items-center justify-center gap-1 transition-opacity disabled:opacity-30"
              style={{ background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.25)", color: "rgba(74,222,128,0.80)" }}
            >
              <CheckCircle2 className="w-3 h-3" />
              {txt("അംഗീകരിക്കുക", "Approve", "موافق")}
            </button>
            <button
              onClick={() => reject(rec.id)}
              disabled={actioning === rec.id}
              className="flex-1 py-1.5 rounded-lg font-inter text-[9px] font-bold uppercase flex items-center justify-center gap-1 transition-opacity disabled:opacity-30"
              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.20)", color: "rgba(248,113,113,0.70)" }}
            >
              <XCircle className="w-3 h-3" />
              {txt("നിരസിക്കുക", "Reject", "رفض")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
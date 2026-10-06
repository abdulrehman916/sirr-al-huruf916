import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, BookOpen, ImageIcon, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useIsOwner } from "@/hooks/useIsOwner";

const P = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(245,208,96,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const LANG_LABELS = { ar: "Arabic", ml: "Malayalam", en: "English", mixed: "Arabic + Malayalam" };

/**
 * Displays all imported PDF paragraphs for ONE Holy Name, in the EXACT
 * original PDF order (sorted by source PDF file → page → paragraph_order).
 *
 * NO invented categories: sections are never grouped by AI-generated labels.
 * Each paragraph is shown independently, in manuscript order, preserving:
 *   • The PDF's own heading (source_heading) above the paragraph if present
 *   • Original Arabic text (verbatim)
 *   • Faithful Malayalam translation
 *   • Source PDF + page number
 *   • Paragraph order
 *   • Images, tables, magic squares, diagrams, visual elements in place
 * Append-only: future imports append new records without overwriting.
 */
export default function HolyNameImportedSections({ sourceSection, sourceNameKey, refreshKey = 0 }) {
  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(false);
  const isOwner = useIsOwner();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    base44.entities.HolyNameImportedSection
      .filter({ source_section: sourceSection, source_name_key: String(sourceNameKey) }, null, 500)
      .then((raw) => {
        if (!alive) return;
        // Sort in EXACT original PDF order: file → page → paragraph_order
        const secs = (raw || []).slice().sort((a, b) => {
          const fa = (a.source_pdf_file || "").localeCompare(b.source_pdf_file || "");
          if (fa !== 0) return fa;
          const pa = (a.source_pdf_page || 0) - (b.source_pdf_page || 0);
          if (pa !== 0) return pa;
          return (a.paragraph_order || 0) - (b.paragraph_order || 0);
        });
        setSections(secs);
      })
      .catch(() => { if (alive) setSections([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [sourceSection, sourceNameKey, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3" style={{ borderTop: "1px solid " + P.faint }}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: P.dim }} />
        <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: P.dim }}>Loading imported knowledge…</span>
      </div>
    );
  }

  if (!sections || sections.length === 0) return null;

  return (
    <div className="pt-3 mt-1" style={{ borderTop: "1px solid " + P.faint }}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-3.5 h-3.5" style={{ color: P.text }} />
        <span className="font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: P.text }}>
          {isOwner ? `PDF Knowledge · ${sections.length} paragraph${sections.length > 1 ? "s" : ""}` : `${sections.length} paragraph${sections.length > 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sections.map((s, i) => (
            <motion.div
              key={s.section_id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.2), duration: 0.2 }}
              className="rounded-xl border p-3 space-y-2"
              style={{ background: "rgba(8,16,38,0.6)", borderColor: P.border }}
            >
              {/* PDF's own heading (verbatim, never AI-invented) */}
              {s.source_heading && (
                <div
                  className="font-amiri text-base font-bold px-2 py-1.5 rounded-lg"
                  style={{
                    color: P.text,
                    background: P.bgHi,
                    border: `1px solid ${P.border}`,
                    direction: /[\u0600-\u06FF]/.test(s.source_heading) ? "rtl" : "ltr",
                    textAlign: /[\u0600-\u06FF]/.test(s.source_heading) ? "right" : "left",
                  }}
                  dir={/[\u0600-\u06FF]/.test(s.source_heading) ? "rtl" : "ltr"}
                >
                  {s.source_heading}
                </div>
              )}

              {isOwner && (
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-inter text-[8px]" style={{ color: P.dim }}>
                    {LANG_LABELS[s.language] || s.language}
                  </span>
                  <span className="font-inter text-[8px]" style={{ color: "rgba(212,175,55,0.45)" }}>
                    · {s.match_confidence ?? 100}%
                  </span>
                </div>
                {s.needs_review && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded font-inter text-[7px] uppercase tracking-widest font-bold" style={{ color: "#fbbf24", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)" }}>
                    <AlertTriangle className="w-2.5 h-2.5" /> Pending Review
                  </span>
                )}
                {s.has_visual && (
                  <span className="flex items-center gap-1 font-inter text-[8px] uppercase tracking-widest" style={{ color: P.text }}>
                    <ImageIcon className="w-3 h-3" /> Visual
                  </span>
                )}
              </div>
              )}

              {s.arabic_text && (
                <div className="space-y-1">
                  <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.50)" }}>Original Arabic text</span>
                  <p className="font-amiri text-lg leading-loose whitespace-pre-wrap selectable" style={{ color: "rgba(255,255,255,0.92)" }} dir="rtl">
                    {s.arabic_text}
                  </p>
                </div>
              )}

              {s.malayalam_translation && (
                <div className="space-y-1 pt-1 border-t" style={{ borderColor: "rgba(212,175,55,0.10)" }}>
                  <span className="font-inter text-[7px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.50)" }}>Malayalam translation</span>
                  <p className="font-malayalam text-sm leading-relaxed whitespace-pre-wrap selectable" style={{ color: "rgba(255,255,255,0.80)" }} dir="auto">
                    {s.malayalam_translation}
                  </p>
                </div>
              )}

              {s.text_content && (
                <details className="pt-1 border-t" style={{ borderColor: "rgba(212,175,55,0.10)" }}>
                  <summary className="cursor-pointer font-inter text-[7px] uppercase tracking-widest py-1" style={{ color: "rgba(212,175,55,0.50)" }}>Original book content</summary>
                  <p className="font-amiri text-sm leading-loose whitespace-pre-wrap selectable mt-1" style={{ color: "rgba(255,255,255,0.70)" }} dir="auto">
                    {s.text_content}
                  </p>
                </details>
              )}

              {/* Page-scan images removed from public view (private library artifacts) */}

              {isOwner && (
              <div className="flex items-center gap-1.5 pt-1 border-t flex-wrap" style={{ borderColor: "rgba(212,175,55,0.12)" }}>
                <FileText className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(212,175,55,0.40)" }} />
                <span className="font-inter text-[8px] truncate" style={{ color: "rgba(255,255,255,0.40)" }}>
                  Page {s.source_pdf_page || "?"}
                </span>
                {s.import_date && (
                  <span className="font-inter text-[8px] truncate" style={{ color: "rgba(255,255,255,0.30)" }}>
                    · {new Date(s.import_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
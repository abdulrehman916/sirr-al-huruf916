// ═══════════════════════════════════════════════════════════════
// ASTRO ROUTING REPORT — Smart Topic Router final report display
// Shows: topics detected, sections with page ranges, destinations,
// records created/updated/skipped, warnings, integrity checks.
// ═══════════════════════════════════════════════════════════════
import { CheckCircle2, AlertCircle, Route, Layers, BookOpen } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";

const TOPIC_COLORS = {
  astrology: { bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.30)', text: 'rgba(74,222,128,0.80)', label: 'Astrology' },
  holy_names: { bg: 'rgba(212,175,55,0.10)', border: 'rgba(212,175,55,0.30)', text: 'rgba(212,175,55,0.80)', label: 'Holy Names' },
  vefk: { bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.30)', text: 'rgba(96,165,250,0.80)', label: 'Vefk' },
  abjad: { bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.30)', text: 'rgba(167,139,250,0.80)', label: 'Abjad' },
  duas: { bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.30)', text: 'rgba(248,113,113,0.80)', label: 'Duas' },
  dream_interpretation: { bg: 'rgba(236,72,153,0.10)', border: 'rgba(236,72,153,0.30)', text: 'rgba(236,72,153,0.80)', label: 'Dream/Omens' },
  manuscript_notes: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.20)', text: 'rgba(255,255,255,0.60)', label: 'Notes' },
  other: { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.40)', label: 'Other' },
};

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

export default function AstroRoutingReport({ report, onReset }) {
  const { txt } = useAstroClockLanguage();
  const r = report || {};
  const sections = Array.isArray(r.sections) ? r.sections : [];
  const topicBadges = Array.isArray(r.topics_detected) ? r.topics_detected : [];

  const stats = [
    { label: txt("പേജുകൾ", "Pages", "صفحات"), value: r.pages_processed || 0, color: "rgba(255,255,255,0.70)" },
    { label: txt("വിഷയങ്ങൾ", "Topics", "مواضيع"), value: topicBadges.length, color: "rgba(212,175,55,0.70)" },
    { label: txt("വിഭാഗങ്ങൾ", "Sections", "أقسام"), value: sections.length, color: "rgba(212,175,55,0.70)" },
    { label: txt("പുതിയത്", "Created", "جديد"), value: r.total_records_created || 0, color: "rgba(74,222,128,0.70)" },
    { label: txt("അപ്ഡേറ്റ്", "Updated", "محدث"), value: r.total_records_updated || 0, color: "rgba(74,222,128,0.70)" },
    { label: txt("ഒഴിവാക്കി", "Skipped", "متخطى"), value: r.total_records_skipped || 0, color: "rgba(255,255,255,0.50)" },
    { label: txt("സമയം", "Time", "وقت"), value: `${Math.round((r.processing_duration_ms || 0) / 1000)}s`, color: "rgba(255,255,255,0.50)" },
    { label: txt("മുന്നറിയിപ്പുകൾ", "Warnings", "تحذيرات"), value: (r.warnings || []).length, color: (r.warnings || []).length > 0 ? "rgba(212,175,55,0.70)" : "rgba(255,255,255,0.40)" },
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
          {txt("റൂട്ടിംഗ് പൂർത്തിയായി", "Routing complete", "اكتمل التوجيه")}
        </span>
      </div>

      {/* Topic badges */}
      {topicBadges.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <Route className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(212,175,55,0.60)" }} />
          {topicBadges.map(topic => {
            const cfg = TOPIC_COLORS[topic] || TOPIC_COLORS.other;
            return (
              <span key={topic} className="font-inter text-[8px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}>
                {cfg.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {stats.map((st, i) => (
          <StatCard key={i} {...st} />
        ))}
      </div>

      {/* Sections list */}
      {sections.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Layers className="w-3 h-3" style={{ color: "rgba(212,175,55,0.60)" }} />
            <span className="font-inter text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.60)" }}>
              {txt("വിഭാഗങ്ങൾ", "Sections", "الأقسام")}
            </span>
          </div>
          {sections.map((s, i) => {
            const cfg = TOPIC_COLORS[s.topic] || TOPIC_COLORS.other;
            return (
              <div key={i} className="rounded-lg p-1.5" style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
              }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-inter text-[9px] font-bold flex-shrink-0" style={{ color: cfg.text }}>
                      {cfg.label}
                    </span>
                    <span className="font-inter text-[8px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.40)" }}>
                      {txt("പേജ്", "pp", "ص")}{s.page_start}–{s.page_end}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {s.records_created > 0 && (
                      <span className="font-inter text-[8px] font-bold" style={{ color: "rgba(74,222,128,0.70)" }}>
                        +{s.records_created}
                      </span>
                    )}
                    {s.records_updated > 0 && (
                      <span className="font-inter text-[8px] font-bold" style={{ color: "rgba(74,222,128,0.60)" }}>
                        ~{s.records_updated}
                      </span>
                    )}
                    {s.records_skipped > 0 && (
                      <span className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                        ⌀{s.records_skipped}
                      </span>
                    )}
                    {s.status === 'skipped' && (
                      <span className="font-inter text-[8px] px-1 rounded" style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.35)',
                      }}>
                        {txt("ഒഴിവാക്കി", "skip", "تخطى")}
                      </span>
                    )}
                  </div>
                </div>
                <p className="font-inter text-[8px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>
                  → {s.destination_store}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Warnings */}
      {Array.isArray(r.warnings) && r.warnings.length > 0 && (
        <div className="rounded-lg p-2" style={{
          background: "rgba(212,175,55,0.06)",
          border: "1px solid rgba(212,175,55,0.20)",
        }}>
          <div className="flex items-center gap-1 mb-1">
            <AlertCircle className="w-3 h-3" style={{ color: "rgba(212,175,55,0.60)" }} />
            <span className="font-inter text-[9px] font-bold" style={{ color: "rgba(212,175,55,0.60)" }}>
              {txt("മുന്നറിയിപ്പുകൾ", "Warnings", "تحذيرات")} ({r.warnings.length})
            </span>
          </div>
          {r.warnings.map((w, i) => (
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
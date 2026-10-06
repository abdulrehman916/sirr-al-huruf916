// ═══════════════════════════════════════════════════════════════
// SECTION D CARD — Individual expandable card for the Holy Names library
//
// Each Dua, Wazifa, Hizb, Hirz, Salawat, Qur'an reference and Spiritual
// Practice has its own individual card with:
//   • Arabic text  • Malayalam translation  • Explanation
//   • Benefits  • Conditions  • Usage method
//   • Recommended repetition  • Recommended day  • Planetary hour
//   • Related Holy Names  • Related Wafq  • Related Magic Squares
//   • Source book  • Page number  • Citation
//   • Additional sources (appended from future PDF imports)
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { ChevronDown, BookOpen, Clock, Calendar, Repeat, Sparkles, AlertCircle, Hand, Heart, Link2, Grid3x3 } from "lucide-react";
import { useIsOwner } from "@/hooks/useIsOwner";

const CONTENT_TYPE_LABELS = {
  long_dua: { en: "Long Du'a", ml: "ദീർഘ ദുആ", color: "rgba(212,175,55,0.65)", bg: "rgba(212,175,55,0.10)" },
  general_wazifa: { en: "Wazifa", ml: "വാഴിഫ", color: "rgba(129,140,248,0.65)", bg: "rgba(129,140,248,0.10)" },
  general_khawass: { en: "Khawass", ml: "ഖവാസ്സ", color: "rgba(74,222,128,0.65)", bg: "rgba(74,222,128,0.10)" },
  general_mujarrabat: { en: "Mujarrabat", ml: "മുജർറബത്", color: "rgba(251,191,36,0.65)", bg: "rgba(251,191,36,0.10)" },
  spiritual_practice: { en: "Spiritual Practice", ml: "ആത്മീയ അഭ്യാസം", color: "rgba(168,85,247,0.65)", bg: "rgba(168,85,247,0.10)" },
  quran_reference: { en: "Qur'an", ml: "ഖുർആൻ", color: "rgba(34,197,94,0.65)", bg: "rgba(34,197,94,0.10)" },
  islamic_figure: { en: "Islamic Figure", ml: "ഇസ്ലാമിക വ്യക്തി", color: "rgba(14,165,233,0.65)", bg: "rgba(14,165,233,0.10)" },
  miscellaneous: { en: "Miscellaneous", ml: "വിവിധ", color: "rgba(148,163,184,0.65)", bg: "rgba(148,163,184,0.10)" },
};

function Field({ icon: Icon, label, value, color }) {
  if (!value || !String(value).trim()) return null;
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: color || "rgba(212,175,55,0.45)" }} />
      <div className="flex-1 min-w-0">
        <p className="font-inter text-[8px] uppercase font-bold tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>{label}</p>
        <p className="font-inter text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>{value}</p>
      </div>
    </div>
  );
}

export default function SectionDCard({ record }) {
  const [expanded, setExpanded] = useState(false);
  const isOwner = useIsOwner();
  const ct = CONTENT_TYPE_LABELS[record.content_type] || CONTENT_TYPE_LABELS.miscellaneous;
  const title = record.title || record.original_rule_entity || record.section_d_id;
  const additionalSources = Array.isArray(record.additional_sources) ? record.additional_sources : [];
  const sourceCount = 1 + additionalSources.length;

  return (
    <div className="rounded-lg overflow-hidden transition-all" style={{
      background: expanded ? "rgba(212,175,55,0.03)" : "rgba(255,255,255,0.015)",
      border: `1px solid ${expanded ? "rgba(212,175,55,0.25)" : "rgba(212,175,55,0.10)"}`,
    }}>
      {/* ── Collapsed header ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-3 text-left"
      >
        <span
          className="font-inter text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded flex-shrink-0"
          style={{ background: ct.bg, color: ct.color }}
        >
          {ct.en}
        </span>
        <div className="flex-1 min-w-0">
          <span
            className="font-inter text-xs font-bold block truncate"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            {isOwner && record.source_book_title && (
              <span className="font-inter text-[9px] truncate" style={{ color: "rgba(255,255,255,0.30)" }}>
                📖 {record.source_book_title.slice(0, 30)}
              </span>
            )}
            {isOwner && sourceCount > 1 && (
              <span className="font-inter text-[8px] px-1.5 py-0.5 rounded flex-shrink-0" style={{
                background: "rgba(212,175,55,0.08)",
                color: "rgba(212,175,55,0.60)",
              }}>
                {sourceCount} sources
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform"
          style={{ color: "rgba(212,175,55,0.40)", transform: expanded ? "rotate(180deg)" : "none" }}
        />
      </button>

      {/* ── Expanded content ── */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2.5">
          {/* Arabic Text — primary display */}
          {record.arabic_text && (
            <div className="rounded-lg p-2.5" style={{ background: "rgba(0,0,0,0.20)", border: "1px solid rgba(212,175,55,0.10)" }}>
              <p className="font-amiri text-base text-right leading-loose" dir="rtl" style={{ color: "rgba(255,255,255,0.85)" }}>
                {record.arabic_text}
              </p>
            </div>
          )}

          {/* Malayalam Translation */}
          {record.malayalam_translation && (
            <div>
              <p className="font-inter text-[8px] uppercase font-bold tracking-wider mb-1" style={{ color: "rgba(212,175,55,0.40)" }}>മലയാളം / Malayalam</p>
              <p className="font-malayalam text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>
                {record.malayalam_translation}
              </p>
            </div>
          )}

          {/* Explanation */}
          {record.explanation && (
            <div>
              <p className="font-inter text-[8px] uppercase font-bold tracking-wider mb-1" style={{ color: "rgba(212,175,55,0.40)" }}>Explanation</p>
              <p className="font-inter text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {record.explanation}
              </p>
            </div>
          )}

          {/* Benefits */}
          {record.benefits && (
            <Field icon={Sparkles} label="Benefits" value={record.benefits} color="rgba(74,222,128,0.50)" />
          )}

          {/* Conditions */}
          {record.conditions && (
            <Field icon={AlertCircle} label="Conditions" value={record.conditions} color="rgba(248,113,113,0.50)" />
          )}

          {/* Usage Method */}
          {record.usage_method && (
            <Field icon={Hand} label="Usage Method" value={record.usage_method} color="rgba(212,175,55,0.50)" />
          )}

          {/* Practice Details — repetition, day, hour */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            {record.recommended_repetition && (
              <div className="flex items-center gap-2">
                <Repeat className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(212,175,55,0.45)" }} />
                <span className="font-inter text-[8px] uppercase font-bold" style={{ color: "rgba(255,255,255,0.30)" }}>Repetition:</span>
                <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>{record.recommended_repetition}</span>
              </div>
            )}
            {record.recommended_day && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(212,175,55,0.45)" }} />
                <span className="font-inter text-[8px] uppercase font-bold" style={{ color: "rgba(255,255,255,0.30)" }}>Day:</span>
                <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>{record.recommended_day}</span>
              </div>
            )}
            {record.recommended_planetary_hour && (
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(212,175,55,0.45)" }} />
                <span className="font-inter text-[8px] uppercase font-bold" style={{ color: "rgba(255,255,255,0.30)" }}>Planetary Hour:</span>
                <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>{record.recommended_planetary_hour}</span>
              </div>
            )}
          </div>

          {/* Related — Holy Names, Wafq, Magic Squares */}
          {(record.related_holy_names?.length > 0 || record.related_wafq?.length > 0 || record.related_magic_squares?.length > 0) && (
            <div className="pt-1.5 border-t" style={{ borderColor: "rgba(212,175,55,0.06)" }}>
              <p className="font-inter text-[8px] uppercase font-bold tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.30)" }}>Related</p>
              <div className="flex flex-wrap gap-1">
                {record.related_holy_names?.map((n, i) => (
                  <span key={`hn${i}`} className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.06)", color: "rgba(212,175,55,0.65)" }}>
                    📿 {n}
                  </span>
                ))}
                {record.related_wafq?.map((w, i) => (
                  <span key={`w${i}`} className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(129,140,248,0.06)", color: "rgba(129,140,248,0.65)" }}>
                    🔲 {w}
                  </span>
                ))}
                {record.related_magic_squares?.map((m, i) => (
                  <span key={`m${i}`} className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.06)", color: "rgba(74,222,128,0.65)" }}>
                    ▦ {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Primary Source Citation — Owner only */}
          {isOwner && (
          <div className="pt-1.5 border-t" style={{ borderColor: "rgba(212,175,55,0.06)" }}>
            <div className="flex items-start gap-1.5">
              <BookOpen className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "rgba(74,222,128,0.45)" }} />
              <div className="flex-1 min-w-0">
                <p className="font-inter text-[8px] uppercase font-bold tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>Primary Source</p>
                <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
                  {record.citation || `${record.source_book_title || 'Unknown'}${record.source_page_number ? ' p.' + record.source_page_number : ''}`}
                </p>
              </div>
            </div>
          </div>
          )}

          {/* Additional Sources — appended from future PDF imports — Owner only */}
          {isOwner && additionalSources.length > 0 && (
            <div className="pt-1.5 border-t" style={{ borderColor: "rgba(212,175,55,0.06)" }}>
              <p className="font-inter text-[8px] uppercase font-bold tracking-wider mb-1.5" style={{ color: "rgba(212,175,55,0.45)" }}>
                Additional Sources ({additionalSources.length})
              </p>
              <div className="space-y-2">
                {additionalSources.map((s, i) => (
                  <div key={i} className="pl-2.5 border-l-2" style={{ borderColor: "rgba(212,175,55,0.12)" }}>
                    {s.arabic_text && (
                      <p className="font-amiri text-sm text-right leading-loose mb-1" dir="rtl" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {s.arabic_text}
                      </p>
                    )}
                    {s.explanation && (
                      <p className="font-inter text-[9px] leading-relaxed mb-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {s.explanation}
                      </p>
                    )}
                    <p className="font-inter text-[8px]" style={{ color: "rgba(74,222,128,0.40)" }}>
                      📖 {s.citation || `${s.source_book_title || ''}${s.source_page_number ? ' p.' + s.source_page_number : ''}`}
                    </p>
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
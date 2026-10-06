// ═══════════════════════════════════════════════════════════════
// SIRR HEADING VIEW — DYNAMIC HEADING DRILL-DOWN
// ═══════════════════════════════════════════════════════════════
// Shows a single heading and its contents:
//   - Sub-headings (if any) as clickable cards
//   - Entries directly under this heading as method cards
// Supports any depth — no fixed hierarchy assumption.
// Clicking a sub-heading drills deeper.
// Clicking an entry opens SirrMethodDetail.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { ChevronLeft, FileText, Layers, Sparkles, BookOpen } from "lucide-react";
import SirrMethodDetail from "./SirrMethodDetail";
import { getLanguageContent } from "@/lib/sirrTurkishGuard";

export default function SirrHeadingView({ heading, childHeadings, entries, breadcrumb, onSelectHeading, onSelectEntry, onBack, language, accent }) {
  const isMl = language === "ml";
  const [selectedEntry, setSelectedEntry] = useState(null);

  // If an entry is selected, show the method detail
  if (selectedEntry) {
    return (
      <SirrMethodDetail
        method={selectedEntry}
        accent={accent}
        language={language}
        onBack={() => setSelectedEntry(null)}
        backLabel={isMl ? heading.heading_title : heading.heading_title}
        onSelectPreparation={onSelectEntry}
      />
    );
  }

  const isGenerated = heading.heading_source === "generated_fallback";
  const hasChildren = childHeadings && childHeadings.length > 0;

  return (
    <div className="space-y-3">
      {/* Back button */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft className="w-4 h-4" /> {isMl ? "തിരികെ" : "Back"}
        </button>
      </div>

      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap px-1">
          {breadcrumb.map((crumb, idx) => (
            <span key={crumb.heading_id || idx} className="flex items-center gap-0.5">
              {idx > 0 && <ChevronLeft className="w-3 h-3 rotate-180" style={{ color: "rgba(255,255,255,0.30)" }} />}
              <button onClick={() => idx < breadcrumb.length - 1 && onSelectHeading?.(crumb)}
                className="font-inter text-[10px] font-bold px-1.5 py-0.5 rounded transition-all"
                style={{ color: idx === breadcrumb.length - 1 ? accent : "rgba(255,255,255,0.40)" }}>
                {crumb.heading_title}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Heading title */}
      <div className="text-center pb-2">
        <span className="font-inter text-[9px] font-bold px-2 py-0.5 rounded"
          style={{ background: `${accent}10`, color: accent }}>
          {isMl ? `നിര ${heading.heading_level}` : `Level ${heading.heading_level}`}
        </span>
        {heading.heading_title_ar && (
          <h2 className="font-amiri text-2xl font-bold mt-1" style={{ color: accent, direction: "rtl" }}>
            {heading.heading_title_ar}
          </h2>
        )}
        <p className={`text-sm font-bold mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: accent }}>
          {heading.heading_title}
        </p>
        {isGenerated && (
          <span className="font-inter text-[8px] px-1.5 py-0.5 rounded inline-flex items-center gap-1 mt-1"
            style={{ background: "rgba(251,191,36,0.08)", color: "#FBBF24" }}>
            <Sparkles className="w-2 h-2" />
            {isMl ? "സൃഷ്ടിച്ച തലവാചകം" : "Generated Heading"}
          </span>
        )}
        <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          {heading.start_page && `${isMl ? "പേജ്" : "p."} ${heading.start_page}`}
          {heading.end_page && `–${heading.end_page}`}
          {heading.start_page && ` · `}
          {entries.length} {isMl ? "നേരിട്ടുള്ള രേഖകൾ" : "direct entries"}
          {hasChildren && ` · ${childHeadings.length} ${isMl ? "ഉപതലവാചകങ്ങൾ" : "sub-headings"}`}
        </p>
      </div>

      {/* Sub-headings */}
      {hasChildren && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Layers className="w-4 h-4" style={{ color: accent }} />
            <span className="font-inter text-xs font-bold" style={{ color: accent }}>
              {isMl ? "ഉപതലവാചകങ്ങൾ" : "Sub-headings"}
            </span>
          </div>
          {childHeadings.map((child, idx) => {
            const childIsGenerated = child.heading_source === "generated_fallback";
            const childEntryCount = child.total_entry_count || child.entry_count || 0;
            return (
              <button
                key={child.heading_id}
                onClick={() => onSelectHeading?.(child)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: childIsGenerated ? "rgba(251,191,36,0.04)" : "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
                  border: childIsGenerated ? "1px solid rgba(251,191,36,0.15)" : `1px solid ${accent}22`,
                }}
              >
                <span className="font-inter text-[10px] font-bold flex-shrink-0 px-2 py-1 rounded"
                  style={{ background: `${accent}10`, color: accent }}>
                  {isMl ? `നിര ${child.heading_level}` : `L${child.heading_level}`}
                </span>
                <div className="flex-1 min-w-0">
                  {child.heading_title_ar && (
                    <p className="font-amiri text-sm font-bold" style={{ color: accent, direction: "rtl" }}>
                      {child.heading_title_ar}
                    </p>
                  )}
                  <p className={`text-sm font-bold ${isMl ? "font-malayalam" : "font-inter"}`}
                    style={{ color: "rgba(255,255,255,0.80)" }}>
                    {child.heading_title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <FileText className="w-3 h-3" style={{ color: "rgba(255,255,255,0.30)" }} />
                    <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {childEntryCount} {isMl ? "രേഖകൾ" : "entries"}
                    </span>
                  </div>
                </div>
                {childIsGenerated && <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: "#FBBF24" }} />}
                <ChevronLeft className="w-4 h-4 flex-shrink-0 rotate-180" style={{ color: `${accent}99` }} />
              </button>
            );
          })}
        </div>
      )}

      {/* Direct entries under this heading */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <BookOpen className="w-4 h-4" style={{ color: accent }} />
            <span className="font-inter text-xs font-bold" style={{ color: accent }}>
              {isMl ? "രേഖകൾ" : "Entries"}
            </span>
          </div>
          {entries.map((entry, idx) => (
            <button
              key={entry.entry_id || entry.id || idx}
              onClick={() => setSelectedEntry(entry)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
                border: `1px solid ${accent}22`,
              }}
            >
              <span className="font-inter text-[10px] font-bold flex-shrink-0 px-2 py-1 rounded"
                style={{ background: `${accent}10`, color: accent }}>
                {isMl ? `രേഖ ${entry.entry_order || (idx + 1)}` : `Entry ${entry.entry_order || (idx + 1)}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${isMl ? "font-malayalam" : "font-inter"}`}
                  style={{ color: "rgba(255,255,255,0.80)" }}>
                  {getLanguageContent(entry, 'purpose', language) || (isMl ? "വ്യക്തമാക്കാത്തത്" : "Not specified")}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <FileText className="w-3 h-3" style={{ color: "rgba(255,255,255,0.30)" }} />
                  <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {isMl ? "പേജ്" : "p."} {entry.page_number || "?"}
                  </span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 flex-shrink-0 rotate-180" style={{ color: `${accent}99` }} />
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasChildren && entries.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.20)" }} />
          <p className={`text-xs ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.35)" }}>
            {isMl ? "ഈ തലവാചകത്തിന് കീഴിൽ രേഖകളില്ല." : "No entries under this heading."}
          </p>
        </div>
      )}
    </div>
  );
}
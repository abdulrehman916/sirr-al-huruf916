// ═══════════════════════════════════════════════════════════════
// SIRR BOOK TABLE OF CONTENTS — MANUSCRIPT HEADING TREE
// ═══════════════════════════════════════════════════════════════
// Displays the real manuscript heading tree detected from the PDF.
// Any number of heading levels — dynamic, no fixed hierarchy.
// Generated fallback headings are visually marked.
// Clicking a heading navigates to SirrHeadingView.
// ═══════════════════════════════════════════════════════════════
import { ChevronLeft, BookOpen, FileText, ListTree, Sparkles, Layers } from "lucide-react";

function HeadingNode({ heading, depth, onSelectHeading, isMl, accent }) {
  const isGenerated = heading.heading_source === "generated_fallback";
  const hasChildren = heading.children && heading.children.length > 0;
  const entryCount = heading.total_entry_count || heading.entry_count || 0;

  return (
    <div className={depth > 0 ? "ml-3 border-l pl-3" : ""} style={{ borderColor: `${accent}15` }}>
      <button
        onClick={() => onSelectHeading(heading)}
        className="w-full flex items-center gap-2.5 p-3 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] mb-1.5"
        style={{
          background: isGenerated ? "rgba(251,191,36,0.04)" : "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
          border: isGenerated ? `1px solid rgba(251,191,36,0.15)` : `1px solid ${accent}22`,
        }}
      >
        {/* Level indicator */}
        <span className="font-inter text-[9px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded"
          style={{ background: `${accent}10`, color: accent }}>
          {isMl ? `നിര ${heading.heading_level}` : `L${heading.heading_level}`}
        </span>

        {/* Heading title */}
        <div className="flex-1 min-w-0">
          {heading.heading_title_ar && (
            <p className="font-amiri text-sm font-bold" style={{ color: accent, direction: "rtl" }}>
              {heading.heading_title_ar}
            </p>
          )}
          <p className={`text-xs font-bold ${isMl ? "font-malayalam" : "font-inter"}`}
            style={{ color: "rgba(255,255,255,0.75)" }}>
            {heading.heading_title}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <FileText className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.30)" }} />
            <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              {entryCount} {isMl ? "രേഖകൾ" : "entries"}
            </span>
            {heading.start_page && (
              <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                · {isMl ? "പേജ്" : "p."} {heading.start_page}{heading.end_page ? `–${heading.end_page}` : ""}
              </span>
            )}
          </div>
        </div>

        {/* Generated badge */}
        {isGenerated && (
          <span className="font-inter text-[8px] px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0"
            style={{ background: "rgba(251,191,36,0.08)", color: "#FBBF24" }}>
            <Sparkles className="w-2 h-2" />
            {isMl ? "സൃഷ്ടിച്ചത്" : "Generated"}
          </span>
        )}

        {/* Has children indicator */}
        {hasChildren && (
          <Layers className="w-3.5 h-3.5 flex-shrink-0" style={{ color: `${accent}99` }} />
        )}

        <ChevronLeft className="w-4 h-4 flex-shrink-0 rotate-180" style={{ color: `${accent}99` }} />
      </button>

      {/* Render children (recursive) */}
      {hasChildren && heading.children.map((child) => (
        <HeadingNode
          key={child.heading_id}
          heading={child}
          depth={depth + 1}
          onSelectHeading={onSelectHeading}
          isMl={isMl}
          accent={accent}
        />
      ))}
    </div>
  );
}

export default function SirrBookTOC({ book, headingTree, entries, onSelectHeading, onBack, language }) {
  const isMl = language === "ml";
  const accent = "#D4AF37";
  const totalEntries = entries.filter((e) => e.book_id === book.book_id).length;
  const totalHeadings = headingTree.length;

  // Count total headings recursively
  function countHeadings(nodes) {
    let count = 0;
    for (const n of nodes) {
      count++;
      if (n.children) count += countHeadings(n.children);
    }
    return count;
  }
  const allHeadingCount = countHeadings(headingTree);

  return (
    <div className="space-y-3">
      {/* Back button */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft className="w-4 h-4" /> {isMl ? "ഗ്രന്ഥ ശേഖരം" : "Library"}
        </button>
      </div>

      {/* Book header */}
      <div className="text-center pb-2">
        <BookOpen className="w-8 h-8 mx-auto" style={{ color: accent }} />
        {book.book_title_ar && (
          <h2 className="font-amiri text-2xl font-bold mt-1" style={{ color: accent, direction: "rtl" }}>
            {book.book_title_ar}
          </h2>
        )}
        <p className={`text-sm font-bold mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: accent }}>
          {book.book_title || book.book_name}
        </p>
        <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          {allHeadingCount} {isMl ? "തലവാചകങ്ങൾ" : "headings"} · {totalEntries} {isMl ? "രേഖകൾ" : "entries"}
        </p>
      </div>

      {/* Table of Contents */}
      {headingTree.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 px-1">
            <ListTree className="w-4 h-4" style={{ color: accent }} />
            <span className="font-inter text-xs font-bold" style={{ color: accent }}>
              {isMl ? "മൂല ഗ്രന്ഥ ഉള്ളടക്കം" : "Original Manuscript Table of Contents"}
            </span>
          </div>
          {headingTree.map((heading) => (
            <HeadingNode
              key={heading.heading_id}
              heading={heading}
              depth={0}
              onSelectHeading={onSelectHeading}
              isMl={isMl}
              accent={accent}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <ListTree className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.20)" }} />
          <p className={`text-xs ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.35)" }}>
            {isMl ? "ഈ ഗ്രന്ഥത്തിന് തലവാചക ഘടന കണ്ടെത്തിയില്ല." : "No heading structure detected for this book."}
          </p>
          <p className="font-inter text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
            {isMl ? "ഗ്രന്ഥം വീണ്ടും ഇറക്കുമതി ചെയ്യേണ്ടതുണ്ട്." : "The book may need to be re-imported."}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-2">
        <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          ⚖️ {isMl ? "മൂല ഗ്രന്ഥ ഘടന കൃത്യമായി സംരക്ഷിച്ചിരിക്കുന്നു" : "Manuscript structure preserved exactly as written"}
        </p>
      </div>
    </div>
  );
}
import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { G, T } from "../v3/shared";

// Collapsible "Sources" section. Lists ONLY book references (book name in its
// original language + page). Never dumps raw manuscript paragraphs into the
// main UI. Used by the decision-assistant cards so the report behaves as a
// Decision Assistant, not a Book Viewer.
export default function SourcesCollapse({ sources, lang, labelEn = "Sources", labelMl = "സ്രോതസ്സുകൾ" }) {
  const [open, setOpen] = useState(false);
  if (!sources || sources.length === 0) return null;
  const items = sources
    .map(s => ({
      name: s.source || s.book_title || s.source_book_title || "",
      page: s.page || s.page_number || s.source_page_number || "",
    }))
    .filter(s => s.name);
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 font-inter text-[10px] hover:opacity-80"
        style={{ color: G.dim }}
      >
        <BookOpen className="w-3 h-3 flex-shrink-0" />
        <span>{T(labelEn, labelMl, lang)}</span>
        <ChevronDown
          className="w-3 h-3 flex-shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        />
      </button>
      {open && (
        <div className="mt-1.5 space-y-1">
          {items.map((s, i) => (
            <p key={i} className="font-inter text-[10px]" style={{ color: G.dim }}>
              {s.name}{s.page ? ` · p.${s.page}` : ""}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
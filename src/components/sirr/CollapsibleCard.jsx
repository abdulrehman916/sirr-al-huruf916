// ═══════════════════════════════════════════════════════════════
// COLLAPSIBLE CARD — Premium Islamic Library UI
// ═══════════════════════════════════════════════════════════════
// Consistent numbered section card with expand/collapse.
// Used by SirrMethodDetail for the 16-field Dua display layout.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CollapsibleCard({
  sectionNumber,
  title,
  titleMl,
  accent = "#D4AF37",
  defaultOpen = true,
  language = "ml",
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isMl = language === "ml";

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: `${accent}08`, border: `1px solid ${accent}22` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 transition-all"
        style={{ background: open ? `${accent}06` : "transparent" }}
      >
        {sectionNumber && (
          <span
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: `${accent}20`, color: accent }}
          >
            {sectionNumber}
          </span>
        )}
        <span
          className="flex-1 text-left text-xs font-bold uppercase tracking-wide"
          style={{ color: `${accent}cc` }}
        >
          {isMl ? (titleMl || title) : title}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          style={{ color: `${accent}99` }}
        />
      </button>
      {open && <div className="px-3.5 pb-3.5 pt-0.5">{children}</div>}
    </div>
  );
}
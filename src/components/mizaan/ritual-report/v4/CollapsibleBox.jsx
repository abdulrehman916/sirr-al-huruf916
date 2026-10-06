import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { G, T } from "../v3/shared";

// CollapsibleBox — same visual design as Box, but collapsed by default and
// expands when the header is tapped. Only the header is visible when closed.
// Does NOT modify the shared Box component.
export default function CollapsibleBox({ number, titleEn, titleMl, icon: Icon, lang, children, defaultCollapsed = true }) {
  const [open, setOpen] = useState(!defaultCollapsed);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      <div className="flex items-center gap-3 p-4 cursor-pointer select-none" style={{ borderBottom: open ? `1px solid ${G.border}` : "none" }} onClick={() => setOpen(o => !o)}>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
            <Icon className="w-5 h-5" style={{ color: G.text }} />
          </div>
        )}
        <div className="flex items-center gap-2 flex-1">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>{number}</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>{T(titleEn, titleMl, lang)}</h3>
        </div>
        <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-200" style={{ color: G.dim, transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </div>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// SIRR ACCORDION SECTION — LANGUAGE-AWARE CATEGORY HEADER
// ═══════════════════════════════════════════════════════════════
// Shows Arabic title + selected-language title only.
// ML mode → Arabic + Malayalam
// EN mode → Arabic + English
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function SirrAccordionSection({
  titleAr,
  titleMl,
  count,
  accent = "#D4AF37",
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${accent}30`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3.5 text-left"
        style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
      >
        <span
          className="font-amiri text-lg flex-shrink-0"
          style={{ color: accent, direction: "rtl" }}
        >
          {titleAr}
        </span>
        <div className="flex-1 min-w-0">
          <span className="font-malayalam text-sm font-bold block" style={{ color: accent }}>
            {titleMl}
          </span>
        </div>
        <span
          className="font-inter text-[10px] px-2 py-0.5 rounded flex-shrink-0 font-bold"
          style={{
            background: `${accent}15`,
            color: accent,
            border: `1px solid ${accent}30`,
          }}
        >
          {count}
        </span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{ color: accent, transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// REUSABLE COLLAPSIBLE SECTION — lazy renders children only when open
// Every top-level dashboard section uses this wrapper
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.25)",
  borderHi: "rgba(212,175,55,0.45)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.08)",
};

export default function DashboardSection({ icon, title, subtitle, defaultOpen = false, alwaysOpen = false, badge = null, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = alwaysOpen || open;

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: "linear-gradient(145deg, rgba(8,18,44,0.98) 0%, rgba(4,10,28,0.99) 100%)",
      border: `1px solid ${G.border}`,
      boxShadow: "0 2px 20px rgba(0,0,0,0.40), inset 0 1px 0 rgba(212,175,55,0.06)",
    }}>
      <button
        onClick={() => { if (!alwaysOpen) setOpen(!open); }}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
          background: G.bg, border: `1px solid ${G.border}`,
        }}>
          <span className="text-lg leading-none">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-inter text-sm font-bold tracking-wide truncate" style={{ color: G.text }}>{title}</h2>
          {subtitle && <p className="font-inter text-[10px] truncate" style={{ color: "rgba(255,255,255,0.40)" }}>{subtitle}</p>}
        </div>
        {badge && (
          <span className="font-inter text-[9px] px-2 py-0.5 rounded-full flex-shrink-0" style={{
            background: "rgba(212,175,55,0.15)", color: G.dim, border: `1px solid ${G.border}`,
          }}>{badge}</span>
        )}
        {!alwaysOpen && (
          <ChevronDown className="w-5 h-5 flex-shrink-0 transition-transform duration-200" style={{
            color: G.dim, transform: open ? "rotate(180deg)" : "none",
          }} />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Compact sub-card for use inside sections ──
export function MiniCard({ label, value, color, icon }) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-1" style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.12)",
    }}>
      <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>
        {icon && <span className="mr-1">{icon}</span>}{label}
      </span>
      <span className="font-inter text-sm font-bold" style={{ color: color || "rgba(255,255,255,0.85)" }}>
        {value}
      </span>
    </div>
  );
}

// ── Status badge ──
export function StatusBadge({ status }) {
  const map = {
    excellent: { color: "#4ADE80", bg: "rgba(74,222,128,0.10)", border: "rgba(74,222,128,0.30)", label: { en: "Excellent", ml: "മികച്ചത്", tr: "Mükemmel" } },
    good: { color: "#86EFAC", bg: "rgba(134,239,172,0.08)", border: "rgba(134,239,172,0.25)", label: { en: "Good", ml: "നല്ലത്", tr: "İyi" } },
    neutral: { color: "#FBBF24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", label: { en: "Neutral", ml: "സാധാരണം", tr: "Nötr" } },
    avoid: { color: "#F87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", label: { en: "Avoid", ml: "ഒഴിവാക്കുക", tr: "Kaçının" } },
    current: { color: "#F5D060", bg: "rgba(212,175,55,0.12)", border: "rgba(212,175,55,0.40)", label: { en: "Current", ml: "നിലവിലെ", tr: "Mevcut" } },
    past: { color: "rgba(255,255,255,0.25)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", label: { en: "Past", ml: "കഴിഞ്ഞത്", tr: "Geçti" } },
    upcoming: { color: "rgba(255,255,255,0.50)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.10)", label: { en: "Upcoming", ml: "വരാനിരിക്കുന്നത്", tr: "Yaklaşan" } },
  };
  const s = map[status] || map.neutral;
  return s;
}

// ── Collapsible sub-section (for use inside dashboard sections) ──
export function SubCollapse({ title, children, defaultOpen = false, lang = "en" }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg overflow-hidden" style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.10)",
    }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-2.5 text-left">
        <span className="font-inter text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.60)" }}>{title}</span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ color: "rgba(212,175,55,0.40)", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="px-2.5 pb-2.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// METHOD 4 — CONCLUSION (display-only, collapsible)
// Informational card only. No calculations, no logic.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const G = {
  gold:         "#F5D060",
  goldDim:      "rgba(245,208,96,0.55)",
  goldFaint:    "rgba(245,208,96,0.10)",
  goldBorder:   "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  bgCard:       "rgba(8,16,40,0.98)",
  dim:          "rgba(255,255,255,0.75)",
};

const PARAGRAPHS = [
  `ഈ രണ്ട് നാമങ്ങളും അവയുടെ കബീർ അബ്ജദ് (Ebced-i Kebîr) സംഖ്യയ്ക്ക് അനുസരിച്ച് പാരായണം ചെയ്താൽ, അല്ലാഹു തആലായുടെ അനുമതിയാൽ ആവശ്യപ്പെട്ട കാര്യം സഫലമാകും.`,
  `എസ്മാ-ഇ അഅ്‌വാൻ (Esma-i A'van)യും എസ്മാ-ഇ ഖസം (Esma-i Kasem)യും ഒരു അസീമത്ത് (Azimet) സഹിതം ബന്ധിപ്പിക്കാൻ ആഗ്രഹിക്കുന്നുവെങ്കിൽ, നിങ്ങളുടെ ലക്ഷ്യത്തിന് അനുയോജ്യമായ ഒരു അസീമത്ത് തയ്യാറാക്കുക.`,
  `തുടർന്ന്, ആ അസീമത്ത് നിങ്ങളുടെ ആവശ്യത്തിന്റെ (മത്ലൂബ്) പേരിന്റെ അബ്ജദ് സംഖ്യയ്ക്ക് തുല്യമായ എണ്ണത്തിൽ, ഏഴ് ദിവസം പാരായണം ചെയ്യുക.`,
];

export default function Method4Conclusion({ avanName = "", avanValue = 0, kasemName = "", kasemValue = 0 }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: G.bgCard, borderColor: G.goldBorderHi, boxShadow: `0 0 32px rgba(212,175,55,0.14), 0 4px 20px rgba(0,0,0,0.45)` }}>

      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:opacity-80 transition-opacity">
        <div className="flex flex-col text-left">
          <span className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: G.gold }}>CONCLUSION</span>
          <span className="font-amiri text-lg font-bold leading-tight" style={{ color: G.gold }} dir="rtl">النتيجة</span>
        </div>
        <div className="flex items-center justify-center w-6 h-6 rounded-lg flex-shrink-0"
          style={{ background: "rgba(212,175,55,0.22)", border: `1px solid ${G.goldBorder}` }}>
          {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color: G.gold }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: G.gold }} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="h-px w-full" style={{ background: G.goldBorder }} />
            <div className="px-5 py-4 space-y-3">
              {(avanName || kasemName) && (
                <div className="space-y-2 mb-3 pb-3 border-b" style={{ borderColor: G.goldBorder + "40" }}>
                  {avanName && (
                    <div className="rounded-lg border p-3" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
                      <div className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: G.gold }}>ASMA-UL A'VAN</div>
                      <div className="font-amiri text-xl font-bold mb-1" style={{ color: G.gold, lineHeight: 1.8 }} dir="rtl">{avanName}</div>
                      <div className="font-inter text-xs" style={{ color: G.dim }}>Value: <span className="font-bold tabular-nums" style={{ color: G.gold }}>{avanValue.toLocaleString()}</span></div>
                    </div>
                  )}
                  {kasemName && (
                    <div className="rounded-lg border p-3" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
                      <div className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: G.gold }}>ASMA-UL KASEM</div>
                      <div className="font-amiri text-xl font-bold mb-1" style={{ color: G.gold, lineHeight: 1.8 }} dir="rtl">{kasemName}</div>
                      <div className="font-inter text-xs" style={{ color: G.dim }}>Value: <span className="font-bold tabular-nums" style={{ color: G.gold }}>{kasemValue.toLocaleString()}</span></div>
                    </div>
                  )}
                </div>
              )}
              {PARAGRAPHS.map((p, i) => (
                <p key={i} className="font-malayalam text-sm leading-relaxed" style={{ color: G.dim }}>{p}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
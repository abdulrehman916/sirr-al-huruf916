// ═══════════════════════════════════════════════════════════════
// METHOD 4 — FINAL RESULT SUMMARY (display-only)
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";

const G = {
  gold:         "#F5D060",
  goldDim:      "rgba(245,208,96,0.55)",
  goldFaint:    "rgba(212,175,55,0.07)",
  goldBorder:   "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  glow:         "rgba(212,175,55,0.18)",
  bg:           "rgba(3,6,20,0.99)",
  bgInner:      "rgba(212,175,55,0.06)",
  dim:          "rgba(255,255,255,0.35)",
};

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${G.goldBorder})` }} />
      <span style={{ color: G.goldDim, fontSize: 10 }}>✦</span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${G.goldBorder})` }} />
    </div>
  );
}

function ResultRow({ index, title, arabic, names, adad }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: G.bgInner, borderColor: G.goldBorder + "55" }}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg font-inter text-[11px] font-black flex-shrink-0"
          style={{ background: G.gold + "22", border: `1px solid ${G.gold}55`, color: G.gold }}>
          {index}
        </div>
        <span className="font-inter text-[11px] font-bold" style={{ color: G.gold }}>{title}</span>
        <span className="font-amiri text-sm" style={{ color: G.goldDim }}>{arabic}</span>
      </div>
      <div className="space-y-2 pl-1">
        <div className="flex items-start gap-2">
          <span className="font-inter text-[9px] uppercase tracking-widest flex-shrink-0 mt-1" style={{ color: G.dim }}>Name(s):</span>
          <div className="flex flex-wrap gap-2" dir="rtl">
            {(names && names.length > 0 ? names : ["—"]).map((n, i) => (
              <span key={i} className="font-amiri text-lg font-bold px-3 py-1 rounded-lg border"
                style={{ color: G.gold, borderColor: G.goldBorder + "55", background: G.goldFaint, lineHeight: 1.7 }}>
                {n}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>Adad (Count):</span>
          <span className="font-inter text-base font-black tabular-nums" style={{ color: G.gold }}>{(adad || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function Method4FinalSummary({ kitabetNames, kitabetAdad, avanNames, avanAdad, kasemNames, kasemAdad }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:  G.bg,
        borderColor: G.goldBorderHi,
        boxShadow:   `0 0 80px ${G.glow}, 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />

      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-3"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
          <span className="font-inter text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Final Reading Instruction</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
      </div>

      <OrnamentalDivider />

      <div className="px-4 pb-6 space-y-3 pt-4">
        <ResultRow index="1" title="Esma-i Kitabet" arabic="أسماء الكتابة" names={kitabetNames} adad={kitabetAdad} />
        <ResultRow index="2" title="Esma-i A'van" arabic="أسماء الأعوان" names={avanNames} adad={avanAdad} />
        <ResultRow index="3" title="Esma-i Kasem" arabic="أسماء القسم" names={kasemNames} adad={kasemAdad} />

        <OrnamentalDivider />

        <div className="rounded-xl border p-4 space-y-3" style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <p className="font-malayalam text-sm leading-relaxed text-center" style={{ color: G.gold }}>
            എസ്മാ-ഇ കിതാബത്ത് (Esma-i Kitabet), എസ്മാ-ഇ അഅ്‌വാൻ (Esma-i A'van), എസ്മാ-ഇ ഖസം (Esma-i Kasem) എന്നിവയുടെ സംഖ്യകൾ (അദദ്) അനുസരിച്ച് ഇത് പാരായണം ചെയ്താൽ, അല്ലാഹു ﷻയുടെ അനുമതിയാൽ ആവശ്യപ്പെട്ട കാര്യം പൂർത്തിയാകും.
          </p>
          <div className="h-px w-full" style={{ background: G.goldBorder }} />
          <p className="font-inter text-xs leading-relaxed text-center italic" style={{ color: G.dim }}>
            Read the Esma-i Kitabet, Esma-i A'van, and Esma-i Kasem according to their calculated Adad (counts). By the permission of Allah ﷻ, the intended purpose will be fulfilled.
          </p>
        </div>
      </div>

      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}
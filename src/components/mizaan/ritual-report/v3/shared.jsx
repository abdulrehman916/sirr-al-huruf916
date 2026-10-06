// ═══════════════════════════════════════════════════════════════
// V3 DECISION UI — shared box wrapper + re-exports
// Pure display layer. No calculation logic — all data comes from
// the existing ritualTimingEngineV3 analysis object.
// ═══════════════════════════════════════════════════════════════
import { G, T, translatePlanet, translateDay, saatDisplayNum, DAY_KEY_BY_INDEX, MIZAN_DAY_NAMES } from "../shared";
import { computeCompat, compatColor } from "../v2/compatibility";
import { BookOpen } from "lucide-react";

export { G, T, translatePlanet, translateDay, saatDisplayNum, DAY_KEY_BY_INDEX, MIZAN_DAY_NAMES, computeCompat, compatColor };

export function Box({ number, titleEn, titleMl, icon: Icon, lang, children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${G.border}`,
        boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)",
      }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
            <Icon className="w-5 h-5" style={{ color: G.text }} />
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>{number}</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T(titleEn, titleMl, lang)}
          </h3>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// 7 classical planets for Box 9 expandable list
export const PLANET_LIST = [
  { key: "sun", en: "Sun", ml: "സൂര്യൻ", symbol: "☀" },
  { key: "moon", en: "Moon", ml: "ചന്ദ്രൻ", symbol: "☾" },
  { key: "mercury", en: "Mercury", ml: "ബുധൻ", symbol: "☿" },
  { key: "venus", en: "Venus", ml: "ശുക്രൻ", symbol: "♀" },
  { key: "mars", en: "Mars", ml: "ചൊവ്വ", symbol: "♂" },
  { key: "jupiter", en: "Jupiter", ml: "ഗുരു", symbol: "♃" },
  { key: "saturn", en: "Saturn", ml: "ശനി", symbol: "♄" },
];

// ── Source display helpers (#7) ──────────────────────────────────
// Every rule shown on screen displays Book Name · Page · Rule Title.
// Multiple books supporting the same result → every distinct source shown.
export function fmtRuleSource(rule) {
  if (!rule) return "";
  const book = rule.source || "";
  const page = rule.page ? `p.${rule.page}` : "";
  return [book, page].filter(Boolean).join(" · ");
}

export function RuleSources({ rules, lang, tone = "neutral" }) {
  if (!rules || rules.length === 0) return null;
  const color = tone === "support" ? "#4ADE80" : tone === "oppose" ? "#F87171" : G.dim;
  // Dedup by source + page — every distinct book/page shown once.
  const seen = new Set();
  const unique = [];
  for (const r of rules) {
    const key = (r.source || "") + "|" + (r.page || "");
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(r);
  }
  return (
    <div className="space-y-1.5">
      {unique.map((r, i) => (
        <div key={i} className="rounded-lg p-2" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color }} />
            <span className="font-inter text-[10px] font-bold" style={{ color: "#fff" }}>{fmtRuleSource(r)}</span>
          </div>
          {r.title && <p className="font-inter text-[11px] leading-snug mt-0.5" style={{ color: "rgba(255,255,255,0.72)" }}>{r.title}</p>}
        </div>
      ))}
    </div>
  );
}
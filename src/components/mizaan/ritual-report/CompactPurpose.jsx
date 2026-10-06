// ═══════════════════════════════════════════════════════════════
// COMPACT PURPOSE — Selected purpose + auto-identified type
// Short card: Purpose name, Type. Nothing more.
// ═══════════════════════════════════════════════════════════════
import { Target } from "lucide-react";
import { G, T } from "./shared";

const PURPOSE_TYPE = {
  love: { en: "Love", ml: "സ്നേഹം" },
  separation: { en: "Separation", ml: "വേർപിരിക്കൽ" },
  healing: { en: "Health", ml: "ആരോഗ്യം" },
  enemy: { en: "Enemy", ml: "ശത്രു" },
  protection: { en: "Protection", ml: "സംരക്ഷണം" },
  wealth: { en: "Wealth", ml: "സമ്പത്ത്" },
  knowledge: { en: "Knowledge", ml: "വിജ്ഞാനം" },
  travel: { en: "Travel", ml: "യാത്ര" },
  planetary: { en: "Planetary", ml: "ഗ്രഹം" },
  spiritual: { en: "Spiritual", ml: "ആത്മീയ" },
  general: { en: "General", ml: "പൊതു" },
};

export default function CompactPurpose({ analysis, resolvedPurpose, lang }) {
  const ritualKey = analysis?.ritualType || "";
  const purposeText =
    (lang === "ml"
      ? resolvedPurpose?.interpretation_ml
      : resolvedPurpose?.interpretation_en) || ritualKey || "";

  // Extract the ritual key from the engine's internal identification
  const engineKey = analysis?.selectionAnalysis?.contextRecord?.planet
    ? null
    : null; // ritualKey is embedded in ritualType label

  // Try to find the purpose type from the ritualType label
  const typeKey = Object.keys(PURPOSE_TYPE).find((k) =>
    ritualKey.toLowerCase().includes(k)
  ) || "general";
  const typeInfo = PURPOSE_TYPE[typeKey] || PURPOSE_TYPE.general;

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background:
          "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${G.border}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}
        >
          <Target className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-inter text-[10px] uppercase tracking-wider font-bold mb-0.5"
            style={{ color: G.dim }}
          >
            {T("Purpose", "ലക്ഷ്യം", lang)}
          </p>
          <p
            className={
              lang === "ml"
                ? "font-malayalam text-sm font-bold truncate"
                : "font-inter text-sm font-bold truncate"
            }
            style={{ color: "#fff" }}
          >
            {purposeText}
          </p>
        </div>
        <span
          className="font-inter text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0"
          style={{
            background: G.bgHi,
            border: `1px solid ${G.border}`,
            color: G.text,
          }}
        >
          {lang === "ml" ? typeInfo.ml : typeInfo.en}
        </span>
      </div>
    </div>
  );
}
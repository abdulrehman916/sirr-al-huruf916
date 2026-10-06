// ═══════════════════════════════════════════════════════════════
// SECTION 3 — TODAY'S 24 SAHATH
// Unified grid of all 24 planetary hours (12 day + 12 night)
// Compact cards: Saat #, Time, Planet, Quality, Status — expandable
// GLOBAL RULE: Quality (strength) and Status (Completed/Active/Upcoming)
// are independent. Card color = quality. Badge = status. Never "Avoid".
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useAstroData } from "./useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import ManuscriptSourcePanel from "./ManuscriptSourcePanel";
import AstroContextKnowledgePanel from "./AstroContextKnowledgePanel";
import { getKashfHourAttributes } from "@/lib/astroClockManuscriptMerger";
import { getPlanetHourRules } from "@/lib/astroClockPlanetaryHourRules.js";
import { getSahathQuality } from "@/lib/astroClockSahathQuality.js";
import { PLANET_AR_ML } from "@/lib/astroClockLabelMap";
import { formatDecimalHour12h } from "@/lib/astroClockTimeFormat";
import { useIsOwner } from "@/hooks/useIsOwner";

// Status badge — independent from quality. Controls badge text + card opacity only.
const STATUS_BADGE = {
  current: { color: "#4ADE80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.45)" },
  upcoming: { color: "#F5D060", bg: "rgba(212,175,55,0.08)", border: "rgba(212,175,55,0.25)" },
  past: { color: "rgba(255,255,255,0.40)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
};

function hourStatus(isCurrent, isPast) {
  if (isCurrent) return "current";
  if (isPast) return "past";
  return "upcoming";
}

export default function SaatGrid() {
  const d = useAstroData();
  const { txt, txtA, language } = useAstroClockLanguage();
  const isOwner = useIsOwner();
  const [expanded, setExpanded] = useState(null);
  if (!d.allHours) return null;

  const dayHours = d.allHours.filter(h => h.period === "day");
  const nightHours = d.allHours.filter(h => h.period === "night");

  const renderHour = (h) => {
    const status = hourStatus(h.status === "current", h.status === "past");
    const sBadge = STATUS_BADGE[status];
    const quality = getSahathQuality(h.planet, d.dayRuler?.planet);
    const planetName = language === "ml" ? d.planetInfo[h.planet]?.name_ml_equivalent : language === "ar" ? d.planetInfo[h.planet]?.name_ar : d.planetInfo[h.planet]?.name_en;
    const symbol = d.planetInfo[h.planet]?.symbol || "";
    const displayNum = h.period === "night" ? h.hourNumber - 12 : h.hourNumber;
    const isOpen = expanded === `${h.period}-${h.hourNumber}`;

    const planetRules = getPlanetHourRules(h.planet);
    const bestSuited = language === "ml" ? planetRules?.strengthenedActions?.ml : planetRules?.strengthenedActions?.en;
    const suitable = language === "ml" ? planetRules?.suitableActions?.ml : planetRules?.suitableActions?.en;
    const caution = language === "ml" ? planetRules?.weakenedActions?.ml : planetRules?.weakenedActions?.en;
    const lessSuitable = language === "ml" ? planetRules?.unsuitableActions?.ml : planetRules?.unsuitableActions?.en;
    const warnings = language === "ml" ? d.planetInfo[h.planet]?.warnings_ml : d.planetInfo[h.planet]?.warnings_en;
    const spiritual = language === "ml" ? d.planetInfo[h.planet]?.spiritualOperations_ml : d.planetInfo[h.planet]?.spiritualOperations_en;
    const source = d.planetInfo[h.planet]?.source;
    const kashfAttrs = getKashfHourAttributes(d.activeDayIndex, displayNum, h.period);

    const statusLabels = {
      current: txt("സജീവം", "Active Now", "Mevcut"),
      upcoming: txt("വരാനിരിക്കുന്ന", "Upcoming", "Gelecek"),
      past: txt("പൂർത്തിയായി", "Completed", "Geçti"),
    };
    const qualityLabel = txtA(quality.label_ml, quality.label_en, quality.label_ar);

    return (
      <div key={`${h.period}-${h.hourNumber}`} className="rounded-xl" style={{
        position: "relative",
        background: quality.color + "0D",
        border: `1px solid ${quality.color}40`,
        opacity: status === "past" ? 0.55 : 1,
        boxShadow: status === "current" ? `0 0 16px ${quality.color}30` : "none",
        transition: "opacity 0.3s ease, box-shadow 0.3s ease",
        overflow: "visible",
        zIndex: isOpen ? 20 : 1,
        isolation: isOpen ? "isolate" : "auto",
      }}>
        <button onClick={() => setExpanded(isOpen ? null : `${h.period}-${h.hourNumber}`)}
          className="w-full flex items-center gap-2 p-2.5 text-left rounded-xl">
          <span className="font-inter text-xs font-bold tabular-nums w-7 text-center" style={{ color: quality.color }}>#{displayNum}</span>
          <span className="text-base leading-none">{symbol}</span>
          <div className="flex-1 min-w-0">
            {language === "ml" && PLANET_AR_ML[h.planet] ? (
              <>
                <span className="font-amiri block truncate" style={{ color: quality.color, fontWeight: 700, lineHeight: 1.4, direction: 'rtl' }}>{PLANET_AR_ML[h.planet].ar}</span>
                <span className="font-malayalam-sm block truncate" style={{ color: 'rgba(212,175,55,0.55)', lineHeight: 1.3 }}>{PLANET_AR_ML[h.planet].ml}</span>
              </>
            ) : (
              <span className="font-inter text-xs font-bold block truncate" style={{ color: quality.color }}>{planetName}</span>
            )}
            <span className="font-inter text-[9px] tabular-nums" style={{ color: "rgba(255,255,255,0.40)" }}>{h.startTime} – {h.endTime}</span>
          </div>
          {/* Quality badge — colored dot + strength label (manuscript-based) */}
          <span className="font-inter text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0" style={{ background: quality.color + "15", border: `1px solid ${quality.color}40` }}>
            <span>{quality.dot}</span>
            <span style={{ color: quality.color }}>{qualityLabel}</span>
          </span>
          {/* Status badge — Completed / Active Now / Upcoming (independent from quality) */}
          <span className="font-inter text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: sBadge.bg, color: sBadge.color, border: `1px solid ${sBadge.border}` }}>
            {statusLabels[status]}
          </span>
          <ChevronDown className="w-3.5 h-3.5 transition-transform flex-shrink-0" style={{ color: quality.color, transform: isOpen ? "rotate(180deg)" : "none" }} />
        </button>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}
            className="rounded-b-xl shadow-2xl"
            style={{
              background: "rgba(4,10,24,0.97)",
              borderTop: `1px solid ${quality.color}30`,
              borderLeft: `1px solid ${quality.color}40`,
              borderRight: `1px solid ${quality.color}40`,
              borderBottom: `1px solid ${quality.color}40`,
            }}
          >
            <div className="px-2.5 pb-2.5 space-y-1.5">
                {h.timeRemaining && (
                  <p className="font-inter text-[10px]" style={{ color: "#F5D060" }}>⏳ {txt("ബാക്കി", "Remaining", "Kalan")}: {h.timeRemaining}</p>
                )}
                {/* Section render order follows the calculated quality tier (UI order ONLY).
                    WEAK (ദുർബലം) hours lead with warnings / less-suitable / caution so the
                    user immediately sees what must be avoided — never with recommendations.
                    Other tiers lead with best-suited, matching Excellent/Good/Medium order.
                    Labels and content are unchanged — only the render order. */}
                {(() => {
                  const secBest = bestSuited?.length > 0 ? (
                    <div>
                      <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(34,197,94,0.70)" }}>{txt("ഏറ്റവും അനുയോജ്യം", "Best Suited", "En Uygun")}</p>
                      {bestSuited.slice(0, 3).map((a, i) => <p key={i} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>• {a}</p>)}
                    </div>
                  ) : null;
                  const secSuit = suitable?.length > 0 ? (
                    <div>
                      <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(134,239,172,0.60)" }}>{txt("അനുയോജ്യം", "Suitable", "Uygun")}</p>
                      {suitable.slice(0, 3).map((a, i) => <p key={i} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>• {a}</p>)}
                    </div>
                  ) : null;
                  const secCaut = caution?.length > 0 ? (
                    <div>
                      <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(251,191,36,0.60)" }}>{txt("ശ്രദ്ധിക്കുക", "Caution", "Dikkat")}</p>
                      {caution.slice(0, 2).map((a, i) => <p key={i} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>• {a}</p>)}
                    </div>
                  ) : null;
                  const secLess = lessSuitable?.length > 0 ? (
                    <div>
                      <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(248,113,113,0.55)" }}>{txt("കുറവ് അനുയോജ്യം", "Less Suitable", "Daha Az Uygun")}</p>
                      {lessSuitable.slice(0, 2).map((a, i) => <p key={i} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>• {a}</p>)}
                    </div>
                  ) : null;
                  const secSpir = spiritual?.length > 0 ? (
                    <div>
                      <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(129,140,248,0.60)" }}>{txt("ആത്മികം", "Spiritual", "Manevi")}</p>
                      {spiritual.slice(0, 2).map((a, i) => <p key={i} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>• {a}</p>)}
                    </div>
                  ) : null;
                  const secWarn = warnings?.length > 0 ? (
                    <div>
                      <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(251,191,36,0.50)" }}>{txt("മുന്നറിയിപ്പുകൾ", "Warnings", "Uyarılar")}</p>
                      {warnings.map((a, i) => <p key={i} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>• {a}</p>)}
                    </div>
                  ) : null;
                  const order = quality.tier === 1
                    ? [secLess, secWarn, secCaut, secSuit, secSpir, secBest]
                    : [secBest, secSuit, secCaut, secLess, secSpir, secWarn];
                  return <>{order.filter(Boolean)}</>;
                })()}
                {isOwner && source && (
                  <p className="font-inter text-[8px]" style={{ color: "rgba(74,222,128,0.40)" }}>📖 {source}</p>
                )}
                {kashfAttrs.length > 0 && (
                  <ManuscriptSourcePanel
                    sources={[{
                      id: "kashf",
                      label: "كشف الحقائق",
                      items: kashfAttrs.map(a => ({
                        ar: a.ar, en: a.en, ml: a.ml, tr: a.tr,
                        type: a.type === "answer" ? "answer" : a.type === "dominance" ? "dominance" : "jaad",
                        source: a.source,
                      }))
                    }]}
                  />
                )}
                {/* FULL-CONTEXT MANUSCRIPT KNOWLEDGE — Day+Saat+Kawkab specific */}
                <AstroContextKnowledgePanel
                  qualityTier={quality.tier}
                  context={{
                    weekday: d.activeDayIndex,
                    period: h.period,
                    saat_number: h.hourNumber,
                    planet: h.planet,
                    nakshatra: d.currentMansion?.name_en || ''
                  }}
                />
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Day Hours */}
      <div>
        <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "rgba(212,175,55,0.55)" }}>
          ☀ {txt("പകൽ 12 ساعة", "Daytime 12 Saat", "Gündüz 12 Saat")} — {txt("സൂര്യോദയം", "Sunrise", "Doğuş")} {formatDecimalHour12h(d.sunrise, language)} → {txt("അസ്തമയം", "Sunset", "Batış")} {formatDecimalHour12h(d.sunset, language)}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {dayHours.map(renderHour)}
        </div>
      </div>

      {/* Night Hours */}
      <div>
        <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "rgba(129,140,248,0.55)" }}>
          🌙 {txt("രാത്രി 12 ساعة", "Nighttime 12 Saat", "Gece 12 Saat")} — {txt("അസ്തമയം", "Sunset", "Batış")} {formatDecimalHour12h(d.sunset, language)} → {txt("സൂര്യോദയം", "Sunrise", "Doğuş")} {formatDecimalHour12h(d.sunrise, language)}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {nightHours.map(renderHour)}
        </div>
      </div>
    </div>
  );
}
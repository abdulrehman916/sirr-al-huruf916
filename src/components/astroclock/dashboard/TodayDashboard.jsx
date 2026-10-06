// ═══════════════════════════════════════════════════════════════
// SECTION 1 — TODAY'S DASHBOARD
// Single-glance live summary: Day, Layl/Nahar, Saat, Kawkab, Verdict,
// Moon snapshot. Activities & Warnings collapsed with references.
//
// UI PATTERN: Summary → Expand → Details → References
// LANGUAGE RULE: One language per card — no mixing
// DATA RULE: Live values from useAstroData only — no new calculations
// ═══════════════════════════════════════════════════════════════
import { useAstroData, DAY_AR, PLANET_AR } from "./useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { MiniCard, SubCollapse } from "./DashboardSection";
import { getKashfLunarDayInfo, getKashfNahsStatus } from "@/lib/astroClockManuscriptMerger";
import { MANSION_ML_NAMES } from "@/lib/astroClockMansionsML";
import { zodiacEnToML, planetArabicMLDisplay, PLANET_AR_ML } from "@/lib/astroClockLabelMap";
import { Sparkles, AlertTriangle, CheckCircle2, Ban, Moon } from "lucide-react";
import { formatDecimalHour12h } from "@/lib/astroClockTimeFormat";
import MagicalPeriodPanel from "./MagicalPeriodPanel";
import { useIsOwner } from "@/hooks/useIsOwner";

const BENEFIC = ["sun", "jupiter", "venus", "moon"];
const MALEFIC = ["saturn", "mars"];

export default function TodayDashboard() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  const isOwner = useIsOwner();
  if (!d.currentHour) return null;

  // ── Language-specific names (Arabic uses existing DAY_AR / PLANET_AR) ──
  const dayName = language === "ar" ? DAY_AR[d.activeDayIndex]
    : language === "ml" ? d.dayInfo?.name_ml : d.dayInfo?.name_en;
  const planetName = language === "ar" ? (PLANET_AR[d.currentHour.planet] || d.planetInfo[d.currentHour.planet]?.name_en)
    : language === "ml" ? d.planetInfo[d.currentHour.planet]?.name_ml_equivalent
    : d.planetInfo[d.currentHour.planet]?.name_en;
  const planetNameAr = d.planetInfo[d.currentHour.planet]?.name_ar;
  const dayRulerName = language === "ar" ? (PLANET_AR[d.dayRuler.planet] || d.planetInfo[d.dayRuler.planet]?.name_en)
    : language === "ml" ? (PLANET_AR_ML[d.dayRuler.planet]?.ml || d.planetInfo[d.dayRuler.planet]?.name_ml_equivalent)
    : d.planetInfo[d.dayRuler.planet]?.name_en;
  const dayRulerSymbol = d.planetInfo[d.dayRuler.planet]?.symbol || "☉";

  // ── Verdict ──
  const isBenefic = BENEFIC.includes(d.dayRuler.planet);
  const isMalefic = MALEFIC.includes(d.dayRuler.planet);
  const verdictColor = isBenefic ? "#4ADE80" : isMalefic ? "#FBBF24" : "#86EFAC";
  const verdictText = isBenefic
    ? txt("മികച്ച ദിവസം", "Excellent Day", "Mükemmel Gün")
    : isMalefic
      ? txt("ശ്രദ്ധിക്കുക", "Cautious Day", "Dikkatli Gün")
      : txt("നല്ല ദിവസം", "Good Day", "İyi Gün");
  const verdictSub = language === "ar"
    ? `يحكمه ${PLANET_AR[d.dayRuler.planet] || dayRulerName}`
    : txt(
        `${dayRulerName} ഭരിക്കുന്നു`,
        `Ruled by ${dayRulerName}`,
        `${dayRulerName} yönetir`
      );

  // ── Activities (language-specific, manuscript-sourced) ──
  let bestActivities = [], avoidActivities = [];
  if (language === "ml") {
    bestActivities = d.dayInfo?.benefits_ml || [];
    avoidActivities = d.dayInfo?.warnings_ml || [];
  } else if (language === "ar") {
    // No approved Arabic benefits/warnings exist in the codebase — show none (no English leak).
    bestActivities = [];
    avoidActivities = [];
  } else {
    bestActivities = d.dayInfo?.benefits_en || d.weekdayAnalysis?.goodWorks || [];
    avoidActivities = d.dayInfo?.warnings_en || d.weekdayAnalysis?.badWorks || [];
  }

  // ── Moon snapshot (compact — full Moon data in Section 4) ──
  const moonSymbol = d.moonPosition?.zodiacSign?.symbol;
  const moonSignName = language === "ar"
    ? (d.moonZodiacFull?.name_ar || "—")
    : language === "ml" ? zodiacEnToML(d.moonPosition?.zodiacSign?.name_en)
    : d.moonPosition?.zodiacSign?.name_en;
  const moonPhasePct = d.moonPosition ? parseFloat(d.moonPosition.phase) : 0;
  const phaseEn = d.moonPhaseDesc?.en || "";
  // No approved Arabic moon-phase label exists in the codebase — show percentage only in Arabic mode.
  const moonPhaseLabel = language === "ar" ? "" : (language === "ml" ? d.moonPhaseDesc?.ml : phaseEn);
  const moonMansionName = MANSION_ML_NAMES[d.currentMansion?.name] || "";
  const moonMansionDisplay = language === "ar"
    ? `#${d.currentMansion?.no || "?"} ${d.currentMansion?.name_arabic || ""}`.trim()
    : language === "ml"
    ? `#${d.currentMansion?.no || "?"} ${moonMansionName}`.trim()
    : `#${d.currentMansion?.no || "?"} ${d.currentMansion?.name || ""}`.trim();

  // ── Kashf lunar day data ──
  const kashfLunarDay = getKashfLunarDayInfo(d.lunarDay);
  const kashfNahs = getKashfNahsStatus(d.lunarDay);

  // ── Warnings (language-specific — no mixing) ──
  const warnings = [];
  if (kashfNahs?.isNahs && language !== "ar") {
    warnings.push(language === "ml" ? kashfNahs.ml : kashfNahs.en);
  }
  if (d.moonDignity?.strength === "weakest") {
    warnings.push(txt("ചന്ദ്രൻ നീചം (വൃശ്ചികം)", "Moon debilitated (Scorpio)", "Ay düşük (Akrep)"));
  }
  if (language === "ml" && d.planetInfo[d.currentHour.planet]?.warnings_ml?.length) {
    warnings.push(d.planetInfo[d.currentHour.planet].warnings_ml[0]);
  } else if (language === "en" && d.planetInfo[d.currentHour.planet]?.warnings_en?.length) {
    warnings.push(d.planetInfo[d.currentHour.planet].warnings_en[0]);
  }
  // TR: No planet warnings in TR — only Moon debilitated warning shows if applicable

  const G = { text: "#F5D060", dim: "rgba(212,175,55,0.55)", border: "rgba(212,175,55,0.20)" };
  const refDay = txt("ഹാവാസ്സ് ദേരിൻലിക്ലേരി, പേ. 50-51", "Havâss'ın Derinlikleri, p.50-51", "Havâss'ın Derinlikleri, s.50-51");
  const refWarn = txt("താഹ, പേ. 46, 66", "Taha, p.46, 66", "Taha, s.46, 66");

  return (
    <div className="space-y-3">
      {/* ══ SUMMARY: State Grid ══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MiniCard icon="📅" label={txt("ദിവസം", "Day", "Gün")} value={dayName} color={G.text} />
        <MiniCard icon={d.isNight ? "🌙" : "☀"} label={txt("ليل / نهار", "Layl / Nahar", "Gece / Gündüz")} value={language === "ar" ? (d.isNight ? "ليل" : "نهار") : d.laylNahar} color={d.isNight ? "#818CF8" : "#FBBF24"} />
        <MiniCard icon="⏰" label={txt("ساعة (ഗ്രഹമണിക്കൂർ)", "Saat", "Saat")} value={`#${d.currentHour.hourNumber}`} color={G.text} />
        <MiniCard icon={dayRulerSymbol} label={txt("كوكب (ഗ്രഹം)", "Kawkab", "Kavkeb")} value={language === "ar" ? (PLANET_AR[d.currentHour.planet] || planetName) : language === "ml" ? (planetArabicMLDisplay(d.currentHour.planet) || planetName) : planetName} color={G.text} />
      </div>

      {/* ══ SUMMARY: Verdict ══ */}
      <div className="rounded-xl p-3 flex items-center gap-3" style={{
        background: `${verdictColor}10`, border: `1px solid ${verdictColor}40`,
      }}>
        <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: verdictColor }} />
        <div className="flex-1 min-w-0">
          <span className="font-inter text-sm font-bold" style={{ color: verdictColor }}>{verdictText}</span>
          <span className="font-inter text-[10px] ml-2" style={{ color: "rgba(255,255,255,0.50)" }}>{verdictSub}</span>
        </div>
        <span className="font-inter text-[10px] flex-shrink-0 hidden sm:block" style={{ color: "rgba(255,255,255,0.40)" }}>
          {txt("സൂര്യോദയം", "Sunrise", "Doğuş")}: {formatDecimalHour12h(d.sunrise, language)} · {txt("അസ്തമയം", "Sunset", "Batış")}: {formatDecimalHour12h(d.sunset, language)}
        </span>
      </div>

      {/* ══ SUMMARY: Moon Snapshot (compact one-liner — full data in Section 4) ══ */}
      <div className="rounded-xl p-3 flex items-center gap-2.5" style={{
        background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.15)",
      }}>
        <Moon className="w-4 h-4 flex-shrink-0" style={{ color: "#818CF8" }} />
        <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-inter text-xs font-bold" style={{ color: "#818CF8" }}>{moonSymbol} {moonSignName}</span>
          <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>·</span>
          <span className="font-inter text-xs" style={{ color: "#818CF8" }}>{moonPhaseLabel ? `${moonPhaseLabel} ` : ""}({moonPhasePct.toFixed(0)}%)</span>
          <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>·</span>
          <span className="font-inter text-xs" style={{ color: "#818CF8" }}>{moonMansionDisplay}</span>
        </div>
      </div>

      {/* ══ Magical period for today's weekday (from manuscript, if available) ══ */}
      <MagicalPeriodPanel entityType="weekday" entityKey={(d.dayInfo?.name_en || "").toLowerCase()} />

      {/* ══ EXPAND: Today's Activities (collapsed by default) ══ */}
      <SubCollapse title={txt("ഇന്നത്തെ പ്രവൃത്തികൾ", "Today's Activities", "Bugünün Eylemleri")}>
        {kashfLunarDay && (
          <div className="rounded-lg p-2 mb-2" style={{
            background: kashfLunarDay.nature_en.includes("Auspi") ? "rgba(74,222,128,0.04)" : kashfLunarDay.nature_en.includes("Inauspi") ? "rgba(248,113,113,0.04)" : "rgba(251,191,36,0.04)",
            border: `1px solid ${kashfLunarDay.nature_en.includes("Auspi") ? "rgba(74,222,128,0.12)" : kashfLunarDay.nature_en.includes("Inauspi") ? "rgba(248,113,113,0.12)" : "rgba(251,191,36,0.12)"}`,
          }}>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>
              {txt("ചാന്ദ്ര ദിവസം", "Lunar Day", "Ay Günü")} {d.lunarDay}: {language === "ar" ? "—" : (language === "ml" ? kashfLunarDay.nature_ml : kashfLunarDay.nature_en)}
            </p>
            <p className="font-amiri text-[10px] mt-0.5" style={{ color: "rgba(212,175,55,0.40)", direction: "rtl" }}>{kashfLunarDay.summary_ar}</p>
            {isOwner && <p className="font-inter text-[8px] mt-0.5" style={{ color: "rgba(129,140,248,0.30)" }}>📖 {kashfLunarDay.source}</p>}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Best */}
          <div className="rounded-lg p-2.5" style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.15)" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#4ADE80" }} />
              <span className="font-inter text-[10px] uppercase tracking-wider font-bold" style={{ color: "#4ADE80" }}>
                {txt("അനുയോജ്യം", "Best", "En İyi")}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {bestActivities.slice(0, 6).map((a, i) => (
                <span key={i} className="font-inter text-[10px] px-1.5 py-0.5 rounded" style={{
                  background: "rgba(74,222,128,0.08)", color: "rgba(74,222,128,0.80)",
                }}>{a}</span>
              ))}
            </div>
          </div>
          {/* Avoid */}
          {avoidActivities.length > 0 && (
            <div className="rounded-lg p-2.5" style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)" }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Ban className="w-3.5 h-3.5" style={{ color: "#F87171" }} />
                <span className="font-inter text-[10px] uppercase tracking-wider font-bold" style={{ color: "#F87171" }}>
                  {txt("ഒഴിവാക്കുക", "Avoid", "Kaçınılacak")}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {avoidActivities.slice(0, 6).map((a, i) => (
                  <span key={i} className="font-inter text-[10px] px-1.5 py-0.5 rounded" style={{
                    background: "rgba(248,113,113,0.08)", color: "rgba(248,113,113,0.80)",
                  }}>{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Reference at bottom */}
        <p className="font-inter text-[9px] mt-2 pt-2" style={{
          color: "rgba(255,255,255,0.25)", borderTop: "1px solid rgba(212,175,55,0.10)",
        }}>{isOwner && <>📖 {refDay}</>}</p>
      </SubCollapse>

      {/* ══ EXPAND: Warnings (collapsed by default — only if warnings exist) ══ */}
      {warnings.length > 0 && (
        <SubCollapse title={txt("മുന്നറിയിപ്പുകൾ", "Warnings", "Uyarılar")}>
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg p-2 mb-1.5" style={{ background: "rgba(248,113,113,0.04)" }}>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "rgba(248,113,113,0.70)" }} />
              <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>{w}</p>
            </div>
          ))}
          {/* Reference at bottom */}
          <p className="font-inter text-[9px] mt-2 pt-2" style={{
            color: "rgba(255,255,255,0.25)", borderTop: "1px solid rgba(212,175,55,0.10)",
          }}>{isOwner && <>📖 {refWarn}</>}</p>
        </SubCollapse>
      )}
    </div>
  );
}
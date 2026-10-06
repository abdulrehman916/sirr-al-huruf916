// FIXED DAY LAYER · Moon Position card
// Moon mansion (+ Kashf judgement), Moon zodiac, Moon phase (waxing rule),
// Moon-in-Scorpio warning, zodiac manuscript tables. Each opinion shown separately.
// Sources: Havâss PDF2 p.64-74; Kashf pp.55-56, 18-24, 54; Taha p.46,66; GIH p.1418-1497.
import { useAstroData } from "../dashboard/useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import DashboardSection, { MiniCard } from "../dashboard/DashboardSection";
import { getKashfMansionByNo, getKashfZodiacTiming } from "@/lib/astroClockManuscriptMerger";
import { zodiacEnToML } from "@/lib/astroClockLabelMap";
import { SourceTag, ArabicLine, ZODIAC_EN_MAP } from "./shared";

export default function MoonPositionCard() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  const m = d.currentMansion;
  if (!m) return null;
  const kashfM = getKashfMansionByNo(m.no);
  const zodiacEn = d.moonPosition?.zodiacSign?.name_en;
  const zodiac = d.moonZodiacFull;
  const kashfZ = getKashfZodiacTiming(zodiacEn) || [];
  const isScorpio = (zodiacEn || "").toLowerCase() === "scorpio";
  const isWaxing = d.moonPosition?.isWaxing;
  const phasePct = d.moonPosition ? parseFloat(d.moonPosition.phase) : 0;
  const mansionDisplay = language === "ar" || language === "ml"
    ? `#${m.no || "?"} ${m.name_arabic || ""}`
    : `#${m.no || "?"} ${m.name || ""}`;
  const zodiacDisplay = language === "ar" ? (zodiac?.name_ar || zodiacEn) : language === "ml" ? zodiacEnToML(zodiacEn) : zodiacEn;

  return (
    <DashboardSection icon="🌙" title={txt("ചന്ദ്ര സ്ഥാനം", "Moon Position", "موقع القمر")} subtitle={txt("നക്ഷത്രം, രാശി, ഘട്ടം", "Mansion, Zodiac, Phase", "المنزل والبرج والطور")}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <MiniCard icon="⭐" label={txt("നക്ഷത്രം", "Mansion", "المنزل")} value={mansionDisplay} color="#818CF8" />
        <MiniCard icon={d.moonPosition?.zodiacSign?.symbol || "♈"} label={txt("രാശി", "Zodiac", "البرج")} value={zodiacDisplay} color="#818CF8" />
        <MiniCard icon="🌕" label={txt("ഘട്ടം", "Phase", "الطور")} value={`${phasePct.toFixed(0)}% ${isWaxing ? "↑" : "↓"}`} color="#818CF8" />
      </div>

      <div className="mt-2">
        <p className="font-inter text-[10px] font-bold mb-0.5" style={{ color: "rgba(212,175,55,0.70)" }}>{txt("നക്ഷത്ര വിധി (കശ്ഫ് - ഒമാൻ പാരമ്പര്യം)", "Mansion judgement (Kashf / Omani)", "حكم المنزل (كشف)")}</p>
        {kashfM && <ArabicLine>{kashfM.operation_ar}</ArabicLine>}
        {kashfM && <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>{kashfM.nature_en} · {kashfM.source}</p>}
      </div>

      {isWaxing != null && (
        <div className="mt-2 rounded-lg p-2" style={{ background: isWaxing ? "rgba(74,222,128,0.04)" : "rgba(251,191,36,0.04)", border: `1px solid ${isWaxing ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.15)"}` }}>
          <p className="font-inter text-[10px]" style={{ color: isWaxing ? "#4ADE80" : "#FBBF24" }}>{isWaxing ? txt("ചന്ദ്ര വളർച്ച — നല്ല കൃത്യങ്ങൾക്ക് ഉത്തമം", "Waxing Moon — best for good deeds", "القمر المتزايد — للأعمال الخير") : txt("ചന്ദ്ര ക്ഷയം", "Waning Moon", "القمر المتناقص")}</p>
          <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("നല്ല കൃത്യങ്ങൾ ചന്ദ്ര വളർച്ചക്കാലത്ത് (കശ്ഫ് p.20)", "Good deeds in waxing Moon (Kashf p.20)", "الأعمال الخير في زيادة القمر (كشف ص.20)")}</p>
        </div>
      )}

      {isScorpio && (
        <div className="mt-2 rounded-lg p-2" style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)" }}>
          <p className="font-inter text-[10px] font-bold" style={{ color: "#F87171" }}>{txt("ചന്ദ്രൻ വൃശ്ചികത്തിൽ — തുടർച്ചയായ നഹ്സ്", "Moon in Scorpio — continuous nahs", "القمر في العقرب — نحس مستمر")}</p>
          <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{txt("قمر در عقرب — نحس مستمر. പ്രധാന കൃത്യങ്ങൾ ഒഴിവാക്കുക (താഹ p.46,66)", "Avoid major actions (Taha p.46,66)", "تجنب الأعمال الكبيرة (طه ص.46,66)")}</p>
        </div>
      )}

      {kashfZ.length > 0 && (
        <div className="mt-2">
          <p className="font-inter text-[10px] font-bold mb-1" style={{ color: "rgba(212,175,55,0.70)" }}>{txt("രാശി സംബന്ധിച്ച കശ്ഫ് പട്ടികകൾ", "Zodiac manuscript tables (Kashf)", "جداول البرج (كشف)")}</p>
          <div className="space-y-1">
            {kashfZ.map((z, i) => (
              <div key={i} className="rounded p-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.10)" }}>
                <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{language === "ar" ? z.ar : language === "ml" ? z.ml : z.en}</p>
                <p className="font-inter text-[8px]" style={{ color: "rgba(212,175,55,0.40)" }}>{z.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <SourceTag>Havâss PDF2 p.64-74 · Kashf pp.55-56, 18-24, 54 · Taha p.46,66 · GIH p.1418-1497</SourceTag>
    </DashboardSection>
  );
}

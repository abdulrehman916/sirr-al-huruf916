// ═══════════════════════════════════════════════════════════════
// SECTION 5 — MOON IN ZODIAC
// Current zodiac details + Next zodiac preview with transition time
// ═══════════════════════════════════════════════════════════════
import { useAstroData, PLANET_AR } from "./useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { MiniCard } from "./DashboardSection";
import { ArrowRight } from "lucide-react";
import ManuscriptSourcePanel from "./ManuscriptSourcePanel";
import { getKashfZodiacTiming } from "@/lib/astroClockManuscriptMerger";
import { zodiacEnToML, signsToML } from "@/lib/astroClockLabelMap";

export default function MoonZodiac() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();

  if (!d.moonZodiacFull) {
    return <p className="font-inter text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("രാശി ഡാറ്റ ലഭ്യമല്ല", "Zodiac data unavailable", "Burç verisi mevcut değil")}</p>;
  }

  const z = d.moonZodiacFull;
  const kashfZodiacTiming = getKashfZodiacTiming(z.name_en);
  const zName = language === "ar" ? (z.name_ar || z.name_en) : (language === "ml" ? zodiacEnToML(z.name_en) : z.name_en);
  const zElement = language === "ar" ? "—" : (language === "ml" ? z.element_ml : z.element);
  const zGender = language === "ar" ? "—" : (language === "ml" ? z.gender_ml : z.gender);
  const zRuler = language === "ar" ? (PLANET_AR[z.ruling_planet?.toLowerCase()] || z.ruling_planet) : (language === "ml" ? z.ruling_planet_ml : z.ruling_planet);
  const zMetal = language === "ar" ? "—" : (language === "ml" ? z.metal_ml : z.metal);
  const zIncense = language === "ar" ? "—" : (language === "ml" ? z.incense_ml : z.incense);
  const zExplanation = language === "ar" ? "" : (language === "ml" ? z.explanation_ml : z.explanation_en);

  const nextTransit = d.moonTransits?.signTransits?.[1];
  const nextSignNameRaw = nextTransit?.name || "—";
  const nextSignName = language === "ar" ? (d.zodiacSigns[nextSignNameRaw.toLowerCase()]?.name_ar || nextSignNameRaw) : (language === "ml" ? zodiacEnToML(nextSignNameRaw) : nextSignNameRaw);
  const nextSignSymbol = nextTransit?.symbol || "";
  const transitionTime = nextTransit?.entryTime ? new Date(nextTransit.entryTime).toLocaleString(language === "ar" ? "ar" : (language === "ml" ? "ml-IN" : "en-US"), {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }) : "—";

  const nextZodiacKey = nextSignNameRaw.toLowerCase();
  const nextZodiac = d.zodiacSigns[nextZodiacKey];
  const nextElement = nextZodiac ? (language === "ar" ? "—" : (language === "ml" ? nextZodiac.element_ml : nextZodiac.element)) : "—";
  const nextRuler = nextZodiac ? (language === "ar" ? (PLANET_AR[nextZodiac.ruling_planet?.toLowerCase()] || nextZodiac.ruling_planet) : (language === "ml" ? nextZodiac.ruling_planet_ml : nextZodiac.ruling_planet)) : "—";

  const planetKey = z.ruling_planet?.toLowerCase();
  const planetInfo = d.planetInfo[planetKey];
  const goodActions = language === "ar" ? [] : (language === "ml" ? planetInfo?.goodActions_ml : planetInfo?.goodActions_en);
  const badActions = language === "ar" ? [] : (language === "ml" ? planetInfo?.badActions_ml : planetInfo?.badActions_en);
  const signsToAr = (signs) => (signs || []).map(s => d.zodiacSigns[s.toLowerCase()]?.name_ar || s).join(", ");
  const friendlyDisplay = language === "ar" ? (signsToAr(z.friendly_signs) || "—") : (language === "ml" ? (signsToML(z.friendly_signs).join(", ") || "—") : (z.friendly_signs?.join(", ") || "—"));
  const enemyDisplay = language === "ar" ? (signsToAr(z.enemy_signs) || "—") : (language === "ml" ? (signsToML(z.enemy_signs).join(", ") || "—") : (z.enemy_signs?.join(", ") || "—"));

  return (
    <div className="space-y-3">
      <div className="rounded-xl p-3 flex items-center gap-3" style={{
        background: "linear-gradient(135deg, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.02) 100%)",
        border: "1px solid rgba(212,175,55,0.30)",
      }}>
        <span className="text-3xl leading-none">{z.symbol}</span>
        <div className="flex-1">
          <p className="font-inter text-base font-bold" style={{ color: "#F5D060" }}>{zName}</p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>{language === "ml" ? (z.date_range_ml || "") : language === "ar" ? "" : z.date_range}</p>
        </div>
        {language === "en" && <span className="font-amiri text-lg" style={{ color: "rgba(212,175,55,0.50)" }}>{z.name_ar}</span>}
      </div>

      {zExplanation && (
        <p className="font-inter text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{zExplanation}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <MiniCard icon="🔥" label={txt("മൂലകം", "Element", "Element")} value={zElement} color="#FBBF24" />
        <MiniCard icon="⚤" label={txt("ലിംഗം", "Gender", "Cinsiyet")} value={zGender} color="#F5D060" />
        <MiniCard icon="♁" label={txt("ലോഹം", "Metal", "Metal")} value={zMetal} color="#F5D060" />
        <MiniCard icon="🪐" label={txt("നാഥൻ", "Ruler", "Yönetici")} value={`${z.ruling_planet_symbol || ""} ${zRuler}`} color="#F5D060" />
        <MiniCard icon="🕯" label={txt("സുഗന്ധം", "Incense", "Tütsü")} value={zIncense} color="#F5D060" />
        <MiniCard icon="🔤" label={txt("അക്ഷരങ്ങൾ", "Letters", "Harfler")} value={z.letters?.join(" ") || "—"} color="#F5D060" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {goodActions?.length > 0 && (
          <div className="rounded-lg p-2.5" style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)" }}>
            <p className="font-inter text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(74,222,128,0.60)" }}>{txt("അനുയോജ്യം", "Recommended", "Önerilen")}</p>
            <div className="flex flex-wrap gap-1">
              {goodActions.slice(0, 4).map((a, i) => <span key={i} className="font-inter text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.06)", color: "rgba(74,222,128,0.70)" }}>{a}</span>)}
            </div>
          </div>
        )}
        {badActions?.length > 0 && (
          <div className="rounded-lg p-2.5" style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.12)" }}>
            <p className="font-inter text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(248,113,113,0.60)" }}>{txt("ഒഴിവാക്കുക", "Avoid", "Kaçınılacak")}</p>
            <div className="flex flex-wrap gap-1">
              {badActions.slice(0, 3).map((a, i) => <span key={i} className="font-inter text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(248,113,113,0.06)", color: "rgba(248,113,113,0.70)" }}>{a}</span>)}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg p-2" style={{ background: "rgba(74,222,128,0.03)", border: "1px solid rgba(74,222,128,0.10)" }}>
          <p className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(74,222,128,0.50)" }}>{txt("സൌഹൃദ", "Friendly", "Dost")}</p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(74,222,128,0.65)" }}>{friendlyDisplay}</p>
        </div>
        <div className="rounded-lg p-2" style={{ background: "rgba(248,113,113,0.03)", border: "1px solid rgba(248,113,113,0.10)" }}>
          <p className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(248,113,113,0.50)" }}>{txt("ശത്രു", "Enemy", "Düşman")}</p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(248,113,113,0.65)" }}>{enemyDisplay}</p>
        </div>
      </div>

      {nextTransit && (
        <div className="rounded-xl p-3" style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.20)" }}>
          <p className="font-inter text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: "rgba(129,140,248,0.70)" }}>{txt("അടുത്ത രാശി മാറ്റം", "Next Zodiac Transition", "Sonraki Burç Geçişi")}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{z.symbol}</span>
              <ArrowRight className="w-4 h-4" style={{ color: "rgba(129,140,248,0.50)" }} />
              <span className="text-xl">{nextSignSymbol}</span>
              <span className="font-inter text-sm font-bold" style={{ color: "#818CF8" }}>{nextSignName}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.30)" }}>{txt("സമയം", "Transition", "Geçiş")}</span>
              <p className="font-inter text-[10px]" style={{ color: "#818CF8" }}>{transitionTime}</p>
            </div>
            <div>
              <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.30)" }}>{txt("മൂലകം", "Element", "Element")}</span>
              <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>{zElement} → {nextElement}</p>
            </div>
            <div>
              <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.30)" }}>{txt("നാഥൻ", "Ruler", "Yönetici")}</span>
              <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>{zRuler} → {nextRuler}</p>
            </div>
          </div>
        </div>
      )}

      {kashfZodiacTiming.length > 0 && (
        <ManuscriptSourcePanel
          sources={[{
            id: "kashf",
            label: txt("കശ്ഫ് അൽ-ഹഖാഇഖ് (ഒമാൻ)", "Kashf al-Haqa'iq (Omani)", "Kashf al-Haqa'iq (Omani)"),
            items: kashfZodiacTiming.map(t => ({
              ar: t.ar, en: t.en, ml: t.ml, tr: t.tr,
              type: "info", source: t.source,
            }))
          }]}
        />
      )}
    </div>
  );
}
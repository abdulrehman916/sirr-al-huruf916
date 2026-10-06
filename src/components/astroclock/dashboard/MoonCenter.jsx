// ═══════════════════════════════════════════════════════════════
// SECTION 4 — MOON CENTER
// Everything Moon-related lives ONLY here. No other section duplicates Moon info.
// ═══════════════════════════════════════════════════════════════
import { useAstroData } from "./useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { MiniCard } from "./DashboardSection";
import { Moon } from "lucide-react";
import ManuscriptSourcePanel from "./ManuscriptSourcePanel";
import { getKashfNightDayRule, getKashfLunarDayInfo } from "@/lib/astroClockManuscriptMerger";
import { natureToArabic, natureToML, natureToEN, isNahsNature, zodiacEnToML, signsToML } from "@/lib/astroClockLabelMap";

export default function MoonCenter() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();

  if (!d.moonPosition) {
    return <p className="font-inter text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("ചന്ദ്ര ഡാറ്റ ലഭ്യമല്ല", "Moon data unavailable", "Ay verisi mevcut değil")}</p>;
  }

  const moonSign = d.moonPosition.zodiacSign;
  const moonSignName = language === "ar" ? (d.moonZodiacFull?.name_ar || moonSign?.name_en || "—") : (language === "ml" ? zodiacEnToML(moonSign?.name_en) : moonSign?.name_en);
  const moonPhasePct = parseFloat(d.moonPosition.phase);
  // No approved Arabic moon-phase label in the codebase — show nothing in Arabic mode.
  const moonPhaseLabel = language === "ar" ? "" : (language === "ml" ? d.moonPhaseDesc?.ml : d.moonPhaseDesc?.en);
  const waxing = d.lunarDay ? d.lunarDay <= 14 : true;
  const moonLongitude = parseFloat(d.moonPosition.longitude);
  const moonMansion = d.currentMansion;
  const moonMansionName = language === "ml" || language === "ar"
    ? (moonMansion?.name_arabic || "—")
    : (moonMansion?.name || "—");

  const dignity = d.moonDignity;
  const dignityType = dignity ? (language === "ar" ? "—" : (language === "ml" ? dignity.type_ml : dignity.type_en)) : txt("സാധാരണം", "Normal", "—");
  const dignityColor = dignity?.strength === "weakest" ? "#F87171" : dignity?.strength === "very_strong" || dignity?.strength === "strongest" ? "#4ADE80" : "#FBBF24";

  const element = d.moonZodiacFull ? (language === "ml" ? d.moonZodiacFull.element_ml : d.moonZodiacFull.element) : "—";
  const mansionNature = language === "ml" ? natureToML(moonMansion?.genel_hukum) : language === "ar" ? natureToArabic(moonMansion?.genel_hukum) : natureToEN(moonMansion?.genel_hukum);
  const isNahs = isNahsNature(moonMansion?.genel_hukum);
  const natureColor = isNahs ? "#F87171" : "#4ADE80";

  const signsToAr = (signs) => (signs || []).map(s => d.zodiacSigns[s.toLowerCase()]?.name_ar || s);
  const friendlySigns = language === "ar" ? signsToAr(d.moonZodiacFull?.friendly_signs) : (language === "ml" ? signsToML(d.moonZodiacFull?.friendly_signs) : (d.moonZodiacFull?.friendly_signs || []));
  const enemySigns = language === "ar" ? signsToAr(d.moonZodiacFull?.enemy_signs) : (language === "ml" ? signsToML(d.moonZodiacFull?.enemy_signs) : (d.moonZodiacFull?.enemy_signs || []));

  const strengthLabel = moonPhasePct > 75 ? txt("വളരെ ശക്തം", "Very Strong", "Çok Güçlü") :
    moonPhasePct > 50 ? txt("ശക്തം", "Strong", "Güçlü") :
    moonPhasePct > 25 ? txt("മിതം", "Moderate", "Orta") :
    txt("ദുർബലം", "Weak", "Zayıf");
  const strengthColor = moonPhasePct > 50 ? "#4ADE80" : moonPhasePct > 25 ? "#FBBF24" : "#F87171";

  const kashfLunarDay = getKashfLunarDayInfo(d.lunarDay);
  const kashfNightRule = getKashfNightDayRule();
  const recommendations = [];
  if (language !== "ar" && waxing && moonPhasePct > 50) {
    recommendations.push(txt("ആകർഷണം, വർദ്ധന, ജല്പം കർമ്മങ്ങൾക്ക് അനുകൂലം", "Favorable for attraction, growth, increase works", "Çekim, büyüme, artış çalışmaları için elverişli"));
  } else if (language !== "ar" && !waxing) {
    recommendations.push(txt("തടയൽ, നീക്കം, ശുദ്ധീകരണം കർമ്മങ്ങൾക്ക് അനുകൂലം", "Favorable for banishment, removal, cleansing works", "Uzaklaştırma, temizleme çalışmaları için elverişli"));
  }
  if (language !== "ar" && isNahs) {
    recommendations.push(txt("ഈ നക്ഷത്രം نحس ആണ് — പ്രധാന കർമ്മങ്ങൾ ഒഴിവാക്കുക", "This mansion is Nahs — avoid important works", "Bu menzil nahs'tır — önemli çalışmalarından kaçının"));
  }
  if (language !== "ar" && dignity?.strength === "weakest") {
    recommendations.push(txt("ചന്ദ്രൻ നീചം — മാനസിക കാര്യങ്ങൾ വിലമതിക്കുക", "Moon debilitated — be cautious with mental matters", "Ay düşük — zihinsel konularda dikkatli olun"));
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 flex items-center gap-4" style={{
        background: "linear-gradient(135deg, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 100%)",
        border: "1px solid rgba(129,140,248,0.20)",
      }}>
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full" style={{
            background: `radial-gradient(circle at ${50 + (moonPhasePct / 100) * 30}% 50%, #E2E8F0 0%, #94A3B8 ${moonPhasePct}%, #1E293B ${moonPhasePct}%, #0F172A 100%)`,
            boxShadow: "0 0 20px rgba(129,140,248,0.30)",
          }} />
        </div>
        <div className="flex-1">
          <p className="font-inter text-sm font-bold" style={{ color: "#818CF8" }}>{moonPhaseLabel}</p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            {waxing ? txt("വർദ്ധിക്കുന്നു", "Waxing", "Büyüyen") : txt("കുറയുന്നു", "Waning", "Küçülen")} · {moonPhasePct.toFixed(1)}% {txt("പ്രകാശം", "illumination", "aydınlanma")}
          </p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
            {txt("ചാന്ദ്ര ദിവസം", "Lunar Day", "Ay Günü")}: {d.lunarDay} · {txt("രേഖാംശം", "Longitude", "Boylam")}: {moonLongitude.toFixed(1)}°
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <MiniCard icon="♈" label={txt("രാശി", "Zodiac", "Burç")} value={`${moonSign?.symbol || ""} ${moonSignName}`} color="#818CF8" />
        <MiniCard icon="🏛" label={txt("ഭവനം", "House", "Ev")} value={dignityType} color={dignityColor} />
        <MiniCard icon="💧" label={txt("മൂലകം", "Element", "Element")} value={element} color="#818CF8" />
        <MiniCard icon="⭐" label={txt("നക്ഷത്രം", "Mansion", "Menzil")} value={`#${moonMansion?.no} ${moonMansionName}`} color="#818CF8" />
        <MiniCard icon="⚖" label={txt("സ്വഭാവം", "Nature", "Doğa")} value={mansionNature} color={natureColor} />
        <MiniCard icon="💪" label={txt("ശക്തി", "Strength", "Güç")} value={strengthLabel} color={strengthColor} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg p-2.5" style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)" }}>
          <p className="font-inter text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(74,222,128,0.60)" }}>{txt("സൌഹൃദ രാശികൾ", "Friendly Signs", "Dost Burçlar")}</p>
          <p className="font-inter text-[11px]" style={{ color: "rgba(74,222,128,0.75)" }}>{friendlySigns.join(", ") || "—"}</p>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.12)" }}>
          <p className="font-inter text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(248,113,113,0.60)" }}>{txt("ശത്രു രാശികൾ", "Enemy Signs", "Düşman Burçlar")}</p>
          <p className="font-inter text-[11px]" style={{ color: "rgba(248,113,113,0.75)" }}>{enemySigns.join(", ") || "—"}</p>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.20)" }}>
          <p className="font-inter text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(212,175,55,0.60)" }}>{txt("പൊതു ശുപാർശ", "General Recommendations", "Genel Öneriler")}</p>
          {recommendations.map((r, i) => (
            <p key={i} className="font-inter text-[11px] mb-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>• {r}</p>
          ))}
        </div>
      )}

      <ManuscriptSourcePanel
        sources={[{
          id: "kashf",
          label: txt("കശ്ഫ് അൽ-ഹഖാഇഖ് (ഒമാൻ)", "Kashf al-Haqa'iq (Omani)", "Kashf al-Haqa'iq (Omani)"),
          items: [
            ...(kashfLunarDay ? [{
              en: `Lunar Day ${d.lunarDay}: ${kashfLunarDay.nature_en}`,
              ml: `ചാന്ദ്ര ദിവസം ${d.lunarDay}: ${kashfLunarDay.nature_ml}`,
              tr: `Ay Günü ${d.lunarDay}: ${kashfLunarDay.nature_tr}`,
              type: kashfLunarDay.nature_en.includes("Auspi") ? "recommend" : "warning",
              source: kashfLunarDay.source,
            }] : []),
            {
              en: kashfNightRule.en,
              ml: kashfNightRule.ml,
              tr: kashfNightRule.tr,
              type: "info",
              source: kashfNightRule.source,
            },
          ]
        }]}
      />
    </div>
  );
}

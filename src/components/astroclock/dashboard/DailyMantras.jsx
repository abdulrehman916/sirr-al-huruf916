// ═══════════════════════════════════════════════════════════════
// SECTION 2 — DAILY MANTRAS: COMPLETE GUIDED RITUAL PAGE
// Source: Kashf al-Haqa'iq, pp.27–53
//
// Every recitation displayed as a 6-section guided ritual:
//   1. Introduction (Malayalam)
//   2. How to Perform (manuscript instructions)
//   3. Arabic Text (large, manuscript-style)
//   4. Malayalam Meaning (full translation)
//   5. References (book, page, weekday, planet, angel)
//   6. Related Recitations (linked, in order)
//
// RULES:
//   - Never invent information — only manuscript-derived data
//   - Preserve every Arabic character exactly
//   - Manuscript is the highest authority
// ═══════════════════════════════════════════════════════════════
import { useAstroData } from "./useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import GuidedRitualCard from "./GuidedRitualCard";
import { useIsOwner } from "@/hooks/useIsOwner";
import {
  getDailyMantrasForDay,
  getTotalMantraCount,
} from "@/lib/astroClockDailyMantrasData";
import SourceBookPanel from "./SourceBookPanel";

const G = { text: "#F5D060", dim: "rgba(212,175,55,0.55)", border: "rgba(212,175,55,0.20)" };
const AR = "#818CF8";

function SourceGroup({ sourceGroup, defaultExpandedId }) {
  const groupLabel = sourceGroup.group_label_ml;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 pt-1">
        <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.15)" }} />
        <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>
          {groupLabel}
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.15)" }} />
      </div>
      {sourceGroup.mantras.map((mantra, i) => (
        <GuidedRitualCard
          key={mantra.id || i}
          mantra={mantra}
          defaultExpanded={mantra.id === defaultExpandedId}
        />
      ))}
    </div>
  );
}

export default function DailyMantras() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  const isOwner = useIsOwner();

  if (!d.currentHour) return null;

  const allGroups = getDailyMantrasForDay(d.activeDayIndex);
  const mantraGroups = allGroups.filter(g => g.mantras.some(m => m.day_index === d.activeDayIndex));
  const total = getTotalMantraCount();

  const dayLabels = [
    txt("ഞായർ", "Sunday", "Pazar"),
    txt("തിങ്കൾ", "Monday", "Pazartesi"),
    txt("ചൊവ്വ", "Tuesday", "Salı"),
    txt("ബുധൻ", "Wednesday", "Çarşamba"),
    txt("വ്യാഴം", "Thursday", "Perşembe"),
    txt("വെള്ളി", "Friday", "Cuma"),
    txt("ശനി", "Saturday", "Cumartesi"),
  ];
  const dayName = dayLabels[d.activeDayIndex];

  // First recitation expanded by default
  const firstGroup = mantraGroups[0];
  const defaultExpandedId = firstGroup?.mantras?.[0]?.id;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: `${AR}08`, border: `1px solid ${AR}33` }}>
        <span className="text-lg">📿</span>
        <div className="flex-1">
          <span className="font-inter text-xs font-bold" style={{ color: AR }}>
            {txt("ഇന്ന്", "Today", "Bugün")}: {dayName}
          </span>
          <span className="font-inter text-[10px] ml-2" style={{ color: "rgba(255,255,255,0.40)" }}>
            {total} {txt("പ്രാർഥനകൾ", "recitations", "zikir")}
          </span>
        </div>
        {isOwner && (
          <span className="font-amiri text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.10)", color: G.dim, direction: "rtl" }}>
            📖 كشف الحقائق
          </span>
        )}
      </div>

      {/* Manuscript Authority Notice — Malayalam mode only (prevents ML leak in EN/AR) */}
      {language === "ml" && (
        <div className="rounded-lg p-2" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.10)" }}>
          <p className="font-malayalam text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            ⚖️ മൂല ഗ്രന്ഥം ആണ് പ്രാഥമിക അധികാരം. എല്ലാ അറബി പാഠവും ഗ്രന്ഥത്തിൽ നിന്ന് നേരിട്ട് പകർത്തിയതാണ്.
          </p>
        </div>
      )}

      {/* Guided ritual groups — ML mode: full guided cards (data is Malayalam-only).
          AR mode: Arabic recitation only (approved). EN mode: placeholder. */}
      {language === "ml" && mantraGroups.map((group, i) => (
        <SourceGroup key={i} sourceGroup={group} defaultExpandedId={defaultExpandedId} />
      ))}
      {language === "ar" && (
        <div className="space-y-2">
          {mantraGroups.flatMap(g => g.mantras).map((m, i) => (
            <div key={m.id || i} className="rounded-lg p-3" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}>
              {m.arabic_text && <p className="font-amiri text-center leading-loose" style={{ color: G.text, direction: "rtl", fontSize: "1.25rem" }}>{m.arabic_text}</p>}
            </div>
          ))}
        </div>
      )}
      {language === "en" && (
        <div className="rounded-lg p-3 text-center" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}>
          <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>English guidance not available yet.</p>
        </div>
      )}

      {/* ── Source Book: Salawat & Hizb (الإمام محمد بن عبدالله الخليلي) — appended, existing day groups preserved ── */}
      <SourceBookPanel topicId="salawatPrayers" />
    </div>
  );
}
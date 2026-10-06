// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT CONFLICT ENGINE (Phase 2.3)
//
// Detects field-level disagreements between Havâss'ın Derinlikleri
// (Turkish) and Kashf al-Haqa'iq (Omani) on the 28 lunar mansions.
//
// RULE (per project law): when two manuscripts disagree on a field,
// NEVER merge — return both opinions separately, each with its source
// reference and page, plus a conflict flag. The UI renders them under a
// "Different manuscript opinion" badge so the user always sees every
// authentic opinion.
//
// This module is DETECTION + STRUCTURE only — it does not modify any
// manuscript data, ingestion, or calculation. It reads Havâss from
// AY_MANAZILLERI (genel_hukum) and Kashf from KASHF_LUNAR_MANSIONS
// (nature), normalizes both to a canonical value, and compares.
// ═══════════════════════════════════════════════════════════════
import { AY_MANAZILLERI } from "./astroClockData";
import { KASHF_LUNAR_MANSIONS, KASHF_SOURCE } from "./astroClockKashfData";

// ── Canonical nature normalization ──
// Havâss `genel_hukum` values: "Uygun (Saad)", "Uygundur", "Uğursuz (Nahs)",
// "Karışık (İyi ve Kötü)". Kashf `nature` values: "saad", "nahs",
// "saad_mixed", "nahs_mixed". Both reduce to: saad | nahs | mixed.
function canonicalizeHavassNature(genelHukum) {
  if (!genelHukum) return null;
  const g = genelHukum.toLowerCase();
  if (g.includes("karışık") || g.includes("karisik")) return "mixed";
  if (g.includes("uğursuz") || g.includes("nahs")) return "nahs";
  if (g.includes("uygun") || g.includes("saad") || g.includes("uygundur")) return "saad";
  return null;
}
function canonicalizeKashfNature(nature) {
  if (!nature) return null;
  if (nature === "saad") return "saad";
  if (nature === "nahs") return "nahs";
  if (nature === "saad_mixed" || nature === "nahs_mixed") return "mixed";
  return null;
}

// Human-readable nature label per language (for the opinion text).
const NATURE_LABEL = {
  saad:  { en: "Auspicious (Sa'd)", ml: "ശുഭം (സഅദ്)", ar: "سعد" },
  nahs:  { en: "Inauspicious (Nahs)", ml: "അശുഭം (നഹ്സ്)", ar: "نحس" },
  mixed: { en: "Mixed (good & evil)", ml: "മിശ്രിതം (നന്മയും തിന്മയും)", ar: "مختلط" },
};

// ── Per-mansion conflict comparison ──
// Returns null when both manuscripts agree (or one is absent); otherwise
// { field, agree:false, havassOpinion, kashfOpinion }.
export function getMansionConflict(no) {
  if (!no || no < 1 || no > 28) return null;
  const havass = AY_MANAZILLERI[no - 1];
  const kashf = KASHF_LUNAR_MANSIONS.mansions[no - 1];
  if (!havass || !kashf) return null;

  const hNature = canonicalizeHavassNature(havass.genel_hukum);
  const kNature = canonicalizeKashfNature(kashf.nature);
  if (!hNature || !kNature) return null;
  if (hNature === kNature) return null; // agree → no conflict

  return {
    field: "nature",
    agree: false,
    mansionNo: no,
    mansionName: havass.name,
    havassOpinion: {
      nature: hNature,
      label: NATURE_LABEL[hNature],
      original: havass.genel_hukum,
      operations: havass.operations,
      source: "Havâss'ın Derinlikleri",
      author: "Bülent Kısa",
      page: "64-74",
    },
    kashfOpinion: {
      nature: kNature,
      label: NATURE_LABEL[kNature],
      original: kashf.nature,
      operation_ar: kashf.operation_ar,
      planet_ar: kashf.planet_ar || "",
      source: KASHF_SOURCE.book_name_ar,
      author: KASHF_SOURCE.author_en,
      page: "55-56",
    },
  };
}

// ── All mansion conflicts (for a dashboard summary / audit) ──
export function detectAllMansionConflicts() {
  const conflicts = [];
  for (let no = 1; no <= 28; no++) {
    const c = getMansionConflict(no);
    if (c) conflicts.push(c);
  }
  return conflicts;
}

// ── Convenience: does mansion `no` have a documented conflict? ──
export function hasMansionConflict(no) {
  return getMansionConflict(no) !== null;
}
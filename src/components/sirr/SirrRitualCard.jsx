// ═══════════════════════════════════════════════════════════════
// SIRR RITUAL CARD — LANGUAGE-AWARE 10-FIELD DISPLAY
// ═══════════════════════════════════════════════════════════════
// Displays each ritual in the user's exact specified order:
//   1. Purpose
//   2. Arabic Text (always visible, premium typography)
//   3. Malayalam/English Meaning (language-dependent)
//   4. How to Perform
//   5. Repetition
//   6. Timing
//   7. Materials
//   8. Warnings
//   9. Benefits
//  10. Book Reference
//
// LANGUAGE MODES:
//   ML mode → Only Malayalam headings + Malayalam text
//   EN mode → Only English headings + English text
//   Arabic always visible in both modes.
//
// Manuscript is the only authority — never invent or omit.
// No machine translation — only pre-existing manuscript data.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SirrArabicText from "@/components/sirr/SirrArabicText";
import { getMergedRitualInstructions } from "@/lib/manuscriptRitualGuideData";
import { WEEKDAY_PLANET_META } from "@/lib/astroClockDailyMantrasData";

const NS_ML = "ഗ്രന്ഥത്തിൽ വ്യക്തമാക്കാത്തത്";
const NS_EN = "Not specified in the manuscript";

const LABELS = {
  ml: {
    purpose: "ഉദ്ദേശം",
    arabic: "അറബി പാഠം",
    meaning: "മലയാള പരിഭാഷ",
    howTo: "അനുഷ്ഠാന ക്രമം",
    repetition: "ആവർത്തനം",
    timing: "സമയം",
    materials: "ആവശ്യ സാധനങ്ങൾ",
    warnings: "മുന്നറിയിപ്പുകൾ",
    benefits: "ഫലം",
    reference: "മൂലഗ്രന്ഥം",
    scholar: "പണ്ഡിതൻ",
    book: "ഗ്രന്ഥം",
    page: "പേജ്",
    source: "മൂലം",
  },
  en: {
    purpose: "Purpose",
    arabic: "Arabic Text",
    meaning: "English Meaning",
    howTo: "How to Perform",
    repetition: "Repetition",
    timing: "Timing",
    materials: "Materials",
    warnings: "Warnings",
    benefits: "Benefits",
    reference: "Book Reference",
    scholar: "Scholar",
    book: "Book",
    page: "Page",
    source: "Source",
  },
};

// ── Detect Arabic text for RTL rendering ──
function isArabic(text) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text || "");
}

// ── Derive heading title (language-aware) ──
function deriveTitle(item, lang) {
  if (lang === "ml") {
    if (item.title_ml) return item.title_ml;
    if (item.purpose_ml) {
      const dash = item.purpose_ml.indexOf(" — ");
      if (dash > 0) return item.purpose_ml.slice(0, dash);
      return item.purpose_ml.length > 60
        ? item.purpose_ml.slice(0, 57) + "…"
        : item.purpose_ml;
    }
  }
  if (item.title_en) return item.title_en;
  if (item.title) return item.title;
  if (item.name_en) return item.name_en;
  if (item.purpose_en) {
    const dash = item.purpose_en.indexOf(" — ");
    if (dash > 0) return item.purpose_en.slice(0, dash);
    return item.purpose_en.length > 60
      ? item.purpose_en.slice(0, 57) + "…"
      : item.purpose_en;
  }
  if (item.purpose_ml) {
    const dash = item.purpose_ml.indexOf(" — ");
    if (dash > 0) return item.purpose_ml.slice(0, dash);
    return item.purpose_ml.length > 60
      ? item.purpose_ml.slice(0, 57) + "…"
      : item.purpose_ml;
  }
  return item.id || "—";
}

// ── Extract joined text from merged instruction arrays ──
function instrText(arr) {
  if (!arr || arr.length === 0) return null;
  return arr.map((a) => a.text).join(" ");
}

// ── Language-aware text renderer ──
function T({ text, lang, className = "" }) {
  if (!text) return null;
  const ar = isArabic(text);
  if (ar) {
    return (
      <span
        className={`font-amiri ${className}`}
        style={{ direction: "rtl", textAlign: "right", display: "block", lineHeight: "1.8" }}
      >
        {text}
      </span>
    );
  }
  const cls = lang === "ml" ? "font-malayalam" : "font-inter";
  return (
    <span className={`${cls} ${className}`} style={{ lineHeight: "1.8" }}>
      {text}
    </span>
  );
}

// ── Not-specified placeholder (language-aware) ──
function NSpan({ lang }) {
  const cls = lang === "ml" ? "font-malayalam" : "font-inter";
  return (
    <span className={`${cls} italic`} style={{ color: "rgba(255,255,255,0.25)" }}>
      {lang === "ml" ? NS_ML : NS_EN}
    </span>
  );
}

// ── Section label with divider line ──
function SectionLabel({ icon, label, accent, lang }) {
  const cls = lang === "ml" ? "font-malayalam" : "font-inter";
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-[11px] flex-shrink-0" style={{ color: `${accent}88` }}>
        {icon}
      </span>
      <span className={`${cls} text-[11px] font-bold flex-shrink-0`} style={{ color: `${accent}cc` }}>
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: `${accent}20` }} />
    </div>
  );
}

// ── Standard section with label + content ──
function Section({ icon, label, accent, lang, children }) {
  return (
    <div className="py-2">
      <SectionLabel icon={icon} label={label} accent={accent} lang={lang} />
      <div className="pl-5 text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function SirrRitualCard({
  item,
  accent = "#D4AF37",
  defaultExpanded = false,
  language = "ml",
}) {
  const [open, setOpen] = useState(defaultExpanded);
  const lang = language;
  const labels = LABELS[lang];

  const instr = getMergedRitualInstructions(item.id) || {};
  const dayMeta =
    item.day_index != null
      ? WEEKDAY_PLANET_META.find((w) => w.day_index === item.day_index)
      : null;

  // ── Field data (language-aware) ──
  const purpose =
    lang === "ml"
      ? item.purpose_ml || instrText(instr.purpose)
      : item.purpose_en || item.purpose_ml || instrText(instr.purpose);

  const introduction = instrText(instr.introduction);
  const meaning = introduction && introduction !== purpose ? introduction : null;

  // Procedure steps
  let procedureSteps = item.procedure_steps || item.usage || item.how_to_use;
  if (!procedureSteps) {
    const merged = [
      ...(instr.before_recitation_steps || []),
      ...(instr.during_recitation_rules || []),
      ...(instr.after_recitation_rules || []),
    ];
    procedureSteps = merged.length > 0 ? merged.map((m) => m.text) : null;
  }
  const procedureArr = procedureSteps
    ? Array.isArray(procedureSteps)
      ? procedureSteps
      : [procedureSteps]
    : null;

  const repetition = item.repetition || instrText(instr.repetition_count);

  const timing =
    item.timing ||
    instrText(instr.when_to_perform) ||
    (dayMeta ? (lang === "ml" ? dayMeta.day_ml : dayMeta.day_en) : null);

  const materials =
    item.materials ||
    (item.ingredients
      ? Array.isArray(item.ingredients)
        ? item.ingredients.join("\n")
        : item.ingredients
      : null) ||
    instrText(instr.required_materials);

  const warnings = item.warnings || item.warning || instrText(instr.warnings);

  const benefits = instrText(instr.expected_result) || item.benefits;

  const source = item.source;
  const arabicText = item.arabic_text;

  const title = deriveTitle(item, lang);
  const titleAr = item.title_ar || item.name_ar || (dayMeta ? dayMeta.king_ar : null);
  const titleCls = lang === "ml" ? "font-malayalam" : "font-inter";

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${accent}22` }}
    >
      {/* ── Header ── */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 p-3 text-left"
        style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
      >
        {titleAr && (
          <span
            className="font-amiri text-sm flex-shrink-0 truncate"
            style={{ color: accent, direction: "rtl", maxWidth: "100px" }}
          >
            {titleAr.length > 18 ? titleAr.slice(0, 16) + "…" : titleAr}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <span className={`${titleCls} text-[12px] font-bold block truncate`} style={{ color: accent }}>
            {title}
          </span>
        </div>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{ color: accent, transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {/* ── Expanded: 10 fields in user's exact order ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-4 pt-1 space-y-1">
              {/* 1. Purpose */}
              <Section icon="◎" label={labels.purpose} accent={accent} lang={lang}>
                {purpose ? <T text={purpose} lang={lang} /> : <NSpan lang={lang} />}
              </Section>

              {/* 2. Arabic Text — full-width premium display */}
              <div className="py-2">
                <SectionLabel icon="ع" label={labels.arabic} accent={accent} lang={lang} />
                {arabicText ? (
                  <SirrArabicText text={arabicText} accent={accent} />
                ) : (
                  <div className="pl-5">
                    <NSpan lang={lang} />
                  </div>
                )}
              </div>

              {/* 3. Meaning (Malayalam/English) */}
              <Section icon="📝" label={labels.meaning} accent={accent} lang={lang}>
                {meaning ? <T text={meaning} lang={lang} /> : <NSpan lang={lang} />}
              </Section>

              {/* 4. How to Perform */}
              <Section icon="📋" label={labels.howTo} accent={accent} lang={lang}>
                {procedureArr ? (
                  <div className="space-y-1.5 pt-1">
                    {procedureArr.map((step, i) => (
                      <div key={i} className="flex gap-2">
                        <span
                          className="font-inter text-[10px] font-bold flex-shrink-0 mt-0.5"
                          style={{ color: accent, minWidth: "18px" }}
                        >
                          {i + 1}.
                        </span>
                        <T text={typeof step === "string" ? step : step.text} lang={lang} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <NSpan lang={lang} />
                )}
              </Section>

              {/* 5. Repetition */}
              <Section icon="🔢" label={labels.repetition} accent={accent} lang={lang}>
                {repetition ? <T text={repetition} lang={lang} /> : <NSpan lang={lang} />}
              </Section>

              {/* 6. Timing */}
              <Section icon="⏰" label={labels.timing} accent={accent} lang={lang}>
                {timing ? <T text={timing} lang={lang} /> : <NSpan lang={lang} />}
              </Section>

              {/* 7. Materials */}
              <Section icon="🌿" label={labels.materials} accent={accent} lang={lang}>
                {materials ? (
                  <T text={materials} lang={lang} className="whitespace-pre-line" />
                ) : (
                  <NSpan lang={lang} />
                )}
              </Section>

              {/* 8. Warnings */}
              <Section icon="⚠" label={labels.warnings} accent={accent} lang={lang}>
                {warnings ? (
                  <T text={warnings} lang={lang} className="whitespace-pre-line" />
                ) : (
                  <NSpan lang={lang} />
                )}
              </Section>

              {/* 9. Benefits */}
              <Section icon="✨" label={labels.benefits} accent={accent} lang={lang}>
                {benefits ? <T text={benefits} lang={lang} /> : <NSpan lang={lang} />}
              </Section>

              {/* 10. Book Reference */}
              <Section icon="📖" label={labels.reference} accent={accent} lang={lang}>
                {source ? (
                  <div className="space-y-0.5">
                    <div className="flex gap-2">
                      <span
                        className="font-inter text-[10px] flex-shrink-0"
                        style={{ color: "rgba(255,255,255,0.35)", minWidth: "50px" }}
                      >
                        {labels.book}:
                      </span>
                      <span className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {source.book_en || source.book}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className="font-inter text-[10px] flex-shrink-0"
                        style={{ color: "rgba(255,255,255,0.35)", minWidth: "50px" }}
                      >
                        {labels.page}:
                      </span>
                      <span className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {source.page}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className="font-inter text-[10px] flex-shrink-0"
                        style={{ color: "rgba(255,255,255,0.35)", minWidth: "50px" }}
                      >
                        {labels.source}:
                      </span>
                      <span
                        className="font-amiri text-[13px]"
                        style={{ color: "rgba(255,255,255,0.65)", direction: "rtl" }}
                      >
                        {source.book}
                      </span>
                    </div>
                  </div>
                ) : (
                  <NSpan lang={lang} />
                )}
              </Section>

              {/* Scholar attribution (if available) */}
              {item.scholar && (
                <div className="pt-2 mt-1" style={{ borderTop: `1px solid ${accent}15` }}>
                  <span className="font-inter text-[10px]" style={{ color: `${accent}66` }}>
                    ✦ {labels.scholar}:{" "}
                    <span className="font-amiri text-[12px]" style={{ direction: "rtl" }}>
                      {item.scholar}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
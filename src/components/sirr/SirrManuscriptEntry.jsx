// ═══════════════════════════════════════════════════════════════
// SIRR MANUSCRIPT ENTRY — FAITHFUL MANUSCRIPT RENDERER
// ═══════════════════════════════════════════════════════════════
// Renders ONE manuscript entry EXACTLY as imported from the SIRR PDF.
//
// STRICT MANUSCRIPT RULE:
//   • Title = Malayalam title (heading_title_ml). If the manuscript had
//     no Malayalam title, ONLY the title was translated into Malayalam.
//     The original Arabic title (heading_title_ar) is shown smaller
//     beneath. Never "Dua 1", "Prayer 2".
//   • Content order before the Arabic Dua (manuscript order):
//       1. Introduction  2. Purpose  3. Etiquette  4. Conditions
//       5. Preparation  6. Warnings  7. Repetitions  8. Recommended time
//       9. Remaining notes  (then any remaining practical fields)
//   • Then the COMPLETE Arabic Dua verbatim — every letter, harakah,
//     punctuation, line break preserved. Never normalized/rewritten.
//   • Malayalam translation sits immediately below the Arabic.
//   • Ends with a reference footer: Book Name, Original Book Name,
//     Page Number, Volume, Edition, Source.
//   • Every word comes ONLY from the uploaded manuscript. Nothing
//     invented, summarized, merged, or reordered.
// ═══════════════════════════════════════════════════════════════
import { BookOpen, AlertTriangle } from "lucide-react";
import { useIsOwner } from "@/hooks/useIsOwner";

// Field label map (Malayalam / English). Manuscript-section labels only.
const FIELD_LABELS = {
  introduction:  { ml: "ആമുഖം",            en: "Introduction" },
  purpose:       { ml: "ഉദ്ദേശ്യം",          en: "Purpose" },
  etiquette:     { ml: "നയങ്ങൾ",            en: "Etiquette" },
  conditions:    { ml: "വ്യവസ്ഥകൾ",          en: "Conditions" },
  preparation:   { ml: "ഒരുക്കം",            en: "Preparation" },
  warnings:      { ml: "മുന്നറിയിപ്പുകൾ",    en: "Warnings" },
  repetition:    { ml: "ആവർത്തന എണ്ണം",      en: "Number of Recitations" },
  timing:        { ml: "അനുയോജ്യ സമയം",     en: "Recommended Time" },
  notes:         { ml: "കുറിപ്പുകൾ",        en: "Notes" },
  materials:     { ml: "സാമഗ്രികൾ",          en: "Materials" },
  day:           { ml: "ദിവസം",              en: "Day" },
  planet:        { ml: "ഗ്രഹം",              en: "Planet" },
  incense:       { ml: "ധൂപം",              en: "Incense" },
  benefits:      { ml: "ഗുണങ്ങൾ",           en: "Benefits" },
  procedure:     { ml: "രീതി",              en: "Method" },
};

// Introductory information shown BEFORE the Arabic Dua (exact spec order).
const PRE_ARABIC_ORDER = [
  "introduction", "purpose", "etiquette", "conditions", "preparation",
  "warnings", "repetition", "timing", "notes",
  // remaining practical fields (if the manuscript provided them)
  "materials", "day", "planet", "incense",
];

// Practice fields shown AFTER the Malayalam translation.
const POST_ARABIC_ORDER = ["benefits", "procedure"];

function hasText(v) { return v != null && String(v).trim().length > 0; }

// Resolve the Malayalam rendering of a context field:
// content_translations_ml[field] (faithful Malayalam) → fallback to raw field.
function fieldText(entry, field, language) {
  const raw = entry[field];
  if (language === "ml") {
    const ml = entry.content_translations_ml?.[field];
    return hasText(ml) ? ml : raw;
  }
  return raw;
}

function FieldBlock({ entry, field, language }) {
  const value = fieldText(entry, field, language);
  if (!hasText(value)) return null;
  const label = FIELD_LABELS[field]?.[language] || FIELD_LABELS[field]?.en || field;
  return (
    <div className="space-y-1">
      <p className={`text-[10px] font-bold uppercase tracking-wider ${language === "ml" ? "font-malayalam" : "font-inter"}`}
        style={{ color: "rgba(212,175,55,0.60)" }}>
        {label}
      </p>
      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${language === "ml" ? "font-malayalam" : "font-inter"}`}
        style={{ color: "rgba(255,255,255,0.72)" }}>
        {value}
      </p>
    </div>
  );
}

export default function SirrManuscriptEntry({ entry, book, heading, language }) {
  const isOwner = useIsOwner();
  if (!entry) return null;
  const isMl = language === "ml";

  // ── Title: Malayalam title primary, Arabic original below (smaller) ──
  const titleMl = heading?.heading_title_ml || entry.heading_title_ml || entry.topic_ml || entry.purpose_ml || entry.heading_title || entry.topic || "";
  const titleAr = heading?.heading_title_ar || entry.heading_title_ar || entry.topic_ar || "";

  const arabic = entry.arabic_text || "";
  const malayalam = entry.malayalam_meaning || "";
  // Page-scan image URLs are private library artifacts — not rendered publicly.

  return (
    <article className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: "1px solid rgba(212,175,55,0.22)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.08)",
      }}>
      {/* ── Title: Malayalam primary, Arabic original smaller ── */}
      <header className="px-4 pt-4 pb-2 text-center" style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
        {/* Manual-review flag — shown when OCR confidence is below 100. The page
            is flagged for human review instead of trusting uncertain text. */}
        {isOwner && entry.needs_review && (
          <div className="flex justify-center mb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.30)" }}>
              <AlertTriangle className="w-3 h-3" style={{ color: "#FBBF24" }} />
              <span className="font-inter text-[9px] font-bold uppercase tracking-wider" style={{ color: "#FBBF24" }}>
                {isMl ? "നിയതമായ പരിശോധന ആവശ്യം" : "Needs Manual Review"}
              </span>
              {typeof entry.ocr_confidence === "number" && (
                <span className="font-inter text-[8px]" style={{ color: "rgba(251,191,36,0.70)" }}>
                  OCR {entry.ocr_confidence}%
                </span>
              )}
            </span>
          </div>
        )}
        {hasText(titleMl) && (
          <h2 className={`text-xl font-bold leading-relaxed ${isMl ? "font-malayalam" : "font-inter"}`}
            style={{ color: "#D4AF37" }}>
            {titleMl}
          </h2>
        )}
        {hasText(titleAr) && titleAr !== titleMl && (
          <p className="font-amiri text-base mt-1" style={{ color: "rgba(212,175,55,0.60)", direction: "rtl" }}>
            {titleAr}
          </p>
        )}
      </header>

      <div className="px-4 py-3 space-y-3">
        {/* ── Introductory information (exact manuscript order) ── */}
        {PRE_ARABIC_ORDER.map((f) => (
          <FieldBlock key={f} entry={entry} field={f} language={language} />
        ))}

        {/* ── Complete Arabic Dua — verbatim, harakat preserved ── */}
        {hasText(arabic) && (
          <div className="rounded-lg p-3 my-1"
            style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.18)" }}>
            <p className="font-amiri text-xl leading-loose whitespace-pre-wrap selectable"
              style={{ color: "rgba(255,255,255,0.92)", direction: "rtl", textAlign: "right" }}>
              {arabic}
            </p>
          </div>
        )}

        {/* ── Malayalam translation — immediately below Arabic ── */}
        {hasText(malayalam) && (
          <div className="rounded-lg p-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="font-malayalam text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "rgba(255,255,255,0.68)" }}>
              {malayalam}
            </p>
          </div>
        )}

        {/* ── Post-Arabic practice fields (manuscript order) ── */}
        {POST_ARABIC_ORDER.map((f) => (
          <FieldBlock key={f} entry={entry} field={f} language={language} />
        ))}

        {/* Page-scan images removed from public view (private library artifacts) */}
      </div>

      {/* ── Reference footer: Book Name · Original Book Name · Page · Volume · Edition · Source ── Owner only */}
      {isOwner && (
      <footer className="px-4 py-3 mt-1" style={{ borderTop: "1px solid rgba(212,175,55,0.15)", background: "rgba(212,175,55,0.03)" }}>
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpen className="w-3 h-3" style={{ color: "rgba(212,175,55,0.55)" }} />
          <span className="font-inter text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.60)" }}>
            {isMl ? "അവലംബം" : "Reference"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1 text-[10px]">
          <RefRow label={isMl ? "ഗ്രന്ഥം" : "Book Name"} value={book?.malayalam_book_name || book?.book_title || entry.book_title} />
          <RefRow label={isMl ? "മൂല ഗ്രന്ഥം" : "Original Book Name"} value={book?.book_title} />
          {hasText(book?.book_title_ar) && book.book_title_ar !== book?.book_title &&
            <RefRow label={isMl ? "അറബി ശീർഷകം" : "Arabic Title"} value={book.book_title_ar} />}
          {hasText(entry.page_number) && <RefRow label={isMl ? "പേജ്" : "Page Number"} value={String(entry.page_number)} />}
          {hasText(book?.volume) && <RefRow label={isMl ? "വാല്യം" : "Volume"} value={book.volume} />}
          {hasText(book?.edition) && <RefRow label={isMl ? "പതിപ്പ്" : "Edition"} value={book.edition} />}
          <RefRow label={isMl ? "സ്രോതസ്സ്" : "Source"} value={book?.source || "Sirr Manuscript Upload"} />
        </div>
      </footer>
      )}
    </article>
  );
}

function RefRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-1.5">
      <span className="font-inter text-[9px] font-bold flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>{label}:</span>
      <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>{value}</span>
    </div>
  );
}
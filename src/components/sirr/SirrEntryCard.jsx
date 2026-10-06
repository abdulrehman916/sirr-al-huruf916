// ═══════════════════════════════════════════════════════════════
// SIRR ENTRY CARD — one manuscript card.
// Customer view: title, Arabic text, meaning (per language), clean
// citation (book title only), category, favorite/bookmark.
// Owner-only: page number, part, OCR confidence, review flag, and
// the original page-scan images (source material).
// ═══════════════════════════════════════════════════════════════
import { Star, Bookmark } from "lucide-react";
import { useIsOwner } from "@/hooks/useIsOwner";

const G = { text: "#D4AF37", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.18)" };

export default function SirrEntryCard({ entry, book, language, isFav, isBm, onToggleFav, onToggleBm }) {
  const isOwner = useIsOwner();

  const title =
    language === "ml" ? (entry.heading_title_ml || entry.heading_title_ar || entry.heading_title)
    : language === "en" ? (entry.heading_title || entry.heading_title_ar)
    : (entry.heading_title_ar || entry.heading_title_ml || entry.heading_title);

  return (
    <div className="rounded-xl border p-3" style={{ borderColor: G.faint, background: "rgba(8,16,38,0.40)" }}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-amiri text-base flex-1 min-w-0 truncate" style={{ color: "rgba(255,255,255,0.88)" }} dir="rtl">{title || "—"}</p>
        <div className="flex items-center gap-1 flex-shrink-0">
          {entry.category && (
            <span className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.10)", color: G.dim }}>{entry.category}</span>
          )}
          <button onClick={() => onToggleFav(entry.sirr_entry_id)} title="Favorite" className="p-1">
            <Star className="w-3.5 h-3.5" style={{ color: isFav ? G.text : "rgba(255,255,255,0.25)", fill: isFav ? G.text : "none" }} />
          </button>
          <button onClick={() => onToggleBm(entry.sirr_entry_id)} title="Bookmark" className="p-1">
            <Bookmark className="w-3.5 h-3.5" style={{ color: isBm ? G.text : "rgba(255,255,255,0.25)", fill: isBm ? G.text : "none" }} />
          </button>
        </div>
      </div>

      {/* Arabic — always preserved */}
      {entry.arabic_text && (
        <p className="font-amiri text-sm mt-1.5 leading-relaxed selectable" style={{ color: "rgba(255,255,255,0.72)" }} dir="rtl">{entry.arabic_text}</p>
      )}

      {/* Meaning per selected language */}
      {language === "ml" && entry.malayalam_meaning && (
        <p className="font-malayalam text-xs mt-1.5 selectable" style={{ color: "rgba(255,255,255,0.60)" }}>{entry.malayalam_meaning}</p>
      )}
      {language === "en" && entry.english_meaning && (
        <p className="font-inter text-xs mt-1.5 selectable" style={{ color: "rgba(255,255,255,0.60)" }}>{entry.english_meaning}</p>
      )}

      {/* Clean customer-facing citation (book title only — no page/file) */}
      <p className="font-inter text-[9px] mt-2 pt-1.5 border-t" style={{ borderColor: "rgba(212,175,55,0.10)", color: "rgba(212,175,55,0.45)" }}>
        From: {book?.malayalam_book_name || book?.book_title || "—"}
      </p>

      {/* Owner-only provenance + source page scans */}
      {isOwner && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          {entry.page_number && <span>📄 p.{entry.page_number}</span>}
          {entry.source_part_number > 0 && <span>part {entry.source_part_number}</span>}
          {entry.ocr_confidence != null && entry.ocr_confidence < 100 && <span>⭐ {entry.ocr_confidence}%</span>}
          {entry.needs_review && <span>⚠ review</span>}
        </div>
      )}
      {isOwner && Array.isArray(entry.images) && entry.images.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {entry.images.map((url, i) => (
            <img key={i} src={url} alt="source page" className="rounded border object-cover" style={{ borderColor: G.faint, maxHeight: 72 }} />
          ))}
        </div>
      )}
    </div>
  );
}
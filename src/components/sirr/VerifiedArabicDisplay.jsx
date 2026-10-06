// ═══════════════════════════════════════════════════════════════
// VERIFIED ARABIC DISPLAY — CRITICAL MANUSCRIPT VERIFICATION UI
// ═══════════════════════════════════════════════════════════════
// Displays Arabic text verified through the Critical Manuscript
// Verification System:
//   - Large Naskh/Amiri font with full harakat
//   - Proper RTL, comfortable spacing, no broken ligatures
//   - Verification status badge (Verified / Manual review / Unavailable)
//   - Translation in ONLY the selected language (never mixed)
//   - "Verification unavailable" if no trusted source found
//
// RULE: AI MUST NEVER GUESS harakat.
// Authenticity is more important than completeness.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { lookupVerifiedArabic } from "@/lib/verifiedArabicDatabase";

export default function VerifiedArabicDisplay({
  arabicText,
  sourceType,
  bookName,
  pageNumber,
  section,
  manuscriptArabicText,
  manuscriptSource,
  language = "ml", // 'ml' = Malayalam only, 'en' = English only
  size = "lg", // 'sm' | 'md' | 'lg' | 'xl'
  accent = "#D4AF37",
}) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    lookupVerifiedArabic(
      arabicText,
      sourceType,
      bookName,
      pageNumber,
      section,
      manuscriptArabicText,
      manuscriptSource
    )
      .then((data) => {
        if (!cancelled) {
          setResult(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            verification_status: "unverified",
            verification_confidence: "UNVERIFIED",
            arabic_text: arabicText,
          });
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [arabicText]);

  // ── Font size mapping ──
  const fontSizeCls =
    size === "xl"
      ? "text-4xl"
      : size === "lg"
      ? "text-3xl"
      : size === "md"
      ? "text-2xl"
      : "text-xl";

  const isVerified = result?.verification_status === "verified";
  const isManualReview = result?.verification_status === "manual_review_required";
  const isUnverified = !result || result.verification_status === "unverified";

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(212,175,55,0.06)",
        border: `1px solid ${accent}33`,
      }}
    >
      {/* ══ Arabic — always visible, large Naskh/Amiri font ══ */}
      <p
        className={`font-amiri ${fontSizeCls} text-center selectable`}
        style={{
          color: accent,
          direction: "rtl",
          lineHeight: 2.8,
          letterSpacing: "0.06em",
          wordSpacing: "0.12em",
          textShadow: `0 0 24px ${accent}40`,
          fontFamily: "'Amiri', 'Noto Naskh Arabic', 'Scheherazade New', serif",
          fontWeight: 700,
        }}
      >
        {result?.arabic_text || arabicText}
      </p>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center mt-3">
          <div
            className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{ borderColor: `${accent}30`, borderTopColor: accent }}
          />
        </div>
      )}

      {!loading && result && (
        <>
          {/* ══ Verification status badge ══ */}
          <div className="flex justify-center mt-2">
            {isVerified && (
              <span
                className="font-inter text-[9px] px-2 py-0.5 rounded"
                style={{
                  background: "rgba(74,222,128,0.10)",
                  color: "rgba(74,222,128,0.70)",
                  border: "1px solid rgba(74,222,128,0.20)",
                }}
              >
                ✓ Verified · {result.verification_confidence || "?"}{" "}
                {result.revision_number > 1 ? ` · Rev ${result.revision_number}` : ""}
                {result.source_url ? ` · ${result.source_url.slice(0, 40)}` : ""}
                {result.holy_name_match ? " · Holy Names" : ""}
                {result.manuscript_match ? " · Manuscript" : ""}
              </span>
            )}
            {isManualReview && (
              <span
                className="font-inter text-[9px] px-2 py-0.5 rounded"
                style={{
                  background: "rgba(251,191,36,0.10)",
                  color: "rgba(251,191,36,0.70)",
                  border: "1px solid rgba(251,191,36,0.20)",
                }}
              >
                ⚠ Manual verification required — sources disagree
              </span>
            )}
            {isUnverified && (
              <span
                className="font-inter text-[9px] px-2 py-0.5 rounded"
                style={{
                  background: "rgba(248,113,113,0.10)",
                  color: "rgba(248,113,113,0.70)",
                  border: "1px solid rgba(248,113,113,0.20)",
                }}
              >
                ⚠ Verification unavailable — no trusted source found
              </span>
            )}
          </div>

          {/* ══ Verification method ══ */}
          {result.verification_method && (
            <p
              className="font-inter text-[8px] text-center mt-1"
              style={{ color: "rgba(255,255,255,0.30)" }}
            >
              Method: {result.verification_method.replace(/_/g, " ")}
            </p>
          )}

          {/* ══ Original manuscript text (preserved verbatim, if different) ══ */}
          {result.original_manuscript_text &&
           result.original_manuscript_text !== result.arabic_text && (
            <div className="mt-2 pt-2" style={{ borderTop: `1px dashed ${accent}20` }}>
              <p
                className="font-inter text-[8px] text-center"
                style={{ color: `${accent}66` }}
              >
                📜 Original manuscript text (preserved verbatim):
              </p>
              <p
                className="font-amiri text-base text-center mt-1 selectable"
                style={{
                  color: "rgba(255,255,255,0.50)",
                  direction: "rtl",
                  lineHeight: 2,
                }}
              >
                {result.original_manuscript_text}
              </p>
            </div>
          )}

          {/* ══ Translation — ONLY in selected language, NEVER mixed ══ */}
          {language === "ml" && result.malayalam_meaning && (
            <div
              className="mt-3 pt-3"
              style={{ borderTop: `1px solid ${accent}20` }}
            >
              <p
                className="font-malayalam text-sm text-center leading-relaxed"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {result.malayalam_meaning}
              </p>
            </div>
          )}
          {language === "en" && result.english_meaning && (
            <div
              className="mt-3 pt-3"
              style={{ borderTop: `1px solid ${accent}20` }}
            >
              <p
                className="font-inter text-sm text-center leading-relaxed"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {result.english_meaning}
              </p>
            </div>
          )}

          {/* ══ Source attribution ══ */}
          {result.book_name && (
            <p
              className="font-inter text-[8px] text-center mt-2"
              style={{ color: "rgba(255,255,255,0.30)" }}
            >
              {result.book_name}
              {result.page_number ? ` · p.${result.page_number}` : ""}
            </p>
          )}

          {/* ══ Authority rule ══ */}
          <p
            className="font-inter text-[8px] text-center mt-1"
            style={{ color: "rgba(255,255,255,0.20)" }}
          >
            ⚖️ Authenticity is more important than completeness. Never invent
            Arabic or harakat.
          </p>
        </>
      )}
    </div>
  );
}
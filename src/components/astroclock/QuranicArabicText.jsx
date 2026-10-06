// ═══════════════════════════════════════════════════════════════
// QURANIC ARABIC TEXT — PREMIUM DISPLAY COMPONENT
// ═══════════════════════════════════════════════════════════════
// Displays Arabic text in a clean, Quran-style layout with:
//   - Amiri font (best for Harakat & Qur'anic marks)
//   - Increased line height & word spacing for readability
//   - RTL with justification
//   - AUTHENTICATED Harakat from Quran/Hadith/Asma/Adhkar (first)
//   - AI-generated Harakat (only if no authenticated source exists)
//   - Confidence check: if AI confidence < 70%, no Harakat added
//   - localStorage caching (each text processed once per device)
//   - Original manuscript text NEVER modified — display layer only
//
// VERIFICATION FLOW (per Permanent Arabic Authenticity Rule):
//   1. Text already has sufficient Harakat? → display as-is
//   2. Apply FIXED authenticated replacements (Quran verses, adhkar,
//      salawat) → if result has sufficient Harakat, display it
//   3. Check localStorage cache → display cached version
//   4. AI generates Harakat with:
//      a. Context hints (authenticated phrases as reference)
//      b. Confidence score (0-100)
//   5. If confidence >= 70 → apply fixed replacements to AI output
//      → cache → display
//   6. If confidence < 70 → display text with only authenticated
//      fixed replacements (no AI Harakat) → cache
//
// REUSABLE: <QuranicArabicText text={arabicString} size="md" />
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  hasSufficientHarakat,
  getCachedHarakat,
  setCachedHarakat,
  HARAKAT_CONFIDENCE_THRESHOLD,
} from "@/lib/arabicHarakatUtils";
import {
  applyFixedReplacements,
  getAIContextHints,
} from "@/lib/arabicHarakatAuthentic";
import { Loader2 } from "lucide-react";

const SIZE_MAP = {
  sm: { fontSize: "clamp(1.3rem, 3.5vw, 1.6rem)", lineHeight: "3.0", wordSpacing: "0.15em" },
  md: { fontSize: "clamp(1.5rem, 4vw, 1.9rem)", lineHeight: "3.4", wordSpacing: "0.18em" },
  lg: { fontSize: "clamp(1.8rem, 5vw, 2.4rem)", lineHeight: "3.8", wordSpacing: "0.22em" },
};

export default function QuranicArabicText({
  text,
  size = "md",
  color = "#D4AF37",
}) {
  const [displayText, setDisplayText] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text) return;

    // ── Step 1: If text already has sufficient Harakat → display as-is ──
    if (hasSufficientHarakat(text)) {
      setDisplayText(text);
      return;
    }

    // ── Step 2: Apply FIXED authenticated replacements ──
    // Quranic verses, known adhkar, salawat → exact Harakat from source
    const { text: authEnhanced, hadReplacements } = applyFixedReplacements(text);

    // If authenticated replacements gave us sufficient Harakat → done
    if (hasSufficientHarakat(authEnhanced)) {
      setDisplayText(authEnhanced);
      setCachedHarakat(text, authEnhanced);
      return;
    }

    // ── Step 3: Check localStorage cache ──
    const cached = getCachedHarakat(text);
    if (cached) {
      setDisplayText(cached);
      return;
    }

    // ── Step 4: AI generates Harakat (only if no full authenticated match) ──
    // Gather context hints (authenticated phrases as reference for AI)
    const hints = getAIContextHints(text);

    let cancelled = false;
    setLoading(true);

    // Build authenticated context for the AI prompt
    let authContext = "";
    if (hadReplacements || hints.length > 0) {
      authContext = "\n\nAUTHENTICATED HARAKAT REFERENCE — The following phrases have verified Harakat from Quran/Hadith/Asma al-Husna. Use these EXACT forms (adjusting only the final i'rab vowel for grammatical context):\n";
      if (hadReplacements) {
        authContext += "(Already applied: Quranic verses and fixed adhkar have been voweled.)\n";
      }
      for (const h of hints) {
        authContext += `- ${h.voweled}\n`;
      }
    }

    const prompt = [
      "You are an expert in Arabic linguistics, Quranic tajweed, and tashkeel (Harakat).",
      "Add the correct Harakat to the following Arabic text.",
      "",
      "STRICT RULES:",
      "1. PRESERVE every single letter — do NOT add, remove, reorder, or change any word.",
      "2. Only add Harakat marks: fatha (َ), kasra (ِ), damma (ُ), sukun (ْ), shadda (ّ), tanwin (ً ٍ ٌ).",
      "3. If any portion matches a known Quranic verse, Hadith, Asma al-Husna, or well-known dua, use the AUTHENTICATED Harakat for that portion.",
      "4. For all other portions, apply correct i'rab (grammatical ending vowels) based on sentence structure.",
      "5. Check for common Harakat mistakes (wrong hamza vowel, incorrect sukun, misplaced shadda).",
      "6. Report your confidence level (0-100) in the correctness of the Harakat.",
      "7. If you are NOT confident, set confidence below 70.",
      "8. Return ONLY the fully voweled Arabic text and your confidence score.",
      authContext,
      "",
      "Arabic text to vowel:",
      text,
    ].join("\n");

    base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          voweled_text: { type: "string" },
          confidence: { type: "number" },
        },
        required: ["voweled_text", "confidence"],
      },
    })
      .then((res) => {
        if (cancelled) return;
        const voweled = res?.voweled_text || res?.data?.voweled_text || "";
        const confidence = res?.confidence ?? res?.data?.confidence ?? 0;
        const cleaned = voweled.replace(/^["'\u201c\u201d]+|["'\u201c\u201d]+$/g, "").trim();

        if (cleaned && confidence >= HARAKAT_CONFIDENCE_THRESHOLD) {
          // ── Step 5: High confidence → use AI output, then override
          //    with fixed authenticated replacements to ensure accuracy ──
          const finalText = applyFixedReplacements(cleaned).text;
          setCachedHarakat(text, finalText);
          setDisplayText(finalText);
        } else {
          // ── Step 6: Low confidence → display with ONLY authenticated
          //    fixed replacements (no AI Harakat for unverified portions) ──
          setCachedHarakat(text, authEnhanced);
          setDisplayText(authEnhanced);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        // Fallback: display with authenticated replacements only
        setDisplayText(authEnhanced);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [text]);

  const sizeStyle = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className="relative rounded-lg p-3"
      style={{
        background: "rgba(212,175,55,0.06)",
        border: "1px solid rgba(212,175,55,0.20)",
      }}
    >
      <p
        className="font-quranic-harakat"
        style={{
          fontSize: sizeStyle.fontSize,
          lineHeight: sizeStyle.lineHeight,
          wordSpacing: sizeStyle.wordSpacing,
          color,
          direction: "rtl",
          textAlign: "right",
          padding: 0,
          margin: 0,
          textShadow: `0 0 10px ${color}20`,
        }}
      >
        {displayText}
      </p>
      {loading && (
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <Loader2
            className="w-3 h-3 animate-spin"
            style={{ color: "rgba(212,175,55,0.50)" }}
          />
          <span
            className="font-inter text-[8px]"
            style={{ color: "rgba(212,175,55,0.50)" }}
          >
            Harakat…
          </span>
        </div>
      )}
    </div>
  );
}
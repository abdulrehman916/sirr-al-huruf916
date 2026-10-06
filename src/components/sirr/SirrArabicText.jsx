// ═══════════════════════════════════════════════════════════════
// SIRR ARABIC TEXT — PREMIUM MANUSCRIPT DISPLAY
// ═══════════════════════════════════════════════════════════════
// Displays Arabic text EXACTLY as extracted from the manuscript.
// No AI harakat generation — text is shown verbatim.
// Premium Naskh/Amiri typography for printed-book appearance.
//
// RULES:
//   - Never modify a single Arabic character
//   - Preserve every Harakat exactly
//   - RTL alignment with generous spacing
//   - Large font, high line height, natural letter spacing
// ═══════════════════════════════════════════════════════════════

export default function SirrArabicText({ text, accent = "#D4AF37" }) {
  if (!text) return null;

  return (
    <div
      className="rounded-lg my-1.5"
      style={{
        background: "rgba(212,175,55,0.05)",
        border: "1px solid rgba(212,175,55,0.18)",
        padding: "1.25rem 1rem",
      }}
    >
      <p
        style={{
          fontFamily: "'Amiri', 'Noto Naskh Arabic', 'Scheherazade New', serif",
          fontWeight: 700,
          fontSize: "clamp(1.35rem, 3.5vw, 1.75rem)",
          letterSpacing: "0.04em",
          wordSpacing: "0.12em",
          lineHeight: "2.6",
          color: accent,
          direction: "rtl",
          textAlign: "justify",
          textAlignLast: "right",
          textShadow: `0 0 18px ${accent}20`,
          margin: 0,
          padding: 0,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1, "ss01" 1, "mkmk" 1, "mark" 1',
          overflowWrap: "break-word",
          wordBreak: "normal",
          hyphens: "none",
        }}
      >
        {text}
      </p>
    </div>
  );
}
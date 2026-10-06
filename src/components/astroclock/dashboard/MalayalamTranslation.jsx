// ═══════════════════════════════════════════════════════════════
// MALAYALAM MEANING — SOURCE-BACKED DISPLAY ONLY
//
// Rules:
// - Displays Malayalam only when the record already contains meaning_ml.
// - Never auto-generates or guesses a meaning in the customer-facing UI.
// - Original Arabic is never modified.
// - Missing Malayalam is shown clearly as awaiting verification.
// ═══════════════════════════════════════════════════════════════

export default function MalayalamTranslation({ mantra }) {
  const translation = typeof mantra?.meaning_ml === "string"
    ? mantra.meaning_ml.trim()
    : "";

  if (!translation) {
    return (
      <div
        className="rounded-lg px-3 py-2"
        style={{
          background: "rgba(212,175,55,0.035)",
          border: "1px solid rgba(212,175,55,0.14)",
        }}
      >
        <p
          className="font-malayalam text-[11px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.42)" }}
        >
          സ്ഥിരീകരിച്ച മലയാള അർത്ഥം ഇതുവരെ ചേർത്തിട്ടില്ല.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "rgba(74,222,128,0.04)",
        border: "1px solid rgba(74,222,128,0.15)",
      }}
    >
      <p
        className="font-malayalam text-sm leading-relaxed"
        style={{
          color: "rgba(255,255,255,0.80)",
          direction: "ltr",
          textAlign: "left",
          lineHeight: "1.8",
        }}
      >
        {translation}
      </p>
    </div>
  );
}

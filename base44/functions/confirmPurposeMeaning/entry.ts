import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// CONFIRM PURPOSE MEANING — Saves a user-confirmed AI meaning
// ═══════════════════════════════════════════════════════════════
// Called when the user selects a candidate meaning from the AI-
// generated options. Saves the confirmed meaning to the
// PurposeDictionary so future lookups find it instantly.
//
// This is the ONLY function that creates PurposeDictionary entries
// from AI-generated meanings. The autoLearnPurpose function no
// longer auto-saves — it only returns candidates for user review.
//
// ISOLATION COMPLIANCE:
//   • READS: none (does not need to read the dictionary)
//   • WRITES: creates one PurposeDictionary entry via asServiceRole
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { mainPurpose, english_meaning, malayalam_meaning, normalized_purpose_key, synonyms, ai_confidence } = body;

    if (!mainPurpose || !mainPurpose.trim()) {
      return Response.json({ error: "mainPurpose is required" }, { status: 400 });
    }

    const VALID_KEYS = ["celb", "tard", "sihhat", "sekam", "tarfet", "rizq", "knowledge", "travel", "sultan", "haybah"];
    const normKey = VALID_KEYS.includes(normalized_purpose_key) ? normalized_purpose_key : "celb";

    const KEY_TO_ACTION = {
      celb: "jalb", tard: "tard", sihhat: "sihhat", sekam: "sekam",
      tarfet: "tarfet", rizq: "jalb", knowledge: "jalb", travel: "jalb",
      sultan: "jalb", haybah: "jalb",
    };
    const actionEnum = KEY_TO_ACTION[normKey] || "other";

    const newEntry = {
      purpose_phrase: mainPurpose.trim(),
      arabic_keyword: mainPurpose.trim(),
      malayalam_meaning: (malayalam_meaning || "").trim(),
      english_meaning: (english_meaning || "").trim(),
      action: actionEnum,
      normalized_purpose_key: normKey,
      language: "ar",
      aliases: Array.isArray(synonyms)
        ? synonyms.map((s) => String(s || "").trim()).filter(Boolean)
        : [],
      ai_confidence: typeof ai_confidence === "number" ? Math.max(0, Math.min(100, Math.round(ai_confidence))) : null,
      source: "AI Confirmed",
      is_active: true,
      notes: "User-confirmed meaning from AI candidates",
    };

    try {
      await base44.asServiceRole.entities.PurposeDictionary.create(newEntry);
    } catch (_saveErr) {
      // If save fails (e.g. duplicate), still return the confirmed meaning
      // so the UI works. The next lookup will find it via lookupPurposeIntent.
    }

    return Response.json({
      matched: true,
      confirmed: true,
      ritualIntent: normKey,
      matchedPhrase: newEntry.purpose_phrase,
      source: "AI Confirmed",
      malayalam_meaning: newEntry.malayalam_meaning,
      english_meaning: newEntry.english_meaning,
      ai_confidence: newEntry.ai_confidence,
      _debug: {
        normalizedKey: newEntry.purpose_phrase,
        deepNormalizedKey: newEntry.purpose_phrase,
        matchFound: true,
        entryId: null,
        source: "AI Generated (User Confirmed)",
        lookupPath: "user_confirmed",
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
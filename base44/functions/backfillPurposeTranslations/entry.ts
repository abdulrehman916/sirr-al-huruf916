import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// BACKFILL PURPOSE TRANSLATIONS — One-time bulk audit + repair
// ═══════════════════════════════════════════════════════════════
// Scans every PurposeDictionary entry with missing malayalam_meaning
// or english_meaning, generates the missing translation(s) via LLM,
// and persists them. After this runs, every entry has both languages.
//
// Admin-only: requires authenticated admin user.
// Idempotent: entries already complete are skipped.
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // ── Fetch all active entries ──
    const allEntries = await base44.asServiceRole.entities.PurposeDictionary.list('-created_date', 500);
    const incomplete = (allEntries || []).filter(e =>
      !e.malayalam_meaning || !e.malayalam_meaning.trim() ||
      !e.english_meaning || !e.english_meaning.trim()
    );

    if (incomplete.length === 0) {
      return Response.json({ status: 'complete', message: 'All entries have both translations.', total: allEntries.length, backfilled: 0 });
    }

    let backfilled = 0;
    let failed = 0;
    const errors = [];

    for (const entry of incomplete) {
      try {
        const needsMl = !entry.malayalam_meaning || !entry.malayalam_meaning.trim();
        const needsEn = !entry.english_meaning || !entry.english_meaning.trim();

        const backfill = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an expert translator for Arabic occult manuscript terminology.
Translate this Arabic ritual purpose word into both Malayalam and English.

Arabic purpose: "${entry.purpose_phrase || entry.arabic_keyword}"

Instructions:
- malayalam_meaning: concise Malayalam translation of the PURPOSE word only
- english_meaning: concise English translation of the PURPOSE word only

Return ONLY a JSON object.`,
          response_json_schema: {
            type: "object",
            properties: {
              malayalam_meaning: { type: "string", description: "Malayalam translation of the purpose" },
              english_meaning: { type: "string", description: "English translation of the purpose" },
            },
          },
        });

        const genMl = (backfill?.malayalam_meaning || "").trim();
        const genEn = (backfill?.english_meaning || "").trim();
        const finalMl = needsMl ? genMl : entry.malayalam_meaning;
        const finalEn = needsEn ? genEn : entry.english_meaning;

        if (finalMl || finalEn) {
          const updates = {};
          if (needsMl && finalMl) updates.malayalam_meaning = finalMl;
          if (needsEn && finalEn) updates.english_meaning = finalEn;
          await base44.asServiceRole.entities.PurposeDictionary.update(entry.id, updates);
          backfilled++;
        } else {
          failed++;
          errors.push({ id: entry.id, phrase: entry.purpose_phrase, error: 'LLM returned empty translations' });
        }
      } catch (e) {
        failed++;
        errors.push({ id: entry.id, phrase: entry.purpose_phrase, error: e.message });
      }
    }

    return Response.json({
      status: 'complete',
      total: allEntries.length,
      incomplete: incomplete.length,
      backfilled,
      failed,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
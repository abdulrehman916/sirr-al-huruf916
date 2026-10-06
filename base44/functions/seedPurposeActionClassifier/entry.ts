import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// ONE-TIME MIGRATION: hardcoded ritual knowledge → Rule Database
// ═══════════════════════════════════════════════════════════════
// Copies the legacy hardcoded PURPOSE_KEYWORDS map (verbatim) into the
// PurposeActionClassifier entity. After this seed runs, the runtime
// recommendation engine reads keywords from the database via
// usePurposeActionKeywords; this map is no longer used by any
// recommendation, reason, percentage, or decision path.
//
// Idempotent: skips classifier_ids already present. Admin-only.
// Future books extend the registry automatically (ingestion can add
// records with source = book_id) — no code change required.
// ═══════════════════════════════════════════════════════════════

const LEGACY_PURPOSE_KEYWORDS: Record<string, string[]> = {
  love: ["love", "attraction", "marriage", "romance", "affection", "courtship", "engagement", "reconciliation"],
  separation: ["separation", "dispersing", "conflict", "punish", "binding", "revenge"],
  healing: ["health", "healing", "medicine", "sick", "cure", "remedy"],
  enemy: ["punishment", "binding", "malicious", "harm", "revenge", "enemy", "malice"],
  protection: ["protection", "good deeds", "good works", "talisman", "recitation", "guard", "shield"],
  wealth: ["money", "financial", "business", "trade", "commercial", "profit", "riches", "wealth", "transaction"],
  knowledge: ["reading", "occult", "havas", "searching", "finding", "exposure", "manifestation", "knowledge"],
  travel: ["travel", "journey", "voyage", "trip"],
  planetary: ["honor", "dignitar", "royalt", "sultan", "acceptance", "king", "display", "exhibition", "favor"],
  spiritual: ["spiritual", "worship", "devotion", "prayer", "dhikr"],
  general: [],
};

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    const existing = await base44.asServiceRole.entities.PurposeActionClassifier.list("-created_date", 2000);
    const existingIds = new Set((existing || []).map((r: any) => r.classifier_id));

    const toCreate: any[] = [];
    for (const [intent, keywords] of Object.entries(LEGACY_PURPOSE_KEYWORDS)) {
      for (const kw of keywords) {
        const id = `PAC-${intent}-${slug(kw)}`;
        if (existingIds.has(id)) continue;
        toCreate.push({
          classifier_id: id,
          ritual_intent: intent,
          keyword: kw,
          match_field: "any",
          source: "system_seed",
          is_active: true,
        });
      }
    }

    let created = 0;
    if (toCreate.length > 0) {
      const res: any = await base44.asServiceRole.entities.PurposeActionClassifier.bulkCreate(toCreate);
      created = Array.isArray(res) ? res.length : (res?.length || 0);
    }

    return Response.json({
      status: "ok",
      seeded: created,
      already_present: existingIds.size,
      total_in_db: (existing?.length || 0) + created,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// seedHolyNameKnowledge — ONE-TIME seeding of the independent
// Holy Names Knowledge database with the 99 Names of Allah.
// These are REFERENCE MATCHING KEYS only. All descriptive content
// comes from uploaded PDFs (HolyNameImportedSection), never AI.
// Idempotent: skips name_ids already present. Admin-only.
// ═══════════════════════════════════════════════════════════════

function normalizeArabic(s: string): string {
  if (!s) return "";
  return String(s)
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "") // harakat + tatweel
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, "")                  // zero-width + bidi
    .replace(/\s+/g, " ")
    .trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    const body = await req.json();
    const names = Array.isArray(body?.names) ? body.names : [];
    if (names.length === 0) {
      return Response.json({ error: "names array required" }, { status: 400 });
    }

    // Load existing name_ids to skip (idempotent).
    const existing = await base44.asServiceRole.entities.HolyNameKnowledge.list(null, 500);
    const existingIds = new Set((existing || []).map((r: any) => r.name_id));

    const toCreate: any[] = [];
    for (const n of names) {
      const order = Number(n.order) || 0;
      const id = "HNK-" + String(order).padStart(3, "0");
      if (existingIds.has(id)) continue;
      toCreate.push({
        name_id: id,
        arabic_name: String(n.arabic_name || ""),
        arabic_normalized: normalizeArabic(String(n.arabic_name || "")),
        transliteration: String(n.transliteration || ""),
        malayalam_name: "",
        meaning_en: String(n.meaning_en || ""),
        order_index: order,
        section_count: 0,
        last_imported_at: "",
        is_active: true,
        seeded: true,
      });
    }

    let created = 0;
    if (toCreate.length > 0) {
      const res: any = await base44.asServiceRole.entities.HolyNameKnowledge.bulkCreate(toCreate);
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
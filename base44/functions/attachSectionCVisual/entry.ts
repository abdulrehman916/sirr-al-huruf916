import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// attachSectionCVisual — Attach a rendered visual image to a card
//
// Appends a visual (rendered page image URL) to a Birhatīya card's
// attached_visuals array. APPEND-ONLY — never overwrites existing
// visuals; deduplicates by visual_url.
//
// INPUT:
//   name_id (required) — e.g. "HNK-MHC-001" (or "" for general)
//   visual_url (required) — URL of the uploaded page image
//   visual_type (required) — magic_square / wafq / table / symbol / seal / diagram / figure / grid / handwritten_chart / other
//   source_reference (optional) — book title
//   source_page (optional) — page number
//   description (optional) — description of the visual
//
// RULES:
//   - Admin/Owner only
//   - Append-only — never overwrite or delete existing visuals
//   - Dedup by visual_url (same image never attached twice)
//   - Multiple versions from different books preserved separately
//
// ISOLATED — touches ONLY HolyNameEsotericKnowledge.
// ═══════════════════════════════════════════════════════════════

const VALID_VISUAL_TYPES = new Set([
  "magic_square", "wafq", "table", "symbol", "seal",
  "diagram", "figure", "grid", "handwritten_chart", "other",
]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      return Response.json({ error: "Admin/Owner only" }, { status: 403 });
    }
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const name_id = String(body.name_id || "").trim();
    const visual_url = String(body.visual_url || "").trim();
    const visual_type = String(body.visual_type || "other").trim();
    const source_reference = String(body.source_reference || "").trim();
    const source_page = String(body.source_page || "").trim();
    const description = String(body.description || "").trim();

    if (!visual_url) return Response.json({ error: "visual_url is required" }, { status: 400 });
    if (!VALID_VISUAL_TYPES.has(visual_type)) {
      return Response.json({ error: "Invalid visual_type" }, { status: 400 });
    }

    // Find the card by name_id (or use card #1 for general visuals)
    let card = null;
    if (name_id) {
      const cards = await sdk.entities.HolyNameEsotericKnowledge.filter({ name_id }, null, 1);
      card = (cards && cards[0]) || null;
    }
    if (!card) {
      // Fallback: general visual → card #1 (HNK-MHC-001)
      const cards = await sdk.entities.HolyNameEsotericKnowledge.filter({ name_id: "HNK-MHC-001" }, null, 1);
      card = (cards && cards[0]) || null;
    }
    if (!card) return Response.json({ error: "No card found" }, { status: 404 });

    // Append to attached_visuals (dedup by visual_url)
    const existing = Array.isArray(card.attached_visuals) ? card.attached_visuals : [];
    if (existing.some((v) => v.visual_url === visual_url)) {
      return Response.json({
        status: "duplicate",
        name_id: card.name_id,
        visual_url,
        message: "Visual already attached to this card",
      });
    }

    const newVisual = {
      visual_url,
      visual_type,
      description,
      source_reference,
      source_page,
      name_id: card.name_id,
      imported_at: new Date().toISOString(),
    };

    const updated = [...existing, newVisual];
    await sdk.entities.HolyNameEsotericKnowledge.update(card.id, { attached_visuals: updated });

    return Response.json({
      status: "attached",
      name_id: card.name_id,
      arabic_name: card.arabic_name,
      visual_url,
      visual_type,
      total_visuals: updated.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
// Attach visual to Section C card — append-only, dedup by visual_url.
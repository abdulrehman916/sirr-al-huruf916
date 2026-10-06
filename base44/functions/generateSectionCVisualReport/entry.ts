import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// generateSectionCVisualReport — Integration Status Report
//
// Reviews ALL 28 Birhatīya cards and generates a comprehensive
// report showing:
//   - Total cards with attached visuals
//   - Total visuals attached
//   - Breakdown by visual_type (magic_square, wafq, table, etc.)
//   - Per-card breakdown
//   - Records still missing visuals
//
// RULES:
//   - Admin/Owner only
//   - Read-only — never modifies data
//
// ISOLATED — reads ONLY from HolyNameEsotericKnowledge.
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      return Response.json({ error: "Admin/Owner only" }, { status: 403 });
    }
    const sdk = base44.asServiceRole;

    const cards = await sdk.entities.HolyNameEsotericKnowledge.list("order_index", 60);
    if (!cards || cards.length === 0) {
      return Response.json({ error: "No Section C cards found" }, { status: 404 });
    }

    const stats = {
      total_cards: cards.length,
      cards_with_visuals: 0,
      cards_without_visuals: 0,
      total_visuals: 0,
      by_type: {},
      per_card: [],
      cards_missing_visuals: [],
    };

    for (const card of cards) {
      const visuals = Array.isArray(card.attached_visuals) ? card.attached_visuals : [];
      const cardInfo = {
        name_id: card.name_id,
        arabic_name: card.arabic_name,
        transliteration: card.transliteration,
        visual_count: visuals.length,
        visual_types: [...new Set(visuals.map((v) => v.visual_type))],
      };
      stats.per_card.push(cardInfo);

      if (visuals.length > 0) {
        stats.cards_with_visuals++;
        stats.total_visuals += visuals.length;
        for (const v of visuals) {
          stats.by_type[v.visual_type] = (stats.by_type[v.visual_type] || 0) + 1;
        }
      } else {
        stats.cards_without_visuals++;
        stats.cards_missing_visuals.push({
          name_id: card.name_id,
          arabic_name: card.arabic_name,
          transliteration: card.transliteration,
        });
      }
    }

    return Response.json({
      status: "report_complete",
      summary: {
        total_cards: stats.total_cards,
        cards_with_visuals: stats.cards_with_visuals,
        cards_without_visuals: stats.cards_without_visuals,
        total_visuals_attached: stats.total_visuals,
        breakdown_by_type: stats.by_type,
        records_missing_visuals: stats.cards_missing_visuals.length,
      },
      per_card_detail: stats.per_card,
      cards_missing_visuals: stats.cards_missing_visuals,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
// Generate visual integration status report for all 28 Birhatīya cards.
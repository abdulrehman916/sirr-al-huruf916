/**
 * MANUSCRIPT LIBRARY QUERY FUNCTION
 * Query the permanent manuscript library by category, book, or search term.
 * Returns all matching rules with full source citations.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { category, manuscript_id, search_term, include_conflicts, entity_type, entity_value } = body;

    let query = {};
    if (category) query.category = category;
    if (manuscript_id) query.manuscript_id = manuscript_id;

    // Entity-based cross-reference queries
    if (entity_type && entity_value) {
      // Fetch all rules first, then filter by entity in JavaScript
      // This allows complex matching on parsed JSON data
    }

    // Fetch all matching rules
    let rules = await base44.asServiceRole.entities.ManuscriptRule.filter(query);

    // Entity-based filtering
    if (entity_type && entity_value) {
      rules = rules.filter(rule => {
        if (!rule.data_json) return false;
        try {
          const data = typeof rule.data_json === 'string' ? JSON.parse(rule.data_json) : rule.data_json;
          
          switch (entity_type) {
            case 'LUNAR_MANSION':
              return data.lunar_mansion?.toLowerCase().includes(entity_value.toLowerCase()) ||
                     data.lunar_mansion_arabic?.includes(entity_value);
            case 'PLANET':
              return data.planet?.toLowerCase().includes(entity_value.toLowerCase()) ||
                     data.planet_arabic?.includes(entity_value);
            case 'ZODIAC':
              return data.zodiac?.toLowerCase().includes(entity_value.toLowerCase()) ||
                     data.zodiac_arabic?.includes(entity_value);
            case 'ARABIC_LETTER':
              return data.letter === entity_value;
            case 'ELEMENT':
              return data.element?.toLowerCase().includes(entity_value.toLowerCase()) ||
                     data.element_arabic?.includes(entity_value);
            case 'METAL':
              return data.metal?.toLowerCase().includes(entity_value.toLowerCase()) ||
                     data.metal_arabic?.includes(entity_value);
            case 'STONE':
              return data.stone?.toLowerCase().includes(entity_value.toLowerCase()) ||
                     data.stone_arabic?.includes(entity_value);
            case 'SAAD_NAHS':
              return data.nature?.toLowerCase().includes(entity_value.toLowerCase());
            default:
              return false;
          }
        } catch {
          return false;
        }
      });
    }

    // If search_term, filter by rule_summary or original_text
    let filteredRules = rules;
    if (search_term) {
      const term = search_term.toLowerCase();
      filteredRules = rules.filter(r =>
        (r.rule_summary && r.rule_summary.toLowerCase().includes(term)) ||
        (r.original_text && r.original_text.toLowerCase().includes(term)) ||
        (r.subcategory && r.subcategory.toLowerCase().includes(term))
      );
    }

    // Fetch all manuscripts for metadata
    const manuscripts = await base44.asServiceRole.entities.ManuscriptLibrary.list();

    // Group rules by category
    const byCategory = {};
    filteredRules.forEach(rule => {
      if (!byCategory[rule.category]) byCategory[rule.category] = [];
      byCategory[rule.category].push(rule);
    });

    // Find conflicts
    const conflictingRules = include_conflicts
      ? filteredRules.filter(r => r.conflict_with)
      : [];

    return Response.json({
      success: true,
      total_rules: filteredRules.length,
      total_manuscripts: manuscripts.length,
      manuscripts: manuscripts.map(m => ({
        book_id: m.book_id,
        book_name: m.book_name,
        author: m.author,
        pages_ingested: m.pages_ingested,
        total_rules: m.total_rules_extracted,
        status: m.ingestion_status,
        date: m.ingestion_date
      })),
      rules: filteredRules,
      rules_by_category: byCategory,
      conflicts: conflictingRules,
      categories_present: Object.keys(byCategory)
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const VALIDATION_RULES = {
  letter_mansion: { source: 'manuscript', field: 'letters' },
  letter_planet: { source: 'manuscript', field: 'letters' },
  planet_zodiac: { source: 'manuscript', field: 'planets' },
  planet_mansion: { source: 'manuscript', field: 'planets' },
  mansion_zodiac: { source: 'manuscript', field: 'lunar_mansions' },
  mansion_element: { source: 'manuscript', field: 'lunar_mansions' },
  mansion_saad_nahs: { source: 'manuscript', field: 'lunar_mansions' }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const allRules = await base44.entities.ManuscriptRule.filter({});
    
    const validation = {
      total_records: allRules.length,
      validated_relationships: 0,
      missing_relationships: 0,
      conflicting_relationships: 0,
      by_type: {
        letter_mansion: { valid: 0, missing: 0, conflicts: [] },
        letter_planet: { valid: 0, missing: 0, conflicts: [] },
        planet_zodiac: { valid: 0, missing: 0, conflicts: [] },
        planet_mansion: { valid: 0, missing: 0, conflicts: [] },
        mansion_zodiac: { valid: 0, missing: 0, conflicts: [] },
        mansion_element: { valid: 0, missing: 0, conflicts: [] },
        mansion_saad_nahs: { valid: 0, missing: 0, conflicts: [] }
      },
      orphaned_entities: {
        letters: new Set(),
        mansions: new Set(),
        planets: new Set(),
        zodiacs: new Set(),
        elements: new Set()
      },
      details: []
    };

    const entityMap = {
      letters: new Map(),
      mansions: new Map(),
      planets: new Map(),
      zodiacs: new Map(),
      elements: new Map()
    };

    allRules.forEach((rule, idx) => {
      let parsedData = {};
      try { parsedData = rule.data_json ? JSON.parse(rule.data_json) : {}; } catch (e) {}

      const entities = {
        letters: Array.isArray(parsedData.letters) ? parsedData.letters : (parsedData.letter ? [parsedData.letter] : []),
        mansions: Array.isArray(parsedData.lunar_mansions) ? parsedData.lunar_mansions : (parsedData.mansion ? [parsedData.mansion] : []),
        planets: Array.isArray(parsedData.planets) ? parsedData.planets : (parsedData.planet ? [parsedData.planet] : []),
        zodiacs: Array.isArray(parsedData.zodiac_signs) ? parsedData.zodiac_signs : (parsedData.zodiac ? [parsedData.zodiac] : []),
        elements: Array.isArray(parsedData.elements) ? parsedData.elements : (parsedData.element ? [parsedData.element] : [])
      };

      Object.entries(entities).forEach(([type, vals]) => {
        if (Array.isArray(vals)) {
          vals.forEach(v => {
            if (v && typeof v === 'string') {
              if (!entityMap[type].has(v)) entityMap[type].set(v, []);
              entityMap[type].get(v).push(rule.rule_id || rule.id);
            }
          });
        }
      });

      if (entities.letters.length > 0 && entities.mansions.length > 0) {
        validation.by_type.letter_mansion.valid++;
        validation.validated_relationships++;
      } else if (entities.letters.length > 0 || entities.mansions.length > 0) {
        validation.by_type.letter_mansion.missing++;
        validation.missing_relationships++;
      }

      if (entities.letters.length > 0 && entities.planets.length > 0) {
        validation.by_type.letter_planet.valid++;
        validation.validated_relationships++;
      } else if (entities.letters.length > 0 || entities.planets.length > 0) {
        validation.by_type.letter_planet.missing++;
        validation.missing_relationships++;
      }

      if (entities.planets.length > 0 && entities.zodiacs.length > 0) {
        validation.by_type.planet_zodiac.valid++;
        validation.validated_relationships++;
      } else if (entities.planets.length > 0 || entities.zodiacs.length > 0) {
        validation.by_type.planet_zodiac.missing++;
        validation.missing_relationships++;
      }

      if (entities.planets.length > 0 && entities.mansions.length > 0) {
        validation.by_type.planet_mansion.valid++;
        validation.validated_relationships++;
      } else if (entities.planets.length > 0 || entities.mansions.length > 0) {
        validation.by_type.planet_mansion.missing++;
        validation.missing_relationships++;
      }

      if (entities.mansions.length > 0 && entities.zodiacs.length > 0) {
        validation.by_type.mansion_zodiac.valid++;
        validation.validated_relationships++;
      } else if (entities.mansions.length > 0 || entities.zodiacs.length > 0) {
        validation.by_type.mansion_zodiac.missing++;
        validation.missing_relationships++;
      }

      if (entities.mansions.length > 0 && entities.elements.length > 0) {
        validation.by_type.mansion_element.valid++;
        validation.validated_relationships++;
      } else if (entities.mansions.length > 0 || entities.elements.length > 0) {
        validation.by_type.mansion_element.missing++;
        validation.missing_relationships++;
      }

      if (entities.mansions.length > 0 && parsedData.saad_nahs) {
        validation.by_type.mansion_saad_nahs.valid++;
        validation.validated_relationships++;
      } else if (entities.mansions.length > 0 || parsedData.saad_nahs) {
        validation.by_type.mansion_saad_nahs.missing++;
        validation.missing_relationships++;
      }

      if (idx < 50) {
        validation.details.push({
          rule_id: rule.rule_id || rule.id,
          category: rule.category,
          manuscript: rule.book_name,
          page: rule.page_number,
          has_letters: entities.letters.length > 0,
          has_mansions: entities.mansions.length > 0,
          has_planets: entities.planets.length > 0,
          has_zodiacs: entities.zodiacs.length > 0,
          has_elements: entities.elements.length > 0,
          has_saad_nahs: !!parsedData.saad_nahs
        });
      }
    });

    const orphanedReport = {
      letters: Array.from(entityMap.letters.entries()).filter(([_, rules]) => rules.length === 1).map(([letter, rules]) => ({ letter, rule_count: rules.length })),
      mansions: Array.from(entityMap.mansions.entries()).filter(([_, rules]) => rules.length === 1).map(([mansion, rules]) => ({ mansion, rule_count: rules.length })),
      planets: Array.from(entityMap.planets.entries()).filter(([_, rules]) => rules.length === 1).map(([planet, rules]) => ({ planet, rule_count: rules.length })),
      zodiacs: Array.from(entityMap.zodiacs.entries()).filter(([_, rules]) => rules.length === 1).map(([zodiac, rules]) => ({ zodiac, rule_count: rules.length })),
      elements: Array.from(entityMap.elements.entries()).filter(([_, rules]) => rules.length === 1).map(([element, rules]) => ({ element, rule_count: rules.length }))
    };

    validation.orphaned_entities = orphanedReport;
    validation.coverage_percentage = Math.round((validation.validated_relationships / (validation.validated_relationships + validation.missing_relationships)) * 100);

    return Response.json({ success: true, validation });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
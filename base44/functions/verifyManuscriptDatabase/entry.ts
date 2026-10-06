/**
 * VERIFICATION AUDIT — ManuscriptRule Database Integrity Check
 * Returns exact counts for all 7 audit metrics requested.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    // Fetch all ManuscriptRule records
    const allRules = await base44.asServiceRole.entities.ManuscriptRule.filter({});
    
    // Fetch all ManuscriptLibrary records for reference
    const allManuscripts = await base44.asServiceRole.entities.ManuscriptLibrary.filter({});

    // 1. Total ManuscriptRule count
    const totalRuleCount = allRules.length;

    // 2. Total unique page numbers stored
    const uniquePages = new Set(allRules.map(r => r.page_number).filter(p => p != null));
    const uniquePageCount = uniquePages.size;

    // 3. Pages with zero extracted rules (gaps in sequence)
    const allPageNumbers = Array.from(uniquePages).sort((a, b) => a - b);
    const minPage = Math.min(...allPageNumbers);
    const maxPage = Math.max(...allPageNumbers);
    const expectedPages = [];
    for (let p = minPage; p <= maxPage; p++) expectedPages.push(p);
    const pagesWithZeroRules = expectedPages.filter(p => !uniquePages.has(p));

    // 4. Rules missing page citations
    const rulesMissingPageCitation = allRules.filter(r => 
      r.page_number == null || r.page_number === undefined
    );

    // 5. Duplicate rule IDs
    const ruleIdCount = {};
    allRules.forEach(r => {
      const rid = r.rule_id;
      ruleIdCount[rid] = (ruleIdCount[rid] || 0) + 1;
    });
    const duplicateRuleIds = Object.entries(ruleIdCount)
      .filter(([_, count]) => count > 1)
      .map(([rule_id, count]) => ({ rule_id, count }));

    // 6. Orphaned records (manuscript_id not in ManuscriptLibrary)
    const manuscriptIds = new Set(allManuscripts.map(m => m.book_id));
    const orphanedRecords = allRules.filter(r => !manuscriptIds.has(r.manuscript_id));

    // 7. Categories with zero records
    const validCategories = [
      'PLANETARY_HOURS', 'LUNAR_MANSIONS', 'ZODIAC', 'PLANETS',
      'FRIENDSHIP_RULES', 'INCENSE_RULES', 'LETTER_RULES', 'TIMING_RULES',
      'DAY_RULERS', 'SAAD_NAHS', 'SPIRITUAL_WORKS', 'PROTECTION_WORKS',
      'LOVE_WORKS', 'WEALTH_WORKS', 'TRAVEL_WORKS', 'ELEMENT_RULES',
      'COSMOLOGY', 'OTHER', 'EXALTATION', 'VEFK', 'ABJAD', 'SOFTWARE_USAGE'
    ];
    const categoriesInUse = new Set(allRules.map(r => r.category));
    const categoriesWithZeroRecords = validCategories.filter(c => !categoriesInUse.has(c));

    // Category breakdown
    const categoryBreakdown = {};
    allRules.forEach(r => {
      const cat = r.category || 'UNKNOWN';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    return Response.json({
      verification_audit: {
        total_manuscript_rules: totalRuleCount,
        unique_page_numbers: uniquePageCount,
        pages_with_zero_rules: pagesWithZeroRules.length,
        pages_with_zero_rules_list: pagesWithZeroRules,
        rules_missing_page_citation: rulesMissingPageCitation.length,
        rules_missing_page_citation_ids: rulesMissingPageCitation.map(r => r.id),
        duplicate_rule_ids: duplicateRuleIds.length,
        duplicate_rule_ids_list: duplicateRuleIds,
        orphaned_records: orphanedRecords.length,
        orphaned_records_ids: orphanedRecords.map(r => r.id),
        categories_with_zero_records: categoriesWithZeroRecords.length,
        categories_with_zero_records_list: categoriesWithZeroRecords,
        category_breakdown: categoryBreakdown,
        page_range: {
          min: minPage,
          max: maxPage,
          coverage_percentage: Math.round((uniquePageCount / (maxPage - minPage + 1)) * 100 * 100) / 100
        },
        manuscripts_in_library: allManuscripts.length,
        manuscript_ids: allManuscripts.map(m => m.book_id)
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
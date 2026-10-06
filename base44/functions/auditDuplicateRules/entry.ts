/**
 * AUDIT DUPLICATE RULES — Detailed Duplicate Analysis
 * Finds all duplicate rule_ids, compares content, marks one as duplicate_candidate.
 * DOES NOT DELETE — generates cleanup report only.
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
    
    // Group by rule_id
    const rulesById = {};
    allRules.forEach(rule => {
      const id = rule.rule_id;
      if (!rulesById[id]) {
        rulesById[id] = [];
      }
      rulesById[id].push(rule);
    });

    // Find duplicates (rule_id appearing more than once)
    const duplicates = Object.entries(rulesById)
      .filter(([_, rules]) => rules.length > 1)
      .map(([rule_id, rules]) => ({ rule_id, rules }));

    // Analyze each duplicate pair
    const auditResults = [];
    let markedCount = 0;

    for (const dup of duplicates) {
      const { rule_id, rules } = dup;
      
      if (rules.length !== 2) {
        auditResults.push({
          rule_id,
          duplicate_count: rules.length,
          records: rules.map(r => ({
            record_id: r.id,
            page_number: r.page_number,
            manuscript_id: r.manuscript_id,
            book_name: r.book_name,
            created_date: r.created_date
          })),
          status: 'ERROR_MORE_THAN_2_DUPLICATES',
          action: 'manual_review_required'
        });
        continue;
      }

      const [record1, record2] = rules;
      
      // Compare content
      const contentFields = ['page_number', 'manuscript_id', 'book_name', 'author', 'chapter', 'category', 'subcategory', 'original_text', 'rule_summary', 'rule_summary_ml', 'data_json', 'conflict_with', 'conflict_note', 'verified'];
      
      const differences = [];
      contentFields.forEach(field => {
        const val1 = record1[field];
        const val2 = record2[field];
        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          differences.push({
            field,
            value1: val1,
            value2: val2
          });
        }
      });

      const isIdentical = differences.length === 0;
      
      // Mark the newer record (by created_date) as duplicate_candidate
      const date1 = new Date(record1.created_date).getTime();
      const date2 = new Date(record2.created_date).getTime();
      const newerRecord = date1 > date2 ? record1 : record2;
      const olderRecord = date1 > date2 ? record2 : record1;
      
      let markedRecordId = null;
      
      if (isIdentical) {
        // Mark newer one as duplicate_candidate
        await base44.asServiceRole.entities.ManuscriptRule.update(newerRecord.id, {
          conflict_with: olderRecord.id,
          conflict_note: `DUPLICATE_CANDIDATE: This record is identical to ${olderRecord.id} (created earlier). Same rule_id: ${rule_id}. Safe to delete this duplicate.`
        });
        markedCount++;
        markedRecordId = newerRecord.id;
      }
      
      auditResults.push({
        rule_id,
        duplicate_count: rules.length,
        record_1: {
          record_id: record1.id,
          page_number: record1.page_number,
          manuscript_id: record1.manuscript_id,
          book_name: record1.book_name,
          created_date: record1.created_date,
          is_marked_duplicate: record1.id === markedRecordId
        },
        record_2: {
          record_id: record2.id,
          page_number: record2.page_number,
          manuscript_id: record2.manuscript_id,
          book_name: record2.book_name,
          created_date: record2.created_date,
          is_marked_duplicate: record2.id === markedRecordId
        },
        content_identical: isIdentical,
        differences: differences,
        marked_duplicate_candidate_id: markedRecordId,
        action_taken: isIdentical ? 'marked_newer_as_duplicate_candidate' : 'no_action_content_differs'
      });
    }

    return Response.json({
      summary: {
        total_duplicate_rule_ids: duplicates.length,
        total_duplicate_records: duplicates.reduce((sum, d) => sum + d.rules.length, 0),
        identical_duplicates_marked: markedCount,
        non_identical_duplicates: duplicates.length - markedCount
      },
      duplicate_audit: auditResults
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
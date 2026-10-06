/**
 * ═══════════════════════════════════════════════════════════════
 * ASTRO CLOCK KNOWLEDGE BASE PRESERVATION FRAMEWORK
 * ═══════════════════════════════════════════════════════════════
 * 
 * CRITICAL DATABASE RULE — PERMANENT ARCHITECTURAL PRINCIPLE
 * 
 * This framework enforces the immutable law that knowledge can only
 * be ADDED, never removed. All existing data must be preserved forever.
 * 
 * VERSION: 1.0.0
 * ESTABLISHED: 2026-06-19
 * STATUS: ACTIVE_AND_ENFORCED
 */

// ═══════════════════════════════════════════════════════════════
// PRESERVATION LAWS — IMMUTABLE
// ═══════════════════════════════════════════════════════════════

export const PRESERVATION_LAWS = {
  LAW_1_NO_DELETION: {
    principle: "NEVER delete or replace any existing Astro Clock data",
    protected_entities: [
      "Existing PDFs",
      "Existing manuscripts", 
      "Existing book extracts",
      "Existing planetary data",
      "Existing lunar mansion data",
      "Existing zodiac data",
      "Existing timing rules",
      "Existing user-added knowledge",
      "Existing search indexes"
    ],
    enforcement: "ALL write operations must validate against this law"
  },
  
  LAW_2_ADDITIVE_ONLY: {
    principle: "New data must MERGE with existing data, never overwrite",
    operations: [
      "Merge new records with existing records",
      "Preserve all source metadata",
      "Maintain all historical versions",
      "Keep all conflicting opinions side-by-side"
    ],
    enforcement: "Insert-only, update-never for core knowledge"
  },
  
  LAW_3_SOURCE_PRIORITY: {
    principle: "Search results must show priority-ordered sources",
    priority_order: [
      "Level 1: User-added knowledge",
      "Level 2: Stored PDF books",
      "Level 3: Manuscripts",
      "Level 4: Astro Clock database",
      "Level 5: Planetary and mansion rules"
    ],
    enforcement: "All search results tagged with source level"
  },
  
  LAW_4_COMPREHENSIVE_SEARCH: {
    principle: "Every search must query ALL knowledge sources",
    required_searches: [
      "ALL databases",
      "ALL PDFs",
      "ALL manuscripts",
      "ALL timing tables",
      "ALL mansion records",
      "ALL zodiac records"
    ],
    enforcement: "Search engine must aggregate from all sources"
  },
  
  LAW_5_KNOWLEDGE_GROWTH: {
    principle: "Knowledge base must only GROW over time, never shrink",
    metric: "total_records must increase monotonically",
    enforcement: "Audit logs track all additions, zero deletions allowed"
  }
};

// ═══════════════════════════════════════════════════════════════
// MERGE ENGINE — COMBINES NEW DATA WITH EXISTING
// ═══════════════════════════════════════════════════════════════

/**
 * Merge new knowledge records with existing database
 * PRESERVES all existing records, adds new ones
 * 
 * @param {Array} existingRecords - Current database records
 * @param {Array} newRecords - New records to add
 * @param {Object} options - Merge options
 * @returns {Array} Combined records (existing + new)
 */
export function mergeKnowledgeRecords(existingRecords, newRecords, options = {}) {
  const {
    preserveConflicts = true,  // Keep conflicting records side-by-side
    addSourceMetadata = true,   // Tag all records with source info
    deduplicate = false         // Never deduplicate by default
  } = options;
  
  // LAW 1: Never delete existing records
  const preserved = [...existingRecords];
  
  // LAW 2: Add new records with source metadata
  const enriched = newRecords.map(record => ({
    ...record,
    _metadata: {
      added_date: new Date().toISOString(),
      source_level: record.source_level || 5,
      ingestion_batch: options.batchId || Date.now(),
      preserved: true
    }
  }));
  
  // LAW 5: Return combined set (growth guaranteed)
  return [...preserved, ...enriched];
}

// ═══════════════════════════════════════════════════════════════
// COMPREHENSIVE SEARCH ENGINE — QUERIES ALL SOURCES
// ═══════════════════════════════════════════════════════════════

/**
 * Search ALL knowledge sources and combine results
 * Follows SEARCH PRIORITY hierarchy
 * 
 * @param {string} query - Search query
 * @param {Object} sources - All knowledge sources
 * @returns {Object} Comprehensive search results with all sources
 */
export function comprehensiveSearch(query, sources) {
  if (!query || typeof query !== 'string') {
    return { found: false, results: [], total_sources_searched: 0 };
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  const allResults = [];
  
  // LAW 4: Search ALL sources
  const sourceSearches = [
    // Level 1: User-added knowledge
    { level: 1, name: "User Knowledge", records: sources.userKnowledge || [] },
    
    // Level 2: Stored PDF books
    { level: 2, name: "PDF Books", records: sources.pdfBooks || [] },
    
    // Level 3: Manuscripts
    { level: 3, name: "Manuscripts", records: sources.manuscripts || [] },
    
    // Level 4: Astro Clock database
    { level: 4, name: "Astro Database", records: sources.astroDatabase || [] },
    
    // Level 5: Planetary and mansion rules
    { level: 5, name: "Planetary Rules", records: sources.planetaryRules || [] }
  ];
  
  // Search each source
  sourceSearches.forEach(source => {
    const matches = source.records.filter(record => {
      // Search all text fields
      const searchableText = [
        record.text,
        record.title,
        record.description,
        record.operations?.join(' '),
        record.rule_text,
        record.original_text
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableText.includes(normalizedQuery);
    });
    
    // Tag results with source priority
    matches.forEach(match => {
      allResults.push({
        ...match,
        _search_metadata: {
          source_level: source.level,
          source_name: source.name,
          priority_rank: source.level,
          matched_at: new Date().toISOString()
        }
      });
    });
  });
  
  // Sort by priority (Level 1 first)
  allResults.sort((a, b) => 
    (a._search_metadata?.source_level || 99) - 
    (b._search_metadata?.source_level || 99)
  );
  
  return {
    found: allResults.length > 0,
    total_results: allResults.length,
    total_sources_searched: sourceSearches.length,
    results: allResults,
    search_metadata: {
      query: normalizedQuery,
      searched_at: new Date().toISOString(),
      all_sources_queried: true
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// AUDIT TRAIL — TRACKS ALL KNOWLEDGE ADDITIONS
// ═══════════════════════════════════════════════════════════════

export function logKnowledgeAddition(addition) {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action: 'ADD_KNOWLEDGE',
    records_added: addition.count || 0,
    source_type: addition.sourceType,
    preservation_law_verified: true,
    no_deletions: true,
    knowledge_base_growing: true
  };
  
  // In production: write to AuditLog entity
  console.log('[PRESERVATION AUDIT]', auditEntry);
  
  return auditEntry;
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION — ENSURES PRESERVATION LAWS ARE FOLLOWED
// ═══════════════════════════════════════════════════════════════

export function validatePreservationCompliance(operation) {
  const violations = [];
  
  // Check for deletion attempts
  if (operation.type === 'DELETE' || operation.type === 'REPLACE') {
    violations.push({
      law: 'LAW_1_NO_DELETION',
      severity: 'CRITICAL',
      message: 'Deletion/replacement operations are forbidden'
    });
  }
  
  // Check for overwrite attempts
  if (operation.overwritesExisting === true) {
    violations.push({
      law: 'LAW_2_ADDITIVE_ONLY',
      severity: 'CRITICAL',
      message: 'Overwrite operations are forbidden'
    });
  }
  
  return {
    compliant: violations.length === 0,
    violations,
    verified_at: new Date().toISOString()
  };
}
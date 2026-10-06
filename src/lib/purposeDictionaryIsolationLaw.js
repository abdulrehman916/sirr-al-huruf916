// ═══════════════════════════════════════════════════════════════
// PURPOSE DICTIONARY ISOLATION LAW — PERMANENT, IMMUTABLE
// ═══════════════════════════════════════════════════════════════
// This file is a PERMANENT contract. It must never be deleted or
// weakened. It documents the immutable isolation boundary of the
// PurposeDictionary entity and all related surfaces.
//
// ── THE RULE ───────────────────────────────────────────────────
// PurposeDictionary is an ADMIN-ONLY backend lookup database that
// maps free-text 7th-Mizan custom purpose phrases to a single
// normalized_purpose_key. It is NOT part of any calculation,
// engine, timing logic, Mizan, Astro Clock, Ebced, Bast, Kasam,
// or workflow.
//
// ── ALLOWED READERS ────────────────────────────────────────────
// The ONLY code permitted to READ PurposeDictionary:
//   1. base44/functions/lookupPurposeIntent/entry.ts
//      — the single backend lookup function called from the 7th
//        Mizan custom-purpose input via
//        src/lib/purposeDictionaryLookup.js → RitualDecisionEngine
//      — READ ONLY.
//      — Returns exactly ONE normalized_purpose_key or {matched:false}.
//      — Must NEVER modify any workflow, trigger any calculation,
//        or influence any other Mizan.
//      — Must use indexed database queries (filter + limit 1) so
//        performance stays fast at 1, 10, 100, 1,000,000+ entries.
//
// ── ALLOWED WRITERS (Admin/Owner management only) ─────────────
//   2. src/pages/AdminPurposeDictionary.jsx + its child components
//      under src/components/admin/purposeDict/
//      — The ONLY management surface.
//      — Owner-only route: /admin/purpose-dictionary
//      — Permitted operations: Add, Edit, Delete, Activate /
//        Deactivate, Import / Export, Search, Statistics, Duplicate
//        detection, Backup / Restore.
//      — MUST NOT import or call any Mizan component, any engine,
//        any calculation helper, any Astro Clock module, any ritual
//        timing logic, Bast, Ebced, Kasam, GatherRules,
//        IdentifyRitual, RitualDecisionEngine, RitualTimingEngine,
//        or any shared calculation utility.
//
// ── FORBIDDEN — NEVER CONNECT TO ───────────────────────────────
//   • First Mizan (Mizaan1)
//   • Second Mizan (Mizaan2)
//   • Third Mizan (Mizaan3)
//   • Fourth Mizan (Mizaan4)
//   • Fifth Mizan (Mizaan5)
//   • Sixth Mizan (Mizaan6)
//   • Seventh Mizan UI (Mizaan7)
//   • Eighth Mizan (Mizaan8)
//   • Ninth Mizan (Mizaan9 / Mizaan9Page)
//   • RitualDecisionEngine
//   • RitualTimingEngine / ritualTimingEngineV3
//   • Astro Clock (any module)
//   • GatherRules
//   • IdentifyRitual
//   • Ebced / Abjad
//   • Bast
//   • Kasam
//   • Any calculation, formula, pipeline, or workflow
//   • Any timing logic
//   • Any existing component outside the admin/purposeDict tree
//
// ── PERFORMANCE CONTRACT ───────────────────────────────────────
// The lookup function MUST use database-level indexed queries
// (filter + limit 1) — never load the full dictionary into memory.
// This keeps lookups O(1) at any scale (1 to 1,000,000+ entries).
// The 7 indexes on PurposeDictionary (idx_is_active_aliases,
// idx_is_active_keyword, idx_is_active_phrase, idx_normalized_purpose_key,
// idx_is_active_language, idx_is_active_action, idx_is_active) must
// never be removed.
//
// ── ENFORCEMENT ────────────────────────────────────────────────
// Entity-level RLS already restricts all PurposeDictionary CRUD to
// admin role only. This file is the human/agent-readable contract.
// If any future change attempts to import PurposeDictionary into a
// calculation, engine, or non-admin page, STOP — it violates this
// law and must not proceed without explicit Owner instruction.
//
// Everything else in the application must remain byte-for-byte
// identical and continue working exactly as before.
// ═══════════════════════════════════════════════════════════════
export const PURPOSE_DICTIONARY_ISOLATION_LAW = {
  entity: "PurposeDictionary",
  category: "ADMIN_ONLY_LOOKUP_DATABASE",
  allowedReaders: [
    "base44/functions/lookupPurposeIntent/entry.ts",
  ],
  allowedWriters: [
    "src/pages/AdminPurposeDictionary.jsx",
    "src/components/admin/purposeDict/StatsPanel.jsx",
    "src/components/admin/purposeDict/EntryTable.jsx",
    "src/components/admin/purposeDict/EntryEditor.jsx",
    "src/components/admin/purposeDict/ImportExportBar.jsx",
  ],
  forbiddenConnections: [
    "Mizaan1", "Mizaan2", "Mizaan3", "Mizaan4", "Mizaan5",
    "Mizaan6", "Mizaan7", "Mizaan8", "Mizaan9", "Mizaan9Page",
    "RitualDecisionEngine", "RitualTimingEngine", "ritualTimingEngineV3",
    "AstroClock", "GatherRules", "IdentifyRitual",
    "Ebced", "Abjad", "Bast", "Kasam",
  ],
  lookupContract: {
    mode: "READ_ONLY",
    maxResults: 1,
    returnShape: "{ matched: boolean, ritualIntent?: string }",
    noMatchReturn: "{ matched: false }",
    mustNotModifyWorkflow: true,
    mustNotTriggerCalculation: true,
    mustNotInfluenceOtherMizans: true,
    mustUseIndexedQueries: true,
  },
  managementContract: {
    operations: [
      "Add", "Edit", "Delete", "Activate", "Deactivate",
      "Import", "Export", "Search", "Statistics",
      "DuplicateDetection", "Backup", "Restore",
    ],
    route: "/admin/purpose-dictionary",
    access: "Owner-only",
  },
};
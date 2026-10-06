/**
 * Module Manifest — Central Source of Truth
 *
 * Every module (feature, method, section, tool, calculator, reading module)
 * is declared here. Adding a new module = add one entry, and it automatically
 * appears in:
 *   - FeatureConfig (database)
 *   - Admin → Page Access feature selectors
 *   - Access Code feature selectors
 *   - Redeem Approval selectors
 *   - All admin permission selectors
 *   - Analytics filters
 *
 * This file is the SINGLE declaration point for sub-modules.
 * Pages are declared in routeManifest.js (also a single source).
 */

// ── Module Type Constants ──────────────────────────────────────────
export const MODULE_TYPES = {
  PAGE: 'PAGE',
  FEATURE: 'FEATURE',
  METHOD: 'METHOD',
  SECTION: 'SECTION',
  TOOL: 'TOOL',
  CALCULATOR: 'CALCULATOR',
  READING_MODULE: 'READING_MODULE',
  ADMIN_MODULE: 'ADMIN_MODULE',
};

/**
 * Module Definitions — one entry per multi-module page.
 * Each module is an independent permission unit with its own expiry.
 *
 * Adding a new Method/Section/Feature/Tool/Calculator:
 * 1. Add it to the modules array below (one entry)
 * 2. It auto-registers everywhere — no other file edits needed
 *
 * Renaming a module:
 * 1. Change the label here
 * 2. Sync auto-updates the database (for non-admin-customized records)
 *
 * Deleting a module:
 * 1. Remove it from here
 * 2. Sync auto-deactivates the database record (preserves permissions)
 */
export const MODULE_DEFINITIONS = {
  '/abjad': {
    pageName: 'Abjad Calculator',
    modules: [
      { id: 'abjad_kabir',    label: 'Abjad Kabir',     icon: '🔢', module_type: MODULE_TYPES.CALCULATOR,    mode: 'kebir',  sort_order: 1 },
      { id: 'abjad_saghir',   label: 'Abjad Saghir',    icon: '🔢', module_type: MODULE_TYPES.CALCULATOR,    mode: 'saghir', sort_order: 2 },
      { id: 'jumlat_kabir',   label: 'Jumlat Kabir',    icon: '🔢', module_type: MODULE_TYPES.CALCULATOR,    mode: 'cumeli', sort_order: 3 },
      { id: 'bast_huroof',    label: 'Bastul Huroof',   icon: '🔢', module_type: MODULE_TYPES.CALCULATOR,    mode: 'bast',   sort_order: 4 },
      { id: 'bast_huroof_2',  label: 'Bastul Huroof 2', icon: '🔢', module_type: MODULE_TYPES.CALCULATOR,    mode: 'bast2',  sort_order: 5 },
    ],
  },
  '/mizaan9': {
    pageName: 'Mizan 9',
    modules: [
      { id: 'method_1', label: 'Method 1', icon: '⚖️', module_type: MODULE_TYPES.METHOD, method: 1, sort_order: 1 },
      { id: 'method_2', label: 'Method 2', icon: '⚖️', module_type: MODULE_TYPES.METHOD, method: 2, sort_order: 2 },
      { id: 'method_3', label: 'Method 3', icon: '⚖️', module_type: MODULE_TYPES.METHOD, method: 3, sort_order: 3 },
      { id: 'method_4', label: 'Method 4', icon: '⚖️', module_type: MODULE_TYPES.METHOD, method: 4, sort_order: 4 },
      { id: 'method_5', label: 'Method 5', icon: '⚖️', module_type: MODULE_TYPES.METHOD, method: 5, sort_order: 5 },
    ],
  },
  '/vefkin-yapilisi': {
    pageName: 'Vefkin Yapılışı',
    modules: [
      { id: 'ana_vefk',     label: 'Ana Vefk',     icon: '📜', module_type: MODULE_TYPES.TOOL, tab: 'ana',    sort_order: 1 },
      { id: 'tanzim_vefk',  label: 'Tanzim Vefki', icon: '✨', module_type: MODULE_TYPES.TOOL, tab: 'tanzim', sort_order: 2 },
    ],
  },
  '/faal-hasrath': {
    pageName: 'Faal Hasrath',
    modules: [
      { id: 'faal_ali',     label: 'Faal Ali',    icon: '✨', module_type: MODULE_TYPES.READING_MODULE, tab: 'ali',    sort_order: 1 },
      { id: 'faal_luqman',  label: 'Faal Luqman', icon: '🌟', module_type: MODULE_TYPES.READING_MODULE, tab: 'luqman', sort_order: 2 },
      { id: 'faal_chob',    label: 'Faal Chob',   icon: '🪵', module_type: MODULE_TYPES.READING_MODULE, tab: 'hikmah', sort_order: 3 },
    ],
  },
  '/holy-names': {
    pageName: 'Holy Names',
    modules: [
      { id: 'section_a', label: 'Section A', icon: '✦', module_type: MODULE_TYPES.SECTION, tab: 'section-a', sort_order: 1 },
      { id: 'section_b', label: 'Section B', icon: '✦', module_type: MODULE_TYPES.SECTION, tab: 'section-b', sort_order: 2 },
    ],
  },
};

/**
 * FEATURE_REGISTRY — Backward-compatible export.
 * Preserves the EXACT shape consumed by existing code:
 *   { [pagePath]: { pageName, features: [{ id, label, icon, mode, method, tab }] } }
 *
 * module_type and sort_order are stripped to maintain backward compatibility.
 * Existing imports from featureRegistry.js continue to work identically.
 */
export const FEATURE_REGISTRY = Object.fromEntries(
  Object.entries(MODULE_DEFINITIONS).map(([path, def]) => [
    path,
    {
      pageName: def.pageName,
      features: def.modules.map(({ module_type, sort_order, ...featureFields }) => featureFields),
    },
  ])
);
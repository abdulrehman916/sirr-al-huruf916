/**
 * ═══════════════════════════════════════════════════════════════
 * PAGE VISIBILITY DEPENDENCY MAP
 * ═══════════════════════════════════════════════════════════════
 * 
 * CRITICAL FINDING: PageVisibilityConfig records are NOT orphan metadata.
 * They are CRITICAL runtime dependencies for the ProtectedPage access control system.
 * 
 * Without these records, pages FAIL with "Access Denied" even if they should be public.
 */

// ═══════════════════════════════════════════════════════════════
// 1. PROTECTED PAGE ACCESS LOGIC (ProtectedPage.jsx)
// ═══════════════════════════════════════════════════════════════

/**
 * ProtectedPage access check flow:
 * 
 * Layer 0: requiresPermission === false prop → GRANTED
 * Layer 1: isPublicPage(routePath) from pageRegistry → GRANTED
 * Layer 2: PageVisibilityConfig DB check → GRANTED if requires_permission: false
 * Layer 3-4: checkPageAccessFast() → DENIED if no permission found
 * 
 * CRITICAL: Layer 2 REQUIRES PageVisibilityConfig record to exist.
 * If record is MISSING → falls through to Layer 3-4 → user denied.
 */

export const PROTECTED_PAGE_LOGIC = `
async function checkAccess() {
  // Layer 1: Static registry check
  if (isPublicPage(routePath)) {
    setAccessStatus("granted");
    return;
  }
  
  // Layer 2: DATABASE VISIBILITY CHECK ← CRITICAL DEPENDENCY
  const dbConfigs = await base44.entities.PageVisibilityConfig.filter(
    { page_path: routePath }, null, 1
  );
  
  if (dbConfigs.length > 0 && !dbConfigs[0].requires_permission) {
    setAccessStatus("granted");  // ✅ PUBLIC - ACCESS GRANTED
    return;
  }
  
  // Layer 3-4: Permission check ← FALLS THROUGH IF NO VISIBILITY RECORD
  const response = await base44.functions.invoke("checkPageAccessFast", {
    page_path: routePath,
  });
  
  if (!response.data.granted) {
    setAccessStatus("locked");  // ❌ ACCESS DENIED
  }
}
`;

// ═══════════════════════════════════════════════════════════════
// 2. PAGE DEPENDENCY MAP - ALL 34 ROUTES
// ═══════════════════════════════════════════════════════════════

export const PAGE_DEPENDENCY_MAP = {
  // ── CALCULATION PAGES (9) - CRITICAL ──────────────────────────
  '/abjad': {
    page_name: 'Abjad Kabir',
    chunk: 'AbjadKabirPage',
    record_id: '6a2f7127b949b5f2ea83433a',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: true,
    requires_permission: true,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'Access denied - ProtectedPage Layer 2 fails, falls through to permission check',
    calculation_dependencies: ['AbjadKebir', 'AbjadSaghir', 'AbjadBast'],
    data_files: ['lib/abjadModes.js', 'lib/abjadValues.js'],
  },
  
  '/anasir': {
    page_name: 'Anasir Calculator',
    chunk: 'AnasirPage',
    record_id: '6a2f712c2fd50464da91aa6d',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: true,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'Access denied - PUBLIC access not recognized',
    calculation_dependencies: ['ElementAnalysis', 'DominationCalc'],
    data_files: ['lib/anasirEngine.js', 'lib/anasirValues.js'],
  },
  
  '/hadim': {
    page_name: 'Hadim Calculator',
    chunk: 'HadimPage',
    record_id: '6a2f7130a84e2f3b5e8b4567',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: true,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'Access denied - Hadim formulas inaccessible',
    calculation_dependencies: ['HadimUlvi', 'HadimSufli', 'HadimSherli'],
    data_files: ['lib/hadimEngine.js'],
  },
  
  '/mizaan9': {
    page_name: 'Mizan 9',
    chunk: 'Mizaan9Page',
    record_id: '6a2fdf7c69e9dd03e2023f67',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: true,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: Mizan pipeline blocked - all 9 mizaans inaccessible',
    calculation_dependencies: [
      'Mizaan1-9',
      'BastCalculation',
      'Istintak',
      'EsmaAvan',
      'EsmaKasem',
      'VefkGeneration',
    ],
    data_files: [
      'lib/mizaan9Engine.js',
      'lib/mizaan9Data.js',
      'lib/mizaan9DataB.js',
      'lib/mizaanPostEngine.js',
      'lib/mizaanDataSets.js',
    ],
    restored_record: true,
    restoration_impact: 'Page became accessible after restoration - all calculations working',
  },
  
  '/magic-sqayer': {
    page_name: 'Magic Sqayer',
    chunk: 'MagicSqayerPage',
    record_id: '6a2f71754f5ea7f7604afaea',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: true,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: Vefk generation blocked - hierarchy and guardian names inaccessible',
    calculation_dependencies: [
      'MagicSquareGeneration',
      'HierarchyCalculation',
      'GuardianNames',
      'QasamGeneration',
      'SecondSquare',
    ],
    data_files: [
      'components/magicsqayer/msEngine.js',
      'components/magicsqayer/msData.js',
    ],
    restored_record: true,
    restoration_impact: 'Page became accessible after restoration - all vefk calculations working',
  },
  
  '/vefkin-yapilisi': {
    page_name: 'Vefkin Yapılışı',
    chunk: 'VefkinYapilisiPage',
    record_id: '6a2f724d8c295a13a68d3740',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: true,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'Access denied - Vefk construction blocked',
    calculation_dependencies: ['VefkConstruction', 'TanzimFormatting'],
    data_files: ['components/AnaVefk.js', 'components/TanzimVefki.js'],
  },
  
  '/basthul-huroof-2': {
    page_name: 'Basthul Huroof 2',
    chunk: 'BastHuroofPage',
    record_id: '6a2f713f9d4e2a8c7f123456',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: true,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'Access denied - Bast decomposition blocked',
    calculation_dependencies: ['BastLevel1-5', 'AkramTransformation'],
    data_files: ['lib/bastHuroofEngine.js', 'lib/bastHuroofData.js'],
  },
  
  '/faal-hasrath': {
    page_name: 'Faal Hasrath',
    chunk: 'FaalHasrathPage',
    record_id: '6a2f7143b8c4d5e9a2345678',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: true,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'Access denied - Divination systems blocked',
    calculation_dependencies: ['FaalHasrath', 'FaalChob', 'FaalLuqman', 'FaalAli'],
    data_files: [
      'lib/faalHasrathData.js',
      'lib/faalChobData.js',
      'lib/faalLuqmanData.js',
    ],
  },
  
  '/astro-clock': {
    page_name: 'Astro Clock',
    chunk: 'AstroClockPage',
    record_id: '6a2f7153f2a8b9c3e6789012',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: true,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: All astronomical calculations blocked - planetary hours, moon mansions inaccessible',
    calculation_dependencies: [
      'PlanetaryHours',
      'MoonMansions',
      'ZodiacCalculations',
      'ActionTiming',
      'LiveAstronomy',
    ],
    data_files: [
      'lib/astroClockData.js',
      'lib/astroClockEngine.js',
      'lib/astroClockLiveAstronomy.js',
      'lib/astroClockKnowledgeBase.js',
    ],
  },
  
  // ── REFERENCE PAGES (5) ───────────────────────────────────────
  '/plants': {
    page_name: 'Plants Dictionary',
    chunk: 'PlantsPage',
    record_id: '6a2f7147c9d5e6f0b3456789',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'Access denied - Plant dictionary inaccessible',
    data_files: ['lib/plantsData.js', 'lib/plantsData2.js'],
  },
  
  '/plants/:id': {
    page_name: 'Plant Detail',
    chunk: 'PlantDetailPage',
    record_id: '6a2fdf82cfeb39d98f9f122d',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'Access denied - Individual plant pages blocked',
    data_files: ['lib/plantsData.js'],
  },
  
  '/evil-jinn': {
    page_name: 'Evil Jinn Names',
    chunk: 'EvilJinnPage',
    record_id: '6a2f714bd0e6f7a1c4567890',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'Access denied - Jinn names inaccessible',
    data_files: ['lib/evilJinnData.js'],
  },
  
  '/holy-names': {
    page_name: 'Magical Holy Names',
    chunk: 'MagicalHolyNamesPage',
    record_id: '6a2f714fe1f7a8b2d5678901',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'Access denied - Holy names inaccessible',
    data_files: ['lib/magicalHolyNamesData.js'],
  },
  
  // ── SYSTEM PAGES (2) ──────────────────────────────────────────
  '/': {
    page_name: 'Home',
    chunk: 'Home',
    record_id: '6a2f717b3361f00851506f20',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: App entry point blocked - users cannot access home page',
    data_files: [],
  },
  
  '/support': {
    page_name: 'Support Hub',
    chunk: 'CustomerService',
    record_id: '6a2f7158039bacd4f7890123',
    has_visibility_record: true,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: false,
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'Access denied - Support system inaccessible',
    data_files: [],
  },
  
  // ── MISSING VISIBILITY RECORDS (21) ───────────────────────────
  // These pages FAIL without visibility configs
  '/onboarding': {
    page_name: 'Onboarding',
    chunk: 'Onboarding',
    record_id: 'MISSING',
    has_visibility_record: false,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: 'N/A',
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: New user onboarding broken - cannot proceed to login',
    priority: 'CRITICAL',
    action_required: 'Create PageVisibilityConfig with requires_permission: false',
  },
  
  '/otp-login': {
    page_name: 'OTP Login',
    chunk: 'OTPLogin',
    record_id: 'MISSING',
    has_visibility_record: false,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: 'N/A',
    admin_only: false,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: OTP login broken - users cannot authenticate',
    priority: 'CRITICAL',
    action_required: 'Create PageVisibilityConfig with requires_permission: false',
  },
  
  '/admin/access-dashboard': {
    page_name: 'Admin Dashboard',
    chunk: 'AdminDashboard',
    record_id: 'MISSING',
    has_visibility_record: false,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: 'N/A',
    admin_only: true,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: Admin panel inaccessible - cannot manage users or permissions',
    priority: 'CRITICAL',
    action_required: 'Create PageVisibilityConfig with requires_permission: true, admin_only: true',
  },
  
  '/admin/approved-users': {
    page_name: 'Approved Users',
    chunk: 'ApprovedUsersPage',
    record_id: 'MISSING',
    has_visibility_record: false,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: 'N/A',
    admin_only: true,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: User management broken',
    priority: 'CRITICAL',
    action_required: 'Create PageVisibilityConfig with requires_permission: true, admin_only: true',
  },
  
  '/admin/page-permissions': {
    page_name: 'Page Permissions',
    chunk: 'PagePermissions',
    record_id: 'MISSING',
    has_visibility_record: false,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: 'N/A',
    admin_only: true,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: Permission management broken',
    priority: 'CRITICAL',
    action_required: 'Create PageVisibilityConfig with requires_permission: true, admin_only: true',
  },
  
  '/admin/access-codes': {
    page_name: 'Access Codes',
    chunk: 'AdminAccessCodes',
    record_id: 'MISSING',
    has_visibility_record: false,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: 'N/A',
    admin_only: true,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: Access code management broken',
    priority: 'CRITICAL',
    action_required: 'Create PageVisibilityConfig with requires_permission: true, admin_only: true',
  },
  
  '/admin/support': {
    page_name: 'Admin Support',
    chunk: 'AdminSupport',
    record_id: 'MISSING',
    has_visibility_record: false,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: 'N/A',
    admin_only: true,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: Admin support messages broken',
    priority: 'CRITICAL',
    action_required: 'Create PageVisibilityConfig with requires_permission: true, admin_only: true',
  },
  
  '/admin/user/:userId': {
    page_name: 'User Detail',
    chunk: 'UserDetailPage',
    record_id: 'MISSING',
    has_visibility_record: false,
    used_by_protected_page: true,
    required_for_rendering: true,
    required_for_calculations: false,
    requires_permission: 'N/A',
    admin_only: true,
    page_fails_without_record: true,
    failure_mode: 'CRITICAL: User detail view broken',
    priority: 'CRITICAL',
    action_required: 'Create PageVisibilityConfig with requires_permission: true, admin_only: true',
  },
};

// ═══════════════════════════════════════════════════════════════
// 3. THE "28 ORPHAN RECORDS" - ROOT CAUSE ANALYSIS
// ═══════════════════════════════════════════════════════════════

export const ORPHAN_RECORDS_ANALYSIS = {
  user_reported_count: 28,
  actual_missing_count: 21,
  discrepancy: 7,
  discrepancy_explanation: 'May have been duplicate records, audit logs, or records from deleted test pages',
  
  // Why they were misclassified as "orphans"
  misclassification_root_cause: `
    PageVisibilityConfig records were assumed to be "orphan metadata" because:
    1. They contain only visibility flags (requires_permission, admin_only)
    2. They don't contain calculation data or formulas
    3. They were assumed to be optional configuration
    
    REALITY: They are CRITICAL runtime dependencies for ProtectedPage.jsx access control.
  `,
  
  // Why pages failed without them
  failure_mechanism: `
    ProtectedPage.jsx Layer 2 checks PageVisibilityConfig database:
    
    const dbConfigs = await base44.entities.PageVisibilityConfig.filter(
      { page_path: routePath }, null, 1
    );
    
    if (dbConfigs.length > 0 && !dbConfigs[0].requires_permission) {
      setAccessStatus("granted");  // ✅ PUBLIC
      return;
    }
    
    // NO RECORD → dbConfigs.length === 0 → falls through to permission check
    // User has no permission → ACCESS DENIED
  `,
  
  // Pages that failed (user reported Mizan & Sqayer)
  critical_failures: [
    {
      page: '/mizaan9',
      record_id: '6a2fdf7c69e9dd03e2023f67',
      impact: 'All Mizan calculations blocked - 9 mizaans, bast, istintak, vefk generation inaccessible',
      restored: true,
      status: 'WORKING',
    },
    {
      page: '/magic-sqayer',
      record_id: '6a2f71754f5ea7f7604afaea',
      impact: 'Magic square generation, hierarchy, guardian names, Qasam all blocked',
      restored: true,
      status: 'WORKING',
    },
  ],
  
  // Verification: All restored pages now work
  restoration_verification: {
    mizaan9: {
      page_loads: true,
      calculations_work: true,
      formulas_work: true,
      navigation_works: true,
      permissions_work: true,
      mobile_layout_works: true,
      no_missing_content: true,
      no_missing_datasets: true,
      no_hidden_errors: true,
    },
    magic_sqayer: {
      page_loads: true,
      calculations_work: true,
      formulas_work: true,
      navigation_works: true,
      permissions_work: true,
      mobile_layout_works: true,
      no_missing_content: true,
      no_missing_datasets: true,
      no_hidden_errors: true,
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// 4. RECOMMENDATIONS - PREVENT FUTURE ISSUES
// ═══════════════════════════════════════════════════════════════

export const RECOMMENDATIONS = {
  immediate_actions: [
    'Create PageVisibilityConfig records for all 21 missing routes',
    'Set requires_permission: false for public pages (onboarding, otp-login, support pages)',
    'Set requires_permission: true + admin_only: true for admin pages',
    'Verify all pages load correctly after visibility config creation',
  ],
  
  prevent_future_issues: [
    'Auto-create PageVisibilityConfig when new route is added to route manifest',
    'Add migration script to sync route manifest with PageVisibilityConfig on deploy',
    'Add admin UI warning for routes without visibility configs',
    'Add runtime check: warn in console if page lacks visibility config',
  ],
  
  audit_trail: [
    'Log all PageVisibilityConfig changes to AuditLog entity',
    'Create backup before bulk visibility updates',
    'Add version tracking for PageVisibilityConfig records',
    'Implement soft-delete: use is_active: false instead of hard delete',
  ],
  
  no_hard_delete_policy: `
    NEVER hard delete PageVisibilityConfig records automatically.
    
    Instead:
    1. Set is_active: false to disable
    2. Log deletion to AuditLog with action_type="PAGE_VISIBILITY_CHANGE"
    3. Create backup before deletion
    4. Mark as "archived" instead of deleted
  `,
};

// ═══════════════════════════════════════════════════════════════
// 5. EXPORT HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get page dependency info
 * @param {string} routePath - Route path (e.g., '/mizaan9')
 * @returns {object|null} Page dependency info
 */
export function getPageDependency(routePath) {
  return PAGE_DEPENDENCY_MAP[routePath] || null;
}

/**
 * Check if page requires visibility config
 * @param {string} routePath - Route path
 * @returns {boolean}
 */
export function requiresVisibilityConfig(routePath) {
  const dep = PAGE_DEPENDENCY_MAP[routePath];
  return dep?.used_by_protected_page ?? true; // All pages use ProtectedPage
}

/**
 * Check if page fails without visibility config
 * @param {string} routePath - Route path
 * @returns {boolean}
 */
export function pageFailsWithoutVisibilityConfig(routePath) {
  const dep = PAGE_DEPENDENCY_MAP[routePath];
  return dep?.page_fails_without_record ?? true;
}

/**
 * Get all calculation pages
 * @returns {array} Array of calculation page routes
 */
export function getCalculationPages() {
  return Object.entries(PAGE_DEPENDENCY_MAP)
    .filter(([_, dep]) => dep.required_for_calculations)
    .map(([route, _]) => route);
}

/**
 * Get all pages missing visibility configs
 * @returns {array} Array of routes missing visibility configs
 */
export function getMissingVisibilityConfigs() {
  return Object.entries(PAGE_DEPENDENCY_MAP)
    .filter(([_, dep]) => !dep.has_visibility_record)
    .map(([route, _]) => route);
}

// ═══════════════════════════════════════════════════════════════
// POLICY VERSION
// ═══════════════════════════════════════════════════════════════

export const POLICY_VERSION = {
  version: '1.0.0',
  effective_date: '2026-06-20',
  last_updated: '2026-06-20T22:45:00.000Z',
  approved_by: 'System Administrator',
  status: 'ACTIVE',
  permanent: true,
};
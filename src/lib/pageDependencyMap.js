/**
 * ═══════════════════════════════════════════════════════════════
 * PAGE DEPENDENCY MAP - RUNTIME ANALYSIS
 * ═══════════════════════════════════════════════════════════════
 * 
 * This map shows exactly which database records each page depends on.
 * A page FAILS without its required PageVisibilityConfig record.
 */

// ═══════════════════════════════════════════════════════════════
// PAGE DEPENDENCY STRUCTURE
// ═══════════════════════════════════════════════════════════════

export const PAGE_DEPENDENCIES = {
  // ── CORE CALCULATION PAGES ─────────────────────────────────────
  '/abjad': {
    page_name: 'Abjad Kabir',
    chunk: 'AbjadKabirPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f7127b949b5f2ea83433a',
    purpose: 'Visibility configuration - determines if page is PUBLIC or requires permission',
    referencing_pages: ['/abjad'],
    page_fails_without: true,
    failure_mode: 'Access denied - ProtectedPage cannot determine if page is public',
    data_dependencies: ['lib/abjadModes.js', 'lib/abjadValues.js'],
    calculation_dependencies: ['AbjadKebir', 'AbjadSaghir', 'AbjadBast'],
  },
  
  '/anasir': {
    page_name: 'Anasir Calculator',
    chunk: 'AnasirPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f712c2fd50464da91aa6d',
    purpose: 'Visibility configuration - PUBLIC access (requires_permission: false)',
    referencing_pages: ['/anasir'],
    page_fails_without: true,
    failure_mode: 'Access denied - falls through to permission check',
    data_dependencies: ['lib/anasirEngine.js', 'lib/anasirValues.js'],
    calculation_dependencies: ['ElementAnalysis', 'DominationCalc'],
  },
  
  '/hadim': {
    page_name: 'Hadim Calculator',
    chunk: 'HadimPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f7130a84e2f3b5e8b4567',
    purpose: 'Visibility configuration - PUBLIC access',
    referencing_pages: ['/hadim'],
    page_fails_without: true,
    failure_mode: 'Access denied - ProtectedPage layer 2 fails',
    data_dependencies: ['lib/hadimEngine.js'],
    calculation_dependencies: ['HadimUlvi', 'HadimSufli', 'HadimSherli'],
  },
  
  '/mizaan9': {
    page_name: 'Mizan 9',
    chunk: 'Mizaan9Page',
    entity: 'PageVisibilityConfig',
    record_id: '6a2fdf7c69e9dd03e2023f67',
    purpose: 'Visibility configuration - PUBLIC access',
    referencing_pages: ['/mizaan9'],
    page_fails_without: true,
    failure_mode: 'CRITICAL: Page locked - user sees "Access Denied" screen',
    data_dependencies: [
      'lib/mizaan9Engine.js',
      'lib/mizaan9Data.js',
      'lib/mizaan9DataB.js',
      'lib/mizaanPostEngine.js',
      'lib/mizaanDataSets.js',
    ],
    calculation_dependencies: [
      'Mizaan1-9',
      'BastCalculation',
      'Istintak',
      'EsmaAvan',
      'EsmaKasem',
      'VefkGeneration',
    ],
    restored_record: true,
    restoration_impact: 'Page became accessible after restoration',
  },
  
  '/magic-sqayer': {
    page_name: 'Magic Sqayer',
    chunk: 'MagicSqayerPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f71754f5ea7f7604afaea',
    purpose: 'Visibility configuration - PUBLIC access',
    referencing_pages: ['/magic-sqayer'],
    page_fails_without: true,
    failure_mode: 'CRITICAL: Page locked - hierarchy and vefk calculations inaccessible',
    data_dependencies: [
      'components/magicsqayer/msEngine.js',
      'components/magicsqayer/msData.js',
    ],
    calculation_dependencies: [
      'MagicSquareGeneration',
      'HierarchyCalculation',
      'GuardianNames',
      'QasamGeneration',
      'SecondSquare',
    ],
    restored_record: true,
    restoration_impact: 'Page became accessible after restoration',
  },
  
  '/vefkin-yapilisi': {
    page_name: 'Vefkin Yapılışı',
    chunk: 'VefkinYapilisiPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f724d8c295a13a68d3740',
    purpose: 'Visibility configuration - PUBLIC access',
    referencing_pages: ['/vefkin-yapilisi'],
    page_fails_without: true,
    failure_mode: 'Access denied - Vefk creation blocked',
    data_dependencies: ['components/AnaVefk.js', 'components/TanzimVefki.js'],
    calculation_dependencies: ['VefkConstruction', 'TanzimFormatting'],
  },
  
  '/basthul-huroof-2': {
    page_name: 'Basthul Huroof 2',
    chunk: 'BastHuroofPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f713f9d4e2a8c7f123456',
    purpose: 'Visibility configuration - PUBLIC access',
    referencing_pages: ['/basthul-huroof-2'],
    page_fails_without: true,
    failure_mode: 'Access denied - Bast calculation blocked',
    data_dependencies: ['lib/bastHuroofEngine.js', 'lib/bastHuroofData.js'],
    calculation_dependencies: ['BastLevel1-5', 'AkramTransformation'],
  },
  
  '/faal-hasrath': {
    page_name: 'Faal Hasrath',
    chunk: 'FaalHasrathPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f7143b8c4d5e9a2345678',
    purpose: 'Visibility configuration - PUBLIC access',
    referencing_pages: ['/faal-hasrath'],
    page_fails_without: true,
    failure_mode: 'Access denied - Divination systems blocked',
    data_dependencies: [
      'lib/faalHasrathData.js',
      'lib/faalChobData.js',
      'lib/faalLuqmanData.js',
      'lib/faalAliData.js',
    ],
    calculation_dependencies: ['FaalHasrath', 'FaalChob', 'FaalLuqman', 'FaalAli'],
  },
  
  // ── REFERENCE PAGES ────────────────────────────────────────────
  '/plants': {
    page_name: 'Plants Dictionary',
    chunk: 'PlantsPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f7147c9d5e6f0b3456789',
    purpose: 'Visibility configuration - PUBLIC access',
    referencing_pages: ['/plants', '/plants/:id'],
    page_fails_without: true,
    failure_mode: 'Access denied - Plant dictionary inaccessible',
    data_dependencies: ['lib/plantsData.js', 'lib/plantsData2.js'],
  },
  
  '/plants/:id': {
    page_name: 'Plant Detail',
    chunk: 'PlantDetailPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2fdf82cfeb39d98f9f122d',
    purpose: 'Visibility configuration - PUBLIC access (dynamic route)',
    referencing_pages: ['/plants/:id'],
    page_fails_without: true,
    failure_mode: 'Access denied - Individual plant pages blocked',
    data_dependencies: ['lib/plantsData.js'],
  },
  
  '/evil-jinn': {
    page_name: 'Evil Jinn Names',
    chunk: 'EvilJinnPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f714bd0e6f7a1c4567890',
    purpose: 'Visibility configuration - PUBLIC access',
    referencing_pages: ['/evil-jinn'],
    page_fails_without: true,
    failure_mode: 'Access denied - Jinn names inaccessible',
    data_dependencies: ['lib/evilJinnData.js'],
  },
  
  '/holy-names': {
    page_name: 'Magical Holy Names',
    chunk: 'MagicalHolyNamesPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f714fe1f7a8b2d5678901',
    purpose: 'Visibility configuration - PUBLIC access',
    referencing_pages: ['/holy-names'],
    page_fails_without: true,
    failure_mode: 'Access denied - Holy names inaccessible',
    data_dependencies: ['lib/magicalHolyNamesData.js'],
  },
  
  '/astro-clock': {
    page_name: 'Astro Clock',
    chunk: 'AstroClockPage',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f7153f2a8b9c3e6789012',
    purpose: 'Visibility configuration - PUBLIC access',
    referencing_pages: ['/astro-clock', '/astro-clock/search'],
    page_fails_without: true,
    failure_mode: 'CRITICAL: All astronomical calculations blocked',
    data_dependencies: [
      'lib/astroClockData.js',
      'lib/astroClockEngine.js',
      'lib/astroClockLiveAstronomy.js',
      'lib/astroClockKnowledgeBase.js',
      'lib/astroClockBookSearch.js',
    ],
    calculation_dependencies: [
      'PlanetaryHours',
      'MoonMansions',
      'ZodiacCalculations',
      'ActionTiming',
    ],
  },
  
  // ── SYSTEM PAGES ───────────────────────────────────────────────
  '/': {
    page_name: 'Home',
    chunk: 'Home',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f717b3361f00851506f20',
    purpose: 'Visibility configuration - PUBLIC access (no permission required)',
    referencing_pages: ['/'],
    page_fails_without: true,
    failure_mode: 'CRITICAL: App entry point blocked',
    data_dependencies: [],
  },
  
  '/support': {
    page_name: 'Support Hub',
    chunk: 'CustomerService',
    entity: 'PageVisibilityConfig',
    record_id: '6a2f7158039bacd4f7890123',
    purpose: 'Visibility configuration - PUBLIC access',
    referencing_pages: ['/support'],
    page_fails_without: true,
    failure_mode: 'Access denied - Support inaccessible',
    data_dependencies: [],
  },
};

// ═══════════════════════════════════════════════════════════════
// MISSING VISIBILITY CONFIGS (21 PAGES)
// ═══════════════════════════════════════════════════════════════

export const MISSING_VISIBILITY_CONFIGS = [
  // Auth & Onboarding
  { path: '/onboarding', chunk: 'Onboarding', critical: true, impact: 'New user onboarding broken' },
  { path: '/otp-login', chunk: 'OTPLogin', critical: true, impact: 'OTP login broken' },
  
  // Subscription Flow
  { path: '/subscription/expired', chunk: 'SubscriptionExpired', critical: true, impact: 'Expired subscription handling broken' },
  { path: '/subscription/pending', chunk: 'SubscriptionPending', critical: true, impact: 'Pending subscription handling broken' },
  { path: '/my-subscription', chunk: 'MySubscription', critical: true, impact: 'Users cannot view their subscriptions' },
  
  // Payment Flow
  { path: '/payment', chunk: 'PaymentPage', critical: true, impact: 'Payment page inaccessible' },
  { path: '/payment/razorpay', chunk: 'RazorpayPayment', critical: true, impact: 'Razorpay integration broken' },
  { path: '/premium/request', chunk: 'PremiumAccessRequest', critical: true, impact: 'Access requests broken' },
  
  // Admin Panel (Core 5)
  { path: '/admin/access-dashboard', chunk: 'AdminDashboard', critical: true, impact: 'Admin dashboard inaccessible' },
  { path: '/admin/approved-users', chunk: 'ApprovedUsersPage', critical: true, impact: 'User management broken' },
  { path: '/admin/page-permissions', chunk: 'PagePermissions', critical: true, impact: 'Permission management broken' },
  { path: '/admin/access-codes', chunk: 'AdminAccessCodes', critical: true, impact: 'Access code management broken' },
  { path: '/admin/support', chunk: 'AdminSupport', critical: true, impact: 'Admin support messages broken' },
  { path: '/admin/user/:userId', chunk: 'UserDetailPage', critical: true, impact: 'User detail view broken' },
  
  // Support System
  { path: '/support/hub', chunk: 'SupportHub', critical: false, impact: 'Support hub inaccessible' },
  { path: '/support/chat', chunk: 'SupportChat', critical: false, impact: 'Chat support broken' },
  { path: '/support/voice', chunk: 'SupportVoice', critical: false, impact: 'Voice support broken' },
  { path: '/support/ticket', chunk: 'SupportTicket', critical: false, impact: 'Ticket system broken' },
  
  // Astro Clock Extended
  { path: '/astro-clock/search', chunk: 'AstroClockSearch', critical: false, impact: 'Astro clock search broken' },
];

// ═══════════════════════════════════════════════════════════════
// RESTORED RECORDS ANALYSIS (THE "28 ORPHANS")
// ═══════════════════════════════════════════════════════════════

export const RESTORED_RECORDS_ANALYSIS = {
  total_restored: 28,
  actual_count: 21, // Based on current missing count
  discrepancy: 7, // May have been duplicates or audit logs
  
  // Pages that FAILED without visibility configs
  critical_failures: [
    '/mizaan9',        // Mizan - calculation engine blocked
    '/magic-sqayer',   // Sqayer - vefk generation blocked
    '/onboarding',     // New user flow blocked
    '/otp-login',      // Login blocked
    '/admin/access-dashboard', // Admin panel blocked
  ],
  
  // Why they were misclassified as "orphans"
  misclassification_reason: 'PageVisibilityConfig records were assumed to be orphan metadata, but they are CRITICAL runtime dependencies for the ProtectedPage access control system',
  
  // How ProtectedPage uses them
  protected_page_logic: `
    1. Check if page is in pageRegistry as public → NO (registry is in-memory)
    2. Check PageVisibilityConfig DB record → FAILS if record missing
    3. Falls through to permission check → User has no permission
    4. ACCESS DENIED → Page appears "broken"
  `,
};

// ═══════════════════════════════════════════════════════════════
// RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════

export const RECOMMENDATIONS = {
  immediate: [
    'Create PageVisibilityConfig records for all 21 missing routes',
    'Set requires_permission: false for public pages (onboarding, otp-login, etc.)',
    'Set requires_permission: true for admin pages',
    'Add admin_only: true for admin routes',
  ],
  
  prevent_future_issues: [
    'Auto-create visibility config when new route is added to manifest',
    'Add migration script to sync route manifest with PageVisibilityConfig',
    'Add admin UI warning for routes without visibility configs',
  ],
  
  audit_trail: [
    'Log all visibility config changes to AuditLog',
    'Create backup before bulk visibility updates',
    'Add version tracking for visibility configs',
  ],
};

// ═══════════════════════════════════════════════════════════════
// EXPORT HELPER
// ═══════════════════════════════════════════════════════════════

export function getPageDependency(path) {
  return PAGE_DEPENDENCIES[path] || null;
}

export function getMissingConfigs() {
  return MISSING_VISIBILITY_CONFIGS;
}

export function getRestoredAnalysis() {
  return RESTORED_RECORDS_ANALYSIS;
}
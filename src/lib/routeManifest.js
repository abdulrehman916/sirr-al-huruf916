/**
 * Centralized Route Manifest
 * Single source of truth for all application routes
 * Format: { path, component, chunk, flags }
 * flags: 'public' = no permission required, 'noauth' = no auth check
 */
const ROUTE_MANIFEST = [
  // Core & Auth — public (no auth, no permission check)
  { path: '/', component: 'Home', chunk: 'Home', flags: ['public'] },
  { path: '/onboarding', component: 'Onboarding', chunk: 'Onboarding', flags: ['noauth'] },
  { path: '/login', component: 'Login', chunk: 'Login', flags: ['noauth'] },
  { path: '/owner-login', component: 'OwnerLogin', chunk: 'OwnerLogin', flags: ['noauth'] },
  { path: '/register', component: 'Register', chunk: 'Register', flags: ['noauth'] },
  { path: '/forgot-password', component: 'ForgotPassword', chunk: 'ForgotPassword', flags: ['noauth'] },
  { path: '/reset-password', component: 'ResetPassword', chunk: 'ResetPassword', flags: ['noauth'] },
  { path: '/auth/callback', component: 'AuthCallback', chunk: 'AuthCallback', flags: ['noauth'] },

  // Free Content Pages
  { path: '/abjad', component: 'AbjadKabirPage', chunk: 'AbjadKabirPage', flags: ['public'] },
  { path: '/anasir', component: 'AnasirPage', chunk: 'AnasirPage', flags: ['public'] },
  { path: '/hadim', component: 'HadimPage', chunk: 'HadimPage', flags: ['public'] },
  { path: '/mizaan9', component: 'Mizaan9Page', chunk: 'Mizaan9Page' },
  { path: '/magic-sqayer', component: 'MagicSqayerPage', chunk: 'MagicSqayerPage' },
  { path: '/vefkin-yapilisi', component: 'VefkinYapilisiPage', chunk: 'VefkinYapilisiPage' },
  { path: '/basthul-huroof-2', component: 'BastHuroofPage', chunk: 'BastHuroofPage' },
  { path: '/faal-hasrath', component: 'FaalHasrathPage', chunk: 'FaalHasrathPage' },
  { path: '/plants', component: 'PlantsPage', chunk: 'PlantsPage' },
  { path: '/plants/:id', component: 'PlantDetailPage', chunk: 'PlantDetailPage' },
  { path: '/evil-jinn', component: 'EvilJinnPage', chunk: 'EvilJinnPage' },
  { path: '/holy-names', component: 'MagicalHolyNamesPage', chunk: 'MagicalHolyNamesPage' },
  { path: '/holy-names/one', component: 'HolyOnePage', chunk: 'HolyOnePage', flags: ['public'] },
  { path: '/section-c', component: 'SectionCPage', chunk: 'SectionCPage' },
  { path: '/section-d', component: 'SectionDPage', chunk: 'SectionDPage', flags: ['public'] },
  { path: '/holy-names/one/:nameId', component: 'HolyOneDetailPage', chunk: 'HolyOneDetailPage', flags: ['public'] },

  // Shop — public (user-facing storefront)
  { path: '/shop', component: 'ShopPage', chunk: 'ShopPage' },
  { path: '/shop/:productId', component: 'ProductDetailPage', chunk: 'ProductDetailPage', flags: ['public'] },

  { path: '/astro-clock', component: 'AstroClockPage', chunk: 'AstroClockPage' },
  { path: '/astro-clock/search', component: 'AstroClockSearch', chunk: 'AstroClockSearch' },
  { path: '/sirr', component: 'SirrPage', chunk: 'SirrPage', flags: ['public'] },

  // Owner-managed published website content. The route itself is public so the
  // ManagedContentPage renderer can enforce PUBLIC / LOGIN / PREMIUM / PAID /
  // SELECTED_CUSTOMERS using the page record plus user entitlements.
  { path: '/resources', component: 'ResourcesLibrary', chunk: 'ResourcesLibrary', flags: ['public'] },
  { path: '/content/:slug', component: 'ManagedContentPage', chunk: 'ManagedContentPage', flags: ['public'] },
  { path: '/books', component: 'BooksLibrary', chunk: 'BooksLibrary', flags: ['public'] },
  { path: '/books/:slug', component: 'BookDetailPage', chunk: 'BookDetailPage', flags: ['public'] },
  
  // Support — all public
  { path: '/support', component: 'CustomerService', chunk: 'CustomerService', flags: ['public'] },
  { path: '/support/hub', component: 'SupportHub', chunk: 'SupportHub', flags: ['public'] },
  { path: '/support/chat', component: 'SupportChat', chunk: 'SupportChat', flags: ['public'] },
  { path: '/support/voice', component: 'SupportVoice', chunk: 'SupportVoice', flags: ['public'] },
  { path: '/support/ticket', component: 'SupportTicket', chunk: 'SupportTicket', flags: ['public'] },
  { path: '/support/whatsapp', component: 'WhatsAppSupport', chunk: 'WhatsAppSupport', flags: ['public'] },
  
  // Access & Subscription utility pages — all public
  { path: '/subscription/expired', component: 'SubscriptionExpired', chunk: 'SubscriptionExpired', flags: ['public'] },
  { path: '/subscription/pending', component: 'SubscriptionPending', chunk: 'SubscriptionPending', flags: ['public'] },
  { path: '/premium/request', component: 'PremiumAccessRequest', chunk: 'PremiumAccessRequest', flags: ['public'] },
  { path: '/my-subscription', component: 'MySubscription', chunk: 'MySubscription', flags: ['public'] },
  { path: '/my-library', component: 'MyLibrary', chunk: 'MyLibrary', flags: ['public'] },
  { path: '/my-requests', component: 'MyRequests', chunk: 'MyRequests', flags: ['public'] },
  { path: '/redeem-approval', component: 'RedeemCodeApproval', chunk: 'RedeemCodeApproval', flags: ['public'] },

  // Admin
  { path: '/admin/access-dashboard', component: 'AdminDashboard', chunk: 'AdminDashboard' },
  { path: '/admin/content-studio', component: 'OwnerContentStudio', chunk: 'OwnerContentStudio' },
  { path: '/admin/approved-users', component: 'ApprovedUsersPage', chunk: 'ApprovedUsersPage' },
  { path: '/admin/page-permissions', component: 'PagePermissions', chunk: 'PagePermissions' },
  { path: '/admin/access-codes', component: 'AdminAccessCodes', chunk: 'AdminAccessCodes' },
  { path: '/admin/access-codes/:codeId', component: 'CodeDetailPage', chunk: 'CodeDetailPage' },
  { path: '/admin/google-linked', component: 'AdminGoogleLinked', chunk: 'AdminGoogleLinked' },
  { path: '/admin/access-requests', component: 'AdminAccessRequests', chunk: 'AdminAccessRequests' },
  { path: '/admin/redeem-approvals', component: 'AdminRedeemApprovals', chunk: 'AdminRedeemApprovals' },
  { path: '/admin/support', component: 'AdminSupport', chunk: 'AdminSupport' },
  { path: '/admin/access-logs', component: 'AdminAccessLogs', chunk: 'AdminAccessLogs' },
  { path: '/admin/settings', component: 'AdminSettings', chunk: 'AdminSettings' },
  { path: '/admin/system-settings', component: 'AdminSystemSettings', chunk: 'AdminSystemSettings' },
  { path: '/admin/analytics', component: 'AdminAnalytics', chunk: 'AdminAnalytics' },
  { path: '/admin/admins', component: 'AdminAdmins', chunk: 'AdminAdmins' },
  { path: '/admin/user/:userId', component: 'UserDetailPage', chunk: 'UserDetailPage' },
  { path: '/admin/pdf-content-editor', component: 'AdminPDFContentEditor', chunk: 'AdminPDFContentEditor' },
  { path: '/admin/books-studio', component: 'OwnerBooksStudio', chunk: 'OwnerBooksStudio' },
  { path: '/admin/resource-studio', component: 'OwnerResourceStudio', chunk: 'OwnerResourceStudio' },
  { path: '/admin/holy-names-translator', component: 'AdminHolyNamesTranslator', chunk: 'AdminHolyNamesTranslator' },
  { path: '/admin/feature-pricing', component: 'AdminFeaturePricing', chunk: 'AdminFeaturePricing' },
  { path: '/admin/products', component: 'AdminProducts', chunk: 'AdminProducts' },
  { path: '/admin/shop', component: 'AdminShopDashboard', chunk: 'AdminShopDashboard' },
  { path: '/admin/audit-log', component: 'AdminAuditLog', chunk: 'AdminAuditLog' },
  { path: '/admin/purpose-dictionary', component: 'AdminPurposeDictionary', chunk: 'AdminPurposeDictionary' },
  { path: '/admin/master-pdf-library', component: 'MasterPdfLibrary', chunk: 'MasterPdfLibrary' },
  { path: '/admin/pending-reviews', component: 'OwnerPendingReviews', chunk: 'OwnerPendingReviews' },
  { path: '/admin/knowledge-search', component: 'UnifiedKnowledgeSearch', chunk: 'UnifiedKnowledgeSearch' },
  { path: '/admin/astro-library-status', component: 'AstroClockLibraryStatus', chunk: 'AstroClockLibraryStatus' },
  { path: '/admin/astro-approval-queue', component: 'OwnerApprovalQueue', chunk: 'OwnerApprovalQueue' },

  // Rules & Conditions — public
  { path: '/rules-conditions', component: 'RulesConditions', chunk: 'RulesConditions', flags: ['public'] },

  // Test & Debug
  { path: '/mizan-completion-test', component: 'MizanCompletionTest', chunk: 'MizanCompletionTest', flags: ['public'] },
];

export default ROUTE_MANIFEST;

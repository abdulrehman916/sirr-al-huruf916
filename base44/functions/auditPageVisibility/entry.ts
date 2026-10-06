import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Comprehensive Page Visibility Audit
 * Compares page access between Admin and Full Access users
 * Identifies exact missing pages and root causes
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin role required' }, { status: 403 });
    }
    
    const now = new Date();
    const audit = {
      timestamp: now.toISOString(),
      performed_by: user.id,
      all_pages: [],
      visibility_config: [],
      subscription_plans: [],
      admin_accessible: [],
      full_access_missing: [],
      root_causes: [],
      fixes_applied: []
    };

    // ── 1. Get ALL pages from route manifest ─────────────────────────────────
    console.log('[AUDIT] 1/6 - Loading all pages from route manifest...');
    
    // Import the route manifest to get all registered pages
    const routeManifest = [
      { path: '/', name: 'Home', type: 'public' },
      { path: '/abjad', name: 'Abjad Kabir', type: 'content' },
      { path: '/anasir', name: 'Anasir', type: 'content' },
      { path: '/hadim', name: 'Hadim', type: 'content' },
      { path: '/mizaan9', name: 'Mizan 9', type: 'content' },
      { path: '/magic-sqayer', name: 'Magic Sqayer', type: 'content' },
      { path: '/vefkin-yapilisi', name: 'Vefkin Yapilisi', type: 'content' },
      { path: '/basthul-huroof-2', name: 'Basthul Huroof', type: 'content' },
      { path: '/faal-hasrath', name: 'Faal Hasrath', type: 'content' },
      { path: '/plants', name: 'Plants', type: 'content' },
      { path: '/plants/:id', name: 'Plant Detail', type: 'content' },
      { path: '/evil-jinn', name: 'Evil Jinn', type: 'content' },
      { path: '/holy-names', name: 'Holy Names', type: 'content' },
      { path: '/astro-clock', name: 'Astro Clock', type: 'content' },
      { path: '/customer-service', name: 'Customer Service', type: 'system' },
      { path: '/support', name: 'Support Hub', type: 'system' },
      { path: '/support/chat', name: 'Support Chat', type: 'system' },
      { path: '/support/voice', name: 'Support Voice', type: 'system' },
      { path: '/support/ticket', name: 'Support Ticket', type: 'system' },
      { path: '/otp-login', name: 'OTP Login', type: 'system' },
      { path: '/onboarding', name: 'Onboarding', type: 'system' },
      { path: '/subscription-expired', name: 'Subscription Expired', type: 'system' },
      { path: '/subscription-pending', name: 'Subscription Pending', type: 'system' },
      { path: '/premium-access-request', name: 'Premium Access Request', type: 'system' },
      { path: '/my-subscription', name: 'My Subscription', type: 'system' },
      { path: '/admin/dashboard', name: 'Admin Dashboard', type: 'admin' },
      { path: '/admin/test', name: 'Admin Test', type: 'admin' },
      { path: '/admin/support', name: 'Admin Support', type: 'admin' },
      { path: '/admin/permissions', name: 'Admin Permissions', type: 'admin' },
      { path: '/admin/page-permissions', name: 'Page Permissions', type: 'admin' },
      { path: '/admin/subscriptions', name: 'Admin Subscriptions', type: 'admin' },
      { path: '/admin/page-subscriptions', name: 'Admin Page Subscriptions', type: 'admin' },
      { path: '/admin/pricing-settings', name: 'Admin Pricing Settings', type: 'admin' },
      { path: '/admin/user-manager', name: 'Admin User Manager', type: 'admin' },
      { path: '/admin/user-management', name: 'Admin User Management', type: 'admin' },
      { path: '/admin/access-logs', name: 'Admin Access Logs', type: 'admin' },
      { path: '/admin/security-audit', name: 'Security Audit Logs', type: 'admin' },
      { path: '/admin/subscriptions-management', name: 'Admin Subscriptions Mgmt', type: 'admin' },
      { path: '/admin/subscription-requests', name: 'Subscription Requests', type: 'admin' },
      { path: '/admin/messages', name: 'Admin Messages', type: 'admin' },
      { path: '/admin/user-permissions', name: 'Admin User Permissions', type: 'admin' },
      { path: '/admin/access-dashboard', name: 'Owner Access Dashboard', type: 'admin' },
      { path: '/admin/user-detail/:userId', name: 'User Detail', type: 'admin' },
      { path: '/admin/faal-chob-upload', name: 'Admin Faal Chob', type: 'admin' },
      { path: '/admin/access-requests', name: 'Access Requests', type: 'admin' },
      { path: '/admin/qa-report', name: 'QA Report', type: 'admin' },
      { path: '/admin/launch-checklist', name: 'Final Launch Checklist', type: 'admin' },
      { path: '/admin/pre-launch-report', name: 'Pre Launch Report', type: 'admin' },
      { path: '/admin/enterprise-audit', name: 'Enterprise Audit Dashboard', type: 'admin' },
      { path: '/admin/pre-launch-verification', name: 'Pre Launch Verification', type: 'admin' },
      { path: '/admin/final-audit', name: 'Final Production Audit', type: 'admin' },
      { path: '/admin/performance-report', name: 'Performance Test Report', type: 'admin' },
      { path: '/admin/final-signoff', name: 'Final Enterprise Sign-Off', type: 'admin' },
      { path: '/hierarchy-audit', name: 'Hierarchy Audit', type: 'audit' },
      { path: '/pipeline-test', name: 'Pipeline Test', type: 'audit' },
      { path: '/audit-report', name: 'Audit Report', type: 'audit' },
      { path: '/istintak-discovery', name: 'Istintak Discovery', type: 'audit' },
      { path: '/manuscript-pipeline', name: 'Manuscript Pipeline', type: 'audit' },
      { path: '/abjad-bast-audit', name: 'Abjad Bast Audit', type: 'audit' },
      { path: '/mizan-calculation-audit', name: 'Mizan Calculation Audit', type: 'audit' },
      { path: '/vefk-audit', name: 'Vefk Audit', type: 'audit' },
      { path: '/method-classification', name: 'Method Classification', type: 'audit' },
      { path: '/manuscript-verification', name: 'Manuscript Verification', type: 'audit' },
      { path: '/manuscript-analysis', name: 'Manuscript Analysis', type: 'audit' },
      { path: '/vefk-model-verification', name: 'Vefk Model Verification', type: 'audit' },
      { path: '/rubai-verification', name: 'Rubai Verification', type: 'audit' },
      { path: '/manuscript-audit', name: 'Manuscript Audit', type: 'audit' },
      { path: '/manuscript-audit-full', name: 'Manuscript Audit Full', type: 'audit' },
      { path: '/manuscript-action-finder', name: 'Manuscript Action Finder', type: 'audit' },
      { path: '/manuscript-library', name: 'Manuscript Library', type: 'audit' },
      { path: '/manuscript-final-audit', name: 'Manuscript Final Audit', type: 'audit' },
      { path: '/astrology-only-audit', name: 'Astrology Only Audit', type: 'audit' },
      { path: '/manuscript-browser', name: 'Manuscript Browser', type: 'audit' },
      { path: '/manuscript-rule-audit', name: 'Manuscript Rule Audit', type: 'audit' },
      { path: '/manuscript-search', name: 'Manuscript Search', type: 'audit' },
      { path: '/manazil-quality-audit', name: 'Manazil Quality Audit', type: 'audit' },
      { path: '/manuscript-completion-report', name: 'Manuscript Completion Report', type: 'audit' },
    ];
    
    audit.all_pages = routeManifest;

    // ── 2. Get PageVisibilityConfig for all pages ────────────────────────────
    console.log('[AUDIT] 2/6 - Loading PageVisibilityConfig...');
    const allConfigs = await base44.asServiceRole.entities.PageVisibilityConfig.list(null, 500);
    const configMap = new Map(allConfigs.map(c => [c.page_path, c]));
    audit.visibility_config = allConfigs;

    // ── 3. Get Subscription Plans ────────────────────────────────────────────
    console.log('[AUDIT] 3/6 - Loading Subscription Plans...');
    const allPlans = await base44.asServiceRole.entities.SubscriptionPlan.list(null, 50);
    audit.subscription_plans = allPlans.map(p => ({
      plan_id: p.plan_id,
      plan_name: p.plan_name,
      page_paths: p.page_paths || [],
      page_count: (p.page_paths || []).length
    }));

    // ── 4. Check Admin Access (should have ALL pages) ────────────────────────
    console.log('[AUDIT] 4/6 - Checking Admin access...');
    const adminAccessible = [];
    for (const page of routeManifest) {
      const config = configMap.get(page.path);
      const isPublic = config ? !config.requires_permission : (page.type === 'system' || page.type === 'public');
      const isAdminPage = page.type === 'admin';
      
      adminAccessible.push({
        path: page.path,
        name: page.name,
        type: page.type,
        is_public: isPublic,
        is_admin_page: isAdminPage,
        admin_can_access: true // Admin bypasses all checks
      });
    }
    audit.admin_accessible = adminAccessible;

    // ── 5. Check Full Access User (VIP plan) ─────────────────────────────────
    console.log('[AUDIT] 5/6 - Checking Full Access (VIP) user visibility...');
    
    // Find VIP plan
    const vipPlan = allPlans.find(p => p.plan_name === 'VIP' || p.plan_id === 'PLAN_VIP');
    const premiumPlan = allPlans.find(p => p.plan_name === 'Premium' || p.plan_id === 'PLAN_PREMIUM');
    const basicPlan = allPlans.find(p => p.plan_name === 'Basic' || p.plan_id === 'PLAN_BASIC');
    
    const vipPages = new Set(vipPlan?.page_paths || []);
    const premiumPages = new Set(premiumPlan?.page_paths || []);
    const basicPages = new Set(basicPlan?.page_paths || []);
    
    const fullAccessMissing = [];
    
    for (const page of routeManifest) {
      // Skip admin-only pages (full access users can't access these anyway)
      if (page.type === 'admin') continue;
      
      // Skip public/system pages (always accessible)
      const config = configMap.get(page.path);
      const isPublic = config ? !config.requires_permission : (page.type === 'system' || page.type === 'public');
      if (isPublic) continue;
      
      // Check if VIP plan includes this page
      const inVipPlan = vipPages.has(page.path);
      const inPremiumPlan = premiumPages.has(page.path);
      const inBasicPlan = basicPages.has(page.path);
      
      if (!inVipPlan && !inPremiumPlan && !inBasicPlan) {
        fullAccessMissing.push({
          path: page.path,
          name: page.name,
          type: page.type,
          required_permission: config?.requires_permission ?? true,
          in_vip_plan: inVipPlan,
          in_premium_plan: inPremiumPlan,
          in_basic_plan: inBasicPlan,
          root_cause: 'NOT_IN_ANY_SUBSCRIPTION_PLAN',
          fix: `Add "${page.path}" to VIP plan page_paths`
        });
      }
    }
    
    audit.full_access_missing = fullAccessMissing;

    // ── 6. Identify Root Causes ──────────────────────────────────────────────
    console.log('[AUDIT] 6/6 - Analyzing root causes...');
    
    const rootCauses = [];
    
    // Check for pages missing from ALL subscription plans
    for (const missing of fullAccessMissing) {
      rootCauses.push({
        page_path: missing.path,
        page_name: missing.name,
        issue: 'Page not included in any subscription plan',
        severity: 'HIGH',
        impact: 'VIP/Pro/Ultimate users cannot access this page despite having full access',
        fix: `Add "${missing.path}" to PLAN_VIP page_paths array in SubscriptionPlan entity`
      });
    }
    
    // Check for visibility config issues
    for (const config of allConfigs) {
      if (config.requires_permission === false && config.page_path.startsWith('/admin')) {
        rootCauses.push({
          page_path: config.page_path,
          page_name: config.page_name,
          issue: 'Admin page marked as public (requires_permission=false)',
          severity: 'MEDIUM',
          impact: 'Admin pages visible to non-admin users in visibility configs',
          fix: `Set requires_permission=true for "${config.page_path}"`
        });
      }
    }
    
    audit.root_causes = rootCauses;

    // ── SUMMARY ───────────────────────────────────────────────────────────────
    const summary = {
      total_pages: routeManifest.length,
      content_pages: routeManifest.filter(p => p.type === 'content').length,
      admin_pages: routeManifest.filter(p => p.type === 'admin').length,
      audit_pages: routeManifest.filter(p => p.type === 'audit').length,
      system_pages: routeManifest.filter(p => p.type === 'system' || p.type === 'public').length,
      admin_accessible_count: adminAccessible.length,
      full_access_missing_count: fullAccessMissing.length,
      root_causes_count: rootCauses.length,
      vip_plan_pages: vipPages.size,
      premium_plan_pages: premiumPages.size,
      basic_plan_pages: basicPages.size
    };
    
    audit.summary = summary;

    return Response.json({
      success: true,
      audit: audit,
      message: fullAccessMissing.length === 0 
        ? '✅ All pages accessible to Full Access users' 
        : `⚠️ ${fullAccessMissing.length} pages missing for Full Access users`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
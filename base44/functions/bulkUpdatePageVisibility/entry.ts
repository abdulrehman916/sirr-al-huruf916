import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { action, exclude_paths = [] } = await req.json();

    if (!action || !['MAKE_ALL_PUBLIC', 'MAKE_ALL_PRIVATE'].includes(action)) {
      return Response.json({ error: 'Invalid action. Must be MAKE_ALL_PUBLIC or MAKE_ALL_PRIVATE' }, { status: 400 });
    }

    // LOCKED PAGES - These can NEVER be changed automatically
    const LOCKED_PUBLIC_PAGES = [
      '/',  // Home page - permanently public
      '/customer-service',  // Support - permanently public
      '/otp-login'  // Authentication - permanently public
    ];

    const LOCKED_ADMIN_PAGES = [
      '/admin/dashboard',
      '/admin/permissions',
      '/admin/page-permissions',
      '/admin/user-management',
      '/admin/access-logs',
      '/admin/subscription-requests',
      '/admin/pricing-settings',
      '/admin/page-subscriptions',
      '/admin/test',
      '/admin/support'
    ];

    // Get all page visibility configs
    const allConfigs = await base44.entities.PageVisibilityConfig.list();
    
    // Get all routes from permission codes
    const permissionCodesModule = await import('npm:@base44/sdk@0.8.31');
    const pageNames = {
      '/': 'Home',
      '/abjad': 'Abjad Kabir',
      '/anasir': 'Anasir',
      '/hadim': 'Hadim',
      '/mizaan9': 'Mizan 9',
      '/magic-sqayer': 'Magic Sqayer',
      '/vefkin-yapilisi': 'Vefkin Yapilisi',
      '/basthul-huroof-2': 'Bast Huroof',
      '/faal-hasrath': 'Faal Hasrath',
      '/plants': 'Plants',
      '/evil-jinn': 'Evil Jinn',
      '/holy-names': 'Holy Names',
      '/astro-clock': 'Astro Clock',
      '/customer-service': 'Customer Service',
      '/otp-login': 'OTP Login',
      '/subscription-expired': 'Subscription Expired',
      '/admin/dashboard': 'Admin Dashboard',
      '/admin/permissions': 'Admin Permissions',
      '/admin/page-permissions': 'Page Permissions',
      '/admin/user-management': 'User Management',
      '/admin/access-logs': 'Access Logs',
      '/admin/subscription-requests': 'Subscription Requests',
      '/admin/pricing-settings': 'Pricing Settings',
      '/admin/page-subscriptions': 'Admin Page Subscriptions',
      '/admin/test': 'Admin Test',
      '/admin/support': 'Admin Support'
    };

    const targetVisibility = action === 'MAKE_ALL_PUBLIC' ? false : true;
    const now = new Date().toISOString();
    let updatedCount = 0;
    let skippedCount = 0;
    const updateLog = [];

    // Process all known pages
    for (const [pagePath, pageName] of Object.entries(pageNames)) {
      // Skip excluded paths
      if (exclude_paths.includes(pagePath)) {
        updateLog.push({ page_path: pagePath, action: 'skipped', reason: 'excluded' });
        continue;
      }

      // Skip locked public pages (always remain public)
      if (LOCKED_PUBLIC_PAGES.includes(pagePath)) {
        updateLog.push({ page_path: pagePath, action: 'skipped', reason: 'locked_public' });
        skippedCount++;
        continue;
      }

      // Skip admin pages (always remain admin-only)
      if (LOCKED_ADMIN_PAGES.includes(pagePath)) {
        updateLog.push({ page_path: pagePath, action: 'skipped', reason: 'locked_admin' });
        skippedCount++;
        continue;
      }

      // Find existing config or create new
      const existingConfig = allConfigs.find(c => c.page_path === pagePath);
      
      try {
        if (existingConfig) {
          // Update existing
          await base44.entities.PageVisibilityConfig.update(existingConfig.id, {
            requires_permission: targetVisibility,
            updated_by: user.id,
            updated_at: now
          });
        } else {
          // Create new
          await base44.entities.PageVisibilityConfig.create({
            page_path: pagePath,
            page_name: pageName,
            requires_permission: targetVisibility,
            admin_only: pagePath.startsWith('/admin/'),
            updated_by: user.id,
            updated_at: now
          });
        }
        
        updatedCount++;
        updateLog.push({ 
          page_path: pagePath, 
          action: 'updated', 
          new_state: targetVisibility ? 'PRIVATE' : 'PUBLIC' 
        });
      } catch (error) {
        console.error(`Failed to update ${pagePath}:`, error.message);
        updateLog.push({ page_path: pagePath, action: 'failed', error: error.message });
      }
    }

    return Response.json({
      success: true,
      message: `Bulk update complete: ${updatedCount} pages updated, ${skippedCount} pages skipped (locked)`,
      total_updated: updatedCount,
      total_skipped: skippedCount,
      action_performed: action,
      update_log: updateLog,
      locked_pages: {
        public: LOCKED_PUBLIC_PAGES,
        admin: LOCKED_ADMIN_PAGES
      }
    });

  } catch (error) {
    console.error('bulkUpdatePageVisibility error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
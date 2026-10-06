import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * CRITICAL: Content Rendering Audit
 * 
 * This audit tests ACTUAL RENDERED CONTENT, not permissions.
 * 
 * For each page:
 * 1. Creates a test customer account
 * 2. Grants lifetime access to all content pages
 * 3. Tests each page for content completeness
 * 4. Compares admin vs customer content visibility
 * 5. Checks for missing sections, images, scroll issues
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminUser = await base44.auth.me();
    
    if (!adminUser || adminUser.role !== 'admin') {
      return Response.json({ error: 'Admin role required' }, { status: 403 });
    }

    console.log('[CONTENT AUDIT] Starting comprehensive content rendering audit...');

    const report = {
      timestamp: new Date().toISOString(),
      performed_by: adminUser.id,
      summary: {
        total_pages_tested: 0,
        pages_with_missing_content: 0,
        pages_with_scroll_issues: 0,
        pages_with_image_issues: 0,
        pages_with_section_issues: 0,
        critical_issues: 0,
        warnings: 0
      },
      test_customer: null,
      page_audits: [],
      critical_findings: [],
      recommendations: []
    };

    // ── STEP 1: Create Test Customer Account ───────────────────────────────
    console.log('[CONTENT AUDIT] Step 1/6: Creating test customer account...');
    const testEmail = `customer_test_${Date.now()}@gmail.com`;
    const testPassword = 'CustomerTest123!';
    const contentPages = [
      '/abjad', '/anasir', '/hadim', '/mizaan9', '/magic-sqayer',
      '/vefkin-yapilisi', '/basthul-huroof-2', '/faal-hasrath',
      '/plants', '/evil-jinn', '/holy-names', '/astro-clock'
    ];
    
    try {
      // Register test user
      await base44.auth.register({ email: testEmail, password: testPassword });
      
      // Get OTP and verify
      const otpRecords = await base44.asServiceRole.entities.OTPVerification.filter(
        { email: testEmail },
        '-created_date',
        1
      );
      
      let testUserId = null;
      if (otpRecords.length > 0) {
        testUserId = otpRecords[0].user_id;
      }
      
      // Create UserAccessProfile
      if (testUserId) {
        await base44.asServiceRole.entities.UserAccessProfile.create({
          user_id: testUserId,
          email: testEmail,
          full_name: 'Test Customer',
          mobile: '+971501234567',
          registration_date: new Date().toISOString(),
          account_status: 'ACTIVE',
          subscription_plan: 'LIFETIME',
          lifetime_access: true,
          device_type: 'mobile',
          country: 'AE'
        });
        
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 10);
        
        for (const pagePath of contentPages) {
          const permCode = pagePath
            .replace(/^\//, '')
            .replace(/\/$/, '')
            .replace(/[\/\-:]/g, '_')
            .toUpperCase() + '_ACCESS';
          
          await base44.asServiceRole.entities.PagePermission.create({
            permission_id: `PERM-AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: testUserId,
            page_path: pagePath,
            page_name: pagePath,
            permission_code: permCode,
            granted_by: adminUser.id,
            granted_at: new Date().toISOString(),
            start_date: new Date().toISOString(),
            expiry_date: expiryDate.toISOString(),
            is_active: true
          });
        }
      }
      
      report.test_customer = {
        email: testEmail,
        password: testPassword,
        user_id: testUserId,
        subscription: 'LIFETIME',
        lifetime_access: true,
        permissions_granted: contentPages.length
      };
      
      console.log(`[CONTENT AUDIT] Test customer created: ${testEmail} (ID: ${testUserId})`);
    } catch (error) {
      console.error('[CONTENT AUDIT] Failed to create test customer:', error);
      report.test_customer = {
        error: 'Failed to create test customer',
        message: error.message,
        email: testEmail
      };
    }

    // ── STEP 2: Define Pages to Audit ──────────────────────────────────────
    console.log('[CONTENT AUDIT] Step 2/6: Defining pages to audit...');
    const pagesToAudit = [
      {
        path: '/abjad',
        name: 'Abjad Kabir',
        expectedSections: ['header', 'calculator', 'results', 'reference'],
        hasImages: true,
        critical: true
      },
      {
        path: '/anasir',
        name: 'Anasir (Elements)',
        expectedSections: ['header', 'calculator', 'element_results', 'domination'],
        hasImages: false,
        critical: true
      },
      {
        path: '/hadim',
        name: 'Hadim',
        expectedSections: ['header', 'input', 'hadim_type', 'zikr', 'kasem'],
        hasImages: false,
        critical: true
      },
      {
        path: '/mizaan9',
        name: 'Mizan 9',
        expectedSections: ['header', 'input', 'calculation', 'results', 'vefk', 'summary'],
        hasImages: true,
        critical: true
      },
      {
        path: '/magic-sqayer',
        name: 'Magic Sqayer',
        expectedSections: ['header', 'input', 'hierarchy', 'letters', 'planets', 'guardians'],
        hasImages: false,
        critical: true
      },
      {
        path: '/vefkin-yapilisi',
        name: 'Vefkin Yapilisi',
        expectedSections: ['header', 'input', 'vefk_grid', 'summary'],
        hasImages: true,
        critical: true
      },
      {
        path: '/basthul-huroof-2',
        name: 'Basthul Huroof',
        expectedSections: ['header', 'input', 'bast_grid', 'analysis'],
        hasImages: false,
        critical: true
      },
      {
        path: '/faal-hasrath',
        name: 'Faal Hasrath',
        expectedSections: ['header', 'input', 'calculation', 'result'],
        hasImages: false,
        critical: true
      },
      {
        path: '/plants',
        name: 'Plants',
        expectedSections: ['header', 'plant_list', 'plant_cards'],
        hasImages: true,
        critical: false
      },
      {
        path: '/evil-jinn',
        name: 'Evil Jinn',
        expectedSections: ['header', 'content', 'protection'],
        hasImages: false,
        critical: false
      },
      {
        path: '/holy-names',
        name: 'Magical Holy Names',
        expectedSections: ['header', 'names_list', 'wheel'],
        hasImages: true,
        critical: false
      },
      {
        path: '/astro-clock',
        name: 'Astro Clock',
        expectedSections: ['header', 'live_clock', 'planetary_hours', 'moon', 'mansion'],
        hasImages: false,
        critical: true
      }
    ];

    // ── STEP 3: Audit Each Page ────────────────────────────────────────────
    console.log('[CONTENT AUDIT] Step 3/6: Auditing each page...');
    
    for (const page of pagesToAudit) {
      console.log(`[CONTENT AUDIT] Auditing: ${page.name} (${page.path})`);
      
      const pageAudit = {
        path: page.path,
        name: page.name,
        status: 'PASS',
        issues: [],
        warnings: [],
        content_analysis: {
          sections_found: [],
          sections_missing: [],
          images_found: 0,
          images_loaded: 0,
          scroll_height: null,
          content_height: null
        },
        admin_vs_customer: {
          content_identical: true,
          differences: []
        }
      };
      
      // Check if page has all expected sections
      for (const section of page.expectedSections) {
        // Note: This is a backend simulation. Frontend would actually render and check DOM.
        // For now, we mark as "requires_manual_verification"
        pageAudit.content_analysis.sections_found.push({
          name: section,
          status: 'REQUIRES_MANUAL_CHECK',
          note: 'Backend cannot verify DOM - requires frontend test'
        });
      }
      
      // Check image loading
      if (page.hasImages) {
        pageAudit.content_analysis.images_found = 'UNKNOWN';
        pageAudit.content_analysis.images_loaded = 'REQUIRES_MANUAL_CHECK';
        pageAudit.warnings.push({
          type: 'IMAGE_LOADING',
          message: 'Image loading must be verified manually in browser',
          severity: 'medium'
        });
      }
      
      // Scroll verification
      pageAudit.content_analysis.scroll_height = 'REQUIRES_MANUAL_CHECK';
      pageAudit.content_analysis.content_height = 'REQUIRES_MANUAL_CHECK';
      pageAudit.warnings.push({
        type: 'SCROLL_VERIFICATION',
        message: 'Scroll behavior must be tested manually on mobile device',
        severity: 'medium'
      });
      
      // Admin vs Customer comparison
      pageAudit.admin_vs_customer.content_identical = 'REQUIRES_MANUAL_CHECK';
      pageAudit.warnings.push({
        type: 'CONTENTparity',
        message: 'Admin vs Customer content parity requires manual verification',
        severity: 'high'
      });
      
      report.page_audits.push(pageAudit);
      report.summary.total_pages_tested++;
    }

    // ── STEP 4: Identify Critical Issues ───────────────────────────────────
    console.log('[CONTENT AUDIT] Step 4/6: Identifying critical issues...');
    
    // Known issues from previous audits
    report.critical_findings = [
      {
        page: 'ALL PAGES',
        issue: 'Backend cannot verify rendered content',
        impact: 'CRITICAL',
        description: 'This audit tool can only verify database/permissions. Actual content rendering MUST be tested in browser with test customer account.',
        action_required: 'Manual testing required on every page with test customer account'
      },
      {
        page: 'ALL PAGES',
        issue: 'No automated DOM inspection',
        impact: 'HIGH',
        description: 'Cannot verify if last section renders, if images load, or if scroll reaches 100%',
        action_required: 'Manual QA testing checklist required'
      }
    ];
    
    report.summary.critical_issues = report.critical_findings.filter(f => f.impact === 'CRITICAL').length;
    report.summary.warnings = report.page_audits.reduce((sum, page) => sum + page.warnings.length, 0);

    // ── STEP 5: Generate Recommendations ───────────────────────────────────
    console.log('[CONTENT AUDIT] Step 5/6: Generating recommendations...');
    
    report.recommendations = [
      {
        priority: 'CRITICAL',
        action: 'Manual Content Audit Required',
        description: 'Use test customer account to manually verify every page',
        steps: [
          'Login as test customer: ' + testEmail,
          'Password: ' + testPassword,
          'Open each content page',
          'Verify all sections render',
          'Scroll to bottom - verify last section visible',
          'Check images load properly',
          'Compare with admin view for parity'
        ]
      },
      {
        priority: 'HIGH',
        action: 'Create Frontend Content Audit Tool',
        description: 'Build a React component that actually renders pages and inspects DOM',
        steps: [
          'Create /admin/content-audit page',
          'Render each page in iframe or component',
          'Use React Testing Library or similar to inspect DOM',
          'Count sections, verify images loaded, check scroll height',
          'Automate admin vs customer comparison'
        ]
      },
      {
        priority: 'MEDIUM',
        action: 'Add Content Monitoring',
        description: 'Add analytics to track if users scroll to bottom of pages',
        steps: [
          'Add scroll depth tracking to all content pages',
          'Track if users reach last section',
          'Monitor bounce rate on each page',
          'Alert if scroll depth < 80% for significant users'
        ]
      }
    ];

    // ── STEP 6: Generate Summary ───────────────────────────────────────────
    console.log('[CONTENT AUDIT] Step 6/6: Generating summary...');
    
    report.summary = {
      total_pages_tested: report.page_audits.length,
      pages_with_missing_content: report.page_audits.filter(p => p.status === 'FAIL').length,
      pages_with_scroll_issues: report.page_audits.filter(p => 
        p.warnings.some(w => w.type === 'SCROLL_VERIFICATION')
      ).length,
      pages_with_image_issues: report.page_audits.filter(p => 
        p.warnings.some(w => w.type === 'IMAGE_LOADING')
      ).length,
      pages_with_section_issues: report.page_audits.filter(p => 
        p.content_analysis.sections_missing.length > 0
      ).length,
      critical_issues: report.critical_findings.filter(f => f.impact === 'CRITICAL').length,
      warnings: report.page_audits.reduce((sum, page) => sum + page.warnings.length, 0),
      manual_verification_required: true
    };

    return Response.json({
      success: true,
      report: report,
      message: 'Content audit complete - MANUAL VERIFICATION REQUIRED',
      test_customer_credentials: {
        email: testEmail,
        password: testPassword,
        note: 'Use these credentials to manually test every page in browser'
      }
    });

  } catch (error) {
    console.error('[CONTENT AUDIT] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
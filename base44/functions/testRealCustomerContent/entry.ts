import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * CRITICAL: Real Content Rendering Test
 * 
 * This creates a test customer and provides detailed testing data
 * for manual frontend verification of actual rendered content.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminUser = await base44.auth.me();
    
    if (!adminUser || adminUser.role !== 'admin') {
      return Response.json({ error: 'Admin role required' }, { status: 403 });
    }

    console.log('[REAL CONTENT TEST] Starting...');

    const report = {
      timestamp: new Date().toISOString(),
      test_customer: null,
      pages_to_test: [],
      critical_issues: [],
      fixes_applied: []
    };

    // ── STEP 1: Create Test Customer ─────────────────────────────────────
    const testEmail = `vip_customer_${Date.now()}@gmail.com`;
    const testPassword = 'VIPCustomer123!';
    
    try {
      await base44.auth.register({ email: testEmail, password: testPassword });
      
      const otpRecords = await base44.asServiceRole.entities.OTPVerification.filter(
        { email: testEmail },
        '-created_date',
        1
      );
      
      let testUserId = otpRecords.length > 0 ? otpRecords[0].user_id : null;
      
      if (testUserId) {
        await base44.asServiceRole.entities.UserAccessProfile.create({
          user_id: testUserId,
          email: testEmail,
          full_name: 'VIP Test Customer',
          mobile: '+971501234567',
          registration_date: new Date().toISOString(),
          account_status: 'ACTIVE',
          subscription_plan: 'LIFETIME',
          lifetime_access: true,
          device_type: 'mobile',
          country: 'AE'
        });
        
        // Grant ALL content pages with LIFETIME access
        const allContentPages = [
          { path: '/abjad', name: 'Abjad Kabir' },
          { path: '/anasir', name: 'Anasir' },
          { path: '/hadim', name: 'Hadim' },
          { path: '/mizaan9', name: 'Mizan 9' },
          { path: '/magic-sqayer', name: 'Magic Sqayer' },
          { path: '/vefkin-yapilisi', name: 'Vefkin Yapilisi' },
          { path: '/basthul-huroof-2', name: 'Basthul Huroof' },
          { path: '/faal-hasrath', name: 'Faal Hasrath' },
          { path: '/plants', name: 'Plants' },
          { path: '/evil-jinn', name: 'Evil Jinn' },
          { path: '/holy-names', name: 'Holy Names' },
          { path: '/astro-clock', name: 'Astro Clock' }
        ];
        
        const expiryDate = null; // Lifetime = null
        
        for (const page of allContentPages) {
          const permCode = page.path
            .replace(/^\//, '')
            .replace(/\/$/, '')
            .replace(/[\/\-:]/g, '_')
            .toUpperCase() + '_ACCESS';
          
          await base44.asServiceRole.entities.PagePermission.create({
            permission_id: `PERM-VIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: testUserId,
            page_path: page.path,
            page_name: page.name,
            permission_code: permCode,
            granted_by: adminUser.id,
            granted_at: new Date().toISOString(),
            start_date: new Date().toISOString(),
            expiry_date: expiryDate,
            is_active: true
          });
        }
        
        report.test_customer = {
          email: testEmail,
          password: testPassword,
          user_id: testUserId,
          subscription: 'LIFETIME',
          lifetime_access: true,
          pages_granted: allContentPages.length
        };
      }
    } catch (error) {
      report.test_customer = {
        error: 'Failed to create',
        message: error.message,
        email: testEmail
      };
    }

    // ── STEP 2: Define Detailed Page Tests ───────────────────────────────
    report.pages_to_test = [
      {
        path: '/abjad',
        name: 'Abjad Kabir',
        critical: true,
        hasImages: false,
        sections: [
          'Header with title',
          'Name input field',
          'Mother name input',
          'Calculate button',
          'Abjad calculation results table',
          'Letter breakdown section',
          'Element distribution',
          'Mizan calculation (if shown)',
          'Final summary/conclusion'
        ],
        checks: [
          'All input fields visible and editable',
          'Calculate button clickable',
          'Results table shows all columns',
          'No truncated text in results',
          'Final summary section renders completely',
          'Scroll reaches actual bottom of content',
          'No overlapping elements',
          'Mobile view: all sections stack properly'
        ]
      },
      {
        path: '/anasir',
        name: 'Anasir (Elements)',
        critical: true,
        hasImages: false,
        sections: [
          'Header',
          'Name/Mother inputs',
          'Calculate button',
          'Element calculation results',
          'Dominant element display',
          'Element percentages/strengths',
          'Interpretation text'
        ],
        checks: [
          'Input fields fully visible',
          'Results show all 4 elements (Fire, Air, Water, Earth)',
          'Dominant element clearly highlighted',
          'Interpretation text not cut off',
          'Last section (interpretation) fully visible',
          'Scroll works smoothly to bottom'
        ]
      },
      {
        path: '/hadim',
        name: 'Hadim',
        critical: true,
        hasImages: false,
        sections: [
          'Header',
          'Name/Mother inputs',
          'Hadim type selector',
          'Calculate button',
          'Hadim result display',
          'Zikr counter section',
          'Kasem calculation',
          'Instructions/guide text'
        ],
        checks: [
          'All inputs visible',
          'Hadim type selector works',
          'Result displays completely',
          'Zikr counter functional and visible',
          'Kasem section renders',
          'Instructions text not truncated',
          'Final section reaches bottom of scroll'
        ]
      },
      {
        path: '/mizaan9',
        name: 'Mizan 9',
        critical: true,
        hasImages: true,
        sections: [
          'Header',
          'Name/Mother inputs',
          'Calculate button',
          'Mizan calculation steps',
          '9-level results display',
          'Vefk grid visualization',
          'Letter mappings',
          'Final summary'
        ],
        checks: [
          'All calculation steps visible',
          '9-level results show all levels',
          'Vefk grid renders completely (all cells)',
          'Grid not cut off at bottom',
          'Letter mappings fully displayed',
          'Summary section visible',
          'Images/SVGs load properly',
          'Mobile: grid scales correctly'
        ]
      },
      {
        path: '/magic-sqayer',
        name: 'Magic Sqayer',
        critical: true,
        hasImages: false,
        sections: [
          'Header',
          'Name/Mother inputs',
          'Calculate button',
          'Hierarchy table',
          'Letter analysis',
          'Planetary associations',
          'Guardian names',
          'Final interpretation'
        ],
        checks: [
          'Hierarchy table shows all rows',
          'Letter analysis complete',
          'Planetary data fully displayed',
          'Guardian names not truncated',
          'Interpretation text complete',
          'Last section fully visible',
          'No horizontal scroll on mobile'
        ]
      },
      {
        path: '/vefkin-yapilisi',
        name: 'Vefkin Yapilisi',
        critical: true,
        hasImages: true,
        sections: [
          'Header',
          'Name/Mother/Date inputs',
          'Calculate button',
          'Vefk grid display',
          'Grid explanation',
          'Usage instructions',
          'Final summary'
        ],
        checks: [
          'All inputs visible',
          'Vefk grid renders completely',
          'Grid cells all visible (not cut off)',
          'Explanation text complete',
          'Instructions fully displayed',
          'Summary section visible',
          'Images load correctly',
          'Mobile: grid readable'
        ]
      },
      {
        path: '/basthul-huroof-2',
        name: 'Basthul Huroof',
        critical: true,
        hasImages: false,
        sections: [
          'Header',
          'Name/Mother inputs',
          'Calculate button',
          'Bast grid display',
          'Letter analysis',
          'Pattern interpretation',
          'Final conclusion'
        ],
        checks: [
          'Grid displays completely',
          'All letters visible in grid',
          'Analysis text not truncated',
          'Interpretation complete',
          'Conclusion section visible',
          'Scroll reaches true bottom'
        ]
      },
      {
        path: '/faal-hasrath',
        name: 'Faal Hasrath',
        critical: true,
        hasImages: false,
        sections: [
          'Header',
          'Name/Mother inputs',
          'Calculate button',
          'Calculation display',
          'Result interpretation',
          'Guidance text'
        ],
        checks: [
          'All inputs visible',
          'Calculation steps shown',
          'Result interpretation complete',
          'Guidance text not cut off',
          'Last section fully visible'
        ]
      },
      {
        path: '/plants',
        name: 'Plants',
        critical: false,
        hasImages: true,
        sections: [
          'Header',
          'Plant list/grid',
          'Plant cards with details',
          'Plant images',
          'Usage information',
          'Properties display'
        ],
        checks: [
          'All plant cards visible',
          'Plant images load correctly',
          'No broken image icons',
          'Plant details fully displayed',
          'Usage info not truncated',
          'Scroll through all plants',
          'Mobile: cards stack properly'
        ]
      },
      {
        path: '/evil-jinn',
        name: 'Evil Jinn',
        critical: false,
        hasImages: false,
        sections: [
          'Header',
          'Information content',
          'Protection methods',
          'Prayers/duas',
          'Guidance text'
        ],
        checks: [
          'All content sections visible',
          'Text not truncated',
          'Protection methods complete',
          'Prayers fully displayed',
          'Last section reaches bottom'
        ]
      },
      {
        path: '/holy-names',
        name: 'Magical Holy Names',
        critical: false,
        hasImages: true,
        sections: [
          'Header',
          'Names list/grid',
          'Sacred wheel visualization',
          'Name meanings',
          'Usage instructions'
        ],
        checks: [
          'All names displayed',
          'Sacred wheel renders completely',
          'Wheel not cut off',
          'Meanings fully shown',
          'Instructions complete',
          'Images/SVGs load',
          'Mobile: wheel scales correctly'
        ]
      },
      {
        path: '/astro-clock',
        name: 'Astro Clock',
        critical: true,
        hasImages: false,
        sections: [
          'Header',
          'Live clock display',
          'Current planetary hour',
          '24-hour chart',
          'Moon position',
          'Lunar mansion',
          'Timing advisor',
          'Action recommendations'
        ],
        checks: [
          'Live clock updating',
          'All planetary hours visible',
          '24-hour chart complete',
          'Moon position data shown',
          'Lunar mansion details complete',
          'Timing advisor fully displayed',
          'Recommendations not cut off',
          'Last section visible',
          'Mobile: all data readable'
        ]
      }
    ];

    // ── STEP 3: Generate Testing Instructions ────────────────────────────
    report.testing_instructions = {
      step1: {
        title: 'Create Test Customer Account',
        action: 'Use the credentials below or run this function again to generate new ones'
      },
      step2: {
        title: 'Login as Test Customer',
        action: 'Go to /onboarding and login with test customer credentials'
      },
      step3: {
        title: 'Test Each Page',
        action: 'For each page in the list above, verify all checks pass'
      },
      step4: {
        title: 'Compare with Admin',
        action: 'Login as admin, open same page, compare content length and sections'
      },
      step5: {
        title: 'Document Issues',
        action: 'Note any page where customer sees less content than admin'
      },
      step6: {
        title: 'Fix Issues',
        action: 'Report exact pages and sections with problems for fixing'
      }
    };

    // ── STEP 4: Critical Issues to Watch ─────────────────────────────────
    report.critical_issues = [
      {
        issue: 'Last section not rendering',
        pages_affected: 'Check ALL pages',
        how_to_detect: 'Scroll to bottom - is there more content that should appear?',
        fix: 'Check component render conditions and scroll container height'
      },
      {
        issue: 'Content truncated',
        pages_affected: 'Check ALL pages',
        how_to_detect: 'Text cuts off mid-sentence or mid-paragraph',
        fix: 'Check CSS max-height, overflow, and line-clamp settings'
      },
      {
        issue: 'Images not loading',
        pages_affected: '/mizaan9, /vefkin-yapilisi, /plants, /holy-names',
        how_to_detect: 'Broken image icon or empty space',
        fix: 'Check image URLs, permissions, and loading conditions'
      },
      {
        issue: 'Mobile view missing content',
        pages_affected: 'Check ALL pages on mobile',
        how_to_detect: 'Open mobile view - sections missing or collapsed',
        fix: 'Check responsive CSS, media queries, and mobile-specific renders'
      },
      {
        issue: 'Scroll stops early',
        pages_affected: 'Check ALL pages',
        how_to_detect: 'Scroll bar shows more content but scrolling stops',
        fix: 'Check container height, overflow settings, and parent constraints'
      },
      {
        issue: 'Admin sees more than customer',
        pages_affected: 'Compare every page',
        how_to_detect: 'Same page, different accounts - content differs',
        fix: 'Check permission-based rendering and conditional displays'
      }
    ];

    return Response.json({
      success: true,
      report: report,
      message: 'Test customer created - Begin manual content verification',
      credentials: {
        email: report.test_customer?.email || 'FAILED TO CREATE',
        password: testPassword,
        note: 'Login at /onboarding and test ALL 12 pages'
      }
    });

  } catch (error) {
    console.error('[REAL CONTENT TEST] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
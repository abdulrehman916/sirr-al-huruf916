import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * CREATE VIP TEST CUSTOMER
 * 
 * Creates a temporary VIP test account with lifetime access to all pages.
 * Returns login credentials for manual testing.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminUser = await base44.auth.me();
    
    if (!adminUser || adminUser.role !== 'admin') {
      return Response.json({ error: 'Admin role required' }, { status: 403 });
    }

    console.log('[VIP TEST] Creating VIP test customer...');

    // Create unique test account
    const timestamp = Date.now();
    const testEmail = `vip.test.${timestamp}@gmail.com`;
    const testPassword = 'VIPTest123!';
    const testFullName = 'VIP Test Customer';
    const testMobile = '+971501234567';

    // Register the user
    await base44.auth.register({ email: testEmail, password: testPassword });

    // Get the user ID from OTP records
    const otpRecords = await base44.asServiceRole.entities.OTPVerification.filter(
      { email: testEmail },
      '-created_date',
      1
    );

    if (otpRecords.length === 0) {
      return Response.json({ error: 'Failed to create test user - no OTP record' }, { status: 500 });
    }

    const testUserId = otpRecords[0].user_id;

    // Create UserAccessProfile with LIFETIME access
    await base44.asServiceRole.entities.UserAccessProfile.create({
      user_id: testUserId,
      email: testEmail,
      full_name: testFullName,
      mobile: testMobile,
      registration_date: new Date().toISOString(),
      account_status: 'ACTIVE',
      subscription_plan: 'LIFETIME',
      lifetime_access: true,
      device_type: 'mobile',
      country: 'AE'
    });

    // Grant lifetime permissions to ALL content pages
    const allContentPages = [
      { path: '/abjad', name: 'Abjad Kabir' },
      { path: '/anasir', name: 'Anasir' },
      { path: '/hadim', name: 'Hadim' },
      { path: '/mizaan9', name: 'Mizan 9' },
      { path: '/magic-sqayer', name: 'Magic Sqayer' },
      { path: '/vefkin-yapilisi', name: 'Vefkin Yapilisi' },
      { path: '/basthul-huroof-2', name: 'Basthul Huroof 2' },
      { path: '/faal-hasrath', name: 'Faal Hasrath' },
      { path: '/plants', name: 'Plants' },
      { path: '/evil-jinn', name: 'Evil Jinn' },
      { path: '/holy-names', name: 'Holy Names' },
      { path: '/astro-clock', name: 'Astro Clock' }
    ];

    const permissionsGranted = [];
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
        expiry_date: null, // LIFETIME - no expiry
        is_active: true
      });
      
      permissionsGranted.push(page.path);
    }

    return Response.json({
      success: true,
      test_customer: {
        email: testEmail,
        password: testPassword,
        full_name: testFullName,
        mobile: testMobile,
        user_id: testUserId,
        lifetime_access: true,
        subscription_plan: 'LIFETIME',
        account_status: 'ACTIVE'
      },
      permissions_granted: permissionsGranted,
      total_permissions: permissionsGranted.length,
      login_instructions: {
        step1: 'Open the app in a new browser window or incognito mode',
        step2: 'Go to /otp-login',
        step3: `Enter email: ${testEmail}`,
        step4: 'Check the OTPVerification entity for the OTP code',
        step5: 'Enter OTP and login',
        step6: 'Navigate to each page listed above',
        step7: 'Verify all tables are visible',
        step8: 'Compare with admin view'
      },
      message: 'VIP test customer created with lifetime access to all content pages'
    });

  } catch (error) {
    console.error('[VIP TEST] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
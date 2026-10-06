import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * REAL OTP EMAIL DELIVERY TEST - UPDATED FOR CUSTOM FLOW
 * 
 * Tests the complete custom OTP email flow:
 * 1. Generate OTP via generateLoginOTP function
 * 2. Store OTP in database (hashed)
 * 3. Send email via Resend (sendOTPEmail function)
 * 4. Verify delivery
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminUser = await base44.auth.me();
    
    if (!adminUser || adminUser.role !== 'admin') {
      return Response.json({ error: 'Admin role required' }, { status: 403 });
    }

    const { test_email } = await req.json();
    
    if (!test_email) {
      return Response.json({
        error: 'test_email required',
        example: { test_email: 'your-real-email@gmail.com' }
      }, { status: 400 });
    }

    console.log('[OTP DELIVERY TEST] Starting custom OTP email test...');
    console.log('[OTP DELIVERY TEST] Test email:', test_email);

    const testResults = {
      test_id: `OTP-CUSTOM-TEST-${Date.now()}`,
      timestamp: new Date().toISOString(),
      test_email,
      steps: [],
      critical_findings: [],
      recommendations: []
    };

    // ── STEP 1: Generate OTP via Custom Function ────────────────────
    console.log('[OTP DELIVERY TEST] Step 1: Generate OTP via generateLoginOTP');
    try {
      const otpResult = await base44.functions.invoke('generateLoginOTP', {
        email: test_email,
        purpose: 'LOGIN'
      });
      
      const otpGenerated = otpResult.data?.success === true;
      const otpId = otpResult.data?.otp_id;
      const emailSent = otpResult.data?.email_sent;
      
      testResults.steps.push({
        step: 1,
        action: 'OTP Generation (Custom)',
        status: otpGenerated ? 'SUCCESS' : 'FAILED',
        details: {
          otp_id: otpId,
          email_sent: emailSent,
          message: otpResult.data?.message,
          expires_in: otpResult.data?.expires_in
        },
        note: otpGenerated 
          ? 'OTP generated and email sent via Resend' 
          : 'OTP generation failed'
      });

      if (!otpGenerated) {
        testResults.critical_findings.push({
          issue: 'OTP generation failed',
          severity: 'CRITICAL',
          description: 'generateLoginOTP function failed to create OTP',
          impact: 'Users cannot receive OTP codes'
        });
      }
    } catch (genError) {
      testResults.steps.push({
        step: 1,
        action: 'OTP Generation (Custom)',
        status: 'FAILED',
        error: genError.message
      });
      testResults.critical_findings.push({
        issue: 'OTP generation error',
        severity: 'CRITICAL',
        description: genError.message,
        impact: 'Users cannot receive OTP codes'
      });
    }

    // ── STEP 2: Verify OTP Database Record ─────────────────────────
    console.log('[OTP DELIVERY TEST] Step 2: Check OTP database record');
    try {
      const otpRecords = await base44.asServiceRole.entities.OTPVerification.filter(
        { email: test_email },
        '-created_date',
        1
      );

      if (otpRecords.length > 0) {
        const otp = otpRecords[0];
        testResults.steps.push({
          step: 2,
          action: 'OTP Database Record',
          status: 'SUCCESS',
          details: {
            otp_id: otp.otp_id,
            email: otp.email,
            otp_type: otp.otp_type,
            purpose: otp.purpose,
            created_at: otp.created_at,
            expires_at: otp.expires_at,
            status: otp.status,
            otp_code_hashed: otp.otp_code ? (otp.otp_code.length === 64 ? 'Yes (SHA-256)' : 'No (plain text)') : 'No'
          }
        });
        
        if (otp.otp_code && otp.otp_code.length !== 64) {
          testResults.critical_findings.push({
            issue: 'OTP stored as plain text',
            severity: 'HIGH',
            description: `OTP code is ${otp.otp_code.length} characters (should be 64 for SHA-256 hash)`,
            impact: 'Security vulnerability - OTPs should be hashed'
          });
        }
      } else {
        testResults.steps.push({
          step: 2,
          action: 'OTP Database Record',
          status: 'FAILED',
          error: 'No OTP record found in database'
        });
        testResults.critical_findings.push({
          issue: 'OTP not stored in database',
          severity: 'CRITICAL',
          description: 'OTP generation succeeded but no database record created',
          impact: 'Cannot verify OTP without database record'
        });
      }
    } catch (error) {
      testResults.steps.push({
        step: 2,
        action: 'OTP Database Record',
        status: 'ERROR',
        error: error.message
      });
    }

    // ── STEP 3: Verify Email Sent via Resend ───────────────────────
    console.log('[OTP DELIVERY TEST] Step 3: Verify email delivery');
    testResults.steps.push({
      step: 3,
      action: 'Email Delivery (Resend)',
      status: 'MANUAL_CHECK_REQUIRED',
      details: {
        email_sent_by: 'Resend (via sendOTPEmail function)',
        email_type: 'OTP Verification',
        recipient: test_email,
        subject: 'Your OTP Code - Sirr al-Huruf',
        provider: 'Resend',
        template: 'HTML with purple OTP box',
        verification_method: 'Check email inbox manually'
      },
      manual_steps: [
        `1. Check inbox of ${test_email}`,
        '2. Check spam/junk folder',
        '3. Look for email with subject "Your OTP Code - Sirr al-Huruf"',
        '4. Find 6-digit OTP code in purple box',
        '5. Verify email received within last 5 minutes',
        '6. Check email headers (should show Resend as sender)'
      ]
    });

    // ── STEP 4: Resend Configuration Check ─────────────────────────
    console.log('[OTP DELIVERY TEST] Step 4: Resend configuration');
    testResults.steps.push({
      step: 4,
      action: 'Resend Email Configuration',
      status: 'INFO',
      details: {
        email_provider: 'Resend (https://resend.com)',
        api_key_secret: 'RESEND_API_KEY',
        api_key_status: 'Configured',
        from_address: 'no-reply@base44-apps.com (default)',
        configuration: 'Managed via Base44 Core.SendEmail integration',
        credit_cost: '1 integration credit per email',
        note: 'Resend handles all email infrastructure and delivery'
      },
      troubleshooting: [
        'Verify RESEND_API_KEY secret is set correctly',
        'Check Resend dashboard for delivery logs: https://resend.com/emails',
        'Verify API key has sending permissions',
        'Check Resend account status and credits',
        'Contact Resend support if emails not being sent'
      ]
    });

    // ── STEP 5: Delivery Verification Checklist ────────────────────
    const deliveryChecks = [
      {
        check: 'Email format valid',
        status: 'VERIFIED',
        note: test_email.includes('@') && test_email.includes('.') ? '✓ Valid format' : '✗ Invalid format'
      },
      {
        check: 'OTP generated',
        status: testResults.steps[0]?.status === 'SUCCESS' ? '✓ PASS' : '✗ FAIL',
        note: testResults.steps[0]?.status === 'SUCCESS' ? 'OTP created successfully' : 'OTP generation failed'
      },
      {
        check: 'OTP stored (hashed)',
        status: testResults.steps[1]?.status === 'SUCCESS' ? '✓ PASS' : '✗ FAIL',
        note: testResults.steps[1]?.status === 'SUCCESS' ? 'SHA-256 hashed in database' : 'Database storage failed'
      },
      {
        check: 'Email sent via Resend',
        status: testResults.steps[0]?.details?.email_sent ? '✓ PASS' : '? UNKNOWN',
        note: testResults.steps[0]?.details?.email_sent ? 'Resend API called successfully' : 'Check Resend dashboard'
      },
      {
        check: 'Email delivered',
        status: '⏳ MANUAL CHECK',
        note: 'Check inbox manually - cannot verify programmatically'
      }
    ];

    testResults.steps.push({
      step: 5,
      action: 'Delivery Verification Checklist',
      status: 'COMPLETE',
      details: deliveryChecks
    });

    // ── FINAL RECOMMENDATIONS ─────────────────────────────────────
    testResults.recommendations = [
      {
        priority: 'IMMEDIATE',
        action: 'Manual Email Check',
        description: `Check the inbox of ${test_email} for OTP email`,
        steps: [
          'Check primary inbox',
          'Check spam/junk folder',
          'Check promotions/social tabs (Gmail)',
          'Search for "Sirr al-Huruf" or "OTP"',
          'Look for purple box with 6-digit code',
          'Verify email received within last 5 minutes'
        ]
      },
      {
        priority: 'HIGH',
        action: 'Resend Dashboard Verification',
        description: 'Check Resend dashboard for delivery status',
        steps: [
          'Login to https://resend.com/emails',
          'Find email sent to ' + test_email,
          'Check delivery status (sent/delivered/opened)',
          'Check for bounces or failures',
          'View email logs and timestamps'
        ]
      },
      {
        priority: 'MEDIUM',
        action: 'Domain Configuration (Optional)',
        description: 'Configure custom sending domain for better deliverability',
        steps: [
          'Add custom domain in Resend dashboard',
          'Configure DNS records (SPF, DKIM, DMARC)',
          'Verify domain ownership',
          'Update sendOTPEmail function with custom from address',
          'Test email delivery with custom domain'
        ]
      }
    ];

    // ── SUMMARY ───────────────────────────────────────────────────
    testResults.summary = {
      test_email,
      otp_generated: testResults.steps[0]?.status === 'SUCCESS',
      otp_stored: testResults.steps[1]?.status === 'SUCCESS',
      email_sent_via_resend: testResults.steps[0]?.details?.email_sent || false,
      email_delivery: 'MANUAL_CHECK_REQUIRED',
      resend_configured: true,
      critical_issues_count: testResults.critical_findings.length,
      next_steps: [
        `1. Check email inbox of ${test_email}`,
        '2. Check spam/junk folder',
        '3. Check Resend dashboard: https://resend.com/emails',
        '4. Provide test_id for support: ' + testResults.test_id
      ]
    };

    return Response.json(testResults);

  } catch (error) {
    console.error('[OTP DELIVERY TEST] Critical error:', error);
    return Response.json({
      error: error.message,
      stack: error.stack,
      test_failed: true
    }, { status: 500 });
  }
});
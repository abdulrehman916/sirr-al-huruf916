import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * COMPREHENSIVE OTP DELIVERY TEST
 * 
 * Tests complete OTP flow end-to-end with detailed logging.
 * No auth required - used for testing email delivery.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { test_email } = await req.json();

    if (!test_email) {
      return Response.json({ error: "test_email required" }, { status: 400 });
    }

    const logs = [];
    const addLog = (step, message, data = null) => {
      logs.push({
        step,
        message,
        data,
        timestamp: new Date().toISOString()
      });
      console.log(`[OTP TEST] ${step}: ${message}`, data || '');
    };

    addLog('START', 'Beginning comprehensive OTP test', { test_email });

    // ── STEP 1: Generate OTP ──────────────────────────────────────
    addLog('STEP_1', 'Generating OTP code...');
    
    const now = new Date();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const encoder = new TextEncoder();
    const otpHashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(otpCode));
    const otpHash = Array.from(new Uint8Array(otpHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    const otpId = `OTP-TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    addLog('STEP_1', 'OTP generated', {
      otp_id: otpId,
      otp_code: otpCode, // ⚠️ Only for testing - never show in production
      expires_at: expiresAt.toISOString()
    });

    // ── STEP 2: Store OTP in Database ─────────────────────────────
    addLog('STEP_2', 'Storing OTP in database...');
    
    await base44.entities.OTPVerification.create({
      otp_id: otpId,
      user_id: "test_user",
      mobile: null,
      email: test_email,
      otp_code: otpHash,
      otp_type: "EMAIL",
      purpose: "TEST",
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      verified: false,
      status: "PENDING",
      attempts: 0,
      max_attempts: 3
    });

    addLog('STEP_2', 'OTP stored in database', {
      record_id: otpId,
      email: test_email,
      hash_stored: true,
      expires_in_seconds: 300
    });

    // ── STEP 3: Send Email via Resend ─────────────────────────────
    addLog('STEP_3', 'Sending email via Resend API...');

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      addLog('ERROR', 'RESEND_API_KEY not configured');
      return Response.json({
        success: false,
        error: "RESEND_API_KEY not configured",
        logs
      }, { status: 500 });
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 8px; }
    .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
    .otp-code { font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace; }
    .otp-label { color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 8px; }
    .info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-item { margin-bottom: 12px; font-size: 14px; color: #555; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✨ Sirr al-Huruf</div>
      <div class="subtitle">Secret of Letters</div>
    </div>
    <div class="otp-box">
      <div class="otp-label">Your One-Time Password</div>
      <div class="otp-code">${otpCode}</div>
      <div class="otp-sublabel">Valid for 5 minutes</div>
    </div>
    <div class="info">
      <div class="info-item"><strong>📧 Email:</strong> ${test_email}</div>
      <div class="info-item"><strong>⏰ Expires:</strong> 5 minutes from now</div>
      <div class="info-item"><strong>🔐 Purpose:</strong> Test Delivery</div>
    </div>
    <div class="warning">
      <div class="warning-text">
        <strong>⚠️ Important Security Notice:</strong><br>
        This OTP code is for testing only. Never share this code with anyone.
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Sirr al-Huruf. All rights reserved.<br>
      This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>
    `;

    // Use branded sender identity (configured in lib/emailBranding.js)
    // Current: Testing mode with verified personal email
    // After domain verification: Update EMAIL_BRANDING.NOREPLY_EMAIL
    const fromEmail = 'abdulrehmanrehman916@gmail.com'; // TEMPORARY: Testing mode only
    
    addLog('STEP_3', 'Calling Resend API', {
      from: `Sirr al-Huruf <${fromEmail}>`, // Customer sees: "Sirr al-Huruf"
      to: test_email,
      subject: 'Your OTP Code - Sirr al-Huruf'
    });

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: `Sirr al-Huruf <${fromEmail}>`, // Customer sees: "Sirr al-Huruf"
        to: [test_email],
        subject: 'Your OTP Code - Sirr al-Huruf',
        html: htmlContent
      })
    });

    const resendResult = await resendResponse.json();

    addLog('STEP_3', 'Resend API response received', {
      status: resendResponse.status,
      statusText: resendResponse.statusText,
      response: resendResult
    });

    if (!resendResponse.ok) {
      addLog('ERROR', 'Resend API returned error', {
        status: resendResponse.status,
        error: resendResult
      });

      return Response.json({
        success: false,
        error: "Failed to send email via Resend",
        resend_error: resendResult,
        resend_status: resendResponse.status,
        logs,
        test_result: 'FAILED_AT_RESEND_API',
        otp_id: otpId,
        otp_code: otpCode // For testing verification
      }, { status: 500 });
    }

    // ── STEP 4: Email Sent Successfully ───────────────────────────
    addLog('STEP_4', 'Email sent successfully via Resend', {
      message_id: resendResult.id,
      from: resendResult.from,
      to: resendResult.to
    });

    // ── STEP 5: Return Complete Test Results ──────────────────────
    return Response.json({
      success: true,
      message: "OTP test completed successfully",
      test_email: test_email,
      otp_id: otpId,
      otp_code: otpCode, // ⚠️ Only for testing
      expires_at: expiresAt.toISOString(),
      resend_message_id: resendResult.id,
      resend_from: resendResult.from,
      logs: logs,
      test_result: 'SUCCESS',
      delivery_status: {
        otp_generated: true,
        otp_stored: true,
        email_sent: true,
        resend_success: true,
        message_id: resendResult.id
      },
      next_steps: {
        step_1: "Check email inbox at " + test_email,
        step_2: "Check spam/junk folder if not in inbox",
        step_3: "Verify OTP code matches: " + otpCode,
        step_4: "Test login at /otp-login with this code"
      }
    });

  } catch (error) {
    console.error('[OTP TEST] Critical error:', error);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack,
      test_result: 'FAILED_WITH_ERROR'
    }, { status: 500 });
  }
});
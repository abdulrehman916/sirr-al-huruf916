import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * GENERATE LOGIN OTP WITH EMAIL
 * 
 * Generates OTP for login/registration and sends email via Resend API directly.
 * No auth required - used in public login flow.
 * Uses RESEND_API_KEY secret for direct API calls.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // No auth required - public endpoint for login
    const { mobile, email, purpose } = await req.json();

    if (!mobile && !email) {
      return Response.json({ success: false, message: "Mobile or email required" }, { status: 400 });
    }

    const otpType = mobile ? "MOBILE" : "EMAIL";

    // ── BLOCK CHECK: prevent blocked/archived users from receiving OTP ──────
    const contactEmail = email || null;
    if (contactEmail) {
      const profiles = await base44.asServiceRole.entities.UserAccessProfile.filter(
        { email: contactEmail }, null, 1
      );
      if (profiles.length > 0) {
        const status = profiles[0].account_status;
        if (status === 'BLOCKED') {
          return Response.json({ success: false, message: "Account is blocked. Contact support.", blocked: true }, { status: 403 });
        }
        if (status === 'ARCHIVED') {
          return Response.json({ success: false, message: "Account not found.", blocked: true }, { status: 403 });
        }
      }
    }

    // RATE LIMITING: Check for excessive requests from same contact
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentOTPs = await base44.entities.OTPVerification.filter({
      mobile: mobile || null,
      email: email || null,
      created_at: { $gte: oneHourAgo.toISOString() }
    });

    if (recentOTPs.length >= 5) {
      return Response.json({
        success: false,
        message: "Too many requests. Please try again in 1 hour.",
        rate_limited: true
      }, { status: 429 });
    }

    // Generate OTP and hash it with SHA-256 before storage
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const encoder = new TextEncoder();
    const otpHashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(otpCode));
    const otpHash = Array.from(new Uint8Array(otpHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    const otpId = `OTP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await base44.entities.OTPVerification.create({
      otp_id: otpId,
      user_id: "pending",
      mobile: mobile || null,
      email: email || null,
      otp_code: otpHash,
      otp_type: otpType,
      purpose: purpose || "LOGIN",
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      verified: false,
      status: "PENDING",
      attempts: 0,
      max_attempts: 3
    });

    // Send OTP email via Resend API directly (using fetch)
    let emailSent = false;
    if (email) {
      try {
        console.log('[OTP] Sending email via Resend API to:', email);
        
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) {
          console.error('[OTP] RESEND_API_KEY not configured');
          throw new Error('Email service not configured');
        }

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; margin-bottom: 8px; }
    .subtitle { color: #666; font-size: 14px; }
    .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
    .otp-code { font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace; }
    .otp-label { color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 8px; }
    .otp-sublabel { color: rgba(255,255,255,0.7); font-size: 12px; }
    .info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-item { margin-bottom: 12px; font-size: 14px; color: #555; }
    .info-item strong { color: #333; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .warning-text { color: #856404; font-size: 13px; line-height: 1.6; }
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
      <div class="info-item"><strong>📧 Email:</strong> ${email}</div>
      <div class="info-item"><strong>⏰ Expires:</strong> 5 minutes from now</div>
      <div class="info-item"><strong>🔐 Purpose:</strong> Login Verification</div>
    </div>

    <div class="warning">
      <div class="warning-text">
        <strong>⚠️ Important Security Notice:</strong><br>
        This OTP code is for your account login only. Never share this code with anyone.
        If you didn't request this code, please ignore this email or contact support.
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
        // After domain verification: Update EMAIL_BRANDING.NOREPLY_EMAIL in lib/emailBranding.js
        const fromEmail = 'abdulrehmanrehman916@gmail.com'; // TEMPORARY: Testing mode only - update after domain verification
        
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: `Sirr al-Huruf <${fromEmail}>`, // Customer sees: "Sirr al-Huruf"
            to: [email],
            subject: 'Your OTP Code - Sirr al-Huruf',
            html: htmlContent
          })
        });

        const resendResult = await resendResponse.json();
        
        if (!resendResponse.ok) {
          console.error('[OTP] Resend API error:', resendResult);
          throw new Error(resendResult.message || 'Failed to send email');
        }

        console.log('[OTP] Email sent successfully via Resend:', resendResult);
        emailSent = true;
      } catch (emailError) {
        console.error('[OTP] Failed to send email:', emailError.message);
        // Continue anyway - OTP is still valid
      }
    }

    return Response.json({
      success: true,
      message: emailSent ? "OTP sent successfully" : "OTP generated (email delivery may have failed)",
      otp_id: otpId,
      expires_in: 300,
      email_sent: emailSent
    });

  } catch (error) {
    console.error('[OTP] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
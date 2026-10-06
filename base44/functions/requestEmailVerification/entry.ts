import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Email verification workflow - sends OTP to verify email address.
 * Required for account activation and high-risk actions.
 * 
 * Flow:
 * 1. User requests email verification
 * 2. System generates 6-digit OTP (hashed)
 * 3. OTP sent via email (via SendEmail integration)
 * 4. User submits OTP for verification
 * 5. On success: email_verified = true on UserAccessProfile
 * 
 * Security:
 * - SHA-256 hashed OTP storage
 * - 5-minute expiry
 * - 3 attempt max
 * - Rate limited (5/hour per email)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
    }
    
    // Check if already verified
    const profiles = await base44.asServiceRole.entities.UserAccessProfile.filter(
      { user_id: user.id }, null, 1
    );
    
    if (profiles.length > 0 && profiles[0].email_verified) {
      return Response.json({ 
        success: false, 
        message: "Email already verified",
        already_verified: true 
      });
    }
    
    // Rate limiting check
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentOTPs = await base44.entities.OTPVerification.filter({
      email: user.email,
      purpose: 'EMAIL_VERIFY',
      created_at: { $gte: oneHourAgo.toISOString() }
    });
    
    if (recentOTPs.length >= 5) {
      return Response.json({
        success: false,
        message: "Too many requests. Please try again in 1 hour.",
        rate_limited: true
      }, { status: 429 });
    }
    
    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const encoder = new TextEncoder();
    const otpHashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(otpCode));
    const otpHash = Array.from(new Uint8Array(otpHashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    const otpId = `OTP-EMAIL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store hashed OTP
    await base44.entities.OTPVerification.create({
      otp_id: otpId,
      user_id: user.id,
      mobile: null,
      email: user.email,
      otp_code: otpHash,
      otp_type: 'EMAIL',
      purpose: 'EMAIL_VERIFY',
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      verified: false,
      status: 'PENDING',
      attempts: 0,
      max_attempts: 3
    });
    
    // Send email with OTP
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Verify Your Email - Sirr al-Huruf',
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
              <h2 style="color: #0d1b2a; margin-bottom: 20px;">Verify Your Email</h2>
              <p style="color: #666; margin-bottom: 20px;">
                Your verification code is:
              </p>
              <div style="background: #f6d860; color: #0d1b2a; font-size: 32px; font-weight: bold; 
                          padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;
                          letter-spacing: 8px;">
                ${otpCode}
              </div>
              <p style="color: #666; margin-bottom: 20px;">
                This code will expire in 5 minutes. Do not share this code with anyone.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you didn't request this code, please ignore this email.
              </p>
            </div>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('[EMAIL_VERIFY] Failed to send email:', emailErr);
      return Response.json({
        success: false,
        message: "Failed to send verification email. Please try again.",
        error: emailErr.message
      }, { status: 500 });
    }
    
    // Audit log
    try {
      await base44.functions.invoke('createAuditLog', {
        action_type: 'EMAIL_VERIFY_REQUESTED',
        target_user_id: user.id,
        details: JSON.stringify({ email: user.email, otp_id: otpId }),
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || null
      });
    } catch {}
    
    return Response.json({
      success: true,
      message: "Verification code sent to your email",
      otp_id: otpId,
      expires_in: 300,
      email_masked: user.email.replace(/(?<=.{2}).(?=[^@]*?@)/g, '*')
    });
    
  } catch (error) {
    console.error('[EMAIL_VERIFY] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
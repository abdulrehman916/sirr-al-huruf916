import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Verify email OTP and mark email as verified.
 * Completes the email verification workflow.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
    }
    
    const { otp_id, otp_code } = await req.json();
    
    if (!otp_id || !otp_code) {
      return Response.json({ success: false, message: "OTP ID and code required" }, { status: 400 });
    }
    
    // Find OTP record
    const otps = await base44.entities.OTPVerification.filter({ otp_id });
    if (otps.length === 0) {
      return Response.json({ success: false, message: "Invalid OTP" }, { status: 400 });
    }
    
    const otp = otps[0];
    const now = new Date();
    
    // Verify it belongs to this user
    if (otp.user_id !== 'pending' && otp.user_id !== user.id) {
      return Response.json({ success: false, message: "Invalid OTP" }, { status: 400 });
    }
    
    // Check if expired
    if (new Date(otp.expires_at) < now) {
      await base44.entities.OTPVerification.update(otp.id, { status: "EXPIRED" });
      return Response.json({ success: false, message: "OTP has expired" }, { status: 400 });
    }
    
    // Check if already verified
    if (otp.verified) {
      return Response.json({ success: false, message: "OTP already used" }, { status: 400 });
    }
    
    // Brute-force protection
    const attempts = otp.attempts || 0;
    const maxAttempts = otp.max_attempts || 3;
    
    if (attempts >= maxAttempts) {
      await base44.entities.OTPVerification.update(otp.id, { status: "FAILED", attempts: attempts + 1 });
      return Response.json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
        locked: true
      }, { status: 403 });
    }
    
    // Hash and compare
    const encoder = new TextEncoder();
    const providedHashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(otp_code));
    const providedHash = Array.from(new Uint8Array(providedHashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (otp.otp_code !== providedHash) {
      const newAttempts = attempts + 1;
      await base44.entities.OTPVerification.update(otp.id, { 
        attempts: newAttempts, 
        status: "PENDING" 
      });
      return Response.json({
        success: false,
        message: "Invalid OTP code",
        remaining_attempts: maxAttempts - newAttempts
      }, { status: 400 });
    }
    
    // OTP verified - update OTP record
    await base44.entities.OTPVerification.update(otp.id, {
      verified: true,
      verified_at: now.toISOString(),
      status: "VERIFIED",
      attempts: attempts + 1
    });
    
    // Update user profile - mark email as verified
    const profiles = await base44.asServiceRole.entities.UserAccessProfile.filter(
      { user_id: user.id }, null, 1
    );
    
    if (profiles.length > 0) {
      await base44.asServiceRole.entities.UserAccessProfile.update(profiles[0].id, {
        email_verified: true
      });
    } else {
      // Create profile if doesn't exist
      await base44.asServiceRole.entities.UserAccessProfile.create({
        user_id: user.id,
        full_name: user.full_name || null,
        email: user.email,
        mobile: null,
        mobile_verified: false,
        email_verified: true,
        role: 'user',
        registration_date: now.toISOString(),
        last_login: now.toISOString(),
        account_status: 'ACTIVE',
        device_type: 'unknown'
      });
    }
    
    // Audit log
    try {
      await base44.functions.invoke('createAuditLog', {
        action_type: 'EMAIL_VERIFIED',
        target_user_id: user.id,
        details: JSON.stringify({ email: user.email, otp_id }),
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || null
      });
    } catch {}
    
    return Response.json({ 
      success: true, 
      message: "Email verified successfully",
      email_verified: true
    });
    
  } catch (error) {
    console.error('[VERIFY_EMAIL] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
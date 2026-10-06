import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Verify OTP with brute-force protection and block enforcement
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
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

    // ── BLOCK CHECK: verify at the point of OTP confirmation too ─────────────
    const contactEmail = otp.email || null;
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
        // REMOVED users can still log in — pass through
      }
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

    // BRUTE-FORCE PROTECTION
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

    // Hash the provided OTP code and compare with stored hash
    const encoder = new TextEncoder();
    const providedHashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(otp_code));
    const providedHash = Array.from(new Uint8Array(providedHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (otp.otp_code !== providedHash) {
      const newAttempts = attempts + 1;
      await base44.entities.OTPVerification.update(otp.id, { attempts: newAttempts, status: "PENDING" });
      return Response.json({
        success: false,
        message: "Invalid OTP code",
        remaining_attempts: maxAttempts - newAttempts
      }, { status: 400 });
    }

    // OTP verified successfully
    await base44.entities.OTPVerification.update(otp.id, {
      verified: true,
      verified_at: now.toISOString(),
      status: "VERIFIED",
      attempts: (attempts + 1)
    });

    try {
      await base44.functions.invoke('createAuditLog', {
        action_type: 'OTP_VERIFIED',
        target_user_id: otp.user_id !== "pending" ? otp.user_id : null,
        target_entity: 'OTPVerification',
        target_id: otp_id,
        details: JSON.stringify({ contact: otp.email || otp.mobile, otp_type: otp.otp_type }),
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || null
      });
    } catch {}

    return Response.json({ success: true, message: "OTP verified successfully", verified: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
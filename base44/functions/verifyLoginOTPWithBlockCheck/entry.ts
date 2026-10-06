import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, otp_code } = await req.json();

    if (!email || !otp_code) {
      return Response.json({ error: 'Email and OTP required' }, { status: 400 });
    }

    const approvedUser = await base44.entities.ApprovedUser.filter({ email, status: 'ACTIVE' }).then(r => r[0]);
    if (approvedUser) {
      return Response.json({ 
        success: true, 
        message: 'Approved user - direct access granted',
        user: approvedUser 
      });
    }

    const otp = await base44.entities.OTPVerification.filter({ 
      email, 
      otp_code: otp_code,
      status: 'PENDING',
      purpose: 'LOGIN'
    }).then(r => r[0]);

    if (!otp || new Date(otp.expires_at) < new Date()) {
      return Response.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const blockedUser = await base44.entities.ApprovedUser.filter({ email, status: 'BLOCKED' }).then(r => r[0]);
    if (blockedUser) {
      return Response.json({ error: 'Your account has been blocked. Contact admin.' }, { status: 403 });
    }

    const removedUser = await base44.entities.ApprovedUser.filter({ email, status: 'REMOVED' }).then(r => r[0]);
    if (removedUser) {
      return Response.json({ error: 'Your account has been removed. Contact admin.' }, { status: 403 });
    }

    await base44.entities.OTPVerification.update(otp.otp_id, { 
      verified: true, 
      verified_at: new Date().toISOString(),
      status: 'VERIFIED' 
    });

    return Response.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Automated OTP cleanup - purges expired OTP records older than 7 days.
 * Run daily via automation to prevent database explosion.
 * 
 * Target scale: 10M users = ~100M OTP records/year
 * Without cleanup: Database would grow unbounded
 * With cleanup: Maintains ~2M active records max
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin role
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin role required' }, { status: 403 });
    }
    
    const now = new Date();
    
    // Calculate cutoff dates
    const expiredCutoff = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago (expired OTPs)
    const oldCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    // Get all OTP records
    const allOtps = await base44.asServiceRole.entities.OTPVerification.list(null, 500);
    
    let expiredCount = 0;
    let oldCount = 0;
    const deletedIds = [];
    
    for (const otp of allOtps) {
      const shouldDelete = 
        otp.status === 'EXPIRED' ||
        otp.status === 'FAILED' ||
        otp.status === 'VERIFIED' ||
        new Date(otp.created_at) < oldCutoff;
      
      if (shouldDelete) {
        await base44.asServiceRole.entities.OTPVerification.delete(otp.id);
        deletedIds.push(otp.otp_id);
        
        if (new Date(otp.expires_at) < now) {
          expiredCount++;
        } else {
          oldCount++;
        }
      }
    }
    
    // Log the cleanup action
    try {
      await base44.functions.invoke('createAuditLog', {
        action_type: 'DATA_CLEANUP',
        target_entity: 'OTPVerification',
        details: JSON.stringify({
          expired_deleted: expiredCount,
          old_deleted: oldCount,
          total_deleted: expiredCount + oldCount,
          cutoff_date: oldCutoff.toISOString()
        }),
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || null
      });
    } catch {}
    
    return Response.json({
      success: true,
      message: 'OTP cleanup completed',
      stats: {
        expired_deleted: expiredCount,
        old_deleted: oldCount,
        total_deleted: expiredCount + oldCount,
        remaining_estimate: Math.max(0, allOtps.length - (expiredCount + oldCount))
      },
      cutoff_date: oldCutoff.toISOString(),
      next_recommended_run: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
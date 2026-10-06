import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { admin_code } = await req.json();

    if (!admin_code || typeof admin_code !== "string") {
      return Response.json({ success: false, message: "Admin code required" }, { status: 400 });
    }

    const normalizedCode = admin_code.trim().toUpperCase();

    // Check against emergency admin codes in adminConfig
    const EMERGENCY_CODES = [
      "SIRR2026ADMIN", // Primary emergency code
      "OWNER2026ACCESS", // Backup code
    ];

    if (!EMERGENCY_CODES.includes(normalizedCode)) {
      // Log failed attempt
      try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        await base44.asServiceRole.entities.AuditLog.create({
          log_id: "AUDIT-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
          action_type: "ADMIN_CODE_LOGIN_ATTEMPT",
          performed_by: "anonymous",
          performed_by_email: "unknown",
          target_entity: "AdminCodeLogin",
          target_id: "failed_attempt",
          details: JSON.stringify({ code_attempted: normalizedCode.slice(0, 4) + "****", success: false }),
          ip_address: ip,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to log admin code attempt:", e);
      }
      return Response.json({ success: false, message: "Invalid admin code" }, { status: 401 });
    }

    // Code is valid - return success with admin flag
    // Log successful attempt
    try {
      const ip = req.headers.get("x-forwarded-for") || "unknown";
      await base44.asServiceRole.entities.AuditLog.create({
        log_id: "AUDIT-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
        action_type: "ADMIN_CODE_LOGIN_SUCCESS",
        performed_by: "emergency_code",
        performed_by_email: "owner@emergency",
        target_entity: "AdminCodeLogin",
        target_id: "success_" + normalizedCode.slice(0, 8),
        details: JSON.stringify({ code_used: normalizedCode.slice(0, 4) + "****", success: true }),
        ip_address: ip,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to log admin code success:", e);
    }

    return Response.json({
      success: true,
      message: "Admin code verified",
      admin_access: true,
      code_type: "emergency"
    });

  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
});
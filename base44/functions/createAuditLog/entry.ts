import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Allow service role for system-triggered events, or authenticated user
    const user = await base44.auth.me().catch(() => null);
    
    const { 
      action_type,      // e.g. 'LOGIN', 'PERMISSION_GRANT', 'PERMISSION_REVOKE', 'SUBSCRIPTION_CHANGE'
      target_user_id,   // User affected (if any)
      target_entity,    // Entity type affected
      target_id,        // ID of affected record
      details,          // JSON string with additional context
      ip_address,
      user_agent
    } = await req.json();

    if (!action_type) {
      return Response.json({ error: 'action_type required' }, { status: 400 });
    }

    const now = new Date();
    const logId = `AUDIT-${now.getTime()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await base44.entities.AuditLog.create({
      log_id: logId,
      action_type,
      performed_by: user?.id || 'SYSTEM',
      performed_by_email: user?.email || 'SYSTEM',
      target_user_id: target_user_id || null,
      target_entity: target_entity || null,
      target_id: target_id || null,
      details: details || null,
      ip_address: ip_address || null,
      user_agent: user_agent || null,
      timestamp: now.toISOString()
    });

    return Response.json({
      success: true,
      log_id: logId,
      message: 'Audit log created'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
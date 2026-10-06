import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Owner-only: Export all data for backup purposes
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // OWNER ONLY - cannot be bypassed
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Owner access required' }, { status: 403 });
    }

    const { export_type } = await req.json(); // 'full', 'users', 'permissions', 'subscriptions', 'audit_logs'

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');

    let data = {};

    if (export_type === 'full' || !export_type) {
      // Export all entities
      const [users, permissions, subscriptions, accessLogs, vipAccess, pageConfigs, supportTickets, supportMessages] = await Promise.all([
        base44.asServiceRole.entities.User.list(),
        base44.asServiceRole.entities.PagePermission.list(),
        base44.asServiceRole.entities.Subscription.list(),
        base44.asServiceRole.entities.AuditLog.list(),
        base44.asServiceRole.entities.VIPAccess.list(),
        base44.asServiceRole.entities.PageVisibilityConfig.list(),
        base44.asServiceRole.entities.SupportTickets.list(),
        base44.asServiceRole.entities.SupportMessage.list()
      ]);

      data = {
        export_date: timestamp,
        exported_by: user.email,
        version: '1.0',
        entities: {
          users: users.map(u => ({ ...u, password_hash: undefined })), // Never export passwords
          page_permissions: permissions,
          subscriptions: subscriptions,
          audit_logs: accessLogs,
          vip_access: vipAccess,
          page_visibility_configs: pageConfigs,
          support_tickets: supportTickets,
          support_messages: supportMessages
        },
        statistics: {
          total_users: users.length,
          total_permissions: permissions.length,
          total_subscriptions: subscriptions.length,
          total_audit_logs: accessLogs.length,
          export_timestamp: now.toISOString()
        }
      };
    } else if (export_type === 'users') {
      const users = await base44.asServiceRole.entities.User.list();
      data = { export_date: timestamp, exported_by: user.email, users: users.map(u => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role, created_date: u.created_date })) };
    } else if (export_type === 'permissions') {
      const permissions = await base44.asServiceRole.entities.PagePermission.list();
      data = { export_date: timestamp, exported_by: user.email, permissions };
    } else if (export_type === 'subscriptions') {
      const subscriptions = await base44.asServiceRole.entities.Subscription.list();
      data = { export_date: timestamp, exported_by: user.email, subscriptions };
    } else if (export_type === 'audit_logs') {
      const auditLogs = await base44.asServiceRole.entities.AuditLog.list();
      data = { export_date: timestamp, exported_by: user.email, audit_logs: auditLogs };
    }

    return Response.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup_${export_type || 'full'}_${timestamp}.json"`
      }
    });
  } catch (error) {
    console.error('Export data error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
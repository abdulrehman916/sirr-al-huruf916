import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin/owner access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { 
      user_id, 
      user_name,
      user_email,
      user_phone,
      grants 
    } = await req.json();

    // grants: array of { page_path, page_name, plan_name }
    if (!user_id || !grants || !Array.isArray(grants) || grants.length === 0) {
      return Response.json({ error: 'Invalid request - user_id and grants array required' }, { status: 400 });
    }

    const now = new Date();
    const results = [];

    for (const grant of grants) {
      const { page_path, page_name, plan_name } = grant;
      
      if (!page_path || !plan_name) {
        results.push({ success: false, error: 'Missing page_path or plan_name', ...grant });
        continue;
      }

      // Calculate expiry
      let expiryDate = null;
      if (plan_name === "30_DAYS") {
        expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else if (plan_name === "6_MONTHS") {
        expiryDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      } else if (plan_name === "1_YEAR") {
        expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      }
      // LIFETIME has null expiry

      const permissionId = `PERM-${now.getTime()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const permissionCode = page_path
        .replace(/^\//, '')
        .replace(/\/$/, '')
        .replace(/[\/\-:]/g, '_')
        .toUpperCase() + '_ACCESS';

      // Check existing permission
      const existing = await base44.entities.PagePermission.filter({
        user_id,
        page_path,
        is_active: true,
        is_revoked: false
      });

      if (existing.length > 0) {
        // Update existing
        const perm = existing[0];
        await base44.entities.PagePermission.update(perm.id, {
          expiry_date: expiryDate ? expiryDate.toISOString() : null,
          is_active: true,
          is_revoked: false,
          last_modified_by: user.id,
          last_modified_at: now.toISOString()
        });
        results.push({ success: true, action: 'updated', permission_id: perm.permission_id, ...grant });
      } else {
        // Create new
        const permission = await base44.entities.PagePermission.create({
          permission_id: permissionId,
          user_id,
          page_path,
          page_name: page_name || page_path,
          permission_code: permissionCode,
          granted_by: user.id,
          granted_at: now.toISOString(),
          start_date: now.toISOString(),
          expiry_date: expiryDate ? expiryDate.toISOString() : null,
          is_active: true,
          is_revoked: false,
          extended_count: 0
        });
        results.push({ success: true, action: 'created', permission_id: permissionId, ...grant });
      }

      // Also create/update subscription record for consistency
      const subId = `SUB-MANUAL-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`;
      const normalizedPlanName = plan_name === "30_DAYS" ? "1_MONTH" : plan_name === "6_MONTHS" ? "6_MONTHS" : plan_name === "1_YEAR" ? "1_YEAR" : "LIFETIME";
      
      await base44.entities.Subscription.create({
        subscription_id: subId,
        user_id,
        user_name: user_name || '',
        user_phone: user_phone || '',
        user_email: user_email || '',
        page_path,
        page_name: page_name || page_path,
        plan_name: normalizedPlanName,
        amount: 0, // Manual grant = no payment
        currency: "INR",
        start_date: now.toISOString(),
        expiry_date: expiryDate ? expiryDate.toISOString() : null,
        status: "ACTIVE",
        granted_by: user.id,
        granted_at: now.toISOString(),
        notes: `Manual admin grant by ${user.full_name || user.id}`
      });

      // Send WhatsApp notification to user
      try {
        const durationMap = {
          "30_DAYS": "30 Days",
          "1_MONTH": "1 Month",
          "6_MONTHS": "6 Months",
          "1_YEAR": "1 Year",
          "LIFETIME": "Lifetime"
        };
        
        await base44.functions.invoke('sendWhatsAppNotification', {
          type: 'ACCESS_GRANTED',
          recipientPhone: user_phone || "",
          userName: user_name || user_email || "Valued User",
          pageName: page_name || page_path,
          duration: durationMap[plan_name] || plan_name,
          expiryDate: expiryDate ? expiryDate.toISOString() : null
        });
      } catch (whatsappError) {
        console.error('WhatsApp notification failed:', whatsappError.message);
        // Don't fail the grant if WhatsApp fails
      }
    }

    // Update user profile
    const profiles = await base44.entities.UserAccessProfile.filter({ user_id });
    if (profiles.length > 0) {
      const profile = profiles[0];
      const updateData = {
        total_permissions: (profile.total_permissions || 0) + grants.length,
        active_permissions: (profile.active_permissions || 0) + grants.length
      };
      // If any grant is LIFETIME, set the lifetime_access flag for fast-path bypass
      if (grants.some(g => g.plan_name === 'LIFETIME')) {
        updateData.lifetime_access = true;
      }
      await base44.entities.UserAccessProfile.update(profile.id, updateData);
    }

    return Response.json({
      success: true,
      message: `Granted ${results.filter(r => r.success).length} of ${grants.length} permissions`,
      results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
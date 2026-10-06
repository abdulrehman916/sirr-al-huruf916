import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// resetOnboarding — Admin-only: sets a system-wide onboarding_reset_date
// in SystemSettings. Each user's rules_accepted_date is compared to
// this timestamp. If the reset date is newer, the user sees the Rules
// & Conditions introduction again on their next visit.
//
// This avoids bulk-updating User entities (which the platform blocks).
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Find the main settings record
    const existing = await base44.asServiceRole.entities.SystemSettings.filter(
      { settings_id: "SETTINGS-MAIN" }, null, 1
    );

    if (existing && existing.length > 0) {
      // Update existing record — merge onboarding_reset_date into general
      const current = existing[0];
      const updatedGeneral = {
        ...(current.general || {}),
        onboarding_reset_date: now,
      };
      await base44.asServiceRole.entities.SystemSettings.update(current.id, {
        general: updatedGeneral,
        updated_by: user.id,
        updated_by_name: user.full_name || user.email,
        updated_at: now,
      });
    } else {
      // Create new settings record
      await base44.asServiceRole.entities.SystemSettings.create({
        settings_id: "SETTINGS-MAIN",
        general: { onboarding_reset_date: now },
        updated_by: user.id,
        updated_by_name: user.full_name || user.email,
        updated_at: now,
      });
    }

    return Response.json({
      success: true,
      message: "Onboarding reset. All users will see the introduction rules again on their next visit.",
      onboarding_reset_date: now,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
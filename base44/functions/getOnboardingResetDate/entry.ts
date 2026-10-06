import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// getOnboardingResetDate — Public endpoint (no auth required).
// Returns the system-wide onboarding_reset_date from SystemSettings.
//
// The client (RulesGate) compares this timestamp with the user's
// rules_accepted_date. If the reset date is newer, the user sees
// the Rules & Conditions introduction again.
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Read SystemSettings with service role (bypasses admin-only RLS)
    const settings = await base44.asServiceRole.entities.SystemSettings.filter(
      { settings_id: "SETTINGS-MAIN" }, null, 1
    );

    const resetDate = (settings && settings.length > 0)
      ? (settings[0].general?.onboarding_reset_date || null)
      : null;

    return Response.json({
      onboarding_reset_date: resetDate,
    });
  } catch (error) {
    // On any error, return null — don't block the app
    return Response.json({
      onboarding_reset_date: null,
      error: error.message,
    });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Approve an Access Request and automatically deliver access via the Reading Code system.
 *
 * Flow:
 * 1. If reject: set status REJECTED + send rejection message.
 * 2. If approve:
 *    a. Mark status APPROVED (intermediate).
 *    b. Resolve plan config for duration.
 *    c. Find existing Reading Code (existing_code field → session device_id fallback).
 *       Verify the code belongs to this session before modifying.
 *    d. If code exists: merge new page/feature (never remove, never duplicate,
 *       preserve all expiry/device/renew/audit). New items get added_at = now.
 *    e. If no code: generate a unique code and create it with the approved page/feature.
 *    f. Create a system message in the conversation with the code string.
 *    g. Set status CODE_UPDATED.
 *    h. On any failure: roll back to PENDING, send error message, log to audit.
 *
 * Input:  { request_id: string, reject?: boolean, rejection_reason?: string }
 * Output: { success: boolean, code?: string, error?: string }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();
    if (!admin || admin.role !== 'admin') {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { request_id, reject, rejection_reason } = await req.json();
    if (!request_id) return Response.json({ success: false, error: "Missing request_id" }, { status: 400 });

    const requests = await base44.asServiceRole.entities.AccessRequest.filter({ request_id });
    const accessReq = requests[0];
    if (!accessReq) return Response.json({ success: false, error: "Request not found" }, { status: 404 });

    const nowISO = new Date().toISOString();

    // ── REJECTION FLOW ──
    if (reject) {
      await base44.asServiceRole.entities.AccessRequest.update(accessReq.id, {
        status: "REJECTED",
        approved_by: admin.id,
        approved_at: nowISO,
        rejection_reason: rejection_reason || "No reason provided",
      });
      await createSystemMessage(base44, request_id, admin,
        "Your request has been rejected. " + (rejection_reason ? `Reason: ${rejection_reason}` : "Please contact us if you have questions."),
        "REJECTED");
      return Response.json({ success: true });
    }

    // ── APPROVAL FLOW ──

    // Guard: don't re-approve if already approved/code_updated
    if (accessReq.status === "APPROVED" || accessReq.status === "CODE_UPDATED") {
      return Response.json({ success: false, error: "Request already approved" }, { status: 400 });
    }
    if (accessReq.status === "REJECTED" || accessReq.status === "CLOSED") {
      return Response.json({ success: false, error: "Cannot approve a rejected/closed request" }, { status: 400 });
    }

    // Step 1: Mark as APPROVED (intermediate state before code delivery)
    await base44.asServiceRole.entities.AccessRequest.update(accessReq.id, {
      status: "APPROVED",
      approved_by: admin.id,
      approved_at: nowISO,
    });

    // Step 2: Resolve plan config for duration
    const planConfig = await resolvePlanConfig(base44, accessReq);
    const pagePath = accessReq.page_path;
    const pageName = accessReq.page_name || pagePath;
    const featureId = (accessReq.feature_id && accessReq.feature_id !== "null" && accessReq.feature_id !== "undefined")
      ? accessReq.feature_id : null;

    // Step 3: Resolve the user's Reading Code
    let accessCode = null;

    // 3a: Check existing_code field
    if (accessReq.existing_code) {
      const codeStr = accessReq.existing_code.toUpperCase().trim();
      const codes = await base44.asServiceRole.entities.AccessCode.filter({ code: codeStr }, null, 1);
      if (codes.length > 0) {
        const candidate = codes[0];
        // Security: verify this code belongs to the requesting session
        if (!accessReq.session_id || !candidate.device_id || candidate.device_id === accessReq.session_id) {
          accessCode = candidate;
        }
      }
    }

    // 3b: Check session-bound code (device_id match)
    if (!accessCode && accessReq.session_id) {
      const sessionCodes = await base44.asServiceRole.entities.AccessCode.filter({ device_id: accessReq.session_id }, "-created_date", 10);
      accessCode = sessionCodes.find((c: any) => !c.is_disabled) || null;
    }

    // 3c: Check by Google user_id (linked_user_id) — a returning authenticated
    //     customer who already redeemed a code under their Google account.
    if (!accessCode && accessReq.user_id) {
      const linkedCodes = await base44.asServiceRole.entities.AccessCode.filter({ linked_user_id: accessReq.user_id }, "-created_date", 10);
      accessCode = (linkedCodes || []).find((c: any) => !c.is_disabled) || null;
    }

    // 3d: Check by customer email — fallback for legacy/manual codes where the
    //     code is tied to the customer email but not yet linked to a Google acct.
    if (!accessCode && accessReq.email) {
      const emailCodes = await base44.asServiceRole.entities.AccessCode.filter({ email: accessReq.email }, "-created_date", 10);
      accessCode = (emailCodes || []).find((c: any) => !c.is_disabled) || null;
    }

    let finalCodeString = "";

    try {
      if (accessCode) {
        // ── EXISTING CODE: Merge new page/feature ──
        finalCodeString = accessCode.code;
        const merged = mergeIntoExistingCode(accessCode, pagePath, pageName, featureId, planConfig, nowISO, admin.id);
        await base44.asServiceRole.entities.AccessCode.update(accessCode.id, merged);
      } else {
        // ── NEW CODE: Generate and create ──
        finalCodeString = await generateUniqueCode(base44);
        const codeFields = buildNewCodeFields(pagePath, pageName, featureId, planConfig, nowISO);
        const auditEntries = buildNewCodeAuditEntries(pagePath, pageName, featureId, planConfig, nowISO, admin.id);

        await base44.asServiceRole.entities.AccessCode.create({
          code: finalCodeString,
          customer_name: accessReq.name || `User ${accessReq.session_id?.slice(0, 8) || "Unknown"}`,
          email: accessReq.email || "",
          phone: accessReq.phone || "",
          whatsapp: accessReq.phone || "",
          page_paths: codeFields.page_paths,
          page_names: codeFields.page_names,
          page_durations: codeFields.page_durations,
          sub_features: codeFields.sub_features,
          feature_durations: codeFields.feature_durations,
          max_uses: 1,
          use_count: 0,
          is_disabled: false,
          device_id: accessReq.session_id || null,
          reset_count: 0,
          audit_log: [
            { action: "CREATED", timestamp: nowISO, admin_id: admin.id, details: `Auto-created on approval of request ${request_id}` },
            ...auditEntries,
          ],
          created_by: admin.id,
          notes: `Auto-created from Access Request ${request_id}`,
        });
      }

      // Step 4: Create system message with the code
      const messageText = `Your request has been approved.\n\nYour Reading Code is:\n${finalCodeString}\n\nEnter this Reading Code in the app to unlock your content.`;
      await createSystemMessage(base44, request_id, admin, messageText, "CODE_UPDATED");

      // Step 5: Update status to CODE_UPDATED (code has been delivered)
      await base44.asServiceRole.entities.AccessRequest.update(accessReq.id, {
        status: "CODE_UPDATED",
      });

      return Response.json({ success: true, code: finalCodeString });

    } catch (deliveryError) {
      // ── ROLLBACK ──
      // Roll back request status to PENDING
      await base44.asServiceRole.entities.AccessRequest.update(accessReq.id, {
        status: "PENDING",
      });

      // Send error message in conversation
      await createSystemMessage(base44, request_id, admin,
        `⚠️ An error occurred while delivering your Reading Code: ${deliveryError.message}. Our team has been notified. Please try again or contact support.`,
        null);

      // Log error in the AccessCode audit log if a code was involved
      if (accessCode) {
        try {
          await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
            audit_log: [...(accessCode.audit_log || []), {
              action: "DELIVERY_ERROR",
              timestamp: nowISO,
              admin_id: admin.id,
              details: `Error delivering code for request ${request_id}: ${deliveryError.message}`,
            }],
          });
        } catch {}
      }

      return Response.json({ success: false, error: "Delivery failed: " + deliveryError.message }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

/** Create a system message in the request conversation. */
async function createSystemMessage(base44: any, requestId: string, admin: any, message: string, statusChange: string | null) {
  const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  await base44.asServiceRole.entities.AccessRequestMessage.create({
    message_id: messageId,
    request_id: requestId,
    sender_type: "ADMIN",
    sender_id: admin.id,
    sender_name: admin.full_name || "Admin",
    message,
    status_change: statusChange || null,
    created_at: new Date().toISOString(),
    is_read: false,
  });
}

/** Look up SubscriptionPlanConfig for the request's page/feature/plan.
 *  - If the request carries a plan_name, resolve that exact plan.
 *  - If no plan_name (e.g. in-app/WhatsApp request), fall back to the page's
 *    recommended active plan, then the first active plan — so configured
 *    pricing/durations are respected instead of silently granting LIFETIME.
 *  - Returns null only if no active plan exists for the page at all. */
async function resolvePlanConfig(base44: any, accessReq: any) {
  const featureId = accessReq.feature_id || "FULL_PAGE";

  if (accessReq.plan_name) {
    // Try exact feature_id match first
    const plans = await base44.asServiceRole.entities.SubscriptionPlanConfig.filter({
      page_path: accessReq.page_path,
      feature_id: featureId,
      plan_name: accessReq.plan_name,
      is_active: true,
    }, null, 1);

    if (plans.length > 0) return plans[0];

    // Fallback: try FULL_PAGE plan for the same page
    if (featureId !== "FULL_PAGE") {
      const fallbackPlans = await base44.asServiceRole.entities.SubscriptionPlanConfig.filter({
        page_path: accessReq.page_path,
        feature_id: "FULL_PAGE",
        plan_name: accessReq.plan_name,
        is_active: true,
      }, null, 1);
      if (fallbackPlans.length > 0) return fallbackPlans[0];
    }
  }

  // No plan_name, or exact match failed → use the page's recommended active plan
  const allPagePlans = await base44.asServiceRole.entities.SubscriptionPlanConfig.filter(
    { page_path: accessReq.page_path, is_active: true }, "sort_order", 50
  );
  if (allPagePlans && allPagePlans.length > 0) {
    // Prefer a plan matching the request's feature_id
    const featMatch = allPagePlans.find((p: any) => p.feature_id === featureId);
    if (featMatch) return featMatch;
    // Then the page's recommended plan
    const recommended = allPagePlans.find((p: any) => p.is_recommended);
    if (recommended) return recommended;
    // Then any FULL_PAGE plan
    const fullPage = allPagePlans.find((p: any) => p.feature_id === "FULL_PAGE");
    if (fullPage) return fullPage;
    // Otherwise the first active plan
    return allPagePlans[0];
  }

  return null;
}

/** Generate a unique 8-char Reading Code using CSPRNG. Retries up to 3 times on collision. */
async function generateUniqueCode(base44: any) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 3; attempt++) {
    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[randomBytes[i] % chars.length];
    }
    const existing = await base44.asServiceRole.entities.AccessCode.filter({ code }, null, 1);
    if (!existing || existing.length === 0) return code;
  }
  throw new Error("Failed to generate unique code after 3 attempts");
}

/** Build a page_duration object from plan config. */
function buildPageDuration(planConfig: any, nowISO: string) {
  if (!planConfig || planConfig.duration_type === "LIFETIME") {
    return { value: "LIFETIME", label: "Lifetime", days: null, duration_ms: null, custom_date: null, added_at: nowISO };
  }
  const days = planConfig.duration_days || 0;
  return {
    value: "CUSTOM",
    label: planConfig.plan_name || `${days} days`,
    days,
    duration_ms: days * 86400000,
    custom_date: null,
    added_at: nowISO,
  };
}

/** Build a feature_duration object from plan config. */
function buildFeatureDuration(planConfig: any, nowISO: string) {
  if (!planConfig || planConfig.duration_type === "LIFETIME") {
    return { plan_name: planConfig?.plan_name || "Lifetime", duration_days: null, is_lifetime: true, added_at: nowISO };
  }
  const days = planConfig.duration_days || 0;
  return { plan_name: planConfig.plan_name || "Plan", duration_days: days, is_lifetime: false, added_at: nowISO };
}

/** Build the code fields (page_paths, page_names, page_durations, sub_features, feature_durations) for a new code. */
function buildNewCodeFields(pagePath: string, pageName: string, featureId: string | null, planConfig: any, nowISO: string) {
  const isFeature = featureId && featureId !== "FULL_PAGE";
  const pageDur = buildPageDuration(planConfig, nowISO);

  if (isFeature) {
    const featKey = `${pagePath}:${featureId}`;
    return {
      page_paths: [pagePath],
      page_names: [pageName],
      page_durations: { [pagePath]: pageDur },
      sub_features: { [pagePath]: [featureId] },
      feature_durations: { [featKey]: buildFeatureDuration(planConfig, nowISO) },
    };
  }
  return {
    page_paths: [pagePath],
    page_names: [pageName],
    page_durations: { [pagePath]: pageDur },
    sub_features: {},
    feature_durations: {},
  };
}

/** Build audit entries for a new code. */
function buildNewCodeAuditEntries(pagePath: string, pageName: string, featureId: string | null, planConfig: any, nowISO: string, adminId: string) {
  const isFeature = featureId && featureId !== "FULL_PAGE";
  const entries: any[] = [];

  if (isFeature) {
    const featKey = `${pagePath}:${featureId}`;
    const dur = planConfig?.duration_type === "LIFETIME" ? "Lifetime" : `${planConfig?.duration_days || 0} days`;
    entries.push({ action: "ADDED_PAGE", timestamp: nowISO, admin_id: adminId, details: `Page added: ${pageName} (${pagePath})` });
    entries.push({ action: "ADDED_FEATURE", timestamp: nowISO, admin_id: adminId, details: `Feature added: ${featKey} — Plan: ${planConfig?.plan_name || "N/A"} (${dur})` });
  } else {
    entries.push({ action: "ADDED_PAGE", timestamp: nowISO, admin_id: adminId, details: `Page added: ${pageName} (${pagePath})` });
  }
  return entries;
}

/**
 * Merge a new page/feature into an existing AccessCode.
 * - Never removes existing permissions.
 * - Never duplicates pages or features.
 * - Preserves all existing expiry dates (doesn't overwrite existing durations).
 * - New items get added_at = nowISO (per-feature expiry starts from approval time).
 * - Preserves device binding, security, renewal history, and audit logs.
 */
function mergeIntoExistingCode(accessCode: any, pagePath: string, pageName: string, featureId: string | null, planConfig: any, nowISO: string, adminId: string) {
  const pagePaths = [...(accessCode.page_paths || [])];
  const pageNames = [...(accessCode.page_names || [])];
  const pageDurations = { ...(accessCode.page_durations || {}) };
  const subFeatures = { ...(accessCode.sub_features || {}) };
  const featureDurations = { ...(accessCode.feature_durations || {}) };
  const auditLog = [...(accessCode.audit_log || [])];

  const isFeature = featureId && featureId !== "FULL_PAGE";
  const pageExists = pagePaths.includes(pagePath);

  if (isFeature) {
    const featKey = `${pagePath}:${featureId}`;

    // Add page if it doesn't exist (don't overwrite existing page_durations)
    if (!pageExists) {
      pagePaths.push(pagePath);
      pageNames.push(pageName);
      pageDurations[pagePath] = buildPageDuration(planConfig, nowISO);
      auditLog.push({ action: "ADDED_PAGE", timestamp: nowISO, admin_id: adminId, details: `Page added: ${pageName} (${pagePath})` });
    }

    // Add feature to sub_features if not already present
    const currentFeats = subFeatures[pagePath] || [];
    if (!currentFeats.includes(featureId)) {
      subFeatures[pagePath] = [...currentFeats, featureId];
    }

    // Set feature_duration only if not already present (preserve existing expiry)
    if (!featureDurations[featKey]) {
      featureDurations[featKey] = buildFeatureDuration(planConfig, nowISO);
      const dur = planConfig?.duration_type === "LIFETIME" ? "Lifetime" : `${planConfig?.duration_days || 0} days`;
      auditLog.push({ action: "ADDED_FEATURE", timestamp: nowISO, admin_id: adminId, details: `Feature added: ${featKey} — Plan: ${planConfig?.plan_name || "N/A"} (${dur})` });
    }
  } else {
    // Page-level addition
    if (!pageExists) {
      pagePaths.push(pagePath);
      pageNames.push(pageName);
      pageDurations[pagePath] = buildPageDuration(planConfig, nowISO);
      auditLog.push({ action: "ADDED_PAGE", timestamp: nowISO, admin_id: adminId, details: `Page added: ${pageName} (${pagePath})` });
    }
    // If page already exists, don't modify — preserve existing expiry
  }

  return {
    page_paths: pagePaths,
    page_names: pageNames,
    page_durations: pageDurations,
    sub_features: subFeatures,
    feature_durations: featureDurations,
    audit_log: auditLog,
  };
}
/**
 * Frontend helper for the Owner Audit Log.
 * Call logOwnerAudit(...) immediately AFTER an administrative action succeeds.
 * It never throws and never blocks the UI — audit logging is best-effort and
 * must not break the primary action.
 *
 * The actual write goes through the recordOwnerAuditLog backend function, which
 * captures user, role, device, IP, and user-agent from the request.
 */
import { base44 } from "@/api/base44Client";

export const AUDIT_ACTIONS = {
  ADMIN_CREATED: "ADMIN_CREATED",
  ADMIN_REMOVED: "ADMIN_REMOVED",
  PERMISSION_CHANGED: "PERMISSION_CHANGED",
  ADMIN_DISABLED: "ADMIN_DISABLED",
  ADMIN_ENABLED: "ADMIN_ENABLED",
  ADMIN_DEVICE_RESET: "ADMIN_DEVICE_RESET",
  SHOP_UPDATED: "SHOP_UPDATED",
  PRODUCT_CREATED: "PRODUCT_CREATED",
  PRODUCT_UPDATED: "PRODUCT_UPDATED",
  PRODUCT_DELETED: "PRODUCT_DELETED",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_RESTORED: "USER_RESTORED",
  ACCESS_CODE_CREATED: "ACCESS_CODE_CREATED",
  ACCESS_CODE_UPDATED: "ACCESS_CODE_UPDATED",
  ACCESS_CODE_RENEWED: "ACCESS_CODE_RENEWED",
  ACCESS_CODE_DELETED: "ACCESS_CODE_DELETED",
  ACCESS_CODE_RESET: "ACCESS_CODE_RESET",
  PDF_EDITED: "PDF_EDITED",
  HOLY_NAMES_EDITED: "HOLY_NAMES_EDITED",
  SETTINGS_CHANGED: "SETTINGS_CHANGED",
  PAGE_VISIBILITY_CHANGED: "PAGE_VISIBILITY_CHANGED",
  FEATURE_PRICING_CHANGED: "FEATURE_PRICING_CHANGED",
  REDEEM_APPROVED: "REDEEM_APPROVED",
  REDEEM_REJECTED: "REDEEM_REJECTED",
  CUSTOMER_ASSIGNED: "CUSTOMER_ASSIGNED",
  SUPPORT_ROUTING_CHANGED: "SUPPORT_ROUTING_CHANGED",
  ANALYTICS_CHANGED: "ANALYTICS_CHANGED",
  OWNER_ACTION: "OWNER_ACTION",
  OTHER: "OTHER",
};

/**
 * @param {string} action_type   — one of AUDIT_ACTIONS
 * @param {string} objectType    — e.g. "AdminProfile", "Product"
 * @param {string} [objectId]
 * @param {object} [opts]        — { label, details, objectLabel, device_id }
 */
export async function logOwnerAudit(action_type, objectType, objectId, opts = {}) {
  try {
    await base44.functions.invoke("recordOwnerAuditLog", {
      action_type,
      object_type: objectType,
      object_id: objectId || "",
      object_label: opts.objectLabel || opts.label || "",
      action_label: opts.actionLabel || "",
      details: opts.details || null,
      device_id: opts.device_id || "",
    });
  } catch {
    // Audit logging must never break the primary action. Swallow silently.
  }
}
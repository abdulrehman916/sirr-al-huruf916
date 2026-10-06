/**
 * Pricing Utilities — Shared helpers for sale price computation, validation,
 * and display formatting. Used by admin dashboard and user-facing locked screen.
 *
 * All functions are pure — no side effects, no API calls.
 */

/**
 * Check if a sale is currently active for a plan.
 * @param {object} plan — SubscriptionPlanConfig record
 * @returns {boolean} true if sale_price is set and current time is within sale window
 */
export function isSaleActive(plan) {
  if (!plan) return false;
  const { sale_price, sale_start_date, sale_end_date } = plan;
  if (sale_price == null || sale_price === undefined) return false;

  const now = new Date();
  if (sale_start_date && new Date(sale_start_date) > now) return false;
  if (sale_end_date && new Date(sale_end_date) < now) return false;
  return true;
}

/**
 * Get the effective price for a plan (sale price if active, otherwise normal price).
 * @param {object} plan — SubscriptionPlanConfig record
 * @returns {number} The price the user should see
 */
export function getEffectivePrice(plan) {
  if (!plan) return 0;
  if (isSaleActive(plan) && plan.sale_price != null) {
    return plan.sale_price;
  }
  return plan.price || 0;
}

/**
 * Compute sale_price from discount_percentage if discount_percentage is set
 * and sale_price is not explicitly provided.
 * @param {object} plan
 * @returns {number|null} Computed sale price or null
 */
export function computeSalePrice(plan) {
  if (!plan) return null;
  if (plan.sale_price != null) return plan.sale_price;
  if (plan.discount_percentage != null && plan.discount_percentage > 0) {
    const discount = plan.price * (plan.discount_percentage / 100);
    return Math.round((plan.price - discount) * 100) / 100;
  }
  return null;
}

/**
 * Format a price with currency for display.
 * @param {number} price
 * @param {string} currency
 * @returns {string} e.g. "AED 25"
 */
export function formatPrice(price, currency = "AED") {
  if (price == null || price === undefined) return "";
  return `${currency} ${price}`;
}

/**
 * Format a date for datetime-local input (YYYY-MM-DDTHH:MM).
 * @param {string} isoDate — ISO 8601 timestamp
 * @returns {string} Local datetime string for input, or ""
 */
export function toDateTimeLocal(isoDate) {
  if (!isoDate) return "";
  try {
    const d = new Date(isoDate);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

/**
 * Convert a datetime-local string to ISO 8601.
 * @param {string} localStr — from datetime-local input
 * @returns {string|null} ISO 8601 or null
 */
export function fromDateTimeLocal(localStr) {
  if (!localStr) return null;
  try {
    return new Date(localStr).toISOString();
  } catch {
    return null;
  }
}

/**
 * Format a date for display (short format).
 * @param {string} isoDate
 * @returns {string} e.g. "3 Jul 2026, 14:30"
 */
export function formatDateShort(isoDate) {
  if (!isoDate) return "—";
  try {
    return new Date(isoDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/**
 * Validate a plan before saving.
 * @param {object} planData — { plan_name, price, duration_type, duration_count, sale_price, discount_percentage, sale_start_date, sale_end_date }
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePlan(planData) {
  const errors = [];

  if (!planData.plan_name || !planData.plan_name.trim()) {
    errors.push("Plan name is required");
  }

  if (planData.price == null || planData.price === "" || isNaN(planData.price)) {
    errors.push("Price is required");
  } else if (parseFloat(planData.price) < 0) {
    errors.push("Price cannot be negative");
  }

  if (planData.duration_type !== "LIFETIME") {
    if (!planData.duration_count || parseInt(planData.duration_count) < 1) {
      errors.push("Duration must be at least 1");
    }
  }

  // Sale validation
  if (planData.sale_price != null && planData.sale_price !== "") {
    if (isNaN(planData.sale_price) || parseFloat(planData.sale_price) < 0) {
      errors.push("Sale price must be a valid positive number");
    } else if (parseFloat(planData.sale_price) >= parseFloat(planData.price)) {
      errors.push("Sale price must be less than the normal price");
    }
  }

  if (planData.discount_percentage != null && planData.discount_percentage !== "") {
    const pct = parseFloat(planData.discount_percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      errors.push("Discount percentage must be between 0 and 100");
    }
  }

  // Sale date range validation
  if (planData.sale_start_date && planData.sale_end_date) {
    if (new Date(planData.sale_start_date) >= new Date(planData.sale_end_date)) {
      errors.push("Sale end date must be after start date");
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Duration type metadata — shared between admin and display.
 */
export const DURATION_TYPES = [
  { value: "DAYS", label: "Days", multiplier: 1 },
  { value: "MONTHS", label: "Months", multiplier: 30 },
  { value: "YEARS", label: "Years", multiplier: 365 },
  { value: "LIFETIME", label: "Lifetime", multiplier: null },
];

/**
 * Compute duration_days from type + count.
 * @param {string} type — DAYS, MONTHS, YEARS, LIFETIME
 * @param {number} count
 * @returns {number|null} Total days, or null for LIFETIME
 */
export function computeDurationDays(type, count) {
  const meta = DURATION_TYPES.find((t) => t.value === type);
  if (!meta || !meta.multiplier) return null;
  return (parseInt(count) || 0) * meta.multiplier;
}

/**
 * Infer duration type + count from stored duration_days (backward compat).
 * @param {object} plan
 * @returns {{ type: string, count: number|null }}
 */
export function inferDurationType(plan) {
  if (plan.duration_type === "LIFETIME") return { type: "LIFETIME", count: null };
  if (plan.duration_type && plan.duration_type !== "DAYS") {
    return { type: plan.duration_type, count: plan.duration_count || 1 };
  }
  const days = plan.duration_days || 0;
  if (days > 0 && days % 365 === 0) return { type: "YEARS", count: days / 365 };
  if (days > 0 && days % 30 === 0) return { type: "MONTHS", count: days / 30 };
  return { type: "DAYS", count: days };
}

/**
 * Format a duration for display.
 * @param {string} type — DAYS, MONTHS, YEARS, LIFETIME
 * @param {number|null} count
 * @returns {string} e.g. "30 days", "3 months", "1 year", "Lifetime"
 */
export function formatDuration(type, count) {
  if (type === "LIFETIME") return "Lifetime";
  const unit = type.toLowerCase().replace(/s$/, "");
  return `${count} ${unit}${count > 1 ? "s" : ""}`;
}
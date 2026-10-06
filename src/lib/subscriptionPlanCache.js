/**
 * Subscription Plan Cache — fetches and caches SubscriptionPlanConfig entries.
 * Used by FeatureLockedCard (show plans to users) and CreateCodePageItem (plan selector for admin).
 *
 * Cache TTL: 2 minutes (120000ms).
 */
import { base44 } from "@/api/base44Client";
import { getCached, setCached } from "@/lib/permissionCache";
import { getEffectivePrice, isSaleActive } from "@/lib/pricingUtils";

const CACHE_TTL = 120000;
const PREFIX = "sub_plans";

/**
 * Fetch all active plans for a specific feature (with cache).
 * @param {string} pagePath — e.g. '/abjad'
 * @param {string} featureId — e.g. 'abjad_kabir'
 * @returns {Promise<array>} Array of plan records, sorted by sort_order
 */
export async function getFeaturePlans(pagePath, featureId) {
  const all = await getPagePlans(pagePath);
  return all.filter(p => p.feature_id === featureId);
}

/**
 * Fetch all active plans for a page (with cache).
 * @param {string} pagePath
 * @returns {Promise<array>}
 */
export async function getPagePlans(pagePath) {
  const cacheKey = `${PREFIX}:${pagePath}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const results = await base44.entities.SubscriptionPlanConfig.filter(
      { page_path: pagePath, is_active: true },
      "sort_order",
      50
    );
    setCached(cacheKey, results || [], CACHE_TTL);
    return results || [];
  } catch {
    return [];
  }
}

/**
 * Format a plan for display: "1 Month — AED 25"
 * Uses effective price (sale price if active).
 */
export function formatPlan(plan) {
  if (!plan) return "";
  const effectivePrice = getEffectivePrice(plan);
  const price = `${plan.currency || "AED"} ${effectivePrice}`;
  return `${plan.plan_name} — ${price}`;
}

/**
 * Invalidate plan cache for a page (called after admin updates).
 */
export function invalidatePlanCache(pagePath) {
  setCached(`${PREFIX}:${pagePath}`, null, 1);
}
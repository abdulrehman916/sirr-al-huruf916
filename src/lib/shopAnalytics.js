/**
 * Shop Analytics — Anonymous fire-and-forget event tracking.
 *
 * No personal data collected. Country and device are derived server-side
 * from request headers. Session ID is an anonymous localStorage UUID.
 *
 * All functions are non-blocking: they call the backend function and
 * silently catch errors so they never affect the shop UI.
 */
import { base44 } from "@/api/base44Client";

// ── Anonymous session ID (localStorage, no personal data) ──
function getSessionId() {
  try {
    let id = localStorage.getItem("shop_analytics_sid");
    if (!id) {
      id = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("shop_analytics_sid", id);
    }
    return id;
  } catch {
    return "";
  }
}

// ── Fire-and-forget logger ──
function logEvent(event_type, data = {}) {
  try {
    base44.functions.invoke("logShopAnalyticsEvent", {
      event_type,
      session_id: getSessionId(),
      ...data,
    }).catch(() => {});
  } catch {
    // ignore — analytics must never break the UI
  }
}

// ── Public tracking helpers ──

export function trackProductView(productId, productName) {
  logEvent("view", { product_id: productId, product_name: productName });
}

export function trackDetailView(productId, productName) {
  logEvent("detail_view", { product_id: productId, product_name: productName });
}

/**
 * Track a marketplace button click.
 * @param productId   Product ID
 * @param productName Product display name
 * @param marketplace Marketplace platform (amazon, noon, flipkart, custom, etc.)
 * @param clickType   Click event type: amazon_click, noon_click, flipkart_click,
 *                    custom_click, whatsapp_click, email_click, buy_click
 */
export function trackMarketplaceClick(productId, productName, marketplace, clickType) {
  logEvent(clickType, {
    product_id: productId,
    product_name: productName,
    marketplace,
  });
}

export function trackShareClick(productId, productName) {
  logEvent("share_click", { product_id: productId, product_name: productName });
}

export function trackWishlistAdd(productId, productName) {
  logEvent("wishlist_add", { product_id: productId, product_name: productName });
}

/**
 * Track a search query.
 * @param keyword      Search term
 * @param resultsCount Number of matching products (0 → no_result_search)
 */
export function trackSearch(keyword, resultsCount) {
  const eventType = resultsCount > 0 ? "search" : "no_result_search";
  logEvent(eventType, { keyword });
}

/**
 * Track a category filter selection.
 * @param category Category name selected by the user
 */
export function trackCategoryFilter(category) {
  logEvent("category_filter", { category });
}
/**
 * Marketplace Deep Link Utility
 *
 * Tries to open the native marketplace app (Amazon, Flipkart, Noon) if installed.
 * Falls back to the website URL if the app is not available.
 *
 * On desktop: always opens the web URL.
 * On mobile: attempts the native app scheme, then falls back after 1.5s.
 */

const DEEP_LINK_SCHEMES = {
  amazon_ae: "amazon.ae://",
  amazon_in: "amazon.in://",
  amazon_sa: "amazon.sa://",
  amazon_us: "amazon.com://",
  amazon_uk: "amazon.co.uk://",
  flipkart: "flipkart://",
  noon: "noon://",
};

/**
 * Open a marketplace link — native app first, web URL as fallback.
 * @param {string} marketplaceId - The marketplace registry ID (e.g. "amazon_ae")
 * @param {string} webUrl - The full web URL to open as fallback
 */
export function openMarketplaceLink(marketplaceId, webUrl) {
  const scheme = DEEP_LINK_SCHEMES[marketplaceId];
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || ""
  );

  // No scheme or desktop: just open the web URL
  if (!scheme || !isMobile) {
    window.open(webUrl, "_blank", "noopener,noreferrer");
    return;
  }

  // Mobile: try native app first
  const start = Date.now();
  let fallbackTriggered = false;

  // Attempt to open the native app via location redirect
  try {
    window.location.href = scheme;
  } catch (e) {
    // If redirect fails, open web URL immediately
    window.open(webUrl, "_blank", "noopener,noreferrer");
    return;
  }

  // Fallback to web URL after 1.5s if app didn't open
  setTimeout(function () {
    // If page is still visible and little time passed, app didn't open
    if (!document.hidden && Date.now() - start < 3000) {
      fallbackTriggered = true;
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }
  }, 1500);

  // If the page becomes hidden (app opened), cancel any pending fallback
  document.addEventListener(
    "visibilitychange",
    function () {
      if (document.hidden) {
        fallbackTriggered = true;
      }
    },
    { once: true }
  );
}

/**
 * Check if a marketplace has a deep link scheme (native app support).
 */
export function hasDeepLink(marketplaceId) {
  return !!DEEP_LINK_SCHEMES[marketplaceId];
}
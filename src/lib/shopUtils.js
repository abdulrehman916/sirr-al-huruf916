/**
 * Shop UI Utilities — Frontend-only (localStorage)
 * No backend changes. Wishlist + Recently Viewed + price parsing.
 */

import { trackWishlistAdd } from "@/lib/shopAnalytics";

const WISHLIST_KEY = "shop_wishlist";
const RECENTLY_VIEWED_KEY = "shop_recently_viewed";
const MAX_RECENT = 8;

// ── Wishlist ──
export function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

export function toggleWishlist(productId) {
  const list = getWishlist();
  const idx = list.indexOf(productId);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(productId);
    trackWishlistAdd(productId, "");
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent("shop-wishlist-changed"));
  return idx < 0; // true if added, false if removed
}

// ── Recently Viewed ──
export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentlyViewed(product) {
  if (!product || !product.id) return;
  let list = getRecentlyViewed();
  // Remove if already present
  list = list.filter(p => p.id !== product.id);
  // Add to front
  const minimal = {
    id: product.id,
    product_id: product.product_id,
    name: product.name,
    slug: product.slug,
    images: product.images?.slice(0, 1) || [],
    category: product.category,
    price_display: product.price_display,
    rating_display: product.rating_display,
    is_featured: product.is_featured,
  };
  list.unshift(minimal);
  // Cap
  list = list.slice(0, MAX_RECENT);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("shop-recently-viewed-changed"));
}

// ── Price Parsing ──
// Extracts numeric price from strings like "AED 120", "$45", "AED 50.99"
export function parsePrice(priceDisplay) {
  if (!priceDisplay) return null;
  const match = String(priceDisplay).match(/[\d,.]+/);
  if (!match) return null;
  const num = parseFloat(match[0].replace(/,/g, ""));
  return isNaN(num) ? null : num;
}

// ── Share / Copy Link ──
export async function copyProductLink(slug) {
  const url = `${window.location.origin}/shop/${slug}`;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement("textarea");
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

export function shareProduct(product) {
  const url = `${window.location.origin}/shop/${product.slug || product.id}`;
  if (navigator.share) {
    navigator.share({
      title: product.name,
      text: product.short_description || product.name,
      url,
    }).catch(() => {});
  } else {
    return copyProductLink(product.slug || product.id);
  }
}

// ── Features Extraction ──
// Derives features from tags + spec keys (presentation-only, no entity changes)
export function extractFeatures(product) {
  const features = [];
  if (product.tags && product.tags.length > 0) {
    features.push(...product.tags);
  }
  const specs = product.specifications || {};
  const specKeys = Object.keys(specs).filter(k => specs[k]);
  specKeys.forEach(k => {
    const label = `${k}: ${specs[k]}`;
    if (!features.includes(label)) features.push(label);
  });
  return features;
}

// ── Compare Products ──
const COMPARE_KEY = "shop_compare";
const MAX_COMPARE = 4;

export function getCompareList() {
  try {
    return JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isInCompare(productId) {
  return getCompareList().includes(productId);
}

export function toggleCompare(productId) {
  let list = getCompareList();
  const idx = list.indexOf(productId);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    if (list.length >= MAX_COMPARE) return false; // cap reached, do not add
    list.push(productId);
  }
  localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("shop-compare-changed"));
  return idx < 0; // true if added, false if removed
}

export function clearCompare() {
  localStorage.removeItem(COMPARE_KEY);
  window.dispatchEvent(new CustomEvent("shop-compare-changed"));
}

// ── Brand Extraction ──
// Prefers the dedicated `brand` field; falls back to first tag for legacy records.
export function extractBrands(products) {
  const brands = new Set();
  products.forEach(p => {
    if (p.brand) {
      brands.add(p.brand);
    } else if (p.tags && p.tags.length > 0) {
      brands.add(p.tags[0]);
    }
  });
  return Array.from(brands).sort();
}

// Returns the display brand for a single product (brand field > first tag)
export function getBrand(product) {
  if (!product) return null;
  if (product.brand) return product.brand;
  if (product.tags && product.tags.length > 0) return product.tags[0];
  return null;
}
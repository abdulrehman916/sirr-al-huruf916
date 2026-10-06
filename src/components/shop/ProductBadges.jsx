import { Star, Flame, Sparkles, X, TrendingDown, TrendingUp } from "lucide-react";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  borderHi: "rgba(212,175,55,0.55)",
};

/**
 * Derives the discount percentage for display.
 * Priority: explicit discount_percentage > computed from compare_price_display vs price_display.
 */
export function getDiscountPercent(product) {
  if (product?.discount_percentage && product.discount_percentage > 0) {
    return Math.round(product.discount_percentage);
  }
  const parseNum = (s) => {
    if (!s) return null;
    const m = String(s).match(/[\d,.]+/);
    if (!m) return null;
    const n = parseFloat(m[0].replace(/,/g, ""));
    return isNaN(n) ? null : n;
  };
  const compare = parseNum(product?.compare_price_display);
  const price = parseNum(product?.price_display);
  if (compare !== null && price !== null && compare > price) {
    return Math.round(((compare - price) / compare) * 100);
  }
  return 0;
}

/**
 * Returns an ordered array of badge configs for a product.
 * Order: Out of Stock → Discount → Best Seller → New Arrival → Featured
 */
export function getProductBadges(product) {
  const badges = [];
  if (!product) return badges;

  if (product.is_out_of_stock) {
    badges.push({ key: "oos", label: "Out of Stock", icon: X, bg: "rgba(248,113,113,0.18)", border: "rgba(248,113,113,0.50)", color: "#F87171" });
  }
  const discount = getDiscountPercent(product);
  if (discount > 0) {
    badges.push({ key: "discount", label: `${discount}% Off`, icon: TrendingDown, bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.45)", color: "#86EFAC" });
  }
  if (product.is_best_seller) {
    badges.push({ key: "best", label: "Best Seller", icon: Flame, bg: "rgba(251,146,60,0.15)", border: "rgba(251,146,60,0.45)", color: "#FB923C" });
  }
  if (product.is_trending) {
    badges.push({ key: "trending", label: "Trending", icon: TrendingUp, bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.45)", color: "#C084FC" });
  }
  if (product.is_new_arrival) {
    badges.push({ key: "new", label: "New Arrival", icon: Sparkles, bg: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.45)", color: "#60A5FA" });
  }
  if (product.is_featured) {
    badges.push({ key: "featured", label: "Featured", icon: Star, bg: "rgba(212,175,55,0.15)", border: G.borderHi, color: G.text });
  }
  return badges;
}

/**
 * Compact badge row — for product cards (top-left overlay).
 */
export function ProductBadgesOverlay({ product, max = 3 }) {
  const badges = getProductBadges(product).slice(0, max);
  if (badges.length === 0) return null;
  return (
    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
      {badges.map(b => {
        const Icon = b.icon;
        return (
          <div
            key={b.key}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-inter text-[7px] font-bold uppercase tracking-wider"
            style={{
              background: b.bg,
              border: `1px solid ${b.border}`,
              color: b.color,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <Icon className="w-2 h-2" style={{ fill: b.color }} />
            {b.label}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Inline badge row — for detail page (below title).
 */
export function ProductBadgesInline({ product }) {
  const badges = getProductBadges(product);
  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(b => {
        const Icon = b.icon;
        return (
          <div
            key={b.key}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-inter text-[9px] font-bold uppercase tracking-widest"
            style={{
              background: b.bg,
              border: `1px solid ${b.border}`,
              color: b.color,
            }}
          >
            <Icon className="w-3 h-3" style={{ fill: b.color }} />
            {b.label}
          </div>
        );
      })}
    </div>
  );
}

export default ProductBadgesInline;
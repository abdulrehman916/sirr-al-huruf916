import { motion } from "framer-motion";
import {
  Sparkles, Flame, TrendingUp, Star, Clock, Tag,
  Package, ShoppingBag,
} from "lucide-react";
import ShopSectionRow from "./ShopSectionRow";
import { getRecentlyViewed } from "@/lib/shopUtils";

const G = {
  text: "#F5D060", dim: "rgba(212,175,55,0.55)",
  border: "rgba(212,175,55,0.30)", faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
};

// Category card for the "Popular Categories" row
function CategoryCard({ name, count, index, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.3 }}
      onClick={onClick}
      className="flex-shrink-0 w-[130px] h-[80px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.03]"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.95) 0%, rgba(4,10,24,0.98) 100%)",
        border: `1px solid ${G.faint}`,
      }}
    >
      <Package className="w-5 h-5" style={{ color: G.text }} />
      <span className="font-inter text-[11px] font-bold text-center px-1 leading-tight" style={{ color: "rgba(255,255,255,0.85)" }}>
        {name}
      </span>
      <span className="font-inter text-[8px]" style={{ color: G.dim }}>
        {count} {count === 1 ? "item" : "items"}
      </span>
    </motion.button>
  );
}

/**
 * Curated shopping sections displayed above the product grid.
 * Shows only when no search or filters are active (default browse view).
 * Sections: Popular Categories, Featured, New Arrivals, Best Sellers,
 * Trending, Offers & Discounts, Recently Viewed.
 */
export default function ShopHomeSections({ products = [], onCategorySelect }) {
  if (!products || products.length === 0) return null;

  const featured = products.filter(p => p.is_featured);
  const newArrivals = products.filter(p => p.is_new_arrival);
  const bestSellers = products.filter(p => p.is_best_seller);
  const trending = products.filter(p => p.is_trending);
  const offers = products.filter(p => p.compare_price_display || (p.discount_percentage && p.discount_percentage > 0));

  // Recently viewed — match against loaded products for full data
  const recentlyViewed = getRecentlyViewed()
    .map(rv => products.find(p => p.id === rv.id))
    .filter(Boolean);

  // Popular categories — count products per category
  const categoryMap = {};
  products.forEach(p => {
    if (p.category) {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
    }
  });
  const popularCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Recommended — products not in any special section (fallback: all active)
  const specialIds = new Set([
    ...featured, ...newArrivals, ...bestSellers, ...trending,
  ].map(p => p.id));
  const recommended = products.filter(p => !specialIds.has(p.id)).slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Popular Categories */}
      {popularCategories.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" style={{ color: G.text }} />
            <h2 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
              Popular Categories
            </h2>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {popularCategories.map(([name, count], i) => (
              <CategoryCard
                key={name}
                name={name}
                count={count}
                index={i}
                onClick={() => onCategorySelect?.(name)}
              />
            ))}
            <div className="flex-shrink-0 w-1" />
          </div>
        </div>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <ShopSectionRow icon={Sparkles} title="Featured Products" products={featured} />
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <ShopSectionRow icon={Star} title="New Arrivals" products={newArrivals} />
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <ShopSectionRow icon={Flame} title="Best Sellers" products={bestSellers} />
      )}

      {/* Trending Now */}
      {trending.length > 0 && (
        <ShopSectionRow icon={TrendingUp} title="Trending Now" products={trending} />
      )}

      {/* Offers & Discounts */}
      {offers.length > 0 && (
        <ShopSectionRow icon={Tag} title="Offers & Discounts" products={offers} />
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <ShopSectionRow icon={Clock} title="Continue Shopping" products={recentlyViewed} />
      )}

      {/* Recommended For You */}
      {recommended.length > 0 && (
        <ShopSectionRow icon={Sparkles} title="Recommended For You" products={recommended} />
      )}
    </motion.div>
  );
}
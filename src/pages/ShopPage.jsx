import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, ShoppingBag, Star, ArrowUpDown, ChevronDown, SlidersHorizontal,
  Heart, Check, Package, Clock, TrendingUp, Flame, Sparkles
} from "lucide-react";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import ProductCard from "../components/shop/ProductCard";
import { ProductGridSkeleton } from "../components/shop/ProductSkeleton";
import { EmptySearchState, EmptyShopState, EmptyWishlistState } from "../components/shop/EmptyState";
import { base44 } from "../api/base44Client";
import { setSelectedCountry } from "@/lib/shopCurrency";
import { trackSearch, trackCategoryFilter } from "@/lib/shopAnalytics";
import { getWishlist, isInWishlist, toggleWishlist, extractBrands, parsePrice, getRecentlyViewed, getBrand } from "@/lib/shopUtils";
import RelatedProducts from "../components/shop/RelatedProducts";
import CompareBar from "../components/shop/CompareBar";
import ShopSectionRow from "../components/shop/ShopSectionRow";
import CurrencySelector from "../components/shop/CurrencySelector";
import ShopBadges from "../components/shop/ShopBadges";
import ShopHomeSections from "../components/shop/ShopHomeSections";
import HeroBanner from "../components/shop/HeroBanner";

const G = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.55)",
  glow: "rgba(212,175,55,0.18)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.12)",
};

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "popularity", label: "Popularity" },
  { value: "price_low", label: "Price: Low → High" },
  { value: "price_high", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "az", label: "A → Z" },
];

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");
  const [sort, setSort] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [shopCategories, setShopCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    refreshWishlist();
  }, []);

  // Load dynamic categories and apply owner country override
  useEffect(() => {
    (async () => {
      try {
        const cats = await base44.entities.ShopCategory.list("display_order", 200);
        const active = (cats || []).filter(c => c.is_active !== false).map(c => c.name);
        if (active.length > 0) setShopCategories(active);
      } catch { /* fallback to product-derived */ }

      try {
        const settings = await base44.entities.ShopSettings.list();
        const s = settings?.[0];
        if (s && s.auto_detect_country === false && s.active_country) {
          setSelectedCountry(s.active_country);
        }
      } catch { /* ignore */ }
    })();
  }, []);

  // Listen for wishlist changes
  useEffect(() => {
    const handler = () => refreshWishlist();
    window.addEventListener("shop-wishlist-changed", handler);
    return () => window.removeEventListener("shop-wishlist-changed", handler);
  }, []);

  // Debounce search input for smoother filtering
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Recently viewed products (localStorage, frontend-only)
  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
    const handler = () => setRecentlyViewed(getRecentlyViewed());
    window.addEventListener("shop-recently-viewed-changed", handler);
    return () => window.removeEventListener("shop-recently-viewed-changed", handler);
  }, []);

  const refreshWishlist = () => {
    setWishlistIds(getWishlist());
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const list = await base44.entities.Product.list("-created_date", 200);
      setProducts(list || []);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    if (shopCategories.length > 0) return ["all", ...shopCategories];
    const set = new Set();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return ["all", ...Array.from(set).sort()];
  }, [products, shopCategories]);

  const brands = useMemo(() => extractBrands(products), [products]);

  const priceBounds = useMemo(() => {
    let min = Infinity, max = 0;
    products.forEach(p => {
      const price = parsePrice(p.price_display);
      if (price !== null) {
        if (price < min) min = price;
        if (price > max) max = price;
      }
    });
    if (min === Infinity) return { min: 0, max: 0 };
    return { min: Math.floor(min), max: Math.ceil(max) };
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter(p => p.is_active !== false);

    // Wishlist filter
    if (showWishlistOnly) {
      list = list.filter(p => wishlistIds.includes(p.id));
    }

    // Category filter
    if (activeCategory !== "all") {
      list = list.filter(p => p.category === activeCategory);
    }

    // Brand filter (brand field > first tag fallback)
    if (activeBrand !== "all") {
      list = list.filter(p => getBrand(p) === activeBrand);
    }

    // Price filter
    const minNum = priceMin ? parseFloat(priceMin) : null;
    const maxNum = priceMax ? parseFloat(priceMax) : null;
    if (minNum !== null || maxNum !== null) {
      list = list.filter(p => {
        const price = parsePrice(p.price_display);
        if (price === null) return false;
        if (minNum !== null && price < minNum) return false;
        if (maxNum !== null && price > maxNum) return false;
        return true;
      });
    }

    // Rating filter
    if (minRating > 0) {
      list = list.filter(p => {
        const rating = parseFloat(p.rating_display) || 0;
        return rating >= minRating;
      });
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort
    const sorted = [...list];
    switch (sort) {
      case "az":
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
        break;
      case "popularity":
        sorted.sort((a, b) => {
          const aRating = parseFloat(a.rating_display) || 0;
          const bRating = parseFloat(b.rating_display) || 0;
          if (bRating !== aRating) return bRating - aRating;
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        });
        break;
      case "price_low":
        sorted.sort((a, b) => (parsePrice(a.price_display) ?? 99999) - (parsePrice(b.price_display) ?? 99999));
        break;
      case "price_high":
        sorted.sort((a, b) => (parsePrice(b.price_display) ?? 0) - (parsePrice(a.price_display) ?? 0));
        break;
      case "rating":
        sorted.sort((a, b) => (parseFloat(b.rating_display) || 0) - (parseFloat(a.rating_display) || 0));
        break;
      case "featured":
      default:
        sorted.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (a.sort_order || 0) - (b.sort_order || 0);
        });
        break;
    }
    return sorted;
  }, [products, activeCategory, activeBrand, search, sort, priceMin, priceMax, showWishlistOnly, wishlistIds]);

  // ── Anonymous analytics tracking (fire-and-forget, no UI impact) ──
  useEffect(() => {
    if (search.trim()) {
      trackSearch(search.trim(), filtered.length);
    }
  }, [search]);

  useEffect(() => {
    if (activeCategory !== "all") {
      trackCategoryFilter(activeCategory);
    }
  }, [activeCategory]);

  const featuredProducts = useMemo(
    () => products.filter(p => p.is_featured && p.is_active !== false).slice(0, 6),
    [products]
  );

  const trendingProducts = useMemo(
    () => products.filter(p => p.is_trending && p.is_active !== false).slice(0, 6),
    [products]
  );

  const bestSellerProducts = useMemo(
    () => products.filter(p => p.is_best_seller && p.is_active !== false).slice(0, 6),
    [products]
  );

  const newArrivalProducts = useMemo(
    () => products.filter(p => p.is_new_arrival && p.is_active !== false).slice(0, 6),
    [products]
  );

  // Recommended: featured or best sellers not already in trending
  const recommendedProducts = useMemo(
    () => products.filter(p => p.is_active !== false && (p.is_featured || p.is_best_seller) && !p.is_trending).slice(0, 6),
    [products]
  );

  const hasActiveFilters = activeCategory !== "all" || activeBrand !== "all" || search || priceMin || priceMax || showWishlistOnly || minRating > 0;

  const clearAllFilters = () => {
    setActiveCategory("all");
    setActiveBrand("all");
    setSearchInput("");
    setSearch("");
    setPriceMin("");
    setPriceMax("");
    setShowWishlistOnly(false);
    setMinRating(0);
    setSort("featured");
  };

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || "Sort";

  return (
    <PageLayout>
      <PageTitle
        icon={<ShoppingBag className="w-5 h-5" style={{ color: G.text }} />}
        title="Shop"
        subtitle="Curated Spiritual Tools & Products"
      />

      <div className="px-4 pb-8 space-y-5">
        {/* Hero Banner */}
        <HeroBanner products={products} />

        {/* Search Bar + Actions */}
        <div className="space-y-2.5" data-shop-search>
          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
            style={{
              background: "rgba(8,16,38,0.80)",
              border: `1px solid ${G.border}`,
            }}
          >
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: G.dim }} />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="flex-1 bg-transparent outline-none font-inter text-sm placeholder:text-white/25"
              style={{ color: "rgba(255,255,255,0.90)" }}
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(""); setSearch(""); }} className="flex-shrink-0">
                <X className="w-4 h-4" style={{ color: G.dim }} />
              </button>
            )}

            {/* Wishlist toggle */}
            <button
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className="flex-shrink-0 p-1.5 rounded-lg relative"
              style={{
                background: showWishlistOnly ? "rgba(248,113,113,0.15)" : G.bg,
                border: `1px solid ${showWishlistOnly ? "rgba(248,113,113,0.40)" : G.faint}`,
              }}
            >
              <Heart
                className="w-3.5 h-3.5"
                style={{
                  color: showWishlistOnly ? "#F87171" : G.dim,
                  fill: showWishlistOnly ? "#F87171" : "transparent",
                }}
              />
              {wishlistIds.length > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center font-inter text-[7px] font-bold"
                  style={{ background: "#F87171", color: "#fff" }}
                >
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0 p-1.5 rounded-lg"
              style={{
                background: showFilters ? G.bgHi : G.bg,
                border: `1px solid ${showFilters ? G.borderHi : G.faint}`,
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: showFilters ? G.text : G.dim }} />
            </button>

            {/* Sort dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
                style={{ background: G.bg, border: `1px solid ${G.faint}` }}
              >
                <ArrowUpDown className="w-3 h-3" style={{ color: G.text }} />
                <span className="font-inter text-[9px] font-semibold hidden sm:inline" style={{ color: G.text }}>
                  {currentSortLabel}
                </span>
                <ChevronDown className="w-3 h-3" style={{ color: G.dim }} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl overflow-hidden"
                      style={{
                        background: "rgba(5,10,28,0.98)",
                        border: `1px solid ${G.border}`,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.60)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSort(opt.value); setSortOpen(false); }}
                          className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors hover:bg-white/5"
                          style={{
                            background: sort === opt.value ? G.bg : "transparent",
                          }}
                        >
                          <span className="font-inter text-[11px] font-medium" style={{ color: sort === opt.value ? G.text : "rgba(255,255,255,0.70)" }}>
                            {opt.label}
                          </span>
                          {sort === opt.value && <Check className="w-3 h-3" style={{ color: G.text }} />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Currency Selector */}
            <CurrencySelector />
          </div>

          {/* Context badges — country, currency, shipping, languages */}
          <ShopBadges variant="context" />

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-xl p-3.5 space-y-3.5"
                  style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}
                >
                  {/* Brand Filter */}
                  {brands.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="font-inter text-[9px] font-bold uppercase tracking-widest" style={{ color: G.dim }}>
                        Brand
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <FilterChip active={activeBrand === "all"} onClick={() => setActiveBrand("all")}>All</FilterChip>
                        {brands.map(brand => (
                          <FilterChip key={brand} active={activeBrand === brand} onClick={() => setActiveBrand(brand)}>
                            {brand}
                          </FilterChip>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Filter */}
                  {priceBounds.max > 0 && (
                    <div className="space-y-1.5">
                      <p className="font-inter text-[9px] font-bold uppercase tracking-widest" style={{ color: G.dim }}>
                        Price Range
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={priceMin}
                          onChange={e => setPriceMin(e.target.value)}
                          placeholder={`Min (${priceBounds.min})`}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-transparent outline-none font-inter text-xs"
                          style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }}
                        />
                        <span style={{ color: G.dim }}>—</span>
                        <input
                          type="number"
                          value={priceMax}
                          onChange={e => setPriceMax(e.target.value)}
                          placeholder={`Max (${priceBounds.max})`}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-transparent outline-none font-inter text-xs"
                          style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Rating Filter */}
                  <div className="space-y-1.5">
                    <p className="font-inter text-[9px] font-bold uppercase tracking-widest" style={{ color: G.dim }}>
                      Minimum Rating
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {[0, 3, 3.5, 4, 4.5].map(r => (
                        <FilterChip key={r} active={minRating === r} onClick={() => setMinRating(r)}>
                          {r === 0 ? "All Ratings" : `${r}+ ★`}
                        </FilterChip>
                      ))}
                    </div>
                  </div>

                  {/* Clear All */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="font-inter text-[10px] font-bold underline"
                      style={{ color: G.text }}
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Chips */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <FilterChip key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
                {cat === "all" ? "All Products" : cat}
              </FilterChip>
            ))}
          </div>
        )}

        {/* Home Sections — curated browsing (hidden when searching/filtering) */}
        {!search && !hasActiveFilters && !showWishlistOnly && activeCategory === "all" && (
          <ShopHomeSections
            products={products}
            onCategorySelect={(cat) => setActiveCategory(cat)}
          />
        )}

        {/* Results count */}
        {!loading && (
          <div className="flex items-center justify-between">
            <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
            </p>
            {showWishlistOnly && (
              <span className="font-inter text-[10px] font-bold flex items-center gap-1" style={{ color: "#F87171" }}>
                <Heart className="w-2.5 h-2.5" style={{ fill: "#F87171" }} />
                Wishlist view
              </span>
            )}
          </div>
        )}

        {/* Shop Sections (only when no filters) */}
        {!hasActiveFilters && !showWishlistOnly && sort === "featured" && (
          <div className="space-y-5">
            {trendingProducts.length > 0 && (
              <ShopSectionRow icon={TrendingUp} title="Trending Now" products={trendingProducts} />
            )}
            {featuredProducts.length > 0 && (
              <ShopSectionRow icon={Star} title="Featured Products" products={featuredProducts} />
            )}
            {bestSellerProducts.length > 0 && (
              <ShopSectionRow icon={Flame} title="Best Sellers" products={bestSellerProducts} />
            )}
            {newArrivalProducts.length > 0 && (
              <ShopSectionRow icon={Sparkles} title="New Arrivals" products={newArrivalProducts} />
            )}
            {recommendedProducts.length > 0 && (
              <ShopSectionRow icon={Sparkles} title="Recommended for You" products={recommendedProducts} />
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : filtered.length === 0 ? (
          showWishlistOnly ? (
            <EmptyWishlistState />
          ) : products.length === 0 ? (
            <EmptyShopState />
          ) : (
            <EmptySearchState query={search} onClear={clearAllFilters} />
          )
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Recently Viewed */}
        {!loading && !showWishlistOnly && recentlyViewed.length > 0 && (
          <RelatedProducts title="Recently Viewed" icon={Clock} products={recentlyViewed} isRecent />
        )}
      </div>

      {/* Compare tray */}
      <CompareBar products={products} />
    </PageLayout>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="flex-shrink-0 px-3 py-1.5 rounded-xl border font-inter text-[10px] font-semibold uppercase tracking-widest transition-all"
      style={{
        background: active ? "rgba(212,175,55,0.14)" : "transparent",
        borderColor: active ? "rgba(212,175,55,0.55)" : "rgba(212,175,55,0.14)",
        color: active ? "#F5D060" : "rgba(212,175,55,0.40)",
        boxShadow: active ? "0 0 14px rgba(212,175,55,0.18)" : "none",
      }}
    >
      {children}
    </motion.button>
  );
}
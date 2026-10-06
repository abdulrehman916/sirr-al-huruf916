import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Star, ExternalLink, Heart, Share2, Check } from "lucide-react";
import { isInWishlist, toggleWishlist, shareProduct, getBrand } from "@/lib/shopUtils";
import { trackProductView, trackShareClick } from "@/lib/shopAnalytics";
import { useToast } from "@/components/ui/use-toast";
import { ProductBadgesOverlay } from "./ProductBadges";
import { CompareButton } from "./CompareBar";
import PriceDisplay from "./PriceDisplay";
import MarketplaceButtons from "./MarketplaceButtons";
import ShopBadges from "./ShopBadges";

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

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wished, setWished] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const primaryImage = product.images?.[product.thumbnail_index || 0];
  const hasAffiliate = product.affiliate_links?.length > 0;

  useEffect(() => {
    setWished(isInWishlist(product.id));
    const handler = () => setWished(isInWishlist(product.id));
    window.addEventListener("shop-wishlist-changed", handler);
    return () => window.removeEventListener("shop-wishlist-changed", handler);
  }, [product.id]);

  const handleClick = () => {
    trackProductView(product.id, product.name);
    navigate(`/shop/${product.slug || product.id}`);
  };

  const handleBuy = (e, link) => {
    e.stopPropagation();
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  const handleWish = (e) => {
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    setWished(added);
    toast({
      title: added ? "Added to wishlist" : "Removed from wishlist",
      duration: 1800,
    });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    trackShareClick(product.id, product.name);
    shareProduct(product);
    toast({ title: "Share link copied", duration: 1800 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
      onClick={handleClick}
      className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.95) 0%, rgba(4,10,24,0.98) 100%)",
        border: `1px solid ${G.border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
      }}
      whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.60), 0 0 24px rgba(212,175,55,0.15)" }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
        {!imgLoaded && (
          <div className="absolute inset-0 shimmer" style={{ background: "rgba(255,255,255,0.04)" }} />
        )}
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            style={{
              opacity: imgLoaded ? 1 : 0,
              filter: imgLoaded ? "blur(0px)" : "blur(15px)",
              transition: "opacity 0.5s ease, filter 0.5s ease, transform 0.7s ease",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10" style={{ color: G.dim, opacity: 0.4 }} />
          </div>
        )}

        {/* Top overlay row — category + actions */}
        <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-2">
          {/* Category badge */}
          {product.category && (
            <div
              className="px-2 py-0.5 rounded-md font-inter text-[8px] font-bold uppercase tracking-wider"
              style={{
                background: "rgba(2,7,16,0.85)",
                border: `1px solid ${G.border}`,
                color: G.text,
                backdropFilter: "blur(8px)",
              }}
            >
              {product.category}
            </div>
          )}

          {/* Badges (top-left) */}
          <ProductBadgesOverlay product={product} />

          {/* Action icons (top-right) */}
          <div className="flex items-center gap-1">
            <CompareButton product={product} />
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg transition-opacity"
              style={{
                background: "rgba(2,7,16,0.80)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${G.faint}`,
                opacity: 0.85,
              }}
            >
              <Share2 className="w-3 h-3" style={{ color: "rgba(255,255,255,0.70)" }} />
            </button>
            <button
              onClick={handleWish}
              className="p-1.5 rounded-lg transition-all"
              style={{
                background: wished ? "rgba(248,113,113,0.20)" : "rgba(2,7,16,0.80)",
                backdropFilter: "blur(8px)",
                border: wished ? "1px solid rgba(248,113,113,0.50)" : `1px solid ${G.faint}`,
              }}
            >
              <Heart
                className="w-3 h-3 transition-all"
                style={{
                  color: wished ? "#F87171" : "rgba(255,255,255,0.70)",
                  fill: wished ? "#F87171" : "transparent",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-2">
        <h3
          className="font-inter text-sm font-bold leading-tight line-clamp-2 transition-colors group-hover:text-white"
          style={{ color: "rgba(255,255,255,0.92)" }}
        >
          {product.name}
        </h3>

        {getBrand(product) && (
          <p className="font-inter text-[10px] font-semibold uppercase tracking-wider" style={{ color: G.dim }}>
            {getBrand(product)}
          </p>
        )}

        {product.short_description && (
          <p
            className="font-inter text-[11px] leading-relaxed line-clamp-2"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            {product.short_description}
          </p>
        )}

        {/* Country-aware shop badges */}
        <ShopBadges product={product} variant="compact" />

        {/* Rating + Price */}
        <div className="flex items-center justify-between pt-1">
          {product.rating_display ? (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(n => {
                  const ratingNum = parseFloat(product.rating_display) || 0;
                  return (
                    <Star
                      key={n}
                      className="w-2.5 h-2.5"
                      style={{
                        color: n <= Math.round(ratingNum) ? G.text : G.faint,
                        fill: n <= Math.round(ratingNum) ? G.text : "transparent",
                      }}
                    />
                  );
                })}
              </div>
              <span className="font-inter text-[10px] font-semibold" style={{ color: G.text }}>
                {product.rating_display}
              </span>
            </div>
          ) : (
            <span />
          )}
          <PriceDisplay
            priceDisplay={product.price_display}
            comparePriceDisplay={product.compare_price_display}
            outOfStock={product.is_out_of_stock}
            size="sm"
          />
        </div>

        {/* Buy button (country-aware) */}
        <MarketplaceButtons product={product} compact />
      </div>
    </motion.div>
  );
}
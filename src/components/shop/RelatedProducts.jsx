import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ShoppingBag, Star, Clock, Sparkles } from "lucide-react";
import { Heart } from "lucide-react";
import { isInWishlist, toggleWishlist } from "@/lib/shopUtils";
import { useState, useEffect } from "react";

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

function MiniCard({ product, index, isRecent }) {
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);

  useEffect(() => {
    setWished(isInWishlist(product.id));
    const handler = () => setWished(isInWishlist(product.id));
    window.addEventListener("shop-wishlist-changed", handler);
    return () => window.removeEventListener("shop-wishlist-changed", handler);
  }, [product.id]);

  const handleClick = () => navigate(`/shop/${product.slug || product.id}`);

  const handleWish = (e) => {
    e.stopPropagation();
    setWished(toggleWishlist(product.id));
  };

  const primaryImage = product.images?.[product.thumbnail_index || 0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.2) }}
      onClick={handleClick}
      className="flex-shrink-0 w-[200px] cursor-pointer rounded-xl overflow-hidden group"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.95) 0%, rgba(4,10,24,0.98) 100%)",
        border: `1px solid ${G.faint}`,
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-black/40">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" style={{ color: G.dim, opacity: 0.3 }} />
          </div>
        )}
        {/* Heart */}
        <button
          onClick={handleWish}
          className="absolute top-1.5 right-1.5 p-1.5 rounded-lg"
          style={{ background: "rgba(2,7,16,0.80)", backdropFilter: "blur(8px)" }}
        >
          <Heart
            className="w-3 h-3"
            style={{
              color: wished ? "#F87171" : "rgba(255,255,255,0.50)",
              fill: wished ? "#F87171" : "transparent",
            }}
          />
        </button>
        {isRecent && (
          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded font-inter text-[7px] font-bold uppercase flex items-center gap-0.5" style={{ background: "rgba(2,7,16,0.85)", color: G.dim }}>
            <Clock className="w-2 h-2" /> Viewed
          </div>
        )}
      </div>
      <div className="p-2.5 space-y-1">
        <p className="font-inter text-[11px] font-bold leading-tight line-clamp-2" style={{ color: "rgba(255,255,255,0.90)" }}>
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          {product.rating_display ? (
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5" style={{ color: G.text, fill: G.text }} />
              <span className="font-inter text-[9px] font-semibold" style={{ color: G.text }}>{product.rating_display}</span>
            </div>
          ) : <span />}
          {product.price_display && (
            <span className="font-inter text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.65)" }}>{product.price_display}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function RelatedProducts({ title, icon: Icon, products = [], isRecent = false }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: G.text }} />
          <h2 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
            {title}
          </h2>
        </div>
        <span className="font-inter text-[10px]" style={{ color: G.dim }}>
          {products.length} {products.length === 1 ? "item" : "items"}
        </span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {products.map((p, i) => (
          <MiniCard key={p.id || i} product={p} index={i} isRecent={isRecent} />
        ))}
        {/* Spacer at end */}
        <div className="flex-shrink-0 w-1" />
      </div>
    </div>
  );
}
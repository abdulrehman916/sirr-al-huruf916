import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, ArrowRight } from "lucide-react";

const G = {
  text: "#F5D060", dim: "rgba(212,175,55,0.55)",
  border: "rgba(212,175,55,0.30)", glow: "rgba(212,175,55,0.18)",
  bg: "rgba(212,175,55,0.06)",
};

/**
 * Premium hero banner for the customer shop.
 * Shows a visually appealing banner with gold accents and featured product thumbnails.
 */
export default function HeroBanner({ products = [] }) {
  const featured = products.filter(p => p.is_active !== false && p.is_featured).slice(0, 4);
  const bestSellers = products.filter(p => p.is_active !== false && p.is_best_seller).slice(0, 4);
  const heroProducts = (featured.length > 0 ? featured : bestSellers).slice(0, 4);

  const scrollToProducts = () => {
    const el = document.querySelector("[data-shop-search]");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(8,16,38,0.95) 0%, rgba(4,10,24,0.98) 50%, rgba(12,20,42,0.95) 100%)",
        border: `1px solid ${G.border}`,
        boxShadow: "0 8px 40px rgba(0,0,0,0.50), inset 0 1px 0 rgba(212,175,55,0.10)",
      }}
    >
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 p-5 sm:p-6">
        {/* Title Section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: G.text }} />
            <span className="font-inter text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: G.dim }}>Premium Marketplace</span>
          </div>
          <h1 className="font-amiri text-2xl sm:text-3xl font-bold" style={{ color: G.text, textShadow: "0 0 24px rgba(212,175,55,0.30)" }}>
            Sirr al-Huruf Shop
          </h1>
          <p className="font-inter text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.60)" }}>
 Spiritual Tools, Ayurvedic Medicines, Herbal Products & More
          </p>
        </div>

        {/* Featured Product Thumbnails */}
        {heroProducts.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
            {heroProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden"
                style={{ border: `1px solid ${G.border}`, background: "rgba(0,0,0,0.40)" }}
              >
                {p.images?.[p.thumbnail_index || 0] ? (
                  <img src={p.images[p.thumbnail_index || 0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" style={{ color: G.dim, opacity: 0.3 }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={scrollToProducts}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter text-xs font-bold transition-all hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.10) 100%)",
            border: `1px solid ${G.border}`,
            color: G.text,
          }}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Browse All Products
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Bottom gold accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)" }} />
    </motion.div>
  );
}
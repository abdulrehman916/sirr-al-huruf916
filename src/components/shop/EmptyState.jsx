import { motion } from "framer-motion";
import { SearchX, ShoppingBag, Heart, PackageOpen } from "lucide-react";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
};

export function EmptySearchState({ query, onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-24 h-24 mb-5 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${G.bg} 0%, transparent 70%)`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px dashed ${G.faint}` }}
        />
        <SearchX className="w-9 h-9" style={{ color: G.dim }} />
      </motion.div>
      <h3 className="font-inter text-base font-bold mb-1.5" style={{ color: "rgba(255,255,255,0.80)" }}>
        No products found
      </h3>
      <p className="font-inter text-xs mb-4 max-w-[260px]" style={{ color: "rgba(255,255,255,0.40)" }}>
        {query
          ? `We couldn't find anything matching "${query}". Try different keywords or clear filters.`
          : "No products match your current filters."}
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="px-4 py-2 rounded-xl font-inter text-xs font-bold"
          style={{ background: G.bg, border: `1px solid ${G.faint}`, color: G.text }}
        >
          Clear Filters
        </button>
      )}
    </motion.div>
  );
}

export function EmptyShopState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-24 h-24 mb-5 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${G.bg} 0%, transparent 70%)`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px dashed ${G.faint}` }}
        />
        <PackageOpen className="w-9 h-9" style={{ color: G.dim }} />
      </motion.div>
      <h3 className="font-inter text-base font-bold mb-1.5" style={{ color: "rgba(255,255,255,0.80)" }}>
        Shop is coming soon
      </h3>
      <p className="font-inter text-xs max-w-[260px]" style={{ color: "rgba(255,255,255,0.40)" }}>
        We're curating premium spiritual tools and products. Check back shortly.
      </p>
    </motion.div>
  );
}

export function EmptyWishlistState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-20 h-20 mb-4 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${G.bg} 0%, transparent 70%)`,
        }}
      >
        <div className="absolute inset-0 rounded-full" style={{ border: `2px dashed ${G.faint}` }} />
        <Heart className="w-7 h-7" style={{ color: G.dim }} />
      </motion.div>
      <h3 className="font-inter text-sm font-bold mb-1" style={{ color: "rgba(255,255,255,0.70)" }}>
        Your wishlist is empty
      </h3>
      <p className="font-inter text-[11px] max-w-[220px]" style={{ color: "rgba(255,255,255,0.35)" }}>
        Tap the heart icon on products to save them here.
      </p>
    </motion.div>
  );
}
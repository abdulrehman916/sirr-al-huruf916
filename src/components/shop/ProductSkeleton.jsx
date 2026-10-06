import { motion } from "framer-motion";

const G = {
  border: "rgba(212,175,55,0.30)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
};

export function ProductCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.95) 0%, rgba(4,10,24,0.98) 100%)",
        border: `1px solid ${G.border}`,
      }}
    >
      {/* Image skeleton */}
      <div
        className="aspect-[4/3] shimmer"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
      {/* Content skeleton */}
      <div className="p-3.5 space-y-2">
        <div className="h-3.5 rounded shimmer" style={{ background: "rgba(255,255,255,0.06)", width: "85%" }} />
        <div className="h-3.5 rounded shimmer" style={{ background: "rgba(255,255,255,0.06)", width: "60%" }} />
        <div className="h-2.5 rounded shimmer" style={{ background: "rgba(255,255,255,0.04)", width: "70%" }} />
        <div className="flex justify-between pt-1">
          <div className="h-2.5 rounded shimmer" style={{ background: "rgba(255,255,255,0.04)", width: "40px" }} />
          <div className="h-2.5 rounded shimmer" style={{ background: "rgba(255,255,255,0.04)", width: "50px" }} />
        </div>
        <div className="h-7 rounded-lg shimmer" style={{ background: "rgba(255,255,255,0.04)" }} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
        >
          <ProductCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="px-4 pb-8 space-y-6">
      {/* Gallery skeleton */}
      <div className="aspect-square rounded-2xl shimmer" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }} />
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-4 rounded shimmer" style={{ background: "rgba(255,255,255,0.06)", width: "40%" }} />
        <div className="h-6 rounded shimmer" style={{ background: "rgba(255,255,255,0.06)", width: "80%" }} />
        <div className="h-3 rounded shimmer" style={{ background: "rgba(255,255,255,0.04)", width: "60%" }} />
      </div>
      {/* Buy button skeleton */}
      <div className="h-12 rounded-xl shimmer" style={{ background: "rgba(255,255,255,0.04)" }} />
      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="h-3 rounded shimmer" style={{ background: "rgba(255,255,255,0.04)", width: "100%" }} />
        <div className="h-3 rounded shimmer" style={{ background: "rgba(255,255,255,0.04)", width: "95%" }} />
        <div className="h-3 rounded shimmer" style={{ background: "rgba(255,255,255,0.04)", width: "70%" }} />
      </div>
    </div>
  );
}

const shimmerKeyframes = `
@keyframes shop-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 0%,
    rgba(212,175,55,0.08) 50%,
    rgba(255,255,255,0.04) 100%
  ) !important;
  background-size: 200% 100% !important;
  animation: shop-shimmer 1.8s ease-in-out infinite !important;
}
`;

// Inject keyframes once
if (typeof document !== "undefined" && !document.getElementById("shop-shimmer-style")) {
  const style = document.createElement("style");
  style.id = "shop-shimmer-style";
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}
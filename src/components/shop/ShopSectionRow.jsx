import ProductCard from "./ProductCard";

const G = {
  text: "#F5D060",
};

/**
 * Horizontal scroll row of full ProductCards (260px wide).
 * Used for Trending, Featured, Best Sellers, New Arrivals, Recommended sections.
 */
export default function ShopSectionRow({ icon: Icon, title, products = [] }) {
  if (!products || products.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" style={{ color: G.text }} />}
        <h2 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
          {title}
        </h2>
        <span className="font-inter text-[10px]" style={{ color: "rgba(212,175,55,0.55)" }}>
          {products.length}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {products.map((p, i) => (
          <div key={p.id} className="flex-shrink-0 w-[260px]">
            <ProductCard product={p} index={i} />
          </div>
        ))}
        <div className="flex-shrink-0 w-1" />
      </div>
    </div>
  );
}
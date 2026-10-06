import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, FolderTree, Tag, ShoppingCart, TrendingUp, Star, PackageX, Eye, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-xl"
      style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "15" }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>{label}</span>
      </div>
      <p className="font-inter text-xl font-bold" style={{ color: "rgba(255,255,255,0.95)" }}>{value}</p>
    </motion.div>
  );
}

function CategoryBar({ name, count, maxCount }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-inter text-[11px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.80)" }}>{name}</span>
        <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>{count}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.60), rgba(212,175,55,0.90))" }}
        />
      </div>
    </div>
  );
}

export default function ShopAnalytics() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [prods, cats, brnds, ords] = await Promise.all([
          base44.entities.Product.list("-created_date", 500),
          base44.entities.ShopCategory.list("display_order", 200),
          base44.entities.ShopBrand.list("display_order", 200),
          base44.entities.ShopOrder.list("-created_date", 200),
        ]);
        setProducts(prods || []);
        setCategories(cats || []);
        setBrands(brnds || []);
        setOrders(ords || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: "2px solid " + G.text, borderRight: "2px solid transparent" }} />
      </div>
    );
  }

  // Calculate stats
  const activeProducts = products.filter(p => p.is_active !== false).length;
  const outOfStock = products.filter(p => p.is_out_of_stock).length;
  const featured = products.filter(p => p.is_featured).length;
  const bestSellers = products.filter(p => p.is_best_seller).length;

  // Category distribution
  const catCounts = {};
  products.forEach(p => {
    if (p.category) catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  });
  const catEntries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxCatCount = catEntries.length > 0 ? catEntries[0][1] : 0;

  // Order stats
  const pendingOrders = orders.filter(o => o.status === "PENDING").length;
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4" style={{ color: G.text }} />
        <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Analytics</h2>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard icon={Package} label="Products" value={products.length} color={G.text} />
        <StatCard icon={FolderTree} label="Categories" value={categories.length} color="#60A5FA" />
        <StatCard icon={Tag} label="Brands" value={brands.length} color="#A78BFA" />
        <StatCard icon={ShoppingCart} label="Orders" value={orders.length} color="#34D399" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard icon={Eye} label="Active" value={activeProducts} color="#34D399" />
        <StatCard icon={PackageX} label="Out of Stock" value={outOfStock} color="#F87171" />
        <StatCard icon={Star} label="Featured" value={featured} color={G.text} />
        <StatCard icon={TrendingUp} label="Best Sellers" value={bestSellers} color="#FB923C" />
      </div>

      {/* Category Distribution */}
      {catEntries.length > 0 && (
        <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
          <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Products by Category</h3>
          <div className="space-y-2">
            {catEntries.map(([name, count]) => (
              <CategoryBar key={name} name={name} count={count} maxCount={maxCatCount} />
            ))}
          </div>
        </div>
      )}

      {/* Order Stats */}
      {orders.length > 0 && (
        <div className="p-4 rounded-xl space-y-2" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
          <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Order Status</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg" style={{ background: "rgba(245,208,96,0.08)" }}>
              <p className="font-inter text-lg font-bold" style={{ color: G.text }}>{pendingOrders}</p>
              <p className="font-inter text-[9px]" style={{ color: G.dim }}>PENDING</p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ background: "rgba(52,211,153,0.08)" }}>
              <p className="font-inter text-lg font-bold" style={{ color: "#34D399" }}>{deliveredOrders}</p>
              <p className="font-inter text-[9px]" style={{ color: G.dim }}>DELIVERED</p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="font-inter text-lg font-bold" style={{ color: "rgba(255,255,255,0.80)" }}>{orders.length}</p>
              <p className="font-inter text-[9px]" style={{ color: G.dim }}>TOTAL</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
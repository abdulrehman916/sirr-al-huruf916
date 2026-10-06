import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertTriangle, Star, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

function KPICard({ icon: Icon, label, value, color, sub }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-xl" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "15" }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>{label}</span>
      </div>
      <p className="font-inter text-xl font-bold" style={{ color: "rgba(255,255,255,0.95)" }}>{value}</p>
      {sub && <p className="font-inter text-[9px] mt-0.5" style={{ color: G.dim }}>{sub}</p>}
    </motion.div>
  );
}

export default function DashboardOverview({ onNavigate }) {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: "—", lowStock: [], recentOrders: [], topCategories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [products, orders, customers, categories] = await Promise.all([
          base44.entities.Product.list("-created_date", 500),
          base44.entities.ShopOrder.list("-created_date", 100),
          base44.entities.ShopCustomer.list("-created_date", 100),
          base44.entities.ShopCategory.list("display_order", 100),
        ]);

        const prods = products || [];
        const ords = orders || [];
        const custs = customers || [];

        // Low stock alerts
        const lowStock = prods.filter(p => {
          if (p.stock_quantity === -1 || p.stock_quantity === undefined) return false;
          return p.stock_quantity <= (p.low_stock_threshold || 10);
        }).slice(0, 5);

        // Top categories
        const catCounts = {};
        prods.forEach(p => { if (p.category) catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
        const topCategories = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        setStats({
          products: prods.length,
          orders: ords.length,
          customers: custs.length,
          revenue: ords.length > 0 ? `${ords.length} orders` : "—",
          lowStock,
          recentOrders: ords.slice(0, 5),
          topCategories,
        });
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: `2px solid ${G.text}`, borderRight: "2px solid transparent" }} /></div>;
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <KPICard icon={Package} label="Products" value={stats.products} color={G.text} />
        <KPICard icon={ShoppingCart} label="Orders" value={stats.orders} color="#34D399" />
        <KPICard icon={Users} label="Customers" value={stats.customers} color="#60A5FA" />
        <KPICard icon={DollarSign} label="Revenue" value={stats.revenue} color="#FB923C" sub="Total orders" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="p-4 rounded-xl space-y-2" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5" style={{ color: G.text }} />
            <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Recent Orders</h3>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="font-inter text-[11px] py-4 text-center" style={{ color: "rgba(255,255,255,0.30)" }}>No orders yet</p>
          ) : stats.recentOrders.map(o => (
            <div key={o.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <span className="font-inter text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: G.bg, color: G.text }}>{o.order_id?.slice(-6)}</span>
              <span className="font-inter text-[11px] flex-1 truncate" style={{ color: "rgba(255,255,255,0.80)" }}>{o.customer_name}</span>
              <span className="font-inter text-[10px]" style={{ color: G.dim }}>{o.status}</span>
            </div>
          ))}
        </div>

        {/* Low Stock Alerts */}
        <div className="p-4 rounded-xl space-y-2" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#F87171" }} />
            <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: "#F87171" }}>Low Stock Alerts</h3>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="font-inter text-[11px] py-4 text-center" style={{ color: "rgba(255,255,255,0.30)" }}>All products well stocked</p>
          ) : stats.lowStock.map(p => (
            <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(248,113,113,0.05)" }}>
              <Package className="w-3 h-3" style={{ color: "#F87171" }} />
              <span className="font-inter text-[11px] flex-1 truncate" style={{ color: "rgba(255,255,255,0.80)" }}>{p.name}</span>
              <span className="font-inter text-[10px] font-bold" style={{ color: p.stock_quantity === 0 ? "#F87171" : "#FB923C" }}>
                {p.stock_quantity === 0 ? "OUT" : `${p.stock_quantity} left`}
              </span>
            </div>
          ))}
          {stats.lowStock.length > 0 && (
            <button onClick={() => onNavigate("inventory")} className="w-full py-1.5 rounded-lg font-inter text-[10px] font-bold" style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}>
              Manage Inventory →
            </button>
          )}
        </div>
      </div>

      {/* Top Categories */}
      {stats.topCategories.length > 0 && (
        <div className="p-4 rounded-xl space-y-2" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: G.text }} />
            <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Top Categories</h3>
          </div>
          <div className="space-y-1.5">
            {stats.topCategories.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="font-inter text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.80)" }}>{name}</span>
                <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>{count} products</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
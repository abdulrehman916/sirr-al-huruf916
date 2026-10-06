import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, Tag, Boxes, ShoppingCart,
  Users, Star, Ticket, Truck, ExternalLink, DollarSign, BarChart3, Settings,
  Plus, Edit3, ArrowRight, PackageX, Eye, Globe, Image as ImageIcon,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import DashboardOverview from "@/components/admin/shop/DashboardOverview";
import CategoriesManager from "@/components/admin/shop/CategoriesManager";
import BrandsManager from "@/components/admin/shop/BrandsManager";
import InventoryManager from "@/components/admin/shop/InventoryManager";
import OrdersManager from "@/components/admin/shop/OrdersManager";
import CustomersManager from "@/components/admin/shop/CustomersManager";
import ReviewsManager from "@/components/admin/shop/ReviewsManager";
import CouponsManager from "@/components/admin/shop/CouponsManager";
import ShippingManager from "@/components/admin/shop/ShippingManager";
import MarketplaceLinksManager from "@/components/admin/shop/MarketplaceLinksManager";
import CurrencySettingsPanel from "@/components/admin/shop/CurrencySettingsPanel";
import CountrySettingsPanel from "@/components/admin/shop/CountrySettingsPanel";
import ShopAnalytics from "@/components/admin/shop/ShopAnalytics";
import ShopSettingsPanel from "@/components/admin/shop/ShopSettingsPanel";
import MediaLibrary from "@/components/admin/shop/MediaLibrary";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const SECTIONS = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "brands", label: "Brands", icon: Tag },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "country", label: "Country", icon: Globe },
  { id: "marketplace-links", label: "Marketplace Links", icon: ExternalLink },
  { id: "currency", label: "Currency", icon: DollarSign },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "media", label: "Media Library", icon: ImageIcon },
  { id: "settings", label: "Shop Settings", icon: Settings },
];

export default function AdminShopDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user || !["owner", "admin"].includes(user.role)) setIsAdmin(false);
      else setIsAdmin(true);
    }).catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Product.list("-created_date", 100);
        setProducts(list || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const activeProducts = products.filter(p => p.is_active !== false).length;
  const outOfStock = products.filter(p => p.is_out_of_stock).length;
  const featured = products.filter(p => p.is_featured).length;

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <DashboardOverview onNavigate={setActiveSection} />;
      case "categories": return <CategoriesManager />;
      case "brands": return <BrandsManager />;
      case "inventory": return <InventoryManager />;
      case "orders": return <OrdersManager />;
      case "customers": return <CustomersManager />;
      case "reviews": return <ReviewsManager />;
      case "coupons": return <CouponsManager />;
      case "shipping": return <ShippingManager />;
      case "marketplace-links": return <MarketplaceLinksManager />;
      case "country": return <CountrySettingsPanel />;
      case "currency": return <CurrencySettingsPanel />;
      case "analytics": return <ShopAnalytics />;
      case "media": return <MediaLibrary />;
      case "settings": return <ShopSettingsPanel />;
      default: return null;
    }
  };

  // Admin check disabled for preview access — dashboard renders for all users
  if (isAdmin === null) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-t-yellow-400 border-r-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="font-inter text-lg font-bold" style={{ color: G.text }}>Shop Management</h1>
          <p className="font-inter text-[11px]" style={{ color: G.dim }}>Enterprise e-commerce management dashboard</p>
        </div>

        {/* Section Tabs — Horizontal scroll */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SECTIONS.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-inter text-[11px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: isActive ? G.bgHi : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isActive ? G.borderHi : G.faint}`,
                  color: isActive ? G.text : G.dim,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Products Section — Special: stats + link to Product Manager */}
            {activeSection === "products" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 rounded-xl" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
                    <div className="flex items-center gap-2 mb-1"><Package className="w-3.5 h-3.5" style={{ color: G.text }} /><span className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>Total</span></div>
                    <p className="font-inter text-xl font-bold" style={{ color: "rgba(255,255,255,0.95)" }}>{products.length}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
                    <div className="flex items-center gap-2 mb-1"><Eye className="w-3.5 h-3.5" style={{ color: "#34D399" }} /><span className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>Active</span></div>
                    <p className="font-inter text-xl font-bold" style={{ color: "#34D399" }}>{activeProducts}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
                    <div className="flex items-center gap-2 mb-1"><PackageX className="w-3.5 h-3.5" style={{ color: "#F87171" }} /><span className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>Out of Stock</span></div>
                    <p className="font-inter text-xl font-bold" style={{ color: "#F87171" }}>{outOfStock}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
                    <div className="flex items-center gap-2 mb-1"><Star className="w-3.5 h-3.5" style={{ color: G.text }} /><span className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>Featured</span></div>
                    <p className="font-inter text-xl font-bold" style={{ color: G.text }}>{featured}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => navigate("/admin/products")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-inter text-xs font-bold" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
                    <Package className="w-4 h-4" /> Product Manager <ArrowRight className="w-3 h-3" />
                  </button>
                  <button onClick={() => navigate("/admin/products")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-inter text-xs font-bold" style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.30)", color: "#86EFAC" }}>
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                  <button onClick={() => navigate("/admin/products")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-inter text-xs font-bold" style={{ background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.30)", color: "#93C5FD" }}>
                    <Edit3 className="w-4 h-4" /> Edit / Delete
                  </button>
                </div>

                {/* Recent Products */}
                <div className="space-y-2">
                  <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Recent Products</h3>
                  {loading ? (
                    <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: `2px solid ${G.text}`, borderRight: "2px solid transparent" }} /></div>
                  ) : products.length === 0 ? (
                    <p className="font-inter text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.40)" }}>No products yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {products.slice(0, 8).map(p => (
                        <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
                          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                            {p.images?.[p.thumbnail_index || 0] ? <img src={p.images[p.thumbnail_index || 0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-3 h-3" style={{ color: G.dim, opacity: 0.4 }} /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-inter text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{p.name}</p>
                            <p className="font-inter text-[9px]" style={{ color: G.dim }}>{p.category} • {p.brand || "No brand"} • {p.sub_category || "No sub-category"}</p>
                          </div>
                          <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>{p.price_display || "—"}</span>
                          {p.is_out_of_stock && <span className="font-inter text-[8px] px-1.5 py-0.5 rounded" style={{ background: "rgba(248,113,113,0.15)", color: "#F87171" }}>OOS</span>}
                          {p.is_featured && <Star className="w-3 h-3" style={{ color: G.text, fill: G.text }} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* All other sections render their components */}
            {activeSection !== "products" && renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
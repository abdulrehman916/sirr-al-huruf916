import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Trash2, ShoppingCart, Save, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const STATUS_COLORS = {
  PENDING: "#F5D060", CONFIRMED: "#60A5FA", SHIPPED: "#A78BFA",
  DELIVERED: "#34D399", CANCELLED: "#F87171", REFUNDED: "#FB923C",
};

export default function OrdersManager() {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_name: "", customer_email: "", customer_phone: "", customer_country: "AE", total_value: "", marketplace: "Amazon", notes: "" });

  const load = async () => {
    try {
      setLoading(true);
      const list = await base44.entities.ShopOrder.list("-created_date", 200);
      setOrders(list || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.customer_name.trim()) return;
    try {
      const orderId = `ORD-${Date.now()}`;
      await base44.entities.ShopOrder.create({
        ...form,
        order_id: orderId,
        status: "PENDING",
        items: [],
        ordered_at: new Date().toISOString(),
      });
      toast({ title: "Order created", description: orderId });
      setShowForm(false);
      setForm({ customer_name: "", customer_email: "", customer_phone: "", customer_country: "AE", total_value: "", marketplace: "Amazon", notes: "" });
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateStatus = async (order, newStatus) => {
    try {
      await base44.entities.ShopOrder.update(order.id, { status: newStatus, updated_at: new Date().toISOString() });
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this order?")) return;
    try {
      await base44.entities.ShopOrder.delete(id);
      toast({ title: "Order deleted" });
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" style={{ color: G.text }} />
          <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Orders ({orders.length})</h2>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-xs font-bold" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <Plus className="w-3.5 h-3.5" /> Add Order
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: "2px solid " + G.text, borderRight: "2px solid transparent" }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCart className="w-10 h-10 mx-auto mb-2" style={{ color: G.dim, opacity: 0.3 }} />
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg space-y-2"
              style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: G.bg, color: G.text }}>{order.order_id}</span>
                  <span className="font-inter text-xs font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order, e.target.value)}
                      className="appearance-none px-2 py-1 pr-6 rounded-md font-inter text-[10px] font-bold cursor-pointer outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${STATUS_COLORS[order.status] || G.dim}55`, color: STATUS_COLORS[order.status] || G.text }}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: G.dim }} />
                  </div>
                  <button onClick={() => handleDelete(order.id)} className="p-1 rounded hover:bg-white/5">
                    <Trash2 className="w-3 h-3" style={{ color: "#F87171" }} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {order.customer_country && <span className="font-inter text-[10px]" style={{ color: G.dim }}>🌍 {order.customer_country}</span>}
                {order.marketplace && <span className="font-inter text-[10px]" style={{ color: G.dim }}>🛒 {order.marketplace}</span>}
                {order.total_value && <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>{order.total_value}</span>}
                {(order.items || []).length > 0 && <span className="font-inter text-[10px]" style={{ color: G.dim }}>{order.items.length} items</span>}
                {order.customer_email && <span className="font-inter text-[10px]" style={{ color: G.dim }}>✉️ {order.customer_email}</span>}
                {order.customer_phone && <span className="font-inter text-[10px]" style={{ color: G.dim }}>📱 {order.customer_phone}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full lg:w-[400px] rounded-t-2xl lg:rounded-2xl p-5 space-y-3"
            style={{ background: "linear-gradient(180deg, rgba(5,10,28,0.99) 0%, rgba(2,5,16,1) 100%)", border: `1px solid ${G.border}` }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-inter text-sm font-bold" style={{ color: G.text }}>New Order</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4" style={{ color: G.dim }} /></button>
            </div>
            <div className="space-y-2">
              <input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Customer name *" />
              <input value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Email" />
              <input value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Phone/WhatsApp" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.customer_country} onChange={e => setForm({ ...form, customer_country: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.60)" }}>
                  {["AE", "IN", "SA", "US", "GB", "QA", "KW", "BH", "OM"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.marketplace} onChange={e => setForm({ ...form, marketplace: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.60)" }}>
                  {["Amazon", "Flipkart", "Noon", "External", "WhatsApp", "Email"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <input value={form.total_value} onChange={e => setForm({ ...form, total_value: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Total value e.g. AED 150" />
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs resize-none" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Notes..." />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-inter text-xs font-bold" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
                <Save className="w-3.5 h-3.5" /> Create Order
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg font-inter text-xs font-bold" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.50)" }}>Cancel</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
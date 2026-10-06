import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Edit3, Trash2, Ticket, Save, Percent, DollarSign, Truck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const TYPE_ICONS = { PERCENTAGE: Percent, FIXED: DollarSign, FREE_SHIPPING: Truck };
const TYPE_LABELS = { PERCENTAGE: "% Off", FIXED: "AED Off", FREE_SHIPPING: "Free Shipping" };

export default function CouponsManager() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ coupon_code: "", description: "", discount_type: "PERCENTAGE", discount_value: 10, min_order_value: 0, max_uses: -1, max_uses_per_customer: 1, is_active: true, valid_until: "" });

  const load = async () => {
    try {
      setLoading(true);
      const list = await base44.entities.ShopCoupon.list("-created_date", 200);
      setCoupons(list || []);
    } catch { setCoupons([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.coupon_code.trim()) return;
    try {
      const now = new Date().toISOString();
      const data = { ...form, coupon_code: form.coupon_code.toUpperCase().trim(), valid_until: form.valid_until || null, updated_at: now };
      if (editId) {
        await base44.entities.ShopCoupon.update(editId, data);
        toast({ title: "Coupon updated" });
      } else {
        await base44.entities.ShopCoupon.create({ ...data, created_at: now, use_count: 0 });
        toast({ title: "Coupon created" });
      }
      setShowForm(false);
      setForm({ coupon_code: "", description: "", discount_type: "PERCENTAGE", discount_value: 10, min_order_value: 0, max_uses: -1, max_uses_per_customer: 1, is_active: true, valid_until: "" });
      setEditId(null);
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try { await base44.entities.ShopCoupon.delete(id); toast({ title: "Coupon deleted" }); load(); }
    catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const toggleActive = async (c) => {
    try { await base44.entities.ShopCoupon.update(c.id, { is_active: !c.is_active }); load(); }
    catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const openEdit = (c) => {
    setForm({ coupon_code: c.coupon_code, description: c.description || "", discount_type: c.discount_type, discount_value: c.discount_value, min_order_value: c.min_order_value || 0, max_uses: c.max_uses ?? -1, max_uses_per_customer: c.max_uses_per_customer ?? 1, is_active: c.is_active !== false, valid_until: c.valid_until || "" });
    setEditId(c.id);
    setShowForm(true);
  };

  const isExpired = (c) => c.valid_until && new Date(c.valid_until) < new Date();
  const isExhausted = (c) => c.max_uses >= 0 && c.use_count >= c.max_uses;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4" style={{ color: G.text }} />
          <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Coupons ({coupons.length})</h2>
        </div>
        <button onClick={() => { setForm({ coupon_code: "", description: "", discount_type: "PERCENTAGE", discount_value: 10, min_order_value: 0, max_uses: -1, max_uses_per_customer: 1, is_active: true, valid_until: "" }); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-xs font-bold" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <Plus className="w-3.5 h-3.5" /> Add Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: `2px solid ${G.text}`, borderRight: "2px solid transparent" }} /></div>
      ) : coupons.length === 0 ? (
        <p className="font-inter text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.40)" }}>No coupons yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {coupons.map(c => {
            const Icon = TYPE_ICONS[c.discount_type] || Percent;
            const expired = isExpired(c);
            const exhausted = isExhausted(c);
            const active = c.is_active !== false && !expired && !exhausted;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg space-y-1.5" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${active ? G.faint : G.faint}`, opacity: active ? 1 : 0.5 }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: G.bg }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: G.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-xs font-bold" style={{ color: G.text }}>{c.coupon_code}</p>
                    <p className="font-inter text-[9px]" style={{ color: G.dim }}>{c.discount_value} {TYPE_LABELS[c.discount_type]}</p>
                  </div>
                  <span className="font-inter text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: active ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)", color: active ? "#34D399" : "#F87171" }}>
                    {expired ? "EXPIRED" : exhausted ? "EXHAUSTED" : active ? "ACTIVE" : "DISABLED"}
                  </span>
                  <button onClick={() => toggleActive(c)} className="p-1 rounded hover:bg-white/5"><Ticket className="w-3 h-3" style={{ color: active ? G.text : G.dim }} /></button>
                  <button onClick={() => openEdit(c)} className="p-1 rounded hover:bg-white/5"><Edit3 className="w-3 h-3" style={{ color: G.text }} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1 rounded hover:bg-white/5"><Trash2 className="w-3 h-3" style={{ color: "#F87171" }} /></button>
                </div>
                {c.description && <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>{c.description}</p>}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-inter text-[9px]" style={{ color: G.dim }}>Uses: {c.use_count || 0}/{c.max_uses < 0 ? "∞" : c.max_uses}</span>
                  {c.min_order_value > 0 && <span className="font-inter text-[9px]" style={{ color: G.dim }}>Min: AED {c.min_order_value}</span>}
                  {c.valid_until && <span className="font-inter text-[9px]" style={{ color: G.dim }}>Until: {new Date(c.valid_until).toLocaleDateString()}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setShowForm(false)}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={e => e.stopPropagation()}
            className="w-full lg:w-[420px] rounded-t-2xl lg:rounded-2xl p-5 space-y-3 max-h-[90vh] overflow-y-auto" style={{ background: "linear-gradient(180deg, rgba(5,10,28,0.99) 0%, rgba(2,5,16,1) 100%)", border: `1px solid ${G.border}` }}>
            <div className="flex items-center justify-between sticky top-0" style={{ background: "rgba(5,10,28,0.95)" }}>
              <h3 className="font-inter text-sm font-bold" style={{ color: G.text }}>{editId ? "Edit Coupon" : "New Coupon"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4" style={{ color: G.dim }} /></button>
            </div>
            <input value={form.coupon_code} onChange={e => setForm({ ...form, coupon_code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs font-bold tracking-wider" style={{ border: `1px solid ${G.border}`, color: G.text }} placeholder="COUPON CODE *" />
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Description" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.60)" }}>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount (AED)</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
              <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Value" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={form.min_order_value} onChange={e => setForm({ ...form, min_order_value: parseFloat(e.target.value) || 0 })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Min order (AED)" />
              <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: parseInt(e.target.value) || -1 })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Max uses (-1=∞)" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={form.max_uses_per_customer} onChange={e => setForm({ ...form, max_uses_per_customer: parseInt(e.target.value) || 1 })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Per customer" />
              <input type="date" value={form.valid_until ? form.valid_until.slice(0, 10) : ""} onChange={e => setForm({ ...form, valid_until: e.target.value ? new Date(e.target.value).toISOString() : "" })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 cursor-pointer" style={{ accentColor: "#D4AF37" }} />
              <span className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.70)" }}>Active</span>
            </label>
            <div className="flex gap-2 pt-1 sticky bottom-0" style={{ background: "rgba(5,10,28,0.95)" }}>
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-inter text-xs font-bold" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
                <Save className="w-3.5 h-3.5" /> {editId ? "Update" : "Create"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg font-inter text-xs font-bold" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.50)" }}>Cancel</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
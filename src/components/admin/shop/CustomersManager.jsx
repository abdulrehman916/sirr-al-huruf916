import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Edit3, Trash2, Users, Save, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const STATUS_COLORS = { ACTIVE: "#34D399", BLOCKED: "#F87171", VIP: G.text, NEW: "#60A5FA" };

export default function CustomersManager() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", whatsapp: "", country: "AE", city: "", address: "", status: "NEW", notes: "" });

  const load = async () => {
    try {
      setLoading(true);
      const list = await base44.entities.ShopCustomer.list("-created_date", 200);
      setCustomers(list || []);
    } catch { setCustomers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      const now = new Date().toISOString();
      if (editId) {
        await base44.entities.ShopCustomer.update(editId, { ...form, updated_at: now });
        toast({ title: "Customer updated" });
      } else {
        await base44.entities.ShopCustomer.create({ ...form, customer_id: `CUS-${Date.now()}`, created_at: now, total_orders: 0, wishlist_count: 0 });
        toast({ title: "Customer created" });
      }
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", whatsapp: "", country: "AE", city: "", address: "", status: "NEW", notes: "" });
      setEditId(null);
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;
    try { await base44.entities.ShopCustomer.delete(id); toast({ title: "Customer deleted" }); load(); }
    catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const openEdit = (c) => {
    setForm({ name: c.name, email: c.email || "", phone: c.phone || "", whatsapp: c.whatsapp || "", country: c.country || "AE", city: c.city || "", address: c.address || "", status: c.status || "NEW", notes: c.notes || "" });
    setEditId(c.id);
    setShowForm(true);
  };

  const filtered = customers.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: G.text }} />
          <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Customers ({customers.length})</h2>
        </div>
        <button onClick={() => { setForm({ name: "", email: "", phone: "", whatsapp: "", country: "AE", city: "", address: "", status: "NEW", notes: "" }); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-xs font-bold" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <Plus className="w-3.5 h-3.5" /> Add Customer
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="w-3.5 h-3.5" style={{ color: G.dim }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone..."
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} />
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: `2px solid ${G.text}`, borderRight: "2px solid transparent" }} /></div>
      ) : filtered.length === 0 ? (
        <p className="font-inter text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.40)" }}>No customers found.</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(c => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: G.bg }}>
                <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>{c.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-inter text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{c.name}</p>
                  <span className="font-inter text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: (STATUS_COLORS[c.status] || G.dim) + "20", color: STATUS_COLORS[c.status] || G.dim }}>{c.status}</span>
                </div>
                <p className="font-inter text-[9px] truncate" style={{ color: G.dim }}>{c.email || c.phone || "No contact"} • {c.country || "—"}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-inter text-[10px] font-bold" style={{ color: G.text }}>{c.total_orders || 0} orders</p>
                <p className="font-inter text-[9px]" style={{ color: G.dim }}>{c.total_spent_display || "—"}</p>
              </div>
              <button onClick={() => openEdit(c)} className="p-1 rounded hover:bg-white/5"><Edit3 className="w-3 h-3" style={{ color: G.text }} /></button>
              <button onClick={() => handleDelete(c.id)} className="p-1 rounded hover:bg-white/5"><Trash2 className="w-3 h-3" style={{ color: "#F87171" }} /></button>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setShowForm(false)}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={e => e.stopPropagation()}
            className="w-full lg:w-[420px] rounded-t-2xl lg:rounded-2xl p-5 space-y-3 max-h-[90vh] overflow-y-auto" style={{ background: "linear-gradient(180deg, rgba(5,10,28,0.99) 0%, rgba(2,5,16,1) 100%)", border: `1px solid ${G.border}` }}>
            <div className="flex items-center justify-between sticky top-0" style={{ background: "rgba(5,10,28,0.95)" }}>
              <h3 className="font-inter text-sm font-bold" style={{ color: G.text }}>{editId ? "Edit Customer" : "New Customer"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4" style={{ color: G.dim }} /></button>
            </div>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Name *" />
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Email" />
            <div className="grid grid-cols-2 gap-2">
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Phone" />
              <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="WhatsApp" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.60)" }}>
                {["AE", "IN", "SA", "US", "GB", "QA", "KW", "BH", "OM"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.60)" }}>
                {["NEW", "ACTIVE", "VIP", "BLOCKED"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="City" />
            <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs resize-none" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Shipping address" />
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs resize-none" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="Admin notes" />
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
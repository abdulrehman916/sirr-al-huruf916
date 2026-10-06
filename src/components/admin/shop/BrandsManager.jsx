import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Edit3, Trash2, Eye, EyeOff, Tag, Save } from "lucide-react";
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

const COUNTRY_OPTIONS = [
  { code: "", label: "Global" },
  { code: "AE", label: "UAE" },
  { code: "IN", label: "India" },
  { code: "SA", label: "Saudi Arabia" },
  { code: "US", label: "USA" },
  { code: "GB", label: "UK" },
];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function BrandsManager() {
  const { toast } = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", logo_url: "", country: "", is_active: true });

  const load = async () => {
    try {
      setLoading(true);
      const list = await base44.entities.ShopBrand.list("display_order", 200);
      setBrands(list || []);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: "", slug: "", logo_url: "", country: "", is_active: true });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (brand) => {
    setForm({ name: brand.name, slug: brand.slug, logo_url: brand.logo_url || "", country: brand.country || "", is_active: brand.is_active !== false });
    setEditId(brand.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const slug = form.slug.trim() || slugify(form.name);
    const now = new Date().toISOString();
    try {
      if (editId) {
        await base44.entities.ShopBrand.update(editId, { ...form, slug, updated_at: now });
        toast({ title: "Brand updated" });
      } else {
        const maxOrder = brands.reduce((mx, b) => Math.max(mx, b.display_order || 0), 0);
        await base44.entities.ShopBrand.create({ ...form, slug, display_order: maxOrder + 1, updated_at: now });
        toast({ title: "Brand created" });
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this brand?")) return;
    try {
      await base44.entities.ShopBrand.delete(id);
      toast({ title: "Brand deleted" });
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (brand) => {
    try {
      await base44.entities.ShopBrand.update(brand.id, { is_active: !brand.is_active, updated_at: new Date().toISOString() });
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4" style={{ color: G.text }} />
          <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Brands ({brands.length})</h2>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-xs font-bold" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <Plus className="w-3.5 h-3.5" /> Add Brand
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: "2px solid " + G.text, borderRight: "2px solid transparent" }} />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-8">
          <Tag className="w-10 h-10 mx-auto mb-2" style={{ color: G.dim, opacity: 0.3 }} />
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>No brands yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {brands.map((brand) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-2.5 rounded-lg"
              style={{ background: brand.is_active === false ? "rgba(255,255,255,0.02)" : "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}`, opacity: brand.is_active === false ? 0.5 : 1 }}
            >
              {brand.logo_url ? (
                <img src={brand.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: G.bg }}>
                  <Tag className="w-3.5 h-3.5" style={{ color: G.dim }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.90)" }}>{brand.name}</p>
                <p className="font-inter text-[9px]" style={{ color: G.dim }}>{brand.country || "Global"}</p>
              </div>
              <button onClick={() => toggleActive(brand)} className="p-1 rounded hover:bg-white/5">
                {brand.is_active === false ? <EyeOff className="w-3 h-3" style={{ color: G.dim }} /> : <Eye className="w-3 h-3" style={{ color: G.text }} />}
              </button>
              <button onClick={() => openEdit(brand)} className="p-1 rounded hover:bg-white/5">
                <Edit3 className="w-3 h-3" style={{ color: G.text }} />
              </button>
              <button onClick={() => handleDelete(brand.id)} className="p-1 rounded hover:bg-white/5">
                <Trash2 className="w-3 h-3" style={{ color: "#F87171" }} />
              </button>
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
              <h3 className="font-inter text-sm font-bold" style={{ color: G.text }}>{editId ? "Edit Brand" : "New Brand"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4" style={{ color: G.dim }} /></button>
            </div>
            <div className="space-y-2">
              <div>
                <p className="font-inter text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: G.dim }}>Name *</p>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="e.g. Dabur" />
              </div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: G.dim }}>Logo URL (optional)</p>
                <input value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="https://..." />
              </div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: G.dim }}>Country</p>
                <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.60)" }}>
                  {COUNTRY_OPTIONS.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 cursor-pointer" style={{ accentColor: "#D4AF37" }} />
                <span className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.70)" }}>Active (visible on storefront)</span>
              </label>
            </div>
            <div className="flex gap-2 pt-1">
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
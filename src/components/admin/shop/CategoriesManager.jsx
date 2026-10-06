import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Edit3, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, FolderTree, Save } from "lucide-react";
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

const EMOJI_CHOICES = ["📚", "🌿", "💊", "🛢️", "💧", "✨", "📷", "📱", "🍽️", "🍬", "🕯️", "📿", "🧴", "🪔", "📦"];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function CategoriesManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "📦", description: "", is_active: true, parent_id: "" });

  const load = async () => {
    try {
      setLoading(true);
      const list = await base44.entities.ShopCategory.list("display_order", 200);
      setCategories(list || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: "", slug: "", icon: "📦", description: "", is_active: true, parent_id: "" });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || "📦", description: cat.description || "", is_active: cat.is_active !== false, parent_id: cat.parent_id || "" });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const slug = form.slug.trim() || slugify(form.name);
    const now = new Date().toISOString();
    try {
      if (editId) {
        await base44.entities.ShopCategory.update(editId, { ...form, slug, updated_at: now });
        toast({ title: "Category updated" });
      } else {
        const maxOrder = categories.reduce((mx, c) => Math.max(mx, c.display_order || 0), 0);
        await base44.entities.ShopCategory.create({ ...form, slug, display_order: maxOrder + 1, updated_at: now });
        toast({ title: "Category created" });
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category? Products in this category will remain but won't appear in category filters until reassigned.")) return;
    try {
      await base44.entities.ShopCategory.delete(id);
      toast({ title: "Category deleted" });
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (cat) => {
    try {
      await base44.entities.ShopCategory.update(cat.id, { is_active: !cat.is_active, updated_at: new Date().toISOString() });
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const moveOrder = async (cat, dir) => {
    const sorted = [...categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const idx = sorted.findIndex(c => c.id === cat.id);
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[idx], b = sorted[target];
    const now = new Date().toISOString();
    await Promise.all([
      base44.entities.ShopCategory.update(a.id, { display_order: b.display_order, updated_at: now }),
      base44.entities.ShopCategory.update(b.id, { display_order: a.display_order, updated_at: now }),
    ]);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4" style={{ color: G.text }} />
          <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Categories ({categories.length})</h2>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-xs font-bold" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <Plus className="w-3.5 h-3.5" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-3 border-t-yellow-400 border-r-transparent rounded-full animate-spin" style={{ borderTopColor: G.text, borderRightColor: "transparent" }} />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8">
          <FolderTree className="w-10 h-10 mx-auto mb-2" style={{ color: G.dim, opacity: 0.3 }} />
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>No categories yet. Create your first category.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {(() => {
            const tops = categories.filter(c => !c.parent_id).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            const childrenOf = (pid) => categories.filter(c => c.parent_id === pid).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            const result = [];
            const seen = new Set();
            tops.forEach(parent => { result.push(parent); seen.add(parent.id); childrenOf(parent.id).forEach(child => { result.push(child); seen.add(child.id); }); });
            categories.filter(c => !seen.has(c.id)).forEach(c => result.push(c));
            return result;
          })().map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-2.5 rounded-lg"
              style={{ background: cat.is_active === false ? "rgba(255,255,255,0.02)" : "rgba(8,16,38,0.60)", border: `1px solid ${cat.is_active === false ? G.faint : G.faint}`, opacity: cat.is_active === false ? 0.5 : 1, marginLeft: cat.parent_id ? 20 : 0 }}
            >
              {cat.parent_id && <span className="font-inter text-[10px] flex-shrink-0" style={{ color: G.dim }}>↳</span>}
              <span className="text-lg flex-shrink-0">{cat.icon || "📦"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.90)" }}>{cat.name}</p>
                <p className="font-inter text-[9px]" style={{ color: G.dim }}>/{cat.slug}</p>
              </div>
              {/* Reorder */}
              <button onClick={() => moveOrder(cat, -1)} className="p-1 rounded hover:bg-white/5" title="Move up">
                <ChevronUp className="w-3 h-3" style={{ color: G.dim }} />
              </button>
              <button onClick={() => moveOrder(cat, 1)} className="p-1 rounded hover:bg-white/5" title="Move down">
                <ChevronDown className="w-3 h-3" style={{ color: G.dim }} />
              </button>
              {/* Toggle active */}
              <button onClick={() => toggleActive(cat)} className="p-1 rounded hover:bg-white/5" title={cat.is_active === false ? "Show" : "Hide"}>
                {cat.is_active === false ? <EyeOff className="w-3 h-3" style={{ color: G.dim }} /> : <Eye className="w-3 h-3" style={{ color: G.text }} />}
              </button>
              {/* Edit */}
              <button onClick={() => openEdit(cat)} className="p-1 rounded hover:bg-white/5">
                <Edit3 className="w-3 h-3" style={{ color: G.text }} />
              </button>
              {/* Delete */}
              <button onClick={() => handleDelete(cat.id)} className="p-1 rounded hover:bg-white/5">
                <Trash2 className="w-3 h-3" style={{ color: "#F87171" }} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
              <h3 className="font-inter text-sm font-bold" style={{ color: G.text }}>{editId ? "Edit Category" : "New Category"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4" style={{ color: G.dim }} /></button>
            </div>
            <div className="space-y-2">
              <div>
                <p className="font-inter text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: G.dim }}>Name *</p>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="e.g. Ayurvedic Medicines" />
              </div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: G.dim }}>Slug</p>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="auto-generated from name" />
              </div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: G.dim }}>Icon</p>
                <div className="flex gap-1 flex-wrap">
                  {EMOJI_CHOICES.map(emoji => (
                    <button key={emoji} onClick={() => setForm({ ...form, icon: emoji })} className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: form.icon === emoji ? G.bgHi : "rgba(255,255,255,0.03)", border: `1px solid ${form.icon === emoji ? G.borderHi : G.faint}` }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: G.dim }}>Parent Category (optional)</p>
                <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.60)" }}>
                  <option value="">None (Top-level category)</option>
                  {categories.filter(c => c.id !== editId).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: G.dim }}>Description (optional)</p>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-white/5 outline-none font-inter text-xs resize-none" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} />
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
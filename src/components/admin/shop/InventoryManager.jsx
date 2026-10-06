import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, CheckCircle, Infinity as InfinityIcon, Save, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const FILTERS = [
  { id: "all", label: "All", color: G.text },
  { id: "in_stock", label: "In Stock", color: "#34D399" },
  { id: "low_stock", label: "Low Stock", color: "#FB923C" },
  { id: "out_of_stock", label: "Out of Stock", color: "#F87171" },
  { id: "unlimited", label: "Unlimited", color: "#60A5FA" },
];

function getStockStatus(p) {
  if (p.stock_quantity === -1 || p.stock_quantity === undefined) return "unlimited";
  if (p.stock_quantity === 0) return "out_of_stock";
  if (p.stock_quantity <= (p.low_stock_threshold || 10)) return "low_stock";
  return "in_stock";
}

export default function InventoryManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [editStock, setEditStock] = useState(0);
  const [editWarehouse, setEditWarehouse] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkStock, setBulkStock] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const list = await base44.entities.Product.list("-created_date", 500);
      setProducts(list || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p => {
    const status = getStockStatus(p);
    if (filter !== "all" && status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.sku?.toLowerCase().includes(q) && !p.product_id?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const saveStock = async (product) => {
    try {
      await base44.entities.Product.update(product.id, {
        stock_quantity: editStock,
        warehouse_location: editWarehouse,
        is_out_of_stock: editStock === 0,
        updated_at: new Date().toISOString(),
      });
      toast({ title: "Stock updated" });
      setEditing(null);
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setEditStock(p.stock_quantity ?? -1);
    setEditWarehouse(p.warehouse_location || "");
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const bulkSetStock = async () => {
    if (selectedIds.size === 0 || !bulkStock.trim()) return;
    const val = bulkStock.trim() === "unlimited" ? -1 : parseInt(bulkStock) || 0;
    try {
      const ids = Array.from(selectedIds);
      await base44.entities.Product.bulkUpdate(ids.map(id => ({ id, stock_quantity: val, is_out_of_stock: val === 0, updated_at: new Date().toISOString() })));
      toast({ title: `${ids.length} products stock updated` });
      setSelectedIds(new Set());
      setBulkStock("");
      load();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const stockCounts = {
    in_stock: products.filter(p => getStockStatus(p) === "in_stock").length,
    low_stock: products.filter(p => getStockStatus(p) === "low_stock").length,
    out_of_stock: products.filter(p => getStockStatus(p) === "out_of_stock").length,
    unlimited: products.filter(p => getStockStatus(p) === "unlimited").length,
  };

  const STATUS_ICON = {
    in_stock: <CheckCircle className="w-3 h-3" style={{ color: "#34D399" }} />,
    low_stock: <AlertTriangle className="w-3 h-3" style={{ color: "#FB923C" }} />,
    out_of_stock: <X className="w-3 h-3" style={{ color: "#F87171" }} />,
    unlimited: <InfinityIcon className="w-3 h-3" style={{ color: "#60A5FA" }} />,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4" style={{ color: G.text }} />
        <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Inventory Management</h2>
      </div>

      {/* Stock Summary */}
      <div className="grid grid-cols-4 gap-2">
        {FILTERS.slice(1).map(f => (
          <div key={f.id} className="p-2 rounded-lg text-center" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
            <p className="font-inter text-lg font-bold" style={{ color: f.color }}>{stockCounts[f.id]}</p>
            <p className="font-inter text-[9px] uppercase" style={{ color: G.dim }}>{f.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-2.5 py-1 rounded-lg font-inter text-[10px] font-bold"
              style={{ background: filter === f.id ? G.bgHi : "rgba(255,255,255,0.03)", border: `1px solid ${filter === f.id ? G.borderHi : G.faint}`, color: filter === f.id ? G.text : G.dim }}>
              {f.label}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, SKU..."
          className="flex-1 min-w-[120px] px-3 py-1.5 rounded-lg bg-white/5 outline-none font-inter text-xs"
          style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} />
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: "rgba(8,16,38,0.80)", border: `1px solid ${G.border}` }}>
          <span className="font-inter text-xs font-bold" style={{ color: G.text }}>{selectedIds.size} selected</span>
          <input value={bulkStock} onChange={e => setBulkStock(e.target.value)} placeholder="Stock qty or 'unlimited'"
            className="flex-1 px-2 py-1 rounded-lg bg-transparent outline-none font-inter text-[10px]"
            style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.80)" }} />
          <button onClick={bulkSetStock} className="px-3 py-1 rounded-lg font-inter text-[10px] font-bold" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>Set Stock</button>
          <button onClick={() => setSelectedIds(new Set())} className="px-2 py-1 rounded-lg font-inter text-[10px]" style={{ color: G.dim }}>Clear</button>
        </div>
      )}

      {/* Product List */}
      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: `2px solid ${G.text}`, borderRight: "2px solid transparent" }} /></div>
      ) : filtered.length === 0 ? (
        <p className="font-inter text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.40)" }}>No products match this filter.</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.slice(0, 100).map(p => {
            const status = getStockStatus(p);
            return (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-2.5 rounded-lg"
                style={{ background: editing === p.id ? G.bgHi : "rgba(8,16,38,0.60)", border: `1px solid ${editing === p.id ? G.borderHi : G.faint}` }}>
                <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)}
                  className="flex-shrink-0 w-4 h-4 cursor-pointer" style={{ accentColor: "#D4AF37" }} />
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                  {p.images?.[p.thumbnail_index || 0] ? <img src={p.images[p.thumbnail_index || 0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-3 h-3" style={{ color: G.dim, opacity: 0.3 }} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{p.name}</p>
                  <p className="font-inter text-[9px]" style={{ color: G.dim }}>{p.sku || p.product_id} • {p.warehouse_location || "No warehouse"}</p>
                </div>
                {editing === p.id ? (
                  <div className="flex items-center gap-1.5">
                    <input type="number" value={editStock} onChange={e => setEditStock(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded bg-white/5 outline-none font-inter text-[10px]" style={{ border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.90)" }} />
                    <input value={editWarehouse} onChange={e => setEditWarehouse(e.target.value)} placeholder="Warehouse"
                      className="w-20 px-2 py-1 rounded bg-white/5 outline-none font-inter text-[10px]" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} />
                    <button onClick={() => saveStock(p)} className="p-1 rounded"><Save className="w-3 h-3" style={{ color: "#34D399" }} /></button>
                    <button onClick={() => setEditing(null)} className="p-1 rounded"><X className="w-3 h-3" style={{ color: G.dim }} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {STATUS_ICON[status]}
                    <span className="font-inter text-[11px] font-bold" style={{ color: status === "out_of_stock" ? "#F87171" : status === "low_stock" ? "#FB923C" : status === "unlimited" ? "#60A5FA" : "#34D399" }}>
                      {status === "unlimited" ? "∞" : p.stock_quantity}
                    </span>
                    <button onClick={() => startEdit(p)} className="font-inter text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: G.bg, border: `1px solid ${G.faint}`, color: G.text }}>Edit</button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
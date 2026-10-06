import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Check, X, Trash2, MessageSquare, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const FILTERS = [
  { id: "pending", label: "Pending Approval" },
  { id: "approved", label: "Approved" },
  { id: "all", label: "All Reviews" },
];

export default function ReviewsManager() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [revs, prods] = await Promise.all([
        base44.entities.ProductReview.list("-created_date", 200),
        base44.entities.Product.list("-created_date", 200),
      ]);
      setReviews(revs || []);
      setProducts(prods || []);
    } catch { setReviews([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const productName = (pid) => products.find(p => p.product_id === pid || p.id === pid)?.name || pid;

  const filtered = reviews.filter(r => {
    if (filter === "pending" && r.is_approved) return false;
    if (filter === "approved" && !r.is_approved) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!r.reviewer_name?.toLowerCase().includes(q) && !r.comment?.toLowerCase().includes(q) && !r.title?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const approve = async (r) => {
    try { await base44.entities.ProductReview.update(r.id, { is_approved: true }); toast({ title: "Review approved" }); load(); }
    catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const reject = async (r) => {
    try { await base44.entities.ProductReview.update(r.id, { is_approved: false }); toast({ title: "Review hidden" }); load(); }
    catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    try { await base44.entities.ProductReview.delete(id); toast({ title: "Review deleted" }); load(); }
    catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4" style={{ color: G.text }} />
        <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Reviews ({pendingCount} pending)</h2>
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
        <div className="flex items-center gap-1.5 flex-1">
          <Search className="w-3.5 h-3.5" style={{ color: G.dim }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: `2px solid ${G.text}`, borderRight: "2px solid transparent" }} /></div>
      ) : filtered.length === 0 ? (
        <p className="font-inter text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.40)" }}>No reviews found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg space-y-1.5" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${r.is_approved ? G.faint : G.border}` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-inter text-xs font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{r.reviewer_name}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className="w-2.5 h-2.5" style={{ color: n <= (r.rating||0) ? G.text : G.faint, fill: n <= (r.rating||0) ? G.text : "transparent" }} />
                    ))}
                  </div>
                  {r.is_approved ? (
                    <span className="font-inter text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}>APPROVED</span>
                  ) : (
                    <span className="font-inter text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(245,208,96,0.15)", color: G.text }}>PENDING</span>
                  )}
                </div>
                <div className="flex gap-1">
                  {!r.is_approved && <button onClick={() => approve(r)} className="p-1 rounded hover:bg-white/5" title="Approve"><Check className="w-3 h-3" style={{ color: "#34D399" }} /></button>}
                  {r.is_approved && <button onClick={() => reject(r)} className="p-1 rounded hover:bg-white/5" title="Hide"><X className="w-3 h-3" style={{ color: G.dim }} /></button>}
                  <button onClick={() => handleDelete(r.id)} className="p-1 rounded hover:bg-white/5" title="Delete"><Trash2 className="w-3 h-3" style={{ color: "#F87171" }} /></button>
                </div>
              </div>
              <p className="font-inter text-[10px]" style={{ color: G.dim }}>Product: {productName(r.product_id)}</p>
              {r.title && <p className="font-inter text-xs font-semibold" style={{ color: G.text }}>{r.title}</p>}
              <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.60)" }}>{r.comment}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
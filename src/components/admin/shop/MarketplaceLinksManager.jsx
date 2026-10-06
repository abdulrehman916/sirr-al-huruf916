import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, ShoppingBag, AlertTriangle, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { MARKETPLACE_REGISTRY } from "@/lib/countryProfiles";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const PLATFORMS = ["Amazon UAE", "Amazon India", "Amazon Saudi", "Amazon USA", "Amazon UK", "Flipkart", "Noon", "External", "WhatsApp", "Email"];

export default function MarketplaceLinksManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Product.list("-created_date", 500);
        setProducts(list || []);
      } catch { setProducts([]); }
      finally { setLoading(false); }
    })();
  }, []);

  // Count links per platform
  const platformCounts = {};
  let noLinkCount = 0;
  products.forEach(p => {
    const links = p.affiliate_links || [];
    if (links.length === 0) noLinkCount++;
    links.forEach(link => {
      const plat = link.platform || "Unknown";
      platformCounts[plat] = (platformCounts[plat] || 0) + 1;
    });
  });

  const filtered = products.filter(p => {
    const links = p.affiliate_links || [];
    if (filter === "no_links" && links.length > 0) return false;
    if (filter !== "all" && filter !== "no_links") {
      if (!links.some(l => (l.platform || "").toLowerCase().includes(filter.toLowerCase()))) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.product_id?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const getPlatformColor = (platform) => {
    const mp = Object.values(MARKETPLACE_REGISTRY).find(m => m.aliases?.some(a => a.toLowerCase() === platform?.toLowerCase()));
    return mp?.color || G.text;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: `2px solid ${G.text}`, borderRight: "2px solid transparent" }} /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ExternalLink className="w-4 h-4" style={{ color: G.text }} />
        <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Marketplace Links</h2>
      </div>

      {/* Platform Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {PLATFORMS.map(p => (
          <div key={p} className="p-2 rounded-lg text-center" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
            <p className="font-inter text-sm font-bold" style={{ color: getPlatformColor(p) }}>{platformCounts[p] || 0}</p>
            <p className="font-inter text-[8px] uppercase truncate" style={{ color: G.dim }}>{p}</p>
          </div>
        ))}
      </div>

      {/* No Links Alert */}
      {noLinkCount > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.30)" }}>
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F87171" }} />
          <span className="font-inter text-[11px]" style={{ color: "#FCA5A5" }}>{noLinkCount} products have no marketplace links. Add links in the Product Editor.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.60)" }}>
          <option value="all">All Products</option>
          <option value="no_links">No Links (Needs Attention)</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="flex items-center gap-1.5 flex-1">
          <Search className="w-3.5 h-3.5" style={{ color: G.dim }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} />
        </div>
      </div>

      {/* Product Links List */}
      {filtered.length === 0 ? (
        <p className="font-inter text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.40)" }}>No products match this filter.</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.slice(0, 100).map(p => {
            const links = p.affiliate_links || [];
            return (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${links.length === 0 ? "rgba(248,113,113,0.20)" : G.faint}` }}>
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                  {p.images?.[p.thumbnail_index || 0] ? <img src={p.images[p.thumbnail_index || 0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-3 h-3" style={{ color: G.dim, opacity: 0.3 }} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{p.name}</p>
                  <div className="flex gap-1 flex-wrap mt-0.5">
                    {links.length === 0 ? (
                      <span className="font-inter text-[9px]" style={{ color: "#F87171" }}>No marketplace links</span>
                    ) : links.map((l, i) => (
                      <span key={i} className="font-inter text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: getPlatformColor(l.platform) + "20", color: getPlatformColor(l.platform) }}>
                        {l.platform}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="font-inter text-[10px] font-bold flex-shrink-0" style={{ color: links.length > 0 ? G.text : G.dim }}>{links.length}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
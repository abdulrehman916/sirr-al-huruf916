import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, FileText, Video, Search, Copy, Check, Package, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const TYPE_FILTERS = [
  { id: "all", label: "All", icon: Package },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "videos", label: "Videos", icon: Video },
  { id: "pdfs", label: "PDFs", icon: FileText },
];

export default function MediaLibrary() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState("");
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Product.list("-created_date", 500);
        setProducts(list || []);
      } catch { setProducts([]); }
      finally { setLoading(false); }
    })();
  }, []);

  // Aggregate all media from products
  const allMedia = useMemo(() => {
    const items = [];
    products.forEach(p => {
      (p.images || []).forEach((url, idx) => {
        items.push({ type: "image", url, productName: p.name, productId: p.product_id, isThumb: idx === (p.thumbnail_index || 0) });
      });
      (p.video_urls || []).forEach(url => {
        if (url) items.push({ type: "video", url, productName: p.name, productId: p.product_id });
      });
      if (p.video_url) items.push({ type: "video", url: p.video_url, productName: p.name, productId: p.product_id });
      if (p.pdf_url) items.push({ type: "pdf", url: p.pdf_url, productName: p.name, productId: p.product_id });
    });
    return items;
  }, [products]);

  const filtered = allMedia.filter(item => {
    if (filter !== "all" && item.type !== (filter === "images" ? "image" : filter === "videos" ? "video" : "pdf")) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!item.productName?.toLowerCase().includes(q) && !item.productId?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = {
    images: allMedia.filter(m => m.type === "image").length,
    videos: allMedia.filter(m => m.type === "video").length,
    pdfs: allMedia.filter(m => m.type === "pdf").length,
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      toast({ title: "URL copied", duration: 2000 });
      setTimeout(() => setCopiedUrl(""), 2000);
    }).catch(() => toast({ title: "Copy failed", variant: "destructive" }));
  };

  const getTypeIcon = (type) => {
    if (type === "image") return ImageIcon;
    if (type === "video") return Video;
    return FileText;
  };

  const getTypeColor = (type) => {
    if (type === "image") return "#60A5FA";
    if (type === "video") return "#A78BFA";
    return "#F87171";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4" style={{ color: G.text }} />
        <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Media Library ({allMedia.length})</h2>
      </div>

      {/* Type Counts */}
      <div className="grid grid-cols-3 gap-2">
        {TYPE_FILTERS.slice(1).map(f => {
          const Icon = f.icon;
          const count = counts[f.id];
          return (
            <div key={f.id} className="p-2 rounded-lg text-center" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
              <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: getTypeColor(f.id === "images" ? "image" : f.id === "videos" ? "video" : "pdf") }} />
              <p className="font-inter text-lg font-bold" style={{ color: "rgba(255,255,255,0.95)" }}>{count}</p>
              <p className="font-inter text-[9px] uppercase" style={{ color: G.dim }}>{f.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters + Search */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1.5">
          {TYPE_FILTERS.map(f => {
            const Icon = f.icon;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-inter text-[10px] font-bold"
                style={{ background: filter === f.id ? G.bgHi : "rgba(255,255,255,0.03)", border: `1px solid ${filter === f.id ? G.borderHi : G.faint}`, color: filter === f.id ? G.text : G.dim }}>
                <Icon className="w-3 h-3" /> {f.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          <Search className="w-3.5 h-3.5" style={{ color: G.dim }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product name..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: `2px solid ${G.text}`, borderRight: "2px solid transparent" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-10 h-10 mx-auto mb-2" style={{ color: G.dim, opacity: 0.3 }} />
          <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>No media found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {filtered.slice(0, 120).map((item, idx) => {
            const Icon = getTypeIcon(item.type);
            const color = getTypeColor(item.type);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                className="rounded-lg overflow-hidden cursor-pointer group"
                style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}
                onClick={() => setPreviewItem(item)}
              >
                {/* Thumbnail */}
                <div className="aspect-square relative bg-black/40">
                  {item.type === "image" ? (
                    <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="w-8 h-8" style={{ color, opacity: 0.5 }} />
                    </div>
                  )}
                  {/* Type badge */}
                  <span className="absolute top-1 left-1 font-inter text-[7px] font-bold px-1 py-0.5 rounded uppercase" style={{ background: color + "30", color }}>
                    {item.type}
                  </span>
                  {/* Copy button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}
                    className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.60)" }}
                  >
                    {copiedUrl === item.url ? <Check className="w-3 h-3" style={{ color: "#34D399" }} /> : <Copy className="w-3 h-3" style={{ color: "rgba(255,255,255,0.70)" }} />}
                  </button>
                  {/* Thumb indicator */}
                  {item.isThumb && (
                    <span className="absolute bottom-1 left-1 font-inter text-[7px] font-bold px-1 py-0.5 rounded" style={{ background: G.bgHi, color: G.text }}>
                      THUMB
                    </span>
                  )}
                </div>
                {/* Product name */}
                <div className="p-1.5">
                  <p className="font-inter text-[9px] truncate" style={{ color: "rgba(255,255,255,0.60)" }}>{item.productName}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {filtered.length > 120 && (
        <p className="font-inter text-[10px] text-center" style={{ color: G.dim }}>
          Showing 120 of {filtered.length} media items. Refine your search to see more.
        </p>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setPreviewItem(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="rounded-2xl p-4 max-w-lg w-full space-y-3"
            style={{ background: "linear-gradient(180deg, rgba(5,10,28,0.99) 0%, rgba(2,5,16,1) 100%)", border: `1px solid ${G.border}` }}
          >
            <div className="flex items-center justify-between">
              <span className="font-inter text-xs font-bold uppercase" style={{ color: getTypeColor(previewItem.type) }}>{previewItem.type}</span>
              <button onClick={() => setPreviewItem(null)}><X className="w-4 h-4" style={{ color: G.dim }} /></button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black/40 flex items-center justify-center" style={{ maxHeight: "50vh" }}>
              {previewItem.type === "image" ? (
                <img src={previewItem.url} alt="" className="max-w-full max-h-[50vh] object-contain" />
              ) : previewItem.type === "video" ? (
                <video src={previewItem.url} controls className="max-w-full max-h-[50vh]" />
              ) : (
                <iframe src={previewItem.url} className="w-full h-[40vh]" title="PDF Preview" />
              )}
            </div>
            <div className="space-y-1">
              <p className="font-inter text-xs font-bold" style={{ color: G.text }}>{previewItem.productName}</p>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="font-inter text-[10px] flex-1 truncate" style={{ color: "rgba(255,255,255,0.50)" }}>{previewItem.url}</p>
                <button onClick={() => copyUrl(previewItem.url)} className="flex items-center gap-1 px-2 py-1 rounded font-inter text-[10px] font-bold" style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}>
                  {copiedUrl === previewItem.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
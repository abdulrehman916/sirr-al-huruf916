import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Plus, Search, X, Edit3, Trash2, Eye, EyeOff, ChevronUp, ChevronDown,
  Star, Flame, Sparkles, PackageX, TrendingUp, Copy
} from "lucide-react";
import ProductEditor from "@/components/admin/ProductEditor";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

const EMPTY_FORM = {
  product_id: "",
  name: "",
  slug: "",
  short_description: "",
  full_description: "",
  specifications: "{}",
  images: [],
  video_url: "",
  video_urls: [],
  pdf_url: "",
  category: "",
  affiliate_links: [],
  amazon_url: "",
  price_display: "",
  compare_price_display: "",
  rating_display: "",
  sort_order: 0,
  is_active: true,
  is_featured: false,
  is_best_seller: false,
  is_new_arrival: false,
  is_out_of_stock: false,
  discount_percentage: "",
  seller_whatsapp: "",
  seller_email: "",
  tags: [],
  faqs: [],
  brand: "",
  sku: "",
  malayalam_description: "",
  usage_instructions: "",
  ingredients: "",
  benefits: "",
  warnings: "",
  rules_precautions: "",
  storage_instructions: "",
  is_trending: false,
  barcode: "",
  sub_category: "",
  product_status: "active",
  arabic_description: "",
  country_price_overrides: "{}",
  stock_quantity: -1,
  low_stock_threshold: 10,
  warehouse_location: "",
  thumbnail_index: 0,
};

export default function AdminProducts() {
  const { toast } = useToast();
  const { role, authResolved } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [affiliateInput, setAffiliateInput] = useState({ platform: "", url: "", label: "" });
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [faqInput, setFaqInput] = useState({ question: "", answer: "" });
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkBrand, setBulkBrand] = useState("");

  useEffect(() => {
    if (!authResolved) return;
    const canManageProducts = role === "owner" || role === "admin";
    setIsAdmin(canManageProducts);
    if (canManageProducts) {
      loadProducts();
      loadReviews();
    } else {
      setLoading(false);
    }
  }, [authResolved, role]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const list = await base44.entities.Product.list("-created_date", 500);
      setProducts(list || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const list = await base44.entities.ProductReview.list("-created_date", 100);
      setReviews(list || []);
    } catch {
      setReviews([]);
    }
  };

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return ["all", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (filterCategory !== "all") list = list.filter(p => p.category === filterCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.product_id?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (p.is_active ? "active" : "hidden").includes(q) ||
        (p.is_out_of_stock ? "out of stock" : "").includes(q) ||
        (p.is_featured ? "featured" : "").includes(q) ||
        (p.is_best_seller ? "best seller" : "").includes(q) ||
        (p.is_new_arrival ? "new arrival" : "").includes(q) ||
        (p.is_trending ? "trending" : "").includes(q)
      );
    }
    return list;
  }, [products, search, filterCategory]);

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      product_id: `PRD-${Date.now()}`,
      slug: `prd-${Date.now()}`,
    });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setForm({
      ...EMPTY_FORM,
      ...product,
      specifications: product.specifications ? JSON.stringify(product.specifications, null, 2) : "{}",
      images: product.images || [],
      video_urls: product.video_urls || [],
      affiliate_links: product.affiliate_links || [],
      tags: product.tags || [],
      faqs: product.faqs || [],
      discount_percentage: product.discount_percentage ?? "",
      country_price_overrides: product.country_price_overrides ? JSON.stringify(product.country_price_overrides, null, 2) : "{}",
    });
    setEditId(product.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      let specs = {};
      try { specs = JSON.parse(form.specifications || "{}"); } catch { specs = {}; }

      const payload = {
        product_id: form.product_id || `PRD-${Date.now()}`,
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        short_description: form.short_description,
        full_description: form.full_description,
        specifications: specs,
        images: form.images,
        video_url: form.video_url,
        video_urls: form.video_urls,
        pdf_url: form.pdf_url,
        category: form.category,
        affiliate_links: form.affiliate_links,
        amazon_url: form.amazon_url,
        price_display: form.price_display,
        compare_price_display: form.compare_price_display,
        rating_display: form.rating_display,
        sort_order: form.sort_order || 0,
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_best_seller: form.is_best_seller,
        is_new_arrival: form.is_new_arrival,
        is_out_of_stock: form.is_out_of_stock,
        discount_percentage: form.discount_percentage ? Number(form.discount_percentage) : null,
        seller_whatsapp: form.seller_whatsapp,
        seller_email: form.seller_email,
        tags: form.tags,
        faqs: form.faqs,
        brand: form.brand,
        sku: form.sku,
        malayalam_description: form.malayalam_description,
        usage_instructions: form.usage_instructions,
        ingredients: form.ingredients,
        benefits: form.benefits,
        warnings: form.warnings,
        rules_precautions: form.rules_precautions,
        storage_instructions: form.storage_instructions,
        is_trending: form.is_trending,
        barcode: form.barcode,
        sub_category: form.sub_category,
        product_status: form.product_status,
        arabic_description: form.arabic_description,
        country_price_overrides: (() => { try { return JSON.parse(form.country_price_overrides || "{}"); } catch { return {}; } })(),
        stock_quantity: form.stock_quantity ?? -1,
        low_stock_threshold: form.low_stock_threshold ?? 10,
        warehouse_location: form.warehouse_location,
        thumbnail_index: form.thumbnail_index || 0,
        updated_at: new Date().toISOString(),
      };

      if (editId) {
        await base44.entities.Product.update(editId, payload);
        toast({ title: "Product updated" });
      } else {
        await base44.entities.Product.create(payload);
        toast({ title: "Product created" });
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      toast({ title: "Error saving product", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await base44.entities.Product.delete(id);
      toast({ title: "Product deleted" });
      loadProducts();
    } catch (err) {
      toast({ title: "Error deleting", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (product) => {
    try {
      await base44.entities.Product.update(product.id, { is_active: !product.is_active, updated_at: new Date().toISOString() });
      loadProducts();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleFeatured = async (product) => {
    try {
      await base44.entities.Product.update(product.id, { is_featured: !product.is_featured, updated_at: new Date().toISOString() });
      loadProducts();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const moveOrder = async (product, direction) => {
    try {
      await base44.entities.Product.update(product.id, {
        sort_order: (product.sort_order || 0) + direction,
        updated_at: new Date().toISOString(),
      });
      loadProducts();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const addImage = () => {
    if (!imageUrlInput.trim()) return;
    setForm({ ...form, images: [...form.images, imageUrlInput.trim()] });
    setImageUrlInput("");
  };

  const removeImage = (idx) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const addAffiliate = () => {
    if (!affiliateInput.platform.trim() || !affiliateInput.url.trim()) return;
    setForm({
      ...form,
      affiliate_links: [...form.affiliate_links, { ...affiliateInput }],
    });
    setAffiliateInput({ platform: "", url: "", label: "" });
  };

  const removeAffiliate = (idx) => {
    setForm({ ...form, affiliate_links: form.affiliate_links.filter((_, i) => i !== idx) });
  };

  const addSpec = () => {
    if (!specKey.trim()) return;
    try {
      const specs = JSON.parse(form.specifications || "{}");
      specs[specKey.trim()] = specValue.trim();
      setForm({ ...form, specifications: JSON.stringify(specs, null, 2) });
      setSpecKey("");
      setSpecValue("");
    } catch { /* ignore */ }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
    }
    setTagInput("");
  };

  const removeTag = (idx) => {
    setForm({ ...form, tags: form.tags.filter((_, i) => i !== idx) });
  };

  const addVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    if (!form.video_urls.includes(videoUrlInput.trim())) {
      setForm({ ...form, video_urls: [...form.video_urls, videoUrlInput.trim()] });
    }
    setVideoUrlInput("");
  };

  const removeVideoUrl = (idx) => {
    setForm({ ...form, video_urls: form.video_urls.filter((_, i) => i !== idx) });
  };

  const addFaq = () => {
    if (!faqInput.question.trim() || !faqInput.answer.trim()) return;
    setForm({ ...form, faqs: [...form.faqs, { ...faqInput }] });
    setFaqInput({ question: "", answer: "" });
  };

  const removeFaq = (idx) => {
    setForm({ ...form, faqs: form.faqs.filter((_, i) => i !== idx) });
  };

  const toggleBestSeller = async (product) => {
    try {
      await base44.entities.Product.update(product.id, { is_best_seller: !product.is_best_seller, updated_at: new Date().toISOString() });
      loadProducts();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleNewArrival = async (product) => {
    try {
      await base44.entities.Product.update(product.id, { is_new_arrival: !product.is_new_arrival, updated_at: new Date().toISOString() });
      loadProducts();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleTrending = async (product) => {
    try {
      await base44.entities.Product.update(product.id, { is_trending: !product.is_trending, updated_at: new Date().toISOString() });
      loadProducts();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleStock = async (product) => {
    try {
      await base44.entities.Product.update(product.id, { is_out_of_stock: !product.is_out_of_stock, updated_at: new Date().toISOString() });
      loadProducts();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const approveReview = async (review) => {
    try {
      await base44.entities.ProductReview.update(review.id, { is_approved: true });
      loadReviews();
      toast({ title: "Review approved" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const deleteReview = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await base44.entities.ProductReview.delete(id);
      loadReviews();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  };

  const duplicateProduct = async (product) => {
    try {
      const { id, created_date, updated_date, created_by_id, ...rest } = product;
      await base44.entities.Product.create({
        ...rest,
        product_id: `PRD-${Date.now()}`,
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now()}`,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
        is_trending: false,
        updated_at: new Date().toISOString(),
      });
      toast({ title: "Product duplicated" });
      loadProducts();
    } catch (err) {
      toast({ title: "Error duplicating", description: err.message, variant: "destructive" });
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} products? This cannot be undone.`)) return;
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(id => base44.entities.Product.delete(id)));
      toast({ title: `${ids.length} products deleted` });
      setSelectedIds(new Set());
      loadProducts();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const bulkPublish = async (publish) => {
    if (selectedIds.size === 0) return;
    try {
      const ids = Array.from(selectedIds);
      const now = new Date().toISOString();
      await base44.entities.Product.bulkUpdate(ids.map(id => ({ id, is_active: publish, updated_at: now })));
      toast({ title: `${ids.length} products ${publish ? "published" : "hidden"}` });
      setSelectedIds(new Set());
      loadProducts();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const bulkChangeCategory = async () => {
    if (selectedIds.size === 0 || !bulkCategory.trim()) return;
    try {
      const ids = Array.from(selectedIds);
      const now = new Date().toISOString();
      const cat = bulkCategory.trim();
      await base44.entities.Product.bulkUpdate(ids.map(id => ({ id, category: cat, updated_at: now })));
      toast({ title: `${ids.length} products moved to ${cat}` });
      setBulkCategory("");
      setSelectedIds(new Set());
      loadProducts();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const bulkChangeBrand = async () => {
    if (selectedIds.size === 0 || !bulkBrand.trim()) return;
    try {
      const ids = Array.from(selectedIds);
      const now = new Date().toISOString();
      const brand = bulkBrand.trim();
      await base44.entities.Product.bulkUpdate(ids.map(id => ({ id, brand, updated_at: now })));
      toast({ title: `${ids.length} products brand set to ${brand}` });
      setBulkBrand("");
      setSelectedIds(new Set());
      loadProducts();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const pendingReviews = reviews.filter(r => !r.is_approved);

  if (isAdmin === false) return <Navigate to="/" replace />;
  if (isAdmin === null) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-t-yellow-400 border-r-transparent border-b-yellow-400 border-l-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Products" subtitle="Shop Management">
      <div className="space-y-6">
        {/* Stats + Actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-xl" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}` }}>
              <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>Products</p>
              <p className="font-inter text-lg font-bold" style={{ color: G.text }}>{products.length}</p>
            </div>
            {pendingReviews.length > 0 && (
              <div className="px-4 py-2 rounded-xl" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}` }}>
                <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>Pending Reviews</p>
                <p className="font-inter text-lg font-bold" style={{ color: G.text }}>{pendingReviews.length}</p>
              </div>
            )}
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-inter text-xs font-bold"
            style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}` }}>
          <Search className="w-4 h-4" style={{ color: G.dim }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, brand, category, SKU, tags, status..."
            className="flex-1 bg-transparent outline-none font-inter text-sm"
            style={{ color: "rgba(255,255,255,0.90)" }}
          />
          {search && <X className="w-4 h-4 cursor-pointer" style={{ color: G.dim }} onClick={() => setSearch("")} />}
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className="flex-shrink-0 px-3 py-1 rounded-lg font-inter text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: filterCategory === cat ? G.bgHi : "transparent",
                  border: `1px solid ${filterCategory === cat ? G.borderHi : G.faint}`,
                  color: filterCategory === cat ? G.text : G.dim,
                }}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl" style={{ background: "rgba(8,16,38,0.80)", border: `1px solid ${G.border}` }}>
            <span className="font-inter text-xs font-bold" style={{ color: G.text }}>
              {selectedIds.size} selected
            </span>
            <button onClick={() => setSelectedIds(new Set())} className="px-2 py-1 rounded-lg font-inter text-[10px] font-bold" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.50)" }}>
              Clear
            </button>
            <div className="flex gap-1.5">
              <button onClick={() => bulkPublish(true)} className="px-2.5 py-1 rounded-lg font-inter text-[10px] font-bold" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.40)", color: "#86EFAC" }}>
                Publish All
              </button>
              <button onClick={() => bulkPublish(false)} className="px-2.5 py-1 rounded-lg font-inter text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.60)" }}>
                Hide All
              </button>
              <button onClick={bulkDelete} className="px-2.5 py-1 rounded-lg font-inter text-[10px] font-bold" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.30)", color: "#F87171" }}>
                Delete All
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input value={bulkCategory} onChange={e => setBulkCategory(e.target.value)} placeholder="Set category..." className="px-2 py-1 rounded-lg bg-transparent outline-none font-inter text-[10px] w-28" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.80)" }} />
              <button onClick={bulkChangeCategory} disabled={!bulkCategory.trim()} className="px-2 py-1 rounded-lg font-inter text-[10px] font-bold disabled:opacity-30" style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}>
                Apply
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input value={bulkBrand} onChange={e => setBulkBrand(e.target.value)} placeholder="Set brand..." className="px-2 py-1 rounded-lg bg-transparent outline-none font-inter text-[10px] w-28" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.80)" }} />
              <button onClick={bulkChangeBrand} disabled={!bulkBrand.trim()} className="px-2 py-1 rounded-lg font-inter text-[10px] font-bold disabled:opacity-30" style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}>
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Select All */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="w-4 h-4 cursor-pointer" style={{ accentColor: "#D4AF37" }} />
            <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
              Select All ({filtered.length})
            </span>
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-t-yellow-400 border-r-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3" style={{ color: G.dim, opacity: 0.4 }} />
            <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>No products yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: selectedIds.has(p.id) ? "rgba(212,175,55,0.08)" : "rgba(8,16,38,0.60)", border: `1px solid ${selectedIds.has(p.id) ? G.border : G.faint}` }}>
                {/* Checkbox */}
                <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="flex-shrink-0 w-4 h-4 cursor-pointer" style={{ accentColor: "#D4AF37" }} />
                {/* Image */}
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" style={{ color: G.dim, opacity: 0.4 }} />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.90)" }}>
                    {p.name}
                  </p>
                  <p className="font-inter text-[10px] truncate" style={{ color: "rgba(255,255,255,0.40)" }}>
                    {p.category || "Uncategorized"} {p.price_display ? `· ${p.price_display}` : ""}
                  </p>
                </div>
                {/* Status badges */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {p.is_best_seller && (
                    <Flame className="w-3.5 h-3.5" style={{ color: "#FB923C", fill: "#FB923C" }} />
                  )}
                  {p.is_new_arrival && (
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "#60A5FA", fill: "#60A5FA" }} />
                  )}
                  {p.is_trending && (
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: "#C084FC" }} />
                  )}
                  {p.is_out_of_stock && (
                    <PackageX className="w-3.5 h-3.5" style={{ color: "#F87171" }} />
                  )}
                  {p.is_featured && (
                    <Star className="w-3.5 h-3.5" style={{ color: G.text, fill: G.text }} />
                  )}
                  <span
                    className="px-1.5 py-0.5 rounded font-inter text-[8px] font-bold uppercase"
                    style={{
                      background: p.is_active ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                      color: p.is_active ? "#86EFAC" : "rgba(255,255,255,0.40)",
                    }}
                  >
                    {p.is_active ? "Active" : "Hidden"}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => moveOrder(p, -1)} className="p-1.5 rounded-lg hover:bg-white/5" title="Move up">
                    <ChevronUp className="w-3.5 h-3.5" style={{ color: G.dim }} />
                  </button>
                  <button onClick={() => moveOrder(p, 1)} className="p-1.5 rounded-lg hover:bg-white/5" title="Move down">
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: G.dim }} />
                  </button>
                  <button onClick={() => toggleBestSeller(p)} className="p-1.5 rounded-lg hover:bg-white/5" title="Toggle best seller">
                    <Flame className="w-3.5 h-3.5" style={{ color: p.is_best_seller ? "#FB923C" : G.dim, fill: p.is_best_seller ? "#FB923C" : "transparent" }} />
                  </button>
                  <button onClick={() => toggleNewArrival(p)} className="p-1.5 rounded-lg hover:bg-white/5" title="Toggle new arrival">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: p.is_new_arrival ? "#60A5FA" : G.dim, fill: p.is_new_arrival ? "#60A5FA" : "transparent" }} />
                  </button>
                  <button onClick={() => toggleTrending(p)} className="p-1.5 rounded-lg hover:bg-white/5" title="Toggle trending">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: p.is_trending ? "#C084FC" : G.dim }} />
                  </button>
                  <button onClick={() => toggleStock(p)} className="p-1.5 rounded-lg hover:bg-white/5" title="Toggle out of stock">
                    <PackageX className="w-3.5 h-3.5" style={{ color: p.is_out_of_stock ? "#F87171" : G.dim }} />
                  </button>
                  <button onClick={() => toggleFeatured(p)} className="p-1.5 rounded-lg hover:bg-white/5" title="Toggle featured">
                    <Star className="w-3.5 h-3.5" style={{ color: p.is_featured ? G.text : G.dim, fill: p.is_featured ? G.text : "transparent" }} />
                  </button>
                  <button onClick={() => toggleActive(p)} className="p-1.5 rounded-lg hover:bg-white/5" title="Toggle visibility">
                    {p.is_active ? <Eye className="w-3.5 h-3.5" style={{ color: G.dim }} /> : <EyeOff className="w-3.5 h-3.5" style={{ color: G.dim }} />}
                  </button>
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/5" title="Edit">
                    <Edit3 className="w-3.5 h-3.5" style={{ color: G.text }} />
                  </button>
                  <button onClick={() => duplicateProduct(p)} className="p-1.5 rounded-lg hover:bg-white/5" title="Duplicate">
                    <Copy className="w-3.5 h-3.5" style={{ color: G.dim }} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-white/5" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" style={{ color: "#F87171" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
              Pending Reviews
            </h2>
            <div className="space-y-2">
              {pendingReviews.map(r => (
                <div key={r.id} className="p-3 rounded-xl space-y-1" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-xs font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{r.reviewer_name}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className="w-3 h-3" style={{ color: n <= (r.rating||0) ? G.text : G.faint, fill: n <= (r.rating||0) ? G.text : "transparent" }} />
                      ))}
                    </div>
                  </div>
                  {r.title && <p className="font-inter text-xs font-semibold" style={{ color: G.text }}>{r.title}</p>}
                  <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.60)" }}>{r.comment}</p>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => approveReview(r)} className="px-3 py-1 rounded-lg font-inter text-[10px] font-bold" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.40)", color: "#86EFAC" }}>
                      Approve
                    </button>
                    <button onClick={() => deleteReview(r.id)} className="px-3 py-1 rounded-lg font-inter text-[10px] font-bold" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.30)", color: "#F87171" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full lg:w-[600px] max-h-[90vh] overflow-y-auto rounded-t-2xl lg:rounded-2xl p-5 space-y-4"
              style={{ background: "linear-gradient(180deg, rgba(5,10,28,0.99) 0%, rgba(2,5,16,1) 100%)", border: `1px solid ${G.border}` }}
            >
              <ProductEditor
                form={form}
                setForm={setForm}
                editId={editId}
                saving={saving}
                handleSave={handleSave}
                onClose={() => setShowForm(false)}
                allProducts={products}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

function FormField({ label, children }) {
  return (
    <div className="space-y-1">
      <p className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>{label}</p>
      {children}
    </div>
  );
}

import { useState } from "react";
import {
  Package, Images, DollarSign, ShoppingBag, FileText, ListChecks,
  Leaf, BookOpen, AlertTriangle, Truck, HelpCircle, Tag, Link2,
  Send, Save, X, Plus, Boxes,
} from "lucide-react";
import MediaTab from "./editor/MediaTab";
import MarketplaceTab from "./editor/MarketplaceTab";
import FAQsTab from "./editor/FAQsTab";
import SpecificationsTab from "./editor/SpecificationsTab";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

const TABS = [
  { id: "general", label: "General", icon: Package },
  { id: "media", label: "Media", icon: Images },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { id: "descriptions", label: "Descriptions", icon: FileText },
  { id: "specifications", label: "Specs", icon: ListChecks },
  { id: "ingredients", label: "Ingredients", icon: Leaf },
  { id: "usage", label: "Usage", icon: BookOpen },
  { id: "warnings", label: "Warnings", icon: AlertTriangle },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "seo", label: "SEO", icon: Tag },
  { id: "related", label: "Related", icon: Link2 },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "publish", label: "Publish", icon: Send },
];

function FormField({ label, children }) {
  return (
    <div className="space-y-1">
      <p className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>{label}</p>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange, danger }) {
  return (
    <label
      className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg transition-all"
      style={{
        background: checked ? (danger ? "rgba(248,113,113,0.12)" : G.bgHi) : "rgba(255,255,255,0.03)",
        border: `1px solid ${checked ? (danger ? "rgba(248,113,113,0.40)" : G.borderHi) : G.faint}`,
      }}
    >
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 cursor-pointer" style={{ accentColor: danger ? "#F87171" : "#D4AF37" }} />
      <span className="font-inter text-[11px] font-semibold" style={{ color: checked ? (danger ? "#FCA5A5" : G.text) : "rgba(255,255,255,0.60)" }}>{label}</span>
    </label>
  );
}

// ── Simple Tab Components ──

function GeneralTab({ form, setForm }) {
  return (
    <div className="space-y-3">
      <FormField label="Name *">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="form-input" />
      </FormField>
      <FormField label="Slug *">
        <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="form-input" />
      </FormField>
      <FormField label="Category">
        <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="form-input" placeholder="e.g. Books, Tools, Incense" />
      </FormField>
      <FormField label="Sub Category">
        <input value={form.sub_category || ""} onChange={e => setForm({ ...form, sub_category: e.target.value })} className="form-input" placeholder="e.g. Herbal Powders, Ayurvedic Oils" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Brand">
          <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="form-input" placeholder="e.g. Dabur, Hamdard" />
        </FormField>
        <FormField label="SKU">
          <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="form-input" placeholder="e.g. AYR-001" />
        </FormField>
        <FormField label="Barcode">
          <input value={form.barcode || ""} onChange={e => setForm({ ...form, barcode: e.target.value })} className="form-input" placeholder="EAN/UPC/ISBN" />
        </FormField>
      </div>
      <FormField label="Short Description">
        <input value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} className="form-input" />
      </FormField>
      <FormField label="Product Status">
        <select value={form.product_status || "active"} onChange={e => setForm({ ...form, product_status: e.target.value })} className="form-input" style={{ background: "rgba(8,16,38,0.60)" }}>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
          <option value="pending_review">Pending Review</option>
        </select>
      </FormField>
      <FormField label="Sort Order">
        <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="form-input" />
      </FormField>
    </div>
  );
}

function PricingTab({ form, setForm }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Price Display">
          <input value={form.price_display} onChange={e => setForm({ ...form, price_display: e.target.value })} className="form-input" placeholder="e.g. AED 50" />
        </FormField>
        <FormField label="Compare Price (original)">
          <input value={form.compare_price_display} onChange={e => setForm({ ...form, compare_price_display: e.target.value })} className="form-input" placeholder="e.g. AED 80" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Rating Display">
          <input value={form.rating_display} onChange={e => setForm({ ...form, rating_display: e.target.value })} className="form-input" placeholder="e.g. 4.5/5" />
        </FormField>
        <FormField label="Discount % (optional)">
          <input type="number" value={form.discount_percentage} onChange={e => setForm({ ...form, discount_percentage: e.target.value })} className="form-input" placeholder="e.g. 25" />
        </FormField>
      </div>
      {/* Country Price Overrides */}
      <div className="space-y-2">
        <p className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>Country Price Overrides</p>
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Override the base AED price for specific countries. Leave empty to use auto-converted price.</p>
        {["AE", "IN", "SA", "US", "GB"].map(code => {
          const overrides = (() => { try { return JSON.parse(form.country_price_overrides || "{}"); } catch { return {}; } })();
          const o = overrides[code] || {};
          return (
            <div key={code} className="flex items-center gap-2">
              <span className="font-inter text-[10px] font-bold w-8" style={{ color: G.text }}>{code}</span>
              <input value={o.price || ""} onChange={e => {
                const newO = { ...overrides, [code]: { ...o, price: e.target.value } };
                if (!e.target.value) { delete newO[code].price; if (!newO[code].compare_price) delete newO[code]; }
                setForm({ ...form, country_price_overrides: JSON.stringify(newO) });
              }} className="form-input flex-1" placeholder={`Price for ${code}`} />
              <input value={o.compare_price || ""} onChange={e => {
                const newO = { ...overrides, [code]: { ...o, compare_price: e.target.value } };
                if (!e.target.value) { delete newO[code].compare_price; if (!newO[code].price) delete newO[code]; }
                setForm({ ...form, country_price_overrides: JSON.stringify(newO) });
              }} className="form-input flex-1" placeholder="Compare price" />
            </div>
          );
        })}
      </div>
      <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
        All prices stored as AED base. Display strings are shown to customers as-is.
      </p>
    </div>
  );
}

function DescriptionsTab({ form, setForm }) {
  return (
    <div className="space-y-3">
      <FormField label="Full Description (English)">
        <textarea value={form.full_description} onChange={e => setForm({ ...form, full_description: e.target.value })} rows={8} className="form-input resize-none" />
      </FormField>
      <FormField label="Malayalam Description">
        <textarea value={form.malayalam_description} onChange={e => setForm({ ...form, malayalam_description: e.target.value })} rows={8} className="form-input resize-none font-malayalam" />
      </FormField>
      <FormField label="Arabic Description">
        <textarea value={form.arabic_description || ""} onChange={e => setForm({ ...form, arabic_description: e.target.value })} rows={8} className="form-input resize-none font-amiri" dir="rtl" />
      </FormField>
    </div>
  );
}

function IngredientsTab({ form, setForm }) {
  return (
    <div className="space-y-3">
      <FormField label="Ingredients">
        <textarea value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })} rows={6} className="form-input resize-none" />
      </FormField>
      <FormField label="Benefits">
        <textarea value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} rows={6} className="form-input resize-none" />
      </FormField>
    </div>
  );
}

function UsageTab({ form, setForm }) {
  return (
    <div className="space-y-3">
      <FormField label="How to Use / Usage Instructions">
        <textarea value={form.usage_instructions} onChange={e => setForm({ ...form, usage_instructions: e.target.value })} rows={10} className="form-input resize-none" placeholder="Enter each step on a new line for automatic numbered display..." />
      </FormField>
    </div>
  );
}

function WarningsTab({ form, setForm }) {
  return (
    <div className="space-y-3">
      <FormField label="Warnings">
        <textarea value={form.warnings} onChange={e => setForm({ ...form, warnings: e.target.value })} rows={4} className="form-input resize-none" />
      </FormField>
      <FormField label="Rules & Precautions">
        <textarea value={form.rules_precautions} onChange={e => setForm({ ...form, rules_precautions: e.target.value })} rows={4} className="form-input resize-none" />
      </FormField>
      <FormField label="Storage Instructions">
        <textarea value={form.storage_instructions} onChange={e => setForm({ ...form, storage_instructions: e.target.value })} rows={4} className="form-input resize-none" />
      </FormField>
    </div>
  );
}

function ShippingTab({ form, setForm }) {
  const specs = (() => {
    try { return JSON.parse(form.specifications || "{}"); } catch { return {}; }
  })();

  const updateSpec = (key, value) => {
    const newSpecs = { ...specs };
    if (value && value.trim()) newSpecs[key] = value;
    else delete newSpecs[key];
    setForm({ ...form, specifications: JSON.stringify(newSpecs, null, 2) });
  };

  return (
    <div className="space-y-3">
      <FormField label="Shipping Information">
        <textarea value={specs["Shipping Info"] || ""} onChange={e => updateSpec("Shipping Info", e.target.value)} rows={4} className="form-input resize-none" placeholder="e.g. Free shipping on orders over AED 100..." />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Delivery Time">
          <input value={specs["Delivery Time"] || ""} onChange={e => updateSpec("Delivery Time", e.target.value)} className="form-input" placeholder="e.g. 2-3 business days" />
        </FormField>
        <FormField label="Warranty">
          <input value={specs["Warranty"] || ""} onChange={e => updateSpec("Warranty", e.target.value)} className="form-input" placeholder="e.g. 1 year warranty" />
        </FormField>
      </div>
      <FormField label="Return Policy">
        <textarea value={specs["Return Policy"] || ""} onChange={e => updateSpec("Return Policy", e.target.value)} rows={4} className="form-input resize-none" placeholder="e.g. 30-day return policy. Items must be unused..." />
      </FormField>
      <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
        Shipping info is stored in product specifications and displayed in the Shipping accordion on the product page.
      </p>
    </div>
  );
}

function SEOTab({ form, setForm }) {
  const [tagInput, setTagInput] = useState("");

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

  return (
    <div className="space-y-3">
      <FormField label="URL Slug">
        <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="form-input" placeholder="product-url-slug" />
      </FormField>
      <FormField label="Search Tags">
        <div className="flex gap-2">
          <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} placeholder="Add tag..." className="form-input flex-1" />
          <button onClick={addTag} className="px-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <Plus className="w-4 h-4" style={{ color: G.text }} />
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap pt-1">
            {form.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md flex items-center gap-1 font-inter text-[10px]" style={{ background: G.bg, border: `1px solid ${G.faint}`, color: G.text }}>
                {tag}
                <button onClick={() => removeTag(idx)}><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        )}
      </FormField>
    </div>
  );
}

function RelatedProductsTab({ form, allProducts }) {
  const related = (allProducts || [])
    .filter(p => p.id !== form.id && p.category === form.category)
    .slice(0, 12);

  return (
    <div className="space-y-3">
      <p className="font-inter text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>
        Related products are automatically derived from the same category ("{form.category || "Uncategorized"}"). To change related products, update the product's category in the General tab.
      </p>
      {related.length > 0 ? (
        <div className="space-y-1.5">
          {related.map(p => (
            <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.faint}` }}>
              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-black/40">
                {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-3 h-3" style={{ color: G.dim, opacity: 0.4 }} /></div>
                )}
              </div>
              <span className="font-inter text-[11px] font-semibold truncate flex-1" style={{ color: "rgba(255,255,255,0.80)" }}>{p.name}</span>
              <span className="font-inter text-[9px]" style={{ color: G.dim }}>{p.price_display || "—"}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>No other products in this category yet.</p>
      )}
    </div>
  );
}

function InventoryTab({ form, setForm }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Stock Quantity (-1 = Unlimited)">
          <input type="number" value={form.stock_quantity ?? -1} onChange={e => setForm({ ...form, stock_quantity: parseInt(e.target.value) ?? -1 })} className="form-input" />
        </FormField>
        <FormField label="Low Stock Threshold">
          <input type="number" value={form.low_stock_threshold ?? 10} onChange={e => setForm({ ...form, low_stock_threshold: parseInt(e.target.value) || 10 })} className="form-input" />
        </FormField>
      </div>
      <FormField label="Warehouse Location">
        <input value={form.warehouse_location || ""} onChange={e => setForm({ ...form, warehouse_location: e.target.value })} className="form-input" placeholder="e.g. WH-A, Dubai Storage, Shelf-12" />
      </FormField>
      <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
        Stock quantity of -1 means unlimited stock. When stock reaches 0, the product is automatically marked out of stock. Low stock alerts appear when stock falls below the threshold.
      </p>
    </div>
  );
}

function PublishTab({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>Visibility</p>
        <div className="grid grid-cols-2 gap-2">
          <Toggle label="Active (Published)" checked={form.is_active} onChange={v => setForm({ ...form, is_active: v })} />
          <Toggle label="Out of Stock" checked={form.is_out_of_stock} onChange={v => setForm({ ...form, is_out_of_stock: v })} danger />
        </div>
      </div>
      <div className="space-y-2">
        <p className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>Badges & Highlights</p>
        <div className="grid grid-cols-2 gap-2">
          <Toggle label="Featured" checked={form.is_featured} onChange={v => setForm({ ...form, is_featured: v })} />
          <Toggle label="Best Seller" checked={form.is_best_seller} onChange={v => setForm({ ...form, is_best_seller: v })} />
          <Toggle label="New Arrival" checked={form.is_new_arrival} onChange={v => setForm({ ...form, is_new_arrival: v })} />
          <Toggle label="Trending" checked={form.is_trending} onChange={v => setForm({ ...form, is_trending: v })} />
        </div>
      </div>
    </div>
  );
}

// ── Main Editor ──

export default function ProductEditor({ form, setForm, editId, saving, handleSave, onClose, allProducts }) {
  const [activeTab, setActiveTab] = useState("general");

  const renderTab = () => {
    switch (activeTab) {
      case "general": return <GeneralTab form={form} setForm={setForm} />;
      case "media": return <MediaTab form={form} setForm={setForm} />;
      case "pricing": return <PricingTab form={form} setForm={setForm} />;
      case "marketplace": return <MarketplaceTab form={form} setForm={setForm} />;
      case "descriptions": return <DescriptionsTab form={form} setForm={setForm} />;
      case "specifications": return <SpecificationsTab form={form} setForm={setForm} />;
      case "ingredients": return <IngredientsTab form={form} setForm={setForm} />;
      case "usage": return <UsageTab form={form} setForm={setForm} />;
      case "warnings": return <WarningsTab form={form} setForm={setForm} />;
      case "shipping": return <ShippingTab form={form} setForm={setForm} />;
      case "faqs": return <FAQsTab form={form} setForm={setForm} />;
      case "seo": return <SEOTab form={form} setForm={setForm} />;
      case "related": return <RelatedProductsTab form={form} allProducts={allProducts} />;
      case "inventory": return <InventoryTab form={form} setForm={setForm} />;
      case "publish": return <PublishTab form={form} setForm={setForm} />;
      default: return null;
    }
  };

  return (
    <>
      {/* Header */}
      <div
        className="flex items-center justify-between sticky top-0 z-10 -mx-5 px-5 py-3"
        style={{ background: "rgba(5,10,28,0.98)", borderBottom: `1px solid ${G.faint}` }}
      >
        <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>
          {editId ? "Edit Product" : "New Product"}
        </h2>
        <button onClick={onClose}><X className="w-4 h-4" style={{ color: G.dim }} /></button>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 sticky top-[45px] z-10 pt-2"
        style={{ background: "rgba(5,10,28,0.98)" }}
      >
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-inter text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: isActive ? G.bgHi : "transparent",
                border: `1px solid ${isActive ? G.borderHi : G.faint}`,
                color: isActive ? G.text : G.dim,
              }}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-3 pt-2">
        {renderTab()}
      </div>

      {/* Save/Cancel */}
      <div
        className="flex gap-2 pt-3 sticky bottom-0 -mx-5 px-5 py-3"
        style={{ background: "rgba(5,10,28,0.98)", borderTop: `1px solid ${G.faint}` }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-inter text-xs font-bold disabled:opacity-40"
          style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving..." : editId ? "Update Product" : "Create Product"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl font-inter text-xs font-bold"
          style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.50)" }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(212,175,55,0.22);
          color: rgba(255,255,255,0.90);
          font-family: Inter, sans-serif;
          font-size: 13px;
          outline: none;
        }
        .form-input:focus { border-color: rgba(212,175,55,0.55); }
        .form-input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </>
  );
}
import { useState } from "react";
import { Plus, X, Eye, EyeOff, ShoppingBag, GripVertical, AlertCircle } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { MARKETPLACE_OPTIONS } from "@/lib/countryProfiles";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

function SectionLabel({ children }) {
  return (
    <p className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.text }}>
      {children}
    </p>
  );
}

// URL validation — must be valid http(s) URL
function isValidUrl(url) {
  if (!url) return true; // empty is valid (optional)
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Marketplace tab — manage unlimited affiliate/buy links with drag-and-drop reordering,
 * URL validation, platform, country, label, and visibility.
 * Also manages the dedicated Amazon Product URL field.
 */
export default function MarketplaceTab({ form, setForm }) {
  const [input, setInput] = useState({ platform: "", country: "", url: "", label: "", visible: true });
  const [urlError, setUrlError] = useState(false);

  const links = form.affiliate_links || [];

  const addLink = () => {
    if (!input.platform || !input.url.trim()) return;
    if (!isValidUrl(input.url.trim())) {
      setUrlError(true);
      return;
    }
    setUrlError(false);
    setForm({
      ...form,
      affiliate_links: [...links, {
        platform: input.platform,
        country: input.country,
        url: input.url.trim(),
        label: input.label.trim() || `Buy on ${input.platform}`,
        visible: input.visible !== false,
      }],
    });
    setInput({ platform: "", country: "", url: "", label: "", visible: true });
  };

  const removeLink = (idx) => {
    setForm({ ...form, affiliate_links: links.filter((_, i) => i !== idx) });
  };

  const toggleVisible = (idx) => {
    const newLinks = [...links];
    newLinks[idx] = { ...newLinks[idx], visible: !newLinks[idx].visible };
    setForm({ ...form, affiliate_links: newLinks });
  };

  const updateLinkField = (idx, field, value) => {
    const newLinks = [...links];
    newLinks[idx] = { ...newLinks[idx], [field]: value };
    setForm({ ...form, affiliate_links: newLinks });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const newLinks = Array.from(links);
    const [moved] = newLinks.splice(result.source.index, 1);
    newLinks.splice(result.destination.index, 0, moved);
    setForm({ ...form, affiliate_links: newLinks });
  };

  // Auto-derive country from platform selection
  const handlePlatformChange = (platformValue) => {
    const opt = MARKETPLACE_OPTIONS.find(o => o.value === platformValue);
    const country = opt?.countries?.[0] || "";
    setInput({ ...input, platform: platformValue, country });
  };

  const inputUrlValid = isValidUrl(input.url.trim());

  return (
    <div className="space-y-4">
      {/* Amazon Product URL — dedicated field (unchanged) */}
      <div className="space-y-2 p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <SectionLabel>Amazon Product URL</SectionLabel>
        <input
          value={form.amazon_url || ""}
          onChange={e => setForm({ ...form, amazon_url: e.target.value })}
          className="form-input"
          placeholder="https://www.amazon.ae/dp/BXXXXXXXX"
        />
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          Paste this product's exact Amazon listing URL. The "Buy on Amazon" button opens this link. Leave empty to hide the Amazon button.
        </p>
      </div>

      {/* Existing Links — drag-and-drop reorderable */}
      {links.length > 0 && (
        <div className="space-y-2">
          <SectionLabel>Marketplace Links ({links.length}) — drag to reorder</SectionLabel>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="marketplace-links">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {links.map((link, idx) => {
                    const linkUrlValid = isValidUrl(link.url);
                    return (
                      <Draggable key={`link-${idx}`} draggableId={`link-${idx}`} index={idx}>
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className="space-y-2 p-2.5 rounded-lg"
                            style={{
                              background: snapshot.isDragging ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${link.visible === false ? G.faint : snapshot.isDragging ? G.borderHi : G.border}`,
                              ...dragProvided.draggableProps.style,
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span {...dragProvided.dragHandleProps} className="cursor-grab active:cursor-grabbing flex-shrink-0">
                                <GripVertical className="w-3.5 h-3.5" style={{ color: G.dim }} />
                              </span>
                              <ShoppingBag className="w-3 h-3 flex-shrink-0" style={{ color: G.text }} />
                              <span className="font-inter text-[11px] font-bold flex-1" style={{ color: G.text }}>{link.platform}</span>
                              {link.country && (
                                <span className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: G.bg, color: G.dim }}>{link.country}</span>
                              )}
                              <button onClick={() => toggleVisible(idx)} className="p-1 rounded" title={link.visible === false ? "Show" : "Hide"}>
                                {link.visible === false ? <EyeOff className="w-3 h-3" style={{ color: G.dim }} /> : <Eye className="w-3 h-3" style={{ color: G.text }} />}
                              </button>
                              <button onClick={() => removeLink(idx)} className="p-1 rounded" title="Delete">
                                <X className="w-3 h-3" style={{ color: "#F87171" }} />
                              </button>
                            </div>
                            {/* Editable URL field with validation */}
                            <div className="relative">
                              <input
                                value={link.url || ""}
                                onChange={e => updateLinkField(idx, "url", e.target.value)}
                                className="form-input"
                                placeholder="https://..."
                                style={!linkUrlValid ? { borderColor: "rgba(248,113,113,0.60)" } : {}}
                              />
                              {!linkUrlValid && (
                                <div className="flex items-center gap-1 pt-1">
                                  <AlertCircle className="w-2.5 h-2.5" style={{ color: "#F87171" }} />
                                  <span className="font-inter text-[9px]" style={{ color: "#FCA5A5" }}>Invalid URL — must start with http:// or https://</span>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                value={link.label || ""}
                                onChange={e => updateLinkField(idx, "label", e.target.value)}
                                className="form-input"
                                placeholder="Button label"
                              />
                              <input
                                value={link.country || ""}
                                onChange={e => updateLinkField(idx, "country", e.target.value)}
                                className="form-input"
                                placeholder="Country code (e.g. AE, IN)"
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Add New Link */}
      <div className="space-y-2 p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <SectionLabel>Add Marketplace Link</SectionLabel>
        <select
          value={input.platform}
          onChange={e => handlePlatformChange(e.target.value)}
          className="form-input"
          style={{ background: "rgba(8,16,38,0.60)" }}
        >
          <option value="">Select marketplace...</option>
          {MARKETPLACE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="relative">
          <input
            value={input.url}
            onChange={e => { setInput({ ...input, url: e.target.value }); setUrlError(false); }}
            className="form-input"
            placeholder="Product URL (https://...)"
            style={urlError || (input.url && !inputUrlValid) ? { borderColor: "rgba(248,113,113,0.60)" } : {}}
          />
          {(urlError || (input.url && !inputUrlValid)) && (
            <div className="flex items-center gap-1 pt-1">
              <AlertCircle className="w-2.5 h-2.5" style={{ color: "#F87171" }} />
              <span className="font-inter text-[9px]" style={{ color: "#FCA5A5" }}>Enter a valid URL starting with http:// or https://</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={input.label}
            onChange={e => setInput({ ...input, label: e.target.value })}
            className="form-input"
            placeholder="Button label (optional)"
          />
          <input
            value={input.country}
            onChange={e => setInput({ ...input, country: e.target.value })}
            className="form-input"
            placeholder="Country (auto-filled)"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={input.visible !== false}
            onChange={e => setInput({ ...input, visible: e.target.checked })}
            className="w-3.5 h-3.5 cursor-pointer"
            style={{ accentColor: "#D4AF37" }}
          />
          <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>Visible on storefront</span>
        </label>
        <button
          onClick={addLink}
          disabled={!input.platform || !input.url.trim() || !inputUrlValid}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg font-inter text-[10px] font-bold disabled:opacity-30"
          style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}
        >
          <Plus className="w-3 h-3" /> Add Link
        </button>
      </div>

      <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
        Drag the grip handle to reorder buttons. Links are shown on the storefront in this order. Hidden links and empty URLs are automatically excluded.
      </p>
    </div>
  );
}
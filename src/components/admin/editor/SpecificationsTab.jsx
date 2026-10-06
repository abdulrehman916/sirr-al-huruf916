import { useState } from "react";
import { Plus, X, ListChecks } from "lucide-react";

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

// Reserved keys managed by the Shipping tab — don't show them here
const RESERVED_KEYS = ["Shipping Info", "Delivery Time", "Return Policy", "Warranty"];

/**
 * Specifications tab — manage unlimited key-value specification pairs.
 * Specifications are stored as a JSON object in form.specifications.
 * Reserved shipping-related keys are managed by the Shipping tab.
 */
export default function SpecificationsTab({ form, setForm }) {
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");

  const specs = (() => {
    try { return JSON.parse(form.specifications || "{}"); } catch { return {}; }
  })();

  const specEntries = Object.entries(specs).filter(([key]) => !RESERVED_KEYS.includes(key));

  const addSpec = () => {
    if (!keyInput.trim()) return;
    const newSpecs = { ...specs, [keyInput.trim()]: valueInput.trim() };
    setForm({ ...form, specifications: JSON.stringify(newSpecs, null, 2) });
    setKeyInput("");
    setValueInput("");
  };

  const removeSpec = (key) => {
    const newSpecs = { ...specs };
    delete newSpecs[key];
    setForm({ ...form, specifications: JSON.stringify(newSpecs, null, 2) });
  };

  const updateSpecValue = (key, value) => {
    const newSpecs = { ...specs, [key]: value };
    setForm({ ...form, specifications: JSON.stringify(newSpecs, null, 2) });
  };

  return (
    <div className="space-y-4">
      {/* Existing Specs */}
      {specEntries.length > 0 && (
        <div className="space-y-2">
          <SectionLabel>Specifications ({specEntries.length})</SectionLabel>
          {specEntries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-2 p-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.faint}` }}
            >
              <ListChecks className="w-3 h-3 flex-shrink-0" style={{ color: G.dim }} />
              <span className="font-inter text-[11px] font-bold flex-shrink-0 w-24 truncate" style={{ color: G.text }}>{key}</span>
              <input
                value={value || ""}
                onChange={e => updateSpecValue(key, e.target.value)}
                className="form-input flex-1"
                placeholder="Value..."
              />
              <button onClick={() => removeSpec(key)} className="p-1 rounded">
                <X className="w-3 h-3" style={{ color: "#F87171" }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Spec */}
      <div className="space-y-2 p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <SectionLabel>Add Specification</SectionLabel>
        <div className="flex gap-2">
          <input
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSpec()}
            className="form-input w-1/3"
            placeholder="Key (e.g. Material)"
          />
          <input
            value={valueInput}
            onChange={e => setValueInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSpec()}
            className="form-input flex-1"
            placeholder="Value (e.g. Brass)"
          />
          <button onClick={addSpec} className="px-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
            <Plus className="w-4 h-4" style={{ color: G.text }} />
          </button>
        </div>
      </div>

      <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
        Add unlimited specification pairs (Material, Weight, Dimensions, etc.). Shipping-related specs are managed in the Shipping tab.
      </p>
    </div>
  );
}
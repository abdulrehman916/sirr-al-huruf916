/**
 * FeatureConfigEditor — Inline editor for a single feature's pricing and description.
 * Reads from the FeatureConfig entity; creates/updates on save.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Edit3 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function FeatureConfigEditor({ pagePath, pageName, feature, existingConfig, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState(existingConfig?.price || "");
  const [description, setDescription] = useState(existingConfig?.description || "");
  const [featureName, setFeatureName] = useState(existingConfig?.feature_name || feature.label);

  const configId = existingConfig?.config_id || `FC-${feature.id}`;

  const handleSave = async () => {
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const data = {
        config_id: configId,
        page_path: pagePath,
        page_name: pageName,
        feature_id: feature.id,
        feature_name: featureName.trim() || feature.label,
        price: price.trim(),
        description: description.trim(),
        icon: feature.icon,
        is_active: true,
        sort_order: existingConfig?.sort_order || 0,
        updated_by: me?.id || "",
        updated_at: new Date().toISOString(),
      };

      if (existingConfig?.id) {
        await base44.entities.FeatureConfig.update(existingConfig.id, data);
      } else {
        await base44.entities.FeatureConfig.create(data);
      }

      setEditing(false);
      if (onSaved) onSaved();
    } catch (e) {
      console.error("Failed to save feature config:", e);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setPrice(existingConfig?.price || "");
    setDescription(existingConfig?.description || "");
    setFeatureName(existingConfig?.feature_name || feature.label);
    setEditing(true);
  };

  return (
    <div className="rounded-lg border p-3" style={{
      background: editing ? G.bgHi : G.bg,
      borderColor: editing ? G.borderHi : G.border,
    }}>
      <div className="flex items-center gap-3">
        <span className="text-lg flex-shrink-0">{feature.icon}</span>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={featureName}
              onChange={e => setFeatureName(e.target.value)}
              placeholder="Feature display name"
              className="w-full px-2 py-1 rounded text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
            />
          ) : (
            <p className="text-sm font-medium text-white truncate">
              {existingConfig?.feature_name || feature.label}
            </p>
          )}
          <p className="text-[10px] text-white/35 mt-0.5 font-mono">{feature.id}</p>
        </div>
        {!editing && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold" style={{ color: existingConfig?.price ? G.text : "rgba(255,255,255,0.25)" }}>
              {existingConfig?.price || "No price set"}
            </p>
          </div>
        )}
        {!editing && (
          <button onClick={startEdit}
            className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.50)" }}>
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-3">
          <div>
            <label className="text-[10px] text-white/40 block mb-1">Price (e.g. "AED 50" or "Free")</label>
            <input value={price} onChange={e => setPrice(e.target.value)}
              placeholder="AED 50"
              className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
          </div>
          <div>
            <label className="text-[10px] text-white/40 block mb-1">Description (optional — shown on locked screen)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Description shown to users when this feature is locked..."
              rows={2}
              className="w-full px-2 py-1.5 rounded text-sm text-white outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={{ background: "transparent", border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.50)" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, Save, Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { COUNTRY_PROFILES } from "@/lib/countryProfiles";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const FOCUS_COUNTRIES = ["AE", "IN", "SA", "US", "GB", "QA", "KW", "BH", "OM"];

export default function ShippingManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [newCountry, setNewCountry] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const list = await base44.entities.ShopSettings.list();
      let s = list?.[0];
      if (!s) {
        s = await base44.entities.ShopSettings.create({ settings_id: "SHOP-SETTINGS-MAIN", shipping_config: {}, currency_config: {}, marketplace_config: {}, auto_detect_country: true, deep_links_enabled: true, default_marketplace: "Amazon" });
      }
      setSettings(s);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.ShopSettings.update(settings.id, { shipping_config: settings.shipping_config || {}, updated_at: new Date().toISOString() });
      toast({ title: "Shipping settings saved" });
    } catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const updateCountry = (code, field, value) => {
    const config = { ...(settings.shipping_config || {}) };
    if (!config[code]) config[code] = {};
    config[code][field] = value;
    setSettings({ ...settings, shipping_config: config });
  };

  const addCountry = () => {
    if (!newCountry || settings.shipping_config?.[newCountry]) return;
    const config = { ...(settings.shipping_config || {}) };
    config[newCountry] = { free_shipping_threshold: 100, shipping_cost: 15, delivery_time: "3-5 days", express_available: true };
    setSettings({ ...settings, shipping_config: config });
    setShowAddCountry(false);
    setNewCountry("");
  };

  if (loading || !settings) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: `2px solid ${G.text}`, borderRight: "2px solid transparent" }} /></div>;
  }

  const shippingConfig = settings.shipping_config || {};
  const countries = Object.keys(shippingConfig);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4" style={{ color: G.text }} />
          <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Shipping Settings</h2>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-inter text-xs font-bold disabled:opacity-40" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.50)" }}>
        Configure shipping costs, free shipping thresholds, and delivery times per country. Default profiles from country profiles are shown as reference.
      </p>

      <div className="space-y-2">
        {countries.map(code => {
          const cfg = shippingConfig[code];
          const profile = COUNTRY_PROFILES[code];
          return (
            <motion.div key={code} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-3 rounded-lg space-y-2" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
              <div className="flex items-center justify-between">
                <span className="font-inter text-xs font-bold" style={{ color: G.text }}>{code} — {profile?.region || "Custom"}</span>
                <span className="font-inter text-[9px]" style={{ color: G.dim }}>Default: {profile?.shipping?.label || "—"}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <p className="font-inter text-[9px] uppercase mb-0.5" style={{ color: G.dim }}>Free Ship Threshold</p>
                  <input type="number" value={cfg.free_shipping_threshold ?? ""} onChange={e => updateCountry(code, "free_shipping_threshold", parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded bg-white/5 outline-none font-inter text-[10px]" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="AED" />
                </div>
                <div>
                  <p className="font-inter text-[9px] uppercase mb-0.5" style={{ color: G.dim }}>Shipping Cost</p>
                  <input type="number" value={cfg.shipping_cost ?? ""} onChange={e => updateCountry(code, "shipping_cost", parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded bg-white/5 outline-none font-inter text-[10px]" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="AED" />
                </div>
                <div>
                  <p className="font-inter text-[9px] uppercase mb-0.5" style={{ color: G.dim }}>Delivery Time</p>
                  <input value={cfg.delivery_time || ""} onChange={e => updateCountry(code, "delivery_time", e.target.value)}
                    className="w-full px-2 py-1 rounded bg-white/5 outline-none font-inter text-[10px]" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="3-5 days" />
                </div>
                <div>
                  <p className="font-inter text-[9px] uppercase mb-0.5" style={{ color: G.dim }}>Express</p>
                  <select value={cfg.express_available ? "yes" : "no"} onChange={e => updateCountry(code, "express_available", e.target.value === "yes")}
                    className="w-full px-2 py-1 rounded bg-white/5 outline-none font-inter text-[10px]" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.60)" }}>
                    <option value="yes">Available</option>
                    <option value="no">Not available</option>
                  </select>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Country */}
      {showAddCountry ? (
        <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <select value={newCountry} onChange={e => setNewCountry(e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 outline-none font-inter text-xs" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.60)" }}>
            <option value="">Select country...</option>
            {FOCUS_COUNTRIES.filter(c => !shippingConfig[c]).map(c => <option key={c} value={c}>{c} — {COUNTRY_PROFILES[c]?.region || ""}</option>)}
          </select>
          <button onClick={addCountry} disabled={!newCountry} className="px-3 py-1.5 rounded-lg font-inter text-[10px] font-bold disabled:opacity-30" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>Add</button>
          <button onClick={() => setShowAddCountry(false)} className="p-1.5 rounded"><X className="w-3.5 h-3.5" style={{ color: G.dim }} /></button>
        </div>
      ) : (
        <button onClick={() => setShowAddCountry(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-inter text-xs font-bold w-full" style={{ background: "rgba(255,255,255,0.03)", border: `1px dashed ${G.faint}`, color: G.dim }}>
          <Plus className="w-3.5 h-3.5" /> Add Country Shipping Config
        </button>
      )}
    </div>
  );
}
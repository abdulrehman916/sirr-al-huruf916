import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Save, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { COUNTRY_PROFILES } from "@/lib/countryProfiles";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const CURRENCY_MAP = {
  AE: { code: "AED", symbol: "د.إ", format: "{symbol} {amount}" },
  IN: { code: "INR", symbol: "₹", format: "{symbol}{amount}" },
  SA: { code: "SAR", symbol: "ر.س", format: "{symbol} {amount}" },
  US: { code: "USD", symbol: "$", format: "{symbol}{amount}" },
  GB: { code: "GBP", symbol: "£", format: "{symbol}{amount}" },
  QA: { code: "QAR", symbol: "ر.ق", format: "{symbol} {amount}" },
  KW: { code: "KWD", symbol: "د.ك", format: "{symbol} {amount}" },
  BH: { code: "BHD", symbol: "د.ب", format: "{symbol} {amount}" },
  OM: { code: "OMR", symbol: "ر.ع", format: "{symbol} {amount}" },
};

const FOCUS_COUNTRIES = Object.keys(CURRENCY_MAP);

export default function CurrencySettingsPanel() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      await base44.entities.ShopSettings.update(settings.id, { currency_config: settings.currency_config || {}, updated_at: new Date().toISOString() });
      toast({ title: "Currency settings saved" });
    } catch (err) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const updateCurrency = (countryCode, field, value) => {
    const config = { ...(settings.currency_config || {}) };
    if (!config[countryCode]) config[countryCode] = { ...CURRENCY_MAP[countryCode] };
    config[countryCode][field] = value;
    setSettings({ ...settings, currency_config: config });
  };

  if (loading || !settings) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: `2px solid ${G.text}`, borderRight: "2px solid transparent" }} /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: G.text }} />
          <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Currency Settings</h2>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-inter text-xs font-bold disabled:opacity-40" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* AED Base Price Reference */}
      <div className="p-4 rounded-xl space-y-1" style={{ background: "rgba(212,175,55,0.08)", border: `1px solid ${G.border}` }}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" style={{ color: G.text }} />
          <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Base Currency: AED</h3>
        </div>
        <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.60)" }}>
          All product prices are stored in AED as the base unit. Customer-facing prices are automatically converted to the local currency based on the customer's selected country. Exchange rates are fetched live and cached.
        </p>
        <p className="font-inter text-[10px]" style={{ color: G.dim }}>
          Country-specific price overrides can be set per-product in the Product Editor's Pricing tab.
        </p>
      </div>

      {/* Per-Country Currency Config */}
      <div className="space-y-2">
        <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Currency Display Per Country</h3>
        {FOCUS_COUNTRIES.map(code => {
          const cfg = (settings.currency_config || {})[code] || CURRENCY_MAP[code];
          const profile = COUNTRY_PROFILES[code];
          return (
            <motion.div key={code} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-3 rounded-lg" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-inter text-xs font-bold" style={{ color: G.text }}>{code} — {profile?.region || ""}</span>
                <span className="font-inter text-[9px]" style={{ color: G.dim }}>Tax: {profile?.taxLabel || "—"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="font-inter text-[9px] uppercase mb-0.5" style={{ color: G.dim }}>Code</p>
                  <input value={cfg?.currency_code || cfg?.code || ""} onChange={e => updateCurrency(code, "currency_code", e.target.value)}
                    className="w-full px-2 py-1 rounded bg-white/5 outline-none font-inter text-[10px]" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} />
                </div>
                <div>
                  <p className="font-inter text-[9px] uppercase mb-0.5" style={{ color: G.dim }}>Symbol</p>
                  <input value={cfg?.symbol || ""} onChange={e => updateCurrency(code, "symbol", e.target.value)}
                    className="w-full px-2 py-1 rounded bg-white/5 outline-none font-inter text-[10px]" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} />
                </div>
                <div>
                  <p className="font-inter text-[9px] uppercase mb-0.5" style={{ color: G.dim }}>Format</p>
                  <input value={cfg?.display_format || cfg?.format || ""} onChange={e => updateCurrency(code, "display_format", e.target.value)}
                    className="w-full px-2 py-1 rounded bg-white/5 outline-none font-inter text-[10px]" style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }} placeholder="{symbol} {amount}" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
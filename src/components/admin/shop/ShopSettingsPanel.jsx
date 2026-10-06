import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Globe, Truck, DollarSign, ShoppingBag, Smartphone, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { COUNTRY_PROFILES, MARKETPLACE_REGISTRY } from "@/lib/countryProfiles";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

const SUPPORTED_COUNTRIES = [
  { code: "", label: "Auto-detect (customer locale)" },
  { code: "AE", label: "🇦🇪 UAE" },
  { code: "IN", label: "🇮🇳 India" },
  { code: "SA", label: "🇸🇦 Saudi Arabia" },
  { code: "US", label: "🇺🇸 USA" },
  { code: "GB", label: "🇬🇧 UK" },
];

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5" style={{ color: G.text }} />
      <p className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>{children}</p>
    </div>
  );
}

export default function ShopSettingsPanel() {
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
        // Create default settings record
        s = await base44.entities.ShopSettings.create({
          settings_id: "SHOP-SETTINGS-MAIN",
          active_country: "",
          auto_detect_country: true,
          deep_links_enabled: true,
          default_marketplace: "Amazon",
          shipping_config: {},
          currency_config: {},
          marketplace_config: {},
        });
      }
      setSettings(s);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.ShopSettings.update(settings.id, {
        active_country: settings.active_country || "",
        auto_detect_country: settings.auto_detect_country !== false,
        deep_links_enabled: settings.deep_links_enabled !== false,
        default_marketplace: settings.default_marketplace || "Amazon",
        shipping_config: settings.shipping_config || {},
        currency_config: settings.currency_config || {},
        marketplace_config: settings.marketplace_config || {},
        updated_at: new Date().toISOString(),
      });
      toast({ title: "Settings saved" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: "2px solid " + G.text, borderRight: "2px solid transparent" }} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" style={{ color: G.text }} />
          <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Shop Settings</h2>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-inter text-xs font-bold disabled:opacity-40" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Country Override */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
        <SectionLabel icon={Globe}>Active Country</SectionLabel>
        <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.50)" }}>
          Customers' country is auto-detected by default. Override to force a specific country for all customers.
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg" style={{ background: settings.auto_detect_country !== false ? G.bgHi : "rgba(255,255,255,0.03)", border: `1px solid ${settings.auto_detect_country !== false ? G.borderHi : G.faint}` }}>
            <input type="checkbox" checked={settings.auto_detect_country !== false} onChange={e => setSettings({ ...settings, auto_detect_country: e.target.checked })} className="w-4 h-4 cursor-pointer" style={{ accentColor: "#D4AF37" }} />
            <span className="font-inter text-[11px] font-semibold" style={{ color: settings.auto_detect_country !== false ? G.text : "rgba(255,255,255,0.60)" }}>Auto-detect customer country</span>
          </label>
          {settings.auto_detect_country === false && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <select
                value={settings.active_country || ""}
                onChange={e => setSettings({ ...settings, active_country: e.target.value })}
                className="w-full px-3 py-2 rounded-lg outline-none font-inter text-xs"
                style={{ border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.80)" }}
              >
                {SUPPORTED_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <p className="font-inter text-[10px] mt-1" style={{ color: G.dim }}>
                All customers will see marketplace links and shipping for: {SUPPORTED_COUNTRIES.find(c => c.code === settings.active_country)?.label || "Auto-detect"}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Deep Links */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
        <SectionLabel icon={Smartphone}>Native App Deep Links</SectionLabel>
        <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.50)" }}>
          When enabled, marketplace buttons try to open the native Amazon/Flipkart/Noon app on mobile. Falls back to the website if the app is not installed.
        </p>
        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg" style={{ background: settings.deep_links_enabled !== false ? G.bgHi : "rgba(255,255,255,0.03)", border: `1px solid ${settings.deep_links_enabled !== false ? G.borderHi : G.faint}` }}>
          <input type="checkbox" checked={settings.deep_links_enabled !== false} onChange={e => setSettings({ ...settings, deep_links_enabled: e.target.checked })} className="w-4 h-4 cursor-pointer" style={{ accentColor: "#D4AF37" }} />
          <span className="font-inter text-[11px] font-semibold" style={{ color: settings.deep_links_enabled !== false ? G.text : "rgba(255,255,255,0.60)" }}>Open native apps when available</span>
        </label>
      </div>

      {/* Default Marketplace */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
        <SectionLabel icon={ShoppingBag}>Default Marketplace</SectionLabel>
        <select
          value={settings.default_marketplace || "Amazon"}
          onChange={e => setSettings({ ...settings, default_marketplace: e.target.value })}
          className="w-full px-3 py-2 rounded-lg outline-none font-inter text-xs"
          style={{ border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.80)" }}
        >
          {["Amazon", "Flipkart", "Noon", "External"].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Shipping / Currency / Marketplace profiles per country */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
        <SectionLabel icon={Truck}>Country Profiles (Shipping & Currency)</SectionLabel>
        <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.50)" }}>
          Shipping times, tax labels, and marketplace routing are configured per country. Supported countries:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {Object.entries(COUNTRY_PROFILES).slice(0, 12).map(([code, profile]) => (
            <div key={code} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.faint}` }}>
              <p className="font-inter text-[11px] font-bold" style={{ color: G.text }}>{code}</p>
              <p className="font-inter text-[9px]" style={{ color: G.dim }}>{profile.shipping?.label}</p>
              <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>{profile.taxLabel}</p>
              <p className="font-inter text-[9px] truncate" style={{ color: "rgba(255,255,255,0.40)" }}>{(profile.marketplaces || []).map(id => MARKETPLACE_REGISTRY[id]?.name).filter(Boolean).join(", ")}</p>
            </div>
          ))}
        </div>
        <p className="font-inter text-[10px]" style={{ color: G.dim }}>
          Profiles are managed in <code>countryProfiles.js</code>. Add new countries there to extend support. The owner's active country override takes priority over auto-detection.
        </p>
      </div>
    </div>
  );
}
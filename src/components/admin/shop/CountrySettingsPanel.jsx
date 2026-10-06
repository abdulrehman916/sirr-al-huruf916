import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Save, Smartphone, ShoppingBag, Languages, Receipt, MapPin, Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { COUNTRY_PROFILES, MARKETPLACE_REGISTRY } from "@/lib/countryProfiles";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const SUPPORTED_COUNTRIES = [
  { code: "AE", label: "🇦🇪 UAE", region: "Middle East" },
  { code: "IN", label: "🇮🇳 India", region: "South Asia" },
  { code: "SA", label: "🇸🇦 Saudi Arabia", region: "Middle East" },
  { code: "US", label: "🇺🇸 USA", region: "North America" },
  { code: "GB", label: "🇬🇧 UK", region: "Europe" },
  { code: "QA", label: "🇶🇦 Qatar", region: "Middle East" },
  { code: "KW", label: "🇰🇼 Kuwait", region: "Middle East" },
  { code: "BH", label: "🇧🇭 Bahrain", region: "Middle East" },
  { code: "OM", label: "🇴🇲 Oman", region: "Middle East" },
];

const ALL_MARKETPLACES = Object.keys(MARKETPLACE_REGISTRY);

export default function CountrySettingsPanel() {
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
        s = await base44.entities.ShopSettings.create({
          settings_id: "SHOP-SETTINGS-MAIN",
          active_country: "", auto_detect_country: true,
          deep_links_enabled: true, default_marketplace: "Amazon",
          shipping_config: {}, currency_config: {}, marketplace_config: {},
        });
      }
      setSettings(s);
    } catch { /* ignore */ }
    finally { setLoading(false); }
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
        marketplace_config: settings.marketplace_config || {},
        updated_at: new Date().toISOString(),
      });
      toast({ title: "Country settings saved" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateMarketplacePriority = (countryCode, newOrder) => {
    const config = { ...(settings.marketplace_config || {}) };
    config[countryCode] = newOrder;
    setSettings({ ...settings, marketplace_config: config });
  };

  const moveMarketplace = (countryCode, idx, dir) => {
    const current = (settings.marketplace_config?.[countryCode]) ||
      (COUNTRY_PROFILES[countryCode]?.marketplaces || []);
    const arr = [...current];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    updateMarketplacePriority(countryCode, arr);
  };

  const toggleMarketplace = (countryCode, mp) => {
    const current = (settings.marketplace_config?.[countryCode]) ||
      (COUNTRY_PROFILES[countryCode]?.marketplaces || []);
    if (current.includes(mp)) {
      updateMarketplacePriority(countryCode, current.filter(m => m !== mp));
    } else {
      updateMarketplacePriority(countryCode, [...current, mp]);
    }
  };

  const addCountryConfig = () => {
    if (!newCountry) return;
    const config = { ...(settings.marketplace_config || {}) };
    if (!config[newCountry]) {
      config[newCountry] = COUNTRY_PROFILES[newCountry]?.marketplaces || ["Amazon"];
    }
    setSettings({ ...settings, marketplace_config: config });
    setShowAddCountry(false);
    setNewCountry("");
  };

  if (loading || !settings) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full animate-spin" style={{ borderTop: `2px solid ${G.text}`, borderRight: "2px solid transparent" }} /></div>;
  }

  const marketplaceConfig = settings.marketplace_config || {};
  const configuredCountries = Object.keys(marketplaceConfig);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" style={{ color: G.text }} />
          <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Country Settings</h2>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-inter text-xs font-bold disabled:opacity-40" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Active Country Override */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" style={{ color: G.text }} />
          <p className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Active Country</p>
        </div>
        <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.50)" }}>
          Customers' country is auto-detected by default. Override to force a specific country for all customers.
        </p>
        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg" style={{ background: settings.auto_detect_country !== false ? G.bgHi : "rgba(255,255,255,0.03)", border: `1px solid ${settings.auto_detect_country !== false ? G.borderHi : G.faint}` }}>
          <input type="checkbox" checked={settings.auto_detect_country !== false} onChange={e => setSettings({ ...settings, auto_detect_country: e.target.checked })} className="w-4 h-4 cursor-pointer" style={{ accentColor: "#D4AF37" }} />
          <span className="font-inter text-[11px] font-semibold" style={{ color: settings.auto_detect_country !== false ? G.text : "rgba(255,255,255,0.60)" }}>Auto-detect customer country</span>
        </label>
        {settings.auto_detect_country === false && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <select value={settings.active_country || ""} onChange={e => setSettings({ ...settings, active_country: e.target.value })}
              className="w-full px-3 py-2 rounded-lg outline-none font-inter text-xs" style={{ border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.80)" }}>
              <option value="">Select country...</option>
              {SUPPORTED_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </motion.div>
        )}
      </div>

      {/* Deep Links + Default Marketplace */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl space-y-2" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5" style={{ color: G.text }} />
            <p className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Deep Links</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg" style={{ background: settings.deep_links_enabled !== false ? G.bgHi : "rgba(255,255,255,0.03)", border: `1px solid ${settings.deep_links_enabled !== false ? G.borderHi : G.faint}` }}>
            <input type="checkbox" checked={settings.deep_links_enabled !== false} onChange={e => setSettings({ ...settings, deep_links_enabled: e.target.checked })} className="w-4 h-4 cursor-pointer" style={{ accentColor: "#D4AF37" }} />
            <span className="font-inter text-[11px] font-semibold" style={{ color: settings.deep_links_enabled !== false ? G.text : "rgba(255,255,255,0.60)" }}>Open native apps</span>
          </label>
        </div>
        <div className="p-4 rounded-xl space-y-2" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" style={{ color: G.text }} />
            <p className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Default Marketplace</p>
          </div>
          <select value={settings.default_marketplace || "Amazon"} onChange={e => setSettings({ ...settings, default_marketplace: e.target.value })}
            className="w-full px-3 py-2 rounded-lg outline-none font-inter text-xs" style={{ border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.90)", background: "rgba(8,16,38,0.80)" }}>
            {["Amazon", "Flipkart", "Noon", "External"].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Per-Country Marketplace Routing */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-3.5 h-3.5" style={{ color: G.text }} />
          <p className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Marketplace Routing Per Country</p>
        </div>
        <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.50)" }}>
          Set the priority order of marketplace platforms for each country. The first available marketplace will be shown as the primary buy button.
        </p>

        <div className="space-y-2">
          {SUPPORTED_COUNTRIES.map(country => {
            const profile = COUNTRY_PROFILES[country.code];
            const routing = marketplaceConfig[country.code] || profile?.marketplaces || [];
            return (
              <div key={country.code} className="p-3 rounded-lg space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.faint}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-inter text-xs font-bold" style={{ color: G.text }}>{country.label}</span>
                    <span className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: G.bg, color: G.dim }}>{country.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile?.taxLabel && <span className="font-inter text-[9px] flex items-center gap-1" style={{ color: G.dim }}><Receipt className="w-2.5 h-2.5" />{profile.taxLabel}</span>}
                    {profile?.languages && <span className="font-inter text-[9px] flex items-center gap-1" style={{ color: G.dim }}><Languages className="w-2.5 h-2.5" />{profile.languages.join("+")}</span>}
                  </div>
                </div>
                {/* Priority list */}
                <div className="space-y-1">
                  {routing.map((mp, idx) => {
                    const mpInfo = MARKETPLACE_REGISTRY[mp];
                    return (
                      <div key={mp + idx} className="flex items-center gap-2 p-1.5 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <span className="font-inter text-[9px] font-bold w-4 text-center" style={{ color: G.dim }}>{idx + 1}</span>
                        <span className="font-inter text-[10px] font-semibold flex-1" style={{ color: mpInfo?.color || "rgba(255,255,255,0.80)" }}>{mpInfo?.name || mp}</span>
                        <button onClick={() => moveMarketplace(country.code, idx, -1)} className="p-0.5 rounded hover:bg-white/5"><ChevronUp className="w-3 h-3" style={{ color: G.dim }} /></button>
                        <button onClick={() => moveMarketplace(country.code, idx, 1)} className="p-0.5 rounded hover:bg-white/5"><ChevronDown className="w-3 h-3" style={{ color: G.dim }} /></button>
                        <button onClick={() => toggleMarketplace(country.code, mp)} className="p-0.5 rounded hover:bg-white/5"><X className="w-3 h-3" style={{ color: "#F87171" }} /></button>
                      </div>
                    );
                  })}
                </div>
                {/* Add marketplace */}
                <div className="flex gap-1 flex-wrap">
                  {ALL_MARKETPLACES.filter(mp => !routing.includes(mp)).map(mp => {
                    const mpInfo = MARKETPLACE_REGISTRY[mp];
                    return (
                      <button key={mp} onClick={() => toggleMarketplace(country.code, mp)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded font-inter text-[9px] font-bold"
                        style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.faint}`, color: G.dim }}>
                        <Plus className="w-2.5 h-2.5" /> {mpInfo?.name || mp}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
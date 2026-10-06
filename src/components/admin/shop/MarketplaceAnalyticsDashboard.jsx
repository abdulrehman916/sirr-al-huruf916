import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye, MousePointerClick, ShoppingBag, MessageCircle, Mail, Share2,
  Heart, Search, Globe, Smartphone, Tablet, Monitor, BarChart3,
  Download, FileText, FileSpreadsheet, RefreshCw, Filter, TrendingUp,
  MapPin, Package,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { exportCsv, exportXlsx, exportPdf } from "@/lib/shopAnalyticsExport";
import AnalyticsChartPanel, { MarketplaceBreakdownChart } from "./AnalyticsChartPanel";
import AnalyticsProductTable from "./AnalyticsProductTable";

const G = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.55)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.12)",
};

// ── Summary Stat Card ──
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-xl"
      style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="font-inter text-[8px] uppercase tracking-widest font-bold leading-tight" style={{ color: G.dim }}>{label}</span>
      </div>
      <p className="font-inter text-lg font-bold" style={{ color: "rgba(255,255,255,0.95)" }}>{value}</p>
    </motion.div>
  );
}

// ── Country Analytics Panel ──
function CountryPanel({ countries }) {
  if (!countries || countries.length === 0) {
    return (
      <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4" style={{ color: G.text }} />
          <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Country Analytics</h3>
        </div>
        <div className="py-6 text-center">
          <Globe className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: G.dim }} />
          <p className="font-inter text-[11px]" style={{ color: G.dim }}>No country data yet</p>
        </div>
      </div>
    );
  }

  const maxVisitors = Math.max(...countries.map(c => c.visitors), 1);

  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
      <div className="flex items-center gap-2 mb-1">
        <Globe className="w-4 h-4" style={{ color: G.text }} />
        <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Country Analytics</h3>
      </div>
      <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-none">
        {countries.slice(0, 20).map((c, idx) => (
          <div key={c.country + idx} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${G.faint}` }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" style={{ color: G.text }} />
                <span className="font-inter text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{c.country || "Unknown"}</span>
              </div>
              <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>{c.visitors} visitors</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full" style={{
                width: `${(c.visitors / maxVisitors) * 100}%`,
                background: "linear-gradient(90deg, rgba(96,165,250,0.50), rgba(96,165,250,0.85))",
              }} />
            </div>
            <div className="flex items-center justify-between text-[9px]">
              <span style={{ color: G.dim }}>{c.clicks} clicks · {c.views} views</span>
              <span style={{ color: "rgba(255,255,255,0.50)" }} className="truncate max-w-[100px]">Top: {c.topProductName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Search Analytics Panel ──
function SearchPanel({ search }) {
  if (!search || (!search.topKeywords?.length && !search.noResultKeywords?.length && !search.topCategories?.length)) {
    return (
      <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4" style={{ color: G.text }} />
          <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Search Analytics</h3>
        </div>
        <div className="py-6 text-center">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: G.dim }} />
          <p className="font-inter text-[11px]" style={{ color: G.dim }}>No search data yet</p>
        </div>
      </div>
    );
  }

  const KeywordList = ({ title, items, color, icon: Icon }) => (
    <div>
      <p className="font-inter text-[9px] uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1" style={{ color: G.dim }}>
        <Icon className="w-2.5 h-2.5" /> {title}
      </p>
      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="font-inter text-[10px] truncate max-w-[120px]" style={{ color: "rgba(255,255,255,0.75)" }}>
                {item.keyword || item.category}
              </span>
              <span className="font-inter text-[10px] font-bold" style={{ color }}>{item.count}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-inter text-[9px]" style={{ color: G.dim }}>None</p>
      )}
    </div>
  );

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4" style={{ color: G.text }} />
        <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Search Analytics</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KeywordList title="Top Keywords" items={search.topKeywords || []} color="#60a5fa" icon={Search} />
        <KeywordList title="No Results" items={search.noResultKeywords || []} color="#F87171" icon={Filter} />
        <KeywordList title="Filtered Categories" items={search.topCategories || []} color={G.text} icon={Filter} />
      </div>
    </div>
  );
}

// ── Device Breakdown ──
function DeviceBreakdown({ products }) {
  const deviceMap = { mobile: 0, tablet: 0, desktop: 0, unknown: 0 };
  (products || []).forEach(p => {
    Object.entries(p.devices || {}).forEach(([d, count]) => {
      deviceMap[d] = (deviceMap[d] || 0) + count;
    });
  });
  const total = Object.values(deviceMap).reduce((a, b) => a + b, 0);
  const data = [
    { label: "Mobile", value: deviceMap.mobile, icon: Smartphone, color: "#60a5fa" },
    { label: "Tablet", value: deviceMap.tablet, icon: Tablet, color: "#A78BFA" },
    { label: "Desktop", value: deviceMap.desktop, icon: Monitor, color: "#34D399" },
  ];

  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
      <div className="flex items-center gap-2">
        <Smartphone className="w-4 h-4" style={{ color: G.text }} />
        <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>Device Breakdown</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {data.map(d => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={d.label} className="text-center p-2 rounded-lg" style={{ background: `${d.color}0D`, border: `1px solid ${d.color}22` }}>
              <d.icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: d.color }} />
              <p className="font-inter text-sm font-bold" style={{ color: "rgba(255,255,255,0.90)" }}>{d.value}</p>
              <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>{d.label} · {pct}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ──

export default function MarketplaceAnalyticsDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("daily");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("getShopAnalytics", {});
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        toast({ title: "Error", description: res.data?.error || "Failed to load analytics", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error Loading Analytics", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    if (!data) return;
    setExporting(true);
    try {
      if (format === "csv") exportCsv(data, period);
      else if (format === "xlsx") exportXlsx(data, period);
      else if (format === "pdf") exportPdf(data, period);
      toast({ title: "✓ Export Complete", description: `Analytics exported as ${format.toUpperCase()}` });
    } catch (error) {
      toast({ title: "Export Failed", description: error.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
        <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-20" style={{ color: G.dim }} />
        <p className="font-inter text-xs" style={{ color: G.dim }}>Unable to load analytics data</p>
        <button onClick={loadAnalytics} className="mt-3 px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
          <RefreshCw className="w-3 h-3 inline mr-1" /> Retry
        </button>
      </div>
    );
  }

  const s = data.summary || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header — export buttons */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: G.text }} />
          <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Marketplace Analytics</h2>
          <span className="font-inter text-[10px]" style={{ color: G.dim }}>{data.totalEvents || 0} events</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={loadAnalytics}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-inter text-[10px] font-bold"
            style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-inter text-[10px] font-bold disabled:opacity-40"
            style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}
          >
            <Download className="w-3 h-3" /> CSV
          </button>
          <button
            onClick={() => handleExport("xlsx")}
            disabled={exporting}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-inter text-[10px] font-bold disabled:opacity-40"
            style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}
          >
            <FileSpreadsheet className="w-3 h-3" /> Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-inter text-[10px] font-bold disabled:opacity-40"
            style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}
          >
            <FileText className="w-3 h-3" /> PDF
          </button>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="rounded-lg p-2.5" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
        <p className="font-inter text-[10px]" style={{ color: "#86EFAC" }}>
          🔒 Anonymous analytics only — no personal user data collected. Country and device are derived server-side. All purchases continue on external marketplaces.
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <StatCard icon={Eye} label="Product Views" value={s.totalViews || 0} color="#60a5fa" />
        <StatCard icon={Package} label="Detail Views" value={s.totalDetailViews || 0} color="#3b82f6" />
        <StatCard icon={ShoppingBag} label="Buy Clicks" value={s.totalBuyClicks || 0} color="#FB923C" />
        <StatCard icon={ShoppingBag} label="Amazon Clicks" value={s.amazonClicks || 0} color="#D4AF37" />
        <StatCard icon={ShoppingBag} label="Noon Clicks" value={s.noonClicks || 0} color="#FEEE00" />
        <StatCard icon={ShoppingBag} label="Flipkart Clicks" value={s.flipkartClicks || 0} color="#2874F0" />
        <StatCard icon={ShoppingBag} label="Custom Clicks" value={s.customClicks || 0} color="#A78BFA" />
        <StatCard icon={MessageCircle} label="WhatsApp" value={s.whatsappClicks || 0} color="#25D366" />
        <StatCard icon={Mail} label="Email" value={s.emailClicks || 0} color="#60a5fa" />
        <StatCard icon={Share2} label="Shares" value={s.shareClicks || 0} color="#a855f7" />
        <StatCard icon={Heart} label="Wishlist Adds" value={s.wishlistAdds || 0} color="#F87171" />
        <StatCard icon={MousePointerClick} label="Total Clicks" value={(s.totalBuyClicks||0)+(s.amazonClicks||0)+(s.noonClicks||0)+(s.flipkartClicks||0)+(s.customClicks||0)+(s.whatsappClicks||0)+(s.emailClicks||0)} color={G.text} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AnalyticsChartPanel charts={data.charts} period={period} onPeriodChange={setPeriod} />
        </div>
        <MarketplaceBreakdownChart summary={data.summary} />
      </div>

      {/* Product Performance Table */}
      <AnalyticsProductTable products={data.products} />

      {/* Country + Device + Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CountryPanel countries={data.countries} />
        <DeviceBreakdown products={data.products} />
        <SearchPanel search={data.search} />
      </div>
    </motion.div>
  );
}
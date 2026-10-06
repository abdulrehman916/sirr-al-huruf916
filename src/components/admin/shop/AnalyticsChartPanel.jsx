import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart3, TrendingUp, MousePointerClick } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.55)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.12)",
};

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const tooltipStyle = {
  background: "rgba(5,10,28,0.98)",
  border: "1px solid rgba(212,175,55,0.40)",
  borderRadius: "8px",
  fontSize: "11px",
  color: "#F5D060",
};

/**
 * Analytics Chart Panel — renders views/clicks time-series charts
 * with a period switcher (daily / weekly / monthly / yearly).
 */
export default function AnalyticsChartPanel({ charts, period, onPeriodChange }) {
  const [chartMode, setChartMode] = useState("both"); // both | views | clicks

  const data = charts?.[period] || [];

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
      {/* Header — period + mode switcher */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" style={{ color: G.text }} />
          <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
            Activity Over Time
          </h3>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className="px-2.5 py-1 rounded-lg font-inter text-[10px] font-bold transition-all"
              style={{
                background: period === p.value ? G.bgHi : "transparent",
                border: `1px solid ${period === p.value ? G.borderHi : G.faint}`,
                color: period === p.value ? G.text : G.dim,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1.5">
        {[
          { value: "both", label: "Both", icon: BarChart3 },
          { value: "views", label: "Views", icon: TrendingUp },
          { value: "clicks", label: "Clicks", icon: MousePointerClick },
        ].map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.value}
              onClick={() => setChartMode(m.value)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg font-inter text-[9px] font-bold transition-all"
              style={{
                background: chartMode === m.value ? G.bg : "transparent",
                border: `1px solid ${chartMode === m.value ? G.border : G.faint}`,
                color: chartMode === m.value ? G.text : G.dim,
              }}
            >
              <Icon className="w-2.5 h-2.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="py-12 text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: G.dim }} />
          <p className="font-inter text-[11px]" style={{ color: G.dim }}>No data yet for this period</p>
        </div>
      ) : (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
              <CartesianGrid stroke="rgba(212,175,55,0.08)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 9 }}
                tickLine={{ stroke: "rgba(212,175,55,0.20)" }}
                axisLine={{ stroke: "rgba(212,175,55,0.20)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 9 }}
                tickLine={{ stroke: "rgba(212,175,55,0.20)" }}
                axisLine={{ stroke: "rgba(212,175,55,0.20)" }}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10, color: G.dim }} />
              {(chartMode === "both" || chartMode === "views") && (
                <Line
                  type="monotone"
                  dataKey="views"
                  name="Views"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ fill: "#60a5fa", r: 2 }}
                  activeDot={{ r: 4 }}
                />
              )}
              {(chartMode === "both" || chartMode === "clicks") && (
                <Line
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  dot={{ fill: "#D4AF37", r: 2 }}
                  activeDot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/**
 * Marketplace Clicks Breakdown — horizontal bar chart showing
 * which marketplace buttons are clicked most.
 */
export function MarketplaceBreakdownChart({ summary }) {
  if (!summary) return null;

  const data = [
    { name: "Amazon", count: summary.amazonClicks || 0, color: "#D4AF37" },
    { name: "Noon", count: summary.noonClicks || 0, color: "#FEEE00" },
    { name: "Flipkart", count: summary.flipkartClicks || 0, color: "#2874F0" },
    { name: "Custom", count: summary.customClicks || 0, color: "#A78BFA" },
    { name: "WhatsApp", count: summary.whatsappClicks || 0, color: "#25D366" },
    { name: "Email", count: summary.emailClicks || 0, color: "#60a5fa" },
    { name: "Buy (generic)", count: summary.totalBuyClicks || 0, color: "#FB923C" },
  ].filter(d => d.count > 0);

  if (data.length === 0) {
    return (
      <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
        <h3 className="font-inter text-xs font-bold uppercase tracking-widest mb-3" style={{ color: G.text }}>
          Marketplace Clicks
        </h3>
        <div className="py-8 text-center">
          <p className="font-inter text-[11px]" style={{ color: G.dim }}>No marketplace clicks yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
      <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
        Marketplace Clicks
      </h3>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid stroke="rgba(212,175,55,0.08)" strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 9 }}
              axisLine={{ stroke: "rgba(212,175,55,0.20)" }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.60)", fontSize: 10 }}
              axisLine={{ stroke: "rgba(212,175,55,0.20)" }}
              width={80}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(212,175,55,0.05)" }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Clicks">
              {data.map((entry, idx) => (
                <Bar key={idx} dataKey="count" fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
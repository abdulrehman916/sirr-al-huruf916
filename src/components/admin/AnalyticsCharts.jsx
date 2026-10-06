/**
 * AnalyticsCharts — Chart components for the analytics dashboard.
 * Uses recharts (already installed) for all visualizations.
 */
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ChevronDown, ChevronRight } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

const tooltipStyle = {
  backgroundColor: "rgba(2,7,16,0.95)",
  border: "1px solid rgba(212,175,55,0.30)",
  borderRadius: "8px",
  fontSize: "11px",
  color: "#fff",
};

const axisStyle = { fontSize: 9, fill: "rgba(255,255,255,0.40)" };

function ChartCard({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: G.bg, borderColor: G.border }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <span className="font-inter font-bold text-white text-xs">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
      </button>
      {open && <div className="p-3 pt-0">{children}</div>}
    </div>
  );
}

export default function AnalyticsCharts({ charts }) {
  if (!charts) return null;

  return (
    <div className="space-y-3">
      {/* Daily Registrations */}
      <ChartCard title="Daily Registrations (30 Days)">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={charts.dailyRegistrations || []}>
            <defs>
              <linearGradient id="gradReg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={axisStyle} tickFormatter={(d) => d.split('-')[2]} />
            <YAxis tick={axisStyle} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="count" stroke="#60a5fa" fill="url(#gradReg)" name="Registrations" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Daily Revenue */}
      <ChartCard title="Daily Revenue (30 Days)">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={charts.dailyRevenue || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={axisStyle} tickFormatter={(d) => d.split('-')[2]} />
            <YAxis tick={axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="revenue" fill="#D4AF37" name="Revenue" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Redeem Approvals */}
      <ChartCard title="Redeem Approvals (14 Days)">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={charts.redeemApprovalsChart || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={axisStyle} tickFormatter={(d) => d.split('-')[2]} />
            <YAxis tick={axisStyle} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="pending" fill="#60a5fa" name="Pending" stackId="a" />
            <Bar dataKey="approved" fill="#22c55e" name="Approved" stackId="a" />
            <Bar dataKey="rejected" fill="#ef4444" name="Rejected" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Premium Subscriptions */}
      <ChartCard title="Premium Subscriptions (12 Months)" defaultOpen={false}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={charts.premiumSubscriptions || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={axisStyle} />
            <YAxis tick={axisStyle} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#a855f7" name="Premium" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Customer Growth */}
      <ChartCard title="Customer Growth (12 Months)" defaultOpen={false}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={charts.customerGrowth || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={axisStyle} />
            <YAxis tick={axisStyle} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="total" stroke="#D4AF37" strokeWidth={2} name="Total Customers" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Admin Workload */}
      {charts.adminWorkload && charts.adminWorkload.length > 0 && (
        <ChartCard title="Admin Workload Distribution" defaultOpen={false}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={charts.adminWorkload} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={axisStyle} allowDecimals={false} />
              <YAxis type="category" dataKey="admin_name" tick={axisStyle} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="assigned_customers" fill="#60a5fa" name="Customers" radius={[0, 3, 3, 0]} />
              <Bar dataKey="pending_approvals" fill="#eab308" name="Pending" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
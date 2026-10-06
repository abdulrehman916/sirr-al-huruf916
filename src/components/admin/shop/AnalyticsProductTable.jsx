import { useState, Fragment } from "react";
import { Package, ChevronDown, ChevronUp, MousePointerClick, Eye, TrendingUp } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.55)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.12)",
};

/**
 * Product Performance Table — shows per-product analytics:
 * Views, Clicks, CTR, Top Marketplace, Last Click Date, Top Countries, Top Device.
 * Expandable rows for marketplace breakdown detail.
 */
export default function AnalyticsProductTable({ products }) {
  const [expandedId, setExpandedId] = useState(null);
  const [sortField, setSortField] = useState("clicks");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...(products || [])].sort((a, b) => {
    const valA = a[sortField] || 0;
    const valB = b[sortField] || 0;
    if (typeof valA === "string" && typeof valB === "string") {
      return sortDir === "desc" ? valB.localeCompare(valA) : valA.localeCompare(valB);
    }
    return sortDir === "desc" ? (valB - valA) : (valA - valB);
  });

  const SortHeader = ({ field, label, icon: Icon }) => (
    <th className="px-2 py-1.5 text-left">
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:opacity-80"
      >
        {Icon && <Icon className="w-2.5 h-2.5" style={{ color: G.dim }} />}
        <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: sortField === field ? G.text : G.dim }}>
          {label}
        </span>
        {sortField === field && (
          sortDir === "desc" ? <ChevronDown className="w-2.5 h-2.5" style={{ color: G.text }} /> : <ChevronUp className="w-2.5 h-2.5" style={{ color: G.text }} />
        )}
      </button>
    </th>
  );

  if (!sorted || sorted.length === 0) {
    return (
      <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
        <h3 className="font-inter text-xs font-bold uppercase tracking-widest mb-3" style={{ color: G.text }}>
          Product Performance
        </h3>
        <div className="py-8 text-center">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: G.dim }} />
          <p className="font-inter text-[11px]" style={{ color: G.dim }}>No product activity recorded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${G.faint}` }}>
        <Package className="w-4 h-4" style={{ color: G.text }} />
        <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
          Product Performance
        </h3>
        <span className="font-inter text-[10px]" style={{ color: G.dim }}>({sorted.length} products)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: "rgba(212,175,55,0.04)" }}>
            <tr>
              <th className="px-2 py-1.5 text-left">
                <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>Product</span>
              </th>
              <SortHeader field="views" label="Views" icon={Eye} />
              <SortHeader field="detailViews" label="Detail" icon={Eye} />
              <SortHeader field="clicks" label="Clicks" icon={MousePointerClick} />
              <SortHeader field="ctr" label="CTR%" icon={TrendingUp} />
              <th className="px-2 py-1.5 text-left">
                <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>Top MP</span>
              </th>
              <th className="px-2 py-1.5 text-left">
                <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>Last Click</span>
              </th>
              <th className="px-2 py-1.5 text-left">
                <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>Countries</span>
              </th>
              <th className="px-2 py-1.5 text-left">
                <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>Device</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 50).map((p, idx) => (
              <Fragment key={p.product_id}>
                <tr
                  key={p.product_id}
                  onClick={() => setExpandedId(expandedId === p.product_id ? null : p.product_id)}
                  className="cursor-pointer transition-colors hover:bg-white/2"
                  style={{ borderBottom: `1px solid ${idx === sorted.length - 1 ? "transparent" : G.faint}` }}
                >
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      {expandedId === p.product_id
                        ? <ChevronUp className="w-3 h-3 flex-shrink-0" style={{ color: G.dim }} />
                        : <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: G.dim }} />
                      }
                      <span className="font-inter text-[10px] font-semibold truncate max-w-[140px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {p.product_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2"><span className="font-inter text-[10px] font-bold" style={{ color: "#60a5fa" }}>{p.views}</span></td>
                  <td className="px-2 py-2"><span className="font-inter text-[10px] font-bold" style={{ color: "#60a5fa" }}>{p.detailViews}</span></td>
                  <td className="px-2 py-2"><span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>{p.clicks}</span></td>
                  <td className="px-2 py-2"><span className="font-inter text-[10px] font-bold" style={{ color: "#34D399" }}>{p.ctr}%</span></td>
                  <td className="px-2 py-2"><span className="font-inter text-[10px] truncate max-w-[70px]" style={{ color: "rgba(255,255,255,0.70)" }}>{p.topMarketplace}</span></td>
                  <td className="px-2 py-2"><span className="font-inter text-[9px]" style={{ color: G.dim }}>{p.lastClickDate ? new Date(p.lastClickDate).toLocaleDateString() : "—"}</span></td>
                  <td className="px-2 py-2"><span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.60)" }}>{(p.topCountries || []).join(", ") || "—"}</span></td>
                  <td className="px-2 py-2"><span className="font-inter text-[9px] uppercase" style={{ color: "rgba(255,255,255,0.60)" }}>{p.topDevice}</span></td>
                </tr>
                {expandedId === p.product_id && (
                  <tr style={{ background: "rgba(212,175,55,0.03)" }}>
                    <td colSpan={9} className="px-4 py-3">
                      <div className="space-y-1.5">
                        <p className="font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>Marketplace Breakdown</p>
                        {Object.keys(p.marketplaceClicks || {}).length > 0 ? (
                          Object.entries(p.marketplaceClicks).sort((a, b) => b[1] - a[1]).map(([mp, count]) => (
                            <div key={mp} className="flex items-center gap-2">
                              <span className="font-inter text-[10px] w-20" style={{ color: "rgba(255,255,255,0.70)" }}>{mp}</span>
                              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                                <div className="h-full rounded-full" style={{
                                  width: `${p.clicks > 0 ? (count / p.clicks) * 100 : 0}%`,
                                  background: "linear-gradient(90deg, rgba(212,175,55,0.60), rgba(212,175,55,0.90))",
                                }} />
                              </div>
                              <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>{count}</span>
                            </div>
                          ))
                        ) : (
                          <p className="font-inter text-[10px]" style={{ color: G.dim }}>No marketplace clicks for this product</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
/**
 * AdminAuditLog — Owner-only, read-only audit log viewer.
 * Loads via getOwnerAuditLog (enforces owner-only server-side).
 * Append-only: no edit/delete controls exist on this page.
 */
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, Search, Filter, ChevronLeft, ChevronRight, Loader2, ScrollText, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/AuthContext";
import { ROLES } from "@/lib/rbac";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

const ACTION_FILTERS = [
  { value: "", label: "All Actions" },
  { value: "ADMIN_CREATED", label: "Admin Created" },
  { value: "ADMIN_REMOVED", label: "Admin Removed" },
  { value: "PERMISSION_CHANGED", label: "Permission Changed" },
  { value: "ADMIN_DISABLED", label: "Admin Disabled" },
  { value: "ADMIN_ENABLED", label: "Admin Enabled" },
  { value: "SHOP_UPDATED", label: "Shop Updated" },
  { value: "PRODUCT_CREATED", label: "Product Created" },
  { value: "PRODUCT_UPDATED", label: "Product Updated" },
  { value: "PRODUCT_DELETED", label: "Product Deleted" },
  { value: "USER_SUSPENDED", label: "User Suspended" },
  { value: "USER_RESTORED", label: "User Restored" },
  { value: "ACCESS_CODE_CREATED", label: "Access Code Created" },
  { value: "ACCESS_CODE_UPDATED", label: "Access Code Updated" },
  { value: "ACCESS_CODE_RENEWED", label: "Access Code Renewed" },
  { value: "ACCESS_CODE_DELETED", label: "Access Code Deleted" },
  { value: "ACCESS_CODE_RESET", label: "Access Code Reset" },
  { value: "PDF_EDITED", label: "PDF Edited" },
  { value: "HOLY_NAMES_EDITED", label: "Holy Names Edited" },
  { value: "SETTINGS_CHANGED", label: "Settings Changed" },
  { value: "PAGE_VISIBILITY_CHANGED", label: "Page Visibility Changed" },
  { value: "FEATURE_PRICING_CHANGED", label: "Feature Pricing Changed" },
  { value: "REDEEM_APPROVED", label: "Redeem Approved" },
  { value: "REDEEM_REJECTED", label: "Redeem Rejected" },
  { value: "CUSTOMER_ASSIGNED", label: "Customer Assigned" },
  { value: "SUPPORT_ROUTING_CHANGED", label: "Support Routing Changed" },
  { value: "ANALYTICS_CHANGED", label: "Analytics Changed" },
  { value: "OWNER_ACTION", label: "Owner Action" },
];

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch { return iso; }
}

function roleBadge(role) {
  const r = (role || "").toLowerCase();
  const map = {
    owner: { bg: "rgba(212,175,55,0.18)", color: "#F5D060", border: G.borderHi, label: "Owner" },
    admin: { bg: "rgba(96,165,250,0.12)", color: "#93C5FD", border: "rgba(96,165,250,0.40)", label: "Admin" },
    customer: { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.50)", border: "rgba(255,255,255,0.12)", label: "Customer" },
    guest: { bg: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.40)", border: "rgba(255,255,255,0.10)", label: "Guest" },
  };
  const s = map[r] || map.guest;
  return (
    <span style={{
      fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase", padding: "2px 7px", borderRadius: 5,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{s.label}</span>
  );
}

export default function AdminAuditLog() {
  const { role } = useAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  // Filters
  const [actionType, setActionType] = useState("");
  const [actorEmail, setActorEmail] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = useCallback(async (offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getOwnerAuditLog", {
        action_type: actionType || undefined,
        actor_email: actorEmail.trim() || undefined,
        search: search.trim() || undefined,
        from: fromDate ? new Date(fromDate).toISOString() : undefined,
        to: toDate ? new Date(toDate + "T23:59:59").toISOString() : undefined,
        limit,
        skip: offset,
      });
      const data = res.data;
      if (data?.success) {
        setRows(data.rows || []);
        setTotal(data.total || 0);
        setSkip(offset);
      } else {
        setError(data?.error || "Failed to load audit log");
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  }, [actionType, actorEmail, search, fromDate, toDate, limit]);

  useEffect(() => { load(0); }, [load]);

  const handleFilter = () => { load(0); };
  const handleReset = () => {
    setActionType(""); setActorEmail(""); setSearch(""); setFromDate(""); setToDate("");
    setTimeout(() => load(0), 0);
  };

  const exportCsv = () => {
    if (!rows.length) return;
    const headers = ["timestamp", "action_type", "performed_by_name", "performed_by_email", "performed_by_role", "object_type", "object_id", "object_label", "ip_address", "device_id", "user_agent", "action_label"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [headers.join(",")];
    rows.forEach((r) => {
      lines.push(headers.map((h) => esc(r[h])).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `owner-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pageLabel = `${Math.min(skip + 1, total)}–${Math.min(skip + limit, total)} of ${total}`;

  return (
    <AdminLayout title="Owner Audit Log" subtitle="Secure append-only trail">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, rgba(212,175,55,0.20), rgba(212,175,55,0.06))",
              border: `1px solid ${G.borderHi}`,
            }}>
              <ScrollText style={{ width: 18, height: 18, color: G.text }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontSize: 19, fontWeight: 700, color: "#fff", margin: 0 }}>
                Owner Audit Log
              </h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.40)", margin: "2px 0 0 0" }}>
                Append-only · Owner-only · {total} entries
              </p>
            </div>
          </div>
        </div>

        {/* Owner-only guard (defense-in-depth; server already enforces) */}
        {role !== ROLES.OWNER && (
          <div style={{
            padding: 18, borderRadius: 12, textAlign: "center",
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)",
          }}>
            <Shield style={{ width: 28, height: 28, color: "rgba(248,113,113,0.80)", margin: "0 auto 8px" }} />
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.70)", margin: 0 }}>
              Only the Owner can view the complete audit log.
            </p>
          </div>
        )}

        {role === ROLES.OWNER && (
          <>
            {/* Filters */}
            <div style={{
              padding: 14, borderRadius: 12, marginBottom: 16,
              background: "linear-gradient(145deg, rgba(8,16,38,0.70) 0%, rgba(4,10,24,0.85) 100%)",
              border: `1px solid ${G.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <Filter style={{ width: 14, height: 14, color: G.dim }} />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: G.text }}>Filters</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  style={inputStyle}
                >
                  {ACTION_FILTERS.map((a) => (
                    <option key={a.value} value={a.value} style={{ background: "#0c1630" }}>{a.label}</option>
                  ))}
                </select>
                <input
                  value={actorEmail}
                  onChange={(e) => setActorEmail(e.target.value)}
                  placeholder="Actor email"
                  style={inputStyle}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search label / object"
                  style={inputStyle}
                />
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={inputStyle} />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button onClick={handleFilter} style={primaryBtn}>
                  <Search style={{ width: 12, height: 12, marginRight: 4 }} />Apply
                </button>
                <button onClick={handleReset} style={ghostBtn}>Reset</button>
                <button onClick={exportCsv} disabled={!rows.length} style={{ ...ghostBtn, opacity: rows.length ? 1 : 0.4 }}>
                  <Download style={{ width: 12, height: 12, marginRight: 4 }} />Export CSV
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: 12, borderRadius: 10, marginBottom: 12,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.30)",
                fontFamily: "Inter, sans-serif", fontSize: 12, color: "#FCA5A5",
              }}>{error}</div>
            )}

            {/* Table */}
            <div style={{
              borderRadius: 12, overflow: "hidden",
              border: `1px solid ${G.border}`,
              background: "linear-gradient(145deg, rgba(8,16,38,0.60) 0%, rgba(4,10,24,0.80) 100%)",
            }}>
              {loading ? (
                <div style={{ padding: 48, textAlign: "center" }}>
                  <Loader2 style={{ width: 22, height: 22, color: G.text, animation: "spin 1s linear infinite", margin: "0 auto" }} />
                </div>
              ) : rows.length === 0 ? (
                <div style={{ padding: 48, textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.40)" }}>
                  No audit entries match the current filters.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "rgba(212,175,55,0.06)" }}>
                        {["Date & Time", "Action", "User", "Role", "Object Affected", "IP", "Device"].map((h) => (
                          <th key={h} style={{
                            textAlign: "left", padding: "11px 12px", fontSize: 9, fontWeight: 700,
                            letterSpacing: "0.12em", textTransform: "uppercase", color: G.dim,
                            borderBottom: `1px solid ${G.border}`, whiteSpace: "nowrap",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r.log_id}
                          onClick={() => setSelected(r)}
                          style={{ cursor: "pointer", borderBottom: "1px solid rgba(212,175,55,0.10)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.04)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={cellStyle}>{fmtDate(r.timestamp)}</td>
                          <td style={cellStyle}>
                            <span style={{ fontWeight: 700, color: G.text, fontSize: 10, letterSpacing: "0.04em" }}>{r.action_type}</span>
                            {r.action_label && (
                              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{r.action_label}</div>
                            )}
                          </td>
                          <td style={cellStyle}>
                            <div style={{ color: "#fff", fontWeight: 600 }}>{r.performed_by_name || "—"}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.40)" }}>{r.performed_by_email || ""}</div>
                          </td>
                          <td style={cellStyle}>{roleBadge(r.performed_by_role)}</td>
                          <td style={cellStyle}>
                            <div style={{ fontSize: 10, color: G.dim, fontWeight: 600 }}>{r.object_type || "—"}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.50)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {r.object_label || r.object_id || ""}
                            </div>
                          </td>
                          <td style={{ ...cellStyle, fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{r.ip_address || "—"}</td>
                          <td style={{ ...cellStyle, fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.45)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.device_id || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && total > limit && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.40)" }}>{pageLabel}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => load(Math.max(0, skip - limit))} disabled={skip === 0} style={{ ...ghostBtn, opacity: skip === 0 ? 0.35 : 1, display: "flex", alignItems: "center" }}>
                    <ChevronLeft style={{ width: 13, height: 13 }} /> Prev
                  </button>
                  <button onClick={() => load(skip + limit)} disabled={skip + limit >= total} style={{ ...ghostBtn, opacity: skip + limit >= total ? 0.35 : 1, display: "flex", alignItems: "center" }}>
                    Next <ChevronRight style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.70)", zIndex: 9998, display: "flex", justifyContent: "flex-end" }}
        >
          <motion.div
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 420, height: "100%", overflowY: "auto",
              background: "linear-gradient(180deg, #08101f 0%, #050c1a 100%)",
              borderLeft: `1px solid ${G.borderHi}`,
              padding: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Entry Detail</h3>
              <button onClick={() => setSelected(null)} style={{ color: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.04)", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>✕</button>
            </div>
            <DetailRow label="Action" value={selected.action_type} accent />
            <DetailRow label="Summary" value={selected.action_label || "—"} />
            <DetailRow label="Date & Time" value={fmtDate(selected.timestamp)} />
            <DetailRow label="User" value={selected.performed_by_name || "—"} />
            <DetailRow label="Email" value={selected.performed_by_email || "—"} />
            <DetailRow label="Role" value={<span>{roleBadge(selected.performed_by_role)}</span>} />
            <DetailRow label="Object Type" value={selected.object_type || "—"} />
            <DetailRow label="Object ID" value={selected.object_id || "—"} mono />
            <DetailRow label="Object Label" value={selected.object_label || "—"} />
            <DetailRow label="IP Address" value={selected.ip_address || "—"} mono />
            <DetailRow label="Device" value={selected.device_id || "—"} mono />
            <DetailRow label="User-Agent" value={selected.user_agent || "—"} />
            {selected.details && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: G.dim, marginBottom: 6 }}>Details</p>
                <pre style={{
                  padding: 10, borderRadius: 8, fontSize: 10, color: "rgba(255,255,255,0.70)",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 240, overflowY: "auto",
                }}>{(() => { try { return JSON.stringify(JSON.parse(selected.details), null, 2); } catch { return selected.details; } })()}</pre>
              </div>
            )}
            <div style={{ marginTop: 18, padding: 10, borderRadius: 8, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.20)", fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(110,231,183,0.80)" }}>
              🔒 Append-only — this entry is immutable and cannot be edited or deleted.
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}

const cellStyle = {
  padding: "11px 12px", verticalAlign: "top", borderBottom: "1px solid rgba(212,175,55,0.08)",
};

const inputStyle = {
  padding: "8px 10px", borderRadius: 8, fontSize: 12, color: "#fff",
  background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`,
  outline: "none", fontFamily: "Inter, sans-serif", minWidth: 0,
};

const primaryBtn = {
  padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
  background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a",
  border: "none", display: "flex", alignItems: "center", fontFamily: "Inter, sans-serif",
};

const ghostBtn = {
  padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
  background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.60)",
  border: `1px solid ${G.border}`, fontFamily: "Inter, sans-serif",
};

function DetailRow({ label, value, accent, mono }) {
  return (
    <div style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(212,175,55,0.45)", margin: "0 0 4px 0" }}>{label}</p>
      <p style={{
        fontFamily: mono ? "monospace" : "Inter, sans-serif", fontSize: 12, margin: 0,
        color: accent ? "#F5D060" : "rgba(255,255,255,0.80)", wordBreak: "break-word",
      }}>{value}</p>
    </div>
  );
}
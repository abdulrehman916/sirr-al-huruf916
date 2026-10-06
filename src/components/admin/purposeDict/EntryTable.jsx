import { useState, useMemo } from "react";
import { Search, Filter, Edit2, Trash2, Power, Eye, ChevronDown, ChevronUp, X } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

const CATEGORY_LABELS = {
  jalb: "Jalb", tard: "Tard", tafriq: "Tafriq", jam: "Jam",
  sihhat: "Sihhat", sekam: "Saqam", tarfet: "Tarfet", other: "Other",
};

const PAGE_SIZE = 25;

export default function EntryTable({ entries, loading, onEdit, onToggleActive, onDelete }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [detailEntry, setDetailEntry] = useState(null);
  const [sortField, setSortField] = useState("created_date");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = useMemo(() => {
    let result = [...entries];

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(e => {
        const haystack = [
          e.purpose_phrase, e.arabic_keyword, e.malayalam_meaning,
          e.english_meaning, e.normalized_purpose_key, e.action,
          e.source, e.notes,
          ...(e.aliases || []),
        ].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(q);
      });
    }

    // Status filter
    if (statusFilter === "active") result = result.filter(e => e.is_active !== false);
    if (statusFilter === "inactive") result = result.filter(e => e.is_active === false);

    // Category filter
    if (categoryFilter !== "all") result = result.filter(e => (e.action || "other") === categoryFilter);

    // Language filter
    if (languageFilter !== "all") result = result.filter(e => (e.language || "mixed") === languageFilter);

    // Sort
    result.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "created_date" || sortField === "updated_date") {
        va = va ? new Date(va).getTime() : 0;
        vb = vb ? new Date(vb).getTime() : 0;
      } else {
        va = (va || "").toString().toLowerCase();
        vb = (vb || "").toString().toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [entries, search, statusFilter, categoryFilter, languageFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortHeader = ({ field, label }) => (
    <th
      onClick={() => toggleSort(field)}
      className="cursor-pointer select-none hover:text-white transition-colors"
      style={{ padding: "8px 10px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sortField === field ? G.text : "rgba(255,255,255,0.45)" }}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortField === field && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </span>
    </th>
  );

  if (loading) {
    return (
      <div className="rounded-2xl p-8 flex items-center justify-center" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}` }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: G.dim, borderTopColor: G.text }} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + Filters */}
      <div className="rounded-xl p-3 space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}` }}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.30)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search Arabic, Malayalam, English, keyword, aliases, normalized key, category, source..."
            className="w-full pl-10 pr-3 py-2.5 rounded-lg font-inter text-sm text-white"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(212,175,55,0.20)",
              outline: "none",
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(0); }}
            options={[{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
          />
          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={(v) => { setCategoryFilter(v); setPage(0); }}
            options={[
              { value: "all", label: "All Categories" },
              ...Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l })),
            ]}
          />
          <FilterSelect
            label="Language"
            value={languageFilter}
            onChange={(v) => { setLanguageFilter(v); setPage(0); }}
            options={[
              { value: "all", label: "All Languages" },
              { value: "ar", label: "Arabic" },
              { value: "ml", label: "Malayalam" },
              { value: "en", label: "English" },
              { value: "mixed", label: "Mixed" },
            ]}
          />
          <div className="ml-auto flex items-center gap-2">
            <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
              {filtered.length} of {entries.length}
            </span>
            {(search || statusFilter !== "all" || categoryFilter !== "all" || languageFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); setLanguageFilter("all"); setPage(0); }}
                className="font-inter text-xs px-2 py-1 rounded"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.50)" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${G.border}`, background: "rgba(212,175,55,0.04)" }}>
                <SortHeader field="purpose_phrase" label="Arabic Phrase" />
                <SortHeader field="arabic_keyword" label="Keyword" />
                <th style={{ padding: "8px 10px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)" }}>Malayalam</th>
                <th style={{ padding: "8px 10px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)" }}>English</th>
                <SortHeader field="normalized_purpose_key" label="Norm. Key" />
                <SortHeader field="action" label="Category" />
                <SortHeader field="language" label="Lang" />
                <th style={{ padding: "8px 10px", textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)" }}>Status</th>
                <th style={{ padding: "8px 10px", textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8">
                    <p className="font-inter text-sm text-white/30">No entries found</p>
                  </td>
                </tr>
              )}
              {pageData.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "8px 10px" }}>
                    <span className="font-amiri text-sm" dir="rtl" style={{ color: "#fff" }}>{entry.purpose_phrase}</span>
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <span className="font-amiri text-sm" dir="rtl" style={{ color: "rgba(255,255,255,0.70)" }}>{entry.arabic_keyword}</span>
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>{entry.malayalam_meaning}</span>
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>{entry.english_meaning}</span>
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <span className="font-inter text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>{entry.normalized_purpose_key}</span>
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>{CATEGORY_LABELS[entry.action] || entry.action}</span>
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <span className="font-inter text-xs uppercase" style={{ color: "rgba(255,255,255,0.50)" }}>{entry.language || "mixed"}</span>
                  </td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{
                      background: entry.is_active !== false ? "#4ADE80" : "#F87171",
                    }} />
                  </td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>
                    <div className="inline-flex gap-1">
                      <button onClick={() => setDetailEntry(entry)} title="View Details" className="p-1 rounded hover:bg-white/10 transition-colors">
                        <Eye className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.50)" }} />
                      </button>
                      <button onClick={() => onEdit(entry)} title="Edit" className="p-1 rounded hover:bg-white/10 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" style={{ color: G.dim }} />
                      </button>
                      <button onClick={() => onToggleActive(entry)} title={entry.is_active !== false ? "Deactivate" : "Activate"} className="p-1 rounded hover:bg-white/10 transition-colors">
                        <Power className="w-3.5 h-3.5" style={{ color: entry.is_active !== false ? "#4ADE80" : "#F87171" }} />
                      </button>
                      <button onClick={() => onDelete(entry)} title="Delete" className="p-1 rounded hover:bg-white/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" style={{ color: "#F87171" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3" style={{ borderTop: `1px solid ${G.border}` }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="font-inter text-xs px-3 py-1.5 rounded"
              style={{
                background: page === 0 ? "transparent" : G.bg,
                border: `1px solid ${page === 0 ? "rgba(255,255,255,0.06)" : G.border}`,
                color: page === 0 ? "rgba(255,255,255,0.20)" : G.text,
                cursor: page === 0 ? "default" : "pointer",
              }}
            >
              Previous
            </button>
            <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="font-inter text-xs px-3 py-1.5 rounded"
              style={{
                background: page >= totalPages - 1 ? "transparent" : G.bg,
                border: `1px solid ${page >= totalPages - 1 ? "rgba(255,255,255,0.06)" : G.border}`,
                color: page >= totalPages - 1 ? "rgba(255,255,255,0.20)" : G.text,
                cursor: page >= totalPages - 1 ? "default" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailEntry && (
        <DetailModal entry={detailEntry} onClose={() => setDetailEntry(null)} />
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-1.5">
      <Filter className="w-3 h-3" style={{ color: "rgba(255,255,255,0.30)" }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-inter text-xs rounded-lg px-2 py-1.5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(212,175,55,0.20)",
          color: "#fff",
          outline: "none",
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: "#0a1020", color: "#fff" }}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function DetailModal({ entry, onClose }) {
  const fields = [
    { label: "Arabic Phrase", value: entry.purpose_phrase, rtl: true, fontAmiri: true },
    { label: "Arabic Keyword", value: entry.arabic_keyword, rtl: true, fontAmiri: true },
    { label: "Malayalam Meaning", value: entry.malayalam_meaning },
    { label: "English Meaning", value: entry.english_meaning },
    { label: "Normalized Purpose Key", value: entry.normalized_purpose_key, mono: true },
    { label: "Category (Action)", value: CATEGORY_LABELS[entry.action] || entry.action },
    { label: "Language", value: entry.language || "mixed" },
    { label: "Aliases", value: (entry.aliases || []).join(", ") || "—" },
    { label: "Source", value: entry.source || "—" },
    { label: "Notes", value: entry.notes || "—" },
    { label: "Active", value: entry.is_active !== false ? "Yes" : "No" },
    { label: "Created Date", value: entry.created_date ? new Date(entry.created_date).toLocaleString() : "—" },
    { label: "Updated Date", value: entry.updated_date ? new Date(entry.updated_date).toLocaleString() : "—" },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "16px", backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        style={{
          background: "linear-gradient(145deg, rgba(8,16,38,0.99) 0%, rgba(4,10,24,0.99) 100%)",
          border: `1px solid ${G.borderHi}`,
          boxShadow: "0 8px 48px rgba(0,0,0,0.70), inset 0 1px 0 rgba(212,175,55,0.10)",
        }}
      >
        <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
          <h3 className="font-inter text-sm font-bold" style={{ color: G.text }}>Entry Details</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.50)" }} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          {fields.map((f, i) => (
            <div key={i}>
              <p className="font-inter text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(212,175,55,0.50)" }}>{f.label}</p>
              <p
                className={`text-sm ${f.fontAmiri ? "font-amiri" : "font-inter"} ${f.mono ? "font-mono" : ""}`}
                dir={f.rtl ? "rtl" : "ltr"}
                style={{ color: "#fff", wordBreak: "break-word", lineHeight: 1.6 }}
              >
                {f.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
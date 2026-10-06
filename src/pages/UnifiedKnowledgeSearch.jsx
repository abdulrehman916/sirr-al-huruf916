/**
 * UnifiedKnowledgeSearch — OWNER-ONLY permanent knowledge gateway.
 *
 * Searches across every connected source at once (Google Drive,
 * OneDrive, Adobe note, uploaded PDFs, indexed Master PDF Library),
 * then the AI compares all matched books and auto-collects scholarly
 * entries — opinions kept separate, nothing fabricated.
 *
 * Gating: rbac ROUTE_ACCESS roles:[OWNER], sidebar (Owner), client
 * check, backend Owner-verify, entity RLS.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Search, Loader2, Sparkles, Database, Cloud, BookOpen, AlertTriangle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import KnowledgeSearchResults from "@/components/masterpdflibrary/KnowledgeSearchResults";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const MODES = [
  { id: "harakat_insensitive", label: "Arabic (harakat-insensitive)" },
  { id: "arabic", label: "Arabic (normalized)" },
  { id: "exact", label: "Exact" },
  { id: "malayalam", label: "Malayalam" },
  { id: "english", label: "English" },
  { id: "semantic", label: "Semantic (broad)" },
  { id: "root", label: "Root (Arabic root)" },
  { id: "fuzzy", label: "Fuzzy (subsequence)" },
];

export default function UnifiedKnowledgeSearch() {
  const { role } = useAuth();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("harakat_insensitive");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  if (role !== "owner") {
    return (
      <AdminLayout title="Knowledge Search">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
          <ShieldAlert style={{ width: 48, height: 48, color: "#fca5a5" }} />
          <h2 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 18, margin: 0 }}>Owner Access Required</h2>
          <p style={{ fontFamily: "Inter, sans-serif", color: "rgba(255,255,255,0.50)", fontSize: 13, margin: 0, textAlign: "center", maxWidth: 420 }}>
            The Unified Knowledge Search Engine is the permanent knowledge gateway of the project Owner.
          </p>
        </div>
      </AdminLayout>
    );
  }

  async function runSearch(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults(null);
    try {
      const res = await base44.functions.invoke("unifiedKnowledgeSearch", { query: query.trim(), mode });
      const data = res?.data || res;
      if (data?.error) throw new Error(data.error);
      setResults(data);
    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout title="Knowledge Search" subtitle="Owner Knowledge Management">
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 4px 0" }}>
          Unified Knowledge Search
        </h1>
        <p style={{ fontFamily: "Inter, sans-serif", color: G.dim, fontSize: 11, margin: 0, letterSpacing: "0.04em" }}>
          Google Drive · OneDrive · Adobe · Uploaded PDFs · Master PDF Library · AI compares all books · Opinions kept separate · Nothing fabricated
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={runSearch} style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "rgba(255,255,255,0.35)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a Holy Name, Ayah, word, letter or topic…"
            dir="auto"
            style={{ width: "100%", padding: "11px 13px 11px 32px", borderRadius: 9, fontSize: 13, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif" }}
          />
        </div>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ padding: "11px 12px", borderRadius: 9, fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif", cursor: "pointer" }}>
          {MODES.map((m) => <option key={m.id} value={m.id} style={{ background: "#0a1428" }}>{m.label}</option>)}
        </select>
        <button type="submit" disabled={loading || !query.trim()} style={{ padding: "11px 18px", borderRadius: 9, cursor: loading || !query.trim() ? "not-allowed" : "pointer", background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", border: "none", color: "#0d1b2a", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, opacity: loading ? 0.6 : 1 }}>
          {loading ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : <Sparkles style={{ width: 14, height: 14 }} />}
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Rule banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.30)", marginBottom: 16 }}>
        <AlertTriangle style={{ width: 13, height: 13, color: "#86efac", flexShrink: 0 }} />
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.70)", margin: 0 }}>
          The AI collects only from matched source content. Conflicting scholarly opinions are never merged — each carries its own citation. Missing knowledge is never fabricated.
        </p>
      </div>

      {error && (
        <div style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.40)", marginBottom: 14 }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#fca5a5", margin: 0 }}>{error}</p>
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 48, gap: 12 }}>
          <Loader2 style={{ width: 26, height: 26, color: G.text, animation: "spin 1s linear infinite" }} />
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: G.dim, margin: 0 }}>Searching across Google Drive, OneDrive, and the Master PDF Library…</p>
        </div>
      )}

      {!loading && results && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          {/* Counts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 16 }}>
            <CountCard icon={Database} label="Master Library" value={results.counts?.db ?? 0} />
            <CountCard icon={Cloud} label="Google Drive" value={results.counts?.googleDrive ?? 0} />
            <CountCard icon={Cloud} label="OneDrive" value={results.counts?.oneDrive ?? 0} />
            <CountCard icon={BookOpen} label="Adobe" value={typeof results.counts?.adobe === "string" ? "—" : (results.counts?.adobe ?? 0)} />
          </div>
          <KnowledgeSearchResults results={results} />
        </motion.div>
      )}
    </AdminLayout>
  );
}

function CountCard({ icon: Icon, label, value }) {
  return (
    <div style={{ padding: 12, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Icon style={{ width: 12, height: 12, color: G.dim }} />
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", margin: 0 }}>{label}</p>
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 20, fontWeight: 700, color: G.text, margin: 0 }}>{value}</p>
    </div>
  );
}
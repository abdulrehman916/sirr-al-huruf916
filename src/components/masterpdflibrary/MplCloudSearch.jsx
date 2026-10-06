/**
 * MplCloudSearch — Owner-only server-side search across connected
 * cloud libraries (Google Drive, OneDrive, Adobe). Searches the
 * provider's own index without downloading binaries. Read-only —
 * never modifies or deletes anything.
 */
import { useState } from "react";
import { Loader2, Search, ExternalLink, HardDrive, FileBox, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = { border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)", text: "#F5D060", dim: "rgba(212,175,55,0.55)", bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)" };

function ProviderTabs({ provider, setProvider }) {
  const tabs = [
    { id: "googledrive", label: "Google Drive", icon: HardDrive },
    { id: "onedrive", label: "OneDrive", icon: HardDrive },
    { id: "adobe", label: "Adobe", icon: FileBox },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
      {tabs.map((t) => {
        const active = provider === t.id;
        const Icon = t.icon;
        return (
          <button key={t.id} onClick={() => setProvider(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 7, cursor: "pointer", background: active ? G.bgHi : "transparent", border: active ? `1px solid ${G.borderHi}` : `1px solid ${G.border}`, color: active ? G.text : "rgba(255,255,255,0.55)", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: active ? 700 : 500 }}>
            <Icon style={{ width: 13, height: 13 }} /> {t.label}
          </button>
        );
      })}
    </div>
  );
}

function FileRow({ f, onRead, reading }) {
  return (
    <div style={{ padding: 11, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <FileText style={{ width: 14, height: 14, color: G.text, flexShrink: 0 }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: "#fff", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
        <span>{(f.size_bytes || 0 / 1024 / 1024).toFixed ? `${((f.size_bytes || 0) / 1024 / 1024).toFixed(1)} MB` : "—"}</span>
        {f.modified_time && <span>{new Date(f.modified_time).toLocaleDateString()}</span>}
        {f.view_link && <a href={f.view_link} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", display: "flex", alignItems: "center", gap: 3 }}><ExternalLink style={{ width: 11, height: 11 }} /> open</a>}
        {onRead && (
          <button onClick={() => onRead(f)} disabled={reading} style={{ marginLeft: "auto", padding: "4px 9px", borderRadius: 6, cursor: "pointer", background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text, fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 700 }}>
            {reading ? "Reading…" : "Read text"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MplCloudSearch() {
  const [provider, setProvider] = useState("googledrive");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState(null);
  const [readText, setReadText] = useState(null);
  const [readingId, setReadingId] = useState(null);

  const run = async (mode = "search") => {
    setLoading(true); setErr(null); setReadText(null); setFiles([]);
    try {
      const fn = provider === "googledrive" ? "searchGoogleDrivePdfs" : provider === "onedrive" ? "searchOneDrivePdfs" : "searchAdobeCloudPdfs";
      const payload = mode === "list" ? { mode: "list", page_size: 50 } : { mode: "search", query, page_size: 50 };
      const r = await base44.functions.invoke(fn, payload);
      const d = r?.data || r;
      if (provider === "adobe") { setErr(d?.error || "Adobe: " + (d?.note || "library search not available")); return; }
      if (d?.success) setFiles(d.files || []);
      else setErr(d?.error || "Search failed");
    } catch (e) { setErr(e?.message || "Search failed"); } finally { setLoading(false); }
  };

  const readOne = async (f) => {
    setReadingId(f.id); setReadText(null);
    try {
      const fn = provider === "googledrive" ? "searchGoogleDrivePdfs" : "searchOneDrivePdfs";
      const r = await base44.functions.invoke(fn, { mode: "read", file_id: f.id });
      const d = r?.data || r;
      if (d?.success) setReadText({ id: f.id, text: d.text || "", chars: d.char_count || (d.text || "").length });
      else setErr(d?.error || "Read failed");
    } catch (e) { setErr(e?.message); } finally { setReadingId(null); }
  };

  return (
    <div>
      <ProviderTabs provider={provider} setProvider={setProvider} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input
          value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run("search")}
          placeholder={provider === "adobe" ? "Adobe has no public search API — use Drive/OneDrive" : "Full-text search query…"}
          disabled={provider === "adobe"}
          style={{ flex: 1, minWidth: 200, padding: "9px 11px", borderRadius: 8, fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif" }}
        />
        <button onClick={() => run("search")} disabled={loading || provider === "adobe"} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 8, cursor: "pointer", background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700 }}>
          {loading ? <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} /> : <Search style={{ width: 14, height: 14 }} />} Search
        </button>
        <button onClick={() => run("list")} disabled={loading || provider === "adobe"} style={{ padding: "9px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.60)", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600 }}>List all</button>
      </div>

      {err && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#fca5a5", margin: "0 0 10px 0" }}>{err}</p>}

      {files.length > 0 && (
        <div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: G.dim, margin: "0 0 8px 0" }}>{files.length} PDF(s) found — server-side, read-only</p>
          {files.map((f) => <FileRow key={f.id} f={f} onRead={readOne} reading={readingId === f.id} />)}
        </div>
      )}

      {readText && (
        <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: "rgba(0,0,0,0.30)", border: `1px solid ${G.borderHi}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: G.text }}>Extracted text · {readText.chars} chars</span>
            <button onClick={() => setReadText(null)} style={{ color: "rgba(255,255,255,0.40)", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
          <pre style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.75)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 320, overflowY: "auto", margin: 0 }}>{readText.text}</pre>
        </div>
      )}
    </div>
  );
}
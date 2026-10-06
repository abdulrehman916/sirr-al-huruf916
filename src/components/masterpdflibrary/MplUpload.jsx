/**
 * MplUpload — PDF upload + cloud connection status.
 * Upload → UploadFile → create MasterPdfBook (import_source='upload',
 * extraction_status='uploading'). Shows Google Drive / OneDrive / Adobe
 * connection status. Owner-only (page-gated).
 */
import { useState, useEffect } from "react";
import { Loader2, UploadCloud, CheckCircle2, XCircle, HardDrive, Cloud, FileBox } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = { border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)", text: "#F5D060", dim: "rgba(212,175,55,0.55)", bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)" };

function ConnCard({ name, icon: Icon, status, note }) {
  const ok = status === "connected";
  return (
    <div style={{ flex: "1 1 240px", minWidth: 240, padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${ok ? "rgba(34,197,94,0.35)" : G.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon style={{ width: 16, height: 16, color: ok ? "#86efac" : G.dim }} />
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: "#fff" }}>{name}</span>
        {ok ? <CheckCircle2 style={{ width: 14, height: 14, color: "#86efac", marginLeft: "auto" }} /> : <XCircle style={{ width: 14, height: 14, color: "#fca5a5", marginLeft: "auto" }} />}
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: ok ? "#86efac" : "rgba(255,255,255,0.45)", margin: 0 }}>
        {ok ? "Connected — Owner account" : "Not connected"}
      </p>
      {note && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: G.dim, margin: "4px 0 0 0" }}>{note}</p>}
    </div>
  );
}

export default function MplUpload() {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [bookName, setBookName] = useState("");
  const [conn, setConn] = useState({ drive: "unknown", onedrive: "unknown", adobe: "unknown", adobeNote: "" });

  useEffect(() => {
    (async () => {
      try {
        const adobe = await base44.functions.invoke("searchAdobeCloudPdfs", { mode: "status" });
        const d = adobe?.data || adobe;
        setConn((c) => ({ ...c, adobe: d?.configured ? "connected" : "missing", adobeNote: d?.note }));
      } catch { setConn((c) => ({ ...c, adobe: "missing" })); }
      // Drive/OneDrive connection status — inferred by attempting a list call
      try { const r = await base44.functions.invoke("searchGoogleDrivePdfs", { mode: "list", page_size: 1 }); setConn((c) => ({ ...c, drive: (r?.data || r)?.success ? "connected" : "missing" })); } catch { setConn((c) => ({ ...c, drive: "missing" })); }
      try { const r = await base44.functions.invoke("searchOneDrivePdfs", { mode: "list", page_size: 1 }); setConn((c) => ({ ...c, onedrive: (r?.data || r)?.success ? "connected" : "missing" })); } catch { setConn((c) => ({ ...c, onedrive: "missing" })); }
    })();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setMsg(null);
    try {
      const up = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = up?.file_url || up?.data?.file_url;
      if (!fileUrl) throw new Error("Upload failed");
      const ts = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      const masterBookId = `MPB-${ts}-${rand}`;
      const partId = `MPBP-${masterBookId}-1`;
      await base44.entities.MasterPdfBook.create({
        master_book_id: masterBookId,
        library_type: "master_library",
        import_source: "upload",
        malayalam_book_name: bookName || file.name,
        book_title: file.name,
        upload_date: new Date().toISOString(),
        extraction_status: "uploading",
        pdf_parts: [{
          part_id: partId, part_number: 1, file_url: fileUrl, file_name: file.name,
          file_size: file.size || 0, uploaded_at: new Date().toISOString(),
          processed: false, extraction_status: "pending",
        }],
        version_history: [{ version_id: `v-${ts}`, timestamp: new Date().toISOString(), action: "upload", change_summary: `Uploaded ${file.name}` }],
      });
      setMsg({ ok: true, text: `Uploaded "${file.name}". Book created — processing will index pages server-side.` });
      setBookName("");
    } catch (err) {
      setMsg({ ok: false, text: err?.message || "Upload failed" });
    } finally { setUploading(false); e.target.value = ""; }
  };

  return (
    <div>
      {/* Upload */}
      <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <UploadCloud style={{ width: 16, height: 16, color: G.text }} />
          <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: "#fff", margin: 0 }}>Upload PDF</h3>
        </div>
        <input
          type="text" placeholder="Malayalam display name (optional)" value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          style={{ width: "100%", padding: "9px 11px", borderRadius: 8, fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif", marginBottom: 10, boxSizing: "border-box" }}
        />
        <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 8, cursor: uploading ? "wait" : "pointer", background: G.bgHi, border: `1px dashed ${G.borderHi}`, color: G.text, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600 }}>
          {uploading ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> : <UploadCloud style={{ width: 15, height: 15 }} />}
          {uploading ? "Uploading…" : "Choose PDF to upload"}
          <input type="file" accept="application/pdf" onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
        </label>
        {msg && (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, margin: "10px 0 0 0", color: msg.ok ? "#86efac" : "#fca5a5" }}>{msg.text}</p>
        )}
      </div>

      {/* Cloud connections */}
      <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Cloud style={{ width: 16, height: 16, color: G.text }} />
          <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: "#fff", margin: 0 }}>Cloud Connections (Owner account)</h3>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <ConnCard name="Google Drive" icon={HardDrive} status={conn.drive} note="drive.readonly · server-side search" />
          <ConnCard name="Microsoft OneDrive" icon={HardDrive} status={conn.onedrive} note="Files.Read.All · server-side search" />
          <ConnCard name="Adobe Document Cloud" icon={FileBox} status={conn.adobe} note={conn.adobeNote || "Credentials required"} />
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.40)", margin: "12px 0 0 0" }}>
          Connect/disconnect is performed by the Owner through the Base44 builder OAuth flow. Admins and users can never access these connections.
        </p>
      </div>
    </div>
  );
}
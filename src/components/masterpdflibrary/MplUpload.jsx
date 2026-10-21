/**
 * MplUpload — PDF upload + cloud connection status.
 * Upload → UploadFile → create MasterPdfBook (import_source='upload',
 * extraction_status='uploading'). Shows Google Drive / OneDrive / Adobe
 * connection status. Owner-only (page-gated).
 */
import { useState, useEffect, useRef } from "react";
import { Loader2, UploadCloud, CheckCircle2, XCircle, HardDrive, Cloud, FileBox } from "lucide-react";
import { platform } from "@/api/platformClient";
import { importOwnerPdf } from "@/lib/ownerLibraryImport";

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

export default function MplUpload({ onBusyChange }) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [bookName, setBookName] = useState("");
  const [language, setLanguage] = useState('ara');
  const [progress, setProgress] = useState('');
  const pending = useRef(null);
  const alive = useRef(true);
  const [conn, setConn] = useState({ drive: "unknown", onedrive: "unknown", adobe: "unknown", adobeNote: "" });

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; pending.current?.abort(); };
  }, []);
  useEffect(() => {
    if (!uploading) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [uploading]);
  useEffect(() => {
    (async () => {
      try {
        const adobe = await platform.functions.invoke("searchAdobeCloudPdfs", { mode: "status" });
        const d = adobe?.data || adobe;
        setConn((c) => ({ ...c, adobe: d?.configured ? "connected" : "missing", adobeNote: d?.note }));
      } catch { setConn((c) => ({ ...c, adobe: "missing" })); }
      // Drive/OneDrive connection status — inferred by attempting a list call
      try { const r = await platform.functions.invoke("searchGoogleDrivePdfs", { mode: "list", page_size: 1 }); setConn((c) => ({ ...c, drive: (r?.data || r)?.success ? "connected" : "missing" })); } catch { setConn((c) => ({ ...c, drive: "missing" })); }
      try { const r = await platform.functions.invoke("searchOneDrivePdfs", { mode: "list", page_size: 1 }); setConn((c) => ({ ...c, onedrive: (r?.data || r)?.success ? "connected" : "missing" })); } catch { setConn((c) => ({ ...c, onedrive: "missing" })); }
    })();
  }, []);

  const handleUpload = async (e) => {
    const input = e.target;
    const file = e.target.files?.[0];
    if (!file || pending.current) return;
    const controller = new AbortController(); pending.current = controller;
    setUploading(true); setMsg(null); onBusyChange?.(true);
    try {
      const result = await importOwnerPdf({ file, language, displayName: bookName, signal: controller.signal,
        onProgress: text => { if (alive.current) setProgress(text); },
      }, {
        invoke: body => platform.functions.invoke('ownerLibraryIngest', body),
        upload: selected => platform.integrations.Core.UploadFile({ file: selected }),
        remove: path => platform.integrations.Core.RemoveUploadedFile({ path }),
      });
      if (alive.current) {
        setMsg({ ok: true, text: `${result.alreadyIndexed ? 'Already indexed' : 'Indexed'} ${result.indexed} pages from "${file.name}". Open Full-Text Search to review. Pages remain private and unapproved.` });
        setBookName('');
      }
    } catch (err) {
      if (alive.current) setMsg({ ok: false, text: (err?.name === 'AbortError' ? 'Paused.' : err?.message || 'Import failed.') + ' Saved pages are retained. Select the same PDF to resume.' });
    } finally {
      pending.current = null; onBusyChange?.(false); input.value = '';
      if (alive.current) { setUploading(false); setProgress(''); }
    }
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
          disabled={uploading}
          type="text" placeholder="Malayalam display name (optional)" value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          style={{ width: "100%", padding: "9px 11px", borderRadius: 8, fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif", marginBottom: 10, boxSizing: "border-box" }}
        />
        <label className="block text-xs text-white/70 mb-3">Document language
          <select value={language} disabled={uploading} onChange={e => setLanguage(e.target.value)} className="ml-3 rounded border border-white/20 bg-slate-950 p-2">
            <option value="ara">Arabic + English</option><option value="eng">English</option><option value="mal">Malayalam + English</option>
          </select>
        </label>
        <p className="text-xs text-white/60 mb-3">Up to 50 MB / 5,000 pages. Text extraction and scan OCR run on this device. Keep this tab open. Original PDFs and extracted text stay private; review before publication.</p>
        <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 8, cursor: uploading ? "wait" : "pointer", background: G.bgHi, border: `1px dashed ${G.borderHi}`, color: G.text, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600 }}>
          {uploading ? <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} /> : <UploadCloud style={{ width: 15, height: 15 }} />}
          {uploading ? "Importing…" : "Choose PDF to import or resume"}
          <input type="file" accept="application/pdf" onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
        </label>
        {uploading && <div role="status" className="mt-3 text-xs text-amber-200">{progress}<button type="button" onClick={() => pending.current?.abort()} className="ml-3 underline">Pause import</button></div>}
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
          Cloud providers need a separate connection to this independent app. Existing Base44 connections are not shared. You can download a PDF from your cloud account and import it above.
        </p>
      </div>
    </div>
  );
}

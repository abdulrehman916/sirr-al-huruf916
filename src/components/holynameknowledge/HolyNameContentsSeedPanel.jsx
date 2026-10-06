import { useState, useRef } from "react";
import { BookCopy, Loader2, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const P = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(245,208,96,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const ACCEPT = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"];

/**
 * Admin panel that builds the Section B card list directly from a PDF's
 * Table of Contents (المحتويات). One card is created per Holy Name exactly
 * as printed in the Contents — verbatim Arabic name, page number, and the
 * Surah heading that precedes it. No meanings are generated here; all real
 * content arrives later via the PDF import, appended to each matching card.
 */
export default function HolyNameContentsSeedPanel({ onSeeded }) {
  const { role } = useAuth();
  const isAdmin = role === "admin" || role === "owner";
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [label, setLabel] = useState("");
  const inputRef = useRef(null);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border p-5 flex items-center gap-3" style={{ background: P.bg, borderColor: P.border }}>
        <Lock className="w-4 h-4" style={{ color: P.dim }} />
        <p className="font-inter text-[11px]" style={{ color: P.dim }}>
          Section B Contents seeding is available to administrators only.
        </p>
      </div>
    );
  }

  const addLog = (line) => setLog((l) => [...l, line]);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setLog([]);
    const source_pdf_file = (label.trim() || files[0]?.name || "contents").slice(0, 80);
    try {
      addLog(`Uploading ${files.length} Contents page(s)…`);
      const file_urls = [];
      for (const f of files) {
        const up = await base44.integrations.Core.UploadFile({ file: f });
        const url = up?.file_url;
        if (url) file_urls.push(url);
      }
      if (file_urls.length === 0) { addLog("✗ Upload failed."); setBusy(false); return; }

      addLog(`Reading the Table of Contents (transcribing every name verbatim)…`);
      const res = await base44.functions.invoke("seedHolyOneNamesFromContents", {
        file_urls,
        source_pdf_file,
      });
      const d = res?.data || {};
      addLog(
        `✓ Section B built from Contents: ${d.names_transcribed || 0} names transcribed · ${d.created || 0} cards created · ${d.skipped_duplicates || 0} already existed · ${d.total_in_db || 0} total in library.`
      );
      setLabel("");
      if (onSeeded) onSeeded();
    } catch (e) {
      addLog(`✗ ${e?.message || "error"}`);
    }
    setBusy(false);
  };

  const onPick = (e) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      ACCEPT.some((t) => f.type === t) ||
      /\.(pdf|jpe?g|png|webp)$/i.test(f.name)
    );
    handleFiles(files);
    e.target.value = "";
  };

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ background: P.bg, borderColor: P.borderHi, boxShadow: `0 0 18px ${P.glow}` }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BookCopy className="w-4 h-4" style={{ color: P.text }} />
          <span className="font-inter text-[11px] font-bold uppercase tracking-widest" style={{ color: P.text }}>
            Build Section B from PDF Contents
          </span>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border font-inter text-[10px] uppercase tracking-widest font-bold"
          style={{
            background: busy ? P.faint : P.bgHi,
            borderColor: busy ? P.border : P.borderHi,
            color: busy ? P.dim : P.text,
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookCopy className="w-3.5 h-3.5" />}
          {busy ? "Seeding…" : "Seed from Contents"}
        </button>
        <input ref={inputRef} type="file" accept={ACCEPT.join(",")} multiple onChange={onPick} className="hidden" />
      </div>

      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Source label (e.g. book name) — optional"
        className="w-full bg-transparent outline-none font-inter text-xs px-3 py-2 rounded-lg border"
        style={{ borderColor: P.border, color: "rgba(255,255,255,0.85)" }}
        dir="auto"
      />

      {log.length === 0 ? (
        <p className="font-inter text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
          Upload the Table of Contents page(s) of the PDF (screenshots or the Contents PDF). The system transcribes every Holy Name exactly as printed and creates one Section B card per name — verbatim Arabic title, page number, and its Surah. No meanings are generated here; importing the book's content later appends Arabic text, Malayalam translation, tables, magic squares, and images to each matching card without overwriting.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {log.map((line, i) => {
            const ok = line.startsWith("✓");
            const bad = line.startsWith("✗");
            return (
              <div key={i} className="flex items-start gap-2 font-inter text-[10px]" style={{ color: ok ? "rgba(134,239,172,0.85)" : bad ? "rgba(248,113,113,0.85)" : "rgba(255,255,255,0.65)" }}>
                {ok ? <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" /> : bad ? <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /> : <span className="mt-0.5">•</span>}
                <span className="leading-relaxed">{line}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import { useState, useRef } from "react";
import { Upload, FileJson, FileSpreadsheet, Loader2, Database } from "lucide-react";
import * as XLSX from "xlsx";
import { base44 } from "@/api/base44Client";
import ImportReport from "./ImportReport";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

export default function ImportExportBar({ entries, onImportComplete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);
  const [importMode, setImportMode] = useState("json"); // "json" | "csv" | "xlsx"
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState(null); // { current, total }

  // ── Export JSON ──
  const exportJSON = () => {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purpose-dictionary-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const headers = [
      "purpose_phrase", "arabic_keyword", "malayalam_meaning", "english_meaning",
      "action", "normalized_purpose_key", "language", "aliases", "source", "is_active", "notes",
    ];
    const escapeCSV = (val) => {
      const s = (val || "").toString();
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    const rows = entries.map(e => [
      escapeCSV(e.purpose_phrase),
      escapeCSV(e.arabic_keyword),
      escapeCSV(e.malayalam_meaning),
      escapeCSV(e.english_meaning),
      escapeCSV(e.action),
      escapeCSV(e.normalized_purpose_key),
      escapeCSV(e.language),
      escapeCSV((e.aliases || []).join("|")),
      escapeCSV(e.source),
      escapeCSV(e.is_active !== false ? "true" : "false"),
      escapeCSV(e.notes),
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purpose-dictionary-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  // ── Export Excel (.xlsx) — exact PurposeDictionary column structure ──
  const exportExcel = () => {
    const headers = [
      "purpose_phrase", "arabic_keyword", "malayalam_meaning", "english_meaning",
      "action", "normalized_purpose_key", "language", "aliases", "source", "is_active", "notes",
    ];
    const rows = entries.map(e => ({
      purpose_phrase: e.purpose_phrase || "",
      arabic_keyword: e.arabic_keyword || "",
      malayalam_meaning: e.malayalam_meaning || "",
      english_meaning: e.english_meaning || "",
      action: e.action || "jalb",
      normalized_purpose_key: e.normalized_purpose_key || "",
      language: e.language || "mixed",
      aliases: (e.aliases || []).join("|"),
      source: e.source || "",
      is_active: e.is_active !== false ? "true" : "false",
      notes: e.notes || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PurposeDictionary");
    XLSX.writeFile(wb, `purpose-dictionary-${new Date().toISOString().split("T")[0]}.xlsx`);
    setShowMenu(false);
  };

  // ── Import ──
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setMessage("");
    setReport(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let parsed = [];

        if (importMode === "json") {
          const content = event.target.result;
          parsed = JSON.parse(content);
          if (!Array.isArray(parsed)) {
            // Maybe it's a backup object with entries array
            if (parsed.entries && Array.isArray(parsed.entries)) {
              parsed = parsed.entries;
            } else {
              throw new Error("Invalid JSON: expected an array of entries");
            }
          }
        } else if (importMode === "xlsx") {
          // Excel parse — read as ArrayBuffer
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          parsed = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        } else {
          // CSV parse
          const content = event.target.result;
          parsed = parseCSV(content);
        }

        if (parsed.length === 0) {
          setMessage("No entries found in file.");
          setImporting(false);
          return;
        }

        const CHUNK_SIZE = 250;
        const totalChunks = Math.ceil(parsed.length / CHUNK_SIZE);
        const aggregated = { total: 0, imported: 0, updated: 0, skipped: 0, duplicatesMerged: 0, errors: [] };

        // ── Phase 1: Auto-backup before import (version snapshot for rollback) ──
        let versionId = null;
        setProgress({ phase: "backup", current: 0, total: 1 });
        try {
          const backupRes = await base44.functions.invoke("backupPurposeDictionary", {
            label: `Pre-import ${new Date().toISOString()}`,
          });
          versionId = backupRes.data?.version_id || null;
        } catch (backupErr) {
          // Backup failed — proceed without rollback safety net
          console.warn("Pre-import backup failed:", backupErr);
        }

        // ── Phase 2: Chunked smart import via backend (dedup + merge + validate) ──
        let importFailed = false;
        let failError = null;
        for (let c = 0; c < totalChunks; c++) {
          const chunk = parsed.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
          setProgress({ phase: "import", current: c + 1, total: totalChunks });
          try {
            const response = await base44.functions.invoke("bulkImportPurposeDictionary", { entries: chunk });
            const r = response.data || {};
            aggregated.total += r.total || 0;
            aggregated.imported += r.imported || 0;
            aggregated.updated += r.updated || 0;
            aggregated.skipped += r.skipped || 0;
            aggregated.duplicatesMerged += r.duplicatesMerged || 0;
            if (r.errors) aggregated.errors.push(...r.errors);
          } catch (chunkErr) {
            importFailed = true;
            failError = chunkErr;
            break;
          }
        }

        // ── Phase 3: Rollback on failure OR finalize on success ──
        if (importFailed && versionId) {
          setProgress({ phase: "rollback", current: 0, total: 1 });
          try {
            const restoreRes = await base44.functions.invoke("restorePurposeDictionary", { version_id: versionId });
            const rd = restoreRes.data || {};
            // Client-side recreation: download snapshot + bulkCreate in chunks
            if (rd.snapshot_file_url) {
              const fileRes = await fetch(rd.snapshot_file_url);
              const json = await fileRes.text();
              const records = JSON.parse(json);
              const restoreChunks = Math.ceil(records.length / 250);
              for (let rc = 0; rc < restoreChunks; rc++) {
                setProgress({ phase: "rollback", current: rc + 1, total: restoreChunks });
                const chunk = records.slice(rc * 250, (rc + 1) * 250);
                await base44.entities.PurposeDictionary.bulkCreate(chunk);
              }
            }
            aggregated.errors.unshift(`Import failed: ${failError?.message || "Unknown error"}. Automatically rolled back to pre-import state (${rd.record_count} records restored).`);
          } catch (rollbackErr) {
            aggregated.errors.unshift(`Import failed: ${failError?.message}. Rollback also failed: ${rollbackErr.message}. Manual restore needed via Version History.`);
          }
          try {
            await base44.functions.invoke("finalizePurposeDictionaryImport", { version_id: versionId, report: aggregated, status: "failed" });
          } catch {}
        } else if (versionId) {
          try {
            await base44.functions.invoke("finalizePurposeDictionaryImport", { version_id: versionId, report: aggregated, status: "completed" });
          } catch {}
        }

        setReport(aggregated);
        setMessage(importFailed
          ? "Import failed — rolled back to pre-import state. See report."
          : `Done: ${aggregated.imported} new, ${aggregated.updated} updated, ${aggregated.duplicatesMerged} merged, ${aggregated.skipped} skipped.`);
        onImportComplete();
      } catch (err) {
        setMessage("Import failed: " + (err.message || "Unknown error"));
      } finally {
        setImporting(false);
        setProgress(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    if (importMode === "xlsx") {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const triggerImport = (mode) => {
    setImportMode(mode);
    setShowMenu(false);
    setTimeout(() => {
      if (fileRef.current) fileRef.current.click();
    }, 100);
  };

  return (
    <div className="relative">
      <input
        ref={fileRef}
        type="file"
        accept={importMode === "json" ? ".json,application/json" : importMode === "xlsx" ? ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : ".csv,text/csv"}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={importing}
        className="px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold font-inter"
        style={{
          background: G.bg,
          border: `1px solid ${G.border}`,
          color: G.text,
        }}
      >
        {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
        {importing ? "Importing..." : "Import / Export"}
      </button>

      {showMenu && (
        <>
          <div onClick={() => setShowMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 999 }} />
          <div
            className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-1000 min-w-[200px]"
            style={{
              background: "linear-gradient(145deg, rgba(8,16,38,0.99) 0%, rgba(4,10,24,0.99) 100%)",
              border: `1px solid ${G.borderHi}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.60)",
            }}
          >
            <div className="p-2 space-y-1">
              <p className="font-inter text-[9px] uppercase tracking-wider font-bold px-2 py-1" style={{ color: "rgba(212,175,55,0.50)" }}>Export</p>
              <MenuItem icon={<FileJson className="w-3.5 h-3.5" />} label="Export JSON (Backup)" onClick={exportJSON} />
              <MenuItem icon={<FileSpreadsheet className="w-3.5 h-3.5" />} label="Export CSV" onClick={exportCSV} />
              <MenuItem icon={<FileSpreadsheet className="w-3.5 h-3.5" />} label="Export Excel (.xlsx)" onClick={exportExcel} />
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
              <p className="font-inter text-[9px] uppercase tracking-wider font-bold px-2 py-1" style={{ color: "rgba(212,175,55,0.50)" }}>Import</p>
              <MenuItem icon={<Upload className="w-3.5 h-3.5" />} label="Import JSON" onClick={() => triggerImport("json")} />
              <MenuItem icon={<Upload className="w-3.5 h-3.5" />} label="Import CSV" onClick={() => triggerImport("csv")} />
              <MenuItem icon={<Upload className="w-3.5 h-3.5" />} label="Import Excel (.xlsx)" onClick={() => triggerImport("xlsx")} />
            </div>
          </div>
        </>
      )}

      {progress && (
        <div className="absolute right-0 top-full mt-1 rounded-lg p-2 z-1000 min-w-[250px]"
          style={{ background: "rgba(8,16,38,0.95)", border: `1px solid ${G.border}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: G.text }} />
            <p className="font-inter text-xs" style={{ color: G.text }}>
              {progress.phase === "backup" ? "Creating backup snapshot..." :
               progress.phase === "rollback" ? "Rolling back to pre-import state..." :
               `Importing chunk ${progress.current} / ${progress.total}`}
            </p>
          </div>
          <div className="w-full h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-1 rounded-full transition-all" style={{
              width: progress.phase === "import" ? `${(progress.current / progress.total) * 100}%` : "100%",
              background: progress.phase === "rollback" ? "linear-gradient(90deg, #F87171, #FCA5A5)" : "linear-gradient(90deg, #D4AF37, #F5D060)",
              opacity: progress.phase === "backup" ? 0.5 : 1,
            }} />
          </div>
        </div>
      )}
      {message && !progress && (
        <div className="absolute right-0 top-full mt-1 rounded-lg p-2 z-1000 min-w-[250px]"
          style={{
            background: message.includes("failed") ? "rgba(248,113,113,0.14)" : "rgba(74,222,128,0.14)",
            border: `1px solid ${message.includes("failed") ? "rgba(248,113,113,0.40)" : "rgba(74,222,128,0.40)"}`,
          }}>
          <p className="font-inter text-xs" style={{ color: message.includes("failed") ? "#F87171" : "#4ADE80" }}>{message}</p>
        </div>
      )}
      {report && !importing && (
        <div className="absolute right-0 top-full mt-1 z-1000 min-w-[300px] max-w-[400px]">
          <ImportReport report={report} onClose={() => setReport(null)} />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg font-inter text-xs hover:bg-white/5 transition-colors text-left"
      style={{ color: "rgba(255,255,255,0.75)" }}
    >
      <span style={{ color: "rgba(212,175,55,0.60)" }}>{icon}</span>
      {label}
    </button>
  );
}

// ── Simple CSV parser ──
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const parseLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { current += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ",") { result.push(current); current = ""; }
        else { current += ch; }
      }
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(lines[0]);
  const entries = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const entry = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j].trim();
      let val = (values[j] || "").trim();
      if (key === "aliases") {
        entry[key] = val ? val.split("|").map(a => a.trim()).filter(Boolean) : [];
      } else if (key === "is_active") {
        entry[key] = val === "true";
      } else {
        entry[key] = val;
      }
    }
    entries.push(entry);
  }
  return entries;
}
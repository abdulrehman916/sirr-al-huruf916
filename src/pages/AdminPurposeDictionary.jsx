import { useState, useEffect, useCallback } from "react";
import { platform } from "@/api/platformClient";
import { useAuth } from "@/lib/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsPanel from "@/components/admin/purposeDict/StatsPanel";
import EntryTable from "@/components/admin/purposeDict/EntryTable";
import EntryEditor from "@/components/admin/purposeDict/EntryEditor";
import ImportExportBar from "@/components/admin/purposeDict/ImportExportBar";
import VersionHistoryPanel from "@/components/admin/purposeDict/VersionHistoryPanel";
import AuditLogPanel from "@/components/admin/purposeDict/AuditLogPanel";
// ── PERMANENT ISOLATION LAW ──
// This import is documentation-only; it enforces that this page is the
// ONLY writer of PurposeDictionary and must never connect to any Mizan,
// engine, calculation, or timing logic. See purposeDictionaryIsolationLaw.js
import "@/lib/purposeDictionaryIsolationLaw";
import { Plus, RefreshCw } from "lucide-react";

export default function AdminPurposeDictionary() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deduplicating, setDeduplicating] = useState(false);
  const [dedupMessage, setDedupMessage] = useState("");
  const archiveDuplicates = async () => {
    if (deduplicating) return;
    setDeduplicating(true); setDedupMessage("");
    try {
      const result = await platform.functions.invoke("archivePurposeDuplicates", {});
      setDedupMessage(`${result.data.archived} duplicate entries archived. Backup saved in Version History.`);
      window.dispatchEvent(new Event("purpose-dictionary-updated"));
      setRefreshKey(k => k + 1);
    } catch (error) { setDedupMessage(error.message); }
    finally { setDeduplicating(false); }
  };

  // ── Audit logging helper (isolated to PurposeDictionaryAuditLog) ──
  const logAudit = useCallback(async (action, details, recordCount = 0) => {
    try {
      await platform.entities.PurposeDictionaryAuditLog.create({
        log_id: `PDA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        action,
        performed_by: user?.id || "",
        performed_by_email: user?.email || "",
        details: JSON.stringify(details),
        record_count: recordCount,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Audit log failed:", err);
    }
  }, [user]);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const allEntries = [];
      let after = null;
      do {
        const result = await platform.functions.invoke("getOwnerPurposeRecords", { after });
        const page = result?.data || {};
        if (!page.success || !Array.isArray(page.rows)) throw new Error("The dictionary page response was invalid.");
        allEntries.push(...page.rows);
        after = page.has_more ? page.next_cursor : null;
        if (page.has_more && !after) throw new Error("The dictionary returned an incomplete page cursor.");
      } while (after);
      setEntries(allEntries);
    } catch (err) {
      console.error("Failed to load PurposeDictionary entries:", err);
      setEntries([]);
      setLoadError(err.message || "Could not load the Purpose Dictionary.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries, refreshKey]);

  const handleSave = () => {
    window.dispatchEvent(new Event("purpose-dictionary-updated"));
    const wasNew = !editingEntry;
    logAudit(wasNew ? "RECORD_CREATE" : "RECORD_UPDATE", {
      purpose_phrase: editingEntry?.purpose_phrase || "new entry",
      arabic_keyword: editingEntry?.arabic_keyword || "",
    });
    setEditorOpen(false);
    setEditingEntry(null);
    setRefreshKey(k => k + 1);
  };

  const handleToggleActive = async (entry) => {
    try {
      await platform.functions.invoke("savePurposeEntry", { id: entry.id, entry: { ...entry, arabic_keyword: entry.arabic_keyword || entry.purpose_phrase, is_active: !entry.is_active } });
      window.dispatchEvent(new Event("purpose-dictionary-updated"));
      await logAudit("RECORD_UPDATE", { id: entry.id, arabic_keyword: entry.arabic_keyword, field: "is_active", old: entry.is_active, new: !entry.is_active });
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error("Failed to toggle entry:", err);
      alert("Failed to update entry: " + (err.message || "Unknown error"));
    }
  };

  const handleDelete = async (entry) => {
    if (!confirm(`Delete "${entry.purpose_phrase}"?\n\nThis action cannot be undone.`)) return;
    try {
      await platform.entities.PurposeDictionary.delete(entry.id);
      await logAudit("RECORD_DELETE", { id: entry.id, purpose_phrase: entry.purpose_phrase, arabic_keyword: entry.arabic_keyword });
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error("Failed to delete entry:", err);
      alert("Failed to delete entry: " + (err.message || "Unknown error"));
    }
  };

  const handleImportComplete = () => {
    window.dispatchEvent(new Event("purpose-dictionary-updated"));
    setRefreshKey(k => k + 1);
  };

  return (
    <AdminLayout title="Purpose Dictionary" subtitle="7th Mizan Lookup Database">
      <div className="space-y-4" style={{ color: "#fff" }}>
        {/* Header + Actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-inter text-xl font-bold text-white">Purpose Dictionary</h1>
            <p className="font-inter text-xs text-white/40 mt-1">
              Add Arabic words with Malayalam and English meanings. Select a suggestion in 7th Mizan to use its Arabic text with the existing calculation rules.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold font-inter"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,55,0.30)",
                color: "rgba(255,255,255,0.60)",
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={archiveDuplicates} disabled={loading || deduplicating} className="rounded-lg border border-yellow-500/30 px-3 py-2 text-xs">{deduplicating ? "Archiving…" : "Archive duplicates"}</button>
            <ImportExportBar disabled={loading || !!loadError} entries={entries} onImportComplete={handleImportComplete} />
            <button
              disabled={loading || !!loadError}
              onClick={() => { setEditingEntry(null); setEditorOpen(true); }}
              className="btn-gold px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Entry
            </button>
          </div>
        </div>

        {loadError && (
          <div role="alert" className="rounded-lg border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            <span>Purpose Dictionary failed to load: {loadError}</span>
            <button onClick={loadEntries} disabled={loading} className="ml-3 underline disabled:opacity-50">Retry</button>
          </div>
        )}

        {dedupMessage && <p role="status" className="text-sm text-yellow-100">{dedupMessage}</p>}
        {/* Stats */}
        <StatsPanel entries={entries} loading={loading} />

        {/* Table */}
        <EntryTable
          entries={entries}
          loading={loading}
          onEdit={(entry) => { setEditingEntry(entry); setEditorOpen(true); }}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />

        {/* Version History + Audit Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VersionHistoryPanel onRestored={() => setRefreshKey(k => k + 1)} />
          <AuditLogPanel />
        </div>

        {/* Editor Modal */}
        {editorOpen && (
          <EntryEditor
            entry={editingEntry}
            existingEntries={entries}
            onSave={handleSave}
            onClose={() => { setEditorOpen(false); setEditingEntry(null); }}
          />
        )}

        {/* Isolation Notice */}
        <div className="rounded-xl p-3" style={{
          background: "rgba(74,222,128,0.04)",
          border: "1px solid rgba(74,222,128,0.20)",
        }}>
          <p className="font-inter text-[11px] text-white/50 leading-relaxed">
            <span className="font-bold text-green-400/80">ISOLATION NOTICE:</span>{" "}
            This dashboard manages the PurposeDictionary database only. It NEVER participates in
            Ritual Timing, Mizan, Ebced, Bast, Kasam, Astro Clock, or purpose lookup calculations.
            The indexed lookup engine continues to operate independently.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState, useMemo } from "react";
import { X, Save, AlertTriangle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

const ACTIONS = [
  { value: "jalb", label: "Jalb (Attraction)" },
  { value: "tard", label: "Tard (Banishment)" },
  { value: "tafriq", label: "Tafriq (Separation)" },
  { value: "jam", label: "Jam (Gathering)" },
  { value: "sihhat", label: "Sihhat (Health)" },
  { value: "sekam", label: "Saqam (Sickness)" },
  { value: "tarfet", label: "Tarfet (Evil Eye)" },
  { value: "other", label: "Other" },
];

const PURPOSE_KEYS = [
  "celb", "tard", "sihhat", "sekam", "tarfet",
  "rizq", "knowledge", "travel", "sultan", "haybah",
];

const LANGUAGES = [
  { value: "ar", label: "Arabic" },
  { value: "ml", label: "Malayalam" },
  { value: "en", label: "English" },
  { value: "mixed", label: "Mixed" },
];

export default function EntryEditor({ entry, existingEntries, onSave, onClose }) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    purpose_phrase: entry?.purpose_phrase || "",
    arabic_keyword: entry?.arabic_keyword || "",
    malayalam_meaning: entry?.malayalam_meaning || "",
    english_meaning: entry?.english_meaning || "",
    action: entry?.action || "jalb",
    normalized_purpose_key: entry?.normalized_purpose_key || "celb",
    language: entry?.language || "mixed",
    aliases: (entry?.aliases || []).join("\n"),
    source: entry?.source || "",
    is_active: entry?.is_active !== false,
    notes: entry?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Duplicate detection
  const duplicates = useMemo(() => {
    const phrase = form.purpose_phrase.trim().toLowerCase();
    const aliasLines = form.aliases.split("\n").map(a => a.trim().toLowerCase()).filter(Boolean);

    const phraseDups = [];
    const aliasDups = [];

    for (const e of existingEntries) {
      if (isEdit && e.id === entry.id) continue;
      const ePhrase = (e.purpose_phrase || "").trim().toLowerCase();
      if (phrase && ePhrase === phrase) phraseDups.push(e);

      for (const alias of aliasLines) {
        if ((e.aliases || []).some(a => a.trim().toLowerCase() === alias)) {
          if (!aliasDups.find(d => d.id === e.id)) aliasDups.push(e);
        }
      }
    }

    return { phraseDups, aliasDups };
  }, [form.purpose_phrase, form.aliases, existingEntries, isEdit, entry?.id]);

  const hasDuplicates = duplicates.phraseDups.length > 0 || duplicates.aliasDups.length > 0;

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setError("");

    if (!form.purpose_phrase.trim()) {
      setError("Arabic Phrase is required.");
      return;
    }
    if (!form.normalized_purpose_key) {
      setError("Normalized Purpose Key is required.");
      return;
    }

    // Warn but allow saving duplicates (user may override)
    // — the duplicate warning is informational, not a hard block

    setSaving(true);
    try {
      const data = {
        purpose_phrase: form.purpose_phrase.trim(),
        arabic_keyword: form.arabic_keyword.trim(),
        malayalam_meaning: form.malayalam_meaning.trim(),
        english_meaning: form.english_meaning.trim(),
        action: form.action,
        normalized_purpose_key: form.normalized_purpose_key,
        language: form.language,
        aliases: form.aliases.split("\n").map(a => a.trim()).filter(Boolean),
        source: form.source.trim(),
        is_active: form.is_active,
        notes: form.notes.trim(),
      };

      if (isEdit) {
        await base44.entities.PurposeDictionary.update(entry.id, data);
      } else {
        await base44.entities.PurposeDictionary.create(data);
      }
      onSave();
    } catch (err) {
      setError("Failed to save: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

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
        className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: "linear-gradient(145deg, rgba(8,16,38,0.99) 0%, rgba(4,10,24,0.99) 100%)",
          border: `1px solid ${G.borderHi}`,
          boxShadow: "0 8px 48px rgba(0,0,0,0.70), inset 0 1px 0 rgba(212,175,55,0.10)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sticky top-0 z-10" style={{
          borderBottom: `1px solid ${G.border}`,
          background: "rgba(8,16,38,0.98)",
          backdropFilter: "blur(12px)",
        }}>
          <h3 className="font-inter text-sm font-bold" style={{ color: G.text }}>
            {isEdit ? "Edit Entry" : "Add New Entry"}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.50)" }} />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Duplicate Warning */}
          {hasDuplicates && (
            <div className="rounded-xl p-3 flex items-start gap-2" style={{
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.30)",
            }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#FBBF24" }} />
              <div className="flex-1">
                <p className="font-inter text-xs font-bold mb-1" style={{ color: "#FBBF24" }}>Duplicate Warning</p>
                {duplicates.phraseDups.length > 0 && (
                  <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                    Phrase already exists in {duplicates.phraseDups.length} entry(ies): {duplicates.phraseDups.map(d => `"${d.purpose_phrase}"`).join(", ")}
                  </p>
                )}
                {duplicates.aliasDups.length > 0 && (
                  <p className="font-inter text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                    Alias(es) already exist in: {duplicates.aliasDups.map(d => `"${d.purpose_phrase}"`).join(", ")}
                  </p>
                )}
                <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.40)" }}>
                  You can still save, but consider deactivating the duplicate instead.
                </p>
              </div>
            </div>
          )}

          {/* Arabic Phrase */}
          <FormField label="Arabic Phrase *" required>
            <input
              type="text"
              value={form.purpose_phrase}
              onChange={handleChange("purpose_phrase")}
              dir="rtl"
              className="font-amiri w-full px-3 py-2 rounded-lg text-base"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.20)", color: "#fff", outline: "none" }}
              placeholder="جلب المحبة"
            />
          </FormField>

          {/* Arabic Keyword */}
          <FormField label="Arabic Keyword">
            <input
              type="text"
              value={form.arabic_keyword}
              onChange={handleChange("arabic_keyword")}
              dir="rtl"
              className="font-amiri w-full px-3 py-2 rounded-lg text-base"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.20)", color: "#fff", outline: "none" }}
              placeholder="محبة"
            />
          </FormField>

          {/* Row: Malayalam + English */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Malayalam Meaning">
              <input
                type="text"
                value={form.malayalam_meaning}
                onChange={handleChange("malayalam_meaning")}
                className="font-inter w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.20)", color: "#fff", outline: "none" }}
                placeholder="സ്നേഹം"
              />
            </FormField>
            <FormField label="English Meaning">
              <input
                type="text"
                value={form.english_meaning}
                onChange={handleChange("english_meaning")}
                className="font-inter w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.20)", color: "#fff", outline: "none" }}
                placeholder="Love"
              />
            </FormField>
          </div>

          {/* Row: Category + Key + Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Category (Action)">
              <select value={form.action} onChange={handleChange("action")}
                className="font-inter w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.20)", color: "#fff", outline: "none" }}>
                {ACTIONS.map(a => <option key={a.value} value={a.value} style={{ background: "#0a1020" }}>{a.label}</option>)}
              </select>
            </FormField>
            <FormField label="Normalized Purpose Key *">
              <select value={form.normalized_purpose_key} onChange={handleChange("normalized_purpose_key")}
                className="font-inter w-full px-3 py-2 rounded-lg text-sm font-mono"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.20)", color: "#fff", outline: "none" }}>
                {PURPOSE_KEYS.map(k => <option key={k} value={k} style={{ background: "#0a1020" }}>{k}</option>)}
              </select>
            </FormField>
            <FormField label="Language">
              <select value={form.language} onChange={handleChange("language")}
                className="font-inter w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.20)", color: "#fff", outline: "none" }}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value} style={{ background: "#0a1020" }}>{l.label}</option>)}
              </select>
            </FormField>
          </div>

          {/* Aliases */}
          <FormField label="Aliases (one per line)">
            <textarea
              value={form.aliases}
              onChange={handleChange("aliases")}
              rows={4}
              className="font-inter w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.20)", color: "#fff", outline: "none", resize: "vertical" }}
              placeholder="محبة&#10;حب&#10;love&#10;സ്നേഹം"
            />
          </FormField>

          {/* Source */}
          <FormField label="Source (Manuscript reference)">
            <input
              type="text"
              value={form.source}
              onChange={handleChange("source")}
              className="font-inter w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.20)", color: "#fff", outline: "none" }}
              placeholder="Manuscript name, page"
            />
          </FormField>

          {/* Notes */}
          <FormField label="Notes">
            <textarea
              value={form.notes}
              onChange={handleChange("notes")}
              rows={2}
              className="font-inter w-full px-3 py-2 rounded-lg text-sm"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.20)", color: "#fff", outline: "none", resize: "vertical" }}
              placeholder="Optional admin notes"
            />
          </FormField>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <label className="font-inter text-xs font-bold" style={{ color: "rgba(255,255,255,0.70)" }}>Active</label>
            <button
              onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
              className="px-3 py-1.5 rounded-lg font-inter text-xs font-bold"
              style={{
                background: form.is_active ? "rgba(74,222,128,0.14)" : "rgba(248,113,113,0.14)",
                border: `1px solid ${form.is_active ? "rgba(74,222,128,0.40)" : "rgba(248,113,113,0.40)"}`,
                color: form.is_active ? "#4ADE80" : "#F87171",
              }}
            >
              {form.is_active ? "Active" : "Inactive"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg p-2.5" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.30)" }}>
              <p className="font-inter text-xs" style={{ color: "#F87171" }}>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 sticky bottom-0" style={{
          borderTop: `1px solid ${G.border}`,
          background: "rgba(8,16,38,0.98)",
        }}>
          <button onClick={onClose} className="font-inter text-sm px-4 py-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.60)" }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gold px-5 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Update Entry" : "Create Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="font-inter text-[10px] uppercase tracking-wider font-bold block mb-1.5" style={{ color: "rgba(212,175,55,0.50)" }}>
        {label}
        {required && <span style={{ color: "#F87171" }}> </span>}
      </label>
      {children}
    </div>
  );
}
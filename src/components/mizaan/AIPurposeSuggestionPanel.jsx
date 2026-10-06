// ═══════════════════════════════════════════════════════════════
// AI PURPOSE SUGGESTION PANEL — admin/owner only
// ═══════════════════════════════════════════════════════════════
// Shown inside ConfigurationAdvisor ONLY when:
//   - user is admin/owner
//   - the Purpose Dictionary returned NO match for the typed purpose
// Calls the read-only AI fallback, shows the suggestion as
// "AI Suggested Meaning", and lets the Owner/Admin:
//   - Approve & Save  → creates a PurposeDictionary record
//   - Edit            → adjust fields before saving
//   - Reject          → dismiss
// AI output is NEVER stored automatically. Once approved + saved,
// future lookups use the dictionary entry (AI is bypassed).
// Does NOT touch Mizan, Bast, Ebced, engine, timing, or workflow.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import {
  Sparkles, Save, Edit3, X, Loader2, BadgeCheck, AlertCircle, RotateCcw,
} from "lucide-react";
import { usePageState } from "../../context/PageStateContext";
import {
  extractMiddleWord, detectAction, CARD_TO_ACTION, buildPhraseFromAIMeaning,
} from "../../lib/ritualSemanticPhrase";
import { getAIPurposeSuggestion, savePurposeDictionaryEntry } from "../../lib/aiPurposeSuggestion";
import { useToast } from "@/components/ui/use-toast";

const MIZAAN_PAGE_KEY = "mizaan9";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
};

const ACTION_TO_ENUM = {
  "جلب": "jalb", "طرد": "tard", "الصحة": "sihhat", "السقم": "sekam",
};

const PURPOSE_KEYS = [
  { key: "celb", label: "Attraction (جلب)" },
  { key: "tard", label: "Banishment (طرد)" },
  { key: "sihhat", label: "Health (صحة)" },
  { key: "sekam", label: "Sickness (سقم)" },
  { key: "tarfet", label: "Instant (طرفة)" },
  { key: "rizq", label: "Provision (رزق)" },
  { key: "knowledge", label: "Knowledge (علم)" },
  { key: "travel", label: "Travel (سفر)" },
  { key: "sultan", label: "Authority (سلطان)" },
  { key: "haybah", label: "Awe (هيبة)" },
];

const ACTION_ENUMS = [
  { val: "jalb", label: "Jalb (جلب)" },
  { val: "tard", label: "Tard (طرد)" },
  { val: "sihhat", label: "Sihhat (صحة)" },
  { val: "sekam", label: "Sekam (سقم)" },
  { val: "tarfet", label: "Tarfet (طرفة)" },
  { val: "other", label: "Other" },
];

const CONF_COLOR = { High: "#4ADE80", Medium: "#FBBF24", Low: "#F87171" };

export default function AIPurposeSuggestionPanel({ lang = "ml", onSuggestion, onSaved }) {
  const { getPageState } = usePageState();
  const { toast } = useToast();
  const state = getPageState(MIZAAN_PAGE_KEY, { selections: {}, customPurpose: "" });
  const selections = state.selections || {};
  const customPurpose = state.customPurpose || "";

  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedEntry, setSavedEntry] = useState(false);
  const [rejected, setRejected] = useState(false);

  const onSuggestionRef = useRef(onSuggestion);
  onSuggestionRef.current = onSuggestion;

  // Derive purpose portion + action (same logic as the phrase builder)
  const cardKey = Array.isArray(selections?.purposes) && selections.purposes.length > 0
    ? selections.purposes[0] : null;
  let actionArabic = null;
  if (cardKey && CARD_TO_ACTION[cardKey]) actionArabic = CARD_TO_ACTION[cardKey];
  if (!actionArabic) actionArabic = detectAction(customPurpose);
  const middleWord = extractMiddleWord(customPurpose, actionArabic);

  // Fetch AI suggestion when the purpose portion changes
  useEffect(() => {
    setSuggestion(null);
    setError("");
    setEditMode(false);
    setSavedEntry(false);
    setRejected(false);
    if (!middleWord) {
      onSuggestionRef.current?.(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getAIPurposeSuggestion({ middleWord, fullText: customPurpose, actionArabic, cardKey, lang })
      .then((res) => {
        if (cancelled) return;
        setLoading(false);
        if (res?.success) {
          setSuggestion(res);
          setEdit({
            purpose_phrase: middleWord,
            arabic_keyword: res.arabic_purpose || middleWord,
            malayalam_meaning: res.malayalam_meaning || "",
            english_meaning: res.english_meaning || "",
            action: actionArabic ? (ACTION_TO_ENUM[actionArabic] || "other") : "other",
            normalized_purpose_key: cardKey || res.suggested_normalized_key || "celb",
            aliasesText: [middleWord, res.arabic_purpose].filter(Boolean).join(", "),
            notes: "",
          });
        } else {
          setError(res?.error || "AI suggestion unavailable");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setError("AI suggestion failed");
        }
      });
    return () => { cancelled = true; };
  }, [middleWord, customPurpose, lang, cardKey, actionArabic]);

  // Lift the built phrase + suggestion to the parent (for the Ritual Purpose row)
  useEffect(() => {
    if (suggestion) {
      const phrase = buildPhraseFromAIMeaning({
        actionArabic,
        englishMeaning: suggestion.english_meaning,
        malayalamMeaning: suggestion.malayalam_meaning,
        lang,
      });
      onSuggestionRef.current?.({ phrase, suggestion });
    } else {
      onSuggestionRef.current?.(null);
    }
  }, [suggestion, actionArabic, lang]);

  const handleSave = async () => {
    if (!edit) return;
    setSaving(true);
    const aliases = String(edit.aliasesText || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await savePurposeDictionaryEntry({
      purpose_phrase: edit.purpose_phrase,
      arabic_keyword: edit.arabic_keyword,
      malayalam_meaning: edit.malayalam_meaning,
      english_meaning: edit.english_meaning,
      action: edit.action,
      normalized_purpose_key: edit.normalized_purpose_key,
      aliases,
      language: "ar",
      notes: edit.notes,
    });
    setSaving(false);
    if (res?.success) {
      setSavedEntry(true);
      toast({
        title: "Saved to Purpose Dictionary",
        description: "Future lookups will use this entry instead of AI.",
      });
      onSuggestionRef.current?.(null);
      if (onSaved) onSaved();
    } else {
      toast({
        title: "Save failed",
        description: res?.error || "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (rejected) {
    return (
      <div className="rounded-xl p-3 flex items-center gap-2"
        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}` }}>
        <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.40)" }} />
        <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
          AI suggestion rejected
        </span>
      </div>
    );
  }

  if (savedEntry) {
    return (
      <div className="rounded-xl p-3 flex items-center gap-2"
        style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.30)" }}>
        <BadgeCheck className="w-4 h-4" style={{ color: "#4ADE80" }} />
        <span className="font-inter text-xs font-bold" style={{ color: "#4ADE80" }}>
          Saved to Purpose Dictionary — future lookups will use this entry.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,48,0.98), rgba(6,14,32,0.99))",
        border: `1px solid ${G.borderHi}`,
        boxShadow: "0 0 24px rgba(212,175,55,0.10)",
      }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: G.text }} />
          <span className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: G.text }}>
            AI Suggested Meaning
          </span>
        </div>
        {suggestion && (
          <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded"
            style={{
              background: `${CONF_COLOR[suggestion.confidence]}15`,
              color: CONF_COLOR[suggestion.confidence],
              border: `1px solid ${CONF_COLOR[suggestion.confidence]}40`,
            }}>
            {suggestion.confidence}
          </span>
        )}
      </div>

      <div className="p-3 space-y-3">
        {loading && (
          <div className="flex items-center gap-2 py-3">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: G.dim }} />
            <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>
              Inferring meaning…
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 py-2">
            <AlertCircle className="w-4 h-4" style={{ color: "#F87171" }} />
            <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>{error}</span>
          </div>
        )}

        {suggestion && !loading && !editMode && (
          <>
            {/* Composed phrase */}
            <div className="rounded-lg p-2.5" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <p className="font-inter text-[9px] uppercase tracking-wider mb-1" style={{ color: G.dim }}>
                {lang === "ml" ? "ആചാര ലക്ഷ്യം" : "Ritual Phrase"}
              </p>
              <p className="font-inter text-sm font-bold" style={{ color: "#fff" }}>
                {buildPhraseFromAIMeaning({
                  actionArabic,
                  englishMeaning: suggestion.english_meaning,
                  malayalamMeaning: suggestion.malayalam_meaning,
                  lang,
                })}
              </p>
            </div>

            {/* Meaning breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <MeaningCell label="Arabic" value={suggestion.arabic_purpose} rtl />
              <MeaningCell label="English" value={suggestion.english_meaning} />
              <MeaningCell label="Malayalam" value={suggestion.malayalam_meaning} />
            </div>

            {/* Admin actions */}
            <div className="flex items-center gap-2 pt-1">
              <ActionButton onClick={handleSave} disabled={saving}
                icon={<Save className="w-3.5 h-3.5" />}
                label={saving ? "Saving…" : "Approve & Save"} color="#4ADE80" />
              <ActionButton onClick={() => setEditMode(true)} disabled={saving}
                icon={<Edit3 className="w-3.5 h-3.5" />} label="Edit" color={G.text} />
              <ActionButton onClick={() => setRejected(true)} disabled={saving}
                icon={<X className="w-3.5 h-3.5" />} label="Reject" color="#F87171" />
            </div>
          </>
        )}

        {suggestion && editMode && !loading && (
          <div className="space-y-2.5">
            <FieldLabel label="Purpose phrase (Arabic)">
              <input value={edit.purpose_phrase} dir="rtl"
                onChange={(e) => setEdit({ ...edit, purpose_phrase: e.target.value })}
                className="w-full font-amiri text-sm rounded-lg px-2.5 py-2"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, color: "#fff" }} />
            </FieldLabel>
            <FieldLabel label="Arabic keyword">
              <input value={edit.arabic_keyword} dir="rtl"
                onChange={(e) => setEdit({ ...edit, arabic_keyword: e.target.value })}
                className="w-full font-amiri text-sm rounded-lg px-2.5 py-2"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, color: "#fff" }} />
            </FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              <FieldLabel label="English meaning">
                <input value={edit.english_meaning}
                  onChange={(e) => setEdit({ ...edit, english_meaning: e.target.value })}
                  className="w-full font-inter text-sm rounded-lg px-2.5 py-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, color: "#fff" }} />
              </FieldLabel>
              <FieldLabel label="Malayalam meaning">
                <input value={edit.malayalam_meaning}
                  onChange={(e) => setEdit({ ...edit, malayalam_meaning: e.target.value })}
                  className="w-full font-inter text-sm rounded-lg px-2.5 py-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, color: "#fff" }} />
              </FieldLabel>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldLabel label="Action">
                <select value={edit.action}
                  onChange={(e) => setEdit({ ...edit, action: e.target.value })}
                  className="w-full font-inter text-xs rounded-lg px-2 py-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, color: "#fff" }}>
                  {ACTION_ENUMS.map((a) => <option key={a.val} value={a.val}>{a.label}</option>)}
                </select>
              </FieldLabel>
              <FieldLabel label="Purpose key">
                <select value={edit.normalized_purpose_key}
                  onChange={(e) => setEdit({ ...edit, normalized_purpose_key: e.target.value })}
                  className="w-full font-inter text-xs rounded-lg px-2 py-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, color: "#fff" }}>
                  {PURPOSE_KEYS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </FieldLabel>
            </div>
            <FieldLabel label="Aliases (comma-separated)">
              <input value={edit.aliasesText}
                onChange={(e) => setEdit({ ...edit, aliasesText: e.target.value })}
                className="w-full font-inter text-xs rounded-lg px-2.5 py-2"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, color: "#fff" }} />
            </FieldLabel>

            <div className="flex items-center gap-2 pt-1">
              <ActionButton onClick={handleSave} disabled={saving}
                icon={<Save className="w-3.5 h-3.5" />}
                label={saving ? "Saving…" : "Save to Dictionary"} color="#4ADE80" />
              <ActionButton onClick={() => setEditMode(false)} disabled={saving}
                icon={<RotateCcw className="w-3.5 h-3.5" />} label="Cancel" color={G.dim} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MeaningCell({ label, value, rtl }) {
  return (
    <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}` }}>
      <p className="font-inter text-[8px] uppercase tracking-wider mb-1" style={{ color: G.dim }}>{label}</p>
      <p className="font-amiri text-sm" dir={rtl ? "rtl" : "ltr"} style={{ color: "#fff" }}>{value || "—"}</p>
    </div>
  );
}

function FieldLabel({ label, children }) {
  return (
    <div>
      <p className="font-inter text-[9px] uppercase tracking-wider mb-1" style={{ color: G.dim }}>{label}</p>
      {children}
    </div>
  );
}

function ActionButton({ onClick, disabled, icon, label, color }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-xs font-bold transition"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}40`,
        color,
        opacity: disabled ? 0.5 : 1,
      }}>
      {icon}{label}
    </button>
  );
}
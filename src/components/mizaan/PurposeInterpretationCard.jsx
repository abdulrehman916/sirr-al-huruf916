// ═══════════════════════════════════════════════════════════════
// PURPOSE INTERPRETATION CARD — Master purpose resolver
// ═══════════════════════════════════════════════════════════════
// Sits directly below the Custom Purpose textbox (Mizaan 7).
// Resolves the Arabic purpose phrase using ONLY:
//   1. Purpose Dictionary (lookupPurposeIntent)
//   2. Selected Purpose Card (action detection)
//   3. Manuscript knowledge (via dictionary source)
//
// Displays: Original Arabic → Detected Action → Main Purpose →
// Modifier → Final Meaning (selected language).
//
// This Final Meaning is the MASTER PURPOSE — the Ritual Timing
// engine reads the same dictionary result (not the raw Arabic).
//
// Read-only. Never modifies any Mizan, calculation, or engine.
// Full language parity: Malayalam or English, never mixed.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo, memo, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowDown, Loader2, Bug, ChevronDown, AlertTriangle, Check } from "lucide-react";
import { lookupPurposeIntent, confirmPurposeMeaning, clearLookupCache } from "../../lib/purposeDictionaryLookup";
import {
  detectAction, parsePurposeStructure, ACTION_MEANINGS, ENDING_MEANING,
  CARD_TO_ACTION, CARD_TO_MODIFIER, buildRitualSemanticPhrase, buildCanonicalArabicPhrase,
} from "../../lib/ritualSemanticPhrase";
import { useRitualLang, RITUAL_LANGS } from "../../lib/ritualTimingI18n";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
};

// Normalize Arabic (strip harakat + tatweel) — mirrors ritualSemanticPhrase
function normalizeArabic(text) {
  return String(text || "")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, "")
    .replace(/\u0640/g, "")
    .trim();
}

// Detect modifier (طرفة العين) from normalized text
function detectModifier(text) {
  const norm = normalizeArabic(text);
  if (norm.includes("طرفة") || norm.includes("طرفه")) return "طرفة العين";
  return null;
}

const PurposeInterpretationCard = memo(function PurposeInterpretationCard({ customPurpose, selections, onPurposeResolved }) {
  const [lang, setLang] = useRitualLang();
  const [purposeLookup, setPurposeLookup] = useState({ matched: false });
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  // Track last resolved result to skip redundant onPurposeResolved calls
  const lastResolvedRef = useRef(null);

  // ── Detect action, middle word, modifier (synchronous, from text) ──
  const detected = useMemo(() => {
    const custom = (customPurpose || "").trim();
    if (!custom) return null;

    // Action — from any selected action card, else detect from text
    let actionArabic = null;
    const purposes = Array.isArray(selections?.purposes) ? selections.purposes : [];
    const actionCard = purposes.find((k) => CARD_TO_ACTION[k]);
    if (actionCard) actionArabic = CARD_TO_ACTION[actionCard];
    if (!actionArabic) actionArabic = detectAction(custom);

    const parsed = parsePurposeStructure(custom);
    const middleWord = parsed.mainPurpose;
    const rawMiddle = parsed.rawMiddle;
    // Modifier — from any selected modifier card, else detect from text
    let modifierArabic = detectModifier(custom);
    if (!modifierArabic) {
      const modCard = purposes.find((k) => CARD_TO_MODIFIER[k]);
      if (modCard) modifierArabic = CARD_TO_MODIFIER[modCard];
    }

    return { actionArabic, middleWord, rawMiddle, modifierArabic, cardKey: actionCard || null };
  }, [customPurpose, selections]);

  // ── Purpose Dictionary lookup (async) ──
  useEffect(() => {
    if (!detected) {
      setPurposeLookup({ matched: false });
      lastResolvedRef.current = null;
      if (onPurposeResolved) onPurposeResolved({ matched: false });
      return;
    }
    setLoading(true);
    let cancelled = false;
    // Debounce 500ms — wait until the user stops typing before firing the lookup.
    // Prevents one network request per keystroke and keeps typing/scrolling smooth.
    const debounceTimer = setTimeout(() => {
      if (cancelled) return;
      // Pass ONLY the extracted Main Purpose (middle segment) to the lookup —
      // NEVER the full phrase. The Action Card and Modifier must not be searched.
      lookupPurposeIntent(detected.middleWord || "", detected.cardKey).then((res) => {
        if (cancelled) return;
        setPurposeLookup(res);
        setLoading(false);
        if (onPurposeResolved) {
          const canonicalArabic = buildCanonicalArabicPhrase({ selections, customPurpose });
          const newResolved = {
            ...res,
            canonical_arabic: canonicalArabic,
            interpretation_en: buildRitualSemanticPhrase({ selections, customPurpose, purposeLookup: res, lang: "en" }),
            interpretation_ml: buildRitualSemanticPhrase({ selections, customPurpose, purposeLookup: res, lang: "ml" }),
          };
          // Skip state update if nothing meaningfully changed — prevents
          // unnecessary re-renders of downstream recommendation components.
          const last = lastResolvedRef.current;
          const changed = !last ||
            last.matched !== newResolved.matched ||
            last.english_meaning !== newResolved.english_meaning ||
            last.malayalam_meaning !== newResolved.malayalam_meaning ||
            last.interpretation_en !== newResolved.interpretation_en ||
            last.interpretation_ml !== newResolved.interpretation_ml ||
            last.canonical_arabic !== newResolved.canonical_arabic;
          if (changed) {
            lastResolvedRef.current = newResolved;
            onPurposeResolved(newResolved);
          }
        }
      });
    }, 500);
    return () => { cancelled = true; clearTimeout(debounceTimer); };
  }, [detected, customPurpose, onPurposeResolved]);

  // ── Build interpretation for display (both languages) ──
  const interp = useMemo(() => {
    if (!detected || !(customPurpose || "").trim()) return null;

    const mainPurposeArabic = detected.middleWord || (purposeLookup?.matchedPhrase || "");
    const mainPurposeMatched = purposeLookup?.matched || false;
    const mainPurposeSource = purposeLookup?.source || null;

    // Dictionary meanings — both languages, shown simultaneously
    const purposeMeaningML = mainPurposeMatched ? (purposeLookup.malayalam_meaning || "") : "";
    const purposeMeaningEN = mainPurposeMatched ? (purposeLookup.english_meaning || "") : "";

    // Combined final meaning — both languages
    const finalMeaningML = buildRitualSemanticPhrase({
      selections, customPurpose, purposeLookup, lang: "ml",
    });
    const finalMeaningEN = buildRitualSemanticPhrase({
      selections, customPurpose, purposeLookup, lang: "en",
    });

    return {
      originalArabic: (customPurpose || "").trim(),
      canonicalArabic: buildCanonicalArabicPhrase({ selections, customPurpose }),
      actionArabic: detected.actionArabic,
      actionMeaningML: detected.actionArabic ? (ACTION_MEANINGS[detected.actionArabic]?.ml || "") : "",
      actionMeaningEN: detected.actionArabic ? (ACTION_MEANINGS[detected.actionArabic]?.en || "") : "",
      mainPurposeArabic,
      purposeMeaningML,
      purposeMeaningEN,
      mainPurposeMatched,
      mainPurposeSource,
      modifierArabic: detected.modifierArabic,
      modifierMeaningML: detected.modifierArabic ? ENDING_MEANING.ml : "",
      modifierMeaningEN: detected.modifierArabic ? ENDING_MEANING.en : "",
      finalMeaningML,
      finalMeaningEN,
      autoLearned: purposeLookup?.auto_learned || false,
    };
  }, [detected, purposeLookup, customPurpose]);

  // ── Labels (bilingual — both shown simultaneously) ──
  const L = {
    title: lang === "ml" ? "ലക്ഷ്യ വ്യാഖ്യാനം" : "Purpose Interpretation",
    original: lang === "ml" ? "യഥാർത്ഥ അറബിക് വാചകം" : "Original Arabic Text",
    canonical: lang === "ml" ? "സമ്പൂർണ്ണ ലക്ഷ്യം" : "Canonical Purpose",
    action: lang === "ml" ? "കർമ്മം (Action Card)" : "Action Card",
    mainPurpose: lang === "ml" ? "പ്രധാന ലക്ഷ്യം" : "Main Purpose",
    modifier: lang === "ml" ? "പരിഷ്കർത്തകൻ" : "Modifier",
    purposeMeaning: lang === "ml" ? "ലക്ഷ്യ അർത്ഥം" : "Purpose Meaning",
    notDetected: lang === "ml" ? "കണ്ടെത്തിയില്ല" : "Not detected",
    noMatch: lang === "ml" ? "നിഘണ്ടുവിൽ ഇല്ല" : "Not in dictionary",
    dictSource: lang === "ml" ? "ഉറവിടം" : "Source",
    notAvailable: lang === "ml" ? "പ്രോജക്റ്റ് പർപ്പസ് ഡിക്ഷനറിയിൽ ഈ ലക്ഷ്യം കണ്ടെത്തിയില്ല." : "Purpose not found in the Project Purpose Dictionary.",
    loading: lang === "ml" ? "വ്യാഖ്യാനിക്കുന്നു..." : "Interpreting...",
    autoLearned: lang === "ml" ? "സ്വയം പഠിച്ചു — പരിശോധന ആവശ്യം" : "AI Generated — Needs Review",
  };

  // ── Handle user confirming a candidate meaning ──
  const handleConfirmMeaning = async (candidate) => {
    setConfirming(true);
    try {
      const result = await confirmPurposeMeaning({
        mainPurpose: purposeLookup.mainPurpose,
        english_meaning: candidate.english_meaning,
        malayalam_meaning: candidate.malayalam_meaning,
        normalized_purpose_key: candidate.normalized_purpose_key,
        synonyms: candidate.synonyms,
        ai_confidence: candidate.confidence,
      });
      if (result.matched) {
        // Clear cache so future lookups find the new dictionary entry
        clearLookupCache(detected?.middleWord, detected?.cardKey);
        setPurposeLookup(result);
        if (onPurposeResolved) {
          const canonicalArabic = buildCanonicalArabicPhrase({ selections, customPurpose });
          const newResolved = {
            ...result,
            canonical_arabic: canonicalArabic,
            interpretation_en: buildRitualSemanticPhrase({ selections, customPurpose, purposeLookup: result, lang: "en" }),
            interpretation_ml: buildRitualSemanticPhrase({ selections, customPurpose, purposeLookup: result, lang: "ml" }),
          };
          lastResolvedRef.current = newResolved;
          onPurposeResolved(newResolved);
        }
      }
    } catch (_err) {
      // Error already handled by confirmPurposeMeaning returning { matched: false }
    } finally {
      setConfirming(false);
    }
  };

  if (!interp) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: "0 0 24px rgba(212,175,55,0.12)",
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-3" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" style={{ color: G.text }} />
          <span className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
            {L.title}
          </span>
          {interp.autoLearned && (
            <span className="font-inter text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-full ml-2"
              style={{ color: "#FBBF24", border: "1px solid rgba(251,191,36,0.50)", background: "rgba(251,191,36,0.10)" }}>
              {L.autoLearned}
            </span>
          )}
        </div>
        {/* Language toggle */}
        <div className="flex items-center gap-1">
          {RITUAL_LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className="px-2 py-0.5 rounded-md font-inter text-[10px] font-bold transition"
              style={{
                background: lang === l.code ? "rgba(212,175,55,0.18)" : "transparent",
                border: `1px solid ${lang === l.code ? G.borderHi : G.border}`,
                color: lang === l.code ? G.text : "rgba(255,255,255,0.45)",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-3 space-y-2.5">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-1">
            <Loader2 className="w-3 h-3 animate-spin" style={{ color: G.dim }} />
            <span className="font-inter text-[10px]" style={{ color: G.dim }}>{L.loading}</span>
          </div>
        )}

        {/* Canonical Purpose — Action + Purpose + Modifier (built from both modes) */}
        <Row label={L.canonical}>
          <p className="font-amiri text-base text-right leading-relaxed" style={{ color: G.text }} dir="rtl">
            {interp.canonicalArabic || interp.originalArabic}
          </p>
        </Row>

        {/* Action Card */}
        <Row label={L.action}>
          {interp.actionArabic ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-amiri text-base" style={{ color: G.text }} dir="rtl">
                {interp.actionArabic}
              </span>
              <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                {lang === "ml"
                  ? (interp.actionMeaningML && `(${interp.actionMeaningML})`)
                  : (interp.actionMeaningEN && `(${interp.actionMeaningEN})`)}
              </span>
            </div>
          ) : (
            <span className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.35)" }}>
              {L.notDetected}
            </span>
          )}
        </Row>

        {/* Main Purpose */}
        <Row label={L.mainPurpose}>
          {interp.mainPurposeArabic ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-amiri text-base" style={{ color: G.text }} dir="rtl">
                {interp.mainPurposeArabic}
              </span>
              <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                {lang === "ml"
                  ? (interp.purposeMeaningML && `(${interp.purposeMeaningML})`)
                  : (interp.purposeMeaningEN && `(${interp.purposeMeaningEN})`)}
              </span>
              {interp.mainPurposeMatched && interp.mainPurposeSource && (
                <span className="font-inter text-[9px] italic" style={{ color: "rgba(212,175,55,0.45)" }}>
                  ({L.dictSource}: {interp.mainPurposeSource})
                </span>
              )}
              {!interp.mainPurposeMatched && (
                <span className="font-inter text-[9px] italic" style={{ color: "rgba(248,113,113,0.60)" }}>
                  ({L.noMatch})
                </span>
              )}
            </div>
          ) : (
            <span className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.35)" }}>
              {L.notDetected}
            </span>
          )}
        </Row>

        {/* Modifier */}
        <Row label={L.modifier}>
          {interp.modifierArabic ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-amiri text-base" style={{ color: G.text }} dir="rtl">
                {interp.modifierArabic}
              </span>
              <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                {lang === "ml"
                  ? (interp.modifierMeaningML && `(${interp.modifierMeaningML})`)
                  : (interp.modifierMeaningEN && `(${interp.modifierMeaningEN})`)}
              </span>
            </div>
          ) : (
            <span className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.35)" }}>
              {L.notDetected}
            </span>
          )}
        </Row>

        {/* Divider */}
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${G.border})` }} />
          <ArrowDown className="w-3 h-3" style={{ color: G.dim }} />
          <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${G.border})` }} />
        </div>

        {/* Candidate Selection — when dictionary miss, AI generated candidates */}
        {purposeLookup.needsConfirmation && purposeLookup.candidates?.length > 0 && (
          <div className="rounded-lg p-3" style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.40)",
          }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#FBBF24" }} />
              <span className="font-inter text-[10px] font-bold uppercase tracking-widest" style={{ color: "#FBBF24" }}>
                {lang === "ml" ? "ലക്ഷ്യം സ്ഥിരീകരിക്കേണ്ടതുണ്ട്" : "Purpose requires confirmation"}
              </span>
            </div>
            <p className="font-inter text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.60)" }}>
              {lang === "ml" ? "ശരിയായ അർത്ഥം തിരഞ്ഞെടുക്കുക:" : "Select the intended meaning:"}
            </p>
            <div className="space-y-1.5">
              {purposeLookup.candidates.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleConfirmMeaning(c)}
                  disabled={confirming}
                  className="w-full rounded-lg p-2.5 text-left transition hover:bg-opacity-20 disabled:opacity-50"
                  style={{
                    background: "rgba(212,175,55,0.06)",
                    border: "1px solid rgba(212,175,55,0.25)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-inter text-sm font-bold" style={{ color: G.text }}>{c.english_meaning}</p>
                      <p className="font-malayalam text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{c.malayalam_meaning}</p>
                    </div>
                    {confirming ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: G.dim }} />
                    ) : (
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.dim }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Canonical Purpose + Resolved Meaning — Action + Purpose + Modifier */}
        <div className="rounded-lg p-3" style={{
          background: "rgba(212,175,55,0.10)",
          border: `1px solid ${G.borderHi}`,
        }}>
          <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
            {L.purposeMeaning}
          </p>
          {interp.canonicalArabic && (
            <p className="font-amiri text-base text-right leading-relaxed mb-2" style={{ color: "#fff" }} dir="rtl">
              {interp.canonicalArabic}
            </p>
          )}
          {(() => {
            const phrase = lang === "ml" ? interp.finalMeaningML : interp.finalMeaningEN;
            if (phrase) {
              return lang === "ml"
                ? <p className="font-malayalam text-sm font-bold leading-relaxed" style={{ color: G.text }}>{phrase}</p>
                : <p className="font-inter text-sm font-bold" style={{ color: G.text }}>{phrase}</p>;
            }
            if (loading) {
              return <p className="font-inter text-xs italic" style={{ color: G.dim }}>{L.loading}</p>;
            }
            return <p className="font-inter text-xs italic" style={{ color: "rgba(248,113,113,0.55)" }}>{L.notAvailable}</p>;
          })()}
        </div>

        {/* ── DEBUG PANEL (temporary — lookup pipeline verification) ── */}
        <DebugPanel
          originalInput={interp.originalArabic}
          action={interp.actionArabic}
          rawMiddle={detected?.rawMiddle || ""}
          normalizedPurpose={detected?.middleWord || ""}
          purposeLookup={purposeLookup}
        />
      </div>
    </motion.div>
  );
});

export default PurposeInterpretationCard;

// ── Single interpretation row ──
function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
        {label}
      </p>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEBUG PANEL — Lookup pipeline verification (temporary, dev-only)
// ═══════════════════════════════════════════════════════════════
function DebugPanel({ originalInput, action, rawMiddle, normalizedPurpose, purposeLookup }) {
  const [open, setOpen] = useState(false);
  const dbg = purposeLookup?._debug || {};
  const matched = purposeLookup?.matched || false;
  const source = dbg.source || purposeLookup?.source || (purposeLookup?.auto_learned ? "Auto-Learned" : "—");
  const entryId = dbg.entryId || "—";
  const lookupPath = dbg.lookupPath || "—";
  const probesUsed = Array.isArray(dbg.probesUsed) ? dbg.probesUsed : [];

  const D = {
    title: "DICTIONARY LOOKUP DEBUG",
    original: "1. Original Arabic Input",
    action: "2. Detected Action",
    rawMiddle: "3. Main Purpose (before normalization)",
    normalized: "4. Normalized Main Purpose",
    dictKey: "5. Dictionary Key Searched",
    deepKey: "5b. Deep-Normalized Key (Alif/Hamza/NFC)",
    match: "6. Dictionary Match",
    entryId: "7. Entry ID",
    source: "8. Lookup Source",
    path: "Lookup Path",
    probes: "Probe Variants Used",
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: "rgba(99,102,241,0.05)",
      border: "1px solid rgba(99,102,241,0.30)",
    }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-2.5">
        <div className="flex items-center gap-2">
          <Bug className="w-3.5 h-3.5" style={{ color: "rgba(129,140,248,0.80)" }} />
          <span className="font-inter text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(129,140,248,0.80)" }}>
            {D.title}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ color: "rgba(129,140,248,0.60)", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5">
          <DebugRow label={D.original} value={originalInput} rtl />
          <DebugRow label={D.action} value={action || "—"} rtl />
          <DebugRow label={D.rawMiddle} value={rawMiddle || "—"} rtl />
          <DebugRow label={D.normalized} value={normalizedPurpose || "—"} rtl />
          <DebugRow label={D.dictKey} value={dbg.normalizedKey || normalizedPurpose || "—"} rtl />
          <DebugRow label={D.deepKey} value={dbg.deepNormalizedKey || "—"} rtl />
          <DebugRow label={D.match} value={matched ? "YES ✓" : "NO ✗"} color={matched ? "#4ADE80" : "#F87171"} />
          <DebugRow label={D.entryId} value={entryId} />
          <DebugRow label={D.source} value={source} color={purposeLookup?.auto_learned ? "#FBBF24" : "#4ADE80"} />
          <DebugRow label={D.path} value={lookupPath} />
          {dbg.error && (
            <div className="rounded-lg p-2" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.20)" }}>
              <p className="font-inter text-[10px] font-bold" style={{ color: "rgba(248,113,113,0.80)" }}>
                ERROR: {dbg.error}
              </p>
            </div>
          )}
          {probesUsed.length > 0 && (
            <div className="pt-1">
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: "rgba(129,140,248,0.50)" }}>
                {D.probes} ({probesUsed.length}{dbg.probesCount ? `/${dbg.probesCount}` : ""})
              </p>
              <div className="flex flex-wrap gap-1">
                {probesUsed.map((p, i) => (
                  <span key={i} className="font-amiri text-xs px-1.5 py-0.5 rounded" style={{
                    background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.20)",
                    color: "rgba(255,255,255,0.70)",
                  }} dir="rtl">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DebugRow({ label, value, color, rtl }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="font-inter text-[9px] uppercase tracking-wider flex-shrink-0" style={{ color: "rgba(129,140,248,0.55)" }}>
        {label}
      </span>
      <span className={`text-[11px] font-bold text-right ${rtl ? "font-amiri" : "font-inter"}`} style={{ color: color || "rgba(255,255,255,0.85)" }} dir={rtl ? "rtl" : "ltr"}>
        {value}
      </span>
    </div>
  );
}
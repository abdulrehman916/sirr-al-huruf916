import { useState, useEffect, createContext, useContext } from "react";
import { motion } from "framer-motion";
import {
  Loader2, ShieldCheck, ShieldAlert, BookOpen, Languages, ScrollText, Sparkles,
  Link2, BookMarked, FileText, Quote, Award, AlertTriangle, Clock, Volume2,
  Network, BookCopy, ChevronDown,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import HolyNameProfileLangSelector from "./HolyNameProfileLangSelector";
import { arTitle } from "./holyNameProfileI18n";

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

const STATUS_LABELS = {
  verified: { t: "Verified", ml: "പരിശോധിച്ചു സ്ഥിരീകരിച്ചു", c: "#34d399" },
  needs_review: { t: "Needs Review", ml: "വീണ്ടും പരിശോധന ആവശ്യം", c: "#fbbf24" },
  conflicting_sources: { t: "Conflicting Sources", ml: "ഉറവിടങ്ങൾ തമ്മിൽ ഭിന്നത", c: "#fb923c" },
  not_in_classical_sources: { t: "Not in Classical Sources", ml: "ക്ലാസിക് സ്രോതസ്സുകളിൽ ഇല്ല", c: "#94a3b8" },
  unverified: { t: "Not Verified", ml: "പരിശോധിച്ചിട്ടില്ല", c: "#64748b" },
};
const ORIGIN_LABELS = { hebrew: "Hebrew", syriac: "Syriac", aramaic: "Aramaic", arabic: "Arabic", persian: "Persian", mixed: "Mixed", unknown: "Unknown" };
const ORIGIN_ML = { hebrew: "ഹീബ്രു", syriac: "സിറിയാക്ക്", aramaic: "അറമായിക്ക്", arabic: "അറബിക്", persian: "പേർഷ്യൻ", mixed: "മിശ്രിതം", unknown: "അജ്ഞാതം" };
const REL_LABELS = {
  identical: "Identical to a 99 Name", alternate_reading: "Alternate Reading of a 99 Name",
  same_root: "Same Arabic Root", same_meaning: "Same Meaning", closely_related: "Closely Related",
  synonymous: "Synonymous", scholarly_relation: "Related via Classical Scholarship",
  none: "No Authentic Relationship", foreign_equivalent: "Foreign-Language Equivalent",
  traditional_only: "Traditional/Occult Association Only", unknown: "Relationship Not Determined",
};

const NOT_VERIFIED = "Not Verified";
const NOT_FOUND = "Not found in verified primary sources";
const has = (v) => v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== "");

// Active display language for the research profile (en | ml | ar).
const LangCtx = createContext("en");

// Trilingual field. Order depends on the active language (LangCtx):
//   en  → English, Malayalam, Arabic
//   ml  → Malayalam, English, Arabic
//   ar  → Arabic, Malayalam, English
// arabicFirst = true forces Arabic first (for fields whose primary content is an Arabic proper noun).
function TriField({ label, labelML, arabic, malayalam, english, arabicFirst }) {
  const lang = useContext(LangCtx);
  // STRICT LANGUAGE ISOLATION: render ONLY the selected language's content.
  // For arabicFirst fields the original-language term (Arabic name / source
  // word / root) is always shown — it is primary data, not an explanation.
  const labelAR = arTitle(label);
  const activeLabel = lang === "ml" ? (labelML || label) : lang === "ar" ? (labelAR || label) : label;
  const labelIsAr = lang === "ar" && !!labelAR;
  const selVal = lang === "ml" ? malayalam : lang === "ar" ? arabic : english;
  const hasTerm = arabicFirst && has(arabic);
  const hasSel = has(selVal);
  const parts = [];
  if (hasTerm) parts.push({ val: arabic, cls: "font-amiri text-base leading-loose", dir: "rtl" });
  if (hasSel && !(arabicFirst && lang === "ar")) {
    const cls = lang === "ml" ? "font-malayalam text-sm leading-relaxed" : lang === "ar" ? "font-amiri text-base leading-loose" : "font-inter text-xs leading-relaxed";
    parts.push({ val: selVal, cls, dir: lang === "ar" ? "rtl" : "auto" });
  }
  const empty = parts.length === 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2 flex-wrap">
        {labelIsAr
          ? <span className="font-amiri text-xs font-semibold" style={{ color: P.dim }} dir="rtl">{activeLabel}</span>
          : lang === "ml"
            ? <span className="font-malayalam text-[11px] font-semibold" style={{ color: P.dim }}>{activeLabel}</span>
            : <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: P.dim }}>{activeLabel}</span>}
      </div>
      {empty ? (
        <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.30)" }}>{NOT_VERIFIED}</p>
      ) : (
        <div className="space-y-1">{parts.map((p, i) => <p key={i} className={`${p.cls} selectable`} style={{ color: "rgba(255,255,255,0.88)" }} dir={p.dir}>{p.val}</p>)}</div>
      )}
    </div>
  );
}

function SourceChip({ s }) {
  const title = s?.title || "Untitled source";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border font-inter text-[8px] leading-tight" style={{ background: "rgba(8,16,38,0.6)", borderColor: P.border, color: "rgba(255,255,255,0.72)" }}>
      <BookMarked className="w-2.5 h-2.5 flex-shrink-0" style={{ color: P.dim }} />
      <span className="font-semibold" style={{ color: P.text }}>{title}</span>
      {s.author && <span>· {s.author}</span>}
      {s.page && <span>· p.{s.page}</span>}
      {s.reliability_score ? <span style={{ color: "rgba(212,175,55,0.45)" }}>· {s.reliability_score}%</span> : null}
    </span>
  );
}

function SourcesList({ sources }) {
  const arr = Array.isArray(sources) ? sources : [];
  if (arr.length === 0) return null;
  return <div className="flex flex-wrap gap-1.5">{arr.map((s, i) => <SourceChip key={i} s={s} />)}</div>;
}

function Section({ icon: Icon, title, titleML, children, accent, defaultOpen = true }) {
  const lang = useContext(LangCtx);
  const ar = arTitle(title);
  const primary = lang === "ml" ? (titleML || title) : lang === "ar" ? (ar || title) : title;
  const primaryIsAr = lang === "ar" && !!ar;
  const primaryCls = lang === "ml" ? "font-malayalam text-[11px] font-semibold flex-1" : primaryIsAr ? "font-amiri text-sm flex-1" : "font-inter text-[9px] uppercase tracking-widest font-bold flex-1";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-xl border overflow-hidden" style={{ background: "rgba(8,16,38,0.55)", borderColor: P.border }}>
      <details open={defaultOpen} className="group">
        <summary className="cursor-pointer list-none flex items-center gap-2 px-3 py-2.5 select-none" style={{ borderBottom: defaultOpen ? `1px solid ${P.faint}` : "none" }}>
          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent || P.text }} />
          <span className={primaryCls} style={{ color: accent || P.text }} dir={primaryIsAr ? "rtl" : undefined}>{primary}</span>
          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180 flex-shrink-0" style={{ color: P.dim }} />
        </summary>
        <div className="px-3 py-3 space-y-2.5">{children}</div>
      </details>
    </motion.div>
  );
}

function BenefitList({ items, authenticated }) {
  const lang = useContext(LangCtx);
  const arr = Array.isArray(items) ? items : [];
  if (arr.length === 0) return null;
  return (
    <div className="space-y-2">
      {arr.map((b, i) => (
        <div key={i} className="space-y-1.5 rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.05)", border: `1px solid ${P.faint}` }}>
          {(lang === "ml" ? b.text_ml : b.text) ? <p className={lang === "ml" ? "font-malayalam text-sm leading-relaxed selectable" : "font-inter text-xs leading-relaxed selectable"} style={{ color: "rgba(255,255,255,0.88)" }} dir="auto">{lang === "ml" ? b.text_ml : b.text}</p> : null}
          {authenticated === false && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-inter text-[7px] uppercase tracking-widest font-bold" style={{ color: "#fbbf24", background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.30)" }}>
              <AlertTriangle className="w-2.5 h-2.5" /> Traditional / Historical · Not Authenticated as Islamic Teaching
            </span>
          )}
          {b.authenticated === true && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-inter text-[7px] uppercase tracking-widest font-bold" style={{ color: "#34d399", background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.30)" }}>
              <ShieldCheck className="w-2.5 h-2.5" /> Authentic Islamic Source
            </span>
          )}
          {b.sources && b.sources.length > 0 && <SourcesList sources={b.sources} />}
        </div>
      ))}
    </div>
  );
}

const INVOCATION_CATS = [
  { id: "authentic_islamic_dhikr", label: "Authentic Islamic Dhikr", labelML: "പ്രാമാണിക ഇസ്ലാമിക് ദിക്ർ", auth: true },
  { id: "quranic_supplication", label: "Qur'anic Supplications", labelML: "ഖുർആൻ പ്രാർഥനകൾ", auth: true },
  { id: "hadith_supplication", label: "Hadith Supplications", labelML: "ഹദീസ് പ്രാർഥനകൾ", auth: true },
  { id: "classical_wazifa", label: "Classical Wazifa", labelML: "ക്ലാസിക് വസീഫ", auth: false },
  { id: "traditional_invocation", label: "Traditional Invocation", labelML: "പാരമ്പര്യ പ്രാർഥന", auth: false },
  { id: "vefk_practice", label: "Vefk Practice", labelML: "വെഫ്ക് അഭ്യാസം", auth: false },
  { id: "talismanic_formula", label: "Talismanic Formula", labelML: "തായ്ലിസ്മാൻ ഫോർമുല", auth: false },
  { id: "occult_manuscript_practice", label: "Occult Manuscript Practice", labelML: "ഒക്കൾട്ട് കയ്യെഴുത്തുപ്രതി അഭ്യാസം", auth: false },
  { id: "unknown_origin", label: "Unknown Origin", labelML: "അജ്ഞാത ഉദ്ഭവം", auth: false },
];

function InvocationCard({ inv }) {
  const lang = useContext(LangCtx);
  const auth = inv.authenticated === true || inv.evidence_level === "authenticated";
  return (
    <div className="space-y-2 rounded-lg p-3" style={{ background: auth ? "rgba(52,211,153,0.04)" : "rgba(251,191,36,0.04)", border: `1px solid ${auth ? "rgba(52,211,153,0.25)" : "rgba(251,191,36,0.25)"}` }}>
      {inv.text_ar && <p className="font-amiri text-lg leading-loose selectable whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.92)" }} dir="rtl">{inv.text_ar}</p>}
      {inv.text_harakat && inv.text_harakat !== inv.text_ar && <p className="font-amiri text-base leading-loose selectable" style={{ color: P.text }} dir="rtl">{inv.text_harakat}</p>}
      {lang !== "ar" && inv.transliteration && <p className="font-inter text-xs italic selectable" style={{ color: "rgba(255,255,255,0.70)" }} dir="ltr">{inv.transliteration}</p>}
      {lang === "ml" && inv.translation_ml && <p className="font-malayalam text-sm leading-relaxed selectable" style={{ color: "rgba(255,255,255,0.90)" }} dir="auto">{inv.translation_ml}</p>}
      {lang === "en" && inv.translation_en && <p className="font-inter text-xs selectable" style={{ color: "rgba(255,255,255,0.72)" }} dir="auto">{inv.translation_en}</p>}
      <div className="flex flex-wrap gap-1.5">
        <span className="font-inter text-[7px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded" style={{ color: auth ? "#34d399" : "#fbbf24", background: auth ? "rgba(52,211,153,0.10)" : "rgba(251,191,36,0.10)", border: `1px solid ${auth ? "rgba(52,211,153,0.30)" : "rgba(251,191,36,0.30)"}` }}>
          {auth ? "Authenticated" : "NOT AUTHENTICATED · Traditional Historical Practice Only"}
        </span>
        {inv.evidence_level && <span className="font-inter text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ color: P.dim, background: P.bg, border: `1px solid ${P.faint}` }}>Evidence: {inv.evidence_level}</span>}
      </div>
      {(inv.source_book || inv.author || inv.chapter || inv.page || inv.edition || inv.manuscript_ref || inv.publication) && (
        <div className="space-y-0.5 pt-1 border-t text-[10px] font-inter selectable" style={{ borderColor: "rgba(212,175,55,0.12)", color: "rgba(255,255,255,0.65)" }}>
          {inv.source_book && <div>📚 {inv.source_book}{inv.author ? ` — ${inv.author}` : ""}</div>}
          {(inv.chapter || inv.page || inv.edition) && <div>{[inv.chapter && `Ch. ${inv.chapter}`, inv.page && `p. ${inv.page}`, inv.edition && `Ed. ${inv.edition}`].filter(Boolean).join(" · ")}</div>}
          {inv.manuscript_ref && <div>📜 Manuscript: {inv.manuscript_ref}</div>}
          {inv.publication && <div>🏫 {inv.publication}</div>}
        </div>
      )}
      {lang === "en" && (
        <div className="space-y-1 text-xs font-inter selectable" style={{ color: "rgba(255,255,255,0.80)" }}>
          {inv.purpose && <div><span style={{ color: P.dim }}>Purpose: </span>{inv.purpose}</div>}
          {inv.traditional_usage && <div><span style={{ color: P.dim }}>Traditional usage: </span>{inv.traditional_usage}</div>}
          {inv.historical_usage && <div><span style={{ color: P.dim }}>Historical usage: </span>{inv.historical_usage}</div>}
          {inv.conditions && <div><span style={{ color: P.dim }}>Conditions: </span>{inv.conditions}</div>}
          {inv.repetitions && <div><span style={{ color: P.dim }}>Repetitions: </span>{inv.repetitions}</div>}
          {inv.timing && <div><span style={{ color: P.dim }}>Timing: </span>{inv.timing}</div>}
          {inv.preparation && <div><span style={{ color: P.dim }}>Preparation: </span>{inv.preparation}</div>}
          {inv.warnings && <div><span style={{ color: "#fbbf24" }}>⚠ Warnings: </span><span>{inv.warnings}</span></div>}
          {inv.scholarly_opinions && <div><span style={{ color: P.dim }}>Scholarly opinions: </span>{inv.scholarly_opinions}</div>}
        </div>
      )}
    </div>
  );
}

function RefList({ label, labelML, items }) {
  const arr = Array.isArray(items) ? items : [];
  const lang = useContext(LangCtx);
  const labelAR = arTitle(label);
  const activeLabel = lang === "ml" ? (labelML || label) : lang === "ar" ? (labelAR || label) : label;
  const labelIsAr = lang === "ar" && !!labelAR;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        {labelIsAr
          ? <span className="font-amiri text-xs font-semibold" style={{ color: P.dim }} dir="rtl">{activeLabel}</span>
          : lang === "ml"
            ? <span className="font-malayalam text-[11px] font-semibold" style={{ color: P.dim }}>{activeLabel}</span>
            : <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: P.dim }}>{activeLabel}</span>}
      </div>
      {arr.length === 0 ? (
        <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.30)" }}>{NOT_VERIFIED}</p>
      ) : (
        arr.map((r, i) => <p key={i} className="font-inter text-xs selectable" style={{ color: "rgba(255,255,255,0.85)" }} dir="auto">{r}</p>)
      )}
    </div>
  );
}

export default function HolyNameResearchProfile({ originalStaticId }) {
  const [rec, setRec] = useState(null);
  // (source-PDF provenance state removed — filenames/URLs are private library artifacts)
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const nameId = `HNK-MHN-${originalStaticId}`;
    base44.entities.HolyNameKnowledge.filter({ name_id: nameId }, null, 1)
      .then(r => { if (!alive) return; setRec((r && r[0]) || null); })
      .catch(() => { if (alive) setRec(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [originalStaticId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3" style={{ borderTop: `1px solid ${P.faint}` }}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: P.dim }} />
        <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: P.dim }}>Loading scholarly research profile…</span>
      </div>
    );
  }

  if (!rec || rec.verification_status === "unverified") {
    return (
      <div className="mt-3 rounded-xl border p-3 flex items-start gap-2" style={{ background: "rgba(8,16,38,0.5)", borderColor: P.faint }}>
        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "rgba(148,163,184,0.7)" }} />
        <div className="space-y-0.5">
          <p className="font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: "rgba(148,163,184,0.85)" }}>{NOT_VERIFIED}</p>
          <p className="font-malayalam text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>ഈ നാമത്തിന്റെ പണ്ഡിതോപയോഗിയായ ഗവേഷണ വിവരങ്ങൾ ഇതുവരെ പരിശോധിച്ചിട്ടില്ല. പരിശോധന പൂർത്തിയാകുമ്പോൾ ഇവിടെ പ്രദർശിപ്പിക്കും.</p>
        </div>
      </div>
    );
  }

  const st = STATUS_LABELS[rec.verification_status] || STATUS_LABELS.unverified;
  const rp = rec.research_profile || {};
  const ling = rec.linguistic || {};
  const ik = rec.islamic_knowledge || {};
  const mean = rec.meanings || {};
  const ben = rec.benefits || {};
  const rel99 = rec.relationship_to_99_names || {};
  const relType = rec.relationship_to_99_names_type || rel99.relationship_type || "unknown";
  const originLabel = ORIGIN_LABELS[rec.name_origin] || rec.name_origin || "Unknown";
  const originML = ORIGIN_ML[rec.name_origin] || "അജ്ഞാതം";

  return (
    <LangCtx.Provider value={lang}>
    <div className="pt-3 mt-1 space-y-3" style={{ borderTop: `1px solid ${P.faint}` }}>
      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: P.text }} />
          <span className={lang === "ml" ? "font-malayalam text-[11px] font-bold" : "font-inter text-[9px] uppercase tracking-widest font-bold"} style={{ color: P.text }}>{lang === "ml" ? "പണ്ഡിതോപയോഗിയായ ഗവേഷണ പ്രൊഫൈൽ" : "Scholarly Research Profile"}</span>
        </div>
        <HolyNameProfileLangSelector lang={lang} setLang={setLang} />
      </div>

      {/* 1 — Verified Arabic spelling + verification meta */}
      <Section icon={ShieldCheck} title="1 · Verified Arabic Spelling & Harakat" titleML="സ്ഥിരീകരിച്ച അറബി നാമവും ഹരകത്തും" accent={st.c}>
        <div className="text-center py-2 rounded-lg" style={{ background: P.bgHi, border: `1px solid ${P.borderHi}` }}>
          <p className="font-amiri text-[2.2rem] font-bold leading-[2.2] selectable" style={{ color: P.text, textShadow: "0 0 20px rgba(212,175,55,0.30)" }} dir="rtl">{rec.canonical_arabic || rec.fully_vowelized_name || rec.arabic_name}</p>
          {rec.canonical_arabic && rec.arabic_name && rec.canonical_arabic !== rec.arabic_name && <p className="font-inter text-[8px] mt-1" style={{ color: P.dim }}>As printed: <span className="font-amiri text-sm" dir="rtl">{rec.arabic_name}</span></p>}
        </div>
        {rec.spelling_corrected && rec.spelling_correction && rec.spelling_correction.corrected_harakat && (
          <div className="rounded-lg p-2.5 space-y-1.5" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.30)" }}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <ShieldCheck className="w-3 h-3" style={{ color: "#34d399" }} />
              <span className="font-inter text-[8px] uppercase tracking-widest font-bold" style={{ color: "#34d399" }}>Spelling Corrected by Scholarly Verification</span>
              <span className="font-malayalam text-[10px]" style={{ color: "rgba(52,211,153,0.70)" }}>· പണ്ഡിതോപയോഗിയായ പരിശോധനയിൽ അക്ഷരക്രമം തിരുത്തി</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: P.dim }}>Previous (as imported)</span>
                <p className="font-amiri text-base selectable" style={{ color: "rgba(255,255,255,0.70)" }} dir="rtl">{rec.spelling_correction.previous_harakat}</p>
              </div>
              <div className="space-y-0.5">
                <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: P.dim }}>Corrected (scholarly)</span>
                <p className="font-amiri text-base selectable" style={{ color: P.text }} dir="rtl">{rec.spelling_correction.corrected_harakat}</p>
              </div>
            </div>
            {rec.spelling_correction.evidence && <p className="font-inter text-[10px] leading-relaxed selectable" style={{ color: "rgba(255,255,255,0.78)" }} dir="auto">{rec.spelling_correction.evidence}</p>}
            <div className="flex items-center gap-3 flex-wrap">
              {rec.spelling_correction.confidence != null && <span className="font-inter text-[9px]" style={{ color: P.dim }}>Confidence: <b style={{ color: P.text }}>{rec.spelling_correction.confidence}%</b></span>}
              {rec.spelling_correction.corrected_at && <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.45)" }}>· {new Date(rec.spelling_correction.corrected_at).toLocaleDateString()}</span>}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg font-inter text-[8px] uppercase tracking-widest font-bold" style={{ color: st.c, background: `${st.c}1a`, border: `1px solid ${st.c}55` }}><ShieldCheck className="w-3 h-3" /> {lang === "ml" ? st.ml : st.t}</span>
          <span className="font-inter text-[9px]" style={{ color: P.dim }}>Confidence: <b style={{ color: P.text }}>{rec.verification_confidence || 0}%</b></span>
          {rec.last_verified_date && <span className="inline-flex items-center gap-1 font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.45)" }}><Clock className="w-2.5 h-2.5" /> {new Date(rec.last_verified_date).toLocaleDateString()}</span>}
          {rec.harakat_verified && <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: "#34d399" }}>Harakat Confirmed (≥2 sources)</span>}
        </div>
        {rec.review_notes && <TriField label="Reviewer Notes" labelML="പരിശോധകന്റെ കുറിപ്പുകൾ" english={rec.review_notes} malayalam={rec.review_notes_ml} />}
      </Section>

      {/* 2 — Alternative harakat */}
      {Array.isArray(rec.alternative_readings) && rec.alternative_readings.length > 0 && (
        <Section icon={BookOpen} title="2 · Alternative Accepted Harakat & Readings" titleML="മാറ്റൊലികളും സ്വീകാര്യമായ വായനകളും">
          <div className="space-y-2">
            {rec.alternative_readings.map((a, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-amiri text-lg selectable" style={{ color: P.text }} dir="rtl">{a.arabic}</span>
                  {a.preferred && <span className="font-inter text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ color: P.text, background: P.bgHi, border: `1px solid ${P.border}` }}>Preferred</span>}
                  {a.reading_note && <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.60)" }}>{a.reading_note}</span>}
                </div>
                <SourcesList sources={a.sources} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {Array.isArray(rec.alternative_spellings) && rec.alternative_spellings.length > 0 && (
        <Section icon={BookOpen} title="Alternative Spellings" titleML="മാറ്റ് അക്ഷരക്രമങ്ങൾ">
          <div className="space-y-1.5">
            {rec.alternative_spellings.map((a, i) => (
              <div key={i} className="space-y-1">
                <span className="font-amiri text-base selectable" style={{ color: P.text }} dir="rtl">{a.arabic}</span>
                {a.note && <span className="font-inter text-[9px] ml-2" style={{ color: "rgba(255,255,255,0.55)" }}>{a.note}</span>}
                <SourcesList sources={a.sources} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 3,4,5,6 — Pronunciation, Origin, Original word, Etymology */}
      <Section icon={Languages} title="3–6 · Pronunciation, Origin, Original Word & Etymology" titleML="ഉച്ചാരണം, ഉദ്ഭവ ഭാഷ, മൂലപദം, പദോൽപ്പത്തി">
        <TriField label="3 · Pronunciation" labelML="ഉച്ചാരണം" english={rp.pronunciation_guide} malayalam={rp.pronunciation_guide_ml} />
        <TriField label="4 · Language of Origin" labelML="ഉദ്ഭവ ഭാഷ" english={originLabel} malayalam={originML} />
        <TriField label="5 · Original Source Word" labelML="മൂലപദം" arabic={rec.original_source_word} arabicFirst />
        <TriField label="6 · Etymology" labelML="പദോൽപ്പത്തി" english={rec.etymology} malayalam={rp.etymology_ml} />
      </Section>

      {/* 7,8 — Historical background & earliest occurrence */}
      <Section icon={ScrollText} title="7–8 · Historical Background & Earliest Occurrence" titleML="ചരിത്രപരമായ പശ്ചാത്തലവും ആദ്യത്തെ പരാമർശവും">
        <TriField label="7 · Historical Background" labelML="ചരിത്രപരമായ പശ്ചാത്തലം" english={rp.historical_background} malayalam={rp.historical_background_ml} />
        <TriField label="8 · Earliest Known Occurrence" labelML="ആദ്യത്തെ പരാമർശം" english={rp.earliest_occurrence} malayalam={rp.earliest_occurrence_ml} />
        <TriField label="Related Historical Usage" labelML="ബന്ധപ്പെട്ട ചരിത്രപരമായ ഉപയോഗം" english={rp.related_historical_usage} malayalam={rp.related_historical_usage_ml} />
        {!has(rp.historical_background) && !has(rp.earliest_occurrence) && <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.40)" }}>{NOT_FOUND}</p>}
      </Section>

      {/* 9–17 — Meanings (trilingual) */}
      <Section icon={BookOpen} title="9–17 · Meanings" titleML="അർത്ഥങ്ങൾ">
        <TriField label="Meaning" labelML="അർത്ഥം" arabic={mean.arabic} malayalam={mean.malayalam} english={mean.english} />
        <TriField label="12 · Original-Language Meaning" labelML="മൂലഭാഷാ അർത്ഥം" english={mean.original} malayalam={mean.original_ml} />
        <TriField label="13 · Literal Meaning" labelML="ആക്ഷരിക അർത്ഥം" english={rp.literal_meaning || ling.literal_meaning} malayalam={mean.literal_ml} />
        <TriField label="14 · Root Meaning" labelML="ധാതു അർത്ഥം" english={rp.root_meaning || ling.lexical_meaning} malayalam={mean.root_ml} />
        <TriField label="15 · Symbolic Meaning" labelML="പ്രതീകാത്മക അർത്ഥം" english={mean.symbolic} malayalam={mean.symbolic_ml} />
        <TriField label="16 · Historical Meaning" labelML="ചരിത്രപരമായ അർത്ഥം" english={mean.historical} malayalam={mean.historical_ml} />
        <TriField label="17 · Traditional Meaning" labelML="പാരമ്പര്യ അർത്ഥം" english={mean.traditional} malayalam={mean.traditional_ml} />
      </Section>

      {/* 18 — Relationship to 99 Names */}
      <Section icon={Link2} title="18 · Relationship with the 99 Beautiful Names of Allah" titleML="99 സുന്ദര നാമങ്ങളുമായുള്ള ബന്ധം" accent={relType === "none" ? "rgba(148,163,184,0.8)" : P.text}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-1 rounded-lg font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: relType === "none" ? "rgba(148,163,184,0.85)" : P.text, background: relType === "none" ? "rgba(148,163,184,0.10)" : P.bgHi, border: `1px solid ${relType === "none" ? "rgba(148,163,184,0.30)" : P.border}` }}>{REL_LABELS[relType] || relType}</span>
          {rel99.related_name_arabic && <span className="font-amiri text-base" style={{ color: P.text }} dir="rtl">{rel99.related_name_arabic}</span>}
          {rel99.related_name_id && <span className="font-inter text-[9px]" style={{ color: P.dim }}>({rel99.related_name_id})</span>}
        </div>
        <TriField label="Evidence" labelML="തെളിവുകൾ" english={rel99.evidence} malayalam={rel99.evidence_ml} />
        {relType === "none" && !has(rel99.evidence) && <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.40)" }}>No authentic relationship to the 99 Names of Allah is known.</p>}
        {rel99.sources && rel99.sources.length > 0 && <SourcesList sources={rel99.sources} />}
      </Section>

      {/* 19,20,21 — Quran / Hadith / Tafsir (only if authentic) */}
      <Section icon={Quote} title="19–21 · Qur'an, Hadith & Tafsir References" titleML="ഖുർആൻ, ഹദീസ്, തഫ്സീർ പരാമർശങ്ങൾ">
        {has(ik.quran_verses) || has(ik.hadith_refs) || has(ik.tafsir_refs) || has(ik.scholarly_explanation) ? (
          <>
            {has(ik.quran_verses) && (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2"><span className={lang === "ml" ? "font-malayalam text-[11px] font-semibold" : "font-inter text-[8px] uppercase tracking-widest"} style={{ color: P.dim }}>{lang === "ml" ? "19 · ഖുർആൻ പരാമർശങ്ങൾ" : "19 · Qur'an References"}</span></div>
                {ik.quran_verses.map((q, i) => <p key={i} className="font-amiri text-sm leading-loose selectable" style={{ color: "rgba(255,255,255,0.88)" }} dir="rtl">{q}</p>)}
              </div>
            )}
            {has(ik.hadith_refs) && (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2"><span className={lang === "ml" ? "font-malayalam text-[11px] font-semibold" : "font-inter text-[8px] uppercase tracking-widest"} style={{ color: P.dim }}>{lang === "ml" ? "20 · ഹദീസ് പരാമർശങ്ങൾ" : "20 · Hadith References"}</span></div>
                {ik.hadith_refs.map((h, i) => <p key={i} className="font-inter text-xs selectable" style={{ color: "rgba(255,255,255,0.85)" }} dir="auto">{h}</p>)}
              </div>
            )}
            {has(ik.tafsir_refs) && (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2"><span className={lang === "ml" ? "font-malayalam text-[11px] font-semibold" : "font-inter text-[8px] uppercase tracking-widest"} style={{ color: P.dim }}>{lang === "ml" ? "21 · തഫ്സീർ പരാമർശങ്ങൾ" : "21 · Tafsir References"}</span></div>
                {ik.tafsir_refs.map((t, i) => <p key={i} className="font-inter text-xs selectable" style={{ color: "rgba(255,255,255,0.85)" }} dir="auto">{t}</p>)}
              </div>
            )}
            {has(ik.scholarly_explanation) && <TriField label="Scholarly Explanation" labelML="പണ്ഡിത വിശദീകരണം" english={ik.scholarly_explanation} malayalam={ik.scholarly_explanation_ml} />}
            {!has(ik.quran_verses) && !has(ik.hadith_refs) && !has(ik.tafsir_refs) && <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.40)" }}>Not found in Qur'an or Hadith (common for foreign-origin names).</p>}
          </>
        ) : (
          <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.40)" }}>Not found in verified primary Islamic sources.</p>
        )}
      </Section>

      {/* 22,23,24 — Classical / Academic / Manuscript references */}
      <Section icon={BookMarked} title="22–24 · Classical, Academic & Manuscript References" titleML="ക്ലാസിക്, അക്കാദമിക്, കയ്യെഴുത്തുപ്രതി പരാമർശങ്ങൾ" defaultOpen={false}>
        <RefList label="22 · Classical Dictionary References" labelML="ക്ലാസിക് നിഘണ്ടു പരാമർശങ്ങൾ" items={rp.classical_dict_refs} />
        <RefList label="23 · Academic References" labelML="അക്കാദമിക് പരാമർശങ്ങൾ" items={rp.academic_refs} />
        <RefList label="24 · Manuscript References" labelML="കയ്യെഴുത്തുപ്രതി പരാമർശങ്ങൾ" items={rp.manuscript_refs} />
      </Section>

      {/* 25,26 — Related names & root words */}
      <Section icon={Network} title="25–26 · Related Names & Related Root Words" titleML="ബന്ധപ്പെട്ട നാമങ്ങളും ധാതുക്കളും" defaultOpen={false}>
        <TriField label="25 · Related Names" labelML="ബന്ധപ്പെട്ട നാമങ്ങൾ" english={ling.related_names} malayalam={rp.related_names_ml} />
        <TriField label="26 · Related Root Words" labelML="ബന്ധപ്പെട്ട ധാതുക്കൾ" arabic={ling.arabic_root} arabicFirst />
        <TriField label="Root Letters" labelML="ധാതു അക്ഷരങ്ങൾ" arabic={ling.root_letters || rp.root_letters} arabicFirst />
        <TriField label="Morphological Pattern" labelML="രൂപശാസ്ത്ര പാറ്റേൺ" english={ling.morphological_pattern || rp.morphological_pattern} />
      </Section>

      {/* 27,28 — Authentic & Traditional benefits */}
      <Section icon={Award} title="27–28 · Authentic Islamic & Traditional Benefits" titleML="പ്രാമാണിക ഇസ്ലാമിക, പാരമ്പര്യ ഗുണങ്ങൾ" defaultOpen={false}>
        {has(ben.authentic_islamic) ? (
          <>
            <div className="flex items-baseline gap-2"><span className={lang === "ml" ? "font-malayalam text-[11px] font-semibold" : "font-inter text-[8px] uppercase tracking-widest"} style={{ color: P.dim }}>{lang === "ml" ? "27 · പ്രാമാണിക ഇസ്ലാമിക ഗുണങ്ങൾ" : "27 · Authentic Islamic Benefits (evidence-based)"}</span></div>
            <BenefitList items={ben.authentic_islamic} authenticated={true} />
            {lang === "ml" && ben.authentic_islamic_ml && <p className="font-malayalam text-sm leading-relaxed selectable pt-1" style={{ color: "rgba(255,255,255,0.88)" }} dir="auto">{ben.authentic_islamic_ml}</p>}
          </>
        ) : (
          <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.40)" }}>No authentic Islamic virtues found in reliable sources.</p>
        )}
        {has(ben.linguistic) && (<div className="space-y-1"><div className="flex items-baseline gap-2"><span className={lang === "ml" ? "font-malayalam text-[11px] font-semibold" : "font-inter text-[8px] uppercase tracking-widest"} style={{ color: P.dim }}>{lang === "ml" ? "ഭാഷാശാസ്ത്ര പ്രാധാന്യം" : "Linguistic Significance"}</span></div><BenefitList items={ben.linguistic} />{lang === "ml" && ben.linguistic_ml && <p className="font-malayalam text-sm leading-relaxed selectable" style={{ color: "rgba(255,255,255,0.88)" }} dir="auto">{ben.linguistic_ml}</p>}</div>)}
        {has(ben.historical) && (<div className="space-y-1"><div className="flex items-baseline gap-2"><span className={lang === "ml" ? "font-malayalam text-[11px] font-semibold" : "font-inter text-[8px] uppercase tracking-widest"} style={{ color: P.dim }}>{lang === "ml" ? "ചരിത്രപരമായ പ്രാധാന്യം" : "Historical Significance"}</span></div><BenefitList items={ben.historical} />{lang === "ml" && ben.historical_ml && <p className="font-malayalam text-sm leading-relaxed selectable" style={{ color: "rgba(255,255,255,0.88)" }} dir="auto">{ben.historical_ml}</p>}</div>)}
        {has(ben.traditional) && (
          <>
            <div className="flex items-baseline gap-2"><span className={lang === "ml" ? "font-malayalam text-[11px] font-semibold" : "font-inter text-[8px] uppercase tracking-widest"} style={{ color: "#fbbf24" }}>{lang === "ml" ? "28 · പാരമ്പര്യ ഗുണങ്ങൾ — പ്രാമാണികമല്ല" : "28 · Traditional Benefits — Not Authenticated"}</span></div>
            <BenefitList items={ben.traditional} authenticated={false} />
            {lang === "ml" && ben.traditional_ml && <p className="font-malayalam text-sm leading-relaxed selectable pt-1" style={{ color: "rgba(255,255,255,0.88)" }} dir="auto">{ben.traditional_ml}</p>}
          </>
        )}
      </Section>

      {/* Traditional / occult practices (legacy) */}
      {((ben.wafq && ben.wafq.length > 0) || (ben.amal && ben.amal.length > 0) || (ben.esoteric && ben.esoteric.length > 0) || (Array.isArray(rec.traditional_practices) && rec.traditional_practices.length > 0)) && (
        <Section icon={AlertTriangle} title="Traditional / Occult References" titleML="പാരമ്പര്യ / ഒക്കൾട്ട് പരാമർശങ്ങൾ" accent="#fbbf24" defaultOpen={false}>
          <p className="font-inter text-[9px] italic" style={{ color: "rgba(251,191,36,0.75)" }}>Traditional / Historical · Not Authenticated as Islamic Teaching</p>
          {has(ben.wafq) && <BenefitList items={ben.wafq} authenticated={false} />}
          {has(ben.amal) && <BenefitList items={ben.amal} authenticated={false} />}
          {has(ben.esoteric) && <BenefitList items={ben.esoteric} authenticated={false} />}
          {Array.isArray(rec.traditional_practices) && rec.traditional_practices.length > 0 && (
            <div className="space-y-2">
              {rec.traditional_practices.map((tp, i) => (
                <div key={i} className="space-y-1 rounded-lg p-2.5" style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.25)" }}>
                  {tp.text_ar && <p className="font-amiri text-sm selectable" style={{ color: "rgba(255,255,255,0.85)" }} dir="rtl">{tp.text_ar}</p>}
                  {lang === "ml" && tp.translation_ml && <p className="font-malayalam text-sm selectable" style={{ color: "rgba(255,255,255,0.80)" }} dir="auto">{tp.translation_ml}</p>}
                  {lang === "en" && tp.translation_en && <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.70)" }}>{tp.translation_en}</p>}
                  {tp.source && <p className="font-inter text-[9px]" style={{ color: P.dim }}>Source: {tp.source}</p>}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Invocations / Wazifa / Dhikr / Manuscript Practices */}
      <Section icon={BookCopy} title={`Invocations / Wazifa / Dhikr / Manuscript Practices${Array.isArray(rec.invocations) && rec.invocations.length ? ` (${rec.invocations.length})` : ""}`} titleML="പ്രാർഥനകൾ / വസീഫ / ദിക്ർ / കയ്യെഴുത്തുപ്രതി അഭ്യാസങ്ങൾ" defaultOpen={false}>
        {Array.isArray(rec.invocations) && rec.invocations.length > 0 ? (
          <div className="space-y-3">
            {INVOCATION_CATS.map(cat => {
              const items = rec.invocations.filter(iv => iv.category === cat.id);
              if (items.length === 0) return null;
              return (
                <div key={cat.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.auth ? "#34d399" : "#fbbf24" }} />
                    <span className={lang === "ml" ? "font-malayalam text-[11px] font-bold" : "font-inter text-[8px] uppercase tracking-widest font-bold"} style={{ color: cat.auth ? "#34d399" : "#fbbf24" }}>{lang === "ml" ? `${cat.labelML} (${items.length})` : `${cat.label} (${items.length})`}</span>
                  </div>
                  {items.map((iv, i) => <InvocationCard key={i} inv={iv} />)}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.40)" }}>No historically documented invocation was found.</p>
        )}
      </Section>

      {/* Source PDFs section removed — filenames/URLs are private library artifacts */}

      {/* 29,30,31 — Verification + sources */}
      <Section icon={ShieldCheck} title="29–31 · Verification Status, Confidence & Sources" titleML="പരിശോധന നില, വിശ്വാസ്യത, സ്രോതസ്സുകൾ" defaultOpen={false} accent={st.c}>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2"><span className={lang === "ml" ? "font-malayalam text-[11px] font-semibold" : "font-inter text-[8px] uppercase tracking-widest"} style={{ color: P.dim }}>{lang === "ml" ? "29 · പരിശോധന നില" : "29 · Verification Status"}</span></div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: st.c, background: `${st.c}1a`, border: `1px solid ${st.c}55` }}>{lang === "ml" ? st.ml : st.t}</span>
          </div>
          <div className="flex items-baseline gap-2"><span className={lang === "ml" ? "font-malayalam text-[11px] font-semibold" : "font-inter text-[8px] uppercase tracking-widest"} style={{ color: P.dim }}>{lang === "ml" ? "30 · പരിശോധന വിശ്വാസ്യത" : "30 · Verification Confidence"}</span></div>
          <span className="font-inter text-[9px]" style={{ color: P.dim }}>Confidence: <b style={{ color: P.text }}>{rec.verification_confidence || 0}%</b>{rec.last_verified_date ? ` · ${new Date(rec.last_verified_date).toLocaleDateString()}` : ""}</span>
          <div className="flex items-baseline gap-2 pt-1"><span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: P.dim }}>31 · Complete Source Citations</span><span className="font-malayalam text-[10px]" style={{ color: "rgba(245,208,96,0.45)" }}>· സ്രോതസ്സ് പരാമർശങ്ങൾ</span></div>
          {has(rec.verification_sources) ? <SourcesList sources={rec.verification_sources} /> : <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.30)" }}>{NOT_VERIFIED}</p>}
        </div>
      </Section>
    </div>
    </LangCtx.Provider>
  );
}
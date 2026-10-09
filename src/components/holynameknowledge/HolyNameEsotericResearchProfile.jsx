import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2, ShieldAlert, BookOpen, Sparkles, Calculator,
  FileText, ChevronDown, BookMarked, BookCopy, ScrollText,
} from "lucide-react";
import { platform } from "@/api/platformClient";
import { calculateAbjad, getAbjadBreakdown } from "@/lib/abjadValues";
import { useIsOwner } from "@/hooks/useIsOwner";
import { useHolyNamesLanguage } from "./HolyNamesLanguageContext";
import HolyNameSourceChapter from "./HolyNameSourceChapter";
import { sectionCEntriesForCard, sectionCOriginal, sectionCTranslation } from "@/lib/birhatiahSharedContent";

// ── Section C Card Detail ──
// Renders ONE Birhatīya name card with:
//   1. PRIMARY INFORMATION (canonical Arabic, transliterations, exact
//      meaning, letter count, individual letter values, full Abjad
//      calculation, total Abjad, verification status, source ref,
//      page, notes)
//   2. CURRENT SCHOLARLY DATA (verbatim from each uploaded source)
//   3. ADVANCED KNOWLEDGE SECTIONS (30+ collapsible, all empty until
//      owner approval)
//
// Reads ONLY from HolyNameEsotericKnowledge. Nothing fabricated.

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

const NOT_VERIFIED = "സ്രോതസ്സിൽ നിന്ന് സ്ഥിരീകരിച്ചിട്ടില്ല";
const AWAITING = "ഈ വിവരം നിലവിൽ അപ്‌ലോഡ് ചെയ്ത PDF-കളിൽ ലഭ്യമല്ല.";
const UNSCOPED_MARKER = "ഈ കാർഡിലെ പഴയ സ്രോതസ്സുവിവരങ്ങളിൽ ഓരോ വരിയുടെയും വ്യക്തിഗത ഇസ്മ് ബന്ധം അടയാളപ്പെടുത്തിയിട്ടില്ല. അതുകൊണ്ട് ഇതിനെ ഈ ഇസ്മിനു മാത്രം ഉള്ള നിർദ്ദേശമായി കണക്കാക്കരുത്.";

const ADVANCED_SECTIONS = [
  { key: "invocation_wazifa", label: "Invocation (Wazifa)", ml: "പ്രാർഥന (വസീഫ)" },
  { key: "complete_birhatiyya_text", label: "Complete Birhatīya Text", ml: "പൂർണ്ണ ബർഹത്തിയ്യ വാക്യം" },
  { key: "related_conjurations", label: "Related Conjurations", ml: "ബന്ധപ്പെട്ട കസം" },
  { key: "related_azaim", label: "Related Azā'im", ml: "ബന്ധപ്പെട്ട അസാഇം" },
  { key: "related_ruhaniyyat", label: "Related Rūḥāniyyāt", ml: "ബന്ധപ്പെട്ട രൂഹാനിയ്യാത്ത്" },
  { key: "related_talismans", label: "Related Talismans", ml: "ബന്ധപ്പെട്ട തായ്ലിസ്മാനുകൾ" },
  { key: "related_magic_squares", label: "Related Magic Squares (Awfāq)", ml: "ബന്ധപ്പെട്ട വെഫ്കുകൾ" },
  { key: "khawass", label: "Khawāṣṣ", ml: "ഖവാസ്സ്" },
  { key: "amal", label: "Amal", ml: "അമൽ" },
  { key: "mujarrabat", label: "Mujarrabāt", ml: "മുജർറബാത്ത്" },
  { key: "khatam", label: "Khatam", ml: "ഖത്തം" },
  { key: "dairah", label: "Dā'irah", ml: "ദാഇറ" },
  { key: "talisman_images", label: "Talisman Images", ml: "തായ്ലിസ്മാൻ ചിത്രങ്ങൾ" },
  { key: "ritual_procedure", label: "Ritual Procedure", ml: "അനുഷ്ഠാന ക്രമം" },
  { key: "conditions", label: "Conditions", ml: "നിബന്ധനകൾ" },
  { key: "number_of_recitations", label: "Number of Recitations", ml: "ആവർത്തന എണ്ണം" },
  { key: "timing", label: "Time", ml: "സമയം" },
  { key: "planet", label: "Planet", ml: "ഗ്രഹം" },
  { key: "lunar_mansion", label: "Lunar Mansion", ml: "നക്ഷത്രം" },
  { key: "zodiac", label: "Zodiac", ml: "രാശി" },
  { key: "incense", label: "Incense", ml: "സുഗന്ധം" },
  { key: "colors", label: "Colors", ml: "നിറങ്ങൾ" },
  { key: "elements", label: "Elements", ml: "മൂലകങ്ങൾ" },
  { key: "angels", label: "Angels", ml: "മലക്കുകൾ" },
  { key: "jinn", label: "Jinn", ml: "ജിൻ" },
  { key: "servitors", label: "Servitors", ml: "സേവകർ" },
  { key: "benefits", label: "Benefits", ml: "ഗുണങ്ങൾ" },
  { key: "warnings", label: "Warnings", ml: "മുന്നറിയിപ്പുകൾ" },
  { key: "scholarly_discussions", label: "Scholarly Discussions", ml: "പണ്ഡിത ചർച്ചകൾ" },
  { key: "historical_notes", label: "Historical Notes", ml: "ചരിത്രപരമായ കുറിപ്പുകൾ" },
  { key: "manuscript_variants", label: "Manuscript Variants", ml: "കയ്യെഴുത്തുപ്രതി വ്യത്യാസങ്ങൾ" },
  { key: "related_books", label: "Related Books", ml: "ബന്ധപ്പെട്ട ഗ്രന്ഥങ്ങൾ" },
  { key: "cross_references", label: "Cross References", ml: "ക്രോസ് റഫറൻസുകൾ" },
];

function Field({ label, labelML, children, arabic }) {
  const { language } = useHolyNamesLanguage();
  const empty = children === null || children === undefined || children === "";
  return (
    <div className="space-y-1">
      <span className={`${language === "ml" ? "font-malayalam" : "font-inter"} text-[12px] font-semibold leading-tight block`} style={{ color: "rgba(245,208,96,0.68)" }}>
        {language === "ml" ? (labelML || label) : label}
      </span>
      {empty ? (
        <p className={`${language === "ml" ? "font-malayalam" : "font-inter"} text-xs italic`} style={{ color: "rgba(255,255,255,0.30)" }}>{language === "ml" ? NOT_VERIFIED : "Not verified in the available source data"}</p>
      ) : arabic ? (
        <p className="font-amiri text-xl leading-loose selectable" style={{ color: "rgba(255,255,255,0.92)" }} dir="rtl">{children}</p>
      ) : (
        <p className="font-inter text-sm leading-relaxed selectable" style={{ color: "rgba(255,255,255,0.88)" }} dir="auto">{children}</p>
      )}
    </div>
  );
}

function Block({ title, titleML, icon: Icon, children, accent, defaultOpen = true }) {
  const { language } = useHolyNamesLanguage();
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-xl border overflow-hidden" style={{ background: "rgba(8,16,38,0.55)", borderColor: P.border }}>
      <details open={defaultOpen} className="group">
        <summary className="cursor-pointer list-none flex items-center gap-2 px-3 py-2.5 select-none" style={{ borderBottom: defaultOpen ? `1px solid ${P.faint}` : "none" }}>
          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent || P.text }} />
          <span className={`${language === "ml" ? "font-malayalam" : "font-inter"} text-sm font-bold flex-1`} style={{ color: accent || P.text }}>{language === "ml" ? (titleML || title) : title}</span>
          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180 flex-shrink-0" style={{ color: P.dim }} />
        </summary>
        <div className="px-3 py-3 space-y-3">{children}</div>
      </details>
    </motion.div>
  );
}

function AdvancedBlock({ label, ml, entries, nameId }) {
  const list = Array.isArray(entries) ? entries : [];
  const { language } = useHolyNamesLanguage();
  return (
    <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(8,16,38,0.4)", border: `1px solid ${P.faint}` }}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-malayalam text-[12px] font-semibold leading-tight" style={{ color: "rgba(245,208,96,0.62)" }}>{language === "ml" ? ml : label}</span>
      </div>
      {list.length === 0 ? (
        <p className="font-malayalam text-[11px] mt-1 leading-relaxed" style={{ color: "rgba(148,163,184,0.55)" }}>{language === "ml" ? AWAITING : "This information is not available in the uploaded sources."}</p>
      ) : (
        <div className="mt-2 space-y-2">
          {list.some(e => !e.name_id && !e.related_name_id) && <p className="font-malayalam text-[10px] italic leading-relaxed" style={{ color: "rgba(212,175,55,0.62)" }}>{language === "ml" ? UNSCOPED_MARKER : "These imported entries have no explicit individual-name attribution. Do not treat them as instructions exclusive to this name."}</p>}
          {list.map((e, i) => {
            const original = sectionCOriginal(e);
            const translated = sectionCTranslation(e, language);
            return (
              <div key={i} className="rounded-md px-2 py-1.5 space-y-1" style={{ background: "rgba(8,16,38,0.55)", border: `1px solid ${P.faint}` }}>
                {original && <p data-testid="section-c-original-entry" className="font-amiri text-base selectable leading-loose whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.92)" }} dir="auto">{original}</p>}
                {translated
                  ? <p className={`${language === "ml" ? "font-malayalam" : "font-inter"} text-[11px] selectable leading-relaxed`} style={{ color: "rgba(255,255,255,0.85)" }} dir="auto">{translated}</p>
                  : <p className={`${language === "ml" ? "font-malayalam" : "font-inter"} text-[10px] italic`} style={{ color: "rgba(255,255,255,0.38)" }}>{language === "ml" ? "മലയാള പരിഭാഷ ലഭ്യമല്ല" : "Translation unavailable"}</p>}
                {(e.source_reference || e.source_page) && <p className="font-inter text-[10px] mt-1 break-words" style={{ color: "rgba(212,175,55,0.60)" }}>{e.source_reference || ""}{e.source_page ? ` · p. ${e.source_page}` : ""}</p>}
                {(e.name_id === nameId || e.related_name_id === nameId) && <p className="font-malayalam text-[10px]" style={{color:P.dim}}>{language === "ml" ? "ഈ ഇസ്മുമായി നേരിട്ട് ബന്ധിപ്പിച്ച രേഖ" : "Explicitly linked to this name"}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HolyNameEsotericResearchProfile({ nameId, sharedEntryKeys = new Set() }) {
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryIndex, setRetryIndex] = useState(0);
  const isOwner = useIsOwner();
  const { language } = useHolyNamesLanguage();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError(false);
    setRec(null);
    platform.entities.HolyNameEsotericKnowledge.filter({ name_id: nameId }, null, 1)
      .then(r => { if (alive) setRec((r && r[0]) || null); })
      .catch(() => { if (alive) { setRec(null); setLoadError(true); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [nameId, retryIndex]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3" style={{ borderTop: `1px solid ${P.faint}` }}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: P.dim }} />
        <span className={`${language === "ml" ? "font-malayalam" : "font-inter"} text-xs`} style={{ color: P.dim }}>{language === "ml" ? "കാർഡ് ലോഡ് ചെയ്യുന്നു…" : "Loading name details…"}</span>
      </div>
    );
  }

  if (!rec) {
    return (
      <div className="mt-3 rounded-xl border p-3 flex items-start gap-2" style={{ background: "rgba(8,16,38,0.5)", borderColor: P.faint }}>
        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "rgba(148,163,184,0.7)" }} />
        <div className="space-y-2">
          <p className={`${language === "ml" ? "font-malayalam" : "font-inter"} text-sm font-semibold`} style={{ color: "rgba(148,163,184,0.85)" }}>
            {loadError
              ? (language === "ml" ? "കാർഡിലെ വിവരങ്ങൾ താൽക്കാലികമായി ലോഡ് ചെയ്യാനായില്ല." : "Unable to load this card's details right now.")
              : (language === "ml" ? "ഈ ഇസ്മിന്റെ ഡാറ്റ ലഭ്യമല്ല." : "This name's data is unavailable.")}
          </p>
          <button type="button" data-testid="section-c-card-retry" onClick={() => setRetryIndex(index => index + 1)}
            className="rounded-lg border border-yellow-500/35 px-3 py-2 text-xs text-yellow-100">
            {language === "ml" ? "കാർഡ് വീണ്ടും ലോഡ് ചെയ്യുക" : "Retry card details"}
          </button>
        </div>
      </div>
    );
  }

  const displayedName = rec.canonical_arabic_name || rec.arabic_name || "";
  const letters = getAbjadBreakdown(displayedName).filter(item => item.value > 0);
  const abjadValue = calculateAbjad(displayedName);
  const fullCalculation = letters.map(item => `${item.letter} (${item.value})`).join(" + ") + ` = ${abjadValue}`;
  // Every record is stored under one HolyNameEsotericKnowledge card.
  // Imported source entries often have no redundant name_id. Excluding them
  // hid the existing bibliography and practices for all twenty-eight names.
  // Honor explicit links; retain unscoped entries in the card with labels.
  const belongsToCard = entry =>
    (!entry.related_name_id && !entry.name_id) ||
    entry.related_name_id === nameId || entry.name_id === nameId;
  const scholarly = (Array.isArray(rec.scholarly_data) ? rec.scholarly_data : []).filter(belongsToCard);
  const hasAltSpell = Array.isArray(rec.alternate_spellings) && rec.alternate_spellings.length > 0;
  const hasAltPron = Array.isArray(rec.alternate_pronunciations) && rec.alternate_pronunciations.length > 0;
  const hasAltMean = Array.isArray(rec.alternate_meanings) && rec.alternate_meanings.length > 0;
  const hasAltAbjad = Array.isArray(rec.alternate_abjad_values) && rec.alternate_abjad_values.length > 0;
  const hasAlts = hasAltSpell || hasAltPron || hasAltMean || hasAltAbjad;
  const populatedSections = ADVANCED_SECTIONS.map(s => ({
    ...s,
    entries: sectionCEntriesForCard((Array.isArray(rec[s.key]) ? rec[s.key] : []).filter(belongsToCard), s.key, sharedEntryKeys),
  })).filter(s => s.entries.length > 0);

  return (
    <div className="pt-3 mt-1 space-y-3" style={{ borderTop: `1px solid ${P.faint}` }}>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-3.5 h-3.5" style={{ color: P.text }} />
        <span className="font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: P.text }}>{rec.name_id}</span>
      </div>

      {/* 1 — PRIMARY INFORMATION */}
      <HolyNameSourceChapter chapter={rec.source_checked_chapter} nameId={nameId} currentAbjad={abjadValue} />
      <Block title="Primary Information" titleML="നാമവിവരങ്ങളും അക്ഷരമൂല്യങ്ങളും" icon={BookOpen} accent={P.text} defaultOpen={true}>
        <div className="text-center py-2 rounded-lg" style={{ background: P.bgHi, border: `1px solid ${P.borderHi}` }}>
          <p className="font-amiri text-[2.2rem] font-bold leading-[2.2] selectable" style={{ color: P.text, textShadow: "0 0 20px rgba(212,175,55,0.30)" }} dir="rtl">
            {rec.canonical_arabic_name || rec.arabic_name}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Total Abjad Value" labelML="മൊത്തം അബ്ജദ് മൂല്യം">{abjadValue}</Field>
          <Field label="Abjad Value Squared (not a magic square)" labelML="അബ്ജദ് മൂല്യത്തിന്റെ വർഗം (വെഫ്ക് അല്ല)">{abjadValue * abjadValue}</Field>
          <Field label="Letter Count" labelML="അക്ഷരസംഖ്യ">{letters.length || ""}</Field>
        </div>
        <p className="font-inter text-xs text-white/50">{abjadValue} × {abjadValue} = {abjadValue * abjadValue}</p>
        <p className="text-xs text-white/50">{language === "ml" ? "ഇത് ഒരു ഗണിത വർഗീകരണമാണ്; ഗ്രന്ഥത്തിലെ വെഫ്കോ ഔഫാഖ് കളമോ അല്ല. യഥാർത്ഥ കളങ്ങൾ ഉറവിടം സഹിതം പ്രത്യേകമായി കാണിക്കുന്നു." : "This is arithmetic squaring, not a manuscript magic square. Actual sourced figures are shown separately."}</p>

        <Field label="Canonical Arabic Name" labelML="അറബി നാമം" arabic>{rec.canonical_arabic_name || rec.arabic_name}</Field>
        {language === "ml" && rec.malayalam_transliteration && <Field label="Malayalam Pronunciation" labelML="മലയാളം ഉച്ചാരണം">{rec.malayalam_transliteration}</Field>}
        {language === "en" && <Field label="English Transliteration" labelML="ഇംഗ്ലീഷ് ട്രാൻസ്ലിറ്ററേഷൻ">{rec.english_transliteration || rec.transliteration}</Field>}

        <Field label="Meanings given in the imported source" labelML="ഇറക്കുമതി ചെയ്ത സ്രോതസ്സിൽ നൽകിയ അർത്ഥങ്ങൾ">
          {language === "ml"
            ? (rec.malayalam_meaning || rec.meaning_ml || rec.exact_meaning_ml || "")
            : (rec.english_meaning || rec.meaning_en || rec.exact_meaning_en || "")}
        </Field>

        <p className={`${language === "ml" ? "font-malayalam" : "font-inter"} text-xs leading-relaxed text-white/50`}>
          {language === "ml" ? "ഇവ ഇറക്കുമതി ചെയ്ത സ്രോതസ്സിൽ പറയുന്ന അർത്ഥങ്ങളാണ്; സ്വതന്ത്ര സ്രോതസ്സ് പരിശോധന പൂർത്തിയായിട്ടില്ല." : "These meanings are attributed in the imported source; independent source verification is pending."}
        </p>

        {/* Individual letter values */}
        <div className="space-y-1">
          <span className="font-malayalam text-[12px] font-semibold" style={{ color: P.dim }}>{language === "ml" ? "ഓരോ അറബി അക്ഷരത്തിന്റെ എബ്ജദ് മൂല്യം" : "Abjad value of each Arabic letter"}</span>
          {letters.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {letters.map((l, i) => (
                <span key={i} className="inline-flex items-baseline gap-1 px-2 py-1 rounded-lg border font-inter text-[10px]" style={{ background: "rgba(8,16,38,0.6)", borderColor: P.faint, color: "rgba(255,255,255,0.80)" }}>
                  <span className="font-amiri text-lg" style={{ color: P.text }} dir="rtl">{l.letter}</span>
                  <span style={{ color: P.dim }}>=</span>
                  <span className="font-bold" style={{ color: P.text }}>{l.value}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.30)" }}>{language === "ml" ? NOT_VERIFIED : "Not verified in the available source data"}</p>
          )}
        </div>

        {/* Full Abjad calculation */}
        <div className="space-y-1">
          <span className="font-malayalam text-[12px] font-semibold" style={{ color: P.dim }}>{language === "ml" ? "പൂർണ്ണ എബ്ജദ് കണക്കുകൂട്ടൽ" : "Full Abjad calculation"}</span>
          {letters.length > 0 ? (
            <div className="flex items-start gap-2 rounded-lg p-2.5" style={{ background: "rgba(8,16,38,0.6)", border: `1px solid ${P.faint}` }}>
              <Calculator className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: P.dim }} />
              <p className="font-amiri text-base leading-loose selectable flex-1" style={{ color: "rgba(255,255,255,0.88)" }} dir="rtl">{fullCalculation}</p>
            </div>
          ) : (
            <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.30)" }}>{language === "ml" ? NOT_VERIFIED : "Not verified in the available source data"}</p>
          )}
          {rec.abjad_verified === false && rec.total_abjad_value > 0 && (
            <p className="font-malayalam text-[11px] italic" style={{ color: "#fbbf24" }}>{language === "ml" ? "⚠ കണക്കുകൂട്ടിയ തുക സ്രോതസ്സിലെ മൂല്യവുമായി പൊരുത്തപ്പെടുന്നില്ല — പരിശോധനയ്ക്കായി അടയാളപ്പെടുത്തി." : "⚠ The recorded Abjad value is flagged for review; compare it with the calculation and source."}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Verification Status" labelML="പരിശോധന നില">{rec.verification_status || "unverified"}</Field>
        </div>
        <Field label="Source Reference" labelML="സ്രോതസ്സ് പരാമർശം">{rec.source_reference}</Field>
        <Field label="Source Page Number" labelML="സ്രോതസ്സ് പേജ്">{rec.source_page_number}</Field>
        {isOwner && <Field label="Source Notes" labelML="സ്രോതസ്സ് കുറിപ്പുകൾ">{rec.source_notes}</Field>}
      </Block>



      {/* 2 — CURRENT SCHOLARLY DATA */}
      <Block title="Current Scholarly Data" titleML="നിലവിലുള്ള പണ്ഡിത വിവരങ്ങൾ" icon={ScrollText} accent={P.text} defaultOpen={true}>
        {scholarly.length > 0 ? (
          <div className="space-y-3">
            {scholarly.map((s, i) => (
              <div key={i} className="rounded-lg p-3 space-y-2" style={{ background: "rgba(212,175,55,0.04)", border: `1px solid ${P.faint}` }}>
                <div className="flex items-start gap-2">
                  <BookMarked className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: P.dim }} />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-inter text-[10px] selectable break-words" style={{ color: "rgba(255,255,255,0.72)" }}>{s.source_reference || (language === "ml" ? "സ്രോതസ്സ് വ്യക്തമാക്കിയിട്ടില്ല" : "Source not recorded")}</p>
                    {s.source_page && <p className="font-malayalam text-[11px]" style={{ color: P.dim }}>{language === "ml" ? "പേജ്" : "Page"} {s.source_page}</p>}
                  </div>
                </div>
                {s.arabic_text && <p className="font-amiri text-lg leading-loose selectable" style={{ color: "rgba(255,255,255,0.90)" }} dir="rtl">{s.arabic_text}</p>}
                {language === "en" && s.transliteration && <p className="font-inter text-xs italic selectable" style={{ color: "rgba(255,255,255,0.70)" }} dir="ltr">{s.transliteration}</p>}
                {(language === "ml" ? (s.malayalam_translation || s.meaning_ml || (/[\u0D00-\u0D7F]/.test(s.exact_meaning || "") ? s.exact_meaning : "")) : (s.english_translation || s.meaning_en || (s.language === "en" ? s.exact_meaning : ""))) && (
                  <p className={`${language === "ml" ? "font-malayalam" : "font-inter"} text-sm leading-relaxed selectable`} style={{ color: "rgba(255,255,255,0.88)" }} dir="auto">
                    {language === "ml" ? (s.malayalam_translation || s.meaning_ml || s.exact_meaning) : (s.english_translation || s.meaning_en || s.exact_meaning)}
                  </p>
                )}
                {isOwner && s.notes && <p className="font-inter text-[9px] italic" style={{ color: P.dim }}>{s.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="font-malayalam text-sm italic" style={{ color: "rgba(255,255,255,0.40)" }}>{language === "ml" ? "ഇതുവരെ പണ്ഡിത സ്രോതസ്സ് വിവരങ്ങൾ ഇറക്കുമതി ചെയ്തിട്ടില്ല." : "No scholarly source entries have been imported yet."}</p>
        )}

        {/* Alternates (future merge) */}
        {hasAlts && (
          <div className="space-y-2 pt-2" style={{ borderTop: `1px solid ${P.faint}` }}>
            <span className="font-malayalam text-[12px] font-semibold" style={{ color: P.dim }}>{language === "ml" ? "മാറ്റ് അഭിപ്രായങ്ങൾ (ബഹു-സ്രോതസ്സ് ലയനം)" : "Alternative readings from different sources"}</span>
            {hasAltSpell && rec.alternate_spellings.map((a, i) => <p key={`s${i}`} className="font-amiri text-sm selectable" style={{ color: "rgba(255,255,255,0.80)" }} dir="rtl">{a.arabic} <span className="font-inter text-[9px]" style={{ color: P.dim }}>— {a.source_reference}</span></p>)}
            {hasAltPron && rec.alternate_pronunciations.map((a, i) => <p key={`p${i}`} className="font-inter text-xs selectable" style={{ color: "rgba(255,255,255,0.80)" }}>{a.pronunciation} <span style={{ color: P.dim }}>— {a.source_reference}</span></p>)}
            {hasAltMean && rec.alternate_meanings.map((a, i) => <p key={`m${i}`} className="font-inter text-xs selectable" style={{ color: "rgba(255,255,255,0.80)" }} dir="auto">"{a.meaning}" <span style={{ color: P.dim }}>— {a.source_reference}</span></p>)}
            {hasAltAbjad && rec.alternate_abjad_values.map((a, i) => <p key={`v${i}`} className="font-inter text-xs selectable" style={{ color: "rgba(255,255,255,0.80)" }}>{a.abjad} <span style={{ color: P.dim }}>— {a.source_reference}</span></p>)}
          </div>
        )}

        {/* Citations are useful to every reader; private notes remain owner-only. */}
        {Array.isArray(rec.sources) && rec.sources.length > 0 && (
          <div className="space-y-1 pt-2" style={{ borderTop: `1px solid ${P.faint}` }}>
            <span className="font-malayalam text-[12px] font-semibold" style={{ color: P.dim }}>{language === "ml" ? "പരിശോധിച്ച സ്രോതസ്സുകൾ" : "Recorded source references"}</span>
            {rec.sources.map((s, i) => <p key={i} className="font-inter text-[9px] selectable" style={{ color: "rgba(255,255,255,0.65)" }}>{s.reference} {s.page ? `(p. ${s.page})` : ""}</p>)}
          </div>
        )}
      </Block>

      {/* 3 — ADVANCED KNOWLEDGE SECTIONS (all empty until approved) */}
      {populatedSections.length > 0 && <Block title="Practices and related details" titleML="രീതികളും ബന്ധപ്പെട്ട വിവരങ്ങളും" icon={BookCopy} accent="rgba(245,208,96,0.60)" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {populatedSections.map(s => <AdvancedBlock key={s.key} label={s.label} ml={s.ml} entries={s.entries} nameId={nameId} />)}
        </div>
      </Block>}

      {/* Per-name traceability is visible to readers, not only the owner. */}
      <div className="flex items-center gap-2 pt-2 px-1" style={{ borderTop: `1px solid ${P.faint}` }}>
        <FileText className="w-3 h-3" style={{ color: P.dim }} />
        <span className="font-malayalam text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          {rec.name_id} · Section C · {language === "ml" ? "വിവരങ്ങളുടെ ഉറവിടം അതത് വിഭാഗത്തിൽ കാണാം" : "Source citations are shown alongside their entries"}
        </span>
      </div>
    </div>
  );
}

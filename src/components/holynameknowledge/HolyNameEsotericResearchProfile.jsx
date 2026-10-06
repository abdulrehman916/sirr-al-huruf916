import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2, ShieldAlert, BookOpen, Sparkles, Calculator,
  FileText, ChevronDown, BookMarked, BookCopy, ScrollText,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import SectionCVisualDisplay from "@/components/sectionc/SectionCVisualDisplay";
import { useIsOwner } from "@/hooks/useIsOwner";

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
const SHARED_MARKER = "ഈ വിവരങ്ങൾ മുഴുവൻ ബിർഹതിയ്യ മന്ത്രസമുച്ചയത്തിന്റെയും പൊതുവായ നിർദ്ദേശങ്ങളാണ്; ഈ പേരിന് മാത്രം പ്രത്യേകമായ വിവരമല്ല.";

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
  const empty = children === null || children === undefined || children === "";
  return (
    <div className="space-y-1">
      <span className="font-malayalam text-[12px] font-semibold leading-tight block" style={{ color: "rgba(245,208,96,0.68)" }}>
        {labelML || label}
      </span>
      {empty ? (
        <p className="font-malayalam text-xs italic" style={{ color: "rgba(255,255,255,0.30)" }}>{NOT_VERIFIED}</p>
      ) : arabic ? (
        <p className="font-amiri text-xl leading-loose selectable" style={{ color: "rgba(255,255,255,0.92)" }} dir="rtl">{children}</p>
      ) : (
        <p className="font-inter text-sm leading-relaxed selectable" style={{ color: "rgba(255,255,255,0.88)" }} dir="auto">{children}</p>
      )}
    </div>
  );
}

function Block({ title, titleML, icon: Icon, children, accent, defaultOpen = true }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-xl border overflow-hidden" style={{ background: "rgba(8,16,38,0.55)", borderColor: P.border }}>
      <details open={defaultOpen} className="group">
        <summary className="cursor-pointer list-none flex items-center gap-2 px-3 py-2.5 select-none" style={{ borderBottom: defaultOpen ? `1px solid ${P.faint}` : "none" }}>
          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent || P.text }} />
          <span className="font-malayalam text-sm font-bold flex-1" style={{ color: accent || P.text }}>{titleML || title}</span>
          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180 flex-shrink-0" style={{ color: P.dim }} />
        </summary>
        <div className="px-3 py-3 space-y-3">{children}</div>
      </details>
    </motion.div>
  );
}

function AdvancedBlock({ label, ml, entries }) {
  const list = Array.isArray(entries) ? entries : [];
  const isOwner = useIsOwner();
  const isArabic = (t) => /[\u0600-\u06FF]/.test(t || "");
  return (
    <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(8,16,38,0.4)", border: `1px solid ${P.faint}` }}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-malayalam text-[12px] font-semibold leading-tight" style={{ color: "rgba(245,208,96,0.62)" }}>{ml}</span>
      </div>
      {list.length === 0 ? (
        <p className="font-malayalam text-[11px] mt-1 leading-relaxed" style={{ color: "rgba(148,163,184,0.55)" }}>{AWAITING}</p>
      ) : (
        <div className="mt-2 space-y-2">
          <p className="font-malayalam text-[10px] italic leading-relaxed" style={{ color: "rgba(212,175,55,0.62)" }}>{SHARED_MARKER}</p>
          {list.map((e, i) => (
            <div key={i} className="rounded-md px-2 py-1.5" style={{ background: "rgba(8,16,38,0.55)", border: `1px solid ${P.faint}` }}>
              <p className={`selectable leading-relaxed ${isArabic(e.text) ? "font-amiri text-base" : "font-inter text-[11px]"}`} style={{ color: "rgba(255,255,255,0.85)" }} dir={isArabic(e.text) ? "rtl" : "auto"}>{e.text}</p>
              {isOwner && <p className="font-malayalam text-[10px] mt-1" style={{ color: "rgba(212,175,55,0.45)" }}>{e.source_reference}{e.source_page ? ` · പേജ് ${e.source_page}` : ""}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HolyNameEsotericResearchProfile({ nameId }) {
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const isOwner = useIsOwner();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    base44.entities.HolyNameEsotericKnowledge.filter({ name_id: nameId }, null, 1)
      .then(r => { if (alive) setRec((r && r[0]) || null); })
      .catch(() => { if (alive) setRec(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [nameId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3" style={{ borderTop: `1px solid ${P.faint}` }}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: P.dim }} />
        <span className="font-malayalam text-xs" style={{ color: P.dim }}>കാർഡ് ലോഡ് ചെയ്യുന്നു…</span>
      </div>
    );
  }

  if (!rec) {
    return (
      <div className="mt-3 rounded-xl border p-3 flex items-start gap-2" style={{ background: "rgba(8,16,38,0.5)", borderColor: P.faint }}>
        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "rgba(148,163,184,0.7)" }} />
        <p className="font-malayalam text-sm font-bold" style={{ color: "rgba(148,163,184,0.85)" }}>{NOT_VERIFIED}</p>
      </div>
    );
  }

  const letters = Array.isArray(rec.individual_letter_values) ? rec.individual_letter_values : [];
  const scholarly = Array.isArray(rec.scholarly_data) ? rec.scholarly_data : [];
  const hasMeaning = (rec.exact_meaning || "").trim() !== "";
  const hasAltSpell = Array.isArray(rec.alternate_spellings) && rec.alternate_spellings.length > 0;
  const hasAltPron = Array.isArray(rec.alternate_pronunciations) && rec.alternate_pronunciations.length > 0;
  const hasAltMean = Array.isArray(rec.alternate_meanings) && rec.alternate_meanings.length > 0;
  const hasAltAbjad = Array.isArray(rec.alternate_abjad_values) && rec.alternate_abjad_values.length > 0;
  const hasAlts = hasAltSpell || hasAltPron || hasAltMean || hasAltAbjad;

  return (
    <div className="pt-3 mt-1 space-y-3" style={{ borderTop: `1px solid ${P.faint}` }}>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-3.5 h-3.5" style={{ color: P.text }} />
        <span className="font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: P.text }}>{rec.name_id}</span>
      </div>

      {/* 1 — PRIMARY INFORMATION */}
      <Block title="Primary Information" titleML="പ്രാഥമിക വിവരങ്ങൾ" icon={BookOpen} accent={P.text}>
        <div className="text-center py-2 rounded-lg" style={{ background: P.bgHi, border: `1px solid ${P.borderHi}` }}>
          <p className="font-amiri text-[2.2rem] font-bold leading-[2.2] selectable" style={{ color: P.text, textShadow: "0 0 20px rgba(212,175,55,0.30)" }} dir="rtl">
            {rec.canonical_arabic_name || rec.arabic_name}
          </p>
        </div>

        <Field label="Canonical Arabic Name" labelML="അറബി നാമം" arabic>{rec.canonical_arabic_name || rec.arabic_name}</Field>
        <Field label="Transliteration" labelML="ട്രാൻസ്ലിറ്ററേഷൻ">{rec.transliteration}</Field>
        <Field label="Malayalam Transliteration" labelML="മലയാളം ട്രാൻസ്ലിറ്ററേഷൻ">{rec.malayalam_transliteration}</Field>
        <Field label="English Transliteration" labelML="ഇംഗ്ലീഷ് ട്രാൻസ്ലിറ്ററേഷൻ">{rec.english_transliteration || rec.transliteration}</Field>

        <Field label="Exact Meaning (from source)" labelML="ശരിയായ അർത്ഥം (സ്രോതസ്സിൽ നിന്ന്)">
          {hasMeaning ? `"${rec.exact_meaning}"` : ""}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Letter Count" labelML="അക്ഷര എണ്ണം">{rec.letter_count || letters.length || ""}</Field>
          <Field label="Total Abjad Value" labelML="മൊത്തം എബ്ജദ് മൂല്യം">{rec.total_abjad_value || ""}</Field>
        </div>

        {/* Individual letter values */}
        <div className="space-y-1">
          <span className="font-malayalam text-[12px] font-semibold" style={{ color: P.dim }}>ഓരോ അറബി അക്ഷരത്തിന്റെ എബ്ജദ് മൂല്യം</span>
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
            <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.30)" }}>{NOT_VERIFIED}</p>
          )}
        </div>

        {/* Full Abjad calculation */}
        <div className="space-y-1">
          <span className="font-malayalam text-[12px] font-semibold" style={{ color: P.dim }}>പൂർണ്ണ എബ്ജദ് കണക്കുകൂട്ടൽ</span>
          {(rec.full_abjad_calculation || "").trim() ? (
            <div className="flex items-start gap-2 rounded-lg p-2.5" style={{ background: "rgba(8,16,38,0.6)", border: `1px solid ${P.faint}` }}>
              <Calculator className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: P.dim }} />
              <p className="font-amiri text-base leading-loose selectable flex-1" style={{ color: "rgba(255,255,255,0.88)" }} dir="rtl">{rec.full_abjad_calculation}</p>
            </div>
          ) : (
            <p className="font-inter text-xs italic" style={{ color: "rgba(255,255,255,0.30)" }}>{NOT_VERIFIED}</p>
          )}
          {rec.abjad_verified === false && rec.total_abjad_value > 0 && (
            <p className="font-malayalam text-[11px] italic" style={{ color: "#fbbf24" }}>⚠ കണക്കുകൂട്ടിയ തുക സ്രോതസ്സിലെ മൂല്യവുമായി പൊരുത്തപ്പെടുന്നില്ല — പരിശോധനയ്ക്കായി അടയാളപ്പെടുത്തി.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Verification Status" labelML="പരിശോധന നില">{rec.verification_status || "unverified"}</Field>
        </div>
        {isOwner && (<>
        <Field label="Source Reference" labelML="സ്രോതസ്സ് പരാമർശം">{rec.source_reference}</Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source Page Number" labelML="സ്രോതസ്സ് പേജ്">{rec.source_page_number}</Field>
          <Field label="Source Notes" labelML="സ്രോതസ്സ് കുറിപ്പുകൾ">{rec.source_notes}</Field>
        </div>
        </>)}
      </Block>

      {/* VISUAL CONTENT — displayed above scholarly data, underneath primary info */}
      {Array.isArray(rec.attached_visuals) && rec.attached_visuals.length > 0 && (
        <SectionCVisualDisplay visuals={rec.attached_visuals} />
      )}

      {/* 2 — CURRENT SCHOLARLY DATA */}
      <Block title="Current Scholarly Data" titleML="നിലവിലുള്ള പണ്ഡിത വിവരങ്ങൾ" icon={ScrollText} accent={P.text} defaultOpen={false}>
        {scholarly.length > 0 ? (
          <div className="space-y-3">
            {scholarly.map((s, i) => (
              <div key={i} className="rounded-lg p-3 space-y-2" style={{ background: "rgba(212,175,55,0.04)", border: `1px solid ${P.faint}` }}>
                <div className="flex items-start gap-2">
                  <BookMarked className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: P.dim }} />
                  {isOwner && (
                  <div className="flex-1 space-y-0.5">
                    <p className="font-inter text-[10px] selectable" style={{ color: "rgba(255,255,255,0.82)" }}>{s.source_reference}</p>
                    {s.source_page && <p className="font-malayalam text-[11px]" style={{ color: P.dim }}>പേജ് {s.source_page}</p>}
                  </div>
                  )}
                </div>
                {s.arabic_text && <p className="font-amiri text-lg leading-loose selectable" style={{ color: "rgba(255,255,255,0.90)" }} dir="rtl">{s.arabic_text}</p>}
                {s.transliteration && <p className="font-inter text-xs italic selectable" style={{ color: "rgba(255,255,255,0.70)" }} dir="ltr">{s.transliteration}</p>}
                {s.exact_meaning && <p className="font-inter text-sm leading-relaxed selectable" style={{ color: "rgba(255,255,255,0.88)" }} dir="auto">"{s.exact_meaning}"</p>}
                {s.notes && <p className="font-inter text-[9px] italic" style={{ color: P.dim }}>{s.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="font-malayalam text-sm italic" style={{ color: "rgba(255,255,255,0.40)" }}>ഇതുവരെ പണ്ഡിത സ്രോതസ്സ് വിവരങ്ങൾ ഇറക്കുമതി ചെയ്തിട്ടില്ല.</p>
        )}

        {/* Alternates (future merge) */}
        {hasAlts && (
          <div className="space-y-2 pt-2" style={{ borderTop: `1px solid ${P.faint}` }}>
            <span className="font-malayalam text-[12px] font-semibold" style={{ color: P.dim }}>മാറ്റ് അഭിപ്രായങ്ങൾ (ബഹു-സ്രോതസ്സ് ലയനം)</span>
            {hasAltSpell && rec.alternate_spellings.map((a, i) => <p key={`s${i}`} className="font-amiri text-sm selectable" style={{ color: "rgba(255,255,255,0.80)" }} dir="rtl">{a.arabic} <span className="font-inter text-[9px]" style={{ color: P.dim }}>— {a.source_reference}</span></p>)}
            {hasAltPron && rec.alternate_pronunciations.map((a, i) => <p key={`p${i}`} className="font-inter text-xs selectable" style={{ color: "rgba(255,255,255,0.80)" }}>{a.pronunciation} <span style={{ color: P.dim }}>— {a.source_reference}</span></p>)}
            {hasAltMean && rec.alternate_meanings.map((a, i) => <p key={`m${i}`} className="font-inter text-xs selectable" style={{ color: "rgba(255,255,255,0.80)" }} dir="auto">"{a.meaning}" <span style={{ color: P.dim }}>— {a.source_reference}</span></p>)}
            {hasAltAbjad && rec.alternate_abjad_values.map((a, i) => <p key={`v${i}`} className="font-inter text-xs selectable" style={{ color: "rgba(255,255,255,0.80)" }}>{a.abjad} <span style={{ color: P.dim }}>— {a.source_reference}</span></p>)}
          </div>
        )}

        {/* Sources consulted — Owner only */}
        {isOwner && Array.isArray(rec.sources) && rec.sources.length > 0 && (
          <div className="space-y-1 pt-2" style={{ borderTop: `1px solid ${P.faint}` }}>
            <span className="font-malayalam text-[12px] font-semibold" style={{ color: P.dim }}>പരിശോധിച്ച സ്രോതസ്സുകൾ</span>
            {rec.sources.map((s, i) => <p key={i} className="font-inter text-[9px] selectable" style={{ color: "rgba(255,255,255,0.65)" }}>{s.reference} {s.page ? `(p. ${s.page})` : ""}</p>)}
          </div>
        )}
      </Block>

      {/* 3 — ADVANCED KNOWLEDGE SECTIONS (all empty until approved) */}
      <Block title="Advanced Knowledge Sections" titleML="വിപുലമായ വിജ്ഞാന വിഭാഗങ്ങൾ" icon={BookCopy} accent="rgba(245,208,96,0.60)" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ADVANCED_SECTIONS.map(s => <AdvancedBlock key={s.key} label={s.label} ml={s.ml} entries={rec[s.key]} />)}
        </div>
      </Block>

      {/* Footer — traceability — Owner only */}
      {isOwner && (
      <div className="flex items-center gap-2 pt-2 px-1" style={{ borderTop: `1px solid ${P.faint}` }}>
        <FileText className="w-3 h-3" style={{ color: P.dim }} />
        <span className="font-malayalam text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          {rec.name_id} · Section C · ഓരോ വിവരവും അതിന്റെ കൃത്യമായ സ്രോതസ്സിലേക്ക് ലേഖനം ചെയ്യാൻ കഴിയും
        </span>
      </div>
      )}
    </div>
  );
}
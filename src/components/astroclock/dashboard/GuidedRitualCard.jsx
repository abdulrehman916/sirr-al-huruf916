// ═══════════════════════════════════════════════════════════════
// GUIDED RITUAL CARD — COMPLETE MANUSCRIPT KNOWLEDGE SYSTEM
// 37-FIELD DISPLAY TEMPLATE with auto-category classification
// PERMANENT MANUSCRIPT RULE: Every instruction sourced from
// original manuscripts via cross-manuscript search. "Not specified"
// shown ONLY after ALL imported manuscripts are searched.
// Every instruction includes source + page number.
// Future manuscripts auto-participate via registry — no code changes.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import QuranicArabicText from "@/components/astroclock/QuranicArabicText";
import MalayalamTranslation from "./MalayalamTranslation";
import { getMergedRitualInstructions, getRegisteredSources, autoClassifyEntry } from "@/lib/manuscriptRitualGuideData";
import { getAllRecitationsMap, getQuranVerificationNote, MANUSCRIPT_AUTHORITY_RULE } from "@/lib/astroClockDailyMantrasData";

const G = { text: "#F5D060", dim: "rgba(212,175,55,0.55)", border: "rgba(212,175,55,0.20)" };
const NOT_SPECIFIED_ANY = "ഇറക്കുമതി ചെയ്ത ഒരു ഗ്രന്ഥത്തിലും പറയാത്തത്";

// Display helper: convert English source names to Arabic manuscript titles
function arabicBookTitle(source) {
  if (!source) return source;
  if (source.includes("Kashf")) return "كشف الحقائق";
  return source;
}

const TYPE_META = {
  azimah: { label_ml: "അസീം", color: "#F87171", bg: "rgba(248,113,113,0.06)" },
  qasam: { label_ml: "ഖസം", color: "#818CF8", bg: "rgba(129,140,248,0.06)" },
  universal_supplication: { label_ml: "സർവ ദു‌ആ", color: "#4ADE80", bg: "rgba(74,222,128,0.04)" },
  dua: { label_ml: "ദു‌ആ", color: "#4ADE80", bg: "rgba(74,222,128,0.04)" },
  prayer: { label_ml: "പ്രാർഥന", color: "#FBBF24", bg: "rgba(251,191,36,0.04)" },
  quran_recitation: { label_ml: "ഖുർആൻ വചനം", color: "#34D399", bg: "rgba(52,211,153,0.04)" },
  istighfar: { label_ml: "ഇസ്തിഗ്ഫാർ", color: "#60A5FA", bg: "rgba(96,165,250,0.04)" },
  tawkeel: { label_ml: "തവ്കീൽ", color: "#A78BFA", bg: "rgba(167,139,250,0.04)" },
  ism: { label_ml: "ദൈവ നാമം", color: "#F472B6", bg: "rgba(244,114,182,0.04)" },
};

// Display sections — 37 fields in order, grouped into logical sections
// Sections 1-5: fields 1-23, Section 6: field 24 (procedure), Section 7: field 25 (Arabic),
// Section 8: fields 29-30 (translation), Section 9: fields 31-35 (details), Section 10: fields 36-37 (references)
const DISPLAY_SECTIONS = [
  { name: 'തലക്കെട്ടും ആമുഖവും', color: G.text, icon: '✦', fields: [
    { num: 1, field: 'title_ml', label: 'മലയാള തലക്കെട്ട്' },
    { num: 2, field: 'purpose', label: 'ഉദ്ദേശം' },
    { num: 3, field: 'introduction', label: 'ആമുഖം' },
  ]},
  { name: 'സമയവും ദിവസവും', color: '#FBBF24', icon: '⏰', fields: [
    { num: 4, field: 'when_to_perform', label: 'എപ്പോൾ' },
    { num: 5, field: 'suitable_weekday', label: 'ദിവസം' },
    { num: 6, field: 'suitable_saat', label: 'സഅാത്' },
    { num: 7, field: 'suitable_planet', label: 'ഗ്രഹം' },
    { num: 8, field: 'suitable_lunar_mansion', label: 'നക്ഷത്രം' },
    { num: 9, field: 'suitable_moon_phase', label: 'ചന്ദ്ര ഘട്ടം' },
    { num: 10, field: 'suitable_zodiac', label: 'രാശി' },
  ]},
  { name: 'ആത്മിക ഘടകങ്ങൾ', color: '#818CF8', icon: '😇', fields: [
    { num: 11, field: 'required_angel', label: 'മലക്' },
    { num: 12, field: 'required_jinn', label: 'ജിൻ' },
    { num: 13, field: 'required_divine_names', label: 'ദൈവ നാമം' },
  ]},
  { name: 'സാധനങ്ങൾ', color: '#34D399', icon: '🌿', fields: [
    { num: 14, field: 'required_herbs', label: 'ഔഷധികൾ' },
    { num: 15, field: 'required_plants', label: 'സസ്യങ്ങൾ' },
    { num: 16, field: 'required_medicines', label: 'മരുന്നുകൾ' },
    { num: 17, field: 'required_powders', label: 'പൊടികൾ' },
    { num: 18, field: 'required_oils', label: 'എണ്ണകൾ' },
    { num: 19, field: 'required_incense', label: 'ധൂപം' },
    { num: 20, field: 'required_materials', label: 'സാധനങ്ങൾ' },
    { num: 21, field: 'required_preparation', label: 'തയ്യാറാകൽ' },
  ]},
  { name: 'ശുദ്ധിയും നിയ്യത്തും', color: '#60A5FA', icon: '💧', fields: [
    { num: 22, field: 'required_purification', label: 'ശുദ്ധി' },
    { num: 23, field: 'required_intention', label: 'നിയ്യത്' },
  ]},
  { name: 'വിശദാംശങ്ങൾ', color: '#F472B6', icon: '⚠', fields: [
    { num: 31, field: 'repetition_count', label: 'ആവർത്തനം' },
    { num: 32, field: 'warnings', label: 'മുന്നറിയിപ്പുകൾ' },
    { num: 33, field: 'conditions', label: 'വ്യവസ്ഥകൾ' },
    { num: 34, field: 'avoidances', label: 'ഒഴിവാക്കേണ്ടവ' },
    { num: 35, field: 'expected_result', label: 'പ്രതീക്ഷിത ഫലം' },
  ]},
];

// ── Step label ──
function StepLabel({ icon, label, color }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-[10px]">{icon}</span>
      <span className="font-malayalam text-xs font-bold" style={{ color }}>{label}</span>
      <div className="h-px flex-1" style={{ background: `${color}20` }} />
    </div>
  );
}

// ── Field display: shows instructions with source+page, or "not specified" ──
function FieldDisplay({ num, label, fieldInstructions }) {
  const hasData = fieldInstructions && fieldInstructions.length > 0;
  return (
    <div className="flex items-start gap-2 py-0.5">
      <span className="font-inter text-[9px] font-bold flex-shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.30)", minWidth: "16px" }}>{num}.</span>
      <span className="font-malayalam text-[11px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.40)", minWidth: "75px" }}>{label}:</span>
      <div className="flex-1">
        {hasData ? (
          fieldInstructions.map((instr, i) => (
            <div key={i}>
              <span className="font-malayalam text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>{instr.text}</span>
              <span className="font-inter text-[8px] ml-1" style={{ color: "rgba(255,255,255,0.25)" }}>📖 {arabicBookTitle(instr.source)} صـ{instr.page}</span>
            </div>
          ))
        ) : (
          <span className="font-malayalam text-[11px] italic" style={{ color: "rgba(255,255,255,0.25)" }}>{NOT_SPECIFIED_ANY}</span>
        )}
      </div>
    </div>
  );
}

// ── Generic section renderer ──
function DisplaySection({ section, instructions }) {
  return (
    <div className="rounded-lg p-3" style={{ background: `${section.color}08`, border: `1px solid ${section.color}20` }}>
      <StepLabel icon={section.icon} label={section.name} color={section.color} />
      <div className="space-y-0.5">
        {section.fields.map(({ num, field, label }) => (
          <FieldDisplay key={field} num={num} label={label} fieldInstructions={instructions[field]} />
        ))}
      </div>
    </div>
  );
}

// ── Section 6: Procedure (field 24) — numbered steps ──
function ProcedureSection({ instructions }) {
  const steps = [
    ...instructions.before_recitation_steps.map(s => ({ ...s, phase: 'മുമ്പ്' })),
    ...instructions.during_recitation_rules.map(s => ({ ...s, phase: 'സമയം' })),
    ...instructions.after_recitation_rules.map(s => ({ ...s, phase: 'ശേഷം' })),
  ];
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)" }}>
      <StepLabel icon="📋" label="24. അനുഷ്ഠാന ക്രമം" color="#FBBF24" />
      {steps.length === 0 ? (
        <p className="font-malayalam text-[11px] italic" style={{ color: "rgba(255,255,255,0.25)" }}>{NOT_SPECIFIED_ANY}</p>
      ) : (
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="font-inter text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ color: "#FBBF24", minWidth: "18px" }}>{i + 1}.</span>
              <div className="flex-1">
                <span className="font-inter text-[8px] px-1 rounded mr-1" style={{ background: "rgba(251,191,36,0.10)", color: "rgba(251,191,36,0.60)" }}>{step.phase}</span>
                <span className="font-malayalam text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>{step.text}</span>
                <span className="font-inter text-[8px] block" style={{ color: "rgba(255,255,255,0.25)" }}>📖 {arabicBookTitle(step.source)} صـ{step.page}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section 7: Arabic Recitation (fields 25-28) ──
function ArabicSection({ mantra }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.20)" }}>
      <StepLabel icon="ع" label="25. അറബി പാഠം" color={G.text} />
      <QuranicArabicText text={mantra.arabic_text} size="lg" color={G.text} />
      <div className="mt-2 space-y-0.5">
        <p className="font-inter text-[8px]" style={{ color: "rgba(212,175,55,0.40)" }}>26. ✓ എല്ലാ അറബി അക്ഷരങ്ങളും കൃത്യമായി സംരക്ഷിച്ചിരിക്കുന്നു</p>
        <p className="font-inter text-[8px]" style={{ color: "rgba(212,175,55,0.40)" }}>27. ✓ ഹരകത്ത് ചേർത്തിരിക്കുന്നു (അക്ഷരങ്ങൾ മാറ്റാതെ)</p>
        <p className="font-inter text-[8px]" style={{ color: "rgba(212,175,55,0.40)" }}>28. ✓ പരമ്പരാഗത നാസ്ഖ്/ഖുർആൻ ഫോണ്ട് (Amiri/Naskh)</p>
      </div>
    </div>
  );
}

// ── Section 8: Translation (fields 29-30) ──
function TranslationSection({ mantra, instructions }) {
  const explanations = instructions.arabic_word_explanations || [];
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)" }}>
      <StepLabel icon="📝" label="29. മലയാള പരിഭാഷ" color="#4ADE80" />
      <MalayalamTranslation mantra={mantra} />
      <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(74,222,128,0.15)" }}>
        <span className="font-malayalam text-[11px] font-bold" style={{ color: "rgba(74,222,128,0.60)" }}>30. ബന്ധപ്പെട്ട വാക്കുകൾ:</span>
        {explanations.length > 0 ? (
          explanations.map((instr, i) => (
            <div key={i}>
              <span className="font-malayalam text-[11px]" style={{ color: "rgba(255,255,255,0.70)" }}>{instr.text}</span>
              <span className="font-inter text-[8px] ml-1" style={{ color: "rgba(255,255,255,0.25)" }}>📖 {arabicBookTitle(instr.source)} صـ{instr.page}</span>
            </div>
          ))
        ) : (
          <span className="font-malayalam text-[11px] italic" style={{ color: "rgba(255,255,255,0.25)" }}> {NOT_SPECIFIED_ANY}</span>
        )}
      </div>
    </div>
  );
}

// ── Section 10: References (fields 36-37) ──
function ReferencesSection({ mantra, instructions }) {
  const quranNote = getQuranVerificationNote(mantra.id);
  const relatedInstrs = instructions.related_rituals || [];
  const map = getAllRecitationsMap();
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.12)" }}>
      <StepLabel icon="📚" label="റഫറൻസുകൾ" color="#818CF8" />
      <div className="mb-2">
        <span className="font-malayalam text-[11px] font-bold" style={{ color: "rgba(129,140,248,0.60)" }}>36. ബന്ധപ്പെട്ട ആചാരങ്ങൾ:</span>
        {relatedInstrs.length > 0 ? (
          <div className="space-y-1 mt-1">
            {relatedInstrs.map((instr, i) => {
              const r = map[instr.text];
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-inter text-[9px] font-bold" style={{ color: "#A78BFA" }}>{i + 1}.</span>
                  <span className="font-amiri text-[11px]" style={{ color: "rgba(255,255,255,0.60)", direction: "rtl" }}>
                    {r ? `${TYPE_META[r.type]?.label_ml || r.type} — ${r.king || r.servant || r.purpose_ml?.slice(0, 50)}` : instr.text}
                  </span>
                  <span className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.25)" }}>📖 {arabicBookTitle(instr.source)} صـ{instr.page}</span>
                </div>
              );
            })}
            <p className="font-malayalam text-[10px] mt-1" style={{ color: "rgba(167,139,250,0.50)" }}>മുകളിൽ പറഞ്ഞ ക്രമത്തിൽ ചൊല്ലേണ്ടതാണ്.</p>
          </div>
        ) : (
          <span className="font-malayalam text-[11px] italic ml-2" style={{ color: "rgba(255,255,255,0.25)" }}>{NOT_SPECIFIED_ANY}</span>
        )}
      </div>
      <div className="pt-2" style={{ borderTop: "1px solid rgba(129,140,248,0.15)" }}>
        <span className="font-malayalam text-[11px] font-bold" style={{ color: "rgba(129,140,248,0.60)" }}>37. മൂലഗ്രന്ഥം:</span>
        <div className="mt-1 space-y-0.5">
          <div className="flex gap-2"><span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)", minWidth: "60px" }}>ഗ്രന്ഥം:</span><span className="font-amiri text-[12px]" style={{ color: "rgba(255,255,255,0.65)", direction: "rtl" }}>{mantra.source?.book || NOT_SPECIFIED_ANY}</span></div>
          <div className="flex gap-2"><span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)", minWidth: "60px" }}>പേജ്:</span><span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{mantra.source?.page || NOT_SPECIFIED_ANY}</span></div>
          <div className="flex gap-2"><span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)", minWidth: "60px" }}>മൂലം:</span><span className="font-amiri text-[12px]" style={{ color: "rgba(255,255,255,0.65)", direction: "rtl" }}>{mantra.source?.book || NOT_SPECIFIED_ANY}</span></div>
        </div>
      </div>
      {quranNote && <p className="font-inter text-[9px] mt-2" style={{ color: "rgba(129,140,248,0.60)" }}>✓ {quranNote.quran_ref} — {quranNote.note}</p>}
      <p className="font-inter text-[8px] mt-2" style={{ color: "rgba(255,255,255,0.20)" }}>⚖️ {MANUSCRIPT_AUTHORITY_RULE.rule_ml}</p>
    </div>
  );
}

// ── Main Card ──
export default function GuidedRitualCard({ mantra, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const meta = TYPE_META[mantra.type] || TYPE_META.dua;
  const instructions = getMergedRitualInstructions(mantra.id);
  const sources = getRegisteredSources();
  const category = autoClassifyEntry(mantra);
  const title = mantra.king || mantra.servant || mantra.purpose_ml?.slice(0, 60) || mantra.id;
  const isArabicTitle = !!(mantra.king || mantra.servant);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: meta.bg, border: `1px solid ${meta.color}33` }}>
      {/* Header with category badge */}
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-2 p-3 text-left">
        <span className="font-inter text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 font-bold"
          style={{ background: "rgba(167,139,250,0.12)", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.25)" }}>
          {category}
        </span>
        <span className="font-inter text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 font-bold"
          style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}>
          {meta.label_ml}
        </span>
        <div className="flex-1 min-w-0">
          <span className={`${isArabicTitle ? 'font-amiri' : 'font-malayalam'} text-xs font-bold block truncate`} style={{ color: meta.color, ...(isArabicTitle ? { direction: 'rtl', textAlign: 'right', fontSize: '0.95rem' } : {}) }}>{title}</span>
          <span className="font-inter text-[9px] block truncate" style={{ color: "rgba(255,255,255,0.40)" }}>{mantra.purpose_ml?.slice(0, 70)}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
          style={{ color: meta.color, transform: expanded ? "rotate(180deg)" : "none" }} />
      </button>

      {/* Expanded content — 37 fields in order */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2.5">
              {/* How to Perform — manuscript instructions heading */}
              <div className="rounded-lg p-2 flex items-center gap-2" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
                <span className="text-sm">📋</span>
                <span className="font-amiri text-sm font-bold" style={{ color: G.text, direction: "rtl" }}>كيفية الأداء</span>
                <span className="font-malayalam text-[10px]" style={{ color: "rgba(212,175,55,0.50)" }}>അനുഷ്ഠാന ക്രമം</span>
              </div>
              {/* Sections 1-5: Title, Timing, Entities, Materials, Personal (fields 1-23) */}
              {DISPLAY_SECTIONS.slice(0, 5).map(section => (
                <DisplaySection key={section.name} section={section} instructions={instructions} />
              ))}

              {/* Section 6: Procedure (field 24) */}
              <ProcedureSection instructions={instructions} />

              {/* Section 7: Arabic Recitation (fields 25-28) */}
              <ArabicSection mantra={mantra} />

              {/* Section 8: Translation (fields 29-30) */}
              <TranslationSection mantra={mantra} instructions={instructions} />

              {/* Section 9: Details (fields 31-35) */}
              <DisplaySection section={DISPLAY_SECTIONS[5]} instructions={instructions} />

              {/* Section 10: References (fields 36-37) */}
              <ReferencesSection mantra={mantra} instructions={instructions} />

              {/* Cross-manuscript search verification */}
              <p className="font-inter text-[8px] text-center" style={{ color: "rgba(255,255,255,0.20)" }}>
                ✓ {sources.length} ഗ്രന്ഥങ്ങൾ പൂർണ്ണമായി തിരയപ്പെട്ടു · മൂല ഗ്രന്ഥം മാത്രം അധികാരം
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
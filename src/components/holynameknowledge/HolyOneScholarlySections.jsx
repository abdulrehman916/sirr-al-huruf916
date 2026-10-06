import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, BookOpen, ScrollText, Sparkles, Shield, Square, Star, Hand, Gift, AlertTriangle, Clock, Hash, ListChecks, Type, Languages, Library, History } from "lucide-react";
import { useIsOwner } from "@/hooks/useIsOwner";

// ═══════════════════════════════════════════════════════════════
// HolyOneScholarlySections — Section-B-only scholarly library panel.
// Renders EVERY append-only array field on HolyOnePDFName so the
// stored scholarly research is actually visible in the UI.
// ISOLATED — reads only Section B card props. Never touches
// Section A or Section C. No calculations copied from elsewhere.
// ═══════════════════════════════════════════════════════════════

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
};

const SECTIONS = [
  { key: "scholarly_entries", icon: BookOpen,   label_ml: "പണ്ഡിത വിവരങ്ങൾ",          label_en: "Scholarly Entries" },
  { key: "mujarrabat",        icon: Sparkles,   label_ml: "മുജർറബത് (പരീക്ഷിതം)",     label_en: "Mujarrabāt (Tested)" },
  { key: "amal",             icon: ScrollText, label_ml: "അമൽ (ആചാരങ്ങൾ)",          label_en: "ʿAmal (Ritual Works)" },
  { key: "dua",              icon: Hand,        label_ml: "ദുആ (പ്രാർത്ഥനകൾ)",         label_en: "Duʿāʾ (Supplications)" },
  { key: "wazifa",           icon: ScrollText,  label_ml: "വസീഫ (വിർദ്/ഹിസ്ബ്)",       label_en: "Wazīfa / Wird / Ḥizb" },
  { key: "khawass",          icon: Sparkles,    label_ml: "ഖവാസ്സ് (ഗുണങ്ങൾ)",         label_en: "Khawāṣṣ (Properties)" },
  { key: "wafq",             icon: Square,      label_ml: "വഫ്ഖ് (മാന്ത്രിക ചതുരം)",    label_en: "Wafq / Awfāq" },
  { key: "talisman",          icon: Star,        label_ml: "തായിസ്മം",                  label_en: "Talismans / Seals" },
  { key: "servitor",          icon: Shield,      label_ml: "ഖാദിം (സേവകൻ)",            label_en: "Khādim / Servitor" },
  { key: "benefits",          icon: Gift,       label_ml: "ആനുകൂല്യങ്ങൾ",              label_en: "Benefits" },
  { key: "warnings",          icon: AlertTriangle, label_ml: "മുന്നറിയിപ്പുകൾ",      label_en: "Warnings" },
  { key: "conditions",        icon: ListChecks,  label_ml: "നിബന്ധനകൾ",               label_en: "Conditions" },
  { key: "timings",           icon: Clock,      label_ml: "സമയങ്ങൾ",                  label_en: "Timings" },
  { key: "repetitions",       icon: Hash,       label_ml: "ആവർത്തന എണ്ണം",            label_en: "Repetitions" },
  { key: "methods",           icon: ListChecks,  label_ml: "രീതികൾ",                  label_en: "Methods" },
];

const VARIANTS = [
  { key: "variant_spellings",       icon: Type, label_ml: "അക്ഷര വ്യതിയാനങ്ങൾ",  label_en: "Variant Spellings" },
  { key: "variant_meanings",        icon: BookOpen, label_ml: "അർത്ഥ വ്യതിയാനങ്ങൾ",  label_en: "Variant Meanings" },
  { key: "variant_pronunciations",  icon: Languages, label_ml: "ഉച്ചാരണ വ്യതിയാനങ്ങൾ", label_en: "Variant Pronunciations" },
];

function CollapsibleSection({ icon: Icon, title_ml, title_en, count, children }) {
  const [open, setOpen] = useState(true);
  if (count === 0) return null;
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: G.bg }}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: G.text }} />
          <span className="font-inter font-semibold text-white text-sm">
            {title_ml} <span className="text-white/40">({title_en})</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(212,175,55,0.15)", color: G.text }}>
            {count}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: G.text }} />
        </div>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-3 space-y-3">
          {children}
        </motion.div>
      )}
    </div>
  );
}

function EntryCard({ entry }) {
  const text = entry?.text || entry?.verbatim_text || "";
  const arabic = entry?.arabic_text || "";
  const malayalam = entry?.malayalam || entry?.exact_meaning || "";
  const isOwner = useIsOwner();
  const sourceBook = entry?.source_book || entry?.source_reference || "";
  const author = entry?.author || "";
  const page = entry?.page || entry?.source_page || "";
  // Source URLs are private — citation (book/author/page) only.
  const lang = entry?.language || "";
  const conf = entry?.confidence || "";
  const cat = entry?.category || "";
  const construction = entry?.construction_method || "";
  const conditions = entry?.conditions || "";
  const reps = entry?.repetitions || "";
  const timing = entry?.timing || "";
  const purpose = entry?.purpose || "";
  const warnings = entry?.warnings || "";
  const notes = entry?.notes || "";

  return (
    <div className="rounded-lg border p-3" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.22)" }}>
      {arabic && (
        <p className="font-amiri text-right text-lg leading-relaxed mb-2" style={{ color: G.text, direction: "rtl" }}>
          {arabic}
        </p>
      )}
      {text && (
        <p className="text-white/85 text-sm leading-relaxed mb-2 whitespace-pre-wrap">{text}</p>
      )}
      {malayalam && (
        <p className="text-white/65 text-sm leading-relaxed mb-2 font-malayalam">{malayalam}</p>
      )}
      {(construction || conditions || reps || timing || purpose || warnings) && (
        <div className="space-y-1 mb-2 text-xs">
          {construction && <p className="text-white/60"><span className="text-gold-dim">Construction:</span> {construction}</p>}
          {conditions && <p className="text-white/60"><span className="text-gold-dim">Conditions:</span> {conditions}</p>}
          {reps && <p className="text-white/60"><span className="text-gold-dim">Repetitions:</span> {reps}</p>}
          {timing && <p className="text-white/60"><span className="text-gold-dim">Timing:</span> {timing}</p>}
          {purpose && <p className="text-white/60"><span className="text-gold-dim">Purpose:</span> {purpose}</p>}
          {warnings && <p className="text-white/60"><span className="text-gold-dim">Warnings:</span> {warnings}</p>}
        </div>
      )}
      {(sourceBook || author || page || lang || conf || cat) && (
        <div className="text-[11px] text-white/45 border-t border-white/5 pt-2 flex flex-wrap gap-x-3 gap-y-1">
          {isOwner && sourceBook && <span>📚 {sourceBook}{author ? ` — ${author}` : ""}</span>}
          {isOwner && page && <span>📄 {page}</span>}
          {lang && <span>🌐 {lang}</span>}
          {conf && <span>⭐ {conf}</span>}
          {cat && <span>🏷 {cat}</span>}
        </div>
      )}
      {notes && (
        <p className="text-[11px] text-white/40 mt-1">{notes}</p>
      )}
    </div>
  );
}

function VariantCard({ entry, type }) {
  const value = entry?.arabic || entry?.meaning || entry?.pronunciation || entry?.text || "";
  const note = entry?.note || "";
  const sourceBook = entry?.source_book || entry?.source_reference || "";
  const page = entry?.source_page || "";
  if (!value) return null;
  return (
    <div className="rounded-lg border p-3" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.22)" }}>
      {type === "spelling" && (
        <p className="font-amiri text-right text-lg mb-1" style={{ color: G.text, direction: "rtl" }}>{value}</p>
      )}
      {type !== "spelling" && (
        <p className="text-white/85 text-sm mb-1">{value}</p>
      )}
      {note && <p className="text-white/55 text-xs mb-1">{note}</p>}
      {(sourceBook || page) && (
        <div className="text-[11px] text-white/45">
          {sourceBook && <span>📚 {sourceBook}</span>}{page && <span> · p.{page}</span>}
        </div>
      )}
    </div>
  );
}

function SourceCard({ src }) {
  const ref = src?.reference || src?.source_book || "";
  // Source URL removed from public view (private library artifact).
  const page = src?.page || src?.source_page || "";
  const notes = src?.notes || "";
  const added = src?.added_at || src?.imported_at || "";
  if (!ref) return null;
  return (
    <div className="rounded-lg border p-3 text-xs" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.22)" }}>
      <p className="text-white/80 font-medium">{ref}</p>
      {page && (
        <p className="text-white/45 mt-1">
          <span>📄 {page}</span>
        </p>
      )}
      {notes && <p className="text-white/40 mt-1">{notes}</p>}
      {added && <p className="text-white/30 mt-1">{new Date(added).toLocaleDateString()}</p>}
    </div>
  );
}

export default function HolyOneScholarlySections({ card }) {
  const c = card || {};
  const isOwner = useIsOwner();

  const sections = useMemo(() => {
    return SECTIONS.map(s => {
      const arr = Array.isArray(c[s.key]) ? c[s.key] : [];
      return { ...s, items: arr, count: arr.length };
    });
  }, [c]);

  const variants = useMemo(() => {
    return VARIANTS.map(v => {
      const arr = Array.isArray(c[v.key]) ? c[v.key] : [];
      return { ...v, items: arr, count: arr.length };
    });
  }, [c]);

  const sources = useMemo(() => Array.isArray(c.sources) ? c.sources : [], [c]);
  const history = useMemo(() => Array.isArray(c.enrichment_history) ? c.enrichment_history : [], [c]);

  if (!card) return null;

  const totalScholarly = sections.reduce((a, s) => a + s.count, 0) + variants.reduce((a, v) => a + v.count, 0);
  if (totalScholarly === 0 && sources.length === 0 && history.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Library className="w-5 h-5" style={{ color: G.text }} />
        <h2 className="font-inter font-semibold text-white">
          പണ്ഡിത ഗ്രന്ഥശാല (Scholarly Library)
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(212,175,55,0.15)", color: G.text }}>
          {sources.length} sources · {history.length} passes
        </span>
      </div>
      <p className="text-[11px] text-white/45 mb-3">
        Append-only scholarly research. Every entry independently sourced. Conflicting opinions kept separate.
      </p>

      {sections.map(s => (
        <CollapsibleSection key={s.key} icon={s.icon} title_ml={s.label_ml} title_en={s.label_en} count={s.count}>
          {s.items.map((entry, i) => (
            <EntryCard key={i} entry={entry} />
          ))}
        </CollapsibleSection>
      ))}

      {variants.map(v => (
        <CollapsibleSection key={v.key} icon={v.icon} title_ml={v.label_ml} title_en={v.label_en} count={v.count}>
          {v.items.map((entry, i) => (
            <VariantCard key={i} entry={entry} type={v.key === "variant_spellings" ? "spelling" : v.key === "variant_meanings" ? "meaning" : "pronunciation"} />
          ))}
        </CollapsibleSection>
      ))}

      {isOwner && (
      <CollapsibleSection icon={Library} title_ml="ഉറവിടങ്ങൾ" title_en="Sources Consulted" count={sources.length}>
        {sources.map((src, i) => (
          <SourceCard key={i} src={src} />
        ))}
      </CollapsibleSection>
      )}

      {isOwner && (
      <CollapsibleSection icon={History} title_ml="സമ്പുഷ്ടന ചരിത്രം" title_en="Enrichment History" count={history.length}>
        {history.map((h, i) => (
          <div key={i} className="rounded-lg border p-3 text-xs" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(212,175,55,0.22)" }}>
            <p className="text-white/80 font-medium">{h.event || "pass"}</p>
            {h.timestamp && <p className="text-white/45 mt-1">{new Date(h.timestamp).toLocaleString()}</p>}
            {h.entries_added != null && <p className="text-white/55 mt-1">Entries added: {h.entries_added}</p>}
            {h.sources_consulted != null && <p className="text-white/55">Sources consulted: {h.sources_consulted}</p>}
            {Array.isArray(h.sections_added) && h.sections_added.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {h.sections_added.map((sec, j) => (
                  <span key={j} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.10)", color: G.text }}>
                    {sec}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </CollapsibleSection>
      )}
    </motion.div>
  );
}
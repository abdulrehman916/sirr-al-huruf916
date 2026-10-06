/**
 * QasamPanel — Read-only Qasam/Recitation display panel
 * All content sourced verbatim from indexed PDF (ManuscriptLibrary ID: 6a4876275f91c72e355cdff8)
 * PDF: كتاب الشروط والأقسام — pages 27–31
 *
 * Display order (per PDF structure):
 *   1. Source verification badge
 *   2. Rule-based selection status
 *   3. General Conditions (الشروط) — relevant to Qasam practice
 *   4. Day-specific info (king, angel, letters)
 *   5. Da'wa (دعوة) — verbatim Arabic
 *   6. Qasam (أقسمت) — verbatim Arabic (Omani refined form)
 *   7. Post-Qasam Du'a — verbatim Arabic
 *   8. Ritual order note from PDF
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scroll, ChevronDown, ShieldCheck, AlertTriangle, CheckCircle2, ListChecks, BookOpen } from "lucide-react";
import {
  resolveQasam,
  GENERAL_CONDITIONS,
  GENERAL_POST_QASAM_DUA,
  OMANI_FORM_NOTE,
  RITUAL_ORDER_NOTE,
  PDF_SOURCE_LABEL,
  PDF_URL,
  VERIFICATION_STATUS,
} from "@/lib/qasamData";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const PLANET_ARABIC = {
  sems: 'الشمس', kamer: 'القمر', merih: 'المريخ', utarid: 'العطارد',
  mustari: 'المشتري', zuhre: 'الزهرة', zuhal: 'الزحل',
};

export default function QasamPanel({ selections }) {
  const [expanded, setExpanded] = useState(false);
  const [showDua, setShowDua] = useState(false);
  const [showConditions, setShowConditions] = useState(false);

  const { entry, conditions } = resolveQasam(selections);

  return (
    <div className="mt-4">
      <div className="rounded-2xl overflow-hidden" style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${G.border}`,
        boxShadow: "0 4px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.07)",
      }}>

        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4"
          style={{ borderBottom: expanded ? `1px solid ${G.border}` : "none" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 100%)",
              border: `1px solid ${G.borderHi}`,
              boxShadow: "0 0 18px rgba(212,175,55,0.15)",
            }}>
              <Scroll className="w-5 h-5" style={{ color: G.text }} />
            </div>
            <div className="text-left">
              <h3 className="font-inter text-base font-bold tracking-wide text-white">
                Recommended Qasam / Recitation
              </h3>
              <p className="font-amiri text-sm" style={{ color: G.dim }}>القسم والدعوة — من مصدر محقق</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 transition-transform flex-shrink-0"
            style={{ color: G.dim, transform: expanded ? "rotate(180deg)" : "none" }} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">

                {/* Source verification */}
                <div className="rounded-xl p-3 space-y-2" style={{
                  background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.18)",
                }}>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(74,222,128,0.65)" }} />
                    <p className="font-inter text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                      <span className="font-bold" style={{ color: "rgba(74,222,128,0.80)" }}>(A) Source:</span>{" "}
                      {PDF_SOURCE_LABEL}. Verbatim from uploaded PDF (pp.27–31). Indexed in ManuscriptLibrary (2026-07-04).
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(74,222,128,0.65)" }} />
                    <p className="font-inter text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>
                      <span className="font-bold" style={{ color: "rgba(74,222,128,0.80)" }}>(B) DB-verified ({VERIFICATION_STATUS.verified_names_db.length}):</span>{" "}
                      {VERIFICATION_STATUS.verified_names_db.map(n => n.arabic).join('، ')} — exact match in internal Holy Names DB.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(96,165,250,0.65)" }} />
                    <p className="font-inter text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>
                      <span className="font-bold" style={{ color: "rgba(96,165,250,0.80)" }}>(C) External-verified ({VERIFICATION_STATUS.verified_harakat_external.length}):</span>{" "}
                      Harakat confirmed from reliable sources — Egyptian Ministry of Awqaf (canonical Asma ul-Husna) for divine names; aqaed.net citing Kitab Ajib al-Malakut for king names. PDF wording unchanged; harakat added only where confirmed with high confidence.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(251,191,36,0.70)" }} />
                    <p className="font-inter text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>
                      <span className="font-bold" style={{ color: "rgba(251,191,36,0.80)" }}>Verification Required ({VERIFICATION_STATUS.verification_required.length}):</span>{" "}
                      Names not confirmable with certainty (e.g. PDF Saturday angel عزرائيل vs external كسفيائيل; PDF Friday king زوبعة vs external الأبيض). Preserved verbatim from PDF as primary — no harakat guessed.
                    </p>
                  </div>
                </div>

                {/* Selection status */}
                {conditions && (
                  <div className="rounded-xl p-3 space-y-2" style={{
                    background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}`,
                  }}>
                    <p className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.text }}>
                      Selection Conditions
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Chip label="Day" value={entry ? entry.dayName : '—'} ok={!!entry} />
                      <Chip label="Planet Hour" value={conditions.hourPlanet ? (PLANET_ARABIC[conditions.hourPlanet] || conditions.hourPlanet) : '—'} ok={!!conditions.hourPlanet} />
                    </div>
                    {entry && conditions.hourPlanet && (
                      <div className="flex items-start gap-2 rounded-lg p-2.5" style={{
                        background: conditions.hourMatchesDay ? "rgba(74,222,128,0.06)" : "rgba(251,191,36,0.06)",
                        border: `1px solid ${conditions.hourMatchesDay ? "rgba(74,222,128,0.25)" : "rgba(251,191,36,0.30)"}`,
                      }}>
                        {conditions.hourMatchesDay
                          ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(74,222,128,0.80)" }} />
                          : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(251,191,36,0.85)" }} />}
                        <p className="font-inter text-[11px] leading-relaxed" style={{
                          color: conditions.hourMatchesDay ? "rgba(186,230,253,0.85)" : "rgba(253,224,138,0.90)",
                        }}>
                          {conditions.hourMatchesDay
                            ? `✓ PDF rule met: planetary hour (${PLANET_ARABIC[conditions.hourPlanet]}) matches selected day's planet.`
                            : `⚠ PDF rule (p.26): call each king only on his own day and in his planet's hour. Selected hour planet (${PLANET_ARABIC[conditions.hourPlanet]}) ≠ day planet (${PLANET_ARABIC[conditions.dayPlanet] || '—'}).`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!entry ? (
                  <div className="rounded-xl p-5 text-center" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                    <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Select a Day in the Mizan to display the corresponding Qasam.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">

                    {/* King / Angel / Letters */}
                    <div className="rounded-xl p-3 space-y-2" style={{
                      background: G.bg, border: `1px solid ${G.borderHi}`,
                    }}>
                      <div className="flex flex-wrap gap-3">
                        <KV label="خادم اليوم" value={entry.khādim} />
                        <KV label="الكوكب" value={entry.planet_arabic} />
                        <KV label="الملك (الدعوة)" value={entry.angel_da3wa || '—'} />
                        <KV label="الملك (القسم)" value={entry.angel_qasam} />
                        <KV label="الحروف" value={entry.huruf} />
                      </div>
                      {entry.angel_da3wa && entry.angel_da3wa !== entry.angel_qasam && (
                        <p className="font-inter text-[10px]" style={{ color: "rgba(251,191,36,0.70)" }}>
                          ⚠ Angel name differs between Da'wa ({entry.angel_da3wa}) and Qasam ({entry.angel_qasam}) — both verbatim from PDF. {entry.pdf_note}
                        </p>
                      )}
                      {entry.quran_ref && (
                        <p className="font-inter text-[10px]" style={{ color: "rgba(74,222,128,0.60)" }}>
                          📖 Quranic reference in text: {entry.quran_ref}
                        </p>
                      )}
                    </div>

                    {/* SECTION 1: General Conditions */}
                    <div className="rounded-xl overflow-hidden" style={{
                      background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}`,
                    }}>
                      <button
                        onClick={() => setShowConditions(!showConditions)}
                        className="w-full flex items-center justify-between px-4 py-2.5"
                        style={{ borderBottom: showConditions ? `1px solid ${G.border}` : "none" }}
                      >
                        <div className="flex items-center gap-2">
                          <ListChecks className="w-4 h-4" style={{ color: G.text }} />
                          <span className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
                            الشروط — General Conditions (PDF pp.8–26)
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 transition-transform"
                          style={{ color: G.dim, transform: showConditions ? "rotate(180deg)" : "none" }} />
                      </button>
                      <AnimatePresence>
                        {showConditions && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="p-3 space-y-2">
                              {GENERAL_CONDITIONS.map((c, i) => (
                                <div key={i} className="rounded-lg p-2.5" style={{
                                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.15)",
                                }}>
                                  <p className="font-inter text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: G.dim }}>
                                    شرط {c.number}{c.sub ? ` (${c.sub})` : ''}
                                  </p>
                                  <p className="font-amiri text-sm text-right leading-loose mb-1" style={{ color: "rgba(255,255,255,0.75)" }} dir="rtl">
                                    {c.arabic}
                                  </p>
                                  <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.50)" }}>
                                    {c.summary_ml}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* SECTION 2: Da'wa — verbatim Arabic */}
                    <ArabicBlock
                      label={`دعوة ${entry.dayName} — Da'wa (PDF p.${entry.da3wa.source_page})`}
                      arabic={entry.da3wa.arabic}
                      note={entry.da3wa.note}
                    />

                    {/* SECTION 3: Qasam — verbatim Arabic (Omani refined form) */}
                    <ArabicBlock
                      label={`القسم — Qasam / Omani Refined Form (PDF p.${entry.qasam.source_page})`}
                      arabic={entry.qasam.arabic}
                      note={entry.qasam.note}
                      highlight
                    />

                    {/* Omani form note */}
                    <div className="rounded-lg p-3" style={{ background: "rgba(212,175,55,0.04)", border: `1px solid ${G.border}` }}>
                      <p className="font-amiri text-sm text-right leading-loose" style={{ color: "rgba(255,255,255,0.65)" }} dir="rtl">
                        {OMANI_FORM_NOTE.arabic}
                      </p>
                      <p className="font-inter text-[10px] mt-1" style={{ color: G.dim }}>
                        PDF p.{OMANI_FORM_NOTE.source_page} — {OMANI_FORM_NOTE.ml}
                      </p>
                    </div>

                    {/* Ritual order note */}
                    <div className="rounded-lg p-3" style={{ background: "rgba(96,165,250,0.04)", border: "1px solid rgba(96,165,250,0.18)" }}>
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "rgba(96,165,250,0.60)" }} />
                        <div>
                          <p className="font-inter text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(96,165,250,0.60)" }}>
                            Ritual Order — PDF p.{RITUAL_ORDER_NOTE.source_page}
                          </p>
                          <p className="font-amiri text-sm text-right leading-loose" style={{ color: "rgba(255,255,255,0.65)" }} dir="rtl">
                            {RITUAL_ORDER_NOTE.arabic}
                          </p>
                          <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.40)" }}>
                            {RITUAL_ORDER_NOTE.ml}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: General Post-Qasam Du'a */}
                    <div>
                      <button
                        onClick={() => setShowDua(!showDua)}
                        className="w-full flex items-center justify-between rounded-lg px-4 py-2.5"
                        style={{ background: G.bg, border: `1px solid ${G.border}` }}
                      >
                        <div className="text-left">
                          <p className="font-inter text-[11px] font-bold uppercase tracking-wider" style={{ color: G.text }}>
                            الدعاء العام بعد القسم — Post-Qasam Du'a (PDF p.{GENERAL_POST_QASAM_DUA.source_page})
                          </p>
                          <p className="font-inter text-[10px]" style={{ color: G.dim }}>
                            {GENERAL_POST_QASAM_DUA.instruction_ml}
                          </p>
                        </div>
                        <ChevronDown className="w-4 h-4 transition-transform flex-shrink-0"
                          style={{ color: G.dim, transform: showDua ? "rotate(180deg)" : "none" }} />
                      </button>
                      <AnimatePresence>
                        {showDua && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="pt-2">
                              <ArabicBlock label="" arabic={GENERAL_POST_QASAM_DUA.arabic}
                                note={`Quranic verse embedded: ${GENERAL_POST_QASAM_DUA.quran_embedded}`} />
                              <p className="font-amiri text-sm text-right leading-loose px-4 pt-2"
                                style={{ color: "rgba(255,255,255,0.55)" }} dir="rtl">
                                {GENERAL_POST_QASAM_DUA.instruction_arabic}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ArabicBlock({ label, arabic, note, highlight }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: highlight
        ? "linear-gradient(145deg, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.03) 100%)"
        : "rgba(255,255,255,0.02)",
      border: `1px solid ${highlight ? G.borderHi : G.border}`,
      boxShadow: highlight ? "0 0 20px rgba(212,175,55,0.10)" : "none",
    }}>
      {label ? (
        <div className="px-4 py-2" style={{ borderBottom: `1px solid ${G.border}` }}>
          <p className="font-inter text-[11px] font-bold uppercase tracking-wider" style={{ color: G.text }}>{label}</p>
        </div>
      ) : null}
      <div className="p-4">
        <div className="rounded-lg p-4" style={{ background: "rgba(8,16,38,0.80)", border: `1px solid ${G.border}` }} dir="rtl">
          <p className="font-amiri text-right" style={{
            color: "#F5E6B0",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            lineHeight: "2.4",
            letterSpacing: "0.04em",
            wordSpacing: "0.10em",
            fontWeight: 600,
            fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1, "ss01" 1, "mkmk" 1, "mark" 1',
          }}>
            {arabic}
          </p>
        </div>
        {note && (
          <p className="font-inter text-[10px] mt-2 italic" style={{ color: "rgba(251,191,36,0.60)" }}>⚠ {note}</p>
        )}
      </div>
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{label}</p>
      <p className="font-amiri text-sm font-bold" style={{ color: G.text }}>{value}</p>
    </div>
  );
}

function Chip({ label, value, ok }) {
  return (
    <div className="rounded-lg px-2.5 py-2" style={{
      background: "rgba(255,255,255,0.03)", border: `1px solid ${ok ? G.border : "rgba(255,255,255,0.08)"}`,
    }}>
      <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>{label}</p>
      <p className="font-amiri text-sm font-bold" style={{ color: ok ? G.text : "rgba(255,255,255,0.30)" }}>{value}</p>
    </div>
  );
}
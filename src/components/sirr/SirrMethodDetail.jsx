// ═══════════════════════════════════════════════════════════════
// SIRR METHOD DETAIL — PREMIUM 16-FIELD ISLAMIC LIBRARY DISPLAY
// ═══════════════════════════════════════════════════════════════
// Displays EVERY field found in the manuscript in exact order:
//   1.  Arabic Text (Verified Harakat Version)
//   2.  Original Manuscript Arabic (if different)
//   3.  Malayalam Pronunciation
//   4.  Complete Malayalam Meaning
//   5.  Purpose
//   6.  Method of Use
//   7.  Number of Recitations
//   8.  Best Time / Day / Conditions
//   9.  Required Materials
//   10. Warnings / Restrictions / Conditions
//   11. Benefits
//   12. Source Book
//   13. Original Page Number
//   14. Verification Status
//   15. Cross Verification Sources
//   16. Additional Notes
//
// RULES:
//   - Never invent or guess harakat — AI suppression enforced
//   - "Not specified in the manuscript" for missing fields
//   - Premium Quranic Arabic typography (Amiri/Naskh, large, spaced)
//   - Collapsible cards for long explanations
//   - Arabic visually separated from Malayalam
//   - Original manuscript preserved verbatim, verified version separate
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import {
  ChevronLeft, BookOpen, ZoomIn, X, FileText, Loader2,
  CheckCircle2, AlertCircle, ShieldAlert,
} from "lucide-react";
import { lookupVerifiedArabic } from "@/lib/verifiedArabicDatabase";
import SirrRelatedPreparations from "./SirrRelatedPreparations";
import CollapsibleCard from "./CollapsibleCard";
import { getLanguageContent, hasTurkish } from "@/lib/sirrTurkishGuard";

const NOT_SPECIFIED_ML = "ഗ്രന്ഥത്തിൽ വ്യക്തമാക്കാത്തത്";
const NOT_SPECIFIED_EN = "Not specified in the manuscript";

// ── Premium Arabic Typography ──
function ArabicPremiumText({ text, accent, size = "lg" }) {
  if (!text) return null;
  const fontSize =
    size === "xl" ? "clamp(1.75rem, 4.5vw, 2.25rem)"
    : size === "lg" ? "clamp(1.5rem, 4vw, 2rem)"
    : size === "md" ? "clamp(1.25rem, 3vw, 1.5rem)"
    : "clamp(1rem, 2.5vw, 1.25rem)";

  return (
    <p
      className="selectable"
      style={{
        fontFamily: "'Amiri', 'Noto Naskh Arabic', 'Scheherazade New', serif",
        fontWeight: 700,
        fontSize,
        letterSpacing: "0.06em",
        wordSpacing: "0.15em",
        lineHeight: 3.0,
        color: accent,
        direction: "rtl",
        textAlign: "center",
        textShadow: `0 0 24px ${accent}30`,
        padding: "1rem 0.5rem",
        margin: 0,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1, "ss01" 1, "mkmk" 1, "mark" 1',
        overflowWrap: "break-word",
        wordBreak: "normal",
        hyphens: "none",
      }}
    >
      {text}
    </p>
  );
}

// ── Malayalam Text ──
function MalayalamText({ text, color = "rgba(255,255,255,0.80)" }) {
  if (!text) return null;
  return (
    <p
      className="font-malayalam selectable"
      style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)", lineHeight: 1.9, color, margin: 0, whiteSpace: "pre-wrap" }}
    >
      {text}
    </p>
  );
}

// ── Simple Field (shows value or "Not specified") ──
function SimpleField({ value, language, isArabic, accent }) {
  const isMl = language === "ml";
  const notSpecified = isMl ? NOT_SPECIFIED_ML : NOT_SPECIFIED_EN;
  const hasValue = value && String(value).trim().length > 0;

  if (!hasValue) {
    return (
      <p className={`text-sm ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.25)" }}>
        {notSpecified}
      </p>
    );
  }
  if (isArabic) {
    return <ArabicPremiumText text={value} accent={accent} size="md" />;
  }
  return isMl ? (
    <MalayalamText text={value} />
  ) : (
    <p className="font-inter text-sm selectable" style={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
      {value}
    </p>
  );
}

// ── Verification Badge ──
function VerificationBadge({ status, confidence, method, language }) {
  const isMl = language === "ml";

  if (status === "verified") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)" }}>
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#4ADE80" }} />
        <div>
          <p className="font-inter text-xs font-bold" style={{ color: "#4ADE80" }}>
            {isMl ? "സ്ഥിരീകരിച്ചു" : "Verified"} · {confidence || "?"}
          </p>
          {method && (
            <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              {isMl ? "രീതി" : "Method"}: {method.replace(/_/g, " ")}
            </p>
          )}
        </div>
      </div>
    );
  }
  if (status === "manual_review_required") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
        <ShieldAlert className="w-4 h-4 flex-shrink-0" style={{ color: "#FBBF24" }} />
        <p className="font-inter text-xs font-bold" style={{ color: "#FBBF24" }}>
          {isMl ? "കൈമാത്ര സ്ഥിരീകരണം ആവശ്യം — ഉറവിടങ്ങൾ തമ്മിൽ ഭിന്നാഭിപ്രായം" : "Manual review required — sources disagree"}
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)" }}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#F87171" }} />
      <p className="font-inter text-xs font-bold" style={{ color: "#F87171" }}>
        {isMl ? "സ്ഥിരീകരണം ലഭ്യമല്ല — വിശ്വസനീയ ഉറവിടം കണ്ടെത്തിയില്ല" : "Verification unavailable — no trusted source found"}
      </p>
    </div>
  );
}

// ── Image Viewer (preserved from original) ──
function ImageViewer({ images, accent }) {
  const [fullscreen, setFullscreen] = useState(null);
  const [zoom, setZoom] = useState(1);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {images.map((url, idx) => (
          <button key={idx} onClick={() => { setFullscreen(url); setZoom(1); }}
            className="relative rounded-lg overflow-hidden" style={{ border: `1px solid ${accent}33` }}>
            <img src={url} alt={`Figure ${idx + 1}`} className="w-full h-32 object-contain" style={{ background: "rgba(0,0,0,0.3)" }} />
            <div className="absolute bottom-1 right-1 rounded p-1" style={{ background: "rgba(0,0,0,0.6)" }}>
              <ZoomIn className="w-3 h-3" style={{ color: accent }} />
            </div>
          </button>
        ))}
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setFullscreen(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full" style={{ background: "rgba(255,255,255,0.10)" }}
            onClick={(e) => { e.stopPropagation(); setFullscreen(null); }}>
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="flex gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="px-3 py-1.5 rounded-lg font-bold text-white" style={{ background: "rgba(255,255,255,0.10)" }}>−</button>
            <span className="px-3 py-1.5 font-inter text-sm text-white" style={{ background: "rgba(255,255,255,0.10)" }}>
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
              className="px-3 py-1.5 rounded-lg font-bold text-white" style={{ background: "rgba(255,255,255,0.10)" }}>+</button>
          </div>
          <img src={fullscreen} alt="Full view" className="max-w-full max-h-[80vh] object-contain transition-transform"
            style={{ transform: `scale(${zoom})` }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT — 16-FIELD PREMIUM DISPLAY
// ═══════════════════════════════════════════════════════════════
export default function SirrMethodDetail({ method, accent, language, onBack, backLabel, onSelectPreparation }) {
  const isMl = language === "ml";
  const notSpecified = isMl ? NOT_SPECIFIED_ML : NOT_SPECIFIED_EN;
  const images = method.images || [];

  // Language-content helper with fallback fields — enforces SIRR global language rule
  const lc = (field, ...fallbacks) => {
    let val = getLanguageContent(method, field, language);
    if (val) return val;
    for (const fb of fallbacks) {
      val = getLanguageContent(method, fb, language);
      if (val) return val;
    }
    return null;
  };

  // ── Verified Arabic lookup ──
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [loadingVerified, setLoadingVerified] = useState(true);

  useEffect(() => {
    if (!method.arabic_text) {
      setLoadingVerified(false);
      return;
    }
    let cancelled = false;
    const sourceType =
      method.type === "ism" ? "divine_name"
      : method.type === "quran_recitation" ? "quran"
      : "manuscript_quotation";
    lookupVerifiedArabic(
      method.arabic_text, sourceType, method.book_name, method.page_number,
      undefined, method.arabic_text, method.book_name
    )
      .then((data) => { if (!cancelled) { setVerifiedResult(data); setLoadingVerified(false); } })
      .catch(() => {
        if (!cancelled) {
          setVerifiedResult({ verification_status: "unverified", arabic_text: method.arabic_text });
          setLoadingVerified(false);
        }
      });
    return () => { cancelled = true; };
  }, [method.arabic_text]);

  // ── Derived values ──
  const verifiedArabic = verifiedResult?.arabic_text || method.arabic_text;
  const showOriginalDiff = verifiedResult?.original_manuscript_text
    && verifiedResult.original_manuscript_text !== verifiedResult?.arabic_text;
  const malayalamMeaning = verifiedResult?.malayalam_meaning || method.malayalam_meaning;
  const verificationStatus = verifiedResult?.verification_status || "unverified";
  const verificationConfidence = verifiedResult?.verification_confidence || "UNVERIFIED";
  const verificationMethod = verifiedResult?.verification_method;
  const crossVerificationSources = verifiedResult?.cross_verification_sources || [];
  const primarySource = verifiedResult?.primary_source;
  const secondarySources = verifiedResult?.secondary_sources || [];

  // ── Timing combination (section 8) — Turkish guard applied ──
  const timingParts = [];
  const timingVal = lc('timing');
  if (timingVal) timingParts.push(isMl ? `സമയം: ${timingVal}` : `Time: ${timingVal}`);
  const dayVal = lc('day', 'suitable_day');
  if (dayVal) timingParts.push(isMl ? `ദിവസം: ${dayVal}` : `Day: ${dayVal}`);
  const planetVal = lc('planet');
  if (planetVal) timingParts.push(isMl ? `ഗ്രഹം: ${planetVal}` : `Planet: ${planetVal}`);
  const incenseVal = lc('incense');
  if (incenseVal) timingParts.push(isMl ? `ധൂപം: ${incenseVal}` : `Incense: ${incenseVal}`);
  const conditionsVal = lc('conditions');
  if (conditionsVal) timingParts.push(isMl ? `വ്യവസ്ഥകൾ: ${conditionsVal}` : `Conditions: ${conditionsVal}`);
  const timingCombined = timingParts.join("\n");

  return (
    <div className="space-y-3">
      {/* Back button */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft className="w-4 h-4" /> {backLabel || (isMl ? "രീതികൾ" : "Methods")}
        </button>
      </div>

      {/* Book & Page header */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}>
        <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
        {method.book_name_ar && (
          <span className="font-amiri text-sm flex-shrink-0" style={{ color: accent, direction: "rtl" }}>
            {method.book_name_ar}
          </span>
        )}
        <span className="font-inter text-[10px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.40)" }}>
          {method.book_title || method.book_name}
        </span>
        <span className="flex-1"></span>
        <span className="font-inter text-[10px] flex items-center gap-1" style={{ color: accent }}>
          <FileText className="w-3 h-3" /> {isMl ? "പേജ്" : "p."} {method.page_number || notSpecified}
        </span>
      </div>

      {/* ══ 1. Arabic Text (Verified Harakat Version) ══ */}
      <CollapsibleCard sectionNumber={1} title="Arabic Text (Verified Harakat)" titleMl="അറബി പാഠം (സ്ഥിരീകരിച്ച ഹരകത്തോടെ)" accent={accent} language={language} defaultOpen={true}>
        {loadingVerified ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: accent }} />
          </div>
        ) : verifiedArabic ? (
          <ArabicPremiumText text={verifiedArabic} accent={accent} size="lg" />
        ) : (
          <p className={`text-center text-sm ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.25)" }}>
            {notSpecified}
          </p>
        )}
      </CollapsibleCard>

      {/* ══ 2. Original Manuscript Arabic (if different) ══ */}
      {showOriginalDiff && (
        <CollapsibleCard sectionNumber={2} title="Original Manuscript Arabic" titleMl="മൂല ഗ്രന്ഥ അറബി പാഠം" accent={accent} language={language} defaultOpen={true}>
          <ArabicPremiumText text={verifiedResult.original_manuscript_text} accent="rgba(255,255,255,0.50)" size="md" />
          <p className="font-inter text-[8px] text-center mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
            📜 {isMl ? "മൂല ഗ്രന്ഥത്തിൽ നിന്ന് കൃത്യമായി സംരക്ഷിച്ചത്" : "Preserved verbatim from the original manuscript"}
          </p>
        </CollapsibleCard>
      )}

      {/* ══ 3. Malayalam Pronunciation ══ */}
      <CollapsibleCard sectionNumber={3} title="Malayalam Pronunciation" titleMl="മലയാള ഉച്ചാരണം" accent={accent} language={language} defaultOpen={true}>
        <SimpleField value={!hasTurkish(method.malayalam_pronunciation) ? method.malayalam_pronunciation : null} language={language} accent={accent} />
      </CollapsibleCard>

      {/* ══ 4. Complete Malayalam Meaning ══ */}
      <CollapsibleCard sectionNumber={4} title="Complete Malayalam Meaning" titleMl="സമ്പൂർണ്ണ മലയാള അർത്ഥം" accent={accent} language={language} defaultOpen={true}>
        <SimpleField value={!hasTurkish(malayalamMeaning) ? malayalamMeaning : null} language={language} accent={accent} />
      </CollapsibleCard>

      {/* ══ 5. Purpose ══ */}
      <CollapsibleCard sectionNumber={5} title="Purpose" titleMl="ഉദ്ദേശ്യം" accent={accent} language={language} defaultOpen={true}>
        <SimpleField value={lc('purpose')} language={language} accent={accent} />
      </CollapsibleCard>

      {/* ══ 6. Method of Use ══ */}
      <CollapsibleCard sectionNumber={6} title="Method of Use" titleMl="ഉപയോഗിക്കേണ്ട രീതി" accent={accent} language={language} defaultOpen={true}>
        <SimpleField value={lc('procedure', 'usage', 'preparation')} language={language} accent={accent} />
      </CollapsibleCard>

      {/* ══ 7. Number of Recitations ══ */}
      <CollapsibleCard sectionNumber={7} title="Number of Recitations" titleMl="ആവർത്തന എണ്ണം" accent={accent} language={language} defaultOpen={true}>
        <SimpleField value={lc('repetition')} language={language} accent={accent} />
      </CollapsibleCard>

      {/* ══ 8. Best Time / Day / Conditions ══ */}
      <CollapsibleCard sectionNumber={8} title="Best Time / Day / Conditions" titleMl="ഉത്തമ സമയം / ദിവസം / വ്യവസ്ഥകൾ" accent={accent} language={language} defaultOpen={true}>
        <SimpleField value={timingCombined} language={language} accent={accent} />
      </CollapsibleCard>

      {/* ══ 9. Required Materials ══ */}
      <CollapsibleCard sectionNumber={9} title="Required Materials" titleMl="ആവശ്യമായ വസ്തുക്കൾ" accent={accent} language={language} defaultOpen={true}>
        <SimpleField value={lc('materials')} language={language} accent={accent} />
      </CollapsibleCard>

      {/* ══ 10. Warnings / Restrictions / Conditions ══ */}
      <CollapsibleCard sectionNumber={10} title="Warnings / Restrictions" titleMl="മുന്നറിയിപ്പുകൾ / നിയന്ത്രണങ്ങൾ" accent={accent} language={language} defaultOpen={true}>
        <SimpleField value={lc('warnings', 'warning', 'forbidden')} language={language} accent={accent} />
      </CollapsibleCard>

      {/* ══ 11. Benefits ══ */}
      <CollapsibleCard sectionNumber={11} title="Benefits" titleMl="ഗുണങ്ങൾ" accent={accent} language={language} defaultOpen={true}>
        <SimpleField value={lc('benefits', 'suitable')} language={language} accent={accent} />
      </CollapsibleCard>

      {/* Images (Wafq, Taweez, Seals, Diagrams) */}
      {images.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: `${accent}08`, border: `1px solid ${accent}22` }}>
          <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: `${accent}99` }}>
            {isMl ? "ചിത്രങ്ങൾ / വഫ്പ് / താവീസ്" : "Images / Wafq / Taweez"}
          </p>
          <ImageViewer images={images} accent={accent} />
        </div>
      )}

      {/* ══ 12. Source Book ══ */}
      <CollapsibleCard sectionNumber={12} title="Source Book" titleMl="ഉറവിട ഗ്രന്ഥം" accent={accent} language={language} defaultOpen={true}>
        <div className="flex items-center gap-2 flex-wrap">
          {method.book_name_ar && (
            <span className="font-amiri text-base" style={{ color: accent, direction: "rtl" }}>
              {method.book_name_ar}
            </span>
          )}
          <span className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.70)" }}>
            {method.book_title || method.book_name}
          </span>
        </div>
        {method.source_scholar && (
          <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.40)" }}>
            {isMl ? "ഉറവിട പണ്ഡിതൻ" : "Source Scholar"}: {method.source_scholar}
          </p>
        )}
      </CollapsibleCard>

      {/* ══ 13. Original Page Number ══ */}
      <CollapsibleCard sectionNumber={13} title="Original Page Number" titleMl="മൂല പേജ് നമ്പർ" accent={accent} language={language} defaultOpen={true}>
        <SimpleField value={method.page_number} language={language} accent={accent} />
      </CollapsibleCard>

      {/* ══ 14. Verification Status ══ */}
      <CollapsibleCard sectionNumber={14} title="Verification Status" titleMl="സ്ഥിരീകരണ നില" accent={accent} language={language} defaultOpen={true}>
        {loadingVerified ? (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: accent }} />
          </div>
        ) : (
          <VerificationBadge
            status={verificationStatus}
            confidence={verificationConfidence}
            method={verificationMethod}
            language={language}
          />
        )}
        <p className="font-inter text-[8px] text-center mt-2" style={{ color: "rgba(255,255,255,0.20)" }}>
          ⚖️ {isMl ? "സ്വാഭാവികത പൂർണ്ണതയേക്കാൾ പ്രധാനം. ഹരകത്തോ അറബിയോ കണ്ടുപിടിക്കില്ല." : "Authenticity is more important than completeness. Never invent Arabic or harakat."}
        </p>
      </CollapsibleCard>

      {/* ══ 15. Cross Verification Sources ══ */}
      <CollapsibleCard sectionNumber={15} title="Cross Verification Sources" titleMl="ക്രോസ് സ്ഥിരീകരണ ഉറവിടങ്ങൾ" accent={accent} language={language} defaultOpen={true}>
        {primarySource || secondarySources.length > 0 || crossVerificationSources.length > 0 ? (
          <div className="space-y-1.5">
            {primarySource && (
              <div className="flex items-start gap-2">
                <span className="font-inter text-[9px] font-bold flex-shrink-0" style={{ color: `${accent}99` }}>
                  {isMl ? "പ്രാഥമികം" : "Primary"}:
                </span>
                <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>
                  {primarySource}
                </span>
              </div>
            )}
            {secondarySources.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-inter text-[9px] font-bold flex-shrink-0" style={{ color: `${accent}99` }}>
                  {isMl ? "ദ്വിതീയ" : "Secondary"}:
                </span>
                <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>
                  {secondarySources.join(" · ")}
                </span>
              </div>
            )}
            {crossVerificationSources.length > 0 && (
              <div className="space-y-0.5">
                {crossVerificationSources.map((url, idx) => (
                  <p key={idx} className="font-inter text-[9px] break-all" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {url}
                  </p>
                ))}
              </div>
            )}
            {verifiedResult?.holy_name_match && (
              <p className="font-inter text-[9px]" style={{ color: "rgba(212,175,55,0.50)" }}>
                ✓ {isMl ? "Holy Names ഡാറ്റാബേസിൽ പൊരുത്തം" : "Matched in Holy Names database"}
              </p>
            )}
            {verifiedResult?.manuscript_match && (
              <p className="font-inter text-[9px]" style={{ color: "rgba(212,175,55,0.50)" }}>
                ✓ {isMl ? "മറ്റ് ഗ്രന്ഥങ്ങളിൽ പൊരുത്തം" : "Matched in other manuscripts"}
              </p>
            )}
          </div>
        ) : (
          <p className={`text-sm ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.25)" }}>
            {notSpecified}
          </p>
        )}
      </CollapsibleCard>

      {/* ══ 16. Additional Notes ══ */}
      <CollapsibleCard sectionNumber={16} title="Additional Notes" titleMl="അധിക കുറിപ്പുകൾ" accent={accent} language={language} defaultOpen={false}>
        <div className="space-y-2.5">
          {method.introduction && (
            <div>
              <p className="font-inter text-[9px] font-bold uppercase mb-0.5" style={{ color: `${accent}99` }}>
                {isMl ? "ആമുഖം" : "Introduction"}
              </p>
              <SimpleField value={lc('introduction')} language={language} accent={accent} />
            </div>
          )}
          <div>
            <p className="font-inter text-[9px] font-bold uppercase mb-0.5" style={{ color: `${accent}99` }}>
              {isMl ? "കുറിപ്പുകൾ" : "Notes"}
            </p>
            <SimpleField value={lc('notes', 'readings')} language={language} accent={accent} />
          </div>
          {/* Mansion-specific fields (if present) */}
          {method.nature && (
            <div>
              <p className="font-inter text-[9px] font-bold uppercase mb-0.5" style={{ color: `${accent}99` }}>
                {isMl ? "സ്വഭാവം" : "Nature"}
              </p>
              <SimpleField value={lc('nature')} language={language} accent={accent} />
            </div>
          )}
          {method.marriage_rule && (
            <div>
              <p className="font-inter text-[9px] font-bold uppercase mb-0.5" style={{ color: `${accent}99` }}>
                {isMl ? "വിവാഹ നിയമം" : "Marriage Rule"}
              </p>
              <SimpleField value={lc('marriage_rule')} language={language} accent={accent} />
            </div>
          )}
          {method.travel_rule && (
            <div>
              <p className="font-inter text-[9px] font-bold uppercase mb-0.5" style={{ color: `${accent}99` }}>
                {isMl ? "യാത്രാ നിയമം" : "Travel Rule"}
              </p>
              <SimpleField value={lc('travel_rule')} language={language} accent={accent} />
            </div>
          )}
          {method.clothing_rule && (
            <div>
              <p className="font-inter text-[9px] font-bold uppercase mb-0.5" style={{ color: `${accent}99` }}>
                {isMl ? "വസ്ത്ര നിയമം" : "Clothing Rule"}
              </p>
              <SimpleField value={lc('clothing_rule')} language={language} accent={accent} />
            </div>
          )}
          {method.farming_rule && (
            <div>
              <p className="font-inter text-[9px] font-bold uppercase mb-0.5" style={{ color: `${accent}99` }}>
                {isMl ? "കൃഷി നിയമം" : "Farming Rule"}
              </p>
              <SimpleField value={lc('farming_rule')} language={language} accent={accent} />
            </div>
          )}
        </div>
      </CollapsibleCard>

      {/* Related Preparations */}
      <SirrRelatedPreparations
        method={method}
        accent={accent}
        language={language}
        onSelectPreparation={onSelectPreparation}
      />

      {/* Footer */}
      <div className="text-center py-3">
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          {isMl ? "ഗ്രന്ഥം" : "Book"}: {method.book_title || method.book_name} · {isMl ? "പേജ്" : "Page"}: {method.page_number || notSpecified}
        </p>
        <p className="font-inter text-[8px] mt-1" style={{ color: "rgba(255,255,255,0.15)" }}>
          ⚖️ {isMl ? "മൂല ഗ്രന്ഥം പ്രാഥമിക അധികാരം. വിവരങ്ങൾ കണ്ടുപിടിക്കുന്നില്ല." : "Manuscript is primary authority. No information invented."}
        </p>
      </div>
    </div>
  );
}
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Check, User, Eye } from "lucide-react";
import { COMMON_KASAM, KASAM_CATEGORIES } from "../../lib/kasamData";

// ── SECTION 4: KASAM — PDF-accurate assembly ──────────────────────────────────
// ISOLATED from Sections 1, 2, 3. No engine calls.
//
// FINAL KASAM ASSEMBLY ORDER (per PDF):
//   1. Common Kasam opening  (أَقْسَمْتُ عَلَيْكُمُ أَيُّهَا الأَرْوَاحُ الرُّوحَانِيَّةُ الْمُشَرَّفَةُ)
//   2. Esma-i A'van          [ESMAİ-AVAN] → يَا Name each
//   3. Purpose phrase        [PURPOSE] → category-specific text with resolved names
//   4. Esma-i Kasem          [ESMAİ-KASEM] → بِحَقِّ Name each
//   5. Common Kasam closing  (بِالْوَاحِدِ الأَحَدِ ... فَسُبْحَانَ ...)
//
// The Common Kasam NEVER disappears. The purpose phrase is NEVER the opener.
// ─────────────────────────────────────────────────────────────────────────────

const G = {
  bg:           "rgba(5, 12, 28, 0.97)",
  bgInner:      "rgba(10, 20, 45, 0.95)",
  bgDeep:       "rgba(3, 8, 22, 0.99)",
  gold:         "#D4AF37",
  goldBright:   "#F5D060",
  goldDim:      "rgba(212,175,55,0.65)",
  goldBorder:   "rgba(212,175,55,0.22)",
  goldBorderHi: "rgba(212,175,55,0.48)",
  goldFaint:    "rgba(212,175,55,0.06)",
  glow:         "rgba(212,175,55,0.10)",
  warn:         "rgba(251,191,36,0.85)",
  warnBg:       "rgba(251,191,36,0.07)",
  warnBorder:   "rgba(251,191,36,0.25)",
  blue:         "rgba(147,197,253,0.85)",
  blueBg:       "rgba(147,197,253,0.06)",
  blueBorder:   "rgba(147,197,253,0.22)",
  green:        "rgba(74,222,128,0.85)",
  purple:       "rgba(196,181,253,0.85)",
  purpleBorder: "rgba(196,181,253,0.22)",
};

const ARABIC_STYLE = {
  fontFamily: "'Scheherazade New', 'Noto Naskh Arabic', 'Amiri', serif",
  fontSize:   "1.3rem",
  lineHeight: 2.8,
  letterSpacing: "0.03em",
  wordSpacing:   "0.12em",
  textRendering: "optimizeLegibility",
  WebkitFontSmoothing: "antialiased",
  fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
};

const ARABIC_FINAL_STYLE = {
  ...ARABIC_STYLE,
  fontSize: "1.4rem",
  lineHeight: 3.2,
  color: "#F5D060",
};

// ── Assembly logic ────────────────────────────────────────────────────────────
// Resolves name and Esma tokens into the Azimet text, then appends Common Kasam closure.
//
// FINAL = [Azimet with A'van + Kasem + Names injected] + [Common Kasam closure]
//
function resolveNames(text, names) {
  if (!text) return "";
  return text
    .replace(/\{maleTargetName\}/g,      names.targetMale      || "فلان")
    .replace(/\{femaleTargetName\}/g,    names.targetFemale    || "فلانة")
    .replace(/\{requesterName\}/g,       names.requesterName   || "فلان")
    .replace(/\{requesterMotherName\}/g, names.requesterMother || "فلانة");
}

// ASSEMBLY ORDER (PDF Pages 76–79):
//   1. COMMON_KASAM.opening
//   2. يَا + Esma-i A'van names
//   3. Purpose Azimet (with resolved names)
//   4. بِحَقِّ + Esma-i Kasem names
//   5. COMMON_KASAM.closing
function assembleFinalKasam(cat, names, avanNames, kasemNames) {
  const avanStr  = Array.isArray(avanNames)  && avanNames.length
    ? avanNames.map(n => `يَا ${n}`).join(" ")      : "";
  const kasemStr = Array.isArray(kasemNames) && kasemNames.length
    ? kasemNames.map(n => `بِحَقِّ ${n}`).join(" ") : "";

  // Resolve name tokens in the azimet text
  const azimet = resolveNames(cat.purposeArabic || "", names);

  // Build full Kasam in exact PDF order
  const parts = [COMMON_KASAM.opening];
  if (avanStr)  parts.push(avanStr);
  if (azimet)   parts.push(azimet);
  if (kasemStr) parts.push(kasemStr);
  parts.push(COMMON_KASAM.closing);

  return parts.join(" ").replace(/\s{2,}/g, " ").trim();
}

function assembleFinalMalayalam(cat, names, avanNames, kasemNames) {
  const avanStr  = Array.isArray(avanNames)  && avanNames.length
    ? avanNames.map(n => `يَا ${n}`).join(" ") : "(Esma-i A'van)";
  const kasemStr = Array.isArray(kasemNames) && kasemNames.length
    ? kasemNames.map(n => `بِحَقِّ ${n}`).join(" ") : "(Esma-i Kasem)";

  const mlText = resolveNames(cat.purposeMalayalam || "", names);

  const parts = [COMMON_KASAM.openingMalayalam];
  if (avanStr !== "(Esma-i A'van)" || Array.isArray(avanNames) && avanNames.length) parts.push(avanStr);
  if (mlText)  parts.push(mlText);
  if (kasemStr !== "(Esma-i Kasem)" || Array.isArray(kasemNames) && kasemNames.length) parts.push(kasemStr);
  parts.push(COMMON_KASAM.closingMalayalam);

  return parts.join(" — ");
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-2 my-2">
      <div style={{ width: 32, height: 0.5, background: `linear-gradient(to right, transparent, ${G.goldBorder})` }} />
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: G.goldFaint, border: `1px solid ${G.goldBorder}` }} />
      <div style={{ width: 32, height: 0.5, background: `linear-gradient(to left, transparent, ${G.goldBorder})` }} />
    </div>
  );
}

function StepBadge({ number, label, color = G.gold, active }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <div className="flex items-center justify-center w-6 h-6 rounded-lg font-inter text-[10px] font-black flex-shrink-0"
        style={{ background: (active ? color : G.goldBorder) + "22", border: `1px solid ${active ? color : G.goldBorder}55`, color: active ? color : G.goldBorder }}>
        {number}
      </div>
      <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: active ? color : G.goldBorder }}>
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${active ? color : G.goldBorder}40, transparent)` }} />
    </div>
  );
}



// ── Purpose selector grid ─────────────────────────────────────────────────────
function PurposeSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {KASAM_CATEGORIES.map((cat, i) => {
        const isSelected = selected?.id === cat.id;
        const hasText = cat.status !== "pending" && !!cat.purposeArabic;
        return (
          <motion.button key={cat.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(isSelected ? null : cat)}
            className="rounded-xl border px-3 py-3 text-left relative"
            style={{
              background:  isSelected ? G.goldFaint : G.bgInner,
              borderColor: isSelected ? G.goldBorderHi : G.goldBorder,
              boxShadow:   isSelected ? `0 0 16px ${G.glow}` : "none",
              WebkitTapHighlightColor: "transparent",
            }}>
            {isSelected && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: G.goldFaint, border: `1px solid ${G.goldBorderHi}` }}>
                <Check className="w-2.5 h-2.5" style={{ color: G.gold }} />
              </div>
            )}
            <span className="text-base leading-none block mb-1">{cat.icon}</span>
            <p className="font-inter text-[9px] font-bold uppercase tracking-wider leading-tight"
              style={{ color: isSelected ? G.gold : "rgba(255,255,255,0.70)" }}>
              {cat.label}
            </p>
            <p className="font-amiri text-sm mt-0.5 leading-snug"
              style={{ color: isSelected ? "#86efac" : "rgba(134,239,172,0.55)" }}>
              {cat.malayalamLabel}
            </p>
            <p className="font-bold mt-0.5" dir="rtl"
              style={{ fontFamily: "'Scheherazade New','Noto Naskh Arabic','Amiri',serif", fontSize: "0.95rem", lineHeight: 1.9, color: isSelected ? G.goldDim : "rgba(255,255,255,0.28)" }}>
              {cat.arabic}
            </p>
            {!hasText && (
              <span className="font-inter text-[6px] uppercase tracking-wider mt-1 block" style={{ color: G.warn }}>
                Pending PDF
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Name input ────────────────────────────────────────────────────────────────
function NameInputBlock({ cat, names, onChange }) {
  const fields = cat.nameFields || [];
  const FIELD_CONFIG = {
    requesterName:   { label: "Requester — اسم الطالب",          placeholder: "أحمد ابن فاطمة",   color: G.blue },
    requesterMother: { label: "Requester Mother — أم الطالب",    placeholder: "فاطمة",             color: G.blue },
    targetMale:      { label: "Male Target — فلان ابن فلانة",    placeholder: "محمد ابن خديجة",   color: G.green },
    targetFemale:    { label: "Female Target — فلانة بنت فلانة", placeholder: "مريم بنت عائشة",   color: G.warn },
  };
  return (
    <div className="space-y-3">
      {fields.map(fieldKey => {
        const cfg = FIELD_CONFIG[fieldKey];
        if (!cfg) return null;
        const val = names[fieldKey] || "";
        return (
          <div key={fieldKey} className="space-y-1">
            <label className="font-inter text-[8px] uppercase tracking-wider font-bold flex items-center gap-1.5"
              style={{ color: cfg.color }}>
              <User className="w-3 h-3" />
              {cfg.label}
            </label>
            <input type="text" dir="rtl" value={val}
              onChange={e => onChange({ ...names, [fieldKey]: e.target.value })}
              placeholder={cfg.placeholder}
              className="w-full rounded-lg px-3 py-2 focus:outline-none"
              style={{
                background: "rgba(4,12,34,0.97)",
                border: `1px solid ${val ? cfg.color.replace("0.85","0.40") : G.goldBorder}`,
                color: "#fff", fontSize: "1rem",
                fontFamily: "'Scheherazade New','Noto Naskh Arabic','Amiri',serif",
              }}
            />
          </div>
        );
      })}
      {Object.values(names).some(Boolean) && (
        <button onClick={() => onChange({ requesterName:"", requesterMother:"", targetMale:"", targetFemale:"" })}
          className="font-inter text-[8px] uppercase tracking-wider px-2.5 py-1 rounded-lg border"
          style={{ color: "rgba(255,255,255,0.30)", borderColor: "rgba(255,255,255,0.12)" }}>
          Clear all names
        </button>
      )}
    </div>
  );
}

// ── Final Kasam output block — always rendered at bottom ─────────────────────
function FinalKasamOutput({ cat, names, avanNames, kasemNames }) {
  const hasCat    = !!cat && cat.status !== "pending" && !!cat.purposeArabic;
  const finalArabic    = hasCat ? assembleFinalKasam(cat, names, avanNames, kasemNames)    : null;
  const finalMalayalam = hasCat ? assembleFinalMalayalam(cat, names, avanNames, kasemNames) : null;

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: hasCat ? "rgba(212,175,55,0.65)" : "rgba(212,175,55,0.22)",
        background:  G.bgDeep,
        boxShadow:   hasCat
          ? "0 0 80px rgba(212,175,55,0.18), inset 0 1px 0 rgba(212,175,55,0.12)"
          : "none",
        transition:  "border-color 0.3s, box-shadow 0.3s",
      }}>

      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3"
        style={{
          borderColor: hasCat ? "rgba(212,175,55,0.30)" : "rgba(212,175,55,0.12)",
          background:  hasCat ? "rgba(212,175,55,0.10)" : "rgba(212,175,55,0.04)",
        }}>
        <Eye className="w-4 h-4 flex-shrink-0" style={{ color: hasCat ? G.gold : "rgba(212,175,55,0.30)" }} />
        <div>
          <p className="font-inter text-[11px] font-black uppercase tracking-[0.3em]"
            style={{ color: hasCat ? G.gold : "rgba(212,175,55,0.30)" }}>
            ✦ Final Kasam — القسم الكامل
          </p>
          <p className="font-inter text-[8px] uppercase tracking-widest mt-0.5"
            style={{ color: "rgba(212,175,55,0.35)" }}>
            {hasCat ? `${cat.label} · PDF order: Azimet (A'van + Purpose + Kasem) + Common Kasam Closure` : "Select a purpose above to generate the Final Kasam"}
          </p>
        </div>
      </div>

      {/* Arabic text */}
      <div className="px-5 py-6 min-h-[80px] flex items-center justify-center">
        {hasCat ? (
          <p className="text-right w-full leading-relaxed" dir="rtl" style={ARABIC_FINAL_STYLE}>
            {finalArabic}
          </p>
        ) : (
          <p className="font-inter text-[9px] uppercase tracking-widest text-center"
            style={{ color: "rgba(255,255,255,0.15)" }}>
            القسم سيظهر هنا بعد اختيار الغرض
          </p>
        )}
      </div>

      {/* Malayalam meaning */}
      {hasCat && finalMalayalam && (
        <>
          <div className="mx-5 h-px" style={{ background: "rgba(212,175,55,0.18)" }} />
          <div className="px-5 py-5">
            <p className="font-inter text-[8px] uppercase tracking-[0.25em] font-bold mb-3"
              style={{ color: "rgba(212,175,55,0.50)" }}>
              Final Malayalam Meaning — അർഥം
            </p>
            <p className="font-amiri text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.75)", lineHeight: 2.1 }}>
              {finalMalayalam}
            </p>
          </div>
        </>
      )}

      {/* Source footnote */}
      {hasCat && (
        <div className="px-5 pb-4 flex items-center gap-2">
          <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(212,175,55,0.30)" }} />
          <p className="font-inter text-[7px]" style={{ color: "rgba(255,255,255,0.20)" }}>
            {COMMON_KASAM.source} · {cat.source}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function KasamSection({ avanNames = [], kasemNames = [] }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const [names, setNames] = useState({
    requesterName: "", requesterMother: "", targetMale: "", targetFemale: "",
  });

  const hasAvan  = Array.isArray(avanNames)  && avanNames.length  > 0;
  const hasKasem = Array.isArray(kasemNames) && kasemNames.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:  G.bg,
        borderColor: G.goldBorderHi,
        boxShadow:   `0 0 80px ${G.glow}, 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}>

      <div className="h-px w-full" style={{
        background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)`
      }} />

      {/* Section title */}
      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-2"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
          <span className="font-inter text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>
            Section 4 — Kasam القسم
          </span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
        <p className="font-inter text-[9px] uppercase tracking-[0.2em]" style={{ color: G.goldDim }}>
          ONE CONTINUOUS KASAM — PDF Pages 78–79 Manuscript Structure
        </p>
      </div>

      <div className="px-4 pb-6 space-y-5">

        {/* ── 1. COMMON KASAM — ONE CONTINUOUS TEXT (PDF Pages 78–79) ── */}
        <div>
          <StepBadge number="1" label="Common Kasam — Complete Manuscript Text" color={G.blue} active />
          <div className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: "rgba(147,197,253,0.35)",
              background: G.bgDeep,
              boxShadow: "0 0 40px rgba(147,197,253,0.08), inset 0 1px 0 rgba(147,197,253,0.06)",
            }}>

            <div className="px-5 py-4 border-b flex items-center gap-3"
              style={{ borderColor: "rgba(147,197,253,0.18)", background: "rgba(147,197,253,0.04)" }}>
              <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(147,197,253,0.70)" }} />
              <div>
                <p className="font-inter text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "rgba(147,197,253,0.80)" }}>
                  Common Kasam Framework — PDF Pages 78–79
                </p>
                <p className="font-inter text-[7px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(147,197,253,0.40)" }}>
                  Complete structure with injection points for A'van, Purpose, and Kasem
                </p>
              </div>
            </div>

            <div className="px-5 py-6">
              {/* Build continuous Common Kasam with injection points */}
              <p className="text-right leading-relaxed" dir="rtl" style={ARABIC_FINAL_STYLE}>
                {COMMON_KASAM.opening}{" "}
                {hasAvan ? <span style={{ color: G.goldBright }}>{avanNames.map(n => `يَا ${n}`).join(" ")}</span> : <span style={{ color: "rgba(245,208,96,0.35)" }}>[ يَا أسماء العوان ]</span>}{" "}
                <span style={{ color: "rgba(134,239,172,0.70)", textDecoration: "underline", textDecorationStyle: "dashed" }}>[ الغرض المختار أدناه ]</span>{" "}
                {hasKasem ? <span style={{ color: "rgba(196,181,253,0.90)" }}>{kasemNames.map(n => `بِحَقِّ ${n}`).join(" ")}</span> : <span style={{ color: "rgba(196,181,253,0.35)" }}>[ بِحَقِّ أسماء القسم ]</span>}{" "}
                {COMMON_KASAM.closing}
              </p>
            </div>

            <div className="mx-5 h-px" style={{ background: "rgba(147,197,253,0.15)" }} />

            <div className="px-5 py-5">
              <p className="font-inter text-[8px] uppercase tracking-[0.25em] font-bold mb-3"
                style={{ color: "rgba(147,197,253,0.50)" }}>
                Malayalam Meaning — അർഥം
              </p>
              <div className="space-y-3 font-amiri text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)", lineHeight: 2.1 }}>
                <p>
                  {COMMON_KASAM.openingMalayalam}
                </p>
                <div className="pl-4 border-l-2" style={{ borderColor: "rgba(245,208,96,0.30)" }}>
                  <p className="text-sm" style={{ color: "rgba(245,208,96,0.70)" }}>
                    {hasAvan 
                      ? `Esma-i A'van: ${avanNames.map(n => `يَا ${n}`).join(", ")}`
                      : "Esma-i A'van: [Section 2-ൽ നിന്നുള്ള പേരുകൾ]"}
                  </p>
                </div>
                <div className="pl-4 border-l-2" style={{ borderColor: "rgba(134,239,172,0.30)" }}>
                  <p className="text-sm" style={{ color: "rgba(134,239,172,0.60)" }}>
                    Purpose Azimet: [താഴെ നിന്ന് ഗ്രന്ഥം തിരഞ്ഞെടുക്കുക]
                  </p>
                </div>
                <div className="pl-4 border-l-2" style={{ borderColor: "rgba(196,181,253,0.30)" }}>
                  <p className="text-sm" style={{ color: "rgba(196,181,253,0.70)" }}>
                    {hasKasem 
                      ? `Esma-i Kasem: ${kasemNames.map(n => `بِحَقِّ ${n}`).join(", ")}`
                      : "Esma-i Kasem: [Section 3-ൽ നിന്നുള്ള പേരുകൾ]"}
                  </p>
                </div>
                <p className="pt-2 border-t" style={{ borderColor: "rgba(147,197,253,0.15)" }}>
                  {COMMON_KASAM.closingMalayalam}
                </p>
              </div>
            </div>

            <div className="mx-5 h-px" style={{ background: "rgba(147,197,253,0.15)" }} />

            <div className="px-5 py-4">
              <p className="font-inter text-[8px] uppercase tracking-[0.25em] font-bold mb-2"
                style={{ color: "rgba(147,197,253,0.50)" }}>
                Structure Guide — PDF Order
              </p>
              <div className="grid grid-cols-1 gap-1.5 text-[7px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(147,197,253,0.60)" }} />
                  <span>Opening: <span style={{ color: "rgba(147,197,253,0.80)" }}>أقسمت عليكم أيها الأرواح الروحانية المشرفة</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.gold }} />
                  <span>Esma-i A'van: <span style={{ color: G.goldBright }}>يا [Names from Section 2]</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(134,239,172,0.60)" }} />
                  <span>Purpose: <span style={{ color: "rgba(134,239,172,0.70)" }}>[Select category below → injected here]</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(196,181,253,0.60)" }} />
                  <span>Esma-i Kasem: <span style={{ color: "rgba(196,181,253,0.90)" }}>بحق [Names from Section 3]</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(147,197,253,0.60)" }} />
                  <span>Closing: <span style={{ color: "rgba(147,197,253,0.80)" }}>بالواحد الأحد الفرد الصمد...</span></span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-4 flex items-center gap-2">
              <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(147,197,253,0.30)" }} />
              <p className="font-inter text-[7px]" style={{ color: "rgba(255,255,255,0.20)" }}>
                {COMMON_KASAM.source}
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. PURPOSE SELECTION ── */}
        <div>
          <StepBadge number="2" label="Select Purpose Category" color={G.gold} active />
          <PurposeSelector selected={selectedCat} onSelect={setSelectedCat} />
        </div>

        {/* ── 3. NAME INPUTS ── */}
        <AnimatePresence>
          {selectedCat && selectedCat.nameFields?.length > 0 && (
            <motion.div key="names"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <StepBadge number="3" label="Enter Names" color={G.green} active />
              <div className="rounded-xl border p-4" style={{ background: G.bgInner, borderColor: G.goldBorder }}>
                <NameInputBlock cat={selectedCat} names={names} onChange={setNames} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <OrnamentalDivider />

        {/* ── 4. FINAL KASAM — GENERATED AFTER SELECTION ── */}
        <div>
          <StepBadge number="4" label="Final Kasam — Generated After Selection" color={G.gold} active />
          <FinalKasamOutput
            cat={selectedCat}
            names={names}
            avanNames={avanNames}
            kasemNames={kasemNames}
          />
        </div>

      </div>

      <div className="h-px w-full" style={{
        background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)`
      }} />
    </motion.div>
  );
}
// ═══════════════════════════════════════════════════════════════
// ASTRO CONTEXT KNOWLEDGE PANEL
// Displays full-context manuscript knowledge for an exact
// Day + Sa'at + Kawkab combination.
//
// Displays:
//   • Recommended actions
//   • Forbidden actions
//   • Enemy-related actions
//   • Friendship-related actions
//   • Ritual suitability
//   • Warnings
//   • Notes
//   • All supporting manuscript sources
//
// KNOWLEDGE IS NEVER DISPLAYED BY PLANET NAME ALONE.
// The same Day+Saat+Kawkab always shows the same manuscript knowledge.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Swords, Heart, Sparkles,
  AlertTriangle, Info, BookOpen, ChevronDown
} from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { useAstroClockContextKnowledge } from "@/hooks/useAstroClockContextKnowledge";
import AstroClockVisuals from "@/components/astroclock/AstroClockVisuals";
import { useIsOwner } from "@/hooks/useIsOwner";

const CATEGORY_CONFIG = {
  recommended: {
    icon: CheckCircle2,
    color: "rgba(74,222,128,0.60)",
    bg: "rgba(74,222,128,0.06)",
    label_ml: "ഉദ്ദേശിക്കുന്ന പ്രവൃത്തികൾ",
    label_en: "Recommended Actions",
    label_ar: "الأفعال الموصى بها",
  },
  forbidden: {
    icon: XCircle,
    color: "rgba(248,113,113,0.60)",
    bg: "rgba(248,113,113,0.06)",
    label_ml: "നിരോധിത പ്രവൃത്തികൾ",
    label_en: "Forbidden Actions",
    label_ar: "الأفعال المحظورة",
  },
  enemy: {
    icon: Swords,
    color: "rgba(239,68,68,0.55)",
    bg: "rgba(239,68,68,0.05)",
    label_ml: "ശത്രു പ്രവൃത്തികൾ",
    label_en: "Enemy-Related Actions",
    label_ar: "أفعال الأعداء",
  },
  friendship: {
    icon: Heart,
    color: "rgba(244,114,182,0.55)",
    bg: "rgba(244,114,182,0.05)",
    label_ml: "സൌഹൃദ പ്രവൃത്തികൾ",
    label_en: "Friendship-Related Actions",
    label_ar: "أفعال الصداقة",
  },
  warnings: {
    icon: AlertTriangle,
    color: "rgba(251,191,36,0.55)",
    bg: "rgba(251,191,36,0.05)",
    label_ml: "മുന്നറിയിപ്പുകൾ",
    label_en: "Warnings",
    label_ar: "تحذيرات",
  },
  notes: {
    icon: Info,
    color: "rgba(129,140,248,0.50)",
    bg: "rgba(129,140,248,0.04)",
    label_ml: "കുറിപ്പുകൾ",
    label_en: "Notes",
    label_ar: "ملاحظات",
  },
};

// ── Display order of manuscript sections per quality tier (UI/content order ONLY) ──
// Labels and content are unchanged — only the render order follows the calculated
// quality level. Excellent leads with beneficial actions; Weak leads with the
// manuscript's destructive (enemy) operations, then a clearly separated ⚠️ avoid-
// banner over the forbidden (beneficial-to-avoid) actions. No content generated/merged.
// Quality tiers: 4=Excellent(ഉത്തമം), 3=Good(നല്ലത്), 2=Medium(ഇടത്തരം), 1=Weak(ദുർബലം)
// EXCELLENT: lead with most-recommended & spiritual benefits, avoid last.
// GOOD: recommended → suitable → benefits → warnings → avoid → notes → refs.
// MEDIUM: suitable → neutral → warnings → avoid → notes → refs.
// WEAK: NEVER lead with recommendations — lead with avoidance (⚠️ banner over
//   forbidden), then dangerous/harmful (enemy) operations, then warnings, then
//   any safe actions, then notes, then refs. Sources always render last.
// Labels and content unchanged — order only.
const SECTION_ORDER = {
  4: ['recommended', 'ritual', 'friendship', 'notes', 'warnings', 'forbidden', 'enemy'],
  3: ['recommended', 'ritual', 'friendship', 'notes', 'warnings', 'forbidden', 'enemy'],
  2: ['friendship', 'ritual', 'notes', 'warnings', 'forbidden', 'enemy', 'recommended'],
  1: ['avoidBanner', 'enemy', 'warnings', 'recommended', 'friendship', 'notes', 'ritual'],
};

function ActionList({ items, config, language }) {
  const isOwner = useIsOwner();
  if (!items || items.length === 0) return null;
  // Mono-language rule: in ML mode show only items with `ml`; AR only `ar`; EN all.
  // Items lacking the active-language text are hidden (no English fallback in ML/AR).
  const langItems = items
    .map(it => ({ ...it, _text: language === "ml" ? (it.ml || "") : language === "ar" ? (it.ar || "") : (it.en || "") }))
    .filter(it => it._text.trim().length > 0);
  if (langItems.length === 0) return null;
  const Icon = config.icon;

  return (
    <div className="rounded-lg p-2" style={{ background: config.bg, border: `1px solid ${config.color}20` }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: config.color }} />
        <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: config.color }}>
          {language === "ml" ? config.label_ml : language === "ar" ? config.label_ar : config.label_en}
          {" "}
          <span className="opacity-50">({langItems.length})</span>
        </span>
      </div>
      {langItems.map((item, i) => (
        <div key={i} className="mb-1.5 last:mb-0">
          <p className={`font-inter text-[10px] leading-snug ${language === "ar" ? "font-amiri" : ""}`} style={{ color: "rgba(255,255,255,0.65)", ...(language === "ar" ? { direction: "rtl" } : {}) }}>
            • {item._text}
          </p>
          {/* Source references — Owner only (preserve every source) */}
          {isOwner && item.sources && item.sources.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {item.sources.map((src, si) => (
                <span key={si} className="font-inter text-[7px] px-1 py-0.5 rounded" style={{
                  background: "rgba(129,140,248,0.06)",
                  color: "rgba(129,140,248,0.40)",
                }}>
                  📖 {src.book_title}{src.page_number ? ` p.${src.page_number}` : ''}
                  {src.screenshot_url ? ' 📷' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SourceList({ sources, language, txt }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="rounded-lg p-2" style={{ background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.10)" }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(212,175,55,0.50)" }} />
        <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(212,175,55,0.55)" }}>
          {txt("സ്രോതസ്സുകൾ", "Supporting Sources", "المصادر")}
          {" "}
          <span className="opacity-50">({sources.length})</span>
        </span>
      </div>
      {sources.map((src, i) => (
        <div key={i} className="mb-1 last:mb-0">
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            • {src.book_title}{src.page_number ? ` — p.${src.page_number}` : ''}
            {src.screenshot_url ? ` 📷 ${txt("സ്ക്രീൻഷോട്ട്", "Screenshot", "لقطة")}` : ''}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Deduplicates truly identical actions (same English text).
 * Different actions with different text are preserved separately.
 * Never merges actions from different Saat or different sources.
 */
function dedupeActions(actions) {
  if (!actions || actions.length === 0) return [];
  const seen = new Set();
  return actions.filter(a => {
    const key = (a.en || '').toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeSources(sources) {
  if (!sources || sources.length === 0) return [];
  const seen = new Set();
  return sources.filter(s => {
    const key = `${s.book_title || ''}|${s.page_number || ''}|${s.screenshot_url || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * @param {object} context - { weekday, period, saat_number, planet, nakshatra }
 */
export default function AstroContextKnowledgePanel({ context, qualityTier }) {
  const { txt, language } = useAstroClockLanguage();
  const isOwner = useIsOwner();
  const { knowledge, loading, error } = useAstroClockContextKnowledge(context);
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.12)" }}>
        <p className="font-inter text-[10px]" style={{ color: "rgba(212,175,55,0.50)" }}>
          {txt("ഗ്രന്ഥ വിജ്ഞാനം ലഭ്യമാക്കുന്നു...", "Loading manuscript knowledge...", "تحميل المعرفة...")}
        </p>
      </div>
    );
  }

  if (error || !knowledge || knowledge.length === 0) {
    return (
      <div className="rounded-lg p-2 mt-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="font-inter text-[9px] text-center" style={{ color: "rgba(255,255,255,0.30)" }}>
          {txt("ഈ സഅാത്തിന് ഗ്രന്ഥ വിജ്ഞാനം ലഭ്യമല്ല", "No verified manuscript knowledge available.", "لا توجد معرفة مخطوطة متاحة.")}
        </p>
      </div>
    );
  }

  // Merge all knowledge records for this context (there should typically be one)
  const merged = knowledge.reduce((acc, rec) => {
    acc.recommended = [...(acc.recommended || []), ...(rec.recommended_actions || [])];
    acc.forbidden = [...(acc.forbidden || []), ...(rec.forbidden_actions || [])];
    acc.enemy = [...(acc.enemy || []), ...(rec.enemy_actions || [])];
    acc.friendship = [...(acc.friendship || []), ...(rec.friendship_actions || [])];
    acc.warnings = [...(acc.warnings || []), ...(rec.warnings_list || [])];
    acc.notes = [...(acc.notes || []), ...(rec.notes_list || [])];
    acc.ritual = acc.ritual || rec.ritual_suitability || '';
    acc.sources = [...(acc.sources || []), ...(rec.supporting_sources || [])];
    if (rec.source_screenshot_url) {
      acc.sources.push({
        book_title: rec.source_book_title || 'Screenshot',
        page_number: '',
        screenshot_url: rec.source_screenshot_url
      });
    }
    // Collect cropped visuals attached to these AstroClockKnowledge records
    if (Array.isArray(rec.attached_visuals) && rec.attached_visuals.length > 0) {
      acc.visuals = [...(acc.visuals || []), ...rec.attached_visuals];
    }
    return acc;
  }, {});

  // Deduplicate truly identical actions (same English text) — preserve different rules
  merged.recommended = dedupeActions(merged.recommended);
  merged.forbidden = dedupeActions(merged.forbidden);
  merged.enemy = dedupeActions(merged.enemy);
  merged.friendship = dedupeActions(merged.friendship);
  merged.warnings = dedupeActions(merged.warnings);
  merged.notes = dedupeActions(merged.notes);
  merged.sources = dedupeSources(merged.sources);

  const hasContent = (merged.recommended?.length > 0) ||
    (merged.forbidden?.length > 0) ||
    (merged.enemy?.length > 0) ||
    (merged.friendship?.length > 0) ||
    (merged.warnings?.length > 0) ||
    (merged.notes?.length > 0) ||
    merged.ritual;

  if (!hasContent) return null;

  const totalItems = (merged.recommended?.length || 0) +
    (merged.forbidden?.length || 0) +
    (merged.enemy?.length || 0) +
    (merged.friendship?.length || 0) +
    (merged.warnings?.length || 0) +
    (merged.notes?.length || 0);

  // Renders one manuscript section by key. Reorder only — never merges or deletes.
  const renderSection = (key) => {
    switch (key) {
      case 'ritual':
        if (!merged.ritual) return null;
        return (
          <div key="ritual" className="rounded-lg p-2" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.20)" }}>
            <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-1" style={{ color: "rgba(212,175,55,0.60)" }}>
              {txt("ആചാര അനുയോജ്യത", "Ritual Suitability", "ملاءمة الطقوس")}
            </p>
            <p className="font-inter text-[10px] leading-snug" style={{ color: "rgba(255,255,255,0.60)" }}>
              {merged.ritual}
            </p>
          </div>
        );
      case 'recommended':
        return <ActionList key="recommended" items={merged.recommended} config={CATEGORY_CONFIG.recommended} language={language} />;
      case 'forbidden':
        return <ActionList key="forbidden" items={merged.forbidden} config={CATEGORY_CONFIG.forbidden} language={language} />;
      case 'enemy':
        return <ActionList key="enemy" items={merged.enemy} config={CATEGORY_CONFIG.enemy} language={language} />;
      case 'friendship':
        return <ActionList key="friendship" items={merged.friendship} config={CATEGORY_CONFIG.friendship} language={language} />;
      case 'warnings':
        return <ActionList key="warnings" items={merged.warnings} config={CATEGORY_CONFIG.warnings} language={language} />;
      case 'notes':
        return <ActionList key="notes" items={merged.notes} config={CATEGORY_CONFIG.notes} language={language} />;
      case 'avoidBanner':
        if (!merged.forbidden || merged.forbidden.length === 0) return null;
        return (
          <div key="avoidBanner">
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(248,113,113,0.75)" }} />
              <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(248,113,113,0.80)" }}>
                {txt("ഈ സമയത്ത് ഒഴിവാക്കേണ്ടത്", "Avoid During This Time", "تجنب في هذا الوقت")}
              </span>
            </div>
            <ActionList items={merged.forbidden} config={CATEGORY_CONFIG.forbidden} language={language} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg overflow-hidden mt-1.5" style={{
      background: "rgba(212,175,55,0.04)",
      border: "1px solid rgba(212,175,55,0.15)",
    }}>
      {/* Header */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="w-full flex items-center gap-2 p-2 text-left"
      >
        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F5D060" }} />
        <span className="font-inter text-[9px] uppercase tracking-wider font-bold flex-1" style={{ color: "rgba(212,175,55,0.65)" }}>
          {txt("ഗ്രന്ഥ വിജ്ഞാനം — ദിവസം + സഅാത് + കവ്കബ്", "Manuscript Knowledge — Day+Saat+Kawkab", "معرفة المخطوطة — اليوم+الساعة+الكوكب")}
          {" "}
          <span className="opacity-50">({totalItems})</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform flex-shrink-0" style={{
          color: "rgba(212,175,55,0.50)",
          transform: showAll ? "rotate(180deg)" : "none"
        }} />
      </button>

      {showAll && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
          <div className="px-2 pb-2 space-y-1.5">
            {/* Manuscript sections rendered in the order defined by the calculated
                quality tier (SECTION_ORDER). Labels and content unchanged — order only. */}
            {(SECTION_ORDER[qualityTier] || SECTION_ORDER[3]).map((key) => renderSection(key))}
            {/* All supporting sources — Owner only */}
            {isOwner && <SourceList sources={merged.sources} language={language} txt={txt} />}
            {/* Cropped source visuals (wafq, tables, diagrams) — displayed inside the card */}
            <AstroClockVisuals visuals={merged.visuals} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
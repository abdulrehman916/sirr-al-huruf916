// ═══════════════════════════════════════════════════════════════
// SIRR HUB — 7 SECTION CARDS + SOURCE LIBRARY
// ═══════════════════════════════════════════════════════════════
import { Stethoscope, Ghost, Heart, Square, BookOpen, Leaf, Sparkles, Library, ChevronRight } from "lucide-react";

const ICON_MAP = { Stethoscope, Ghost, Heart, Square, BookOpen, Leaf, Sparkles };

export default function SirrHub({ structure, onSelectSection, onSelectLibrary, language }) {
  const isMl = language === "ml";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center pt-2 pb-3">
        <h1 className="font-amiri text-3xl font-bold" style={{ color: "#D4AF37", direction: "rtl" }}>سرّ</h1>
        <p className="font-inter text-sm font-bold tracking-wider uppercase mt-1" style={{ color: "#D4AF37" }}>SIRR</p>
        <p className={`text-xs mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.45)" }}>
          {isMl ? "ഗ്രന്ഥ വിജ്ഞാന കേന്ദ്രം" : "Manuscript Knowledge Hub"}
        </p>
      </div>

      {/* 7 Section Cards */}
      <div className="space-y-2.5">
        {structure.sections.map((section) => {
          const Icon = ICON_MAP[section.icon] || BookOpen;
          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
                border: `1px solid ${section.accent}33`,
              }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${section.accent}15`, border: `1px solid ${section.accent}30` }}>
                <Icon className="w-5 h-5" style={{ color: section.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-inter text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${section.accent}15`, color: section.accent }}>
                    Sirr {section.id}
                  </span>
                  <span className="font-amiri text-sm flex-shrink-0" style={{ color: section.accent, direction: "rtl" }}>
                    {section.title_ar}
                  </span>
                </div>
                <p className={`text-sm font-bold mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: section.accent }}>
                  {isMl ? section.title_ml : section.title_en}
                </p>
                <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {section.topic_count} {isMl ? "വിഷയങ്ങൾ" : "topics"} · {section.method_count} {isMl ? "രീതികൾ" : "methods"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: section.accent }} />
            </button>
          );
        })}
      </div>

      {/* Source Library */}
      <button
        onClick={onSelectLibrary}
        className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
          border: "1px solid rgba(212,175,55,0.33)",
        }}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.30)" }}>
          <Library className="w-5 h-5" style={{ color: "#D4AF37" }} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-amiri text-sm" style={{ color: "#D4AF37", direction: "rtl" }}>المكتبة</span>
          <p className={`text-sm font-bold mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "#D4AF37" }}>
            {isMl ? "ഗ്രന്ഥ ശേഖരം" : "Source Library"}
          </p>
          <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {structure.sourceLibrary.length} {isMl ? "കൈപ്പടികൾ" : "manuscripts"}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: "#D4AF37" }} />
      </button>
    </div>
  );
}
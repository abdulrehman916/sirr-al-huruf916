// ═══════════════════════════════════════════════════════════════
// SIRR SECTION VIEW — TOPIC LIST
// ═══════════════════════════════════════════════════════════════
import { ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";
import { getLanguageContent } from "@/lib/sirrTurkishGuard";

export default function SirrSectionView({ section, onSelectTopic, onBack, language, onSelectPreparations }) {
  const isMl = language === "ml";

  return (
    <div className="space-y-3">
      {/* Header with back button */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft className="w-4 h-4" /> {isMl ? "തിരികെ" : "Back"}
        </button>
      </div>

      {/* Section Title */}
      <div className="text-center pb-2">
        <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded"
          style={{ background: `${section.accent}15`, color: section.accent, border: `1px solid ${section.accent}30` }}>
          Sirr {section.id}
        </span>
        <h2 className="font-amiri text-2xl font-bold mt-2" style={{ color: section.accent, direction: "rtl" }}>
          {section.title_ar}
        </h2>
        <p className={`text-sm font-bold mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: section.accent }}>
          {isMl ? section.title_ml : section.title_en}
        </p>
        <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          {section.topic_count} {isMl ? "വിഷയങ്ങൾ" : "topics"}
        </p>
        {section.id === 6 && onSelectPreparations && (
          <button onClick={onSelectPreparations}
            className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all btn-gold">
            {isMl ? "🌿 തയ്യാറാക്കലുകളുടെ ലൈബ്രറി" : "🌿 Preparation Library"}
          </button>
        )}
      </div>

      {/* Empty state */}
      {section.topics.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.20)" }} />
          <p className={`text-sm ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.40)" }}>
            {isMl ? "ഈ വിഭാഗത്തിൽ ഇതുവരെ വിഷയങ്ങളൊന്നുമില്ല" : "No topics in this section yet"}
          </p>
        </div>
      )}

      {/* Topic List */}
      <div className="space-y-1.5">
        {section.topics.map((topic, idx) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
              border: `1px solid ${section.accent}22`,
            }}
          >
            <span className="font-inter text-[10px] font-bold flex-shrink-0 w-6 h-6 rounded flex items-center justify-center"
              style={{ background: `${section.accent}10`, color: section.accent }}>
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              {topic.topic_ar && (
                <p className="font-amiri text-sm truncate" style={{ color: section.accent, direction: "rtl" }}>
                  {topic.topic_ar}
                </p>
              )}
              <p className={`text-sm font-bold ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.80)" }}>
                {getLanguageContent(topic, 'topic', language) || (isMl ? "വ്യക്തമാക്കാത്തത്" : "Not specified")}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-inter text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: `${section.accent}10`, color: `${section.accent}99` }}>
                {topic.methods.length} {isMl ? "രീതി" : "m"}
              </span>
              <ChevronRight className="w-4 h-4" style={{ color: `${section.accent}99` }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// SIRR TOPIC VIEW — METHODS GROUPED BY MANUSCRIPT
// ═══════════════════════════════════════════════════════════════
// Never merges methods from different books.
// Every manuscript remains independent.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { ChevronLeft, BookMarked, FileText } from "lucide-react";
import SirrMethodDetail from "./SirrMethodDetail";
import { getLanguageContent } from "@/lib/sirrTurkishGuard";

export default function SirrTopicView({ topic, section, onBack, language, onSelectPreparation }) {
  const isMl = language === "ml";
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Group methods by book (manuscript) — never merge
  const byBook = {};
  topic.methods.forEach((m) => {
    const key = m.book_name;
    if (!byBook[key]) byBook[key] = { book_name: m.book_name, book_name_ar: m.book_name_ar, methods: [] };
    byBook[key].methods.push(m);
  });
  const bookGroups = Object.values(byBook);

  // If a method is selected, show method detail
  if (selectedMethod) {
    return (
      <SirrMethodDetail
        method={selectedMethod}
        accent={section.accent}
        language={language}
        onBack={() => setSelectedMethod(null)}
        backLabel={isMl ? topic.topic_ml : topic.topic_en}
        onSelectPreparation={onSelectPreparation}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with back button */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft className="w-4 h-4" /> {isMl ? "വിഷയങ്ങളിലേക്ക്" : "Topics"}
        </button>
      </div>

      {/* Topic Title */}
      <div className="text-center pb-2">
        {topic.topic_ar && (
          <h2 className="font-amiri text-2xl font-bold" style={{ color: section.accent, direction: "rtl" }}>
            {topic.topic_ar}
          </h2>
        )}
        <p className={`text-sm font-bold mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: section.accent }}>
          {getLanguageContent(topic, 'topic', language) || (isMl ? "വ്യക്തമാക്കാത്തത്" : "Not specified")}
        </p>
        <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          {topic.methods.length} {isMl ? "രീതികൾ" : "methods"} · {bookGroups.length} {isMl ? "ഗ്രന്ഥങ്ങൾ" : "books"}
        </p>
      </div>

      {/* Methods grouped by manuscript */}
      {bookGroups.map((book) => (
        <div key={book.book_name} className="space-y-2">
          {/* Book header */}
          <div className="flex items-center gap-2 px-1">
            <BookMarked className="w-4 h-4" style={{ color: section.accent }} />
            <span className="font-amiri text-sm" style={{ color: section.accent, direction: "rtl" }}>
              {book.book_name_ar}
            </span>
            <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              {book.book_name}
            </span>
          </div>

          {/* Method cards */}
          <div className="space-y-1.5">
            {book.methods.map((method, idx) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
                  border: `1px solid ${section.accent}22`,
                }}
              >
                <span className="font-inter text-[10px] font-bold flex-shrink-0 px-2 py-1 rounded"
                  style={{ background: `${section.accent}10`, color: section.accent }}>
                  {isMl ? `രീതി ${idx + 1}` : `Method ${idx + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.80)" }}>
                    {getLanguageContent(method, 'purpose', language) || (isMl ? "വ്യക്തമാക്കാത്തത്" : "Not specified")}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <FileText className="w-3 h-3" style={{ color: "rgba(255,255,255,0.30)" }} />
                    <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {isMl ? "പേജ്" : "p."} {method.page_number}
                    </span>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 flex-shrink-0 rotate-180" style={{ color: `${section.accent}99` }} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
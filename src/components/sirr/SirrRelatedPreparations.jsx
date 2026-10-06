import { useState, useEffect } from "react";
import { FlaskConical, ChevronRight, Link2 } from "lucide-react";
import { fetchRelatedPreparations } from "@/lib/preparationLibrarySync";

export default function SirrRelatedPreparations({ method, accent, language, onSelectPreparation }) {
  const isMl = language === "ml";
  const [preparations, setPreparations] = useState([]);
  const [loading, setLoading] = useState(true);

  const methodId = method.method_id || method.entry_id || method.id;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRelatedPreparations(methodId, method.id)
      .then((preps) => {
        if (!cancelled) {
          setPreparations(preps);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [methodId, method.id]);

  if (loading) {
    return (
      <div className="rounded-xl p-3" style={{ background: `${accent}08`, border: `1px solid ${accent}15` }}>
        <p className="font-inter text-[10px] font-bold uppercase tracking-wide" style={{ color: `${accent}99` }}>
          <Link2 className="w-3 h-3 inline mr-1" />
          {isMl ? "ബന്ധപ്പെട്ട തയ്യാറാക്കലുകൾ" : "Related Preparations"}
        </p>
        <div className="text-center py-3">
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: `${accent} transparent transparent transparent` }} />
        </div>
      </div>
    );
  }

  if (preparations.length === 0) return null;

  return (
    <div className="rounded-xl p-3" style={{ background: `${accent}08`, border: `1px solid ${accent}22` }}>
      <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: `${accent}99` }}>
        <Link2 className="w-3 h-3 inline mr-1" />
        {isMl ? "ബന്ധപ്പെട്ട തയ്യാറാക്കലുകൾ" : "Related Preparations"}
      </p>
      <div className="space-y-1.5">
        {preparations.map((prep) => {
          const prepName = isMl ? (prep.name_ml || prep.name) : (prep.name_en || prep.name);
          const fontClass = isMl ? "font-malayalam" : "font-inter";
          return (
            <button
              key={prep.id}
              onClick={() => onSelectPreparation && onSelectPreparation(prep)}
              className={"w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all hover:scale-[1.01]"}
              style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${accent}15` }}
            >
              <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
              <div className="flex-1 min-w-0">
                {prep.name_ar && (
                  <p className="font-amiri text-xs truncate" style={{ color: accent, direction: "rtl" }}>
                    {prep.name_ar}
                  </p>
                )}
                <p className={"text-xs font-bold " + fontClass} style={{ color: "rgba(255,255,255,0.75)" }}>
                  {prepName}
                </p>
                <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {isMl ? "പേജ്" : "p."} {prep.page_number || "—"}
                </p>
              </div>
              <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: `${accent}99` }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
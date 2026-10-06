import { useState, useMemo } from "react";
import { ChevronLeft, Search, Leaf, FlaskConical, Droplet, Circle, Wind,
  Flower2, PenTool, Square, BookOpen, Archive, Info, Package, Ruler,
  Wrench, AlertTriangle } from "lucide-react";
import SirrPreparationCard from "./SirrPreparationCard";
import { PREPARATION_TYPES } from "@/lib/preparationLibrarySync";

const ICON_MAP = {
  Leaf, FlaskConical, Droplet, Circle, Wind,
  Flower2, PenTool, Square, BookOpen, Archive, Info, Package, Ruler,
  Wrench, AlertTriangle,
};

export default function SirrPreparationLibrary({
  preparations,
  loading,
  onSelectPreparation,
  onBack,
  language,
  accent,
}) {
  const isMl = language === "ml";
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState(null);

  const filtered = useMemo(() => {
    if (!preparations) return [];
    let result = preparations;
    if (selectedType) {
      result = result.filter((p) => p.preparation_type === selectedType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.name_en || "").toLowerCase().includes(q) ||
        (p.name_ml || "").toLowerCase().includes(q) ||
        (p.purpose || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [preparations, selectedType, search]);

  const typeCounts = useMemo(() => {
    const counts = {};
    (preparations || []).forEach((p) => {
      counts[p.preparation_type] = (counts[p.preparation_type] || 0) + 1;
    });
    return counts;
  }, [preparations]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft className="w-4 h-4" /> {isMl ? "തിരികെ" : "Back"}
        </button>
      </div>

      {/* Title */}
      <div className="text-center pb-2">
        <h2 className="font-amiri text-2xl font-bold" style={{ color: accent, direction: "rtl" }}>
          الأعشاب والبخور
        </h2>
        <p className={`text-sm font-bold mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: accent }}>
          {isMl ? "ഔഷധങ്ങൾ, മരുന്നുകൾ, ധൂപങ്ങൾ & പ്രകൃതിദത്ത ചികിത്സകൾ" : "Herbs, Medicines, Incense & Natural Remedies"}
        </p>
        <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          {(preparations || []).length} {isMl ? "തയ്യാറാക്കലുകൾ" : "preparations"}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.30)" }} />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isMl ? "തയ്യാറാക്കലുകൾ തിരയുക..." : "Search preparations..."}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-inter"
          style={{
            background: "rgba(8,16,38,0.80)",
            border: `1px solid ${accent}22`,
            color: "rgba(255,255,255,0.80)",
          }}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: `${accent} transparent transparent transparent` }} />
          <p className="font-inter text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.30)" }}>
            {isMl ? "ലഭ്യമാക്കുന്നു..." : "Loading..."}
          </p>
        </div>
      )}

      {/* Category chips */}
      {!loading && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              !selectedType ? "btn-gold" : ""
            }`}
            style={!selectedType ? {} : {
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.50)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            {isMl ? "എല്ലാം" : "All"} ({(preparations || []).length})
          </button>
          {PREPARATION_TYPES.map((t) => {
            const count = typeCounts[t.key] || 0;
            if (count === 0) return null;
            const Icon = ICON_MAP[t.icon] || Leaf;
            const isSelected = selectedType === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setSelectedType(isSelected ? null : t.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  isSelected ? "btn-gold" : ""
                }`}
                style={!isSelected ? {
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.50)",
                  border: "1px solid rgba(255,255,255,0.10)",
                } : {}}
              >
                <Icon className="w-3 h-3" />
                {isMl ? t.label_ml : t.label_en} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <Leaf className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.20)" }} />
          <p className={`text-sm ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.40)" }}>
            {isMl ? "തയ്യാറാക്കലുകളൊന്നുമില്ല" : "No preparations found"}
          </p>
        </div>
      )}

      {/* Preparation list */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-1.5">
          {filtered.map((prep) => (
            <SirrPreparationCard
              key={prep.id}
              preparation={prep}
              onSelect={() => onSelectPreparation(prep)}
              language={language}
              accent={accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
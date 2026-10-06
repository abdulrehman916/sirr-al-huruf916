import { useMemo } from "react";
import { BookOpen, CheckCircle, XCircle, Copy, Clock, Calendar } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

const CATEGORY_LABELS = {
  jalb: "Jalb (Attraction)",
  tard: "Tard (Banishment)",
  tafriq: "Tafriq (Separation)",
  jam: "Jam (Gathering)",
  sihhat: "Sihhat (Health)",
  sekam: "Saqam (Sickness)",
  tarfet: "Tarfet (Evil Eye)",
  other: "Other",
};

const LANGUAGE_LABELS = {
  ar: "Arabic",
  ml: "Malayalam",
  en: "English",
  mixed: "Mixed",
};

export default function StatsPanel({ entries, loading }) {
  const stats = useMemo(() => {
    const total = entries.length;
    const active = entries.filter(e => e.is_active !== false).length;
    const inactive = entries.filter(e => e.is_active === false).length;

    // Duplicate detection: same purpose_phrase or same alias
    const phraseMap = {};
    const aliasMap = {};
    const duplicateIds = new Set();
    for (const e of entries) {
      const phrase = (e.purpose_phrase || "").trim().toLowerCase();
      if (phrase) {
        if (phraseMap[phrase]) duplicateIds.add(e.id);
        else phraseMap[phrase] = e.id;
      }
      for (const alias of (e.aliases || [])) {
        const a = (alias || "").trim().toLowerCase();
        if (a) {
          if (aliasMap[a]) duplicateIds.add(e.id);
          else aliasMap[a] = e.id;
        }
      }
    }
    const duplicates = duplicateIds.size;

    // Per category
    const byCategory = {};
    for (const e of entries) {
      const cat = e.action || "other";
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    // Per language
    const byLanguage = {};
    for (const e of entries) {
      const lang = e.language || "mixed";
      byLanguage[lang] = (byLanguage[lang] || 0) + 1;
    }

    // Per normalized key
    const byKey = {};
    for (const e of entries) {
      const key = e.normalized_purpose_key || "unknown";
      byKey[key] = (byKey[key] || 0) + 1;
    }

    // Recently added (last 7 days)
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentlyAdded = entries.filter(e => {
      const d = e.created_date ? new Date(e.created_date).getTime() : 0;
      return d >= sevenDaysAgo;
    }).length;

    // Recently modified (last 7 days)
    const recentlyModified = entries.filter(e => {
      const d = e.updated_date ? new Date(e.updated_date).getTime() : 0;
      return d >= sevenDaysAgo;
    }).length;

    return { total, active, inactive, duplicates, byCategory, byLanguage, byKey, recentlyAdded, recentlyModified };
  }, [entries]);

  if (loading) {
    return (
      <div className="rounded-2xl p-8 flex items-center justify-center" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}` }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${G.dim}`, borderTopColor: G.text }} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<BookOpen className="w-4 h-4" />} label="Total Entries" value={stats.total} color={G.text} />
        <StatCard icon={<CheckCircle className="w-4 h-4" />} label="Active" value={stats.active} color="#4ADE80" />
        <StatCard icon={<XCircle className="w-4 h-4" />} label="Inactive" value={stats.inactive} color="#F87171" />
        <StatCard icon={<Copy className="w-4 h-4" />} label="Duplicates" value={stats.duplicates} color={stats.duplicates > 0 ? "#FBBF24" : "rgba(255,255,255,0.40)"} />
      </div>

      {/* Category + Language breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Categories */}
        <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}` }}>
          <h3 className="font-inter text-xs font-bold uppercase tracking-wider mb-3" style={{ color: G.dim }}>
            Entries by Category
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="font-inter text-xs text-white/70">{CATEGORY_LABELS[cat] || cat}</span>
                  <span className="font-inter text-xs font-bold" style={{ color: G.text }}>{count}</span>
                </div>
              ))}
            {Object.keys(stats.byCategory).length === 0 && (
              <p className="font-inter text-xs text-white/30">No entries</p>
            )}
          </div>
        </div>

        {/* Languages */}
        <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}` }}>
          <h3 className="font-inter text-xs font-bold uppercase tracking-wider mb-3" style={{ color: G.dim }}>
            Entries by Language
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.byLanguage)
              .sort((a, b) => b[1] - a[1])
              .map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between">
                  <span className="font-inter text-xs text-white/70">{LANGUAGE_LABELS[lang] || lang}</span>
                  <span className="font-inter text-xs font-bold" style={{ color: G.text }}>{count}</span>
                </div>
              ))}
            {Object.keys(stats.byLanguage).length === 0 && (
              <p className="font-inter text-xs text-white/30">No entries</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Calendar className="w-4 h-4" />} label="Recently Added (7d)" value={stats.recentlyAdded} color="#60A5FA" />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Recently Modified (7d)" value={stats.recentlyModified} color="#60A5FA" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(8,16,38,0.60)", border: "1px solid rgba(212,175,55,0.25)" }}>
      <div className="flex items-center gap-2 mb-1">
        <div style={{ color }}>{icon}</div>
        <p className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{label}</p>
      </div>
      <p className="font-inter text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
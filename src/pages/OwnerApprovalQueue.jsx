// ═══════════════════════════════════════════════════════════════
// Owner Approval Queue — READ-ONLY review surface for the 214
// flagged Western-occult-sourced AstroClockKnowledge records.
//
// Shows for every flagged record:
//   • Record ID
//   • Card title (rule_entity / entity_raw)
//   • Source book
//   • Source page
//   • Category
//   • Exact extracted text (EN, AR, ML where present)
//   • Affects Astro Clock calculations / timing  vs  Descriptive only
//
// READ-ONLY. No edit, no delete, no quarantine, no move.
// Admin/Owner gated. Nothing is written to any entity.
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { isAdminRole } from "@/lib/rbac";
import { ShieldAlert, FileWarning, Calculator, BookOpen } from "lucide-react";

const FLAGGED_BOOKS = [
  "1 - How to Summon and Command ... by de Lafayette (2010).pdf",
  "The_Greco_Egyptian_Magical_Formularies_by_Christopher_Faraone_and.pdf",
  "The_Hedgewitch\u2019s_Little_Book_of_Spells,_Charms_&_Brews_by_Tudorbeth.pdf",
  "The_Real_Witches'_Book_of_Spells_and_Rituals_by_Kate_West.pdf",
  "Magia experimental pr\u00e1ctica - Gian Piero Bona.pdf",
];

// Categories that affect Astro Clock CALCULATIONS / TIMING (vs descriptive).
const CALC_AFFECTING = new Set([
  "sahat", "planetary_hours", "planet", "planets", "zodiac", "zodiac_signs",
  "lunar mansion", "lunar_mansions", "lucky_timings", "unfavourable_timings",
  "special_nights", "special_days", "recommended_actions", "forbidden_actions",
  "weekdays", "weekday", "planetary_relationships", "planet_relationships",
  "astrology rules", "planetary rules", "special_timing", "day_period",
  "night_period", "astrological rules", "planetary relationships",
]);

const isCalcAffecting = (cat) => CALC_AFFECTING.has(String(cat || "").toLowerCase());

const Card = ({ r }) => {
  const calc = isCalcAffecting(r.rule_category);
  return (
    <div className="card-dark p-4 space-y-2">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="font-inter text-[11px] text-gold-dim tracking-wide break-all">
          ID: {r.knowledge_id}
        </div>
        <span
          className="font-inter text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{
            background: calc ? "rgba(220,60,60,0.16)" : "rgba(120,180,120,0.14)",
            border: `1px solid ${calc ? "rgba(220,60,60,0.45)" : "rgba(120,180,120,0.40)"}`,
            color: calc ? "#ff9a9a" : "#a9e0a9",
          }}
        >
          {calc ? (
            <span className="inline-flex items-center gap-1"><Calculator className="w-3 h-3" /> Affects calculations</span>
          ) : (
            <span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3" /> Descriptive only</span>
          )}
        </span>
      </div>

      <div className="font-amiri text-lg text-gold leading-snug">
        {r.entity_raw || r.rule_entity || "(no card title)"}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[12px] font-inter">
        <div><span className="text-white/40">Category:</span> <span className="text-white/80">{r.rule_category || "(none)"}</span></div>
        <div><span className="text-white/40">Source page:</span> <span className="text-white/80">{r.source_page_number || "—"}</span></div>
      </div>
      <div className="text-[11px] font-inter text-white/45 break-all">
        <span className="text-white/40">Source:</span> {r.source_book_title}
      </div>

      {r.knowledge_text_en && (
        <div className="text-[12.5px] font-inter text-white/80 leading-relaxed border-t border-white/5 pt-2 whitespace-pre-wrap">
          {r.knowledge_text_en}
        </div>
      )}
      {r.knowledge_text_ar && (
        <div className="font-amiri text-base text-gold/90 leading-relaxed border-t border-white/5 pt-2 text-right" dir="rtl">
          {r.knowledge_text_ar}
        </div>
      )}
      {r.knowledge_text_ml && (
        <div className="font-malayalam text-sm text-white/70 leading-relaxed border-t border-white/5 pt-2">
          {r.knowledge_text_ml}
        </div>
      )}
    </div>
  );
};

export default function OwnerApprovalQueue() {
  const { role } = useAuth();
  const canView = isAdminRole(role);

  const [records, setRecords] = useState(null);
  const [error, setError] = useState("");
  const [filterBook, setFilterBook] = useState("all");
  const [calcOnly, setCalcOnly] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all = [];
        for (const title of FLAGGED_BOOKS) {
          let skip = 0;
          // fetch up to 200 per book (flagged counts max 58)
          let batch = await base44.entities.AstroClockKnowledge.filter(
            { source_book_title: title },
            "-created_date",
            200,
            skip
          );
          all.push(...batch);
          while (batch.length === 200) {
            skip += 200;
            batch = await base44.entities.AstroClockKnowledge.filter(
              { source_book_title: title }, "-created_date", 200, skip
            );
            all.push(...batch);
          }
        }
        if (alive) setRecords(all);
      } catch (e) {
        if (alive) setError(String(e?.message || e));
      }
    })();
    return () => { alive = false; };
  }, []);

  const calcCount = useMemo(
    () => (records || []).filter((r) => isCalcAffecting(r.rule_category)).length,
    [records]
  );

  const filtered = useMemo(() => {
    if (!records) return [];
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (filterBook !== "all" && r.source_book_title !== filterBook) return false;
      if (calcOnly && !isCalcAffecting(r.rule_category)) return false;
      if (q) {
        const hay = `${r.knowledge_id} ${r.rule_entity || ""} ${r.entity_raw || ""} ${r.rule_category || ""} ${r.knowledge_text_en || ""} ${r.source_page_number || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [records, filterBook, calcOnly, query]);

  if (!canView) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto py-10 text-center text-white/60 font-inter">
          Owner/Admin access required.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-4 pb-10 max-w-4xl mx-auto">
        <PageTitle
          arabic="قائمة اعتماد المالك"
          latin="Owner Approval Queue"
          subtitle="Flagged Western-source Astro Clock records — READ-ONLY review"
          icon="🛡️"
        />

        <div className="card-gold p-3 flex items-start gap-3">
          <FileWarning className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
          <div className="font-inter text-[12.5px] text-white/80 leading-relaxed">
            All 214 flagged records are kept <b>exactly as they are</b>. Nothing is edited,
            deleted, quarantined, or moved. This queue is for your review only. No
            calculation will change until you approve.
          </div>
        </div>

        {records === null && !error && (
          <div className="text-white/50 font-inter text-sm py-10 text-center">Loading flagged records…</div>
        )}
        {error && (
          <div className="text-red-300 font-inter text-sm py-6 text-center">{error}</div>
        )}

        {records && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="card-dark p-3 text-center">
                <div className="text-2xl font-bold text-gold">{records.length}</div>
                <div className="text-[11px] text-white/50 font-inter">Flagged records</div>
              </div>
              <div className="card-dark p-3 text-center">
                <div className="text-2xl font-bold" style={{ color: "#ff9a9a" }}>{calcCount}</div>
                <div className="text-[11px] text-white/50 font-inter">Affect calculations</div>
              </div>
              <div className="card-dark p-3 text-center">
                <div className="text-2xl font-bold" style={{ color: "#a9e0a9" }}>{records.length - calcCount}</div>
                <div className="text-[11px] text-white/50 font-inter">Descriptive only</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={filterBook}
                onChange={(e) => setFilterBook(e.target.value)}
                className="bg-black/40 border border-gold-dim rounded-lg px-3 py-2 text-sm font-inter text-white/90 flex-1"
              >
                <option value="all">All 5 flagged books</option>
                {FLAGGED_BOOKS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ID / card / text…"
                className="bg-black/40 border border-gold-dim rounded-lg px-3 py-2 text-sm font-inter text-white/90 flex-1"
              />
              <button
                onClick={() => setCalcOnly((v) => !v)}
                className="px-3 py-2 rounded-lg text-sm font-inter font-semibold whitespace-nowrap"
                style={{
                  background: calcOnly ? "rgba(220,60,60,0.18)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${calcOnly ? "rgba(220,60,60,0.45)" : "rgba(212,175,55,0.30)"}`,
                  color: calcOnly ? "#ff9a9a" : "rgba(255,255,255,0.75)",
                }}
              >
                {calcOnly ? "Calc-affecting only ✓" : "Filter: calc-affecting"}
              </button>
            </div>

            <div className="text-[12px] text-white/45 font-inter">
              Showing {filtered.length} of {records.length}
            </div>

            <div className="space-y-3">
              {filtered.map((r) => (
                <Card key={r.id} r={r} />
              ))}
              {filtered.length === 0 && (
                <div className="text-white/40 font-inter text-sm py-8 text-center">No records match the filter.</div>
              )}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
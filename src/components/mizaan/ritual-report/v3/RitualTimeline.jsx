// ═══════════════════════════════════════════════════════════════
// RITUAL TIMELINE NAVIGATOR — visual GPS-style timeline
// ═══════════════════════════════════════════════════════════════
// Pure presentation layer. Reads ONLY from the existing engine data:
//   analysis (rawAnalysis), liveTimeline, todayRemaining,
//   liveRecommendation, now, lang.
// Does NOT modify any calculation, compatibility, or database logic.
// Auto-updates every minute (driven by the parent's 60s `now` tick).
// ═══════════════════════════════════════════════════════════════
import { useMemo } from "react";
import { Navigation, MapPin } from "lucide-react";
import { G, T, translatePlanet, translateDay, saatDisplayNum, DAY_KEY_BY_INDEX, MIZAN_DAY_NAMES, computeCompat, compatColor } from "./shared";

const DAY_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

const STATUS = {
  suitable:  { dot: "#4ADE80", border: "rgba(74,222,128,0.60)",  bg: "rgba(74,222,128,0.07)",  en: "Suitable now",          ml: "ഇപ്പോൾ അനുയോജ്യം" },
  unsuitable:{ dot: "#F87171", border: "rgba(248,113,113,0.60)", bg: "rgba(248,113,113,0.07)", en: "Not suitable now",      ml: "ഇപ്പോൾ അനുയോജ്യമല്ല" },
  forbidden: { dot: "#991B1B", border: "rgba(153,27,27,0.70)",    bg: "rgba(153,27,27,0.10)",   en: "Forbidden",             ml: "നിരോധിതം" },
  upcoming:  { dot: "#F5D060", border: "rgba(245,208,96,0.60)",  bg: "rgba(245,208,96,0.07)",  en: "Upcoming suitable",     ml: "വരാനിരിക്കുന്ന അനുയോജ്യം" },
  future:    { dot: "#60A5FA", border: "rgba(96,165,250,0.60)",  bg: "rgba(96,165,250,0.07)",  en: "Future opportunity",     ml: "ഭാവി അവസരം" },
  best:      { dot: "#3B82F6", border: "rgba(59,130,246,0.70)",  bg: "rgba(59,130,246,0.10)",  en: "Best future",           ml: "മികച്ച ഭാവി" },
  neutral:   { dot: "#6B7280", border: "rgba(107,114,128,0.45)", bg: "rgba(107,114,128,0.05)", en: "No opportunity",        ml: "അവസരമില്ല" },
};

// Lookup supporting book + reason for an opportunity from the engine's
// matchingRules (exact weekday + period + saat_number match). Read-only.
function bookAndReasonFor(analysis, opp) {
  const rules = analysis?.matchingRules || [];
  const idx = DAY_INDEX[opp.dayKey];
  const hits = rules.filter(r =>
    r.weekday === idx && r.period === opp.period && r.saat_number === opp.hour
  );
  if (hits.length === 0) return { book: "", reason: "" };
  const books = Array.from(new Set(hits.map(r => r.source ? (r.page ? `${r.source} (p.${r.page})` : r.source) : "").filter(Boolean)));
  const reason = hits.map(r => r.text_en).filter(Boolean)[0] || "";
  return { book: books.join(" · "), reason };
}

function compatFor(analysis, opp) {
  try {
    const c = computeCompat(analysis, {
      dayKey: opp.dayKey,
      weekday: DAY_INDEX[opp.dayKey],
      period: opp.period,
      saatNumber: opp.hour,
      planetLC: String(opp.planet || "").toLowerCase(),
    });
    return c.final;
  } catch { return 0; }
}

function fmtDate(dateStr, lang) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(lang === "ml" ? "ml-IN" : "en-US", { weekday: "short", day: "numeric", month: "short" });
  } catch { return dateStr; }
}

// ── Single timeline card: displays all 9 required fields ──
function TimelineCard({ status, labelEn, labelMl, opp, compat, book, reason, lang, isLast }) {
  const s = STATUS[status] || STATUS.neutral;
  const weekday = opp?.dayName ? translateDay(opp.dayName, lang) : (opp?.weekdayName || "");
  const dateStr = opp?.date ? fmtDate(opp.date, lang) : (opp?.dateLabel || "");
  const saatNum = opp ? saatDisplayNum(opp.hour, opp.period) : "";
  const planet = opp ? translatePlanet(opp.planet, lang) : "";
  const dn = opp ? (opp.period === "night" ? (lang === "ml" ? "രാത്രി (ലൈൽ)" : "Night (Layl)") : (lang === "ml" ? "പകൽ (നഹർ)" : "Day (Nahar)")) : "";
  const timeWin = opp ? `${opp.startTime} – ${opp.endTime}` : "";

  return (
    <div className="relative pl-8 pb-5">
      {/* rail dot */}
      <span className="absolute left-[10px] top-2 w-3 h-3 rounded-full" style={{ background: s.dot, boxShadow: `0 0 10px ${s.dot}` }} />
      {!isLast && <span className="absolute left-[15px] top-5 bottom-0 w-px" style={{ background: "rgba(212,175,55,0.18)" }} />}

      <div className="rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)`, border: `1px solid ${s.border}`, boxShadow: "0 4px 30px rgba(0,0,0,0.55)" }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: s.bg, borderBottom: `1px solid ${s.border}` }}>
          <span className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: s.dot }}>
            {T(labelEn, labelMl, lang)}
          </span>
          <span className="font-inter text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.dot }}>
            {T(s.en, s.ml, lang)}
          </span>
        </div>
        <div className="p-3.5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Field label={T("Weekday", "ആഴ്ച", lang)} value={weekday} />
            <Field label={T("Date", "തീയതി", lang)} value={dateStr} />
            <Field label={T("Saat", "സഅാത്ത്", lang)} value={saatNum ? `#${saatNum}` : ""} />
            <Field label={T("Planet", "ഗ്രഹം", lang)} value={planet} />
            <Field label={T("Day / Night", "പകൽ / രാത്രി", lang)} value={dn} />
            <Field label={T("Compatibility", "പൊരുത്തം", lang)} value={compat != null ? `${compat}%` : ""} valueColor={compatColor(compat || 0)} />
          </div>
          {timeWin && (
            <div className="mt-2.5 pt-2.5" style={{ borderTop: "1px solid rgba(212,175,55,0.14)" }}>
              <Field label={T("Time Window", "സമയ ജാലകം", lang)} value={timeWin} />
            </div>
          )}
          {book && (
            <div className="mt-2.5 pt-2.5" style={{ borderTop: "1px solid rgba(212,175,55,0.14)" }}>
              <Field label={T("Supporting Book", "പിന്തുണയ്ക്കുന്ന പുസ്തകം", lang)} value={book} />
            </div>
          )}
          {reason && (
            <p className="mt-2 font-inter text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>
              {reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, valueColor }) {
  return (
    <div>
      <div className="font-inter text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(212,175,55,0.55)" }}>{label}</div>
      <div className="font-inter text-xs font-semibold" style={{ color: valueColor || "rgba(255,255,255,0.92)" }}>{value || "—"}</div>
    </div>
  );
}

function EmptyCard({ labelEn, labelMl, messageEn, messageMl, lang, isLast, status = "neutral" }) {
  const s = STATUS[status];
  return (
    <div className="relative pl-8 pb-5">
      <span className="absolute left-[10px] top-2 w-3 h-3 rounded-full" style={{ background: s.dot, boxShadow: `0 0 10px ${s.dot}` }} />
      {!isLast && <span className="absolute left-[15px] top-5 bottom-0 w-px" style={{ background: "rgba(212,175,55,0.18)" }} />}
      <div className="rounded-2xl px-4 py-3"
        style={{ background: `linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)`, border: `1px solid ${s.border}` }}>
        <span className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: s.dot }}>
          {T(labelEn, labelMl, lang)}
        </span>
        <p className="mt-1 font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.58)" }}>
          {T(messageEn, messageMl, lang)}
        </p>
      </div>
    </div>
  );
}

export default function RitualTimeline({ analysis, liveTimeline, todayRemaining, liveRecommendation, now, lang }) {
  const nodes = useMemo(() => {
    if (!analysis) return [];
    const list = [];
    const liveNow = analysis.liveNow || {};
    const verdict = analysis.verdict;
    const forbidden = analysis.selectionAnalysis?.forbidden;
    const currentSuitable = analysis.currentSaatAnalysis?.suitable;

    // ── 1. NOW (current context) ──
    let curStatus = "unsuitable";
    if (forbidden) curStatus = "forbidden";
    else if (currentSuitable) curStatus = "suitable";

    const todayDateStr = (now || new Date()).toISOString().split("T")[0];
    const currentOpp = {
      dayName: MIZAN_DAY_NAMES[DAY_KEY_BY_INDEX[analysis.astroClockStatus?.activeWeekday]],
      dayKey: DAY_KEY_BY_INDEX[analysis.astroClockStatus?.activeWeekday],
      date: todayDateStr,
      hour: (liveNow.saat || 1) + (liveNow.laylNahar === "Layl" ? 12 : 0),
      period: liveNow.laylNahar === "Layl" ? "night" : "day",
      planet: liveNow.kawkab || liveNow.currentHour?.planet || "",
      startTime: "", endTime: "",
    };
    let curCompat = 0;
    try { curCompat = computeCompat(analysis, {}).final; } catch {}
    const curBookRules = (analysis.matchingRules || []).filter(r =>
      r.weekday === analysis.astroClockStatus?.activeWeekday &&
      r.period === currentOpp.period && r.saat_number === currentOpp.hour);
    const curBook = curBookRules.length ? Array.from(new Set(curBookRules.map(r => r.source))).join(" · ") : "";
    const curReason = curBookRules[0]?.text_en || analysis.selectionAnalysis?.originalSuitability || "";

    list.push({
      key: "now", status: curStatus,
      labelEn: "Now", labelMl: "ഇപ്പോൾ",
      opp: currentOpp, compat: curCompat, book: curBook, reason: curReason,
    });

    // ── 2. Next Suitable Saat Today ──
    const remaining = todayRemaining || [];
    if (remaining.length > 0) {
      const next = remaining[0];
      const br = bookAndReasonFor(analysis, next);
      list.push({
        key: "next-today", status: "upcoming",
        labelEn: "Next Suitable Saat Today", labelMl: "ഇന്നത്തെ അടുത്ത അനുയോജ്യ സഅാത്ത്",
        opp: next, compat: compatFor(analysis, next), book: br.book, reason: br.reason,
      });

      // ── 3. Remaining Suitable Saat Today (summary) ──
      if (remaining.length > 1) {
        list.push({
          key: "remaining-today", status: "upcoming", summary: true,
          labelEn: "Remaining Suitable Saat Today", labelMl: "ഇന്ന് ബാക്കിയുള്ള അനുയോജ്യ സഅാത്തുകൾ",
          count: remaining.length - 1,
          items: remaining.slice(1),
        });
      }

      // ── 4. Last Suitable Saat Today ──
      if (remaining.length > 1) {
        const last = remaining[remaining.length - 1];
        const br = bookAndReasonFor(analysis, last);
        list.push({
          key: "last-today", status: "upcoming",
          labelEn: "Last Suitable Saat Today", labelMl: "ഇന്നത്തെ അവസാന അനുയോജ്യ സഅാത്ത്",
          opp: last, compat: compatFor(analysis, last), book: br.book, reason: br.reason,
        });
      }
    } else {
      list.push({
        key: "none-today", status: "neutral", empty: true,
        labelEn: "No Suitable Saat Remains Today", labelMl: "ഇന്ന് അനുയോജ്യ സഅാത്ത് ബാക്കിയില്ല",
        messageEn: "Today's suitable Saats have passed. The timeline continues to tomorrow.",
        messageMl: "ഇന്നത്തെ അനുയോജ്യ സഅാത്തുകൾ കടന്നുപോയി. ടൈംലൈൻ നാളെയിലേക്ക് തുടരുന്നു.",
      });
    }

    // ── 5. Tomorrow ──
    const future = (liveTimeline || []).filter(o => o.daysAhead >= 1);
    const tomorrow = future.find(o => o.daysAhead === 1);
    if (tomorrow) {
      const br = bookAndReasonFor(analysis, tomorrow);
      list.push({
        key: "tomorrow", status: "upcoming",
        labelEn: "Tomorrow", labelMl: "നാളെ",
        opp: tomorrow, compat: compatFor(analysis, tomorrow), book: br.book, reason: br.reason,
      });
    } else {
      list.push({
        key: "tomorrow-none", status: "neutral", empty: true,
        labelEn: "Tomorrow", labelMl: "നാളെ",
        messageEn: "Tomorrow has no suitable Saat. Search continues to future days.",
        messageMl: "നാളെ അനുയോജ്യ സഅാത്തില്ല. ഭാവി ദിവസങ്ങളിലേക്ക് തിരയൽ തുടരുന്നു.",
      });
    }

    // ── 6. Next Suitable Opportunity (earliest future) ──
    const futureBeyondToday = future.filter(o => o.daysAhead >= 2);
    if (futureBeyondToday.length > 0) {
      const next = futureBeyondToday[0];
      const br = bookAndReasonFor(analysis, next);
      list.push({
        key: "next-future", status: "future",
        labelEn: "Next Suitable Opportunity", labelMl: "അടുത്ത അനുയോജ്യ അവസരം",
        opp: next, compat: compatFor(analysis, next), book: br.book, reason: br.reason,
      });
    }

    // ── 7. Future Opportunities (up to 2 more) ──
    const moreFuture = futureBeyondToday.slice(1, 3);
    moreFuture.forEach((o, i) => {
      const br = bookAndReasonFor(analysis, o);
      list.push({
        key: `future-${i}`, status: "future",
        labelEn: "Future Opportunity", labelMl: "ഭാവി അവസരം",
        opp: o, compat: compatFor(analysis, o), book: br.book, reason: br.reason,
      });
    });

    // ── 8. Best Future Recommendation (highest compatibility future) ──
    if (future.length > 0) {
      let best = future[0];
      let bestC = -1;
      for (const o of future) {
        const c = compatFor(analysis, o);
        if (c > bestC) { bestC = c; best = o; }
      }
      const br = bookAndReasonFor(analysis, best);
      list.push({
        key: "best-future", status: "best",
        labelEn: "Best Future Recommendation", labelMl: "മികച്ച ഭാവി ശുപാർശ",
        opp: best, compat: bestC, book: br.book, reason: br.reason,
      });
    }

    return list;
  }, [analysis, liveTimeline, todayRemaining, now]);

  if (!analysis) return null;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${G.border}`,
        boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)",
      }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
          <Navigation className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <div>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Ritual Timeline", "ആചാര ടൈംലൈൻ", lang)}
          </h3>
          <p className="font-inter text-[10px] mt-0.5" style={{ color: G.dim }}>
            {T("Navigation timeline — auto-updates every minute", "നാവിഗേഷൻ ടൈംലൈൻ — ഓരോ മിനിറ്റിലും സ്വയമേവ പുതുക്കുന്നു", lang)}
          </p>
        </div>
      </div>

      <div className="p-4 pt-5">
        {nodes.length === 0 && (
          <p className="font-inter text-xs text-center py-4" style={{ color: G.dim }}>
            {T("No timeline data available.", "ടൈംലൈൻ ഡാറ്റ ലഭ്യമല്ല.", lang)}
          </p>
        )}
        {nodes.map((n, i) => {
          const isLast = i === nodes.length - 1;
          if (n.empty) {
            return <EmptyCard key={n.key} labelEn={n.labelEn} labelMl={n.labelMl} messageEn={n.messageEn} messageMl={n.messageMl} lang={lang} isLast={isLast} status={n.status} />;
          }
          if (n.summary) {
            return (
              <div key={n.key} className="relative pl-8 pb-5">
                <span className="absolute left-[10px] top-2 w-3 h-3 rounded-full" style={{ background: STATUS.upcoming.dot, boxShadow: `0 0 10px ${STATUS.upcoming.dot}` }} />
                {!isLast && <span className="absolute left-[15px] top-5 bottom-0 w-px" style={{ background: "rgba(212,175,55,0.18)" }} />}
                <div className="rounded-2xl px-4 py-3"
                  style={{ background: `linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)`, border: `1px solid ${STATUS.upcoming.border}` }}>
                  <span className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: STATUS.upcoming.dot }}>
                    {T(n.labelEn, n.labelMl, lang)}
                  </span>
                  <p className="mt-1 font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.62)" }}>
                    {lang === "ml"
                      ? `ഇനി ${n.count} അനുയോജ്യ സഅാത്തുകൾ: ${n.items.map(o => `#${saatDisplayNum(o.hour, o.period)} · ${translatePlanet(o.planet, lang)}`).join(", ")}`
                      : `${n.count} more suitable Saat(s): ${n.items.map(o => `#${saatDisplayNum(o.hour, o.period)} · ${translatePlanet(o.planet, lang)}`).join(", ")}`}
                  </p>
                </div>
              </div>
            );
          }
          return <TimelineCard key={n.key} status={n.status} labelEn={n.labelEn} labelMl={n.labelMl} opp={n.opp} compat={n.compat} book={n.book} reason={n.reason} lang={lang} isLast={isLast} />;
        })}
      </div>
    </div>
  );
}
import { useMemo } from "react";
import { getUserLocation } from "@/lib/astroClockSunriseSunset.js";
import { bestTimesFor, fmtWhen } from "@/lib/kashfNextTimes.js";
import { PLANETS, ACTIVITIES } from "@/lib/kashfSaatData.js";
import { KASHF_DAY } from "@/lib/wafqSurround.js";

// ═══════════════════════════════════════════════════════════════
// When to write the square.
//
// Nothing is worked out here: the Astro Clock already computes the
// planetary day, the planetary hour and the Moon, and scores them
// against Kashf's own tables (day 45%, hour 35%, Moon 20%). This
// only asks it the question for the wafq's purpose and lays the
// answer out.
//
// Kashf p.253: "when beginning the work, first look to the hour
// that suits it, and the ascendant, and the khadim — only then is
// the work written and the oath sworn over it."
// ═══════════════════════════════════════════════════════════════

/** Which of the Astro Clock's aims the chosen angel's work falls under. */
export const ANGEL_ACTIVITY = {
  jibril: "marriage",   // love, acceptance, marriage — Venus (book p.13)
  mikail: "needs",      // provision and openings — Jupiter (book p.27)
  // The other two are the destructive pair. Kashf gives them no
  // planet or hour of their own, so no timing is derived for them.
};

function Row({ h, isEn }) {
  const loc = getUserLocation();
  const p = PLANETS[h.planet];
  const pct = Math.round(h.total);
  const tone = pct >= 80 ? "hi" : pct >= 60 ? "mid" : "lo";
  return (
    <li className={`t-row ${tone}${h.verdict === "avoid" ? " avoid" : ""}`}>
      <span className="pct">{pct}%</span>
      <span className="when">{fmtWhen(h.start, loc, isEn)}</span>
      <span className="pl">
        {p.symbol} {isEn ? p.en : p.ml} {isEn ? "hour" : "സാഅത്ത്"}
      </span>
      <span className="parts">
        {isEn ? "day" : "ദിവസം"} {Math.round(h.parts.day)} ·
        {" "}{isEn ? "hour" : "സാഅത്ത്"} {Math.round(h.parts.hour)} ·
        {" "}{isEn ? "moon" : "ചന്ദ്രൻ"} {Math.round(h.parts.moon)}
      </span>
      {h.verdict === "avoid" && (
        <span className="no">{isEn ? "Do not use" : "ഒഴിവാക്കുക"}</span>
      )}
      {h.why?.length > 0 && (
        <span className="why">
          {h.why
            .slice(0, 3)
            .map((w) => (typeof w === "string" ? w : isEn ? w.en : w.ml))
            .filter(Boolean)
            .join(" · ")}
        </span>
      )}
    </li>
  );
}

export default function WafqTiming({ angel, weekday, ml = true }) {
  const isEn = !ml;
  const actId = ANGEL_ACTIVITY[angel];
  const loc = getUserLocation();

  const res = useMemo(
    () => (actId ? bestTimesFor(actId, Date.now(), loc, 14, 8) : null),
    [actId, loc]
  );

  if (!actId) {
    // Kashf gives these two no planet or hour of their own. What the
    // book does say about the mansions — including the ones it marks
    // for فرقة and عداوة — is in the Astro Clock, in its own words.
    return (
      <p className="t-none">
        {ml
          ? "ഈ ഉദ്ദേശത്തിന് കിതാബ് ഒരു ഗ്രഹമോ സാഅത്തോ ചേർത്തുപറയുന്നില്ല. മൻസിലുകളെക്കുറിച്ച് കിതാബ് പറയുന്നതെല്ലാം — ⚠ ഉള്ളവ ഉൾപ്പെടെ — ആസ്ട്രോ ക്ലോക്കിൽ കിതാബിന്റെ വാക്കിൽത്തന്നെ ഉണ്ട്."
          : "Kashf attaches no planet or hour to this purpose. What it does say about the mansions — the ⚠ ones included — is in the Astro Clock, in the book's own words."}
      </p>
    );
  }

  const act = ACTIVITIES.find((a) => a.id === actId);
  const day = KASHF_DAY[weekday];
  const onChosenDay = [...(res?.aligned || []), ...(res?.best || [])]
    .filter((h) => h.wd === weekday);

  return (
    <div className="t-wrap">
      <p className="t-head">
        {ml ? "ഈ കർമ്മത്തിന്റെ സമയം" : "When to write it"} — {act.icon}{" "}
        {ml ? act.ml : act.en}
      </p>

      {/* the day the reader picked */}
      <h5>
        {ml ? `${day.ml}ാഴ്ചയിൽ` : `On ${day.ar}`} —{" "}
        <span dir="rtl">{day.planet}</span>
      </h5>
      {onChosenDay.length ? (
        <ul className="t-list">
          {onChosenDay.slice(0, 4).map((h) => (
            <Row key={h.start} h={h} isEn={isEn} />
          ))}
        </ul>
      ) : (
        <p className="t-none">
          {ml
            ? "ഈ ദിവസം ഈ കർമ്മത്തിന് നല്ല സാഅത്ത് വരുന്നില്ല. താഴെ കൊടുത്ത ദിവസങ്ങൾ നോക്കുക."
            : "No suitable hour falls on this day. See the days below."}
        </p>
      )}

      {/* day, hour and Moon all strong together */}
      {!!res.aligned.length && (
        <>
          <h5>{ml ? "മൂന്നും ഒത്തുവരുന്നത് — ഏറ്റവും ഉത്തമം" : "Day, hour and Moon together"}</h5>
          <ul className="t-list">
            {res.aligned.map((h) => <Row key={h.start} h={h} isEn={isEn} />)}
          </ul>
        </>
      )}

      {/* the next good hours whatever the day */}
      <h5>{ml ? "അടുത്ത നല്ല സമയങ്ങൾ" : "Next good times"}</h5>
      <ul className="t-list">
        {res.best.slice(0, 5).map((h) => <Row key={h.start} h={h} isEn={isEn} />)}
      </ul>

      <p className="t-note">
        {ml
          ? "കശ്ഫ് പേജ് 253: കർമ്മം തുടങ്ങുമ്പോൾ ആദ്യം ആ കർമ്മത്തിന് യോജിച്ച സാഅത്തും ത്വാലിഉം ഖാദിമും നോക്കണം — എന്നിട്ടാണ് എഴുതേണ്ടത്."
          : "Kashf p.253: first look to the hour that suits the work, the ascendant and the khadim — only then is it written."}
      </p>
    </div>
  );
}

import { useMemo, useState } from "react";
import WafqSheet from "./WafqSheet";
import {
  ARCHANGELS, PLANET_HADIM, DAY_PLANET, DAY_NAME_AR,
  CORNER_VERSE, splitFour,
} from "../../lib/wafqSurround";

// ═══════════════════════════════════════════════════════════════
// Choosing what goes around the square, and seeing it drawn.
//
//   1. the work's angel — picked by what the working is for
//   2. the day it will be written — gives that day's angel and jinn
//   3. the besmele, and the verse for the four corners
//
// Kashf condition 34 and Hâvâss pp.187–192 agree on Jibrāʾīl and
// Mīkāʾīl and part company on the other two, so both readings are
// shown rather than one being quietly picked.
// ═══════════════════════════════════════════════════════════════

const DAYS_ML = [
  "ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി",
];

export default function WafqSurroundPanel({ grid, ml = true }) {
  const [angel, setAngel] = useState("jibril");
  const [fourAngels, setFourAngels] = useState(false);
  const [weekday, setWeekday] = useState(() => new Date().getDay());
  const [besmele, setBesmele] = useState(true);
  const [verse, setVerse] = useState(CORNER_VERSE);

  const day = PLANET_HADIM[DAY_PLANET[weekday]];
  const parts = useMemo(() => splitFour(verse), [verse]);

  return (
    <div className="wsp">
      {/* ── 1. what the working is for ── */}
      <section>
        <h4>{ml ? "ഏത് മലക്ക്?" : "Which angel"}</h4>
        <p className="hint">
          {ml
            ? "കർമ്മത്തിന്റെ ഉദ്ദേശം നോക്കി തിരഞ്ഞെടുക്കുക. തിരഞ്ഞെടുത്ത മലക്കിന്റെ പേരാണ് കളത്തിന് ചുറ്റും നാല് വശത്തും വരിക."
            : "Pick by what the working is for; that name is written on all four sides."}
        </p>
        <div className="grid">
          {ARCHANGELS.map((a) => (
            <button key={a.id} type="button"
                    className={`card${angel === a.id ? " on" : ""}${a.harm ? " harm" : ""}`}
                    onClick={() => setAngel(a.id)}>
              <span className="ar">{a.ar}</span>
              <span className="nm">{ml ? a.ml : a.id}</span>
              <span className="use">{ml ? a.kashf_ml : a.kashf_en}</span>
              {(ml ? a.kashf_ml : a.kashf_en) !== (ml ? a.havass_ml : a.havass_en) && (
                <span className="alt">
                  {ml ? "ഹവാസ്: " : "Hâvâss: "}{ml ? a.havass_ml : a.havass_en}
                </span>
              )}
            </button>
          ))}
        </div>
        <label className="chk">
          <input type="checkbox" checked={fourAngels}
                 onChange={(e) => setFourAngels(e.target.checked)} />
          {ml
            ? "നാല് മലക്കുകളുടെയും പേര് വേണം (ج ا م ع ക്രമത്തിൽ)"
            : "Write all four, in the ج ا م ع order"}
        </label>
      </section>

      {/* ── 2. the day it will be written ── */}
      <section>
        <h4>{ml ? "ഏത് ദിവസം എഴുതുന്നു?" : "Which day"}</h4>
        <div className="days">
          {DAYS_ML.map((d, i) => (
            <button key={d} type="button"
                    className={`day${weekday === i ? " on" : ""}`}
                    onClick={() => setWeekday(i)}>
              {ml ? d : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i]}
            </button>
          ))}
        </div>
        <p className="hint">
          {ml ? "ആ ദിവസത്തിന്റെ മലക്കും ജിന്നും തനിയെ വരും: " : "That day's angel and jinn: "}
          <b dir="rtl">{DAY_NAME_AR[weekday]}</b> — <b dir="rtl">{day.ulvi}</b> ({day.ulvi_ml}),
          {" "}<b dir="rtl">{day.sufli}</b> ({day.sufli_ml})
        </p>
      </section>

      {/* ── 3. besmele and the corner verse ── */}
      <section>
        <label className="chk">
          <input type="checkbox" checked={besmele}
                 onChange={(e) => setBesmele(e.target.checked)} />
          {ml ? "ബിസ്മി കളത്തിന് ചുറ്റും" : "The besmele around the square"}
        </label>
        <label className="fld">
          <span>{ml ? "മൂലയിലെ ആയത്ത്" : "Corner verse"}</span>
          <input dir="rtl" value={verse} onChange={(e) => setVerse(e.target.value)} />
        </label>
        {!parts && (
          <p className="warn">
            {ml
              ? "ഈ ആയത്ത് നാലായി മുറിക്കാൻ പറ്റില്ല — നാല് വാക്കെങ്കിലും വേണം. വാക്കിന്റെ ഇടയ്ക്ക് മുറിക്കില്ല."
              : "This cannot be split into four — at least four words are needed, and a word is never broken."}
          </p>
        )}
        {parts && (
          <p className="hint" dir="rtl">
            {parts.join("  ·  ")}
          </p>
        )}
      </section>

      <div className="sheet">
        <WafqSheet grid={grid} angel={angel} fourAngels={fourAngels}
                   weekday={weekday} besmele={besmele} verse={verse} />
      </div>
    </div>
  );
}

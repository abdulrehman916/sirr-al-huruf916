import { useMemo, useState } from "react";
import * as H from "@/lib/wafqHadim";

// ═══════════════════════════════════════════════════════════════
// A vefk's hâdims — Hâvâss I pp. 196-198.
//
// Eight points of the square, each giving three names: ulvî, suflî
// and şer. The reckoning is shown alongside every name, because the
// name is only as good as the number it came from, and the reader
// should be able to check it against the page.
// ═══════════════════════════════════════════════════════════════

const GOLD = "#F5D060";

const TAB = (on) => ({
  background: on ? "rgba(212,175,55,0.18)" : "transparent",
  color: on ? GOLD : "rgba(255,255,255,0.6)",
  border: `1px solid ${on ? "rgba(212,175,55,0.55)" : "rgba(212,175,55,0.22)"}`,
});

export default function HadimPanel({ grid, miftah, ml = true }) {
  const isEn = !ml;
  const txt = (m, e) => (isEn ? e : m);
  const [cls, setCls] = useState("ulvi");
  const [showAvan, setShowAvan] = useState(false);

  const pts = useMemo(() => (grid ? H.eightPoints(grid, miftah) : []), [grid, miftah]);
  const hads = useMemo(() => (grid ? H.hadimsOf(grid, miftah) : []), [grid, miftah]);
  const avan = useMemo(() => (grid && showAvan ? H.esmaulAvan(grid) : []), [grid, showAvan]);
  const kir = useMemo(() => (grid ? H.kiran(grid) : null), [grid]);

  if (!grid) return null;
  const C = H.HADIM_CLASS[cls];

  return (
    <div className="space-y-3">
      <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>
        {isEn ? H.HADIM_NOTE.en : H.HADIM_NOTE.ml}
      </p>

      {/* the eight points */}
      <div className="rounded-xl p-3 space-y-1"
           style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.22)" }}>
        <p className="font-inter text-[10px] font-bold" style={{ color: GOLD }}>
          {txt("കള്ളിയുടെ എട്ട് സ്ഥാനങ്ങൾ", "The eight points of the square")}
        </p>
        {pts.map((p) => (
          <p key={p.id} className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>
            <span className="font-amiri" style={{ color: GOLD }}>{p.ar}</span>{" "}
            {isEn ? p.ml.split(" — ")[0] : p.ml} = <b style={{ color: "#fff" }}>{p.v}</b>
          </p>
        ))}
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
          <span className="font-amiri">قران</span> {txt("കിറാൻ — മബ്ദഉം മുൻതഹായും", "Kıran — mebde plus müntaha")}: {kir}
        </p>
      </div>

      {/* which class of hâdim */}
      <div className="flex gap-1.5">
        {Object.entries(H.HADIM_CLASS).map(([k, c]) => (
          <button key={k} type="button" onClick={() => setCls(k)}
                  className="flex-1 py-2 rounded-xl font-inter text-[10px] font-bold"
                  style={{ ...TAB(cls === k), ...(c.harm && cls === k ? { color: "#FCA5A5" } : {}) }}>
            {isEn ? c.en : c.ml}
          </button>
        ))}
      </div>

      <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
        {txt(`ഓരോ സ്ഥാനത്തിന്റെ സംഖ്യയിൽ നിന്ന് ${C.sub} കുറയ്ക്കുന്നു, ബാക്കിയെ അക്ഷരമാക്കി നുത്ഖ് ചെയ്ത് അതിന്റെ പിന്നിൽ ${C.tr} ചേർക്കുന്നു. കുറയ്ക്കാൻ പറ്റാത്തപ്പോൾ ആദ്യം ദേവ്രി ഫെലക് ${H.DEVRI_FELAK} കൂട്ടുന്നു (ബിസ്മിയിലെ 19 അക്ഷരത്തിന്റെ വർഗ്ഗം).`,
             `From each point's number ${C.sub} is subtracted, the remainder is spoken as letters, and ${C.tr} is put after it. Where it cannot be subtracted, the devri felak ${H.DEVRI_FELAK} is added first — nineteen, the besmele's letters, squared.`)}
      </p>

      <div className="space-y-1.5">
        {hads.map((h) => {
          const d = h[cls];
          return (
            <div key={h.point.id} className="rounded-lg px-2.5 py-1.5"
                 style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="font-amiri text-xl"
                 style={{ color: C.harm ? "#FCA5A5" : "#fff", direction: "rtl" }}>
                {d.name}
              </p>
              <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                {isEn ? h.point.tr : h.point.ml.split(" — ")[0]} {d.value}
                {d.devri ? ` + ${H.DEVRI_FELAK} = ${d.used}` : ""} − {C.sub} = {d.rest}
                {" → "}
                {d.parts.map((x) => `${x.v}`).join(" + ")}
              </p>
            </div>
          );
        })}
      </div>

      <button type="button" onClick={() => setShowAvan(!showAvan)}
              className="w-full py-2 rounded-xl font-inter text-[11px] font-bold" style={TAB(showAvan)}>
        <span className="font-amiri">أسماء الأعوان</span>{" "}
        {txt("എസ്മാഉൽ അവാൻ", "Esmaül Avan")} ({grid.flat().length})
      </button>

      {showAvan && (
        <div className="space-y-1">
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
            {txt("കള്ളിയിലെ എല്ലാ വീടുകളിലെയും സംഖ്യകൾ സ്വാഭാവിക ക്രമത്തിൽ നുത്ഖ് ചെയ്ത്, ഓരോന്നിന്റെയും പിന്നിൽ ത്വാഇൽ ചേർക്കുന്നു. വീടുകൾ എത്രയോ അത്ര എണ്ണം.",
                 "Every house of the square spoken in the natural order, each with Tatil after it — as many as the square has houses.")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {avan.map((a, i) => (
              <span key={i} className="px-2 py-1 rounded-lg font-amiri text-base"
                    style={{ background: "rgba(255,255,255,0.04)", color: "#fff", direction: "rtl" }}
                    title={String(a.v)}>
                {a.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

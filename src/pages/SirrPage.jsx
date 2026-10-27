// ═══════════════════════════════════════════════════════════════
// SIRR PAGE — secret du'as and remedies
// ═══════════════════════════════════════════════════════════════
// Two cards: the du'as (മന്ത്ര ദുആകൾ) and the remedies (മരുന്നുകൾ).
// Every item is taken word for word from page images of the source
// book; nothing is left out. The data lives in sirrDuasData.js.
// ═══════════════════════════════════════════════════════════════
import { useMemo, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { SIRR_ENTRIES } from "@/lib/sirrDuasData";

const GOLD = "#D4AF37";
const INK = "rgba(255,255,255,0.86)";
const DIM = "rgba(255,255,255,0.55)";
const LINE = "rgba(212,175,55,0.2)";

// Subject cards, in the order they are shown.
const CATS = {
  protection: { ml: "കാവൽ, സുരക്ഷ", ar: "الحفظ والتحصين", icon: "🛡" },
  sihr: { ml: "സിഹ്റ്, കണ്ണേറ്", ar: "السحر والعين", icon: "🧿" },
  jinn: { ml: "ജിന്ന് ബാധ — പുറത്താക്കൽ, നശിപ്പിക്കൽ", ar: "الجن", icon: "🔥" },
  needs: { ml: "ആവശ്യങ്ങൾ, ഉപജീവനം, ധനം", ar: "الحوائج والأرزاق", icon: "🗝" },
  hayba: { ml: "ഹൈബത്ത് — അധികാരികളുടെ മുന്നിൽ", ar: "الهيبة والدخول على الظلمة", icon: "👑" },
  love: { ml: "സ്നേഹം, രഞ്ജിപ്പ്", ar: "المحبة والصلح", icon: "🤝" },
  family: { ml: "കുടുംബം, മക്കൾ", ar: "الأولاد", icon: "👶" },
  health: { ml: "രോഗശമനം", ar: "الشفاء", icon: "💧" },
  knowledge: { ml: "അറിവ്, ഓർമ്മ, മനസ്സ്", ar: "العلم والحفظ", icon: "📖" },
  istikhara: { ml: "ഇസ്തിഖാറ, സ്വപ്നം", ar: "الاستخارة والرؤيا", icon: "🌙" },
  diagnosis: { ml: "രോഗകാരണം അറിയൽ", ar: "معرفة سبب المرض", icon: "🔍" },
  salawat: { ml: "സ്വലാത്തുകൾ", ar: "الصلوات", icon: "✨" },
  medicine: { ml: "ശരീരരോഗങ്ങൾ", ar: "الأمراض", icon: "🌿" },
  general: { ml: "മറ്റുള്ളവ", ar: "متفرقات", icon: "•" },
};
const CAT_ORDER = Object.keys(CATS);

function Card({ onClick, children, big }) {
  return (
    <button onClick={onClick} className={`w-full text-left rounded-2xl ${big ? "p-6" : "p-4"} transition hover:scale-[1.01]`}
      style={{ background: "linear-gradient(160deg, rgba(212,175,55,0.10), rgba(0,0,0,0.25))", border: `1px solid ${LINE}` }}>
      {children}
    </button>
  );
}

function Back({ onClick, label }) {
  return (
    <button onClick={onClick} className="font-inter text-xs mb-4 px-3 py-1.5 rounded-full" style={{ color: GOLD, border: `1px solid ${LINE}` }}>
      ← {label}
    </button>
  );
}

function Count({ n }) {
  if (!n) return null;
  return (
    <span className="font-inter text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: "#111", background: GOLD }}>
      {/^[\d /]+$/.test(n) ? `${n} തവണ` : /^[\d /]+\s—/.test(n) ? n.replace(/^([\d /]+?)\s—/, "$1 തവണ —") : n}
    </span>
  );
}

// "[ ]" marks a word missing in the print; show it softly.
function ArText({ text, size = "text-xl" }) {
  const parts = String(text).split(/(\[[^\]]+\])/);
  return (
    <p dir="rtl" className={`font-amiri ${size} leading-loose`} style={{ color: GOLD }}>
      {parts.map((p, i) => (p.startsWith("[") ? <span key={i} style={{ color: "#9AD0FF" }}>{p}</span> : <span key={i}>{p}</span>))}
    </p>
  );
}

function Entry({ e, byId }) {
  const [open, setOpen] = useState(false);
  const isDua = e.kind === "dua";
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${LINE}`, background: "rgba(0,0,0,0.22)" }}>
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 flex items-start gap-3">
        <span className="font-inter text-xs mt-1" style={{ color: GOLD }}>{open ? "▾" : "▸"}</span>
        <span className="flex-1">
          <span className="block font-inter text-[15px] font-semibold" style={{ color: INK }}>{e.ml.title}</span>
          <span dir="rtl" className="block font-amiri text-base mt-1" style={{ color: "rgba(212,175,55,0.75)" }}>{e.title}</span>
        </span>
      </button>
      {open && (
        <div className="px-4 pb-5 space-y-4">
          <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(212,175,55,0.06)" }}>
            <p className="font-inter text-sm" style={{ color: INK }}><b style={{ color: GOLD }}>എന്തിന്: </b>{e.ml.why}</p>
            <p className="font-inter text-sm leading-relaxed" style={{ color: INK }}><b style={{ color: GOLD }}>എങ്ങനെ: </b>{e.ml.how}</p>
          </div>

          {e.intro && (
            <details>
              <summary className="font-inter text-xs cursor-pointer" style={{ color: DIM }}>കിതാബിലെ വിവരണം (അറബിയിൽ)</summary>
              <p dir="rtl" className="font-amiri text-base leading-loose mt-2" style={{ color: "rgba(255,255,255,0.75)" }}>{e.intro}</p>
            </details>
          )}

          <div className="space-y-3">
            {e.lines.map((l, i) => {
              const ref = l.ref && byId[l.ref];
              const shown = isDua && l.v ? l.v : l.ar;
              return (
                <div key={i} className="rounded-xl p-3" style={{ border: `1px solid ${LINE}` }}>
                  {(l.n || e.lines.length > 1) && (
                    <div className="flex items-center gap-2 mb-1">
                      {e.lines.length > 1 && <span className="font-inter text-[11px]" style={{ color: DIM }}>{i + 1}.</span>}
                      <Count n={l.n} />
                    </div>
                  )}
                  <ArText text={shown} size={isDua ? "text-xl" : "text-lg"} />
                  {l.mean && <p className="font-inter text-sm leading-relaxed mt-2" style={{ color: INK }}><b style={{ color: GOLD }}>അർത്ഥം: </b>{l.mean}</p>}
                  {l.note && <p className={`${/[؀-ۿ]/.test(l.note) ? "font-amiri text-base" : "font-inter text-xs"} mt-2`} dir={/[؀-ۿ]/.test(l.note) ? "rtl" : "ltr"} style={{ color: DIM }}>{l.note}</p>}
                  {ref && <p className="font-inter text-xs mt-2" style={{ color: DIM }}>മുഴുവൻ വാചകം: “{ref.ml.title}” എന്ന കാർഡിൽ.</p>}
                  {isDua && l.v && l.ar && l.v !== l.ar && (
                    <details className="mt-2">
                      <summary className="font-inter text-[11px] cursor-pointer" style={{ color: DIM }}>അച്ചടിയിലെ രൂപം</summary>
                      <p dir="rtl" className="font-amiri text-base leading-loose mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>{l.ar}</p>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SirrPage() {
  const [view, setView] = useState("home"); // home | dua | remedy
  const [cat, setCat] = useState(null);
  const [q, setQ] = useState("");
  const byId = useMemo(() => Object.fromEntries(SIRR_ENTRIES.map((e) => [e.id, e])), []);

  const pool = SIRR_ENTRIES.filter((e) => e.kind === view);
  const cats = CAT_ORDER.map((c) => ({ c, items: pool.filter((e) => e.cat === c) })).filter((x) => x.items.length);
  const query = q.trim();
  const found = query
    ? pool.filter((e) => [e.ml.title, e.ml.why, e.title, e.intro, ...e.lines.map((l) => `${l.ar} ${l.v || ""} ${l.mean || ""}`)].join(" ").includes(query))
    : null;
  const go = (v) => { setView(v); setCat(null); setQ(""); window.scrollTo?.(0, 0); };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-amiri text-4xl text-center" style={{ color: GOLD }}>السرّ</h1>

        {view === "home" && (
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <Card big onClick={() => go("dua")}>
              <span dir="rtl" className="block font-amiri text-2xl" style={{ color: GOLD }}>الأدعية والعزائم</span>
              <span className="block font-inter text-lg font-semibold mt-2" style={{ color: INK }}>മന്ത്ര ദുആകൾ / സിർ രഹസ്യ ദുആകൾ</span>
              <span className="block font-inter text-xs mt-2" style={{ color: DIM }}>കാവൽ, സിഹ്റ്, ജിന്ന്, ആവശ്യങ്ങൾ, ഹൈബത്ത്… — ഓതേണ്ട വാചകം, എണ്ണം, നിബന്ധന, അർത്ഥം.</span>
            </Card>
            <Card big onClick={() => go("remedy")}>
              <span dir="rtl" className="block font-amiri text-2xl" style={{ color: GOLD }}>الأدوية والوصفات</span>
              <span className="block font-inter text-lg font-semibold mt-2" style={{ color: INK }}>മരുന്നുകൾ</span>
              <span className="block font-inter text-xs mt-2" style={{ color: DIM }}>ഓരോ മരുന്നും എന്തിനാണ്, എങ്ങനെ ഉണ്ടാക്കണം, എങ്ങനെ ഉപയോഗിക്കണം.</span>
            </Card>
          </div>
        )}

        {view !== "home" && (
          <div className="mt-6">
            <Back onClick={() => (cat && !query ? setCat(null) : go("home"))} label={cat && !query ? "വിഷയങ്ങൾ" : "തുടക്കം"} />
            <h2 className="font-inter text-xl font-semibold" style={{ color: INK }}>{view === "dua" ? "മന്ത്ര ദുആകൾ" : "മരുന്നുകൾ"}</h2>
            <p className="font-inter text-xs mt-1 mb-4" style={{ color: DIM }}>
              {view === "dua"
                ? "ഓരോ ദുആയും ഹറകത്തോടെ; മലയാളം അർത്ഥം താഴെ. അർത്ഥമില്ലാത്ത (രഹസ്യ) വാക്കുകൾ കിതാബിലുള്ളതുപോലെ തന്നെ. നീല [ ] = അച്ചടിയിൽ വിട്ടുപോയ വാക്ക്. അച്ചടിയിലെ മൂലരൂപം ഓരോ വരിക്കും താഴെ കാണാം."
                : "കിതാബിലെ പാരമ്പര്യ കുറിപ്പുകളാണ് — വാചകം അതേപടി, ഒപ്പം മലയാളം വിശദീകരണം. ചില ചെടികൾ വിഷമുള്ളവയാണ്; അറിവുള്ളവരോട് ചോദിച്ച ശേഷമേ ഉപയോഗിക്കാവൂ."}
            </p>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="തിരയുക — മലയാളത്തിലോ അറബിയിലോ"
              className="w-full rounded-xl px-3 py-2 mb-5 font-inter text-sm bg-transparent outline-none" style={{ border: `1px solid ${LINE}`, color: INK }} />

            {found ? (
              <div className="space-y-3">
                <p className="font-inter text-xs" style={{ color: DIM }}>{found.length} എണ്ണം</p>
                {found.map((e) => <Entry key={e.id} e={e} byId={byId} />)}
              </div>
            ) : !cat ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cats.map(({ c, items }) => (
                  <Card key={c} onClick={() => setCat(c)}>
                    <span className="flex items-center gap-3">
                      <span className="text-2xl">{CATS[c].icon}</span>
                      <span className="flex-1">
                        <span className="block font-inter text-[15px] font-semibold" style={{ color: INK }}>{CATS[c].ml}</span>
                        <span dir="rtl" className="block font-amiri text-sm" style={{ color: "rgba(212,175,55,0.75)" }}>{CATS[c].ar}</span>
                      </span>
                      <span className="font-inter text-xs" style={{ color: DIM }}>{items.length}</span>
                    </span>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-inter text-base font-semibold" style={{ color: GOLD }}>{CATS[cat].icon} {CATS[cat].ml}</h3>
                {pool.filter((e) => e.cat === cat).map((e) => <Entry key={e.id} e={e} byId={byId} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

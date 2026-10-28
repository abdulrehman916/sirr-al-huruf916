// ═══════════════════════════════════════════════════════════════
// Mujarrabat — subject cards → tabs by kind → entries
// ═══════════════════════════════════════════════════════════════
// Each card: what it is for, the steps in Malayalam, the figure to draw,
// the text to recite or write (vocalised, with count and meaning), other
// ways to use it, and the source text word for word (collapsed).
// The source book's title is never shown anywhere on the site.
import { useEffect, useMemo, useState } from "react";
import { OMAN_BOOK, OMAN_TOPICS, OMAN_HEALTH_SUBS, OMAN_KINDS, OMAN_TAWKIL, loadOmanTopic, loadOmanQuran } from "@/lib/omanTopics";
import { OMAN_INTRO } from "@/lib/omanIntro";
import { buildHaystack, matchesAll, queryWords } from "@/lib/sirrSearch";

const GOLD = "#D4AF37";
const INK = "rgba(255,255,255,0.86)";
const DIM = "rgba(255,255,255,0.55)";
const LINE = "rgba(212,175,55,0.2)";
// Clear printed Arabic with full harakat (Quranic marks included).
const RECITE_FONT = "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif";
const KIND = Object.fromEntries(OMAN_KINDS.map((k) => [k.id, k]));

function Card({ onClick, children }) {
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl p-4 transition hover:scale-[1.01]"
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

function Figure({ src }) {
  const [big, setBig] = useState(false);
  const url = `/figures/oman/${src}`;
  return (
    <>
      <button onClick={() => setBig(true)} className="block w-full rounded-xl overflow-hidden bg-white">
        <img src={url} alt="" loading="lazy" className="w-full h-auto" />
      </button>
      {big && (
        <div onClick={() => setBig(false)} className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background: "rgba(0,0,0,0.9)" }}>
          <img src={url} alt="" className="max-w-full max-h-full bg-white rounded" />
        </div>
      )}
    </>
  );
}

function QuranRef({ r, quran }) {
  const [ref, n] = r;
  const q = quran?.[ref];
  const [open, setOpen] = useState(false);
  if (!q) return null;
  const whole = !ref.includes(":");
  return (
    <div className="rounded-xl p-3" style={{ border: `1px solid ${LINE}`, background: "rgba(212,175,55,0.04)" }}>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span dir="rtl" className="font-amiri text-base" style={{ color: GOLD }}>
          {whole ? `سورة ${q.name}` : `${q.name} ${q.n.length > 1 ? `${q.n[0]}–${q.n[q.n.length - 1]}` : q.n[0]}`}
        </span>
        {n && <span className="font-inter text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#111", background: GOLD }}>{/^\d+$/.test(n) ? `${n} തവണ` : n}</span>}
      </div>
      <p dir="rtl" lang="ar" className="text-[1.7rem] leading-[2.5]" style={{ color: "#F3E2A6", fontFamily: RECITE_FONT }}>
        {whole && q.s !== 1 && q.s !== 9 && <span className="block">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>}
        {q.ar.map((a, i) => <span key={i}>{a} <span style={{ color: DIM }} className="text-sm">﴿{q.n[i]}﴾</span> </span>)}
      </p>
      <button onClick={() => setOpen(!open)} className="font-inter text-[11px] mt-1" style={{ color: DIM }}>{open ? "▾" : "▸"} മലയാളം അർത്ഥം</button>
      {open && (
        <div className="mt-1 space-y-1">
          {q.ml.map((m, i) => <p key={i} className="font-inter text-sm leading-relaxed" style={{ color: INK }}><span style={{ color: DIM }}>{q.n[i]}. </span>{m}</p>)}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="font-inter text-[12px] font-bold tracking-wide" style={{ color: GOLD }}>{label}</p>
      {children}
    </div>
  );
}

function CountChip({ n }) {
  if (!n) return null;
  return (
    <span className="font-inter text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: "#111", background: GOLD }}>
      {/^\d+$/.test(String(n)) ? `${n} തവണ` : n}
    </span>
  );
}

// One text to recite / write: label, count, the Arabic in clear print, meaning.
function Recite({ r, i, total }) {
  return (
    <div className="rounded-xl p-3" style={{ border: `1px solid ${LINE}`, background: "rgba(212,175,55,0.04)" }}>
      {(r.t || r.n || total > 1) && (
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {total > 1 && <span className="font-inter text-[11px]" style={{ color: DIM }}>{i + 1}.</span>}
          {r.t && <span className="font-inter text-[13px] font-semibold" style={{ color: INK }}>{r.t}</span>}
          <CountChip n={r.n} />
        </div>
      )}
      {r.grid && (
        <table dir="rtl" className="mx-auto my-2 border-collapse" style={{ fontFamily: RECITE_FONT }}>
          <tbody>
            {r.grid.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="text-center align-middle px-3 py-1 text-[1.6rem]" style={{ border: `1.5px solid ${GOLD}`, color: "#F3E2A6", minWidth: "3rem", height: "3rem" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {r.ar && <p dir="rtl" lang="ar" className="text-[1.7rem] leading-[2.5] whitespace-pre-line" style={{ color: "#F3E2A6", fontFamily: RECITE_FONT }}>{r.ar}</p>}
      {r.mean && (
        <p className="font-inter text-sm leading-relaxed mt-2" style={{ color: INK }}><b style={{ color: GOLD }}>അർത്ഥം: </b>{r.mean}</p>
      )}
    </div>
  );
}

function Entry({ e, quran, topicLabel }) {
  const [open, setOpen] = useState(false);
  const c = e.c;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${LINE}`, background: "rgba(0,0,0,0.22)" }}>
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 flex items-start gap-3">
        <span className="font-inter text-xs mt-1" style={{ color: GOLD }}>{open ? "▾" : "▸"}</span>
        <span className="flex-1">
          <span className="block font-inter text-[15px] font-semibold" style={{ color: INK }}>{e.ml.title}</span>
          <span dir="rtl" className="block font-amiri text-base mt-1" style={{ color: "rgba(212,175,55,0.75)" }}>{e.ar}</span>
          {topicLabel && <span className="block font-inter text-[10px] mt-1" style={{ color: DIM }}>{topicLabel}</span>}
        </span>
        <span className="font-inter text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: GOLD, border: `1px solid ${LINE}` }}>{KIND[e.k]?.ml}</span>
      </button>
      {open && (
        <div className="px-4 pb-5 space-y-5">
          <p className="font-inter text-sm leading-relaxed rounded-xl p-3" style={{ color: INK, background: "rgba(212,175,55,0.06)" }}>
            <b style={{ color: GOLD }}>ഇത് എന്തിന്: </b>{c?.why || e.ml.why}
          </p>

          <Section label="① ചെയ്യേണ്ടത്">
            {c?.steps?.length ? (
              <ol className="space-y-2">
                {c.steps.map((s, i) => (
                  <li key={i} className="flex gap-2 font-inter text-sm leading-relaxed" style={{ color: INK }}>
                    <span className="font-bold shrink-0" style={{ color: GOLD }}>{i + 1}.</span><span>{s}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="font-inter text-sm leading-relaxed whitespace-pre-line" style={{ color: INK }}>{e.ml.how}</p>
            )}
          </Section>

          {(c?.warn || e.ml.warn) && (
            <p className="font-inter text-sm leading-relaxed rounded-xl p-3" style={{ color: "#FFB4A8", border: "1px solid rgba(255,120,100,0.35)", background: "rgba(255,80,60,0.06)" }}>
              ⚠ {c?.warn || e.ml.warn}
            </p>
          )}

          {e.figs?.length > 0 && (
            <Section label={e.figs.length > 1 ? "② ചിത്രങ്ങൾ — ഇതുപോലെ വരയ്ക്കുക / എഴുതുക" : "② ചിത്രം — ഇതുപോലെ വരയ്ക്കുക / എഴുതുക"}>
              {c?.fig && <p className="font-inter text-sm leading-relaxed" style={{ color: INK }}>{c.fig}</p>}
              <div className="space-y-2">{e.figs.map((f) => <Figure key={f} src={f} />)}</div>
              <p className="font-inter text-[11px]" style={{ color: DIM }}>ചിത്രത്തിൽ തൊട്ടാൽ വലുതായി കാണാം.</p>
            </Section>
          )}

          {(c?.recite?.length > 0 || e.q?.length > 0 || c?.tk) && (
            <Section label={`${e.figs?.length ? "③" : "②"} ${c?.reciteLabel || "ഇതാണ് ഓതേണ്ടത് / എഴുതേണ്ടത്"}`}>
              <div className="space-y-2">
                {c?.recite?.map((r, i) => <Recite key={i} r={r} i={i} total={c.recite.length} />)}
                {e.q?.map((r, i) => <QuranRef key={`q${i}`} r={r} quran={quran} />)}
                {c?.tk && OMAN_TAWKIL[c.tk] && <Recite r={OMAN_TAWKIL[c.tk]} i={0} total={1} />}
              </div>
            </Section>
          )}

          {!c && e.ml.mean && (
            <p className="font-inter text-sm leading-relaxed" style={{ color: INK }}><b style={{ color: GOLD }}>അർത്ഥം: </b>{e.ml.mean}</p>
          )}

          {c?.opts?.length > 0 && (
            <Section label="മറ്റു രീതികൾ">
              <ul className="space-y-2">
                {c.opts.map((s, i) => (
                  <li key={i} className="flex gap-2 font-inter text-sm leading-relaxed" style={{ color: INK }}>
                    <span style={{ color: GOLD }}>◆</span><span>{s}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {c?.note && <p className="font-inter text-xs leading-relaxed" style={{ color: DIM }}>{c.note}</p>}

          {e.src && (
            <details className="rounded-xl p-3" style={{ border: `1px solid ${LINE}` }}>
              <summary className="font-inter text-[11px] cursor-pointer" style={{ color: DIM }}>മൂലവാചകം (അറബിയിൽ, അതേപടി)</summary>
              <p dir="rtl" lang="ar" className="font-amiri text-lg leading-loose whitespace-pre-line mt-2" style={{ color: "rgba(255,255,255,0.75)" }}>{e.src}</p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function Intro() {
  return (
    <div className="space-y-4">
      {OMAN_INTRO.map((s, i) => (
        <div key={i} className="rounded-2xl p-4" style={{ border: `1px solid ${LINE}`, background: "rgba(0,0,0,0.22)" }}>
          <h3 className="font-inter text-base font-semibold" style={{ color: GOLD }}>{s.ml}</h3>
          {s.ar && <p dir="rtl" className="font-amiri text-sm mt-1" style={{ color: "rgba(212,175,55,0.75)" }}>{s.ar}</p>}
          <div className="mt-2 space-y-2">
            {s.body.map((p, j) => <p key={j} className="font-inter text-sm leading-relaxed" style={{ color: INK }}>{p}</p>)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OmanMujarrabat({ onExit }) {
  const [topic, setTopic] = useState(null); // topic id | "intro"
  const [items, setItems] = useState(null);
  const [quran, setQuran] = useState(null);
  const [kind, setKind] = useState(null);
  const [sub, setSub] = useState(null);
  const [q, setQ] = useState("");
  const [all, setAll] = useState(null);

  useEffect(() => { loadOmanQuran().then(setQuran); }, []);
  useEffect(() => {
    if (!topic || topic === "intro") return;
    setItems(null); setKind(null); setSub(null);
    loadOmanTopic(topic).then(setItems);
  }, [topic]);
  const query = q.trim();
  useEffect(() => {
    if (!query || all) return;
    Promise.all(OMAN_TOPICS.map((t) => loadOmanTopic(t.id).then((rs) => rs.map((e) => ({ e, topic: t.id })))))
      .then((rs) => setAll(rs.flat().map((x) => ({ ...x, hay: buildHaystack(x.e.ml, x.e.c, x.e.ar, x.e.src, KIND[x.e.k]?.ml) }))));
  }, [query, all]);

  const found = useMemo(() => {
    if (!query || !all) return null;
    const words = queryWords(query);
    return all.filter((x) => matchesAll(x.hay, words));
  }, [query, all]);
  const topicLabel = (id) => { const x = OMAN_TOPICS.find((t) => t.id === id); return x ? `${x.icon} ${x.ml}` : ""; };

  const pool = useMemo(() => (items || []).filter((e) => !sub || e.sub === sub), [items, sub]);
  const kinds = OMAN_KINDS.map((k) => ({ ...k, n: pool.filter((e) => e.k === k.id).length })).filter((k) => k.n);
  const activeKind = kind && kinds.some((k) => k.id === kind) ? kind : kinds[0]?.id;
  const t = OMAN_TOPICS.find((x) => x.id === topic);
  const subs = topic === "health" && items ? OMAN_HEALTH_SUBS.map((s) => ({ ...s, n: items.filter((e) => e.sub === s.id).length })).filter((s) => s.n) : [];

  return (
    <div className="mt-6">
      <Back
        onClick={() => (query ? setQ("") : sub ? setSub(null) : topic ? setTopic(null) : onExit())}
        label={query || topic ? "പിന്നോട്ട്" : "തുടക്കം"}
      />
      <h2 dir="rtl" className="font-amiri text-2xl" style={{ color: GOLD }}>{OMAN_BOOK.ar}</h2>
      <p className="font-inter text-sm font-semibold mt-1" style={{ color: INK }}>{OMAN_BOOK.ml}</p>
      <p className="font-inter text-xs mt-1 mb-4" style={{ color: DIM }}>{OMAN_BOOK.note}</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 തിരയുക — ഉദാ: സിഹ്റ്, കണ്ണേറ്, سحر"
        type="search" enterKeyHint="search"
        className="w-full rounded-xl px-3 py-2 mb-5 font-inter text-sm bg-transparent outline-none" style={{ border: `1px solid ${LINE}`, color: INK }} />

      {query ? (
        <div className="space-y-3">
          <p className="font-inter text-xs" style={{ color: DIM }}>
            {!found ? "തിരയുന്നു…" : found.length ? `${found.length} കാർഡ് കിട്ടി${found.length > 150 ? " — ആദ്യത്തെ 150 കാണിക്കുന്നു; കൂടുതൽ വാക്ക് ചേർത്ത് ചുരുക്കാം" : ""}` : "ഒന്നും കിട്ടിയില്ല — വേറെ വാക്ക് നോക്കൂ"}
          </p>
          {found?.slice(0, 150).map(({ e, topic: tp }) => <Entry key={e.id} e={e} quran={quran} topicLabel={topicLabel(tp)} />)}
        </div>
      ) : !topic ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card onClick={() => setTopic("intro")}>
            <span className="flex items-center gap-3">
              <span className="text-2xl">📜</span>
              <span className="flex-1">
                <span className="block font-inter text-[15px] font-semibold" style={{ color: INK }}>ആമുഖം</span>
                <span dir="rtl" className="block font-amiri text-sm" style={{ color: "rgba(212,175,55,0.75)" }}>المقدمة</span>
              </span>
            </span>
          </Card>
          {OMAN_TOPICS.map((x) => (
            <Card key={x.id} onClick={() => setTopic(x.id)}>
              <span className="flex items-center gap-3">
                <span className="text-2xl">{x.icon}</span>
                <span className="flex-1">
                  <span className="block font-inter text-[15px] font-semibold" style={{ color: INK }}>{x.ml}</span>
                  <span dir="rtl" className="block font-amiri text-sm" style={{ color: "rgba(212,175,55,0.75)" }}>{x.ar}</span>
                </span>
              </span>
            </Card>
          ))}
        </div>
      ) : topic === "intro" ? (
        <Intro />
      ) : !items ? (
        <p className="font-inter text-sm" style={{ color: DIM }}>തുറക്കുന്നു…</p>
      ) : topic === "health" && !sub && subs.length ? (
        <div className="space-y-3">
          <h3 className="font-inter text-base font-semibold" style={{ color: GOLD }}>{t.icon} {t.ml}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subs.map((s) => (
              <Card key={s.id} onClick={() => setSub(s.id)}>
                <span className="flex items-center gap-3">
                  <span className="flex-1 font-inter text-[15px] font-semibold" style={{ color: INK }}>{s.ml}</span>
                  <span className="font-inter text-xs" style={{ color: DIM }}>{s.n}</span>
                </span>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-inter text-base font-semibold" style={{ color: GOLD }}>
            {t?.icon} {t?.ml}{sub ? ` — ${OMAN_HEALTH_SUBS.find((s) => s.id === sub)?.ml}` : ""}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {kinds.map((k) => (
              <button key={k.id} onClick={() => setKind(k.id)} className="font-inter text-xs px-3 py-1.5 rounded-full"
                style={k.id === activeKind ? { color: "#111", background: GOLD } : { color: GOLD, border: `1px solid ${LINE}` }}>
                {k.ml} · {k.n}
              </button>
            ))}
          </div>
          {kinds.length === 0 && <p className="font-inter text-sm" style={{ color: DIM }}>ഈ വിഭാഗം ഉടൻ ചേർക്കും.</p>}
          {pool.filter((e) => e.k === activeKind).map((e) => <Entry key={e.id} e={e} quran={quran} />)}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// «مجربات أهل عمان الكبير» — subject cards → tabs by kind → entries
// ═══════════════════════════════════════════════════════════════
// Each entry: why / how in Malayalam, the book's Arabic text word for word,
// its meaning, any surah or ayah the book only names (written out in full
// with its meaning), and the book's own figures (talismans, wafqs).
import { useEffect, useMemo, useState } from "react";
import { OMAN_BOOK, OMAN_TOPICS, OMAN_HEALTH_SUBS, OMAN_KINDS, loadOmanTopic, loadOmanQuran } from "@/lib/omanTopics";
import { OMAN_INTRO } from "@/lib/omanIntro";

const GOLD = "#D4AF37";
const INK = "rgba(255,255,255,0.86)";
const DIM = "rgba(255,255,255,0.55)";
const LINE = "rgba(212,175,55,0.2)";
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
      <p dir="rtl" className="font-amiri text-xl leading-loose" style={{ color: GOLD }}>
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

function Entry({ e, quran }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${LINE}`, background: "rgba(0,0,0,0.22)" }}>
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 flex items-start gap-3">
        <span className="font-inter text-xs mt-1" style={{ color: GOLD }}>{open ? "▾" : "▸"}</span>
        <span className="flex-1">
          <span className="block font-inter text-[15px] font-semibold" style={{ color: INK }}>{e.ml.title}</span>
          <span dir="rtl" className="block font-amiri text-base mt-1" style={{ color: "rgba(212,175,55,0.75)" }}>{e.ar}</span>
        </span>
        <span className="font-inter text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: GOLD, border: `1px solid ${LINE}` }}>{KIND[e.k]?.ml}</span>
      </button>
      {open && (
        <div className="px-4 pb-5 space-y-4">
          <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(212,175,55,0.06)" }}>
            <p className="font-inter text-sm leading-relaxed" style={{ color: INK }}><b style={{ color: GOLD }}>എന്തിന്: </b>{e.ml.why}</p>
            <p className="font-inter text-sm leading-relaxed whitespace-pre-line" style={{ color: INK }}><b style={{ color: GOLD }}>എങ്ങനെ: </b>{e.ml.how}</p>
          </div>
          {e.ml.warn && (
            <p className="font-inter text-sm leading-relaxed rounded-xl p-3" style={{ color: "#FFB4A8", border: "1px solid rgba(255,120,100,0.35)", background: "rgba(255,80,60,0.06)" }}>
              ⚠ {e.ml.warn}
            </p>
          )}
          {e.figs?.length > 0 && (
            <div className="space-y-2">{e.figs.map((f) => <Figure key={f} src={f} />)}</div>
          )}
          {e.src && (
            <div className="rounded-xl p-3" style={{ border: `1px solid ${LINE}` }}>
              <p className="font-inter text-[11px] mb-1" style={{ color: DIM }}>കിതാബിലെ വാചകം (അതേപടി)</p>
              <p dir="rtl" className="font-amiri text-xl leading-loose whitespace-pre-line" style={{ color: GOLD }}>{e.src}</p>
            </div>
          )}
          {e.ml.mean && (
            <p className="font-inter text-sm leading-relaxed" style={{ color: INK }}><b style={{ color: GOLD }}>അർത്ഥം: </b>{e.ml.mean}</p>
          )}
          {e.q?.length > 0 && (
            <div className="space-y-2">
              <p className="font-inter text-[11px]" style={{ color: DIM }}>ഇതിൽ പറയുന്ന സൂറത്തുകളും ആയത്തുകളും — മുഴുവനായി, അർത്ഥത്തോടെ:</p>
              {e.q.map((r, i) => <QuranRef key={i} r={r} quran={quran} />)}
            </div>
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
    Promise.all(OMAN_TOPICS.map((t) => loadOmanTopic(t.id))).then((rs) => setAll(rs.flat()));
  }, [query, all]);

  const found = useMemo(() => {
    if (!query || !all) return null;
    return all.filter((e) => [e.ml.title, e.ml.why, e.ml.how, e.ml.mean, e.ar, e.src].join(" ").includes(query));
  }, [query, all]);

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
      <p className="font-inter text-xs mt-1 mb-4" style={{ color: DIM }}>{OMAN_BOOK.note}</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="തിരയുക — മലയാളത്തിലോ അറബിയിലോ"
        className="w-full rounded-xl px-3 py-2 mb-5 font-inter text-sm bg-transparent outline-none" style={{ border: `1px solid ${LINE}`, color: INK }} />

      {query ? (
        <div className="space-y-3">
          <p className="font-inter text-xs" style={{ color: DIM }}>{found ? `${found.length} എണ്ണം` : "തിരയുന്നു…"}</p>
          {found?.slice(0, 200).map((e) => <Entry key={e.id} e={e} quran={quran} />)}
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

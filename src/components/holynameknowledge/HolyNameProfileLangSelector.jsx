import { LANG_OPTIONS } from "./holyNameProfileI18n";

// Compact Arabic / English / Malayalam language selector for the Holy Name
// research profile. Isolated to the Holy Names module.
export default function HolyNameProfileLangSelector({ lang, setLang }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg p-1" style={{ background: "rgba(8,16,38,0.6)", border: "1px solid rgba(212,175,55,0.22)" }}>
      {LANG_OPTIONS.map((o) => {
        const active = lang === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => setLang(o.id)}
            className="px-2 py-1 rounded-md transition-colors flex items-center gap-1.5"
            style={{
              background: active ? "rgba(212,175,55,0.18)" : "transparent",
              border: active ? "1px solid rgba(212,175,55,0.55)" : "1px solid transparent",
            }}
            title={o.title}
          >
            <span
              className="font-inter text-[9px] uppercase tracking-widest font-bold"
              style={{ color: active ? "#F5D060" : "rgba(245,208,96,0.55)" }}
            >
              {o.short}
            </span>
            <span
              className={o.id === "ar" ? "font-amiri text-[11px]" : o.id === "ml" ? "font-malayalam text-[10px]" : "font-inter text-[9px]"}
              style={{ color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)" }}
              dir={o.id === "ar" ? "rtl" : "ltr"}
            >
              {o.id === "ar" ? o.titleAR : o.id === "ml" ? o.titleML : o.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, LockKeyhole, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import { useI18n } from "@/i18n/I18nContext";

const localized = (page, field, language) => (
  page?.[`${field}_${language}`]
  || page?.[`${field}_en`]
  || page?.[`${field}_ml`]
  || page?.[`${field}_ar`]
  || ""
);

const accessLabel = (page) => {
  if (page.access_mode === "PUBLIC") return "FREE";
  if (page.access_mode === "LOGIN") return "LOGIN";
  if ((page.access_mode === "PAID" || page.access_mode === "PREMIUM") && Number(page.price_amount || 0) > 0) {
    return `${page.price_currency || "AED"} ${Number(page.price_amount).toFixed(2)}`;
  }
  return "LOCKED";
};

export default function ResourcesLibrary() {
  const { language } = useI18n();
  const [pages, setPages] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    base44.entities.ManagedPage.filter({ status: "PUBLISHED" }, "-published_at", 500)
      .then((rows) => { if (!cancelled) setPages(Array.isArray(rows) ? rows : []); })
      .catch(() => { if (!cancelled) setPages([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return pages;
    return pages.filter((page) => [page.title_ml, page.title_en, page.title_ar, page.excerpt_ml, page.excerpt_en, page.excerpt_ar, page.category]
      .some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [pages, query]);

  return (
    <PageLayout>
      <main className="mx-auto min-h-[75vh] w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7">
          <p dir="rtl" className="font-amiri text-3xl text-yellow-100">المحتوى</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">വിഷയങ്ങൾ & പഠന വിഭവങ്ങൾ</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Articles, guides, ritual information, downloadable resources and video-linked pages.</p>
        </div>

        <label className="mb-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <Search className="h-4 w-4 text-white/35" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
        </label>

        {loading && <p className="py-16 text-center text-sm text-white/40">Loading…</p>}
        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-12 text-center text-sm text-white/45">
            {query ? "Search-ന് അനുയോജ്യമായ resource കണ്ടെത്തിയില്ല." : "Published resources ഇതുവരെ ചേർത്തിട്ടില്ല."}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((page) => {
            const isFree = page.access_mode === "PUBLIC";
            const title = localized(page, "title", language) || page.slug;
            const excerpt = localized(page, "excerpt", language);
            return (
              <Link key={page.id} to={`/content/${page.slug}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.015] transition hover:-translate-y-0.5 hover:border-yellow-400/35">
                {page.featured_image_url && <img src={page.featured_image_url} alt="" className="h-44 w-full object-cover" loading="lazy" />}
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-wider text-white/45">{page.category || "general"}</span>
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${isFree ? "bg-emerald-400/10 text-emerald-300" : "bg-yellow-400/10 text-yellow-200"}`}>
                      {!isFree && <LockKeyhole className="h-3 w-3" />} {accessLabel(page)}
                    </span>
                  </div>
                  <h2 dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "font-amiri text-xl" : "text-lg font-bold"} mt-1 leading-7 text-white group-hover:text-yellow-100`}>{title}</h2>
                  {excerpt && <p dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "font-amiri text-base" : "text-sm"} mt-3 line-clamp-3 leading-6 text-white/45`}>{excerpt}</p>}
                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-yellow-200/80"><FileText className="h-4 w-4" /> Open resource</div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </PageLayout>
  );
}

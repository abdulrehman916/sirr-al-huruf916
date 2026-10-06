import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CalendarClock, FileText, LockKeyhole } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useI18n } from "@/i18n/I18nContext";

const localText = (value, language) => value?.[language] || value?.en || value?.ml || value?.ar || "Untitled";
const resourcePath = (resource) => resource?.resource_type === "BOOK" ? `/books/${resource.slug}` : `/content/${resource.slug}`;

function ResourceCard({ resource, language, entitlement }) {
  const expired = entitlement?.expires_at && new Date(entitlement.expires_at).getTime() <= Date.now();
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-2 text-yellow-200">
            {resource.resource_type === "BOOK" ? <BookOpen className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h2 dir={language === "ar" ? "rtl" : "ltr"} className="truncate text-sm font-semibold text-white">{localText(resource.title, language)}</h2>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-white/35">{resource.resource_type}</p>
          </div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${expired ? "bg-red-400/10 text-red-300" : "bg-emerald-400/10 text-emerald-300"}`}>
          {expired ? "EXPIRED" : entitlement ? "ACTIVE" : "FREE"}
        </span>
      </div>
      {entitlement?.expires_at && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-white/45"><CalendarClock className="h-3.5 w-3.5" /> Valid until {new Date(entitlement.expires_at).toLocaleDateString()}</p>
      )}
      {!expired && <Link to={resourcePath(resource)} className="mt-4 inline-flex rounded-lg border border-yellow-500/25 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-100">Open</Link>}
    </article>
  );
}

export default function MyLibrary() {
  const { isAuthenticated } = useAuth();
  const { language } = useI18n();
  const [entitlements, setEntitlements] = useState([]);
  const [freeResources, setFreeResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([base44.listMyEntitlements(), base44.listFreeResources(100)])
      .then(([owned, free]) => {
        if (!cancelled) { setEntitlements(owned || []); setFreeResources(free || []); }
      })
      .catch(() => { if (!cancelled) { setEntitlements([]); setFreeResources([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const ownedIds = useMemo(() => new Set(entitlements.map((item) => item.resource?.id).filter(Boolean)), [entitlements]);
  const visibleFree = useMemo(() => freeResources.filter((item) => !ownedIds.has(item.id)), [freeResources, ownedIds]);

  return (
    <PageLayout>
      <main className="mx-auto min-h-[75vh] w-full max-w-6xl px-4 py-8 sm:px-6">
        <p dir="rtl" className="font-amiri text-3xl text-yellow-100">مكتبتي</p>
        <h1 className="mt-1 text-2xl font-bold text-white">എന്റെ ലൈബ്രറി</h1>
        <p className="mt-2 text-sm text-white/45">നിങ്ങൾക്ക് ലഭിച്ച paid access, books, PDFs, pages, free resources എന്നിവ ഇവിടെ കാണാം.</p>

        {!isAuthenticated && (
          <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] p-6 text-center">
            <LockKeyhole className="mx-auto h-6 w-6 text-yellow-200" />
            <p className="mt-3 text-sm text-white/65">നിങ്ങൾ വാങ്ങിയ content കാണാൻ login ചെയ്യുക.</p>
            <Link to="/login?redirect=%2Fmy-library" className="mt-4 inline-block rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-950">Login</Link>
          </div>
        )}

        {loading && <p className="py-16 text-center text-sm text-white/40">Loading…</p>}
        {!loading && isAuthenticated && (
          <section className="mt-8">
            <h2 className="mb-4 text-base font-semibold text-white/80">My access</h2>
            {entitlements.length === 0 && <p className="rounded-xl border border-white/10 p-5 text-sm text-white/40">Paid access ഇതുവരെ ലഭിച്ചിട്ടില്ല.</p>}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entitlements.filter((item) => item.resource).map((item) => <ResourceCard key={item.id} resource={item.resource} entitlement={item} language={language} />)}
            </div>
          </section>
        )}

        {!loading && (
          <section className="mt-10">
            <h2 className="mb-4 text-base font-semibold text-white/80">Free resources</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleFree.map((resource) => <ResourceCard key={resource.id} resource={resource} language={language} />)}
            </div>
          </section>
        )}
      </main>
    </PageLayout>
  );
}

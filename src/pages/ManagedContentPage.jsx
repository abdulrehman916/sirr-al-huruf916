import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, FileText, LockKeyhole, LogIn, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/lib/AuthContext";
import { checkLocalPermission, validateAndCleanPermissions } from "@/lib/sessionId";
import { useI18n } from "@/i18n/I18nContext";

const localized = (page, field, language) => (
  page?.[`${field}_${language}`]
  || page?.[`${field}_en`]
  || page?.[`${field}_ml`]
  || page?.[`${field}_ar`]
  || ""
);

function isStillActive(record) {
  if (!record) return false;
  if (record.status && record.status !== "ACTIVE") return false;
  if (record.is_active === false || record.is_revoked === true) return false;
  if (!record.expiry_date) return true;
  const expiry = new Date(record.expiry_date).getTime();
  return Number.isFinite(expiry) ? expiry > Date.now() : true;
}

function AccessCard({ mode, page, isAuthenticated }) {
  const isPaid = mode === "PAID" || mode === "PREMIUM";
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-yellow-500/20 bg-white/[0.025] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/25 bg-yellow-500/10 text-yellow-200">
        {isAuthenticated ? <LockKeyhole className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
      </div>
      <h2 className="mt-4 text-lg font-bold text-white">
        {!isAuthenticated ? "ലോഗിൻ ആവശ്യമാണ്" : "ഈ പേജിന് access ആവശ്യമാണ്"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-white/55">
        {!isAuthenticated
          ? "ഈ ഉള്ളടക്കം കാണാൻ ആദ്യം നിങ്ങളുടെ അക്കൗണ്ടിൽ ലോഗിൻ ചെയ്യുക."
          : "Payment സ്ഥിരീകരിക്കുകയോ Owner access അനുവദിക്കുകയോ ചെയ്താൽ ഈ page നിങ്ങളുടെ login email-ലേക്ക് നേരിട്ട് ബന്ധിപ്പിക്കും."}
      </p>
      {isPaid && Number(page?.price_amount || 0) > 0 && (
        <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] px-4 py-3 font-semibold text-yellow-100">
          <div>{page.price_currency || "AED"} {Number(page.price_amount).toFixed(2)}</div>
          <div className="mt-1 text-xs font-normal text-yellow-100/60">
            {page.lifetime_access ? "Lifetime access" : `${Math.max(1, Number(page.validity_days || 2))} day access after activation`}
          </div>
        </div>
      )}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {!isAuthenticated ? (
          <Link to={`/login?redirect=${encodeURIComponent(`/content/${page.slug}`)}`} className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100">
            Login
          </Link>
        ) : <Link to="/support/whatsapp" className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100">Pay / Request Access</Link>}
        <Link to="/support/whatsapp" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60">WhatsApp Support</Link>
        <Link to="/" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60">Home</Link>
      </div>
    </div>
  );
}

export default function ManagedContentPage() {
  const { slug } = useParams();
  const { user, role, isAuthenticated } = useAuth();
  const { language } = useI18n();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [accessResolved, setAccessResolved] = useState(false);
  const [assets, setAssets] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  const pagePath = useMemo(() => `/content/${slug || ""}`, [slug]);
  const title = localized(page, "title", language);
  const excerpt = localized(page, "excerpt", language);
  const body = localized(page, "body", language);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setAccessResolved(false);
      try {
        const rows = await base44.entities.ManagedPage.filter({ slug, status: "PUBLISHED" }, null, 1);
        const found = Array.isArray(rows) && rows.length ? rows[0] : null;
        if (cancelled) return;
        setPage(found);
        if (!found) {
          setAllowed(false);
          setAccessResolved(true);
          return;
        }

        if (role === "owner" || role === "admin" || found.access_mode === "PUBLIC") {
          setAllowed(true);
          setAccessResolved(true);
          return;
        }

        if (found.access_mode === "LOGIN") {
          setAllowed(Boolean(isAuthenticated && user?.id));
          setAccessResolved(true);
          return;
        }

        // Reading / Redeem Code is the primary paid-access system.
        // First validate the locally restored permissions against the backend so
        // disabled, deleted, removed or expired code grants cannot remain active.
        await validateAndCleanPermissions();
        if (cancelled) return;
        const localPermission = checkLocalPermission(pagePath);
        if (localPermission.granted) {
          setAllowed(true);
          setAccessResolved(true);
          return;
        }

        if (!isAuthenticated || !user?.id) {
          setAllowed(false);
          setAccessResolved(true);
          return;
        }

        // Normalized resource entitlements are the primary access source for
        // purchases, coupons and owner grants. The database also enforces
        // expiry and revocation, so a stale browser session cannot bypass it.
        try {
          const hasResourceAccess = await base44.canAccessResource(found.id);
          if (cancelled) return;
          if (hasResourceAccess) {
            setAllowed(true);
            setAccessResolved(true);
            return;
          }
        } catch {
          // During staged migration, continue to the verified legacy fallback
          // below so existing customers do not lose previously granted access.
        }

        // Backward-compatible fallbacks for manually-created subscriptions and
        // page permissions. Existing records continue to work unchanged.
        const [subscriptions, permissions] = await Promise.all([
          base44.entities.Subscription.filter({ user_id: user.id, page_path: pagePath }).catch(() => []),
          base44.entities.PagePermission.filter({ user_id: user.id, page_path: pagePath }).catch(() => []),
        ]);
        if (cancelled) return;

        const hasSubscription = Array.isArray(subscriptions) && subscriptions.some(isStillActive);
        const hasPermission = Array.isArray(permissions) && permissions.some(isStillActive);

        if (found.access_mode === "SELECTED_CUSTOMERS") setAllowed(hasPermission || localPermission.granted);
        else setAllowed(hasSubscription || hasPermission || localPermission.granted);
        setAccessResolved(true);
      } catch {
        if (!cancelled) {
          setPage(null);
          setAllowed(false);
          setAccessResolved(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug, pagePath, role, isAuthenticated, user?.id]);

  useEffect(() => {
    if (!allowed || !page?.id) {
      setAssets([]);
      return;
    }
    let cancelled = false;
    base44.listResourceAssets(page.id)
      .then(async (rows) => Promise.all((Array.isArray(rows) ? rows : [])
        .filter((asset) => ["COVER", "IMAGE", "PDF", "PREVIEW_PDF", "DOWNLOAD"].includes(asset.asset_type))
        .map(async (asset) => {
        if (!["COVER", "IMAGE"].includes(asset.asset_type)) return asset;
        try { return { ...asset, view_url: await base44.createResourceAssetView(asset) }; }
        catch { return asset; }
      })))
      .then((rows) => { if (!cancelled) setAssets(rows); })
      .catch(() => { if (!cancelled) setAssets([]); });
    return () => { cancelled = true; };
  }, [allowed, page?.id]);

  async function downloadAsset(asset) {
    if (downloadingId) return;
    setDownloadError("");
    setDownloadingId(asset.id);
    try {
      const url = await base44.createResourceAssetDownload(asset);
      window.location.assign(url);
    } catch (error) {
      setDownloadError(error?.message || "Download തയ്യാറാക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <PageLayout>
      <div className="min-h-[70vh] px-4 py-8 sm:px-6 lg:px-8">
        {loading && <div className="mx-auto mt-20 h-9 w-9 animate-spin rounded-full border-4 border-yellow-400/20 border-t-yellow-300" />}

        {!loading && !page && (
          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center">
            <h1 className="text-xl font-bold text-white">Page not found</h1>
            <p className="mt-2 text-sm text-white/45">ഈ content page publish ചെയ്തിട്ടില്ല അല്ലെങ്കിൽ നിലവിലില്ല.</p>
            <Link to="/" className="mt-5 inline-block rounded-lg border border-yellow-500/25 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-100">Home</Link>
          </div>
        )}

        {!loading && page && accessResolved && !allowed && (
          <AccessCard mode={page.access_mode} page={page} isAuthenticated={isAuthenticated} />
        )}

        {!loading && page && accessResolved && allowed && (
          <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-b from-[#07101f] to-[#030711] shadow-2xl shadow-black/30">
            {page.featured_image_url && (
              <img src={page.featured_image_url} alt={page.title_en || page.title_ml || ""} className="max-h-[460px] w-full object-cover" />
            )}
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-yellow-100">
                  {page.category || "general"}
                </span>
                {page.access_mode !== "PUBLIC" && (
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-300/80">
                    <ShieldCheck className="h-3.5 w-3.5" /> Access verified
                  </span>
                )}
              </div>

              <h1 dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "font-amiri leading-relaxed" : "font-bold leading-tight"} mt-2 text-3xl text-white sm:text-4xl`}>{title}</h1>
              {excerpt && <p dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "font-amiri text-lg" : "text-base"} mt-7 leading-8 text-white/65`}>{excerpt}</p>}
              {body && <section dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "font-amiri text-xl leading-10 sm:text-2xl" : "text-base leading-8 sm:text-lg sm:leading-9"} mt-8 whitespace-pre-wrap text-white/85`}>{body}</section>}

              {assets.some((asset) => asset.view_url && ["COVER", "IMAGE"].includes(asset.asset_type)) && (
                <section className="mt-8 grid gap-4 sm:grid-cols-2 print:block">
                  {assets.filter((asset) => asset.view_url && ["COVER", "IMAGE"].includes(asset.asset_type)).map((asset) => (
                    <div key={`media-${asset.id}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 print:mb-4">
                      <img src={asset.view_url} alt={asset.title?.[language] || asset.title?.en || title} className="max-h-[620px] w-full object-contain" />
                    </div>
                  ))}
                </section>
              )}

              {page.access_mode === "PAID" && !page.lifetime_access && (
                <div className="mt-8 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-sm leading-6 text-amber-100/80 print:hidden">
                  ഈ content-ന്റെ access {Math.max(1, Number(page.validity_days || 2))} ദിവസം മാത്രമാണ്. കാലാവധി കഴിയുന്നതിന് മുമ്പ് അനുവദിച്ച files download ചെയ്യുകയോ “Save this page as PDF” ഉപയോഗിക്കുകയോ ചെയ്യുക.
                </div>
              )}

              {page.allow_download !== false && (
                <div className="mt-8 print:hidden">
                  <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-100">
                    <Download className="h-4 w-4" /> Download / Save page as PDF
                  </button>
                </div>
              )}

              {assets.length > 0 && (
                <section className="mt-9 border-t border-white/10 pt-6">
                  <h2 className="text-sm font-semibold text-white/80">Files & downloads</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {assets.filter((asset) => asset.is_downloadable !== false).map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        disabled={Boolean(downloadingId)}
                        onClick={() => downloadAsset(asset)}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-left transition hover:border-yellow-400/30 disabled:opacity-50"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-yellow-200" />
                          <span className="truncate text-xs text-white/70">{asset.title?.[language] || asset.title?.en || asset.object_path?.split("/").pop() || asset.asset_type}</span>
                        </span>
                        <Download className={`h-4 w-4 shrink-0 text-yellow-200 ${downloadingId === asset.id ? "animate-pulse" : ""}`} />
                      </button>
                    ))}
                  </div>
                  {downloadError && <p className="mt-3 text-xs text-red-300" role="alert">{downloadError}</p>}
                </section>
              )}
            </div>
          </article>
        )}
      </div>
    </PageLayout>
  );
}

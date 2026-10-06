import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Check, Copy, ExternalLink, Eye, FilePlus2, Paperclip, Save, Send, Trash2, Upload } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const EMPTY = {
  slug: "",
  title_ml: "",
  title_en: "",
  title_ar: "",
  excerpt_ml: "",
  excerpt_en: "",
  excerpt_ar: "",
  body_ml: "",
  body_en: "",
  body_ar: "",
  category: "general",
  status: "DRAFT",
  access_mode: "LOGIN",
  price_amount: 0,
  price_currency: "AED",
  validity_days: 2,
  lifetime_access: false,
  allow_download: true,
  featured_image_url: "",
  is_featured: false,
  seo_title: "",
  seo_description: "",
  version: 1,
};

const inputClass = "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/50";
const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/40";

function createAutomaticSlug() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().slice(0, 8);
  return `story-${date}-${random}`;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\u0d00-\u0d7f]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function OwnerContentStudio() {
  const { role, user, authResolved, adminProfileLoading } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(() => ({ ...EMPTY, slug: createAutomaticSlug() }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  const selected = useMemo(() => items.find((x) => x.id === selectedId) || null, [items, selectedId]);

  useEffect(() => {
    if (role !== "owner") return;
    loadPages();
  }, [role]);

  useEffect(() => {
    if (selected) {
      setDraft({ ...EMPTY, ...selected });
      base44.listResourceAssets(selected.id).then(setAssets).catch(() => setAssets([]));
    } else {
      setAssets([]);
    }
  }, [selected]);

  if (!authResolved || adminProfileLoading) {
    return <AdminLayout title="Content Studio"><div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400/25 border-t-yellow-400" /></div></AdminLayout>;
  }
  if (role !== "owner") return <Navigate to="/owner-login?redirect=%2Fadmin%2Fcontent-studio" replace />;

  async function loadPages() {
    setLoading(true);
    try {
      const rows = await base44.entities.ManagedPage.list("-updated_date", 200);
      setItems(Array.isArray(rows) ? rows : []);
    } catch {
      toast({ title: "Content Studio", description: "ManagedPage data could not be loaded yet.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function newPage() {
    setSelectedId(null);
    setDraft({ ...EMPTY, slug: createAutomaticSlug() });
  }

  function change(field, value) {
    setDraft((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title_en" && !prev.slug) next.slug = slugify(value);
      return next;
    });
  }

  async function copyLiveLink() {
    if (!draft.slug.trim()) return;
    const url = `${window.location.origin}/content/${slugify(draft.slug)}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function persist(nextStatus = draft.status) {
    if (!draft.title_ml.trim() || !draft.slug.trim()) {
      toast({ title: "Missing details", description: "Malayalam title and slug are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...draft,
        slug: slugify(draft.slug),
        status: nextStatus,
        price_amount: Number(draft.price_amount || 0),
        validity_days: draft.lifetime_access ? null : Math.max(1, Number(draft.validity_days || 2)),
        lifetime_access: Boolean(draft.lifetime_access),
        allow_download: draft.allow_download !== false,
        version: Number(draft.version || 1) + (selectedId ? 1 : 0),
      };
      if (nextStatus === "PUBLISHED") {
        payload.published_at = new Date().toISOString();
        payload.last_published_by = user?.email || "owner";
      }

      let saved;
      if (selectedId) saved = await base44.entities.ManagedPage.update(selectedId, payload);
      else saved = await base44.entities.ManagedPage.create(payload);

      await loadPages();
      const resolvedId = saved?.id || selectedId || null;
      setSelectedId(resolvedId);
      setDraft((prev) => ({ ...prev, ...payload, ...(saved || {}) }));
      toast({
        title: nextStatus === "PUBLISHED" ? "Published" : "Draft saved",
        description: nextStatus === "PUBLISHED" ? `Live URL: /content/${payload.slug}` : "Your changes are saved as a draft.",
      });
    } catch (error) {
      toast({ title: "Save failed", description: error?.message || "Could not save this page.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function removePage() {
    if (!selectedId) return;
    if (!window.confirm("Delete this managed page?")) return;
    try {
      await base44.entities.ManagedPage.delete(selectedId);
      newPage();
      await loadPages();
      toast({ title: "Deleted", description: "Managed page removed." });
    } catch (error) {
      toast({ title: "Delete failed", description: error?.message || "Could not delete this page.", variant: "destructive" });
    }
  }

  async function uploadAsset(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || !selectedId) return;
    setUploading(true);
    try {
      for (const file of files) {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isImage = file.type.startsWith("image/");
        if (!isPdf && !isImage) {
          throw new Error(`${file.name}: Photos and PDF documents only.`);
        }
        const assetType = isPdf ? "PDF" : "IMAGE";
        await base44.uploadResourceAsset(selectedId, file, {
          assetType,
          isDownloadable: draft.allow_download !== false,
        });
      }
      setAssets(await base44.listResourceAssets(selectedId));
      toast({ title: "Files uploaded", description: `${files.length} file(s) ഈ page-ലേക്ക് ചേർത്തു.` });
    } catch (error) {
      toast({ title: "Upload failed", description: error?.message || "File upload ചെയ്യാൻ കഴിഞ്ഞില്ല.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function removeAsset(asset) {
    if (!window.confirm("Delete this file from the resource?")) return;
    try {
      await base44.deleteResourceAsset(asset);
      setAssets((current) => current.filter((item) => item.id !== asset.id));
      toast({ title: "File deleted" });
    } catch (error) {
      toast({ title: "Delete failed", description: error?.message || "File delete ചെയ്യാൻ കഴിഞ്ഞില്ല.", variant: "destructive" });
    }
  }

  return (
    <AdminLayout title="Content Studio">
      <div className="grid min-h-0 grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-yellow-500/20 bg-white/[0.025] p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h1 className="text-base font-bold text-white">Content Studio</h1>
              <p className="text-[10px] text-white/35">Draft → Preview → Publish</p>
            </div>
            <button onClick={newPage} className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-yellow-300" title="New page">
              <FilePlus2 className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[68vh] space-y-2 overflow-y-auto pr-1">
            {loading && <p className="text-xs text-white/35">Loading…</p>}
            {!loading && items.length === 0 && <p className="text-xs text-white/35">No managed pages yet.</p>}
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className="w-full rounded-xl border p-3 text-left transition hover:bg-white/[0.04]"
                style={{ borderColor: selectedId === item.id ? "rgba(245,208,96,.45)" : "rgba(255,255,255,.08)" }}
              >
                <p className="truncate text-xs font-semibold text-white/80">{item.title_ml || item.title_en || item.slug}</p>
                <div className="mt-1 flex items-center justify-between gap-2 text-[9px] text-white/35">
                  <span>/content/{item.slug}</span>
                  <span className={item.status === "PUBLISHED" ? "text-emerald-400" : "text-amber-300"}>{item.status}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-yellow-500/20 bg-white/[0.025] p-3">
            <div>
              <p className="text-xs font-semibold text-white/80">{selectedId ? "Edit managed page" : "Create managed page"}</p>
              <p className="text-[10px] text-white/35">Stories and information pages only. Calculation modules remain separate and unchanged.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {draft.slug.trim() && (
                <>
                  <button onClick={copyLiveLink} className="flex items-center gap-1.5 rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Link copied" : "Copy link"}
                  </button>
                  <a href={`/content/${slugify(draft.slug)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">
                    <ExternalLink className="h-3.5 w-3.5" /> Open page
                  </a>
                </>
              )}
              <button onClick={() => setPreview((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
              <button disabled={saving} onClick={() => persist("DRAFT")} className="flex items-center gap-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-200 disabled:opacity-50">
                <Save className="h-3.5 w-3.5" /> Save Draft
              </button>
              <button disabled={saving} onClick={() => persist("PUBLISHED")} className="flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300 disabled:opacity-50">
                <Send className="h-3.5 w-3.5" /> Publish
              </button>
              {selectedId && (
                <button onClick={removePage} className="rounded-lg border border-red-400/25 bg-red-400/10 p-2 text-red-300" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label><span className={labelClass}>Malayalam title *</span><input className={inputClass} value={draft.title_ml} onChange={(e) => change("title_ml", e.target.value)} /></label>
                <label><span className={labelClass}>English title</span><input className={inputClass} value={draft.title_en} onChange={(e) => change("title_en", e.target.value)} /></label>
                <label><span className={labelClass}>Arabic title</span><input dir="rtl" className={inputClass} value={draft.title_ar} onChange={(e) => change("title_ar", e.target.value)} /></label>
                <label><span className={labelClass}>Slug *</span><input className={inputClass} value={draft.slug} onChange={(e) => change("slug", e.target.value)} placeholder="dua-protection" /></label>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <label><span className={labelClass}>Category</span><input className={inputClass} value={draft.category} onChange={(e) => change("category", e.target.value)} /></label>
                <label><span className={labelClass}>Access</span><select className={inputClass} value={draft.access_mode} onChange={(e) => change("access_mode", e.target.value)}>
                  <option value="PUBLIC">Public — no login</option><option value="LOGIN">Free — email login required</option><option value="PAID">Paid — payment or owner access</option><option value="SELECTED_CUSTOMERS">Selected customers — owner access</option>
                </select></label>
                <label><span className={labelClass}>Status</span><select className={inputClass} value={draft.status} onChange={(e) => change("status", e.target.value)}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></label>
              </div>

              {(draft.access_mode === "PAID" || draft.access_mode === "PREMIUM") && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label><span className={labelClass}>Price</span><input type="number" min="0" step="0.01" className={inputClass} value={draft.price_amount} onChange={(e) => change("price_amount", e.target.value)} /></label>
                  <label><span className={labelClass}>Currency</span><input className={inputClass} value={draft.price_currency} onChange={(e) => change("price_currency", e.target.value.toUpperCase())} /></label>
                  <label><span className={labelClass}>Access days</span><input type="number" min="1" step="1" className={inputClass} value={draft.validity_days} disabled={draft.lifetime_access} onChange={(e) => change("validity_days", e.target.value)} /></label>
                </div>
              )}

              <div className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-2">
                {(draft.access_mode === "PAID" || draft.access_mode === "PREMIUM") && (
                  <label className="flex items-center gap-2 text-xs text-white/70"><input type="checkbox" checked={Boolean(draft.lifetime_access)} onChange={(e) => change("lifetime_access", e.target.checked)} /> Lifetime access</label>
                )}
                <label className="flex items-center gap-2 text-xs text-white/70"><input type="checkbox" checked={draft.allow_download !== false} onChange={(e) => change("allow_download", e.target.checked)} /> Allow customer download / Save as PDF</label>
              </div>

              <label><span className={labelClass}>Malayalam introduction</span><textarea rows={3} className={inputClass} value={draft.excerpt_ml} onChange={(e) => change("excerpt_ml", e.target.value)} /></label>
              <label><span className={labelClass}>Arabic introduction</span><textarea dir="rtl" rows={3} className={`${inputClass} font-amiri text-base`} value={draft.excerpt_ar} onChange={(e) => change("excerpt_ar", e.target.value)} /></label>
              <label><span className={labelClass}>English introduction</span><textarea rows={3} className={inputClass} value={draft.excerpt_en} onChange={(e) => change("excerpt_en", e.target.value)} /></label>
              <label><span className={labelClass}>Malayalam content</span><textarea rows={10} className={inputClass} value={draft.body_ml} onChange={(e) => change("body_ml", e.target.value)} /></label>
              <label><span className={labelClass}>Arabic content</span><textarea dir="rtl" rows={8} className={`${inputClass} font-amiri text-base`} value={draft.body_ar} onChange={(e) => change("body_ar", e.target.value)} /></label>
              <label><span className={labelClass}>English content</span><textarea rows={7} className={inputClass} value={draft.body_en} onChange={(e) => change("body_en", e.target.value)} /></label>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-white/80">Photos & PDF documents</p>
                    <p className="mt-1 text-[10px] text-white/35">Page ആദ്യം Save Draft ചെയ്തശേഷം നിരവധി photos, downloadable PDF എന്നിവ ചേർക്കാം. Video upload ഇല്ല.</p>
                  </div>
                  <label className={`flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 ${(!selectedId || uploading) ? "pointer-events-none opacity-40" : ""}`}>
                    <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload file"}
                    <input type="file" multiple accept="application/pdf,image/*" className="hidden" disabled={!selectedId || uploading} onChange={uploadAsset} />
                  </label>
                </div>
                <div className="mt-3 space-y-2">
                  {assets.length === 0 && <p className="text-xs text-white/30">Files ചേർത്തിട്ടില്ല.</p>}
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/8 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Paperclip className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                        <span className="truncate text-xs text-white/65">{asset.title?.en || asset.object_path?.split("/").pop() || asset.asset_type}</span>
                      </div>
                      <button onClick={() => removeAsset(asset)} className="rounded p-1 text-red-300/70 hover:bg-red-400/10" title="Delete file"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {preview && (
              <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-b from-[#07101f] to-[#030711] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-2 py-1 text-[9px] uppercase tracking-wider text-yellow-200">Live preview</span>
                  <span className="text-[9px] text-white/30">{draft.access_mode}</span>
                </div>
                {draft.title_ar && <h2 dir="rtl" className="font-amiri text-2xl text-yellow-100">{draft.title_ar}</h2>}
                <h2 className="mt-2 text-2xl font-bold text-white">{draft.title_ml || "പേജ് തലക്കെട്ട്"}</h2>
                {draft.title_en && <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/35">{draft.title_en}</p>}
                {draft.excerpt_ml && <p className="mt-5 leading-7 text-white/65">{draft.excerpt_ml}</p>}
                {draft.excerpt_ar && <p dir="rtl" className="mt-5 font-amiri text-lg leading-8 text-white/70">{draft.excerpt_ar}</p>}
                {draft.excerpt_en && <p className="mt-5 text-sm leading-7 text-white/55">{draft.excerpt_en}</p>}
                {draft.body_ar && <div dir="rtl" className="mt-6 whitespace-pre-wrap font-amiri text-xl leading-9 text-white/85">{draft.body_ar}</div>}
                {draft.body_ml && <div className="mt-6 whitespace-pre-wrap leading-8 text-white/75">{draft.body_ml}</div>}
                {draft.body_en && <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-white/55">{draft.body_en}</div>}
                {(draft.access_mode === "PAID" || draft.access_mode === "PREMIUM") && Number(draft.price_amount) > 0 && (
                  <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] p-3 text-sm text-yellow-100">{draft.price_currency} {Number(draft.price_amount).toFixed(2)}</div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

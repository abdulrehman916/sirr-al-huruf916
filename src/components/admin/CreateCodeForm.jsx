/**
 * CreateCodeForm — Form for creating a new access code.
 * Extracted from AccessCodesTab for clarity.
 * Includes customer contact fields (email, phone, whatsapp).
 */
import { useState, useMemo, useEffect } from "react";
import { KeyRound, X, CheckCircle, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { getContentPages } from "@/lib/pageRegistry";
import CreateCodePageItem from "./CreateCodePageItem";
import { DURATION_OPTIONS, computeCodeLevelExpiry, buildPageGrant } from "@/lib/codeDuration";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function CreateCodeForm({ onCreated, onCancel }) {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [codeStr, setCodeStr] = useState("");
  const [selectedPages, setSelectedPages] = useState([]);
  const [pageDurations, setPageDurations] = useState({});
  const [pageSubFeatures, setPageSubFeatures] = useState({});
  const [featureDurations, setFeatureDurations] = useState({});
  const [maxUses, setMaxUses] = useState(1);
  const [notes, setNotes] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageSearch, setPageSearch] = useState("");
  const [managedPages, setManagedPages] = useState([]);

  const registeredPages = useMemo(() => getContentPages().map(p => ({
    path: p.path, name: p.name, icon: p.icon || '📖',
    category: p.category || 'General', adminOnly: p.adminOnly || false,
  })), []);

  useEffect(() => {
    let cancelled = false;
    async function loadManagedPages() {
      try {
        const rows = await base44.entities.ManagedPage.filter({ status: "PUBLISHED" }, "-updated_date", 500);
        if (cancelled) return;
        setManagedPages((Array.isArray(rows) ? rows : []).map(page => ({
          path: `/content/${page.slug}`,
          name: page.title_ml || page.title_en || page.slug,
          icon: '📄',
          category: page.category || 'Published Content',
          adminOnly: false,
          managed: true,
        })));
      } catch {
        if (!cancelled) setManagedPages([]);
      }
    }
    loadManagedPages();
    return () => { cancelled = true; };
  }, []);

  const pageList = useMemo(() => {
    const byPath = new Map();
    registeredPages.forEach(page => byPath.set(page.path, page));
    managedPages.forEach(page => byPath.set(page.path, page));
    return Array.from(byPath.values());
  }, [registeredPages, managedPages]);

  const filteredPages = useMemo(() => {
    if (!pageSearch) return pageList;
    const q = pageSearch.toLowerCase();
    return pageList.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.path.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [pageList, pageSearch]);

  const togglePage = (path) => {
    setSelectedPages(p => {
      if (p.includes(path)) {
        const newPages = p.filter(x => x !== path);
        const newDurations = { ...pageDurations }; delete newDurations[path];
        setPageDurations(newDurations);
        const newSub = { ...pageSubFeatures }; delete newSub[path];
        setPageSubFeatures(newSub);
        return newPages;
      }
      return [...p, path];
    });
  };

  const updatePageSubFeatures = (path, features) => setPageSubFeatures(prev => ({ ...prev, [path]: features }));
  const updateFeatureDuration = (path, featureId, plan) => setFeatureDurations(prev => ({ ...prev, [`${path}:${featureId}`]: plan }));

  const updatePageDuration = (path, durationValue) => {
    const opt = DURATION_OPTIONS.find(d => d.value === durationValue);
    setPageDurations(prev => ({
      ...prev, [path]: { value: durationValue, label: opt?.label || durationValue, days: opt?.days || null, duration_ms: opt?.duration_ms || null, custom_date: null },
    }));
  };

  const updateCustomDate = (path, customDate) => {
    setPageDurations(prev => ({ ...prev, [path]: { ...prev[path], custom_date: customDate } }));
  };

  const handleCreate = async () => {
    if (!customerName.trim()) { toast({ title: "Customer name required", variant: "destructive" }); return; }
    if (!codeStr.trim()) { toast({ title: "Code string required", variant: "destructive" }); return; }
    if (selectedPages.length === 0) { toast({ title: "Select at least one page", variant: "destructive" }); return; }
    for (const path of selectedPages) {
      const dur = pageDurations[path];
      if (!dur) { toast({ title: `Set duration for ${pageList.find(p => p.path === path)?.name}`, variant: "destructive" }); return; }
      if (dur.value === "CUSTOM" && !dur.custom_date) { toast({ title: `Set custom date for ${pageList.find(p => p.path === path)?.name}`, variant: "destructive" }); return; }
    }
    setShowSummary(true);
  };

  const confirmCreate = async () => {
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const normalizedCode = codeStr.trim().toUpperCase();

      // ── P1.1: Prevent duplicate Reading Access Codes ──
      // Every code must be globally unique. Check before saving so existing
      // codes are preserved and no two codes can ever share the same string.
      try {
        const existing = await base44.entities.AccessCode.filter({ code: normalizedCode }, null, 1);
        if (existing && existing.length > 0) {
          toast({ title: "Duplicate code", description: `A code "${normalizedCode}" already exists. Use a different code string.`, variant: "destructive" });
          setSaving(false);
          return;
        }
      } catch (e) {
        toast({ title: "Could not verify code uniqueness", description: e.message, variant: "destructive" });
        setSaving(false);
        return;
      }

      const names = selectedPages.map(path => pageList.find(p => p.path === path)?.name || path);
      const page_durations = {};
      selectedPages.forEach(path => { if (pageDurations[path]) page_durations[path] = pageDurations[path]; });
      const sub_features = {};
      selectedPages.forEach(path => {
        const feats = pageSubFeatures[path];
        if (feats && feats.length > 0) sub_features[path] = feats;
      });

      const codeData = {
        code: normalizedCode,
        customer_name: customerName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        page_paths: selectedPages,
        page_names: names,
        page_durations,
        page_grants: selectedPages.reduce((grants, path) => {
          grants[path] = buildPageGrant(path, pageDurations[path], pageSubFeatures[path] || [], featureDurations, Date.now());
          return grants;
        }, {}),
        sub_features,
        feature_durations: featureDurations,
        duration: "CUSTOM",
        expiry_date: computeCodeLevelExpiry(page_durations),
        max_uses: maxUses,
        use_count: 0,
        is_disabled: false,
        created_by: me.id,
        audit_log: [{ action: "CREATED", timestamp: new Date().toISOString(), admin_id: me.id, details: `Code created for ${customerName.trim()}` }],
        notes: notes.trim() || undefined,
      };
      const res = await base44.functions.invoke("createAccessCode", { code_data: codeData });
      if (!res.data?.success) throw new Error(res.data?.message || "Create failed");

      // ── P4.9: Centralized audit log for code creation ──
      try {
        await base44.entities.AuditLog.create({
          log_id: 'AUDIT-' + (crypto.randomUUID ? crypto.randomUUID().toUpperCase() : Date.now().toString()),
          action_type: 'ACCESS_CODE_CREATED',
          performed_by: me.id,
          performed_by_email: me.email || '',
          target_entity: 'AccessCode',
          target_id: normalizedCode,
          details: JSON.stringify({ code: normalizedCode, customer: customerName.trim(), pages: selectedPages.length }),
          timestamp: new Date().toISOString(),
        });
      } catch { /* best-effort */ }

      toast({ title: `✓ Code "${normalizedCode}" created for ${customerName.trim()}` });
      onCreated();
    } catch (e) {
      toast({ title: "Error creating code", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (showSummary) {
    return (
      <div className="rounded-2xl border p-5 space-y-4"
        style={{ background: "linear-gradient(145deg, #0c1630, #060c1c)", borderColor: G.borderHi }}>
        <h3 className="font-inter font-bold text-white text-base flex items-center gap-2">
          <CheckCircle className="w-5 h-5" style={{ color: G.text }} /> Confirm Code Details
        </h3>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-white/45 text-xs">Customer</p><p className="text-white font-semibold">{customerName.trim()}</p></div>
            <div><p className="text-white/45 text-xs">Code</p><p className="text-white font-bold tracking-widest">{codeStr.trim().toUpperCase()}</p></div>
            {email && <div><p className="text-white/45 text-xs">Email</p><p className="text-white">{email}</p></div>}
            {phone && <div><p className="text-white/45 text-xs">Phone</p><p className="text-white">{phone}</p></div>}
            {whatsapp && <div><p className="text-white/45 text-xs">WhatsApp</p><p className="text-white">{whatsapp}</p></div>}
          </div>
          <div>
            <p className="text-white/45 text-xs mb-2">Unlocked Pages ({selectedPages.length})</p>
            <div className="space-y-2">
              {selectedPages.map(path => {
                const page = pageList.find(p => p.path === path);
                const dur = pageDurations[path];
                return (
                  <div key={path} className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                    <span className="text-white font-medium">{page?.name || path}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: G.bgHi, color: G.text }}>
                      {dur?.label || "Lifetime"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {notes.trim() && <div><p className="text-white/45 text-xs">Notes</p><p className="text-white/70 italic">{notes.trim()}</p></div>}
        </div>
        <div className="flex gap-3 pt-3">
          <button onClick={() => setShowSummary(false)} className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm"
            style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>Edit</button>
          <button onClick={confirmCreate} disabled={saving}
            className="flex-1 py-3 rounded-xl font-inter font-bold text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}>
            {saving ? "Creating…" : "Confirm & Create"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5 space-y-4"
      style={{ background: "linear-gradient(145deg, #0c1630, #060c1c)", borderColor: G.borderHi }}>
      <div className="flex items-center justify-between">
        <h3 className="font-inter font-bold text-white text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4" style={{ color: G.text }} /> Create Access Code
        </h3>
        <button onClick={onCancel} className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.35)" }}><X className="w-4 h-4" /></button>
      </div>

      {/* Customer info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-xs text-white/45 mb-1 block">Customer Name *</label>
          <input value={customerName} onChange={e => setCustomerName(e.target.value)}
            placeholder="e.g. Abdul Rahman"
            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="text-xs text-white/45 mb-1 block">Code String * (auto-uppercase)</label>
          <input value={codeStr} onChange={e => setCodeStr(e.target.value.toUpperCase())}
            placeholder="e.g. ABDUL2026"
            className="w-full px-3 py-2 rounded-lg text-sm text-white font-bold tracking-widest outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
        </div>
        <div>
          <label className="text-xs text-white/45 mb-1 block">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="customer@email.com"
            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
        </div>
        <div>
          <label className="text-xs text-white/45 mb-1 block">Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="+971..."
            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-white/45 mb-1 block">WhatsApp</label>
          <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
            placeholder="+971..."
            className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
        </div>
      </div>

      {/* Pages */}
      <div>
        <label className="text-xs text-white/45 mb-2 block">Pages Unlocked * ({selectedPages.length} selected)</label>
        <input value={pageSearch} onChange={e => setPageSearch(e.target.value)}
          placeholder="Search pages, including published Content Studio pages…"
          className="mb-2 w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filteredPages.map(page => (
            <CreateCodePageItem key={page.path} page={page}
              isSelected={selectedPages.includes(page.path)}
              duration={pageDurations[page.path]}
              onToggle={togglePage}
              onDurationChange={updatePageDuration}
              onCustomDateChange={updateCustomDate}
              subFeatures={pageSubFeatures[page.path]}
              onSubFeaturesChange={updatePageSubFeatures}
              featureDurations={featureDurations}
              onFeatureDurationChange={updateFeatureDuration}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-white/45 mb-1 block">Max Uses (default 1 = single-use, device-bound)</label>
        <div className="flex items-center gap-3">
          <input type="number" min={1} max={1} value={maxUses} onChange={e => setMaxUses(1)}
            className="w-24 px-3 py-2 rounded-lg text-sm text-white outline-none text-center"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
          <span className="text-xs text-white/35">Single-use — bound to one device. Use "Reset Device" to reactivate on a new device.</span>
        </div>
      </div>

      <div>
        <label className="text-xs text-white/45 mb-1 block">Notes (optional)</label>
        <input value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Paid 6 months via WhatsApp"
          className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }} />
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm"
          style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>Cancel</button>
        <button onClick={handleCreate}
          className="flex-1 py-3 rounded-xl font-inter font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}>
          Review & Create
        </button>
      </div>
    </div>
  );
}
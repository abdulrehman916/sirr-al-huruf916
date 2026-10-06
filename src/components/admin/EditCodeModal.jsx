/**
 * EditCodeModal — Add features/pages to an existing Access Code.
 * Preserves existing code data, merges new selections.
 * User re-redeems the same code to get updated permissions.
 */
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
// framer-motion removed — plain divs for reliable modal close/unmount behavior
import { X, Plus, Loader2, Check, KeyRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { getContentPages } from "@/lib/pageRegistry";
import { DURATION_OPTIONS, buildPageGrant, computePageExpiry } from "@/lib/codeDuration";
import CreateCodePageItem from "./CreateCodePageItem";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};



export default function EditCodeModal({ code, onClose, onUpdated }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [savingFeature, setSavingFeature] = useState(null);
  const [localCode, setLocalCode] = useState(code);
  const [dirty, setDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [pageDurations, setPageDurations] = useState({});
  const [pageSubFeatures, setPageSubFeatures] = useState({});
  const [featureDurations, setFeatureDurations] = useState({});

  const pageList = useMemo(() => getContentPages().map(p => ({
    path: p.path, name: p.name, icon: p.icon || '📖',
    category: p.category || 'General', adminOnly: p.adminOnly || false,
  })), []);

  // Initialize from existing code data
  useEffect(() => {
    if (!code) return;
    setLocalCode(code);
    setSelectedPages(code.page_paths || []);
    setPageDurations(code.page_durations || {});
    setPageSubFeatures(code.sub_features || {});
    setFeatureDurations(code.feature_durations || {});
  }, [code]);

  // Escape key closes modal (with unsaved-changes check)
  useEffect(() => {
    if (!code) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (dirty) setShowDiscardConfirm(true);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [code, dirty, onClose]);

  // Clean up body overflow when modal unmounts
  useEffect(() => {
    if (!code) return;
    return () => { document.body.style.overflow = ''; };
  }, [code]);

  if (!code) return null;

  const togglePage = (path) => {
    setDirty(true);
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

  const updatePageSubFeatures = (path, features) => {
    setDirty(true);
    setPageSubFeatures(prev => ({ ...prev, [path]: features }));
  };

  const updatePageDuration = (path, durationValue) => {
    setDirty(true);
    const opt = DURATION_OPTIONS.find(d => d.value === durationValue);
    setPageDurations(prev => ({ ...prev, [path]: { value: durationValue, label: opt?.label, days: opt?.days, duration_ms: opt?.duration_ms, custom_date: null } }));
  };

  const updateCustomDate = (path, customDate) => {
    setDirty(true);
    setPageDurations(prev => ({ ...prev, [path]: { ...prev[path], custom_date: customDate } }));
  };

  const updateFeatureDuration = (path, featureId, plan) => {
    setDirty(true);
    setFeatureDurations(prev => ({ ...prev, [`${path}:${featureId}`]: plan }));
  };

  // Re-fetch code from backend — updates "Currently Unlocked" without closing modal
  const refreshCode = async () => {
    try {
      const updated = await base44.entities.AccessCode.get(code.id);
      setLocalCode(updated);
      setSelectedPages(updated.page_paths || []);
      setPageDurations(updated.page_durations || {});
      setPageSubFeatures(updated.sub_features || {});
      setFeatureDurations(updated.feature_durations || {});
      setDirty(false);
    } catch {}
  };

  // Save a SINGLE feature's duration — does NOT close the modal
  const handleSaveFeature = async (path, featId, plan) => {
    setSavingFeature({ path, featId });
    try {
      const featKey = `${path}:${featId}`;
      const origFeatureDurations = code.feature_durations || {};
      const isFeatureNew = !origFeatureDurations[featKey] && !plan.added_at;
      const nowISO = new Date().toISOString();
      const stampedPlan = isFeatureNew ? { ...plan, added_at: nowISO } : plan;
      const newFeatureDurations = { ...featureDurations, [featKey]: stampedPlan };
      const currentSubFeats = pageSubFeatures[path] || [];
      const newSubFeats = currentSubFeats.includes(featId) ? currentSubFeats : [...currentSubFeats, featId];
      const newPageSubFeatures = { ...pageSubFeatures, [path]: newSubFeats };
      setFeatureDurations(newFeatureDurations);
      setPageSubFeatures(newPageSubFeatures);

      const updateData = {
        feature_durations: newFeatureDurations,
        sub_features: newPageSubFeatures,
      };
      // ── TRUE PER-PAGE EXPIRY: a feature change only affects this page's
      // feature-aware expiry. Preserve the page's granted_at and recompute its
      // expires_at from the new feature set; other pages are untouched. ──
      try {
        const pd = (code.page_durations || {})[path];
        const subFeats = newPageSubFeatures[path] || [];
        const origGrants = code.page_grants || {};
        const existingGrant = origGrants[path];
        const grantedAt = existingGrant?.granted_at || pd?.added_at || code.used_at || nowISO;
        const expiresAt = computePageExpiry(path, pd, subFeats, newFeatureDurations, new Date(grantedAt).getTime());
        updateData.page_grants = { ...origGrants, [path]: { granted_at: grantedAt, expires_at: expiresAt, duration_label: pd?.label || '' } };
      } catch { /* best-effort — never block feature save */ }
      if (isFeatureNew) {
        const me = await base44.auth.me();
        const dl = stampedPlan.is_lifetime ? 'Lifetime' : stampedPlan.duration_days ? `${stampedPlan.duration_days} days` : 'N/A';
        updateData.audit_log = [...(code.audit_log || []), {
          action: "ADDED_FEATURE", timestamp: nowISO, admin_id: me?.id || "",
          details: `Feature added: ${featKey} — Plan: ${stampedPlan.plan_name || 'N/A'} (${dl})`,
        }];
      }
      await base44.functions.invoke("updateAccessCode", { code_id: code.id, update_data: updateData });
      toast({ title: `✓ ${featId} saved` });
      refreshCode();
    } catch (e) {
      toast({ title: "Error saving feature", description: e.message, variant: "destructive" });
    } finally {
      setSavingFeature(null);
    }
  };

  // Close request — checks for unsaved changes before closing
  const requestClose = () => {
    if (dirty) setShowDiscardConfirm(true);
    else onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const names = selectedPages.map(path => pageList.find(p => p.path === path)?.name || path);

      // Build sub_features — only include pages with specific selections
      const sub_features = {};
      selectedPages.forEach(path => {
        const feats = pageSubFeatures[path];
        if (feats && feats.length > 0) sub_features[path] = feats;
      });

      // Stamp added_at on newly added feature/page durations (not in original code)
      const nowISO = new Date().toISOString();
      const origFeatureDurations = code.feature_durations || {};
      const origPageDurations = code.page_durations || {};

      const stampedFeatureDurations = {};
      Object.keys(featureDurations).forEach(key => {
        const fd = featureDurations[key];
        stampedFeatureDurations[key] = (!origFeatureDurations[key] && !fd.added_at)
          ? { ...fd, added_at: nowISO } : fd;
      });

      const stampedPageDurations = {};
      Object.keys(pageDurations).forEach(path => {
        const pd = pageDurations[path];
        stampedPageDurations[path] = (!origPageDurations[path] && !pd.added_at)
          ? { ...pd, added_at: nowISO } : pd;
      });

      // Build audit entries for page/feature additions and removals
      const me = await base44.auth.me();
      const origPagePaths = code.page_paths || [];
      const newFeatureKeys = Object.keys(stampedFeatureDurations);
      const addedPages = selectedPages.filter(p => !origPagePaths.includes(p));
      const removedPages = origPagePaths.filter(p => !selectedPages.includes(p));
      const addedFeatureKeys = newFeatureKeys.filter(k => !origFeatureDurations[k]);
      const removedFeatureKeys = Object.keys(origFeatureDurations).filter(k => !newFeatureKeys.includes(k));
      const auditEntries = [];
      addedPages.forEach(p => {
        const pn = pageList.find(pg => pg.path === p)?.name || p;
        auditEntries.push({ action: "ADDED_PAGE", timestamp: nowISO, admin_id: me?.id || "", details: `Page added: ${pn} (${p})` });
      });
      removedPages.forEach(p => {
        const pn = pageList.find(pg => pg.path === p)?.name || p;
        auditEntries.push({ action: "REMOVED_PAGE", timestamp: nowISO, admin_id: me?.id || "", details: `Page removed: ${pn} (${p})` });
      });
      addedFeatureKeys.forEach(k => {
        const fd = stampedFeatureDurations[k];
        const dl = fd.is_lifetime ? 'Lifetime' : fd.duration_days ? `${fd.duration_days} days` : 'N/A';
        auditEntries.push({ action: "ADDED_FEATURE", timestamp: nowISO, admin_id: me?.id || "", details: `Feature added: ${k} — Plan: ${fd.plan_name || 'N/A'} (${dl})` });
      });
      removedFeatureKeys.forEach(k => {
        auditEntries.push({ action: "REMOVED_FEATURE", timestamp: nowISO, admin_id: me?.id || "", details: `Feature removed: ${k}` });
      });

      // ── TRUE PER-PAGE EXPIRY: build page_grants so each page keeps its OWN
      // independent { granted_at, expires_at }. Only pages that are added,
      // removed, or whose duration/sub-features actually change are touched —
      // existing unchanged pages retain their original timer forever. ──
      const origPageGrants = code.page_grants || {};
      const newPageGrants = { ...origPageGrants };

      const durEqual = (a, b) => {
        if (!a && !b) return true;
        if (!a || !b) return false;
        return a.value === b.value && a.days === b.days && a.duration_ms === b.duration_ms &&
          (a.custom_date || null) === (b.custom_date || null);
      };
      const subFeatsEqual = (a, b) =>
        (a || []).slice().sort().join(",") === (b || []).slice().sort().join(",");

      removedPages.forEach(p => { delete newPageGrants[p]; });

      selectedPages.forEach(path => {
        const newDur = stampedPageDurations[path];
        const origDur = origPageDurations[path];
        const newSub = pageSubFeatures[path] || [];
        const origSub = (code.sub_features || {})[path] || [];
        const isNew = !origPagePaths.includes(path);
        const durChanged = !durEqual(newDur, origDur);
        const subChanged = !subFeatsEqual(newSub, origSub);
        if (isNew || durChanged || subChanged) {
          // New page or duration/feature change → (re)grant this page only from now.
          newPageGrants[path] = buildPageGrant(path, newDur, newSub, stampedFeatureDurations, Date.now());
        }
      });

      await base44.functions.invoke("updateAccessCode", {
        code_id: code.id,
        update_data: {
          page_paths: selectedPages,
          page_names: names,
          page_durations: stampedPageDurations,
          page_grants: newPageGrants,
          sub_features,
          feature_durations: stampedFeatureDurations,
          audit_log: [...(code.audit_log || []), ...auditEntries],
        },
      });

      toast({ title: `✓ Code "${code.code}" updated` });
      setDirty(false);
      if (onUpdated) onUpdated();
      else onClose();
    } catch (e) {
      toast({ title: "Error updating code", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const existingPageNames = localCode?.page_names || localCode?.page_paths || code.page_names || code.page_paths || [];

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4"
        style={{ background: "rgba(0,0,0,0.70)" }}
        onClick={requestClose}
      >
        <div
          className="w-full max-w-2xl my-8 rounded-2xl border p-5 space-y-4"
          style={{ background: "linear-gradient(145deg, #0c1630, #060c1c)", borderColor: G.borderHi }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" style={{ color: G.text }} />
              <div>
                <h3 className="font-inter font-bold text-white text-sm">Edit Code: {code.code}</h3>
                <p className="text-[10px] text-white/40">{code.customer_name} · Add or modify features</p>
              </div>
            </div>
            <button onClick={requestClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.35)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current pages summary */}
          <div className="rounded-lg border p-2.5" style={{ background: G.bg, borderColor: G.border }}>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Currently unlocked</p>
            <div className="flex flex-wrap gap-1.5">
              {existingPageNames.map((name, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[11px] font-semibold"
                  style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Page selection */}
          <div>
            <label className="text-xs text-white/45 mb-2 block">
              Pages & Features ({selectedPages.length} selected)
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {pageList.map(page => {
                const sel = selectedPages.includes(page.path);
                const dur = pageDurations[page.path];
                return (
                  <CreateCodePageItem
                    key={page.path}
                    page={page}
                    isSelected={sel}
                    duration={dur}
                    onToggle={togglePage}
                    onDurationChange={updatePageDuration}
                    onCustomDateChange={updateCustomDate}
                    subFeatures={pageSubFeatures[page.path]}
                    onSubFeaturesChange={updatePageSubFeatures}
                    featureDurations={featureDurations}
                    onFeatureDurationChange={updateFeatureDuration}
                    onSaveFeature={handleSaveFeature}
                    savingFeature={savingFeature}
                  />
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => onClose()}
              className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm"
              style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 rounded-xl font-inter font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Discard unsaved changes confirmation */}
      {showDiscardConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.80)" }}
          onClick={() => setShowDiscardConfirm(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl border p-5 space-y-4 text-center"
            style={{ background: "linear-gradient(145deg, #0c1630, #060c1c)", borderColor: G.borderHi }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-inter font-bold text-white text-sm">Discard unsaved changes?</h3>
            <p className="text-xs text-white/50">You have unsaved modifications that will be lost.</p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-2.5 rounded-xl font-inter font-semibold text-xs"
                style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
                No, Stay
              </button>
              <button onClick={() => { setShowDiscardConfirm(false); onClose(); }}
                className="flex-1 py-2.5 rounded-xl font-inter font-bold text-xs"
                style={{ background: "linear-gradient(135deg, #ef4444, #b91c1c)", color: "#fff" }}>
                Yes, Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save, ShieldCheck } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/api/base44Client';
import ROUTE_MANIFEST from '@/lib/routeManifest';

const MODES = ['FREE', 'LOGIN', 'PAID', 'COUPON', 'SELECTED'];
const DURATIONS = [
  { label: 'Owner managed', value: '' },
  { label: '1 month', value: '30' },
  { label: '3 months', value: '90' },
  { label: '6 months', value: '180' },
  { label: '12 months', value: '365' },
];

const eligibleRoutes = ROUTE_MANIFEST.filter((route) => (
  route.path !== '/' &&
  !route.path.startsWith('/admin/') &&
  !route.flags?.includes('noauth') &&
  !route.path.includes(':')
));

const slugFromPath = (path) => `page-${path.replace(/^\//, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

export default function OwnerResourceStudio() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');

  const byPath = useMemo(() => Object.fromEntries(resources.map((item) => [item.metadata?.route_path, item])), [resources]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('resources').select('*').eq('resource_type', 'PAGE').order('created_at');
    if (error) setMessage(error.message);
    else setResources(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save(path, form) {
    setSaving(path);
    setMessage('');
    const existing = byPath[path];
    const payload = {
      slug: existing?.slug || slugFromPath(path),
      resource_type: 'PAGE',
      title: { ml: form.title || path },
      status: form.status,
      access_mode: form.access_mode,
      price_minor: Math.max(0, Math.round(Number(form.price || 0) * 100)),
      currency: form.currency || 'INR',
      validity_days: form.lifetime ? null : (form.validity_days ? Number(form.validity_days) : null),
      lifetime_access: form.lifetime,
      metadata: { ...(existing?.metadata || {}), route_path: path },
    };
    const query = existing
      ? supabase.from('resources').update(payload).eq('id', existing.id)
      : supabase.from('resources').insert(payload);
    const { error } = await query;
    setMessage(error ? error.message : `${path} saved successfully`);
    if (!error) await load();
    setSaving('');
  }

  return (
    <AdminLayout title="Page Access & Pricing" subtitle="Free, Login, Paid, validity and lifetime controls">
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] p-4 text-sm text-white/65">
          <ShieldCheck className="mr-2 inline h-4 w-4 text-yellow-200" />
          Calculation formulas are protected. This screen changes only page access and pricing.
        </div>
        {message && <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/70">{message}</div>}
        {loading ? <Loader2 className="mx-auto h-7 w-7 animate-spin text-yellow-200" /> : eligibleRoutes.map((route) => (
          <ResourceRow key={route.path} route={route} resource={byPath[route.path]} saving={saving === route.path} onSave={save} />
        ))}
      </div>
    </AdminLayout>
  );
}

function ResourceRow({ route, resource, saving, onSave }) {
  const [form, setForm] = useState(() => ({
    title: resource?.title?.ml || route.component,
    status: resource?.status || 'PUBLISHED',
    access_mode: resource?.access_mode || (route.flags?.includes('public') ? 'FREE' : 'PAID'),
    price: Number(resource?.price_minor || 0) / 100,
    currency: resource?.currency || 'INR',
    validity_days: resource?.validity_days || '',
    lifetime: resource?.lifetime_access || false,
  }));
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="rounded-2xl border border-white/10 bg-[#07101f] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div><p className="font-semibold text-white">{route.component}</p><p className="text-xs text-white/35">{route.path}</p></div>
        <span className="text-xs text-white/40">{resource ? 'Configured' : 'Legacy fallback'}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input value={form.title} onChange={(e) => set('title', e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" aria-label={`${route.path} title`} />
        <select value={form.access_mode} onChange={(e) => set('access_mode', e.target.value)} className="rounded-lg border border-white/10 bg-[#0b1425] px-3 py-2 text-sm text-white" aria-label={`${route.path} access mode`}>{MODES.map((mode) => <option key={mode}>{mode}</option>)}</select>
        <div className="flex gap-2"><input type="number" min="0" step="0.01" value={form.price} disabled={form.access_mode !== 'PAID'} onChange={(e) => set('price', e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-40" aria-label={`${route.path} price`} /><input value={form.currency} onChange={(e) => set('currency', e.target.value.toUpperCase())} className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white" aria-label={`${route.path} currency`} /></div>
        <select value={form.validity_days} disabled={form.lifetime} onChange={(e) => set('validity_days', e.target.value)} className="rounded-lg border border-white/10 bg-[#0b1425] px-3 py-2 text-sm text-white disabled:opacity-40" aria-label={`${route.path} validity`}>{DURATIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={form.lifetime} onChange={(e) => set('lifetime', e.target.checked)} /> Lifetime</label>
        <label className="flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={form.status === 'PUBLISHED'} onChange={(e) => set('status', e.target.checked ? 'PUBLISHED' : 'DRAFT')} /> Published</label>
        <button type="button" disabled={saving} onClick={() => onSave(route.path, form)} className="ml-auto flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
      </div>
    </div>
  );
}

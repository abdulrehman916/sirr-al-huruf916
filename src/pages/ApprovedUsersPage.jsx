import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';

export default function ApprovedUsersPage() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [cursors, setCursors] = useState(['']);
  const [result, setResult] = useState({ rows: [], has_more: false, next_cursor: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const [reload, setReload] = useState(0);
  const generation = useRef(0);
  const after = cursors[cursors.length - 1];
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(query.trim()); setCursors(['']); }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const attempt = ++generation.current;
    setLoading(true); setError('');
    platform.functions.invoke('ownerCustomerDirectory', { search, status, after, limit: 50 })
      .then(({ data }) => { if (generation.current === attempt) setResult(data); })
      .catch(e => { if (generation.current === attempt) setError(e.message || 'Customers could not be loaded.'); })
      .finally(() => { if (generation.current === attempt) setLoading(false); });
    return () => { generation.current++; };
  }, [search, status, after, reload]);
  const changeStatus = async row => {
    if (busy) return;
    const next = row.account_status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    if (!window.confirm(`${next === 'BLOCKED' ? 'Block' : 'Unblock'} ${row.email}?`)) return;
    setBusy(row.id); setError('');
    try {
      await platform.functions.invoke('setCustomerStatus', { user_id: row.id, status: next });
      setReload(value => value + 1);
    } catch (e) { setError(e.message || 'Customer status could not be changed.'); }
    finally { setBusy(null); }
  };
  return <AdminLayout title="Customers" subtitle="Search and manage your customer accounts">
    <div className="max-w-7xl mx-auto space-y-5 text-white">
      <div className="flex flex-wrap gap-3">
        <input aria-label="Search all customers" placeholder="Search name or email" value={query} onChange={e => setQuery(e.target.value)} className="flex-1 min-w-48 rounded-xl border border-white/20 bg-slate-950 px-4 py-3" />
        <select aria-label="Customer status" value={status} onChange={e => { setStatus(e.target.value); setCursors(['']); }} className="rounded-xl border border-white/20 bg-slate-950 px-4 py-3"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="BLOCKED">Blocked</option><option value="REMOVED">Removed</option><option value="ARCHIVED">Archived</option></select>
        <button type="button" disabled={loading} onClick={() => setReload(v => v + 1)} className="rounded-xl border border-amber-200/30 px-4 py-3 disabled:opacity-40">Refresh</button>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-400/40 p-4 text-red-200">{error}<button type="button" onClick={() => setReload(v => v + 1)} className="ml-4 underline">Retry</button></div>}
      {loading ? <p role="status">Loading customers…</p> : <>
        <p className="text-sm text-white/50">Page {cursors.length} · {result.rows.length} customers shown</p>
        <div className="overflow-x-auto rounded-xl border border-white/15"><table className="w-full text-sm text-left"><thead className="bg-white/5"><tr><th className="p-4">Customer</th><th className="p-4">Account</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>
          {result.rows.map(row => <tr key={row.id} className="border-t border-white/10"><td className="p-4"><p>{row.full_name || '—'}</p><p className="text-white/60 break-all">{row.email}</p>{row.mobile && <p className="text-white/50">{row.mobile}</p>}</td><td className="p-4">{row.registered ? 'Signed in' : 'Imported · first sign-in pending'}</td><td className="p-4">{row.account_status}</td><td className="p-4">{row.registered ? <div className="flex flex-wrap gap-3"><Link className="text-amber-200 underline" to={'/admin/user/' + row.id}>View details</Link><button type="button" disabled={Boolean(busy)} onClick={() => changeStatus(row)} className="underline disabled:opacity-40">{busy === row.id ? 'Saving…' : row.account_status === 'BLOCKED' ? 'Unblock' : 'Block'}</button></div> : <span className="text-white/50">Account controls become available after the customer's first sign-in.</span>}</td></tr>)}
          {!result.rows.length && <tr><td colSpan={4} className="p-8 text-center text-white/50">No matching customers.</td></tr>}
        </tbody></table></div>
        <div className="flex items-center justify-between"><button type="button" disabled={cursors.length === 1 || loading} onClick={() => setCursors(items => items.slice(0, -1))} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-30">Previous</button><button type="button" disabled={!result.has_more || loading} onClick={() => setCursors(items => [...items, result.next_cursor])} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-30">Next</button></div>
      </>}
    </div>
  </AdminLayout>;
}

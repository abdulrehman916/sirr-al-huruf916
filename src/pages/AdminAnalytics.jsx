import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { platform } from '@/api/platformClient';
import { useAuth } from '@/lib/AuthContext';

const METRICS = [
  ['total_users','Customers'], ['active_users','Active registered customers'], ['blocked_users','Blocked registered customers'],
  ['total_codes','All codes'], ['active_codes','Active codes'], ['expired_codes','Expired codes'], ['disabled_codes','Disabled codes'],
  ['lifetime_codes','Lifetime codes'], ['expiring_7days','Codes expiring within 7 days'], ['active_permissions','Active page grants'],
  ['pending_requests','Pending access requests'], ['pending_support','Open support tickets'], ['renewals_today','Renewals today'], ['recent_redeems','Redeems in 7 days'],
];

function downloadCsv(name, columns, rows) {
  const cell = value => {
    let text = String(value ?? '');
    if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  const content = '\uFEFF' + [columns, ...rows].map(row => row.map(cell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = name;
  document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AdminAnalytics() {
  const { role } = useAuth();
  const [tab, setTab] = useState('overview');
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [stats, setStats] = useState(null);
  const [audit, setAudit] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (role !== 'owner') return;
    let current = true; setLoading(true); setError('');
    const request = tab === 'overview' ? platform.functions.invoke('getUserStats') : platform.functions.invoke('getOwnerAuditLog', { limit: 50, skip: page * 50 });
    request.then(({ data }) => {
      if (!data?.success) throw new Error('Could not load analytics');
      if (current) { if (tab === 'overview') setStats(data.stats); else setAudit(data); }
    }).catch(e => { if (current) setError(e.message); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [role, tab, page, refresh]);
  const exportData = async () => {
    setExporting(true); setError('');
    try {
      if (tab === 'overview') downloadCsv('owner-statistics.csv', ['Metric','Value'], METRICS.map(([key,label]) => [label,stats?.[key] ?? 0]));
      else {
        const rows = []; let skip = 0;
        for (;;) {
          const { data } = await platform.functions.invoke('getOwnerAuditLog', { limit: 200, skip });
          if (!data?.success) throw new Error('Audit export failed');
          rows.push(...data.rows); skip += data.rows.length;
          if (skip >= data.total) break;
          if (!data.rows.length) throw new Error('Audit export stopped before completion');
        }
        downloadCsv('owner-audit.csv', ['Timestamp','Action','Actor','Details'], rows.map(row => [row.timestamp,row.action_label || row.action_type || row.action,row.performed_by_email || row.performed_by,typeof row.details === 'object' ? JSON.stringify(row.details) : row.details]));
      }
    } catch (e) { setError(e.message); } finally { setExporting(false); }
  };
  return <AdminLayout title="Analytics & audit" subtitle="Owner statistics"><div className="space-y-5 text-white">
    <div className="flex flex-wrap gap-3">{['overview','audit'].map(value => <button key={value} type="button" aria-pressed={tab === value} onClick={() => { setTab(value); setPage(0); }} className="rounded-lg border border-amber-200/30 px-4 py-2">{value === 'overview' ? 'Overview' : 'Audit logs'}</button>)}<button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40">Refresh</button><button type="button" disabled={loading || exporting || Boolean(error)} onClick={exportData} className="rounded-lg bg-amber-200 text-slate-950 px-4 py-2 disabled:opacity-40">{exporting ? 'Exporting…' : 'Export CSV'}</button><Link to="/admin/shop" className="underline px-3 py-2">Shop dashboard</Link><Link to="/admin/audit-log" className="underline px-3 py-2">Search all audit logs</Link></div>
    {error && <p role="alert" className="text-red-200">{error}<button type="button" className="ml-4 underline" onClick={() => setRefresh(value => value + 1)}>Retry</button></p>}
    {loading ? <p role="status">Loading…</p> : !error && (tab === 'overview' ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{METRICS.map(([key,label]) => <article key={key} className="rounded-xl border border-amber-200/20 p-4"><p className="text-white/60 text-sm">{label}</p><p className="text-2xl text-amber-200 mt-2">{stats?.[key] ?? 0}</p></article>)}</div> : <><p>{audit.total} recorded actions · Page {page + 1}</p><div className="space-y-3">{audit.rows.map(row => <article key={row.id} className="rounded-xl border border-white/15 p-4"><p className="text-amber-200">{row.action_label || row.action_type || row.action}</p><p className="text-white/60 text-sm">{row.performed_by_email || row.performed_by} · {row.timestamp}</p>{row.details && <p className="whitespace-pre-wrap break-words">{typeof row.details === 'object' ? JSON.stringify(row.details) : row.details}</p>}</article>)}{!audit.rows.length && <p>No recorded actions.</p>}</div><div className="flex justify-between"><button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)} className="underline disabled:opacity-30">Previous</button><button type="button" disabled={(page + 1) * 50 >= audit.total} onClick={() => setPage(value => value + 1)} className="underline disabled:opacity-30">Next</button></div></>)}
  </div></AdminLayout>;
}

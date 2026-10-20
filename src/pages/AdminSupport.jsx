import { useEffect, useRef, useState } from 'react';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import OwnerSupportConversation from '@/components/admin/OwnerSupportConversation';

export default function AdminSupport() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [cursors, setCursors] = useState([null]);
  const [result, setResult] = useState({ tickets: [], has_more: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const requestKey = useRef(null);
  const after = cursors[cursors.length - 1];
  useEffect(() => { const timer = setTimeout(() => { setSearch(query.trim()); setCursors([null]); }, 300); return () => clearTimeout(timer); }, [query]);
  useEffect(() => {
    const attempt = ++generation.current; setLoading(true); setError('');
    platform.functions.invoke('manageSupportRouting', { action: 'GET_SCOPED_TICKETS', search, status, after, limit: 50 })
      .then(({ data }) => { if (generation.current === attempt) setResult(data); })
      .catch(e => { if (generation.current === attempt) setError(e.message); })
      .finally(() => { if (generation.current === attempt) setLoading(false); });
    return () => { generation.current++; };
  }, [search, status, after, reload]);
  const changeStatus = async ticket => {
    if (busy) return; setBusy(true); setError('');
    try { await platform.entities.SupportTickets.update(ticket.id, { status: ticket.status === 'CLOSED' ? 'OPEN' : 'CLOSED' }); setReload(v => v + 1); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const sendReply = async () => {
    if (busy || !reply.trim() || !selected) return;
    setBusy(true); setError(''); requestKey.current ||= crypto.randomUUID();
    try {
      await platform.functions.invoke('ownerReplySupport', { ticket_id: selected.ticket_id, message: reply.trim(), request_id: requestKey.current });
      requestKey.current = null; setReply(''); setSelected(null); setReload(v => v + 1);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <AdminLayout title="Customer support" subtitle="Read and reply directly as Owner"><div className="max-w-7xl mx-auto space-y-5 text-white">
    <div className="flex flex-wrap gap-3"><input aria-label="Search all support tickets" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search customer, email, subject or ticket ID" className="flex-1 min-w-48 rounded-xl border border-white/20 bg-slate-950 px-4 py-3" /><select aria-label="Ticket status" value={status} onChange={e => { setStatus(e.target.value); setCursors([null]); }} className="rounded-xl border border-white/20 bg-slate-950 px-4 py-3"><option value="">All statuses</option>{['OPEN','IN_PROGRESS','RESOLVED','CLOSED'].map(value => <option key={value}>{value}</option>)}</select><button type="button" disabled={loading} onClick={() => setReload(v => v + 1)} className="rounded-xl border border-white/20 px-4 disabled:opacity-30">Refresh</button></div>
    {error && <div role="alert" className="text-red-200 border border-red-400/30 rounded-xl p-4">{error}<button type="button" onClick={() => setReload(v => v + 1)} className="ml-4 underline">Retry</button></div>}
    {loading ? <p role="status">Loading support tickets…</p> : <><p className="text-sm text-white/50">Page {cursors.length} · {result.tickets.length} tickets shown</p><div className="space-y-3">{result.tickets.map(ticket => <article key={ticket.id} className="rounded-xl border border-white/15 p-4 space-y-3"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-amber-200">{ticket.ticket_id} · {ticket.status}</p><h2 className="font-semibold mt-1">{ticket.subject}</h2><p className="text-sm text-white/60 break-all">{ticket.name} · {ticket.email}</p></div><div className="flex gap-4"><button type="button" disabled={busy} onClick={() => { setSelected(ticket); setReply(''); requestKey.current = null; }} className="underline text-amber-200 disabled:opacity-30">Open & reply</button><button type="button" disabled={busy} onClick={() => changeStatus(ticket)} className="underline disabled:opacity-30">{ticket.status === 'CLOSED' ? 'Reopen' : 'Close'}</button></div></div><p className="text-sm text-white/70 whitespace-pre-wrap break-words">{ticket.message}</p>{ticket.admin_reply && <p className="text-sm border-l border-amber-200/40 pl-3 whitespace-pre-wrap">Owner reply: {ticket.admin_reply}</p>}</article>)}{!result.tickets.length && <p>No matching tickets.</p>}</div><div className="flex justify-between"><button type="button" disabled={cursors.length === 1} onClick={() => setCursors(items => items.slice(0,-1))} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-30">Previous</button><button type="button" disabled={!result.has_more} onClick={() => setCursors(items => [...items,result.next_cursor])} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-30">Next</button></div></>}
    {selected && <div role="dialog" aria-modal="true" aria-label="Reply to support ticket" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"><section className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-950 border border-amber-200/25 p-6 space-y-4"><div className="flex justify-between gap-3"><h2 className="font-semibold">{selected.subject}</h2><button type="button" disabled={busy} onClick={() => setSelected(null)} className="underline">Close</button></div><p className="whitespace-pre-wrap break-words">{selected.message}</p>{selected.attachment_url && <a className="block text-amber-200 underline" target="_blank" rel="noopener noreferrer" href={selected.attachment_url}>Open attachment</a>}{selected.audio_url && <audio controls src={selected.audio_url} className="w-full" />}<OwnerSupportConversation key={selected.ticket_id} ticket={selected} />{error && <p role="alert" className="text-red-200">{error}</p>}<textarea aria-label="Owner reply" rows={5} maxLength={6000} value={reply} onChange={e => { setReply(e.target.value); requestKey.current=null; }} className="w-full rounded-xl border border-white/20 bg-slate-900 p-3" /><button type="button" disabled={busy || !reply.trim()} onClick={sendReply} className="rounded-xl bg-amber-200 text-slate-950 px-5 py-3 disabled:opacity-30">{busy ? 'Saving reply…' : 'Send reply'}</button></section></div>}
  </div></AdminLayout>;
}

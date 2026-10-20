import { useEffect, useState } from 'react';
import { platform } from '@/api/platformClient';

export default function OwnerSupportConversation({ ticket }) {
  const [cursors, setCursors] = useState([null]);
  const [result, setResult] = useState({ messages: [], has_more: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const after = cursors[cursors.length - 1];
  useEffect(() => {
    let current = true;
    setLoading(true); setError('');
    platform.functions.invoke('manageSupportRouting', {
      action: 'GET_TICKET_MESSAGES', ticket_id: ticket.ticket_id, after, limit: 50,
    }).then(({ data }) => { if (current) setResult(data); })
      .catch(e => { if (current) setError(e.message); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [ticket.ticket_id, after, refresh]);
  useEffect(() => platform.entities.SupportMessage.subscribe(event => {
    if (event.data?.ticket_id === ticket.ticket_id) setRefresh(value => value + 1);
  }), [ticket.ticket_id]);
  return <section aria-label="Support conversation" className="space-y-3 border-y border-white/15 py-4">
    <div className="flex justify-between gap-3"><h3 className="font-semibold">Conversation</h3><button type="button" disabled={loading} onClick={() => { setCursors([null]); setRefresh(value => value + 1); }} className="underline disabled:opacity-40">Latest messages</button></div>
    {loading ? <p role="status">Loading conversation…</p> : error ? <p role="alert" className="text-red-200">{error}<button type="button" className="ml-3 underline" onClick={() => setRefresh(value => value + 1)}>Retry</button></p> : <>
      {!result.messages.length && <p className="text-white/60">{ticket.admin_reply ? 'Owner reply: ' + ticket.admin_reply : 'No conversation messages yet.'}</p>}
      {[...result.messages].reverse().map(message => <article key={message.id} className="rounded-lg bg-white/5 p-3 space-y-2">
        <div className="text-xs text-amber-100/70">{message.sender_type === 'ADMIN' ? 'Owner' : message.sender_name || 'Customer'}{message.created_date && <time className="ml-3">{new Date(message.created_date).toLocaleString()}</time>}</div>
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        {message.attachment_url && <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="underline text-amber-200">Open message attachment</a>}
        {message.audio_url && <audio controls src={message.audio_url} className="w-full" />}
      </article>)}
      <div className="flex justify-between gap-3"><button type="button" disabled={!result.has_more} onClick={() => setCursors(values => [...values, result.next_cursor])} className="underline disabled:opacity-30">Older messages</button><button type="button" disabled={cursors.length === 1} onClick={() => setCursors(values => values.slice(0,-1))} className="underline disabled:opacity-30">Newer messages</button></div>
    </>}
  </section>;
}

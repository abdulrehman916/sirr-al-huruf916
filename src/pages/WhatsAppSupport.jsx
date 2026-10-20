import { useEffect, useState } from 'react';
import { platform } from '@/api/platformClient';
import PageLayout from '@/components/PageLayout';

export default function WhatsAppSupport() {
  const [contact, setContact] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    platform.functions.invoke('manageSupportRouting', { action: 'GET_OWNER_CONTACT' })
      .then(({ data }) => { if (alive) { setContact(data.contact); if (!data.contact) setError('Owner WhatsApp support has not been configured. Please use the support ticket page.'); } })
      .catch(e => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [retry]);
  const number = String(contact?.whatsapp_number || '').replace(/\D/g, '');
  return <PageLayout><section className="max-w-xl mx-auto p-6 space-y-5 text-white"><h1 className="text-2xl font-semibold">Owner support</h1><p className="text-white/60">നിങ്ങളുടെ സഹായ അഭ്യർത്ഥന നേരിട്ട് Owner-ന് നൽകാം.</p>{loading ? <p role="status">Loading support contact…</p> : error ? <div role="alert"><p>{error}</p><button type="button" onClick={() => setRetry(v => v + 1)} className="underline mt-3">Retry</button></div> : number ? <a className="inline-block rounded-xl bg-emerald-700 px-5 py-3" href={`https://wa.me/${number}?text=${encodeURIComponent('Hello, I need support with Sirr al-Huruf.')}`} target="_blank" rel="noopener noreferrer">Open WhatsApp</a> : <p>WhatsApp number is unavailable.</p>}<a href="/support/ticket" className="block underline text-amber-200">Create a support ticket</a></section></PageLayout>;
}

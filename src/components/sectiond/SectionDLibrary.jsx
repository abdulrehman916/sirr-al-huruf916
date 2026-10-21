import { useEffect, useState } from 'react';
import { supabase } from '@/api/platformClient';
import { useIsOwner } from '@/hooks/useIsOwner';
import { CardNotes } from '@/components/owner/OwnerContent';

// New names are created explicitly by the owner. No source cards are fabricated.
export default function SectionDLibrary() {
  const owner = useIsOwner();
  const [cards, setCards] = useState([]);
  const [open, setOpen] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    supabase.from('owner_content').select('*').eq('scope','/holy-names/card/d-index').order('section').then(({ data,error }) => {
      if (alive) { if (error) setError('Section D names could not load.'); else setCards(data || []); }
    });
    return () => { alive = false; };
  }, []);
  const add = async event => {
    event.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true); setError('');
    try {
      if (cards.some(card => card.content.title.trim() === name.trim())) throw new Error('This name already has a card. Open it to add information.');
      const { data,error } = await supabase.rpc('save_owner_content', { p_scope:'/holy-names/card/d-index',p_section:`name-${crypto.randomUUID()}`,p_feature:'section_d',p_content:{title:name.trim()},p_revision:0 });
      if (error) throw error;
      setCards(previous => [...previous,data]); setName(''); setOpen(data.section);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  return <section aria-label="Section D" className="min-h-[40vh] space-y-4">
    {owner && <form onSubmit={add} className="flex gap-2 flex-wrap"><input aria-label="New Section D name" dir="auto" value={name} onChange={e => setName(e.target.value)} placeholder="Name / പേര് / الاسم" className="flex-1 min-w-0 rounded-lg border border-yellow-500/30 bg-slate-950 p-3 text-white" /><button disabled={busy || !name.trim()} className="btn-gold rounded-lg px-4 py-2">Add name</button></form>}
    {error && <p role="alert" className="text-red-200">{error}</p>}
    {cards.map(card => <article key={card.section} className="rounded-xl border border-yellow-500/25 p-4"><button type="button" onClick={() => setOpen(open === card.section ? null : card.section)} aria-expanded={open === card.section} className="w-full text-left text-yellow-100 text-lg" dir="auto">{card.content.title}</button>{open === card.section && <CardNotes cardKey={card.section} kind="holy-d" />}</article>)}
  </section>;
}

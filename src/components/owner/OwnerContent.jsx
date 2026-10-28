import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/api/platformClient';
import { useIsOwner } from '@/hooks/useIsOwner';
import { cardContentRequest, mergeCardNotes } from '@/lib/cardContentRequests';

import { BackLayer } from "@/lib/useBackLayer";
const empty = { title: '', arabic: '', malayalam: '', english: '', images: [] };
const fieldStyle = 'w-full rounded-lg border border-yellow-500/25 bg-slate-950 p-3 text-white';
const PAGE_SIZE = 20;
export function CardNotes({ cardKey, kind, language }) {
  return <CardNotebook key={`${kind}:${cardKey}`} cardKey={cardKey} kind={kind} language={language} />;
}
function CardNotebook({ cardKey, kind, language }) {
  const owner = useIsOwner();
  const feature = kind.startsWith('holy-') ? `section_${kind.slice(-1)}` : '';
  const scope = kind === 'plant' ? `/plants/${cardKey}` : kind === 'holy-a' || kind === 'holy-b' ? `/holy-names/one/${cardKey}` : `/holy-names/card/${kind.slice(-1)}/${cardKey}`;
  const [rows, setRows] = useState([]);
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const mounted = useRef(true);
  const load = async (after = null) => {
    setLoading(true); setError('');
    try {
      let query = supabase.from('owner_content').select('*').eq('scope', scope).order('section').limit(PAGE_SIZE + 1);
      if (after) query = query.gt('section', after);
      const { data, error: failure } = await cardContentRequest(signal => query.abortSignal(signal));
      if (failure) throw failure;
      if (!mounted.current) return;
      setRows(previous => after ? mergeCardNotes(previous, data.slice(0, PAGE_SIZE)) : data.slice(0, PAGE_SIZE));
      setMore(data.length > PAGE_SIZE);
      setCursor(data.slice(0, PAGE_SIZE).at(-1)?.section || null);
    } catch (failure) { if (mounted.current) setError(failure.message || 'Could not load this card’s information.'); }
    finally { if (mounted.current) setLoading(false); }
  };
  useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false; }; }, [scope]);
  if (!owner && !rows.length && !error) return null;
  return <section aria-label="Additional card information" className="my-5 space-y-4">
    <div className="flex items-center justify-between gap-3 flex-wrap"><h2 className="text-yellow-100 font-semibold">{language === 'ml' ? 'കൂടുതൽ വിവരങ്ങൾ' : language === 'en' ? 'Additional information' : 'Additional information / കൂടുതൽ വിവരങ്ങൾ'}</h2>
      {owner && <button type="button" disabled={loading || !!error} onClick={() => setEditor({ section: `note-${Date.now()}-${crypto.randomUUID()}` })} className="rounded-lg border border-yellow-500/40 bg-slate-950 px-4 py-2 text-sm text-yellow-200">{language === 'ml' ? 'വിവരങ്ങളും ചിത്രങ്ങളും ചേർക്കുക' : language === 'en' ? 'Add information and photos' : 'Add information / വിവരം ചേർക്കുക'}</button>}
    </div>
    {error && <div role="alert" className="text-red-200 text-sm">{error} <button onClick={() => load()} className="underline">Retry</button></div>}
    {rows.map(row => <article key={row.section} className="min-w-0">
      {owner && <button type="button" onClick={() => setEditor(row)} className="rounded-lg border border-yellow-500/30 px-3 py-2 text-xs text-yellow-200">{language === 'ml' ? 'തിരുത്തുക' : language === 'en' ? 'Edit information' : 'Edit information / തിരുത്തുക'}</button>}
      <PublishedContent content={row.content} language={language} />
    </article>)}
    {loading && <p role="status" className="text-xs text-white/50">{language === 'ml' ? 'വിവരങ്ങൾ ലഭ്യമാക്കുന്നു…' : 'Loading information…'}</p>}
    {more && <button type="button" disabled={loading} onClick={() => load(cursor)} className="rounded-lg border border-yellow-500/30 px-4 py-2 text-sm text-yellow-200">{language === 'ml' ? 'ബാക്കിയുള്ള വിവരങ്ങൾ കാണുക' : 'Load more information'}</button>}
    {editor && createPortal(<ContentEditor label="card information" row={editor} originalText="" onClose={() => setEditor(null)} onSave={async value => {
      const { data, error: failure } = await cardContentRequest(signal => supabase.rpc('save_owner_content', { p_scope: scope, p_section: editor.section, p_feature: feature, p_content: value, p_revision: editor.revision || 0 }).abortSignal(signal));
      if (failure) throw failure;
      setRows(previous => mergeCardNotes(previous, [data]));
      setEditor(null);
    }} />, document.body)}
  </section>;
}
export function PublishedContent({ content, language }) {
  return <div className="my-4 space-y-4 rounded-xl border border-yellow-500/20 bg-slate-950/60 p-4 break-words">
    {content.title && <h3 dir="auto" className="text-lg font-semibold text-yellow-100 whitespace-pre-wrap">{content.title}</h3>}
    {content.arabic && <p lang="ar" dir="rtl" className="font-amiri text-2xl leading-loose whitespace-pre-wrap">{content.arabic}</p>}
    {(!language || language === 'ml') && content.malayalam && <p lang="ml" dir="ltr" className="font-malayalam leading-loose whitespace-pre-wrap">{content.malayalam}</p>}
    {(!language || language === 'en') && content.english && <p lang="en" dir="ltr" className="leading-relaxed whitespace-pre-wrap">{content.english}</p>}
    {language && !(language === 'ml' ? content.malayalam : content.english) && (content.malayalam || content.english) && <p role="status" className="text-sm text-white/50">{language === 'ml' ? 'മലയാള പരിഭാഷ ഇതുവരെ ചേർത്തിട്ടില്ല.' : 'English translation has not been added yet.'}</p>}
    {content.images?.map(image => <ContentImage key={image.path} image={image} />)}
  </div>;
}
function ContentImage({ image }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [visible, setVisible] = useState(false);
  const figure = useRef(null);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '400px' });
    if (figure.current) observer.observe(figure.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let alive = true;
    let refresh;
    setError(false); setUrl('');
    cardContentRequest(() => supabase.storage.from('owner-content-images').createSignedUrl(image.path, 900))
      .then(({ data, error: failure }) => {
        if (!alive) return;
        if (failure || !data?.signedUrl) { setError(true); return; }
        setUrl(data.signedUrl);
        refresh = setTimeout(() => { if (alive) setRetry(value => value + 1); }, 12 * 60 * 1000);
      }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; clearTimeout(refresh); };
  }, [image.path, retry, visible]);
  return <figure ref={figure} className="min-h-12">{error ? <div role="status" className="text-sm text-amber-100">Photo could not load. <button type="button" onClick={() => setRetry(value => value + 1)} className="underline">Retry photo</button></div> : url ? <img loading="lazy" decoding="async" src={url} onError={() => setError(true)} alt={image.caption || 'Owner supplied illustration'} className="max-w-full max-h-[75vh] rounded-lg object-contain mx-auto" /> : <p className="text-xs text-white/50">Loading photo…</p>}{image.caption && <figcaption dir="auto" className="mt-2 text-sm text-white/70 whitespace-pre-wrap">{image.caption}</figcaption>}</figure>;
}
function ContentEditor({ label, row, originalText, onClose, onSave }) {
  const [form, setForm] = useState({ ...empty, ...row?.content });
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const change = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  const upload = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || busyRef.current) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 10 * 1024 * 1024) { setError('Choose a JPG, PNG, WebP or GIF under 10 MB.'); return; }
    if (form.images.length >= 20) { setError('At most 20 photos per section.'); return; }
    busyRef.current = true; setBusy(true); setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in again.');
      const path = `${user.id}/${crypto.randomUUID()}.${file.type.split('/')[1]}`;
      const { error: failure } = await supabase.storage.from('owner-content-images').upload(path, file);
      if (failure) throw failure;
      setForm(previous => ({ ...previous, images: [...previous.images, { path, caption: '' }] }));
    } catch (failure) { setError(failure.message); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const save = async event => {
    event.preventDefault();
    if (busyRef.current) return;
    if (![form.title, form.arabic, form.malayalam, form.english].some(value => value.trim()) && !form.images.length) { setError("Add text or a photo before saving."); return; }
    if (new TextEncoder().encode(JSON.stringify(form)).length > 2000000) { setError("This information exceeds 2 MB. Split it into two entries on this card."); return; }
    busyRef.current = true; setBusy(true); setError('');
    try { await onSave(form); }
    catch (failure) { setError(failure.message || 'Could not save. Your draft is still here.'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  return <div className="fixed inset-0 z-[2000] overflow-y-auto bg-black/80 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label={`Edit ${label}`}><BackLayer onBack={onClose} />
    <form onSubmit={save} className="mx-auto max-w-3xl rounded-2xl border border-yellow-500/30 bg-[#081026] p-4 sm:p-6 text-white space-y-4">
      <h2 className="text-lg text-yellow-200">Edit {label}</h2>
      <p className="text-sm text-white/65">Save to this section. Arabic, Malayalam and English are supported. Calculation rules and values stay unchanged.</p>
      {originalText && <details><summary className="cursor-pointer text-sm text-yellow-100">Current original text</summary><p dir="auto" className="whitespace-pre-wrap text-sm mt-2">{originalText}</p></details>}
      <label className="block">Title<input disabled={busy} aria-label="Content title" className={fieldStyle} dir="auto" value={form.title} onChange={e => change('title', e.target.value)} /></label>
      {[['arabic','Arabic / العربية','rtl'],['malayalam','Malayalam / മലയാളം','ltr'],['english','English','ltr']].map(([key, title, dir]) => <label key={key} className="block">{title}<textarea disabled={busy} aria-label={title} dir={dir} lang={key === 'arabic' ? 'ar' : key === 'malayalam' ? 'ml' : 'en'} rows={7} className={fieldStyle} value={form[key]} onChange={e => change(key,e.target.value)} /></label>)}
      <label className="block">Add photos (up to 20, 10 MB each)<input aria-label="Add content photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={upload} className="block mt-2" /></label>
      {form.images.map((image,index) => <div key={image.path} className="rounded-lg border border-white/15 p-3 space-y-2"><ContentImage image={image} /><label>Photo caption<input disabled={busy} aria-label={`Photo ${index+1} caption`} className={fieldStyle} dir="auto" value={image.caption} onChange={e => change('images',form.images.map((item,i) => i === index ? { ...item,caption:e.target.value } : item))} /></label><button type="button" disabled={busy} onClick={() => change('images',form.images.filter((_,i) => i !== index))}>Remove photo from section</button></div>)}
      {error && <p role="alert" className="text-red-300">{error}</p>}
      <div className="sticky bottom-0 flex justify-end gap-3 bg-[#081026] py-3"><button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-white/20 px-4 py-2">Cancel</button><button type="submit" disabled={busy} className="btn-gold rounded-lg px-5 py-2">{busy ? 'Saving…' : 'Save / OK'}</button></div>
    </form>
  </div>;
}

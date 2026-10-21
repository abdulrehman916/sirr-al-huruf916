/** Owner-only bounded search and review of the independent PDF index. */
import { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import MplReviewDrawer from './MplReviewDrawer';

export default function MplPages() {
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [onlyReview, setOnlyReview] = useState(false);
  const [onlyDup, setOnlyDup] = useState(false);
  const [cursors, setCursors] = useState([null]);
  const [data, setData] = useState({ pages: [], books: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const after = cursors[cursors.length - 1];
  useEffect(() => {
    let current = true;
    setLoading(true); setError('');
    platform.functions.invoke('getOwnerLibraryPages', { query, only_review: onlyReview, only_duplicates: onlyDup, after })
      .then(({ data: result }) => { if (current) setData(result); })
      .catch(e => { if (current) setError(e.message); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [query, onlyReview, onlyDup, after, refresh]);
  const openReview = async page => {
    setReviewing(true); setError('');
    try {
      const [fresh, siblings, books] = await Promise.all([
        platform.entities.MasterPdfPage.get(page.id),
        page.content_hash ? platform.entities.MasterPdfPage.filter({ content_hash: page.content_hash }, 'created_date', 100) : Promise.resolve([]),
        platform.entities.MasterPdfBook.filter({ master_book_id: page.master_book_id }, 'created_date', 1),
      ]);
      setSelected({ page: fresh, siblings, book: books[0] || {} });
    } catch (e) { setError(e.message); } finally { setReviewing(false); }
  };
  const changed = async () => {
    const page = await platform.entities.MasterPdfPage.get(selected.page.id);
    const books = await platform.entities.MasterPdfBook.filter({ master_book_id: page.master_book_id }, 'created_date', 1);
    setSelected(previous => previous ? ({ ...previous, page, book: books[0] || {} }) : null);
    setRefresh(value => value + 1);
  };
  return <div className="space-y-4 text-white">
    <form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); setQuery(draft.trim()); setCursors([null]); setRefresh(value => value + 1); }}>
      <input aria-label="Search indexed page text" value={draft} maxLength={200} onChange={e => setDraft(e.target.value)} placeholder="Search all indexed pages…" className="flex-1 min-w-48 rounded-lg bg-white/5 border border-amber-200/30 p-3" />
      <button type="submit" disabled={loading} className="rounded-lg border border-amber-200/30 p-3 disabled:opacity-40">Search</button>
      <label className="flex items-center gap-2"><input type="checkbox" checked={onlyReview} onChange={e => { setOnlyReview(e.target.checked); setCursors([null]); }} />Needs review</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={onlyDup} onChange={e => { setOnlyDup(e.target.checked); setCursors([null]); }} />Duplicates</label>
    </form>
    {error && <p role="alert" className="text-red-200">{error}<button type="button" onClick={() => setRefresh(value => value + 1)} className="ml-4 underline">Retry</button></p>}
    {loading ? <p role="status">Loading indexed pages…</p> : !error && <>
      <p>Page {cursors.length} · {data.pages.length} records shown · Search and filters cover the full independent index.</p>
      {data.pages.map(page => <article key={page.id} className="rounded-xl border border-amber-200/20 p-4 space-y-2">
        <p className="text-amber-200">{data.books.find(book => book.master_book_id === page.master_book_id)?.book_title || page.master_book_id} · p.{page.page_number}</p>
        <p className="text-sm text-white/60">{page.review_status || 'Unreviewed'} · OCR {page.ocr_confidence == null ? 'not recorded' : page.ocr_confidence + '%'}{page.needs_owner_review ? ' · Needs review' : ''}</p>
        <p dir="auto" className="whitespace-pre-wrap line-clamp-4">{(page.arabic_text || page.ocr_text || '').slice(0, 600)}</p>
        <button type="button" disabled={reviewing} onClick={() => openReview(page)} className="underline disabled:opacity-40">Open owner review</button>
      </article>)}
      {!data.pages.length && <p>No matching pages.</p>}
      <div className="flex justify-between"><button type="button" disabled={cursors.length === 1} onClick={() => setCursors(values => values.slice(0, -1))} className="underline disabled:opacity-40">Previous</button><button type="button" disabled={!data.has_more} onClick={() => setCursors(values => [...values, data.next_cursor])} className="underline disabled:opacity-40">Next</button></div>
    </>}
    {selected && <MplReviewDrawer page={selected.page} book={selected.book} allPages={selected.siblings} allBooks={[...data.books.filter(book => book.master_book_id !== selected.book.master_book_id), selected.book]} onClose={() => setSelected(null)} onChanged={changed} />}
  </div>;
}

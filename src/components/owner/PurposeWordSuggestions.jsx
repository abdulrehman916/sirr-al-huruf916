import { useEffect, useState } from 'react';
import { searchPurposeWords } from '@/lib/purposeDictionaryLookup';

export default function PurposeWordSuggestions({ value, onSelect }) {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    setMatches([]); setError('');
    const query = value.trim();
    if (query.length < 2) return;
    const timer = setTimeout(() => {
      searchPurposeWords(query).then(rows => { if (alive) setMatches(rows); })
        .catch(() => { if (alive) setError('Dictionary suggestions unavailable. You can still type the Arabic phrase.'); });
    }, 250);
    return () => { alive = false; clearTimeout(timer); };
  }, [value]);
  return <div aria-label="Dictionary word suggestions" className="space-y-2">
    {error && <p className="text-xs text-amber-100">{error}</p>}
    {matches.length > 0 && <><p className="text-xs text-yellow-100/70">Choose the Arabic word to use in your phrase / വാക്ക് തിരഞ്ഞെടുക്കുക</p>
      {matches.map(row => <button key={row.id} type="button" onClick={() => onSelect(row.arabic_keyword)} className="block w-full text-left rounded-lg border border-yellow-500/20 bg-slate-950 p-3">
        <span dir="rtl" lang="ar" className="block font-amiri text-xl text-yellow-100">{row.arabic_keyword}</span>
        <span className="block text-sm text-white/80">{row.malayalam_meaning}</span>
        <span className="block text-xs text-white/60">{row.english_meaning}</span>
      </button>)}</>}
  </div>;
}

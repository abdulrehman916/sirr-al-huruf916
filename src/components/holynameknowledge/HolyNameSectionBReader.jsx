import { useState } from 'react';
import research from '@/data/holyNamesSectionBResearch.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

function Arabic({ text }) {
  return text ? <p dir="rtl" lang="ar" className="font-amiri text-2xl text-yellow-100 leading-loose whitespace-pre-wrap">{text}</p> : null;
}

function SourceEntry({ entry, language, book, page, topic = false }) {
  const ml = language === 'ml';
  const t = value => value?.[language] || '';
  return <article id={`section-b-${entry.id}`} className="rounded-xl border border-yellow-500/20 p-4 space-y-3">
    <h4 className="text-yellow-200 font-semibold">{t(entry.title)}</h4>
    <Arabic text={entry.arabic_original} />
    {t(entry.translation) && <p className="text-white/90 leading-loose whitespace-pre-wrap">{t(entry.translation)}</p>}
    {topic && <div className="space-y-3 border-t border-white/10 pt-3">
      {Array.isArray(t(entry.steps)) && <ol className="list-decimal pl-6 space-y-2 text-white/85">{t(entry.steps).map((step, i) => <li key={i}>{step}</li>)}</ol>}
      <p className="text-white/75"><span className="text-yellow-200">{ml ? 'എണ്ണം: ' : 'Count: '}</span>{entry.count ?? (ml ? 'ഈ സ്രോതസ്സിൽ നിർദേശിച്ചിട്ടില്ല.' : 'Not specified in this source.')}</p>
      {t(entry.timing) && <p className="text-white/75"><span className="text-yellow-200">{ml ? 'ദിവസം / സമയം: ' : 'Day / time: '}</span>{t(entry.timing)}</p>}
      {t(entry.conditions) && <p className="text-white/75"><span className="text-yellow-200">{ml ? 'നിബന്ധനകൾ / ഒരുക്കം: ' : 'Conditions / preparation: '}</span>{t(entry.conditions)}</p>}
    </div>}
    <p className="text-xs text-white/60 break-words">{entry.source_reference || book}{page && <> · {ml ? 'പേജ്' : 'page'} {page}</>}</p>
    {entry.source_url?.startsWith('https://') && <details className="text-xs text-white/60"><summary className="cursor-pointer">{ml ? 'സ്രോതസ്സിന്റെ ലിങ്ക്' : 'Source link'}</summary><a className="block underline break-all mt-2" href={entry.source_url} target="_blank" rel="noopener noreferrer">{entry.source_url}</a></details>}
  </article>;
}

export default function HolyNameSectionBReader({ chapter, nameId }) {
  const { language } = useHolyNamesLanguage();
  const [query, setQuery] = useState('');
  const ml = language === 'ml';
  const t = value => value?.[language] || '';
  const profile = research[nameId]?.name_id === nameId ? research[nameId] : null;
  const checkedChapter = chapter?.name_id === nameId && chapter.review_status === 'checked_against_scan' ? chapter : null;
  if (!profile && !checkedChapter) return null;
  const groups = [
    { key: 'evidence', title: ml ? 'ഖുർആൻ പാഠവും അർഥവും' : 'Quran text and meaning', items: profile?.evidence || [] },
    { key: 'scholarly', title: ml ? 'പണ്ഡിതരുടെ വിശദീകരണങ്ങളും അഭിപ്രായഭേദങ്ങളും' : 'Scholarly explanations and differing views', items: profile?.scholarly || [] },
    { key: 'topics', title: ml ? 'ആവശ്യങ്ങളും ബന്ധപ്പെട്ട ദുആകളും' : 'Purposes and related supplications', items: profile?.topics || [] },
    { key: 'book', title: ml ? 'തിലിംസാനിയുടെ ഗ്രന്ഥവിവരണം — മൂലപാഠവും പരിഭാഷയും' : 'Tilimsani’s book account — original text and translation', items: checkedChapter?.practices || [] },
  ];
  const term = query.trim().toLocaleLowerCase();
  const matches = entry => !term || [t(entry.title), t(entry.translation), entry.arabic_original, entry.source_reference, checkedChapter?.source_title, t(entry.timing), t(entry.conditions), ...(Array.isArray(t(entry.steps)) ? t(entry.steps) : [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(term);
  const visible = groups.map(group => ({ ...group, items: group.items.filter(matches) }));
  return <section className={`space-y-5 ${ml ? 'font-malayalam' : 'font-inter'}`} data-testid="section-b-reader">
    <h2 className="text-lg text-yellow-200 font-semibold">{ml ? 'നാമത്തെക്കുറിച്ചുള്ള വിശദമായ വായന' : 'Detailed reading about this name'}</h2>
    {profile && <div className="space-y-3"><p className="text-white/90 leading-loose">{t(profile.explanation)}</p><p className="text-sm text-white/60 leading-relaxed">{t(profile.coverage)}</p></div>}
    <label className="block space-y-2"><span className="text-sm text-white/70">{ml ? 'ഈ കാർഡിലെ വിഷയങ്ങൾ തിരയുക' : 'Search topics in this card'}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} className="w-full rounded-xl border border-yellow-500/30 bg-transparent px-4 py-3 text-white focus:border-yellow-300" /></label>
    {visible.every(group => !group.items.length) && <p role="status" className="text-white/65">{ml ? 'ഈ തിരച്ചിലിന് യോജിച്ച വിവരമില്ല.' : 'No matching material for this search.'}</p>}
    {visible.map(group => group.items.length > 0 && <section key={group.key} className="space-y-3" data-section-b-group={group.key}>
      <h3 className="text-lg text-yellow-200">{group.title}</h3>
      {group.key === 'book' && <div className="rounded-xl border border-yellow-500/20 p-4 space-y-3"><Arabic text={checkedChapter.source_name_form} />{['name_note', 'scope_note', 'edition_note'].map(key => t(checkedChapter[key]) && <p key={key} className="text-white/75 leading-loose">{t(checkedChapter[key])}</p>)}<p className="text-xs text-white/60">{checkedChapter.source_title} · {checkedChapter.printed_page}</p></div>}
      {group.items.map(entry => <SourceEntry key={entry.id} entry={entry} language={language} book={group.key === 'book' ? checkedChapter.source_title : null} page={group.key === 'book' ? checkedChapter.printed_page : null} topic={group.key === 'topics'} />)}
    </section>)}
  </section>;
}

import { useState } from 'react';
import research from '@/data/holyNamesSectionBResearch.json';
import shamsBrief from '@/data/holyNamesShamsBrief.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';
import HolyOneSourceVisuals from './HolyOneSourceVisuals';
import { sectionBReading } from '@/lib/holyNames/sectionBReading';
import { sectionBExplanation } from '@/lib/holyNames/sectionBMeanings';

function Arabic({ text }) {
  return text ? <p dir="rtl" lang="ar" className="font-amiri text-2xl text-yellow-100 leading-loose whitespace-pre-wrap">{text}</p> : null;
}

function SourceEntry({ entry, language, book = null, page = null, topic = false, card = null }) {
  const ml = language === 'ml';
  const t = value => value?.[language] || '';
  return <article id={`section-b-${entry.id}`} className="rounded-xl border border-yellow-500/20 p-4 space-y-3">
    <h4 className="text-yellow-200 font-semibold">{t(entry.title)}</h4>
    <Arabic text={entry.arabic_original} />
    {entry.verse_meaning && <div className="space-y-2"><p className="text-xs text-yellow-200">{ml ? 'ആയത്തിന്റെ പൂർണ അർഥം' : 'Meaning of the complete verse'}</p><p className="text-white/90 leading-loose whitespace-pre-wrap">{t(entry.verse_meaning)}</p><p className="text-xs text-white/50">{t(entry.translation_note)}</p></div>}
    {entry.multiple_verses?.map(verse => <div key={verse.ref} className="space-y-2"><p className="text-yellow-200 text-sm">{verse.ref}</p><Arabic text={verse.arabic} /><p className="text-white/90 leading-loose">{t(verse)}</p></div>)}
    {entry.multiple_verses?.length > 0 && <p className="text-xs text-white/50">{t(entry.translation_note)}</p>}
    {entry.source_passage && <div className="space-y-3"><p className="text-xs text-yellow-200">{ml ? 'ഈ ഭാഗത്തിന്റെ മൂല അറബി പാഠം' : 'Original Arabic of this source passage'}</p><Arabic text={entry.source_passage} />{t(entry.passage_translation) && <p className="text-white/90 leading-loose whitespace-pre-wrap">{t(entry.passage_translation)}</p>}<p className="text-xs text-white/50 leading-relaxed">{t(entry.source_scope)}</p></div>}
    {t(entry.translation) && <p className="text-white/90 leading-loose whitespace-pre-wrap">{t(entry.translation)}</p>}
    {topic && <div className="space-y-3 border-t border-white/10 pt-3">
      {Array.isArray(t(entry.steps)) && <ol className="list-decimal pl-6 space-y-2 text-white/85">{t(entry.steps).map((step, i) => <li key={i}>{step}</li>)}</ol>}
      <p className="text-white/75"><span className="text-yellow-200">{ml ? 'എണ്ണം: ' : 'Count: '}</span>{(typeof entry.count === 'object' && entry.count ? t(entry.count) : entry.count) ?? (entry.references ? (ml ? 'മുകളിലെ സ്രോതസ്സ് വിവരണം വായിക്കുക; എണ്ണം പ്രത്യേകം രേഖപ്പെടുത്തിയിട്ടില്ല.' : 'Read the source account above; no separate count field is recorded.') : (ml ? 'ഈ സ്രോതസ്സിൽ നിർദേശിച്ചിട്ടില്ല.' : 'Not specified in this source.'))}</p>
      {t(entry.timing) && <p className="text-white/75"><span className="text-yellow-200">{ml ? 'ദിവസം / സമയം: ' : 'Day / time: '}</span>{t(entry.timing)}</p>}
      {t(entry.conditions) && <p className="text-white/75"><span className="text-yellow-200">{ml ? 'നിബന്ധനകൾ / ഒരുക്കം: ' : 'Conditions / preparation: '}</span>{t(entry.conditions)}</p>}
      {entry.construction && <p className="text-white/75 whitespace-pre-wrap">{entry.construction}</p>}
    </div>}
    {!entry.references && <p className="text-xs text-white/60 break-words">{entry.source_reference || book}{page && <> · {ml ? 'പേജ്' : 'page'} {page}</>}</p>}
    {entry.references?.map((reference, i) => <div key={i} className="text-xs text-white/60 break-words"><p>{reference.book}{reference.author && ` · ${reference.author}`}{reference.page && ` · ${ml ? 'പേജ്' : 'page'} ${reference.page}`}</p>{reference.url && <details><summary className="cursor-pointer mt-2">{ml ? 'സ്രോതസ്സിന്റെ ലിങ്ക്' : 'Source link'}</summary><a className="block underline break-all mt-2" href={reference.url} target="_blank" rel="noopener noreferrer">{reference.url}</a></details>}</div>)}
    {entry.source_notice && <details className="text-xs text-white/50"><summary className="cursor-pointer">{ml ? 'പാഠത്തിന്റെ പകർപ്പവകാശ കുറിപ്പ്' : 'Text attribution and license'}</summary><pre className="whitespace-pre-wrap mt-2">{entry.source_notice}</pre></details>}
    {entry.supplications?.map(supplication => <SourceEntry key={supplication.id} entry={supplication} language={language} />)}
    {entry.related_visual_id && card && <HolyOneSourceVisuals cardId={card.pdf_name_id} visuals={(card.attached_visuals || []).filter(visual => visual.id === entry.related_visual_id)} />}
    {entry.source_url?.startsWith('https://') && <details className="text-xs text-white/60"><summary className="cursor-pointer">{ml ? 'സ്രോതസ്സിന്റെ ലിങ്ക്' : 'Source link'}</summary><a className="block underline break-all mt-2" href={entry.source_url} target="_blank" rel="noopener noreferrer">{entry.source_url}</a></details>}
  </article>;
}

export default function HolyNameSectionBReader({ chapter, nameId, card = null }) {
  const { language } = useHolyNamesLanguage();
  const [query, setQuery] = useState('');
  const [purpose, setPurpose] = useState('all');
  const ml = language === 'ml';
  const t = value => value?.[language] || '';
  const profile = research[nameId]?.name_id === nameId ? research[nameId] : null;
  const checkedChapter = chapter?.name_id === nameId && chapter.review_status === 'checked_against_scan' ? chapter : null;
  const runtime = sectionBReading(card, nameId);
  if (!profile && !checkedChapter && (!card || card.pdf_name_id !== nameId)) return null;
  const groups = [
    { key: 'evidence', title: ml ? 'ഖുർആൻ പാഠവും അർഥവും' : 'Quran text and meaning', items: [...(profile?.evidence || []), ...runtime.evidence] },
    { key: 'scholarly', title: ml ? 'പണ്ഡിതരുടെ വിശദീകരണങ്ങളും അഭിപ്രായഭേദങ്ങളും' : 'Scholarly explanations and differing views', items: [...(profile?.scholarly || []), ...runtime.scholarly] },
    { key: 'topics', title: ml ? 'ആവശ്യങ്ങളും ബന്ധപ്പെട്ട ദുആകളും' : 'Purposes and related supplications', items: [...(profile?.topics || []), ...runtime.topics] },
    { key: 'book', title: ml ? 'തിലിംസാനിയുടെ ഗ്രന്ഥവിവരണം — മൂലപാഠവും പരിഭാഷയും' : 'Tilimsani’s book account — original text and translation', items: checkedChapter?.practices || [] },
  ];
  const term = query.trim().toLocaleLowerCase();
  const matches = entry => !term || [t(entry.title), t(entry.translation), entry.arabic_original, entry.source_passage, t(entry.passage_translation), t(shamsBrief.purpose_labels[entry.purpose]), entry.source_reference, ...(entry.references || []).map(ref => `${ref.book} ${ref.author} ${ref.page}`), ...(entry.supplications || []).map(dua => `${t(dua.translation)} ${dua.arabic_original}`), checkedChapter?.source_title, t(entry.timing), t(entry.conditions), ...(Array.isArray(t(entry.steps)) ? t(entry.steps) : [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(term);
  const visible = groups.map(group => ({ ...group, items: group.items.filter(entry => matches(entry) && (group.key !== 'topics' || purpose === 'all' || (entry.purpose || 'other') === purpose)) }));
  const availablePurposes = new Set(groups.find(group => group.key === 'topics').items.map(entry => entry.purpose || 'other'));
  return <section className={`space-y-5 ${ml ? 'font-malayalam' : 'font-inter'}`} data-testid="section-b-reader">
    <h2 className="text-lg text-yellow-200 font-semibold">{ml ? 'നാമത്തെക്കുറിച്ചുള്ള വിശദമായ വായന' : 'Detailed reading about this name'}</h2>
    <div className="space-y-3"><p className="text-white/90 leading-loose">{profile ? t(profile.explanation) : sectionBExplanation(card, language)}</p>{profile && <p className="text-sm text-white/60 leading-relaxed">{t(profile.coverage)}</p>}</div>
    {card && <p className="text-sm text-white/60 leading-loose">{ml ? 'താഴെ സ്രോതസ്സുമായി പരിശോധിച്ചതായി രേഖപ്പെടുത്തിയ വിവരങ്ങൾ വായിക്കാം. ഗ്രന്ഥത്തിലെ പ്രയോഗങ്ങൾ അതത് ഗ്രന്ഥത്തിന്റെ വിവരണങ്ങളാണ്; ഖുർആൻ / ഹദീസ് നിർദേശങ്ങളുമായി കലർത്തിയിട്ടില്ല. എല്ലാ ഗ്രന്ഥങ്ങളുടെയും ഗവേഷണം പൂർത്തിയായിട്ടില്ല.' : 'The material below is recorded as checked against its source. Traditional practices are attributed to their books and kept distinct from Quran or hadith instructions. Research across all books remains incomplete.'}{runtime.pending > 0 && ` ${ml ? 'സ്രോതസ്സ് വീണ്ടും പരിശോധിക്കേണ്ട പഴയ പരാമർശങ്ങൾ' : 'Earlier entries awaiting source recheck'}: ${runtime.pending}.`}</p>}
    <label className="block space-y-2"><span className="text-sm text-white/70">{ml ? 'ഈ കാർഡിലെ വിഷയങ്ങൾ തിരയുക' : 'Search topics in this card'}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} className="w-full rounded-xl border border-yellow-500/30 bg-transparent px-4 py-3 text-white focus:border-yellow-300" /></label>
    {availablePurposes.size > 0 && <label className="block space-y-2"><span className="text-sm text-white/70">{ml ? 'ആവശ്യാനുസരിച്ചുള്ള ഗ്രന്ഥപരാമർശങ്ങൾ' : 'Source accounts by purpose'}</span><select value={purpose} onChange={event => setPurpose(event.target.value)} className="w-full rounded-xl border border-yellow-500/30 bg-black px-4 py-3 text-white"><option value="all">{ml ? 'എല്ലാ വിഷയങ്ങളും' : 'All purposes'}</option>{Object.entries(shamsBrief.purpose_labels).filter(([key]) => availablePurposes.has(key)).map(([key, label]) => <option key={key} value={key}>{t(label)}</option>)}</select></label>}
    {visible.every(group => !group.items.length) && <p role="status" className="text-white/65">{ml ? 'ഈ തിരച്ചിലിന് യോജിച്ച വിവരമില്ല.' : 'No matching material for this search.'}</p>}
    {visible.map(group => group.items.length > 0 && <section key={group.key} className="space-y-3" data-section-b-group={group.key}>
      <h3 className="text-lg text-yellow-200">{group.title}</h3>
      {group.key === 'book' && <div className="rounded-xl border border-yellow-500/20 p-4 space-y-3"><Arabic text={checkedChapter.source_name_form} />{['name_note', 'scope_note', 'edition_note'].map(key => t(checkedChapter[key]) && <p key={key} className="text-white/75 leading-loose">{t(checkedChapter[key])}</p>)}<p className="text-xs text-white/60">{checkedChapter.source_title} · {checkedChapter.printed_page}</p></div>}
      {group.key === 'topics' ? Object.entries(shamsBrief.purpose_labels).map(([key, label]) => {
        const items = group.items.filter(entry => (entry.purpose || 'other') === key);
        return items.length > 0 && <section key={key} className="space-y-3" data-section-b-purpose={key}><h4 className="text-yellow-200 font-semibold">{t(label)}</h4>{items.map(entry => <SourceEntry key={entry.id} entry={entry} language={language} card={card} topic />)}</section>;
      }) : group.items.map(entry => <SourceEntry key={entry.id} entry={entry} language={language} card={card} book={group.key === 'book' ? checkedChapter.source_title : null} page={group.key === 'book' ? checkedChapter.printed_page : null} />)}
    </section>)}
  </section>;
}

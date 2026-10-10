import { useState } from 'react';
import research from '@/data/holyNamesSectionBResearch.json';
import nextResearch from '@/data/holyNamesSectionBNextResearch.json';
import expandedResearch from '@/data/holyNamesSectionBExpandedResearch.json';
import furtherResearch from '@/data/holyNamesSectionBFurtherResearch.json';
import remainingResearch from '@/data/holyNamesSectionBRemainingResearch.json';
import tafsirDepth from '@/data/holyNamesSectionBTafsirDepth.json';
import tafsirDepthII from '@/data/holyNamesSectionBTafsirDepthII.json';
import tafsirDepthIII from '@/data/holyNamesSectionBTafsirDepthIII.json';
import tafsirDepthIV from '@/data/holyNamesSectionBTafsirDepthIV.json';
import tafsirDepthV from '@/data/holyNamesSectionBTafsirDepthV.json';
import tafsirDepthVI from '@/data/holyNamesSectionBTafsirDepthVI.json';
import tafsirDepthVII from '@/data/holyNamesSectionBTafsirDepthVII.json';
import tafsirDepthVIII from '@/data/holyNamesSectionBTafsirDepthVIII.json';
import tafsirDepthIX from '@/data/holyNamesSectionBTafsirDepthIX.json';
import tafsirDepthX from '@/data/holyNamesSectionBTafsirDepthX.json';
import topicalDuas from '@/data/holyNamesSectionBTopicalDuas.json';
import topicalDuasII from '@/data/holyNamesSectionBTopicalDuasII.json';
import topicalDuasIII from '@/data/holyNamesSectionBTopicalDuasIII.json';
import propheticDhikr from '@/data/holyNamesSectionBPropheticDhikr.json';
import shamsBrief from '@/data/holyNamesShamsBrief.json';
import shamsCardBridge from '@/data/holyNamesShamsCardBridge.json';
import shamsEditionVariants from '@/data/holyNamesShamsEditionVariants.json';
import shamsCountAudit from '@/data/holyNamesShamsCountAudit.json';
import encyclopediaDepth from '@/data/holyNamesSectionBEncyclopediaI.json';
import encyclopediaDepthII from '@/data/holyNamesSectionBEncyclopediaII.json';
import encyclopediaDepthIII from '@/data/holyNamesSectionBEncyclopediaIII.json';
import encyclopediaDepthIV from '@/data/holyNamesSectionBEncyclopediaIV.json';
import encyclopediaDepthV from '@/data/holyNamesSectionBEncyclopediaV.json';
import encyclopediaDepthVI from '@/data/holyNamesSectionBEncyclopediaVI.json';
import encyclopediaDepthVII from '@/data/holyNamesSectionBEncyclopediaVII.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';
import HolyOneSourceVisuals from './HolyOneSourceVisuals';
import { sectionBReading } from '@/lib/holyNames/sectionBReading';
import { sectionBExplanation } from '@/lib/holyNames/sectionBMeanings';

// Reuse the same pure searchable-text projection for both rendered card search and regression tests.
export function sectionBEntrySearchText(entry, language, chapterTitle = null) {
  const t = value => value?.[language] || '';
  return [
    t(entry.title), t(entry.translation), t(entry.verse_meaning), t(entry.translation_note), entry.arabic_original,
    entry.source_url, t(entry.source_scope), entry.source_passage, t(entry.passage_translation),
    t(shamsBrief.purpose_labels[entry.purpose]), entry.source_reference,
    ...(entry.references || []).map(ref => `${ref.book} ${ref.author} ${ref.page}`),
    ...(entry.supplications || []).map(dua => `${t(dua.translation)} ${dua.arabic_original}`),
    chapterTitle, t(entry.timing), t(entry.conditions),
    t(entry.count), typeof entry.count === 'number' ? String(entry.count) : '',
    entry.count_evidence?.source_phrase, entry.count_evidence?.value,
    t(entry.count_evidence?.note),
    ...(entry.edition_variants?.variants || []).flatMap(variant => [variant.stored_phrase, variant.alternative_phrase, t(variant.note)]),
    ...(Array.isArray(t(entry.steps)) ? t(entry.steps) : []),
  ].filter(value => value !== null && value !== undefined && value !== '').join(' ').toLocaleLowerCase();
}

function Arabic({ text }) {
  return text ? <p dir="rtl" lang="ar" className="font-amiri text-2xl text-yellow-100 leading-loose whitespace-pre-wrap">{text}</p> : null;
}

function SourceEntry({ entry, language, book = null, page = null, topic = false, card = null }) {
  const ml = language === 'ml';
  const t = value => value?.[language] || '';
  return <article id={`section-b-${entry.id}`} className="rounded-xl border border-yellow-500/20 p-4 space-y-3">
    <h4 className="text-yellow-200 font-semibold">{t(entry.title)}</h4>
    <Arabic text={entry.arabic_original} />
    {entry.source_scope && !entry.source_passage && <p className="text-xs text-amber-100/75 leading-relaxed">{t(entry.source_scope)}</p>}
    {entry.verse_meaning && <div className="space-y-2"><p className="text-xs text-yellow-200">{ml ? 'ആയത്തിന്റെ പൂർണ അർഥം' : 'Meaning of the complete verse'}</p><p className="text-white/90 leading-loose whitespace-pre-wrap">{t(entry.verse_meaning)}</p><p className="text-xs text-white/50">{t(entry.translation_note)}</p></div>}
    {entry.multiple_verses?.map(verse => <div key={verse.ref} className="space-y-2"><p className="text-yellow-200 text-sm">{verse.ref}</p><Arabic text={verse.arabic} /><p className="text-white/90 leading-loose">{t(verse)}</p></div>)}
    {entry.multiple_verses?.length > 0 && <p className="text-xs text-white/50">{t(entry.translation_note)}</p>}
    {entry.source_passage && <div className="space-y-3"><p className="text-xs text-yellow-200">{ml ? 'ഈ ഭാഗത്തിന്റെ മൂല അറബി പാഠം' : 'Original Arabic of this source passage'}</p><Arabic text={entry.source_passage} />{t(entry.passage_translation) && <p className="text-white/90 leading-loose whitespace-pre-wrap">{t(entry.passage_translation)}</p>}<p className="text-xs text-white/50 leading-relaxed">{t(entry.source_scope)}</p></div>}
    {t(entry.translation) && <p className="text-white/90 leading-loose whitespace-pre-wrap">{t(entry.translation)}</p>}
    {entry.edition_variants && <details className="rounded-xl border border-amber-400/30 bg-amber-950/15 px-3 py-2">
      <summary className="cursor-pointer font-semibold text-amber-200 text-sm">{ml ? 'മറ്റു പതിപ്പുകളിലെ പാഠഭേദങ്ങൾ — ഒത്തുനോക്കേണ്ടത്' : 'Textual variants in another edition — requires collation'}</summary>
      <p className="mt-2 text-xs text-amber-100/85 leading-relaxed">{t(entry.edition_scope)}</p>
      <p className="mt-1 text-xs text-amber-100/75 leading-relaxed">{t(entry.edition_note)}</p>
      {entry.edition_variants.variants.map((variant, index) => <div key={index} className="mt-3 pt-3 border-t border-amber-500/20 space-y-2">
        <p className="text-xs text-white/70">{ml ? 'കാർഡിൽ സൂക്ഷിച്ച പാഠം' : 'Preserved original reading'}</p>
        <Arabic text={variant.stored_phrase} />
        <p className="text-xs text-white/70">{ml ? 'മറ്റു ഡിജിറ്റൽ പതിപ്പിലെ പാഠം' : 'Alternative digital-edition reading'}</p>
        <Arabic text={variant.alternative_phrase} />
        <p className="text-sm text-white/85 leading-relaxed">{t(variant.note)}</p>
      </div>)}
      <a className="block text-xs underline text-yellow-200 mt-3 break-all" href={entry.edition_variants.compared_source_url} target="_blank" rel="noopener noreferrer">{ml ? 'മറ്റു പതിപ്പിന്റെ ഉറവിടം' : 'Alternative edition source'}: {entry.edition_variants.compared_source_url}</a>
      {entry.edition_variants.other_page_url && <a className="block text-xs underline text-yellow-200 mt-2 break-all" href={entry.edition_variants.other_page_url} target="_blank" rel="noopener noreferrer">{ml ? 'തുടരുന്ന പേജ്' : 'Continued page'}: {entry.edition_variants.other_page_url}</a>}
    </details>}

    {entry.legacy_body && <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-3"><p className="text-xs text-amber-200 mb-1">{ml ? 'പഴയ കാർഡ് രേഖയിലെ പാഠം' : 'Legacy card text'}</p><p className="text-white/80 leading-relaxed whitespace-pre-wrap">{entry.legacy_body}</p></div>}
    {entry.review_status === 'pending_source_recheck' && <p className="text-xs text-amber-200/90">{ml ? 'സ്ഥിതി: ഉറവിടം വീണ്ടും പരിശോധിക്കണം — ഇത് സ്ഥിരീകരിച്ച തെളിവായി കണക്കാക്കരുത്.' : 'Status: source recheck required — do not treat this as verified evidence.'}{entry.legacy_confidence && ` ${ml ? 'പഴയ സ്ഥിതി: ' : 'Legacy status: '}${entry.legacy_confidence}`}</p>}
    {topic && <div className="space-y-3 border-t border-white/10 pt-3">
      {Array.isArray(t(entry.steps)) && <ol className="list-decimal pl-6 space-y-2 text-white/85">{t(entry.steps).map((step, i) => <li key={i}>{step}</li>)}</ol>}
      <p className="text-white/75"><span className="text-yellow-200">{ml ? 'എണ്ണം: ' : 'Count: '}</span>{(typeof entry.count === 'object' && entry.count ? t(entry.count) : entry.count) ?? (entry.references ? (ml ? 'മുകളിലെ സ്രോതസ്സ് വിവരണം വായിക്കുക; എണ്ണം പ്രത്യേകം രേഖപ്പെടുത്തിയിട്ടില്ല.' : 'Read the source account above; no separate count field is recorded.') : (ml ? 'ഈ സ്രോതസ്സിൽ നിർദേശിച്ചിട്ടില്ല.' : 'Not specified in this source.'))}</p>
      {entry.count_evidence && <div className="rounded-lg border border-yellow-500/20 p-3 space-y-2">
        <p className="text-xs font-semibold text-yellow-200">{ml ? 'ഗ്രന്ഥത്തിലെ സംഖ്യ തെളിയിക്കുന്ന അറബി വാചകം' : 'Original Arabic wording establishing the source count'}</p>
        <Arabic text={entry.count_evidence.source_phrase} />
        <p className="text-xs text-white/85 leading-relaxed">{t(entry.count_evidence.note)}</p>
        <p className="text-xs text-white/60">{ml ? 'എണ്ണത്തിന്റെ തരം' : 'Count unit'}: {entry.count_evidence.unit === 'recitation' ? (ml ? 'ഓതൽ' : 'Recitations') : (ml ? 'എഴുത്ത് / കൊത്തൽ' : 'Inscriptions')} · {entry.count_evidence.value}</p>
      </div>}
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
  const originalProfile = research[nameId]?.name_id === nameId ? research[nameId] : null;
  const expansionProfile = nextResearch.profiles?.[nameId]?.name_id === nameId ? nextResearch.profiles[nameId] : null;
  // Preserve the established profile as authoritative if a later overlay shares the ID.
  const additionalProfile = expandedResearch[nameId]?.name_id === nameId ? expandedResearch[nameId] : null;
  const furtherProfile = furtherResearch.profiles?.[nameId]?.name_id === nameId ? furtherResearch.profiles[nameId] : null;
  const remainingProfile = remainingResearch.profiles?.[nameId]?.name_id === nameId ? remainingResearch.profiles[nameId] : null;
  const profile = originalProfile || expansionProfile || additionalProfile || furtherProfile || remainingProfile;
  const deepProfile = tafsirDepth.profiles?.[nameId]?.name_id === nameId ? tafsirDepth.profiles[nameId] : null;
  const deepProfileII = tafsirDepthII.profiles?.[nameId]?.name_id === nameId ? tafsirDepthII.profiles[nameId] : null;
  const deepProfileIII = tafsirDepthIII.profiles?.[nameId]?.name_id === nameId ? tafsirDepthIII.profiles[nameId] : null;
  const deepProfileIV = tafsirDepthIV.profiles?.[nameId]?.name_id === nameId ? tafsirDepthIV.profiles[nameId] : null;
  const deepProfileV = tafsirDepthV.profiles?.[nameId]?.name_id === nameId ? tafsirDepthV.profiles[nameId] : null;
  const deepProfileVI = tafsirDepthVI.profiles?.[nameId]?.name_id === nameId ? tafsirDepthVI.profiles[nameId] : null;
  const deepProfileVII = tafsirDepthVII.profiles?.[nameId]?.name_id === nameId ? tafsirDepthVII.profiles[nameId] : null;
  const deepProfileVIII = tafsirDepthVIII.profiles?.[nameId]?.name_id === nameId ? tafsirDepthVIII.profiles[nameId] : null;
  const deepProfileIX = tafsirDepthIX.profiles?.[nameId]?.name_id === nameId ? tafsirDepthIX.profiles[nameId] : null;
  const deepProfileX = tafsirDepthX.profiles?.[nameId]?.name_id === nameId ? tafsirDepthX.profiles[nameId] : null;
  const encyclopediaProfile = encyclopediaDepth.profiles?.[nameId]?.name_id === nameId ? encyclopediaDepth.profiles[nameId] : null;
  const encyclopediaProfileII = encyclopediaDepthII.profiles?.[nameId]?.name_id === nameId ? encyclopediaDepthII.profiles[nameId] : null;
  const encyclopediaProfileIII = encyclopediaDepthIII.profiles?.[nameId]?.name_id === nameId ? encyclopediaDepthIII.profiles[nameId] : null;
  const encyclopediaProfileIV = encyclopediaDepthIV.profiles?.[nameId]?.name_id === nameId ? encyclopediaDepthIV.profiles[nameId] : null;
  const encyclopediaProfileV = encyclopediaDepthV.profiles?.[nameId]?.name_id === nameId ? encyclopediaDepthV.profiles[nameId] : null;
  const encyclopediaProfileVI = encyclopediaDepthVI.profiles?.[nameId]?.name_id === nameId ? encyclopediaDepthVI.profiles[nameId] : null;
  const encyclopediaProfileVII = encyclopediaDepthVII.profiles?.[nameId]?.name_id === nameId ? encyclopediaDepthVII.profiles[nameId] : null;
  const linkedQuranDuas = (topicalDuas.topics || []).filter(entry => entry.name_ids?.includes(nameId));
  const linkedQuranDuasII = (topicalDuasII.topics || []).filter(entry => entry.name_ids?.includes(nameId));
  const linkedQuranDuasIII = (topicalDuasIII.topics || []).filter(entry => entry.name_ids?.includes(nameId));
  const linkedPropheticDhikr = (propheticDhikr.entries || []).filter(entry => entry.name_ids?.includes(nameId));
  const checkedChapter = chapter?.name_id === nameId && chapter.review_status === 'checked_against_scan' ? chapter : null;
  const runtime = sectionBReading(card, nameId);
  // Brief historical khawass sentences are displayed independently of the legacy API:
  // previously scan-reviewed original Arabic must not disappear when an older card is pending recheck.
  const shownLegacyShams = new Set(runtime.topics.filter(entry => entry.source_passage).map(entry => entry.id));
  const linkedShamsAccounts = Object.entries(shamsCardBridge.identity_map)
    .concat((shamsCardBridge.secondary_matches?.[nameId] || []).map(accountId => [accountId, nameId]))
    .filter(([accountId, cardId]) => cardId === nameId && !shownLegacyShams.has(accountId))
    .map(([accountId]) => {
      const account = shamsBrief.accounts[accountId];
      if (!account || account.review_status !== 'checked_against_scan') return null;
      const name = accountId.split('-').slice(4).join('-');
      return {
        id: accountId,
        edition_variants: shamsEditionVariants.entries[accountId] || null,
        count_evidence: shamsCountAudit.entries[accountId] || null,
        edition_scope: shamsEditionVariants.scope,
        edition_note: shamsEditionVariants.edition_note,
        title: { ml: `ശംസ് അൽമആരിഫ് — «${name}» — അച്ചടി പേജ് ${account.source_page}`,
          en: `Shams al-Maarif — ${name} — printed page ${account.source_page}` },
        arabic_original: account.arabic_original,
        translation: account.translation || shamsCardBridge.translations[accountId],
        source_scope: {
          ml: `${shamsCardBridge.source_edition_note.ml} ${shamsCardBridge.review_note.ml} ${shamsCardBridge.identity_map[accountId] === nameId ? '' : shamsCardBridge.secondary_scope.ml}`,
          en: `${shamsCardBridge.source_edition_note.en} ${shamsCardBridge.review_note.en} ${shamsCardBridge.identity_map[accountId] === nameId ? '' : shamsCardBridge.secondary_scope.en}`,
        },
        review_status: account.review_status,
        claim_kind: 'attributed_historical_khawass',
        purpose: account.purpose || 'other',
        count: account.count,
        timing: account.timing,
        conditions: account.conditions,
        steps: account.steps,
        references: [
          { book: shamsCardBridge.source_reference, page: account.source_page, url: shamsCardBridge.source_edition_url },
          { book: 'Separate digitized edition (possible textual variants)', page: account.source_page,
            url: `https://ablibrary.net/book_content/b/10942/${account.source_page}` },
        ],
      };
    }).filter(Boolean);
  if (!profile && !checkedChapter && (!card || card.pdf_name_id !== nameId)) return null;
  const groups = [
    { key: 'evidence', title: ml ? 'ഖുർആൻ പാഠവും അർഥവും' : 'Quran text and meaning', items: [...(profile?.evidence || []), ...(deepProfile?.evidence || []), ...(deepProfileII?.evidence || []), ...(deepProfileIII?.evidence || []), ...(deepProfileIV?.evidence || []), ...(deepProfileV?.evidence || []), ...(deepProfileVI?.evidence || []), ...(deepProfileVII?.evidence || []), ...(deepProfileVIII?.evidence || []), ...(deepProfileIX?.evidence || []), ...(deepProfileX?.evidence || []), ...(encyclopediaProfile?.evidence || []), ...(encyclopediaProfileII?.evidence || []), ...(encyclopediaProfileIII?.evidence || []), ...(encyclopediaProfileIV?.evidence || []), ...(encyclopediaProfileV?.evidence || []), ...(encyclopediaProfileVI?.evidence || []), ...(encyclopediaProfileVII?.evidence || []), ...runtime.evidence] },
    { key: 'hadith', title: ml ? 'ഹദീസുകൾ — മൂലപാഠവും ഉറവിടവും' : 'Hadith — original wording and reference', items: [...(profile?.hadith || []), ...(encyclopediaProfileIV?.hadith || []), ...(encyclopediaProfileV?.hadith || [])] },
    { key: 'prophetic', title: ml ? 'നബിവചന ദിക്ർ / ദുആ — എണ്ണവും സമയവും ക്രമവും' : 'Prophetic dhikr and supplications — count, timing and procedure', items: linkedPropheticDhikr },
    { key: 'scholarly', title: ml ? 'പണ്ഡിതരുടെ വിശദീകരണങ്ങളും അഭിപ്രായഭേദങ്ങളും' : 'Scholarly explanations and differing views', items: [...(profile?.scholarly || []), ...(deepProfile?.scholarly || []), ...(deepProfileII?.scholarly || []), ...(deepProfileIII?.scholarly || []), ...(deepProfileIV?.scholarly || []), ...(deepProfileV?.scholarly || []), ...(deepProfileVI?.scholarly || []), ...(deepProfileVII?.scholarly || []), ...(deepProfileVIII?.scholarly || []), ...(deepProfileIX?.scholarly || []), ...(deepProfileX?.scholarly || []), ...(encyclopediaProfile?.scholarly || []), ...(encyclopediaProfileII?.scholarly || []), ...(encyclopediaProfileIII?.scholarly || []), ...(encyclopediaProfileIV?.scholarly || []), ...(encyclopediaProfileV?.scholarly || []), ...(encyclopediaProfileVI?.scholarly || []), ...(encyclopediaProfileVII?.scholarly || []), ...runtime.scholarly] },
    { key: 'topics', title: ml ? 'ആവശ്യങ്ങളും ബന്ധപ്പെട്ട ദുആകളും' : 'Purposes and related supplications', items: [...(profile?.topics || []), ...linkedQuranDuas, ...linkedQuranDuasII, ...linkedQuranDuasIII, ...runtime.topics] },
    { key: 'shams', title: ml ? 'ശംസ് അൽമആരിഫ് — ഖവാസ്സ്: മൂല അറബി, എണ്ണം, സമയം, ഗ്രന്ഥവിവരണം' : 'Shams al-Maarif — historical khawass: Arabic, counts, timings and book account', items: linkedShamsAccounts },
    { key: 'book', title: ml ? 'തിലിംസാനിയുടെ ഗ്രന്ഥവിവരണം — മൂലപാഠവും പരിഭാഷയും' : 'Tilimsani’s book account — original text and translation', items: checkedChapter?.practices || [] },
    { key: 'pending', title: ml ? 'വീണ്ടും പരിശോധിക്കേണ്ട പഴയ കാർഡ് രേഖകൾ' : 'Legacy card records awaiting source recheck', items: runtime.pendingEntries },
  ];
  const term = query.trim().toLocaleLowerCase();
  const matches = entry => !term || sectionBEntrySearchText(entry, language, checkedChapter?.source_title).includes(term);
  const visible = groups.map(group => ({ ...group, items: group.items.filter(entry => matches(entry) && (!['topics', 'prophetic', 'shams'].includes(group.key) || purpose === 'all' || (entry.purpose || 'other') === purpose)) }));
  const availablePurposes = new Set(groups.filter(group => ['topics', 'prophetic', 'shams'].includes(group.key)).flatMap(group => group.items.map(entry => entry.purpose || 'other')));
  // Count the complete displayed source inventory, including all ten tafsir layers and checked book passages.
  const groupCount = key => groups.find(group => group.key === key)?.items.length || 0;
  const totalSourceEntries = groups.filter(group => group.key !== 'pending').reduce((sum, group) => sum + group.items.length, 0);
  return <section className={`space-y-5 ${ml ? 'font-malayalam' : 'font-inter'}`} data-testid="section-b-reader">
    <h2 className="text-lg text-yellow-200 font-semibold">{ml ? 'നാമത്തെക്കുറിച്ചുള്ള വിശദമായ വായന' : 'Detailed reading about this name'}</h2>
    {encyclopediaProfile && <p className="text-sm text-yellow-100/75 leading-relaxed">{t(encyclopediaDepth.scope)}</p>}
    {encyclopediaProfileII && <p className="text-sm text-yellow-100/75 leading-relaxed">{t(encyclopediaDepthII.scope)}</p>}
    {encyclopediaProfileIII && <p className="text-sm text-yellow-100/75 leading-relaxed">{t(encyclopediaDepthIII.scope)}</p>}
    {encyclopediaProfileIV && <p className="text-sm text-yellow-100/75 leading-relaxed">{t(encyclopediaDepthIV.scope)}</p>}
    {encyclopediaProfileV && <p className="text-sm text-yellow-100/75 leading-relaxed">{t(encyclopediaDepthV.scope)}</p>}
    {encyclopediaProfileVI && <p className="text-sm text-yellow-100/75 leading-relaxed">{t(encyclopediaDepthVI.scope)}</p>}
    {encyclopediaProfileVII && <p className="text-sm text-yellow-100/75 leading-relaxed">{t(encyclopediaDepthVII.scope)}</p>}
    <div className="space-y-3"><p className="text-white/90 leading-loose">{profile ? t(profile.explanation) : sectionBExplanation(card, language)}</p>{profile && <p className="text-sm text-white/60 leading-relaxed">{t(profile.coverage)}</p>}</div>
    {card && <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-white/70" aria-label={ml ? 'കാർഡ് ഉറവിട സംഗ്രഹം' : 'Card source summary'}>
      <div className="rounded-lg border border-yellow-500/20 p-2"><span className="block text-yellow-200">{ml ? 'സ്രോതസ്സ് രേഖകൾ' : 'Source entries'}</span><span data-testid="section-b-source-count">{totalSourceEntries}</span></div>
      <div className="rounded-lg border border-amber-500/20 p-2"><span className="block text-amber-200">{ml ? 'വീണ്ടും പരിശോധിക്കണം' : 'Recheck'}</span>{runtime.pending}</div>
      <div className="rounded-lg border border-yellow-500/20 p-2"><span className="block text-yellow-200">{ml ? 'ഖുർആൻ' : 'Quran'}</span><span data-testid="section-b-quran-count">{groupCount("evidence")}</span></div>
      <div className="rounded-lg border border-yellow-500/20 p-2"><span className="block text-yellow-200">{ml ? 'വിഷയങ്ങൾ' : 'Topics'}</span><span data-testid="section-b-topic-count">{groupCount("topics") + groupCount("prophetic") + groupCount("shams")}</span></div>
    </div>}
    {card && <p className="text-sm text-white/60 leading-loose">{ml ? 'താഴെ സ്രോതസ്സുമായി പരിശോധിച്ചതായി രേഖപ്പെടുത്തിയ വിവരങ്ങൾ വായിക്കാം. ഗ്രന്ഥത്തിലെ പ്രയോഗങ്ങൾ അതത് ഗ്രന്ഥത്തിന്റെ വിവരണങ്ങളാണ്; ഖുർആൻ / ഹദീസ് നിർദേശങ്ങളുമായി കലർത്തിയിട്ടില്ല. എല്ലാ ഗ്രന്ഥങ്ങളുടെയും ഗവേഷണം പൂർത്തിയായിട്ടില്ല.' : 'The material below is recorded as checked against its source. Traditional practices are attributed to their books and kept distinct from Quran or hadith instructions. Research across all books remains incomplete.'}{runtime.pending > 0 && ` ${ml ? 'സ്രോതസ്സ് വീണ്ടും പരിശോധിക്കേണ്ട പഴയ പരാമർശങ്ങൾ' : 'Earlier entries awaiting source recheck'}: ${runtime.pending}.`}</p>}
    <label className="block space-y-2"><span className="text-sm text-white/70">{ml ? 'ഈ കാർഡിലെ വിഷയങ്ങൾ തിരയുക' : 'Search topics in this card'}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} className="w-full rounded-xl border border-yellow-500/30 bg-transparent px-4 py-3 text-white focus:border-yellow-300" /></label>
    {availablePurposes.size > 0 && <label className="block space-y-2"><span className="text-sm text-white/70">{ml ? 'ആവശ്യാനുസരിച്ചുള്ള ഗ്രന്ഥപരാമർശങ്ങൾ' : 'Source accounts by purpose'}</span><select value={purpose} onChange={event => setPurpose(event.target.value)} className="w-full rounded-xl border border-yellow-500/30 bg-black px-4 py-3 text-white"><option value="all">{ml ? 'എല്ലാ വിഷയങ്ങളും' : 'All purposes'}</option>{Object.entries(shamsBrief.purpose_labels).filter(([key]) => availablePurposes.has(key)).map(([key, label]) => <option key={key} value={key}>{t(label)}</option>)}</select></label>}
    {linkedShamsAccounts.length > 0 && <p className="text-xs text-amber-100/75 leading-relaxed">{t(shamsCardBridge.source_edition_note)} {t(shamsCardBridge.review_note)}</p>}
    {visible.every(group => !group.items.length) && <p role="status" className="text-white/65">{ml ? 'ഈ തിരച്ചിലിന് യോജിച്ച വിവരമില്ല.' : 'No matching material for this search.'}</p>}
    {visible.map(group => group.items.length > 0 && <section key={group.key} className="space-y-3" data-section-b-group={group.key} data-section-b-count={group.items.length}>
      <h3 className="text-lg text-yellow-200">{group.title}</h3>
      {group.key === 'book' && <div className="rounded-xl border border-yellow-500/20 p-4 space-y-3"><Arabic text={checkedChapter.source_name_form} />{['name_note', 'scope_note', 'edition_note'].map(key => t(checkedChapter[key]) && <p key={key} className="text-white/75 leading-loose">{t(checkedChapter[key])}</p>)}<p className="text-xs text-white/60">{checkedChapter.source_title} · {checkedChapter.printed_page}</p></div>}
      {group.key === 'pending' && <p className="text-sm text-white/60 leading-relaxed">{ml ? 'ഇവ പഴയ ഡാറ്റയിൽ ഉണ്ടായിരുന്ന രേഖകളാണ്. ഉറവിടത്തിലെ പേജ്/പാഠം വീണ്ടും പരിശോധിക്കുന്നതുവരെ ഇവയെ ഖുർആൻ/ഹദീസ് തെളിവായി കാണിക്കില്ല.' : 'These records were already present in the legacy data. Until their source page/text is rechecked, they are not presented as Quran or hadith evidence.'}</p>}
      {['topics', 'prophetic', 'shams'].includes(group.key) ? Object.entries(shamsBrief.purpose_labels).map(([key, label]) => {
        const items = group.items.filter(entry => (entry.purpose || 'other') === key);
        return items.length > 0 && <section key={key} className="space-y-3" data-section-b-purpose={key} data-source-kind={group.key}><h4 className="text-yellow-200 font-semibold">{t(label)}</h4>{items.map(entry => <SourceEntry key={entry.id} entry={entry} language={language} card={card} topic />)}</section>;
      }) : group.items.map(entry => <SourceEntry key={entry.id} entry={entry} language={language} card={card} book={group.key === 'book' ? checkedChapter.source_title : null} page={group.key === 'book' ? checkedChapter.printed_page : null} />)}
    </section>)}
  </section>;
}


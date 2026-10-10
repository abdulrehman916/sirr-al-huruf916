import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const chapters = JSON.parse(fs.readFileSync('src/data/holyNamesTilimsaniChapters.json', 'utf8'));
const research = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBResearch.json', 'utf8'));
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'section-b-reader-'));
try {
  const output = path.join(work, 'reader.cjs');
  await build({ stdin: { contents: `import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server';
    import Reader from './src/components/holynameknowledge/HolyNameSectionBReader.jsx';
    export {sectionBReading, unlinkedSectionBVisuals} from './src/lib/holyNames/sectionBReading.js';
    export {withSectionBMeaning} from './src/lib/holyNames/sectionBMeanings.js';
    export {sectionBEntrySearchText} from './src/components/holynameknowledge/HolyNameSectionBReader.jsx';
    import {HolyNamesLanguageContext as Context} from './src/components/holynameknowledge/HolyNamesLanguageContext.jsx';
    export const render=(chapter,nameId,language,card)=>renderToStaticMarkup(React.createElement(Context.Provider,{value:{language}},React.createElement(Reader,{chapter,nameId,card})));`, resolveDir: process.cwd(), loader: 'jsx' }, outfile: output, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', alias: { '@': path.resolve('src') } });
  const { render, sectionBReading, unlinkedSectionBVisuals, withSectionBMeaning, sectionBEntrySearchText } = createRequire(import.meta.url)(output);
  const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  for (const [id, chapter] of Object.entries(chapters)) {
    for (const language of ['ml', 'en']) {
      const html = render(chapter, id, language);
      assert.ok(html.includes('data-testid="section-b-reader"'));
      for (const entry of chapter.practices) {
        assert.ok(html.includes(escape(entry.arabic_original)), `${id}: missing original ${entry.id}`);
        assert.ok(html.includes(escape(entry.translation[language])), `${id}: missing translation ${entry.id}`);
      }
      assert.ok(html.includes(escape(chapter.scope_note[language])));
      assert.ok(html.includes(escape(chapter.edition_note[language])));
      assert.ok(!html.includes('birhatiah-reader-guide'));
      if (research[id]) {
        const profile = research[id];
        for (const group of ['evidence', 'hadith', 'scholarly', 'topics']) for (const entry of profile[group] || []) {
          assert.ok(html.includes(escape(entry.translation[language])), `${id}: missing ${group} ${entry.id} ${language}`);
          assert.ok(html.includes(entry.source_url), `${id}: missing source link ${entry.id}`);
          assert.equal(entry.review_status, 'checked_against_digital_text');
        }
        const researchGroups = ['evidence', 'hadith', 'scholarly', 'topics', 'book'];
        const displayedPositions = researchGroups.map(group => html.indexOf(`data-section-b-group="${group}"`)).filter(position => position >= 0);
        assert.deepEqual(displayedPositions, [...displayedPositions].sort((a, b) => a - b), `${id}: source groups are out of order`);
        if (id === 'PDF-HN-001') assert.equal(profile.topics[0].count, null);
        assert.ok(!html.includes(profile.coverage[language === 'ml' ? 'en' : 'ml']));
      }
    }
  }
  // Every externally researched profile must remain visible even where no scan chapter has been added.
  for (const [id, profile] of Object.entries(research)) {
    assert.equal(profile.name_id, id);
    for (const language of ['ml', 'en']) {
      const html = render(chapters[id] || null, id, language, { pdf_name_id: id });
      assert.ok(html.includes(escape(profile.explanation[language])), `${id}: missing research introduction ${language}`);
      for (const group of ['evidence', 'hadith', 'scholarly', 'topics']) {
        for (const entry of profile[group] || []) {
          assert.ok(html.includes(escape(entry.translation[language])), `${id}: missing ${group} ${entry.id} ${language}`);
          assert.ok(html.includes(entry.source_url), `${id}: missing verified URL ${entry.id}`);
        }
      }
      if (profile.hadith?.length) assert.ok(html.includes('data-section-b-group="hadith"'), `${id}: missing hadith section`);
    }
  }
  assert.equal(render(chapters['PDF-HN-001'], 'PDF-HN-999', 'ml'), '');
  const unsafe = structuredClone(chapters['PDF-HN-002']);
  unsafe.practices[0].arabic_original = '<script>alert(1)</script>';
  assert.ok(!render(unsafe, unsafe.name_id, 'ml').includes('<script>'));
  const page = fs.readFileSync('src/pages/HolyOneDetailPage.jsx', 'utf8');
  assert.ok(page.includes('<HolyNameSectionBReader') && !page.includes('<HolyNameSourceChapter'));
  assert.ok(page.includes('sequence !== loadSequence.current'));
  const base = { id: 'method', title_ml: 'പരാമർശം', title_en: 'Account', arabic_text: 'النص', malayalam_text: 'രീതി', english_text: 'Method', source_book: 'Book A', source_page: '12', review_status: 'checked_against_scan', related_visual_id: 'figure', repetitions: 7 };
  const card = { pdf_name_id: 'test', wafq: [base, { ...base, id: 'duplicate', source_book: 'Book B' }, { ...base, id: 'different-count', repetitions: 8 }], dua: [{ ...base, id: 'prayer', arabic_text: 'الدعاء', english_text: 'Prayer', malayalam_text: 'ദുആ', repetitions: null }], scholarly_entries: [{ id: 'legacy', verification_status: 'verified', confidence: 'HIGH' }], attached_visuals: [{ id: 'figure' }, { id: 'unlinked' }] };
  const reading = sectionBReading(card, 'test');
  assert.equal(reading.pending, 1);
  assert.equal(reading.topics.length, 2);
  assert.equal(reading.topics[0].references.length, 2);
  assert.equal(reading.topics[0].supplications.length, 1);
  assert.equal(reading.topics[1].count, 8);
  assert.deepEqual(unlinkedSectionBVisuals(card), [{ id: 'unlinked' }]);
  assert.equal(sectionBReading(card, 'wrong').topics.length, 0);
  assert.ok(!render(null, 'test', 'en', card).includes('Not specified in this source.'));
  assert.equal(withSectionBMeaning({ pdf_name_id: 'PDF-HN-0146', meaning_malayalam: 'Original' }).meaning_malayalam, 'Original');
  const privateCard = { pdf_name_id: 'test', dua: [{ ...base, source_url: 'https://private-bucket.supabase.co/storage/v1/object/sign/scan?token=secret' }] };
  assert.ok(!render(null, 'test', 'en', privateCard).includes('token=secret'));
  const meanings = JSON.parse(fs.readFileSync('src/data/holyNamesQuranMeanings.json', 'utf8'));
  assert.ok(Object.keys(meanings.verses).length >= 50);
  assert.ok(meanings.source_notice.includes('CHANGING IT IS NOT ALLOWED'));
  for (const [ref, verse] of Object.entries(meanings.verses)) {
    const qcard = { pdf_name_id: 'test', scholarly_entries: [{ ...base, id: ref, source_book: 'القرآن الكريم — Tanzil', source_page: ref, source_url: `https://tanzil.net/#${ref}`, arabic_text: verse.arabic }] };
    for (const language of ['en', 'ml']) assert.ok(render(null, 'test', language, qcard).includes(escape(verse[language])), `Missing complete meaning: ${ref}`);
    qcard.scholarly_entries[0].arabic_text = 'different excerpt';
    assert.equal(sectionBReading(qcard, 'test').evidence[0].verse_meaning, null);
  }
  // Regression guard: every sourced prophetic dhikr must retain its own Arabic,
  // count, timing, conditions, translations and public hadith citation.
  const prophetic = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBPropheticDhikr.json', 'utf8'));
  const topical = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTopicalDuas.json', 'utf8'));
  const sourceIds = new Set();
  const allowedPurposes = new Set(['provision', 'protection', 'knowledge', 'purification', 'relief', 'authority', 'relationships', 'other']);
  assert.equal(prophetic.entries.length, 29);
  assert.ok(topical.topics.length >= 18);
  const propheticKnownIds = new Set(JSON.parse(fs.readFileSync('docs/section-b-coverage.json', 'utf8')).cards.map(card => card.name_id));
  for (const entry of prophetic.entries) {
    assert.ok(!sourceIds.has(entry.id), `Repeated prophetic source ID: ${entry.id}`);
    sourceIds.add(entry.id);
    assert.equal(entry.review_status, 'checked_against_digital_text');
    assert.ok(['prophetic_hadith', 'prophetic_report'].includes(entry.claim_kind));
    assert.ok(entry.source_url.startsWith('https://sunnah.com/'), `Unrecognized hadith source: ${entry.id}`);
    assert.ok(allowedPurposes.has(entry.purpose));
    assert.ok(entry.arabic_original && entry.translation.ml && entry.translation.en);
    assert.ok(entry.count.ml && entry.count.en && entry.timing.ml && entry.timing.en && entry.conditions.ml && entry.conditions.en);
    assert.ok(entry.name_ids.length && entry.name_ids.every(id => propheticKnownIds.has(id)), `Unknown Section B name in ${entry.id}`);
    for (const id of entry.name_ids) {
      for (const language of ['ml', 'en']) {
        const html = render(null, id, language, { pdf_name_id: id });
        assert.ok(html.includes('data-section-b-group="prophetic"'), `Missing Prophetic section: ${id}`);
        for (const [label, body] of [['Arabic', entry.arabic_original], ['translation', entry.translation[language]], ['count', entry.count[language]], ['timing', entry.timing[language]], ['conditions', entry.conditions[language]]]) {
          assert.ok(html.includes(escape(body)), `Missing ${label} for ${entry.id} in ${id} (${language})`);
        }
        assert.ok(html.includes(entry.source_url), `Missing source URL for ${entry.id}`);
      }
    }
  }
  const musPain = prophetic.entries.find(entry => entry.id === 'hadith-muslim-2202');
  assert.ok(musPain.count.ml.includes('3') && musPain.count.ml.includes('7'), 'Pain dua counts must remain distinct.');
  const dawudPrices = prophetic.entries.find(entry => entry.id === 'hadith-abudawud-3451');
  const tirmidhiPrices = prophetic.entries.find(entry => entry.id === 'hadith-tirmidhi-1314');
  assert.ok(dawudPrices.arabic_original.includes('الرَّازِقُ') && tirmidhiPrices.arabic_original.includes('الرَّزَّاقُ'), 'Distinct narrated wordings must not be merged.');
  assert.ok(dawudPrices.name_ids.includes('PDF-HN-019') && tirmidhiPrices.name_ids.includes('PDF-HN-020'));
  const witr = prophetic.entries.find(entry => entry.id === 'hadith-nasai-1733');
  assert.ok(witr.count.ml.includes('മൂന്നു') && witr.timing.en.includes('witr'));

  // New Section B name research: source fidelity, bilingual rendering, and precise occurrence types.
  const nextResearch = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBNextResearch.json', 'utf8'));
  const coverage = JSON.parse(fs.readFileSync('docs/section-b-coverage.json', 'utf8'));
  const coveredIds = new Set(coverage.cards.map(card => card.name_id));
  const newIds = Object.keys(nextResearch.profiles);
  assert.equal(newIds.length, 12);
  assert.equal(new Set(newIds).size, newIds.length);
  assert.ok(newIds.every(id => coveredIds.has(id)), 'Expansion has a name not on the stored 160-card list.');
  for (const [id, profile] of Object.entries(nextResearch.profiles)) {
    assert.equal(profile.name_id, id);
    assert.equal(research[id], undefined, `Must never override existing researched card ${id}`);
    assert.ok(profile.evidence.length >= 2 && profile.scholarly.length >= 2);
    assert.ok(profile.coverage.ml && profile.coverage.en && /പൂർത്തി|കഴിഞ്ഞിട്ടില്ല/.test(profile.coverage.ml), `Coverage limitation required for ${id}`);
    const itemIds = new Set();
    for (const group of ['evidence', 'scholarly', 'topics']) {
      for (const entry of profile[group]) {
        assert.ok(!itemIds.has(entry.id), `Duplicate entry ${id} / ${entry.id}`);
        itemIds.add(entry.id);
        assert.equal(entry.review_status, 'checked_against_digital_text');
        assert.ok(entry.source_url.startsWith('https://quran.ksu.edu.sa/tafseer/katheer/'));
        if (group === 'evidence') assert.ok(entry.arabic_original.length > 10);
        if (group === 'topics') assert.ok(entry.count.ml && entry.timing.en && entry.conditions.ml);
      }
    }
    for (const language of ['ml', 'en']) {
      const html = render(null, id, language, { pdf_name_id: id });
      assert.ok(html.includes('data-section-b-group="evidence"') && html.includes('data-section-b-group="scholarly"'));
      assert.ok(html.includes(escape(profile.explanation[language])), `Missing intro for ${id}, ${language}`);
      for (const group of ['evidence', 'scholarly', 'topics']) for (const entry of profile[group]) {
        assert.ok(html.includes(escape(entry.translation[language])), `Missing ${group} translation: ${id}/${entry.id}/${language}`);
        assert.ok(html.includes(entry.source_url), `Missing ${group} citation: ${id}/${entry.id}`);
        if (entry.arabic_original) assert.ok(html.includes(escape(entry.arabic_original)), `Missing Arabic source: ${id}/${entry.id}`);
        if (group === 'topics') assert.ok(html.includes(escape(entry.count[language])), `Missing topic count for ${id}/${entry.id}`);
      }
    }
  }
  const saburReport = nextResearch.profiles['PDF-HN-045'].hadith[0];
  assert.equal(saburReport.source_reference, 'Sahih al-Bukhari 6099 · Book 78, Hadith 126');
  assert.ok(saburReport.arabic_original.includes('أَصْبَرَ') && !saburReport.arabic_original.includes('الصَّبُورُ'));
  for (const language of ['ml', 'en']) {
    const html = render(null, 'PDF-HN-045', language, { pdf_name_id: 'PDF-HN-045' });
    assert.ok(html.includes('data-section-b-group="hadith"'));
    assert.ok(html.includes(escape(saburReport.arabic_original)));
    assert.ok(html.includes(escape(saburReport.translation[language])));
    assert.ok(html.includes(saburReport.source_url));
  }
  assert.equal(nextResearch.profiles['PDF-HN-021'].evidence[0].claim_kind, 'thematic_relation_not_exact_name');
  assert.equal(nextResearch.profiles['PDF-HN-030'].evidence[0].claim_kind, 'direct_quranic_text');
  console.log('PASS: twelve new name profiles show 24 Quran references, 24 tafsir summaries, one hadith and all source-linked prayers in both languages.');
  // Third source-preserving expansion: twenty previously uncovered name profiles.
  const expanded = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBExpandedResearch.json', 'utf8'));
  assert.equal(Object.keys(expanded).length, 20);
  assert.equal(new Set([...Object.keys(research), ...newIds, ...Object.keys(expanded)]).size,
    Object.keys(research).length + newIds.length + Object.keys(expanded).length, 'Overlapping profile names must not silently overwrite existing research.');
  for (const [id, profile] of Object.entries(expanded)) {
    assert.equal(profile.name_id, id);
    assert.ok(coveredIds.has(id), `Unknown source card ${id}`);
    assert.ok(profile.coverage.ml && profile.coverage.en);
    assert.ok(profile.evidence.length >= 1 && profile.scholarly.length >= 1);
    const seenEntryIds = new Set();
    for (const group of ['evidence', 'scholarly']) for (const entry of profile[group]) {
      assert.ok(!seenEntryIds.has(entry.id), `Duplicate entry ${id}/${entry.id}`);
      seenEntryIds.add(entry.id);
      assert.equal(entry.review_status, 'checked_against_digital_text');
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/katheer\/sura\d+-aya\d+\.html$/.test(entry.source_url));
      assert.ok(entry.translation.ml && entry.translation.en);
      if (group === 'evidence') assert.ok(entry.arabic_original.length >= 15);
    }
    for (const language of ['ml', 'en']) {
      const html = render(null, id, language, {pdf_name_id:id});
      assert.ok(html.includes(escape(profile.explanation[language])), `Missing expanded intro ${id}/${language}`);
      for (const group of ['evidence', 'scholarly']) for (const entry of profile[group]) {
        assert.ok(html.includes(escape(entry.translation[language])), `Missing expanded content ${id}/${entry.id}/${language}`);
        assert.ok(html.includes(entry.source_url), `Missing expanded source link ${id}/${entry.id}`);
        if (entry.arabic_original) assert.ok(html.includes(escape(entry.arabic_original)), `Missing expanded Arabic ${id}/${entry.id}`);
      }
    }
  }
  const night = prophetic.entries.find(entry => entry.id === 'hadith-bukhari-5017-three-surahs-bed');
  const morning = prophetic.entries.find(entry => entry.id === 'hadith-abudawud-5082-3-surahs-morning-evening');
  const ayahBed = prophetic.entries.find(entry => entry.id === 'hadith-bukhari-2311-ayat-kursi-bed');
  assert.ok(night && morning && ayahBed, 'Full bedtime and morning/evening sources required');
  for (const entry of [night, morning]) {
    const blocks=entry.arabic_original.split(/\n\n/);
    assert.deepEqual(blocks.map(text => text.trim().split('\n').length), [4,5,6], 'Preserve complete Quran 112–114 verse counts');
    assert.equal(entry.references.length, 3);
    assert.ok(entry.references.every(ref => /^https:\/\/quran\.com\/11[234]$/.test(ref.url)));
  }
  assert.ok(night.count.en.includes('Three rounds') && morning.count.en.includes('3 times in the morning'));
  assert.ok(ayahBed.arabic_original.includes('الْحَيُّ الْقَيُّومُ') && ayahBed.arabic_original.includes('الْعَلِيُّ الْعَظِيمُ'));
  const fourNames = prophetic.entries.find(entry => entry.id === 'hadith-muslim-2713a');
  for (const id of ['PDF-HN-073','PDF-HN-074','PDF-HN-075','PDF-HN-076']) assert.ok(fourNames.name_ids.includes(id));
  console.log('PASS: 20 further sourced name chapters, 21 prophetic accounts, and complete 4+5+6-verse protection practices.');
  // Next phase: first-pass Quran source coverage for a further 48 distinct headings.
  const further = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBFurtherResearch.json', 'utf8'));
  const furtherIds = Object.keys(further.profiles);
  assert.equal(furtherIds.length, 48, 'Further research must include 48 headings.');
  const allProfileIds = [...Object.keys(research), ...newIds, ...Object.keys(expanded), ...furtherIds];
  assert.equal(new Set(allProfileIds).size, 100, 'Every research profile must be a distinct card: 20+12+20+48.');
  assert.ok(allProfileIds.every(id => coveredIds.has(id)), 'Only approved Section B card IDs may be linked.');
  const knownProfileKinds = new Set(['direct', 'descriptive', 'thematic', 'formula', 'variant']);
  let furtherVerses = 0, furtherScholarly = 0;
  for (const [id, profile] of Object.entries(further.profiles)) {
    assert.equal(profile.name_id, id);
    assert.ok(knownProfileKinds.has(profile.entry_kind), `Bad heading type: ${id}`);
    assert.ok(profile.coverage.ml && profile.coverage.en, `Coverage limitations required: ${id}`);
    assert.ok(profile.explanation.ml && profile.explanation.en);
    assert.ok(profile.evidence.length > 0);
    const itemIds = new Set();
    for(const group of ['evidence', 'scholarly', 'topics']) for(const entry of (profile[group]||[])) {
      assert.ok(!itemIds.has(entry.id), `Duplicate source record ${id}/${entry.id}`);
      itemIds.add(entry.id);
      assert.ok(entry.translation.ml && entry.translation.en);
      assert.equal(entry.review_status, 'checked_against_digital_text');
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/katheer\/sura\d+-aya\d+\.html$/.test(entry.source_url), `Unexpected source address for ${id}/${entry.id}`);
      if(group==='evidence'){assert.ok(entry.arabic_original.length > 10);furtherVerses++;}
      if(group==='scholarly')furtherScholarly++;
    }
    for (const language of ['ml', 'en']) {
      const html = render(null,id,language,{pdf_name_id:id});
      assert.ok(html.includes(escape(profile.explanation[language])), `Missing intro ${id}/${language}`);
      for(const group of ['evidence','scholarly'])for(const entry of profile[group]||[]){
        assert.ok(html.includes(escape(entry.translation[language])), `Missing text ${id}/${entry.id}/${language}`);
        assert.ok(html.includes(entry.source_url), `Missing source link ${id}/${entry.id}`);
        if(entry.arabic_original) assert.ok(html.includes(escape(entry.arabic_original)), `Missing Arabic ${id}/${entry.id}`);
      }
    }
  }
  assert.equal(furtherVerses,55);
  assert.equal(furtherScholarly,19);
  assert.equal(topical.topics.length,23);
  for(const id of ['quran-14-40-ibrahim-salah','quran-3-9-day-of-gathering','quran-2-156-calamity-remembrance','quran-18-39-garden-remembering','quran-71-10-nuh-istighfar']){
    const x=topical.topics.find(e=>e.id===id);
    assert.ok(x?.arabic_original && x?.count?.en && x?.source_url, `Missing new prayer details: ${id}`);
    for (const name of x.name_ids) {
      const html=render(null,name,'ml',{pdf_name_id:name});
      assert.ok(html.includes(escape(x.arabic_original)), `Missing linked Quranic Arabic: ${name}/${id}`);
    }
  }
  assert.ok(!further.profiles['PDF-HN-0170'].evidence[0].arabic_original.startsWith('بِسْمِ'), 'Surah 4:1 must not include the pre-verse basmala in its verse text.');
  assert.equal(further.profiles['PDF-HN-058'].evidence[0].claim_kind,'theme_not_independent_name');
  assert.equal(further.profiles['PDF-HN-060'].evidence[0].claim_kind,'theme_not_independent_name');
  assert.equal(further.profiles['PDF-HN-139'].entry_kind,'formula');
  console.log('PASS: 48 further headings (100 unique profiles total), 55 Quran links, 19 attributed tafsir accounts and 5 linked Quranic practice explanations.');
  // Final first-pass inventory expansion: every one of the 160 stored card IDs
  // must have its own distinct, attributed research profile, with safe bilingual rendering.
  const remaining = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBRemainingResearch.json', 'utf8'));
  const remainingIds = Object.keys(remaining.profiles);
  assert.equal(remainingIds.length, 60);
  const everyResearchId = [...Object.keys(research), ...newIds, ...Object.keys(expanded), ...furtherIds, ...remainingIds];
  assert.equal(everyResearchId.length, 160);
  assert.equal(new Set(everyResearchId).size, 160, 'No name may overwrite a prior scholarly profile.');
  assert.deepEqual(new Set(everyResearchId), coveredIds, 'Every stored card must have a corresponding research profile.');
  let quranLinks = 0;
  const allowedKinds = new Set(['direct', 'direct_phrase', 'descriptive', 'verb_theme', 'thematic', 'linguistic_comparison']);
  for(const [id,profile] of Object.entries(remaining.profiles)) {
    assert.equal(profile.name_id,id);
    assert.ok(allowedKinds.has(profile.claim_kind), `Unknown source-form category on ${id}`);
    assert.ok(profile.heading_arabic && profile.source_label && profile.explanation.ml && profile.explanation.en);
    assert.ok(profile.coverage.en.includes('not yet finished'));
    assert.ok(profile.evidence.length > 0);
    const used = new Set();
    for(const entry of profile.evidence) {
      quranLinks++;
      assert.ok(!used.has(entry.id), `Duplicate Quran entry on ${id}`);
      used.add(entry.id);
      assert.ok(entry.source_url.startsWith('https://quran.com/'));
      assert.equal(entry.review_status,'checked_against_digital_text');
      assert.ok(entry.arabic_original.length > 10 && entry.translation.ml && entry.translation.en);
      if (entry.source_reference.includes('(excerpt)')) {
        assert.ok(entry.source_scope.en.includes('relevant portion'), `Excerpt must be explicit on ${id}`);
      }
    }
    for(const language of ['ml','en']) {
      const html=render(null,id,language,{pdf_name_id:id});
      assert.ok(html.includes('data-section-b-group="evidence"'),`Missing Quran grouping for ${id}`);
      assert.ok(html.includes(escape(profile.explanation[language])),`Missing ${language} introduction ${id}`);
      for(const entry of profile.evidence){
        assert.ok(html.includes(escape(entry.arabic_original)),`Missing original Quran text ${id}/${entry.id}`);
        assert.ok(html.includes(escape(entry.translation[language])),`Missing translation ${id}/${entry.id}/${language}`);
        assert.ok(html.includes(entry.source_url),`Missing public source link ${id}/${entry.id}`);
      }
    }
  }
  assert.equal(quranLinks,69,'All 69 source passages across 60 cards must be retained.');
  for(const [id,required] of [
    ['hadith-muslim-2719a-muqaddim-muakhkhir','الْمُقَدِّمُ'],
    ['hadith-bukhari-3116-allah-giver','الْمُعْطِي'],
    ['hadith-abudawud-1495-al-mannan','الْمَنَّانُ'],
    ['hadith-bukhari-3113-bedtime-34-33-33','اللَّهُ أَكْبَرُ']
  ]) {
    const h=prophetic.entries.find(x=>x.id===id);
    assert.ok(h?.arabic_original?.includes(required),`Missing precise new hadith text: ${id}`);
    assert.ok(h.count.ml && h.count.en && h.timing.ml && h.conditions.en);
    for(const nameId of h.name_ids) for (const language of ['ml','en']) {
      const html=render(null,nameId,language,{pdf_name_id:nameId});
      assert.ok(html.includes(escape(h.arabic_original)),`Missing new hadith Arabic: ${id}/${nameId}`);
      assert.ok(html.includes(escape(h.translation[language])),`Missing new hadith meaning: ${id}/${language}`);
      assert.ok(html.includes(h.source_url),`Missing hadith citation ${id}/${nameId}`);
    }
  }
  const bedtime100=prophetic.entries.find(x=>x.id==='hadith-bukhari-3113-bedtime-34-33-33');
  assert.ok(bedtime100.count.en.includes('34') && bedtime100.count.en.includes('33'));
  const afterPrayer100=prophetic.entries.find(x=>x.id==='hadith-muslim-597a');
  assert.ok(afterPrayer100.count.en.includes('33') && afterPrayer100.count.en.includes('once'));
  console.log('PASS: 160 distinct Section B card introductions, 60 last-phase profiles, 69 Quran links and four new authentic source-attributed hadith reports.');
  // Further source-critical depth on the already covered 160 cards.
  // Never count an attributed tafsir paraphrase as a prescribed Quranic wazifa.
  const depth = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTafsirDepth.json', 'utf8'));
  const depthIds = Object.keys(depth.profiles);
  assert.equal(depthIds.length,25);
  assert.ok(depthIds.every(id=>coveredIds.has(id)), 'Deep studies must use the approved 160-card inventory.');
  let depthTafsir = 0, depthFullQuran = 0, deepTabari = 0, deepKathir = 0;
  for(const [id, profile] of Object.entries(depth.profiles)) {
    assert.equal(profile.name_id,id);
    assert.ok(profile.scholarly.length >= 1);
    const sourceIds = new Set();
    for (const entry of [...profile.scholarly, ...profile.evidence]) {
      assert.ok(!sourceIds.has(entry.id), `Repeated deep-research entry ${id}/${entry.id}`);
      sourceIds.add(entry.id);
      assert.equal(entry.review_status,'checked_against_digital_text');
      assert.ok(entry.translation.ml && entry.translation.en);
      assert.ok(entry.source_scope?.ml && entry.source_scope?.en);
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/(katheer|tabary)\/sura\d+-aya\d+\.html$/.test(entry.source_url),`Unexpected deep-source link ${entry.id}`);
    }
    for(const e of profile.scholarly) {
      depthTafsir++;
      if(e.source_url.includes('/tabary/'))deepTabari++;
      if(e.source_url.includes('/katheer/'))deepKathir++;
      assert.ok(!e.count && !e.timing, 'Scholarly explanation must not masquerade as a new fixed-count ritual.');
    }
    for(const e of profile.evidence){
      depthFullQuran++;
      assert.equal(e.claim_kind,'complete_quran_verse_context');
      assert.ok(e.arabic_original.length > 60, `Full verse appears incomplete: ${id}`);
      assert.ok(e.source_reference.includes('complete verse'));
      assert.ok(!e.count && !e.timing);
    }
    for(const lang of ['ml','en']){
      const html=render(null,id,lang,{pdf_name_id:id});
      assert.ok(html.includes('data-section-b-group="scholarly"'),`Missing tafsir group ${id}/${lang}`);
      for(const entry of profile.scholarly){
        assert.ok(html.includes(escape(entry.translation[lang])),`Missing tafsir meaning ${id}/${entry.id}/${lang}`);
        assert.ok(html.includes(entry.source_url),`Missing tafsir link ${id}/${entry.id}`);
      }
      for(const entry of profile.evidence){
        assert.ok(html.includes(escape(entry.arabic_original)),`Missing full Quran Arabic ${id}/${entry.id}`);
        assert.ok(html.includes(escape(entry.translation[lang])),`Missing full Quran meaning ${id}/${entry.id}/${lang}`);
        assert.ok(html.includes(entry.source_url),`Missing Quran source ${id}/${entry.id}`);
      }
    }
  }
  assert.deepEqual({depthTafsir,depthFullQuran,deepTabari,deepKathir},
    {depthTafsir:34,depthFullQuran:8,deepTabari:9,deepKathir:25});
  assert.ok(depth.profiles['PDF-HN-0202'].scholarly.some(e=>e.source_url.includes('/tabary/')));
  assert.ok(depth.profiles['PDF-HN-0203'].scholarly.some(e=>e.source_url.includes('/tabary/')));
  assert.ok(depth.profiles['PDF-HN-0164'].evidence[0].arabic_original.includes('بِالْعَدْلِ'));
  console.log('PASS: 25 strengthened name cards show 34 cited classical tafsir readings and 8 complete Quran verses in both languages.');
  // Second deepening: 20 distinct additional names have actual Arabic excerpts
  // from identified classical commentators, with bilingual meanings and source URLs.
  const depthII = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTafsirDepthII.json', 'utf8'));
  assert.equal(Object.keys(depthII.profiles).length, 20);
  assert.equal(new Set([...Object.keys(depth.profiles), ...Object.keys(depthII.profiles)]).size,45,
    'Depth II should research 20 previously unexpanded names instead of duplicating depth I.');
  let secondTafsir=0, secondKathir=0, secondTabari=0, secondQuran=0;
  for(const [id,p] of Object.entries(depthII.profiles)) {
    assert.equal(p.name_id,id);
    assert.ok(coveredIds.has(id), `Deep research outside the 160-card inventory: ${id}`);
    assert.ok(p.scholarly.length>=1);
    const usedIds = new Set();
    for(const item of [...p.scholarly,...p.evidence]){
      assert.ok(!usedIds.has(item.id),`Duplicate second-deep source ${id}/${item.id}`);
      usedIds.add(item.id);
      assert.equal(item.review_status,'checked_against_digital_text');
      assert.ok(item.translation.ml && item.translation.en);
      assert.ok(item.arabic_original && item.arabic_original.length>12);
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/(katheer|tabary)\/sura\d+-aya\d+\.html$/.test(item.source_url));
      assert.ok(!item.count&&!item.timing, 'Do not invent name-specific counts/timings from tafsir.');
    }
    for(const item of p.scholarly){
      secondTafsir++;
      if(item.source_url.includes('/katheer/')) secondKathir++;
      if(item.source_url.includes('/tabary/')) secondTabari++;
    }
    for(const item of p.evidence){
      secondQuran++;
      assert.equal(item.claim_kind,'complete_quran_verse_context');
      assert.ok(item.arabic_original.length>85);
    }
    for(const language of ['ml','en']){
      const html=render(null,id,language,{pdf_name_id:id});
      assert.ok(html.includes('data-section-b-group="scholarly"'));
      for(const item of [...p.scholarly,...p.evidence]){
        assert.ok(html.includes(escape(item.arabic_original)),`Missing Arabic original in ${id}/${item.id}/${language}`);
        assert.ok(html.includes(escape(item.translation[language])),`Missing bilingual translation in ${id}/${item.id}/${language}`);
        assert.ok(html.includes(item.source_url),`Missing source link in ${id}/${item.id}`);
      }
    }
  }
  assert.deepEqual({secondTafsir,secondKathir,secondTabari,secondQuran},
    {secondTafsir:27,secondKathir:20,secondTabari:7,secondQuran:10});
  assert.ok(depthII.profiles['PDF-HN-0205'].scholarly.some(item=>item.source_url.includes('/tabary/')));
  assert.ok(depthII.profiles['PDF-HN-0213'].scholarly.some(item=>item.source_url.includes('/tabary/')));
  console.log('PASS: 20 additional source-checked name cards show 27 original Arabic tafsir excerpts and ten complete Quran verses, in Malayalam and English.');

  // Third detailed research pass: the 60 originally excerpt-only profiles now all
  // have a distinct, source-linked classical commentary layer across three phases.
  const depthIII = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTafsirDepthIII.json','utf8'));
  const thirdIds = Object.keys(depthIII.profiles);
  assert.equal(thirdIds.length,15);
  const allDeep = [...Object.keys(depth.profiles),...Object.keys(depthII.profiles),...thirdIds];
  assert.equal(allDeep.length,60);
  assert.equal(new Set(allDeep).size,60,'The three depth phases must cover 60 different card headings.');
  assert.ok(allDeep.every(id=>coveredIds.has(id)));
  let tafsirThird=0,kathirThird=0,tabariThird=0,fullVerseThird=0;
  for(const [id,p] of Object.entries(depthIII.profiles)){
    assert.equal(p.name_id,id);
    assert.ok(p.scholarly.length>=1);
    const unique = new Set();
    for(const item of [...p.scholarly,...p.evidence]){
      assert.ok(!unique.has(item.id),`Source ID reused: ${id}/${item.id}`);
      unique.add(item.id);
      assert.equal(item.review_status,'checked_against_digital_text');
      assert.ok(item.arabic_original && item.arabic_original.length>12);
      assert.ok(item.translation.ml && item.translation.en);
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/(katheer|tabary)\/sura\d+-aya\d+\.html$/.test(item.source_url),`Source URL missing: ${id}/${item.id}`);
      assert.ok(!item.count&&!item.timing,'Scholarly summary cannot invent ritual timing or count.');
    }
    for(const item of p.scholarly){
      tafsirThird++;
      if(item.source_url.includes('/katheer/'))kathirThird++;
      if(item.source_url.includes('/tabary/'))tabariThird++;
    }
    for(const item of p.evidence){
      fullVerseThird++;
      assert.equal(item.claim_kind,'complete_quran_verse_context');
      assert.ok(item.arabic_original.length>80);
    }
    for(const lang of ['ml','en']){
      const html=render(null,id,lang,{pdf_name_id:id});
      assert.ok(html.includes('data-section-b-group="scholarly"'));
      for(const item of [...p.scholarly,...p.evidence]){
        assert.ok(html.includes(escape(item.arabic_original)),`Arabic source not rendered: ${id}/${item.id}/${lang}`);
        assert.ok(html.includes(escape(item.translation[lang])),`Translated source not rendered: ${id}/${item.id}/${lang}`);
        assert.ok(html.includes(item.source_url),`Source link not rendered: ${id}/${item.id}/${lang}`);
      }
    }
  }
  assert.deepEqual({tafsirThird,kathirThird,tabariThird,fullVerseThird},{tafsirThird:22,kathirThird:15,tabariThird:7,fullVerseThird:5});
  const afterPrayer=prophetic.entries.find(x=>x.id==='hadith-bukhari-844-no-one-withholds-post-prayer');
  assert.ok(afterPrayer && afterPrayer.arabic_original.includes('لَا مَانِعَ لِمَا أَعْطَيْتَ'));
  assert.ok(afterPrayer.source_reference.includes('Bukhari 844') && afterPrayer.source_reference.includes('Muslim 593a'));
  assert.ok(afterPrayer.timing.en.includes('obligatory prayer'));
  assert.ok(afterPrayer.count.en.includes('no additional'));
  assert.ok(afterPrayer.name_ids.includes('PDF-HN-089'));
  for(const id of afterPrayer.name_ids) for(const lang of ['ml','en']){
    const html=render(null,id,lang,{pdf_name_id:id});
    assert.ok(html.includes(escape(afterPrayer.arabic_original)));
    assert.ok(html.includes(escape(afterPrayer.translation[lang])));
    assert.ok(html.includes(afterPrayer.source_url));
  }
  console.log('PASS: 60 distinct deep-studied headings (three phases), 22 more classical tafsir readings, five complete Quran passages, and authenticated after-prayer hadith.');
  // Fourth original-language tafsir source phase, reaching 75 distinct deep-study cards.
  const depthIV = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTafsirDepthIV.json','utf8'));
  const depth4Ids = Object.keys(depthIV.profiles);
  assert.equal(depth4Ids.length,15,'The fourth tafsir stage covers fifteen cards');
  const allDeepIds = [...Object.keys(depth.profiles),...Object.keys(depthII.profiles),...Object.keys(depthIII.profiles),...depth4Ids];
  assert.equal(new Set(allDeepIds).size,75,'Depth IV must not duplicate earlier studied cards');
  assert.ok(allDeepIds.every(id=>coveredIds.has(id)));
  let fourthTafsir=0,fourthKathir=0,fourthTabari=0;
  for(const [id,p] of Object.entries(depthIV.profiles)){
    assert.equal(p.name_id,id);
    assert.ok(p.scholarly.length>=1);
    for(const entry of p.scholarly){
      fourthTafsir++;
      if(entry.source_url.includes('/katheer/'))fourthKathir++;
      if(entry.source_url.includes('/tabary/'))fourthTabari++;
      assert.equal(entry.review_status,'checked_against_digital_text');
      assert.ok(entry.arabic_original.length>12);
      assert.ok(entry.translation.ml && entry.translation.en);
      assert.ok(entry.source_scope?.ml && entry.source_scope?.en);
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/(katheer|tabary)\/sura\d+-aya\d+\.html$/.test(entry.source_url));
      assert.ok(!entry.count&&!entry.timing,'Tafsir paraphrases must not invent rituals or counts.');
      for(const lang of ['ml','en']){
        const html=render(null,id,lang,{pdf_name_id:id});
        assert.ok(html.includes('data-section-b-group="scholarly"'));
        assert.ok(html.includes(escape(entry.arabic_original)),`Fourth-phase Arabic missing ${id}/${entry.id}`);
        assert.ok(html.includes(escape(entry.translation[lang])),`Fourth-phase meaning missing ${id}/${entry.id}/${lang}`);
        assert.ok(html.includes(entry.source_url),`Fourth-phase reference missing ${id}/${entry.id}`);
      }
    }
  }
  assert.deepEqual({fourthTafsir,fourthKathir,fourthTabari},{fourthTafsir:20,fourthKathir:15,fourthTabari:5});
  const firm=prophetic.entries.find(x=>x.id==='hadith-tirmidhi-2140-hearts-steadfast');
  assert.ok(firm?.arabic_original.includes('يَا مُقَلِّبَ الْقُلُوبِ'));
  assert.equal(firm.source_url,'https://sunnah.com/tirmidhi:2140');
  assert.ok(firm.count.en.includes('no fixed number'));
  assert.ok(firm.name_ids.includes('PDF-HN-0147'));
  for(const id of firm.name_ids)for(const lang of ['ml','en']){
    const html=render(null,id,lang,{pdf_name_id:id});
    assert.ok(html.includes(escape(firm.arabic_original)));
    assert.ok(html.includes(escape(firm.translation[lang])));
    assert.ok(html.includes(firm.source_url));
  }
  assert.ok(depthIV.profiles['PDF-HN-0172'].scholarly.some(x=>x.source_url.includes('/tabary/')),
    'Al-Muqit must retain al-Tabari alternative readings and his chosen interpretation');
  console.log('PASS: 75 individually deep-studied headings, 20 additional original-Arabic tafsir explanations and authentic Tirmidhi 2140 heart dua.');

  // Fifth source-critical pass: 15 new names, not repeated from the first 75.
  const depthV = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTafsirDepthV.json','utf8'));
  assert.equal(Object.keys(depthV.profiles).length,15);
  const allFiveDeepIds = [...allDeepIds,...Object.keys(depthV.profiles)];
  assert.equal(allFiveDeepIds.length,90);
  assert.equal(new Set(allFiveDeepIds).size,90,'Every deep-study addition needs a different canonical card ID.');
  assert.ok(allFiveDeepIds.every(x=>coveredIds.has(x)));
  let fifthTafsir=0, fifthKathir=0, fifthTabari=0, fifthFullVerse=0;
  for(const [id,p] of Object.entries(depthV.profiles)){
    assert.equal(p.name_id,id);
    assert.ok(p.scholarly.length>=1);
    const sourceIds=new Set();
    for(const item of [...p.scholarly,...p.evidence]){
      assert.ok(!sourceIds.has(item.id),`Duplicate source: ${id}/${item.id}`);
      sourceIds.add(item.id);
      assert.equal(item.review_status,'checked_against_digital_text');
      assert.ok(item.translation.ml && item.translation.en);
      assert.ok(item.arabic_original?.length>20);
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/(katheer|tabary)\/sura\d+-aya\d+\.html$/.test(item.source_url));
      assert.ok(!item.count&&!item.timing,'Tafsir entries cannot establish invented numbered rites.');
    }
    for(const item of p.scholarly){
      fifthTafsir++;
      if(item.source_url.includes('/katheer/'))fifthKathir++;
      if(item.source_url.includes('/tabary/'))fifthTabari++;
    }
    for(const item of p.evidence){
      fifthFullVerse++;
      assert.equal(item.claim_kind,'complete_quran_verse_context');
      assert.ok(item.source_reference.includes('complete verse'));
    }
    for(const lang of ['ml','en']){
      const html=render(null,id,lang,{pdf_name_id:id});
      assert.ok(html.includes('data-section-b-group="scholarly"'));
      for(const item of [...p.scholarly,...p.evidence]){
        assert.ok(html.includes(escape(item.arabic_original)),`Arabic original not visible ${id}/${item.id}/${lang}`);
        assert.ok(html.includes(escape(item.translation[lang])),`Bilingual meaning missing ${id}/${item.id}/${lang}`);
        assert.ok(html.includes(item.source_url),`Source link missing ${id}/${item.id}/${lang}`);
      }
    }
  }
  assert.deepEqual({fifthTafsir,fifthKathir,fifthTabari,fifthFullVerse},
    {fifthTafsir:23,fifthKathir:15,fifthTabari:8,fifthFullVerse:5});
  assert.ok(depthV.profiles['PDF-HN-105'].evidence[0].arabic_original.includes('الْخَلَّاقُ'));
  assert.ok(depthV.profiles['PDF-HN-068'].evidence[0].arabic_original.includes('مُّقْتَدِرٍ'));
  const weakNarrationWarning=depthV.profiles['PDF-HN-135'].scholarly.find(x=>x.source_reference.includes('katheer')||x.source_url.includes('/katheer/'));
  assert.ok(weakNarrationWarning.translation.en.includes('unsound'),'Do not turn the weak garden-harm report into authentic prescription.');
  const frequent=prophetic.entries.find(x=>x.id==='hadith-bukhari-6389-most-frequent-quran-dua');
  assert.ok(frequent?.arabic_original.includes('اللَّهُمَّ رَبَّنَا آتِنَا'));
  assert.ok(frequent.source_reference.includes('Bukhari 6389'));
  assert.ok(frequent.count.en.includes('No fixed repetition count'));
  assert.ok(frequent.name_ids.includes('PDF-HN-139'));
  for(const id of frequent.name_ids)for(const lang of ['ml','en']){
    const html=render(null,id,lang,{pdf_name_id:id});
    assert.ok(html.includes(escape(frequent.arabic_original)));
    assert.ok(html.includes(escape(frequent.translation[lang])));
    assert.ok(html.includes(frequent.source_url));
  }
  console.log('PASS: 90 distinct tafsir-deepened names, 23 new classical commentaries, five complete Quran verses and Sahih Bukhari 6389 supplication.');

  // Sixth pass: preserve 105 distinct deeply researched cards and their
  // original Arabic Quran/tafsir source evidence, in both reader languages.
  const depthVI = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTafsirDepthVI.json','utf8'));
  const sixthIds = Object.keys(depthVI.profiles);
  assert.equal(sixthIds.length,15);
  const sixPhaseIds = [...allFiveDeepIds,...sixthIds];
  assert.equal(sixPhaseIds.length,105);
  assert.equal(new Set(sixPhaseIds).size,105,'Phase VI must introduce fifteen unique cards without reusing old IDs.');
  assert.ok(sixPhaseIds.every(id=>coveredIds.has(id)),'All deep studies need a valid canonical card ID.');
  let sixthTafsir=0,sixthKathir=0,sixthTabari=0,sixthCompleteQuran=0;
  for(const [id,p] of Object.entries(depthVI.profiles)){
    assert.equal(p.name_id,id);
    assert.ok(p.scholarly.length>=1);
    const recordIds = new Set();
    for(const item of [...p.scholarly,...p.evidence]){
      assert.ok(!recordIds.has(item.id),`Duplicate scholarly record on ${id}`);
      recordIds.add(item.id);
      assert.equal(item.review_status,'checked_against_digital_text');
      assert.ok(item.arabic_original && item.arabic_original.length>=15,`Missing original Arabic ${id}/${item.id}`);
      assert.ok(item.translation?.ml && item.translation?.en,'Every source requires meanings in both languages.');
      assert.ok(item.source_scope?.ml && item.source_scope?.en,'Source scope and religious status must be explained.');
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/(katheer|tabary)\/sura\d+-aya\d+\.html$/.test(item.source_url));
      assert.ok(!item.count&&!item.timing,'Do not manufacture recitation counts or times from classical tafsir.');
    }
    for(const item of p.scholarly){
      sixthTafsir++;
      if(item.source_url.includes('/katheer/'))sixthKathir++;
      if(item.source_url.includes('/tabary/'))sixthTabari++;
    }
    for(const item of p.evidence){
      sixthCompleteQuran++;
      assert.equal(item.claim_kind,'complete_quran_verse_context');
      assert.ok(item.arabic_original.length>300);
    }
    for(const lang of ['ml','en']){
      const html=render(null,id,lang,{pdf_name_id:id});
      assert.ok(html.includes('data-section-b-group="scholarly"'));
      for(const item of [...p.scholarly,...p.evidence]){
        assert.ok(html.includes(escape(item.arabic_original)),`Missing original in reader ${id}/${item.id}/${lang}`);
        assert.ok(html.includes(escape(item.translation[lang])),`Missing translation in reader ${id}/${item.id}/${lang}`);
        assert.ok(html.includes(item.source_url),`Missing linked source in reader ${id}/${item.id}/${lang}`);
      }
    }
  }
  assert.deepEqual({sixthTafsir,sixthKathir,sixthTabari,sixthCompleteQuran},
    {sixthTafsir:22,sixthKathir:10,sixthTabari:12,sixthCompleteQuran:1});
  const wahidVerse=depthVI.profiles['PDF-HN-064'].evidence[0];
  assert.ok(wahidVerse.arabic_original.includes('الْوَاحِدُ الْقَهَّارُ'));
  assert.ok(wahidVerse.arabic_original.startsWith('قُلْ مَن رَّبُّ'));
  const muslimBedtime=prophetic.entries.find(x=>x.id==='hadith-muslim-2713a');
  assert.ok(muslimBedtime?.source_reference.includes('2713a'));
  for(const id of ['PDF-HN-073','PDF-HN-074','PDF-HN-075','PDF-HN-076']){
    assert.ok(depthVI.profiles[id].scholarly.some(x=>x.source_url.includes('/tabary/sura57-aya3.html')));
    assert.ok(muslimBedtime.name_ids.includes(id),'Each Quran 57:3 Name links to the existing source-verified bedtime dua.');
    for(const lang of ['ml','en']){
      const html=render(null,id,lang,{pdf_name_id:id});
      assert.ok(html.includes(escape(muslimBedtime.arabic_original)));
    }
  }
  assert.ok(depthVI.profiles['PDF-HN-065'].scholarly.some(x=>x.translation.en.includes('weak chains')));
  assert.ok(depthVI.profiles['PDF-HN-092'].scholarly.some(x=>x.source_url.includes('/tabary/sura24-aya35.html')));
  console.log('PASS: 105 distinct scholarly-deepened Holy Names; 22 further sourced Arabic tafsir excerpts, one full Quran verse, four 57:3 hadith-linked names and weak-report caveat.');

  // Seventh independently sourced study: first fifteen original catalog Names.
  // Distinguish 120 unique deep-study headings from complete manuscript coverage.
  const depthVII = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTafsirDepthVII.json','utf8'));
  const viiIds = Object.keys(depthVII.profiles);
  assert.equal(viiIds.length,15);
  assert.deepEqual(viiIds.sort(),Array.from({length:15},(_,i)=>'PDF-HN-'+String(i+1).padStart(3,'0')).sort(),
    'First fifteen original Holy Names need individual studies, not shared one-size-fits-all data.');
  const studiedVII = [...sixPhaseIds,...viiIds];
  assert.equal(studiedVII.length,120);
  assert.equal(new Set(studiedVII).size,120,'Study must introduce fifteen unique new cards.');
  assert.ok(studiedVII.every(x=>coveredIds.has(x)));
  let depth7Scholarly=0,depth7Kathir=0,depth7Tabari=0,depth7Verses=0,criticalRecords=0;
  const seenIds=new Set();
  for(const [id,p] of Object.entries(depthVII.profiles)){
    assert.equal(p.name_id,id);
    assert.ok(p.scholarly.length>=2,'Every name needs at least Ibn Kathir and Tabari source readings.');
    for(const record of [...p.scholarly,...p.evidence]){
      assert.ok(!seenIds.has(record.id),`Globally duplicated research record ID ${record.id}`);
      seenIds.add(record.id);
      assert.equal(record.review_status,'checked_against_digital_text');
      assert.ok(record.arabic_original && record.arabic_original.length>=10,`Short or absent original Arabic excerpt: ${record.id}`);
      assert.ok(record.translation?.ml && record.translation?.en);
      assert.ok(record.source_scope?.ml && record.source_scope?.en);
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/(katheer|tabary)\/sura\d+-aya\d+\.html$/.test(record.source_url),
        `Non-source reference: ${record.id}`);
      assert.ok(!record.count&&!record.timing&&!record.steps,'Do not manufacture esoteric recipes from tafsir.');
    }
    for(const record of p.scholarly){
      depth7Scholarly++;
      if(record.source_url.includes('/katheer/'))depth7Kathir++;
      if(record.source_url.includes('/tabary/'))depth7Tabari++;
      if(record.claim_kind==='critical_transmission_and_scholarly_disagreement')criticalRecords++;
    }
    for(const record of p.evidence){
      depth7Verses++;
      assert.equal(record.claim_kind,'complete_quran_verse_context');
      assert.ok(record.arabic_original.length>75);
    }
    for(const lang of ['ml','en']){
      const html=render(null,id,lang,{pdf_name_id:id});
      assert.ok(html.includes('data-section-b-group="scholarly"'));
      for(const record of [...p.scholarly,...p.evidence]){
        assert.ok(html.includes(escape(record.arabic_original)),`Original Arabic absent ${id}/${record.id}/${lang}`);
        assert.ok(html.includes(escape(record.translation[lang])),`Translated meaning absent ${id}/${record.id}/${lang}`);
        assert.ok(html.includes(escape(record.source_scope[lang])),`Source context absent ${id}/${record.id}/${lang}`);
        assert.ok(html.includes(record.source_url),`Source URL absent ${id}/${record.id}/${lang}`);
      }
    }
  }
  assert.deepEqual({depth7Scholarly,depth7Kathir,depth7Tabari,depth7Verses,criticalRecords},
    {depth7Scholarly:32,depth7Kathir:16,depth7Tabari:16,depth7Verses:4,criticalRecords:2});
  assert.ok(depthVII.profiles['PDF-HN-007'].scholarly.some(x=>x.translation.en.includes('Trustworthy')));
  assert.ok(depthVII.profiles['PDF-HN-001'].scholarly.some(x=>x.translation.en.includes('disputed')));
  assert.ok(depthVII.profiles['PDF-HN-011'].scholarly.some(x=>x.translation.en.includes('gharib')));
  assert.ok(depthVII.profiles['PDF-HN-012'].evidence[0].source_scope.en.includes('not an instruction or authorization for violence today'));
  assert.ok(depthVII.profiles['PDF-HN-014'].evidence[0].arabic_original.includes('الْوَاحِدُ الْقَهَّارُ'));
  console.log('PASS: 120 unique deep-studied cards; first 15 add 32 source-exact classical excerpts, 4 full verses, two critical disagreements and bilingual original-text rendering.');

  // Eighth source-critical pass: fifteen entirely new canonical IDs (135 total).
  const depthVIII = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTafsirDepthVIII.json','utf8'));
  const viiiIds = Object.keys(depthVIII.profiles);
  assert.equal(viiiIds.length,15);
  const researchedVIII = [...studiedVII,...viiiIds];
  assert.equal(researchedVIII.length,135);
  assert.equal(new Set(researchedVIII).size,135,'Eighth phase must contain no repeat IDs.');
  assert.ok(researchedVIII.every(id=>coveredIds.has(id)));
  let viiiTafsir=0,viiiKathir=0,viiiTabari=0,viiiFullQuran=0,viiiCritical=0;
  const recIds=new Set();
  for(const [id,p] of Object.entries(depthVIII.profiles)){
    assert.equal(p.name_id,id);
    assert.ok(p.scholarly.length>=2);
    assert.ok(p.scholarly.some(e=>e.source_url.includes('/katheer/')));
    assert.ok(p.scholarly.some(e=>e.source_url.includes('/tabary/')));
    for(const record of [...p.scholarly,...p.evidence]){
      assert.ok(!recIds.has(record.id),`Record collision: ${record.id}`);
      recIds.add(record.id);
      assert.equal(record.review_status,'checked_against_digital_text');
      assert.ok(record.arabic_original?.length>=10);
      assert.ok(record.translation?.ml && record.translation?.en);
      assert.ok(record.source_scope?.ml && record.source_scope?.en);
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/(katheer|tabary)\/sura\d+-aya\d+\.html$/.test(record.source_url));
      assert.ok(!record.count&&!record.timing&&!record.steps,'Do not invent practices from tafsir.');
    }
    for(const record of p.scholarly){
      viiiTafsir++;
      if(record.source_url.includes('/katheer/'))viiiKathir++;
      if(record.source_url.includes('/tabary/'))viiiTabari++;
      if(record.claim_kind==='source_critical_grammar_and_unseen_claims')viiiCritical++;
    }
    for(const record of p.evidence){
      viiiFullQuran++;
      assert.equal(record.claim_kind,'complete_quran_verse_context');
      assert.ok(record.source_reference.endsWith('(complete verse)'));
      assert.ok(record.arabic_original.length>100);
    }
    for(const lang of ['ml','en']){
      const html=render(null,id,lang,{pdf_name_id:id});
      assert.ok(html.includes('data-section-b-group="scholarly"'));
      for(const record of [...p.scholarly,...p.evidence]){
        assert.ok(html.includes(escape(record.arabic_original)),`Original Arabic not displayed ${id}/${record.id}/${lang}`);
        assert.ok(html.includes(escape(record.translation[lang])),`Translation absent ${id}/${record.id}/${lang}`);
        assert.ok(html.includes(escape(record.source_scope[lang])),`Source scope absent ${id}/${record.id}/${lang}`);
        assert.ok(html.includes(record.source_url),`Source link absent ${id}/${record.id}/${lang}`);
      }
    }
  }
  assert.deepEqual({viiiTafsir,viiiKathir,viiiTabari,viiiFullQuran,viiiCritical},
    {viiiTafsir:32,viiiKathir:15,viiiTabari:17,viiiFullQuran:3,viiiCritical:2});
  assert.ok(depthVIII.profiles['PDF-HN-019'].evidence[0].arabic_original.includes('وَاللَّهُ يَقْبِضُ وَيَبْسُطُ'));
  assert.ok(depthVIII.profiles['PDF-HN-020'].evidence[0].arabic_original.includes('وَاللَّهُ يَقْبِضُ وَيَبْسُطُ'));
  assert.ok(depthVIII.profiles['PDF-HN-027'].evidence[0].arabic_original.includes('أَبْتَغِي حَكَمًا'));
  assert.ok(depthVIII.profiles['PDF-HN-018'].scholarly.some(x=>x.claim_kind==='source_critical_grammar_and_unseen_claims'));
  assert.ok(depthVIII.profiles['PDF-HN-016'].scholarly.some(x=>x.translation.en.includes('grammatical case')));
  assert.ok(depthVIII.profiles['PDF-HN-021'].scholarly.some(x=>x.translation.en.includes('event')));
  console.log('PASS: 135 unique researched headings; 32 Arabic classical tafsir excerpts, three full Quran verses, and two source-critical records render in Malayalam/English.');

  // Ninth pass: 15 independently researched headings must reach 150 unique IDs.
  const depthIX = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTafsirDepthIX.json','utf8'));
  const ixIds=Object.keys(depthIX.profiles);
  assert.equal(ixIds.length,15);
  const researchedIX=[...researchedVIII,...ixIds];
  assert.equal(researchedIX.length,150);
  assert.equal(new Set(researchedIX).size,150,'Ninth batch must not duplicate any of the previous 135 IDs.');
  assert.ok(researchedIX.every(id=>coveredIds.has(id)));
  let ninthNotes=0,ninthKathir=0,ninthTabari=0,ninthVerses=0;
  const ninthSourceIds=new Set();
  for(const [id,p] of Object.entries(depthIX.profiles)){
    assert.equal(p.name_id,id);
    assert.ok(p.scholarly.length>=2,'At least two independently attributed tafsir notes per card.');
    for(const record of [...p.scholarly,...p.evidence]){
      assert.ok(!ninthSourceIds.has(record.id),`Duplicate IX record ID ${record.id}`);
      ninthSourceIds.add(record.id);
      assert.equal(record.review_status,'checked_against_digital_text');
      assert.ok(record.arabic_original?.length>=10,'Arabic original must not be empty.');
      assert.ok(record.translation?.ml && record.translation?.en);
      assert.ok(record.source_scope?.ml && record.source_scope?.en);
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/(katheer|tabary)\/sura\d+-aya\d+\.html$/.test(record.source_url));
      assert.ok(!record.count&&!record.timing&&!record.steps,'Classical commentary cannot be turned into an invented ritual.');
    }
    for(const record of p.scholarly){
      ninthNotes++;
      if(record.source_url.includes('/katheer/'))ninthKathir++;
      if(record.source_url.includes('/tabary/'))ninthTabari++;
    }
    for(const record of p.evidence){
      ninthVerses++;
      assert.equal(record.claim_kind,'complete_quran_verse_context');
      assert.ok(record.source_reference.endsWith('(complete verse)'));
    }
    for(const lang of ['ml','en']){
      const html=render(null,id,lang,{pdf_name_id:id});
      assert.ok(html.includes('data-section-b-group="scholarly"'));
      for(const record of [...p.scholarly,...p.evidence]){
        assert.ok(html.includes(escape(record.arabic_original)),`Original Arabic missing ${id}/${record.id}/${lang}`);
        assert.ok(html.includes(escape(record.translation[lang])),`Translation missing ${id}/${record.id}/${lang}`);
        assert.ok(html.includes(escape(record.source_scope[lang])),`Source status missing ${id}/${record.id}/${lang}`);
        assert.ok(html.includes(record.source_url),`Source link missing ${id}/${record.id}/${lang}`);
      }
    }
  }
  assert.deepEqual({ninthNotes,ninthKathir,ninthTabari,ninthVerses},
    {ninthNotes:32,ninthKathir:16,ninthTabari:16,ninthVerses:2});
  const kabir = depthIX.profiles['PDF-HN-100'].evidence.find(e=>e.source_reference.includes('13:9'));
  assert.ok(kabir?.arabic_original.includes('الْكَبِيرُ الْمُتَعَالِ'));
  const qadir = depthIX.profiles['PDF-HN-104'].evidence.find(e=>e.source_reference.includes('6:65'));
  assert.ok(qadir?.arabic_original.includes('هُوَ الْقَادِرُ'));
  assert.ok(depthIX.profiles['PDF-HN-041'].scholarly.some(e=>e.translation.en.includes('reckoning')));
  assert.ok(depthIX.profiles['PDF-HN-103'].scholarly.some(e=>e.translation.en.includes('both attested readings')));
  assert.ok(depthIX.profiles['PDF-HN-096'].scholarly.some(e=>e.translation.en.includes('plural')));
  console.log('PASS: 150 unique deeply studied Holy Names, 32 new Arabic tafsir notes, two exact-name Quran verses, both-language reader rendering.');

  // Final tenth source-critical pass: all 160 card IDs now have one deep layer.
  const depthX=JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTafsirDepthX.json','utf8'));
  const xIds=Object.keys(depthX.profiles);
  assert.equal(xIds.length,10);
  const studiedAll=[...researchedIX,...xIds];
  assert.equal(studiedAll.length,160);
  assert.equal(new Set(studiedAll).size,160,'No repeated IDs permitted across all ten tafsir layers.');
  assert.equal(new Set(studiedAll.filter(id=>coveredIds.has(id))).size,160);
  let tenthNotes=0,tenthKathir=0,tenthTabari=0;
  const tenthSourceIds=new Set();
  for(const [id,p] of Object.entries(depthX.profiles)){
    assert.equal(p.name_id,id);
    assert.equal(p.scholarly.length,2);
    for(const item of p.scholarly){
      tenthNotes++;
      if(item.source_url.includes('/katheer/'))tenthKathir++;
      if(item.source_url.includes('/tabary/'))tenthTabari++;
      assert.ok(!tenthSourceIds.has(item.id),`Duplicate tenth record ID: ${item.id}`);
      tenthSourceIds.add(item.id);
      assert.equal(item.review_status,'checked_against_digital_text');
      assert.ok(item.arabic_original?.length>=10);
      assert.ok(item.translation?.ml&&item.translation?.en);
      assert.ok(item.source_scope?.ml&&item.source_scope?.en);
      assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/(katheer|tabary)\/sura\d+-aya\d+\.html$/.test(item.source_url));
      assert.ok(!item.count&&!item.timing&&!item.steps,'Tafsir must not fabricate ritual methods.');
    }
    for(const lang of ['ml','en']){
      const html=render(null,id,lang,{pdf_name_id:id});
      assert.ok(html.includes('data-section-b-group="scholarly"'));
      for(const item of p.scholarly){
        assert.ok(html.includes(escape(item.arabic_original)),`Original Arabic missing ${id}/${item.id}/${lang}`);
        assert.ok(html.includes(escape(item.translation[lang])),`Meaning missing ${id}/${item.id}/${lang}`);
        assert.ok(html.includes(escape(item.source_scope[lang])),`Attribution missing ${id}/${item.id}/${lang}`);
        assert.ok(html.includes(item.source_url),`Source link missing ${id}/${item.id}/${lang}`);
      }
    }
  }
  assert.deepEqual({tenthNotes,tenthKathir,tenthTabari},{tenthNotes:20,tenthKathir:10,tenthTabari:10});
  assert.ok(depthX.profiles['PDF-HN-110'].scholarly.some(e=>e.translation.en.includes('nominative')));
  assert.ok(depthX.profiles['PDF-HN-123'].scholarly.some(e=>e.translation.en.includes('al-Akram')));
  assert.ok(depthX.profiles['PDF-HN-136'].scholarly.some(e=>e.translation.en.includes('not an isolated Divine Name')));
  const disaster=prophetic.entries.find(e=>e.id==='hadith-muslim-918a-calamity-full-istirja');
  assert.ok(disaster?.arabic_original.includes('اللَّهُمَّ أْجُرْنِي'));
  assert.ok(disaster.source_url.includes('muslim:918a'));
  assert.ok(disaster.count.en.includes('no numerical repeat count'));
  assert.deepEqual(disaster.name_ids,['PDF-HN-136']);
  for(const lang of ['ml','en']){
    const html=render(null,'PDF-HN-136',lang,{pdf_name_id:'PDF-HN-136'});
    assert.ok(html.includes(escape(disaster.arabic_original)));
    assert.ok(html.includes(escape(disaster.translation[lang])));
    assert.ok(html.includes(disaster.source_url));
  }
  console.log('PASS: all 160 individually researched card IDs now have deep tafsir overlays; 20 further original Arabic excerpts plus the authentic Sahih Muslim 918a calamity dua.');
  // Additive seven-record complete Quranic prayer set: full Arabic, bilingual meanings, exact linked cards, and no fabricated rites.
  const topicalII = JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTopicalDuasII.json', 'utf8'));
  assert.equal(topicalII.topics.length, 7, 'Seven new fully source-linked Quranic prayers required.');
  const oldTopicIds = new Set(topical.topics.map(entry => entry.id));
  const freshTopicIds = new Set();
  const checkedQuranVerses = ['20:114', '21:89', '2:127', '3:38', '23:97', '23:98', '7:126', '7:89'];
  let attachedCount = 0;
  for (const entry of topicalII.topics) {
    assert.ok(!oldTopicIds.has(entry.id) && !freshTopicIds.has(entry.id), 'A new prayer must not overwrite an earlier prayer.');
    freshTopicIds.add(entry.id);
    assert.ok(entry.name_ids.length && entry.name_ids.every(id => coveredIds.has(id)));
    assert.equal(entry.review_status, 'checked_against_digital_text');
    assert.ok(entry.arabic_original.length >= 40 && entry.translation.ml && entry.translation.en);
    assert.ok(entry.source_scope.ml && entry.source_scope.en && entry.claim_kind);
    assert.ok(entry.count.ml && entry.count.en && entry.timing.ml && entry.timing.en && entry.conditions.ml && entry.conditions.en);
    assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/katheer\/sura[0-9]+-aya[0-9]+\.html$/.test(entry.source_url));
    for (const id of entry.name_ids) {
      attachedCount++;
      for (const lang of ['ml', 'en']) {
        const html = render(null, id, lang, { pdf_name_id: id });
        assert.ok(html.includes(escape(entry.arabic_original)), 'Original full Arabic missing on ' + id + ' / ' + lang);
        assert.ok(html.includes(escape(entry.translation[lang])), 'Full-verse meaning missing on ' + id + ' / ' + lang);
        assert.ok(html.includes(escape(entry.count[lang])), 'Count caveat missing on ' + id + ' / ' + lang);
        assert.ok(html.includes(escape(entry.timing[lang])), 'Timing caveat missing on ' + id + ' / ' + lang);
        assert.ok(html.includes(escape(entry.conditions[lang])), 'Methods caveat missing on ' + id + ' / ' + lang);
        assert.ok(html.includes(entry.source_url), 'Source link missing on ' + id + ' / ' + lang);
      }
    }
  }
  assert.equal(attachedCount, 11, 'Seven Quranic supplications must appear at eleven card connections.');
  const refuge = topicalII.topics.find(entry => entry.id === 'quran-23-97-98-seek-refuge');
  assert.ok(refuge.arabic_original.includes('\n'), 'Both entire Quran 23:97 and 23:98 must be retained.');
  assert.deepEqual(refuge.references.map(entry => entry.page), ['23:97', '23:98']);
  const zakariya = topicalII.topics.find(entry => entry.id === 'quran-21-89-zakariya-heir');
  assert.ok(zakariya.arabic_original.includes('خَيْرُ الْوَارِثِينَ'));
  const accepting = topicalII.topics.find(entry => entry.id === 'quran-2-127-ibrahim-ismail-accept');
  assert.ok(accepting.arabic_original.includes('السَّمِيعُ الْعَلِيمُ'));
  const patients = topicalII.topics.find(entry => entry.id === 'quran-7-126-patience-magicians');
  assert.ok(patients.translation.en.includes('Pharaoh') && patients.translation.ml.includes('ഫിർഔനി'));
  assert.equal(checkedQuranVerses.length, 8);
  console.log('PASS: seven full Quranic prayer records, eight complete verses and eleven card links in two languages.');

  // Third additive Quranic prayer layer: exact whole verses, bilingual display and twenty safe card links.
  const topicalIII=JSON.parse(fs.readFileSync('src/data/holyNamesSectionBTopicalDuasIII.json','utf8'));
  assert.equal(topicalIII.topics.length,10,'The third layer should contain ten independent Quranic records.');
  const earlierIds=new Set([...topical.topics,...topicalII.topics].map(item=>item.id));
  const currentIds=new Set();
  let thirdLinks=0;
  for(const item of topicalIII.topics){
    assert.ok(!earlierIds.has(item.id)&&!currentIds.has(item.id),'Duplicate Quranic prayer record: ' + item.id);
    currentIds.add(item.id);
    assert.equal(item.review_status,'checked_against_digital_text');
    assert.ok(item.claim_kind && item.source_scope.ml && item.source_scope.en);
    assert.ok(item.arabic_original.length>=35 && !item.arabic_original.includes('...'),'Full Arabic passage must remain verbatim.');
    assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/(katheer|qortobi)\/sura[0-9]+-aya[0-9]+\.html$/.test(item.source_url));
    assert.ok(item.name_ids.length > 0);
    for(const id of item.name_ids){
      assert.ok(coveredIds.has(id),'Unknown card linked by ' + item.id + ': ' + id);
      thirdLinks++;
      for(const lang of ['ml','en']){
        const html=render(chapters[id],id,lang,{pdf_name_id:id});
        for(const phrase of [item.arabic_original,item.translation[lang],item.source_scope[lang],item.count[lang],item.timing[lang],item.conditions[lang],item.source_url]) {
          assert.ok(html.includes(escape(phrase)),'Missing sourced Quran record ' + item.id + ' in ' + id + '/' + lang);
        }
      }
    }
  }
  assert.equal(thirdLinks,20,'Ten new Quranic records must connect to twenty card views.');
  assert.equal(23+topicalII.topics.length+topicalIII.topics.length,40,'Preserve all forty Quranic prayer records.');
  const byThirdId=id=>topicalIII.topics.find(x=>x.id===id);
  assert.ok(byThirdId('quran-2-128-submission-and-repentance').arabic_original.includes('التَّوَّابُ الرَّحِيمُ'));
  assert.ok(byThirdId('quran-28-16-musa-forgiveness').arabic_original.includes('الْغَفُورُ الرَّحِيمُ'));
  assert.ok(byThirdId('quran-21-112-truthful-judgment').arabic_original.includes('الرَّحْمَٰنُ'));
  assert.ok(byThirdId('quran-17-80-truthful-entry-exit').translation.en.includes('Nasiran'));
  assert.ok(byThirdId('quran-27-19-sulayman-gratitude').translation.en.includes('Ashkura'));
  assert.ok(byThirdId('quran-14-41-ibrahim-forgiveness').translation.en.includes('9:114'));
  assert.ok(byThirdId('quran-3-147-steadfastness-and-repentance').translation.en.includes('historical'));
  console.log('PASS: ten whole Quran verses, twenty name-card links, and all forty topical Quran prayer records in both languages.');

  // Historical khawass: expose all 91 existing scan-labelled Arabic passages across distinct matching card IDs.
  const historical=JSON.parse(fs.readFileSync('src/data/holyNamesShamsBrief.json','utf8'));
  const bridge=JSON.parse(fs.readFileSync('src/data/holyNamesShamsCardBridge.json','utf8'));
  const historicalPairs=Object.entries(bridge.identity_map);
  assert.equal(Object.keys(historical.accounts).length,91,'Source has 91 separate Shams passages.');
  assert.equal(historicalPairs.length,91,'Every historical passage must be assigned to a name card.');
  assert.equal(new Set(historicalPairs.map(([,id])=>id)).size,91,'Do not merge two distinct source names into one card.');
  assert.equal(Object.keys(bridge.translations).length,73,'Translate all 73 previously untranslated historical Arabic accounts.');
  assert.ok(bridge.source_edition_note.ml&&bridge.source_edition_note.en&&bridge.review_note.ml&&bridge.review_note.en);
  assert.ok(bridge.source_edition_url.includes('archive.org/details/'));
  const historicalChecked=new Set();
  for(const [accountId,id] of historicalPairs){
    assert.ok(coveredIds.has(id),'Mapped historical record to unrecognized card: '+id);
    const entry=historical.accounts[accountId];
    assert.ok(entry,'Missing original historical account '+accountId);
    assert.equal(entry.review_status,'checked_against_scan');
    assert.ok(entry.arabic_original.length>24,'Do not replace full source sentence with a summary.');
    assert.ok(['67','68','69','70'].includes(entry.source_page),'Expected printed page 67-70');
    const translated=entry.translation||bridge.translations[accountId];
    assert.ok(translated?.ml&&translated?.en,'Missing Malayalam/English for '+accountId);
    assert.ok(entry.count?.ml&&entry.count?.en&&entry.timing?.ml&&entry.timing?.en);
    assert.ok(entry.conditions?.ml&&entry.conditions?.en,'Every source needs its genuine conditions or their absence.');
    historicalChecked.add(accountId);
    for(const lang of ['ml','en']){
      const html=render(chapters[id]||null,id,lang,{pdf_name_id:id});
      assert.ok(html.includes('data-section-b-group="shams"'),'Historical book section missing for '+id+'/'+lang);
      for(const value of [entry.arabic_original,translated[lang],entry.count[lang],entry.timing[lang],entry.conditions[lang],bridge.source_edition_note[lang],bridge.review_note[lang]]){
        assert.ok(html.includes(escape(value)),'Historical Arabic, note or translation absent for '+accountId+'/'+lang);
      }
      assert.ok(html.includes(bridge.source_edition_url),'Historical scan source absent for '+accountId);
      assert.ok(html.includes('https://ablibrary.net/book_content/b/10942/'+entry.source_page),'Secondary text for page missing '+accountId);
    }
  }
  assert.equal(historicalChecked.size,91);
  assert.equal(91-Object.keys(bridge.translations).length,18,'Existing 18 detailed translations must remain intact.');
  console.log('PASS: 91 full Shams source Arabic accounts visible across 91 correct cards, 73 new bilingual translations and 18 preserved earlier translations.');

  // Digital-edition collation retains both readings without overwriting the scan-labelled Arabic.
  const digitalVariants=JSON.parse(fs.readFileSync('src/data/holyNamesShamsEditionVariants.json','utf8'));
  const historicCounts=JSON.parse(fs.readFileSync('src/data/holyNamesShamsCountAudit.json','utf8'));
  assert.equal(Object.keys(digitalVariants.entries).length,9);
  assert.equal(Object.values(digitalVariants.entries).reduce((n,entry)=>n+entry.variants.length,0),11);
  assert.equal(Object.keys(historicCounts.entries).length,5);
  for(const [id,entry] of Object.entries(digitalVariants.entries)){
    assert.equal(entry.account_id,id);
    assert.ok(historical.accounts[id] && bridge.identity_map[id]);
    assert.ok(entry.compared_source_url.startsWith('https://ablibrary.net/book_content/b/10942/'));
    assert.equal(entry.review_status,'secondary_digital_text_compared');
    const original=historical.accounts[id].arabic_original;
    for(const pair of entry.variants){
      assert.ok(original.includes(pair.stored_phrase),'The quoted reading must match stored source: '+id);
      assert.ok(pair.alternative_phrase && pair.note.ml && pair.note.en);
    }
    for(const lang of ['ml','en']){
      const cardId=bridge.identity_map[id];
      const html=render(chapters[cardId]||null,cardId,lang,{pdf_name_id:cardId});
      for(const pair of entry.variants) for(const phrase of [pair.stored_phrase,pair.alternative_phrase,pair.note[lang]]){
        assert.ok(html.includes(escape(phrase)),'Missing side-by-side edition variant '+id+'/'+lang);
      }
      assert.ok(html.includes(entry.compared_source_url),'Variant link missing '+id);
      assert.ok(html.includes(escape(digitalVariants.scope[lang])),'Must disclose limited edition comparison');
    }
  }
  let oralNumber=0,writtenNumber=0;
  const auditedValues=[];
  for(const [id,count] of Object.entries(historicCounts.entries)){
    assert.equal(count.card_id,bridge.identity_map[id],'Count proof must never appear in a different name card');
    assert.ok(historical.accounts[id].arabic_original.includes(count.source_phrase),'Number must be grounded in original Arabic');
    assert.ok(Number.isInteger(count.value)&&count.value>0);
    assert.ok(['recitation','inscription'].includes(count.unit));
    if(count.unit==='recitation') oralNumber++; else writtenNumber++;
    auditedValues.push(count.value);
    for(const lang of ['ml','en']){
      const html=render(chapters[count.card_id]||null,count.card_id,lang,{pdf_name_id:count.card_id});
      assert.ok(html.includes(escape(count.source_phrase)),'Missing original numeric wording '+id+'/'+lang);
      assert.ok(html.includes(escape(count.note[lang])),'Missing count unit caveat '+id+'/'+lang);
    }
  }
  assert.deepEqual([oralNumber,writtenNumber],[1,4]);
  assert.deepEqual(auditedValues.sort((a,b)=>a-b),[5,100,120,161,1132]);
  console.log('PASS: 11 source variants shown across 9 name cards, five original numbered book passages parsed as 1 recitation and 4 inscriptions.');

  // Real search projection must index both source-edition readings and the exact kind of count.
  for (const [id,row] of Object.entries(digitalVariants.entries)) {
    const item={...historical.accounts[id], title:{ml:id,en:id}, edition_variants:row,
      count_evidence:historicCounts.entries[id] || null, source_reference:bridge.source_reference};
    for (const lang of ['ml','en']) {
      const searchable=sectionBEntrySearchText(item,lang,'Historical name chapter');
      assert.ok(searchable.includes('historical name chapter'));
      for (const variant of row.variants) {
        assert.ok(searchable.includes(variant.stored_phrase.toLocaleLowerCase()), 'Original reading not searchable: '+id);
        assert.ok(searchable.includes(variant.alternative_phrase.toLocaleLowerCase()), 'Alternative reading not searchable: '+id);
        assert.ok(searchable.includes(variant.note[lang].toLocaleLowerCase()), 'Variant explanation not searchable: '+id+'/'+lang);
      }
    }
  }
  for (const [id,count] of Object.entries(historicCounts.entries)) {
    const item={...historical.accounts[id], title:{ml:id,en:id}, count_evidence:count};
    for (const lang of ['ml','en']) {
      const text=sectionBEntrySearchText(item,lang);
      assert.ok(text.includes(String(count.value)),'Printed number not searchable: '+id);
      assert.ok(text.includes(count.source_phrase.toLocaleLowerCase()),'Source wording not searchable: '+id);
      assert.ok(text.includes(count.note[lang].toLocaleLowerCase()),'Count category not searchable: '+id+'/'+lang);
    }
  }
  console.log('PASS: Arabic source variants, bilingual variant notes, and five historical recitation/inscription counts are searchable.');

  // First encyclopedia-depth card: thirty full Quranic passages, 33 verses and fifteen source-attributed tafsir distinctions.
  const encyclopaedia=JSON.parse(fs.readFileSync('src/data/holyNamesSectionBEncyclopediaI.json','utf8'));
  const rahmanId='PDF-HN-001';
  const deepRahman=encyclopaedia.profiles[rahmanId];
  assert.ok(deepRahman && Object.keys(encyclopaedia.profiles).length===2,'Encyclopedia must retain al-Rahman and add al-Rahim, without placeholders.');
  assert.equal(deepRahman.evidence.length,30,'First deep card should contain thirty complete Quran passages.');
  assert.equal(deepRahman.scholarly.length,15,'Fifteen distinct scholarly notes must be preserved.');
  assert.equal(new Set([...deepRahman.evidence,...deepRahman.scholarly].map(x=>x.id)).size,45);
  const originalRahmanIds=new Set(research[rahmanId].evidence.map(x=>x.id));
  const corpusIds=new Set();
  const verseRefs=new Set();
  for(const entry of deepRahman.evidence){
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.equal(entry.claim_kind,'direct_quran_name_context');
    assert.ok(entry.arabic_original && entry.verse_meaning.ml && entry.verse_meaning.en);
    assert.ok(entry.translation.ml && entry.translation.en && entry.source_scope.ml && entry.source_scope.en);
    assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/katheer\/sura[0-9]+-aya[0-9]+\.html$/.test(entry.source_url));
    assert.ok(entry.arabic_original.replace(/[\u064B-\u065F\u0670]/g,'').includes('رحمن'),'Quran passage must directly contain the name: '+entry.id);
    const verseRef=entry.source_reference.match(/Quran (\d+:\d+(?:-\d+)?)/)?.[1];
    assert.ok(verseRef && !verseRefs.has(verseRef),'Each Quran entry needs a unique complete verse/passage reference.');
    assert.ok(!['1:3','17:110','59:22'].includes(verseRef),'Do not republish pre-existing direct-name verse: '+verseRef);
    verseRefs.add(verseRef);
    assert.ok(!originalRahmanIds.has(entry.id));
    assert.ok(!corpusIds.has(entry.id));corpusIds.add(entry.id);
    for(const lang of ['ml','en']){
      const html=render(chapters[rahmanId],rahmanId,lang,{pdf_name_id:rahmanId});
      for(const textValue of [entry.arabic_original,entry.verse_meaning[lang],entry.translation[lang],entry.source_scope[lang]]) {
        assert.ok(html.includes(escape(textValue)),'Missing full bilingual Quran passage '+verseRef+' '+lang);
      }
      assert.ok(html.includes(entry.source_url),'Missing primary Quran/tafsir source '+verseRef);
      assert.ok(sectionBEntrySearchText(entry,lang).includes(entry.verse_meaning[lang].toLocaleLowerCase()),'Full verse meaning not searchable '+verseRef);
    }
  }
  const surah55=deepRahman.evidence.find(x=>x.source_reference.includes('Quran 55:1-4'));
  assert.ok(surah55 && surah55.arabic_original.split('\n').length===4,'The four opening ayat must appear without truncation.');
  for(const entry of deepRahman.scholarly){
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.equal(entry.claim_kind,'attributed_scholarly_tafsir');
    assert.ok(/\/tafseer\/(katheer|qortobi|tabary)\//.test(entry.source_url));
    assert.ok(entry.arabic_original.length>=8 && entry.arabic_original.length<=100);
    assert.ok(!corpusIds.has(entry.id),'Scholarly ID repeated: '+entry.id);corpusIds.add(entry.id);
    for(const lang of ['ml','en']){
      const html=render(chapters[rahmanId],rahmanId,lang,{pdf_name_id:rahmanId});
      assert.ok(html.includes(escape(entry.arabic_original)) && html.includes(escape(entry.translation[lang])));
      assert.ok(html.includes(entry.source_url),'Tafsir citation absent '+entry.id);
    }
  }
  assert.ok(deepRahman.scholarly.some(x=>x.translation.en.includes('takyif')));
  assert.ok(deepRahman.scholarly.some(x=>x.translation.en.includes('gharib')));
  assert.ok(deepRahman.scholarly.some(x=>x.translation.en.includes('rather than securely Prophetic')));
  // This first deep expansion may not leak into a separate card's title, source section or Arabic verses.
  for(const id of ['PDF-HN-002','PDF-HN-003','PDF-HN-101']){
    const html=render(chapters[id]||null,id,'en',{pdf_name_id:id});
    assert.ok(!html.includes('encyclopedia-rahman-19-18'),'Names must be isolated.');
  }
  console.log('PASS: al-Rahman receives 30 complete Quran passages (33 ayat) and 15 additional source-attributed tafsir studies in both languages, with no cross-card leakage.');

  // Second true encyclopedia-depth card: distinguish exact Divine Names from descriptive Rahim epithets.
  const rahimId='PDF-HN-002';
  const deepRahim=encyclopaedia.profiles[rahimId];
  assert.ok(deepRahim && deepRahim.name_id===rahimId);
  assert.equal(deepRahim.evidence.length,24,'Second card must have 24 individually sourced complete Quran verses.');
  assert.equal(deepRahim.scholarly.length,20,'Second card must preserve 20 distinct source-based tafsir studies.');
  assert.equal(new Set([...deepRahim.evidence,...deepRahim.scholarly].map(x=>x.id)).size,44);
  const rahimExistingVerses=new Set(['1:3','33:43','59:22','2:128','28:16','59:10']);
  const rahimVerses=new Set();
  let definiteNames=0,descriptiveEpithets=0;
  const stripVowels=text=>text.normalize('NFKD').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'').replace(/\u0640/g,'');
  for(const entry of deepRahim.evidence){
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.equal(entry.claim_kind,'quran_explicit_rahim_form');
    assert.ok(stripVowels(entry.arabic_original).includes('رحيم'),'Direct Rahim epithet missing: '+entry.id);
    assert.ok(entry.arabic_original.length>30 && !entry.arabic_original.includes('...'));
    assert.ok(entry.verse_meaning.ml && entry.verse_meaning.en && entry.translation.ml && entry.translation.en);
    assert.ok(entry.source_scope.ml && entry.source_scope.en);
    assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/katheer\/sura\d+-aya\d+\.html$/.test(entry.source_url));
    const ref=entry.source_reference.match(/Quran (\d+:\d+)/)?.[1];
    assert.ok(ref && !rahimExistingVerses.has(ref) && !rahimVerses.has(ref),'Unexpected duplicate: '+ref);
    rahimVerses.add(ref);
    if(entry.name_occurrence_kind==='definite_name')definiteNames++;
    else if(entry.name_occurrence_kind==='descriptive_epithet')descriptiveEpithets++;
    else assert.fail('Unspecified grammar form: '+entry.id);
    for(const lang of ['ml','en']){
      const html=render(chapters[rahimId],rahimId,lang,{pdf_name_id:rahimId});
      for(const field of [entry.arabic_original,entry.verse_meaning[lang],entry.translation[lang],entry.source_scope[lang]]){
        assert.ok(html.includes(escape(field)),'Missing Quran source text or meaning '+entry.id+'/'+lang);
      }
      assert.ok(html.includes(entry.source_url),'Missing tafsir link '+entry.id);
      assert.ok(sectionBEntrySearchText(entry,lang).includes(entry.verse_meaning[lang].toLocaleLowerCase()));
    }
  }
  assert.equal(definiteNames+descriptiveEpithets,24);
  assert.ok(definiteNames>=6 && descriptiveEpithets>=10);
  const scholarSources=new Set();
  for(const entry of deepRahim.scholarly){
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.equal(entry.claim_kind,'attributed_scholarly_exegesis');
    assert.ok(/\/tafseer\/(katheer|qortobi|tabary)\//.test(entry.source_url));
    assert.ok(entry.arabic_original && entry.translation.ml && entry.translation.en);
    const sourceMatch=entry.source_url.match(/\/tafseer\/(katheer|qortobi|tabary)\//);
    scholarSources.add(sourceMatch[1]);
    for(const lang of ['ml','en']){
      const html=render(chapters[rahimId],rahimId,lang,{pdf_name_id:rahimId});
      assert.ok(html.includes(escape(entry.arabic_original)),'Missing Arabic scholarly quote '+entry.id+'/'+lang);
      assert.ok(html.includes(escape(entry.translation[lang])),'Missing scholarly translation '+entry.id+'/'+lang);
      assert.ok(html.includes(entry.source_url),'Missing source citation '+entry.id);
    }
  }
  assert.deepEqual([...scholarSources].sort(),['katheer','qortobi','tabary']);
  assert.ok(deepRahim.evidence.find(x=>x.source_reference.includes('Quran 2:54')).translation.en.includes('not an instruction'));
  assert.ok(deepRahim.evidence.find(x=>x.source_reference.includes('Quran 4:64')).translation.en.includes('not itself an authenticated hadith'));
  assert.ok(deepRahim.evidence.find(x=>x.source_reference.includes('Quran 39:53')).translation.en.includes('repentance'));
  const firstCardEn=render(chapters[rahmanId],rahmanId,'en',{pdf_name_id:rahmanId});
  assert.ok(!firstCardEn.includes(escape(deepRahim.evidence[0].arabic_original)),'Second encyclopedia card spilled onto the first.');
  console.log('PASS: al-Rahim has 24 whole Arabic Quran verses, 20 attributed tafsir studies, bilingual context, grammar distinction and source independence.');

  // Third source-backed encyclopedia card: al-Malik, not a duplicate of the existing nine scanned Tilimsani sections.
  const encyclopaediaII=JSON.parse(fs.readFileSync('src/data/holyNamesSectionBEncyclopediaII.json','utf8'));
  const malikId='PDF-HN-003';
  const deepMalik=encyclopaediaII.profiles[malikId];
  assert.equal(Object.keys(encyclopaediaII.profiles).length,1,'Second encyclopedia overlay should add only card 003.');
  assert.ok(deepMalik && deepMalik.name_id===malikId);
  assert.equal(deepMalik.evidence.length,24,'Twenty-four complete Quran passage groups expected.');
  assert.equal(deepMalik.evidence.reduce((sum,entry)=>sum+entry.verse_count,0),29,'Twenty-nine whole ayat, including the six of al-Nas.');
  assert.equal(deepMalik.scholarly.length,19,'Nineteen original scholarly notes expected.');
  assert.equal(chapters[malikId].practices.length,9,'Nine earlier Tilimsani paragraphs must remain intact.');
  const malikIds=new Set();
  const malikReferences=new Set();
  const byMalikRef=new Map();
  const malikLanguages=['ml','en'];
  for(const entry of deepMalik.evidence){
    assert.ok(!malikIds.has(entry.id),'No duplicate Quran record: '+entry.id);malikIds.add(entry.id);
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.ok(entry.claim_kind && entry.source_scope.ml && entry.source_scope.en);
    assert.ok(entry.arabic_original.length>=15 && entry.verse_meaning.ml && entry.verse_meaning.en);
    assert.ok(entry.translation.ml && entry.translation.en);
    assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/katheer\/sura[0-9]+-aya[0-9]+\.html$/.test(entry.source_url));
    const verse=entry.source_reference.match(/Quran (\d+:\d+(?:-\d+)?)/)?.[1];
    assert.ok(verse&&!malikReferences.has(verse),'Quran references must be distinct: '+entry.id);
    malikReferences.add(verse);byMalikRef.set(verse,entry);
    for(const lang of malikLanguages){
      const html=render(chapters[malikId],malikId,lang,{pdf_name_id:malikId});
      for(const phrase of [entry.arabic_original,entry.verse_meaning[lang],entry.translation[lang],entry.source_scope[lang]]) {
        assert.ok(html.includes(escape(phrase)), 'Incomplete original/meaning/context '+entry.id+'/'+lang);
      }
      assert.ok(html.includes(entry.source_url),'Tafsir citation missing for '+entry.id);
      assert.ok(sectionBEntrySearchText(entry,lang).includes(entry.verse_meaning[lang].toLocaleLowerCase()),'Full verse meaning missing from search.');
    }
  }
  assert.equal(byMalikRef.get('1:4')?.claim_kind,'canonical_qiraat_malik_maalik');
  assert.equal(byMalikRef.get('3:26')?.claim_kind,'divine_owner_of_dominion_invocation');
  assert.equal(byMalikRef.get('23:116')?.claim_kind,'explicit_divine_name');
  assert.equal(byMalikRef.get('62:1')?.claim_kind,'explicit_divine_name');
  assert.equal(byMalikRef.get('54:55')?.claim_kind,'related_divine_epithet');
  assert.equal(byMalikRef.get('2:247')?.claim_kind,'human_kingship_comparison');
  assert.equal(byMalikRef.get('2:258')?.claim_kind,'human_kingship_comparison');
  assert.equal(byMalikRef.get('38:35')?.claim_kind,'prophetic_prayer_human_dominion');
  assert.ok(byMalikRef.get('20:114')?.arabic_original.includes('رَّبِّ زِدْنِي عِلْمًا'),'Previously clipped verse 20:114 must be completed.');
  assert.equal(byMalikRef.get('114:1-6')?.arabic_original.split('\n').length,6,'Retain all six full surah al-Nas verses.');
  assert.ok(byMalikRef.get('12:101')?.translation.en.includes('death'));
  const scholarKinds=new Set();
  for(const entry of deepMalik.scholarly){
    assert.ok(!malikIds.has(entry.id),'Tafsir record repeated '+entry.id);malikIds.add(entry.id);
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.equal(entry.claim_kind,'attributed_scholarly_tafsir');
    assert.ok(entry.arabic_original.length>=12 && entry.translation.ml && entry.translation.en);
    assert.ok(/\/tafseer\/(katheer|qortobi|tabary)\//.test(entry.source_url));
    scholarKinds.add(entry.source_url.match(/\/tafseer\/([^/]+)\//)[1]);
    for(const lang of malikLanguages){
      const html=render(chapters[malikId],malikId,lang,{pdf_name_id:malikId});
      assert.ok(html.includes(escape(entry.arabic_original))&&html.includes(escape(entry.translation[lang])));
      assert.ok(html.includes(entry.source_url),'Study citation missing '+entry.id);
    }
  }
  assert.deepEqual([...scholarKinds].sort(),['katheer','qortobi','tabary']);
  for(const lang of malikLanguages){
    const html=render(chapters[malikId],malikId,lang,{pdf_name_id:malikId});
    for(const paragraph of chapters[malikId].practices){
      assert.ok(html.includes(escape(paragraph.arabic_original)),'Tilimsani original was removed.');
      assert.ok(html.includes(escape(paragraph.translation[lang])),'Tilimsani translation was removed.');
    }
    assert.ok(html.includes(escape(encyclopaediaII.scope[lang])),'No caution about incomplete manuscript research.');
  }
  for(const otherId of ['PDF-HN-001','PDF-HN-002','PDF-HN-004']){
    const html=render(chapters[otherId]||null,otherId,'en',{pdf_name_id:otherId});
    assert.ok(!html.includes(deepMalik.evidence[0].id),'New al-Malik evidence may not leak across cards.');
  }
  console.log('PASS: card 003 al-Malik has 24 Quran passage groups (29 full verses), 19 source-checked tafsir studies and all nine existing Tilimsani originals in both languages.');

  // Fourth encyclopedia card: preserve the two actual Quranic occurrences of al-Quddus and clearly mark everything else thematic.
  const encyclopaediaIII=JSON.parse(fs.readFileSync('src/data/holyNamesSectionBEncyclopediaIII.json','utf8'));
  const quddusId='PDF-HN-004';
  const deepQuddus=encyclopaediaIII.profiles[quddusId];
  assert.deepEqual(Object.keys(encyclopaediaIII.profiles),[quddusId],'No empty placeholder profiles in the fourth-card overlay.');
  assert.equal(deepQuddus.evidence.length,19,'Nineteen complete themed Quran passage groups are required.');
  assert.equal(deepQuddus.evidence.reduce((sum,entry)=>sum+entry.verse_count,0),23,'Twenty-three complete Quran verses across nineteen passage groups.');
  assert.equal(deepQuddus.scholarly.length,16,'Sixteen separate scholarly readings required.');
  assert.equal(new Set([...deepQuddus.evidence,...deepQuddus.scholarly].map(x=>x.id)).size,35);
  const quddusOriginalQuran=research[quddusId].evidence.map(x=>x.source_reference);
  assert.ok(quddusOriginalQuran.includes('Quran 59:23')&&quddusOriginalQuran.includes('Quran 62:1'),'The TWO direct-name verses remain.');
  const quddusRefs=new Set();
  for(const entry of deepQuddus.evidence){
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.equal(entry.relationship,'thematic_not_direct_name','Do not promote a purity theme to an exact Name occurrence.');
    assert.ok(entry.claim_kind && entry.verse_meaning.ml && entry.verse_meaning.en && entry.translation.ml && entry.translation.en);
    assert.ok(entry.source_scope.ml && entry.source_scope.en);
    assert.ok(entry.arabic_original.length>15 && entry.source_reference.startsWith('Quran '));
    const verseRef=entry.source_reference.match(/Quran (\d+:\d+(?:-\d+)?)/)?.[1];
    assert.ok(verseRef && !quddusRefs.has(verseRef),'Full Quran references must be unique '+entry.id);
    assert.ok(!quddusOriginalQuran.includes('Quran '+verseRef),'Do not duplicate existing direct verses');
    quddusRefs.add(verseRef);
    assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/katheer\/sura\d+-aya\d+\.html$/.test(entry.source_url));
    for(const lang of ['ml','en']){
      const html=render(chapters[quddusId]||null,quddusId,lang,{pdf_name_id:quddusId});
      for(const item of [entry.arabic_original,entry.verse_meaning[lang],entry.translation[lang],entry.source_scope[lang]]){
        assert.ok(html.includes(escape(item)),'Arabic/full contextual meaning missing: '+verseRef+'/'+lang);
      }
      assert.ok(html.includes(entry.source_url),'Quran source url missing: '+verseRef);
      assert.ok(sectionBEntrySearchText(entry,lang).includes(entry.verse_meaning[lang].toLocaleLowerCase()),'Quran verse meaning must be searchable');
    }
  }
  assert.equal(deepQuddus.evidence.find(x=>x.source_reference.includes('Quran 2:30'))?.claim_kind,'related_root_verb');
  assert.equal(deepQuddus.evidence.find(x=>x.source_reference.includes('Quran 42:11'))?.claim_kind,'incomparability');
  const ikhlas=deepQuddus.evidence.find(x=>x.source_reference.includes('Quran 112:1-4'));
  assert.equal(ikhlas?.arabic_original.split('\n').length,4,'Keep all four whole verses of al-Ikhlas.');
  const dailyTasbih=deepQuddus.evidence.find(x=>x.source_reference.includes('Quran 30:17-18'));
  assert.equal(dailyTasbih?.arabic_original.split('\n').length,2,'Keep both verses with morning/evening mentions.');
  const scholars=new Set();
  for(const entry of deepQuddus.scholarly){
    assert.equal(entry.claim_kind,'attributed_scholarly_tafsir');
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.ok(entry.arabic_original.length>=12&&entry.translation.ml&&entry.translation.en);
    assert.ok(/\/tafseer\/(katheer|qortobi|tabary)\//.test(entry.source_url));
    scholars.add(entry.source_url.match(/\/tafseer\/(katheer|qortobi|tabary)\//)[1]);
    for(const lang of ['ml','en']){
      const html=render(chapters[quddusId]||null,quddusId,lang,{pdf_name_id:quddusId});
      assert.ok(html.includes(escape(entry.arabic_original)),'Arabic original scholarly quote missing');
      assert.ok(html.includes(escape(entry.translation[lang])),'Bilingual tafsir meaning missing');
      assert.ok(html.includes(entry.source_url),'Exact tafsir study link missing');
    }
  }
  assert.deepEqual([...scholars].sort(),['katheer','qortobi','tabary']);
  assert.ok(deepQuddus.scholarly.some(x=>x.translation.en.includes('objectionable Isra')));
  assert.ok(deepQuddus.scholarly.some(x=>x.translation.en.includes('fathah')));
  assert.ok(deepQuddus.scholarly.some(x=>x.translation.en.includes('weak')));
  for(const lang of ['ml','en']){
    const html=render(chapters[quddusId]||null,quddusId,lang,{pdf_name_id:quddusId});
    const muslim=research[quddusId].hadith.find(x=>x.id==='muslim-487a');
    assert.ok(muslim&&html.includes(escape(muslim.arabic_original)),'Authentic Muslim bowing/prostration dhikr must survive.');
    assert.ok(html.includes(escape(muslim.translation[lang])),'Bilingual Muslim hadith must survive.');
    assert.ok(html.includes('https://sunnah.com/nasai:1733'),'Three-times-after-witr source link must survive.');
    assert.ok(html.includes('سُبْحَانَ الْمَلِكِ الْقُدُّوسِ'),'The Witr Arabic original must survive.');
    assert.ok(html.includes('وأما اسمه تعالى القدوس:'),'Original historical Shams account must survive with attribution.');
    assert.ok(html.includes(escape(encyclopaediaIII.scope[lang])),'No claim that every manuscript is complete.');
  }
  for(const id of ['PDF-HN-001','PDF-HN-002','PDF-HN-003','PDF-HN-005']){
    const html=render(chapters[id]||null,id,'en',{pdf_name_id:id});
    assert.ok(!html.includes(deepQuddus.evidence[0].id),'Card 004 entries must not contaminate card '+id);
  }
  console.log('PASS: al-Quddus card preserves 19 full Quran groups (23 verses), 16 original tafsir studies, two original exact-name verses, authentic hadith, Witr count and source-attributed Shams account in both languages.');

  // Fifth encyclopedia-depth card: the single direct Divine Name must never be confused with many lexical salam greetings.
  const encyclopaediaIV=JSON.parse(fs.readFileSync('src/data/holyNamesSectionBEncyclopediaIV.json','utf8'));
  const salamId='PDF-HN-005';
  const deepSalam=encyclopaediaIV.profiles[salamId];
  assert.deepEqual(Object.keys(encyclopaediaIV.profiles),[salamId]);
  assert.equal(deepSalam.evidence.length,26,'26 substantial full Quran passage groups are expected.');
  assert.equal(deepSalam.evidence.reduce((n,e)=>n+e.verse_count,0),27,'Includes two full verses 13:23-24.');
  assert.equal(deepSalam.scholarly.length,20,'20 source-attributed exegetical studies expected.');
  assert.equal(deepSalam.hadith.length,2,'Two additional independently sourced Sahih Muslim narrations expected.');
  assert.equal(new Set([...deepSalam.evidence,...deepSalam.scholarly,...deepSalam.hadith].map(x=>x.id)).size,48);
  assert.equal(research[salamId].evidence.filter(e=>e.source_reference==='Quran 59:23').length,1,'Direct Name source retained once, not padded.');
  const verses=new Set();
  const individualCategories=new Set();
  for(const item of deepSalam.evidence){
    assert.equal(item.relationship,'related_word_or_theme_not_exact_divine_name');
    assert.equal(item.review_status,'checked_against_digital_text');
    assert.ok(item.arabic_original.length>=22 && item.verse_meaning.ml&&item.verse_meaning.en);
    assert.ok(item.translation.ml&&item.translation.en&&item.source_scope.ml&&item.source_scope.en);
    const ref=item.source_reference.match(/Quran (\d+:\d+(?:-\d+)?)/)?.[1];
    assert.ok(ref&&!verses.has(ref)&&ref!=='59:23','Every full thematic passage distinct; no duplication of actual direct Name.');
    verses.add(ref);
    individualCategories.add(item.claim_kind);
    assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/katheer\/sura\d+-aya\d+\.html$/.test(item.source_url));
    for(const lang of ['ml','en']){
      const html=render(chapters[salamId]||null,salamId,lang,{pdf_name_id:salamId});
      for(const value of [item.arabic_original,item.verse_meaning[lang],item.translation[lang],item.source_scope[lang]]) {
        assert.ok(html.includes(escape(value)), 'Complete Quran text or interpretation missing '+ref+'/'+lang);
      }
      assert.ok(html.includes(item.source_url),'Source missing '+ref);
      assert.ok(sectionBEntrySearchText(item,lang).includes(item.verse_meaning[lang].toLocaleLowerCase()),'Verse meaning must be searchable.');
    }
  }
  assert.ok(individualCategories.size>=10,'Study should cover many distinct peace themes, not repeated generic fillers.');
  assert.equal(deepSalam.evidence.find(x=>x.source_reference.startsWith('Quran 13:23-24')).arabic_original.split('\n').length,2);
  assert.equal(deepSalam.evidence.find(x=>x.source_reference.startsWith('Quran 36:58')).claim_kind,'divine_greeting_not_name');
  const authors=new Set();
  for(const entry of deepSalam.scholarly){
    assert.equal(entry.claim_kind,'attributed_scholarly_tafsir');
    assert.ok(entry.arabic_original.length>10 && entry.translation.ml && entry.translation.en);
    assert.ok(/\/tafseer\/(katheer|qortobi|tabary|saadi)\//.test(entry.source_url));
    authors.add(entry.source_url.match(/\/tafseer\/(katheer|qortobi|tabary|saadi)\//)[1]);
    for(const lang of ['ml','en']){
      const html=render(chapters[salamId]||null,salamId,lang,{pdf_name_id:salamId});
      assert.ok(html.includes(escape(entry.arabic_original))&&html.includes(escape(entry.translation[lang])));
      assert.ok(html.includes(entry.source_url));
    }
  }
  assert.deepEqual([...authors].sort(),['katheer','qortobi','saadi','tabary']);
  assert.ok(deepSalam.scholarly.some(x=>x.translation.en.includes('three explanations')));
  assert.ok(deepSalam.scholarly.some(x=>x.translation.en.includes('questionable')));
  assert.ok(deepSalam.scholarly.some(x=>x.translation.en.includes('two grammatical')));
  for(const hadith of deepSalam.hadith){
    assert.equal(hadith.review_status,'checked_against_digital_text');
    assert.ok(hadith.source_url.startsWith('https://sunnah.com/muslim:'));
    assert.ok(hadith.arabic_original.length>65 && hadith.count.ml && hadith.count.en);
    for(const lang of ['ml','en']){
      const html=render(chapters[salamId]||null,salamId,lang,{pdf_name_id:salamId});
      assert.ok(html.includes(escape(hadith.arabic_original)),'Additional original Sahih Muslim matn missing '+hadith.id);
      assert.ok(html.includes(escape(hadith.translation[lang])),'Hadith context missing '+hadith.id);
      assert.ok(html.includes(hadith.source_url));
    }
  }
  assert.deepEqual(deepSalam.hadith.map(x=>x.source_url),['https://sunnah.com/muslim:54a','https://sunnah.com/muslim:592a']);
  assert.equal(bridge.identity_map['b-shams-brief-67-السلام'],'PDF-HN-0226','Historical original ownership unchanged.');
  assert.deepEqual(bridge.secondary_matches[salamId],['b-shams-brief-67-السلام'],'Cross-link one existing historical account without multiplying independent sources.');
  for(const lang of ['ml','en']){
    const html=render(chapters[salamId]||null,salamId,lang,{pdf_name_id:salamId});
    assert.ok(html.includes(research[salamId].hadith[0].source_url),'Original Muslim 591 post-salah remembrance must survive.');
    assert.ok(html.includes(escape(research[salamId].hadith[0].arabic_original)),'Original 591 dhikr Arabic must survive.');
    assert.ok(html.includes('https://sunnah.com/muslim:54a') && html.includes('https://sunnah.com/muslim:592a'));
    assert.ok(html.includes(escape(historical.accounts['b-shams-brief-67-السلام'].arabic_original)),'Existing Shams account must also be discoverable on its primary Name card.');
    assert.ok(html.includes(escape(bridge.secondary_scope[lang])),'Cross-link must be labeled and dangerous claims must not be recommended.');
    assert.ok(html.includes(escape(encyclopaediaIV.scope[lang])),'Avoid claim of manuscript completeness.');
  }
  const oldSalam=render(chapters['PDF-HN-0226']||null,'PDF-HN-0226','en',{pdf_name_id:'PDF-HN-0226'});
  assert.ok(oldSalam.includes(escape(historical.accounts['b-shams-brief-67-السلام'].arabic_original)),'Do not remove historical source from its original legacy card.');
  for(const other of ['PDF-HN-001','PDF-HN-002','PDF-HN-003','PDF-HN-004']){
    const html=render(chapters[other]||null,other,'en',{pdf_name_id:other});
    assert.ok(!html.includes(deepSalam.evidence[0].id),'No cross-card leakage for al-Salam');
  }
  console.log('PASS: card 005 has 26 complete Quran peace contexts (27 ayat), 20 tafsir studies, 2 full Sahih Muslim reports, preserved Muslim 591 and a clearly disclosed historical Shams cross-link.');

  // Sixth encyclopedia-depth card: clearly distinguish the exact Divine Name from safety/faith word relatives.
  const encyclopaediaV=JSON.parse(fs.readFileSync('src/data/holyNamesSectionBEncyclopediaV.json','utf8'));
  const muminId='PDF-HN-006';
  const deepMumin=encyclopaediaV.profiles[muminId];
  assert.deepEqual(Object.keys(encyclopaediaV.profiles),[muminId],'Card six overlay should contain no fake placeholder profiles.');
  assert.equal(deepMumin.evidence.length,21,'Card 006 must have 21 complete Quranic safety/faith contexts.');
  assert.equal(deepMumin.evidence.reduce((n,e)=>n+e.verse_count,0),21);
  assert.equal(deepMumin.scholarly.length,18,'18 independently sourced exegetical notes expected.');
  assert.equal(deepMumin.hadith.length,1,'One new independently source-checked Sahih Bukhari matn expected.');
  assert.equal(new Set([...deepMumin.evidence,...deepMumin.scholarly,...deepMumin.hadith].map(x=>x.id)).size,40);
  assert.equal(research[muminId].evidence.filter(x=>x.source_reference==='Quran 59:23').length,1,'The ONE direct Name verse should be preserved, not padded by synonyms.');
  const sourceRefs=new Set();
  const thematicKinds=new Set();
  for(const entry of deepMumin.evidence){
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.equal(entry.relationship,'thematic_not_exact_divine_name');
    assert.ok(entry.claim_kind&&entry.verse_meaning.ml&&entry.verse_meaning.en&&entry.translation.ml&&entry.translation.en);
    assert.ok(entry.source_scope.ml&&entry.source_scope.en);
    assert.ok(entry.arabic_original.length>20 && entry.source_reference.startsWith('Quran '));
    assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/katheer\/sura\d+-aya\d+\.html$/.test(entry.source_url));
    const ref=entry.source_reference.match(/Quran (\d+:\d+)/)?.[1];
    assert.ok(ref&&!sourceRefs.has(ref)&&ref!=='59:23','No duplicate or falsely new direct-name verse: '+ref);
    sourceRefs.add(ref);thematicKinds.add(entry.claim_kind);
    for(const language of ['ml','en']){
      const html=render(chapters[muminId]||null,muminId,language,{pdf_name_id:muminId});
      for(const content of [entry.arabic_original,entry.verse_meaning[language],entry.translation[language],entry.source_scope[language]]){
        assert.ok(html.includes(escape(content)), 'Full Quran text or interpretation absent: '+entry.id+'/'+language);
      }
      assert.ok(html.includes(entry.source_url),'Exact Quran source link absent '+entry.id);
      assert.ok(sectionBEntrySearchText(entry,language).includes(entry.verse_meaning[language].toLocaleLowerCase()),'Search must include full verse meaning.');
    }
  }
  assert.equal(sourceRefs.size,21);
  assert.ok(thematicKinds.size>=15,'Require meaningfully diverse subjects, not repetition.');
  const safetyVerse=deepMumin.evidence.find(x=>x.source_reference.startsWith('Quran 9:6'));
  assert.ok(safetyVerse?.translation.en.includes('safe conduct')||safetyVerse?.translation.en.includes('legal and ethical'),'Protection of asylum seekers must be explicitly respected.');
  assert.ok(deepMumin.evidence.find(x=>x.source_reference.startsWith('Quran 48:4'))?.translation.en.includes('human believers'),'Do not label the plural human believers as Allah\'s singular Divine Name.');
  assert.ok(deepMumin.evidence.find(x=>x.source_reference.startsWith('Quran 24:55'))?.translation.en.includes('not an isolated'),'Do not promise power through an isolated name count.');
  const commentatorNames=new Set();
  for(const entry of deepMumin.scholarly){
    assert.equal(entry.claim_kind,'attributed_scholarly_tafsir');
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.ok(entry.arabic_original.length>10&&entry.translation.ml&&entry.translation.en);
    assert.ok(/\/tafseer\/(katheer|qortobi|tabary|saadi|baghawy)\//.test(entry.source_url));
    commentatorNames.add(entry.source_url.match(/\/tafseer\/([^/]+)\//)[1]);
    for(const language of ['ml','en']){
      const html=render(chapters[muminId]||null,muminId,language,{pdf_name_id:muminId});
      assert.ok(html.includes(escape(entry.arabic_original)),entry.id+' Arabic tafsir snippet not rendered');
      assert.ok(html.includes(escape(entry.translation[language])),entry.id+' tafsir explanation not rendered');
      assert.ok(html.includes(entry.source_url),entry.id+' citation missing');
    }
  }
  assert.deepEqual([...commentatorNames].sort(),['baghawy','katheer','qortobi','saadi','tabary']);
  assert.ok(deepMumin.scholarly.some(x=>x.translation.en.includes('unusual eschatological account')),'Do not silently endorse disputed extra narratives.');
  const hadith3360=deepMumin.hadith[0];
  assert.equal(hadith3360.source_url,'https://sunnah.com/bukhari:3360');
  assert.ok(hadith3360.arabic_original.includes('الشِّرْكَ لَظُلْمٌ عَظِيمٌ'));
  assert.ok(hadith3360.translation.en.includes('Muslim 124a')&&hadith3360.count.en.includes('No repetition'));
  assert.ok(hadith3360.references.some(ref=>ref.url==='https://sunnah.com/muslim:124a'));
  assert.equal(bridge.identity_map['b-shams-brief-68-المؤمن'],muminId,'Shams source must stay attached to card 006.');
  const historicalSource=historical.accounts['b-shams-brief-68-المؤمن'];
  assert.equal(historicalSource.source_page,'68');
  assert.ok(historicalSource.arabic_original.includes('كل يوم ١١٣٢ مرة'),'Historical number must remain precisely original.');
  assert.ok(historicalSource.translation.en.includes('not evidence of disease prevention'),'Avoid unsafe plague protection claims.');
  for(const language of ['ml','en']){
    const html=render(chapters[muminId]||null,muminId,language,{pdf_name_id:muminId});
    assert.ok(html.includes(escape(hadith3360.arabic_original)),'Bukhari original Arabic missing.');
    assert.ok(html.includes(escape(hadith3360.translation[language])),'Bilingual Bukhari translation missing.');
    assert.ok(html.includes(hadith3360.source_url));
    assert.ok(html.includes(escape(historicalSource.arabic_original)),'The 1,132 historical Arabic recitation account must survive.');
    assert.ok(html.includes(escape(historicalSource.translation[language])),'The historical count with health caveat must survive.');
    assert.ok(html.includes('https://sunnah.com/muslim:2708a'),'Previously linked authentic refuge prayer source must remain.');
    assert.ok(html.includes(escape(encyclopaediaV.scope[language])),'Do not indicate manuscript research is complete.');
  }
  for(const other of ['PDF-HN-001','PDF-HN-002','PDF-HN-003','PDF-HN-004','PDF-HN-005']){
    const html=render(chapters[other]||null,other,'en',{pdf_name_id:other});
    assert.ok(!html.includes(deepMumin.evidence[0].id),'Name six source entry leaked onto another card.');
  }
  console.log('PASS: card 006 al-Mumin preserves 21 complete Quran verses, 18 sourced tafsir notes, Bukhari 3360 with Muslim 124a corroboration, pre-existing Muslim 2708a and Shams 1,132 historical count with medical warning.');

  // Seventh encyclopedia-depth card: Divine Name, Quranic Book adjective and human/angelic witnesses must not be conflated.
  const encyclopaediaVI=JSON.parse(fs.readFileSync('src/data/holyNamesSectionBEncyclopediaVI.json','utf8'));
  const muhayminId='PDF-HN-007';
  const deepMuhaymin=encyclopaediaVI.profiles[muhayminId];
  assert.deepEqual(Object.keys(encyclopaediaVI.profiles),[muhayminId],'Only the seventh card is added in this overlay.');
  assert.equal(deepMuhaymin.evidence.length,16,'Sixteen complete Quran verses expected on al-Muhaymin.');
  assert.equal(deepMuhaymin.evidence.reduce((n,entry)=>n+entry.verse_count,0),16);
  assert.equal(deepMuhaymin.scholarly.length,17,'Seventeen separately attributed Arabic-source tafsir studies expected.');
  assert.equal(new Set([...deepMuhaymin.evidence,...deepMuhaymin.scholarly].map(x=>x.id)).size,33);
  assert.equal(research[muhayminId].evidence.filter(e=>e.source_reference==='Quran 59:23').length,1,
    'Original direct Name 59:23 must remain single and distinct.');
  const verseReferences=new Set();
  for(const entry of deepMuhaymin.evidence){
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.ok(entry.arabic_original.length>=15 && entry.verse_meaning.ml && entry.verse_meaning.en);
    assert.ok(entry.translation.ml&&entry.translation.en&&entry.source_scope.ml&&entry.source_scope.en);
    assert.ok(entry.source_reference.startsWith('Quran '));
    const ref=entry.source_reference.match(/Quran (\d+:\d+)/)?.[1];
    assert.ok(ref && ref!=='59:23' && !verseReferences.has(ref),'Duplicate or direct-name source reuse '+ref);
    verseReferences.add(ref);
    assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/katheer\/sura\d+-aya\d+\.html$/.test(entry.source_url));
    if(ref==='5:48'){
      assert.equal(entry.claim_kind,'quran_adjective_not_divine_name');
      assert.ok(entry.arabic_original.includes('وَمُهَيْمِنًا عَلَيْهِ'));
      assert.ok(entry.translation.en.includes('Muhayminan is an adjective of the Quran'));
    }
    if(ref==='50:18'){
      assert.equal(entry.claim_kind,'angelic_watcher_not_god');
      assert.ok(entry.translation.en.includes('angel'));
    }
    for(const lang of ['ml','en']){
      const html=render(chapters[muhayminId]||null,muhayminId,lang,{pdf_name_id:muhayminId});
      for(const field of [entry.arabic_original,entry.verse_meaning[lang],entry.translation[lang],entry.source_scope[lang]]) {
        assert.ok(html.includes(escape(field)),'Full Quran phrase or bilingual meaning missing '+entry.id+'/'+lang);
      }
      assert.ok(html.includes(entry.source_url),'Quran/tafsir link missing '+entry.id);
      assert.ok(sectionBEntrySearchText(entry,lang).includes(entry.verse_meaning[lang].toLocaleLowerCase()),
        'Source-specific Quran meaning absent from search '+entry.id);
    }
  }
  assert.equal(verseReferences.size,16);
  const exactAuthors=new Set();
  for(const entry of deepMuhaymin.scholarly){
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.equal(entry.claim_kind,'attributed_scholarly_tafsir');
    assert.ok(entry.arabic_original.length>=12 && entry.translation.ml && entry.translation.en);
    assert.ok(/\/tafseer\/(katheer|tabary|baghawy)\//.test(entry.source_url));
    exactAuthors.add(entry.source_url.match(/\/tafseer\/([^/]+)\//)[1]);
    for(const lang of ['ml','en']){
      const html=render(chapters[muhayminId]||null,muhayminId,lang,{pdf_name_id:muhayminId});
      assert.ok(html.includes(escape(entry.arabic_original)),'Scholarly Arabic quotation absent '+entry.id);
      assert.ok(html.includes(escape(entry.translation[lang])),'Scholarly interpretation absent '+entry.id);
      assert.ok(html.includes(entry.source_url),'Individual Arabic tafsir source link absent '+entry.id);
    }
  }
  assert.deepEqual([...exactAuthors].sort(),['baghawy','katheer','tabary']);
  assert.ok(deepMuhaymin.scholarly.some(x=>x.translation.en.includes('grammatically erroneous')),
    'Keep al-Tabari rejection of a Quran-to-Prophet grammatical switch.');
  assert.equal(bridge.identity_map['b-shams-brief-68-المهيمن'],muhayminId);
  const historicalMuhaymin=historical.accounts['b-shams-brief-68-المهيمن'];
  assert.equal(historicalMuhaymin.source_page,'68');
  assert.ok(historicalMuhaymin.arabic_original.includes('خمس مرات في شرف القمر'));
  assert.ok(historicalMuhaymin.count.en.includes('inscriptions'));
  assert.ok(!historicalMuhaymin.count.en.includes('recitations'));
  for(const lang of ['ml','en']){
    const html=render(chapters[muhayminId]||null,muhayminId,lang,{pdf_name_id:muhayminId});
    assert.ok(html.includes(escape(historicalMuhaymin.arabic_original)),'Original Shams Arabic inscription account lost.');
    assert.ok(html.includes(escape(historicalMuhaymin.translation[lang])),'Shams history qualification lost.');
    assert.ok(html.includes(escape(historicalMuhaymin.count[lang])),'Historical five inscriptions count lost.');
    assert.ok(html.includes(escape(encyclopaediaVI.scope[lang])),'Incomplete manuscript-review warning absent.');
  }
  for(const id of ['PDF-HN-001','PDF-HN-002','PDF-HN-003','PDF-HN-004','PDF-HN-005','PDF-HN-006']){
    const html=render(chapters[id]||null,id,'en',{pdf_name_id:id});
    assert.ok(!html.includes(deepMuhaymin.evidence[0].id),'Cross-card leakage of seventh Name source into '+id);
  }
  console.log('PASS: al-Muhaymin seventh card contains 16 full Arabic Quran verses, 17 source-attributed tafsir distinctions, and the separate historical five-inscription ring claim, in both languages.');

  // Eighth source-rich card: exactly distinguish the Divine Name, indefinite descriptions and Yusuf's human al-Aziz title.
  const encyclopaediaVII=JSON.parse(fs.readFileSync('src/data/holyNamesSectionBEncyclopediaVII.json','utf8'));
  const azizId='PDF-HN-008';
  const deepAziz=encyclopaediaVII.profiles[azizId];
  assert.deepEqual(Object.keys(encyclopaediaVII.profiles),[azizId],'No placeholders on eighth encyclopedia overlay.');
  assert.equal(deepAziz.evidence.length,19,'Nineteen distinct complete Quran verses on al-Aziz expected.');
  assert.equal(deepAziz.evidence.reduce((n,entry)=>n+entry.verse_count,0),19);
  assert.equal(deepAziz.scholarly.length,22,'Twenty-two distinct tafsir studies required.');
  assert.equal(new Set([...deepAziz.evidence,...deepAziz.scholarly].map(e=>e.id)).size,41);
  assert.equal(research[azizId].evidence.filter(e=>e.source_reference==='Quran 59:23').length,1,'Original direct al-Aziz verse must remain without duplicate.');
  const azizRefs=new Set(), azizHumanRefs=[];
  for(const entry of deepAziz.evidence){
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.ok(entry.arabic_original.length>=16 && entry.verse_meaning.ml && entry.verse_meaning.en);
    assert.ok(entry.translation.ml && entry.translation.en && entry.source_scope.ml && entry.source_scope.en);
    assert.ok(entry.arabic_original.includes('عَزِيز') || entry.arabic_original.includes('الْعَزِيز'),'Original must contain Aziz with Quranic marks: '+entry.id);
    assert.ok(/^https:\/\/quran\.ksu\.edu\.sa\/tafseer\/katheer\/sura\d+-aya\d+\.html$/.test(entry.source_url));
    const ref=entry.source_reference.match(/Quran (\d+:\d+)/)?.[1];
    assert.ok(ref && ref!=='59:23' && !azizRefs.has(ref),'Duplicate original Quran reference: '+ref);
    azizRefs.add(ref);
    if(entry.relationship==='human_title_not_divine_name'){
      azizHumanRefs.push(ref);
      assert.equal(entry.claim_kind,'human_title_not_divine_name');
      assert.ok(entry.translation.en.includes('earthly')||entry.translation.en.includes('human')||entry.translation.en.includes('minister'),'Human title must be qualified.');
    }
    if(entry.relationship==='indefinite_divine_epithet')assert.equal(entry.claim_kind,'descriptive_indefinite_form');
    for(const language of ['ml','en']){
      const html=render(chapters[azizId]||null,azizId,language,{pdf_name_id:azizId});
      for(const field of [entry.arabic_original,entry.verse_meaning[language],entry.translation[language],entry.source_scope[language]]){
        assert.ok(html.includes(escape(field)),'Missing Quran verse/interpretation '+ref+'/'+language);
      }
      assert.ok(html.includes(entry.source_url),'Quran citation absent: '+ref);
      assert.ok(sectionBEntrySearchText(entry,language).includes(entry.verse_meaning[language].toLocaleLowerCase()),
        'Search must contain complete Quran meaning for '+ref);
    }
  }
  assert.deepEqual(azizHumanRefs.sort(),['12:30','12:78','12:88'],'All three human al-Aziz usages in Yusuf must be distinct.');
  const complete36=deepAziz.evidence.find(x=>x.source_reference.startsWith('Quran 3:6'));
  assert.ok(complete36 && complete36.arabic_original.startsWith('هُوَ الَّذِي يُصَوِّرُكُمْ') && complete36.arabic_original.length>70,
    'Expand original fragment into the full Quran 3:6 verse.');
  const earlyTest=deepAziz.evidence.find(x=>x.source_reference.startsWith('Quran 67:2'));
  assert.ok(earlyTest?.translation.en.includes('best deeds'),'Preserve meaningful best-vs-most-deeds explanation.');
  const tafsirAuthors=new Set();
  for(const entry of deepAziz.scholarly){
    assert.equal(entry.review_status,'checked_against_digital_text');
    assert.equal(entry.claim_kind,'attributed_scholarly_tafsir');
    assert.ok(entry.arabic_original.length>=10 && entry.translation.ml && entry.translation.en);
    assert.ok(/\/tafseer\/(katheer|saadi|tabary)\//.test(entry.source_url));
    tafsirAuthors.add(entry.source_url.match(/\/tafseer\/([^/]+)\//)[1]);
    for(const language of ['ml','en']){
      const html=render(chapters[azizId]||null,azizId,language,{pdf_name_id:azizId});
      assert.ok(html.includes(escape(entry.arabic_original)),'Arabic scholarly phrase missing '+entry.id);
      assert.ok(html.includes(escape(entry.translation[language])),'Bilingual tafsir missing '+entry.id);
      assert.ok(html.includes(entry.source_url),'Source-specific tafsir link missing '+entry.id);
    }
  }
  assert.deepEqual([...tafsirAuthors].sort(),['katheer','saadi','tabary']);
  assert.ok(deepAziz.scholarly.some(x=>x.translation.en.includes('authentic 99-Names')||x.translation.en.includes('ninety-nine Names')),
    'Sound 99-Names hadith must be distinguished from extra enumerated chains.');
  assert.equal(bridge.identity_map['b-shams-brief-68-العزيز'],azizId);
  const shamsAziz=historical.accounts['b-shams-brief-68-العزيز'];
  assert.equal(shamsAziz.source_page,'68');
  assert.ok(shamsAziz.arabic_original.includes('من أكثر من ذكره'));
  assert.ok(shamsAziz.count.en.includes('no fixed repetition count'),'Shams brief must not be assigned a fabricated count.');
  assert.ok(!shamsAziz.timing.en.includes('Saturday')&&!shamsAziz.conditions.en.includes('incense'),
    'Do not import ritual timing or incense from unrelated manuscript chapter.');
  for(const language of ['ml','en']){
    const html=render(chapters[azizId]||null,azizId,language,{pdf_name_id:azizId});
    assert.ok(html.includes(escape(shamsAziz.arabic_original)),'Original sourced Shams al-Aziz brief absent.');
    assert.ok(html.includes(escape(shamsAziz.count[language])),'No-fixed-count qualification lost.');
    assert.ok(html.includes(escape(encyclopaediaVII.scope[language])),'Incomplete historical coverage warning must be displayed.');
  }
  for(const id of ['PDF-HN-001','PDF-HN-002','PDF-HN-003','PDF-HN-004','PDF-HN-005','PDF-HN-006','PDF-HN-007']){
    const html=render(chapters[id]||null,id,'en',{pdf_name_id:id});
    assert.ok(!html.includes(deepAziz.evidence[0].id),'Card 008 evidence leaked onto '+id);
  }
  console.log('PASS: al-Aziz eighth card contains 19 complete Quran verses, 22 Arabic-source tafsir readings, three distinctly human Aziz references and historically unnumbered Shams remembrance.');
  // The visible source summary must include every research overlay, not merely the first-pass profile.
  for (const id of coveredIds) {
    for (const lang of ['ml', 'en']) {
      const html = render(chapters[id], id, lang, { pdf_name_id: id });
      const groups = [...html.matchAll(/data-section-b-group="([^"]+)" data-section-b-count="([0-9]+)"/g)];
      const getCount = key => {
        const match = html.match(new RegExp('data-testid="section-b-' + key + '-count">([0-9]+)</span>'));
        assert.ok(match, 'Missing ' + key + ' counter on ' + id + ' / ' + lang);
        return Number(match[1]);
      };
      const countGroup = key => Number(groups.find(entry => entry[1] === key)?.[2] || 0);
      const verifiedTotal = groups.filter(entry => entry[1] !== 'pending').reduce((sum, entry) => sum + Number(entry[2]), 0);
      assert.equal(getCount('source'), verifiedTotal, 'Incomplete source total on ' + id + ' / ' + lang);
      assert.equal(getCount('quran'), countGroup('evidence'), 'Incomplete Quran total on ' + id + ' / ' + lang);
      assert.equal(getCount('topic'), countGroup('topics') + countGroup('prophetic') + countGroup('shams'), 'Incomplete topic total on ' + id + ' / ' + lang);
    }
  }
  console.log('PASS: all 160 card summaries count their complete Arabic/bilingual Quran, scholarly, Prophetic, topics and book sections.');
  if (process.env.SECTION_B_CHECKED_FIXTURE) {
    const checked = JSON.parse(fs.readFileSync(process.env.SECTION_B_CHECKED_FIXTURE, 'utf8'));
    const cards = new Map();
    for (const row of checked) {
      const c = cards.get(row.name_id) || { pdf_name_id: row.name_id };
      (c[row.group] ||= []).push(row.entry); cards.set(row.name_id, c);
    }
    const reviewed = JSON.parse(fs.readFileSync('src/data/holyNamesReviewedCards.json', 'utf8'));
    for (const [id, c] of Object.entries(reviewed)) cards.set(id, c);
    assert.equal(cards.size, 160);
    for (const [id, c] of cards) for (const language of ['ml', 'en']) {
      const html = render(chapters[id], id, language, c);
      for (const field of ['scholarly_entries', 'dua', 'khawass', 'wafq', 'talisman', 'amal', 'wazifa']) for (const entry of c[field] || []) {
        const body = entry[language === 'ml' ? 'malayalam_text' : 'english_text'];
        if (body) assert.ok(html.includes(escape(body)), `${id}: missing ${entry.id} ${language}`);
        if (entry.arabic_text) assert.ok(html.includes(escape(entry.arabic_text)), `${id}: missing original ${entry.id}`);
      }
    }
    console.log(`PASS: ${checked.length} checked records across all ${cards.size} live-card fixtures retain originals and both translations.`);
  }
} finally { fs.rmSync(work, { recursive: true, force: true }); }
console.log('PASS: every Section B chapter paragraph in both languages, separate Quran/scholar/topic/book sections, name isolation, no invented count, source attribution and escaped text.');


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
    import {HolyNamesLanguageContext as Context} from './src/components/holynameknowledge/HolyNamesLanguageContext.jsx';
    export const render=(chapter,nameId,language,card)=>renderToStaticMarkup(React.createElement(Context.Provider,{value:{language}},React.createElement(Reader,{chapter,nameId,card})));`, resolveDir: process.cwd(), loader: 'jsx' }, outfile: output, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', alias: { '@': path.resolve('src') } });
  const { render, sectionBReading, unlinkedSectionBVisuals, withSectionBMeaning } = createRequire(import.meta.url)(output);
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
  assert.equal(prophetic.entries.length, 21);
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


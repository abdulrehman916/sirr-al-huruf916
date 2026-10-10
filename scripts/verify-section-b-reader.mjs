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
      assert.ok(html.includes(profile.explanation[language]), `${id}: missing research introduction ${language}`);
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


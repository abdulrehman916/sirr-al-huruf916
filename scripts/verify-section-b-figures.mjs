import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const work=fs.mkdtempSync(path.join(os.tmpdir(),'section-b-figures-'));
try {
  const output=path.join(work,'reader.cjs');
  await build({stdin:{contents:`import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server';
    import Figures from './src/components/holynameknowledge/HolyOneSourceVisuals.jsx';
    import Material from './src/components/holynameknowledge/HolyOneScholarlySections.jsx';
    import {HolyNamesLanguageContext as Context} from './src/components/holynameknowledge/HolyNamesLanguageContext.jsx';
    export const render=(card,language)=>renderToStaticMarkup(React.createElement(Context.Provider,{value:{language}},React.createElement(React.Fragment,null,React.createElement(Figures,{visuals:card.attached_visuals,cardId:card.pdf_name_id}),React.createElement(Material,{card}))));`,resolveDir:process.cwd(),loader:'jsx'},outfile:output,bundle:true,platform:'node',format:'cjs',jsx:'automatic',alias:{'@':path.resolve('src')},plugins:[{name:'owner-role-fixture',setup(b){b.onLoad({filter:/useIsOwner\.js$/},()=>({contents:'export const useIsOwner=()=>false;',loader:'js'}));}}]});
  const {render}=createRequire(import.meta.url)(output);
  const fixture={pdf_name_id:'PDF-TEST',attached_visuals:[
    {visual_type:'other',visual_url:'https://example.test/full-book-page.png'},
    {visual_type:'wafq',review_status:'checked_against_scan',matched_pdf_name_id:'OTHER',visual_url:'https://example.test/wrong-name.png'},
    {visual_type:'wafq',review_status:'checked_against_scan',matched_pdf_name_id:'PDF-TEST',visual_data_uri:'data:image/png;base64,AA==',image_sha256:'fixture',title_ml:'യഥാർത്ഥ കളം',title_en:'Original figure',description_ml:'പുസ്തകത്തിലെ പരാമർശം',description_en:'Book account',source_reference:'Source <book>',source_page:'1'},
    {visual_type:'wafq',review_status:'checked_against_scan',matched_pdf_name_id:'PDF-TEST',visual_data_uri:'data:image/png;base64,AA==',image_sha256:'fixture'}],dua:[{arabic_text:'<script>bad</script>',malayalam_text:'അർത്ഥം',english_text:'Meaning',source_book:'Source <book>',source_page:'1',review_status:'checked_against_scan'}]};
  for(const lang of ['ml','en']){
    const html=render(fixture,lang);
    assert.equal((html.match(/<img /g)||[]).length,1);
    assert.ok(!html.includes('full-book-page.png')&&!html.includes('wrong-name.png'));
    assert.ok(!html.includes('<script>bad')&&html.includes('&lt;script&gt;'));
    assert.ok(html.includes('Source &lt;book&gt;'));
    assert.ok(html.includes(lang==='ml'?'അർത്ഥം':'Meaning'));
  }
  if(process.env.SECTION_B_PRIVATE_SNAPSHOT){
    const rows=JSON.parse(fs.readFileSync(process.env.SECTION_B_PRIVATE_SNAPSHOT,'utf8'));
    let figures=0;
    for(const {data:card} of rows){
      const checked=(card.attached_visuals||[]).filter(v=>v.research_batch==='section-b-source-pass-2026-10-09');
      figures+=checked.length;
      for(const v of checked){
        assert.equal(v.matched_pdf_name_id,card.pdf_name_id);
        const bytes=Buffer.from(v.visual_data_uri.split(',')[1],'base64');
        assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
        assert.equal(createHash('sha256').update(bytes).digest('hex'),v.image_sha256);
      }
      for(const lang of ['ml','en']) assert.equal((render(card,lang).match(/<img /g)||[]).length,checked.length);
      for(const list of Object.values(card).filter(Array.isArray)) for(const e of list.filter(e=>e.research_batch==='section-b-source-pass-2026-10-09')){
        if(e.visual_type) continue;
        assert.ok(e.arabic_text&&e.malayalam_text&&e.english_text&&e.source_book&&e.source_page);
      }
    }
    assert.equal(figures,26);
  }
}finally{fs.rmSync(work,{recursive:true,force:true});}
console.log('PASS: only source-checked figures for the matching name; ordinary pages excluded, bilingual source details, source-image hashes and text escaping.');

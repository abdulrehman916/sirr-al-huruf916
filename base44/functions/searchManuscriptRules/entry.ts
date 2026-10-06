import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const { query, searchIn = 'all' } = payload;

    if (!query || query.trim().length === 0) {
      return Response.json({ success: true, results: [], total: 0 });
    }

    const searchTerm = query.trim().toLowerCase();
    const allRules = await base44.entities.ManuscriptRule.filter({}, '-created_date', 500);
    
    const results = allRules.filter(rule => {
      let parsedData = {};
      try { parsedData = rule.data_json ? JSON.parse(rule.data_json) : {}; } catch (e) {}

      const checks = {
        arabic_text: typeof rule.original_text === 'string' ? rule.original_text.toLowerCase().includes(searchTerm) : false,
        malayalam: typeof rule.rule_summary_ml === 'string' ? rule.rule_summary_ml.toLowerCase().includes(searchTerm) : false,
        english_summary: typeof rule.rule_summary === 'string' ? rule.rule_summary.toLowerCase().includes(searchTerm) : false,
        book_name: typeof rule.book_name === 'string' ? rule.book_name.toLowerCase().includes(searchTerm) : false,
        author: typeof rule.author === 'string' ? rule.author.toLowerCase().includes(searchTerm) : false,
        category: typeof rule.category === 'string' ? rule.category.toLowerCase().includes(searchTerm) : false,
        chapter: typeof rule.chapter === 'string' ? rule.chapter.toLowerCase().includes(searchTerm) : false,
        letters: (parsedData.letters || []).filter(l => typeof l === 'string').some(l => l.toLowerCase().includes(searchTerm)),
        mansions: (parsedData.lunar_mansions || []).filter(m => typeof m === 'string').some(m => m.toLowerCase().includes(searchTerm)),
        planets: (parsedData.planets || []).filter(p => typeof p === 'string').some(p => p.toLowerCase().includes(searchTerm)),
        zodiacs: (parsedData.zodiac_signs || []).filter(z => typeof z === 'string').some(z => z.toLowerCase().includes(searchTerm)),
        elements: (parsedData.elements || []).filter(e => typeof e === 'string').some(e => e.toLowerCase().includes(searchTerm)),
        saad_nahs: typeof parsedData.saad_nahs === 'string' ? parsedData.saad_nahs.toLowerCase().includes(searchTerm) : false,
        metals: (parsedData.metals || []).filter(m => typeof m === 'string').some(m => m.toLowerCase().includes(searchTerm)),
        colors: (parsedData.colors || []).filter(c => typeof c === 'string').some(c => c.toLowerCase().includes(searchTerm))
      };

      if (searchIn !== 'all') {
        return checks[searchIn] || false;
      }

      return Object.values(checks).some(v => v);
    }).slice(0, 50);

    const formattedResults = results.map(rule => {
      let parsedData = {};
      try { parsedData = rule.data_json ? JSON.parse(rule.data_json) : {}; } catch (e) {}

      return {
        rule_id: rule.rule_id || rule.id,
        manuscript: rule.book_name,
        page: rule.page_number,
        author: rule.author,
        category: rule.category,
        chapter: rule.chapter,
        original_text: rule.original_text?.substring(0, 200),
        summary: rule.rule_summary,
        summary_ml: rule.rule_summary_ml,
        associations: {
          letters: parsedData.letters || [],
          mansions: parsedData.lunar_mansions || [],
          planets: parsedData.planets || [],
          zodiacs: parsedData.zodiac_signs || [],
          elements: parsedData.elements || [],
          saad_nahs: parsedData.saad_nahs,
          metals: parsedData.metals || [],
          colors: parsedData.colors || []
        },
        match_reason: getMatchReason(rule, parsedData, searchTerm)
      };
    });

    return Response.json({ 
      success: true, 
      results: formattedResults, 
      total: formattedResults.length,
      query: searchTerm,
      search_in: searchIn
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getMatchReason(rule, parsedData, term) {
  const reasons = [];
  
  if (typeof rule.original_text === 'string' && rule.original_text.toLowerCase().includes(term)) reasons.push('Arabic Text');
  if (typeof rule.rule_summary_ml === 'string' && rule.rule_summary_ml.toLowerCase().includes(term)) reasons.push('Malayalam');
  if (typeof rule.rule_summary === 'string' && rule.rule_summary.toLowerCase().includes(term)) reasons.push('English Summary');
  if (typeof rule.book_name === 'string' && rule.book_name.toLowerCase().includes(term)) reasons.push('Book Name');
  if (typeof rule.author === 'string' && rule.author.toLowerCase().includes(term)) reasons.push('Author');
  if (typeof rule.category === 'string' && rule.category.toLowerCase().includes(term)) reasons.push('Category');
  if ((parsedData.letters || []).filter(l => typeof l === 'string').some(l => l.toLowerCase().includes(term))) reasons.push('Letters');
  if ((parsedData.lunar_mansions || []).filter(m => typeof m === 'string').some(m => m.toLowerCase().includes(term))) reasons.push('Mansions');
  if ((parsedData.planets || []).filter(p => typeof p === 'string').some(p => p.toLowerCase().includes(term))) reasons.push('Planets');
  if ((parsedData.zodiac_signs || []).filter(z => typeof z === 'string').some(z => z.toLowerCase().includes(term))) reasons.push('Zodiac');
  if ((parsedData.elements || []).filter(e => typeof e === 'string').some(e => e.toLowerCase().includes(term))) reasons.push('Elements');
  if (typeof parsedData.saad_nahs === 'string' && parsedData.saad_nahs.toLowerCase().includes(term)) reasons.push('Saad/Nahs');
  if ((parsedData.metals || []).filter(m => typeof m === 'string').some(m => m.toLowerCase().includes(term))) reasons.push('Metals');
  if ((parsedData.colors || []).filter(c => typeof c === 'string').some(c => c.toLowerCase().includes(term))) reasons.push('Colors');

  return reasons.join(', ');
}
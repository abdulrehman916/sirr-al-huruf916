import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const sampleRules = await base44.entities.ManuscriptRule.filter({category: "LUNAR_MANSIONS"}, '-created_date', 1);
    
    // Return the full first rule to inspect structure
    const firstRule = sampleRules[0];
    
    return Response.json({ 
      success: true,
      full_rule: firstRule,
      has_data_field: !!firstRule.data,
      data_content: firstRule.data
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
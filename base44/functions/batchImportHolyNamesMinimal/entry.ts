import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { names, import_batch, pdf_file } = await req.json();

    if (!names || !Array.isArray(names) || names.length === 0) {
      return Response.json({ 
        error: 'Missing or invalid names array' 
      }, { status: 400 });
    }

    const results = {
      success: [],
      skipped: [],
      failed: []
    };

    for (let i = 0; i < names.length; i++) {
      const nameData = names[i];
      const globalIndex = i + 1;
      
      try {
        // Generate PDF name ID
        const pdf_name_id = `PDF-HN-${String(globalIndex).padStart(3, '0')}`;
        
        // Check if already exists
        const existing = await base44.entities.HolyOnePDFName.filter({ pdf_name_id });
        if (existing && existing.length > 0) {
          results.skipped.push({
            pdf_name_id,
            reason: 'Already exists',
            id: existing[0].id
          });
          continue;
        }

        // Import with minimal data - content will be added manually
        const newRecord = await base44.entities.HolyOnePDFName.create({
          pdf_name_id,
          surah_name: '',
          surah_number: 0,
          arabic_name: nameData.arabic_name || '',
          arabic_transliteration: '',
          malayalam_pronunciation: '',
          meaning_malayalam: '',
          explanation_malayalam: '',
          virtues_benefits: '',
          islamic_information: '',
          authentic_notes: '',
          source_pdf_page: nameData.page || 0,
          source_pdf_file: pdf_file || 'unknown',
          source_reference_arabic: '',
          order_in_surah: 0,
          global_order: globalIndex,
          import_batch: import_batch || 'manual-import',
          verification_status: 'needs_review',
          verified_by: '',
          verified_at: '',
          created_by: user.id
        });

        results.success.push({
          pdf_name_id,
          record_id: newRecord.id,
          page: nameData.page,
          arabic_name: nameData.arabic_name
        });

      } catch (error) {
        results.failed.push({
          index: i,
          arabic_name: nameData.arabic_name,
          page: nameData.page,
          error: error.message
        });
      }
    }

    return Response.json({
      status: 'complete',
      total: names.length,
      success_count: results.success.length,
      skipped_count: results.skipped.length,
      failed_count: results.failed.length,
      results
    });

  } catch (error) {
    console.error('Error in batchImportHolyNamesMinimal:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});
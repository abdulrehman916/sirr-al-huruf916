import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { 
      start_index, 
      batch_size = 5,
      pdf_url,
      import_batch 
    } = await req.json();

    if (!pdf_url || start_index === undefined) {
      return Response.json({ 
        error: 'Missing required fields: pdf_url, start_index' 
      }, { status: 400 });
    }

    // Extract names from PDF for this batch
    const extraction = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: pdf_url,
      json_schema: {
        type: "object",
        properties: {
          names: {
            type: "array",
            items: {
              type: "object",
              properties: {
                arabic_name: {type: "string"},
                page: {type: "integer"}
              }
            }
          }
        }
      }
    });

    if (extraction.status !== 'success' || !extraction.output?.names) {
      return Response.json({ 
        error: 'Failed to extract names from PDF',
        details: extraction.details 
      }, { status: 500 });
    }

    const allNames = extraction.output.names;
    const batchNames = allNames.slice(start_index, start_index + batch_size);

    if (batchNames.length === 0) {
      return Response.json({
        status: 'completed',
        message: 'No more names to import',
        total_names: allNames.length
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < batchNames.length; i++) {
      const nameData = batchNames[i];
      const globalIndex = start_index + i + 1;
      const pdf_name_id = `PDF-HN-${String(globalIndex).padStart(3, '0')}`;

      try {
        // Check if already exists
        const existing = await base44.entities.HolyOnePDFName.filter({ pdf_name_id });
        
        if (existing && existing.length > 0) {
          results.push({
            status: 'skipped',
            pdf_name_id,
            message: 'Already exists'
          });
          continue;
        }

        // Import with minimal data - content will be added manually
        const newRecord = await base44.entities.HolyOnePDFName.create({
          pdf_name_id,
          surah_name: '',
          surah_number: 0,
          arabic_name: nameData.arabic_name,
          arabic_transliteration: '',
          malayalam_pronunciation: '',
          meaning_malayalam: '',
          explanation_malayalam: '',
          virtues_benefits: '',
          islamic_information: '',
          authentic_notes: '',
          source_pdf_page: nameData.page,
          source_pdf_file: 'pdf1_pages_1_40',
          source_reference_arabic: '',
          order_in_surah: 0,
          global_order: globalIndex,
          import_batch: import_batch || 'manual-import',
          verification_status: 'needs_review',
          verified_by: '',
          verified_at: '',
          created_by: user.id
        });

        results.push({
          status: 'imported',
          pdf_name_id,
          record_id: newRecord.id,
          arabic_name: nameData.arabic_name,
          page: nameData.page
        });

      } catch (error) {
        errors.push({
          pdf_name_id,
          error: error.message
        });
      }
    }

    return Response.json({
      status: 'success',
      batch_start: start_index,
      batch_size: batchNames.length,
      total_extracted: allNames.length,
      imported: results.filter(r => r.status === 'imported').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: errors.length,
      results,
      errors: errors,
      next_index: start_index + batch_size
    });

  } catch (error) {
    console.error('Error in batchImportHolyNamesFromPDF:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});
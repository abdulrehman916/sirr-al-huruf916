import { createClientFromRequest } from 'npm:@base44/sdk@0.8.34';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { file_url } = await req.json();
    if (!file_url) {
      return Response.json({ error: 'file_url required' }, { status: 400 });
    }

    console.log('[HolyOne Import] Starting extraction from PDF:', file_url);

    // Extract ALL content from PDF using AI
    const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: file_url,
      json_schema: {
        type: "object",
        properties: {
          holy_names: {
            type: "array",
            items: {
              type: "object",
              properties: {
                arabic_name: { type: "string", description: "Arabic name exactly as written" },
                arabic_transliteration: { type: "string", description: "Latin transliteration if present" },
                malayalam_pronunciation: { type: "string", description: "Malayalam pronunciation" },
                meaning_malayalam: { type: "string", description: "Meaning in Malayalam" },
                explanation_malayalam: { type: "string", description: "Complete explanation - preserve ALL paragraphs" },
                virtues_benefits: { type: "string", description: "All virtues and benefits - preserve ALL text" },
                islamic_information: { type: "string", description: "All Islamic information - preserve ALL text" },
                authentic_notes: { type: "string", description: "All authentic notes - preserve ALL text" },
                amal_wazifa: { type: "string", description: "All amal, wazifa, usage instructions - preserve ALL text" },
                warnings_conditions: { type: "string", description: "All warnings, conditions, notes - preserve ALL text" },
                source_page: { type: "integer", description: "Page number in PDF" },
                source_reference: { type: "string", description: "Reference/citation from PDF" }
              },
              required: ["arabic_name", "malayalam_pronunciation", "meaning_malayalam"]
            }
          },
          total_names_found: { type: "integer", description: "Total number of Holy Names extracted" },
          total_pages_processed: { type: "integer", description: "Total PDF pages processed" },
          extraction_notes: { type: "string", description: "Any notes about extraction process" }
        },
        required: ["holy_names", "total_names_found"]
      }
    });

    if (extractionResult.status !== 'success') {
      return Response.json({ 
        error: 'Extraction failed', 
        details: extractionResult.details 
      }, { status: 500 });
    }

    const data = extractionResult.output;
    const holyNames = data.holy_names || [];
    const totalNamesFound = data.total_names_found || holyNames.length;
    const totalPagesProcessed = data.total_pages_processed || 0;

    console.log('[HolyOne Import] Extracted', holyNames.length, 'names from', totalPagesProcessed, 'pages');

    // Verify extraction completeness
    if (holyNames.length === 0) {
      return Response.json({ 
        error: 'No Holy Names found in PDF',
        extraction_data: data
      }, { status: 400 });
    }

    // Import each Holy Name into database
    const importResults = [];
    const errors = [];
    
    for (let i = 0; i < holyNames.length; i++) {
      const name = holyNames[i];
      const nameId = `HN-${String(i + 1).padStart(3, '0')}`;
      
      try {
        const record = {
          name_id: nameId,
          arabic_name: name.arabic_name || '',
          arabic_transliteration: name.arabic_transliteration || '',
          malayalam_pronunciation: name.malayalam_pronunciation || '',
          meaning_malayalam: name.meaning_malayalam || '',
          explanation_malayalam: name.explanation_malayalam || '',
          virtues_benefits: name.virtues_benefits || '',
          islamic_information: name.islamic_information || '',
          authentic_notes: name.authentic_notes || '',
          amal_wazifa: name.amal_wazifa || '',
          warnings_conditions: name.warnings_conditions || '',
          source_page: name.source_page || null,
          source_reference: name.source_reference || '',
          order_index: i + 1,
          is_favorite: false,
          view_count: 0,
          created_by: user.id,
          created_date: new Date().toISOString(),
          archived: false
        };

        await base44.entities.HolyOneName.create(record);
        importResults.push({ name_id: nameId, arabic_name: name.arabic_name, status: 'success' });
        console.log('[HolyOne Import] Created record:', nameId);
      } catch (err) {
        const error = { name_id: nameId, arabic_name: name.arabic_name, error: err.message };
        errors.push(error);
        console.error('[HolyOne Import] Failed to create record:', nameId, err.message);
      }
    }

    // Final verification
    const importedCount = await base44.entities.HolyOneName.filter({ 
      created_by: user.id,
      archived: false 
    }).then(r => r.length);

    const successCount = importResults.length;
    const errorCount = errors.length;

    // Verify data integrity
    const integrityCheck = {
      expected_names: totalNamesFound,
      imported_names: importedCount,
      success_count: successCount,
      error_count: errorCount,
      all_imported: importedCount === totalNamesFound && errorCount === 0,
      missing_count: totalNamesFound - importedCount
    };

    if (!integrityCheck.all_imported) {
      console.error('[HolyOne Import] DATA INTEGRITY WARNING:', integrityCheck);
    }

    return Response.json({
      status: 'success',
      message: 'Holy Names imported successfully',
      extraction_summary: {
        total_names_found: totalNamesFound,
        total_pages_processed: totalPagesProcessed,
        extraction_notes: data.extraction_notes || ''
      },
      import_summary: {
        total_processed: holyNames.length,
        successful_imports: successCount,
        failed_imports: errorCount,
        total_in_database: importedCount
      },
      integrity_check: integrityCheck,
      imported_names: importResults.slice(0, 20), // First 20 for preview
      errors: errors.length > 0 ? errors : null,
      warning: !integrityCheck.all_imported ? 'DATA INTEGRITY CHECK FAILED - Some names may be missing' : null
    });

  } catch (error) {
    console.error('[HolyOne Import] Fatal error:', error);
    return Response.json({ 
      error: 'Import failed', 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all PDF Holy Names that need content
    const allNames = await base44.entities.HolyOnePDFName.list();
    const namesNeedingContent = allNames.filter(n => !n.explanation_malayalam || !n.virtues_benefits);

    if (namesNeedingContent.length === 0) {
      return Response.json({ message: 'All names already have complete content', count: 0 });
    }

    // PDF file URLs - these should be uploaded to the app
    // You need to upload these PDFs first via the file upload
    const pdfFiles = {
      'pdf1_pages_1_40': 'YOUR_PDF1_URL_HERE',
      'pdf2_pages_41_120': 'YOUR_PDF2_URL_HERE',
      'pdf3_pages_121_186': 'YOUR_PDF3_URL_HERE'
    };

    const results = [];
    let processed = 0;

    for (const name of namesNeedingContent) {
      try {
        const pdfUrl = pdfFiles[name.source_pdf_file];
        if (!pdfUrl) {
          results.push({ pdf_name_id: name.pdf_name_id, status: 'error', message: 'PDF file not found' });
          continue;
        }

        // Extract content for this specific name from PDF
        // This requires the PDF to be uploaded and accessible
        const extraction = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: pdfUrl,
          json_schema: {
            type: 'object',
            properties: {
              arabic_name: { type: 'string' },
              transliteration: { type: 'string' },
              meaning: { type: 'string' },
              explanation: { type: 'string' },
              virtues_benefits: { type: 'string' },
              islamic_info: { type: 'string' },
              notes_warnings: { type: 'string' },
              references: { type: 'string' }
            },
            required: ['arabic_name']
          }
        });

        if (extraction.status === 'success' && extraction.output) {
          const output = extraction.output;
          
          // Update the record with complete content
          await base44.entities.HolyOnePDFName.update(name.id, {
            arabic_transliteration: output.transliteration || name.arabic_transliteration,
            meaning_malayalam: output.meaning || name.meaning_malayalam,
            explanation_malayalam: output.explanation || '',
            virtues_benefits: output.virtues_benefits || '',
            islamic_information: output.islamic_info || '',
            authentic_notes: output.notes_warnings || '',
            verification_status: 'pending'
          });

          results.push({ pdf_name_id: name.pdf_name_id, status: 'success' });
          processed++;
        } else {
          results.push({ pdf_name_id: name.pdf_name_id, status: 'error', message: 'Extraction failed' });
        }
      } catch (error) {
        results.push({ pdf_name_id: name.pdf_name_id, status: 'error', message: error.message });
      }
    }

    return Response.json({
      message: `Processed ${processed} names`,
      total: namesNeedingContent.length,
      results: results.slice(0, 20) // First 20 results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
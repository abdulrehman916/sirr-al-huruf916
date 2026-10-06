import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const {
      pdf_name_id,
      surah_name,
      surah_number,
      arabic_name,
      arabic_transliteration,
      malayalam_pronunciation,
      meaning_malayalam,
      explanation_malayalam,
      virtues_benefits,
      islamic_information,
      authentic_notes,
      source_pdf_page,
      source_pdf_file,
      source_reference_arabic,
      order_in_surah,
      global_order,
      import_batch
    } = await req.json();

    // Validate required fields
    if (!pdf_name_id || !arabic_name || !malayalam_pronunciation || !meaning_malayalam || !source_pdf_page || !source_pdf_file) {
      return Response.json({ 
        error: 'Missing required fields: pdf_name_id, arabic_name, malayalam_pronunciation, meaning_malayalam, source_pdf_page, source_pdf_file' 
      }, { status: 400 });
    }

    // Check if already exists
    const existing = await base44.entities.HolyOnePDFName.filter({ pdf_name_id });
    if (existing && existing.length > 0) {
      return Response.json({ 
        status: 'skipped', 
        message: `Name ${pdf_name_id} already exists`,
        existing_id: existing[0].id
      });
    }

    // Create the record
    const newRecord = await base44.entities.HolyOnePDFName.create({
      pdf_name_id,
      surah_name: surah_name || null,
      surah_number: surah_number || null,
      arabic_name,
      arabic_transliteration: arabic_transliteration || null,
      malayalam_pronunciation,
      meaning_malayalam,
      explanation_malayalam: explanation_malayalam || null,
      virtues_benefits: virtues_benefits || null,
      islamic_information: islamic_information || null,
      authentic_notes: authentic_notes || null,
      source_pdf_page,
      source_pdf_file,
      source_reference_arabic: source_reference_arabic || null,
      order_in_surah: order_in_surah || null,
      global_order: global_order || null,
      import_batch: import_batch || null,
      verification_status: 'pending',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
      created_by: user.id
    });

    return Response.json({
      status: 'success',
      message: `Successfully imported ${pdf_name_id}`,
      record_id: newRecord.id,
      pdf_name_id
    });

  } catch (error) {
    console.error('Error in importSingleHolyOneFromPDF:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { page_path, requires_permission, price, description, default_duration, reading_code_required } = await req.json();

    if (!page_path || typeof requires_permission !== 'boolean') {
      return Response.json({ error: 'Invalid input: page_path and requires_permission (boolean) required' }, { status: 400 });
    }

    // Use hardcoded page names mapping for simplicity
    const pageNames = {
      '/': 'Home',
      '/abjad': 'Abjad Kabir',
      '/anasir': 'Anasir',
      '/hadim': 'Hadim',
      '/mizaan9': 'Mizan 9',
      '/magic-sqayer': 'Magic Sqayer',
      '/vefkin-yapilisi': 'Vefkin Yapilisi',
      '/basthul-huroof-2': 'Bast Huroof',
      '/faal-hasrath': 'Faal Hasrath',
      '/plants': 'Plants',
      '/evil-jinn': 'Evil Jinn',
      '/holy-names': 'Holy Names',
      '/astro-clock': 'Astro Clock',
      '/admin/page-permissions': 'Page Permissions',
      '/admin/support': 'Support Management',
      '/admin/permissions': 'Permission Management',
      '/admin/dashboard': 'Admin Dashboard',
      '/admin/faal-chob-upload': 'Faal Chob Upload',
      '/hierarchy-audit': 'Hierarchy Audit',
      '/pipeline-test': 'Pipeline Test',
      '/audit-report': 'Audit Report',
      '/istintak-discovery': 'Istintak Discovery',
      '/manuscript-pipeline': 'Manuscript Pipeline',
      '/abjad-bast-audit': 'Abjad Bast Audit',
      '/mizan-calculation-audit': 'Mizan Calculation Audit',
      '/vefk-audit': 'Vefk Audit',
      '/method-classification': 'Method Classification',
      '/manuscript-verification': 'Manuscript Verification',
      '/manuscript-analysis': 'Manuscript Analysis',
      '/vefk-model-verification': 'Vefk Model Verification',
      '/rubai-verification': 'Rubai Verification',
      '/manuscript-audit': 'Manuscript Audit',
      '/manuscript-audit-full': 'Manuscript Audit Full',
      '/manuscript-action-finder': 'Manuscript Action Finder',
      '/manuscript-library': 'Manuscript Library',
      '/manuscript-final-audit': 'Manuscript Final Audit',
      '/astrology-only-audit': 'Astrology Only Audit',
      '/manuscript-browser': 'Manuscript Browser',
      '/manuscript-rule-audit': 'Manuscript Rule Audit',
      '/manuscript-search': 'Manuscript Search',
      '/manazil-quality-audit': 'Manazil Quality Audit',
      '/manuscript-completion-report': 'Manuscript Completion Report',
      '/customer-service': 'Customer Service',
      '/admin/test': 'Admin Test'
    };

    const pageName = pageNames[page_path] || page_path;

    // Upsert: try to find existing record, update or create
    const existingConfigs = await base44.entities.PageVisibilityConfig.filter({ page_path });
    
    const now = new Date().toISOString();
    
    if (existingConfigs && existingConfigs.length > 0) {
      // Update existing
      const updateData = { requires_permission, updated_by: user.id, updated_at: now };
      if (price !== undefined) updateData.price = price;
      if (description !== undefined) updateData.description = description;
      if (default_duration !== undefined) updateData.default_duration = default_duration;
      if (reading_code_required !== undefined) updateData.reading_code_required = reading_code_required;
      await base44.entities.PageVisibilityConfig.update(existingConfigs[0].id, updateData);
      
      // Create audit log
      try {
        await base44.functions.invoke('createAuditLog', {
          action_type: 'PAGE_VISIBILITY_CHANGE',
          target_entity: 'PageVisibilityConfig',
          target_id: existingConfigs[0].id,
          details: JSON.stringify({ page_path, page_name: pageName, requires_permission, changed_by: user.email }),
          ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || null
        });
      } catch (auditError) {
        console.error("Failed to create audit log:", auditError);
      }
      
      return Response.json({ 
        success: true, 
        message: `Page ${page_path} visibility updated to ${requires_permission ? 'PRIVATE' : 'PUBLIC'}`,
        page_path,
        requires_permission,
        action: 'updated'
      });
    } else {
      // Create new
      const createData = {
        page_path,
        page_name: pageName,
        requires_permission,
        admin_only: page_path.startsWith('/admin/'),
        updated_by: user.id,
        updated_at: now
      };
      if (price !== undefined) createData.price = price;
      if (description !== undefined) createData.description = description;
      if (default_duration !== undefined) createData.default_duration = default_duration;
      if (reading_code_required !== undefined) createData.reading_code_required = reading_code_required;
      await base44.entities.PageVisibilityConfig.create(createData);
      
      // Create audit log
      try {
        await base44.functions.invoke('createAuditLog', {
          action_type: 'PAGE_VISIBILITY_CHANGE',
          target_entity: 'PageVisibilityConfig',
          details: JSON.stringify({ page_path, page_name: pageName, requires_permission, created_by: user.email }),
          ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || null
        });
      } catch (auditError) {
        console.error("Failed to create audit log:", auditError);
      }
      
      return Response.json({ 
        success: true, 
        message: `Page ${page_path} visibility created as ${requires_permission ? 'PRIVATE' : 'PUBLIC'}`,
        page_path,
        requires_permission,
        action: 'created'
      });
    }

  } catch (error) {
    console.error('updatePageVisibility error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
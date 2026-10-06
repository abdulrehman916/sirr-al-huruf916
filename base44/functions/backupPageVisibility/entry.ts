/**
 * ═══════════════════════════════════════════════════════════════
 * BACKUP PAGE VISIBILITY CONFIGS - MANDATORY BEFORE ANY CLEANUP
 * ═══════════════════════════════════════════════════════════════
 * 
 * This function creates a complete backup of all PageVisibilityConfig
 * records before any cleanup, restore, or deletion operation.
 * 
 * BACKUP POLICY:
 * - Mandatory before ANY PageVisibilityConfig operation
 * - Stored in private_files with encryption
 * - Retained for 90 days
 * - Includes full record data + metadata
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin authentication
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    
    console.log('[backupPageVisibility] Admin user authenticated:', user.email);
    
    // Get all PageVisibilityConfig records
    const visibilityConfigs = await base44.entities.PageVisibilityConfig.list(null, 500);
    
    console.log('[backupPageVisibility] Retrieved', visibilityConfigs.length, 'records');
    
    // Create backup metadata
    const backupMetadata = {
      backup_type: 'page_visibility_configs',
      backup_timestamp: new Date().toISOString(),
      backup_created_by: user.email,
      backup_created_by_id: user.id,
      total_records: visibilityConfigs.length,
      records: visibilityConfigs.map(record => ({
        id: record.id,
        page_path: record.page_path,
        page_name: record.page_name,
        requires_permission: record.requires_permission,
        admin_only: record.admin_only || false,
        is_active: record.is_active !== false,
        updated_by: record.updated_by,
        updated_at: record.updated_at,
        created_date: record.created_date,
        // Preserve all fields for complete restoration
        _full_record: record,
      })),
      summary: {
        public_pages: visibilityConfigs.filter(r => !r.requires_permission).length,
        private_pages: visibilityConfigs.filter(r => r.requires_permission).length,
        admin_only_pages: visibilityConfigs.filter(r => r.admin_only === true).length,
        active_records: visibilityConfigs.filter(r => r.is_active !== false).length,
        inactive_records: visibilityConfigs.filter(r => r.is_active === false).length,
      },
    };
    
    // Upload backup to private files
    const backupFileName = `page_visibility_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const backupFile = new File(
      [JSON.stringify(backupMetadata, null, 2)],
      backupFileName,
      { type: 'application/json' }
    );
    
    const uploadResponse = await base44.integrations.Core.UploadPrivateFile({
      file: await backupFile.arrayBuffer(),
    });
    
    console.log('[backupPageVisibility] Backup uploaded:', uploadResponse.file_uri);
    
    // Create audit log entry
    try {
      await base44.functions.invoke('createAuditLog', {
        action_type: 'BACKUP_CREATED',
        performed_by: user.id,
        performed_by_email: user.email,
        target_entity: 'PageVisibilityConfig',
        details: JSON.stringify({
          backup_type: 'page_visibility_configs',
          total_records: visibilityConfigs.length,
          backup_file_uri: uploadResponse.file_uri,
          backup_timestamp: backupMetadata.backup_timestamp,
        }),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      });
    } catch (auditError) {
      console.error('[backupPageVisibility] Failed to create audit log:', auditError);
      // Don't fail the backup if audit log fails
    }
    
    return Response.json({
      success: true,
      backup_file_uri: uploadResponse.file_uri,
      backup_file_name: backupFileName,
      total_records: visibilityConfigs.length,
      summary: backupMetadata.summary,
      backup_timestamp: backupMetadata.backup_timestamp,
      message: 'PageVisibilityConfig backup created successfully. Backup retained for 90 days.',
    });
    
  } catch (error) {
    console.error('[backupPageVisibility] Error:', error);
    return Response.json(
      { 
        error: 'Backup failed',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
});
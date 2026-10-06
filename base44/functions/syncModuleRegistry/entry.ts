import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * syncModuleRegistry — Automatic Feature/Method/Section Registration
 *
 * Synchronizes the module list (from moduleManifest, sent by frontend) to
 * FeatureConfig database records. This ensures every feature/method/section/tool
 * automatically appears in: Admin → Page Access feature selectors, Access Code
 * feature selectors, Redeem Approval, and all feature permission systems.
 *
 * Safe operations ONLY:
 *   - Creates missing records with default values
 *   - Updates feature_name/icon for auto-created records (never overwrites admin-customized fields)
 *   - Deactivates records for removed modules (never deletes — preserves permissions)
 *   - Reactivates records when modules come back (only for auto-created records)
 *   - NEVER touches admin-configured fields: requires_permission, is_purchasable,
 *     price, description, sort_order (when admin has customized)
 *
 * Security: Uses service role for entity operations. No admin auth required —
 * this runs on app load for all users. Input is validated (max 500 modules).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const modules = body?.modules;

    if (!Array.isArray(modules) || modules.length === 0) {
      return Response.json(
        { error: 'Invalid input: modules array required' },
        { status: 400 }
      );
    }

    if (modules.length > 500) {
      return Response.json(
        { error: 'Too many modules (max 500)' },
        { status: 400 }
      );
    }

    // Validate and sanitize each module
    const validModules = modules
      .filter(
        (m) =>
          m &&
          typeof m.page_path === 'string' &&
          m.page_path.startsWith('/') &&
          typeof m.module_id === 'string' &&
          m.module_id.length > 0 &&
          typeof m.module_name === 'string' &&
          m.module_name.length > 0
      )
      .map((m) => ({
        page_path: m.page_path,
        page_name: (m.page_name || '').substring(0, 200),
        module_id: m.module_id.substring(0, 100),
        module_name: m.module_name.substring(0, 200),
        module_type: m.module_type || 'FEATURE',
        icon: (m.icon || '').substring(0, 50),
        sort_order: typeof m.sort_order === 'number' ? m.sort_order : 0,
      }));

    if (validModules.length === 0) {
      return Response.json(
        { error: 'No valid modules provided' },
        { status: 400 }
      );
    }

    // Fetch all existing FeatureConfig records
    const existing =
      await base44.asServiceRole.entities.FeatureConfig.list(
        '-updated_at',
        500
      );
    const existingMap = {};
    (existing || []).forEach((e) => {
      if (e.page_path && e.feature_id) {
        const key = `${e.page_path}::${e.feature_id}`;
        existingMap[key] = e;
      }
    });

    const now = new Date().toISOString();
    let created = 0,
      updated = 0,
      deactivated = 0,
      reactivated = 0,
      unchanged = 0;
    const moduleKeys = new Set(
      validModules.map((m) => `${m.page_path}::${m.module_id}`)
    );

    // Phase 1: Upsert — create missing records, update names for auto-created ones
    for (const mod of validModules) {
      const key = `${mod.page_path}::${mod.module_id}`;
      const ex = existingMap[key];

      if (ex) {
        // Only update fields if the record was auto-created (no admin has customized it).
        const isAutoCreated = !ex.updated_by;
        const needsNameUpdate =
          isAutoCreated && ex.feature_name !== mod.module_name;
        const needsPageNameUpdate =
          isAutoCreated && ex.page_name !== mod.page_name;
        const needsIconUpdate = isAutoCreated && ex.icon !== mod.icon;
        const needsReactivate = isAutoCreated && ex.is_active === false;

        if (needsNameUpdate || needsPageNameUpdate || needsIconUpdate || needsReactivate) {
          const updateData = { updated_at: now };
          if (needsNameUpdate) updateData.feature_name = mod.module_name;
          if (needsPageNameUpdate) updateData.page_name = mod.page_name;
          if (needsIconUpdate) updateData.icon = mod.icon;
          if (needsReactivate) updateData.is_active = true;
          await base44.asServiceRole.entities.FeatureConfig.update(
            ex.id,
            updateData
          );
          if (needsReactivate) {
            reactivated++;
          } else {
            updated++;
          }
        } else {
          unchanged++;
        }
      } else {
        // Create new record with safe defaults
        await base44.asServiceRole.entities.FeatureConfig.create({
          config_id: `FC-${mod.module_id}`,
          page_path: mod.page_path,
          page_name: mod.page_name,
          feature_id: mod.module_id,
          feature_name: mod.module_name,
          requires_permission: true,
          is_purchasable: true,
          icon: mod.icon,
          is_active: true,
          sort_order: mod.sort_order,
          updated_at: now,
        });
        created++;
      }
    }

    // Phase 2: Deactivate orphaned records (modules no longer in manifest)
    // Only deactivate auto-created records — never touch admin-customized ones
    for (const ex of existing || []) {
      if (ex.page_path && ex.feature_id) {
        const key = `${ex.page_path}::${ex.feature_id}`;
        if (
          !moduleKeys.has(key) &&
          ex.is_active !== false &&
          !ex.updated_by
        ) {
          await base44.asServiceRole.entities.FeatureConfig.update(
            ex.id,
            {
              is_active: false,
              updated_at: now,
            }
          );
          deactivated++;
        }
      }
    }

    return Response.json({
      success: true,
      created,
      updated,
      deactivated,
      reactivated,
      unchanged,
      total_modules: validModules.length,
      total_records: (existing || []).length,
    });
  } catch (error) {
    console.error('syncModuleRegistry error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
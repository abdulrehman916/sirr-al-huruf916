import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * syncPageVisibility — Automatic Page Access Registration
 *
 * Synchronizes the route list (from routeManifest, sent by frontend) to
 * PageVisibilityConfig database records. This ensures every page automatically
 * appears in: Admin → Page Access, Access Code selection, Redeem Approval,
 * Customer Page Permissions, and all page selectors.
 *
 * Safe operations ONLY:
 *   - Creates missing records with default values
 *   - Updates page_name for auto-created records (never overwrites admin-customized names)
 *   - Archives records for deleted routes (never deletes — preserves existing permissions)
 *   - NEVER touches admin-configured fields: price, requires_permission, is_purchasable,
 *     display_order, default_duration, reading_code_required, description
 *
 * Security: Uses service role for entity operations. No admin auth required —
 * this runs on app load for all users. The function only performs safe upserts
 * and never exposes sensitive data. Input is validated (max 200 routes, valid paths).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const routes = body?.routes;

    if (!Array.isArray(routes) || routes.length === 0) {
      return Response.json(
        { error: 'Invalid input: routes array required' },
        { status: 400 }
      );
    }

    if (routes.length > 200) {
      return Response.json(
        { error: 'Too many routes (max 200)' },
        { status: 400 }
      );
    }

    // Validate and sanitize each route
    const validRoutes = routes
      .filter(
        (r) =>
          r &&
          typeof r.path === 'string' &&
          r.path.startsWith('/') &&
          typeof r.page_name === 'string' &&
          r.page_name.length > 0
      )
      .map((r) => ({
        path: r.path,
        page_name: r.page_name.substring(0, 200), // cap name length
        requires_permission: r.requires_permission !== false,
        admin_only: r.admin_only === true,
      }));

    if (validRoutes.length === 0) {
      return Response.json(
        { error: 'No valid routes provided' },
        { status: 400 }
      );
    }

    // Fetch all existing PageVisibilityConfig records
    const existing =
      await base44.asServiceRole.entities.PageVisibilityConfig.list(
        '-updated_at',
        500
      );
    const existingMap = {};
    (existing || []).forEach((e) => {
      if (e.page_path) existingMap[e.page_path] = e;
    });

    const now = new Date().toISOString();
    let created = 0,
      updated = 0,
      archived = 0,
      unchanged = 0;
    const routePaths = new Set(validRoutes.map((r) => r.path));

    // Phase 1: Upsert — create missing records, update names for auto-created ones
    for (const route of validRoutes) {
      const ex = existingMap[route.path];
      if (ex) {
        // Only update page_name if the record was auto-created (no admin has edited it).
        // Heuristic: updated_by is empty/null means no admin has customized it yet.
        const isAutoCreated = !ex.updated_by;
        const needsNameUpdate =
          isAutoCreated && ex.page_name !== route.page_name;
        const needsUnarchive = ex.archived === true;

        if (needsNameUpdate || needsUnarchive) {
          const updateData = { updated_at: now };
          if (needsNameUpdate) updateData.page_name = route.page_name;
          if (needsUnarchive) updateData.archived = false;
          await base44.asServiceRole.entities.PageVisibilityConfig.update(
            ex.id,
            updateData
          );
          updated++;
        } else {
          unchanged++;
        }
      } else {
        // Create new record with safe defaults
        await base44.asServiceRole.entities.PageVisibilityConfig.create({
          page_path: route.path,
          page_name: route.page_name,
          requires_permission: route.requires_permission,
          admin_only: route.admin_only,
          is_purchasable: true,
          display_order: 0,
          default_duration: 'LIFETIME',
          reading_code_required: true,
          archived: false,
          updated_at: now,
        });
        created++;
      }
    }

    // Phase 2: Archive records for routes that no longer exist in routeManifest
    for (const ex of existing || []) {
      if (ex.page_path && !routePaths.has(ex.page_path) && !ex.archived) {
        await base44.asServiceRole.entities.PageVisibilityConfig.update(
          ex.id,
          {
            archived: true,
            updated_at: now,
          }
        );
        archived++;
      }
    }

    return Response.json({
      success: true,
      created,
      updated,
      archived,
      unchanged,
      total_routes: validRoutes.length,
      total_records: (existing || []).length,
    });
  } catch (error) {
    console.error('syncPageVisibility error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
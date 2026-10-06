import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Update support conversation (status, priority, assignment, etc.)
 * Admin only.
 * 
 * Input: { conversation_id, status?, priority?, assigned_to?, notes? }
 * Output: { success, updated_at }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const { conversation_id, status, priority, assigned_to, notes, tags } = await req.json();

    if (!conversation_id) {
      return Response.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Verify conversation exists
    const conversations = await base44.asServiceRole.entities.SupportConversation.filter({ conversation_id }, null, 1);
    if (!conversations || conversations.length === 0) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conv = conversations[0];
    const nowISO = new Date().toISOString();
    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status;
      if (status === 'RESOLVED') {
        updateData.resolved_at = nowISO;
        updateData.resolved_by = user.id;
      }
      if (status === 'CLOSED') {
        updateData.closed_at = nowISO;
      }
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (assigned_to !== undefined) {
      updateData.assigned_to = assigned_to;
      updateData.assigned_at = nowISO;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (tags !== undefined) {
      updateData.tags = tags;
    }

    await base44.asServiceRole.entities.SupportConversation.update(conv.id, updateData);

    // Log action
    await base44.asServiceRole.entities.AuditLog.create({
      log_id: 'AUDIT-' + crypto.randomUUID().toUpperCase(),
      action_type: 'SUPPORT_CONVERSATION_UPDATE',
      performed_by: user.id,
      performed_by_email: user.email,
      target_entity: 'SupportConversation',
      target_id: conversation_id,
      details: JSON.stringify({ status, priority, assigned_to }),
      timestamp: nowISO
    });

    return Response.json({
      success: true,
      updated_at: nowISO,
      conversation_id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Get messages for a specific conversation.
 * 
 * Input: { conversation_id, limit?: number, skip?: number }
 * Output: { messages, total, has_more }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { conversation_id, limit = 100, skip = 0 } = await req.json();

    if (!conversation_id) {
      return Response.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Try to get authenticated user
    let user = null;
    let session_id = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      const body = await req.json();
      session_id = body.session_id;
    }

    // Verify conversation exists and user has access
    const conversations = await base44.asServiceRole.entities.SupportConversation.filter({ conversation_id }, null, 1);
    if (!conversations || conversations.length === 0) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conv = conversations[0];

    // Check access
    if (!user && conv.user_session_id !== session_id) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }
    if (user && conv.user_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch messages
    const allMessages = await base44.asServiceRole.entities.SupportChatMessage.filter(
      { conversation_id },
      'created_at', // Ascending order (oldest first)
      1000 // Max limit to prevent abuse
    );

    const total = allMessages.length;
    const messages = allMessages.slice(skip, skip + limit);
    const has_more = skip + limit < total;

    // Mark admin messages as read if viewing as customer
    if (user && user.role !== 'admin') {
      const unreadAdminMessages = messages.filter(m => m.sender_type === 'ADMIN' && !m.is_read);
      if (unreadAdminMessages.length > 0) {
        const nowISO = new Date().toISOString();
        await base44.asServiceRole.entities.SupportChatMessage.updateMany(
          { 
            conversation_id, 
            sender_type: 'ADMIN',
            is_read: false
          },
          { $set: { is_read: true, read_at: nowISO } }
        );

        // Update conversation unread count
        await base44.asServiceRole.entities.SupportConversation.update(conv.id, {
          customer_unread_count: 0
        });
      }
    }

    // Mark customer messages as read if viewing as admin
    if (user && user.role === 'admin') {
      const unreadCustomerMessages = messages.filter(m => m.sender_type === 'CUSTOMER' && !m.is_read);
      if (unreadCustomerMessages.length > 0) {
        const nowISO = new Date().toISOString();
        await base44.asServiceRole.entities.SupportChatMessage.updateMany(
          { 
            conversation_id, 
            sender_type: 'CUSTOMER',
            is_read: false
          },
          { $set: { is_read: true, read_at: nowISO } }
        );

        // Update conversation unread count
        await base44.asServiceRole.entities.SupportConversation.update(conv.id, {
          unread_count: 0
        });
      }
    }

    return Response.json({
      messages,
      total,
      has_more,
      conversation_id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
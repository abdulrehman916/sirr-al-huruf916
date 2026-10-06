import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Get support conversations for current user (customer or admin).
 * 
 * Input: { limit?: number, skip?: number, status?: string, search?: string }
 * Output: { conversations, total, has_more }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { limit = 50, skip = 0, status, search, category } = await req.json();

    // Try to get authenticated user
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      // Not authenticated
    }

    let query: any = {};

    if (user && user.role === 'admin') {
      // Admin sees all conversations
      if (status) query.status = status;
      if (category) query.category = category;
      
      if (search) {
        // Search in subject, user_name, user_email
        // Note: Base44 filter doesn't support $or for text search, so we'll filter client-side
      }
    } else if (user) {
      // Authenticated customer - only their conversations
      query.user_id = user.id;
    } else {
      // Guest - need session_id
      const body = await req.json();
      const session_id = body.session_id;
      if (!session_id) {
        return Response.json({ error: 'Session ID required' }, { status: 400 });
      }
      query.user_session_id = session_id;
    }

    // Fetch conversations
    const conversations = await base44.asServiceRole.entities.SupportConversation.list('-last_message_at', limit + 1);
    
    // Apply filters
    let filtered = conversations || [];
    
    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }
    if (category) {
      filtered = filtered.filter(c => c.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c => 
        (c.subject || '').toLowerCase().includes(searchLower) ||
        (c.user_name || '').toLowerCase().includes(searchLower) ||
        (c.user_email || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);
    const has_more = skip + limit < total;

    // Fetch last message for each conversation (optional - can be done client-side)
    const conversationsWithMessages = await Promise.all(paginated.map(async (conv) => {
      const messages = await base44.asServiceRole.entities.SupportChatMessage.filter(
        { conversation_id: conv.conversation_id },
        '-created_at',
        1
      );
      return {
        ...conv,
        last_message: messages && messages.length > 0 ? messages[0] : null
      };
    }));

    return Response.json({
      conversations: conversationsWithMessages,
      total,
      has_more,
      limit,
      skip
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
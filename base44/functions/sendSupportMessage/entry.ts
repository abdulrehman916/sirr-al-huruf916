import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Send a message in an existing support conversation.
 * 
 * Input: { conversation_id, message, attachment_url?, attachment_type?, attachment_name?, attachment_size?, audio_duration? }
 * Output: { message_id, created_at, sender_type }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { conversation_id, message, attachment_url, attachment_type, attachment_name, attachment_size, audio_duration } = await req.json();

    if (!conversation_id) {
      return Response.json({ error: 'Conversation ID is required' }, { status: 400 });
    }
    if (!message || (typeof message !== 'string' && !attachment_url)) {
      return Response.json({ error: 'Message or attachment is required' }, { status: 400 });
    }

    // Try to get authenticated user
    let user = null;
    let session_id = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      // Not authenticated
    }

    if (!user) {
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

    const now = new Date();
    const nowISO = now.toISOString();
    const message_id = 'MSG-' + now.getTime() + '-' + crypto.randomUUID().substring(0, 6).toUpperCase();

    // Determine sender type
    const sender_type = user && user.role === 'admin' ? 'ADMIN' : 'CUSTOMER';
    const sender_id = user ? user.id : session_id;
    const sender_name = user ? user.full_name : 'Guest User';

    // Determine message type
    let message_type = 'TEXT';
    if (attachment_url) {
      if (attachment_type?.startsWith('image/')) message_type = 'IMAGE';
      else if (attachment_type?.startsWith('video/')) message_type = 'VIDEO';
      else if (attachment_type?.startsWith('audio/')) message_type = 'AUDIO';
      else message_type = 'FILE';
    }

    // Create message
    const chatMessage = await base44.asServiceRole.entities.SupportChatMessage.create({
      message_id,
      conversation_id,
      sender_type,
      sender_id,
      sender_name,
      message: message?.trim() || '',
      message_type,
      attachment_url: attachment_url || null,
      attachment_name: attachment_name || null,
      attachment_size: attachment_size || null,
      attachment_type: attachment_type || null,
      audio_duration: audio_duration || null,
      is_read: false,
      created_at: nowISO
    });

    // Update conversation
    const updateData: any = {
      last_message_at: nowISO,
      last_message_from: sender_type,
      message_count: (conv.message_count || 0) + 1
    };

    if (sender_type === 'CUSTOMER') {
      updateData.unread_count = (conv.unread_count || 0) + 1;
      updateData.customer_unread_count = 0;
      if (conv.status === 'RESOLVED' || conv.status === 'CLOSED') {
        updateData.status = 'OPEN';
      }
    } else {
      updateData.customer_unread_count = (conv.customer_unread_count || 0) + 1;
      updateData.unread_count = 0;
    }

    await base44.asServiceRole.entities.SupportConversation.update(conv.id, updateData);

    return Response.json({
      success: true,
      message_id,
      conversation_id,
      created_at: nowISO,
      sender_type,
      message_type
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
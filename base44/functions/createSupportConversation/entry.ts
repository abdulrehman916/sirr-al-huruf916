import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Create a new support conversation.
 * 
 * Input: { subject, category, message, attachment_url?, attachment_type? }
 * Output: { conversation_id, message_id, created_at }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { subject, category, message, attachment_url, attachment_type, attachment_name, attachment_size } = await req.json();

    // Validate inputs
    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return Response.json({ error: 'Subject is required' }, { status: 400 });
    }
    if (!category || typeof category !== 'string') {
      return Response.json({ error: 'Category is required' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Try to get authenticated user, fall back to guest
    let user = null;
    let session_id = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      // Not authenticated - will use guest session
    }

    if (!user) {
      // Guest user - need session_id
      const body = await req.json();
      session_id = body.session_id;
      if (!session_id) {
        return Response.json({ error: 'Session ID required for guest users' }, { status: 400 });
      }
    }

    const now = new Date();
    const nowISO = now.toISOString();
    const conversation_id = 'CONV-' + now.getTime() + '-' + crypto.randomUUID().substring(0, 6).toUpperCase();
    const message_id = 'MSG-' + now.getTime() + '-' + crypto.randomUUID().substring(0, 6).toUpperCase();

    // Create conversation
    const conversation = await base44.asServiceRole.entities.SupportConversation.create({
      conversation_id,
      user_id: user ? user.id : null,
      user_name: user ? user.full_name : 'Guest User',
      user_email: user ? user.email : 'guest@session.local',
      user_session_id: session_id,
      subject: subject.trim(),
      category,
      status: 'OPEN',
      priority: 'NORMAL',
      last_message_at: nowISO,
      last_message_from: 'CUSTOMER',
      unread_count: 1,
      customer_unread_count: 0,
      message_count: 1,
      created_at: nowISO
    });

    // Create first message
    const chatMessage = await base44.asServiceRole.entities.SupportChatMessage.create({
      message_id,
      conversation_id,
      sender_type: 'CUSTOMER',
      sender_id: user ? user.id : session_id,
      sender_name: user ? user.full_name : 'Guest User',
      message: message.trim(),
      message_type: attachment_url ? (attachment_type?.startsWith('image/') ? 'IMAGE' : attachment_type?.startsWith('video/') ? 'VIDEO' : attachment_type?.startsWith('audio/') ? 'AUDIO' : 'FILE') : 'TEXT',
      attachment_url: attachment_url || null,
      attachment_name: attachment_name || null,
      attachment_size: attachment_size || null,
      attachment_type: attachment_type || null,
      is_read: false,
      created_at: nowISO
    });

    // Send notification to admin (optional - can be enhanced later)
    // await base44.integrations.Core.SendEmail({ ... });

    return Response.json({
      success: true,
      conversation_id,
      message_id,
      created_at: nowISO,
      status: 'OPEN'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
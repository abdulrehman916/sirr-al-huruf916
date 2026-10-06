import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { ticket_id, message, attachment_url } = await req.json();

    if (!ticket_id || !message) {
      return Response.json({ error: 'ticket_id and message required' }, { status: 400 });
    }

    const now = new Date();
    const messageId = `MSG-${now.getTime()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // PRINCIPLE: Never expose admin personal identity - use branded support name
    const supportMessage = await base44.entities.SupportMessage.create({
      message_id: messageId,
      ticket_id: ticket_id,
      sender_type: 'ADMIN',
      sender_id: user.id,
      sender_name: 'Sirr al-Huruf Support', // BRANDED - never show personal name
      message: message,
      attachment_url: attachment_url || null,
      created_at: now.toISOString(),
      is_read: false
    });

    // Update ticket status to IN_PROGRESS if it was OPEN
    const tickets = await base44.entities.SupportTickets.filter({ ticket_id });
    if (tickets.length > 0 && tickets[0].status === 'OPEN') {
      await base44.entities.SupportTickets.update(tickets[0].id, {
        status: 'IN_PROGRESS'
      });
    }

    return Response.json({
      success: true,
      message_id: messageId,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    console.error('createSupportMessage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
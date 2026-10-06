import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { ticket_id, status, admin_reply } = await req.json();

    if (!ticket_id) {
      return Response.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    // Find ticket by ticket_id
    const tickets = await base44.entities.SupportTickets.filter({ ticket_id });
    if (tickets.length === 0) {
      return Response.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = tickets[0];
    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (admin_reply !== undefined) {
      updateData.admin_reply = admin_reply;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No updates provided' }, { status: 400 });
    }

    const updated = await base44.entities.SupportTickets.update(ticket.id, updateData);

    return Response.json({ 
      success: true, 
      message: 'Ticket updated successfully',
      ticket: updated
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
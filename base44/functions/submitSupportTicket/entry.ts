import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get current user (optional - ticket can be submitted without login)
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      // User not logged in - that's ok for support tickets
    }

    const { 
      name, 
      mobile, 
      email, 
      category, 
      subject, 
      message, 
      attachment_url,
      audio_url,
      audio_duration,
      audio_type
    } = await req.json();

    // Validate required fields
    if (!name || !mobile || !email || !category || !subject || !message) {
      return Response.json({ 
        error: 'Missing required fields: name, mobile, email, category, subject, message' 
      }, { status: 400 });
    }

    const now = new Date();
    const ticketId = `SUP-${now.getTime()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create support ticket
    const ticket = await base44.entities.SupportTickets.create({
      ticket_id: ticketId,
      name,
      mobile,
      email,
      category,
      subject,
      message,
      attachment_url: attachment_url || '',
      audio_url: audio_url || '',
      audio_duration: audio_duration || 0,
      audio_type: audio_type || '',
      status: 'OPEN',
      admin_reply: '',
      created_at: now.toISOString()
    });

    // Send WhatsApp notification to admin for new access requests
    if (category === 'Access Problem') {
      try {
        await base44.functions.invoke('sendWhatsAppNotification', {
          type: 'ADMIN_NEW_ACCESS_REQUEST',
          recipientPhone: Deno.env.get("ADMIN_WHATSAPP_NUMBER") || "",
          userName: name,
          pageName: subject,
          duration: 'Pending Review'
        });
      } catch (whatsappError) {
        console.error('Admin WhatsApp notification failed:', whatsappError.message);
        // Don't fail the ticket submission if WhatsApp fails
      }
    }

    return Response.json({
      success: true,
      message: 'Support ticket submitted successfully',
      ticket_id: ticketId,
      ticket
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});
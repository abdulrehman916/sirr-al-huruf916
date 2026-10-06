import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { ticket_id, admin_reply, customer_email, customer_name, ticket_subject } = await req.json();

    if (!ticket_id || !admin_reply || !customer_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email to customer
    const emailBody = `
Dear ${customer_name},

Thank you for contacting Sirr al-Huruf Customer Support.

Regarding your ticket: ${ticket_id} - ${ticket_subject}

Our support team has responded to your inquiry:

---
${admin_reply}
---

If you have any further questions, please reply to this email or submit a new ticket through our customer service portal.

Best regards,
Sirr al-Huruf Support Team
support@sirralhuruf.com
    `.trim();

    await base44.integrations.Core.SendEmail({
      to: customer_email,
      subject: `Re: Support Ticket ${ticket_id} - ${ticket_subject}`,
      body: emailBody,
      from_name: 'Sirr al-Huruf Support'
    });

    return Response.json({ 
      success: true, 
      message: 'Email notification sent successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
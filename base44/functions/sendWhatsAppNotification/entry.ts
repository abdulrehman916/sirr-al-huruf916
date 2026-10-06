import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user (admin or system)
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, recipientPhone, pageName, duration, expiryDate, userName } = await req.json();

    // Validate required fields
    if (!type || !recipientPhone) {
      return Response.json({ error: 'Missing required fields: type, recipientPhone' }, { status: 400 });
    }

    // Get WhatsApp credentials from environment
    const whatsappApiKey = Deno.env.get("WHATSAPP_API_KEY");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const businessAccountId = Deno.env.get("WHATSAPP_BUSINESS_ACCOUNT_ID");

    // If credentials not set, log and return success (graceful degradation)
    if (!whatsappApiKey || !phoneNumberId) {
      console.log('WhatsApp credentials not configured. Notification skipped.');
      return Response.json({ 
        success: true, 
        message: 'WhatsApp not configured. Notification skipped.',
        wouldHaveSent: { type, recipientPhone, pageName, duration, expiryDate }
      });
    }

    // Prepare message based on notification type
    let messageText = '';
    
    if (type === 'SUBSCRIPTION_PURCHASED') {
      messageText = `
*🎉 Subscription Activated!*

Dear ${userName || 'Valued User'},

Your subscription has been successfully activated.

📖 *Page:* ${pageName}
⏱️ *Duration:* ${duration}
📅 *Expiry Date:* ${expiryDate ? new Date(expiryDate).toLocaleDateString('en-GB', { 
  day: 'numeric', 
  month: 'long', 
  year: 'numeric' 
}) : 'Lifetime Access'}

Thank you for your purchase!

Need help? Contact support.
      `.trim();
    } else if (type === 'ACCESS_GRANTED') {
      messageText = `
*✅ Access Granted!*

Dear ${userName || 'Valued User'},

You have been granted access to:

📖 *Page:* ${pageName}
⏱️ *Duration:* ${duration}
📅 *Expiry Date:* ${expiryDate ? new Date(expiryDate).toLocaleDateString('en-GB', { 
  day: 'numeric', 
  month: 'long', 
  year: 'numeric' 
}) : 'Lifetime Access'}

You can now access this page immediately.

Enjoy your access!
      `.trim();
    } else if (type === 'ADMIN_NEW_ACCESS_REQUEST') {
      messageText = `
*🔔 New Access Request*

A new access request has been submitted.

👤 *User:* ${userName || 'Unknown'}
📖 *Page:* ${pageName}
⏱️ *Duration:* ${duration}

Please review and process this request.
      `.trim();
    } else {
      return Response.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Send WhatsApp message via Meta Cloud API
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: {
          body: messageText
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', result);
      return Response.json({ 
        success: false, 
        error: 'Failed to send WhatsApp message',
        details: result 
      }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      messageId: result.messages?.[0]?.id,
      recipientPhone 
    });

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});
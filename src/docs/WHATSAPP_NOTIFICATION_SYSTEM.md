# WhatsApp Notification System

## Overview

Automated WhatsApp notifications for subscription events and access requests.

---

## 📱 Notification Types

### 1. **SUBSCRIPTION_PURCHASED**
Sent when a user purchases a subscription via Razorpay.

**Trigger:** `createPageSubscription` function  
**Recipient:** User's mobile number  
**Content:**
- Page name
- Duration (1 Month, 6 Months, 1 Year, Lifetime)
- Expiry date

### 2. **ACCESS_GRANTED**
Sent when admin manually grants access to a user.

**Trigger:** `grantManualAccess` function  
**Recipient:** User's mobile number  
**Content:**
- Page name
- Duration
- Expiry date

### 3. **ADMIN_NEW_ACCESS_REQUEST**
Sent to admin when a user submits an access request via support.

**Trigger:** `submitSupportTicket` function (Access Problem category)  
**Recipient:** Admin's WhatsApp number  
**Content:**
- User name
- Requested page
- Status (Pending Review)

---

## 🔧 Setup Instructions

### Step 1: Get WhatsApp Cloud API Credentials

1. Go to [Meta Developers](https://developers.facebook.com)
2. Create a WhatsApp Business App
3. Get the following credentials:
   - **WhatsApp API Key** (Access Token)
   - **Phone Number ID**
   - **Business Account ID**

### Step 2: Configure Secrets

In Base44 Dashboard → Settings → Secrets:

```
WHATSAPP_API_KEY=your_whatsapp_api_key_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
ADMIN_WHATSAPP_NUMBER=+971501234567
```

**Note:** ADMIN_WHATSAPP_NUMBER should include country code (e.g., +971 for UAE, +91 for India)

### Step 3: Test the System

1. Purchase a subscription → User receives WhatsApp
2. Grant manual access → User receives WhatsApp
3. Submit "Access Problem" ticket → Admin receives WhatsApp

---

## 📝 Message Templates

### Subscription Purchased
```
🎉 Subscription Activated!

Dear [User Name],

Your subscription has been successfully activated.

📖 Page: [Page Name]
⏱️ Duration: [Duration]
📅 Expiry Date: [Date]

Thank you for your purchase!

Need help? Contact support.
```

### Access Granted
```
✅ Access Granted!

Dear [User Name],

You have been granted access to:

📖 Page: [Page Name]
⏱️ Duration: [Duration]
📅 Expiry Date: [Date]

You can now access this page immediately.

Enjoy your access!
```

### Admin Access Request
```
🔔 New Access Request

A new access request has been submitted.

👤 User: [User Name]
📖 Page: [Page Name]
⏱️ Duration: [Duration]

Please review and process this request.
```

---

## 🛠️ Backend Functions

### `sendWhatsAppNotification`
Main function to send WhatsApp messages.

**Parameters:**
- `type`: Notification type (SUBSCRIPTION_PURCHASED | ACCESS_GRANTED | ADMIN_NEW_ACCESS_REQUEST)
- `recipientPhone`: WhatsApp number with country code
- `userName`: User's name for personalization
- `pageName`: Page being accessed
- `duration`: Access duration
- `expiryDate`: ISO 8601 timestamp or null for lifetime

**Returns:**
```json
{
  "success": true,
  "messageId": "wamid.HBgN...",
  "recipientPhone": "+971501234567"
}
```

### `submitSupportTicket`
Creates support ticket and notifies admin for access requests.

**Parameters:**
- `name`: User name
- `mobile`: User mobile
- `email`: User email
- `category`: Ticket category
- `subject`: Ticket subject
- `message`: Ticket message
- `attachment_url`: Optional file URL
- `audio_url`: Optional audio URL
- `audio_duration`: Audio duration in seconds
- `audio_type`: Audio file type

**Returns:**
```json
{
  "success": true,
  "ticket_id": "SUP-1234567890-ABC",
  "ticket": { ... }
}
```

---

## 🔄 Integration Points

### 1. Subscription Purchase Flow
```
User → RazorpayPayment → createPageSubscription → WhatsApp to User
```

### 2. Manual Access Grant Flow
```
Admin → GrantAccessModal → grantManualAccess → WhatsApp to User
```

### 3. Access Request Flow
```
User → CustomerService → submitSupportTicket → WhatsApp to Admin
```

---

## ⚠️ Graceful Degradation

If WhatsApp credentials are not configured:
- Notifications are skipped gracefully
- No errors are shown to users
- Console logs the would-have-sent data
- All operations (subscription, access grant) still succeed

This allows the system to work without WhatsApp setup.

---

## 📊 Testing

### Test Without Credentials
1. Don't set WhatsApp secrets
2. Purchase subscription
3. Check console logs for "WhatsApp not configured" message
4. Verify subscription still activates

### Test With Credentials
1. Set all WhatsApp secrets
2. Purchase subscription
3. Check user's WhatsApp for notification
4. Verify message content matches

### Test Admin Notification
1. Set ADMIN_WHATSAPP_NUMBER
2. Submit support ticket with category "Access Problem"
3. Check admin's WhatsApp for notification

---

## 🔐 Security

- All WhatsApp API calls use HTTPS
- API key stored securely in secrets
- Phone numbers validated before sending
- Failed notifications don't block core functionality
- User data only sent to their own number

---

## 📱 Supported Countries

WhatsApp works globally. Ensure phone numbers include:
- Country code (e.g., +971, +91, +1)
- No spaces or special characters (except +)
- Example: `+971501234567`

---

## 🚨 Troubleshooting

### WhatsApp not sending
1. Check secrets are set correctly
2. Verify phone number format (with country code)
3. Check Meta Developer app is active
4. Review console logs for errors

### Admin not receiving notifications
1. Verify ADMIN_WHATSAPP_NUMBER is set
2. Check ticket category is "Access Problem"
3. Ensure admin number can receive WhatsApp messages

### User not receiving notifications
1. Verify user's mobile number is stored in profile
2. Check number format (with country code)
3. Ensure user's WhatsApp is active

---

## 💰 Costs

WhatsApp Business API pricing (as of 2024):
- **User-initiated conversations**: First 1000/month free
- **Business-initiated conversations**: Charged per conversation
- **Template messages**: Varies by country

Check [Meta Pricing](https://developers.facebook.com/docs/whatsapp/pricing) for current rates.

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Last Updated:** 2026-06-15
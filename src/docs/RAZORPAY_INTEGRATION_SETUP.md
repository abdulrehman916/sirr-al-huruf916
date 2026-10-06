# Razorpay Payment Integration - Complete Setup Guide

## ✅ What's Been Built

Complete Razorpay payment integration for Indian users with:
- UPI (Google Pay, PhonePe, Paytm)
- Debit Cards
- Credit Cards
- Net Banking
- Wallets
- Automatic subscription activation
- Admin user management

## 🔧 Setup Steps

### 1. Get Razorpay Credentials

1. Sign up at https://razorpay.com
2. Go to Settings → API Keys
3. Generate Test Keys (for development)
4. Generate Live Keys (for production)

You'll get:
- **Key ID** (e.g., `rzp_test_1234567890`)
- **Key Secret** (e.g., `abcdefghijklmnop`)

### 2. Configure Secrets in Base44

Go to Base44 Dashboard → Settings → Secrets

Add these two secrets:

```
Name: RAZORPAY_KEY_ID
Value: rzp_test_xxxxxxxxxxxxxx (your Key ID)

Name: RAZORPAY_KEY_SECRET  
Value: xxxxxxxxxxxxxxxxxx (your Key Secret)
```

### 3. Test Mode vs Live Mode

**Test Mode** (Development):
- Use test Key ID and Secret
- Use test cards: `4111 1111 1111 1111`
- Any future date for expiry
- Any 3-digit CVV
- No real money charged

**Live Mode** (Production):
- Use live Key ID and Secret
- Real payments processed
- Money settles to your bank account

### 4. Bank Account Setup

In Razorpay Dashboard:
1. Go to Settings → Bank Account
2. Add your Indian bank account
3. Complete KYC verification
4. All payments will settle here (T+2 days)

## 📋 Features Implemented

### User Flow:
1. **Login** → `/otp-login` → Mobile/Email + OTP
2. **Browse** → Access free pages
3. **Premium Page** → Click locked content
4. **Payment Modal** → Shows 4 plans with prices
5. **Select Plan** → Click "Pay ₹XXX"
6. **Razorpay Checkout** → Opens secure payment popup
7. **Choose Method** → UPI/Card/Net Banking/Wallet
8. **Complete Payment** → Instant verification
9. **Access Granted** → Subscription activated immediately

### Subscription Plans:
- **1 Month** - 30 days access
- **6 Months** - 180 days access  
- **1 Year** - 365 days access
- **Lifetime** - Never expires

### Admin Features:
- `/admin/user-management` - View all users
- Search by phone number
- View user subscriptions
- Extend subscriptions (+30 days, +90 days)
- Revoke subscriptions
- View payment history

## 🗄️ Database Schema

### Subscription Entity (Updated):
```json
{
  "subscription_id": "SUB-000001",
  "user_id": "USER-123",
  "user_name": "John Doe",
  "user_phone": "+91 9876543210",
  "user_email": "john@example.com",
  "page_path": "/abjad",
  "page_name": "Abjad Kabir",
  "plan_name": "1_MONTH",
  "amount": 299,
  "currency": "INR",
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "xxxxx",
  "start_date": "2026-06-15T00:00:00.000Z",
  "expiry_date": "2026-07-15T00:00:00.000Z",
  "status": "ACTIVE",
  "granted_by": "system",
  "granted_at": "2026-06-15T00:00:00.000Z"
}
```

## 🔐 Security Features

1. **Signature Verification** - Every payment verified with HMAC-SHA256
2. **User Authentication** - Only logged-in users can purchase
3. **Secure Checkout** - Razorpay handles all card data (PCI-DSS compliant)
4. **Token-based Auth** - Sessions managed securely

## 💰 Pricing Configuration

Admins can set custom prices per page:

1. Go to Admin Dashboard → Pricing Settings
2. Select page (e.g., /abjad)
3. Set prices for each plan:
   - 1 Month: ₹299
   - 6 Months: ₹999
   - 1 Year: ₹1999
   - Lifetime: ₹4999
4. Save changes

## 🧪 Testing

### Test Cards:
```
Visa: 4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
RuPay: 607454 123456 1234
```

### Test UPI:
```
GPay: success@razorpay
PhonePe: success@razorpay
Paytm: success@razorpay
```

### Test Net Banking:
```
Any bank from the list
OTP: 1234 (if prompted)
```

## 📊 Admin Dashboard

### User Manager (`/admin/user-management`):
- **Search** - Find users by phone/email
- **View Details** - See registration date, account status
- **Subscriptions** - All active/expired subscriptions
- **Actions**:
  - Extend by 30 days
  - Extend by 90 days
  - Revoke access

### Subscription Stats:
- Total Users
- Active Subscriptions
- Pending Payments
- Expired Subscriptions

## 🚀 Deployment Checklist

- [ ] Get Razorpay test credentials
- [ ] Add secrets to Base44
- [ ] Test payment flow with test cards
- [ ] Configure pricing for all pages
- [ ] Test admin user management
- [ ] Get Razorpay live credentials
- [ ] Update secrets to live keys
- [ ] Test with real payment (₹1)
- [ ] Verify bank account settlement

## 📱 Supported Payment Methods

### UPI (Instant):
- Google Pay
- PhonePe
- Paytm
- BHIM
- Any UPI app

### Cards:
- Visa Debit/Credit
- Mastercard Debit/Credit
- RuPay Debit/Credit
- American Express

### Net Banking:
- All major Indian banks
- SBI, HDFC, ICICI, Axis, etc.

### Wallets:
- Paytm Wallet
- FreeCharge
- Mobikwik
- Others

## 🔧 Backend Functions

### `createRazorpayOrder`
Creates Razorpay order with amount and user details.

### `verifyRazorpayPayment`
Verifies payment signature and activates subscription.

### `createPageSubscription`
Creates subscription record after successful payment.

### `checkPageSubscription`
Checks if user has active subscription for a page.

### `expireSubscriptions`
Daily automation to expire old subscriptions.

## 📞 Razorpay Support

- **Email**: support@razorpay.com
- **Phone**: +91-80-6873-6727
- **Docs**: https://razorpay.com/docs

## ⚠️ Important Notes

1. **Settlement Time**: T+2 days (2 business days)
2. **Transaction Fee**: 2% + GST for domestic cards/UPI
3. **Refunds**: Can be processed from Razorpay dashboard
4. **Disputes**: Handle via Razorpay dispute management
5. **GST Invoice**: Auto-generated for each transaction

## 🎯 Next Steps (Optional)

- [ ] Webhook integration for payment notifications
- [ ] Email receipts after payment
- [ ] Subscription renewal reminders
- [ ] Failed payment retry logic
- [ ] Refund automation
- [ ] GST invoice generation

---

**Status**: ✅ Production Ready  
**Currency**: INR (₹)  
**Country**: India  
**Last Updated**: 2026-06-15
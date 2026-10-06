# OTP Login & Automatic Subscription System

## Overview
Complete authentication and subscription management system with OTP-based login, page-specific subscriptions, admin approval workflow, and automatic expiry handling.

## Features

### 1. OTP Login System
- **Login Methods**: Mobile number or Email
- **Two-Step Process**:
  1. User enters mobile/email → OTP sent
  2. User enters OTP → Verified and logged in
- **No Password Required**: Secure OTP-based authentication
- **Auto-Registration**: New users automatically created on first login

**Pages**:
- `/otp-login` - OTP login page

**Backend Functions**:
- `generateLoginOTP` - Generates and sends OTP
- `verifyLoginOTP` - Verifies OTP and creates user session

### 2. Page-Specific Subscriptions

**Subscription Plans**:
- 1 Month
- 6 Months
- 1 Year
- Lifetime (one-time payment)

**User Flow**:
1. User accesses premium page
2. If no active subscription → Payment modal shown
3. User selects plan and uploads payment proof
4. Admin reviews and approves/rejects
5. Upon approval → Access granted automatically

**Pages**:
- `/subscription-payment/:pagePath` - Payment submission
- `/subscription-pending` - Pending approval confirmation
- `/subscription-expired/:pagePath` - Renewal page

### 3. Admin Management

**Admin Dashboard Features**:
- View all subscriptions (pending, active, expired, cancelled)
- Approve/reject pending subscriptions
- View payment proof uploaded by users
- Extend subscriptions manually
- Filter and search subscriptions

**Admin Pages**:
- `/admin/subscriptions-management` - Manage all subscriptions
- `/admin/page-subscriptions` - Configure page-specific plans
- `/admin/pricing-settings` - Set custom prices per page

### 4. Automatic Expiry System

**Scheduled Automation**:
- Runs daily to check expired subscriptions
- Automatically marks expired subscriptions as "EXPIRED"
- Users lose access immediately upon expiry
- Renewal option shown on expired subscription page

**Backend Function**:
- `expireSubscriptions` - Checks and expires old subscriptions

### 5. Access Control Integration

**ProtectedPage Component**:
- Checks user authentication
- Verifies active subscriptions
- Shows payment modal if no subscription
- Handles expired subscriptions with renewal option

## Database Entities

### Subscription
```json
{
  "subscription_id": "SUB-000001",
  "user_id": "USER-123",
  "page_path": "/abjad",
  "page_name": "Abjad Kabir",
  "plan_name": "1_MONTH",
  "start_date": "2026-06-15T00:00:00.000Z",
  "expiry_date": "2026-07-15T00:00:00.000Z",
  "status": "ACTIVE", // PENDING, ACTIVE, EXPIRED, CANCELLED
  "granted_by": "admin",
  "granted_at": "2026-06-15T00:00:00.000Z",
  "notes": "Payment proof: https://..."
}
```

### SubscriptionPricing
```json
{
  "pricing_id": "PRICE-000001",
  "page_path": "/abjad",
  "page_name": "Abjad Kabir",
  "plan_name": "1_MONTH",
  "price": 299,
  "currency": "AED",
  "is_active": true
}
```

### UserAccessProfile
```json
{
  "user_id": "USER-123",
  "mobile": "+971501234567",
  "email": "user@example.com",
  "mobile_verified": true,
  "email_verified": true,
  "registration_date": "2026-06-15T00:00:00.000Z",
  "last_login": "2026-06-15T12:00:00.000Z",
  "account_status": "ACTIVE"
}
```

## Backend Functions

### Authentication
- `generateLoginOTP` - Send OTP to mobile/email
- `verifyLoginOTP` - Verify OTP and login user
- `createUserAccessProfile` - Create user profile on first login

### Subscriptions
- `createPageSubscription` - Create subscription (PENDING status)
- `checkPageSubscription` - Check if user has active subscription
- `getPagePricing` - Get pricing for a page
- `updatePagePricing` - Admin updates pricing
- `expireSubscriptions` - Auto-expire old subscriptions

## Setup Instructions

### 1. Configure Pricing
1. Go to Admin Dashboard → Pricing Settings
2. Set prices for each page and plan
3. Save changes

### 2. Create Subscription Plans
1. Go to Admin Dashboard → Page Subscriptions
2. Select page to configure
3. Enable subscription requirement
4. Set available plans

### 3. Setup Automation (Daily Expiry Check)
Create scheduled automation:
- Function: `expireSubscriptions`
- Schedule: Daily at 2:00 AM
- Automation Type: Scheduled

### 4. Test User Flow
1. Logout if logged in
2. Go to `/otp-login`
3. Enter mobile/email → Get OTP
4. Enter OTP → Login successful
5. Access premium page → Payment modal appears
6. Upload payment proof → Submit
7. Admin approves → Access granted

## Admin Workflow

### Approving Subscriptions
1. Go to `/admin/subscriptions-management`
2. Filter by "PENDING" status
3. Click "View Payment Proof" to verify
4. Click ✓ to approve or ✗ to reject
5. User gets access immediately upon approval

### Extending Subscriptions
1. Find user's subscription in management page
2. Click extend button
3. Add days/months to expiry
4. Save changes

### Setting Prices
1. Go to `/admin/pricing-settings`
2. Select page from dropdown
3. Edit prices for each plan
4. Save changes
5. Prices update immediately in payment modal

## Security Notes

- OTP codes expire after 5 minutes
- Maximum 3 OTP attempts allowed
- Payment proofs stored securely
- Admin-only access to subscription management
- Automatic session timeout handling

## Future Enhancements

- [ ] Automated payment gateway integration (Stripe/PayPal)
- [ ] Email notifications on approval/expiry
- [ ] Recurring payment support
- [ ] Multiple payment methods
- [ ] Subscription analytics dashboard
- [ ] Refund management
- [ ] Promo codes and discounts
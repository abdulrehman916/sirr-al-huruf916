# Manual Admin Access Control System

## ✅ Features Implemented

Complete manual access control system for administrators to grant, extend, and revoke user access without payment.

## 🔍 Search Users

Admins can search users by:
- **Phone Number** - Search by mobile number (partial match)
- **Email** - Search by email address (partial match)  
- **Name** - Search by full name (partial match)
- **All Fields** - Search across all fields simultaneously

### Search UI:
- Dropdown to select search type
- Real-time filtering
- Shows match count
- Works with partial queries

## 🎁 Grant Manual Access

### How It Works:

1. **Find User** - Search and locate the user
2. **Click "Grant Access"** - Gold button on user card
3. **Select Duration**:
   - 30 Days
   - 6 Months
   - 1 Year
   - Lifetime (never expires)
4. **Select Pages**:
   - Individual page selection
   - "Select All" option
   - Visual checkboxes with page names
5. **Confirm** - Access granted instantly

### Backend Function: `grantManualAccess`

**Input:**
```json
{
  "user_id": "USER-123",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "user_phone": "+91 9876543210",
  "grants": [
    {
      "page_path": "/abjad",
      "page_name": "Abjad Kabir",
      "plan_name": "30_DAYS"
    },
    {
      "page_path": "/vefkin-yapilisi",
      "page_name": "Vefk",
      "plan_name": "LIFETIME"
    }
  ]
}
```

**Output:**
```json
{
  "success": true,
  "message": "Granted 2 of 2 permissions",
  "results": [
    {
      "success": true,
      "action": "created",
      "permission_id": "PERM-1234567890-ABC123",
      "page_path": "/abjad",
      "page_name": "Abjad Kabir",
      "plan_name": "30_DAYS"
    }
  ]
}
```

## 📊 What Gets Created

### 1. PagePermission Entity
```json
{
  "permission_id": "PERM-1234567890-ABC123",
  "user_id": "USER-123",
  "page_path": "/abjad",
  "page_name": "Abjad Kabir",
  "permission_code": "ABJAD_ACCESS",
  "granted_by": "ADMIN-USER-ID",
  "granted_at": "2026-06-15T00:00:00.000Z",
  "start_date": "2026-06-15T00:00:00.000Z",
  "expiry_date": "2026-07-15T00:00:00.000Z",
  "is_active": true,
  "is_revoked": false,
  "extended_count": 0
}
```

### 2. Subscription Entity (for consistency)
```json
{
  "subscription_id": "SUB-MANUAL-1234567890-ABC",
  "user_id": "USER-123",
  "page_path": "/abjad",
  "page_name": "Abjad Kabir",
  "plan_name": "1_MONTH",
  "amount": 0,
  "currency": "INR",
  "start_date": "2026-06-15T00:00:00.000Z",
  "expiry_date": "2026-07-15T00:00:00.000Z",
  "status": "ACTIVE",
  "granted_by": "ADMIN-USER-ID",
  "granted_at": "2026-06-15T00:00:00.000Z",
  "notes": "Manual admin grant by Admin Name"
}
```

**Key Points:**
- `amount: 0` - No payment required
- `status: "ACTIVE"` - Immediate access
- `notes` - Tracks admin who granted
- Works alongside paid subscriptions

## 🔄 Extend Access

Admins can extend existing subscriptions:
- **+30 Days** button on active subscriptions
- **+90 Days** button on active subscriptions
- **Reactivate** button on expired subscriptions

Extends from current expiry date (or from today if expired).

## ❌ Revoke Access

Admins can revoke access:
- Click "Revoke" button
- Sets subscription status to "CANCELLED"
- User loses access immediately
- Record preserved for audit

## 📋 Available Pages for Grant

All premium pages available:
- Abjad Kabir (`/abjad`)
- Vefk (`/vefkin-yapilisi`)
- Mizan (`/mizaan9`)
- Hadim (`/hadim`)
- Anasir (`/anasir`)
- Magic Sqayer (`/magic-sqayer`)
- Bast Huroof (`/basthul-huroof-2`)
- Faal Hasrath (`/faal-hasrath`)
- Plants (`/plants`)
- Evil Jinn (`/evil-jinn`)
- Holy Names (`/holy-names`)
- Astro Clock (`/astro-clock`)

## 🎯 Use Cases

### 1. Free Trial Grant
```
Duration: 30 Days
Pages: Selected pages
Use: Give user trial access
```

### 2. VIP Lifetime Access
```
Duration: Lifetime
Pages: All pages (Select All)
Use: Grant permanent access to VIP users
```

### 3. Contest Winner
```
Duration: 1 Year
Pages: All pages
Use: Prize for contest winners
```

### 4. Beta Tester
```
Duration: 6 Months
Pages: Specific pages being tested
Use: Grant access for testing new features
```

### 5. Customer Support
```
Duration: 30 Days
Pages: Page user had issue with
Use: Compensate for technical problems
```

## 🔐 Security

- **Admin Only** - Requires `role: "admin"`
- **Authenticated** - Uses `base44.auth.me()`
- **Audit Trail** - Tracks who granted access
- **No Bypass** - Cannot bypass payment system (creates parallel access)

## 📊 Admin Dashboard Stats

Shows:
- Total Users
- Active Subscriptions (paid + manual)
- Expired Subscriptions
- Manual Grants (via amount: 0 filter)

## 🗄️ Database Schema

### UserAccessProfile
```json
{
  "user_id": "USER-123",
  "mobile": "+91 9876543210",
  "email": "john@example.com",
  "full_name": "John Doe",
  "registration_date": "2026-06-15T00:00:00.000Z",
  "account_status": "ACTIVE",
  "total_permissions": 5,
  "active_permissions": 3
}
```

### PagePermission
```json
{
  "permission_id": "PERM-xxx",
  "user_id": "USER-123",
  "page_path": "/abjad",
  "permission_code": "ABJAD_ACCESS",
  "granted_by": "ADMIN-ID",
  "start_date": "ISO date",
  "expiry_date": "ISO date",
  "is_active": true,
  "is_revoked": false
}
```

### Subscription
```json
{
  "subscription_id": "SUB-MANUAL-xxx",
  "user_id": "USER-123",
  "page_path": "/abjad",
  "plan_name": "1_MONTH",
  "amount": 0,
  "status": "ACTIVE",
  "granted_by": "ADMIN-ID",
  "notes": "Manual admin grant"
}
```

## 🧪 Testing

### Test Scenarios:

1. **Grant Single Page**
   - Find user → Grant Access → Select 1 page → 30 Days → Confirm
   - Verify user can access page

2. **Grant Multiple Pages**
   - Find user → Grant Access → Select 3 pages → 6 Months → Confirm
   - Verify access to all 3 pages

3. **Grant All Pages**
   - Find user → Grant Access → Select All → 1 Year → Confirm
   - Verify access to all pages

4. **Grant Lifetime**
   - Find user → Grant Access → Select pages → Lifetime → Confirm
   - Verify no expiry date

5. **Extend Access**
   - Find user → +30d button on subscription
   - Verify new expiry date

6. **Revoke Access**
   - Find user → Revoke button
   - Verify user cannot access page

7. **Search by Phone**
   - Select "Phone" → Enter partial number
   - Verify matching users shown

8. **Search by Email**
   - Select "Email" → Enter partial email
   - Verify matching users shown

9. **Search by Name**
   - Select "Name" → Enter partial name
   - Verify matching users shown

## 📱 UI Components

### GrantAccessModal
- User info display
- Duration selector (dropdown)
- Page selection (checkboxes)
- Select All option
- Summary display
- Loading states
- Success/error handling

### AdminUserManager
- Search bar with type selector
- User cards with details
- Grant Access button
- Subscription list
- Extend/Revoke actions
- Real-time filtering

## 🚀 Workflow

```
Admin Login
    ↓
Navigate to /admin/user-manager
    ↓
Search for User (phone/email/name)
    ↓
Click "Grant Access" on user card
    ↓
Modal Opens:
  - Shows user details
  - Select duration (30d/6m/1y/lifetime)
  - Select pages (individual or all)
  - Review summary
    ↓
Click "Grant Access"
    ↓
Backend creates:
  - PagePermission records
  - Subscription records (amount: 0)
  - Updates UserAccessProfile
    ↓
Success toast
    ↓
User can now access granted pages
```

## ⚡ Performance

- **Real-time Search** - Instant filtering
- **Batch Grant** - Multiple pages in one call
- **Optimistic UI** - Shows success before refresh
- **Auto-refresh** - Fetches latest data after grant

## 📝 Notes

- Manual grants work independently of payment system
- Users can have both paid and manual subscriptions
- Manual grants tracked separately (amount: 0)
- Admin actions fully auditable
- No limit on number of grants per user
- Can grant same page multiple times (extends access)

## 🎯 Benefits

1. **Flexible Access Control** - Grant access for any reason
2. **No Payment Required** - Bypass payment system when needed
3. **Granular Control** - Per-page, per-duration grants
4. **Full Audit Trail** - Track who granted what and when
5. **Customer Support** - Quick resolution for access issues
6. **Marketing Tool** - Free trials, contests, promotions
7. **Testing** - Grant beta testers access to new features

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-06-15  
**Admin Route**: `/admin/user-manager
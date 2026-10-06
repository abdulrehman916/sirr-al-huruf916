# Approved Users Access System

## Overview
A manual user approval system that grants direct access to trusted users without requiring OTP or access codes.

## Features

### 1. Admin Capabilities
- **Add Approved Users**: Admin can manually add users by email (phone optional)
- **Status Management**: Three states - ACTIVE, BLOCKED, REMOVED
- **Instant Revocation**: Admin can revoke access at any time
- **Access Logging**: Tracks login count, last login time, and status changes

### 2. User Status System
- **ACTIVE**: Full access granted, no OTP required
- **BLOCKED**: Access denied immediately
- **REMOVED**: Access denied, account marked as removed

### 3. Login Flow
Approved users can log in via `/otp-login`:
1. Enter email address
2. System checks ApprovedUser database
3. If ACTIVE → Direct access granted (no OTP)
4. If BLOCKED/REMOVED → Access denied with message
5. If not found → Normal OTP flow proceeds

### 4. Security Features
- **Instant Blocking**: Status changes take effect immediately
- **No Auto-Recovery**: Removed/blocked users cannot regain access without admin approval
- **Access Logging**: All login attempts are tracked
- **Admin-Only Management**: Only admins can approve/revoke users

## Database Schema

### ApprovedUser Entity
```json
{
  "email": "user@example.com",
  "phone": "+971 50 123 4567",
  "full_name": "User Name",
  "status": "ACTIVE | BLOCKED | REMOVED",
  "approved_by": "admin_user_id",
  "approved_at": "ISO timestamp",
  "last_login": "ISO timestamp",
  "login_count": 0,
  "revoked_at": "ISO timestamp",
  "revoked_by": "admin_user_id",
  "revoke_reason": "Reason text",
  "notes": "Admin notes"
}
```

## Backend Functions

### `approveUser`
- **Purpose**: Add a new approved user
- **Input**: email, phone, full_name, notes
- **Access**: Admin only
- **Returns**: success, user object

### `updateUserStatus`
- **Purpose**: Change user status (ACTIVE/BLOCKED/REMOVED)
- **Input**: user_id, status, revoke_reason
- **Access**: Admin only
- **Returns**: success, updated user

### `checkApprovedUser`
- **Purpose**: Verify if email is in approved list
- **Input**: email
- **Access**: Public (for login flow)
- **Returns**: approved (boolean), status, message

## Admin Interface

### Location
`/admin/approved-users` - Accessible from Admin Dashboard sidebar

### Features
- **Search**: Filter by email, name, or phone
- **Status Filter**: View ACTIVE, BLOCKED, REMOVED, or ALL
- **Stats Dashboard**: Count of users by status
- **Add User Modal**: Form to approve new users
- **Status Management**: Block/Remove/Reactivate buttons per user
- **Login Tracking**: Shows login count and last login date

## User Experience

### Approved User Login
1. Navigate to `/otp-login`
2. Select "OTP" tab
3. Enter email address
4. Click "Send OTP"
5. System detects approved status
6. **Instant access granted** - redirected to home page
7. No OTP code required

### Blocked/Removed User
1. Enter email address
2. See error: "Access denied - Account blocked/removed"
3. Must contact admin for reactivation

### Non-Approved User
1. Enter email address
2. Normal OTP flow proceeds
3. Must verify with OTP code

## Integration Points

### OTP Login Page (`/otp-login`)
- Checks `checkApprovedUser` before sending OTP
- Approved users bypass OTP verification
- Seamless integration with existing auth flow

### Admin Dashboard
- New sidebar item: "Approved Users"
- Dedicated management page at `/admin/approved-users`
- Full CRUD operations for approved users

## Access Control

### Row-Level Security (RLS)
- **Create**: Admin only
- **Read**: Admin only
- **Update**: Admin only
- **Delete**: Admin only

### Backend Function Access
All functions require `user.role === 'admin'`:
- `approveUser`
- `updateUserStatus`
- `checkApprovedUser` (public for login flow)

## Audit Trail

### Logged Events
- User approval (who, when)
- Status changes (old → new, reason)
- Login attempts (timestamp, count)
- Revocation details (who, when, why)

## Use Cases

### 1. VIP Customers
- Grant instant access to premium users
- No friction login experience
- Easy to revoke if needed

### 2. Team Members
- Add staff/freelancers quickly
- Track their usage via login count
- Remove access when contract ends

### 3. Testing Accounts
- Create test users for QA
- Block/remove after testing
- No OTP delays during development

### 4. Emergency Access
- Quick access for urgent situations
- Can be granted/revoked instantly
- Full audit trail maintained

## Differences from Other Systems

### vs OTP Login
- **Approved**: No OTP needed, instant access
- **OTP**: Requires email verification code

### vs Access Codes
- **Approved**: Tied to specific email, admin-managed
- **Access Codes**: Shareable codes, customer-redeemed

### vs Subscriptions
- **Approved**: Manual approval, no payment
- **Subscriptions**: Payment-based, automated expiry

## Maintenance

### Best Practices
1. Regular review of approved users list
2. Remove inactive accounts periodically
3. Document reason for each approval
4. Monitor login frequency for anomalies

### Security Notes
- All actions logged for audit
- Instant revocation prevents unauthorized access
- No self-service approval (admin only)
- Status changes are immediate

## Files Created/Modified

### New Files
- `entities/ApprovedUser.json` - Entity schema
- `functions/approveUser.js` - Approve user function
- `functions/updateUserStatus.js` - Status update function
- `functions/checkApprovedUser.js` - Login verification function
- `components/admin/ApprovedUsersTab.jsx` - Admin UI component
- `pages/ApprovedUsersPage.jsx` - Admin page

### Modified Files
- `pages/OTPLogin.jsx` - Added approved user check
- `pages/AdminDashboard.jsx` - Added sidebar item
- `App.jsx` - Added route import
- `lib/routeManifest.js` - Added route entry

## Testing Checklist

- [ ] Admin can add approved user
- [ ] Approved user can login without OTP
- [ ] Blocked user cannot login
- [ ] Removed user cannot login
- [ ] Status change takes effect immediately
- [ ] Login count increments correctly
- [ ] Last login timestamp updates
- [ ] Search/filter works in admin panel
- [ ] Revocation reason is recorded
- [ ] Reactivation restores access
- [ ] Non-approved users still use OTP flow
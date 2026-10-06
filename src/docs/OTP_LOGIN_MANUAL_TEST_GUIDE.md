# OTP Login Manual Testing Guide
**Date:** 2026-06-15  
**Status:** Ready for Manual Testing

---

## 🔑 Step 1: Add JWT_SECRET (Optional but Recommended)

Go to **Base44 Dashboard → Settings → Secrets** and add:

**Name:** `JWT_SECRET`  
**Value:** `9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e`

**Note:** The app works WITHOUT this secret (using simple tokens), but JWT is more secure for production.

---

## 🧪 Step 2: Test OTP Login Flow

### Test Case 1: New User Login (Mobile)

1. **Navigate to:** `/otp-login`
2. **Select:** Mobile tab
3. **Enter:** `+971501234567` (or your mobile)
4. **Click:** "Send OTP"
5. **Expected:** 
   - Toast: "OTP Sent"
   - Console log shows OTP code (e.g., `OTP for +971501234567: 123456`)
6. **Enter OTP:** (from console)
7. **Click:** "Verify & Login"
8. **Expected:**
   - Toast: "Login Successful"
   - Redirected to Home page (`/`)
   - Session created

**✅ Pass Criteria:** User logged in and on Home page

---

### Test Case 2: New User Login (Email)

1. **Navigate to:** `/otp-login`
2. **Select:** Email tab
3. **Enter:** `test@example.com`
4. **Click:** "Send OTP"
5. **Expected:** Toast + console OTP
6. **Enter OTP:** (from console)
7. **Click:** "Verify & Login"
8. **Expected:** Redirected to Home

**✅ Pass Criteria:** Email login works

---

### Test Case 3: Existing User Login

1. **Logout** (if logged in)
2. **Navigate to:** `/otp-login`
3. **Enter:** Same mobile/email as Test Case 1
4. **Complete OTP flow**
5. **Expected:** 
   - Login successful
   - Same user session restored
   - UserAccessProfile.last_login updated

**✅ Pass Criteria:** Existing user can re-login

---

### Test Case 4: Invalid OTP

1. **Navigate to:** `/otp-login`
2. **Enter mobile/email**
3. **Get OTP**
4. **Enter WRONG OTP** (e.g., `000000`)
5. **Click:** "Verify & Login"
6. **Expected:**
   - Error message: "Invalid OTP code"
   - Attempts counter increments
   - Still on OTP entry screen

**✅ Pass Criteria:** Invalid OTP rejected

---

### Test Case 5: Expired OTP

1. **Request OTP**
2. **Wait 6 minutes** (OTP expires in 5 minutes)
3. **Try to verify**
4. **Expected:**
   - Error: "OTP has expired"
   - Must request new OTP

**✅ Pass Criteria:** Expired OTP rejected

---

### Test Case 6: Maximum Attempts

1. **Request OTP**
2. **Enter wrong OTP 3 times**
3. **Expected:**
   - Error: "Maximum attempts exceeded"
   - OTP status changed to 'FAILED'
   - Must request new OTP

**✅ Pass Criteria:** Brute force protection works

---

## 🔐 Step 3: Test Protected Pages

### Test Case 7: Access Public Page (Not Logged In)

1. **Logout** (clear browser storage if needed)
2. **Navigate to:** `/customer-service`
3. **Expected:**
   - Page loads successfully
   - No access denied error
   - Form visible

**✅ Pass Criteria:** Public pages accessible without login

---

### Test Case 8: Access Protected Page (Not Logged In)

1. **Ensure logged out**
2. **Navigate to:** `/abjad`
3. **Expected:**
   - Redirected to `/otp-login`
   - OR shown access denied with login option

**✅ Pass Criteria:** Protected pages require auth

---

### Test Case 9: Access Protected Page (Logged In, No Subscription)

1. **Login** via OTP
2. **Navigate to:** `/abjad`
3. **Expected:**
   - Subscription modal appears
   - Shows pricing plans (1-month, 6-month, 1-year, lifetime)
   - "Request Access" button visible

**✅ Pass Criteria:** Subscription modal shown for premium pages

---

### Test Case 10: Access Admin Page (Regular User)

1. **Login** as regular user (role: 'user')
2. **Navigate to:** `/admin/dashboard`
3. **Expected:**
   - Access denied
   - Redirected to Home
   - Toast: "Only administrators can access this page"

**✅ Pass Criteria:** Admin pages blocked for regular users

---

### Test Case 11: Access Admin Page (Owner Role)

**Prerequisite:** Your user must have role='owner' in Base44 Dashboard → Users

1. **Login** as owner
2. **Navigate to:** `/admin/dashboard`
3. **Expected:**
   - Dashboard loads
   - All sidebar items visible:
     - User Access Manager
     - Pricing Settings
     - Access Requests
     - Subscription Management
     - Access Logs
     - Page Permissions

**✅ Pass Criteria:** Owner has full admin access

---

## 👤 Step 4: Test Owner Role Functions

### Test Case 12: Owner Grants Manual Access

1. **Login as owner**
2. **Go to:** `/admin/user-management`
3. **Click:** "Grant Access" button
4. **Fill form:**
   - Select user
   - Select page: `/abjad`
   - Set start date: today
   - Set expiry date: 30 days from now
5. **Click:** "Grant Access"
6. **Expected:**
   - Success toast
   - Permission created in database
   - User can now access `/abjad`

**✅ Pass Criteria:** Manual access granted successfully

---

### Test Case 13: Owner Toggles Page Visibility

1. **Login as owner**
2. **Go to:** `/admin/page-permissions`
3. **Find:** `/plants` page
4. **Toggle:** PUBLIC → PRIVATE
5. **Expected:**
   - Success message
   - PageVisibilityConfig updated
   - Regular users now need permission for `/plants`

**✅ Pass Criteria:** Page visibility toggle works

---

### Test Case 14: Owner Approves Access Request

**Prerequisite:** Have a pending request in PremiumAccessRequest entity

1. **Login as owner**
2. **Go to:** `/admin/subscription-requests`
3. **Find:** Pending request
4. **Click:** "Approve"
5. **Expected:**
   - Request status: PENDING → APPROVED
   - Subscription created
   - User granted access

**✅ Pass Criteria:** Access request approved

---

## 📊 Step 5: Verify Database Updates

### Check OTPVerification Entity

Go to **Base44 Dashboard → Database → OTPVerification**

Look for records with:
- `status`: 'VERIFIED'
- `verified`: true
- `verified_at`: populated timestamp

**✅ Pass Criteria:** OTP records show successful verification

---

### Check UserAccessProfile Entity

Go to **Base44 Dashboard → Database → UserAccessProfile**

Verify:
- `last_login`: Updated to current timestamp
- `mobile_verified`: true (if mobile OTP)
- `email_verified`: true (if email OTP)

**✅ Pass Criteria:** Profile updated on login

---

### Check AccessLog Entity

Go to **Base44 Dashboard → Database → AccessLog**

Look for:
- Entries for each page access attempt
- `access_result`: 'GRANTED', 'DENIED', 'EXPIRED'
- Correct timestamps and user_ids

**✅ Pass Criteria:** Access attempts logged

---

## 🐛 Common Issues & Solutions

### Issue 1: "Authentication required" error

**Cause:** Session not created properly  
**Solution:** 
1. Clear browser localStorage
2. Reload page
3. Re-login via OTP
4. Check console for errors

---

### Issue 2: OTP not showing in console

**Cause:** Function not logging  
**Solution:**
1. Check Base44 Dashboard → Code → Functions → generateLoginOTP → Logs
2. OTP should be in logs: `OTP for +971...: 123456`

---

### Issue 3: Admin dashboard shows "Access Denied"

**Cause:** User role is 'user' not 'owner'  
**Solution:**
1. Go to Base44 Dashboard → Users
2. Find your user
3. Change role from 'user' to 'owner'
4. Logout and re-login
5. Try again

---

### Issue 4: Protected page always shows subscription modal

**Cause:** No active subscription found  
**Solution:**
1. Login as owner
2. Go to `/admin/user-management`
3. Grant manual access for that page
4. OR create a subscription record manually

---

## ✅ Test Results Checklist

Print this checklist and mark off each test:

- [ ] Test 1: New User Login (Mobile) ✅
- [ ] Test 2: New User Login (Email) ✅
- [ ] Test 3: Existing User Login ✅
- [ ] Test 4: Invalid OTP ✅
- [ ] Test 5: Expired OTP ✅
- [ ] Test 6: Maximum Attempts ✅
- [ ] Test 7: Public Page (Not Logged In) ✅
- [ ] Test 8: Protected Page (Not Logged In) ✅
- [ ] Test 9: Protected Page (No Subscription) ✅
- [ ] Test 10: Admin Page (Regular User) ✅
- [ ] Test 11: Admin Page (Owner) ✅
- [ ] Test 12: Owner Grants Access ✅
- [ ] Test 13: Toggle Page Visibility ✅
- [ ] Test 14: Approve Access Request ✅
- [ ] Database: OTPVerification ✅
- [ ] Database: UserAccessProfile ✅
- [ ] Database: AccessLog ✅

---

## 📝 Notes Section

Use this space to record test results:

**Test Date:** _______________  
**Tester:** _______________  
**Issues Found:**
1. _______________________________________
2. _______________________________________
3. _______________________________________

**Overall Status:** [ ] PASS  [ ] FAIL  [ ] PARTIAL

---

**Last Updated:** 2026-06-15  
**Version:** 1.0  
**Status:** Ready for Testing
# Production Quickstart Guide
**Occult Encyclopedia of Magick Squares**  
**Version:** 2.0 Production Ready  
**Date:** 2026-06-15

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Configure Production Secrets
Go to **Base44 Dashboard → Settings → Secrets** and add:

```
RAZORPAY_KEY_ID = your_razorpay_key_id
RAZORPAY_KEY_SECRET = your_razorpay_key_secret
```

**Note:** OTP login works WITHOUT secrets. Only Razorpay payments require configuration.

---

### Step 2: Test OTP Login
1. Navigate to `/otp-login`
2. Enter your mobile number or email
3. Click "Send OTP"
4. Check console/logs for OTP code
5. Enter OTP and verify
6. You should be redirected to Home page

**Expected Result:** ✅ Successful login, session created

---

### Step 3: Verify Owner Access
1. Login as owner (role = 'owner')
2. Navigate to `/admin/dashboard`
3. Verify all sidebar items are visible:
   - User Access Manager
   - Pricing Settings
   - Access Requests
   - Subscription Management
   - Access Logs
   - Page Permissions

**Expected Result:** ✅ Full admin dashboard accessible

---

### Step 4: Test Protected Routes
1. As owner, navigate to `/admin/page-permissions`
2. Toggle a page from PRIVATE to PUBLIC
3. Logout and login as regular user
4. Try accessing the page

**Expected Result:** ✅ Access granted for PUBLIC pages

---

## 📋 Full Deployment Checklist

### Pre-Launch Tests

#### Authentication ✅
- [ ] OTP login works with mobile
- [ ] OTP login works with email
- [ ] Session persists after page reload
- [ ] Logout clears session properly
- [ ] Redirects to login when not authenticated

#### Owner Role Access ✅
- [ ] Owner can access `/admin/dashboard`
- [ ] Owner can access `/admin/user-management`
- [ ] Owner can access `/admin/pricing-settings`
- [ ] Owner can access `/admin/subscription-requests`
- [ ] Owner can access `/admin/subscriptions-management`
- [ ] Owner can access `/admin/page-permissions`
- [ ] Owner can access `/admin/access-logs`

#### Subscription Flow ✅
- [ ] User sees subscription modal on premium pages
- [ ] Pricing displays correctly (1-month, 6-month, 1-year, lifetime)
- [ ] Razorpay payment modal opens (requires secrets)
- [ ] Payment success creates active subscription
- [ ] Subscription grants immediate access

#### Admin Functions ✅
- [ ] Grant manual access to user
- [ ] Extend permission expiry
- [ ] Revoke permission
- [ ] Approve access request
- [ ] Update page pricing
- [ ] Toggle page visibility

---

## 🔧 Troubleshooting

### Issue: OTP Login Fails
**Symptoms:** Error message "Verification failed"

**Solution:**
1. Check OTP code is correct (6 digits)
2. Verify OTP hasn't expired (5 minute limit)
3. Check console for OTP code (currently logged for testing)
4. Ensure `verifyOTP` function is deployed

---

### Issue: Owner Can't Access Admin Dashboard
**Symptoms:** Redirected to home or access denied

**Solution:**
1. Verify user role is 'owner' or 'admin' in Base44 Dashboard → Users
2. Check browser console for auth errors
3. Clear browser cache and reload
4. Re-login to refresh session

---

### Issue: Subscription Payment Fails
**Symptoms:** Razorpay error or payment not processing

**Solution:**
1. Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set
2. Check Razorpay dashboard for API key validity
3. Test with Razorpay test mode first
4. Verify `createRazorpayOrder` and `verifyRazorpayPayment` functions are deployed

---

### Issue: Protected Page Shows Access Denied
**Symptoms:** User has subscription but still denied

**Solution:**
1. Check subscription status in database (should be 'ACTIVE')
2. Verify subscription expiry_date hasn't passed
3. Check PageVisibilityConfig for page (should be requires_permission: false for PUBLIC)
4. Clear browser cache and reload

---

## 📊 Monitoring & Maintenance

### Daily Tasks
- [ ] Check Access Logs for unusual activity
- [ ] Review pending subscription requests
- [ ] Monitor support tickets

### Weekly Tasks
- [ ] Review subscription expirations
- [ ] Update pricing if needed
- [ ] Check manuscript ingestion status

### Monthly Tasks
- [ ] Audit user permissions
- [ ] Review access logs for patterns
- [ ] Update content based on user feedback

---

## 🎯 Key URLs

| Page | URL | Access |
|------|-----|--------|
| Home | `/` | Public |
| OTP Login | `/otp-login` | Public |
| Admin Dashboard | `/admin/dashboard` | Admin/Owner Only |
| User Management | `/admin/user-management` | Admin/Owner Only |
| Pricing Settings | `/admin/pricing-settings` | Admin/Owner Only |
| Access Requests | `/admin/subscription-requests` | Admin/Owner Only |
| Page Permissions | `/admin/page-permissions` | Admin/Owner Only |
| Access Logs | `/admin/access-logs` | Admin/Owner Only |
| Customer Service | `/customer-service` | Public |

---

## 📞 Support

### User Support
Users can submit support tickets via `/customer-service`

### Admin Support
For platform issues, contact Base44 support

### Technical Issues
1. Check logs in Base44 Dashboard → Code → Functions
2. Review error messages in browser console
3. Verify entity data in Base44 Dashboard → Database

---

## 🎉 Launch Day Protocol

### T-1 Hour (Before Launch)
- [ ] Final OTP login test
- [ ] Verify all admin routes accessible
- [ ] Check Razorpay secrets configured
- [ ] Test one payment transaction
- [ ] Clear all test data from database

### T-0 (Launch)
- [ ] Publish app in Base44 Dashboard
- [ ] Verify production URL loads
- [ ] Test login flow on production
- [ ] Monitor for errors

### T+1 Hour (After Launch)
- [ ] Check access logs
- [ ] Monitor subscription requests
- [ ] Review any error reports
- [ ] Send launch notification to users

---

## 📈 Success Metrics

### Week 1 Goals
- 100% OTP login success rate
- 0 critical errors
- All admin functions operational
- At least 1 successful subscription purchase

### Month 1 Goals
- 95% user retention
- < 2 second page load times
- 100% admin dashboard uptime
- Positive user feedback

---

**Last Updated:** 2026-06-15  
**Status:** ✅ Production Ready  
**Version:** 2.0
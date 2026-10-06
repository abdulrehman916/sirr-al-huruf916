# 📧 RESEND CUSTOM DOMAIN SETUP GUIDE

**Goal:** Improve email deliverability and prevent Gmail spam classification  
**Current Status:** Using Resend testing mode (personal email)  
**Target:** Professional domain-verified email delivery

---

## 🎯 WHY CUSTOM DOMAIN MATTERS

### Current Setup (Testing Mode)
```
From: Sirr al-Huruf <abdulrehmanrehman916@gmail.com>
Status: Testing mode (free tier)
Limitation: Only sends to verified emails
Deliverability: Poor (personal email + automated content)
Spam Score: HIGH
```

### After Domain Verification
```
From: Sirr al-Huruf <noreply@sirralhuruf.com>
Status: Production mode
Capability: Send to ANY email address
Deliverability: Excellent (verified domain + proper DNS)
Spam Score: LOW
```

---

## 📋 STEP-BY-STEP DOMAIN VERIFICATION

### Step 1: Add Domain to Resend

**URL:** https://resend.com/domains

**Action:**
1. Click "Add Domain"
2. Enter domain name: `sirralhuruf.com` (or your domain)
3. Choose region: `us-east-1` (default)
4. Click "Add Domain"

**Result:**
```
Domain: sirralhuruf.com
Status: Pending Verification
Region: us-east-1
```

---

### Step 2: Configure DNS Records

Resend will provide DNS records you need to add to your domain registrar.

**Typical Records Required:**

#### 1. MX Record (Mail Exchange)
```
Type: MX
Name: @ (or sirralhuruf.com)
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: 3600 (or default)
```

**Purpose:** Routes bounce/complaint feedback to Resend

---

#### 2. TXT Record (SPF - Sender Policy Framework)
```
Type: TXT
Name: @ (or sirralhuruf.com)
Value: v=spf1 include:send.resend.com ~all
TTL: 3600 (or default)
```

**Purpose:** Authorizes Resend to send emails on behalf of your domain

**Important:**
- If you already have SPF record, merge them:
  ```
  v=spf1 include:send.resend.com include:_spf.google.com ~all
  ```
- Only ONE SPF record per domain
- `~all` = soft fail (recommended)
- `-all` = hard fail (stricter)

---

#### 3. TXT Record (DKIM - DomainKeys Identified Mail)

Resend provides **3 DKIM records** (Amazon SES):

```
Type: TXT
Name: resend._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD...
TTL: 3600 (or default)
```

```
Type: TXT
Name: resend2._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
TTL: 3600 (or default)
```

```
Type: TXT
Name: resend3._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD...
TTL: 3600 (or default)
```

**Purpose:** Cryptographic signature to verify email authenticity

**Note:** Exact values provided by Resend in dashboard (unique per domain)

---

#### 4. TXT Record (DMARC - Domain-based Message Authentication)

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc-reports@sirralhuruf.com
TTL: 3600 (or default)
```

**Purpose:** Tells receiving servers what to do if SPF/DKIM fail

**DMARC Policies:**
- `p=none` = Monitor only (recommended for setup)
- `p=quarantine` = Send to spam if fails
- `p=reject` = Reject if fails (strictest)

**Advanced DMARC:**
```
v=DMARC1; p=none; rua=mailto:dmarc-reports@sirralhuruf.com; ruf=mailto:dmarc-forensics@sirralhuruf.com; fo=1; pct=100; adkim=s; aspf=s
```

---

### Step 3: Verify DNS Propagation

**Wait Time:** 24-48 hours (usually 1-2 hours)

**Check Status:**
1. Go to Resend dashboard → Domains
2. Click on your domain
3. Check verification status

**DNS Propagation Tools:**
- https://dnschecker.org
- https://whatsmydns.net
- https://mxtoolbox.com

**What to Check:**
- MX record visible globally
- TXT (SPF) record visible
- TXT (DKIM) records visible (all 3)
- TXT (DMARC) record visible

---

### Step 4: Domain Verified ✅

**When All Records Are Correct:**
```
Domain: sirralhuruf.com
Status: ✅ Verified
Region: us-east-1
```

**Capabilities Unlocked:**
- ✅ Send to ANY email address
- ✅ Use custom from address: `noreply@sirralhuruf.com`
- ✅ Professional branding
- ✅ Better deliverability
- ✅ Lower spam score

---

## 🔧 UPDATE CODE AFTER VERIFICATION

### File: `functions/generateLoginOTP.js`

**Change Line 158:**

**Before (Testing Mode):**
```javascript
const fromEmail = 'abdulrehmanrehman916@gmail.com'; // Verified email in Resend (testing mode)
```

**After (Production Mode):**
```javascript
const fromEmail = 'noreply@sirralhuruf.com'; // Verified domain in Resend (production mode)
```

**Full Email Send Code:**
```javascript
const resendResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${resendApiKey}`
  },
  body: JSON.stringify({
    from: `Sirr al-Huruf <noreply@sirralhuruf.com>`, // ✅ Custom domain
    to: [email],
    subject: 'Your OTP Code - Sirr al-Huruf',
    html: htmlContent
  })
});
```

---

## 📊 DELIVERABILITY BEST PRACTICES

### 1. From Address Format

**✅ Good:**
```
Sirr al-Huruf <noreply@sirralhuruf.com>
```

**❌ Bad:**
```
noreply@sirralhuruf.com (no display name)
Sirr al-Huruf <gmail.com> (mismatched domain)
```

---

### 2. Subject Line

**✅ Good:**
```
Your OTP Code - Sirr al-Huruf
```

**❌ Bad:**
```
URGENT: Verify Now!!! (spam triggers)
OTP CODE (all caps)
Verify your account immediately (urgency)
```

---

### 3. Email Content

**✅ Good:**
- Professional HTML template
- Clear branding
- Physical mailing address (required by CAN-SPAM)
- Unsubscribe link (optional for transactional)
- Plain text alternative

**❌ Bad:**
- All caps text
- Excessive punctuation (!!!)
- Spam trigger words (FREE, URGENT, ACT NOW)
- Broken images or links
- No contact information

---

### 4. Sending Volume

**Gradual Ramp-Up:**
- Week 1: 50-100 emails/day
- Week 2: 200-500 emails/day
- Week 3: 500-1000 emails/day
- Week 4+: Full volume

**Why:** Sudden high volume triggers spam filters

---

### 5. Monitor Reputation

**Tools:**
- **Resend Dashboard:** Delivery rates, bounces, complaints
- **Google Postmaster Tools:** https://postmaster.google.com
- **Microsoft SNDS:** https://sendersupport.olc.protection.outlook.com
- **Sender Score:** https://www.senderscore.org

**Metrics to Watch:**
- Delivery rate: >95%
- Open rate: >15%
- Bounce rate: <2%
- Complaint rate: <0.1%
- Spam placement: <5%

---

## 🧪 TEST DELIVERABILITY

### Before Sending to Users

**Test Emails:**
1. Send to Gmail account → Check inbox (not spam)
2. Send to Outlook account → Check inbox
3. Send to Yahoo account → Check inbox
4. Send to corporate email → Check inbox

**Spam Score Testing:**
- **Mail-Tester:** https://www.mail-tester.com
  - Send test email to unique address
  - Get spam score (aim for 9/10 or 10/10)
  
- **GlockApps:** https://glockapps.com
  - Spam filter testing
  - Deliverability analysis
  
- **Litmus:** https://litmus.com
  - Email preview across clients
  - Spam testing

---

## 📈 SPAM SCORE CHECKLIST

### Technical Setup
- [x] Domain verified in Resend
- [x] MX record configured
- [x] SPF record configured
- [x] DKIM records configured (all 3)
- [x] DMARC record configured
- [x] SSL/TLS enabled (Resend default)

### Content Quality
- [x] Professional HTML template
- [x] Clear sender name
- [x] Relevant subject line
- [x] No spam trigger words
- [x] Physical address included
- [x] Contact information provided

### Sending Practices
- [x] Gradual volume ramp-up
- [x] List hygiene (remove bounces)
- [x] Monitor engagement rates
- [x] Remove inactive subscribers
- [x] Honor unsubscribe requests

---

## 🎯 EXPECTED RESULTS

### Before Domain Verification
```
Deliverability: 60-70%
Inbox Placement: 40-50%
Spam Folder: 50-60%
Spam Score: 6-8/10 (poor)
```

### After Domain Verification
```
Deliverability: 95-99%
Inbox Placement: 85-95%
Spam Folder: 5-15%
Spam Score: 9-10/10 (excellent)
```

---

## 🔍 TROUBLESHOOTING

### Domain Not Verifying

**Check:**
1. DNS records added correctly (exact values)
2. No typos in record names/values
3. TTL not too high (use 3600 or default)
4. Wait 24-48 hours for propagation

**Tools:**
```bash
# Check DNS records
nslookup -type=MX sirralhuruf.com
nslookup -type=TXT sirralhuruf.com
nslookup -type=TXT resend._domainkey.sirralhuruf.com
nslookup -type=TXT _dmarc.sirralhuruf.com
```

---

### Emails Still Going to Spam

**Check:**
1. SPF record includes Resend: `include:send.resend.com`
2. DKIM records visible (all 3)
3. DMARC policy set (start with `p=none`)
4. Domain age (new domains need warm-up)
5. Sending volume (ramp up gradually)
6. Content quality (avoid spam triggers)

**Actions:**
- Test with mail-tester.com
- Check Google Postmaster Tools
- Review email content for spam triggers
- Reduce sending volume temporarily
- Improve engagement (ask users to whitelist)

---

### Gmail Specific Issues

**Gmail Requirements:**
1. ✅ SPF record configured
2. ✅ DKIM signature present
3. ✅ DMARC policy enforced
4. ✅ Low spam complaint rate (<0.1%)
5. ✅ Proper reverse DNS (Resend handles)
6. ✅ TLS encryption (Resend default)

**Gmail Postmaster Tools:**
- Register domain: https://postmaster.google.com
- Monitor reputation daily
- Check spam rate, domain reputation
- Review authentication failures

---

## 📋 FINAL CHECKLIST

### DNS Configuration
- [ ] MX record added
- [ ] SPF record added
- [ ] DKIM record 1 added
- [ ] DKIM record 2 added
- [ ] DKIM record 3 added
- [ ] DMARC record added
- [ ] All records propagating globally

### Resend Dashboard
- [ ] Domain status: Verified ✅
- [ ] Test email sent successfully
- [ ] From address updated to domain

### Code Updates
- [ ] `generateLoginOTP.js` from address updated
- [ ] Using: `noreply@sirralhuruf.com`
- [ ] Test OTP sent and received

### Deliverability Testing
- [ ] Gmail inbox (not spam)
- [ ] Outlook inbox (not spam)
- [ ] Yahoo inbox (not spam)
- [ ] Mail-Tester score: 9/10 or higher
- [ ] No spam trigger words

### Monitoring Setup
- [ ] Resend dashboard monitoring
- [ ] Google Postmaster Tools registered
- [ ] Bounce tracking enabled
- [ ] Complaint tracking enabled

---

## 🎉 SUCCESS CRITERIA

**Domain Verification Complete When:**
- ✅ Resend shows domain status: Verified
- ✅ All DNS records propagating globally
- ✅ Test email sent from `noreply@sirralhuruf.com`
- ✅ Test email received in Gmail inbox (not spam)
- ✅ Mail-Tester score: 9/10 or higher

**Expected Timeline:**
- DNS propagation: 1-24 hours
- Domain verification: 1-24 hours
- Gmail inbox placement: 2-7 days (reputation building)
- Optimal deliverability: 2-4 weeks (full warm-up)

---

**Guide Created:** 2026-06-19  
**Status:** Ready for Implementation  
**Next Step:** Add domain to Resend dashboard  
**Estimated Time:** 1-24 hours for verification
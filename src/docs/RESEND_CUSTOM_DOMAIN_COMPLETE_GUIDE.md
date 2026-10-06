# 🚀 RESEND CUSTOM DOMAIN - COMPLETE SETUP GUIDE

**Last Updated:** 2026-06-19  
**Difficulty:** Easy (15-30 minutes)  
**Cost:** ~$9-12/year for domain

---

## 📋 WHY YOU NEED A CUSTOM DOMAIN

### Testing Mode (Current) - LIMITED
```
From: Sirr al-Huruf <abdulrehmanrehman916@gmail.com>
✅ Works for: Testing with your own email
❌ Cannot: Send to customers/users
❌ Spam Score: 10/10 (terrible)
❌ Inbox Placement: 40-50%
```

### Production Mode (Custom Domain) - UNLIMITED
```
From: Sirr al-Huruf <noreply@sirralhuruf.com>
✅ Works for: ANY email address
✅ Professional branding
✅ Spam Score: 0-1/10 (excellent)
✅ Inbox Placement: 90-95%
```

---

## 💰 CHEAPEST DOMAIN OPTIONS

### Option 1: Porkbun (RECOMMENDED)
**URL:** https://porkbun.com

**Pricing:**
- .com: $9.13 (first year) → $10.13 (renewal)
- .net: $9.23 (first year) → $11.98 (renewal)
- .org: $8.68 (first year) → $10.47 (renewal)

**Pros:**
- ✅ Transparent pricing (no hidden fees)
- ✅ Free WHOIS privacy
- ✅ Free SSL certificate
- ✅ Easy DNS management
- ✅ Clean interface

**Total Cost:** ~$10/year

---

### Option 2: Cloudflare Registrar
**URL:** https://www.cloudflare.com/products/registrar/

**Pricing:**
- .com: $9.77/year (at-cost, no markup)
- .net: $10.19/year
- .org: $10.08/year

**Pros:**
- ✅ At-cost pricing (no profit markup)
- ✅ Free WHOIS privacy
- ✅ Free SSL
- ✅ Excellent DNS management
- ✅ Trusted company

**Cons:**
- ❌ Must transfer existing domains (for best pricing)
- ❌ Slightly higher first-year cost than Porkbun

**Total Cost:** ~$10/year

---

### Option 3: Namecheap
**URL:** https://www.namecheap.com

**Pricing:**
- .com: $8.88 (first year) → $13.98 (renewal)
- .net: $12.98 (first year) → $14.98 (renewal)
- .org: $9.98 (first year) → $14.98 (renewal)

**Pros:**
- ✅ Cheapest first year
- ✅ Free WHOIS privacy
- ✅ Good DNS management

**Cons:**
- ❌ Higher renewal cost
- ❌ Upsells during checkout

**Total Cost:** ~$9 first year, ~$14 renewal

---

### Budget Alternative: Free Subdomains

**eu.org** (Free):
- URL: https://nic.eu.org
- Format: `yourname.eu.org`
- Wait time: 1-2 weeks for approval
- Not recommended for production

**pp.ua** (Free):
- URL: https://nic.ua
- Format: `yourname.pp.ua`
- Instant activation
- Lower trust score

**Warning:** Free domains have lower deliverability and may still go to spam

---

## 🎯 STEP-BY-STEP DOMAIN SETUP

### Step 1: Purchase Domain (5 minutes)

**Recommended:** Porkbun.com

1. Go to https://porkbun.com
2. Search for domain: `sirralhuruf.com` (or your choice)
3. Add to cart
4. Create account (or login)
5. Complete purchase (~$10)
6. Verify email ownership

**Done!** You now own a domain

---

### Step 2: Add Domain to Resend (2 minutes)

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter domain name: `sirralhuruf.com`
4. Select region: **US East (us-east-1)** (default)
5. Click **"Add Domain"**

**Result:**
```
Domain: sirralhuruf.com
Status: Pending Verification
Region: us-east-1
```

Resend will now show you DNS records to configure

---

### Step 3: Configure DNS Records (10-15 minutes)

**Log into your domain registrar** (Porkbun/Namecheap/Cloudflare)

Navigate to **DNS Management** or **DNS Settings**

You need to add **6 DNS records** total:

---

#### Record 1: MX Record (Mail Exchange)

**Purpose:** Routes bounce/complaint feedback to Resend

```
Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: 3600 (or default)
```

**In Porkbun:**
- Type: MX
- Host: @
- Answer: feedback-smtp.us-east-1.amazonses.com
- Priority: 10
- TTL: 3600

---

#### Record 2: SPF Record (TXT)

**Purpose:** Authorizes Resend to send emails for your domain

```
Type: TXT
Name: @
Value: v=spf1 include:send.resend.com ~all
TTL: 3600 (or default)
```

**Important:**
- If you ALREADY have an SPF record, MERGE them:
  ```
  v=spf1 include:send.resend.com include:_spf.google.com ~all
  ```
- You can only have ONE SPF record per domain
- `~all` = soft fail (recommended for starting)
- `-all` = hard fail (stricter, use later)

**In Porkbun:**
- Type: TXT
- Host: @
- Answer: v=spf1 include:send.resend.com ~all
- TTL: 3600

---

#### Records 3-5: DKIM Records (3 TXT Records)

**Purpose:** Cryptographic signature to verify email authenticity

Resend provides **3 unique DKIM keys** (Amazon SES)

**In Resend Dashboard:**
1. Click on your domain name
2. Scroll to "DKIM Keys" section
3. Copy each record exactly as shown

**Typical Format:**
```
Record 1:
Type: TXT
Name: resend._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDxyz123...
TTL: 3600

Record 2:
Type: TXT
Name: resend2._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCabc456...
TTL: 3600

Record 3:
Type: TXT
Name: resend3._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdef789...
TTL: 3600
```

**In Porkbun:**
Add 3 separate TXT records with exact values from Resend

**Note:** DKIM values are UNIQUE to your domain - copy from your Resend dashboard

---

#### Record 6: DMARC Record (TXT)

**Purpose:** Tells receiving servers what to do if SPF/DKIM fail

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc-reports@sirralhuruf.com
TTL: 3600
```

**Explanation:**
- `v=DMARC1` = DMARC version
- `p=none` = Monitor only (don't reject yet)
- `rua=mailto:...` = Send reports to this email
- Start with `p=none`, change to `p=quarantine` after 2 weeks

**Advanced DMARC:**
```
v=DMARC1; p=none; rua=mailto:dmarc-reports@sirralhuruf.com; ruf=mailto:dmarc-forensics@sirralhuruf.com; fo=1; pct=100; adkim=s; aspf=s
```

**In Porkbun:**
- Type: TXT
- Host: _dmarc
- Answer: v=DMARC1; p=none; rua=mailto:dmarc-reports@sirralhuruf.com
- TTL: 3600

---

### Step 4: Wait for DNS Propagation (1-24 hours)

**DNS propagation time:**
- Typical: 1-2 hours
- Maximum: 24-48 hours
- Depends on TTL settings

**Check Propagation:**
1. Go to https://dnschecker.org
2. Enter your domain: `sirralhuruf.com`
3. Select record type: MX, TXT
4. Check if records visible globally

**Verify Each Record:**
- [ ] MX record visible
- [ ] TXT (SPF) record visible
- [ ] TXT (DKIM 1) record visible
- [ ] TXT (DKIM 2) record visible
- [ ] TXT (DKIM 3) record visible
- [ ] TXT (DMARC) record visible

---

### Step 5: Verify Domain in Resend (Automatic)

**Resend automatically checks:**
- Every 5 minutes
- Looks for all 6 DNS records
- Updates status when all found

**Check Status:**
1. Go to https://resend.com/domains
2. Find your domain
3. Status should change from "Pending" to "Verified"

**When Verified:**
```
Domain: sirralhuruf.com
Status: ✅ Verified
Region: us-east-1
```

**Congratulations!** Your domain is now production-ready

---

## 🔧 STEP 6: UPDATE CODE (Required)

### File: `functions/generateLoginOTP.js`

**Find Line 158:**
```javascript
const fromEmail = 'abdulrehmanrehman916@gmail.com'; // Verified email in Resend (testing mode)
```

**Replace With:**
```javascript
const fromEmail = 'noreply@sirralhuruf.com'; // Custom domain in Resend (production mode)
```

**Also Update Line 163:**
```javascript
from: `Sirr al-Huruf <noreply@sirralhuruf.com>`,
```

**Full Email Send Block:**
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

## 🧪 STEP 7: TEST EMAIL DELIVERY

### Test 1: Send to Gmail

1. Go to `/admin/debug-otp-email`
2. Enter your Gmail address
3. Click "Send OTP"
4. Check Gmail inbox (NOT spam)
5. Verify email received

**Expected:**
- Subject: "Your OTP Code - Sirr al-Huruf"
- From: "Sirr al-Huruf" <noreply@sirralhuruf.com>
- Location: Primary inbox (not spam)

---

### Test 2: Check Email Headers

**In Gmail:**
1. Open OTP email
2. Click 3 dots (⋮) → "Show original"
3. Look for authentication results

**Expected:**
```
SPF: PASS
DKIM: PASS
DMARC: PASS
```

**If any show FAIL:**
- Check DNS records again
- Wait longer for propagation
- Verify no typos in records

---

### Test 3: Mail-Tester Score

1. Go to https://www.mail-tester.com
2. Copy unique test email address
3. Send OTP to that address
4. Check spam score

**Target Score:** 9/10 or 10/10

**If score < 9:**
- Review mail-tester recommendations
- Check all DNS records
- Add physical address to email footer

---

## 📊 EXPECTED RESULTS

### Before Custom Domain
```
From: personal Gmail address
Spam Score: 10/10
Inbox Placement: 40-50%
Can Send To: Verified emails only
```

### After Custom Domain
```
From: noreply@sirralhuruf.com
Spam Score: 0-1/10
Inbox Placement: 90-95%
Can Send To: ANY email address
```

**Improvement:** 95% reduction in spam placement

---

## 🔍 TROUBLESHOOTING

### Domain Not Verifying After 24 Hours

**Check:**
1. All 6 DNS records added correctly
2. No typos in record values
3. TTL not too high (use 3600)
4. Using correct nameservers

**Tools:**
```bash
# Check DNS records
nslookup -type=MX sirralhuruf.com
nslookup -type=TXT sirralhuruf.com
nslookup -type=TXT resend._domainkey.sirralhuruf.com
```

**Or use:**
- https://dnschecker.org
- https://mxtoolbox.com

---

### Emails Still Going to Spam

**Check:**
1. Domain verified in Resend ✅
2. All DNS records propagating ✅
3. From address uses custom domain ✅
4. Email content has no spam triggers ✅

**Actions:**
- Test with mail-tester.com
- Check Google Postmaster Tools
- Wait 1-2 weeks for reputation building
- Start with low volume (50-100/day)

---

### DKIM Records Not Found

**Common Issues:**
1. Copy/paste error in DKIM value
2. Missing `k=rsa; p=` prefix
3. Line breaks in key (must be single line)
4. Wrong hostname (resend._domainkey vs resend2._domainkey)

**Fix:**
- Copy DKIM values directly from Resend
- Ensure single line (no line breaks)
- Verify all 3 DKIM records added

---

## 📋 FINAL CHECKLIST

### Domain Purchase
- [ ] Domain purchased (~$10)
- [ ] Account created at registrar
- [ ] Email verified

### Resend Setup
- [ ] Domain added to Resend
- [ ] Region selected (us-east-1)
- [ ] DNS records displayed

### DNS Configuration
- [ ] MX record added
- [ ] SPF record added (TXT)
- [ ] DKIM record 1 added (TXT)
- [ ] DKIM record 2 added (TXT)
- [ ] DKIM record 3 added (TXT)
- [ ] DMARC record added (TXT)
- [ ] All records propagating globally

### Verification
- [ ] DNS propagation complete (1-24 hours)
- [ ] Domain status: Verified in Resend
- [ ] Test email sent successfully

### Code Updates
- [ ] From address updated in code
- [ ] Using: noreply@yourdomain.com
- [ ] Function deployed
- [ ] Test OTP sent and received

### Testing
- [ ] Gmail inbox (not spam)
- [ ] Outlook inbox (not spam)
- [ ] Yahoo inbox (not spam)
- [ ] Mail-Tester score: 9/10 or higher
- [ ] Email headers show SPF/DKIM/DMARC PASS

---

## 🎉 SUCCESS!

**When Complete:**
```
✅ Domain verified in Resend
✅ All DNS records configured
✅ From address: noreply@yourdomain.com
✅ Test emails in inbox (not spam)
✅ Can send to ANY email address
✅ Professional branding
✅ 90-95% inbox placement
```

**Total Time:** 15-30 minutes (plus 1-24 hours DNS propagation)  
**Total Cost:** ~$10/year

---

## 📞 NEXT STEPS

### After Domain Verified

1. **Update Code:**
   - Change from address to noreply@yourdomain.com
   - Deploy updated function

2. **Test Delivery:**
   - Send test OTPs to multiple providers
   - Verify inbox placement

3. **Monitor Reputation:**
   - Register Google Postmaster Tools
   - Monitor delivery rates daily

4. **Gradual Ramp-Up:**
   - Week 1: 50-100 emails/day
   - Week 2: 200-500 emails/day
   - Week 3+: Full volume

---

**Guide Ready:** Complete step-by-step instructions  
**Next Action:** Purchase domain at Porkbun.com  
**Estimated Time:** 15-30 minutes setup + DNS propagation
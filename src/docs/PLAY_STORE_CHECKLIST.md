# 🏪 Play Store Readiness Checklist — Sirr al-Huruf
## Generated: 2026-06-15

---

## ✅ COMPLETED — Ready for Build

| # | Task | Status |
|---|---|---|
| 1 | Email OTP only — SMS path removed | ✅ |
| 2 | Onboarding flow (Welcome → Email → OTP → Dashboard) | ✅ |
| 3 | OTP Login flow (Email → OTP → Dashboard) | ✅ |
| 4 | All 16 entities have Row-Level Security | ✅ |
| 5 | `checkPageSubscription` now requires auth | ✅ |
| 6 | `checkPageAccess` — subscription check passes user_id | ✅ |
| 7 | ProtectedPage 9-layer access: public → VIP → subscription → permission → admin | ✅ |
| 8 | App icon generated (512×512 PNG, gold on navy) | ✅ |
| 9 | `manifest.json` created — 6 icon sizes + full PWA config | ✅ |
| 10 | `index.html` — viewport, theme-color, favicon, Android meta | ✅ |
| 11 | Splash screen — 2.2s sacred geometry + الله animation | ✅ |
| 12 | Responsive layout — safe-area insets, 44px touch targets | ✅ |
| 13 | Offline support — Service Worker with cache warming | ✅ |
| 14 | Security audit passed — no hardcoded secrets, all RLS | ✅ |
| 15 | Play Store readiness report — `docs/PLAY_STORE_READINESS_REPORT.md` | ✅ |
| 16 | Privacy policy template | ✅ |
| 17 | English + Arabic store listing copy | ✅ |
| 18 | `expirePagePermissions` — daily 2am Dubai cron automation | ✅ Active |

---

## ⚠️ REMAINING ISSUES

### 1. Missing Icon Files — `public/icons/` is empty
**Severity:** Medium — affects PWA install and Android adaptive icons

`public/manifest.json` references 6 icon sizes but no files exist:
- `/icons/icon-48.png`
- `/icons/icon-72.png`
- `/icons/icon-96.png`
- `/icons/icon-144.png`
- `/icons/icon-192.png`
- `/icons/icon-512.png`

**Fix:** Generate proper icon files from the generated app icon image. The generated icon URL is:
`https://media.base44.com/images/public/69f3dea51ce92ee2fde20be6/85c3c0247_generated_image.png`

### 2. `expireSubscriptions` — No Scheduled Automation
**Severity:** High — subscriptions won't auto-expire

The `expireSubscriptions` backend function exists and is verified working, but **no automation is scheduled** to run it. Users with expired subscriptions will retain access indefinitely until an admin manually intervenes.

**Fix:** Create a daily cron automation:
```
Function: expireSubscriptions
Schedule: Daily at 1:00 AM Dubai time (21:00 UTC)
Type: scheduled → simple → 1 day, start_time 21:00
```

### 3. Dead SMS OTP Functions — Unused Backend Code
**Severity:** Low — cosmetic, no impact on app

These backend functions exist but are no longer called from anywhere:
- `sendOtp` — SMS OTP generation
- `verifyOtp` — SMS OTP verification
- `generateLoginOTP` — SMS login OTP
- `generateRegistrationOTP` — SMS registration OTP
- `verifyLoginOTP` — SMS login verification

The frontend (`Onboarding.jsx`, `OTPLogin.jsx`) is now email-only and never invokes these.

**Fix:** Leave as-is for now. Can be cleaned up post-launch.

### 4. Unused Platform Auth Pages — Still Present
**Severity:** Low — unreachable, no impact

These boilerplate pages exist but have no routes in App.jsx:
- `pages/Login.jsx` — platform email/password login (unreachable)
- `pages/Register.jsx` — platform registration (unreachable)
- `pages/ForgotPassword.jsx` — password reset (unreachable)
- `pages/ResetPassword.jsx` — password reset confirm (unreachable)

The app uses Onboarding + OTPLogin instead. These are harmless but clutter the file tree.

### 5. Stripe/Razorpay Functions — Payment Gateways Disabled
**Severity:** Low — by design

These payment backend functions exist but the gateways are intentionally disabled:
- `createRazorpayOrder`
- `verifyRazorpayPayment`
- `createStripePaymentIntent`
- `verifyStripePayment`

The payment pages exist (`RazorpayPayment`, `PaymentPage`, `SubscriptionPayment`) but are behind a non-functional flow since gateways are off. This is per the project decision: "Disable all payment gateway integration flows for now."

### 6. No Push Notifications
**Severity:** Low — architectural limitation

Sirr al-Huruf is a WebView-based app. Firebase Cloud Messaging (FCM) is not integrated. No push notification capability exists for subscription expiry alerts, support replies, or content updates.

---

## 🔧 PRE-BUILD FIXES (Recommended Order)

| Priority | Fix | Action |
|---|---|---|
| 🔴 **P0** | Schedule `expireSubscriptions` automation | Create daily cron: 21:00 UTC, function `expireSubscriptions` |
| 🟡 **P1** | Generate icon files for `public/icons/` | Upload generated icon; resize to 48/72/96/144/192/512px |
| 🟢 **P2** | Clean up dead SMS functions | Post-launch cleanup |
| 🟢 **P3** | Remove unused auth pages | Post-launch cleanup |

---

## 📋 GOOGLE PLAY CONSOLE CHECKLIST

```
[ ] Create Google Play Console account ($25)
[ ] Create app entry → package name from Base44
[ ] Upload feature graphic (1024×500 px)
[ ] Upload 4-6 screenshots (1080×1920 px portrait)
[ ] Upload app icon (512×512 px)
[ ] Fill content rating questionnaire → Everyone
[ ] Add privacy policy URL
[ ] Set pricing → Free
[ ] Select distribution countries
[ ] Enable Google Play App Signing
[ ] Fill "Data safety" section:
      - Email: Collected (authentication), Not shared
      - Everything else: Not collected
[ ] Build AAB → Base44 Publish → Mobile app → Generate → Download
[ ] Upload AAB to Play Console
[ ] Rollout to Internal Testing track first
[ ] Test OTP, login, subscription flow
[ ] Promote to Production
```

---

## 🚀 BUILD COMMAND

Go to your Base44 editor:
**Publish → Mobile app → Build Store Files → Create Google Play files → Generate → Download AAB**

No Capacitor or Android Studio needed. Base44 handles everything.
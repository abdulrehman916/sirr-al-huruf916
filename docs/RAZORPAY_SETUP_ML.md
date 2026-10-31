# Online payment — ഘട്ടം ഘട്ടമായുള്ള നിർദ്ദേശം

## ഇപ്പോൾ: UPI വഴി നേരിട്ട് ബാങ്കിലേക്ക് (KYC വേണ്ട)

1. Owner Panel → **Online payments** → **UPI വഴി നേരിട്ട് ബാങ്കിലേക്ക്**: നിങ്ങളുടെ UPI ID (GPay/PhonePe-ൽ കാണുന്നത്, ഉദാ: `name@okaxis`) + പേര് → **UPI ഓൺ ആക്കുക**.
2. Page വിലകളിൽ ഓരോ page-നും വിലയും കാലാവധിയും → **വിൽക്കുക**.
3. Customer QR scan ചെയ്ത് അടച്ച് 12 അക്ക UPI Ref നമ്പർ അയക്കും.
4. **"approval കാത്തിരിക്കുന്നവ"** list-ൽ ആ നമ്പർ വരും. ബാങ്ക് SMS / app-ൽ അതേ നമ്പറും തുകയും ഉണ്ടോ എന്ന് നോക്കുക → **Approve**. ആ customer-ന് ആ page മാത്രം, നിങ്ങൾ വെച്ച കാലാവധിയോടെ തുറക്കും. കാണുന്നില്ലെങ്കിൽ **നിരസിക്കുക**.
5. ഒരേ UPI Ref നമ്പർ രണ്ടാമത് ഉപയോഗിക്കാൻ site അനുവദിക്കില്ല.

## പിന്നീട്: Razorpay (KYC കഴിഞ്ഞ ശേഷം — പണം അടച്ചാൽ തനിയെ തുറക്കും)


> **പ്രധാനം:** Secret keys (Key Secret, service_role key, webhook secret) ഒരിക്കലും chat-ലോ GitHub-ലോ WhatsApp-ലോ ഇടരുത്. Vercel-ലെ "Environment Variables" എന്ന സ്ഥലത്ത് മാത്രം ഇടുക.

## ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു (ലളിതമായി)

1. Owner ഒരു page-ന് വിലയും കാലാവധിയും വെക്കുന്നു (Owner Panel → **Online payments**).
2. Customer email-ൽ login ചെയ്ത് ആ page-ൽ **Buy** അമർത്തുന്നു → Razorpay window തുറക്കുന്നു (UPI / Google Pay / PhonePe / Paytm / Card).
3. പണം അടച്ച ശേഷം നമ്മുടെ server Razorpay-യോട് നേരിട്ട് ചോദിച്ച് ഉറപ്പാക്കുന്നു (signature + payment status). ഉറപ്പായാൽ മാത്രം **ആ customer-ന് ആ page മാത്രം** തുറക്കും.
4. ഓരോ വാങ്ങലിനും സ്വന്തം അവസാന തീയതി. കാലാവധി കഴിഞ്ഞാൽ page തനിയെ പൂട്ടും. കാലാവധി തീരുന്നതിന് മുമ്പ് വീണ്ടും വാങ്ങിയാൽ, പുതിയ കാലാവധി പഴയത് തീരുന്ന ദിവസം മുതൽ തുടങ്ങും (ബാക്കിയുള്ള ദിവസങ്ങൾ നഷ്ടപ്പെടില്ല).
5. Owner gift codes (കുടുംബം/സുഹൃത്തുക്കൾക്ക്) പഴയതുപോലെ: Owner Panel → **Gift codes & renewals**. മിനിറ്റ് / മണിക്കൂർ / ദിവസം / മാസം കാലാവധി വെക്കാം.

---

## ഘട്ടം 1 — Razorpay account (TEST mode)

1. <https://dashboard.razorpay.com/signup> തുറന്ന് email/phone ഉപയോഗിച്ച് account തുടങ്ങുക. (KYC ഇപ്പോൾ വേണ്ട — test mode-ന് KYC ആവശ്യമില്ല.)
2. Dashboard-ന്റെ മുകളിൽ **Test Mode** എന്ന് കാണണം. Live Mode ആണെങ്കിൽ ആ switch അമർത്തി **Test Mode** ആക്കുക.
3. ഇടതുവശത്ത് **Account & Settings** → **API Keys** → **Generate Test Key** അമർത്തുക.
4. രണ്ട് കാര്യങ്ങൾ കാണിക്കും:
   - **Key ID** — `rzp_test_` എന്ന് തുടങ്ങുന്നത്
   - **Key Secret** — ഒരു തവണ മാത്രം കാണിക്കും. ഉടനെ Vercel-ൽ ഇടുക (ഘട്ടം 3). നഷ്ടപ്പെട്ടാൽ "Regenerate" ചെയ്യാം.

## ഘട്ടം 2 — Supabase server key എടുക്കുക

1. <https://supabase.com/dashboard> → നിങ്ങളുടെ project തുറക്കുക.
2. **Project Settings** (ചക്രം ചിഹ്നം) → **API Keys**.
3. **service_role** (അല്ലെങ്കിൽ പുതിയ രൂപത്തിൽ **Secret key**, `sb_secret_` എന്ന് തുടങ്ങുന്നത്) → **Reveal** → copy.
   - ഇത് വളരെ രഹസ്യമാണ്. Vercel-ൽ മാത്രം ഇടുക.
4. അതേ page-ൽ **Project URL** (`https://xxxx.supabase.co`) copy ചെയ്യുക.

## ഘട്ടം 3 — Vercel-ൽ keys ഇടുക (Preview-ന് മാത്രം)

1. <https://vercel.com> → **sirr-al-huruf916** project → **Settings** → **Environment Variables**.
2. താഴെയുള്ള ഓരോന്നും **Add New** ഉപയോഗിച്ച് ചേർക്കുക. ഓരോന്നിലും **Environments** എന്നിടത്ത് **Preview** മാത്രം tick ചെയ്യുക (**Production tick ചെയ്യരുത്** — ഇപ്പോൾ test മാത്രം). Branch ചോദിച്ചാൽ `claude/beautiful-babbage-ituqsj` തിരഞ്ഞെടുക്കാം.

| Name (അക്ഷരം തെറ്റാതെ) | Value |
|---|---|
| `RAZORPAY_KEY_ID` | ഘട്ടം 1-ലെ Key ID (`rzp_test_…`) |
| `RAZORPAY_KEY_SECRET` | ഘട്ടം 1-ലെ Key Secret |
| `SUPABASE_URL` | ഘട്ടം 2-ലെ Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ഘട്ടം 2-ലെ service_role / secret key |
| `RAZORPAY_WEBHOOK_SECRET` | (ഘട്ടം 5 ചെയ്യുമ്പോൾ മാത്രം) |

3. **Save**. പിന്നെ **Deployments** → ഈ branch-ന്റെ ഏറ്റവും പുതിയ preview → മൂന്ന് കുത്ത് (⋯) → **Redeploy**. (Keys ഇട്ട ശേഷം redeploy ചെയ്താലേ അവ പ്രവർത്തിക്കൂ.)

> Safety: `rzp_live_` key അബദ്ധത്തിൽ ഇട്ടാലും server അത് നിരസിക്കും. Live payment തുടങ്ങാൻ പിന്നീട് `RAZORPAY_ALLOW_LIVE=true` എന്ന് പ്രത്യേകം ഇടണം — അത് നമ്മൾ ഒരുമിച്ച് തീരുമാനിച്ച ശേഷം മാത്രം.

## ഘട്ടം 4 — Preview-ൽ test ചെയ്യുക

1. Owner ആയി login → Owner Panel → **Online payments** → ഒരു page-ന് വില (ഉദാ: ₹10) + കാലാവധി (ഉദാ: 1 ദിവസം) → **വിൽക്കുക**.
   - ⚠️ Database ഒന്നായതിനാൽ ഇവിടെ വെക്കുന്ന വില production site-ലും ബാധിക്കും: വില വെച്ച page production-ലും പൂട്ടും (അവിടെ ഇപ്പോഴും പഴയ screen ആയിരിക്കും, Buy button ഉണ്ടാകില്ല). അതിനാൽ test സമയത്ത് **ഇപ്പോൾ തന്നെ premium/പൂട്ടിയ ഒരു page** മാത്രം ഉപയോഗിക്കുക; free page-ന് വില വെക്കരുത്. Test കഴിഞ്ഞാൽ **വിൽപ്പന നിർത്തുക** അമർത്താം.
2. മറ്റൊരു browser-ൽ (അല്ലെങ്കിൽ Incognito) ഒരു test customer email ഉപയോഗിച്ച് login → ആ page തുറക്കുക → **Buy**.
3. Razorpay test window-ൽ:
   - UPI: `success@razorpay` → payment വിജയിക്കും; `failure@razorpay` → പരാജയപ്പെടും.
   - Card: Razorpay window-ൽ കാണിക്കുന്ന test card ഉപയോഗിക്കുക. (Test mode-ൽ യഥാർത്ഥ പണം പോകില്ല.)
4. വിജയിച്ചാൽ page തനിയെ തുറക്കും. **എന്റെ purchases** (`/my-subscription`) page-ൽ അവസാന തീയതി കാണാം. Owner Panel → Online payments → Payments-ലും കാണാം.
5. മറ്റൊരു premium page തുറന്ന് നോക്കുക — അത് പൂട്ടിയിരിക്കണം.

## ഘട്ടം 5 — Webhook (backup confirmation)

Customer-ന്റെ internet payment കഴിഞ്ഞ ഉടനെ മുറിഞ്ഞാലും access ലഭിക്കാൻ ഇത് സഹായിക്കും. Production-ലേക്ക് പോകുന്നതിന് മുമ്പ് നിർബന്ധമായും ചെയ്യണം.

1. ഒരു നീണ്ട രഹസ്യ വാക്ക് ഉണ്ടാക്കുക (ഉദാ: password manager-ൽ 32 അക്ഷരം).
2. Razorpay Dashboard → **Account & Settings** → **Webhooks** → **Add New Webhook**:
   - **Webhook URL:** `https://<നിങ്ങളുടെ-site>/api/payments/webhook`
   - **Secret:** മുകളിലെ രഹസ്യ വാക്ക്
   - **Active Events:** `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`
3. Vercel-ൽ `RAZORPAY_WEBHOOK_SECRET` = അതേ രഹസ്യ വാക്ക് → Redeploy.

> Vercel preview links സാധാരണ "Vercel Authentication" കൊണ്ട് പൂട്ടിയിരിക്കും; അതിനാൽ preview-ലേക്ക് Razorpay webhook എത്തിയേക്കില്ല. Preview test-ന് webhook ഇല്ലാതെയും payment ശരിയായി പ്രവർത്തിക്കും (server നേരിട്ട് പരിശോധിക്കുന്നു). Webhook production-ൽ സജ്ജമാക്കാം.

## Database മാറ്റം

✅ 2026-10-31/11-01: backup എടുത്ത ശേഷം Razorpay, UPI database updates live database-ൽ apply ചെയ്തു (owner-ന്റെ അനുമതിയോടെ). പരിശോധനകൾ എല്ലാം ശരി.

Preview-ഉം production-ഉം ഒരേ database ആണ്. അതിനാൽ ക്രമം:

1. `supabase/manual/2026-10-31_step1_backup_before_razorpay.sql` — **backup** (നിലവിലുള്ള data copy ചെയ്യുന്നു; ഒന്നും മായ്ക്കില്ല).
2. `supabase/migrations/20261031120000_razorpay_page_purchases.sql` — **migration** (പുതിയ functions/indexes മാത്രം ചേർക്കുന്നു; ഒരു data-യും മായ്ക്കില്ല).
3. `supabase/manual/2026-10-31_step3_check_after_razorpay.sql` — **പരിശോധന** (എല്ലാ വരിയിലും `true` വരണം).
4. പ്രശ്നമുണ്ടെങ്കിൽ: `supabase/manual/2026-10-31_rollback_razorpay.sql` — പഴയ നിലയിലേക്ക് (data മായ്ക്കാതെ).
5. **main-ലേക്ക് merge ചെയ്ത ശേഷം മാത്രം:** `supabase/manual/2026-10-31_step4_after_main_merge_disable_customer_requests.sql` — പഴയ customer request form server-ലും അടയ്ക്കുന്നു.

ഓരോന്നും: Supabase Dashboard → **SQL Editor** → **New query** → file-ലെ മുഴുവൻ എഴുത്തും paste → **Run**.

Migration-ന് ശേഷവും, owner ഒരു page-ന് വില വെക്കുന്നതുവരെ production site-ൽ ഒരു മാറ്റവും കാണില്ല. (Production code `main` merge ചെയ്യുന്നതുവരെ പഴയതുതന്നെ.)

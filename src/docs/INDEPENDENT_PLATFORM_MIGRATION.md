# Sirr al-Huruf Independent Platform

## Permanent boundary

- `main` and the old Base44 app are historical reference/backup only.
- Production development happens only on `premium-website`.
- Production must not require a Base44 app ID, URL, SDK, auth session, database, or function.
- Public languages are Malayalam (`ml`), Arabic (`ar`), and English (`en`). Turkish may remain only in archived reference data and must not appear as a public language choice.

## Target platform

- Frontend: current React + Vite application on Vercel.
- Identity: Supabase Auth (Google plus email/password or OTP).
- Database: Supabase Postgres protected by Row Level Security.
- Files: private Supabase Storage with signed-download access.
- Secure operations: Supabase Edge Functions. Payment and AI secrets never enter browser code.
- Domain: `sirralhuruf.com`, with `www.sirralhuruf.com` as the canonical host.

## Migration sequence

1. Foundation: independent client, auth, generic compatibility data store, RLS, private file storage.
2. Data import: export the corrected data snapshot and import every entity with checksums and row counts.
3. Secure functions: replace legacy function calls; prioritize access codes, permissions, support, PDF ingestion, and email.
4. Commerce: normalize products, prices, orders, entitlements, and payment events. Select payment provider only after business country and settlement account are confirmed.
5. Cleanup: rename compatibility imports from `base44` to `platform`, then remove old SDK/config files after parity tests pass.
6. Release: staging test, data reconciliation, production environment setup, custom-domain smoke tests, and controlled cutover.

## Environment

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are browser-visible. Service-role, payment, email, and AI secrets belong only in server or Edge Function environments.

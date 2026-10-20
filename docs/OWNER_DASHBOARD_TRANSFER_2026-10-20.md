# Owner dashboard transfer — 20 October 2026

Source: Sirr al-Huruf app `69f3dea51ce92ee2fde20be6`.
Destination: `abdulrehman916/sirr-al-huruf916`, existing independent Supabase backend.

## Data reconciliation

Collected 36 dashboard/access/support/shop record types (including empty collections), with 519 records. Also collected a restricted projection of 17 User identities: ID, name, email, role and timestamps. No passwords, authentication tokens or external credentials were copied.

All 536 projected records are preserved in the existing private archive, separately from the earlier migration snapshot. All 519 application records are present in the independent database after adding three missing audit records and one missing page-visibility record. Existing records were not overwritten. A field comparison found no other source-field differences except the independently verified account links and two products' already-private image references, which were retained. All 17 legacy identities already have entries in the migration map; that is not proof that all 17 have claimed accounts.

Historical data is preserved without assigning new account roles, copying external sessions, reopening removed admin screens or replacing independent content. The source registration visibility record does not override the independent application's public authentication routes.

## Model transferred

- Nine daily navigation entries: Dashboard, Customers, Codes & renewals, Access requests, Redeem approvals, Pages & pricing, Customer support, Shop and Settings.
- Source dashboard layout, permission-filtered action links, refresh/error/loading states, renewal queue and per-page summary.
- Independent publishing studios and existing maintenance routes remain reachable from Settings & maintenance on the dashboard. Original calculator and content routes are unchanged.
- Code detail links return to the dedicated codes screen.
- Independent SQL statistics support each page's explicit expiry, lifetime grants, malformed dates, disabled codes, Dubai calendar boundaries and actual renewal events. They do not fetch complete customer/code collections into the browser. Renewal details are limited to eight rows.
- Unauthenticated, missing-profile, customer and disabled-account callers fail closed. Delegated admins need the existing access-code permission to receive renewal/code details. No Base44 SDK or runtime connection was added.

## Verification and limits

SQL tests run inside a rolled-back transaction, including 508 temporary code fixtures, mixed lifetime/expired/future page grants, malformed dates, guest/customer/missing-profile denial and delegated-admin detail filtering. No test codes persist. SQL source is in `scripts/verify-owner-dashboard.sql`.

Navigation tests verify all nine primary routes, maintenance route resolution, retained independent studios and role filtering. The original 29 calculation/support file checksums and runtime independence checks pass. Production build and lint pass. The repository's pre-existing full-project typecheck failures remain; they have not been suppressed.

This transfer verifies data reconciliation and the dashboard/statistics model. It does not certify every existing admin mutation, support operation, payment flow or source-only feature. The older independent endpoint gaps in `INDEPENDENCE_AUDIT.md` still require separate implementation and authenticated end-to-end verification. No source-only code is treated as a deployed independent backend.

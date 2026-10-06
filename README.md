# Sirr al-Huruf — Independent Premium Website


Sirr al-Huruf is an independent React/Vite website hosted on Vercel and backed by Supabase (Auth, Postgres, Storage, and RPC). The production site is deployed from the `main` branch of `abdulrehman916/sirr-al-huruf916`.


## Independence boundary


- Runtime authentication and application data use Supabase.
- The project does not include the Base44 SDK or call Base44 as its application backend.
- `src/api/platformClient.js` provides the Supabase implementation used by every page. Do not add external app credentials or restore external runtime calls.
- The previous backend scaffold has been removed. Historical identifier fields remain in imported records to preserve relationships; they do not make network connections. Original books and scans are stored privately, with short-lived access controlled by Storage policies.


## Requirements


- Node.js 20 or newer
- npm
- A Supabase project with the migrations in `supabase/migrations` applied
- The public Supabase URL and anon/publishable key


Create `.env.local` with browser-safe values:


```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```


Never put the Supabase service-role key, database password, payment secret, or email-provider secret in a `VITE_*` variable. Keep server-only credentials in the hosting provider's encrypted environment settings.


## Run locally


```bash
npm ci
npm run dev
```


## Verify before deployment


```bash
npm run verify:calculations
npm run verify:records
npm run verify:private-references
npm run verify:independence
npm run build
npm run lint
npm run typecheck
```


The calculation verification is a release gate. Keep the locked calculation core and its expected outputs unchanged unless the owner explicitly authorizes a formula change.


## Deployment and scale


The existing Vercel project is connected to `abdulrehman916/sirr-al-huruf916`, with production tracking `main`. The previous repository `abdulrehman916/sirr-al-huruf` and its `premium-website` branch are retained as a backup. Keep the existing Supabase project, environment variables, and custom domains.


The live deployment and a successful build do not prove capacity for one million concurrent users. Before making that capacity claim, run staged load tests against a production-like Supabase plan, validate authentication and database connection limits, monitor query latency and error rates, and check Vercel function/runtime quotas. Keep large imports paginated and avoid loading whole collections into a browser request.


## Migration history


The Supabase migration ledger and the checked-in SQL files currently contain historical mismatches. Do not rerun old migrations blindly. Compare the live schema and migration history, restore/record the original applied SQL where available, and apply only forward, idempotent migrations after review.


## Outstanding feature work

See `docs/INDEPENDENCE_AUDIT.md` and `docs/backend-feature-audit.json`. Migration and a passing production build do not certify all features: the source calls 76 server function names without an implemented independent application endpoint. Existing JavaScript type errors and incomplete chapter translations also remain. Do not describe these features as ready or the content as complete.

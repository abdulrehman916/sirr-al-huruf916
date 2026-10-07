# Independent website audit — 7 October 2026 (Dubai)

Production repository: `abdulrehman916/sirr-al-huruf916`, branch `main`.
Original main snapshot: `7ff8d9787e8805b5f141ef12d533f620ad1d0c49`.
Imported premium snapshot: `99c504225ecf5d524ae4632785b9ac3c2e4095b2`.

## Data preservation

- 46,539 source records are archived privately, including 17 users.
- All 46,522 non-user source identifiers are present in the independent database: zero missing records.
- Source content fields match the archived export. The 2,219 added search indexes are derived fields. Sixteen user-ID changes link records to verified independent accounts; these preserve original identifiers and match either the explicit user map or the verified owner email.
- Two of the 17 archived users have claimed independent accounts. The remaining 15 require verified sign-in; old authentication credentials are not copied.
- The migration verification ledger is populated with per-entity counts and source checksums. This verifies the stored export, not any later changes made in the old application.

## Calculations and original display

- All 17 locked calculation files remain unchanged.
- 29 calculation/support files are byte-identical to both the original main and imported premium snapshots.
- Regression checks compare 162 Arabic/Unicode text inputs and 168 day/night hour cases with outputs generated from the original source. Report timestamps are excluded; calculated values, names and structures remain part of the comparison.
- Canonical Abjad checks: الله = 66; بسم الله الرحمن الرحيم = 786. Async processing is checked across chunk boundaries.
- Missing imports in the older Abjad/Anasir pages now point to the existing canonical engines. No numeric tables or calculation formulas were changed.
- Original Astro Clock content layouts and language-specific displays are restored. Saved English/Malayalam/Arabic content choices are respected. Global Login/Back interface controls stay English; Arabic source text is preserved.
- Section B now loads all 160 stored names rather than stopping at the client's default 100.
- Imported record identifiers are preserved in the client so existing card relationships continue to match.

## Runtime independence and personal sources

- All page imports use the independent Supabase platform client. The old SDK scaffold and unused OAuth bootstrap are removed from the deployed source.
- 714 source assets, 595,268,265 bytes, were copied to private Storage and verified by downloading each copy and comparing its SHA-256 checksum.
- Personal source files are never made public. Short-lived references require existing Storage authorization and are not reused across sign-out.
- The one-time copying function is closed and requires JWT authentication; it contains no outbound source requests or migration credential.
- The database reference cutover is complete. All affected records were backed up privately, and each was compared with its original backup after applying only the verified URL replacements. All 46,522 active records remain; zero active records contain the old media.base44.com or base44.app asset URLs. Frontend independence repairs are deployed.

## Incomplete work — do not certify as finished

- `backend-feature-audit.json` identifies 71 called server function names that still need independent implementations, including the AI `invoke-llm` endpoint. Five read endpoints (subscriptions, user requests, pricing, onboarding reset date and page access) are deployed; ownership and blocked-account checks pass isolated tests. Unauthenticated live requests are rejected. Signed-in live checks remain pending. A copied legacy function file was not an independent deployed backend.
- Imported chapter coverage: Section A has 170 paragraphs for 26 names; 167 contain Arabic and Malayalam fields. Section B has 1,581 paragraphs for 144 names, all with Arabic and Malayalam fields. None of these imported paragraphs has an English translation field. This is a limitation in the stored source content, not missing migration records.
- The repository has substantial pre-existing JavaScript type errors. Common UI props and platform entity typing were corrected, but `npm run typecheck` still fails. These checks have not been disabled.
- Authenticated owner/customer and every server-backed feature are not certified by the build and public-page checks.
- Capacity for one million users has not been load-tested or provisioned. The current hosting plan cannot be treated as proof of that capacity.
- Historical Supabase migration-file/version mismatches remain. Do not rerun old SQL files blindly.

## Repository cleanup

Keep `sirr-al-huruf916`, `sirr-al-huruf`, and `tuburni-story`.
Deletion candidates: `continuous-story-studio`, `sirr-voice-backend`, `designarena-premium`, `Sirr-Al-Huruf-Backup`, and `desktop-tutorial`.
No permanent repository deletion has been performed. The old `premium-website` branch remains until its exact cleanup and source preservation are reviewed.

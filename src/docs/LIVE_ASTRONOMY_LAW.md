# ═══════════════════════════════════════════════════════════════
# ASTRO CLOCK LIVE ASTRONOMY LAW — PERMANENT & IMMUTABLE
# ═══════════════════════════════════════════════════════════════
#
# PRIORITY: CRITICAL — EQUAL HIGHEST PRIORITY IN CODEBASE
# STATUS: IMMUTABLE — CANNOT BE DISABLED BY FUTURE UPDATES
# LIFETIME: PERMANENT — FOR THE LIFETIME OF THE PROJECT
#
# ESTABLISHED: 2026-07-08
# SUPPLEMENTS: MANUSCRIPT_INTEGRATION_LAW.md,
#              MANUSCRIPT_PRESERVATION_LAW.md,
#              LANGUAGE_SYSTEM_LAW.md,
#              LOCATION_TIME_LAW.md
#
# ═══════════════════════════════════════════════════════════════
# CORE PRINCIPLE
# ═══════════════════════════════════════════════════════════════
#
# Every astronomical calculation uses LIVE data for the user's
# current location. No cached hour tables. No hardcoded positions.
# Manuscript knowledge is permanent reference. Only the astronomy
# changes by location and time. Offline = last valid calculation
# persists until reconnect.
#
# ═══════════════════════════════════════════════════════════════

## THE 10 LIVE ASTRONOMY RULES

### RULE 1 — LIVE ASTRONOMICAL DATA FOR CURRENT LOCATION
Every astronomical calculation in the Astro Clock must use live
astronomical data computed for the user's current location. "Live"
means calculated at runtime from the current date, time, and
coordinates — not precomputed, not cached, not approximated. The
calculation engine receives fresh inputs every time the Astro Clock
renders or updates.

### RULE 2 — AUTOMATICALLY CALCULATE ALL ASTRONOMICAL VALUES
The Astro Clock must automatically calculate and provide all of the
following astronomical values:
  - Current date (local, from device timezone)
  - Local time (from device clock)
  - Time zone (auto-detected from device/browser)
  - Latitude (from GPS or manual city selection)
  - Longitude (from GPS or manual city selection)
  - Sunrise (calculated from lat/long/date)
  - Sunset (calculated from lat/long/date)
  - Solar noon (sun transit time, calculated)
  - Moonrise (calculated for current location/date)
  - Moonset (calculated for current location/date)
  - Moon illumination (percentage lit, calculated)
  - Moon age (days since last new moon, calculated)
  - Moon phase (New/Waxing/Full/Waning, derived from illumination)
  - Moon zodiac sign (from Moon's ecliptic longitude)
  - Moon mansion (Manzil, from Moon's longitude ÷ 28)
  No value in this list may be hardcoded, approximated, or omitted.
  If a value cannot be calculated (e.g., moonrise below horizon),
  the UI shows the appropriate state ("below horizon") rather than
  a fake value.

### RULE 3 — PLANETARY HOURS ALWAYS RECALCULATED FROM LIVE SUNRISE/SUNSET
Planetary Hours (Saat) must always be recalculated from today's
local sunrise and sunset. Specifically:
  - Day Saat boundaries = (sunset - sunrise) ÷ 12, applied from sunrise
  - Night Saat boundaries = (next sunrise - sunset) ÷ 12, applied from sunset
  - The Chaldean sequence (Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars)
    is constant, but WHICH planet rules WHICH hour depends on the
    local sunrise time and the day ruler.
  - Never use cached or hardcoded hour tables.
  - Never assume a fixed 2-hour interval (this is WRONG — day and
    night Saat lengths vary by season and latitude).
  - The Saat recalculation must happen on every render cycle and on
    every sunrise/sunset transition (with a 15-second auto-update
    timer to catch boundary crossings).
  A Saat that doesn't change when sunrise changes is a CRITICAL BUG.

### RULE 4 — COUNTRY/CITY CHANGE REFRESHES EVERY VALUE
If the user changes country or city (via travel, GPS update, or
manual city selection), every astronomical value must refresh
automatically:
  - Sunrise/sunset recalculate from new coordinates
  - Solar noon recalculates
  - Moonrise/moonset recalculate
  - Saat boundaries recalculate from new sunrise/sunset
  - Layl/Nahar status re-evaluates against new sunset
  - Moon position recalculates (observation point changes)
  - Moon zodiac/mansion may shift if the date rollover differs by timezone
  - All recommendations regenerate from the new live state
  This refresh is automatic — no button press, no manual reload.
  A stale value after a location change is a CRITICAL BUG.

### RULE 5 — MANUSCRIPT KNOWLEDGE IS PERMANENT REFERENCE DATA
All manuscript knowledge — Turkish (Havâss), Arabic (Kashf), Persian
(Taha), Omani, and any future source — is permanent reference data.
It does NOT change by location. It does NOT change by time. It does
NOT change by season. The manuscript says what the manuscript says,
everywhere, always. Only the astronomical calculations change:
  - WHICH Saat is current (live)
  - WHEN transitions happen (live)
  - WHERE the Moon is (live)
  - WHICH mansion/zodiac the Moon occupies (live)
  Manuscript rules + live astronomy = recommendation. The rule is
  constant; the astronomy is variable; the recommendation is their
  intersection, computed fresh each time.

### RULE 6 — RECOMMENDATIONS FROM LIVE STATE + MANUSCRIPT RULES
Every recommendation must be generated from the CURRENT live
astronomical state plus the manuscript rules. This includes:
  - Good / Bad / Neutral verdicts (from day ruler + Saat planet)
  - Nahs / Sa'd classifications (from Moon mansion + lunar day)
  - Activities (suitable/avoided, from planet character + manuscript)
  - Warnings (from Moon debilitation, Nahs days, malefic planets)
  - Purpose Search results (from matching live Saat to purpose intent)
  No recommendation may be precomputed or cached across location/time
  changes. A recommendation is valid only for the moment it was
  generated. When the live state changes, the recommendation
  regenerates.

### RULE 7 — OFFLINE RESILIENCE: LAST VALID CALCULATION PERSISTS
If the internet is unavailable (or the astronomy API is unreachable):
  - Continue using the last valid astronomical calculation.
  - Do NOT crash. Do NOT show an error screen. Do NOT blank the UI.
  - Show a subtle "offline" indicator so the user knows data may be stale.
  - Automatically refresh all calculations when internet becomes available.
  - The last valid calculation is cached in memory (and optionally in
    localStorage for app restarts).
  This ensures the Astro Clock remains usable during travel, in
  areas with poor connectivity, or during API outages. The
  manuscript knowledge is always available (it's local data, no
  internet needed). Only the live astronomy may go stale — and it
  recovers automatically.

### RULE 8 — NEVER DELETE OR OVERWRITE MANUSCRIPT DATA
Never delete or overwrite existing manuscript data. Every new PDF
must be added as a NEW knowledge source and merged with existing
sources following the Manuscript Integration Law and Manuscript
Preservation Law. This rule restates those laws for emphasis — the
live astronomy engine never touches manuscript data, and new PDFs
never replace old ones. (See MANUSCRIPT_PRESERVATION_LAW.md Rules
2 and 3.)

### RULE 9 — EVERY DISPLAYED FACT HAS SOURCE + PAGE REFERENCE
Every piece of information displayed in the Astro Clock must include
its manuscript source and page reference. This applies to:
  - Planet descriptions (source + page)
  - Saat recommendations (source + page)
  - Moon mansion attributes (source + page)
  - Zodiac sign properties (source + page)
  - Activities and warnings (source + page)
  - Quotations (source + page, with original text)
  No fact appears without attribution. No attribution is detached
  from its fact. (See MANUSCRIPT_PRESERVATION_LAW.md Rule 4 and
  MANUSCRIPT_INTEGRATION_LAW.md Rule 4.)

### RULE 10 — PERMANENT, NO BYPASS
These rules are permanent and cannot be bypassed by any future
update. Specifically:
  - No performance optimization may replace live calculation with
    cached tables.
  - No "simplified mode" may skip astronomical computation.
  - No future manuscript import may introduce hardcoded astronomy.
  - No feature may display a recommendation without source attribution.
  - No offline state may permanently replace live data — it is a
    temporary fallback that auto-recovers.
  The live astronomy engine is the SINGLE SOURCE OF TRUTH for all
  astronomical values. All sections consume it. No section computes
  its own astronomy independently.

# ═══════════════════════════════════════════════════════════════
# IMPLEMENTATION PATTERN
# ═══════════════════════════════════════════════════════════════
#
# The canonical data hook is useAstroData() in
# src/components/astroclock/dashboard/useAstroData.js.
#
# It internally uses:
#   - astroClockLiveEngine.js — planetary hour calculation
#   - astroClockMoonPosition.js — Moon position/phase/mansion
#   - astroClockSunriseSunset.js — local sunrise/sunset calculation
#   - astroClockLiveAstronomy.js — comprehensive live astronomy
#
# The hook:
#   1. Resolves location (GPS → manual city fallback)
#   2. Calculates sunrise/sunset/solar noon from coordinates
#   3. Calculates Moon position/phase/mansion/zodiac
#   4. Calculates all 24 planetary hours from live sunrise/sunset
#   5. Identifies the current Saat, day ruler, Layl/Nahar
#   6. Runs a 15-second auto-update timer for boundary transitions
#   7. Caches last valid calculation for offline resilience
#
# Every section component consumes useAstroData() — no section
# computes its own astronomy.
#
# ═══════════════════════════════════════════════════════════════
# ENFORCEMENT
# ═══════════════════════════════════════════════════════════════
#
# The JS enforcement module at src/lib/astroClockLiveAstronomyLaw.js
# exports constants and validation functions. These are defensive —
# they log violations but never crash the app.
#
# ═══════════════════════════════════════════════════════════════
# RELATIONSHIP TO OTHER LAWS
# ═══════════════════════════════════════════════════════════════
#
# This law supplements (does not replace):
#   - MANUSCRIPT_INTEGRATION_LAW.md (10 integration rules)
#   - MANUSCRIPT_PRESERVATION_LAW.md (10 preservation rules)
#   - LANGUAGE_SYSTEM_LAW.md (10 language rules)
#   - LOCATION_TIME_LAW.md (8 location/time rules)
#   - MASTER_ARCHITECTURE_LAW.md (Abjad/Mizan isolation)
#
# All laws apply simultaneously. When laws overlap, the STRICTER
# interpretation applies. This law is the astronomical complement
# to the Location & Time Law — Location & Time governs WHERE,
# Live Astronomy governs WHAT is calculated.
# ═══════════════════════════════════════════════════════════════
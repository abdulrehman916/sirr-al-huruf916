# ═══════════════════════════════════════════════════════════════
# ASTRO CLOCK LOCATION & TIME LAW — PERMANENT & IMMUTABLE
# ═══════════════════════════════════════════════════════════════
#
# PRIORITY: CRITICAL — EQUAL HIGHEST PRIORITY IN CODEBASE
# STATUS: IMMUTABLE — CANNOT BE DISABLED BY FUTURE UPDATES
# LIFETIME: PERMANENT — FOR THE LIFETIME OF THE PROJECT
#
# ESTABLISHED: 2026-07-08
# SUPPLEMENTS: MANUSCRIPT_INTEGRATION_LAW.md,
#              MANUSCRIPT_PRESERVATION_LAW.md,
#              LANGUAGE_SYSTEM_LAW.md
#
# ═══════════════════════════════════════════════════════════════
# CORE PRINCIPLE
# ═══════════════════════════════════════════════════════════════
#
# The Astro Clock always calculates using the user's REAL physical
# location. No fixed times. No assumed country. No hardcoded
# sunrise/sunset. Manuscript knowledge is identical worldwide —
# only live astronomical calculations change based on location.
#
# ═══════════════════════════════════════════════════════════════

## THE 8 LOCATION & TIME RULES

### RULE 1 — EVERY CALCULATION USES REAL LOCATION DATA
Every astronomical calculation in the Astro Clock must use:
  - Current GPS location (with user permission)
  - Local timezone (auto-detected from device/browser)
  - Local latitude (decimal degrees)
  - Local longitude (decimal degrees)
  - Local sunrise (calculated from lat/long/date)
  - Local sunset (calculated from lat/long/date)
  No calculation may proceed without these inputs. If any are
  missing, the calculation is INCOMPLETE and must resolve the
  missing input before displaying results (see Rule 6).

### RULE 2 — ALL RESULTS AUTO-CHANGE BY COUNTRY AND CITY
Every Astro Clock result must automatically change according to
the user's country and city. This applies to ALL of the following:
  - Planetary Hours (Saat) — day/night hour boundaries
  - Layl / Nahar (Night / Day) status
  - Kawkab (current ruling planet)
  - Moon position (longitude, latitude, phase)
  - Moon Zodiac sign
  - Moon Mansion (Manzil)
  - Best Time recommendations
  - Avoid Time recommendations
  - Nahas Days (forbidden periods)
  - Golden Days (auspicious periods)
  - Purpose Search results
  - All Astro Clock recommendations
  - Every live calculation, present and future
  A result that does not change when the location changes is a
  CRITICAL BUG — it means a hardcoded value has leaked in.

### RULE 3 — NEVER USE FIXED TIMES OR HARDCODED VALUES
  - Never use fixed sunrise/sunset times.
  - Never assume one country (e.g., "always Turkey" or "always UAE").
  - Never hardcode lat/long coordinates as defaults that bypass
    the location engine.
  - Never cache sunrise/sunset across dates without recalculating.
  - Never use a static timezone offset.
  The only acceptable fixed values are:
  - Reference hour tables for manuscript display (clearly labeled
    as reference, not used for live calculation)
  - Fallback coordinates when location is denied (Rule 6) — these
    are user-selected city coordinates, not hardcoded defaults

### RULE 4 — TRAVEL AUTO-UPDATES ALL CALCULATIONS
If the user travels to another country, all calculations must
automatically update to that country's:
  - Timezone (from the device's timezone API)
  - Sunrise (recalculated from new lat/long)
  - Sunset (recalculated from new lat/long)
  - Day length (sunset - sunrise)
  - Night length (next sunrise - sunset)
  - Local date (from the device's timezone)
  This update happens without user intervention. The user does not
  need to press a button or change a setting. The Astro Clock
  detects the new location (via GPS or timezone change) and
  recalculates everything. A travel scenario that shows stale
  results is a CRITICAL BUG.

### RULE 5 — MANUSCRIPT KNOWLEDGE IS IDENTICAL WORLDWIDE
Manuscript knowledge (rules, opinions, quotations, references,
scholarly text) remains identical worldwide. The planet Saturn is
Saturn in Dubai, in Istanbul, in Kerala, and in London. The 28
Lunar Mansions are the same 28 everywhere. The planetary hour
sequence is the same sequence everywhere. Only the LIVE
ASTRONOMICAL CALCULATIONS change based on location:
  - WHICH Saat is current (depends on local sunrise)
  - WHEN Layl/Nahar transitions happen (depends on local sunset)
  - WHERE the Moon is (depends on observation point)
  - WHICH Mansion/Zodiac the Moon is in (depends on Moon position)
  Manuscript text = constant. Astronomical timing = location-based.
  These two layers are permanently separate.

### RULE 6 — LOCATION DENIED: MANUAL CITY SELECTION
If location permission is denied (or GPS unavailable):
  - Ask the user to choose a city manually from a city list.
  - Continue calculations using that city's coordinates (lat/long).
  - Use that city's timezone for date/time calculations.
  - Calculate sunrise/sunset from those coordinates.
  The manual city selection is a FALLBACK, not a default. The
  Astro Clock should always attempt GPS first. The city list
  should include major cities across all target regions (UAE,
  India, Turkey, Saudi Arabia, etc.) with accurate coordinates.
  A denied-permission state that shows no calculations is a
  CRITICAL BUG — the manual fallback must always be available.

### RULE 7 — LANGUAGE NEVER AFFECTS CALCULATIONS
The language selection (Malayalam, English, Turkish) must NEVER
affect astronomical calculations. Language changes only the
displayed text — the labels, descriptions, and opinions shown to
the user. The underlying numbers (Saat number, Moon longitude,
Mansion index, sunrise time, etc.) are identical regardless of
which language is selected. Specifically:
  - Switching from Malayalam to English does not change the Saat.
  - Switching from English to Turkish does not change the Moon sign.
  - The calculation engine receives NO language parameter.
  - The language context feeds only the display layer.
  A calculation that changes when the language changes is a
  CRITICAL BUG — it means language has leaked into the engine.

### RULE 8 — PERMANENT, NO BYPASS
This rule is permanent and applies to all current and future Astro
Clock modules. Never allow any feature, section, or future
manuscript integration to bypass the location-based calculation
engine. Specifically:
  - No section may hardcode its own sunrise/sunset.
  - No section may assume a fixed timezone.
  - No future manuscript import may introduce location-locked data.
  - No performance optimization may cache calculations across
    locations.
  - No "simplified mode" may skip location detection.
  The location-based engine is the SINGLE SOURCE OF TRUTH for all
  astronomical timing. All sections consume it through the
  useAstroData() hook or equivalent. No section computes its own
  sunrise/sunset independently.

# ═══════════════════════════════════════════════════════════════
# IMPLEMENTATION PATTERN
# ═══════════════════════════════════════════════════════════════
#
# The canonical data hook is useAstroData() in
# src/components/astroclock/dashboard/useAstroData.js.
#
# It provides:
#   - currentHour (the current Saat + ruling planet)
#   - allHours (all 24 planetary hours for today)
#   - dayRuler (today's ruling planet)
#   - moonPosition (live Moon longitude, phase, mansion, zodiac)
#   - sunrise / sunset (local, calculated from GPS or manual city)
#   - isNight / laylNahar (current Night/Day status)
#   - activeDayIndex (current weekday, sunset-aware)
#   - lunarDay (current lunar day)
#
# Every section component consumes useAstroData() — no section
# computes its own astronomical timing.
#
# Location resolution flow:
#   1. Attempt GPS (navigator.geolocation.getCurrentPosition)
#   2. If granted → use lat/long, auto-detect timezone
#   3. If denied → show manual city selector
#   4. Use selected city's coordinates + timezone
#   5. Calculate sunrise/sunset from coordinates + date
#   6. Feed all values into the calculation engine
#
# ═══════════════════════════════════════════════════════════════
# ENFORCEMENT
# ═══════════════════════════════════════════════════════════════
#
# The JS enforcement module at src/lib/astroClockLocationTimeLaw.js
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
#   - MASTER_ARCHITECTURE_LAW.md (Abjad/Mizan isolation)
#
# All laws apply simultaneously. When laws overlap, the STRICTER
# interpretation applies.
# ═══════════════════════════════════════════════════════════════
# ASTRO CLOCK SYSTEM — FREEZE MANIFEST
**Frozen on:** 2026-06-14  
**Status:** PRODUCTION LOCKED  
**Version:** 1.1.0

---

## ❌ DO NOT MODIFY — FROZEN CORE

The following logic is permanently locked. No changes unless a specific manuscript-based contradiction is proven and documented with book name, page number, and original text.

---

### 1. Chaldean Planet Sequence
**File:** `lib/astroClockLiveEngine.js`  
**Line:** `export const PLANET_SEQUENCE = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];`  
**Source:** Havâss'ın Derinlikleri — traditional Chaldean order  
**Lock reason:** This sequence is the foundation of all planetary hour assignments. Any change cascades to all 24 hours across all 7 days.

---

### 2. Day Ruler Mapping
**File:** `lib/astroClockLiveEngine.js`  
**Function:** `getDayRuler(dayOfWeek)`  
**Locked mapping:**
```
Sunday    → sun    (index 3)
Monday    → moon   (index 6)
Tuesday   → mars   (index 2)
Wednesday → mercury (index 5)
Thursday  → jupiter (index 1)
Friday    → venus  (index 4)
Saturday  → saturn (index 0)
```
**Lock reason:** Manuscript-verified day rulers. The index values directly govern which planet starts each day's hour sequence.

---

### 3. Planetary Hour Calculation Logic
**File:** `lib/astroClockLiveEngine.js`  
**Functions:** `getCurrentPlanetaryHour()`, `getAllPlanetaryHours()`  
**Frozen algorithm:**
- Day hours: `dayHourDuration = (sunset - sunrise) / 12`
- Night hours: `nightHourDuration = (24 - dayDuration) / 12`
- Hour planet: `PLANET_SEQUENCE[(dayRuler.index + hourIndex) % 7]`
- Night continues from hour 13: `firstNightPlanetIndex = (dayRuler.index + 12) % 7`
- Current hour detection: `h.status === 'current'` (engine field, not Date comparison)

---

### 4. Sunrise/Sunset Engine (NOAA Algorithm)
**File:** `lib/astroClockSunriseSunset.js`  
**Function:** `calculateSunriseSunset(date, lat, lng, timezone)`  
**Frozen logic:**
- Solar mean anomaly: `M = (357.5291 + 0.98560028 * (dayOfYear - 1)) % 360`
- Equation of center: `C = 1.9148*sin(M) + 0.0200*sin(2M) + 0.0003*sin(3M)`
- Sunrise angle: `90.833°` (official civil sunrise/sunset definition)
- Local time conversion: `(utcMinutes / 60 + timezone) % 24`

---

### 5. GPS / Geolocation Logic
**File:** `components/astroclock/Full24HourPlanetaryChart.jsx` and all planetary hour components  
**Frozen behavior:**
- `navigator.geolocation.getCurrentPosition()` called **once on mount** (`useEffect([], [])`)
- Falls back to Dubai (lat: 25.2048, lng: 55.2708, timezone: 4) on error
- No GPS polling — single acquisition only

---

### 6. Countdown Logic
**File:** `components/astroclock/Full24HourPlanetaryChart.jsx`  
**Function:** `decimalEndToCountdown(endDecimal)`  
**Frozen behavior:**
- Single shared `setInterval(1000)` in parent component
- `tick` prop propagates to all `HourRow` children
- Countdown computed inline per re-render — no per-row intervals
- Countdown only shown for `isCurrent || expanded` rows

---

### 7. Current Hour Detection
**Frozen method:** `hours.find(h => h.status === 'current')`  
**Replaced broken method:** `hours.find(h => now >= h.startTime && now < h.endTime)` — Date vs string coercion always returned undefined.  
**Lock reason:** The engine's `status` field is set at calculation time with proper decimal arithmetic. It is the authoritative source.

---

### 8. Moon Mansion Integration
**Files:** `components/astroclock/MoonMansionTracker.jsx`, `lib/astroClockMansionsML.js`  
**Frozen behavior:** Manuscript-only data source. Live astronomical position used for current mansion. No approximate transit calculations.

---

## ✅ ALLOWED — Additive Only

The following changes are permitted without restriction:

| Allowed | Description |
|---|---|
| New manuscript citations | Add `source`, `page_number`, `original_text` fields to existing entries |
| Additional manuscript sources | New books ingested into ManuscriptLibrary entity |
| Explanatory notes | Add `notes` or `commentary` fields |
| New comparison views | New UI components showing cross-manuscript comparisons |
| New UI panels | Purely display components that consume frozen engine outputs |
| New language translations | Add `name_fr`, `name_ur`, etc. to PLANET_INFO entries |

---

## 🔒 Amendment Protocol

To unlock any frozen calculation, ALL of the following are required:

1. **Book name** — exact manuscript title
2. **Page number** — exact page in the PDF
3. **Original text** — verbatim Arabic/Ottoman/Persian quote
4. **Malayalam translation** — full translation
5. **Contradiction statement** — explicit description of what the current code gets wrong
6. **Affected files** — list of every file that must change

Without all 5 items, the freeze holds.

---

## File Inventory (Frozen)

| File | Frozen Component |
|---|---|
| `lib/astroClockLiveEngine.js` | PLANET_SEQUENCE, getDayRuler, getCurrentPlanetaryHour, getAllPlanetaryHours |
| `lib/astroClockSunriseSunset.js` | calculateSunriseSunset, NOAA algorithm, formatDecimalTime |
| `lib/astroClockDateUtils.js` | safeFormatTime, formatCountdownMs |
| `lib/astroClockPlanetaryHourRules.js` | Planet rules data |
| `lib/astroClockPlanetFriendships.js` | Friendship/enmity mappings |
| `components/astroclock/Full24HourPlanetaryChart.jsx` | Timer architecture, GPS logic, countdown logic |
| `components/astroclock/MoonMansionTracker.jsx` | Mansion detection, manuscript-only data |
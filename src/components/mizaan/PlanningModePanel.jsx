// ═══════════════════════════════════════════════════════════════
// PLANNING MODE PANEL — Optional Ritual Planning Mode
// ═══════════════════════════════════════════════════════════════
// When OFF: engine uses current location + today's date (default).
// When ON: user selects a location + date — engine evaluates for that
//   location/date using the SAME astronomical source (calculateSunriseSunset
//   + getUserLocation). No second engine, no duplicated calculations.
//
// NO manual time picker — the engine determines ritual times per manuscript.
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from "react";
import { MapPin, Calendar, Search } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
};

// Supported planning locations — same coordinates as KNOWN_LOCATIONS in
// astroClockSunriseSunset.js, with timezone added for calculateSunriseSunset().
const PLANNING_LOCATIONS = [
  { key: "dubai",      name: "Dubai, UAE",           lat: 25.2048, lng: 55.2708, timezone: 4 },
  { key: "abu_dhabi",  name: "Abu Dhabi, UAE",       lat: 24.4539, lng: 54.3773, timezone: 4 },
  { key: "mecca",      name: "Mecca, Saudi Arabia",  lat: 21.4225, lng: 39.8262, timezone: 3 },
  { key: "medina",     name: "Medina, Saudi Arabia", lat: 24.5247, lng: 39.5692, timezone: 3 },
  { key: "riyadh",     name: "Riyadh, Saudi Arabia", lat: 24.7136, lng: 46.6753, timezone: 3 },
  { key: "cairo",      name: "Cairo, Egypt",         lat: 30.0444, lng: 31.2357, timezone: 2 },
  { key: "istanbul",   name: "Istanbul, Turkey",     lat: 41.0082, lng: 28.9784, timezone: 3 },
  { key: "delhi",      name: "Delhi, India",         lat: 28.6139, lng: 77.2090, timezone: 5.5 },
  { key: "mumbai",     name: "Mumbai, India",        lat: 19.0760, lng: 72.8777, timezone: 5.5 },
  { key: "kochi",      name: "Kochi, India",         lat: 9.9312,  lng: 76.2673, timezone: 5.5 },
  { key: "london",     name: "London, UK",           lat: 51.5074, lng: -0.1278, timezone: 0 },
  { key: "new_york",   name: "New York, USA",        lat: 40.7128, lng: -74.0060, timezone: -5 },
];

export default function PlanningModePanel({ enabled, onToggle, location, onLocationChange, date, onDateChange, lang }) {
  const [locationSearch, setLocationSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredLocations = useMemo(() => {
    if (!locationSearch) return PLANNING_LOCATIONS;
    const q = locationSearch.toLowerCase();
    return PLANNING_LOCATIONS.filter(l => l.name.toLowerCase().includes(q));
  }, [locationSearch]);

  const handleLocationSelect = (loc) => {
    onLocationChange({ lat: loc.lat, lng: loc.lng, timezone: loc.timezone, name: loc.name });
    setLocationSearch("");
    setDropdownOpen(false);
  };

  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    if (!dateStr) {
      onDateChange(null);
      return;
    }
    // Midnight local time — ensures all 24 hours of the selected date are
    // evaluated (no hours marked "past" at the start of the planning day).
    onDateChange(new Date(dateStr + "T00:00:00"));
  };

  const dateStr = date ? date.toISOString().split("T")[0] : "";
  const T = (en, ml) => lang === "ml" ? ml : en;

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
      border: `1px solid ${enabled ? G.borderHi : G.border}`,
      boxShadow: "0 4px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(212,175,55,0.08)",
    }}>
      {/* Toggle Header */}
      <button
        onClick={() => onToggle(!enabled)}
        className="w-full flex items-center justify-between p-4"
        style={{ borderBottom: enabled ? `1px solid ${G.border}` : "none" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{
            background: enabled
              ? "linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.05) 100%)"
              : G.bg,
            border: `1px solid ${G.border}`,
          }}>
            <Calendar className="w-4 h-4" style={{ color: G.text }} />
          </div>
          <div className="text-left">
            <h3 className="font-inter text-sm font-bold tracking-wide" style={{ color: enabled ? G.text : "#fff" }}>
              {T("Planning Mode", "പ്ലാനിംഗ് മോഡ്")}
            </h3>
            <p className="font-inter text-[10px]" style={{ color: G.dim }}>
              {enabled
                ? T("Evaluate for another location & date", "മറ്റൊരു സ്ഥലവും തീയതിയും വിലയിരുത്തുക")
                : T("Off — using current location & today", "ഓഫ് — നിലവിലെ സ്ഥലവും ഇന്നും")}
            </p>
          </div>
        </div>
        {/* Toggle Switch */}
        <div className="flex-shrink-0 relative" style={{
          width: 40, height: 22, borderRadius: 11,
          background: enabled ? "rgba(212,175,55,0.30)" : "rgba(255,255,255,0.08)",
          border: `1px solid ${enabled ? G.borderHi : "rgba(255,255,255,0.12)"}`,
          transition: "background 0.2s",
        }}>
          <div style={{
            position: "absolute", top: 2, left: enabled ? 20 : 2,
            width: 16, height: 16, borderRadius: "50%",
            background: enabled ? G.text : "rgba(255,255,255,0.50)",
            transition: "left 0.2s, background 0.2s",
          }} />
        </div>
      </button>

      {/* Planning Controls (only when enabled) */}
      {enabled && (
        <div className="p-4 space-y-3">

          {/* Location Selector */}
          <div>
            <label className="font-inter text-[9px] uppercase tracking-widest block mb-1.5" style={{ color: G.dim }}>
              {T("Country / City", "രാജ്യം / നഗരം")}
            </label>
            <div className="relative">
              <input
                type="text"
                value={locationSearch || location?.name || ""}
                onChange={(e) => {
                  setLocationSearch(e.target.value);
                  setDropdownOpen(true);
                  if (e.target.value === "" && !location) onLocationChange(null);
                }}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                placeholder={T("Search city...", "നഗരം തിരയുക...")}
                className="w-full rounded-lg px-3 py-2.5 font-inter text-xs pr-9"
                style={{
                  background: "rgba(8,16,38,0.80)",
                  border: `1px solid ${G.border}`,
                  color: "#fff",
                }}
              />
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: G.dim }} />
            </div>
            {/* Location Dropdown */}
            {dropdownOpen && locationSearch && (
              <div className="mt-1 rounded-lg overflow-hidden max-h-48 overflow-y-auto scrollbar-none" style={{
                background: "rgba(8,16,38,0.95)",
                border: `1px solid ${G.border}`,
              }}>
                {filteredLocations.map(loc => (
                  <button
                    key={loc.key}
                    onMouseDown={(e) => { e.preventDefault(); handleLocationSelect(loc); }}
                    className="w-full text-left px-3 py-2 font-inter text-xs transition"
                    style={{
                      color: "rgba(255,255,255,0.80)",
                      borderBottom: `1px solid rgba(212,175,55,0.10)`,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(212,175,55,0.06)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {loc.name}
                  </button>
                ))}
                {filteredLocations.length === 0 && (
                  <p className="px-3 py-2 font-inter text-xs" style={{ color: G.dim }}>
                    {T("No matching city", "പൊരുത്തമുള്ള നഗരം ഇല്ല")}
                  </p>
                )}
              </div>
            )}
            {/* Selected Location Display */}
            {location && !dropdownOpen && (
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: G.text }} />
                <span className="font-inter text-[11px] font-bold" style={{ color: G.text }}>
                  {location.name}
                </span>
                <span className="font-inter text-[9px]" style={{ color: G.dim }}>
                  ({location.lat.toFixed(2)}, {location.lng.toFixed(2)}, UTC{location.timezone >= 0 ? "+" : ""}{location.timezone})
                </span>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="font-inter text-[9px] uppercase tracking-widest block mb-1.5" style={{ color: G.dim }}>
              {T("Date", "തീയതി")}
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={handleDateChange}
              className="w-full rounded-lg px-3 py-2.5 font-inter text-xs"
              style={{
                background: "rgba(8,16,38,0.80)",
                border: `1px solid ${G.border}`,
                color: "#fff",
                colorScheme: "dark",
              }}
            />
          </div>

          {/* Note: No manual time picker — engine determines ritual times */}
          <p className="font-inter text-[10px] leading-snug" style={{ color: G.dim }}>
            {T(
              "The engine will automatically determine the best, avoid, and next valid ritual times based on manuscript rules. No manual time selection is needed.",
              "ഗ്രന്ഥ നിയമങ്ങളുടെ അടിസ്ഥാനത്തിൽ മികച്ചതും ഒഴിവാക്കേണ്ടതുമായ ആചാര സമയങ്ങൾ യന്ത്രം സ്വയമേവ നിർണ്ണയിക്കും. സമയം സ്വമേധയാ തിരഞ്ഞെടുക്കേണ്ടതില്ല."
            )}
          </p>
        </div>
      )}
    </div>
  );
}
/**
 * PERSISTED LOCATION HOOK — Astro Clock
 * Delegates to the astroClockGeolocation store. Reads the persisted location
 * (GPS or manual), subscribes to changes, and exposes a manual setter for the
 * fallback selector. Timezone comes from the store (device offset, DST-aware).
 */
import { useEffect, useState } from "react";
import {
  getUserLocation,
  subscribeLocation,
  setManualLocation,
  getLocationVersion,
} from "./astroClockGeolocation.js";

export function usePersistedLocation() {
  const [location, setLocationState] = useState(() => getUserLocation());
  const [, setVersion] = useState(() => getLocationVersion());

  useEffect(() => {
    // React to any location change (GPS watch / manual override / GPS resolve).
    const unsub = subscribeLocation(() => {
      setLocationState(getUserLocation());
      setVersion(getLocationVersion());
    });
    // Ensure initial state is current (GPS may have resolved before mount).
    setLocationState(getUserLocation());
    return unsub;
  }, []);

  const setLocation = (loc) => {
    setManualLocation(loc);
    setLocationState(getUserLocation());
  };

  return { location, setLocation, isLoading: false };
}

// Legacy helpers — saved location now lives in the geolocation store.
export function getSavedLocation() {
  return getUserLocation();
}
export function saveLocation(loc) {
  setManualLocation(loc);
}
export function clearSavedLocation() {
  try { localStorage.removeItem("astro_clock_location"); } catch (_) {}
}
import { useState, useEffect } from "react";

/**
 * useDeviceType - Detects device type (mobile, tablet, desktop) based on screen width.
 * Uses matchMedia instead of resize listener to avoid keyboard-triggered updates.
 * 
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1366px
 * - Desktop: > 1366px
 */
export default function useDeviceType() {
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    const checkDevice = () => {
      const w = window.innerWidth;
      if (w < 768) {
        return 'mobile';
      } else if (w <= 1366) {
        return 'tablet';
      } else {
        return 'desktop';
      }
    };

    // Set initial value
    setDeviceType(checkDevice());

    // Use matchMedia instead of resize listener - won't fire on keyboard open
    const mediaQuery = window.matchMedia('(max-width: 1366px)');
    const mediaQueryMobile = window.matchMedia('(max-width: 767px)');
    
    const handleChange = () => {
      const newType = checkDevice();
      setDeviceType(newType);
    };

    // Listen to media query changes (orientation change, not keyboard)
    mediaQuery.addEventListener('change', handleChange);
    mediaQueryMobile.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      mediaQueryMobile.removeEventListener('change', handleChange);
    };
  }, []);

  return deviceType;
}
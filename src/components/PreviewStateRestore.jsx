import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isDevMode } from '@/lib/devModePersistence';

/**
 * Preview-only route restoration.
 *
 * In Base44 Preview (dev mode):
 *   - Saves the current route to localStorage on every navigation.
 *   - On mount, restores the last saved route so the developer
 *     continues exactly where they left off after every build refresh.
 *
 * In production: does nothing — isDevMode is false in production builds.
 */
const ROUTE_KEY = 'sirr_preview_last_route';

export default function PreviewStateRestore() {
  const location = useLocation();
  const navigate = useNavigate();
  const restoredRef = useRef(false);

  // ── Restore last route on mount ──
  useEffect(() => {
    if (!isDevMode || restoredRef.current) return;
    restoredRef.current = true;

    try {
      const saved = localStorage.getItem(ROUTE_KEY);
      if (saved && saved !== location.pathname) {
        navigate(saved, { replace: true });
      }
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save current route on every navigation ──
  useEffect(() => {
    if (!isDevMode) return;
    try {
      localStorage.setItem(ROUTE_KEY, location.pathname);
    } catch { /* ignore */ }
  }, [location.pathname]);

  return null;
}
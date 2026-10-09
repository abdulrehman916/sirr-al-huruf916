import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const positions = new Map();
const storageKey = key => `sirr_route_scroll:${key}`;

export default function RouteScrollRestore() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    const key = location.key;
    let saved = positions.get(key);
    if (!saved) {
      try { saved = JSON.parse(sessionStorage.getItem(storageKey(key))); } catch { /* unavailable storage */ }
    }
    const target = navigationType === 'POP' && saved ? saved : { window: 0, container: 0 };
    let restoring = true;
    let frame;
    const started = performance.now();
    // Lazy pages, exit animations and API-loaded lists may appear after the route.
    const restore = () => {
      const container = document.querySelector('[data-scroll-container="true"]');
      window.scrollTo({ top: target.window, left: 0, behavior: 'instant' });
      if (container) container.scrollTop = target.container;
      const reached = Math.abs(window.scrollY - target.window) < 2 &&
        (container ? Math.abs(container.scrollTop - target.container) < 2 : target.container === 0);
      if (performance.now() - started < 5000 && (!reached || performance.now() - started < 400)) {
        frame = requestAnimationFrame(restore);
      } else restoring = false;
    };
    frame = requestAnimationFrame(restore);
    const save = () => {
      if (restoring) return;
      const container = document.querySelector('[data-scroll-container="true"]');
      const value = { window: window.scrollY, container: container?.scrollTop || 0 };
      positions.set(key, value);
      try { sessionStorage.setItem(storageKey(key), JSON.stringify(value)); } catch { /* unavailable storage */ }
    };
    const interrupt = () => { restoring = false; cancelAnimationFrame(frame); };
    document.addEventListener('scroll', save, true);
    window.addEventListener('pagehide', save);
    window.addEventListener('wheel', interrupt, { passive: true });
    window.addEventListener('touchstart', interrupt, { passive: true });
    window.addEventListener('keydown', interrupt);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('scroll', save, true);
      window.removeEventListener('pagehide', save);
      window.removeEventListener('wheel', interrupt);
      window.removeEventListener('touchstart', interrupt);
      window.removeEventListener('keydown', interrupt);
    };
  }, [location.key, navigationType]);
  return null;
}

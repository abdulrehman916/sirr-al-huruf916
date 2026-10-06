import { useState, useCallback } from "react";

/**
 * Sirr Reader — client-side favorites & bookmarks (localStorage).
 * No new tables: per-user collections persist in the browser so the
 * reader stays fully isolated from other modules and entities.
 */
function readSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); }
  catch { return new Set(); }
}
function writeSet(key, set) {
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch {}
}

function useSirrCollection(storageKey) {
  const [items, setItems] = useState(() => readSet(storageKey));
  const toggle = useCallback((id) => {
    setItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      writeSet(storageKey, next);
      return next;
    });
  }, [storageKey]);
  const has = useCallback((id) => items.has(id), [items]);
  return { items, toggle, has };
}

export function useSirrFavorites() { return useSirrCollection("sirr_favorites"); }
export function useSirrBookmarks() { return useSirrCollection("sirr_bookmarks"); }
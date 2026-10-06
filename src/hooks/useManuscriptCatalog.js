// Fetches every stored manuscript (ManuscriptBook) plus every non-marker
// AstroClockKnowledge record, and exposes them for the Reference Library catalog
// and Import History. Read-only — never writes or modifies any record.
//
// Shared refresh: refreshCatalog() bumps a module-level version; every mounted
// instance of this hook re-fetches, so ReferenceLibrary and ImportHistory (and any
// other consumer) stay in sync after a book is deleted.
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

let _catalogVersion = 0;
const _listeners = new Set();

/** Bump the shared catalog version — all mounted hook instances re-fetch. */
export function refreshCatalog() {
  _catalogVersion++;
  _listeners.forEach(fn => fn(_catalogVersion));
}

export function useManuscriptCatalog() {
  const [books, setBooks] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(_catalogVersion);

  // Subscribe to shared version bumps (so delete in one consumer refreshes all)
  useEffect(() => {
    const fn = (v) => setVersion(v);
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  }, []);

  // Re-fetch whenever the shared version changes (including initial mount)
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [bookRes, ackRes] = await Promise.all([
          base44.entities.ManuscriptBook.list("-upload_date", 200),
          base44.entities.AstroClockKnowledge.filter({ is_marker: false }, "-updated_date", 1000),
        ]);
        if (!alive) return;
        setBooks(Array.isArray(bookRes) ? bookRes : []);
        setKnowledge(Array.isArray(ackRes) ? ackRes : []);
        setError(null);
      } catch (e) {
        if (alive) setError(e?.message || "Failed to load catalog");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [version]);

  return { books, knowledge, loading, error };
}
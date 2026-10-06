import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Read-only hook for Sirr manuscript entries (cards/knowledge) of ONE book.
 * Reuses the existing SirrManuscriptEntry entity (no new schema).
 * Returns entries in exact manuscript order (entry_order). Empty array
 * when the book has no extracted cards yet.
 */
export function useSirrEntries(bookId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!bookId) { setEntries([]); setLoading(false); return; }
    setLoading(true);
    base44.entities.SirrManuscriptEntry.filter({ sirr_book_id: bookId }, "entry_order", 200)
      .then((rows) => { if (alive) setEntries(rows || []); })
      .catch((e) => { if (alive) setError(e); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [bookId]);

  return { entries, loading, error };
}
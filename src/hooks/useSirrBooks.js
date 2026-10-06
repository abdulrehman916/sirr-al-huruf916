import { useState, useEffect } from "react";
import { platform } from "@/api/platformClient";

/**
 * Read-only hook for the Sirr module's book library.
 * Reuses the existing SirrManuscriptBook entity (no new schema).
 * Returns books sorted by newest upload first. Empty array when no
 * books exist yet — future imports appear here automatically.
 */
export function useSirrBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    platform.entities.SirrManuscriptBook.list("-upload_date", 100)
      .then((rows) => { if (alive) setBooks(rows || []); })
      .catch((e) => { if (alive) setError(e); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return { books, loading, error };
}
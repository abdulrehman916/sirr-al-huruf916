const PREFIX = 'storage://private-documents/';

// Original manuscripts stay private. Storage RLS decides who may receive a
// short-lived URL; an unavailable private source must never fall back to its
// previous external host.
export function createReferenceResolver(getClient) {
  const cache = new Map();
  const originals = new Map();
  async function resolve(value) {
    if (typeof value === 'string' && value.startsWith(PREFIX)) {
      const { data } = await getClient().auth.getSession();
      if (!data?.session) return null;
      const path = value.slice(PREFIX.length);
      let entry = cache.get(path);
      if (!entry || entry.until <= Date.now()) {
        const promise = getClient().storage.from('private-documents')
          .createSignedUrl(path, 900)
          .then(({ data, error }) => {
            const signedUrl = error ? null : data?.signedUrl || null;
            if (signedUrl) originals.set(signedUrl, value);
            return signedUrl;
          })
          .catch(() => null);
        entry = { until: Date.now() + 600_000, promise };
        cache.set(path, entry);
      }
      return entry.promise;
    }
    if (Array.isArray(value)) return Promise.all(value.map(resolve));
    if (value && typeof value === 'object') {
      return Object.fromEntries(await Promise.all(
        Object.entries(value).map(async ([key, item]) => [key, await resolve(item)]),
      ));
    }
    return value;
  }
  // Signed URLs are display values, never durable record data. Restore their
  // private object references before saving an edited card.
  function restore(value) {
    if (typeof value === 'string') {
      if (originals.has(value)) return originals.get(value);
      try {
        const parsed = new URL(value);
        const ownOrigin = new URL(getClient().supabaseUrl).origin;
        const signedPath = '/storage/v1/object/sign/private-documents/';
        if (parsed.origin === ownOrigin && parsed.pathname.startsWith(signedPath)) {
          return PREFIX + decodeURIComponent(parsed.pathname.slice(signedPath.length));
        }
      } catch { /* Ordinary content is not a storage URL. */ }
      return value;
    }
    if (Array.isArray(value)) return value.map(restore);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, restore(item)]));
    }
    return value;
  }
  return { resolve, restore, clear: () => { cache.clear(); originals.clear(); } };
}

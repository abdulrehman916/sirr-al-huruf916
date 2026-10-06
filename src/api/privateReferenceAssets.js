const PREFIX = 'storage://private-documents/';

// Original manuscripts stay private. Storage RLS decides who may receive a
// short-lived URL; an unavailable private source must never fall back to its
// previous external host.
export function createReferenceResolver(getClient) {
  const cache = new Map();
  async function resolve(value) {
    if (typeof value === 'string' && value.startsWith(PREFIX)) {
      const { data } = await getClient().auth.getSession();
      if (!data?.session) return null;
      const path = value.slice(PREFIX.length);
      let entry = cache.get(path);
      if (!entry || entry.until <= Date.now()) {
        const promise = getClient().storage.from('private-documents')
          .createSignedUrl(path, 900)
          .then(({ data, error }) => error ? null : data?.signedUrl || null)
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
  return { resolve, clear: () => cache.clear() };
}

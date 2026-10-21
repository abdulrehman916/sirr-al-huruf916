// A lost response must be retryable without duplicating a card entry.
export async function cardContentRequest(operation, timeoutMs = 30000) {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      Promise.resolve().then(() => operation(controller.signal)),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const error = new Error('The connection took too long. Your text is still here; try again.');
          error.name = 'TimeoutError';
          reject(error);
          controller.abort();
        }, timeoutMs);
      }),
    ]);
  } finally { clearTimeout(timer); }
}

// A pagination response may have started before an owner saved a newer revision.
export function mergeCardNotes(current, incoming) {
  const bySection = new Map(current.map(row => [row.section, row]));
  for (const row of incoming) {
    const existing = bySection.get(row.section);
    if (!existing || row.revision >= existing.revision) bySection.set(row.section, row);
  }
  return [...bySection.values()];
}

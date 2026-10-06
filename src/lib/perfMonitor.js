/**
 * Lightweight performance monitoring — zero-overhead in production.
 * Tracks page load times, API call latency, and memory usage.
 * Reports via navigator.sendBeacon for minimal impact.
 */

const SAMPLING_RATE = 0.05; // Sample 5% of sessions
const METRICS_KEY = '_sah_perf_v1';
const MAX_ENTRIES = 50;

// Determine if this session should be sampled
const isSampled = (() => {
  try {
    return Math.random() < SAMPLING_RATE;
  } catch { return false; }
})();

let metrics = [];
let pageStart = 0;

// Load existing metrics
try {
  const stored = sessionStorage.getItem(METRICS_KEY);
  if (stored) metrics = JSON.parse(stored);
} catch {}

function flush() {
  if (metrics.length === 0) return;
  try {
    sessionStorage.setItem(METRICS_KEY, JSON.stringify(metrics.slice(-MAX_ENTRIES)));
  } catch {}
}

/**
 * Mark page navigation start
 */
export function markPageStart() {
  if (!isSampled) return;
  pageStart = performance.now();
}

/**
 * Record page load complete
 */
export function markPageReady(pageName) {
  if (!isSampled || !pageStart) return;
  const duration = performance.now() - pageStart;
  metrics.push({
    type: 'page_load',
    page: pageName,
    duration_ms: Math.round(duration),
    ts: Date.now(),
  });
  if (metrics.length > MAX_ENTRIES) metrics.shift();
  flush();
}

/**
 * Record API call timing
 */
export function recordApiCall(name, durationMs, success = true) {
  if (!isSampled) return;
  metrics.push({
    type: 'api_call',
    name,
    duration_ms: Math.round(durationMs),
    success,
    ts: Date.now(),
  });
  if (metrics.length > MAX_ENTRIES) metrics.shift();
  flush();
}

/**
 * Record memory snapshot if available
 */
export function recordMemory() {
  if (!isSampled) return;
  try {
    const mem = performance.memory;
    if (mem) {
      metrics.push({
        type: 'memory',
        used_mb: Math.round(mem.usedJSHeapSize / 1048576),
        total_mb: Math.round(mem.totalJSHeapSize / 1048576),
        limit_mb: Math.round(mem.jsHeapSizeLimit / 1048576),
        ts: Date.now(),
      });
      if (metrics.length > MAX_ENTRIES) metrics.shift();
      flush();
    }
  } catch {}
}

/**
 * Get all metrics for this session
 */
export function getMetrics() {
  return metrics;
}

/**
 * Get simple performance score (0-100)
 */
export function getPerformanceScore() {
  const loads = metrics.filter(m => m.type === 'page_load');
  if (loads.length === 0) return null;

  const avgLoad = loads.reduce((s, m) => s + m.duration_ms, 0) / loads.length;
  const apiCalls = metrics.filter(m => m.type === 'api_call');
  const avgApi = apiCalls.length > 0
    ? apiCalls.reduce((s, m) => s + m.duration_ms, 0) / apiCalls.length
    : 0;

  // Score calculation: faster = higher score
  let score = 100;
  if (avgLoad > 3000) score -= 30;
  else if (avgLoad > 1500) score -= 15;
  else if (avgLoad > 800) score -= 5;

  if (avgApi > 1000) score -= 30;
  else if (avgApi > 500) score -= 15;
  else if (avgApi > 200) score -= 5;

  if (apiCalls.some(c => !c.success)) score -= 20;

  return Math.max(0, Math.min(100, score));
}
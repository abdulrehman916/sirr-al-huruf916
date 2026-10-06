// Lightweight singleton timing store — no React, no overhead
let _timings = {};
let _listeners = [];

export const perfStore = {
  set(key, ms) {
    _timings = { ..._timings, [key]: ms };
    _listeners.forEach(fn => fn({ ..._timings }));
  },
  get() { return { ..._timings }; },
  clear() { _timings = {}; },
  subscribe(fn) {
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  },
};
// ═══════════════════════════════════════════════════════════════
// BACK LAYERS — the phone/browser Back button closes what was opened
// inside a page (popup, sheet, expanded card, open section) one step at a
// time, instead of leaving the whole page.
//
//   useBackLayer(isOpen, close)   — in a component that owns the open state
//   <BackLayer onBack={close} />   — inside an overlay that mounts when open
//
// While something is open we push one extra history entry for the same URL.
// Back pops that entry and we call close(). Closing by the UI (✕, backdrop)
// removes our entry again, so history never fills up with stale steps.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef } from "react";

const stack = [];
let ignorePops = 0;
let listening = false;
let seq = 0;

function onPopState() {
  if (ignorePops > 0) { ignorePops -= 1; return; }
  const top = stack.pop();
  if (top) top.close();
}

function ensureListener() {
  if (listening || typeof window === "undefined") return;
  window.addEventListener("popstate", onPopState);
  listening = true;
}

export function useBackLayer(isOpen, close) {
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return undefined;
    ensureListener();
    const id = "bl" + (++seq);
    const entry = { id, close: () => closeRef.current && closeRef.current() };
    const st = window.history.state || {};
    // Keep react-router's state; bump idx so in-app Back buttons step back once.
    window.history.pushState({ ...st, idx: (Number.isInteger(st.idx) ? st.idx : 0) + 1, __backLayer: id }, "");
    stack.push(entry);

    return () => {
      const i = stack.indexOf(entry);
      if (i === -1) return; // already closed by Back
      stack.splice(i, 1);
      // Closed from the UI: drop our history entry if it is still on top.
      if (window.history.state && window.history.state.__backLayer === id) {
        ignorePops += 1;
        window.history.back();
      }
    };
  }, [isOpen]);
}

export function BackLayer({ onBack }) {
  useBackLayer(true, onBack);
  return null;
}

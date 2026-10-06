import { useState, useEffect } from "react";

// Module-level cache — shared across all hook instances to avoid duplicate MQ listeners
let cached = typeof window !== "undefined" ? window.innerWidth < 768 : false;
let mq = null;
const listeners = new Set();

function getSharedMQ() {
  if (!mq && typeof window !== "undefined") {
    mq = window.matchMedia("(max-width: 767px)");
    mq.addEventListener("change", (e) => {
      cached = e.matches;
      listeners.forEach(fn => fn(e.matches));
    });
  }
  return mq;
}

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => cached);

  useEffect(() => {
    getSharedMQ();
    // Sync in case window resized before mount
    const current = mq ? mq.matches : window.innerWidth < 768;
    if (current !== isMobile) {
      cached = current;
      setIsMobile(current);
    }
    listeners.add(setIsMobile);
    return () => listeners.delete(setIsMobile);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return isMobile;
}
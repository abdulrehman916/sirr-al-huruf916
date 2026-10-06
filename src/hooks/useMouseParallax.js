import { useEffect, useRef } from "react";
import { useMotionValue } from "framer-motion";

/**
 * Returns Framer Motion MotionValues { x, y } in range [-1, 1].
 * Uses useMotionValue so parallax NEVER triggers React re-renders.
 * On touch/mobile devices returns static zero values — no rAF at all.
 */
export default function useMouseParallax(strength = 1) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Detect touch device once — no point running rAF on mobile
  const isTouchDevice = useRef(
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  );

  useEffect(() => {
    // Skip entirely on touch/mobile — saves the whole rAF loop
    if (isTouchDevice.current) return;

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };

    const onMove = (e) => {
      target.x = ((e.clientX / window.innerWidth) - 0.5) * 2 * strength;
      target.y = ((e.clientY / window.innerHeight) - 0.5) * 2 * strength;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf;
    const tick = () => {
      const dx = (target.x - cur.x) * 0.045;
      const dy = (target.y - cur.y) * 0.045;
      // Only update MotionValues when movement is meaningful (> 0.001)
      // MotionValue.set() does NOT trigger React re-renders
      if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
        cur.x += dx;
        cur.y += dy;
        x.set(cur.x);
        y.set(cur.y);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [strength, x, y]);

  return { x, y };
}
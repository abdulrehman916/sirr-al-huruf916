import { motion, useMotionValue } from "framer-motion";
import { useState, useEffect, useMemo, memo } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { useNavigation } from "../context/NavigationContext";

const GOLD = "#D4AF37";
const G = (o) => `rgba(212,175,55,${o})`;
const CX = 260, CY = 260, SIZE = 520;

const ASMA = ["الرحمن","الرحيم","الملك","القدوس","السلام","العزيز","الجبار","النور"];

function pt(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
}

function regularPolygon(cx, cy, r, n, rotDeg = 0) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const [x, y] = pt(cx, cy, r, (i / n) * 360 + rotDeg);
    return `${x},${y}`;
  }).join(" ");
}

// Precomputed static strings — never rebuilt
const HEX1 = regularPolygon(CX, CY, 158, 6, 0);
const HEX2 = regularPolygon(CX, CY, 158, 6, 30);
const SQ1  = regularPolygon(CX, CY, 104, 4, 0);
const SQ2  = regularPolygon(CX, CY, 104, 4, 45);

const OUTER_DOTS = Array.from({ length: 12 }, (_, i) => pt(CX, CY, 228, (i / 12) * 360));
const MID_DOTS   = Array.from({ length: 6  }, (_, i) => pt(CX, CY, 164, (i / 6)  * 360));
const INNER_DOTS = Array.from({ length: 8  }, (_, i) => pt(CX, CY, 110, (i / 8)  * 360));
const CORE_DOTS  = Array.from({ length: 6  }, (_, i) => pt(CX, CY, 62,  (i / 6)  * 360));

const LIGHT_RAYS_PTS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * 360;
  const a = (angle - 90) * (Math.PI / 180);
  return { x2: CX + Math.cos(a) * 220, y2: CY + Math.sin(a) * 220 };
});

// ────────────────────────────────────────────────────────────
// MOBILE: pure SVG + CSS — zero Framer Motion animation instances
// ────────────────────────────────────────────────────────────

// CSS keyframes injected once
const MOBILE_CSS = `
@keyframes sw-spin-cw  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
@keyframes sw-spin-ccw { from { transform: rotate(0deg); }   to { transform: rotate(-360deg); } }
@keyframes sw-pulse    { 0%,100% { opacity: 0.45; } 50% { opacity: 0.85; } }
@keyframes sw-orbit    { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
@keyframes sw-orbit-r  { from { transform: rotate(0deg); }   to { transform: rotate(-360deg); } }
`;

function injectMobileCSS() {
  if (document.getElementById("sw-mobile-css")) return;
  const el = document.createElement("style");
  el.id = "sw-mobile-css";
  el.textContent = MOBILE_CSS;
  document.head.appendChild(el);
}

function MobileSacredWheel({ containerSize, deviceType }) {
  useEffect(() => { injectMobileCSS(); }, []);

  // Pause all CSS animations in this subtree when tab is hidden
  useEffect(() => {
    const el = document.getElementById("sw-mobile-root");
    if (!el) return;
    const onVis = () => {
      const state = document.hidden ? "paused" : "running";
      el.querySelectorAll("[data-sw-anim]").forEach(n => {
        n.style.animationPlayState = state;
      });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const half = containerSize / 2;
  const scale = containerSize / SIZE;
  // Use deviceType prop from HeroSection for consistent orbit radius
  const isTablet = deviceType === 'tablet';
  const orbitR = isTablet ? 164 * scale : 194 * scale;

  // Asma positions — static
  const asmaPositions = useMemo(() =>
    ASMA.map((_, i) => {
      const angle = (i / ASMA.length) * Math.PI * 2 - Math.PI / 2;
      return {
        x: half + Math.cos(angle) * orbitR,
        y: half + Math.sin(angle) * orbitR,
      };
    }),
  [half, orbitR]);

  const outerBloom = containerSize * 0.9;

  return (
    <div
      id="sw-mobile-root"
      className="relative flex items-center justify-center"
      style={{ width: containerSize, height: containerSize }}
    >
      {/* Outer bloom — static CSS pulse */}
      <div data-sw-anim="1" style={{
        position: "absolute",
        width: outerBloom, height: outerBloom,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${G("0.07")} 0%, ${G("0.02")} 52%, transparent 72%)`,
        filter: "blur(28px)",
        animation: "sw-pulse 7s ease-in-out infinite",
      }} />

      {/* SVG wheel — CSS spin, no JS */}
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ width: containerSize, height: containerSize, overflow: "visible", position: "absolute" }}
      >
        <defs>
          <filter id="sg-m" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="sw-aura-m" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={GOLD} stopOpacity="0.12" />
            <stop offset="55%"  stopColor={GOLD} stopOpacity="0.04" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0"    />
          </radialGradient>
          <radialGradient id="core-m" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={GOLD} stopOpacity="0.32" />
            <stop offset="60%"  stopColor={GOLD} stopOpacity="0.07" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0"    />
          </radialGradient>
        </defs>

        {/* Static aura */}
        <circle cx={CX} cy={CY} r={248} fill="url(#sw-aura-m)" />
        <circle cx={CX} cy={CY} r={65}  fill="url(#core-m)" />

        {/* Outer ring — CSS spin slow */}
        <g data-sw-anim="1" style={{ transformOrigin: `${CX}px ${CY}px`, animation: "sw-spin-cw 420s linear infinite" }}>
          <circle cx={CX} cy={CY} r={228} fill="none" stroke={GOLD} strokeWidth="1.4" strokeOpacity="0.35" filter="url(#sg-m)" />
          <circle cx={CX} cy={CY} r={220} fill="none" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.12" />
          {OUTER_DOTS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={3.5} fill={GOLD} fillOpacity="0.10" stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.50" />
              <circle cx={x} cy={y} r={1.4} fill={GOLD} fillOpacity="0.80" />
            </g>
          ))}
        </g>

        {/* Middle ring — CSS spin medium */}
        <g data-sw-anim="1" style={{ transformOrigin: `${CX}px ${CY}px`, animation: "sw-spin-ccw 150s linear infinite" }}>
          <circle cx={CX} cy={CY} r={164} fill="none" stroke={GOLD} strokeWidth="1.1" strokeOpacity="0.34" filter="url(#sg-m)" />
          <polyline points={HEX1} fill="none" stroke={GOLD} strokeWidth="0.65" strokeOpacity="0.20" />
          <polyline points={HEX2} fill="none" stroke={GOLD} strokeWidth="0.65" strokeOpacity="0.20" />
          {MID_DOTS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.2} fill={GOLD} fillOpacity="0.65" />
          ))}
        </g>

        {/* Inner ring — CSS spin fast */}
        <g data-sw-anim="1" style={{ transformOrigin: `${CX}px ${CY}px`, animation: "sw-spin-cw 90s linear infinite" }}>
          <circle cx={CX} cy={CY} r={110} fill="none" stroke={GOLD} strokeWidth="1" strokeOpacity="0.38" />
          <polyline points={SQ1} fill="none" stroke={GOLD} strokeWidth="0.55" strokeOpacity="0.24" />
          <polyline points={SQ2} fill="none" stroke={GOLD} strokeWidth="0.55" strokeOpacity="0.24" />
          {INNER_DOTS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={3} fill={GOLD} fillOpacity="0.12" stroke={GOLD} strokeWidth="0.7" strokeOpacity="0.48" />
              <circle cx={x} cy={y} r={1.2} fill={GOLD} fillOpacity="0.80" />
            </g>
          ))}
        </g>

        {/* Core halo */}
        <g data-sw-anim="1" style={{ transformOrigin: `${CX}px ${CY}px`, animation: "sw-spin-ccw 55s linear infinite" }}>
          <circle cx={CX} cy={CY} r={62} fill="none" stroke={GOLD} strokeWidth="1.1" strokeOpacity="0.45" />
          <circle cx={CX} cy={CY} r={52} fill="none" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.18" strokeDasharray="3,7" />
          {CORE_DOTS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={2.5} fill={GOLD} fillOpacity="0.14" stroke={GOLD} strokeWidth="0.7" strokeOpacity="0.55" />
              <circle cx={x} cy={y} r={1} fill={GOLD} fillOpacity="0.85" />
            </g>
          ))}
        </g>

        {/* Light rays — static SVG, no animation */}
        {LIGHT_RAYS_PTS.map(({ x2, y2 }, i) => (
          <line key={i} x1={CX} y1={CY} x2={x2} y2={y2}
            stroke={GOLD} strokeWidth="0.5" strokeOpacity="0.05"
          />
        ))}
      </svg>

      {/* Asma orbital names — CSS rotation only */}
      <div
        data-sw-anim="1"
        style={{
          position: "absolute", inset: 0,
          animation: "sw-orbit 120s linear infinite",
          transformOrigin: `${half}px ${half}px`,
        }}
      >
        {asmaPositions.map(({ x, y }, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x, top: y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div data-sw-anim="1" style={{
              animation: `sw-orbit-r 120s linear infinite`,
              transformOrigin: "50% 50%",
            }}>
              <span style={{
                fontFamily: "'Amiri', serif",
                fontWeight: "700",
                fontSize: "11px",
                color: GOLD,
                whiteSpace: "nowrap",
                display: "block",
                letterSpacing: "0.05em",
                direction: "rtl",
                textShadow: `0 0 6px ${G("0.60")}`,
              }}>
                {ASMA[i]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// DESKTOP: full Framer Motion (unchanged visually)
// ────────────────────────────────────────────────────────────

// Precomputed orbital keyframes for GoldenDust
const ORBIT_RADII = [222, 164, 110, 190];
const ORBIT_KEYFRAMES = ORBIT_RADII.reduce((acc, r) => {
  acc[r] = {
    x: Array.from({ length: 60 }, (_, t) => Math.cos((t / 60) * Math.PI * 2 - Math.PI / 2) * r),
    y: Array.from({ length: 60 }, (_, t) => Math.sin((t / 60) * Math.PI * 2 - Math.PI / 2) * r),
  };
  return acc;
}, {});

function Defs() {
  return (
    <defs>
      <filter id="sg" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="cg" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="bloom" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="10" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <radialGradient id="sw-aura" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor={GOLD} stopOpacity="0.14" />
        <stop offset="55%"  stopColor={GOLD} stopOpacity="0.04" />
        <stop offset="100%" stopColor={GOLD} stopOpacity="0"    />
      </radialGradient>
      <radialGradient id="core" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor={GOLD} stopOpacity="0.38" />
        <stop offset="60%"  stopColor={GOLD} stopOpacity="0.07" />
        <stop offset="100%" stopColor={GOLD} stopOpacity="0"    />
      </radialGradient>
      <radialGradient id="outerBloom" cx="50%" cy="50%" r="50%">
        <stop offset="75%"  stopColor={GOLD} stopOpacity="0"    />
        <stop offset="90%"  stopColor={GOLD} stopOpacity="0.08" />
        <stop offset="100%" stopColor={GOLD} stopOpacity="0"    />
      </radialGradient>
    </defs>
  );
}

function AuraLayers({ paused }) {
  return (
    <>
      <motion.circle cx={CX} cy={CY} r={240} fill="url(#outerBloom)"
        animate={paused ? {} : { r: [238, 252, 238], opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle cx={CX} cy={CY} r={248} fill="url(#sw-aura)"
        animate={paused ? {} : { r: [248, 262, 248], opacity: [0.50, 0.88, 0.50] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle cx={CX} cy={CY} r={65} fill="url(#core)"
        animate={paused ? {} : { r: [65, 80, 65], opacity: [0.42, 0.82, 0.42] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function OuterRing({ paused }) {
  return (
    <motion.g
      style={{ transformOrigin: `${CX}px ${CY}px` }}
      animate={paused ? {} : { rotate: 360 }}
      transition={{ duration: 420, repeat: Infinity, ease: "linear" }}
    >
      <circle cx={CX} cy={CY} r={228} fill="none" stroke={GOLD} strokeWidth="1.4" strokeOpacity="0.38" filter="url(#sg)" />
      <circle cx={CX} cy={CY} r={220} fill="none" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.14" />
      <circle cx={CX} cy={CY} r={228} fill="none" stroke={GOLD} strokeWidth="6" strokeOpacity="0.034" filter="url(#bloom)" />
      {OUTER_DOTS.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={3.5} fill={GOLD} fillOpacity="0.12" stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.55" filter="url(#sg)" />
          <circle cx={x} cy={y} r={1.4} fill={GOLD} fillOpacity="0.85" />
        </g>
      ))}
    </motion.g>
  );
}

function MiddleRing({ paused }) {
  return (
    <motion.g
      style={{ transformOrigin: `${CX}px ${CY}px` }}
      animate={paused ? {} : { rotate: -360 }}
      transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
    >
      <circle cx={CX} cy={CY} r={164} fill="none" stroke={GOLD} strokeWidth="1.1" strokeOpacity="0.36" filter="url(#sg)" />
      <polyline points={HEX1} fill="none" stroke={GOLD} strokeWidth="0.65" strokeOpacity="0.22" />
      <polyline points={HEX2} fill="none" stroke={GOLD} strokeWidth="0.65" strokeOpacity="0.22" />
      {MID_DOTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.2} fill={GOLD} fillOpacity="0.68" filter="url(#sg)" />
      ))}
    </motion.g>
  );
}

function InnerRing({ paused }) {
  return (
    <motion.g
      style={{ transformOrigin: `${CX}px ${CY}px` }}
      animate={paused ? {} : { rotate: 360 }}
      transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
    >
      <circle cx={CX} cy={CY} r={110} fill="none" stroke={GOLD} strokeWidth="1" strokeOpacity="0.40" filter="url(#sg)" />
      <polyline points={SQ1} fill="none" stroke={GOLD} strokeWidth="0.55" strokeOpacity="0.26" />
      <polyline points={SQ2} fill="none" stroke={GOLD} strokeWidth="0.55" strokeOpacity="0.26" />
      {INNER_DOTS.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={3} fill={GOLD} fillOpacity="0.13" stroke={GOLD} strokeWidth="0.7" strokeOpacity="0.52" />
          <circle cx={x} cy={y} r={1.2} fill={GOLD} fillOpacity="0.86" />
        </g>
      ))}
    </motion.g>
  );
}

function CoreHalo({ paused }) {
  return (
    <motion.g
      style={{ transformOrigin: `${CX}px ${CY}px` }}
      animate={paused ? {} : { rotate: -360 }}
      transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
    >
      <circle cx={CX} cy={CY} r={62} fill="none" stroke={GOLD} strokeWidth="1.1" strokeOpacity="0.48" filter="url(#cg)" />
      <circle cx={CX} cy={CY} r={52} fill="none" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.20" strokeDasharray="3,7" />
      {CORE_DOTS.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={2.5} fill={GOLD} fillOpacity="0.16" stroke={GOLD} strokeWidth="0.7" strokeOpacity="0.58" />
          <circle cx={x} cy={y} r={1} fill={GOLD} fillOpacity="0.90" />
        </g>
      ))}
    </motion.g>
  );
}

function SvgLightRays({ paused }) {
  return (
    <g>
      {LIGHT_RAYS_PTS.map(({ x2, y2 }, i) => (
        <motion.line key={i}
          x1={CX} y1={CY} x2={x2} y2={y2}
          stroke={GOLD} strokeWidth="0.6" strokeOpacity="0.06"
          animate={paused ? {} : { strokeOpacity: [0.04, 0.10, 0.04] }}
          transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
      ))}
    </g>
  );
}

function SigilSVG({ mouseX, mouseY, paused }) {
  return (
    <div style={{
      position: "absolute", width: SIZE, height: SIZE,
      left: "50%", top: "50%",
      transform: "translate(-50%, -50%) translateZ(0)",
    }}>
      <motion.div style={{ position: "absolute", inset: 0, x: mouseX, y: mouseY }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: SIZE, height: SIZE, overflow: "visible" }}>
          <Defs />
          <AuraLayers paused={paused} />
          <OuterRing paused={paused} />
        </svg>
      </motion.div>

      {/* Atmospheric fog */}
      <motion.div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
        x: mouseX, y: mouseY,
      }}>
        <motion.div style={{
          position: "absolute",
          width: SIZE * 0.68, height: SIZE * 0.68,
          borderRadius: "50%",
          background: "radial-gradient(circle, transparent 48%, rgba(2,8,22,0.22) 62%, rgba(2,8,22,0.10) 72%, transparent 85%)",
          filter: "blur(14px)",
        }}
          animate={paused ? {} : { opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div style={{ position: "absolute", inset: 0, x: mouseX, y: mouseY }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: SIZE, height: SIZE, overflow: "visible" }}>
          <MiddleRing paused={paused} />
        </svg>
      </motion.div>

      <motion.div style={{ position: "absolute", inset: 0, x: mouseX, y: mouseY }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: SIZE, height: SIZE, overflow: "visible" }}>
          <SvgLightRays paused={paused} />
          <InnerRing paused={paused} />
          <CoreHalo paused={paused} />
        </svg>
      </motion.div>
    </div>
  );
}

function AsmaNames({ containerSize, paused, deviceType }) {
  const half = containerSize / 2;
  const SVG_SCALE = containerSize / SIZE;
  // Use deviceType prop from HeroSection for consistent orbit radius
  const isTablet = deviceType === 'tablet';
  const ORBIT_R = isTablet ? 164 * SVG_SCALE : 194 * SVG_SCALE;

  const positions = useMemo(() =>
    ASMA.map((_, i) => {
      const angle = (i / ASMA.length) * Math.PI * 2 - Math.PI / 2;
      return {
        x: Math.cos(angle) * ORBIT_R,
        y: Math.sin(angle) * ORBIT_R,
      };
    }),
  [ORBIT_R]);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        zIndex: 8,
        transformOrigin: "0px 0px",
        left: half,
        top: half,
        width: 0,
        height: 0,
      }}
      animate={paused ? {} : { rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
    >
      {positions.map(({ x, y }, i) => {
        const name = ASMA[i];
        const breathDelay = (i / ASMA.length) * 4;
        return (
          <motion.div key={name}
            style={{
              position: "absolute",
              left: x,
              top: y,
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={paused ? {} : { rotate: -360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              style={{
                position: "absolute", inset: "-10px -16px", borderRadius: "50%",
                background: `radial-gradient(ellipse, ${G("0.30")} 0%, transparent 68%)`,
                pointerEvents: "none",
              }}
              animate={paused ? {} : { opacity: [0.35, 0.85, 0.35], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: breathDelay }}
            />
            <span
              style={{
                fontFamily: "'Amiri', serif", fontWeight: "700",
                fontSize: "13px", color: GOLD,
                whiteSpace: "nowrap", display: "block",
                letterSpacing: "0.05em", direction: "rtl", position: "relative", zIndex: 1,
                textShadow: `0 0 8px ${G("0.65")}, 0 0 20px ${G("0.28")}`,
              }}
            >
              {name}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function GoldenDust({ containerSize, paused }) {
  const SVG_SCALE = containerSize / SIZE;

  const particles = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => {
      const baseR = ORBIT_RADII[i % 4];
      const scale = SVG_SCALE;
      return {
        orbitR: baseR * scale,
        closestR: baseR,
        offset: i / 14,
        size: i % 4 === 0 ? 2.2 : 1.4,
        duration: 65 + i * 7,
      };
    }),
  [SVG_SCALE]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 3 }}>
      {particles.map((p, i) => {
        const scale = p.orbitR / ORBIT_RADII[i % 4];
        const kf = ORBIT_KEYFRAMES[ORBIT_RADII[i % 4]];
        const scaledX = kf.x.map(v => v * scale);
        const scaledY = kf.y.map(v => v * scale);
        return (
          <motion.div key={i}
            style={{
              position: "absolute",
              width: p.size, height: p.size,
              borderRadius: "50%",
              background: GOLD,
              boxShadow: `0 0 ${p.size * 5}px ${G("0.80")}`,
              top: "50%", left: "50%",
              marginTop: -p.size / 2, marginLeft: -p.size / 2,
            }}
            animate={paused ? {} : { x: scaledX, y: scaledY, opacity: [0.18, 0.75, 0.18] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
          />
        );
      })}
    </div>
  );
}

function getContainerSize() {
  if (typeof window === "undefined") return 400;
  const w = window.innerWidth;
  const h = window.screen.height; // Use screen.height (stable) instead of innerHeight (changes with keyboard)
  
  // Mobile (<768px): original behavior, unchanged
  if (w < 768) {
    const maxByHeight = Math.min(h * 0.70, 500);
    return Math.min(maxByHeight, Math.max(260, w * 0.85));
  }
  
  // Large Tablet (768-1366px): Galaxy Tab A7 FE optimized
  // Scale down to ensure entire circle fits within viewport
  if (w < 1366) {
    const maxByHeight = Math.min(h * 0.50, 420);
    return Math.min(maxByHeight, w * 0.55);
  }
  
  // Desktop (>=1366px): original desktop behavior
  const maxByHeight = Math.min(h * 0.70, 500);
  return Math.min(maxByHeight, Math.max(260, w * 0.85));
}

// ────────────────────────────────────────────────────────────
// Main export
// ────────────────────────────────────────────────────────────
export default function SacredWheel({ mouse, containerSize: parentContainerSize, deviceType }) {
  const isMobile = useIsMobile();
  const { isNavigating } = useNavigation();

  // Use parent-provided size if available (HeroSection), otherwise calculate internally
  const containerSize = parentContainerSize || getContainerSize();
  
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const mouseX = mouse?.x ?? fallbackX;
  const mouseY = mouse?.y ?? fallbackY;

  const bloomX = useMotionValue(0);
  const bloomY = useMotionValue(0);

  useEffect(() => {
    if (isMobile) return;
    const unsubX = mouseX.on("change", v => bloomX.set(v * 2));
    const unsubY = mouseY.on("change", v => bloomY.set(v * 2));
    return () => { unsubX(); unsubY(); };
  }, [isMobile, mouseX, mouseY, bloomX, bloomY]);

  // Mobile: zero Framer Motion animation instances
  if (isMobile) {
    return <MobileSacredWheel containerSize={containerSize} deviceType={deviceType} />;
  }

  // Desktop/Tablet: experience with synchronized container size
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: containerSize, height: containerSize }}
    >
      <motion.div style={{
        position: "absolute",
        width: containerSize + 80, height: containerSize + 80,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${G("0.08")} 0%, ${G("0.025")} 52%, transparent 72%)`,
        filter: "blur(40px)",
        x: bloomX, y: bloomY,
      }} />
      <SigilSVG mouseX={mouseX} mouseY={mouseY} paused={isNavigating} />
      <GoldenDust containerSize={containerSize} paused={isNavigating} />
      <AsmaNames containerSize={containerSize} paused={isNavigating} deviceType={deviceType} />
    </div>
  );
}
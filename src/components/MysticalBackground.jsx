import { motion } from "framer-motion";
import { memo, useEffect } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { useNavigation } from "../context/NavigationContext";

function randomBetween(a, b) { return a + Math.random() * (b - a); }

// Static data — generated once at module level, never rebuilt
const STARS_ALL = Array.from({ length: 80 }, () => ({
  size:    randomBetween(0.5, 2.2),
  top:     randomBetween(0, 100),
  left:    randomBetween(0, 100),
  opacity: randomBetween(0.15, 0.70),
  dur:     randomBetween(2.5, 8),
  delay:   randomBetween(0, 9),
  gold:    Math.random() < 0.12,
}));

const DUST_ALL = Array.from({ length: 14 }, () => ({
  size:    randomBetween(1, 2.5),
  startX:  randomBetween(10, 90),
  startY:  randomBetween(25, 85),
  driftX:  randomBetween(-40, 40),
  driftY:  randomBetween(-60, -130),
  dur:     randomBetween(16, 32),
  delay:   randomBetween(0, 20),
  opacity: randomBetween(0.18, 0.50),
}));

const BG_LETTERS = ["ب","ح","ط","ي","ل","م","ن","ع","ف","ص","ق","ر","ش","و","ك"];
const BG_LETTER_DATA = Array.from({ length: 8 }, (_, i) => ({
  char:    BG_LETTERS[i % BG_LETTERS.length],
  top:     randomBetween(5, 90),
  left:    randomBetween(3, 93),
  size:    randomBetween(22, 58),
  opacity: randomBetween(0.018, 0.048),
  dur:     randomBetween(10, 22),
  delay:   randomBetween(0, 12),
}));

const GEO = [
  { r: 420, sides: 6, opacity: 0.040, dur: 100, dir: 1  },
  { r: 310, sides: 8, opacity: 0.045, dur: 75,  dir: -1 },
];

function polygon(cx, cy, r, sides) {
  const pts = [];
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return pts.join(" ");
}

// Precomputed geo polygon strings
const GEO_POLYS = GEO.map(g => polygon(400, 400, g.r, g.sides));

// ─────────────────────────────────────────────────────────────
// MOBILE: pure CSS animations — zero Framer Motion instances
// ─────────────────────────────────────────────────────────────

const MOBILE_STARS = STARS_ALL.slice(0, 35);
const MOBILE_DUST  = DUST_ALL.slice(0, 5);
const MOBILE_LETTERS = BG_LETTER_DATA.slice(0, 4);

function MobileBackground() {
  // Pause all CSS animations when tab is hidden — prevents background GPU usage
  useEffect(() => {
    const el = document.getElementById("mobile-bg-root");
    if (!el) return;
    const onVis = () => {
      el.style.animationPlayState = document.hidden ? "paused" : "running";
      // Apply to all animated children
      el.querySelectorAll("[data-anim]").forEach(child => {
        child.style.animationPlayState = document.hidden ? "paused" : "running";
      });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      id="mobile-bg-root"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{
        background: "linear-gradient(180deg, #010308 0%, #020a18 18%, #050d22 50%, #040a1c 75%, #020610 100%)",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Stars — reduced to 20, CSS animation only, no willChange */}
      {MOBILE_STARS.slice(0, 20).map((s, i) => (
        <div key={i}
          data-anim="1"
          className="absolute rounded-full"
          style={{
            width: s.size, height: s.size,
            top: `${s.top}%`, left: `${s.left}%`,
            background: s.gold ? "rgba(212,175,55,0.8)" : "#ffffff",
            opacity: s.opacity,
            animation: `sh-twinkle ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Gold dust — reduced to 3, CSS animation only */}
      {MOBILE_DUST.slice(0, 3).map((d, i) => (
        <div key={`d${i}`}
          data-anim="1"
          className="absolute rounded-full"
          style={{
            width: d.size, height: d.size,
            left: `${d.startX}%`, top: `${d.startY}%`,
            background: "#D4AF37",
            opacity: d.opacity,
            animation: `sh-drift-${i % 4} ${d.dur}s ease-in-out infinite`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}

      {/* Arabic background letters — REMOVED on mobile (decorative only, high GPU cost) */}

      {/* Vignette — static, no animation */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(1,3,8,0.65) 100%)",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DESKTOP: full Framer Motion experience
// ─────────────────────────────────────────────────────────────

function StarField({ mouse, paused }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {STARS_ALL.slice(0, 60).map((s, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{
            width: s.size, height: s.size,
            top: `${s.top}%`, left: `${s.left}%`,
            background: s.gold ? "rgba(212,175,55,0.8)" : "#ffffff",
            x: mouse.x * (i % 2 === 0 ? -6 : -10),
            y: mouse.y * (i % 2 === 0 ? -6 : -10),
          }}
          animate={paused ? {} : { opacity: [s.opacity * 0.2, s.opacity, s.opacity * 0.2] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        />
      ))}
    </div>
  );
}

function NebulaLayers({ mouse, paused }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(125deg, transparent 20%, rgba(80,70,150,0.06) 40%, rgba(110,90,190,0.09) 50%, rgba(80,70,150,0.06) 60%, transparent 80%)",
        filter: "blur(40px)",
      }} />
      <motion.div className="absolute"
        style={{
          width: 600, height: 450, maxWidth: 900,
          top: "30%", left: "50%", transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(15,35,90,0.28) 0%, rgba(8,18,55,0.13) 50%, transparent 75%)",
          filter: "blur(60px)",
          x: mouse.x * -18, y: mouse.y * -12,
        }}
        animate={paused ? {} : { scale: [1, 1.06, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute"
        style={{
          width: 400, height: 400,
          top: "-15%", left: "-15%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(55,45,170,0.12) 0%, rgba(25,18,90,0.06) 55%, transparent 75%)",
          filter: "blur(70px)",
          x: mouse.x * -22, y: mouse.y * -16,
        }}
        animate={paused ? {} : { opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute"
        style={{
          width: 380, height: 380,
          bottom: "-10%", right: "-10%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,90,165,0.10) 0%, rgba(0,55,110,0.05) 55%, transparent 75%)",
          filter: "blur(65px)",
          x: mouse.x * -14, y: mouse.y * -10,
        }}
        animate={paused ? {} : { opacity: [0.30, 0.70, 0.30] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />
    </div>
  );
}

function GoldDust({ paused }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {DUST_ALL.map((d, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{
            width: d.size, height: d.size,
            left: `${d.startX}%`, top: `${d.startY}%`,
            background: "#D4AF37",
            boxShadow: `0 0 ${d.size * 3}px rgba(212,175,55,0.55)`,
          }}
          animate={paused ? {} : { x: d.driftX, y: d.driftY, opacity: [0, d.opacity, d.opacity * 0.5, 0] }}
          transition={{ duration: d.dur, repeat: Infinity, ease: "easeOut", delay: d.delay }}
        />
      ))}
    </div>
  );
}

function BackgroundLetters({ mouse, paused }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ filter: "blur(1.5px)" }}>
      {BG_LETTER_DATA.map((l, i) => (
        <motion.span key={i}
          className="absolute font-amiri select-none"
          style={{
            top: `${l.top}%`, left: `${l.left}%`,
            fontSize: l.size,
            color: "#D4AF37",
            opacity: l.opacity,
            x: mouse.x * -6,
            y: mouse.y * -6,
          }}
          animate={paused ? {} : { opacity: [l.opacity * 0.4, l.opacity, l.opacity * 0.4], y: [0, -10, 0] }}
          transition={{ duration: l.dur, repeat: Infinity, ease: "easeInOut", delay: l.delay }}
        >
          {l.char}
        </motion.span>
      ))}
    </div>
  );
}

function SacredGeoBg({ mouse, paused }) {
  return (
    <motion.div className="absolute inset-0"
      style={{ x: mouse.x * -6, y: mouse.y * -6 }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="bgGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {GEO.map((g, i) => (
          <motion.polyline key={i}
            points={GEO_POLYS[i]}
            fill="none" stroke="#D4AF37" strokeWidth="0.5"
            strokeOpacity={g.opacity}
            filter="url(#bgGlow)"
            style={{ originX: "400px", originY: "400px" }}
            animate={paused ? {} : { rotate: g.dir * 360 }}
            transition={{ duration: g.dur, repeat: Infinity, ease: "linear" }}
          />
        ))}
        {[0, 30, 60, 90, 120, 150].map((angle, i) => (
          <line key={i}
            x1={400 + Math.cos((angle * Math.PI) / 180) * 420}
            y1={400 + Math.sin((angle * Math.PI) / 180) * 420}
            x2={400 - Math.cos((angle * Math.PI) / 180) * 420}
            y2={400 - Math.sin((angle * Math.PI) / 180) * 420}
            stroke="#D4AF37" strokeWidth="0.35" strokeOpacity="0.032"
          />
        ))}
      </svg>
    </motion.div>
  );
}

function LightRays({ mouse, paused }) {
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ x: mouse.x * 4, y: mouse.y * 4 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i}
          className="absolute"
          style={{
            width: 1.5, height: 280,
            background: "linear-gradient(to bottom, rgba(212,175,55,0.14), transparent)",
            transformOrigin: "top center",
            top: "50%", left: "50%", marginLeft: -0.75,
            rotate: `${(i / 8) * 360}deg`,
          }}
          animate={paused ? {} : { opacity: [0.25, 0.60, 0.25] }}
          transition={{ duration: 6 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
        />
      ))}
    </motion.div>
  );
}

// Module-level constant — generated once, never re-created
const COSMIC_PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const s = (i * 137.508);
  const rand = (k) => { const v = Math.sin(s * k) * 43758.5453; return (v % 1 + 1) % 1; };
  return {
    size:    rand(1) * 1.0 + 0.5,
    top:     rand(2) * 100,
    left:    rand(3) * 100,
    driftX:  (rand(4) - 0.5) * 30,
    driftY:  rand(5) * -22 + rand(6) * 8 - 8,
    dur:     rand(7) * 25 + 20,
    delay:   rand(8) * 30,
    opacity: rand(9) * 0.14 + 0.06,
    gold:    rand(10) < 0.2,
  };
});

function CosmicParticles({ paused }) {
  const particles = COSMIC_PARTICLES;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            top: `${p.top}%`, left: `${p.left}%`,
            background: p.gold ? "#D4AF37" : "#c8d8f0",
            opacity: p.opacity,
          }}
          animate={paused ? {} : { x: [0, p.driftX, 0], y: [0, p.driftY, 0], opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  );
}

const ZERO_MV = { x: { get: () => 0, set: () => {}, on: () => () => {} }, y: { get: () => 0, set: () => {}, on: () => () => {} } };

const DesktopBackground = memo(function DesktopBackground({ mouse, isNavigating }) {
  const safeMouse = mouse ?? ZERO_MV;
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #010308 0%, #020a18 18%, #050d22 50%, #040a1c 75%, #020610 100%)",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      <StarField mouse={safeMouse} paused={isNavigating} />
      <NebulaLayers mouse={safeMouse} paused={isNavigating} />
      <BackgroundLetters mouse={safeMouse} paused={isNavigating} />
      <SacredGeoBg mouse={safeMouse} paused={isNavigating} />
      <LightRays mouse={safeMouse} paused={isNavigating} />
      <CosmicParticles paused={isNavigating} />
      <GoldDust paused={isNavigating} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(1,3,8,0.72) 100%)",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 45% 45% at 0% 0%, rgba(0,0,0,0.55) 0%, transparent 60%),
          radial-gradient(ellipse 45% 45% at 100% 0%, rgba(0,0,0,0.55) 0%, transparent 60%),
          radial-gradient(ellipse 45% 45% at 0% 100%, rgba(0,0,0,0.55) 0%, transparent 60%),
          radial-gradient(ellipse 45% 45% at 100% 100%, rgba(0,0,0,0.55) 0%, transparent 60%)
        `,
      }} />
    </div>
  );
});

export default function MysticalBackground({ mouse }) {
  const isMobile = useIsMobile();
  const { isNavigating } = useNavigation();

  if (isMobile) return <MobileBackground />;
  return <DesktopBackground mouse={mouse} isNavigating={isNavigating} />;
}
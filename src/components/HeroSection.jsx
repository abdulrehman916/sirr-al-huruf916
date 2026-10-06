import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigation } from "../context/NavigationContext";
import { useTranslation } from "@/i18n/useTranslation";
import SacredWheel from "./SacredWheel";
import NavCard from "./NavCards/NavCard";
import useIsMobile from "../hooks/useIsMobile";

// ── Static data ───────────────────────────────────────────────────
const LIGHT_RAYS = Array.from({ length: 12 }, (_, i) => ({
  angle: (i / 12) * 360,
  opacity: 0.04 + (i % 3) * 0.02,
  dur: 5 + i * 0.7,
  delay: i * 0.4,
  width: i % 4 === 0 ? 2 : 1,
  length: i % 3 === 0 ? 320 : 240,
}));

const ORBITAL_RINGS = [
  { r: "min(340px, 70vw)", dur: 180, dir: 1,  opacity: 0.16, width: 0.8 },
  { r: "min(260px, 54vw)", dur: 120, dir: -1, opacity: 0.20, width: 0.6 },
  { r: "min(180px, 38vw)", dur:  80, dir: 1,  opacity: 0.26, width: 0.5 },
  { r: "min(430px, 88vw)", dur: 260, dir: -1, opacity: 0.09, width: 0.6 },
];


// ── Static ring sizes for mobile (no Framer Motion) ──────────────
const STATIC_RINGS = [
  { r: "min(235px,49vw)", border: "1px solid rgba(212,175,55,0.30)", shadow: "0 0 24px rgba(212,175,55,0.12)" },
  { r: "min(295px,61vw)", border: "0.5px solid rgba(212,175,55,0.13)", shadow: "none" },
];

// ── Sub-components ────────────────────────────────────────────────

function OrbitalRings({ paused, deviceType }) {
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  
  if (isMobile) {
    // CSS-only rings on mobile — no Framer Motion
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
        {STATIC_RINGS.map((r, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: r.r, height: r.r,
            border: r.border,
            boxShadow: r.shadow,
          }} />
        ))}
      </div>
    );
  }
  
  if (isTablet) {
    // Tablet: CSS rings with reduced scale
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute rounded-full" style={{
          width: "min(220px,46vw)", height: "min(220px,46vw)",
          border: "1px solid rgba(212,175,55,0.28)",
          boxShadow: "0 0 20px rgba(212,175,55,0.10)",
        }} />
        <div className="absolute rounded-full" style={{
          width: "min(280px,58vw)", height: "min(280px,58vw)",
          border: "0.5px solid rgba(212,175,55,0.12)",
        }} />
      </div>
    );
  }
  
  // Desktop: full Framer Motion rings
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
      {ORBITAL_RINGS.map((ring, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            width: ring.r, height: ring.r,
            border: `${ring.width}px dashed rgba(212,175,55,${ring.opacity})`,
            boxShadow: `0 0 16px rgba(212,175,55,${ring.opacity * 0.55})`,
          }}
          animate={paused ? {} : { rotate: ring.dir * 360 }}
          transition={{ duration: ring.dur, repeat: Infinity, ease: "linear" }}
        />
      ))}
      <div className="absolute rounded-full" style={{
        width: "min(235px,49vw)", height: "min(235px,49vw)",
        border: "1px solid rgba(212,175,55,0.30)",
        boxShadow: "0 0 24px rgba(212,175,55,0.12), 0 0 70px rgba(212,175,55,0.05)",
      }} />
      <div className="absolute rounded-full" style={{
        width: "min(295px,61vw)", height: "min(295px,61vw)",
        border: "0.5px solid rgba(212,175,55,0.13)",
      }} />
    </div>
  );
}

function LightRays({ paused }) {
  // Desktop only — caller already guards with !isMobile
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {LIGHT_RAYS.map((ray, i) => (
        <motion.div key={i} className="absolute"
          style={{
            width: ray.width, height: ray.length,
            background: "linear-gradient(to bottom, rgba(212,175,55,0.20), rgba(212,175,55,0.05), transparent)",
            transformOrigin: "top center",
            top: "50%", left: "50%", marginLeft: -ray.width / 2,
            rotate: `${ray.angle}deg`,
          }}
          animate={paused ? {} : { opacity: [ray.opacity, ray.opacity * 3.2, ray.opacity] }}
          transition={{ duration: ray.dur, repeat: Infinity, ease: "easeInOut", delay: ray.delay }}
        />
      ))}
      <motion.div className="absolute rounded-full" style={{
        width: 220, height: 220,
        background: "radial-gradient(circle, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.05) 45%, transparent 72%)",
        filter: "blur(22px)",
      }}
        animate={paused ? {} : { scale: [1, 1.42, 1], opacity: [0.45, 0.88, 0.45] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}









function ManuscriptIntro() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.8 }}
      className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto mt-5 sm:mt-6 md:mt-7 px-3 sm:px-4">
      <div className="rounded-2xl px-5 py-3 sm:px-6 sm:py-4 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(10,20,50,0.75) 0%, rgba(4,10,28,0.85) 100%)",
          border: "1px solid rgba(212,175,55,0.22)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.55), 0 0 24px rgba(212,175,55,0.08), inset 0 1px 0 rgba(212,175,55,0.15)",
        }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
          background:"linear-gradient(90deg,transparent 5%,rgba(212,175,55,0.60) 50%,transparent 95%)" }} />
        <p className="font-amiri text-sm leading-relaxed" dir="rtl"
          style={{ color:"rgba(245,230,180,0.78)", lineHeight:2, letterSpacing:"0.04em", fontSize:"15px", textAlign:"center" }}>
          علم الحروف — الحكمة الربانية في ميزان الأعداد والأسرار
        </p>
        <div className="flex items-center justify-center gap-2.5 mt-3">
          <div style={{ height:1, width:28, background:"linear-gradient(to right,transparent,rgba(212,175,55,0.50))" }} />
          <div style={{ width:3, height:3, borderRadius:"50%", background:"rgba(212,175,55,0.50)" }} />
          <p className="font-inter text-[8px] uppercase tracking-[0.28em]" style={{ color:"rgba(212,175,55,0.50)", textAlign:"center" }}>
            ILM AL-HURUF
          </p>
          <div style={{ width:3, height:3, borderRadius:"50%", background:"rgba(212,175,55,0.50)" }} />
          <div style={{ height:1, width:28, background:"linear-gradient(to left,transparent,rgba(212,175,55,0.50))" }} />
        </div>
      </div>
    </motion.div>
  );
}

function GoldDivider({ delay = 0 }) {
  return (
    <motion.div initial={{ scaleX:0, opacity:0 }} animate={{ scaleX:1, opacity:1 }}
      transition={{ duration:0.7, delay, ease:"easeOut" }}
      className="flex items-center justify-center gap-2 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto my-1">
      <div style={{ flex:1, height:0.5, background:"linear-gradient(to right,transparent,rgba(212,175,55,0.35))" }} />
      <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(212,175,55,0.55)", boxShadow:"0 0 6px rgba(212,175,55,0.7)" }} />
      <div style={{ flex:1, height:0.5, background:"linear-gradient(to left,transparent,rgba(212,175,55,0.35))" }} />
    </motion.div>
  );
}



// Desktop: full animated title
function HeroTitleDesktop({ paused }) {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.9, delay:0.4 }}
      className="text-center z-10 px-4 mt-4">
      <h1 className="font-amiri font-bold"
        style={{
          fontSize:"clamp(3rem,13vw,5.8rem)", color:"#f5ecd4", lineHeight:1.08, letterSpacing:"0.025em",
          textShadow:"0 0 36px rgba(212,175,55,0.48), 0 0 70px rgba(212,175,55,0.18), 0 2px 20px rgba(0,0,0,0.60)",
        }}>
        سرّ الحروف
      </h1>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9, duration:0.7 }} className="mt-3 space-y-1.5">
        <p className="font-inter font-bold tracking-[0.38em] uppercase"
          style={{ fontSize:"clamp(10px,2.6vw,14px)", color:"rgba(212,175,55,0.88)", textShadow:"0 0 14px rgba(212,175,55,0.30)" }}>
          Sirrul Huruf
        </p>
        <p className="font-inter tracking-[0.22em] uppercase"
          style={{ fontSize:"clamp(8px,1.6vw,10px)", color:"rgba(255,255,255,0.38)" }}>
          {t("hero_subtitle", "Advanced Ilm al-Huruf Analysis")}
        </p>
      </motion.div>
      <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ delay:1.1, duration:0.9 }}
        className="mt-5 flex items-center justify-center gap-2.5">
        <div style={{ width:36, height:0.5, background:"linear-gradient(to right,transparent,rgba(212,175,55,0.65))" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", border:"1px solid rgba(212,175,55,0.40)", background:"rgba(212,175,55,0.08)", boxShadow:"0 0 8px rgba(212,175,55,0.35)" }} />
        <div style={{ width:6, height:6, borderRadius:"50%", background:"#D4AF37", boxShadow:"0 0 10px rgba(212,175,55,0.75)" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", border:"1px solid rgba(212,175,55,0.40)", background:"rgba(212,175,55,0.08)", boxShadow:"0 0 8px rgba(212,175,55,0.35)" }} />
        <div style={{ width:36, height:0.5, background:"linear-gradient(to left,transparent,rgba(212,175,55,0.65))" }} />
      </motion.div>
    </motion.div>
  );
}

// Mobile: entrance animations only, no infinite loops
function HeroTitleMobile() {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.9, delay:0.4 }}
      className="text-center z-10 px-4 mt-4">
      <h1 className="font-amiri font-bold"
        style={{
          fontSize:"clamp(3rem,13vw,5.8rem)", color:"#f5ecd4",
          lineHeight:1.08, letterSpacing:"0.025em",
          textShadow:"0 0 32px rgba(212,175,55,0.50), 0 2px 20px rgba(0,0,0,0.60)",
        }}>
        سرّ الحروف
      </h1>
      <div className="mt-3 space-y-1.5">
        <p className="font-inter font-bold tracking-[0.38em] uppercase"
          style={{ fontSize:"clamp(10px,2.6vw,14px)", color:"rgba(212,175,55,0.88)" }}>
          Sirrul Huruf
        </p>
        <p className="font-inter tracking-[0.22em] uppercase"
          style={{ fontSize:"clamp(8px,1.6vw,10px)", color:"rgba(255,255,255,0.38)" }}>
          {t("hero_subtitle", "Advanced Ilm al-Huruf Analysis")}
        </p>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2.5">
        <div style={{ width:36, height:0.5, background:"linear-gradient(to right,transparent,rgba(212,175,55,0.65))" }} />
        <div style={{ width:6, height:6, borderRadius:"50%", background:"#D4AF37", boxShadow:"0 0 10px rgba(212,175,55,0.75)" }} />
        <div style={{ width:36, height:0.5, background:"linear-gradient(to left,transparent,rgba(212,175,55,0.65))" }} />
      </div>
    </motion.div>
  );
}

// Tablet: balanced proportions — reduced spacing, scaled typography
function HeroTitleTablet({ paused }) {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.8, delay:0.3 }}
      className="text-center z-10 px-4 mt-3">
      <h1 className="font-amiri font-bold"
        style={{
          fontSize:"clamp(2.2rem,8vw,4.2rem)", color:"#f5ecd4", lineHeight:1.1, letterSpacing:"0.02em",
          textShadow:"0 0 28px rgba(212,175,55,0.42), 0 2px 16px rgba(0,0,0,0.55)",
        }}>
        سرّ الحروف
      </h1>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7, duration:0.6 }} className="mt-2.5 space-y-1">
        <p className="font-inter font-bold tracking-[0.32em] uppercase"
          style={{ fontSize:"clamp(9px,2.2vw,12px)", color:"rgba(212,175,55,0.85)", textShadow:"0 0 10px rgba(212,175,55,0.25)" }}>
          Sirrul Huruf
        </p>
        <p className="font-inter tracking-[0.20em] uppercase"
          style={{ fontSize:"clamp(7px,1.4vw,9px)", color:"rgba(255,255,255,0.35)" }}>
          {t("hero_subtitle", "Advanced Ilm al-Huruf Analysis")}
        </p>
      </motion.div>
      <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ delay:0.9, duration:0.7 }}
        className="mt-4 flex items-center justify-center gap-2">
        <div style={{ width:28, height:0.5, background:"linear-gradient(to right,transparent,rgba(212,175,55,0.58))" }} />
        <div style={{ width:5, height:5, borderRadius:"50%", background:"#D4AF37", boxShadow:"0 0 8px rgba(212,175,55,0.65)" }} />
        <div style={{ width:28, height:0.5, background:"linear-gradient(to left,transparent,rgba(212,175,55,0.58))" }} />
      </motion.div>
    </motion.div>
  );
}

// Desktop: full Allah animations
function AllahCalligraphyDesktop({ paused }) {
  return (
    <motion.div initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }}
      transition={{ duration:1.4, ease:"easeOut" }}
      className="absolute z-20 flex items-center justify-center">
      <div className="absolute rounded-full pointer-events-none"
        style={{ width:220, height:220, background:"radial-gradient(circle,rgba(212,175,55,0.22) 0%,rgba(212,175,55,0.08) 38%,transparent 75%)", filter:"blur(22px)", zIndex:0, opacity:0.60 }} />
      <div className="absolute rounded-full pointer-events-none"
        style={{ width:110, height:110, background:"radial-gradient(circle,rgba(212,175,55,0.32) 0%,rgba(212,175,55,0.10) 58%,transparent 82%)", filter:"blur(12px)", zIndex:1, opacity:0.70 }} />
      <motion.span className="font-amiri font-bold relative select-none"
        style={{
          fontSize:"3.4rem", color:"#D4AF37", lineHeight:1, letterSpacing:"0.03em", zIndex:2,
          textShadow:"0 0 14px rgba(212,175,55,0.70), 0 0 40px rgba(212,175,55,0.35)",
        }}
        animate={paused ? {} : { y:[0,-5,0] }}
        transition={{ duration:4.5, repeat:Infinity, ease:"easeInOut" }}>
        الله
      </motion.span>
    </motion.div>
  );
}

// Mobile: static Allah — no infinite animations
function AllahCalligraphyMobile() {
  return (
    <motion.div initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }}
      transition={{ duration:1.2, ease:"easeOut" }}
      className="absolute z-20 flex items-center justify-center">
      <div className="absolute rounded-full pointer-events-none" style={{
        width:160, height:160,
        background:"radial-gradient(circle,rgba(212,175,55,0.20) 0%,transparent 72%)",
        filter:"blur(18px)",
      }} />
      <span className="font-amiri font-bold relative select-none"
        style={{
          fontSize:"3.4rem", color:"#D4AF37", lineHeight:1, letterSpacing:"0.03em",
          textShadow:"0 0 18px rgba(212,175,55,0.70), 0 0 50px rgba(212,175,55,0.28)",
        }}>
        الله
      </span>
    </motion.div>
  );
}



const ZERO_MV = { x: { get: () => 0, set: () => {}, on: () => () => {} }, y: { get: () => 0, set: () => {}, on: () => () => {} } };

// Card data
const NAV_CARDS = [
  { path: "/abjad",            arabic: "أبجد",         label: "ABJAD",            subtitle: "Numerical Calculator",      accent: [212, 175, 55] },
  { path: "/anasir",           arabic: "عناصر",        label: "ANASIR",           subtitle: "Elemental Analysis",        accent: [56, 189, 248] },
  { path: "/hadim",            arabic: "خادم",         label: "HADIM",            subtitle: "Name Generator",            accent: [192, 132, 252] },
  { path: "/mizaan9",          arabic: "ميزان",        label: "MIZAAN 9",         subtitle: "Sacred Numerology",         accent: [212, 175, 55] },
  { path: "/magic-sqayer",     arabic: "السحر المربع", label: "MAGIC SQAYER",     subtitle: "Sacred Vefk Construction",  accent: [212, 175, 55] },
  { path: "/vefkin-yapilisi",  arabic: "طريقة الوفق",  label: "VEFK METHOD",  subtitle: "Ottoman Manuscript Method", accent: [212, 175, 55] },
  { path: "/basthul-huroof-2", arabic: "بسط الحروف",   label: "BASTHUL HUROOF 2", subtitle: "Numerical Letter Table",       accent: [180, 140, 255] },
  { path: "/faal-hasrath",     arabic: "فأل",          label: "FAAL",             subtitle: "Sacred Omen System",        accent: [212, 175, 55] },
  { path: "/plants",           arabic: "نباتات",       label: "PLANTS",           subtitle: "Medicinal Dictionary",      accent: [34, 197, 94] },
];

// ── Main ──────────────────────────────────────────────────────────
export default function HeroSection({ mouse }) {
  const { startNav, isNavigating } = useNavigation();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const safeMouse = mouse ?? ZERO_MV;
  const [deviceType, setDeviceType] = useState('desktop');
  const initialDeviceType = useRef(null);
  
  // Set device type once on mount - NO updates on keyboard/viewport changes
  useEffect(() => {
    if (initialDeviceType.current) return; // Already set
    
    const checkDevice = () => {
      const w = window.innerWidth;
      if (w < 768) return 'mobile';
      else if (w < 1366) return 'tablet';
      else return 'desktop';
    };
    
    initialDeviceType.current = checkDevice();
    setDeviceType(initialDeviceType.current);
    
    // ONLY listen for orientation change, NOT resize (keyboard opens trigger resize)
    const handleOrientation = () => {
      const newType = checkDevice();
      if (newType !== initialDeviceType.current) {
        initialDeviceType.current = newType;
        setDeviceType(newType);
      }
    };
    
    window.addEventListener('orientationchange', handleOrientation, { passive: true });
    return () => window.removeEventListener('orientationchange', handleOrientation);
  }, []);
  
  // Shared wheel size calculation — used by both HeroSection and SacredWheel
  // Calculate once on mount - NO updates on keyboard/viewport changes
  const getWheelSize = () => {
    if (typeof window === "undefined") return 400;
    const w = window.innerWidth;
    const h = window.screen.height; // Use screen.height (stable) NOT innerHeight (changes with keyboard)
    if (w < 768) return Math.min(h * 0.70, 500, w * 0.85);
    if (w < 1366) return Math.min(h * 0.50, 400, w * 0.55);
    return Math.min(h * 0.70, 500, w * 0.85);
  };
  
  const [wheelSize, setWheelSize] = useState(getWheelSize());
  const wheelSizeInitialized = useRef(false);
  
  // ONLY update wheel size on orientation change, NOT resize (keyboard opens trigger resize)
  useEffect(() => {
    if (wheelSizeInitialized.current) return; // Already set
    wheelSizeInitialized.current = true;
    setWheelSize(getWheelSize());
    
    const handleOrientation = () => {
      setWheelSize(getWheelSize());
    };
    
    window.addEventListener('orientationchange', handleOrientation, { passive: true });
    return () => window.removeEventListener('orientationchange', handleOrientation);
  }, []);

  return (
    <div className="font-inter relative flex flex-col items-center w-full pb-4 sm:pb-6 md:pb-8 pt-3 sm:pt-4 md:pt-6" style={{
      minHeight: "auto",
      height: "auto",
      overflowY: "visible",
      width: "100%",
      maxWidth: "100%",
      margin: 0,
      paddingLeft: 0,
      paddingRight: 0,
    }}>

      {/* Light rays — desktop only */}
      {deviceType === 'desktop' && <LightRays paused={isNavigating} />}

      {/* Wheel container — SacredWheel receives containerSize for synchronized rendering */}
      {deviceType === 'mobile' ? (
        <div className="relative flex items-center justify-center" style={{ width:wheelSize, height:wheelSize, zIndex:2 }}>
          <OrbitalRings paused={isNavigating} isMobile={true} />
          <SacredWheel mouse={safeMouse} containerSize={wheelSize} deviceType={deviceType} />
          <AllahCalligraphyMobile />
        </div>
      ) : (
        <motion.div animate={{ y: deviceType === 'tablet' ? [0,-4,0] : [0,-8,0] }} transition={{ duration: deviceType === 'tablet' ? 6 : 7.5, repeat:Infinity, ease:"easeInOut" }}
          className="relative flex items-center justify-center"
          style={{ width:wheelSize, height:wheelSize, zIndex:2 }}>
          <OrbitalRings paused={isNavigating} isMobile={deviceType === 'tablet'} />
          <SacredWheel mouse={safeMouse} containerSize={wheelSize} deviceType={deviceType} />
          {deviceType === 'tablet' ? <AllahCalligraphyMobile /> : <AllahCalligraphyDesktop paused={isNavigating} />}
        </motion.div>
      )}

      {/* Title — three independent layouts */}
      {deviceType === 'mobile' ? <HeroTitleMobile /> : deviceType === 'tablet' ? <HeroTitleTablet paused={isNavigating} /> : <HeroTitleDesktop paused={isNavigating} />}

      <GoldDivider delay={deviceType === 'tablet' ? 1.2 : 1.55} />
      <ManuscriptIntro />
    </div>
  );
}

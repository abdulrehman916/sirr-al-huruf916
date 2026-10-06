import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { persistGet, persistSet, sessionGet, sessionSet, isDevMode } from "@/lib/devModePersistence";

export default function SplashScreen({ onComplete }) {
  React.useEffect(() => {
    const hasSeenSplash = isDevMode
      ? persistGet('hasSeenSplash')
      : sessionGet('hasSeenSplash');
    if (hasSeenSplash) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      if (isDevMode) {
        persistSet('hasSeenSplash', 'true');
      } else {
        sessionSet('hasSeenSplash', 'true');
      }
      onComplete();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #020710 0%, #050d1a 50%, #08101f 100%)",
      }}
    >
      <div className="text-center">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center text-5xl"
          style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.10))",
            border: "2px solid rgba(212,175,55,0.40)",
            boxShadow: "0 0 60px rgba(212,175,55,0.20), inset 0 0 40px rgba(212,175,55,0.10)",
          }}
        >
          ✦
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-amiri text-4xl font-bold text-white mb-2"
        >
          Sirr al-Huruf
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-inter text-sm text-white/50 tracking-wide"
        >
          Secrets of Letters
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400/60" />
          <div className="w-2 h-2 rounded-full bg-amber-400/40" />
          <div className="w-2 h-2 rounded-full bg-amber-400/20" />
        </motion.div>
      </div>
    </motion.div>
  );
}
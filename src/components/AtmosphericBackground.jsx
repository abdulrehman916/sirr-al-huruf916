import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AtmosphericBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at top, rgba(59,130,246,0.08) 0%, transparent 70%)",
      }} />
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(212,175,55,${Math.random() * 0.3 + 0.1})`,
            boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(212,175,55,0.3)`,
          }}
          animate={{
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
import { motion } from "framer-motion";

/**
 * Premium manuscript-inspired card with glassmorphism, floating light, and entrance animation.
 *
 * Props:
 *   children   — card content
 *   delay      — entrance animation delay (default 0)
 *   glow       — boolean, stronger ambient gold glow (default false)
 *   accent     — optional CSS color string to tint border/glow
 *   className  — extra class names
 *   style      — extra inline styles
 *   noPad      — skip default padding (default false)
 */
export default function SectionCard({
  children,
  delay = 0,
  glow = false,
  accent,
  className = "",
  style = {},
  noPad = false,
}) {
  const borderColor = accent ? accent.replace("1)", "0.26)") : "rgba(212,175,55,0.20)";
  const glowColor   = accent ? accent.replace("1)", "0.10)") : "rgba(212,175,55,0.09)";
  const sheen       = accent ? accent.replace("1)", "0.38)") : "rgba(212,175,55,0.38)";
  const lightColor  = accent ? accent.replace("1)", "0.08)") : "rgba(212,175,55,0.07)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.40, delay, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl ${noPad ? "" : "p-4"} ${className}`}
      style={{
        background: "linear-gradient(145deg, rgba(8,18,44,0.90) 0%, rgba(3,8,24,0.96) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${borderColor}`,
        boxShadow: glow
          ? `0 8px 48px rgba(0,0,0,0.62), 0 0 32px ${glowColor}, inset 0 1px 0 rgba(212,175,55,0.12)`
          : `0 4px 32px rgba(0,0,0,0.58), 0 0 16px ${glowColor}, inset 0 1px 0 rgba(212,175,55,0.09)`,
        ...style,
      }}
    >
      {/* Top sheen */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{
        height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${sheen} 50%, transparent 100%)`,
        zIndex: 1,
      }} />

      {/* Floating corner light — top right */}
      <div className="absolute pointer-events-none" style={{
        top: -28, right: -28, width: 110, height: 110, borderRadius: "50%",
        background: `radial-gradient(circle, ${lightColor} 0%, transparent 70%)`,
        filter: "blur(18px)", zIndex: 0,
      }} />

      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </motion.div>
  );
}
import { motion } from "framer-motion";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
};

/**
 * Reusable labeled info section for the Product Detail page.
 * Renders an icon + title header with a content card.
 * malayalam=true applies Malayalam typography styling.
 */
export default function ProductInfoSection({ icon: Icon, title, content, malayalam = false, warning = false }) {
  if (!content || !String(content).trim()) return null;

  const accentColor = warning ? "#F87171" : G.text;
  const iconColor = warning ? "rgba(248,113,113,0.70)" : G.text;
  const borderColor = warning ? "rgba(248,113,113,0.18)" : G.faint;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" style={{ color: iconColor }} />}
        <h2 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
          {title}
        </h2>
      </div>
      <div
        className="rounded-xl p-4"
        style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${borderColor}` }}
      >
        <p
          className={`text-sm leading-relaxed whitespace-pre-wrap ${malayalam ? "font-malayalam" : "font-inter"}`}
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          {content}
        </p>
      </div>
    </motion.div>
  );
}
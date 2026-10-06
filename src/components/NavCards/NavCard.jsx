import { Link } from "react-router-dom";
import { useNavigation } from "../../context/NavigationContext";
import { motion } from "framer-motion";

export default function NavCard({ card }) {
  const { startNav } = useNavigation();
  const [r, g, b] = card.accent;

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.04, y: -6, transition: { duration: 0.22, ease: "easeOut" } }}
      whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
    >
      <Link to={card.path} onClick={startNav}
        className="block rounded-2xl border flex flex-col items-center justify-center text-center p-4"
        style={{
          background: `linear-gradient(155deg,rgba(${r},${g},${b},0.13) 0%,rgba(8,16,42,0.92) 55%,rgba(${r},${g},${b},0.05) 100%)`,
          borderColor: `rgba(${r},${g},${b},0.32)`,
          boxShadow: `0 0 28px rgba(${r},${g},${b},0.14),0 6px 24px rgba(0,0,0,0.55),inset 0 1px 0 rgba(${r},${g},${b},0.18)`,
          minHeight: 140,
        }}>
        <p className="font-amiri font-bold" style={{ fontSize: "1.4rem", color: "#f5ead4" }}>{card.arabic}</p>
        <p className="font-inter font-bold tracking-[0.22em] uppercase" 
           style={{ fontSize: "7px", color: `rgba(${r},${g},${b},0.88)`, marginTop: 4 }}>
          {card.label}
        </p>
        <div style={{ 
          width: 28, 
          height: 0.5, 
          background: `linear-gradient(90deg,transparent,rgba(${r},${g},${b},0.55),transparent)`, 
          margin: "10px 0" 
        }} />
        <p className="font-inter" style={{ fontSize: "9px", color: "rgba(255,255,255,0.32)" }}>
          {card.subtitle}
        </p>
      </Link>
    </motion.div>
  );
}
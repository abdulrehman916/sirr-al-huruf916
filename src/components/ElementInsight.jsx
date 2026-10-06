import React from "react";
import { motion } from "framer-motion";
import { ELEMENTS } from "../lib/anasirValues";

export default function ElementInsight({ dominant }) {
  if (!dominant) return null;

  const element = ELEMENTS[dominant];

  const insights = {
    fire: {
      traits: "Passionate, energetic, transformative",
      spiritual: "Associated with willpower, courage, and divine fire",
      timing: "Best for works requiring strength and determination"
    },
    air: {
      traits: "Intellectual, communicative, expansive",
      spiritual: "Connected to knowledge, wisdom, and spiritual breath",
      timing: "Favorable for learning, teaching, and communication"
    },
    water: {
      traits: "Emotional, intuitive, receptive",
      spiritual: "Linked to purification, dreams, and spiritual cleansing",
      timing: "Ideal for emotional healing and spiritual purification"
    },
    earth: {
      traits: "Stable, grounding, manifesting",
      spiritual: "Represents manifestation, stability, and material success",
      timing: "Best for grounding work and material manifestations"
    }
  };

  const insight = insights[dominant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border p-5 backdrop-blur-sm"
      style={{
        background: element.bg,
        borderColor: element.border,
        boxShadow: `0 4px 24px ${element.glow}`
      }}
    >
      <h3 className="font-inter text-[10px] uppercase tracking-widest text-white/50 font-semibold mb-3">
        {element.icon} {element.name} Dominance
      </h3>

      <div className="space-y-3">
        <div>
          <p className="font-inter text-[9px] uppercase tracking-widest text-white/40 mb-1">Characteristics</p>
          <p className="font-inter text-sm text-white/80">{insight.traits}</p>
        </div>

        <div>
          <p className="font-inter text-[9px] uppercase tracking-widest text-white/40 mb-1">Spiritual Meaning</p>
          <p className="font-inter text-sm text-white/80">{insight.spiritual}</p>
        </div>

        <div>
          <p className="font-inter text-[9px] uppercase tracking-widest text-white/40 mb-1">Optimal Timing</p>
          <p className="font-inter text-sm text-white/80">{insight.timing}</p>
        </div>
      </div>
    </motion.div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { ELEMENTS } from "../lib/anasirValues";

export default function ElementInsight({ dominant }) {
  if (!dominant) return null;

  const element = ELEMENTS[dominant];

  const insights = {
    fire: {
      traits: "ആവേശം, ഊർജസ്വലത, മാറ്റം",
      spiritual: "ഇച്ഛാശക്തി, ധൈര്യം, ദൈവിക അഗ്നി എന്നിവയുമായി ബന്ധപ്പെടുത്തുന്നു",
      timing: "ശക്തിയും നിശ്ചയദാർഢ്യവും ആവശ്യമായ പ്രവർത്തനങ്ങൾക്ക് അനുയോജ്യം"
    },
    air: {
      traits: "ചിന്താശക്തി, ആശയവിനിമയം, വികാസം",
      spiritual: "അറിവ്, ജ്ഞാനം, ആത്മീയ ശ്വാസം എന്നിവയുമായി ബന്ധപ്പെടുത്തുന്നു",
      timing: "പഠനം, അധ്യാപനം, ആശയവിനിമയം എന്നിവയ്ക്ക് അനുയോജ്യം"
    },
    water: {
      traits: "വികാരങ്ങൾ, ഉൾക്കാഴ്ച, സ്വീകരണശേഷി",
      spiritual: "ശുദ്ധീകരണം, സ്വപ്നങ്ങൾ, ആത്മീയ ശുദ്ധി എന്നിവയുമായി ബന്ധപ്പെടുത്തുന്നു",
      timing: "വൈകാരിക ആശ്വാസത്തിനും ആത്മീയ ശുദ്ധീകരണത്തിനും അനുയോജ്യം"
    },
    earth: {
      traits: "സ്ഥിരത, ഉറച്ച നിലപാട്, സാക്ഷാത്കാരം",
      spiritual: "സാക്ഷാത്കാരം, സ്ഥിരത, ഭൗതിക വിജയം എന്നിവയെ പ്രതിനിധീകരിക്കുന്നു",
      timing: "സ്ഥിരതയും ഭൗതിക ലക്ഷ്യങ്ങളും ആവശ്യമായ പ്രവർത്തനങ്ങൾക്ക് അനുയോജ്യം"
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
      <h3 className="font-inter text-[10px] uppercase tracking-normal text-white/50 font-semibold mb-3">
        {element.icon} {{ fire: 'തീ', air: 'കാറ്റ്', water: 'വെള്ളം', earth: 'മണ്ണ്' }[dominant]} — മുൻതൂക്കം
      </h3>

      <div className="space-y-3">
        <div>
          <p className="font-inter text-[9px] uppercase tracking-normal text-white/40 mb-1">സവിശേഷതകൾ</p>
          <p className="font-inter text-sm text-white/80">{insight.traits}</p>
        </div>

        <div>
          <p className="font-inter text-[9px] uppercase tracking-normal text-white/40 mb-1">ആത്മീയ അർത്ഥം</p>
          <p className="font-inter text-sm text-white/80">{insight.spiritual}</p>
        </div>

        <div>
          <p className="font-inter text-[9px] uppercase tracking-normal text-white/40 mb-1">അനുയോജ്യമായ പ്രവർത്തനങ്ങൾ</p>
          <p className="font-inter text-sm text-white/80">{insight.timing}</p>
        </div>
      </div>
    </motion.div>
  );
}
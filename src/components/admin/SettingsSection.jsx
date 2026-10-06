/**
 * SettingsSection — Collapsible section wrapper for settings groups.
 * Each section has a title, icon, description, and children (form fields).
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Lock } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

export default function SettingsSection({ title, icon: Icon, description, children, canEdit, defaultOpen = false, onSave, hasChanges, saving }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: G.bg, borderColor: G.border }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left transition-all hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.25)" }}
          >
            <Icon className="w-4 h-4" style={{ color: G.text }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-inter font-bold text-white text-sm">{title}</h3>
              {!canEdit && (
                <span className="flex items-center gap-1 text-[9px] text-white/30">
                  <Lock className="w-2.5 h-2.5" />
                  Read Only
                </span>
              )}
            </div>
            {description && (
              <p className="text-[10px] text-white/40 truncate">{description}</p>
            )}
          </div>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />}
      </button>

      {/* Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-3">
              {children}

              {/* Save button (only if can edit) */}
              {canEdit && onSave && (
                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button
                    onClick={onSave}
                    disabled={!hasChanges || saving}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: hasChanges && !saving ? "linear-gradient(135deg, #f6d860 0%, #e0a820 50%, #c98a14 100%)" : "rgba(255,255,255,0.05)",
                      color: hasChanges && !saving ? "#0d1b2a" : "rgba(255,255,255,0.30)",
                      border: hasChanges ? "none" : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
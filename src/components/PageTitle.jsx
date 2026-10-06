import React from "react";
import { motion } from "framer-motion";

export default function PageTitle({ arabic, latin, subtitle, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-5"
    >
      {/* Icon */}
      {icon && (
        <div className="flex items-center justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.20), rgba(212,175,55,0.05))",
              border: "1px solid rgba(212,175,55,0.30)",
              boxShadow: "0 4px 16px rgba(212,175,55,0.15)"
            }}>
            {icon}
          </div>
        </div>
      )}

      {/* Titles */}
      <div className="text-center space-y-1.5">
        <h1 className="font-amiri text-3xl font-bold text-white">
          {arabic}
        </h1>
        {latin && (
          <p className="font-inter text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold">
            {latin}
          </p>
        )}
      </div>

      {/* Subtitle with decorative divider */}
      {subtitle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex items-center justify-center gap-3"
        >
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/20" />
          <p className="font-inter text-[10px] text-white/50 tracking-wide">
            {subtitle}
          </p>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/20" />
        </motion.div>
      )}
    </motion.div>
  );
}
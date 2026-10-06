import React from "react";
import AtmosphericBackground from "@/components/AtmosphericBackground";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-[100dvh] px-5 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #020710 0%, #050d1a 45%, #08101f 100%)" }}
    >
      <AtmosphericBackground />
      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(145deg, rgba(212,175,55,0.22), rgba(212,175,55,0.06))",
              border: "1px solid rgba(212,175,55,0.25)",
            }}
          >
            <Icon className="w-7 h-7" style={{ color: "#D4AF37" }} />
          </div>
          <h1 className="font-amiri font-bold text-2xl mb-1" style={{ color: "#f5ead4" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
            border: "1px solid rgba(212,175,55,0.22)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.08)",
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.35)" }}>
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
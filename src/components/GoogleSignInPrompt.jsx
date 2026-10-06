import { useState } from "react";
import { motion } from "framer-motion";
import { platform } from "@/api/platformClient";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { persistSet, persistRemove } from "@/lib/devModePersistence";

const GoogleMark = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.6 4.5 24 4.5 16 4.5 9.1 9.1 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 43.5c5.5 0 10.5-2 14.3-5.3l-6.6-5.5C29.6 34.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9 38.9 16 43.5 24 43.5z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.6 5.5c-.5.4 6.6-4.8 6.6-14.5 0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);

/**
 * Post-splash Google Sign-In prompt.
 * Shown once after the splash screen / Home page. If the user skips it,
 * they continue as a Guest. Google Sign-In is for IDENTITY only and never
 * bypasses access codes — protected pages stay locked until a code is entered.
 */
export default function GoogleSignInPrompt({ onSkip }) {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    // Mark this session as an explicit sign-in so AuthContext allows role
    // elevation (Owner/Admin) after Google redirects back.
    // persistSet: localStorage (production) or localStorage+cookie (dev preview).
    try { persistSet("sirr_admin_session", "true"); } catch { /* ignore */ }
    try {
      await platform.auth.loginWithProvider("google", window.location.pathname || "/");
    } catch {
      setLoading(false);
      try { persistRemove("sirr_admin_session"); } catch { /* ignore */ }
    }
  };

  const handleSkip = () => {
    persistSet("sirr_google_prompt_dismissed", "true");
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.78)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-sm rounded-2xl p-6 space-y-5 text-center"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: "1px solid rgba(212,175,55,0.45)" }}
      >
        <button onClick={handleSkip}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.40)" }}>
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)" }}>
          <ShieldCheck className="w-7 h-7" style={{ color: "#D4AF37" }} />
        </div>

        <div>
          <h2 className="font-inter font-bold text-white text-lg">Sign in with Google</h2>
          <p className="font-inter text-xs text-white/45 mt-1 leading-relaxed">
            Sign in to sync your account. Protected pages still require an access code; Google Sign-In does not unlock paid content.
          </p>
        </div>

        <button onClick={handleGoogle} disabled={loading}
          className="w-full py-3.5 rounded-xl font-inter font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: "#ffffff", color: "#0d1b2a" }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleMark className="w-5 h-5" />}
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        <button onClick={handleSkip}
          className="w-full py-2.5 rounded-xl font-inter font-semibold text-xs"
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)" }}>
          Skip — Continue as Guest
        </button>
      </motion.div>
    </div>
  );
}
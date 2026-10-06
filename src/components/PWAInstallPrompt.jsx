import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Subtle, premium PWA install prompt.
 * Appears after 8 s if the beforeinstallprompt event fires and user hasn't dismissed.
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed in this session
    if (sessionStorage.getItem("pwa-dismissed")) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after a short delay so it doesn't interrupt the splash
      setTimeout(() => setVisible(true), 8000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-dismissed", "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pwa-prompt"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-1/2 z-[9998] w-[calc(100%-2.5rem)] max-w-sm"
          style={{
            transform: "translateX(-50%)",
            bottom: "calc(env(safe-area-inset-bottom) + 80px)", // above bottom tab bar
          }}
        >
          <div className="relative rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(8,18,44,0.97) 0%, rgba(3,8,24,0.99) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(212,175,55,0.28)",
              boxShadow: "0 8px 48px rgba(0,0,0,0.70), 0 0 28px rgba(212,175,55,0.10), inset 0 1px 0 rgba(212,175,55,0.18)",
            }}>
            {/* Top sheen */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg,transparent 5%,rgba(212,175,55,0.55) 50%,transparent 95%)",
            }} />

            <div className="flex items-center gap-3.5 px-4 py-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden border"
                style={{ borderColor: "rgba(212,175,55,0.28)" }}>
                <img
                  src="https://media.base44.com/images/public/69f3dea51ce92ee2fde20be6/9627dbf20_generated_image.png"
                  alt="Sirr al-Huruf"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-amiri font-bold leading-tight"
                  style={{ fontSize: "1rem", color: "#f5ead4" }}>
                  سرّ الحروف
                </p>
                <p className="font-inter text-[9px] tracking-[0.18em] uppercase mt-0.5"
                  style={{ color: "rgba(212,175,55,0.65)" }}>
                  Install App
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleDismiss}
                  className="font-inter text-[10px] uppercase tracking-widest px-2.5 py-1.5 rounded-lg"
                  style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)" }}
                >
                  Later
                </button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleInstall}
                  className="font-inter font-bold text-[10px] uppercase tracking-widest px-3.5 py-1.5 rounded-lg"
                  style={{
                    background: "linear-gradient(135deg,#f6d860 0%,#c9901d 100%)",
                    color: "#0d1b2a",
                    boxShadow: "0 0 16px rgba(212,175,55,0.40)",
                  }}
                >
                  Install
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
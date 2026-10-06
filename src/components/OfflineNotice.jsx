import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineNotice() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline  = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online",  goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          key="offline-bar"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            zIndex: 9999,
            background: "linear-gradient(90deg, rgba(180,120,0,0.96) 0%, rgba(140,80,0,0.97) 100%)",
            borderBottom: "1px solid rgba(212,175,55,0.40)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.60)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingTop: "calc(env(safe-area-inset-top) + 8px)",
            paddingBottom: "8px",
            paddingLeft: "calc(env(safe-area-inset-left) + 16px)",
            paddingRight: "calc(env(safe-area-inset-right) + 16px)",
          }}
        >
          <span style={{ fontSize: 14, color: "#fff3c4", fontFamily: "Amiri, serif" }}>
            ☽ غير متصل —
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,243,196,0.80)", fontFamily: "Inter, sans-serif", letterSpacing: "0.05em" }}>
            OFFLINE MODE
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
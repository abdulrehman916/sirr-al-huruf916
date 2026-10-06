import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound } from "lucide-react";
import RedeemCodeModal from "./RedeemCodeModal";

export default function RedeemCodeButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg"
        style={{
          background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)",
          boxShadow: "0 4px 24px rgba(212,175,55,0.35), 0 0 48px rgba(212,175,55,0.15)",
        }}
      >
        <KeyRound className="w-5 h-5" style={{ color: "#0d1b2a" }} />
        <span className="font-inter font-bold text-sm" style={{ color: "#0d1b2a" }}>
          Redeem Code
        </span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && <RedeemCodeModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}
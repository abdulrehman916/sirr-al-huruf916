import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, MessageCircle, Send, Link2, Check } from "lucide-react";
import { trackShareClick } from "@/lib/shopAnalytics";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
  border: "rgba(212,175,55,0.30)",
  bg: "rgba(212,175,55,0.06)",
};

/**
 * Premium share dropdown — WhatsApp, Telegram, native share, copy link.
 * Self-contained, no backend dependency.
 */
export default function ShareMenu({ product }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/shop/${product.slug || product.id}`;
  const text = product.short_description || product.name;

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const shareLinks = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      color: "#25D366",
      onClick: () => window.open(
        `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
        "_blank", "noopener,noreferrer"
      ),
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: Send,
      color: "#229ED9",
      onClick: () => window.open(
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        "_blank", "noopener,noreferrer"
      ),
    },
    {
      key: "native",
      label: "More...",
      icon: Share2,
      color: G.text,
      onClick: () => {
        if (navigator.share) {
          navigator.share({ title: product.name, text, url }).catch(() => {});
        } else {
          copyLink();
        }
        setOpen(false);
      },
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-2 rounded-lg"
        style={{ background: G.bg, border: `1px solid ${G.faint}` }}
      >
        <Share2 className="w-3.5 h-3.5" style={{ color: G.dim }} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl overflow-hidden"
              style={{
                background: "rgba(5,10,28,0.98)",
                border: `1px solid ${G.border}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.60)",
                backdropFilter: "blur(12px)",
              }}
              onClick={e => e.stopPropagation()}
            >
              {shareLinks.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => { trackShareClick(product.id, product.name); item.onClick(); if (item.key !== "native") setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: item.color }} />
                    <span
                      className="font-inter text-[11px] font-medium"
                      style={{ color: "rgba(255,255,255,0.80)" }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
              <div className="border-t" style={{ borderColor: G.faint }}>
                <button
                  onClick={() => { trackShareClick(product.id, product.name); copyLink(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#86EFAC" }} />
                  ) : (
                    <Link2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.dim }} />
                  )}
                  <span
                    className="font-inter text-[11px] font-medium"
                    style={{ color: "rgba(255,255,255,0.80)" }}
                  >
                    {copied ? "Copied!" : "Copy Link"}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}